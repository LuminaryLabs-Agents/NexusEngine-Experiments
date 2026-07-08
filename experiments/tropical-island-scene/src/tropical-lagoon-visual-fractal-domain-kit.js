const round = (value, places = 4) => Number(Number.isFinite(value) ? value.toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const positionFrom = (entry = {}, fallback = {}) => ({
  x: scalarFrom(entry.position?.x ?? entry.x, fallback.x ?? 0),
  y: scalarFrom(entry.position?.y ?? entry.y, fallback.y ?? 0),
  z: scalarFrom(entry.position?.z ?? entry.z, fallback.z ?? 0)
});

export function createLagoonDepthShelfKit(options = {}) {
  const id = "lagoon-depth-shelf-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit, 0);
      const tide = 0.5 + Math.sin(scalarFrom(input.time, 0) * 0.23 + orbit) * 0.5;
      return Array.from({ length: count }, (_, index) => {
        const t = index / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "lagoon-depth-shelf",
          center: { x: round(Math.sin(orbit + index * 0.37) * 0.018), y: round(-0.155 - t * 0.105) },
          radius: { x: round(0.58 + t * 0.22), y: round(0.205 + t * 0.085) },
          band: round(t),
          opacity: round(0.12 + tide * 0.08 + (1 - t) * 0.05),
          palette: t < 0.34 ? "wet-sand" : t < 0.68 ? "sea-glass" : "deep-cyan"
        };
      });
    }
  };
}

export function createReefBloomClusterKit(options = {}) {
  const id = "reef-bloom-cluster-kit";
  const count = Math.max(4, Math.min(12, Math.floor(options.count ?? 8)));
  const seed = scalarFrom(options.seed, 17);
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const a = (index / count) * Math.PI * 2 + orbit * 0.18;
        const jitter = hash01(seed, index) - 0.5;
        return {
          id: `${id}-${index}`,
          kind: "reef-bloom",
          position: {
            x: round(Math.cos(a) * (0.38 + hash01(seed + 1, index) * 0.18) + jitter * 0.04),
            y: round(-0.32 - hash01(seed + 2, index) * 0.28)
          },
          radius: round(0.028 + hash01(seed + 3, index) * 0.034),
          intensity: round(0.45 + hash01(seed + 4, index) * 0.42 + Math.sin(time * 0.5 + index) * 0.04),
          palette: index % 3 === 0 ? "coral-gold" : index % 3 === 1 ? "rose-coral" : "reef-violet"
        };
      });
    }
  };
}

export function createCurrentRibbonFieldKit(options = {}) {
  const id = "current-ribbon-field-kit";
  const count = Math.max(4, Math.min(10, Math.floor(options.count ?? 8)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const drift = Math.sin(time * 0.28 + index * 0.9 + orbit) * 0.055;
        return {
          id: `${id}-${index}`,
          kind: "current-ribbon",
          start: { x: round(-0.72 + lane * 1.44 + drift), y: round(-0.68 + lane * 0.34) },
          end: { x: round(-0.55 + lane * 1.25 + drift * 0.45), y: round(-0.54 + lane * 0.28) },
          width: round(0.006 + lane * 0.006),
          speed: round(0.22 + lane * 0.31),
          opacity: round(0.12 + (1 - lane) * 0.11)
        };
      });
    }
  };
}

export function createPalmCanopyMotionKit(options = {}) {
  const id = "palm-canopy-motion-kit";
  const frondCount = Math.max(6, Math.min(14, Math.floor(options.frondCount ?? 10)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit, 0);
      return Array.from({ length: frondCount }, (_, index) => {
        const a = (index / frondCount) * Math.PI * 2 + orbit * 0.2;
        const sway = Math.sin(time * 0.7 + index * 0.65) * 0.12;
        return {
          id: `${id}-${index}`,
          kind: "palm-canopy-frond-shadow",
          anchor: { x: round(-0.16), y: round(0.30) },
          tip: { x: round(-0.16 + Math.cos(a + sway) * 0.25), y: round(0.25 + Math.sin(a) * 0.09) },
          width: round(0.012 + (index % 3) * 0.004),
          sway: round(sway),
          opacity: round(0.18 + Math.max(0, Math.cos(a)) * 0.12)
        };
      });
    }
  };
}

export function createHorizonCloudBankKit(options = {}) {
  const id = "horizon-cloud-bank-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const drift = ((time * 0.015 + lane * 1.7) % 1) - 0.5;
        return {
          id: `${id}-${index}`,
          kind: "horizon-cloud-bank",
          position: { x: round(-0.72 + lane * 1.44 + drift * 0.18), y: round(0.34 + Math.sin(index) * 0.025) },
          width: round(0.18 + hash01(index, 4) * 0.12),
          height: round(0.035 + hash01(index, 8) * 0.028),
          opacity: round(0.16 + hash01(index, 12) * 0.14),
          depth: round(lane)
        };
      });
    }
  };
}

export function createWildlifeWakeTrailKit(options = {}) {
  const id = "wildlife-wake-trail-kit";
  const maxWakes = Math.max(4, Math.min(12, Math.floor(options.count ?? 8)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit, 0);
      const fish = safeArray(input.fish).slice(0, maxWakes);
      const floatProps = safeArray(input.floatProps).slice(0, Math.max(0, maxWakes - fish.length));
      const fishWakes = fish.map((entry, index) => {
        const p = positionFrom(entry, { x: index - 3, z: -8 - index });
        return {
          id: `${id}-fish-${index}`,
          kind: "fish-wake",
          position: { x: round((p.x * Math.cos(orbit) - p.z * Math.sin(orbit)) / 36), y: round(-0.26 - Math.abs(p.z % 18) / 90) },
          length: round(0.05 + scalarFrom(entry.scale, 1) * 0.025),
          opacity: round(0.18 + (index % 4) * 0.035),
          source: "fish"
        };
      });
      const floatWakes = floatProps.map((entry, index) => {
        const p = positionFrom(entry, { x: index * 2, z: -20 - index * 3 });
        return {
          id: `${id}-float-${index}`,
          kind: "float-prop-wake",
          position: { x: round((p.x * Math.cos(orbit) - p.z * Math.sin(orbit)) / 36), y: round(-0.34 - Math.abs(p.z % 22) / 100) },
          length: round(0.08 + scalarFrom(entry.scale, 1) * 0.02),
          opacity: round(0.12 + (index % 3) * 0.04),
          source: "float-prop"
        };
      });
      return [...fishWakes, ...floatWakes].slice(0, maxWakes);
    }
  };
}

export function createTropicalLagoonRendererHandoffKit() {
  const id = "tropical-lagoon-renderer-handoff-kit";
  return {
    id,
    describe({ shelves = [], reefs = [], currents = [], canopy = [], clouds = [], wakes = [] } = {}) {
      const descriptors = { shelves, reefs, currents, canopy, clouds, wakes };
      return {
        id,
        kind: "renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        ownership: {
          renderer: "presentation-only",
          reusableKits: "plain-input-to-plain-descriptor-output",
          forbiddenOwners: ["DOM", "browser-input", "Three.js", "WebGL", "audio", "asset-loading", "frame-loop"]
        },
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length])),
        descriptors
      };
    }
  };
}

export function createTropicalLagoonVisualFractalDomainKit(options = {}) {
  const shelfKit = createLagoonDepthShelfKit(options.shelves);
  const reefKit = createReefBloomClusterKit(options.reefs);
  const currentKit = createCurrentRibbonFieldKit(options.currents);
  const canopyKit = createPalmCanopyMotionKit(options.canopy);
  const cloudKit = createHorizonCloudBankKit(options.clouds);
  const wakeKit = createWildlifeWakeTrailKit(options.wakes);
  const handoffKit = createTropicalLagoonRendererHandoffKit();
  const id = "tropical-lagoon-visual-fractal-domain-kit";
  return {
    id,
    kits: [shelfKit, reefKit, currentKit, canopyKit, cloudKit, wakeKit, handoffKit],
    describe(input = {}) {
      const shelves = shelfKit.describe(input);
      const reefs = reefKit.describe(input);
      const currents = currentKit.describe(input);
      const canopy = canopyKit.describe(input);
      const clouds = cloudKit.describe(input);
      const wakes = wakeKit.describe(input);
      const rendererHandoff = handoffKit.describe({ shelves, reefs, currents, canopy, clouds, wakes });
      return {
        id,
        kind: "tropical-lagoon-visual-fractal-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        subdomains: {
          lagoonBathymetry: { kit: shelfKit.id, descriptors: shelves },
          reefEcology: { kit: reefKit.id, descriptors: reefs },
          currentReadability: { kit: currentKit.id, descriptors: currents },
          canopyMotion: { kit: canopyKit.id, descriptors: canopy },
          horizonAtmosphere: { kit: cloudKit.id, descriptors: clouds },
          wildlifeWakeReadability: { kit: wakeKit.id, descriptors: wakes }
        },
        rendererHandoff
      };
    }
  };
}
