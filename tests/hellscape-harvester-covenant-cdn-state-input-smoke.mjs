import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeHarvesterCovenantReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-domain-kit.js';

const CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const entryPath = new URL('../games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-entry.js', import.meta.url);
const kitPath = new URL('../games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-domain-kit.js', import.meta.url);
const routePath = new URL('../games/rogue-lite-hellscape-siege/index.html', import.meta.url);
const entry = readFileSync(entryPath, 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const route = readFileSync(routePath, 'utf8');

assert.ok(entry.includes(CDN), 'changed entry must import NexusEngine main via CDN');
assert.ok(route.includes('harvester-covenant-readiness-renderer-handoff-pass'), 'route must advertise the new pass');
assert.ok(route.includes('hellscape-harvester-covenant-readiness-entry.js'), 'route must load the new entry');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry must not import old NexusRealtime CDN');
assert.ok(entry.includes('getHellscapeHarvesterCovenantReadiness'), 'GameHost readiness accessor must be patched');
assert.ok(entry.includes('getRendererHandoff'), 'GameHost renderer handoff must be composed');
for (const forbidden of ['document.', 'window.', 'requestAnimationFrame', 'addEventListener', 'THREE.', 'AudioContext', 'fetch(']) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit must stay clear of ${forbidden}`);
}
assert.ok(kitSource.includes('webgl: false'), 'kit must declare no WebGL ownership');

const domain = createHellscapeHarvesterCovenantReadinessDomainKit();
let state = {
  wave: { index: 1 },
  avatar: { position: { x: 0, y: 0 } },
  core: { position: { x: 120, y: 80 } },
  inventory: { ash: 1, water: 0, soul: 0, ember: 0, bloodroot: 0, crystal: 0 },
  enemies: 5,
  corruption: 0.45
};

const STEPS = [
  { input: 'harvest-ash', patch: { inventory: { ash: 3 } } },
  { input: 'collect-water', patch: { inventory: { water: 3 } } },
  { input: 'gather-bloodroot', patch: { inventory: { bloodroot: 2 } } },
  { input: 'light-ember', patch: { inventory: { ember: 3 } } },
  { input: 'collect-souls', patch: { inventory: { soul: 4 } } },
  { input: 'mine-crystal', patch: { inventory: { crystal: 3 } } },
  { input: 'raise-bone-escort', patch: { inventory: { bone: 4 } } },
  { input: 'thin-horde', patch: { enemies: 2 } },
  { input: 'lower-corruption', patch: { corruption: 0.25 } },
  { input: 'advance-wave', patch: { wave: { index: 4 } } }
];

let previousReadiness = domain.describe(state).readiness;
for (const step of STEPS) {
  state = {
    ...state,
    ...step.patch,
    inventory: { ...state.inventory, ...(step.patch.inventory ?? {}) },
    wave: { ...state.wave, ...(step.patch.wave ?? {}) }
  };
  const result = domain.describe(state);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, step.input);
  assert.ok(result.rendererHandoff.descriptors.bloodrootPlots.length >= 1, step.input);
  assert.ok(result.rendererHandoff.counts.total >= 6, step.input);
  previousReadiness = Math.max(previousReadiness, result.readiness);
}

const final = domain.describe(state);
assert.ok(final.readiness >= previousReadiness - 0.15, 'final state should not collapse after positive inputs');
console.log(`Hellscape harvester covenant CDN/state/input smoke passed ${STEPS.length} simulated cases against NexusEngine main CDN wiring.`);
