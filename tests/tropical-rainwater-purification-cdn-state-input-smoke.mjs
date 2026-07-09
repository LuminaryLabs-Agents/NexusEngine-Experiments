import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createTropicalRainwaterPurificationReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-rainwater-purification-readiness-domain-kit.js";

const root = process.cwd();
const routeDir = join(root, "experiments", "tropical-island-scene");
const htmlPath = join(routeDir, "index.html");
const entryPath = join(routeDir, "src", "rainwater-purification-readiness-entry.js");
const kitPath = join(routeDir, "src", "tropical-rainwater-purification-readiness-domain-kit.js");
const manifestPath = join(root, "experiments", "domain-kit-cutover-manifest.json");
const parentSmokePath = join(root, "tests", "tropical-lagoon-cdn-state-input-smoke.mjs");

assert.ok(existsSync(htmlPath), "tropical island route should expose index.html");
assert.ok(existsSync(entryPath), "tropical island route should expose rainwater purification readiness entry");
assert.ok(existsSync(kitPath), "tropical island route should expose rainwater purification readiness kit");
assert.ok(existsSync(manifestPath), "domain manifest should exist");

const html = readFileSync(htmlPath, "utf8");
const entry = readFileSync(entryPath, "utf8");
const kit = readFileSync(kitPath, "utf8");
const manifest = readFileSync(manifestPath, "utf8");
const parentSmoke = readFileSync(parentSmokePath, "utf8");

assert.ok(html.includes("rainwater-purification-readiness-renderer-handoff-pass"), "route should mark rainwater purification readiness pass");
assert.ok(html.includes("rainwater-purification-readiness-entry.js?v=tropical-island-rainwater-purification-20260709"), "route shell should cache-bust rainwater purification entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed entry should import NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed entry should not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("window.GameHost"), "entry should patch GameHost");
assert.ok(entry.includes("getRainwaterPurificationReadiness"), "GameHost should expose rainwater purification readiness");
assert.ok(entry.includes("getTropicalRainwaterPurificationReadiness"), "GameHost should expose tropical rainwater alias");
assert.ok(entry.includes("getRendererHandoff"), "GameHost should compose renderer handoff");
assert.ok(entry.includes("renderer-consumes-descriptors-only"), "entry should preserve renderer descriptor contract");
assert.ok(manifest.includes("tropical-rainwater-purification-readiness-domain-kit"), "manifest should register new rainwater kit");
assert.ok(manifest.includes("rainwater-purification-readiness-renderer-handoff-pass"), "manifest should register new rainwater status");
assert.ok(parentSmoke.includes("tropical-rainwater-purification-readiness-kits-smoke.mjs"), "parent smoke should import new kit smoke");
assert.ok(parentSmoke.includes("tropical-rainwater-purification-cdn-state-input-smoke.mjs"), "parent smoke should import new CDN/state smoke");

for (const token of [
  "tropical-roof-catchment-gutter-kit",
  "tropical-palm-leaf-channel-kit",
  "tropical-charcoal-filter-bed-kit",
  "tropical-cistern-boil-watch-kit",
  "tropical-clay-jug-ration-route-kit",
  "tropical-dawn-hydration-station-kit",
  "tropical-rainwater-purification-renderer-handoff-kit",
  "tropical-rainwater-purification-readiness-domain-kit"
]) {
  assert.ok(kit.includes(token), `kit file should include ${token}`);
}

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 8,
  orbit: index * 0.17,
  weatherShelterReadability: { rendererHandoff: { counts: { stormFronts: index % 4 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { triageBuoys: 4, cisternPurityMarkers: 3 } } },
  reefRescueReadiness: { rendererHandoff: { counts: { extractionPierBeacons: index % 5 } } }
}));

const domain = createTropicalRainwaterPurificationReadinessDomainKit();
for (const state of stateInputCases) {
  const readiness = domain.describe(state);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.total, 22);
  assert.ok(readiness.rendererHandoff.descriptors.catchmentGutters.every((item) => item.kind === "tropical-roof-catchment-gutter"));
  assert.ok(readiness.rendererHandoff.descriptors.dawnHydrationStations.every((item) => item.kind === "tropical-dawn-hydration-station"));
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

const forbiddenReusableOwners = ["requestAnimationFrame(", "document.querySelector", "canvas.addEventListener", "getContext(\"webgl2\"", "AudioContext", "new THREE"];
for (const forbidden of forbiddenReusableOwners) {
  assert.equal(kit.includes(forbidden), false, `reusable rainwater kit should not own ${forbidden}`);
}

console.log("tropical rainwater purification CDN/state/input smoke passed: 10 intake cases");
