const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "physics",
  "network",
  "storage"
]);

export const STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE = `stonewake-glowworm-cartography-readiness-domain
├─ luminous-survey-domain
│  ├─ glowworm-cluster-domain
│  │  └─ stonewake-glowworm-cluster-kit
│  └─ phosphate-wall-chart-domain
│     └─ stonewake-phosphate-wall-chart-kit
├─ route-marking-domain
│  ├─ chalk-arrow-domain
│  │  └─ stonewake-chalk-arrow-trail-kit
│  └─ rope-handline-domain
│     └─ stonewake-rope-handline-marker-kit
├─ rescue-handoff-domain
│  ├─ cave-bell-node-domain
│  │  └─ stonewake-cave-bell-node-kit
│  └─ dawn-cartography-ledger-domain
│     └─ stonewake-dawn-cartography-ledger-kit
└─ renderer-handoff
   └─ stonewake-glowworm-cartography-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const STONEWAKE_GLOWWORM_CARTOGRAPHY_KITS = Object.freeze([
  "stonewake-glowworm-cluster-kit",
  "stonewake-phosphate-wall-chart-kit",
  "stonewake-chalk-arrow-trail-kit",
  "stonewake-rope-handline-marker-kit",
  "stonewake-cave-bell-node-kit",
  "stonewake-dawn-cartography-ledger-kit",
  "stonewake-glowworm-cartography-renderer-handoff-kit",
  "stonewake-glowworm-cartography-readiness-domain-kit"
]);

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Math.round(finite(value) * 10 ** digits) / 10 ** digits;
const center = (thing = {}) => ({ x: finite(thing.x) + finite(thing.w) * 0.5, y: finite(thing.y) + finite(thing.h) * 0.5 });
const distance = (a, b) => Math.hypot(finite(a?.x) - finite(b?.x), finite(a?.y) - finite(b?.y));
const objectByType = (level = {}, type) => (level.objects ?? []).find((object) => object.type === type) ?? null;
const routePlatforms = (level = {}) => (level.platforms ?? []).filter((platform) => !["boundary", "floor"].includes(platform.role)).sort((a, b) => finite(a.x) - finite(b.x));
const platformTop = (platform = {}) => ({ x: finite(platform.x) + finite(platform.w) * 0.5, y: finite(platform.y) });
const fallbackPlatforms = (count = 8) => Array.from({ length: count }, (_, index) => ({ id: `fallback-${index + 1}`, x: 160 + index * 240, y: 570 - (index % 4) * 52, w: 130, h: 20, role: "route" }));

function waterLine({ state = {}, level = {} } = {}) {
  return finite(state.water?.level, level.bounds?.height ?? 720);
}

function playerProgress({ state = {}, level = {} } = {}) {
  const width = Math.max(1, finite(level.bounds?.width, 3000) - 280);
  return clamp((finite(state.player?.x, 90) - 90) / width, 0, 1);
}

function cartographyReadiness({ state = {}, level = {} } = {}) {
  const playerBottom = finite(state.player?.y, 0) + finite(state.player?.h, 46);
  const headroom = clamp((waterLine({ state, level }) - playerBottom) / 420, 0, 1);
  return clamp(
    playerProgress({ state, level }) * 0.26 +
    clamp(state.valve, 0, 1) * 0.2 +
    clamp(state.door, 0, 1) * 0.19 +
    (state.plate ? 0.12 : 0) +
    headroom * 0.15 +
    (state.carry ? 0.08 : 0.16) * 0.08,
    0,
    1
  );
}

function darknessRisk({ state = {}, level = {} } = {}) {
  const playerBottom = finite(state.player?.y, 0) + finite(state.player?.h, 46);
  const floodRisk = 1 - clamp((waterLine({ state, level }) - playerBottom) / 420, 0, 1);
  return clamp(floodRisk * 0.32 + (1 - clamp(state.door, 0, 1)) * 0.22 + (1 - clamp(state.valve, 0, 1)) * 0.18 + (1 - playerProgress({ state, level })) * 0.18 + (state.carry ? 0.1 : 0), 0, 1);
}

function phaseFrom(readiness, risk) {
  if (readiness >= 0.84) return "cartography-handoff-ready";
  if (risk >= 0.74) return "lost-route-warning";
  if (readiness >= 0.56) return "handline-route-marked";
  return "glowworm-survey-staged";
}

function makeKit(id, describe) {
  return { id, ownership: { excludes: FORBIDDEN_OWNERSHIP }, describe };
}

export function createStonewakeGlowwormClusterKit() {
  return makeKit("stonewake-glowworm-cluster-kit", ({ state = {}, level = {}, count = 7 } = {}) => {
    const platforms = routePlatforms(level).length ? routePlatforms(level) : fallbackPlatforms(count);
    const player = center(state.player ?? {});
    const risk = darknessRisk({ state, level });
    return platforms.slice(0, count).map((platform, index) => {
      const p = platformTop(platform);
      const d = distance(p, player);
      return {
        kind: "glowworm-cluster",
        id: `glowworm-cluster-${platform.id ?? index + 1}`,
        x: round(p.x + (index % 2 ? 42 : -42)),
        y: round(p.y - 54 - (index % 3) * 8),
        pulse: round(clamp(0.28 + risk * 0.52 - d / 5200 + index * 0.018, 0.12, 1)),
        density: round(clamp(0.36 + (index % 4) * 0.11 + risk * 0.22, 0, 1)),
        cue: d < 240 ? "player-near" : risk > 0.64 ? "brighten-route" : "ambient-map"
      };
    });
  });
}

export function createStonewakePhosphateWallChartKit() {
  return makeKit("stonewake-phosphate-wall-chart-kit", ({ state = {}, level = {}, count = 5 } = {}) => {
    const platforms = routePlatforms(level).length ? routePlatforms(level) : fallbackPlatforms(count);
    const progress = playerProgress({ state, level });
    const risk = darknessRisk({ state, level });
    return platforms.slice(0, count).map((platform, index) => {
      const p = platformTop(platform);
      return {
        kind: "phosphate-wall-chart",
        id: `phosphate-wall-chart-${platform.id ?? index + 1}`,
        x: round(p.x + 66),
        y: round(p.y - 112),
        legibility: round(clamp(0.34 + progress * 0.4 - risk * 0.18 + index * 0.025, 0.08, 1)),
        routeRune: index === 0 ? "entry-cairn" : index === count - 1 ? "exit-lock" : `mid-cavern-${index}`,
        state: risk > 0.7 ? "rub-before-flood" : progress > 0.52 ? "copied" : "unread"
      };
    });
  });
}

export function createStonewakeChalkArrowTrailKit() {
  return makeKit("stonewake-chalk-arrow-trail-kit", ({ state = {}, level = {}, count = 8 } = {}) => {
    const platforms = routePlatforms(level).length ? routePlatforms(level) : fallbackPlatforms(count);
    const readiness = cartographyReadiness({ state, level });
    return platforms.slice(0, count).map((platform, index) => {
      const p = platformTop(platform);
      const q = platformTop(platforms[Math.min(platforms.length - 1, index + 1)] ?? platform);
      return {
        kind: "chalk-arrow-trail",
        id: `chalk-arrow-${platform.id ?? index + 1}`,
        x: round(p.x),
        y: round(p.y - 18),
        angle: round(Math.atan2(q.y - p.y, q.x - p.x), 4),
        visibility: round(clamp(0.22 + readiness * 0.58 - index * 0.018, 0.08, 1)),
        arrowIndex: index + 1
      };
    });
  });
}

export function createStonewakeRopeHandlineMarkerKit() {
  return makeKit("stonewake-rope-handline-marker-kit", ({ state = {}, level = {}, count = 6 } = {}) => {
    const platforms = routePlatforms(level).length ? routePlatforms(level) : fallbackPlatforms(count);
    const valve = objectByType(level, "valve") ?? platforms[1] ?? { x: 360, y: 420 };
    const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 3000) - 200, y: 300 };
    const anchors = [valve, ...platforms.slice(1, Math.max(2, count)), gate].slice(0, count + 1);
    const readiness = cartographyReadiness({ state, level });
    return anchors.slice(0, -1).map((anchor, index) => {
      const next = anchors[index + 1];
      const from = "w" in anchor ? platformTop(anchor) : { x: finite(anchor.x), y: finite(anchor.y) };
      const to = "w" in next ? platformTop(next) : { x: finite(next.x), y: finite(next.y) };
      return {
        kind: "rope-handline-marker",
        id: `rope-handline-${index + 1}`,
        from: { x: round(from.x), y: round(from.y - 28) },
        to: { x: round(to.x), y: round(to.y - 28) },
        tension: round(clamp(0.18 + readiness * 0.68 - index * 0.03, 0.08, 1)),
        knotCount: 4 + index,
        state: readiness > 0.68 ? "tight" : "needs-tie"
      };
    });
  });
}

export function createStonewakeCaveBellNodeKit() {
  return makeKit("stonewake-cave-bell-node-kit", ({ state = {}, level = {}, count = 4 } = {}) => {
    const readiness = cartographyReadiness({ state, level });
    const risk = darknessRisk({ state, level });
    const platforms = routePlatforms(level).length ? routePlatforms(level).slice(-count - 1) : fallbackPlatforms(count);
    return platforms.slice(0, count).map((platform, index) => {
      const p = platformTop(platform);
      return {
        kind: "cave-bell-node",
        id: `cave-bell-node-${platform.id ?? index + 1}`,
        x: round(p.x - 26),
        y: round(p.y - 82),
        resonance: round(clamp(0.3 + readiness * 0.46 + index * 0.04, 0, 1)),
        urgency: round(clamp(risk - index * 0.08, 0, 1)),
        signal: risk > 0.72 ? "three-fast-rings" : readiness > 0.72 ? "all-clear" : "one-slow-ring"
      };
    });
  });
}

export function createStonewakeDawnCartographyLedgerKit() {
  return makeKit("stonewake-dawn-cartography-ledger-kit", ({ state = {}, level = {} } = {}) => {
    const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 3000) - 180, y: 300 };
    const readiness = cartographyReadiness({ state, level });
    const risk = darknessRisk({ state, level });
    const phase = phaseFrom(readiness, risk);
    return {
      kind: "dawn-cartography-ledger",
      id: "dawn-cartography-ledger",
      x: round(finite(gate.x) - 92),
      y: round(finite(gate.y) + 128),
      readiness: round(readiness),
      darknessRisk: round(risk),
      phase,
      chartedSegments: Math.max(0, Math.round(readiness * 9 - risk * 2)),
      nextAction: phase === "cartography-handoff-ready" ? "Carry copied wall charts through the opened lock." : phase === "lost-route-warning" ? "Light glowworm clusters and tie the nearest handline before water hides the chalk." : phase === "handline-route-marked" ? "Ring cave bells and finish the exit chart." : "Survey phosphate wall charts and start the chalk trail."
    };
  });
}

export function createStonewakeGlowwormCartographyRendererHandoffKit() {
  return makeKit("stonewake-glowworm-cartography-renderer-handoff-kit", (descriptors = {}) => {
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return { id: "stonewake-glowworm-cartography-renderer-handoff", contract: "renderer-consumes-descriptors-only", rendererConsumesDescriptorsOnly: true, descriptors, counts: { ...counts, total } };
  });
}

export function createStonewakeGlowwormCartographyReadinessDomainKit() {
  const glowwormClusterKit = createStonewakeGlowwormClusterKit();
  const phosphateWallChartKit = createStonewakePhosphateWallChartKit();
  const chalkArrowTrailKit = createStonewakeChalkArrowTrailKit();
  const ropeHandlineMarkerKit = createStonewakeRopeHandlineMarkerKit();
  const caveBellNodeKit = createStonewakeCaveBellNodeKit();
  const dawnCartographyLedgerKit = createStonewakeDawnCartographyLedgerKit();
  const rendererHandoffKit = createStonewakeGlowwormCartographyRendererHandoffKit();
  return {
    id: "stonewake-glowworm-cartography-readiness-domain-kit",
    tree: STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE,
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    kits: STONEWAKE_GLOWWORM_CARTOGRAPHY_KITS,
    describe(input = {}) {
      const glowwormClusters = glowwormClusterKit.describe({ ...input, count: 7 });
      const phosphateWallCharts = phosphateWallChartKit.describe({ ...input, count: 5 });
      const chalkArrowTrails = chalkArrowTrailKit.describe({ ...input, count: 8 });
      const ropeHandlineMarkers = ropeHandlineMarkerKit.describe({ ...input, count: 6 });
      const caveBellNodes = caveBellNodeKit.describe({ ...input, count: 4 });
      const dawnCartographyLedger = dawnCartographyLedgerKit.describe(input);
      const readiness = cartographyReadiness(input);
      const risk = darknessRisk(input);
      const missionState = phaseFrom(readiness, risk);
      const descriptors = { glowwormClusters, phosphateWallCharts, chalkArrowTrails, ropeHandlineMarkers, caveBellNodes, dawnCartographyLedger };
      return {
        id: "stonewake-glowworm-cartography-readiness",
        domain: "stonewake-glowworm-cartography-readiness-domain",
        tree: STONEWAKE_GLOWWORM_CARTOGRAPHY_TREE,
        kits: STONEWAKE_GLOWWORM_CARTOGRAPHY_KITS,
        readiness: round(readiness),
        darknessRisk: round(risk),
        missionState,
        glowwormClusters,
        phosphateWallCharts,
        chalkArrowTrails,
        ropeHandlineMarkers,
        caveBellNodes,
        dawnCartographyLedger,
        rendererHandoff: rendererHandoffKit.describe(descriptors)
      };
    }
  };
}
