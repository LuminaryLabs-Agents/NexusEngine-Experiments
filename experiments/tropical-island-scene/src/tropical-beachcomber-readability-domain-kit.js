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
const projectLagoon = (position = {}, orbit = 0, scale = 1) => {
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = scalarFrom(position.x, 0) * c - scalarFrom(position.z, 0) * s;
  const z = scalarFrom(position.x, 0) * s + scalarFrom(position.z, 0) * c;
  const y = scalarFrom(position.y, 0);
  return { x: round((x / 36) * scale), y: round((-0.18 + y / 18 - z / 90) * scale), depth: round(z) };
};

export const TROPICAL_BEACHCOMBER_DOMAIN_TREE = `tropical-beachcomber-readability-domain
├─ beach-objective-domain
│  ├─ task-beacon-domain
│  │  └─ beachcomber-task-beacon-kit
│  └─ shoreline-path-domain
│     └─ shoreline-path-ribbon-kit
├─ wildlife-and-drift-domain
│  ├─ fish-focus-domain
│  │  └─ fish-school-focus-ring-kit
│  └─ drift-collection-domain
│     └─ drift-collection-lane-kit
├─ safety-and-tide-domain
│  ├─ coconut-risk-domain
│  │  └─ coconut-risk-shadow-kit
│  └─ tide-window-domain
│     └─ tide-window-pulse-kit
└─ renderer-handoff
   └─ beachcomber-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createBeachcomberTaskBeaconKit(options = {}) {
  const id = "beachcomber-task-beacon-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  const labels = options.labels ?? ["collect", "watch", "follow", "return", "rest"];
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const angle = orbit * 0.22 + lane * Math.PI * 1.55 + 0.35;
        const pulse = 0.5 + Math.sin(time * 1.15 + index * 0.9) * 0.5;
        return {
          id: `${id}-${index}`,
          kind: "beachcomber-task-beacon",
          position: { x: round(Math.cos(angle) * (0.18 + lane * 0.25)), y: round(-0.16 + Math.sin(angle) * 0.105) },
          radius: round(0.032 + pulse * 0.018),
          pulse: round(pulse),
          priority: round(1 - lane * 0.18),
          label: labels[index % labels.length]
        };
      });
    }
  };
}

export function createShorelinePathRibbonKit(options = {}) {
  const id = "shoreline-path-ribbon-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const a0 = -2.75 + index * 0.92 + orbit * 0.1;
        const a1 = a0 + 0.55;
        const swell = Math.sin(time * 0.25 + index) * 0.008;
        return {
          id: `${id}-${index}`,
          kind: "shoreline-path-ribbon",
          start: { x: round(Math.cos(a0) * 0.50), y: round(-0.16 + Math.sin(a0) * 0.17 + swell) },
          end: { x: round(Math.cos(a1) * 0.50), y: round(-0.16 + Math.sin(a1) * 0.17 - swell) },
          width: round(0.006 + index * 0.0015),
          progress: round((index + 1) / count),
          opacity: round(0.28 + (index % 2) * 0.14)
        };
      });
    }
  };
}

export function createCoconutRiskShadowKit(options = {}) {
  const id = "coconut-risk-shadow-kit";
  const maxCount = Math.max(3, Math.min(4, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return safeArray(input.coconuts).slice(0, maxCount).map((entry, index) => {
        const p = positionFrom(entry, { x: 0.2 - index * 0.18, y: 2.9, z: index * 0.12 });
        const projected = projectLagoon({ ...p, y: 0 }, orbit, 1);
        const height = Math.max(0, scalarFrom(p.y, 0));
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "coconut-risk-shadow",
          position: { x: round(projected.x), y: round(projected.y + 0.21) },
          radius: round(0.04 + Math.min(1, height / 4) * 0.045),
          risk: round(0.35 + Math.min(1, height / 4) * 0.55),
          opacity: round(0.20 + index * 0.09)
        };
      });
    }
  };
}

export function createFishSchoolFocusRingKit(options = {}) {
  const id = "fish-school-focus-ring-kit";
  const maxCount = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const time = scalarFrom(input.time, 0);
      return safeArray(input.fish).slice(0, maxCount).map((entry, index) => {
        const p = projectLagoon(positionFrom(entry, { x: index - 3, y: -1, z: -10 - index }), orbit, 1);
        const pulse = 0.5 + Math.sin(time * 0.9 + index) * 0.5;
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "fish-school-focus-ring",
          position: { x: p.x, y: round(p.y - 0.02) },
          radius: round(0.035 + scalarFrom(entry.scale, 1) * 0.018 + pulse * 0.01),
          intensity: round(0.25 + pulse * 0.42),
          schoolDepth: p.depth
        };
      });
    }
  };
}

export function createDriftCollectionLaneKit(options = {}) {
  const id = "drift-collection-lane-kit";
  const maxCount = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return safeArray(input.floatProps).slice(0, maxCount).map((entry, index) => {
        const p = projectLagoon(positionFrom(entry, { x: -10 + index * 3, y: 0, z: -15 - index * 2 }), orbit, 1);
        const shoreX = Math.max(-0.48, Math.min(0.48, p.x * 0.55));
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "drift-collection-lane",
          start: { x: p.x, y: round(p.y - 0.01) },
          end: { x: round(shoreX), y: round(-0.19 + (index % 3) * 0.025) },
          width: round(0.006 + scalarFrom(entry.scale, 1) * 0.004),
          salvageValue: round(0.55 + hash01(index, 2) * 0.35),
          opacity: round(0.18 + (index % 4) * 0.045)
        };
      });
    }
  };
}

export function createTideWindowPulseKit(options = {}) {
  const id = "tide-window-pulse-kit";
  const count = Math.max(3, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const pulse = 0.5 + Math.sin(time * 0.55 + index * 0.7 + orbit) * 0.5;
        return {
          id: `${id}-${index}`,
          kind: "tide-window-pulse",
          center: { x: round(Math.sin(orbit + index * 0.42) * 0.018), y: round(-0.195 - lane * 0.11) },
          radius: { x: round(0.45 + lane * 0.20), y: round(0.14 + lane * 0.07) },
          windowScore: round(0.36 + pulse * 0.52),
          opacity: round(0.10 + pulse * 0.16),
          label: lane < 0.34 ? "safe-shore" : lane < 0.68 ? "reef-window" : "deep-current"
        };
      });
    }
  };
}

export function createBeachcomberRendererHandoffKit() {
  const id = "beachcomber-renderer-handoff-kit";
  return {
    id,
    describe({ taskBeacons = [], shoreRoutes = [], coconutRisks = [], fishFocus = [], driftLanes = [], tideWindows = [] } = {}) {
      const descriptors = { taskBeacons, shoreRoutes, coconutRisks, fishFocus, driftLanes, tideWindows };
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

export function createTropicalBeachcomberReadabilityDomainKit(options = {}) {
  const taskKit = createBeachcomberTaskBeaconKit(options.taskBeacons);
  const routeKit = createShorelinePathRibbonKit(options.shoreRoutes);
  const riskKit = createCoconutRiskShadowKit(options.coconutRisks);
  const fishKit = createFishSchoolFocusRingKit(options.fishFocus);
  const driftKit = createDriftCollectionLaneKit(options.driftLanes);
  const tideKit = createTideWindowPulseKit(options.tideWindows);
  const handoffKit = createBeachcomberRendererHandoffKit();
  const id = "tropical-beachcomber-readability-domain-kit";
  return {
    id,
    kits: [taskKit, routeKit, riskKit, fishKit, driftKit, tideKit, handoffKit],
    domainTree: TROPICAL_BEACHCOMBER_DOMAIN_TREE,
    describe(input = {}) {
      const taskBeacons = taskKit.describe(input);
      const shoreRoutes = routeKit.describe(input);
      const coconutRisks = riskKit.describe(input);
      const fishFocus = fishKit.describe(input);
      const driftLanes = driftKit.describe(input);
      const tideWindows = tideKit.describe(input);
      const rendererHandoff = handoffKit.describe({ taskBeacons, shoreRoutes, coconutRisks, fishFocus, driftLanes, tideWindows });
      return {
        id,
        kind: "tropical-beachcomber-readability-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        subdomains: {
          beachObjectives: { kit: taskKit.id, descriptors: taskBeacons },
          shorelineNavigation: { kit: routeKit.id, descriptors: shoreRoutes },
          coconutSafety: { kit: riskKit.id, descriptors: coconutRisks },
          fishFocus: { kit: fishKit.id, descriptors: fishFocus },
          driftCollection: { kit: driftKit.id, descriptors: driftLanes },
          tideWindows: { kit: tideKit.id, descriptors: tideWindows }
        },
        rendererHandoff
      };
    }
  };
}
