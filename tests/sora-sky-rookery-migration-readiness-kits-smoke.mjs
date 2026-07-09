import assert from "node:assert/strict";
import {
  SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
  createSoraSkyRookeryMigrationReadinessDomainKit
} from "../experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js";

const domain = createSoraSkyRookeryMigrationReadinessDomainKit();
assert.ok(SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE.includes("sora-sky-rookery-migration-readiness-domain"));
assert.ok(domain.kits.includes("sora-migratory-flock-vector-kit"));
assert.ok(domain.kits.includes("sora-sanctuary-runway-handoff-kit"));

const intakeCases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 11,
  readiness: 0.24 + index * 0.07,
  input: {
    thrust: index % 2,
    bank: (index - 4.5) / 4.5,
    climb: index % 3 === 0 ? 1 : index % 3 === 1 ? 0 : -0.4,
    pointerActive: index % 2 === 0,
    pointerX: index / 9,
    pointerY: 1 - index / 9
  },
  routePreview: { handoffPackets: { packets: Array.from({ length: 2 + (index % 3) }, (_, packetIndex) => ({ id: packetIndex })) } },
  skyNegotiationReadiness: { rendererHandoff: { descriptorCounts: { thermalLadderChoices: 3 + (index % 4) } } },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 18 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 20 + index } } }
}));

for (const [index, input] of intakeCases.entries()) {
  const readiness = domain.describe(input);
  assert.equal(readiness.kind, "sora-sky-rookery-migration-readiness", `case ${index} readiness kind`);
  assert.ok(["migration-ready", "routes-forming", "rookery-at-risk"].includes(readiness.missionState), `case ${index} mission state enum`);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} renderer contract`);
  assert.equal(readiness.rendererHandoff.counts.migratoryFlockVectors, 4, `case ${index} flock vector count`);
  assert.equal(readiness.rendererHandoff.counts.rookeryNestAnchors, 4, `case ${index} rookery anchor count`);
  assert.equal(readiness.rendererHandoff.counts.updraftRestColumns, 4, `case ${index} updraft rest count`);
  assert.equal(readiness.rendererHandoff.counts.stormGapTimingWindows, 4, `case ${index} storm gap count`);
  assert.equal(readiness.rendererHandoff.counts.dawnBandingRosters, 4, `case ${index} dawn roster count`);
  assert.equal(readiness.rendererHandoff.counts.sanctuaryRunwayHandoffs, 4, `case ${index} sanctuary runway count`);
  assert.equal(readiness.rendererHandoff.counts.total, 24, `case ${index} total descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.migratoryFlockVectors.every((item) => item.kind === "sora-migratory-flock-vector"), `case ${index} flock vector kinds`);
  assert.ok(readiness.rendererHandoff.descriptors.sanctuaryRunwayHandoffs.every((item) => item.kind === "sora-sanctuary-runway-handoff"), `case ${index} runway handoff kinds`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `case ${index} serializable`);
}

console.log("Sora sky rookery migration readiness kit smoke passed: 10 intake cases.");
