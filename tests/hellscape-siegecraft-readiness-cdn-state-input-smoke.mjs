import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeSiegecraftReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-siegecraft-readiness-domain-kit.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-siegecraft-readiness-domain-kit.js';
const checksPath = 'scripts/run-checks.mjs';
const existingKitSmokePath = 'tests/hellscape-expedition-readability-domain-kits-smoke.mjs';
const existingCdnSmokePath = 'tests/hellscape-expedition-readability-cdn-state-input-smoke.mjs';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const checksSource = readFileSync(checksPath, 'utf8');
const existingKitSmokeSource = readFileSync(existingKitSmokePath, 'utf8');
const existingCdnSmokeSource = readFileSync(existingCdnSmokePath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeSiegecraftReadinessDomainKit'), 'main route should install siegecraft readiness domain');
assert.ok(mainSource.includes('siegecraftReadiness'), 'main route should expose siegecraft readiness state');
assert.ok(mainSource.includes('hellscapeSiegecraftReadiness'), 'snapshot should expose siegecraft readiness under domain');
assert.ok(mainSource.includes('getSiegecraftReadiness'), 'GameHost should expose siegecraft readiness');
assert.ok(mainSource.includes('hellscapeSiegecraft'), 'composed handoff should include siegecraft descriptors');
assert.ok(rendererSource.includes('drawHellscapeSiegecraft'), 'renderer should consume siegecraft descriptor handoff');
assert.ok(rendererSource.includes('siegecraftReadiness?.rendererHandoff?.descriptors'), 'renderer should read siegecraft descriptors rather than recompute domain truth');
assert.ok(indexSource.includes('main.js?v=siegecraft-readiness-1'), 'route shell should cache-bust the changed runtime');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare renderer descriptor-only handoff');
assert.ok(checksSource.includes('hellscape-expedition-readability-domain-kits-smoke.mjs'), 'full/deploy checks should include existing Hellscape domain smoke');
assert.ok(checksSource.includes('hellscape-expedition-readability-cdn-state-input-smoke.mjs'), 'full/deploy checks should include existing Hellscape CDN smoke');
assert.ok(existingKitSmokeSource.includes('./hellscape-siegecraft-readiness-domain-kits-smoke.mjs'), 'existing domain smoke should import siegecraft kit smoke');
assert.ok(existingCdnSmokeSource.includes('./hellscape-siegecraft-readiness-cdn-state-input-smoke.mjs'), 'existing CDN smoke should import siegecraft CDN smoke');

const buildCatalog = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, hp: 180, range: 0, color: '#94a3b8' },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, hp: 100, range: 310, color: '#38bdf8' },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, hp: 100, range: 160, color: '#10b981' }
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
    time: index / 3,
    input: { move, primary: index % 2 === 0, interact: index % 3 === 0, build: index % 4 === 0, confirm: false, cycle: index % 2 ? 1 : 0, select: index % 3 },
    player: { x: move.x * 120 + index * 16, y: 160 + move.y * 90, hp: 100 - index * 2, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 18, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'state case' },
    wave: { n: index, active: index % 2 === 0, queue: Array.from({ length: index % 5 }, (_, n) => n % 2 ? 'brute' : 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    structures: [
      { kind: 'turret', x: 42 + index * 4, y: 12, hp: 100, maxHp: 100, range: 310, color: '#38bdf8' },
      { kind: index % 2 ? 'pylon' : 'wall', x: -74, y: 46 + index, hp: 130, maxHp: 160, range: index % 2 ? 160 : 0, color: index % 2 ? '#10b981' : '#94a3b8' }
    ],
    enemies: Array.from({ length: 1 + (index % 6) }, (_, n) => ({ type: n % 2 ? 'crawler' : 'brute', x: 430 - n * 42, y: -320 + n * 39, hp: n % 2 ? 42 : 130, maxHp: n % 2 ? 42 : 130, size: n % 2 ? 17 : 28 })),
    resources: [{ x: index * 10, y: -index * 18, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 }],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#e9d5ff' }] : [],
    inventory: { items: { wood: 10, obsidian: index, crystal: 5, energy: 4, spore: 2 + index, sulfur: 2 } },
    build: { selected: index % 3 },
    buildCatalog
  };
}

const domainKit = createHellscapeSiegecraftReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.equal(domain.rendererHandoff.counts.barricadeFootprints, 8, `case ${index} should expose footprint grid cells`);
  assert.ok(domain.rendererHandoff.counts.turretCrossfire >= 1, `case ${index} should expose crossfire lattice`);
  assert.equal(domain.rendererHandoff.counts.resourceBurnForecasts, buildCatalog.length, `case ${index} should expose burn forecasts`);
  assert.equal(domain.rendererHandoff.counts.buildPriorityQueue, buildCatalog.length, `case ${index} should expose build priorities`);
  assert.ok(domain.rendererHandoff.counts.coreBreachCountdowns >= 1, `case ${index} should expose breach countdowns`);
  assert.ok(domain.rendererHandoff.counts.extractionRiskRibbons >= 1, `case ${index} should expose extraction risk ribbons`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-siegecraft-readiness-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
