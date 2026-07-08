import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSceneEvidenceRitualReadinessDomainKit } from "../../_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSceneEvidenceRitualReadinessDomainKit();
let scenes = null;
let patchedHost = null;

async function loadScenes() {
  if (scenes) return scenes;
  try {
    scenes = await fetch("./scenes.json", { cache: "no-store" }).then((response) => response.json());
  } catch {
    scenes = {};
  }
  return scenes;
}

function currentSceneId() {
  return document.querySelector("#app")?.dataset.scene ?? globalThis.GameHost?.getState?.()?.currentScene ?? "camp";
}

function hostState() {
  try {
    return globalThis.GameHost?.getState?.() ?? { currentScene: currentSceneId(), inventory: [], visitedScenes: [], log: [] };
  } catch {
    return { currentScene: currentSceneId(), inventory: [], visitedScenes: [], log: [] };
  }
}

async function describe() {
  const loadedScenes = await loadScenes();
  return domain.describe({ sceneId: currentSceneId(), state: hostState(), scenes: loadedScenes });
}

function ensurePanel() {
  let panel = document.querySelector("#evidence-ritual-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "evidence-ritual-panel";
    panel.className = "panel evidence-ritual-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function ensureStageLayer() {
  let layer = document.querySelector("#evidence-ritual-stage-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "evidence-ritual-stage-layer";
    layer.className = "evidence-ritual-stage-layer";
    document.querySelector("#scene-stage")?.append(layer);
  }
  return layer;
}

function renderStage(description) {
  const layer = ensureStageLayer();
  const d = description.descriptors;
  layer.innerHTML = `
    <div class="evidence-web-field">
      ${d.witnessStatementWebs.map((web) => `<i class="evidence-web ${web.current ? "current" : web.visited ? "visited" : "cold"}" style="--x:${web.x}%;--y:${web.y}%;--trust:${web.trust}" title="${web.label}"></i>`).join("")}
      ${d.contradictionThreads.slice(0, 8).map((thread) => `<span class="contradiction-thread ${thread.blocked ? "blocked" : "open"}" style="--slot:${thread.slot};--arc:${thread.arc};--tension:${thread.tension}" title="${thread.label}">${thread.blocked ? "missing" : "route"}</span>`).join("")}
    </div>
    <div class="evidence-pin-field">
      ${d.evidenceBoardPins.slice(0, 8).map((pin) => `<b class="evidence-pin ${pin.source}" style="--x:${pin.x}%;--y:${pin.y}%;--weight:${pin.weight}" title="${pin.label}"></b>`).join("")}
    </div>
    <div class="ritual-rune-field">
      ${d.ritualSequenceRunes.map((rune) => `<em class="ritual-rune ${rune.phase}" style="--slot:${rune.slot};--completion:${rune.completion}" title="${rune.sceneId}">${rune.glyph}</em>`).join("")}
    </div>
    <div class="verdict-door-glyph ${d.verdictDoorReadiness[0]?.open ? "open" : "sealed"}" style="--readiness:${d.verdictDoorReadiness[0]?.readiness ?? 0}">verdict</div>
  `;
}

function renderPanel(description) {
  const panel = ensurePanel();
  const dials = description.descriptors.doubtPressureDials;
  const door = description.descriptors.verdictDoorReadiness[0];
  panel.innerHTML = `
    <h2>Evidence ritual</h2>
    <div class="meter"><span>Verdict door</span><strong>${Math.round((door?.readiness ?? 0) * 100)}%</strong></div>
    <div class="bar"><i style="width:${Math.round((door?.readiness ?? 0) * 100)}%"></i></div>
    <div class="evidence-ritual-grid">
      <span><b>${description.counts.witnessStatementWebs}</b><small>witness webs</small></span>
      <span><b>${description.counts.contradictionThreads}</b><small>threads</small></span>
      <span><b>${description.counts.evidenceBoardPins}</b><small>evidence pins</small></span>
      <span><b>${description.counts.ritualSequenceRunes}</b><small>runes</small></span>
    </div>
    <ol class="doubt-dials">${dials.map((dial) => `<li class="${dial.tone}"><span>${dial.label}</span><b>${Math.round(dial.value * 100)}%</b></li>`).join("")}</ol>
  `;
  document.body.dataset.sceneEvidenceRitual = "enabled";
}

async function render() {
  const description = await describe();
  renderStage(description);
  renderPanel(description);
}

async function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || patchedHost === host) return Boolean(host);
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({});
  host.getEvidenceRitualReadinessDomain = () => domain.snapshot({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
  host.getEvidenceRitualReadiness = () => domain.describe({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
  host.getPeerSceneEvidenceRitualReadiness = host.getEvidenceRitualReadiness;
  host.getRendererHandoff = () => {
    const base = previousGetRendererHandoff() ?? {};
    const evidenceRitualReadiness = domain.snapshot({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
    return { ...base, evidenceRitualReadiness };
  };
  host.evidenceRitualNexusEngineCdn = NEXUS_ENGINE_CDN;
  host.evidenceRitualNexusEngineExportCount = Object.keys(NexusEngineRuntime).length;
  patchedHost = host;
  return true;
}

async function tick() {
  await loadScenes();
  await patchGameHost();
  await render();
}

const interval = setInterval(tick, 600);
void tick();
setTimeout(() => clearInterval(interval), 30000);
