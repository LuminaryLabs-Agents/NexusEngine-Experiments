import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createTropicalMangroveNurseryReadinessDomainKit
} from "../experiments/tropical-island-scene/src/tropical-mangrove-nursery-readiness-domain-kit.js";

const root = process.cwd();
const routeDir = join(root, "experiments", "tropical-island-scene");
const htmlPath = join(routeDir, "index.html");
const entryPath = join(routeDir, "src", "mangrove-nursery-readiness-entry.js");
const kitPath = join(routeDir, "src", "tropical-mangrove-nursery-readiness-domain-kit.js");
const parentSmokePath = join(root, "tests", "tropical-lagoon-cdn-state-input-smoke.mjs");

assert.ok(existsSync(htmlPath), "tropical island route should expose index.html");
assert.ok(existsSync(entryPath), "tropical island route should expose mangrove nursery readiness entry");
assert.ok(existsSync(kitPath), "tropical island route should expose mangrove nursery readiness kit");

const html = readFileSync(htmlPath, "utf8");
const entry = readFileSync(entryPath, "utf8");
const kit = readFileSync(kitPath, "utf8");
const parentSmoke = readFileSync(parentSmokePath, "utf8");

assert.ok(html.includes("mangrove-nursery-readiness-renderer-handoff-pass"), "route should mark mangrove nursery readiness pass");
assert.ok(html.includes("mangrove-nursery-readiness-entry.js?v=tropical-island-mangrove-nursery-20260709"), "route shell should cache-bust mangrove nursery entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "changed entry should import NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime"), false, "changed entry should not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("window.GameHost"), "entry should patch GameHost");
assert.ok(entry.includes("getMangroveNurseryReadiness"), "GameHost should expose mangrove nursery readiness");
assert.ok(entry.includes("getTropicalMangroveNurseryReadiness"), "GameHost should expose tropical mangrove alias");
assert.ok(entry.includes("getRendererHandoff"), "GameHost should compose renderer handoff");
assert.ok(entry.includes("renderer-consumes-descriptors-only"), "entry should preserve renderer descriptor contract");
assert.ok(parentSmoke.includes("tropical-mangrove-nursery-readiness-kits-smoke.mjs"), "parent smoke should import new kit smoke");
assert.ok(parentSmoke.includes("tropical-mangrove-nursery-cdn-state-input-smoke.mjs"), "parent smoke should import new CDN/state smoke");

for (const token of [
  "tropical-mangrove-propagule-cluster-kit",
  "tropical-root-nursery-cradle-kit",
  "tropical-crab-burrow-guard-kit",
  "tropical-brackish-channel-ribbon-kit",
  "tropical-heron-roost-watch-kit",
  "tropical-dawn-ranger-tag-ledger-kit",
  "tropical-mangrove-nursery-renderer-handoff-kit",
  "tropical-mangrove-nursery-readiness-domain-kit"
]) {
  assert.ok(kit.includes(token), `kit file should include ${token}`);
}

const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  time: index * 7,
  orbit: index * 0.19,
  fish: Array.from({ length: index + 2 }, (_, fishIndex) => ({ id: fishIndex })),
  reefRescueReadiness: { rendererHandoff: { counts: { snorkelSearchLanes: index % 3 } } },
  tideSalvageReadiness: { rendererHandoff: { counts: { tideSurgeWindows: index % 4 } } },
  stormClinicReadiness: { rendererHandoff: { counts: { raftStretcherLanes: 2 + (index % 3) } } },
  rainwaterPurificationReadiness: { rendererHandoff: { counts: { dawnHydrationStations: 3, total: 22 } } }
}));

const domain = createTropicalMangroveNurseryReadinessDomainKit();
for (const state of stateInputCases) {
  const readiness = domain.describe(state);
  assert.equal(readiness.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.equal(readiness.rendererHandoff.counts.total, 25);
  assert.ok(readiness.rendererHandoff.descriptors.propaguleClusters.every((item) => item.kind === "tropical-mangrove-propagule-cluster"));
  assert.ok(readiness.rendererHandoff.descriptors.dawnRangerTagLedgers.every((item) => item.kind === "tropical-dawn-ranger-tag-ledger"));
  assert.doesNotThrow(() => JSON.stringify(readiness));
}

const forbiddenReusableOwners = ["requestAnimationFrame(", "document.querySelector", "canvas.addEventListener", "getContext(\"webgl2\"", "AudioContext", "new THREE"];
for (const forbidden of forbiddenReusableOwners) {
  assert.equal(kit.includes(forbidden), false, `reusable mangrove kit should not own ${forbidden}`);
}

console.log("tropical mangrove nursery CDN/state/input smoke passed: 10 intake cases");
