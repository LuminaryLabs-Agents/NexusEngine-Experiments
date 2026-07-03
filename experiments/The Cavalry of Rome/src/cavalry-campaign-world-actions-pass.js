const WORLD_ACTION_STYLE = "cavalry-campaign-world-actions-028";
const count = (t = {}) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const power = (t = {}) => (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3;
const label = (t = {}) => `${t.l || 0}/${t.m || 0}/${t.h || 0}`;
const add = (a, b) => { a.l = (a.l || 0) + (b.l || 0); a.m = (a.m || 0) + (b.m || 0); a.h = (a.h || 0) + (b.h || 0); };
const sub = (a, b) => { a.l = Math.max(0, (a.l || 0) - (b.l || 0)); a.m = Math.max(0, (a.m || 0) - (b.m || 0)); a.h = Math.max(0, (a.h || 0) - (b.h || 0)); };
let root;
let lastState = null;
function campaign() { return globalThis.CavalryCampaignMap?.getState?.() || null; }
function cells(owner) { return campaign()?.cells?.filter((cell) => cell.owner === owner) || []; }
function byId(id) { return campaign()?.cells?.find((cell) => cell.id === id) || null; }
function troopForBiome(biome) { return biome === 4 || biome === 7 ? "h" : biome === 1 || biome === 2 || biome === 3 || biome === 8 ? "l" : "m"; }
function log(text) { const s = campaign(); if (!s) return; s.log = s.log || []; s.log.unshift(text); s.log = s.log.slice(0, 7); }
function resetInputs() {
  const s = campaign();
  globalThis.CavalryCircleDrag?.resetDrag?.();
  globalThis.CavalryDragMovement?.resetDrag?.();
  if (!s) return;
  s.from = null;
  s.to = null;
  s.draft = { l: 0, m: 0, h: 0 };
}
function spawnFor(owner) {
  const s = campaign();
  if (!s) return;
  for (const cell of cells(owner)) cell.troops[troopForBiome(cell.biome)] += 1;
}
function applyLoss(troops, lossPower) {
  const next = { ...troops };
  let loss = Math.max(0, Math.ceil(lossPower));
  while (loss > 0 && next.l > 0) { next.l -= 1; loss -= 1; }
  while (loss > 0 && next.m > 0) { next.m -= 1; loss -= 2; }
  while (loss > 0 && next.h > 0) { next.h -= 1; loss -= 3; }
  return next;
}
function aiDraft(source) {
  const type = source.troops.h > 0 ? "h" : source.troops.m > 0 ? "m" : "l";
  return { l: type === "l" ? Math.max(1, Math.floor(source.troops.l * 0.5)) : 0, m: type === "m" ? Math.max(1, Math.floor(source.troops.m * 0.5)) : 0, h: type === "h" ? Math.max(1, Math.floor(source.troops.h * 0.5)) : 0 };
}
function resolveAiMove(owner, source, target) {
  const draft = aiDraft(source);
  if (!source || !target || count(draft) <= 0) return;
  sub(source.troops, draft);
  if (!target.owner || target.owner === owner) {
    target.owner = owner;
    add(target.troops, draft);
    return;
  }
  const attack = power(draft);
  const defend = power(target.troops);
  if (attack > defend) {
    target.owner = owner;
    target.troops = applyLoss(draft, defend * 0.55);
    if (count(target.troops) <= 0) target.troops = { l: 1, m: 0, h: 0 };
  } else {
    target.troops = applyLoss(target.troops, attack * 0.70);
  }
}
function aiStep() {
  const s = campaign();
  if (!s) return;
  for (let i = 1; i <= (s.preset?.rivals || 0); i += 1) {
    const owner = `ai${i}`;
    const source = cells(owner)
      .filter((cell) => count(cell.troops) > 2 && cell.neighbors.some((id) => byId(id)?.owner !== owner))
      .sort((a, b) => power(b.troops) - power(a.troops))[0];
    if (!source) continue;
    const target = source.neighbors
      .map(byId)
      .filter((cell) => cell && cell.owner !== owner)
      .sort((a, b) => (a.owner ? 1 : 0) - (b.owner ? 1 : 0) || power(a.troops) - power(b.troops))[0];
    if (target) resolveAiMove(owner, source, target);
  }
}
function endWorldTurn() {
  const s = campaign();
  if (!s || s.over) return;
  resetInputs();
  spawnFor("player");
  for (let i = 1; i <= (s.preset?.rivals || 0); i += 1) spawnFor(`ai${i}`);
  aiStep();
  s.turn = (s.turn || 1) + 1;
  s.actions = 1;
  s.from = null;
  s.to = null;
  s.draft = { l: 0, m: 0, h: 0 };
  log(`World turn ${s.turn}: reinforcements arrived. Rome has one world action.`);
}
function concede() {
  const s = campaign();
  if (!s || s.over) return;
  if (cells("player").length > 3) {
    log("Concede blocked: Rome controls more than three territories.");
    return;
  }
  s.over = "conceded";
  log("Rome conceded the campaign.");
}
function restart() {
  const s = campaign();
  const size = s?.sizeId || "small";
  resetInputs();
  globalThis.CavalryCampaignMap?.start?.(size);
}
function enforceActionBudget() {
  const s = campaign();
  if (!s) return;
  if (s !== lastState) {
    lastState = s;
    s.actions = Math.min(1, s.actions ?? 1);
    if (s.preset) s.preset.actions = 1;
  }
  if (s.preset) s.preset.actions = 1;
  if ((s.actions ?? 1) > 1) s.actions = 1;
}
function render() {
  install();
  const s = campaign();
  if (!s?.cells?.length) {
    root.dataset.on = "false";
    return;
  }
  enforceActionBudget();
  root.dataset.on = "true";
  const player = cells("player");
  const totals = player.reduce((acc, cell) => { add(acc, cell.troops); return acc; }, { l: 0, m: 0, h: 0 });
  const actionText = s.actions > 0 ? "Action Ready" : "Action Spent";
  root.querySelector("#world-action-status").textContent = `${actionText} · Turn ${s.turn || 1} · Rome ${player.length}/${s.cells.length} territories · L/M/H ${label(totals)}`;
  root.querySelector("[data-world-action='end']").disabled = Boolean(s.over);
  root.querySelector("[data-world-action='reset']").disabled = false;
  root.querySelector("[data-world-action='restart']").disabled = false;
  root.querySelector("[data-world-action='concede']").disabled = Boolean(s.over) || player.length > 3;
}
function perform(action) {
  if (action === "end") endWorldTurn();
  if (action === "reset") resetInputs();
  if (action === "restart") restart();
  if (action === "concede") concede();
}
function onButtonEvent(event) {
  const button = event.target.closest?.("[data-world-action]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.type === "pointerdown") button.dataset.pressed = "true";
  if (event.type === "pointerup" || event.type === "click") {
    if (!button.disabled) perform(button.dataset.worldAction);
    button.dataset.pressed = "false";
  }
}
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    .circle-end,.drag-end-turn,#cavalry-campaign-3d .cc-actions{display:none!important;opacity:0!important;pointer-events:none!important}
    .world-actions-root{position:fixed;right:14px;bottom:14px;z-index:220;display:none;pointer-events:auto;color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000}
    .world-actions-root[data-on=true]{display:block}
    .world-actions-panel{width:min(430px,calc(100vw - 28px));border:1px solid rgba(255,222,150,.34);border-radius:18px;background:linear-gradient(145deg,rgba(24,16,9,.95),rgba(7,7,5,.90));box-shadow:0 22px 72px rgba(0,0,0,.62);backdrop-filter:blur(16px);padding:12px}
    .world-actions-title{font-weight:950;text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:#ffe19a}
    #world-action-status{font-size:12px;color:#ffecc8bf;font-weight:760;margin-top:5px;line-height:1.35}
    .world-actions-buttons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
    .world-action-button{pointer-events:auto;border:1px solid rgba(255,222,150,.28);border-radius:13px;background:rgba(255,236,170,.10);color:#fff6e3;padding:11px 10px;font:950 12px Inter,system-ui;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;touch-action:manipulation;user-select:none}
    .world-action-button:hover,.world-action-button[data-pressed=true]{border-color:#ffe19a;background:rgba(255,236,170,.16)}
    .world-action-button:disabled{opacity:.38;filter:grayscale(.6);cursor:not-allowed}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.className = "world-actions-root";
  root.innerHTML = `<div class="world-actions-panel"><div class="world-actions-title">World Actions</div><div id="world-action-status">Loading campaign…</div><div class="world-actions-buttons"><button class="world-action-button" data-world-action="end">End World Turn</button><button class="world-action-button" data-world-action="reset">Reset Input</button><button class="world-action-button" data-world-action="restart">Restart Map</button><button class="world-action-button" data-world-action="concede">Concede</button></div></div>`;
  document.body.append(root);
  root.addEventListener("pointerdown", onButtonEvent, true);
  root.addEventListener("pointerup", onButtonEvent, true);
  root.addEventListener("click", onButtonEvent, true);
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "e") endWorldTurn();
    if (event.key === "Escape") resetInputs();
  });
}
function frame() {
  render();
  requestAnimationFrame(frame);
}
install();
globalThis.CavalryWorldActions = { style: WORLD_ACTION_STYLE, endWorldTurn, resetInputs, restart, concede };
requestAnimationFrame(frame);
