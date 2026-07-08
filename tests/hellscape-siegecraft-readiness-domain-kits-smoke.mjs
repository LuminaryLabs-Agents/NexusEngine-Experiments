import assert from 'node:assert/strict';
import {
  createHellscapeBarricadeFootprintGridKit,
  createHellscapeTurretCrossfireLatticeKit,
  createHellscapeResourceBurnForecastKit,
  createHellscapeBuildPriorityQueueKit,
  createHellscapeCoreBreachCountdownKit,
  createHellscapeExtractionRiskRibbonKit,
  createHellscapeSiegecraftRendererHandoffKit,
  createHellscapeSiegecraftReadinessDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-siegecraft-readiness-domain-kit.js';

const buildCatalog = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, hp: 180, range: 0, color: '#94a3b8' },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, hp: 100, range: 310, color: '#38bdf8' },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, hp: 100, range: 160, color: '#10b981' }
];

function makeCase(index) {
  const realmIds = ['lobby', 'grove', 'crystal', 'ashes'];
  const realmId = realmIds[index % realmIds.length];
  return {
    time: index * 0.37,
    clock: { elapsed: index * 0.37, delta: 1 / 60 },
    realm: { id: realmId, prompt: realmId === 'lobby' ? 'DEFEND THE CORE.' : 'HARVEST AND RETURN.' },
    player: { x: -180 + index * 35, y: 145 - index * 16, hp: 100 - index * 4, maxHp: 100, hurt: index % 3 === 0 ? 1 : 0 },
    core: { x: 0, y: -60, hp: 300 - index * 21, maxHp: 300 },
    wave: { n: index + 1, active: index % 2 === 0, queue: ['crawler', 'brute', 'crawler', 'crawler', 'brute'].slice(0, index % 5), timer: index * 0.2 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    structures: Array.from({ length: 1 + (index % 5) }, (_, n) => ({
      kind: ['wall', 'turret', 'pylon', 'turret', 'wall'][n % 5],
      x: -170 + n * 86,
      y: -22 + n * 42,
      hp: 140 - n * 14,
      maxHp: 160,
      range: n % 5 === 1 || n % 5 === 3 ? 310 : n % 5 === 2 ? 160 : 0,
      color: ['#94a3b8', '#38bdf8', '#10b981', '#38bdf8', '#94a3b8'][n % 5]
    })),
    enemies: Array.from({ length: 1 + index }, (_, n) => ({
      type: n % 4 === 0 ? 'brute' : 'crawler',
      x: Math.cos(index * 0.4 + n) * (390 + index * 21),
      y: Math.sin(index * 0.35 + n) * (360 + index * 18),
      hp: n % 4 === 0 ? 130 : 42,
      maxHp: n % 4 === 0 ? 130 : 42,
      size: n % 4 === 0 ? 28 : 17
    })),
    resources: [{ x: -50 + index * 12, y: -140 + index * 8, kind: 'oak', item: 'wood', hp: 70, maxHp: 90, color: '#22543d' }],
    drops: index % 2 ? [{ x: 32 + index * 5, y: 44 - index * 6, item: 'energy', color: '#e9d5ff' }] : [],
    inventory: { items: { wood: 4 + index * 2, obsidian: index % 5, crystal: 3 + index, energy: 2 + index, spore: index % 4, sulfur: 1 + (index % 3) } },
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

const barricadeKit = createHellscapeBarricadeFootprintGridKit();
const crossfireKit = createHellscapeTurretCrossfireLatticeKit();
const burnKit = createHellscapeResourceBurnForecastKit();
const priorityKit = createHellscapeBuildPriorityQueueKit();
const breachKit = createHellscapeCoreBreachCountdownKit();
const extractionKit = createHellscapeExtractionRiskRibbonKit();
const handoffKit = createHellscapeSiegecraftRendererHandoffKit();
const domainKit = createHellscapeSiegecraftReadinessDomainKit();

for (const [index, state] of cases.entries()) {
  const barricadeFootprints = barricadeKit.describe(state);
  assert.equal(barricadeFootprints.kind, 'barricade-footprint-grid');
  assert.equal(barricadeFootprints.cells.length, 8, `case ${index} should expose 8 build footprint cells`);

  const turretCrossfire = crossfireKit.describe(state);
  assert.equal(turretCrossfire.kind, 'turret-crossfire-lattice');
  assert.ok(turretCrossfire.lattice.length >= 1, `case ${index} should expose turret or ghost crossfire`);

  const resourceBurnForecasts = burnKit.describe(state);
  assert.equal(resourceBurnForecasts.kind, 'resource-burn-forecast-set');
  assert.equal(resourceBurnForecasts.forecasts.length, buildCatalog.length, `case ${index} should expose every build burn forecast`);

  const buildPriorityQueue = priorityKit.describe(state);
  assert.equal(buildPriorityQueue.kind, 'build-priority-queue');
  assert.equal(buildPriorityQueue.queue.length, buildCatalog.length, `case ${index} should rank every build option`);
  assert.equal(buildPriorityQueue.queue[0].rank, 1, `case ${index} should rank the first priority as 1`);

  const coreBreachCountdowns = breachKit.describe(state);
  assert.equal(coreBreachCountdowns.kind, 'core-breach-countdown-set');
  assert.ok(coreBreachCountdowns.countdowns.length >= 1, `case ${index} should expose breach countdowns`);

  const extractionRiskRibbons = extractionKit.describe(state);
  assert.equal(extractionRiskRibbons.kind, 'extraction-risk-ribbon-set');
  assert.ok(extractionRiskRibbons.ribbons.length >= 1, `case ${index} should expose extraction risk ribbons`);

  const handoff = handoffKit.describe({ barricadeFootprints, turretCrossfire, resourceBurnForecasts, buildPriorityQueue, coreBreachCountdowns, extractionRiskRibbons });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.barricadeFootprints, 8);
  assert.equal(handoff.counts.resourceBurnForecasts, buildCatalog.length);
  assert.equal(handoff.counts.buildPriorityQueue, buildCatalog.length);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'siegecraft-readiness-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.equal(domain.rendererHandoff.counts.barricadeFootprints, 8);
  assert.ok(domain.rendererHandoff.counts.turretCrossfire >= 1);
  assert.equal(domain.rendererHandoff.counts.resourceBurnForecasts, buildCatalog.length);
  assert.equal(domain.rendererHandoff.counts.buildPriorityQueue, buildCatalog.length);
  assert.ok(domain.rendererHandoff.counts.coreBreachCountdowns >= 1);
  assert.ok(domain.rendererHandoff.counts.extractionRiskRibbons >= 1);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-siegecraft-readiness-domain-kits-smoke: ${cases.length} intake cases passed`);
