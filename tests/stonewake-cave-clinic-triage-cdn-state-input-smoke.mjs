import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStonewakeCaveClinicTriageReadinessDomainKit } from "../games/stonewake-depths/stonewake-cave-clinic-triage-kits.js";

const index = readFileSync(new URL("../games/stonewake-depths/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../games/stonewake-depths/stonewake-cave-clinic-triage-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../games/stonewake-depths/stonewake-cave-clinic-triage-kits.js", import.meta.url), "utf8");

assert.match(index, /cave-clinic-triage-readiness-renderer-handoff-pass/, "route advertises cave clinic pass");
assert.match(index, /stonewake-cave-clinic-triage-entry\.js/, "route loads cave clinic entry");
assert.match(entry, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/, "entry imports NexusEngine main CDN");
assert.doesNotMatch(entry, /NexusRealtime@/, "entry does not import old NexusRealtime runtime CDN");
assert.match(entry, /globalThis\.GameHost/, "entry patches GameHost surface");
assert.match(entry, /getStonewakeCaveClinicTriageReadiness/, "entry exposes readiness accessor");
assert.match(entry, /getRendererHandoff/, "entry composes renderer handoff");
assert.doesNotMatch(kitSource, /document\.|querySelector|createElement|getContext|requestAnimationFrame|addEventListener|THREE|WebGL|AudioContext/, "kit source stays renderer/browser neutral");

function makeLevel(seed) {
  return {
    bounds: { width: 3200, height: 820 },
    platforms: Array.from({ length: 14 }, (_, index) => ({
      id: `case-${seed}-platform-${index}`,
      role: index === 13 ? "route" : "stone",
      x: 100 + index * 216,
      y: 670 - ((seed + index) % 6) * 54,
      w: 130 + ((index + seed) % 4) * 24,
      h: 24
    })),
    objects: [
      { id: "player", type: "player", x: 80, y: 620, w: 24, h: 46 },
      { id: "valve", type: "valve", x: 690 + seed * 8, y: 498 },
      { id: "finish-gate", type: "finish-gate", x: 2920, y: 340 },
      { id: "weighted-trigger", type: "weighted-trigger", x: 1490, y: 540 }
    ]
  };
}

const inputSteps = [
  "start", "move-right", "jump", "carry-block", "drop-on-plate", "prime-valve", "climb-chain", "route-mark", "open-door", "extract"
];
const kit = createStonewakeCaveClinicTriageReadinessDomainKit();
const outputs = inputSteps.map((input, index) => kit.describe({
  input,
  level: makeLevel(index),
  state: {
    status: "playing",
    carry: input === "carry-block",
    camera: { x: Math.max(0, index * 178 - 100), y: 0 },
    player: { x: 90 + index * 250, y: 612 - (index % 5) * 42, w: 24, h: 46 },
    water: { level: 790 - index * 38, speed: 2.2 },
    plate: index >= 4,
    valve: Math.min(1, Math.max(0, (index - 4) / 4)),
    door: Math.min(1, Math.max(0, (index - 6) / 3))
  }
}));

for (const [index, output] of outputs.entries()) {
  assert.ok(output.rendererHandoff?.rendererConsumesDescriptorsOnly, `case ${index} renderer handoff descriptor-only`);
  assert.ok(output.rendererHandoff.counts.total >= 8, `case ${index} enough descriptors for overlay`);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `case ${index} readiness bounded`);
  assert.doesNotThrow(() => JSON.stringify(output), `case ${index} output serializes`);
}

assert.ok(outputs.at(-1).readiness >= outputs[0].readiness, "input progression should not reduce final clinic readiness");
console.log("Stonewake cave clinic triage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
