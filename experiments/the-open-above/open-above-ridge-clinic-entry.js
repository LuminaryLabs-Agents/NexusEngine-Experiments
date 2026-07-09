import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE,
  createOpenAboveRidgeClinicReadinessDomainKit
} from "./open-above-ridge-clinic-readiness-kits.js";

const ridgeClinicDomain = createOpenAboveRidgeClinicReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-ridge-clinic-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-ridge-clinic-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-ridge-clinic-overlay .oa-clinic-windsock,
    #open-above-ridge-clinic-overlay .oa-clinic-rope,
    #open-above-ridge-clinic-overlay .oa-clinic-oxygen,
    #open-above-ridge-clinic-overlay .oa-clinic-stretcher,
    #open-above-ridge-clinic-overlay .oa-clinic-flare,
    #open-above-ridge-clinic-overlay .oa-clinic-roster{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-ridge-clinic-overlay .oa-clinic-windsock{height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(145,230,255,.72),rgba(255,255,255,.05));box-shadow:0 0 14px rgba(145,230,255,.22)}
    #open-above-ridge-clinic-overlay .oa-clinic-rope{height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(255,236,160,.04),rgba(255,236,160,.66),rgba(255,236,160,.04));filter:blur(.4px)}
    #open-above-ridge-clinic-overlay .oa-clinic-oxygen{border:1px solid rgba(122,255,226,.64);border-radius:999px;background:radial-gradient(circle,rgba(90,255,224,.32),transparent 70%)}
    #open-above-ridge-clinic-overlay .oa-clinic-stretcher{border:1px dashed rgba(255,214,170,.74);border-radius:999px;background:radial-gradient(circle,rgba(255,190,140,.2),transparent 70%)}
    #open-above-ridge-clinic-overlay .oa-clinic-flare{width:3px;height:15vh;border-radius:999px;background:linear-gradient(180deg,rgba(255,250,190,.9),rgba(255,137,93,.32),transparent);filter:blur(.42px)}
    #open-above-ridge-clinic-overlay .oa-clinic-roster{border:1px solid rgba(190,225,255,.48);border-radius:999px;background:radial-gradient(circle,rgba(185,224,255,.26),transparent 67%)}
    #open-above-ridge-clinic-overlay .oa-clinic-meter{position:absolute;right:16px;top:158px;width:138px;height:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(3,10,22,.38);overflow:hidden}
    #open-above-ridge-clinic-overlay .oa-clinic-meter b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,102,98,.75),rgba(255,222,130,.82),rgba(122,255,226,.82))}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-ridge-clinic-overlay";
  root.setAttribute("aria-hidden", "true");
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.innerHTML = `<div class="oa-clinic-meter"><b></b></div>`;
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

function computeRidgeClinicReadiness(state = {}) {
  return ridgeClinicDomain.compose(state);
}

function withRidgeClinicReadiness(state = {}) {
  const ridgeClinicReadiness = computeRidgeClinicReadiness(state);
  const next = { ...clone(state), ridgeClinicReadiness };
  next.domain = { ...(next.domain ?? {}), openAboveRidgeClinicReadiness: ridgeClinicReadiness };
  return next;
}

function renderRidgeClinicReadiness(state = {}) {
  const root = ensureOverlay();
  const handoff = state.ridgeClinicReadiness?.rendererHandoff ?? computeRidgeClinicReadiness(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-clinic-windsock", descriptors.windsockLandingStrips, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.crosswind - 0.5) * 36}deg)`;
  });
  syncElements(root, "oa-clinic-rope", descriptors.ropeGuideLanes, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.laneConfidence - 0.5) * 20}deg)`;
  });
  syncElements(root, "oa-clinic-oxygen", descriptors.oxygenCrateCaches, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-clinic-stretcher", descriptors.stretcherCircleMarkers, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-clinic-flare", descriptors.clinicFlareTriads, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 52}deg)`;
  });
  syncElements(root, "oa-clinic-roster", descriptors.dawnTransferRosters, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  const meterFill = root.querySelector(".oa-clinic-meter b");
  if (meterFill) meterFill.style.width = pct(Math.max(0.06, Math.min(1, state.ridgeClinicReadiness?.summary?.readiness ?? 0.5)));
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, ridgeClinicReadiness) {
  const clinicHandoff = ridgeClinicReadiness.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveRidgeClinic: clinicHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveRidgeClinic: clinicHandoff.counts.total,
      total: (previousHandoff?.counts?.total ?? 0) + clinicHandoff.counts.total
    }
  };
}

function installWhenReady(attempt = 0) {
  const host = window.GameHost;
  if (!host?.getState || !host?.tick) {
    if (attempt < 600) requestAnimationFrame(() => installWhenReady(attempt + 1));
    return;
  }
  if (host.__openAboveRidgeClinicReadinessInstalled) return;
  host.__openAboveRidgeClinicReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getRidgeClinicReadiness = () => clone(computeRidgeClinicReadiness(rawGetState() ?? {}));
  host.getOpenAboveRidgeClinicReadiness = host.getRidgeClinicReadiness;
  host.getRidgeClinicReadinessTree = () => OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeRidgeClinicReadiness(rawGetState() ?? {}));
  host.getState = () => {
    const state = withRidgeClinicReadiness(rawGetState() ?? {});
    renderRidgeClinicReadiness(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withRidgeClinicReadiness(rawTick(delta, input) ?? {});
    renderRidgeClinicReadiness(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withRidgeClinicReadiness(rawRender() ?? rawGetState() ?? {});
      renderRidgeClinicReadiness(state);
      return state;
    };
  }
  renderRidgeClinicReadiness(host.getState());
  document.body.dataset.openAboveRidgeClinicReadiness = "ready";
  globalThis.OpenAboveRidgeClinicReadiness = { domain: ridgeClinicDomain, tree: OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE };
}

installWhenReady();
