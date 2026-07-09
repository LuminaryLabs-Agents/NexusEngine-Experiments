import { createStonewakeFloodRescueReadinessDomainKit, STONEWAKE_RESCUE_READINESS_TREE } from "./stonewake-rescue-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createStonewakeFloodRescueReadinessDomainKit();
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let latestReadiness = null;

function safeClone(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
}

function readHost() {
  const host = globalThis.GameHost ?? {};
  const state = typeof host.getState === "function" ? host.getState() : null;
  const level = typeof host.getLevel === "function" ? host.getLevel() : null;
  return { host, state, level };
}

function ensureOverlay() {
  let overlay = document.querySelector("#stonewake-rescue-overlay");
  if (overlay) return overlay;
  const shell = document.querySelector("#shell") ?? document.body;
  overlay = document.createElement("canvas");
  overlay.id = "stonewake-rescue-overlay";
  overlay.width = 1280;
  overlay.height = 720;
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  overlay.style.mixBlendMode = "screen";
  shell.appendChild(overlay);
  return overlay;
}

function worldToScreen(x, y, camera = {}) {
  return { x: Number(x) - Number(camera.x ?? 0), y: Number(y) - Number(camera.y ?? 0) };
}

function drawCircle(ctx, descriptor, camera, radius, stroke, fill = null) {
  const p = worldToScreen(descriptor.x, descriptor.y, camera);
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawOverlay(readiness) {
  const overlay = ensureOverlay();
  const ctx = overlay.getContext("2d");
  if (!ctx || !readiness) return;
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  const camera = readiness.sourceCamera ?? {};
  const descriptors = readiness.rendererHandoff?.descriptors ?? {};
  ctx.save();
  ctx.lineWidth = 2;

  for (const band of descriptors.floodlinePressureBands ?? []) {
    const p = worldToScreen(0, band.y, camera);
    ctx.fillStyle = band.phase === "critical" ? "rgba(255, 80, 96, 0.14)" : "rgba(87, 221, 255, 0.10)";
    ctx.fillRect(0, p.y, overlay.width, Math.max(2, band.h));
  }

  for (const mark of descriptors.chalkRouteMarks ?? []) {
    const p = worldToScreen(mark.x, mark.y, camera);
    ctx.fillStyle = `rgba(226, 244, 255, ${0.18 + mark.legibility * 0.28})`;
    ctx.fillRect(p.x - 12, p.y - 2, 24, 4);
    ctx.fillRect(p.x + 6, p.y - 8, 4, 12);
  }

  for (const pocket of descriptors.airPocketCaches ?? []) {
    drawCircle(ctx, pocket, camera, 16 + pocket.capacity * 3, "rgba(146, 246, 255, 0.48)", `rgba(87, 221, 255, ${0.05 + pocket.stability * 0.12})`);
  }

  for (const anchor of descriptors.ropeLiftAnchors ?? []) {
    const p = worldToScreen(anchor.x, anchor.y, camera);
    ctx.strokeStyle = `rgba(255, 224, 150, ${0.18 + anchor.tension * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + anchor.h);
    ctx.stroke();
  }

  for (const ping of descriptors.survivorEchoPings ?? []) {
    drawCircle(ctx, ping, camera, 8 + ping.urgency * 19, `rgba(255, 220, 96, ${0.26 + ping.urgency * 0.5})`);
    const p = worldToScreen(ping.x, ping.y, camera);
    ctx.fillStyle = "rgba(255, 240, 180, 0.78)";
    ctx.fillRect(p.x - 2, p.y - 10, 4, 14);
  }

  const bell = descriptors.rescueBellHandoff;
  if (bell) {
    const p = worldToScreen(bell.x, bell.y, camera);
    ctx.strokeStyle = bell.phase === "ring" ? "rgba(120, 255, 170, 0.9)" : "rgba(255, 220, 110, 0.62)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22 + bell.readiness * 28, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function patchHost() {
  const { host, state, level } = readHost();
  if (!host || !state || !level) return false;
  latestReadiness = domainKit.describe({ state, level, time: performance.now() / 1000 });
  latestReadiness.runtimeSurface = runtimeSurface;
  latestReadiness.sourceCamera = safeClone(state.camera ?? { x: 0, y: 0 });
  const previousGetState = host.getState?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  globalThis.GameHost = {
    ...host,
    getState: () => {
      const base = typeof previousGetState === "function" ? previousGetState() : state;
      return { ...base, floodRescueReadiness: latestReadiness, runtimeSurface: { ...(base.runtimeSurface ?? {}), stonewakeFloodRescue: runtimeSurface } };
    },
    getStonewakeFloodRescueReadiness: () => latestReadiness,
    getFloodRescueReadiness: () => latestReadiness,
    getStonewakeFloodRescueReadinessTree: () => STONEWAKE_RESCUE_READINESS_TREE,
    getRendererHandoff: () => {
      const previous = typeof previousGetRendererHandoff === "function" ? previousGetRendererHandoff() : null;
      const floodRescue = latestReadiness?.rendererHandoff ?? null;
      return {
        ...(previous ?? {}),
        id: "stonewake-composed-renderer-handoff",
        stonewakeFloodRescue: floodRescue,
        descriptors: { ...(previous?.descriptors ?? {}), stonewakeFloodRescue: floodRescue },
        counts: {
          ...(previous?.counts ?? {}),
          stonewakeFloodRescueDescriptors: floodRescue?.counts?.total ?? 0,
          total: (previous?.counts?.total ?? 0) + (floodRescue?.counts?.total ?? 0)
        },
        rendererConsumesDescriptorsOnly: true
      };
    }
  };
  drawOverlay(latestReadiness);
  return true;
}

function tick() {
  patchHost();
  requestAnimationFrame(tick);
}

async function boot() {
  const NexusEngine = await import(NEXUS_ENGINE_CDN);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  document.querySelector("#wrap")?.setAttribute("data-upgrade", "stonewake-flood-rescue-readiness-renderer-handoff-pass");
  tick();
}

boot().catch((error) => {
  runtimeSurface = { imported: false, factoryName: "cdn-error", message: String(error?.message ?? error) };
  tick();
});
