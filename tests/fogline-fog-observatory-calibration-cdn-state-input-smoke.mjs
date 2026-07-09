import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineFogObservatoryCalibrationReadinessDomainKit } from "../experiments/fogline-relay/src/fog-observatory-calibration-readiness-kits.js";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = new URL("../experiments/fogline-relay/src/fog-observatory-calibration-readiness-entry.js", import.meta.url);
const kitPath = new URL("../experiments/fogline-relay/src/fog-observatory-calibration-readiness-kits.js", import.meta.url);
const routePath = new URL("../experiments/fogline-relay/index.html", import.meta.url);

const entrySource = readFileSync(entryPath, "utf8");
const kitSource = readFileSync(kitPath, "utf8");
const routeSource = readFileSync(routePath, "utf8");

assert.ok(entrySource.includes(NEXUS_ENGINE_MAIN_CDN), "changed entry must import NexusEngine main CDN");
assert.ok(!entrySource.includes("NexusRealtime@"), "changed entry must not import old NexusRealtime runtime");
assert.ok(routeSource.includes("fog-observatory-calibration-readiness-renderer-handoff-pass"), "route must advertise fog observatory pass");
assert.ok(routeSource.includes("fog-observatory-calibration-readiness-entry.js"), "route must load fog observatory entry");
assert.ok(entrySource.includes("getFogObservatoryCalibrationReadiness"), "GameHost must expose fog observatory readiness accessor");
assert.ok(entrySource.includes("getRendererHandoff"), "GameHost renderer handoff must be composed");
assert.ok(!/document\.|window\.|canvas|getContext|requestAnimationFrame|THREE\.|new AudioContext/.test(kitSource), "reusable kit source must stay renderer/browser/audio neutral");

const kit = createFoglineFogObservatoryCalibrationReadinessDomainKit();
const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  time: index * 0.75,
  level: {
    bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 58 },
    route: [
      { id: "gate", x: -12, z: -2 },
      { id: "marsh", x: -7, z: 7 },
      { id: "yard", x: -1, z: 18 },
      { id: "platform", x: 5, z: 31 },
      { id: "ridge", x: 10, z: 45 },
      { id: "relay", x: 2, z: 56 }
    ]
  },
  game: {
    player: { z: -5 + index * 7, scan: index % 2 === 0 },
    fogPressure: Math.max(0.08, 0.78 - index * 0.055),
    stormPressure: index % 3 === 0 ? 0.55 : 0.18,
    scans: index,
    tools: Math.floor(index / 2),
    wind: 0.22 + index * 0.055,
    focus: index > 4 ? "mirror" : "scan"
  }
}));

let previousReadiness = -1;
for (const input of simulatedInputs) {
  const result = kit.describe(input);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(result.rendererHandoff.descriptorCount >= 16, "descriptor handoff should be visually meaningful");
  assert.ok(result.drawOrder.some((descriptor) => descriptor.compatibleBucket === "skyBeacons"), "relay kite sky beacon descriptors must be present");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, "readiness must be bounded");
  previousReadiness = Math.max(previousReadiness, result.readiness);
}

assert.ok(previousReadiness > 0.45, "simulated inputs should reach useful calibration readiness");
console.log("Fogline fog observatory calibration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
