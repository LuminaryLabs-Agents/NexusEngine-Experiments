import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalIslesSolarDesalinationReadinessDomainKit } from "../../_kits/nexus-frontier-signal-isles/signal-isles-solar-desalination-readiness-domain-kits.js";

export const NEXUS_ENGINE_RUNTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const kit = createSignalIslesSolarDesalinationReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_RUNTIME_CDN, exportCount: Object.keys(NexusEngine ?? {}).length, label: "NexusEngine main CDN" });
let installedHost = null;
let lastReadiness = null;

function fallbackLevel() {
  return {
    scanSites: [{ id: "salt-pan-north", x: -7, z: -4 }, { id: "salt-pan-south", x: 6, z: 3 }, { id: "reef-brine-shelf", x: 0, z: 6 }],
    buildSites: [{ id: "still-pad-01", structureId: "solar-still-01", x: -2, z: 1 }, { id: "still-pad-02", structureId: "solar-still-02", x: 4, z: -2 }],
    gates: [{ id: "relief-skiff-gate", x: 5, z: 1 }],
    resourceNodes: [{ id: "mangrove-charcoal-01", x: -3, z: 4 }, { id: "mangrove-charcoal-02", x: 3, z: -4 }],
    cargo: [{ id: "clay-cistern-cargo", x: 8, z: 3 }],
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
  if (typeof host?.__solarDesalinationReadinessInput === "function") return host.__solarDesalinationReadinessInput();
  return inputFromState(host?.getRenderSnapshot?.() ?? host?.getState?.() ?? {});
}

function computeReadiness(host = window.GameHost) {
  lastReadiness = kit.describe(readinessInput(host));
  return lastReadiness;
}

function composeHandoff(previous, desalination) {
  const prior = previous ?? { descriptors: {}, counts: {} };
  const descriptors = { ...(prior.descriptors ?? {}), solarDesalinationReadiness: desalination.rendererHandoff, ...(desalination.rendererHandoff?.descriptors ?? {}) };
  const counts = { ...(prior.counts ?? {}) };
  for (const [key, value] of Object.entries(desalination.rendererHandoff?.descriptors ?? {})) counts[key] = Array.isArray(value) ? value.length : value ? 1 : 0;
  counts.solarDesalinationDescriptors = desalination.rendererHandoff?.counts?.total ?? 0;
  counts.total = Object.values(counts).filter((value) => typeof value === "number").reduce((sum, value) => sum + value, 0);
  return { ...prior, id: "signal-isles-solar-desalination-composed-renderer-handoff", descriptors, counts, solarDesalinationReadiness: desalination.rendererHandoff };
}

function installHostPatch() {
  const host = window.GameHost;
  if (!host || host === installedHost) return Boolean(host);
  const previousGetState = host.getState?.bind(host);
  const previousGetRenderSnapshot = host.getRenderSnapshot?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.__solarDesalinationReadinessInput = () => inputFromState(previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {});
  host.getSignalIslesSolarDesalinationReadiness = () => computeReadiness(host);
  host.getSolarDesalinationReadiness = host.getSignalIslesSolarDesalinationReadiness;
  host.getSolarDesalinationReadinessTree = () => kit.tree;
  host.getNexusEngineSolarDesalinationRuntime = () => runtimeSurface;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), computeReadiness(host));
  host.getState = () => {
    const state = previousGetState?.() ?? {};
    const solarDesalinationReadiness = computeReadiness(host);
    return { ...state, solarDesalinationReadiness, domain: { ...(state.domain ?? {}), signalIslesSolarDesalinationReadiness: solarDesalinationReadiness } };
  };
  host.getRenderSnapshot = () => {
    const snapshot = previousGetRenderSnapshot?.() ?? previousGetState?.() ?? {};
    const solarDesalinationReadiness = computeReadiness(host);
    return { ...snapshot, solarDesalinationReadiness, domain: { ...(snapshot.domain ?? {}), signalIslesSolarDesalinationReadiness: solarDesalinationReadiness } };
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

  for (const frame of descriptors.solarStillFrames ?? []) {
    const p = project(frame, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = frame.built ? "rgba(255,231,162,.82)" : "rgba(115,228,255,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - 18, p.y + 12);
    ctx.lineTo(p.x, p.y - 18);
    ctx.lineTo(p.x + 18, p.y + 12);
    ctx.closePath();
    ctx.stroke();
  }

  for (const gauge of descriptors.saltPanGauges ?? []) {
    const p = project(gauge, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = gauge.band === "red" ? "rgba(255,127,119,.82)" : gauge.band === "amber" ? "rgba(255,207,115,.72)" : "rgba(159,255,224,.66)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 + Number(gauge.salinity ?? 0) * 24, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (const filter of descriptors.mangroveCharcoalFilters ?? []) {
    const p = project(filter, window.innerWidth, window.innerHeight);
    ctx.fillStyle = filter.packed ? "rgba(159,255,224,.56)" : "rgba(115,228,255,.38)";
    ctx.fillRect(p.x - 5, p.y - 14, 10, 28);
    ctx.fillRect(p.x - 13, p.y + 4, 26, 5);
  }

  for (const jar of descriptors.cisternJars ?? []) {
    const p = project(jar, window.innerWidth, window.innerHeight);
    ctx.fillStyle = jar.sealed ? "rgba(159,255,224,.52)" : "rgba(255,231,162,.44)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const buoy of descriptors.rationBuoys ?? []) {
    const p = project(buoy, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = buoy.released ? "rgba(255,231,162,.82)" : "rgba(115,228,255,.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8 + Number(buoy.capacity ?? 0) * 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const ledger of descriptors.dawnWaterLedgers ?? []) {
    const p = project(ledger, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "rgba(2,9,14,.76)";
    ctx.strokeStyle = ledger.phase === "handoff" ? "rgba(159,255,224,.86)" : ledger.phase === "brine-risk" ? "rgba(255,127,119,.8)" : "rgba(255,231,162,.72)";
    ctx.beginPath();
    roundedRect(ctx, p.x - 72, p.y - 18, 144, 32, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(236,251,255,.92)";
    ctx.font = "11px ui-sans-serif,system-ui";
    ctx.fillText(`water ${ledger.phase} ${Math.round(Number(ledger.readiness ?? 0) * 100)}%`, p.x - 59, p.y + 3);
  }
}

function ensureOverlay() {
  let canvas = document.querySelector("#solarDesalinationOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "solarDesalinationOverlay";
  canvas.setAttribute("aria-label", "Solar desalination readiness descriptor overlay");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "1" });
  document.body.appendChild(canvas);
  return canvas;
}

function updateStatus(state) {
  const status = document.querySelector("#status");
  if (!status || !state) return;
  const prefix = status.textContent?.split(" · solar water")[0] ?? "Signal Isles";
  status.textContent = `${prefix} · solar water ${Math.round(Number(state.readiness ?? 0) * 100)}% · ${state.missionState}`;
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
