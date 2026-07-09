import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createNextLedgeSummitWeatherStationReadinessDomainKit } from "./summit-weather-station-readiness-kits.js";

const PASS_ID = "next-ledge-summit-weather-station-readiness-renderer-handoff-pass";
const domainKit = createNextLedgeSummitWeatherStationReadinessDomainKit();
void NexusEngine;

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}
function getSnapshot() {
  return globalThis.GameHost?.getState?.() ?? globalThis.GameHost?.session?.snapshot?.() ?? null;
}
function describe() {
  return domainKit.describe(getSnapshot() ?? {});
}
function makeOverlay() {
  let canvas = document.getElementById("next-ledge-summit-weather-station-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "next-ledge-summit-weather-station-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "14", mixBlendMode: "screen" });
  document.body.appendChild(canvas);
  return canvas;
}
function resizeCanvas(canvas) {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(globalThis.innerWidth * dpr));
  const height = Math.max(1, Math.floor(globalThis.innerHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
function worldToScreen(point, snapshot) {
  const camera = snapshot?.camera ?? {};
  const scale = Math.max(0.18, Math.min(0.44, 260 / Math.max(180, Number(camera.z) || 260)));
  return {
    x: globalThis.innerWidth * 0.5 + ((Number(point?.x) || 0) - (Number(camera.x) || 0)) * scale,
    y: globalThis.innerHeight * 0.5 - ((Number(point?.y) || 0) - (Number(camera.y) || 0)) * scale
  };
}
function drawLine(ctx, a, b, alpha = 0.4, width = 1) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function drawOverlay(canvas) {
  const snapshot = getSnapshot();
  const readiness = describe();
  const ctx = resizeCanvas(canvas);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  if (!snapshot || !readiness?.rendererHandoff) {
    globalThis.requestAnimationFrame(() => drawOverlay(canvas));
    return;
  }
  ctx.save();
  ctx.font = "650 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(188,237,255,0.6)";
  ctx.fillStyle = "rgba(229,248,255,0.88)";
  for (const descriptor of readiness.rendererHandoff.descriptors ?? []) {
    if (descriptor.kind === "next-ledge-anemometer-mast") {
      const p = worldToScreen(descriptor.position, snapshot);
      const h = 12 + clamp(descriptor.stability) * 10;
      ctx.globalAlpha = 0.28 + clamp(descriptor.stability) * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 10);
      ctx.lineTo(p.x, p.y - h);
      ctx.moveTo(p.x - 7, p.y - h + 4);
      ctx.lineTo(p.x + 7, p.y - h + 4);
      ctx.stroke();
      ctx.fillText("mast", p.x + 9, p.y - h + 2);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-solar-battery-cache") {
      const p = worldToScreen(descriptor.position, snapshot);
      const panels = Math.min(8, descriptor.panelCount ?? 3);
      ctx.globalAlpha = 0.25 + clamp(descriptor.charge) * 0.55;
      for (let index = 0; index < panels; index += 1) ctx.strokeRect(p.x + index * 4 - panels * 2, p.y - 3, 3, 8);
      ctx.fillText("battery", p.x + 12, p.y + 2);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-barometer-stake") {
      const p = worldToScreen(descriptor.position, snapshot);
      ctx.globalAlpha = 0.22 + clamp(descriptor.pressureReading) * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 9);
      ctx.lineTo(p.x, p.y - 9);
      ctx.stroke();
      for (let index = 0; index < Math.min(9, descriptor.tickMarks ?? 4); index += 1) ctx.fillRect(p.x + 2, p.y + 6 - index * 3, 5, 1);
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-wind-corridor-ribbon") {
      const a = worldToScreen(descriptor.start, snapshot);
      const b = worldToScreen(descriptor.end, snapshot);
      drawLine(ctx, a, b, 0.14 + (1 - clamp(descriptor.gustRisk)) * 0.42, 1.4);
      for (let index = 0; index < Math.min(7, descriptor.ribbonCount ?? 3); index += 1) {
        const t = (index + 1) / (Math.min(7, descriptor.ribbonCount ?? 3) + 1);
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.globalAlpha = 0.18 + clamp(descriptor.gustRisk) * 0.34;
        ctx.beginPath();
        ctx.arc(x, y, 2.2 + clamp(descriptor.gustRisk) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (descriptor.kind === "next-ledge-radio-repeater") {
      const p = worldToScreen(descriptor.position, snapshot);
      const r = 7 + clamp(descriptor.signal) * 17;
      ctx.globalAlpha = 0.22 + clamp(descriptor.signal) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.55, 0.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      ctx.fillText("radio", p.x + r + 4, p.y);
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 0.86;
  ctx.fillText(`summit weather station · ${readiness.summary?.phase ?? "haul-weather-kit"}`, 18, globalThis.innerHeight - 64);
  ctx.restore();
  globalThis.requestAnimationFrame(() => drawOverlay(canvas));
}
function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState || host.__nextLedgeSummitWeatherStationPatched) return Boolean(host?.__nextLedgeSummitWeatherStationPatched);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getSummitWeatherStationReadiness = describe;
  host.getNextLedgeSummitWeatherStationReadiness = describe;
  host.getSummitWeatherStationReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? { id: "next-ledge-composed-renderer-handoff", kind: "renderer-handoff", descriptors: [], descriptorCount: 0, handoffCount: 0 };
    const summitWeather = describe().rendererHandoff;
    const descriptors = [ ...(Array.isArray(base.descriptors) ? base.descriptors : []), ...(summitWeather.descriptors ?? []) ];
    return { ...base, id: "next-ledge-composed-renderer-handoff-with-summit-weather-station", descriptorCount: descriptors.length, handoffCount: (base.handoffCount ?? 0) + 1, descriptors, summitWeatherStationReadiness: summitWeather, rendererContract: "renderer consumes descriptors only; reusable summit weather station readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership" };
  };
  host.__nextLedgeSummitWeatherStationPatched = true;
  return true;
}
function boot() {
  const canvas = makeOverlay();
  const attempt = () => {
    if (patchGameHost()) return drawOverlay(canvas);
    globalThis.requestAnimationFrame(attempt);
  };
  attempt();
}
boot();
