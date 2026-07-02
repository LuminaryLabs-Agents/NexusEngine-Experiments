const CAMPAIGN_STYLE = "cavalry-campaign-map-dynamic-shader-017";
const SIZE_PRESETS = Object.freeze({
  small: { label: "Small", cols: 6, rows: 4, territories: 24, rivals: 2, actions: 3 },
  medium: { label: "Medium", cols: 8, rows: 6, territories: 48, rivals: 3, actions: 4 },
  large: { label: "Large", cols: 12, rows: 8, territories: 96, rivals: 4, actions: 5 },
  alexandrian: { label: "Alexandrian", cols: 16, rows: 12, territories: 192, rivals: 5, actions: 6 }
});
const BIOMES = Object.freeze([
  { id: "boreal", name: "Boreal Forest", color: "#245332", detail: "#3e7047", spawn: "m" },
  { id: "steppe", name: "Wind Steppe", color: "#807139", detail: "#b29a4d", spawn: "l" },
  { id: "taiga", name: "Dark Taiga", color: "#173f34", detail: "#2c5c4a", spawn: "l" },
  { id: "wetland", name: "Wetland", color: "#1c6372", detail: "#348898", spawn: "l" },
  { id: "highland", name: "Highland", color: "#8a7d4d", detail: "#c4ae64", spawn: "h" },
  { id: "snow", name: "Northern Snow", color: "#c7d6ce", detail: "#f4f7ef", spawn: "m" },
  { id: "black-earth", name: "Black Earth", color: "#415b24", detail: "#6e7f33", spawn: "m" },
  { id: "karst", name: "Karst Ridge", color: "#817655", detail: "#b8aa79", spawn: "h" },
  { id: "river", name: "Riverland", color: "#1b5865", detail: "#57a7aa", spawn: "l" }
]);
const OWNER_COLORS = ["#f5f2e8", "#cf2e25", "#d6aa3c", "#7a54bd", "#21966e", "#d85f2d", "#4f80ff", "#c9d2d8"];
const SQRT3 = Math.sqrt(3);
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const hash = (x, y, s = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123; return v - Math.floor(v); };
const troopCount = (t) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const strength = (t) => (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3;
const add = (a, b) => { a.l = (a.l || 0) + (b.l || 0); a.m = (a.m || 0) + (b.m || 0); a.h = (a.h || 0) + (b.h || 0); };
const sub = (a, b) => { a.l = Math.max(0, (a.l || 0) - (b.l || 0)); a.m = Math.max(0, (a.m || 0) - (b.m || 0)); a.h = Math.max(0, (a.h || 0) - (b.h || 0)); };
let root, map, ctx, fx, fxCtx, chooser, hud, order, campaign, hoverId = null, patched = false;
function ownerColor(owner) { if (!owner) return OWNER_COLORS[0]; if (owner === "player") return OWNER_COLORS[1]; return OWNER_COLORS[1 + (Number(owner.replace("ai", "")) || 1)] || "#cccccc"; }
function pageActive() { const mode = globalThis.GameHost?.getSnapshot?.()?.mode; return mode !== "battlefield" && mode !== "dive"; }
function biomeFor(q, r, preset) {
  const nx = q / Math.max(1, preset.cols - 1), ny = r / Math.max(1, preset.rows - 1);
  const ridge = Math.sin(nx * 8.7 + ny * 3.1) + Math.cos(nx * 4.8 - ny * 7.4);
  const cold = 1 - ny + (hash(q, r, 17) - .5) * .35;
  const wet = hash(q, r, 41) - .5;
  const river = Math.abs(ny - (.28 + Math.sin(nx * 5.4) * .10));
  if (river < .055 && hash(q, r, 81) > .18) return 8;
  if (cold > .76) return 5;
  if (ridge > 1.15) return 4;
  if (ridge > .55) return 7;
  if (wet > .30) return 3;
  if (cold > .52) return 2;
  if (wet < -.28) return 1;
  if (wet > .08) return 0;
  return 6;
}
function buildCampaign(sizeId) {
  const preset = SIZE_PRESETS[sizeId] || SIZE_PRESETS.small;
  const cells = [];
  for (let r = 0; r < preset.rows; r++) for (let q = 0; q < preset.cols; q++) cells.push({ id: `t-${q}-${r}`, q, r, biome: biomeFor(q, r, preset), owner: null, t: { l: 0, m: 0, h: 0 }, n: [] });
  const by = new Map(cells.map((cell) => [cell.id, cell]));
  const even = [[1,0],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1]], odd = [[1,0],[1,1],[0,1],[-1,0],[0,-1],[1,-1]];
  for (const cell of cells) cell.n = (cell.r % 2 ? odd : even).map(([dq, dr]) => by.get(`t-${cell.q + dq}-${cell.r + dr}`)?.id).filter(Boolean);
  const starts = [`t-0-${preset.rows - 1}`, `t-1-${preset.rows - 1}`, `t-0-${Math.max(0, preset.rows - 2)}`].map((id) => by.get(id)).filter(Boolean);
  starts.forEach((cell, index) => { cell.owner = "player"; cell.t = index === 0 ? { l: 4, m: 2, h: 2 } : index === 1 ? { l: 3, m: 2, h: 2 } : { l: 3, m: 1, h: 1 }; });
  for (let i = 0; i < preset.rivals; i++) {
    const angle = i / preset.rivals * TAU;
    const q = Math.round((preset.cols - 1) * (.5 + Math.cos(angle) * .44));
    const r = Math.round((preset.rows - 1) * (.5 + Math.sin(angle) * .44));
    const seed = cells.slice().sort((a, b) => Math.hypot(a.q - q, a.r - r) - Math.hypot(b.q - q, b.r - r)).find((cell) => !cell.owner);
    if (seed) { seed.owner = `ai${i + 1}`; seed.t = { l: 4, m: 2, h: 1 }; }
  }
  return { sizeId, preset, cells, turn: 1, actions: preset.actions, from: null, to: null, draft: { l: 0, m: 0, h: 0 }, log: [`${preset.label} campaign: ${preset.territories} zones, ${preset.rivals + 1} empires.`], over: null };
}
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `#cavalry-campaign{position:fixed;inset:0;z-index:90;display:none;pointer-events:none;color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000}#cavalry-campaign[data-on=true]{display:block}.cc-map,.cc-fx{position:fixed;inset:0;width:100%;height:100%;display:block}.cc-map{pointer-events:auto;background:#070b07}.cc-fx{pointer-events:none;mix-blend-mode:screen}.cc-box{border:1px solid rgba(255,222,150,.30);border-radius:18px;background:rgba(13,9,6,.86);box-shadow:0 18px 62px #0008;backdrop-filter:blur(12px)}.cc-chooser{position:fixed;z-index:96;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,calc(100vw - 28px));padding:22px;pointer-events:auto}.cc-chooser h2{margin:0 0 8px;font-size:28px}.cc-chooser p{margin:0 0 16px;color:#ffecc8bf;font-weight:720}.cc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.cc-choice,.cc-btn{border:1px solid rgba(255,222,150,.25);border-radius:14px;background:rgba(255,236,170,.08);color:#fff6e3;padding:12px;font-weight:900;cursor:pointer}.cc-choice{text-align:left;min-height:106px}.cc-choice span{display:block;color:#ffe19a;font-size:12px;margin-top:8px}.cc-choice:hover,.cc-btn:hover{border-color:#ffe19a;transform:translateY(-2px)}.cc-hud{position:fixed;z-index:95;left:14px;top:14px;width:min(390px,calc(100vw - 28px));display:none;gap:8px;pointer-events:none}.cc-hud[data-on=true]{display:grid}.cc-card{padding:11px}.cc-title{font-weight:950;text-transform:uppercase;letter-spacing:.08em}.cc-line{font-size:12px;font-weight:750;color:#ffecc8bf;margin-top:4px}.cc-actions{display:flex;gap:8px;pointer-events:auto}.cc-btn:disabled{opacity:.35;filter:grayscale(.6);cursor:not-allowed}.cc-order{position:fixed;right:14px;bottom:14px;z-index:96;width:min(390px,calc(100vw - 28px));display:none;pointer-events:auto;padding:12px}.cc-order[data-on=true]{display:block}.cc-row{display:grid;grid-template-columns:1fr 30px 38px 30px;align-items:center;gap:7px;margin-top:8px}.cc-tiny{width:30px;height:30px;border-radius:9px;border:1px solid #ffe19644;background:#fff2;color:#fff6e3;font-weight:950}.cc-log{font-size:11px;color:#ffecc8aa;line-height:1.35;max-height:72px;overflow:hidden}`;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-campaign";
  root.innerHTML = `<canvas class="cc-map"></canvas><canvas class="cc-fx"></canvas><div class="cc-chooser cc-box"><h2>Choose your campaign world</h2><p>Small has three empires including Rome. Each larger size adds one opponent and doubles territory scale until Alexandrian.</p><div class="cc-grid">${Object.entries(SIZE_PRESETS).map(([id,p]) => `<button class="cc-choice" data-size="${id}"><b>${p.label}</b><span>${p.territories} territories<br>${p.rivals + 1} empires total</span></button>`).join("")}</div></div><div class="cc-hud"><div class="cc-card cc-box"><div class="cc-title">Campaign Map</div><div class="cc-line" id="cc-stats"></div><div class="cc-line" id="cc-troops"></div></div><div class="cc-card cc-box cc-actions"><button class="cc-btn" id="cc-end">End World Turn</button><button class="cc-btn" id="cc-concede">Concede</button><button class="cc-btn" id="cc-new">New Map</button></div><div class="cc-card cc-box cc-log" id="cc-log"></div></div><div class="cc-order cc-box"></div>`;
  document.body.append(root);
  map = root.querySelector(".cc-map"); ctx = map.getContext("2d"); fx = root.querySelector(".cc-fx"); fxCtx = fx.getContext("2d"); chooser = root.querySelector(".cc-chooser"); hud = root.querySelector(".cc-hud"); order = root.querySelector(".cc-order");
  root.querySelectorAll("[data-size]").forEach((button) => button.onclick = () => start(button.dataset.size));
  root.querySelector("#cc-new").onclick = () => { campaign = null; chooser.style.display = "block"; hud.dataset.on = "false"; order.dataset.on = "false"; };
  root.querySelector("#cc-end").onclick = endTurn;
  root.querySelector("#cc-concede").onclick = concede;
  map.onpointermove = (event) => { hoverId = nearest(event)?.id ?? null; };
  map.onpointerdown = (event) => click(nearest(event));
}
function setBaseVisibility(active) { const game = document.querySelector("#game"); const hudEl = document.querySelector("#hud"); if (game) game.style.opacity = active ? "0" : "1"; if (hudEl) hudEl.style.display = active ? "none" : "grid"; }
function start(size) { campaign = buildCampaign(size); chooser.style.display = "none"; hud.dataset.on = "true"; log("Rome begins with 3 territories, 10 light, 5 medium, 5 heavy."); }
function log(text) { if (!campaign) return; campaign.log.unshift(text); campaign.log = campaign.log.slice(0, 7); }
function resize() { const d = Math.max(1, Math.min(2, devicePixelRatio || 1)); const w = Math.floor(map.clientWidth * d) || 1, h = Math.floor(map.clientHeight * d) || 1; for (const canvas of [map, fx]) if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } return { w, h }; }
function metrics(sz) { const p = campaign?.preset || SIZE_PRESETS.small; const margin = Math.min(sz.w, sz.h) * .07; const r = Math.min((sz.w - margin * 2) / (SQRT3 * (p.cols + .5)), (sz.h - margin * 2) / (1.5 * (p.rows - 1) + 2)); return { r, x: (sz.w - SQRT3 * r * (p.cols + .5)) * .5 + SQRT3 * r * .5, y: (sz.h - r * (1.5 * (p.rows - 1) + 2)) * .5 + r, ys: .82 }; }
function center(cell, sz) { const m = metrics(sz); return { x: m.x + SQRT3 * m.r * (cell.q + (cell.r % 2 ? .5 : 0)), y: m.y + m.ys * m.r * (cell.r * 1.5), r: m.r, ys: m.ys }; }
function hexPath(cell, sz, scale = .94) { const c = center(cell, sz); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * TAU / 6; const x = c.x + Math.cos(a) * c.r * scale, y = c.y + Math.sin(a) * c.r * c.ys * scale; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); return c; }
function drawMap() {
  const sz = resize(); ctx.clearRect(0, 0, sz.w, sz.h); if (!campaign) return;
  const time = performance.now() / 1000;
  for (const cell of campaign.cells) {
    const c = hexPath(cell, sz); const biome = BIOMES[cell.biome]; const pulse = (Math.sin(time * 1.7 + cell.q * .7 + cell.r * .4) + 1) * .5;
    const g = ctx.createLinearGradient(c.x - c.r, c.y - c.r, c.x + c.r, c.y + c.r); g.addColorStop(0, biome.detail); g.addColorStop(.55, biome.color); g.addColorStop(1, "#16220f"); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${.035 + .045 * pulse})`; ctx.fill();
    ctx.lineWidth = Math.max(1.2, c.r * .026); ctx.strokeStyle = cell.owner ? ownerColor(cell.owner) : "rgba(255,255,255,.88)"; ctx.stroke();
    if (cell.id === hoverId || cell.id === campaign.from || cell.id === campaign.to) { ctx.lineWidth = Math.max(2, c.r * .055); ctx.strokeStyle = "#ffe19a"; ctx.stroke(); }
    if (cell.owner || troopCount(cell.t)) { ctx.fillStyle = "rgba(0,0,0,.48)"; ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r * .30, c.r * c.ys * .16, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#fff6e3"; ctx.font = `${Math.max(10, sz.w * .007)}px Inter,system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${cell.t.l}/${cell.t.m}/${cell.t.h}`, c.x, c.y); }
  }
}
function drawFx(active) { fxCtx.clearRect(0, 0, fx.width, fx.height); if (!active) return; const t = performance.now() / 1000; const g = fxCtx.createRadialGradient(fx.width * .34, fx.height * .22, 0, fx.width * .34, fx.height * .22, fx.width * .75); g.addColorStop(0, "rgba(255,196,88,.16)"); g.addColorStop(.42, "rgba(58,130,100,.08)"); g.addColorStop(1, "rgba(0,0,0,0)"); fxCtx.fillStyle = g; fxCtx.fillRect(0, 0, fx.width, fx.height); fxCtx.globalAlpha = .08; for (let i = 0; i < 28; i++) { fxCtx.strokeStyle = i % 2 ? "#8ac9a2" : "#4f9db5"; fxCtx.beginPath(); const y = (hash(i, 4) * fx.height + t * 12 * (i % 3 + 1)) % fx.height; fxCtx.moveTo(0, y); fxCtx.bezierCurveTo(fx.width * .35, y - 80, fx.width * .62, y + 80, fx.width, y); fxCtx.stroke(); } fxCtx.globalAlpha = 1; }
function nearest(event) { if (!campaign) return null; const rect = map.getBoundingClientRect(), sz = { w: map.width, h: map.height }; const x = (event.clientX - rect.left) * map.width / Math.max(1, rect.width), y = (event.clientY - rect.top) * map.height / Math.max(1, rect.height); let best = null, bestD = 99; for (const cell of campaign.cells) { const c = center(cell, sz); const d = Math.hypot(x - c.x, (y - c.y) / c.ys) / c.r; if (d < bestD) { best = cell; bestD = d; } } return bestD < .92 ? best : null; }
function cell(id) { return campaign?.cells.find((entry) => entry.id === id); }
function owned(owner) { return campaign?.cells.filter((entry) => entry.owner === owner) || []; }
function prepareDraft() { const from = cell(campaign.from); campaign.draft = from ? { l: Math.max(0, from.t.l - 1), m: from.t.m, h: from.t.h } : { l: 0, m: 0, h: 0 }; }
function click(target) { if (!campaign || !target || campaign.over) return; if (!campaign.from) { if (target.owner === "player" && troopCount(target.t) > 1) { campaign.from = target.id; campaign.to = null; prepareDraft(); } return; } const from = cell(campaign.from); if (target.id === from.id) { campaign.from = null; campaign.to = null; return; } if (from.n.includes(target.id)) campaign.to = target.id; else if (target.owner === "player" && troopCount(target.t) > 1) { campaign.from = target.id; campaign.to = null; prepareDraft(); } }
function updateOrder() { if (!campaign?.from) { order.dataset.on = "false"; return; } const from = cell(campaign.from), to = cell(campaign.to); order.dataset.on = "true"; order.innerHTML = `<div class="cc-title">Move Troops</div><div class="cc-line">${from.id}${to ? ` to ${to.id}` : " · choose adjacent territory"}</div>${[["l","Light"],["m","Medium"],["h","Heavy"]].map(([k,l]) => `<div class="cc-row"><span>${l}</span><button class="cc-tiny" data-d="${k}">−</button><b>${campaign.draft[k]}</b><button class="cc-tiny" data-i="${k}">+</button></div>`).join("")}<div class="cc-actions" style="margin-top:10px"><button class="cc-btn" id="cc-move" ${!to || campaign.actions <= 0 || troopCount(campaign.draft) <= 0 ? "disabled" : ""}>Move</button><button class="cc-btn" id="cc-cancel">Cancel</button></div>`; order.querySelector("#cc-cancel").onclick = () => { campaign.from = null; campaign.to = null; }; order.querySelector("#cc-move")?.addEventListener("click", moveDraft); order.querySelectorAll("[data-d]").forEach((button) => button.onclick = () => { campaign.draft[button.dataset.d] = Math.max(0, campaign.draft[button.dataset.d] - 1); }); order.querySelectorAll("[data-i]").forEach((button) => button.onclick = () => { const k = button.dataset.i; campaign.draft[k] = Math.min(from.t[k], campaign.draft[k] + 1); }); }
function resolve(owner, from, to, draft) { sub(from.t, draft); if (!to.owner || to.owner === owner) { to.owner = owner; add(to.t, draft); return `${owner === "player" ? "Rome" : owner} occupied ${to.id}.`; } const attack = strength(draft), defend = strength(to.t); if (attack > defend) { to.owner = owner; to.t = { l: Math.max(1, draft.l - Math.ceil(defend / 3)), m: Math.max(0, draft.m - Math.ceil(defend / 6)), h: Math.max(0, draft.h - Math.ceil(defend / 9)) }; return `${owner === "player" ? "Rome" : owner} captured ${to.id}.`; } to.t = { l: Math.max(0, to.t.l - Math.ceil(attack / 3)), m: Math.max(0, to.t.m - Math.ceil(attack / 6)), h: Math.max(0, to.t.h - Math.ceil(attack / 9)) }; return `${owner === "player" ? "Rome" : owner} was stopped at ${to.id}.`; }
function moveDraft() { const from = cell(campaign.from), to = cell(campaign.to), draft = { ...campaign.draft }; if (!from || !to || !from.n.includes(to.id) || campaign.actions <= 0 || troopCount(draft) <= 0) return; log(resolve("player", from, to, draft)); campaign.actions -= 1; campaign.from = null; campaign.to = null; checkEnd(); }
function spawn(owner) { for (const territory of owned(owner)) territory.t[BIOMES[territory.biome].spawn] += 1; }
function aiStep() { for (let i = 1; i <= campaign.preset.rivals; i++) { const owner = `ai${i}`; const from = owned(owner).filter((entry) => troopCount(entry.t) > 2 && entry.n.some((id) => cell(id)?.owner !== owner)).sort((a,b) => strength(b.t) - strength(a.t))[0]; if (!from) continue; const to = from.n.map(cell).filter((entry) => entry.owner !== owner).sort((a,b) => (a.owner ? 1 : 0) - (b.owner ? 1 : 0) || strength(a.t) - strength(b.t))[0]; if (!to) continue; const draft = { l: Math.floor(from.t.l * .55), m: Math.floor(from.t.m * .55), h: Math.floor(from.t.h * .55) }; if (troopCount(draft)) log(resolve(owner, from, to, draft)); } }
function endTurn() { if (!campaign || campaign.over) return; spawn("player"); for (let i = 1; i <= campaign.preset.rivals; i++) spawn(`ai${i}`); aiStep(); campaign.turn += 1; campaign.actions = campaign.preset.actions; campaign.from = null; campaign.to = null; log("World actions refreshed. New troops spawned at owned territories."); checkEnd(); }
function concede() { if (!campaign) return; if (owned("player").length > 3) { log("Concede blocked: Rome controls more than three territories."); return; } campaign.over = "conceded"; log("Rome conceded the campaign."); }
function checkEnd() { if (campaign.cells.every((entry) => entry.owner)) { campaign.over = "complete"; log("All zones are claimed. Campaign resolved."); } }
function updateHud() { if (!campaign) return; const total = owned("player").reduce((acc, entry) => { add(acc, entry.t); return acc; }, { l: 0, m: 0, h: 0 }); root.querySelector("#cc-stats").textContent = `Turn ${campaign.turn} · ${owned("player").length}/${campaign.cells.length} territories · ${campaign.actions} world actions`; root.querySelector("#cc-troops").textContent = `Rome L/M/H ${total.l}/${total.m}/${total.h}`; root.querySelector("#cc-log").innerHTML = campaign.log.map((entry) => `<div>${entry}</div>`).join(""); root.querySelector("#cc-concede").disabled = owned("player").length > 3 || Boolean(campaign.over); root.querySelector("#cc-end").disabled = Boolean(campaign.over); updateOrder(); }
function patchHost() { const host = globalThis.GameHost; if (!host || patched) return false; const original = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({}); host.getSnapshot = () => ({ ...original(), campaignMap: campaign ? { style: CAMPAIGN_STYLE, size: campaign.sizeId, territories: campaign.cells.length, playerTerritories: owned("player").length, turn: campaign.turn, actions: campaign.actions, over: campaign.over } : { style: CAMPAIGN_STYLE, choosingSize: true } }); host.getCampaignMapSnapshot = () => campaign; patched = true; return true; }
function frame() { install(); const active = pageActive(); root.dataset.on = active ? "true" : "false"; setBaseVisibility(active); if (active) { if (!campaign) { chooser.style.display = "block"; hud.dataset.on = "false"; order.dataset.on = "false"; } else { chooser.style.display = "none"; hud.dataset.on = "true"; } drawMap(); drawFx(true); updateHud(); } requestAnimationFrame(frame); }
function boot() { install(); globalThis.CavalryCampaignMap = { style: CAMPAIGN_STYLE, start, presets: SIZE_PRESETS, getState: () => campaign }; const timer = setInterval(() => { if (patchHost()) clearInterval(timer); }, 100); requestAnimationFrame(frame); }
boot();
