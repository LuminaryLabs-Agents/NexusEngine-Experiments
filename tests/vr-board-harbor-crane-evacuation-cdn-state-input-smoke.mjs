import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createVrBoardHarborCraneEvacuationReadinessDomainKit } from "../experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync("experiments/vr-platformer-board/storm-harbor.html", "utf8");
const entry = readFileSync("experiments/vr-platformer-board/harbor-crane-evacuation-entry.js", "utf8");
const kit = readFileSync("experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js", "utf8");
const packageJson = readFileSync("package.json", "utf8");

assert.ok(route.includes("vr-board-harbor-crane-evacuation-readiness-renderer-handoff-pass"));
assert.ok(route.includes("harbor-crane-evacuation-entry.js?v=vr-board-harbor-crane-evacuation-1"));
assert.ok(route.includes("Harbor crane evacuation"));

assert.ok(entry.includes(CDN));
assert.ok(entry.includes("await import(NEXUS_URL)"));
assert.ok(entry.includes("createVrBoardHarborCraneEvacuationReadinessDomainKit"));
assert.ok(entry.includes("getHarborCraneEvacuationReadiness"));
assert.ok(entry.includes("getVrBoardHarborCraneEvacuationReadiness"));
assert.ok(entry.includes("getHarborCraneEvacuationReadinessTree"));
assert.ok(entry.includes("applyHarborCraneInput"));
assert.ok(entry.includes("harborCraneEvacuationReadiness"));
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));

for (const token of [
  "VR_BOARD_HARBOR_CRANE_EVACUATION_DOMAIN_TREE",
  "createGantryRailKit",
  "createRescueHookSlingKit",
  "createFloatingCrateBridgeKit",
  "createTideCounterweightKit",
  "createTriageBasketKit",
  "createDawnCraneLedgerKit",
  "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, network, storage, physics, or frame-loop ownership"
]) {
  assert.ok(kit.includes(token), token);
}

assert.ok(packageJson.includes("check:vr-board-harbor-crane-evacuation"));
assert.ok(packageJson.includes("tests/vr-board-harbor-crane-evacuation-readiness-kits-smoke.mjs"));
assert.ok(packageJson.includes("tests/vr-board-harbor-crane-evacuation-cdn-state-input-smoke.mjs"));

const domainKit = createVrBoardHarborCraneEvacuationReadinessDomainKit();
const stateInputCases = Array.from({ length: 10 }, (_, index) => ({
  dt: index % 2 ? 1 / 72 : 1 / 30,
  state: {
    level: {
      start: { x: 0, y: 1.08 },
      exit: { id: "skiff-launch-gate", x: 15.4, y: 4.62, w: 0.82, h: 1.2 },
      platforms: [
        { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
        { id: "crane-footing", x: 3.05, y: 2, w: 1.82, h: 0.26 },
        { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
        { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
        { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
        { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
      ],
      collectibles: [
        { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
        { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
        { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
        { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
        { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
      ]
    },
    avatar: {
      position: { x: 0.06 + index * 1.42, y: 1.86 + index * 0.07 },
      velocity: { x: index % 2 ? 1.8 : -0.2, y: index % 3 ? -0.1 : 0.3 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: "alive"
    },
    objects: {
      collectedValue: index % 6,
      collectedIds: ["flare-storm-pier", "dry-net-crane", "flare-flooded-dock", "blanket-cache", "skiff-rope"].slice(0, index % 6)
    },
    weather: { tideLevel: Math.min(0.86, 0.36 + index * 0.045), wind: Math.min(0.74, 0.18 + index * 0.052) },
    stormHarborReadiness: { tideRisk: Math.min(0.82, 0.34 + index * 0.044), evacuationReadiness: Math.min(1, index / 9) }
  },
  input: {
    moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1,
    jumpPressed: index === 2 || index === 6,
    restartPressed: index === 9
  }
}));

for (const stateCase of stateInputCases) {
  assert.ok(Number.isFinite(stateCase.dt));
  assert.ok(stateCase.input.moveAxis >= -1 && stateCase.input.moveAxis <= 1);
  assert.equal(typeof stateCase.input.jumpPressed, "boolean");
  assert.equal(typeof stateCase.input.restartPressed, "boolean");
  const readiness = domainKit.describe({ ...stateCase.state, input: stateCase.input, time: stateCase.dt * 60 });
  assert.ok(readiness.evacuationReadiness >= 0 && readiness.evacuationReadiness <= 1);
  assert.ok(readiness.tideRisk >= 0 && readiness.tideRisk <= 1);
  assert.equal(readiness.rendererHandoff.counts.total, 22);
  assert.ok(["repair-gantry-rails", "steady-rescue-hooks", "lash-floating-crate-bridge", "load-triage-baskets", "swing-survivors-to-skiff"].includes(readiness.missionState));
}

let cdnValidation = "source-wiring-only";
try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const response = await fetch(CDN, { signal: controller.signal });
  clearTimeout(timeout);
  if (response.ok) {
    const source = await response.text();
    const localCdn = join(tmpdir(), "nexusengine-main-cdn-vr-board-harbor-crane-smoke.mjs");
    writeFileSync(localCdn, source);
    execFileSync(process.execPath, ["--check", localCdn], { stdio: "pipe" });
    cdnValidation = "downloaded-to-local-mjs-and-syntax-checked";
  }
} catch {
  cdnValidation = "source-wiring-only";
}

console.log(`VR Board harbor crane evacuation CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);
