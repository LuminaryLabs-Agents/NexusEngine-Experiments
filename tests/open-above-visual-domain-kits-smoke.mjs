import assert from "node:assert/strict";
import {
  OPEN_ABOVE_VISUAL_KIT_TREE,
  createOpenAboveCloudStrataKit,
  createOpenAboveFlightMoodKit,
  createOpenAboveMountainRidgelineKit,
  createOpenAboveSpeedRibbonKit,
  createOpenAboveThermalColumnKit,
  createOpenAboveVisualFractalDomainKit,
  createOpenAboveWingtipContrailKit
} from "../experiments/the-open-above/open-above-visual-domain-kits.js";

const inputs = Array.from({ length: 10 }, (_, index) => ({
  frame: index * 37,
  elapsed: index / 3,
  body: {
    speed: 28 + index * 14,
    altitude: 120 + index * 47,
    clearance: 42 + index * 31,
    position: { x: index * 11, y: 140 + index * 13, z: -index * 9 },
    rotation: { pitch: (index - 4) * 0.025, yaw: index * 0.13, roll: (index - 5) * 0.055 },
    carve: { turnStrength: index / 9 }
  },
  camera: {
    position: { x: -index, y: 30 + index, z: 20 - index },
    lookAt: { x: index * 2, y: 40, z: -60 }
  }
}));

const kitCases = [
  ["cloud strata", createOpenAboveCloudStrataKit(), (out) => Array.isArray(out) && out.length >= 4 && out.every((item) => item.domain === "sky.cloud.strata.band" && item.opacity > 0)],
  ["mountain ridgeline", createOpenAboveMountainRidgelineKit(), (out) => Array.isArray(out) && out.length >= 3 && out.every((item) => item.domain === "terrain.horizon.ridgeline.band" && item.height01 > 0)],
  ["speed ribbon", createOpenAboveSpeedRibbonKit(), (out) => Array.isArray(out) && out.every((item) => item.domain === "flight.feedback.speed-ribbon.stroke" && item.length01 > 0)],
  ["thermal column", createOpenAboveThermalColumnKit(), (out) => Array.isArray(out) && out.length >= 3 && out.every((item) => item.domain === "air.current.thermal-column.marker" && item.radius01 > 0)],
  ["wingtip contrail", createOpenAboveWingtipContrailKit(), (out) => Array.isArray(out) && out.length === 2 && out.every((item) => item.domain === "actor.wingtip.contrail.stream" && item.length01 > 0)],
  ["flight mood", createOpenAboveFlightMoodKit(), (out) => out?.domain === "flight.mood.readability.snapshot" && out.vignette > 0 && out.haze > 0]
];

for (const [name, kit, validate] of kitCases) {
  for (const input of inputs) {
    const output = kit.describe(input);
    assert.ok(validate(output), `${name} kit should accept varied flight snapshot intake`);
  }
}

const domain = createOpenAboveVisualFractalDomainKit();
for (const input of inputs) {
  const output = domain.compose(input);
  assert.ok(output.mood);
  assert.ok(Array.isArray(output.cloudStrata));
  assert.ok(Array.isArray(output.ridgelines));
  assert.ok(Array.isArray(output.speedRibbons));
  assert.ok(Array.isArray(output.thermals));
  assert.ok(Array.isArray(output.contrails));
  assert.ok(output.cloudStrata.length >= 4);
  assert.ok(output.contrails.length === 2);
}

assert.match(OPEN_ABOVE_VISUAL_KIT_TREE, /the-open-above/);
assert.match(OPEN_ABOVE_VISUAL_KIT_TREE, /open-above-visual-fractal-domain-kit/);
assert.match(OPEN_ABOVE_VISUAL_KIT_TREE, /open-above-thermal-column-kit/);
console.log("The Open Above visual domain kit intake smoke passed.");
