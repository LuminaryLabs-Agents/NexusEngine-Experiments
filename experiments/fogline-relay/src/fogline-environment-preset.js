export const FOGLINE_ENVIRONMENT_PRESET_VERSION = "0.0.1";

export const foglineEnvironmentPreset = Object.freeze({
  id: "fogline-dense-forest-v1",
  seed: "fogline-dense-forest-v1",
  terrain: Object.freeze({
    bounds: Object.freeze({ minX: -64, maxX: 64, minZ: -18, maxZ: 96 }),
    groundInset: 0.08,
    maxTreeSlope: 0.72
  }),
  biomes: Object.freeze([
    Object.freeze({ id: "dark-pine", color: "#152318", placementRules: Object.freeze({ density: 1.0, tallRatio: 0.52, fog: 0.75 }) }),
    Object.freeze({ id: "pale-wood", color: "#26312d", placementRules: Object.freeze({ density: 0.72, tallRatio: 0.2, fog: 0.9 }) }),
    Object.freeze({ id: "wet-lowland", color: "#14251f", placementRules: Object.freeze({ density: 0.62, tallRatio: 0.12, fog: 1.0 }) }),
    Object.freeze({ id: "warm-grove", color: "#271719", placementRules: Object.freeze({ density: 0.46, tallRatio: 0.34, fog: 1.15 }) }),
    Object.freeze({ id: "gate-clearing", color: "#203238", placementRules: Object.freeze({ density: 0.28, tallRatio: 0.18, fog: 0.55 }) })
  ]),
  biomeZones: Object.freeze([
    Object.freeze({ biomeId: "dark-pine", center: Object.freeze({ x: -22, z: 12 }), radius: 40, weight: 2.4 }),
    Object.freeze({ biomeId: "pale-wood", center: Object.freeze({ x: 26, z: 26 }), radius: 34, weight: 2.2 }),
    Object.freeze({ biomeId: "wet-lowland", center: Object.freeze({ x: -18, z: 52 }), radius: 36, weight: 2.0 }),
    Object.freeze({ biomeId: "warm-grove", center: Object.freeze({ x: 18, z: 46 }), radius: 28, weight: 2.3 }),
    Object.freeze({ biomeId: "gate-clearing", center: Object.freeze({ x: 0, z: 78 }), radius: 32, weight: 2.6 })
  ]),
  species: Object.freeze([
    Object.freeze({ id: "giant-pine", biomes: Object.freeze({ "dark-pine": 6, "warm-grove": 2 }), scaleRange: Object.freeze([2.6, 5.2]), insetRange: Object.freeze([0.08, 0.28]), crown: "spire", trunkColor: "#0c120d", leafColor: "#182b1d", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "young-pine", biomes: Object.freeze({ "dark-pine": 4, "gate-clearing": 1 }), scaleRange: Object.freeze([0.9, 1.8]), insetRange: Object.freeze([0.04, 0.14]), crown: "spire", trunkColor: "#11170f", leafColor: "#1b3321", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "pale-tree", biomes: Object.freeze({ "pale-wood": 6, "wet-lowland": 2 }), scaleRange: Object.freeze([1.2, 2.7]), insetRange: Object.freeze([0.03, 0.12]), crown: "thin", trunkColor: "#697169", leafColor: "#26352a", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "low-sapling", biomes: Object.freeze({ "wet-lowland": 5, "gate-clearing": 2 }), scaleRange: Object.freeze([0.55, 1.25]), insetRange: Object.freeze([0.02, 0.1]), crown: "round", trunkColor: "#151911", leafColor: "#203d2e", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "bare-column", biomes: Object.freeze({ "warm-grove": 5, "pale-wood": 2 }), scaleRange: Object.freeze([1.6, 3.8]), insetRange: Object.freeze([0.08, 0.22]), crown: "bare", trunkColor: "#24201c", leafColor: "#2b1a1a", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) })
  ]),
  placement: Object.freeze({
    targetInstances: 2200,
    routeClearWidth: 4.8,
    routeShoulderWidth: 11.5,
    minSpacing: 1.35,
    gridStep: 2.15,
    jitter: 1.5,
    farCullDistance: 170
  }),
  lod: Object.freeze({ near: 42, mid: 88, far: 165 })
});
