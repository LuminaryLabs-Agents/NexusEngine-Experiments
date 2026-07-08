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
const expeditionKitSource = readFileSync("experiments/_kits/nexus-frontier-signal-isles/signal-isles-expedition-readiness-domain-kits.js", "utf8");
const checkSource = readFileSync("scripts/run-checks.mjs", "utf8");

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
assert.ok(index.includes('src="./src/main.js?v=expedition-readiness-1"'), "Signal Isles route shell should cache-bust the expedition runtime");
assert.ok(main.includes(cdn), "changed Signal Isles runtime should import NexusEngine main via CDN");
assert.equal(main.includes("NexusRealtime@main"), false, "changed runtime should not import old NexusRealtime main CDN");
assert.ok(compositionSource.includes("createSignalIslesExpeditionReadinessDomainKit"), "composition should install expedition readiness domain kit");
assert.ok(rendererSource.includes("drawExpeditionReadinessDescriptors"), "renderer should consume expedition descriptors through a descriptor-only draw pass");
assert.ok(rendererSource.includes("snapshot.expeditionReadiness?.rendererHandoff?.descriptors"), "renderer should read expedition handoff descriptors from the snapshot");
assert.ok(debugHostSource.includes("getExpeditionReadinessState()"), "debug host should expose expedition readiness state");
assert.ok(debugHostSource.includes("getRendererHandoff()"), "debug host should expose composed renderer handoff");
assert.ok(expeditionKitSource.includes("rendererConsumesDescriptorsOnly"), "expedition kit should define descriptor handoff");
assert.ok(expeditionKitSource.includes("WebGL"), "expedition kit should list forbidden renderer ownership in the contract only");
assert.ok(checkSource.includes("tests/signal-isles-expedition-readiness-kits-smoke.mjs"), "kit smoke should be wired into checks");
assert.ok(checkSource.includes("tests/signal-isles-expedition-readiness-cdn-state-input-smoke.mjs"), "CDN/state smoke should be wired into checks");

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
  assert.ok(after.expeditionReadiness, `${entry.id} should expose expeditionReadiness`);
  assert.ok(after.domain.signalIslesExpeditionReadiness, `${entry.id} should expose expedition readiness domain state`);
  assert.equal(after.expeditionReadiness.rendererHandoff.contract.rendererConsumesDescriptorsOnly, true, `${entry.id} handoff should remain descriptor-only`);
  assert.equal(after.expeditionReadiness.rendererHandoff.counts.scanSectors, 3, `${entry.id} should include scan sectors`);
  assert.ok(after.expeditionReadiness.rendererHandoff.counts.shardFerryLines >= 3, `${entry.id} should include shard ferry lines`);
  assert.equal(after.expeditionReadiness.rendererHandoff.counts.retreatLanes, 3, `${entry.id} should include retreat lanes`);
  assert.ok(after.rendererHandoff.counts.scanSectors >= 3, `${entry.id} composed handoff should include scan sectors`);
  assert.ok(after.rendererHandoff.counts.beaconForecasts >= 4, `${entry.id} composed handoff should include beacon forecasts`);
  if (entry.intent.moveX || entry.intent.moveZ) assert.notDeepEqual(after.session.player, before.session.player, `${entry.id} should affect player state`);
}

composition.tick(0.5);
const renderSnapshot = composition.getRenderSnapshot();
assert.ok(renderSnapshot.expeditionReadiness.rendererHandoff.descriptors.scanSectors.length >= 3, "render snapshot should include scan sectors");
assert.ok(renderSnapshot.expeditionReadiness.rendererHandoff.descriptors.retreatLanes.length >= 3, "render snapshot should include retreat lanes");
assert.ok(renderSnapshot.rendererHandoff.descriptors.gateRunways.length >= 3, "composed renderer handoff should include gate runways");
assert.ok(JSON.stringify(renderSnapshot.expeditionReadiness.rendererHandoff.descriptors).includes("signal-isles-beacon-activation-forecast"), "render snapshot should include beacon activation forecast descriptors");

console.log("Signal Isles expedition readiness CDN state/input smoke passed.");
