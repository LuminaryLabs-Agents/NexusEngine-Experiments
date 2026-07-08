import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  createPeerSceneDomainKit,
  createSceneActionKit,
  createSceneInventoryKit,
  createSceneManifestKit,
  createScenePressureKit,
  createSceneStateKit,
  createSceneTransitionKit,
  createSceneVisualDescriptorKit,
  logSceneMessage
} from "../../_kits/peer-scene-transition/peer-scene-transition-kits.js";
import { createSceneAtmosphericHandoffKit } from "../../_kits/peer-scene-transition/peer-scene-atmospheric-handoff-kits.js";
import { createSceneChronicleDomainKit } from "../../_kits/peer-scene-transition/peer-scene-chronicle-handoff-kits.js";
import { createSceneConsequenceDomainKit } from "../../_kits/peer-scene-transition/peer-scene-consequence-handoff-kits.js";
import { createSceneDecisionReadabilityDomainKit } from "../../_kits/peer-scene-transition/peer-scene-decision-readability-handoff-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const KEY = "nexus.peerSceneTransition.v6";
let scenes = {};
let active = "camp";
let manifestKit;
let stateKit;
let inventoryKit;
let actionKit;
let transitionKit;
let visualKit;
let pressureKit;
let peerSceneDomainKit;
let atmosphericHandoffKit;
let chronicleDomainKit;
let consequenceDomainKit;
let decisionReadabilityDomainKit;

function load(id) {
  try {
    const raw = sessionStorage.getItem(KEY);
    return stateKit.normalize(raw ? JSON.parse(raw) : null, id);
  } catch {
    return stateKit.fresh(id);
  }
}

function save(state) {
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

function targetEntry(id) {
  return transitionKit.targetEntry(id);
}

function safeStateSnapshot() {
  return JSON.parse(sessionStorage.getItem(KEY) || "null");
}

function describePeerSceneHandoff(state) {
  const baseHandoff = peerSceneDomainKit.describe(active, state);
  const atmospheric = atmosphericHandoffKit.describe(active, state, baseHandoff);
  const chronicle = chronicleDomainKit.describe(active, state, { baseHandoff, atmospheric });
  const consequence = consequenceDomainKit.describe(active, state, { baseHandoff, atmospheric, chronicle });
  const decisionReadability = decisionReadabilityDomainKit.describe(active, state, { baseHandoff, atmospheric, chronicle, consequence });
  return {
    ...baseHandoff,
    descriptors: {
      ...baseHandoff.descriptors,
      atmospheric,
      chronicle,
      consequence,
      decisionReadability
    },
    descriptorCounts: {
      ...baseHandoff.descriptorCounts,
      depthFogBands: atmospheric.counts.depthFogBands,
      lightRays: atmospheric.counts.lightRays,
      relicFocus: atmospheric.counts.relicFocus,
      pathTension: atmospheric.counts.pathTension,
      memoryEchoes: atmospheric.counts.memoryEchoes,
      objectiveBeats: chronicle.counts.objectiveBeats,
      clueThreads: chronicle.counts.clueThreads,
      inventoryStars: chronicle.counts.inventoryStars,
      pressureWeather: chronicle.counts.pressureWeather,
      continuitySplices: chronicle.counts.continuitySplices,
      choiceReadability: chronicle.counts.choiceReadability,
      causeLens: consequence.counts.causeLens,
      riskDelta: consequence.counts.riskDelta,
      allyPresence: consequence.counts.allyPresence,
      routeConsequences: consequence.counts.routeConsequences,
      rewardPreview: consequence.counts.rewardPreview,
      actionLikelihood: decisionReadability.counts.actionLikelihood,
      gateRequirements: decisionReadability.counts.gateRequirements,
      inventoryUseEchoes: decisionReadability.counts.inventoryUseEchoes,
      pressureReleaseWindows: decisionReadability.counts.pressureReleaseWindows,
      narrativeThreadPins: decisionReadability.counts.narrativeThreadPins,
      exitChoiceScorecards: decisionReadability.counts.exitChoiceScorecards
    }
  };
}

function go(state, exitId) {
  const resolution = transitionKit.resolve(state, exitId);
  if (!resolution.accepted) {
    transitionKit.apply(state, resolution);
    const missing = resolution.missing?.join(", ") || resolution.reason;
    logSceneMessage(state, `Blocked ${resolution.label ?? exitId}: missing ${missing}.`);
    pressureKit.evaluate(state);
    save(state);
    render(state, `Blocked: missing ${missing}.`);
    return;
  }
  transitionKit.apply(state, resolution);
  logSceneMessage(state, `Transition accepted: ${resolution.from} -> ${resolution.to}.`);
  pressureKit.evaluate(state);
  save(state);
  globalThis.location.href = targetEntry(resolution.to);
}

function button(parent, label, cls, fn, disabled = false) {
  const element = document.createElement("button");
  element.textContent = label;
  element.className = cls;
  element.disabled = disabled;
  element.addEventListener("click", fn);
  parent.append(element);
}

function ensureVisualStage() {
  let stage = document.querySelector("#scene-stage");
  if (!stage) {
    stage = document.createElement("div");
    stage.id = "scene-stage";
    stage.className = "scene-stage";
    document.querySelector(".hero")?.prepend(stage);
  }
  return stage;
}

function renderVisualStage(handoff) {
  const descriptor = handoff.descriptors.scene;
  const atmospheric = handoff.descriptors.atmospheric;
  const chronicle = handoff.descriptors.chronicle;
  const consequence = handoff.descriptors.consequence;
  const decisionReadability = handoff.descriptors.decisionReadability;
  const ambient = handoff.descriptors.ambientVariation;
  const gates = handoff.descriptors.gatePreview;
  const constellation = handoff.descriptors.completionConstellation;
  const hints = handoff.descriptors.puzzleHints;
  const fogBands = atmospheric?.depthFogBands ?? [];
  const lightRays = atmospheric?.lightRays ?? [];
  const relicFocus = atmospheric?.relicFocus ?? [];
  const pathTension = atmospheric?.pathTension ?? [];
  const memoryEchoes = atmospheric?.memoryEchoes ?? [];
  const chronicleDescriptors = chronicle?.descriptors ?? {};
  const objectiveBeats = chronicleDescriptors.objectiveBeats ?? [];
  const clueThreads = chronicleDescriptors.clueThreads ?? [];
  const inventoryStars = chronicleDescriptors.inventoryConstellation?.stars ?? [];
  const pressureWeather = chronicleDescriptors.pressureWeather ?? [];
  const continuitySplices = chronicleDescriptors.continuitySplices ?? [];
  const choiceReadability = chronicleDescriptors.choiceReadability ?? [];
  const consequenceDescriptors = consequence?.descriptors ?? {};
  const causeLens = consequenceDescriptors.causeLens ?? [];
  const riskDelta = consequenceDescriptors.riskDelta ?? [];
  const allyPresence = consequenceDescriptors.allyPresence ?? [];
  const routeConsequences = consequenceDescriptors.routeConsequences ?? [];
  const rewardPreview = consequenceDescriptors.rewardPreview ?? [];
  const decisionDescriptors = decisionReadability?.descriptors ?? {};
  const actionLikelihood = decisionDescriptors.actionLikelihood ?? [];
  const gateRequirements = decisionDescriptors.gateRequirements ?? [];
  const inventoryUseEchoes = decisionDescriptors.inventoryUseEchoes ?? [];
  const pressureReleaseWindows = decisionDescriptors.pressureReleaseWindows ?? [];
  const narrativeThreadPins = decisionDescriptors.narrativeThreadPins ?? [];
  const exitChoiceScorecards = decisionDescriptors.exitChoiceScorecards ?? [];
  const stage = ensureVisualStage();
  stage.innerHTML = `
    <div class="sky-orb"></div>
    <div class="depth-fog-field">
      ${fogBands.map((band) => `<i class="depth-fog depth-${band.depth}" style="--x:${band.x}%;--y:${band.y}%;--w:${band.width}%;--h:${band.height}px;--o:${band.opacity};--blur:${band.blur}px;--tone:${band.color}"></i>`).join("")}
    </div>
    <div class="light-ray-field">
      ${lightRays.map((ray) => `<i class="light-ray" title="${ray.landmark}" style="--x:${ray.x}%;--y:${ray.y}%;--a:${ray.angle}deg;--l:${ray.length}px;--w:${ray.width}px;--i:${ray.intensity};--tone:${ray.color}"></i>`).join("")}
    </div>
    <div class="route-line"></div>
    <div class="stage-ground"></div>
    <div class="path-tension-field">
      ${pathTension.map((path) => `<span class="path-tension ${path.open ? "open" : "sealed"} slot-${path.slot}" style="--arc:${path.arc};--p:${path.pressure}">${path.open ? "open" : "sealed"}</span>`).join("")}
      ${clueThreads.map((thread) => `<span class="path-tension ${thread.open ? "open" : "sealed"} slot-${thread.slot}" style="--arc:${thread.arc};--p:${thread.pressure}" title="${thread.label}">${thread.open ? "clue" : "need"}</span>`).join("")}
      ${routeConsequences.map((route) => `<span class="path-tension ${route.open ? "open" : "sealed"} slot-${route.slot + 5}" style="--arc:${route.arc};--p:${route.weight}" title="${route.consequence}">${route.open ? "consequence" : "blocked"}</span>`).join("")}
      ${gateRequirements.map((gate) => `<span class="path-tension ${gate.open ? "open" : "sealed"} slot-${gate.rung + 10}" style="--arc:${gate.arc};--p:${gate.height}" title="${gate.label}">${gate.open ? "clear" : gate.missing.length ? gate.missing[0] : "gate"}</span>`).join("")}
      ${exitChoiceScorecards.map((choice) => `<span class="path-tension ${choice.open ? "open" : "sealed"} slot-${choice.slot + 16}" style="--arc:${choice.arc};--p:${choice.score}" title="${choice.label}">score</span>`).join("")}
    </div>
    <div class="ambient-field">
      ${ambient.map((particle) => `<i class="ambient-dot layer-${particle.layer} ${particle.active ? "active" : ""}" style="--x:${particle.x}%;--y:${particle.y}%;--s:${particle.scale};--d:${particle.drift};--dot:${particle.color}"></i>`).join("")}
      ${pressureWeather.map((front) => `<i class="ambient-dot layer-${front.band % 3} active" title="${front.severity}" style="--x:${front.x}%;--y:${front.y}%;--s:${front.spread};--d:${front.opacity};--dot:var(--scene-b)"></i>`).join("")}
      ${riskDelta.map((risk) => `<i class="ambient-dot layer-${risk.band % 3} active" title="${risk.label}" style="--x:${risk.x}%;--y:${risk.y}%;--s:${0.2 + risk.severity};--d:${risk.severity};--dot:var(--scene-c)"></i>`).join("")}
      ${actionLikelihood.map((action) => `<i class="ambient-dot layer-${action.slot % 3} active" title="${action.label}" style="--x:${action.x}%;--y:${action.y}%;--s:${0.4 + action.likelihood};--d:${action.likelihood};--dot:${action.state === "ready" ? "var(--scene-b)" : "var(--scene-c)"}"></i>`).join("")}
    </div>
    <div class="gate-field">
      ${gates.map((gate) => `<span class="gate-glyph ${gate.open ? "open" : "sealed"} slot-${gate.slot}">${gate.glyph}</span>`).join("")}
      ${rewardPreview.slice(0, 4).map((reward) => `<span class="gate-glyph ${reward.state === "available" ? "open" : "sealed"} slot-${reward.slot + 5}" title="${reward.label}">${reward.glyph}</span>`).join("")}
      ${pressureReleaseWindows.slice(0, 3).map((window) => `<span class="gate-glyph ${window.relief > 0.45 ? "open" : "sealed"} slot-${window.slot + 9}" title="${window.label}">${Math.round(window.relief * 100)}%</span>`).join("")}
    </div>
    <div class="constellation-field">
      ${constellation.stars.map((star) => `<b class="star ${star.lit ? "lit" : ""}" style="--x:${star.x}%;--y:${star.y}%;--r:${star.radius}px" title="${star.label}"></b>`).join("")}
      ${inventoryStars.map((star) => `<b class="star ${star.lit ? "lit" : ""}" style="--x:${star.x}%;--y:${star.y}%;--r:${star.radius}px" title="${star.label}"></b>`).join("")}
      ${allyPresence.map((ally) => `<b class="star ${ally.present ? "lit" : ""}" style="--x:${ally.x}%;--y:${ally.y}%;--r:${ally.radius}px" title="${ally.label}"></b>`).join("")}
      ${inventoryUseEchoes.map((echo) => `<b class="star ${echo.relevance === "route-key" ? "lit" : ""}" style="--x:${echo.x}%;--y:${echo.y}%;--r:${4 + Math.round(echo.weight * 5)}px" title="${echo.label}"></b>`).join("")}
    </div>
    <div class="relic-focus-field">
      ${relicFocus.map((relic) => `<b class="relic-focus ${relic.state}" style="--slot:${relic.slot};--pulse:${relic.pulse};--weight:${relic.focusWeight}" title="${relic.label}">${relic.ringCount}</b>`).join("")}
      ${choiceReadability.slice(0, 4).map((choice) => `<b class="relic-focus ${choice.state === "locked" ? "sealed" : choice.state === "resolved" ? "settled" : "callable"}" style="--slot:${choice.slot + 4};--pulse:${choice.pulse};--weight:${0.42 + choice.priority * 0.12}" title="${choice.label}">${choice.glyph}</b>`).join("")}
      ${rewardPreview.slice(0, 4).map((reward) => `<b class="relic-focus ${reward.state === "withheld" ? "sealed" : reward.state === "claimed" ? "settled" : "callable"}" style="--slot:${reward.slot + 8};--pulse:${reward.pulse};--weight:${reward.value}" title="${reward.label}">${reward.glyph}</b>`).join("")}
      ${pressureReleaseWindows.slice(0, 4).map((window) => `<b class="relic-focus callable" style="--slot:${window.slot + 12};--pulse:${window.urgency};--weight:${window.relief}" title="${window.label}">relief</b>`).join("")}
    </div>
    <div class="memory-echo-field">
      ${memoryEchoes.slice(0, 4).map((echo) => `<span class="memory-echo ${echo.type}" style="--slot:${echo.slot};--weight:${echo.weight};--drift:${echo.drift}">${echo.type}</span>`).join("")}
      ${objectiveBeats.map((beat) => `<span class="memory-echo ${beat.done ? "action" : "blocked"}" style="--slot:${beat.slot + 4};--weight:${beat.readiness};--drift:${beat.drift}" title="${beat.label}">${beat.shortLabel}</span>`).join("")}
      ${continuitySplices.map((splice) => `<span class="memory-echo ${splice.current ? "action" : "transition"}" style="--slot:${splice.slot + 9};--weight:${splice.weight};--drift:${splice.arc}" title="${splice.visitedSceneId}">${splice.visitedSceneId}</span>`).join("")}
      ${causeLens.map((cause) => `<span class="memory-echo action" style="--slot:${cause.slot + 13};--weight:${cause.weight};--drift:${cause.drift}" title="${cause.label}">${cause.sourceType}</span>`).join("")}
      ${narrativeThreadPins.map((pin) => `<span class="memory-echo ${pin.current ? "action" : pin.visited ? "transition" : "blocked"}" style="--slot:${pin.slot + 18};--weight:${pin.weight};--drift:${0.12 + pin.orderDelta * 0.08}" title="${pin.label}">${pin.targetSceneId}</span>`).join("")}
    </div>
    <div class="hint-ribbon">${[...hints.slice(0, 3), ...actionLikelihood.slice(0, 2).map((action) => ({ state: action.state === "ready" ? "ready" : "blocked", label: action.state === "ready" ? `Do ${action.label}` : `Need ${action.missing[0] ?? action.label}` }))].map((hint) => `<em class="${hint.state}">${hint.label}</em>`).join("")}</div>
    ${descriptor.stageLayers.map((layer) => `<span class="stage-layer depth-${layer.depth}" style="--glow:${layer.glow}">${layer.label}</span>`).join("")}
  `;
  document.body.dataset.sceneMood = descriptor.mood;
  document.body.dataset.sceneAtmosphere = atmospheric?.phase ?? "unknown";
  document.body.dataset.sceneChronicle = chronicle ? "enabled" : "missing";
  document.body.dataset.sceneConsequence = consequence ? "enabled" : "missing";
  document.body.dataset.sceneDecision = decisionReadability ? "enabled" : "missing";
  document.body.style.setProperty("--scene-a", descriptor.palette[0]);
  document.body.style.setProperty("--scene-b", descriptor.palette[1]);
  document.body.style.setProperty("--scene-c", descriptor.palette[2]);
}

function renderRoutePanel(state) {
  let route = document.querySelector("#route-panel");
  if (!route) {
    route = document.createElement("section");
    route.id = "route-panel";
    route.className = "panel route-panel";
    document.querySelector("#app")?.append(route);
  }
  const graph = peerSceneDomainKit.describe(active, state).descriptors.routeGraph;
  route.innerHTML = `<h2>Route graph</h2><ol>${graph.nodes.map((scene) => {
    return `<li class="${scene.visited ? "seen" : ""} ${scene.current ? "current" : ""}"><span>${scene.title}</span><small>${scene.mood} · ${scene.exitCount} exits</small></li>`;
  }).join("")}</ol>`;
}

function renderStatePanel(state) {
  const pressure = pressureKit.snapshot(state);
  const domainSnapshot = peerSceneDomainKit.snapshot(active, state);
  const atmosphericSnapshot = atmosphericHandoffKit.snapshot(active, state);
  const chronicleSnapshot = chronicleDomainKit.snapshot(active, state);
  const consequenceSnapshot = consequenceDomainKit.snapshot(active, state);
  const decisionSnapshot = decisionReadabilityDomainKit.snapshot(active, state);
  let meters = document.querySelector("#state-panel");
  if (!meters) {
    meters = document.createElement("section");
    meters.id = "state-panel";
    meters.className = "panel state-panel";
    document.querySelector("#app")?.append(meters);
  }
  meters.innerHTML = `
    <h2>Scene state</h2>
    <div class="meter"><span>Completion</span><strong>${domainSnapshot.constellation.completion}%</strong></div>
    <div class="bar"><i style="width:${domainSnapshot.constellation.completion}%"></i></div>
    <div class="meter"><span>Chronicle</span><strong>${chronicleSnapshot.objective.done}/${chronicleSnapshot.objective.beats}</strong></div>
    <div class="bar"><i style="width:${Math.round((chronicleSnapshot.objective.done / chronicleSnapshot.objective.beats) * 100)}%"></i></div>
    <div class="meter"><span>Consequence</span><strong>${consequenceSnapshot.routes.open}/${consequenceSnapshot.routes.routes}</strong></div>
    <div class="bar"><i style="width:${Math.round((consequenceSnapshot.routes.open / Math.max(1, consequenceSnapshot.routes.routes)) * 100)}%"></i></div>
    <div class="meter"><span>Decision readiness</span><strong>${decisionSnapshot.actions.ready}/${decisionSnapshot.actions.radars}</strong></div>
    <div class="bar"><i style="width:${Math.round((decisionSnapshot.actions.ready / Math.max(1, decisionSnapshot.actions.radars)) * 100)}%"></i></div>
    <div class="meter"><span>Pressure</span><strong>${pressure.score}</strong></div>
    <div class="bar"><i style="width:${pressure.score}%"></i></div>
    <div class="meter"><span>Atmosphere</span><strong>${atmosphericSnapshot.phase}</strong></div>
    <div class="meter"><span>Open gates</span><strong>${domainSnapshot.gates.open}/${domainSnapshot.gates.gates}</strong></div>
    <p class="chips">${state.inventory.length ? state.inventory.map((item) => `<b>${item}</b>`).join("") : "<em>No inventory yet</em>"}</p>
  `;
}

function render(state, msg = "") {
  const scene = manifestKit.get(active);
  const handoff = describePeerSceneHandoff(state);
  renderVisualStage(handoff);
  renderRoutePanel(state);
  renderStatePanel(state);
  document.querySelector("#scene-title").textContent = scene.title;
  document.querySelector("#scene-copy").textContent = scene.copy;
  const message = document.querySelector("#message");
  message.textContent = msg || state.log[0] || "";
  message.className = "message " + (String(msg).startsWith("Blocked") ? "bad" : "good");

  const actions = document.querySelector("#actions");
  actions.textContent = "";
  for (const action of actionKit.list(active, state)) {
    const label = action.done ? `${action.label} ✓` : action.blocked ? `${action.label} (${action.blockedLabel ?? action.missing.join(", ")})` : action.label;
    button(actions, label, action.blocked ? "blocked" : "", () => {
      const outcome = actionKit.apply(state, action);
      if (outcome.reset) {
        sessionStorage.removeItem(KEY);
        globalThis.location.href = "./camp.html";
        return;
      }
      if (action.blocked) logSceneMessage(state, `Blocked action: ${action.blockedLabel ?? action.missing.join(", ")}.`);
      else if (outcome.log) logSceneMessage(state, outcome.log);
      pressureKit.evaluate(state);
      save(state);
      render(state);
    }, Boolean(action.blocked || action.done));
  }

  for (const [id, exit] of Object.entries(scene.exits || {})) {
    const missing = inventoryKit.missing(state, exit.requires || []);
    button(actions, missing.length ? `${exit.label} (missing ${missing.join(", ")})` : exit.label, missing.length ? "exit blocked" : "exit", () => go(state, id));
  }

  document.querySelector("#debug").textContent = JSON.stringify({
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExports: Object.keys(NexusEngineRuntime).slice(0, 12),
    manifest: manifestKit.snapshot(),
    actionKit: actionKit.snapshot(active, state),
    transitionKit: transitionKit.snapshot(state),
    visualKit: visualKit.snapshot(active, state),
    atmosphericHandoff: atmosphericHandoffKit.snapshot(active, state),
    chronicleDomain: chronicleDomainKit.snapshot(active, state),
    consequenceDomain: consequenceDomainKit.snapshot(active, state),
    decisionReadabilityDomain: decisionReadabilityDomainKit.snapshot(active, state),
    peerSceneDomain: peerSceneDomainKit.snapshot(active, state),
    rendererHandoff: handoff.descriptorCounts,
    state: stateKit.snapshot(state)
  }, null, 2);
}

export async function bootPeerScene(id) {
  active = id;
  scenes = await fetch("./scenes.json", { cache: "no-store" }).then((response) => response.json());
  manifestKit = createSceneManifestKit(scenes);
  stateKit = createSceneStateKit({ storageKey: KEY, initialSceneId: id });
  inventoryKit = createSceneInventoryKit();
  actionKit = createSceneActionKit({ inventoryKit });
  transitionKit = createSceneTransitionKit({ inventoryKit, manifestKit });
  visualKit = createSceneVisualDescriptorKit({ manifestKit });
  pressureKit = createScenePressureKit();
  peerSceneDomainKit = createPeerSceneDomainKit({ manifestKit, inventoryKit, actionKit, visualKit });
  atmosphericHandoffKit = createSceneAtmosphericHandoffKit({ manifestKit, inventoryKit, actionKit });
  chronicleDomainKit = createSceneChronicleDomainKit({ manifestKit, inventoryKit, actionKit });
  consequenceDomainKit = createSceneConsequenceDomainKit({ manifestKit, inventoryKit, actionKit });
  decisionReadabilityDomainKit = createSceneDecisionReadabilityDomainKit({ manifestKit, inventoryKit, actionKit });
  const state = load(id);
  pressureKit.evaluate(state);
  save(state);
  render(state);
  globalThis.GameHost = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    getState: () => stateKit.snapshot(safeStateSnapshot()),
    getPeerSceneDomain: () => peerSceneDomainKit.snapshot(active, safeStateSnapshot()),
    getAtmosphericHandoff: () => atmosphericHandoffKit.snapshot(active, safeStateSnapshot()),
    getChronicleDomain: () => chronicleDomainKit.snapshot(active, safeStateSnapshot()),
    getConsequenceDomain: () => consequenceDomainKit.snapshot(active, safeStateSnapshot()),
    getDecisionReadabilityDomain: () => decisionReadabilityDomainKit.snapshot(active, safeStateSnapshot()),
    getRendererHandoff: () => describePeerSceneHandoff(safeStateSnapshot()).descriptorCounts,
    reset: () => {
      sessionStorage.removeItem(KEY);
      globalThis.location.href = "./camp.html";
    }
  };
}
