import assert from "node:assert/strict";
import {
  STONEWAKE_GLOWWORM_CARTOGRAPHY_KITS,
  STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE,
  createStonewakeGlowwormCartographyReadinessDomainKit
} from "../games/stonewake-depths/stonewake-glowworm-cartography-kits.js";

function buildLevel(index = 0) {
  const platforms = Array.from({ length: 14 }, (_, step) => ({
    id: `platform-${step}`,
    x: 110 + step * (145 + (index % 3) * 8),
    y: 610 - (step % 4) * 58 - (index % 5) * 5,
    w: 130 + (step % 4) * 18,
    h: 20,
    role: step === 0 ? "start" : step === 13 ? "exit" : "route"
  }));
  return {
    bounds: { width: 3000 + index * 34, height: 820 },
    platforms,
    objects: [
      { type: "player", x: 90, y: 540 },
      { type: "heavy-block", x: 220, y: 560 },
      { type: "weighted-trigger", x: 780 + index * 5, y: 582 },
      { type: "valve", x: 1040 + index * 18, y: 480 - (index % 2) * 30 },
      { type: "finish-gate", x: 2700 + index * 10, y: 390 - (index % 3) * 18 },
      { type: "chain", x: 420, y: 300, h: 270 },
      { type: "sensory-creature", x: 620, y: 500, patrolBounds: { x: 520, w: 400 } }
    ],
    hazards: [{ type: "rising-water", startLevel: 790 - index * 9 }]
  };
}

function buildState(index = 0) {
  return {
    time: index * 8.5,
    status: "playing",
    carry: index % 3 === 0,
    plate: index >= 4,
    valve: Math.min(1, index / 8),
    door: Math.min(1, Math.max(0, (index - 3) / 6)),
    camera: { x: Math.max(0, index * 190 - 80), y: Math.max(0, index * 18) },
    player: { x: 90 + index * 230, y: 540 - (index % 5) * 46, w: 24, h: 46, vx: 80 + index * 8, vy: index % 2 ? -40 : 20 },
    block: { x: 250 + index * 130, y: 558, w: 58, h: 54 },
    water: { level: 790 - index * 24, speed: 2.2 },
    creature: { x: 600 + index * 40, y: 512, w: 82, h: 32 }
  };
}

const domain = createStonewakeGlowwormCartographyReadinessDomainKit();

assert.equal(domain.id, "stonewake-glowworm-cartography-readiness-domain-kit");
assert.match(STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE, /glowworm-cluster-domain/);
assert.ok(STONEWAKE_GLOWWORM_CARTOGRAPHY_KITS.includes("stonewake-dawn-cartography-ledger-kit"));

const cases = Array.from({ length: 10 }, (_, index) => ({ state: buildState(index), level: buildLevel(index), time: index * 1.25 }));
const results = cases.map((intake) => domain.describe(intake));

for (const [index, result] of results.entries()) {
  assert.equal(result.domain, "stonewake-glowworm-cartography-readiness-domain");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, `case ${index} readiness should be bounded`);
  assert.ok(result.darknessRisk >= 0 && result.darknessRisk <= 1, `case ${index} darkness risk should be bounded`);
  assert.match(result.missionState, /glowworm-survey-staged|handline-route-marked|lost-route-warning|cartography-handoff-ready/);
  assert.equal(result.glowwormClusters.length, 7);
  assert.equal(result.phosphateWallCharts.length, 5);
  assert.equal(result.chalkArrowTrails.length, 8);
  assert.equal(result.ropeHandlineMarkers.length, 6);
  assert.equal(result.caveBellNodes.length, 4);
  assert.equal(result.dawnCartographyLedger.kind, "dawn-cartography-ledger");
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(result.rendererHandoff.counts.total, 31);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)));
}

assert.ok(results.at(-1).readiness >= results[0].readiness, "late-route cartography readiness should improve over cold start");
console.log("Stonewake glowworm cartography readiness kits smoke passed 10 intake cases.");
