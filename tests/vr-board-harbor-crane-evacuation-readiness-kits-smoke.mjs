import assert from "node:assert/strict";
import {
  VR_BOARD_HARBOR_CRANE_EVACUATION_DOMAIN_TREE,
  createDawnCraneLedgerKit,
  createFloatingCrateBridgeKit,
  createGantryRailKit,
  createRescueHookSlingKit,
  createTideCounterweightKit,
  createTriageBasketKit,
  createVrBoardHarborCraneEvacuationReadinessDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js";

function makeInput(index) {
  const collectedIds = ["flare-storm-pier", "dry-net-crane", "flare-flooded-dock", "blanket-cache", "skiff-rope"].slice(0, index % 6);
  return {
    level: {
      start: { x: 0, y: 1.08 },
      exit: { id: "skiff-launch-gate", x: 15.4 + index * 0.03, y: 4.62, w: 0.82, h: 1.2 },
      platforms: [
        { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
        { id: "crane-footing", x: 3.05, y: 2 + index * 0.02, w: 1.82, h: 0.26 },
        { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
        { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
        { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
        { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
      ],
      collectibles: [
        { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
        { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
        { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
        { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
        { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
      ]
    },
    avatar: {
      position: { x: 0.06 + index * 1.48, y: index === 8 ? -0.8 : 1.86 + index * 0.1 },
      velocity: { x: index % 2 ? 2.2 : -0.3, y: index % 3 ? -0.2 : 0.4 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: index === 8 ? "fallen" : "alive",
      moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1
    },
    objects: { collectedValue: collectedIds.length, collectedIds },
    weather: { tideLevel: Math.min(0.86, 0.34 + index * 0.052), wind: Math.min(0.76, 0.16 + index * 0.055), rain: 0.52 },
    stormHarborReadiness: { tideRisk: Math.min(0.82, 0.3 + index * 0.052), evacuationReadiness: Math.min(1, index / 9) },
    input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index === 2 || index === 6, restartPressed: index === 9 },
    time: index * 0.41
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const gantryRailKit = createGantryRailKit();
const rescueHookSlingKit = createRescueHookSlingKit();
const floatingCrateBridgeKit = createFloatingCrateBridgeKit();
const tideCounterweightKit = createTideCounterweightKit();
const triageBasketKit = createTriageBasketKit();
const dawnCraneLedgerKit = createDawnCraneLedgerKit();
const domainKit = createVrBoardHarborCraneEvacuationReadinessDomainKit();

assert.equal(VR_BOARD_HARBOR_CRANE_EVACUATION_DOMAIN_TREE.root, "vr-board-harbor-crane-evacuation-readiness-domain");
assert.ok(VR_BOARD_HARBOR_CRANE_EVACUATION_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const rails = gantryRailKit.describe(input);
  assert.equal(gantryRailKit.id, "vr-board-gantry-rail-kit");
  assert.equal(rails.length, 5);
  assert.ok(rails.every((rail) => rail.reach >= 0 && rail.reach <= 1));
  assert.ok(rails.every((rail) => ["reachable", "distant"].includes(rail.repairState)));

  const hooks = rescueHookSlingKit.describe(input);
  assert.equal(rescueHookSlingKit.id, "vr-board-rescue-hook-sling-kit");
  assert.equal(hooks.length, 4);
  assert.ok(hooks.every((hook) => hook.tension >= 0 && hook.tension <= 1));
  assert.ok(hooks.every((hook) => ["stable", "swinging", "danger"].includes(hook.status)));

  const crates = floatingCrateBridgeKit.describe(input);
  assert.equal(floatingCrateBridgeKit.id, "vr-board-floating-crate-bridge-kit");
  assert.equal(crates.length, 5);
  assert.ok(crates.every((crate) => crate.buoyancy >= 0 && crate.buoyancy <= 1));

  const counterweights = tideCounterweightKit.describe(input);
  assert.equal(tideCounterweightKit.id, "vr-board-tide-counterweight-kit");
  assert.equal(counterweights.length, 4);
  assert.ok(counterweights.every((weight) => ["surge", "swing", "steady"].includes(weight.hazard)));

  const baskets = triageBasketKit.describe(input);
  assert.equal(triageBasketKit.id, "vr-board-triage-basket-kit");
  assert.equal(baskets.length, 3);
  assert.ok(baskets.every((basket) => basket.warmth >= 0 && basket.warmth <= 1));

  const ledger = dawnCraneLedgerKit.describe(input, {
    reachableRails: rails.filter((rail) => rail.repairState === "reachable").length,
    railCount: rails.length,
    stableHooks: hooks.filter((hook) => hook.status === "stable").length,
    hookCount: hooks.length,
    securedCrates: crates.filter((crate) => crate.secured).length,
    crateCount: crates.length
  });
  assert.equal(dawnCraneLedgerKit.id, "vr-board-dawn-crane-ledger-kit");
  assert.ok(ledger.readiness >= 0 && ledger.readiness <= 1);
  assert.ok(["repair-gantry-rails", "steady-rescue-hooks", "lash-floating-crate-bridge", "load-triage-baskets", "swing-survivors-to-skiff"].includes(ledger.missionState));

  const domain = domainKit.describe(input);
  assert.equal(domainKit.id, "vr-board-harbor-crane-evacuation-readiness-domain-kit");
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(domain.rendererHandoff.counts.gantryRails, 5);
  assert.equal(domain.rendererHandoff.counts.rescueHookSlings, 4);
  assert.equal(domain.rendererHandoff.counts.total, 22);
  assert.ok(domain.ownershipBoundary.includes("no-browser-input"));
  assert.ok(domain.ownershipBoundary.includes("no-frame-loop"));
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);
}

const cold = domainKit.describe(makeInput(0));
const ready = domainKit.describe(makeInput(9));
assert.ok(ready.evacuationReadiness >= cold.evacuationReadiness);

console.log("VR Board harbor crane evacuation readiness kits smoke passed 10 intake cases.");
