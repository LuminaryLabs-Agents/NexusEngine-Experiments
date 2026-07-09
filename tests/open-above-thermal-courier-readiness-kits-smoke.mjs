import assert from "node:assert/strict";
import { createOpenAboveThermalCourierRescueReadinessDomainKit } from "../experiments/the-open-above/open-above-thermal-courier-readiness-kits.js";

const domain = createOpenAboveThermalCourierRescueReadinessDomainKit();
const cases = [
  { name: "cold boot", frame: 0, elapsed: 0, input: {}, body: { position: { x: 0, y: 120, z: 0 }, speed: 42, altitude: 120, clearance: 80, rotation: { pitch: 0.2, yaw: 0, roll: 0.45 }, velocity: { y: -18 }, stability: { sinkRate: -18 } } },
  { name: "steady cruise", frame: 24, elapsed: 0.8, input: { bankLeft: true }, body: { position: { x: 80, y: 240, z: -160 }, speed: 88, altitude: 240, clearance: 180, rotation: { pitch: 0.04, yaw: 0.25, roll: 0.18 }, velocity: { y: -2 }, stability: { sinkRate: -2 } } },
  { name: "high fast", frame: 64, elapsed: 1.9, input: { pitchDown: true }, body: { position: { x: -240, y: 520, z: -320 }, speed: 144, altitude: 520, clearance: 330, rotation: { pitch: -0.18, yaw: -0.5, roll: -0.22 }, velocity: { y: 4 }, stability: { sinkRate: 4 } } },
  { name: "low sink", frame: 120, elapsed: 3.4, input: { pitchUp: true, boost: true }, body: { position: { x: 340, y: 160, z: -120 }, speed: 70, altitude: 160, clearance: 46, rotation: { pitch: 0.3, yaw: 0.7, roll: 0.32 }, velocity: { y: -26 }, stability: { sinkRate: -26 } } },
  { name: "anchor approach", frame: 180, elapsed: 5.2, input: {}, body: { position: { x: 60, y: 210, z: -90 }, speed: 58, altitude: 210, clearance: 112, rotation: { pitch: 0.03, yaw: 0.08, roll: 0.06 }, velocity: { y: -1 }, stability: { sinkRate: -1 } } },
  { name: "mirror alignment", frame: 240, elapsed: 7.1, input: { bankRight: true }, body: { position: { x: 20, y: 260, z: 620 }, speed: 90, altitude: 260, clearance: 170, rotation: { pitch: 0, yaw: Math.PI, roll: -0.12 }, velocity: { y: 1 }, stability: { sinkRate: 1 } } },
  { name: "thermal weave", frame: 320, elapsed: 9.6, input: { bankLeft: true, pitchUp: true }, body: { position: { x: -420, y: 300, z: -260 }, speed: 96, altitude: 300, clearance: 205, rotation: { pitch: 0.12, yaw: -0.25, roll: 0.24 }, velocity: { y: 5 }, stability: { sinkRate: 5 } } },
  { name: "cargo risk", frame: 400, elapsed: 12.2, input: { boost: true }, body: { position: { x: 650, y: 180, z: 300 }, speed: 150, altitude: 180, clearance: 72, rotation: { pitch: -0.1, yaw: 1.1, roll: 0.48 }, velocity: { y: -32 }, stability: { sinkRate: -32 } } },
  { name: "rescue ready", frame: 480, elapsed: 15.4, input: {}, body: { position: { x: 18, y: 235, z: 38 }, speed: 54, altitude: 235, clearance: 126, rotation: { pitch: 0.02, yaw: -2.72, roll: 0.02 }, velocity: { y: 0 }, stability: { sinkRate: 0 } } },
  { name: "far ledger", frame: 560, elapsed: 18.1, input: { pitchDown: true, bankRight: true }, body: { position: { x: -1100, y: 420, z: 890 }, speed: 118, altitude: 420, clearance: 240, rotation: { pitch: -0.08, yaw: 2.5, roll: -0.2 }, velocity: { y: -4 }, stability: { sinkRate: -4 } } }
];

const results = cases.map((testCase) => domain.compose(testCase));

for (const [index, result] of results.entries()) {
  assert.equal(result.id, "open-above-thermal-courier-rescue-readiness", `${cases[index].name} should identify the readiness result`);
  assert.ok(result.tree.includes("open-above-thermal-courier-rescue-readiness-domain"), `${cases[index].name} should expose the domain tree`);
  assert.equal(result.rendererHandoff.contract, "renderer-consumes-descriptors-only", `${cases[index].name} should keep descriptor-only handoff`);
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `${cases[index].name} should bound readiness`);
  assert.ok(result.summary.risk >= 0 && result.summary.risk <= 1, `${cases[index].name} should bound risk`);
  assert.ok(["rescue-courier-ready", "stabilize-approach", "recover-thermal-route"].includes(result.summary.status), `${cases[index].name} should use a known status`);
  assert.ok(result.rendererHandoff.counts.total >= 27, `${cases[index].name} should produce a rich descriptor set`);
  assert.ok(result.groups.thermalLanternRings.length >= 4, `${cases[index].name} should include lantern rings`);
  assert.ok(result.groups.draftRibbonLanes.length >= 4, `${cases[index].name} should include draft ribbons`);
  assert.ok(result.groups.basketSlingCargos.length >= 3, `${cases[index].name} should include sling cargo`);
  assert.ok(result.groups.landingAnchorBuoys.length >= 3, `${cases[index].name} should include anchor buoys`);
  assert.ok(result.groups.cliffSignalMirrors.length >= 4, `${cases[index].name} should include signal mirrors`);
  assert.ok(result.groups.dawnFlightLedgers.length >= 4, `${cases[index].name} should include dawn ledgers`);
  JSON.parse(JSON.stringify(result));
}

const lowSink = results[cases.findIndex((item) => item.name === "low sink")];
const rescueReady = results[cases.findIndex((item) => item.name === "rescue ready")];
assert.ok(rescueReady.summary.readiness > lowSink.summary.readiness, "prepared rescue approach should improve readiness over low-sink danger");
assert.ok(rescueReady.summary.risk < lowSink.summary.risk, "prepared rescue approach should reduce risk over low-sink danger");
assert.deepEqual(domain.ownershipBoundary, {
  renderer: "excluded",
  dom: "excluded",
  browserInput: "excluded",
  three: "excluded",
  webgl: "excluded",
  audio: "excluded",
  assetLoading: "excluded",
  frameLoop: "excluded",
  physics: "excluded",
  storage: "excluded"
});

console.log("Open Above thermal courier readiness kits smoke passed 10 intake cases.");
