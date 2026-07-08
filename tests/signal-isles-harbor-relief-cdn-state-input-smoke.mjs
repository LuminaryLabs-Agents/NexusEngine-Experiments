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
const kitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-harbor-relief-readiness-domain-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const checks = readFileSync("scripts/run-checks.mjs", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v=harbor-relief-readiness-1"'), "Signal Isles should boot through the harbor relief cache-busted module entry");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesHarborReliefReadinessDomainKit"), "composition should install the harbor relief domain kit");
assert.ok(compositionSource.includes("getHarborReliefReadinessState"), "composition should expose harbor relief state");
assert.ok(rendererSource.includes("drawHarborReliefDescriptors"), "renderer should consume harbor relief descriptors from snapshot handoff");
assert.ok(debugHostSource.includes("getHarborReliefReadinessState()"), "debug host should expose harbor relief readiness state");
assert.ok(kitSource.includes("rendererConsumesDescriptorsOnly"), "kit should define renderer descriptor handoff");
assert.equal(kitSource.includes("document."), false, "kit should not own DOM");
assert.equal(kitSource.includes("window."), false, "kit should not own browser globals");
assert.equal(kitSource.includes("THREE"), false, "kit should not own Three.js rendering");
assert.ok(manifest.includes("signal-isles-harbor-relief-readiness-domain-kit"), "manifest should register harbor relief readiness");
assert.ok(checks.includes("tests/signal-isles-harbor-relief-readiness-kits-smoke.mjs"), "full checks should route harbor relief kit smoke");
assert.ok(checks.includes("tests/signal-isles-harbor-relief-cdn-state-input-smoke.mjs"), "full checks should route harbor relief CDN smoke");

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
  assert.ok(after.harborReliefReadiness, `${entry.id} should expose harborReliefReadiness`);
  assert.ok(after.domain.signalIslesHarborReliefReadiness, `${entry.id} should expose domain harbor relief state`);
  assert.equal(after.harborReliefReadiness.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} harbor relief handoff should remain descriptor-only`);
  assert.ok(after.harborReliefReadiness.rendererHandoff.counts.woundedSettlements >= 3, `${entry.id} should include wounded settlements`);
  assert.ok(after.harborReliefReadiness.rendererHandoff.counts.medicineCrates >= 1, `${entry.id} should include medicine crates`);
  assert.ok(after.harborReliefReadiness.rendererHandoff.counts.skiffChannelThreads >= 3, `${entry.id} should include skiff channels`);
  assert.ok(after.rendererHandoff.counts.woundedSettlements >= after.harborReliefReadiness.rendererHandoff.counts.woundedSettlements, `${entry.id} composed handoff should merge wounded settlements`);
  if (entry.intent.moveX || entry.intent.moveZ) {
    assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
  }
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.harborReliefReadiness.rendererHandoff.descriptors.skiffChannelThreads.length >= 3, "render snapshot should include skiff channels");
assert.ok(renderSnapshot.rendererHandoff.descriptors.departureManifests.length >= 2, "composed handoff should include departure manifests");
assert.ok(JSON.stringify(renderSnapshot.harborReliefReadiness.rendererHandoff.descriptors).includes("signal-isles-wounded-settlement-triage"), "render snapshot should include harbor triage descriptors");

console.log("Signal Isles harbor relief readiness CDN state/input smoke passed.");
