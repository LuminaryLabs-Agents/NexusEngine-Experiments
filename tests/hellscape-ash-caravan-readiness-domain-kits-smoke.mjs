import assert from 'node:assert/strict';
import {
  createHellscapeSurvivorCaravanColumnKit,
  createHellscapeSoulLanternChainKit,
  createHellscapeHellgateBreachMapKit,
  createHellscapeAshShelterPocketKit,
  createHellscapeBrimstoneRationCacheKit,
  createHellscapeDawnExtractionCircleKit,
  createHellscapeAshCaravanRendererHandoffKit,
  createHellscapeAshCaravanReadinessDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-ash-caravan-readiness-domain-kit.js';

const forbiddenKeys = new Set(['element', 'canvas', 'ctx', 'context2d', 'mesh', 'geometry', 'materialRef', 'audio', 'listener', 'requestAnimationFrame', 'document', 'window']);

function assertSerializable(value, label) {
  assert.doesNotThrow(() => JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertNoForbiddenOwnership(value, label) {
  const stack = [value];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    for (const [key, nested] of Object.entries(current)) {
      assert.equal(forbiddenKeys.has(key), false, `${label} leaked renderer ownership key ${key}`);
      stack.push(nested);
    }
  }
}

function stateCase(index) {
  return {
    time: index * 0.41,
    clock: { elapsed: index * 0.41, delta: 1 / 60 },
    player: { x: -220 + index * 48, y: 150 - index * 19, hp: 100 - index * 4, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 21, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'ash caravan smoke' },
    wave: { n: index + 1, active: index % 2 === 0, queue: Array.from({ length: index % 5 }, (_, n) => n % 2 ? 'brute' : 'crawler'), timer: index * 0.2 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: Array.from({ length: 1 + (index % 4) }, (_, n) => ({
      id: `res-${index}-${n}`,
      kind: n % 2 ? 'crystal' : 'oak',
      item: n % 2 ? 'crystal' : 'wood',
      color: n % 2 ? '#a855f7' : '#22543d',
      hp: 32 + n * 12,
      maxHp: 90,
      size: 16 + n * 2,
      x: -250 + n * 115 + index * 8,
      y: -120 + n * 72 - index * 5
    })),
    drops: Array.from({ length: index % 3 }, (_, n) => ({ x: 42 + n * 28, y: -44 + n * 24, item: n % 2 ? 'energy' : 'obsidian', color: n % 2 ? '#38bdf8' : '#94a3b8' })),
    structures: Array.from({ length: 1 + (index % 3) }, (_, n) => ({
      kind: ['wall', 'turret', 'pylon'][n % 3],
      x: -90 + n * 86,
      y: -30 + n * 42,
      hp: 130 - index * 3 - n * 9,
      maxHp: 150,
      range: n % 3 === 1 ? 310 : n % 3 === 2 ? 160 : 0,
      color: ['#94a3b8', '#38bdf8', '#10b981'][n % 3]
    })),
    enemies: Array.from({ length: 1 + index }, (_, n) => ({
      type: n % 4 === 0 ? 'brute' : 'crawler',
      x: Math.cos(n + index * 0.3) * (360 + index * 18),
      y: Math.sin(n + index * 0.25) * (360 + index * 18),
      hp: n % 4 === 0 ? 130 : 42,
      maxHp: n % 4 === 0 ? 130 : 42,
      size: n % 4 === 0 ? 30 : 17
    })),
    inventory: { items: { wood: index * 2, obsidian: index % 7, crystal: 2 + index, energy: 1 + index, spore: index % 4, sulfur: index % 3 } },
    build: { selected: index % 3 }
  };
}

const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));
const survivorCaravanKit = createHellscapeSurvivorCaravanColumnKit();
const lanternChainKit = createHellscapeSoulLanternChainKit();
const hellgateBreachKit = createHellscapeHellgateBreachMapKit();
const ashShelterKit = createHellscapeAshShelterPocketKit();
const rationCacheKit = createHellscapeBrimstoneRationCacheKit();
const dawnExtractionKit = createHellscapeDawnExtractionCircleKit();
const handoffKit = createHellscapeAshCaravanRendererHandoffKit();
const domainKit = createHellscapeAshCaravanReadinessDomainKit();

for (const [index, state] of cases.entries()) {
  const survivorCaravanColumns = survivorCaravanKit.describe(state);
  assert.equal(survivorCaravanColumns.kind, 'survivor-caravan-column-set');
  assert.equal(survivorCaravanColumns.columns.length, 3, `case ${index} should expose three caravan columns`);
  assert.ok(survivorCaravanColumns.columns.every(column => column.panic >= 0 && column.panic <= 1), `case ${index} caravan panic should be normalized`);

  const soulLanternChains = lanternChainKit.describe(state);
  assert.equal(soulLanternChains.kind, 'soul-lantern-chain-set');
  assert.equal(soulLanternChains.chains.length, 4, `case ${index} should expose four lantern chains`);
  assert.ok(soulLanternChains.chains.every(chain => chain.lanterns.length === 4), `case ${index} should place lantern points inside each chain`);

  const hellgateBreaches = hellgateBreachKit.describe(state);
  assert.equal(hellgateBreaches.kind, 'hellgate-breach-set');
  assert.equal(hellgateBreaches.breaches.length, 3, `case ${index} should expose three hellgate breaches`);

  const ashShelterPockets = ashShelterKit.describe(state);
  assert.equal(ashShelterPockets.kind, 'ash-shelter-pocket-set');
  assert.ok(ashShelterPockets.pockets.length >= 1, `case ${index} should expose shelter pockets`);

  const brimstoneRationCaches = rationCacheKit.describe(state);
  assert.equal(brimstoneRationCaches.kind, 'brimstone-ration-cache-set');
  assert.ok(brimstoneRationCaches.caches.length >= 1, `case ${index} should expose ration caches`);

  const dawnExtractionCircles = dawnExtractionKit.describe(state);
  assert.equal(dawnExtractionCircles.kind, 'dawn-extraction-circle-set');
  assert.equal(dawnExtractionCircles.circles.length, 3, `case ${index} should expose three dawn extraction circles`);

  const handoff = handoffKit.describe({ survivorCaravanColumns, soulLanternChains, hellgateBreaches, ashShelterPockets, brimstoneRationCaches, dawnExtractionCircles });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.survivorCaravanColumns, 3);
  assert.equal(handoff.counts.soulLanternChains, 4);
  assert.equal(handoff.counts.hellgateBreaches, 3);
  assert.equal(handoff.counts.dawnExtractionCircles, 3);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'ash-caravan-readiness-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.equal(domain.rendererHandoff.counts.survivorCaravanColumns, 3);
  assert.equal(domain.rendererHandoff.counts.dawnExtractionCircles, 3);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-ash-caravan-readiness-domain-kits-smoke: ${cases.length} intake cases passed`);
