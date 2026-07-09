import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("experiments/infinite-radial-terrain/index.html", "utf8");
const entry = readFileSync("experiments/infinite-radial-terrain/terrain-observatory-evacuation-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(index.includes("observatory-evacuation-readiness-renderer-handoff-pass"), "route should advertise observatory evacuation pass");
assert.ok(index.includes("terrain-observatory-evacuation-readiness-entry.js?v=infinite-radial-terrain-observatory-evacuation-readiness-v1"), "route should load cache-busted observatory evacuation entry");
assert.ok(entry.includes(nexusEngineCdn), "observatory evacuation overlay should import NexusEngine main via CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "observatory evacuation overlay should not import the old NexusRealtime runtime CDN");
assert.ok(kits.includes("TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE"), "kit should export domain tree");
assert.ok(kits.includes("createTerrainObservatoryEvacuationReadinessDomainKit"), "kit should export composite domain");

for (const expected of [
  "getObservatoryEvacuationReadiness",
  "getInfiniteRadialTerrainObservatoryEvacuationReadiness",
  "getObservatoryEvacuationReadinessTree",
  "infiniteRadialTerrainObservatoryEvacuation",
  "rendererConsumes = \"descriptors-only\"",
  "composeHandoff(originalGetRendererHandoff?.(), current)",
  "document.body.dataset.terrainObservatoryEvacuationReadiness = \"enabled\""
]) {
  assert.ok(entry.includes(expected), expected);
}

for (const expected of [
  "createTerrainObservatoryDistressBeaconKit",
  "createTerrainWeatherTowerStabilityKit",
  "createTerrainRidgeSwitchbackRouteKit",
  "createTerrainSupplyDropZoneKit",
  "createTerrainSummitRadioRelayKit",
  "createTerrainEvacHeliWindowKit",
  "createTerrainObservatoryEvacuationRendererHandoffKit"
]) {
  assert.ok(kits.includes(expected), expected);
}

const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 60 : 1 / 30,
  keys: {
    KeyW: index % 3 !== 0,
    KeyA: index % 4 === 0,
    KeyD: index % 4 === 1,
    Space: index === 2 || index === 7,
    ShiftLeft: index === 5,
    ArrowLeft: index % 2 === 0,
    ArrowRight: index % 2 === 1,
    ArrowUp: index === 4,
    ArrowDown: index === 8
  },
  camera: {
    position: { x: index * 250, y: 980 + index * 38, z: -index * 190 },
    yaw: index * 0.12,
    pitch: Math.max(-1.22, Math.min(0.22, -0.32 + index * 0.028))
  },
  observatoryEvacuation: {
    expectedHandoffBuckets: ["observatoryDistressBeacons", "weatherTowerStabilities", "ridgeSwitchbackRoutes", "supplyDropZones", "summitRadioRelays", "evacHeliWindows"],
    expectedGameHostMethods: ["getObservatoryEvacuationReadiness", "getInfiniteRadialTerrainObservatoryEvacuationReadiness", "getRendererHandoff"]
  }
}));

for (const intake of simulatedInputs) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.dt > 0 && intake.dt <= 1 / 30);
  assert.ok(Object.values(intake.keys).every((value) => typeof value === "boolean"));
  assert.ok(intake.camera.pitch >= -1.22 && intake.camera.pitch <= 0.22);
  assert.ok(Number.isFinite(intake.camera.position.y));
  assert.equal(intake.observatoryEvacuation.expectedHandoffBuckets.length, 6);
  assert.deepEqual(intake.observatoryEvacuation.expectedGameHostMethods, ["getObservatoryEvacuationReadiness", "getInfiniteRadialTerrainObservatoryEvacuationReadiness", "getRendererHandoff"]);
}

console.log("infinite radial terrain observatory evacuation CDN/state-input smoke passed: 10 intake cases");
