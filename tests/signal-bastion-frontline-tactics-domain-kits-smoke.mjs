import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createBastionBossFocusLensKit,
  createBastionBuildSlotValueFieldKit,
  createBastionFrontlineTacticsRendererHandoffKit,
  createBastionInterceptZoneBracketKit,
  createBastionOverkillDampeningChipKit,
  createBastionSalvageWindowFlagKit,
  createBastionTowerRoleBalanceRibbonKit,
  createSignalBastionFrontlineTacticsDomainKit
} from "../games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js";

const basePath = [
  { x: 80, y: 440, z: 0 },
  { x: 250, y: 330, z: 0 },
  { x: 520, y: 280, z: 0 },
  { x: 780, y: 160, z: 0 }
];

function caseState(index) {
  const towerTypes = ["bolt", "drum", "spire", "slow"];
  const structures = Array.from({ length: 1 + (index % 5) }, (_, tower) => ({
    id: `tower-${index}-${tower}`,
    x: 210 + tower * 108 + index * 4,
    y: 322 - tower * 28 + index * 2,
    z: 0,
    level: 1 + ((index + tower) % 3),
    range: 120 + tower * 24,
    damage: 9 + tower * 4,
    towerType: towerTypes[(tower + index) % towerTypes.length],
    color: tower % 2 ? "#6bf0b8" : "#8bd3ff"
  }));
  const agents = Object.fromEntries(Array.from({ length: index % 6 }, (_, enemy) => [
    `enemy-${index}-${enemy}`,
    {
      id: `enemy-${index}-${enemy}`,
      x: 96 + enemy * 96 + index * 6,
      y: 428 - enemy * 38,
      z: 6,
      health: 36 + enemy * 22 + index,
      maxHealth: 90 + enemy * 20,
      speed: 0.9 + enemy * 0.17,
      boss: enemy === 0 && index >= 7,
      color: enemy % 2 ? "#ff7a5c" : "#f7a8ff"
    }
  ]));
  return {
    rawSnapshot: {
      map: {
        path: basePath,
        vital: { x: 820, y: 135, z: 0 },
        slots: {
          north: { id: "north", x: 315 + index, y: 250, z: 0 },
          bend: { id: "bend", x: 510, y: 318 - index, z: 0 },
          east: { id: "east", x: 690, y: 210, z: 0 },
          ridge: { id: "ridge", x: 420, y: 180 + index, z: 0 }
        }
      },
      level: {
        buildOrder: [
          { id: "bolt", cost: 95 },
          { id: "drum", cost: 170 },
          { id: "spire", cost: 220 }
        ],
        waves: [
          { spawnQueue: ["grunt", "runner", "brute"].slice(0, 1 + (index % 3)) },
          { spawnQueue: ["runner", "runner", "boss", "grunt"] }
        ]
      },
      session: {
        waveIndex: index % 2,
        waveActive: index % 3 !== 0,
        lives: 20 - index
      },
      economy: { wallet: { credits: 80 + index * 60 } },
      structures: { structures },
      agents: { active: agents }
    },
    activeBlueprint: index % 3 === 0 ? "spire" : index % 2 ? "drum" : "bolt"
  };
}

const cases = Array.from({ length: 10 }, (_, index) => caseState(index));
const slotKit = createBastionBuildSlotValueFieldKit();
const roleKit = createBastionTowerRoleBalanceRibbonKit();
const interceptKit = createBastionInterceptZoneBracketKit();
const bossKit = createBastionBossFocusLensKit();
const overkillKit = createBastionOverkillDampeningChipKit();
const salvageKit = createBastionSalvageWindowFlagKit();
const handoffKit = createBastionFrontlineTacticsRendererHandoffKit();
const domainKit = createSignalBastionFrontlineTacticsDomainKit();

for (const [index, input] of cases.entries()) {
  const buildSlotValue = slotKit.describe(input);
  const towerRoleBalance = roleKit.describe(input);
  const interceptZones = interceptKit.describe(input);
  const bossFocus = bossKit.describe(input);
  const overkillDampening = overkillKit.describe(input);
  const salvageWindows = salvageKit.describe(input);
  const handoff = handoffKit.describe({ buildSlotValue, towerRoleBalance, interceptZones, bossFocus, overkillDampening, salvageWindows });
  const domain = domainKit.describe(input);

  assert.equal(buildSlotValue.kind, "tower-synergy-cell-set");
  assert.equal(buildSlotValue.semanticKind, "build-slot-value-field");
  assert.ok(buildSlotValue.cells.length >= 3, `case ${index} should emit build slot value cells`);

  assert.equal(towerRoleBalance.kind, "economy-flow-ribbon-set");
  assert.equal(towerRoleBalance.semanticKind, "tower-role-balance-ribbon-set");
  assert.ok(towerRoleBalance.ribbons.length >= 3, `case ${index} should emit role balance ribbons`);

  assert.equal(interceptZones.kind, "path-threat-gradient");
  assert.equal(interceptZones.semanticKind, "intercept-zone-bracket-set");
  assert.ok(Array.isArray(interceptZones.segments), `case ${index} should emit intercept segments array`);

  assert.equal(bossFocus.kind, "enemy-intent-thread-set");
  assert.equal(bossFocus.semanticKind, "boss-focus-lens-set");
  assert.ok(Array.isArray(bossFocus.threads), `case ${index} should emit boss focus threads array`);

  assert.equal(overkillDampening.kind, "wave-readiness-glyph");
  assert.equal(overkillDampening.semanticKind, "overkill-dampening-chip");
  assert.equal(overkillDampening.rings.length, 4, `case ${index} overkill chip should emit four rings`);

  assert.equal(salvageWindows.kind, "economy-flow-ribbon-set");
  assert.equal(salvageWindows.semanticKind, "salvage-window-flag-set");
  assert.ok(Array.isArray(salvageWindows.ribbons), `case ${index} should emit salvage ribbons array`);

  assert.equal(handoff.kind, "renderer-handoff");
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.policy.noDomOwnership, true);
  assert.equal(handoff.policy.noInputOwnership, true);
  assert.equal(handoff.policy.noWebglOwnership, true);
  assert.equal(handoff.policy.noAudioOwnership, true);
  assert.equal(handoff.policy.noAssetLoadingOwnership, true);
  assert.equal(handoff.counts.descriptors, 6);

  assert.equal(domain.kind, "frontline-tactics-readability-domain");
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes("signal-bastion-frontline-tactics-readability-domain"));
  assert.equal(domain.rendererHandoff.counts.descriptors, 6);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), `case ${index} should be JSON serializable`);
}

const source = readFileSync("games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js", "utf8");
for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "new Audio", "fetch(", "WebGLRenderer", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!source.includes(forbidden), `frontline tactics kit should not own ${forbidden}`);
}

console.log(`signal-bastion frontline tactics kits smoke passed ${cases.length} intake cases`);
