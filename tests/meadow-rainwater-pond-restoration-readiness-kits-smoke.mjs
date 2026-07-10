import assert from "node:assert/strict";
import {
  createDuskPondLedgerKit,
  createFrogCallStoneKit,
  createMeadowRainwaterPondRestorationReadinessDomainKit,
  createPondMirrorPoolKit,
  createRainChainBasinKit,
  createRainwaterPondRestorationRendererHandoffKit,
  createReedFilterBedKit,
  createSteppingLogRouteKit
} from "../experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js";

const domain = createMeadowRainwaterPondRestorationReadinessDomainKit();

function makeCase(index) {
  return {
    seed: `meadow-rainwater-pond-case-${index}`,
    build: `meadow-build-${index}`,
    meadowRadius: 78 + index * 4,
    grassBlades: 7400 + index * 1750,
    sheep: 7 + index,
    vfxParticles: 520 + index * 160,
    rainfall: 0.18 + index * 0.075,
    pondRestoration: {
      progress: index / 9,
      frogCalls: index,
      reedFilters: Math.floor(index / 2),
      steppingLogs: Math.floor(index / 3)
    }
  };
}

const atomicKits = [
  createRainChainBasinKit(),
  createPondMirrorPoolKit(),
  createFrogCallStoneKit(),
  createReedFilterBedKit(),
  createSteppingLogRouteKit(),
  createDuskPondLedgerKit(),
  createRainwaterPondRestorationRendererHandoffKit()
];

assert.equal(domain.id, "meadow-rainwater-pond-restoration-readiness-domain-kit");
assert.ok(domain.tree.includes("meadow-rainwater-pond-restoration-readiness-domain"));
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
  assert.equal(result.rainChainBasins.length, 5, `case ${index} basin count`);
  assert.equal(result.pondMirrorPools.length, 4, `case ${index} pool count`);
  assert.equal(result.frogCallStones.length, 6, `case ${index} frog stone count`);
  assert.equal(result.reedFilterBeds.length, 5, `case ${index} reed bed count`);
  assert.equal(result.steppingLogRoutes.length, 7, `case ${index} stepping log count`);
  assert.equal(result.duskPondLedgers.length, 1, `case ${index} ledger count`);
  assert.equal(result.rendererHandoff.descriptorCount, 28, `case ${index} descriptor count`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.siltPressure >= 0 && result.summary.siltPressure <= 1, `case ${index} pressure bounds`);
  assert.ok(["release-evening-fireflies", "listen-for-frog-chorus", "weave-reed-filters", "catch-first-rain"].includes(result.summary.phase), `case ${index} phase enum`);
  assert.equal(result.rendererHandoff.counts.total, result.rendererHandoff.descriptors.length, `case ${index} total count`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
}

const malformed = domain.describe({ seed: "malformed" });
assert.equal(malformed.rendererHandoff.descriptorCount, 28, "malformed state still emits full descriptor set");
assert.ok(results.at(-1).summary.readiness >= results[0].summary.readiness, "prepared pond should improve readiness");

console.log("Meadow rainwater pond restoration readiness kits smoke passed 10 intake cases.");
