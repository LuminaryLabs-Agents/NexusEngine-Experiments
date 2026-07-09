const arr = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
const r = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));

function routePoints(level = {}) {
  const route = arr(level.route ?? level.path ?? level.waypoints);
  if (route.length) {
    return route.map((point, index) => ({
      id: point.id ?? `route-${index}`,
      x: Number(point.x ?? point.position?.x ?? 0),
      z: Number(point.z ?? point.position?.z ?? point.position?.y ?? index * 9)
    }));
  }
  return [
    { id: "trailhead-kennel", x: -16, z: -6 },
    { id: "scent-break-marsh", x: -12, z: 5 },
    { id: "cedar-whistle-post", x: -6, z: 16 },
    { id: "blanket-cache-ridge", x: 1, z: 28 },
    { id: "sled-handoff-copse", x: 8, z: 43 },
    { id: "handler-dawn-safehouse", x: 3, z: 60 }
  ];
}

const pick = (points, index) => points[Math.min(points.length - 1, Math.max(0, index))] ?? { id: "fallback", x: 0, z: 0 };
function player(game = {}) {
  const p = game.player ?? game.avatar ?? {};
  return {
    z: Number(p.z ?? p.position?.z ?? 0),
    scan: Boolean(game.scanActive ?? game.scanning ?? p.scan),
    focus: String(game.focus ?? game.tool ?? p.tool ?? "scan")
  };
}
function progress(game = {}, level = {}) {
  const b = level.bounds ?? { minZ: -8, maxZ: 62 };
  return clamp((player(game).z - Number(b.minZ ?? -8)) / Math.max(1, Number(b.maxZ ?? 62) - Number(b.minZ ?? -8)));
}
function fogPressure(input = {}) {
  const game = input.game ?? {};
  const base = Number(game.fogPressure ?? game.visibilityPressure ?? game.hazardPressure ?? 0.55);
  const cold = Number(game.coldPressure ?? game.exposurePressure ?? 0.24);
  return clamp(base + cold * 0.16 + Math.sin(Number(input.time ?? 0) * 0.39 + 0.7) * 0.04 + (player(game).scan ? -0.07 : 0));
}
function rescueReadiness(input = {}) {
  const game = input.game ?? {};
  return clamp(
    0.1 +
    Number(game.scans ?? game.scanCount ?? game.markedRoutes ?? 0) * 0.05 +
    Number(game.scentMarks ?? game.dogScentMarks ?? 0) * 0.07 +
    Number(game.blanketCaches ?? game.resources ?? 0) * 0.06 +
    Number(game.survivorsEscorted ?? game.escorts ?? 0) * 0.075 +
    progress(game, input.level) * 0.44 +
    (player(game).focus === "handler" || player(game).focus === "dog" ? 0.08 : 0) +
    (player(game).scan ? 0.055 : 0) -
    fogPressure(input) * 0.095
  );
}
const contract = (owner) => ({
  owner,
  rendererConsumes: "serializable search dog rescue descriptors only",
  rendererMustOwn: ["screen placement", "draw order", "color application", "overlay animation"],
  rendererMustNotOwn: ["simulation state", "browser input", "DOM ownership", "collision", "asset loading", "sound", "timing loop", "Three.js runtime", "WebGL runtime", "network", "storage"]
});

export const FOGLINE_SEARCH_DOG_RESCUE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "fogline-search-dog-rescue-readiness-domain",
  subdomains: [
    {
      id: "search-grid-domain",
      subdomains: [
        { id: "scent-ribbon-domain", kits: ["fogline-scent-ribbon-trail-kit"] },
        { id: "pawprint-grid-domain", kits: ["fogline-pawprint-grid-marker-kit"] }
      ]
    },
    {
      id: "survivor-warmth-domain",
      subdomains: [
        { id: "handler-whistle-domain", kits: ["fogline-handler-whistle-post-kit"] },
        { id: "thermal-blanket-domain", subdomains: [{ id: "blanket-cache-domain", kits: ["fogline-thermal-blanket-cache-kit"] }] }
      ]
    },
    {
      id: "evacuation-handoff-domain",
      subdomains: [
        { id: "rescue-sled-domain", kits: ["fogline-rescue-sled-route-kit"] },
        { id: "dawn-handler-ledger-domain", kits: ["fogline-dawn-handler-ledger-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["fogline-search-dog-rescue-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes descriptors only; reusable kits do not own renderer, DOM, input, assets, audio, storage, physics, graphics runtime, or frame-loop ownership"
});

export const FOGLINE_SEARCH_DOG_RESCUE_KITS = Object.freeze([
  "fogline-scent-ribbon-trail-kit",
  "fogline-pawprint-grid-marker-kit",
  "fogline-handler-whistle-post-kit",
  "fogline-thermal-blanket-cache-kit",
  "fogline-rescue-sled-route-kit",
  "fogline-dawn-handler-ledger-kit",
  "fogline-search-dog-rescue-renderer-handoff-kit",
  "fogline-search-dog-rescue-readiness-domain-kit"
]);

function descriptor(input, point, index, kind, bucket, metric, color, extra = {}) {
  return {
    id: `${kind}-${point.id}-${index}`,
    kind,
    compatibleBucket: bucket,
    position: { x: r(point.x + (index - 1.5) * 0.52), y: r(0.18 + metric * 1.6), z: r(point.z + index * 0.38) },
    radius: r(0.5 + metric * 1.25),
    opacity: r(0.11 + metric * 0.34),
    strength: r(metric),
    color,
    ...extra,
    rendererContract: contract(`fogline-${kind}-kit`)
  };
}
function kit(id, domain, indices, kind, bucket, metricFn, color, extraFn = () => ({})) {
  return {
    id: `n-${id}`,
    domain,
    describe(input = {}) {
      const points = routePoints(input.level);
      return indices.map((index, slot) => descriptor(input, pick(points, index), slot, kind, bucket, clamp(metricFn(input, slot)), color, extraFn(input, slot)));
    }
  };
}

export const createFoglineScentRibbonTrailKit = () => kit(
  "fogline-scent-ribbon-trail-kit",
  "fogline-search-dog-rescue/search-grid/scent-ribbon",
  [0, 1, 2, 4],
  "scent-ribbon-trail",
  "routeThreads",
  (input, i) => 0.18 + rescueReadiness(input) * 0.48 + Number(input.game?.scentMarks ?? input.game?.dogScentMarks ?? 0) * 0.055 + i * 0.045 - fogPressure(input) * 0.08,
  "#a8fff4",
  (input, i) => ({ yaw: r(0.25 + i * 0.4 + fogPressure(input) * 0.2), length: r(4.6 + rescueReadiness(input) * 5.4) })
);
export const createFoglinePawprintGridMarkerKit = () => kit(
  "fogline-pawprint-grid-marker-kit",
  "fogline-search-dog-rescue/search-grid/pawprint-grid",
  [0, 1, 2, 3, 4, 5],
  "pawprint-grid-marker",
  "groundGlyphs",
  (input, i) => 0.16 + rescueReadiness(input) * 0.34 + Number(input.game?.scans ?? input.game?.scanCount ?? 0) * 0.038 + i * 0.026 - fogPressure(input) * 0.035,
  "#d8fff1",
  (input, i) => ({ heading: r(-0.35 + i * 0.22 + progress(input.game ?? {}, input.level) * 0.4) })
);
export const createFoglineHandlerWhistlePostKit = () => kit(
  "fogline-handler-whistle-post-kit",
  "fogline-search-dog-rescue/survivor-warmth/handler-whistle",
  [1, 3, 5],
  "handler-whistle-post",
  "signalBeacons",
  (input, i) => 0.2 + rescueReadiness(input) * 0.44 + (player(input.game ?? {}).focus === "handler" ? 0.09 : 0) + i * 0.07 - fogPressure(input) * 0.075,
  "#fff0a8"
);
export const createFoglineThermalBlanketCacheKit = () => kit(
  "fogline-thermal-blanket-cache-kit",
  "fogline-search-dog-rescue/survivor-warmth/thermal-blanket-cache",
  [2, 3, 4],
  "thermal-blanket-cache",
  "supplyCaches",
  (input, i) => 0.22 + Number(input.game?.blanketCaches ?? input.game?.resources ?? 0) * 0.08 + rescueReadiness(input) * 0.36 - fogPressure(input) * 0.06 + i * 0.055,
  "#ffb8d6"
);
export const createFoglineRescueSledRouteKit = () => kit(
  "fogline-rescue-sled-route-kit",
  "fogline-search-dog-rescue/evacuation-handoff/rescue-sled-route",
  [4, 5],
  "rescue-sled-route",
  "handoffTokens",
  (input, i) => 0.2 + rescueReadiness(input) * 0.52 + Number(input.game?.survivorsEscorted ?? input.game?.escorts ?? 0) * 0.07 + i * 0.06,
  "#baffc9"
);

export function createFoglineDawnHandlerLedgerKit() {
  return {
    id: "n-fogline-dawn-handler-ledger-kit",
    domain: "fogline-search-dog-rescue/evacuation-handoff/dawn-handler-ledger",
    describe(input = {}, groups = {}) {
      const all = Object.values(groups).flatMap(arr);
      const avg = all.reduce((sum, item) => sum + Number(item.strength ?? 0), 0) / Math.max(1, all.length);
      const state = clamp(avg * 0.7 + rescueReadiness(input) * 0.38 - fogPressure(input) * 0.1);
      const safehouse = pick(routePoints(input.level), routePoints(input.level).length - 1);
      return [{
        id: "dawn-handler-ledger-primary",
        kind: "dawn-handler-ledger",
        compatibleBucket: "summaryLedgers",
        position: { x: r(safehouse.x), y: 0.92, z: r(safehouse.z + 2.35) },
        readiness: r(state),
        pressure: r(fogPressure(input)),
        missionState: state > 0.74 ? "handler-team-ready" : state > 0.52 ? "scent-grid-linked" : fogPressure(input) > 0.7 ? "dogs-fogbound" : "casting-search-grid",
        descriptorSummary: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, arr(value).length])),
        radius: r(1 + state * 1.25),
        opacity: r(0.17 + state * 0.32),
        color: state > 0.7 ? "#c9ffba" : "#ffd580",
        rendererContract: contract("fogline-dawn-handler-ledger-kit")
      }];
    }
  };
}

export function createFoglineSearchDogRescueRendererHandoffKit() {
  return {
    id: "n-fogline-search-dog-rescue-renderer-handoff-kit",
    domain: "fogline-search-dog-rescue/renderer-handoff",
    describe(groups = {}) {
      const drawOrder = ["scentRibbonTrails", "pawprintGridMarkers", "thermalBlanketCaches", "handlerWhistlePosts", "rescueSledRoutes", "dawnHandlerLedgers"].flatMap((key) => arr(groups[key]));
      return {
        id: "fogline-search-dog-rescue-renderer-handoff",
        archetype: "fogline.renderer.handoff.search.dog.rescue",
        policy: "renderer-consumes-descriptors-only",
        compatibleBuckets: ["routeThreads", "groundGlyphs", "signalBeacons", "supplyCaches", "handoffTokens", "summaryLedgers"],
        descriptorCount: drawOrder.length,
        counts: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, arr(value).length])),
        descriptors: drawOrder,
        drawOrder,
        ownership: { renderer: "consume-only", dom: "excluded", browserInput: "excluded", three: "excluded", webgl: "excluded", audio: "excluded", assets: "excluded", frameLoop: "excluded", physics: "excluded", storage: "excluded" }
      };
    }
  };
}

export function createFoglineSearchDogRescueReadinessDomainKit() {
  const kits = [
    createFoglineScentRibbonTrailKit(),
    createFoglinePawprintGridMarkerKit(),
    createFoglineHandlerWhistlePostKit(),
    createFoglineThermalBlanketCacheKit(),
    createFoglineRescueSledRouteKit(),
    createFoglineDawnHandlerLedgerKit(),
    createFoglineSearchDogRescueRendererHandoffKit()
  ];
  return {
    id: "n-fogline-search-dog-rescue-readiness-domain-kit",
    tree: FOGLINE_SEARCH_DOG_RESCUE_READINESS_DOMAIN_TREE,
    kits,
    describe(input = {}) {
      const [scentKit, pawKit, whistleKit, blanketKit, sledKit, ledgerKit, handoffKit] = kits;
      const groups = {
        scentRibbonTrails: scentKit.describe(input),
        pawprintGridMarkers: pawKit.describe(input),
        handlerWhistlePosts: whistleKit.describe(input),
        thermalBlanketCaches: blanketKit.describe(input),
        rescueSledRoutes: sledKit.describe(input)
      };
      groups.dawnHandlerLedgers = ledgerKit.describe(input, groups);
      const rendererHandoff = handoffKit.describe(groups);
      return {
        id: "fogline-search-dog-rescue-readiness",
        version: 1,
        domain: "fogline-search-dog-rescue-readiness-domain",
        tree: this.tree,
        readiness: groups.dawnHandlerLedgers[0]?.readiness ?? 0,
        pressure: groups.dawnHandlerLedgers[0]?.pressure ?? 0,
        missionState: groups.dawnHandlerLedgers[0]?.missionState ?? "casting-search-grid",
        ...groups,
        rendererHandoff,
        drawOrder: rendererHandoff.drawOrder
      };
    }
  };
}
