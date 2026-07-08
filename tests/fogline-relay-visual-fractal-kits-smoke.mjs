import assert from "node:assert/strict";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import {
  FOGLINE_VISUAL_FRACTAL_KIT_NAMES,
  createFoglineCanopyShaftKit,
  createFoglineGateSigilKit,
  createFoglineGroundMottleKit,
  createFoglineRelayAuraKit,
  createFoglineRouteThreadKit,
  createFoglineVisualFractalDomainKit,
  createFoglineWraithEchoKit
} from "../experiments/fogline-relay/src/fogline-visual-fractal-kits.js";

const level = createFoglineRelayLevel();

function makeGame(caseIndex) {
  const scanned = caseIndex % 4;
  const progress = (caseIndex % 10) / 9;
  return {
    player: { x: -4 + caseIndex * 0.9, z: -2 + caseIndex * 4.6, yaw: caseIndex * 0.17, pitch: 0 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? progress : 0
    })),
    gate: { ...level.gate, open: scanned >= 3, openProgress: scanned >= 3 ? progress : scanned / 3 },
    wraiths: level.wraiths.map((wraith, index) => ({
      ...wraith,
      mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol"
    })),
    stats: { scanned, elapsed: caseIndex * 8, damageTaken: caseIndex * 3, rejected: caseIndex }
  };
}

function assertSerializable(value, label) {
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(value))), JSON.stringify(value), `${label} should be JSON serializable`);
}

function assertDescriptorList(list, label) {
  assert.ok(Array.isArray(list), `${label} should be an array`);
  assert.ok(list.length > 0, `${label} should produce descriptors`);
  for (const descriptor of list) {
    assert.ok(descriptor.id, `${label} descriptor should have an id`);
    assert.ok(descriptor.archetype, `${label} descriptor should have an archetype`);
    assert.ok(descriptor.position && Number.isFinite(descriptor.position.x) && Number.isFinite(descriptor.position.z), `${label} descriptor should have finite x/z position`);
    assert.ok(!("mesh" in descriptor), `${label} should not own renderer mesh data`);
    assert.ok(!("material" in descriptor), `${label} should not own renderer material instances`);
    assert.ok(!("dom" in descriptor), `${label} should not own DOM state`);
    assert.ok(!("audio" in descriptor), `${label} should not own audio state`);
  }
  assertSerializable(list, label);
}

const cases = Array.from({ length: 10 }, (_, caseIndex) => ({ level, route: level.route, game: makeGame(caseIndex) }));
const routeKit = createFoglineRouteThreadKit();
const groundKit = createFoglineGroundMottleKit();
const relayKit = createFoglineRelayAuraKit();
const wraithKit = createFoglineWraithEchoKit();
const gateKit = createFoglineGateSigilKit();
const canopyKit = createFoglineCanopyShaftKit();
const domainKit = createFoglineVisualFractalDomainKit();
let checked = 0;

for (const input of cases) {
  const routeThreads = routeKit.describe(input);
  assertDescriptorList(routeThreads, "route thread kit");
  assert.equal(routeThreads.length, level.route.length - 1, "route thread kit should make one segment descriptor per route segment");
  checked += 1;

  const groundMottles = groundKit.describe(input);
  assertDescriptorList(groundMottles, "ground mottle kit");
  assert.equal(groundMottles.length, 18, "ground mottle kit should keep deterministic descriptor count");
  checked += 1;

  const relayAuras = relayKit.describe(input);
  assertDescriptorList(relayAuras, "relay aura kit");
  assert.equal(relayAuras.length, level.relays.length, "relay aura kit should mirror relay count");
  assert.ok(relayAuras.every((aura) => aura.progress >= 0 && aura.progress <= 1));
  checked += 1;

  const wraithEchoes = wraithKit.describe(input);
  assertDescriptorList(wraithEchoes, "wraith echo kit");
  assert.equal(wraithEchoes.length, level.wraiths.length, "wraith echo kit should mirror wraith count");
  assert.ok(wraithEchoes.some((echo) => echo.chase), "each case should include an active chasing echo");
  checked += 1;

  const gateSigils = gateKit.describe(input);
  assertDescriptorList(gateSigils, "gate sigil kit");
  assert.equal(gateSigils.length, 3, "gate sigil kit should make three nested sigils");
  checked += 1;

  const canopyShafts = canopyKit.describe(input);
  assertDescriptorList(canopyShafts, "canopy shaft kit");
  assert.equal(canopyShafts.length, level.relays.length + 1, "canopy shaft kit should cover relays plus gate");
  checked += 1;

  const composite = domainKit.describe(input);
  assertDescriptorList(composite.drawOrder, "visual fractal domain kit");
  assert.equal(composite.routeThreads.length, routeThreads.length);
  assert.equal(composite.groundMottles.length, groundMottles.length);
  assert.equal(composite.relayAuras.length, relayAuras.length);
  assert.equal(composite.wraithEchoes.length, wraithEchoes.length);
  assert.equal(composite.gateSigils.length, gateSigils.length);
  assert.equal(composite.canopyShafts.length, canopyShafts.length);
  checked += 1;
}

assert.deepEqual(FOGLINE_VISUAL_FRACTAL_KIT_NAMES, [
  "fogline-visual-fractal-domain-kit",
  "fogline-route-thread-kit",
  "fogline-ground-mottle-kit",
  "fogline-relay-aura-kit",
  "fogline-wraith-echo-kit",
  "fogline-gate-sigil-kit",
  "fogline-canopy-shaft-kit"
]);
assert.equal(checked, 70, "7 changed/new kits should each receive 10 smoke intake cases");

console.log("Fogline Relay visual fractal kits smoke passed with 70 intake cases.");
