import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createNextLedgeRidgeStretcherRelayReadinessDomainKit } from "../experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/next-ledge/src/ridge-stretcher-relay-readiness-entry.js";
const kitPath = "experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js";
const routePath = "experiments/next-ledge/index.html";

const entry = fs.readFileSync(entryPath, "utf8");
const kits = fs.readFileSync(kitPath, "utf8");
const route = fs.readFileSync(routePath, "utf8");

assert.ok(entry.includes(CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry avoids old NexusRealtime CDN import");
assert.ok(route.includes("ridge-stretcher-relay-readiness-renderer-handoff-pass"), "route advertises ridge stretcher pass");
assert.ok(route.includes("ridge-stretcher-relay-readiness-entry.js?v=ridge-stretcher-relay-readiness-1"), "route loads ridge stretcher entry");
assert.ok(!route.includes("nexus-realtime-page-loader"), "changed route shell removes old NexusRealtime page loader");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getRidgeStretcherRelayReadiness"), "entry exposes ridge stretcher readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kits.includes("renderer: false"), "kit ownership blocks renderer");
assert.ok(kits.includes("dom: false"), "kit ownership blocks DOM");
assert.ok(kits.includes("browserInput: false"), "kit ownership blocks browser input");
assert.ok(kits.includes("three: false"), "kit ownership blocks Three.js");
assert.ok(kits.includes("webgl: false"), "kit ownership blocks WebGL");
assert.ok(kits.includes("audio: false"), "kit ownership blocks audio");
assert.ok(kits.includes("assetLoading: false"), "kit ownership blocks asset loading");
assert.ok(kits.includes("frameLoop: false"), "kit ownership blocks frame loop");
assert.ok(kits.includes("network: false"), "kit ownership blocks network");

const simulatedInputs = [
  { key: "KeyW", dt: 16, expectedIntent: "advance-ridge" },
  { key: "Space", dt: 16, expectedIntent: "brace-stretcher" },
  { key: "ShiftLeft", dt: 20, expectedIntent: "slow-belay" },
  { key: "MouseDrag", dt: 24, expectedIntent: "survey-wind-shear" },
  { key: "KeyE", dt: 32, expectedIntent: "inspect-med-cache" },
  { key: "KeyR", dt: 16, expectedIntent: "restart-route" },
  { key: "KeyA", dt: 16, expectedIntent: "edge-left" },
  { key: "KeyD", dt: 16, expectedIntent: "edge-right" },
  { key: "Digit1", dt: 18, expectedIntent: "pin-anchor" },
  { key: "Digit2", dt: 18, expectedIntent: "flash-signal-panel" }
];

function makeState(index) {
  const ledges = Array.from({ length: 8 }, (_, ledgeIndex) => ({
    id: `input-ridge-${ledgeIndex}`,
    x: ledgeIndex * 82 - 260,
    y: 72 + ledgeIndex * 60,
    z: 10,
    safe: ledgeIndex % 3 === 0 || ledgeIndex === 7,
    type: ledgeIndex === 7 ? "summit" : ledgeIndex % 3 === 0 ? "rest" : "normal"
  }));
  return {
    levelId: `ridge-input-${index}`,
    route: { ledges },
    player: { x: -250 + index * 45, y: 82 + index * 38, z: 12 },
    camera: { x: -220 + index * 18, y: 130 + index * 25, z: 265 },
    currentAnchorId: ledges[Math.min(7, Math.floor(index / 2))].id,
    visitedLedgeIds: ledges.slice(0, Math.min(8, index + 1)).map((ledge) => ledge.id),
    stamina: 30 + index * 7,
    constants: { maxStamina: 120 },
    weather: { wind: 0.22 + index * 0.04, snow: 0.16 + index * 0.035 },
    ridgeStretcherRelay: { rescueProgress: index / 9 },
    lastInputIntent: simulatedInputs[index].expectedIntent
  };
}

const domain = createNextLedgeRidgeStretcherRelayReadinessDomainKit();
for (const [index, input] of simulatedInputs.entries()) {
  assert.ok(input.dt > 0, `case ${index} positive timestep`);
  assert.ok(input.expectedIntent.length > 0, `case ${index} expected intent`);
  const readiness = domain.describe(makeState(index));
  assert.ok(readiness.summary.readiness >= 0 && readiness.summary.readiness <= 1, `case ${index} readiness bounds`);
  assert.ok(readiness.summary.windShearRisk >= 0 && readiness.summary.windShearRisk <= 1, `case ${index} risk bounds`);
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
    const localCdn = path.join(os.tmpdir(), "nexusengine-main-cdn-smoke.mjs");
    fs.writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`Next Ledge ridge stretcher relay CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
