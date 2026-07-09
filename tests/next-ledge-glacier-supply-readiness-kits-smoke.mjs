import assert from "node:assert/strict";
import { createNextLedgeGlacierSupplyReadinessDomainKit } from "../experiments/next-ledge/src/glacier-supply-readiness-kits.js";

const kit = createNextLedgeGlacierSupplyReadinessDomainKit();

function makeSnapshot(index) {
  const ledges = Array.from({ length: 7 }, (_, ledgeIndex) => ({
    id: `ledge-${index}-${ledgeIndex}`,
    x: -180 + ledgeIndex * 72 + index * 4,
    y: 80 + ledgeIndex * 92 + Math.sin(index + ledgeIndex) * 18,
    z: 2 + ledgeIndex % 3,
    r: 16 + ledgeIndex * 2,
    type: ledgeIndex === 2 || ledgeIndex === 4 ? "rest" : ledgeIndex === 6 ? "summit" : "normal"
  }));
  return {
    levelId: `glacier-case-${index}`,
    sector: 1 + index % 3,
    mode: index % 4 === 0 ? "falling" : "alive",
    route: { ledges },
    player: { x: -170 + index * 24, y: 70 + index * 38, z: 4, vx: 12 + index * 3, vy: index % 2 ? 28 : -8 },
    stamina: 34 + index * 8,
    constants: { maxStamina: 120 },
    enabledTargetIds: ledges.slice(1, 5).filter((_, enabledIndex) => (enabledIndex + index) % 2 === 0).map((ledge) => ledge.id),
    currentAnchorId: ledges[Math.min(5, Math.floor(index / 2))].id,
    camera: { x: 0, y: 260, z: 230 }
  };
}

const expectedKinds = new Set([
  "next-ledge-storm-lantern-chain",
  "next-ledge-crampon-step-rail",
  "next-ledge-frostbite-warmth-cache",
  "next-ledge-avalanche-cornice-warning",
  "next-ledge-rescue-sled-transfer-lane",
  "next-ledge-summit-supply-ledger"
]);

assert.equal(kit.ownership.renderer, false);
assert.equal(kit.ownership.dom, false);
assert.equal(kit.ownership.browserInput, false);
assert.equal(kit.ownership.three, false);
assert.match(kit.tree, /next-ledge-glacier-supply-readiness-domain/);

for (let index = 0; index < 10; index += 1) {
  const output = kit.describe(makeSnapshot(index));
  const descriptors = output.rendererHandoff.descriptors;
  assert.equal(output.kind, "domain-readiness");
  assert.ok(descriptors.length >= 12, `case ${index} should emit many descriptors`);
  assert.equal(output.rendererHandoff.descriptorCount, descriptors.length);
  assert.ok(output.rendererHandoff.rendererContract.includes("renderer consumes descriptors only"));
  for (const kind of expectedKinds) {
    assert.ok(descriptors.some((descriptor) => descriptor.kind === kind), `case ${index} missing ${kind}`);
  }
  assert.ok(output.summary.readiness >= 0 && output.summary.readiness <= 1);
  assert.ok(output.summary.frostRisk >= 0 && output.summary.frostRisk <= 1);
  assert.ok(["summit-supply-ready", "cache-and-belay", "hold-for-weather"].includes(output.summary.phase));
  assert.doesNotThrow(() => JSON.stringify(output));
}

console.log("Next Ledge glacier supply readiness kits smoke passed 10 intake cases.");
