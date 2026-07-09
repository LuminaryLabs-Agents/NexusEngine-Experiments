const TREE = `hellscape-soul-lantern-quarantine-readiness-domain
├─ infection-containment-domain
│  ├─ quarantine-circle-domain
│  │  └─ hellscape-quarantine-circle-kit
│  └─ soul-lantern-stake-domain
│     └─ hellscape-soul-lantern-stake-kit
├─ breach-routing-domain
│  ├─ ashward-trench-domain
│  │  └─ hellscape-ashward-trench-kit
│  └─ plague-mist-vane-domain
│     └─ hellscape-plague-mist-vane-kit
├─ survivor-cure-handoff-domain
│  ├─ cure-totem-cache-domain
│  │  └─ hellscape-cure-totem-cache-kit
│  └─ dusk-quarantine-ledger-domain
│     └─ hellscape-dusk-quarantine-ledger-kit
└─ renderer-handoff
   └─ hellscape-soul-lantern-quarantine-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const EXCLUDES = Object.freeze(['renderer', 'DOM', 'browser-input', 'Three.js', 'WebGL', 'audio', 'asset-loading', 'frame-loop', 'physics', 'storage']);
const KITS = Object.freeze(['hellscape-quarantine-circle-kit', 'hellscape-soul-lantern-stake-kit', 'hellscape-ashward-trench-kit', 'hellscape-plague-mist-vane-kit', 'hellscape-cure-totem-cache-kit', 'hellscape-dusk-quarantine-ledger-kit', 'hellscape-soul-lantern-quarantine-renderer-handoff-kit']);

const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(num(value) * 100) / 100;

function inventoryOf(state) {
  const source = state?.inventory ?? state?.resources ?? {};
  return source instanceof Map ? Object.fromEntries(source.entries()) : (source && typeof source === 'object' ? source : {});
}

function buildCountOf(state) {
  const builds = state?.builds ?? state?.placements ?? state?.towers ?? state?.structures ?? [];
  return Array.isArray(builds) ? builds.length : (builds && typeof builds === 'object' ? Object.keys(builds).length : 0);
}

function seedOf(state) {
  const text = JSON.stringify({ wave: state?.wave ?? state?.waves?.index ?? 0, time: state?.clock?.elapsed ?? state?.time ?? 0, inventory: inventoryOf(state) });
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function point(seed, index, radius) {
  const angle = ((seed % 360) + index * 57.2958) * Math.PI / 180;
  const drift = 0.72 + ((seed >>> (index % 11)) & 7) * 0.08;
  return { x: round(Math.cos(angle) * radius * drift), y: round(Math.sin(angle) * radius * drift) };
}

function metricsOf(state = {}) {
  const inventory = inventoryOf(state);
  const wave = num(state.wave ?? state?.waves?.index ?? state?.waves?.current, 0);
  const health = num(state.coreHealth ?? state.baseHealth ?? state?.core?.health, 100);
  const maxHealth = Math.max(1, num(state.maxCoreHealth ?? state.baseMaxHealth ?? state?.core?.maxHealth, 100));
  const souls = num(state.souls ?? inventory.souls ?? inventory.soul, 0);
  const bloodroot = num(inventory.bloodroot ?? inventory.herb ?? inventory.herbs, 0);
  const ember = num(inventory.ember ?? inventory.embers ?? inventory.ash, 0);
  const wards = num(state.wards ?? inventory.wards ?? inventory.totems, 0);
  const survivors = num(state.survivors ?? state.caravanSurvivors ?? inventory.survivors, 0);
  const breaches = num(state.breaches ?? state.portalBreaches ?? state.activePortals, 0);
  const builds = buildCountOf(state);
  const healthRatio = clamp(health / maxHealth, 0, 1);
  const contaminationPressure = Math.round(clamp(14 + wave * 7 + breaches * 10 + survivors * 2 + (1 - healthRatio) * 28 - wards * 5 - builds * 1.5, 0, 100));
  const cureSupply = Math.round(clamp(souls * 3 + bloodroot * 9 + ember * 4 + wards * 12 + builds * 2, 0, 100));
  const routeControl = Math.round(clamp(100 - contaminationPressure + builds * 6 + wards * 8, 0, 100));
  const readiness = Math.round(clamp(cureSupply * 0.34 + routeControl * 0.38 + healthRatio * 18 + Math.min(100, survivors * 8) * 0.10, 0, 100));
  return {
    wave,
    healthRatio: round(healthRatio),
    souls,
    bloodroot,
    ember,
    wards,
    survivors,
    breaches,
    builds,
    contaminationPressure,
    cureSupply,
    routeControl,
    readiness,
    phase: readiness >= 78 ? 'quarantine-lit' : readiness >= 54 ? 'lantern-line-forming' : readiness >= 30 ? 'breach-triage' : 'infection-spreading',
    seed: seedOf(state)
  };
}

function missingFor(metrics) {
  return [
    metrics.souls < 4 && 'bind more soul lanterns',
    metrics.bloodroot < 3 && 'stock bloodroot cure pulp',
    metrics.wards < 2 && 'raise ward totems',
    metrics.routeControl < 55 && 'cut ashward trench routes',
    metrics.contaminationPressure > 62 && 'turn plague mist vanes'
  ].filter(Boolean);
}

function descriptors(label, kit, count, metrics, radius, extra = () => ({})) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${label}-${index + 1}`,
    kit,
    kind: label,
    index,
    position: point(metrics.seed + label.length * 31, index, radius + index * 0.31),
    pressure: clamp(Math.round(metrics.contaminationPressure + index * 3 - metrics.wards * 2), 0, 100),
    readiness: clamp(Math.round(metrics.readiness - index * 2), 0, 100),
    ...extra(index)
  }));
}

function descriptorFamilies(metrics) {
  return {
    quarantineCircles: descriptors('quarantine-circle', 'hellscape-quarantine-circle-kit', clamp(3 + Math.ceil(metrics.contaminationPressure / 28) + Math.min(2, metrics.breaches), 3, 7), metrics, 3.5, (index) => ({ radius: round(2.2 + index * 0.54 + metrics.contaminationPressure / 120) })),
    soulLanternStakes: descriptors('soul-lantern-stake', 'hellscape-soul-lantern-stake-kit', clamp(3 + Math.floor(metrics.souls / 3) + Math.floor(metrics.wards / 2), 3, 9), metrics, 4.7, (index) => ({ flame: clamp(Math.round(35 + metrics.souls * 6 + metrics.ember * 4 - index * 3), 8, 100) })),
    ashwardTrenches: descriptors('ashward-trench', 'hellscape-ashward-trench-kit', clamp(3 + Math.ceil(metrics.wave / 2) + metrics.breaches, 3, 8), metrics, 6.2, (index) => ({ length: round(4 + metrics.wave * 0.42 + index * 0.61) })),
    plagueMistVanes: descriptors('plague-mist-vane', 'hellscape-plague-mist-vane-kit', clamp(3 + Math.ceil(metrics.contaminationPressure / 24), 3, 7), metrics, 5.4, (index) => ({ directionDeg: Math.round((metrics.seed / 17 + index * 41) % 360) })),
    cureTotemCaches: descriptors('cure-totem-cache', 'hellscape-cure-totem-cache-kit', clamp(3 + Math.floor(metrics.bloodroot / 2) + Math.floor(metrics.ember / 4) + Math.floor(metrics.wards / 2), 3, 8), metrics, 3.1, (index) => ({ doses: clamp(Math.round(1 + metrics.bloodroot + metrics.ember / 2 + metrics.souls / 5 - index), 1, 18) })),
    duskQuarantineLedgers: [{ id: 'dusk-quarantine-ledger-1', kit: 'hellscape-dusk-quarantine-ledger-kit', kind: 'readiness-ledger', phase: metrics.phase, readiness: metrics.readiness, contaminationPressure: metrics.contaminationPressure, survivorPressure: clamp(Math.round(metrics.survivors * 8 + metrics.breaches * 9), 0, 100), missing: missingFor(metrics) }]
  };
}

function handoffFrom(descriptorMap) {
  const counts = Object.fromEntries(Object.entries(descriptorMap).map(([key, value]) => [key, value.length]));
  return {
    id: 'hellscape-soul-lantern-quarantine-renderer-handoff',
    kit: 'hellscape-soul-lantern-quarantine-renderer-handoff-kit',
    kind: 'renderer-handoff',
    policy: { consumesDescriptorsOnly: true, owns: [], excludes: EXCLUDES },
    descriptors: descriptorMap,
    counts,
    flatDescriptors: Object.values(descriptorMap).flat()
  };
}

function describe(state = {}) {
  const metrics = metricsOf(state);
  const descriptorMap = descriptorFamilies(metrics);
  return {
    id: 'hellscape-soul-lantern-quarantine-readiness',
    domain: 'hellscape-soul-lantern-quarantine-readiness-domain',
    tree: TREE,
    kits: KITS,
    ownership: { rendererNeutral: true, exclusions: EXCLUDES },
    phase: metrics.phase,
    readiness: metrics.readiness,
    contaminationPressure: metrics.contaminationPressure,
    cureSupply: metrics.cureSupply,
    routeControl: metrics.routeControl,
    missing: missingFor(metrics),
    metrics,
    rendererHandoff: handoffFrom(descriptorMap)
  };
}

export function createHellscapeSoulLanternQuarantineReadinessDomainKit() {
  return Object.freeze({
    id: 'hellscape-soul-lantern-quarantine-readiness-domain-kit',
    domain: 'hellscape-soul-lantern-quarantine-readiness-domain',
    tree: TREE,
    kits: KITS,
    ownershipExclusions: EXCLUDES,
    describe
  });
}
