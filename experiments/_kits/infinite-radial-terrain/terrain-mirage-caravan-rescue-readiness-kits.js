const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const c01 = (value) => clamp(value, 0, 1);
const r = (value, digits = 3) => Number(n(value).toFixed(digits));
const camPos = (camera = {}) => Array.isArray(camera.position)
  ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
  : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
const pos = (sample = {}, fallback = {}) => ({
  x: r(n(sample.x, fallback.x)),
  y: r(n(sample.height, sample.y ?? fallback.y), 1),
  z: r(n(sample.z, fallback.z))
});
const distance2d = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
const slopeRisk = (sample = {}) => c01(n(sample.slope, 12) / 42);
const wetness = (sample = {}) => c01(n(sample.hydrology?.flow?.wetnessIndex, 0.16) * 0.62 + n(sample.hydrology?.flow?.channelPotential, 0.12) * 0.38);
const vegetation = (sample = {}) => c01(n(sample.material?.vegetationMask, sample.climate?.vegetationPotential ?? 0.2));
const heatLoad = (sample = {}, time = 0) => c01(0.34 + Math.max(0, n(sample.climate?.temperatureC, 26) - 12) / 42 * 0.38 + (1 - vegetation(sample)) * 0.16 + Math.abs(Math.sin(n(sample.x) * 0.0009 + n(sample.z) * 0.0007 + n(time) * 0.18)) * 0.12);
const shadeScore = (sample = {}, time = 0) => c01(vegetation(sample) * 0.44 + (1 - slopeRisk(sample)) * 0.22 + wetness(sample) * 0.18 + (1 - heatLoad(sample, time)) * 0.16);
const oasisScore = (sample = {}, time = 0) => c01(wetness(sample) * 0.42 + vegetation(sample) * 0.26 + c01(n(sample.landform?.confidence, 0.52)) * 0.18 + (1 - heatLoad(sample, time)) * 0.14);
const routeScore = (sample = {}, time = 0) => c01((1 - slopeRisk(sample)) * 0.36 + shadeScore(sample, time) * 0.24 + oasisScore(sample, time) * 0.22 + c01(n(sample.material?.materialWeights?.soil, 0.28)) * 0.18);
const contract = (owner) => ({
  owner,
  rendererConsumes: "terrain mirage caravan rescue descriptors only",
  rendererMustOwn: ["presentation placement", "draw order", "color application", "view interpolation", "camera-relative projection"],
  rendererMustNotOwn: ["caravan truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL", "physics", "storage", "network"]
});

export const TERRAIN_MIRAGE_CARAVAN_RESCUE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-mirage-caravan-rescue-readiness-domain",
  subdomains: [
    { id: "oasis-location-domain", subdomains: [{ id: "mirage-well-domain", kits: ["terrain-mirage-well-marker-kit"] }, { id: "shade-sail-domain", kits: ["terrain-shade-sail-canopy-kit"] }] },
    { id: "caravan-route-domain", subdomains: [{ id: "camel-bell-domain", kits: ["terrain-camel-bell-trail-kit"] }, { id: "dune-stake-domain", subdomains: [{ id: "wind-break-subdomain", kits: ["terrain-dune-stake-windbreak-kit"] }] }] },
    { id: "survival-supply-domain", subdomains: [{ id: "water-skin-cache-domain", kits: ["terrain-water-skin-cache-kit"] }, { id: "dusk-caravan-ledger-domain", kits: ["terrain-dusk-caravan-ledger-kit"] }] },
    { id: "renderer-handoff", kits: ["terrain-mirage-caravan-rescue-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes terrain mirage caravan rescue descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, network, or frame-loop ownership"
});

export function createTerrainMirageWellMarkerKit({ maxWells = 6 } = {}) {
  return { id: "terrain-mirage-well-marker-kit", domain: "terrain-mirage-caravan-rescue-readiness/oasis-location-domain/mirage-well-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const oasis = oasisScore(sample, input.time);
      const heat = heatLoad(sample, input.time);
      const signal = c01(oasis * 0.7 + wetness(sample) * 0.18 + c01(distance2d(p, cam) / 2600) * 0.12);
      return { id: `caravan-mirage-well-${sample.tag ?? index}`, kind: "caravan-mirage-well", label: sample.tag ?? `well-${index}`, position: { ...p, y: r(p.y + 10, 1) }, oasisScore: r(oasis), heatLoad: r(heat), signalStrength: r(signal), ringStones: Math.max(5, Math.round(6 + signal * 14)), status: signal > 0.68 ? "water-confirmed" : signal > 0.43 ? "mirage-check" : "dry-horizon", rendererContract: contract("terrain-mirage-well-marker-kit") };
    }).sort((a, b) => (b.signalStrength + b.oasisScore) - (a.signalStrength + a.oasisScore)).slice(0, maxWells);
  }, snapshot(input) { const wells = this.describe(input); return { wells: wells.length, confirmed: wells.filter((entry) => entry.status === "water-confirmed").length }; } };
}

export function createTerrainShadeSailCanopyKit({ maxSails = 5 } = {}) {
  return { id: "terrain-shade-sail-canopy-kit", domain: "terrain-mirage-caravan-rescue-readiness/oasis-location-domain/shade-sail-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const shade = shadeScore(sample, input.time);
      const heat = heatLoad(sample, input.time);
      const canvasTension = c01(shade * 0.5 + (1 - slopeRisk(sample)) * 0.26 + c01(n(sample.landform?.confidence, 0.54)) * 0.24);
      return { id: `caravan-shade-sail-${sample.tag ?? index}`, kind: "caravan-shade-sail", position: { ...p, y: r(p.y + 34, 1) }, shadeScore: r(shade), heatLoad: r(heat), canvasTension: r(canvasTension), sailPanels: Math.max(2, Math.round(2 + shade * 7)), status: shade > 0.66 && canvasTension > 0.58 ? "shade-ready" : shade > 0.42 ? "needs-rigging" : "sun-exposed", rendererContract: contract("terrain-shade-sail-canopy-kit") };
    }).sort((a, b) => b.shadeScore - a.shadeScore).slice(0, maxSails);
  }, snapshot(input) { const sails = this.describe(input); return { sails: sails.length, ready: sails.filter((entry) => entry.status === "shade-ready").length }; } };
}

export function createTerrainCamelBellTrailKit({ maxTrails = 5 } = {}) {
  return { id: "terrain-camel-bell-trail-kit", domain: "terrain-mirage-caravan-rescue-readiness/caravan-route-domain/camel-bell-domain", describe(input = {}) {
    const wells = createTerrainMirageWellMarkerKit({ maxWells: maxTrails + 2 }).describe(input);
    return wells.slice(0, maxTrails).map((well, index) => {
      const target = wells[index + 1] ?? wells[0] ?? well;
      const lengthMeters = distance2d(well.position, target.position);
      const cadence = c01((well.signalStrength + (target.signalStrength ?? well.signalStrength)) * 0.36 + (1 - c01(lengthMeters / 4300)) * 0.3 + 0.16);
      return { id: `caravan-camel-bell-trail-${index}`, kind: "caravan-camel-bell-trail", from: well.position, to: target.position, lengthMeters: r(lengthMeters, 1), bellCadence: r(cadence), wayBeads: Math.max(4, Math.round(lengthMeters / 170)), status: cadence > 0.66 ? "audible-route" : cadence > 0.42 ? "faint-bells" : "lost-caravan", rendererContract: contract("terrain-camel-bell-trail-kit") };
    });
  }, snapshot(input) { const trails = this.describe(input); return { trails: trails.length, audible: trails.filter((entry) => entry.status === "audible-route").length }; } };
}

export function createTerrainDuneStakeWindbreakKit({ maxStakes = 6 } = {}) {
  return { id: "terrain-dune-stake-windbreak-kit", domain: "terrain-mirage-caravan-rescue-readiness/caravan-route-domain/dune-stake-domain/wind-break-subdomain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const windbreak = c01((1 - slopeRisk(sample)) * 0.28 + shadeScore(sample, input.time) * 0.24 + c01(n(sample.material?.materialWeights?.soil, 0.3)) * 0.2 + c01(Math.abs(Math.cos(n(sample.z) * 0.001 + n(input.time) * 0.27))) * 0.28);
      return { id: `caravan-dune-stake-${sample.tag ?? index}`, kind: "caravan-dune-stake-windbreak", position: { ...p, y: r(p.y + 16, 1) }, windbreakScore: r(windbreak), stakeCount: Math.max(3, Math.round(4 + windbreak * 10)), clothStrips: Math.max(1, Math.round(1 + windbreak * 6)), status: windbreak > 0.66 ? "sandbreak-set" : windbreak > 0.42 ? "needs-cloth" : "buried-stakes", rendererContract: contract("terrain-dune-stake-windbreak-kit") };
    }).sort((a, b) => b.windbreakScore - a.windbreakScore).slice(0, maxStakes);
  }, snapshot(input) { const stakes = this.describe(input); return { stakes: stakes.length, set: stakes.filter((entry) => entry.status === "sandbreak-set").length }; } };
}

export function createTerrainWaterSkinCacheKit({ maxCaches = 5 } = {}) {
  return { id: "terrain-water-skin-cache-kit", domain: "terrain-mirage-caravan-rescue-readiness/survival-supply-domain/water-skin-cache-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const cacheScore = c01(oasisScore(sample, input.time) * 0.32 + shadeScore(sample, input.time) * 0.24 + (1 - heatLoad(sample, input.time)) * 0.18 + c01(distance2d(p, cam) / 3200) * 0.12 + 0.14);
      return { id: `caravan-water-skin-cache-${sample.tag ?? index}`, kind: "caravan-water-skin-cache", position: { ...p, y: r(p.y + 8, 1) }, cacheScore: r(cacheScore), waterSkins: Math.max(2, Math.round(2 + cacheScore * 12)), rationHours: Math.max(1, Math.round(2 + cacheScore * 18)), status: cacheScore > 0.66 ? "stocked" : cacheScore > 0.42 ? "ration-watch" : "dehydration-risk", rendererContract: contract("terrain-water-skin-cache-kit") };
    }).sort((a, b) => b.cacheScore - a.cacheScore).slice(0, maxCaches);
  }, snapshot(input) { const caches = this.describe(input); return { caches: caches.length, stocked: caches.filter((entry) => entry.status === "stocked").length }; } };
}

export function createTerrainDuskCaravanLedgerKit() {
  return { id: "terrain-dusk-caravan-ledger-kit", domain: "terrain-mirage-caravan-rescue-readiness/survival-supply-domain/dusk-caravan-ledger-domain", describe(input = {}) {
    const wells = createTerrainMirageWellMarkerKit().describe(input);
    const sails = createTerrainShadeSailCanopyKit().describe(input);
    const trails = createTerrainCamelBellTrailKit().describe(input);
    const stakes = createTerrainDuneStakeWindbreakKit().describe(input);
    const caches = createTerrainWaterSkinCacheKit().describe(input);
    const confirmedWells = wells.filter((entry) => entry.status === "water-confirmed").length;
    const shadeReady = sails.filter((entry) => entry.status === "shade-ready").length;
    const audibleTrails = trails.filter((entry) => entry.status === "audible-route").length;
    const sandbreaks = stakes.filter((entry) => entry.status === "sandbreak-set").length;
    const stockedCaches = caches.filter((entry) => entry.status === "stocked").length;
    const averageHeat = arr(input.samples).reduce((sum, sample) => sum + heatLoad(sample, input.time), 0) / Math.max(1, arr(input.samples).length);
    const readiness = c01(0.05 + confirmedWells * 0.12 + shadeReady * 0.09 + audibleTrails * 0.1 + sandbreaks * 0.08 + stockedCaches * 0.11 - averageHeat * 0.08);
    const heatRisk = c01(averageHeat * 0.72 + (1 - readiness) * 0.28);
    return [{ id: "caravan-dusk-rescue-ledger", kind: "caravan-dusk-rescue-ledger", readiness: r(readiness), heatRisk: r(heatRisk), confirmedWells, shadeReady, audibleTrails, sandbreaks, stockedCaches, totalDescriptors: wells.length + sails.length + trails.length + stakes.length + caches.length + 1, status: readiness > 0.72 ? "caravan-secure" : readiness > 0.45 ? "dusk-route-marked" : "lost-to-mirage", rendererContract: contract("terrain-dusk-caravan-ledger-kit") }];
  }, snapshot(input) { return this.describe(input)[0]; } };
}

export function createTerrainMirageCaravanRescueRendererHandoffKit() {
  return { id: "terrain-mirage-caravan-rescue-renderer-handoff-kit", domain: "terrain-mirage-caravan-rescue-readiness/renderer-handoff", describe(input = {}) {
    const descriptors = {
      mirageWells: createTerrainMirageWellMarkerKit().describe(input),
      shadeSails: createTerrainShadeSailCanopyKit().describe(input),
      camelBellTrails: createTerrainCamelBellTrailKit().describe(input),
      duneStakeWindbreaks: createTerrainDuneStakeWindbreakKit().describe(input),
      waterSkinCaches: createTerrainWaterSkinCacheKit().describe(input),
      duskCaravanLedgers: createTerrainDuskCaravanLedgerKit().describe(input)
    };
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, arr(value).length]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "terrain-mirage-caravan-rescue-renderer-handoff", domain: "terrain-mirage-caravan-rescue-readiness-domain", descriptors, counts, rendererContract: contract("terrain-mirage-caravan-rescue-renderer-handoff-kit") };
  }, snapshot(input) { return this.describe(input).counts; } };
}

export function createTerrainMirageCaravanRescueReadinessDomainKit() {
  const handoffKit = createTerrainMirageCaravanRescueRendererHandoffKit();
  return {
    id: "terrain-mirage-caravan-rescue-readiness-domain-kit",
    domainTree: TERRAIN_MIRAGE_CARAVAN_RESCUE_READINESS_DOMAIN_TREE,
    kits: [
      "terrain-mirage-well-marker-kit",
      "terrain-shade-sail-canopy-kit",
      "terrain-camel-bell-trail-kit",
      "terrain-dune-stake-windbreak-kit",
      "terrain-water-skin-cache-kit",
      "terrain-dusk-caravan-ledger-kit",
      "terrain-mirage-caravan-rescue-renderer-handoff-kit"
    ],
    describe(input = {}) {
      const rendererHandoff = handoffKit.describe(input);
      const summary = rendererHandoff.descriptors.duskCaravanLedgers[0] ?? createTerrainDuskCaravanLedgerKit().describe(input)[0];
      return {
        id: "terrain-mirage-caravan-rescue-readiness",
        domain: "terrain-mirage-caravan-rescue-readiness-domain",
        domainTree: this.domainTree,
        mirageWells: rendererHandoff.descriptors.mirageWells,
        shadeSails: rendererHandoff.descriptors.shadeSails,
        camelBellTrails: rendererHandoff.descriptors.camelBellTrails,
        duneStakeWindbreaks: rendererHandoff.descriptors.duneStakeWindbreaks,
        waterSkinCaches: rendererHandoff.descriptors.waterSkinCaches,
        duskCaravanLedgers: rendererHandoff.descriptors.duskCaravanLedgers,
        rendererHandoff,
        summary: { readiness: summary.readiness, heatRisk: summary.heatRisk, status: summary.status, totalDescriptors: summary.totalDescriptors }
      };
    },
    snapshot(input) {
      const described = this.describe(input);
      return { readiness: described.summary.readiness, heatRisk: described.summary.heatRisk, status: described.summary.status, descriptors: described.rendererHandoff.counts.total };
    }
  };
}
