import assert from 'node:assert/strict';
import {
  createHellscapeEmberBellowsPressureKit,
  createHellscapeCrucibleCoolingLoopKit,
  createHellscapeRelicMoldPriorityKit,
  createHellscapeWardRuneCircleKit,
  createHellscapeSanctuaryLaneThreadKit,
  createHellscapeForgeGateCommitKit,
  createHellscapeSanctuaryForgeRendererHandoffKit,
  createHellscapeSanctuaryForgeReadinessDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js';

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
    time: index * 0.53,
    clock: { elapsed: index * 0.53, delta: 1 / 60 },
    player: { x: -260 + index * 54, y: 190 - index * 18, hp: 100 - index * 5, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 290 - index * 19, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'sanctuary forge smoke' },
    wave: { n: index + 2, active: index % 2 === 1, queue: Array.from({ length: index % 6 }, (_, n) => n % 3 ? 'crawler' : 'brute'), timer: index * 0.25 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: Array.from({ length: 2 + (index % 4) }, (_, n) => ({
      id: `forge-res-${index}-${n}`,
      kind: ['oak', 'crystal', 'ash-salt', 'ether-reed'][n % 4],
      item: ['wood', 'crystal', 'obsidian', 'energy'][n % 4],
      color: ['#22543d', '#a855f7', '#94a3b8', '#38bdf8'][n % 4],
      hp: 28 + n * 10,
      maxHp: 84,
      size: 14 + n * 2,
      x: -280 + n * 118 + index * 9,
      y: -140 + n * 66 - index * 7
    })),
    drops: Array.from({ length: index % 3 }, (_, n) => ({ x: 44 + n * 31, y: -40 + n * 28, item: n % 2 ? 'energy' : 'obsidian', color: n % 2 ? '#38bdf8' : '#94a3b8' })),
    structures: Array.from({ length: 1 + (index % 4) }, (_, n) => ({
      kind: ['wall', 'turret', 'pylon', 'forge'][n % 4],
      x: -120 + n * 82,
      y: -44 + n * 38,
      hp: 145 - index * 4 - n * 11,
      maxHp: 160,
      range: n % 4 === 1 ? 310 : n % 4 === 2 ? 170 : 0,
      color: ['#94a3b8', '#38bdf8', '#10b981', '#f97316'][n % 4]
    })),
    enemies: Array.from({ length: 2 + index }, (_, n) => ({
      type: n % 4 === 0 ? 'brute' : 'crawler',
      x: Math.cos(n + index * 0.31) * (340 + index * 22),
      y: Math.sin(n + index * 0.27) * (340 + index * 22),
      hp: n % 4 === 0 ? 132 : 44,
      maxHp: n % 4 === 0 ? 132 : 44,
      size: n % 4 === 0 ? 31 : 17
    })),
    inventory: { items: { wood: 4 + index * 2, obsidian: index % 8, crystal: 2 + index, energy: 2 + index, spore: index % 4, sulfur: index % 3 } },
    build: { selected: index % 3 },
    buildCatalog: [
      { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, color: '#94a3b8' },
      { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, color: '#38bdf8' },
      { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, color: '#10b981' }
    ]
  };
}

const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));
const bellowsKit = createHellscapeEmberBellowsPressureKit();
const coolingKit = createHellscapeCrucibleCoolingLoopKit();
const moldKit = createHellscapeRelicMoldPriorityKit();
const runeKit = createHellscapeWardRuneCircleKit();
const laneKit = createHellscapeSanctuaryLaneThreadKit();
const gateKit = createHellscapeForgeGateCommitKit();
const handoffKit = createHellscapeSanctuaryForgeRendererHandoffKit();
const domainKit = createHellscapeSanctuaryForgeReadinessDomainKit();

for (const [index, state] of cases.entries()) {
  const emberBellowsPressures = bellowsKit.describe(state);
  assert.equal(emberBellowsPressures.kind, 'ember-bellows-pressure-set');
  assert.ok(emberBellowsPressures.bellows.length >= 1, `case ${index} should expose bellows anchors`);
  assert.ok(emberBellowsPressures.bellows.every(bellows => bellows.stability >= 0 && bellows.stability <= 1), `case ${index} bellows stability should be normalized`);

  const crucibleCoolingLoops = coolingKit.describe(state);
  assert.equal(crucibleCoolingLoops.kind, 'crucible-cooling-loop-set');
  assert.ok(crucibleCoolingLoops.loops.length >= 2, `case ${index} should expose cooling loops`);

  const relicMoldPriorities = moldKit.describe(state);
  assert.equal(relicMoldPriorities.kind, 'relic-mold-priority-set');
  assert.equal(relicMoldPriorities.molds.length, 3, `case ${index} should expose three relic molds`);

  const wardRuneCircles = runeKit.describe(state);
  assert.equal(wardRuneCircles.kind, 'ward-rune-circle-set');
  assert.equal(wardRuneCircles.circles.length, 3, `case ${index} should expose three ward rune circles`);

  const sanctuaryLaneThreads = laneKit.describe(state);
  assert.equal(sanctuaryLaneThreads.kind, 'sanctuary-lane-thread-set');
  assert.equal(sanctuaryLaneThreads.lanes.length, 3, `case ${index} should expose three sanctuary lanes`);

  const forgeGateCommits = gateKit.describe(state);
  assert.equal(forgeGateCommits.kind, 'forge-gate-commit-set');
  assert.equal(forgeGateCommits.commits.length, 3, `case ${index} should expose three forge gate commits`);

  const handoff = handoffKit.describe({ emberBellowsPressures, crucibleCoolingLoops, relicMoldPriorities, wardRuneCircles, sanctuaryLaneThreads, forgeGateCommits });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.wardRuneCircles, 3);
  assert.equal(handoff.counts.sanctuaryLaneThreads, 3);
  assert.equal(handoff.counts.forgeGateCommits, 3);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'sanctuary-forge-readiness-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.equal(domain.rendererHandoff.counts.wardRuneCircles, 3);
  assert.equal(domain.rendererHandoff.counts.forgeGateCommits, 3);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-sanctuary-forge-readiness-domain-kits-smoke: ${cases.length} intake cases passed`);
