import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalIslesStormSurgeRelayReadinessDomainKit } from "../../_kits/nexus-frontier-signal-isles/signal-isles-storm-surge-relay-readiness-domain-kits.js";

export const NEXUS_ENGINE_RUNTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const kit = createSignalIslesStormSurgeRelayReadinessDomainKit();
let lastReadiness = null;
let installedHost = null;
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_RUNTIME_CDN, exportCount: Object.keys(NexusEngine ?? {}).length, label: "NexusEngine main CDN" });

function makeFallbackLevel() {
  return {
    scanSites: [{ id: "scan-ruin-01", x: -7, z: -3 }, { id: "scan-ruin-02", x: 1.5, z: 5 }, { id: "scan-ruin-03", x: 7, z: -2.2 }],
    buildSites: [{ id: "build-site-01", structureId: "signal-mast-01", x: 0, z: 1 }],
    gates: [{ id: "gate-01", x: 5, z: 1 }],
    resourceNodes: [{ id: "resource-node-01", x: -3, z: 4 }, { id: "resource-node-02", x: 3, z: -4 }],
    cargo: [{ id: "cargo-01", x: 8, z: 3 }],
    sceneRecipe: { objects: [{ id: "final-beacon", transform: { x: 11, z: 0 } }] }
  };
}

function readinessInput(host) {
  const state = host?.getRenderSnapshot?.() ?? host?.getState?.() ?? {};
  return {
    level: state.level ?? makeFallbackLevel(),
    preset: state.preset ?? {},
    session: state.session ?? {},
    objective: state.objective ?? {},
    sequence: state.sequence ?? {},
    kitStates: state.kitStates ?? { scanSurvey: state.scan ?? { completedTargetIds: [] } },
    elapsed: state.session?.elapsed ?? 0
  };
}

function computeReadiness(host = window.GameHost) {
  lastReadiness = kit.describe(readinessInput(host));
  return lastReadiness;
}

function composeHandoff(previous, surge) {
  const prior = previous ?? { descriptors: {}, counts: {} };
  const descriptors = { ...(prior.descriptors ?? {}), stormSurgeRelayReadiness: surge.rendererHandoff, ...(surge.rendererHandoff?.descriptors ?? {}) };
  const counts = { ...(prior.counts ?? {}) };
  for (const [key, value] of Object.entries(surge.rendererHandoff?.descriptors ?? {})) counts[key] = Array.isArray(value) ? value.length : value ? 1 : 0;
  counts.stormSurgeRelayDescriptors = surge.rendererHandoff?.counts?.total ?? 0;
  counts.total = Object.values(counts).filter((value) => typeof value === "number").reduce((sum, value) => sum + value, 0);
  return { ...prior, id: "signal-isles-storm-surge-composed-renderer-handoff", descriptors, counts, stormSurgeRelayReadiness: surge.rendererHandoff };
}

function installHostPatch() {
  const host = window.GameHost;
  if (!host || host === installedHost) return Boolean(host);
  const previousGetState = host.getState?.bind(host);
  const previousGetRenderSnapshot = host.getRenderSnapshot?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getSignalIslesStormSurgeRelayReadiness = () => computeReadiness(host);
  host.getStormSurgeRelayReadiness = host.getSignalIslesStormSurgeRelayReadiness;
  host.getStormSurgeRelayReadinessTree = () => kit.tree;
  host.getNexusEngineStormSurgeRuntime = () => runtimeSurface;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), computeReadiness(host));
  host.getState = () => {
    const state = previousGetState?.() ?? {};
    const stormSurgeRelayReadiness = computeReadiness(host);
    return { ...state, stormSurgeRelayReadiness, domain: { ...(state.domain ?? {}), signalIslesStormSurgeRelayReadiness: stormSurgeRelayReadiness } };
  };
  host.getRenderSnapshot = () => {
    const snapshot = previousGetRenderSnapshot?.() ?? host.getState();
    const stormSurgeRelayReadiness = computeReadiness(host);
    return { ...snapshot, stormSurgeRelayReadiness, domain: { ...(snapshot.domain ?? {}), signalIslesStormSurgeRelayReadiness: stormSurgeRelayReadiness } };
  };
  installedHost = host;
  return true;
}

function project(descriptor, width, height) {
  const x = Number(descriptor.x ?? descriptor.from?.x ?? 0);
  const z = Number(descriptor.z ?? descriptor.from?.z ?? 0);
  return { x: width * 0.5 + x * 16, y: height * 0.55 + z * 11 };
}

function drawOverlay(canvas, ctx, state) {
  const width = canvas.width = Math.floor(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2));
  const height = canvas.height = Math.floor(window.innerHeight * Math.min(window.devicePixelRatio || 1, 2));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 2;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  ctx.save();
  ctx.scale(scale, scale);
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;
  const descriptors = state?.rendererHandoff?.descriptors ?? {};
  for (const lane of descriptors.evacuationRaftLanes ?? []) {
    const a = project(lane.from, cssWidth, cssHeight);
    const b = project(lane.to, cssWidth, cssHeight);
    ctx.strokeStyle = `rgba(109,243,255,${0.18 + Number(lane.strength ?? 0) * 0.42})`;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 44, b.x, b.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (const gauge of descriptors.tideGaugeBeacons ?? []) {
    const p = project(gauge, cssWidth, cssHeight);
    ctx.strokeStyle = gauge.phase === "rising" ? "rgba(255,207,122,.78)" : "rgba(109,243,255,.62)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12 + Number(gauge.pressure ?? 0) * 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const brace of descriptors.breakwaterBraceNodes ?? []) {
    const p = project(brace, cssWidth, cssHeight);
    ctx.fillStyle = brace.braced ? "rgba(143,255,181,.5)" : "rgba(255,143,112,.46)";
    ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
  }
  for (const ledger of descriptors.surgeManifestLedgers ?? []) {
    const p = project(ledger, cssWidth, cssHeight);
    ctx.fillStyle = "rgba(2,9,14,.72)";
    ctx.strokeStyle = ledger.phase === "launch" ? "rgba(143,255,181,.8)" : "rgba(255,211,109,.65)";
    ctx.beginPath();
    ctx.roundRect?.(p.x - 58, p.y - 18, 116, 28, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(236,251,255,.88)";
    ctx.font = "11px ui-sans-serif,system-ui";
    ctx.fillText(`surge ${ledger.phase} ${Math.round(Number(ledger.readiness ?? 0) * 100)}%`, p.x - 45, p.y);
  }
  ctx.restore();
}

function ensureOverlay() {
  let canvas = document.querySelector("#stormSurgeRelayOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "stormSurgeRelayOverlay";
  canvas.setAttribute("aria-label", "Storm surge relay descriptor overlay");
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
