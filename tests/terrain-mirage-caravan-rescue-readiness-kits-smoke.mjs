import assert from "node:assert/strict";
import { createTerrainMirageCaravanRescueReadinessDomainKit } from "../experiments/_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js";

const domain = createTerrainMirageCaravanRescueReadinessDomainKit();
const statuses = new Set(["caravan-secure", "dusk-route-marked", "lost-to-mirage"]);

function sample(tag, index, overrides = {}) {
  const wet = overrides.wet ?? (0.18 + index * 0.045);
  const veg = overrides.veg ?? (0.16 + index * 0.04);
  const temp = overrides.temp ?? (34 - index * 0.8);
  return {
    tag,
    x: index * 420 - 1200,
    z: index * -360 + 900,
    height: overrides.height ?? (640 + index * 42),
    slope: overrides.slope ?? (7 + index * 1.5),
    climate: { rainfallMmYear: 120 + wet * 180, temperatureC: temp, snowlineMeters: 3000, vegetationPotential: veg },
    hydrology: { flow: { wetnessIndex: wet, channelPotential: wet * 0.58 }, stream: { streamOrder: wet > 0.58 ? 1 : 0, drainageDensityKmPerKm2: 0.2 + wet } },
    landform: { landform: overrides.landform ?? "dune-corridor", confidence: 0.52 + wet * 0.32, terrainRuggedness: overrides.slope ? overrides.slope / 48 : 0.22 },
    material: { materialWeights: { bedrock: 0.22, soil: 0.52, wetChannel: wet * 0.3, snow: 0 }, vegetationMask: veg, albedoHint: "caravan-test" }
  };
}

const cases = Array.from({ length: 10 }, (_, index) => ({
  name: `case-${index}`,
  input: {
    time: index * 0.7,
    camera: { position: [index * 80, 980 + index * 10, -index * 120], yaw: index * 0.18, pitch: -0.32 },
    terrain: { focus: { x: index * 80, y: 720, z: -index * 120 }, bands: [] },
    terrainSample: sample("focus", index, { wet: 0.24 + index * 0.03, veg: 0.22 + index * 0.025 }),
    samples: [
      sample("focus", index, { wet: 0.24 + index * 0.03, veg: 0.22 + index * 0.025 }),
      sample("mirage-well-a", index + 1, { wet: 0.38 + index * 0.04, veg: 0.28 + index * 0.03, temp: 31 - index * 0.7, landform: "alluvial-oasis" }),
      sample("shade-oasis-crescent", index + 2, { wet: 0.42 + index * 0.035, veg: 0.35 + index * 0.025, temp: 30 - index * 0.6 }),
      sample("camel-bell-trail", index + 3, { wet: 0.2 + index * 0.025, veg: 0.22 + index * 0.02, slope: 8 + index }),
      sample("dune-stake-windbreak", index + 4, { wet: 0.18 + index * 0.02, veg: 0.2 + index * 0.018, slope: 10 + index }),
      sample("water-cache-basin", index + 5, { wet: 0.35 + index * 0.03, veg: 0.28 + index * 0.025, temp: 29 - index * 0.4 })
    ]
  }
}));

let previousReadiness = 0;
for (const [index, item] of cases.entries()) {
  const described = domain.describe(item.input);
  assert.equal(described.domain, "terrain-mirage-caravan-rescue-readiness-domain", item.name);
  assert.equal(described.domainTree.root, "terrain-mirage-caravan-rescue-readiness-domain", item.name);
  assert.ok(Array.isArray(described.mirageWells) && described.mirageWells.length > 0, item.name);
  assert.ok(Array.isArray(described.shadeSails) && described.shadeSails.length > 0, item.name);
  assert.ok(Array.isArray(described.camelBellTrails) && described.camelBellTrails.length > 0, item.name);
  assert.ok(Array.isArray(described.duneStakeWindbreaks) && described.duneStakeWindbreaks.length > 0, item.name);
  assert.ok(Array.isArray(described.waterSkinCaches) && described.waterSkinCaches.length > 0, item.name);
  assert.equal(described.duskCaravanLedgers.length, 1, item.name);
  assert.ok(described.rendererHandoff.counts.total >= 26, item.name);
  assert.ok(described.summary.readiness >= 0 && described.summary.readiness <= 1, item.name);
  assert.ok(described.summary.heatRisk >= 0 && described.summary.heatRisk <= 1, item.name);
  assert.ok(statuses.has(described.summary.status), item.name);
  assert.doesNotThrow(() => JSON.stringify(described), item.name);
  assert.ok(described.rendererHandoff.rendererContract.rendererMustNotOwn.includes("browser input"), item.name);
  assert.ok(described.rendererHandoff.rendererContract.rendererMustNotOwn.includes("Three.js"), item.name);
  assert.ok(described.rendererHandoff.rendererContract.rendererMustNotOwn.includes("WebGL"), item.name);
  if (index === cases.length - 1) assert.ok(described.summary.readiness >= previousReadiness, "later caravan case should not regress readiness below the first case");
  if (index === 0) previousReadiness = described.summary.readiness;
}

console.log("Terrain mirage caravan rescue readiness kits smoke passed 10 intake cases.");
