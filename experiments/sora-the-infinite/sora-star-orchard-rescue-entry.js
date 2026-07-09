import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
  createSoraStarOrchardRescueReadinessDomainKit
} from "./sora-star-orchard-rescue-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createSoraStarOrchardRescueReadinessDomainKit();
const previousHost = globalThis.GameHost ?? {};
const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function"
  ? previousHost.getRendererHandoff.bind(previousHost)
  : null;

function readBaseState() {
  if (typeof previousHost.getState === "function") {
    return previousHost.getState();
  }
  return {
    tick: 0,
    readiness: 0.42,
    input: { thrust: 0, bank: 0, climb: 0, pointerActive: false, pointerX: 0.5, pointerY: 0.5 }
  };
}

function buildStarOrchardInput() {
  const state = readBaseState();
  return {
    ...state,
    routePreview: typeof previousHost.getRoutePreview === "function" ? previousHost.getRoutePreview() : null,
    launchRehearsal: typeof previousHost.getLaunchRehearsal === "function" ? previousHost.getLaunchRehearsal() : null,
    flightplanReadability: typeof previousHost.getFlightplanReadability === "function" ? previousHost.getFlightplanReadability() : null,
    skyNegotiationReadiness: typeof previousHost.getSkyNegotiationReadiness === "function" ? previousHost.getSkyNegotiationReadiness() : null,
    skyRescueReadiness: typeof previousHost.getSkyRescueReadiness === "function" ? previousHost.getSkyRescueReadiness() : null,
    skyLighthouseReadiness: typeof previousHost.getSkyLighthouseReadiness === "function" ? previousHost.getSkyLighthouseReadiness() : null,
    skyRookeryMigrationReadiness: typeof previousHost.getSkyRookeryMigrationReadiness === "function" ? previousHost.getSkyRookeryMigrationReadiness() : null
  };
}

function getStarOrchardReadiness() {
  return domainKit.describe(buildStarOrchardInput());
}

function composeRendererHandoff() {
  const base = previousRendererHandoff ? previousRendererHandoff() : {
    kind: "sora-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    descriptors: {},
    descriptorCounts: {}
  };
  const readiness = getStarOrchardReadiness();
  return {
    ...base,
    contract: base.contract ?? "renderer consumes descriptors only",
    descriptors: {
      ...(base.descriptors ?? {}),
      starOrchardRescue: readiness.rendererHandoff.descriptors
    },
    descriptorCounts: {
      ...(base.descriptorCounts ?? {}),
      starOrchardRescueDescriptorCount: readiness.rendererHandoff.counts.total
    },
    starOrchardRescueReadiness: readiness.rendererHandoff,
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length
  };
}

function ensurePanel() {
  if (document.querySelector("#star-orchard-panel")) return document.querySelector("#star-orchard-panel");
  const panel = document.createElement("section");
  panel.id = "star-orchard-panel";
  panel.className = "star-orchard-panel";
  panel.innerHTML = `
    <h2>Star orchard rescue</h2>
    <p id="star-orchard-summary">Gathering sky medicine…</p>
    <ul id="star-orchard-list"></ul>
  `;
  document.querySelector(".telemetry")?.append(panel);
  const style = document.createElement("style");
  style.textContent = `
    .star-orchard-panel { margin-top: 1rem; padding: .85rem; border: 1px solid rgba(255,255,255,.16); border-radius: 16px; background: linear-gradient(135deg, rgba(255,201,102,.11), rgba(118,210,255,.08)); }
    .star-orchard-panel h2 { margin: 0 0 .5rem; font-size: .86rem; letter-spacing: .08em; text-transform: uppercase; }
    .star-orchard-panel p { margin: 0 0 .55rem; color: rgba(255,255,255,.72); }
    .star-orchard-panel ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
    .star-orchard-panel li { display: flex; justify-content: space-between; gap: .75rem; font-size: .76rem; color: rgba(255,255,255,.76); }
  `;
  document.head.append(style);
  return panel;
}

function renderStarOrchardPanel() {
  const readiness = getStarOrchardReadiness();
  const panel = ensurePanel();
  const summary = panel.querySelector("#star-orchard-summary");
  const list = panel.querySelector("#star-orchard-list");
  const ledger = readiness.dawnOrchardLedger;
  summary.textContent = `${Math.round(readiness.readinessScore * 100)}% ${ledger.missionState} · ${ledger.mealsReady} meals · ${ledger.medicineReady} poultices · ${ledger.nestlingsSecured} nestlings`;
  const rows = [
    ["starfruit groves", readiness.starfruitGroves.length],
    ["pollen currents", readiness.pollenCurrents.length],
    ["nest slings", readiness.nestSlings.length],
    ["cloud bloom medicine", readiness.cloudBloomMedicines.length],
    ["mooncalf couriers", readiness.mooncalfCouriers.length],
    ["descriptor handoff", readiness.rendererHandoff.counts.total]
  ];
  list.innerHTML = rows.map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`).join("");
}

function startPanelLoop() {
  const tick = () => {
    renderStarOrchardPanel();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (typeof document !== "undefined") {
  startPanelLoop();
}

globalThis.GameHost = {
  ...previousHost,
  nexusEngineCdn: NEXUS_ENGINE_CDN,
  nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
  getStarOrchardRescueReadiness: getStarOrchardReadiness,
  getSoraStarOrchardRescueReadiness: getStarOrchardReadiness,
  getStarOrchardRescueReadinessTree: () => SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
  getRendererHandoff: composeRendererHandoff
};
