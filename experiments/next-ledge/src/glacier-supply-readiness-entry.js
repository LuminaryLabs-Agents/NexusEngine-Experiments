import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeGlacierSupplyReadinessDomainKit } from "./glacier-supply-readiness-kits.js";

const PASS_ID = "next-ledge-glacier-supply-readiness-renderer-handoff-pass";
const domainKit = createNextLedgeGlacierSupplyReadinessDomainKit();
void NexusEngine;

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

function getSnapshot() {
  return globalThis.GameHost?.getState?.() ?? globalThis.GameHost?.session?.snapshot?.() ?? null;
}

function describe() {
  return domainKit.describe(getSnapshot() ?? {});
}

function makeOverlay() {
  let canvas = document.getElementById("next-ledge-glacier-supply-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "next-ledge-glacier-supply-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "12",
    mixBlendMode: "screen"
  });
  document.body.appendChild(canvas);
  return canvas;
}

function resizeCanvas(canvas) {
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

function worldToScreen(point, snapshot) {
  const camera = snapshot?.camera ?? {};
  const scale = Math.max(0.18, Math.min(0.42, 260 / Math.max(180, Number(camera.z) || 260)));
  return {
    x: globalThis.innerWidth * 0.5 + ((Number(point?.x) || 0) - (Number(camera.x) || 0)) * scale,
    y: globalThis.innerHeight * 0.5 - ((Number(point?.y) || 0) - (Number(camera.y) || 0)) * scale
  };
}

function drawLine(ctx, a, b, alpha = 0.4, width = 1) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawOverlay(canvas) {
  const snapshot = getSnapshot();
  const readiness = describe();
  const ctx = resizeCanvas(canvas);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  if (!snapshot || !readiness?.rendererHandoff) {
    globalThis.requestAnimationFrame(() => drawOverlay(canvas));
    return;
  }

  const descriptors = readiness.rendererHandoff.descriptors ?? [];
  const phase = readiness.summary?.phase ?? "hold-for-weather";
  ctx.save();
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(186,232,255,0.52)";
  ctx.fillStyle = "rgba(206,242,255,0.84)";

  for (const descriptor of descriptors) {
    if (descriptor.kind === "next-ledge-storm-lantern-chain") {
      const p = worldToScreen(descriptor.position, snapshot);
      const radius = clamp(descriptor.glowRadius / 7, 5, 16);
      ctx.globalAlpha = clamp(descriptor.visibility, 0.22, 0.86);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("✦", p.x - 3, p.y);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-crampon-step-rail") {
      const a = worldToScreen(descriptor.start, snapshot);
      const b = worldToScreen(descriptor.end, snapshot);
      drawLine(ctx, a, b, 0.2 + (1 - clamp(descriptor.slipRisk)) * 0.36, 1.2);
    }
    if (descriptor.kind === "next-ledge-frostbite-warmth-cache") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.36 + clamp(descriptor.heatReserve) * 0.42;
      ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-avalanche-cornice-warning") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.2 + clamp(descriptor.severity) * 0.48;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 9);
      ctx.lineTo(p.x + 9, p.y + 7);
      ctx.lineTo(p.x - 9, p.y + 7);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-rescue-sled-transfer-lane") {
      const points = [descriptor.start, ...(descriptor.route ?? [])].map((point) => worldToScreen(point, snapshot));
      ctx.strokeStyle = "rgba(255,245,210,0.46)";
      for (let index = 1; index < points.length; index += 1) drawLine(ctx, points[index - 1], points[index], 0.18 + clamp(descriptor.readiness) * 0.36, 2);
      ctx.strokeStyle = "rgba(186,232,255,0.52)";
    }
  }

  ctx.globalAlpha = 0.76;
  ctx.fillText(`glacier supply · ${phase}`, 18, globalThis.innerHeight - 26);
  ctx.restore();
  globalThis.requestAnimationFrame(() => drawOverlay(canvas));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState || host.__nextLedgeGlacierSupplyPatched) return Boolean(host?.__nextLedgeGlacierSupplyPatched);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getGlacierSupplyReadiness = describe;
  host.getNextLedgeGlacierSupplyReadiness = describe;
  host.getGlacierSupplyReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? { id: "next-ledge-composed-renderer-handoff", kind: "renderer-handoff", descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const glacier = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(glacier.descriptors ?? [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff-with-glacier-supply",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      glacierSupplyReadiness: glacier,
      rendererContract: "renderer consumes descriptors only; reusable glacier supply readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership"
    };
  };
  host.__nextLedgeGlacierSupplyPatched = true;
  return true;
}

function boot() {
  const canvas = makeOverlay();
  const attempt = () => {
    if (patchGameHost()) {
      drawOverlay(canvas);
      return;
    }
    globalThis.requestAnimationFrame(attempt);
  };
  attempt();
}

boot();
