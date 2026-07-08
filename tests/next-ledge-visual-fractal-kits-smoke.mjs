import assert from "node:assert/strict";
import {
  createAnchorAuraRingKit,
  createCliffCrackVeinKit,
  createCliffStrataBandKit,
  createCloudWispStripKit,
  createDangerFallStreakKit,
  createNextLedgeVisualFractalDomainKit,
  createRopeBraidSegmentKit,
  NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE
} from "../experiments/next-ledge/src/visual-fractal-kits.js";

const cases = Array.from({ length: 10 }, (_, i) => i);

const strata = createCliffStrataBandKit({ seed: "test-strata", bandCount: 6 });
for (const i of cases) {
  const out = strata.describe({ id: `chunk-${i}`, x: i * 4, y: i * 120, h: 260 + i * 30 }, i);
  assert.equal(out.length, 6);
  assert.ok(out.every((band) => band.kind === "cliff-strata-band"));
  assert.ok(out.every((band) => band.width >= 220 && band.thickness >= 3));
}

const cracks = createCliffCrackVeinKit({ seed: "test-cracks", crackCount: 5 });
for (const i of cases) {
  const out = cracks.describe({ id: `chunk-${i}`, x: i, y: i * 70, h: 300, danger: i / 10 }, i);
  assert.equal(out.length, 5);
  assert.ok(out.every((crack) => crack.length >= 42));
  assert.ok(out.every((crack) => crack.branchCount >= 1));
}

const aura = createAnchorAuraRingKit({ seed: "test-aura" });
for (const i of cases) {
  const out = aura.describe({ id: `ledge-${i}`, x: i * 10, y: i * 20, r: 8 + i, type: i % 3 === 0 ? "summit" : i % 2 ? "rest" : "anchor", enabled: i % 2 === 0 }, `ledge-${i === 5 ? 5 : -1}`, i);
  assert.equal(out.id, `aura:ledge-${i}`);
  assert.ok(out.radius >= 12.4);
  assert.ok(out.pulse >= 0.12 && out.pulse <= 1);
}

const rope = createRopeBraidSegmentKit({ segmentLimit: 10 });
for (const i of cases) {
  const nodes = Array.from({ length: 12 }, (_, j) => ({ x: j * 5, y: i * 10 + j * 2, z: 1 }));
  const out = rope.describe({ nodes }, i * 3);
  assert.ok(out.length >= 9);
  assert.ok(out.every((segment) => segment.length > 0));
  assert.ok(out.every((segment) => segment.thickness >= 1.4));
}

const wisps = createCloudWispStripKit({ seed: "test-wisps", stripCount: 8 });
for (const i of cases) {
  const out = wisps.describe({ mode: i % 2 ? "swinging" : "falling", player: { y: i * 280 }, stamina: 80, constants: { maxStamina: 100 } });
  assert.equal(out.length, 8);
  assert.ok(out.every((wisp) => wisp.width >= 180));
  assert.ok(out.every((wisp) => ["cloud-ascent", "summit-gold"].includes(wisp.styleId)));
}

const streaks = createDangerFallStreakKit({ seed: "test-streaks", maxStreaks: 12 });
for (const i of cases) {
  const out = streaks.describe({ mode: i % 2 ? "swinging" : "falling", player: { x: i, y: i * 4, vx: i * 0.5, vy: -4 - i } });
  if (i % 2) assert.equal(out.length, 0);
  else assert.ok(out.length >= 4 && out.length <= 12);
}

const composite = createNextLedgeVisualFractalDomainKit({ cliffStrata: { bandCount: 4 }, cliffCracks: { crackCount: 3 }, cloudWisps: { stripCount: 5 } });
for (const i of cases) {
  const snapshot = {
    frame: i * 8,
    mode: i % 4 === 0 ? "falling" : "swinging",
    currentAnchorId: "ledge-a",
    enabledTargetIds: ["ledge-b"],
    stamina: 70 - i * 3,
    constants: { maxStamina: 100 },
    player: { x: i * 3, y: i * 260, vx: i, vy: -3 - i },
    rope: { nodes: [{ x: 0, y: 0, z: 1 }, { x: i + 10, y: i + 30, z: 1 }, { x: i + 20, y: i + 60, z: 1 }] },
    route: {
      chunks: [{ id: "chunk-a", x: 0, y: i * 100, h: 320 }],
      ledges: [{ id: "ledge-a", x: 0, y: 0, r: 9 }, { id: "ledge-b", x: 20, y: 80, r: 10, type: "rest" }]
    }
  };
  const out = composite.compose(snapshot);
  assert.equal(out.cliffStrata.length, 4);
  assert.equal(out.cliffCracks.length, 3);
  assert.equal(out.anchorAuras.length, 2);
  assert.ok(out.ropeBraids.length >= 2);
  assert.equal(out.cloudWisps.length, 5);
  assert.ok(out.rendererContract.includes("no Three.js"));
}

assert.ok(NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE.includes("cliff-wall-domain"));
assert.ok(NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE.includes("renderer descriptor handoff"));
console.log("next ledge visual fractal kits smoke passed: 70 intake cases");
