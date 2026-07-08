import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_STORM_EVACUATION_DOMAIN_TREE,
  FOGLINE_STORM_EVACUATION_KIT_NAMES,
  createFoglineBatteryCacheKit,
  createFoglineConvoyRallyMarkerKit,
  createFoglineExtractionFlareWindowKit,
  createFoglineRadioStaticNoiseKit,
  createFoglineStormEvacuationReadinessDomainKit,
  createFoglineStormEvacuationRendererHandoffKit,
  createFoglineStretcherLaneKit,
  createFoglineThunderheadVectorKit
} from "../experiments/fogline-relay/src/fogline-storm-evacuation-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 8 ? "complete" : caseIndex === 9 ? "failed" : "active",
    player: { x: -5 + caseIndex * 1.05, z: -3 + caseIndex * 4.4, yaw: caseIndex * 0.23 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= level.relays.length, openProgress: scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol",
      x: wraith.x + caseIndex * 0.25,
      z: wraith.z - caseIndex * 0.15
    })),
    stats: { scanned, elapsed: caseIndex * 37, timeBudget: 420, scanActive: caseIndex % 2 === 0 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "canvas", "assetLoader", "THREE", "requestAnimationFrame"]) {
    assert.ok(!serialized.includes(`\"${forbidden}\"`), `${label} should not contain ${forbidden} ownership`);
  }
}

function assertDescriptorList(list, label) {
  assert.ok(Array.isArray(list), `${label} should return an array`);
  assert.ok(list.length > 0, `${label} should produce at least one descriptor`);
  for (const descriptor of list) {
    assert.ok(descriptor.id, `${label} descriptor should have an id`);
    assert.ok(descriptor.archetype, `${label} descriptor should have an archetype`);
    assert.ok(descriptor.compatibleBucket, `${label} descriptor should expose a renderer-compatible bucket`);
    assert.ok(descriptor.position && Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z), `${label} descriptor should expose finite x/z position`);
  }
  assertSerializable(list, label);
  assertRendererNeutral(list, label);
}

const cases = Array.from({ length: 10 }, (_, caseIndex) => ({ level, route: level.route, game: makeGame(caseIndex) }));
const thunderheadKit = createFoglineThunderheadVectorKit();
const radioStaticKit = createFoglineRadioStaticNoiseKit();
const batteryCacheKit = createFoglineBatteryCacheKit();
const stretcherLaneKit = createFoglineStretcherLaneKit();
const convoyRallyKit = createFoglineConvoyRallyMarkerKit();
const extractionFlareKit = createFoglineExtractionFlareWindowKit();
const rendererHandoffKit = createFoglineStormEvacuationRendererHandoffKit();
const domainKit = createFoglineStormEvacuationReadinessDomainKit();
let checked = 0;

for (const input of cases) {
  const thunderheads = thunderheadKit.describe(input);
  assertDescriptorList(thunderheads, "thunderhead vector kit");
  assert.equal(thunderheads.length, 3, "thunderhead kit should emit three storm vectors");
  assert.ok(thunderheads.every((descriptor) => descriptor.stormPressure >= 0 && descriptor.stormPressure <= 1));
  checked += 1;

  const radioStatic = radioStaticKit.describe(input);
  assertDescriptorList(radioStatic, "radio static noise kit");
  assert.equal(radioStatic.length, level.relays.length, "radio static kit should track each relay");
  assert.ok(radioStatic.every((descriptor) => descriptor.staticLoad >= 0 && descriptor.staticLoad <= 1));
  checked += 1;

  const batteryCaches = batteryCacheKit.describe(input);
  assertDescriptorList(batteryCaches, "battery cache kit");
  assert.equal(batteryCaches.length, level.relays.length, "battery cache kit should emit one cache per relay");
  assert.ok(batteryCaches.every((descriptor) => descriptor.readiness >= 0 && descriptor.readiness <= 1));
  checked += 1;

  const stretcherLanes = stretcherLaneKit.describe(input);
  assertDescriptorList(stretcherLanes, "stretcher lane kit");
  assert.equal(stretcherLanes.length, level.route.length - 1, "stretcher lane kit should cover every route segment");
  assert.ok(stretcherLanes.every((descriptor) => descriptor.length > 0 && descriptor.width > 0));
  checked += 1;

  const convoyMarkers = convoyRallyKit.describe(input);
  assertDescriptorList(convoyMarkers, "convoy rally marker kit");
  assert.equal(convoyMarkers.length, 3, "convoy rally kit should emit player, mid-route, and gate markers");
  assert.ok(convoyMarkers.every((descriptor) => descriptor.convoyConfidence >= 0 && descriptor.convoyConfidence <= 1));
  checked += 1;

  const extractionFlares = extractionFlareKit.describe(input);
  assertDescriptorList(extractionFlares, "extraction flare window kit");
  assert.equal(extractionFlares.length, 2, "extraction flare kit should emit gate window and storm deadline descriptors");
  assert.ok(extractionFlares.every((descriptor) => descriptor.radius > 0));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "storm evacuation composite");
  assert.equal(composite.thunderheadVectors.length, thunderheads.length);
  assert.equal(composite.radioStaticNoiseFields.length, radioStatic.length);
  assert.equal(composite.batteryCaches.length, batteryCaches.length);
  assert.equal(composite.stretcherLanes.length, stretcherLanes.length);
  assert.equal(composite.convoyRallyMarkers.length, convoyMarkers.length);
  assert.equal(composite.extractionFlareWindows.length, extractionFlares.length);
  assert.equal(composite.rendererHandoff.descriptorCount, composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(handoff.descriptorCount, composite.drawOrder.length);
  assert.equal(handoff.ownership.renderer, "consume-only");
  assert.equal(handoff.ownership.dom, "excluded");
  assert.equal(handoff.ownership.browserInput, "excluded");
  assert.equal(handoff.ownership.audio, "excluded");
  assertSerializable(handoff, "storm evacuation renderer handoff kit");
  checked += 1;
}

assert.ok(FOGLINE_STORM_EVACUATION_DOMAIN_TREE.includes("fogline-storm-evacuation-readiness-domain"));
assert.deepEqual(FOGLINE_STORM_EVACUATION_KIT_NAMES, [
  "fogline-thunderhead-vector-kit",
  "fogline-radio-static-noise-kit",
  "fogline-battery-cache-kit",
  "fogline-stretcher-lane-kit",
  "fogline-convoy-rally-marker-kit",
  "fogline-extraction-flare-window-kit",
  "fogline-storm-evacuation-renderer-handoff-kit",
  "fogline-storm-evacuation-readiness-domain-kit"
]);
assert.equal(checked, 80, "8 Fogline storm evacuation surfaces should each receive 10 smoke intake cases");

console.log("Fogline storm evacuation readiness kits smoke passed with 80 intake cases.");
