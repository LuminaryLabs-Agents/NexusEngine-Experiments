import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeAshCaravanReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-ash-caravan-readiness-domain-kit.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-ash-caravan-readiness-domain-kit.js';
const manifestPath = 'experiments/domain-kit-cutover-manifest.json';
const runChecksPath = 'scripts/run-checks.mjs';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const manifestSource = readFileSync(manifestPath, 'utf8');
const runChecksSource = readFileSync(runChecksPath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeAshCaravanReadinessDomainKit'), 'main route should install ash caravan domain');
assert.ok(mainSource.includes('ashCaravanReadiness'), 'state snapshot should expose ash caravan readiness');
assert.ok(mainSource.includes('getAshCaravanReadiness'), 'GameHost should expose ash caravan readiness');
assert.ok(mainSource.includes('getHellscapeAshCaravanReadiness'), 'GameHost should expose namespaced ash caravan readiness');
assert.ok(rendererSource.includes('drawHellscapeAshCaravan'), 'renderer should consume ash caravan descriptor handoff');
assert.ok(rendererSource.includes('state.ashCaravanReadiness'), 'renderer should draw ash caravan state only from handoff output');
assert.ok(indexSource.includes('ash-caravan-readiness-renderer-handoff-pass'), 'route shell should mark the ash caravan pass');
assert.ok(indexSource.includes('ash-caravan-readiness-1'), 'route shell should cache-bust ash caravan runtime');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare descriptor-only renderer handoff');
assert.equal(kitSource.includes('requestAnimationFrame'), false, 'kit should not own the frame loop');
assert.equal(kitSource.includes('document.'), false, 'kit should not own DOM');
assert.ok(manifestSource.includes('hellscape-ash-caravan-readiness-domain-kit'), 'manifest should register ash caravan domain kit');
assert.ok(runChecksSource.includes('hellscape-ash-caravan-readiness-domain-kits-smoke.mjs'), 'full validation should route kit smoke');
assert.ok(runChecksSource.includes('hellscape-ash-caravan-readiness-cdn-state-input-smoke.mjs'), 'full validation should route CDN/state smoke');

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
    player: { x: move.x * 120 + index * 24, y: 180 + move.y * 90, hp: 100 - index * 4, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 22, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'ash caravan state case' },
    wave: { n: index, active: index % 2 === 0, queue: Array.from({ length: index % 5 }, (_, n) => n % 2 ? 'brute' : 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: [{ x: index * 14, y: -index * 22, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 }],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#38bdf8' }] : [],
    structures: [{ kind: 'turret', x: 35, y: 20, hp: 100 - index, maxHp: 100, range: 310, color: '#38bdf8' }],
    enemies: Array.from({ length: 1 + (index % 6) }, (_, n) => ({ type: n % 3 ? 'crawler' : 'brute', x: 420 - n * 44, y: -320 + n * 37, hp: n % 3 ? 42 : 120, maxHp: n % 3 ? 42 : 120, size: n % 3 ? 17 : 28 })),
    inventory: { items: { wood: 10, obsidian: index, crystal: 3 + index, energy: 2 + index, spore: 2, sulfur: 2 } },
    build: { selected: index % 3 }
  };
}

const domainKit = createHellscapeAshCaravanReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.equal(domain.rendererHandoff.counts.survivorCaravanColumns, 3, `case ${index} should expose survivor caravan columns`);
  assert.equal(domain.rendererHandoff.counts.soulLanternChains, 4, `case ${index} should expose soul lantern chains`);
  assert.equal(domain.rendererHandoff.counts.hellgateBreaches, 3, `case ${index} should expose hellgate breaches`);
  assert.ok(domain.rendererHandoff.counts.ashShelterPockets >= 1, `case ${index} should expose ash shelter pockets`);
  assert.ok(domain.rendererHandoff.counts.brimstoneRationCaches >= 1, `case ${index} should expose brimstone ration caches`);
  assert.equal(domain.rendererHandoff.counts.dawnExtractionCircles, 3, `case ${index} should expose dawn extraction circles`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-ash-caravan-readiness-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
