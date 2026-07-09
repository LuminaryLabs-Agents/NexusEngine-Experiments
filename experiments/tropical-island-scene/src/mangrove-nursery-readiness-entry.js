import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalMangroveNurseryReadinessDomainKit } from "./tropical-mangrove-nursery-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalMangroveNurseryReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-mangrove-nursery-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical mangrove nursery readiness overlay");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "2"
  });
  document.querySelector("#app")?.appendChild(overlay);
  context = overlay.getContext("2d");
  return overlay;
}

function resizeOverlay() {
  ensureOverlay();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(innerWidth * ratio));
  const height = Math.max(1, Math.floor(innerHeight * ratio));
  if (overlay.width !== width || overlay.height !== height) {
    overlay.width = width;
    overlay.height = height;
  }
}

function toCanvas(point = {}) {
  const width = overlay.width;
  const height = overlay.height;
  return {
    x: width * (0.5 + Number(point.x ?? 0) * 0.58),
    y: height * (0.5 - Number(point.y ?? 0) * 0.82)
  };
}

function drawLine(start, end, width, opacity, color) {
  const a = toCanvas(start);
  const b = toCanvas(end);
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.25, width * overlay.width);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
  context.restore();
}

function drawRing(position, radius, opacity, color) {
  const p = toCanvas(position);
  const r = Math.max(5, radius * Math.min(overlay.width, overlay.height));
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.25, r * 0.08);
  context.beginPath();
  context.arc(p.x, p.y, r, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function renderReadiness(readiness) {
  resizeOverlay();
  if (!context) return;
  context.clearRect(0, 0, overlay.width, overlay.height);
  const descriptors = readiness?.rendererHandoff?.descriptors ?? {};

  for (const channel of descriptors.brackishChannelRibbons ?? []) {
    drawLine(channel.start, channel.end, channel.width ?? 0.008, channel.opacity ?? 0.18, channel.flowScore > 0.62 ? "rgba(88,255,212,0.84)" : "rgba(88,190,255,0.52)");
  }
  for (const cradle of descriptors.rootNurseryCradles ?? []) {
    drawLine(cradle.start, cradle.end, cradle.width ?? 0.008, cradle.opacity ?? 0.18, cradle.cradleScore > 0.62 ? "rgba(142,255,124,0.8)" : "rgba(195,232,128,0.56)");
  }
  for (const cluster of descriptors.propaguleClusters ?? []) {
    drawRing(cluster.position, cluster.radius ?? 0.03, cluster.opacity ?? 0.22, cluster.germinationScore > 0.62 ? "rgba(166,255,109,0.88)" : "rgba(255,211,123,0.62)");
  }
  for (const crab of descriptors.crabBurrowGuards ?? []) {
    drawRing(crab.position, crab.radius ?? 0.028, crab.opacity ?? 0.22, crab.crabPressure > 0.48 ? "rgba(255,142,102,0.76)" : "rgba(255,231,142,0.6)");
  }
  for (const heron of descriptors.heronRoostWatches ?? []) {
    drawRing(heron.position, heron.radius ?? 0.035, heron.opacity ?? 0.24, heron.watchScore > 0.62 ? "rgba(235,255,255,0.86)" : "rgba(150,227,255,0.58)");
  }
  for (const ledger of descriptors.dawnRangerTagLedgers ?? []) {
    drawRing(ledger.position, ledger.radius ?? 0.032, ledger.opacity ?? 0.24, ledger.tagReadiness > 0.62 ? "rgba(255,246,137,0.9)" : "rgba(137,255,192,0.6)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getMangroveNurseryReadiness = () => latestReadiness;
  host.getTropicalMangroveNurseryReadiness = () => latestReadiness;
  host.getMangroveNurseryReadinessTree = () => kit.domainTree;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      mangroveNurseryReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalMangroveNurseryReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const mangroveNursery = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-mangrove-nursery-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(mangroveNursery.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(mangroveNursery.descriptors ?? {}) },
      base,
      mangroveNursery,
      runtime: { nexusEngineCdn: NEXUS_ENGINE_CDN, nexusEngineExportCount: Object.keys(NexusEngine).length }
    };
  };
}

function frame(now) {
  const host = window.GameHost;
  if (host?.getState) {
    patchGameHost(host);
    const state = host.getState();
    latestReadiness = kit.describe({
      ...state,
      time: now / 1000,
      orbit: state.camera?.angle,
      fish: state.fish,
      floatProps: state.floatProps,
      coconuts: state.coconuts,
      rainwaterPurificationReadiness: state.rainwaterPurificationReadiness,
      stormClinicReadiness: state.stormClinicReadiness,
      tideSalvageReadiness: state.tideSalvageReadiness,
      reefRescueReadiness: state.reefRescueReadiness,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalMangroveNurseryReadiness = latestReadiness;
    document.body.dataset.tropicalMangroveNursery = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
