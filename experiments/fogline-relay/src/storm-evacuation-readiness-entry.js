import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createFoglineStormEvacuationReadinessDomainKit } from "./fogline-storm-evacuation-kits.js";

const UPGRADE_ID = "storm-evacuation-readiness-renderer-handoff-pass";
const domainKit = createFoglineStormEvacuationReadinessDomainKit();
const nexusEngineCdnLoaded = Boolean(NexusEngine);

function createOverlay() {
  let overlay = document.querySelector("[data-fogline-storm-evacuation-overlay]");
  if (overlay) return overlay;
  overlay = document.createElement("canvas");
  overlay.dataset.foglineStormEvacuationOverlay = "true";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "3",
    mixBlendMode: "screen"
  });
  document.body.append(overlay);
  return overlay;
}

function readInput(host) {
  const snapshot = host?.getState?.() ?? host?.session?.snapshot?.() ?? {};
  const level = snapshot.level ?? host?.session?.level ?? {};
  const game = snapshot.game ?? {};
  return { level, route: level.route ?? [], game };
}

function mergeCounts(...sources) {
  return sources.reduce((merged, source) => {
    for (const [key, value] of Object.entries(source ?? {})) {
      merged[key] = (merged[key] ?? 0) + Number(value ?? 0);
    }
    return merged;
  }, {});
}

function composeRendererHandoff(base = {}, stormEvacuation = {}) {
  const evacuationDescriptors = stormEvacuation.drawOrder ?? [];
  return {
    ...base,
    id: "fogline-storm-evacuation-composed-renderer-handoff",
    archetype: "fogline.composed.renderer.handoff.storm.evacuation",
    policy: "renderer-consumes-descriptors-only",
    descriptorCount: Number(base.descriptorCount ?? (base.descriptors ?? []).length) + evacuationDescriptors.length,
    stormEvacuationDescriptorCount: evacuationDescriptors.length,
    descriptors: [...(base.descriptors ?? []), ...evacuationDescriptors],
    sourceHandoffs: [...(base.sourceHandoffs ?? []), stormEvacuation.rendererHandoff].filter(Boolean),
    counts: mergeCounts(base.counts, stormEvacuation.rendererHandoff?.counts),
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
  const x = ((Number(descriptor.position?.x ?? 0) - bounds.minX) / width) * window.innerWidth;
  const y = ((Number(descriptor.position?.z ?? 0) - bounds.minZ) / depth) * window.innerHeight;
  return { x, y };
}

function drawDescriptor(ctx, descriptor, level) {
  const point = descriptorPosition(descriptor, level);
  const opacity = Math.max(0.025, Math.min(0.34, Number(descriptor.opacity ?? 0.08)));
  const radius = Math.max(6, Number(descriptor.radius ?? descriptor.width ?? 1) * 8);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = descriptor.color ?? "#bafcff";
  ctx.fillStyle = descriptor.color ?? "#bafcff";
  ctx.lineWidth = Math.max(1, Number(descriptor.width ?? 1) * 2.3);

  if (descriptor.compatibleBucket === "routeThreads") {
    const yaw = Number(descriptor.yaw ?? 0);
    const length = Math.max(18, Number(descriptor.length ?? 8) * 6);
    ctx.beginPath();
    ctx.moveTo(point.x - Math.sin(yaw) * length * 0.5, point.y - Math.cos(yaw) * length * 0.5);
    ctx.lineTo(point.x + Math.sin(yaw) * length * 0.5, point.y + Math.cos(yaw) * length * 0.5);
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "objectiveNeedles") {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - radius * 1.45);
    ctx.lineTo(point.x + radius * 0.58, point.y + radius * 0.42);
    ctx.lineTo(point.x - radius * 0.58, point.y + radius * 0.42);
    ctx.closePath();
    ctx.stroke();
  } else if (descriptor.compatibleBucket === "pressureVignettes") {
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 1.3, 0, Math.PI * 2);
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
  if (!host || host.__foglineStormEvacuationReadinessInstalled) return false;
  const overlay = createOverlay();
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const getDomain = () => domainKit.describe(readInput(host));
  host.getStormEvacuationReadiness = getDomain;
  host.getFoglineStormEvacuationReadiness = getDomain;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.() ?? {}, getDomain());
  host.__foglineStormEvacuationReadinessInstalled = true;
  document.body.dataset.foglineStormEvacuationReadiness = "ready";
  document.body.dataset.foglineStormEvacuationUpgrade = UPGRADE_ID;
  globalThis.FoglineStormEvacuationReadiness = { domainKit, getDomain, nexusEngineCdnLoaded, upgradeId: UPGRADE_ID };

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
