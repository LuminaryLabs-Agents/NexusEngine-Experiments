import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createPeerSceneMoonGateRepairDomainKit } from "../../_kits/peer-scene-transition/peer-scene-moon-gate-repair-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const STYLE_ID = "scene-moon-gate-repair-readiness-style";
const PANEL_ID = "scene-moon-gate-repair-readiness-panel";
const PASS_ID = "moon-gate-repair-readiness-renderer-handoff-pass";
const domainKit = createPeerSceneMoonGateRepairDomainKit();
let installed = false;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}{border-color:rgba(204,181,255,.34);background:linear-gradient(180deg,rgba(29,20,50,.9),rgba(8,9,22,.78));box-shadow:0 18px 60px rgba(0,0,0,.36),inset 0 0 0 1px rgba(235,222,255,.1)}
    #${PANEL_ID} .moon-gate-strip{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12);margin:8px 0 6px}
    #${PANEL_ID} .moon-gate-strip i{display:block;height:100%;width:calc(var(--p,0)*1%);background:linear-gradient(90deg,#9f7dff,#fff3a3)}
    #${PANEL_ID} .moon-gate-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
    #${PANEL_ID} .moon-gate-card{border:1px solid rgba(255,255,255,.13);border-radius:12px;padding:8px;background:rgba(0,0,0,.2)}
    #${PANEL_ID} .moon-gate-card strong{display:block;color:#dacaff;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
    #${PANEL_ID} .moon-gate-card span{display:block;color:#fff3b4;font-weight:900;font-size:1.25rem;margin-top:4px}
    #${PANEL_ID} .moon-gate-card small{display:block;color:#c9c1df;margin-top:2px;line-height:1.25}
    #${PANEL_ID} .moon-gate-missing{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
    #${PANEL_ID} .moon-gate-missing b{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 7px;color:#f0eaff;background:rgba(0,0,0,.24);font-size:.7rem}
  `;
  document.head.append(style);
}

function stateForDomain() {
  const host = globalThis.GameHost;
  const snapshot = typeof host?.getState === "function" ? host.getState() : {};
  return {
    ...snapshot,
    sceneId: document.querySelector("#app")?.dataset.scene || snapshot?.sceneId || snapshot?.currentScene || "camp"
  };
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "panel moon-gate-repair-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function renderPanel(readiness) {
  const panel = ensurePanel();
  const counts = readiness.rendererHandoff.counts;
  panel.innerHTML = `
    <h2>Moon gate repair</h2>
    <div class="moon-gate-strip" style="--p:${readiness.readiness}"><i></i></div>
    <div class="moon-gate-grid">
      <div class="moon-gate-card"><strong>Readiness</strong><span>${readiness.readiness}%</span><small>${readiness.phase}</small></div>
      <div class="moon-gate-card"><strong>Fracture risk</strong><span>${readiness.fractureRisk}%</span><small>threshold stability</small></div>
      <div class="moon-gate-card"><strong>Descriptors</strong><span>${readiness.rendererHandoff.flatDescriptors.length}</span><small>${Object.keys(counts).length} families</small></div>
    </div>
    <div class="moon-gate-missing">${readiness.missing.length ? readiness.missing.map((item) => `<b>${item}</b>`).join("") : "<b>dawn moon gate open</b>"}</div>
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
  host.nexusEngineMoonGateRepairExports = Object.keys(NexusEngineRuntime).slice(0, 12);
  host.getPeerSceneMoonGateRepairReadiness = () => domainKit.describe(stateForDomain());
  host.getMoonGateRepairReadiness = host.getPeerSceneMoonGateRepairReadiness;
  host.getMoonGateRepairReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const previous = priorHandoff ? priorHandoff() : {};
    const moonGateRepair = domainKit.describe(stateForDomain()).rendererHandoff;
    return {
      ...previous,
      moonGateRepair,
      moonGateRepairCounts: moonGateRepair.counts
    };
  };
  document.querySelector("#app")?.setAttribute("data-moon-gate-repair-pass", PASS_ID);
  renderPanel(domainKit.describe(stateForDomain()));
  globalThis.setInterval(() => renderPanel(domainKit.describe(stateForDomain())), 700);
}

install();
