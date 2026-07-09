import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStonewakePressureLockPumpReadinessDomainKit } from "../games/stonewake-depths/stonewake-pressure-lock-pump-kits.js";

const indexHtml = readFileSync(new URL("../games/stonewake-depths/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../games/stonewake-depths/stonewake-pressure-lock-pump-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../games/stonewake-depths/stonewake-pressure-lock-pump-kits.js", import.meta.url), "utf8");

assert.ok(indexHtml.includes("pressure-lock-pump-readiness-renderer-handoff-pass"));
assert.ok(indexHtml.includes("stonewake-pressure-lock-pump-entry.js"));
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entrySource.includes("NexusRealtime@"));
assert.ok(entrySource.includes("getStonewakePressureLockPumpReadiness"));
assert.ok(entrySource.includes("getPressureLockPumpReadiness"));
assert.ok(entrySource.includes("getRendererHandoff"));
assert.ok(entrySource.includes("requestAnimationFrame(tick)"));
assert.ok(!/document\.|window\.|globalThis\.|requestAnimationFrame|canvas|getContext|addEventListener/.test(kitSource), "reusable kit source stays renderer/input/browser neutral");

const level = {
  bounds: { width: 3000, height: 820 },
  platforms: Array.from({ length: 8 }, (_, index) => ({ id: `route-${index}`, x: 90 + index * 350, y: 680 - index * 42, w: 230, h: 28, role: index === 7 ? "exit" : "route" })),
  objects: [
    { type: "player", x: 130, y: 630, w: 24, h: 46 },
    { type: "weighted-trigger", x: 860, y: 560 },
    { type: "valve", x: 1230, y: 458 },
    { type: "chain", x: 520, y: 470, h: 160 },
    { type: "chain", x: 1540, y: 350, h: 190 },
    { type: "finish-gate", x: 2650, y: 330 }
  ]
};
const kit = createStonewakePressureLockPumpReadinessDomainKit();
const inputSteps = [
  "spawn", "move-right", "chalk-depth", "grab-block", "place-block", "turn-valve", "pull-chain", "light-relay", "reach-lock", "open-gate"
];
const readinessValues = [];
for (const [index, action] of inputSteps.entries()) {
  const t = index / (inputSteps.length - 1);
  const state = {
    action,
    carry: action === "grab-block",
    plate: index >= 4,
    valve: index >= 5 ? Math.min(1, (index - 4) / 4) : 0,
    door: index >= 8 ? Math.min(1, (index - 7) / 2) : 0,
    camera: { x: Math.max(0, 2400 * t - 600), y: 0 },
    player: { x: 130 + 2520 * t, y: 630 - 260 * t, w: 24, h: 46 },
    water: { level: 750 - 190 * t }
  };
  const result = kit.describe({ state, level, input: { action } });
  readinessValues.push(result.readiness);
  assert.equal(result.rendererHandoff.rendererConsumesDescriptorsOnly, true, `descriptor-only handoff for ${action}`);
  assert.ok(result.rendererHandoff.counts.total >= 12, `enough descriptors for ${action}`);
  assert.ok(result.lockmasterLedger.nextAction.length > 12, `ledger explains next action for ${action}`);
}

assert.ok(readinessValues.at(-1) > readinessValues[0], "state/input progression improves pressure-lock readiness");

console.log("Stonewake pressure lock pump CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");
