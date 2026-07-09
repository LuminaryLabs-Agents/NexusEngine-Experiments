import { createStonewakePressureLockPumpReadinessDomainKit, STONEWAKE_PRESSURE_LOCK_PUMP_TREE } from "./stonewake-pressure-lock-pump-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createStonewakePressureLockPumpReadinessDomainKit();
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
  let overlay = document.querySelector("#stonewake-pressure-lock-pump-overlay");
  if (overlay) return overlay;
  const shell = document.querySelector("#shell") ?? document.body;
  overlay = document.createElement("canvas");
  overlay.id = "stonewake-pressure-lock-pump-overlay";
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
  let panel = document.querySelector("#stonewake-pressure-lock-pump-panel");
  if (panel) return panel;
  const shell = document.querySelector("#shell") ?? document.body;
  panel = document.createElement("section");
  panel.id = "stonewake-pressure-lock-pump-panel";
  panel.setAttribute("aria-label", "Stonewake pressure lock pump readiness");
  panel.style.position = "absolute";
  panel.style.left = "18px";
  panel.style.bottom = "54px";
  panel.style.width = "min(330px, calc(100% - 36px))";
  panel.style.padding = "12px 14px";
  panel.style.border = "1px solid rgba(87, 221, 255, .28)";
  panel.style.borderRadius = "14px";
  panel.style.background = "linear-gradient(180deg, rgba(4, 14, 22, .78), rgba(2, 7, 12, .48))";
  panel.style.backdropFilter = "blur(10px)";
  panel.style.color = "rgba(215, 249, 255, .78)";
  panel.style.font = "11px Inter, ui-sans-serif, system-ui, sans-serif";
  panel.style.letterSpacing = ".06em";
  panel.style.textTransform = "uppercase";
  panel.style.pointerEvents = "none";
  panel.innerHTML = '<strong style="display:block;color:#f7fdff;font-size:12px;letter-spacing:.18em;margin-bottom:7px">Pressure Lock</strong><div data-pump-readiness>Readiness: staged</div><div data-pump-ledger>Ledger: chalking depth marks</div>';
  shell.appendChild(panel);
  return panel;
}

function worldToScreen(x, y, camera = {}) {
  return { x: Number(x) - Number(camera.x ?? 0), y: Number(y) - Number(camera.y ?? 0) };
}

function drawRing(ctx, x, y, radius, alpha, stroke = "87,221,255") {
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

  for (const marker of descriptors.chalkDepthMarkers ?? []) {
    const p = worldToScreen(marker.x, marker.y, camera);
    ctx.strokeStyle = `rgba(210, 245, 255, ${0.14 + marker.urgency * 0.34})`;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(p.x - 38, p.y);
    ctx.lineTo(p.x + 38, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const chain of descriptors.pumpChainTensions ?? []) {
    const from = worldToScreen(chain.from?.x, chain.from?.y, camera);
    const to = worldToScreen(chain.to?.x, chain.to?.y, camera);
    ctx.strokeStyle = `rgba(87, 221, 255, ${0.18 + chain.tension * 0.48})`;
    ctx.lineWidth = 2 + chain.tension * 3;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  for (const pocket of descriptors.bellowsAirPockets ?? []) {
    const p = worldToScreen(pocket.x, pocket.y, camera);
    const radius = 18 + pocket.airReserve * 26;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    glow.addColorStop(0, `rgba(190, 245, 255, ${0.18 + pocket.airReserve * 0.28})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const lamp of descriptors.carbideLampRelays ?? []) {
    const p = worldToScreen(lamp.x, lamp.y, camera);
    const radius = 12 + lamp.brightness * 20;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    glow.addColorStop(0, `rgba(255, 206, 113, ${0.18 + lamp.brightness * 0.32})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const wheel of descriptors.pressureGateWheels ?? []) {
    const p = worldToScreen(wheel.x, wheel.y, camera);
    drawRing(ctx, p.x, p.y, 16 + wheel.progress * 18, 0.36 + wheel.readiness * 0.3, wheel.state === "turn-now" ? "255,215,105" : "87,221,255");
    ctx.fillStyle = `rgba(87, 221, 255, ${0.18 + wheel.progress * 0.36})`;
    ctx.fillRect(p.x - 3, p.y - 17, 6, 34);
    ctx.fillRect(p.x - 17, p.y - 3, 34, 6);
  }

  const ledger = descriptors.lockmasterLedger;
  if (ledger) {
    const p = worldToScreen(ledger.x, ledger.y, camera);
    drawRing(ctx, p.x, p.y, 20 + ledger.readiness * 34, ledger.phase === "lockmaster-handoff-ready" ? 0.88 : 0.52, ledger.phase === "pressure-critical" ? "255,95,105" : "87,221,255");
  }

  ctx.restore();
}

function updatePanel(readiness) {
  const panel = ensurePanel();
  const ready = panel.querySelector("[data-pump-readiness]");
  const ledger = panel.querySelector("[data-pump-ledger]");
  if (ready) ready.textContent = `Readiness: ${Math.round((readiness?.readiness ?? 0) * 100)}% / ${readiness?.missionState ?? "staged"}`;
  if (ledger) ledger.textContent = readiness?.lockmasterLedger?.nextAction ?? "Ledger: chalking depth marks";
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
      return { ...base, pressureLockPumpReadiness: latestReadiness, runtimeSurface: { ...(base.runtimeSurface ?? {}), stonewakePressureLockPump: runtimeSurface } };
    },
    getLevel: () => (typeof previousGetLevel === "function" ? previousGetLevel() : level),
    getStonewakePressureLockPumpReadiness: () => latestReadiness,
    getPressureLockPumpReadiness: () => latestReadiness,
    getStonewakePressureLockPumpTree: () => STONEWAKE_PRESSURE_LOCK_PUMP_TREE,
    getRendererHandoff: () => {
      const previous = typeof previousGetRendererHandoff === "function" ? previousGetRendererHandoff() : null;
      const pressureLockPump = latestReadiness?.rendererHandoff ?? null;
      return {
        ...(previous ?? {}),
        id: "stonewake-composed-pressure-lock-pump-renderer-handoff",
        stonewakePressureLockPump: pressureLockPump,
        descriptors: { ...(previous?.descriptors ?? {}), stonewakePressureLockPump: pressureLockPump },
        counts: {
          ...(previous?.counts ?? {}),
          stonewakePressureLockPumpDescriptors: pressureLockPump?.counts?.total ?? 0,
          total: (previous?.counts?.total ?? 0) + (pressureLockPump?.counts?.total ?? 0)
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
  document.querySelector("#wrap")?.setAttribute("data-upgrade", "stonewake-flood-rescue-readiness-renderer-handoff-pass cave-clinic-triage-readiness-renderer-handoff-pass pressure-lock-pump-readiness-renderer-handoff-pass");
  tick();
}

boot().catch((error) => {
  runtimeSurface = { imported: false, factoryName: "cdn-error", message: String(error?.message ?? error) };
  tick();
});
