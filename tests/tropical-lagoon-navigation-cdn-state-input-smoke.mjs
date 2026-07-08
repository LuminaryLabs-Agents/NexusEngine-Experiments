import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTropicalLagoonNavigationReadabilityDomainKit } from "../experiments/tropical-island-scene/src/tropical-lagoon-navigation-readability-domain-kit.js";

const routeHtml = readFileSync("experiments/tropical-island-scene/index.html", "utf8");
const entry = readFileSync("experiments/tropical-island-scene/src/lagoon-navigation-readability-entry.js", "utf8");
const kitSource = readFileSync("experiments/tropical-island-scene/src/tropical-lagoon-navigation-readability-domain-kit.js", "utf8");
const runChecks = readFileSync("scripts/run-checks.mjs", "utf8");

const NEXUS_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_CORE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const PROTOKIT_IMPORT = "NexusRealtime-ProtoKits";

assert.ok(routeHtml.includes("lagoon-navigation-readability-entry.js?v=tropical-island-lagoon-navigation-20260708"), "route shell should load lagoon navigation readability entry");
assert.ok(routeHtml.includes("reef contours, swim cones, current vectors, snorkel scores, raft wakes, and glare timing bands"), "route aria copy should advertise the new descriptor layer");
assert.ok(entry.includes(NEXUS_CDN), "changed entry should import NexusEngine main CDN");
assert.ok(!entry.includes(OLD_CORE_CDN), "changed entry should avoid old NexusRealtime core CDN");
assert.ok(routeHtml.includes(PROTOKIT_IMPORT), "legacy ProtoKits import map should be preserved, not destructively removed");
assert.ok(entry.includes("getLagoonNavigationReadability"), "GameHost should expose lagoon navigation readability");
assert.ok(entry.includes("tropicalLagoonNavigationReadability"), "GameHost state should include the lagoon navigation domain namespace");
assert.ok(entry.includes("getRendererHandoff"), "entry should patch a composed renderer handoff");
assert.ok(entry.includes("renderer-consumes-descriptors-only"), "entry should preserve descriptor-only handoff language");
assert.ok(kitSource.includes("rendererMustNotOwn"), "kit should declare ownership boundaries");
assert.ok(!kitSource.includes("document."), "kit should not own DOM access");
assert.ok(!kitSource.includes("requestAnimationFrame"), "kit should not own frame loop");
assert.ok(!kitSource.includes("THREE"), "kit should not own Three.js renderer work");
assert.ok(runChecks.includes("tests/tropical-lagoon-navigation-readability-kits-smoke.mjs"), "full/deploy checks should include kit smoke");
assert.ok(runChecks.includes("tests/tropical-lagoon-navigation-cdn-state-input-smoke.mjs"), "full/deploy checks should include CDN state smoke");

const domainKit = createTropicalLagoonNavigationReadabilityDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 0.41,
  orbit: index * 0.13,
  camera: { angle: index * 0.13 },
  fish: Array.from({ length: 3 + (index % 5) }, (_, fishIndex) => ({
    id: `fish-${index}-${fishIndex}`,
    position: { x: -12 + fishIndex * 3.5, y: -1.2, z: -14 - fishIndex * 2.2 },
    scale: 0.8 + fishIndex * 0.07
  })),
  floatProps: Array.from({ length: 2 + (index % 6) }, (_, propIndex) => ({
    id: `float-${index}-${propIndex}`,
    position: { x: -18 + propIndex * 5, y: 0, z: -22 - propIndex * 3 },
    scale: 0.7 + propIndex * 0.08
  })),
  visualFractal: { reef: { density: 0.45 + index * 0.02 }, water: { clarity: 0.86 - index * 0.01 } }
}));

for (const input of cases) {
  const output = domainKit.describe(input);
  assert.equal(output.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(output.rendererHandoff.counts.reefContours >= 4, "reef contours should exist");
  assert.ok(output.rendererHandoff.counts.swimSafetyCones >= 3, "swim safety cones should exist");
  assert.ok(output.rendererHandoff.counts.currentVectors >= 5, "current vectors should exist");
  assert.ok(output.rendererHandoff.counts.snorkelScores >= 4, "snorkel scores should exist");
  assert.ok(output.rendererHandoff.counts.raftReturnWakes >= 3, "raft return wakes should exist");
  assert.ok(output.rendererHandoff.counts.sunGlareBands >= 3, "sun glare timing bands should exist");
  assert.ok(output.rendererHandoff.counts.total >= 24, "composed descriptor count should stay high enough for visual variety");
  assert.deepEqual(JSON.parse(JSON.stringify(output.rendererHandoff.descriptors)).reefContours.length, output.rendererHandoff.descriptors.reefContours.length);
}

console.log("tropical lagoon navigation CDN/state/input smoke passed: NexusEngine CDN + 10 descriptor cases");
