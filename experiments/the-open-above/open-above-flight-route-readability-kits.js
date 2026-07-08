const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => ((hashText(`${seed}:${index}:${salt}`) % 10000) / 10000);
const body = (snapshot = {}) => snapshot.body ?? {};
const input = (snapshot = {}) => snapshot.input ?? {};
const position = (snapshot = {}) => body(snapshot).position ?? {};
const count = (items) => Array.isArray(items) ? items.length : 0;
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + count(value), 0);

export const OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE = `open-above-flight-route-readability-domain
├─ lift-route-domain
│  ├─ updraft-corridor-domain
│  │  └─ open-above-updraft-corridor-kit
│  └─ flock-draft-domain
│     └─ open-above-flock-draft-wake-kit
├─ terrain-safety-domain
│  ├─ ridge-hazard-domain
│  │  └─ open-above-ridge-hazard-shelf-kit
│  └─ landing-meadow-domain
│     └─ open-above-landing-meadow-ghost-kit
├─ endurance-return-domain
│  ├─ altitude-reserve-domain
│  │  └─ open-above-altitude-reserve-meter-kit
│  └─ homeward-bearing-domain
│     └─ open-above-homeward-bearing-thread-kit
└─ renderer-handoff
   └─ open-above-flight-route-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createOpenAboveUpdraftCorridorKit(options = {}) {
  const seed = options.seed ?? "open-above-updraft-corridors";
  const lanes = Math.max(3, Math.floor(n(options.lanes, 6)));
  return {
    id: "open-above-updraft-corridor-kit",
    domain: "flight.route.lift.updraft-corridor",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const carve = clamp(n(b.carve?.turnStrength, 0));
      const frameBand = Math.floor(n(snapshot.frame) / 80);
      return Array.from({ length: lanes }, (_, index) => {
        const lift = clamp(0.24 + wave01(seed, index, frameBand) * 0.58 + speed01 * 0.16);
        return {
          id: `updraft-corridor:${index}`,
          domain: "flight.route.lift.updraft-corridor.ribbon",
          x01: clamp(0.14 + index * (0.72 / Math.max(1, lanes - 1)) + (wave01(seed, index, 7) - 0.5) * 0.06),
          y01: clamp(0.2 + wave01(seed, index, 3) * 0.48 - n(b.clearance, 190) * 0.00012),
          width01: clamp(0.09 + lift * 0.12 + carve * 0.03, 0.08, 0.24),
          liftScore: lift,
          routeValue: clamp(lift * 0.72 + speed01 * 0.2 + carve * 0.08),
          opacity: clamp(0.14 + lift * 0.42)
        };
      });
    }
  };
}

export function createOpenAboveRidgeHazardShelfKit(options = {}) {
  const seed = options.seed ?? "open-above-ridge-hazard-shelves";
  const shelves = Math.max(2, Math.floor(n(options.shelves, 5)));
  return {
    id: "open-above-ridge-hazard-shelf-kit",
    domain: "flight.route.terrain.ridge-hazard",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance = n(b.clearance, 180);
      const lowClearance = 1 - clamp(clearance / n(options.safeClearance, 260));
      const sink = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 60);
      return Array.from({ length: shelves }, (_, index) => {
        const pressure = clamp(lowClearance * 0.72 + sink * 0.18 + wave01(seed, index, Math.floor(n(snapshot.frame) / 120)) * 0.1);
        return {
          id: `ridge-hazard-shelf:${index}`,
          domain: "flight.route.terrain.ridge-hazard.shelf",
          side: index % 2 === 0 ? "left" : "right",
          x01: index % 2 === 0 ? 0.08 + index * 0.035 : 0.92 - index * 0.035,
          y01: clamp(0.56 + index * 0.06 - lowClearance * 0.2),
          length01: clamp(0.2 + pressure * 0.34 + wave01(seed, index, 2) * 0.1, 0.18, 0.68),
          hazard: pressure,
          urgency: pressure > 0.62 ? "critical" : pressure > 0.34 ? "watch" : "clear",
          opacity: clamp(0.1 + pressure * 0.54)
        };
      });
    }
  };
}

export function createOpenAboveLandingMeadowGhostKit(options = {}) {
  const seed = options.seed ?? "open-above-landing-meadows";
  const ghosts = Math.max(2, Math.floor(n(options.ghosts, 4)));
  return {
    id: "open-above-landing-meadow-ghost-kit",
    domain: "flight.route.terrain.landing-meadow",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance01 = clamp(n(b.clearance, 180) / 320);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const canLand = clamp((1 - speed01) * 0.42 + (1 - Math.abs(0.55 - clearance01)) * 0.38 + (Boolean(input(snapshot).pitchDown) ? 0.12 : 0));
      return Array.from({ length: ghosts }, (_, index) => ({
        id: `landing-meadow-ghost:${index}`,
        domain: "flight.route.terrain.landing-meadow.ghost",
        x01: clamp(0.22 + index * 0.18 + (wave01(seed, index, 1) - 0.5) * 0.08),
        y01: clamp(0.78 - canLand * 0.22 + wave01(seed, index, 2) * 0.05),
        radius01: clamp(0.04 + canLand * 0.06 + wave01(seed, index, 3) * 0.025, 0.04, 0.14),
        readiness: canLand,
        label: canLand > 0.66 ? "viable landing" : canLand > 0.38 ? "possible landing" : "too fast",
        opacity: clamp(0.12 + canLand * 0.5)
      }));
    }
  };
}

export function createOpenAboveFlockDraftWakeKit(options = {}) {
  return {
    id: "open-above-flock-draft-wake-kit",
    domain: "flight.route.lift.flock-draft",
    describe(snapshot = {}) {
      const agents = snapshot.flock?.agents ?? [];
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      return agents.slice(0, 6).map((agent, index) => ({
        id: `flock-draft-wake:${agent.id ?? index}`,
        domain: "flight.route.lift.flock-draft.wake",
        x01: clamp(0.5 + (index - (agents.length - 1) / 2) * 0.07),
        y01: clamp(0.36 + index * 0.055),
        length01: clamp(0.1 + speed01 * 0.16 + n(agent.velocity?.z, 0) * 0.0004, 0.08, 0.32),
        draftValue: clamp(0.24 + speed01 * 0.36 + index * 0.04, 0.12, 0.82),
        opacity: clamp(0.1 + speed01 * 0.38)
      }));
    }
  };
}

export function createOpenAboveAltitudeReserveMeterKit(options = {}) {
  return {
    id: "open-above-altitude-reserve-meter-kit",
    domain: "flight.route.endurance.altitude-reserve",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance = n(b.clearance, 160);
      const speed = n(b.speed, 0);
      const sink = Math.abs(Math.min(0, n(b.stability?.sinkRate, 0)));
      const reserve = clamp((clearance - n(options.criticalClearance, 55)) / n(options.reserveSpan, 260));
      const energy = clamp(speed / n(options.maxSpeed, 160) * 0.55 + reserve * 0.45 - sink * 0.004);
      return [{
        id: "altitude-reserve-meter:primary",
        domain: "flight.route.endurance.altitude-reserve.meter",
        x01: 0.09,
        y01: 0.72,
        reserve,
        energy,
        danger: clamp(1 - reserve),
        label: reserve < 0.22 ? "climb now" : reserve < 0.46 ? "low reserve" : "safe reserve",
        opacity: clamp(0.22 + (1 - reserve) * 0.44)
      }];
    }
  };
}

export function createOpenAboveHomewardBearingThreadKit(options = {}) {
  return {
    id: "open-above-homeward-bearing-thread-kit",
    domain: "flight.route.return.homeward-bearing",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const dist = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      const segments = Math.max(3, Math.floor(n(options.segments, 6)));
      return Array.from({ length: segments }, (_, index) => ({
        id: `homeward-bearing-thread:${index}`,
        domain: "flight.route.return.homeward-bearing.thread",
        x01: clamp(0.5 + (index - (segments - 1) / 2) * 0.04 + Math.sin(bearing) * 0.12),
        y01: clamp(0.18 + index * 0.08),
        distance: Math.round(dist),
        alignment,
        opacity: clamp(0.12 + alignment * 0.4 - index * 0.015),
        advice: alignment > 0.66 ? "aligned" : "turn homeward"
      }));
    }
  };
}

export function createOpenAboveFlightRouteRendererHandoffKit(options = {}) {
  return {
    id: "open-above-flight-route-renderer-handoff-kit",
    domain: "flight.route.renderer-handoff",
    compose(groups = {}) {
      const descriptors = {
        updraftCorridors: clone(groups.updraftCorridors ?? []),
        ridgeHazardShelves: clone(groups.ridgeHazardShelves ?? []),
        landingMeadowGhosts: clone(groups.landingMeadowGhosts ?? []),
        flockDraftWakes: clone(groups.flockDraftWakes ?? []),
        altitudeReserveMeters: clone(groups.altitudeReserveMeters ?? []),
        homewardBearingThreads: clone(groups.homewardBearingThreads ?? [])
      };
      return {
        id: "open-above-flight-route-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererOwns: ["DOM overlay placement", "CSS styling", "presentation timing"],
        rendererDoesNotOwn: ["route scoring", "terrain safety truth", "flight physics", "browser input", "asset loading", "frame-loop ownership"],
        descriptors,
        flatDescriptors: Object.values(descriptors).flat(),
        counts: {
          updraftCorridors: count(descriptors.updraftCorridors),
          ridgeHazardShelves: count(descriptors.ridgeHazardShelves),
          landingMeadowGhosts: count(descriptors.landingMeadowGhosts),
          flockDraftWakes: count(descriptors.flockDraftWakes),
          altitudeReserveMeters: count(descriptors.altitudeReserveMeters),
          homewardBearingThreads: count(descriptors.homewardBearingThreads),
          total: totalCount(descriptors)
        }
      };
    }
  };
}

export function createOpenAboveFlightRouteReadabilityDomainKit(options = {}) {
  const updraftCorridors = options.updraftCorridors ?? createOpenAboveUpdraftCorridorKit(options.updrafts);
  const ridgeHazards = options.ridgeHazards ?? createOpenAboveRidgeHazardShelfKit(options.ridges);
  const landingMeadows = options.landingMeadows ?? createOpenAboveLandingMeadowGhostKit(options.landings);
  const flockDrafts = options.flockDrafts ?? createOpenAboveFlockDraftWakeKit(options.flockDraftsOptions);
  const altitudeReserve = options.altitudeReserve ?? createOpenAboveAltitudeReserveMeterKit(options.altitude);
  const homewardBearing = options.homewardBearing ?? createOpenAboveHomewardBearingThreadKit(options.return);
  const handoff = options.handoff ?? createOpenAboveFlightRouteRendererHandoffKit(options.handoffOptions);
  return {
    id: "open-above-flight-route-readability-domain-kit",
    domain: "open-above.flight-route-readability",
    tree: OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE,
    compose(snapshot = {}) {
      const groups = {
        updraftCorridors: updraftCorridors.describe(snapshot),
        ridgeHazardShelves: ridgeHazards.describe(snapshot),
        landingMeadowGhosts: landingMeadows.describe(snapshot),
        flockDraftWakes: flockDrafts.describe(snapshot),
        altitudeReserveMeters: altitudeReserve.describe(snapshot),
        homewardBearingThreads: homewardBearing.describe(snapshot)
      };
      const rendererHandoff = handoff.compose(groups);
      return {
        id: "open-above-flight-route-readability",
        version: "2026-07-08-flight-route-readability",
        tree: OPEN_ABOVE_FLIGHT_ROUTE_READABILITY_TREE,
        groups,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          urgentRidgeHazards: groups.ridgeHazardShelves.filter((shelf) => shelf.urgency === "critical").length,
          landingOptions: groups.landingMeadowGhosts.filter((ghost) => ghost.readiness > 0.5).length,
          updraftOptions: groups.updraftCorridors.filter((corridor) => corridor.routeValue > 0.5).length
        }
      };
    }
  };
}
