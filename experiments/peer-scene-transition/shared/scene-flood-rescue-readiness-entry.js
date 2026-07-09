import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SCENE_FLOOD_RESCUE_READINESS_TREE,
  createSceneFloodRescueReadinessDomainKit
} from "./scene-flood-rescue-readiness-kits.js";

const domain = createSceneFloodRescueReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function activeSceneId() {
  return document.querySelector("#app")?.dataset.scene || document.body.dataset.scene || "camp";
}

function ensureOverlay() {
  let root = document.querySelector("#scene-flood-rescue-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #scene-flood-rescue-overlay{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;mix-blend-mode:screen}
    #scene-flood-rescue-overlay i,#scene-flood-rescue-overlay b{position:absolute;display:block;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #scene-flood-rescue-overlay .flood-trace{width:7px;height:7px;border-radius:999px;background:rgba(255,248,186,.78);box-shadow:0 0 16px rgba(255,226,130,.44)}
    #scene-flood-rescue-overlay .flood-gauge{height:4px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(104,218,255,.62),transparent);filter:blur(.25px)}
    #scene-flood-rescue-overlay .flood-canoe{border:1px solid rgba(150,235,255,.72);border-radius:999px;background:radial-gradient(circle,rgba(120,240,255,.22),transparent 68%)}
    #scene-flood-rescue-overlay .flood-rope{height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(255,206,135,.08),rgba(255,206,135,.76),rgba(255,206,135,.08))}
    #scene-flood-rescue-overlay .flood-cache{border:1px dashed rgba(255,235,205,.7);border-radius:14px;background:rgba(255,217,160,.08)}
    #scene-flood-rescue-overlay .flood-roster{width:22px;height:22px;border-radius:999px;border:1px solid rgba(210,238,255,.52);background:rgba(200,235,255,.12)}
    #scene-flood-rescue-overlay .flood-meter{position:absolute;left:16px;bottom:18px;width:158px;height:8px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(4,12,24,.42);overflow:hidden}
    #scene-flood-rescue-overlay .flood-meter em{display:block;height:100%;width:40%;border-radius:inherit;background:linear-gradient(90deg,rgba(88,190,255,.82),rgba(255,230,155,.9))}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "scene-flood-rescue-overlay";
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<b class="flood-meter"><em></em></b>`;
  document.body.append(root);
  return root;
}

function sync(root, className, items, tagName, apply) {
  const safeItems = Array.isArray(items) ? items : [];
  const live = new Set(safeItems.map((item) => item.id));
  for (const item of safeItems) {
    let node = root.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
    if (!node) {
      node = document.createElement(tagName);
      node.className = className;
      node.dataset.id = item.id;
      root.append(node);
    }
    apply(node, item);
  }
  for (const node of [...root.querySelectorAll(`.${className}`)]) {
    if (!live.has(node.dataset.id)) node.remove();
  }
}

function computeReadiness() {
  const host = globalThis.GameHost;
  const state = host?.getState?.() ?? {};
  return domain.describe(activeSceneId(), state);
}

function render(readiness = computeReadiness()) {
  const root = ensureOverlay();
  const descriptors = readiness.rendererHandoff.descriptors;
  sync(root, "flood-trace", descriptors.evacueeTraces, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.opacity = String(item.opacity);
    node.style.transform = `scale(${0.8 + item.urgency})`;
  });
  sync(root, "flood-gauge", descriptors.floodGaugeBands, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.width = pct(item.width01);
    node.style.height = pct(item.height01);
    node.dataset.severity = item.severity;
  });
  sync(root, "flood-canoe", descriptors.canoeMoorings, "i", (node, item) => {
    node.style.left = pct(item.x01 - item.radius01);
    node.style.top = pct(item.y01 - item.radius01);
    node.style.width = pct(item.radius01 * 2);
    node.style.height = pct(item.radius01 * 2);
    node.style.opacity = item.ready ? "0.9" : "0.38";
  });
  sync(root, "flood-rope", descriptors.ropeBridgeSpans, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.width = pct(item.length01);
    node.style.opacity = String(0.38 + item.tension * 0.5);
    node.style.transform = `rotate(${item.angle}deg)`;
  });
  sync(root, "flood-cache", descriptors.warmBlanketCaches, "b", (node, item) => {
    node.style.left = pct(item.x01 - 0.025);
    node.style.top = pct(item.y01 - 0.018);
    node.style.width = pct(0.05 + item.warmth * 0.02);
    node.style.height = pct(0.03 + item.warmth * 0.015);
    node.style.opacity = item.assigned ? "0.82" : "0.36";
  });
  sync(root, "flood-roster", descriptors.dawnRosterLedgers, "b", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.opacity = item.accounted ? "0.84" : "0.32";
  });
  const meter = root.querySelector(".flood-meter em");
  if (meter) meter.style.width = pct(Math.max(0.08, readiness.summary.readiness));
  root.dataset.descriptorCount = String(readiness.rendererHandoff.counts.total);
  root.dataset.phase = readiness.summary.phase;
  document.body.dataset.sceneFloodRescue = readiness.summary.phase;
  return readiness.rendererHandoff;
}

function install(attempt = 0) {
  const host = globalThis.GameHost;
  if (!host?.getState || !host?.getRendererHandoff) {
    if (attempt < 600) requestAnimationFrame(() => install(attempt + 1));
    return;
  }
  if (host.__sceneFloodRescueReadinessInstalled) return;
  host.__sceneFloodRescueReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawGetRendererHandoff = host.getRendererHandoff.bind(host);
  host.getSceneFloodRescueReadiness = () => clone(domain.describe(activeSceneId(), rawGetState() ?? {}));
  host.getFloodRescueReadiness = host.getSceneFloodRescueReadiness;
  host.getSceneFloodRescueReadinessTree = () => SCENE_FLOOD_RESCUE_READINESS_TREE;
  host.getRendererHandoff = () => {
    const base = rawGetRendererHandoff() ?? {};
    const readiness = domain.describe(activeSceneId(), rawGetState() ?? {});
    render(readiness);
    return {
      ...clone(base),
      contract: "renderer-consumes-descriptors-only",
      nexusEngineRuntime: Boolean(NexusEngine),
      sceneFloodRescue: readiness.rendererHandoff.counts.total,
      descriptors: {
        ...(base.descriptors ?? {}),
        sceneFloodRescue: readiness.rendererHandoff.descriptors
      },
      descriptorCounts: {
        ...(base.descriptorCounts ?? base),
        sceneFloodRescue: readiness.rendererHandoff.counts.total
      }
    };
  };
  render(domain.describe(activeSceneId(), rawGetState() ?? {}));
  globalThis.SceneFloodRescueReadiness = { domain, tree: SCENE_FLOOD_RESCUE_READINESS_TREE };
}

install();
