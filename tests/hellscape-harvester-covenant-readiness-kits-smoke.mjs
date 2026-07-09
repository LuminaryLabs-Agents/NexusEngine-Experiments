import assert from 'node:assert/strict';
import {
  HELLSCAPE_HARVESTER_COVENANT_KITS,
  HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE,
  createHellscapeHarvesterCovenantReadinessDomainKit
} from '../games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-domain-kit.js';

const domain = createHellscapeHarvesterCovenantReadinessDomainKit();
const CASES = [
  { label: 'cold start', wave: { index: 1 }, inventory: { ash: 1, water: 0, soul: 0 }, enemies: 4 },
  { label: 'watered plot', wave: { index: 2 }, inventory: { ash: 4, water: 4, bloodroot: 1, ember: 1 }, enemies: 3 },
  { label: 'soul tithe stocked', wave: { index: 3 }, inventory: { ash: 5, water: 3, soul: 4, ember: 3, crystal: 1 }, enemies: 5 },
  { label: 'high demon pressure', wave: { index: 7 }, inventory: { ash: 6, water: 2, soul: 1, ember: 1 }, enemies: 12, corruption: 0.82 },
  { label: 'custom plots', wave: { index: 4 }, bloodrootPlots: [{ position: { x: 20, y: -40 }, covenantScar: 0.1 }, { position: { x: 80, y: 30 }, covenantScar: 0.35 }], inventory: { ash: 6, water: 5, bloodroot: 2, soul: 3, ember: 2, crystal: 2 }, enemies: 2 },
  { label: 'strong seal', wave: { index: 5 }, inventory: { ash: 8, water: 5, bloodroot: 3, soul: 6, ember: 5, crystal: 5, brimstone: 3, bone: 4 }, enemies: 2 },
  { label: 'wagon repair shortage', wave: { index: 5 }, inventory: { ash: 2, water: 1, soul: 0, ember: 0, crystal: 0 }, enemies: 10 },
  { label: 'boss wave', wave: { index: 10, enemies: 18 }, inventory: { ash: 8, water: 2, soul: 4, ember: 3, crystal: 1, brimstone: 2, bone: 2 }, corruption: 0.9 },
  { label: 'dawn ready', wave: { index: 6 }, inventory: { ash: 12, water: 8, bloodroot: 6, soul: 10, ember: 8, crystal: 6, brimstone: 5, bone: 6 }, enemies: 1, corruption: 0.2 },
  { label: 'non numeric safety', wave: { index: 'bad' }, inventory: { ash: 'bad', water: null, soul: undefined }, enemies: 'bad' }
];

assert.equal(domain.id, 'hellscape-harvester-covenant-readiness-domain-kit');
assert.equal(HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE.root, 'hellscape-harvester-covenant-readiness-domain');
assert.ok(HELLSCAPE_HARVESTER_COVENANT_KITS.includes('hellscape-harvester-covenant-renderer-handoff-kit'));

let lowest = 1;
let highest = 0;
for (const intake of CASES) {
  const result = domain.describe(intake);
  assert.equal(result.domain, 'hellscape-harvester-covenant-readiness-domain', intake.label);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, intake.label);
  assert.ok(result.covenantPressure >= 0 && result.covenantPressure <= 1, intake.label);
  assert.ok(['mulch-bloodroot-plots', 'seal-demon-audits', 'escort-harvest-wagons', 'dawn-covenant-ready'].includes(result.phase), intake.label);
  assert.ok(result.bloodrootPlots.length >= 1, intake.label);
  assert.equal(result.bloodrootPlots.length, result.ashSicklePaths.length, intake.label);
  assert.equal(result.bloodrootPlots.length, result.emberTitheBowls.length, intake.label);
  assert.equal(result.bloodrootPlots.length, result.demonAuditSeals.length, intake.label);
  assert.equal(result.bloodrootPlots.length, result.covenantWagonWheels.length, intake.label);
  assert.equal(result.dawnCovenantLedgers.length, 1, intake.label);
  assert.equal(result.rendererHandoff.policy, 'renderer-consumes-descriptors-only', intake.label);
  assert.equal(result.rendererHandoff.counts.dawnCovenantLedgers, 1, intake.label);
  assert.equal(result.rendererHandoff.counts.total, Object.values(result.rendererHandoff.descriptors).reduce((total, value) => total + value.length, 0), intake.label);
  assert.equal(result.ownership.renderer, false, intake.label);
  assert.equal(result.ownership.dom, false, intake.label);
  assert.equal(result.ownership.browserInput, false, intake.label);
  assert.doesNotThrow(() => JSON.stringify(result), intake.label);
  lowest = Math.min(lowest, result.readiness);
  highest = Math.max(highest, result.readiness);
}

assert.ok(highest > lowest, 'readiness should improve across better intake cases');
console.log(`Hellscape harvester covenant readiness kits smoke passed ${CASES.length} intake cases.`);
