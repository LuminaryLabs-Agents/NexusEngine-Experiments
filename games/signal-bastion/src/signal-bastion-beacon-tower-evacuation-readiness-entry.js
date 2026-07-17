import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalBastionBeaconTowerEvacuationReadinessDomainKit } from "./signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js";

const ENTRY_ID = "signal-bastion-beacon-tower-evacuation-readiness-entry";
const PASS_ID = "beacon-tower-evacuation-readiness-renderer-handoff-pass";
const PATCH_FLAG = Symbol.for("signal-bastion-beacon-tower-evacuation-readiness-installed");
const kit = createSignalBastionBeaconTowerEvacuationReadinessDomainKit();
void NexusEngine;

const VIEW = Object.freeze({ width: 960, height: 540, yCompression: 0.78 });

function color(hex, alpha = 1) {
  if (!hex || !String(hex).startsWith("#")) return `rgba(255,255,255,${alpha})`;
  const value = hex.slice(1);
  const bigint = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
  return `rgba(${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255},${alpha})`;
}

function project(point = {}) {
  const scale = Math.min(globalThis.innerWidth / VIEW.width, globalThis.innerHeight / (VIEW.height * VIEW.yCompression));
  const offsetX = (globalThis.innerWidth - VIEW.width * scale) * 0.5;
  const offsetY = (globalThis.innerHeight - VIEW.height * VIEW.yCompression * scale) * 0.5 + 24;
  return {
    x: offsetX + Number(point.x ?? 0) * scale,
    y: offsetY + Number(point.y ?? 0) * VIEW.yCompression * scale - Number(point.z ?? 0) * scale * 0.72,
    scale
  };
}

function line(ctx, points, width, stroke, glow = 0) {
  if (!points?.length) return;
  const first = project(points[0]);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, width * first.scale);
  ctx.strokeStyle = stroke;
  ctx.shadowBlur = glow;
  ctx.shadowColor = stroke;
  ctx.beginPath();
  points.forEach((item, index) => {
    const p = project(item);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.restore();
}

function ellipse(ctx, center, radius, fill, stroke, glow = 0) {
  const p = project(center);
  ctx.save();
  ctx.shadowBlur = glow;
  ctx.shadowColor = stroke ?? fill;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, radius * p.scale, radius * 0.52 * p.scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = Math.max(1, 1.2 * p.scale);
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function createOverlayCanvas() {
  let canvas = document.getElementById("signalBastionBeaconTowerEvacuationOverlay");
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "signalBastionBeaconTowerEvacuationOverlay";
  canvas.dataset.pass = PASS_ID;
  canvas.setAttribute("aria-label", "Signal Bastion beacon tower evacuation descriptor overlay");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "3",
    mixBlendMode: "screen"
  });
  document.body.append(canvas);
  return canvas;
}

function createPanel() {
  let panel = document.getElementById("signalBastionBeaconTowerEvacuationPanel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "signalBastionBeaconTowerEvacuationPanel";
  panel.dataset.pass = PASS_ID;
  panel.setAttribute("aria-label", "Beacon tower evacuation readiness status");
  Object.assign(panel.style, {
    position: "fixed",
    left: "18px",
    bottom: "230px",
    width: "min(320px, calc(100vw - 36px))",
    padding: "12px 14px",
    border: "1px solid rgba(139,211,255,.25)",
    borderRadius: "20px",
    background: "linear-gradient(180deg, rgba(5,13,21,.76), rgba(3,6,10,.58))",
    color: "#ecfbff",
    font: "700 11px/1.35 Inter, ui-sans-serif, system-ui, sans-serif",
    pointerEvents: "none",
    zIndex: "4",
    boxShadow: "0 18px 60px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08)",
    backdropFilter: "blur(12px)"
  });
  document.body.append(panel);
  return panel;
}

function resize(canvas, ctx) {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(globalThis.innerWidth * dpr);
  canvas.height = Math.floor(globalThis.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function inputFor(host, presentation = {}) {
  return {
    presentation,
    rawSnapshot: presentation.rawSnapshot ?? host.getState?.() ?? {},
    activeBlueprint: host.input?.getActiveBlueprint?.() ?? "bolt",
    preset: host.preset ?? null,
    buildCatalog: host.preset?.level?.buildOrder ?? []
  };
}

function composePresentation(host, presentation = {}) {
  const safe = presentation?.rawSnapshot ? presentation : { rawSnapshot: host?.getState?.() ?? {} };
  if (safe.domain?.signalBastionBeaconTowerEvacuationReadiness) return safe;
  const beaconTowerEvacuationReadiness = kit.describe(inputFor(host, safe));
  const previousHandoff = safe.commandFractal?.rendererHandoff ?? host?.getRendererHandoff?.() ?? { descriptors: [], counts: {} };
  const previousDescriptors = Array.isArray(previousHandoff.descriptors) ? previousHandoff.descriptors : [];
  const beaconDescriptors = beaconTowerEvacuationReadiness.rendererHandoff?.descriptors ?? [];
  const descriptors = [...previousDescriptors, ...beaconDescriptors];
  const rendererHandoff = {
    ...previousHandoff,
    id: "signal-bastion-composed-beacon-tower-evacuation-renderer-handoff",
    kind: "renderer-handoff",
    rendererNeutral: true,
    descriptors,
    counts: {
      ...(previousHandoff.counts ?? {}),
      descriptors: descriptors.length,
      beaconTowerEvacuationDescriptors: beaconDescriptors.length,
      prismLenses: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.prismLenses ?? 0,
      flareBursts: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.flareBursts ?? 0,
      stairLanes: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.stairLanes ?? 0,
      towerShadowWatches: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.towerShadowWatches ?? 0,
      safehouseTokens: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.safehouseTokens ?? 0,
      dawnLedgerOptions: beaconTowerEvacuationReadiness.rendererHandoff?.counts?.dawnLedgerOptions ?? 0
    }
  };
  return {
    ...safe,
    beaconTowerEvacuationReadiness,
    commandFractal: {
      ...(safe.commandFractal ?? {}),
      beaconTowerEvacuationReadiness,
      rendererHandoff
    },
    domain: {
      ...(safe.domain ?? {}),
      signalBastionBeaconTowerEvacuationReadiness: beaconTowerEvacuationReadiness
    }
  };
}

function drawDescriptor(ctx, descriptor) {
  if (descriptor.kind === "beacon-prism-lens-set") {
    for (const lens of descriptor.lenses ?? []) ellipse(ctx, lens.center, lens.radius ?? 44, color(lens.color, 0.045 + lens.alignment * 0.1), color(lens.color, 0.2 + lens.alignment * 0.32), 12 + lens.alignment * 18);
  }
  if (descriptor.kind === "signal-flare-burst-set") {
    for (const flare of descriptor.flares ?? []) ellipse(ctx, flare.center, flare.radius ?? 28, color(flare.color, 0.05 + flare.urgency * 0.08), color(flare.color, 0.28 + flare.urgency * 0.36), 16 + flare.urgency * 20);
  }
  if (descriptor.kind === "evacuation-stair-lane-set") {
    for (const lane of descriptor.lanes ?? []) line(ctx, [lane.from, lane.mid, lane.to], lane.width ?? 16, color(lane.color, 0.18 + lane.clearance * 0.24), 10 + lane.clearance * 12);
  }
  if (descriptor.kind === "tower-shadow-watch-set") {
    for (const shadow of descriptor.shadows ?? []) ellipse(ctx, shadow.center, shadow.radius ?? 58, color(shadow.color, 0.025 + shadow.watch * 0.04), color(shadow.color, 0.12 + shadow.watch * 0.24), 8 + shadow.watch * 12);
  }
  if (descriptor.kind === "safehouse-token-set") {
    for (const token of descriptor.tokens ?? []) ellipse(ctx, token.center, token.radius ?? 22, color(token.color, 0.06 + token.stocked * 0.1), color(token.color, 0.26 + token.stocked * 0.34), 10 + token.stocked * 16);
  }
}

function renderPanel(panel, readiness) {
  const summary = readiness?.summary ?? {};
  panel.innerHTML = `
    <div style="color:#8bd3ff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px">Beacon Evacuation</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#ffe36d;font-size:14px">${Math.round((summary.readiness ?? 0) * 100)}%</span><small>ready</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#6bf0b8;font-size:14px">${summary.totalNestedDescriptors ?? 0}</span><small>marks</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#ff7a5c;font-size:14px">${Math.round((summary.evacuationPressure ?? 0) * 100)}%</span><small>risk</small></b>
    </div>
    <div style="margin-top:8px;color:rgba(236,251,255,.72)">${summary.phase === "hold-beacon-evacuation" ? "Beacon route ready. Hold the stair lanes." : summary.phase === "shadow-breach-watch" ? "Tower shadows are hot. Keep flares burning." : summary.phase === "route-civilians-to-beacon" ? "Route civilians under the prism arc." : "Tune prism lenses before the next wave."}</div>`;
}

function install(host = globalThis.GameHost) {
  if (!host || host[PATCH_FLAG]) return Boolean(host?.[PATCH_FLAG]);
  const originalGetPresentation = typeof host.getPresentation === "function" ? host.getPresentation.bind(host) : () => ({ rawSnapshot: host.getState?.() ?? {} });
  const originalGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({ descriptors: [], counts: {} });
  const originalDraw = host.renderer?.draw?.bind(host.renderer);

  Object.defineProperty(host, PATCH_FLAG, { value: true, enumerable: false });
  host.getBeaconTowerEvacuationReadiness = () => composePresentation(host, originalGetPresentation()).beaconTowerEvacuationReadiness;
  host.getSignalBastionBeaconTowerEvacuationReadiness = host.getBeaconTowerEvacuationReadiness;
  host.getBeaconTowerEvacuationReadinessTree = () => kit.tree;
  host.getRendererHandoff = () => composePresentation(host, {
    rawSnapshot: host.getState?.() ?? {},
    commandFractal: { rendererHandoff: originalGetRendererHandoff() }
  }).commandFractal.rendererHandoff;
  host.getPresentation = () => composePresentation(host, originalGetPresentation());
  host.NexusEngineBeaconTowerEvacuationRuntime = {
    entryId: ENTRY_ID,
    nexusEngineLoaded: Boolean(NexusEngine),
    domainTree: kit.tree
  };

  if (originalDraw) {
    host.renderer.draw = (presentation, activeBlueprint) => originalDraw(
      host.getDiagnosticsVisible?.() ? composePresentation(host, presentation) : presentation,
      activeBlueprint
    );
  }
  return true;
}

function bootOverlay() {
  let canvas = null;
  let panel = null;
  let ctx = null;

  function diagnosticsVisible() {
    return document.documentElement.dataset.signalDiagnostics === "true";
  }

  function ensureSurface() {
    if (canvas && panel && ctx) return;
    canvas = createOverlayCanvas();
    panel = createPanel();
    ctx = canvas.getContext("2d");
    resize(canvas, ctx);
  }

  function destroySurface() {
    canvas?.remove();
    panel?.remove();
    canvas = null;
    panel = null;
    ctx = null;
  }

  addEventListener("signal-bastion-diagnostics-change", (event) => {
    if (event.detail?.visible !== true) destroySurface();
  });

  addEventListener("resize", () => { if (canvas && ctx) resize(canvas, ctx); });
  function frame() {
    const host = globalThis.GameHost;
    install(host);
    if (!diagnosticsVisible()) {
      destroySurface();
      globalThis.setTimeout(frame, 500);
      return;
    }
    ensureSurface();
    ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    const readiness = host?.getBeaconTowerEvacuationReadiness?.();
    for (const descriptor of readiness?.rendererHandoff?.descriptors ?? []) drawDescriptor(ctx, descriptor);
    if (readiness) renderPanel(panel, readiness);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (!install()) {
  let attempts = 0;
  const installTimer = globalThis.setInterval(() => {
    attempts += 1;
    if (install() || attempts > 120) globalThis.clearInterval(installTimer);
  }, 50);
}

bootOverlay();

export { ENTRY_ID, PASS_ID, composePresentation, install as installBeaconTowerEvacuationReadiness };
