import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardCureCraftingReadinessDomainKit } from "./cure-crafting-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createZombieOrchardCureCraftingReadinessDomainKit();
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const descriptorList = (descriptors, key) => Array.isArray(descriptors?.[key]) ? descriptors[key] : [];

function createOverlay() {
  const root = document.querySelector("#game-root") ?? document.body;
  const canvas = document.createElement("canvas");
  canvas.id = "orchard-cure-crafting-readiness-overlay";
  canvas.dataset.rendererConsumes = "descriptors-only";
  Object.assign(canvas.style, {
    position: "absolute",
    left: "18px",
    bottom: "42px",
    width: "332px",
    height: "205px",
    border: "1px solid rgba(180, 255, 206, 0.24)",
    borderRadius: "18px",
    background: "rgba(5, 8, 5, 0.62)",
    pointerEvents: "none"
  });
  root.append(canvas);
  return canvas;
}

function resize(canvas) {
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  const width = Math.max(280, Math.floor(canvas.clientWidth * dpr));
  const height = Math.max(170, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, dpr };
}

function drawPill(ctx, x, y, width, value, label, color) {
  const v = clamp01(value);
  ctx.save();
  ctx.fillStyle = "rgba(224, 255, 226, 0.08)";
  ctx.fillRect(x, y, width, 12);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.74;
  ctx.fillRect(x, y, width * v, 12);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#efffde";
  ctx.font = "700 10px system-ui";
  ctx.fillText(label, x + 6, y + 9);
  ctx.restore();
}

function maxMetric(items = [], key = "urgency") {
  return items.reduce((max, item) => Math.max(max, n(item[key])), 0);
}

function drawCompass(ctx, size, descriptors = {}) {
  const cx = size.width - 78;
  const cy = 76;
  const r = 50;
  ctx.save();
  ctx.strokeStyle = "rgba(224, 255, 226, 0.20)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const groups = [
    [descriptorList(descriptors, "infectedRootSamples"), "#b6ff7d", "potency"],
    [descriptorList(descriptors, "sapDistillerNodes"), "#7df5ff", "yield01"],
    [descriptorList(descriptors, "survivorSignalGlyphs"), "#ffd86b", "urgency"]
  ];
  for (const [items, color, key] of groups) {
    for (const item of items.slice(0, 5)) {
      const p = item.position ?? item.from ?? { x: 0, z: 0 };
      const angle = Math.atan2(n(p.z), n(p.x));
      const value = clamp01(item[key]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.16 + value * 0.58;
      ctx.lineWidth = 1 + value * 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r * (0.28 + value * 0.64), cy + Math.sin(angle) * r * (0.28 + value * 0.64));
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawOverlay(canvas, readiness = {}) {
  const ctx = canvas.getContext("2d");
  const size = resize(canvas);
  const descriptors = readiness.rendererHandoff?.descriptors ?? readiness.descriptors ?? {};
  const ritual = descriptorList(descriptors, "dawnCureRitualWindows")[0] ?? {};
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = "rgba(5, 8, 5, 0.82)";
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.fillStyle = "#efffde";
  ctx.font = "800 14px system-ui";
  ctx.fillText("Cure crafting", 14, 24);
  ctx.font = "600 10px system-ui";
  ctx.fillStyle = "rgba(239, 255, 222, 0.68)";
  ctx.fillText("samples · distillers · barricades · dawn ritual", 14, 39);

  drawPill(ctx, 14, 57, 154, maxMetric(descriptorList(descriptors, "infectedRootSamples"), "potency"), "root samples", "#b6ff7d");
  drawPill(ctx, 14, 79, 154, maxMetric(descriptorList(descriptors, "antidotePressQueues"), "readiness"), "antidote press", "#78f0b6");
  drawPill(ctx, 14, 101, 154, maxMetric(descriptorList(descriptors, "sapDistillerNodes"), "yield01"), "sap yield", "#7df5ff");
  drawPill(ctx, 14, 123, 154, maxMetric(descriptorList(descriptors, "barricadeGraftPlans"), "priority"), "graft defense", "#ffd86b");
  drawPill(ctx, 14, 145, 154, ritual.readiness ?? 0, "dawn cure", "#ff9ee4");

  drawCompass(ctx, size, descriptors);
  const count = readiness.summary?.descriptorCount ?? Object.values(descriptors).reduce((sum, values) => sum + (Array.isArray(values) ? values.length : 0), 0);
  ctx.fillStyle = "rgba(239, 255, 222, 0.64)";
  ctx.font = "700 10px system-ui";
  ctx.fillText(`${count} descriptors · ${NexusEngine ? "NexusEngine CDN" : NEXUS_ENGINE_CDN}`, 14, size.height - 14);
}

function mergeHandoffs(base, horde, cure) {
  const descriptors = {};
  for (const handoff of [base, horde?.rendererHandoff, cure?.rendererHandoff].filter(Boolean)) {
    for (const [key, value] of Object.entries(handoff.descriptors ?? {})) {
      descriptors[key] = [...(descriptors[key] ?? []), ...(Array.isArray(value) ? value : [value].filter(Boolean))];
    }
  }
  return {
    id: "zombie-orchard-composed-cure-crafting-renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownership: cure?.rendererHandoff?.ownership ?? horde?.rendererHandoff?.ownership ?? base?.ownership,
    descriptors,
    descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length])),
    cureCraftingDescriptorCount: cure?.summary?.descriptorCount ?? 0,
    hordePathingDescriptorCount: horde?.summary?.descriptorCount ?? 0
  };
}

function patchHost(host, canvas) {
  if (typeof host?.getState !== "function") return false;
  if (!host || host.__zombieOrchardCureCraftingPatched) return Boolean(host?.__zombieOrchardCureCraftingPatched);
  const originalGetState = host.getState?.bind(host);
  const originalGetHandoff = host.getRendererHandoff?.bind(host);
  const getHorde = host.getZombieOrchardHordePathingReadiness?.bind(host) ?? host.getHordePathingReadiness?.bind(host);
  const compute = () => {
    const state = originalGetState?.() ?? host.game?.snapshot?.() ?? {};
    return domain.compose(state, getHorde?.() ?? state.hordePathingReadiness ?? {});
  };
  host.getCureCraftingReadinessDomain = () => domain;
  host.getCureCraftingReadiness = compute;
  host.getZombieOrchardCureCraftingReadiness = compute;
  host.getRendererHandoff = () => mergeHandoffs(originalGetHandoff?.(), getHorde?.(), compute());
  host.__zombieOrchardCureCraftingPatched = true;
  globalThis.ZombieOrchardCureCraftingReadiness = {
    version: "cure-crafting-readiness-renderer-handoff-pass",
    engineSource: NEXUS_ENGINE_CDN,
    domain,
    getState: compute,
    rendererConsumes: "descriptors-only"
  };
  document.documentElement.dataset.zombieCureCraftingReadiness = "active";
  const render = () => {
    try {
      drawOverlay(canvas, compute());
    } catch (error) {
      console.warn("Zombie Orchard cure crafting overlay skipped a frame.", error);
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
