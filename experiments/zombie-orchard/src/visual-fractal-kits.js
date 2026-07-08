const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => {
  const h = hashText(`${seed}:${index}:${salt}`);
  return ((h % 10000) / 10000);
};

export function createOrchardLeafClusterKit(options = {}) {
  const seed = options.seed ?? "zombie-orchard-leaves";
  const palette = options.palette ?? ["#233a16", "#4b521d", "#7f5d20", "#9b3f1e"];
  const count = Math.max(3, Math.floor(n(options.clusterCount, 9)));
  return {
    id: "orchard-leaf-cluster-kit",
    domain: "vegetation.leaf.cluster",
    describe(tree = {}, index = 0) {
      const radius = Math.max(0.8, n(tree.canopyRadius, 2.4));
      return Array.from({ length: count }, (_, i) => {
        const angle = wave01(seed, index, i) * Math.PI * 2;
        const lift = 2.9 + radius * (0.36 + wave01(seed, i, index) * 0.54);
        const spread = radius * (0.22 + wave01(seed, i, 3) * 0.78);
        const scale = radius * (0.34 + wave01(seed, i, 7) * 0.36);
        return {
          id: `${tree.id ?? index}:leaf:${i}`,
          offset: { x: Math.cos(angle) * spread, y: lift, z: Math.sin(angle) * spread },
          scale,
          color: palette[(i + index) % palette.length],
          flutter: wave01(seed, index, i + 13)
        };
      });
    }
  };
}

export function createOrchardTrunkFormKit(options = {}) {
  const seed = options.seed ?? "zombie-orchard-trunks";
  return {
    id: "orchard-trunk-form-kit",
    domain: "vegetation.trunk.form",
    describe(tree = {}, index = 0) {
      const rowLean = n(tree.rowIndex, index) % 2 === 0 ? -1 : 1;
      const lean = rowLean * (0.035 + wave01(seed, index, 4) * 0.09);
      return {
        height: 2.7 + wave01(seed, index, 1) * 1.1,
        baseRadius: 0.25 + wave01(seed, index, 2) * 0.16,
        crownRadius: 0.18 + wave01(seed, index, 3) * 0.13,
        lean,
        barkBands: 5 + Math.floor(wave01(seed, index, 5) * 5)
      };
    }
  };
}

export function createOrchardAppleGlowKit(options = {}) {
  const glowByType = options.glowByType ?? {
    "red-apple": { color: "#df3f38", intensity: 0.24, rarity: "common" },
    "golden-apple": { color: "#ffe06b", intensity: 0.55, rarity: "rare" },
    "moon-apple": { color: "#a7d8ff", intensity: 0.62, rarity: "rare" },
    "glass-apple": { color: "#d6f7ff", intensity: 0.42, rarity: "uncommon" },
    "cider-apple": { color: "#ff9d38", intensity: 0.32, rarity: "uncommon" },
    "black-apple": { color: "#d36bff", intensity: 0.75, rarity: "legendary" }
  };
  return {
    id: "orchard-apple-glow-kit",
    domain: "collectible.apple.glow",
    describe(apple = {}, nearestId = null) {
      const rule = glowByType[apple.typeId] ?? glowByType["red-apple"];
      const focused = nearestId != null && apple.id === nearestId;
      return {
        id: apple.id,
        color: rule.color,
        rarity: apple.rarity ?? rule.rarity,
        emissiveIntensity: rule.intensity + (focused ? 0.34 : 0),
        haloScale: focused ? 1.75 : 1.12,
        bobSpeed: 0.75 + rule.intensity
      };
    }
  };
}

export function createOrchardLaneBandKit(options = {}) {
  const seed = options.seed ?? "zombie-orchard-lanes";
  return {
    id: "orchard-lane-band-kit",
    domain: "navigation.row.lane-band",
    describe(row = {}, index = 0) {
      const z = n(row.z ?? row.centerZ ?? row.position?.z, index * 4);
      return {
        id: `lane-band:${row.id ?? index}`,
        center: { x: n(row.x ?? row.centerX, 0), z },
        width: 3.6 + wave01(seed, index, 1) * 1.2,
        length: 110,
        opacity: 0.06 + wave01(seed, index, 2) * 0.04,
        leafScatter: 14 + Math.floor(wave01(seed, index, 3) * 18)
      };
    }
  };
}

export function createOrchardThreatSilhouetteKit(options = {}) {
  return {
    id: "orchard-threat-silhouette-kit",
    domain: "agent.threat.silhouette",
    describe(monster = {}) {
      const threat = Math.max(0.5, n(monster.threat?.threat, monster.boss ? 5 : monster.elite ? 2 : 1));
      const bossScale = monster.boss ? 1.85 : monster.elite ? 1.22 : 1;
      return {
        id: monster.entity ?? monster.id,
        height: (1.9 + threat * 0.18) * bossScale,
        shoulderScale: (0.78 + threat * 0.08) * bossScale,
        color: monster.boss ? "#ff365f" : monster.elite ? "#f0d27b" : monster.archetypeId === "runner-zombie" ? "#a4f080" : "#87a45f",
        aura: monster.boss ? 0.7 : monster.elite ? 0.38 : 0.16,
        gait: monster.archetypeId === "runner-zombie" ? "lunge" : monster.boss ? "stomp" : "shamble"
      };
    }
  };
}

export function createOrchardTensionLightingKit(options = {}) {
  return {
    id: "orchard-tension-lighting-kit",
    domain: "lighting.tension",
    describe(snapshot = {}) {
      const healthDanger = 1 - clamp01(snapshot.health01 ?? 1);
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const panic = snapshot.danger ? 0.18 : 0;
      const tension = clamp01(healthDanger * 0.58 + pressure * 0.52 + panic);
      return {
        id: "orchard-tension-lighting",
        tension,
        fogDensity: 0.018 + tension * 0.034,
        moonIntensity: 2.2 + tension * 1.1,
        emberIntensity: 0.12 + tension * 0.48,
        vignette: 0.18 + tension * 0.32
      };
    }
  };
}

export function createZombieOrchardVisualFractalDomainKit(options = {}) {
  const leaves = options.leaves ?? createOrchardLeafClusterKit(options.leafCluster);
  const trunks = options.trunks ?? createOrchardTrunkFormKit(options.trunkForm);
  const apples = options.apples ?? createOrchardAppleGlowKit(options.appleGlow);
  const lanes = options.lanes ?? createOrchardLaneBandKit(options.laneBands);
  const threats = options.threats ?? createOrchardThreatSilhouetteKit(options.threatSilhouette);
  const lighting = options.lighting ?? createOrchardTensionLightingKit(options.tensionLighting);
  return {
    id: "zombie-orchard-visual-fractal-domain-kit",
    domain: "zombie-orchard.visual-fractal",
    compose(snapshot = {}) {
      const orchard = snapshot.orchard ?? {};
      const treeRows = orchard.treeRows ?? [];
      const flatTrees = treeRows.flatMap((row, rowIndex) => (row.trees ?? []).map((tree, treeIndex) => ({
        ...tree,
        rowIndex,
        treeIndex,
        id: tree.id ?? `tree:${rowIndex}:${treeIndex}`
      })));
      return {
        lighting: lighting.describe(snapshot),
        lanes: treeRows.map((row, index) => lanes.describe(row, index)),
        trees: flatTrees.map((tree, index) => ({
          id: tree.id,
          position: tree.position,
          trunk: trunks.describe(tree, index),
          leaves: leaves.describe(tree, index)
        })),
        apples: (orchard.activeApples ?? []).map((apple) => apples.describe(apple, snapshot.nearestApple?.id)),
        threats: (snapshot.monsters ?? []).map((monster) => threats.describe(monster))
      };
    }
  };
}

export const ZOMBIE_ORCHARD_VISUAL_KIT_TREE = `zombie-orchard
├─ orchard-row-field-domain
│  ├─ orchard-lane-band-kit
│  └─ placement/walkability kits
├─ tree-domain
│  ├─ orchard-trunk-form-kit
│  └─ vegetation.leaf.cluster
│     └─ orchard-leaf-cluster-kit
├─ collectible-domain
│  └─ orchard-apple-glow-kit
├─ threat-domain
│  └─ orchard-threat-silhouette-kit
├─ lighting-domain
│  └─ orchard-tension-lighting-kit
└─ zombie-orchard-visual-fractal-domain-kit
   └─ renderer descriptor handoff`;
