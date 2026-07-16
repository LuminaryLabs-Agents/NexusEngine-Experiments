import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routeShell = readFileSync("experiments/next-ledge/index.html", "utf8");
const mainSource = readFileSync("experiments/next-ledge/src/main.js", "utf8");
const wrapperSource = readFileSync("experiments/next-ledge/src/session-cargo-extraction-upgrade.js", "utf8");
const loopSource = readFileSync("experiments/next-ledge/src/runtime-loop.js", "utf8");
const effectsSource = readFileSync("experiments/next-ledge/src/diegetic-effects.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/traversal-readability-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.match(routeShell, /anchor-timing-readability-renderer-handoff-pass|traversal-readability-renderer-handoff-pass/, "route shell should identify the active Next Ledge readability cutover");
assert.match(routeShell, /main\.js\?v=post-stormlock-payoff-1/, "route shell should cache-bust the playable upgrade module");
assert.match(mainSource, /session-cargo-extraction-upgrade\.js/, "browser entry should still use the NexusEngine cargo/traversal wrapper");
assert.ok(wrapperSource.includes(nexusEngineCdn), "changed wrapper should pull NexusEngine main through the CDN");
assert.doesNotMatch(wrapperSource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "changed wrapper must not import the old NexusRealtime runtime CDN");
assert.match(wrapperSource, /createNextLedgeTraversalReadabilityDomainKit/, "wrapper should install the traversal readability domain kit");
assert.match(wrapperSource, /traversalReadabilityDomain\.describe\(snapshot, cargoSnapshot\)/, "wrapper should derive traversal descriptors from state/cargo input");
assert.match(wrapperSource, /traversalReadabilityDescriptors/, "visual quality report should count traversal descriptors");
assert.match(loopSource, /getTraversalReadability/, "GameHost should expose traversal readability state");
assert.match(loopSource, /getRendererHandoff/, "GameHost should expose the composed renderer handoff");
assert.match(loopSource, /routeCargoVisual\?\.rendererHandoff/, "composed handoff should preserve route-cargo descriptors");
assert.match(loopSource, /traversalReadability\?\.rendererHandoff/, "composed handoff should include traversal descriptors");
assert.match(effectsSource, /traversalReadability\?\.rendererHandoff\?\.descriptors/, "diegetic effects should consume traversal handoff descriptors");
assert.match(effectsSource, /createTraversalReadabilityLayer/, "diegetic renderer should create traversal descriptor layers");

for (const required of [
  "swing-arc-forecast-kit",
  "anchor-confidence-field-kit",
  "stamina-risk-band-kit",
  "recovery-vector-kit",
  "momentum-window-kit",
  "summit-route-beat-kit",
  "traversal-readability-renderer-handoff-kit",
  "next-ledge-traversal-readability-domain-kit"
]) {
  assert.ok(wrapperSource.includes(required) || kitSource.includes(required), `traversal readability surface should include ${required}`);
}

const intakeCases = [
  { name: "initial snapshot", expected: /traversalReadabilityDomain = createNextLedgeTraversalReadabilityDomainKit/ },
  { name: "tick update", expected: /const next = base\.update\(dt, input\)/ },
  { name: "restart", expected: /resetCargo\(next, "next-ledge-restart"\)/ },
  { name: "sector advance", expected: /resetCargo\(next, "next-ledge-sector-advance"\)/ },
  { name: "arc descriptors", expected: /swingArcs/ },
  { name: "anchor confidence", expected: /anchorConfidenceFields/ },
  { name: "stamina risk", expected: /staminaRiskBands/ },
  { name: "recovery vectors", expected: /recoveryVectors/ },
  { name: "momentum windows", expected: /momentumWindows/ },
  { name: "summit route beats", expected: /summitRouteBeats/ }
];

for (const testCase of intakeCases) {
  assert.match(`${wrapperSource}\n${kitSource}`, testCase.expected, `${testCase.name} should be covered by traversal readability state/input validation`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "traversal readability kits must remain renderer-neutral");

console.log("Next Ledge traversal readability CDN/state/input smoke passed.");
