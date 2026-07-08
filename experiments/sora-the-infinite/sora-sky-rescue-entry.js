import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraSkyRescueReadinessDomainKit } from "../_kits/sora-the-infinite/sora-sky-rescue-readiness-domain-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSoraSkyRescueReadinessDomainKit({ targetRouteId: "the-open-above" });

function ensurePanel() {
  const root = document.querySelector("#app") ?? document.body;
  let panel = document.querySelector("#sora-sky-rescue-panel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "sora-sky-rescue-panel";
  panel.className = "sky-rescue-panel";
  panel.dataset.rendererConsumes = "descriptors-only";
  panel.innerHTML = `
    <header>
      <span>sky rescue</span>
      <strong id="sky-rescue-score">0</strong>
    </header>
    <div class="sky-rescue-course" id="sky-rescue-course"></div>
    <ul class="sky-rescue-list" id="sky-rescue-list"></ul>
  `;
  root.append(panel);
  return panel;
}

function cssPercent(value, fallback = 0) {
  const number = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return `${Math.max(0, Math.min(100, number))}%`;
}

function cssPx(value, fallback = 1) {
  const number = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return `${Math.max(1, number)}px`;
}

function labelList(rescue) {
  const summary = rescue.summary ?? {};
  return [
    ["beacons", summary.heardRescueBeacons ?? 0, "heard beacons"],
    ["islands", summary.reachableStrandedIslands ?? 0, "reachable islands"],
    ["gusts", summary.openGustCorridors ?? 0, "open gust lanes"],
    ["squalls", summary.avoidableShadowSqualls ?? 0, "avoidable squalls"],
    ["tethers", summary.linkedRescueTethers ?? 0, "linked tethers"],
    ["convoy", summary.readyDawnConvoys ?? 0, "ready convoys"]
  ].map(([id, count, label]) => `<li class="${count > 0 ? "open" : "sealed"}"><strong>${count}</strong><span>${label}</span><em>${id}</em></li>`).join("");
}

function renderCourse(container, rescue) {
  const descriptors = rescue.rendererHandoff?.descriptors ?? {};
  const beacons = descriptors.rescueBeaconCalls?.beacons ?? [];
  const islands = descriptors.strandedSkyIslands?.islands ?? [];
  const corridors = descriptors.gustCorridorMap?.corridors ?? [];
  const squalls = descriptors.shadowSquallWarnings?.squalls ?? [];
  const spools = descriptors.rescueTetherSpools?.spools ?? [];
  const convoys = descriptors.dawnHandoffConvoys?.convoys ?? [];
  container.innerHTML = `
    ${beacons.map((beacon) => `<i class="sky-rescue-beacon ${beacon.heard ? "heard" : "lost"}" style="--x:${cssPercent(beacon.x)};--y:${cssPercent(beacon.y)};--v:${beacon.signal}" title="${beacon.label}"></i>`).join("")}
    ${islands.map((island) => `<i class="sky-rescue-island ${island.reachable ? "reachable" : "drifting"}" style="--x:${cssPercent(island.x)};--y:${cssPercent(island.y)};--d:${cssPx(island.radius * 2)};--v:${island.hover}" title="${island.label}"></i>`).join("")}
    ${corridors.map((corridor) => `<i class="sky-rescue-corridor ${corridor.open ? "open" : "closed"} ${corridor.side}" style="--x:${cssPercent(corridor.x)};--y:${cssPercent(corridor.y)};--w:${cssPercent(corridor.width)};--v:${corridor.flow}" title="${corridor.label}"></i>`).join("")}
    ${squalls.map((squall) => `<i class="sky-rescue-squall ${squall.avoidable ? "avoidable" : "danger"}" style="--x:${cssPercent(squall.x)};--y:${cssPercent(squall.y)};--d:${cssPx(squall.radius * 2)};--v:${squall.threat}" title="${squall.label}"></i>`).join("")}
    ${spools.map((spool) => `<i class="sky-rescue-tether ${spool.linked ? "linked" : "slack"}" style="--x:${cssPercent(spool.x)};--y:${cssPercent(spool.y)};--l:${cssPx(spool.length)};--v:${spool.tension}" title="${spool.label}"></i>`).join("")}
    ${convoys.map((convoy) => `<i class="sky-rescue-convoy ${convoy.ready ? "ready" : "forming"}" style="--x:${cssPercent(convoy.x)};--y:${cssPercent(convoy.y)};--w:${cssPercent(convoy.width)};--v:${convoy.commit}" title="${convoy.label}"></i>`).join("")}
  `;
}

function normalizeRescueInput(host) {
  const described = host?.describe?.() ?? {};
  const state = host?.getState?.() ?? {};
  return {
    tick: state.tick ?? described.tick ?? 0,
    readiness: described.readiness ?? state.readiness ?? 0,
    input: state.input ?? described.input ?? {},
    query: globalThis.location?.search ?? "",
    hash: globalThis.location?.hash ?? "",
    routePreview: described,
    launchRehearsal: described.launchRehearsal ?? host?.getLaunchRehearsal?.() ?? {},
    flightplanReadability: described.flightplanReadability ?? host?.getFlightplanReadability?.() ?? {},
    skyNegotiationReadiness: described.skyNegotiationReadiness ?? host?.getSkyNegotiationReadiness?.() ?? {},
    preflightChallengeReadiness: described.preflightChallengeReadiness ?? host?.getPreflightChallengeReadiness?.() ?? {},
    microflightTrialReadiness: described.microflightTrialReadiness ?? host?.getMicroflightTrialReadiness?.() ?? host?.getSoraMicroflightTrialReadiness?.() ?? {}
  };
}

function composeRendererHandoff(base, rescue) {
  const forbiddenOwnership = Array.from(new Set([
    ...(base?.forbiddenOwnership ?? []),
    ...(rescue?.rendererHandoff?.forbiddenOwnership ?? [])
  ]));
  return {
    kind: "sora-sky-rescue-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    forbiddenOwnership,
    descriptors: {
      ...(base?.descriptors ?? {}),
      skyRescueReadiness: rescue?.rendererHandoff?.descriptors ?? {}
    },
    descriptorCounts: {
      ...(base?.descriptorCounts ?? {}),
      ...(rescue?.rendererHandoff?.descriptorCounts ?? {})
    }
  };
}

function patchHost(host, panel) {
  if (!host || host.__soraSkyRescuePatched) return Boolean(host?.__soraSkyRescuePatched);
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const compute = () => domain.describe(normalizeRescueInput(host));
  host.getSkyRescueReadinessDomain = () => domain;
  host.getSkyRescueReadiness = compute;
  host.getSoraSkyRescueReadiness = compute;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.(), compute());
  host.__soraSkyRescuePatched = true;
  globalThis.SoraSkyRescueReadiness = {
    version: "sky-rescue-readiness-renderer-handoff-pass",
    engineSource: NEXUS_ENGINE_CDN,
    engineExportCount: Object.keys(NexusEngineRuntime).length,
    domain,
    getState: compute,
    rendererConsumes: "descriptors-only"
  };
  document.documentElement.dataset.soraSkyRescue = "active";

  const score = panel.querySelector("#sky-rescue-score");
  const course = panel.querySelector("#sky-rescue-course");
  const list = panel.querySelector("#sky-rescue-list");
  const draw = () => {
    const rescue = compute();
    if (score) score.textContent = `${rescue.summary?.readyDawnConvoys ?? 0}/${rescue.dawnHandoffConvoys?.convoys?.length ?? 0}`;
    if (course) renderCourse(course, rescue);
    if (list) list.innerHTML = labelList(rescue);
    globalThis.requestAnimationFrame(draw);
  };
  draw();
  return true;
}

const panel = ensurePanel();
const start = () => {
  if (patchHost(globalThis.GameHost, panel)) return;
  globalThis.requestAnimationFrame(start);
};
start();
