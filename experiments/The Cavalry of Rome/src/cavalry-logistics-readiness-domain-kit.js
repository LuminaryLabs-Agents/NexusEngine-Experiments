const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-logistics-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

export const CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE = `
cavalry-logistics-readiness-domain
├─ sustainment-domain
│  ├─ depot-radius-domain
│  │  └─ cavalry-supply-depot-radius-kit
│  └─ forage-corridor-domain
│     └─ cavalry-forage-corridor-kit
├─ campaign-route-domain
│  ├─ road-strain-domain
│  │  └─ cavalry-road-strain-thread-kit
│  └─ courier-order-domain
│     └─ cavalry-courier-order-pulse-kit
├─ seasonal-siege-domain
│  ├─ siege-readiness-domain
│  │  └─ cavalry-siege-readiness-signal-kit
│  └─ winter-attrition-domain
│     └─ cavalry-winter-attrition-warning-kit
└─ renderer-handoff
   └─ cavalry-logistics-readiness-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(precision));
const stableCells = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const ownerOf = (cell = {}) => cell.owner || "neutral";
const neighborsOf = (cell = {}) => cell.neighbors || cell.n || [];
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const makeDescriptor = (id, kind, payload) => ({ id, kind, ...payload });

function makeCellMap(cells) {
  return new Map(cells.map((cell) => [String(cell.id), cell]));
}

function distanceBetween(a = {}, b = {}) {
  const dx = Number(a.x || 0) - Number(b.x || 0);
  const dy = Number(a.y || 0) - Number(b.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function hostileToRome(cell = {}) {
  const owner = ownerOf(cell);
  return owner !== "neutral" && owner !== "player";
}

function playerCells(cells) {
  return cells.filter((cell) => ownerOf(cell) === "player");
}

function findSelectedRomanCell(campaign = {}, cells = stableCells(campaign), byId = makeCellMap(cells)) {
  const selected = byId.get(String(campaign.from || ""));
  if (selected && ownerOf(selected) === "player") return selected;
  return cells.find((cell) => ownerOf(cell) === "player") || null;
}

export function createCavalrySupplyDepotRadiusKit() {
  return {
    id: "cavalry-supply-depot-radius-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells)
        .map((cell, index) => {
          const neighbors = neighborsOf(cell).map((id) => byId.get(String(id))).filter(Boolean);
          const friendlyNeighbors = neighbors.filter((target) => ownerOf(target) === "player").length;
          const frontierNeighbors = neighbors.filter((target) => ownerOf(target) === "neutral").length;
          const hostileNeighbors = neighbors.filter(hostileToRome).length;
          const power = troopPower(troopsOf(cell));
          const supplyScore = clamp(0.18 + friendlyNeighbors * 0.16 + frontierNeighbors * 0.08 + power * 0.035 - hostileNeighbors * 0.09);
          return makeDescriptor(`depot:${cell.id}`, "supply-depot-radius", {
            cellId: String(cell.id),
            center: centerOf(cell),
            friendlyNeighbors,
            frontierNeighbors,
            hostileNeighbors,
            troopPower: round(power),
            supplyScore: round(supplyScore),
            radius: round(0.74 + supplyScore * 1.4 + friendlyNeighbors * 0.08),
            label: supplyScore > 0.68 ? "Stable depot" : hostileNeighbors > 0 ? "Contested supply" : "Forward supply",
            priority: index
          });
        })
        .sort((a, b) => b.supplyScore - a.supplyScore)
        .slice(0, 8);
    }
  };
}

export function createCavalryForageCorridorKit() {
  return {
    id: "cavalry-forage-corridor-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells)
        .flatMap((cell) => neighborsOf(cell)
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .filter((target) => ownerOf(target) === "neutral")
          .map((target, index) => {
            const forageValue = clamp(0.26 + (Number(target.y || 0) % 113) / 220 + troopPower(troopsOf(cell)) * 0.018);
            return makeDescriptor(`forage:${cell.id}:${target.id}`, "forage-corridor", {
              sourceId: String(cell.id),
              targetId: String(target.id),
              source: centerOf(cell),
              target: centerOf(target),
              forageValue: round(forageValue),
              width: round(0.32 + forageValue * 0.64),
              recommendedDetachment: forageValue > 0.62 ? "light-cavalry-foragers" : "screen-and-probe",
              priority: index
            });
          }))
        .sort((a, b) => b.forageValue - a.forageValue)
        .slice(0, 8);
    }
  };
}

export function createCavalryRoadStrainThreadKit() {
  return {
    id: "cavalry-road-strain-thread-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const seen = new Set();
      return playerCells(cells)
        .flatMap((cell) => neighborsOf(cell)
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .filter((target) => ownerOf(target) === "player")
          .map((target) => {
            const key = [String(cell.id), String(target.id)].sort().join(":");
            if (seen.has(key)) return null;
            seen.add(key);
            const combinedTroops = troopCount(troopsOf(cell)) + troopCount(troopsOf(target));
            const distance = distanceBetween(cell, target);
            const strain = clamp(combinedTroops / 18 + distance / 520 - Number(campaign.actions || 0) * 0.03);
            return makeDescriptor(`road:${key}`, "road-strain-thread", {
              sourceId: String(cell.id),
              targetId: String(target.id),
              source: centerOf(cell),
              target: centerOf(target),
              combinedTroops: round(combinedTroops),
              distance: round(distance),
              strain: round(strain),
              condition: strain > 0.7 ? "overburdened" : strain > 0.42 ? "strained" : "clear",
              priority: seen.size - 1
            });
          }))
        .filter(Boolean)
        .slice(0, 8);
    }
  };
}

export function createCavalrySiegeReadinessSignalKit() {
  return {
    id: "cavalry-siege-readiness-signal-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const selected = findSelectedRomanCell(campaign, cells, byId);
      const frontier = selected ? [selected] : playerCells(cells);
      return frontier
        .flatMap((cell) => neighborsOf(cell)
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .filter(hostileToRome)
          .map((target, index) => {
            const attack = troopPower(campaign.draft && String(campaign.from || "") === String(cell.id) ? campaign.draft : troopsOf(cell));
            const defense = troopPower(troopsOf(target));
            const readiness = clamp(attack / Math.max(1, attack + defense));
            return makeDescriptor(`siege:${cell.id}:${target.id}`, "siege-readiness-signal", {
              sourceId: String(cell.id),
              targetId: String(target.id),
              source: centerOf(cell),
              target: centerOf(target),
              attackPower: round(attack),
              defensePower: round(defense),
              readiness: round(readiness),
              signal: readiness > 0.62 ? "breach-ready" : readiness > 0.42 ? "prepare-ladders" : "delay-siege",
              priority: index
            });
          }))
        .sort((a, b) => b.readiness - a.readiness)
        .slice(0, 8);
    }
  };
}

export function createCavalryCourierOrderPulseKit() {
  return {
    id: "cavalry-courier-order-pulse-kit",
    describe(campaign = {}) {
      const actions = Number(campaign.actions ?? 0);
      const maxActions = Number(campaign.preset?.actions || Math.max(3, actions));
      const turn = Number(campaign.turn || 1);
      return [
        makeDescriptor("courier:orders", "courier-order-pulse", {
          slot: "orders",
          turn,
          actionsRemaining: actions,
          maxActions,
          fill: round(clamp(actions / Math.max(1, maxActions))),
          pulse: round((turn * 0.17 + actions * 0.11) % 1),
          label: actions <= 0 ? "Couriers spent" : actions === 1 ? "Final courier" : `${actions} courier orders`,
          screenAnchor: { x: 0.18, y: 0.12 },
          priority: 0
        }),
        makeDescriptor("courier:selected-route", "courier-order-pulse", {
          slot: "selected-route",
          turn,
          from: String(campaign.from || ""),
          to: String(campaign.to || ""),
          fill: campaign.from && campaign.to ? 1 : campaign.from ? 0.58 : 0.22,
          pulse: round((turn * 0.23) % 1),
          label: campaign.from && campaign.to ? "Route carried" : campaign.from ? "Pick destination" : "Select cohort",
          screenAnchor: { x: 0.18, y: 0.17 },
          priority: 1
        })
      ];
    }
  };
}

export function createCavalryWinterAttritionWarningKit() {
  return {
    id: "cavalry-winter-attrition-warning-kit",
    describe(campaign = {}) {
      const turn = Number(campaign.turn || 1);
      const seasonPressure = clamp(((turn - 1) % 4) / 3);
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells)
        .map((cell, index) => {
          const hostileNeighbors = neighborsOf(cell).map((id) => byId.get(String(id))).filter(Boolean).filter(hostileToRome);
          const count = troopCount(troopsOf(cell));
          const exposure = clamp(seasonPressure * 0.44 + hostileNeighbors.length * 0.16 + (count < 5 ? 0.28 : 0) + (Number(cell.y || 0) % 97) / 360);
          return makeDescriptor(`winter:${cell.id}`, "winter-attrition-warning", {
            cellId: String(cell.id),
            center: centerOf(cell),
            seasonPressure: round(seasonPressure),
            hostileNeighborIds: hostileNeighbors.map((hostile) => String(hostile.id)),
            troopCount: round(count),
            exposure: round(exposure),
            warning: exposure > 0.66 ? "winter-loss-risk" : exposure > 0.38 ? "watch-rations" : "supplied",
            screenAnchor: { x: 0.5 + (index % 4 - 1.5) * 0.08, y: 0.89 },
            fill: round(1 - exposure),
            priority: index
          });
        })
        .filter((descriptor) => descriptor.exposure > 0.18)
        .sort((a, b) => b.exposure - a.exposure)
        .slice(0, 6);
    }
  };
}

export function createCavalryLogisticsReadinessRendererHandoffKit() {
  return {
    id: "cavalry-logistics-readiness-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = Object.freeze({
        supplyDepotRadii: buckets.supplyDepotRadii || [],
        forageCorridors: buckets.forageCorridors || [],
        roadStrainThreads: buckets.roadStrainThreads || [],
        siegeReadinessSignals: buckets.siegeReadinessSignals || [],
        courierOrderPulses: buckets.courierOrderPulses || [],
        winterAttritionWarnings: buckets.winterAttritionWarnings || []
      });
      return {
        id: "cavalry-logistics-readiness-renderer-handoff",
        kind: "renderer-handoff",
        contract: OWNERSHIP_BOUNDARY,
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createCavalryLogisticsReadinessDomainKit() {
  const supplyDepotRadiusKit = createCavalrySupplyDepotRadiusKit();
  const forageCorridorKit = createCavalryForageCorridorKit();
  const roadStrainThreadKit = createCavalryRoadStrainThreadKit();
  const siegeReadinessSignalKit = createCavalrySiegeReadinessSignalKit();
  const courierOrderPulseKit = createCavalryCourierOrderPulseKit();
  const winterAttritionWarningKit = createCavalryWinterAttritionWarningKit();
  const rendererHandoffKit = createCavalryLogisticsReadinessRendererHandoffKit();
  return {
    id: "cavalry-logistics-readiness-domain-kit",
    tree: CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE,
    kits: [
      supplyDepotRadiusKit.id,
      forageCorridorKit.id,
      roadStrainThreadKit.id,
      siegeReadinessSignalKit.id,
      courierOrderPulseKit.id,
      winterAttritionWarningKit.id,
      rendererHandoffKit.id
    ],
    describe(campaign = {}) {
      const supplyDepotRadii = supplyDepotRadiusKit.describe(campaign);
      const forageCorridors = forageCorridorKit.describe(campaign);
      const roadStrainThreads = roadStrainThreadKit.describe(campaign);
      const siegeReadinessSignals = siegeReadinessSignalKit.describe(campaign);
      const courierOrderPulses = courierOrderPulseKit.describe(campaign);
      const winterAttritionWarnings = winterAttritionWarningKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({
        supplyDepotRadii,
        forageCorridors,
        roadStrainThreads,
        siegeReadinessSignals,
        courierOrderPulses,
        winterAttritionWarnings
      });
      return {
        id: "cavalry-logistics-readiness-domain",
        kind: "logistics-readiness-domain",
        tree: CAVALRY_LOGISTICS_READINESS_DOMAIN_TREE,
        source: {
          route: "the-cavalry-of-rome",
          turn: Number(campaign.turn || 0),
          size: String(campaign.sizeId || campaign.preset?.label || "unknown")
        },
        supplyDepotRadii,
        forageCorridors,
        roadStrainThreads,
        siegeReadinessSignals,
        courierOrderPulses,
        winterAttritionWarnings,
        rendererHandoff
      };
    }
  };
}
