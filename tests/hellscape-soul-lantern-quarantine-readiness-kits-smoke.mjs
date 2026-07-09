import assert from 'node:assert/strict';
import { createHellscapeSoulLanternQuarantineReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js';

const kit = createHellscapeSoulLanternQuarantineReadinessDomainKit();
const cases = [
  { name: 'cold breach', state: { wave: 0, coreHealth: 100, inventory: {} } },
  { name: 'first soul', state: { wave: 1, coreHealth: 92, inventory: { souls: 2, bloodroot: 1, ember: 1 } } },
  { name: 'lantern line', state: { wave: 2, coreHealth: 88, inventory: { souls: 5, bloodroot: 2, ember: 4 }, wards: 1 } },
  { name: 'breach pressure', state: { wave: 4, coreHealth: 62, breaches: 3, survivors: 4, inventory: { souls: 3, bloodroot: 2 } } },
  { name: 'warded camp', state: { wave: 5, coreHealth: 78, breaches: 1, wards: 4, inventory: { souls: 7, bloodroot: 5, ember: 8 } } },
  { name: 'full cure cache', state: { wave: 6, coreHealth: 95, wards: 5, survivors: 8, inventory: { souls: 12, bloodroot: 8, ember: 9 } } },
  { name: 'low health base', state: { wave: 7, coreHealth: 24, maxCoreHealth: 100, breaches: 4, inventory: { souls: 2, ember: 1 } } },
  { name: 'map inventory', state: { wave: 3, core: { health: 70, maxHealth: 100 }, inventory: new Map([['souls', 6], ['bloodroot', 4], ['ember', 3]]), wards: 2 } },
  { name: 'object builds', state: { wave: 4, coreHealth: 85, structures: { a: {}, b: {}, c: {} }, inventory: { souls: 4, bloodroot: 4, ember: 4 }, wards: 2 } },
  { name: 'late rescue', state: { wave: 9, coreHealth: 76, survivors: 10, breaches: 2, builds: [{}, {}, {}, {}], inventory: { souls: 14, bloodroot: 10, ember: 12, wards: 3 }, clock: { elapsed: 93 } } }
];

assert.equal(kit.domain, 'hellscape-soul-lantern-quarantine-readiness-domain');
assert.ok(kit.tree.includes('infection-containment-domain'));
assert.ok(kit.ownershipExclusions.includes('renderer'));
assert.ok(kit.ownershipExclusions.includes('DOM'));

const families = ['quarantineCircles', 'soulLanternStakes', 'ashwardTrenches', 'plagueMistVanes', 'cureTotemCaches', 'duskQuarantineLedgers'];
const results = cases.map(({ state }) => kit.describe(state));
for (const [index, result] of results.entries()) {
  assert.equal(result.domain, 'hellscape-soul-lantern-quarantine-readiness-domain', `domain ${index}`);
  assert.ok(Number.isInteger(result.readiness), `readiness integer ${index}`);
  assert.ok(result.readiness >= 0 && result.readiness <= 100, `readiness bounds ${index}`);
  assert.ok(result.contaminationPressure >= 0 && result.contaminationPressure <= 100, `pressure bounds ${index}`);
  assert.ok(['infection-spreading', 'breach-triage', 'lantern-line-forming', 'quarantine-lit'].includes(result.phase), `phase enum ${index}`);
  assert.deepEqual(result.rendererHandoff.policy.owns, [], `no renderer ownership ${index}`);
  assert.equal(result.rendererHandoff.policy.consumesDescriptorsOnly, true, `descriptor-only handoff ${index}`);
  for (const family of families) {
    assert.ok(Array.isArray(result.rendererHandoff.descriptors[family]), `${family} array ${index}`);
    assert.ok(result.rendererHandoff.descriptors[family].length > 0, `${family} populated ${index}`);
    assert.equal(result.rendererHandoff.counts[family], result.rendererHandoff.descriptors[family].length, `${family} count ${index}`);
  }
  assert.ok(result.rendererHandoff.flatDescriptors.length >= 16, `visual descriptor floor ${index}`);
  assert.doesNotThrow(() => JSON.stringify(result), `json safe ${index}`);
}
assert.ok(results[5].readiness > results[0].readiness, 'full cure cache improves readiness over cold breach');
assert.ok(results[6].contaminationPressure > results[5].contaminationPressure, 'low-health breach raises pressure');
console.log('Hellscape soul lantern quarantine readiness kits smoke passed 10 intake cases.');
