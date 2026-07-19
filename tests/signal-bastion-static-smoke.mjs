import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionSecondCommand,
  signalBastionEnemies,
  signalBastionWaves,
  signalBastionRewards,
  signalBastionCampaign
} from "../games/signal-bastion/presets/content.js";
import { signalBastionPresets, resolveSignalBastionPreset } from "../games/signal-bastion/presets/index.js";

const requiredFiles = [
  "games/signal-bastion/index.html",
  "games/signal-bastion/src/boot.js",
  "games/signal-bastion/src/input-host.js",
  "games/signal-bastion/src/renderer-canvas.js",
  "games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js",
  "games/signal-bastion/presets/content.js",
  "games/signal-bastion/presets/default.js",
  "games/signal-bastion/presets/hard.js",
  "games/signal-bastion/presets/endless.js",
  "games/signal-bastion/presets/debug.js",
  "games/signal-bastion/presets/index.js"
];

for (const file of requiredFiles) assert.ok(existsSync(file), `${file} exists`);

assert.equal(Object.keys(signalBastionMaps).length, 3, "three maps");
assert.equal(Object.keys(signalBastionTowers).length, 12, "twelve towers");
assert.deepEqual(
  signalBastionSecondCommand,
  {
    unlockAfterWave: 1,
    upgradeBlueprintId: "bolt",
    specialistBlueprintId: "volt",
    upgradePurpose: "focused impact",
    specialistPurpose: "rapid crossfire"
  },
  "the second command should remain declarative content"
);
assert.ok(Object.keys(signalBastionEnemies).length >= 15, "twelve enemies plus bosses");
assert.equal(Object.values(signalBastionEnemies).filter((enemy) => enemy.boss).length, 3, "three bosses");
assert.equal(signalBastionWaves.length, 30, "thirty authored waves");
assert.ok(signalBastionRewards.length >= 10, "reward pool exists");
assert.equal(signalBastionCampaign.nodes.length, 3, "campaign has one node per map");
assert.deepEqual(Object.keys(signalBastionPresets).sort(), ["debug", "default", "endless", "hard"]);
assert.equal(resolveSignalBastionPreset("?preset=hard").mode, "hard");
assert.equal(resolveSignalBastionPreset("?preset=endless").level.waves.length, 60);
assert.deepEqual(resolveSignalBastionPreset("").presentation.playerGuidance.secondCommand, signalBastionSecondCommand);

const index = readFileSync("games/signal-bastion/index.html", "utf8");
assert.match(index, /src\/boot\.js\?v=first-command-refinement-\d+/);
assert.match(index, /NexusEngine 2\.5D Defense/);
assert.match(index, /missionCard/);
assert.match(index, /startWaveButton/);
assert.match(index, /advancedPanel/);
assert.match(index, /diagnosticsToggle/);
assert.match(index, /statStrip/);
assert.match(index, /towerPanel/);
assert.match(index, /contextPanel/);
assert.doesNotMatch(index, /Click anchors build\/select/);
assert.doesNotMatch(index, /Space wave/);

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
assert.match(boot, /generic-defense-aaa-dsk-bridge/);
assert.match(boot, /LuminaryLabs-Agents\/NexusEngine-ProtoKits/);
assert.match(boot, /PROTOKITS_REF/);
assert.match(boot, /5986b69b047d622ea2efe58d12876033f3de2291/);
assert.doesNotMatch(boot, /LuminaryLabs-Agents\/NexusRealtime-ProtoKits/);
assert.match(boot, /generic-defense-session-command-kit/);
assert.match(boot, /SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS/);
assert.match(boot, /createGenericDefenseDskBundle/);
assert.match(boot, /createGenericDefenseSessionCommandKit/);
assert.match(boot, /generic-defense-presentation-stack-kit/);
assert.match(boot, /createGenericDefensePresentationStackKits/);
assert.match(boot, /getPresentation/);
assert.match(boot, /getSignalBastionSessionFacade/);
assert.match(boot, /createSignalBastionFrontlineTacticsDomainKit/);
assert.match(boot, /getFrontlineTactics/);
assert.match(boot, /getSignalBastionSecondCommand/);
assert.match(boot, /secondCommand/);
assert.match(boot, /engine\.n\?\.genericDefense/);
assert.doesNotMatch(boot, /\bcreateGenericDefenseKits\s*\(/);
assert.doesNotMatch(boot, /createGenericDefenseBuildKit\(/);
assert.doesNotMatch(boot, /createGenericDefenseWaveKit\(/);

const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
assert.match(input, /placementProjector/);
assert.match(input, /towerPanelEl/);
assert.match(input, /sessionFacade\(\)\?\.setBlueprint/);
assert.match(input, /sessionFacade\(\)\?\.sell/);
assert.match(input, /sessionFacade\(\)\?\.startWave/);
assert.match(input, /sessionFacade\(\)\?\.upgrade/);
assert.match(input, /engine\.n\?\.genericDefense/);
assert.doesNotMatch(input, /engine\.defenseBuild\?\./);
assert.doesNotMatch(input, /engine\.defenseWaves\?\.startWave/);
assert.doesNotMatch(input, /engine\.genericDefense\./);

const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");
assert.match(renderer, /draw\(presentation/);
assert.match(renderer, /getDiagnosticsVisible/);
assert.match(renderer, /setDiagnosticsVisible/);
assert.match(renderer, /drawTower/);
assert.match(renderer, /renderTowerPanel/);
assert.match(renderer, /renderContext/);
assert.match(renderer, /drawSecondCommand/);
assert.match(renderer, /second-command/);
assert.doesNotMatch(renderer, /createRealtimeGame/);

console.log("signal-bastion presentation stack static smoke passed");
