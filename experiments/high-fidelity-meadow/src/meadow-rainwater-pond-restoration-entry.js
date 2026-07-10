import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createMeadowRainwaterPondRestorationReadinessDomainKit } from "./meadow-rainwater-pond-restoration-readiness-kits.js";

const PASS_ID = "rainwater-pond-restoration-readiness-renderer-handoff-pass";
const domainKit = createMeadowRainwaterPondRestorationReadinessDomainKit();
void NexusEngine;

function snapshot() {
  const base = globalThis.GameHost?.getState?.() ?? {};
  return {
    ...base,
    seed: base.seed ?? base.build ?? "high-fidelity-meadow",
    meadowRadius: 96,
    rainfall: base.rainfall ?? 0.46
  };
}

function describe() {
  return domainKit.describe(snapshot());
}

function makeOverlay() {
  let canvas = document.getElementById("meadow-rainwater-pond-restoration-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "meadow-rainwater-pond-restoration-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "5",
    mixBlendMode: "screen"
  });
  document.body.appendChild(canvas);
  return canvas;
}

function makePanel() {
  let panel = document.getElementById("meadow-rainwater-pond-restoration-panel");
  if (panel) return panel;
  panel = document.createElement("aside");
  panel.id = "meadow-rainwater-pond-restoration-panel";
  panel.dataset.pass = PASS_ID;
  panel.setAttribute("aria-label", "Rainwater pond restoration readiness");
  Object.assign(panel.style, {
    position: "fixed",
    right: "18px",
    bottom: "82px",
    zIndex: "7",
    maxWidth: "min(380px, calc(100vw - 36px))",
    padding: "10px 12px",
    borderRadius: "16px",
    color: "#e8fff5",
    background: "linear-gradient(180deg, rgba(8,34,34,.84), rgba(4,12,10,.76))",
    boxShadow: "0 18px 50px rgba(0,0,0,.42), inset 0 0 0 1px rgba(205,255,235,.2)",
    font: "750 12px Inter, ui-sans-serif, system-ui, sans-serif",
    pointerEvents: "none",
    backdropFilter: "blur(12px) saturate(1.12)"
  });
  document.body.appendChild(panel);
  return panel;
}

function resize(canvas) {
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

function meadowToScreen(position = {}) {
  const scale = Math.min(globalThis.innerWidth, globalThis.innerHeight) / 235;
  return {
    x: globalThis.innerWidth * 0.5 + (Number(position.x) || 0) * scale,
    y: globalThis.innerHeight * 0.57 + (Number(position.z) || 0) * scale * 0.62
  };
}

function drawOverlay(canvas, panel) {
  const readiness = describe();
  const ctx = resize(canvas);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  ctx.save();
  ctx.lineWidth = 1.3;
  ctx.font = "800 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  for (const descriptor of readiness.rendererHandoff.descriptors ?? []) {
    const p = meadowToScreen(descriptor.position);
    if (descriptor.kind === "meadow-rain-chain-basin") {
      ctx.globalAlpha = 0.16 + Math.min(1, descriptor.fill ?? 0) * 0.42;
      ctx.strokeStyle = "rgba(155,224,255,.82)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5 + (descriptor.fill ?? 0) * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(180,238,255,.82)";
      ctx.fillText("rain", p.x + 12, p.y);
    }
    if (descriptor.kind === "meadow-pond-mirror-pool") {
      ctx.globalAlpha = 0.18 + Math.min(1, descriptor.clarity ?? 0) * 0.44;
      ctx.strokeStyle = "rgba(181,255,222,.82)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 13 + (descriptor.mirrorRadius ?? 3), 6 + (descriptor.mirrorRadius ?? 3) * 0.35, -0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (descriptor.kind === "meadow-frog-call-stone") {
      ctx.globalAlpha = 0.2 + Math.min(1, descriptor.callStrength ?? 0) * 0.42;
      ctx.strokeStyle = "rgba(180,255,147,.82)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8 + (descriptor.echoPips ?? 1), 0, Math.PI * 2);
      ctx.stroke();
    }
    if (descriptor.kind === "meadow-reed-filter-bed") {
      ctx.globalAlpha = 0.18 + Math.min(1, descriptor.filtration ?? 0) * 0.4;
      ctx.strokeStyle = "rgba(124,255,188,.82)";
      for (let index = 0; index < 5; index += 1) {
        ctx.beginPath();
        ctx.moveTo(p.x - 8 + index * 4, p.y + 10);
        ctx.quadraticCurveTo(p.x - 10 + index * 4, p.y - 6, p.x - 4 + index * 4, p.y - 14);
        ctx.stroke();
      }
    }
    if (descriptor.kind === "meadow-stepping-log-route") {
      ctx.globalAlpha = 0.2 + Math.min(1, descriptor.stability ?? 0) * 0.42;
      ctx.strokeStyle = "rgba(255,232,171,.82)";
      ctx.beginPath();
      ctx.moveTo(p.x - 12, p.y);
      ctx.lineTo(p.x + 12, p.y - 4);
      ctx.stroke();
    }
  }

  ctx.restore();
  const summary = readiness.summary ?? {};
  panel.textContent = `rainwater pond · ${summary.phase ?? "catch-first-rain"} · ready ${Math.round((summary.readiness ?? 0) * 100)}% · clear pools ${summary.clearPools ?? 0}`;
  globalThis.requestAnimationFrame(() => drawOverlay(canvas, panel));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState) return false;
  if (host.__meadowRainwaterPondRestorationPatched) return true;
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getRainwaterPondRestorationReadiness = describe;
  host.getMeadowRainwaterPondRestorationReadiness = describe;
  host.getRainwaterPondRestorationReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? {
      id: "high-fidelity-meadow-renderer-handoff",
      kind: "renderer-handoff",
      descriptors: [],
      descriptorCount: 0,
      handoffCount: 0
    };
    const pond = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(pond.descriptors) ? pond.descriptors : [])
    ];
    return {
      ...base,
      id: "high-fidelity-meadow-composed-renderer-handoff-with-rainwater-pond-restoration",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      rainwaterPondRestorationReadiness: pond,
      rendererContract: "renderer consumes descriptors only; reusable rainwater pond restoration readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, and frame-loop ownership"
    };
  };
  host.__meadowRainwaterPondRestorationPatched = true;
  return true;
}

function boot() {
  const overlay = makeOverlay();
  const panel = makePanel();
  const attempt = () => {
    if (patchGameHost()) return drawOverlay(overlay, panel);
    globalThis.requestAnimationFrame(attempt);
    return null;
  };
  attempt();
}

boot();
