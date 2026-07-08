import assert from "node:assert/strict";
import {
  FOGLINE_BLACKOUT_RECOVERY_DOMAIN_TREE,
  FOGLINE_BLACKOUT_RECOVERY_KIT_NAMES,
  createFoglineBlackoutRecoveryReadinessDomainKit,
  createFoglineDawnSwitchWindowKit,
  createFoglineFuseJunctionKit,
  createFoglineGeneratorFuelCacheKit,
  createFoglineLanternChainKit,
  createFoglineRelayRebootCoilKit,
  createFoglineSirenSilencePerimeterKit
} from "../experiments/fogline-relay/src/fogline-blackout-recovery-kits.js";

const route = [
  { x: -10, z: -4 },
  { x: -4, z: 8 },
  { x: 1, z: 18 },
  { x: 8, z: 31 },
  { x: 14, z: 43 }
];

function caseInput(index) {
  const scanBase = (index % 5) / 4;
  return {
    level: {
      bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 48 },
      spawn: route[0],
      gate: route.at(-1),
      route,
      relays: [
        { id: "north", x: -5, z: 7, scanProgress: Math.min(1, scanBase + 0.1) },
        { id: "ridge", x: 2, z: 20, scanProgress: Math.min(1, scanBase + 0.25), scanned: index % 3 === 0 },
        { id: "gate", x: 9, z: 34, scanProgress: Math.min(1, scanBase + 0.42) }
      ],
      wraiths: [
        { id: "w1", x: -8 + index * 0.4, z: 13, mode: index % 2 === 0 ? "chase" : "wander" },
        { id: "w2", x: 6, z: 27 + index * 0.3, mode: index % 4 === 0 ? "chase" : "patrol" }
      ]
    },
    route,
    game: {
      player: { x: -11 + index * 0.7, z: -3 + index, yaw: index * 0.08 },
      gate: route.at(-1),
      stats: { elapsed: 24 + index * 31, timeBudget: 420, scanBursts: index + 1 },
      relays: [
        { id: "north", x: -5, z: 7, scanProgress: Math.min(1, scanBase + 0.1) },
        { id: "ridge", x: 2, z: 20, scanProgress: Math.min(1, scanBase + 0.25), scanned: index % 3 === 0 },
        { id: "gate", x: 9, z: 34, scanProgress: Math.min(1, scanBase + 0.42) }
      ],
      wraiths: [
        { id: "w1", x: -8 + index * 0.4, z: 13, mode: index % 2 === 0 ? "chase" : "wander" },
        { id: "w2", x: 6, z: 27 + index * 0.3, mode: index % 4 === 0 ? "chase" : "patrol" }
      ]
    }
  };
}

const intakeCases = Array.from({ length: 10 }, (_, index) => ({ id: `blackout-case-${index + 1}`, input: caseInput(index) }));

assert.ok(FOGLINE_BLACKOUT_RECOVERY_DOMAIN_TREE.includes("fogline-blackout-recovery-readiness-domain"));
assert.equal(FOGLINE_BLACKOUT_RECOVERY_KIT_NAMES.length, 8);
assert.ok(FOGLINE_BLACKOUT_RECOVERY_KIT_NAMES.includes("fogline-blackout-recovery-readiness-domain-kit"));

const atomicKitFactories = [
  createFoglineFuseJunctionKit,
  createFoglineRelayRebootCoilKit,
  createFoglineLanternChainKit,
  createFoglineSirenSilencePerimeterKit,
  createFoglineGeneratorFuelCacheKit,
  createFoglineDawnSwitchWindowKit
];

for (const factory of atomicKitFactories) {
  const kit = factory();
  for (const entry of intakeCases) {
    const descriptors = kit.describe(entry.input);
    assert.ok(Array.isArray(descriptors), `${kit.id} should emit an array for ${entry.id}`);
    assert.ok(descriptors.length > 0, `${kit.id} should emit descriptors for ${entry.id}`);
    for (const descriptor of descriptors) {
      assert.ok(descriptor.id, `${kit.id} descriptor should have an id`);
      assert.ok(descriptor.archetype, `${kit.id} descriptor should have an archetype`);
      assert.ok(descriptor.compatibleBucket, `${kit.id} descriptor should declare a renderer-compatible bucket`);
      assert.ok(Number.isFinite(descriptor.position.x), `${kit.id} x should be numeric`);
      assert.ok(Number.isFinite(descriptor.position.z), `${kit.id} z should be numeric`);
      assert.equal(JSON.parse(JSON.stringify(descriptor)).id, descriptor.id, `${kit.id} descriptor should be JSON serializable`);
    }
  }
}

const domainKit = createFoglineBlackoutRecoveryReadinessDomainKit();

for (const entry of intakeCases) {
  const domain = domainKit.describe(entry.input);
  assert.equal(domain.id, "fogline-blackout-recovery-readiness-domain", `${entry.id} should expose domain id`);
  assert.ok(domain.tree.includes("renderer consumes descriptors only"), `${entry.id} should expose tree contract`);
  assert.ok(domain.fuseJunctions.length >= 3, `${entry.id} should include fuse junctions`);
  assert.ok(domain.relayRebootCoils.length >= 3, `${entry.id} should include reboot coils`);
  assert.ok(domain.lanternChainThreads.length >= 4, `${entry.id} should include lantern route threads`);
  assert.ok(domain.sirenSilencePerimeters.length >= 1, `${entry.id} should include siren silence perimeter`);
  assert.ok(domain.generatorFuelCaches.length === 3, `${entry.id} should include three fuel caches`);
  assert.ok(domain.dawnSwitchWindows.length === 2, `${entry.id} should include two dawn switch descriptors`);
  assert.ok(domain.drawOrder.length >= 16, `${entry.id} should include a rich draw queue`);
  assert.equal(domain.rendererHandoff.policy, "renderer-consumes-descriptors-only", `${entry.id} handoff should be descriptor-only`);
  assert.equal(domain.rendererHandoff.ownership.renderer, "consume-only", `${entry.id} renderer should be consume-only`);
  assert.equal(domain.rendererHandoff.ownership.dom, "excluded", `${entry.id} reusable domain should exclude DOM ownership`);
  assert.equal(domain.rendererHandoff.ownership.browserInput, "excluded", `${entry.id} reusable domain should exclude browser input`);
  assert.equal(domain.rendererHandoff.ownership.three, "excluded", `${entry.id} reusable domain should exclude Three ownership`);
  assert.equal(domain.rendererHandoff.ownership.webgl, "excluded", `${entry.id} reusable domain should exclude WebGL ownership`);
  assert.equal(domain.rendererHandoff.ownership.audio, "excluded", `${entry.id} reusable domain should exclude audio ownership`);
  assert.equal(domain.rendererHandoff.ownership.assets, "excluded", `${entry.id} reusable domain should exclude asset ownership`);
  assert.equal(domain.rendererHandoff.ownership.frameLoop, "excluded", `${entry.id} reusable domain should exclude frame-loop ownership`);
  assert.equal(domain.rendererHandoff.counts.fuseJunctions, domain.fuseJunctions.length, `${entry.id} counts should mirror fuse junctions`);
  assert.equal(domain.rendererHandoff.counts.dawnSwitchWindows, domain.dawnSwitchWindows.length, `${entry.id} counts should mirror dawn switches`);
  assert.equal(JSON.parse(JSON.stringify(domain)).id, domain.id, `${entry.id} domain should be JSON serializable`);
}

console.log("Fogline blackout recovery readiness kit smoke passed.");
