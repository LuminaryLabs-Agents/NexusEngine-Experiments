import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SORA_CLOUD_CLINIC_TRIAGE_READINESS_DOMAIN_TREE,
  createSoraCloudClinicTriageReadinessDomainKit
} from "./sora-cloud-clinic-triage-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createSoraCloudClinicTriageReadinessDomainKit();
const previousHost = globalThis.GameHost ?? {};
const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function"
  ? previousHost.getRendererHandoff.bind(previousHost)
  : null;

function readBaseState() {
  if (typeof previousHost.getState === "function") return previousHost.getState();
  return {
    tick: 0,
    readiness: 0.42,
    stormRisk: 0.45,
    input: { thrust: 0, bank: 0, climb: 0, pointerActive: false, pointerX: 0.5, pointerY: 0.5 }
  };
}

function buildCloudClinicInput() {
  const state = readBaseState();
  return {
    ...state,
    routePreview: typeof previousHost.getRoutePreview === "function" ? previousHost.getRoutePreview() : null,
    launchRehearsal: typeof previousHost.getLaunchRehearsal === "function" ? previousHost.getLaunchRehearsal() : null,
    skyRescueReadiness: typeof previousHost.getSkyRescueReadiness === "function" ? previousHost.getSkyRescueReadiness() : null,
    skyLighthouseReadiness: typeof previousHost.getSkyLighthouseReadiness === "function" ? previousHost.getSkyLighthouseReadiness() : null,
    skyRookeryMigrationReadiness: typeof previousHost.getSkyRookeryMigrationReadiness === "function" ? previousHost.getSkyRookeryMigrationReadiness() : null,
    starOrchardRescueReadiness: typeof previousHost.getStarOrchardRescueReadiness === "function" ? previousHost.getStarOrchardRescueReadiness() : null,
    skyRadioBeaconReadiness: typeof previousHost.getSkyRadioBeaconRescueReadiness === "function" ? previousHost.getSkyRadioBeaconRescueReadiness() : null
  };
}

function getCloudClinicTriageReadiness() {
  return domainKit.describe(buildCloudClinicInput());
}

function composeRendererHandoff() {
  const base = previousRendererHandoff ? previousRendererHandoff() : {
    kind: "sora-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    descriptors: {},
    descriptorCounts: {}
  };
  const readiness = getCloudClinicTriageReadiness();
  return {
    ...base,
    contract: base.contract ?? "renderer consumes descriptors only",
    descriptors: {
      ...(base.descriptors ?? {}),
      cloudClinicTriage: readiness.rendererHandoff.descriptors
    },
    descriptorCounts: {
      ...(base.descriptorCounts ?? {}),
      cloudClinicTriageDescriptorCount: readiness.rendererHandoff.counts.total
    },
    cloudClinicTriageReadiness: readiness.rendererHandoff,
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length
  };
}

function ensurePanel() {
  if (document.querySelector("#cloud-clinic-triage-panel")) return document.querySelector("#cloud-clinic-triage-panel");
  const panel = document.createElement("section");
  panel.id = "cloud-clinic-triage-panel";
  panel.className = "cloud-clinic-triage-panel";
  panel.innerHTML = `
    <h2>Cloud clinic triage</h2>
    <p id="cloud-clinic-triage-summary">Circling for a stable clinic cloud…</p>
    <ul id="cloud-clinic-triage-list"></ul>
  `;
  document.querySelector(".telemetry")?.append(panel);
  const style = document.createElement("style");
  style.textContent = `
    .cloud-clinic-triage-panel { margin-top: 1rem; padding: .85rem; border: 1px solid rgba(255,255,255,.16); border-radius: 16px; background: linear-gradient(135deg, rgba(180,242,255,.13), rgba(255,170,205,.08)); }
    .cloud-clinic-triage-panel h2 { margin: 0 0 .5rem; font-size: .86rem; letter-spacing: .08em; text-transform: uppercase; }
    .cloud-clinic-triage-panel p { margin: 0 0 .55rem; color: rgba(255,255,255,.74); }
    .cloud-clinic-triage-panel ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
    .cloud-clinic-triage-panel li { display: flex; justify-content: space-between; gap: .75rem; font-size: .76rem; color: rgba(255,255,255,.78); }
  `;
  document.head.append(style);
  return panel;
}

function renderCloudClinicPanel() {
  const readiness = getCloudClinicTriageReadiness();
  const panel = ensurePanel();
  const summary = panel.querySelector("#cloud-clinic-triage-summary");
  const list = panel.querySelector("#cloud-clinic-triage-list");
  const ledger = readiness.dawnClinicLedger;
  summary.textContent = `${Math.round(readiness.readinessScore * 100)}% ${ledger.missionState} · ${ledger.clearPads} clear pads · ${ledger.medicineDoses} doses · ${ledger.patientCapacity} hammock capacity`;
  const rows = [
    ["landing pads", readiness.cloudClinicLandingPads.length],
    ["pulse kites", readiness.pulseKiteTriage.length],
    ["sterilizer rings", readiness.vaporSterilizerRings.length],
    ["medicine satchels", readiness.medicineSatchelBalances.length],
    ["recovery hammocks", readiness.recoveryHammockBays.length],
    ["descriptor handoff", readiness.rendererHandoff.counts.total]
  ];
  list.innerHTML = rows.map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`).join("");
}

function startPanelLoop() {
  const tick = () => {
    renderCloudClinicPanel();
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
  getCloudClinicTriageReadiness,
  getSoraCloudClinicTriageReadiness: getCloudClinicTriageReadiness,
  getCloudClinicTriageReadinessTree: () => SORA_CLOUD_CLINIC_TRIAGE_READINESS_DOMAIN_TREE,
  getRendererHandoff: composeRendererHandoff
};
