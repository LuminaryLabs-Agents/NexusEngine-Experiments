import assert from 'node:assert/strict';
import {
  createHellscapeExtractionRouteKit,
  createHellscapeSafeZoneBeaconKit,
  createHellscapeSurvivalVectorKit,
  createHellscapeCraftingWindowKit,
  createHellscapeBossWakeSignatureKit,
  createHellscapeRealmExitCompassKit,
  createHellscapeExpeditionRendererHandoffKit,
  createHellscapeExpeditionReadabilityDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-expedition-readability-domain-kit.js';

const buildCatalog = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, range: 0, color: '#94a3b8' },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, range: 310, color: '#38bdf8' },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, range: 160, color: '#10b981' }
];

function makeCase(index) {
  const realmIds = ['lobby', 'grove', 'crystal', 'ashes'];
  const realmId = realmIds[index % realmIds.length];
  return {
    time: index * 0.41,
    clock: { elapsed: index * 0.41, delta: 1 / 60 },
    realm: { id: realmId, prompt: realmId === 'lobby' ? 'DEFEND THE CORE.' : 'HARVEST MATERIALS.' },
    player: { x: -260 + index * 54, y: 180 - index * 28, hp: 100 - index * 3, maxHp: 100, hurt: index % 2 },
    camera: { x: 0, y: 0 },
    core: { x: 0, y: -60, hp: 300 - index * 18, maxHp: 300 },
    wave: { n: index + 2, active: index % 2 === 0, queue: ['crawler', 'brute', 'crawler', 'brute'].slice(0, index % 4), timer: index * 0.5 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: Array.from({ length: 2 + (index % 3) }, (_, n) => ({
      id: `res-${index}-${n}`,
      kind: n % 2 ? 'berry' : 'oak',
      item: n % 2 ? 'berry' : 'wood',
      color: n % 2 ? '#ef4444' : '#22543d',
      hp: 35 + n * 8,
      maxHp: 90,
      size: 18 + n,
      x: -280 + n * 110 + index * 5,
      y: -110 + n * 70 - index * 3
    })),
    drops: Array.from({ length: 1 + (index % 4) }, (_, n) => ({ x: 54 + n * 24, y: -32 + n * 20, item: n % 2 ? 'energy' : 'wood', color: n % 2 ? '#e9d5ff' : '#22543d' })),
    structures: Array.from({ length: 1 + (index % 4) }, (_, n) => ({
      kind: ['wall', 'turret', 'pylon', 'turret'][n % 4],
      x: -110 + n * 82,
      y: -12 + n * 50,
      hp: 120 - n * 14,
      maxHp: 140,
      range: n % 4 === 1 ? 310 : n % 4 === 2 ? 160 : 0,
      color: ['#94a3b8', '#38bdf8', '#10b981', '#38bdf8'][n % 4]
    })),
    enemies: Array.from({ length: 1 + index }, (_, n) => ({
      type: n % 4 === 0 ? 'brute' : 'crawler',
      x: Math.cos(n + index) * (430 + index * 18),
      y: Math.sin(n + index) * (430 + index * 18),
      hp: n % 4 === 0 ? 120 : 42,
      maxHp: n % 4 === 0 ? 120 : 42,
      size: n % 4 === 0 ? 28 : 17
    })),
    inventory: { items: { wood: index * 3, obsidian: index, crystal: 2 + index, energy: 2 + index, spore: index % 5, sulfur: index % 4 } },
    build: { selected: index % 3 },
    buildCatalog
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
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

const extractionRouteKit = createHellscapeExtractionRouteKit();
const safeZoneKit = createHellscapeSafeZoneBeaconKit();
const survivalVectorKit = createHellscapeSurvivalVectorKit();
const craftingWindowKit = createHellscapeCraftingWindowKit();
const bossWakeKit = createHellscapeBossWakeSignatureKit();
const exitCompassKit = createHellscapeRealmExitCompassKit();
const handoffKit = createHellscapeExpeditionRendererHandoffKit();
const domainKit = createHellscapeExpeditionReadabilityDomainKit();

for (const [index, state] of cases.entries()) {
  const extractionRoutes = extractionRouteKit.describe(state);
  assert.equal(extractionRoutes.kind, 'expedition-extraction-route-set');
  assert.ok(extractionRoutes.routes.length >= 1, `case ${index} should expose extraction or collection routes`);

  const safeZones = safeZoneKit.describe(state);
  assert.equal(safeZones.kind, 'safe-zone-beacon-set');
  assert.ok(safeZones.zones.length >= 1, `case ${index} should expose a core, return, or pylon safe zone`);

  const survivalVectors = survivalVectorKit.describe(state);
  assert.equal(survivalVectors.kind, 'survival-vector-set');
  assert.ok(survivalVectors.vectors.length >= 1, `case ${index} should expose survival direction vectors`);

  const craftingWindows = craftingWindowKit.describe(state);
  assert.equal(craftingWindows.kind, 'crafting-window-set');
  assert.equal(craftingWindows.windows.length, buildCatalog.length, `case ${index} should expose all crafting windows`);

  const bossWake = bossWakeKit.describe(state);
  assert.equal(bossWake.kind, 'boss-wake-signature-set');
  assert.ok(bossWake.signatures.length >= 1, `case ${index} should expose brute or queued wake signatures`);

  const exitCompass = exitCompassKit.describe(state);
  assert.equal(exitCompass.kind, 'realm-exit-compass');
  assert.ok(Number.isFinite(exitCompass.distance), `case ${index} should expose a finite exit compass distance`);

  const handoff = handoffKit.describe({ extractionRoutes, safeZones, survivalVectors, craftingWindows, bossWake, exitCompass });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.craftingWindows, buildCatalog.length);
  assert.ok(handoff.counts.exitCompass === 1, `case ${index} should expose one compass`);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'expedition-readability-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.ok(domain.rendererHandoff.counts.extractionRoutes >= 1);
  assert.ok(domain.rendererHandoff.counts.safeZones >= 1);
  assert.ok(domain.rendererHandoff.counts.survivalVectors >= 1);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-expedition-readability-domain-kits-smoke: ${cases.length} intake cases passed`);
