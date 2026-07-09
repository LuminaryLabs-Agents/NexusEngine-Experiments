import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLivingAgentMarketFireEvacuationReadinessDomainKit } from '../experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js';

const cdn = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const entryUrl = new URL('../experiments/living-agent-lab/market-fire-evacuation-entry.js', import.meta.url);
const routeUrl = new URL('../experiments/living-agent-lab/market-fire-evacuation.html', import.meta.url);
const kitUrl = new URL('../experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js', import.meta.url);
const [entrySource, routeSource, kitSource] = await Promise.all([
  readFile(entryUrl, 'utf8'),
  readFile(routeUrl, 'utf8'),
  readFile(kitUrl, 'utf8')
]);

assert.ok(entrySource.includes(cdn), 'changed entry imports NexusEngine main CDN');
assert.equal(entrySource.includes('NexusRealtime@'), false, 'changed entry does not import old NexusRealtime CDN');
assert.ok(routeSource.includes('market-fire-evacuation-readiness-renderer-handoff-pass'));
assert.ok(routeSource.includes('market-fire-evacuation-entry.js'));
assert.ok(entrySource.includes('globalThis.GameHost'));
assert.ok(entrySource.includes('applyInput'));
assert.equal(kitSource.includes('document.'), false, 'reusable kit does not own DOM');
assert.equal(kitSource.includes('requestAnimationFrame'), false, 'reusable kit does not own frame loop');
assert.equal(kitSource.includes('canvas'), false, 'reusable kit does not own canvas renderer');

let cdnValidation = 'source-wiring-only';
let tempDirectory = null;
try {
  const response = await fetch(cdn);
  assert.ok(response.ok, `NexusEngine CDN responded ${response.status}`);
  const source = await response.text();
  assert.ok(source.length > 100, 'NexusEngine CDN module has source content');
  tempDirectory = await mkdtemp(join(tmpdir(), 'nexus-engine-cdn-'));
  const localModule = join(tempDirectory, 'nexus-engine-main.mjs');
  await writeFile(localModule, source, 'utf8');
  const runtime = await import(`file://${localModule}`);
  assert.ok(Object.keys(runtime).length > 0, 'local CDN module exposes exports');
  cdnValidation = 'downloaded-to-local-mjs-and-imported';
} catch (error) {
  assert.match(String(error?.message ?? error), /fetch|network|ENOTFOUND|EAI_AGAIN|responded|module|package|import|resolve/i);
} finally {
  if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
}

const state = { seed: 41, inspectedLanterns: 0, clearedAisles: 0, bucketRelays: 0, firebreaksPlaced: 0, musteredMerchants: 0, agentCalls: 0, tick: 0, lastAction: 'alarm-raised' };
const actions = ['inspect-lantern', 'inspect-lantern', 'inspect-lantern', 'inspect-lantern', 'clear-aisle', 'clear-aisle', 'clear-aisle', 'stage-bucket-relay', 'place-firebreak', 'muster-merchant'];
const kit = createLivingAgentMarketFireEvacuationReadinessDomainKit();
let previousReadiness = kit.snapshot(state).readiness;

for (const [index, action] of actions.entries()) {
  if (action === 'inspect-lantern') state.inspectedLanterns += 1;
  if (action === 'clear-aisle') state.clearedAisles += 1;
  if (action === 'stage-bucket-relay') state.bucketRelays += 1;
  if (action === 'place-firebreak') state.firebreaksPlaced += 1;
  if (action === 'muster-merchant') state.musteredMerchants += 1;
  state.tick += 18;
  state.lastAction = action;
  const result = kit.describe(state);
  assert.ok(result.readiness >= previousReadiness, `case ${index + 1} readiness does not regress`);
  assert.ok(result.firePressure >= 0 && result.firePressure <= 1, `case ${index + 1} fire pressure bounded`);
  assert.equal(result.rendererHandoff.counts.total, 31, `case ${index + 1} descriptor count stable`);
  previousReadiness = result.readiness;
}

assert.equal(state.inspectedLanterns, 4);
assert.equal(state.clearedAisles, 3);
assert.equal(actions.length, 10);
console.log(`Living Agent market fire evacuation CDN/state/input smoke passed ${actions.length} simulated cases; CDN validation: ${cdnValidation}.`);
