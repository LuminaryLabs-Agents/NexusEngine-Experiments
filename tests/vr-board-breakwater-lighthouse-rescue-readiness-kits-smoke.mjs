import assert from "node:assert/strict";
import {
  VR_BOARD_BREAKWATER_LIGHTHOUSE_RESCUE_DOMAIN_TREE,
  createStormLampPostKit,
  createWaveSplashMarkerKit,
  createPrismCalibrationRingKit,
  createFoghornTimingBellKit,
  createLifelineRopeLaneKit,
  createDawnLighthouseLedgerKit,
  createVrBoardBreakwaterLighthouseRescueReadinessDomainKit
} from "../experiments/_kits/vr-platformer-board/vr-board-breakwater-lighthouse-rescue-readiness-kits.js";

function makeInput(index) {
  const collectedIds = ["flare-storm-pier", "dry-net-crane", "flare-flooded-dock", "blanket-cache", "skiff-rope"].slice(0, index % 6);
  return {
    level: {
      start: { x: 0, y: 1.08 },
      exit: { id: "skiff-launch-gate", x: 15.4 + index * 0.04, y: 4.62, w: 0.82, h: 1.2 },
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
      ],
      hazards: index === 9 ? [] : [
        { id: "surge-low-water", x: 4.8, y: 1, w: 0.88, h: 0.36 },
        { id: "swinging-crane-hook", x: 7.36 + index * 0.03, y: 2.58, w: 0.78, h: 0.4 },
        { id: "broken-dock-drop", x: 10.86, y: 1.05, w: 0.86, h: 0.36 }
      ]
    },
    avatar: {
      position: { x: 0.06 + index * 1.45, y: index === 8 ? -0.8 : 1.86 + index * 0.11 },
      velocity: { x: index % 2 ? 2.2 : -0.3, y: index % 3 ? -0.2 : 0.4 },
      size: { x: 0.48, y: 0.78 },
      grounded: index % 2 === 0,
      mode: index === 8 ? "fallen" : "alive",
      moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1
    },
    objects: { collectedValue: collectedIds.length, collectedIds },
    weather: { tideLevel: Math.min(0.82, 0.38 + index * 0.045), wind: Math.min(0.72, 0.18 + index * 0.05), rain: 0.52 },
    stormHarborReadiness: { tideRisk: Math.min(0.8, 0.32 + index * 0.05), evacuationReadiness: Math.min(1, index / 9) },
    input: { moveAxis: index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1, jumpPressed: index === 2 || index === 6, restartPressed: index === 9 },
    time: index * 0.37
  };
}

const intakes = Array.from({ length: 10 }, (_, index) => makeInput(index));
const stormLampPostKit = createStormLampPostKit();
const waveSplashMarkerKit = createWaveSplashMarkerKit();
const prismCalibrationRingKit = createPrismCalibrationRingKit();
const foghornTimingBellKit = createFoghornTimingBellKit();
const lifelineRopeLaneKit = createLifelineRopeLaneKit();
const dawnLighthouseLedgerKit = createDawnLighthouseLedgerKit();
const domainKit = createVrBoardBreakwaterLighthouseRescueReadinessDomainKit();

assert.equal(VR_BOARD_BREAKWATER_LIGHTHOUSE_RESCUE_DOMAIN_TREE.root, "vr-board-breakwater-lighthouse-rescue-readiness-domain");
assert.ok(VR_BOARD_BREAKWATER_LIGHTHOUSE_RESCUE_DOMAIN_TREE.contract.includes("renderer consumes descriptors only"));

for (const input of intakes) {
  const lampPosts = stormLampPostKit.describe(input);
  assert.equal(stormLampPostKit.id, "vr-board-storm-lamp-post-kit");
  assert.equal(stormLampPostKit.domain, "vr-board-breakwater-lighthouse-rescue/breakwater-signal/storm-lamp-post");
  assert.equal(lampPosts.length, 5);
  assert.ok(lampPosts.every((lamp) => lamp.glow >= 0 && lamp.glow <= 1));

  const splashMarkers = waveSplashMarkerKit.describe(input);
  assert.equal(waveSplashMarkerKit.id, "vr-board-wave-splash-marker-kit");
  assert.ok(splashMarkers.every((marker) => marker.height >= 0 && marker.height <= 1));
  assert.ok(splashMarkers.every((marker) => ["red", "amber", "blue"].includes(marker.danger)));

  const prismRings = prismCalibrationRingKit.describe(input);
  assert.equal(prismCalibrationRingKit.id, "vr-board-prism-calibration-ring-kit");
  assert.equal(prismRings.length, 4);
  assert.ok(prismRings.every((ring) => ring.focus >= 0 && ring.focus <= 1));

  const foghornBells = foghornTimingBellKit.describe(input);
  assert.equal(foghornTimingBellKit.id, "vr-board-foghorn-timing-bell-kit");
  assert.equal(foghornBells.length, 3);
  assert.ok(foghornBells.every((bell) => ["ring", "wait"].includes(bell.phase)));

  const lifelines = lifelineRopeLaneKit.describe(input);
  assert.equal(lifelineRopeLaneKit.id, "vr-board-lifeline-rope-lane-kit");
  assert.equal(lifelines.length, input.level.platforms.length - 1);
  assert.ok(lifelines.every((lane) => lane.tension >= 0 && lane.tension <= 1));

  const ledger = dawnLighthouseLedgerKit.describe(input, {
    litLampCount: lampPosts.filter((lamp) => lamp.lit).length,
    lampCount: lampPosts.length,
    alignedPrismCount: prismRings.filter((ring) => ring.aligned).length,
    prismCount: prismRings.length
  });
  assert.equal(dawnLighthouseLedgerKit.id, "vr-board-dawn-lighthouse-ledger-kit");
  assert.ok(ledger.readiness >= 0 && ledger.readiness <= 1);
  assert.ok(["light-breakwater", "align-lighthouse-prism", "pull-lifeline-ropes", "guide-survivors-home"].includes(ledger.missionState));

  const domain = domainKit.describe(input);
  assert.equal(domainKit.id, "vr-board-breakwater-lighthouse-rescue-readiness-domain-kit");
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only");
  assert.equal(domain.rendererHandoff.counts.stormLampPosts, 5);
  assert.equal(domain.rendererHandoff.counts.prismCalibrationRings, 4);
  assert.ok(domain.rendererHandoff.counts.total >= 18);
  assert.ok(domain.ownershipBoundary.includes("no-browser-input"));
  assert.ok(domain.ownershipBoundary.includes("no-frame-loop"));
  assert.deepEqual(JSON.parse(JSON.stringify(domain.rendererHandoff.counts)), domain.rendererHandoff.counts);
}

const cold = domainKit.describe(makeInput(0));
const ready = domainKit.describe(makeInput(9));
assert.ok(ready.rescueReadiness >= cold.rescueReadiness);

console.log("VR Board breakwater lighthouse rescue readiness kits smoke passed 10 intake cases.");
