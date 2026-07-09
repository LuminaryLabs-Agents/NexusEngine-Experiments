import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createBirdRunCanopyRescueDomainKit } from "./bird-run-canopy-rescue-domain-kits.js";

void NexusEngine;

const canvas = document.querySelector("#bird-run-view");
const hud = document.querySelector("#bird-run-hud");
const status = document.querySelector("#bird-run-status");
const reset = document.querySelector("#bird-run-reset");
const context = canvas?.getContext?.("2d");
const keys = new Set();
const domain = createBirdRunCanopyRescueDomainKit({ seed: 41 });

let state = { lane: 0, targetLane: 0, lateral: 0, altitude: 0.52, distance: 0, speed: 24, rescued: 0, score: 0, alive: true, status: "flying", tick: 0 };
let lastTime = performance.now();
let lastFrame = domain.update({ state, intent: {}, dt: 0 });

function resize() {
  if (!canvas) return;
  canvas.width = Math.max(640, Math.floor(window.innerWidth * devicePixelRatio));
  canvas.height = Math.max(360, Math.floor(window.innerHeight * devicePixelRatio));
}

function inputIntent() {
  return {
    left: keys.has("ArrowLeft") || keys.has("KeyA"),
    right: keys.has("ArrowRight") || keys.has("KeyD"),
    flap: keys.has("Space") || keys.has("ArrowUp") || keys.has("KeyW"),
    restart: keys.has("KeyR")
  };
}

function projectX(lane, width) {
  return width * 0.5 + lane * width * 0.22;
}

function projectY(x, distance, height) {
  const depth = Math.max(1, x - distance);
  return height - Math.min(height * 0.86, depth * 3.2);
}

function drawDescriptorBand(handoff) {
  if (!context || !canvas) return;
  const width = canvas.width;
  const height = canvas.height;
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#092037");
  sky.addColorStop(0.52, "#18492f");
  sky.addColorStop(1, "#071006");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(197,255,177,.18)";
  context.lineWidth = Math.max(1, width * 0.002);
  for (const lane of [-1, 0, 1]) {
    const x = projectX(lane, width);
    context.beginPath();
    context.moveTo(x, height);
    context.lineTo(width * 0.5 + lane * width * 0.06, height * 0.18);
    context.stroke();
  }

  for (const obstacle of handoff.obstacles) {
    const y = projectY(obstacle.x, state.distance, height);
    if (y < -80 || y > height + 120) continue;
    const scale = Math.max(0.25, 1 - y / height);
    const x = projectX(obstacle.lane, width);
    context.fillStyle = obstacle.silhouette === "pine" ? "#143b21" : "#1f5d2d";
    context.beginPath();
    context.moveTo(x, y - 80 * scale);
    context.lineTo(x - 34 * scale, y + 46 * scale);
    context.lineTo(x + 34 * scale, y + 46 * scale);
    context.closePath();
    context.fill();
    context.fillStyle = "#5b3c22";
    context.fillRect(x - 5 * scale, y + 26 * scale, 10 * scale, 42 * scale);
  }

  for (const beacon of handoff.beacons) {
    const y = projectY(beacon.x, state.distance, height);
    if (y < -80 || y > height + 120) continue;
    const x = projectX(beacon.lane, width);
    context.strokeStyle = "rgba(255,227,121,.72)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, 18 + beacon.urgency * 14, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "rgba(255,227,121,.82)";
    context.fillRect(x - 5, y - 5, 10, 10);
  }

  const birdX = projectX(handoff.bird.lateral, width);
  const birdY = height * (0.72 - handoff.bird.altitude * 0.3);
  context.fillStyle = handoff.bird.alive ? "#f3ffcf" : "#ff9b86";
  context.beginPath();
  context.moveTo(birdX + 28, birdY);
  context.lineTo(birdX - 18, birdY - 14);
  context.lineTo(birdX - 8, birdY);
  context.lineTo(birdX - 18, birdY + 14);
  context.closePath();
  context.fill();
}

function updateHud(handoff) {
  const text = `Distance ${handoff.telemetry.distance}m · Speed ${handoff.telemetry.speed} · Rescued ${handoff.telemetry.rescued} · ${state.status}`;
  if (hud) hud.textContent = text;
  if (status) status.textContent = state.alive ? "A/D or arrows switch lanes. Space climbs. Rescue glowing nests while dodging groves." : "Grounded by canopy. Press R or Restart.";
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;
  lastFrame = domain.update({ state, intent: inputIntent(), dt });
  state = lastFrame.state;
  drawDescriptorBand(lastFrame.rendererHandoff);
  updateHud(lastFrame.rendererHandoff);
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => keys.add(event.code));
window.addEventListener("keyup", (event) => keys.delete(event.code));
reset?.addEventListener("click", () => { state = domain.update({ state, intent: { restart: true }, dt: 0 }).state; });

window.GameHost = {
  ...(window.GameHost || {}),
  getState: () => ({ ...state }),
  getBirdRunCanopyRescueReadiness: () => lastFrame,
  getCanopyRescueReadiness: () => lastFrame,
  getBirdRunCanopyRescueReadinessTree: () => domain.tree,
  getRendererHandoff: () => ({ birdRunCanopyRescue: lastFrame.rendererHandoff, birdRunCanopyRescueDescriptorCount: lastFrame.rendererHandoff.telemetry.descriptorCount })
};

resize();
requestAnimationFrame(frame);
