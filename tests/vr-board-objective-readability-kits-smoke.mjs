import assert from "node:assert/strict";
import {
  VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE,
  createVrBoardCollectiblePriorityOrbitKit,
  createVrBoardHazardApproachFunnelKit,
  createVrBoardMomentumLaneKit,
  createVrBoardExitReadinessGateKit,
  createVrBoardHeadComfortCorridorKit,
  createVrBoardRouteRiskScorecardKit,
  createVrBoardObjectiveRendererHandoffKit,
  createVrBoardObjectiveReadabilityDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-objective-readability-kits.js";
import {
  createVrBoardTraversalReadabilityDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js";

function makeInput(index) {
  return {
    level: {
      start: { x: 0, y: 1.15 },
      exit: { x: 14.4 + index * 0.08, y: 4.4, w: 0.7, h: 1.2 },
      platforms: [
        { id: "launch", x: -0.6, y: 1.15, w: 3.1, h: 0.28 },
        { id: "low-hop", x: 3 + index * 0.05, y: 2.0, w: 1.9, h: 0.26 },
        { id: "hazard-bridge", x: 5.9, y: 2.85, w: 2.2, h: 0.26 },
        { id: "recovery", x: 8.8, y: 2.2 + index * 0.02, w: 1.8, h: 0.26 },
        { id: "summit", x: 11.6, y: 3.55, w: 2.4, h: 0.28 }
      ],
      collectibles: [
        { id: "coin-launch", x: 2.2, y: 2.2, value: 1 },
        { id: "coin-bridge", x: 6.8 + index * 0.04, y: 3.82, value: 1 },
        { id: "coin-recovery", x: 9.6, y: 3.1, value: 1 },
        { id: "coin-summit", x: 12.6, y: 4.5, value: 1 }
      ],
      hazards: index % 4 === 0 ? [] : [
        { id: "spike-gap", x: 4.95, y: 1.08, w: 0.8, h: 0.36 },
        { id: "spike-bridge", x: 7.45 + index * 0.03, y: 2.76, w: 0.7, h: 0.36 },
        { id: "drop-warning", x: 10.82, y: 1.12, w: 0.82, h: 0.36 }
      ]
    },
    avatar: {
      position: { x: 0.4 + index * 1.08, y: index === 8 ? -1.1 : 2.0 + index * 0.1 },
      velocity: { x: index % 2 ? 2.2 : -0.4, y: index % 3 === 0 ? 0.5 : -0.25 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: index === 8 ? "fallen" : "alive",
      moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1
    },
    objects: { collectedValue: index % 4, collectedIds: index > 5 ? ["coin-launch"] : [] },
    input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index === 3, restartPressed: index === 9 },
    camera: { position: { x: index * 0.6, y: 1.2 } },
    board: { sizeMeters: { x: 1.6, y: 0.9 } },
    comfort: { warnings: index === 7 ? ["head-drift"] : [] },
    sequence: { hint: index > 7 ? "Enter exit" : "Collect coins" },
    xrPose: { head: { position: { x: index === 7 ? 0.22 : -0.1 + index * 0.025, y: 1.48 + index * 0.03, z: 0 } } },
    collisions: { hazardHits: index === 4 ? ["spike-bridge"] : [] },
    time: index * 0.31
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const collectiblePriorityOrbitKit = createVrBoardCollectiblePriorityOrbitKit({ maxOrbits: 4 });
const hazardApproachFunnelKit = createVrBoardHazardApproachFunnelKit();
const momentumLaneKit = createVrBoardMomentumLaneKit();
const exitReadinessGateKit = createVrBoardExitReadinessGateKit({ requiredCollectibles: 3 });
const headComfortCorridorKit = createVrBoardHeadComfortCorridorKit();
const routeRiskScorecardKit = createVrBoardRouteRiskScorecardKit();
const rendererHandoffKit = createVrBoardObjectiveRendererHandoffKit({ collectiblePriorityOrbitKit, hazardApproachFunnelKit, momentumLaneKit, exitReadinessGateKit, headComfortCorridorKit, routeRiskScorecardKit });
const domainKit = createVrBoardObjectiveReadabilityDomainKit({ rendererHandoffKit });
const integratedTraversalKit = createVrBoardTraversalReadabilityDomainKit();

assert.equal(VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE.root, "vr-board-objective-readability-domain");
assert.ok(VR_BOARD_OBJECTIVE_READABILITY_DOMAIN_TREE.contract.includes("renderer consumes objective descriptors only"));

for (const input of intakes) {
  const orbits = collectiblePriorityOrbitKit.describe(input);
  assert.equal(collectiblePriorityOrbitKit.id, "n-vr-board-collectible-priority-orbit-kit");
  assert.equal(collectiblePriorityOrbitKit.domain, "vr-board-objective-readability/collectible-priority-orbit");
  assert.ok(orbits.length <= 4);
  assert.ok(orbits.every((orbit) => orbit.priority >= 0 && orbit.priority <= 1));
  assert.ok(orbits.every((orbit) => orbit.rendererContract.rendererMustNotOwn.includes("browser input")));

  const funnels = hazardApproachFunnelKit.describe(input);
  assert.equal(hazardApproachFunnelKit.id, "n-vr-board-hazard-approach-funnel-kit");
  assert.equal(hazardApproachFunnelKit.domain, "vr-board-objective-readability/hazard-approach-funnel");
  assert.equal(funnels.length, input.level.hazards.length);
  assert.ok(funnels.every((funnel) => funnel.urgency >= 0 && funnel.urgency <= 1));

  const lanes = momentumLaneKit.describe(input);
  assert.equal(momentumLaneKit.id, "n-vr-board-momentum-lane-kit");
  assert.equal(momentumLaneKit.domain, "vr-board-objective-readability/momentum-lane");
  assert.equal(lanes.length, input.level.platforms.length - 1);
  assert.ok(lanes.every((lane) => ["left", "right"].includes(lane.direction)));

  const exitGate = exitReadinessGateKit.describe(input);
  assert.equal(exitReadinessGateKit.id, "n-vr-board-exit-readiness-gate-kit");
  assert.equal(exitReadinessGateKit.domain, "vr-board-objective-readability/exit-readiness-gate");
  assert.ok(exitGate.readiness >= 0 && exitGate.readiness <= 1);
  assert.ok(exitGate.missingCollectibles >= 0);

  const comfort = headComfortCorridorKit.describe(input);
  assert.equal(headComfortCorridorKit.id, "n-vr-board-head-comfort-corridor-kit");
  assert.equal(headComfortCorridorKit.domain, "vr-board-objective-readability/head-comfort-corridor");
  assert.equal(comfort.bands.length, 3);
  assert.ok(["stable", "warning"].includes(comfort.tone));

  const scorecard = routeRiskScorecardKit.describe(input);
  assert.equal(routeRiskScorecardKit.id, "n-vr-board-route-risk-scorecard-kit");
  assert.equal(routeRiskScorecardKit.domain, "vr-board-objective-readability/route-risk-scorecard");
  assert.equal(scorecard.chips.length, 5);
  assert.ok(["training", "warning", "success"].includes(scorecard.tone));

  const handoff = rendererHandoffKit.describe(input);
  const domain = domainKit.describe(input);
  assert.equal(rendererHandoffKit.id, "n-vr-board-objective-renderer-handoff-kit");
  assert.equal(rendererHandoffKit.domain, "vr-board-objective-readability/renderer-handoff");
  assert.equal(handoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(domain.rendererHandoff.counts.total, handoff.counts.total);
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);

  const traversal = integratedTraversalKit.describe(input);
  assert.ok(traversal.objectiveReadability.rendererHandoff.counts.total >= handoff.counts.total - 1);
  assert.ok(traversal.rendererHandoff.counts.objectiveOrbits >= 0);
  assert.ok(traversal.checkpointThread.nodes.length >= input.level.collectibles.length + 2);
  assert.ok(traversal.tempoPulseBands.length >= input.level.platforms.length - 1);
}

console.log("vr board objective readability kit smoke passed: 8 new/integrated kit surfaces x 10 intake cases");
