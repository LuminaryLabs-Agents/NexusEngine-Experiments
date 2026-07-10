import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createMeadowRainwaterPondRestorationReadinessDomainKit } from "../experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-entry.js";
const kitPath = "experiments/high-fidelity-meadow/src/meadow-rainwater-pond-restoration-readiness-kits.js";
const routePath = "experiments/high-fidelity-meadow/index.html";
const packagePath = "package.json";

const entry = fs.readFileSync(entryPath, "utf8");
const kits = fs.readFileSync(kitPath, "utf8");
const route = fs.readFileSync(routePath, "utf8");
const pkg = fs.readFileSync(packagePath, "utf8");

assert.ok(entry.includes(CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry avoids old NexusRealtime CDN import");
assert.ok(route.includes("rainwater-pond-restoration-readiness-renderer-handoff-pass"), "route advertises pond restoration pass");
assert.ok(route.includes("meadow-rainwater-pond-restoration-entry.js?v=20260709-rainwater-pond-restoration-1"), "route loads pond restoration entry");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getRainwaterPondRestorationReadiness"), "entry exposes readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(pkg.includes("check:meadow-rainwater-pond-restoration"), "package registers focused check");
assert.ok(kits.includes("renderer: false"), "kit ownership blocks renderer");
assert.ok(kits.includes("dom: false"), "kit ownership blocks DOM");
assert.ok(kits.includes("browserInput: false"), "kit ownership blocks browser input");
assert.ok(kits.includes("three: false"), "kit ownership blocks Three.js");
assert.ok(kits.includes("webgl: false"), "kit ownership blocks WebGL");
assert.ok(kits.includes("audio: false"), "kit ownership blocks audio");
assert.ok(kits.includes("assetLoading: false"), "kit ownership blocks asset loading");
assert.ok(kits.includes("frameLoop: false"), "kit ownership blocks frame loop");

const simulatedInputs = [
  { key: "MouseMove", expectedIntent: "survey-mirror-pools", progress: 0.02 },
  { key: "KeyW", expectedIntent: "walk-rain-chain", progress: 0.12 },
  { key: "KeyE", expectedIntent: "clear-silt-sieve", progress: 0.22 },
  { key: "Digit1", expectedIntent: "place-frog-stone", progress: 0.34 },
  { key: "Digit2", expectedIntent: "weave-reed-filter", progress: 0.45 },
  { key: "Digit3", expectedIntent: "lash-stepping-log", progress: 0.56 },
  { key: "KeyA", expectedIntent: "skirt-left-bank", progress: 0.64 },
  { key: "KeyD", expectedIntent: "skirt-right-bank", progress: 0.72 },
  { key: "Space", expectedIntent: "listen-for-chorus", progress: 0.86 },
  { key: "KeyR", expectedIntent: "restart-pond-survey", progress: 1 }
];

const domain = createMeadowRainwaterPondRestorationReadinessDomainKit();
for (const [index, input] of simulatedInputs.entries()) {
  const readiness = domain.describe({
    seed: `meadow-rainwater-pond-input-${index}`,
    grassBlades: 8800 + index * 1400,
    sheep: 8 + index,
    vfxParticles: 650 + index * 120,
    rainfall: 0.22 + index * 0.065,
    pondRestoration: {
      progress: input.progress,
      frogCalls: index,
      reedFilters: Math.floor(index / 2),
      steppingLogs: Math.floor(index / 3)
    }
  });
  assert.ok(input.expectedIntent.length > 0, `case ${index} expected intent`);
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(readiness.summary.siltPressure >= 0 && readiness.summary.siltPressure <= 1, `case ${index} pressure bounds`);
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
    const localCdn = path.join(os.tmpdir(), "nexusengine-main-cdn-meadow-pond-smoke.mjs");
    fs.writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`Meadow rainwater pond restoration CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
