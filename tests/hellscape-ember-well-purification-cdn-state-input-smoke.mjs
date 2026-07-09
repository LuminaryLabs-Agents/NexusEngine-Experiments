import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHellscapeEmberWellPurificationReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-domain-kit.js';

const CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const [html, entry, kits] = await Promise.all([
  readFile(new URL('../games/rogue-lite-hellscape-siege/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-entry.js', import.meta.url), 'utf8'),
  readFile(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-domain-kit.js', import.meta.url), 'utf8')
]);

assert.ok(html.includes('ember-well-purification-readiness-renderer-handoff-pass'), 'route advertises ember well pass');
assert.ok(html.includes('hellscape-ember-well-purification-readiness-entry.js'), 'route loads ember well entry');
assert.ok(entry.includes(CDN), 'changed entry imports NexusEngine main CDN');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry does not import old NexusRealtime runtime CDN');
assert.ok(entry.includes('getHellscapeEmberWellPurificationReadiness'), 'GameHost exposes hellscape accessor');
assert.ok(entry.includes('getRendererHandoff'), 'GameHost renderer handoff remains inspectable');
for (const forbidden of ['new THREE', 'WebGLRenderer', 'document.createElement', 'addEventListener', 'requestAnimationFrame']) {
  assert.ok(!kits.includes(forbidden), `reusable kit avoids ${forbidden}`);
}

const domain = createHellscapeEmberWellPurificationReadinessDomainKit();
const simulatedInputs = [
  { inventory: {}, wave: { index: 1 }, corruption: 0.72, heat: 0.62, enemies: 10 },
  { inventory: { ash: 2 }, wave: { index: 2 }, corruption: 0.66, heat: 0.58, enemies: 9 },
  { inventory: { ash: 4, brimstone: 1 }, wave: { index: 3 }, corruption: 0.6, heat: 0.5, enemies: 8 },
  { inventory: { ash: 5, brimstone: 2, runes: 1 }, wave: { index: 4 }, corruption: 0.52, heat: 0.45, enemies: 7 },
  { inventory: { ash: 6, brimstone: 3, runes: 2, herbs: 2 }, wave: { index: 5 }, corruption: 0.44, heat: 0.4, enemies: 6 },
  { inventory: { ash: 7, brimstone: 3, runes: 3, herbs: 3 }, wave: { index: 6 }, corruption: 0.38, heat: 0.36, enemies: 5 },
  { inventory: { ash: 8, brimstone: 4, runes: 4, herbs: 4 }, wave: { index: 7 }, corruption: 0.32, heat: 0.32, enemies: 4 },
  { inventory: { ash: 9, brimstone: 5, runes: 5, herbs: 5, crystal: 1 }, wave: { index: 8 }, corruption: 0.26, heat: 0.28, enemies: 3 },
  { inventory: { ash: 10, brimstone: 6, runes: 6, herbs: 6, crystal: 2 }, wave: { index: 9 }, corruption: 0.2, heat: 0.24, enemies: 2 },
  { inventory: { ash: 12, brimstone: 8, runes: 8, herbs: 8, crystal: 3 }, wave: { index: 10 }, corruption: 0.14, heat: 0.2, enemies: 1 }
];

const results = simulatedInputs.map((input) => domain.describe(input));
assert.equal(results.length, 10, 'ten simulated state/input cases');
assert.ok(results.every((result) => result.rendererHandoff.counts.total === 16), 'all simulated cases produce complete handoff counts');
assert.ok(results.at(-1).readiness > results[0].readiness, 'state/input simulation improves readiness');
assert.ok(results.every((result) => ['scan-ember-wells', 'prime-purifiers', 'carry-clean-water', 'dawn-water-secured'].includes(result.phase)), 'all simulated cases use known phase enum');

console.log('Hellscape ember well purification CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
