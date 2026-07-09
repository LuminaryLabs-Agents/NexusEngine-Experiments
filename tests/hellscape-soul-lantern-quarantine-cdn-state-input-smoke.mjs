import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeSoulLanternQuarantineReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js';

const route = readFileSync('games/rogue-lite-hellscape-siege/index.html', 'utf8');
const entry = readFileSync('games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-entry.js', 'utf8');
const kitSource = readFileSync('games/rogue-lite-hellscape-siege/src/hellscape-soul-lantern-quarantine-readiness-domain-kit.js', 'utf8');
const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';

assert.ok(route.includes('soul-lantern-quarantine-readiness-renderer-handoff-pass'), 'route advertises pass');
assert.ok(route.includes('hellscape-soul-lantern-quarantine-readiness-entry.js'), 'route loads entry');
assert.ok(entry.includes(cdn), 'entry imports NexusEngine main CDN');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry has no old NexusRealtime CDN import');
assert.ok(entry.includes('getHellscapeSoulLanternQuarantineReadiness'), 'GameHost readiness accessor exposed');
assert.ok(entry.includes('getRendererHandoff'), 'renderer handoff composed');
assert.ok(kitSource.includes('consumes descriptors only'), 'kit declares descriptor-only handoff');
for (const forbidden of ['document.', 'window.', 'requestAnimationFrame', 'new Audio', 'THREE.', 'WebGLRenderingContext']) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit avoids ${forbidden}`);
}

const kit = createHellscapeSoulLanternQuarantineReadinessDomainKit();
const simulatedInputs = [
  { action: 'idle', patch: {} },
  { action: 'collect-soul', patch: { inventory: { souls: 2 } } },
  { action: 'harvest-bloodroot', patch: { inventory: { souls: 3, bloodroot: 3 } } },
  { action: 'light-ember', patch: { inventory: { souls: 4, bloodroot: 3, ember: 5 } } },
  { action: 'raise-ward', patch: { wards: 2, inventory: { souls: 5, bloodroot: 4, ember: 5 } } },
  { action: 'breach-opens', patch: { breaches: 2, wave: 4, coreHealth: 72, inventory: { souls: 5, bloodroot: 4, ember: 5 } } },
  { action: 'dig-trenches', patch: { structures: { trench1: {}, trench2: {} }, wards: 3, inventory: { souls: 6, bloodroot: 5, ember: 6 } } },
  { action: 'escort-survivors', patch: { survivors: 6, structures: { trench1: {}, trench2: {}, totem1: {} }, wards: 4, inventory: { souls: 8, bloodroot: 6, ember: 7 } } },
  { action: 'late-wave', patch: { wave: 8, breaches: 3, survivors: 8, coreHealth: 58, wards: 4, inventory: { souls: 10, bloodroot: 7, ember: 9 } } },
  { action: 'quarantine-lit', patch: { wave: 8, breaches: 1, survivors: 10, coreHealth: 90, wards: 6, builds: [{}, {}, {}, {}], inventory: { souls: 14, bloodroot: 10, ember: 12 } } }
];

const results = simulatedInputs.map(({ patch }) => kit.describe(patch));
for (const [index, result] of results.entries()) {
  assert.equal(result.rendererHandoff.policy.consumesDescriptorsOnly, true, `descriptor-only ${index}`);
  assert.ok(result.rendererHandoff.flatDescriptors.length >= 16, `descriptor floor ${index}`);
  assert.ok(result.readiness >= 0 && result.readiness <= 100, `readiness bounds ${index}`);
}
assert.ok(results.at(-1).readiness > results[0].readiness, 'input progression improves readiness');
console.log('Hellscape soul lantern quarantine CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
