import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeSanctuaryForgeReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js';
const parentSmokePath = 'tests/hellscape-siege-cdn-state-input-smoke.mjs';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const parentSmokeSource = readFileSync(parentSmokePath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeSanctuaryForgeReadinessDomainKit'), 'main route should install sanctuary forge domain kit');
assert.ok(mainSource.includes('sanctuaryForgeReadiness'), 'main route should expose sanctuary forge state');
assert.ok(mainSource.includes('getHellscapeSanctuaryForgeReadiness'), 'GameHost should expose sanctuary forge accessor');
assert.ok(mainSource.includes('hellscapeSanctuaryForge'), 'composed renderer handoff should include sanctuary forge descriptors');
assert.ok(rendererSource.includes('drawHellscapeSanctuaryForge'), 'renderer should consume sanctuary forge descriptors');
assert.ok(rendererSource.includes('sanctuaryForgeReadiness?.rendererHandoff?.descriptors'), 'renderer should read sanctuary forge descriptors instead of recomputing state truth');
assert.ok(indexSource.includes('sanctuary-forge-readiness-renderer-handoff-pass'), 'route shell should advertise sanctuary forge readiness pass');
assert.ok(indexSource.includes('sanctuary-forge-readiness-1'), 'route shell should cache-bust sanctuary forge runtime');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare descriptor-only renderer handoff');
assert.ok(parentSmokeSource.includes('hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs'), 'parent smoke should route sanctuary forge kit smoke');
assert.ok(parentSmokeSource.includes('hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs'), 'parent smoke should route sanctuary forge CDN smoke');

function stateCase(index) {
  const move = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 0.7071, y: 0.7071 }
  ][index % 5];
  return {
    time: index * 0.5,
    input: { move, primary: index % 2 === 0, interact: index % 3 === 0, build: index % 4 === 0, confirm: index % 5 === 0, cycle: index % 2 ? 1 : 0, select: index % 3 },
    player: { x: move.x * 120 + index * 24, y: 170 + move.y * 86, hp: 100 - index * 3, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 18, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'sanctuary forge state case' },
    wave: { n: index + 1, active: index % 2 === 0, queue: Array.from({ length: index % 5 }, () => 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: [
      { x: -140 + index * 8, y: -90, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 },
      { x: 120 - index * 4, y: 70, kind: 'crystal', item: 'crystal', color: '#a855f7', hp: 54, maxHp: 90 }
    ],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#e9d5ff' }] : [],
    structures: [{ kind: 'turret', x: 35, y: 20, hp: 100 - index, maxHp: 100, range: 310, color: '#38bdf8' }],
    enemies: Array.from({ length: 1 + (index % 5) }, (_, n) => ({ type: n % 2 ? 'crawler' : 'brute', x: 420 - n * 40, y: -320 + n * 35, hp: 42, maxHp: 42 })),
    inventory: { items: { wood: 8 + index, obsidian: index, crystal: 5 + index, energy: 4, spore: 2, sulfur: 2 } },
    build: { selected: index % 3 },
    buildCatalog: [
      { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, color: '#94a3b8' },
      { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, color: '#38bdf8' },
      { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, color: '#10b981' }
    ]
  };
}

const domainKit = createHellscapeSanctuaryForgeReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.ok(domain.rendererHandoff.counts.emberBellowsPressures >= 1, `case ${index} should expose ember bellows`);
  assert.ok(domain.rendererHandoff.counts.crucibleCoolingLoops >= 2, `case ${index} should expose cooling loops`);
  assert.equal(domain.rendererHandoff.counts.relicMoldPriorities, 3, `case ${index} should expose three relic mold priorities`);
  assert.equal(domain.rendererHandoff.counts.wardRuneCircles, 3, `case ${index} should expose three ward rune circles`);
  assert.equal(domain.rendererHandoff.counts.sanctuaryLaneThreads, 3, `case ${index} should expose three sanctuary lane threads`);
  assert.equal(domain.rendererHandoff.counts.forgeGateCommits, 3, `case ${index} should expose three forge gate commits`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-sanctuary-forge-readiness-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
