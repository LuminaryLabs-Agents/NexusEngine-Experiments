import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SCENE_TIME_CAPSULE_COURIER_READINESS_TREE,
  createSceneTimeCapsuleCourierReadinessDomainKit
} from "./scene-time-capsule-courier-readiness-kits.js";

const domain = createSceneTimeCapsuleCourierReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function activeSceneId() {
  return document.querySelector("#app")?.dataset.scene || document.body.dataset.scene || "camp";
}

function ensureOverlay() {
  let root = document.querySelector("#scene-time-capsule-courier-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #scene-time-capsule-courier-overlay{position:fixed;inset:0;z-index:4;pointer-events:none;overflow:hidden;mix-blend-mode:screen}
    #scene-time-capsule-courier-overlay i,#scene-time-capsule-courier-overlay b{position:absolute;display:block;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #scene-time-capsule-courier-overlay .capsule-tag{width:9px;height:9px;border-radius:999px;background:rgba(255,232,142,.76);box-shadow:0 0 18px rgba(255,222,120,.44)}
    #scene-time-capsule-courier-overlay .capsule-satchel{border:1px solid rgba(255,224,168,.72);border-radius:7px;background:linear-gradient(135deg,rgba(255,211,120,.18),rgba(120,220,255,.08))}
    #scene-time-capsule-courier-overlay .capsule-thread{height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(120,235,255,.08),rgba(180,244,255,.7),rgba(255,220,120,.14))}
    #scene-time-capsule-courier-overlay .capsule-seal{width:26px;height:26px;border-radius:999px;border:1px solid rgba(190,230,255,.58);background:radial-gradient(circle,rgba(145,220,255,.18),transparent 70%)}
    #scene-time-capsule-courier-overlay .capsule-ledger{height:6px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2)}
    #scene-time-capsule-courier-overlay .capsule-threshold{border:1px solid rgba(255,232,144,.86);border-radius:999px;background:radial-gradient(circle,rgba(255,236,150,.28),rgba(130,220,255,.08),transparent 68%);box-shadow:0 0 30px rgba(255,220,120,.28)}
    #scene-time-capsule-courier-overlay .capsule-meter{position:absolute;right:16px;bottom:18px;width:168px;height:8px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(8,8,20,.42);overflow:hidden}
    #scene-time-capsule-courier-overlay .capsule-meter em{display:block;height:100%;width:20%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,204,110,.88),rgba(125,235,255,.88))}
  `;
  document.head.append(style);
  root = document.createElement("section");
  root.id = "scene-time-capsule-courier-overlay";
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<b class="capsule-meter"><em></em></b>`;
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
  sync(root, "capsule-tag", descriptors.keepsakeTags, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.opacity = item.secured ? "0.9" : "0.42";
    node.style.transform = `scale(${0.8 + item.pulse})`;
  });
  sync(root, "capsule-satchel", descriptors.archiveSatchels, "b", (node, item) => {
    node.style.left = pct(item.x01 - 0.018);
    node.style.top = pct(item.y01 - 0.014);
    node.style.width = pct(0.035 + item.fill * 0.025);
    node.style.height = pct(0.024 + item.fill * 0.018);
    node.style.opacity = item.sealed ? "0.82" : "0.38";
  });
  sync(root, "capsule-thread", descriptors.lanternCourierThreads, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.width = pct(item.length01);
    node.style.opacity = String(0.26 + item.glow * 0.46);
    node.style.transform = `rotate(${item.angle}deg)`;
  });
  sync(root, "capsule-seal", descriptors.gateSeals, "b", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.opacity = item.opened ? "0.86" : "0.34";
    node.dataset.opened = String(item.opened);
  });
  sync(root, "capsule-ledger", descriptors.oathLedgers, "i", (node, item) => {
    node.style.left = pct(item.x01);
    node.style.top = pct(item.y01);
    node.style.width = pct(0.04 + item.confidence * 0.045);
    node.style.opacity = item.signed ? "0.82" : "0.3";
  });
  sync(root, "capsule-threshold", descriptors.timeCapsuleThresholds, "b", (node, item) => {
    node.style.left = pct(item.x01 - item.radius01);
    node.style.top = pct(item.y01 - item.radius01);
    node.style.width = pct(item.radius01 * 2);
    node.style.height = pct(item.radius01 * 2);
    node.dataset.phase = item.phase;
  });
  const meter = root.querySelector(".capsule-meter em");
  if (meter) meter.style.width = pct(Math.max(0.08, readiness.summary.readiness));
  root.dataset.descriptorCount = String(readiness.rendererHandoff.counts.total);
  root.dataset.phase = readiness.summary.phase;
  document.body.dataset.sceneTimeCapsuleCourier = readiness.summary.phase;
  return readiness.rendererHandoff;
}

function install(attempt = 0) {
  const host = globalThis.GameHost;
  if (!host?.getState || !host?.getRendererHandoff) {
    if (attempt < 600) requestAnimationFrame(() => install(attempt + 1));
    return;
  }
  if (host.__sceneTimeCapsuleCourierReadinessInstalled) return;
  host.__sceneTimeCapsuleCourierReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawGetRendererHandoff = host.getRendererHandoff.bind(host);
  host.getSceneTimeCapsuleCourierReadiness = () => clone(domain.describe(activeSceneId(), rawGetState() ?? {}));
  host.getTimeCapsuleCourierReadiness = host.getSceneTimeCapsuleCourierReadiness;
  host.getSceneTimeCapsuleCourierReadinessTree = () => SCENE_TIME_CAPSULE_COURIER_READINESS_TREE;
  host.getRendererHandoff = () => {
    const base = rawGetRendererHandoff() ?? {};
    const readiness = domain.describe(activeSceneId(), rawGetState() ?? {});
    render(readiness);
    return {
      ...clone(base),
      contract: "renderer-consumes-descriptors-only",
      nexusEngineRuntime: Boolean(NexusEngine),
      sceneTimeCapsuleCourier: readiness.rendererHandoff.counts.total,
      descriptors: {
        ...(base.descriptors ?? {}),
        sceneTimeCapsuleCourier: readiness.rendererHandoff.descriptors
      },
      descriptorCounts: {
        ...(base.descriptorCounts ?? base),
        sceneTimeCapsuleCourier: readiness.rendererHandoff.counts.total
      }
    };
  };
  render(domain.describe(activeSceneId(), rawGetState() ?? {}));
  globalThis.SceneTimeCapsuleCourierReadiness = { domain, tree: SCENE_TIME_CAPSULE_COURIER_READINESS_TREE };
}

install();
