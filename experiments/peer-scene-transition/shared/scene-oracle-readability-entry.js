import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSceneOracleReadabilityDomainKit } from "../../_kits/peer-scene-transition/peer-scene-oracle-readability-handoff-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const ENTRY_VERSION = "peer-scene-oracle-readability-1";

function stableArray(value) {
  return Array.isArray(value) ? value : [];
}

function activeSceneId() {
  return document.querySelector("#app")?.dataset.scene || "camp";
}

function makeManifestKit(scenes) {
  const entries = Object.entries(scenes ?? {}).map(([id, scene]) => ({ id, ...scene }));
  return {
    get(id) {
      return scenes?.[id] ? { id, ...scenes[id] } : null;
    },
    list() {
      return entries;
    }
  };
}

const inventoryKit = {
  missing(state, required = []) {
    const inventory = new Set(stableArray(state?.inventory));
    const tokens = new Set(stableArray(state?.tokens));
    const flags = state?.flags ?? {};
    return stableArray(required).filter((token) => !inventory.has(token) && !tokens.has(token) && !flags[token]);
  }
};

function ensureOraclePanel() {
  let panel = document.querySelector("#oracle-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "oracle-panel";
    panel.className = "panel state-panel oracle-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function ensureStageLayer() {
  const stage = document.querySelector("#scene-stage");
  if (!stage) return null;
  let layer = stage.querySelector(".oracle-readability-field");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "oracle-readability-field";
    stage.append(layer);
  }
  return layer;
}

function renderOracleStage(handoff) {
  const layer = ensureStageLayer();
  if (!layer) return;
  const descriptors = handoff.descriptors ?? {};
  const forecasts = descriptors.objectiveForecastThreads ?? [];
  const clocks = descriptors.pressureClockRings ?? [];
  const resources = descriptors.resourceRouteMaps ?? [];
  const memories = descriptors.memoryBranchEchoes ?? [];
  const debts = descriptors.puzzleDebtStacks ?? [];
  const crowns = descriptors.endingReadinessCrowns ?? [];
  layer.innerHTML = `
    ${forecasts.slice(0, 5).map((thread) => `<span class="path-tension ${thread.missing.length ? "sealed" : "open"}" style="--arc:${thread.arc};--p:${thread.readiness}" title="${thread.label}">${thread.missing.length ? "next" : "clear"}</span>`).join("")}
    ${resources.slice(0, 6).map((route) => `<b class="star ${route.owned ? "lit" : ""}" style="--x:${route.x}%;--y:${route.y}%;--r:${4 + Math.round(route.weight * 7)}px" title="${route.label}"></b>`).join("")}
    ${clocks.slice(0, 4).map((clock) => `<b class="relic-focus ${clock.value > 0.7 ? "sealed" : "callable"}" style="--slot:${clock.slot + 17};--pulse:${clock.urgency};--weight:${0.35 + clock.value * 0.55}" title="${clock.phase}">${Math.round(clock.value * 100)}</b>`).join("")}
    ${debts.slice(0, 4).map((debt) => `<span class="gate-glyph ${debt.missing ? "sealed" : "open"}" title="${debt.label}">${debt.missing ? "debt" : "done"}</span>`).join("")}
    ${memories.slice(0, 4).map((echo) => `<span class="memory-echo ${echo.seen ? "action" : "blocked"}" style="--slot:${echo.slot + 26};--weight:${echo.weight};--drift:${echo.drift}" title="${echo.label}">${echo.targetSceneId}</span>`).join("")}
    ${crowns.map((crown) => `<b class="relic-focus ${crown.complete ? "settled" : crown.readiness > 0.55 ? "callable" : "sealed"}" style="--slot:22;--pulse:${crown.pulse};--weight:${0.42 + crown.readiness * 0.5}" title="${crown.label}">end</b>`).join("")}
  `;
}

function renderOraclePanel(handoff) {
  const panel = ensureOraclePanel();
  const counts = handoff.counts ?? {};
  const crown = handoff.descriptors?.endingReadinessCrowns?.[0];
  const debtMissing = handoff.descriptors?.puzzleDebtStacks?.filter((debt) => debt.missing).length ?? 0;
  const pressure = handoff.descriptors?.pressureClockRings?.[0]?.pressure ?? 0;
  panel.innerHTML = `
    <h2>Oracle route</h2>
    <div class="meter"><span>Ending readiness</span><strong>${Math.round((crown?.readiness ?? 0) * 100)}%</strong></div>
    <div class="bar"><i style="width:${Math.round((crown?.readiness ?? 0) * 100)}%"></i></div>
    <div class="meter"><span>Forecast threads</span><strong>${counts.objectiveForecastThreads ?? 0}</strong></div>
    <div class="meter"><span>Puzzle debt</span><strong>${debtMissing}</strong></div>
    <div class="bar"><i style="width:${Math.max(0, 100 - pressure)}%"></i></div>
    <p class="chips"><b>${ENTRY_VERSION}</b><b>${Object.keys(NexusEngineRuntime).length} Nexus exports</b></p>
  `;
}

function patchGameHost(oracleDomainKit, handoff) {
  const host = globalThis.GameHost;
  if (!host || host.__oracleReadabilityPatched) return;
  const previousRendererHandoff = host.getRendererHandoff?.bind(host);
  host.getOracleReadabilityDomain = () => oracleDomainKit.snapshot(activeSceneId(), host.getState?.() ?? {});
  host.getOracleReadability = () => oracleDomainKit.describe(activeSceneId(), host.getState?.() ?? {});
  host.getRendererHandoff = () => ({
    ...(previousRendererHandoff?.() ?? {}),
    oracleReadability: handoff.counts,
    objectiveForecastThreads: handoff.counts.objectiveForecastThreads,
    pressureClockRings: handoff.counts.pressureClockRings,
    resourceRouteMaps: handoff.counts.resourceRouteMaps,
    memoryBranchEchoes: handoff.counts.memoryBranchEchoes,
    puzzleDebtStacks: handoff.counts.puzzleDebtStacks,
    endingReadinessCrowns: handoff.counts.endingReadinessCrowns
  });
  host.nexusEngineCdn = host.nexusEngineCdn || NEXUS_ENGINE_CDN;
  host.__oracleReadabilityPatched = true;
}

async function bootOracleReadability() {
  const scenes = await fetch("./scenes.json", { cache: "no-store" }).then((response) => response.json());
  const oracleDomainKit = createSceneOracleReadabilityDomainKit({ manifestKit: makeManifestKit(scenes), inventoryKit });
  const render = () => {
    const host = globalThis.GameHost;
    const state = host?.getState?.() ?? {};
    const handoff = oracleDomainKit.describe(activeSceneId(), state);
    renderOracleStage(handoff);
    renderOraclePanel(handoff);
    patchGameHost(oracleDomainKit, handoff);
    document.body.dataset.sceneOracle = "enabled";
  };
  const waitForHost = () => {
    if (!globalThis.GameHost) {
      window.setTimeout(waitForHost, 40);
      return;
    }
    render();
    document.addEventListener("click", () => window.setTimeout(render, 20), true);
    window.addEventListener("storage", render);
  };
  waitForHost();
}

bootOracleReadability().catch((error) => {
  console.error("Peer scene oracle readability failed", error);
});
