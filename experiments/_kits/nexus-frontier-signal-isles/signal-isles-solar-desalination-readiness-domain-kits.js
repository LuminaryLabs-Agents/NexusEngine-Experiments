const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));

function pos(entry = {}, fallback = {}) {
  const source = entry.transform ?? entry.position ?? entry;
  return { x: Number(source.x ?? fallback.x ?? 0), z: Number(source.z ?? source.y ?? fallback.z ?? fallback.y ?? 0) };
}

function facts(input = {}) {
  return new Set(stableArray(input.session?.completedFacts));
}

function levelList(level = {}, key, fallback = []) {
  return stableArray(level[key]).length ? stableArray(level[key]) : fallback;
}

function sunExposure(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const storm = Number(input.session?.stormPressure ?? input.objective?.stormPressure ?? 0);
  const dayPulse = 0.5 + Math.sin(elapsed * 0.07 + 0.45) * 0.5;
  return clamp01(0.42 + dayPulse * 0.36 - storm * 0.22 + Number(input.environment?.sunBonus ?? 0));
}

function freshwaterProgress(input = {}) {
  const set = facts(input);
  const harvested = stableArray(input.session?.harvestedNodeIds).length;
  const built = stableArray(input.session?.placedStructureIds).length;
  const cargoDelivered = set.has("cargo.delivered.01") ? 0.18 : 0;
  const gateOpen = input.session?.gateUnlocked ? 0.1 : 0;
  return clamp01(
    harvested * 0.075 +
    built * 0.105 +
    cargoDelivered +
    gateOpen +
    (set.has("scan.desalination.site") ? 0.12 : 0) +
    (set.has("build.solar-still.01") ? 0.16 : 0) +
    (set.has("purify.cistern.01") ? 0.2 : 0)
  );
}

function saltPressure(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const tide = Number(input.session?.tidePressure ?? input.objective?.tidePressure ?? 0.34);
  const storm = Number(input.session?.stormPressure ?? input.objective?.stormPressure ?? 0.24);
  const pulse = (0.5 + Math.sin(elapsed * 0.11) * 0.5) * 0.16;
  return clamp01(0.28 + tide * 0.34 + storm * 0.25 + pulse - freshwaterProgress(input) * 0.26);
}

function ownership(owner) {
  return {
    owner,
    rendererConsumesDescriptorsOnly: true,
    rendererConsumes: "serializable solar desalination readiness descriptors only",
    excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "physics", "frame loop", "storage"],
    rendererMustOwn: ["draw order", "camera projection", "canvas overlays", "input events", "frame scheduling"],
    rendererMustNotOwn: ["freshwater scoring", "salt pressure truth", "desalination objective truth", "session mutation", "resource accounting", "route progression"]
  };
}

function descriptorCounts(descriptors = {}) {
  return Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
}

export const SIGNAL_ISLES_SOLAR_DESALINATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "signal-isles-solar-desalination-readiness-domain",
  subdomains: [
    {
      id: "freshwater-source-domain",
      subdomains: [
        { id: "solar-still-frame-domain", kits: ["signal-isles-solar-still-frame-kit"] },
        { id: "salt-pan-gauge-domain", kits: ["signal-isles-salt-pan-gauge-kit"] }
      ]
    },
    {
      id: "purification-storage-domain",
      subdomains: [
        { id: "cistern-jar-domain", subdomains: [{ id: "sealed-clay-vessel-domain", kits: ["signal-isles-cistern-jar-kit"] }] },
        { id: "mangrove-charcoal-filter-domain", kits: ["signal-isles-mangrove-charcoal-filter-kit"] }
      ]
    },
    {
      id: "relief-handoff-domain",
      subdomains: [
        { id: "ration-buoy-domain", kits: ["signal-isles-ration-buoy-kit"] },
        { id: "dawn-water-ledger-domain", kits: ["signal-isles-dawn-water-ledger-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-solar-desalination-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes solar desalination descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, or frame-loop ownership"
});

export const SIGNAL_ISLES_SOLAR_DESALINATION_KITS = Object.freeze([
  "signal-isles-solar-still-frame-kit",
  "signal-isles-salt-pan-gauge-kit",
  "signal-isles-cistern-jar-kit",
  "signal-isles-mangrove-charcoal-filter-kit",
  "signal-isles-ration-buoy-kit",
  "signal-isles-dawn-water-ledger-kit",
  "signal-isles-solar-desalination-renderer-handoff-kit",
  "signal-isles-solar-desalination-readiness-domain-kit"
]);

export function createSignalIslesSolarStillFrameKit() {
  return {
    id: "signal-isles-solar-still-frame-kit",
    domain: "signal-isles-solar-desalination-readiness/solar-still-frame",
    describe(input = {}) {
      const level = input.level ?? {};
      const sites = levelList(level, "buildSites", [{ id: "solar-still-a", x: -5, z: 2 }, { id: "solar-still-b", x: 2, z: -3 }]);
      const placed = new Set(stableArray(input.session?.placedStructureIds));
      const exposure = sunExposure(input);
      return sites.slice(0, 5).map((site, index) => {
        const p = pos(site);
        const built = placed.has(site.structureId ?? site.id) || facts(input).has("build.solar-still.01");
        const efficiency = clamp01((built ? 0.52 : 0.18) + exposure * 0.32 + index * 0.025);
        return { id: `solar-still-frame-${site.structureId ?? site.id ?? index}`, kind: "signal-isles-solar-still-frame", x: round(p.x + index * 0.18), z: round(p.z - 0.4), built, exposure: round(exposure), efficiency: round(efficiency), radius: round(0.75 + efficiency * 1.1), active: true, color: built ? "#ffe7a2" : "#73e4ff", rendererContract: ownership("signal-isles-solar-still-frame-kit") };
      });
    }
  };
}

export function createSignalIslesSaltPanGaugeKit() {
  return {
    id: "signal-isles-salt-pan-gauge-kit",
    domain: "signal-isles-solar-desalination-readiness/salt-pan-gauge",
    describe(input = {}) {
      const level = input.level ?? {};
      const nodes = levelList(level, "scanSites", [{ id: "salt-pan-north", x: -7, z: -4 }, { id: "salt-pan-south", x: 6, z: 3 }]);
      const pressure = saltPressure(input);
      return nodes.slice(0, 5).map((node, index) => {
        const p = pos(node);
        const scanned = facts(input).has(`scan.${node.id}`) || facts(input).has("scan.desalination.site") || stableArray(input.kitStates?.scanSurvey?.completedTargetIds).includes(node.id);
        const salinity = clamp01(pressure + (scanned ? -0.12 : 0.1) + index * 0.035);
        const band = salinity > 0.68 ? "red" : salinity > 0.42 ? "amber" : "clear";
        return { id: `salt-pan-gauge-${node.id ?? index}`, kind: "signal-isles-salt-pan-gauge", x: round(p.x), z: round(p.z), scanned, salinity: round(salinity), band, radius: round(0.6 + salinity * 1.35), active: true, color: band === "red" ? "#ff7f77" : band === "amber" ? "#ffcf73" : "#9fffe0", rendererContract: ownership("signal-isles-salt-pan-gauge-kit") };
      });
    }
  };
}

export function createSignalIslesCisternJarKit() {
  return {
    id: "signal-isles-cistern-jar-kit",
    domain: "signal-isles-solar-desalination-readiness/cistern-jar",
    describe(input = {}) {
      const level = input.level ?? {};
      const sources = [...levelList(level, "cargo", [{ id: "cistern-cargo", x: 8, z: 3 }]), ...levelList(level, "resourceNodes", [])].slice(0, 5);
      const progress = freshwaterProgress(input);
      return sources.map((source, index) => {
        const p = pos(source);
        const sealed = facts(input).has("purify.cistern.01") || input.session?.cargoCarriedId === source.id || facts(input).has("cargo.delivered.01");
        const volume = clamp01((sealed ? 0.58 : 0.2) + progress * 0.34 + index * 0.02);
        return { id: `cistern-jar-${source.id ?? index}`, kind: "signal-isles-sealed-cistern-jar", x: round(p.x - 0.35), z: round(p.z + 0.35), sealed, volume: round(volume), radius: round(0.55 + volume * 1.15), active: true, color: sealed ? "#9fffe0" : "#ffe7a2", rendererContract: ownership("signal-isles-cistern-jar-kit") };
      });
    }
  };
}

export function createSignalIslesMangroveCharcoalFilterKit() {
  return {
    id: "signal-isles-mangrove-charcoal-filter-kit",
    domain: "signal-isles-solar-desalination-readiness/mangrove-charcoal-filter",
    describe(input = {}) {
      const level = input.level ?? {};
      const nodes = levelList(level, "resourceNodes", [{ id: "mangrove-charcoal-a", x: -3, z: 4 }, { id: "mangrove-charcoal-b", x: 3, z: -4 }]);
      const harvested = new Set(stableArray(input.session?.harvestedNodeIds));
      return nodes.slice(0, 5).map((node, index) => {
        const p = pos(node);
        const packed = harvested.has(node.id) || facts(input).has("purify.cistern.01");
        const purity = clamp01((packed ? 0.54 : 0.18) + freshwaterProgress(input) * 0.3 + (1 - saltPressure(input)) * 0.16);
        return { id: `mangrove-charcoal-filter-${node.id ?? index}`, kind: "signal-isles-mangrove-charcoal-filter", x: round(p.x + 0.55), z: round(p.z - 0.55), packed, purity: round(purity), radius: round(0.5 + purity * 1.2), active: true, color: packed ? "#9fffe0" : "#73e4ff", rendererContract: ownership("signal-isles-mangrove-charcoal-filter-kit") };
      });
    }
  };
}

export function createSignalIslesRationBuoyKit() {
  return {
    id: "signal-isles-ration-buoy-kit",
    domain: "signal-isles-solar-desalination-readiness/ration-buoy",
    describe(input = {}) {
      const level = input.level ?? {};
      const gates = levelList(level, "gates", [{ id: "relief-skiff-gate", x: 5, z: 1 }]);
      const destination = level.sceneRecipe?.objects?.find?.((entry) => entry.id === "final-beacon")?.transform ?? gates[0] ?? { x: 0, z: 0 };
      const targets = [...gates, destination].filter(Boolean).slice(0, 4);
      return targets.map((target, index) => {
        const p = pos(target);
        const released = input.session?.gateUnlocked || freshwaterProgress(input) > 0.62;
        const capacity = clamp01((released ? 0.55 : 0.22) + freshwaterProgress(input) * 0.34 + index * 0.025);
        return { id: `freshwater-ration-buoy-${target.id ?? index}`, kind: "signal-isles-freshwater-ration-buoy", x: round(p.x + 0.9), z: round(p.z + 0.6), released, capacity: round(capacity), radius: round(0.65 + capacity), active: true, color: released ? "#ffe7a2" : "#73e4ff", rendererContract: ownership("signal-isles-ration-buoy-kit") };
      });
    }
  };
}

export function createSignalIslesDawnWaterLedgerKit() {
  return {
    id: "signal-isles-dawn-water-ledger-kit",
    domain: "signal-isles-solar-desalination-readiness/dawn-water-ledger",
    describe(input = {}) {
      const level = input.level ?? {};
      const exit = level.sceneRecipe?.objects?.find?.((entry) => entry.id === "final-beacon")?.transform ?? levelList(level, "gates", [{ x: 0, z: 0 }])[0];
      const p = pos(exit);
      const readiness = clamp01(freshwaterProgress(input) * 0.72 + sunExposure(input) * 0.14 + (1 - saltPressure(input)) * 0.14);
      const phase = readiness > 0.74 ? "handoff" : saltPressure(input) > 0.62 ? "brine-risk" : "staging";
      return [{ id: "signal-isles-dawn-water-ledger", kind: "signal-isles-dawn-water-ledger", x: round(p.x + 1.6), z: round(p.z - 1.6), readiness: round(readiness), phase, saltPressure: round(saltPressure(input)), freshwaterProgress: round(freshwaterProgress(input)), active: true, radius: round(1 + readiness * 1.4), color: phase === "handoff" ? "#9fffe0" : phase === "brine-risk" ? "#ff7f77" : "#ffe7a2", rendererContract: ownership("signal-isles-dawn-water-ledger-kit") }];
    }
  };
}

export function createSignalIslesSolarDesalinationRendererHandoffKit() {
  return {
    id: "signal-isles-solar-desalination-renderer-handoff-kit",
    domain: "signal-isles-solar-desalination-readiness/renderer-handoff",
    describe(descriptors = {}) {
      const counts = descriptorCounts(descriptors);
      return {
        id: "signal-isles-solar-desalination-renderer-handoff",
        rendererConsumes: "serializable solar desalination descriptors only",
        descriptors,
        counts: { ...counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) },
        ownership: ownership("signal-isles-solar-desalination-renderer-handoff-kit")
      };
    }
  };
}

export function createSignalIslesSolarDesalinationReadinessDomainKit() {
  const kits = {
    solarStillFrames: createSignalIslesSolarStillFrameKit(),
    saltPanGauges: createSignalIslesSaltPanGaugeKit(),
    cisternJars: createSignalIslesCisternJarKit(),
    mangroveCharcoalFilters: createSignalIslesMangroveCharcoalFilterKit(),
    rationBuoys: createSignalIslesRationBuoyKit(),
    dawnWaterLedgers: createSignalIslesDawnWaterLedgerKit(),
    rendererHandoff: createSignalIslesSolarDesalinationRendererHandoffKit()
  };
  return {
    id: "signal-isles-solar-desalination-readiness-domain-kit",
    domain: SIGNAL_ISLES_SOLAR_DESALINATION_READINESS_DOMAIN_TREE.root,
    tree: SIGNAL_ISLES_SOLAR_DESALINATION_READINESS_DOMAIN_TREE,
    kits: SIGNAL_ISLES_SOLAR_DESALINATION_KITS,
    describe(input = {}) {
      const descriptors = {
        solarStillFrames: kits.solarStillFrames.describe(input),
        saltPanGauges: kits.saltPanGauges.describe(input),
        cisternJars: kits.cisternJars.describe(input),
        mangroveCharcoalFilters: kits.mangroveCharcoalFilters.describe(input),
        rationBuoys: kits.rationBuoys.describe(input),
        dawnWaterLedgers: kits.dawnWaterLedgers.describe(input)
      };
      const rendererHandoff = kits.rendererHandoff.describe(descriptors);
      const readiness = clamp01(freshwaterProgress(input) * 0.64 + sunExposure(input) * 0.16 + (1 - saltPressure(input)) * 0.2);
      const missionState = readiness > 0.74 ? "handoff" : saltPressure(input) > 0.62 ? "brine-risk" : "staging";
      return {
        id: "signal-isles-solar-desalination-readiness",
        domain: SIGNAL_ISLES_SOLAR_DESALINATION_READINESS_DOMAIN_TREE.root,
        readiness: round(readiness),
        sunExposure: round(sunExposure(input)),
        saltPressure: round(saltPressure(input)),
        freshwaterProgress: round(freshwaterProgress(input)),
        missionState,
        descriptors,
        rendererHandoff,
        drawOrder: Object.values(descriptors).flat(),
        ownership: ownership("signal-isles-solar-desalination-readiness-domain-kit")
      };
    }
  };
}
