const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));

function hashSeed(input = "next-ledge") {
  return Array.from(String(input)).reduce((hash, ch) => ((hash << 5) - hash + ch.charCodeAt(0)) | 0, 2166136261) >>> 0;
}

function rand01(seed, index = 0) {
  const x = Math.sin(hashSeed(seed) * 0.0001 + index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function regionFor(snapshot = {}) {
  if (snapshot.completed || snapshot.mode === "won") return "summit";
  if (["falling", "launched", "retracting"].includes(snapshot.mode)) return "danger-fall";
  const stamina01 = n(snapshot.stamina, 100) / Math.max(1, n(snapshot.constants?.maxStamina, 100));
  if (stamina01 < 0.24) return "low-stamina";
  if (n(snapshot.player?.y, 0) > 1600) return "cloud-ascent";
  return "cliff-default";
}

export const NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE = `next-ledge-visual-fractal-domain-kit
├─ cliff-wall-domain
│  ├─ cliff-strata-band-kit
│  │  └─ sediment-line-domain
│  ├─ cliff-crack-vein-kit
│  │  └─ fracture-spark-domain
│  └─ climb-shadow-pocket-kit
├─ anchor-readability-domain
│  ├─ anchor-aura-ring-kit
│  ├─ anchor-marker-glyph-kit
│  └─ rest-summit-beacon-kit
├─ rope-expression-domain
│  ├─ rope-braid-segment-kit
│  └─ rope-spark-knot-kit
├─ ascent-atmosphere-domain
│  ├─ cloud-wisp-strip-kit
│  ├─ moon-haze-gradient-kit
│  └─ danger-fall-streak-kit
└─ renderer descriptor handoff
   └─ no renderer, DOM, input, or runtime ownership`;

export function createCliffStrataBandKit(options = {}) {
  const seed = options.seed ?? "cliff-strata";
  const bandCount = Math.max(3, Math.floor(n(options.bandCount, 9)));
  return {
    id: "cliff-strata-band-kit",
    describe(chunk = {}, index = 0) {
      const height = Math.max(120, n(chunk.h, 420));
      return Array.from({ length: bandCount }, (_, bandIndex) => {
        const t = (bandIndex + 0.5) / bandCount;
        const jitter = (rand01(seed, index * 97 + bandIndex) - 0.5) * 34;
        return {
          id: `strata:${chunk.id ?? index}:${bandIndex}`,
          kind: "cliff-strata-band",
          layer: bandIndex % 3 === 0 ? "mid-static" : "far-static",
          position: { x: n(chunk.x, 0) + jitter, y: n(chunk.y, 0) + height * (t - 0.5), z: -95 - bandIndex * 1.7 },
          width: 220 + rand01(seed, bandIndex + index) * 180,
          thickness: 3 + rand01(seed, bandIndex + 45) * 8,
          alpha: clamp(0.18 + t * 0.34, 0.12, 0.62),
          material: bandIndex % 2 ? "blue-shadow-sediment" : "cold-silver-sediment"
        };
      });
    }
  };
}

export function createCliffCrackVeinKit(options = {}) {
  const seed = options.seed ?? "cliff-crack";
  const crackCount = Math.max(2, Math.floor(n(options.crackCount, 6)));
  return {
    id: "cliff-crack-vein-kit",
    describe(chunk = {}, index = 0) {
      return Array.from({ length: crackCount }, (_, crackIndex) => {
        const length = 42 + rand01(seed, index * 31 + crackIndex) * 180;
        const branchCount = 1 + Math.floor(rand01(seed, crackIndex + 10) * 4);
        return {
          id: `crack:${chunk.id ?? index}:${crackIndex}`,
          kind: "cliff-crack-vein",
          layer: "mid-static",
          origin: { x: n(chunk.x, 0) + (rand01(seed, crackIndex) - 0.5) * 310, y: n(chunk.y, 0) + (rand01(seed, crackIndex + 1) - 0.5) * n(chunk.h, 420), z: -72 },
          length,
          angle: -0.85 + rand01(seed, crackIndex + 2) * 1.7,
          branchCount,
          glow: clamp(n(chunk.danger, 0) * 0.35 + (chunk.type === "summit" ? 0.24 : 0.05), 0.02, 0.7),
          material: "ink-fracture-line"
        };
      });
    }
  };
}

export function createAnchorAuraRingKit(options = {}) {
  const seed = options.seed ?? "anchor-aura";
  return {
    id: "anchor-aura-ring-kit",
    describe(ledge = {}, activeId = null, index = 0) {
      const type = ledge.type ?? "anchor";
      const active = ledge.id === activeId;
      const targetable = ledge.targetable === true || ledge.enabled === true;
      const radius = Math.max(8, n(ledge.r, 9));
      return {
        id: `aura:${ledge.id ?? index}`,
        kind: "anchor-aura-ring",
        layer: "interactive",
        position: { x: n(ledge.x), y: n(ledge.y), z: 6 },
        radius: radius * (active ? 2.2 : type === "summit" ? 2 : 1.55),
        pulse: clamp(0.18 + rand01(seed, index) * 0.18 + (active ? 0.52 : 0) + (targetable ? 0.22 : 0), 0.12, 1),
        styleId: type === "summit" ? "summit-gold" : type === "rest" ? "safe-rest" : active ? "player-readable" : "cliff-default"
      };
    }
  };
}

export function createRopeBraidSegmentKit(options = {}) {
  const segmentLimit = Math.max(4, Math.floor(n(options.segmentLimit, 18)));
  return {
    id: "rope-braid-segment-kit",
    describe(rope = {}, frame = 0) {
      const nodes = Array.isArray(rope.nodes) ? rope.nodes : [];
      const pairs = nodes.slice(0, segmentLimit).map((node, index) => {
        const next = nodes[Math.min(nodes.length - 1, index + 1)] ?? node;
        const dx = n(next.x) - n(node.x);
        const dy = n(next.y) - n(node.y);
        return {
          id: `braid:${index}`,
          kind: "rope-braid-segment",
          start: { x: n(node.x), y: n(node.y), z: n(node.z, 1) + 1.4 },
          end: { x: n(next.x), y: n(next.y), z: n(next.z, 1) + 1.4 },
          twist: Math.sin(index * 1.7 + frame * 0.08),
          length: Math.hypot(dx, dy),
          thickness: 1.4 + (index % 3) * 0.22,
          material: index % 2 ? "cyan-lit-rope-fiber" : "shadow-rope-fiber"
        };
      });
      return pairs.filter((segment) => segment.length > 0.001);
    }
  };
}

export function createCloudWispStripKit(options = {}) {
  const seed = options.seed ?? "cloud-wisp";
  const stripCount = Math.max(4, Math.floor(n(options.stripCount, 12)));
  return {
    id: "cloud-wisp-strip-kit",
    describe(snapshot = {}) {
      const region = regionFor(snapshot);
      const altitude = n(snapshot.player?.y, 0);
      return Array.from({ length: stripCount }, (_, index) => ({
        id: `wisp:${index}`,
        kind: "cloud-wisp-strip",
        layer: index % 3 === 0 ? "near-static" : "far-static",
        position: {
          x: (rand01(seed, index) - 0.5) * 900,
          y: altitude + 260 + index * 96 + (rand01(seed, index + 30) - 0.5) * 80,
          z: index % 3 === 0 ? 36 : -225
        },
        width: 180 + rand01(seed, index + 1) * 360,
        softness: region === "danger-fall" ? 0.34 : region === "summit" ? 0.82 : 0.64,
        drift: -0.04 + rand01(seed, index + 2) * 0.08,
        styleId: region === "summit" ? "summit-gold" : "cloud-ascent"
      }));
    }
  };
}

export function createDangerFallStreakKit(options = {}) {
  const seed = options.seed ?? "danger-streak";
  const maxStreaks = Math.max(4, Math.floor(n(options.maxStreaks, 16)));
  return {
    id: "danger-fall-streak-kit",
    describe(snapshot = {}) {
      const active = ["falling", "launched", "retracting"].includes(snapshot.mode);
      const velocity = Math.abs(n(snapshot.player?.vy, 0)) + Math.abs(n(snapshot.player?.vx, 0)) * 0.35;
      const count = active ? Math.max(4, Math.min(maxStreaks, Math.ceil(velocity * 0.9))) : 0;
      return Array.from({ length: count }, (_, index) => ({
        id: `fall-streak:${index}`,
        kind: "danger-fall-streak",
        layer: "near-static",
        position: { x: n(snapshot.player?.x) + (rand01(seed, index) - 0.5) * 360, y: n(snapshot.player?.y) + rand01(seed, index + 1) * 320, z: 42 },
        length: 70 + velocity * 8 + rand01(seed, index + 2) * 90,
        alpha: clamp(0.18 + velocity * 0.015, 0.18, 0.78),
        styleId: "danger-fall"
      }));
    }
  };
}

export function createNextLedgeVisualFractalDomainKit(options = {}) {
  const cliffStrata = createCliffStrataBandKit(options.cliffStrata);
  const cliffCracks = createCliffCrackVeinKit(options.cliffCracks);
  const anchorAura = createAnchorAuraRingKit(options.anchorAura);
  const ropeBraid = createRopeBraidSegmentKit(options.ropeBraid);
  const cloudWisps = createCloudWispStripKit(options.cloudWisps);
  const fallStreaks = createDangerFallStreakKit(options.fallStreaks);
  return {
    id: "next-ledge-visual-fractal-domain-kit",
    compose(snapshot = {}) {
      const chunks = (snapshot.route?.chunks ?? []).slice(-8);
      const ledges = snapshot.route?.ledges ?? [];
      const activeId = snapshot.currentAnchorId ?? null;
      return {
        version: "next-ledge-visual-fractal-domain-0.1.0",
        kitTree: NEXT_LEDGE_VISUAL_FRACTAL_KIT_TREE,
        region: regionFor(snapshot),
        cliffStrata: chunks.flatMap((chunk, index) => cliffStrata.describe(chunk, index)),
        cliffCracks: chunks.flatMap((chunk, index) => cliffCracks.describe({ ...chunk, danger: regionFor(snapshot) === "danger-fall" ? 1 : 0 }, index)),
        anchorAuras: ledges.map((ledge, index) => anchorAura.describe({ ...ledge, enabled: snapshot.enabledTargetIds?.includes?.(ledge.id) }, activeId, index)),
        ropeBraids: ropeBraid.describe(snapshot.rope, snapshot.frame),
        cloudWisps: cloudWisps.describe(snapshot),
        fallStreaks: fallStreaks.describe(snapshot),
        rendererContract: "renderer may consume descriptors; reusable kit owns no Three.js, DOM, input, or frame loop"
      };
    }
  };
}
