import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNextLedgeAvalancheBeaconRescueReadinessDomainKit } from "../experiments/next-ledge/src/avalanche-beacon-rescue-readiness-kits.js";

const CDN_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const routeHtml = readFileSync(new URL("../experiments/next-ledge/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/next-ledge/src/avalanche-beacon-rescue-readiness-entry.js", import.meta.url), "utf8");
const kits = readFileSync(new URL("../experiments/next-ledge/src/avalanche-beacon-rescue-readiness-kits.js", import.meta.url), "utf8");

assert.ok(routeHtml.includes("avalanche-beacon-rescue-readiness-renderer-handoff-pass"));
assert.ok(routeHtml.includes("avalanche-beacon-rescue-readiness-entry.js"));
assert.ok(entry.includes(CDN_URL));
assert.ok(!entry.includes("NexusRealtime@"));
assert.ok(entry.includes("getAvalancheBeaconRescueReadiness"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(!kits.includes("document."));
assert.ok(!kits.includes("window."));
assert.ok(!kits.includes("requestAnimationFrame"));
assert.ok(!kits.includes("THREE"));
assert.ok(!kits.includes("AudioContext"));

const domainKit = createNextLedgeAvalancheBeaconRescueReadinessDomainKit();

function makeState(index) {
  const ledges = Array.from({ length: 8 }, (_, ledgeIndex) => ({
    id: `ledge-${ledgeIndex}`,
    x: -180 + ledgeIndex * 62,
    y: 90 + ledgeIndex * 78,
    type: ledgeIndex === 7 ? "summit" : ledgeIndex % 3 === 0 ? "rest" : "span",
    safe: ledgeIndex % 4 === 0
  }));
  return {
    levelId: `cdn-case-${index}`,
    route: { ledges },
    currentAnchorId: `ledge-${Math.min(7, Math.floor(index / 2))}`,
    enabledTargetIds: ledges.slice(0, Math.min(8, index + 2)).map((ledge) => ledge.id),
    visitedLedgeIds: ledges.slice(0, Math.min(8, index + 1)).map((ledge) => ledge.id),
    player: { x: -175 + index * 40, y: 80 + index * 70, vx: 8 + index * 9, vy: index % 2 ? 6 : -4 },
    camera: { x: 0, y: 300, z: 260 },
    stamina: 115 - index * 7,
    constants: { maxStamina: 120 },
    weather: { storm: Math.min(0.95, 0.12 + index * 0.07) },
    rescue: { victimsReported: 2 + (index % 3), searchProgress: Math.min(1, index / 9) }
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeState(index));
let previousDescriptorCount = 0;
for (const [index, state] of cases.entries()) {
  const readiness = domainKit.describe(state);
  assert.ok(readiness.rendererHandoff.descriptorCount > 0, `case ${index} descriptor count`);
  assert.ok(readiness.rendererHandoff.descriptors.every((descriptor) => descriptor.rendererContract?.includes("renderer consumes descriptors only")), `case ${index} descriptor contract`);
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, `case ${index} readiness bounds`);
  previousDescriptorCount = readiness.rendererHandoff.descriptorCount;
}
assert.ok(previousDescriptorCount > 0);

console.log("Next Ledge avalanche beacon rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
