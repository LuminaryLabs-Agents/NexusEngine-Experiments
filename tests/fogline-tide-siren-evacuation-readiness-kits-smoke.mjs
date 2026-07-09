import assert from "node:assert/strict";
import { createFoglineTideSirenEvacuationReadinessDomainKit } from "../experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js";

const domain = createFoglineTideSirenEvacuationReadinessDomainKit();

const cases = [
  { name: "cold causeway", input: { time: 0, level: { bounds: { minZ: -8, maxZ: 48 } }, game: { player: { z: -4 }, fogPressure: 0.2 } } },
  { name: "scanning tide marker", input: { time: 1, game: { scanActive: true, player: { z: 10 }, fogPressure: 0.35 } } },
  { name: "families mustered", input: { time: 2, game: { rescued: 3, supplies: 1, player: { z: 18 }, tidePressure: 0.42 } } },
  { name: "high tide alarm", input: { time: 3, game: { player: { z: 6 }, tidePressure: 0.88 } } },
  { name: "fuel staged", input: { time: 4, game: { supplies: 4, fuelDrums: 3, player: { z: 30 } } } },
  { name: "custom route", input: { time: 5, level: { route: [{ id: "a", x: -4, z: 1 }, { id: "b", x: 0, z: 9 }, { id: "c", x: 5, z: 18 }, { id: "d", x: 9, z: 31 }, { id: "e", x: -2, z: 43 }] }, game: { player: { z: 34 }, scanActive: true } } },
  { name: "empty route", input: { time: 6, level: { route: [] }, game: { player: { z: 42 }, supplies: 2 } } },
  { name: "inventory fuel", input: { time: 7, game: { inventory: { fuel: 6 }, player: { z: 44 }, familiesMustered: 2 } } },
  { name: "negative junk clamps", input: { time: 8, game: { player: { z: -100 }, tidePressure: -2, supplies: -1 } } },
  { name: "overflow clamps", input: { time: 9, game: { player: { z: 100 }, tidePressure: 10, supplies: 50, scanActive: true } } }
];

assert.equal(domain.id, "n-fogline-tide-siren-evacuation-readiness-domain-kit");
assert.equal(domain.tree.root, "fogline-tide-siren-evacuation-readiness-domain");
assert.equal(domain.kits.length, 7);

let coldReadiness = 0;
let warmReadiness = 0;
for (const [index, testCase] of cases.entries()) {
  const described = domain.describe(testCase.input);
  assert.ok(["warning", "muster", "launch"].includes(described.missionState), `${testCase.name} mission state`);
  assert.ok(described.readiness >= 0 && described.readiness <= 1, `${testCase.name} readiness bounded`);
  assert.ok(described.tidePressure >= 0 && described.tidePressure <= 1, `${testCase.name} tide pressure bounded`);
  assert.equal(described.tideGaugeStakes.length, 3, `${testCase.name} tide gauge count`);
  assert.equal(described.sirenBellTowers.length, 2, `${testCase.name} siren count`);
  assert.ok(described.boatRopeLanes.length >= 4, `${testCase.name} route lanes`);
  assert.equal(described.familyMusterFlags.length, 3, `${testCase.name} muster flags`);
  assert.equal(described.fuelDrumCaches.length, 2, `${testCase.name} fuel caches`);
  assert.equal(described.dawnEvacuationLedger.length, 1, `${testCase.name} ledger`);
  assert.equal(described.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(described.rendererHandoff.counts.total, described.drawOrder.length);
  assert.equal(described.rendererHandoff.counts.total, 15);
  assert.doesNotThrow(() => JSON.stringify(described), `${testCase.name} JSON safe`);
  for (const descriptor of described.drawOrder) {
    assert.ok(descriptor.id, `${testCase.name} descriptor id`);
    assert.ok(descriptor.kind, `${testCase.name} descriptor kind`);
    assert.ok(descriptor.position && Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z), `${testCase.name} finite position`);
    assert.ok(descriptor.rendererContract?.rendererMustNotOwn?.includes("browser input"), `${testCase.name} excludes browser input`);
    assert.ok(descriptor.rendererContract?.rendererMustNotOwn?.includes("Three.js runtime"), `${testCase.name} excludes Three.js`);
  }
  if (index === 0) coldReadiness = described.readiness;
  if (index === cases.length - 1) warmReadiness = described.readiness;
}

assert.ok(warmReadiness >= coldReadiness, "readiness improves when scan, progress, and supplies are strong");
console.log("Fogline tide siren evacuation readiness kits smoke passed 10 intake cases.");
