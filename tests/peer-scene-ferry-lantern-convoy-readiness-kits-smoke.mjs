import assert from 'node:assert/strict';
import {
  PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN,
  PEER_SCENE_FERRY_LANTERN_CONVOY_KITS,
  createPeerSceneFerryLanternConvoyReadiness,
  createPeerSceneFerryLanternConvoyDomainKit
} from '../experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js';

const cases = [
  { name: 'cold camp', sceneId: 'camp', visitedScenes: ['camp'], inventory: [], tokens: [], pressure: 22, seed: 1 },
  { name: 'lantern packed', sceneId: 'camp', visitedScenes: ['camp'], inventory: ['Lantern'], tokens: ['has-lantern'], pressure: 18, seed: 2 },
  { name: 'rope ready', sceneId: 'crossroads', visitedScenes: ['camp', 'crossroads'], inventory: ['Lantern', 'Bridge rope'], tokens: ['has-lantern', 'has-rope'], pressure: 25, seed: 3 },
  { name: 'forest lit', sceneId: 'forest', visitedScenes: ['camp', 'crossroads', 'forest'], inventory: ['Lantern', 'Forest path lit'], tokens: ['has-lantern', 'forest-lit'], actions: ['Call the moon moths', 'Tune the lantern glass'], pressure: 32, seed: 4 },
  { name: 'bridge repaired', sceneId: 'bridge', visitedScenes: ['camp', 'crossroads', 'bridge'], inventory: ['Bridge repaired', 'Bridge rope'], tokens: ['bridge-repaired', 'has-rope'], pressure: 36, seed: 5 },
  { name: 'shrine open', sceneId: 'shrine', visitedScenes: ['camp', 'crossroads', 'forest', 'bridge', 'shrine'], inventory: ['Lantern', 'Bridge repaired', 'Shrine seal open'], tokens: ['has-lantern', 'bridge-repaired', 'shrine-open'], pressure: 42, seed: 6 },
  { name: 'ending complete', sceneId: 'ending', visitedScenes: ['camp', 'crossroads', 'forest', 'bridge', 'shrine', 'ending'], inventory: ['Lantern', 'Bridge rope', 'Forest path lit', 'Bridge repaired', 'Shrine seal open'], tokens: ['has-lantern', 'has-rope', 'forest-lit', 'bridge-repaired', 'shrine-open'], actions: ['Trace the route ledger', 'Align the scene seal'], pressure: 12, seed: 7 },
  { name: 'missing fields', seed: 8 },
  { name: 'overflow clamped', sceneId: 'unknown', visitedScenes: ['camp'], pressure: 999, time: 999999, seed: 9 },
  { name: 'flag rich', sceneId: 'bridge', visitedScenes: ['camp', 'crossroads', 'bridge'], flags: { bridgeRopeAnchored: true, bridgePlankSet: true, lanternTuned: true }, inventory: ['map clue', 'rope'], pressureScore: 28, seed: 10 }
];

const phases = new Set(['dawn-convoy-ready', 'passengers-staged', 'lantern-route-forming', 'ferry-route-unprepared']);
const domainKit = createPeerSceneFerryLanternConvoyDomainKit();
assert.equal(domainKit.id, 'peer-scene-ferry-lantern-convoy-readiness-domain-kit');
assert.equal(PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.id, 'peer-scene-ferry-lantern-convoy-readiness-domain');
assert.ok(PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.tree.includes('crate-token-domain'));
assert.ok(PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.tree.includes('renderer consumes descriptors only'));
assert.ok(PEER_SCENE_FERRY_LANTERN_CONVOY_KITS.includes('peer-scene-ferry-lantern-convoy-renderer-handoff-kit'));

for (const intake of cases) {
  const readiness = createPeerSceneFerryLanternConvoyReadiness(intake);
  assert.equal(readiness.domainId, PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.id, intake.name);
  assert.ok(readiness.domainTree.includes('passenger-handoff-domain'), intake.name);
  assert.ok(readiness.kits.length >= 7, intake.name);
  assert.ok(readiness.ownershipExclusions.includes('renderer'), intake.name);
  assert.ok(readiness.ownershipExclusions.includes('frame-loop'), intake.name);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 100, intake.name);
  assert.ok(readiness.crossingPressure >= 0 && readiness.crossingPressure <= 100, intake.name);
  assert.ok(readiness.summary.readinessScore >= 0 && readiness.summary.readinessScore <= 1, intake.name);
  assert.ok(readiness.summary.pressure >= 0 && readiness.summary.pressure <= 1, intake.name);
  assert.ok(phases.has(readiness.summary.missionState), intake.name);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true, intake.name);
  assert.equal(readiness.rendererHandoff.passId, 'ferry-lantern-convoy-readiness-renderer-handoff-pass', intake.name);
  assert.equal(readiness.rendererHandoff.counts.ferryDockCleats, 5, intake.name);
  assert.equal(readiness.rendererHandoff.counts.lanternBuoyChains, 5, intake.name);
  assert.equal(readiness.rendererHandoff.counts.cargoTallyTokens, 5, intake.name);
  assert.equal(readiness.rendererHandoff.counts.scoutRaftRoutes, 5, intake.name);
  assert.equal(readiness.rendererHandoff.counts.survivorRollcallCards, 5, intake.name);
  assert.equal(readiness.rendererHandoff.counts.dawnFerryLedgers, 1, intake.name);
  assert.equal(readiness.rendererHandoff.flatDescriptors.length, 26, intake.name);
  assert.doesNotThrow(() => JSON.stringify(readiness), intake.name);
  const viaDomain = domainKit.describe(intake);
  assert.equal(viaDomain.rendererHandoff.flatDescriptors.length, readiness.rendererHandoff.flatDescriptors.length, intake.name);
}

const cold = createPeerSceneFerryLanternConvoyReadiness(cases[0]);
const mature = createPeerSceneFerryLanternConvoyReadiness(cases[6]);
assert.ok(mature.readiness > cold.readiness, 'mature ending route should be more ready than cold camp');

console.log('Peer scene ferry lantern convoy readiness kits smoke passed 10 intake cases.');
