import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraStormglassCourierReadinessDomainKit } from "../_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js";

export const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domain = createSoraStormglassCourierReadinessDomainKit();
const canvas = document.querySelector("#sky");
const context = canvas.getContext("2d", { alpha: false });
const ui = {
  readiness: document.querySelector("#readiness"),
  readinessBar: document.querySelector("#readinessBar"),
  signals: document.querySelector("#signals"),
  cargo: document.querySelector("#cargo"),
  speed: document.querySelector("#speed"),
  phase: document.querySelector("#phase"),
  event: document.querySelector("#event"),
  score: document.querySelector("#score"),
  complete: document.querySelector("#complete"),
  completeCopy: document.querySelector("#completeCopy"),
  restart: document.querySelector("#restart")
};

let state = domain.createInitialState(741);
const keys = new Set();
const touch = new Set();
let previousTime = performance.now();
let pixelRatio = 1;
let width = 1;
let height = 1;

const engineHost = NexusEngineRuntime.createNexusHost?.({
  id: "sora-stormglass-courier-host",
  revision: "stormglass-courier-001",
  provides: ["sora-stormglass-courier-readiness"]
}) ?? { id: "sora-stormglass-courier-host", lifecycle: { state: "ready" } };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function currentInput() {
  return {
    pitch: (keys.has("KeyW") || keys.has("ArrowUp") || touch.has("pitch-up") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") || touch.has("pitch-down") ? 1 : 0),
    bank: (keys.has("KeyD") || keys.has("ArrowRight") || touch.has("bank-right") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") || touch.has("bank-left") ? 1 : 0),
    boost: keys.has("Space") || touch.has("boost"),
    brake: keys.has("ShiftLeft") || keys.has("ShiftRight")
  };
}

function restart(seed = (state.seed + 97) % 1000000) {
  state = domain.createInitialState(seed);
  ui.complete.classList.remove("open");
  previousTime = performance.now();
  return clone(state);
}

function applyInput(action = {}) {
  const input = typeof action === "string" ? { action } : action;
  if (input.action === "restart") return restart(input.seed);
  if (input.action === "set-state" && input.state) {
    state = { ...domain.createInitialState(input.state.seed ?? state.seed), ...clone(input.state) };
    return clone(state);
  }
  state = domain.step({ state, input, dt: input.dt ?? 1 / 60 });
  return clone(state);
}

Object.assign(engineHost, {
  getState: () => clone(state),
  applyInput,
  tick(input = {}) {
    state = domain.step({ state, input: input.input ?? input, dt: input.dt ?? 1 / 60 });
    return clone(state);
  },
  restart,
  describe: () => domain.describe(state),
  getStormglassCourierReadiness: () => domain.describe(state),
  getSoraStormglassCourierReadiness: () => domain.describe(state),
  getStormglassCourierTree: () => domain.tree,
  getRendererHandoff: () => domain.describe(state).rendererHandoff
});

globalThis.GameHost = engineHost;
globalThis.SoraStormglassCourier = Object.freeze({
  version: "stormglass-courier-readiness-renderer-handoff-pass",
  engineSource: NEXUS_ENGINE_CDN,
  engineExportCount: Object.keys(NexusEngineRuntime).length,
  domain,
  host: engineHost,
  rendererConsumes: "descriptors-only"
});
document.documentElement.dataset.soraStormglassCourier = "active";

function resize() {
  pixelRatio = Math.min(2, globalThis.devicePixelRatio || 1);
  width = Math.max(1, innerWidth);
  height = Math.max(1, innerHeight);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function point(descriptor) {
  return { x: descriptor.x * width, y: descriptor.y * height };
}

function drawSky(tick) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#20375f");
  gradient.addColorStop(0.58, "#0c1a31");
  gradient.addColorStop(1, "#050912");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 0.22;
  for (let index = 0; index < 24; index += 1) {
    const x = ((index * 173 + tick * (4 + index % 3)) % (width + 180)) - 90;
    const y = 50 + (index * 89) % Math.max(80, height * 0.56);
    const radius = 18 + (index % 5) * 9;
    const cloud = context.createRadialGradient(x, y, 2, x, y, radius * 2.4);
    cloud.addColorStop(0, "rgba(220,238,255,.75)");
    cloud.addColorStop(1, "rgba(220,238,255,0)");
    context.fillStyle = cloud;
    context.beginPath();
    context.arc(x, y, radius * 2.4, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.fillStyle = "rgba(2,6,12,.72)";
  context.beginPath();
  context.moveTo(0, height);
  for (let x = 0; x <= width + 80; x += 80) {
    const y = height * 0.86 - Math.sin(x * 0.012 + state.seed) * 24 - ((x / 80) % 3) * 12;
    context.lineTo(x, y);
  }
  context.lineTo(width, height);
  context.closePath();
  context.fill();
}

function drawThermals(items) {
  for (const lane of items) {
    const p = point(lane);
    const radius = lane.radius * Math.min(width, height);
    context.save();
    context.translate(p.x, p.y);
    context.strokeStyle = "rgba(255,218,143,.38)";
    context.lineWidth = 2;
    for (let ring = 0; ring < 4; ring += 1) {
      context.beginPath();
      context.ellipse(0, ring * -9, radius * (0.45 + ring * 0.17), radius * (0.15 + ring * 0.035), -0.25, 0, Math.PI * 1.65);
      context.stroke();
    }
    context.restore();
  }
}

function drawStorms(items, time) {
  for (const cell of items) {
    const p = point(cell);
    const radius = cell.radius * Math.min(width, height);
    const gradient = context.createRadialGradient(p.x, p.y, radius * 0.08, p.x, p.y, radius);
    gradient.addColorStop(0, `rgba(174,143,255,${0.35 + cell.charge * 0.25})`);
    gradient.addColorStop(0.48, "rgba(64,61,117,.58)");
    gradient.addColorStop(1, "rgba(16,20,45,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(p.x, p.y, radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(210,196,255,.55)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(p.x, p.y, radius * (0.52 + Math.sin(time * 0.004 + cell.x * 9) * 0.08), 0, Math.PI * 2);
    context.stroke();
  }
}

function drawBuoys(items, time) {
  for (const buoy of items) {
    const p = point(buoy);
    const pulse = 7 + Math.sin(time * 0.006 + buoy.frequency) * 3;
    context.strokeStyle = buoy.tuned ? "rgba(139,255,223,.85)" : "rgba(116,220,255,.82)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(p.x, p.y, 12 + pulse, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = buoy.tuned ? "#a8ffe6" : "#8edcff";
    context.beginPath();
    context.moveTo(p.x, p.y - 8);
    context.lineTo(p.x + 7, p.y + 7);
    context.lineTo(p.x - 7, p.y + 7);
    context.closePath();
    context.fill();
  }
}

function drawRunway(items) {
  const runway = items[0];
  if (!runway) return;
  const p = point(runway);
  const w = runway.width * width;
  const h = runway.height * height;
  context.save();
  context.translate(p.x, p.y);
  context.fillStyle = runway.open ? "rgba(136,255,218,.2)" : "rgba(135,161,188,.12)";
  context.strokeStyle = runway.open ? "rgba(164,255,225,.9)" : "rgba(146,176,203,.45)";
  context.lineWidth = 2;
  context.fillRect(-w / 2, -h / 2, w, h);
  context.strokeRect(-w / 2, -h / 2, w, h);
  context.setLineDash([8, 8]);
  context.beginPath();
  context.moveTo(-w / 2 + 10, 0);
  context.lineTo(w / 2 - 10, 0);
  context.stroke();
  context.restore();
}

function drawCourier(time) {
  const x = state.x * width;
  const y = state.y * height;
  const angle = Math.atan2(state.vy, Math.max(0.02, state.vx));
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.shadowColor = "rgba(255,232,165,.65)";
  context.shadowBlur = 18;
  context.fillStyle = "#fff0b2";
  context.beginPath();
  context.moveTo(19, 0);
  context.lineTo(-15, -10);
  context.lineTo(-6, 0);
  context.lineTo(-15, 10);
  context.closePath();
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = "#76d5eb";
  context.fillRect(-5, -3, 10, 6);
  context.strokeStyle = "rgba(255,255,255,.55)";
  context.beginPath();
  context.moveTo(-16, 0);
  context.lineTo(-28 - Math.sin(time * 0.01) * 5, 0);
  context.stroke();
  context.restore();
}

function draw(time) {
  const described = domain.describe(state);
  const descriptors = described.rendererHandoff.descriptors;
  drawSky(state.tick);
  drawThermals(descriptors.thermalLanes);
  drawStorms(descriptors.stormCells, time);
  drawBuoys(descriptors.signalBuoys, time);
  drawRunway(descriptors.sanctuaryApproach);
  drawCourier(time);
  const readiness = Math.round(described.readiness * 100);
  ui.readiness.textContent = `${readiness}%`;
  ui.readinessBar.style.setProperty("--value", described.readiness.toFixed(3));
  ui.signals.textContent = `${described.summary.tunedSignals} / ${described.summary.targetSignals}`;
  ui.cargo.textContent = `${Math.round(described.summary.cargoIntegrity * 100)}%`;
  ui.speed.textContent = `${Math.round(state.vx * 1000)}`;
  ui.phase.textContent = state.phase;
  ui.event.textContent = state.lastEvent.replaceAll("-", " ");
  ui.score.textContent = `Score ${state.score}`;
  if (state.delivery) {
    ui.completeCopy.textContent = `${described.summary.targetSignals} signals tuned with ${Math.round(state.cargoIntegrity * 100)}% cargo integrity in ${state.elapsed.toFixed(1)} seconds.`;
    ui.complete.classList.add("open");
  }
}

function frame(time) {
  const dt = Math.min(0.05, Math.max(1 / 240, (time - previousTime) / 1000));
  previousTime = time;
  if (!state.delivery && !state.crashed) state = domain.step({ state, input: currentInput(), dt });
  if (state.crashed) restart(state.seed + 19);
  draw(time);
  requestAnimationFrame(frame);
}

addEventListener("resize", resize);
addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (event.code === "KeyR") restart();
  keys.add(event.code);
});
addEventListener("keyup", (event) => keys.delete(event.code));
for (const button of document.querySelectorAll("[data-control]")) {
  const name = button.dataset.control;
  const begin = (event) => { event.preventDefault(); touch.add(name); };
  const end = (event) => { event.preventDefault(); touch.delete(name); };
  button.addEventListener("pointerdown", begin);
  button.addEventListener("pointerup", end);
  button.addEventListener("pointercancel", end);
  button.addEventListener("pointerleave", end);
}
ui.restart.addEventListener("click", () => restart());
resize();
requestAnimationFrame(frame);
