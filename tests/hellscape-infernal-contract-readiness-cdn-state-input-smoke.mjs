import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeInfernalContractReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-infernal-contract-readiness-domain-kit.js';

const mainPath = 'games/rogue-lite-hellscape-siege/src/main.js';
const rendererPath = 'games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js';
const indexPath = 'games/rogue-lite-hellscape-siege/index.html';
const kitPath = 'games/rogue-lite-hellscape-siege/src/hellscape-infernal-contract-readiness-domain-kit.js';
const manifestPath = 'experiments/domain-kit-cutover-manifest.json';
const runChecksPath = 'scripts/run-checks.mjs';

const mainSource = readFileSync(mainPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const indexSource = readFileSync(indexPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const manifestSource = readFileSync(manifestPath, 'utf8');
const runChecksSource = readFileSync(runChecksPath, 'utf8');

assert.ok(mainSource.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed runtime should import NexusEngine main CDN');
assert.equal(mainSource.includes('LuminaryLabs-Dev/NexusRealtime@main'), false, 'changed runtime should not import old NexusRealtime main CDN');
assert.ok(mainSource.includes('createHellscapeInfernalContractReadinessDomainKit'), 'main route should install infernal contract domain');
assert.ok(mainSource.includes('infernalContractReadiness'), 'state snapshot should expose infernal contract readiness');
assert.ok(mainSource.includes('getInfernalContractReadiness'), 'GameHost should expose infernal contract readiness');
assert.ok(mainSource.includes('getHellscapeInfernalContractReadiness'), 'GameHost should expose namespaced infernal contract readiness');
assert.ok(rendererSource.includes('drawHellscapeInfernalContract'), 'renderer should consume infernal contract descriptor handoff');
assert.ok(rendererSource.includes('state.infernalContractReadiness'), 'renderer should draw infernal contract state only from handoff output');
assert.ok(indexSource.includes('infernal-contract-readiness-renderer-handoff-pass'), 'route shell should mark the infernal contract pass');
assert.ok(indexSource.includes('infernal-contract-readiness-1'), 'route shell should cache-bust infernal contract runtime');
assert.ok(kitSource.includes('renderer consumes descriptors only'), 'kit should declare descriptor-only renderer handoff');
assert.equal(kitSource.includes('requestAnimationFrame'), false, 'kit should not own the frame loop');
assert.equal(kitSource.includes('document.'), false, 'kit should not own DOM');
assert.ok(manifestSource.includes('hellscape-infernal-contract-readiness-domain-kit'), 'manifest should register infernal contract domain kit');
assert.ok(runChecksSource.includes('hellscape-infernal-contract-readiness-domain-kits-smoke.mjs'), 'full validation should route kit smoke');
assert.ok(runChecksSource.includes('hellscape-infernal-contract-readiness-cdn-state-input-smoke.mjs'), 'full validation should route CDN/state smoke');

function stateCase(index) {
  const move = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 0.7071, y: 0.7071 }
  ][index % 5];
  return {
    time: index / 2,
    input: { move, primary: index % 2 === 0, interact: index % 3 === 0, build: index % 4 === 0, confirm: false, cycle: index % 2 ? 1 : 0, select: index % 3 },
    player: { x: move.x * 120 + index * 24, y: 180 + move.y * 90, hp: 100 - index * 4, maxHp: 100, hurt: index % 2 },
    core: { x: 0, y: -60, hp: 300 - index * 22, maxHp: 300 },
    realm: { id: ['lobby', 'grove', 'crystal', 'ashes'][index % 4], prompt: 'infernal contract state case' },
    wave: { n: index, active: index % 2 === 0, queue: Array.from({ length: index % 5 }, (_, n) => n % 2 ? 'brute' : 'crawler'), timer: 0 },
    portals: [
      { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
      { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
      { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
    ],
    resources: [{ x: index * 14, y: -index * 22, kind: 'oak', item: 'wood', color: '#22543d', hp: 80, maxHp: 90 }],
    drops: index % 2 ? [{ x: 12, y: 18, item: 'energy', color: '#38bdf8' }] : [],
    structures: [{ kind: 'turret', x: 35, y: 20, hp: 100 - index, maxHp: 100, range: 310, color: '#38bdf8' }],
    enemies: Array.from({ length: 1 + (index % 6) }, (_, n) => ({ type: n % 3 ? 'crawler' : 'brute', x: 420 - n * 44, y: -320 + n * 37, hp: n % 3 ? 42 : 120, maxHp: n % 3 ? 42 : 120, size: n % 3 ? 17 : 28 })),
    inventory: { items: { wood: 10, obsidian: index, crystal: 3 + index, energy: 2 + index, spore: 2, sulfur: 2 } },
    build: { selected: index % 3 }
  };
}

const domainKit = createHellscapeInfernalContractReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => stateCase(index));

for (const [index, state] of cases.entries()) {
  const domain = domainKit.describe(state);
  assert.equal(domain.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should have descriptor-only policy`);
  assert.equal(domain.rendererHandoff.counts.portalSealPriorities, 3, `case ${index} should expose portal seal priorities`);
  assert.equal(domain.rendererHandoff.counts.curseDebtLedgers, 4, `case ${index} should expose curse debt ledger cards`);
  assert.ok(domain.rendererHandoff.counts.relicRouteThreads >= 1, `case ${index} should expose relic route threads`);
  assert.ok(domain.rendererHandoff.counts.sacrificeRiskAuras >= 2, `case ${index} should expose sacrifice risk auras`);
  assert.ok(domain.rendererHandoff.counts.demonChampionWakes >= 1, `case ${index} should expose demon champion wakes`);
  assert.equal(domain.rendererHandoff.counts.finalPactWindows, 3, `case ${index} should expose final pact windows`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} should be serializable`);
}

console.log(`hellscape-infernal-contract-readiness-cdn-state-input-smoke: ${cases.length} state/input cases passed`);
