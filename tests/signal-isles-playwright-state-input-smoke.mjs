import "./signal-isles-storm-anchor-readiness-kits-smoke.mjs";
import "./signal-isles-storm-anchor-readiness-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { signalIslesPreset } from "../experiments/nexus-frontier-signal-isles/src/signal-isles-preset.js";
import { signalIslesSequences } from "../experiments/nexus-frontier-signal-isles/src/sequences.js";
import { createSignalIslesComposition } from "../experiments/nexus-frontier-signal-isles/src/game-composition.js";

const base = "experiments/nexus-frontier-signal-isles";
const index = readFileSync(`${base}/index.html`, "utf8");
const main = readFileSync(`${base}/src/main.js`, "utf8");
const compositionSource = readFileSync(`${base}/src/game-composition.js`, "utf8");
const rendererSource = readFileSync(`${base}/src/renderer.js`, "utf8");
const debugHostSource = readFileSync(`${base}/src/debug-host.js`, "utf8");
const kitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-visual-fractal-domain-kits.js", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v=storm-anchor-readiness-1"'), "Signal Isles should boot through the cache-busted module entry");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesVisualFractalDomainKit"), "composition should install the visual fractal domain kit");
assert.ok(compositionSource.includes("createSignalIslesObjectiveReadabilityDomainKit"), "composition should install the objective readability domain kit");
assert.ok(compositionSource.includes("createSignalIslesStormAnchorReadinessDomainKit"), "composition should install the storm anchor readiness domain kit");
assert.ok(rendererSource.includes("snapshot.visualFractal?.rendererHandoff?.descriptors"), "renderer should consume visual descriptors from snapshot handoff");
assert.ok(rendererSource.includes("snapshot.objectiveReadability?.rendererHandoff?.descriptors"), "renderer should consume objective readability descriptors from snapshot handoff");
assert.ok(rendererSource.includes("snapshot.stormAnchorReadiness?.rendererHandoff?.descriptors"), "renderer should consume storm anchor descriptors from snapshot handoff");
assert.ok(debugHostSource.includes("getVisualFractalState()"), "debug host should expose visual fractal state");
assert.ok(debugHostSource.includes("getObjectiveReadabilityState()"), "debug host should expose objective readability state");
assert.ok(debugHostSource.includes("getStormAnchorReadinessState()"), "debug host should expose storm anchor readiness state");
assert.ok(kitSource.includes("rendererConsumesDescriptorsOnly"), "kit should define renderer descriptor handoff");

const composition = await createSignalIslesComposition({
  level: signalIslesLevel01,
  preset: signalIslesPreset,
  sequences: signalIslesSequences
});

const intakeCases = [
  { id: "idle", intent: {}, delta: 1 / 60 },
  { id: "move-right", intent: { moveX: 1 }, delta: 0.12 },
  { id: "move-forward", intent: { moveZ: 1 }, delta: 0.12 },
  { id: "sprint", intent: { moveZ: 1, sprint: true }, delta: 0.12 },
  { id: "look-right", intent: { lookX: 22 }, delta: 0.05 },
  { id: "look-up", intent: { lookY: -18 }, delta: 0.05 },
  { id: "scan", intent: { scan: true }, delta: 0.2 },
  { id: "interact", intent: { interact: true }, delta: 0.05 },
  { id: "build", intent: { build: true }, delta: 0.05 },
  { id: "restart", intent: { restart: true }, delta: 0.05 }
];

for (const entry of intakeCases) {
  const before = composition.getState();
  const after = composition.flushInput(entry.intent, entry.delta);
  assert.ok(after.visualFractal, `${entry.id} should expose visualFractal`);
  assert.ok(after.objectiveReadability, `${entry.id} should expose objectiveReadability`);
  assert.ok(after.stormAnchorReadiness, `${entry.id} should expose stormAnchorReadiness`);
  assert.ok(after.domain.signalIslesVisualFractal, `${entry.id} should expose domain visual state`);
  assert.ok(after.domain.signalIslesObjectiveReadability, `${entry.id} should expose objective readability domain state`);
  assert.ok(after.domain.signalIslesStormAnchorReadiness, `${entry.id} should expose storm anchor domain state`);
  assert.ok(after.visualFractal.rendererHandoff.counts.reliefCells >= 4, `${entry.id} should include relief descriptors`);
  assert.ok(after.visualFractal.rendererHandoff.counts.signalThreads >= 5, `${entry.id} should include signal thread descriptors`);
  assert.ok(after.visualFractal.rendererHandoff.counts.resourceShards >= 15, `${entry.id} should include shard descriptors`);
  assert.ok(after.objectiveReadability.rendererHandoff.counts.objectiveBeats >= 6, `${entry.id} should include objective beats`);
  assert.ok(after.stormAnchorReadiness.rendererHandoff.counts.anchorCables >= 3, `${entry.id} should include storm anchor cables`);
  assert.equal(after.visualFractal.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} visual handoff should remain descriptor-only`);
  assert.equal(after.objectiveReadability.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} objective handoff should remain descriptor-only`);
  assert.equal(after.stormAnchorReadiness.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} storm handoff should remain descriptor-only`);
  if (entry.intent.moveX || entry.intent.moveZ) {
    assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
  }
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.visualFractal.rendererHandoff.descriptors.compass.length === 1, "render snapshot should include compass descriptor");
assert.ok(renderSnapshot.objectiveReadability.rendererHandoff.descriptors.objectiveBeats.length >= 6, "render snapshot should include objective beat descriptors");
assert.ok(renderSnapshot.stormAnchorReadiness.rendererHandoff.descriptors.anchorCables.length >= 3, "render snapshot should include storm anchor cables");
assert.ok(JSON.stringify(renderSnapshot.visualFractal.rendererHandoff.descriptors).includes("signal-flow-thread"), "render snapshot should include signal flow descriptors");
assert.ok(JSON.stringify(renderSnapshot.objectiveReadability.rendererHandoff.descriptors).includes("proximity-action-cue"), "render snapshot should include action cue descriptors");
assert.ok(JSON.stringify(renderSnapshot.stormAnchorReadiness.rendererHandoff.descriptors).includes("signal-isles-storm-cell-forecast"), "render snapshot should include storm cell descriptors");

console.log("Signal Isles CDN state/input smoke passed.");
