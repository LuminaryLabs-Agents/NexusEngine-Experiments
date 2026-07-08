import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeRescueLineReadinessDomainKit } from "./rescue-line-readiness-kits.js";

const domain = createNextLedgeRescueLineReadinessDomainKit();
const engineSymbol = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine ?? null;

let lastReadiness = null;
let patchedHost = null;

function ensureCanvas() {
  let canvas = document.querySelector("#rescueLineReadinessOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "rescueLineReadinessOverlay";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "7",
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
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(5, radius * scale * 0.24), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawRescueDescriptors(ctx, snapshot, readiness) {
  const time = (Number(snapshot.frame) || 0) / 60;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (!readiness?.rendererHandoff) return;

  for (const net of readiness.fallRecoveryNets ?? []) {
    const p = worldToScreen(net.position, snapshot);
    ctx.save();
    ctx.globalAlpha = 0.14 + (net.urgency ?? 0) * 0.32;
    ctx.fillStyle = net.recoveryMode === "active" ? "#ff5a74" : "#4fffd2";
    ctx.fillRect(p.x - net.width * 0.6, p.y - 6, net.width * 1.2, 12 + (net.height ?? 0) * 0.12);
    ctx.restore();
  }

  for (const pulse of readiness.tetherStrainPulses ?? []) {
    drawLine(ctx, snapshot, pulse.start, pulse.end, pulse.strain > 0.68 ? "#ff5a74" : "#f7c66a", 1.2 + (pulse.strain ?? 0) * 3, 0.38 + (pulse.strain ?? 0) * 0.32);
  }

  for (const triage of readiness.rescueAnchorTriages ?? []) {
    drawRing(ctx, snapshot, triage.position, triage.radius + Math.sin(time * 4 + triage.order) * 3, triage.anchorType === "rest" ? "#62ffb5" : triage.anchorType === "summit" ? "#ffd86a" : "#6ad7ff", 0.3 + (triage.rescueScore ?? 0) * 0.36);
  }

  for (const hop of readiness.staminaCacheHops ?? []) {
    drawLine(ctx, snapshot, hop.start, hop.end, "#62ffb5", 1.1 + (hop.priority ?? 0) * 1.8, 0.24 + (hop.priority ?? 0) * 0.42);
  }

  for (const warning of readiness.cargoRetentionWarnings ?? []) {
    drawRing(ctx, snapshot, warning.position, warning.radius + Math.sin(time * 7) * 2, warning.cargoStatus === "critical" ? "#ff4d66" : "#ffbf57", 0.28 + (warning.pressure ?? 0) * 0.34);
  }

  for (const beacon of readiness.summitExtractionBeacons ?? []) {
    drawLine(ctx, snapshot, beacon.start, beacon.end, "#ffd86a", 1.4 + (beacon.readiness ?? 0) * 2.5, 0.25 + (beacon.readiness ?? 0) * 0.45);
  }
}

function computeReadiness(host) {
  const snapshot = host?.getState?.();
  if (!snapshot) return null;
  const cargoSnapshot = snapshot.domain?.routeCargoExtraction ?? null;
  lastReadiness = domain.describe(snapshot, cargoSnapshot);
  return lastReadiness;
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  host.getRescueLineReadiness = () => computeReadiness(host);
  host.getNextLedgeRescueLineReadiness = host.getRescueLineReadiness;
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? { descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const rescueLineReadiness = computeReadiness(host)?.rendererHandoff ?? { descriptors: [], descriptorCount: 0 };
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(rescueLineReadiness.descriptors) ? rescueLineReadiness.descriptors : [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      rescueLineReadiness,
      rendererContract: "renderer consumes descriptors only; route, cargo, traversal, anchor timing, rescue-line scoring, browser input, and frame-loop truth stay outside renderer presentation"
    };
  };
}

function frame() {
  const canvas = ensureCanvas();
  const ctx = resize(canvas);
  document.documentElement.dataset.nextLedgeRescueLine = engineSymbol ? "nexusengine-cdn" : "nexusengine-cdn-missing-symbol";
  const host = window.GameHost;
  patchGameHost(host);
  const snapshot = host?.getState?.();
  const readiness = host?.getRescueLineReadiness?.() ?? null;
  if (snapshot) drawRescueDescriptors(ctx, snapshot, readiness);
  requestAnimationFrame(frame);
}

frame();
