import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createMeadowPollinatorRescueReadinessDomainKit,
  MEADOW_POLLINATOR_RESCUE_READINESS_TREE,
  MEADOW_POLLINATOR_RESCUE_READINESS_VERSION
} from "./meadow-pollinator-rescue-readiness-kits.js?v=20260708-pollinator-rescue-1";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PANEL_ID = "meadow-pollinator-rescue-readiness";

function heightAt(x = 0, z = 0) {
  return Math.sin(x * 0.034) * 0.2 + Math.cos(z * 0.039) * 0.18;
}

function pathMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.abs(x * 0.11 + z * 0.052) / 12);
}

function yardMask(x = 0, z = 0) {
  return Math.max(0, 1 - Math.hypot(x - 3.8, z + 2.9) / 20);
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
  panel.setAttribute("aria-label", "Meadow pollinator rescue readiness");
  panel.style.cssText = [
    "position:fixed",
    "right:18px",
    "top:112px",
    "z-index:4",
    "width:min(344px,calc(100vw - 36px))",
    "display:grid",
    "gap:8px",
    "padding:12px",
    "border-radius:18px",
    "background:linear-gradient(180deg,rgba(42,33,6,.84),rgba(7,15,8,.78))",
    "box-shadow:0 18px 70px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,235,142,.22)",
    "color:#fffbe7",
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
    ["nests", counts.beeNestHealthClusters ?? 0],
    ["seed", counts.nativeSeedbankPatches ?? 0],
    ["pollen", counts.pollenCorridors ?? 0],
    ["monarch", counts.monarchWaystations ?? 0],
    ["water", counts.puddleDrinkMicrohabitats ?? 0],
    ["ledger", counts.duskLedgerEntries ?? 0]
  ];
}

function renderPanel(panel, state) {
  const total = state?.descriptorCounts?.total ?? 0;
  const chips = summarize(state)
    .map(([label, count]) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:rgba(255,232,120,.12);box-shadow:inset 0 0 0 1px rgba(255,235,150,.2)">${label} <b>${count}</b></span>`)
    .join(" ");
  panel.innerHTML = `
    <div style="letter-spacing:.09em;text-transform:uppercase;color:#ffe47d">Pollinator Rescue Readiness</div>
    <div style="font-size:21px;font-weight:950;color:#fffdf0">${total} habitat rescue descriptors</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    <div style="color:#efe1a2;font-weight:650">Bee nests, pollen lanes, monarch waystations, and water microhabitats stay descriptor-only.</div>
  `;
}

function collectInput(host, tickIndex = 0) {
  const raw = host.sceneDescriptor ?? {};
  const state = typeof host.getState === "function" ? host.getState() : {};
  const cycle = state?.cycle ?? {};
  return {
    seed: `meadow-pollinator-rescue-live-${tickIndex}`,
    width: raw.terrain?.width ?? 196,
    depth: raw.terrain?.depth ?? 196,
    phase: cycle?.time?.phase ?? "golden hour",
    dayAmount: cycle?.light?.dayAmount ?? 0.7,
    warmRim: cycle?.light?.warmRim ?? 0.55,
    windSeed: tickIndex * 0.023,
    heightAt,
    pathMask,
    yardMask,
    sheep: raw.sheep,
    flowers: raw.flowers
  };
}

function composeHandoff(previous, pollinatorRescueReadiness) {
  const own = pollinatorRescueReadiness?.rendererHandoff;
  const previousKeys = Array.isArray(previous?.descriptorKeys) ? previous.descriptorKeys : [];
  const previousDescriptors = previous?.descriptors && typeof previous.descriptors === "object" ? previous.descriptors : {};
  const previousCounts = previous?.counts && typeof previous.counts === "object" ? previous.counts : {};
  const priorTotal = Number.isFinite(previousCounts.total) ? previousCounts.total : 0;
  const ownTotal = own?.counts?.total ?? 0;
  return Object.freeze({
    ...(previous ?? {}),
    id: "meadow.composedRendererHandoff.pollinatorRescue",
    kind: "renderer-handoff",
    contract: "renderer-consumes-serializable-descriptors-only",
    descriptorKeys: Object.freeze([...new Set([...previousKeys, "pollinatorRescueReadiness"])]),
    descriptors: Object.freeze({
      ...previousDescriptors,
      pollinatorRescueReadiness: pollinatorRescueReadiness?.descriptors ?? {}
    }),
    counts: Object.freeze({
      ...previousCounts,
      pollinatorRescueReadiness: ownTotal,
      total: priorTotal + ownTotal
    }),
    forbiddenOwnership: own?.forbiddenOwnership ?? previous?.forbiddenOwnership ?? []
  });
}

async function installPollinatorRescueReadiness() {
  const host = await waitForHost();
  const panel = ensurePanel();
  const domainKit = createMeadowPollinatorRescueReadinessDomainKit(NexusEngine, { heightAt, pathMask, yardMask });
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const previousGetState = typeof host.getState === "function" ? host.getState.bind(host) : null;
  let latest = domainKit.describe(collectInput(host, 0));
  let tickIndex = 0;

  host.pollinatorRescueReadinessKit = domainKit;
  host.pollinatorRescueReadiness = latest;
  host.nexusEngine = {
    ...(host.nexusEngine ?? {}),
    source: NEXUS_ENGINE_MAIN_CDN,
    pollinatorRescueNamespaceKeys: Object.keys(NexusEngine ?? {}).slice(0, 24)
  };
  host.getPollinatorRescueReadinessDomain = () => domainKit;
  host.getPollinatorRescueReadiness = () => latest;
  host.getMeadowPollinatorRescueReadiness = () => latest;
  host.getPollinatorRescueReadinessTree = () => MEADOW_POLLINATOR_RESCUE_READINESS_TREE;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), latest);
  host.getState = () => ({
    ...(previousGetState?.() ?? {}),
    pollinatorRescueReadiness: {
      version: MEADOW_POLLINATOR_RESCUE_READINESS_VERSION,
      counts: latest.descriptorCounts,
      contract: latest.rendererHandoff.contract
    },
    rendererHandoff: host.getRendererHandoff()
  });
  document.body.dataset.meadowPollinatorRescueReadiness = MEADOW_POLLINATOR_RESCUE_READINESS_VERSION;

  const refresh = () => {
    tickIndex += 1;
    latest = domainKit.describe(collectInput(host, tickIndex));
    host.pollinatorRescueReadiness = latest;
    renderPanel(panel, latest);
    window.requestAnimationFrame(refresh);
  };
  refresh();
}

installPollinatorRescueReadiness().catch((error) => {
  console.error("Failed to install meadow pollinator rescue readiness", error);
});
