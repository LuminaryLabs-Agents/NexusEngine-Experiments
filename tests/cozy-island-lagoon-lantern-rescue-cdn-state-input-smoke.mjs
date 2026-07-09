import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCozyIslandLagoonLanternRescueReadinessDomainKit } from "../experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js";

const route = readFileSync("experiments/cozy-island/index.html", "utf8");
const entry = readFileSync("experiments/cozy-island/cozy-island-lagoon-lantern-rescue-entry.js", "utf8");
const kitSource = readFileSync("experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js", "utf8");
const routedKitSmoke = readFileSync("tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs", "utf8");
const routedCdnSmoke = readFileSync("tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const cases = [
  { seed: "state-01", tide: 0.36, moon: 0.86, fog: 0.12, rain: 0.08, hunger: 0.28, rescuedGuests: 3, volunteerCoverage: 0.72, waterClarity: 0.88, wind: { x: 0.24, z: 0.2 } },
  { seed: "state-02", tide: 0.44, moon: 0.32, fog: 0.9, rain: 0.18, hunger: 0.36, rescuedGuests: 4, volunteerCoverage: 0.6, waterClarity: 0.55, wind: { x: 0.16, z: 0.12 } },
  { seed: "state-03", tide: 0.4, moon: 0.08, fog: 0.46, rain: 0.22, hunger: 0.42, rescuedGuests: 5, volunteerCoverage: 0.48, waterClarity: 0.62, wind: { x: 0.1, z: 0.22 } },
  { seed: "state-04", tide: 0.58, moon: 0.44, fog: 0.38, rain: 0.86, hunger: 0.36, rescuedGuests: 6, volunteerCoverage: 0.52, waterClarity: 0.58, wind: { x: 0.38, z: 0.32 } },
  { seed: "state-05", tide: 0.3, moon: 0.62, fog: 0.22, rain: 0.18, hunger: 0.92, rescuedGuests: 2, volunteerCoverage: 0.58, waterClarity: 0.8, wind: { x: 0.2, z: 0.18 } },
  { seed: "state-06", tide: 0.48, moon: 0.5, fog: 0.34, rain: 0.26, hunger: 0.48, rescuedGuests: 4, volunteerCoverage: 0.16, waterClarity: 0.64, wind: { x: 0.18, z: 0.18 } },
  { seed: "state-07", tide: 0.42, moon: 0.7, fog: 0.18, rain: 0.12, hunger: 0.32, rescuedGuests: 5, volunteerCoverage: 0.66, waterClarity: 0.72, wind: { x: 0.42, z: 0.32 } },
  { seed: "state-08", tide: 0.52, moon: 0.6, fog: 0.5, rain: 0.34, hunger: 0.52, rescuedGuests: 3, volunteerCoverage: 0.44, waterClarity: 0.12, wind: { x: 0.12, z: 0.12 } },
  { seed: "state-09", tide: 0.92, moon: 0.64, fog: 0.28, rain: 0.28, hunger: 0.4, rescuedGuests: 7, volunteerCoverage: 0.7, waterClarity: 0.68, wind: { x: 0.24, z: 0.22 } },
  { seed: "state-10", tide: 0.44, moon: 0.55, fog: 0.26, rain: 0.22, hunger: 0.35, rescuedGuests: 3, volunteerCoverage: 0.52, waterClarity: 0.62, wind: { x: 0.14, z: -0.2 } }
];

assert.ok(route.includes("lagoon-lantern-rescue-readiness-renderer-handoff-pass"), "route declares lagoon lantern rescue pass marker");
assert.ok(route.includes("cozy-island-lagoon-lantern-rescue-entry.js?v=lagoon-lantern-rescue-readiness-1"), "route loads cache-busted lagoon lantern rescue entry");
assert.ok(entry.includes(nexusEngineCdn), "changed entry imports NexusEngine main CDN");
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "changed entry does not import old NexusRealtime runtime CDN");
assert.equal(kitSource.includes("LuminaryLabs-Dev/NexusRealtime@main"), false, "kit does not import old NexusRealtime runtime CDN");
assert.ok(entry.includes("getCozyIslandLagoonLanternRescueReadiness"), "GameHost exposes namespaced lagoon rescue accessor");
assert.ok(entry.includes("getLagoonLanternRescueReadiness"), "GameHost exposes generic lagoon rescue accessor");
assert.ok(entry.includes("lagoonLanternRescueReadiness"), "entry composes renderer handoff");
assert.ok(routedKitSmoke.includes("cozy-island-lagoon-lantern-rescue-readiness-kits-smoke.mjs"), "parent kit smoke imports lagoon lantern kit smoke");
assert.ok(routedCdnSmoke.includes("cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs"), "parent CDN smoke imports lagoon lantern CDN smoke");

const domain = createCozyIslandLagoonLanternRescueReadinessDomainKit();
for (const input of cases) {
  const readiness = domain.evaluate(input);
  assert.ok(readiness.rendererHandoff.counts.total >= 18, `${input.seed}: enough lagoon descriptors for overlay variability`);
  assert.ok(readiness.lanternBuoyChains.every((item) => item.kind === "cozy-island.lantern-buoy-chain"), `${input.seed}: lantern kinds stable`);
  assert.ok(readiness.fireflyJarWaypoints.every((item) => item.kind === "cozy-island.firefly-jar-waypoint"), `${input.seed}: firefly kinds stable`);
  assert.ok(readiness.rainTarpAnchors.every((item) => item.kind === "cozy-island.rain-tarp-anchor"), `${input.seed}: tarp kinds stable`);
  assert.ok(readiness.wovenFishTraps.every((item) => item.kind === "cozy-island.woven-fish-trap"), `${input.seed}: trap kinds stable`);
  assert.ok(readiness.signalKiteSpools.every((item) => item.kind === "cozy-island.signal-kite-spool"), `${input.seed}: kite kinds stable`);
  assert.ok(readiness.outriggerPickupWindows.every((item) => item.kind === "cozy-island.outrigger-pickup-window"), `${input.seed}: pickup kinds stable`);
}

console.log(`cozy island lagoon lantern rescue CDN/state-input smoke passed ${cases.length} intake cases`);
