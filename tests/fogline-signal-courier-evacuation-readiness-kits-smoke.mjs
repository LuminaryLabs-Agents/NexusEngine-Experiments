import assert from "node:assert/strict";
import { createFoglineSignalCourierEvacuationReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js";

const domainKit = createFoglineSignalCourierEvacuationReadinessDomainKit();
const cases = [
  { name: "cold start", game: { player: { z: -8 }, fogPressure: 0.72 }, time: 0 },
  { name: "scan lane", game: { player: { z: 2, scan: true }, scans: 1, fogPressure: 0.5 }, time: 1 },
  { name: "first note", game: { player: { z: 8 }, courierPackets: 1, deliveredNotes: 1, markedRoutes: 1 }, time: 2 },
  { name: "stretcher cache", game: { player: { z: 15 }, stretcherCaches: 2, resources: 2, scanCount: 2 }, time: 3 },
  { name: "escort underway", game: { player: { z: 22, tool: "courier" }, survivorsEscorted: 1, deliveredNotes: 2 }, time: 4 },
  { name: "fog surge", game: { player: { z: 26 }, fogPressure: 0.88, tidePressure: 0.6, courierPackets: 2 }, time: 5 },
  { name: "safehouse token", game: { player: { z: 35 }, escorts: 2, deliveredNotes: 3, markedRoutes: 3 }, time: 6 },
  { name: "nearly ready", game: { player: { z: 48, scan: true }, escorts: 3, deliveredNotes: 4, markedRoutes: 4, stretcherCaches: 3 }, time: 7 },
  { name: "route override", level: { route: [{ id: "a", x: -6, z: 0 }, { id: "b", x: 0, z: 20 }, { id: "c", x: 7, z: 44 }] }, game: { player: { z: 25 }, signalNotes: 2, scans: 2 }, time: 8 },
  { name: "complete", game: { player: { z: 58, scan: true, tool: "courier" }, escorts: 4, deliveredNotes: 5, markedRoutes: 5, stretcherCaches: 4, fogPressure: 0.24 }, time: 9 }
];

for (const testCase of cases) {
  const result = domainKit.describe(testCase);
  assert.equal(result.domain, "fogline-signal-courier-evacuation-readiness-domain", testCase.name);
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `${testCase.name}: readiness bounded`);
  assert.ok(result.pressure >= 0 && result.pressure <= 1, `${testCase.name}: pressure bounded`);
  assert.ok(["evacuation-ready", "courier-chain-lit", "fogbound", "marking-corridor"].includes(result.missionState), `${testCase.name}: phase enum`);
  assert.ok(result.semaphoreLampShutters.length >= 3, `${testCase.name}: lamps`);
  assert.ok(result.messageRibbonSpools.length >= 3, `${testCase.name}: ribbons`);
  assert.ok(result.chalkArrowMarkers.length >= 2, `${testCase.name}: arrows`);
  assert.ok(result.stretcherCaches.length >= 2, `${testCase.name}: stretchers`);
  assert.ok(result.safehouseTokens.length >= 2, `${testCase.name}: tokens`);
  assert.equal(result.dawnCourierLedgers.length, 1, `${testCase.name}: ledger`);
  assert.equal(result.rendererHandoff.policy, "renderer-consumes-descriptors-only", `${testCase.name}: handoff policy`);
  assert.equal(result.rendererHandoff.descriptorCount, result.drawOrder.length, `${testCase.name}: count`);
  assert.equal(result.rendererHandoff.ownership.dom, "excluded", `${testCase.name}: dom excluded`);
  assert.equal(result.rendererHandoff.ownership.frameLoop, "excluded", `${testCase.name}: loop excluded`);
  assert.doesNotThrow(() => JSON.stringify(result), `${testCase.name}: serializable`);
}

const cold = domainKit.describe(cases[0]);
const complete = domainKit.describe(cases[9]);
assert.ok(complete.readiness > cold.readiness, "complete case improves readiness");
assert.equal(domainKit.tree.root, "fogline-signal-courier-evacuation-readiness-domain");
assert.ok(domainKit.kits.length >= 7, "composite exposes atomic kits");
console.log("Fogline signal courier evacuation readiness kits smoke passed 10 intake cases.");
