import {
  LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE,
  createLivingAgentFireResponsePolicyKit,
  createLivingAgentMarketFireEvacuationReadinessDomainKit
} from "./market-fire-evacuation-readiness-kits.js";
import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const PASS_ID = "market-fire-evacuation-readiness-renderer-handoff-pass";
const kit = createLivingAgentMarketFireEvacuationReadinessDomainKit();
const policyKit = createLivingAgentFireResponsePolicyKit();
const runtimeSurface = Object.freeze({
  imported: true,
  factoryName: typeof NexusEngine?.createNexusEngine === "function" ? "createNexusEngine" : "module"
});
const initialState = Object.freeze({ seed: 41, inspectedLanterns: 0, clearedAisles: 0, bucketRelays: 0, firebreaksPlaced: 0, musteredMerchants: 0, agentCalls: 0, tick: 0, lastAction: "alarm-raised" });
const state = { ...initialState };
const events = ["[0] Alarm raised. Market evacuation drill active."];
const canvas = document.querySelector("#marketCanvas");
const context = canvas.getContext("2d");
const phaseEl = document.querySelector("#phase");
const readinessEl = document.querySelector("#readiness");
const pressureEl = document.querySelector("#pressure");
const recommendationEl = document.querySelector("#recommendation");
const confidenceEl = document.querySelector("#confidence");
const eventLogEl = document.querySelector("#eventLog");

function clone(value) { return JSON.parse(JSON.stringify(value ?? null)); }
function snapshot() { return kit.describe(state); }
function log(message) { events.unshift(`[${state.tick}] ${message}`); events.splice(12); eventLogEl.textContent = events.join("\n"); }
function cap(key, maximum) { state[key] = Math.min(maximum, state[key] + 1); }

function applyInput(action, source = "operator") {
  if (action === "inspect-lantern") cap("inspectedLanterns", 4);
  if (action === "clear-aisle") cap("clearedAisles", 3);
  if (action === "stage-bucket-relay") cap("bucketRelays", 3);
  if (action === "place-firebreak") cap("firebreaksPlaced", 4);
  if (action === "muster-merchant") cap("musteredMerchants", 5);
  if (action === "new-seed") state.seed = (state.seed * 73 + 19) % 997;
  if (action === "reset") Object.assign(state, initialState);
  if (action === "ask-agent") {
    state.agentCalls += 1;
    const choice = policyKit.choose(state);
    log(`Response agent selected ${choice.action} at ${Math.round(choice.confidence * 100)}% confidence.`);
    return applyInput(choice.action, "agent");
  }
  state.tick += action === "reset" ? 0 : 18;
  state.lastAction = action;
  const result = snapshot();
  if (action === "new-seed") log(`Market route regenerated with seed ${state.seed}.`);
  else if (action === "reset") log("Drill reset. Alarm raised again.");
  else log(`${source} completed ${action}. Readiness ${Math.round(result.readiness * 100)}%.`);
  if (result.phase === "secured") log("All merchants accounted for. Fire line secured before dawn.");
  updateHud(result);
  return clone(result);
}

function updateHud(result = snapshot()) {
  const choice = policyKit.choose(state);
  phaseEl.textContent = result.phase;
  readinessEl.textContent = `${Math.round(result.readiness * 100)}%`;
  pressureEl.textContent = `${Math.round(result.firePressure * 100)}%`;
  recommendationEl.textContent = choice.action;
  confidenceEl.textContent = `confidence ${Math.round(choice.confidence * 100)}%`;
  document.body.dataset.marketFirePhase = result.phase;
}

function resize() {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
}

function path(points) {
  context.beginPath();
  points.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
}

function drawMarketGround(time) {
  const gradient = context.createRadialGradient(470, 320, 40, 470, 320, 620);
  gradient.addColorStop(0, "#2a1b17");
  gradient.addColorStop(0.52, "#14131a");
  gradient.addColorStop(1, "#07080c");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 950, 680);
  context.save();
  context.strokeStyle = "rgba(255,208,110,.055)";
  context.lineWidth = 1;
  for (let x = -80; x < 1040; x += 46) {
    context.beginPath();
    context.moveTo(x + Math.sin(time * 0.0002) * 3, 95);
    context.lineTo(x - 140, 650);
    context.stroke();
  }
  for (let y = 120; y < 660; y += 42) {
    context.beginPath();
    context.moveTo(45, y);
    context.lineTo(905, y + 16);
    context.stroke();
  }
  context.restore();
  context.fillStyle = "rgba(111,213,255,.08)";
  context.fillRect(36, 468, 86, 148);
  context.strokeStyle = "rgba(111,213,255,.38)";
  context.strokeRect(36, 468, 86, 148);
  context.fillStyle = "rgba(255,255,255,.62)";
  context.font = "10px system-ui";
  context.fillText("WELL", 61, 541);
  context.fillStyle = "rgba(143,240,190,.08)";
  context.fillRect(742, 66, 166, 222);
  context.strokeStyle = "rgba(143,240,190,.28)";
  context.strokeRect(742, 66, 166, 222);
  context.fillStyle = "rgba(143,240,190,.82)";
  context.fillText("EAST GATE MUSTER", 759, 92);
}

function drawStalls(descriptors) {
  for (const stall of descriptors) {
    const risk = stall.heatRisk;
    context.save();
    context.translate(stall.x, stall.y);
    context.fillStyle = `rgba(${Math.round(62 + risk * 100)},${Math.round(42 - risk * 12)},${Math.round(32 - risk * 8)},.92)`;
    context.strokeStyle = stall.occupied ? "rgba(255,145,95,.64)" : "rgba(143,240,190,.4)";
    context.lineWidth = 2;
    context.fillRect(0, 0, stall.width, stall.height);
    context.strokeRect(0, 0, stall.width, stall.height);
    context.beginPath();
    context.moveTo(-8, 0);
    context.lineTo(stall.width * 0.5, -stall.height * stall.roofPitch);
    context.lineTo(stall.width + 8, 0);
    context.closePath();
    context.fillStyle = `rgba(${Math.round(120 + risk * 90)},${Math.round(55 + (1 - risk) * 35)},34,.9)`;
    context.fill();
    context.stroke();
    for (let band = 1; band < stall.awningBands; band += 1) {
      const bx = stall.width * band / stall.awningBands;
      context.strokeStyle = "rgba(255,208,110,.22)";
      context.beginPath(); context.moveTo(bx, 0); context.lineTo(bx, stall.height); context.stroke();
    }
    context.restore();
  }
}

function drawSmoke(descriptors, time) {
  for (const corridor of descriptors) {
    context.save();
    path(corridor.points);
    context.lineWidth = corridor.cleared ? 12 : 34;
    context.lineCap = "round";
    context.strokeStyle = corridor.cleared ? "rgba(111,213,255,.22)" : `rgba(126,112,116,${corridor.opacity})`;
    context.setLineDash(corridor.cleared ? [12, 10] : [30 + Math.sin(time * 0.002) * 8, 12]);
    context.stroke();
    context.restore();
  }
}

function drawRelayRoutes(descriptors, time) {
  for (const relay of descriptors) {
    context.save(); path(relay.points); context.lineWidth = relay.staged ? 5 : 2;
    context.strokeStyle = relay.staged ? "rgba(111,213,255,.86)" : "rgba(111,213,255,.16)";
    context.setLineDash(relay.staged ? [7, 9] : [4, 16]); context.lineDashOffset = -time * 0.025 * relay.flow; context.stroke(); context.restore();
  }
}

function drawFirebreaks(descriptors) {
  for (const marker of descriptors) {
    context.save();
    context.fillStyle = marker.placed ? "rgba(143,240,190,.82)" : "rgba(255,145,95,.16)";
    context.strokeStyle = marker.placed ? "rgba(200,255,223,.9)" : "rgba(255,145,95,.52)";
    context.setLineDash(marker.placed ? [] : [5, 5]);
    context.fillRect(marker.x, marker.y - marker.height * 0.5, marker.width, marker.height);
    context.strokeRect(marker.x, marker.y - marker.height * 0.5, marker.width, marker.height);
    context.restore();
  }
}

function drawLanterns(descriptors, time) {
  for (const lantern of descriptors) {
    const pulse = 1 + Math.sin(time * 0.004 + lantern.x) * 0.18;
    context.save(); context.translate(lantern.x, lantern.y); context.beginPath();
    context.arc(0, 0, (lantern.inspected ? 9 : 13) * pulse, 0, Math.PI * 2);
    context.fillStyle = lantern.inspected ? "rgba(143,240,190,.84)" : `rgba(255,145,95,${0.42 + lantern.heat * 0.45})`;
    context.shadowColor = lantern.inspected ? "#8ff0be" : "#ff6c43"; context.shadowBlur = 24; context.fill(); context.restore();
  }
}

function drawMuster(descriptors) {
  for (const token of descriptors) {
    context.save(); context.beginPath(); context.arc(token.x, token.y, 12, 0, Math.PI * 2);
    context.fillStyle = token.accounted ? "rgba(143,240,190,.9)" : "rgba(255,255,255,.08)";
    context.strokeStyle = token.accounted ? "rgba(225,255,238,.95)" : "rgba(255,145,95,.62)";
    context.lineWidth = 2; context.fill(); context.stroke();
    context.fillStyle = token.accounted ? "#0b1a12" : "rgba(255,208,110,.8)";
    context.font = "bold 10px system-ui"; context.textAlign = "center"; context.fillText(token.id.split("-").at(-1), token.x, token.y + 3); context.restore();
  }
}

function drawLedger(result) {
  const ledger = result.rendererHandoff.descriptors.dawnFireSafetyLedgers[0];
  context.save(); context.fillStyle = "rgba(7,8,12,.82)";
  context.strokeStyle = ledger.phase === "secured" ? "rgba(143,240,190,.72)" : "rgba(255,208,110,.26)";
  context.lineWidth = 1.5; context.roundRect(328, 574, 294, 66, 14); context.fill(); context.stroke();
  context.fillStyle = ledger.phase === "secured" ? "#8ff0be" : "#ffd06e";
  context.font = "bold 11px system-ui"; context.textAlign = "left"; context.fillText(ledger.label.toUpperCase(), 346, 597);
  context.fillStyle = "rgba(248,240,223,.72)"; context.font = "10px system-ui";
  context.fillText(`next: ${ledger.recommendedAction}`, 346, 617); context.fillText(`open blockers: ${ledger.blockers.length}`, 500, 617); context.restore();
}

function render(time = 0) {
  const result = snapshot();
  const descriptors = result.rendererHandoff.descriptors;
  const scale = Math.min(innerWidth / 950, innerHeight / 680);
  const offsetX = (innerWidth - 950 * scale) * 0.5;
  const offsetY = (innerHeight - 680 * scale) * 0.5;
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, innerWidth, innerHeight);
  context.save(); context.translate(offsetX, offsetY); context.scale(scale, scale);
  drawMarketGround(time); drawSmoke(descriptors.smokeCorridorMaps, time); drawStalls(descriptors.marketStallLayouts);
  drawRelayRoutes(descriptors.bucketRelayRoutes, time); drawFirebreaks(descriptors.stallFirebreakMarkers);
  drawLanterns(descriptors.emberLanternSensors, time); drawMuster(descriptors.merchantMusterTokens); drawLedger(result);
  context.restore(); requestAnimationFrame(render);
}

document.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", () => applyInput(button.dataset.action)));
addEventListener("resize", resize);
resize(); updateHud(); requestAnimationFrame(render);

globalThis.GameHost = {
  getState: () => clone(state),
  applyInput,
  restart: () => applyInput("reset"),
  getMarketFireEvacuationReadiness: () => clone(snapshot()),
  getLivingAgentMarketFireEvacuationReadiness: () => clone(snapshot()),
  getMarketFireEvacuationTree: () => LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE,
  getRendererHandoff: () => {
    const current = snapshot().rendererHandoff;
    return {
      id: "living-agent-market-fire-evacuation-composed-renderer-handoff",
      runtimeSurface,
      marketFireEvacuation: clone(current),
      descriptors: { marketFireEvacuation: clone(current.descriptors) },
      counts: { marketFireEvacuationDescriptors: current.counts.total, total: current.counts.total }
    };
  }
};
document.body.dataset.marketFireEvacuation = PASS_ID;
