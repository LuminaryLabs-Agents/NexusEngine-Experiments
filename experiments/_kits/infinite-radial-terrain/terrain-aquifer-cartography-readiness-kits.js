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
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
const wetness = (sample = {}) => c01(n(sample.hydrology?.flow?.wetnessIndex, sample.material?.materialWeights?.wetChannel ?? 0.18));
const channel = (sample = {}) => c01(n(sample.hydrology?.flow?.channelPotential, 0) * 0.62 + c01(n(sample.hydrology?.stream?.streamOrder, 0) / 4) * 0.24 + wetness(sample) * 0.14);
const slopeRisk = (sample = {}) => c01(n(sample.slope, 12) / 44);
const porous = (sample = {}) => c01(n(sample.material?.materialWeights?.soil, 0.32) * 0.38 + n(sample.material?.vegetationMask, sample.climate?.vegetationPotential ?? 0.24) * 0.24 + (1 - slopeRisk(sample)) * 0.22 + wetness(sample) * 0.16);
const springScore = (sample = {}, time = 0) => c01(wetness(sample) * 0.42 + channel(sample) * 0.28 + porous(sample) * 0.22 + Math.max(0, Math.sin(n(time) * 0.47 + n(sample.x) * 0.001)) * 0.08);
const contract = (owner) => ({
  owner,
  rendererConsumes: "terrain aquifer cartography descriptors only",
  rendererMustOwn: ["presentation placement", "draw order", "color application", "view interpolation"],
  rendererMustNotOwn: ["aquifer truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL", "physics"]
});

export const TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-aquifer-cartography-readiness-domain",
  subdomains: [
    { id: "groundwater-source-domain", subdomains: [{ id: "spring-seep-domain", kits: ["terrain-spring-seep-marker-kit"] }, { id: "moraine-well-domain", kits: ["terrain-moraine-well-probe-kit"] }] },
    { id: "flow-mapping-domain", subdomains: [{ id: "aquifer-thread-domain", subdomains: [{ id: "dowsing-line-domain", kits: ["terrain-aquifer-thread-line-kit"] }] }, { id: "cistern-basin-domain", kits: ["terrain-cistern-basin-catchment-kit"] }] },
    { id: "expedition-water-safety-domain", subdomains: [{ id: "dye-marker-domain", kits: ["terrain-dye-marker-beacon-kit"] }, { id: "water-ledger-domain", kits: ["terrain-dawn-water-ledger-kit"] }] },
    { id: "renderer-handoff", kits: ["terrain-aquifer-cartography-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes terrain aquifer cartography descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createTerrainSpringSeepMarkerKit({ maxSeeps = 5 } = {}) {
  return { id: "terrain-spring-seep-marker-kit", domain: "terrain-aquifer-cartography-readiness/groundwater-source-domain/spring-seep-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const seepConfidence = springScore(sample, input.time);
      const drinkable = c01(seepConfidence * 0.72 + porous(sample) * 0.2 - slopeRisk(sample) * 0.16);
      return { id: `aquifer-spring-seep-${sample.tag ?? index}`, kind: "aquifer-spring-seep", label: sample.tag ?? `seep-${index}`, position: { ...p, y: r(p.y + 12, 1) }, seepConfidence: r(seepConfidence), drinkable: r(drinkable), trickleLitersHour: Math.max(1, Math.round(2 + seepConfidence * 38)), status: seepConfidence > 0.68 ? "flowing" : seepConfidence > 0.42 ? "damp-trace" : "dry-watch", rendererContract: contract("terrain-spring-seep-marker-kit") };
    }).sort((a, b) => b.seepConfidence - a.seepConfidence).slice(0, maxSeeps);
  }, snapshot(input) { const seeps = this.describe(input); return { seeps: seeps.length, flowing: seeps.filter((entry) => entry.status === "flowing").length }; } };
}

export function createTerrainMoraineWellProbeKit({ maxWells = 4 } = {}) {
  return { id: "terrain-moraine-well-probe-kit", domain: "terrain-aquifer-cartography-readiness/groundwater-source-domain/moraine-well-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const wellScore = c01(porous(sample) * 0.46 + wetness(sample) * 0.3 + (1 - slopeRisk(sample)) * 0.18 + c01(n(sample.landform?.confidence, 0.5)) * 0.06);
      return { id: `aquifer-moraine-well-${sample.tag ?? index}`, kind: "aquifer-moraine-well", center: { ...p, y: r(p.y + 4, 1) }, radiusMeters: r(55 + wellScore * 145, 1), wellScore: r(wellScore), depthMeters: Math.max(3, Math.round(22 - wellScore * 13 + slopeRisk(sample) * 8)), status: wellScore > 0.66 ? "diggable" : wellScore > 0.38 ? "survey" : "skip", rendererContract: contract("terrain-moraine-well-probe-kit") };
    }).sort((a, b) => b.wellScore - a.wellScore).slice(0, maxWells);
  }, snapshot(input) { const wells = this.describe(input); return { wells: wells.length, diggable: wells.filter((entry) => entry.status === "diggable").length }; } };
}

export function createTerrainAquiferThreadLineKit({ maxThreads = 5 } = {}) {
  return { id: "terrain-aquifer-thread-line-kit", domain: "terrain-aquifer-cartography-readiness/flow-mapping-domain/aquifer-thread-domain/dowsing-line-domain", describe(input = {}) {
    const sources = createTerrainSpringSeepMarkerKit({ maxSeeps: maxThreads + 2 }).describe(input);
    return sources.slice(0, maxThreads).map((source, index) => {
      const target = sources[index + 1] ?? sources[0] ?? source;
      const lengthMeters = dist(source.position, target.position);
      const flowCertainty = c01((source.seepConfidence + (target.seepConfidence ?? source.seepConfidence)) * 0.42 + (1 - c01(lengthMeters / 5200)) * 0.16);
      return { id: `aquifer-thread-line-${index}`, kind: "aquifer-thread-line", from: source.position, to: target.position, lengthMeters: r(lengthMeters, 1), flowCertainty: r(flowCertainty), markerCount: Math.max(2, Math.round(lengthMeters / 420)), status: flowCertainty > 0.68 ? "mapped-flow" : flowCertainty > 0.42 ? "probable-flow" : "lost-thread", rendererContract: contract("terrain-aquifer-thread-line-kit") };
    });
  }, snapshot(input) { const threads = this.describe(input); return { threads: threads.length, mapped: threads.filter((entry) => entry.status === "mapped-flow").length }; } };
}

export function createTerrainCisternBasinCatchmentKit({ maxBasins = 4 } = {}) {
  return { id: "terrain-cistern-basin-catchment-kit", domain: "terrain-aquifer-cartography-readiness/flow-mapping-domain/cistern-basin-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const catchmentScore = c01(wetness(sample) * 0.35 + (1 - slopeRisk(sample)) * 0.33 + channel(sample) * 0.2 + porous(sample) * 0.12);
      return { id: `aquifer-cistern-basin-${sample.tag ?? index}`, kind: "aquifer-cistern-basin", center: { ...p, y: r(p.y + 2, 1) }, radiusMeters: r(80 + catchmentScore * 260, 1), catchmentScore: r(catchmentScore), cisternDays: Math.max(1, Math.round(1 + catchmentScore * 9)), status: catchmentScore > 0.64 ? "cistern-ready" : catchmentScore > 0.4 ? "needs-lining" : "washout-risk", rendererContract: contract("terrain-cistern-basin-catchment-kit") };
    }).sort((a, b) => b.catchmentScore - a.catchmentScore).slice(0, maxBasins);
  }, snapshot(input) { const basins = this.describe(input); return { basins: basins.length, ready: basins.filter((entry) => entry.status === "cistern-ready").length }; } };
}

export function createTerrainDyeMarkerBeaconKit({ maxMarkers = 6 } = {}) {
  return { id: "terrain-dye-marker-beacon-kit", domain: "terrain-aquifer-cartography-readiness/expedition-water-safety-domain/dye-marker-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const visibility = c01(0.62 + springScore(sample, input.time) * 0.2 - slopeRisk(sample) * 0.12 + Math.abs(Math.cos(n(input.time) * 0.37 + index)) * 0.18);
      return { id: `aquifer-dye-marker-${sample.tag ?? index}`, kind: "aquifer-dye-marker", position: { ...p, y: r(p.y + 34, 1) }, visibility: r(visibility), pulsesPerMinute: Math.max(3, Math.round(5 + visibility * 13)), status: visibility > 0.7 ? "visible" : visibility > 0.44 ? "flag-needed" : "hidden", rendererContract: contract("terrain-dye-marker-beacon-kit") };
    }).sort((a, b) => b.visibility - a.visibility).slice(0, maxMarkers);
  }, snapshot(input) { const markers = this.describe(input); return { markers: markers.length, visible: markers.filter((entry) => entry.status === "visible").length }; } };
}

export function createTerrainDawnWaterLedgerKit() {
  return { id: "terrain-dawn-water-ledger-kit", domain: "terrain-aquifer-cartography-readiness/expedition-water-safety-domain/water-ledger-domain", describe(input = {}) {
    const seeps = createTerrainSpringSeepMarkerKit().describe(input);
    const wells = createTerrainMoraineWellProbeKit().describe(input);
    const threads = createTerrainAquiferThreadLineKit().describe(input);
    const basins = createTerrainCisternBasinCatchmentKit().describe(input);
    const markers = createTerrainDyeMarkerBeaconKit().describe(input);
    const flowingSeeps = seeps.filter((entry) => entry.status === "flowing").length;
    const diggableWells = wells.filter((entry) => entry.status === "diggable").length;
    const mappedThreads = threads.filter((entry) => entry.status === "mapped-flow").length;
    const readyBasins = basins.filter((entry) => entry.status === "cistern-ready").length;
    const visibleMarkers = markers.filter((entry) => entry.status === "visible").length;
    const readiness = c01(0.08 + flowingSeeps * 0.12 + diggableWells * 0.12 + mappedThreads * 0.1 + readyBasins * 0.12 + visibleMarkers * 0.06);
    const scarcity = c01(1 - readiness + arr(input.samples).reduce((sum, sample) => sum + (1 - wetness(sample)), 0) / Math.max(1, arr(input.samples).length) * 0.16);
    return [{ id: "aquifer-dawn-water-ledger", kind: "aquifer-dawn-water-ledger", readiness: r(readiness), scarcity: r(scarcity), flowingSeeps, diggableWells, mappedThreads, readyBasins, visibleMarkers, totalDescriptors: seeps.length + wells.length + threads.length + basins.length + markers.length + 1, status: readiness > 0.7 ? "water-secure" : readiness > 0.44 ? "rationed-route" : "dry-expedition", rendererContract: contract("terrain-dawn-water-ledger-kit") }];
  }, snapshot(input) { return this.describe(input)[0]; } };
}

export function createTerrainAquiferCartographyRendererHandoffKit() {
  return { id: "terrain-aquifer-cartography-renderer-handoff-kit", domain: "terrain-aquifer-cartography-readiness/renderer-handoff", describe(input = {}) {
    const descriptors = {
      springSeeps: createTerrainSpringSeepMarkerKit().describe(input),
      moraineWells: createTerrainMoraineWellProbeKit().describe(input),
      aquiferThreads: createTerrainAquiferThreadLineKit().describe(input),
      cisternBasins: createTerrainCisternBasinCatchmentKit().describe(input),
      dyeMarkers: createTerrainDyeMarkerBeaconKit().describe(input),
      dawnWaterLedgers: createTerrainDawnWaterLedgerKit().describe(input)
    };
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "terrain-aquifer-cartography-renderer-handoff", kind: "renderer-handoff", descriptors, counts, rendererConsumesDescriptorsOnly: true, rendererContract: contract("terrain-aquifer-cartography-renderer-handoff-kit") };
  } };
}

export function createTerrainAquiferCartographyReadinessDomainKit() {
  const handoffKit = createTerrainAquiferCartographyRendererHandoffKit();
  return { id: "terrain-aquifer-cartography-readiness-domain-kit", domain: TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE.root, tree: TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE, domainTree: TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE, describe(input = {}) {
    const rendererHandoff = handoffKit.describe(input);
    const ledger = rendererHandoff.descriptors.dawnWaterLedgers[0] ?? {};
    return {
      id: "terrain-aquifer-cartography-readiness",
      kind: "terrain-aquifer-cartography-readiness",
      summary: { readiness: ledger.readiness ?? 0, scarcity: ledger.scarcity ?? 1, status: ledger.status ?? "dry-expedition", totalDescriptors: rendererHandoff.counts.total },
      springSeeps: rendererHandoff.descriptors.springSeeps,
      moraineWells: rendererHandoff.descriptors.moraineWells,
      aquiferThreads: rendererHandoff.descriptors.aquiferThreads,
      cisternBasins: rendererHandoff.descriptors.cisternBasins,
      dyeMarkers: rendererHandoff.descriptors.dyeMarkers,
      dawnWaterLedgers: rendererHandoff.descriptors.dawnWaterLedgers,
      rendererHandoff,
      domainTree: TERRAIN_AQUIFER_CARTOGRAPHY_READINESS_DOMAIN_TREE
    };
  }, snapshot(input) { return this.describe(input).summary; } };
}
