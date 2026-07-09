import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalRainwaterPurificationReadinessDomainKit } from "./tropical-rainwater-purification-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalRainwaterPurificationReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-rainwater-purification-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical rainwater purification readiness overlay");
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
  context.lineWidth = Math.max(1.25, width * overlay.width);
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

function renderReadiness(readiness) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readiness?.rendererHandoff?.descriptors ?? {};

  for (const gutter of descriptors.catchmentGutters ?? []) {
    drawLine(gutter.start, gutter.end, gutter.width ?? 0.008, gutter.opacity ?? 0.2, gutter.captureScore > 0.62 ? "rgba(126,246,255,0.84)" : "rgba(160,220,255,0.58)");
  }
  for (const channel of descriptors.palmLeafChannels ?? []) {
    drawLine(channel.start, channel.end, channel.width ?? 0.008, channel.opacity ?? 0.18, channel.flowScore > 0.62 ? "rgba(132,255,188,0.78)" : "rgba(182,245,170,0.52)");
  }
  for (const filter of descriptors.charcoalFilterBeds ?? []) {
    drawRing(filter.position, filter.radius ?? 0.03, filter.opacity ?? 0.22, filter.clarityScore > 0.62 ? "rgba(112,248,230,0.78)" : "rgba(205,218,188,0.56)");
  }
  for (const cistern of descriptors.cisternBoilWatches ?? []) {
    drawRing(cistern.position, cistern.radius ?? 0.032, cistern.opacity ?? 0.24, cistern.minutesToSafe < 12 ? "rgba(255,238,142,0.86)" : "rgba(255,144,112,0.62)");
  }
  for (const route of descriptors.clayJugRationRoutes ?? []) {
    drawLine(route.start, route.end, route.width ?? 0.008, route.opacity ?? 0.18, route.rationPriority > 0.62 ? "rgba(255,217,128,0.84)" : "rgba(255,185,132,0.56)");
  }
  for (const station of descriptors.dawnHydrationStations ?? []) {
    drawRing(station.position, station.radius ?? 0.04, station.opacity ?? 0.24, station.hydrationReadiness > 0.62 ? "rgba(255,245,126,0.9)" : "rgba(146,235,255,0.6)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getRainwaterPurificationReadiness = () => latestReadiness;
  host.getTropicalRainwaterPurificationReadiness = () => latestReadiness;
  host.getRainwaterPurificationReadinessTree = () => kit.domainTree;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      rainwaterPurificationReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalRainwaterPurificationReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const rainwaterPurification = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-rainwater-purification-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(rainwaterPurification.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(rainwaterPurification.descriptors ?? {}) },
      base,
      rainwaterPurification,
      runtime: { nexusEngineCdn: NEXUS_ENGINE_CDN, nexusEngineExportCount: Object.keys(NexusEngine).length }
    };
  };
}

function frame(now) {
  const host = window.GameHost;
  if (host?.getState) {
    patchGameHost(host);
    const state = host.getState();
    latestReadiness = kit.describe({
      ...state,
      time: now / 1000,
      orbit: state.camera?.angle,
      fish: state.fish,
      floatProps: state.floatProps,
      coconuts: state.coconuts,
      stormClinicReadiness: state.stormClinicReadiness,
      tideSalvageReadiness: state.tideSalvageReadiness,
      reefRescueReadiness: state.reefRescueReadiness,
      weatherShelterReadability: state.weatherShelterReadability,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalRainwaterPurificationReadiness = latestReadiness;
    document.body.dataset.tropicalRainwaterPurification = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
