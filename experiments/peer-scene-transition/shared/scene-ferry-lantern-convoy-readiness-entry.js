import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createPeerSceneFerryLanternConvoyDomainKit } from "../../_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const STYLE_ID = "scene-ferry-lantern-convoy-readiness-style";
const PANEL_ID = "scene-ferry-lantern-convoy-readiness-panel";
const PASS_ID = "ferry-lantern-convoy-readiness-renderer-handoff-pass";
const domainKit = createPeerSceneFerryLanternConvoyDomainKit();
let installed = false;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}{border-color:rgba(126,211,255,.32);background:linear-gradient(180deg,rgba(7,31,46,.86),rgba(5,10,18,.76));box-shadow:0 18px 60px rgba(0,0,0,.34),inset 0 0 0 1px rgba(185,236,255,.08)}
    #${PANEL_ID} .ferry-strip{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12);margin:8px 0 6px}
    #${PANEL_ID} .ferry-strip i{display:block;height:100%;width:calc(var(--p,0)*1%);background:linear-gradient(90deg,#62c7ff,#f7d58a)}
    #${PANEL_ID} .ferry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
    #${PANEL_ID} .ferry-card{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px;background:rgba(0,0,0,.18)}
    #${PANEL_ID} .ferry-card strong{display:block;color:#bdeaff;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
    #${PANEL_ID} .ferry-card span{display:block;color:#fff2c8;font-weight:900;font-size:1.25rem;margin-top:4px}
    #${PANEL_ID} .ferry-card small{display:block;color:#b5c9d6;margin-top:2px;line-height:1.25}
    #${PANEL_ID} .ferry-missing{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
    #${PANEL_ID} .ferry-missing b{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 7px;color:#d5efff;background:rgba(0,0,0,.22);font-size:.7rem}
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
    panel.className = "panel ferry-lantern-convoy-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function renderPanel(readiness) {
  const panel = ensurePanel();
  const counts = readiness.rendererHandoff.counts;
  panel.innerHTML = `
    <h2>Ferry lantern convoy</h2>
    <div class="ferry-strip" style="--p:${readiness.readiness}"><i></i></div>
    <div class="ferry-grid">
      <div class="ferry-card"><strong>Readiness</strong><span>${readiness.readiness}%</span><small>${readiness.phase}</small></div>
      <div class="ferry-card"><strong>Crossing pressure</strong><span>${readiness.crossingPressure}%</span><small>river convoy risk</small></div>
      <div class="ferry-card"><strong>Descriptors</strong><span>${readiness.rendererHandoff.flatDescriptors.length}</span><small>${Object.keys(counts).length} families</small></div>
    </div>
    <div class="ferry-missing">${readiness.missing.length ? readiness.missing.map((item) => `<b>${item}</b>`).join("") : "<b>dawn ferry convoy ready</b>"}</div>
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
  host.nexusEngineFerryLanternConvoyExports = Object.keys(NexusEngineRuntime).slice(0, 12);
  host.getPeerSceneFerryLanternConvoyReadiness = () => domainKit.describe(stateForDomain());
  host.getFerryLanternConvoyReadiness = host.getPeerSceneFerryLanternConvoyReadiness;
  host.getFerryLanternConvoyReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const previous = priorHandoff ? priorHandoff() : {};
    const ferryLanternConvoy = domainKit.describe(stateForDomain()).rendererHandoff;
    return {
      ...previous,
      ferryLanternConvoy,
      ferryLanternConvoyCounts: ferryLanternConvoy.counts
    };
  };
  document.querySelector("#app")?.setAttribute("data-ferry-lantern-convoy-pass", PASS_ID);
  renderPanel(domainKit.describe(stateForDomain()));
  globalThis.setInterval(() => renderPanel(domainKit.describe(stateForDomain())), 700);
}

install();
