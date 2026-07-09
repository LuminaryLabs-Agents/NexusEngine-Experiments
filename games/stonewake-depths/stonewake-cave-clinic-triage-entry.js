import { createStonewakeCaveClinicTriageReadinessDomainKit, STONEWAKE_CAVE_CLINIC_TRIAGE_TREE } from "./stonewake-cave-clinic-triage-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createStonewakeCaveClinicTriageReadinessDomainKit();
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
  let overlay = document.querySelector("#stonewake-cave-clinic-overlay");
  if (overlay) return overlay;
  const shell = document.querySelector("#shell") ?? document.body;
  overlay = document.createElement("canvas");
  overlay.id = "stonewake-cave-clinic-overlay";
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
  let panel = document.querySelector("#stonewake-cave-clinic-panel");
  if (panel) return panel;
  const shell = document.querySelector("#shell") ?? document.body;
  panel = document.createElement("section");
  panel.id = "stonewake-cave-clinic-panel";
  panel.setAttribute("aria-label", "Stonewake cave clinic triage readiness");
  panel.style.position = "absolute";
  panel.style.right = "18px";
  panel.style.bottom = "18px";
  panel.style.width = "min(330px, calc(100% - 36px))";
  panel.style.padding = "12px 14px";
  panel.style.border = "1px solid rgba(144, 255, 202, .24)";
  panel.style.borderRadius = "14px";
  panel.style.background = "linear-gradient(180deg, rgba(6, 14, 16, .78), rgba(3, 8, 11, .46))";
  panel.style.backdropFilter = "blur(10px)";
  panel.style.color = "rgba(232, 255, 245, .78)";
  panel.style.font = "11px Inter, ui-sans-serif, system-ui, sans-serif";
  panel.style.letterSpacing = ".06em";
  panel.style.textTransform = "uppercase";
  panel.style.pointerEvents = "none";
  panel.innerHTML = '<strong style="display:block;color:#f4fff9;font-size:12px;letter-spacing:.18em;margin-bottom:7px">Cave Clinic</strong><div data-clinic-readiness>Readiness: staging</div><div data-clinic-ledger>Ledger: marking stretchers</div>';
  shell.appendChild(panel);
  return panel;
}

function worldToScreen(x, y, camera = {}) {
  return { x: Number(x) - Number(camera.x ?? 0), y: Number(y) - Number(camera.y ?? 0) };
}

function drawCross(ctx, x, y, size, alpha) {
  ctx.fillStyle = `rgba(130, 255, 190, ${alpha})`;
  ctx.fillRect(x - size * 0.5, y - 2, size, 4);
  ctx.fillRect(x - 2, y - size * 0.5, 4, size);
}

function drawOverlay(readiness) {
  const overlay = ensureOverlay();
  const ctx = overlay.getContext("2d");
  if (!ctx || !readiness) return;
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  const camera = readiness.sourceCamera ?? {};
  const descriptors = readiness.rendererHandoff?.descriptors ?? {};
  ctx.save();
  ctx.lineWidth = 2;

  for (const route of descriptors.splintStretcherRoutes ?? []) {
    const from = worldToScreen(route.from?.x, route.from?.y, camera);
    const to = worldToScreen(route.to?.x, route.to?.y, camera);
    ctx.strokeStyle = `rgba(144, 255, 202, ${0.16 + (1 - route.slopeRisk) * 0.36})`;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const lantern of descriptors.glowwormLanternStrings ?? []) {
    const p = worldToScreen(lantern.x, lantern.y, camera);
    const radius = 14 + lantern.glow * 18;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    glow.addColorStop(0, `rgba(180, 255, 160, ${0.18 + lantern.glow * 0.32})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const blanket of descriptors.thermalBlanketCaches ?? []) {
    const p = worldToScreen(blanket.x, blanket.y, camera);
    ctx.fillStyle = `rgba(110, 230, 255, ${0.12 + blanket.dryness * 0.24})`;
    ctx.fillRect(p.x - 10, p.y - 5, 28, 16);
    drawCross(ctx, p.x + 4, p.y + 3, 13, 0.48 + blanket.warmth * 0.36);
  }

  const pump = descriptors.sumpPumpPrime;
  if (pump) {
    const p = worldToScreen(pump.x, pump.y, camera);
    ctx.strokeStyle = pump.phase === "drawdown" ? "rgba(130,255,190,.82)" : "rgba(255,215,105,.62)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18 + pump.prime * 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const card of descriptors.medicTriageCards ?? []) {
    const p = worldToScreen(card.x, card.y, camera);
    const alpha = card.tag === "red" ? 0.82 : card.tag === "yellow" ? 0.62 : 0.46;
    ctx.fillStyle = `rgba(255, ${card.tag === "red" ? 92 : 230}, 120, ${alpha})`;
    ctx.fillRect(p.x - 12, p.y - 9, 24, 18);
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.strokeRect(p.x - 12, p.y - 9, 24, 18);
  }

  const ledger = descriptors.evacuationStretcherLedger;
  if (ledger) {
    const p = worldToScreen(ledger.x, ledger.y, camera);
    ctx.strokeStyle = ledger.phase === "stretcher-extraction-ready" ? "rgba(130,255,190,.95)" : "rgba(144,255,202,.54)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18 + ledger.readiness * 32, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function updatePanel(readiness) {
  const panel = ensurePanel();
  const ready = panel.querySelector("[data-clinic-readiness]");
  const ledger = panel.querySelector("[data-clinic-ledger]");
  if (ready) ready.textContent = `Readiness: ${Math.round((readiness?.readiness ?? 0) * 100)}% / ${readiness?.missionState ?? "staging"}`;
  if (ledger) ledger.textContent = readiness?.evacuationStretcherLedger?.nextAction ?? "Ledger: marking stretchers";
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
      return { ...base, caveClinicTriageReadiness: latestReadiness, runtimeSurface: { ...(base.runtimeSurface ?? {}), stonewakeCaveClinicTriage: runtimeSurface } };
    },
    getLevel: () => (typeof previousGetLevel === "function" ? previousGetLevel() : level),
    getStonewakeCaveClinicTriageReadiness: () => latestReadiness,
    getCaveClinicTriageReadiness: () => latestReadiness,
    getStonewakeCaveClinicTriageTree: () => STONEWAKE_CAVE_CLINIC_TRIAGE_TREE,
    getRendererHandoff: () => {
      const previous = typeof previousGetRendererHandoff === "function" ? previousGetRendererHandoff() : null;
      const caveClinicTriage = latestReadiness?.rendererHandoff ?? null;
      return {
        ...(previous ?? {}),
        id: "stonewake-composed-cave-clinic-renderer-handoff",
        stonewakeCaveClinicTriage: caveClinicTriage,
        descriptors: { ...(previous?.descriptors ?? {}), stonewakeCaveClinicTriage: caveClinicTriage },
        counts: {
          ...(previous?.counts ?? {}),
          stonewakeCaveClinicTriageDescriptors: caveClinicTriage?.counts?.total ?? 0,
          total: (previous?.counts?.total ?? 0) + (caveClinicTriage?.counts?.total ?? 0)
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
  document.querySelector("#wrap")?.setAttribute("data-upgrade", "stonewake-flood-rescue-readiness-renderer-handoff-pass cave-clinic-triage-readiness-renderer-handoff-pass");
  tick();
}

boot().catch((error) => {
  runtimeSurface = { imported: false, factoryName: "cdn-error", message: String(error?.message ?? error) };
  tick();
});
