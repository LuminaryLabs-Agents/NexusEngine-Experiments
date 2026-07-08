import assert from "node:assert/strict";
import {
  TROPICAL_REEF_RESCUE_DOMAIN_TREE,
  createTropicalDistressFlareArcKit,
  createTropicalSnorkelSearchLaneKit,
  createTropicalRipCurrentHazardKit,
  createTropicalFirstAidCacheSparkKit,
  createTropicalRaftAnchorRouteKit,
  createTropicalExtractionPierBeaconKit,
  createTropicalReefRescueReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-reef-rescue-readiness-domain-kit.js";

assert.match(TROPICAL_REEF_RESCUE_DOMAIN_TREE, /tropical-reef-rescue-readiness-domain/);
assert.match(TROPICAL_REEF_RESCUE_DOMAIN_TREE, /renderer consumes descriptors only/);

const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 7.25,
  orbit: index * 0.21,
  camera: { angle: index * 0.21 },
  palms: [{ id: `palm-${index}`, x: -8 + index, y: 2.4, z: -14 }],
  trees: [{ id: `tree-${index}`, x: 8 - index, y: 2.1, z: -10 }],
  coconuts: [{ id: `aid-${index}`, x: -7 + index, y: 0.7, z: 8 - index }],
  floatProps: [{ id: `raft-${index}`, x: 6 - index, y: 0.2, z: -6 - index }],
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 5 } } }
}));

const distress = createTropicalDistressFlareArcKit();
const snorkel = createTropicalSnorkelSearchLaneKit();
const current = createTropicalRipCurrentHazardKit();
const firstAid = createTropicalFirstAidCacheSparkKit();
const raft = createTropicalRaftAnchorRouteKit();
const pier = createTropicalExtractionPierBeaconKit();
const domain = createTropicalReefRescueReadinessDomainKit();

for (const [index, state] of cases.entries()) {
  const distressFlareArcs = distress.describe(state);
  const snorkelSearchLanes = snorkel.describe(state);
  const ripCurrentHazards = current.describe(state);
  const firstAidCacheSparks = firstAid.describe(state);
  const raftAnchorRoutes = raft.describe(state);
  const extractionPierBeacons = pier.describe(state);
  const result = domain.describe(state);
  const handoff = result.rendererHandoff;

  assert.equal(distressFlareArcs.length >= 3, true, `case ${index} distress arcs`);
  assert.equal(distressFlareArcs.every((arc) => Number.isFinite(arc.urgency) && arc.rendererContract.renderer === "presentation-only"), true, `case ${index} distress contract`);
  assert.equal(snorkelSearchLanes.length >= 4, true, `case ${index} snorkel lanes`);
  assert.equal(snorkelSearchLanes.every((lane) => Number.isFinite(lane.coverage) && Number.isFinite(lane.missingPatchRisk)), true, `case ${index} search lane numbers`);
  assert.equal(ripCurrentHazards.length >= 3, true, `case ${index} rip currents`);
  assert.equal(ripCurrentHazards.some((hazard) => hazard.kind === "tropical-rip-current-hazard"), true, `case ${index} rip current kind`);
  assert.equal(firstAidCacheSparks.length >= 1, true, `case ${index} first aid sparks`);
  assert.equal(firstAidCacheSparks.every((cache) => Number.isFinite(cache.stabilizesSeconds)), true, `case ${index} first aid stabilizes`);
  assert.equal(raftAnchorRoutes.length >= 3, true, `case ${index} raft routes`);
  assert.equal(raftAnchorRoutes.every((route) => Number.isFinite(route.anchorScore)), true, `case ${index} raft anchor score`);
  assert.equal(extractionPierBeacons.length >= 2, true, `case ${index} extraction pier beacons`);
  assert.equal(extractionPierBeacons.every((beacon) => Number.isFinite(beacon.extractionConfidence)), true, `case ${index} extraction confidence`);
  assert.equal(handoff.kind, "renderer-handoff", `case ${index} renderer handoff kind`);
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} renderer handoff contract`);
  assert.equal(handoff.counts.total, Object.values(handoff.descriptors).reduce((sum, group) => sum + group.length, 0), `case ${index} handoff count mirrors descriptors`);
  assert.equal(result.subdomains.searchSignal.kits.length, 2, `case ${index} search subdomain split`);
  assert.equal(result.subdomains.rescueSafety.kits.length, 2, `case ${index} rescue subdomain split`);
  assert.equal(result.subdomains.extractionRouting.kits.length, 2, `case ${index} extraction subdomain split`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} serializable`);
}

console.log("tropical reef rescue readiness kit smoke passed");
