export const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
export const EROSION_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/terrain-erosion-solver-domain-kit/index.js?v=visual-pass-v1";

export const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
export const mix = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);
export const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function cmix(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function shade(c, amount) {
  return [clamp(c[0] * amount, 0, 1), clamp(c[1] * amount, 0, 1), clamp(c[2] * amount, 0, 1)];
}

function grain(x, z) {
  return 0.94 + Math.sin(x * 0.011 + Math.cos(z * 0.006) * 2) * 0.035 + Math.sin(z * 0.021 + x * 0.004) * 0.026;
}

export function rawHeight(x, z) {
  const continent = Math.sin(x * 0.00135 + 0.6) * 260 + Math.cos(z * 0.00112 - 0.4) * 220;
  const massif = Math.pow(Math.abs(Math.sin(x * 0.0024 + z * 0.0017)), 1.75) * 240;
  const ridgeA = Math.pow(Math.abs(Math.sin(x * 0.0052 + z * 0.0019)), 1.45) * 165;
  const ridgeB = Math.pow(Math.abs(Math.sin(x * 0.0087 - z * 0.0041)), 2.2) * 54;
  const folds = Math.sin((x + z) * 0.009) * 42 + Math.cos((x - z) * 0.012) * 32;
  const drainA = Math.max(0, 1 - Math.abs(Math.sin(x * 0.0047 + z * 0.0032)) * 5.4);
  const drainB = Math.max(0, 1 - Math.abs(Math.sin(x * 0.0095 - z * 0.0028 + 1.2)) * 8.6);
  return continent + massif + ridgeA + ridgeB + folds - drainA * 128 - drainB * 44;
}

function baseTerrainSample(x, z, focus = { x: 0, z: 0 }) {
  const distance = Math.hypot(x - n(focus.x), z - n(focus.z));
  const height = rawHeight(x, z);
  const hx = rawHeight(x + 10, z) - rawHeight(x - 10, z);
  const hz = rawHeight(x, z + 10) - rawHeight(x, z - 10);
  const slope = Math.hypot(hx, hz) / 20;
  const curvature = (rawHeight(x + 16, z) + rawHeight(x - 16, z) + rawHeight(x, z + 16) + rawHeight(x, z - 16) - height * 4) / 64;
  const river = Math.max(
    Math.max(0, 1 - Math.abs(Math.sin(x * 0.0047 + z * 0.0032)) * 5.4),
    Math.max(0, 1 - Math.abs(Math.sin(x * 0.0095 - z * 0.0028 + 1.2)) * 8.6) * 0.58
  );
  const material = height > 420 ? "snow" : slope > 34 ? "rock" : river > 0.52 ? "silt" : "soil";
  return { x, z, distance, height, slope, curvature, river, material };
}

export async function loadErosionSolver(params = new URLSearchParams()) {
  try {
    const module = await import(params.get("erosionKit") || EROSION_URL);
    return {
      source: "terrain-erosion-solver-domain-kit",
      solveAt(input) {
        return module.solveTerrainErosionAt(input, { cutScale: 10.5, depositScale: 5.4, roughnessScale: 0.11, maxCut: 22, maxDeposit: 10 });
      }
    };
  } catch (error) {
    return {
      source: "local-response-solver",
      solveAt(input) {
        const slope = clamp(n(input.localSlope), 0, 2);
        const flow = clamp(n(input.waterFlow), 0, 1.5);
        const rain = clamp(n(input.rainfall, 0.25), 0, 1.5);
        const resistance = clamp(n(input.soilHardness, 0.4) * 0.66 + n(input.vegetationCover, 0.3) * 0.32, 0, 1);
        const cut = clamp(Math.max(0, slope * (rain + flow) + Math.max(0, n(input.curvature)) * 0.2 - resistance) * n(input.exposureTime, 1), 0, 1);
        const deposit = clamp((1 - slope) * flow * 0.42 + Math.max(0, -n(input.curvature)) * 0.18, 0, 1);
        return { heightDelta: -cut * 10.5 + deposit * 0.9, sedimentDelta: deposit * 5.4, flowStrength: clamp(flow + cut * 0.35, 0, 1), wetness: clamp(rain * 0.16 + flow * 0.48 + deposit * 0.16, 0, 1), roughnessDelta: cut * 0.11, materialHints: { exposeRock: cut * 0.72 + slope * 0.2, depositSilt: deposit, washGrass: cut, wetSoil: flow }, debug: { cut, deposit, resistance } };
      }
    };
  }
}

export function sampleTerrain(x, z, focus, erosionSolver) {
  const base = baseTerrainSample(x, z, focus);
  const rainfall = clamp(0.22 + Math.sin(x * 0.0012 + z * 0.0009) * 0.1 + base.river * 0.26, 0.04, 0.78);
  const waterFlow = clamp(base.river * 0.88 + Math.max(0, base.curvature) * 0.018 + base.slope * 0.0032, 0, 0.96);
  const soilHardness = base.material === "rock" ? 0.88 : base.material === "snow" ? 0.52 : base.material === "silt" ? 0.34 : 0.46;
  const vegetationCover = clamp(0.78 - base.slope * 0.012 - Math.max(0, base.height - 280) * 0.0012 - base.river * 0.22, 0.05, 0.84);
  const erosion = erosionSolver.solveAt({ position: { x, z }, baseHeight: base.height, localSlope: base.slope / 70, curvature: base.curvature / 26, rainfall, waterFlow, soilHardness, vegetationCover, material: base.material, exposureTime: 0.62, upstreamArea: 1 + base.river * 4.2, freezeThaw: base.material === "snow" ? 0.34 : 0.03, wind: base.distance > 2600 ? 0.24 : 0.05 });
  const striation = Math.sin(base.height * 0.035 + x * 0.016 - z * 0.011) * clamp((base.slope - 14) / 48, 0, 1) * 2.6;
  const height = base.height + n(erosion.heightDelta) * 0.78 + n(erosion.sedimentDelta) * 0.12 + striation - Math.pow(base.river, 1.8) * 18;
  return { ...base, height, erosion };
}

export function sampleColor(sample, sky = [0.68, 0.84, 0.94]) {
  const height = clamp((sample.height + 220) / 820, 0, 1);
  const slope = clamp(sample.slope / 74, 0, 1);
  const erosion = sample.erosion ?? { materialHints: {}, wetness: 0 };
  let color = cmix([0.22, 0.40, 0.22], [0.34, 0.48, 0.27], smoothstep(0.10, 0.45, 1 - height));
  color = cmix(color, [0.55, 0.50, 0.39], smoothstep(0.16, 0.64, slope));
  color = cmix(color, [0.48, 0.50, 0.48], clamp((erosion.materialHints.exposeRock ?? 0) * 0.76 + slope * 0.28, 0, 0.88));
  color = cmix(color, [0.49, 0.43, 0.30], clamp((erosion.materialHints.depositSilt ?? 0) * 0.72, 0, 0.72));
  color = cmix(color, [0.82, 0.86, 0.81], smoothstep(0.74, 0.94, height) * (1 - clamp(erosion.wetness * 0.34, 0, 0.34)));
  color = cmix(color, [0.24, 0.48, 0.57], clamp(Math.max(sample.river * 0.82, erosion.wetness * 0.56), 0, 0.72));
  color = shade(color, grain(sample.x, sample.z));
  return cmix(color, sky, smoothstep(3600, 6500, sample.distance) * 0.58);
}
