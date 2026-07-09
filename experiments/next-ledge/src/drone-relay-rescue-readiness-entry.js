import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeDroneRelayRescueReadinessDomainKit } from "./drone-relay-rescue-readiness-kits.js";

const PASS_ID = "next-ledge-drone-relay-rescue-readiness-renderer-handoff-pass";
const domainKit = createNextLedgeDroneRelayRescueReadinessDomainKit();
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
  let canvas = document.getElementById("next-ledge-drone-relay-rescue-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "next-ledge-drone-relay-rescue-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "16",
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
  const scale = Math.max(0.18, Math.min(0.48, 280 / Math.max(180, Number(camera.z) || 260)));
  return {
    x: globalThis.innerWidth * 0.5 + ((Number(point.x) || 0) - (Number(camera.x) || 0)) * scale,
    y: globalThis.innerHeight * 0.5 - ((Number(point.y) || 0) - (Number(camera.y) || 0)) * scale
  };
}

function drawThread(ctx, a, b, alpha = 0.38, width = 1.2) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
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
  ctx.font = "750 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(147,226,255,0.74)";
  ctx.fillStyle = "rgba(235,251,255,0.92)";

  for (const descriptor of readiness.rendererHandoff.descriptors ?? []) {
    if (descriptor.kind === "next-ledge-phosphor-anchor") {
      const p = worldToScreen(descriptor.position, state);
      const radius = 5 + clamp(descriptor.visibility) * 12;
      ctx.globalAlpha = 0.24 + clamp(descriptor.visibility) * 0.52;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("glow anchor", p.x + radius + 4, p.y);
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-snow-flag-breadcrumb") {
      const p = worldToScreen(descriptor.position, state);
      ctx.globalAlpha = 0.22 + clamp(descriptor.clarity) * 0.5;
      const flags = Math.min(8, descriptor.flagCount ?? 3);
      for (let index = 0; index < flags; index += 1) {
        const x = p.x + index * 5 - flags * 2.5;
        ctx.beginPath();
        ctx.moveTo(x, p.y + 8);
        ctx.lineTo(x, p.y - 8);
        ctx.lineTo(x + 6, p.y - 5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-drone-perch") {
      const p = worldToScreen(descriptor.position, state);
      ctx.globalAlpha = 0.3 + clamp(descriptor.battery) * 0.48;
      ctx.strokeRect(p.x - 8, p.y - 5, 16, 10);
      ctx.beginPath();
      ctx.arc(p.x - 12, p.y - 8, 5, 0, Math.PI * 2);
      ctx.arc(p.x + 12, p.y - 8, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("drone", p.x + 16, p.y);
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-rescue-cable-spool") {
      const a = worldToScreen(descriptor.start, state);
      const b = worldToScreen(descriptor.end, state);
      drawThread(ctx, a, b, 0.18 + (1 - clamp(descriptor.tension)) * 0.44, 1 + clamp(descriptor.tension) * 1.8);
      const mid = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
      ctx.globalAlpha = 0.22 + clamp(descriptor.tension) * 0.38;
      ctx.beginPath();
      ctx.arc(mid.x, mid.y, 4 + clamp(descriptor.tension) * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (descriptor.kind === "next-ledge-heat-beacon-flare") {
      const p = worldToScreen(descriptor.position, state);
      ctx.globalAlpha = 0.28 + clamp(descriptor.warmth) * 0.5;
      const pulse = Math.min(10, descriptor.flarePulse ?? 3);
      for (let index = 0; index < pulse; index += 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + index * 2.5, -0.1 * Math.PI, 1.1 * Math.PI);
        ctx.stroke();
      }
      ctx.fillText("heat", p.x + 16, p.y + 2);
      ctx.globalAlpha = 1;
    }
  }

  ctx.globalAlpha = 0.88;
  ctx.fillText(`drone relay rescue · ${readiness.summary?.phase ?? "find-survivor-ledge"}`, 18, globalThis.innerHeight - 82);
  ctx.fillText(`relay ${Math.round((readiness.summary?.readiness ?? 0) * 100)}% · marks ${readiness.summary?.routeMarks ?? 0}`, 18, globalThis.innerHeight - 66);
  ctx.restore();
  globalThis.requestAnimationFrame(() => drawOverlay(canvas));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState && !host?.session?.snapshot) return false;
  if (host.__nextLedgeDroneRelayRescuePatched) return true;
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getDroneRelayRescueReadiness = describe;
  host.getNextLedgeDroneRelayRescueReadiness = describe;
  host.getDroneRelayRescueReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? {
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptors: [],
      descriptorCount: 0,
      handoffCount: 0
    };
    const droneRelay = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(droneRelay.descriptors) ? droneRelay.descriptors : [])
    ];
    return {
      ...base,
      id: "next-ledge-composed-renderer-handoff-with-drone-relay-rescue",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      droneRelayRescueReadiness: droneRelay,
      rendererContract: "renderer consumes descriptors only; reusable drone relay rescue readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, and frame-loop ownership"
    };
  };
  host.__nextLedgeDroneRelayRescuePatched = true;
  return true;
}

function boot() {
  const overlay = makeOverlay();
  const attempt = () => {
    if (patchGameHost()) return drawOverlay(overlay);
    globalThis.requestAnimationFrame(attempt);
  };
  attempt();
}

boot();
