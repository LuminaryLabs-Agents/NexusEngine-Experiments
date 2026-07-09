import assert from 'node:assert/strict';
import { createHellscapeBloodMoonRefugeReadinessDomainKit, HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE } from '../games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-domain-kit.js';

const kit = createHellscapeBloodMoonRefugeReadinessDomainKit();

function makeCase(index) {
  return {
    avatar: { position: { x: index * 0.25, y: index % 3 } },
    core: { position: { x: 0, y: 0 } },
    inventory: { herbs: 2 + index, ashHerbs: index % 4, brimstone: 1 + (index % 2), runes: 1 + (index % 3) },
    rescued: Math.floor(index / 3),
    wave: { index: 1 + index },
    survivors: Array.from({ length: 2 + (index % 4) }, (_, survivorIndex) => ({
      id: `case-${index}-survivor-${survivorIndex}`,
      x: -2 + survivorIndex * 1.1 + index * 0.12,
      y: 1.4 - survivorIndex * 0.55,
      condition: survivorIndex % 2 ? 'burned' : 'panicked'
    })),
    enemies: Array.from({ length: 2 + (index % 5) }, (_, enemyIndex) => ({
      id: `case-${index}-demon-${enemyIndex}`,
      x: 2 + enemyIndex * 0.72,
      y: enemyIndex % 2 ? -1.8 : 1.8,
      threat: 0.34 + enemyIndex * 0.09 + index * 0.02
    })),
    builds: [
      { id: `case-${index}-gate`, x: -0.8, y: 0.9, kind: 'gate' },
      { id: `case-${index}-ward`, x: 1.2, y: -0.6, kind: 'ward' }
    ]
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));

assert.equal(HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE.root, 'hellscape-blood-moon-refuge-readiness-domain');
assert.ok(kit.kitIds.length >= 7, 'domain exposes atomic kit ids');

for (const [index, input] of cases.entries()) {
  const result = kit.describe(input);
  assert.equal(result.domain, 'hellscape-blood-moon-refuge-readiness', `case ${index} domain`);
  assert.equal(result.refugeSigilBeacons.length, input.survivors.length, `case ${index} sigil count follows survivor count`);
  assert.ok(result.ashMedicineCaches.length >= 2, `case ${index} medicine caches emitted`);
  assert.ok(result.wardedShelterRings.length >= 1, `case ${index} shelter rings emitted`);
  assert.equal(result.demonPressureFronts.length, input.enemies.length, `case ${index} pressure front count follows enemy count`);
  assert.equal(result.soulFerryRoutes.length, input.survivors.length, `case ${index} ferry route count follows survivor count`);
  assert.equal(result.dawnRefugeLedgers.length, 1, `case ${index} one dawn ledger emitted`);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness bounded`);
  assert.ok(['gather-survivors', 'hold-refuge', 'dawn-transfer'].includes(result.phase), `case ${index} phase enum`);
  assert.ok(result.rendererHandoff.counts.total >= input.survivors.length * 2 + input.enemies.length + 4, `case ${index} total descriptor count`);
  assert.doesNotThrow(() => JSON.stringify(result), `case ${index} serializable`);
}

const lowSupply = kit.describe(makeCase(0));
const highSupply = kit.describe({ ...makeCase(9), inventory: { herbs: 14, ashHerbs: 6, brimstone: 4, runes: 5 }, rescued: 6, enemies: makeCase(9).enemies.slice(0, 2) });
assert.ok(highSupply.readiness >= lowSupply.readiness, 'higher supply / rescued state should not lower readiness');

console.log('Hellscape blood moon refuge readiness kits smoke passed 10 intake cases.');
