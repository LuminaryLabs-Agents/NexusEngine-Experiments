import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalBeachcomberReadabilityDomainKit } from "./tropical-beachcomber-readability-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalBeachcomberReadabilityDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadability = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "beachcomber-readability-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only beachcomber readability overlay");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "2"
  });
  document.querySelector("#app")?.appendChild(overlay);
  context = overlay.getContext("2d");
  return overlay;
}

function resizeOverlay() {
  ensureOverlay();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(innerWidth * ratio));
  const height = Math.max(1, Math.floor(innerHeight * ratio));
  if (overlay.width !== width || overlay.height !== height) {
    overlay.width = width;
    overlay.height = height;
  }
}

function toCanvas(point = {}) {
  const width = overlay.width;
  const height = overlay.height;
  return {
    x: width * (0.5 + Number(point.x ?? 0) * 0.62),
    y: height * (0.5 - Number(point.y ?? 0) * 0.82)
  };
}

function drawLineDescriptor(start, end, width, opacity, color) {
  const a = toCanvas(start);
  const b = toCanvas(end);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.5, width * overlay.width);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
  context.restore();
}

function drawRingDescriptor(position, radius, opacity, color, fill = false) {
  const p = toCanvas(position);
  const r = Math.max(5, radius * Math.min(overlay.width, overlay.height));
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1.5, r * 0.08);
  context.beginPath();
  context.arc(p.x, p.y, r, 0, Math.PI * 2);
  fill ? context.fill() : context.stroke();
  context.restore();
}

function renderReadability(readability) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readability?.rendererHandoff?.descriptors ?? {};

  for (const tide of descriptors.tideWindows ?? []) {
    drawRingDescriptor(tide.center, Math.max(tide.radius?.x ?? 0.2, tide.radius?.y ?? 0.1) * 0.18, tide.opacity ?? 0.12, "rgba(123,244,255,0.95)");
  }
  for (const route of descriptors.shoreRoutes ?? []) {
    drawLineDescriptor(route.start, route.end, route.width ?? 0.006, route.opacity ?? 0.25, "rgba(255,229,134,0.95)");
  }
  for (const lane of descriptors.driftLanes ?? []) {
    drawLineDescriptor(lane.start, lane.end, lane.width ?? 0.006, lane.opacity ?? 0.18, "rgba(164,255,237,0.9)");
  }
  for (const risk of descriptors.coconutRisks ?? []) {
    drawRingDescriptor(risk.position, risk.radius ?? 0.04, risk.opacity ?? 0.25, "rgba(255,118,88,0.85)");
  }
  for (const fish of descriptors.fishFocus ?? []) {
    drawRingDescriptor(fish.position, fish.radius ?? 0.04, Math.min(0.55, fish.intensity ?? 0.3), "rgba(255,207,86,0.85)");
  }
  for (const task of descriptors.taskBeacons ?? []) {
    drawRingDescriptor(task.position, task.radius ?? 0.04, Math.min(0.72, task.pulse ?? 0.4), "rgba(255,255,255,0.9)");
    drawRingDescriptor(task.position, (task.radius ?? 0.04) * 0.38, Math.min(0.22, task.priority ?? 0.2), "rgba(255,224,123,0.8)", true);
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getBeachcomberReadability = () => latestReadability;
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const beachcomber = latestReadability?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-renderer-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(beachcomber.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(beachcomber.descriptors ?? {}) },
      base,
      beachcomber,
      runtime: { nexusEngineCdn: NEXUS_ENGINE_CDN, nexusEngineExportCount: Object.keys(NexusEngine).length }
    };
  };
}

function frame(now) {
  const host = window.GameHost;
  if (host?.getState) {
    patchGameHost(host);
    const state = host.getState();
    latestReadability = kit.describe({
      ...state,
      time: now / 1000,
      orbit: state.camera?.angle,
      coconuts: state.coconuts,
      fish: state.fish,
      floatProps: state.floatProps,
      visualFractal: state.visualFractal
    });
    window.__tropicalBeachcomberReadability = latestReadability;
    renderReadability(latestReadability);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
