import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFoglineRidgeAmbulanceReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-ridge-ambulance-kits.js";

const root = process.cwd();
const NEXUSENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entrySource = await readFile(join(root, "experiments/fogline-relay/src/ridge-ambulance-readiness-entry.js"), "utf8");
const indexSource = await readFile(join(root, "experiments/fogline-relay/index.html"), "utf8");
const parentSmokeSource = await readFile(join(root, "tests/fogline-relay-playwright-state-input-smoke.mjs"), "utf8");

assert.ok(entrySource.includes(NEXUSENGINE_MAIN_CDN), "ridge ambulance entry should import NexusEngine main CDN");
assert.equal(entrySource.includes("NexusRealtime@main"), false, "ridge ambulance entry should not import old NexusRealtime main CDN");
assert.ok(entrySource.includes("getFoglineRidgeAmbulanceReadiness"), "entry should expose Fogline Ridge Ambulance GameHost accessor");
assert.ok(indexSource.includes("ridge-ambulance-readiness-renderer-handoff-pass"), "route should advertise ridge ambulance upgrade");
assert.ok(indexSource.includes("ridge-ambulance-readiness-entry.js?v=fogline-ridge-ambulance-readiness-1"), "route should load ridge ambulance entry");
assert.ok(parentSmokeSource.includes("fogline-ridge-ambulance-readiness-kits-smoke.mjs"), "parent smoke should route ridge kit smoke");
assert.ok(parentSmokeSource.includes("fogline-ridge-ambulance-cdn-state-input-smoke.mjs"), "parent smoke should route ridge CDN smoke");

const route = [
  { x: 0, z: 0 },
  { x: 4, z: 8 },
  { x: -3, z: 17 },
  { x: 6, z: 28 },
  { x: 0, z: 40 }
];
const level = {
  route,
  spawn: route[0],
  gate: route.at(-1),
  relays: [
    { id: "r1", x: 3, z: 8, scanProgress: 0.1 },
    { id: "r2", x: -2, z: 18, scanProgress: 0.4 },
    { id: "r3", x: 5, z: 29, scanProgress: 0.7 }
  ],
  wraiths: [{ id: "w1", x: 6, z: 25, mode: "patrol" }]
};
const stateCases = [
  { input: "spawn", player: { x: 0, z: 0, yaw: 0 }, elapsed: 0, scan: [0.1, 0.4, 0.7], chase: false },
  { input: "walk-forward", player: { x: 0, z: 7, yaw: 0.1 }, elapsed: 45, scan: [0.2, 0.4, 0.7], chase: false },
  { input: "scan-held", player: { x: 2, z: 12, yaw: 0.2 }, elapsed: 90, scan: [0.5, 0.7, 0.8], chase: false },
  { input: "turn-right", player: { x: 3, z: 16, yaw: 0.7 }, elapsed: 120, scan: [0.5, 0.8, 1], chase: false },
  { input: "wraith-chase", player: { x: 4, z: 23, yaw: 1 }, elapsed: 180, scan: [0.3, 0.5, 0.6], chase: true },
  { input: "late-run", player: { x: 6, z: 30, yaw: 1.2 }, elapsed: 360, scan: [0.4, 0.5, 0.6], chase: true },
  { input: "all-scanned", player: { x: 0, z: 35, yaw: 0.4 }, elapsed: 100, scan: [1, 1, 1], chase: false },
  { input: "gate-approach", player: { x: 0, z: 39, yaw: 0.2 }, elapsed: 200, scan: [0.8, 0.9, 1], chase: false },
  { input: "reset-state", player: { x: 0, z: 0, yaw: 0 }, elapsed: 0, scan: [0, 0, 0], chase: false },
  { input: "high-pressure", player: { x: -2, z: 31, yaw: -0.4 }, elapsed: 420, scan: [0, 0.1, 0.2], chase: true }
];

const kit = createFoglineRidgeAmbulanceReadinessDomainKit();
for (const [index, state] of stateCases.entries()) {
  const relays = level.relays.map((relay, relayIndex) => ({ ...relay, scanProgress: state.scan[relayIndex], scanned: state.scan[relayIndex] >= 1 }));
  const wraiths = state.chase ? [{ id: `w-${index}`, x: state.player.x + 2, z: state.player.z + 3, mode: "chase" }] : level.wraiths;
  const result = kit.describe({ level, route, game: { player: state.player, relays, wraiths, stats: { elapsed: state.elapsed, timeBudget: 420 } } });
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", state.input);
  assert.ok(result.rendererHandoff.descriptorCount >= route.length, state.input);
  assert.ok(result.injuredRunnerBeacons.length >= 1, state.input);
  assert.ok(result.ambulanceGateWindows[0].ambulanceEtaSeconds > 0, state.input);
}

console.log("Fogline ridge ambulance NexusEngine CDN/state-input smoke passed 10 cases");
