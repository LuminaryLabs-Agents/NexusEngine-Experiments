const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-field-hospital-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

export const CAVALRY_FIELD_HOSPITAL_READINESS_DOMAIN_TREE = `
cavalry-field-hospital-readiness-domain
├─ casualty-stabilization-domain
│  ├─ wounded-cohort-domain
│  │  └─ cavalry-wounded-cohort-triage-kit
│  └─ medic-tent-domain
│     └─ cavalry-medic-tent-capacity-kit
├─ supply-sanitation-domain
│  ├─ bandage-cart-domain
│  │  └─ cavalry-bandage-cart-route-kit
│  └─ water-sanitation-domain
│     └─ cavalry-sanitation-well-watch-kit
├─ evacuation-return-domain
│  ├─ stretcher-road-domain
│  │  └─ cavalry-stretcher-road-thread-kit
│  └─ dawn-relief-domain
│     └─ cavalry-dawn-relief-standard-kit
└─ renderer-handoff
   └─ cavalry-field-hospital-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(precision));
const stableCells = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];
const ownerOf = (cell = {}) => cell.owner || "neutral";
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const neighborsOf = (cell = {}) => cell.neighbors || cell.n || [];
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const makeDescriptor = (id, kind, payload) => ({ id, kind, ...payload });

function makeCellMap(cells) {
  return new Map(cells.map((cell) => [String(cell.id), cell]));
}

function playerCells(cells) {
  return cells.filter((cell) => ownerOf(cell) === "player");
}

function hostileCells(cells) {
  return cells.filter((cell) => {
    const owner = ownerOf(cell);
    return owner !== "player" && owner !== "neutral";
  });
}

function adjacentCells(cell = {}, byId = new Map()) {
  return neighborsOf(cell).map((id) => byId.get(String(id))).filter(Boolean);
}

function hostileNeighbors(cell, byId) {
  return adjacentCells(cell, byId).filter((target) => {
    const owner = ownerOf(target);
    return owner !== "player" && owner !== "neutral";
  });
}

function playerNeighbors(cell, byId) {
  return adjacentCells(cell, byId).filter((target) => ownerOf(target) === "player");
}

function nearestPlayer(cell, romans = []) {
  if (!romans.length) return null;
  return romans.reduce((best, candidate) => {
    const bestDistance = Math.hypot(Number(cell.x || 0) - Number(best.x || 0), Number(cell.y || 0) - Number(best.y || 0));
    const candidateDistance = Math.hypot(Number(cell.x || 0) - Number(candidate.x || 0), Number(cell.y || 0) - Number(candidate.y || 0));
    return candidateDistance < bestDistance ? candidate : best;
  }, romans[0]);
}

export function createCavalryWoundedCohortTriageKit() {
  return {
    id: "cavalry-wounded-cohort-triage-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const candidates = playerCells(cells).filter((cell) => hostileNeighbors(cell, byId).length > 0 || troopCount(troopsOf(cell)) <= 6);
      const fallback = candidates.length ? candidates : playerCells(cells).slice(0, 5);
      const turn = Number(campaign.turn || 1);
      return fallback.map((cell, index) => {
        const h = hostileNeighbors(cell, byId).length;
        const count = troopCount(troopsOf(cell));
        const severity = clamp(0.2 + h * 0.18 + Math.max(0, 8 - count) * 0.055 + ((turn + index) % 4) * 0.04);
        return makeDescriptor(`wounded:${cell.id}`, "wounded-cohort-triage", {
          cellId: String(cell.id),
          center: centerOf(cell),
          severity: round(severity),
          woundedEstimate: Math.max(1, Math.round(severity * 12 + h * 2)),
          hostileNeighbors: h,
          troopCount: round(count),
          label: severity > 0.68 ? "Urgent triage" : severity > 0.44 ? "Treat wounded" : "Watch cohort",
          priority: index
        });
      }).sort((a, b) => b.severity - a.severity).slice(0, 6);
    }
  };
}

export function createCavalryMedicTentCapacityKit() {
  return {
    id: "cavalry-medic-tent-capacity-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells)
        .map((cell, index) => {
          const friendly = playerNeighbors(cell, byId).length;
          const h = hostileNeighbors(cell, byId).length;
          const count = troopCount(troopsOf(cell));
          const capacity = clamp(0.22 + friendly * 0.16 + count * 0.035 - h * 0.08 + (Number(cell.x || 0) % 83) / 460);
          return makeDescriptor(`medic-tent:${cell.id}`, "medic-tent-capacity", {
            cellId: String(cell.id),
            center: centerOf(cell),
            friendlyNeighbors: friendly,
            hostileNeighbors: h,
            capacity: round(capacity),
            fill: round(capacity),
            label: capacity > 0.66 ? "Field tent ready" : h > 0 ? "Tent exposed" : "Needs medics",
            screenAnchor: { x: 0.18 + (index % 3) * 0.07, y: 0.82 + Math.floor(index / 3) * 0.04 },
            priority: index
          });
        })
        .sort((a, b) => b.capacity - a.capacity)
        .slice(0, 6);
    }
  };
}

export function createCavalryBandageCartRouteKit() {
  return {
    id: "cavalry-bandage-cart-route-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const romans = playerCells(cells);
      const pressured = romans.filter((cell) => hostileNeighbors(cell, byId).length > 0 || troopCount(troopsOf(cell)) <= 7);
      const targets = pressured.length ? pressured : romans.slice(0, 6);
      return targets.map((cell, index) => {
        const source = playerNeighbors(cell, byId).sort((a, b) => troopPower(troopsOf(b)) - troopPower(troopsOf(a)))[0] || nearestPlayer(cell, romans) || cell;
        const urgency = clamp(0.24 + hostileNeighbors(cell, byId).length * 0.16 + Math.max(0, 8 - troopCount(troopsOf(cell))) * 0.05);
        return makeDescriptor(`bandage-cart:${source.id || "rome"}:${cell.id}`, "bandage-cart-route", {
          sourceId: String(source.id || cell.id),
          targetId: String(cell.id),
          source: centerOf(source),
          target: centerOf(cell),
          urgency: round(urgency),
          load: round(clamp(0.38 + troopPower(troopsOf(source)) / 28)),
          label: urgency > 0.62 ? "Rush bandages" : "Stock cart",
          priority: index
        });
      }).sort((a, b) => b.urgency - a.urgency).slice(0, 6);
    }
  };
}

export function createCavalrySanitationWellWatchKit() {
  return {
    id: "cavalry-sanitation-well-watch-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells).map((cell, index) => {
        const friendly = playerNeighbors(cell, byId).length;
        const crowding = clamp(troopCount(troopsOf(cell)) / 14);
        const purity = clamp(0.74 - crowding * 0.28 + friendly * 0.06 - hostileNeighbors(cell, byId).length * 0.07 + (Number(cell.y || 0) % 67) / 520);
        return makeDescriptor(`sanitation:${cell.id}`, "sanitation-well-watch", {
          cellId: String(cell.id),
          center: centerOf(cell),
          purity: round(purity),
          risk: round(1 - purity),
          crowding: round(crowding),
          label: purity > 0.62 ? "Clean well" : "Boil water",
          priority: index
        });
      }).sort((a, b) => b.risk - a.risk).slice(0, 5);
    }
  };
}

export function createCavalryStretcherRoadThreadKit() {
  return {
    id: "cavalry-stretcher-road-thread-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const romans = playerCells(cells);
      const hostiles = hostileCells(cells);
      const rescueTargets = romans.filter((cell) => hostileNeighbors(cell, byId).length > 0 || troopCount(troopsOf(cell)) <= 6);
      const fallback = rescueTargets.length ? rescueTargets : romans.slice(0, 5);
      return fallback.map((cell, index) => {
        const threat = hostileNeighbors(cell, byId)[0] || hostiles[index % Math.max(1, hostiles.length)] || null;
        const safety = clamp(0.72 - (threat ? 0.18 : 0) + playerNeighbors(cell, byId).length * 0.08 - Math.max(0, 7 - troopCount(troopsOf(cell))) * 0.04);
        return makeDescriptor(`stretcher-road:${cell.id}`, "stretcher-road-thread", {
          sourceId: String(cell.id),
          targetId: String(threat?.id || cell.id),
          source: centerOf(cell),
          target: threat ? centerOf(threat) : { ...centerOf(cell), x: round(Number(cell.x || 0) + 32), y: round(Number(cell.y || 0) + 20) },
          safety: round(safety),
          label: safety > 0.62 ? "Evac road open" : "Escort needed",
          priority: index
        });
      }).sort((a, b) => a.safety - b.safety).slice(0, 6);
    }
  };
}

export function createCavalryDawnReliefStandardKit() {
  return {
    id: "cavalry-dawn-relief-standard-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const romans = playerCells(cells);
      const hostiles = hostileCells(cells);
      const actions = Number(campaign.actions ?? 0);
      const maxActions = Number(campaign.preset?.actions || Math.max(3, actions));
      const turn = Number(campaign.turn || 1);
      const stability = clamp(0.22 + romans.length / Math.max(1, cells.length) * 0.42 + actions / Math.max(1, maxActions) * 0.2 - hostiles.length / Math.max(1, cells.length) * 0.14);
      const dawn = clamp(((turn + 1) % 6) / 5);
      return [
        makeDescriptor("relief:standard", "dawn-relief-standard", {
          slot: "relief-standard",
          turn,
          fill: round(stability),
          pressure: round(1 - stability),
          label: stability > 0.66 ? "Relief column ready" : "Stabilize hospital",
          screenAnchor: { x: 0.5, y: 0.2 },
          priority: 0
        }),
        makeDescriptor("relief:dawn", "dawn-relief-standard", {
          slot: "dawn-window",
          turn,
          fill: round(1 - dawn),
          pressure: round(dawn),
          label: dawn > 0.66 ? "Dawn handoff near" : "Night care window",
          screenAnchor: { x: 0.5, y: 0.25 },
          priority: 1
        })
      ];
    }
  };
}

export function createCavalryFieldHospitalRendererHandoffKit() {
  return {
    id: "cavalry-field-hospital-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = Object.freeze({
        woundedCohortTriages: buckets.woundedCohortTriages || [],
        medicTentCapacities: buckets.medicTentCapacities || [],
        bandageCartRoutes: buckets.bandageCartRoutes || [],
        sanitationWellWatches: buckets.sanitationWellWatches || [],
        stretcherRoadThreads: buckets.stretcherRoadThreads || [],
        dawnReliefStandards: buckets.dawnReliefStandards || []
      });
      return {
        id: "cavalry-field-hospital-renderer-handoff",
        kind: "renderer-handoff",
        contract: OWNERSHIP_BOUNDARY,
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createCavalryFieldHospitalReadinessDomainKit() {
  const woundedCohortTriageKit = createCavalryWoundedCohortTriageKit();
  const medicTentCapacityKit = createCavalryMedicTentCapacityKit();
  const bandageCartRouteKit = createCavalryBandageCartRouteKit();
  const sanitationWellWatchKit = createCavalrySanitationWellWatchKit();
  const stretcherRoadThreadKit = createCavalryStretcherRoadThreadKit();
  const dawnReliefStandardKit = createCavalryDawnReliefStandardKit();
  const rendererHandoffKit = createCavalryFieldHospitalRendererHandoffKit();
  return {
    id: "cavalry-field-hospital-readiness-domain-kit",
    tree: CAVALRY_FIELD_HOSPITAL_READINESS_DOMAIN_TREE,
    kits: [
      woundedCohortTriageKit.id,
      medicTentCapacityKit.id,
      bandageCartRouteKit.id,
      sanitationWellWatchKit.id,
      stretcherRoadThreadKit.id,
      dawnReliefStandardKit.id,
      rendererHandoffKit.id
    ],
    describe(campaign = {}) {
      const woundedCohortTriages = woundedCohortTriageKit.describe(campaign);
      const medicTentCapacities = medicTentCapacityKit.describe(campaign);
      const bandageCartRoutes = bandageCartRouteKit.describe(campaign);
      const sanitationWellWatches = sanitationWellWatchKit.describe(campaign);
      const stretcherRoadThreads = stretcherRoadThreadKit.describe(campaign);
      const dawnReliefStandards = dawnReliefStandardKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({
        woundedCohortTriages,
        medicTentCapacities,
        bandageCartRoutes,
        sanitationWellWatches,
        stretcherRoadThreads,
        dawnReliefStandards
      });
      return {
        id: "cavalry-field-hospital-readiness-domain",
        kind: "field-hospital-readiness-domain",
        tree: CAVALRY_FIELD_HOSPITAL_READINESS_DOMAIN_TREE,
        source: {
          route: "the-cavalry-of-rome",
          turn: Number(campaign.turn || 0),
          size: String(campaign.sizeId || campaign.preset?.label || "unknown")
        },
        woundedCohortTriages,
        medicTentCapacities,
        bandageCartRoutes,
        sanitationWellWatches,
        stretcherRoadThreads,
        dawnReliefStandards,
        rendererHandoff
      };
    }
  };
}
