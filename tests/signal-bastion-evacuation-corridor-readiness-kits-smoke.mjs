import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createBastionCasualtyCacheTriageKit,
  createBastionCivilianEvacuationLaneKit,
  createBastionEvacuationCorridorRendererHandoffKit,
  createBastionFinalSirenCountdownKit,
  createBastionGateIntegrityShieldKit,
  createBastionPowerRelayLoadKit,
  createBastionReserveConvoyThreadKit,
  createSignalBastionEvacuationCorridorReadinessDomainKit
} from "../games/signal-bastion/src/signal-bastion-evacuation-corridor-readiness-domain-kit.js";

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
const evacuationLaneKit = createBastionCivilianEvacuationLaneKit();
const casualtyCacheKit = createBastionCasualtyCacheTriageKit();
const gateIntegrityKit = createBastionGateIntegrityShieldKit();
const powerRelayKit = createBastionPowerRelayLoadKit();
const reserveConvoyKit = createBastionReserveConvoyThreadKit();
const finalSirenKit = createBastionFinalSirenCountdownKit();
const handoffKit = createBastionEvacuationCorridorRendererHandoffKit();
const domainKit = createSignalBastionEvacuationCorridorReadinessDomainKit();

for (const [index, input] of cases.entries()) {
  const evacuationLanes = evacuationLaneKit.describe(input);
  const casualtyCaches = casualtyCacheKit.describe(input);
  const gateIntegrity = gateIntegrityKit.describe(input);
  const powerRelayLoad = powerRelayKit.describe(input);
  const reserveConvoys = reserveConvoyKit.describe(input);
  const finalSiren = finalSirenKit.describe(input);
  const handoff = handoffKit.describe({ evacuationLanes, casualtyCaches, gateIntegrity, powerRelayLoad, reserveConvoys, finalSiren });
  const domain = domainKit.describe(input);

  assert.equal(evacuationLanes.kind, "economy-flow-ribbon-set");
  assert.equal(evacuationLanes.semanticKind, "civilian-evacuation-lane-set");
  assert.ok(evacuationLanes.ribbons.length >= 3, `case ${index} should emit evacuation ribbons`);

  assert.equal(casualtyCaches.kind, "tower-synergy-cell-set");
  assert.equal(casualtyCaches.semanticKind, "casualty-cache-triage-set");
  assert.ok(casualtyCaches.cells.length >= 3, `case ${index} should emit casualty triage cells`);

  assert.equal(gateIntegrity.kind, "path-threat-gradient");
  assert.equal(gateIntegrity.semanticKind, "gate-integrity-shield-set");
  assert.ok(gateIntegrity.segments.length >= 3, `case ${index} should emit gate shield segments`);

  assert.equal(powerRelayLoad.kind, "enemy-intent-thread-set");
  assert.equal(powerRelayLoad.semanticKind, "power-relay-load-set");
  assert.ok(powerRelayLoad.threads.length >= 1, `case ${index} should emit power relay threads`);

  assert.equal(reserveConvoys.kind, "enemy-intent-thread-set");
  assert.equal(reserveConvoys.semanticKind, "reserve-convoy-thread-set");
  assert.ok(reserveConvoys.threads.length >= 2, `case ${index} should emit reserve convoy threads`);

  assert.equal(finalSiren.kind, "wave-readiness-glyph");
  assert.equal(finalSiren.semanticKind, "final-siren-countdown");
  assert.equal(finalSiren.rings.length, 5, `case ${index} final siren should emit five rings`);

  assert.equal(handoff.kind, "renderer-handoff");
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.policy.noDomOwnership, true);
  assert.equal(handoff.policy.noInputOwnership, true);
  assert.equal(handoff.policy.noWebglOwnership, true);
  assert.equal(handoff.policy.noAudioOwnership, true);
  assert.equal(handoff.policy.noAssetLoadingOwnership, true);
  assert.equal(handoff.counts.descriptors, 6);

  assert.equal(domain.kind, "evacuation-corridor-readiness-domain");
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes("signal-bastion-evacuation-corridor-readiness-domain"));
  assert.equal(domain.rendererHandoff.counts.descriptors, 6);
  assert.ok(domain.summary.civilianEvacuationLanes >= 3, `case ${index} should summarize evacuation lanes`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), `case ${index} should be JSON serializable`);
}

const source = readFileSync("games/signal-bastion/src/signal-bastion-evacuation-corridor-readiness-domain-kit.js", "utf8");
for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "new Audio", "fetch(", "WebGLRenderer", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!source.includes(forbidden), `evacuation corridor kit should not own ${forbidden}`);
}

console.log(`signal-bastion evacuation corridor readiness kits smoke passed ${cases.length} intake cases`);
