export const HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE = Object.freeze({
  root: 'hellscape-harvester-covenant-readiness-domain',
  children: [
    { id: 'harvest-pact-domain', children: [
      { id: 'bloodroot-plot-domain', children: [{ id: 'hellscape-bloodroot-plot-kit' }] },
      { id: 'ash-sickle-path-domain', children: [{ id: 'hellscape-ash-sickle-path-kit' }] }
    ] },
    { id: 'soul-tithe-domain', children: [
      { id: 'ember-tithe-bowl-domain', children: [{ id: 'hellscape-ember-tithe-bowl-kit' }] },
      { id: 'demon-audit-seal-domain', children: [{ id: 'hellscape-demon-audit-seal-kit' }] }
    ] },
    { id: 'escape-bargain-domain', children: [
      { id: 'covenant-wagon-wheel-domain', children: [{ id: 'hellscape-covenant-wagon-wheel-kit' }] },
      { id: 'dawn-covenant-ledger-domain', children: [{ id: 'hellscape-dawn-covenant-ledger-kit' }] }
    ] },
    { id: 'renderer-handoff', children: [{ id: 'hellscape-harvester-covenant-renderer-handoff-kit', children: [{ id: 'renderer-consumes-descriptors-only' }] }] }
  ]
});

export const HELLSCAPE_HARVESTER_COVENANT_KITS = Object.freeze([
  'hellscape-bloodroot-plot-kit',
  'hellscape-ash-sickle-path-kit',
  'hellscape-ember-tithe-bowl-kit',
  'hellscape-demon-audit-seal-kit',
  'hellscape-covenant-wagon-wheel-kit',
  'hellscape-dawn-covenant-ledger-kit',
  'hellscape-harvester-covenant-renderer-handoff-kit'
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
  storage: false,
  network: false,
  excludes: Object.freeze(['renderer', 'DOM', 'browser input', 'Three.js', 'WebGL', 'audio', 'asset loading', 'physics', 'frame loop', 'storage', 'network'])
});

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const c = (value) => Math.max(0, Math.min(1, n(value, 0)));
const count = (value, fallback = 0) => Array.isArray(value) ? value.length : Math.max(0, Math.round(n(value, fallback)));
const point = (value, fallback = { x: 0, y: 0 }) => ({ x: n(value?.x ?? value?.left, fallback.x), y: n(value?.y ?? value?.top, fallback.y) });
const orbit = (seed, radius, index, total, center = { x: 0, y: 0 }) => {
  const angle = Math.PI * 2 * index / Math.max(1, total) + seed * 0.31;
  return { x: Math.round(center.x + Math.cos(angle) * radius), y: Math.round(center.y + Math.sin(angle) * radius) };
};
const resources = (value = {}) => ({
  ash: n(value.ash ?? value.ashes, 0),
  brimstone: n(value.brimstone, 0),
  bone: n(value.bone ?? value.bones, 0),
  bloodroot: n(value.bloodroot ?? value.root ?? value.roots, 0),
  crystal: n(value.crystal ?? value.crystals, 0),
  ember: n(value.ember ?? value.embers, 0),
  soul: n(value.soul ?? value.souls, 0),
  water: n(value.water ?? value.cleanWater, 0)
});
const avg = (items, key) => items.reduce((total, item) => total + n(item?.[key], 0), 0) / Math.max(1, items.length);

export function createHellscapeBloodrootPlotKit() {
  return {
    id: 'hellscape-bloodroot-plot-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const wave = n(input.wave?.index ?? input.waves?.current ?? input.wave, 1);
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position);
      const bag = resources(input.inventory ?? input.resources ?? input);
      const pressure = c(input.corruption ?? input.portalPressure ?? input.demonPressure ?? 0.18 + wave * 0.045);
      const sites = Array.isArray(input.bloodrootPlots) && input.bloodrootPlots.length
        ? input.bloodrootPlots
        : Array.from({ length: 5 }, (_, index) => ({ position: orbit(wave, 72 + index * 15, index, 5, core), covenantScar: 0.2 + index * 0.1 }));
      return sites.slice(0, 7).map((site, index) => {
        const position = point(site.position ?? site, orbit(wave, 72 + index * 15, index, sites.length || 5, core));
        const taint = c(n(site.covenantScar ?? site.taint, pressure + index * 0.07) - bag.water * 0.02 - bag.bloodroot * 0.018);
        const yieldScore = c(0.42 + bag.ash * 0.035 + bag.bloodroot * 0.04 - taint * 0.32);
        return {
          id: `bloodroot-plot-${index + 1}`,
          kit: 'hellscape-bloodroot-plot-kit',
          position,
          radius: 14 + Math.round(taint * 12),
          taint,
          yieldScore,
          label: taint > 0.68 ? 'bloodroot plot under demon claim' : yieldScore > 0.6 ? 'bloodroot plot ready for harvest' : 'bloodroot plot needs ash mulch'
        };
      });
    }
  };
}

export function createHellscapeAshSicklePathKit() {
  return {
    id: 'hellscape-ash-sickle-path-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const plots = input.bloodrootPlots ?? [];
      const avatar = point(input.avatar?.position ?? input.player?.position ?? input.avatar);
      const enemies = count(input.enemies ?? input.demons ?? input.hostiles ?? input.wave?.enemies, 4);
      const bag = resources(input.inventory ?? input.resources ?? input);
      return plots.map((plot, index) => {
        const sickleSharpness = c(0.26 + bag.ash * 0.035 + bag.bone * 0.045 + plot.yieldScore * 0.32);
        const ambushRisk = c(plot.taint * 0.4 + enemies * 0.024 - sickleSharpness * 0.24);
        return {
          id: `ash-sickle-path-${index + 1}`,
          kit: 'hellscape-ash-sickle-path-kit',
          plotId: plot.id,
          path: [avatar, { x: Math.round((avatar.x + plot.position.x) / 2), y: Math.round((avatar.y + plot.position.y) / 2 - 16 - index * 2) }, plot.position],
          sickleSharpness,
          ambushRisk,
          expectedHarvest: Math.max(0, Math.round(1 + plot.yieldScore * 4 - ambushRisk * 2)),
          label: ambushRisk > 0.55 ? 'sickle path needs escort' : 'sickle path can harvest'
        };
      });
    }
  };
}

export function createHellscapeEmberTitheBowlKit() {
  return {
    id: 'hellscape-ember-tithe-bowl-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const plots = input.bloodrootPlots ?? [];
      const paths = input.ashSicklePaths ?? [];
      const bag = resources(input.inventory ?? input.resources ?? input);
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position);
      return plots.map((plot, index) => {
        const path = paths[index] ?? {};
        const titheFill = c(bag.soul * 0.08 + bag.ember * 0.06 + n(path.expectedHarvest, 0) * 0.08 + plot.yieldScore * 0.18);
        const covenantDebt = c(plot.taint * 0.45 + 0.34 - titheFill * 0.5);
        return {
          id: `ember-tithe-bowl-${index + 1}`,
          kit: 'hellscape-ember-tithe-bowl-kit',
          plotId: plot.id,
          position: { x: Math.round((plot.position.x + core.x) / 2 + 10 + index * 2), y: Math.round((plot.position.y + core.y) / 2 + 14) },
          titheFill,
          covenantDebt,
          label: titheFill > 0.62 ? 'tithe bowl glowing clean' : 'tithe bowl needs ember or souls'
        };
      });
    }
  };
}

export function createHellscapeDemonAuditSealKit() {
  return {
    id: 'hellscape-demon-audit-seal-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const bowls = input.emberTitheBowls ?? [];
      const enemies = count(input.enemies ?? input.demons ?? input.hostiles ?? input.wave?.enemies, 4);
      const bag = resources(input.inventory ?? input.resources ?? input);
      return bowls.map((bowl, index) => {
        const sealStrength = c(bowl.titheFill * 0.45 + bag.crystal * 0.08 + bag.brimstone * 0.045 - bowl.covenantDebt * 0.25 - enemies * 0.01);
        return {
          id: `demon-audit-seal-${index + 1}`,
          kit: 'hellscape-demon-audit-seal-kit',
          bowlId: bowl.id,
          position: { x: bowl.position.x - 10, y: bowl.position.y - 12 },
          sealStrength,
          breachRisk: c(1 - sealStrength + bowl.covenantDebt * 0.28),
          label: sealStrength > 0.6 ? 'audit seal binding the bargain' : 'audit seal can be contested'
        };
      });
    }
  };
}

export function createHellscapeCovenantWagonWheelKit() {
  return {
    id: 'hellscape-covenant-wagon-wheel-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const plots = input.bloodrootPlots ?? [];
      const seals = input.demonAuditSeals ?? [];
      const core = point(input.core?.position ?? input.sanctuary?.position ?? input.base?.position);
      const avatar = point(input.avatar?.position ?? input.player?.position ?? input.avatar);
      return plots.map((plot, index) => {
        const seal = seals[index] ?? {};
        const escapeIntegrity = c(plot.yieldScore * 0.26 + n(seal.sealStrength, 0) * 0.44 + (1 - n(seal.breachRisk, 0.6)) * 0.18);
        return {
          id: `covenant-wagon-wheel-${index + 1}`,
          kit: 'hellscape-covenant-wagon-wheel-kit',
          plotId: plot.id,
          path: [plot.position, { x: Math.round((plot.position.x + avatar.x) / 2 + 18), y: Math.round((plot.position.y + avatar.y) / 2 + 12) }, core],
          escapeIntegrity,
          spareSpokesNeeded: Math.max(0, Math.ceil((1 - escapeIntegrity) * 4)),
          label: escapeIntegrity > 0.58 ? 'wagon wheel can carry the harvest' : 'wagon wheel needs spoke repair'
        };
      });
    }
  };
}

export function createHellscapeDawnCovenantLedgerKit() {
  return {
    id: 'hellscape-dawn-covenant-ledger-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const plots = input.bloodrootPlots ?? [];
      const paths = input.ashSicklePaths ?? [];
      const bowls = input.emberTitheBowls ?? [];
      const seals = input.demonAuditSeals ?? [];
      const wheels = input.covenantWagonWheels ?? [];
      const readiness = c(avg(plots, 'yieldScore') * 0.23 + (1 - avg(paths, 'ambushRisk')) * 0.18 + avg(bowls, 'titheFill') * 0.18 + avg(seals, 'sealStrength') * 0.21 + avg(wheels, 'escapeIntegrity') * 0.2);
      const phase = readiness > 0.78 ? 'dawn-covenant-ready' : readiness > 0.58 ? 'escort-harvest-wagons' : readiness > 0.36 ? 'seal-demon-audits' : 'mulch-bloodroot-plots';
      return [{
        id: 'dawn-covenant-ledger-1',
        kit: 'hellscape-dawn-covenant-ledger-kit',
        readiness,
        phase,
        plots: plots.length,
        paths: paths.length,
        bowls: bowls.length,
        seals: seals.length,
        wheels: wheels.length,
        safeWagons: wheels.filter((wheel) => wheel.escapeIntegrity > 0.56).length,
        nextAction: phase === 'mulch-bloodroot-plots'
          ? 'harvest ash and water to restore the bloodroot plots'
          : phase === 'seal-demon-audits'
            ? 'feed ember tithe bowls and bind demon audit seals'
            : phase === 'escort-harvest-wagons'
              ? 'route covenant wagons through the lowest ambush lanes'
              : 'hold the bargain until dawn extraction opens'
      }];
    }
  };
}

export function createHellscapeHarvesterCovenantRendererHandoffKit() {
  return {
    id: 'hellscape-harvester-covenant-renderer-handoff-kit',
    ownership: OWNERSHIP_BOUNDARY,
    describe(parts = {}) {
      const descriptors = {
        bloodrootPlots: parts.bloodrootPlots ?? [],
        ashSicklePaths: parts.ashSicklePaths ?? [],
        emberTitheBowls: parts.emberTitheBowls ?? [],
        demonAuditSeals: parts.demonAuditSeals ?? [],
        covenantWagonWheels: parts.covenantWagonWheels ?? [],
        dawnCovenantLedgers: parts.dawnCovenantLedgers ?? []
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      return {
        id: 'hellscape-harvester-covenant-renderer-handoff',
        kit: 'hellscape-harvester-covenant-renderer-handoff-kit',
        kind: 'renderer-handoff',
        policy: 'renderer-consumes-descriptors-only',
        ownership: { ...OWNERSHIP_BOUNDARY, rendererConsumesDescriptorsOnly: true },
        descriptors,
        counts: { ...counts, total: Object.values(counts).reduce((total, value) => total + value, 0) }
      };
    }
  };
}

export function createHellscapeHarvesterCovenantReadinessDomainKit() {
  const plotKit = createHellscapeBloodrootPlotKit();
  const pathKit = createHellscapeAshSicklePathKit();
  const bowlKit = createHellscapeEmberTitheBowlKit();
  const sealKit = createHellscapeDemonAuditSealKit();
  const wheelKit = createHellscapeCovenantWagonWheelKit();
  const ledgerKit = createHellscapeDawnCovenantLedgerKit();
  const handoffKit = createHellscapeHarvesterCovenantRendererHandoffKit();
  return {
    id: 'hellscape-harvester-covenant-readiness-domain-kit',
    tree: HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE,
    kits: HELLSCAPE_HARVESTER_COVENANT_KITS,
    ownership: OWNERSHIP_BOUNDARY,
    describe(input = {}) {
      const bloodrootPlots = plotKit.describe(input);
      const ashSicklePaths = pathKit.describe({ ...input, bloodrootPlots });
      const emberTitheBowls = bowlKit.describe({ ...input, bloodrootPlots, ashSicklePaths });
      const demonAuditSeals = sealKit.describe({ ...input, emberTitheBowls });
      const covenantWagonWheels = wheelKit.describe({ ...input, bloodrootPlots, demonAuditSeals });
      const dawnCovenantLedgers = ledgerKit.describe({ ...input, bloodrootPlots, ashSicklePaths, emberTitheBowls, demonAuditSeals, covenantWagonWheels });
      const ledger = dawnCovenantLedgers[0] ?? { readiness: 0, phase: 'mulch-bloodroot-plots' };
      const rendererHandoff = handoffKit.describe({ bloodrootPlots, ashSicklePaths, emberTitheBowls, demonAuditSeals, covenantWagonWheels, dawnCovenantLedgers });
      return {
        id: 'hellscape-harvester-covenant-readiness',
        domain: 'hellscape-harvester-covenant-readiness-domain',
        readiness: c(ledger.readiness),
        phase: ledger.phase,
        missionState: ledger.phase,
        covenantPressure: c(avg(bloodrootPlots, 'taint') * 0.38 + avg(ashSicklePaths, 'ambushRisk') * 0.34 + avg(demonAuditSeals, 'breachRisk') * 0.28),
        bloodrootPlots,
        ashSicklePaths,
        emberTitheBowls,
        demonAuditSeals,
        covenantWagonWheels,
        dawnCovenantLedgers,
        rendererHandoff,
        tree: HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE,
        ownership: OWNERSHIP_BOUNDARY
      };
    }
  };
}
