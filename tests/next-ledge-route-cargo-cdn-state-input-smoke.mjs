import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mainSource = readFileSync("experiments/next-ledge/src/main.js", "utf8");
const wrapperSource = readFileSync("experiments/next-ledge/src/session-cargo-extraction-upgrade.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/route-cargo-fractal-kits.js", "utf8");
const effectsSource = readFileSync("experiments/next-ledge/src/diegetic-effects.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.match(mainSource, /session-cargo-extraction-upgrade\.js/, "Next Ledge browser entry should use the cargo extraction wrapper");
assert.ok(wrapperSource.includes(nexusEngineCdn), "cargo extraction wrapper should pull NexusEngine main through the CDN");
assert.doesNotMatch(wrapperSource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed wrapper must not import the old NexusRealtime runtime CDN");
assert.match(wrapperSource, /createGenericRouteCargoExtractionKit/, "wrapper should install the generic route-cargo extraction composite kit");
assert.match(wrapperSource, /engine\?\.n\?\.genericRouteCargoExtraction/, "wrapper should prefer the namespaced route-cargo extraction facade");
assert.match(wrapperSource, /pickupCargo/, "wrapper should bridge pickup events into the composite facade");
assert.match(wrapperSource, /deliverCargo/, "wrapper should bridge summit delivery into the composite facade");
assert.match(wrapperSource, /adjustPressure/, "wrapper should bridge fall pressure into the composite facade");
assert.match(wrapperSource, /recoverPressure/, "wrapper should bridge recovery into the composite facade");
assert.match(wrapperSource, /routeCargoExtraction/, "snapshots should expose routeCargoExtraction state");
assert.match(wrapperSource, /routeCargoVisual/, "snapshots should expose routeCargoVisual descriptors");

for (const required of [
  "next-ledge-route-cargo-domain-kit",
  "cargo-cache-anchor-kit",
  "cargo-route-thread-kit",
  "extraction-pressure-channel-kit",
  "extraction-summit-handoff-kit",
  "cargo-status-descriptor-kit",
  "route-cargo-renderer-handoff-kit"
]) {
  assert.ok(wrapperSource.includes(required) || kitSource.includes(required), `route-cargo surface should include ${required}`);
}

const intakeCases = [
  { name: "initial snapshot", source: "snapshot", expected: /createCargoRuntime\(base\.snapshot\(\)/ },
  { name: "tick update", source: "update", expected: /decorate\(base\.update\(dt, input\)\)/ },
  { name: "restart reset", source: "restart", expected: /resetCargo\(next, "next-ledge-restart"\)/ },
  { name: "sector advance reset", source: "advanceSector", expected: /resetCargo\(next, "next-ledge-sector-advance"\)/ },
  { name: "checkpoint enter", source: "event", expected: /enterCheckpoint/ },
  { name: "checkpoint complete", source: "event", expected: /completeCheckpoint/ },
  { name: "cargo pickup", source: "event", expected: /pickupCargo\?\.\("anchor-signal-cargo"/ },
  { name: "summit delivery", source: "event", expected: /deliverCargo\?\.\("anchor-signal-cargo"/ },
  { name: "fall pressure", source: "event", expected: /adjustPressure\?\.\("fall-pressure"/ },
  { name: "recovery pressure", source: "event", expected: /recoverPressure\?\.\("fall-pressure"/ }
];

for (const testCase of intakeCases) {
  assert.match(wrapperSource, testCase.expected, `${testCase.name} should be wired for ${testCase.source}`);
}

assert.match(effectsSource, /routeCargoVisual\?\.rendererHandoff\?\.descriptors/, "diegetic renderer should consume route-cargo renderer handoff descriptors");
assert.match(effectsSource, /createCargoDescriptorLayer/, "diegetic renderer should add a cargo descriptor particle layer");
assert.match(effectsSource, /routeCargoExtraction\?\.cargo/, "player signals should respond to route-cargo extraction cargo state");
assert.match(effectsSource, /routeCargoExtraction\?\.pressure/, "player signals should respond to route-cargo extraction pressure state");

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "route-cargo kit source must stay reusable and renderer-neutral");

console.log("Next Ledge route-cargo CDN/state/input smoke passed.");
