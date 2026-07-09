import assert from "node:assert/strict";
import {
  createBelayPostKit,
  createDawnStretcherLedgerKit,
  createMedPackCacheKit,
  createNextLedgeRidgeStretcherRelayReadinessDomainKit,
  createRidgeSignalPanelKit,
  createRidgeStretcherRelayRendererHandoffKit,
  createStretcherAnchorKit,
  createWindShearRibbonKit
} from "../experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js";

const domain = createNextLedgeRidgeStretcherRelayReadinessDomainKit();

function makeCase(index) {
  const ledges = Array.from({ length: 9 }, (_, ledgeIndex) => ({
    id: `ridge-${ledgeIndex}`,
    x: ledgeIndex * 78 - 260 + (index % 2) * 12,
    y: 80 + ledgeIndex * 56 + (index % 4) * 7,
    z: 8 + ledgeIndex,
    type: ledgeIndex === 8 ? "summit" : ledgeIndex % 3 === 0 ? "rest" : "normal",
    safe: ledgeIndex % 3 === 0 || ledgeIndex === 8
  }));
  return {
    levelId: `next-ledge-ridge-stretcher-case-${index}`,
    route: { id: "ridge-stretcher-test-route", ledges },
    player: { x: -250 + index * 46, y: 86 + index * 39, z: 12 },
    camera: { x: -210 + index * 20, y: 140 + index * 24, z: 250 },
    currentAnchorId: ledges[Math.min(8, Math.floor(index / 2))].id,
    lastLedgeId: ledges[Math.min(8, Math.floor(index / 2))].id,
    visitedLedgeIds: ledges.slice(0, Math.min(9, index + 1)).map((ledge) => ledge.id),
    stamina: 24 + index * 9,
    constants: { maxStamina: 118 },
    weather: { wind: 0.16 + index * 0.058, snow: 0.1 + index * 0.046, storm: 0.12 + index * 0.042 },
    ridgeStretcherRelay: { rescueProgress: index / 9 },
    mode: index === 0 ? "climbing" : index === 9 ? "summit" : "active"
  };
}

const atomicKits = [
  createStretcherAnchorKit(),
  createMedPackCacheKit(),
  createBelayPostKit(),
  createWindShearRibbonKit(),
  createRidgeSignalPanelKit(),
  createDawnStretcherLedgerKit(),
  createRidgeStretcherRelayRendererHandoffKit()
];

assert.equal(domain.id, "next-ledge-ridge-stretcher-relay-readiness-domain-kit");
assert.ok(domain.tree.includes("next-ledge-ridge-stretcher-relay-readiness-domain"));
assert.deepEqual(domain.ownership, {
  renderer: false,
  dom: false,
  browserInput: false,
  three: false,
  webgl: false,
  audio: false,
  assetLoading: false,
  frameLoop: false,
  physics: false,
  storage: false,
  network: false
});
assert.equal(domain.kits.length, 7, "six atomic kits plus handoff kit");
for (const kit of atomicKits) assert.ok(kit.id.includes("kit"), `${kit.id} names a kit`);

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const results = cases.map((item) => domain.describe(item));

for (const [index, result] of results.entries()) {
  assert.equal(result.kind, "domain-readiness", `case ${index} kind`);
  assert.ok(result.rendererContract.includes("renderer consumes descriptors only"), `case ${index} renderer contract`);
  assert.ok(result.stretcherAnchors.length >= 1, `case ${index} stretcher anchors`);
  assert.ok(result.medPackCaches.length >= 1, `case ${index} med-pack caches`);
  assert.ok(result.belayPosts.length >= 1, `case ${index} belay posts`);
  assert.ok(result.windShearRibbons.length >= 1, `case ${index} wind shear ribbons`);
  assert.ok(result.ridgeSignalPanels.length >= 1, `case ${index} signal panels`);
  assert.equal(result.dawnStretcherLedgers.length, 1, `case ${index} ledger`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(result.summary.windShearRisk >= 0 && result.summary.windShearRisk <= 1, `case ${index} wind risk bounds`);
  assert.ok(["lower-stretcher-to-extraction", "stabilize-belay-spans", "stock-medical-ledges", "pin-safe-stretcher-anchors"].includes(result.summary.phase), `case ${index} phase enum`);
  assert.equal(result.rendererHandoff.descriptorCount, result.rendererHandoff.descriptors.length, `case ${index} descriptor count`);
  assert.equal(result.rendererHandoff.counts.total, result.rendererHandoff.descriptorCount, `case ${index} total count`);
  assert.ok(result.rendererHandoff.counts.stretcherAnchors >= 1, `case ${index} handoff anchor count`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} JSON safe`);
}

const malformed = domain.describe({ levelId: "malformed" });
assert.equal(malformed.kind, "domain-readiness", "malformed state still returns readiness");
assert.equal(malformed.rendererHandoff.descriptorCount, 1, "malformed state keeps ledger handoff only");
assert.ok(malformed.summary.readiness >= 0 && malformed.summary.readiness <= 1, "malformed readiness clamped");
assert.ok(results.at(-1).summary.readiness >= results[0].summary.readiness, "mature rescue state should not regress below cold start");

console.log("Next Ledge ridge stretcher relay readiness kits smoke passed 10 intake cases.");
