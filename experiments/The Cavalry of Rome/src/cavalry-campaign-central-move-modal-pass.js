const STYLE = "cavalry-campaign-central-move-modal-024";
const count = (t = {}) => (t.l || 0) + (t.m || 0) + (t.h || 0);
const label = (t = {}) => `${t.l || 0}/${t.m || 0}/${t.h || 0}`;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
let root, body;
function game() { return globalThis.CavalryCampaignMap?.getState?.() || null; }
function terr(id) { return game()?.cells?.find((x) => x.id === id) || null; }
function power(t = {}) { return (t.l || 0) + (t.m || 0) * 2 + (t.h || 0) * 3; }
function ownerName(o) { return !o ? "Neutral" : o === "player" ? "Rome" : `Empire ${o.replace("ai", "")}`; }
function orderName(t) { return !t?.owner ? "Occupy" : t.owner === "player" ? "Reinforce" : "Engage"; }
function reserve(src, d) {
  if (!src) return { l: 0, m: 0, h: 0 };
  const n = { l: clamp(d.l || 0, 0, src.troops.l || 0), m: clamp(d.m || 0, 0, src.troops.m || 0), h: clamp(d.h || 0, 0, src.troops.h || 0) };
  if (count(n) >= count(src.troops)) { if (n.l) n.l -= 1; else if (n.m) n.m -= 1; else if (n.h) n.h -= 1; }
  return n;
}
function setDraft(d) { const s = game(), src = terr(s?.from); if (s && src) s.draft = reserve(src, d); }
function setSource(id) { const s = game(), src = terr(id); if (!s || !src || src.owner !== "player" || count(src.troops) <= 1) return; s.from = id; s.to = null; s.draft = reserve(src, src.troops); }
function setTarget(id) { const s = game(), src = terr(s?.from), dst = terr(id); if (!s || !src || !dst || !src.neighbors.includes(id)) return; s.to = id; if (!s.draft || count(s.draft) === 0) s.draft = reserve(src, src.troops); }
function cancel() { const s = game(); if (!s) return; s.from = null; s.to = null; s.draft = { l: 0, m: 0, h: 0 }; }
function confirm() { document.querySelector("#cc-move")?.click(); }
function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `#cavalry-campaign-3d .cc-order,.move-ux-planner,.move-ux-guide{display:none!important;opacity:0!important;pointer-events:none!important}.move-modal-root{position:fixed;inset:0;z-index:150;display:none;pointer-events:none;color:#fff6e3;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 10px #000}.move-modal-root[data-on=true]{display:block}.move-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,calc(100vw - 28px));max-height:min(760px,calc(100vh - 70px));overflow:auto;pointer-events:auto;border:1px solid rgba(255,222,150,.35);border-radius:24px;background:linear-gradient(145deg,rgba(26,17,9,.97),rgba(7,7,5,.93));box-shadow:0 28px 90px #000b;backdrop-filter:blur(18px);padding:18px}.move-modal h2{margin:0;font-size:22px;text-transform:uppercase;letter-spacing:.05em}.sub{margin-top:5px;color:#ffecc8bf;font-weight:740;font-size:13px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.card,.btn,.chip{border:1px solid rgba(255,222,150,.25);border-radius:14px;background:rgba(255,236,170,.08);color:#fff6e3;font-weight:900;cursor:pointer}.card{padding:11px;text-align:left}.card[data-active=true]{border-color:#ffe19a;box-shadow:0 0 0 2px rgba(255,225,120,.16)}.k{display:block;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#ffe19a}.main{display:flex;justify-content:space-between;gap:12px;margin-top:3px}.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.btn,.chip{padding:10px 12px}.btn:disabled{opacity:.35;cursor:not-allowed}.row{display:grid;grid-template-columns:1fr 36px 48px 36px;gap:8px;align-items:center;margin-top:10px}.tiny{width:36px;height:34px;border-radius:10px;border:1px solid rgba(255,222,150,.25);background:rgba(255,255,255,.10);color:#fff6e3;font-weight:950;cursor:pointer}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.summary>div{border:1px solid rgba(255,222,150,.18);border-radius:14px;padding:10px;background:rgba(0,0,0,.18)}`;
  document.head.append(style);
  root = document.createElement("section");
  root.className = "move-modal-root";
  root.innerHTML = `<div class="move-modal"><div id="move-modal-body"></div></div>`;
  document.body.append(root);
  body = root.querySelector("#move-modal-body");
  root.addEventListener("click", onClick);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") cancel(); });
}
function renderSources(s) {
  const sources = s.cells.filter((x) => x.owner === "player" && count(x.troops) > 1).sort((a, b) => power(b.troops) - power(a.troops));
  return `<h2>Move Troops</h2><div class="sub">Step 1 of 3: choose a Rome source territory. One unit stays behind.</div><div class="grid">${sources.map((x) => `<button class="card" data-src="${x.id}"><span class="k">Rome source · power ${power(x.troops)}</span><span class="main"><b>${x.id}</b><span>L/M/H ${label(x.troops)}</span></span></button>`).join("")}</div>`;
}
function renderTargets(s, src) {
  const targets = src.neighbors.map(terr).filter(Boolean);
  return `<h2>Choose Destination</h2><div class="sub">Step 2 of 3: source <b>${src.id}</b> has L/M/H ${label(src.troops)}.</div><div class="grid">${targets.map((x) => `<button class="card" data-dst="${x.id}" data-active="${s.to === x.id}"><span class="k">${orderName(x)} · ${ownerName(x.owner)} · power ${power(x.troops)}</span><span class="main"><b>${x.id}</b><span>L/M/H ${label(x.troops)}</span></span></button>`).join("")}</div><div class="actions"><button class="btn" data-cancel>Cancel</button><button class="btn" data-source-back>Change source</button></div>`;
}
function renderDraft(s, src, dst) {
  const d = reserve(src, s.draft || {}); s.draft = d;
  return `<h2>${orderName(dst)} ${dst.id}</h2><div class="sub">Step 3 of 3: choose unit mix and confirm.</div><div class="summary"><div><span class="k">Source</span><b>${src.id}</b><div>L/M/H ${label(src.troops)}</div></div><div><span class="k">Draft</span><b>${label(d)}</b><div>Power ${power(d)}</div></div><div><span class="k">Target</span><b>${ownerName(dst.owner)}</b><div>Power ${power(dst.troops)}</div></div></div><div class="actions"><button class="chip" data-preset="all">All movable</button><button class="chip" data-preset="half">Half</button><button class="chip" data-preset="light">Light scout</button><button class="chip" data-preset="heavy">Heavy push</button><button class="chip" data-preset="clear">Clear</button></div>${[["l","Light"],["m","Medium"],["h","Heavy"]].map(([k,n]) => `<div class="row"><span>${n}</span><button class="tiny" data-dec="${k}">−</button><b>${d[k] || 0}</b><button class="tiny" data-inc="${k}">+</button></div>`).join("")}<div class="actions"><button class="btn" data-target-back>Back</button><button class="btn" data-cancel>Cancel</button><button class="btn" data-confirm ${count(d) <= 0 ? "disabled" : ""}>Confirm ${orderName(dst)}</button></div>`;
}
function render() {
  install();
  const s = game();
  if (!s?.cells?.length) { root.dataset.on = "false"; return; }
  root.dataset.on = "true";
  const src = terr(s.from), dst = terr(s.to);
  body.innerHTML = !src ? renderSources(s) : !dst ? renderTargets(s, src) : renderDraft(s, src, dst);
}
function onClick(e) {
  const s = game(); if (!s) return;
  const src = e.target.closest("[data-src]"); if (src) return setSource(src.dataset.src);
  const dst = e.target.closest("[data-dst]"); if (dst) return setTarget(dst.dataset.dst);
  if (e.target.closest("[data-cancel]")) return cancel();
  if (e.target.closest("[data-source-back]")) { s.from = null; s.to = null; return; }
  if (e.target.closest("[data-target-back]")) { s.to = null; return; }
  if (e.target.closest("[data-confirm]")) return confirm();
  const source = terr(s.from); if (!source) return;
  const preset = e.target.closest("[data-preset]");
  if (preset) {
    const p = preset.dataset.preset;
    if (p === "all") setDraft(source.troops);
    if (p === "half") setDraft({ l: Math.ceil(source.troops.l / 2), m: Math.ceil(source.troops.m / 2), h: Math.ceil(source.troops.h / 2) });
    if (p === "light") setDraft({ l: source.troops.l, m: 0, h: 0 });
    if (p === "heavy") setDraft({ l: Math.min(2, source.troops.l), m: source.troops.m, h: source.troops.h });
    if (p === "clear") setDraft({ l: 0, m: 0, h: 0 });
    return;
  }
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc || dec) { const key = inc?.dataset.inc || dec?.dataset.dec; setDraft({ ...s.draft, [key]: (s.draft[key] || 0) + (inc ? 1 : -1) }); }
}
function frame() { render(); requestAnimationFrame(frame); }
install();
globalThis.CavalryMoveModal = { style: STYLE, cancel, setSource, setTarget };
requestAnimationFrame(frame);
