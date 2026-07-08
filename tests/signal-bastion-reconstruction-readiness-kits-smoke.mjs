import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createBastionMarketReopenWindowKit,
  createBastionMemorialBeaconKit,
  createBastionReconstructionReadinessRendererHandoffKit,
  createBastionSupplyRouteRestorationKit,
  createBastionTowerFoundationRepairKit,
  createBastionWallBreachSealKit,
  createBastionWorkerCrewRallyKit,
  createSignalBastionReconstructionReadinessDomainKit
} from "../games/signal-bastion/src/signal-bastion-reconstruction-readiness-domain-kit.js";

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
    x: 210 + tower * 112 + index * 3,
    y: 324 - tower * 27 + index * 2,
    z: 0,
    level: 1 + ((index + tower) % 3),
    range: 120 + tower * 26,
    damage: 9 + tower * 5,
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
const wallBreachKit = createBastionWallBreachSealKit();
const towerFoundationKit = createBastionTowerFoundationRepairKit();
const supplyRouteKit = createBastionSupplyRouteRestorationKit();
const workerCrewKit = createBastionWorkerCrewRallyKit();
const marketReopenKit = createBastionMarketReopenWindowKit();
const memorialBeaconKit = createBastionMemorialBeaconKit();
const handoffKit = createBastionReconstructionReadinessRendererHandoffKit();
const domainKit = createSignalBastionReconstructionReadinessDomainKit();

for (const [index, input] of cases.entries()) {
  const wallBreachSeals = wallBreachKit.describe(input);
  const towerFoundationRepairs = towerFoundationKit.describe(input);
  const supplyRouteRestoration = supplyRouteKit.describe(input);
  const workerCrewRally = workerCrewKit.describe(input);
  const marketReopenWindow = marketReopenKit.describe(input);
  const memorialBeacon = memorialBeaconKit.describe(input);
  const handoff = handoffKit.describe({ wallBreachSeals, towerFoundationRepairs, supplyRouteRestoration, workerCrewRally, marketReopenWindow, memorialBeacon });
  const domain = domainKit.describe(input);

  assert.equal(wallBreachSeals.kind, "path-threat-gradient");
  assert.equal(wallBreachSeals.semanticKind, "wall-breach-seal-set");
  assert.ok(wallBreachSeals.segments.length >= 3, `case ${index} should emit wall breach segments`);

  assert.equal(towerFoundationRepairs.kind, "tower-synergy-cell-set");
  assert.equal(towerFoundationRepairs.semanticKind, "tower-foundation-repair-set");
  assert.ok(towerFoundationRepairs.cells.length >= 1, `case ${index} should emit tower foundation repair cells`);

  assert.equal(supplyRouteRestoration.kind, "economy-flow-ribbon-set");
  assert.equal(supplyRouteRestoration.semanticKind, "supply-route-restoration-set");
  assert.ok(supplyRouteRestoration.ribbons.length >= 3, `case ${index} should emit supply route ribbons`);

  assert.equal(workerCrewRally.kind, "enemy-intent-thread-set");
  assert.equal(workerCrewRally.semanticKind, "worker-crew-rally-set");
  assert.ok(workerCrewRally.threads.length >= 1, `case ${index} should emit worker crew rally threads`);

  assert.equal(marketReopenWindow.kind, "command-choice-band");
  assert.equal(marketReopenWindow.semanticKind, "market-reopen-window");
  assert.equal(marketReopenWindow.options.length, 4, `case ${index} should emit four market options`);

  assert.equal(memorialBeacon.kind, "wave-readiness-glyph");
  assert.equal(memorialBeacon.semanticKind, "memorial-beacon-readiness");
  assert.equal(memorialBeacon.rings.length, 6, `case ${index} should emit six memorial beacon rings`);

  assert.equal(handoff.kind, "renderer-handoff");
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.policy.noDomOwnership, true);
  assert.equal(handoff.policy.noInputOwnership, true);
  assert.equal(handoff.policy.noWebglOwnership, true);
  assert.equal(handoff.policy.noAudioOwnership, true);
  assert.equal(handoff.policy.noAssetLoadingOwnership, true);
  assert.equal(handoff.counts.descriptors, 6);

  assert.equal(domain.kind, "reconstruction-readiness-domain");
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes("signal-bastion-reconstruction-readiness-domain"));
  assert.equal(domain.rendererHandoff.counts.descriptors, 6);
  assert.ok(domain.summary.wallBreachSeals >= 3, `case ${index} should summarize wall breach seals`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), `case ${index} should be JSON serializable`);
}

const source = readFileSync("games/signal-bastion/src/signal-bastion-reconstruction-readiness-domain-kit.js", "utf8");
for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "THREE.", "new Audio", "fetch(", "WebGLRenderer", "LuminaryLabs-Dev/NexusRealtime@main"]) {
  assert.ok(!source.includes(forbidden), `reconstruction readiness kit should not own ${forbidden}`);
}

console.log(`signal-bastion reconstruction readiness kits smoke passed ${cases.length} intake cases`);
