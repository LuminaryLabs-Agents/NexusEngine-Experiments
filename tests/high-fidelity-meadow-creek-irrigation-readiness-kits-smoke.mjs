import assert from "node:assert/strict";
import {
  createMeadowSpringSeepSourceKit,
  createMeadowCreekRibbonCourseKit,
  createMeadowStoneWeirFlowKit,
  createMeadowIrrigationFurrowGridKit,
  createMeadowFrogRefugePoolKit,
  createMeadowDawnWaterLedgerKit,
  createMeadowCreekIrrigationRendererHandoffKit,
  createMeadowCreekIrrigationReadinessDomainKit,
  MEADOW_CREEK_IRRIGATION_READINESS_TREE
} from "../experiments/high-fidelity-meadow/src/meadow-creek-irrigation-readiness-kits.js";

const heightAt = (x = 0, z = 0) => Math.sin(x * 0.031) * 0.22 + Math.cos(z * 0.043) * 0.14;
const pathMask = (x = 0, z = 0) => Math.max(0, 1 - Math.abs(x * 0.13 + z * 0.07) / 14);
const yardMask = (x = 0, z = 0) => Math.max(0, 1 - Math.hypot(x - 4, z + 3) / 22);

const cases = Array.from({ length: 10 }, (_, index) => ({
  seed: `creek-irrigation-case-${index}`,
  width: 160 + index * 8,
  depth: 150 + index * 7,
  dayAmount: 0.18 + index * 0.071,
  heightAt,
  pathMask,
  yardMask,
  sheep: Array.from({ length: 5 + index }, (_, sheepIndex) => ({ id: `sheep-${index}-${sheepIndex}`, transform: { x: -18 + sheepIndex * 3, z: 7 + sheepIndex } })),
  flowers: Array.from({ length: 42 + index * 5 }, (_, flowerIndex) => ({ id: `flower-${index}-${flowerIndex}`, x: Math.sin(flowerIndex * 0.7) * 42, z: Math.cos(flowerIndex * 0.61) * 38 }))
}));

const atomicKits = [
  createMeadowSpringSeepSourceKit(),
  createMeadowCreekRibbonCourseKit(),
  createMeadowStoneWeirFlowKit(),
  createMeadowIrrigationFurrowGridKit(),
  createMeadowFrogRefugePoolKit(),
  createMeadowDawnWaterLedgerKit()
];
const handoffKit = createMeadowCreekIrrigationRendererHandoffKit();
const domainKit = createMeadowCreekIrrigationReadinessDomainKit();

assert.equal(MEADOW_CREEK_IRRIGATION_READINESS_TREE.root, "meadow-creek-irrigation-readiness-domain", "domain tree root should name creek irrigation readiness");

for (const input of cases) {
  for (const kit of atomicKits) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${kit.id} should return descriptor array for ${input.seed}`);
    assert.ok(descriptors.length > 0, `${kit.id} should emit descriptors for ${input.seed}`);
    assert.ok(descriptors.every((descriptor) => descriptor.rendererContract?.rendererMustNotOwn?.includes("webgl")), `${kit.id} should keep WebGL out of reusable logic`);
  }
  const handoff = handoffKit.describe(input);
  assert.equal(handoff.contract, "renderer-consumes-serializable-descriptors-only", `handoff contract should hold for ${input.seed}`);
  assert.ok(handoff.forbiddenOwnership.includes("dom"), "handoff must forbid DOM ownership");
  assert.ok(handoff.forbiddenOwnership.includes("frame-loop"), "handoff must forbid frame-loop ownership");
  assert.ok(handoff.counts.total >= 22, `handoff should produce enough visual descriptors for ${input.seed}`);
  assert.doesNotThrow(() => JSON.stringify(handoff), `handoff should stay JSON-safe for ${input.seed}`);

  const state = domainKit.describe(input);
  assert.equal(state.rendererHandoff.counts.total, state.descriptorCounts.total, "domain state and handoff counts should agree");
  assert.ok(["ready", "watch", "repair-needed"].includes(state.status), "water ledger status should be bounded");
  assert.ok(state.waterIndex >= 0 && state.waterIndex <= 1, "water index should be normalized");
  assert.ok(state.descriptors.creekRibbons.every((ribbon) => Number.isFinite(ribbon.x1) && Number.isFinite(ribbon.z2)), "creek ribbons should expose numeric endpoints");
}

console.log(`High Fidelity Meadow creek irrigation readiness kits smoke passed ${cases.length} intake cases.`);
