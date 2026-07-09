import { createStonewakeSiltArchiveDrainageReadinessDomainKit, STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE } from "./stonewake-silt-archive-drainage-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createStonewakeSiltArchiveDrainageReadinessDomainKit();
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let latestReadiness = null;
let sourceHost = null;

function safeClone(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
}

function readHost() {
  const host = sourceHost ?? globalThis.GameHost ?? {};
  const state = typeof host.getState === "function" ? host.getState() : null;
  const level = typeof host.getLevel === "function" ? host.getLevel() : null;
  return { host, state, level };
}

function ensureOverlay() {
  let overlay = document.querySelector("#stonewake-silt-archive-drainage-overlay");
  if (overlay) return overlay;
  const shell = document.querySelector("#shell") ?? document.body;
  overlay = document.createElement("canvas");
  overlay.id = "stonewake-silt-archive-drainage-overlay";
  overlay.width = 1280;
  overlay.height = 720;
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  overlay.style.mixBlendMode = "screen";
  shell.appendChild(overlay);
  return overlay;
}

function ensurePanel() {
  let panel = document.querySelector("#stonewake-silt-archive-drainage-panel");
  if (panel) return panel;
  const shell = document.querySelector("#shell") ?? document.body;
  panel = document.createElement("section");
  panel.id = "stonewake-silt-archive-drainage-panel";
  panel.setAttribute("aria-label", "Stonewake silt archive drainage readiness");
  panel.style.position = "absolute";
  panel.style.right = "18px";
  panel.style.bottom = "54px";
  panel.style.width = "min(340px, calc(100% - 36px))";
  panel.style.padding = "12px 14px";
  panel.style.border = "1px solid rgba(225, 166, 80, .32)";
  panel.style.borderRadius = "14px";
  panel.style.background = "linear-gradient(180deg, rgba(19, 13, 7, .78), rgba(5, 8, 11, .48))";
  panel.style.backdropFilter = "blur(10px)";
  panel.style.color = "rgba(255, 231, 190, .8)";
  panel.style.font = "11px Inter, ui-sans-serif, system-ui, sans-serif";
  panel.style.letterSpacing = ".06em";
  panel.style.textTransform = "uppercase";
  panel.style.pointerEvents = "none";
  panel.innerHTML = '<strong style="display:block;color:#fff7e8;font-size:12px;letter-spacing:.18em;margin-bottom:7px">Silt Archive</strong><div data-silt-readiness>Drainage: staged</div><div data-silt-ledger>Ledger: surveying fossil shelves</div>';
  shell.appendChild(panel);
  return panel;
}

function worldToScreen(x, y, camera = {}) {
  return { x: Number(x) - Number(camera.x ?? 0), y: Number(y) - Number(camera.y ?? 0) };
}

function drawRing(ctx, x, y, radius, alpha, stroke = "225,166,80") {
  ctx.strokeStyle = `rgba(${stroke}, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOverlay(readiness) {
  const overlay = ensureOverlay();
  const ctx = overlay.getContext("2d");
  if (!ctx || !readiness) return;
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  const camera = readiness.sourceCamera ?? {};
  const descriptors = readiness.rendererHandoff?.descriptors ?? {};
  ctx.save();

  for (const gauge of descriptors.siltDepthGauges ?? []) {
    const p = worldToScreen(gauge.x, gauge.y, camera);
    ctx.strokeStyle = `rgba(225, 166, 80, ${0.16 + gauge.sedimentLoad * 0.36})`;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.moveTo(p.x - 40, p.y);
    ctx.lineTo(p.x + 40, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const hose of descriptors.siphonHoseRoutes ?? []) {
    const from = worldToScreen(hose.from?.x, hose.from?.y, camera);
    const to = worldToScreen(hose.to?.x, hose.to?.y, camera);
    ctx.strokeStyle = `rgba(87, 221, 255, ${0.16 + hose.flow * 0.48})`;
    ctx.lineWidth = 2 + hose.flow * 3;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo((from.x + to.x) / 2, Math.min(from.y, to.y) - 44, to.x, to.y);
    ctx.stroke();
  }

  for (const shelf of descriptors.fossilShelfArchives ?? []) {
    const p = worldToScreen(shelf.x, shelf.y, camera);
    const radius = 14 + shelf.fragility * 24;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    glow.addColorStop(0, `rgba(255, 214, 138, ${0.18 + shelf.fragility * 0.32})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const wheel of descriptors.sumpCrankWheels ?? []) {
    const p = worldToScreen(wheel.x, wheel.y, camera);
    drawRing(ctx, p.x, p.y, 16 + wheel.readiness * 18, 0.28 + wheel.readiness * 0.38, wheel.state === "crank-now" ? "255,95,105" : "225,166,80");
    ctx.fillStyle = `rgba(225, 166, 80, ${0.16 + wheel.readiness * 0.38})`;
    ctx.fillRect(p.x - 3, p.y - 17, 6, 34);
    ctx.fillRect(p.x - 17, p.y - 3, 34, 6);
  }

  for (const mapCase of descriptors.waxedMapCases ?? []) {
    const p = worldToScreen(mapCase.x, mapCase.y, camera);
    ctx.fillStyle = `rgba(255, 230, 180, ${0.18 + mapCase.seal * 0.46})`;
    ctx.fillRect(p.x - 12, p.y - 7, 24, 14);
    drawRing(ctx, p.x, p.y, 18 + mapCase.seal * 16, 0.16 + mapCase.seal * 0.24, "255,230,180");
  }

  const ledger = descriptors.dawnDrainageLedger;
  if (ledger) {
    const p = worldToScreen(ledger.x, ledger.y, camera);
    drawRing(ctx, p.x, p.y, 20 + ledger.readiness * 34, ledger.phase === "archive-handoff-ready" ? 0.9 : 0.48, ledger.phase === "silt-collapse-warning" ? "255,95,105" : "225,166,80");
  }

  ctx.restore();
}

function updatePanel(readiness) {
  const panel = ensurePanel();
  const ready = panel.querySelector("[data-silt-readiness]");
  const ledger = panel.querySelector("[data-silt-ledger]");
  if (ready) ready.textContent = `Drainage: ${Math.round((readiness?.readiness ?? 0) * 100)}% / ${readiness?.missionState ?? "staged"}`;
  if (ledger) ledger.textContent = readiness?.dawnDrainageLedger?.nextAction ?? "Ledger: surveying fossil shelves";
}

function patchHost() {
  if (!sourceHost && globalThis.GameHost) sourceHost = globalThis.GameHost;
  const { host, state, level } = readHost();
  if (!host || !state || !level) return false;
  latestReadiness = domainKit.describe({ state, level, time: performance.now() / 1000 });
  latestReadiness.runtimeSurface = runtimeSurface;
  latestReadiness.sourceCamera = safeClone(state.camera ?? { x: 0, y: 0 });
  const previousGetState = host.getState?.bind(host);
  const previousGetLevel = host.getLevel?.bind(host);
  const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
  globalThis.GameHost = {
    ...host,
    getState: () => {
      const base = typeof previousGetState === "function" ? previousGetState() : state;
      return { ...base, siltArchiveDrainageReadiness: latestReadiness, runtimeSurface: { ...(base.runtimeSurface ?? {}), stonewakeSiltArchiveDrainage: runtimeSurface } };
    },
    getLevel: () => (typeof previousGetLevel === "function" ? previousGetLevel() : level),
    getStonewakeSiltArchiveDrainageReadiness: () => latestReadiness,
    getSiltArchiveDrainageReadiness: () => latestReadiness,
    getStonewakeSiltArchiveDrainageTree: () => STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE,
    getRendererHandoff: () => {
      const previous = typeof previousGetRendererHandoff === "function" ? previousGetRendererHandoff() : null;
      const siltArchiveDrainage = latestReadiness?.rendererHandoff ?? null;
      return {
        ...(previous ?? {}),
        id: "stonewake-composed-silt-archive-drainage-renderer-handoff",
        stonewakeSiltArchiveDrainage: siltArchiveDrainage,
        descriptors: { ...(previous?.descriptors ?? {}), stonewakeSiltArchiveDrainage: siltArchiveDrainage },
        counts: {
          ...(previous?.counts ?? {}),
          stonewakeSiltArchiveDrainageDescriptors: siltArchiveDrainage?.counts?.total ?? 0,
          total: (previous?.counts?.total ?? 0) + (siltArchiveDrainage?.counts?.total ?? 0)
        },
        rendererConsumesDescriptorsOnly: true
      };
    }
  };
  drawOverlay(latestReadiness);
  updatePanel(latestReadiness);
  return true;
}

function tick() {
  patchHost();
  requestAnimationFrame(tick);
}

async function boot() {
  const NexusEngine = await import(NEXUS_ENGINE_CDN);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  const wrap = document.querySelector("#wrap");
  const existing = wrap?.getAttribute("data-upgrade") ?? "";
  wrap?.setAttribute("data-upgrade", `${existing} silt-archive-drainage-readiness-renderer-handoff-pass`.trim());
  tick();
}

boot().catch((error) => {
  runtimeSurface = { imported: false, factoryName: "cdn-error", message: String(error?.message ?? error) };
  tick();
});
