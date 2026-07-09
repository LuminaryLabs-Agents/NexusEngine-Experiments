import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPeerSceneFerryLanternConvoyReadiness } from '../experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js';

const html = readFileSync(new URL('../experiments/peer-scene-transition/index.html', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../experiments/peer-scene-transition/shared/scene-ferry-lantern-convoy-readiness-entry.js', import.meta.url), 'utf8');
const kit = readFileSync(new URL('../experiments/_kits/peer-scene-transition/peer-scene-ferry-lantern-convoy-kits.js', import.meta.url), 'utf8');

assert.ok(html.includes('ferry-lantern-convoy-readiness-renderer-handoff-pass'));
assert.ok(html.includes('scene-ferry-lantern-convoy-readiness-entry.js?v=ferry-lantern-convoy-readiness-1'));
assert.ok(entry.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'));
assert.ok(!entry.includes('NexusRealtime@'));
assert.ok(entry.includes('getPeerSceneFerryLanternConvoyReadiness'));
assert.ok(entry.includes('getFerryLanternConvoyReadinessTree'));
assert.ok(entry.includes('getRendererHandoff'));
assert.ok(kit.includes('renderer consumes descriptors only'));
assert.ok(kit.includes('browser-input'));
assert.ok(!kit.includes('document.'));
assert.ok(!kit.includes('THREE.'));
assert.ok(!kit.includes('AudioContext'));

const simulatedInputs = [
  { sceneId: 'camp', visitedScenes: ['camp'], pressure: 10 },
  { sceneId: 'camp', visitedScenes: ['camp'], tokens: ['has-lantern'], pressure: 9 },
  { sceneId: 'crossroads', visitedScenes: ['camp', 'crossroads'], tokens: ['has-lantern', 'has-rope'], pressure: 16 },
  { sceneId: 'forest', visitedScenes: ['camp', 'crossroads', 'forest'], tokens: ['has-lantern', 'forest-lit'], actions: ['Tune lantern'], pressure: 20 },
  { sceneId: 'bridge', visitedScenes: ['camp', 'crossroads', 'bridge'], tokens: ['has-rope', 'bridge-repaired'], pressure: 24 },
  { sceneId: 'shrine', visitedScenes: ['camp', 'crossroads', 'forest', 'bridge', 'shrine'], tokens: ['has-lantern', 'has-rope', 'forest-lit', 'bridge-repaired'], pressure: 28 },
  { sceneId: 'ending', visitedScenes: ['camp', 'crossroads', 'forest', 'bridge', 'shrine', 'ending'], tokens: ['has-lantern', 'has-rope', 'forest-lit', 'bridge-repaired', 'shrine-open'], pressure: 8 },
  { currentScene: 'unknown', visited: [], pressure: 1000 },
  { sceneId: 'bridge', visitedScenes: ['bridge'], flags: { bridgeRopeAnchored: true }, pressureScore: 48 },
  { sceneId: 'forest', visitedSceneIds: ['camp', 'crossroads', 'forest'], items: ['Lantern', 'map clue'], completedActions: ['Call moths'], hazardPressure: 37 }
];

for (const input of simulatedInputs) {
  const readiness = createPeerSceneFerryLanternConvoyReadiness(input);
  assert.equal(readiness.rendererHandoff.descriptorOnly, true);
  assert.equal(readiness.rendererHandoff.passId, 'ferry-lantern-convoy-readiness-renderer-handoff-pass');
  assert.ok(readiness.rendererHandoff.flatDescriptors.length >= 26);
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 100);
  assert.ok(readiness.crossingPressure >= 0 && readiness.crossingPressure <= 100);
}

console.log('Peer scene ferry lantern convoy CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
