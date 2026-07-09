import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { signalIslesLevel01 } from "./level-01.js";
import { signalIslesPreset } from "./signal-isles-preset.js";
import { signalIslesSequences } from "./sequences.js";
import { createSignalIslesComposition } from "./game-composition.js";
import { createSignalIslesRenderer } from "./renderer.js";
import { createSignalIslesInputAdapter } from "./input-adapter.js";
import { createSignalIslesDebugHost } from "./debug-host.js";

export const NEXUS_ENGINE_RUNTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const controlsEl = document.querySelector("#controls");
const errorPanel = document.querySelector("#errorPanel");
const errorText = document.querySelector("#errorText");
const nexusRuntimeDescriptor = Object.freeze({
  source: NEXUS_ENGINE_RUNTIME_CDN,
  exportCount: Object.keys(NexusEngine ?? {}).length,
  label: "NexusEngine main CDN"
});

let running = true;
let lastTime = performance.now();
let composition = null;
let renderer = null;
let input = null;

function showFatal(error) {
  errorPanel.hidden = false;
  errorText.textContent = String(error?.stack ?? error?.message ?? error);
  console.error(error);
}

function formatStatus(snapshot) {
  const session = snapshot.session;
  const objective = snapshot.objective.current?.label ?? "Complete";
  const scans = snapshot.scanCompletedCount;
  const shards = session.resources["signal-shards"] ?? 0;
  const mode = session.completed ? "complete" : session.failed ? "failed" : session.phase;
  const visualCount = snapshot.visualFractal?.rendererHandoff?.counts?.signalThreads ?? 0;
  const cueCount = snapshot.objectiveReadability?.rendererHandoff?.counts?.actionCues ?? 0;
  const routeCount = snapshot.objectiveReadability?.rendererHandoff?.counts?.dependencyThreads ?? 0;
  const scanSectors = snapshot.expeditionReadiness?.rendererHandoff?.counts?.scanSectors ?? 0;
  const retreatLanes = snapshot.expeditionReadiness?.rendererHandoff?.counts?.retreatLanes ?? 0;
  const stormCells = snapshot.stormAnchorReadiness?.rendererHandoff?.counts?.stormCells ?? 0;
  const anchorCables = snapshot.stormAnchorReadiness?.rendererHandoff?.counts?.anchorCables ?? 0;
  const triageSettlements = snapshot.harborReliefReadiness?.rendererHandoff?.counts?.woundedSettlements ?? 0;
  const skiffChannels = snapshot.harborReliefReadiness?.rendererHandoff?.counts?.skiffChannelThreads ?? 0;
  const keepers = snapshot.lighthouseEvacuationReadiness?.rendererHandoff?.counts?.strandedKeepers ?? 0;
  const rescueChannels = snapshot.lighthouseEvacuationReadiness?.rendererHandoff?.counts?.rescueBoatChannels ?? 0;
  return `${objective} · ${mode} · scan ${scans}/3 · shards ${shards} · flow ${visualCount} · cues ${cueCount}/${routeCount} · expedition ${scanSectors}/${retreatLanes} · storm ${stormCells}/${anchorCables} · harbor ${triageSettlements}/${skiffChannels} · lighthouse ${keepers}/${rescueChannels}`;
}

function updateHud(snapshot) {
  statusEl.textContent = formatStatus(snapshot);
  const rejection = composition.getLastRejection();
  controlsEl.textContent = rejection
    ? `Blocked: ${rejection.reason} · F/Mouse scan · E interact · B build · R reset`
    : "F/Mouse scan · E interact/harvest/cargo · B build · WASD move · R reset · guide lighthouse evacuation channels";
}

function frame(now) {
  if (!running) return;
  const delta = Math.min(signalIslesPreset.tuning.maxDelta, Math.max(0, (now - lastTime) / 1000 || 1 / 60));
  lastTime = now;

  input.flush(delta);
  composition.tick(delta);
  const snapshot = composition.getRenderSnapshot();
  renderer.draw(snapshot);
  updateHud(snapshot);

  requestAnimationFrame(frame);
}

async function boot() {
  composition = await createSignalIslesComposition({
    level: signalIslesLevel01,
    preset: signalIslesPreset,
    sequences: signalIslesSequences
  });

  renderer = await createSignalIslesRenderer({
    canvas,
    level: signalIslesLevel01,
    preset: signalIslesPreset
  });

  input = createSignalIslesInputAdapter({ canvas, composition, renderer });

  window.GameHost = createSignalIslesDebugHost({ composition, renderer, input, nexusRuntimeDescriptor });
  statusEl.textContent = "Restore signal · lighthouse evacuation readiness online · NexusEngine CDN linked";
  controlsEl.textContent = "Click for pointer lock · F/Mouse scan · E interact · B build · R reset";

  requestAnimationFrame(frame);
}

window.addEventListener("beforeunload", () => {
  running = false;
  input?.dispose?.();
  renderer?.dispose?.();
});

boot().catch(showFatal);
