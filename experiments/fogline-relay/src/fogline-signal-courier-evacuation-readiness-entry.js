import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createFoglineSignalCourierEvacuationReadinessDomainKit } from "./fogline-signal-courier-evacuation-readiness-kits.js";

const UPGRADE_ID = "signal-courier-evacuation-readiness-renderer-handoff-pass";
const domainKit = createFoglineSignalCourierEvacuationReadinessDomainKit();
const nexusEngineCdnLoaded = Boolean(NexusEngine);

function createOverlay() {
  let overlay = document.querySelector("[data-fogline-signal-courier-evacuation-overlay]");
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.dataset.foglineSignalCourierEvacuationOverlay = "true";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "9",
    mixBlendMode: "screen"
  });
  document.body.append(overlay);
  return overlay;
}

function readInput(host) {
  const snapshot = host?.getState?.() ?? host?.session?.snapshot?.() ?? {};
  const level = snapshot.level ?? host?.session?.level ?? {};
  const game = snapshot.game ?? snapshot ?? {};
  return { level, route: level.route ?? [], game, time: performance.now() / 1000 };
}

function mergeCounts(...sources) {
  return sources.reduce((merged, source) => {
    for (const [key, value] of Object.entries(source ?? {})) {
      merged[key] = (merged[key] ?? 0) + Number(value ?? 0);
    }
    return merged;
  }, {});
}

function composeRendererHandoff(base = {}, courier = {}) {
  const descriptors = courier.drawOrder ?? [];
  return {
    ...base,
    id: "fogline-signal-courier-evacuation-composed-renderer-handoff",
    archetype: "fogline.composed.renderer.handoff.signal.courier.evacuation",
    policy: "renderer-consumes-descriptors-only",
    descriptorCount: Number(base.descriptorCount ?? (base.descriptors ?? []).length) + descriptors.length,
    signalCourierEvacuationDescriptorCount: descriptors.length,
    descriptors: [...(base.descriptors ?? []), ...descriptors],
    sourceHandoffs: [...(base.sourceHandoffs ?? []), courier.rendererHandoff].filter(Boolean),
    counts: mergeCounts(base.counts, courier.rendererHandoff?.counts),
    ownership: {
      renderer: "consume-only",
      dom: "presentation-only-overlay",
      browserInput: "excluded",
      three: "excluded",
      webgl: "excluded",
      audio: "excluded",
      assets: "excluded",
      frameLoop: "presentation-only-overlay",
      physics: "excluded",
      storage: "excluded"
    }
  };
}

function descriptorPosition(descriptor = {}, level = {}) {
  const bounds = level.bounds ?? { minX: -18, maxX: 18, minZ: -8, maxZ: 62 };
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const depth = Math.max(1, bounds.maxZ - bounds.minZ);
  return {
    x: ((Number(descriptor.position?.x ?? 0) - bounds.minX) / width) * window.innerWidth,
    y: ((Number(descriptor.position?.z ?? 0) - bounds.minZ) / depth) * window.innerHeight
  };
}

function drawDescriptor(ctx, descriptor, level) {
  const point = descriptorPosition(descriptor, level);
  const opacity = Math.max(0.04, Math.min(0.52, Number(descriptor.opacity ?? 0.14)));
  const radius = Math.max(7, Number(descriptor.radius ?? descriptor.width ?? 1) * 8);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = descriptor.color ?? "#fff0a8";
  ctx.fillStyle = descriptor.color ?? "#fff0a8";
  ctx.lineWidth = Math.max(1, Number(descriptor.width ?? 1) * 2);
  if (descriptor.compatibleBucket === "routeThreads") {
    const yaw = Number(descriptor.yaw ?? 0);
    const length = Math.max(30, Number(descriptor.length ?? 6) * 7);
    ctx.setLineDash([12, 8, 3, 8]);
    ctx.beginPath();
    ctx.moveTo(point.x - Math.sin(yaw) * length * 0.5, point.y - Math.cos(yaw) * length * 0.5);
    ctx.lineTo(point.x + Math.sin(yaw) * length * 0.5, point.y + Math.cos(yaw) * length * 0.5);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "groundGlyphs") {
    const heading = Number(descriptor.heading ?? 0);
    ctx.translate(point.x, point.y);
    ctx.rotate(heading);
    ctx.beginPath();
    ctx.moveTo(radius * 1.4, 0);
    ctx.lineTo(-radius, -radius * 0.7);
    ctx.lineTo(-radius * 0.55, 0);
    ctx.lineTo(-radius, radius * 0.7);
    ctx.closePath();
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "supplyCaches") {
    ctx.strokeRect(point.x - radius * 1.25, point.y - radius * 0.7, radius * 2.5, radius * 1.4);
    ctx.beginPath();
    ctx.moveTo(point.x - radius, point.y);
    ctx.lineTo(point.x + radius, point.y);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "signalBeacons") {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x - radius * 1.4, point.y - radius * 1.4);
    ctx.lineTo(point.x + radius * 1.4, point.y + radius * 1.4);
    ctx.moveTo(point.x + radius * 1.4, point.y - radius * 1.4);
    ctx.lineTo(point.x - radius * 1.4, point.y + radius * 1.4);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "summaryLedgers") {
    ctx.strokeRect(point.x - radius * 1.7, point.y - radius, radius * 3.4, radius * 2);
    ctx.beginPath();
    ctx.moveTo(point.x - radius, point.y - radius * 0.25);
    ctx.lineTo(point.x + radius, point.y - radius * 0.25);
    ctx.moveTo(point.x - radius, point.y + radius * 0.3);
    ctx.lineTo(point.x + radius * 0.5, point.y + radius * 0.3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function renderOverlay(canvas, host, getDomain) {
  const ctx = canvas.getContext("2d");
  const input = readInput(host);
  const ratio = window.devicePixelRatio || 1;
  const width = Math.floor(window.innerWidth * ratio);
  const height = Math.floor(window.innerHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const descriptor of getDomain().drawOrder ?? []) {
    drawDescriptor(ctx, descriptor, input.level);
  }
}

function install(host) {
  if (!host || host.__foglineSignalCourierEvacuationReadinessInstalled) return false;
  const overlay = createOverlay();
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const getDomain = () => domainKit.describe(readInput(host));
  host.getSignalCourierEvacuationReadiness = getDomain;
  host.getFoglineSignalCourierEvacuationReadiness = getDomain;
  host.getSignalCourierEvacuationReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.() ?? {}, getDomain());
  host.__foglineSignalCourierEvacuationReadinessInstalled = true;
  document.body.dataset.foglineSignalCourierEvacuationReadiness = "ready";
  document.body.dataset.foglineSignalCourierEvacuationUpgrade = UPGRADE_ID;
  globalThis.FoglineSignalCourierEvacuationReadiness = { domainKit, getDomain, nexusEngineCdnLoaded, upgradeId: UPGRADE_ID };

  const render = () => {
    renderOverlay(overlay, host, getDomain);
    requestAnimationFrame(render);
  };
  render();
  return true;
}

function waitForHost(attempt = 0) {
  if (install(globalThis.GameHost)) return;
  if (attempt < 90) setTimeout(() => waitForHost(attempt + 1), 100);
}

waitForHost();
