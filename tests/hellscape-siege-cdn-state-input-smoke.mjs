import './hellscape-ash-caravan-readiness-domain-kits-smoke.mjs';
import './hellscape-ash-caravan-readiness-cdn-state-input-smoke.mjs';
import './hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs';
import './hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeSiegeFractalDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-siege-fractal-domain-kit.js';
import { createRealtimeGame } from '../games/rogue-lite-hellscape-siege/src/protokits/runtime.js';
import {
  config,
  createAvatarKit,
  createBuildKit,
  createInputKit,
  createInventoryKit,
  createRealmKit,
  createWaveAndDefenseKit
} from '../games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-siege-fractal-domain-kit.js';
const localKitPath = 'games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const localKitSource = readFileSync(localKitPath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeSiegeFractalDomainKit'), 'main route should install the hellscape fractal domain');
assert.ok(mainSource.includes('visualFractal'), 'main route should expose visualFractal state');
assert.ok(mainSource.includes('getRendererHandoff'), 'GameHost should expose renderer handoff');
assert.ok(mainSource.includes('getFortificationState'), 'snapshot should expose the build-owned post-clear fortification descriptor');
assert.ok(mainSource.includes('getSentryChoiceState'), 'snapshot should expose the build-owned Crystal Sentry descriptor');
assert.ok(mainSource.includes("hellscape-kits.js?v=first-siege-5"), 'main route should cache-bust the changed deterministic kit dependency');
assert.ok(mainSource.includes("canvas-renderer.js?v=first-siege-5"), 'main route should cache-bust the changed renderer dependency');
assert.ok(mainSource.includes("first-siege-hud.js?v=first-siege-5"), 'main route should cache-bust the changed HUD dependency');
assert.ok(rendererSource.includes('drawHellscapeFractal'), 'renderer should consume hellscape descriptor handoff');
assert.ok(rendererSource.includes('rendererHandoff?.descriptors'), 'renderer should read descriptors rather than recompute domain truth');
assert.ok(rendererSource.includes('B · FORGE EMBERPLATE'), 'renderer should present one post-clear fortification owner on the surviving wall');
assert.ok(rendererSource.includes('B · DEPLOY SENTRY'), 'renderer should present the ready Crystal Sentry through the existing build ghost');
assert.ok(indexSource.includes('./src/main.js'), 'route shell should boot the changed runtime');
assert.ok(indexSource.includes('first-siege-6'), 'route shell should cache-bust the integrated Crystal Sentry refinement');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare renderer descriptor-only handoff');
assert.ok(localKitSource.includes('postClearFortification'), 'local authored tuning should declare the post-clear Emberplate recipe');
assert.ok(localKitSource.includes('postFortificationSentry'), 'local authored tuning should declare the Crystal Sentry progression choice');
assert.ok(localKitSource.includes("realm.prompt.startsWith('CORE FAILURE')"), 'wave start should retry a breached siege instead of skipping its number');
assert.ok(localKitSource.includes('REBUILD BEFORE RETRYING SIEGE'), 'destroyed defenses should block retry until the starter cache rebuild is placed');

const sentryBlueprint = config.builds.find(blueprint => blueprint.id === 'turret');
assert.deepEqual(sentryBlueprint.cost, { crystal: 5, energy: 3 }, 'Crystal alone should fund the Sentry recipe');

const progressionEngine = createRealtimeGame({
  kits: [
    createInputKit(),
    createAvatarKit(),
    createInventoryKit(),
    createRealmKit(),
    createBuildKit(),
    createWaveAndDefenseKit()
  ]
});
progressionEngine.world.get('inventory').items = { ...progressionEngine.world.get('inventory').items, crystal: 5, energy: 3 };
progressionEngine.world.get('structures').push({
  id: 'structure-1',
  kind: 'wall',
  name: 'EMBERPLATE WALL',
  x: 0,
  y: 238,
  hp: 280,
  maxHp: 300,
  damageScale: 0.65,
  fortificationId: 'emberplate-wall',
  color: '#f59e0b',
  cd: 0
});
progressionEngine.world.get('combat').clears = 1;
assert.equal(progressionEngine.build.getSentryChoiceState().unlocked, false, 'Emberplate should survive one more siege before the Sentry unlocks');
progressionEngine.world.get('wave').n = 2;
progressionEngine.world.get('wave').active = true;
progressionEngine.tick(1 / 60);
const readySentry = progressionEngine.build.getSentryChoiceState();
assert.equal(readySentry.unlocked, true, 'clearing Siege 2 with Emberplate should unlock the Sentry');
assert.equal(readySentry.ready, true, 'Crystal materials should make the Sentry ready');
assert.equal(progressionEngine.build.getState().selected, readySentry.buildIndex, 'the existing build owner should select the Sentry after the clear');
assert.equal(progressionEngine.build.place(), true, 'the existing build action should deploy the ready Sentry');
assert.equal(progressionEngine.build.getSentryChoiceState().completed, true, 'the build-owned descriptor should record one deployed Sentry');
assert.equal(progressionEngine.world.get('structures').filter(structure => structure.kind === 'turret').length, 1, 'the progression choice should deploy exactly one Sentry');
const deployedSentry = progressionEngine.world.get('structures').find(structure => structure.kind === 'turret');
assert.deepEqual({ x: deployedSentry.x, y: deployedSentry.y }, readySentry.placement, 'the Sentry should use its authored core-side anchor');
assert.notDeepEqual({ x: deployedSentry.x, y: deployedSentry.y }, { x: 0, y: 238 }, 'the Sentry must not stack on the Emberplate wall');
progressionEngine.world.set('structures', []);
progressionEngine.world.get('core').hp = 0;
progressionEngine.tick(1 / 60);
assert.equal(progressionEngine.build.getState().selected, 0, 'a breached core without a surviving wall should restore the starter wall as the recovery action');

function stateCase(index) {
  const move = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 0.7071, y: 0.7071 }
  ][index % 5];
  return {
    time: index / 2,
    input: { move, primary: index % 2 === 0, interact: index % 3 === 0, build: index % 4 === 0, confirm: false, cycle: index % 2 ? 1 : 0, select: index % 3 },
    player: { x: move.x * 100 + index * 20, y: 180 + move.y * 80, hp: 100 - index, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 20, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'state case' },
    wave: { n: index, active: index % 2 === 0, queue: Array.from({ length: index % 4 }, () => 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: [{ x: index * 10, y: -index * 20, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 }],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#e9d5ff' }] : [],
    structures: [{ kind: 'turret', x: 35, y: 20, hp: 100, maxHp: 100, range: 310, color: '#38bdf8' }],
    enemies: Array.from({ length: 1 + (index % 5) }, (_, n) => ({ type: n % 2 ? 'crawler' : 'brute', x: 420 - n * 40, y: -320 + n * 35, hp: 42, maxHp: 42 })),
    inventory: { items: { wood: 10, obsidian: index, crystal: 5, energy: 4, spore: 2, sulfur: 2 } },
    build: { selected: index % 3 },
    buildCatalog: [
      { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, range: 0, color: '#94a3b8' },
      { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, range: 310, color: '#38bdf8' },
      { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, range: 160, color: '#10b981' }
    ]
  };
}

const domainKit = createHellscapeSiegeFractalDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.ok(domain.rendererHandoff.counts.realmPressure >= 1, `case ${index} should expose realm pressure`);
  assert.ok(domain.rendererHandoff.counts.buildOptions >= 3, `case ${index} should expose build affordances`);
  assert.ok(domain.rendererHandoff.counts.threatLanes >= 1, `case ${index} should expose threat lanes`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-siege-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
