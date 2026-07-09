import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeRavineEvacuationReadinessDomainKit } from "./ravine-evacuation-readiness-kits.js";

const domain = createNextLedgeRavineEvacuationReadinessDomainKit();
const engineSymbol = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine ?? null;

let lastReadiness = null;
let patchedHost = null;

function ensureCanvas() {
  let canvas = document.querySelector("#ravineEvacuationReadinessOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "ravineEvacuationReadinessOverlay";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "9",
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

function drawLine(ctx, snapshot, start, end, color, width = 1.4, alpha = 0.45) {
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

function drawRing(ctx, snapshot, position, radius, color, alpha = 0.5) {
  const p = worldToScreen(position, snapshot);
  const scale = Math.min(4.6, Math.max(1.4, window.innerHeight / Math.max(120, Number(snapshot.camera?.z) || 232) * 0.74));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(4, radius * scale * 0.18), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawRavineEvacuationDescriptors(ctx, snapshot, readiness) {
  const time = (Number(snapshot.frame) || 0) / 60;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (!readiness?.rendererHandoff) return;

  for (const route of readiness.cliffStretcherRoutes ?? []) {
    drawLine(ctx, snapshot, route.start, route.end, route.steepness > 0.62 ? "#ffbf73" : "#a4ffe8", 1.2 + route.steepness * 2, 0.18 + route.steepness * 0.34);
  }

  for (const windowDescriptor of readiness.crosswindGapWindows ?? []) {
    const color = windowDescriptor.windowState === "open" ? "#9affd0" : windowDescriptor.windowState === "narrow" ? "#ffd47e" : "#ff7d93";
    drawLine(ctx, snapshot, windowDescriptor.start, windowDescriptor.end, color, 1 + windowDescriptor.timing * 2.2, 0.16 + windowDescriptor.timing * 0.38);
  }

  for (const beacon of readiness.ravineCallerBeacons ?? []) {
    drawRing(ctx, snapshot, beacon.position, 20 + beacon.urgency * 30 + Math.sin(time * 5 + beacon.order) * 3, beacon.callSign === "critical-call" ? "#ff5d72" : "#ffe28f", 0.24 + beacon.urgency * 0.36);
  }

  for (const anchor of readiness.pulleyAnchorArrays ?? []) {
    drawRing(ctx, snapshot, anchor.position, 12 + anchor.redundancy * 4, "#bcecff", 0.18 + anchor.stability * 0.34);
  }

  for (const smoke of readiness.signalSmokeColumns ?? []) {
    const base = worldToScreen(smoke.position, snapshot);
    ctx.save();
    ctx.globalAlpha = 0.14 + (smoke.clarity ?? 0) * 0.34;
    ctx.fillStyle = smoke.signal === "visible-to-valley" ? "#d9f7ff" : "#ffc98a";
    ctx.beginPath();
    ctx.ellipse(base.x, base.y - smoke.height * 0.28 - Math.sin(time + smoke.order) * 3, 9 + smoke.clarity * 14, Math.max(14, smoke.height * 0.42), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const zone of readiness.valleyPickupZones ?? []) {
    drawLine(ctx, snapshot, zone.start, zone.end, zone.zoneState === "ready" ? "#fff08a" : "#a4d6ff", 1.6 + zone.readiness * 2.6, 0.22 + zone.readiness * 0.44);
  }
}

function computeReadiness(host) {
  const snapshot = host?.getState?.();
  if (!snapshot) return null;
  const rescueLineReadiness = host?.getRescueLineReadiness?.() ?? null;
  const summitBivouacReadiness = host?.getSummitBivouacReadiness?.() ?? null;
  lastReadiness = domain.describe(snapshot, rescueLineReadiness ?? {}, summitBivouacReadiness ?? {});
  return lastReadiness;
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  host.getRavineEvacuationReadiness = () => computeReadiness(host);
  host.getNextLedgeRavineEvacuationReadiness = host.getRavineEvacuationReadiness;
  host.getRavineEvacuationReadinessTree = () => domain.tree;
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? { descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const ravineEvacuationReadiness = computeReadiness(host);
    const ravineEvacuationHandoff = ravineEvacuationReadiness?.rendererHandoff ?? { descriptors: [], descriptorCount: 0 };
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(ravineEvacuationHandoff.descriptors) ? ravineEvacuationHandoff.descriptors : [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      ravineEvacuationReadiness: ravineEvacuationHandoff,
      ravineEvacuationDescriptorCount: ravineEvacuationHandoff.descriptorCount ?? 0,
      rendererContract: "renderer consumes descriptors only; route, cargo, traversal, rescue-line, summit bivouac, ravine evacuation, browser input, physics, and frame-loop truth stay outside renderer presentation"
    };
  };
}

function frame() {
  const canvas = ensureCanvas();
  const ctx = resize(canvas);
  document.documentElement.dataset.nextLedgeRavineEvacuation = engineSymbol ? "nexusengine-cdn" : "nexusengine-cdn-missing-symbol";
  const host = window.GameHost;
  patchGameHost(host);
  const snapshot = host?.getState?.();
  const readiness = host?.getRavineEvacuationReadiness?.() ?? null;
  if (snapshot) drawRavineEvacuationDescriptors(ctx, snapshot, readiness);
  requestAnimationFrame(frame);
}

frame();
