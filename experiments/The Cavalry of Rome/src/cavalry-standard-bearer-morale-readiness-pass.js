import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryStandardBearerMoraleReadinessDomainKit } from "./cavalry-standard-bearer-morale-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-standard-bearer-morale-readiness-pass-041";
const moraleKit = createCavalryStandardBearerMoraleReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = moraleKit.describe({ cells: [], turn: 0, actions: 0 });

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
  const width = Math.max(140, Math.min(306, size.width * 0.2));
  const height = 14;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(11,8,16,.76)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? chip.honorReadiness ?? chip.cadenceStrength ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,244,214,.95)";
  ctx.fillText(String(chip.label || "standard morale"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const moraleHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(moraleHandoff.descriptors || {}) };
  return {
    id: "cavalry-standard-bearer-morale-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), moraleHandoff.id].filter(Boolean),
    runtime: {
      nexusEngineCdn: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js",
      nexusEngineExportCount: Object.keys(NexusEngine).length
    }
  };
}

function drawStandardMarker(marker, state, size) {
  const p = worldToScreen(marker.center, state, size);
  const scale = 1 + marker.standardIntegrity * 1.4;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 24 * scale);
  ctx.lineTo(p.x, p.y + 18 * scale);
  ctx.strokeStyle = marker.standardIntegrity > 0.64 ? "rgba(255,226,101,.9)" : "rgba(255,130,72,.76)";
  ctx.lineWidth = 1.5 + marker.standardIntegrity * 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 22 * scale);
  ctx.lineTo(p.x + 22 * scale, p.y - 14 * scale);
  ctx.lineTo(p.x, p.y - 8 * scale);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x, p.y - 30 * scale, 5 + marker.standardIntegrity * 8, 0, Math.PI * 2);
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

  for (const route of descriptors.vexillumRallyRoutes || []) {
    strokeWorldLine(route, state, size, route.routeState === "urgent" ? "rgba(255,76,67,.72)" : "rgba(255,215,106,.44)", 1.2 + route.rallyUrgency * 2.8);
  }
  for (const marker of descriptors.aquilaStandards || []) {
    drawStandardMarker(marker, state, size);
  }
  for (const ring of descriptors.standardGuardRings || []) {
    const p = worldToScreen(ring.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(18, ring.ringRadius * Number(state.camera?.z || 1) * 0.09), 0, Math.PI * 2);
    ctx.strokeStyle = ring.encirclementRisk > 0.58 ? "rgba(255,92,76,.62)" : "rgba(255,236,140,.35)";
    ctx.lineWidth = 1 + ring.encirclementRisk * 2.5;
    ctx.stroke();
  }
  for (const litter of descriptors.woundedStandardLitters || []) {
    const p = worldToScreen(litter.center, state, size);
    ctx.save();
    ctx.translate(p.x, p.y + 28);
    ctx.rotate(-0.18);
    ctx.strokeStyle = "rgba(157,226,255,.66)";
    ctx.lineWidth = 1.5 + litter.woundLoad * 2;
    ctx.strokeRect(-18, -6, 36, 12);
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();
    ctx.restore();
  }
  for (const drum of descriptors.cohortMoraleDrums || []) {
    drawChip(drum, size, drum.tempo === "advance" ? "rgba(255,218,99,.78)" : "rgba(255,137,86,.72)");
  }
  for (const ledger of descriptors.duskHonorLedgers || []) {
    drawChip(ledger, size, ledger.commandState === "ready" ? "rgba(132,255,216,.76)" : "rgba(255,174,82,.78)");
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
    return { ...base, cavalryStandardBearerMoraleReadiness: latest, domain: { ...(base.domain || {}), cavalryStandardBearerMoraleReadiness: latest } };
  };
  host.getStandardBearerMoraleReadiness = () => latest;
  host.getCavalryStandardBearerMoraleReadiness = () => latest;
  host.getStandardBearerMoraleReadinessTree = () => moraleKit.tree;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-standard-bearer-morale-readiness-pass{position:fixed;inset:0;z-index:166;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.88}
    #cavalry-standard-bearer-morale-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-standard-bearer-morale-readiness-pass";
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
  latest = moraleKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryStandardBearerMoraleReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  moraleKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => moraleKit.describe(input)
};
requestAnimationFrame(frame);
