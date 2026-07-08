import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE,
  createOpenAboveFlightRouteReadabilityDomainKit
} from "./open-above-flight-route-readability-kits.js";

const flightRouteDomain = createOpenAboveFlightRouteReadabilityDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-flight-route-readability-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-flight-route-readability-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-flight-route-readability-overlay .oa-route-updraft,
    #open-above-flight-route-readability-overlay .oa-route-ridge,
    #open-above-flight-route-readability-overlay .oa-route-landing,
    #open-above-flight-route-readability-overlay .oa-route-draft,
    #open-above-flight-route-readability-overlay .oa-route-home{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-flight-route-readability-overlay .oa-route-updraft{height:14vh;border-radius:999px;background:linear-gradient(180deg,rgba(124,255,232,.05),rgba(124,255,232,.34),rgba(124,255,232,.03));filter:blur(16px)}
    #open-above-flight-route-readability-overlay .oa-route-ridge{height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(255,120,96,.12),rgba(255,230,160,.72),rgba(255,120,96,.12));filter:blur(.6px)}
    #open-above-flight-route-readability-overlay .oa-route-landing{border:1px solid rgba(170,255,190,.48);border-radius:999px;background:radial-gradient(circle,rgba(128,255,190,.22),transparent 66%)}
    #open-above-flight-route-readability-overlay .oa-route-draft{height:6px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.45),transparent);filter:blur(2px)}
    #open-above-flight-route-readability-overlay .oa-route-meter{position:absolute;left:18px;top:118px;width:118px;height:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(4,12,24,.35);overflow:hidden}
    #open-above-flight-route-readability-overlay .oa-route-meter b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,118,92,.7),rgba(149,255,197,.76))}
    #open-above-flight-route-readability-overlay .oa-route-home{width:3px;height:20vh;border-radius:999px;background:linear-gradient(180deg,rgba(200,230,255,.74),transparent);filter:blur(.4px)}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-flight-route-readability-overlay";
  root.setAttribute("aria-hidden", "true");
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.innerHTML = `<div class="oa-route-meter"><b></b></div>`;
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

function computeFlightRouteReadability(state = {}) {
  return flightRouteDomain.compose(state);
}

function withFlightRouteReadability(state = {}) {
  const flightRouteReadability = computeFlightRouteReadability(state);
  const next = { ...clone(state), flightRouteReadability };
  next.domain = { ...(next.domain ?? {}), openAboveFlightRouteReadability: flightRouteReadability };
  return next;
}

function renderFlightRouteReadability(state = {}) {
  const root = ensureOverlay();
  const handoff = state.flightRouteReadability?.rendererHandoff ?? computeFlightRouteReadability(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-route-updraft", descriptors.updraftCorridors, (el, item) => {
    el.style.left = pct(item.x01 - item.width01 / 2);
    el.style.top = pct(item.y01 - 0.07);
    el.style.width = pct(item.width01);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-route-ridge", descriptors.ridgeHazardShelves, (el, item) => {
    el.style.left = item.side === "left" ? "4vw" : "auto";
    el.style.right = item.side === "right" ? "4vw" : "auto";
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.side === "left" ? -9 : 9}deg)`;
  });
  syncElements(root, "oa-route-landing", descriptors.landingMeadowGhosts, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-route-draft", descriptors.flockDraftWakes, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-route-home", descriptors.homewardBearingThreads, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 42}deg)`;
  });
  const meter = root.querySelector(".oa-route-meter b");
  const reserve = descriptors.altitudeReserveMeters?.[0]?.reserve ?? 0.5;
  meter.style.width = pct(Math.max(0.04, Math.min(1, reserve)));
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, flightRouteReadability) {
  const routeHandoff = flightRouteReadability.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveFlightRoute: routeHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveFlightRoute: routeHandoff.counts.total,
      total: (previousHandoff?.counts?.total ?? 0) + routeHandoff.counts.total
    }
  };
}

function installWhenReady(attempt = 0) {
  const host = window.GameHost;
  if (!host?.getState || !host?.tick) {
    if (attempt < 600) requestAnimationFrame(() => installWhenReady(attempt + 1));
    return;
  }
  if (host.__openAboveFlightRouteReadabilityInstalled) return;
  host.__openAboveFlightRouteReadabilityInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getFlightRouteReadability = () => clone(computeFlightRouteReadability(rawGetState() ?? {}));
  host.getOpenAboveFlightRouteReadability = host.getFlightRouteReadability;
  host.getFlightRouteReadabilityTree = () => OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeFlightRouteReadability(rawGetState() ?? {}));
  host.getState = () => {
    const state = withFlightRouteReadability(rawGetState() ?? {});
    renderFlightRouteReadability(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withFlightRouteReadability(rawTick(delta, input) ?? {});
    renderFlightRouteReadability(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withFlightRouteReadability(rawRender() ?? rawGetState() ?? {});
      renderFlightRouteReadability(state);
      return state;
    };
  }
  renderFlightRouteReadability(host.getState());
  globalThis.OpenAboveFlightRouteReadability = { domain: flightRouteDomain, tree: OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE };
}

installWhenReady();
