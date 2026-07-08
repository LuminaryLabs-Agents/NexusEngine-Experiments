import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NEXT_LEDGE_ROUTE_CARGO_FRACTAL_TREE,
  createCargoCacheAnchorKit,
  createCargoRouteThreadKit,
  createExtractionPressureChannelKit,
  createExtractionSummitHandoffKit,
  createCargoStatusDescriptorKit,
  createRouteCargoRendererHandoffKit,
  createNextLedgeRouteCargoDomainKit
} from "../experiments/next-ledge/src/route-cargo-fractal-kits.js";

const forbiddenOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
const source = readFileSync("experiments/next-ledge/src/route-cargo-fractal-kits.js", "utf8");
assert.doesNotMatch(source, forbiddenOwnership, "route-cargo kits must stay renderer/browser/audio/frame-loop neutral");
assert.match(NEXT_LEDGE_ROUTE_CARGO_FRACTAL_TREE, /renderer consumes descriptors only/, "domain tree must record renderer handoff boundary");

function makeSnapshot(index, patch = {}) {
  const mode = patch.mode ?? ["swinging", "falling", "launched", "retracting", "won"][index % 5];
  const sector = patch.sector ?? index + 1;
  const ledges = Array.from({ length: 7 + index }, (_, ledgeIndex) => ({
    id: `s${sector}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 0 ? "Start" : ledgeIndex === 6 + index ? "Summit" : ledgeIndex % 3 === 0 ? `Rest ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 6 + index ? "summit" : ledgeIndex % 3 === 0 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (54 + ledgeIndex * 11),
    y: ledgeIndex * 142 + index * 17,
    r: 8 + ledgeIndex % 4
  }));
  return {
    levelId: `next-ledge-sector-${sector}`,
    sector,
    frame: index * 37,
    mode,
    completed: mode === "won",
    currentAnchorId: ledges[Math.min(index, ledges.length - 1)].id,
    stamina: patch.stamina ?? Math.max(6, 115 - index * 9),
    constants: { maxStamina: 115 },
    player: { x: 4 * index, y: 110 + index * 80, z: 1, vx: index - 3, vy: mode === "falling" ? -18 - index : 2 + index },
    route: { id: `route-${sector}`, label: `Route ${sector}`, ledges },
    recentEvents: patch.recentEvents ?? []
  };
}

function makeCargoSnapshot(index) {
  const value = index % 5;
  return {
    status: index % 4 === 0 ? "completed" : "active",
    route: { activeId: `s${index + 1}-ledge-${Math.min(index, 6)}`, completedIds: [`s${index + 1}-ledge-0`] },
    cargo: { resources: [{ id: "anchor-signal-cargo", value, max: 6 }], resourcesById: { "anchor-signal-cargo": { id: "anchor-signal-cargo", value, max: 6 } } },
    pressure: { channels: [{ id: "fall-pressure", value: index * 9, status: index > 6 ? "warning" : "active" }], channelsById: { "fall-pressure": { id: "fall-pressure", value: index * 9, status: index > 6 ? "warning" : "active" } } }
  };
}

const kits = {
  cargoCaches: createCargoCacheAnchorKit(),
  routeThreads: createCargoRouteThreadKit(),
  pressure: createExtractionPressureChannelKit(),
  summit: createExtractionSummitHandoffKit(),
  status: createCargoStatusDescriptorKit(),
  handoff: createRouteCargoRendererHandoffKit(),
  domain: createNextLedgeRouteCargoDomainKit()
};

for (let index = 0; index < 10; index += 1) {
  const snapshot = makeSnapshot(index);
  const cargoSnapshot = makeCargoSnapshot(index);
  const config = kits.domain.createConfig(snapshot);
  assert.equal(config.kitId, "next-ledge-route-cargo-extraction-kit", `case ${index}: config should target composite kit`);
  assert.equal(config.route.checkpoints.length, snapshot.route.ledges.length, `case ${index}: checkpoints should mirror ledges`);
  assert.ok(config.cargoResources[0].max >= 3, `case ${index}: cargo capacity should be useful`);
  assert.equal(config.pressureChannels[0].id, "fall-pressure", `case ${index}: pressure channel should be stable`);

  const cargoCaches = kits.cargoCaches.describe(snapshot, cargoSnapshot);
  const routeThreads = kits.routeThreads.describe(snapshot, cargoSnapshot);
  const pressureVeils = kits.pressure.describe(snapshot, cargoSnapshot);
  const summitHandoffs = kits.summit.describe(snapshot, cargoSnapshot);
  const statusReadouts = kits.status.describe(snapshot, cargoSnapshot);
  const handoff = kits.handoff.describe({ cargoCaches, routeThreads, pressureVeils, summitHandoffs, statusReadouts });
  const domain = kits.domain.describe(snapshot, cargoSnapshot);

  assert.ok(cargoCaches.length >= 2, `case ${index}: should emit cargo cache descriptors`);
  assert.ok(routeThreads.length >= 3, `case ${index}: should emit route thread descriptors`);
  assert.equal(pressureVeils.length, 1, `case ${index}: should emit one pressure veil`);
  assert.equal(summitHandoffs.length, 1, `case ${index}: should emit one summit handoff`);
  assert.equal(statusReadouts.length, 1, `case ${index}: should emit one status readout`);
  assert.equal(handoff.descriptorCount, cargoCaches.length + routeThreads.length + pressureVeils.length + summitHandoffs.length + statusReadouts.length, `case ${index}: handoff count should match child descriptors`);
  assert.equal(domain.rendererHandoff.descriptorCount, handoff.descriptorCount, `case ${index}: composite handoff count should match`);
  assert.ok(domain.rendererHandoff.descriptors.every((descriptor) => descriptor.kind && descriptor.id), `case ${index}: descriptors need stable id/kind`);
}

console.log("Next Ledge route-cargo fractal kits smoke passed.");
