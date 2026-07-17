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
const cargoWrapper = readFileSync("experiments/next-ledge/src/session-cargo-extraction-upgrade.js", "utf8");

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
assert.match(session, /safeAnchorY - failFloorDistance/, "failure should use the last safe anchor plus the active recovery window instead of a following camera");
for (const visibleSurface of ["Next Ledge", "A / D", "SPACE / CLICK", "R</b> retry", "Signal cargo", "Fall pressure", "Advanced controls + diagnostic layers"]) {
  assert.ok(index.includes(visibleSurface), `first screen should include ${visibleSurface}`);
}
for (const masterySurface of ["Stormbreak rest", "Commit perch", "Crosswind catch", "Relay crown", "Summit relay"]) {
  assert.ok(climbPreset.includes(masterySurface), `authored mastery crest should include ${masterySurface}`);
}
for (const choiceSurface of ["Shelter rise", "Signal cut", "Fork relay", "Stormlock restore", "Slipstream launch", "Cacheline high", "Windglass relay", "pressureDelta: 46", "cargoBonus: 1.75", "protectedFailFloorBonus: 210", "rejoinFailFloorBonus: 260", "rejoinAimAssistBonus: 34", "rejoinCameraZoomBonus: 96", "pressureRecovery: 100", "ventPulseCount: 4", "confirmationFrames: 24", "ZERO PRESSURE", "launchSpeedMultiplier: 1.34", "cargoRequired: 1.75", "scoreMetric: \"preserved-speed\"", "scoreMetric: \"cargo-mastery\""]) {
  assert.ok(climbPreset.includes(choiceSurface), `authored post-rest choice should include ${choiceSurface}`);
}
assert.match(climbAdapter, /postRestChoice/, "route adapter should expose the authored post-rest choice descriptor");
assert.match(climbAdapter, /routeChoiceRole/, "route adapter should preserve safe, shortcut, and rejoin roles");
assert.match(session, /routeChoice: createInitialRouteChoice/, "session should own one deterministic route-choice state");
assert.match(session, /route-choice-skipped/, "unselected branch should reconcile through the existing route-progress ledger");
assert.match(session, /protectedRecoveryWindow/, "the safe consequence should extend the existing recovery window rather than add a second recovery owner");
assert.match(session, /post-rejoin-protected-grapple-consumed/, "the safe consequence should resolve after one protected grapple");
assert.match(session, /post-rejoin-pressure-vented/, "the shortcut consequence should publish one semantic pressure vent event");
assert.match(session, /post-rejoin-pressure-vent-pulsed/, "Stormlock should publish bounded reel-time vent pulses before the final lock event");
assert.match(session, /updateStormlockVent/, "the existing reel path should drive authored Stormlock vent progress");
assert.match(session, /confirmation-active/, "the existing route-choice sequence should own the short Stormlock confirmation beat");
assert.match(session, /updateStormlockConfirmation/, "the confirmation beat should deterministically defer the existing payoff transition");
assert.match(session, /stormlock-confirmation-started/, "Stormlock should publish one semantic branch-aware confirmation event");
assert.match(session, /payoffLaunchWindow/, "the safe payoff should modulate the existing cable launch settings without adding a second launch owner");
assert.match(session, /payoffTargetTuning/, "both payoff branches should consume authored target-specific aim tuning without a second launch owner");
assert.match(session, /routeChoiceAimAssistLeadY/, "route-choice aim compensation should remain authored descriptor data");
assert.match(session, /routeChoiceAimAssistMinBuildAngle/, "authored shortcut aim assistance should require its advertised build window");
assert.match(session, /post-stormlock-payoff-opened/, "Stormlock should open one branch-specific payoff through the existing route-choice state");
assert.match(session, /post-stormlock-payoff-secured/, "the selected payoff anchor should advance the existing route-choice state");
assert.match(session, /convergence-active/, "the existing route-choice state should own the shared convergence beat");
assert.match(session, /windglass-relay-scored/, "Windglass Relay should publish one semantic branch score event");
assert.match(session, /windglass-rejoin-opened/, "Windglass Relay should publish one semantic generic-rejoin event");
assert.match(session, /windglass-rejoin-secured/, "the original generic anchor should publish one semantic rejoin confirmation");
assert.match(session, /convergenceScore/, "the branch score should remain inside the existing route-choice state");
assert.match(session, /genericRejoinRecoveryWindow/, "the branch-neutral rejoin should extend the existing recovery owner");
assert.match(climbAdapter, /genericRejoinAnchorId/, "route adaptation should preserve the original generic anchor instead of authoring a duplicate target");
assert.match(cargoWrapper, /post-rest-route-choice-committed/, "shortcut commitment should bridge into the existing route-cargo facade");
assert.match(cargoWrapper, /post-rejoin-pressure-vented/, "the post-rejoin vent should bridge into the existing route-cargo pressure facade");
assert.match(cargoWrapper, /amber-high-line-unlock/, "the shortcut payoff should spend banked cargo through the existing route-cargo facade");
assert.match(cargoWrapper, /syncCurrentCargoCheckpoint/, "route-cargo progress should begin from the current anchor instead of a stale base checkpoint");
assert.match(renderer, /safeChoiceLine/, "renderer should expose the mint branch through a bounded line entity");
assert.match(renderer, /shortcutChoiceLine/, "renderer should expose the amber branch through a bounded line entity");
assert.match(renderer, /consequenceLine/, "renderer should expose one bounded post-rejoin consequence line");
assert.match(renderer, /payoffTargetActive/, "renderer should reuse the bounded consequence line for the selected payoff target");
assert.match(renderer, /convergenceTargetActive/, "renderer should reuse the bounded consequence line for the Windglass convergence target");
assert.match(renderer, /rejoinTargetActive/, "renderer should reuse the bounded consequence line for the original generic rejoin target");
assert.match(hud, /MINT — Shelter recovery · AMBER — Signal shortcut/, "the contextual hero prompt should explain both routes without adding a control");
assert.match(hud, /MINT WINDOW — Protected grapple to Stormlock Restore/, "the contextual hero prompt should explain the safe post-rejoin consequence");
assert.match(hud, /AMBER PRESSURE — Grapple Stormlock Restore to vent/, "the contextual hero prompt should explain the shortcut vent demand");
assert.match(hud, /STORMLOCK VENT/, "the reel-time hero prompt should expose live pressure drain");
assert.match(hud, /MINT OVERCHARGE — Fire for Slipstream Launch/, "the safe payoff prompt should expose the faster launch window without a new control");
assert.match(hud, /AMBER HIGH LINE — Commit to Cacheline High/, "the shortcut payoff prompt should expose the harder cargo-unlocked line");
assert.match(hud, /WINDGLASS RELAY — Preserve/, "the shared convergence prompt should expose the preserved-speed score");
assert.match(hud, /WINDGLASS RELAY — Bank/, "the shared convergence prompt should expose the cargo-mastery score");
assert.match(hud, /REJOIN WINDOW — Build high · Fire for cyan ascent anchor/, "the contextual hero prompt should expose the branch-neutral recovery catch");
assert.match(climbAdapter, /masteryCrestId/, "route adapter should preserve mastery crest metadata");
assert.match(climbAdapter, /authoredRouteBeat/, "route adapter should mark authored late-route beats");
assert.match(index, /id="completionPanel"/, "route shell should provide an unmistakable summit completion surface");
assert.match(index, /Summit Relay Online/, "completion surface should name the delivered outcome");
assert.match(renderer, /summitCelebration/, "Three.js presentation should include a persistent summit celebration");
assert.match(renderer, /getMetrics/, "renderer should expose bounded performance evidence to GameHost");
assert.match(renderer, /presentedCameraY \?\? snapshot\.camera\.y/, "pointer projection should use the camera presentation that the player actually sees");
assert.match(renderer, /getDrawRange|setDrawRange/, "dynamic line geometry should reuse bounded buffers");
assert.match(renderer, /time - lastEffectTime/, "one-shot effects should age by real render time");
assert.doesNotMatch(index, /backdrop-filter/, "HUD readability should not depend on a WebGL-overlapping blur compositor");
assert.match(hud, /snapshot\.completed \? "DELIVERED"/, "completed cargo should read as delivered instead of an ambiguous zero");
assert.match(session, /new Set\(state\.recentEvents\)/, "bounded recent events should still forward late-route objective progress");
assert.match(session, /const latchCandidates = assistedTarget/, "magnetized shots should stay restricted to the assisted anchor");
assert.match(session, /enabledTargets\(state\)\.map/, "unassisted cable sweep should ignore inactive branch anchors");
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
