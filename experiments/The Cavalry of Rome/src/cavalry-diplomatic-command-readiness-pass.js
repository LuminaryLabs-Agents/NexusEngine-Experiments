import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryDiplomaticCommandReadinessDomainKit } from "./cavalry-diplomatic-command-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-diplomatic-command-readiness-pass-036";
const diplomaticKit = createCavalryDiplomaticCommandReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = diplomaticKit.describe({ cells: [], turn: 0, actions: 0 });

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
    x: size.width * 0.5 + (Number(point?.x || 0) - Number(camera.x || 0)) * zoom,
    y: size.height * 0.5 + (Number(point?.y || 0) - Number(camera.y || 0)) * zoom
  };
}

function screenAnchor(anchor = {}, size) {
  return {
    x: clamp(anchor.x ?? 0.5) * size.width,
    y: clamp(anchor.y ?? 0.5) * size.height
  };
}

function strokeWorldLine(line, state, size, color, width = 1) {
  const a = worldToScreen(line.source, state, size);
  const b = worldToScreen(line.target, state, size);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawChip(chip, size, color) {
  const p = screenAnchor(chip.screenAnchor, size);
  const width = Math.max(116, Math.min(248, size.width * 0.17));
  const height = 13;
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "rgba(15,7,2,.56)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,240,196,.88)";
  ctx.fillText(String(chip.label || chip.slot || "diplomacy"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const diplomaticHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(diplomaticHandoff.descriptors || {}) };
  return {
    id: "cavalry-diplomatic-command-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), diplomaticHandoff.id].filter(Boolean)
  };
}

function draw(state) {
  if (!canvas || !ctx) return;
  const size = resize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!state?.cells?.length || !latest?.rendererHandoff?.descriptors) return;
  const descriptors = latest.rendererHandoff.descriptors;
  const zoom = Number(state.camera?.z || 1);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const banner of descriptors.allyLoyaltyBanners || []) {
    strokeWorldLine(banner, state, size, banner.loyalty > 0.62 ? "rgba(130,238,190,.62)" : "rgba(255,204,96,.52)", 1.2 + banner.loyalty * 2.4);
  }
  for (const band of descriptors.provincePacificationBands || []) {
    strokeWorldLine(band, state, size, band.pacification > 0.62 ? "rgba(255,235,128,.78)" : "rgba(255,84,54,.62)", 1.5 + band.pacification * 2.8);
    const p = worldToScreen(band.target, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8 + band.pacification * 13 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = band.pacification > 0.62 ? "rgba(255,238,150,.70)" : "rgba(255,86,52,.70)";
    ctx.lineWidth = 1.2 + band.pacification * 2;
    ctx.stroke();
  }
  for (const spark of descriptors.rebellionSparks || []) {
    const p = worldToScreen(spark.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + spark.unrest * 15 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = spark.unrest > 0.56 ? "rgba(255,74,52,.74)" : "rgba(255,184,88,.54)";
    ctx.lineWidth = 1 + spark.unrest * 2.8;
    ctx.stroke();
  }
  for (const tribute of descriptors.tributeObligationLedgers || []) {
    const p = worldToScreen(tribute.center, state, size);
    ctx.fillStyle = tribute.obligation > 0.66 ? "rgba(255,202,80,.34)" : "rgba(255,236,174,.20)";
    ctx.fillRect(p.x - 9, p.y + 11, 18, Math.max(4, tribute.obligation * 18));
  }
  for (const chip of descriptors.senateDecreeMandates || []) drawChip(chip, size, chip.pressure > 0.62 ? "rgba(255,88,54,.72)" : "rgba(255,213,98,.72)");
  for (const chip of descriptors.triumphWindowStandards || []) drawChip(chip, size, chip.pressure > 0.62 ? "rgba(255,88,54,.72)" : "rgba(255,230,136,.76)");
  ctx.restore();
}

function patchHost() {
  const host = globalThis.GameHost;
  if (!host || patched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  const originalHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({ descriptors: {}, counts: {}, sources: [] });
  host.getSnapshot = () => {
    const base = originalSnapshot();
    return {
      ...base,
      cavalryDiplomaticCommandReadiness: latest,
      domain: {
        ...(base.domain || {}),
        cavalryDiplomaticCommandReadiness: latest
      }
    };
  };
  host.getCavalryDiplomaticCommandReadiness = () => latest;
  host.getDiplomaticCommandReadiness = () => latest;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-diplomatic-command-readiness-pass{position:fixed;inset:0;z-index:149;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.84}
    #cavalry-diplomatic-command-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-diplomatic-command-readiness-pass";
  root.dataset.style = PASS_STYLE;
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
  latest = diplomaticKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryDiplomaticCommandReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  diplomaticKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => diplomaticKit.describe(input)
};
requestAnimationFrame(frame);
