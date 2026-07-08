import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraCompatibilityDomainKit } from "../_kits/sora-the-infinite/sora-compatibility-domain-kits.js";
import { createSoraLaunchRehearsalDomainKit } from "../_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";
import { createSoraFlightplanReadabilityDomainKit } from "../_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const TARGET_PATH = "../the-open-above/";
const root = document.querySelector("#app");
const stage = document.querySelector("#gateway-stage");
const readinessBar = document.querySelector("#readiness-bar");
const readinessValue = document.querySelector("#readiness-value");
const coachingList = document.querySelector("#coaching-list");
const gateList = document.querySelector("#gate-list");
const launchLink = document.querySelector("#launch-link");
const primeButton = document.querySelector("#prime-route");
const debugStrip = document.querySelector("#debug-strip");
const packetList = document.querySelector("#packet-list");
const rehearsalList = document.querySelector("#rehearsal-list");
const flightplanList = document.querySelector("#flightplan-list");

const domainKit = createSoraCompatibilityDomainKit({ targetPath: TARGET_PATH });
const launchRehearsalKit = createSoraLaunchRehearsalDomainKit({ targetRouteId: "the-open-above" });
const flightplanReadabilityKit = createSoraFlightplanReadabilityDomainKit({ targetRouteId: "the-open-above" });
const state = {
  tick: 0,
  readiness: 0.24,
  input: {
    thrust: 0,
    bank: 0,
    climb: 0,
    pointerActive: false,
    pointerX: 0.5,
    pointerY: 0.5,
    launch: false
  }
};

const routeQuery = globalThis.location.search || "";
const routeHash = globalThis.location.hash || "";

function composeRendererHandoff(routePreview, launchRehearsal, flightplanReadability) {
  const forbiddenOwnership = Array.from(new Set([
    ...(routePreview.rendererHandoff?.forbiddenOwnership ?? []),
    ...(launchRehearsal.rendererHandoff?.forbiddenOwnership ?? []),
    ...(flightplanReadability.rendererHandoff?.forbiddenOwnership ?? [])
  ]));
  return {
    kind: "sora-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    forbiddenOwnership,
    descriptors: {
      ...routePreview.rendererHandoff.descriptors,
      launchRehearsal: launchRehearsal.rendererHandoff.descriptors,
      flightplanReadability: flightplanReadability.rendererHandoff.descriptors
    },
    descriptorCounts: {
      ...routePreview.rendererHandoff.descriptorCounts,
      ...launchRehearsal.rendererHandoff.descriptorCounts,
      ...flightplanReadability.rendererHandoff.descriptorCounts
    }
  };
}

function describe() {
  const routePreview = domainKit.describe({
    tick: state.tick,
    readiness: state.readiness,
    input: state.input,
    query: routeQuery,
    hash: routeHash
  });
  const launchRehearsal = launchRehearsalKit.describe({
    tick: state.tick,
    readiness: routePreview.readiness,
    input: state.input,
    query: routeQuery,
    hash: routeHash,
    routePreview
  });
  const flightplanReadability = flightplanReadabilityKit.describe({
    tick: state.tick,
    readiness: routePreview.readiness,
    input: state.input,
    query: routeQuery,
    hash: routeHash,
    routePreview,
    launchRehearsal
  });
  const rendererHandoff = composeRendererHandoff(routePreview, launchRehearsal, flightplanReadability);
  return {
    ...routePreview,
    launchRehearsal,
    flightplanReadability,
    rendererHandoff
  };
}

function setKey(event, active) {
  const key = event.key.toLowerCase();
  if (["w", " "].includes(key)) state.input.thrust = active ? 1 : 0;
  if (key === "a") state.input.bank = active ? -1 : 0;
  if (key === "d") state.input.bank = active ? 1 : 0;
  if (key === "arrowup") state.input.climb = active ? 1 : 0;
  if (key === "arrowdown") state.input.climb = active ? -1 : 0;
  if (active && key === "r") resetGateway();
}

function resetGateway() {
  state.tick = 0;
  state.readiness = 0.24;
  state.input.thrust = 0;
  state.input.bank = 0;
  state.input.climb = 0;
  state.input.launch = false;
}

function updatePointer(event, active = true) {
  const rect = root.getBoundingClientRect();
  const x = (event.clientX - rect.left) / Math.max(1, rect.width);
  const y = (event.clientY - rect.top) / Math.max(1, rect.height);
  state.input.pointerActive = active;
  state.input.pointerX = Math.max(0, Math.min(1, x));
  state.input.pointerY = Math.max(0, Math.min(1, y));
  state.input.bank = (state.input.pointerX - 0.5) * 2;
  state.input.climb = (0.5 - state.input.pointerY) * 2;
  if (active) state.input.thrust = Math.max(state.input.thrust, 0.55);
}

function renderStage(handoff) {
  const {
    launchVectors,
    skyMemoryBands,
    windShearForecast,
    waypointRibbon,
    altitudeEnvelope,
    handoffPackets,
    launchRehearsal,
    flightplanReadability
  } = handoff.descriptors;
  stage.innerHTML = `
    <div class="horizon-arc"></div>
    ${altitudeEnvelope.bands.map((band) => `<i class="altitude-band ${band.active ? "active" : ""}" style="--y:${band.y};--o:${band.opacity};--gate:${band.liftGate}" title="lift gate ${band.liftGate}"></i>`).join("")}
    ${skyMemoryBands.bands.map((band) => `<i class="sky-memory-band" style="--x:${band.x};--y:${band.y};--w:${band.width};--o:${band.opacity};--h:${band.hue}" title="${band.travelNote}"></i>`).join("")}
    ${windShearForecast.cells.map((cell) => `<i class="wind-shear-cell" style="--x:${cell.x};--y:${cell.y};--w:${cell.width};--s:${cell.strength};--d:${cell.drift}" title="${cell.label}"></i>`).join("")}
    ${waypointRibbon.waypoints.map((point) => `<i class="waypoint-node ${point.open ? "open" : "sealed"}" style="--x:${point.x};--y:${point.y};--r:${point.radius};--p:${point.progress}" title="${point.label}"></i>`).join("")}
    ${launchVectors.lanes.map((lane) => `<i class="launch-vector ${lane.active ? "active" : ""}" style="--bearing:${lane.bearingDeg};--lift:${lane.lift};--drift:${lane.drift}" title="climb ${lane.climbDeg}°"></i>`).join("")}
    ${handoffPackets.packets.map((packet, index) => `<i class="handoff-packet ${packet.ready ? "ready" : "pending"}" style="--i:${index};--ready:${packet.ready ? 1 : 0}" title="${packet.label}: ${packet.value}"></i>`).join("")}
    ${launchRehearsal.thermalSlots.slots.map((slot) => `<i class="thermal-slot ${slot.usable ? "usable" : "weak"}" style="--x:${slot.x};--y:${slot.y};--h:${slot.height};--lift:${slot.lift}" title="${slot.label}"></i>`).join("")}
    ${launchRehearsal.driftWarnings.warnings.map((warning, index) => `<i class="drift-warning ${warning.active ? "active" : "quiet"} ${warning.side}" style="--i:${index};--s:${warning.severity}" title="${warning.label}"></i>`).join("")}
    ${launchRehearsal.targetGhosts.ghosts.map((ghost) => `<i class="target-ghost ${ghost.linked ? "linked" : "pending"}" style="--x:${ghost.x};--y:${ghost.y};--o:${ghost.opacity}" title="${ghost.label}"></i>`).join("")}
    ${launchRehearsal.entryCountdown.rings.map((ring) => `<i class="countdown-ring ${ring.open ? "open" : "sealed"}" style="--r:${ring.radius};--i:${ring.index}" title="${ring.label} ${ring.threshold}"></i>`).join("")}
    ${launchRehearsal.controlConfidence.axes.map((axis, index) => `<i class="control-confidence" style="--i:${index};--v:${axis.value}" title="${axis.label}"></i>`).join("")}
    ${flightplanReadability.cloudCoverSlits.slits.map((slit) => `<i class="cloud-cover-slit ${slit.clear ? "clear" : "closed"}" style="--x:${slit.x};--y:${slit.y};--w:${slit.width};--o:${slit.openness}" title="${slit.label}"></i>`).join("")}
    ${flightplanReadability.runwayVectors.vectors.map((vector) => `<i class="runway-vector ${vector.active ? "active" : "cold"}" style="--x:${vector.x};--y:${vector.y};--l:${vector.length};--b:${vector.bearingDeg};--a:${vector.alignment}" title="${vector.label}"></i>`).join("")}
    ${flightplanReadability.launchLaneChoices.lanes.map((lane) => `<i class="launch-lane ${lane.selected ? "selected" : "idle"}" style="--x:${lane.x};--s:${lane.score};--t:${lane.thermal}" title="${lane.label}"></i>`).join("")}
    ${flightplanReadability.energyBudget.segments.map((segment, index) => `<i class="energy-segment ${segment.stable ? "stable" : "thin"}" style="--i:${index};--v:${segment.value}" title="${segment.label}: ${segment.value}"></i>`).join("")}
    ${flightplanReadability.returnAnchors.anchors.map((anchor) => `<i class="return-anchor ${anchor.linked ? "linked" : "pending"}" style="--x:${anchor.x};--y:${anchor.y};--lock:${anchor.lock}" title="${anchor.label}"></i>`).join("")}
    ${flightplanReadability.riskRewardCards.cards.map((card, index) => `<i class="risk-card ${card.state}" style="--i:${index};--v:${card.value}" title="${card.label}: ${card.value}"></i>`).join("")}
  `;
}

function renderTelemetry(domain) {
  const percent = Math.round(domain.readiness * 100);
  readinessBar.style.setProperty("--p", String(percent));
  readinessValue.textContent = `${percent}%`;
  launchLink.href = domain.continuityGate.href;
  launchLink.classList.toggle("ready", domain.continuityGate.open);
  launchLink.textContent = domain.continuityGate.label;
  coachingList.innerHTML = domain.inputCoaching.coaching.map((cue) => `<li class="${cue.active ? "active" : ""}">${cue.label}</li>`).join("");
  gateList.innerHTML = domain.continuityGate.gates.map((gate) => `<li class="${gate.open ? "open" : "sealed"}"><strong>${gate.open ? "✓" : "·"}</strong> ${gate.label}</li>`).join("");
  packetList.innerHTML = domain.handoffPackets.packets.map((packet) => `<li class="${packet.ready ? "open" : "sealed"}"><strong>${packet.ready ? "✓" : "·"}</strong> ${packet.label}</li>`).join("");
  rehearsalList.innerHTML = [
    ...domain.launchRehearsal.preflightChecklist.steps.map((step) => `<li class="${step.complete ? "open" : "sealed"}"><strong>${step.complete ? "✓" : "·"}</strong> ${step.label}</li>`),
    ...domain.launchRehearsal.entryCountdown.rings.slice(-2).map((ring) => `<li class="${ring.open ? "open" : "sealed"}"><strong>${ring.open ? "✓" : "·"}</strong> countdown ${ring.index + 1}</li>`)
  ].join("");
  flightplanList.innerHTML = [
    ...domain.flightplanReadability.energyBudget.segments.map((segment) => `<li class="${segment.stable ? "open" : "sealed"}"><strong>${segment.stable ? "✓" : "·"}</strong> ${segment.label} reserve</li>`),
    ...domain.flightplanReadability.riskRewardCards.cards.map((card) => `<li class="${card.state === "danger" ? "sealed" : "open"}"><strong>${card.state === "danger" ? "!" : "✓"}</strong> ${card.label}</li>`)
  ].join("");
  debugStrip.textContent = JSON.stringify({
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    descriptorCounts: domain.rendererHandoff.descriptorCounts,
    launchRehearsal: domain.launchRehearsal.summary,
    flightplanReadability: domain.flightplanReadability.summary,
    readiness: domain.readiness,
    href: domain.continuityGate.href
  }, null, 2);
}

function frame() {
  state.tick += 1;
  const liftInput = Math.max(0, state.input.thrust) * 0.0028;
  const pointerInput = state.input.pointerActive ? 0.0012 : 0;
  const settle = state.input.thrust > 0 ? 0 : -0.00065;
  state.readiness = Math.max(0.18, Math.min(1, state.readiness + liftInput + pointerInput + settle));
  state.input.launch = false;
  const domain = describe();
  renderStage(domain.rendererHandoff);
  renderTelemetry(domain);
  globalThis.requestAnimationFrame(frame);
}

primeButton.addEventListener("click", () => {
  state.input.launch = true;
  state.input.thrust = 1;
  state.readiness = Math.min(1, state.readiness + 0.18);
});

globalThis.addEventListener("keydown", (event) => setKey(event, true));
globalThis.addEventListener("keyup", (event) => setKey(event, false));
root.addEventListener("pointermove", (event) => updatePointer(event, true));
root.addEventListener("pointerleave", () => {
  state.input.pointerActive = false;
  state.input.thrust = 0;
});
root.addEventListener("pointerdown", (event) => updatePointer(event, true));

const firstDomain = describe();
renderStage(firstDomain.rendererHandoff);
renderTelemetry(firstDomain);
globalThis.requestAnimationFrame(frame);

globalThis.GameHost = {
  nexusEngineCdn: NEXUS_ENGINE_CDN,
  nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
  getState: () => ({ ...state, input: { ...state.input } }),
  describe: () => describe(),
  getRendererHandoff: () => describe().rendererHandoff,
  getRoutePreview: () => {
    const domain = describe();
    return {
      windShearForecast: domain.windShearForecast,
      waypointRibbon: domain.waypointRibbon,
      handoffPackets: domain.handoffPackets,
      altitudeEnvelope: domain.altitudeEnvelope
    };
  },
  getLaunchRehearsal: () => describe().launchRehearsal,
  getFlightplanReadability: () => describe().flightplanReadability,
  launch: () => { globalThis.location.href = describe().continuityGate.href; },
  reset: resetGateway
};
