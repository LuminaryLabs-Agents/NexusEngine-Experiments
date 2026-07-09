import assert from 'node:assert/strict';
import { createHellscapeObsidianSeedVaultReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-domain-kit.js';

const domain = createHellscapeObsidianSeedVaultReadinessDomainKit();

const seedSites = [
  { position: { x: -82, y: -34 }, blight: 0.74 },
  { position: { x: 94, y: -12 }, blight: 0.58 },
  { position: { x: 26, y: 78 }, blight: 0.42 },
  { position: { x: -44, y: 82 }, blight: 0.34 }
];

const cases = [
  { name: 'cold start', input: { wave: { index: 1 }, seedSites, inventory: { ash: 1 }, enemies: 4 } },
  { name: 'seed scan', input: { wave: { index: 2 }, seedSites, inventory: { ash: 2, herbs: 1 }, completedFacts: ['seed.scan.01'], enemies: 5 } },
  { name: 'vault crystal', input: { wave: { index: 3 }, seedSites, inventory: { ash: 3, crystal: 2, herbs: 1 }, completedFacts: ['seed.scan.01', 'vault.seed.shelf'], enemies: 6 } },
  { name: 'ash rill', input: { wave: { index: 4 }, seedSites, inventory: { ash: 5, crystal: 2, herbs: 1, water: 2 }, completedFacts: ['seed.scan.01', 'vault.seed.shelf'], enemies: 7 } },
  { name: 'bone sigils', input: { wave: { index: 5 }, seedSites, inventory: { ash: 5, crystal: 3, herbs: 2, water: 2, bone: 4, brimstone: 2 }, completedFacts: ['seed.scan.01', 'vault.seed.shelf'], enemies: 8 } },
  { name: 'cart escort', input: { wave: { index: 5 }, seedSites, inventory: { ash: 6, crystal: 3, herbs: 3, water: 3, bone: 4, brimstone: 3, seed: 1 }, completedFacts: ['seed.scan.01', 'vault.seed.shelf', 'cart.seed.escort'], enemies: 5 } },
  { name: 'heavy blight', input: { wave: { index: 8 }, seedSites, corruption: 0.88, inventory: { ash: 4, crystal: 1, herbs: 0, water: 0, bone: 1 }, enemies: 14 } },
  { name: 'sanctuary cart', input: { wave: { index: 7 }, seedSites, avatar: { position: { x: 15, y: -12 } }, core: { position: { x: 0, y: 0 } }, inventory: { ash: 7, crystal: 4, herbs: 3, water: 4, bone: 5, brimstone: 3, seed: 2 }, enemies: 6, completedFacts: ['vault.seed.shelf'] } },
  { name: 'near handoff', input: { wave: { index: 8 }, seedSites, inventory: { ash: 8, crystal: 5, herbs: 5, water: 5, bone: 6, brimstone: 5, seed: 3 }, enemies: 4, completedFacts: ['vault.seed.shelf', 'cart.seed.escort', 'dawn.reseeding.route'] } },
  { name: 'dawn convoy', input: { wave: { index: 9 }, seedSites, inventory: { ash: 10, crystal: 7, herbs: 6, water: 6, bone: 7, brimstone: 6, seed: 4 }, enemies: 2, completedFacts: ['vault.seed.shelf', 'cart.seed.escort', 'dawn.reseeding.route', 'dawn.reseeding.handoff'] } }
];

assert.equal(domain.id, 'hellscape-obsidian-seed-vault-readiness-domain-kit');
assert.equal(domain.tree.root, 'hellscape-obsidian-seed-vault-readiness-domain');
assert.ok(domain.kits.includes('hellscape-charred-orchard-seed-kit'));
assert.ok(domain.kits.includes('hellscape-obsidian-seed-vault-renderer-handoff-kit'));

for (const item of cases) {
  const output = domain.describe(item.input);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `${item.name} readiness bounded`);
  assert.ok(output.blightPressure >= 0 && output.blightPressure <= 1, `${item.name} blight pressure bounded`);
  assert.ok(['recover-charred-seeds', 'seal-vault-shelves', 'escort-seed-carts', 'dawn-reseeding-ready'].includes(output.missionState), `${item.name} mission state enum`);
  assert.ok(output.rendererHandoff.counts.charredOrchardSeeds >= 1, `${item.name} seed descriptors`);
  assert.ok(output.rendererHandoff.counts.obsidianVaultShelves >= 1, `${item.name} shelf descriptors`);
  assert.ok(output.rendererHandoff.counts.ashIrrigationChannels >= 1, `${item.name} irrigation descriptors`);
  assert.ok(output.rendererHandoff.counts.blightScarecrowSigils >= 1, `${item.name} sigil descriptors`);
  assert.ok(output.rendererHandoff.counts.sanctuarySeedCarts >= 1, `${item.name} cart descriptors`);
  assert.equal(output.rendererHandoff.counts.dawnReseedingLedgers, 1, `${item.name} ledger descriptor`);
  assert.ok(output.rendererHandoff.ownership.rendererConsumesDescriptorsOnly, `${item.name} renderer consumes descriptors only`);
  assert.ok(output.ownership.excludes.includes('Three.js'), `${item.name} kit excludes Three.js`);
  assert.doesNotThrow(() => JSON.stringify(output), `${item.name} output is serializable`);
}

const early = domain.describe(cases[0].input);
const late = domain.describe(cases.at(-1).input);
const heavy = domain.describe(cases[6].input);
assert.ok(late.readiness > early.readiness, 'handoff state improves over cold start');
assert.ok(late.blightPressure < heavy.blightPressure, 'prepared handoff lowers blight pressure against heavy blight case');
console.log('Hellscape obsidian seed vault readiness kits smoke passed 10 intake cases.');
