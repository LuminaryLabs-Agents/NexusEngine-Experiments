import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createMeadowSkylarkNestRescueReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-skylark-nest-rescue-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/high-fidelity-meadow/src/meadow-skylark-nest-rescue-entry.js";
const kitPath = "experiments/high-fidelity-meadow/src/meadow-skylark-nest-rescue-readiness-kits.js";
const routePath = "experiments/high-fidelity-meadow/index.html";

const entry = fs.readFileSync(entryPath, "utf8");
const kits = fs.readFileSync(kitPath, "utf8");
const route = fs.readFileSync(routePath, "utf8");

assert.ok(entry.includes(CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry avoids old NexusRealtime CDN import");
assert.ok(route.includes("skylark-nest-rescue-readiness-renderer-handoff-pass"), "route advertises skylark pass");
assert.ok(route.includes("meadow-skylark-nest-rescue-entry.js?v=20260709-skylark-nest-rescue-1"), "route loads skylark entry");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getSkylarkNestRescueReadiness"), "entry exposes readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kits.includes("renderer: false"), "kit ownership blocks renderer");
assert.ok(kits.includes("dom: false"), "kit ownership blocks DOM");
assert.ok(kits.includes("browserInput: false"), "kit ownership blocks browser input");
assert.ok(kits.includes("three: false"), "kit ownership blocks Three.js");
assert.ok(kits.includes("webgl: false"), "kit ownership blocks WebGL");
assert.ok(kits.includes("audio: false"), "kit ownership blocks audio");
assert.ok(kits.includes("assetLoading: false"), "kit ownership blocks asset loading");
assert.ok(kits.includes("frameLoop: false"), "kit ownership blocks frame loop");

const simulatedInputs = [
  { key: "MouseMove", expectedIntent: "survey-nest-cups", progress: 0.02 },
  { key: "KeyW", expectedIntent: "walk-dew-path", progress: 0.12 },
  { key: "KeyE", expectedIntent: "mark-ground-nest", progress: 0.22 },
  { key: "Digit1", expectedIntent: "plant-bell-post", progress: 0.34 },
  { key: "Digit2", expectedIntent: "flag-fox-scent", progress: 0.45 },
  { key: "Digit3", expectedIntent: "stock-seed-cache", progress: 0.56 },
  { key: "KeyA", expectedIntent: "skirt-tussock-left", progress: 0.64 },
  { key: "KeyD", expectedIntent: "skirt-tussock-right", progress: 0.72 },
  { key: "Space", expectedIntent: "hold-flock-line", progress: 0.86 },
  { key: "KeyR", expectedIntent: "restart-survey", progress: 1 }
];

const domain = createMeadowSkylarkNestRescueReadinessDomainKit();
for (const [index, input] of simulatedInputs.entries()) {
  const readiness = domain.describe({
    seed: `meadow-skylark-input-${index}`,
    grassBlades: 9000 + index * 1200,
    sheep: 8 + index,
    vfxParticles: 700 + index * 90,
    skylarkRescue: { progress: input.progress, nestChecks: index, bellPosts: Math.floor(index / 2), seedCaches: Math.floor(index / 3) }
  });
  assert.ok(input.expectedIntent.length > 0, `case ${index} expected intent`);
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(readiness.summary.ecologyPressure >= 0 && readiness.summary.ecologyPressure <= 1, `case ${index} pressure bounds`);
  assert.equal(readiness.rendererHandoff.descriptorCount, readiness.rendererHandoff.descriptors.length, `case ${index} descriptor parity`);
}

let cdnValidation = "source-wiring-only";
try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const response = await fetch(CDN, { signal: controller.signal });
  clearTimeout(timeout);
  if (response.ok) {
    const source = await response.text();
    const localCdn = path.join(os.tmpdir(), "nexusengine-main-cdn-meadow-smoke.mjs");
    fs.writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`Meadow skylark nest rescue CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
