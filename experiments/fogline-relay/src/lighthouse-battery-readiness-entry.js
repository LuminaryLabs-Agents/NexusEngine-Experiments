import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createFoglineLighthouseBatteryReadinessDomainKit } from "./lighthouse-battery-readiness-kits.js";

const UPGRADE_ID = "lighthouse-battery-readiness-renderer-handoff-pass";
const domainKit = createFoglineLighthouseBatteryReadinessDomainKit();
const nexusEngineCdnLoaded = Boolean(NexusEngine);

function createOverlay() {
  let overlay = document.querySelector("[data-fogline-lighthouse-battery-overlay]");
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.dataset.foglineLighthouseBatteryOverlay = "true";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "6",
    mixBlendMode: "screen"
  });
  document.body.append(overlay);
  return overlay;
}

function readInput(host) {
  const snapshot = host?.getState?.() ?? host?.session?.snapshot?.() ?? {};
  const level = snapshot.level ?? host?.session?.level ?? {};
  const game = snapshot.game ?? {};
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

function composeRendererHandoff(base = {}, lighthouseBattery = {}) {
  const descriptors = lighthouseBattery.drawOrder ?? [];
  return {
    ...base,
    id: "fogline-lighthouse-battery-composed-renderer-handoff",
    archetype: "fogline.composed.renderer.handoff.lighthouse.battery",
    policy: "renderer-consumes-descriptors-only",
    descriptorCount: Number(base.descriptorCount ?? (base.descriptors ?? []).length) + descriptors.length,
    lighthouseBatteryDescriptorCount: descriptors.length,
    descriptors: [...(base.descriptors ?? []), ...descriptors],
    sourceHandoffs: [...(base.sourceHandoffs ?? []), lighthouseBattery.rendererHandoff].filter(Boolean),
    counts: mergeCounts(base.counts, lighthouseBattery.rendererHandoff?.counts),
    ownership: {
      renderer: "consume-only",
      dom: "presentation-only-overlay",
      browserInput: "excluded",
      three: "excluded",
      webgl: "excluded",
      audio: "excluded",
      assets: "excluded",
      frameLoop: "presentation-only-overlay"
    }
  };
}

function descriptorPosition(descriptor = {}, level = {}) {
  const bounds = level.bounds ?? { minX: -18, maxX: 18, minZ: -8, maxZ: 48 };
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const depth = Math.max(1, bounds.maxZ - bounds.minZ);
  return {
    x: ((Number(descriptor.position?.x ?? 0) - bounds.minX) / width) * window.innerWidth,
    y: ((Number(descriptor.position?.z ?? 0) - bounds.minZ) / depth) * window.innerHeight
  };
}

function drawDescriptor(ctx, descriptor, level) {
  const point = descriptorPosition(descriptor, level);
  const opacity = Math.max(0.04, Math.min(0.42, Number(descriptor.opacity ?? 0.12)));
  const radius = Math.max(6, Number(descriptor.radius ?? descriptor.width ?? 1) * 8);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = descriptor.color ?? "#fff7c2";
  ctx.fillStyle = descriptor.color ?? "#fff7c2";
  ctx.lineWidth = Math.max(1, Number(descriptor.width ?? 1) * 2);
  if (descriptor.compatibleBucket === "routeThreads") {
    const yaw = Number(descriptor.yaw ?? 0);
    const length = Math.max(22, Number(descriptor.length ?? 8) * 7);
    ctx.beginPath();
    ctx.moveTo(point.x - Math.sin(yaw) * length * 0.5, point.y - Math.cos(yaw) * length * 0.5);
    ctx.lineTo(point.x + Math.sin(yaw) * length * 0.5, point.y + Math.cos(yaw) * length * 0.5);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "objectiveNeedles") {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - radius * 1.65);
    ctx.lineTo(point.x + radius * 0.7, point.y);
    ctx.lineTo(point.x, point.y + radius * 1.65);
    ctx.lineTo(point.x - radius * 0.7, point.y);
    ctx.closePath();
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "pressureVignettes") {
    ctx.setLineDash([3, 9]);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 1.42, 0, Math.PI * 2);
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
  if (!host || host.__foglineLighthouseBatteryReadinessInstalled) return false;
  const overlay = createOverlay();
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const getDomain = () => domainKit.describe(readInput(host));
  host.getLighthouseBatteryReadiness = getDomain;
  host.getFoglineLighthouseBatteryReadiness = getDomain;
  host.getLighthouseBatteryReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.() ?? {}, getDomain());
  host.__foglineLighthouseBatteryReadinessInstalled = true;
  document.body.dataset.foglineLighthouseBatteryReadiness = "ready";
  document.body.dataset.foglineLighthouseBatteryUpgrade = UPGRADE_ID;
  globalThis.FoglineLighthouseBatteryReadiness = { domainKit, getDomain, nexusEngineCdnLoaded, upgradeId: UPGRADE_ID };

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
