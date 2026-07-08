import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSignalBastionEvacuationCorridorReadinessDomainKit } from "../games/signal-bastion/src/signal-bastion-evacuation-corridor-readiness-domain-kit.js";

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const html = readFileSync("games/signal-bastion/index.html", "utf8");
const kitSource = readFileSync("games/signal-bastion/src/signal-bastion-evacuation-corridor-readiness-domain-kit.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const frontlineKitSmoke = readFileSync("tests/signal-bastion-frontline-tactics-domain-kits-smoke.mjs", "utf8");
const frontlineCdnSmoke = readFileSync("tests/signal-bastion-frontline-tactics-cdn-state-input-smoke.mjs", "utf8");

assert.ok(boot.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Signal Bastion boot should import NexusEngine main CDN");
assert.ok(!boot.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed Signal Bastion boot should not import old NexusRealtime runtime CDN");
assert.ok(boot.includes("createSignalBastionEvacuationCorridorReadinessDomainKit"), "boot should import evacuation corridor domain kit");
assert.ok(boot.includes("getSignalBastionEvacuationCorridorReadiness"), "boot should compose evacuation corridor state");
assert.ok(boot.includes("signalBastionEvacuationCorridorReadiness"), "presentation domain should expose signalBastionEvacuationCorridorReadiness");
assert.ok(boot.includes("getEvacuationCorridorReadiness"), "GameHost should expose evacuation corridor readiness state");
assert.ok(boot.includes("evacuationCorridorDescriptors"), "renderer handoff should count evacuation corridor descriptors");
assert.ok(html.includes("evacuation-corridor-readiness-1"), "route shell should cache bust evacuation corridor integration");
assert.ok(manifest.includes("evacuation-corridor-readiness-renderer-handoff-pass"), "manifest should register evacuation corridor cutover");
assert.ok(manifest.includes("signal-bastion-evacuation-corridor-readiness-domain-kit"), "manifest should include evacuation corridor domain kit");
assert.ok(frontlineKitSmoke.includes("signal-bastion-evacuation-corridor-readiness-kits-smoke.mjs"), "existing Signal Bastion kit smoke should route evacuation corridor kit smoke");
assert.ok(frontlineCdnSmoke.includes("signal-bastion-evacuation-corridor-readiness-cdn-state-input-smoke.mjs"), "existing Signal Bastion CDN smoke should route evacuation corridor CDN smoke");

for (const token of [
  "bastion-civilian-evacuation-lane-kit",
  "bastion-casualty-cache-triage-kit",
  "bastion-gate-integrity-shield-kit",
  "bastion-power-relay-load-kit",
  "bastion-reserve-convoy-thread-kit",
  "bastion-final-siren-countdown-kit",
  "bastion-evacuation-corridor-renderer-handoff-kit",
  "signal-bastion-evacuation-corridor-readiness-domain-kit",
  "rendererConsumesDescriptorsOnly",
  "noFrameLoopOwnership"
]) {
  assert.ok(kitSource.includes(token), `kit source should include ${token}`);
}

for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "WebGLRenderer", "new Audio", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!kitSource.includes(forbidden), `kit source should not own ${forbidden}`);
}

const kit = createSignalBastionEvacuationCorridorReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  rawSnapshot: {
    map: {
      path: [
        { x: 80, y: 440, z: 0 },
        { x: 260 + index, y: 335, z: 0 },
        { x: 520, y: 270 + index, z: 0 },
        { x: 800, y: 150, z: 0 }
      ],
      vital: { x: 830, y: 132, z: 0 },
      slots: {
        one: { id: "one", x: 260, y: 315, z: 0 },
        two: { id: "two", x: 455, y: 260, z: 0 },
        three: { id: "three", x: 625, y: 198, z: 0 },
        four: { id: "four", x: 720, y: 260, z: 0 }
      }
    },
    level: {
      buildOrder: [{ id: "bolt", cost: 95 }, { id: "drum", cost: 150 }, { id: "spire", cost: 220 }],
      waves: [{ spawnQueue: ["grunt", "runner"] }, { spawnQueue: ["grunt", "brute", "boss"] }]
    },
    session: { waveIndex: index % 2, waveActive: index % 3 !== 0, lives: 18 - index },
    economy: { wallet: { credits: 90 + index * 70 } },
    structures: {
      structures: [
        { id: `tower-a-${index}`, x: 280, y: 295, z: 0, level: 1 + (index % 3), range: 140, damage: 12, towerType: index % 2 ? "drum" : "bolt", color: "#8bd3ff" },
        { id: `tower-b-${index}`, x: 580, y: 230, z: 0, level: 1, range: 115, damage: 8, towerType: "spire", color: "#6bf0b8" }
      ]
    },
    agents: {
      active: Object.fromEntries(Array.from({ length: index % 5 }, (_, enemy) => [`enemy-${enemy}`, {
        id: `enemy-${enemy}`,
        x: 100 + enemy * 90,
        y: 430 - enemy * 35,
        z: 5,
        health: 40 + enemy * 14,
        maxHealth: 80,
        speed: 1 + enemy * 0.18,
        boss: enemy === 0 && index > 7
      }]))
    }
  },
  activeBlueprint: index % 2 ? "drum" : "bolt"
}));

for (const [index, state] of states.entries()) {
  const result = kit.describe(state);
  assert.equal(result.rendererNeutral, true, `case ${index} should remain renderer neutral`);
  assert.equal(result.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should keep descriptor handoff policy`);
  assert.equal(result.rendererHandoff.counts.descriptors, 6, `case ${index} should emit six descriptor groups`);
  assert.ok(result.evacuationLanes.ribbons.length >= 3, `case ${index} should emit evacuation lanes`);
  assert.ok(result.casualtyCaches.cells.length >= 3, `case ${index} should emit casualty cache cells`);
  assert.equal(result.finalSiren.rings.length, 5, `case ${index} should emit five final siren rings`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} should be JSON-serializable`);
}

console.log("signal-bastion evacuation corridor CDN/state/input smoke passed");
