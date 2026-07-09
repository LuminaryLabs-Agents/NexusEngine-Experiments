import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createZombieOrchardCiderMillRefugeReadinessDomainKit } from '../experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js';

const entry = readFileSync(new URL('../experiments/zombie-orchard/src/cider-mill-refuge-readiness-entry.js', import.meta.url), 'utf8');
const route = readFileSync(new URL('../experiments/zombie-orchard/index.html', import.meta.url), 'utf8');
assert.ok(entry.includes('https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js'), 'entry pulls NexusEngine main CDN');
assert.ok(!entry.includes('NexusRealtime@'), 'changed entry does not import old NexusRealtime CDN');
assert.ok(route.includes('cider-mill-refuge-readiness-renderer-handoff-pass'), 'route advertises pass marker');
assert.ok(route.includes('cider-mill-refuge-readiness-entry.js'), 'route loads entry');
assert.ok(entry.includes('getZombieOrchardCiderMillRefugeReadiness'), 'GameHost readiness accessor exposed');
assert.ok(entry.includes('getRendererHandoff'), 'renderer handoff composed');
for (const forbidden of ['new THREE', 'WebGLRenderer', 'AudioContext', 'requestAnimationFrame(', 'addEventListener(']) {
  assert.ok(!readFileSync(new URL('../experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js', import.meta.url), 'utf8').includes(forbidden), `kit should avoid ${forbidden}`);
}
const domain = createZombieOrchardCiderMillRefugeReadinessDomainKit({ seed: 'cdn-state-input' });
const inputs = Array.from({ length: 10 }, (_, index) => ({
  seed: `input-${index}`,
  round: index + 1,
  apples: index * 3,
  ciderPressed: Math.floor(index / 2),
  cellarCrates: Math.floor(index / 3) + 1,
  routeLanterns: index % 6,
  sawbuckCount: Math.floor(index / 2),
  wagonsLoaded: Math.floor(index / 4),
  families: 4 + (index % 4),
  familiesSheltered: Math.floor(index / 2),
  pressure: Math.min(0.92, 0.08 + index * 0.085)
}));
for (const input of inputs) {
  const readiness = domain.compose(input);
  assert.ok(readiness.rendererHandoff.counts.total > 0);
  assert.ok(Number.isFinite(readiness.summary.readinessScore));
  assert.equal(readiness.rendererHandoff.ownershipExclusions.includes('dom'), true);
}
console.log('Zombie Orchard cider mill refuge CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.');
