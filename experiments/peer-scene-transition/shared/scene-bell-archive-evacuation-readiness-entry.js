import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSceneBellArchiveEvacuationReadinessDomainKit } from "../../_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const STYLE_ID = "scene-bell-archive-evacuation-readiness-style";
const PANEL_ID = "scene-bell-archive-evacuation-readiness-panel";
const PASS_ID = "bell-archive-evacuation-readiness-renderer-handoff-pass";
const domainKit = createSceneBellArchiveEvacuationReadinessDomainKit();
let installed = false;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}{border-color:rgba(255,221,146,.32);background:linear-gradient(180deg,rgba(46,31,12,.84),rgba(12,8,4,.72));box-shadow:0 18px 60px rgba(0,0,0,.32),inset 0 0 0 1px rgba(255,244,196,.08)}
    #${PANEL_ID} .bell-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
    #${PANEL_ID} .bell-card{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px;background:rgba(0,0,0,.18)}
    #${PANEL_ID} .bell-card strong{display:block;color:#ffe7aa;font-size:.75rem;letter-spacing:.04em;text-transform:uppercase}
    #${PANEL_ID} .bell-card span{display:block;color:#f6e7c2;font-weight:900;font-size:1.25rem;margin-top:4px}
    #${PANEL_ID} .bell-card small{display:block;color:#c9b98e;margin-top:2px;line-height:1.25}
    #${PANEL_ID} .bell-strip{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12);margin:8px 0 6px}
    #${PANEL_ID} .bell-strip i{display:block;height:100%;width:calc(var(--p,0)*1%);background:linear-gradient(90deg,#d99355,#ffe7aa)}
    #${PANEL_ID} .bell-missing{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
    #${PANEL_ID} .bell-missing b{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 7px;color:#f1d8a0;background:rgba(0,0,0,.22);font-size:.7rem}
  `;
  document.head.append(style);
}

function stateForDomain() {
  const host = globalThis.GameHost;
  const snapshot = typeof host?.getState === "function" ? host.getState() : {};
  return {
    ...snapshot,
    sceneId: document.querySelector("#app")?.dataset.scene || snapshot?.sceneId || "camp"
  };
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "panel bell-archive-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function renderPanel(readiness) {
  const panel = ensurePanel();
  const counts = readiness.rendererHandoff.counts;
  panel.innerHTML = `
    <h2>Bell archive evacuation</h2>
    <div class="bell-strip" style="--p:${readiness.readiness}"><i></i></div>
    <div class="bell-grid">
      <div class="bell-card"><strong>Readiness</strong><span>${readiness.readiness}%</span><small>${readiness.phase}</small></div>
      <div class="bell-card"><strong>Flood pressure</strong><span>${readiness.floodPressure}%</span><small>archive route risk</small></div>
      <div class="bell-card"><strong>Descriptors</strong><span>${Object.values(counts).reduce((sum, value) => sum + value, 0)}</span><small>renderer handoff only</small></div>
    </div>
    <div class="bell-missing">${readiness.missing.length ? readiness.missing.map((item) => `<b>${item}</b>`).join("") : "<b>dawn handoff ready</b>"}</div>
  `;
}

function install() {
  if (installed) return;
  const host = globalThis.GameHost;
  if (!host || typeof host.getState !== "function") {
    globalThis.setTimeout(install, 35);
    return;
  }
  installed = true;
  injectStyles();
  const priorHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  host.nexusEngineCdn = host.nexusEngineCdn || NEXUS_ENGINE_CDN;
  host.nexusEngineBellArchiveExports = Object.keys(NexusEngineRuntime).slice(0, 12);
  host.getSceneBellArchiveEvacuationReadiness = () => domainKit.describe(stateForDomain());
  host.getBellArchiveEvacuationReadiness = host.getSceneBellArchiveEvacuationReadiness;
  host.getBellArchiveEvacuationReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const previous = priorHandoff ? priorHandoff() : {};
    const bellArchiveEvacuation = domainKit.describe(stateForDomain()).rendererHandoff;
    return {
      ...previous,
      bellArchiveEvacuation,
      bellArchiveEvacuationCounts: bellArchiveEvacuation.counts
    };
  };
  document.querySelector("#app")?.setAttribute("data-bell-archive-pass", PASS_ID);
  renderPanel(domainKit.describe(stateForDomain()));
  globalThis.setInterval(() => renderPanel(domainKit.describe(stateForDomain())), 700);
}

install();
