import assert from "node:assert/strict";
import {
  LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE,
  LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_KITS,
  createLivingAgentCivicFestivalMediationReadinessDomainKit
} from "../experiments/living-agent-lab/civic-festival-mediation-readiness-kits.js";

const kit = createLivingAgentCivicFestivalMediationReadinessDomainKit();

function baseWorld(overrides = {}) {
  return {
    tick: 0,
    player: { x: 170, y: 300, label: "Player" },
    guard: { x: 480, y: 250, label: "Guard", mood: "calm" },
    merchant: { x: 300, y: 230, label: "Merchant", mood: "neutral" },
    apple: { x: 310, y: 330, label: "Apple", stolen: false },
    gate: { x: 650, y: 290, label: "Gate", locked: true },
    facts: ["market is quiet"],
    lastChoice: null,
    ...overrides
  };
}

const cases = [
  { name: "cold planning", world: baseWorld(), festival: {} },
  { name: "permit filed", world: baseWorld(), festival: { permitFiled: true } },
  { name: "vendor lane clear", world: baseWorld(), festival: { vendorLaneCleared: true } },
  { name: "lantern route lit", world: baseWorld(), festival: { lanternsLit: 8 } },
  { name: "stewards assigned", world: baseWorld(), festival: { stewardPosts: 4 } },
  { name: "mediators briefed", world: baseWorld(), festival: { mediatorBriefings: 4 } },
  { name: "apple dispute", world: baseWorld({ apple: { x: 310, y: 330, stolen: true }, guard: { x: 480, y: 250, mood: "suspicious" } }), festival: { permitFiled: true, lanternsLit: 4 } },
  { name: "merchant nervous", world: baseWorld({ merchant: { x: 300, y: 230, mood: "nervous" } }), festival: { permitFiled: true, vendorLaneCleared: true } },
  { name: "route seed variation", world: baseWorld({ facts: ["guard questioned merchant", "player returned apple"] }), festival: { permitFiled: true, vendorLaneCleared: true, lanternsLit: 5, stewardPosts: 3, routeSeed: 91 } },
  { name: "open night market", world: baseWorld({ gate: { x: 650, y: 290, locked: false }, facts: ["guard questioned merchant", "player returned apple"] }), festival: { permitFiled: true, vendorLaneCleared: true, lanternsLit: 8, stewardPosts: 4, mediatorBriefings: 3 } }
];

assert.equal(kit.id, "living-agent-civic-festival-mediation-domain-kit");
assert.ok(LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_KITS.includes("living-agent-civic-festival-renderer-handoff-kit"));

const outputs = cases.map((testCase) => kit.describe(testCase));

for (const [index, output] of outputs.entries()) {
  assert.equal(output.id, "living-agent-civic-festival-mediation-readiness", cases[index].name);
  assert.ok(output.festivalReadiness >= 0 && output.festivalReadiness <= 1, `${cases[index].name} readiness bounded`);
  assert.ok(["planning", "preparing", "staging", "dispute", "open"].includes(output.phase), `${cases[index].name} phase enum`);
  assert.ok(["ready", "at-risk", "staging"].includes(output.missionState), `${cases[index].name} mission enum`);
  assert.equal(output.rendererHandoff.rendererConsumesDescriptorsOnly, true, `${cases[index].name} descriptor handoff`);
  assert.equal(output.rendererHandoff.counts.permitScrolls, 2, `${cases[index].name} permit scroll count`);
  assert.equal(output.rendererHandoff.counts.vendorLaneMarkers, 4, `${cases[index].name} vendor marker count`);
  assert.equal(output.rendererHandoff.counts.lanternRouteThreads, 2, `${cases[index].name} lantern route count`);
  assert.equal(output.rendererHandoff.counts.disputeHearingCards, 1, `${cases[index].name} dispute count`);
  assert.equal(output.rendererHandoff.counts.safetyStewardPosts, 4, `${cases[index].name} steward count`);
  assert.equal(output.rendererHandoff.counts.nightMarketLedgers, 1, `${cases[index].name} ledger count`);
  assert.equal(output.rendererHandoff.counts.total, 14, `${cases[index].name} total descriptor count`);
  assert.doesNotThrow(() => JSON.stringify(output), `${cases[index].name} JSON safe`);
  assert.ok(output.sourceBoundary.forbiddenOwnership.includes("renderer"), `${cases[index].name} renderer forbidden`);
  assert.ok(output.sourceBoundary.forbiddenOwnership.includes("browser-input"), `${cases[index].name} input forbidden`);
}

const cold = outputs[0].festivalReadiness;
const open = outputs.at(-1).festivalReadiness;
assert.ok(open > cold, "open night market readiness should improve from cold planning");
assert.equal(outputs.at(-1).phase, "open", "complete case opens night market");
assert.equal(outputs[6].phase, "dispute", "stolen apple opens dispute phase");

console.log(`Living Agent civic festival mediation readiness kits smoke passed ${cases.length} intake cases.`);
