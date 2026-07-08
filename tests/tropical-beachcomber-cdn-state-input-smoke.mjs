import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const routeDir = join(root, "experiments", "tropical-island-scene");
const htmlPath = join(routeDir, "index.html");
const mainPath = join(routeDir, "src", "main.js");
const entryPath = join(routeDir, "src", "beachcomber-readability-entry.js");
const kitPath = join(routeDir, "src", "tropical-beachcomber-readability-domain-kit.js");

assert.ok(existsSync(htmlPath), "tropical island route should expose index.html");
assert.ok(existsSync(mainPath), "tropical island route should expose src/main.js");
assert.ok(existsSync(entryPath), "tropical island route should expose beachcomber readability entry");
assert.ok(existsSync(kitPath), "tropical island route should expose beachcomber readability kit");

const html = readFileSync(htmlPath, "utf8");
const main = readFileSync(mainPath, "utf8");
const entry = readFileSync(entryPath, "utf8");
const kit = readFileSync(kitPath, "utf8");

assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed readability entry should import NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed readability entry should not import old NexusRealtime runtime CDN");
assert.ok(main.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "base route should still import NexusEngine main CDN");
assert.ok(html.includes("tropical-island-beachcomber-20260708"), "route shell should cache-bust beachcomber entry");
assert.ok(entry.includes("window.GameHost"), "readability entry should patch GameHost");
assert.ok(entry.includes("getBeachcomberReadability"), "GameHost should expose beachcomber readability state");
assert.ok(entry.includes("getRendererHandoff"), "readability entry should extend renderer handoff");
assert.ok(entry.includes("renderer-consumes-descriptors-only"), "entry handoff should preserve descriptor-only renderer contract");
assert.ok(entry.includes("beachcomber-readability-overlay"), "entry should provide a presentation overlay");

for (const token of [
  "beachcomber-task-beacon-kit",
  "shoreline-path-ribbon-kit",
  "coconut-risk-shadow-kit",
  "fish-school-focus-ring-kit",
  "drift-collection-lane-kit",
  "tide-window-pulse-kit",
  "beachcomber-renderer-handoff-kit",
  "tropical-beachcomber-readability-domain-kit"
]) {
  assert.ok(kit.includes(token), `kit file should include ${token}`);
}

for (const bucket of ["taskBeacons", "shoreRoutes", "coconutRisks", "fishFocus", "driftLanes", "tideWindows", "rendererHandoff"]) {
  assert.ok(entry.includes(bucket), `entry should consume ${bucket} descriptors`);
  assert.ok(kit.includes(bucket), `kit should emit ${bucket} descriptors`);
}

const stateInputCases = [
  "requestAnimationFrame(frame)",
  "host.getState()",
  "state.camera?.angle",
  "state.coconuts",
  "state.fish",
  "state.floatProps",
  "visualFractal",
  "renderReadability(latestReadability)",
  "originalRendererHandoff",
  "NexusEngine main CDN"
];
for (const token of stateInputCases) {
  assert.ok(entry.includes(token), `entry should cover state/input token: ${token}`);
}

const forbiddenReusableOwners = ["requestAnimationFrame(", "document.querySelector", "document.createElement", "window.", "getContext(\"2d\"", "getContext(\"webgl2\"", "AudioContext", "new THREE"];
for (const forbidden of forbiddenReusableOwners) {
  assert.equal(kit.includes(forbidden), false, `reusable beachcomber kit should not own ${forbidden}`);
}

console.log("Tropical beachcomber CDN/state/input smoke passed.");
