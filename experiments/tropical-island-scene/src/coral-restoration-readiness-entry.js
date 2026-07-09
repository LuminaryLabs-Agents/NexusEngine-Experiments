import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createTropicalCoralRestorationReadinessDomainKit } from "./tropical-coral-restoration-readiness-domain-kit.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const kit = createTropicalCoralRestorationReadinessDomainKit({ engine: "NexusEngine main CDN" });
let overlay;
let context;
let patchedHost;
let latestReadiness = kit.describe({ time: 0 });

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.id = "tropical-coral-restoration-readiness-overlay";
  overlay.setAttribute("aria-label", "Descriptor-only tropical coral restoration readiness overlay");
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
    x: width * (0.5 + Number(point.x ?? 0) * 0.56),
    y: height * (0.5 - Number(point.y ?? 0) * 0.78)
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

  for (const scan of descriptors.bleachingScans ?? []) {
    drawRing(scan.position, scan.radius ?? 0.03, scan.opacity ?? 0.2, scan.triageBand === "urgent" ? "rgba(255,128,108,0.86)" : "rgba(255,241,168,0.58)");
  }
  for (const gauge of descriptors.algaePressureGauges ?? []) {
    drawLine(gauge.start, gauge.end, gauge.width ?? 0.008, gauge.opacity ?? 0.2, gauge.algaePressure > 0.62 ? "rgba(92,255,145,0.76)" : "rgba(112,210,255,0.52)");
  }
  for (const cradle of descriptors.coralFragmentCradles ?? []) {
    drawRing(cradle.position, cradle.radius ?? 0.03, cradle.opacity ?? 0.22, cradle.cradleReadiness > 0.62 ? "rgba(255,151,214,0.84)" : "rgba(255,200,240,0.56)");
  }
  for (const route of descriptors.diverTransectRoutes ?? []) {
    drawLine(route.start, route.end, route.width ?? 0.008, route.opacity ?? 0.2, route.routeWindow === "open" ? "rgba(87,245,255,0.82)" : "rgba(150,210,255,0.52)");
  }
  for (const corridor of descriptors.turtleSafeCorridors ?? []) {
    drawLine(corridor.start, corridor.end, corridor.width ?? 0.01, corridor.opacity ?? 0.2, corridor.hatchlingBypassReady ? "rgba(166,255,118,0.82)" : "rgba(222,241,118,0.52)");
  }
  for (const ledger of descriptors.dawnReefLedgers ?? []) {
    drawRing(ledger.position, ledger.radius ?? 0.032, ledger.opacity ?? 0.24, ledger.missionState === "ready" ? "rgba(255,246,130,0.92)" : "rgba(137,255,222,0.58)");
  }
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return;
  patchedHost = host;
  const originalGetState = host.getState?.bind(host);
  const originalRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getCoralRestorationReadiness = () => latestReadiness;
  host.getTropicalCoralRestorationReadiness = () => latestReadiness;
  host.getCoralRestorationReadinessTree = () => kit.domainTree;
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      coralRestorationReadiness: latestReadiness,
      domain: { ...(state.domain ?? {}), tropicalCoralRestorationReadiness: latestReadiness }
    };
  };
  host.getRendererHandoff = () => {
    const base = originalRendererHandoff?.() ?? {};
    const coralRestoration = latestReadiness?.rendererHandoff ?? {};
    return {
      id: "tropical-island-combined-coral-restoration-handoff",
      kind: "renderer-handoff",
      contract: "renderer-consumes-descriptors-only",
      counts: { ...(base.counts ?? {}), ...(coralRestoration.counts ?? {}) },
      descriptors: { ...(base.descriptors ?? {}), ...(coralRestoration.descriptors ?? {}) },
      base,
      coralRestoration,
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
      reefRescueReadiness: state.reefRescueReadiness,
      tideSalvageReadiness: state.tideSalvageReadiness,
      stormClinicReadiness: state.stormClinicReadiness,
      rainwaterPurificationReadiness: state.rainwaterPurificationReadiness,
      mangroveNurseryReadiness: state.mangroveNurseryReadiness,
      lagoonNavigation: state.lagoonNavigationReadability
    });
    window.__tropicalCoralRestorationReadiness = latestReadiness;
    document.body.dataset.tropicalCoralRestoration = String(latestReadiness.rendererHandoff.counts.total);
    renderReadiness(latestReadiness);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeOverlay);
requestAnimationFrame(frame);
