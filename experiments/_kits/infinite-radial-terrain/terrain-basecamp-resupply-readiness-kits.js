const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

function cameraPosition(camera = {}) {
  if (Array.isArray(camera.position)) return { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) };
  return { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
}

function samplePosition(sample = {}, fallback = {}) {
  return {
    x: round(n(sample.x, fallback.x)),
    y: round(n(sample.height, sample.y ?? fallback.y), 1),
    z: round(n(sample.z, fallback.z))
  };
}

function distance2d(a = {}, b = {}) {
  return Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
}

function terrainRisk(sample = {}) {
  const slope = clamp01((n(sample.slope) - 8) / 34);
  const wet = clamp01(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0);
  const rugged = clamp01(sample.landform?.terrainRuggedness ?? sample.landform?.ruggedness ?? 0.24);
  const snow = clamp01(sample.material?.materialWeights?.snow ?? 0);
  return clamp01(slope * 0.36 + wet * 0.18 + rugged * 0.34 + snow * 0.12);
}

function terrainValue(sample = {}, index = 0) {
  const vegetation = clamp01(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.24);
  const water = clamp01(sample.hydrology?.flow?.channelPotential ?? 0.16);
  const confidence = clamp01(sample.landform?.confidence ?? 0.5);
  const novelty = clamp01(0.18 + index * 0.045 + Math.abs(n(sample.height) - n(sample.y)) / 2600);
  return clamp01(confidence * 0.26 + vegetation * 0.24 + water * 0.22 + novelty * 0.28);
}

function rendererContract(owner) {
  return {
    owner,
    rendererConsumes: "terrain basecamp resupply descriptors only",
    rendererMustOwn: ["DOM placement", "Canvas/Three draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["resupply truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

export const TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-basecamp-resupply-readiness-domain",
  subdomains: [
    {
      id: "supply-staging-domain",
      subdomains: [
        { id: "supply-cache-domain", kits: ["terrain-basecamp-supply-cache-kit"] },
        { id: "sample-crate-domain", kits: ["terrain-sample-crate-route-kit"] }
      ]
    },
    {
      id: "landing-safety-domain",
      subdomains: [
        { id: "landing-zone-domain", kits: ["terrain-landing-zone-certification-kit"] },
        { id: "weather-window-domain", kits: ["terrain-weather-window-flag-kit"] }
      ]
    },
    {
      id: "survival-return-domain",
      subdomains: [
        { id: "bivouac-shelter-domain", kits: ["terrain-emergency-bivouac-shelter-kit"] },
        { id: "return-fuel-domain", kits: ["terrain-return-fuel-beacon-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["terrain-basecamp-resupply-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes terrain basecamp resupply descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createTerrainBasecampSupplyCacheKit({ maxCaches = 5 } = {}) {
  return {
    id: "terrain-basecamp-supply-cache-kit",
    domain: "terrain-basecamp-resupply-readiness/supply-staging-domain/supply-cache-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      return stableArray(input.samples).filter(Boolean)
        .map((sample, index) => {
          const position = samplePosition(sample, cam);
          const hazard = terrainRisk(sample);
          const stock = clamp01(0.34 + terrainValue(sample, index) * 0.54 - hazard * 0.26);
          const distanceMeters = distance2d(position, cam);
          return {
            id: `basecamp-supply-cache-${sample.tag ?? index}`,
            kind: "basecamp-supply-cache",
            label: sample.tag ?? `cache-${index}`,
            position,
            stock: round(stock),
            priority: round(clamp01(stock * 0.65 + (1 - clamp01(distanceMeters / 3600)) * 0.35)),
            distanceMeters: round(distanceMeters, 1),
            rendererContract: rendererContract("terrain-basecamp-supply-cache-kit")
          };
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxCaches);
    },
    snapshot(input) {
      const caches = this.describe(input);
      return { caches: caches.length, stocked: caches.filter((cache) => cache.stock > 0.55).length, topPriority: caches[0]?.priority ?? 0 };
    }
  };
}

export function createTerrainLandingZoneCertificationKit({ maxZones = 4 } = {}) {
  return {
    id: "terrain-landing-zone-certification-kit",
    domain: "terrain-basecamp-resupply-readiness/landing-safety-domain/landing-zone-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      return stableArray(input.samples).filter(Boolean)
        .map((sample, index) => {
          const position = samplePosition(sample, cam);
          const slope = n(sample.slope, 12);
          const clearance = cam.y - position.y;
          const grade = clamp01(1 - slope / 42) * 0.58 + clamp01((clearance - 80) / 620) * 0.42;
          return {
            id: `landing-zone-certification-${sample.tag ?? index}`,
            kind: "landing-zone-certification",
            center: position,
            radiusMeters: round(140 + grade * 180, 1),
            grade: round(grade),
            slopeDegrees: round(slope, 1),
            clearanceMeters: round(clearance, 1),
            status: grade > 0.72 ? "certified" : grade > 0.42 ? "approach-only" : "unsafe",
            rendererContract: rendererContract("terrain-landing-zone-certification-kit")
          };
        })
        .sort((a, b) => b.grade - a.grade)
        .slice(0, maxZones);
    },
    snapshot(input) {
      const zones = this.describe(input);
      return { zones: zones.length, certified: zones.filter((zone) => zone.status === "certified").length };
    }
  };
}

export function createTerrainWeatherWindowFlagKit({ flagCount = 4 } = {}) {
  return {
    id: "terrain-weather-window-flag-kit",
    domain: "terrain-basecamp-resupply-readiness/landing-safety-domain/weather-window-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const time = n(input.time);
      const samples = stableArray(input.samples).filter(Boolean).slice(0, flagCount);
      return samples.map((sample, index) => {
        const position = samplePosition(sample, cam);
        const localRisk = terrainRisk(sample);
        const pulse = clamp01(0.5 + Math.sin(time * 0.9 + index * 0.73) * 0.26 - localRisk * 0.22);
        return {
          id: `weather-window-flag-${sample.tag ?? index}`,
          kind: "weather-window-flag",
          position: { ...position, y: round(position.y + 96 + pulse * 54, 1) },
          pulse: round(pulse),
          window: pulse > 0.66 ? "open" : pulse < 0.34 ? "closing" : "watch",
          gustRisk: round(localRisk),
          rendererContract: rendererContract("terrain-weather-window-flag-kit")
        };
      });
    },
    snapshot(input) {
      const flags = this.describe(input);
      return { flags: flags.length, open: flags.filter((flag) => flag.window === "open").length };
    }
  };
}

export function createTerrainSampleCrateRouteKit({ maxRoutes = 5 } = {}) {
  return {
    id: "terrain-sample-crate-route-kit",
    domain: "terrain-basecamp-resupply-readiness/supply-staging-domain/sample-crate-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const origin = input.terrain?.origin ?? { x: 0, z: 0 };
      const base = { x: round(n(origin.x)), y: round(n(input.terrainSample?.height, cam.y - 160), 1), z: round(n(origin.z)) };
      return stableArray(input.samples).filter(Boolean).slice(0, maxRoutes).map((sample, index) => {
        const to = samplePosition(sample, cam);
        const routeValue = terrainValue(sample, index);
        const routeRisk = terrainRisk(sample);
        return {
          id: `sample-crate-route-${sample.tag ?? index}`,
          kind: "sample-crate-route",
          from: base,
          to,
          crateValue: round(routeValue),
          routeRisk: round(routeRisk),
          urgency: round(clamp01(routeValue * 0.7 + routeRisk * 0.3)),
          label: routeRisk > 0.58 ? "guarded-crate" : routeValue > 0.62 ? "priority-crate" : "routine-crate",
          rendererContract: rendererContract("terrain-sample-crate-route-kit")
        };
      });
    },
    snapshot(input) {
      const routes = this.describe(input);
      return { routes: routes.length, priority: routes.filter((route) => route.label === "priority-crate").length };
    }
  };
}

export function createTerrainEmergencyBivouacShelterKit({ maxShelters = 4 } = {}) {
  return {
    id: "terrain-emergency-bivouac-shelter-kit",
    domain: "terrain-basecamp-resupply-readiness/survival-return-domain/bivouac-shelter-domain",
    describe(input = {}) {
      return stableArray(input.samples).filter(Boolean)
        .map((sample, index) => {
          const shelterScore = clamp01(1 - terrainRisk(sample) * 0.72 + terrainValue(sample, index) * 0.28);
          const position = samplePosition(sample);
          return {
            id: `emergency-bivouac-shelter-${sample.tag ?? index}`,
            kind: "emergency-bivouac-shelter",
            center: { ...position, y: round(position.y + 8, 1) },
            radiusMeters: round(90 + shelterScore * 170, 1),
            shelterScore: round(shelterScore),
            status: shelterScore > 0.68 ? "safe-bivouac" : shelterScore > 0.42 ? "short-rest" : "exposed",
            rendererContract: rendererContract("terrain-emergency-bivouac-shelter-kit")
          };
        })
        .sort((a, b) => b.shelterScore - a.shelterScore)
        .slice(0, maxShelters);
    },
    snapshot(input) {
      const shelters = this.describe(input);
      return { shelters: shelters.length, safe: shelters.filter((shelter) => shelter.status === "safe-bivouac").length };
    }
  };
}

export function createTerrainReturnFuelBeaconKit({ beaconCount = 3 } = {}) {
  return {
    id: "terrain-return-fuel-beacon-kit",
    domain: "terrain-basecamp-resupply-readiness/survival-return-domain/return-fuel-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const origin = input.terrain?.origin ?? { x: 0, z: 0 };
      const dx = n(origin.x) - cam.x;
      const dz = n(origin.z) - cam.z;
      const distanceMeters = Math.hypot(dx, dz);
      const headingRadians = Math.atan2(dx, dz);
      return Array.from({ length: beaconCount }, (_, index) => {
        const ratio = (index + 1) / (beaconCount + 1);
        const fuelConfidence = clamp01(1 - distanceMeters / (9000 + index * 1800) + ratio * 0.24);
        return {
          id: `return-fuel-beacon-${index}`,
          kind: "return-fuel-beacon",
          position: {
            x: round(cam.x + dx * ratio),
            y: round(n(input.terrainSample?.height, cam.y - 160) + 120 + index * 80, 1),
            z: round(cam.z + dz * ratio)
          },
          headingRadians: round(headingRadians, 4),
          distanceMeters: round(distanceMeters * ratio, 1),
          fuelConfidence: round(fuelConfidence),
          status: fuelConfidence > 0.68 ? "green" : fuelConfidence > 0.38 ? "amber" : "red",
          rendererContract: rendererContract("terrain-return-fuel-beacon-kit")
        };
      });
    },
    snapshot(input) {
      const beacons = this.describe(input);
      return { beacons: beacons.length, red: beacons.filter((beacon) => beacon.status === "red").length };
    }
  };
}

export function createTerrainBasecampResupplyRendererHandoffKit({
  supplyCacheKit = createTerrainBasecampSupplyCacheKit(),
  landingZoneKit = createTerrainLandingZoneCertificationKit(),
  weatherWindowKit = createTerrainWeatherWindowFlagKit(),
  sampleCrateRouteKit = createTerrainSampleCrateRouteKit(),
  bivouacShelterKit = createTerrainEmergencyBivouacShelterKit(),
  returnFuelBeaconKit = createTerrainReturnFuelBeaconKit()
} = {}) {
  return {
    id: "terrain-basecamp-resupply-renderer-handoff-kit",
    domain: "terrain-basecamp-resupply-readiness/renderer-handoff",
    kits: { supplyCacheKit, landingZoneKit, weatherWindowKit, sampleCrateRouteKit, bivouacShelterKit, returnFuelBeaconKit },
    describe(input = {}) {
      const descriptors = {
        basecampSupplyCaches: supplyCacheKit.describe(input),
        landingZoneCertifications: landingZoneKit.describe(input),
        weatherWindowFlags: weatherWindowKit.describe(input),
        sampleCrateRoutes: sampleCrateRouteKit.describe(input),
        emergencyBivouacShelters: bivouacShelterKit.describe(input),
        returnFuelBeacons: returnFuelBeaconKit.describe(input)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, list]) => [key, stableArray(list).length]));
      counts.total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      return {
        id: "terrain-basecamp-resupply-renderer-handoff",
        descriptors,
        counts,
        rendererContract: rendererContract("terrain-basecamp-resupply-renderer-handoff-kit")
      };
    },
    snapshot(input) {
      return this.describe(input).counts;
    }
  };
}

export function createTerrainBasecampResupplyReadinessDomainKit(options = {}) {
  const rendererHandoffKit = createTerrainBasecampResupplyRendererHandoffKit(options);
  return {
    id: "terrain-basecamp-resupply-readiness-domain-kit",
    domainTree: TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE,
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      const descriptors = rendererHandoff.descriptors;
      const safeLanding = descriptors.landingZoneCertifications.filter((zone) => zone.status === "certified").length;
      const openWindows = descriptors.weatherWindowFlags.filter((flag) => flag.window === "open").length;
      const stockedCaches = descriptors.basecampSupplyCaches.filter((cache) => cache.stock > 0.55).length;
      const redFuel = descriptors.returnFuelBeacons.filter((beacon) => beacon.status === "red").length;
      return {
        id: "terrain-basecamp-resupply-readiness-domain",
        domainTree: TERRAIN_BASECAMP_RESUPPLY_READINESS_DOMAIN_TREE,
        ...descriptors,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          safeLanding,
          openWindows,
          stockedCaches,
          redFuel,
          readiness: round(clamp01(safeLanding * 0.16 + openWindows * 0.13 + stockedCaches * 0.12 + (3 - redFuel) * 0.11))
        }
      };
    },
    snapshot(input) {
      return this.describe(input).summary;
    }
  };
}
