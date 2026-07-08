import assert from "node:assert/strict";
import {
  createBastionPathThreatGradientKit,
  createBastionEconomyFlowRibbonKit,
  createBastionTowerSynergyCellKit,
  createBastionEnemyIntentThreadKit,
  createBastionWaveReadinessGlyphKit,
  createBastionCommandChoiceBandKit,
  createBastionCommandRendererHandoffKit,
  createSignalBastionCommandFractalDomainKit
} from "../games/signal-bastion/src/signal-bastion-command-fractal-domain-kit.js";

const buildCatalog = [
  { id: "bolt", label: "Bolt Spire", role: "single target", cost: { credits: 90 }, color: "#8bd3ff" },
  { id: "flare", label: "Flare Drum", role: "splash", cost: { credits: 140 }, color: "#ff7a5c" },
  { id: "aegis", label: "Aegis Bell", role: "slow", cost: { credits: 180 }, color: "#6bf0b8" },
  { id: "needle", label: "Needle Lance", role: "pierce", cost: { credits: 220 }, color: "#ffe36d" }
];

function makeCase(index) {
  const path = [
    { x: 72, y: 430 },
    { x: 210 + index * 3, y: 350 - index * 2 },
    { x: 440, y: 260 + index * 4 },
    { x: 700 - index * 2, y: 190 },
    { x: 835, y: 132 }
  ];
  const slots = Object.fromEntries(Array.from({ length: 4 + (index % 3) }, (_, slotIndex) => [
    `slot-${slotIndex}`,
    { id: `slot-${slotIndex}`, x: 170 + slotIndex * 118, y: 240 + (slotIndex % 2) * 84, z: 0 }
  ]));
  const structures = Object.fromEntries(Array.from({ length: 2 + (index % 4) }, (_, towerIndex) => [
    `tower-${towerIndex}`,
    {
      id: `tower-${towerIndex}`,
      towerType: buildCatalog[towerIndex % buildCatalog.length].id,
      x: 188 + towerIndex * 104,
      y: 232 + (towerIndex % 2) * 86,
      z: 0,
      level: 1 + (towerIndex % 3),
      range: 145 + towerIndex * 22,
      color: buildCatalog[towerIndex % buildCatalog.length].color
    }
  ]));
  const agents = Object.fromEntries(Array.from({ length: 2 + index }, (_, agentIndex) => [
    `agent-${agentIndex}`,
    {
      id: `agent-${agentIndex}`,
      x: 82 + agentIndex * 60,
      y: 410 - agentIndex * 28,
      z: 0,
      speed: 0.8 + agentIndex * 0.08,
      health: 50 + agentIndex * 7,
      maxHealth: 90 + agentIndex * 8,
      boss: agentIndex === index && index % 3 === 0,
      color: agentIndex % 2 ? "#ff7a5c" : "#ff9e7f"
    }
  ]));
  return {
    activeBlueprint: buildCatalog[index % buildCatalog.length].id,
    preset: { level: { buildOrder: buildCatalog } },
    presentation: {
      rawSnapshot: {
        map: { path, slots, vital: { x: 850, y: 130, z: 0 } },
        structures: { structures },
        agents: { active: agents },
        economy: { wallet: { credits: 80 + index * 52 } },
        session: { waveIndex: index, waveActive: index % 2 === 1 },
        level: {
          buildOrder: buildCatalog,
          waves: Array.from({ length: 12 }, (_, waveIndex) => ({
            id: `wave-${waveIndex}`,
            enemies: Array.from({ length: 2 + (waveIndex % 5) }, (_, enemyIndex) => ({ type: enemyIndex % 2 ? "runner" : "crawler" }))
          }))
        }
      }
    }
  };
}

const cases = Array.from({ length: 10 }, (_, index) => makeCase(index));
const forbiddenKeys = new Set(["element", "canvas", "ctx", "context2d", "mesh", "geometry", "materialRef", "audio", "listener", "requestAnimationFrame", "document", "window"]);

function assertSerializable(value, label) {
  assert.doesNotThrow(() => JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertNoForbiddenOwnership(value, label) {
  const stack = [value];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, nested] of Object.entries(current)) {
      assert.equal(forbiddenKeys.has(key), false, `${label} leaked forbidden ownership key ${key}`);
      stack.push(nested);
    }
  }
}

const pathThreatKit = createBastionPathThreatGradientKit();
const economyFlowKit = createBastionEconomyFlowRibbonKit();
const towerSynergyKit = createBastionTowerSynergyCellKit();
const enemyIntentKit = createBastionEnemyIntentThreadKit();
const waveReadinessKit = createBastionWaveReadinessGlyphKit();
const commandChoiceKit = createBastionCommandChoiceBandKit();
const rendererHandoffKit = createBastionCommandRendererHandoffKit();
const domainKit = createSignalBastionCommandFractalDomainKit();

for (const [index, state] of cases.entries()) {
  const pathThreat = pathThreatKit.describe(state);
  assert.equal(pathThreat.kind, "path-threat-gradient");
  assert.ok(pathThreat.segments.length >= 4, `case ${index} should expose path threat segments`);

  const economyFlow = economyFlowKit.describe(state);
  assert.equal(economyFlow.kind, "economy-flow-ribbon-set");
  assert.ok(economyFlow.ribbons.length >= 4, `case ${index} should expose economy ribbons`);

  const towerSynergy = towerSynergyKit.describe(state);
  assert.equal(towerSynergy.kind, "tower-synergy-cell-set");
  assert.ok(towerSynergy.cells.length >= 2, `case ${index} should expose tower synergy cells`);

  const enemyIntent = enemyIntentKit.describe(state);
  assert.equal(enemyIntent.kind, "enemy-intent-thread-set");
  assert.ok(enemyIntent.threads.length >= 2, `case ${index} should expose enemy intent threads`);

  const waveReadiness = waveReadinessKit.describe(state);
  assert.equal(waveReadiness.kind, "wave-readiness-glyph");
  assert.equal(waveReadiness.rings.length, 3, `case ${index} should expose three wave rings`);

  const commandChoices = commandChoiceKit.describe(state);
  assert.equal(commandChoices.kind, "command-choice-band");
  assert.equal(commandChoices.options.length, buildCatalog.length, `case ${index} should expose all command options`);
  assert.ok(commandChoices.options.some((option) => option.selected), `case ${index} should mark one selected command option`);

  const handoff = rendererHandoffKit.describe({ pathThreat, economyFlow, towerSynergy, enemyIntent, waveReadiness, commandChoices });
  assert.equal(handoff.kind, "renderer-handoff");
  assert.equal(handoff.policy.rendererConsumesDescriptorsOnly, true);
  assert.equal(handoff.counts.descriptors, 6);

  const domain = domainKit.describe(state);
  assert.equal(domain.kind, "command-fractal-domain");
  assert.equal(domain.rendererNeutral, true);
  assert.ok(domain.tree.includes("renderer consumes descriptors only"));
  assert.ok(domain.rendererHandoff.counts.pathSegments >= 4);
  assert.ok(domain.rendererHandoff.counts.commandOptions >= buildCatalog.length);

  assertSerializable(domain, `case ${index} command fractal domain`);
  assertNoForbiddenOwnership(domain, `case ${index} command fractal domain`);
}

console.log(`signal-bastion-command-fractal-domain-kits-smoke: ${cases.length} intake cases passed`);
