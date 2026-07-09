import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createMeadowCreekIrrigationReadinessDomainKit,
  MEADOW_CREEK_IRRIGATION_READINESS_TREE,
  MEADOW_CREEK_IRRIGATION_READINESS_VERSION
} from "./meadow-creek-irrigation-readiness-kits.js?v=20260709-creek-irrigation-readiness-1";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PANEL_ID = "meadow-creek-irrigation-readiness";
const OVERLAY_ID = "meadow-creek-irrigation-overlay";

function heightAt(x = 0, z = 0) {
  return Math.sin(x * 0.032) * 0.21 + Math.cos(z * 0.037) * 0.16;
}

function pathMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.abs(x * 0.105 + z * 0.048) / 12);
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
  panel.setAttribute("aria-label", "Meadow creek irrigation readiness");
  panel.style.cssText = [
    "position:fixed",
    "left:18px",
    "bottom:18px",
    "z-index:4",
    "width:min(360px,calc(100vw - 36px))",
    "display:grid",
    "gap:8px",
    "padding:12px",
    "border-radius:18px",
    "background:linear-gradient(180deg,rgba(5,24,23,.86),rgba(4,12,7,.8))",
    "box-shadow:0 18px 70px rgba(0,0,0,.44),inset 0 0 0 1px rgba(137,229,208,.25)",
    "color:#edfff8",
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
  canvas.style.cssText = "position:fixed;inset:0;z-index:2;width:100vw;height:100vh;pointer-events:none;mix-blend-mode:screen;opacity:.78";
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
  for (const ribbon of descriptors.creekRibbons ?? []) {
    const a = project(ribbon.x1, ribbon.z1);
    const b = project(ribbon.x2, ribbon.z2);
    ctx.strokeStyle = `rgba(80, 220, 255, ${0.18 + ribbon.flow * 0.24})`;
    ctx.lineWidth = 2 + ribbon.width * 0.42;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo((a.x + b.x) * 0.5, (a.y + b.y) * 0.5 - 18 * ribbon.flow);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (const furrow of descriptors.irrigationFurrows ?? []) {
    const a = project(furrow.x1, furrow.z1);
    const b = project(furrow.x2, furrow.z2);
    ctx.strokeStyle = furrow.priority === "urgent" ? "rgba(255,218,120,.28)" : "rgba(150,255,204,.2)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const seep of descriptors.springSeeps ?? []) {
    const p = project(seep.x, seep.z);
    ctx.strokeStyle = `rgba(170,255,235,${0.32 + seep.flow * 0.38})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9 + seep.flow * 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const pool of descriptors.frogRefugePools ?? []) {
    const p = project(pool.x, pool.z);
    ctx.fillStyle = `rgba(116,255,165,${0.08 + pool.safety * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, pool.radius * 4, pool.radius * 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function summarize(state) {
  const counts = state?.descriptorCounts ?? {};
  return [
    ["seep", counts.springSeeps ?? 0],
    ["creek", counts.creekRibbons ?? 0],
    ["weir", counts.stoneWeirs ?? 0],
    ["furrow", counts.irrigationFurrows ?? 0],
    ["frog", counts.frogRefugePools ?? 0],
    ["ledger", counts.dawnWaterLedger ?? 0]
  ];
}

function renderPanel(panel, state) {
  const total = state?.descriptorCounts?.total ?? 0;
  const chips = summarize(state)
    .map(([label, count]) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:rgba(150,255,226,.12);box-shadow:inset 0 0 0 1px rgba(150,255,226,.2)">${label} <b>${count}</b></span>`)
    .join(" ");
  panel.innerHTML = `
    <div style="letter-spacing:.09em;text-transform:uppercase;color:#a8f8e3">Creek Irrigation Readiness</div>
    <div style="font-size:21px;font-weight:950;color:#fffdf0">${total} watercourse descriptors</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    <div style="color:#d8fff3;font-weight:650">Spring seeps, creek ribbons, stone weirs, flower furrows, frog pools, and dawn water ledger stay descriptor-only.</div>
    <div style="color:#c9f08e;font-weight:850">water status: ${state?.status ?? "unknown"} · index ${state?.waterIndex ?? 0}</div>
  `;
}

function collectInput(host, tickIndex = 0) {
  const raw = host.sceneDescriptor ?? {};
  const state = typeof host.getState === "function" ? host.getState() : {};
  const cycle = state?.cycle ?? {};
  return {
    seed: `meadow-creek-irrigation-live-${tickIndex}`,
    width: raw.terrain?.width ?? 196,
    depth: raw.terrain?.depth ?? 196,
    phase: cycle?.time?.phase ?? "blue dusk",
    dayAmount: cycle?.light?.dayAmount ?? 0.42,
    windSeed: tickIndex * 0.021,
    heightAt,
    pathMask,
    yardMask,
    sheep: raw.sheep,
    flowers: raw.flowers
  };
}

function composeHandoff(previous, creekIrrigationReadiness) {
  const own = creekIrrigationReadiness?.rendererHandoff;
  const previousKeys = Array.isArray(previous?.descriptorKeys) ? previous.descriptorKeys : [];
  const previousDescriptors = previous?.descriptors && typeof previous.descriptors === "object" ? previous.descriptors : {};
  const previousCounts = previous?.counts && typeof previous.counts === "object" ? previous.counts : {};
  const priorTotal = Number.isFinite(previousCounts.total) ? previousCounts.total : 0;
  const ownTotal = own?.counts?.total ?? 0;
  return Object.freeze({
    ...(previous ?? {}),
    id: "meadow.composedRendererHandoff.creekIrrigation",
    kind: "renderer-handoff",
    contract: "renderer-consumes-serializable-descriptors-only",
    descriptorKeys: Object.freeze([...new Set([...previousKeys, "creekIrrigationReadiness"])]),
    descriptors: Object.freeze({
      ...previousDescriptors,
      creekIrrigationReadiness: creekIrrigationReadiness?.descriptors ?? {}
    }),
    counts: Object.freeze({
      ...previousCounts,
      creekIrrigationReadiness: ownTotal,
      total: priorTotal + ownTotal
    }),
    forbiddenOwnership: own?.forbiddenOwnership ?? previous?.forbiddenOwnership ?? []
  });
}

async function installCreekIrrigationReadiness() {
  const host = await waitForHost();
  const panel = ensurePanel();
  const overlay = ensureOverlay();
  const domainKit = createMeadowCreekIrrigationReadinessDomainKit(NexusEngine);
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const previousGetState = typeof host.getState === "function" ? host.getState.bind(host) : null;
  let latest = domainKit.describe(collectInput(host, 0));
  let tickIndex = 0;

  host.creekIrrigationReadinessKit = domainKit;
  host.creekIrrigationReadiness = latest;
  host.nexusEngine = {
    ...(host.nexusEngine ?? {}),
    source: NEXUS_ENGINE_MAIN_CDN,
    creekIrrigationNamespaceKeys: Object.keys(NexusEngine ?? {}).slice(0, 24)
  };
  host.getCreekIrrigationReadinessDomain = () => domainKit;
  host.getCreekIrrigationReadiness = () => latest;
  host.getMeadowCreekIrrigationReadiness = () => latest;
  host.getCreekIrrigationReadinessTree = () => MEADOW_CREEK_IRRIGATION_READINESS_TREE;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), latest);
  host.getState = () => ({
    ...(previousGetState?.() ?? {}),
    creekIrrigationReadiness: {
      version: MEADOW_CREEK_IRRIGATION_READINESS_VERSION,
      counts: latest.descriptorCounts,
      status: latest.status,
      waterIndex: latest.waterIndex,
      contract: latest.rendererHandoff.contract
    },
    rendererHandoff: host.getRendererHandoff()
  });
  document.body.dataset.meadowCreekIrrigationReadiness = MEADOW_CREEK_IRRIGATION_READINESS_VERSION;

  const refresh = () => {
    tickIndex += 1;
    latest = domainKit.describe(collectInput(host, tickIndex));
    host.creekIrrigationReadiness = latest;
    renderPanel(panel, latest);
    renderOverlay(overlay, latest);
    window.requestAnimationFrame(refresh);
  };
  refresh();
}

installCreekIrrigationReadiness().catch((error) => {
  console.error("Failed to install meadow creek irrigation readiness", error);
});
