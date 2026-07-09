import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createMeadowSkylarkNestRescueReadinessDomainKit } from "./meadow-skylark-nest-rescue-readiness-kits.js";

const PASS_ID = "skylark-nest-rescue-readiness-renderer-handoff-pass";
const domainKit = createMeadowSkylarkNestRescueReadinessDomainKit();
void NexusEngine;

function snapshot() {
  const base = globalThis.GameHost?.getState?.() ?? {};
  return {
    ...base,
    seed: base.seed ?? base.build ?? "high-fidelity-meadow",
    meadowRadius: 92,
    hour: 5.4
  };
}

function describe() {
  return domainKit.describe(snapshot());
}

function makeOverlay() {
  let canvas = document.getElementById("meadow-skylark-nest-rescue-overlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "meadow-skylark-nest-rescue-overlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "4",
    mixBlendMode: "screen"
  });
  document.body.appendChild(canvas);
  return canvas;
}

function makePanel() {
  let panel = document.getElementById("meadow-skylark-nest-rescue-panel");
  if (panel) return panel;
  panel = document.createElement("aside");
  panel.id = "meadow-skylark-nest-rescue-panel";
  panel.dataset.pass = PASS_ID;
  panel.setAttribute("aria-label", "Skylark nest rescue readiness");
  Object.assign(panel.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    zIndex: "6",
    maxWidth: "min(360px, calc(100vw - 36px))",
    padding: "10px 12px",
    borderRadius: "16px",
    color: "#fff9df",
    background: "linear-gradient(180deg, rgba(21,34,16,.84), rgba(7,15,8,.72))",
    boxShadow: "0 18px 50px rgba(0,0,0,.42), inset 0 0 0 1px rgba(255,255,255,.18)",
    font: "750 12px Inter, ui-sans-serif, system-ui, sans-serif",
    pointerEvents: "none",
    backdropFilter: "blur(12px) saturate(1.15)"
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
    y: globalThis.innerHeight * 0.56 + (Number(position.z) || 0) * scale * 0.62
  };
}

function drawOverlay(canvas, panel) {
  const readiness = describe();
  const ctx = resize(canvas);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  ctx.save();
  ctx.strokeStyle = "rgba(255,239,158,.8)";
  ctx.fillStyle = "rgba(255,249,214,.92)";
  ctx.font = "800 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  for (const descriptor of readiness.rendererHandoff.descriptors ?? []) {
    const p = meadowToScreen(descriptor.position);
    if (descriptor.kind === "meadow-skylark-nest-cup") {
      ctx.globalAlpha = 0.22 + Math.min(1, descriptor.cover ?? 0) * 0.48;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 9, 5, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("nest", p.x + 12, p.y);
    }
    if (descriptor.kind === "meadow-dew-path-bead") {
      ctx.globalAlpha = 0.16 + Math.min(1, descriptor.clarity ?? 0) * 0.42;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4 + (descriptor.beadRadius ?? 0.16) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (descriptor.kind === "meadow-fox-scent-ribbon") {
      ctx.globalAlpha = 0.16 + Math.min(1, descriptor.risk ?? 0) * 0.4;
      ctx.strokeStyle = "rgba(255,148,112,.78)";
      ctx.beginPath();
      ctx.moveTo(p.x - 16, p.y - 5);
      ctx.bezierCurveTo(p.x - 2, p.y - 16, p.x + 12, p.y + 11, p.x + 26, p.y - 3);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,239,158,.8)";
    }
    if (descriptor.kind === "meadow-shepherd-bell-post") {
      ctx.globalAlpha = 0.2 + Math.min(1, descriptor.coverage ?? 0) * 0.46;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 14);
      ctx.lineTo(p.x, p.y - 12);
      ctx.moveTo(p.x - 7, p.y - 8);
      ctx.lineTo(p.x + 7, p.y - 8);
      ctx.stroke();
    }
    if (descriptor.kind === "meadow-fledgling-seed-cache") {
      ctx.globalAlpha = 0.18 + Math.min(1, descriptor.supply ?? 0) * 0.48;
      ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
      ctx.fillText("seed", p.x + 9, p.y);
    }
  }

  ctx.restore();
  const summary = readiness.summary ?? {};
  panel.textContent = `skylark nest rescue · ${summary.phase ?? "find-ground-nests"} · ready ${Math.round((summary.readiness ?? 0) * 100)}% · nests ${summary.protectedNests ?? 0}`;
  globalThis.requestAnimationFrame(() => drawOverlay(canvas, panel));
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host?.getState) return false;
  if (host.__meadowSkylarkNestRescuePatched) return true;
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getSkylarkNestRescueReadiness = describe;
  host.getMeadowSkylarkNestRescueReadiness = describe;
  host.getSkylarkNestRescueReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const base = originalGetRendererHandoff?.() ?? {
      id: "high-fidelity-meadow-renderer-handoff",
      kind: "renderer-handoff",
      descriptors: [],
      descriptorCount: 0,
      handoffCount: 0
    };
    const skylark = describe().rendererHandoff;
    const descriptors = [
      ...(Array.isArray(base.descriptors) ? base.descriptors : []),
      ...(Array.isArray(skylark.descriptors) ? skylark.descriptors : [])
    ];
    return {
      ...base,
      id: "high-fidelity-meadow-composed-renderer-handoff-with-skylark-nest-rescue",
      descriptorCount: descriptors.length,
      handoffCount: (base.handoffCount ?? 0) + 1,
      descriptors,
      skylarkNestRescueReadiness: skylark,
      rendererContract: "renderer consumes descriptors only; reusable skylark nest rescue readiness remains outside renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, network, physics, and frame-loop ownership"
    };
  };
  host.__meadowSkylarkNestRescuePatched = true;
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
