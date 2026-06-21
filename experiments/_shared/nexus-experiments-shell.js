import { apps, tabs, galleryConfig } from "./nexus-gallery-data.js?v=main-app-grid";
import { startNexusGalleryShader } from "./nexus-gallery-shader.js";

const STYLE_ID = "nexus-experiments-shell-style";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function firstTabId() {
  return tabs.find((tab) => tab.id === "experiments")?.id ?? tabs[0]?.id ?? "experiments";
}

function tabItems(tabId, query = "") {
  const needle = query.trim().toLowerCase();
  return apps.filter((app) => {
    if (app.tab !== tabId) return false;
    if (!needle) return true;
    const haystack = [app.title, app.id, app.description, app.kind, app.subtype, ...(app.tags ?? []).map((tag) => tag.label)].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { color-scheme:dark; --text:#f4f7f8; --muted:#a9b5bb; --line:rgba(236,242,245,.18); --blue:#83d8ff; --gold:#ffe36d; --green:#6bf0b8; --red:#ff8b7b; --card-min:260px; }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; background:#030404; color:var(--text); font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
    body { overflow-y:auto; }
    a { color:inherit; }
    .nexus-gallery-background { position:fixed; inset:0; z-index:0; width:100vw; height:100vh; display:block; pointer-events:none; background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404); }
    .nexus-gallery-background.is-fallback { background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404); }
    .nexus-shell { position:relative; z-index:1; width:min(100% - 28px,1680px); min-height:100svh; margin:0 auto; padding:22px 0 34px; display:flex; flex-direction:column; gap:16px; }
    .nexus-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 18px; border:1px solid var(--line); border-radius:22px; background:linear-gradient(180deg,rgba(18,22,24,.76),rgba(5,7,8,.54)); box-shadow:0 24px 80px rgba(0,0,0,.42); backdrop-filter:blur(18px); }
    .nexus-brand strong { display:block; color:var(--gold); font-size:1.08rem; font-weight:950; letter-spacing:.18em; text-transform:uppercase; }
    .nexus-brand span { display:block; margin-top:3px; color:var(--muted); font-size:.88rem; }
    .nexus-top-actions,.nexus-tabs,.nexus-toolbar { display:flex; align-items:center; gap:8px; }
    .nexus-repo-button,.nexus-tab,.nexus-view-button { border:1px solid rgba(255,227,109,.56); border-radius:999px; color:var(--gold); background:rgba(255,227,109,.06); font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; box-shadow:0 14px 34px rgba(0,0,0,.22); cursor:pointer; }
    .nexus-repo-button,.nexus-tab,.nexus-view-button { padding:10px 16px; font-size:.78rem; }
    .nexus-tabs { overflow-x:auto; padding:2px; }
    .nexus-tab { color:rgba(244,247,248,.76); border-color:rgba(236,242,245,.18); background:rgba(236,242,245,.05); white-space:nowrap; }
    .nexus-tab.is-active { color:#07110d; border-color:rgba(255,227,109,.78); background:linear-gradient(90deg,#ffe36d,#6bf0b8); }
    .nexus-tab-count { opacity:.74; margin-left:4px; }
    .nexus-toolbar { justify-content:space-between; flex-wrap:wrap; padding:12px 2px 2px; color:rgba(234,246,255,.72); }
    .nexus-search { min-width:min(100%,420px); flex:0 1 480px; display:flex; align-items:center; gap:10px; border:1px solid var(--line); border-radius:999px; padding:10px 14px; background:rgba(236,242,245,.06); box-shadow:0 16px 44px rgba(0,0,0,.24); }
    .nexus-search span { color:var(--gold); font-size:.74rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
    .nexus-search-input { width:100%; border:0; outline:0; background:transparent; color:var(--text); font:inherit; }
    .nexus-search-input::placeholder { color:rgba(234,246,255,.4); }
    .nexus-result-count { color:var(--gold); font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    .nexus-tab-heading { margin:0; font-size:clamp(1.55rem,3vw,2.7rem); line-height:1; }
    .nexus-tab-copy { margin:0; color:var(--muted); line-height:1.5; max-width:78ch; }
    .nexus-gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--card-min),1fr)); gap:18px; align-items:stretch; padding:8px 0 24px; }
    .nexus-app-card { min-height:360px; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(236,242,245,.18); border-radius:24px; color:inherit; text-decoration:none; background:linear-gradient(180deg,rgba(20,25,27,.78),rgba(4,6,7,.76)); box-shadow:0 30px 90px rgba(0,0,0,.34); backdrop-filter:blur(18px); transition:transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease,filter 160ms ease; }
    .nexus-app-card:hover,.nexus-app-card:focus-visible { transform:translateY(-5px); border-color:rgba(255,227,109,.72); box-shadow:0 36px 110px rgba(0,0,0,.48),0 0 60px rgba(255,227,109,.14); outline:0; }
    .nexus-app-art { flex:0 0 130px; position:relative; overflow:hidden; background:linear-gradient(135deg,#101315,#050606); }
    .nexus-app-art::before { position:absolute; inset:0; content:""; background:radial-gradient(circle at 50% 30%,rgba(255,227,109,.8),transparent 28px),linear-gradient(135deg,#101315,#050606); }
    .nexus-app-art.sora::before { background:radial-gradient(circle at 70% 26%,rgba(255,227,109,.95) 0 13px,transparent 15px),linear-gradient(145deg,#0b2b52,#5ca7e8 52%,#0a1525); }
    .nexus-app-art.fogline::before { background:radial-gradient(circle at 48% 38%,rgba(238,248,250,.92) 0 6px,transparent 8px),linear-gradient(135deg,#050606,#1b2022); }
    .nexus-app-art.zombie::before { background:radial-gradient(circle at 45% 54%,rgba(61,240,161,.64),transparent 5rem),linear-gradient(135deg,#0d1c13,#33130f); }
    .nexus-app-art.hell::before { background:radial-gradient(circle at 48% 42%,rgba(255,227,109,.92) 0 8px,transparent 9px),linear-gradient(135deg,#180606,#08121d); }
    .nexus-app-info { padding:18px; display:flex; flex-direction:column; gap:12px; flex:1; }
    .nexus-tags { display:flex; flex-wrap:wrap; gap:7px; }
    .nexus-tag { border:1px solid rgba(130,216,255,.22); border-radius:999px; padding:6px 9px; color:var(--blue); background:rgba(130,216,255,.06); font-size:.72rem; font-weight:900; text-transform:uppercase; }
    .nexus-tag.gold { color:var(--gold); border-color:rgba(255,227,109,.32); }
    .nexus-tag.green { color:var(--green); border-color:rgba(105,240,184,.25); }
    .nexus-tag.red { color:var(--red); border-color:rgba(255,139,123,.34); }
    .nexus-app-card h2 { margin:0; font-size:clamp(1.15rem,1.45vw,1.48rem); line-height:1.08; }
    .nexus-app-card p { margin:0; color:var(--muted); line-height:1.5; flex:1; }
    .nexus-open { color:var(--gold); font-weight:950; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem; }
    .nexus-empty { border:1px dashed rgba(236,242,245,.2); border-radius:24px; padding:28px; color:var(--muted); background:rgba(236,242,245,.04); }
    @media (max-width:980px) { :root { --card-min:240px; } .nexus-topbar { align-items:flex-start; flex-direction:column; } }
    @media (max-width:640px) { :root { --card-min:min(100%,260px); } .nexus-shell { width:min(100% - 20px,1680px); } .nexus-tabs { padding-bottom:4px; } .nexus-toolbar { align-items:flex-start; flex-direction:column; } .nexus-search { flex-basis:auto; } }
  `;
  documentRef.head.append(style);
}

function renderTag(tag) {
  return `<span class="nexus-tag ${escapeHtml(tag.tone ?? "blue")}">${escapeHtml(tag.label)}</span>`;
}

function renderCard(app) {
  return `<a class="nexus-app-card" href="${escapeHtml(app.route)}" target="_blank" rel="noopener" data-app-id="${escapeHtml(app.id)}"><div class="nexus-app-art ${escapeHtml(app.visual)}" aria-hidden="true"></div><div class="nexus-app-info"><div class="nexus-tags">${app.tags.map(renderTag).join("")}</div><h2>${escapeHtml(app.title)}</h2><p>${escapeHtml(app.description)}</p><span class="nexus-open">Open →</span></div></a>`;
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}">${escapeHtml(tab.label)}<span class="nexus-tab-count">${tab.count}</span></button>`).join("");
}

function renderGrid(parts, state) {
  const activeTab = tabs.find((tab) => tab.id === state.activeTabId) ?? tabs[0];
  const items = tabItems(activeTab?.id, state.query);
  parts.heading.textContent = activeTab?.label ?? "Routes";
  parts.copy.textContent = `${activeTab?.label ?? "Routes"} from the generated NexusRealtime route catalog. Use search to narrow the visible cards.`;
  parts.count.textContent = `${items.length} / ${activeTab?.count ?? items.length} visible`;
  parts.grid.innerHTML = items.length ? items.map(renderCard).join("") : `<div class="nexus-empty">No routes matched this search in ${escapeHtml(activeTab?.label ?? "this tab")}.</div>`;
  for (const button of parts.tabButtons) {
    const active = button.dataset.tabId === state.activeTabId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function renderShell(root, state) {
  root.innerHTML = `<canvas class="nexus-gallery-background" aria-hidden="true"></canvas><section class="nexus-shell" aria-label="NexusRealtime applications gallery"><header class="nexus-topbar" aria-label="Applications navigation"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title)}</strong><span>${escapeHtml(galleryConfig.subtitle)}</span></div><div class="nexus-top-actions"><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Open repo</a></div></header><nav class="nexus-tabs" aria-label="Application type tabs">${renderTabs(state.activeTabId)}</nav><section class="nexus-toolbar" aria-label="Gallery search and count"><label class="nexus-search"><span>Search</span><input class="nexus-search-input" type="search" placeholder="Filter routes, kits, tags..." autocomplete="off" /></label><span class="nexus-result-count" aria-live="polite"></span></section><section aria-label="Current route group"><h1 class="nexus-tab-heading"></h1><p class="nexus-tab-copy"></p></section><section class="nexus-gallery-grid" aria-label="Visible application routes"></section></section>`;
  return {
    tabButtons: Array.from(root.querySelectorAll(".nexus-tab")),
    search: root.querySelector(".nexus-search-input"),
    count: root.querySelector(".nexus-result-count"),
    heading: root.querySelector(".nexus-tab-heading"),
    copy: root.querySelector(".nexus-tab-copy"),
    grid: root.querySelector(".nexus-gallery-grid")
  };
}

function wireGallery(parts, state) {
  for (const button of parts.tabButtons) {
    button.addEventListener("click", () => {
      state.activeTabId = button.dataset.tabId || firstTabId();
      state.query = "";
      parts.search.value = "";
      renderGrid(parts, state);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  parts.search.addEventListener("input", () => {
    state.query = parts.search.value;
    renderGrid(parts, state);
  });
}

function boot() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root.");
  injectStyles(document);
  const state = { activeTabId: firstTabId(), query: "" };
  const parts = renderShell(root, state);
  wireGallery(parts, state);
  renderGrid(parts, state);
  const canvas = root.querySelector(".nexus-gallery-background");
  try { startNexusGalleryShader(canvas); } catch { canvas?.classList.add("is-fallback"); }
}

boot();
