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
const objectiveKitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-objective-readability-domain-kits.js", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v='), "Signal Isles route shell should cache-bust the changed runtime");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesObjectiveReadabilityDomainKit"), "composition should install objective readability domain kit");
assert.ok(rendererSource.includes("snapshot.objectiveReadability?.rendererHandoff?.descriptors"), "renderer should consume objective readability descriptors from snapshot handoff");
assert.ok(debugHostSource.includes("getObjectiveReadabilityState()"), "debug host should expose objective readability state");
assert.ok(debugHostSource.includes("getRendererHandoff()"), "debug host should expose composed renderer handoff");
assert.ok(objectiveKitSource.includes("rendererConsumesDescriptorsOnly"), "objective kit should define descriptor handoff");
assert.ok(objectiveKitSource.includes("WebGL"), "objective kit should list forbidden renderer ownership in the contract only");

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
  assert.ok(after.objectiveReadability, `${entry.id} should expose objectiveReadability`);
  assert.ok(after.domain.signalIslesObjectiveReadability, `${entry.id} should expose objective readability domain state`);
  assert.ok(after.rendererHandoff.counts.objectiveBeats >= 6, `${entry.id} composed handoff should count objective beats`);
  assert.ok(after.objectiveReadability.rendererHandoff.counts.actionCues >= 1, `${entry.id} should include action cues`);
  assert.ok(after.objectiveReadability.rendererHandoff.counts.dependencyThreads >= 4, `${entry.id} should include dependency threads`);
  assert.ok(after.objectiveReadability.rendererHandoff.counts.safePockets >= 3, `${entry.id} should include safe pockets`);
  assert.equal(after.objectiveReadability.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should remain descriptor-only`);
  if (entry.intent.moveX || entry.intent.moveZ) assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.objectiveReadability.rendererHandoff.descriptors.objectiveBeats.length >= 6, "render snapshot should include objective beats");
assert.ok(renderSnapshot.objectiveReadability.rendererHandoff.descriptors.cargoRibbons.length >= 1, "render snapshot should include cargo route ribbons");
assert.ok(renderSnapshot.rendererHandoff.descriptors.dependencyThreads.length >= 4, "composed renderer handoff should include objective dependency threads");
assert.ok(JSON.stringify(renderSnapshot.objectiveReadability.rendererHandoff.descriptors).includes("objective-step-beat"), "render snapshot should include objective beat descriptors");

console.log("Signal Isles objective readability CDN state/input smoke passed.");
