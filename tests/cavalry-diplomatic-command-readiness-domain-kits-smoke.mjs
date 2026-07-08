import assert from "node:assert/strict";
import {
  CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE,
  createCavalryAllyLoyaltyBannerKit,
  createCavalryDiplomaticCommandReadinessDomainKit,
  createCavalryDiplomaticCommandRendererHandoffKit,
  createCavalryProvincePacificationBandKit,
  createCavalryRebellionSparkKit,
  createCavalrySenateDecreeMandateKit,
  createCavalryTributeObligationLedgerKit,
  createCavalryTriumphWindowStandardKit
} from "../experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-domain-kit.js";

const owners = ["player", "player", "ai1", null, "ai2", "player", "ai1", null, "ai2", "player"];
const baseCells = Array.from({ length: 10 }, (_, i) => ({
  id: `c-${i}`,
  x: 100 + i * 48,
  y: 130 + (i % 4) * 58,
  owner: owners[i],
  t: { l: 2 + (i % 3), m: i % 2, h: i % 4 === 0 ? 1 : 0 },
  n: [`c-${(i + 1) % 10}`, `c-${(i + 9) % 10}`, `c-${(i + 2) % 10}`]
}));

const cases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: i % 2 ? "senate-medium" : "senate-small",
  preset: { label: "Diplomatic Smoke", rivals: 3, worldW: 880, worldH: 560, actions: 4 },
  cells: baseCells.map((cell, index) => ({
    ...cell,
    owner: index === i % baseCells.length ? "player" : cell.owner,
    t: { l: cell.t.l + (index === i ? 1 : 0), m: cell.t.m + (index % 2), h: cell.t.h }
  })),
  turn: i + 1,
  actions: i % 4,
  from: `c-${i % 10}`,
  to: i % 2 ? `c-${(i + 1) % 10}` : null,
  draft: { l: 2 + (i % 2), m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 300, y: 220, z: 1 }
}));

const surfaces = [
  ["senate", createCavalrySenateDecreeMandateKit()],
  ["tribute", createCavalryTributeObligationLedgerKit()],
  ["ally", createCavalryAllyLoyaltyBannerKit()],
  ["rebellion", createCavalryRebellionSparkKit()],
  ["pacification", createCavalryProvincePacificationBandKit()],
  ["triumph", createCavalryTriumphWindowStandardKit()]
];

assert.ok(CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree should declare descriptor-only renderer handoff");
assert.ok(CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE.includes("cavalry-senate-decree-mandate-kit"), "tree should include senate mandate kit");
assert.ok(CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE.includes("cavalry-triumph-window-standard-kit"), "tree should include triumph window kit");

let smokeCount = 0;
for (const input of cases) {
  for (const [name, kit] of surfaces) {
    const descriptors = kit.describe(input);
    assert.ok(Array.isArray(descriptors), `${name} should return descriptors array`);
    assert.ok(descriptors.length > 0, `${name} should emit descriptors for intake ${input.turn}`);
    assert.doesNotThrow(() => JSON.stringify(descriptors), `${name} descriptors should be serializable`);
    for (const descriptor of descriptors) {
      assert.equal(typeof descriptor.id, "string", `${name} descriptor id should be stable`);
      assert.equal(typeof descriptor.kind, "string", `${name} descriptor kind should be stable`);
    }
    smokeCount += 1;
  }

  const domain = createCavalryDiplomaticCommandReadinessDomainKit().describe(input);
  assert.equal(domain.source.route, "the-cavalry-of-rome", "domain source should identify the route");
  assert.ok(domain.rendererHandoff.rendererConsumesDescriptorsOnly, "composite handoff should be descriptor-only");
  assert.equal(domain.senateDecreeMandates.length, 2, "composite should include two senate mandate chips");
  assert.ok(domain.tributeObligationLedgers.length > 0, "composite should include tribute ledgers");
  assert.ok(domain.allyLoyaltyBanners.length > 0, "composite should include ally banners");
  assert.ok(domain.rebellionSparks.length > 0, "composite should include rebellion sparks");
  assert.ok(domain.provincePacificationBands.length > 0, "composite should include pacification bands");
  assert.equal(domain.triumphWindowStandards.length, 2, "composite should include two triumph standards");
  assert.deepEqual(domain.rendererHandoff.counts, {
    senateDecreeMandates: domain.senateDecreeMandates.length,
    tributeObligationLedgers: domain.tributeObligationLedgers.length,
    allyLoyaltyBanners: domain.allyLoyaltyBanners.length,
    rebellionSparks: domain.rebellionSparks.length,
    provincePacificationBands: domain.provincePacificationBands.length,
    triumphWindowStandards: domain.triumphWindowStandards.length
  }, "handoff counts should mirror bucket sizes");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(domain)), "composite domain should be JSON-safe");

  const handoff = createCavalryDiplomaticCommandRendererHandoffKit().describe({
    senateDecreeMandates: domain.senateDecreeMandates,
    tributeObligationLedgers: domain.tributeObligationLedgers,
    allyLoyaltyBanners: domain.allyLoyaltyBanners,
    rebellionSparks: domain.rebellionSparks,
    provincePacificationBands: domain.provincePacificationBands,
    triumphWindowStandards: domain.triumphWindowStandards
  });
  assert.ok(handoff.contract.forbiddenOwnership.includes("browser-input"), "handoff should document browser-input ownership boundary");
  assert.ok(handoff.contract.forbiddenOwnership.includes("frame-loop"), "handoff should document frame-loop ownership boundary");
  smokeCount += 1;
}

assert.equal(smokeCount, 70, "10 intake cases should exercise 6 atomic kits plus the composite per case");
console.log("Cavalry diplomatic command readiness domain kits smoke passed.");
