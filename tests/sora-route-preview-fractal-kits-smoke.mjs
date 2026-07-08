import assert from "node:assert/strict";
import {
  createSoraAltitudeEnvelopeKit,
  createSoraCompatibilityDomainKit,
  createSoraHandoffPacketKit,
  createSoraWaypointRibbonKit,
  createSoraWindShearForecastKit,
  SORA_ROUTE_PREVIEW_DOMAIN_TREE
} from "../experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js";

const intakeCases = [
  { tick: 0, readiness: 0.1, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 8, readiness: 0.2, input: { thrust: 1, bank: -1, climb: 0.3 }, query: "?seed=left", hash: "#ridge" },
  { tick: 16, readiness: 0.32, input: { thrust: 0.6, bank: 1, climb: -0.4 }, query: "?seed=right", hash: "" },
  { tick: 32, readiness: 0.45, input: { pointerActive: true, pointerX: 0.08, pointerY: 0.72 }, query: "", hash: "#low" },
  { tick: 64, readiness: 0.58, input: { pointerActive: true, pointerX: 0.9, pointerY: 0.16 }, query: "?wind=high", hash: "#high" },
  { tick: 96, readiness: 0.7, input: { thrust: 1, bank: 0.25, climb: 1, launch: true }, query: "", hash: "" },
  { tick: 128, readiness: 0.82, input: { thrust: 0, bank: -0.25, climb: -1 }, query: "?debug=1", hash: "#handoff" },
  { tick: 192, readiness: 0.94, input: { thrust: 1, bank: 0, climb: 0, launch: true }, query: "?profile=sora", hash: "#launch" },
  { tick: 256, readiness: -5, input: { thrust: 3, bank: -4, climb: 2 }, query: "?clamp=true", hash: "#safe" },
  { tick: 512, readiness: 5, input: { thrust: -3, bank: 4, climb: -2, pointerX: 2, pointerY: -1 }, query: "?clamp=max", hash: "#safe" }
];

const windKit = createSoraWindShearForecastKit();
const waypointKit = createSoraWaypointRibbonKit();
const packetKit = createSoraHandoffPacketKit();
const altitudeKit = createSoraAltitudeEnvelopeKit();
const domainKit = createSoraCompatibilityDomainKit({ targetPath: "../the-open-above/" });

assert.ok(SORA_ROUTE_PREVIEW_DOMAIN_TREE.includes("sora-wind-shear-forecast-kit"), "domain tree records wind shear kit");
assert.ok(SORA_ROUTE_PREVIEW_DOMAIN_TREE.includes("renderer consumes descriptors only"), "domain tree records renderer handoff boundary");

for (const [index, input] of intakeCases.entries()) {
  const wind = windKit.describe(input);
  const waypoints = waypointKit.describe(input);
  const packets = packetKit.describe(input);
  const altitude = altitudeKit.describe(input);
  const domain = domainKit.describe(input);

  assert.equal(wind.kind, "wind-shear-forecast", `case ${index} wind kind`);
  assert.equal(wind.cells.length, 7, `case ${index} wind cell count`);
  assert.ok(wind.cells.every((cell) => cell.kind === "wind-shear-cell"), `case ${index} wind cell kinds`);
  assert.ok(wind.cells.every((cell) => cell.strength >= 0 && cell.strength <= 1), `case ${index} wind strength clamps`);

  assert.equal(waypoints.kind, "waypoint-ribbon", `case ${index} waypoint kind`);
  assert.equal(waypoints.waypoints.length, 5, `case ${index} waypoint count`);
  assert.ok(waypoints.waypoints.some((point) => point.label === "alias"), `case ${index} alias waypoint`);
  assert.ok(waypoints.waypoints.some((point) => point.label === "open-above"), `case ${index} target waypoint`);

  assert.equal(packets.kind, "handoff-packets", `case ${index} packet kind`);
  assert.equal(packets.packets.length, 5, `case ${index} packet count`);
  assert.ok(packets.packets.some((packet) => packet.id === "packet-target" && packet.ready), `case ${index} target packet ready`);

  assert.equal(altitude.kind, "altitude-envelope", `case ${index} altitude kind`);
  assert.equal(altitude.bands.length, 6, `case ${index} altitude band count`);
  assert.ok(altitude.bands.every((band) => band.kind === "altitude-envelope-band"), `case ${index} altitude band kind`);

  assert.equal(domain.rendererHandoff.descriptorCounts.windShearCells, 7, `case ${index} domain wind count`);
  assert.equal(domain.rendererHandoff.descriptorCounts.waypoints, 5, `case ${index} domain waypoint count`);
  assert.equal(domain.rendererHandoff.descriptorCounts.handoffPackets, 5, `case ${index} domain packet count`);
  assert.equal(domain.rendererHandoff.descriptorCounts.altitudeBands, 6, `case ${index} domain altitude count`);
  assert.equal(domain.rendererHandoff.contract, "renderer consumes descriptors only", `case ${index} renderer contract`);
  assert.doesNotThrow(() => JSON.stringify(domain), `case ${index} domain serializable`);

  const serialized = JSON.stringify(domain);
  assert.ok(!serialized.includes("new THREE"), `case ${index} no Three ownership`);
  assert.ok(!serialized.includes("document.create"), `case ${index} no DOM creation`);
  assert.ok(!serialized.includes("requestAnimationFrame"), `case ${index} no frame-loop ownership`);
}

const snapshot = domainKit.snapshot(intakeCases[7]);
assert.equal(snapshot.preview.windShearCells, 7);
assert.equal(snapshot.preview.waypoints, 5);
assert.equal(snapshot.preview.handoffPackets, 5);
assert.equal(snapshot.preview.altitudeBands, 6);

console.log(`Sora route preview fractal kit smoke passed ${intakeCases.length} intake cases.`);
