import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryLogisticsReadinessDomainKit } from "./cavalry-logistics-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-logistics-readiness-pass-035";
const logisticsKit = createCavalryLogisticsReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = logisticsKit.describe({ cells: [], turn: 0, actions: 0 });

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

function drawChip(chip, size, color) {
  const p = screenAnchor(chip.screenAnchor, size);
  const width = Math.max(104, Math.min(236, size.width * 0.16));
  const height = 13;
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "rgba(10,5,2,.52)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,241,202,.88)";
  ctx.fillText(String(chip.label || chip.warning || chip.slot || "logistics"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const logisticsHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(logisticsHandoff.descriptors || {}) };
  return {
    id: "cavalry-logistics-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), logisticsHandoff.id].filter(Boolean)
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
  for (const depot of descriptors.supplyDepotRadii || []) {
    const p = worldToScreen(depot.center, state, size);
    const r = Math.max(15, depot.radius * 21 * zoom);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, depot.hostileNeighbors ? "rgba(255,88,48,.22)" : "rgba(255,226,132,.20)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.62;
  for (const corridor of descriptors.forageCorridors || []) {
    strokeLine(corridor, state, size, "rgba(128,236,150,.58)", 1.2 + corridor.forageValue * 2.2);
  }

  ctx.globalAlpha = 0.66;
  for (const road of descriptors.roadStrainThreads || []) {
    strokeLine(road, state, size, road.strain > 0.68 ? "rgba(255,78,48,.68)" : "rgba(255,216,116,.48)", 1 + road.strain * 3);
  }

  ctx.globalAlpha = 0.84;
  for (const signal of descriptors.siegeReadinessSignals || []) {
    strokeLine(signal, state, size, signal.readiness > 0.62 ? "rgba(255,244,178,.84)" : "rgba(255,108,72,.60)", 1.5 + signal.readiness * 2.4);
    const p = worldToScreen(signal.target, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + signal.readiness * 10, 0, Math.PI * 2);
    ctx.strokeStyle = signal.readiness > 0.62 ? "rgba(255,243,172,.80)" : "rgba(255,94,58,.70)";
    ctx.lineWidth = 1.2 + signal.readiness * 2;
    ctx.stroke();
  }

  for (const warning of descriptors.winterAttritionWarnings || []) {
    const p = worldToScreen(warning.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9 + warning.exposure * 12, 0, Math.PI * 2);
    ctx.strokeStyle = warning.exposure > 0.66 ? "rgba(150,220,255,.78)" : "rgba(200,235,255,.42)";
    ctx.lineWidth = 1 + warning.exposure * 2.4;
    ctx.stroke();
  }

  for (const pulse of descriptors.courierOrderPulses || []) drawChip(pulse, size, "rgba(255,205,92,.74)");
  for (const warning of descriptors.winterAttritionWarnings || []) drawChip(warning, size, warning.exposure > 0.62 ? "rgba(132,210,255,.72)" : "rgba(222,238,255,.54)");
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
      cavalryLogisticsReadiness: latest,
      domain: {
        ...(base.domain || {}),
        cavalryLogisticsReadiness: latest
      }
    };
  };
  host.getCavalryLogisticsReadiness = () => latest;
  host.getLogisticsReadiness = () => latest;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-logistics-readiness-pass{position:fixed;inset:0;z-index:148;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.86}
    #cavalry-logistics-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-logistics-readiness-pass";
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
  latest = logisticsKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryLogisticsReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  logisticsKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => logisticsKit.describe(input)
};
requestAnimationFrame(frame);
