import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTinyDiffusionSampleClinicReadinessDomainKit } from "../experiments/tiny-diffusion-lab/kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js";

const route = readFileSync("experiments/tiny-diffusion-lab/index.html", "utf8");
const entry = readFileSync("experiments/tiny-diffusion-lab/app/sample-clinic-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/tiny-diffusion-lab/kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js", "utf8");

assert.ok(route.includes("sampleClinicReadiness"), "route exposes sample clinic panel");
assert.ok(route.includes("sample-clinic-readiness-entry.js?v=tiny-diffusion-sample-clinic-20260709"), "route loads cache-busted sample clinic entry");
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry pulls NexusEngine main CDN");
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed entry avoids old NexusRealtime CDN");
assert.ok(entry.includes("getTinyDiffusionSampleClinicReadiness"), "entry exposes GameHost sample clinic accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit declares descriptor-only handoff");
assert.ok(!/document\.|querySelector|addEventListener|requestAnimationFrame|canvas|getContext\(/.test(kitSource), "reusable kit does not own DOM, input, canvas, or frame loop");

const domain = createTinyDiffusionSampleClinicReadinessDomainKit();
const simulatedCases = Array.from({ length: 10 }, (_, index) => {
  const ready = index / 9;
  return {
    sampleCount: Math.round(4 + ready * 12),
    latestLoss: 0.96 - ready * 0.76,
    epochs: Math.round(ready * 14),
    steps: Math.round(ready * 112),
    frames: Math.round(ready * 8),
    finalReady: index > 2,
    saved: index > 5,
    checkpointAge: Math.max(0, 24 - index * 3),
    finalPixels: Array.from({ length: index > 2 ? 256 : 0 }, (_, pixelIndex) => Math.abs(Math.sin((pixelIndex + 1) * (index + 2.4))))
  };
});

for (const [index, input] of simulatedCases.entries()) {
  const result = domain.evaluate(input);
  assert.equal(result.rendererHandoff.descriptorCount, 6, `case ${index}`);
  assert.ok(result.descriptors.retryPrescription.actions.length >= 1, `case ${index}`);
  assert.ok(result.descriptors.artifactScanMap.artifactRisk >= 0, `case ${index}`);
}

assert.ok(domain.evaluate(simulatedCases.at(-1)).readinessScore > domain.evaluate(simulatedCases[0]).readinessScore, "input progression improves readiness");
console.log("Tiny Diffusion sample clinic CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
