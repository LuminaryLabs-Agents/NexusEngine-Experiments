import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNextLedgeGlacierSupplyReadinessDomainKit } from "../experiments/next-ledge/src/glacier-supply-readiness-kits.js";

const CDN_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const indexHtml = readFileSync(new URL("../experiments/next-ledge/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/next-ledge/src/glacier-supply-readiness-entry.js", import.meta.url), "utf8");
const kits = readFileSync(new URL("../experiments/next-ledge/src/glacier-supply-readiness-kits.js", import.meta.url), "utf8");

assert.ok(indexHtml.includes("glacier-supply-readiness-renderer-handoff-pass"));
assert.ok(!indexHtml.includes("glacier-supply-readiness-entry.js"));
assert.ok(indexHtml.includes('<option value="glacier-supply">Glacier supply</option>'));
assert.ok(entry.includes(CDN_URL));
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main"));
assert.ok(entry.includes("getNextLedgeGlacierSupplyReadiness"));
assert.ok(entry.includes("getRendererHandoff"));
assert.ok(entry.includes("next-ledge-glacier-supply-overlay"));
assert.ok(!kits.includes("document."));
assert.ok(!kits.includes("requestAnimationFrame"));
assert.ok(!kits.includes("THREE"));

const kit = createNextLedgeGlacierSupplyReadinessDomainKit();

function stateForCase(index) {
  const ledges = [
    { id: "launch", x: -140, y: 40, z: 2, r: 18, type: "normal" },
    { id: "blue-ice", x: -70, y: 140 + index * 3, z: 4, r: 20, type: "normal" },
    { id: "warmth-one", x: 10, y: 240, z: 5, r: 22, type: "rest" },
    { id: "cornice", x: 120, y: 360 + index * 5, z: 7, r: 24, type: "normal" },
    { id: "shelter-two", x: -20, y: 500, z: 7, r: 25, type: "rest" },
    { id: "summit", x: 70, y: 660, z: 9, r: 30, type: "summit" }
  ];
  return {
    levelId: `cdn-case-${index}`,
    route: { ledges },
    player: { x: -130 + index * 16, y: 60 + index * 28, z: 4, vx: index * 5, vy: index % 2 ? 20 : -15 },
    currentAnchorId: ledges[Math.min(4, Math.floor(index / 2))].id,
    enabledTargetIds: ledges.slice(1, 5).map((ledge) => ledge.id),
    stamina: 25 + index * 9,
    constants: { maxStamina: 120 },
    mode: index === 8 ? "falling" : "alive",
    camera: { x: 0, y: 300, z: 240 },
    input: { press: index % 2 ? "aim" : "jump", hold: index % 3 === 0 ? "grapple" : "none" }
  };
}

for (let index = 0; index < 10; index += 1) {
  const output = kit.describe(stateForCase(index));
  const handoff = output.rendererHandoff;
  assert.equal(handoff.kind, "renderer-handoff");
  assert.ok(handoff.descriptorCount >= 8);
  assert.equal(handoff.counts.summitSupplyLedgers, 1);
  assert.ok(output.summary.readiness >= 0 && output.summary.readiness <= 1);
  assert.ok(handoff.descriptors.every((descriptor) => descriptor.rendererContract?.includes("renderer consumes descriptors only")));
}

console.log("Next Ledge glacier supply CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
