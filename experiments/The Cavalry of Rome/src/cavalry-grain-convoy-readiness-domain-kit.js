const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-grain-convoy-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics"]
});

export const CAVALRY_GRAIN_CONVOY_READINESS_DOMAIN_TREE = `
cavalry-grain-convoy-readiness-domain
├─ supply-origin-domain
│  ├─ granary-stockpile-domain
│  │  └─ cavalry-granary-stockpile-pressure-kit
│  └─ mule-cart-route-domain
│     └─ cavalry-mule-cart-route-kit
├─ road-security-domain
│  ├─ ambush-risk-domain
│  │  └─ cavalry-road-ambush-risk-kit
│  └─ bridge-repair-domain
│     └─ cavalry-bridge-repair-crew-kit
├─ relief-handoff-domain
│  ├─ legion-ration-domain
│  │  └─ cavalry-legion-ration-priority-kit
│  └─ civilian-market-domain
│     └─ cavalry-civilian-market-relief-kit
└─ renderer-handoff
   └─ cavalry-grain-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(precision));
const cellsOf = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];
const ownerOf = (cell = {}) => cell.owner || "neutral";
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const neighborsOf = (cell = {}) => cell.neighbors || cell.n || [];
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const descriptor = (id, kind, payload) => ({ id, kind, ...payload });
const byId = (cells) => new Map(cells.map((cell) => [String(cell.id), cell]));
const players = (cells) => cells.filter((cell) => ownerOf(cell) === "player");
const neutrals = (cells) => cells.filter((cell) => ownerOf(cell) === "neutral" || ownerOf(cell) === null);
const hostiles = (cells) => cells.filter((cell) => !["player", "neutral", null].includes(ownerOf(cell)));
const adjacent = (cell, map) => neighborsOf(cell).map((id) => map.get(String(id))).filter(Boolean);
const friendlyNeighbors = (cell, map) => adjacent(cell, map).filter((target) => ownerOf(target) === "player");
const hostileNeighbors = (cell, map) => adjacent(cell, map).filter((target) => !["player", "neutral", null].includes(ownerOf(target)));
function nearest(source, choices = []) {
  if (!choices.length) return null;
  return choices.reduce((best, candidate) => Math.hypot(Number(source.x || 0) - Number(candidate.x || 0), Number(source.y || 0) - Number(candidate.y || 0)) < Math.hypot(Number(source.x || 0) - Number(best.x || 0), Number(source.y || 0) - Number(best.y || 0)) ? candidate : best, choices[0]);
}

export function createCavalryGranaryStockpilePressureKit() {
  return { id: "cavalry-granary-stockpile-pressure-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells);
    return players(cells).map((cell, index) => {
      const reserve = clamp(0.76 - troopCount(troopsOf(cell)) / 34 + friendlyNeighbors(cell, map).length * 0.07 - hostileNeighbors(cell, map).length * 0.1 + ((Number(campaign.turn || 0) + index) % 5) * 0.025);
      return descriptor(`granary:${cell.id}`, "granary-stockpile-pressure", { cellId: String(cell.id), center: centerOf(cell), reserve: round(reserve), pressure: round(1 - reserve), sacksNeeded: Math.max(1, Math.round((1 - reserve) * 18)), label: reserve > 0.62 ? "Granary stable" : "Send grain sacks", priority: index });
    }).sort((a, b) => b.pressure - a.pressure).slice(0, 6);
  }};
}

export function createCavalryMuleCartRouteKit() {
  return { id: "cavalry-mule-cart-route-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells); const romans = players(cells); const targets = neutrals(cells).length ? neutrals(cells) : romans.slice(0, 3); const sources = romans.slice().sort((a, b) => troopPower(troopsOf(b)) - troopPower(troopsOf(a)));
    return targets.map((target, index) => {
      const source = nearest(target, sources) || sources[index % Math.max(1, sources.length)] || target;
      const risk = clamp(hostileNeighbors(target, map).length * 0.18 + hostileNeighbors(source, map).length * 0.12 + Math.max(0, 5 - friendlyNeighbors(target, map).length) * 0.035);
      return descriptor(`mule-cart:${source.id}:${target.id}`, "mule-cart-route", { sourceId: String(source.id || target.id), targetId: String(target.id || source.id), source: centerOf(source), target: centerOf(target), risk: round(risk), load: round(clamp(0.42 + troopPower(troopsOf(source)) / 32 - risk * 0.18)), label: risk > 0.52 ? "Escort mule cart" : "Cart route open", priority: index });
    }).sort((a, b) => b.risk - a.risk).slice(0, 6);
  }};
}

export function createCavalryRoadAmbushRiskKit() {
  return { id: "cavalry-road-ambush-risk-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells); const romans = players(cells); const watched = hostiles(cells).length ? hostiles(cells) : cells.slice(0, 4);
    return watched.map((cell, index) => {
      const friend = nearest(cell, romans) || cell;
      const distance = Math.hypot(Number(cell.x || 0) - Number(friend.x || 0), Number(cell.y || 0) - Number(friend.y || 0));
      const risk = clamp(0.24 + troopPower(troopsOf(cell)) / 28 + hostileNeighbors(friend, map).length * 0.08 - distance / 900);
      return descriptor(`ambush:${cell.id}`, "road-ambush-risk", { hostileId: String(cell.id), friendlyId: String(friend.id || cell.id), center: centerOf(cell), nearestFriendly: centerOf(friend), risk: round(risk), patrolsNeeded: Math.max(1, Math.round(risk * 5)), label: risk > 0.64 ? "Ambush patrol urgent" : "Watch road bend", priority: index });
    }).sort((a, b) => b.risk - a.risk).slice(0, 6);
  }};
}

export function createCavalryBridgeRepairCrewKit() {
  return { id: "cavalry-bridge-repair-crew-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells);
    return cells.filter((cell) => ownerOf(cell) === "neutral" || friendlyNeighbors(cell, map).length > 0).map((cell, index) => {
      const traffic = friendlyNeighbors(cell, map).length + hostileNeighbors(cell, map).length;
      const integrity = clamp(0.86 - traffic * 0.1 + (Number(cell.x || 0) % 71) / 530 - (Number(campaign.actions || 0) % 3) * 0.04);
      return descriptor(`bridge:${cell.id}`, "bridge-repair-crew", { cellId: String(cell.id), center: centerOf(cell), integrity: round(integrity), urgency: round(1 - integrity), crewCount: Math.max(1, Math.round((1 - integrity) * 6)), label: integrity > 0.63 ? "Bridge passable" : "Repair bridge", priority: index });
    }).sort((a, b) => b.urgency - a.urgency).slice(0, 5);
  }};
}

export function createCavalryLegionRationPriorityKit() {
  return { id: "cavalry-legion-ration-priority-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells);
    return players(cells).map((cell, index) => {
      const pressure = clamp(0.18 + Math.max(0, 10 - troopCount(troopsOf(cell))) * 0.055 + hostileNeighbors(cell, map).length * 0.16 + (Number(campaign.turn || 0) % 4) * 0.035);
      return descriptor(`ration:${cell.id}`, "legion-ration-priority", { cellId: String(cell.id), center: centerOf(cell), priorityScore: round(pressure), rationCrates: Math.max(1, Math.round(pressure * 8)), fill: round(1 - pressure), label: pressure > 0.6 ? "Feed front line" : "Ration reserve", screenAnchor: { x: 0.22 + (index % 3) * 0.08, y: 0.16 + Math.floor(index / 3) * 0.045 }, priority: index });
    }).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 6);
  }};
}

export function createCavalryCivilianMarketReliefKit() {
  return { id: "cavalry-civilian-market-relief-kit", describe(campaign = {}) {
    const cells = cellsOf(campaign); const map = byId(cells); const markets = neutrals(cells).length ? neutrals(cells) : cells.slice(0, 3);
    return markets.map((cell, index) => {
      const relief = clamp(0.36 + friendlyNeighbors(cell, map).length * 0.14 - hostileNeighbors(cell, map).length * 0.18 + ((Number(campaign.turn || 0) + index) % 6) * 0.035);
      return descriptor(`market:${cell.id}`, "civilian-market-relief", { cellId: String(cell.id), center: centerOf(cell), relief: round(relief), pressure: round(1 - relief), crowdEstimate: Math.max(3, Math.round((1 - relief) * 22)), label: relief > 0.58 ? "Market calm" : "Open grain market", screenAnchor: { x: 0.68 + (index % 2) * 0.09, y: 0.74 + Math.floor(index / 2) * 0.05 }, priority: index });
    }).sort((a, b) => b.pressure - a.pressure).slice(0, 5);
  }};
}

export function createCavalryGrainConvoyRendererHandoffKit() {
  return { id: "cavalry-grain-convoy-renderer-handoff-kit", describe(buckets = {}) {
    const descriptors = Object.freeze({
      granaryStockpilePressures: buckets.granaryStockpilePressures || [],
      muleCartRoutes: buckets.muleCartRoutes || [],
      roadAmbushRisks: buckets.roadAmbushRisks || [],
      bridgeRepairCrews: buckets.bridgeRepairCrews || [],
      legionRationPriorities: buckets.legionRationPriorities || [],
      civilianMarketReliefs: buckets.civilianMarketReliefs || []
    });
    return { id: "cavalry-grain-convoy-renderer-handoff", kind: "renderer-handoff", contract: OWNERSHIP_BOUNDARY, rendererConsumesDescriptorsOnly: true, descriptors, counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length])) };
  }};
}

export function createCavalryGrainConvoyReadinessDomainKit() {
  const granaryStockpilePressureKit = createCavalryGranaryStockpilePressureKit();
  const muleCartRouteKit = createCavalryMuleCartRouteKit();
  const roadAmbushRiskKit = createCavalryRoadAmbushRiskKit();
  const bridgeRepairCrewKit = createCavalryBridgeRepairCrewKit();
  const legionRationPriorityKit = createCavalryLegionRationPriorityKit();
  const civilianMarketReliefKit = createCavalryCivilianMarketReliefKit();
  const rendererHandoffKit = createCavalryGrainConvoyRendererHandoffKit();
  return { id: "cavalry-grain-convoy-readiness-domain-kit", tree: CAVALRY_GRAIN_CONVOY_READINESS_DOMAIN_TREE, kits: [granaryStockpilePressureKit.id, muleCartRouteKit.id, roadAmbushRiskKit.id, bridgeRepairCrewKit.id, legionRationPriorityKit.id, civilianMarketReliefKit.id, rendererHandoffKit.id], describe(campaign = {}) {
    const granaryStockpilePressures = granaryStockpilePressureKit.describe(campaign);
    const muleCartRoutes = muleCartRouteKit.describe(campaign);
    const roadAmbushRisks = roadAmbushRiskKit.describe(campaign);
    const bridgeRepairCrews = bridgeRepairCrewKit.describe(campaign);
    const legionRationPriorities = legionRationPriorityKit.describe(campaign);
    const civilianMarketReliefs = civilianMarketReliefKit.describe(campaign);
    const rendererHandoff = rendererHandoffKit.describe({ granaryStockpilePressures, muleCartRoutes, roadAmbushRisks, bridgeRepairCrews, legionRationPriorities, civilianMarketReliefs });
    return { id: "cavalry-grain-convoy-readiness-domain", kind: "grain-convoy-readiness-domain", tree: CAVALRY_GRAIN_CONVOY_READINESS_DOMAIN_TREE, source: { route: "the-cavalry-of-rome", turn: Number(campaign.turn || 0), size: String(campaign.sizeId || campaign.preset?.label || "unknown") }, granaryStockpilePressures, muleCartRoutes, roadAmbushRisks, bridgeRepairCrews, legionRationPriorities, civilianMarketReliefs, rendererHandoff };
  }};
}
