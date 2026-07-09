const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => ((hashText(`${seed}:${index}:${salt}`) % 10000) / 10000);
const body = (snapshot = {}) => snapshot.body ?? {};
const input = (snapshot = {}) => snapshot.input ?? {};
const position = (snapshot = {}) => body(snapshot).position ?? {};
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0);

export const OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE = `open-above-alpine-clinic-readiness-domain
├─ patient-location-domain
│  ├─ stranded-climber-domain
│  │  └─ open-above-stranded-climber-beacon-kit
│  └─ hypothermia-triage-domain
│     └─ open-above-hypothermia-triage-marker-kit
├─ flight-safety-domain
│  ├─ wind-shear-gap-domain
│  │  └─ open-above-wind-shear-gap-kit
│  └─ rope-basket-domain
│     └─ open-above-rope-basket-drop-kit
├─ clinic-handoff-domain
│  ├─ medicine-cache-domain
│  │  └─ open-above-medicine-cache-glider-kit
│  └─ helipad-smoke-domain
│     └─ open-above-helipad-smoke-signal-kit
└─ renderer-handoff
   └─ open-above-alpine-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const OPEN_ABOVE_ALPINE_CLINIC_KITS = Object.freeze([
  "open-above-stranded-climber-beacon-kit",
  "open-above-hypothermia-triage-marker-kit",
  "open-above-wind-shear-gap-kit",
  "open-above-rope-basket-drop-kit",
  "open-above-medicine-cache-glider-kit",
  "open-above-helipad-smoke-signal-kit",
  "open-above-alpine-clinic-renderer-handoff-kit",
  "open-above-alpine-clinic-readiness-domain-kit"
]);

export const OPEN_ABOVE_ALPINE_CLINIC_OWNERSHIP = Object.freeze({
  renderer: false,
  dom: false,
  browserInput: false,
  three: false,
  webgl: false,
  audio: false,
  assetLoading: false,
  frameLoop: false,
  physics: false,
  output: "renderer-neutral-descriptors"
});

export function createOpenAboveStrandedClimberBeaconKit(options = {}) {
  const seed = options.seed ?? "open-above-stranded-climbers";
  const climbers = Math.max(3, Math.floor(n(options.climbers, 4)));
  return {
    id: "open-above-stranded-climber-beacon-kit",
    domain: "open-above.alpine-clinic.patient-location.stranded-climber",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitude01 = clamp(n(b.altitude, n(b.position?.y, 180)) / 620);
      const clearanceDebt = clamp(1 - n(b.clearance, 120) / 280);
      const frameBand = Math.floor(n(snapshot.frame) / 90);
      return Array.from({ length: climbers }, (_, index) => {
        const urgency = clamp(0.2 + altitude01 * 0.22 + clearanceDebt * 0.27 + wave01(seed, index, frameBand) * 0.23);
        return {
          id: `stranded-climber-beacon:${index}`,
          domain: "open-above.alpine-clinic.patient-location.stranded-climber.beacon",
          kind: "stranded-climber-beacon",
          x01: clamp(0.16 + index * (0.68 / Math.max(1, climbers - 1)) + (wave01(seed, index, 2) - 0.5) * 0.045),
          y01: clamp(0.18 + wave01(seed, index, 3) * 0.36 - altitude01 * 0.05),
          radius01: clamp(0.03 + urgency * 0.055, 0.03, 0.095),
          urgency,
          rescueCall: urgency > 0.67 ? "immediate pickup" : urgency > 0.43 ? "circle and mark" : "monitor ridge",
          opacity: clamp(0.18 + urgency * 0.62)
        };
      });
    }
  };
}

export function createOpenAboveHypothermiaTriageMarkerKit(options = {}) {
  const seed = options.seed ?? "open-above-hypothermia-triage";
  const markers = Math.max(3, Math.floor(n(options.markers, 4)));
  return {
    id: "open-above-hypothermia-triage-marker-kit",
    domain: "open-above.alpine-clinic.patient-location.hypothermia-triage",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const cold = clamp(n(b.altitude, n(b.position?.y, 180)) / 680 + Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 160);
      return Array.from({ length: markers }, (_, index) => {
        const hypothermiaRisk = clamp(0.18 + cold * 0.42 + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 1.4)) * 0.22 - index * 0.025);
        return {
          id: `hypothermia-triage-marker:${index}`,
          domain: "open-above.alpine-clinic.patient-location.hypothermia-triage.marker",
          kind: "hypothermia-triage-marker",
          x01: clamp(0.23 + index * (0.54 / Math.max(1, markers - 1))),
          y01: clamp(0.68 - hypothermiaRisk * 0.22 + (wave01(seed, index, 4) - 0.5) * 0.06),
          radius01: clamp(0.026 + hypothermiaRisk * 0.05, 0.026, 0.088),
          hypothermiaRisk,
          triageState: hypothermiaRisk > 0.64 ? "warm immediately" : hypothermiaRisk > 0.42 ? "prep blankets" : "stable",
          opacity: clamp(0.14 + hypothermiaRisk * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveWindShearGapKit(options = {}) {
  const seed = options.seed ?? "open-above-wind-shear-gaps";
  const gaps = Math.max(4, Math.floor(n(options.gaps, 5)));
  return {
    id: "open-above-wind-shear-gap-kit",
    domain: "open-above.alpine-clinic.flight-safety.wind-shear-gap",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const bankRisk = clamp(Math.abs(n(b.rotation?.roll, 0)) * 0.76);
      const speedPressure = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const boostPenalty = input(snapshot).boost ? 0.08 : 0;
      return Array.from({ length: gaps }, (_, index) => {
        const shearSafety = clamp(0.74 - bankRisk * 0.26 - speedPressure * 0.14 - boostPenalty + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 2)) * 0.2);
        return {
          id: `wind-shear-gap:${index}`,
          domain: "open-above.alpine-clinic.flight-safety.wind-shear-gap.slot",
          kind: "wind-shear-gap",
          side: index % 2 === 0 ? "left" : "right",
          x01: index % 2 === 0 ? clamp(0.1 + index * 0.045) : clamp(0.9 - index * 0.045),
          y01: clamp(0.22 + index * 0.105),
          length01: clamp(0.12 + shearSafety * 0.33, 0.12, 0.47),
          shearSafety,
          crossCall: shearSafety > 0.66 ? "thread gap" : shearSafety > 0.42 ? "hold wing" : "avoid shear",
          opacity: clamp(0.1 + shearSafety * 0.55)
        };
      });
    }
  };
}

export function createOpenAboveRopeBasketDropKit(options = {}) {
  const seed = options.seed ?? "open-above-rope-basket-drops";
  const baskets = Math.max(3, Math.floor(n(options.baskets, 4)));
  return {
    id: "open-above-rope-basket-drop-kit",
    domain: "open-above.alpine-clinic.flight-safety.rope-basket",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const clearance01 = clamp(n(b.clearance, 140) / 320);
      const levelWing = clamp(1 - Math.abs(n(b.rotation?.roll, 0)) * 0.95);
      const baseReadiness = clamp(levelWing * 0.38 + (1 - Math.abs(clearance01 - 0.46)) * 0.34 + (1 - speed01) * 0.2 + (input(snapshot).pitchDown ? 0.06 : 0));
      return Array.from({ length: baskets }, (_, index) => {
        const dropReadiness = clamp(baseReadiness + (wave01(seed, index, Math.floor(n(snapshot.frame) / 80)) - 0.5) * 0.16);
        return {
          id: `rope-basket-drop:${index}`,
          domain: "open-above.alpine-clinic.flight-safety.rope-basket.drop",
          kind: "rope-basket-drop",
          x01: clamp(0.2 + index * (0.6 / Math.max(1, baskets - 1)) + (wave01(seed, index, 6) - 0.5) * 0.05),
          y01: clamp(0.75 - dropReadiness * 0.24 + index * 0.012),
          radius01: clamp(0.034 + dropReadiness * 0.072, 0.034, 0.12),
          dropReadiness,
          basketCall: dropReadiness > 0.65 ? "lower basket" : dropReadiness > 0.42 ? "line up" : "go around",
          opacity: clamp(0.13 + dropReadiness * 0.62)
        };
      });
    }
  };
}

export function createOpenAboveMedicineCacheGliderKit(options = {}) {
  const seed = options.seed ?? "open-above-medicine-cache-gliders";
  const caches = Math.max(3, Math.floor(n(options.caches, 4)));
  return {
    id: "open-above-medicine-cache-glider-kit",
    domain: "open-above.alpine-clinic.clinic-handoff.medicine-cache",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const glideStability = clamp(1 - Math.abs(n(b.rotation?.roll, 0)) * 0.48 + clamp(n(b.velocity?.y, 0) / 60) * 0.12);
      return Array.from({ length: caches }, (_, index) => {
        const cacheNeed = clamp(0.26 + (1 - glideStability) * 0.3 + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 1.2)) * 0.28);
        return {
          id: `medicine-cache-glider:${index}`,
          domain: "open-above.alpine-clinic.clinic-handoff.medicine-cache.cache",
          kind: "medicine-cache-glider",
          x01: clamp(0.18 + index * (0.64 / Math.max(1, caches - 1))),
          y01: clamp(0.36 + Math.sin(index + n(snapshot.elapsed) * 0.8) * 0.09),
          length01: clamp(0.07 + cacheNeed * 0.16, 0.07, 0.24),
          cacheNeed,
          glideCall: cacheNeed > 0.62 ? "deliver serum" : cacheNeed > 0.42 ? "prep cache" : "cache reserved",
          opacity: clamp(0.12 + cacheNeed * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveHelipadSmokeSignalKit(options = {}) {
  const signals = Math.max(4, Math.floor(n(options.signals, 5)));
  return {
    id: "open-above-helipad-smoke-signal-kit",
    domain: "open-above.alpine-clinic.clinic-handoff.helipad-smoke",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const distance = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      const distance01 = clamp(distance / 1800);
      return Array.from({ length: signals }, (_, index) => ({
        id: `helipad-smoke-signal:${index}`,
        domain: "open-above.alpine-clinic.clinic-handoff.helipad-smoke.signal",
        kind: "helipad-smoke-signal",
        x01: clamp(0.5 + Math.sin(bearing) * 0.17 + (index - (signals - 1) / 2) * 0.032),
        y01: clamp(0.83 - index * 0.07 - alignment * 0.085),
        alignment,
        distance: Math.round(distance),
        distance01,
        smokeCall: alignment > 0.72 ? "helipad lined" : distance01 > 0.58 ? "return to clinic" : "turn smokeward",
        opacity: clamp(0.12 + alignment * 0.52 - index * 0.012)
      }));
    }
  };
}

export function createOpenAboveAlpineClinicRendererHandoffKit() {
  return {
    id: "open-above-alpine-clinic-renderer-handoff-kit",
    domain: "open-above.alpine-clinic.renderer-handoff",
    compose(groups = {}) {
      const descriptors = {
        strandedClimberBeacons: clone(groups.strandedClimberBeacons ?? []),
        hypothermiaTriageMarkers: clone(groups.hypothermiaTriageMarkers ?? []),
        windShearGaps: clone(groups.windShearGaps ?? []),
        ropeBasketDrops: clone(groups.ropeBasketDrops ?? []),
        medicineCacheGliders: clone(groups.medicineCacheGliders ?? []),
        helipadSmokeSignals: clone(groups.helipadSmokeSignals ?? [])
      };
      return {
        id: "open-above-alpine-clinic-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        policy: "presentation reads descriptor buckets; domain owns no renderer, DOM, browser input, external graphics, audio, asset loading, physics, or frame loop",
        descriptors,
        counts: {
          strandedClimberBeacons: descriptors.strandedClimberBeacons.length,
          hypothermiaTriageMarkers: descriptors.hypothermiaTriageMarkers.length,
          windShearGaps: descriptors.windShearGaps.length,
          ropeBasketDrops: descriptors.ropeBasketDrops.length,
          medicineCacheGliders: descriptors.medicineCacheGliders.length,
          helipadSmokeSignals: descriptors.helipadSmokeSignals.length,
          total: totalCount(descriptors)
        }
      };
    }
  };
}

export function createOpenAboveAlpineClinicReadinessDomainKit(options = {}) {
  const strandedClimbers = createOpenAboveStrandedClimberBeaconKit(options.strandedClimbers);
  const hypothermiaTriage = createOpenAboveHypothermiaTriageMarkerKit(options.hypothermiaTriage);
  const windShear = createOpenAboveWindShearGapKit(options.windShear);
  const ropeBasket = createOpenAboveRopeBasketDropKit(options.ropeBasket);
  const medicineCache = createOpenAboveMedicineCacheGliderKit(options.medicineCache);
  const helipadSmoke = createOpenAboveHelipadSmokeSignalKit(options.helipadSmoke);
  const rendererHandoff = createOpenAboveAlpineClinicRendererHandoffKit();
  return {
    id: "open-above-alpine-clinic-readiness-domain-kit",
    domain: "open-above.alpine-clinic",
    kits: [...OPEN_ABOVE_ALPINE_CLINIC_KITS],
    tree: OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE,
    ownership: OPEN_ABOVE_ALPINE_CLINIC_OWNERSHIP,
    compose(snapshot = {}) {
      const groups = {
        strandedClimberBeacons: strandedClimbers.describe(snapshot),
        hypothermiaTriageMarkers: hypothermiaTriage.describe(snapshot),
        windShearGaps: windShear.describe(snapshot),
        ropeBasketDrops: ropeBasket.describe(snapshot),
        medicineCacheGliders: medicineCache.describe(snapshot),
        helipadSmokeSignals: helipadSmoke.describe(snapshot)
      };
      const handoff = rendererHandoff.compose(groups);
      const highestUrgency = Math.max(0, ...groups.strandedClimberBeacons.map((item) => item.urgency ?? 0));
      const basketReady = Math.max(0, ...groups.ropeBasketDrops.map((item) => item.dropReadiness ?? 0));
      const smokeAlignment = Math.max(0, ...groups.helipadSmokeSignals.map((item) => item.alignment ?? 0));
      return {
        id: "open-above-alpine-clinic-readiness",
        domain: "open-above.alpine-clinic",
        tree: OPEN_ABOVE_ALPINE_CLINIC_READINESS_TREE,
        ownership: OPEN_ABOVE_ALPINE_CLINIC_OWNERSHIP,
        groups,
        rendererHandoff: handoff,
        summary: {
          descriptorCount: handoff.counts.total,
          highestUrgency,
          basketReady,
          smokeAlignment,
          missionState: basketReady > 0.62 && smokeAlignment > 0.65 ? "extract now" : highestUrgency > 0.62 ? "stabilize climbers" : "survey clinic route"
        }
      };
    }
  };
}
