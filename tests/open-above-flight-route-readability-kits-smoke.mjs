import assert from "node:assert/strict";
import {
  OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE,
  createOpenAboveAltitudeReserveMeterKit,
  createOpenAboveFlightRouteReadabilityDomainKit,
  createOpenAboveFlightRouteRendererHandoffKit,
  createOpenAboveFlockDraftWakeKit,
  createOpenAboveHomewardBearingThreadKit,
  createOpenAboveLandingMeadowGhostKit,
  createOpenAboveRidgeHazardShelfKit,
  createOpenAboveUpdraftCorridorKit
} from "../experiments/the-open-above/open-above-flight-route-readability-kits.js";

const makeState = (overrides = {}) => ({
  frame: 180,
  elapsed: 3,
  input: { bankLeft: false, bankRight: true, pitchDown: false, boost: false },
  body: {
    speed: 92,
    altitude: 260,
    clearance: 190,
    position: { x: 120, y: 260, z: -80 },
    rotation: { yaw: 0.15, pitch: 0.04, roll: 0.18 },
    velocity: { x: 18, y: 1, z: -78 },
    carve: { turnStrength: 0.42 },
    stability: { sinkRate: -8 },
    ...(overrides.body ?? {})
  },
  flock: {
    agents: Array.from({ length: 5 }, (_, index) => ({
      id: `flock-${index}`,
      velocity: { x: 3 + index, y: 0, z: -24 - index },
      phase: index * 0.7
    }))
  },
  ...overrides
});

const cases = [
  makeState({ frame: 1, body: { speed: 46, clearance: 70, stability: { sinkRate: -28 } } }),
  makeState({ frame: 55, body: { speed: 112, clearance: 260, carve: { turnStrength: 0.88 } } }),
  makeState({ frame: 110, body: { speed: 74, clearance: 135, rotation: { yaw: 1.2, roll: -0.42 } } }),
  makeState({ frame: 170, input: { pitchDown: true }, body: { speed: 48, clearance: 180 } }),
  makeState({ frame: 240, body: { speed: 144, clearance: 310, position: { x: 800, y: 310, z: 620 } } }),
  makeState({ frame: 320, flock: { agents: [] }, body: { speed: 68, clearance: 95 } }),
  makeState({ frame: 420, body: { speed: 128, clearance: 220, stability: { sinkRate: 0 } } }),
  makeState({ frame: 540, body: { speed: 38, clearance: 58, position: { x: -420, y: 58, z: 510 } } }),
  makeState({ frame: 660, input: { bankLeft: true, boost: true }, body: { speed: 154, clearance: 175 } }),
  makeState({ frame: 780, body: { speed: 86, clearance: 245, rotation: { yaw: -1.4, roll: 0.06 } } })
];

const updraftKit = createOpenAboveUpdraftCorridorKit();
const ridgeKit = createOpenAboveRidgeHazardShelfKit();
const landingKit = createOpenAboveLandingMeadowGhostKit();
const draftKit = createOpenAboveFlockDraftWakeKit();
const reserveKit = createOpenAboveAltitudeReserveMeterKit();
const homeKit = createOpenAboveHomewardBearingThreadKit();
const handoffKit = createOpenAboveFlightRouteRendererHandoffKit();
const domain = createOpenAboveFlightRouteReadabilityDomainKit();

assert.ok(OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE.includes("open-above-flight-route-readability-domain"), "tree names the domain");
assert.ok(OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE.includes("renderer consumes descriptors only"), "tree names the renderer handoff boundary");

for (const [index, state] of cases.entries()) {
  const updrafts = updraftKit.describe(state);
  assert.equal(updrafts.length, 6, `case ${index} creates six updraft corridors`);
  assert.ok(updrafts.every((item) => item.routeValue >= 0 && item.routeValue <= 1), `case ${index} clamps updraft route value`);

  const ridges = ridgeKit.describe(state);
  assert.equal(ridges.length, 5, `case ${index} creates five ridge hazard shelves`);
  assert.ok(ridges.every((item) => ["clear", "watch", "critical"].includes(item.urgency)), `case ${index} labels ridge urgency`);

  const landings = landingKit.describe(state);
  assert.equal(landings.length, 4, `case ${index} creates four landing ghosts`);
  assert.ok(landings.every((item) => item.readiness >= 0 && item.readiness <= 1), `case ${index} clamps landing readiness`);

  const drafts = draftKit.describe(state);
  assert.equal(drafts.length, Math.min(6, state.flock?.agents?.length ?? 0), `case ${index} maps flock draft wakes`);

  const reserve = reserveKit.describe(state);
  assert.equal(reserve.length, 1, `case ${index} creates one altitude reserve meter`);
  assert.ok(reserve[0].energy >= 0 && reserve[0].energy <= 1, `case ${index} clamps altitude energy`);

  const home = homeKit.describe(state);
  assert.equal(home.length, 6, `case ${index} creates six homeward thread segments`);
  assert.ok(home.every((item) => item.alignment >= 0 && item.alignment <= 1), `case ${index} clamps home alignment`);

  const handoff = handoffKit.compose({
    updraftCorridors: updrafts,
    ridgeHazardShelves: ridges,
    landingMeadowGhosts: landings,
    flockDraftWakes: drafts,
    altitudeReserveMeters: reserve,
    homewardBearingThreads: home
  });
  assert.equal(handoff.contract, "renderer-consumes-descriptors-only", `case ${index} keeps handoff descriptor-only`);
  assert.equal(handoff.counts.total, handoff.flatDescriptors.length, `case ${index} mirrors flattened descriptor counts`);

  const composed = domain.compose(state);
  assert.equal(composed.rendererHandoff.contract, "renderer-consumes-descriptors-only", `case ${index} domain handoff is descriptor-only`);
  assert.equal(composed.summary.descriptorCount, composed.rendererHandoff.counts.total, `case ${index} mirrors domain summary count`);
  assert.doesNotThrow(() => JSON.stringify(composed), `case ${index} output is serializable`);
}

const lowReserve = domain.compose(cases[7]);
assert.ok(lowReserve.groups.altitudeReserveMeters[0].danger > 0.8, "low-clearance case raises reserve danger");
assert.ok(lowReserve.summary.descriptorCount >= 20, "composite domain emits a substantial descriptor set");

console.log("Open Above flight route readability kits smoke passed");
