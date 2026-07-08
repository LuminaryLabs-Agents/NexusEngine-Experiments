import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSignalBastionWaveChoreographyDomainKit } from "../games/signal-bastion/src/signal-bastion-wave-choreography-domain-kit.js";

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const kitSource = readFileSync("games/signal-bastion/src/signal-bastion-wave-choreography-domain-kit.js", "utf8");
const checksSource = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(boot.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed Signal Bastion boot should import NexusEngine main CDN");
assert.ok(!boot.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed Signal Bastion boot should not import old NexusRealtime runtime CDN");
assert.ok(boot.includes("createSignalBastionWaveChoreographyDomainKit"), "boot should import the wave choreography domain kit");
assert.ok(boot.includes("getWaveChoreography"), "GameHost should expose wave choreography state");
assert.ok(boot.includes("composeSignalBastionRendererHandoff"), "boot should compose command and wave choreography renderer handoffs");
assert.ok(boot.includes("signalBastionWaveChoreography"), "presentation domain should expose signalBastionWaveChoreography");
assert.ok(checksSource.includes("tests/signal-bastion-wave-choreography-domain-kits-smoke.mjs"), "full/deploy checks should include kit smoke");
assert.ok(checksSource.includes("tests/signal-bastion-wave-choreography-cdn-state-input-smoke.mjs"), "full/deploy checks should include CDN state smoke");

for (const token of [
  "bastion-spawn-cadence-rail-kit",
  "bastion-leak-risk-funnel-kit",
  "bastion-coverage-gap-cell-kit",
  "bastion-upgrade-priority-pin-kit",
  "bastion-panic-reserve-meter-kit",
  "bastion-projectile-tempo-spark-kit",
  "bastion-wave-choreography-renderer-handoff-kit",
  "signal-bastion-wave-choreography-domain-kit",
  "rendererConsumesDescriptorsOnly",
  "noFrameLoopOwnership"
]) {
  assert.ok(kitSource.includes(token), `kit source should include ${token}`);
}

const kit = createSignalBastionWaveChoreographyDomainKit();
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
        three: { id: "three", x: 625, y: 198, z: 0 }
      }
    },
    level: { waves: [{ spawnQueue: ["grunt", "runner"] }, { spawnQueue: ["grunt", "brute", "boss"] }] },
    session: { waveIndex: index % 2, waveActive: index % 3 !== 0, lives: 18 - index },
    economy: { wallet: { credits: 180 + index * 65 } },
    structures: {
      structures: [
        { id: `tower-a-${index}`, x: 280, y: 295, z: 0, level: 1 + (index % 3), range: 140, color: "#8bd3ff" },
        { id: `tower-b-${index}`, x: 580, y: 230, z: 0, level: 1, range: 115, color: "#6bf0b8" }
      ]
    },
    agents: {
      active: Object.fromEntries(Array.from({ length: index % 5 }, (_, enemy) => [`enemy-${enemy}`, {
        id: `enemy-${enemy}`,
        x: 100 + enemy * 90,
        y: 430 - enemy * 35,
        z: 5,
        health: 40,
        maxHealth: 80,
        speed: 1 + enemy * 0.15
      }]))
    },
    combat: {
      projectiles: Object.fromEntries(Array.from({ length: index % 3 }, (_, projectile) => [`projectile-${projectile}`, {
        id: `projectile-${projectile}`,
        x: 310 + projectile * 50,
        y: 290 - projectile * 12,
        z: 18,
        damage: 12 + projectile
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
  assert.ok(result.spawnCadence.threads.length >= 2, `case ${index} should emit spawn cadence beats`);
  assert.ok(result.coverageGaps.cells.length >= 1, `case ${index} should emit coverage gaps`);
  assert.ok(result.upgradePriority.ribbons.length >= 1, `case ${index} should emit upgrade pins`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} should be JSON-serializable`);
}

console.log("signal-bastion wave choreography CDN/state/input smoke passed");
