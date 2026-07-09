import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SIGNAL_BASTION_SUPPLY_CONVOY_TREE,
  createSignalBastionSupplyConvoyReadinessDomainKit
} from "../games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js";

const kit = createSignalBastionSupplyConvoyReadinessDomainKit();
const missionStates = new Set(["undersupplied", "contested", "convoy-ready", "critical"]);

function makeCase(index) {
  const waveActive = index % 2 === 0;
  const lives = Math.max(4, 20 - index * 2);
  const credits = 70 + index * 55;
  const path = [
    { x: 80, y: 440, z: 0 },
    { x: 230 + index * 3, y: 350 - index * 2, z: 0 },
    { x: 500, y: 278 - index * 3, z: 0 },
    { x: 760, y: 165, z: 0 }
  ];
  const slots = {
    a: { id: `slot-a-${index}`, x: 210, y: 370, z: 0, occupied: index % 3 === 0 },
    b: { id: `slot-b-${index}`, x: 455, y: 285, z: 0, occupied: index % 2 === 0 },
    c: { id: `slot-c-${index}`, x: 675, y: 215, z: 0, occupied: true }
  };
  const structures = Object.fromEntries(
    Array.from({ length: 1 + (index % 5) }, (_, towerIndex) => [
      `tower-${index}-${towerIndex}`,
      {
        id: `tower-${index}-${towerIndex}`,
        x: 205 + towerIndex * 115,
        y: 365 - towerIndex * 38,
        z: 0,
        level: 1 + ((index + towerIndex) % 3),
        damage: 8 + index + towerIndex * 3,
        range: 130 + towerIndex * 10
      }
    ])
  );
  const active = Object.fromEntries(
    Array.from({ length: index % 4 }, (_, enemyIndex) => [
      `enemy-${index}-${enemyIndex}`,
      {
        id: `enemy-${index}-${enemyIndex}`,
        x: 140 + enemyIndex * 135,
        y: 410 - enemyIndex * 65,
        z: 0,
        health: 80 + enemyIndex * 30,
        maxHealth: 100 + enemyIndex * 35,
        speed: 0.9 + enemyIndex * 0.2,
        boss: enemyIndex === 2 && index > 5
      }
    ])
  );
  return {
    rawSnapshot: {
      map: { path, slots, vital: { x: 825, y: 135, z: 0 } },
      structures: { structures },
      agents: { active },
      economy: { wallet: { credits } },
      session: { lives, waveIndex: index % 3, waveActive },
      level: {
        waves: [
          { spawnQueue: ["crawler", "crawler"] },
          { spawnQueue: ["runner", "runner", "brute"] },
          { spawnQueue: ["boss", "runner", "runner", "crawler"] }
        ]
      }
    },
    activeBlueprint: index % 2 ? "mortar" : "bolt"
  };
}

function assertSet(name, value, childKey) {
  assert.equal(value.rendererNeutral, true, `${name} must remain renderer neutral`);
  assert.ok(Array.isArray(value[childKey]), `${name}.${childKey} must be an array`);
  assert.ok(value[childKey].length > 0, `${name}.${childKey} must not be empty`);
}

const results = [];
for (let index = 0; index < 10; index += 1) {
  const result = kit.describe(makeCase(index));
  results.push(result);
  assert.equal(result.rendererNeutral, true, "domain should remain renderer neutral");
  assert.equal(result.tree, SIGNAL_BASTION_SUPPLY_CONVOY_TREE, "tree should be exposed");
  assertSet("ammoCaches", result.ammoCaches, "cells");
  assertSet("rationWater", result.rationWater, "rings");
  assertSet("convoyLanes", result.convoyLanes, "ribbons");
  assertSet("ambushWatch", result.ambushWatch, "segments");
  assertSet("repairCrew", result.repairCrew, "threads");
  assertSet("quartermasterLedger", result.quartermasterLedger, "rings");
  assert.equal(result.rendererHandoff.rendererNeutral, true, "handoff must be renderer neutral");
  assert.equal(result.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, "handoff must be descriptor-only");
  assert.equal(result.rendererHandoff.counts.descriptors, 6, "six descriptor families should be handed off");
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, "readiness must be bounded");
  assert.ok(result.summary.pressure >= 0 && result.summary.pressure <= 1, "pressure must be bounded");
  assert.ok(missionStates.has(result.summary.missionState), `unexpected mission state ${result.summary.missionState}`);
  assert.doesNotThrow(() => JSON.stringify(result), "result must be serializable");
}

assert.ok(
  results.at(-1).summary.readiness >= results[0].summary.readiness,
  "stronger economy/structure cases should not regress readiness below the cold case"
);

const source = await readFile(new URL("../games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js", import.meta.url), "utf8");
for (const forbidden of ["document.", "querySelector", "canvas", "THREE", "WebGL", "AudioContext", "requestAnimationFrame", "addEventListener"]) {
  assert.equal(source.includes(forbidden), false, `kit source must not own ${forbidden}`);
}

console.log("Signal Bastion supply convoy readiness kits smoke passed 10 intake cases.");
