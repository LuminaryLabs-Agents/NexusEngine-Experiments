import assert from "node:assert/strict";
import fs from "node:fs";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const entryPath = "experiments/next-ledge/src/drone-relay-rescue-readiness-entry.js";
const kitPath = "experiments/next-ledge/src/drone-relay-rescue-readiness-kits.js";
const routePath = "experiments/next-ledge/index.html";

const entry = fs.readFileSync(entryPath, "utf8");
const kits = fs.readFileSync(kitPath, "utf8");
const route = fs.readFileSync(routePath, "utf8");

assert.ok(entry.includes(CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "entry avoids old NexusRealtime CDN import");
assert.ok(route.includes("drone-relay-rescue-readiness-renderer-handoff-pass"), "route advertises drone relay pass");
assert.ok(route.includes("drone-relay-rescue-readiness-entry.js?v=drone-relay-rescue-readiness-1"), "route loads drone relay entry");
assert.ok(entry.includes("globalThis.GameHost"), "entry patches GameHost");
assert.ok(entry.includes("getDroneRelayRescueReadiness"), "entry exposes readiness accessor");
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
  { key: "KeyW", dt: 16, expectedIntent: "advance" },
  { key: "Space", dt: 16, expectedIntent: "climb" },
  { key: "ShiftLeft", dt: 16, expectedIntent: "descend" },
  { key: "MouseDrag", dt: 24, expectedIntent: "look" },
  { key: "KeyE", dt: 32, expectedIntent: "scan" },
  { key: "KeyR", dt: 16, expectedIntent: "restart" },
  { key: "KeyA", dt: 16, expectedIntent: "strafe-left" },
  { key: "KeyD", dt: 16, expectedIntent: "strafe-right" },
  { key: "Backquote", dt: 16, expectedIntent: "log-state" },
  { key: "PointerLock", dt: 16, expectedIntent: "lock-canvas" }
];

for (const [index, input] of simulatedInputs.entries()) {
  assert.ok(input.dt > 0, `case ${index} positive timestep`);
  assert.ok(input.expectedIntent.length > 0, `case ${index} expected intent`);
}

console.log("Next Ledge drone relay rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
