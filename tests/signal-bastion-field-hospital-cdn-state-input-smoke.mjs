import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSignalBastionFieldHospitalReadinessDomainKit } from "../games/signal-bastion/src/signal-bastion-field-hospital-readiness-domain-kit.js";

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const html = readFileSync("games/signal-bastion/index.html", "utf8");
const entrySource = readFileSync("games/signal-bastion/src/signal-bastion-field-hospital-readiness-entry.js", "utf8");
const kitSource = readFileSync("games/signal-bastion/src/signal-bastion-field-hospital-readiness-domain-kit.js", "utf8");

assert.ok(boot.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Signal Bastion boot should import NexusEngine main CDN");
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "field hospital entry should import NexusEngine main CDN");
assert.ok(!entrySource.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed field hospital entry should not import old NexusRealtime runtime CDN");
assert.ok(entrySource.includes("createSignalBastionFieldHospitalReadinessDomainKit"), "entry should import field hospital domain kit");
assert.ok(entrySource.includes("getSignalBastionFieldHospitalReadiness"), "GameHost should expose Signal Bastion field hospital readiness");
assert.ok(entrySource.includes("fieldHospitalDescriptors"), "renderer handoff should count field hospital descriptors");
assert.ok(html.includes("field-hospital-readiness-renderer-handoff-pass"), "route should advertise field hospital readiness pass");
assert.ok(html.includes("field-hospital-readiness-1"), "route should cache bust field hospital readiness integration");

for (const token of [
  "bastion-triage-lantern-queue-kit",
  "bastion-med-supply-cache-kit",
  "bastion-stretcher-relay-thread-kit",
  "bastion-healing-ward-glyph-kit",
  "bastion-ambulance-gate-band-kit",
  "bastion-casualty-ledger-band-kit",
  "bastion-field-hospital-renderer-handoff-kit",
  "signal-bastion-field-hospital-readiness-domain-kit",
  "rendererConsumesDescriptorsOnly",
  "noFrameLoopOwnership"
]) {
  assert.ok(kitSource.includes(token), `kit source should include ${token}`);
}

for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "WebGLRenderer", "new Audio", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!kitSource.includes(forbidden), `kit source should not own ${forbidden}`);
}

const kit = createSignalBastionFieldHospitalReadinessDomainKit();
const states = Array.from({ length: 10 }, (_, index) => ({
  rawSnapshot: {
    map: {
      path: [
        { x: 80, y: 440, z: 0 },
        { x: 260 + index * 3, y: 335, z: 0 },
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
      buildOrder: [{ id: "bolt", cost: 95 }, { id: "drum", cost: 150 }, { id: "ward", cost: 220 }],
      waves: [{ spawnQueue: ["grunt", "runner"] }, { spawnQueue: ["grunt", "brute", "boss"] }]
    },
    session: { waveIndex: index % 2, waveActive: index % 3 !== 0, lives: 19 - index },
    economy: { wallet: { credits: 80 + index * 75 } },
    structures: {
      structures: [
        { id: `tower-a-${index}`, x: 280, y: 295, z: 0, level: 1 + (index % 3), range: 140, damage: 12, towerType: index % 2 ? "drum" : "bolt", color: "#8bd3ff" },
        { id: `tower-b-${index}`, x: 580, y: 230, z: 0, level: 1, range: 115, damage: 8, towerType: "ward", color: "#6bf0b8" }
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
  activeBlueprint: index % 2 ? "ward" : "bolt"
}));

for (const [index, state] of states.entries()) {
  const result = kit.describe(state);
  assert.equal(result.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should keep descriptor handoff policy`);
  assert.equal(result.rendererHandoff.counts.descriptors, 6, `case ${index} should emit six descriptor groups`);
  assert.ok(result.summary.triageQueues >= 2, `case ${index} should summarize triage queues`);
  assert.ok(result.summary.supplyCaches >= 4, `case ${index} should summarize supply caches`);
  assert.ok(result.summary.stretcherThreads >= 1, `case ${index} should summarize stretcher threads`);
  assert.ok(result.summary.ambulanceBands >= 3, `case ${index} should summarize ambulance bands`);
  assert.ok(["ward-ready", "ward-critical", "ward-forming"].includes(result.summary.missionState), `case ${index} should expose mission state`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)), `case ${index} should remain serializable`);
}

console.log("signal-bastion field hospital CDN/state/input smoke passed");
