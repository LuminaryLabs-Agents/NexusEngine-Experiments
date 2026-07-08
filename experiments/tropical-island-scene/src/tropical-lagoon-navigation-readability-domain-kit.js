const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const safeArray = (value) => Array.isArray(value) ? value : [];
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const positionFrom = (entry = {}, fallback = {}) => ({
  x: scalarFrom(entry.position?.x ?? entry.x, fallback.x ?? 0),
  y: scalarFrom(entry.position?.y ?? entry.y, fallback.y ?? 0),
  z: scalarFrom(entry.position?.z ?? entry.z, fallback.z ?? 0)
});
const projectLagoon = (position = {}, orbit = 0, scale = 1) => {
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = scalarFrom(position.x, 0) * c - scalarFrom(position.z, 0) * s;
  const z = scalarFrom(position.x, 0) * s + scalarFrom(position.z, 0) * c;
  const y = scalarFrom(position.y, 0);
  return { x: round((x / 38) * scale), y: round((-0.14 + y / 20 - z / 96) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable lagoon navigation descriptors only",
  rendererMustNotOwn: ["route state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE = `tropical-lagoon-navigation-readability-domain
├─ water-reading-domain
│  ├─ reef-depth-contour-domain
│  │  └─ lagoon-reef-depth-contour-kit
│  └─ current-vector-domain
│     └─ lagoon-current-vector-fan-kit
├─ safe-route-domain
│  ├─ swim-safety-cone-domain
│  │  └─ lagoon-swim-safety-cone-kit
│  └─ raft-return-domain
│     └─ lagoon-raft-return-wake-kit
├─ discovery-window-domain
│  ├─ snorkel-score-domain
│  │  └─ lagoon-snorkel-point-score-kit
│  └─ sun-glare-domain
│     └─ lagoon-sun-glare-timing-band-kit
└─ renderer-handoff
   └─ lagoon-navigation-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createLagoonReefDepthContourKit(options = {}) {
  const id = "lagoon-reef-depth-contour-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const pulse = 0.5 + Math.sin(time * 0.42 + index * 0.8 + orbit * 0.35) * 0.5;
        return {
          id: `${id}-${index}`,
          kind: "lagoon-reef-depth-contour",
          center: { x: round(Math.sin(orbit * 0.5 + index * 0.34) * 0.035), y: round(-0.12 - lane * 0.15) },
          radius: { x: round(0.34 + lane * 0.22), y: round(0.09 + lane * 0.06) },
          depthBand: index,
          contourScore: round(0.28 + pulse * 0.58),
          opacity: round(0.08 + pulse * 0.16),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonSwimSafetyConeKit(options = {}) {
  const id = "lagoon-swim-safety-cone-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const angle = -1.2 + lane * 2.4 + orbit * 0.2;
        const safety = 0.42 + hash01(index, 4) * 0.28 + Math.sin(time * 0.33 + index) * 0.08;
        return {
          id: `${id}-${index}`,
          kind: "lagoon-swim-safety-cone",
          start: { x: round(Math.cos(angle) * 0.10), y: round(-0.15 + Math.sin(angle) * 0.03) },
          end: { x: round(Math.cos(angle) * (0.34 + lane * 0.22)), y: round(-0.24 + Math.sin(angle) * 0.14) },
          width: round(0.012 + lane * 0.004),
          safety: round(clamp01(safety)),
          opacity: round(0.18 + clamp01(safety) * 0.26),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonCurrentVectorFanKit(options = {}) {
  const id = "lagoon-current-vector-fan-kit";
  const count = Math.max(5, Math.min(9, Math.floor(options.count ?? 7)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const base = { x: round(lane * 0.68), y: round(-0.30 + Math.sin(index + orbit) * 0.035) };
        const force = 0.24 + hash01(index, 7) * 0.48 + Math.sin(time * 0.48 + index) * 0.08;
        return {
          id: `${id}-${index}`,
          kind: "lagoon-current-vector",
          start: base,
          end: { x: round(base.x + Math.cos(orbit + index * 0.2) * (0.05 + force * 0.06)), y: round(base.y + 0.03 + Math.sin(orbit + index * 0.13) * 0.025) },
          force: round(clamp01(force)),
          width: round(0.004 + force * 0.006),
          opacity: round(0.16 + force * 0.26),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonSnorkelPointScoreKit(options = {}) {
  const id = "lagoon-snorkel-point-score-kit";
  const maxCount = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      const fish = safeArray(input.fish).slice(0, maxCount);
      const fallbacks = Array.from({ length: maxCount }, (_, index) => ({ id: `snorkel-fallback-${index}`, x: -9 + index * 3.2, y: -1.1, z: -12 - index * 2.4, scale: 1 }));
      return (fish.length ? fish : fallbacks).slice(0, maxCount).map((entry, index) => {
        const p = projectLagoon(positionFrom(entry, fallbacks[index]), orbit, 1);
        const score = 0.35 + scalarFrom(entry.scale, 1) * 0.18 + hash01(index, 9) * 0.22;
        const pulse = 0.5 + Math.sin(time * 0.8 + index * 0.6) * 0.5;
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "lagoon-snorkel-point-score",
          position: { x: p.x, y: round(p.y - 0.015) },
          radius: round(0.035 + pulse * 0.018),
          score: round(clamp01(score)),
          opacity: round(0.2 + pulse * 0.26),
          depth: p.depth,
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonRaftReturnWakeKit(options = {}) {
  const id = "lagoon-raft-return-wake-kit";
  const maxCount = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const props = safeArray(input.floatProps).slice(0, maxCount);
      const fallbacks = Array.from({ length: maxCount }, (_, index) => ({ id: `raft-fallback-${index}`, x: -14 + index * 5.4, y: 0, z: -20 - index * 3, scale: 1 }));
      return (props.length ? props : fallbacks).slice(0, maxCount).map((entry, index) => {
        const p = projectLagoon(positionFrom(entry, fallbacks[index]), orbit, 1);
        const anchor = { x: round(Math.max(-0.42, Math.min(0.42, p.x * 0.35))), y: round(-0.14 + (index % 3) * 0.035) };
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "lagoon-raft-return-wake",
          start: { x: p.x, y: p.y },
          end: anchor,
          urgency: round(0.35 + hash01(index, 11) * 0.5),
          width: round(0.006 + scalarFrom(entry.scale, 1) * 0.003),
          opacity: round(0.18 + (index % 4) * 0.05),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonSunGlareTimingBandKit(options = {}) {
  const id = "lagoon-sun-glare-timing-band-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const phase = 0.5 + Math.sin(time * 0.25 + orbit + index * 0.85) * 0.5;
        return {
          id: `${id}-${index}`,
          kind: "lagoon-sun-glare-timing-band",
          start: { x: round(-0.56 + index * 0.32), y: round(-0.44 - index * 0.012) },
          end: { x: round(-0.30 + index * 0.32), y: round(-0.30 + index * 0.016) },
          glare: round(phase),
          safeWindow: round(1 - phase * 0.72),
          width: round(0.009 + phase * 0.006),
          opacity: round(0.12 + phase * 0.18),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createLagoonNavigationRendererHandoffKit() {
  const id = "lagoon-navigation-renderer-handoff-kit";
  return {
    id,
    describe({ reefContours = [], swimSafetyCones = [], currentVectors = [], snorkelScores = [], raftReturnWakes = [], sunGlareBands = [] } = {}) {
      const descriptors = { reefContours, swimSafetyCones, currentVectors, snorkelScores, raftReturnWakes, sunGlareBands };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalLagoonNavigationReadabilityDomainKit(options = {}) {
  const reefKit = createLagoonReefDepthContourKit(options.reefContours);
  const swimKit = createLagoonSwimSafetyConeKit(options.swimSafetyCones);
  const currentKit = createLagoonCurrentVectorFanKit(options.currentVectors);
  const snorkelKit = createLagoonSnorkelPointScoreKit(options.snorkelScores);
  const raftKit = createLagoonRaftReturnWakeKit(options.raftReturnWakes);
  const glareKit = createLagoonSunGlareTimingBandKit(options.sunGlareBands);
  const handoffKit = createLagoonNavigationRendererHandoffKit();
  const id = "tropical-lagoon-navigation-readability-domain-kit";
  return {
    id,
    domainTree: TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE,
    kits: [reefKit, swimKit, currentKit, snorkelKit, raftKit, glareKit, handoffKit],
    describe(input = {}) {
      const reefContours = reefKit.describe(input);
      const swimSafetyCones = swimKit.describe(input);
      const currentVectors = currentKit.describe(input);
      const snorkelScores = snorkelKit.describe(input);
      const raftReturnWakes = raftKit.describe(input);
      const sunGlareBands = glareKit.describe(input);
      const rendererHandoff = handoffKit.describe({ reefContours, swimSafetyCones, currentVectors, snorkelScores, raftReturnWakes, sunGlareBands });
      return {
        id,
        kind: "tropical-lagoon-navigation-readability-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_LAGOON_NAVIGATION_DOMAIN_TREE,
        subdomains: {
          waterReading: { kits: [reefKit.id, currentKit.id], descriptors: { reefContours, currentVectors } },
          safeRoute: { kits: [swimKit.id, raftKit.id], descriptors: { swimSafetyCones, raftReturnWakes } },
          discoveryWindow: { kits: [snorkelKit.id, glareKit.id], descriptors: { snorkelScores, sunGlareBands } }
        },
        rendererHandoff
      };
    }
  };
}
