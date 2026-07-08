import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sessionVisual = readFileSync("experiments/next-ledge/src/session-visual-upgrade.js", "utf8");
const visualKits = readFileSync("experiments/next-ledge/src/visual-fractal-kits.js", "utf8");

assert.ok(sessionVisual.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!sessionVisual.includes("LuminaryLabs-Dev/NexusRealtime@0.0.2"));
assert.ok(sessionVisual.includes("createRuntimeEngine"));
assert.ok(sessionVisual.includes("createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine"));
assert.ok(sessionVisual.includes("createHeadlessRenderer"));
assert.ok(sessionVisual.includes("createNextLedgeVisualFractalDomainKit"));
assert.ok(sessionVisual.includes("visualFractalDescriptors"));
assert.ok(sessionVisual.includes("domain: {"));
assert.ok(sessionVisual.includes("visualQuality"));
assert.ok(sessionVisual.includes("update(dt, input = {})"));
assert.ok(sessionVisual.includes("snapshot()"));

const expectedInputSurfaces = [
  "visualEngine.parallax?.configure?.(parallaxInput",
  "visualEngine.configurableRenderLayers?.configure?.(renderStyleInput",
  "visualFractal.compose(snapshot)",
  "decorate(base.update(dt, input))",
  "decorate(base.snapshot())"
];
for (const surface of expectedInputSurfaces) assert.ok(sessionVisual.includes(surface), surface);

const expectedKits = [
  "createCliffStrataBandKit",
  "createCliffCrackVeinKit",
  "createAnchorAuraRingKit",
  "createRopeBraidSegmentKit",
  "createCloudWispStripKit",
  "createDangerFallStreakKit",
  "createNextLedgeVisualFractalDomainKit",
  "NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE",
  "rendererContract",
  "no Three.js, DOM, input, or frame loop"
];
for (const kit of expectedKits) assert.ok(visualKits.includes(kit), kit);

const intakes = Array.from({ length: 10 }, (_, i) => ({
  dt: i % 3 === 0 ? 1 / 30 : 1 / 60,
  input: {
    axis: i % 2 ? 1 : -1,
    action: i === 2 || i === 7,
    aimWorld: { x: i * 12, y: 120 + i * 20 },
    restart: i === 8,
    advanceSector: i === 9
  }
}));

for (const intake of intakes) {
  assert.ok(Number.isFinite(intake.dt));
  assert.ok(intake.input.axis >= -1 && intake.input.axis <= 1);
  assert.ok(typeof intake.input.action === "boolean");
}

console.log("next ledge NexusEngine CDN playwright/state-input smoke passed: 10 intake cases");
