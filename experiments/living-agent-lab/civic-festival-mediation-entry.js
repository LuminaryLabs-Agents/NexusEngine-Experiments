import {
  LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE,
  createLivingAgentCivicFestivalMediationReadinessDomainKit
} from "./civic-festival-mediation-readiness-kits.js";
import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const PASS_ID = "living-agent-civic-festival-mediation-readiness-pass";
const kit = createLivingAgentCivicFestivalMediationReadinessDomainKit();
const runtimeSurface = {
  imported: true,
  factoryName: typeof NexusEngine?.createNexusEngine === "function" ? "createNexusEngine" : "module"
};

const festivalState = {
  permitFiled: false,
  vendorLaneCleared: false,
  lanternsLit: 1,
  stewardPosts: 1,
  mediatorBriefings: 0,
  routeSeed: 7,
  note: "festival route awaiting civic mediation"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function getHost() {
  return globalThis.GameHost ?? null;
}

function currentWorld() {
  const world = getHost()?.getState?.() ?? {};
  return { ...world, festival: clone(festivalState) };
}

function computeReadiness() {
  return kit.describe({ world: currentWorld(), festival: festivalState, runtimeSurface, time: performance.now() / 1000 });
}

function flattenDescriptors(readiness) {
  const descriptors = readiness?.rendererHandoff?.descriptors ?? {};
  return Object.values(descriptors).flatMap((bucket) => Array.isArray(bucket) ? bucket : []);
}

function applyFestivalInput(action) {
  if (action === "file-permit") festivalState.permitFiled = true;
  if (action === "clear-vendor-lane") festivalState.vendorLaneCleared = true;
  if (action === "light-lantern") festivalState.lanternsLit = Math.min(12, festivalState.lanternsLit + 1);
  if (action === "assign-steward") festivalState.stewardPosts = Math.min(8, festivalState.stewardPosts + 1);
  if (action === "brief-mediators") festivalState.mediatorBriefings = Math.min(8, festivalState.mediatorBriefings + 1);
  if (action === "new-route-seed") festivalState.routeSeed = (festivalState.routeSeed + 13) % 997;
  festivalState.note = `last civic festival input: ${action}`;
  renderReadiness(computeReadiness());
  return clone(festivalState);
}

function installStyles() {
  if (document.getElementById("civic-festival-mediation-style")) return;
  const style = document.createElement("style");
  style.id = "civic-festival-mediation-style";
  style.textContent = `
    .civic-festival-panel {
      position: fixed;
      left: 14px;
      top: 284px;
      width: min(370px, calc(100vw - 28px));
      z-index: 6;
      display: grid;
      gap: 8px;
      padding: 12px;
      border: 1px solid rgba(255,184,95,.32);
      border-radius: 18px;
      background: rgba(11, 8, 4, .76);
      color: #fff4d7;
      box-shadow: 0 18px 60px rgba(0,0,0,.34);
      backdrop-filter: blur(16px);
      font: 12px Inter, ui-sans-serif, system-ui, sans-serif;
      pointer-events: auto;
    }
    .civic-festival-panel strong {
      color: #ffcf7a;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .civic-festival-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .civic-festival-panel span {
      display: block;
      border: 1px solid rgba(255,207,122,.18);
      border-radius: 12px;
      padding: 7px;
      background: rgba(255,207,122,.055);
      color: rgba(255,244,215,.9);
    }
    .civic-festival-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .civic-festival-actions button {
      border: 1px solid rgba(255,207,122,.36);
      border-radius: 999px;
      background: rgba(255,207,122,.08);
      color: #ffcf7a;
      padding: 7px 8px;
      font: 10px Inter, ui-sans-serif, system-ui, sans-serif;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .civic-festival-marker {
      position: fixed;
      z-index: 4;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.76);
      background: #ffcf7a;
      box-shadow: 0 0 20px rgba(255,207,122,.62);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .civic-festival-marker[data-kind*="vendor"] { width: 12px; height: 12px; background: #8df2bd; box-shadow: 0 0 20px rgba(141,242,189,.56); }
    .civic-festival-marker[data-kind*="lantern"] { width: 16px; height: 4px; border-radius: 999px; background: #ffe36d; box-shadow: 0 0 20px rgba(255,227,109,.62); }
    .civic-festival-marker[data-kind*="dispute"] { width: 18px; height: 18px; background: transparent; border-color: rgba(255,139,123,.76); }
    .civic-festival-marker[data-kind*="steward"] { background: #83d8ff; box-shadow: 0 0 20px rgba(131,216,255,.62); }
    @media (max-width: 760px) {
      .civic-festival-panel { top: auto; left: 14px; bottom: 210px; }
    }
  `;
  document.head.append(style);
}

function installPanel() {
  installStyles();
  let panel = document.getElementById("civicFestivalMediation");
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "civicFestivalMediation";
    panel.className = "civic-festival-panel";
    panel.setAttribute("aria-label", "Civic festival mediation readiness descriptors");
    document.body.append(panel);
  }
  return panel;
}

function installMarkers() {
  let layer = document.getElementById("civicFestivalMarkers");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "civicFestivalMarkers";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);
  }
  return layer;
}

function descriptorPoint(descriptor) {
  const point = descriptor.from ?? descriptor.to ?? descriptor.points?.[0] ?? descriptor;
  return {
    x: Number(point.x ?? 0),
    y: Number(point.y ?? 0)
  };
}

function renderReadiness(readiness) {
  const panel = installPanel();
  const handoff = readiness.rendererHandoff;
  panel.innerHTML = `
    <strong>Civic festival mediation</strong>
    <div class="civic-festival-grid">
      <span>phase<br><b>${readiness.phase}</b></span>
      <span>ready<br><b>${Math.round(readiness.festivalReadiness * 100)}%</b></span>
      <span>marks<br><b>${handoff.counts.total}</b></span>
    </div>
    <span>next: <b>${readiness.recommendedAction}</b></span>
    <div class="civic-festival-actions">
      <button data-action="file-permit">File permit</button>
      <button data-action="clear-vendor-lane">Clear lane</button>
      <button data-action="light-lantern">Light lantern</button>
      <button data-action="assign-steward">Assign steward</button>
      <button data-action="brief-mediators">Brief mediators</button>
      <button data-action="new-route-seed">Reroute stalls</button>
    </div>
  `;
  panel.querySelectorAll("button[data-action]").forEach((button) => {
    button.onclick = () => applyFestivalInput(button.dataset.action);
  });

  const layer = installMarkers();
  const descriptors = flattenDescriptors(readiness).slice(0, 18);
  layer.replaceChildren(...descriptors.map((descriptor) => {
    const marker = document.createElement("i");
    marker.className = "civic-festival-marker";
    marker.dataset.kind = descriptor.kind ?? "descriptor";
    const point = descriptorPoint(descriptor);
    marker.style.left = `${point.x}px`;
    marker.style.top = `${point.y}px`;
    marker.title = descriptor.label ?? descriptor.id ?? "festival descriptor";
    return marker;
  }));
}

function patchGameHost() {
  const host = getHost();
  if (!host || host.__civicFestivalMediationPatched) return false;

  const previousRendererHandoff = typeof host.getRendererHandoff === "function"
    ? host.getRendererHandoff.bind(host)
    : null;

  host.getLivingAgentCivicFestivalMediationReadiness = () => clone(computeReadiness());
  host.getCivicFestivalMediationReadiness = host.getLivingAgentCivicFestivalMediationReadiness;
  host.getCivicFestivalMediationTree = () => LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE;
  host.applyCivicFestivalInput = applyFestivalInput;
  host.getRendererHandoff = () => {
    const base = previousRendererHandoff?.() ?? {};
    const readiness = computeReadiness();
    const civicFestivalMediation = readiness.rendererHandoff;
    return {
      ...base,
      id: "living-agent-composed-renderer-handoff",
      runtimeSurface,
      civicFestivalMediation,
      descriptors: {
        ...(base.descriptors ?? {}),
        civicFestivalMediation: civicFestivalMediation.descriptors
      },
      counts: {
        ...(base.counts ?? {}),
        civicFestivalMediationDescriptors: civicFestivalMediation.counts.total,
        total: (base.counts?.total ?? 0) + civicFestivalMediation.counts.total
      }
    };
  };
  host.__civicFestivalMediationPatched = true;
  document.body.dataset.civicFestivalMediation = PASS_ID;
  return true;
}

function frame() {
  if (patchGameHost()) {
    renderReadiness(computeReadiness());
  } else if (getHost()?.__civicFestivalMediationPatched) {
    renderReadiness(computeReadiness());
  }
  requestAnimationFrame(frame);
}

frame();
