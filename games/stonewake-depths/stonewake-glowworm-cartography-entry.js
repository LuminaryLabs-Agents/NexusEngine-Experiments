import { createStonewakeGlowwormCartographyReadinessDomainKit, STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE } from "./stonewake-glowworm-cartography-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createStonewakeGlowwormCartographyReadinessDomainKit();
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let latestReadiness = null;
let sourceHost = null;
let patchedHost = false;

function safeClone(value) { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } }
function readHost() {
  const host = sourceHost ?? globalThis.GameHost ?? {};
  const state = typeof host.getState === "function" ? host.getState() : null;
  const level = typeof host.getLevel === "function" ? host.getLevel() : null;
  return { host, state, level };
}

function ensureOverlay() {
  let overlay = document.querySelector("#stonewake-glowworm-cartography-overlay");
  if (overlay) return overlay;
  const shell = document.querySelector("#shell") ?? document.body;
  overlay = document.createElement("canvas");
  overlay.id = "stonewake-glowworm-cartography-overlay";
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
  let panel = document.querySelector("#stonewake-glowworm-cartography-panel");
  if (panel) return panel;
  const shell = document.querySelector("#shell") ?? document.body;
  panel = document.createElement("section");
  panel.id = "stonewake-glowworm-cartography-panel";
  panel.setAttribute("aria-label", "Stonewake glowworm cartography readiness");
  Object.assign(panel.style, {
    position: "absolute",
    left: "18px",
    bottom: "54px",
    width: "min(360px, calc(100% - 36px))",
    padding: "12px 14px",
    border: "1px solid rgba(147, 255, 184, .34)",
    borderRadius: "14px",
    background: "linear-gradient(180deg, rgba(6, 20, 16, .78), rgba(5, 8, 11, .48))",
    backdropFilter: "blur(10px)",
    color: "rgba(215, 255, 230, .82)",
    font: "11px Inter, ui-sans-serif, system-ui, sans-serif",
    letterSpacing: ".06em",
    textTransform: "uppercase",
    pointerEvents: "none"
  });
  panel.innerHTML = '<strong style="display:block;color:#f1fff5;font-size:12px;letter-spacing:.18em;margin-bottom:7px">Glowworm Cartography</strong><div data-glowworm-readiness>Cartography: staged</div><div data-glowworm-ledger>Ledger: looking for phosphate wall charts</div>';
  shell.appendChild(panel);
  return panel;
}

const worldToScreen = (x, y, camera = {}) => ({ x: Number(x) - Number(camera.x ?? 0), y: Number(y) - Number(camera.y ?? 0) });

function drawRing(ctx, x, y, radius, alpha, stroke = "147,255,184") {
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

  for (const rope of descriptors.ropeHandlineMarkers ?? []) {
    const from = worldToScreen(rope.from?.x, rope.from?.y, camera);
    const to = worldToScreen(rope.to?.x, rope.to?.y, camera);
    ctx.strokeStyle = `rgba(198, 255, 219, ${0.14 + rope.tension * 0.48})`;
    ctx.lineWidth = 2 + rope.tension * 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo((from.x + to.x) / 2, Math.min(from.y, to.y) - 36, to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const arrow of descriptors.chalkArrowTrails ?? []) {
    const p = worldToScreen(arrow.x, arrow.y, camera);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(arrow.angle ?? 0);
    ctx.strokeStyle = `rgba(220, 246, 255, ${0.18 + arrow.visibility * 0.58})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(7, -8);
    ctx.moveTo(18, 0);
    ctx.lineTo(7, 8);
    ctx.stroke();
    ctx.restore();
  }

  for (const chart of descriptors.phosphateWallCharts ?? []) {
    const p = worldToScreen(chart.x, chart.y, camera);
    ctx.fillStyle = `rgba(160, 238, 255, ${0.12 + chart.legibility * 0.42})`;
    ctx.fillRect(p.x - 22, p.y - 12, 44, 24);
    drawRing(ctx, p.x, p.y, 24 + chart.legibility * 18, 0.1 + chart.legibility * 0.28, "160,238,255");
  }

  for (const cluster of descriptors.glowwormClusters ?? []) {
    const p = worldToScreen(cluster.x, cluster.y, camera);
    const radius = 18 + cluster.density * 24;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    glow.addColorStop(0, `rgba(147, 255, 184, ${0.22 + cluster.pulse * 0.5})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(231, 255, 210, ${0.36 + cluster.pulse * 0.42})`;
    for (let index = 0; index < 4; index += 1) {
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(index * 1.9) * 8, p.y + Math.sin(index * 1.7) * 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const bell of descriptors.caveBellNodes ?? []) {
    const p = worldToScreen(bell.x, bell.y, camera);
    drawRing(ctx, p.x, p.y, 16 + bell.resonance * 24, 0.18 + bell.urgency * 0.5, bell.signal === "three-fast-rings" ? "255,95,105" : "225,166,80");
    ctx.fillStyle = `rgba(225, 166, 80, ${0.2 + bell.resonance * 0.46})`;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y + 8);
    ctx.lineTo(p.x + 8, p.y + 8);
    ctx.lineTo(p.x + 4, p.y - 10);
    ctx.lineTo(p.x - 4, p.y - 10);
    ctx.closePath();
    ctx.fill();
  }

  const ledger = descriptors.dawnCartographyLedger;
  if (ledger) {
    const p = worldToScreen(ledger.x, ledger.y, camera);
    drawRing(ctx, p.x, p.y, 22 + ledger.readiness * 36, ledger.phase === "cartography-handoff-ready" ? 0.9 : 0.42, ledger.phase === "lost-route-warning" ? "255,95,105" : "147,255,184");
  }

  ctx.restore();
}

function updatePanel(readiness) {
  const panel = ensurePanel();
  const ready = panel.querySelector("[data-glowworm-readiness]");
  const ledger = panel.querySelector("[data-glowworm-ledger]");
  if (ready) ready.textContent = `Cartography: ${Math.round((readiness?.readiness ?? 0) * 100)}% / ${readiness?.missionState ?? "staged"}`;
  if (ledger) ledger.textContent = readiness?.dawnCartographyLedger?.nextAction ?? "Ledger: looking for phosphate wall charts";
}

function patchHost() {
  if (!sourceHost && globalThis.GameHost) sourceHost = globalThis.GameHost;
  const { host, state, level } = readHost();
  if (!host || !state || !level) return false;
  latestReadiness = domainKit.describe({ state, level, time: performance.now() / 1000 });
  latestReadiness.runtimeSurface = runtimeSurface;
  latestReadiness.sourceCamera = safeClone(state.camera ?? { x: 0, y: 0 });

  if (!patchedHost) {
    const previousGetState = host.getState?.bind(host);
    const previousGetLevel = host.getLevel?.bind(host);
    const previousGetRendererHandoff = host.getRendererHandoff?.bind(host);
    globalThis.GameHost = {
      ...host,
      getState: () => {
        const base = typeof previousGetState === "function" ? previousGetState() : state;
        return { ...base, glowwormCartographyReadiness: latestReadiness, runtimeSurface: { ...(base.runtimeSurface ?? {}), stonewakeGlowwormCartography: runtimeSurface } };
      },
      getLevel: () => (typeof previousGetLevel === "function" ? previousGetLevel() : level),
      getStonewakeGlowwormCartographyReadiness: () => latestReadiness,
      getGlowwormCartographyReadiness: () => latestReadiness,
      getStonewakeGlowwormCartographyTree: () => STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE,
      getRendererHandoff: () => {
        const previous = typeof previousGetRendererHandoff === "function" ? previousGetRendererHandoff() : null;
        const glowwormCartography = latestReadiness?.rendererHandoff ?? null;
        return {
          ...(previous ?? {}),
          id: "stonewake-composed-glowworm-cartography-renderer-handoff",
          stonewakeGlowwormCartography: glowwormCartography,
          descriptors: { ...(previous?.descriptors ?? {}), stonewakeGlowwormCartography: glowwormCartography },
          counts: {
            ...(previous?.counts ?? {}),
            stonewakeGlowwormCartographyDescriptors: glowwormCartography?.counts?.total ?? 0,
            total: (previous?.counts?.total ?? 0) + (glowwormCartography?.counts?.total ?? 0)
          },
          rendererConsumesDescriptorsOnly: true
        };
      }
    };
    patchedHost = true;
  }

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
  wrap?.setAttribute("data-upgrade", `${existing} glowworm-cartography-readiness-renderer-handoff-pass`.trim());
  tick();
}

boot().catch((error) => {
  runtimeSurface = { imported: false, factoryName: "cdn-error", message: String(error?.message ?? error) };
  tick();
});
