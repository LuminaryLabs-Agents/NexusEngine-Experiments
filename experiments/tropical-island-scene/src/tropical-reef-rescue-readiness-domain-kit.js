const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 23.1717 + salt * 37.373) * 43758.5453;
  return x - Math.floor(x);
};
const positionFrom = (entry = {}, fallback = {}) => ({
  x: scalarFrom(entry.position?.x ?? entry.x, fallback.x ?? 0),
  y: scalarFrom(entry.position?.y ?? entry.y, fallback.y ?? 0),
  z: scalarFrom(entry.position?.z ?? entry.z, fallback.z ?? 0)
});
const projectIsland = (position = {}, orbit = 0, scale = 1) => {
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = scalarFrom(position.x, 0) * c - scalarFrom(position.z, 0) * s;
  const z = scalarFrom(position.x, 0) * s + scalarFrom(position.z, 0) * c;
  const y = scalarFrom(position.y, 0);
  return { x: round((x / 42) * scale), y: round((-0.08 + y / 20 - z / 108) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical reef rescue readiness descriptors only",
  rendererMustNotOwn: ["rescue truth", "route state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_REEF_RESCUE_DOMAIN_TREE = `tropical-reef-rescue-readiness-domain
├─ search-signal-domain
│  ├─ distress-signal-domain
│  │  └─ tropical-distress-flare-arc-kit
│  └─ snorkel-search-domain
│     └─ tropical-snorkel-search-lane-kit
├─ rescue-safety-domain
│  ├─ rip-current-domain
│  │  └─ tropical-rip-current-hazard-kit
│  └─ first-aid-cache-domain
│     └─ tropical-first-aid-cache-spark-kit
├─ extraction-routing-domain
│  ├─ raft-anchor-domain
│  │  └─ tropical-raft-anchor-route-kit
│  └─ pier-extraction-domain
│     └─ tropical-extraction-pier-beacon-kit
└─ renderer-handoff
   └─ tropical-reef-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalDistressFlareArcKit(options = {}) {
  const id = "tropical-distress-flare-arc-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const phase = 0.5 + Math.sin(time * 0.42 + orbit * 0.3 + index * 0.9) * 0.5;
        const lane = index / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "tropical-distress-flare-arc",
          center: { x: round(-0.38 + lane * 0.76), y: round(0.04 + Math.sin(orbit + index) * 0.04) },
          radius: round(0.048 + phase * 0.044),
          urgency: round(clamp01(0.35 + phase * 0.55)),
          sweep: round(0.32 + phase * 0.44),
          etaSeconds: round(18 + index * 11 - phase * 6, 1),
          opacity: round(0.16 + phase * 0.32),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalSnorkelSearchLaneKit(options = {}) {
  const id = "tropical-snorkel-search-lane-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const coverage = clamp01(0.45 + Math.cos(time * 0.2 + index * 0.6) * 0.28 + (1 - Math.abs(lane)) * 0.24);
        return {
          id: `${id}-${index}`,
          kind: "tropical-snorkel-search-lane",
          start: { x: round(lane * 0.92), y: round(-0.38 + Math.sin(orbit + index) * 0.025) },
          end: { x: round(lane * 0.46 + Math.sin(time * 0.12 + index) * 0.035), y: round(-0.03 + index * 0.006) },
          coverage: round(coverage),
          missingPatchRisk: round(clamp01(1 - coverage + hash01(index, 2) * 0.14)),
          width: round(0.006 + coverage * 0.008),
          opacity: round(0.14 + coverage * 0.28),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalRipCurrentHazardKit(options = {}) {
  const id = "tropical-rip-current-hazard-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const currentRisk = clamp01(0.28 + hash01(index, 7) * 0.38 + Math.sin(time * 0.36 + orbit + index) * 0.22);
        return {
          id: `${id}-${index}`,
          kind: "tropical-rip-current-hazard",
          center: { x: round(-0.58 + lane * 1.16), y: round(-0.28 - Math.cos(orbit + index) * 0.035) },
          radius: { x: round(0.06 + currentRisk * 0.07), y: round(0.018 + currentRisk * 0.026) },
          currentRisk: round(currentRisk),
          rescueAdvice: currentRisk > 0.62 ? "route-around" : "cross-with-anchor",
          opacity: round(0.13 + currentRisk * 0.32),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalFirstAidCacheSparkKit(options = {}) {
  const id = "tropical-first-aid-cache-spark-kit";
  const maxCount = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      const props = safeArray(input.coconuts ?? input.floatProps ?? input.caches).slice(0, maxCount);
      const fallbacks = Array.from({ length: maxCount }, (_, index) => ({ id: `first-aid-${index}`, x: -14 + index * 6.2, y: 0.8, z: 10 - index * 5, scale: 1 }));
      return (props.length ? props : fallbacks).slice(0, maxCount).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1);
        const priority = clamp01(0.32 + hash01(index, 11) * 0.44 + Math.sin(time * 0.66 + index) * 0.12 + (1 - Math.abs(p.x)) * 0.12);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-first-aid-cache-spark",
          position: { x: p.x, y: round(p.y + 0.025) },
          radius: round(0.022 + priority * 0.026),
          priority: round(priority),
          stabilizesSeconds: round(12 + priority * 20, 1),
          opacity: round(0.15 + priority * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalRaftAnchorRouteKit(options = {}) {
  const id = "tropical-raft-anchor-route-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const stability = clamp01(0.42 + Math.cos(time * 0.18 + index) * 0.22 + (1 - Math.abs(lane)) * 0.3);
        return {
          id: `${id}-${index}`,
          kind: "tropical-raft-anchor-route",
          start: { x: round(lane * 0.68), y: round(-0.44 + Math.sin(orbit + index) * 0.022) },
          end: { x: round(lane * 0.25), y: round(-0.15 + Math.cos(orbit + index) * 0.018) },
          stability: round(stability),
          anchorScore: round(clamp01(stability * 0.82 + hash01(index, 13) * 0.12)),
          width: round(0.007 + stability * 0.008),
          opacity: round(0.14 + stability * 0.28),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalExtractionPierBeaconKit(options = {}) {
  const id = "tropical-extraction-pier-beacon-kit";
  const count = Math.max(2, Math.min(4, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const weather = input.weatherShelterReadability?.rendererHandoff?.counts?.stormFronts ?? 0;
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const readyScore = clamp01(0.52 + Math.sin(time * 0.2 + index * 0.8) * 0.25 - weather * 0.012 + (index === 1 ? 0.16 : 0));
        return {
          id: `${id}-${index}`,
          kind: "tropical-extraction-pier-beacon",
          position: { x: round(-0.32 + lane * 0.64), y: round(0.14 + Math.sin(orbit + index) * 0.035) },
          radius: round(0.036 + readyScore * 0.034),
          readyScore: round(readyScore),
          extractionConfidence: round(clamp01(readyScore + hash01(index, 17) * 0.12)),
          opacity: round(0.16 + readyScore * 0.32),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalReefRescueRendererHandoffKit() {
  const id = "tropical-reef-rescue-renderer-handoff-kit";
  return {
    id,
    describe({ distressFlareArcs = [], snorkelSearchLanes = [], ripCurrentHazards = [], firstAidCacheSparks = [], raftAnchorRoutes = [], extractionPierBeacons = [] } = {}) {
      const descriptors = { distressFlareArcs, snorkelSearchLanes, ripCurrentHazards, firstAidCacheSparks, raftAnchorRoutes, extractionPierBeacons };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_REEF_RESCUE_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalReefRescueReadinessDomainKit(options = {}) {
  const distressFlareKit = createTropicalDistressFlareArcKit(options.distressFlareArcs);
  const snorkelSearchKit = createTropicalSnorkelSearchLaneKit(options.snorkelSearchLanes);
  const ripCurrentKit = createTropicalRipCurrentHazardKit(options.ripCurrentHazards);
  const firstAidKit = createTropicalFirstAidCacheSparkKit(options.firstAidCacheSparks);
  const raftAnchorKit = createTropicalRaftAnchorRouteKit(options.raftAnchorRoutes);
  const extractionPierKit = createTropicalExtractionPierBeaconKit(options.extractionPierBeacons);
  const handoffKit = createTropicalReefRescueRendererHandoffKit();
  const id = "tropical-reef-rescue-readiness-domain-kit";
  return {
    id,
    domainTree: TROPICAL_REEF_RESCUE_DOMAIN_TREE,
    kits: [distressFlareKit, snorkelSearchKit, ripCurrentKit, firstAidKit, raftAnchorKit, extractionPierKit, handoffKit],
    describe(input = {}) {
      const distressFlareArcs = distressFlareKit.describe(input);
      const snorkelSearchLanes = snorkelSearchKit.describe(input);
      const ripCurrentHazards = ripCurrentKit.describe(input);
      const firstAidCacheSparks = firstAidKit.describe(input);
      const raftAnchorRoutes = raftAnchorKit.describe(input);
      const extractionPierBeacons = extractionPierKit.describe(input);
      const rendererHandoff = handoffKit.describe({ distressFlareArcs, snorkelSearchLanes, ripCurrentHazards, firstAidCacheSparks, raftAnchorRoutes, extractionPierBeacons });
      return {
        id,
        kind: "tropical-reef-rescue-readiness-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_REEF_RESCUE_DOMAIN_TREE,
        subdomains: {
          searchSignal: { kits: [distressFlareKit.id, snorkelSearchKit.id], descriptors: { distressFlareArcs, snorkelSearchLanes } },
          rescueSafety: { kits: [ripCurrentKit.id, firstAidKit.id], descriptors: { ripCurrentHazards, firstAidCacheSparks } },
          extractionRouting: { kits: [raftAnchorKit.id, extractionPierKit.id], descriptors: { raftAnchorRoutes, extractionPierBeacons } }
        },
        rendererHandoff
      };
    }
  };
}
