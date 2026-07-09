import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalStormClinicReadinessDomainKit } from "./tropical-storm-clinic-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalStormClinicReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-storm-clinic-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical storm clinic readiness overlay");
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

  for (const shade of descriptors.clinicTentShades ?? []) {
    drawEllipse(shade.center, shade.radius, shade.opacity ?? 0.18, shade.shadeCoverage > 0.62 ? "rgba(138,255,204,0.72)" : "rgba(255,231,146,0.52)");
  }
  for (const lane of descriptors.raftStretcherLanes ?? []) {
    drawLine(lane.start, lane.end, lane.width ?? 0.008, lane.opacity ?? 0.2, lane.laneSteadiness > 0.62 ? "rgba(106,235,255,0.82)" : "rgba(160,210,255,0.58)");
  }
  for (const buoy of descriptors.triageBuoys ?? []) {
    drawRing(buoy.position, buoy.radius ?? 0.03, buoy.opacity ?? 0.25, buoy.triageUrgency > 0.62 ? "rgba(255,112,126,0.88)" : "rgba(255,220,146,0.64)");
  }
  for (const cistern of descriptors.cisternPurityMarkers ?? []) {
    drawRing(cistern.position, cistern.radius ?? 0.03, cistern.opacity ?? 0.22, cistern.purityScore < 0.55 ? "rgba(255,120,96,0.82)" : "rgba(124,255,230,0.7)");
  }
  for (const herb of descriptors.feverHerbGardens ?? []) {
    drawRing(herb.position, herb.radius ?? 0.02, herb.opacity ?? 0.2, herb.herbPotency > 0.62 ? "rgba(140,255,128,0.82)" : "rgba(195,255,174,0.58)");
  }
  for (const canoe of descriptors.evacuationCanoeWindows ?? []) {
    drawRing(canoe.position, canoe.radius ?? 0.04, canoe.opacity ?? 0.24, canoe.departureReadiness > 0.62 ? "rgba(255,238,126,0.9)" : "rgba(255,200,150,0.62)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getStormClinicReadiness = () => latestReadiness;
  host.getTropicalStormClinicReadiness = () => latestReadiness;
  host.getStormClinicReadinessTree = () => kit.domainTree;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      stormClinicReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalStormClinicReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const stormClinic = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-storm-clinic-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(stormClinic.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(stormClinic.descriptors ?? {}) },
      base,
      stormClinic,
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
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalStormClinicReadiness = latestReadiness;
    document.body.dataset.tropicalStormClinic = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
