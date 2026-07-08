import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE,
  createOpenAboveAerialCourierReadinessDomainKit
} from "./open-above-aerial-courier-readiness-kits.js";

const aerialCourierDomain = createOpenAboveAerialCourierReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-aerial-courier-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-aerial-courier-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-aerial-courier-overlay .oa-courier-pouch,
    #open-above-aerial-courier-overlay .oa-courier-ribbon,
    #open-above-aerial-courier-overlay .oa-courier-shear,
    #open-above-aerial-courier-overlay .oa-courier-drop,
    #open-above-aerial-courier-overlay .oa-courier-dock{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-aerial-courier-overlay .oa-courier-pouch{border:1px solid rgba(255,235,155,.64);border-radius:999px;background:radial-gradient(circle,rgba(255,232,130,.42),rgba(255,160,70,.08) 58%,transparent 70%);box-shadow:0 0 18px rgba(255,210,90,.3)}
    #open-above-aerial-courier-overlay .oa-courier-ribbon{border:1px solid rgba(140,235,255,.38);border-radius:999px;background:radial-gradient(circle,rgba(120,235,255,.16),transparent 66%)}
    #open-above-aerial-courier-overlay .oa-courier-comfort{position:absolute;right:16px;top:118px;width:126px;height:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(3,10,22,.38);overflow:hidden}
    #open-above-aerial-courier-overlay .oa-courier-comfort b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,120,96,.74),rgba(130,255,202,.8))}
    #open-above-aerial-courier-overlay .oa-courier-shear{height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,100,92,.08),rgba(255,112,92,.7),rgba(255,100,92,.08));filter:blur(.8px)}
    #open-above-aerial-courier-overlay .oa-courier-drop{border:1px dashed rgba(170,255,188,.6);border-radius:999px;background:radial-gradient(circle,rgba(140,255,180,.18),transparent 70%)}
    #open-above-aerial-courier-overlay .oa-courier-dock{width:3px;height:18vh;border-radius:999px;background:linear-gradient(180deg,rgba(190,228,255,.8),transparent);filter:blur(.5px)}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-aerial-courier-overlay";
  root.setAttribute("aria-hidden", "true");
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.innerHTML = `<div class="oa-courier-comfort"><b></b></div>`;
  document.body.appendChild(root);
  return root;
}

function syncElements(root, className, items, render) {
  const safeItems = Array.isArray(items) ? items : [];
  const live = new Set(safeItems.map((item) => item.id));
  for (const item of safeItems) {
    let element = root.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
    if (!element) {
      element = document.createElement("i");
      element.className = className;
      element.dataset.id = item.id;
      root.appendChild(element);
    }
    render(element, item);
  }
  for (const element of [...root.querySelectorAll(`.${className}`)]) {
    if (!live.has(element.dataset.id)) element.remove();
  }
}

function computeAerialCourierReadiness(state = {}) {
  return aerialCourierDomain.compose(state);
}

function withAerialCourierReadiness(state = {}) {
  const aerialCourierReadiness = computeAerialCourierReadiness(state);
  const next = { ...clone(state), aerialCourierReadiness };
  next.domain = { ...(next.domain ?? {}), openAboveAerialCourierReadiness: aerialCourierReadiness };
  return next;
}

function renderAerialCourierReadiness(state = {}) {
  const root = ensureOverlay();
  const handoff = state.aerialCourierReadiness?.rendererHandoff ?? computeAerialCourierReadiness(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-courier-pouch", descriptors.courierPouchTargets, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-courier-ribbon", descriptors.ribbonCheckpoints, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  const comfort = descriptors.comfortStabilityMeters?.[0]?.comfort ?? 0.5;
  const comfortFill = root.querySelector(".oa-courier-comfort b");
  if (comfortFill) comfortFill.style.width = pct(Math.max(0.04, Math.min(1, comfort)));
  syncElements(root, "oa-courier-shear", descriptors.stormShearWarnings, (el, item) => {
    el.style.left = item.side === "left" ? "6vw" : "auto";
    el.style.right = item.side === "right" ? "6vw" : "auto";
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.side === "left" ? -8 : 8}deg)`;
  });
  syncElements(root, "oa-courier-drop", descriptors.meadowDropZones, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-courier-dock", descriptors.returnDockBeacons, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 46}deg)`;
  });
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, aerialCourierReadiness) {
  const courierHandoff = aerialCourierReadiness.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveAerialCourier: courierHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveAerialCourier: courierHandoff.counts.total,
      total: (previousHandoff?.counts?.total ?? 0) + courierHandoff.counts.total
    }
  };
}

function installWhenReady(attempt = 0) {
  const host = window.GameHost;
  if (!host?.getState || !host?.tick) {
    if (attempt < 600) requestAnimationFrame(() => installWhenReady(attempt + 1));
    return;
  }
  if (host.__openAboveAerialCourierReadinessInstalled) return;
  host.__openAboveAerialCourierReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getAerialCourierReadiness = () => clone(computeAerialCourierReadiness(rawGetState() ?? {}));
  host.getOpenAboveAerialCourierReadiness = host.getAerialCourierReadiness;
  host.getAerialCourierReadinessTree = () => OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeAerialCourierReadiness(rawGetState() ?? {}));
  host.getState = () => {
    const state = withAerialCourierReadiness(rawGetState() ?? {});
    renderAerialCourierReadiness(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withAerialCourierReadiness(rawTick(delta, input) ?? {});
    renderAerialCourierReadiness(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withAerialCourierReadiness(rawRender() ?? rawGetState() ?? {});
      renderAerialCourierReadiness(state);
      return state;
    };
  }
  renderAerialCourierReadiness(host.getState());
  document.body.dataset.openAboveAerialCourierReadiness = "ready";
  globalThis.OpenAboveAerialCourierReadiness = { domain: aerialCourierDomain, tree: OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE };
}

installWhenReady();
