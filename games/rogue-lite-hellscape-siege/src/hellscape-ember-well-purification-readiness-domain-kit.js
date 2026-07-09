export const HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE = Object.freeze({
  id: 'hellscape-ember-well-purification-readiness-domain',
  children: [
    {
      id: 'water-source-domain',
      children: [
        { id: 'ash-well-scan-domain', children: [{ id: 'hellscape-ash-well-scan-kit' }] },
        { id: 'brimstone-filter-domain', children: [{ id: 'hellscape-brimstone-filter-kit' }] }
      ]
    },
    {
      id: 'purification-chain-domain',
      children: [
        { id: 'coolant-rune-domain', children: [{ id: 'hellscape-coolant-rune-loop-kit' }] },
        { id: 'sanctified-cistern-domain', children: [{ id: 'hellscape-sanctified-cistern-kit' }] }
      ]
    },
    {
      id: 'survivor-relief-domain',
      children: [
        { id: 'water-bearer-route-domain', children: [{ id: 'hellscape-water-bearer-route-kit' }] },
        { id: 'dawn-purification-ledger-domain', children: [{ id: 'hellscape-dawn-purification-ledger-kit' }] }
      ]
    },
    { id: 'renderer-handoff', children: [{ id: 'hellscape-ember-well-renderer-handoff-kit', children: [{ id: 'renderer-consumes-descriptors-only' }] }] }
  ]
});

export const HELLSCAPE_EMBER_WELL_PURIFICATION_KITS = Object.freeze([
  'hellscape-ash-well-scan-kit',
  'hellscape-brimstone-filter-kit',
  'hellscape-coolant-rune-loop-kit',
  'hellscape-sanctified-cistern-kit',
  'hellscape-water-bearer-route-kit',
  'hellscape-dawn-purification-ledger-kit',
  'hellscape-ember-well-renderer-handoff-kit'
]);

const OWNERSHIP_BOUNDARY = Object.freeze({
  renderer: false,
  dom: false,
  browserInput: false,
  threeJs: false,
  webgl: false,
  audio: false,
  assetLoading: false,
  frameLoop: false,
  physics: false,
  storage: false
});

function stableNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, stableNumber(value, 0)));
}

function point(input, fallback = { x: 0, y: 0 }) {
  return {
    x: stableNumber(input?.x, fallback.x),
    y: stableNumber(input?.y, fallback.y)
  };
}

function resourceBag(input = {}) {
  return {
    water: stableNumber(input.water ?? input.cleanWater, 0),
    ash: stableNumber(input.ash ?? input.ashes, 0),
    brimstone: stableNumber(input.brimstone, 0),
    runes: stableNumber(input.runes ?? input.runeStone, 0),
    herbs: stableNumber(input.herbs ?? input.medicine, 0),
    crystal: stableNumber(input.crystal ?? input.crystals, 0)
  };
}

function radial(seed, radius, index, count) {
  const angle = (Math.PI * 2 * index) / Math.max(1, count) + seed * 0.31;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

function arrayCount(value, fallback = 0) {
  return Array.isArray(value) ? value.length : Math.max(0, Math.round(stableNumber(value, fallback)));
}

export function createHellscapeAshWellScanKit() {
  return {
    id: 'hellscape-ash-well-scan-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position, { x: 0, y: 0 });
      const wave = stableNumber(input.wave?.index ?? input.wave ?? input.waves?.current, 1);
      const ambientCorruption = clamp01(input.corruption ?? input.portalPressure ?? input.demonPressure ?? wave / 9);
      const sourceWells = Array.isArray(input.wells) && input.wells.length > 0
        ? input.wells
        : Array.from({ length: 3 }, (_, index) => ({ position: radial(wave, 92 + index * 27, index, 3), depth: 0.35 + index * 0.18 }));
      return sourceWells.slice(0, 5).map((well, index) => {
        const offset = point(well.position ?? well, radial(wave, 88 + index * 22, index, 3));
        const corruption = clamp01(well.corruption ?? ambientCorruption + index * 0.07 - stableNumber(input.cleanWater, 0) * 0.015);
        return {
          id: `ash-well-${index + 1}`,
          kit: 'hellscape-ash-well-scan-kit',
          position: { x: core.x + offset.x, y: core.y + offset.y },
          radius: 14 + index * 3,
          corruption,
          urgency: Math.round((0.45 + corruption * 0.55) * 100),
          label: corruption > 0.68 ? 'boiling ash well' : corruption > 0.34 ? 'tainted ember well' : 'recoverable ember well'
        };
      });
    }
  };
}

export function createHellscapeBrimstoneFilterKit() {
  return {
    id: 'hellscape-brimstone-filter-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const scans = Array.isArray(input.ashWellScans) ? input.ashWellScans : [];
      const resources = resourceBag(input.inventory ?? input.resources ?? input);
      const filterBudget = Math.max(1, Math.round(resources.brimstone + resources.ash / 2 + resources.crystal));
      return scans.map((scan, index) => {
        const capacity = clamp01((filterBudget - index * 0.55) / Math.max(1, scans.length + 1));
        return {
          id: `brimstone-filter-${index + 1}`,
          kit: 'hellscape-brimstone-filter-kit',
          wellId: scan.id,
          position: { x: scan.position.x + 10 + index * 2, y: scan.position.y - 12 },
          capacity,
          clogRisk: clamp01(scan.corruption * (1 - capacity * 0.52)),
          materialNeed: Math.max(0, Math.ceil(scan.corruption * 4 - resources.brimstone)),
          label: capacity > 0.55 ? 'filter staged' : 'filter starved'
        };
      });
    }
  };
}

export function createHellscapeCoolantRuneLoopKit() {
  return {
    id: 'hellscape-coolant-rune-loop-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const scans = Array.isArray(input.ashWellScans) ? input.ashWellScans : [];
      const filters = Array.isArray(input.brimstoneFilters) ? input.brimstoneFilters : [];
      const resources = resourceBag(input.inventory ?? input.resources ?? input);
      const heat = clamp01(input.heat ?? input.realmHeat ?? input.wave?.pressure ?? 0.4);
      return scans.map((scan, index) => {
        const filter = filters[index] ?? {};
        const runeCharge = clamp01((resources.runes * 0.22 + resources.herbs * 0.08 + filter.capacity * 0.45) - heat * 0.16);
        return {
          id: `coolant-rune-loop-${index + 1}`,
          kit: 'hellscape-coolant-rune-loop-kit',
          wellId: scan.id,
          path: [
            { x: scan.position.x - 18, y: scan.position.y - 8 },
            { x: scan.position.x, y: scan.position.y - 24 - index * 2 },
            { x: scan.position.x + 18, y: scan.position.y - 8 }
          ],
          runeCharge,
          heatRelief: clamp01(runeCharge * 0.72 + filter.capacity * 0.24),
          label: runeCharge > 0.52 ? 'coolant loop humming' : 'coolant loop flickering'
        };
      });
    }
  };
}

export function createHellscapeSanctifiedCisternKit() {
  return {
    id: 'hellscape-sanctified-cistern-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const scans = Array.isArray(input.ashWellScans) ? input.ashWellScans : [];
      const loops = Array.isArray(input.coolantRuneLoops) ? input.coolantRuneLoops : [];
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position, { x: 0, y: 0 });
      const survivors = arrayCount(input.survivors ?? input.refugees ?? input.civilians, 4);
      return scans.map((scan, index) => {
        const loop = loops[index] ?? {};
        const purity = clamp01((1 - scan.corruption) * 0.42 + stableNumber(loop.heatRelief, 0) * 0.48 + survivors * 0.012);
        return {
          id: `sanctified-cistern-${index + 1}`,
          kit: 'hellscape-sanctified-cistern-kit',
          wellId: scan.id,
          position: { x: core.x + 34 + index * 22, y: core.y + 40 + index * 10 },
          purity,
          servings: Math.max(1, Math.round(6 + purity * 18 - scan.corruption * 5)),
          label: purity > 0.62 ? 'safe cistern reserve' : 'needs blessing pass'
        };
      });
    }
  };
}

export function createHellscapeWaterBearerRouteKit() {
  return {
    id: 'hellscape-water-bearer-route-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const cisterns = Array.isArray(input.sanctifiedCisterns) ? input.sanctifiedCisterns : [];
      const avatar = point(input.avatar?.position ?? input.avatar ?? input.player?.position, { x: 0, y: 0 });
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position, { x: 0, y: 0 });
      const enemies = arrayCount(input.enemies ?? input.demons ?? input.hostiles, 5);
      return cisterns.map((cistern, index) => {
        const risk = clamp01(enemies / 18 + index * 0.08 - cistern.purity * 0.28);
        return {
          id: `water-bearer-route-${index + 1}`,
          kit: 'hellscape-water-bearer-route-kit',
          cisternId: cistern.id,
          path: [avatar, { x: (avatar.x + cistern.position.x) / 2, y: (avatar.y + cistern.position.y) / 2 - 16 }, cistern.position, core],
          risk,
          escortNeed: Math.max(0, Math.ceil(risk * 4 - cistern.purity)),
          label: risk > 0.58 ? 'escort route contested' : 'water bearer route viable'
        };
      });
    }
  };
}

export function createHellscapeDawnPurificationLedgerKit() {
  return {
    id: 'hellscape-dawn-purification-ledger-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const scans = Array.isArray(input.ashWellScans) ? input.ashWellScans : [];
      const filters = Array.isArray(input.brimstoneFilters) ? input.brimstoneFilters : [];
      const loops = Array.isArray(input.coolantRuneLoops) ? input.coolantRuneLoops : [];
      const cisterns = Array.isArray(input.sanctifiedCisterns) ? input.sanctifiedCisterns : [];
      const routes = Array.isArray(input.waterBearerRoutes) ? input.waterBearerRoutes : [];
      const averagePurity = cisterns.reduce((total, item) => total + stableNumber(item.purity, 0), 0) / Math.max(1, cisterns.length);
      const averageRisk = routes.reduce((total, item) => total + stableNumber(item.risk, 0), 0) / Math.max(1, routes.length);
      const readiness = clamp01(averagePurity * 0.72 + (1 - averageRisk) * 0.18 + Math.min(1, filters.length / 3) * 0.10);
      const phase = readiness > 0.78 ? 'dawn-water-secured' : readiness > 0.56 ? 'carry-clean-water' : readiness > 0.34 ? 'prime-purifiers' : 'scan-ember-wells';
      return [{
        id: 'dawn-purification-ledger-1',
        kit: 'hellscape-dawn-purification-ledger-kit',
        readiness,
        phase,
        wells: scans.length,
        filters: filters.length,
        runeLoops: loops.length,
        cisterns: cisterns.length,
        routes: routes.length,
        cleanServings: cisterns.reduce((total, item) => total + stableNumber(item.servings, 0), 0),
        nextAction: phase === 'scan-ember-wells'
          ? 'mark every ash well before the next wave'
          : phase === 'prime-purifiers'
            ? 'feed brimstone filters and coolant runes'
            : phase === 'carry-clean-water'
              ? 'escort water bearers through the safest lane'
              : 'hold the purified cistern until dawn'
      }];
    }
  };
}

export function createHellscapeEmberWellRendererHandoffKit() {
  return {
    id: 'hellscape-ember-well-renderer-handoff-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(parts = {}) {
      const descriptors = {
        ashWellScans: parts.ashWellScans ?? [],
        brimstoneFilters: parts.brimstoneFilters ?? [],
        coolantRuneLoops: parts.coolantRuneLoops ?? [],
        sanctifiedCisterns: parts.sanctifiedCisterns ?? [],
        waterBearerRoutes: parts.waterBearerRoutes ?? [],
        dawnPurificationLedgers: parts.dawnPurificationLedgers ?? []
      };
      const counts = {
        ashWellScans: descriptors.ashWellScans.length,
        brimstoneFilters: descriptors.brimstoneFilters.length,
        coolantRuneLoops: descriptors.coolantRuneLoops.length,
        sanctifiedCisterns: descriptors.sanctifiedCisterns.length,
        waterBearerRoutes: descriptors.waterBearerRoutes.length,
        dawnPurificationLedgers: descriptors.dawnPurificationLedgers.length
      };
      return {
        id: 'hellscape-ember-well-renderer-handoff',
        kit: 'hellscape-ember-well-renderer-handoff-kit',
        kind: 'renderer-handoff',
        policy: 'renderer-consumes-descriptors-only',
        ownership: OWNERSHIP_BOUNDARY,
        descriptors,
        counts: { ...counts, total: Object.values(counts).reduce((total, value) => total + value, 0) }
      };
    }
  };
}

export function createHellscapeEmberWellPurificationReadinessDomainKit() {
  const ashWellScanKit = createHellscapeAshWellScanKit();
  const brimstoneFilterKit = createHellscapeBrimstoneFilterKit();
  const coolantRuneLoopKit = createHellscapeCoolantRuneLoopKit();
  const sanctifiedCisternKit = createHellscapeSanctifiedCisternKit();
  const waterBearerRouteKit = createHellscapeWaterBearerRouteKit();
  const dawnPurificationLedgerKit = createHellscapeDawnPurificationLedgerKit();
  const rendererHandoffKit = createHellscapeEmberWellRendererHandoffKit();
  return {
    id: 'hellscape-ember-well-purification-readiness-domain-kit',
    tree: HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE,
    kits: HELLSCAPE_EMBER_WELL_PURIFICATION_KITS,
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const ashWellScans = ashWellScanKit.describe(input);
      const brimstoneFilters = brimstoneFilterKit.describe({ ...input, ashWellScans });
      const coolantRuneLoops = coolantRuneLoopKit.describe({ ...input, ashWellScans, brimstoneFilters });
      const sanctifiedCisterns = sanctifiedCisternKit.describe({ ...input, ashWellScans, coolantRuneLoops });
      const waterBearerRoutes = waterBearerRouteKit.describe({ ...input, sanctifiedCisterns });
      const dawnPurificationLedgers = dawnPurificationLedgerKit.describe({ ...input, ashWellScans, brimstoneFilters, coolantRuneLoops, sanctifiedCisterns, waterBearerRoutes });
      const ledger = dawnPurificationLedgers[0] ?? { readiness: 0, phase: 'scan-ember-wells' };
      const rendererHandoff = rendererHandoffKit.describe({ ashWellScans, brimstoneFilters, coolantRuneLoops, sanctifiedCisterns, waterBearerRoutes, dawnPurificationLedgers });
      const corruptionPressure = clamp01(ashWellScans.reduce((total, scan) => total + scan.corruption, 0) / Math.max(1, ashWellScans.length));
      return {
        id: 'hellscape-ember-well-purification-readiness',
        domain: 'hellscape-ember-well-purification-readiness-domain',
        readiness: clamp01(ledger.readiness),
        phase: ledger.phase,
        corruptionPressure,
        ashWellScans,
        brimstoneFilters,
        coolantRuneLoops,
        sanctifiedCisterns,
        waterBearerRoutes,
        dawnPurificationLedgers,
        rendererHandoff,
        tree: HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE,
        ownership: OWNERSHIP_BOUNDARY
      };
    }
  };
}
