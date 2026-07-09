import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE,
  createSoraSkyRadioBeaconReadinessDomainKit
} from "./sora-sky-radio-beacon-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createSoraSkyRadioBeaconReadinessDomainKit();
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
    readiness: 0.4,
    input: { thrust: 0, bank: 0, climb: 0, pointerActive: false, pointerX: 0.5, pointerY: 0.5 }
  };
}

function buildRadioBeaconInput() {
  const state = readBaseState();
  return {
    ...state,
    routePreview: typeof previousHost.getRoutePreview === "function" ? previousHost.getRoutePreview() : null,
    launchRehearsal: typeof previousHost.getLaunchRehearsal === "function" ? previousHost.getLaunchRehearsal() : null,
    skyRescueReadiness: typeof previousHost.getSkyRescueReadiness === "function" ? previousHost.getSkyRescueReadiness() : null,
    skyLighthouseReadiness: typeof previousHost.getSkyLighthouseReadiness === "function" ? previousHost.getSkyLighthouseReadiness() : null,
    skyRookeryMigrationReadiness: typeof previousHost.getSkyRookeryMigrationReadiness === "function" ? previousHost.getSkyRookeryMigrationReadiness() : null,
    starOrchardRescueReadiness: typeof previousHost.getStarOrchardRescueReadiness === "function" ? previousHost.getStarOrchardRescueReadiness() : null
  };
}

function getSkyRadioBeaconReadiness() {
  return domainKit.describe(buildRadioBeaconInput());
}

function composeRendererHandoff() {
  const base = previousRendererHandoff ? previousRendererHandoff() : {
    kind: "sora-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    descriptors: {},
    descriptorCounts: {}
  };
  const readiness = getSkyRadioBeaconReadiness();
  return {
    ...base,
    contract: base.contract ?? "renderer consumes descriptors only",
    descriptors: {
      ...(base.descriptors ?? {}),
      skyRadioBeaconRescue: readiness.rendererHandoff.descriptors
    },
    descriptorCounts: {
      ...(base.descriptorCounts ?? {}),
      skyRadioBeaconRescueDescriptorCount: readiness.rendererHandoff.counts.total
    },
    skyRadioBeaconRescueReadiness: readiness.rendererHandoff,
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length
  };
}

function ensurePanel() {
  if (document.querySelector("#sky-radio-beacon-panel")) return document.querySelector("#sky-radio-beacon-panel");
  const panel = document.createElement("section");
  panel.id = "sky-radio-beacon-panel";
  panel.className = "sky-radio-beacon-panel";
  panel.innerHTML = `
    <h2>Sky radio beacon rescue</h2>
    <p id="sky-radio-beacon-summary">Listening for cloud distress bands…</p>
    <ul id="sky-radio-beacon-list"></ul>
  `;
  document.querySelector(".telemetry")?.append(panel);
  const style = document.createElement("style");
  style.textContent = `
    .sky-radio-beacon-panel { margin-top: 1rem; padding: .85rem; border: 1px solid rgba(255,255,255,.16); border-radius: 16px; background: linear-gradient(135deg, rgba(117,188,255,.12), rgba(255,236,142,.08)); }
    .sky-radio-beacon-panel h2 { margin: 0 0 .5rem; font-size: .86rem; letter-spacing: .08em; text-transform: uppercase; }
    .sky-radio-beacon-panel p { margin: 0 0 .55rem; color: rgba(255,255,255,.72); }
    .sky-radio-beacon-panel ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
    .sky-radio-beacon-panel li { display: flex; justify-content: space-between; gap: .75rem; font-size: .76rem; color: rgba(255,255,255,.76); }
  `;
  document.head.append(style);
  return panel;
}

function renderSkyRadioBeaconPanel() {
  const readiness = getSkyRadioBeaconReadiness();
  const panel = ensurePanel();
  const summary = panel.querySelector("#sky-radio-beacon-summary");
  const list = panel.querySelector("#sky-radio-beacon-list");
  const ledger = readiness.dawnRadioLedger;
  summary.textContent = `${Math.round(readiness.readinessScore * 100)}% ${ledger.missionState} · ${ledger.tunedMasts} masts · ${ledger.lockedBands} locked bands · ${ledger.survivorsCapacity} stretcher capacity`;
  const rows = [
    ["cloud radio masts", readiness.cloudRadioMasts.length],
    ["frequency bands", readiness.beaconFrequencyBands.length],
    ["lightning gaps", readiness.lightningGapMarkers.length],
    ["thermal relay buoys", readiness.thermalRelayBuoys.length],
    ["sky stretcher cradles", readiness.skyStretcherCradles.length],
    ["descriptor handoff", readiness.rendererHandoff.counts.total]
  ];
  list.innerHTML = rows.map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`).join("");
}

function startPanelLoop() {
  const tick = () => {
    renderSkyRadioBeaconPanel();
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
  getSkyRadioBeaconRescueReadiness: getSkyRadioBeaconReadiness,
  getSoraSkyRadioBeaconRescueReadiness: getSkyRadioBeaconReadiness,
  getSkyRadioBeaconRescueReadinessTree: () => SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE,
  getRendererHandoff: composeRendererHandoff
};
