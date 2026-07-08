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

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const KEY = "nexus.peerSceneTransition.v3";
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
  const ambient = handoff.descriptors.ambientVariation;
  const gates = handoff.descriptors.gatePreview;
  const constellation = handoff.descriptors.completionConstellation;
  const hints = handoff.descriptors.puzzleHints;
  const stage = ensureVisualStage();
  stage.innerHTML = `
    <div class="sky-orb"></div>
    <div class="route-line"></div>
    <div class="stage-ground"></div>
    <div class="ambient-field">
      ${ambient.map((particle) => `<i class="ambient-dot layer-${particle.layer} ${particle.active ? "active" : ""}" style="--x:${particle.x}%;--y:${particle.y}%;--s:${particle.scale};--d:${particle.drift};--dot:${particle.color}"></i>`).join("")}
    </div>
    <div class="gate-field">
      ${gates.map((gate) => `<span class="gate-glyph ${gate.open ? "open" : "sealed"} slot-${gate.slot}">${gate.glyph}</span>`).join("")}
    </div>
    <div class="constellation-field">
      ${constellation.stars.map((star) => `<b class="star ${star.lit ? "lit" : ""}" style="--x:${star.x}%;--y:${star.y}%;--r:${star.radius}px" title="${star.label}"></b>`).join("")}
    </div>
    <div class="hint-ribbon">${hints.slice(0, 3).map((hint) => `<em class="${hint.state}">${hint.label}</em>`).join("")}</div>
    ${descriptor.stageLayers.map((layer) => `<span class="stage-layer depth-${layer.depth}" style="--glow:${layer.glow}">${layer.label}</span>`).join("")}
  `;
  document.body.dataset.sceneMood = descriptor.mood;
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
    <div class="meter"><span>Pressure</span><strong>${pressure.score}</strong></div>
    <div class="bar"><i style="width:${pressure.score}%"></i></div>
    <div class="meter"><span>Open gates</span><strong>${domainSnapshot.gates.open}/${domainSnapshot.gates.gates}</strong></div>
    <p class="chips">${state.inventory.length ? state.inventory.map((item) => `<b>${item}</b>`).join("") : "<em>No inventory yet</em>"}</p>
  `;
}

function render(state, msg = "") {
  const scene = manifestKit.get(active);
  const handoff = peerSceneDomainKit.describe(active, state);
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
  const state = load(id);
  pressureKit.evaluate(state);
  save(state);
  render(state);
  globalThis.GameHost = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    getState: () => stateKit.snapshot(JSON.parse(sessionStorage.getItem(KEY))),
    getPeerSceneDomain: () => peerSceneDomainKit.snapshot(active, JSON.parse(sessionStorage.getItem(KEY))),
    getRendererHandoff: () => peerSceneDomainKit.describe(active, JSON.parse(sessionStorage.getItem(KEY))).descriptorCounts,
    reset: () => {
      sessionStorage.removeItem(KEY);
      globalThis.location.href = "./camp.html";
    }
  };
}
