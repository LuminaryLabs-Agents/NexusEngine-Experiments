const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));
const distance = (a = {}, b = {}) => Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));

function pos(entry = {}, fallback = {}) {
  const source = entry.transform ?? entry.position ?? entry;
  return { x: Number(source.x ?? fallback.x ?? 0), z: Number(source.z ?? source.y ?? fallback.z ?? fallback.y ?? 0) };
}

function objectById(level = {}, id) {
  return stableArray(level.sceneRecipe?.objects).find((entry) => entry.id === id) ?? null;
}

function nearest(items, target) {
  return stableArray(items)
    .map((entry) => ({ entry, distance: distance(pos(entry), target) }))
    .sort((a, b) => a.distance - b.distance)[0]?.entry ?? null;
}

function factSet(input = {}) {
  return new Set(stableArray(input.session?.completedFacts));
}

function recoveryProgress(input = {}) {
  const facts = factSet(input);
  const scans = [...facts].filter((fact) => String(fact).startsWith("scan.")).length;
  const harvested = stableArray(input.session?.harvestedNodeIds).length;
  const built = stableArray(input.session?.placedStructureIds).length;
  return clamp01(
    scans * 0.08 +
    harvested * 0.08 +
    built * 0.1 +
    (facts.has("build.signal-mast.01") ? 0.14 : 0) +
    (facts.has("cargo.delivered.01") ? 0.18 : 0) +
    (facts.has("lock.gate.01") ? 0.16 : 0) +
    (input.session?.gateUnlocked ? 0.08 : 0)
  );
}

function casualtyPressure(input = {}) {
  const session = input.session ?? {};
  const elapsed = Number(input.elapsed ?? session.elapsed ?? 0);
  const phasePressure = session.phase === "pressure" ? 0.68 : session.phase === "resolved" ? 0.22 : 0.42;
  const sporeLoad = Number(session.player?.sporeLoad ?? 0) * 0.24;
  const tidePulse = (0.5 + Math.sin(elapsed * 0.13) * 0.5) * 0.16;
  return clamp01(phasePressure + sporeLoad + tidePulse - recoveryProgress(input) * 0.28);
}

function ownership(owner) {
  return {
    owner,
    rendererConsumesDescriptorsOnly: true,
    rendererConsumes: "serializable field hospital triage descriptors only",
    excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "physics", "frame loop", "storage"],
    rendererMustOwn: ["draw order", "camera projection", "canvas overlays", "input events", "frame scheduling"],
    rendererMustNotOwn: ["triage scoring", "medicine routing", "evacuation readiness", "objective truth", "session mutation", "resource accounting"]
  };
}

function descriptorCounts(descriptors = {}) {
  return Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
}

export const SIGNAL_ISLES_FIELD_HOSPITAL_TRIAGE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "signal-isles-field-hospital-triage-readiness-domain",
  subdomains: [
    {
      id: "casualty-discovery-domain",
      subdomains: [
        { id: "triage-flag-domain", kits: ["signal-isles-triage-flag-kit"] },
        { id: "medicine-cache-domain", kits: ["signal-isles-medicine-cache-kit"] }
      ]
    },
    {
      id: "care-route-domain",
      subdomains: [
        { id: "stretcher-trail-domain", subdomains: [{ id: "trail-thread-domain", kits: ["signal-isles-stretcher-trail-thread-kit"] }] },
        { id: "lantern-care-post-domain", kits: ["signal-isles-lantern-care-post-kit"] }
      ]
    },
    {
      id: "evacuation-handoff-domain",
      subdomains: [
        { id: "skiff-mooring-domain", kits: ["signal-isles-evac-skiff-mooring-kit"] },
        { id: "dawn-care-ledger-domain", kits: ["signal-isles-dawn-care-ledger-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-field-hospital-triage-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes field hospital triage descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, or frame-loop ownership"
});

export const SIGNAL_ISLES_FIELD_HOSPITAL_TRIAGE_KITS = Object.freeze([
  "signal-isles-triage-flag-kit",
  "signal-isles-medicine-cache-kit",
  "signal-isles-stretcher-trail-thread-kit",
  "signal-isles-lantern-care-post-kit",
  "signal-isles-evac-skiff-mooring-kit",
  "signal-isles-dawn-care-ledger-kit",
  "signal-isles-field-hospital-triage-renderer-handoff-kit",
  "signal-isles-field-hospital-triage-readiness-domain-kit"
]);

export function createSignalIslesTriageFlagKit() {
  return {
    id: "signal-isles-triage-flag-kit",
    domain: "signal-isles-field-hospital-triage-readiness/triage-flag",
    describe(input = {}) {
      const level = input.level ?? {};
      const pressure = casualtyPressure(input);
      const facts = factSet(input);
      return stableArray(level.scanSites).slice(0, 5).map((site, index) => {
        const p = pos(site);
        const mapped = facts.has(`scan.${site.id}`) || stableArray(input.kitStates?.scanSurvey?.completedTargetIds).includes(site.id);
        const severity = clamp01(pressure + (mapped ? -0.18 : 0.12) + index * 0.035);
        const band = severity > 0.7 ? "red" : severity > 0.42 ? "amber" : "green";
        return { id: `triage-flag-${site.id ?? index}`, kind: "field-hospital-triage-flag", x: round(p.x), z: round(p.z), severity: round(severity), mapped, band, radius: round(0.75 + severity * 1.25), active: true, color: band === "red" ? "#ff6f7a" : band === "amber" ? "#ffd36d" : "#8fffb5", rendererContract: ownership("signal-isles-triage-flag-kit") };
      });
    }
  };
}

export function createSignalIslesMedicineCacheKit() {
  return {
    id: "signal-isles-medicine-cache-kit",
    domain: "signal-isles-field-hospital-triage-readiness/medicine-cache",
    describe(input = {}) {
      const level = input.level ?? {};
      const harvested = new Set(stableArray(input.session?.harvestedNodeIds));
      const cargoDelivered = factSet(input).has("cargo.delivered.01");
      return [...stableArray(level.resourceNodes), ...stableArray(level.cargo)].slice(0, 5).map((source, index) => {
        const p = pos(source);
        const stocked = harvested.has(source.id) || cargoDelivered || input.session?.cargoCarriedId === source.id;
        const supply = clamp01((stocked ? 0.62 : 0.24) + recoveryProgress(input) * 0.3 + index * 0.025);
        return { id: `medicine-cache-${source.id ?? index}`, kind: "field-hospital-medicine-cache", x: round(p.x + Math.sin(index) * 0.5), z: round(p.z + Math.cos(index) * 0.5), stocked, supply: round(supply), radius: round(0.55 + supply), active: true, color: stocked ? "#8fffb5" : "#ffcf7a", rendererContract: ownership("signal-isles-medicine-cache-kit") };
      });
    }
  };
}

export function createSignalIslesStretcherTrailThreadKit() {
  return {
    id: "signal-isles-stretcher-trail-thread-kit",
    domain: "signal-isles-field-hospital-triage-readiness/stretcher-trail-thread",
    describe(input = {}) {
      const level = input.level ?? {};
      const destination = objectById(level, "final-beacon")?.transform ?? stableArray(level.gates)[0] ?? { x: 0, z: 0 };
      const sources = [...stableArray(level.scanSites).slice(0, 3), ...stableArray(level.resourceNodes).slice(0, 2)];
      const pressure = casualtyPressure(input);
      const progress = recoveryProgress(input);
      return sources.map((source, index) => {
        const from = pos(source);
        const waypoint = pos(nearest(level.gates, from) ?? destination);
        const to = index % 2 === 0 ? waypoint : pos(destination);
        const clarity = clamp01(0.28 + progress * 0.44 + (1 - pressure) * 0.18 + index * 0.03);
        return { id: `stretcher-trail-${source.id ?? index}`, kind: "field-hospital-stretcher-trail-thread", from: { x: round(from.x), z: round(from.z) }, to: { x: round(to.x), z: round(to.z) }, clarity: round(clarity), active: true, color: clarity > 0.62 ? "#8fffb5" : "#6df3ff", rendererContract: ownership("signal-isles-stretcher-trail-thread-kit") };
      });
    }
  };
}

export function createSignalIslesLanternCarePostKit() {
  return {
    id: "signal-isles-lantern-care-post-kit",
    domain: "signal-isles-field-hospital-triage-readiness/lantern-care-post",
    describe(input = {}) {
      const level = input.level ?? {};
      const placed = new Set(stableArray(input.session?.placedStructureIds));
      return [...stableArray(level.buildSites), ...stableArray(level.gates)].slice(0, 4).map((site, index) => {
        const p = pos(site);
        const lit = placed.has(site.structureId ?? site.id) || Boolean(input.session?.gateUnlocked && String(site.id).includes("gate"));
        const charge = clamp01((lit ? 0.68 : 0.22) + recoveryProgress(input) * 0.26 + (1 - casualtyPressure(input)) * 0.08);
        return { id: `lantern-care-post-${site.structureId ?? site.id ?? index}`, kind: "field-hospital-lantern-care-post", x: round(p.x), z: round(p.z), lit, charge: round(charge), radius: round(0.85 + charge * 1.2), active: true, color: lit ? "#8fffb5" : "#ffd36d", rendererContract: ownership("signal-isles-lantern-care-post-kit") };
      });
    }
  };
}

export function createSignalIslesEvacSkiffMooringKit() {
  return {
    id: "signal-isles-evac-skiff-mooring-kit",
    domain: "signal-isles-field-hospital-triage-readiness/evac-skiff-mooring",
    describe(input = {}) {
      const level = input.level ?? {};
      const facts = factSet(input);
      const sources = [...stableArray(level.cargo), ...stableArray(level.gates), objectById(level, "final-beacon")].filter(Boolean).slice(0, 4);
      return sources.map((source, index) => {
        const p = pos(source);
        const ready = facts.has("cargo.delivered.01") || (index > 0 && input.session?.gateUnlocked);
        const capacity = clamp01((ready ? 0.6 : 0.28) + recoveryProgress(input) * 0.34 + index * 0.025);
        return { id: `evac-skiff-mooring-${source.id ?? index}`, kind: "field-hospital-evac-skiff-mooring", x: round(p.x + 0.55), z: round(p.z - 0.55), ready, capacity: round(capacity), radius: round(0.7 + capacity * 1.1), active: true, color: ready ? "#8fffb5" : "#6df3ff", rendererContract: ownership("signal-isles-evac-skiff-mooring-kit") };
      });
    }
  };
}

export function createSignalIslesDawnCareLedgerKit() {
  return {
    id: "signal-isles-dawn-care-ledger-kit",
    domain: "signal-isles-field-hospital-triage-readiness/dawn-care-ledger",
    describe(input = {}) {
      const level = input.level ?? {};
      const exit = objectById(level, "final-beacon")?.transform ?? stableArray(level.gates)[0] ?? { x: 0, z: 0 };
      const p = pos(exit);
      const readiness = clamp01(recoveryProgress(input) * 0.76 + (1 - casualtyPressure(input)) * 0.18 + (stableArray(input.sequence?.waitingFor).length === 0 ? 0.08 : 0));
      const phase = readiness > 0.72 ? "handoff" : casualtyPressure(input) > 0.62 ? "critical" : "staging";
      return [{ id: "field-hospital-dawn-care-ledger", kind: "field-hospital-dawn-care-ledger", x: round(p.x + 1.4), z: round(p.z - 1.4), readiness: round(readiness), waitingFor: stableArray(input.sequence?.waitingFor), phase, active: true, radius: round(1.1 + readiness * 1.4), color: phase === "handoff" ? "#8fffb5" : phase === "critical" ? "#ff6f7a" : "#ffd36d", rendererContract: ownership("signal-isles-dawn-care-ledger-kit") }];
    }
  };
}

export function createSignalIslesFieldHospitalTriageRendererHandoffKit() {
  return {
    id: "signal-isles-field-hospital-triage-renderer-handoff-kit",
    domain: "signal-isles-field-hospital-triage-readiness/renderer-handoff",
    describe(descriptors = {}) {
      const counts = descriptorCounts(descriptors);
      return {
        id: "signal-isles-field-hospital-triage-renderer-handoff",
        kind: "renderer-handoff",
        contract: ownership("signal-isles-field-hospital-triage-renderer-handoff-kit"),
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: { ...counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) }
      };
    }
  };
}

export function createSignalIslesFieldHospitalTriageReadinessDomainKit() {
  const triageFlagKit = createSignalIslesTriageFlagKit();
  const medicineCacheKit = createSignalIslesMedicineCacheKit();
  const stretcherTrailThreadKit = createSignalIslesStretcherTrailThreadKit();
  const lanternCarePostKit = createSignalIslesLanternCarePostKit();
  const evacSkiffMooringKit = createSignalIslesEvacSkiffMooringKit();
  const dawnCareLedgerKit = createSignalIslesDawnCareLedgerKit();
  const rendererHandoffKit = createSignalIslesFieldHospitalTriageRendererHandoffKit();

  return {
    id: "signal-isles-field-hospital-triage-readiness-domain-kit",
    domain: "signal-isles-field-hospital-triage-readiness-domain",
    tree: SIGNAL_ISLES_FIELD_HOSPITAL_TRIAGE_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const triageFlags = triageFlagKit.describe(input);
      const medicineCaches = medicineCacheKit.describe(input);
      const stretcherTrailThreads = stretcherTrailThreadKit.describe(input);
      const lanternCarePosts = lanternCarePostKit.describe(input);
      const evacSkiffMoorings = evacSkiffMooringKit.describe(input);
      const dawnCareLedgers = dawnCareLedgerKit.describe(input);
      const pressure = casualtyPressure(input);
      const progress = recoveryProgress(input);
      const descriptors = { triageFlags, medicineCaches, stretcherTrailThreads, lanternCarePosts, evacSkiffMoorings, dawnCareLedgers };
      const rendererHandoff = rendererHandoffKit.describe(descriptors);
      const readiness = clamp01(progress * 0.68 + (1 - pressure) * 0.2 + (rendererHandoff.counts.total > 12 ? 0.12 : 0.06));
      const missionState = readiness > 0.72 ? "field-hospital-ready" : pressure > 0.64 ? "medicine-scarce" : progress > 0.38 ? "stretcher-route-staged" : "clinic-unmapped";
      return {
        domain: "signal-isles-field-hospital-triage-readiness-domain",
        readiness: round(readiness),
        casualtyPressure: round(pressure),
        recoveryProgress: round(progress),
        missionState,
        triageFlags,
        medicineCaches,
        stretcherTrailThreads,
        lanternCarePosts,
        evacSkiffMoorings,
        dawnCareLedgers,
        rendererHandoff,
        descriptorCounts: rendererHandoff.counts,
        ownership: ownership("signal-isles-field-hospital-triage-readiness-domain-kit")
      };
    }
  };
}
