import assert from 'node:assert/strict';
import {
  createHellscapeRealmPressureGradientKit,
  createHellscapeResourceRouteWebKit,
  createHellscapeCoreDefenseRadiusKit,
  createHellscapePortalRiskBeaconKit,
  createHellscapeBuildAffordanceBandKit,
  createHellscapeWaveThreatLaneKit,
  createHellscapeRendererHandoffKit,
  createHellscapeSiegeFractalDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-siege-fractal-domain-kit.js';

const buildCatalog = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, range: 0, color: '#94a3b8' },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, range: 310, color: '#38bdf8' },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, range: 160, color: '#10b981' }
];

function makeCase(index) {
  const realmIds = ['lobby', 'grove', 'crystal', 'ashes'];
  const realmId = realmIds[index % realmIds.length];
  const waveActive = index % 2 === 0;
  return {
    time: index * 0.37,
    clock: { elapsed: index * 0.37, delta: 1 / 60 },
    realm: { id: realmId, prompt: realmId === 'lobby' ? 'DEFEND THE CORE.' : 'HARVEST MATERIALS.' },
    player: { x: -220 + index * 44, y: 160 - index * 18, hp: 100 - index * 2, maxHp: 100 },
    camera: { x: 0, y: 0 },
    core: { x: 0, y: -60, hp: 300 - index * 16, maxHp: 300 },
    wave: { n: index + 1, active: waveActive, queue: waveActive ? ['crawler', 'brute', 'crawler'].slice(0, 1 + (index % 3)) : [], timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: Array.from({ length: 3 + (index % 4) }, (_, n) => ({
      id: `res-${index}-${n}`,
      kind: n % 2 ? 'berry' : 'oak',
      item: n % 2 ? 'berry' : 'wood',
      color: n % 2 ? '#ef4444' : '#22543d',
      hp: 30 + n * 7,
      maxHp: 90,
      size: 20 + n,
      x: -280 + n * 120 + index * 3,
      y: -120 + n * 80 - index * 2
    })),
    drops: Array.from({ length: index % 5 }, (_, n) => ({ x: 60 + n * 24, y: 10 - n * 18, item: n % 2 ? 'energy' : 'wood', color: n % 2 ? '#e9d5ff' : '#22543d' })),
    structures: Array.from({ length: 1 + (index % 3) }, (_, n) => ({
      kind: ['wall', 'turret', 'pylon'][n % 3],
      x: -90 + n * 90,
      y: 10 + n * 48,
      hp: 100 - n * 12,
      maxHp: 120,
      range: n === 1 ? 310 : n === 2 ? 160 : 0,
      color: ['#94a3b8', '#38bdf8', '#10b981'][n % 3]
    })),
    enemies: Array.from({ length: index + 1 }, (_, n) => ({
      type: n % 3 === 0 ? 'brute' : 'crawler',
      x: Math.cos(n) * (450 + index * 12),
      y: Math.sin(n) * (450 + index * 12),
      hp: n % 3 === 0 ? 120 : 42,
      maxHp: n % 3 === 0 ? 120 : 42,
      size: n % 3 === 0 ? 28 : 17
    })),
    inventory: { items: { wood: index * 2, obsidian: index, crystal: 3 + index, energy: 2 + index, spore: index % 4, sulfur: index % 3 } },
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

const realmPressureKit = createHellscapeRealmPressureGradientKit();
const resourceRouteKit = createHellscapeResourceRouteWebKit();
const coreDefenseKit = createHellscapeCoreDefenseRadiusKit();
const portalRiskKit = createHellscapePortalRiskBeaconKit();
const buildAffordanceKit = createHellscapeBuildAffordanceBandKit();
const waveThreatKit = createHellscapeWaveThreatLaneKit();
const handoffKit = createHellscapeRendererHandoffKit();
const domainKit = createHellscapeSiegeFractalDomainKit();

for (const [index, state] of cases.entries()) {
  const realmPressure = realmPressureKit.describe(state);
  assert.equal(realmPressure.kind, 'realm-pressure-gradient');
  assert.ok(realmPressure.rings.length >= 4, `case ${index} should produce pressure rings`);

  const resourceRoutes = resourceRouteKit.describe(state);
  assert.equal(resourceRoutes.kind, 'resource-route-web');
  assert.ok(resourceRoutes.routes.length >= state.drops.length, `case ${index} should prioritize drops/resources`);

  const coreDefense = coreDefenseKit.describe(state);
  assert.equal(coreDefense.kind, 'core-defense-radius');
  assert.ok(coreDefense.coreRings.length >= 3, `case ${index} should expose core defense shells`);

  const portalBeacons = portalRiskKit.describe(state);
  assert.equal(portalBeacons.kind, 'portal-risk-beacon-set');
  assert.ok(portalBeacons.beacons.length >= 1, `case ${index} should expose portal or return beacons`);

  const buildAffordances = buildAffordanceKit.describe(state);
  assert.equal(buildAffordances.kind, 'build-affordance-band');
  assert.equal(buildAffordances.options.length, buildCatalog.length, `case ${index} should expose all build affordances`);

  const threatLanes = waveThreatKit.describe(state);
  assert.equal(threatLanes.kind, 'wave-threat-lane-set');
  assert.ok(threatLanes.lanes.length >= 1, `case ${index} should expose threat lanes`);

  const handoff = handoffKit.describe({ realmPressure, resourceRoutes, coreDefense, portalBeacons, buildAffordances, threatLanes });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.buildOptions, buildCatalog.length);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'visual-fractal-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.ok(domain.rendererHandoff.counts.portalBeacons >= 1);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-siege-fractal-domain-kits-smoke: ${cases.length} intake cases passed`);
