import assert from "node:assert/strict";
import {
  FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE,
  FOGLINE_RIDGE_AMBULANCE_KIT_NAMES,
  createFoglineRidgeAmbulanceReadinessDomainKit
} from "../experiments/fogline-relay/src/fogline-ridge-ambulance-kits.js";

const route = [
  { x: 0, z: 0 },
  { x: 4, z: 8 },
  { x: -3, z: 17 },
  { x: 6, z: 28 },
  { x: 0, z: 40 }
];

const baseLevel = {
  id: "fogline-test-level",
  spawn: route[0],
  gate: route.at(-1),
  route,
  relays: [
    { id: "r1", x: 3, z: 8, scanProgress: 0.2 },
    { id: "r2", x: -2, z: 18, scanned: true },
    { id: "r3", x: 5, z: 29, scanProgress: 0.55 }
  ],
  wraiths: [
    { id: "w1", x: -6, z: 19, mode: "patrol" },
    { id: "w2", x: 7, z: 31, mode: "chase" }
  ]
};

const cases = [
  { name: "base ridge casualty route", game: { player: { x: 0, z: 0, yaw: 0 }, stats: { elapsed: 20, timeBudget: 420 } } },
  { name: "late timer raises casualty urgency", game: { player: { x: 1, z: 8, yaw: 0.3 }, stats: { elapsed: 390, timeBudget: 420 } } },
  { name: "all relays scanned opens ambulance gate", game: { player: { x: 2, z: 18, yaw: 0.4 }, relays: baseLevel.relays.map((relay) => ({ ...relay, scanned: true })), stats: { elapsed: 60, timeBudget: 420 } } },
  { name: "chasing wraith pressure visible", game: { player: { x: -1, z: 10, yaw: -0.2 }, wraiths: baseLevel.wraiths.map((wraith) => ({ ...wraith, mode: "chase" })), stats: { elapsed: 180, timeBudget: 420 } } },
  { name: "minimal level still serializes", level: { route: [{ x: 0, z: 0 }, { x: 0, z: 10 }], gate: { x: 0, z: 10 } }, game: { player: { x: 0, z: 2 } } },
  { name: "empty route produces safe fallbacks", level: { route: [], gate: { x: 5, z: 5 }, relays: [] }, game: { player: { x: 1, z: 1 }, stats: { elapsed: 0, timeBudget: 100 } } },
  { name: "partial scan produces radio pings", game: { player: { x: 1, z: 9, yaw: 0.7 }, relays: baseLevel.relays.map((relay, index) => ({ ...relay, scanProgress: index * 0.3 })) } },
  { name: "long route creates more triage sash descriptors", level: { ...baseLevel, route: [...route, { x: 8, z: 52 }, { x: -2, z: 64 }] }, game: { player: { x: 0, z: 0 } } },
  { name: "no wraiths uses ridge fallback casualty", level: { ...baseLevel, wraiths: [] }, game: { player: { x: 0, z: 0 }, wraiths: [] } },
  { name: "high pressure keeps descriptors bounded", game: { player: { x: 6, z: 34, yaw: 1.1 }, stats: { elapsed: 999, timeBudget: 100 }, wraiths: [{ id: "wx", x: 6, z: 35, mode: "chase" }] } }
];

const kit = createFoglineRidgeAmbulanceReadinessDomainKit();
assert.equal(kit.id, "fogline-ridge-ambulance-readiness-domain-kit");
assert.equal(FOGLINE_RIDGE_AMBULANCE_KIT_NAMES.length, 8);
assert.ok(FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE.includes("triage-sash-domain"));
assert.ok(FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE.includes("renderer consumes descriptors only"));

for (const testCase of cases) {
  const level = testCase.level ?? baseLevel;
  const game = { relays: level.relays, wraiths: level.wraiths, ...testCase.game };
  const result = kit.describe({ level, route: level.route, game });
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", testCase.name);
  assert.ok(result.drawOrder.length > 0, testCase.name);
  assert.equal(result.rendererHandoff.descriptorCount, result.drawOrder.length, testCase.name);
  assert.ok(result.drawOrder.every((descriptor) => descriptor.id && descriptor.archetype && descriptor.compatibleBucket && descriptor.position), testCase.name);
  assert.ok(result.drawOrder.every((descriptor) => descriptor.opacity >= 0 && descriptor.opacity <= 1), testCase.name);
  assert.equal(result.rendererHandoff.ownership.dom, "excluded", testCase.name);
  assert.equal(result.rendererHandoff.ownership.three, "excluded", testCase.name);
  assert.doesNotThrow(() => JSON.stringify(result), testCase.name);
}

const calm = kit.describe({ level: baseLevel, route, game: { player: route[0], relays: baseLevel.relays.map((relay) => ({ ...relay, scanned: true })), stats: { elapsed: 20, timeBudget: 420 } } });
const stressed = kit.describe({ level: baseLevel, route, game: { player: route[0], wraiths: baseLevel.wraiths.map((wraith) => ({ ...wraith, mode: "chase" })), stats: { elapsed: 390, timeBudget: 420 } } });
assert.ok(stressed.injuredRunnerBeacons[0].urgency >= calm.injuredRunnerBeacons[0].urgency, "stress should not lower first casualty urgency");
assert.ok(calm.ambulanceGateWindows[0].windowOpen > stressed.ambulanceGateWindows[0].windowOpen, "clear scans should improve ambulance gate window");

console.log("Fogline ridge ambulance readiness kit smoke passed 10 intake cases");
