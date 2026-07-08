import assert from "node:assert/strict";
import {
  SORA_LAUNCH_REHEARSAL_DOMAIN_TREE,
  createSoraPreflightChecklistKit,
  createSoraControlConfidenceKit,
  createSoraThermalSlotKit,
  createSoraDriftWarningKit,
  createSoraEntryCountdownKit,
  createSoraTargetGhostKit,
  createSoraLaunchRehearsalRendererHandoffKit,
  createSoraLaunchRehearsalDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";

const cases = [
  { label: "idle cold", tick: 0, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { label: "build lift", tick: 18, readiness: 0.42, input: { thrust: 1, bank: 0, climb: 0.2 }, query: "?seed=lift", hash: "" },
  { label: "left bank", tick: 36, readiness: 0.55, input: { thrust: 0.7, bank: -0.8, climb: 0.1 }, query: "?bank=left", hash: "#cloud" },
  { label: "right bank", tick: 54, readiness: 0.61, input: { thrust: 0.65, bank: 0.9, climb: 0.3 }, query: "?bank=right", hash: "#ridge" },
  { label: "climb hard", tick: 72, readiness: 0.72, input: { thrust: 0.8, bank: 0.2, climb: 1 }, query: "?climb=1", hash: "" },
  { label: "descend correction", tick: 90, readiness: 0.66, input: { thrust: 0.3, bank: -0.2, climb: -1 }, query: "", hash: "#down" },
  { label: "pointer active", tick: 108, readiness: 0.77, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { label: "handoff primed", tick: 126, readiness: 0.84, input: { thrust: 1, bank: 0.1, climb: 0.4, launch: true }, query: "?handoff=1", hash: "#ready" },
  { label: "high drift", tick: 144, readiness: 0.9, input: { thrust: 1, bank: 1, climb: 0.1 }, query: "?drift=high", hash: "" },
  { label: "full ready", tick: 180, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const routePreview = {
  readiness: 0.7,
  windShearForecast: {
    cells: [
      { drift: -0.25 },
      { drift: 0.1 },
      { drift: 0.35 }
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

assert.ok(SORA_LAUNCH_REHEARSAL_DOMAIN_TREE.includes("sora-launch-rehearsal-domain"));
assert.ok(SORA_LAUNCH_REHEARSAL_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const checklistKit = createSoraPreflightChecklistKit();
const confidenceKit = createSoraControlConfidenceKit();
const thermalKit = createSoraThermalSlotKit();
const driftKit = createSoraDriftWarningKit();
const countdownKit = createSoraEntryCountdownKit();
const ghostKit = createSoraTargetGhostKit();
const handoffKit = createSoraLaunchRehearsalRendererHandoffKit();
const domainKit = createSoraLaunchRehearsalDomainKit();

for (const intake of cases) {
  const input = { ...intake, routePreview };
  const preflightChecklist = checklistKit.describe(input);
  const controlConfidence = confidenceKit.describe(input);
  const thermalSlots = thermalKit.describe(input);
  const driftWarnings = driftKit.describe(input);
  const entryCountdown = countdownKit.describe(input);
  const targetGhosts = ghostKit.describe(input);
  const rendererHandoff = handoffKit.describe({ preflightChecklist, controlConfidence, thermalSlots, driftWarnings, entryCountdown, targetGhosts });
  const domain = domainKit.describe(input);

  assert.equal(preflightChecklist.steps.length, 6, `${intake.label}: checklist step count`);
  assert.equal(controlConfidence.axes.length, 4, `${intake.label}: confidence axes`);
  assert.ok(thermalSlots.slots.length >= 4, `${intake.label}: thermal slots`);
  assert.equal(driftWarnings.warnings.length, 3, `${intake.label}: drift warnings`);
  assert.ok(entryCountdown.rings.length >= 3, `${intake.label}: countdown rings`);
  assert.ok(targetGhosts.ghosts.length >= 3, `${intake.label}: target ghosts`);
  assert.equal(rendererHandoff.contract, "renderer consumes descriptors only", `${intake.label}: renderer handoff contract`);
  assert.ok(rendererHandoff.forbiddenOwnership.includes("DOM input ownership"), `${intake.label}: ownership boundary`);
  assert.deepEqual(JSON.parse(JSON.stringify(domain)).summary, domain.summary, `${intake.label}: serializable summary`);
  assert.equal(domain.rendererHandoff.descriptorCounts.checklistSteps, 6, `${intake.label}: composite checklist count`);
}

const snapshot = domainKit.snapshot({ ...cases.at(-1), routePreview });
assert.equal(snapshot.descriptorCounts.checklistSteps, 6);
assert.ok(snapshot.summary.linkedGhosts >= 1);

console.log("sora launch rehearsal domain kit smoke passed", { cases: cases.length, checkedSurfaces: 10 });
