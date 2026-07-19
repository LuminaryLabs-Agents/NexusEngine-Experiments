import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardHordePathingReadinessDomainKit } from "./horde-pathing-readiness-kits.js";

const domain = createZombieOrchardHordePathingReadinessDomainKit();
const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));

function createOverlay() {
  const root = document.querySelector("#game-root") ?? document.body;
  const canvas = document.createElement("canvas");
  canvas.id = "orchard-horde-pathing-readiness-overlay";
  canvas.dataset.rendererConsumes = "descriptors-only";
  Object.assign(canvas.style, {
    position: "absolute",
    right: "18px",
    bottom: "42px",
    width: "310px",
    height: "190px",
    border: "1px solid rgba(255, 227, 174, 0.24)",
    borderRadius: "18px",
    background: "rgba(5, 5, 4, 0.58)",
    pointerEvents: "none"
  });
  root.append(canvas);
  return canvas;
}

function resize(canvas) {
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  const width = Math.max(260, Math.floor(canvas.clientWidth * dpr));
  const height = Math.max(150, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, dpr };
}

function colorFor(value) {
  return value > 0.72 ? "#ff365f" : value > 0.46 ? "#ffd168" : "#8fd56b";
}

function drawBar(ctx, x, y, width, height, value, label, color = colorFor(value)) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 239, 207, 0.09)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.fillRect(x, y, width * clamp01(value), height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff0d0";
  ctx.font = "700 11px system-ui";
  ctx.fillText(label, x + 6, y + height - 5);
  ctx.restore();
}

function descriptorMax(list = [], key = "urgency") {
  return list.reduce((max, item) => Math.max(max, n(item[key])), 0);
}

function drawRouteRadar(ctx, s, descriptors = {}) {
  const cx = s.width - 78;
  const cy = 74;
  const radius = 48;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 239, 207, 0.20)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx, cy + radius);
  ctx.stroke();

  for (const lane of descriptors.spawnLaneForecasts ?? []) {
    const urgency = clamp01(lane.urgency);
    const angle = Math.atan2(n(lane.from?.z) - n(lane.to?.z), n(lane.from?.x) - n(lane.to?.x));
    ctx.strokeStyle = lane.color ?? colorFor(urgency);
    ctx.globalAlpha = 0.18 + urgency * 0.56;
    ctx.lineWidth = 1.2 + urgency * 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius * (0.35 + urgency * 0.65), cy + Math.sin(angle) * radius * (0.35 + urgency * 0.65));
    ctx.stroke();
  }

  for (const thread of descriptors.panicRetreatThreads ?? []) {
    const urgency = clamp01(thread.urgency);
    const angle = Math.atan2(n(thread.to?.z) - n(thread.from?.z), n(thread.to?.x) - n(thread.from?.x));
    ctx.strokeStyle = "#8fd56b";
    ctx.globalAlpha = 0.16 + urgency * 0.42;
    ctx.lineWidth = 1 + urgency * 2.8;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius * 0.82, cy + Math.sin(angle) * radius * 0.82);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawOverlay(canvas, readiness = {}) {
  const ctx = canvas.getContext("2d");
  const s = resize(canvas);
  const descriptors = readiness.rendererHandoff?.descriptors ?? readiness.descriptors ?? {};
  ctx.clearRect(0, 0, s.width, s.height);
  ctx.fillStyle = "rgba(5, 5, 4, 0.78)";
  ctx.fillRect(0, 0, s.width, s.height);
  ctx.fillStyle = "#fff0d0";
  ctx.font = "800 14px system-ui";
  ctx.fillText("Horde pathing", 14, 24);
  ctx.font = "600 10px system-ui";
  ctx.fillStyle = "rgba(255, 240, 208, 0.68)";
  ctx.fillText("spawn lanes · choke rows · retreat timing", 14, 39);

  drawBar(ctx, 14, 56, 145, 14, descriptorMax(descriptors.spawnLaneForecasts, "urgency"), "approach");
  drawBar(ctx, 14, 78, 145, 14, descriptorMax(descriptors.chokeRowPriorities, "priority"), "chokes");
  drawBar(ctx, 14, 100, 145, 14, descriptorMax(descriptors.noiseLureCones, "intensity"), "noise");
  drawBar(ctx, 14, 122, 145, 14, descriptorMax(descriptors.panicRetreatThreads, "urgency"), "retreat");
  drawBar(ctx, 14, 144, 145, 14, descriptorMax(descriptors.roundSurgeCountdowns, "surge"), "surge");

  drawRouteRadar(ctx, s, descriptors);
  const count = readiness.summary?.descriptorCount ?? Object.values(descriptors).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  ctx.fillStyle = "rgba(255, 240, 208, 0.64)";
  ctx.font = "700 10px system-ui";
  ctx.fillText(`${count} descriptors · ${NexusEngine ? "NexusEngine CDN" : NEXUS_ENGINE_CDN}`, 14, s.height - 14);
}

function composeRendererHandoff(base, horde) {
  const descriptors = {};
  for (const handoff of [base, horde?.rendererHandoff].filter(Boolean)) {
    for (const [key, value] of Object.entries(handoff.descriptors ?? {})) {
      descriptors[key] = [...(descriptors[key] ?? []), ...(Array.isArray(value) ? value : [value].filter(Boolean))];
    }
  }
  return {
    id: "zombie-orchard-composed-horde-pathing-renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownership: horde?.rendererHandoff?.ownership ?? base?.ownership,
    descriptors,
    descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
  };
}

function patchHost(host, canvas) {
  if (typeof host?.getState !== "function") return false;
  if (!host || host.__zombieOrchardHordePathingPatched) return Boolean(host?.__zombieOrchardHordePathingPatched);
  const originalGetState = host.getState?.bind(host);
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const compute = () => {
    const state = originalGetState?.() ?? host.game?.snapshot?.() ?? {};
    return domain.compose(state, state.survivalReadability, state.foragingReadability);
  };
  host.getHordePathingReadiness = compute;
  host.getZombieOrchardHordePathingReadiness = compute;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.(), compute());
  host.__zombieOrchardHordePathingPatched = true;
  globalThis.ZombieOrchardHordePathingReadiness = {
    version: "horde-pathing-readiness-renderer-handoff-pass",
    engineSource: NEXUS_ENGINE_CDN,
    domain,
    getState: compute,
    rendererConsumes: "descriptors-only"
  };
  document.documentElement.dataset.zombieHordePathingReadiness = "active";
  const render = () => {
    try {
      drawOverlay(canvas, compute());
    } catch (error) {
      console.warn("Zombie Orchard horde pathing overlay skipped a frame.", error);
    }
    requestAnimationFrame(render);
  };
  render();
  return true;
}

const overlay = createOverlay();
const start = () => {
  if (patchHost(globalThis.GameHost, overlay)) return;
  requestAnimationFrame(start);
};
start();
