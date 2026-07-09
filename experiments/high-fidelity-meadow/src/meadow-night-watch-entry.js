import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createMeadowNightWatchReadinessDomainKit,
  MEADOW_NIGHT_WATCH_READINESS_TREE,
  MEADOW_NIGHT_WATCH_READINESS_VERSION
} from "./meadow-night-watch-readiness-kits.js?v=20260708-night-watch-1";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PANEL_ID = "meadow-night-watch-readiness";

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
  panel.setAttribute("aria-label", "Meadow night watch readiness");
  panel.style.cssText = [
    "position:fixed",
    "right:18px",
    "bottom:18px",
    "z-index:4",
    "width:min(352px,calc(100vw - 36px))",
    "display:grid",
    "gap:8px",
    "padding:12px",
    "border-radius:18px",
    "background:linear-gradient(180deg,rgba(14,18,35,.86),rgba(8,12,8,.8))",
    "box-shadow:0 18px 70px rgba(0,0,0,.44),inset 0 0 0 1px rgba(177,206,255,.24)",
    "color:#f4f8ff",
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
    ["lantern", counts.lanternPatrolNodes ?? 0],
    ["fox", counts.foxPressureTracks ?? 0],
    ["lamb", counts.lambShelterPockets ?? 0],
    ["gate", counts.gateLatchCheckpoints ?? 0],
    ["dew", counts.dewPondReflections ?? 0],
    ["rollcall", counts.dawnRollcallEntries ?? 0]
  ];
}

function renderPanel(panel, state) {
  const total = state?.descriptorCounts?.total ?? 0;
  const fox = state?.descriptorCounts?.foxPressureTracks ?? 0;
  const chips = summarize(state)
    .map(([label, count]) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:rgba(190,215,255,.12);box-shadow:inset 0 0 0 1px rgba(190,215,255,.2)">${label} <b>${count}</b></span>`)
    .join(" ");
  panel.innerHTML = `
    <div style="letter-spacing:.09em;text-transform:uppercase;color:#bcd3ff">Night Watch Readiness</div>
    <div style="font-size:21px;font-weight:950;color:#fffdf0">${total} moonlit safety descriptors</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    <div style="color:#dbe7ff;font-weight:650">Lantern patrols, fox-pressure rings, lamb shelters, gate latches, dew ponds, and dawn rollcall stay descriptor-only.</div>
    <div style="color:#f4d48e;font-weight:800">fox perimeter groups: ${fox}</div>
  `;
}

function collectInput(host, tickIndex = 0) {
  const raw = host.sceneDescriptor ?? {};
  const state = typeof host.getState === "function" ? host.getState() : {};
  const cycle = state?.cycle ?? {};
  return {
    seed: `meadow-night-watch-live-${tickIndex}`,
    width: raw.terrain?.width ?? 196,
    depth: raw.terrain?.depth ?? 196,
    phase: cycle?.time?.phase ?? "blue dusk",
    dayAmount: cycle?.light?.dayAmount ?? 0.35,
    warmRim: cycle?.light?.warmRim ?? 0.3,
    windSeed: tickIndex * 0.031,
    heightAt,
    pathMask,
    yardMask,
    sheep: raw.sheep,
    flowers: raw.flowers
  };
}

function composeHandoff(previous, nightWatchReadiness) {
  const own = nightWatchReadiness?.rendererHandoff;
  const previousKeys = Array.isArray(previous?.descriptorKeys) ? previous.descriptorKeys : [];
  const previousDescriptors = previous?.descriptors && typeof previous.descriptors === "object" ? previous.descriptors : {};
  const previousCounts = previous?.counts && typeof previous.counts === "object" ? previous.counts : {};
  const priorTotal = Number.isFinite(previousCounts.total) ? previousCounts.total : 0;
  const ownTotal = own?.counts?.total ?? 0;
  return Object.freeze({
    ...(previous ?? {}),
    id: "meadow.composedRendererHandoff.nightWatch",
    kind: "renderer-handoff",
    contract: "renderer-consumes-serializable-descriptors-only",
    descriptorKeys: Object.freeze([...new Set([...previousKeys, "nightWatchReadiness"])]),
    descriptors: Object.freeze({
      ...previousDescriptors,
      nightWatchReadiness: nightWatchReadiness?.descriptors ?? {}
    }),
    counts: Object.freeze({
      ...previousCounts,
      nightWatchReadiness: ownTotal,
      total: priorTotal + ownTotal
    }),
    forbiddenOwnership: own?.forbiddenOwnership ?? previous?.forbiddenOwnership ?? []
  });
}

async function installNightWatchReadiness() {
  const host = await waitForHost();
  const panel = ensurePanel();
  const domainKit = createMeadowNightWatchReadinessDomainKit(NexusEngine, { heightAt, pathMask, yardMask });
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : null;
  const previousGetState = typeof host.getState === "function" ? host.getState.bind(host) : null;
  let latest = domainKit.describe(collectInput(host, 0));
  let tickIndex = 0;

  host.nightWatchReadinessKit = domainKit;
  host.nightWatchReadiness = latest;
  host.nexusEngine = {
    ...(host.nexusEngine ?? {}),
    source: NEXUS_ENGINE_MAIN_CDN,
    nightWatchNamespaceKeys: Object.keys(NexusEngine ?? {}).slice(0, 24)
  };
  host.getNightWatchReadinessDomain = () => domainKit;
  host.getNightWatchReadiness = () => latest;
  host.getMeadowNightWatchReadiness = () => latest;
  host.getNightWatchReadinessTree = () => MEADOW_NIGHT_WATCH_READINESS_TREE;
  host.getRendererHandoff = () => composeHandoff(previousGetRendererHandoff?.(), latest);
  host.getState = () => ({
    ...(previousGetState?.() ?? {}),
    nightWatchReadiness: {
      version: MEADOW_NIGHT_WATCH_READINESS_VERSION,
      counts: latest.descriptorCounts,
      contract: latest.rendererHandoff.contract
    },
    rendererHandoff: host.getRendererHandoff()
  });
  document.body.dataset.meadowNightWatchReadiness = MEADOW_NIGHT_WATCH_READINESS_VERSION;

  const refresh = () => {
    tickIndex += 1;
    latest = domainKit.describe(collectInput(host, tickIndex));
    host.nightWatchReadiness = latest;
    renderPanel(panel, latest);
    window.requestAnimationFrame(refresh);
  };
  refresh();
}

installNightWatchReadiness().catch((error) => {
  console.error("Failed to install meadow night watch readiness", error);
});
