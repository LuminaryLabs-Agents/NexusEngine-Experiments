import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFoglineFieldClinicReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-field-clinic-kits.js";

const root = process.cwd();
const indexSource = await readFile(join(root, "experiments/fogline-relay/index.html"), "utf8");
const entrySource = await readFile(join(root, "experiments/fogline-relay/src/field-clinic-readiness-entry.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/fogline-relay/src/fogline-field-clinic-kits.js"), "utf8");
const parentSmokeSource = await readFile(join(root, "tests/fogline-relay-playwright-state-input-smoke.mjs"), "utf8");

assert.ok(indexSource.includes("field-clinic-readiness-renderer-handoff-pass"), "route should advertise field clinic upgrade");
assert.ok(indexSource.includes("field-clinic-readiness-entry.js?v=fogline-field-clinic-readiness-1"), "route should load cache-busted field clinic entry");
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "field clinic entry should use NexusEngine main CDN");
assert.equal(entrySource.includes("NexusRealtime@main"), false, "field clinic entry should not import old NexusRealtime runtime CDN");
assert.equal(kitSource.includes("document."), false, "domain kit should not own DOM");
assert.equal(kitSource.includes("window."), false, "domain kit should not own browser globals");
assert.equal(kitSource.includes("THREE"), false, "domain kit should not own Three.js");
assert.ok(entrySource.includes("getFoglineFieldClinicReadiness"), "entry should expose host readiness accessor");
assert.ok(entrySource.includes("getFieldClinicReadinessTree"), "entry should expose domain tree accessor");
assert.ok(parentSmokeSource.includes("fogline-field-clinic-readiness-kits-smoke.mjs"), "parent smoke should import kit smoke");
assert.ok(parentSmokeSource.includes("fogline-field-clinic-cdn-state-input-smoke.mjs"), "parent smoke should import CDN smoke");

const level = {
  spawn: { x: 0, z: -4 },
  gate: { x: 0, z: 44 },
  route: [
    { x: 0, z: -4 },
    { x: 4, z: 4 },
    { x: -4, z: 14 },
    { x: 4, z: 26 },
    { x: 0, z: 44 }
  ],
  relays: [
    { id: "a", x: 4, z: 5, scanProgress: 0.1 },
    { id: "b", x: -5, z: 21, scanProgress: 0.6 },
    { id: "c", x: 2, z: 34, scanned: true }
  ],
  wraiths: [{ id: "w", x: 8, z: 18, mode: "wander" }]
};

const stateCases = [
  { name: "first scan", game: { player: { x: 0, z: -2 }, relays: level.relays, stats: { elapsed: 15, timeBudget: 420, scanBursts: 1, scanned: 0 } } },
  { name: "middle fog", game: { player: { x: 2, z: 16 }, relays: level.relays, stats: { elapsed: 110, timeBudget: 420, scanBursts: 2, scanned: 1 } } },
  { name: "late emergency", game: { player: { x: -2, z: 32 }, relays: level.relays.map((relay) => ({ ...relay, scanProgress: 0 })), wraiths: [{ id: "w", x: -1, z: 29, mode: "chase" }], stats: { elapsed: 390, timeBudget: 420, scanBursts: 8, scanned: 0 } } },
  { name: "complete route", game: { player: { x: 0, z: 43 }, relays: level.relays.map((relay) => ({ ...relay, scanned: true })), stats: { elapsed: 170, timeBudget: 420, scanBursts: 3, scanned: 3 } } },
  { name: "no relays", game: { player: { x: 1, z: 10 }, relays: [], stats: { elapsed: 70, timeBudget: 420, scanBursts: 0, scanned: 0 } } },
  { name: "wide wraith pressure", game: { player: { x: 6, z: 22 }, relays: level.relays, wraiths: [{ mode: "chase", x: 3, z: 21 }, { mode: "chase", x: -2, z: 28 }], stats: { elapsed: 220, timeBudget: 420, scanBursts: 5, scanned: 1 } } },
  { name: "short budget", game: { player: { x: 0, z: 9 }, relays: level.relays, stats: { elapsed: 80, timeBudget: 90, scanBursts: 1, scanned: 1 } } },
  { name: "empty game", game: {} },
  { name: "missing stats", game: { player: { x: -1, z: 6 }, relays: level.relays } },
  { name: "minimal level fallback", level: {}, game: {} }
];

const domainKit = createFoglineFieldClinicReadinessDomainKit();

for (const stateCase of stateCases) {
  const domain = domainKit.describe({ level: stateCase.level ?? level, route: stateCase.level?.route ?? level.route, game: stateCase.game });
  const composed = {
    descriptorCount: 12 + domain.drawOrder.length,
    fieldClinicDescriptorCount: domain.drawOrder.length,
    descriptors: [{ id: "base", archetype: "base", position: { x: 0, z: 0 } }, ...domain.drawOrder],
    policy: "renderer-consumes-descriptors-only"
  };
  assert.ok(domain.drawOrder.length >= 8, `${stateCase.name} should produce descriptor variety`);
  assert.equal(composed.fieldClinicDescriptorCount, domain.drawOrder.length, `${stateCase.name} should compose count`);
  assert.ok(composed.descriptorCount > 12, `${stateCase.name} should extend base handoff`);
  assert.ok(domain.drawOrder.some((descriptor) => descriptor.archetype.includes("field.clinic")), `${stateCase.name} should use field clinic archetypes`);
  assert.ok(domain.rendererHandoff.counts.triageBeacons >= 1, `${stateCase.name} should count triage beacons`);
  assert.ok(domain.rendererHandoff.counts.ambulanceRouteSignals >= 2, `${stateCase.name} should count ambulance signals`);
}

console.log("Fogline field clinic CDN/state-input smoke passed");
