import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSceneCluePressureReadinessDomainKit } from "../../_kits/peer-scene-transition/peer-scene-clue-pressure-handoff-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const ENTRY_VERSION = "peer-scene-clue-pressure-readiness-1";

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

function normalizeHostState(raw = {}) {
  return {
    ...raw,
    currentSceneId: raw.currentSceneId ?? raw.currentScene ?? activeSceneId(),
    visitedSceneIds: raw.visitedSceneIds ?? raw.visitedScenes ?? [activeSceneId()],
    blockedLedger: raw.blockedLedger ?? raw.blockedTransitions ?? [],
    actionLedger: raw.actionLedger ?? raw.actions ?? [],
    transitionLedger: raw.transitionLedger ?? raw.acceptedTransitions ?? [],
    log: raw.log ?? raw.latestLog ?? []
  };
}

function ensureCluePanel() {
  let panel = document.querySelector("#clue-pressure-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "clue-pressure-panel";
    panel.className = "panel state-panel clue-pressure-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function ensureStageLayer() {
  const stage = document.querySelector("#scene-stage");
  if (!stage) return null;
  let layer = stage.querySelector(".clue-pressure-field");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "clue-pressure-field";
    stage.append(layer);
  }
  return layer;
}

function renderClueStage(handoff) {
  const layer = ensureStageLayer();
  if (!layer) return;
  const descriptors = handoff.descriptors ?? {};
  const lanterns = descriptors.clueVisibilityLanterns ?? [];
  const traces = descriptors.suspectThreadTraces ?? [];
  const pips = descriptors.objectivePressurePips ?? [];
  const fog = descriptors.misdirectionFogBanks ?? [];
  const gaps = descriptors.evidenceGapCards ?? [];
  const locks = descriptors.resolutionRouteLocks ?? [];
  layer.innerHTML = `
    ${lanterns.slice(0, 8).map((lantern) => `<b class="star ${lantern.owned ? "lit" : ""}" style="--x:${lantern.x}%;--y:${lantern.y}%;--r:${4 + Math.round(lantern.brightness * 7)}px" title="${lantern.label}"></b>`).join("")}
    ${traces.slice(0, 6).map((trace) => `<span class="path-tension ${trace.sealedExits ? "sealed" : "open"} slot-${trace.slot + 24}" style="--arc:${trace.arc};--p:${trace.suspicion}" title="${trace.label}">${trace.visited ? "seen" : "trace"}</span>`).join("")}
    ${pips.slice(0, 5).map((pip) => `<b class="relic-focus ${pip.missing ? "sealed" : "settled"}" style="--slot:${pip.slot + 24};--pulse:${pip.urgency};--weight:${0.35 + pip.urgency * 0.5}" title="${pip.label}">${pip.missing ? "need" : "ok"}</b>`).join("")}
    ${fog.slice(0, 6).map((bank) => `<i class="ambient-dot layer-${bank.exitId.length % 3} active" style="--x:${bank.x}%;--y:${bank.y}%;--s:${0.4 + bank.density};--d:${bank.density};--dot:var(--scene-c)" title="${bank.label}"></i>`).join("")}
    ${gaps.slice(0, 6).map((gap) => `<span class="gate-glyph ${gap.missing ? "sealed" : "open"}" title="${gap.label}">${gap.severity}</span>`).join("")}
    ${locks.slice(0, 4).map((lock) => `<span class="path-tension ${lock.unlocked ? "open" : "sealed"} slot-${lock.slot + 32}" style="--arc:${0.12 + lock.slot * 0.12};--p:${lock.readiness}" title="${lock.label}">${lock.unlocked ? "route" : "lock"}</span>`).join("")}
  `;
}

function renderCluePanel(handoff) {
  const panel = ensureCluePanel();
  const counts = handoff.counts ?? {};
  const summary = handoff.summary ?? {};
  const critical = handoff.descriptors?.evidenceGapCards?.filter((gap) => gap.severity === "critical").length ?? 0;
  const visibility = Math.round((summary.clueVisibility ?? 0) * 100);
  panel.innerHTML = `
    <h2>Clue pressure</h2>
    <div class="meter"><span>Clue visibility</span><strong>${visibility}%</strong></div>
    <div class="bar"><i style="width:${visibility}%"></i></div>
    <div class="meter"><span>Evidence gaps</span><strong>${summary.missingEvidence ?? 0}</strong></div>
    <div class="meter"><span>Open routes</span><strong>${summary.openRoutes ?? 0}</strong></div>
    <div class="meter"><span>Critical cards</span><strong>${critical}</strong></div>
    <p class="chips"><b>${ENTRY_VERSION}</b><b>${counts.clueVisibilityLanterns ?? 0} lanterns</b><b>${Object.keys(NexusEngineRuntime).length} Nexus exports</b></p>
  `;
}

function patchGameHost(cluePressureDomainKit) {
  const host = globalThis.GameHost;
  if (!host || host.__cluePressureReadinessPatched) return;
  const previousRendererHandoff = host.getRendererHandoff?.bind(host);
  const describeLiveCluePressure = () => cluePressureDomainKit.describe(activeSceneId(), normalizeHostState(host.getState?.() ?? {}));
  host.getCluePressureReadinessDomain = () => cluePressureDomainKit.snapshot(activeSceneId(), normalizeHostState(host.getState?.() ?? {}));
  host.getCluePressureReadiness = () => describeLiveCluePressure();
  host.getRendererHandoff = () => {
    const handoff = describeLiveCluePressure();
    return {
      ...(previousRendererHandoff?.() ?? {}),
      cluePressureReadiness: handoff.counts,
      clueVisibilityLanterns: handoff.counts.clueVisibilityLanterns,
      suspectThreadTraces: handoff.counts.suspectThreadTraces,
      objectivePressurePips: handoff.counts.objectivePressurePips,
      misdirectionFogBanks: handoff.counts.misdirectionFogBanks,
      evidenceGapCards: handoff.counts.evidenceGapCards,
      resolutionRouteLocks: handoff.counts.resolutionRouteLocks
    };
  };
  host.nexusEngineCdn = host.nexusEngineCdn || NEXUS_ENGINE_CDN;
  host.__cluePressureReadinessPatched = true;
}

async function bootCluePressureReadiness() {
  const scenes = await fetch("./scenes.json", { cache: "no-store" }).then((response) => response.json());
  const cluePressureDomainKit = createSceneCluePressureReadinessDomainKit({ manifestKit: makeManifestKit(scenes), inventoryKit });
  const render = () => {
    const host = globalThis.GameHost;
    const state = normalizeHostState(host?.getState?.() ?? {});
    const handoff = cluePressureDomainKit.describe(activeSceneId(), state);
    renderClueStage(handoff);
    renderCluePanel(handoff);
    patchGameHost(cluePressureDomainKit);
    document.body.dataset.sceneCluePressure = "enabled";
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

bootCluePressureReadiness().catch((error) => {
  console.error("Peer scene clue pressure readiness failed", error);
});
