import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryCampaignFractalDomainKit } from "./cavalry-campaign-fractal-domain-kit.js";

const HANDOFF_STYLE = "cavalry-campaign-fractal-handoff-033";
const domainKit = createCavalryCampaignFractalDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = domainKit.describe({ cells: [], turn: 0, actions: 0 });

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const campaign = () => globalThis.CavalryCampaignMap?.getState?.() || null;

function resize() {
  const ratio = Math.max(1, Math.min(2, globalThis.devicePixelRatio || 1));
  const width = Math.max(1, Math.floor(globalThis.innerWidth * ratio));
  const height = Math.max(1, Math.floor(globalThis.innerHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, ratio };
}

function worldToScreen(point, state, size) {
  const preset = state?.preset || { worldW: 1, worldH: 1 };
  const camera = state?.camera || { x: preset.worldW / 2, y: preset.worldH / 2, z: 1 };
  const zoom = Number(camera.z || 1);
  return {
    x: size.width * 0.5 + (Number(point.x || 0) - Number(camera.x || 0)) * zoom,
    y: size.height * 0.5 + (Number(point.y || 0) - Number(camera.y || 0)) * zoom
  };
}

function strokeLine(line, state, size, color, width = 1) {
  const a = worldToScreen(line.source, state, size);
  const b = worldToScreen(line.target, state, size);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function draw(state) {
  if (!canvas || !ctx) return;
  const size = resize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!state?.cells?.length || !latest?.rendererHandoff?.descriptors) return;
  const descriptors = latest.rendererHandoff.descriptors;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const front of descriptors.moraleFronts || []) {
    const center = worldToScreen(front.center, state, size);
    const radius = (front.radius || 1) * 28 * (state.camera?.z || 1);
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.max(12, radius));
    gradient.addColorStop(0, front.owner === "player" ? "rgba(255,88,52,.24)" : "rgba(255,194,88,.16)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, Math.max(12, radius), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.44;
  for (const line of descriptors.supplyLines || []) strokeLine(line, state, size, line.pressure > 0.48 ? "rgba(255,84,54,.62)" : "rgba(255,220,126,.52)", 1.2 + line.pressure * 3);

  ctx.globalAlpha = 0.82;
  for (const corridor of descriptors.marchCorridors || []) strokeLine(corridor, state, size, corridor.selected ? "rgba(255,255,198,.95)" : "rgba(135,214,255,.54)", 2 + corridor.width * 2);

  for (const field of descriptors.cohesionFields || []) {
    const p = worldToScreen(field.center, state, size);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 7 + field.radius * 8, 4 + field.radius * 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = field.owner === "player" ? "rgba(255,68,48,.30)" : field.owner === "neutral" ? "rgba(255,255,255,.08)" : "rgba(255,188,74,.20)";
    ctx.fill();
  }
  ctx.restore();
}

function patchHost() {
  const host = globalThis.GameHost;
  if (!host || patched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => ({
    ...originalSnapshot(),
    campaignFractal: latest,
    domain: {
      ...(originalSnapshot().domain || {}),
      cavalryCampaignFractal: latest
    }
  });
  host.getCavalryCampaignFractal = () => latest;
  host.getRendererHandoff = () => latest?.rendererHandoff ?? null;
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-campaign-fractal-handoff{position:fixed;inset:0;z-index:145;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.88}
    #cavalry-campaign-fractal-handoff canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-campaign-fractal-handoff";
  root.dataset.style = HANDOFF_STYLE;
  root.dataset.rendererConsumes = "descriptors-only";
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  root.append(canvas);
  document.body.append(root);
  ctx = canvas.getContext("2d");
}

function frame() {
  install();
  const state = campaign();
  latest = domainKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryCampaignFractal = {
  style: HANDOFF_STYLE,
  nexusEngine: NexusEngine,
  domainKit,
  getState: () => latest,
  getRendererHandoff: () => latest?.rendererHandoff ?? null,
  describe: (input) => domainKit.describe(input)
};
requestAnimationFrame(frame);
