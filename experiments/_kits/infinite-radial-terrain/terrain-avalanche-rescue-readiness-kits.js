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

function snowLoad(sample = {}) {
  const height = clamp01((n(sample.height, sample.y) - 900) / 1600);
  const snow = clamp01(sample.material?.materialWeights?.snow ?? 0);
  const cold = clamp01((2 - n(sample.climate?.temperatureC, 8)) / 18);
  return clamp01(snow * 0.54 + height * 0.28 + cold * 0.18);
}

function avalancheRisk(sample = {}) {
  const slope = clamp01((n(sample.slope, 12) - 24) / 24);
  const rugged = clamp01(sample.landform?.terrainRuggedness ?? sample.landform?.ruggedness ?? 0.28);
  const snow = snowLoad(sample);
  const wet = clamp01(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel ?? 0);
  return clamp01(slope * 0.38 + snow * 0.34 + rugged * 0.18 + wet * 0.1);
}

function rescueValue(sample = {}, index = 0) {
  const confidence = clamp01(sample.landform?.confidence ?? 0.5);
  const water = clamp01(sample.hydrology?.flow?.channelPotential ?? 0.16);
  const vegetation = clamp01(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.24);
  const signalHint = String(sample.tag ?? "").includes("camp") || String(sample.tag ?? "").includes("shelter") ? 0.22 : 0;
  return clamp01(confidence * 0.26 + (1 - vegetation) * 0.12 + water * 0.14 + snowLoad(sample) * 0.26 + signalHint + index * 0.018);
}

function rendererContract(owner) {
  return {
    owner,
    rendererConsumes: "terrain avalanche rescue descriptors only",
    rendererMustOwn: ["DOM placement", "Canvas/Three draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["rescue truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

export const TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-avalanche-rescue-readiness-domain",
  subdomains: [
    {
      id: "distress-detection-domain",
      subdomains: [
        { id: "buried-camp-domain", kits: ["terrain-buried-camp-transponder-kit"] },
        { id: "snowfield-probe-domain", kits: ["terrain-snowfield-probe-lane-kit"] }
      ]
    },
    {
      id: "risk-routing-domain",
      subdomains: [
        { id: "avalanche-crown-domain", kits: ["terrain-avalanche-crown-hazard-kit"] },
        { id: "ridge-shelter-domain", kits: ["terrain-ridge-shelter-pocket-kit"] }
      ]
    },
    {
      id: "rescue-return-domain",
      subdomains: [
        { id: "rescue-sled-domain", kits: ["terrain-rescue-sled-corridor-kit"] },
        { id: "medevac-beacon-domain", kits: ["terrain-medevac-beacon-window-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["terrain-avalanche-rescue-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes terrain avalanche rescue descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createTerrainBuriedCampTransponderKit({ maxTransponders = 5 } = {}) {
  return {
    id: "terrain-buried-camp-transponder-kit",
    domain: "terrain-avalanche-rescue-readiness/distress-detection-domain/buried-camp-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      return stableArray(input.samples).filter(Boolean).map((sample, index) => {
        const position = samplePosition(sample, cam);
        const risk = avalancheRisk(sample);
        const value = rescueValue(sample, index);
        const distanceMeters = distance2d(position, cam);
        const signalStrength = clamp01(value * 0.68 + (1 - clamp01(distanceMeters / 5200)) * 0.32);
        return {
          id: `buried-camp-transponder-${sample.tag ?? index}`,
          kind: "buried-camp-transponder",
          label: sample.tag ?? `camp-${index}`,
          position: { ...position, y: round(position.y + 22, 1) },
          signalStrength: round(signalStrength),
          survivorHeat: round(clamp01(signalStrength * 0.72 + risk * 0.18)),
          priority: round(clamp01(signalStrength * 0.62 + risk * 0.38)),
          distanceMeters: round(distanceMeters, 1),
          rendererContract: rendererContract("terrain-buried-camp-transponder-kit")
        };
      }).sort((a, b) => b.priority - a.priority).slice(0, maxTransponders);
    },
    snapshot(input) {
      const transponders = this.describe(input);
      return { transponders: transponders.length, urgent: transponders.filter((item) => item.priority > 0.62).length };
    }
  };
}

export function createTerrainSnowfieldProbeLaneKit({ maxLanes = 5 } = {}) {
  return {
    id: "terrain-snowfield-probe-lane-kit",
    domain: "terrain-avalanche-rescue-readiness/distress-detection-domain/snowfield-probe-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      return stableArray(input.samples).filter(Boolean).slice(0, maxLanes).map((sample, index) => {
        const to = samplePosition(sample, cam);
        const snow = snowLoad(sample);
        const risk = avalancheRisk(sample);
        const probeSpacingMeters = round(9 + (1 - snow) * 18 + risk * 6, 1);
        return {
          id: `snowfield-probe-lane-${sample.tag ?? index}`,
          kind: "snowfield-probe-lane",
          from: { x: round(cam.x), y: round(cam.y - 120, 1), z: round(cam.z) },
          to,
          probeSpacingMeters,
          sweepCount: Math.max(3, Math.round(14 - probeSpacingMeters / 2)),
          status: snow > 0.62 ? "deep-probe" : risk > 0.5 ? "guarded-probe" : "quick-sweep",
          rendererContract: rendererContract("terrain-snowfield-probe-lane-kit")
        };
      });
    },
    snapshot(input) {
      const lanes = this.describe(input);
      return { lanes: lanes.length, deep: lanes.filter((lane) => lane.status === "deep-probe").length };
    }
  };
}

export function createTerrainAvalancheCrownHazardKit({ maxCrowns = 4 } = {}) {
  return {
    id: "terrain-avalanche-crown-hazard-kit",
    domain: "terrain-avalanche-rescue-readiness/risk-routing-domain/avalanche-crown-domain",
    describe(input = {}) {
      return stableArray(input.samples).filter(Boolean).map((sample, index) => {
        const center = samplePosition(sample);
        const risk = avalancheRisk(sample);
        return {
          id: `avalanche-crown-hazard-${sample.tag ?? index}`,
          kind: "avalanche-crown-hazard",
          center: { ...center, y: round(center.y + 44, 1) },
          radiusMeters: round(180 + risk * 420, 1),
          releaseRisk: round(risk),
          crownDepthMeters: round(0.4 + snowLoad(sample) * 2.8, 2),
          status: risk > 0.72 ? "closed" : risk > 0.46 ? "spotter-only" : "crossable",
          rendererContract: rendererContract("terrain-avalanche-crown-hazard-kit")
        };
      }).sort((a, b) => b.releaseRisk - a.releaseRisk).slice(0, maxCrowns);
    },
    snapshot(input) {
      const crowns = this.describe(input);
      return { crowns: crowns.length, closed: crowns.filter((crown) => crown.status === "closed").length };
    }
  };
}

export function createTerrainRidgeShelterPocketKit({ maxShelters = 4 } = {}) {
  return {
    id: "terrain-ridge-shelter-pocket-kit",
    domain: "terrain-avalanche-rescue-readiness/risk-routing-domain/ridge-shelter-domain",
    describe(input = {}) {
      return stableArray(input.samples).filter(Boolean).map((sample, index) => {
        const center = samplePosition(sample);
        const risk = avalancheRisk(sample);
        const windShield = clamp01((sample.landform?.confidence ?? 0.48) * 0.52 + (1 - risk) * 0.48);
        return {
          id: `ridge-shelter-pocket-${sample.tag ?? index}`,
          kind: "ridge-shelter-pocket",
          center: { ...center, y: round(center.y + 18, 1) },
          radiusMeters: round(110 + windShield * 220, 1),
          windShield: round(windShield),
          status: windShield > 0.68 ? "safe-pocket" : windShield > 0.44 ? "brief-hold" : "exposed",
          rendererContract: rendererContract("terrain-ridge-shelter-pocket-kit")
        };
      }).sort((a, b) => b.windShield - a.windShield).slice(0, maxShelters);
    },
    snapshot(input) {
      const shelters = this.describe(input);
      return { shelters: shelters.length, safe: shelters.filter((shelter) => shelter.status === "safe-pocket").length };
    }
  };
}

export function createTerrainRescueSledCorridorKit({ maxCorridors = 5 } = {}) {
  return {
    id: "terrain-rescue-sled-corridor-kit",
    domain: "terrain-avalanche-rescue-readiness/rescue-return-domain/rescue-sled-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const origin = input.terrain?.origin ?? { x: 0, z: 0 };
      const base = { x: round(n(origin.x)), y: round(n(input.terrainSample?.height, cam.y - 160), 1), z: round(n(origin.z)) };
      return stableArray(input.samples).filter(Boolean).slice(0, maxCorridors).map((sample, index) => {
        const to = samplePosition(sample, cam);
        const risk = avalancheRisk(sample);
        const grade = clamp01(1 - n(sample.slope, 12) / 48);
        const clearance = clamp01(grade * 0.62 + (1 - risk) * 0.38);
        return {
          id: `rescue-sled-corridor-${sample.tag ?? index}`,
          kind: "rescue-sled-corridor",
          from: base,
          to,
          clearance: round(clearance),
          pullTeam: clearance > 0.68 ? 2 : clearance > 0.44 ? 4 : 6,
          status: clearance > 0.68 ? "fast-sled" : clearance > 0.44 ? "roped-sled" : "carry-out",
          rendererContract: rendererContract("terrain-rescue-sled-corridor-kit")
        };
      });
    },
    snapshot(input) {
      const corridors = this.describe(input);
      return { corridors: corridors.length, fast: corridors.filter((corridor) => corridor.status === "fast-sled").length };
    }
  };
}

export function createTerrainMedevacBeaconWindowKit({ beaconCount = 3 } = {}) {
  return {
    id: "terrain-medevac-beacon-window-kit",
    domain: "terrain-avalanche-rescue-readiness/rescue-return-domain/medevac-beacon-domain",
    describe(input = {}) {
      const cam = cameraPosition(input.camera);
      const time = n(input.time);
      const focus = input.terrainSample ?? stableArray(input.samples)[0] ?? {};
      const focusPosition = samplePosition(focus, { x: cam.x, y: cam.y - 160, z: cam.z });
      return Array.from({ length: beaconCount }, (_, index) => {
        const phase = 0.5 + Math.sin(time * 0.82 + index * 1.3) * 0.28;
        const weatherConfidence = clamp01(phase + (1 - avalancheRisk(focus)) * 0.32 - index * 0.06);
        return {
          id: `medevac-beacon-window-${index}`,
          kind: "medevac-beacon-window",
          position: {
            x: round(focusPosition.x + Math.cos(index * 2.09) * (180 + index * 120)),
            y: round(focusPosition.y + 260 + index * 90, 1),
            z: round(focusPosition.z + Math.sin(index * 2.09) * (180 + index * 120))
          },
          weatherConfidence: round(weatherConfidence),
          window: weatherConfidence > 0.7 ? "open" : weatherConfidence > 0.42 ? "standby" : "grounded",
          pulse: round(phase),
          rendererContract: rendererContract("terrain-medevac-beacon-window-kit")
        };
      });
    },
    snapshot(input) {
      const beacons = this.describe(input);
      return { beacons: beacons.length, open: beacons.filter((beacon) => beacon.window === "open").length };
    }
  };
}

export function createTerrainAvalancheRescueRendererHandoffKit({
  buriedCampTransponderKit = createTerrainBuriedCampTransponderKit(),
  snowfieldProbeLaneKit = createTerrainSnowfieldProbeLaneKit(),
  avalancheCrownHazardKit = createTerrainAvalancheCrownHazardKit(),
  ridgeShelterPocketKit = createTerrainRidgeShelterPocketKit(),
  rescueSledCorridorKit = createTerrainRescueSledCorridorKit(),
  medevacBeaconWindowKit = createTerrainMedevacBeaconWindowKit()
} = {}) {
  return {
    id: "terrain-avalanche-rescue-renderer-handoff-kit",
    domain: "terrain-avalanche-rescue-readiness/renderer-handoff",
    kits: { buriedCampTransponderKit, snowfieldProbeLaneKit, avalancheCrownHazardKit, ridgeShelterPocketKit, rescueSledCorridorKit, medevacBeaconWindowKit },
    describe(input = {}) {
      const descriptors = {
        buriedCampTransponders: buriedCampTransponderKit.describe(input),
        snowfieldProbeLanes: snowfieldProbeLaneKit.describe(input),
        avalancheCrownHazards: avalancheCrownHazardKit.describe(input),
        ridgeShelterPockets: ridgeShelterPocketKit.describe(input),
        rescueSledCorridors: rescueSledCorridorKit.describe(input),
        medevacBeaconWindows: medevacBeaconWindowKit.describe(input)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, list]) => [key, stableArray(list).length]));
      counts.total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      return {
        id: "terrain-avalanche-rescue-renderer-handoff",
        descriptors,
        counts,
        rendererContract: rendererContract("terrain-avalanche-rescue-renderer-handoff-kit")
      };
    },
    snapshot(input) {
      return this.describe(input).counts;
    }
  };
}

export function createTerrainAvalancheRescueReadinessDomainKit(options = {}) {
  const rendererHandoffKit = createTerrainAvalancheRescueRendererHandoffKit(options);
  return {
    id: "terrain-avalanche-rescue-readiness-domain-kit",
    domainTree: TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE,
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      const descriptors = rendererHandoff.descriptors;
      const urgentCamps = descriptors.buriedCampTransponders.filter((camp) => camp.priority > 0.62).length;
      const openMedevacs = descriptors.medevacBeaconWindows.filter((beacon) => beacon.window === "open").length;
      const closedCrowns = descriptors.avalancheCrownHazards.filter((crown) => crown.status === "closed").length;
      const sledRoutes = descriptors.rescueSledCorridors.filter((route) => route.status !== "carry-out").length;
      const safeShelters = descriptors.ridgeShelterPockets.filter((shelter) => shelter.status === "safe-pocket").length;
      return {
        id: "terrain-avalanche-rescue-readiness-domain",
        domainTree: TERRAIN_AVALANCHE_RESCUE_READINESS_DOMAIN_TREE,
        ...descriptors,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          urgentCamps,
          openMedevacs,
          closedCrowns,
          sledRoutes,
          safeShelters,
          readiness: round(clamp01(urgentCamps * 0.11 + openMedevacs * 0.16 + sledRoutes * 0.12 + safeShelters * 0.1 + (4 - closedCrowns) * 0.09))
        }
      };
    },
    snapshot(input) {
      return this.describe(input).summary;
    }
  };
}
