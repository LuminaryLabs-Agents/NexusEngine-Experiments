import assert from "node:assert/strict";
import { createFoglineSearchDogRescueReadinessDomainKit, FOGLINE_SEARCH_DOG_RESCUE_READINESS_DOMAIN_TREE } from "../experiments/fogline-relay/src/fogline-search-dog-rescue-readiness-kits.js";

const cases = [
  { name: "cold start", game: { player: { position: { z: -8 } }, fogPressure: 0.68 }, time: 0 },
  { name: "scan active", game: { player: { position: { z: 5 }, scan: true }, scans: 2, fogPressure: 0.52 }, time: 3 },
  { name: "scent marks", game: { player: { position: { z: 14 } }, scentMarks: 3, scanCount: 2 }, time: 8 },
  { name: "blankets cached", game: { player: { position: { z: 24 } }, blanketCaches: 4, resources: 2 }, time: 13 },
  { name: "handler focus", game: { player: { position: { z: 30 } }, focus: "handler", dogScentMarks: 2 }, time: 21 },
  { name: "escorts moving", game: { player: { position: { z: 38 } }, survivorsEscorted: 2, markedRoutes: 3 }, time: 34 },
  { name: "heavy fog", game: { player: { position: { z: 42 } }, fogPressure: 0.92, exposurePressure: 0.4, scans: 5 }, time: 55 },
  { name: "custom route", level: { route: [{ id: "a", x: -4, z: 0 }, { id: "b", x: 1, z: 10 }, { id: "c", x: 4, z: 24 }, { id: "d", x: 6, z: 42 }, { id: "e", x: 2, z: 54 }] }, game: { player: { position: { z: 46 } }, blanketCaches: 2, scentMarks: 2 }, time: 89 },
  { name: "late route", game: { player: { position: { z: 57 } }, scans: 6, scentMarks: 5, blanketCaches: 3, escorts: 2 }, time: 144 },
  { name: "ready state", game: { player: { position: { z: 62 }, scan: true }, focus: "dog", scans: 8, scentMarks: 6, blanketCaches: 5, survivorsEscorted: 3, fogPressure: 0.25 }, time: 233 }
];

const kit = createFoglineSearchDogRescueReadinessDomainKit();
assert.equal(kit.tree.root, FOGLINE_SEARCH_DOG_RESCUE_READINESS_DOMAIN_TREE.root);
assert.equal(kit.kits.length, 7);

let previousReadiness = 0;
for (const testCase of cases) {
  const result = kit.describe({ level: testCase.level, game: testCase.game, time: testCase.time });
  assert.equal(result.domain, "fogline-search-dog-rescue-readiness-domain", testCase.name);
  assert.equal(result.scentRibbonTrails.length, 4, testCase.name);
  assert.equal(result.pawprintGridMarkers.length, 6, testCase.name);
  assert.equal(result.handlerWhistlePosts.length, 3, testCase.name);
  assert.equal(result.thermalBlanketCaches.length, 3, testCase.name);
  assert.equal(result.rescueSledRoutes.length, 2, testCase.name);
  assert.equal(result.dawnHandlerLedgers.length, 1, testCase.name);
  assert.equal(result.rendererHandoff.descriptorCount, 19, testCase.name);
  assert.equal(result.drawOrder.length, result.rendererHandoff.descriptorCount, testCase.name);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, testCase.name);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, testCase.name);
  assert.ok(["handler-team-ready", "scent-grid-linked", "dogs-fogbound", "casting-search-grid"].includes(result.missionState), testCase.name);
  assert.doesNotThrow(() => JSON.stringify(result), testCase.name);
  for (const descriptor of result.drawOrder) {
    assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("DOM ownership"), descriptor.id);
    assert.ok(descriptor.rendererContract.rendererMustNotOwn.includes("WebGL runtime"), descriptor.id);
  }
  previousReadiness = Math.max(previousReadiness, result.readiness);
}

const cold = kit.describe(cases[0]);
const ready = kit.describe(cases.at(-1));
assert.ok(ready.readiness > cold.readiness, "ready intake should improve readiness");
assert.ok(previousReadiness > 0.6, "at least one intake should reach a strong rescue state");
console.log("Fogline search dog rescue readiness kits smoke passed 10 intake cases.");
