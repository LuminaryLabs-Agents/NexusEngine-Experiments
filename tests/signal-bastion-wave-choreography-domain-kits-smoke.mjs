import assert from "node:assert/strict";

import {
  createBastionCoverageGapCellKit,
  createBastionLeakRiskFunnelKit,
  createBastionPanicReserveMeterKit,
  createBastionProjectileTempoSparkKit,
  createBastionSpawnCadenceRailKit,
  createBastionUpgradePriorityPinKit,
  createBastionWaveChoreographyRendererHandoffKit,
  createSignalBastionWaveChoreographyDomainKit
} from "../games/signal-bastion/src/signal-bastion-wave-choreography-domain-kit.js";

const basePath = [
  { x: 80, y: 440, z: 0 },
  { x: 250, y: 330, z: 0 },
  { x: 520, y: 280, z: 0 },
  { x: 780, y: 160, z: 0 }
];

const baseSlots = {
  north: { id: "north", x: 315, y: 250, z: 0 },
  bend: { id: "bend", x: 510, y: 318, z: 0 },
  east: { id: "east", x: 690, y: 210, z: 0 }
};

function caseState(index) {
  const activeCount = index % 5;
  const structures = Array.from({ length: 1 + (index % 4) }, (_, tower) => ({
    id: `tower-${index}-${tower}`,
    x: 210 + tower * 110 + index * 3,
    y: 300 - tower * 28 + index * 4,
    z: 0,
    level: 1 + ((index + tower) % 3),
    range: 110 + tower * 18,
    color: tower % 2 ? "#6bf0b8" : "#8bd3ff"
  }));
  const agents = Object.fromEntries(Array.from({ length: activeCount }, (_, enemy) => [
    `enemy-${index}-${enemy}`,
    {
      id: `enemy-${index}-${enemy}`,
      x: 105 + enemy * 92 + index * 8,
      y: 418 - enemy * 36,
      z: 8,
      health: 25 + index * 4,
      maxHealth: 80,
      speed: 0.8 + enemy * 0.25,
      boss: enemy === 0 && index > 6,
      color: enemy % 2 ? "#ff7a5c" : "#f7a8ff"
    }
  ]));
  const projectiles = Object.fromEntries(Array.from({ length: index % 4 }, (_, projectile) => [
    `projectile-${index}-${projectile}`,
    {
      id: `projectile-${index}-${projectile}`,
      x: 260 + projectile * 44,
      y: 298 - projectile * 17,
      z: 18,
      damage: 10 + projectile * 4,
      color: "#ffffff"
    }
  ]));
  return {
    rawSnapshot: {
      map: {
        path: basePath,
        vital: { x: 820, y: 135, z: 0 },
        slots: baseSlots
      },
      level: {
        waves: [
          { spawnQueue: ["grunt", "runner", "brute"].slice(0, 1 + (index % 3)) },
          { spawnQueue: ["runner", "runner", "boss", "grunt"] }
        ]
      },
      session: {
        waveIndex: index % 2,
        waveActive: index % 3 !== 0,
        lives: 22 - index
      },
      economy: { wallet: { credits: 140 + index * 55 } },
      structures: { structures },
      agents: { active: agents },
      combat: { projectiles }
    },
    activeBlueprint: index % 2 ? "drum" : "bolt"
  };
}

const cases = Array.from({ length: 10 }, (_, index) => caseState(index));

const spawnKit = createBastionSpawnCadenceRailKit();
const leakKit = createBastionLeakRiskFunnelKit();
const gapKit = createBastionCoverageGapCellKit();
const upgradeKit = createBastionUpgradePriorityPinKit();
const reserveKit = createBastionPanicReserveMeterKit();
const tempoKit = createBastionProjectileTempoSparkKit();
const handoffKit = createBastionWaveChoreographyRendererHandoffKit();
const domainKit = createSignalBastionWaveChoreographyDomainKit();

for (const [index, input] of cases.entries()) {
  const spawn = spawnKit.describe(input);
  const leak = leakKit.describe(input);
  const gaps = gapKit.describe(input);
  const upgrades = upgradeKit.describe(input);
  const reserve = reserveKit.describe(input);
  const tempo = tempoKit.describe(input);
  const handoff = handoffKit.describe({ spawnCadence: spawn, leakRisk: leak, coverageGaps: gaps, upgradePriority: upgrades, panicReserve: reserve, projectileTempo: tempo });
  const domain = domainKit.describe(input);

  assert.equal(spawn.id, "bastion-spawn-cadence-rail");
  assert.equal(spawn.kind, "enemy-intent-thread-set");
  assert.equal(spawn.semanticKind, "spawn-cadence-rail");
  assert.ok(spawn.threads.length >= 2, `case ${index} should emit spawn cadence beats`);

  assert.equal(leak.kind, "path-threat-gradient");
  assert.equal(leak.semanticKind, "leak-risk-funnel-set");
  assert.ok(Array.isArray(leak.segments), `case ${index} leak funnels are an array`);

  assert.equal(gaps.kind, "tower-synergy-cell-set");
  assert.equal(gaps.semanticKind, "coverage-gap-cell-set");
  assert.ok(gaps.cells.length >= 1, `case ${index} should emit coverage gaps`);

  assert.equal(upgrades.kind, "economy-flow-ribbon-set");
  assert.equal(upgrades.semanticKind, "upgrade-priority-pin-set");
  assert.ok(upgrades.ribbons.length >= 1, `case ${index} should emit upgrade priority pins`);

  assert.equal(reserve.kind, "wave-readiness-glyph");
  assert.equal(reserve.semanticKind, "panic-reserve-meter");
  assert.ok(reserve.rings.length === 4, `case ${index} reserve meter should emit four rings`);

  assert.equal(tempo.kind, "economy-flow-ribbon-set");
  assert.equal(tempo.semanticKind, "projectile-tempo-spark-set");
  assert.ok(Array.isArray(tempo.ribbons), `case ${index} projectile tempo sparks are an array`);

  assert.equal(handoff.kind, "renderer-handoff");
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.policy.noDomOwnership, true);
  assert.equal(handoff.policy.noInputOwnership, true);
  assert.equal(handoff.policy.noWebglOwnership, true);
  assert.equal(handoff.policy.noAudioOwnership, true);
  assert.equal(handoff.policy.noAssetLoadingOwnership, true);
  assert.equal(handoff.counts.descriptors, 6);

  assert.equal(domain.kind, "wave-choreography-domain");
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes("signal-bastion-wave-choreography-domain"));
  assert.equal(domain.rendererHandoff.counts.descriptors, 6);

  const serialized = JSON.stringify(domain);
  assert.ok(serialized.includes("spawn-cadence-rail"));
  assert.ok(serialized.includes("coverage-gap-cell-set"));
  assert.ok(serialized.includes("panic-reserve-meter"));
  assert.doesNotThrow(() => JSON.parse(serialized));
}

console.log(`signal-bastion wave choreography kits smoke passed ${cases.length} intake cases`);
