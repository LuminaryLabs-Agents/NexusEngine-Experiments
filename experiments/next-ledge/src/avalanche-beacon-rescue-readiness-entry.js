import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeAvalancheBeaconRescueReadinessDomainKit } from "./avalanche-beacon-rescue-readiness-kits.js";

const PASS_ID = "next-ledge-avalanche-beacon-rescue-readiness-renderer-handoff-pass";
const domainKit = createNextLedgeAvalancheBeaconRescueReadinessDomainKit();
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
  let canvas = document.getElementById("next-ledge-avalanche-beacon-rescue-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "next-ledge-avalanche-beacon-rescue-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "13",
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
  const phase = readiness.summary?.phase ?? "establish-shelter";
  ctx.save();
  ctx.font = "650 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(255,238,178,0.58)";
  ctx.fillStyle = "rgba(255,246,210,0.88)";

  for (const descriptor of descriptors) {
    if (descriptor.kind === "next-ledge-beacon-ping-arc") {
      const p = worldToScreen(descriptor.position, snapshot);
      const radius = clamp(descriptor.pingRadius / 6, 8, 24);
      ctx.globalAlpha = 0.2 + clamp(descriptor.confidence) * 0.46;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0.18 * Math.PI, 1.82 * Math.PI);
      ctx.stroke();
      ctx.fillText("beacon", p.x + radius + 4, p.y);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-probe-grid-flag") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.26 + clamp(descriptor.snowDepth) * 0.36;
      const flags = Math.min(8, descriptor.flagCount ?? 4);
      for (let index = 0; index < flags; index += 1) {
        const x = p.x + (index % 4) * 4 - 8;
        const y = p.y + Math.floor(index / 4) * 5 - 5;
        ctx.fillRect(x, y, 2, 7);
      }
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-snow-cave-marker") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.3 + clamp(descriptor.warmth) * 0.45;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("cave", p.x + 12, p.y);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-rope-belay-anchor") {
      const a = worldToScreen(descriptor.start, snapshot);
      const b = worldToScreen(descriptor.end, snapshot);
      drawLine(ctx, a, b, 0.18 + (1 - clamp(descriptor.tensionRisk)) * 0.42, 1.8);
    }
    if (descriptor.kind === "next-ledge-search-team-lantern") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.32 + clamp(descriptor.readiness) * 0.48;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 10);
      ctx.lineTo(p.x + 8, p.y + 8);
      ctx.lineTo(p.x - 8, p.y + 8);
      ctx.closePath();
      ctx.stroke();
      ctx.fillText(String(descriptor.teamSize ?? 3), p.x - 3, p.y + 1);
      ctx.globalAlpha = 1;
    }
  }

  ctx.globalAlpha = 0.8;
  ctx.fillText(`avalanche beacon rescue · ${phase}`, 18, globalThis.innerHeight - 46);
  ctx.restore();
  globalThis.requestAnimationFrame(() => drawOverlay(canvas));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState || host.__nextLedgeAvalancheBeaconRescuePatched) return Boolean(host?.__nextLedgeAvalancheBeaconRescuePatched);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getAvalancheBeaconRescueReadiness = describe;
  host.getNextLedgeAvalancheBeaconRescueReadiness = describe;
  host.getAvalancheBeaconRescueReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? { id: "next-ledge-composed-renderer-handoff", kind: "renderer-handoff", descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const avalanche = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(avalanche.descriptors ?? [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff-with-avalanche-beacon-rescue",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      avalancheBeaconRescueReadiness: avalanche,
      rendererContract: "renderer consumes descriptors only; reusable avalanche beacon rescue readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership"
    };
  };
  host.__nextLedgeAvalancheBeaconRescuePatched = true;
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
