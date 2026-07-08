import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createMeadowHarvestFestivalReadinessDomainKit,
  MEADOW_HARVEST_FESTIVAL_READINESS_TREE,
  MEADOW_HARVEST_FESTIVAL_READINESS_VERSION
} from "./meadow-harvest-festival-readiness-kits.js?v=20260708-harvest-festival-1";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PANEL_ID = "meadow-harvest-festival-readiness";

function heightAt(x = 0, z = 0) {
  return Math.sin(x * 0.038) * 0.22 + Math.cos(z * 0.031) * 0.19;
}

function pathMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.abs(x * 0.12 + z * 0.055) / 13);
}

function yardMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.hypot(x - 3.2, z + 2.4) / 22);
}

function waitForHost() {
  return new Promise((resolve) => {
    const tick = () => {
      if (window.GameHost?.sceneDescriptor) {
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
  panel.setAttribute("aria-label", "Meadow harvest festival readiness");
  panel.style.cssText = [
    "position:fixed",
    "right:18px",
    "bottom:18px",
    "z-index:4",
    "width:min(330px,calc(100vw - 36px))",
    "display:grid",
    "gap:8px",
    "padding:12px",
    "border-radius:18px",
    "background:linear-gradient(180deg,rgba(26,19,7,.84),rgba(7,12,6,.76))",
    "box-shadow:0 18px 70px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,236,178,.2)",
    "color:#fff8de",
    "font:750 12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif",
    "pointer-events:none",
    "backdrop-filter:blur(14px) saturate(1.2)",
    "-webkit-backdrop-filter:blur(14px) saturate(1.2)"
  ].join(";");
  document.body.append(panel);
  return panel;
}

function summarize(state) {
  const counts = state?.descriptorCounts ?? {};
  return [
    ["hay", counts.hayrickYieldPiles ?? 0],
    ["bouquets", counts.wildflowerBouquets ?? 0],
    ["fences", counts.fenceRepairMarkers ?? 0],
    ["tables", counts.picnicTableLayouts ?? 0],
    ["lanterns", counts.lanternParadeBeacons ?? 0],
    ["tarps", counts.weatherTarpWindows ?? 0]
  ];
}

function renderPanel(panel, state) {
  const total = state?.descriptorCounts?.total ?? 0;
  const chips = summarize(state)
    .map(([label, count]) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:rgba(255,226,142,.12);box-shadow:inset 0 0 0 1px rgba(255,232,160,.18)">${label} <b>${count}</b></span>`)
    .join(" ");
  panel.innerHTML = `
    <div style="letter-spacing:.09em;text-transform:uppercase;color:#ffe6a3">Harvest Festival Readiness</div>
    <div style="font-size:21px;font-weight:950;color:#fffdf0">${total} meadow prep descriptors</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    <div style="color:#e7d9a5;font-weight:650">Renderer consumes serializable descriptors only.</div>
  `;
}

function collectInput(host, tickIndex = 0) {
  const raw = host.sceneDescriptor ?? {};
  const state = typeof host.getState === "function" ? host.getState() : {};
  const cycle = state?.cycle ?? {};
  return {
    seed: `meadow-harvest-festival-live-${tickIndex}`,
    width: raw.terrain?.width ?? 196,
    depth: raw.terrain?.depth ?? 196,
    phase: cycle?.time?.phase ?? "golden hour",
    dayAmount: cycle?.light?.dayAmount ?? 0.72,
    warmRim: cycle?.light?.warmRim ?? 0.58,
    windSeed: tickIndex * 0.017,
    heightAt,
    pathMask,
    yardMask,
    sheep: raw.sheep,
    flowers: raw.flowers
  };
}

function composeHandoff(previous, harvestFestivalReadiness) {
  const own = harvestFestivalReadiness?.rendererHandoff;
  const previousKeys = Array.isArray(previous?.descriptorKeys) ? previous.descriptorKeys : [];
  const previousDescriptors = previous?.descriptors && typeof previous.descriptors === "object" ? previous.descriptors : {};
  const previousCounts = previous?.counts && typeof previous.counts === "object" ? previous.counts : {};
  const priorTotal = Number.isFinite(previousCounts.total) ? previousCounts.total : 0;
  const ownTotal = own?.counts?.total ?? 0;
  return Object.freeze({
    ...(previous ?? {}),
    id: "meadow.composedRendererHandoff.harvestFestival",
    kind: "renderer-handoff",
    contract: "renderer-consumes-serializable-descriptors-only",
    descriptorKeys: Object.freeze([...new Set([...previousKeys, "harvestFestivalReadiness"])]),
    descriptors: Object.freeze({
      ...previousDescriptors,
      harvestFestivalReadiness: harvestFestivalReadiness?.descriptors ?? {}
    }),
    counts: Object.freeze({
      ...previousCounts,
      harvestFestivalReadiness: ownTotal,
      total: priorTotal + ownTotal
    }),
    forbiddenOwnership: own?.forbiddenOwnership ?? previous?.forbiddenOwnership ?? []
  });
}

async function installHarvestFestivalReadiness() {
  const host = await waitForHost();
  const panel = ensurePanel();
  const domainKit = createMeadowHarvestFestivalReadinessDomainKit(NexusEngine, { heightAt, pathMask, yardMask });
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const previousGetState = typeof host.getState === "function" ? host.getState.bind(host) : null;
  let latest = domainKit.describe(collectInput(host, 0));
  let tickIndex = 0;

  host.harvestFestivalReadinessKit = domainKit;
  host.harvestFestivalReadiness = latest;
  host.nexusEngine = {
    ...(host.nexusEngine ?? {}),
    source: NEXUS_ENGINE_MAIN_CDN,
    harvestFestivalNamespaceKeys: Object.keys(NexusEngine ?? {}).slice(0, 24)
  };
  host.getHarvestFestivalReadiness = () => latest;
  host.getMeadowHarvestFestivalReadiness = () => latest;
  host.getHarvestFestivalReadinessTree = () => MEADOW_HARVEST_FESTIVAL_READINESS_TREE;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), latest);
  host.getState = () => ({
    ...(previousGetState?.() ?? {}),
    harvestFestivalReadiness: {
      version: MEADOW_HARVEST_FESTIVAL_READINESS_VERSION,
      counts: latest.descriptorCounts,
      contract: latest.rendererHandoff.contract
    },
    rendererHandoff: host.getRendererHandoff()
  });
  document.body.dataset.meadowHarvestFestivalReadiness = MEADOW_HARVEST_FESTIVAL_READINESS_VERSION;

  const refresh = () => {
    tickIndex += 1;
    latest = domainKit.describe(collectInput(host, tickIndex));
    host.harvestFestivalReadiness = latest;
    renderPanel(panel, latest);
    window.requestAnimationFrame(refresh);
  };
  refresh();
}

installHarvestFestivalReadiness().catch((error) => {
  console.error("Failed to install meadow harvest festival readiness", error);
});
