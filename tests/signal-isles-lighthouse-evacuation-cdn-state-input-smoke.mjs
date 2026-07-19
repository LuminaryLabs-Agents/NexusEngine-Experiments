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
const kitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-lighthouse-evacuation-readiness-domain-kits.js", "utf8");
const routedSmoke = readFileSync("tests/signal-isles-playwright-state-input-smoke.mjs", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v='), "Signal Isles should boot through a cache-busted module entry");
assert.ok(index.includes("lighthouse-evacuation-readiness-renderer-handoff-pass"), "route should advertise lighthouse evacuation readiness");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesLighthouseEvacuationReadinessDomainKit"), "composition should install the lighthouse evacuation domain kit");
assert.ok(compositionSource.includes("getLighthouseEvacuationReadinessState"), "composition should expose lighthouse evacuation state");
assert.ok(rendererSource.includes("drawLighthouseEvacuationDescriptors"), "renderer should consume lighthouse evacuation descriptors from snapshot handoff");
assert.ok(debugHostSource.includes("getLighthouseEvacuationReadinessState()"), "debug host should expose lighthouse evacuation readiness state");
assert.ok(kitSource.includes("rendererConsumesDescriptorsOnly"), "kit should define renderer descriptor handoff");
assert.equal(kitSource.includes("document."), false, "kit should not own DOM");
assert.equal(kitSource.includes("window."), false, "kit should not own browser globals");
assert.equal(kitSource.includes("THREE"), false, "kit should not own Three.js rendering");
assert.ok(routedSmoke.includes("signal-isles-lighthouse-evacuation-readiness-kits-smoke.mjs"), "existing routed smoke should import lighthouse evacuation kit smoke");
assert.ok(routedSmoke.includes("signal-isles-lighthouse-evacuation-cdn-state-input-smoke.mjs"), "existing routed smoke should import lighthouse evacuation CDN smoke");

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
  assert.ok(after.lighthouseEvacuationReadiness, `${entry.id} should expose lighthouseEvacuationReadiness`);
  assert.ok(after.domain.signalIslesLighthouseEvacuationReadiness, `${entry.id} should expose domain lighthouse evacuation state`);
  assert.equal(after.lighthouseEvacuationReadiness.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} lighthouse evacuation handoff should remain descriptor-only`);
  assert.ok(after.lighthouseEvacuationReadiness.rendererHandoff.counts.strandedKeepers >= 3, `${entry.id} should include stranded keepers`);
  assert.ok(after.lighthouseEvacuationReadiness.rendererHandoff.counts.lanternFuelCaches >= 1, `${entry.id} should include lantern fuel caches`);
  assert.ok(after.lighthouseEvacuationReadiness.rendererHandoff.counts.rescueBoatChannels >= 3, `${entry.id} should include rescue boat channels`);
  assert.ok(after.rendererHandoff.counts.strandedKeepers >= after.lighthouseEvacuationReadiness.rendererHandoff.counts.strandedKeepers, `${entry.id} composed handoff should merge stranded keepers`);
  if (entry.intent.moveX || entry.intent.moveZ) {
    assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
  }
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.lighthouseEvacuationReadiness.rendererHandoff.descriptors.rescueBoatChannels.length >= 3, "render snapshot should include rescue boat channels");
assert.ok(renderSnapshot.rendererHandoff.descriptors.evacuationRosters.length >= 2, "composed handoff should include evacuation rosters");
assert.ok(JSON.stringify(renderSnapshot.lighthouseEvacuationReadiness.rendererHandoff.descriptors).includes("signal-isles-stranded-keeper-beacon"), "render snapshot should include stranded keeper descriptors");

console.log("Signal Isles lighthouse evacuation readiness CDN state/input smoke passed.");
