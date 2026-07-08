import assert from 'node:assert/strict';
import {
  createHellscapePortalSealPriorityKit,
  createHellscapeCurseDebtLedgerKit,
  createHellscapeRelicRouteThreadKit,
  createHellscapeSacrificeRiskAuraKit,
  createHellscapeDemonChampionWakeKit,
  createHellscapeFinalPactWindowKit,
  createHellscapeInfernalContractRendererHandoffKit,
  createHellscapeInfernalContractReadinessDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-infernal-contract-readiness-domain-kit.js';

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
    time: index * 0.37,
    clock: { elapsed: index * 0.37, delta: 1 / 60 },
    player: { x: -220 + index * 52, y: 160 - index * 21, hp: 100 - index * 5, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 19, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'infernal contract smoke' },
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
      hp: 30 + n * 12,
      maxHp: 90,
      size: 16 + n * 2,
      x: -250 + n * 115 + index * 7,
      y: -120 + n * 72 - index * 6
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
const portalSealKit = createHellscapePortalSealPriorityKit();
const curseDebtKit = createHellscapeCurseDebtLedgerKit();
const relicRouteKit = createHellscapeRelicRouteThreadKit();
const sacrificeRiskKit = createHellscapeSacrificeRiskAuraKit();
const demonChampionKit = createHellscapeDemonChampionWakeKit();
const finalPactKit = createHellscapeFinalPactWindowKit();
const handoffKit = createHellscapeInfernalContractRendererHandoffKit();
const domainKit = createHellscapeInfernalContractReadinessDomainKit();

for (const [index, state] of cases.entries()) {
  const portalSealPriorities = portalSealKit.describe(state);
  assert.equal(portalSealPriorities.kind, 'portal-seal-priority-set');
  assert.equal(portalSealPriorities.seals.length, 3, `case ${index} should expose three portal seal priorities`);
  assert.ok(portalSealPriorities.seals.every(seal => seal.priority >= 0 && seal.priority <= 1), `case ${index} seal priorities should be normalized`);

  const curseDebtLedgers = curseDebtKit.describe(state);
  assert.equal(curseDebtLedgers.kind, 'curse-debt-ledger-set');
  assert.equal(curseDebtLedgers.debts.length, 4, `case ${index} should expose four curse debts`);

  const relicRouteThreads = relicRouteKit.describe(state);
  assert.equal(relicRouteThreads.kind, 'relic-route-thread-set');
  assert.ok(relicRouteThreads.threads.length >= 1, `case ${index} should expose relic route threads`);

  const sacrificeRiskAuras = sacrificeRiskKit.describe(state);
  assert.equal(sacrificeRiskAuras.kind, 'sacrifice-risk-aura-set');
  assert.ok(sacrificeRiskAuras.auras.length >= 2, `case ${index} should expose player/core sacrifice auras`);

  const demonChampionWakes = demonChampionKit.describe(state);
  assert.equal(demonChampionWakes.kind, 'demon-champion-wake-set');
  assert.ok(demonChampionWakes.wakes.length >= 1, `case ${index} should expose champion wake descriptors`);

  const finalPactWindows = finalPactKit.describe(state);
  assert.equal(finalPactWindows.kind, 'final-pact-window-set');
  assert.equal(finalPactWindows.windows.length, 3, `case ${index} should expose three final pact windows`);

  const handoff = handoffKit.describe({ portalSealPriorities, curseDebtLedgers, relicRouteThreads, sacrificeRiskAuras, demonChampionWakes, finalPactWindows });
  assert.equal(handoff.kind, 'renderer-handoff');
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.portalSealPriorities, 3);
  assert.equal(handoff.counts.curseDebtLedgers, 4);
  assert.equal(handoff.counts.finalPactWindows, 3);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, 'infernal-contract-readiness-domain');
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes('renderer consumes descriptors only'));
  assert.equal(domain.rendererHandoff.counts.portalSealPriorities, 3);
  assert.equal(domain.rendererHandoff.counts.finalPactWindows, 3);

  assertSerializable(domain, `case ${index} domain`);
  assertNoForbiddenOwnership(domain, `case ${index} domain`);
}

console.log(`hellscape-infernal-contract-readiness-domain-kits-smoke: ${cases.length} intake cases passed`);
