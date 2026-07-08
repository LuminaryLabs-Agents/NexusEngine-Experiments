import assert from "node:assert/strict";
import {
  SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE,
  createSoraRunwayVectorLatticeKit,
  createSoraEnergyBudgetRibbonKit,
  createSoraCloudCoverSlitKit,
  createSoraLaunchLaneChoiceKit,
  createSoraRiskRewardCardKit,
  createSoraReturnAnchorKit,
  createSoraFlightplanRendererHandoffKit,
  createSoraFlightplanReadabilityDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js";
import { createSoraLaunchRehearsalDomainKit } from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";

const cases = [
  { label: "idle cold", tick: 0, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { label: "query preserved", tick: 16, readiness: 0.32, input: { thrust: 0.15, bank: 0, climb: 0 }, query: "?seed=one", hash: "" },
  { label: "build lift", tick: 32, readiness: 0.45, input: { thrust: 1, bank: 0, climb: 0.2 }, query: "", hash: "#lift" },
  { label: "left vector", tick: 48, readiness: 0.55, input: { thrust: 0.7, bank: -0.8, climb: 0.1 }, query: "?bank=left", hash: "" },
  { label: "right vector", tick: 64, readiness: 0.6, input: { thrust: 0.75, bank: 0.8, climb: 0.2 }, query: "?bank=right", hash: "" },
  { label: "high climb", tick: 80, readiness: 0.7, input: { thrust: 0.8, bank: 0.15, climb: 1 }, query: "?climb=1", hash: "" },
  { label: "descent correction", tick: 96, readiness: 0.64, input: { thrust: 0.35, bank: -0.2, climb: -0.9 }, query: "", hash: "#down" },
  { label: "pointer rehearsal", tick: 112, readiness: 0.77, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { label: "handoff primed", tick: 128, readiness: 0.88, input: { thrust: 1, bank: 0.1, climb: 0.4, launch: true }, query: "?handoff=1", hash: "#ready" },
  { label: "full ready", tick: 160, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const routePreview = {
  readiness: 0.72,
  windShearForecast: {
    cells: [
      { drift: -0.2 },
      { drift: 0.1 },
      { drift: 0.34 }
    ]
  },
  rendererHandoff: {
    descriptorCounts: {
      waypoints: 5,
      windShearCells: 3,
      handoffPackets: 5,
      altitudeBands: 6
    }
  }
};

assert.ok(SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE.includes("sora-flightplan-readability-domain"));
assert.ok(SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE.includes("renderer consumes descriptors only"));
assert.ok(SORA_FLIGHTPLAN_READABILITY_DOMAIN_TREE.includes("sora-runway-vector-lattice-kit"));

const rehearsalKit = createSoraLaunchRehearsalDomainKit();
const runwayKit = createSoraRunwayVectorLatticeKit();
const energyKit = createSoraEnergyBudgetRibbonKit();
const cloudKit = createSoraCloudCoverSlitKit();
const laneKit = createSoraLaunchLaneChoiceKit();
const riskKit = createSoraRiskRewardCardKit();
const anchorKit = createSoraReturnAnchorKit();
const handoffKit = createSoraFlightplanRendererHandoffKit();
const domainKit = createSoraFlightplanReadabilityDomainKit();

for (const intake of cases) {
  const launchRehearsal = rehearsalKit.describe({ ...intake, routePreview });
  const input = { ...intake, routePreview, launchRehearsal };
  const runwayVectors = runwayKit.describe(input);
  const energyBudget = energyKit.describe(input);
  const cloudCoverSlits = cloudKit.describe(input);
  const launchLaneChoices = laneKit.describe(input);
  const riskRewardCards = riskKit.describe(input);
  const returnAnchors = anchorKit.describe(input);
  const rendererHandoff = handoffKit.describe({ runwayVectors, energyBudget, cloudCoverSlits, launchLaneChoices, riskRewardCards, returnAnchors });
  const domain = domainKit.describe(input);

  assert.ok(runwayVectors.vectors.length >= 5, `${intake.label}: runway vectors`);
  assert.equal(energyBudget.segments.length, 5, `${intake.label}: energy budget segments`);
  assert.ok(cloudCoverSlits.slits.length >= 4, `${intake.label}: cloud slits`);
  assert.ok(launchLaneChoices.lanes.length >= 3, `${intake.label}: launch lanes`);
  assert.equal(riskRewardCards.cards.length, 3, `${intake.label}: risk cards`);
  assert.ok(returnAnchors.anchors.length >= 3, `${intake.label}: return anchors`);
  assert.equal(rendererHandoff.contract, "renderer consumes descriptors only", `${intake.label}: handoff contract`);
  assert.ok(rendererHandoff.forbiddenOwnership.includes("WebGL ownership"), `${intake.label}: ownership boundary`);
  assert.deepEqual(JSON.parse(JSON.stringify(domain)).summary, domain.summary, `${intake.label}: serializable summary`);
  assert.equal(domain.rendererHandoff.descriptorCounts.energySegments, 5, `${intake.label}: composite descriptor count`);
}

const snapshot = domainKit.snapshot({ ...cases.at(-1), routePreview, launchRehearsal: rehearsalKit.describe({ ...cases.at(-1), routePreview }) });
assert.equal(snapshot.descriptorCounts.riskRewardCards, 3);
assert.ok(snapshot.summary.linkedReturnAnchors >= 1);

console.log("sora flightplan readability domain kit smoke passed", { cases: cases.length, checkedSurfaces: 10 });
