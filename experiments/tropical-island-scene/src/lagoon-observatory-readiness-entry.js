import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalLagoonObservatoryReadinessDomainKit } from "./tropical-lagoon-observatory-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalLagoonObservatoryReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-lagoon-observatory-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical lagoon observatory readiness overlay");
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

  for (const trail of descriptors.planktonSampleTrails ?? []) {
    drawLine(trail.start, trail.end, trail.width ?? 0.008, trail.opacity ?? 0.2, trail.samplePriority === "high" ? "rgba(126,255,226,0.84)" : "rgba(128,205,255,0.58)");
  }
  for (const kite of descriptors.dataRelayKites ?? []) {
    drawLine(kite.anchor, kite.kite, kite.width ?? 0.007, kite.opacity ?? 0.18, kite.linkStrength > 0.62 ? "rgba(255,240,130,0.82)" : "rgba(255,255,255,0.45)");
    drawRing(kite.kite, 0.018 + kite.linkStrength * 0.018, kite.opacity ?? 0.18, "rgba(255,240,130,0.75)");
  }
  for (const sensor of descriptors.coralSensorBuoys ?? []) {
    drawRing(sensor.position, sensor.radius ?? 0.03, sensor.opacity ?? 0.22, sensor.calibration === "stable" ? "rgba(122,255,215,0.78)" : "rgba(255,205,120,0.7)");
  }
  for (const nursery of descriptors.mangroveNurseryMarkers ?? []) {
    drawEllipse(nursery.center, nursery.radius, nursery.opacity ?? 0.18, nursery.hydrationScore > 0.62 ? "rgba(140,255,145,0.76)" : "rgba(255,220,140,0.56)");
  }
  for (const corridor of descriptors.mantaCorridorArcs ?? []) {
    drawEllipse(corridor.center, corridor.radius, corridor.opacity ?? 0.18, corridor.corridorClearance > 0.62 ? "rgba(154,210,255,0.78)" : "rgba(255,168,145,0.58)");
  }
  for (const lens of descriptors.lighthouseWatchLenses ?? []) {
    drawRing(lens.position, lens.radius ?? 0.05, lens.opacity ?? 0.25, lens.reportWindow === "send-now" ? "rgba(255,247,154,0.92)" : "rgba(255,255,255,0.52)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getLagoonObservatoryReadiness = () => latestReadiness;
  host.getTropicalLagoonObservatoryReadiness = () => latestReadiness;
  host.getLagoonObservatoryReadinessTree = () => kit.domainTree;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      lagoonObservatoryReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalLagoonObservatoryReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const lagoonObservatory = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-lagoon-observatory-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(lagoonObservatory.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(lagoonObservatory.descriptors ?? {}) },
      base,
      lagoonObservatory,
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
      tideSalvageReadiness: state.tideSalvageReadiness,
      reefRescueReadiness: state.reefRescueReadiness,
      weatherShelterReadability: state.weatherShelterReadability,
      stormClinicReadiness: state.stormClinicReadiness,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalLagoonObservatoryReadiness = latestReadiness;
    document.body.dataset.tropicalLagoonObservatory = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
