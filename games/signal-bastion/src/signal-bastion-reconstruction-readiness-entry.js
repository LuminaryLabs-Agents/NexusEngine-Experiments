import { createSignalBastionReconstructionReadinessDomainKit } from "./signal-bastion-reconstruction-readiness-domain-kit.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const RECONSTRUCTION_CACHE_MARKER = "signal-bastion-reconstruction-readiness-1";
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
  canvas.id = "signalBastionReconstructionOverlay";
  canvas.dataset.cacheMarker = RECONSTRUCTION_CACHE_MARKER;
  canvas.setAttribute("aria-label", "Signal Bastion reconstruction readiness descriptor overlay");
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
  panel.id = "signalBastionReconstructionPanel";
  panel.dataset.cacheMarker = RECONSTRUCTION_CACHE_MARKER;
  panel.setAttribute("aria-label", "Reconstruction readiness status");
  Object.assign(panel.style, {
    position: "fixed",
    left: "18px",
    bottom: "18px",
    width: "min(300px, calc(100vw - 36px))",
    padding: "12px 14px",
    border: "1px solid rgba(255,227,109,.25)",
    borderRadius: "20px",
    background: "linear-gradient(180deg, rgba(5,13,21,.72), rgba(3,6,10,.54))",
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
    ctx.lineWidth = Math.max(1, 1.4 * projected.scale);
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDescriptor(ctx, descriptor) {
  if (descriptor.kind === "path-threat-gradient") {
    for (const segment of descriptor.segments ?? []) {
      drawLine(ctx, [segment.from, segment.mid, segment.to], Math.max(3, (segment.width ?? 8) * 0.22), colorWithAlpha(segment.color, 0.2 + (segment.pressure ?? 0) * 0.24), 14 + (segment.pressure ?? 0) * 18);
    }
  }
  if (descriptor.kind === "tower-synergy-cell-set") {
    for (const cell of descriptor.cells ?? []) {
      drawEllipse(ctx, cell.center, cell.radius ?? 40, colorWithAlpha(cell.color, 0.055 + (cell.synergy ?? 0) * 0.08), colorWithAlpha(cell.color, 0.28 + (cell.synergy ?? 0) * 0.24), 12 + (cell.synergy ?? 0) * 18);
    }
  }
  if (descriptor.kind === "economy-flow-ribbon-set") {
    for (const ribbon of descriptor.ribbons ?? []) {
      drawLine(ctx, [ribbon.from, ribbon.mid, ribbon.to], Math.max(2, (ribbon.width ?? 6) * 0.34), colorWithAlpha(ribbon.color, 0.22 + (ribbon.intensity ?? 0) * 0.22), 10);
    }
  }
  if (descriptor.kind === "enemy-intent-thread-set") {
    for (const thread of descriptor.threads ?? []) {
      drawLine(ctx, [thread.from, thread.mid, thread.to], Math.max(1.5, thread.width ?? 2), colorWithAlpha(thread.color, 0.2 + (thread.danger ?? 0) * 0.22), 8 + (thread.danger ?? 0) * 10);
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
    <div style="color:#ffe36d;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px">Reconstruction Readiness</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#ffb86b;font-size:14px">${summary.wallBreachSeals ?? 0}</span><small>seals</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#ffe36d;font-size:14px">${summary.towerFoundationRepairs ?? 0}</span><small>repairs</small></b>
      <b style="background:rgba(255,255,255,.06);border-radius:12px;padding:7px;text-align:center"><span style="display:block;color:#6bf0b8;font-size:14px">${summary.memorialBeaconRings ?? 0}</span><small>beacon</small></b>
    </div>
    <div style="margin-top:8px;color:rgba(236,251,255,.72)">${summary.reconstructionReady ? "Supply crews can rebuild behind the line." : "Hold the line until crews can safely enter."}</div>`;
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

function composeHandoff(baseHandoff, reconstruction) {
  const baseDescriptors = baseHandoff?.descriptors ?? [];
  const reconstructionDescriptors = reconstruction?.rendererHandoff?.descriptors ?? [];
  return {
    ...(baseHandoff ?? { id: "signal-bastion-renderer-handoff", kind: "renderer-handoff" }),
    id: "signal-bastion-composed-reconstruction-renderer-handoff",
    kind: "renderer-handoff",
    rendererNeutral: true,
    descriptors: [...baseDescriptors, ...reconstructionDescriptors],
    counts: {
      ...(baseHandoff?.counts ?? {}),
      descriptors: baseDescriptors.length + reconstructionDescriptors.length,
      reconstructionDescriptors: reconstructionDescriptors.length,
      wallBreachSeals: reconstruction?.rendererHandoff?.counts?.wallBreachSeals ?? 0,
      towerFoundationRepairs: reconstruction?.rendererHandoff?.counts?.towerFoundationRepairs ?? 0,
      supplyRouteRestorationRibbons: reconstruction?.rendererHandoff?.counts?.supplyRouteRestorationRibbons ?? 0,
      workerCrewRallyThreads: reconstruction?.rendererHandoff?.counts?.workerCrewRallyThreads ?? 0,
      marketReopenOptions: reconstruction?.rendererHandoff?.counts?.marketReopenOptions ?? 0,
      memorialBeaconRings: reconstruction?.rendererHandoff?.counts?.memorialBeaconRings ?? 0
    }
  };
}

export async function installSignalBastionReconstructionReadiness() {
  await import(NEXUS_URL);
  const kit = createSignalBastionReconstructionReadinessDomainKit();
  const canvas = createOverlayCanvas();
  const panel = createPanel();
  const ctx = canvas.getContext("2d");
  resize(canvas, ctx);
  addEventListener("resize", () => resize(canvas, ctx));

  function readReadiness() {
    const host = getHost();
    if (!host) return null;
    return kit.describe(createReadinessInput(host));
  }

  function patchHost(host) {
    if (!host || host.__signalBastionReconstructionReadinessPatched) return;
    const baseGetRendererHandoff = host.getRendererHandoff?.bind(host);
    host.getReconstructionReadiness = readReadiness;
    host.getSignalBastionReconstructionReadiness = readReadiness;
    host.getReconstructionReadinessTree = () => kit.tree;
    host.getRendererHandoff = () => composeHandoff(baseGetRendererHandoff?.(), readReadiness());
    host.__signalBastionReconstructionReadinessPatched = true;
  }

  function frame() {
    const host = getHost();
    patchHost(host);
    const readiness = readReadiness();
    ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    if (readiness?.rendererHandoff?.descriptors) {
      for (const descriptor of readiness.rendererHandoff.descriptors) drawDescriptor(ctx, descriptor);
      renderPanel(panel, readiness);
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return { kit, canvas, panel, cacheMarker: RECONSTRUCTION_CACHE_MARKER };
}

installSignalBastionReconstructionReadiness().catch((error) => {
  console.error("Could not install Signal Bastion reconstruction readiness", error);
});
