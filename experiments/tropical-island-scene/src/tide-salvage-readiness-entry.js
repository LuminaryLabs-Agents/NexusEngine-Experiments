import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalTideSalvageReadinessDomainKit } from "./tropical-tide-salvage-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalTideSalvageReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-tide-salvage-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical tide salvage readiness overlay");
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

function drawEllipse(center, radius = {}, opacity, color) {
  const p = toCanvas(center);
  const rx = Math.max(7, Number(radius.x ?? 0.05) * overlay.width * 0.34);
  const ry = Math.max(4, Number(radius.y ?? 0.02) * overlay.height * 0.36);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = 1.35;
  context.beginPath();
  context.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function renderReadiness(readiness) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readiness?.rendererHandoff?.descriptors ?? {};

  for (const tide of descriptors.tideSurgeWindows ?? []) {
    drawEllipse(tide.center, tide.radius, tide.opacity ?? 0.18, tide.surgeRisk > 0.62 ? "rgba(255,118,96,0.82)" : "rgba(255,218,128,0.56)");
  }
  for (const cut of descriptors.reefCutHazards ?? []) {
    drawLine(cut.start, cut.end, cut.width ?? 0.007, cut.opacity ?? 0.2, cut.cutRisk > 0.6 ? "rgba(255,94,130,0.82)" : "rgba(255,195,132,0.58)");
  }
  for (const route of descriptors.outriggerRouteThreads ?? []) {
    drawLine(route.start, route.end, route.width ?? 0.008, route.opacity ?? 0.2, route.steadiness > 0.62 ? "rgba(112,255,204,0.82)" : "rgba(156,222,255,0.58)");
  }
  for (const cargo of descriptors.shipwreckCargoBeacons ?? []) {
    drawRing(cargo.position, cargo.radius ?? 0.03, cargo.opacity ?? 0.24, cargo.cargoPriority > 0.62 ? "rgba(255,238,126,0.9)" : "rgba(210,255,204,0.62)");
  }
  for (const pearl of descriptors.pearlCacheGlimmers ?? []) {
    drawRing(pearl.position, pearl.radius ?? 0.02, pearl.opacity ?? 0.2, pearl.glimmerScore > 0.62 ? "rgba(236,255,255,0.9)" : "rgba(154,240,255,0.62)");
  }
  for (const market of descriptors.sunsetMarketDeliveries ?? []) {
    drawRing(market.position, market.radius ?? 0.04, market.opacity ?? 0.22, market.deliveryReadiness > 0.6 ? "rgba(255,178,116,0.9)" : "rgba(255,218,170,0.6)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getTideSalvageReadiness = () => latestReadiness;
  host.getTropicalTideSalvageReadiness = () => latestReadiness;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      tideSalvageReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalTideSalvageReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const tideSalvage = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-tide-salvage-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(tideSalvage.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(tideSalvage.descriptors ?? {}) },
      base,
      tideSalvage,
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
      palms: state.palms ?? state.trees,
      trees: state.trees,
      coconuts: state.coconuts,
      floatProps: state.floatProps,
      reefRescueReadiness: state.reefRescueReadiness,
      weatherShelterReadability: state.weatherShelterReadability,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalTideSalvageReadiness = latestReadiness;
    document.body.dataset.tropicalTideSalvage = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
