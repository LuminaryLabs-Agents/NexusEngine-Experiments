import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sessionVisual = readFileSync("experiments/next-ledge/src/session-visual-upgrade.js", "utf8");
const visualKits = readFileSync("experiments/next-ledge/src/visual-fractal-kits.js", "utf8");
const session = readFileSync("experiments/next-ledge/src/session.js", "utf8");
const index = readFileSync("experiments/next-ledge/index.html", "utf8");
const hud = readFileSync("experiments/next-ledge/src/hud.js", "utf8");
const diagnostics = readFileSync("experiments/next-ledge/src/advanced-diagnostics.js", "utf8");
const climbPreset = readFileSync("experiments/next-ledge/src/climb-preset.js", "utf8");
const climbAdapter = readFileSync("experiments/next-ledge/src/climb-anchor-adapter.js", "utf8");
const renderer = readFileSync("experiments/next-ledge/src/renderer-three-fidelity.js", "utf8");

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

assert.ok(session.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(session.includes("LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08"));
assert.ok(!session.includes("NexusRealtime-ProtoKits"));
assert.match(session, /safeAnchorY - n\(state\.tuning\.failFloorDistance/, "failure should use the last safe anchor instead of a following camera");
for (const visibleSurface of ["Next Ledge", "A / D", "SPACE / CLICK", "R</b> retry", "Signal cargo", "Fall pressure", "Advanced controls + diagnostic layers"]) {
  assert.ok(index.includes(visibleSurface), `first screen should include ${visibleSurface}`);
}
for (const masterySurface of ["Stormbreak rest", "Commit perch", "Crosswind catch", "Relay crown", "Summit relay"]) {
  assert.ok(climbPreset.includes(masterySurface), `authored mastery crest should include ${masterySurface}`);
}
assert.match(climbAdapter, /masteryCrestId/, "route adapter should preserve mastery crest metadata");
assert.match(climbAdapter, /authoredRouteBeat/, "route adapter should mark authored late-route beats");
assert.match(index, /id="completionPanel"/, "route shell should provide an unmistakable summit completion surface");
assert.match(index, /Summit Relay Online/, "completion surface should name the delivered outcome");
assert.match(renderer, /summitCelebration/, "Three.js presentation should include a persistent summit celebration");
assert.match(renderer, /getMetrics/, "renderer should expose bounded performance evidence to GameHost");
assert.match(renderer, /getDrawRange|setDrawRange/, "dynamic line geometry should reuse bounded buffers");
assert.match(renderer, /time - lastEffectTime/, "one-shot effects should age by real render time");
assert.doesNotMatch(index, /backdrop-filter/, "HUD readability should not depend on a WebGL-overlapping blur compositor");
assert.match(hud, /snapshot\.completed \? "DELIVERED"/, "completed cargo should read as delivered instead of an ambiguous zero");
assert.match(session, /new Set\(state\.recentEvents\)/, "bounded recent events should still forward late-route objective progress");
assert.match(session, /latchCandidates = assistedTarget \? \[assistedTarget\]/, "magnetized shots should not collide with unrelated old anchors");
assert.match(session, /maxAngularSpeed/, "swing energy should remain bounded through long holds and reel handoffs");
assert.doesNotMatch(index, /<script type="module" src="\.\/src\/.*readiness-entry\.js/, "readiness overlays must not cover the default playable view");
assert.match(hud, /actionPrompt/, "HUD should drive the contextual hero prompt");
assert.match(hud, /staminaMeter/, "HUD should expose player-readable stamina");
assert.match(diagnostics, /diagnosticDescriptions/, "advanced diagnostics should explain preserved layers without importing presentation overlays");
assert.doesNotMatch(diagnostics, /import\(diagnostic/, "advanced diagnostics should not destabilize the playable renderer with optional overlays");

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
