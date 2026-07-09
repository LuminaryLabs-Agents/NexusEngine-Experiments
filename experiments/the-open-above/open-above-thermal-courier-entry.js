import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE,
  createOpenAboveThermalCourierRescueReadinessDomainKit
} from "./open-above-thermal-courier-readiness-kits.js";

const thermalCourierDomain = createOpenAboveThermalCourierRescueReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-thermal-courier-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-thermal-courier-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-thermal-courier-overlay .oa-thermal-ring,
    #open-above-thermal-courier-overlay .oa-draft-ribbon,
    #open-above-thermal-courier-overlay .oa-sling-cargo,
    #open-above-thermal-courier-overlay .oa-anchor-buoy,
    #open-above-thermal-courier-overlay .oa-signal-mirror,
    #open-above-thermal-courier-overlay .oa-dawn-ledger{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-thermal-courier-overlay .oa-thermal-ring{border:1px solid rgba(255,226,118,.68);border-radius:999px;background:radial-gradient(circle,rgba(255,220,105,.22),transparent 69%);box-shadow:0 0 20px rgba(255,206,90,.24)}
    #open-above-thermal-courier-overlay .oa-draft-ribbon{height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(116,231,255,.05),rgba(116,231,255,.72),rgba(255,255,255,.04));filter:blur(.35px)}
    #open-above-thermal-courier-overlay .oa-sling-cargo{border:1px dashed rgba(255,190,116,.72);border-radius:999px;background:radial-gradient(circle,rgba(255,170,110,.22),transparent 68%)}
    #open-above-thermal-courier-overlay .oa-anchor-buoy{border:1px solid rgba(128,255,206,.66);border-radius:999px;background:radial-gradient(circle,rgba(112,255,206,.26),transparent 68%)}
    #open-above-thermal-courier-overlay .oa-signal-mirror{width:4px;height:14vh;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(157,220,255,.38),transparent);filter:blur(.4px)}
    #open-above-thermal-courier-overlay .oa-dawn-ledger{border:1px solid rgba(226,238,255,.46);border-radius:999px;background:radial-gradient(circle,rgba(230,238,255,.22),transparent 65%)}
    #open-above-thermal-courier-overlay .oa-courier-meter{position:absolute;right:16px;top:188px;width:154px;height:8px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(3,10,22,.42);overflow:hidden}
    #open-above-thermal-courier-overlay .oa-courier-meter b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,120,98,.78),rgba(255,226,118,.86),rgba(128,255,206,.86))}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-thermal-courier-overlay";
  root.setAttribute("aria-hidden", "true");
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.innerHTML = `<div class="oa-courier-meter"><b></b></div>`;
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

function computeThermalCourierReadiness(state = {}) {
  return thermalCourierDomain.compose(state);
}

function withThermalCourierReadiness(state = {}) {
  const thermalCourierReadiness = computeThermalCourierReadiness(state);
  const next = { ...clone(state), thermalCourierReadiness };
  next.domain = { ...(next.domain ?? {}), openAboveThermalCourierReadiness: thermalCourierReadiness };
  return next;
}

function renderThermalCourierReadiness(state = {}) {
  const root = ensureOverlay();
  const handoff = state.thermalCourierReadiness?.rendererHandoff ?? computeThermalCourierReadiness(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-thermal-ring", descriptors.thermalLanternRings, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-draft-ribbon", descriptors.draftRibbonLanes, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.laneStability - 0.5) * 28}deg)`;
  });
  syncElements(root, "oa-sling-cargo", descriptors.basketSlingCargos, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-anchor-buoy", descriptors.landingAnchorBuoys, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-signal-mirror", descriptors.cliffSignalMirrors, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 54}deg)`;
  });
  syncElements(root, "oa-dawn-ledger", descriptors.dawnFlightLedgers, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  const meterFill = root.querySelector(".oa-courier-meter b");
  if (meterFill) meterFill.style.width = pct(Math.max(0.06, Math.min(1, state.thermalCourierReadiness?.summary?.readiness ?? 0.5)));
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, thermalCourierReadiness) {
  const courierHandoff = thermalCourierReadiness.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveThermalCourier: courierHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-thermal-courier-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveThermalCourier: courierHandoff.counts.total,
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
  if (host.__openAboveThermalCourierReadinessInstalled) return;
  host.__openAboveThermalCourierReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getThermalCourierReadiness = () => clone(computeThermalCourierReadiness(rawGetState() ?? {}));
  host.getOpenAboveThermalCourierReadiness = host.getThermalCourierReadiness;
  host.getThermalCourierReadinessTree = () => OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeThermalCourierReadiness(rawGetState() ?? {}));
  host.getState = () => {
    const state = withThermalCourierReadiness(rawGetState() ?? {});
    renderThermalCourierReadiness(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withThermalCourierReadiness(rawTick(delta, input) ?? {});
    renderThermalCourierReadiness(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withThermalCourierReadiness(rawRender() ?? rawGetState() ?? {});
      renderThermalCourierReadiness(state);
      return state;
    };
  }
  renderThermalCourierReadiness(host.getState());
  document.body.dataset.openAboveThermalCourierReadiness = "ready";
  globalThis.OpenAboveThermalCourierReadiness = { domain: thermalCourierDomain, tree: OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE };
}

installWhenReady();
