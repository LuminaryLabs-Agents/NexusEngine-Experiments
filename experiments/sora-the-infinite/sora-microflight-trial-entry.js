import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraMicroflightTrialReadinessDomainKit } from "../_kits/sora-the-infinite/sora-microflight-trial-readiness-domain-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSoraMicroflightTrialReadinessDomainKit({ targetRouteId: "the-open-above" });

function ensurePanel() {
  const root = document.querySelector("#app") ?? document.body;
  let panel = document.querySelector("#sora-microflight-trial-panel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "sora-microflight-trial-panel";
  panel.className = "microflight-trial-panel";
  panel.dataset.rendererConsumes = "descriptors-only";
  panel.innerHTML = `
    <header>
      <span>microflight trial</span>
      <strong id="microflight-trial-score">0</strong>
    </header>
    <div class="microflight-trial-course" id="microflight-trial-course"></div>
    <ul class="microflight-trial-list" id="microflight-trial-list"></ul>
  `;
  root.append(panel);
  return panel;
}

function cssPercent(value, fallback = 0) {
  const number = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return `${Math.max(0, Math.min(100, number))}%`;
}

function labelList(trial) {
  const summary = trial.summary ?? {};
  return [
    ["tokens", summary.collectedThermalTokens ?? 0, "thermal tokens"],
    ["stamina", summary.stableStaminaSegments ?? 0, "stamina reserve"],
    ["gates", summary.openCrosswindGates ?? 0, "crosswind gates"],
    ["storm", summary.avoidableStormBursts ?? 0, "avoidable bursts"],
    ["medals", summary.earnedSkyMedals ?? 0, "sky medals"],
    ["landing", summary.openLandingRunways ?? 0, "landing windows"]
  ].map(([id, count, label]) => `<li class="${count > 0 ? "open" : "sealed"}"><strong>${count}</strong><span>${label}</span><em>${id}</em></li>`).join("");
}

function renderCourse(container, trial) {
  const descriptors = trial.rendererHandoff?.descriptors ?? {};
  const tokens = descriptors.thermalTokenClusters?.tokens ?? [];
  const stamina = descriptors.glideStaminaRibbons?.segments ?? [];
  const gates = descriptors.crosswindGateWeaves?.gates ?? [];
  const bursts = descriptors.stormBurstAvoidance?.bursts ?? [];
  const medals = descriptors.skyMedalScores?.medals ?? [];
  const runways = descriptors.landingRunwayCommitments?.runways ?? [];
  container.innerHTML = `
    ${tokens.map((token) => `<i class="microflight-token ${token.collected ? "collected" : "cold"}" style="--x:${cssPercent(token.x)};--y:${cssPercent(token.y)};--v:${token.value}" title="${token.label}"></i>`).join("")}
    ${stamina.map((segment) => `<i class="microflight-stamina ${segment.stable ? "stable" : "thin"}" style="--x:${cssPercent(segment.x)};--y:${cssPercent(segment.y)};--w:${segment.width}px;--v:${segment.stamina}" title="${segment.label}"></i>`).join("")}
    ${gates.map((gate) => `<i class="microflight-gate ${gate.open ? "open" : "closed"} ${gate.side}" style="--x:${cssPercent(gate.x)};--y:${cssPercent(gate.y)};--v:${gate.weave}" title="${gate.label}"></i>`).join("")}
    ${bursts.map((burst) => `<i class="microflight-burst ${burst.avoidable ? "avoidable" : "danger"}" style="--x:${cssPercent(burst.x)};--y:${cssPercent(burst.y)};--d:${burst.radius * 2}px;--v:${burst.threat}" title="${burst.label}"></i>`).join("")}
    ${medals.map((medal) => `<i class="microflight-medal ${medal.tier}" style="--i:${medal.index};--v:${medal.value}" title="${medal.label}: ${medal.tier}"></i>`).join("")}
    ${runways.map((runway) => `<i class="microflight-runway ${runway.open ? "open" : "closed"}" style="--x:${cssPercent(runway.x)};--y:${cssPercent(runway.y)};--w:${cssPercent(runway.width)};--v:${runway.commit}" title="${runway.label}"></i>`).join("")}
  `;
}

function normalizeTrialInput(host) {
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
    preflightChallengeReadiness: described.preflightChallengeReadiness ?? host?.getPreflightChallengeReadiness?.() ?? {}
  };
}

function composeRendererHandoff(base, trial) {
  const forbiddenOwnership = Array.from(new Set([
    ...(base?.forbiddenOwnership ?? []),
    ...(trial?.rendererHandoff?.forbiddenOwnership ?? [])
  ]));
  return {
    kind: "sora-microflight-trial-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    forbiddenOwnership,
    descriptors: {
      ...(base?.descriptors ?? {}),
      microflightTrialReadiness: trial?.rendererHandoff?.descriptors ?? {}
    },
    descriptorCounts: {
      ...(base?.descriptorCounts ?? {}),
      ...(trial?.rendererHandoff?.descriptorCounts ?? {})
    }
  };
}

function patchHost(host, panel) {
  if (!host || host.__soraMicroflightTrialPatched) return Boolean(host?.__soraMicroflightTrialPatched);
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const compute = () => domain.describe(normalizeTrialInput(host));
  host.getMicroflightTrialReadinessDomain = () => domain;
  host.getMicroflightTrialReadiness = compute;
  host.getSoraMicroflightTrialReadiness = compute;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.(), compute());
  host.__soraMicroflightTrialPatched = true;
  globalThis.SoraMicroflightTrialReadiness = {
    version: "microflight-trial-readiness-renderer-handoff-pass",
    engineSource: NEXUS_ENGINE_CDN,
    engineExportCount: Object.keys(NexusEngineRuntime).length,
    domain,
    getState: compute,
    rendererConsumes: "descriptors-only"
  };
  document.documentElement.dataset.soraMicroflightTrial = "active";

  const score = panel.querySelector("#microflight-trial-score");
  const course = panel.querySelector("#microflight-trial-course");
  const list = panel.querySelector("#microflight-trial-list");
  const draw = () => {
    const trial = compute();
    if (score) score.textContent = `${trial.summary?.earnedSkyMedals ?? 0}/${trial.skyMedalScores?.medals?.length ?? 0}`;
    if (course) renderCourse(course, trial);
    if (list) list.innerHTML = labelList(trial);
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
