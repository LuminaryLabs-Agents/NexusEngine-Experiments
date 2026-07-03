const HEX_ENGAGEMENT_STYLE = "cavalry-campaign-hex-engagement-032";
const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);
const COLORS = { l: "#39d36a", m: "#4f80ff", h: "#d94135" };
const LABELS = { l: "Light", m: "Medium", h: "Heavy" };
const POWER = { l: 1, m: 2, h: 3 };
const count = (t = {}) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const strength = (t = {}) => (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3;
const label = (t = {}) => `${t.l || 0}/${t.m || 0}/${t.h || 0}`;
const add = (a, b) => { a.l = (a.l || 0) + (b.l || 0); a.m = (a.m || 0) + (b.m || 0); a.h = (a.h || 0) + (b.h || 0); };
const sub = (a, b) => { a.l = Math.max(0, (a.l || 0) - (b.l || 0)); a.m = Math.max(0, (a.m || 0) - (b.m || 0)); a.h = Math.max(0, (a.h || 0) - (b.h || 0)); };
let root, canvas, ctx, panel, active = null;
function campaign() { return globalThis.CavalryCampaignMap?.getState?.() || null; }
function applyLoss(troops, lossPower) {
  const out = { ...troops };
  let loss = Math.max(0, Math.ceil(lossPower));
  while (loss > 0 && out.l > 0) { out.l -= 1; loss -= 1; }
  while (loss > 0 && out.m > 0) { out.m -= 1; loss -= 2; }
  while (loss > 0 && out.h > 0) { out.h -= 1; loss -= 3; }
  return out;
}
function log(text) {
  const s = campaign();
  if (!s) return;
  s.log = s.log || [];
  s.log.unshift(text);
  s.log = s.log.slice(0, 7);
}
function expandUnits(troops, side) {
  const out = [];
  for (const type of ["h", "m", "l"]) {
    for (let i = 0; i < (troops[type] || 0); i += 1) out.push({ side, type, hp: POWER[type], id: `${side}-${type}-${i}` });
  }
  return out;
}
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    .hex-engagement-root{position:fixed;inset:0;z-index:260;display:none;background:radial-gradient(circle at 50% 30%,rgba(62,44,24,.45),rgba(4,4,3,.94));color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000}
    .hex-engagement-root[data-on=true]{display:block}
    .hex-engagement-canvas{position:absolute;inset:0;width:100%;height:100%}
    .hex-engagement-panel{position:absolute;left:50%;top:16px;transform:translateX(-50%);width:min(900px,calc(100vw - 28px));border:1px solid rgba(255,222,150,.34);border-radius:18px;background:rgba(13,9,6,.84);box-shadow:0 22px 72px rgba(0,0,0,.60);backdrop-filter:blur(14px);padding:12px 14px;pointer-events:auto}
    .hex-title{font-weight:950;text-transform:uppercase;letter-spacing:.08em;color:#ffe19a}.hex-sub{font-size:12px;color:#ffecc8bf;font-weight:760;margin-top:4px}.hex-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:10px}.hex-btn{border:1px solid rgba(255,222,150,.30);border-radius:13px;background:rgba(255,236,170,.10);color:#fff6e3;padding:10px 12px;font:950 12px Inter,system-ui;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}.hex-btn:hover{border-color:#ffe19a;background:rgba(255,236,170,.16)}.hex-btn.danger{border-color:rgba(255,118,93,.44);background:rgba(168,38,30,.24)}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.className = "hex-engagement-root";
  root.innerHTML = `<canvas class="hex-engagement-canvas"></canvas><div class="hex-engagement-panel"><div class="hex-title">Engagement</div><div class="hex-sub" id="hex-engagement-summary"></div><div class="hex-actions"><button class="hex-btn" data-action="auto">Auto Resolve Engagement</button><button class="hex-btn danger" data-action="retreat">Retreat / Cancel Attack</button></div></div>`;
  document.body.append(root);
  canvas = root.querySelector("canvas");
  ctx = canvas.getContext("2d");
  panel = root.querySelector("#hex-engagement-summary");
  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "auto") resolveActive();
    if (action === "retreat") retreatActive();
  });
}
function resize() {
  const d = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.floor(canvas.clientWidth * d) || 1;
  const h = Math.floor(canvas.clientHeight * d) || 1;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h, d };
}
function hexCenter(col, row, r, originX, originY) {
  return { x: originX + SQRT3 * r * (col + (row % 2 ? .5 : 0)), y: originY + r * 1.5 * row };
}
function drawHex(x, y, r, fill, stroke = "rgba(255,226,150,.22)") {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + i * TAU / 6;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(1, r * .035);
  ctx.stroke();
}
function arrangeUnits(units, side) {
  const cols = side === "attacker" ? [1, 2, 3] : [8, 7, 6];
  const rows = [2, 3, 4, 5, 6];
  return units.map((unit, index) => ({ ...unit, col: cols[index % cols.length], row: rows[Math.floor(index / cols.length) % rows.length] }));
}
function drawUnit(unit, x, y, r) {
  const color = COLORS[unit.type] || "#fff";
  ctx.save();
  ctx.fillStyle = unit.side === "attacker" ? "rgba(207,46,37,.35)" : "rgba(255,235,160,.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + r * .24, r * .52, r * .20, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.strokeStyle = unit.side === "attacker" ? "#fff4a8" : "#1b1208";
  ctx.lineWidth = Math.max(2, r * .07);
  ctx.beginPath();
  ctx.arc(x, y, r * .38, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.max(11, r * .35)}px Inter,system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(unit.type.toUpperCase(), x, y + 1);
  ctx.restore();
}
function draw() {
  install();
  const size = resize();
  ctx.clearRect(0, 0, size.w, size.h);
  if (!active) return;
  const r = Math.min(size.w / 15, size.h / 12, 48);
  const originX = (size.w - SQRT3 * r * 10.5) / 2 + r;
  const originY = Math.max(120, (size.h - r * 1.5 * 8) / 2 + r);
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const p = hexCenter(col, row, r, originX, originY);
      const terrainWave = Math.sin(col * 1.4 + row * .9) * .5 + .5;
      const fill = row < 2 || row > 5 ? "rgba(80,96,52,.44)" : terrainWave > .65 ? "rgba(105,82,45,.48)" : "rgba(42,88,56,.42)";
      drawHex(p.x, p.y, r * .96, fill);
    }
  }
  const attacker = arrangeUnits(active.attackerUnits, "attacker");
  const defender = arrangeUnits(active.defenderUnits, "defender");
  for (const unit of [...attacker, ...defender]) {
    const p = hexCenter(unit.col, unit.row, r, originX, originY);
    drawUnit(unit, p.x, p.y, r);
  }
}
function launchEngagement(payload) {
  install();
  const s = campaign();
  if (!s || !payload?.source || !payload?.target || !payload?.draft) return false;
  active = {
    sourceId: payload.source.id,
    targetId: payload.target.id,
    draft: { ...payload.draft },
    attackerUnits: expandUnits(payload.draft, "attacker"),
    defenderUnits: expandUnits(payload.target.troops, "defender"),
    targetOwner: payload.target.owner
  };
  root.dataset.on = "true";
  panel.textContent = `Rome attacks ${payload.target.id}. Attacker L/M/H ${label(payload.draft)} vs Defender L/M/H ${label(payload.target.troops)}. Units are arranged on the tactical hex grid.`;
  return true;
}
function resolveActive() {
  const s = campaign();
  if (!s || !active) return;
  const source = s.cells.find((cell) => cell.id === active.sourceId);
  const target = s.cells.find((cell) => cell.id === active.targetId);
  if (!source || !target) { close(); return; }
  const attack = strength(active.draft);
  const defend = strength(target.troops);
  sub(source.troops, active.draft);
  if (attack > defend) {
    target.owner = "player";
    target.troops = applyLoss(active.draft, defend * .55);
    if (count(target.troops) <= 0) target.troops = { l: 1, m: 0, h: 0 };
    log(`Rome captured ${target.id} from the hex engagement. Survivors L/M/H ${label(target.troops)}.`);
  } else {
    target.troops = applyLoss(target.troops, attack * .70);
    log(`Rome lost the engagement at ${target.id}. Defender L/M/H ${label(target.troops)}.`);
  }
  s.actions = 0;
  s.from = null;
  s.to = null;
  s.draft = { l: 0, m: 0, h: 0 };
  close();
}
function retreatActive() {
  log("Rome cancelled the engagement before committing the attack.");
  close();
}
function close() {
  active = null;
  if (root) root.dataset.on = "false";
}
function frame() {
  draw();
  requestAnimationFrame(frame);
}
install();
globalThis.CavalryHexEngagement = { style: HEX_ENGAGEMENT_STYLE, launch: launchEngagement, close };
requestAnimationFrame(frame);
