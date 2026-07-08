import assert from "node:assert/strict";
import { createZombieOrchardCureCraftingReadinessDomainKit, ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE } from "../experiments/zombie-orchard/src/cure-crafting-readiness-kits.js";

const domain = createZombieOrchardCureCraftingReadinessDomainKit();
const baseState = {
  clock: { elapsed: 24 },
  player: { position: { x: 0, y: 0, z: 0 } },
  bounds: { minX: -36, maxX: 36, minZ: -26, maxZ: 26 },
  orchard: {
    activeApples: [
      { id: "apple-a", typeId: "golden", label: "golden apple", position: { x: -11, y: 0, z: -7 } },
      { id: "apple-b", typeId: "rot", label: "rot apple", position: { x: 8, y: 0, z: 12 } }
    ]
  },
  visualDomains: {
    lanes: [
      { id: "north", center: { x: -18, z: -14 } },
      { id: "south", center: { x: 16, z: 14 } }
    ],
    trees: [
      { id: "tree-a", position: { x: -22, y: 0, z: 5 } },
      { id: "tree-b", position: { x: 18, y: 0, z: -11 } }
    ]
  },
  monsters: [
    { id: "shambler-a", position: { x: -18, z: -12 }, threat: { threat: 1 } },
    { id: "brute-a", position: { x: 17, z: 10 }, threat: { threat: 2 } }
  ],
  round: { round: 3, status: "active" },
  horde: { pressure01: 0.44, mode: "hunt" },
  health01: 0.68,
  stamina01: 0.55,
  appleCount: 3,
  clears: 4,
  danger: false
};

const hordeReadiness = {
  rendererHandoff: {
    descriptors: {
      spawnLaneForecasts: [
        { id: "lane-a", from: { x: -30, z: -22 }, to: { x: 0, z: 0 }, urgency: 0.78 },
        { id: "lane-b", from: { x: 30, z: 22 }, to: { x: 0, z: 0 }, urgency: 0.38 }
      ]
    }
  }
};

const intakeCases = [
  ["baseline cure route", baseState],
  ["high pressure panic", { ...baseState, horde: { pressure01: 0.92, mode: "panic" }, danger: true, health01: 0.23 }],
  ["no apples yet", { ...baseState, appleCount: 0, orchard: { activeApples: [] } }],
  ["many apples", { ...baseState, appleCount: 8, recentApples: 4 }],
  ["no visual lanes", { ...baseState, visualDomains: { trees: baseState.visualDomains.trees } }],
  ["no trees fallback", { ...baseState, visualDomains: { lanes: baseState.visualDomains.lanes } }],
  ["late round ritual", { ...baseState, round: { round: 9, status: "active", bossWave: true }, clears: 15 }],
  ["empty monster pressure", { ...baseState, monsters: [], horde: { pressure01: 0.08 } }],
  ["minimal state fallback", { player: { position: { x: 2, z: -3 } }, health01: 1, appleCount: 1 }],
  ["horde forecast grafts", { ...baseState, appleCount: 5 }, hordeReadiness]
];

for (const [label, snapshot, horde = {}] of intakeCases) {
  const readiness = domain.compose(snapshot, horde);
  assert.equal(readiness.id, "zombie-orchard-cure-crafting-readiness", label);
  assert.ok(readiness.domainTree.includes("zombie-orchard-cure-crafting-readiness-domain"), label);
  assert.ok(readiness.summary.descriptorCount >= 6, label);
  assert.equal(readiness.summary.rendererConsumes, "descriptors-only", label);
  assert.ok(Array.isArray(readiness.descriptors.infectedRootSamples), label);
  assert.ok(Array.isArray(readiness.descriptors.antidotePressQueues), label);
  assert.ok(Array.isArray(readiness.descriptors.sapDistillerNodes), label);
  assert.ok(Array.isArray(readiness.descriptors.barricadeGraftPlans), label);
  assert.ok(Array.isArray(readiness.descriptors.survivorSignalGlyphs), label);
  assert.ok(Array.isArray(readiness.descriptors.dawnCureRitualWindows), label);
  assert.equal(readiness.rendererHandoff.policy, "renderer-consumes-descriptors-only", label);
  assert.equal(readiness.rendererHandoff.descriptorCounts.dawnCureRitualWindows, 1, label);
  assert.equal(readiness.rendererHandoff.ownership.renderer, false, label);
  assert.equal(readiness.rendererHandoff.ownership.dom, false, label);
  assert.equal(readiness.rendererHandoff.ownership.browserInput, false, label);
  assert.equal(readiness.rendererHandoff.ownership.three, false, label);
  assert.equal(readiness.rendererHandoff.ownership.webgl, false, label);
  assert.equal(readiness.rendererHandoff.ownership.audio, false, label);
  assert.equal(readiness.rendererHandoff.ownership.assetLoading, false, label);
  assert.equal(readiness.rendererHandoff.ownership.frameLoop, false, label);
  assert.doesNotThrow(() => JSON.stringify(readiness), label);
}

assert.ok(ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE.includes("infected-root-sample-domain"));
assert.ok(ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE.includes("renderer consumes descriptors only"));

console.log("zombie orchard cure crafting readiness kits smoke passed");
