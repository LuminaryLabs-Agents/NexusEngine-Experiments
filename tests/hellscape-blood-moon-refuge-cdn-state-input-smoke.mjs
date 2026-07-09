import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeBloodMoonRefugeReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-domain-kit.js';

const indexHtml = readFileSync(new URL('../games/rogue-lite-hellscape-siege/index.html', import.meta.url), 'utf8');
const entrySource = readFileSync(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-entry.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-domain-kit.js', import.meta.url), 'utf8');
const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';

assert.ok(indexHtml.includes('blood-moon-refuge-readiness-renderer-handoff-pass'), 'route advertises blood moon refuge pass');
assert.ok(indexHtml.includes('hellscape-blood-moon-refuge-readiness-entry.js?v=blood-moon-refuge-readiness-1'), 'route loads cache-busted entry');
assert.ok(entrySource.includes(cdn), 'entry imports NexusEngine main CDN');
assert.ok(!entrySource.includes('LuminaryLabs-Dev/NexusRealtime@main'), 'changed entry avoids old NexusRealtime runtime CDN');
assert.ok(entrySource.includes('getHellscapeBloodMoonRefugeReadiness'), 'entry exposes GameHost readiness accessor');
assert.ok(entrySource.includes('getBloodMoonRefugeReadinessTree'), 'entry exposes tree accessor');
assert.ok(entrySource.includes('getRendererHandoff'), 'entry patches renderer handoff');
assert.ok(kitSource.includes('renderer consumes blood moon refuge descriptors only'), 'kit declares renderer-handoff policy');
assert.ok(!/document\.|window\.|requestAnimationFrame|addEventListener|querySelector/.test(kitSource), 'reusable kit stays outside DOM/browser/frame-loop ownership');
assert.ok(!kitSource.includes('from \'three\'') && !kitSource.includes('from "three"'), 'reusable kit does not import Three.js');

const kit = createHellscapeBloodMoonRefugeReadinessDomainKit();
const simulatedInputs = Array.from({ length: 10 }, (_, index) => ({
  avatar: { position: { x: index * 0.5, y: Math.sin(index) } },
  core: { position: { x: 0, y: 0 } },
  inventory: { herbs: 1 + index, ashHerbs: index % 3, brimstone: 1, runes: 1 + (index % 2) },
  wave: { index: index + 1 },
  rescued: index % 4,
  survivors: [
    { id: `family-${index}`, x: -1.5 + index * 0.1, y: 1.2, condition: 'panicked' },
    { id: `smith-${index}`, x: 1.4, y: -1.1, condition: index > 5 ? 'burned' : 'exhausted' }
  ],
  enemies: [
    { id: `fiend-${index}`, x: 2.4 + index * 0.12, y: 1.2, threat: 0.44 + index * 0.03 },
    { id: `hound-${index}`, x: -2.0, y: -1.7, threat: 0.38 + index * 0.02 }
  ],
  builds: [{ id: `ward-${index}`, x: 0.8, y: 0.6 }]
}));

for (const [index, input] of simulatedInputs.entries()) {
  const result = kit.describe(input);
  assert.equal(result.rendererHandoff.descriptors.refugeSigilBeacons.length, input.survivors.length, `case ${index} sigils`);
  assert.equal(result.rendererHandoff.descriptors.demonPressureFronts.length, input.enemies.length, `case ${index} pressure fronts`);
  assert.equal(result.rendererHandoff.descriptors.soulFerryRoutes.length, input.survivors.length, `case ${index} ferry routes`);
  assert.ok(Number.isFinite(result.readiness), `case ${index} finite readiness`);
  assert.ok(result.rendererHandoff.counts.total > 0, `case ${index} descriptors present`);
}

console.log('Hellscape blood moon refuge CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
