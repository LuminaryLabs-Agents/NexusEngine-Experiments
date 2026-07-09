import assert from "node:assert/strict";
import {
  createFoglineFogObservatoryCalibrationReadinessDomainKit,
  FOGLINE_FOG_OBSERVATORY_CALIBRATION_READINESS_DOMAIN_TREE
} from "../experiments/fogline-relay/src/fog-observatory-calibration-readiness-kits.js";

const kit = createFoglineFogObservatoryCalibrationReadinessDomainKit();

const cases = [
  { name: "cold start", input: { time: 0, game: { player: { z: -6 }, fogPressure: 0.72, scans: 0, tools: 0 } } },
  { name: "scan active", input: { time: 1, game: { player: { z: 5, scan: true }, fogPressure: 0.5, scans: 1, tools: 1 } } },
  { name: "mirror focus", input: { time: 2, game: { player: { z: 18 }, focus: "mirror", fogPressure: 0.44, scans: 3, tools: 2 } } },
  { name: "high wind kite", input: { time: 3, game: { player: { z: 24 }, wind: 0.8, fogPressure: 0.38, scans: 4, tools: 2 } } },
  { name: "fogbound storm", input: { time: 4, game: { player: { z: 12 }, stormPressure: 0.9, fogPressure: 0.82, scans: 1, tools: 0 } } },
  { name: "late route", input: { time: 5, game: { player: { z: 44, scan: true }, fogPressure: 0.28, scans: 5, tools: 4 } } },
  { name: "custom route", input: { time: 6, level: { route: [{ id: "a", x: -4, z: 0 }, { id: "b", x: 1, z: 9 }, { id: "c", x: 6, z: 17 }, { id: "d", x: 11, z: 27 }, { id: "e", x: 7, z: 39 }] }, game: { player: { z: 20 }, fogPressure: 0.35, scans: 2, tools: 3 } } },
  { name: "negative values clamp", input: { time: 7, game: { player: { z: -100 }, fogPressure: -2, stormPressure: -1, scans: -3, tools: -4 } } },
  { name: "large values clamp", input: { time: 8, game: { player: { z: 999, scan: true }, fogPressure: 4, stormPressure: 2, scans: 40, tools: 40, wind: 3 } } },
  { name: "empty input", input: {} }
];

assert.equal(FOGLINE_FOG_OBSERVATORY_CALIBRATION_READINESS_DOMAIN_TREE.root, "fogline-fog-observatory-calibration-readiness-domain");
assert.equal(kit.kits.length, 7);

const states = new Set();
for (const testCase of cases) {
  const result = kit.describe(testCase.input);
  assert.equal(result.domain, "fogline-fog-observatory-calibration-readiness-domain", testCase.name);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, testCase.name);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, testCase.name);
  assert.ok(["relay-ready", "aligned", "fogbound", "calibrating"].includes(result.missionState), testCase.name);
  assert.equal(result.barometerNeedles.length, 3, testCase.name);
  assert.equal(result.hygrometerSashes.length, 3, testCase.name);
  assert.equal(result.heliographMirrors.length, 3, testCase.name);
  assert.equal(result.relayKites.length, 2, testCase.name);
  assert.ok(result.mapFlags.length >= 3, testCase.name);
  assert.equal(result.dawnObservatoryLedgers.length, 1, testCase.name);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", testCase.name);
  assert.equal(result.rendererHandoff.descriptorCount, result.drawOrder.length, testCase.name);
  assert.ok(result.drawOrder.every((descriptor) => descriptor.rendererContract?.rendererMustNotOwn?.includes("browser input")), testCase.name);
  assert.doesNotThrow(() => JSON.stringify(result), testCase.name);
  states.add(result.missionState);
}

const cold = kit.describe(cases[0].input);
const mature = kit.describe(cases[5].input);
assert.ok(mature.readiness > cold.readiness, "mature calibration should improve readiness over cold start");
assert.ok(states.size >= 2, "10 cases should exercise multiple mission states");

console.log("Fogline fog observatory calibration readiness kits smoke passed 10 intake cases.");
