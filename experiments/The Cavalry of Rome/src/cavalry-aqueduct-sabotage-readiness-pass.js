import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryAqueductSabotageReadinessDomainKit } from "./cavalry-aqueduct-sabotage-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-aqueduct-sabotage-readiness-pass-039";
const aqueductKit = createCavalryAqueductSabotageReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = aqueductKit.describe({ cells: [], turn: 0, actions: 0 });

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
  return { x: clamp(anchor.x ?? 0.5) * size.width, y: clamp(anchor.y ?? 0.5) * size.height };
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
  const width = Math.max(130, Math.min(280, size.width * 0.18));
  const height = 14;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(8,22,27,.68)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? chip.secured ?? chip.reserve ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(230,250,255,.94)";
  ctx.fillText(String(chip.label || "aqueduct"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const aqueductHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(aqueductHandoff.descriptors || {}) };
  return {
    id: "cavalry-aqueduct-sabotage-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), aqueductHandoff.id].filter(Boolean)
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

  for (const trail of descriptors.saboteurTrailSignals || []) {
    strokeWorldLine(trail, state, size, trail.trailHeat > 0.62 ? "rgba(255,92,70,.74)" : "rgba(255,184,86,.42)", 1.2 + trail.trailHeat * 2.4);
  }
  for (const column of descriptors.engineerRepairColumns || []) {
    strokeWorldLine(column, state, size, column.urgency > 0.56 ? "rgba(91,226,255,.70)" : "rgba(156,236,255,.38)", 1.1 + column.urgency * 2.1);
  }
  for (const intake of descriptors.springIntakeWatchtowers || []) {
    const p = worldToScreen(intake.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7 + intake.contaminationRisk * 18 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = intake.contaminationRisk > 0.55 ? "rgba(255,90,74,.76)" : "rgba(120,244,255,.52)";
    ctx.lineWidth = 1.2 + intake.contaminationRisk * 2;
    ctx.stroke();
  }
  for (const arch of descriptors.aqueductArchStressMarks || []) {
    const p = worldToScreen(arch.center, state, size);
    ctx.beginPath();
    ctx.moveTo(p.x - 12, p.y + 8);
    ctx.quadraticCurveTo(p.x, p.y - 13 - arch.fracture * 8, p.x + 12, p.y + 8);
    ctx.strokeStyle = arch.fracture > 0.52 ? "rgba(255,218,88,.78)" : "rgba(121,220,255,.46)";
    ctx.lineWidth = 1.2 + arch.fracture * 2.2;
    ctx.stroke();
  }
  for (const token of descriptors.cisternRationTokens || []) {
    drawChip(token, size, token.demand > 0.58 ? "rgba(255,202,83,.76)" : "rgba(116,255,234,.66)");
  }
  for (const ledger of descriptors.dawnWaterLedgers || []) {
    drawChip(ledger, size, ledger.shortage > 0.48 ? "rgba(255,128,82,.76)" : "rgba(108,240,255,.70)");
  }
  ctx.restore();
}

function patchHost() {
  const host = globalThis.GameHost;
  if (!host || patched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : typeof host.getState === "function" ? host.getState.bind(host) : () => ({});
  const originalHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({ descriptors: {}, counts: {}, sources: [] });
  host.getSnapshot = () => {
    const base = originalSnapshot();
    return { ...base, cavalryAqueductSabotageReadiness: latest, domain: { ...(base.domain || {}), cavalryAqueductSabotageReadiness: latest } };
  };
  host.getAqueductSabotageReadiness = () => latest;
  host.getCavalryAqueductSabotageReadiness = () => latest;
  host.getAqueductSabotageReadinessTree = () => aqueductKit.tree;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-aqueduct-sabotage-readiness-pass{position:fixed;inset:0;z-index:162;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.9}
    #cavalry-aqueduct-sabotage-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-aqueduct-sabotage-readiness-pass";
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
  latest = aqueductKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryAqueductSabotageReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  aqueductKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => aqueductKit.describe(input)
};
requestAnimationFrame(frame);
