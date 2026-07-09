import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createFoglineSearchDogRescueReadinessDomainKit } from "./fogline-search-dog-rescue-readiness-kits.js";

const UPGRADE_ID = "search-dog-rescue-readiness-renderer-handoff-pass";
const domainKit = createFoglineSearchDogRescueReadinessDomainKit();
const nexusEngineCdnLoaded = Boolean(NexusEngine);

function createOverlay() {
  let overlay = document.querySelector("[data-fogline-search-dog-rescue-overlay]");
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.dataset.foglineSearchDogRescueOverlay = "true";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "10",
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
    for (const [key, value] of Object.entries(source ?? {})) merged[key] = (merged[key] ?? 0) + Number(value ?? 0);
    return merged;
  }, {});
}

function composeRendererHandoff(base = {}, searchDog = {}) {
  const descriptors = searchDog.drawOrder ?? [];
  return {
    ...base,
    id: "fogline-search-dog-rescue-composed-renderer-handoff",
    archetype: "fogline.composed.renderer.handoff.search.dog.rescue",
    policy: "renderer-consumes-descriptors-only",
    descriptorCount: Number(base.descriptorCount ?? (base.descriptors ?? []).length) + descriptors.length,
    searchDogRescueDescriptorCount: descriptors.length,
    descriptors: [...(base.descriptors ?? []), ...descriptors],
    sourceHandoffs: [...(base.sourceHandoffs ?? []), searchDog.rendererHandoff].filter(Boolean),
    counts: mergeCounts(base.counts, searchDog.rendererHandoff?.counts),
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
  const opacity = Math.max(0.05, Math.min(0.58, Number(descriptor.opacity ?? 0.16)));
  const radius = Math.max(7, Number(descriptor.radius ?? descriptor.width ?? 1) * 8);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = descriptor.color ?? "#fff0a8";
  ctx.fillStyle = descriptor.color ?? "#fff0a8";
  ctx.lineWidth = Math.max(1, Number(descriptor.width ?? 1) * 2);
  if (descriptor.compatibleBucket === "routeThreads") {
    const yaw = Number(descriptor.yaw ?? 0);
    const length = Math.max(28, Number(descriptor.length ?? 5) * 7);
    ctx.setLineDash([10, 7, 2, 7]);
    ctx.beginPath();
    ctx.moveTo(point.x - Math.sin(yaw) * length * 0.5, point.y - Math.cos(yaw) * length * 0.5);
    ctx.lineTo(point.x + Math.sin(yaw) * length * 0.5, point.y + Math.cos(yaw) * length * 0.5);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "groundGlyphs") {
    ctx.translate(point.x, point.y);
    ctx.rotate(Number(descriptor.heading ?? 0));
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(i * radius * 0.55 - radius * 0.5, -radius * 0.25, radius * 0.16, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.18, radius * 0.5, radius * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "supplyCaches") {
    ctx.strokeRect(point.x - radius * 1.2, point.y - radius * 0.62, radius * 2.4, radius * 1.24);
    ctx.beginPath();
    ctx.moveTo(point.x - radius * 0.7, point.y);
    ctx.lineTo(point.x + radius * 0.7, point.y);
    ctx.moveTo(point.x, point.y - radius * 0.45);
    ctx.lineTo(point.x, point.y + radius * 0.45);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "signalBeacons") {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 1.28, 0.2, Math.PI * 1.4);
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
  for (const descriptor of getDomain().drawOrder ?? []) drawDescriptor(ctx, descriptor, input.level);
}

function install(host) {
  if (!host || host.__foglineSearchDogRescueReadinessInstalled) return false;
  const overlay = createOverlay();
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const getDomain = () => domainKit.describe(readInput(host));
  host.getSearchDogRescueReadiness = getDomain;
  host.getFoglineSearchDogRescueReadiness = getDomain;
  host.getSearchDogRescueReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.() ?? {}, getDomain());
  host.__foglineSearchDogRescueReadinessInstalled = true;
  document.body.dataset.foglineSearchDogRescueReadiness = "ready";
  document.body.dataset.foglineSearchDogRescueUpgrade = UPGRADE_ID;
  globalThis.FoglineSearchDogRescueReadiness = { domainKit, getDomain, nexusEngineCdnLoaded, upgradeId: UPGRADE_ID };

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
