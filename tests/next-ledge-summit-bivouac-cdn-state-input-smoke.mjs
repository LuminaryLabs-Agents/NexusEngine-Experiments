import "./next-ledge-summit-bivouac-readiness-kits-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNextLedgeSummitBivouacReadinessDomainKit } from "../experiments/next-ledge/src/summit-bivouac-readiness-kits.js";

const routeShell = readFileSync("experiments/next-ledge/index.html", "utf8");
const entrySource = readFileSync("experiments/next-ledge/src/summit-bivouac-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/summit-bivouac-readiness-kits.js", "utf8");
const checksSource = readFileSync("scripts/run-checks.mjs", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.ok(entrySource.includes(nexusEngineCdn), "summit bivouac entry should import NexusEngine main through the CDN");
assert.doesNotMatch(entrySource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed summit bivouac entry must not import old NexusRealtime runtime CDN");
assert.match(routeShell, /summit-bivouac-readiness-renderer-handoff-pass/, "route shell should identify the summit bivouac readiness pass");
assert.match(routeShell, /summit-bivouac-readiness-entry\.js\?v=summit-bivouac-readiness-1/, "route shell should cache-bust the summit bivouac entry");
assert.match(entrySource, /getSummitBivouacReadiness/, "GameHost should expose summit bivouac readiness state");
assert.match(entrySource, /getNextLedgeSummitBivouacReadiness/, "GameHost should expose route-scoped summit bivouac accessor");
assert.match(entrySource, /summitBivouacReadiness\?\.rendererHandoff/, "composed renderer handoff should include summit bivouac descriptors");
assert.match(entrySource, /dataset\.nextLedgeSummitBivouac/, "entry should expose a CDN/runtime marker for Playwright-style state checks");
assert.match(manifestSource, /next-ledge-summit-bivouac-readiness-domain-kit/, "manifest should register the summit bivouac domain kit");
assert.match(checksSource, /next-ledge-summit-bivouac-readiness-kits-smoke\.mjs/, "full/deploy checks should include summit bivouac kit smoke");
assert.match(checksSource, /next-ledge-summit-bivouac-cdn-state-input-smoke\.mjs/, "full/deploy checks should include summit bivouac CDN smoke");

for (const required of [
  "next-ledge-storm-exposure-band-kit",
  "next-ledge-bivouac-shelter-pocket-kit",
  "next-ledge-partner-belay-echo-kit",
  "next-ledge-med-cache-station-kit",
  "next-ledge-route-flag-thread-kit",
  "next-ledge-evacuation-flare-window-kit",
  "next-ledge-summit-bivouac-renderer-handoff-kit",
  "next-ledge-summit-bivouac-readiness-domain-kit"
]) {
  assert.ok(kitSource.includes(required), `summit bivouac surface should include ${required}`);
}

function makeSnapshot(index) {
  const ledges = Array.from({ length: 13 }, (_, ledgeIndex) => ({
    id: `state-${index}-ledge-${ledgeIndex}`,
    label: ledgeIndex === 12 ? "Summit" : ledgeIndex % 3 === 2 ? `Rest ${ledgeIndex}` : `Anchor ${ledgeIndex}`,
    type: ledgeIndex === 12 ? "summit" : ledgeIndex % 3 === 2 ? "rest" : "normal",
    x: (ledgeIndex % 2 ? -1 : 1) * (40 + ledgeIndex * 14),
    y: ledgeIndex * 105,
    r: 9 + ledgeIndex % 3
  }));
  const current = Math.min(index + 1, 8);
  return {
    levelId: `next-ledge-bivouac-state-${index}`,
    frame: index * 31,
    mode: index % 4 === 1 ? "falling" : "swinging",
    currentAnchorId: ledges[current].id,
    lastLedgeId: ledges[current].id,
    anchorLedge: ledges[current],
    enabledTargetIds: ledges.slice(current + 1, current + 5).map((ledge) => ledge.id),
    stamina: Math.max(8, 115 - index * 9),
    constants: { maxStamina: 115, ropeLength: 52, maxCableLength: 184, failFloorDistance: 520 },
    camera: { y: ledges[current].y + 72, z: 232 },
    player: { x: index % 2 ? -70 : 70, y: ledges[current].y - 34, z: 2, vx: 4 + index, vy: index % 4 === 1 ? -16 : 8 },
    route: { id: "state-route", ledges }
  };
}

const domain = createNextLedgeSummitBivouacReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const output = domain.describe(makeSnapshot(index), {
    rescueAnchorTriages: [{ id: `triage-${index}`, reachable: true, rescueScore: 0.55, position: { x: 20, y: 200 + index * 30, z: 4 } }],
    tetherStrainPulses: [{ id: `strain-${index}`, strain: 0.18 + index * 0.06 }]
  });
  assert.ok(output.stormExposureBands.length === 1, `case ${index}: storm band should exist`);
  assert.ok(output.bivouacShelterPockets.length >= 1, `case ${index}: shelter pocket should exist`);
  assert.ok(output.partnerBelayEchoes.length === 1, `case ${index}: belay echo should exist`);
  assert.ok(output.medCacheStations.length >= 1, `case ${index}: med cache should exist`);
  assert.ok(output.routeFlagThreads.length >= 1, `case ${index}: route flag should exist`);
  assert.ok(output.evacuationFlareWindows.length === 1, `case ${index}: flare window should exist`);
  assert.equal(output.summary.descriptorCount, output.rendererHandoff.descriptorCount, `case ${index}: summary and handoff counts should match`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "summit bivouac kits must remain renderer-neutral");

console.log("Next Ledge summit bivouac CDN/state/input smoke passed.");
