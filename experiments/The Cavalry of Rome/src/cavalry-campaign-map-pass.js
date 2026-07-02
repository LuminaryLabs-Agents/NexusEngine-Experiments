const CAMPAIGN_STYLE = "cavalry-campaign-terrain-voronoi-019";
const TAU = Math.PI * 2;
const SIZE_PRESETS = Object.freeze({
  small: { label: "Small", cols: 6, rows: 4, territories: 24, rivals: 2, actions: 3 },
  medium: { label: "Medium", cols: 8, rows: 6, territories: 48, rivals: 3, actions: 4 },
  large: { label: "Large", cols: 12, rows: 8, territories: 96, rivals: 4, actions: 5 },
  alexandrian: { label: "Alexandrian", cols: 16, rows: 12, territories: 192, rivals: 5, actions: 6 }
});
const BIOMES = Object.freeze([
  { id: "boreal", name: "Boreal Forest", color: [36, 83, 50], detail: [66, 118, 74], spawn: "m" },
  { id: "steppe", name: "Wind Steppe", color: [128, 113, 57], detail: [178, 154, 77], spawn: "l" },
  { id: "taiga", name: "Dark Taiga", color: [23, 63, 52], detail: [44, 92, 74], spawn: "l" },
  { id: "wetland", name: "Wetland", color: [28, 99, 114], detail: [52, 136, 152], spawn: "l" },
  { id: "highland", name: "Highland", color: [138, 125, 77], detail: [196, 174, 100], spawn: "h" },
  { id: "snow", name: "Northern Snow", color: [199, 214, 206], detail: [244, 247, 239], spawn: "m" },
  { id: "black-earth", name: "Black Earth", color: [65, 91, 36], detail: [110, 127, 51], spawn: "m" },
  { id: "karst", name: "Karst Ridge", color: [129, 118, 85], detail: [184, 170, 121], spawn: "h" },
  { id: "riverland", name: "Riverland", color: [27, 88, 101], detail: [87, 167, 170], spawn: "l" }
]);
const OWNER_COLORS = Object.freeze({ neutral: "rgba(250,250,240,.90)", player: "#cf2e25", ai1: "#d6aa3c", ai2: "#7a54bd", ai3: "#21966e", ai4: "#d85f2d", ai5: "#4f80ff" });
const hash = (x, y, s = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123; return v - Math.floor(v); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const lerp = (a, b, t) => a + (b - a) * t;
const troopCount = (t) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const strength = (t) => (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3;
const addTroops = (a, b) => { a.l = (a.l || 0) + (b.l || 0); a.m = (a.m || 0) + (b.m || 0); a.h = (a.h || 0) + (b.h || 0); };
const subTroops = (a, b) => { a.l = Math.max(0, (a.l || 0) - (b.l || 0)); a.m = Math.max(0, (a.m || 0) - (b.m || 0)); a.h = Math.max(0, (a.h || 0) - (b.h || 0)); };
function mixColor(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function rgb(c, a = 1) { return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`; }
function noise(x, y, s = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s);
  return lerp(lerp(a, b, sx), lerp(c, d, sx), sy) * 2 - 1;
}
function fbm(x, y, s = 0) { let v = 0, a = .55, f = 1, n = 0; for (let i = 0; i < 5; i += 1) { v += noise(x * f, y * f, s + i * 31) * a; n += a; a *= .52; f *= 2.03; } return v / Math.max(.001, n); }
let root, map, ctx, fx, fxCtx, chooser, hud, order, campaign = null, hoverId = null, pointer = null, patched = false;
function ownerColor(owner) { return OWNER_COLORS[owner || "neutral"] || "#d7d7d7"; }
function ownerFill(owner) { if (!owner) return "rgba(255,255,255,.055)"; if (owner === "player") return "rgba(207,46,37,.20)"; return `${ownerColor(owner)}33`; }
function pageActive() { const mode = globalThis.GameHost?.getSnapshot?.()?.mode; return mode !== "battlefield" && mode !== "dive"; }
function biomeFor(x, y, p) {
  const nx = x / p.worldW, ny = y / p.worldH;
  const ridge = fbm(nx * 6.5, ny * 5.7, 20) + Math.sin(nx * 12.0 + ny * 4.8) * .24;
  const wet = fbm(nx * 5.2 + 3, ny * 4.6 - 1, 50);
  const cold = 1 - ny + fbm(nx * 3.1, ny * 2.8, 70) * .22;
  const river = riverMask(x, y, p, 0);
  if (river > .58) return 8;
  if (cold > .74) return 5;
  if (ridge > .48) return 4;
  if (ridge > .31) return 7;
  if (wet > .38) return 3;
  if (cold > .52) return 2;
  if (wet < -.30) return 1;
  if (wet > .10) return 0;
  return 6;
}
function riverMask(x, y, p, t = 0) {
  const main = p.worldH * (.42 + Math.sin(x / p.worldW * 6.2 + t * .08) * .11 + fbm(x * .002, y * .002, 90) * .08);
  const branch = p.worldH * (.68 + Math.cos(x / p.worldW * 4.4 - 1.2) * .08);
  const d1 = Math.abs(y - main) / (p.worldH * .035);
  const d2 = Math.abs(y - branch) / (p.worldH * .026);
  return Math.max(Math.exp(-d1 * d1), Math.exp(-d2 * d2) * .72);
}
function clipHalfPlane(poly, ax, ay, c) {
  const out = [];
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = ax * a.x + ay * a.y - c, db = ax * b.x + ay * b.y - c;
    const ina = da <= 0, inb = db <= 0;
    if (ina && inb) out.push(b);
    else if (ina && !inb) { const t = da / (da - db); out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }); }
    else if (!ina && inb) { const t = da / (da - db); out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }, b); }
  }
  return out;
}
function voronoiCell(center, centers, p) {
  let poly = [{ x: 0, y: 0 }, { x: p.worldW, y: 0 }, { x: p.worldW, y: p.worldH }, { x: 0, y: p.worldH }];
  for (const other of centers) {
    if (other === center) continue;
    const ax = 2 * (other.x - center.x), ay = 2 * (other.y - center.y), c = other.x * other.x + other.y * other.y - center.x * center.x - center.y * center.y;
    poly = clipHalfPlane(poly, ax, ay, c);
    if (poly.length <= 2) break;
  }
  return poly;
}
function buildCampaign(sizeId) {
  const base = SIZE_PRESETS[sizeId] || SIZE_PRESETS.small;
  const p = { ...base, worldW: base.cols * 280, worldH: base.rows * 230 };
  const centers = [];
  for (let r = 0; r < p.rows; r += 1) for (let q = 0; q < p.cols; q += 1) {
    const jx = (hash(q, r, 1) - .5) * .38, jy = (hash(q, r, 2) - .5) * .34;
    centers.push({ id: `t-${q}-${r}`, q, r, x: clamp((q + .5 + jx) * p.worldW / p.cols, 16, p.worldW - 16), y: clamp((r + .5 + jy) * p.worldH / p.rows, 16, p.worldH - 16) });
  }
  const cells = centers.map((c) => ({ ...c, biome: biomeFor(c.x, c.y, p), owner: null, t: { l: 0, m: 0, h: 0 }, n: [], poly: voronoiCell(c, centers, p) }));
  const by = new Map(cells.map((c) => [c.id, c]));
  for (const cell of cells) {
    cell.n = cells.filter((other) => other !== cell).map((other) => ({ id: other.id, d: Math.hypot(other.x - cell.x, other.y - cell.y) })).sort((a, b) => a.d - b.d).slice(0, 6).map((entry) => entry.id);
  }
  const playerSeed = cells.slice().sort((a, b) => (a.x + (p.worldH - a.y) * .75) - (b.x + (p.worldH - b.y) * .75))[0];
  const playerCells = [playerSeed, ...playerSeed.n.map((id) => by.get(id)).filter(Boolean).sort((a, b) => a.x - b.x || b.y - a.y).slice(0, 2)];
  playerCells.forEach((cell, i) => { cell.owner = "player"; cell.t = i === 0 ? { l: 4, m: 2, h: 2 } : i === 1 ? { l: 3, m: 2, h: 2 } : { l: 3, m: 1, h: 1 }; });
  for (let i = 0; i < p.rivals; i += 1) {
    const angle = i / p.rivals * TAU - Math.PI * .25;
    const tx = p.worldW * (.5 + Math.cos(angle) * .43), ty = p.worldH * (.5 + Math.sin(angle) * .43);
    const seed = cells.slice().sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty)).find((cell) => !cell.owner);
    if (seed) { seed.owner = `ai${i + 1}`; seed.t = { l: 4, m: 2, h: 1 }; }
  }
  return { sizeId, preset: p, cells, turn: 1, actions: p.actions, from: null, to: null, draft: { l: 0, m: 0, h: 0 }, camera: { x: p.worldW / 2, y: p.worldH / 2, z: 1, fitted: false }, log: [`${p.label} campaign: ${p.territories} zones, ${p.rivals + 1} empires.`], over: null };
}
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `#cavalry-campaign{position:fixed;inset:0;z-index:90;display:none;pointer-events:none;color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000}#cavalry-campaign[data-on=true]{display:block}.cc-map,.cc-fx{position:fixed;inset:0;width:100%;height:100%;display:block}.cc-map{pointer-events:auto;background:#061006}.cc-fx{pointer-events:none;mix-blend-mode:screen}.cc-box{border:1px solid rgba(255,222,150,.30);border-radius:18px;background:rgba(13,9,6,.86);box-shadow:0 18px 62px #0008;backdrop-filter:blur(12px)}.cc-chooser{position:fixed;z-index:96;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,calc(100vw - 28px));padding:22px;pointer-events:auto}.cc-chooser h2{margin:0 0 8px;font-size:28px}.cc-chooser p{margin:0 0 16px;color:#ffecc8bf;font-weight:720}.cc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.cc-choice,.cc-btn{border:1px solid rgba(255,222,150,.25);border-radius:14px;background:rgba(255,236,170,.08);color:#fff6e3;padding:12px;font-weight:900;cursor:pointer}.cc-choice{text-align:left;min-height:106px}.cc-choice span{display:block;color:#ffe19a;font-size:12px;margin-top:8px}.cc-choice:hover,.cc-btn:hover{border-color:#ffe19a;transform:translateY(-2px)}.cc-hud{position:fixed;z-index:95;left:14px;top:14px;width:min(390px,calc(100vw - 28px));display:none;gap:8px;pointer-events:none}.cc-hud[data-on=true]{display:grid}.cc-card{padding:11px}.cc-title{font-weight:950;text-transform:uppercase;letter-spacing:.08em}.cc-line{font-size:12px;font-weight:750;color:#ffecc8bf;margin-top:4px}.cc-actions{display:flex;gap:8px;pointer-events:auto}.cc-btn:disabled{opacity:.35;filter:grayscale(.6);cursor:not-allowed}.cc-order{position:fixed;right:14px;bottom:14px;z-index:96;width:min(390px,calc(100vw - 28px));display:none;pointer-events:auto;padding:12px}.cc-order[data-on=true]{display:block}.cc-row{display:grid;grid-template-columns:1fr 30px 38px 30px;align-items:center;gap:7px;margin-top:8px}.cc-tiny{width:30px;height:30px;border-radius:9px;border:1px solid #ffe19644;background:#fff2;color:#fff6e3;font-weight:950}.cc-log{font-size:11px;color:#ffecc8aa;line-height:1.35;max-height:72px;overflow:hidden}.cc-help{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:94;color:#ffecc899;font:800 11px/1.2 Inter,system-ui;letter-spacing:.05em;text-transform:uppercase}`;
  document.head.append(style);
  root = document.createElement("section"); root.id = "cavalry-campaign";
  root.innerHTML = `<canvas class="cc-map"></canvas><canvas class="cc-fx"></canvas><div class="cc-chooser cc-box"><h2>Choose your campaign world</h2><p>Small has three empires including Rome. Drag to pan the living terrain map after choosing a scale.</p><div class="cc-grid">${Object.entries(SIZE_PRESETS).map(([id,p]) => `<button class="cc-choice" data-size="${id}"><b>${p.label}</b><span>${p.territories} territories<br>${p.rivals + 1} empires total</span></button>`).join("")}</div></div><div class="cc-hud"><div class="cc-card cc-box"><div class="cc-title">Campaign Map</div><div class="cc-line" id="cc-stats"></div><div class="cc-line" id="cc-troops"></div></div><div class="cc-card cc-box cc-actions"><button class="cc-btn" id="cc-end">End World Turn</button><button class="cc-btn" id="cc-concede">Concede</button><button class="cc-btn" id="cc-new">New Map</button></div><div class="cc-card cc-box cc-log" id="cc-log"></div></div><div class="cc-order cc-box"></div><div class="cc-help">Drag map to pan · wheel to zoom · select owned territory then adjacent target</div>`;
  document.body.append(root);
  map = root.querySelector(".cc-map"); ctx = map.getContext("2d"); fx = root.querySelector(".cc-fx"); fxCtx = fx.getContext("2d"); chooser = root.querySelector(".cc-chooser"); hud = root.querySelector(".cc-hud"); order = root.querySelector(".cc-order");
  root.querySelectorAll("[data-size]").forEach((button) => button.onclick = () => start(button.dataset.size)); root.querySelector("#cc-new").onclick = () => { campaign = null; chooser.style.display = "block"; hud.dataset.on = "false"; order.dataset.on = "false"; }; root.querySelector("#cc-end").onclick = endTurn; root.querySelector("#cc-concede").onclick = concede;
  map.onpointerdown = onPointerDown; map.onpointermove = onPointerMove; map.onpointerup = onPointerUp; map.onpointercancel = onPointerUp; map.onwheel = onWheel;
  order.addEventListener("click", onOrderClick);
}
function setBaseVisibility(active) { const game = document.querySelector("#game"); const hudEl = document.querySelector("#hud"); if (game) game.style.opacity = active ? "0" : "1"; if (hudEl) hudEl.style.display = active ? "none" : "grid"; }
function start(size) { campaign = buildCampaign(size); fitCamera(resize()); chooser.style.display = "none"; hud.dataset.on = "true"; log("Rome begins with 3 territories, 10 light, 5 medium, 5 heavy."); }
function log(text) { if (!campaign) return; campaign.log.unshift(text); campaign.log = campaign.log.slice(0, 7); }
function resize() { const d = Math.max(1, Math.min(2, devicePixelRatio || 1)); const w = Math.floor(map.clientWidth * d) || 1, h = Math.floor(map.clientHeight * d) || 1; for (const c of [map, fx]) if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return { w, h, d }; }
function fitCamera(sz) { if (!campaign || campaign.camera.fitted) return; const p = campaign.preset; campaign.camera.z = Math.min(sz.w / p.worldW, sz.h / p.worldH) * .86; campaign.camera.x = p.worldW / 2; campaign.camera.y = p.worldH / 2; campaign.camera.fitted = true; }
function worldToScreen(x, y, sz) { const c = campaign.camera; return { x: (x - c.x) * c.z + sz.w / 2, y: (y - c.y) * c.z + sz.h / 2 }; }
function screenToWorld(x, y, sz) { const c = campaign.camera; return { x: (x - sz.w / 2) / c.z + c.x, y: (y - sz.h / 2) / c.z + c.y }; }
function colorAt(x, y, p, t) { const biome = BIOMES[biomeFor(x, y, p)]; const hgt = fbm(x * .0032, y * .0032, 10); const wet = fbm(x * .004 + 3, y * .0038, 30); const river = riverMask(x, y, p, t); let color = mixColor(biome.color, biome.detail, clamp((hgt + 1) / 2)); if (river > .30) color = mixColor(color, [45, 118, 128], clamp(river)); if (hgt > .44) color = mixColor(color, [170, 160, 118], (hgt - .44) * 1.5); if (wet > .45) color = mixColor(color, [45, 95, 70], (wet - .45) * 1.2); return color; }
function drawTerrain(sz) { const p = campaign.preset, t = performance.now() / 1000; ctx.fillStyle = "#061006"; ctx.fillRect(0, 0, sz.w, sz.h); const step = Math.max(16, Math.round(30 * Math.max(1, campaign.camera.z))); for (let sy = 0; sy < sz.h; sy += step) for (let sx = 0; sx < sz.w; sx += step) { const w = screenToWorld(sx + step * .5, sy + step * .5, sz); const color = colorAt(w.x, w.y, p, t); ctx.fillStyle = rgb(color, .98); ctx.fillRect(sx, sy, step + 1, step + 1); const contour = Math.abs(((fbm(w.x * .004, w.y * .004, 110) * 9) % 1) - .5); if (contour < .045) { ctx.fillStyle = "rgba(255,238,170,.055)"; ctx.fillRect(sx, sy, step + 1, step + 1); } } }
function pathCell(cell, sz) { ctx.beginPath(); for (let i = 0; i < cell.poly.length; i += 1) { const p = worldToScreen(cell.poly[i].x, cell.poly[i].y, sz); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } ctx.closePath(); const c = worldToScreen(cell.x, cell.y, sz); return c; }
function drawCells(sz) { const t = performance.now() / 1000; for (const cell of campaign.cells) { const c = pathCell(cell, sz); ctx.fillStyle = ownerFill(cell.owner); ctx.fill(); const neighborHot = campaign.from && cell(campaign.from)?.n.includes(cell.id); ctx.lineWidth = Math.max(1, 1.35 * Math.sqrt(campaign.camera.z)); ctx.strokeStyle = neighborHot ? "rgba(255,225,110,.95)" : ownerColor(cell.owner); ctx.stroke(); if (cell.id === hoverId || cell.id === campaign.from || cell.id === campaign.to) { ctx.lineWidth = Math.max(2.2, 3 * Math.sqrt(campaign.camera.z)); ctx.strokeStyle = "#ffe19a"; ctx.stroke(); } if (cell.owner || troopCount(cell.t)) { ctx.fillStyle = "rgba(0,0,0,.50)"; ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(18, 30 * campaign.camera.z), Math.max(9, 14 * campaign.camera.z), 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#fff6e3"; ctx.font = `${Math.max(10, 13 * Math.sqrt(campaign.camera.z))}px Inter,system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${cell.t.l}/${cell.t.m}/${cell.t.h}`, c.x, c.y); } const biome = BIOMES[cell.biome]; if (!cell.owner && cell.id === hoverId) { ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "800 11px Inter,system-ui"; ctx.fillText(biome.name, c.x, c.y - 22); } }
  const p = campaign.preset, a = worldToScreen(0, 0, sz), b = worldToScreen(p.worldW, p.worldH, sz); ctx.strokeStyle = "rgba(255,230,160,.35)"; ctx.lineWidth = 2; ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y); }
function drawFx(active, sz) { fxCtx.clearRect(0, 0, fx.width, fx.height); if (!active) return; const t = performance.now() / 1000; const g = fxCtx.createRadialGradient(fx.width * .34, fx.height * .22, 0, fx.width * .34, fx.height * .22, fx.width * .75); g.addColorStop(0, "rgba(255,196,88,.16)"); g.addColorStop(.42, "rgba(58,130,100,.08)"); g.addColorStop(1, "rgba(0,0,0,0)"); fxCtx.fillStyle = g; fxCtx.fillRect(0, 0, fx.width, fx.height); fxCtx.globalAlpha = .11; for (let i = 0; i < 30; i += 1) { fxCtx.strokeStyle = i % 2 ? "#8ac9a2" : "#4f9db5"; fxCtx.beginPath(); const y = (hash(i, 4) * fx.height + t * 12 * (i % 3 + 1)) % fx.height; fxCtx.moveTo(0, y); fxCtx.bezierCurveTo(fx.width * .35, y - 80, fx.width * .62, y + 80, fx.width, y); fxCtx.stroke(); } fxCtx.globalAlpha = 1; }
function draw() { const sz = resize(); if (!campaign) { ctx.clearRect(0, 0, sz.w, sz.h); drawFx(true, sz); return; } fitCamera(sz); drawTerrain(sz); drawCells(sz); drawFx(true, sz); }
function nearestAt(clientX, clientY) { if (!campaign) return null; const rect = map.getBoundingClientRect(), sz = { w: map.width, h: map.height }; const x = (clientX - rect.left) * map.width / Math.max(1, rect.width), y = (clientY - rect.top) * map.height / Math.max(1, rect.height); const w = screenToWorld(x, y, sz); let best = null, bestD = Infinity; for (const cell of campaign.cells) { const d = Math.hypot(w.x - cell.x, w.y - cell.y); if (d < bestD) { best = cell; bestD = d; } } return best; }
function onPointerDown(event) { if (!campaign) return; pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, cameraX: campaign.camera.x, cameraY: campaign.camera.y, moved: false }; map.setPointerCapture?.(event.pointerId); }
function onPointerMove(event) { if (!campaign) return; hoverId = nearestAt(event.clientX, event.clientY)?.id ?? null; if (!pointer) return; const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; if (Math.hypot(dx, dy) > 5) pointer.moved = true; if (pointer.moved) { campaign.camera.x = pointer.cameraX - dx * (devicePixelRatio || 1) / campaign.camera.z; campaign.camera.y = pointer.cameraY - dy * (devicePixelRatio || 1) / campaign.camera.z; } }
function onPointerUp(event) { if (!campaign || !pointer) return; const wasClick = !pointer.moved; pointer = null; if (wasClick) click(nearestAt(event.clientX, event.clientY)); }
function onWheel(event) { if (!campaign) return; event.preventDefault(); const sz = { w: map.width, h: map.height }; const rect = map.getBoundingClientRect(); const sx = (event.clientX - rect.left) * map.width / Math.max(1, rect.width), sy = (event.clientY - rect.top) * map.height / Math.max(1, rect.height); const before = screenToWorld(sx, sy, sz); const next = clamp(campaign.camera.z * Math.exp(-event.deltaY * .001), .22, 2.8); campaign.camera.z = next; const after = screenToWorld(sx, sy, sz); campaign.camera.x += before.x - after.x; campaign.camera.y += before.y - after.y; }
function cell(id) { return campaign?.cells.find((entry) => entry.id === id); }
function owned(owner) { return campaign?.cells.filter((entry) => entry.owner === owner) || []; }
function prepareDraft() { const from = cell(campaign.from); campaign.draft = from ? { l: Math.max(0, from.t.l - 1), m: from.t.m, h: from.t.h } : { l: 0, m: 0, h: 0 }; }
function click(target) { if (!campaign || !target || campaign.over) return; if (!campaign.from) { if (target.owner === "player" && troopCount(target.t) > 1) { campaign.from = target.id; campaign.to = null; prepareDraft(); } return; } const from = cell(campaign.from); if (target.id === from.id) { campaign.from = null; campaign.to = null; return; } if (from.n.includes(target.id)) campaign.to = target.id; else if (target.owner === "player" && troopCount(target.t) > 1) { campaign.from = target.id; campaign.to = null; prepareDraft(); } else log("Choose an adjacent target territory."); }
function updateOrder() { if (!campaign?.from) { order.dataset.on = "false"; return; } const from = cell(campaign.from), to = cell(campaign.to); order.dataset.on = "true"; order.innerHTML = `<div class="cc-title">Move Troops</div><div class="cc-line">${from.id}${to ? ` to ${to.id}` : " · choose adjacent territory"}</div>${[["l","Light"],["m","Medium"],["h","Heavy"]].map(([k,l]) => `<div class="cc-row"><span>${l}</span><button class="cc-tiny" data-d="${k}">−</button><b>${campaign.draft[k]}</b><button class="cc-tiny" data-i="${k}">+</button></div>`).join("")}<div class="cc-actions" style="margin-top:10px"><button class="cc-btn" id="cc-move" ${!to || campaign.actions <= 0 || troopCount(campaign.draft) <= 0 ? "disabled" : ""}>Move</button><button class="cc-btn" id="cc-cancel">Cancel</button></div>`; }
function onOrderClick(event) { if (!campaign) return; const inc = event.target.closest("[data-i]"); const dec = event.target.closest("[data-d]"); if (inc) { const from = cell(campaign.from); const k = inc.dataset.i; campaign.draft[k] = Math.min(from.t[k], campaign.draft[k] + 1); return; } if (dec) { const k = dec.dataset.d; campaign.draft[k] = Math.max(0, campaign.draft[k] - 1); return; } if (event.target.closest("#cc-cancel")) { campaign.from = null; campaign.to = null; return; } if (event.target.closest("#cc-move")) moveDraft(); }
function resolve(owner, from, to, draft) { subTroops(from.t, draft); if (!to.owner || to.owner === owner) { to.owner = owner; addTroops(to.t, draft); return `${owner === "player" ? "Rome" : owner} occupied ${to.id}.`; } const attack = strength(draft), defend = strength(to.t); if (attack > defend) { to.owner = owner; to.t = { l: Math.max(1, draft.l - Math.ceil(defend / 3)), m: Math.max(0, draft.m - Math.ceil(defend / 6)), h: Math.max(0, draft.h - Math.ceil(defend / 9)) }; return `${owner === "player" ? "Rome" : owner} captured ${to.id}.`; } to.t = { l: Math.max(0, to.t.l - Math.ceil(attack / 3)), m: Math.max(0, to.t.m - Math.ceil(attack / 6)), h: Math.max(0, to.t.h - Math.ceil(attack / 9)) }; return `${owner === "player" ? "Rome" : owner} was stopped at ${to.id}.`; }
function moveDraft() { const from = cell(campaign.from), to = cell(campaign.to), draft = { ...campaign.draft }; if (!from || !to || !from.n.includes(to.id) || campaign.actions <= 0 || troopCount(draft) <= 0) return; log(resolve("player", from, to, draft)); campaign.actions -= 1; campaign.from = null; campaign.to = null; checkEnd(); }
function spawn(owner) { for (const territory of owned(owner)) territory.t[BIOMES[territory.biome].spawn] += 1; }
function aiStep() { for (let i = 1; i <= campaign.preset.rivals; i += 1) { const owner = `ai${i}`; const from = owned(owner).filter((entry) => troopCount(entry.t) > 2 && entry.n.some((id) => cell(id)?.owner !== owner)).sort((a, b) => strength(b.t) - strength(a.t))[0]; if (!from) continue; const to = from.n.map(cell).filter((entry) => entry.owner !== owner).sort((a, b) => (a.owner ? 1 : 0) - (b.owner ? 1 : 0) || strength(a.t) - strength(b.t))[0]; if (!to) continue; const draft = { l: Math.floor(from.t.l * .55), m: Math.floor(from.t.m * .55), h: Math.floor(from.t.h * .55) }; if (troopCount(draft)) log(resolve(owner, from, to, draft)); } }
function endTurn() { if (!campaign || campaign.over) return; spawn("player"); for (let i = 1; i <= campaign.preset.rivals; i += 1) spawn(`ai${i}`); aiStep(); campaign.turn += 1; campaign.actions = campaign.preset.actions; campaign.from = null; campaign.to = null; log("World actions refreshed. New troops spawned at owned territories."); checkEnd(); }
function concede() { if (!campaign) return; if (owned("player").length > 3) { log("Concede blocked: Rome controls more than three territories."); return; } campaign.over = "conceded"; log("Rome conceded the campaign."); }
function checkEnd() { if (campaign.cells.every((entry) => entry.owner)) { campaign.over = "complete"; log("All zones are claimed. Campaign resolved."); } }
function updateHud() { if (!campaign) return; const total = owned("player").reduce((acc, entry) => { addTroops(acc, entry.t); return acc; }, { l: 0, m: 0, h: 0 }); root.querySelector("#cc-stats").textContent = `Turn ${campaign.turn} · ${owned("player").length}/${campaign.cells.length} territories · ${campaign.actions} world actions`; root.querySelector("#cc-troops").textContent = `Rome L/M/H ${total.l}/${total.m}/${total.h}`; root.querySelector("#cc-log").innerHTML = campaign.log.map((entry) => `<div>${entry}</div>`).join(""); root.querySelector("#cc-concede").disabled = owned("player").length > 3 || Boolean(campaign.over); root.querySelector("#cc-end").disabled = Boolean(campaign.over); updateOrder(); }
function patchHost() { const host = globalThis.GameHost; if (!host || patched) return false; const original = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({}); host.getSnapshot = () => ({ ...original(), campaignMap: campaign ? { style: CAMPAIGN_STYLE, size: campaign.sizeId, territories: campaign.cells.length, playerTerritories: owned("player").length, turn: campaign.turn, actions: campaign.actions, over: campaign.over } : { style: CAMPAIGN_STYLE, choosingSize: true } }); host.getCampaignMapSnapshot = () => campaign; patched = true; return true; }
function frame() { install(); const active = pageActive(); root.dataset.on = active ? "true" : "false"; setBaseVisibility(active); if (active) { if (!campaign) { chooser.style.display = "block"; hud.dataset.on = "false"; order.dataset.on = "false"; } else { chooser.style.display = "none"; hud.dataset.on = "true"; } draw(); updateHud(); } requestAnimationFrame(frame); }
function boot() { install(); globalThis.CavalryCampaignMap = { style: CAMPAIGN_STYLE, start, presets: SIZE_PRESETS, getState: () => campaign }; const timer = setInterval(() => { if (patchHost()) clearInterval(timer); }, 100); requestAnimationFrame(frame); }
boot();
