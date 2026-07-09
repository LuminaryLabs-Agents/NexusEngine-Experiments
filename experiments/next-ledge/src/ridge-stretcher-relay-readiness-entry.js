import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeRidgeStretcherRelayReadinessDomainKit } from "./ridge-stretcher-relay-readiness-kits.js";

const PASS_ID = "next-ledge-ridge-stretcher-relay-readiness-renderer-handoff-pass";
const domainKit = createNextLedgeRidgeStretcherRelayReadinessDomainKit();
void NexusEngine;

function clamp(value, min = 0, max = 1) {
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : min));
}

function snapshot() {
  return globalThis.GameHost?.getState?.() ?? globalThis.GameHost?.session?.snapshot?.() ?? null;
}

function describe() {
  return domainKit.describe(snapshot() ?? {});
}

function makeOverlay() {
  let canvas = document.getElementById("next-ledge-ridge-stretcher-relay-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "next-ledge-ridge-stretcher-relay-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "17",
    mixBlendMode: "screen"
  });
  document.body.appendChild(canvas);
  return canvas;
}

function resize(canvas) {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(globalThis.innerWidth * dpr));
  const height = Math.max(1, Math.floor(globalThis.innerHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function worldToScreen(point = {}, state = {}) {
  const camera = state.camera ?? {};
  const scale = Math.max(0.18, Math.min(0.5, 300 / Math.max(180, Number(camera.z) || 260)));
  return {
    x: globalThis.innerWidth * 0.5 + ((Number(point.x) || 0) - (Number(camera.x) || 0)) * scale,
    y: globalThis.innerHeight * 0.5 - ((Number(point.y) || 0) - (Number(camera.y) || 0)) * scale
  };
}

function drawSpan(ctx, a, b, safety = 0.5) {
  ctx.globalAlpha = 0.18 + clamp(safety) * 0.48;
  ctx.lineWidth = 1.2 + clamp(safety) * 1.6;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  const midX = (a.x + b.x) * 0.5;
  const midY = (a.y + b.y) * 0.5 + 16 * (1 - clamp(safety));
  ctx.quadraticCurveTo(midX, midY, b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawOverlay(canvas) {
  const state = snapshot();
  const readiness = describe();
  const ctx = resize(canvas);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  if (!state || !readiness?.rendererHandoff) {
    globalThis.requestAnimationFrame(() => drawOverlay(canvas));
    return;
  }

  ctx.save();
  ctx.font = "800 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(255,232,168,0.76)";
  ctx.fillStyle = "rgba(255,249,222,0.94)";

  for (const descriptor of readiness.rendererHandoff.descriptors ?? []) {
    if (descriptor.kind === "next-ledge-stretcher-anchor") {
      const p = worldToScreen(descriptor.position, state);
      const radius = 5 + clamp(descriptor.grip) * 10;
      ctx.globalAlpha = 0.28 + clamp(descriptor.grip) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - radius, p.y);
      ctx.lineTo(p.x + radius, p.y);
      ctx.moveTo(p.x, p.y - radius);
      ctx.lineTo(p.x, p.y + radius);
      ctx.stroke();
      ctx.fillText("stretcher pin", p.x + radius + 4, p.y);
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-med-pack-cache") {
      const p = worldToScreen(descriptor.position, state);
      ctx.globalAlpha = 0.24 + clamp(descriptor.supply) * 0.52;
      ctx.strokeRect(p.x - 7, p.y - 7, 14, 14);
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y);
      ctx.lineTo(p.x + 4, p.y);
      ctx.moveTo(p.x, p.y - 4);
      ctx.lineTo(p.x, p.y + 4);
      ctx.stroke();
      ctx.fillText("med cache", p.x + 12, p.y);
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-belay-post") {
      const a = worldToScreen(descriptor.start, state);
      const b = worldToScreen(descriptor.end, state);
      drawSpan(ctx, a, b, descriptor.ropeSafety);
      ctx.globalAlpha = 0.36 + clamp(descriptor.ropeSafety) * 0.36;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-wind-shear-ribbon") {
      const p = worldToScreen(descriptor.position, state);
      const strands = Math.min(9, descriptor.ribbonStrands ?? 3);
      ctx.globalAlpha = 0.18 + clamp(descriptor.stability) * 0.5;
      for (let index = 0; index < strands; index += 1) {
        ctx.beginPath();
        const offset = index * 4 - strands * 2;
        ctx.moveTo(p.x + offset, p.y - 14);
        ctx.bezierCurveTo(p.x + offset + 8, p.y - 4, p.x + offset - 6, p.y + 6, p.x + offset + 5, p.y + 16);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-ridge-signal-panel") {
      const p = worldToScreen(descriptor.position, state);
      ctx.globalAlpha = 0.28 + clamp(descriptor.signal) * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 12);
      ctx.lineTo(p.x + 14, p.y + 10);
      ctx.lineTo(p.x - 14, p.y + 10);
      ctx.closePath();
      ctx.stroke();
      const flashes = Math.min(8, descriptor.panelFlashCount ?? 2);
      for (let index = 0; index < flashes; index += 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18 + index * 6, -0.18 * Math.PI, 0.18 * Math.PI);
        ctx.stroke();
      }
      ctx.fillText("signal", p.x + 18, p.y);
      ctx.globalAlpha = 1;
    }
  }

  ctx.globalAlpha = 0.9;
  ctx.fillText(`ridge stretcher relay · ${readiness.summary?.phase ?? "pin-safe-stretcher-anchors"}`, 18, globalThis.innerHeight - 112);
  ctx.fillText(`medical ${readiness.summary?.medicalNodes ?? 0} · safety ${readiness.summary?.safetyNodes ?? 0} · ready ${Math.round((readiness.summary?.readiness ?? 0) * 100)}%`, 18, globalThis.innerHeight - 96);
  ctx.restore();
  globalThis.requestAnimationFrame(() => drawOverlay(canvas));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState && !host?.session?.snapshot) return false;
  if (host.__nextLedgeRidgeStretcherRelayPatched) return true;
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getRidgeStretcherRelayReadiness = describe;
  host.getNextLedgeRidgeStretcherRelayReadiness = describe;
  host.getRidgeStretcherRelayReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? {
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptors: [],
      descriptorCount: 0,
      handoffCount: 0
    };
    const ridgeStretcherRelay = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(ridgeStretcherRelay.descriptors) ? ridgeStretcherRelay.descriptors : [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff-with-ridge-stretcher-relay",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      ridgeStretcherRelayReadiness: ridgeStretcherRelay,
      rendererContract: "renderer consumes descriptors only; reusable ridge stretcher relay readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, network, and frame-loop ownership"
    };
  };
  host.__nextLedgeRidgeStretcherRelayPatched = true;
  return true;
}

function boot() {
  const overlay = makeOverlay();
  const attempt = () => {
    if (patchGameHost()) return drawOverlay(overlay);
    globalThis.requestAnimationFrame(attempt);
    return null;
  };
  attempt();
}

boot();
