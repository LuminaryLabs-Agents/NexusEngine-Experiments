import "./tropical-rainwater-purification-readiness-kits-smoke.mjs";
import "./tropical-rainwater-purification-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const routeDir = join(root, "experiments", "tropical-island-scene");
const htmlPath = join(routeDir, "index.html");
const mainPath = join(routeDir, "src", "main.js");
const kitPath = join(routeDir, "src", "tropical-lagoon-visual-fractal-domain-kit.js");

assert.ok(existsSync(htmlPath), "tropical island route should expose index.html");
assert.ok(existsSync(mainPath), "tropical island route should expose src/main.js");
assert.ok(existsSync(kitPath), "tropical island route should expose lagoon visual fractal kit");

const html = readFileSync(htmlPath, "utf8");
const main = readFileSync(mainPath, "utf8");
const kit = readFileSync(kitPath, "utf8");

assert.ok(main.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed runtime should import NexusEngine main CDN");
assert.equal(main.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed runtime should not import old NexusRealtime runtime CDN");
assert.ok(html.includes("tropical-island-scene-lagoon-fractal-20260708"), "route shell should cache-bust the lagoon fractal entry");
assert.ok(main.includes("window.GameHost"), "runtime should expose GameHost");
assert.ok(main.includes("getRendererHandoff"), "GameHost should expose renderer handoff");
assert.ok(main.includes("visualFractal"), "runtime should expose visualFractal state");
assert.ok(main.includes("domain: { tropicalLagoonVisualFractal: visualFractal }"), "state should expose tropical lagoon visual domain");
assert.ok(main.includes("uReefs[8]"), "shader should consume reef descriptors");
assert.ok(main.includes("uCurrents[8]"), "shader should consume current descriptors");
assert.ok(main.includes("uClouds[5]"), "shader should consume horizon cloud descriptors");
assert.ok(main.includes("uWakes[8]"), "shader should consume wake descriptors");
assert.ok(main.includes("uShelfBands[4]"), "shader should consume shelf descriptors");

for (const token of [
  "lagoon-depth-shelf-kit",
  "reef-bloom-cluster-kit",
  "current-ribbon-field-kit",
  "palm-canopy-motion-kit",
  "horizon-cloud-bank-kit",
  "wildlife-wake-trail-kit",
  "tropical-lagoon-renderer-handoff-kit",
  "tropical-lagoon-visual-fractal-domain-kit"
]) {
  assert.ok(kit.includes(token), `kit file should include ${token}`);
  assert.ok(main.includes(token) || token !== "tropical-lagoon-renderer-handoff-kit", `main should reference ${token} where route-owned`);
}

const stateInputCases = [
  "pointerdown",
  "pointermove",
  "pointerup",
  "wheel",
  "setInput?.({ dragX",
  "setInput?.({ zoom",
  "composition.tick(delta",
  "waterRuntime.tick(delta)",
  "lagoonVisualKit.describe",
  "NexusEngine main CDN"
];
for (const token of stateInputCases) {
  assert.ok(main.includes(token), `runtime should cover state/input token: ${token}`);
}

const forbiddenReusableOwners = ["requestAnimationFrame(", "document.querySelector", "canvas.addEventListener", "getContext(\"webgl2\"", "AudioContext", "new THREE"];
for (const forbidden of forbiddenReusableOwners) {
  assert.equal(kit.includes(forbidden), false, `reusable lagoon kit should not own ${forbidden}`);
}

console.log("Tropical lagoon CDN/state/input smoke passed.");
