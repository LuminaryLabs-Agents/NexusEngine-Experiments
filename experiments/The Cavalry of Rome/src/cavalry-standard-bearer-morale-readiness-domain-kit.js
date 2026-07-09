const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-standard-bearer-morale-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop", "physics", "storage", "network"]
});

export const CAVALRY_STANDARD_BEARER_MORALE_READINESS_DOMAIN_TREE = `
cavalry-standard-bearer-morale-readiness-domain
├─ legion-identity-domain
│  ├─ aquila-standard-domain
│  │  └─ cavalry-aquila-standard-kit
│  └─ vexillum-rally-domain
│     └─ cavalry-vexillum-rally-route-kit
├─ morale-stabilization-domain
│  ├─ cohort-drum-domain
│  │  ├─ rhythm-cadence-domain
│  │  │  └─ cavalry-cohort-morale-drum-kit
│  └─ standard-guard-domain
│     └─ cavalry-standard-guard-ring-kit
├─ honor-evacuation-domain
│  ├─ wounded-standard-litter-domain
│  │  └─ cavalry-wounded-standard-litter-kit
│  └─ dusk-honor-ledger-domain
│     └─ cavalry-dusk-honor-ledger-kit
└─ renderer-handoff
   └─ cavalry-standard-bearer-morale-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(precision));
const cellsOf = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];
const ownerOf = (cell = {}) => cell.owner ?? "neutral";
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const neighborsOf = (cell = {}) => Array.isArray(cell.neighbors) ? cell.neighbors : Array.isArray(cell.n) ? cell.n : [];
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id ?? "unknown") });
const descriptor = (id, kind, payload) => ({ id, kind, ...payload, rendererContract: OWNERSHIP_BOUNDARY });
const byId = (cells = []) => new Map(cells.map((cell, index) => [String(cell.id ?? index), cell]));
const players = (cells = []) => cells.filter((cell) => ownerOf(cell) === "player");
const hostiles = (cells = []) => cells.filter((cell) => !["player", "neutral", null].includes(ownerOf(cell)));
const neutrals = (cells = []) => cells.filter((cell) => ownerOf(cell) === "neutral" || ownerOf(cell) === null);
const adjacent = (cell, map) => neighborsOf(cell).map((id) => map.get(String(id))).filter(Boolean);
const friendlyNeighbors = (cell, map) => adjacent(cell, map).filter((target) => ownerOf(target) === "player");
const hostileNeighbors = (cell, map) => adjacent(cell, map).filter((target) => !["player", "neutral", null].includes(ownerOf(target)));
const signalSeed = (cell = {}, turn = 0, salt = 1) => clamp(((Number(cell.x || 0) * 0.0019 + Number(cell.y || 0) * 0.0027 + Number(turn || 0) * 0.033 + salt * 0.137) % 1 + 1) % 1);

function candidateCells(campaign = {}) {
  const cells = cellsOf(campaign);
  if (cells.length) return cells;
  return Array.from({ length: 10 }, (_, index) => ({
    id: `fallback-standard-${index}`,
    owner: index % 5 === 0 ? "player" : index % 3 === 0 ? "enemy" : "neutral",
    x: 120 + index * 74,
    y: 150 + (index % 4) * 68,
    troops: { l: 3 + index, m: index % 3, h: index % 2 },
    neighbors: [`fallback-standard-${Math.max(0, index - 1)}`, `fallback-standard-${Math.min(9, index + 1)}`]
  }));
}
function nearest(source, choices = []) {
  if (!choices.length) return null;
  return choices.reduce((best, candidate) => Math.hypot(Number(source.x || 0) - Number(candidate.x || 0), Number(source.y || 0) - Number(candidate.y || 0)) < Math.hypot(Number(source.x || 0) - Number(best.x || 0), Number(source.y || 0) - Number(best.y || 0)) ? candidate : best, choices[0]);
}

export function createCavalryAquilaStandardKit() {
  return { id: "cavalry-aquila-standard-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    const romanCells = players(cells).length ? players(cells) : cells.slice(0, 4);
    return romanCells.map((cell, index) => {
      const pressure = hostileNeighbors(cell, map).length * 0.12;
      const standardIntegrity = clamp(0.38 + troopPower(troopsOf(cell)) / 58 + friendlyNeighbors(cell, map).length * 0.07 - pressure + signalSeed(cell, campaign.turn, 2) * 0.18);
      return descriptor(`aquila-standard:${cell.id ?? index}`, "aquila-standard", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        standardIntegrity: round(standardIntegrity),
        eagleHeight: Math.max(2, Math.round(3 + standardIntegrity * 8)),
        guardNeed: round(1 - standardIntegrity),
        label: standardIntegrity > 0.64 ? "Aquila held high" : "Stabilize aquila standard",
        priority: index
      });
    }).sort((a, b) => b.guardNeed - a.guardNeed).slice(0, 6);
  }};
}

export function createCavalryVexillumRallyRouteKit() {
  return { id: "cavalry-vexillum-rally-route-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romans = players(cells); const targets = hostiles(cells).length ? hostiles(cells) : neutrals(cells).length ? neutrals(cells) : cells.slice(-4);
    return targets.map((cell, index) => {
      const source = nearest(cell, romans) || cells[0] || cell;
      const distance = Math.hypot(Number(cell.x || 0) - Number(source.x || 0), Number(cell.y || 0) - Number(source.y || 0));
      const rallyUrgency = clamp(0.32 + troopPower(troopsOf(cell)) / 54 + signalSeed(cell, campaign.turn, 4) * 0.14 - distance / 2200 + Number(campaign.actions || 0) * 0.008);
      return descriptor(`vexillum-rally:${source.id ?? "source"}:${cell.id ?? index}`, "vexillum-rally-route", {
        sourceId: String(source.id ?? "source"),
        targetId: String(cell.id ?? index),
        source: centerOf(source),
        target: centerOf(cell),
        rallyUrgency: round(rallyUrgency),
        bannerPairs: Math.max(1, Math.round(rallyUrgency * 6)),
        routeState: rallyUrgency > 0.66 ? "urgent" : rallyUrgency > 0.42 ? "active" : "reserve",
        label: rallyUrgency > 0.6 ? "Run vexillum rally" : "Hold rally banner",
        priority: index
      });
    }).sort((a, b) => b.rallyUrgency - a.rallyUrgency).slice(0, 7);
  }};
}

export function createCavalryCohortMoraleDrumKit() {
  return { id: "cavalry-cohort-morale-drum-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    const romanCells = players(cells).length ? players(cells) : cells.slice(0, 5);
    return romanCells.map((cell, index) => {
      const cadenceStrength = clamp(0.34 + troopCount(troopsOf(cell)) / 42 + friendlyNeighbors(cell, map).length * 0.08 - hostileNeighbors(cell, map).length * 0.05 + signalSeed(cell, campaign.turn, 6) * 0.16);
      return descriptor(`cohort-drum:${cell.id ?? index}`, "cohort-morale-drum", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        cadenceStrength: round(cadenceStrength),
        drumCount: Math.max(1, Math.round(cadenceStrength * 8)),
        tempo: cadenceStrength > 0.64 ? "advance" : cadenceStrength > 0.42 ? "steady" : "recover",
        screenAnchor: { x: round(0.18 + (index % 4) * 0.09), y: round(0.32 + Math.floor(index / 4) * 0.06) },
        fill: round(cadenceStrength),
        label: cadenceStrength > 0.56 ? "Cohort cadence steady" : "Beat recovery cadence",
        priority: index
      });
    }).sort((a, b) => a.cadenceStrength - b.cadenceStrength).slice(0, 6);
  }};
}

export function createCavalryStandardGuardRingKit() {
  return { id: "cavalry-standard-guard-ring-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const map = byId(cells);
    const romanCells = players(cells).length ? players(cells) : cells.slice(0, 4);
    return romanCells.map((cell, index) => {
      const encirclementRisk = clamp(0.24 + hostileNeighbors(cell, map).length * 0.18 + signalSeed(cell, campaign.turn, 8) * 0.2 - friendlyNeighbors(cell, map).length * 0.06);
      return descriptor(`standard-guard-ring:${cell.id ?? index}`, "standard-guard-ring", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        encirclementRisk: round(encirclementRisk),
        ringRadius: round(42 + encirclementRisk * 110),
        shieldPairs: Math.max(2, Math.round(4 + encirclementRisk * 14)),
        label: encirclementRisk > 0.58 ? "Tighten standard guard" : "Guard ring posted",
        priority: index
      });
    }).sort((a, b) => b.encirclementRisk - a.encirclementRisk).slice(0, 6);
  }};
}

export function createCavalryWoundedStandardLitterKit() {
  return { id: "cavalry-wounded-standard-litter-kit", describe(campaign = {}) {
    const cells = candidateCells(campaign); const romans = players(cells).length ? players(cells) : cells.slice(0, 4);
    return romans.map((cell, index) => {
      const woundLoad = clamp(0.22 + troopCount(troopsOf(cell)) / 56 + signalSeed(cell, campaign.turn, 10) * 0.2 + (Number(campaign.turn || 0) % 5) * 0.022);
      return descriptor(`wounded-standard-litter:${cell.id ?? index}`, "wounded-standard-litter", {
        cellId: String(cell.id ?? index),
        center: centerOf(cell),
        woundLoad: round(woundLoad),
        litterTeams: Math.max(1, Math.round(woundLoad * 5)),
        honorEscort: woundLoad > 0.6 ? "double-file" : "single-file",
        label: woundLoad > 0.56 ? "Escort wounded standard bearer" : "Litter team staged",
        screenAnchor: { x: round(0.66 + (index % 3) * 0.07), y: round(0.3 + Math.floor(index / 3) * 0.06) },
        fill: round(woundLoad),
        priority: index
      });
    }).sort((a, b) => b.woundLoad - a.woundLoad).slice(0, 5);
  }};
}

export function createCavalryDuskHonorLedgerKit() {
  return { id: "cavalry-dusk-honor-ledger-kit", describe(campaign = {}, buckets = {}) {
    const cells = candidateCells(campaign); const romanCount = players(cells).length; const hostileCount = hostiles(cells).length;
    const standards = buckets.aquilaStandards || []; const drums = buckets.cohortMoraleDrums || []; const guardRings = buckets.standardGuardRings || [];
    const standardAverage = standards.length ? standards.reduce((sum, item) => sum + item.standardIntegrity, 0) / standards.length : 0.45;
    const drumAverage = drums.length ? drums.reduce((sum, item) => sum + item.cadenceStrength, 0) / drums.length : 0.45;
    const guardRisk = guardRings.length ? guardRings.reduce((sum, item) => sum + item.encirclementRisk, 0) / guardRings.length : 0.45;
    const honorReadiness = clamp(0.24 + standardAverage * 0.3 + drumAverage * 0.25 + romanCount / Math.max(5, cells.length) * 0.16 - hostileCount / Math.max(8, cells.length) * 0.08 - guardRisk * 0.12);
    return [descriptor("dusk-honor-ledger:campaign", "dusk-honor-ledger", {
      honorReadiness: round(honorReadiness),
      moraleRisk: round(1 - honorReadiness),
      tabletsSealed: Math.max(2, Math.round(honorReadiness * 14)),
      commandState: honorReadiness > 0.68 ? "ready" : honorReadiness > 0.44 ? "staging" : "fragmented",
      screenAnchor: { x: 0.78, y: 0.24 },
      fill: round(honorReadiness),
      label: honorReadiness > 0.62 ? "Legion honor ledger sealed" : "Recover legion standards"
    })];
  }};
}

export function createCavalryStandardBearerMoraleRendererHandoffKit() {
  return { id: "cavalry-standard-bearer-morale-renderer-handoff-kit", describe(buckets = {}) {
    const descriptors = Object.freeze({
      aquilaStandards: buckets.aquilaStandards || [],
      vexillumRallyRoutes: buckets.vexillumRallyRoutes || [],
      cohortMoraleDrums: buckets.cohortMoraleDrums || [],
      standardGuardRings: buckets.standardGuardRings || [],
      woundedStandardLitters: buckets.woundedStandardLitters || [],
      duskHonorLedgers: buckets.duskHonorLedgers || []
    });
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "cavalry-standard-bearer-morale-renderer-handoff", kind: "renderer-handoff", contract: OWNERSHIP_BOUNDARY, rendererConsumesDescriptorsOnly: true, descriptors, counts };
  }};
}

export function createCavalryStandardBearerMoraleReadinessDomainKit() {
  const aquilaStandardKit = createCavalryAquilaStandardKit();
  const vexillumRallyRouteKit = createCavalryVexillumRallyRouteKit();
  const cohortMoraleDrumKit = createCavalryCohortMoraleDrumKit();
  const standardGuardRingKit = createCavalryStandardGuardRingKit();
  const woundedStandardLitterKit = createCavalryWoundedStandardLitterKit();
  const duskHonorLedgerKit = createCavalryDuskHonorLedgerKit();
  const rendererHandoffKit = createCavalryStandardBearerMoraleRendererHandoffKit();
  return {
    id: "cavalry-standard-bearer-morale-readiness-domain-kit",
    tree: CAVALRY_STANDARD_BEARER_MORALE_READINESS_DOMAIN_TREE,
    ownershipBoundary: OWNERSHIP_BOUNDARY,
    kits: Object.freeze([aquilaStandardKit, vexillumRallyRouteKit, cohortMoraleDrumKit, standardGuardRingKit, woundedStandardLitterKit, duskHonorLedgerKit, rendererHandoffKit]),
    describe(campaign = {}) {
      const aquilaStandards = aquilaStandardKit.describe(campaign);
      const vexillumRallyRoutes = vexillumRallyRouteKit.describe(campaign);
      const cohortMoraleDrums = cohortMoraleDrumKit.describe(campaign);
      const standardGuardRings = standardGuardRingKit.describe(campaign);
      const woundedStandardLitters = woundedStandardLitterKit.describe(campaign);
      const duskHonorLedgers = duskHonorLedgerKit.describe(campaign, { aquilaStandards, cohortMoraleDrums, standardGuardRings });
      const rendererHandoff = rendererHandoffKit.describe({ aquilaStandards, vexillumRallyRoutes, cohortMoraleDrums, standardGuardRings, woundedStandardLitters, duskHonorLedgers });
      const ledger = duskHonorLedgers[0] || { honorReadiness: 0, moraleRisk: 1, commandState: "fragmented" };
      const guardRisk = standardGuardRings.length ? standardGuardRings.reduce((sum, item) => sum + item.encirclementRisk, 0) / standardGuardRings.length : 0.5;
      const woundLoad = woundedStandardLitters.length ? woundedStandardLitters.reduce((sum, item) => sum + item.woundLoad, 0) / woundedStandardLitters.length : 0.4;
      const readiness = clamp(Number(ledger.honorReadiness || 0) * 0.7 + (1 - guardRisk) * 0.16 + (1 - woundLoad) * 0.14);
      const moraleRisk = clamp(1 - readiness);
      return Object.freeze({
        id: "cavalry-standard-bearer-morale-readiness",
        kind: "cavalry-standard-bearer-morale-readiness",
        tree: CAVALRY_STANDARD_BEARER_MORALE_READINESS_DOMAIN_TREE,
        readiness: round(readiness),
        moraleRisk: round(moraleRisk),
        missionState: readiness > 0.68 ? "ready" : readiness > 0.44 ? "staging" : "fragmented",
        summary: readiness > 0.68 ? "Legion standards are guarded, rallied, and ledgered." : readiness > 0.44 ? "Legion standards need escort and morale stabilization." : "Legion identity is fragmented; recover standards before campaign push.",
        ownershipBoundary: OWNERSHIP_BOUNDARY,
        rendererHandoff
      });
    }
  };
}
