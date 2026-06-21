import { apps, tabs, galleryConfig, getFeaturedGame } from "./nexus-gallery-data.js?v=main-app-gallery";
import { startNexusGalleryShader } from "./nexus-gallery-shader.js";

const STYLE_ID = "nexus-experiments-shell-style";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tabItems(tabId) {
  return apps.filter((app) => app.tab === tabId);
}

function firstTabId() {
  return tabs.find((tab) => tab.id === "experiments")?.id ?? tabs[0]?.id ?? "experiments";
}

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { color-scheme:dark; --text:#f4f7f8; --muted:#a9b5bb; --line:rgba(236,242,245,.18); --blue:#83d8ff; --gold:#ffe36d; --green:#6bf0b8; --red:#ff8b7b; --card:clamp(300px,29vw,380px); --selected-scale:1.13; }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; background:#030404; color:var(--text); font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
    a { color:inherit; }
    .nexus-gallery-background { position:fixed; inset:0; z-index:0; width:100vw; height:100vh; display:block; pointer-events:none; background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404); }
    .nexus-gallery-background.is-fallback { background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404); }
    .nexus-shell { position:relative; z-index:1; width:min(100% - 28px,1680px); min-height:100svh; margin:0 auto; padding:22px 0 26px; display:grid; grid-template-rows:auto auto auto minmax(0,1fr); gap:14px; }
    .nexus-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 18px; border:1px solid var(--line); border-radius:22px; background:linear-gradient(180deg,rgba(18,22,24,.76),rgba(5,7,8,.54)); box-shadow:0 24px 80px rgba(0,0,0,.42); backdrop-filter:blur(18px); }
    .nexus-brand strong { display:block; color:var(--gold); font-size:1.08rem; font-weight:950; letter-spacing:.18em; text-transform:uppercase; }
    .nexus-brand span { display:block; margin-top:3px; color:var(--muted); font-size:.88rem; }
    .nexus-top-actions,.nexus-gallery-controls,.nexus-tabs { display:flex; align-items:center; gap:8px; }
    .nexus-repo-button,.nexus-launch-button,.nexus-scroll-button,.nexus-tab { border:1px solid rgba(255,227,109,.56); border-radius:999px; color:var(--gold); background:rgba(255,227,109,.06); font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; box-shadow:0 14px 34px rgba(0,0,0,.22); cursor:pointer; }
    .nexus-repo-button,.nexus-launch-button,.nexus-tab { padding:10px 16px; font-size:.78rem; }
    .nexus-launch-button { color:#07110d; background:linear-gradient(90deg,#ffe36d,#6bf0b8); }
    .nexus-tabs { overflow-x:auto; padding:2px; }
    .nexus-tab { color:rgba(244,247,248,.76); border-color:rgba(236,242,245,.18); background:rgba(236,242,245,.05); white-space:nowrap; }
    .nexus-tab.is-active { color:#07110d; border-color:rgba(255,227,109,.78); background:linear-gradient(90deg,#ffe36d,#6bf0b8); }
    .nexus-tab-count { opacity:.74; margin-left:4px; }
    .nexus-gallery-help { display:flex; align-items:center; justify-content:space-between; gap:16px; color:rgba(234,246,255,.68); font-size:.86rem; padding:0 2px; }
    .nexus-count { color:var(--gold); font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    .nexus-selected-title { color:rgba(244,247,248,.9); font-weight:800; }
    .nexus-scroll-button { width:42px; height:38px; display:grid; place-items:center; font-size:1.05rem; }
    .nexus-scroll-button:disabled { opacity:.35; cursor:default; }
    .nexus-gallery-row { width:100%; min-height:min(70svh,740px); display:flex; align-items:center; gap:clamp(18px,2.2vw,30px); overflow-x:auto; overflow-y:hidden; padding:36px max(24px,calc(50vw - var(--card) / 2)) 44px; scroll-snap-type:x mandatory; scroll-behavior:smooth; cursor:grab; touch-action:pan-x; }
    .nexus-gallery-row.is-dragging { cursor:grabbing; scroll-snap-type:none; }
    .nexus-game-tile { flex:0 0 var(--card); width:var(--card); aspect-ratio:4/5; min-height:430px; display:flex; flex-direction:column; scroll-snap-align:center; overflow:hidden; border-left:1px solid rgba(236,242,245,.22); border-right:1px solid rgba(236,242,245,.22); color:inherit; text-align:left; background:linear-gradient(180deg,rgba(20,25,27,.76),rgba(4,6,7,.74)); transform:translateY(0) scale(.93); transform-origin:center center; transition:transform 190ms ease,border-color 190ms ease,box-shadow 190ms ease,filter 190ms ease; backdrop-filter:blur(18px); filter:saturate(.86) brightness(.82); cursor:pointer; user-select:none; }
    .nexus-game-tile.is-selected { border-left-color:rgba(255,227,109,.86); border-right-color:rgba(255,227,109,.86); box-shadow:0 52px 140px rgba(0,0,0,.62),0 0 94px rgba(255,227,109,.18); transform:translateY(-18px) scale(var(--selected-scale)); filter:saturate(1.08) brightness(1.04); z-index:3; }
    .nexus-game-art { flex:0 0 39%; position:relative; overflow:hidden; background:linear-gradient(135deg,#101315,#050606); }
    .is-selected .nexus-game-art { flex-basis:43%; }
    .nexus-game-art::before { position:absolute; inset:0; content:""; background:radial-gradient(circle at 50% 30%,rgba(255,227,109,.8),transparent 28px),linear-gradient(135deg,#101315,#050606); }
    .nexus-game-art.sora::before { background:radial-gradient(circle at 70% 26%,rgba(255,227,109,.95) 0 13px,transparent 15px),linear-gradient(145deg,#0b2b52,#5ca7e8 52%,#0a1525); }
    .nexus-game-art.fogline::before { background:radial-gradient(circle at 48% 38%,rgba(238,248,250,.92) 0 6px,transparent 8px),linear-gradient(135deg,#050606,#1b2022); }
    .nexus-game-art.zombie::before { background:radial-gradient(circle at 45% 54%,rgba(61,240,161,.64),transparent 5rem),linear-gradient(135deg,#0d1c13,#33130f); }
    .nexus-game-art.hell::before { background:radial-gradient(circle at 48% 42%,rgba(255,227,109,.92) 0 8px,transparent 9px),linear-gradient(135deg,#180606,#08121d); }
    .nexus-game-info { padding:20px; display:flex; flex-direction:column; gap:13px; flex:1; min-height:0; }
    .nexus-tags { display:flex; flex-wrap:wrap; gap:7px; }
    .nexus-tag { border:1px solid rgba(130,216,255,.22); border-radius:999px; padding:6px 9px; color:var(--blue); background:rgba(130,216,255,.06); font-size:.72rem; font-weight:900; text-transform:uppercase; }
    .nexus-tag.gold { color:var(--gold); border-color:rgba(255,227,109,.32); }
    .nexus-tag.green { color:var(--green); border-color:rgba(105,240,184,.25); }
    .nexus-tag.red { color:var(--red); border-color:rgba(255,139,123,.34); }
    .nexus-game-tile h2 { margin:0; font-size:clamp(1.25rem,1.8vw,1.58rem); line-height:1.05; }
    .nexus-game-tile.is-selected h2 { font-size:clamp(1.75rem,2.5vw,2.35rem); }
    .nexus-game-tile p { margin:0; color:var(--muted); line-height:1.5; flex:1; overflow:hidden; }
    .nexus-play { color:var(--gold); font-weight:950; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem; }
    .nexus-game-tile.is-selected .nexus-play::before { content:"Selected · "; color:var(--green); }
    @media (max-width:760px) { :root { --selected-scale:1.04; } .nexus-shell { width:min(100% - 20px,1680px); } .nexus-topbar,.nexus-gallery-help { align-items:flex-start; flex-direction:column; } .nexus-game-tile { flex-basis:82vw; width:82vw; transform:translateY(0) scale(.97); } .nexus-game-tile.is-selected { transform:translateY(-6px) scale(var(--selected-scale)); } }
  `;
  documentRef.head.append(style);
}

function renderTag(tag) {
  return `<span class="nexus-tag ${escapeHtml(tag.tone ?? "blue")}">${escapeHtml(tag.label)}</span>`;
}

function renderTile(app, selectedId) {
  const selected = app.id === selectedId ? " is-selected" : "";
  return `<article class="nexus-game-tile${selected}" role="button" tabindex="0" aria-current="${app.id === selectedId ? "true" : "false"}" aria-label="Select ${escapeHtml(app.title)}" data-app-id="${escapeHtml(app.id)}"><div class="nexus-game-art ${escapeHtml(app.visual)}" aria-hidden="true"></div><div class="nexus-game-info"><div class="nexus-tags">${app.tags.map(renderTag).join("")}</div><h2>${escapeHtml(app.title)}</h2><p>${escapeHtml(app.description)}</p><span class="nexus-play">${escapeHtml(app.playLabel)} →</span></div></article>`;
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}">${escapeHtml(tab.label)}<span class="nexus-tab-count">${tab.count}</span></button>`).join("");
}

function renderShell(root, activeTabId = firstTabId()) {
  const items = tabItems(activeTabId);
  const selected = getFeaturedGame(activeTabId) ?? items[0] ?? apps[0];
  root.innerHTML = `<canvas class="nexus-gallery-background" aria-hidden="true"></canvas><section class="nexus-shell" aria-label="NexusRealtime applications gallery"><header class="nexus-topbar" aria-label="Applications navigation"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title)}</strong><span>${escapeHtml(galleryConfig.subtitle)}</span></div><div class="nexus-top-actions"><a class="nexus-launch-button" href="${escapeHtml(selected?.route ?? "#")}" target="_blank" rel="noopener" data-launch-selected>Launch selected</a><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Open repo</a></div></header><nav class="nexus-tabs" aria-label="Application type tabs">${renderTabs(activeTabId)}</nav><section class="nexus-gallery-help" aria-label="Gallery controls"><span>${escapeHtml(galleryConfig.hint)} <span class="nexus-selected-title"></span></span><div class="nexus-gallery-controls"><button class="nexus-scroll-button" type="button" data-scroll="previous" aria-label="Previous route">‹</button><span class="nexus-count" aria-live="polite">1 / ${items.length}</span><button class="nexus-scroll-button" type="button" data-scroll="next" aria-label="Next route">›</button></div></section><section class="nexus-gallery-row" aria-label="${escapeHtml(tabs.find((tab) => tab.id === activeTabId)?.label ?? "Routes")}" tabindex="0">${items.map((app) => renderTile(app, selected?.id)).join("")}</section></section>`;
  return { activeTabId, row: root.querySelector(".nexus-gallery-row"), count: root.querySelector(".nexus-count"), selectedTitle: root.querySelector(".nexus-selected-title"), launch: root.querySelector("[data-launch-selected]"), previous: root.querySelector('[data-scroll="previous"]'), next: root.querySelector('[data-scroll="next"]'), tiles: Array.from(root.querySelectorAll(".nexus-game-tile")), tabButtons: Array.from(root.querySelectorAll(".nexus-tab")) };
}

function getNearestTile(row, tiles) {
  const center = row.scrollLeft + row.clientWidth / 2;
  let nearest = tiles[0];
  let best = Infinity;
  for (const tile of tiles) {
    const tileCenter = tile.offsetLeft + tile.offsetWidth / 2;
    const distance = Math.abs(tileCenter - center);
    if (distance < best) { best = distance; nearest = tile; }
  }
  return nearest;
}

function selectedAppForTile(tile) {
  return apps.find((app) => app.id === tile?.dataset?.appId) ?? apps[0];
}

function centerTile(row, tile, behavior = "smooth") {
  if (!tile) return;
  row.scrollTo({ left: tile.offsetLeft - row.clientWidth / 2 + tile.offsetWidth / 2, behavior });
}

function wireTabs(root, parts) {
  for (const button of parts.tabButtons) {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tabId;
      const nextParts = renderShell(root, tabId);
      wireGallery(root, nextParts);
    });
  }
}

function wireScrolling(parts) {
  const { row, count, selectedTitle, launch, previous, next, tiles } = parts;
  let pointerDown = false;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;
  let selectedTile = tiles.find((tile) => tile.classList.contains("is-selected")) ?? tiles[0];
  let scrollRaf = 0;

  function setSelected(tile, options = {}) {
    if (!tile || tile === selectedTile && !options.force) return;
    selectedTile = tile;
    const selectedApp = selectedAppForTile(tile);
    for (const candidate of tiles) {
      const active = candidate === tile;
      candidate.classList.toggle("is-selected", active);
      candidate.setAttribute("aria-current", String(active));
      candidate.setAttribute("aria-label", `${active ? "Selected" : "Select"} ${selectedAppForTile(candidate).title}`);
    }
    const index = Math.max(0, tiles.indexOf(tile));
    count.textContent = `${index + 1} / ${tiles.length}`;
    selectedTitle.textContent = `Selected: ${selectedApp.title}`;
    launch.href = selectedApp.route;
    launch.setAttribute("aria-label", `Launch ${selectedApp.title} in a new tab`);
    previous.disabled = index <= 0;
    next.disabled = index >= tiles.length - 1;
  }

  function updateFromScroll() { scrollRaf = 0; setSelected(getNearestTile(row, tiles)); }
  function scheduleScrollUpdate() { if (!scrollRaf) scrollRaf = requestAnimationFrame(updateFromScroll); }
  function scrollToIndex(index, behavior = "smooth") { const tile = tiles[Math.max(0, Math.min(tiles.length - 1, index))]; setSelected(tile); centerTile(row, tile, behavior); }
  function scrollByCard(direction) { scrollToIndex(Math.max(0, tiles.indexOf(selectedTile)) + direction); }

  previous.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
  row.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  row.addEventListener("pointerdown", (event) => { pointerDown = true; dragged = false; startX = event.clientX; startScroll = row.scrollLeft; row.classList.add("is-dragging"); row.setPointerCapture?.(event.pointerId); });
  row.addEventListener("pointermove", (event) => { if (!pointerDown) return; const delta = event.clientX - startX; if (Math.abs(delta) > 4) dragged = true; row.scrollLeft = startScroll - delta; });
  row.addEventListener("pointerup", (event) => { pointerDown = false; row.classList.remove("is-dragging"); row.releasePointerCapture?.(event.pointerId); if (!dragged) { const tile = event.target.closest?.(".nexus-game-tile"); if (tile) setSelected(tile); } centerTile(row, selectedTile); });
  row.addEventListener("keydown", (event) => { if (event.key === "ArrowLeft") { event.preventDefault(); scrollByCard(-1); } if (event.key === "ArrowRight") { event.preventDefault(); scrollByCard(1); } if (event.key === "Enter") { selectedTile?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); } });
  for (const tile of tiles) {
    tile.addEventListener("focus", () => setSelected(tile));
    tile.addEventListener("dblclick", () => { const app = selectedAppForTile(tile); globalThis.open(app.route, "_blank", "noopener"); });
  }
  setSelected(selectedTile, { force: true });
  centerTile(row, selectedTile, "auto");
}

function wireGallery(root, parts) {
  wireTabs(root, parts);
  wireScrolling(parts);
}

function boot() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root.");
  injectStyles(document);
  const parts = renderShell(root, firstTabId());
  wireGallery(root, parts);
  const canvas = root.querySelector(".nexus-gallery-background");
  try { startNexusGalleryShader(canvas); } catch { canvas?.classList.add("is-fallback"); }
}

boot();
