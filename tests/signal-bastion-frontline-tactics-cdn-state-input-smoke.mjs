import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import "./signal-bastion-evacuation-corridor-readiness-cdn-state-input-smoke.mjs";

import { createSignalBastionFrontlineTacticsDomainKit } from "../games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js";

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const html = readFileSync("games/signal-bastion/index.html", "utf8");
const kitSource = readFileSync("games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js", "utf8");
const checksSource = readFileSync("scripts/run-checks.mjs", "utf8");

assert.ok(boot.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Signal Bastion boot should import NexusEngine main CDN");
assert.ok(!boot.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed Signal Bastion boot should not import old NexusRealtime runtime CDN");
assert.ok(boot.includes("createSignalBastionFrontlineTacticsDomainKit"), "boot should import frontline tactics domain kit");
assert.ok(boot.includes("getSignalBastionFrontlineTactics"), "boot should compose frontline tactics state");
assert.ok(boot.includes("signalBastionFrontlineTactics"), "presentation domain should expose signalBastionFrontlineTactics");
assert.ok(boot.includes("getFrontlineTactics"), "GameHost should expose frontline tactics state");
assert.ok(boot.includes("frontlineTacticsDescriptors"), "renderer handoff should count frontline tactic descriptors");
assert.match(html, /first-command-refinement-\d+/, "route shell should cache bust the consolidated player-first integration");
assert.ok(checksSource.includes("tests/signal-bastion-frontline-tactics-domain-kits-smoke.mjs"), "full/deploy checks should include kit smoke");
assert.ok(checksSource.includes("tests/signal-bastion-frontline-tactics-cdn-state-input-smoke.mjs"), "full/deploy checks should include CDN state smoke");

for (const token of [
  "bastion-build-slot-value-field-kit",
  "bastion-tower-role-balance-ribbon-kit",
  "bastion-intercept-zone-bracket-kit",
  "bastion-boss-focus-lens-kit",
  "bastion-overkill-dampening-chip-kit",
  "bastion-salvage-window-flag-kit",
  "bastion-frontline-tactics-renderer-handoff-kit",
  "signal-bastion-frontline-tactics-domain-kit",
  "rendererConsumesDescriptorsOnly",
  "noFrameLoopOwnership"
]) {
  assert.ok(kitSource.includes(token), `kit source should include ${token}`);
}

for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "WebGLRenderer", "new Audio", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!kitSource.includes(forbidden), `kit source should not own ${forbidden}`);
}

const kit = createSignalBastionFrontlineTacticsDomainKit();
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
  assert.ok(result.buildSlotValue.cells.length >= 3, `case ${index} should emit slot value cells`);
  assert.ok(result.towerRoleBalance.ribbons.length >= 3, `case ${index} should emit role balance ribbons`);
  assert.ok(result.overkillDampening.rings.length === 4, `case ${index} should emit overkill rings`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} should be JSON-serializable`);
}

console.log("signal-bastion frontline tactics CDN/state/input smoke passed");
