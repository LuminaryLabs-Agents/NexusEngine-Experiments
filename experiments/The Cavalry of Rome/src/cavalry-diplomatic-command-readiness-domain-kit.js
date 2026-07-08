const OWNERSHIP_BOUNDARY = Object.freeze({
  kitRole: "renderer-neutral-cavalry-diplomatic-command-readiness-domain",
  rendererRole: "renderer-consumes-descriptors-only",
  forbiddenOwnership: ["renderer", "dom", "browser-input", "three", "webgl", "audio", "asset-loading", "frame-loop"]
});

export const CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE = `
cavalry-diplomatic-command-readiness-domain
├─ senate-pressure-domain
│  ├─ decree-mandate-domain
│  │  └─ cavalry-senate-decree-mandate-kit
│  └─ tribute-obligation-domain
│     └─ cavalry-tribute-obligation-ledger-kit
├─ ally-frontier-domain
│  ├─ ally-loyalty-domain
│  │  └─ cavalry-ally-loyalty-banner-kit
│  └─ rebellion-spark-domain
│     └─ cavalry-rebellion-spark-kit
├─ campaign-legitimacy-domain
│  ├─ province-pacification-domain
│  │  └─ cavalry-province-pacification-band-kit
│  └─ triumph-window-domain
│     └─ cavalry-triumph-window-standard-kit
└─ renderer-handoff
   └─ cavalry-diplomatic-command-renderer-handoff-kit
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

function neutralCells(cells) {
  return cells.filter((cell) => ownerOf(cell) === "neutral");
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

export function createCavalrySenateDecreeMandateKit() {
  return {
    id: "cavalry-senate-decree-mandate-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const romans = playerCells(cells);
      const hostiles = hostileCells(cells);
      const frontierCells = romans.filter((cell) => hostileNeighbors(cell, byId).length > 0);
      const actions = Number(campaign.actions ?? 0);
      const maxActions = Number(campaign.preset?.actions || Math.max(3, actions));
      const turn = Number(campaign.turn || 1);
      const mandatePressure = clamp(0.18 + hostiles.length / Math.max(1, cells.length) * 0.42 + frontierCells.length * 0.08 + (maxActions - actions) * 0.06);
      const expansionMandate = clamp(0.22 + frontierCells.length * 0.13 + actions / Math.max(1, maxActions) * 0.2);
      return [
        makeDescriptor("senate:mandate", "senate-decree-mandate", {
          slot: "senate-mandate",
          turn,
          pressure: round(mandatePressure),
          fill: round(1 - mandatePressure),
          label: mandatePressure > 0.68 ? "Senate demands results" : mandatePressure > 0.42 ? "Mandate tightening" : "Mandate stable",
          frontierCount: frontierCells.length,
          hostileCount: hostiles.length,
          screenAnchor: { x: 0.82, y: 0.13 },
          priority: 0
        }),
        makeDescriptor("senate:expansion", "senate-decree-mandate", {
          slot: "expansion-mandate",
          turn,
          pressure: round(expansionMandate),
          fill: round(expansionMandate),
          label: expansionMandate > 0.62 ? "Expansion authorized" : "Secure frontier first",
          frontierCount: frontierCells.length,
          availableOrders: actions,
          screenAnchor: { x: 0.82, y: 0.18 },
          priority: 1
        })
      ];
    }
  };
}

export function createCavalryTributeObligationLedgerKit() {
  return {
    id: "cavalry-tribute-obligation-ledger-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      return playerCells(cells)
        .map((cell, index) => {
          const h = hostileNeighbors(cell, byId).length;
          const friendly = playerNeighbors(cell, byId).length;
          const count = troopCount(troopsOf(cell));
          const obligation = clamp(0.2 + count * 0.045 + friendly * 0.05 - h * 0.07 + (Number(cell.y || 0) % 89) / 420);
          return makeDescriptor(`tribute:${cell.id}`, "tribute-obligation-ledger", {
            cellId: String(cell.id),
            center: centerOf(cell),
            troopCount: round(count),
            friendlyNeighbors: friendly,
            hostileNeighbors: h,
            obligation: round(obligation),
            fill: round(obligation),
            label: obligation > 0.68 ? "Tribute heavy" : h > 0 ? "Tribute disrupted" : "Tribute viable",
            screenAnchor: { x: 0.78 + (index % 3) * 0.06, y: 0.83 + Math.floor(index / 3) * 0.04 },
            priority: index
          });
        })
        .sort((a, b) => b.obligation - a.obligation)
        .slice(0, 6);
    }
  };
}

export function createCavalryAllyLoyaltyBannerKit() {
  return {
    id: "cavalry-ally-loyalty-banner-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const romans = playerCells(cells);
      const candidates = neutralCells(cells).filter((cell) => playerNeighbors(cell, byId).length > 0 || hostileNeighbors(cell, byId).length > 0);
      const fallback = candidates.length ? candidates : neutralCells(cells).slice(0, 4);
      return fallback
        .map((cell, index) => {
          const romanNeighbors = playerNeighbors(cell, byId);
          const hostile = hostileNeighbors(cell, byId);
          const source = romanNeighbors[0] || nearestPlayer(cell, romans) || cell;
          const loyalty = clamp(0.34 + romanNeighbors.length * 0.18 - hostile.length * 0.1 + Number(campaign.actions || 0) * 0.035 + (Number(cell.x || 0) % 71) / 360);
          return makeDescriptor(`ally:${cell.id}`, "ally-loyalty-banner", {
            sourceId: String(source.id || cell.id),
            targetId: String(cell.id),
            source: centerOf(source),
            target: centerOf(cell),
            loyalty: round(loyalty),
            label: loyalty > 0.66 ? "Ally likely" : hostile.length ? "Ally wavering" : "Envoy needed",
            relation: hostile.length ? "contested-neutral" : "neutral-envoy",
            priority: index
          });
        })
        .sort((a, b) => b.loyalty - a.loyalty)
        .slice(0, 6);
    }
  };
}

export function createCavalryRebellionSparkKit() {
  return {
    id: "cavalry-rebellion-spark-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const atRisk = playerCells(cells).filter((cell) => hostileNeighbors(cell, byId).length > 0 || troopCount(troopsOf(cell)) <= 5);
      const fallback = atRisk.length ? atRisk : playerCells(cells).slice(0, 3);
      const turn = Number(campaign.turn || 1);
      return fallback.map((cell, index) => {
        const h = hostileNeighbors(cell, byId).length;
        const count = troopCount(troopsOf(cell));
        const unrest = clamp(0.16 + h * 0.17 + Math.max(0, 6 - count) * 0.06 + ((turn + index) % 5) * 0.045);
        return makeDescriptor(`rebellion:${cell.id}`, "rebellion-spark", {
          cellId: String(cell.id),
          center: centerOf(cell),
          unrest: round(unrest),
          hostileNeighbors: h,
          troopCount: round(count),
          label: unrest > 0.66 ? "Rebellion spark" : unrest > 0.42 ? "Watch loyalty" : "Quiet province",
          priority: index
        });
      }).sort((a, b) => b.unrest - a.unrest).slice(0, 5);
    }
  };
}

export function createCavalryProvincePacificationBandKit() {
  return {
    id: "cavalry-province-pacification-band-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const byId = makeCellMap(cells);
      const romans = playerCells(cells);
      const hostileFront = hostileCells(cells).filter((cell) => playerNeighbors(cell, byId).length > 0);
      const targets = hostileFront.length ? hostileFront : hostileCells(cells).slice(0, 6);
      return targets.map((cell, index) => {
        const source = playerNeighbors(cell, byId)[0] || nearestPlayer(cell, romans) || cell;
        const attack = troopPower(troopsOf(source));
        const defense = troopPower(troopsOf(cell));
        const pacification = clamp(attack / Math.max(1, attack + defense));
        return makeDescriptor(`pacify:${source.id || "rome"}:${cell.id}`, "province-pacification-band", {
          sourceId: String(source.id || ""),
          targetId: String(cell.id),
          source: centerOf(source),
          target: centerOf(cell),
          pacification: round(pacification),
          attackPower: round(attack),
          defensePower: round(defense),
          label: pacification > 0.62 ? "Pacify province" : "Delay pacification",
          priority: index
        });
      }).sort((a, b) => b.pacification - a.pacification).slice(0, 6);
    }
  };
}

export function createCavalryTriumphWindowStandardKit() {
  return {
    id: "cavalry-triumph-window-standard-kit",
    describe(campaign = {}) {
      const cells = stableCells(campaign);
      const romans = playerCells(cells);
      const hostiles = hostileCells(cells);
      const turn = Number(campaign.turn || 1);
      const actions = Number(campaign.actions ?? 0);
      const conquestShare = clamp(romans.length / Math.max(1, cells.length));
      const triumph = clamp(0.18 + conquestShare * 0.55 + actions * 0.035 - hostiles.length * 0.025);
      const deadline = clamp(((turn - 1) % 6) / 5);
      return [
        makeDescriptor("triumph:window", "triumph-window-standard", {
          slot: "triumph-window",
          turn,
          fill: round(triumph),
          pressure: round(1 - triumph),
          label: triumph > 0.68 ? "Triumph possible" : "Earn triumph",
          conqueredShare: round(conquestShare),
          screenAnchor: { x: 0.5, y: 0.08 },
          priority: 0
        }),
        makeDescriptor("triumph:deadline", "triumph-window-standard", {
          slot: "deadline",
          turn,
          fill: round(1 - deadline),
          pressure: round(deadline),
          label: deadline > 0.66 ? "Triumph deadline near" : "Campaign time remains",
          screenAnchor: { x: 0.5, y: 0.13 },
          priority: 1
        })
      ];
    }
  };
}

export function createCavalryDiplomaticCommandRendererHandoffKit() {
  return {
    id: "cavalry-diplomatic-command-renderer-handoff-kit",
    describe(buckets = {}) {
      const descriptors = Object.freeze({
        senateDecreeMandates: buckets.senateDecreeMandates || [],
        tributeObligationLedgers: buckets.tributeObligationLedgers || [],
        allyLoyaltyBanners: buckets.allyLoyaltyBanners || [],
        rebellionSparks: buckets.rebellionSparks || [],
        provincePacificationBands: buckets.provincePacificationBands || [],
        triumphWindowStandards: buckets.triumphWindowStandards || []
      });
      return {
        id: "cavalry-diplomatic-command-renderer-handoff",
        kind: "renderer-handoff",
        contract: OWNERSHIP_BOUNDARY,
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]))
      };
    }
  };
}

export function createCavalryDiplomaticCommandReadinessDomainKit() {
  const senateDecreeMandateKit = createCavalrySenateDecreeMandateKit();
  const tributeObligationLedgerKit = createCavalryTributeObligationLedgerKit();
  const allyLoyaltyBannerKit = createCavalryAllyLoyaltyBannerKit();
  const rebellionSparkKit = createCavalryRebellionSparkKit();
  const provincePacificationBandKit = createCavalryProvincePacificationBandKit();
  const triumphWindowStandardKit = createCavalryTriumphWindowStandardKit();
  const rendererHandoffKit = createCavalryDiplomaticCommandRendererHandoffKit();
  return {
    id: "cavalry-diplomatic-command-readiness-domain-kit",
    tree: CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE,
    kits: [
      senateDecreeMandateKit.id,
      tributeObligationLedgerKit.id,
      allyLoyaltyBannerKit.id,
      rebellionSparkKit.id,
      provincePacificationBandKit.id,
      triumphWindowStandardKit.id,
      rendererHandoffKit.id
    ],
    describe(campaign = {}) {
      const senateDecreeMandates = senateDecreeMandateKit.describe(campaign);
      const tributeObligationLedgers = tributeObligationLedgerKit.describe(campaign);
      const allyLoyaltyBanners = allyLoyaltyBannerKit.describe(campaign);
      const rebellionSparks = rebellionSparkKit.describe(campaign);
      const provincePacificationBands = provincePacificationBandKit.describe(campaign);
      const triumphWindowStandards = triumphWindowStandardKit.describe(campaign);
      const rendererHandoff = rendererHandoffKit.describe({
        senateDecreeMandates,
        tributeObligationLedgers,
        allyLoyaltyBanners,
        rebellionSparks,
        provincePacificationBands,
        triumphWindowStandards
      });
      return {
        id: "cavalry-diplomatic-command-readiness-domain",
        kind: "diplomatic-command-readiness-domain",
        tree: CAVALRY_DIPLOMATIC_COMMAND_READINESS_DOMAIN_TREE,
        source: {
          route: "the-cavalry-of-rome",
          turn: Number(campaign.turn || 0),
          size: String(campaign.sizeId || campaign.preset?.label || "unknown")
        },
        senateDecreeMandates,
        tributeObligationLedgers,
        allyLoyaltyBanners,
        rebellionSparks,
        provincePacificationBands,
        triumphWindowStandards,
        rendererHandoff
      };
    }
  };
}
