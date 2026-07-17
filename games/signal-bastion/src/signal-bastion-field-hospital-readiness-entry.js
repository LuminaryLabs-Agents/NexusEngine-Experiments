import { createSignalBastionFieldHospitalReadinessDomainKit } from "./signal-bastion-field-hospital-readiness-domain-kit.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const FIELD_HOSPITAL_CACHE_MARKER = "signal-bastion-field-hospital-readiness-1";
const VIEW = Object.freeze({ width: 960, height: 540, yCompression: 0.78 });

function getHost() {
  return globalThis.GameHost ?? null;
}

function colorWithAlpha(hex, alpha = 1) {
  if (!hex || !String(hex).startsWith("#")) return `rgba(255,255,255,${alpha})`;
  const value = hex.slice(1);
  const bigint = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
  return `rgba(${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255},${alpha})`;
}

function createOverlayCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "signalBastionFieldHospitalOverlay";
  canvas.dataset.cacheMarker = FIELD_HOSPITAL_CACHE_MARKER;
  canvas.setAttribute("aria-label", "Signal Bastion field hospital readiness descriptor overlay");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "3"
  });
  document.body.append(canvas);
  return canvas;
}

function createPanel() {
  const panel = document.createElement("section");
  panel.id = "signalBastionFieldHospitalPanel";
  panel.dataset.cacheMarker = FIELD_HOSPITAL_CACHE_MARKER;
  panel.setAttribute("aria-label", "Field hospital readiness status");
  Object.assign(panel.style, {
    position: "fixed",
    left: "18px",
    bottom: "134px",
    width: "min(318px, calc(100vw - 36px))",
    padding: "12px 14px",
    border: "1px solid rgba(139,211,255,.25)",
    borderRadius: "20px",
    background: "linear-gradient(180deg, rgba(5,13,21,.74), rgba(3,6,10,.56))",
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

function worldProject(point = {}) {
  const scale = Math.min(globalThis.innerWidth / VIEW.width, globalThis.innerHeight / (VIEW.height * VIEW.yCompression));
  const offsetX = (globalThis.innerWidth - VIEW.width * scale) * 0.5;
  const offsetY = (globalThis.innerHeight - VIEW.height * VIEW.yCompression * scale) * 0.5 + 24;
  return {
    x: offsetX + Number(point.x ?? 0) * scale,
    y: offsetY + Number(point.y ?? 0) * VIEW.yCompression * scale - Number(point.z ?? 0) * scale * 0.72,
    scale
  };
}

function drawLine(ctx, points, width, stroke, glow = 0) {
  if (!points?.length) return;
  const first = worldProject(points[0]);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, width * first.scale);
  ctx.strokeStyle = stroke;
  ctx.shadowBlur = glow;
  ctx.shadowColor = stroke;
  ctx.beginPath();
  points.forEach((point, index) => {
    const projected = worldProject(point);
    if (index === 0) ctx.moveTo(projected.x, projected.y);
    else ctx.lineTo(projected.x, projected.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawEllipse(ctx, center, radius, fill, stroke, glow = 0) {
  const projected = worldProject(center);
  ctx.save();
  ctx.shadowBlur = glow;
  ctx.shadowColor = stroke ?? fill;
  ctx.beginPath();
  ctx.ellipse(projected.x, projected.y, radius * projected.scale, radius * 0.52 * projected.scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = Math.max(1, 1.35 * projected.scale);
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDescriptor(ctx, descriptor) {
  if (descriptor.kind === "path-threat-gradient") {
    for (const segment of descriptor.segments ?? []) {
      drawLine(ctx, [segment.from, segment.to], Math.max(3, (segment.width ?? 8) * 0.2), colorWithAlpha(segment.color, 0.16 + (segment.pressure ?? 0) * 0.24), 13 + (segment.pressure ?? 0) * 18);
    }
  }
  if (descriptor.kind === "tower-synergy-cell-set") {
    for (const cell of descriptor.cells ?? []) {
      drawEllipse(ctx, cell.center, cell.radius ?? 40, colorWithAlpha(cell.color, 0.05 + (cell.synergy ?? 0) * 0.08), colorWithAlpha(cell.color, 0.24 + (cell.synergy ?? 0) * 0.22), 12 + (cell.synergy ?? 0) * 18);
    }
  }
  if (descriptor.kind === "economy-flow-ribbon-set") {
    for (const ribbon of descriptor.ribbons ?? []) {
      drawLine(ctx, [ribbon.from, ribbon.mid, ribbon.to], Math.max(2, (ribbon.width ?? 6) * 0.35), colorWithAlpha(ribbon.color, 0.18 + (ribbon.intensity ?? 0) * 0.25), 10);
    }
  }
  if (descriptor.kind === "enemy-intent-thread-set") {
    for (const thread of descriptor.threads ?? []) {
      drawLine(ctx, [thread.from, thread.mid, thread.to], Math.max(1.5, thread.width ?? 2), colorWithAlpha(thread.color, 0.18 + (thread.danger ?? 0) * 0.24), 8 + (thread.danger ?? 0) * 10);
    }
  }
  if (descriptor.kind === "wave-readiness-glyph") {
    for (const ring of descriptor.rings ?? []) {
      drawEllipse(ctx, ring.center, ring.radius ?? 42, colorWithAlpha(ring.color, 0.025 + (descriptor.urgency ?? 0) * 0.04), colorWithAlpha(ring.color, ring.opacity ?? 0.18), 8 + (descriptor.urgency ?? 0) * 18);
    }
  }
}

function renderPanel(panel, readiness) {
  const summary = readiness?.summary ?? {};
  panel.innerHTML = `
    <div style="color:#8bd3ff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px">Field Hospital</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#ffe36d;font-size:14px">${summary.triageQueues ?? 0}</span><small>triage</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#6bf0b8;font-size:14px">${summary.supplyCaches ?? 0}</span><small>supplies</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#f7a8ff;font-size:14px">${summary.stretcherThreads ?? 0}</span><small>relays</small></b>
    </div>
    <div style="margin-top:8px;color:rgba(236,251,255,.72)">${summary.missionState === "ward-ready" ? "Ward lanes are ready for casualty transfer." : summary.missionState === "ward-critical" ? "Ward overloaded. Protect the ambulance gate." : "Building triage capacity behind the towers."}</div>`;
}

function createReadinessInput(host) {
  const presentation = host.getPresentation?.() ?? {};
  return {
    presentation,
    rawSnapshot: presentation.rawSnapshot ?? host.getState?.() ?? {},
    activeBlueprint: host.input?.getActiveBlueprint?.() ?? "bolt",
    preset: host.preset ?? null,
    buildCatalog: host.preset?.level?.buildOrder ?? []
  };
}

function composeHandoff(baseHandoff, fieldHospital) {
  const baseDescriptors = baseHandoff?.descriptors ?? [];
  const fieldHospitalDescriptors = fieldHospital?.rendererHandoff?.descriptors ?? [];
  return {
    ...(baseHandoff ?? { id: "signal-bastion-renderer-handoff", kind: "renderer-handoff" }),
    id: "signal-bastion-composed-field-hospital-renderer-handoff",
    kind: "renderer-handoff",
    rendererNeutral: true,
    descriptors: [...baseDescriptors, ...fieldHospitalDescriptors],
    counts: {
      ...(baseHandoff?.counts ?? {}),
      descriptors: baseDescriptors.length + fieldHospitalDescriptors.length,
      fieldHospitalDescriptors: fieldHospitalDescriptors.length,
      triageLanternQueues: fieldHospital?.rendererHandoff?.counts?.triageLanternQueues ?? 0,
      medSupplyCaches: fieldHospital?.rendererHandoff?.counts?.medSupplyCaches ?? 0,
      stretcherRelayThreads: fieldHospital?.rendererHandoff?.counts?.stretcherRelayThreads ?? 0,
      healingWardGlyphs: fieldHospital?.rendererHandoff?.counts?.healingWardGlyphs ?? 0,
      ambulanceGateBands: fieldHospital?.rendererHandoff?.counts?.ambulanceGateBands ?? 0,
      casualtyLedgerBands: fieldHospital?.rendererHandoff?.counts?.casualtyLedgerBands ?? 0
    }
  };
}

export async function installSignalBastionFieldHospitalReadiness() {
  await import(NEXUS_URL);
  const kit = createSignalBastionFieldHospitalReadinessDomainKit();
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

  function readReadiness() {
    const host = getHost();
    if (!host) return null;
    return kit.describe(createReadinessInput(host));
  }

  function patchHost(host) {
    if (!host || host.__signalBastionFieldHospitalReadinessPatched) return;
    const baseGetRendererHandoff = host.getRendererHandoff?.bind(host);
    host.getFieldHospitalReadiness = readReadiness;
    host.getSignalBastionFieldHospitalReadiness = readReadiness;
    host.getFieldHospitalReadinessTree = () => kit.tree;
    host.getRendererHandoff = () => composeHandoff(baseGetRendererHandoff?.(), readReadiness());
    host.__signalBastionFieldHospitalReadinessPatched = true;
  }

  function frame() {
    const host = getHost();
    patchHost(host);
    if (!diagnosticsVisible()) {
      destroySurface();
      globalThis.setTimeout(frame, 500);
      return;
    }
    ensureSurface();
    const readiness = readReadiness();
    ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    if (readiness?.rendererHandoff?.descriptors) {
      for (const descriptor of readiness.rendererHandoff.descriptors) drawDescriptor(ctx, descriptor);
      renderPanel(panel, readiness);
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return { kit, get canvas() { return canvas; }, get panel() { return panel; }, cacheMarker: FIELD_HOSPITAL_CACHE_MARKER };
}

installSignalBastionFieldHospitalReadiness().catch((error) => {
  console.error("Could not install Signal Bastion field hospital readiness", error);
});
