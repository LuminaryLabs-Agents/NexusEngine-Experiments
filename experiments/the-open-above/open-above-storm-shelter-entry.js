import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  OPEN_ABOVE_STORM_SHELTER_READINESS_TREE,
  createOpenAboveStormShelterReadinessDomainKit
} from "./open-above-storm-shelter-readiness-kits.js";

const stormShelterDomain = createOpenAboveStormShelterReadinessDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-storm-shelter-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-storm-shelter-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;mix-blend-mode:screen}
    #open-above-storm-shelter-overlay .oa-shelter-beacon,
    #open-above-storm-shelter-overlay .oa-thermal-corridor,
    #open-above-storm-shelter-overlay .oa-blanket-cache,
    #open-above-storm-shelter-overlay .oa-lightning-gap,
    #open-above-storm-shelter-overlay .oa-medicine-sling,
    #open-above-storm-shelter-overlay .oa-valley-flare{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-storm-shelter-overlay .oa-shelter-beacon{border:1px solid rgba(255,242,180,.72);border-radius:999px;background:radial-gradient(circle,rgba(255,232,150,.45),rgba(255,134,95,.09) 58%,transparent 72%);box-shadow:0 0 22px rgba(255,205,120,.28)}
    #open-above-storm-shelter-overlay .oa-thermal-corridor{border:1px solid rgba(120,255,220,.42);border-radius:999px;background:linear-gradient(180deg,rgba(110,255,220,.2),rgba(110,255,220,.03));filter:blur(.3px)}
    #open-above-storm-shelter-overlay .oa-blanket-cache{border:1px solid rgba(255,180,138,.58);border-radius:999px;background:radial-gradient(circle,rgba(255,160,120,.3),transparent 68%)}
    #open-above-storm-shelter-overlay .oa-lightning-gap{height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(190,210,255,.06),rgba(220,235,255,.74),rgba(190,210,255,.06));filter:blur(.6px)}
    #open-above-storm-shelter-overlay .oa-medicine-sling{border:1px dashed rgba(170,255,202,.68);border-radius:999px;background:radial-gradient(circle,rgba(120,255,185,.2),transparent 70%)}
    #open-above-storm-shelter-overlay .oa-valley-flare{width:3px;height:16vh;border-radius:999px;background:linear-gradient(180deg,rgba(255,245,178,.86),rgba(255,170,96,.24),transparent);filter:blur(.45px)}
    #open-above-storm-shelter-overlay .oa-shelter-meter{position:absolute;right:16px;top:142px;width:138px;height:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(3,10,22,.38);overflow:hidden}
    #open-above-storm-shelter-overlay .oa-shelter-meter b{display:block;height:100%;width:50%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,98,84,.76),rgba(255,230,138,.82),rgba(124,255,214,.8))}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-storm-shelter-overlay";
  root.setAttribute("aria-hidden", "true");
  root.dataset.rendererConsumes = "descriptors-only";
  root.dataset.nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
  root.innerHTML = `<div class="oa-shelter-meter"><b></b></div>`;
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

function computeStormShelterReadiness(state = {}) {
  return stormShelterDomain.compose(state);
}

function withStormShelterReadiness(state = {}) {
  const stormShelterReadiness = computeStormShelterReadiness(state);
  const next = { ...clone(state), stormShelterReadiness };
  next.domain = { ...(next.domain ?? {}), openAboveStormShelterReadiness: stormShelterReadiness };
  return next;
}

function renderStormShelterReadiness(state = {}) {
  const root = ensureOverlay();
  const handoff = state.stormShelterReadiness?.rendererHandoff ?? computeStormShelterReadiness(state).rendererHandoff;
  const descriptors = handoff.descriptors ?? {};
  syncElements(root, "oa-shelter-beacon", descriptors.ridgeShelterBeacons, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-thermal-corridor", descriptors.thermalLiftCorridors, (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.height = "3.2vh";
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.lift - 0.5) * 34}deg)`;
  });
  syncElements(root, "oa-blanket-cache", descriptors.blanketCacheWarmth, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-lightning-gap", descriptors.lightningGapWindows, (el, item) => {
    el.style.left = item.side === "left" ? "7vw" : "auto";
    el.style.right = item.side === "right" ? "7vw" : "auto";
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.side === "left" ? -10 : 10}deg)`;
  });
  syncElements(root, "oa-medicine-sling", descriptors.medicineSlingDrops, (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
  });
  syncElements(root, "oa-valley-flare", descriptors.valleyLandingFlares, (el, item) => {
    el.style.left = pct(item.x01);
    el.style.top = pct(item.y01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${(item.alignment - 0.5) * 52}deg)`;
  });
  const shelterPressure = descriptors.ridgeShelterBeacons?.reduce((max, beacon) => Math.max(max, beacon.urgency ?? 0), 0) ?? 0;
  const meterFill = root.querySelector(".oa-shelter-meter b");
  if (meterFill) meterFill.style.width = pct(Math.max(0.06, Math.min(1, shelterPressure)));
  root.dataset.descriptorCount = String(handoff.counts?.total ?? 0);
  return handoff;
}

function composeRendererHandoff(previousHandoff, stormShelterReadiness) {
  const shelterHandoff = stormShelterReadiness.rendererHandoff;
  const descriptors = {
    ...(previousHandoff?.descriptors ?? {}),
    openAboveStormShelter: shelterHandoff.descriptors
  };
  return {
    ...(previousHandoff ?? {}),
    id: "open-above-composed-renderer-handoff",
    contract: "renderer-consumes-descriptors-only",
    nexusEngineRuntime: Boolean(NexusEngine),
    descriptors,
    counts: {
      ...(previousHandoff?.counts ?? {}),
      openAboveStormShelter: shelterHandoff.counts.total,
      total: (previousHandoff?.counts?.total ?? 0) + shelterHandoff.counts.total
    }
  };
}

function installWhenReady(attempt = 0) {
  const host = window.GameHost;
  if (!host?.getState || !host?.tick) {
    if (attempt < 600) requestAnimationFrame(() => installWhenReady(attempt + 1));
    return;
  }
  if (host.__openAboveStormShelterReadinessInstalled) return;
  host.__openAboveStormShelterReadinessInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  const rawHandoff = host.getRendererHandoff?.bind(host);
  host.getStormShelterReadiness = () => clone(computeStormShelterReadiness(rawGetState() ?? {}));
  host.getOpenAboveStormShelterReadiness = host.getStormShelterReadiness;
  host.getStormShelterReadinessTree = () => OPEN_ABOVE_STORM_SHELTER_READINESS_TREE;
  host.getRendererHandoff = () => composeRendererHandoff(rawHandoff?.(), computeStormShelterReadiness(rawGetState() ?? {}));
  host.getState = () => {
    const state = withStormShelterReadiness(rawGetState() ?? {});
    renderStormShelterReadiness(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withStormShelterReadiness(rawTick(delta, input) ?? {});
    renderStormShelterReadiness(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withStormShelterReadiness(rawRender() ?? rawGetState() ?? {});
      renderStormShelterReadiness(state);
      return state;
    };
  }
  renderStormShelterReadiness(host.getState());
  document.body.dataset.openAboveStormShelterReadiness = "ready";
  globalThis.OpenAboveStormShelterReadiness = { domain: stormShelterDomain, tree: OPEN_ABOVE_STORM_SHELTER_READINESS_TREE };
}

installWhenReady();
