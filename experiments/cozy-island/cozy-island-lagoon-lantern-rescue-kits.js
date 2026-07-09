export const COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE = `
cozy-island-lagoon-lantern-rescue-readiness-domain
├─ night-navigation-domain
│  ├─ lantern-buoy-domain
│  │  └─ cozy-island-lantern-buoy-chain-kit
│  └─ firefly-jar-domain
│     └─ cozy-island-firefly-jar-waypoint-kit
├─ shoreline-shelter-domain
│  ├─ rain-tarp-anchor-domain
│  │  └─ cozy-island-rain-tarp-anchor-kit
│  └─ woven-fish-trap-domain
│     └─ cozy-island-woven-fish-trap-kit
├─ dawn-rescue-domain
│  ├─ signal-kite-domain
│  │  └─ cozy-island-signal-kite-spool-kit
│  └─ outrigger-pickup-domain
│     └─ cozy-island-outrigger-pickup-window-kit
└─ renderer-handoff
   └─ cozy-island-lagoon-lantern-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const COZY_ISLAND_LAGOON_LANTERN_FORBIDDEN_OWNERSHIP = [
  "NexusRealtime",
  "document.",
  "window.",
  "HTMLElement",
  "THREE.",
  "WebGL",
  "AudioContext",
  "requestAnimationFrame",
  "addEventListener",
  "physics"
];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const vec = (value = {}, fallback = {}) => ({
  x: num(value.x, fallback.x ?? 0),
  y: num(value.y, fallback.y ?? 0),
  z: num(value.z, fallback.z ?? 0)
});
const round = (value, digits = 3) => Number(num(value).toFixed(digits));
const hash01 = (seed = "cozy-lagoon-lantern") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};
const polarPoint = (radius, angle, y = 0) => ({ x: round(Math.cos(angle) * radius), y: round(y), z: round(Math.sin(angle) * radius) });
const descriptor = (kind, id, position, state = {}) => ({ kind, id, position: vec(position), state });

function lagoonSnapshot(input = {}) {
  const seed = input.seed ?? "cozy-island-lagoon-lantern-rescue";
  const tide = clamp01(input.tide ?? 0.44);
  const moon = clamp01(input.moon ?? input.moonPhase ?? input.timeOfDay ?? 0.55);
  const fog = clamp01(input.fog ?? input.weather?.fog ?? 0.26);
  const rain = clamp01(input.rain ?? input.weather?.rain ?? input.stormRisk ?? 0.22);
  const wind = vec(input.wind ?? { x: 0.14, y: 0, z: -0.2 });
  const hunger = clamp01(input.hunger ?? 0.35);
  const rescuedGuests = Math.max(0, Math.round(num(input.rescuedGuests, input.guests ?? 3)));
  const volunteerCoverage = clamp01(input.volunteerCoverage ?? 0.52);
  const waterClarity = clamp01(input.waterClarity ?? input.lagoonClarity ?? 0.62);
  const camp = vec(input.camp ?? { x: 6, y: 0.2, z: -8 });
  const lagoonRadius = num(input.lagoonRadius, 56);
  const beachRadius = num(input.beachRadius, 78);
  const rescueNeed = clamp01(fog * 0.23 + rain * 0.2 + (1 - moon) * 0.16 + (1 - waterClarity) * 0.13 + hunger * 0.11 + (1 - volunteerCoverage) * 0.17);
  return { seed, tide, moon, fog, rain, wind, hunger, rescuedGuests, volunteerCoverage, waterClarity, camp, lagoonRadius, beachRadius, rescueNeed };
}

export function createCozyIslandLanternBuoyChainKit(input = {}) {
  const s = lagoonSnapshot(input);
  const base = hash01(`${s.seed}:lantern-buoy`);
  const count = s.fog > 0.64 || s.moon < 0.28 ? 6 : 5;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 0.74;
    const tideOffset = (s.tide - 0.5) * 5;
    return descriptor("cozy-island.lantern-buoy-chain", `lantern-buoy-${i + 1}`, polarPoint(s.lagoonRadius + tideOffset + i * 1.4, angle, 0.18), {
      glowStrength: round(clamp01(0.35 + s.fog * 0.32 + (1 - s.moon) * 0.22 + i * 0.025)),
      driftGuard: round(clamp01(Math.abs(s.wind.x) + Math.abs(s.wind.z) * 0.5 + s.tide * 0.18)),
      routePriority: round(clamp01(s.rescueNeed * 0.58 + s.fog * 0.24 + i * 0.02))
    });
  });
}

export function createCozyIslandFireflyJarWaypointKit(input = {}) {
  const s = lagoonSnapshot(input);
  const base = hash01(`${s.seed}:firefly-jar`);
  const count = s.volunteerCoverage < 0.38 ? 5 : 4;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.04;
    return descriptor("cozy-island.firefly-jar-waypoint", `firefly-jar-${i + 1}`, polarPoint(s.beachRadius - 24 + i * 3.2, angle, 1.24), {
      blinkCadence: round(0.42 + i * 0.08 + s.moon * 0.1),
      volunteerGap: round(clamp01(1 - s.volunteerCoverage + i * 0.025)),
      waypointClarity: round(clamp01(s.moon * 0.24 + s.waterClarity * 0.22 + (1 - s.fog) * 0.28 + s.volunteerCoverage * 0.18))
    });
  });
}

export function createCozyIslandRainTarpAnchorKit(input = {}) {
  const s = lagoonSnapshot(input);
  const base = hash01(`${s.seed}:rain-tarp`);
  const count = s.rain > 0.62 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.53;
    return descriptor("cozy-island.rain-tarp-anchor", `rain-tarp-anchor-${i + 1}`, polarPoint(s.beachRadius - 34 + i * 4.8, angle, 0.22), {
      rainLoad: round(clamp01(s.rain + i * 0.04)),
      lashUrgency: round(clamp01(s.rain * 0.48 + Math.abs(s.wind.x) * 0.3 + Math.abs(s.wind.z) * 0.3)),
      shelteredGuests: Math.max(1, Math.round(1 + s.rescuedGuests * 0.4 + i % 2))
    });
  });
}

export function createCozyIslandWovenFishTrapKit(input = {}) {
  const s = lagoonSnapshot(input);
  const base = hash01(`${s.seed}:fish-trap`);
  const count = s.hunger > 0.7 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.78;
    return descriptor("cozy-island.woven-fish-trap", `woven-fish-trap-${i + 1}`, polarPoint(s.lagoonRadius - 12 + i * 3.8, angle, -0.03), {
      catchChance: round(clamp01(s.waterClarity * 0.46 + (1 - s.tide) * 0.18 + (1 - s.rain) * 0.16 - i * 0.025)),
      hungerRelief: round(clamp01(s.hunger * 0.58 + i * 0.035)),
      resetPriority: round(clamp01(s.hunger * 0.46 + s.rain * 0.16 + s.rescueNeed * 0.18))
    });
  });
}

export function createCozyIslandSignalKiteSpoolKit(input = {}) {
  const s = lagoonSnapshot(input);
  const base = hash01(`${s.seed}:signal-kite`);
  const count = s.wind.x * s.wind.x + s.wind.z * s.wind.z > 0.12 ? 3 : 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.08;
    return descriptor("cozy-island.signal-kite-spool", `signal-kite-spool-${i + 1}`, polarPoint(s.beachRadius - 8 + i * 2.4, angle, 2.6 + i * 0.45), {
      liftReadiness: round(clamp01(Math.abs(s.wind.x) * 0.45 + Math.abs(s.wind.z) * 0.45 + (1 - s.rain) * 0.2)),
      visibility: round(clamp01((1 - s.fog) * 0.44 + s.moon * 0.22 + (1 - s.rain) * 0.18)),
      launchPriority: round(clamp01(s.rescueNeed * 0.5 + s.rescuedGuests * 0.05 + i * 0.04))
    });
  });
}

export function createCozyIslandOutriggerPickupWindowKit(input = {}) {
  const s = lagoonSnapshot(input);
  const readiness = clamp01((1 - Math.abs(s.tide - 0.36) * 1.8) * 0.36 + s.waterClarity * 0.26 + (1 - s.fog) * 0.18 + (1 - s.rain) * 0.14 + s.volunteerCoverage * 0.06);
  return [descriptor("cozy-island.outrigger-pickup-window", "outrigger-pickup-main", { x: s.camp.x + 16, y: s.camp.y + 0.16, z: s.camp.z - 18 }, {
    pickupReadiness: round(readiness),
    safeMinutes: Math.max(4, Math.round(6 + readiness * 18 - s.fog * 4 - s.rain * 3)),
    passengerCapacity: Math.max(2, Math.round(2 + s.rescuedGuests * 0.65)),
    priority: readiness < 0.42 ? "hold lantern line" : s.fog > 0.58 ? "sound shore bell" : s.rain > 0.58 ? "tighten tarp anchors" : "launch outrigger"
  })];
}

export function createCozyIslandLagoonLanternRescueRendererHandoffKit(readiness = {}) {
  const descriptors = [
    ...(readiness.lanternBuoyChains ?? []),
    ...(readiness.fireflyJarWaypoints ?? []),
    ...(readiness.rainTarpAnchors ?? []),
    ...(readiness.wovenFishTraps ?? []),
    ...(readiness.signalKiteSpools ?? []),
    ...(readiness.outriggerPickupWindows ?? [])
  ];
  return {
    kind: "cozy-island.lagoon-lantern-rescue.renderer-handoff",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    counts: {
      lanternBuoyChains: readiness.lanternBuoyChains?.length ?? 0,
      fireflyJarWaypoints: readiness.fireflyJarWaypoints?.length ?? 0,
      rainTarpAnchors: readiness.rainTarpAnchors?.length ?? 0,
      wovenFishTraps: readiness.wovenFishTraps?.length ?? 0,
      signalKiteSpools: readiness.signalKiteSpools?.length ?? 0,
      outriggerPickupWindows: readiness.outriggerPickupWindows?.length ?? 0,
      total: descriptors.length
    }
  };
}

export function createCozyIslandLagoonLanternRescueReadinessDomainKit(defaultInput = {}) {
  return {
    id: "cozy-island-lagoon-lantern-rescue-readiness-domain-kit",
    domainTree: COZY_ISLAND_LAGOON_LANTERN_RESCUE_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "cozy-island-lantern-buoy-chain-kit",
      "cozy-island-firefly-jar-waypoint-kit",
      "cozy-island-rain-tarp-anchor-kit",
      "cozy-island-woven-fish-trap-kit",
      "cozy-island-signal-kite-spool-kit",
      "cozy-island-outrigger-pickup-window-kit",
      "cozy-island-lagoon-lantern-rescue-renderer-handoff-kit"
    ],
    evaluate(input = {}) {
      const snapshot = lagoonSnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "cozy-island.lagoon-lantern-rescue.readiness",
        snapshot,
        lanternBuoyChains: createCozyIslandLanternBuoyChainKit(snapshot),
        fireflyJarWaypoints: createCozyIslandFireflyJarWaypointKit(snapshot),
        rainTarpAnchors: createCozyIslandRainTarpAnchorKit(snapshot),
        wovenFishTraps: createCozyIslandWovenFishTrapKit(snapshot),
        signalKiteSpools: createCozyIslandSignalKiteSpoolKit(snapshot),
        outriggerPickupWindows: createCozyIslandOutriggerPickupWindowKit(snapshot),
        summary: {
          rescueNeed: round(snapshot.rescueNeed),
          topConcern: snapshot.fog > 0.62 ? "lantern buoys" : snapshot.rain > 0.62 ? "tarp anchors" : snapshot.hunger > 0.72 ? "fish traps" : snapshot.volunteerCoverage < 0.36 ? "firefly waypoints" : "outrigger pickup"
        }
      };
      readiness.rendererHandoff = createCozyIslandLagoonLanternRescueRendererHandoffKit(readiness);
      return readiness;
    }
  };
}
