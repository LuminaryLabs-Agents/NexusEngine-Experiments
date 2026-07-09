export const COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE = `
cozy-island-storm-garden-recovery-readiness-domain
├─ freshwater-recovery-domain
│  ├─ rain-cistern-domain
│  │  └─ cozy-island-rain-cistern-grid-kit
│  └─ coconut-filter-domain
│     └─ cozy-island-coconut-filter-bed-kit
├─ shelter-medicine-domain
│  ├─ medicinal-herb-nursery-domain
│  │  └─ cozy-island-medicinal-herb-nursery-kit
│  └─ driftwood-splint-domain
│     └─ cozy-island-driftwood-splint-rack-kit
├─ reef-safe-handoff-domain
│  ├─ shell-wind-warning-domain
│  │  └─ cozy-island-shell-wind-warning-kit
│  └─ dawn-clinic-ledger-domain
│     └─ cozy-island-dawn-clinic-ledger-kit
└─ renderer-handoff
   └─ cozy-island-storm-garden-recovery-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;
export const COZY_ISLAND_STORM_GARDEN_FORBIDDEN_OWNERSHIP = ["NexusRealtime","document.","window.","HTMLElement","THREE.","WebGL","AudioContext","requestAnimationFrame","addEventListener","physics"];
const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(Number(v)) ? Number(v) : 0));
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const round = (v, d = 3) => Number(num(v).toFixed(d));
const vec = (v = {}, f = {}) => ({ x: round(num(v.x, f.x ?? 0)), y: round(num(v.y, f.y ?? 0)), z: round(num(v.z, f.z ?? 0)) });
const desc = (kind, id, position, state = {}) => ({ kind, id, position: vec(position), state });
function hash01(seed = "cozy-storm-garden") { let h = 2166136261; for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967295; }
function polar(radius, angle, y = 0) { return { x: round(Math.cos(angle) * radius), y: round(y), z: round(Math.sin(angle) * radius) }; }
function snap(input = {}) {
  const seed = input.seed ?? "cozy-island-storm-garden-recovery";
  const stormDamage = clamp01(input.stormDamage ?? input.damage ?? 0.46);
  const rainfall = clamp01(input.rainfall ?? input.rain ?? 0.52);
  const freshwater = clamp01(input.freshwater ?? input.water ?? 0.38);
  const injuries = Math.max(0, Math.round(num(input.injuries, input.guestsInjured ?? 3)));
  const herbCoverage = clamp01(input.herbCoverage ?? input.herbs ?? 0.42);
  const coconutStock = Math.max(0, Math.round(num(input.coconutStock, input.coconuts ?? 5)));
  const wind = vec(input.wind ?? { x: 0.24, y: 0, z: -0.18 });
  const tide = clamp01(input.tide ?? 0.48);
  const camp = vec(input.camp ?? { x: 6, y: 0.2, z: -8 });
  const beachRadius = num(input.beachRadius, 78);
  const lagoonRadius = num(input.lagoonRadius, 56);
  const recoveryNeed = clamp01(stormDamage * 0.25 + (1 - freshwater) * 0.22 + injuries * 0.045 + (1 - herbCoverage) * 0.18 + rainfall * 0.09 + (1 - Math.min(1, coconutStock / 8)) * 0.12);
  return { seed, stormDamage, rainfall, freshwater, injuries, herbCoverage, coconutStock, wind, tide, camp, beachRadius, lagoonRadius, recoveryNeed };
}
function radialList(s, key, count, radius, step, y, map) {
  const base = hash01(`${s.seed}:${key}`) * Math.PI * 2;
  return Array.from({ length: count }, (_, i) => map(i, polar(radius + i * step, base + i * (0.94 + step * 0.04), y)));
}
export function createCozyIslandRainCisternGridKit(input = {}) { const s = snap(input); return radialList(s, "rain-cistern", s.rainfall > 0.68 || s.freshwater < 0.34 ? 5 : 4, s.beachRadius - 30, 2.8, 0.34, (i, p) => desc("cozy-island.rain-cistern-grid", `rain-cistern-${i + 1}`, p, { catchmentPriority: round(clamp01((1 - s.freshwater) * 0.46 + s.rainfall * 0.32 + s.stormDamage * 0.12 + i * 0.02)), sealUrgency: round(clamp01(s.stormDamage * 0.42 + s.rainfall * 0.22 + Math.abs(s.wind.x) * 0.16)), cleanLiters: Math.max(6, Math.round(8 + s.rainfall * 22 - s.stormDamage * 6 + i * 2)) })); }
export function createCozyIslandCoconutFilterBedKit(input = {}) { const s = snap(input); return radialList(s, "coconut-filter", s.coconutStock < 4 ? 3 : 4, s.lagoonRadius - 18, 3.1, 0.08, (i, p) => desc("cozy-island.coconut-filter-bed", `coconut-filter-${i + 1}`, p, { charcoalDepth: round(clamp01(0.24 + s.coconutStock * 0.055 + i * 0.035)), salinityDrop: round(clamp01(s.freshwater * 0.22 + Math.min(1, s.coconutStock / 9) * 0.38 + (1 - s.tide) * 0.14)), rebuildNeed: round(clamp01(s.stormDamage * 0.34 + (1 - Math.min(1, s.coconutStock / 7)) * 0.28)) })); }
export function createCozyIslandMedicinalHerbNurseryKit(input = {}) { const s = snap(input); return radialList(s, "herb-nursery", s.injuries > 5 || s.herbCoverage < 0.3 ? 5 : 4, s.beachRadius - 42, 2.2, 0.16, (i, p) => desc("cozy-island.medicinal-herb-nursery", `herb-nursery-${i + 1}`, p, { healingYield: round(clamp01(s.herbCoverage * 0.42 + s.freshwater * 0.2 + (1 - s.stormDamage) * 0.18 + i * 0.025)), transplantUrgency: round(clamp01((1 - s.herbCoverage) * 0.44 + s.injuries * 0.045 + s.rainfall * 0.1)), patientSlots: Math.max(1, Math.round(1 + s.injuries * 0.36 + i % 2)) })); }
export function createCozyIslandDriftwoodSplintRackKit(input = {}) { const s = snap(input); return radialList(s, "splint-rack", s.injuries > 4 ? 4 : 3, s.beachRadius - 20, 3.6, 0.42, (i, p) => desc("cozy-island.driftwood-splint-rack", `splint-rack-${i + 1}`, p, { braceReadiness: round(clamp01(0.24 + s.injuries * 0.06 + (1 - s.stormDamage) * 0.24 + s.coconutStock * 0.025)), lashStrength: round(clamp01(0.3 + Math.min(1, s.coconutStock / 8) * 0.3 + (1 - Math.abs(s.wind.x)) * 0.12)), triagePriority: round(clamp01(s.injuries * 0.07 + s.stormDamage * 0.24 + i * 0.035)) })); }
export function createCozyIslandShellWindWarningKit(input = {}) { const s = snap(input); const wind = Math.abs(s.wind.x) + Math.abs(s.wind.z); return radialList(s, "shell-warning", wind > 0.55 ? 4 : 3, s.beachRadius - 5, 1.9, 1.12, (i, p) => desc("cozy-island.shell-wind-warning", `shell-warning-${i + 1}`, p, { chimeStrength: round(clamp01(wind * 0.42 + s.stormDamage * 0.16 + i * 0.02)), reefVisibility: round(clamp01((1 - s.rainfall) * 0.24 + s.freshwater * 0.16 + (1 - s.tide) * 0.22)), warningState: wind > 0.75 ? "gust alarm" : s.stormDamage > 0.68 ? "repair watch" : "steady chime" })); }
export function createCozyIslandDawnClinicLedgerKit(input = {}) { const s = snap(input); const readiness = clamp01((1 - s.recoveryNeed) * 0.36 + s.freshwater * 0.24 + s.herbCoverage * 0.2 + Math.min(1, s.coconutStock / 8) * 0.12 + (1 - s.stormDamage) * 0.08); return [desc("cozy-island.dawn-clinic-ledger", "dawn-clinic-ledger-main", { x: s.camp.x + 5, y: s.camp.y + 1.1, z: s.camp.z - 2 }, { readiness: round(readiness), recoveryNeed: round(s.recoveryNeed), cleanWaterHours: Math.max(2, Math.round(3 + s.freshwater * 18 + s.rainfall * 4 - s.injuries * 0.5)), openBeds: Math.max(1, Math.round(2 + s.herbCoverage * 5 - s.injuries * 0.2)), nextAction: readiness > 0.78 ? "open dawn clinic" : s.freshwater < 0.36 ? "seal rain cisterns" : s.herbCoverage < 0.36 ? "transplant herbs" : s.injuries > 5 ? "lash splint racks" : "post shell watch" })]; }
export function createCozyIslandStormGardenRecoveryRendererHandoffKit(readiness = {}) {
  const descriptors = [ ...(readiness.rainCisternGrids ?? []), ...(readiness.coconutFilterBeds ?? []), ...(readiness.medicinalHerbNurseries ?? []), ...(readiness.driftwoodSplintRacks ?? []), ...(readiness.shellWindWarnings ?? []), ...(readiness.dawnClinicLedgers ?? []) ];
  return { kind: "cozy-island.storm-garden-recovery.renderer-handoff", descriptorPolicy: "renderer-consumes-descriptors-only", descriptors, counts: { rainCisternGrids: readiness.rainCisternGrids?.length ?? 0, coconutFilterBeds: readiness.coconutFilterBeds?.length ?? 0, medicinalHerbNurseries: readiness.medicinalHerbNurseries?.length ?? 0, driftwoodSplintRacks: readiness.driftwoodSplintRacks?.length ?? 0, shellWindWarnings: readiness.shellWindWarnings?.length ?? 0, dawnClinicLedgers: readiness.dawnClinicLedgers?.length ?? 0, total: descriptors.length } };
}
export function createCozyIslandStormGardenRecoveryReadinessDomainKit(defaultInput = {}) {
  return { id: "cozy-island-storm-garden-recovery-readiness-domain-kit", domainTree: COZY_ISLAND_STORM_GARDEN_RECOVERY_DOMAIN_TREE, ownership: "headless snapshot-to-descriptor domain kit", atomicKits: ["cozy-island-rain-cistern-grid-kit","cozy-island-coconut-filter-bed-kit","cozy-island-medicinal-herb-nursery-kit","cozy-island-driftwood-splint-rack-kit","cozy-island-shell-wind-warning-kit","cozy-island-dawn-clinic-ledger-kit","cozy-island-storm-garden-recovery-renderer-handoff-kit"], evaluate(input = {}) {
    const snapshot = snap({ ...defaultInput, ...input });
    const readiness = { kind: "cozy-island.storm-garden-recovery.readiness", snapshot, rainCisternGrids: createCozyIslandRainCisternGridKit(snapshot), coconutFilterBeds: createCozyIslandCoconutFilterBedKit(snapshot), medicinalHerbNurseries: createCozyIslandMedicinalHerbNurseryKit(snapshot), driftwoodSplintRacks: createCozyIslandDriftwoodSplintRackKit(snapshot), shellWindWarnings: createCozyIslandShellWindWarningKit(snapshot), dawnClinicLedgers: createCozyIslandDawnClinicLedgerKit(snapshot), summary: { recoveryNeed: round(snapshot.recoveryNeed), topConcern: snapshot.freshwater < 0.36 ? "rain cisterns" : snapshot.herbCoverage < 0.36 ? "herb nursery" : snapshot.injuries > 5 ? "splint racks" : snapshot.stormDamage > 0.68 ? "shell warnings" : "dawn clinic" } };
    readiness.rendererHandoff = createCozyIslandStormGardenRecoveryRendererHandoffKit(readiness);
    return readiness;
  } };
}
