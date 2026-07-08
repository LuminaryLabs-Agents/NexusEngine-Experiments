const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-campaign-fractal-descriptor-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

export const CAVALRY_CAMPAIGN_FRACTAL_DOMAIN_TREE = `
cavalry-campaign-fractal-domain
├─ campaign-readability
│  ├─ march-corridor-domain
│  │  └─ cavalry-march-corridor-kit
│  └─ supply-line-domain
│     └─ cavalry-supply-line-kit
├─ battlefield-readability
│  ├─ formation-pressure-domain
│  │  ├─ cavalry-unit-cohesion-field-kit
│  │  └─ cavalry-morale-weather-front-kit
│  └─ command-options-domain
│     └─ cavalry-maneuver-choice-band-kit
└─ renderer-handoff
   └─ cavalry-fractal-renderer-handoff-kit
      └─ renderer consumes descriptors only
`.trim();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, precision = 3) => Number(clamp(Number(value), -1000000, 1000000).toFixed(precision));
const troopCount = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) + Number(troops.h || 0);
const troopPower = (troops = {}) => Number(troops.l || 0) + Number(troops.m || 0) * 2 + Number(troops.h || 0) * 3;
const troopsOf = (cell = {}) => cell.troops || cell.t || { l: 0, m: 0, h: 0 };
const neighborsOf = (cell = {}) => cell.neighbors || cell.n || [];
const ownerOf = (cell = {}) => cell.owner || "neutral";
const centerOf = (cell = {}) => ({ x: round(cell.x || 0), y: round(cell.y || 0), id: String(cell.id || "unknown") });
const stableCells = (campaign = {}) => Array.isArray(campaign.cells) ? campaign.cells : [];

function makeCellMap(cells) {
  return new Map(cells.map((cell) => [String(cell.id), cell]));
}

function makeDescriptor(id, kind, payload) {
  return { id, kind, ...payload };
}

export function createCavalrySupplyLineKit() {
  return {
    id: "cavalry-supply-line-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const player = cells.filter((cell) => ownerOf(cell) === "player");
      return player.flatMap((cell, sourceIndex) => {
        const supplyStrength = troopPower(troopsOf(cell));
        return neighborsOf(cell)
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .filter((target) => ownerOf(target) !== "player")
          .slice(0, 3)
          .map((target, linkIndex) => makeDescriptor(
            `supply:${cell.id}:${target.id}`,
            "supply-line",
            {
              sourceId: String(cell.id),
              targetId: String(target.id),
              source: centerOf(cell),
              target: centerOf(target),
              pressure: round(clamp(troopPower(troopsOf(target)) / Math.max(1, supplyStrength + troopPower(troopsOf(target))), 0, 1)),
              priority: sourceIndex * 10 + linkIndex,
              allegiance: "rome",
              visual: { tone: ownerOf(target) === "neutral" ? "frontier-gold" : "enemy-red", pulse: round((campaign.turn || 1) * 0.137 + linkIndex, 3) }
            }
          ));
      });
    }
  };
}

export function createCavalryMarchCorridorKit() {
  return {
    id: "cavalry-march-corridor-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const from = byId.get(String(campaign.from || ""));
      const selectedTo = byId.get(String(campaign.to || ""));
      if (!from) return [];
      const candidates = selectedTo ? [selectedTo] : neighborsOf(from).map((id) => byId.get(String(id))).filter(Boolean);
      return candidates.slice(0, 8).map((target, index) => {
        const draft = campaign.draft || troopsOf(from);
        const targetOwner = ownerOf(target);
        const attack = troopPower(draft);
        const defense = troopPower(troopsOf(target));
        return makeDescriptor(`march:${from.id}:${target.id}`, "march-corridor", {
          sourceId: String(from.id),
          targetId: String(target.id),
          source: centerOf(from),
          target: centerOf(target),
          selected: String(target.id) === String(campaign.to || ""),
          legal: targetOwner === "player" || neighborsOf(from).map(String).includes(String(target.id)),
          attackPower: round(attack),
          defensePower: round(defense),
          outcomeHint: !targetOwner || targetOwner === "player" ? "reinforce-or-occupy" : attack > defense ? "probable-capture" : "high-risk-clash",
          width: round(0.35 + clamp(attack / 12, 0, 1) * 0.9),
          priority: index
        });
      });
    }
  };
}

export function createCavalryUnitCohesionFieldKit() {
  return {
    id: "cavalry-unit-cohesion-field-kit",
    describe(campaign = {}) {
      return stableCells(campaign)
        .filter((cell) => ownerOf(cell) !== "neutral" || troopCount(troopsOf(cell)) > 0)
        .map((cell, index) => {
          const troops = troopsOf(cell);
          const count = troopCount(troops);
          const heavyRatio = count > 0 ? Number(troops.h || 0) / count : 0;
          return makeDescriptor(`cohesion:${cell.id}`, "unit-cohesion-field", {
            cellId: String(cell.id),
            owner: ownerOf(cell),
            center: centerOf(cell),
            troopCount: count,
            troopPower: troopPower(troops),
            heavyRatio: round(heavyRatio),
            radius: round(0.65 + clamp(count / 10, 0, 1) * 1.2),
            fill: ownerOf(cell) === "player" ? "rome-red" : ownerOf(cell) === "neutral" ? "unclaimed-smoke" : "rival-shadow",
            priority: index
          });
        });
    }
  };
}

export function createCavalryMoraleWeatherFrontKit() {
  return {
    id: "cavalry-morale-weather-front-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const ownerStats = new Map();
      for (const cell of cells) {
        const owner = ownerOf(cell);
        if (owner === "neutral") continue;
        const stat = ownerStats.get(owner) || { owner, cells: 0, power: 0, contested: 0, x: 0, y: 0 };
        stat.cells += 1;
        stat.power += troopPower(troopsOf(cell));
        stat.x += Number(cell.x || 0);
        stat.y += Number(cell.y || 0);
        stat.contested += neighborsOf(cell).some((id) => ownerOf(byId.get(String(id)) || {}) !== owner) ? 1 : 0;
        ownerStats.set(owner, stat);
      }
      return [...ownerStats.values()].map((stat) => makeDescriptor(`morale:${stat.owner}`, "morale-weather-front", {
        owner: stat.owner,
        center: { x: round(stat.x / Math.max(1, stat.cells)), y: round(stat.y / Math.max(1, stat.cells)) },
        territoryCount: stat.cells,
        power: stat.power,
        contestedEdges: stat.contested,
        morale: round(clamp((stat.power + stat.cells * 2 - stat.contested) / Math.max(1, stat.cells * 8), 0, 1)),
        weather: stat.owner === "player" ? "standard-bearing-embers" : "rival-dust-front",
        radius: round(1.2 + Math.sqrt(stat.cells) * 0.6)
      }));
    }
  };
}

export function createCavalryManeuverChoiceBandKit() {
  return {
    id: "cavalry-maneuver-choice-band-kit",
    describe(campaign = {}) {
      const actions = Number(campaign.actions ?? 0);
      const hasFrom = Boolean(campaign.from);
      const hasTo = Boolean(campaign.to);
      const choices = [
        { id: "move", label: hasTo ? "Commit March" : hasFrom ? "Choose Adjacent Target" : "Select Roman Territory", enabled: actions > 0 && hasFrom, urgency: hasTo ? 0.92 : hasFrom ? 0.68 : 0.28 },
        { id: "end-turn", label: "End World Turn", enabled: !campaign.over, urgency: actions <= 0 ? 0.95 : 0.42 },
        { id: "reset-input", label: "Clear Orders", enabled: hasFrom || hasTo, urgency: hasTo ? 0.48 : 0.22 },
        { id: "restart", label: "Restart Campaign", enabled: true, urgency: 0.08 }
      ];
      return choices.map((choice, index) => makeDescriptor(`choice:${choice.id}`, "maneuver-choice-band", {
        ...choice,
        index,
        turn: Number(campaign.turn || 1),
        actionsRemaining: actions,
        state: choice.enabled ? "available" : "locked",
        tone: choice.id === "move" ? "rome-command" : choice.id === "end-turn" ? "turn-cadence" : "utility"
      }));
    }
  };
}

export function createCavalryFractalRendererHandoffKit() {
  return {
    id: "cavalry-fractal-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = Object.freeze({
        supplyLines: buckets.supplyLines || [],
        marchCorridors: buckets.marchCorridors || [],
        cohesionFields: buckets.cohesionFields || [],
        moraleFronts: buckets.moraleFronts || [],
        maneuverChoices: buckets.maneuverChoices || []
      });
      return {
        id: "cavalry-fractal-renderer-handoff",
        kind: "renderer-handoff",
        contract: OWNERSHIP_BOUNDARY,
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createCavalryCampaignFractalDomainKit() {
  const supplyLineKit = createCavalrySupplyLineKit();
  const marchCorridorKit = createCavalryMarchCorridorKit();
  const cohesionFieldKit = createCavalryUnitCohesionFieldKit();
  const moraleWeatherFrontKit = createCavalryMoraleWeatherFrontKit();
  const maneuverChoiceBandKit = createCavalryManeuverChoiceBandKit();
  const rendererHandoffKit = createCavalryFractalRendererHandoffKit();
  return {
    id: "cavalry-campaign-fractal-domain-kit",
    tree: CAVALRY_CAMPAIGN_FRACTAL_DOMAIN_TREE,
    kits: [supplyLineKit.id, marchCorridorKit.id, cohesionFieldKit.id, moraleWeatherFrontKit.id, maneuverChoiceBandKit.id, rendererHandoffKit.id],
    describe(campaign = {}) {
      const supplyLines = supplyLineKit.describe(campaign);
      const marchCorridors = marchCorridorKit.describe(campaign);
      const cohesionFields = cohesionFieldKit.describe(campaign);
      const moraleFronts = moraleWeatherFrontKit.describe(campaign);
      const maneuverChoices = maneuverChoiceBandKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({ supplyLines, marchCorridors, cohesionFields, moraleFronts, maneuverChoices });
      return {
        id: "cavalry-campaign-fractal-domain",
        kind: "campaign-fractal-domain",
        tree: CAVALRY_CAMPAIGN_FRACTAL_DOMAIN_TREE,
        source: { route: "the-cavalry-of-rome", turn: Number(campaign.turn || 0), size: String(campaign.sizeId || campaign.preset?.label || "unknown") },
        supplyLines,
        marchCorridors,
        cohesionFields,
        moraleFronts,
        maneuverChoices,
        rendererHandoff
      };
    }
  };
}
