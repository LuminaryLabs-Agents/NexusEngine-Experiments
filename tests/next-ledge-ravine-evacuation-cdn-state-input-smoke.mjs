import "./next-ledge-ravine-evacuation-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNextLedgeRavineEvacuationReadinessDomainKit } from "../experiments/next-ledge/src/ravine-evacuation-readiness-kits.js";

const routeShell = readFileSync("experiments/next-ledge/index.html", "utf8");
const entrySource = readFileSync("experiments/next-ledge/src/ravine-evacuation-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/ravine-evacuation-readiness-kits.js", "utf8");
const anchorTimingSmokeSource = readFileSync("tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs", "utf8");
const diagnosticsSource = readFileSync("experiments/next-ledge/src/advanced-diagnostics.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.ok(entrySource.includes(nexusEngineCdn), "ravine evacuation entry should import NexusEngine main through CDN");
assert.doesNotMatch(entrySource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed ravine evacuation entry must not import old NexusRealtime runtime CDN");
assert.match(routeShell, /ravine-evacuation-readiness-renderer-handoff-pass/, "route shell should identify ravine evacuation readiness pass");
assert.doesNotMatch(routeShell, /ravine-evacuation-readiness-entry\.js/, "clean playable route should not auto-load ravine evacuation overlay");
assert.match(routeShell, /main\.js\?v=post-rest-choice-3/, "route shell should cache-bust changed playable route load");
assert.match(diagnosticsSource, /"ravine-evacuation": "Ravine evacuation:/, "advanced disclosure should preserve ravine context");
assert.match(entrySource, /getRavineEvacuationReadiness/, "GameHost should expose ravine evacuation readiness state");
assert.match(entrySource, /getNextLedgeRavineEvacuationReadiness/, "GameHost should expose route-scoped ravine evacuation accessor");
assert.match(entrySource, /ravineEvacuationReadiness\?\.rendererHandoff/, "composed renderer handoff should include ravine evacuation descriptors");
assert.match(entrySource, /dataset\.nextLedgeRavineEvacuation/, "entry should expose a CDN/runtime marker for Playwright-style state checks");
assert.match(anchorTimingSmokeSource, /next-ledge-ravine-evacuation-readiness-kits-smoke\.mjs/, "existing routed Next Ledge check should import ravine evacuation kit smoke");
assert.match(anchorTimingSmokeSource, /next-ledge-ravine-evacuation-cdn-state-input-smoke\.mjs/, "existing routed Next Ledge check should import ravine evacuation CDN smoke");

for (const required of [
  "next-ledge-ravine-caller-beacon-kit",
  "next-ledge-cliff-stretcher-route-kit",
  "next-ledge-pulley-anchor-array-kit",
  "next-ledge-crosswind-gap-window-kit",
  "next-ledge-signal-smoke-column-kit",
  "next-ledge-valley-pickup-zone-kit",
  "next-ledge-ravine-evacuation-renderer-handoff-kit",
  "next-ledge-ravine-evacuation-readiness-domain-kit"
]) {
  assert.ok(kitSource.includes(required), `ravine evacuation surface should include ${required}`);
}

function makeSnapshot(index) {
  const ledges = Array.from({ length: 13 }, (_, ledgeIndex) => ({
    id: `ravine-state-${index}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 12 ? "Summit" : ledgeIndex % 3 === 2 ? `Rescue shelf ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 12 ? "summit" : ledgeIndex % 3 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (40 + ledgeIndex * 14),
    y: ledgeIndex * 105,
    r: 9 + ledgeIndex % 3
  }));
  const current = Math.min(index + 1, 8);
  return {
    levelId: `next-ledge-ravine-state-${index}`,
    frame: index * 31,
    mode: index % 4 === 1 ? "falling" : "swinging",
    currentAnchorId: ledges[current].id,
    lastLedgeId: ledges[current].id,
    anchorLedge: ledges[current],
    enabledTargetIds: ledges.slice(current + 1, current + 5).map((ledge) => ledge.id),
    stamina: Math.max(8, 115 - index * 9),
    constants: { maxStamina: 115, ropeLength: 52, maxCableLength: 184, failFloorDistance: 520 },
    tuning: { failFloorDistance: 520 },
    camera: { y: ledges[current].y + 72, z: 232 },
    player: { x: index % 2 ? -70 : 70, y: ledges[current].y - 40, z: 2, vx: 4 + index, vy: index % 4 === 1 ? -16 : 8 },
    route: { id: "ravine-state-route", ledges }
  };
}

const domain = createNextLedgeRavineEvacuationReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const output = domain.describe(makeSnapshot(index), {
    rescueAnchorTriages: [{ id: `ravine-triage-${index}`, reachable: true, rescueScore: 0.56, position: { x: 20, y: 200 + index * 30, z: 4 } }],
    tetherStrainPulses: [{ id: `ravine-strain-${index}`, strain: 0.18 + index * 0.06 }]
  }, {
    stormExposureBands: [{ id: `ravine-exposure-${index}`, severity: 0.2 + index * 0.05 }],
    bivouacShelterPockets: [{ shelterId: `ravine-shelter-${index}`, position: { x: -20, y: 280 + index * 40, z: 5 }, warmth: 0.55 }]
  });
  assert.ok(output.ravineCallerBeacons.length >= 1, `case ${index}: caller beacon should exist`);
  assert.ok(output.cliffStretcherRoutes.length >= 1, `case ${index}: stretcher route should exist`);
  assert.ok(output.pulleyAnchorArrays.length >= 1, `case ${index}: pulley anchors should exist`);
  assert.ok(output.crosswindGapWindows.length >= 1, `case ${index}: crosswind windows should exist`);
  assert.ok(output.signalSmokeColumns.length >= 1, `case ${index}: smoke columns should exist`);
  assert.equal(output.valleyPickupZones.length, 1, `case ${index}: pickup zone should exist`);
  assert.equal(output.summary.descriptorCount, output.rendererHandoff.descriptorCount, `case ${index}: summary and handoff counts should match`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "ravine evacuation kits must remain renderer-neutral");

console.log("Next Ledge ravine evacuation CDN/state/input smoke passed: 10 cases.");
