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
const kitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-anchor-readiness-domain-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v=storm-anchor-readiness-1"'), "Signal Isles should boot through the storm anchor cache-busted module entry");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesStormAnchorReadinessDomainKit"), "composition should install the storm anchor domain kit");
assert.ok(compositionSource.includes("getStormAnchorReadinessState"), "composition should expose storm anchor state");
assert.ok(rendererSource.includes("drawStormAnchorDescriptors"), "renderer should consume storm anchor descriptors from snapshot handoff");
assert.ok(debugHostSource.includes("getStormAnchorReadinessState()"), "debug host should expose storm anchor readiness state");
assert.ok(kitSource.includes("rendererConsumesDescriptorsOnly"), "kit should define renderer descriptor handoff");
assert.equal(kitSource.includes("document."), false, "kit should not own DOM");
assert.equal(kitSource.includes("window."), false, "kit should not own browser globals");
assert.equal(kitSource.includes("THREE"), false, "kit should not own Three.js rendering");
assert.ok(manifest.includes("signal-isles-storm-anchor-readiness-domain-kit"), "manifest should register storm anchor readiness");

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
  assert.ok(after.stormAnchorReadiness, `${entry.id} should expose stormAnchorReadiness`);
  assert.ok(after.domain.signalIslesStormAnchorReadiness, `${entry.id} should expose domain storm anchor state`);
  assert.equal(after.stormAnchorReadiness.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} storm anchor handoff should remain descriptor-only`);
  assert.ok(after.stormAnchorReadiness.rendererHandoff.counts.groundingRods >= 2, `${entry.id} should include grounding rods`);
  assert.ok(after.stormAnchorReadiness.rendererHandoff.counts.anchorCables >= 3, `${entry.id} should include anchor cables`);
  assert.ok(after.stormAnchorReadiness.rendererHandoff.counts.shelterPockets >= 3, `${entry.id} should include shelter pockets`);
  assert.ok(after.rendererHandoff.counts.stormCells >= after.stormAnchorReadiness.rendererHandoff.counts.stormCells, `${entry.id} composed handoff should merge storm cells`);
  if (entry.intent.moveX || entry.intent.moveZ) {
    assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
  }
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.stormAnchorReadiness.rendererHandoff.descriptors.anchorCables.length >= 3, "render snapshot should include anchor cables");
assert.ok(renderSnapshot.rendererHandoff.descriptors.evacuationTideRoutes.length >= 2, "composed handoff should include evacuation tide routes");
assert.ok(JSON.stringify(renderSnapshot.stormAnchorReadiness.rendererHandoff.descriptors).includes("signal-isles-storm-cell-forecast"), "render snapshot should include storm cell descriptors");

console.log("Signal Isles storm anchor readiness CDN state/input smoke passed.");
