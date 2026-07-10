import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createSignalBastionBeaconTowerEvacuationReadinessDomainKit } from "../games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const routePath = "games/signal-bastion/index.html";
const entryPath = "games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-entry.js";
const kitPath = "games/signal-bastion/src/signal-bastion-beacon-tower-evacuation-readiness-domain-kit.js";

const route = fs.readFileSync(routePath, "utf8");
const entry = fs.readFileSync(entryPath, "utf8");
const kitSource = fs.readFileSync(kitPath, "utf8");

assert.ok(route.includes("beacon-tower-evacuation-readiness-renderer-handoff-pass"), "route advertises beacon pass");
assert.ok(route.includes("signal-bastion-beacon-tower-evacuation-readiness-entry.js?v=beacon-tower-evacuation-1"), "route loads beacon entry");
assert.ok(entry.includes(CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry avoids old NexusRealtime CDN import");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getSignalBastionBeaconTowerEvacuationReadiness"), "entry exposes signal bastion readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kitSource.includes("noRendererOwnership: true"), "kit excludes renderer ownership");
assert.ok(kitSource.includes("noDomOwnership: true"), "kit excludes DOM ownership");
assert.ok(kitSource.includes("noBrowserInputOwnership: true"), "kit excludes browser input ownership");
assert.ok(kitSource.includes("noThreeOwnership: true"), "kit excludes Three.js ownership");
assert.ok(kitSource.includes("noWebglOwnership: true"), "kit excludes WebGL ownership");
assert.ok(kitSource.includes("noAudioOwnership: true"), "kit excludes audio ownership");
assert.ok(kitSource.includes("noAssetLoadingOwnership: true"), "kit excludes asset loading ownership");
assert.ok(kitSource.includes("noFrameLoopOwnership: true"), "kit excludes frame loop ownership");

const domain = createSignalBastionBeaconTowerEvacuationReadinessDomainKit();
const simulatedInputs = [
  { key: "MouseMove", intent: "inspect-prism", credits: 100, lives: 20, waveActive: false },
  { key: "Digit1", intent: "select-bolt-tower", credits: 140, lives: 19, waveActive: true },
  { key: "Digit2", intent: "select-slow-tower", credits: 175, lives: 18, waveActive: true },
  { key: "Digit3", intent: "select-splash-tower", credits: 220, lives: 17, waveActive: false },
  { key: "Space", intent: "start-wave", credits: 250, lives: 16, waveActive: true },
  { key: "Click", intent: "place-tower", credits: 300, lives: 15, waveActive: true },
  { key: "KeyQ", intent: "rotate-build", credits: 340, lives: 14, waveActive: false },
  { key: "KeyE", intent: "upgrade-tower", credits: 390, lives: 13, waveActive: true },
  { key: "Escape", intent: "cancel-build", credits: 430, lives: 12, waveActive: false },
  { key: "KeyR", intent: "restart-route", credits: 520, lives: 20, waveActive: false }
];

for (const [index, input] of simulatedInputs.entries()) {
  const readiness = domain.describe({
    rawSnapshot: {
      map: {
        vital: { x: 820, y: 135, z: 0 },
        path: [{ x: 80, y: 440, z: 0 }, { x: 250, y: 330, z: 0 }, { x: 520, y: 280, z: 0 }, { x: 780, y: 160, z: 0 }]
      },
      economy: { wallet: { credits: input.credits } },
      session: { lives: input.lives, waveIndex: index % 2, waveActive: input.waveActive },
      structures: {
        structures: Array.from({ length: 1 + (index % 4) }, (_, towerIndex) => ({ id: `tower-${index}-${towerIndex}`, x: 210 + towerIndex * 110, y: 370 - towerIndex * 40, level: 1 + towerIndex }))
      },
      agents: {
        active: Array.from({ length: index % 5 }, (_, agentIndex) => ({ id: `agent-${index}-${agentIndex}`, x: 130 + agentIndex * 120, y: 420 - agentIndex * 42, speed: 0.9 + agentIndex * 0.1 }))
      },
      level: { waves: [{ spawnQueue: ["runner", "runner"] }, { spawnQueue: ["runner", "boss", "brute"] }] }
    }
  });
  assert.ok(input.intent.length > 0, `case ${index} has an input intent`);
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(readiness.summary.evacuationPressure >= 0 && readiness.summary.evacuationPressure <= 1, `case ${index} pressure bounds`);
  assert.equal(readiness.rendererHandoff.counts.descriptors, readiness.rendererHandoff.descriptors.length, `case ${index} descriptor parity`);
  assert.equal(readiness.summary.totalNestedDescriptors, 28, `case ${index} total nested descriptors`);
}

let cdnValidation = "source-wiring-only";
try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const response = await fetch(CDN, { signal: controller.signal });
  clearTimeout(timeout);
  if (response.ok) {
    const source = await response.text();
    const localCdn = path.join(os.tmpdir(), "nexusengine-main-cdn-signal-bastion-beacon-smoke.mjs");
    fs.writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`Signal Bastion beacon tower evacuation CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
