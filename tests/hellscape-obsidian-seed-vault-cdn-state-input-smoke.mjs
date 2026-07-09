import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHellscapeObsidianSeedVaultReadinessDomainKit } from '../games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-domain-kit.js';

const route = readFileSync(new URL('../games/rogue-lite-hellscape-siege/index.html', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-entry.js', import.meta.url), 'utf8');
const kitSource = readFileSync(new URL('../games/rogue-lite-hellscape-siege/src/hellscape-obsidian-seed-vault-readiness-domain-kit.js', import.meta.url), 'utf8');
const domain = createHellscapeObsidianSeedVaultReadinessDomainKit();

assert.ok(route.includes('obsidian-seed-vault-readiness-renderer-handoff-pass'), 'route advertises obsidian seed vault pass');
assert.ok(route.includes('hellscape-obsidian-seed-vault-readiness-entry.js'), 'route loads obsidian seed vault entry');
assert.ok(entry.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'changed entry imports NexusEngine main CDN');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry has no old NexusRealtime CDN import');
assert.ok(entry.includes('getHellscapeObsidianSeedVaultReadiness'), 'GameHost readiness accessor exposed');
assert.ok(entry.includes('getObsidianSeedVaultReadinessTree'), 'GameHost tree accessor exposed');
assert.ok(entry.includes('getRendererHandoff'), 'GameHost handoff composition present');
for (const forbidden of ['new THREE.', 'document.querySelector("canvas")', 'addEventListener("keydown"', 'AudioContext', 'requestAnimationFrame(']) {
  assert.ok(!kitSource.includes(forbidden), `kit source avoids ${forbidden}`);
}

const states = Array.from({ length: 10 }, (_, index) => ({
  wave: { index: index + 1 },
  inventory: {
    ash: index + 1,
    crystal: Math.floor(index / 2),
    herbs: Math.floor(index / 3),
    water: Math.max(0, index - 2),
    bone: Math.floor(index / 2),
    brimstone: Math.floor(index / 3),
    seed: Math.floor(index / 4)
  },
  enemies: Math.max(1, 10 - index),
  seedSites: [
    { position: { x: -72, y: -26 }, blight: Math.max(0.12, 0.78 - index * 0.05) },
    { position: { x: 76, y: -18 }, blight: Math.max(0.1, 0.64 - index * 0.045) },
    { position: { x: 18, y: 70 }, blight: Math.max(0.08, 0.52 - index * 0.04) }
  ],
  completedFacts: index > 4 ? ['vault.seed.shelf'] : []
}));

for (const [index, state] of states.entries()) {
  const output = domain.describe(state);
  assert.equal(output.rendererHandoff.kind, 'renderer-handoff', `case ${index + 1} has renderer handoff`);
  assert.ok(output.rendererHandoff.counts.total >= 16, `case ${index + 1} descriptor count is rich`);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `case ${index + 1} readiness bounded`);
  assert.ok(output.rendererHandoff.descriptors.dawnReseedingLedgers.length === 1, `case ${index + 1} has ledger`);
}

assert.ok(domain.describe(states.at(-1)).readiness > domain.describe(states[0]).readiness, 'state/input progression improves readiness');
console.log('Hellscape obsidian seed vault CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
