import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalIslesMangroveBridgeEvacuationReadinessDomainKit } from "../../_kits/nexus-frontier-signal-isles/signal-isles-mangrove-bridge-evacuation-readiness-domain-kits.js";

export const NEXUS_ENGINE_RUNTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const kit = createSignalIslesMangroveBridgeEvacuationReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_RUNTIME_CDN, exportCount: Object.keys(NexusEngine ?? {}).length, label: "NexusEngine main CDN" });
let installedHost = null;
let lastReadiness = null;

function fallbackLevel() {
  return {
    scanSites: [{ id: "tide-pole-east", x: -7.2, z: 0.8 }, { id: "tide-pole-west", x: 6.4, z: -1.2 }, { id: "mudflat-depth", x: 0.8, z: 6.3 }],
    buildSites: [{ id: "root-bridge-north", structureId: "root-bridge-01", x: -5.5, z: 3.4 }, { id: "root-bridge-south", structureId: "root-bridge-02", x: 4.8, z: -2.8 }],
    gates: [{ id: "safe-skiff-channel", x: 7.5, z: 2.1 }],
    resourceNodes: [{ id: "driftwood-cache-a", x: -6.2, z: -3.5 }, { id: "driftwood-cache-b", x: 5.2, z: 3.6 }, { id: "lantern-crab-c", x: 1.2, z: -5.2 }],
    cargo: [{ id: "flag-bundle", x: -2.5, z: -6.1 }],
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
    environment: state.environment ?? {},
    elapsed: state.session?.elapsed ?? state.elapsed ?? 0
  };
}

function readinessInput(host) {
  if (typeof host?.__mangroveBridgeEvacuationReadinessInput === "function") return host.__mangroveBridgeEvacuationReadinessInput();
  return inputFromState(host?.getRenderSnapshot?.() ?? host?.getState?.() ?? {});
}

function computeReadiness(host = window.GameHost) {
  lastReadiness = kit.describe(readinessInput(host));
  return lastReadiness;
}

function composeHandoff(previous, mangrove) {
  const prior = previous ?? { descriptors: {}, counts: {} };
  const descriptors = { ...(prior.descriptors ?? {}), mangroveBridgeEvacuationReadiness: mangrove.rendererHandoff, ...(mangrove.rendererHandoff?.descriptors ?? {}) };
  const counts = { ...(prior.counts ?? {}) };
  for (const [key, value] of Object.entries(mangrove.rendererHandoff?.descriptors ?? {})) counts[key] = Array.isArray(value) ? value.length : value ? 1 : 0;
  counts.mangroveBridgeEvacuationDescriptors = mangrove.rendererHandoff?.counts?.total ?? 0;
  counts.total = Object.values(counts).filter((value) => typeof value === "number").reduce((sum, value) => sum + value, 0);
  return { ...prior, id: "signal-isles-mangrove-bridge-evacuation-composed-renderer-handoff", descriptors, counts, mangroveBridgeEvacuationReadiness: mangrove.rendererHandoff };
}

function installHostPatch() {
  const host = window.GameHost;
  if (!host || host === installedHost) return Boolean(host);
  const previousGetState = host.getState?.bind(host);
  const previousGetRenderSnapshot = host.getRenderSnapshot?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.__mangroveBridgeEvacuationReadinessInput = () => inputFromState(previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {});
  host.getSignalIslesMangroveBridgeEvacuationReadiness = () => computeReadiness(host);
  host.getMangroveBridgeEvacuationReadiness = host.getSignalIslesMangroveBridgeEvacuationReadiness;
  host.getMangroveBridgeEvacuationReadinessTree = () => kit.tree;
  host.getNexusEngineMangroveBridgeRuntime = () => runtimeSurface;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), computeReadiness(host));
  host.getState = () => {
    const state = previousGetState?.() ?? {};
    const mangroveBridgeEvacuationReadiness = computeReadiness(host);
    return { ...state, mangroveBridgeEvacuationReadiness, domain: { ...(state.domain ?? {}), signalIslesMangroveBridgeEvacuationReadiness: mangroveBridgeEvacuationReadiness } };
  };
  host.getRenderSnapshot = () => {
    const snapshot = previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {};
    const mangroveBridgeEvacuationReadiness = computeReadiness(host);
    return { ...snapshot, mangroveBridgeEvacuationReadiness, domain: { ...(snapshot.domain ?? {}), signalIslesMangroveBridgeEvacuationReadiness: mangroveBridgeEvacuationReadiness } };
  };
  installedHost = host;
  return true;
}

function project(descriptor, width, height) {
  return { x: width * 0.5 + Number(descriptor.x ?? 0) * 16, y: height * 0.56 + Number(descriptor.z ?? descriptor.y ?? 0) * 11 };
}

function pathArc(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.x - 26, p.y + 14);
  ctx.bezierCurveTo(p.x - 8, p.y - 16, p.x + 10, p.y - 18, p.x + 28, p.y + 10);
  ctx.moveTo(p.x - 18, p.y + 6);
  ctx.bezierCurveTo(p.x - 4, p.y - 8, p.x + 7, p.y - 8, p.x + 20, p.y + 5);
}

function drawOverlay(canvas, ctx, state) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const descriptors = state?.rendererHandoff?.descriptors ?? {};

  for (const bridge of descriptors.mangroveRootBridges ?? []) {
    const p = project(bridge, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = bridge.woven ? "rgba(159,255,224,.82)" : "rgba(115,228,255,.52)";
    ctx.lineWidth = 3;
    pathArc(ctx, p);
    ctx.stroke();
  }

  for (const causeway of descriptors.plankCauseways ?? []) {
    const p = project(causeway, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = causeway.lashed ? "rgba(255,231,162,.82)" : "rgba(255,207,115,.5)";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(p.x - 22 + i * 9, p.y + 10);
      ctx.lineTo(p.x - 14 + i * 9, p.y - 12);
      ctx.stroke();
    }
  }

  for (const gauge of descriptors.tidePoleGauges ?? []) {
    const p = project(gauge, window.innerWidth, window.innerHeight);
    ctx.fillStyle = gauge.levelBand === "flood" ? "rgba(255,127,119,.82)" : gauge.levelBand === "rising" ? "rgba(255,207,115,.72)" : "rgba(159,255,224,.66)";
    ctx.fillRect(p.x - 3, p.y - 30, 6, 60);
  }

  for (const flag of descriptors.rescueSkiffFlags ?? []) {
    const p = project(flag, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "rgba(236,251,255,.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 18);
    ctx.lineTo(p.x, p.y - 26);
    ctx.stroke();
    ctx.fillStyle = flag.marked ? "rgba(159,255,224,.78)" : "rgba(115,228,255,.48)";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 24);
    ctx.lineTo(p.x + 24 + Number(flag.flutter ?? 0) * 8, p.y - 16);
    ctx.lineTo(p.x, p.y - 7);
    ctx.closePath();
    ctx.fill();
  }

  for (const lantern of descriptors.crabLanternGuides ?? []) {
    const p = project(lantern, window.innerWidth, window.innerHeight);
    ctx.fillStyle = lantern.lit ? "rgba(255,231,162,.72)" : "rgba(115,228,255,.36)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + Number(lantern.glow ?? 1) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ledger of descriptors.duskBridgeLedgers ?? []) {
    const p = project(ledger, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "rgba(2,9,14,.78)";
    ctx.strokeStyle = ledger.phase === "evacuation-open" ? "rgba(159,255,224,.9)" : ledger.phase === "tide-risk" ? "rgba(255,127,119,.82)" : "rgba(255,231,162,.74)";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(p.x - 92, p.y - 18, 184, 34, 12);
    else ctx.rect(p.x - 92, p.y - 18, 184, 34);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(236,251,255,.92)";
    ctx.font = "11px ui-sans-serif,system-ui";
    ctx.fillText(`mangrove ${ledger.phase} ${Math.round(Number(ledger.readiness ?? 0) * 100)}%`, p.x - 78, p.y + 3);
  }
}

function ensureOverlay() {
  let canvas = document.querySelector("#mangroveBridgeEvacuationOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "mangroveBridgeEvacuationOverlay";
  canvas.setAttribute("aria-label", "Mangrove bridge evacuation readiness descriptor overlay");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "2" });
  document.body.appendChild(canvas);
  return canvas;
}

function updateStatus(state) {
  const status = document.querySelector("#status");
  if (!status || !state) return;
  const prefix = status.textContent?.split(" · mangrove bridge")[0] ?? "Signal Isles";
  status.textContent = `${prefix} · mangrove bridge ${Math.round(Number(state.readiness ?? 0) * 100)}% · ${state.missionState}`;
}

function frame() {
  installHostPatch();
  const canvas = ensureOverlay();
  const ctx = canvas.getContext("2d");
  const state = computeReadiness(window.GameHost);
  drawOverlay(canvas, ctx, state);
  updateStatus(state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
