import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createMeadowSoilMyceliumRestorationDomainKit,
  MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE,
  MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION
} from "./meadow-soil-mycelium-restoration-kits.js?v=20260709-soil-mycelium-restoration-1";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PANEL_ID = "meadow-soil-mycelium-restoration";
const OVERLAY_ID = "meadow-soil-mycelium-overlay";

function heightAt(x = 0, z = 0) {
  return Math.sin(x * 0.027) * 0.18 + Math.cos(z * 0.034) * 0.14;
}

function pathMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.abs(x * 0.1 + z * 0.044) / 12);
}

function yardMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.hypot(x - 3.8, z + 2.9) / 20);
}

function waitForHost() {
  return new Promise((resolve) => {
    const tick = () => {
      if (window.GameHost?.sceneDescriptor || window.GameHost?.getState) {
        resolve(window.GameHost);
        return;
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;
  panel = document.createElement("aside");
  panel.id = PANEL_ID;
  panel.setAttribute("aria-label", "Meadow soil mycelium restoration readiness");
  panel.style.cssText = [
    "position:fixed",
    "right:18px",
    "bottom:18px",
    "z-index:4",
    "width:min(372px,calc(100vw - 36px))",
    "display:grid",
    "gap:8px",
    "padding:12px",
    "border-radius:18px",
    "background:linear-gradient(180deg,rgba(21,15,8,.88),rgba(5,12,7,.8))",
    "box-shadow:0 18px 70px rgba(0,0,0,.44),inset 0 0 0 1px rgba(236,205,130,.24)",
    "color:#fff8e8",
    "font:750 12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif",
    "pointer-events:none",
    "backdrop-filter:blur(14px) saturate(1.2)",
    "-webkit-backdrop-filter:blur(14px) saturate(1.2)"
  ].join(";");
  document.body.append(panel);
  return panel;
}

function ensureOverlay() {
  let canvas = document.getElementById(OVERLAY_ID);
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = OVERLAY_ID;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;z-index:2;width:100vw;height:100vh;pointer-events:none;mix-blend-mode:screen;opacity:.66";
  document.body.append(canvas);
  return canvas;
}

function resizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(window.innerWidth * dpr));
  const height = Math.max(1, Math.floor(window.innerHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function project(x = 0, z = 0) {
  return {
    x: window.innerWidth * (0.5 + x / 230),
    y: window.innerHeight * (0.55 + z / 230)
  };
}

function renderOverlay(canvas, state) {
  const ctx = resizeCanvas(canvas);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const descriptors = state?.descriptors ?? {};
  ctx.save();
  ctx.lineCap = "round";
  for (const thread of descriptors.myceliumThreads ?? []) {
    const a = project(thread.x1, thread.z1);
    const b = project(thread.x2, thread.z2);
    ctx.strokeStyle = `rgba(224, 196, 116, ${0.16 + thread.vitality * 0.22})`;
    ctx.lineWidth = 1.1 + thread.width * 0.42;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) * 0.5, (a.y + b.y) * 0.5 + 20 * (thread.vitality - 0.5), b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const monitor of descriptors.soilSporeMonitors ?? []) {
    const p = project(monitor.x, monitor.z);
    ctx.strokeStyle = monitor.status === "dry" ? "rgba(255,150,90,.34)" : "rgba(214,255,174,.32)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9 + monitor.moisture * 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const ring of descriptors.mushroomRings ?? []) {
    const p = project(ring.x, ring.z);
    ctx.fillStyle = `rgba(255,232,170,${0.07 + ring.fruiting * 0.13})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, ring.radius * 5, ring.radius * 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const windbreak of descriptors.hedgerowWindbreaks ?? []) {
    const p = project(windbreak.x, windbreak.z);
    ctx.fillStyle = `rgba(151,217,106,${0.08 + windbreak.shelter * 0.16})`;
    ctx.fillRect(p.x - 12, p.y - windbreak.height * 8, 24, windbreak.height * 16);
  }
  ctx.restore();
}

function summarize(state) {
  const counts = state?.descriptorCounts ?? {};
  return [
    ["spore", counts.soilSporeMonitors ?? 0],
    ["thread", counts.myceliumThreads ?? 0],
    ["ring", counts.mushroomRings ?? 0],
    ["beetle", counts.beetleLanes ?? 0],
    ["hedge", counts.hedgerowWindbreaks ?? 0],
    ["ledger", counts.dawnSoilLedger ?? 0]
  ];
}

function renderPanel(panel, state) {
  const total = state?.descriptorCounts?.total ?? 0;
  const chips = summarize(state)
    .map(([label, count]) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:rgba(255,232,169,.12);box-shadow:inset 0 0 0 1px rgba(255,232,169,.2)">${label} <b>${count}</b></span>`)
    .join(" ");
  panel.innerHTML = `
    <div style="letter-spacing:.09em;text-transform:uppercase;color:#ffe5a0">Soil Mycelium Restoration</div>
    <div style="font-size:21px;font-weight:950;color:#fffdf0">${total} underground descriptors</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    <div style="color:#fff0c7;font-weight:650">Spore monitors, mycelium threads, mushroom rings, beetle lanes, hedgerow windbreaks, and dawn soil ledger stay descriptor-only.</div>
    <div style="color:#bff08e;font-weight:850">soil state: ${state?.missionState ?? "unknown"} · health ${state?.soilHealth ?? 0}</div>
  `;
}

function collectInput(host, tickIndex = 0) {
  const raw = host.sceneDescriptor ?? {};
  const state = typeof host.getState === "function" ? host.getState() : {};
  const cycle = state?.cycle ?? {};
  return {
    seed: `meadow-soil-mycelium-live-${tickIndex}`,
    width: raw.terrain?.width ?? 196,
    depth: raw.terrain?.depth ?? 196,
    dayAmount: cycle?.light?.dayAmount ?? 0.42,
    windSeed: tickIndex * 0.017,
    heightAt,
    pathMask,
    yardMask,
    sheep: raw.sheep,
    flowers: raw.flowers,
    creekIrrigationReadiness: host.creekIrrigationReadiness ?? state.creekIrrigationReadiness,
    pollinatorRescueReadiness: host.pollinatorRescueReadiness ?? state.pollinatorRescueReadiness,
    harvestFestivalReadiness: host.harvestFestivalReadiness ?? state.harvestFestivalReadiness,
    nightWatchReadiness: host.nightWatchReadiness ?? state.nightWatchReadiness,
    flockSafetyReadiness: host.flockSafetyReadiness ?? state.flockSafetyReadiness
  };
}

function composeHandoff(previous, soilMyceliumRestoration) {
  const own = soilMyceliumRestoration?.rendererHandoff;
  const previousKeys = Array.isArray(previous?.descriptorKeys) ? previous.descriptorKeys : [];
  const previousDescriptors = previous?.descriptors && typeof previous.descriptors === "object" ? previous.descriptors : {};
  const previousCounts = previous?.counts && typeof previous.counts === "object" ? previous.counts : {};
  const priorTotal = Number.isFinite(previousCounts.total) ? previousCounts.total : 0;
  const ownTotal = own?.counts?.total ?? 0;
  return Object.freeze({
    ...(previous ?? {}),
    id: "meadow.composedRendererHandoff.soilMyceliumRestoration",
    kind: "renderer-handoff",
    contract: "renderer-consumes-serializable-descriptors-only",
    descriptorKeys: Object.freeze([...new Set([...previousKeys, "soilMyceliumRestoration"])]),
    descriptors: Object.freeze({
      ...previousDescriptors,
      soilMyceliumRestoration: soilMyceliumRestoration?.descriptors ?? {}
    }),
    counts: Object.freeze({
      ...previousCounts,
      soilMyceliumRestoration: ownTotal,
      total: priorTotal + ownTotal
    }),
    forbiddenOwnership: own?.forbiddenOwnership ?? previous?.forbiddenOwnership ?? []
  });
}

async function installSoilMyceliumRestoration() {
  const host = await waitForHost();
  const panel = ensurePanel();
  const overlay = ensureOverlay();
  const domainKit = createMeadowSoilMyceliumRestorationDomainKit(NexusEngine);
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const previousGetState = typeof host.getState === "function" ? host.getState.bind(host) : null;
  let latest = domainKit.describe(collectInput(host, 0));
  let tickIndex = 0;

  host.soilMyceliumRestorationKit = domainKit;
  host.soilMyceliumRestoration = latest;
  host.nexusEngine = {
    ...(host.nexusEngine ?? {}),
    source: NEXUS_ENGINE_MAIN_CDN,
    soilMyceliumNamespaceKeys: Object.keys(NexusEngine ?? {}).slice(0, 24)
  };
  host.getSoilMyceliumRestorationDomain = () => domainKit;
  host.getSoilMyceliumRestoration = () => latest;
  host.getMeadowSoilMyceliumRestoration = () => latest;
  host.getSoilMyceliumRestorationTree = () => MEADOW_SOIL_MYCELIUM_RESTORATION_DOMAIN_TREE;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), latest);
  host.getState = () => ({
    ...(previousGetState?.() ?? {}),
    soilMyceliumRestoration: {
      version: MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION,
      counts: latest.descriptorCounts,
      missionState: latest.missionState,
      soilHealth: latest.soilHealth,
      contract: latest.rendererHandoff.contract
    },
    rendererHandoff: host.getRendererHandoff()
  });
  document.body.dataset.meadowSoilMyceliumRestoration = MEADOW_SOIL_MYCELIUM_RESTORATION_VERSION;

  const refresh = () => {
    tickIndex += 1;
    latest = domainKit.describe(collectInput(host, tickIndex));
    host.soilMyceliumRestoration = latest;
    renderPanel(panel, latest);
    renderOverlay(overlay, latest);
    window.requestAnimationFrame(refresh);
  };
  refresh();
}

installSoilMyceliumRestoration().catch((error) => {
  console.error("Failed to install meadow soil mycelium restoration", error);
});
