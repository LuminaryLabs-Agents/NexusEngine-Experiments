import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE,
  COZY_ISLAND_LAGOON_LANTERN_FORBIDDEN_OWNERSHIP,
  createCozyIslandLanternBuoyChainKit,
  createCozyIslandFireflyJarWaypointKit,
  createCozyIslandRainTarpAnchorKit,
  createCozyIslandWovenFishTrapKit,
  createCozyIslandSignalKiteSpoolKit,
  createCozyIslandOutriggerPickupWindowKit,
  createCozyIslandLagoonLanternRescueReadinessDomainKit
} from "../experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js";

const cases = [
  { name: "clear moon pickup", seed: "lagoon-01", tide: 0.36, moon: 0.86, fog: 0.12, rain: 0.08, hunger: 0.28, rescuedGuests: 3, volunteerCoverage: 0.72, waterClarity: 0.88, wind: { x: 0.24, z: 0.2 } },
  { name: "dense fog lanterns", seed: "lagoon-02", tide: 0.44, moon: 0.32, fog: 0.9, rain: 0.18, hunger: 0.36, rescuedGuests: 4, volunteerCoverage: 0.6, waterClarity: 0.55, wind: { x: 0.16, z: 0.12 } },
  { name: "moonless route", seed: "lagoon-03", tide: 0.4, moon: 0.08, fog: 0.46, rain: 0.22, hunger: 0.42, rescuedGuests: 5, volunteerCoverage: 0.48, waterClarity: 0.62, wind: { x: 0.1, z: 0.22 } },
  { name: "rain tarp emergency", seed: "lagoon-04", tide: 0.58, moon: 0.44, fog: 0.38, rain: 0.86, hunger: 0.36, rescuedGuests: 6, volunteerCoverage: 0.52, waterClarity: 0.58, wind: { x: 0.38, z: 0.32 } },
  { name: "hunger fish traps", seed: "lagoon-05", tide: 0.3, moon: 0.62, fog: 0.22, rain: 0.18, hunger: 0.92, rescuedGuests: 2, volunteerCoverage: 0.58, waterClarity: 0.8, wind: { x: 0.2, z: 0.18 } },
  { name: "volunteer gap", seed: "lagoon-06", tide: 0.48, moon: 0.5, fog: 0.34, rain: 0.26, hunger: 0.48, rescuedGuests: 4, volunteerCoverage: 0.16, waterClarity: 0.64, wind: { x: 0.18, z: 0.18 } },
  { name: "wind kite launch", seed: "lagoon-07", tide: 0.42, moon: 0.7, fog: 0.18, rain: 0.12, hunger: 0.32, rescuedGuests: 5, volunteerCoverage: 0.66, waterClarity: 0.72, wind: { x: 0.42, z: 0.32 } },
  { name: "murky lagoon", seed: "lagoon-08", tide: 0.52, moon: 0.6, fog: 0.5, rain: 0.34, hunger: 0.52, rescuedGuests: 3, volunteerCoverage: 0.44, waterClarity: 0.12, wind: { x: 0.12, z: 0.12 } },
  { name: "too high tide", seed: "lagoon-09", tide: 0.92, moon: 0.64, fog: 0.28, rain: 0.28, hunger: 0.4, rescuedGuests: 7, volunteerCoverage: 0.7, waterClarity: 0.68, wind: { x: 0.24, z: 0.22 } },
  { name: "fallback defaults", seed: "lagoon-10" }
];

const source = readFileSync("experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js", "utf8");
const implementationSource = source.replace(/export const COZY_ISLAND_LAGOON_LANTERN_FORBIDDEN_OWNERSHIP = \[[\s\S]*?\];/, "");
const domain = createCozyIslandLagoonLanternRescueReadinessDomainKit();

assert.ok(COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE.includes("night-navigation-domain"), "domain tree keeps navigation split");
assert.ok(COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE.includes("shoreline-shelter-domain"), "domain tree keeps shelter split");
assert.ok(COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree declares handoff policy");
for (const marker of COZY_ISLAND_LAGOON_LANTERN_FORBIDDEN_OWNERSHIP) {
  assert.equal(implementationSource.includes(marker), false, `kit source must not own ${marker}`);
}

for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.equal(readiness.kind, "cozy-island.lagoon-lantern-rescue.readiness", `${input.name}: readiness kind`);
  assert.ok(readiness.lanternBuoyChains.length >= 5, `${input.name}: lantern buoy descriptors`);
  assert.ok(readiness.fireflyJarWaypoints.length >= 4, `${input.name}: firefly waypoint descriptors`);
  assert.ok(readiness.rainTarpAnchors.length >= 3, `${input.name}: tarp anchor descriptors`);
  assert.ok(readiness.wovenFishTraps.length >= 3, `${input.name}: fish trap descriptors`);
  assert.ok(readiness.signalKiteSpools.length >= 2, `${input.name}: signal kite descriptors`);
  assert.equal(readiness.outriggerPickupWindows.length, 1, `${input.name}: pickup descriptor`);
  assert.equal(readiness.rendererHandoff.counts.total, readiness.rendererHandoff.descriptors.length, `${input.name}: handoff total mirrors descriptors`);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `${input.name}: handoff policy`);
  assert.doesNotThrow(() => JSON.stringify(readiness), `${input.name}: serializable output`);
}

assert.equal(createCozyIslandLanternBuoyChainKit(cases[1]).length, 6, "dense fog adds sixth lantern buoy");
assert.equal(createCozyIslandFireflyJarWaypointKit(cases[5]).length, 5, "low volunteer coverage adds fifth firefly jar");
assert.equal(createCozyIslandRainTarpAnchorKit(cases[3]).length, 4, "heavy rain adds fourth tarp anchor");
assert.equal(createCozyIslandWovenFishTrapKit(cases[4]).length, 4, "hunger adds fourth fish trap");
assert.equal(createCozyIslandSignalKiteSpoolKit(cases[6]).length, 3, "wind adds third signal kite spool");
assert.equal(createCozyIslandOutriggerPickupWindowKit(cases[1])[0].state.priority, "sound shore bell", "fog case changes pickup priority");

console.log(`cozy island lagoon lantern rescue readiness kits smoke passed ${cases.length} intake cases`);
