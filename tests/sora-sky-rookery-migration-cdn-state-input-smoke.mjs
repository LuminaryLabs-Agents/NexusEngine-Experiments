import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraSkyRookeryMigrationReadinessDomainKit } from "../experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js";

const html = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
const entry = readFileSync("experiments/sora-the-infinite/sora-sky-rookery-migration-entry.js", "utf8");
const kit = readFileSync("experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js", "utf8");
const parentSmoke = readFileSync("tests/sora-compatibility-cdn-state-input-smoke.mjs", "utf8");
const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(html.includes("sky-rookery-migration-readiness-renderer-handoff-pass"), "route advertises rookery migration readiness pass");
assert.ok(html.includes("sora-sky-rookery-migration-entry.js?v=sky-rookery-migration-readiness-v1"), "route loads rookery migration entry with cache marker");
assert.ok(html.includes("sora-sky-rookery-migration-style.css?v=sky-rookery-migration-readiness-v1"), "route loads rookery migration style marker");
assert.ok(entry.includes(nexusEngineCdn), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes(oldRuntimeCdn), false, "changed entry does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getSoraSkyRookeryMigrationReadiness"), "entry exposes Sora rookery readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(entry.includes("renderer consumes descriptors only"), "entry preserves renderer descriptor contract");
assert.ok(parentSmoke.includes("sora-sky-rookery-migration-readiness-kits-smoke.mjs"), "parent smoke imports kit smoke");
assert.ok(parentSmoke.includes("sora-sky-rookery-migration-cdn-state-input-smoke.mjs"), "parent smoke imports CDN/state smoke");

for (const forbidden of ["document.querySelector", "requestAnimationFrame(", "canvas.addEventListener", "getContext(\"webgl2\"", "AudioContext", "new THREE"]) {
  assert.equal(kit.includes(forbidden), false, `reusable rookery kit should not own ${forbidden}`);
}

const domain = createSoraSkyRookeryMigrationReadinessDomainKit();
const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 9,
  readiness: 0.18 + index * 0.08,
  input: { thrust: index % 2, bank: Math.sin(index), climb: Math.cos(index), pointerX: index / 9, pointerY: 1 - index / 9 },
  routePreview: { handoffPackets: { packets: [{ id: "continuity" }, { id: `packet-${index}` }] } },
  skyNegotiationReadiness: { rendererHandoff: { descriptorCounts: { thermalLadderChoices: 2 + (index % 5) } } },
  skyRescueReadiness: { rendererHandoff: { counts: { total: 14 + index } } },
  skyLighthouseReadiness: { rendererHandoff: { counts: { total: 18 + index } } }
}));

for (const [index, input] of stateInputCases.entries()) {
  const readiness = domain.describe(input);
  assert.equal(readiness.rendererHandoff.counts.total, 24, `case ${index} descriptor total`);
  assert.ok(readiness.readinessScore >= 0 && readiness.readinessScore <= 1, `case ${index} bounded readiness`);
  assert.ok(readiness.rendererHandoff.descriptors.stormGapTimingWindows.every((item) => ["open", "forming", "closed"].includes(item.status)), `case ${index} storm status enum`);
  assert.ok(readiness.rendererHandoff.descriptors.dawnBandingRosters.every((item) => Number.isFinite(item.bandingWindowMinutes)), `case ${index} roster numeric window`);
}

console.log("Sora sky rookery migration CDN/state/input smoke passed: 10 intake cases.");
