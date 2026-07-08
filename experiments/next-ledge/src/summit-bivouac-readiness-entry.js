import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeSummitBivouacReadinessDomainKit } from "./summit-bivouac-readiness-kits.js";

const domain = createNextLedgeSummitBivouacReadinessDomainKit();
const engineSymbol = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine ?? null;

let lastReadiness = null;
let patchedHost = null;

function ensureCanvas() {
  let canvas = document.querySelector("#summitBivouacReadinessOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "summitBivouacReadinessOverlay";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "8",
    mixBlendMode: "screen"
  });
  document.body.appendChild(canvas);
  return canvas;
}

function resize(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(window.innerWidth * ratio));
  const height = Math.max(1, Math.floor(window.innerHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function worldToScreen(point = {}, snapshot = {}) {
  const camera = snapshot.camera ?? {};
  const zoom = Math.max(120, Number(camera.z) || 232);
  const scale = Math.min(4.6, Math.max(1.4, window.innerHeight / zoom * 0.74));
  return {
    x: window.innerWidth / 2 + (Number(point.x) || 0) * scale,
    y: window.innerHeight / 2 - ((Number(point.y) || 0) - (Number(camera.y) || 0)) * scale
  };
}

function drawLine(ctx, snapshot, start, end, color, width = 1.5, alpha = 0.6) {
  const a = worldToScreen(start, snapshot);
  const b = worldToScreen(end, snapshot);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawRing(ctx, snapshot, position, radius, color, alpha = 0.52) {
  const p = worldToScreen(position, snapshot);
  const scale = Math.min(4.6, Math.max(1.4, window.innerHeight / Math.max(120, Number(snapshot.camera?.z) || 232) * 0.74));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(4, radius * scale * 0.22), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSummitBivouacDescriptors(ctx, snapshot, readiness) {
  const time = (Number(snapshot.frame) || 0) / 60;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (!readiness?.rendererHandoff) return;

  for (const band of readiness.stormExposureBands ?? []) {
    const p = worldToScreen(band.position, snapshot);
    ctx.save();
    ctx.globalAlpha = 0.08 + (band.severity ?? 0) * 0.24;
    ctx.fillStyle = band.severity > 0.62 ? "#ff7a7a" : "#9ed6ff";
    ctx.fillRect(p.x - band.width * 0.5, p.y - band.height * 0.5, band.width, band.height);
    ctx.restore();
  }

  for (const shelter of readiness.bivouacShelterPockets ?? []) {
    drawRing(ctx, snapshot, shelter.position, shelter.radius + Math.sin(time * 3 + shelter.order) * 2, "#8fffd2", 0.18 + (shelter.warmth ?? 0) * 0.34);
  }

  for (const echo of readiness.partnerBelayEchoes ?? []) {
    drawLine(ctx, snapshot, echo.start, echo.end, "#d9f7ff", 1.2 + (echo.confidence ?? 0) * 2, 0.22 + (echo.confidence ?? 0) * 0.4);
  }

  for (const cache of readiness.medCacheStations ?? []) {
    drawRing(ctx, snapshot, cache.position, 14 + (cache.supply ?? 1) * 4 + Math.sin(time * 5 + cache.order), cache.urgency > 0.55 ? "#ffcf6a" : "#b6ff92", 0.2 + (cache.urgency ?? 0) * 0.34);
  }

  for (const flag of readiness.routeFlagThreads ?? []) {
    drawLine(ctx, snapshot, flag.start, flag.end, flag.label === "summit flag" ? "#ffe88c" : "#b7d7ff", 1 + (flag.commitment ?? 0) * 1.6, 0.18 + (flag.commitment ?? 0) * 0.38);
  }

  for (const flare of readiness.evacuationFlareWindows ?? []) {
    drawLine(ctx, snapshot, flare.start, flare.end, flare.flareWindow === "open" ? "#fff08a" : "#ff9c6a", 1.5 + (flare.readiness ?? 0) * 2.8, 0.22 + (flare.readiness ?? 0) * 0.48);
  }
}

function computeReadiness(host) {
  const snapshot = host?.getState?.();
  if (!snapshot) return null;
  const rescueReadiness = host?.getRescueLineReadiness?.() ?? null;
  lastReadiness = domain.describe(snapshot, rescueReadiness ?? {});
  return lastReadiness;
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  host.getSummitBivouacReadiness = () => computeReadiness(host);
  host.getNextLedgeSummitBivouacReadiness = host.getSummitBivouacReadiness;
  host.getSummitBivouacReadinessTree = () => domain.tree;
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? { descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const summitBivouacReadiness = computeReadiness(host)?.rendererHandoff ?? { descriptors: [], descriptorCount: 0 };
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(summitBivouacReadiness.descriptors) ? summitBivouacReadiness.descriptors : [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      summitBivouacReadiness,
      summitBivouacDescriptorCount: summitBivouacReadiness.descriptorCount ?? 0,
      rendererContract: "renderer consumes descriptors only; route, cargo, traversal, rescue-line, summit bivouac, browser input, and frame-loop truth stay outside renderer presentation"
    };
  };
}

function frame() {
  const canvas = ensureCanvas();
  const ctx = resize(canvas);
  document.documentElement.dataset.nextLedgeSummitBivouac = engineSymbol ? "nexusengine-cdn" : "nexusengine-cdn-missing-symbol";
  const host = window.GameHost;
  patchGameHost(host);
  const snapshot = host?.getState?.();
  const readiness = host?.getSummitBivouacReadiness?.() ?? null;
  if (snapshot) drawSummitBivouacDescriptors(ctx, snapshot, readiness);
  requestAnimationFrame(frame);
}

frame();
