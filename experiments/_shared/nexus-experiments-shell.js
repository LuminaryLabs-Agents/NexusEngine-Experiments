import { apps, tabs, galleryConfig } from "./nexus-gallery-data.js?v=main-app-grid";
import { startNexusGalleryShader } from "./nexus-gallery-shader.js";
import { attachNexusCardShaders } from "./nexus-card-shader.js?v=spark-cards-safe-20260621";

const STYLE_ID = "nexus-experiments-shell-style";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayTitle(app) {
  return String(app.displayTitle ?? app.title ?? app.id).replace(/\s+—\s+NexusRealtime$/i, "");
}

function description(app) {
  return app.shortDescription ?? app.description ?? "Open this NexusRealtime route.";
}

function firstTabId() {
  return tabs.find((tab) => tab.id === "experiments")?.id ?? tabs[0]?.id ?? "experiments";
}

function tabItems(tabId, query = "") {
  const needle = query.trim().toLowerCase();
  return apps.filter((app) => {
    if (app.tab !== tabId) return false;
    if (!needle) return true;
    const haystack = String(app.searchText ?? [app.title, app.id, app.description, app.kind, app.subtype, app.route, ...(app.tags ?? []).map((tag) => tag.label)].join(" ")).toLowerCase();
    return haystack.includes(needle);
  });
}

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { color-scheme:dark; --text:#fff8df; --muted:#e8cfa4; --line:rgba(255,231,163,.23); --blue:#ffe6a1; --gold:#ffe05c; --green:#94f0a8; --red:#ff8b54; --card-min:220px; }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; background:#120803; color:var(--text); font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
    body { overflow-y:auto; }
    a { color:inherit; }
    .nexus-shell { position:relative; z-index:1; width:min(100% - 28px,1680px); min-height:100svh; margin:0 auto; padding:18px 0 32px; display:flex; flex-direction:column; gap:14px; }
    .nexus-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:13px 18px; border:1px solid var(--line); border-radius:24px; background:linear-gradient(180deg,rgba(65,30,6,.72),rgba(24,10,3,.76)); box-shadow:0 24px 90px rgba(34,10,0,.36), inset 0 1px 0 rgba(255,238,175,.08); backdrop-filter:blur(18px); }
    .nexus-brand strong { display:block; color:var(--gold); font-size:1.05rem; font-weight:950; letter-spacing:.2em; text-transform:uppercase; text-shadow:0 0 26px rgba(255,197,52,.36); }
    .nexus-brand span { display:block; margin-top:3px; color:var(--muted); font-size:.86rem; }
    .nexus-top-actions,.nexus-tabs,.nexus-toolbar { display:flex; align-items:center; gap:8px; }
    .nexus-repo-button,.nexus-tab { border:1px solid rgba(255,224,92,.54); border-radius:999px; color:var(--gold); background:rgba(255,224,92,.07); font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; box-shadow:0 14px 34px rgba(0,0,0,.22); cursor:pointer; }
    .nexus-repo-button,.nexus-tab { padding:10px 16px; font-size:.78rem; }
    .nexus-tabs { overflow-x:auto; padding:2px; }
    .nexus-tab { color:rgba(255,248,223,.78); border-color:rgba(255,232,172,.22); background:rgba(40,17,3,.58); white-space:nowrap; }
    .nexus-tab.is-active { color:#170903; border-color:rgba(255,235,139,.9); background:linear-gradient(90deg,#ffe05c,#ff9d21 58%,#93f2a6); box-shadow:0 18px 50px rgba(255,152,22,.28); }
    .nexus-tab-count { opacity:.78; margin-left:4px; }
    .nexus-toolbar { justify-content:space-between; flex-wrap:wrap; padding:8px 2px 0; color:rgba(255,244,213,.74); }
    .nexus-search { min-width:min(100%,420px); flex:0 1 480px; display:flex; align-items:center; gap:10px; border:1px solid var(--line); border-radius:999px; padding:9px 14px; background:rgba(54,22,3,.58); box-shadow:0 16px 44px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,238,175,.08); }
    .nexus-search span { color:var(--gold); font-size:.73rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
    .nexus-search-input { width:100%; border:0; outline:0; background:transparent; color:var(--text); font:inherit; }
    .nexus-search-input::placeholder { color:rgba(255,244,213,.48); }
    .nexus-result-count { color:#ffd44d; font-weight:900; letter-spacing:.08em; text-transform:uppercase; text-shadow:0 1px 10px rgba(41,12,0,.35); }
    .nexus-tab-heading { margin:0; color:#2a1306; font-size:clamp(1.45rem,2.6vw,2.35rem); line-height:1; text-shadow:0 1px 0 rgba(255,239,181,.28),0 0 28px rgba(255,184,42,.18); }
    .nexus-tab-copy { margin:0; color:#6b3b13; line-height:1.45; max-width:78ch; font-weight:650; }
    .nexus-gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--card-min),1fr)); gap:14px; align-items:stretch; padding:4px 0 24px; perspective:1200px; }
    .nexus-app-card { --tilt-x:0deg; --tilt-y:0deg; --mx:50%; --my:50%; min-height:282px; display:flex; flex-direction:column; overflow:hidden; position:relative; border:1px solid rgba(255,229,151,.28); border-radius:22px; color:inherit; text-decoration:none; background:linear-gradient(180deg,rgba(48,19,3,.72),rgba(14,6,2,.86)); box-shadow:0 24px 74px rgba(36,10,0,.32), inset 0 1px 0 rgba(255,241,183,.08); backdrop-filter:blur(18px); transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateY(0); transform-style:preserve-3d; transition:transform 170ms ease,border-color 170ms ease,box-shadow 170ms ease,filter 170ms ease; }
    .nexus-app-card::after { position:absolute; inset:0; content:""; pointer-events:none; opacity:.0; background:radial-gradient(circle at var(--mx) var(--my),rgba(255,247,184,.34),transparent 28%),linear-gradient(115deg,transparent 16%,rgba(255,244,174,.2) 38%,transparent 56%); transition:opacity 170ms ease; }
    .nexus-app-card:hover,.nexus-app-card:focus-visible { transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateY(-5px) scale(1.012); border-color:rgba(255,224,92,.88); box-shadow:0 34px 120px rgba(81,24,0,.55),0 0 72px rgba(255,154,26,.2), inset 0 1px 0 rgba(255,245,184,.14); outline:0; }
    .nexus-app-card:hover::after,.nexus-app-card:focus-visible::after { opacity:1; }
    .nexus-app-art { flex:0 0 168px; position:relative; overflow:hidden; background:linear-gradient(135deg,#5a2d04,#f2a51e 48%,#fff2b0); }
    .nexus-app-art::before { position:absolute; inset:-20%; content:""; z-index:0; background:radial-gradient(circle at 64% 22%,rgba(255,244,153,.9),transparent 19%),radial-gradient(circle at 34% 44%,rgba(255,144,18,.75),transparent 36%),linear-gradient(135deg,#4b2103,#e68410 46%,#fff0a4); animation:nexusFallbackGlow 12s ease-in-out infinite alternate; }
    .nexus-app-art::after { position:absolute; inset:-25%; content:""; z-index:1; opacity:.55; background:linear-gradient(118deg,transparent 18%,rgba(255,255,220,.36) 39%,transparent 52%),radial-gradient(circle at 25% 75%,rgba(255,233,114,.35),transparent 24%); transform:translateX(-8%); animation:nexusFallbackSweep 8s linear infinite; }
    .nexus-card-shader { position:absolute; inset:0; z-index:2; width:100%; height:100%; display:block; opacity:0; mix-blend-mode:screen; transition:opacity 160ms ease; }
    .has-live-shader .nexus-card-shader { opacity:.92; }
    .shader-fallback .nexus-card-shader[hidden] { display:none; }
    .nexus-art-vignette { position:absolute; inset:0; z-index:3; pointer-events:none; background:radial-gradient(circle at 65% 20%,rgba(255,252,198,.28),transparent 30%),linear-gradient(180deg,transparent 48%,rgba(9,4,1,.55)); }
    .nexus-app-info { padding:15px 16px 16px; display:flex; flex-direction:column; gap:9px; flex:1; position:relative; z-index:1; }
    .nexus-app-card h2 { margin:0; font-size:clamp(1.05rem,1.28vw,1.32rem); line-height:1.07; letter-spacing:-.02em; }
    .nexus-app-card p { margin:0; color:var(--muted); line-height:1.4; flex:1; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
    .nexus-open { color:var(--gold); font-weight:950; letter-spacing:.08em; text-transform:uppercase; font-size:.75rem; }
    .nexus-empty { border:1px dashed rgba(255,229,151,.28); border-radius:22px; padding:28px; color:#5b2d10; background:rgba(255,230,170,.26); font-weight:800; }
    @keyframes nexusFallbackGlow { from { transform:translate3d(-1%,0,0) scale(1.02); filter:saturate(1.05); } to { transform:translate3d(2%,-2%,0) scale(1.08); filter:saturate(1.25); } }
    @keyframes nexusFallbackSweep { from { transform:translateX(-18%) rotate(0deg); } to { transform:translateX(18%) rotate(1deg); } }
    @media (max-width:980px) { :root { --card-min:220px; } .nexus-topbar { align-items:flex-start; flex-direction:column; } }
    @media (max-width:640px) { :root { --card-min:min(100%,240px); } .nexus-shell { width:min(100% - 20px,1680px); } .nexus-tabs { padding-bottom:4px; } .nexus-toolbar { align-items:flex-start; flex-direction:column; } .nexus-search { flex-basis:auto; } .nexus-app-card { min-height:260px; } }
  `;
  documentRef.head.append(style);
}

function renderCard(app) {
  const title = displayTitle(app);
  return `<a class="nexus-app-card shader-fallback" href="${escapeHtml(app.route)}" target="_blank" rel="noopener" data-app-id="${escapeHtml(app.id)}"><div class="nexus-app-art" aria-hidden="true"><canvas class="nexus-card-shader"></canvas><div class="nexus-art-vignette"></div></div><div class="nexus-app-info"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description(app))}</p><span class="nexus-open">Open →</span></div></a>`;
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}">${escapeHtml(tab.label)}<span class="nexus-tab-count">${tab.count}</span></button>`).join("");
}

function renderGrid(parts, state) {
  state.cardShaders?.stop();
  const activeTab = tabs.find((tab) => tab.id === state.activeTabId) ?? tabs[0];
  const items = tabItems(activeTab?.id, state.query);
  parts.heading.textContent = activeTab?.label ?? "Routes";
  parts.copy.textContent = `${activeTab?.label ?? "Routes"} from the generated NexusRealtime route catalog. Use search to narrow the visible cards.`;
  parts.count.textContent = `${items.length} / ${activeTab?.count ?? items.length} visible`;
  parts.grid.innerHTML = items.length ? items.map(renderCard).join("") : `<div class="nexus-empty">No routes matched this search in ${escapeHtml(activeTab?.label ?? "this tab")}.</div>`;
  state.cardShaders = attachNexusCardShaders(parts.grid);
  for (const button of parts.tabButtons) {
    const active = button.dataset.tabId === state.activeTabId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function renderShell(root, state) {
  root.innerHTML = `<section class="nexus-shell" aria-label="NexusRealtime applications gallery"><header class="nexus-topbar" aria-label="Applications navigation"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title)}</strong><span>${escapeHtml(galleryConfig.subtitle)}</span></div><div class="nexus-top-actions"><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Open repo</a></div></header><nav class="nexus-tabs" aria-label="Application type tabs">${renderTabs(state.activeTabId)}</nav><section class="nexus-toolbar" aria-label="Gallery search and count"><label class="nexus-search"><span>Search</span><input class="nexus-search-input" type="search" placeholder="Filter routes, kits, tags..." autocomplete="off" /></label><span class="nexus-result-count" aria-live="polite"></span></section><section aria-label="Current route group"><h1 class="nexus-tab-heading"></h1><p class="nexus-tab-copy"></p></section><section class="nexus-gallery-grid" aria-label="Visible application routes"></section></section>`;
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
  window.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== parts.search) {
      event.preventDefault();
      parts.search.focus();
    }
    if (event.key === "Escape" && document.activeElement === parts.search) {
      parts.search.value = "";
      state.query = "";
      renderGrid(parts, state);
    }
    if (event.key === "Enter" && document.activeElement === parts.search) {
      const firstCard = parts.grid.querySelector(".nexus-app-card");
      if (firstCard) globalThis.open(firstCard.href, "_blank", "noopener");
    }
  });
}

function boot() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root.");
  injectStyles(document);
  const state = { activeTabId: firstTabId(), query: "", cardShaders: null };
  const parts = renderShell(root, state);
  wireGallery(parts, state);
  renderGrid(parts, state);
  try { startNexusGalleryShader({ parent: document.body }); } catch { document.body.classList.add("nexus-gallery-background-fallback"); }
}

boot();
