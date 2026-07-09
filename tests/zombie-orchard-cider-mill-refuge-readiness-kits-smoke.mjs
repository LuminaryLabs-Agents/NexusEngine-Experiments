import assert from 'node:assert/strict';
import { createZombieOrchardCiderMillRefugeReadinessDomainKit, ZOMBIE_ORCHARD_CIDER_MILL_REFUGE_DOMAIN_TREE } from '../experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js';

const domain = createZombieOrchardCiderMillRefugeReadinessDomainKit({ seed: 'smoke-cider-mill-refuge' });
const cases = [
  { seed: 'cold-start', round: 1, apples: 0, survivors: 3, pressure: 0.1 },
  { seed: 'apple-heavy', round: 2, apples: 18, ciderPressed: 4, survivors: 4, pressure: 0.25 },
  { seed: 'cellar-stocked', round: 3, apples: 10, cellarCrates: 5, survivors: 5, pressure: 0.35 },
  { seed: 'lantern-route', round: 4, routeLanterns: 5, stamina: 85, survivors: 4, pressure: 0.42 },
  { seed: 'sawbuck-braced', round: 5, sawbuckCount: 6, health: 88, survivors: 6, pressure: 0.55 },
  { seed: 'wagons-loading', round: 6, wagonsLoaded: 3, routeLanterns: 4, cellarCrates: 4, survivors: 5, rescued: 1, pressure: 0.48 },
  { seed: 'family-progress', round: 7, families: 8, familiesSheltered: 5, ciderPressed: 8, cellarCrates: 6, pressure: 0.6 },
  { seed: 'horde-surge', round: 8, apples: 3, pressure: 0.9, survivors: 7, rescued: 0 },
  { seed: 'near-complete', round: 9, apples: 22, ciderPressed: 8, cellarCrates: 7, routeLanterns: 7, sawbuckCount: 7, wagonsLoaded: 4, families: 6, familiesSheltered: 5, pressure: 0.3 },
  { seed: 'complete', round: 10, apples: 28, ciderPressed: 10, cellarCrates: 8, routeLanterns: 8, sawbuckCount: 8, wagonsLoaded: 5, families: 6, familiesSheltered: 6, pressure: 0.18 }
];

assert.equal(domain.domainTree.id, ZOMBIE_ORCHARD_CIDER_MILL_REFUGE_DOMAIN_TREE.id);
assert.deepEqual(domain.ownershipExclusions.includes('renderer'), true);
const scores = [];
for (const testCase of cases) {
  const result = domain.compose(testCase);
  scores.push(result.summary.readinessScore);
  assert.equal(result.id, 'zombie-orchard-cider-mill-refuge-readiness');
  assert.ok(result.summary.readinessScore >= 0 && result.summary.readinessScore <= 1, 'readiness bounded');
  assert.ok(result.summary.hordePressure >= 0 && result.summary.hordePressure <= 1, 'pressure bounded');
  assert.ok(['refuge-convoy-ready', 'mill-under-siege', 'families-staging', 'provisions-forming'].includes(result.summary.missionState));
  assert.ok(result.summary.topPriority.length > 8);
  assert.equal(result.rendererHandoff.passId, 'cider-mill-refuge-readiness-renderer-handoff-pass');
  assert.equal(result.rendererHandoff.counts.dawnRefugeLedgers, 1);
  assert.ok(result.rendererHandoff.counts.total >= 12, 'enough descriptors for visual variety');
  assert.equal(result.rendererHandoff.flatDescriptors.length, result.rendererHandoff.counts.total);
  assert.ok(result.rendererHandoff.flatDescriptors.every((item) => item.rendererHints.consumes === 'descriptor-only'));
  JSON.stringify(result);
}
assert.ok(scores.at(-1) > scores[0], 'complete state should improve over cold start');
console.log('Zombie Orchard cider mill refuge readiness kits smoke passed 10 intake cases.');
