import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryFieldHospitalReadinessDomainKit } from "./cavalry-field-hospital-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-field-hospital-readiness-pass-037";
const hospitalKit = createCavalryFieldHospitalReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = hospitalKit.describe({ cells: [], turn: 0, actions: 0 });

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
  const width = Math.max(112, Math.min(248, size.width * 0.16));
  const height = 12;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(5,12,10,.60)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(232,255,228,.90)";
  ctx.fillText(String(chip.label || chip.slot || "hospital"), p.x, p.y - 8);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const hospitalHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(hospitalHandoff.descriptors || {}) };
  return {
    id: "cavalry-field-hospital-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), hospitalHandoff.id].filter(Boolean)
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
  for (const route of descriptors.bandageCartRoutes || []) {
    strokeWorldLine(route, state, size, route.urgency > 0.6 ? "rgba(96,255,196,.68)" : "rgba(154,239,164,.46)", 1.4 + route.urgency * 2.4);
  }
  for (const thread of descriptors.stretcherRoadThreads || []) {
    strokeWorldLine(thread, state, size, thread.safety > 0.6 ? "rgba(174,255,210,.58)" : "rgba(255,112,80,.60)", 1.1 + (1 - thread.safety) * 2.2);
  }
  for (const triage of descriptors.woundedCohortTriages || []) {
    const p = worldToScreen(triage.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 + triage.severity * 18 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = triage.severity > 0.62 ? "rgba(255,80,70,.76)" : "rgba(255,196,112,.58)";
    ctx.lineWidth = 1.4 + triage.severity * 2.2;
    ctx.stroke();
  }
  for (const tent of descriptors.medicTentCapacities || []) {
    const p = worldToScreen(tent.center, state, size);
    ctx.fillStyle = tent.capacity > 0.62 ? "rgba(96,255,174,.32)" : "rgba(255,226,128,.25)";
    ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
    ctx.strokeStyle = "rgba(226,255,222,.52)";
    ctx.strokeRect(p.x - 10, p.y - 10, 20, 20);
  }
  for (const well of descriptors.sanitationWellWatches || []) {
    const p = worldToScreen(well.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 + well.risk * 12 * zoom, 0, Math.PI * 2);
    ctx.fillStyle = well.risk > 0.45 ? "rgba(255,118,74,.24)" : "rgba(98,232,255,.22)";
    ctx.fill();
  }
  for (const chip of descriptors.dawnReliefStandards || []) drawChip(chip, size, chip.pressure > 0.62 ? "rgba(255,110,70,.72)" : "rgba(118,255,172,.76)");
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
      cavalryFieldHospitalReadiness: latest,
      domain: {
        ...(base.domain || {}),
        cavalryFieldHospitalReadiness: latest
      }
    };
  };
  host.getCavalryFieldHospitalReadiness = () => latest;
  host.getFieldHospitalReadiness = () => latest;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-field-hospital-readiness-pass{position:fixed;inset:0;z-index:150;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.86}
    #cavalry-field-hospital-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-field-hospital-readiness-pass";
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
  latest = hospitalKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryFieldHospitalReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  hospitalKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => hospitalKit.describe(input)
};
requestAnimationFrame(frame);
