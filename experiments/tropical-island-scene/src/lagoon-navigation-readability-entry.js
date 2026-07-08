import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalLagoonNavigationReadabilityDomainKit } from "./tropical-lagoon-navigation-readability-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalLagoonNavigationReadabilityDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadability = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "lagoon-navigation-readability-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only lagoon navigation readability overlay");
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

function drawEllipseDescriptor(center, radius = {}, opacity, color) {
  const p = toCanvas(center);
  const rx = Math.max(10, Number(radius.x ?? 0.2) * overlay.width * 0.24);
  const ry = Math.max(4, Number(radius.y ?? 0.1) * overlay.height * 0.20);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.beginPath();
  context.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawRingDescriptor(position, radius, opacity, color) {
  const p = toCanvas(position);
  const r = Math.max(4, radius * Math.min(overlay.width, overlay.height));
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.3, r * 0.07);
  context.beginPath();
  context.arc(p.x, p.y, r, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function renderReadability(readability) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readability?.rendererHandoff?.descriptors ?? {};

  for (const contour of descriptors.reefContours ?? []) {
    drawEllipseDescriptor(contour.center, contour.radius, contour.opacity ?? 0.1, "rgba(101,225,255,0.85)");
  }
  for (const cone of descriptors.swimSafetyCones ?? []) {
    drawLineDescriptor(cone.start, cone.end, cone.width ?? 0.006, cone.opacity ?? 0.24, cone.safety > 0.58 ? "rgba(116,255,194,0.92)" : "rgba(255,225,125,0.72)");
  }
  for (const vector of descriptors.currentVectors ?? []) {
    drawLineDescriptor(vector.start, vector.end, vector.width ?? 0.004, vector.opacity ?? 0.22, "rgba(148,194,255,0.82)");
    drawRingDescriptor(vector.end, 0.008 + (vector.force ?? 0.3) * 0.006, vector.opacity ?? 0.22, "rgba(148,194,255,0.72)");
  }
  for (const score of descriptors.snorkelScores ?? []) {
    drawRingDescriptor(score.position, score.radius ?? 0.04, score.opacity ?? 0.3, score.score > 0.62 ? "rgba(255,226,117,0.88)" : "rgba(180,245,255,0.72)");
  }
  for (const wake of descriptors.raftReturnWakes ?? []) {
    drawLineDescriptor(wake.start, wake.end, wake.width ?? 0.006, wake.opacity ?? 0.2, "rgba(255,255,255,0.56)");
  }
  for (const glare of descriptors.sunGlareBands ?? []) {
    drawLineDescriptor(glare.start, glare.end, glare.width ?? 0.008, glare.opacity ?? 0.18, glare.safeWindow > 0.5 ? "rgba(255,246,181,0.7)" : "rgba(255,153,94,0.62)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getLagoonNavigationReadability = () => latestReadability;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      lagoonNavigationReadability: latestReadability,
      domain: { ...(state.domain ?? {}), tropicalLagoonNavigationReadability: latestReadability }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const lagoonNavigation = latestReadability?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-lagoon-navigation-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(lagoonNavigation.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(lagoonNavigation.descriptors ?? {}) },
      base,
      lagoonNavigation,
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
      fish: state.fish,
      floatProps: state.floatProps,
      visualFractal: state.visualFractal
    });
    window.__tropicalLagoonNavigationReadability = latestReadability;
    renderReadability(latestReadability);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
