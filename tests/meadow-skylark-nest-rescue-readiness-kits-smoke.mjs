import assert from "node:assert/strict";
import {
  createDawnBroodLedgerKit,
  createDewPathBeadKit,
  createFledglingSeedCacheKit,
  createFoxScentRibbonKit,
  createMeadowSkylarkNestRescueReadinessDomainKit,
  createShepherdBellPostKit,
  createSkylarkNestCupKit,
  createSkylarkNestRescueRendererHandoffKit
} from "../experiments/high-fidelity-meadow/src/meadow-skylark-nest-rescue-readiness-kits.js";

const domain = createMeadowSkylarkNestRescueReadinessDomainKit();

function makeCase(index) {
  return {
    seed: `meadow-skylark-case-${index}`,
    build: `meadow-build-${index}`,
    meadowRadius: 76 + index * 3,
    grassBlades: 7600 + index * 1550,
    sheep: 7 + index,
    vfxParticles: 560 + index * 130,
    hour: 4.7 + index * 0.18,
    skylarkRescue: {
      progress: index / 9,
      nestChecks: index,
      bellPosts: Math.floor(index / 2),
      seedCaches: Math.floor(index / 3)
    }
  };
}

const atomicKits = [
  createSkylarkNestCupKit(),
  createDewPathBeadKit(),
  createFoxScentRibbonKit(),
  createShepherdBellPostKit(),
  createFledglingSeedCacheKit(),
  createDawnBroodLedgerKit(),
  createSkylarkNestRescueRendererHandoffKit()
];

assert.equal(domain.id, "meadow-skylark-nest-rescue-readiness-domain-kit");
assert.ok(domain.tree.includes("meadow-skylark-nest-rescue-readiness-domain"));
assert.deepEqual(domain.ownership, {
  renderer: false,
  dom: false,
  browserInput: false,
  three: false,
  webgl: false,
  audio: false,
  assetLoading: false,
  frameLoop: false,
  storage: false,
  network: false,
  physics: false
});
assert.equal(domain.kits.length, 7, "six atomic kits plus handoff kit");
for (const kit of atomicKits) assert.ok(kit.id.includes("kit"), `${kit.id} names a kit`);

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const results = cases.map((item) => domain.describe(item));

for (const [index, result] of results.entries()) {
  assert.equal(result.kind, "domain-readiness", `case ${index} kind`);
  assert.ok(result.rendererContract.includes("renderer consumes descriptors only"), `case ${index} renderer contract`);
  assert.equal(result.skylarkNestCups.length, 6, `case ${index} nest count`);
  assert.equal(result.dewPathBeads.length, 18, `case ${index} dew bead count`);
  assert.equal(result.foxScentRibbons.length, 5, `case ${index} fox ribbon count`);
  assert.equal(result.shepherdBellPosts.length, 4, `case ${index} bell post count`);
  assert.equal(result.fledglingSeedCaches.length, 5, `case ${index} seed cache count`);
  assert.equal(result.dawnBroodLedgers.length, 1, `case ${index} ledger count`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.ecologyPressure >= 0 && result.summary.ecologyPressure <= 1, `case ${index} pressure bounds`);
  assert.ok(["open-meadow-after-fledging", "hold-fox-buffer", "mark-dew-paths", "find-ground-nests"].includes(result.summary.phase), `case ${index} phase enum`);
  assert.equal(result.rendererHandoff.descriptorCount, result.rendererHandoff.descriptors.length, `case ${index} descriptor count`);
  assert.equal(result.rendererHandoff.counts.total, result.rendererHandoff.descriptorCount, `case ${index} total count`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
}

const malformed = domain.describe({ seed: "malformed" });
assert.equal(malformed.rendererHandoff.descriptorCount, 39, "malformed state still emits full descriptor set");
assert.ok(results.at(-1).summary.readiness >= results[0].summary.readiness, "prepared meadow should improve readiness");

console.log("Meadow skylark nest rescue readiness kits smoke passed 10 intake cases.");
