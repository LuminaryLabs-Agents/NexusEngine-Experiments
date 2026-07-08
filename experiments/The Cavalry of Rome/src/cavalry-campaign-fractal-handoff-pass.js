import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCavalryCampaignFractalDomainKit } from "./cavalry-campaign-fractal-domain-kit.js";
import { createCavalryBattlefieldOrdersDomainKit } from "./cavalry-battlefield-orders-domain-kit.js";

const HANDOFF_STYLE = "cavalry-campaign-fractal-handoff-034";
const domainKit = createCavalryCampaignFractalDomainKit();
const ordersKit = createCavalryBattlefieldOrdersDomainKit();
let root = null;
let canvas = null;
let ctx = null;
let patched = false;
let latest = domainKit.describe({ cells: [], turn: 0, actions: 0 });
let latestOrders = ordersKit.describe({ cells: [], turn: 0, actions: 0 });

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

function screenAnchor(anchor = {}, size) {
  return {
    x: Math.max(0, Math.min(1, Number(anchor.x ?? 0.5))) * size.width,
    y: Math.max(0, Math.min(1, Number(anchor.y ?? 0.5))) * size.height
  };
}

function drawScreenChip(chip, size, color) {
  const p = screenAnchor(chip.screenAnchor, size);
  const width = Math.max(96, Math.min(220, size.width * 0.14));
  const height = 12;
  ctx.save();
  ctx.globalAlpha = 0.76;
  ctx.fillStyle = "rgba(10,6,3,.42)";
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(p.x - width * 0.5, p.y - height * 0.5, width * clamp(chip.fill ?? chip.pressure ?? 0), height);
  ctx.font = `${Math.max(10, 11 * (size.ratio || 1))}px Inter,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,239,198,.84)";
  ctx.fillText(String(chip.label || chip.objective || chip.slot || "orders"), p.x, p.y - 9);
  ctx.restore();
}

function composedRendererHandoff() {
  const campaignHandoff = latest?.rendererHandoff || { descriptors: {}, counts: {} };
  const ordersHandoff = latestOrders?.rendererHandoff || { descriptors: {}, counts: {} };
  const descriptors = { ...(campaignHandoff.descriptors || {}), ...(ordersHandoff.descriptors || {}) };
  return {
    id: "cavalry-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererConsumesDescriptorsOnly: true,
    descriptors,
    counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    sources: [campaignHandoff.id, ordersHandoff.id].filter(Boolean)
  };
}

function draw(state) {
  if (!canvas || !ctx) return;
  const size = resize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!state?.cells?.length || !latest?.rendererHandoff?.descriptors) return;
  const descriptors = latest.rendererHandoff.descriptors;
  const orderDescriptors = latestOrders?.rendererHandoff?.descriptors || {};

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

  for (const vector of orderDescriptors.scoutingVectors || []) {
    strokeLine(vector, state, size, vector.relation === "hostile" ? "rgba(255,88,76,.72)" : "rgba(122,228,255,.56)", 1.4 + vector.confidence * 2.2);
    const t = worldToScreen(vector.target, state, size);
    ctx.beginPath();
    ctx.arc(t.x, t.y, 4 + vector.confidence * 7, 0, Math.PI * 2);
    ctx.strokeStyle = vector.relation === "hostile" ? "rgba(255,121,78,.72)" : "rgba(255,229,142,.66)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  for (const risk of orderDescriptors.flankRiskArcs || []) {
    const p = worldToScreen(risk.center, state, size);
    ctx.beginPath();
    ctx.arc(p.x, p.y, (20 + risk.arcRadius * 16) * (state.camera?.z || 1), -0.35 * Math.PI, 1.22 * Math.PI);
    ctx.strokeStyle = risk.stance === "exposed" ? "rgba(255,64,44,.82)" : "rgba(255,194,88,.56)";
    ctx.lineWidth = 1.5 + risk.risk * 3;
    ctx.stroke();
  }

  for (const callout of orderDescriptors.reinforcementCallouts || []) {
    const p = worldToScreen(callout.center, state, size);
    ctx.fillStyle = callout.urgency > 0.55 ? "rgba(255,78,54,.46)" : "rgba(255,214,124,.34)";
    ctx.fillRect(p.x - 9, p.y - 23, 18, 8 + callout.urgency * 16);
  }

  for (const chip of orderDescriptors.attritionForecastChips || []) {
    const p = worldToScreen(chip.midpoint, state, size);
    ctx.beginPath();
    ctx.roundRect(p.x - 20, p.y - 9, 40, 18, 7);
    ctx.fillStyle = chip.lossRisk > 0.55 ? "rgba(255,72,48,.42)" : "rgba(255,236,162,.30)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,246,208,.38)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (const field of descriptors.cohesionFields || []) {
    const p = worldToScreen(field.center, state, size);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 7 + field.radius * 8, 4 + field.radius * 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = field.owner === "player" ? "rgba(255,68,48,.30)" : field.owner === "neutral" ? "rgba(255,255,255,.08)" : "rgba(255,188,74,.20)";
    ctx.fill();
  }

  for (const tempo of orderDescriptors.turnTempoStandards || []) drawScreenChip(tempo, size, tempo.tempo === "spent" ? "rgba(255,74,48,.72)" : "rgba(255,207,92,.72)");
  for (const banner of orderDescriptors.objectivePressureBanners || []) drawScreenChip({ ...banner, fill: 1 - banner.pressure, label: banner.objective }, size, banner.pressure > 0.58 ? "rgba(255,82,58,.72)" : "rgba(255,216,112,.72)");
  ctx.restore();
}

function patchHost() {
  const host = globalThis.GameHost;
  if (!host || patched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const base = originalSnapshot();
    return {
      ...base,
      campaignFractal: latest,
      campaignBattlefieldOrders: latestOrders,
      domain: {
        ...(base.domain || {}),
        cavalryCampaignFractal: latest,
        cavalryBattlefieldOrders: latestOrders
      }
    };
  };
  host.getCavalryCampaignFractal = () => latest;
  host.getCavalryBattlefieldOrders = () => latestOrders;
  host.getRendererHandoff = () => composedRendererHandoff();
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
  latestOrders = ordersKit.describe(state || { cells: [], turn: 0, actions: 0 });
  patchHost();
  draw(state);
  requestAnimationFrame(frame);
}

install();
globalThis.CavalryCampaignFractal = {
  style: HANDOFF_STYLE,
  nexusEngine: NexusEngine,
  domainKit,
  ordersKit,
  getState: () => latest,
  getBattlefieldOrders: () => latestOrders,
  getRendererHandoff: () => composedRendererHandoff(),
  describe: (input) => domainKit.describe(input),
  describeOrders: (input) => ordersKit.describe(input)
};
requestAnimationFrame(frame);
