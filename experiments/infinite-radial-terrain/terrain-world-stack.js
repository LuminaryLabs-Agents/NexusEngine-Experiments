export const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
export const EROSION_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/terrain-erosion-solver-domain-kit/index.js?v=earth-scale-v1";

export const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
export const mix = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);
export const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const TERRAIN_SCALE = Object.freeze({
  unit: "meter",
  verticalScale: 1,
  horizontalScale: 1,
  nearDetailSpacingMeters: 2,
  referenceDemSpacingMeters: 30,
  macroCellMeters: 2048,
  regionalTileMeters: 32768
});

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function cmix(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function shade(color, amount) {
  return [clamp(color[0] * amount, 0, 1), clamp(color[1] * amount, 0, 1), clamp(color[2] * amount, 0, 1)];
}

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x, z, cellSize) {
  const gx = Math.floor(x / cellSize);
  const gz = Math.floor(z / cellSize);
  const fx = x / cellSize - gx;
  const fz = z / cellSize - gz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(gx, gz);
  const b = hash2(gx + 1, gz);
  const c = hash2(gx, gz + 1);
  const d = hash2(gx + 1, gz + 1);
  return mix(mix(a, b, ux), mix(c, d, ux), uz) * 2 - 1;
}

function terrainGradient(x, z, radius = 40) {
  const hx = baseHeightOnly(x + radius, z) - baseHeightOnly(x - radius, z);
  const hz = baseHeightOnly(x, z + radius) - baseHeightOnly(x, z - radius);
  const length = Math.max(0.0001, Math.hypot(hx, hz));
  return {
    x: -hx / length,
    z: -hz / length,
    slope: Math.hypot(hx, hz) / (radius * 2),
    rawX: hx,
    rawZ: hz
  };
}

export function sampleGeology(x, z) {
  const province = valueNoise(x, z, 24000);
  const uplift = clamp(0.52 + province * 0.22 + valueNoise(x + 7000, z - 4000, 12000) * 0.15, 0, 1);
  const basinInfluence = clamp(0.42 - province * 0.26 + valueNoise(x - 9000, z + 3000, 18000) * 0.16, 0, 1);
  const faultInfluence = Math.pow(Math.abs(Math.sin((x * 0.00019) + (z * 0.00011) + 0.7)), 8);
  const regionalReliefMeters = mix(220, 1350, uplift);
  return {
    provinceId: `foothill-alpine:${Math.floor(x / 16000)},${Math.floor(z / 16000)}`,
    regionType: uplift > 0.68 ? "alpine" : uplift > 0.46 ? "foothill" : "basin",
    uplift,
    subsidence: basinInfluence,
    faultInfluence,
    regionalReliefMeters,
    macroWavelengthMeters: mix(18000, 42000, 1 - uplift)
  };
}

export function sampleLithology(x, z) {
  const layer = valueNoise(x + 2500, z - 1400, 9500);
  const band = Math.sin((x * 0.00032) + (z * 0.00021) + layer * 1.4);
  const type = band > 0.45 ? "granite" : band > 0.05 ? "sandstone" : band > -0.48 ? "shale" : "alluvium";
  const table = {
    granite: { hardness: 0.9, erodibility: 0.18, permeability: 0.25, soilDepthMeters: 0.5 },
    sandstone: { hardness: 0.62, erodibility: 0.42, permeability: 0.5, soilDepthMeters: 1.1 },
    shale: { hardness: 0.36, erodibility: 0.72, permeability: 0.22, soilDepthMeters: 1.8 },
    alluvium: { hardness: 0.22, erodibility: 0.64, permeability: 0.68, soilDepthMeters: 3.2 }
  };
  return { lithology: type, layerDip: { azimuth: 34 + layer * 18, degrees: 4 + Math.abs(layer) * 14 }, jointDensity: clamp(0.25 + Math.abs(layer) * 0.48, 0, 1), ...table[type] };
}

export function sampleClimate(x, z, height = 0) {
  const rainNoise = valueNoise(x - 6000, z + 2000, 30000);
  const rainfallMmYear = clamp(750 + rainNoise * 320 + height * 0.12, 250, 1800);
  const temperatureC = clamp(14 - height * 0.0055 + valueNoise(x + 3000, z, 26000) * 4, -12, 28);
  const snowlineMeters = 1850 + valueNoise(x, z - 9000, 42000) * 240;
  const freezeThawIndex = clamp((6 - Math.abs(temperatureC - 1)) / 6, 0, 1);
  const runoffCoefficient = clamp(0.22 + rainfallMmYear / 2600 + freezeThawIndex * 0.12, 0.18, 0.82);
  const vegetationPotential = clamp(0.25 + rainfallMmYear / 1800 - Math.max(0, height - 1300) / 2200, 0.05, 0.92);
  return { rainfallMmYear, runoffCoefficient, temperatureC, snowlineMeters, freezeThawIndex, vegetationPotential, aridityIndex: clamp(1 - rainfallMmYear / 1800, 0, 1) };
}

function broadRidgeField(x, z, geology) {
  const ridgeAxis = Math.sin((x * 0.00032) + (z * 0.00018) + geology.uplift * 2.2);
  const ridge = Math.pow(Math.abs(ridgeAxis), 1.9) * geology.regionalReliefMeters * 0.24;
  const plateau = valueNoise(x, z, geology.macroWavelengthMeters) * geology.regionalReliefMeters * 0.18;
  const fault = geology.faultInfluence * geology.regionalReliefMeters * 0.08;
  return ridge + plateau + fault;
}

function baseHeightOnly(x, z) {
  const geology = sampleGeology(x, z);
  const regional = 420 + valueNoise(x, z, 36000) * 260 + geology.uplift * geology.regionalReliefMeters * 0.28 - geology.subsidence * 140;
  const foothills = broadRidgeField(x, z, geology);
  const longSlope = -z * 0.018 + x * 0.006;
  const microRelief = valueNoise(x, z, 1800) * 22 + valueNoise(x + 900, z - 200, 650) * 7;
  return regional + foothills + longSlope + microRelief;
}

export function rawHeight(x, z) {
  return baseHeightOnly(x, z);
}

export function sampleWatershed(x, z) {
  const basinSize = 4096;
  const bx = Math.floor(x / basinSize);
  const bz = Math.floor(z / basinSize);
  const localX = x - bx * basinSize;
  const localZ = z - bz * basinSize;
  const centerX = (bx + 0.5) * basinSize;
  const centerZ = (bz + 0.5) * basinSize;
  const ridgeDistance = Math.min(localX, basinSize - localX, localZ, basinSize - localZ);
  const outlet = { x: centerX + valueNoise(centerX, centerZ, 2048) * 900, z: (bz + 1) * basinSize };
  return { basinId: `basin:${bx},${bz}`, parentBasinId: `regional:${Math.floor(bx / 4)},${Math.floor(bz / 4)}`, outlet, ridgeDistance, outletDistance: Math.hypot(x - outlet.x, z - outlet.z), catchmentAreaMeters2: basinSize * basinSize };
}

export function sampleFlowField(x, z, baseHeight, slope, curvature) {
  const direction = terrainGradient(x, z, 56);
  const watershed = sampleWatershed(x, z);
  const toOutlet = { x: watershed.outlet.x - x, z: watershed.outlet.z - z };
  const outletDistance = Math.max(1, Math.hypot(toOutlet.x, toOutlet.z));
  const aligned = clamp((direction.x * toOutlet.x + direction.z * toOutlet.z) / outletDistance * 0.5 + 0.5, 0, 1);
  const hollow = smoothstep(-0.75, 0.35, curvature);
  const valleyConvergence = clamp(hollow * 0.42 + aligned * 0.28 + slope * 0.08, 0, 1);
  const upstreamAreaMeters2 = clamp(12000 + valleyConvergence * watershed.catchmentAreaMeters2 * 0.18 + smoothstep(200, 1800, watershed.outletDistance) * 220000, 4000, 4400000);
  const channelPotential = clamp((Math.log10(upstreamAreaMeters2) - 4.75) / 1.2 + hollow * 0.24, 0, 1);
  const wetnessIndex = clamp(channelPotential * 0.7 + hollow * 0.2 + slope * 0.02, 0, 1);
  return { flowDirection: { x: direction.x, z: direction.z }, flowAccumulationCells: upstreamAreaMeters2 / 900, upstreamAreaMeters2, downstreamDistanceMeters: watershed.outletDistance, channelPotential, wetnessIndex, watershed };
}

export function sampleStreamOrder(flow, climate, lithology) {
  const drainageDensityKmPerKm2 = clamp(0.35 + climate.runoffCoefficient * 2.1 + lithology.erodibility * 0.7 - lithology.permeability * 0.42, 0.2, 4.5);
  const area = flow.upstreamAreaMeters2;
  const streamOrder = area > 1800000 ? 4 : area > 720000 ? 3 : area > 180000 ? 2 : area > 65000 ? 1 : 0;
  const isChannel = streamOrder > 0 && flow.channelPotential > 0.28;
  const channelWidthMeters = isChannel ? mix(0.8, 12, clamp((area - 65000) / 2200000, 0, 1)) : 0;
  const channelDepthMeters = isChannel ? mix(0.3, 9, clamp((area - 65000) / 2200000, 0, 1)) : 0;
  const distanceToChannelMeters = isChannel ? 0 : mix(260, 24, flow.channelPotential);
  return { isChannel, streamOrder, channelWidthMeters, channelDepthMeters, drainageDensityKmPerKm2, distanceToChannelMeters };
}

export function classifyLandform(slope, curvature, flow, stream) {
  const convex = curvature < -0.45;
  const concave = curvature > 0.25;
  let landform = "hillslope";
  if (stream.isChannel) landform = stream.streamOrder >= 3 ? "valley" : "hollow";
  else if (slope > 32) landform = "cliff";
  else if (convex && slope > 8) landform = "ridge";
  else if (concave) landform = "hollow";
  else if (slope < 4 && flow.channelPotential > 0.35) landform = "floodplain";
  else if (slope < 6) landform = "bench";
  return { landform, confidence: clamp(0.48 + Math.abs(curvature) * 0.12 + flow.channelPotential * 0.22, 0, 1), convexity: clamp(-curvature, 0, 1), concavity: clamp(curvature, 0, 1), terrainRuggedness: clamp(slope / 45, 0, 1) };
}

export async function loadErosionSolver(params = new URLSearchParams()) {
  try {
    const module = await import(params.get("erosionKit") || EROSION_URL);
    return { source: "terrain-erosion-solver-domain-kit", solveAt: (input) => module.solveTerrainErosionAt(input, { cutScale: 8.4, depositScale: 4.8, roughnessScale: 0.1, maxCut: 18, maxDeposit: 8 }) };
  } catch (error) {
    console.warn("Using local erosion fallback", error);
    return { source: "local-fallback", solveAt(input) {
      const slope = clamp(n(input.localSlope), 0, 2);
      const flow = clamp(n(input.waterFlow), 0, 1.5);
      const rain = clamp(n(input.rainfall, 0.25), 0, 1.5);
      const resistance = clamp(n(input.soilHardness, 0.4) * 0.66 + n(input.vegetationCover, 0.3) * 0.32, 0, 1);
      const cut = clamp(Math.max(0, slope * (rain + flow) + Math.max(0, n(input.curvature)) * 0.2 - resistance) * n(input.exposureTime, 1), 0, 1);
      const deposit = clamp((1 - slope) * flow * 0.42 + Math.max(0, -n(input.curvature)) * 0.18, 0, 1);
      return { heightDelta: -cut * 8.4 + deposit * 0.9, sedimentDelta: deposit * 4.8, flowStrength: clamp(flow + cut * 0.35, 0, 1), wetness: clamp(rain * 0.16 + flow * 0.48 + deposit * 0.16, 0, 1), roughnessDelta: cut * 0.1, materialHints: { exposeRock: cut * 0.72 + slope * 0.2, depositSilt: deposit, washGrass: cut, wetSoil: flow }, debug: { cut, deposit, resistance } };
    }};
  }
}

export function sampleTerrain(x, z, focus, erosionSolver) {
  const baseHeight = baseHeightOnly(x, z);
  const hx = baseHeightOnly(x + 30, z) - baseHeightOnly(x - 30, z);
  const hz = baseHeightOnly(x, z + 30) - baseHeightOnly(x, z - 30);
  const slope = Math.hypot(hx, hz) / 60;
  const slopeDegrees = Math.atan(slope) * 180 / Math.PI;
  const curvature = (baseHeightOnly(x + 60, z) + baseHeightOnly(x - 60, z) + baseHeightOnly(x, z + 60) + baseHeightOnly(x, z - 60) - baseHeight * 4) / 240;
  const geology = sampleGeology(x, z);
  const lithology = sampleLithology(x, z);
  const climate = sampleClimate(x, z, baseHeight);
  const flow = sampleFlowField(x, z, baseHeight, slope, curvature);
  const stream = sampleStreamOrder(flow, climate, lithology);
  const landform = classifyLandform(slopeDegrees, curvature, flow, stream);
  const vegetationCover = clamp(climate.vegetationPotential - slopeDegrees / 90 - stream.channelPotential * 0.18, 0.04, 0.88);
  const erosion = erosionSolver.solveAt({ position: { x, z }, baseHeight, localSlope: slopeDegrees / 45, curvature: curvature / 2, rainfall: climate.rainfallMmYear / 1200, waterFlow: flow.channelPotential, soilHardness: lithology.hardness, vegetationCover, material: lithology.lithology === "alluvium" ? "silt" : lithology.lithology === "granite" ? "rock" : "soil", exposureTime: 0.7, upstreamArea: flow.upstreamAreaMeters2 / 100000, freezeThaw: climate.freezeThawIndex, wind: clamp(0.08 + geology.uplift * 0.08, 0.02, 0.22) });
  const channelCut = stream.isChannel ? stream.channelDepthMeters * smoothstep(0.24, 0.9, flow.channelPotential) : 0;
  const sedimentDeposit = clamp((1 - slopeDegrees / 22) * flow.channelPotential, 0, 1) * lithology.erodibility * 8;
  const talus = landform.landform === "cliff" ? clamp((slopeDegrees - 34) / 26, 0, 1) * 3.5 : 0;
  const finalHeight = baseHeight + n(erosion.heightDelta) * 0.55 + n(erosion.sedimentDelta) * 0.08 - channelCut + sedimentDeposit - talus;
  const distance = Math.hypot(x - n(focus.x), z - n(focus.z));
  return { x, z, distance, baseHeight, height: finalHeight, slope: slopeDegrees, curvature, geology, lithology, climate, hydrology: { flow, stream }, erosion, sediment: { depositHeightMeters: sedimentDeposit, talusMeters: talus }, landform, material: stratifyMaterial(finalHeight, slopeDegrees, lithology, climate, flow, stream, erosion, landform) };
}

function stratifyMaterial(height, slopeDegrees, lithology, climate, flow, stream, erosion, landform) {
  const snow = smoothstep(climate.snowlineMeters - 160, climate.snowlineMeters + 220, height);
  const wetChannel = clamp(flow.wetnessIndex * 0.9 + (stream.isChannel ? 0.42 : 0), 0, 1) * (1 - snow * 0.7);
  const bedrock = clamp(slopeDegrees / 55 + (erosion.materialHints?.exposeRock ?? 0) * 0.55 + (landform.landform === "cliff" ? 0.28 : 0), 0, 1) * (1 - wetChannel * 0.35);
  const silt = clamp((erosion.materialHints?.depositSilt ?? 0) * 0.65 + (landform.landform === "floodplain" ? 0.45 : 0) + wetChannel * 0.28, 0, 1) * (1 - snow);
  const soil = clamp(1 - bedrock * 0.75 - silt * 0.35 - snow * 0.9, 0, 1);
  return { materialWeights: { bedrock, soil, silt, snow, wetChannel }, albedoHint: lithology.lithology, roughness: mix(0.72, 0.96, soil), vegetationMask: clamp(soil * climate.vegetationPotential - slopeDegrees / 80, 0, 1) };
}

export function sampleColor(sample, sky = [0.68, 0.84, 0.94]) {
  const weights = sample.material?.materialWeights ?? {};
  let color = [0.28, 0.42, 0.24];
  color = cmix(color, [0.48, 0.48, 0.44], weights.bedrock ?? 0);
  color = cmix(color, [0.48, 0.42, 0.29], weights.silt ?? 0);
  color = cmix(color, [0.24, 0.46, 0.55], weights.wetChannel ?? 0);
  color = cmix(color, [0.82, 0.86, 0.82], weights.snow ?? 0);
  color = shade(color, 0.94 + valueNoise(sample.x, sample.z, 140) * 0.055 + valueNoise(sample.x, sample.z, 48) * 0.025);
  return cmix(color, sky, smoothstep(4200, 9000, sample.distance) * 0.48);
}
