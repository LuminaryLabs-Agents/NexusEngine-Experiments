import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("experiments/The Cavalry of Rome/src/main-realistic.js", "utf8");
const vegetation = readFileSync("experiments/The Cavalry of Rome/src/vegetation-pass.js", "utf8");
const hexBattlefield = readFileSync("experiments/The Cavalry of Rome/src/hex-battlefield-pass.js", "utf8");
const squadVisuals = readFileSync("experiments/The Cavalry of Rome/src/hex-squad-visual-pass.js", "utf8");
const gameplay = readFileSync("experiments/The Cavalry of Rome/src/hex-gameplay-pass.js", "utf8");
const actionUi = readFileSync("experiments/The Cavalry of Rome/src/hex-action-ui-pass.js", "utf8");
const campaignMap = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-map-pass.js", "utf8");
const campaignTerrain = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-3d-terrain-pass.js", "utf8");
const campaignGrid = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-tactical-grid-pass.js", "utf8");
const campaignSelect = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-space-select-pass.js", "utf8");
const campaignActions = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-world-actions-pass.js", "utf8");
const campaignFractal = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js", "utf8");
const campaignOrders = readFileSync("experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js", "utf8");
const campaignLogistics = readFileSync("experiments/The Cavalry of Rome/src/cavalry-logistics-readiness-domain-kit.js", "utf8");
const diplomaticCommand = readFileSync("experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-domain-kit.js", "utf8");
const campaignFractalHandoff = readFileSync("experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-handoff-pass.js", "utf8");
const diplomaticCommandPass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-pass.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const gallery = readFileSync("experiments/_shared/nexus-gallery-data.js", "utf8");
const plan = JSON.parse(readFileSync("experiments/The Cavalry of Rome/domain-plan.json", "utf8"));

const requiredDskImports = [
  "action-input-kit",
  "generic-route-progress-kit",
  "generic-affordance-descriptor-kit",
  "zone-field-kit",
  "camera-cinematic-maker-kit",
  "visual-fidelity-maker-kit",
  "gamehost-standard-kit",
  "scenario-qa-harness"
];

for (const dsk of requiredDskImports) {
  assert.ok(main.includes(`/protokits/${dsk}/index.js`), `legacy Cavalry visual route should still import ${dsk}`);
  assert.ok(plan.existingDskStack.includes(dsk), `domain-plan should list ${dsk}`);
}

assert.ok(main.includes("navigator.gpu"), "Cavalry legacy visual proof should keep a WebGPU renderer path");
assert.ok(main.includes("CanvasFallbackRenderer"), "Cavalry legacy visual proof should keep a Canvas fallback");
assert.ok(main.includes("makeRegionOverlayVertices"), "Cavalry should use highlighted region overlays instead of point nodes");
assert.ok(main.includes("makePainterlyStrokeVertices"), "Cavalry should add painterly brush/contour overlays");
assert.ok(main.includes("valueNoise2D"), "Cavalry should use non-repeating value noise");
assert.ok(main.includes("fbmNoise"), "Cavalry should use multi-octave FBM terrain noise");
assert.ok(main.includes("ridgedNoise"), "Cavalry should use ridged terrain noise");
assert.ok(main.includes("domainWarp"), "Cavalry should domain-warp terrain samples");
assert.ok(main.includes("biomeColorBlend"), "Cavalry should blend biome colors naturally");
assert.ok(main.includes("REALISTIC_TERRAIN_STYLE"), "Cavalry should expose realistic terrain fidelity metadata");
assert.ok(main.includes("nonRepeatingLandforms"), "Cavalry should expose non-repeating landform metadata");
assert.ok(main.includes("MAP_EXTENTS"), "Cavalry should define a larger map extent");
assert.ok(main.includes("mapPan"), "Cavalry should expose pan state");
assert.ok(main.includes("wheel"), "Cavalry should support wheel zoom for the map");
assert.ok(main.includes("pushPrimitiveSoldier"), "Cavalry soldiers should be constructed from primitive body parts");
assert.ok(main.includes("FULL_BODY_PRIMITIVE_STYLE"), "Cavalry should expose full-body primitive soldier fidelity metadata");

assert.ok(vegetation.includes("VEGETATION_DSK_ID"), "vegetation pass should expose a local procedural vegetation DSK candidate id");
assert.ok(vegetation.includes("createVegetationDescriptorField"), "vegetation pass should create a renderer-neutral descriptor field");
assert.ok(vegetation.includes("metadata-only-until-terrain-anchored-instancing"), "vegetation should remain metadata-only until terrain anchoring is real");
assert.ok(vegetation.includes("disabledScreenSpaceRendering"), "vegetation pass should disable screen-space drawing to prevent sky floating");
assert.ok(!vegetation.includes("requestAnimationFrame(drawVegetationFrame)"), "vegetation pass should not continuously draw a screen-space overlay");

assert.ok(hexBattlefield.includes("createHexBattlefield"), "hex pass should create a battlefield grid");
assert.ok(hexBattlefield.includes("fixed-pointy-offset"), "hex pass should expose fixed aligned grid math");
assert.ok(hexBattlefield.includes("webgl2-shaded-layered-hex-interiors"), "hex pass should document WebGL2 shaded interiors");
assert.ok(hexBattlefield.includes("getContext(\"webgl2\""), "hex pass should request a WebGL2 context");
assert.ok(hexBattlefield.includes("#version 300 es"), "hex pass should use GLSL ES 3.00 shaders");

assert.ok(squadVisuals.includes("low-poly-mini-squads-no-token-rings"), "squad pass should document no-token mini squads");
assert.ok(squadVisuals.includes("drawLowPolySoldier"), "squad pass should draw primitive low-poly soldiers");
assert.ok(squadVisuals.includes("drawSelectionPennant"), "squad pass should use a pennant instead of a ring for selection feedback");
assert.ok(squadVisuals.includes("tokenRingsRemoved: true"), "squad pass should expose token ring removal metadata");
assert.ok(!squadVisuals.includes("unitCtx.ellipse"), "squad pass should not draw circular token ellipses");

assert.ok(gameplay.includes("scene-native-maneuver-logic-webgl-dice"), "gameplay pass should document scene-native maneuver logic");
assert.ok(gameplay.includes("MANEUVERS"), "gameplay pass should define maneuvers");
for (const maneuver of ["advanceLeft", "advanceCenter", "advanceRight", "lineBrigade", "heavyBrigade", "berserk", "scout"]) {
  assert.ok(gameplay.includes(maneuver), `gameplay pass should include ${maneuver}`);
}
assert.ok(gameplay.includes("rollActionPoints"), "gameplay pass should roll AP every three turns");
assert.ok(gameplay.includes("crypto.getRandomValues"), "dice rolls should use crypto randomness when available");
assert.ok(gameplay.includes("reachableHexes"), "gameplay pass should calculate reachable hexes");
assert.ok(gameplay.includes("drawDirectionalShadow"), "gameplay squads should use angled individual shadows");
assert.ok(gameplay.includes("startManeuver"), "GameHost should expose maneuver start logic");

assert.ok(actionUi.includes("bottom-native-card-action-bar"), "action UI pass should document the bottom native card UI");
assert.ok(actionUi.includes("cavalry-action-ui"), "action UI should create a bottom action bar root");
assert.ok(actionUi.includes("startManeuver"), "action UI should call GameHost.startManeuver");
assert.ok(actionUi.includes("AP"), "action UI should label action point costs");

assert.ok(campaignMap.includes("CAVALRY".toLowerCase()) || campaignMap.includes("CavalryCampaignMap"), "campaign map should expose CavalryCampaignMap");
assert.ok(campaignTerrain.includes("CavalryCampaignTerrain") || campaignTerrain.includes("campaign-3d"), "campaign terrain pass should expose a campaign terrain surface");
assert.ok(campaignGrid.includes("CavalryCampaign") || campaignGrid.includes("tactical"), "campaign grid pass should expose tactical grid behavior");
assert.ok(campaignSelect.includes("Cavalry") && campaignSelect.includes("select"), "campaign select pass should expose selection behavior");
assert.ok(campaignActions.includes("WORLD_ACTION_STYLE"), "campaign actions pass should expose world action style metadata");
assert.ok(campaignActions.includes("endWorldTurn"), "campaign actions pass should expose end-turn behavior");

for (const kitName of [
  "cavalry-supply-line-kit",
  "cavalry-march-corridor-kit",
  "cavalry-unit-cohesion-field-kit",
  "cavalry-morale-weather-front-kit",
  "cavalry-maneuver-choice-band-kit",
  "cavalry-fractal-renderer-handoff-kit",
  "cavalry-campaign-fractal-domain-kit"
]) {
  assert.ok(campaignFractal.includes(kitName), `campaign fractal kit file should include ${kitName}`);
  assert.ok(plan.existingDskStack.includes(kitName), `domain plan should list ${kitName}`);
}

for (const kitName of [
  "cavalry-scouting-vector-kit",
  "cavalry-flank-risk-arc-kit",
  "cavalry-reinforcement-callout-kit",
  "cavalry-attrition-forecast-chip-kit",
  "cavalry-turn-tempo-standard-kit",
  "cavalry-objective-pressure-banner-kit",
  "cavalry-battlefield-orders-renderer-handoff-kit",
  "cavalry-battlefield-orders-domain-kit"
]) {
  assert.ok(campaignOrders.includes(kitName), `campaign orders kit file should include ${kitName}`);
  assert.ok(plan.existingDskStack.includes(kitName), `domain plan should list ${kitName}`);
}

for (const kitName of [
  "cavalry-supply-depot-radius-kit",
  "cavalry-forage-corridor-kit",
  "cavalry-road-strain-thread-kit",
  "cavalry-siege-readiness-signal-kit",
  "cavalry-courier-order-pulse-kit",
  "cavalry-winter-attrition-warning-kit",
  "cavalry-logistics-readiness-domain-kit"
]) {
  assert.ok(campaignLogistics.includes(kitName), `campaign logistics kit file should include ${kitName}`);
  assert.ok(plan.existingDskStack.includes(kitName), `domain plan should list ${kitName}`);
}

for (const kitName of [
  "cavalry-senate-decree-mandate-kit",
  "cavalry-tribute-obligation-ledger-kit",
  "cavalry-ally-loyalty-banner-kit",
  "cavalry-rebellion-spark-kit",
  "cavalry-province-pacification-band-kit",
  "cavalry-triumph-window-standard-kit",
  "cavalry-diplomatic-command-renderer-handoff-kit",
  "cavalry-diplomatic-command-readiness-domain-kit"
]) {
  assert.ok(diplomaticCommand.includes(kitName), `diplomatic command kit file should include ${kitName}`);
  assert.ok(plan.existingDskStack.includes(kitName), `domain plan should list ${kitName}`);
}

assert.ok(campaignFractal.includes("renderer consumes descriptors only"), "campaign fractal tree should declare descriptor-only renderer handoff");
assert.ok(campaignOrders.includes("renderer consumes descriptors only"), "campaign orders tree should declare descriptor-only renderer handoff");
assert.ok(campaignLogistics.includes("renderer consumes descriptors only"), "campaign logistics tree should declare descriptor-only renderer handoff");
assert.ok(diplomaticCommand.includes("renderer consumes descriptors only"), "diplomatic command tree should declare descriptor-only renderer handoff");
assert.ok(campaignFractalHandoff.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "campaign fractal handoff should import NexusEngine main CDN");
assert.ok(diplomaticCommandPass.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "diplomatic command pass should import NexusEngine main CDN");
assert.ok(campaignFractalHandoff.includes("CavalryCampaignFractal"), "campaign fractal handoff should expose global state");
assert.ok(campaignFractalHandoff.includes("getCavalryBattlefieldOrders"), "campaign handoff should expose battlefield order descriptors");
assert.ok(diplomaticCommandPass.includes("getCavalryDiplomaticCommandReadiness"), "diplomatic pass should expose diplomatic command descriptors");
assert.ok(campaignFractalHandoff.includes("rendererConsumes = \"descriptors-only\""), "handoff pass should mark descriptor-only consumption");
assert.ok(diplomaticCommandPass.includes("rendererConsumes = \"descriptors-only\""), "diplomatic pass should mark descriptor-only consumption");
assert.ok(!campaignFractalHandoff.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed handoff should not import old NexusRealtime runtime CDN");
assert.ok(!diplomaticCommandPass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "diplomatic pass should not import old NexusRealtime runtime CDN");

assert.ok(endpoint.includes("cavalry-campaign-3d-terrain-pass.js?v=campaign-034"), "live endpoint should load the campaign terrain pass");
assert.ok(endpoint.includes("cavalry-campaign-tactical-grid-pass.js?v=campaign-034"), "live endpoint should load the tactical grid pass");
assert.ok(endpoint.includes("cavalry-campaign-space-select-pass.js?v=campaign-034"), "live endpoint should load the space select pass");
assert.ok(endpoint.includes("cavalry-campaign-world-actions-pass.js?v=campaign-034"), "live endpoint should load the world action pass");
assert.ok(endpoint.includes("cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "live endpoint should load the campaign fractal handoff pass");
assert.ok(endpoint.includes("cavalry-logistics-readiness-pass.js?v=campaign-035"), "live endpoint should load the logistics readiness pass");
assert.ok(endpoint.includes("cavalry-diplomatic-command-readiness-pass.js?v=campaign-036"), "live endpoint should load the diplomatic command readiness pass");
assert.ok(endpoint.includes("Campaign 041"), "live endpoint should identify the current upgraded build");
assert.ok(endpoint.includes("campaign-041-standard-bearer-morale"), "live endpoint should expose the current build stamp");
assert.ok(!endpoint.includes("attachNexusRealtimePageLoader"), "live endpoint should not attach shared page-loader UI");
assert.ok(!endpoint.includes("nexus-realtime-page-loader.js"), "live endpoint should not import shared page-loader UI");

assert.ok(experimentEntry.includes("./src/main-realistic.js"), "experiment entry should retain the realistic Cavalry module");
assert.ok(experimentEntry.includes("./src/cavalry-campaign-map-pass.js"), "experiment entry should load the campaign map pass");
assert.ok(experimentEntry.includes("./src/cavalry-campaign-fractal-handoff-pass.js?v=campaign-035"), "experiment entry should load the campaign fractal handoff pass");
assert.ok(experimentEntry.includes("./src/cavalry-logistics-readiness-pass.js?v=campaign-035"), "experiment entry should load the logistics readiness pass");
assert.ok(experimentEntry.includes("./src/cavalry-diplomatic-command-readiness-pass.js?v=campaign-036"), "experiment entry should load the diplomatic command readiness pass");
assert.ok(experimentEntry.includes("CavalryUiSinkShim"), "experiment entry should provide non-DOM status sinks for runtime compatibility");
assert.ok(!experimentEntry.includes("attachNexusRealtimePageLoader"), "experiment entry should not attach shared page-loader UI");
assert.ok(!experimentEntry.includes("nexus-realtime-page-loader.js"), "experiment entry should not import shared page-loader UI");

assert.ok(gallery.includes('id: "the-cavalry-of-rome"'), "gallery should expose Cavalry by id");
assert.ok(gallery.includes('route: "./apps/the-cavalry-of-rome/"'), "gallery should point to the live app endpoint");

assert.equal(plan.canonicalRouteClaim, true, "Cavalry should now claim the canonical live route status");
assert.equal(plan.deterministicReplayClaim, false, "Cavalry should not claim deterministic replay yet");
assert.equal(plan.fidelityFocus.mapNavigation.includes("campaign"), true, "domain plan should record campaign map navigation");
assert.ok(plan.fidelityFocus.campaignReadability, "domain plan should record campaign readability fidelity");
assert.ok(plan.fidelityFocus.orderReadability, "domain plan should record order readability fidelity");
assert.ok(plan.fidelityFocus.logisticsReadiness, "domain plan should record logistics readiness fidelity");
assert.ok(plan.fidelityFocus.diplomaticCommandReadiness, "domain plan should record diplomatic command readiness fidelity");
assert.ok(plan.campaignFractalDomain, "domain plan should record the campaign fractal domain");
assert.ok(plan.battlefieldOrdersDomain, "domain plan should record the battlefield orders domain");
assert.ok(plan.logisticsReadinessDomain, "domain plan should record the logistics readiness domain");
assert.ok(plan.diplomaticCommandReadinessDomain, "domain plan should record the diplomatic command readiness domain");
assert.ok(plan.currentLocalSurfaces.includes("campaign fractal supply-line descriptors"), "domain plan should list supply-line descriptors");
assert.ok(plan.currentLocalSurfaces.includes("battlefield orders scouting-vector descriptors"), "domain plan should list scouting-vector descriptors");
assert.ok(plan.currentLocalSurfaces.includes("diplomatic command senate-mandate descriptors"), "domain plan should list senate mandate descriptors");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "campaign-supply-line-kit"), "supply line kit should be mapped to a future ProtoKit candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "campaign-command-choice-kit"), "command choice kit should be mapped to a future ProtoKit candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "campaign-scouting-vector-kit"), "scouting vector kit should be mapped to a future ProtoKit candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "campaign-diplomatic-command-kit"), "diplomatic command kit should be mapped to a future ProtoKit candidate");

console.log("Cavalry of Rome visual DSK static smoke passed.");
