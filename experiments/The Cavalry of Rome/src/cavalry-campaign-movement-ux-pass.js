const MOVE_UX_STYLE = "cavalry-campaign-movement-ux-023";
const TAU = Math.PI * 2;
const hash = (x, y, s = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123; return v - Math.floor(v); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const lerp = (a, b, t) => a + (b - a) * t;
const count = (t = {}) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const power = (t = {}) => (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3;
const troopLabel = (t = {}) => `${t.l || 0}/${t.m || 0}/${t.h || 0}`;
function noise(x, y, s = 0) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s); return lerp(lerp(a, b, sx), lerp(c, d, sx), sy) * 2 - 1; }
function fbm(x, y, s = 0) { let v = 0, a = .55, f = 1, n = 0; for (let i = 0; i < 6; i += 1) { v += noise(x * f, y * f, s + i * 31) * a; n += a; a *= .50; f *= 2.07; } return v / Math.max(.001, n); }
function norm3(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function perspective(fovy, aspect, near, far) { const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]); }
function lookAt(eye, target, up = [0, 1, 0]) { const z = norm3([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]), x = norm3(cross(up, z)), y = cross(z, x); return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]); }
function mul4(a, b) { const out = new Float32Array(16); for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return out; }
function project(m, x, y, z, size) { const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15]; if (cw <= 0.001) return null; return { x: (cx / cw * .5 + .5) * size.w, y: (1 - (cy / cw * .5 + .5)) * size.h, w: cw }; }
function riverMask(x, z, p, t = 0) { const main = p.worldH * (.42 + Math.sin(x / p.worldW * 6.2 + t * .04) * .10 + fbm(x * .002, z * .002, 90) * .08); const branch = p.worldH * (.68 + Math.cos(x / p.worldW * 4.4 - 1.2) * .08); return Math.max(Math.exp(-Math.pow(Math.abs(z - main) / (p.worldH * .035), 2)), Math.exp(-Math.pow(Math.abs(z - branch) / (p.worldH * .026), 2)) * .72); }
function heightAt(x, z, p) { const nx = x / p.worldW, nz = z / p.worldH, ridge = fbm(nx * 8.0, nz * 7.0, 200), large = fbm(nx * 3.0, nz * 2.6, 210), fine = fbm(nx * 26.0, nz * 23.0, 250), river = riverMask(x, z, p); return large * 52 + Math.max(0, ridge - .18) * 125 + fine * 11 - river * 54; }
let root, canvas, ctx, planner, guide;
function state() { return globalThis.CavalryCampaignMap?.getState?.() || null; }
function territory(id) { return state()?.cells?.find((cell) => cell.id === id) || null; }
function ownerText(owner) { if (!owner) return "Neutral"; return owner === "player" ? "Rome" : `Empire ${owner.replace("ai", "")}`; }
function statusText(s) { if (!s) return "Choose a campaign size."; if (!s.from) return "Select a Rome territory with troops."; if (!s.to) return "Choose one highlighted neighboring territory."; return "Choose unit mix, then confirm movement."; }
function reserveAdjusted(source, draft) { const next = { l: clamp(Math.floor(draft.l || 0), 0, source.troops.l || 0), m: clamp(Math.floor(draft.m || 0), 0, source.troops.m || 0), h: clamp(Math.floor(draft.h || 0), 0, source.troops.h || 0) }; if (count(next) >= count(source.troops)) { if (next.l > 0) next.l -= 1; else if (next.m > 0) next.m -= 1; else if (next.h > 0) next.h -= 1; } return next; }
function setDraft(source, draft) { if (!source) return; const next = reserveAdjusted(source, draft); const s = state(); s.draft.l = next.l; s.draft.m = next.m; s.draft.h = next.h; }
function allMovable(source) { return reserveAdjusted(source, { ...source.troops }); }
function halfMovable(source) { return reserveAdjusted(source, { l: Math.ceil((source.troops.l || 0) / 2), m: Math.ceil((source.troops.m || 0) / 2), h: Math.ceil((source.troops.h || 0) / 2) }); }
function lightScout(source) { return reserveAdjusted(source, { l: source.troops.l || 0, m: 0, h: 0 }); }
function heavyPush(source) { return reserveAdjusted(source, { l: Math.min(2, source.troops.l || 0), m: source.troops.m || 0, h: source.troops.h || 0 }); }
function chooseSource(id) { const s = state(), src = s?.cells?.find((cell) => cell.id === id); if (!s || !src || src.owner !== "player" || count(src.troops) <= 1) return; s.from = src.id; s.to = null; setDraft(src, allMovable(src)); }
function chooseTarget(id) { const s = state(), src = territory(s?.from), target = territory(id); if (!s || !src || !target || !src.neighbors.includes(target.id)) return; if (s.to === target.id && count(s.draft) > 0) confirmMove(); else s.to = target.id; }
function cancelMove() { const s = state(); if (!s) return; s.from = null; s.to = null; s.draft = { l: 0, m: 0, h: 0 }; }
function confirmMove() { const s = state(); if (!s?.from || !s?.to || count(s.draft) <= 0) return; requestAnimationFrame(() => document.querySelector("#cc-move")?.click()); }
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `#cavalry-campaign-3d .cc-order{position:fixed!important;right:-9999px!important;opacity:0!important;pointer-events:none!important}.move-ux-overlay{position:fixed;inset:0;z-index:98;pointer-events:none}.move-ux-planner{position:fixed;right:14px;bottom:14px;z-index:101;width:min(430px,calc(100vw - 28px));display:none;color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000;pointer-events:auto}.move-ux-card{border:1px solid rgba(255,222,150,.32);border-radius:18px;background:rgba(13,9,6,.88);box-shadow:0 18px 62px #0009;backdrop-filter:blur(14px);padding:13px}.move-ux-title{font-weight:950;text-transform:uppercase;letter-spacing:.08em}.move-ux-step{font-size:12px;font-weight:850;color:#ffe19a;margin-top:4px}.move-ux-muted{font-size:12px;color:#ffecc8bf;font-weight:720}.move-ux-row{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:8px;margin-top:8px}.move-ux-btn,.move-ux-chip,.move-ux-target,.move-ux-source{border:1px solid rgba(255,222,150,.24);border-radius:12px;background:rgba(255,236,170,.08);color:#fff6e3;font-weight:900;cursor:pointer}.move-ux-btn{padding:9px 11px}.move-ux-btn:disabled{opacity:.35;cursor:not-allowed;filter:grayscale(.6)}.move-ux-chip{padding:7px 9px;font-size:11px}.move-ux-tiny{width:30px;height:30px;border-radius:9px;border:1px solid rgba(255,222,150,.25);background:rgba(255,255,255,.10);color:#fff6e3;font-weight:950;cursor:pointer}.move-ux-list{display:grid;gap:7px;margin-top:10px;max-height:172px;overflow:auto}.move-ux-source,.move-ux-target{padding:9px 10px;text-align:left}.move-ux-source[data-active=true],.move-ux-target[data-active=true]{border-color:#ffe19a;box-shadow:0 0 0 2px rgba(255,225,120,.16)}.move-ux-kicker{display:block;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#ffe19a}.move-ux-main{display:flex;justify-content:space-between;gap:10px;margin-top:2px}.move-ux-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.move-ux-guide{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:100;padding:9px 12px;border-radius:999px;background:rgba(8,7,5,.72);border:1px solid rgba(255,222,150,.22);color:#ffecc8;font:900 11px/1.2 Inter,system-ui;letter-spacing:.06em;text-transform:uppercase;pointer-events:none}`;
  document.head.append(style);
  canvas = document.createElement("canvas");
  canvas.className = "move-ux-overlay";
  document.body.append(canvas);
  ctx = canvas.getContext("2d");
  planner = document.createElement("section");
  planner.className = "move-ux-planner";
  planner.addEventListener("click", onPlannerClick);
  document.body.append(planner);
  guide = document.createElement("div");
  guide.className = "move-ux-guide";
  document.body.append(guide);
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") cancelMove(); });
}
function resize() { const d = Math.max(1, Math.min(2, devicePixelRatio || 1)), w = Math.floor(canvas.clientWidth * d) || 1, h = Math.floor(canvas.clientHeight * d) || 1; if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } return { w, h }; }
function cameraMatrix(s, size) { const p = s.preset, c = s.camera, eye = [c.x, c.dist * .60, c.z + c.dist * .72], target = [c.x, 0, c.z], view = lookAt(eye, target), proj = perspective(42 * Math.PI / 180, size.w / size.h, 5, Math.max(p.worldW, p.worldH) * 5); return mul4(proj, view); }
function worldPoint(s, cell, offset = 26) { const p = s.preset; return [cell.x - p.worldW / 2, heightAt(cell.x, cell.y, p) + offset, cell.y - p.worldH / 2]; }
function projectCell(s, m, cell, size, offset = 26) { return project(m, ...worldPoint(s, cell, offset), size); }
function drawHalo(x, y, r, color, label) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = .92; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.globalAlpha = .18; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); if (label) { ctx.globalAlpha = 1; ctx.fillStyle = "rgba(5,5,3,.76)"; ctx.beginPath(); ctx.roundRect(x - 42, y - r - 26, 84, 20, 8); ctx.fill(); ctx.fillStyle = "#fff6e3"; ctx.font = "900 10px Inter,system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y - r - 16); } ctx.restore(); }
function drawOverlay() {
  const s = state(), size = resize();
  ctx.clearRect(0, 0, size.w, size.h);
  if (!s?.cells?.length) return;
  const m = cameraMatrix(s, size), source = territory(s.from), target = territory(s.to), t = performance.now() / 1000;
  if (source) {
    const fromPoint = projectCell(s, m, source, size, 34);
    if (fromPoint) drawHalo(fromPoint.x, fromPoint.y, 34 + Math.sin(t * 4) * 2, "#ffe19a", "SOURCE");
    for (const id of source.neighbors) {
      const neighbor = territory(id), point = neighbor && projectCell(s, m, neighbor, size, 30);
      if (!point) continue;
      const isTarget = target?.id === neighbor.id;
      drawHalo(point.x, point.y, isTarget ? 37 : 27 + Math.sin(t * 3 + neighbor.x * .01) * 2, isTarget ? "#ffeb91" : neighbor.owner && neighbor.owner !== "player" ? "#ff765d" : "#aeea7a", isTarget ? "TARGET" : neighbor.owner && neighbor.owner !== "player" ? "ENGAGE" : "MOVE");
    }
    if (fromPoint && target) {
      const toPoint = projectCell(s, m, target, size, 34);
      if (toPoint) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,225,120,.92)";
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#ffe19a";
        const a = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
        ctx.translate(toPoint.x, toPoint.y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -8); ctx.lineTo(-16, 8); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }
}
function sourceList(s) { return s.cells.filter((cell) => cell.owner === "player" && count(cell.troops) > 1).sort((a, b) => b.troops.h - a.troops.h || power(b.troops) - power(a.troops)); }
function targetList(s, src) { return src ? src.neighbors.map(territory).filter(Boolean).sort((a, b) => (a.owner === "player") - (b.owner === "player") || power(a.troops) - power(b.troops)) : []; }
function renderPlanner() {
  const s = state();
  guide.textContent = statusText(s);
  if (!s?.cells?.length) { planner.style.display = "none"; return; }
  planner.style.display = "block";
  const src = territory(s.from), target = territory(s.to), activeDraft = s.draft || { l: 0, m: 0, h: 0 };
  if (!src) {
    const sources = sourceList(s).slice(0, 7);
    planner.innerHTML = `<div class="move-ux-card"><div class="move-ux-title">Move Troops</div><div class="move-ux-step">1 · Choose a source territory</div><div class="move-ux-muted">Select a Rome territory that has more than one unit. One unit remains behind automatically.</div><div class="move-ux-list">${sources.map((cell) => `<button class="move-ux-source" data-source="${cell.id}"><span class="move-ux-kicker">Rome territory</span><span class="move-ux-main"><b>${cell.id}</b><span>L/M/H ${troopLabel(cell.troops)}</span></span></button>`).join("")}</div></div>`;
    return;
  }
  const targets = targetList(s, src);
  const targetMarkup = targets.map((cell) => `<button class="move-ux-target" data-target="${cell.id}" data-active="${cell.id === s.to}"><span class="move-ux-kicker">${ownerText(cell.owner)} · power ${power(cell.troops)}</span><span class="move-ux-main"><b>${cell.id}</b><span>${cell.owner && cell.owner !== "player" ? "Engage" : cell.owner === "player" ? "Reinforce" : "Occupy"} · ${troopLabel(cell.troops)}</span></span></button>`).join("");
  planner.innerHTML = `<div class="move-ux-card"><div class="move-ux-title">Move Troops</div><div class="move-ux-step">${target ? "3 · Confirm movement" : "2 · Choose destination"}</div><div class="move-ux-muted">From <b>${src.id}</b> · Source L/M/H ${troopLabel(src.troops)}${target ? ` → <b>${target.id}</b> (${ownerText(target.owner)})` : ""}</div><div class="move-ux-list">${targetMarkup}</div><div class="move-ux-actions"><button class="move-ux-chip" data-preset="all">All movable</button><button class="move-ux-chip" data-preset="half">Half</button><button class="move-ux-chip" data-preset="scout">Light scout</button><button class="move-ux-chip" data-preset="heavy">Heavy push</button><button class="move-ux-chip" data-preset="clear">Clear</button></div>${[["l","Light"],["m","Medium"],["h","Heavy"]].map(([k,l]) => `<div class="move-ux-row"><span>${l}</span><button class="move-ux-tiny" data-dec="${k}">−</button><b>${activeDraft[k] || 0}</b><button class="move-ux-tiny" data-inc="${k}">+</button></div>`).join("")}<div class="move-ux-actions"><button class="move-ux-btn" data-confirm ${!target || count(activeDraft) <= 0 ? "disabled" : ""}>${target?.owner && target.owner !== "player" ? "Engage" : "Confirm Move"}</button><button class="move-ux-btn" data-cancel>Cancel</button></div></div>`;
}
function onPlannerClick(event) {
  const s = state();
  if (!s) return;
  const source = event.target.closest("[data-source]"); if (source) { chooseSource(source.dataset.source); return; }
  const target = event.target.closest("[data-target]"); if (target) { chooseTarget(target.dataset.target); return; }
  const cancel = event.target.closest("[data-cancel]"); if (cancel) { cancelMove(); return; }
  const confirm = event.target.closest("[data-confirm]"); if (confirm) { confirmMove(); return; }
  const src = territory(s.from);
  const preset = event.target.closest("[data-preset]");
  if (preset && src) {
    const p = preset.dataset.preset;
    if (p === "all") setDraft(src, allMovable(src));
    if (p === "half") setDraft(src, halfMovable(src));
    if (p === "scout") setDraft(src, lightScout(src));
    if (p === "heavy") setDraft(src, heavyPush(src));
    if (p === "clear") setDraft(src, { l: 0, m: 0, h: 0 });
    return;
  }
  const inc = event.target.closest("[data-inc]"), dec = event.target.closest("[data-dec]");
  if ((inc || dec) && src) {
    const k = (inc || dec).dataset.inc || (inc || dec).dataset.dec;
    const delta = inc ? 1 : -1;
    setDraft(src, { ...s.draft, [k]: (s.draft[k] || 0) + delta });
  }
}
function frame() { install(); drawOverlay(); renderPlanner(); requestAnimationFrame(frame); }
install();
globalThis.CavalryCampaignMovementUX = { style: MOVE_UX_STYLE, cancelMove, chooseSource, chooseTarget, confirmMove };
requestAnimationFrame(frame);
