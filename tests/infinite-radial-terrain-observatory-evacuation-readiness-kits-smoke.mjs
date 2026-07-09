import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE,
  createTerrainObservatoryDistressBeaconKit,
  createTerrainWeatherTowerStabilityKit,
  createTerrainRidgeSwitchbackRouteKit,
  createTerrainSupplyDropZoneKit,
  createTerrainSummitRadioRelayKit,
  createTerrainEvacHeliWindowKit,
  createTerrainObservatoryEvacuationRendererHandoffKit,
  createTerrainObservatoryEvacuationReadinessDomainKit
} from "../experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js";

const makeSample = (index, tag = `sample-${index}`) => ({
  tag,
  x: index * 390 - 1200,
  z: index * -275 + 700,
  height: 940 + index * 105 + Math.sin(index * 0.7) * 132,
  slope: 10 + (index % 8) * 4.6,
  climate: { vegetationPotential: Math.max(0.04, 0.36 - index * 0.014), rainfallMmYear: 460 + index * 42, temperatureC: 5 - index * 0.72, snowlineMeters: 980 },
  hydrology: { flow: { wetnessIndex: Math.min(1, 0.12 + index * 0.04), channelPotential: Math.min(1, 0.14 + index * 0.045) }, stream: { streamOrder: index % 5, drainageDensityKmPerKm2: 0.8 + index * 0.16 } },
  landform: { confidence: Math.min(1, 0.48 + index * 0.043), terrainRuggedness: Math.min(1, 0.18 + (index % 5) * 0.15), landform: tag.includes("tower") || tag.includes("summit") ? "ridge" : index % 2 ? "saddle" : "bench" },
  material: { materialWeights: { bedrock: 0.24 + index * 0.034, soil: 0.62 - index * 0.021, wetChannel: Math.min(1, 0.1 + index * 0.035), snow: Math.min(1, 0.12 + index * 0.065) }, vegetationMask: Math.max(0.05, 0.3 - index * 0.012) }
});

const tags = ["observatory-focus", "observatory-crew", "weather-tower", "ridge-switchback", "supply-drop-bench", "summit-radio", "heli-saddle", "storm-shadow-ridge"];
const intakes = Array.from({ length: 10 }, (_, index) => ({
  time: index / 5,
  camera: { position: { x: index * 180, y: 1160 + index * 75, z: -index * 155 }, yaw: index * 0.17, pitch: -0.42 + index * 0.02 },
  terrain: { origin: { x: 0, z: 0 }, focus: { x: index * 65, y: 910 + index * 24, z: -index * 36 }, bands: [] },
  terrainSample: makeSample(index, "observatory-focus"),
  samples: Array.from({ length: 8 }, (_, sampleIndex) => makeSample(sampleIndex + index, tags[sampleIndex]))
}));

assert.equal(TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE.root, "terrain-observatory-evacuation-readiness-domain");
assert.equal(TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE.subdomains.length, 4);
assert.ok(TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE.contract.includes("no DOM"));
assert.ok(TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE.contract.includes("Three.js"));

const beaconKit = createTerrainObservatoryDistressBeaconKit();
const towerKit = createTerrainWeatherTowerStabilityKit();
const routeKit = createTerrainRidgeSwitchbackRouteKit();
const dropKit = createTerrainSupplyDropZoneKit();
const relayKit = createTerrainSummitRadioRelayKit();
const heliKit = createTerrainEvacHeliWindowKit();
const handoffKit = createTerrainObservatoryEvacuationRendererHandoffKit();
const domain = createTerrainObservatoryEvacuationReadinessDomainKit();

for (const intake of intakes) {
  const beacons = beaconKit.describe(intake);
  const towers = towerKit.describe(intake);
  const routes = routeKit.describe(intake);
  const drops = dropKit.describe(intake);
  const relays = relayKit.describe(intake);
  const helis = heliKit.describe(intake);
  const handoff = handoffKit.describe(intake);
  const described = domain.describe(intake);

  assert.ok(beacons.length > 0 && beacons.length <= 5);
  assert.ok(beacons.every((item) => item.kind === "observatory-distress-beacon" && ["priority-evac", "watch", "stable"].includes(item.status)));
  assert.ok(towers.length > 0 && towers.length <= 4);
  assert.ok(towers.every((item) => item.kind === "weather-tower-stability" && ["locked", "brace", "evacuate"].includes(item.status)));
  assert.ok(routes.length > 0 && routes.length <= 5);
  assert.ok(routes.every((item) => item.kind === "ridge-switchback-route" && ["walk-out", "roped-descent", "hold-position"].includes(item.status)));
  assert.ok(drops.length > 0 && drops.length <= 4);
  assert.ok(drops.every((item) => item.kind === "supply-drop-zone" && ["drop-now", "mark-only", "unsafe"].includes(item.status)));
  assert.ok(relays.length > 0 && relays.length <= 4);
  assert.ok(relays.every((item) => item.kind === "summit-radio-relay" && ["clear-signal", "relay-chain", "signal-shadow"].includes(item.status)));
  assert.equal(helis.length, 3);
  assert.ok(helis.every((item) => item.kind === "evac-heli-window" && ["open", "standby", "grounded"].includes(item.window)));
  assert.equal(handoff.counts.observatoryDistressBeacons, beacons.length);
  assert.equal(handoff.counts.weatherTowerStabilities, towers.length);
  assert.equal(handoff.counts.ridgeSwitchbackRoutes, routes.length);
  assert.equal(handoff.counts.supplyDropZones, drops.length);
  assert.equal(handoff.counts.summitRadioRelays, relays.length);
  assert.equal(handoff.counts.evacHeliWindows, helis.length);
  assert.equal(handoff.counts.total, Object.values(handoff.descriptors).reduce((sum, list) => sum + list.length, 0));
  assert.equal(described.rendererHandoff.counts.total, handoff.counts.total);
  assert.ok(Number.isFinite(described.summary.readiness));
  assert.ok(["evac-ready", "partial-evac", "hold-and-stabilize"].includes(described.summary.status));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(described)));
}

const source = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js", "utf8");
for (const forbidden of ["document.", "window.", "AudioContext", "new Audio", "requestAnimationFrame", "addEventListener"])
  assert.ok(!source.includes(forbidden), `kit should not own ${forbidden}`);

console.log("infinite radial terrain observatory evacuation readiness kit smoke passed: 10 intake cases");
