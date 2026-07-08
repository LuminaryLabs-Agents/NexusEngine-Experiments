import './hellscape-siegecraft-readiness-cdn-state-input-smoke.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeExpeditionReadabilityDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-expedition-readability-domain-kit.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-expedition-readability-domain-kit.js';
const checksPath = 'scripts/run-checks.mjs';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const checksSource = readFileSync(checksPath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeExpeditionReadabilityDomainKit'), 'main route should install expedition readability domain');
assert.ok(mainSource.includes('expeditionReadability'), 'main route should expose expedition readability state');
assert.ok(mainSource.includes('hellscapeExpeditionReadability'), 'snapshot should expose expedition readability under domain');
assert.ok(mainSource.includes('getExpeditionReadability'), 'GameHost should expose expedition readability');
assert.ok(mainSource.includes('hellscapeExpedition'), 'composed handoff should include expedition descriptors');
assert.ok(rendererSource.includes('drawHellscapeExpedition'), 'renderer should consume expedition descriptor handoff');
assert.ok(rendererSource.includes('expeditionReadability?.rendererHandoff?.descriptors'), 'renderer should read expedition descriptors rather than recompute domain truth');
assert.ok(indexSource.includes('./src/main.js'), 'route shell should boot the changed runtime');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare renderer descriptor-only handoff');
assert.ok(checksSource.includes('hellscape-expedition-readability-domain-kits-smoke.mjs'), 'full checks should include expedition kit smoke');
assert.ok(checksSource.includes('hellscape-expedition-readability-cdn-state-input-smoke.mjs'), 'full/deploy checks should include expedition CDN smoke');

const buildCatalog = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, range: 0, color: '#94a3b8' },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, range: 310, color: '#38bdf8' },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, range: 160, color: '#10b981' }
];

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
    wave: { n: index, active: index % 2 === 0, queue: Array.from({ length: index % 4 }, (_, n) => n % 2 ? 'brute' : 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: [{ x: index * 10, y: -index * 20, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 }],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#e9d5ff' }] : [],
    structures: [{ kind: index % 2 ? 'pylon' : 'turret', x: 35, y: 20, hp: 100, maxHp: 100, range: index % 2 ? 160 : 310, color: index % 2 ? '#10b981' : '#38bdf8' }],
    enemies: Array.from({ length: 1 + (index % 5) }, (_, n) => ({ type: n % 2 ? 'crawler' : 'brute', x: 420 - n * 40, y: -320 + n * 35, hp: 42, maxHp: 42, size: n % 2 ? 17 : 28 })),
    inventory: { items: { wood: 10, obsidian: index, crystal: 5, energy: 4, spore: 2 + index, sulfur: 2 } },
    build: { selected: index % 3 },
    buildCatalog
  };
}

const domainKit = createHellscapeExpeditionReadabilityDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.ok(domain.rendererHandoff.counts.extractionRoutes >= 1, `case ${index} should expose extraction routes`);
  assert.ok(domain.rendererHandoff.counts.safeZones >= 1, `case ${index} should expose safe zones`);
  assert.ok(domain.rendererHandoff.counts.survivalVectors >= 1, `case ${index} should expose survival vectors`);
  assert.equal(domain.rendererHandoff.counts.craftingWindows, buildCatalog.length, `case ${index} should expose crafting windows`);
  assert.ok(domain.rendererHandoff.counts.bossWake >= 1, `case ${index} should expose boss wake signatures`);
  assert.equal(domain.rendererHandoff.counts.exitCompass, 1, `case ${index} should expose one exit compass`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-expedition-readability-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
