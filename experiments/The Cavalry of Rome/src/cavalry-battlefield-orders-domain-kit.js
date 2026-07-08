const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-battlefield-orders-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

export const CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE = `
cavalry-battlefield-orders-domain
├─ reconnaissance-domain
│  ├─ scouting-vector-domain
│  │  └─ cavalry-scouting-vector-kit
│  └─ flank-risk-domain
│     └─ cavalry-flank-risk-arc-kit
├─ formation-response-domain
│  ├─ reinforcement-domain
│  │  └─ cavalry-reinforcement-callout-kit
│  └─ attrition-domain
│     └─ cavalry-attrition-forecast-chip-kit
├─ campaign-tempo-domain
│  ├─ turn-tempo-domain
│  │  └─ cavalry-turn-tempo-standard-kit
│  └─ objective-pressure-domain
│     └─ cavalry-objective-pressure-banner-kit
└─ renderer-handoff
   └─ cavalry-battlefield-orders-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number(clamp(Number(value), -1000000, 1000000).toFixed(precision));
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

function hostileToRome(cell) {
  const owner = ownerOf(cell);
  return owner !== "neutral" && owner !== "player";
}

function findSelectedRomanCell(campaign = {}, cells = stableCells(campaign), byId = makeCellMap(cells)) {
  const selected = byId.get(String(campaign.from || ""));
  if (selected && ownerOf(selected) === "player") return selected;
  return cells.find((cell) => ownerOf(cell) === "player") || null;
}

function relationOf(target = {}) {
  const owner = ownerOf(target);
  if (owner === "player") return "friendly";
  if (owner === "neutral") return "frontier";
  return "hostile";
}

export function createCavalryScoutingVectorKit() {
  return {
    id: "cavalry-scouting-vector-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const from = findSelectedRomanCell(campaign, cells, byId);
      if (!from) return [];
      const friendlyPower = troopPower(troopsOf(from));
      return neighborsOf(from)
        .map((id) => byId.get(String(id)))
        .filter(Boolean)
        .filter((target) => ownerOf(target) !== "player")
        .slice(0, 6)
        .map((target, index) => {
          const targetPower = troopPower(troopsOf(target));
          const relation = relationOf(target);
          return makeDescriptor(`scout:${from.id}:${target.id}`, "scouting-vector", {
            sourceId: String(from.id),
            targetId: String(target.id),
            source: centerOf(from),
            target: centerOf(target),
            targetOwner: ownerOf(target),
            relation,
            confidence: round(clamp(0.34 + friendlyPower / Math.max(1, friendlyPower + targetPower + 2) * 0.46 + Number(campaign.actions || 0) * 0.03)),
            recommendedScoutClass: targetPower > friendlyPower ? "light-screen" : relation === "frontier" ? "forager" : "probe-cavalry",
            priority: index,
            visual: { tone: relation === "hostile" ? "danger-red" : "frontier-gold", pulse: round(Number(campaign.turn || 0) * 0.173 + index) }
          });
        });
    }
  };
}

export function createCavalryFlankRiskArcKit() {
  return {
    id: "cavalry-flank-risk-arc-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return cells
        .filter((cell) => ownerOf(cell) === "player")
        .map((cell, index) => {
          const hostileNeighbors = neighborsOf(cell)
            .map((id) => byId.get(String(id)))
            .filter(Boolean)
            .filter(hostileToRome);
          const enemyPower = hostileNeighbors.reduce((sum, hostile) => sum + troopPower(troopsOf(hostile)), 0);
          const romanPower = troopPower(troopsOf(cell));
          const risk = clamp(enemyPower / Math.max(1, romanPower + enemyPower));
          return makeDescriptor(`flank:${cell.id}`, "flank-risk-arc", {
            cellId: String(cell.id),
            center: centerOf(cell),
            hostileNeighborIds: hostileNeighbors.map((hostile) => String(hostile.id)),
            risk: round(risk),
            arcRadius: round(0.72 + hostileNeighbors.length * 0.22 + risk * 0.55),
            stance: risk > 0.62 ? "exposed" : risk > 0.28 ? "watch" : "secure",
            priority: index
          });
        })
        .filter((descriptor) => descriptor.hostileNeighborIds.length > 0 || descriptor.risk > 0);
    }
  };
}

export function createCavalryReinforcementCalloutKit() {
  return {
    id: "cavalry-reinforcement-callout-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return cells
        .filter((cell) => ownerOf(cell) === "player")
        .map((cell, index) => {
          const neighbors = neighborsOf(cell).map((id) => byId.get(String(id))).filter(Boolean);
          const hostileNeighbors = neighbors.filter(hostileToRome);
          const frontierNeighbors = neighbors.filter((target) => ownerOf(target) === "neutral");
          const troops = troopsOf(cell);
          const count = troopCount(troops);
          const requested = {
            l: hostileNeighbors.length > 1 ? 2 : frontierNeighbors.length > 1 ? 1 : 0,
            m: count < 5 ? 1 : 0,
            h: hostileNeighbors.some((target) => troopPower(troopsOf(target)) > troopPower(troops)) ? 1 : 0
          };
          return makeDescriptor(`reinforce:${cell.id}`, "reinforcement-callout", {
            cellId: String(cell.id),
            center: centerOf(cell),
            troopCount: count,
            hostilePressure: round(hostileNeighbors.reduce((sum, target) => sum + troopPower(troopsOf(target)), 0)),
            frontierOpenings: frontierNeighbors.length,
            requested,
            urgency: round(clamp(hostileNeighbors.length * 0.24 + (count < 5 ? 0.32 : 0) + requested.h * 0.26)),
            label: hostileNeighbors.length ? "Hold flank" : frontierNeighbors.length ? "Seed frontier" : "Reserve",
            priority: index
          });
        })
        .filter((descriptor) => descriptor.urgency > 0.05 || descriptor.frontierOpenings > 0)
        .slice(0, 8);
    }
  };
}

export function createCavalryAttritionForecastChipKit() {
  return {
    id: "cavalry-attrition-forecast-chip-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const selectedFrom = byId.get(String(campaign.from || ""));
      const selectedTo = byId.get(String(campaign.to || ""));
      const pairs = selectedFrom && selectedTo
        ? [[selectedFrom, selectedTo]]
        : cells
          .filter((cell) => ownerOf(cell) === "player")
          .flatMap((cell) => neighborsOf(cell).map((id) => [cell, byId.get(String(id))]).filter((pair) => pair[1] && ownerOf(pair[1]) !== "player"))
          .slice(0, 6);
      return pairs.map(([from, target], index) => {
        const draft = campaign.draft && selectedFrom && String(from.id) === String(selectedFrom.id) ? campaign.draft : troopsOf(from);
        const attack = troopPower(draft);
        const defense = troopPower(troopsOf(target));
        const lossRisk = clamp(defense / Math.max(1, attack + defense));
        const midpoint = {
          x: round((Number(from.x || 0) + Number(target.x || 0)) * 0.5),
          y: round((Number(from.y || 0) + Number(target.y || 0)) * 0.5)
        };
        return makeDescriptor(`attrition:${from.id}:${target.id}`, "attrition-forecast-chip", {
          sourceId: String(from.id),
          targetId: String(target.id),
          source: centerOf(from),
          target: centerOf(target),
          midpoint,
          attackPower: round(attack),
          defensePower: round(defense),
          lossRisk: round(lossRisk),
          forecast: attack > defense * 1.25 ? "clean-breakthrough" : attack >= defense ? "costly-advance" : "probable-loss",
          priority: index
        });
      });
    }
  };
}

export function createCavalryTurnTempoStandardKit() {
  return {
    id: "cavalry-turn-tempo-standard-kit",
    describe(campaign = {}) {
      const actions = Number(campaign.actions ?? 0);
      const turn = Number(campaign.turn || 1);
      const maxActions = Number(campaign.preset?.actions || Math.max(3, actions));
      return [
        makeDescriptor("tempo:actions", "turn-tempo-standard", {
          slot: "actions",
          turn,
          actionsRemaining: actions,
          maxActions,
          tempo: actions <= 0 ? "spent" : actions <= 1 ? "last-order" : "initiative",
          fill: round(clamp(actions / Math.max(1, maxActions))),
          screenAnchor: { x: 0.82, y: 0.12 },
          label: actions <= 0 ? "End Turn" : `${actions} Orders`,
          priority: 0
        }),
        makeDescriptor("tempo:campaign-clock", "turn-tempo-standard", {
          slot: "campaign-clock",
          turn,
          actionsRemaining: actions,
          maxActions,
          tempo: turn % 4 === 0 ? "winter-pressure" : "march-season",
          fill: round((turn % 6) / 6),
          screenAnchor: { x: 0.82, y: 0.17 },
          label: `Turn ${turn}`,
          priority: 1
        })
      ];
    }
  };
}

export function createCavalryObjectivePressureBannerKit() {
  return {
    id: "cavalry-objective-pressure-banner-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const total = Math.max(1, cells.length);
      const playerCells = cells.filter((cell) => ownerOf(cell) === "player").length;
      const neutralCells = cells.filter((cell) => ownerOf(cell) === "neutral").length;
      const enemyCells = total - playerCells - neutralCells;
      const playerPower = cells.filter((cell) => ownerOf(cell) === "player").reduce((sum, cell) => sum + troopPower(troopsOf(cell)), 0);
      const enemyPower = cells.filter(hostileToRome).reduce((sum, cell) => sum + troopPower(troopsOf(cell)), 0);
      const territoryRatio = clamp(playerCells / total);
      const powerRatio = clamp(playerPower / Math.max(1, playerPower + enemyPower));
      const pressure = clamp((1 - territoryRatio) * 0.46 + (1 - powerRatio) * 0.54);
      return [
        makeDescriptor("objective:rome-frontier-pressure", "objective-pressure-banner", {
          playerCells,
          neutralCells,
          enemyCells,
          totalCells: total,
          playerPower: round(playerPower),
          enemyPower: round(enemyPower),
          territoryRatio: round(territoryRatio),
          powerRatio: round(powerRatio),
          pressure: round(pressure),
          objective: territoryRatio < 0.28 ? "secure-frontier" : pressure > 0.58 ? "break-rival-pressure" : "extend-road-network",
          screenAnchor: { x: 0.5, y: 0.065 },
          priority: 0
        })
      ];
    }
  };
}

export function createCavalryBattlefieldOrdersRendererHandoffKit() {
  return {
    id: "cavalry-battlefield-orders-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = Object.freeze({
        scoutingVectors: buckets.scoutingVectors || [],
        flankRiskArcs: buckets.flankRiskArcs || [],
        reinforcementCallouts: buckets.reinforcementCallouts || [],
        attritionForecastChips: buckets.attritionForecastChips || [],
        turnTempoStandards: buckets.turnTempoStandards || [],
        objectivePressureBanners: buckets.objectivePressureBanners || []
      });
      return {
        id: "cavalry-battlefield-orders-renderer-handoff",
        kind: "renderer-handoff",
        contract: OWNERSHIP_BOUNDARY,
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createCavalryBattlefieldOrdersDomainKit() {
  const scoutingVectorKit = createCavalryScoutingVectorKit();
  const flankRiskArcKit = createCavalryFlankRiskArcKit();
  const reinforcementCalloutKit = createCavalryReinforcementCalloutKit();
  const attritionForecastChipKit = createCavalryAttritionForecastChipKit();
  const turnTempoStandardKit = createCavalryTurnTempoStandardKit();
  const objectivePressureBannerKit = createCavalryObjectivePressureBannerKit();
  const rendererHandoffKit = createCavalryBattlefieldOrdersRendererHandoffKit();
  return {
    id: "cavalry-battlefield-orders-domain-kit",
    tree: CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE,
    kits: [
      scoutingVectorKit.id,
      flankRiskArcKit.id,
      reinforcementCalloutKit.id,
      attritionForecastChipKit.id,
      turnTempoStandardKit.id,
      objectivePressureBannerKit.id,
      rendererHandoffKit.id
    ],
    describe(campaign = {}) {
      const scoutingVectors = scoutingVectorKit.describe(campaign);
      const flankRiskArcs = flankRiskArcKit.describe(campaign);
      const reinforcementCallouts = reinforcementCalloutKit.describe(campaign);
      const attritionForecastChips = attritionForecastChipKit.describe(campaign);
      const turnTempoStandards = turnTempoStandardKit.describe(campaign);
      const objectivePressureBanners = objectivePressureBannerKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({
        scoutingVectors,
        flankRiskArcs,
        reinforcementCallouts,
        attritionForecastChips,
        turnTempoStandards,
        objectivePressureBanners
      });
      return {
        id: "cavalry-battlefield-orders-domain",
        kind: "battlefield-orders-domain",
        tree: CAVALRY_BATTLEFIELD_ORDERS_DOMAIN_TREE,
        source: { route: "the-cavalry-of-rome", turn: Number(campaign.turn || 0), size: String(campaign.sizeId || campaign.preset?.label || "unknown") },
        scoutingVectors,
        flankRiskArcs,
        reinforcementCallouts,
        attritionForecastChips,
        turnTempoStandards,
        objectivePressureBanners,
        rendererHandoff
      };
    }
  };
}
