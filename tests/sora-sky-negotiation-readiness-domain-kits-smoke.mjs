import assert from "node:assert/strict";
import { createSoraLaunchRehearsalDomainKit } from "../experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js";
import { createSoraFlightplanReadabilityDomainKit } from "../experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js";
import {
  SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE,
  createSoraJetstreamBraidKit,
  createSoraStormShelfWarningKit,
  createSoraThermalLadderChoiceKit,
  createSoraGlideSafePocketKit,
  createSoraHandoffConfidenceRailKit,
  createSoraReturnVowThreadKit,
  createSoraSkyNegotiationRendererHandoffKit,
  createSoraSkyNegotiationReadinessDomainKit
} from "../experiments/_kits/sora-the-infinite/sora-sky-negotiation-readiness-domain-kits.js";

const cases = [
  { label: "idle cold", tick: 0, readiness: 0.18, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { label: "query preserved", tick: 16, readiness: 0.32, input: { thrust: 0.15, bank: 0, climb: 0 }, query: "?seed=one", hash: "" },
  { label: "build lift", tick: 32, readiness: 0.45, input: { thrust: 1, bank: 0, climb: 0.2 }, query: "", hash: "#lift" },
  { label: "hard left braid", tick: 48, readiness: 0.55, input: { thrust: 0.7, bank: -0.8, climb: 0.1 }, query: "?bank=left", hash: "" },
  { label: "hard right braid", tick: 64, readiness: 0.6, input: { thrust: 0.75, bank: 0.8, climb: 0.2 }, query: "?bank=right", hash: "" },
  { label: "high climb ladder", tick: 80, readiness: 0.7, input: { thrust: 0.8, bank: 0.15, climb: 1 }, query: "?climb=1", hash: "" },
  { label: "descent storm shelf", tick: 96, readiness: 0.64, input: { thrust: 0.35, bank: -0.2, climb: -0.9 }, query: "", hash: "#down" },
  { label: "pointer route", tick: 112, readiness: 0.77, input: { thrust: 0.55, bank: 0.34, climb: 0.44, pointerActive: true, pointerX: 0.67, pointerY: 0.28 }, query: "?pointer=1", hash: "" },
  { label: "handoff primed", tick: 128, readiness: 0.88, input: { thrust: 1, bank: 0.1, climb: 0.4, launch: true }, query: "?handoff=1", hash: "#ready" },
  { label: "full ready", tick: 160, readiness: 1, input: { thrust: 1, bank: 0, climb: 1, launch: true }, query: "?ready=1", hash: "#open" }
];

const routePreview = {
  readiness: 0.72,
  continuityGate: { open: true },
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

assert.ok(SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE.includes("sora-sky-negotiation-readiness-domain"));
assert.ok(SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE.includes("sora-jetstream-braid-kit"));
assert.ok(SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE.includes("renderer consumes descriptors only"));

const rehearsalKit = createSoraLaunchRehearsalDomainKit();
const flightplanKit = createSoraFlightplanReadabilityDomainKit();
const jetstreamKit = createSoraJetstreamBraidKit();
const stormKit = createSoraStormShelfWarningKit();
const thermalKit = createSoraThermalLadderChoiceKit();
const glideKit = createSoraGlideSafePocketKit();
const confidenceKit = createSoraHandoffConfidenceRailKit();
const returnVowKit = createSoraReturnVowThreadKit();
const handoffKit = createSoraSkyNegotiationRendererHandoffKit();
const domainKit = createSoraSkyNegotiationReadinessDomainKit();

for (const intake of cases) {
  const launchRehearsal = rehearsalKit.describe({ ...intake, routePreview });
  const flightplanReadability = flightplanKit.describe({ ...intake, routePreview, launchRehearsal });
  const input = { ...intake, routePreview, launchRehearsal, flightplanReadability };
  const jetstreamBraids = jetstreamKit.describe(input);
  const stormShelfWarnings = stormKit.describe(input);
  const thermalLadderChoices = thermalKit.describe(input);
  const glideSafePockets = glideKit.describe(input);
  const handoffConfidenceRails = confidenceKit.describe(input);
  const returnVowThreads = returnVowKit.describe(input);
  const rendererHandoff = handoffKit.describe({ jetstreamBraids, stormShelfWarnings, thermalLadderChoices, glideSafePockets, handoffConfidenceRails, returnVowThreads });
  const domain = domainKit.describe(input);

  assert.ok(jetstreamBraids.braids.length >= 4, `${intake.label}: jetstream braids`);
  assert.ok(stormShelfWarnings.shelves.length >= 3, `${intake.label}: storm shelves`);
  assert.ok(thermalLadderChoices.rungs.length >= 4, `${intake.label}: thermal ladder rungs`);
  assert.ok(glideSafePockets.pockets.length >= 3, `${intake.label}: glide pockets`);
  assert.equal(handoffConfidenceRails.rails.length, 5, `${intake.label}: confidence rails`);
  assert.ok(returnVowThreads.threads.length >= 3, `${intake.label}: return vows`);
  assert.equal(rendererHandoff.contract, "renderer consumes descriptors only", `${intake.label}: renderer handoff contract`);
  assert.ok(rendererHandoff.forbiddenOwnership.includes("frame-loop ownership"), `${intake.label}: frame loop boundary`);
  assert.deepEqual(JSON.parse(JSON.stringify(domain)).summary, domain.summary, `${intake.label}: serializable summary`);
  assert.equal(domain.rendererHandoff.descriptorCounts.confidenceRails, 5, `${intake.label}: composed descriptor counts`);
}

const snapshot = domainKit.snapshot({ ...cases.at(-1), routePreview, launchRehearsal: rehearsalKit.describe({ ...cases.at(-1), routePreview }), flightplanReadability: flightplanKit.describe({ ...cases.at(-1), routePreview, launchRehearsal: rehearsalKit.describe({ ...cases.at(-1), routePreview }) }) });
assert.equal(snapshot.descriptorCounts.confidenceRails, 5);
assert.ok(snapshot.summary.sealedReturnVows >= 1);

console.log("sora sky negotiation readiness domain kit smoke passed", { cases: cases.length, checkedSurfaces: 10 });
