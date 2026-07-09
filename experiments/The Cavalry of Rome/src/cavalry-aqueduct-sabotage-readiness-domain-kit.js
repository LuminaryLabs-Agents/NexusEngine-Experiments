const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-aqueduct-sabotage-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics"]
});

export const CAVALRY_AQUEDUCT_SABOTAGE_READINESS_DOMAIN_TREE = `
cavalry-aqueduct-sabotage-readiness-domain
├─ water-source-security-domain
│  ├─ spring-intake-watch-domain
│  │  └─ cavalry-spring-intake-watchtower-kit
│  └─ aqueduct-arch-stress-domain
│     └─ cavalry-aqueduct-arch-stress-mark-kit
├─ sabotage-response-domain
│  ├─ cistern-ration-domain
│  │  └─ cavalry-cistern-ration-token-kit
│  └─ saboteur-trail-domain
│     └─ cavalry-saboteur-trail-signal-kit
├─ repair-handoff-domain
│  ├─ engineer-column-domain
│  │  └─ cavalry-engineer-repair-column-kit
│  └─ dawn-water-ledger-domain
│     └─ cavalry-dawn-water-ledger-kit
└─ renderer-handoff
   └─ cavalry-aqueduct-sabotage-renderer-handoff-kit
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
const descriptor = (id, kind, payload) => ({ id, kind, ...payload });
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const byId = (cells) => new Map(cells.map((cell, index) => [String(cell.id ?? index), cell]));
const players = (cells) => cells.filter((cell) => ownerOf(cell) === "player");
const neutrals = (cells) => cells.filter((cell) => ownerOf(cell) === "neutral" || ownerOf(cell) === null);
const hostiles = (cells) => cells.filter((cell) => !["player", "neutral", null].includes(ownerOf(cell)));
const adjacent = (cell, map) => neighborsOf(cell).map((id) => map.get(String(id))).filter(Boolean);
const friendlyNeighbors = (cell, map) => adjacent(cell, map).filter((target) => ownerOf(target) === "player");
const hostileNeighbors = (cell, map) => adjacent(cell, map).filter((target) => !["player", "neutral", null].includes(ownerOf(target)));
const waterSeed = (cell = {}, turn = 0) => clamp(((Number(cell.x || 0) * 0.0017 + Number(cell.y || 0) * 0.0029 + Number(turn || 0) * 0.037) % 1 + 1) % 1);
function nearest(source, choices = []) {
  if (!choices.length) return null;
  return choices.reduce((best, candidate) => Math.hypot(Number(source.x || 0) - Number(candidate.x || 0), Number(source.y || 0) - Number(candidate.y || 0)) < Math.hypot(Number(source.x || 0) - Number(best.x || 0), Number(source.y || 0) - Number(best.y || 0)) ? candidate : best, choices[0]);
}
function candidateCells(campaign = {}) {
  const cells = cellsOf(campaign);
  if (cells.length) return cells;
  return Array.from({ length: 6 }, (_, index) => ({ id: `fallback-${index}`, owner: index % 3 === 0 ? "player" : index % 3 === 1 ? "neutral" : "enemy", x: 120 + index * 90, y: 160 + (index % 2) * 80, troops: { l: 3 + index, m: index % 2, h: index % 3 === 0 ? 1 : 0 }, neighbors: [] }));
}

export function createCavalrySpringIntakeWatchtowerKit() {
  return { id: "cavalry-spring-intake-watchtower-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells); const targets = (neutrals(cells).length ? neutrals(cells) : cells).slice();
    return targets.map((cell, index) => {
      const contaminationRisk = clamp(0.18 + waterSeed(cell, campaign.turn) * 0.34 + hostileNeighbors(cell, map).length * 0.13 - friendlyNeighbors(cell, map).length * 0.05);
      return descriptor(`spring-intake:${cell.id ?? index}`, "spring-intake-watchtower", { cellId: String(cell.id ?? index), center: centerOf(cell), contaminationRisk: round(contaminationRisk), watchCoverage: round(1 - contaminationRisk * 0.62), sentriesNeeded: Math.max(1, Math.round(contaminationRisk * 7)), label: contaminationRisk > 0.55 ? "Guard spring intake" : "Spring watch stable", priority: index });
    }).sort((a, b) => b.contaminationRisk - a.contaminationRisk).slice(0, 6);
  }};
}

export function createCavalryAqueductArchStressMarkKit() {
  return { id: "cavalry-aqueduct-arch-stress-mark-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    return cells.map((cell, index) => {
      const traffic = friendlyNeighbors(cell, map).length + hostileNeighbors(cell, map).length + troopCount(troopsOf(cell)) / 18;
      const fracture = clamp(0.14 + traffic * 0.065 + waterSeed(cell, Number(campaign.turn || 0) + 3) * 0.28);
      return descriptor(`aqueduct-arch:${cell.id ?? index}`, "aqueduct-arch-stress-mark", { cellId: String(cell.id ?? index), center: centerOf(cell), fracture: round(fracture), stability: round(1 - fracture), archBands: Math.max(1, Math.round(fracture * 9)), label: fracture > 0.52 ? "Brace aqueduct arch" : "Arch stress marked", priority: index });
    }).sort((a, b) => b.fracture - a.fracture).slice(0, 7);
  }};
}

export function createCavalryCisternRationTokenKit() {
  return { id: "cavalry-cistern-ration-token-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells); const romanCells = players(cells).length ? players(cells) : cells.slice(0, 3);
    return romanCells.map((cell, index) => {
      const demand = clamp(0.22 + troopCount(troopsOf(cell)) / 36 + hostileNeighbors(cell, map).length * 0.1 + (Number(campaign.actions || 0) % 4) * 0.045);
      return descriptor(`cistern-ration:${cell.id ?? index}`, "cistern-ration-token", { cellId: String(cell.id ?? index), center: centerOf(cell), demand: round(demand), reserve: round(1 - demand * 0.72), tokens: Math.max(2, Math.round(demand * 16)), fill: round(1 - demand), screenAnchor: { x: round(0.18 + (index % 4) * 0.075), y: round(0.22 + Math.floor(index / 4) * 0.05) }, label: demand > 0.58 ? "Issue cistern tokens" : "Cistern reserve ready", priority: index });
    }).sort((a, b) => b.demand - a.demand).slice(0, 6);
  }};
}

export function createCavalrySaboteurTrailSignalKit() {
  return { id: "cavalry-saboteur-trail-signal-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romans = players(cells); const watched = hostiles(cells).length ? hostiles(cells) : cells.slice(-4);
    return watched.map((cell, index) => {
      const friend = nearest(cell, romans) || cell;
      const distance = Math.hypot(Number(cell.x || 0) - Number(friend.x || 0), Number(cell.y || 0) - Number(friend.y || 0));
      const trailHeat = clamp(0.34 + troopPower(troopsOf(cell)) / 38 + waterSeed(cell, campaign.turn) * 0.18 - distance / 1400);
      return descriptor(`saboteur-trail:${cell.id ?? index}`, "saboteur-trail-signal", { hostileId: String(cell.id ?? index), nearestFriendlyId: String(friend.id ?? "none"), source: centerOf(cell), target: centerOf(friend), trailHeat: round(trailHeat), patrolPairs: Math.max(1, Math.round(trailHeat * 6)), label: trailHeat > 0.62 ? "Track saboteurs" : "Trail signal low", priority: index });
    }).sort((a, b) => b.trailHeat - a.trailHeat).slice(0, 6);
  }};
}

export function createCavalryEngineerRepairColumnKit() {
  return { id: "cavalry-engineer-repair-column-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells); const romanCells = players(cells).length ? players(cells) : cells.slice(0, 4);
    return romanCells.map((cell, index) => {
      const load = clamp(0.18 + friendlyNeighbors(cell, map).length * 0.08 + hostileNeighbors(cell, map).length * 0.16 + troopPower(troopsOf(cell)) / 45);
      const target = nearest(cell, neutrals(cells).length ? neutrals(cells) : cells) || cell;
      return descriptor(`engineer-column:${cell.id ?? index}`, "engineer-repair-column", { sourceId: String(cell.id ?? index), targetId: String(target.id ?? index), source: centerOf(cell), target: centerOf(target), urgency: round(load), toolCarts: Math.max(1, Math.round(load * 8)), label: load > 0.57 ? "Dispatch engineer column" : "Engineers staged", priority: index });
    }).sort((a, b) => b.urgency - a.urgency).slice(0, 6);
  }};
}

export function createCavalryDawnWaterLedgerKit() {
  return { id: "cavalry-dawn-water-ledger-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romanCount = players(cells).length; const neutralCount = neutrals(cells).length; const hostileCount = hostiles(cells).length;
    const secured = clamp(0.35 + romanCount / Math.max(4, cells.length) * 0.36 + neutralCount / Math.max(6, cells.length) * 0.12 - hostileCount / Math.max(6, cells.length) * 0.18 + (Number(campaign.turn || 0) % 6) * 0.025);
    return [descriptor("dawn-water-ledger:campaign", "dawn-water-ledger", { secured: round(secured), shortage: round(1 - secured), rationColumns: Math.max(1, Math.round((1 - secured) * 7)), civicConfidence: secured > 0.66 ? "steady" : secured > 0.42 ? "strained" : "panic", screenAnchor: { x: 0.76, y: 0.18 }, label: secured > 0.62 ? "Dawn water secured" : "Water ledger strained" })];
  }};
}

export function createCavalryAqueductSabotageRendererHandoffKit() {
  return { id: "cavalry-aqueduct-sabotage-renderer-handoff-kit", describe(buckets = {}) {
    const descriptors = Object.freeze({
      springIntakeWatchtowers: buckets.springIntakeWatchtowers || [],
      aqueductArchStressMarks: buckets.aqueductArchStressMarks || [],
      cisternRationTokens: buckets.cisternRationTokens || [],
      saboteurTrailSignals: buckets.saboteurTrailSignals || [],
      engineerRepairColumns: buckets.engineerRepairColumns || [],
      dawnWaterLedgers: buckets.dawnWaterLedgers || []
    });
    return { id: "cavalry-aqueduct-sabotage-renderer-handoff", kind: "renderer-handoff", contract: OWNERSHIP_BOUNDARY, rendererConsumesDescriptorsOnly: true, descriptors, counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])) };
  }};
}

export function createCavalryAqueductSabotageReadinessDomainKit() {
  const springIntakeWatchtowerKit = createCavalrySpringIntakeWatchtowerKit();
  const aqueductArchStressMarkKit = createCavalryAqueductArchStressMarkKit();
  const cisternRationTokenKit = createCavalryCisternRationTokenKit();
  const saboteurTrailSignalKit = createCavalrySaboteurTrailSignalKit();
  const engineerRepairColumnKit = createCavalryEngineerRepairColumnKit();
  const dawnWaterLedgerKit = createCavalryDawnWaterLedgerKit();
  const rendererHandoffKit = createCavalryAqueductSabotageRendererHandoffKit();
  return {
    id: "cavalry-aqueduct-sabotage-readiness-domain-kit",
    tree: CAVALRY_AQUEDUCT_SABOTAGE_READINESS_DOMAIN_TREE,
    ownershipBoundary: OWNERSHIP_BOUNDARY,
    kits: [springIntakeWatchtowerKit.id, aqueductArchStressMarkKit.id, cisternRationTokenKit.id, saboteurTrailSignalKit.id, engineerRepairColumnKit.id, dawnWaterLedgerKit.id, rendererHandoffKit.id],
    describe(campaign = {}) {
      const springIntakeWatchtowers = springIntakeWatchtowerKit.describe(campaign);
      const aqueductArchStressMarks = aqueductArchStressMarkKit.describe(campaign);
      const cisternRationTokens = cisternRationTokenKit.describe(campaign);
      const saboteurTrailSignals = saboteurTrailSignalKit.describe(campaign);
      const engineerRepairColumns = engineerRepairColumnKit.describe(campaign);
      const dawnWaterLedgers = dawnWaterLedgerKit.describe(campaign);
      const readiness = clamp((springIntakeWatchtowers.reduce((sum, item) => sum + item.watchCoverage, 0) / Math.max(1, springIntakeWatchtowers.length)) * 0.28 + (aqueductArchStressMarks.reduce((sum, item) => sum + item.stability, 0) / Math.max(1, aqueductArchStressMarks.length)) * 0.24 + (cisternRationTokens.reduce((sum, item) => sum + item.reserve, 0) / Math.max(1, cisternRationTokens.length)) * 0.18 + (1 - (saboteurTrailSignals.reduce((sum, item) => sum + item.trailHeat, 0) / Math.max(1, saboteurTrailSignals.length))) * 0.18 + (dawnWaterLedgers[0]?.secured || 0) * 0.12);
      const missionState = readiness > 0.68 ? "water-secured" : readiness > 0.43 ? "repair-underway" : "sabotage-critical";
      const rendererHandoff = rendererHandoffKit.describe({ springIntakeWatchtowers, aqueductArchStressMarks, cisternRationTokens, saboteurTrailSignals, engineerRepairColumns, dawnWaterLedgers });
      return { id: "cavalry-aqueduct-sabotage-readiness-domain", kind: "aqueduct-sabotage-readiness-domain", tree: CAVALRY_AQUEDUCT_SABOTAGE_READINESS_DOMAIN_TREE, source: { route: "the-cavalry-of-rome", turn: Number(campaign.turn || 0), size: String(campaign.sizeId || campaign.preset?.label || "unknown") }, readiness: round(readiness), missionState, springIntakeWatchtowers, aqueductArchStressMarks, cisternRationTokens, saboteurTrailSignals, engineerRepairColumns, dawnWaterLedgers, rendererHandoff };
    }
  };
}
