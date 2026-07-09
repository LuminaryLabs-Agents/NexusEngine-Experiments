import assert from 'node:assert/strict';
import { createHellscapeEmberWellPurificationReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-domain-kit.js';

const domain = createHellscapeEmberWellPurificationReadinessDomainKit();
const phases = new Set(['scan-ember-wells', 'prime-purifiers', 'carry-clean-water', 'dawn-water-secured']);
const cases = Array.from({ length: 10 }, (_, index) => ({
  wave: { index: index + 1 },
  avatar: { position: { x: index * 7, y: -index * 4 } },
  core: { position: { x: 12, y: 18 } },
  inventory: {
    ash: 1 + index,
    brimstone: index % 4,
    runes: Math.floor(index / 2),
    herbs: 2 + (index % 3),
    crystal: index > 6 ? 2 : 0
  },
  corruption: Math.max(0.05, 0.9 - index * 0.07),
  heat: Math.min(1, 0.35 + index * 0.04),
  survivors: 3 + index,
  enemies: Math.max(0, 12 - index)
}));

let previousPreparedReadiness = 0;
for (const [index, input] of cases.entries()) {
  const readiness = domain.describe(input);
  assert.equal(readiness.domain, 'hellscape-ember-well-purification-readiness-domain');
  assert.ok(readiness.readiness >= 0 && readiness.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(readiness.corruptionPressure >= 0 && readiness.corruptionPressure <= 1, `case ${index} pressure bounded`);
  assert.ok(phases.has(readiness.phase), `case ${index} phase enum`);
  assert.equal(readiness.ashWellScans.length, 3, `case ${index} ash well scans`);
  assert.equal(readiness.brimstoneFilters.length, readiness.ashWellScans.length, `case ${index} filters match wells`);
  assert.equal(readiness.coolantRuneLoops.length, readiness.ashWellScans.length, `case ${index} rune loops match wells`);
  assert.equal(readiness.sanctifiedCisterns.length, readiness.ashWellScans.length, `case ${index} cisterns match wells`);
  assert.equal(readiness.waterBearerRoutes.length, readiness.sanctifiedCisterns.length, `case ${index} routes match cisterns`);
  assert.equal(readiness.dawnPurificationLedgers.length, 1, `case ${index} ledger`);
  assert.equal(readiness.rendererHandoff.kind, 'renderer-handoff');
  assert.equal(readiness.rendererHandoff.policy, 'renderer-consumes-descriptors-only');
  assert.equal(readiness.rendererHandoff.counts.total, 16, `case ${index} descriptor total`);
  assert.equal(readiness.ownership.dom, false);
  assert.equal(readiness.ownership.frameLoop, false);
  assert.equal(readiness.ownership.threeJs, false);
  JSON.parse(JSON.stringify(readiness));
  if (index === 9) previousPreparedReadiness = readiness.readiness;
}

const cold = domain.describe({ inventory: { ash: 0, brimstone: 0, runes: 0, herbs: 0 }, corruption: 0.92, heat: 0.88, enemies: 18, survivors: 2 });
const prepared = domain.describe({ inventory: { ash: 9, brimstone: 6, runes: 7, herbs: 8, crystal: 3 }, corruption: 0.18, heat: 0.22, enemies: 1, survivors: 12 });
assert.ok(prepared.readiness > cold.readiness, 'prepared purification input improves readiness');
assert.ok(previousPreparedReadiness > 0, 'tenth case produced usable readiness');

console.log('Hellscape ember well purification readiness kits smoke passed 10 intake cases.');
