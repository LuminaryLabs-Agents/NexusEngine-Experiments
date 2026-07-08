import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalWeatherShelterReadabilityDomainKit } from "./tropical-weather-shelter-readability-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalWeatherShelterReadabilityDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadability = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-weather-shelter-readability-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical weather shelter readability overlay");
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

function drawLine(start, end, width, opacity, color) {
  const a = toCanvas(start);
  const b = toCanvas(end);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.4, width * overlay.width);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
  context.restore();
}

function drawRing(position, radius, opacity, color) {
  const p = toCanvas(position);
  const r = Math.max(5, radius * Math.min(overlay.width, overlay.height));
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.25, r * 0.08);
  context.beginPath();
  context.arc(p.x, p.y, r, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawEllipse(center, radius = {}, opacity, color) {
  const p = toCanvas(center);
  const rx = Math.max(7, Number(radius.x ?? 0.04) * overlay.width * 0.35);
  const ry = Math.max(4, Number(radius.y ?? 0.02) * overlay.height * 0.36);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = 1.4;
  context.beginPath();
  context.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function renderReadability(readability) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readability?.rendererHandoff?.descriptors ?? {};

  for (const front of descriptors.stormFronts ?? []) {
    drawLine(front.start, front.end, front.width ?? 0.01, front.opacity ?? 0.18, front.intensity > 0.62 ? "rgba(104,187,255,0.76)" : "rgba(180,226,255,0.54)");
  }
  for (const warning of descriptors.waveBreakWarnings ?? []) {
    drawEllipse(warning.center, warning.radius, warning.opacity ?? 0.18, warning.breakRisk > 0.58 ? "rgba(255,144,105,0.76)" : "rgba(255,230,142,0.54)");
  }
  for (const canopy of descriptors.shelterCanopies ?? []) {
    drawRing(canopy.position, canopy.radius ?? 0.04, canopy.opacity ?? 0.22, canopy.comfort > 0.58 ? "rgba(120,255,190,0.86)" : "rgba(208,255,166,0.58)");
  }
  for (const tide of descriptors.tideEscapeWindows ?? []) {
    drawLine(tide.start, tide.end, tide.width ?? 0.008, tide.opacity ?? 0.18, tide.windowScore > 0.56 ? "rgba(123,255,225,0.78)" : "rgba(255,175,114,0.62)");
  }
  for (const cache of descriptors.supplyCacheGlints ?? []) {
    drawRing(cache.position, cache.radius ?? 0.026, cache.opacity ?? 0.22, cache.pickupPriority > 0.55 ? "rgba(255,231,112,0.92)" : "rgba(255,255,255,0.54)");
  }
  for (const beacon of descriptors.duskReturnBeacons ?? []) {
    drawRing(beacon.position, beacon.radius ?? 0.04, beacon.opacity ?? 0.22, beacon.returnUrgency > 0.62 ? "rgba(255,166,239,0.76)" : "rgba(189,186,255,0.62)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getWeatherShelterReadability = () => latestReadability;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      weatherShelterReadability: latestReadability,
      domain: { ...(state.domain ?? {}), tropicalWeatherShelterReadability: latestReadability }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const weatherShelter = latestReadability?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-weather-shelter-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(weatherShelter.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(weatherShelter.descriptors ?? {}) },
      base,
      weatherShelter,
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
      palms: state.palms ?? state.trees,
      trees: state.trees,
      coconuts: state.coconuts,
      floatProps: state.floatProps,
      visualFractal: state.visualFractal,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalWeatherShelterReadability = latestReadability;
    document.body.dataset.tropicalWeatherShelter = String(latestReadability.rendererHandoff.counts.total);
    renderReadability(latestReadability);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
