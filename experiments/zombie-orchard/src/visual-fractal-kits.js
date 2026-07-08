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
const positionId = (position = {}) => `${Math.round(n(position.x) * 10)}:${Math.round(n(position.z ?? position.y) * 10)}`;

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

export function createOrchardGroundTextureKit(options = {}) {
  const seed = options.seed ?? "zombie-orchard-ground";
  const palette = options.palette ?? {
    furrow: "#261c10",
    leaf: "#7b4a1f",
    mud: "#2b2118"
  };
  return {
    id: "orchard-ground-texture-kit",
    domain: "orchard.ground.texture",
    describe(orchard = {}, snapshot = {}) {
      const width = n(orchard.width, 76);
      const depth = n(orchard.depth, 104);
      const rows = orchard.treeRows ?? [];
      const pressure = clamp01(snapshot.horde?.pressure01 ?? snapshot.horde?.pressure ?? 0);
      const patchCount = Math.max(10, Math.floor(width / 4));
      return {
        id: "orchard-ground-texture",
        baseColor: pressure > 0.65 ? "#151008" : "#111608",
        furrows: rows.map((row, index) => ({
          id: `ground-furrow:${row.id ?? index}`,
          type: "furrow",
          center: { x: 0, z: n(row.z ?? row.centerZ ?? row.position?.z, index * 6 - depth / 2) },
          width: 1.05 + wave01(seed, index, 1) * 0.7,
          length: width * (0.82 + wave01(seed, index, 2) * 0.12),
          rotation: (wave01(seed, index, 3) - 0.5) * 0.05,
          color: palette.furrow,
          opacity: 0.16 + pressure * 0.08
        })),
        leafPatches: Array.from({ length: patchCount }, (_, index) => ({
          id: `ground-leaf:${index}`,
          type: "leaf-patch",
          center: {
            x: (wave01(seed, index, 4) - 0.5) * width * 0.94,
            z: (wave01(seed, index, 5) - 0.5) * depth * 0.94
          },
          width: 1.1 + wave01(seed, index, 6) * 2.1,
          length: 0.8 + wave01(seed, index, 7) * 2.4,
          rotation: wave01(seed, index, 8) * Math.PI,
          color: palette.leaf,
          opacity: 0.12 + wave01(seed, index, 9) * 0.1
        })),
        mudPatches: Array.from({ length: 8 }, (_, index) => ({
          id: `ground-mud:${index}`,
          type: "mud-patch",
          center: {
            x: (wave01(seed, index, 10) - 0.5) * width * 0.86,
            z: (wave01(seed, index, 11) - 0.5) * depth * 0.86
          },
          width: 2.4 + wave01(seed, index, 12) * 3.8,
          length: 1.3 + wave01(seed, index, 13) * 2.6,
          rotation: wave01(seed, index, 14) * Math.PI,
          color: palette.mud,
          opacity: 0.1 + pressure * 0.08
        }))
      };
    }
  };
}

export function createOrchardFogRibbonKit(options = {}) {
  const seed = options.seed ?? "zombie-orchard-fog-ribbons";
  return {
    id: "orchard-fog-ribbon-kit",
    domain: "atmosphere.fog.ribbon",
    describe(lane = {}, index = 0, lighting = {}) {
      const density = clamp01((n(lighting.fogDensity, 0.02) - 0.018) / 0.034);
      return {
        id: `fog-ribbon:${lane.id ?? positionId(lane.center)}:${index}`,
        center: lane.center ?? lane.position ?? { x: 0, z: n(lane.z, index * 8) },
        width: n(lane.width, 5) * (1.4 + density * 0.6),
        length: n(lane.length, 60) * (0.74 + wave01(seed, index, 1) * 0.2),
        color: density > 0.58 ? "#a9b4d1" : "#7786a2",
        opacity: 0.08 + density * 0.2,
        scrollSpeed: 0.15 + wave01(seed, index, 2) * 0.28
      };
    }
  };
}

export function createOrchardHauntingZoneRingKit(options = {}) {
  return {
    id: "orchard-haunting-zone-ring-kit",
    domain: "hazard.haunting.zone-ring",
    describe(zone = {}, activeZoneId = null) {
      const active = activeZoneId != null && zone.id === activeZoneId;
      return {
        id: zone.id ?? `haunt:${positionId(zone.position)}`,
        position: zone.position ?? { x: 0, z: 0 },
        radius: n(zone.radius, 7),
        active,
        color: active ? "#ff365f" : "#8647b8",
        opacity: active ? 0.46 : 0.18,
        pulseSpeed: active ? 1.2 : 0.48
      };
    }
  };
}

export function createOrchardPickupBeaconKit(options = {}) {
  const palette = options.palette ?? {
    melee: "#ffd168",
    ranged: "#a7d8ff",
    default: "#fff0b8"
  };
  return {
    id: "orchard-pickup-beacon-kit",
    domain: "resource.pickup.beacon",
    describe(pickup = {}, nearestId = null) {
      const weaponId = String(pickup.weaponId ?? pickup.id ?? "gear");
      const ranged = weaponId.includes("bow") || weaponId.includes("gun") || weaponId.includes("rifle");
      const focused = nearestId != null && pickup.id === nearestId;
      return {
        id: pickup.id ?? `pickup:${positionId(pickup.position)}`,
        position: pickup.position ?? { x: 0, z: 0 },
        label: weaponId.replaceAll("-", " "),
        color: ranged ? palette.ranged : palette.melee ?? palette.default,
        ringScale: focused ? 1.65 : 1,
        pulse: focused ? 1 : 0.35,
        opacity: focused ? 0.7 : 0.32
      };
    }
  };
}

export function createOrchardCombatCueKit(options = {}) {
  return {
    id: "orchard-combat-cue-kit",
    domain: "combat.target.cue",
    describe(targetMonster = null, player = {}, weaponLabel = "empty hands") {
      const targetPosition = targetMonster?.position ?? null;
      const playerPosition = player?.position ?? { x: 0, z: 0 };
      const range = targetPosition ? Math.hypot(n(targetPosition.x) - n(playerPosition.x), n(targetPosition.z ?? targetPosition.y) - n(playerPosition.z ?? playerPosition.y)) : 0;
      return {
        id: "orchard-combat-cue",
        weaponLabel,
        targetLock: targetPosition ? {
          id: targetMonster.entity ?? targetMonster.id,
          position: targetPosition,
          range,
          boss: Boolean(targetMonster.boss),
          elite: Boolean(targetMonster.elite),
          color: targetMonster.boss ? "#ff365f" : targetMonster.elite ? "#f0d27b" : "#fff0b8",
          opacity: targetMonster.boss ? 0.72 : 0.46
        } : null,
        playerRing: {
          position: playerPosition,
          radius: weaponLabel === "empty hands" ? 2.6 : 4.1,
          color: weaponLabel === "empty hands" ? "#8f7f58" : "#fff0b8",
          opacity: targetPosition ? 0.16 : 0.08
        }
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
  const ground = options.ground ?? createOrchardGroundTextureKit(options.groundTexture);
  const fog = options.fog ?? createOrchardFogRibbonKit(options.fogRibbons);
  const hauntZones = options.hauntZones ?? createOrchardHauntingZoneRingKit(options.hauntingZones);
  const pickups = options.pickups ?? createOrchardPickupBeaconKit(options.pickupBeacons);
  const combat = options.combat ?? createOrchardCombatCueKit(options.combatCue);
  const threats = options.threats ?? createOrchardThreatSilhouetteKit(options.threatSilhouette);
  const lighting = options.lighting ?? createOrchardTensionLightingKit(options.tensionLighting);
  return {
    id: "zombie-orchard-visual-fractal-domain-kit",
    domain: "zombie-orchard.visual-fractal",
    compose(snapshot = {}) {
      const orchard = snapshot.orchard ?? {};
      const treeRows = orchard.treeRows ?? [];
      const light = lighting.describe(snapshot);
      const flatTrees = treeRows.flatMap((row, rowIndex) => (row.trees ?? []).map((tree, treeIndex) => ({
        ...tree,
        rowIndex,
        treeIndex,
        id: tree.id ?? `tree:${rowIndex}:${treeIndex}`
      })));
      return {
        lighting: light,
        ground: ground.describe(orchard, snapshot),
        lanes: treeRows.map((row, index) => lanes.describe(row, index)),
        fogRibbons: (orchard.fogLanes ?? []).map((lane, index) => fog.describe(lane, index, light)),
        hauntZones: (orchard.hauntedZones ?? []).map((zone) => hauntZones.describe(zone, orchard.haunting?.activeZoneId)),
        pickups: (snapshot.weapons?.pickups ?? []).filter((pickup) => pickup.active !== false).map((pickup) => pickups.describe(pickup, snapshot.nearestWeapon?.id)),
        combatCue: combat.describe(snapshot.targetMonster, snapshot.player, snapshot.weaponLabel),
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
├─ survival-ecology-domain
│  ├─ orchard-row-field-domain
│  │  ├─ orchard-lane-band-kit
│  │  ├─ orchard-ground-texture-kit
│  │  └─ placement/walkability kits
│  ├─ atmosphere-domain
│  │  ├─ lighting-domain
│  │  │  └─ orchard-tension-lighting-kit
│  │  └─ orchard-fog-ribbon-kit
│  ├─ hazard-domain
│  │  └─ orchard-haunting-zone-ring-kit
│  ├─ resource-domain
│  │  ├─ collectible-domain
│  │  │  └─ orchard-apple-glow-kit
│  │  └─ orchard-pickup-beacon-kit
│  ├─ combat-domain
│  │  ├─ orchard-combat-cue-kit
│  │  └─ threat-domain
│  │     └─ orchard-threat-silhouette-kit
│  └─ tree-domain
│     ├─ orchard-trunk-form-kit
│     └─ vegetation.leaf.cluster
│        └─ orchard-leaf-cluster-kit
└─ zombie-orchard-visual-fractal-domain-kit
   └─ renderer descriptor handoff`;
