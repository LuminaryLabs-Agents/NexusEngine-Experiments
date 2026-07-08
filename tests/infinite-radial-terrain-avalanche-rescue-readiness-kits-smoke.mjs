import assert from "node:assert/strict";
import {
  TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE,
  createTerrainBuriedCampTransponderKit,
  createTerrainSnowfieldProbeLaneKit,
  createTerrainAvalancheCrownHazardKit,
  createTerrainRidgeShelterPocketKit,
  createTerrainRescueSledCorridorKit,
  createTerrainMedevacBeaconWindowKit,
  createTerrainAvalancheRescueRendererHandoffKit,
  createTerrainAvalancheRescueReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-avalanche-rescue-readiness-kits.js";

const makeSample = (index, tag = `sample-${index}`) => ({
  tag,
  x: index * 360 - 1120,
  z: index * -260 + 620,
  height: 880 + index * 92 + Math.sin(index) * 120,
  slope: 12 + (index % 7) * 5,
  climate: { vegetationPotential: Math.max(0.05, 0.32 - index * 0.012), rainfallMmYear: 420 + index * 40, temperatureC: 4 - index * 0.8, snowlineMeters: 980 },
  hydrology: { flow: { wetnessIndex: Math.min(1, 0.1 + index * 0.035), channelPotential: Math.min(1, 0.16 + index * 0.045) }, stream: { streamOrder: index % 5, drainageDensityKmPerKm2: 0.9 + index * 0.18 } },
  landform: { confidence: Math.min(1, 0.46 + index * 0.045), terrainRuggedness: Math.min(1, 0.2 + (index % 5) * 0.14), landform: tag.includes("crown") ? "ridge" : index % 2 ? "saddle" : "bench" },
  material: { materialWeights: { bedrock: 0.22 + index * 0.035, soil: 0.64 - index * 0.022, wetChannel: Math.min(1, 0.08 + index * 0.035), snow: Math.min(1, 0.14 + index * 0.07) }, vegetationMask: Math.max(0.06, 0.28 - index * 0.01) }
});

const tags = ["rescue-focus", "buried-camp", "snowfield-probe", "avalanche-crown", "ridge-shelter", "sled-valley", "medevac-bench", "far-crown"];
const intakes = Array.from({ length: 10 }, (_, index) => ({
  time: index / 6,
  camera: { position: { x: index * 160, y: 1100 + index * 70, z: -index * 145 }, yaw: index * 0.16, pitch: -0.42 + index * 0.018 },
  terrain: { origin: { x: 0, z: 0 }, focus: { x: index * 55, y: 860 + index * 20, z: -index * 30 }, bands: [] },
  terrainSample: makeSample(index, "rescue-focus"),
  samples: Array.from({ length: 8 }, (_, sampleIndex) => makeSample(sampleIndex + index, tags[sampleIndex]))
}));

assert.equal(TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE.root, "terrain-avalanche-rescue-readiness-domain");
assert.equal(TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE.subdomains.length, 4);
assert.ok(TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE.contract.includes("no DOM"));
assert.ok(TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE.contract.includes("Three.js"));

const transponderKit = createTerrainBuriedCampTransponderKit();
const probeLaneKit = createTerrainSnowfieldProbeLaneKit();
const crownHazardKit = createTerrainAvalancheCrownHazardKit();
const shelterPocketKit = createTerrainRidgeShelterPocketKit();
const sledCorridorKit = createTerrainRescueSledCorridorKit();
const medevacBeaconKit = createTerrainMedevacBeaconWindowKit();
const handoffKit = createTerrainAvalancheRescueRendererHandoffKit();
const domain = createTerrainAvalancheRescueReadinessDomainKit();

for (const intake of intakes) {
  const transponders = transponderKit.describe(intake);
  const probes = probeLaneKit.describe(intake);
  const crowns = crownHazardKit.describe(intake);
  const shelters = shelterPocketKit.describe(intake);
  const sleds = sledCorridorKit.describe(intake);
  const medevacs = medevacBeaconKit.describe(intake);
  const handoff = handoffKit.describe(intake);
  const described = domain.describe(intake);

  assert.ok(transponders.length > 0 && transponders.length <= 5);
  assert.ok(transponders.every((item) => item.kind === "buried-camp-transponder" && item.rendererContract.rendererMustNotOwn.includes("Three.js")));
  assert.ok(probes.length > 0 && probes.length <= 5);
  assert.ok(probes.every((lane) => lane.kind === "snowfield-probe-lane" && ["deep-probe", "guarded-probe", "quick-sweep"].includes(lane.status)));
  assert.ok(crowns.length > 0 && crowns.length <= 4);
  assert.ok(crowns.every((crown) => crown.kind === "avalanche-crown-hazard" && ["closed", "spotter-only", "crossable"].includes(crown.status)));
  assert.ok(shelters.length > 0 && shelters.length <= 4);
  assert.ok(shelters.every((shelter) => shelter.kind === "ridge-shelter-pocket" && shelter.radiusMeters > 0));
  assert.ok(sleds.length > 0 && sleds.length <= 5);
  assert.ok(sleds.every((sled) => sled.kind === "rescue-sled-corridor" && ["fast-sled", "roped-sled", "carry-out"].includes(sled.status)));
  assert.equal(medevacs.length, 3);
  assert.ok(medevacs.every((beacon) => beacon.kind === "medevac-beacon-window" && ["open", "standby", "grounded"].includes(beacon.window)));
  assert.equal(handoff.counts.buriedCampTransponders, transponders.length);
  assert.equal(handoff.counts.snowfieldProbeLanes, probes.length);
  assert.equal(handoff.counts.avalancheCrownHazards, crowns.length);
  assert.equal(handoff.counts.ridgeShelterPockets, shelters.length);
  assert.equal(handoff.counts.rescueSledCorridors, sleds.length);
  assert.equal(handoff.counts.medevacBeaconWindows, medevacs.length);
  assert.equal(handoff.counts.total, Object.values(handoff.descriptors).reduce((sum, list) => sum + list.length, 0));
  assert.equal(described.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(Number.isFinite(described.summary.readiness));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(described)));
}

const source = await import("node:fs").then(({ readFileSync }) => readFileSync("experiments/_kits/infinite-radial-terrain/terrain-avalanche-rescue-readiness-kits.js", "utf8"));
for (const forbidden of ["document.", "window.", "AudioContext", "new Audio", "requestAnimationFrame", "addEventListener"])
  assert.ok(!source.includes(forbidden), `kit should not own ${forbidden}`);

console.log("infinite radial terrain avalanche rescue readiness kit smoke passed: 10 intake cases");
