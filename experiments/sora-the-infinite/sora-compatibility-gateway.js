import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraCompatibilityDomainKit } from "../_kits/sora-the-infinite/sora-compatibility-domain-kits.js";

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

const domainKit = createSoraCompatibilityDomainKit({ targetPath: TARGET_PATH });
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

function describe() {
  return domainKit.describe({
    tick: state.tick,
    readiness: state.readiness,
    input: state.input,
    query: routeQuery,
    hash: routeHash
  });
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
  const { launchVectors, skyMemoryBands } = handoff.descriptors;
  stage.innerHTML = `
    <div class="horizon-arc"></div>
    ${skyMemoryBands.bands.map((band) => `<i class="sky-memory-band" style="--x:${band.x};--y:${band.y};--w:${band.width};--o:${band.opacity};--h:${band.hue}" title="${band.travelNote}"></i>`).join("")}
    ${launchVectors.lanes.map((lane) => `<i class="launch-vector ${lane.active ? "active" : ""}" style="--bearing:${lane.bearingDeg};--lift:${lane.lift};--drift:${lane.drift}" title="climb ${lane.climbDeg}°"></i>`).join("")}
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
  debugStrip.textContent = JSON.stringify({
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    descriptorCounts: domain.rendererHandoff.descriptorCounts,
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
  launch: () => { globalThis.location.href = describe().continuityGate.href; },
  reset: resetGateway
};
