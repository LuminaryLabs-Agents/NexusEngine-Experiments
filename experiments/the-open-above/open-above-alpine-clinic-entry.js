import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE,
  createOpenAboveAlpineClinicReadinessDomainKit
} from "./open-above-alpine-clinic-readiness-kits.js";

const alpineClinicDomain = createOpenAboveAlpineClinicReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-alpine-clinic-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-alpine-clinic-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-alpine-clinic-overlay .oa-climber-beacon,
    #open-above-alpine-clinic-overlay .oa-triage-marker,
    #open-above-alpine-clinic-overlay .oa-wind-gap,
    #open-above-alpine-clinic-overlay .oa-rope-basket,
    #open-above-alpine-clinic-overlay .oa-medicine-cache,
    #open-above-alpine-clinic-overlay .oa-helipad-smoke{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-alpine-clinic-overlay .oa-climber-beacon{border:1px solid rgba(255,245,188,.72);border-radius:999px;background:radial-gradient(circle,rgba(255,238,171,.44),rgba(255,113,93,.1) 58%,transparent 72%);box-shadow:0 0 26px rgba(255,220,130,.32)}
    #open-above-alpine-clinic-overlay .oa-triage-marker{border:1px solid rgba(160,220,255,.62);border-radius:999px;background:radial-gradient(circle,rgba(125,205,255,.24),transparent 70%)}
    #open-above-alpine-clinic-overlay .oa-wind-gap{height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(185,225,255,.06),rgba(216,245,255,.76),rgba(185,225,255,.06));filter:blur(.5px)}
    #open-above-alpine-clinic-overlay .oa-rope-basket{border:1px dashed rgba(180,255,210,.72);border-radius:999px;background:radial-gradient(circle,rgba(120,255,194,.22),transparent 70%)}
    #open-above-alpine-clinic-overlay .oa-medicine-cache{height:3vh;border:1px solid rgba(255,228,155,.5);border-radius:999px;background:linear-gradient(90deg,rgba(255,228,150,.04),rgba(255,235,165,.34),rgba(255,228,150,.04))}
    #open-above-alpine-clinic-overlay .oa-helipad-smoke{width:4px;height:17vh;border-radius:999px;background:linear-gradient(180deg,rgba(235,248,255,.88),rgba(176,220,255,.26),transparent);filter:blur(.45px)}
    #open-above-alpine-clinic-overlay .oa-clinic-meter{position:absolute;right:16px;top:158px;width:142px;height:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(3,10,22,.38);overflow:hidden}
    #open-above-alpine-clinic-overlay .oa-clinic-meter b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,88,78,.78),rgba(255,230,140,.84),rgba(128,236,255,.82))}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-alpine-clinic-overlay";
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

function computeAlpineClinicReadiness(state = {}) {
  return alpineClinicDomain.compose(state);
}

function withAlpineClinicReadiness(state = {}) {
  const alpineClinicReadiness = computeAlpineClinicReadiness(state);
  const next = { ...clone(state), alpineClinicReadiness };
  next.domain = { ...(next.domain ?? {}), openAboveAlpineClinicReadiness: alpineClinicReadiness };
  return next;
}

function renderAlpineClinicReadiness(state = {}) {
  const root = ensureOverlay();
  const handoff = state.alpineClinicReadiness?.rendererHandoff ?? computeAlpineClinicReadiness(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-climber-beacon", descriptors.strandedClimberBeacons, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-triage-marker", descriptors.hypothermiaTriageMarkers, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-wind-gap", descriptors.windShearGaps, (el, item) => {
    el.style.left = item.side === "left" ? "8vw" : "auto";
    el.style.right = item.side === "right" ? "8vw" : "auto";
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.side === "left" ? -12 : 12}deg)`;
  });
  syncElements(root, "oa-rope-basket", descriptors.ropeBasketDrops, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-medicine-cache", descriptors.medicineCacheGliders, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.cacheNeed - 0.5) * 38}deg)`;
  });
  syncElements(root, "oa-helipad-smoke", descriptors.helipadSmokeSignals, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 54}deg)`;
  });
  const meterFill = root.querySelector(".oa-clinic-meter b");
  const urgency = descriptors.strandedClimberBeacons?.reduce((max, item) => Math.max(max, item.urgency ?? 0), 0) ?? 0;
  const basket = descriptors.ropeBasketDrops?.reduce((max, item) => Math.max(max, item.dropReadiness ?? 0), 0) ?? 0;
  if (meterFill) meterFill.style.width = pct(Math.max(0.06, Math.min(1, (urgency + basket) / 2)));
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, alpineClinicReadiness) {
  const clinicHandoff = alpineClinicReadiness.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveAlpineClinic: clinicHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveAlpineClinic: clinicHandoff.counts.total,
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
  if (host.__openAboveAlpineClinicReadinessInstalled) return;
  host.__openAboveAlpineClinicReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getAlpineClinicReadiness = () => clone(computeAlpineClinicReadiness(rawGetState() ?? {}));
  host.getOpenAboveAlpineClinicReadiness = host.getAlpineClinicReadiness;
  host.getAlpineClinicReadinessTree = () => OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeAlpineClinicReadiness(rawGetState() ?? {}));
  host.getState = () => {
    const state = withAlpineClinicReadiness(rawGetState() ?? {});
    renderAlpineClinicReadiness(state);
    return state;
  };
  host.tick = (delta, inputState) => {
    const state = withAlpineClinicReadiness(rawTick(delta, inputState) ?? {});
    renderAlpineClinicReadiness(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withAlpineClinicReadiness(rawRender() ?? rawGetState() ?? {});
      renderAlpineClinicReadiness(state);
      return state;
    };
  }
  renderAlpineClinicReadiness(host.getState());
  document.body.dataset.openAboveAlpineClinicReadiness = "ready";
  globalThis.OpenAboveAlpineClinicReadiness = { domain: alpineClinicDomain, tree: OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE };
}

installWhenReady();
