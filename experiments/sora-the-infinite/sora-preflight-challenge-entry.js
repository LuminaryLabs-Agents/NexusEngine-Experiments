import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraPreflightChallengeReadinessDomainKit } from "../_kits/sora-the-infinite/sora-preflight-challenge-readiness-domain-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSoraPreflightChallengeReadinessDomainKit({ targetRouteId: "the-open-above" });

function ensurePanel() {
  const root = document.querySelector("#app") ?? document.body;
  let panel = document.querySelector("#sora-preflight-challenge-panel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "sora-preflight-challenge-panel";
  panel.className = "preflight-challenge-panel";
  panel.dataset.rendererConsumes = "descriptors-only";
  panel.innerHTML = `
    <header>
      <span>preflight challenge</span>
      <strong id="preflight-challenge-score">0</strong>
    </header>
    <div class="preflight-challenge-radar" id="preflight-challenge-radar"></div>
    <ul class="preflight-challenge-list" id="preflight-challenge-list"></ul>
  `;
  root.append(panel);
  return panel;
}

function cssPercent(value, fallback = 0) {
  const number = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return `${Math.max(0, Math.min(100, number))}%`;
}

function labelList(challenge) {
  const summary = challenge.summary ?? {};
  return [
    ["gust", summary.openGustSyncRings ?? 0, "open sync rings"],
    ["tether", summary.linkedVelocityTethers ?? 0, "linked velocity beads"],
    ["altitude", summary.signedAltitudeContracts ?? 0, "signed altitude bands"],
    ["cloud", summary.openCloudCorridors ?? 0, "open cloud locks"],
    ["tempo", summary.strongTempoScores ?? 0, "strong route tempos"],
    ["oath", summary.sealedLandingOaths ?? 0, "sealed landing oaths"]
  ].map(([id, count, label]) => `<li class="${count > 0 ? "open" : "sealed"}"><strong>${count}</strong><span>${label}</span><em>${id}</em></li>`).join("");
}

function renderRings(container, challenge) {
  const descriptors = challenge.rendererHandoff?.descriptors ?? {};
  const rings = descriptors.gustSyncRings?.rings ?? [];
  const beads = descriptors.velocityTetherBeads?.beads ?? [];
  const bands = descriptors.altitudeContractBands?.bands ?? [];
  const locks = descriptors.cloudCorridorLocks?.locks ?? [];
  const tempos = descriptors.routeTempoScores?.scores ?? [];
  const oaths = descriptors.landingOathSeals?.seals ?? [];
  container.innerHTML = `
    ${rings.map((ring) => `<i class="preflight-gust-ring ${ring.open ? "open" : "offbeat"}" style="--x:${cssPercent(ring.x)};--y:${cssPercent(ring.y)};--d:${ring.radius * 2}px;--v:${ring.sync}" title="${ring.label}"></i>`).join("")}
    ${beads.map((bead) => `<i class="preflight-tether-bead ${bead.linked ? "linked" : "slack"}" style="--x:${cssPercent(bead.x)};--y:${cssPercent(bead.y)};--v:${bead.tension}" title="${bead.label}"></i>`).join("")}
    ${bands.map((band) => `<i class="preflight-altitude-band ${band.signed ? "signed" : "thin"}" style="--y:${cssPercent(band.y)};--w:${cssPercent(band.width)};--v:${band.contract}" title="${band.label}"></i>`).join("")}
    ${locks.map((lock) => `<i class="preflight-cloud-lock ${lock.open ? "open" : "locked"}" style="--x:${cssPercent(lock.x)};--y:${cssPercent(lock.y)};--v:${lock.lock}" title="${lock.label}"></i>`).join("")}
    ${tempos.map((score) => `<i class="preflight-tempo-score ${score.state}" style="--i:${score.index};--v:${score.value}" title="${score.label}"></i>`).join("")}
    ${oaths.map((seal) => `<i class="preflight-oath-seal ${seal.sealed ? "sealed" : "loose"}" style="--x:${cssPercent(seal.x)};--y:${cssPercent(seal.y)};--v:${seal.seal}" title="${seal.label}"></i>`).join("")}
  `;
}

function composeRendererHandoff(base, challenge) {
  const forbiddenOwnership = Array.from(new Set([
    ...(base?.forbiddenOwnership ?? []),
    ...(challenge?.rendererHandoff?.forbiddenOwnership ?? [])
  ]));
  return {
    kind: "sora-preflight-challenge-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    forbiddenOwnership,
    descriptors: {
      ...(base?.descriptors ?? {}),
      preflightChallengeReadiness: challenge?.rendererHandoff?.descriptors ?? {}
    },
    descriptorCounts: {
      ...(base?.descriptorCounts ?? {}),
      ...(challenge?.rendererHandoff?.descriptorCounts ?? {})
    }
  };
}

function normalizeChallengeInput(host) {
  const described = host?.describe?.() ?? {};
  const state = host?.getState?.() ?? {};
  return {
    tick: state.tick ?? described.tick ?? 0,
    readiness: described.readiness ?? state.readiness ?? 0,
    input: state.input ?? described.input ?? {},
    query: globalThis.location?.search ?? "",
    hash: globalThis.location?.hash ?? "",
    routePreview: described,
    launchRehearsal: described.launchRehearsal ?? {},
    flightplanReadability: described.flightplanReadability ?? {},
    skyNegotiationReadiness: described.skyNegotiationReadiness ?? {}
  };
}

function patchHost(host, panel) {
  if (!host || host.__soraPreflightChallengePatched) return Boolean(host?.__soraPreflightChallengePatched);
  const originalHandoff = host.getRendererHandoff?.bind(host);
  const compute = () => domain.describe(normalizeChallengeInput(host));
  host.getPreflightChallengeReadiness = compute;
  host.getSoraPreflightChallengeReadiness = compute;
  host.getRendererHandoff = () => composeRendererHandoff(originalHandoff?.(), compute());
  host.__soraPreflightChallengePatched = true;
  globalThis.SoraPreflightChallengeReadiness = {
    version: "preflight-challenge-readiness-renderer-handoff-pass",
    engineSource: NEXUS_ENGINE_CDN,
    engineExportCount: Object.keys(NexusEngineRuntime).length,
    domain,
    getState: compute,
    rendererConsumes: "descriptors-only"
  };
  document.documentElement.dataset.soraPreflightChallenge = "active";

  const score = panel.querySelector("#preflight-challenge-score");
  const radar = panel.querySelector("#preflight-challenge-radar");
  const list = panel.querySelector("#preflight-challenge-list");
  const draw = () => {
    const challenge = compute();
    if (score) score.textContent = `${challenge.summary?.descriptorCount ?? 0}`;
    if (radar) renderRings(radar, challenge);
    if (list) list.innerHTML = labelList(challenge);
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
