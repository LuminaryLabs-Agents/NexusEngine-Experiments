import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalIslesFieldHospitalTriageReadinessDomainKit } from "../../_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js";

export const NEXUS_ENGINE_RUNTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const kit = createSignalIslesFieldHospitalTriageReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_RUNTIME_CDN, exportCount: Object.keys(NexusEngine ?? {}).length, label: "NexusEngine main CDN" });
let installedHost = null;
let lastReadiness = null;

function fallbackLevel() {
  return {
    scanSites: [{ id: "scan-ruin-01", x: -7, z: -3 }, { id: "scan-ruin-02", x: 1.5, z: 5 }, { id: "scan-ruin-03", x: 7, z: -2.2 }],
    buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 0, z: 1 }],
    gates: [{ id: "gate-01", x: 5, z: 1 }],
    resourceNodes: [{ id: "resource-node-01", x: -3, z: 4 }, { id: "resource-node-02", x: 3, z: -4 }],
    cargo: [{ id: "cargo-01", x: 8, z: 3 }],
    sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
  };
}

function inputFromState(state = {}) {
  return {
    level: state.level ?? fallbackLevel(),
    preset: state.preset ?? {},
    session: state.session ?? {},
    objective: state.objective ?? {},
    sequence: state.sequence ?? {},
    kitStates: state.kitStates ?? { scanSurvey: state.scan ?? { completedTargetIds: [] } },
    elapsed: state.session?.elapsed ?? state.elapsed ?? 0
  };
}

function readinessInput(host) {
  if (typeof host?.__fieldHospitalTriageReadinessInput === "function") return host.__fieldHospitalTriageReadinessInput();
  return inputFromState(host?.getRenderSnapshot?.() ?? host?.getState?.() ?? {});
}

function computeReadiness(host = window.GameHost) {
  lastReadiness = kit.describe(readinessInput(host));
  return lastReadiness;
}

function composeHandoff(previous, triage) {
  const prior = previous ?? { descriptors: {}, counts: {} };
  const descriptors = { ...(prior.descriptors ?? {}), fieldHospitalTriageReadiness: triage.rendererHandoff, ...(triage.rendererHandoff?.descriptors ?? {}) };
  const counts = { ...(prior.counts ?? {}) };
  for (const [key, value] of Object.entries(triage.rendererHandoff?.descriptors ?? {})) counts[key] = Array.isArray(value) ? value.length : value ? 1 : 0;
  counts.fieldHospitalTriageDescriptors = triage.rendererHandoff?.counts?.total ?? 0;
  counts.total = Object.values(counts).filter((value) => typeof value === "number").reduce((sum, value) => sum + value, 0);
  return { ...prior, id: "signal-isles-field-hospital-triage-composed-renderer-handoff", descriptors, counts, fieldHospitalTriageReadiness: triage.rendererHandoff };
}

function installHostPatch() {
  const host = window.GameHost;
  if (!host || host === installedHost) return Boolean(host);
  const previousGetState = host.getState?.bind(host);
  const previousGetRenderSnapshot = host.getRenderSnapshot?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.__fieldHospitalTriageReadinessInput = () => inputFromState(previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {});
  host.getSignalIslesFieldHospitalTriageReadiness = () => computeReadiness(host);
  host.getFieldHospitalTriageReadiness = host.getSignalIslesFieldHospitalTriageReadiness;
  host.getFieldHospitalTriageReadinessTree = () => kit.tree;
  host.getNexusEngineFieldHospitalTriageRuntime = () => runtimeSurface;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), computeReadiness(host));
  host.getState = () => {
    const state = previousGetState?.() ?? {};
    const fieldHospitalTriageReadiness = computeReadiness(host);
    return { ...state, fieldHospitalTriageReadiness, domain: { ...(state.domain ?? {}), signalIslesFieldHospitalTriageReadiness: fieldHospitalTriageReadiness } };
  };
  host.getRenderSnapshot = () => {
    const snapshot = previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {};
    const fieldHospitalTriageReadiness = computeReadiness(host);
    return { ...snapshot, fieldHospitalTriageReadiness, domain: { ...(snapshot.domain ?? {}), signalIslesFieldHospitalTriageReadiness: fieldHospitalTriageReadiness } };
  };
  installedHost = host;
  return true;
}

function project(descriptor, width, height) {
  const source = descriptor.from ?? descriptor;
  return { x: width * 0.5 + Number(source.x ?? 0) * 16, y: height * 0.55 + Number(source.z ?? source.y ?? 0) * 11 };
}

function roundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") return ctx.roundRect(x, y, width, height, radius);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawOverlay(canvas, ctx, state) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const descriptors = state?.rendererHandoff?.descriptors ?? {};
  for (const trail of descriptors.stretcherTrailThreads ?? []) {
    const a = project(trail.from, window.innerWidth, window.innerHeight);
    const b = project(trail.to, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = `rgba(143,255,181,${0.2 + Number(trail.clarity ?? 0) * 0.42})`;
    ctx.setLineDash([9, 7]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 34, b.x, b.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (const flag of descriptors.triageFlags ?? []) {
    const p = project(flag, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = flag.band === "red" ? "rgba(255,111,122,.8)" : flag.band === "amber" ? "rgba(255,211,109,.72)" : "rgba(143,255,181,.68)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9 + Number(flag.severity ?? 0) * 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(p.x - 2, p.y - 20, 4, 22);
  }
  for (const cache of descriptors.medicineCaches ?? []) {
    const p = project(cache, window.innerWidth, window.innerHeight);
    ctx.fillStyle = cache.stocked ? "rgba(143,255,181,.52)" : "rgba(255,211,109,.48)";
    ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
  }
  for (const ledger of descriptors.dawnCareLedgers ?? []) {
    const p = project(ledger, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "rgba(2,9,14,.74)";
    ctx.strokeStyle = ledger.phase === "handoff" ? "rgba(143,255,181,.82)" : ledger.phase === "critical" ? "rgba(255,111,122,.78)" : "rgba(255,211,109,.68)";
    ctx.beginPath();
    roundedRect(ctx, p.x - 64, p.y - 18, 128, 30, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(236,251,255,.9)";
    ctx.font = "11px ui-sans-serif,system-ui";
    ctx.fillText(`clinic ${ledger.phase} ${Math.round(Number(ledger.readiness ?? 0) * 100)}%`, p.x - 52, p.y + 2);
  }
}

function ensureOverlay() {
  let canvas = document.querySelector("#fieldHospitalTriageOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "fieldHospitalTriageOverlay";
  canvas.setAttribute("aria-label", "Field hospital triage descriptor overlay");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "1" });
  document.body.appendChild(canvas);
  return canvas;
}

function frame() {
  installHostPatch();
  const canvas = ensureOverlay();
  const ctx = canvas.getContext("2d");
  const state = computeReadiness(window.GameHost);
  drawOverlay(canvas, ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
