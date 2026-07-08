import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalReefRescueReadinessDomainKit } from "./tropical-reef-rescue-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalReefRescueReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-reef-rescue-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical reef rescue readiness overlay");
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
  context.lineWidth = Math.max(1.3, width * overlay.width);
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

function drawArc(center, radius, sweep, opacity, color) {
  const p = toCanvas(center);
  const r = Math.max(6, radius * Math.min(overlay.width, overlay.height));
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.3, r * 0.11);
  context.lineCap = "round";
  context.beginPath();
  context.arc(p.x, p.y, r, -Math.PI * 0.55, -Math.PI * 0.55 + Math.PI * Number(sweep ?? 0.4));
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

  for (const current of descriptors.ripCurrentHazards ?? []) {
    drawEllipse(current.center, current.radius, current.opacity ?? 0.18, current.currentRisk > 0.62 ? "rgba(255,98,102,0.78)" : "rgba(255,196,118,0.52)");
  }
  for (const lane of descriptors.snorkelSearchLanes ?? []) {
    drawLine(lane.start, lane.end, lane.width ?? 0.008, lane.opacity ?? 0.18, lane.coverage > 0.62 ? "rgba(104,255,238,0.78)" : "rgba(153,220,255,0.52)");
  }
  for (const route of descriptors.raftAnchorRoutes ?? []) {
    drawLine(route.start, route.end, route.width ?? 0.008, route.opacity ?? 0.18, route.stability > 0.62 ? "rgba(132,255,171,0.75)" : "rgba(255,232,131,0.56)");
  }
  for (const flare of descriptors.distressFlareArcs ?? []) {
    drawArc(flare.center, flare.radius ?? 0.04, flare.sweep ?? 0.4, flare.opacity ?? 0.2, flare.urgency > 0.64 ? "rgba(255,120,233,0.82)" : "rgba(255,212,110,0.62)");
  }
  for (const cache of descriptors.firstAidCacheSparks ?? []) {
    drawRing(cache.position, cache.radius ?? 0.025, cache.opacity ?? 0.22, cache.priority > 0.58 ? "rgba(255,255,157,0.9)" : "rgba(205,255,211,0.58)");
  }
  for (const pier of descriptors.extractionPierBeacons ?? []) {
    drawRing(pier.position, pier.radius ?? 0.04, pier.opacity ?? 0.22, pier.readyScore > 0.58 ? "rgba(151,184,255,0.86)" : "rgba(190,195,255,0.58)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getReefRescueReadiness = () => latestReadiness;
  host.getTropicalReefRescueReadiness = () => latestReadiness;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      reefRescueReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalReefRescueReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const reefRescue = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-reef-rescue-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(reefRescue.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(reefRescue.descriptors ?? {}) },
      base,
      reefRescue,
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
      lagoonNavigation: state.lagoonNavigationReadability,
      weatherShelterReadability: state.weatherShelterReadability
    });
    window.__tropicalReefRescueReadiness = latestReadiness;
    document.body.dataset.tropicalReefRescue = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
