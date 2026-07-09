import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryFrontierBeaconChainReadinessDomainKit } from "./cavalry-frontier-beacon-chain-readiness-domain-kit.js";

const PASS_STYLE = "cavalry-frontier-beacon-chain-readiness-pass-040";
const beaconKit = createCavalryFrontierBeaconChainReadinessDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = beaconKit.describe({ cells: [], turn: 0, actions: 0 });

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
  const width = Math.max(136, Math.min(292, size.width * 0.19));
  const height = 14;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(12,12,22,.72)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? chip.coverage ?? chip.watchLoad ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,248,224,.94)";
  ctx.fillText(String(chip.label || "beacon chain"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff(base = {}) {
  const beaconHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(base.descriptors || {}), ...(beaconHandoff.descriptors || {}) };
  return {
    id: "cavalry-frontier-beacon-chain-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [...(Array.isArray(base.sources) ? base.sources : [base.id].filter(Boolean)), beaconHandoff.id].filter(Boolean),
    runtime: {
      nexusEngineCdn: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js",
      nexusEngineExportCount: Object.keys(NexusEngine).length
    }
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

  for (const route of descriptors.dispatchRiderRoutes || []) {
    strokeWorldLine(route, state, size, route.routeState === "urgent" ? "rgba(255,148,70,.78)" : "rgba(255,224,118,.42)", 1.1 + route.urgency * 2.3);
  }
  for (const tower of descriptors.frontierBeaconTowers || []) {
    const p = worldToScreen(tower.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8 + tower.elevationProxy * 18 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = tower.signalBand === "long-range" ? "rgba(255,232,94,.86)" : "rgba(255,188,92,.52)";
    ctx.lineWidth = 1.2 + tower.elevationProxy * 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 18 - tower.elevationProxy * 14);
    ctx.lineTo(p.x - 8, p.y + 10);
    ctx.lineTo(p.x + 8, p.y + 10);
    ctx.closePath();
    ctx.stroke();
  }
  for (const plume of descriptors.smokePlumeRelays || []) {
    const p = worldToScreen(plume.center, state, size);
    for (let index = 0; index < plume.plumeColumns; index += 1) {
      ctx.beginPath();
      ctx.arc(p.x + (index - plume.plumeColumns / 2) * 7, p.y - 24 - index * 6, 5 + plume.relayClarity * 12, 0, Math.PI * 2);
      ctx.strokeStyle = plume.dayCode === "clear-three-column" ? "rgba(214,244,255,.78)" : "rgba(198,203,211,.42)";
      ctx.lineWidth = 1 + plume.relayClarity * 1.5;
      ctx.stroke();
    }
  }
  for (const post of descriptors.roadMileposts || []) {
    const p = worldToScreen(post.center, state, size);
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y + 14);
    ctx.lineTo(p.x + 8, p.y - 14);
    ctx.strokeStyle = post.roadIntegrity > 0.58 ? "rgba(137,255,205,.72)" : "rgba(255,217,115,.45)";
    ctx.lineWidth = 1 + post.roadIntegrity * 2;
    ctx.stroke();
  }
  for (const watch of descriptors.nightWatchCohorts || []) {
    drawChip(watch, size, watch.watchLoad > 0.58 ? "rgba(255,128,78,.74)" : "rgba(255,219,100,.66)");
  }
  for (const ledger of descriptors.senateDispatchLedgers || []) {
    drawChip(ledger, size, ledger.commandState === "ready" ? "rgba(126,255,219,.76)" : "rgba(255,182,82,.76)");
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
    return { ...base, cavalryFrontierBeaconChainReadiness: latest, domain: { ...(base.domain || {}), cavalryFrontierBeaconChainReadiness: latest } };
  };
  host.getFrontierBeaconChainReadiness = () => latest;
  host.getCavalryFrontierBeaconChainReadiness = () => latest;
  host.getFrontierBeaconChainReadinessTree = () => beaconKit.tree;
  host.getRendererHandoff = () => composedRendererHandoff(originalHandoff());
  patched = true;
  return true;
}

function install() {
  if (root) return;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-frontier-beacon-chain-readiness-pass{position:fixed;inset:0;z-index:164;pointer-events:none;display:block;mix-blend-mode:screen;opacity:.9}
    #cavalry-frontier-beacon-chain-readiness-pass canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "cavalry-frontier-beacon-chain-readiness-pass";
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
  latest = beaconKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryFrontierBeaconChainReadiness = {
  style: PASS_STYLE,
  nexusEngine: NexusEngine,
  beaconKit,
  getState: () => latest,
  getRendererHandoff: () => latest.rendererHandoff,
  describe: (input) => beaconKit.describe(input)
};
requestAnimationFrame(frame);
