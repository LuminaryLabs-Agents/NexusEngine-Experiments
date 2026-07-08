import assert from "node:assert/strict";
import { createSoraCompatibilityDomainKit } from "../experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js";

const kit = createSoraCompatibilityDomainKit({ targetPath: "../the-open-above/" });
const intakeCases = [
  { tick: 0, readiness: 0.1, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 5, readiness: 0.22, input: { thrust: 1, bank: -1, climb: 0.2 }, query: "?seed=left", hash: "#ridge" },
  { tick: 12, readiness: 0.35, input: { thrust: 0.4, bank: 1, climb: -0.4 }, query: "?seed=right", hash: "" },
  { tick: 24, readiness: 0.5, input: { pointerActive: true, pointerX: 0.1, pointerY: 0.7 }, query: "", hash: "#low" },
  { tick: 48, readiness: 0.64, input: { pointerActive: true, pointerX: 0.9, pointerY: 0.2 }, query: "?wind=high", hash: "#high" },
  { tick: 72, readiness: 0.78, input: { thrust: 1, bank: 0.25, climb: 1, launch: true }, query: "", hash: "" },
  { tick: 96, readiness: 0.91, input: { thrust: 0, bank: -0.25, climb: -1 }, query: "?debug=1", hash: "#handoff" },
  { tick: 128, readiness: 1, input: { thrust: 1, bank: 0, climb: 0, launch: true }, query: "?profile=sora", hash: "#launch" },
  { tick: 256, readiness: -5, input: { thrust: 3, bank: -4, climb: 2 }, query: "?clamp=true", hash: "#safe" },
  { tick: 512, readiness: 5, input: { thrust: -3, bank: 4, climb: -2, pointerX: 2, pointerY: -1 }, query: "?clamp=max", hash: "#safe" }
];

for (const [index, input] of intakeCases.entries()) {
  const described = kit.describe(input);
  assert.equal(described.kind, "sora-compatibility-domain", `case ${index} domain kind`);
  assert.equal(described.routeId, "sora-the-infinite", `case ${index} route id`);
  assert.equal(described.targetRouteId, "the-open-above", `case ${index} target route`);
  assert.ok(described.readiness >= 0 && described.readiness <= 1, `case ${index} readiness clamps`);
  assert.equal(described.alias.kind, "alias-provenance", `case ${index} alias kind`);
  assert.equal(described.launchVectors.lanes.length, 6, `case ${index} vector count`);
  assert.equal(described.skyMemoryBands.bands.length, 8, `case ${index} sky band count`);
  assert.equal(described.continuityGate.gates.length, 3, `case ${index} continuity gates`);
  assert.ok(described.inputCoaching.coaching.length >= 3, `case ${index} coaching descriptors`);
  assert.equal(described.rendererHandoff.contract, "renderer consumes descriptors only", `case ${index} handoff contract`);
  assert.equal(described.rendererHandoff.descriptorCounts.launchVectors, 6, `case ${index} handoff vector count`);
  assert.equal(described.rendererHandoff.descriptorCounts.skyMemoryBands, 8, `case ${index} handoff band count`);
  assert.doesNotThrow(() => JSON.stringify(described), `case ${index} serializable`);
  const serialized = JSON.stringify(described);
  assert.ok(!serialized.includes("new THREE"), `case ${index} no Three ownership`);
  assert.ok(!serialized.includes("document.create"), `case ${index} no DOM creation`);
  assert.ok(!serialized.includes("requestAnimationFrame"), `case ${index} no frame loop`);
}

const snapshot = kit.snapshot(intakeCases[7]);
assert.equal(snapshot.routeId, "sora-the-infinite");
assert.equal(snapshot.targetRouteId, "the-open-above");
assert.ok(snapshot.href.includes("../the-open-above/"));
assert.equal(snapshot.descriptorCounts.launchVectors, 6);
assert.equal(snapshot.descriptorCounts.skyMemoryBands, 8);

console.log(`Sora compatibility domain kit smoke passed ${intakeCases.length} intake cases.`);
