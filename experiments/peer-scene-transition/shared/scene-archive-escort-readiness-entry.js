import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSceneArchiveEscortReadinessDomainKit } from "../../_kits/peer-scene-transition/peer-scene-archive-escort-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSceneArchiveEscortReadinessDomainKit();
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

function ensureStyles() {
  if (document.querySelector("#archive-escort-readiness-style")) return;
  const style = document.createElement("style");
  style.id = "archive-escort-readiness-style";
  style.textContent = `
    .archive-escort-panel { border-color: color-mix(in srgb, var(--scene-b, #f6d58a) 55%, transparent); }
    .archive-escort-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.55rem; margin-top:0.8rem; }
    .archive-escort-grid span { border:1px solid color-mix(in srgb, var(--scene-c, #88b8ff) 35%, transparent); border-radius:0.75rem; padding:0.55rem; background:rgba(255,255,255,0.055); }
    .archive-escort-grid b { display:block; font-size:1.05rem; color:var(--scene-b, #f6d58a); }
    .archive-escort-grid small { color:rgba(255,255,255,0.68); text-transform:uppercase; letter-spacing:0.08em; font-size:0.62rem; }
    .archive-escort-route { margin:0.8rem 0 0; padding:0; list-style:none; display:grid; gap:0.35rem; }
    .archive-escort-route li { display:flex; justify-content:space-between; gap:0.5rem; font-size:0.84rem; color:rgba(255,255,255,0.78); }
    .archive-escort-route li.ready b { color:var(--scene-b, #f6d58a); }
    .archive-escort-route li.sealed b { color:var(--scene-c, #88b8ff); }
    .archive-escort-stage-layer { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
    .archive-beacon { position:absolute; left:var(--x); top:var(--y); width:10px; height:10px; border-radius:999px; background:var(--scene-b, #f6d58a); box-shadow:0 0 calc(18px + 22px * var(--u)) var(--scene-b, #f6d58a); opacity:calc(0.28 + var(--u) * 0.62); transform:translate(-50%,-50%) scale(calc(0.65 + var(--u))); }
    .archive-thread { position:absolute; left:8%; right:8%; top:calc(18% + var(--slot) * 5%); height:2px; background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--scene-c, #88b8ff) calc(25% + var(--strength) * 65%), transparent), transparent); opacity:calc(0.2 + var(--strength) * 0.65); transform:rotate(calc(-14deg + var(--arc) * 26deg)); }
    .archive-thread.open { filter:drop-shadow(0 0 8px var(--scene-b, #f6d58a)); }
    .archive-sentinel { position:absolute; right:calc(8% + var(--slot) * 9%); bottom:12%; width:14px; height:28px; border-radius:999px 999px 0 0; border:1px solid var(--scene-b, #f6d58a); opacity:calc(0.25 + var(--strength) * 0.7); box-shadow:0 0 calc(12px + var(--strength) * 20px) var(--scene-c, #88b8ff); }
    .archive-door-glyph { margin-top:0.8rem; padding:0.55rem 0.65rem; border-radius:0.75rem; background:linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); color:rgba(255,255,255,0.86); }
  `;
  document.head.append(style);
}

function ensurePanel() {
  let panel = document.querySelector("#archive-escort-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "archive-escort-panel";
    panel.className = "panel archive-escort-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function ensureStageLayer() {
  const stage = document.querySelector("#scene-stage");
  if (!stage) return null;
  if (getComputedStyle(stage).position === "static") stage.style.position = "relative";
  let layer = document.querySelector("#archive-escort-stage-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "archive-escort-stage-layer";
    layer.className = "archive-escort-stage-layer";
    stage.append(layer);
  }
  return layer;
}

function renderStage(description) {
  const layer = ensureStageLayer();
  if (!layer) return;
  const d = description.descriptors;
  layer.innerHTML = `
    ${d.archivistBeacons.map((beacon) => `<i class="archive-beacon ${beacon.current ? "current" : beacon.visited ? "visited" : "cold"}" style="--x:${beacon.x}%;--y:${beacon.y}%;--u:${beacon.urgency}" title="${beacon.label}"></i>`).join("")}
    ${d.memoryMapThreads.slice(0, 9).map((thread) => `<i class="archive-thread ${thread.open ? "open" : "sealed"}" style="--slot:${thread.slot};--arc:${thread.arc};--strength:${thread.threadStrength}" title="${thread.label}"></i>`).join("")}
    ${d.oathSentinelPosts.map((post) => `<i class="archive-sentinel ${post.guarded ? "guarded" : "thin"}" style="--slot:${post.slot};--strength:${post.strength}" title="${post.glyph}"></i>`).join("")}
  `;
}

function renderPanel(description) {
  const panel = ensurePanel();
  const door = description.descriptors.archiveDoorReadiness[0];
  const tokens = description.descriptors.safePassageTokens;
  panel.innerHTML = `
    <h2>Archive escort</h2>
    <div class="meter"><span>Archive door</span><strong>${Math.round((door?.readiness ?? 0) * 100)}%</strong></div>
    <div class="bar"><i style="width:${Math.round((door?.readiness ?? 0) * 100)}%"></i></div>
    <div class="archive-escort-grid">
      <span><b>${description.counts.archivistBeacons}</b><small>beacons</small></span>
      <span><b>${description.counts.memoryMapThreads}</b><small>map threads</small></span>
      <span><b>${description.counts.oathSentinelPosts}</b><small>sentinels</small></span>
      <span><b>${description.counts.lanternSupplyCaches}</b><small>supply caches</small></span>
      <span><b>${description.counts.safePassageTokens}</b><small>passage tokens</small></span>
      <span><b>${description.descriptors.lanternSupplyCaches.filter((cache) => cache.ready).length}</b><small>ready cache</small></span>
    </div>
    <ol class="archive-escort-route">${tokens.slice(0, 6).map((token) => `<li class="${token.ready ? "ready" : token.sealed ? "sealed" : "partial"}"><span>${token.label}</span><b>${Math.round(token.clearance * 100)}%</b></li>`).join("")}</ol>
    <div class="archive-door-glyph ${door?.open ? "open" : "sealed"}">escort ${door?.open ? "open" : "assembling"}</div>
  `;
  document.body.dataset.sceneArchiveEscort = "enabled";
}

async function render() {
  ensureStyles();
  const description = await describe();
  renderStage(description);
  renderPanel(description);
}

async function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || patchedHost === host) return Boolean(host);
  const previousGetRendererHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({});
  host.getArchiveEscortReadinessDomain = () => domain.snapshot({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
  host.getArchiveEscortReadiness = () => domain.describe({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
  host.getPeerSceneArchiveEscortReadiness = host.getArchiveEscortReadiness;
  host.getArchiveEscortReadinessTree = () => domain.tree;
  host.getRendererHandoff = () => {
    const base = previousGetRendererHandoff() ?? {};
    const archiveEscortReadiness = domain.snapshot({ sceneId: currentSceneId(), state: hostState(), scenes: scenes ?? {} });
    return { ...base, archiveEscortReadiness };
  };
  host.archiveEscortNexusEngineCdn = NEXUS_ENGINE_CDN;
  host.archiveEscortNexusEngineExportCount = Object.keys(NexusEngineRuntime).length;
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
