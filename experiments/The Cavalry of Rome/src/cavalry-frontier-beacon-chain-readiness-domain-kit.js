const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-frontier-beacon-chain-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics", "network"]
});

export const CAVALRY_FRONTIER_BEACON_CHAIN_READINESS_DOMAIN_TREE = `
cavalry-frontier-beacon-chain-readiness-domain
├─ hill-signal-domain
│  ├─ beacon-tower-domain
│  │  └─ cavalry-frontier-beacon-tower-kit
│  └─ smoke-plume-domain
│     └─ cavalry-smoke-plume-relay-kit
├─ courier-routing-domain
│  ├─ road-milepost-domain
│  │  └─ cavalry-road-milepost-kit
│  └─ dispatch-rider-domain
│     └─ cavalry-dispatch-rider-route-kit
├─ command-handoff-domain
│  ├─ night-watch-cohort-domain
│  │  └─ cavalry-night-watch-cohort-kit
│  └─ senate-dispatch-ledger-domain
│     └─ cavalry-senate-dispatch-ledger-kit
└─ renderer-handoff
   └─ cavalry-frontier-beacon-chain-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(precision));
const cellsOf = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];
const ownerOf = (cell = {}) => cell.owner ?? "neutral";
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const neighborsOf = (cell = {}) => cell.neighbors || cell.n || [];
const descriptor = (id, kind, payload) => ({ id, kind, ...payload, rendererContract: OWNERSHIP_BOUNDARY });
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const byId = (cells) => new Map(cells.map((cell, index) => [String(cell.id ?? index), cell]));
const players = (cells) => cells.filter((cell) => ownerOf(cell) === "player");
const neutrals = (cells) => cells.filter((cell) => ownerOf(cell) === "neutral" || ownerOf(cell) === null);
const hostiles = (cells) => cells.filter((cell) => !["player", "neutral", null].includes(ownerOf(cell)));
const adjacent = (cell, map) => neighborsOf(cell).map((id) => map.get(String(id))).filter(Boolean);
const friendlyNeighbors = (cell, map) => adjacent(cell, map).filter((target) => ownerOf(target) === "player");
const hostileNeighbors = (cell, map) => adjacent(cell, map).filter((target) => !["player", "neutral", null].includes(ownerOf(target)));
const signalSeed = (cell = {}, turn = 0) => clamp(((Number(cell.x || 0) * 0.0021 + Number(cell.y || 0) * 0.0037 + Number(turn || 0) * 0.041) % 1 + 1) % 1);
function nearest(source, choices = []) {
  if (!choices.length) return null;
  return choices.reduce((best, candidate) => Math.hypot(Number(source.x || 0) - Number(candidate.x || 0), Number(source.y || 0) - Number(candidate.y || 0)) < Math.hypot(Number(source.x || 0) - Number(best.x || 0), Number(source.y || 0) - Number(best.y || 0)) ? candidate : best, choices[0]);
}
function candidateCells(campaign = {}) {
  const cells = cellsOf(campaign);
  if (cells.length) return cells;
  return Array.from({ length: 8 }, (_, index) => ({
    id: `fallback-beacon-${index}`,
    owner: index % 4 === 0 ? "player" : index % 4 === 1 ? "neutral" : "enemy",
    x: 130 + index * 84,
    y: 140 + (index % 3) * 76,
    troops: { l: 3 + index, m: index % 3, h: index % 2 },
    neighbors: index > 0 ? [`fallback-beacon-${index - 1}`] : []
  }));
}

export function createCavalryFrontierBeaconTowerKit() {
  return { id: "cavalry-frontier-beacon-tower-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    const candidates = [...players(cells), ...neutrals(cells)].length ? [...players(cells), ...neutrals(cells)] : cells;
    return candidates.map((cell, index) => {
      const elevationProxy = clamp(0.28 + signalSeed(cell, Number(campaign.turn || 0) + 2) * 0.5 + friendlyNeighbors(cell, map).length * 0.05 - hostileNeighbors(cell, map).length * 0.04);
      return descriptor(`frontier-beacon:${cell.id ?? index}`, "frontier-beacon-tower", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        elevationProxy: round(elevationProxy),
        towerHeight: Math.max(2, Math.round(3 + elevationProxy * 7)),
        watchRadius: round(70 + elevationProxy * 180),
        signalBand: elevationProxy > 0.66 ? "long-range" : elevationProxy > 0.44 ? "regional" : "local",
        label: elevationProxy > 0.6 ? "Prime beacon tower" : "Raise signal tower",
        priority: index
      });
    }).sort((a, b) => b.elevationProxy - a.elevationProxy).slice(0, 7);
  }};
}

export function createCavalrySmokePlumeRelayKit() {
  return { id: "cavalry-smoke-plume-relay-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    return cells.map((cell, index) => {
      const relayClarity = clamp(0.26 + signalSeed(cell, Number(campaign.turn || 0) + 7) * 0.36 + friendlyNeighbors(cell, map).length * 0.08 - hostileNeighbors(cell, map).length * 0.05);
      return descriptor(`smoke-plume:${cell.id ?? index}`, "smoke-plume-relay", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        relayClarity: round(relayClarity),
        plumeColumns: Math.max(1, Math.round(relayClarity * 6)),
        dayCode: relayClarity > 0.62 ? "clear-three-column" : relayClarity > 0.42 ? "broken-two-column" : "weak-single-column",
        label: relayClarity > 0.55 ? "Smoke code readable" : "Rebuild smoke relay",
        priority: index
      });
    }).sort((a, b) => b.relayClarity - a.relayClarity).slice(0, 6);
  }};
}

export function createCavalryRoadMilepostKit() {
  return { id: "cavalry-road-milepost-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    return cells.map((cell, index) => {
      const roadIntegrity = clamp(0.34 + friendlyNeighbors(cell, map).length * 0.12 + signalSeed(cell, Number(campaign.turn || 0) + 11) * 0.24 - hostileNeighbors(cell, map).length * 0.08);
      return descriptor(`road-milepost:${cell.id ?? index}`, "road-milepost", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        roadIntegrity: round(roadIntegrity),
        milestonesReset: Math.max(1, Math.round(roadIntegrity * 9)),
        paceBonus: round(roadIntegrity * 0.42),
        label: roadIntegrity > 0.58 ? "Courier road marked" : "Repair courier mileposts",
        priority: index
      });
    }).sort((a, b) => b.roadIntegrity - a.roadIntegrity).slice(0, 7);
  }};
}

export function createCavalryDispatchRiderRouteKit() {
  return { id: "cavalry-dispatch-rider-route-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romans = players(cells); const targets = hostiles(cells).length ? hostiles(cells) : neutrals(cells).length ? neutrals(cells) : cells.slice(-4);
    return targets.map((cell, index) => {
      const source = nearest(cell, romans) || cells[0] || cell;
      const distance = Math.hypot(Number(cell.x || 0) - Number(source.x || 0), Number(cell.y || 0) - Number(source.y || 0));
      const urgency = clamp(0.3 + troopPower(troopsOf(cell)) / 44 + Number(campaign.actions || 0) % 5 * 0.035 - distance / 1800);
      return descriptor(`dispatch-rider:${source.id ?? "source"}:${cell.id ?? index}`, "dispatch-rider-route", {
        sourceId: String(source.id ?? "source"),
        targetId: String(cell.id ?? index),
        source: centerOf(source),
        target: centerOf(cell),
        urgency: round(urgency),
        riderPairs: Math.max(1, Math.round(urgency * 5)),
        routeState: urgency > 0.62 ? "urgent" : urgency > 0.4 ? "active" : "reserve",
        label: urgency > 0.58 ? "Dispatch fast rider" : "Hold rider route",
        priority: index
      });
    }).sort((a, b) => b.urgency - a.urgency).slice(0, 6);
  }};
}

export function createCavalryNightWatchCohortKit() {
  return { id: "cavalry-night-watch-cohort-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    const romanCells = players(cells).length ? players(cells) : cells.slice(0, 4);
    return romanCells.map((cell, index) => {
      const watchLoad = clamp(0.25 + troopCount(troopsOf(cell)) / 38 + hostileNeighbors(cell, map).length * 0.12 + signalSeed(cell, Number(campaign.turn || 0) + 17) * 0.18);
      return descriptor(`night-watch:${cell.id ?? index}`, "night-watch-cohort", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        watchLoad: round(watchLoad),
        cohortSize: Math.max(2, Math.round(4 + watchLoad * 12)),
        torchPairs: Math.max(1, Math.round(watchLoad * 7)),
        label: watchLoad > 0.58 ? "Double night watch" : "Night watch assigned",
        screenAnchor: { x: round(0.18 + (index % 4) * 0.085), y: round(0.28 + Math.floor(index / 4) * 0.052) },
        fill: round(watchLoad),
        priority: index
      });
    }).sort((a, b) => b.watchLoad - a.watchLoad).slice(0, 6);
  }};
}

export function createCavalrySenateDispatchLedgerKit() {
  return { id: "cavalry-senate-dispatch-ledger-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romanCount = players(cells).length; const hostileCount = hostiles(cells).length; const neutralCount = neutrals(cells).length;
    const coverage = clamp(0.36 + romanCount / Math.max(4, cells.length) * 0.32 + neutralCount / Math.max(6, cells.length) * 0.12 - hostileCount / Math.max(8, cells.length) * 0.14 + (Number(campaign.turn || 0) % 7) * 0.02);
    return [descriptor("senate-dispatch-ledger:campaign", "senate-dispatch-ledger", {
      coverage: round(coverage),
      delayRisk: round(1 - coverage),
      tabletsSealed: Math.max(2, Math.round(coverage * 12)),
      commandState: coverage > 0.68 ? "ready" : coverage > 0.44 ? "strained" : "fragmented",
      screenAnchor: { x: 0.76, y: 0.24 },
      label: coverage > 0.62 ? "Senate dispatch chain ready" : "Dispatch chain delayed",
      fill: coverage
    })];
  }};
}

export function createCavalryFrontierBeaconChainRendererHandoffKit() {
  return { id: "cavalry-frontier-beacon-chain-renderer-handoff-kit", describe(buckets = {}) {
    const descriptors = Object.freeze({
      frontierBeaconTowers: buckets.frontierBeaconTowers || [],
      smokePlumeRelays: buckets.smokePlumeRelays || [],
      roadMileposts: buckets.roadMileposts || [],
      dispatchRiderRoutes: buckets.dispatchRiderRoutes || [],
      nightWatchCohorts: buckets.nightWatchCohorts || [],
      senateDispatchLedgers: buckets.senateDispatchLedgers || []
    });
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "cavalry-frontier-beacon-chain-renderer-handoff", kind: "renderer-handoff", contract: OWNERSHIP_BOUNDARY, rendererConsumesDescriptorsOnly: true, descriptors, counts };
  }};
}

export function createCavalryFrontierBeaconChainReadinessDomainKit() {
  const frontierBeaconTowerKit = createCavalryFrontierBeaconTowerKit();
  const smokePlumeRelayKit = createCavalrySmokePlumeRelayKit();
  const roadMilepostKit = createCavalryRoadMilepostKit();
  const dispatchRiderRouteKit = createCavalryDispatchRiderRouteKit();
  const nightWatchCohortKit = createCavalryNightWatchCohortKit();
  const senateDispatchLedgerKit = createCavalrySenateDispatchLedgerKit();
  const rendererHandoffKit = createCavalryFrontierBeaconChainRendererHandoffKit();
  return {
    id: "cavalry-frontier-beacon-chain-readiness-domain-kit",
    tree: CAVALRY_FRONTIER_BEACON_CHAIN_READINESS_DOMAIN_TREE,
    ownershipBoundary: OWNERSHIP_BOUNDARY,
    kits: [frontierBeaconTowerKit.id, smokePlumeRelayKit.id, roadMilepostKit.id, dispatchRiderRouteKit.id, nightWatchCohortKit.id, senateDispatchLedgerKit.id, rendererHandoffKit.id],
    describe(campaign = {}) {
      const frontierBeaconTowers = frontierBeaconTowerKit.describe(campaign);
      const smokePlumeRelays = smokePlumeRelayKit.describe(campaign);
      const roadMileposts = roadMilepostKit.describe(campaign);
      const dispatchRiderRoutes = dispatchRiderRouteKit.describe(campaign);
      const nightWatchCohorts = nightWatchCohortKit.describe(campaign);
      const senateDispatchLedgers = senateDispatchLedgerKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({ frontierBeaconTowers, smokePlumeRelays, roadMileposts, dispatchRiderRoutes, nightWatchCohorts, senateDispatchLedgers });
      const towerScore = frontierBeaconTowers.reduce((sum, item) => sum + item.elevationProxy, 0) / Math.max(1, frontierBeaconTowers.length);
      const smokeScore = smokePlumeRelays.reduce((sum, item) => sum + item.relayClarity, 0) / Math.max(1, smokePlumeRelays.length);
      const roadScore = roadMileposts.reduce((sum, item) => sum + item.roadIntegrity, 0) / Math.max(1, roadMileposts.length);
      const riderScore = dispatchRiderRoutes.reduce((sum, item) => sum + (1 - item.urgency * 0.35), 0) / Math.max(1, dispatchRiderRoutes.length);
      const watchScore = nightWatchCohorts.reduce((sum, item) => sum + (1 - item.watchLoad * 0.25), 0) / Math.max(1, nightWatchCohorts.length);
      const ledgerScore = senateDispatchLedgers[0]?.coverage ?? 0.4;
      const readiness = clamp((towerScore + smokeScore + roadScore + riderScore + watchScore + ledgerScore) / 6);
      return Object.freeze({
        id: "cavalry-frontier-beacon-chain-readiness",
        kind: "cavalry-frontier-beacon-chain-readiness",
        tree: CAVALRY_FRONTIER_BEACON_CHAIN_READINESS_DOMAIN_TREE,
        ownershipBoundary: OWNERSHIP_BOUNDARY,
        readiness: round(readiness),
        delayRisk: round(1 - readiness),
        missionState: readiness > 0.68 ? "ready" : readiness > 0.44 ? "staging" : "fragmented",
        rendererHandoff
      });
    }
  };
}
