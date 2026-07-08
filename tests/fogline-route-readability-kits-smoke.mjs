import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_ROUTE_READABILITY_KIT_NAMES,
  createFoglineMemoryBreadcrumbKit,
  createFoglineObjectiveNeedleKit,
  createFoglinePressureVignetteKit,
  createFoglineRendererHandoffKit,
  createFoglineSafePocketKit,
  createFoglineScanConeKit,
  createFoglineVisualFractalDomainKit
} from "../experiments/fogline-relay/src/fogline-visual-fractal-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % 4;
  const progress = (caseIndex % 10) / 9;
  return {
    mode: caseIndex === 9 ? "failed" : "active",
    player: { x: -5 + caseIndex * 1.1, z: -3 + caseIndex * 4.4, yaw: caseIndex * 0.23, pitch: -0.03 },
    input: { scan: caseIndex % 2 === 0 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= level.relays.length, openProgress: scanned >= level.relays.length ? progress : scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol",
      x: wraith.x + caseIndex * 0.18,
      z: wraith.z - caseIndex * 0.11
    })),
    stats: { scanned, elapsed: caseIndex * 11, scanActive: caseIndex % 3 === 0 }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertRendererNeutral(value, label) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ["mesh", "material", "dom", "canvas", "webgl", "audio", "assetLoader", "frameLoop", "THREE"]) {
    assert.ok(!serialized.includes(`\"${forbidden}\"`), `${label} should not contain ${forbidden} ownership`);
  }
}

function assertDescriptorList(list, label) {
  assert.ok(Array.isArray(list), `${label} should return an array`);
  assert.ok(list.length > 0, `${label} should produce at least one descriptor`);
  for (const descriptor of list) {
    assert.ok(descriptor.id, `${label} descriptor should have an id`);
    assert.ok(descriptor.archetype, `${label} descriptor should have an archetype`);
    assert.ok(descriptor.position && Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z), `${label} descriptor should expose finite x/z position`);
  }
  assertSerializable(list, label);
  assertRendererNeutral(list, label);
}

const cases = Array.from({ length: 10 }, (_, caseIndex) => ({ level, route: level.route, game: makeGame(caseIndex) }));
const scanConeKit = createFoglineScanConeKit();
const objectiveNeedleKit = createFoglineObjectiveNeedleKit();
const memoryBreadcrumbKit = createFoglineMemoryBreadcrumbKit();
const pressureVignetteKit = createFoglinePressureVignetteKit();
const safePocketKit = createFoglineSafePocketKit();
const rendererHandoffKit = createFoglineRendererHandoffKit();
const domainKit = createFoglineVisualFractalDomainKit();
let checked = 0;

for (const input of cases) {
  const scanCones = scanConeKit.describe(input);
  assertDescriptorList(scanCones, "scan cone kit");
  assert.equal(scanCones.length, 1, "scan cone kit should expose one player scan cone");
  assert.ok(scanCones[0].length >= 7 && scanCones[0].radius >= 3.4);
  checked += 1;

  const objectiveNeedles = objectiveNeedleKit.describe(input);
  assertDescriptorList(objectiveNeedles, "objective needle kit");
  assert.equal(objectiveNeedles.length, 1, "objective needle kit should expose the next route target");
  assert.ok(["relay", "gate"].includes(objectiveNeedles[0].targetKind));
  checked += 1;

  const memoryBreadcrumbs = memoryBreadcrumbKit.describe(input);
  assertDescriptorList(memoryBreadcrumbs, "memory breadcrumb kit");
  assert.equal(memoryBreadcrumbs.length, 8, "memory breadcrumb kit should keep a deterministic breadcrumb count");
  checked += 1;

  const pressureVignettes = pressureVignetteKit.describe(input);
  assertDescriptorList(pressureVignettes, "pressure vignette kit");
  assert.equal(pressureVignettes.length, 1, "pressure vignette kit should expose one player pressure shell");
  assert.ok(pressureVignettes[0].threat >= 0 && pressureVignettes[0].threat <= 1);
  checked += 1;

  const safePockets = safePocketKit.describe(input);
  assertDescriptorList(safePockets, "safe pocket kit");
  assert.ok(safePockets.every((pocket) => pocket.radius > 0));
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "visual fractal composite");
  assert.equal(composite.scanCones.length, scanCones.length);
  assert.equal(composite.objectiveNeedles.length, objectiveNeedles.length);
  assert.equal(composite.memoryBreadcrumbs.length, memoryBreadcrumbs.length);
  assert.equal(composite.pressureVignettes.length, pressureVignettes.length);
  assert.equal(composite.safePockets.length, safePockets.length);
  assert.ok(composite.rendererHandoff?.descriptorCount >= composite.drawOrder.length);
  checked += 1;

  const handoff = rendererHandoffKit.describe(composite);
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.ok(handoff.descriptorCount >= composite.drawOrder.length);
  assert.ok(handoff.ownership.renderer === "consume-only");
  assertRendererNeutral(handoff, "renderer handoff kit");
  checked += 1;
}

assert.deepEqual(FOGLINE_ROUTE_READABILITY_KIT_NAMES, [
  "fogline-scan-cone-kit",
  "fogline-objective-needle-kit",
  "fogline-memory-breadcrumb-kit",
  "fogline-pressure-vignette-kit",
  "fogline-safe-pocket-kit",
  "fogline-renderer-handoff-kit"
]);
assert.equal(checked, 70, "7 new/changed Fogline route readability surfaces should each receive 10 smoke intake cases");

console.log("Fogline route readability kits smoke passed with 70 intake cases.");
