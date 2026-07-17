import "./next-ledge-rescue-line-readiness-kits-smoke.mjs";
import "./next-ledge-rescue-line-readiness-cdn-state-input-smoke.mjs";
import "./next-ledge-summit-bivouac-readiness-kits-smoke.mjs";
import "./next-ledge-summit-bivouac-cdn-state-input-smoke.mjs";
import "./next-ledge-ravine-evacuation-readiness-kits-smoke.mjs";
import "./next-ledge-ravine-evacuation-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routeShell = readFileSync("experiments/next-ledge/index.html", "utf8");
const wrapperSource = readFileSync("experiments/next-ledge/src/session-cargo-extraction-upgrade.js", "utf8");
const loopSource = readFileSync("experiments/next-ledge/src/runtime-loop.js", "utf8");
const effectsSource = readFileSync("experiments/next-ledge/src/diegetic-effects.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/anchor-timing-readability-kits.js", "utf8");
const checksSource = readFileSync("scripts/run-checks.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.ok(wrapperSource.includes(nexusEngineCdn), "changed wrapper should import NexusEngine main through the CDN");
assert.doesNotMatch(wrapperSource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed wrapper must not import old NexusRealtime runtime CDN");
assert.match(routeShell, /rescue-line-readiness-renderer-handoff-pass/, "route shell should identify the latest rescue line readability cutover");
assert.match(routeShell, /summit-bivouac-readiness-renderer-handoff-pass/, "route shell should identify the summit bivouac readability cutover");
assert.match(routeShell, /ravine-evacuation-readiness-renderer-handoff-pass/, "route shell should identify the ravine evacuation readiness cutover");
assert.match(routeShell, /main\.js\?v=stormlock-confirmation-1/, "route shell should cache-bust the latest playable upgrade");
assert.doesNotMatch(routeShell, /readiness-entry\.js/, "clean playable route should not auto-load preserved diagnostic overlays");
assert.match(wrapperSource, /createNextLedgeAnchorTimingReadabilityDomainKit/, "wrapper should import the anchor timing domain kit");
assert.match(wrapperSource, /anchorTimingReadabilityDomain\.describe\(snapshot, cargoSnapshot, traversalReadability\)/, "wrapper should derive anchor timing descriptors from state/cargo/traversal input");
assert.match(wrapperSource, /anchorTimingReadabilityDescriptors/, "visual quality report should count anchor timing descriptors");
assert.match(loopSource, /getAnchorTimingReadability/, "GameHost should expose anchor timing readability state");
assert.match(loopSource, /anchorTimingReadability\?\.rendererHandoff/, "composed renderer handoff should include anchor timing descriptors");
assert.match(effectsSource, /anchorTimingReadability\?\.rendererHandoff\?\.descriptors/, "diegetic effects should consume anchor timing handoff descriptors");
assert.match(effectsSource, /createAnchorTimingReadabilityLayer/, "diegetic renderer should create anchor timing descriptor layers");
assert.match(checksSource, /next-ledge-anchor-timing-readability-kits-smoke\.mjs/, "full/deploy checks should include anchor timing kit smoke");
assert.match(checksSource, /next-ledge-anchor-timing-cdn-state-input-smoke\.mjs/, "full/deploy checks should include anchor timing CDN smoke");

for (const required of [
  "anchor-release-timing-dial-kit",
  "grapple-line-of-sight-strip-kit",
  "swing-energy-pocket-kit",
  "wall-bounce-warning-field-kit",
  "route-commitment-stair-kit",
  "fail-floor-proximity-wave-kit",
  "anchor-timing-renderer-handoff-kit",
  "next-ledge-anchor-timing-readability-domain-kit"
]) {
  assert.ok(wrapperSource.includes(required) || kitSource.includes(required), `anchor timing surface should include ${required}`);
}

const intakeCases = [
  { name: "initial swing", expected: /releaseTimingDials/ },
  { name: "fall recovery", expected: /failFloorProximityWaves/ },
  { name: "line of sight", expected: /grappleLineOfSightStrips/ },
  { name: "energy pockets", expected: /swingEnergyPockets/ },
  { name: "wall warning", expected: /wallBounceWarningFields/ },
  { name: "route commitment", expected: /routeCommitmentStairs/ },
  { name: "renderer handoff", expected: /anchor-timing-readability-renderer-handoff/ },
  { name: "restart state", expected: /resetCargo\(next, "next-ledge-restart"\)/ },
  { name: "sector state", expected: /resetCargo\(next, "next-ledge-sector-advance"\)/ },
  { name: "host handoff", expected: /getAnchorTimingReadability/ }
];

for (const testCase of intakeCases) {
  assert.match(`${wrapperSource}\n${loopSource}\n${effectsSource}\n${kitSource}`, testCase.expected, `anchor timing smoke should cover ${testCase.name}`);
}

console.log("next ledge anchor timing CDN/state/input smoke passed");
