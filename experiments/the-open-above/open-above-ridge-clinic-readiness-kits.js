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
const count = (items) => Array.isArray(items) ? items.length : 0;
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + count(value), 0);

export const OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE = `open-above-ridge-clinic-readiness-domain
├─ landing-safety-domain
│  ├─ windsock-strip-domain
│  │  └─ open-above-windsock-landing-strip-kit
│  └─ rope-guide-domain
│     └─ open-above-rope-guide-lane-kit
├─ patient-support-domain
│  ├─ oxygen-cache-domain
│  │  └─ open-above-oxygen-crate-cache-kit
│  └─ stretcher-circle-domain
│     └─ open-above-stretcher-circle-marker-kit
├─ extraction-clinic-domain
│  ├─ clinic-flare-domain
│  │  └─ open-above-clinic-flare-triad-kit
│  └─ dawn-transfer-domain
│     └─ open-above-dawn-transfer-roster-kit
└─ renderer-handoff
   └─ open-above-ridge-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createOpenAboveWindsockLandingStripKit(options = {}) {
  const seed = options.seed ?? "open-above-windsock-landing-strip";
  const strips = Math.max(3, Math.floor(n(options.strips, 4)));
  return {
    id: "open-above-windsock-landing-strip-kit",
    domain: "open-above.ridge-clinic.landing-safety.windsock-strip",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const rollRisk = clamp(Math.abs(n(b.rotation?.roll, 0)) * 0.85);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const sinkRisk = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, n(b.velocity?.y, 0)))) / 70);
      const frameBand = Math.floor(n(snapshot.frame) / 90);
      return Array.from({ length: strips }, (_, index) => {
        const crosswind = clamp(0.18 + rollRisk * 0.34 + speed01 * 0.18 + wave01(seed, index, frameBand) * 0.26);
        const safe = clamp(1 - crosswind * 0.62 - sinkRisk * 0.22 + wave01(seed, index, 4) * 0.12);
        return {
          id: `windsock-landing-strip:${index}`,
          domain: "open-above.ridge-clinic.landing-safety.windsock-strip.marker",
          kind: "windsock-landing-strip",
          x01: clamp(0.16 + index * (0.68 / Math.max(1, strips - 1)) + (wave01(seed, index, 2) - 0.5) * 0.045),
          y01: clamp(0.28 + wave01(seed, index, 7) * 0.28),
          length01: clamp(0.14 + safe * 0.24, 0.14, 0.38),
          crosswind,
          safety: safe,
          call: safe > 0.68 ? "land on strip" : safe > 0.44 ? "circle once" : "hold altitude",
          opacity: clamp(0.14 + safe * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveRopeGuideLaneKit(options = {}) {
  const lanes = Math.max(4, Math.floor(n(options.lanes, 5)));
  return {
    id: "open-above-rope-guide-lane-kit",
    domain: "open-above.ridge-clinic.landing-safety.rope-guide",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance01 = clamp(n(b.clearance, 160) / 320);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const laneConfidence = clamp(0.28 + (1 - Math.abs(clearance01 - 0.38)) * 0.32 + (1 - speed01) * 0.22 + (input(snapshot).pitchDown ? 0.06 : 0));
      return Array.from({ length: lanes }, (_, index) => ({
        id: `rope-guide-lane:${index}`,
        domain: "open-above.ridge-clinic.landing-safety.rope-guide.lane",
        kind: "rope-guide-lane",
        x01: clamp(0.5 + (index - (lanes - 1) / 2) * 0.072),
        y01: clamp(0.22 + index * 0.105),
        length01: clamp(0.12 + laneConfidence * 0.26, 0.12, 0.42),
        laneConfidence,
        guideCall: laneConfidence > 0.64 ? "follow rope lights" : laneConfidence > 0.42 ? "reduce speed" : "missed approach",
        opacity: clamp(0.13 + laneConfidence * 0.55 - index * 0.01)
      }));
    }
  };
}

export function createOpenAboveOxygenCrateCacheKit(options = {}) {
  const seed = options.seed ?? "open-above-oxygen-crate-cache";
  const crates = Math.max(3, Math.floor(n(options.crates, 4)));
  return {
    id: "open-above-oxygen-crate-cache-kit",
    domain: "open-above.ridge-clinic.patient-support.oxygen-cache",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitudeNeed = clamp(n(b.altitude, n(b.position?.y, 180)) / 560);
      const coldNeed = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 70 + Math.abs(n(b.rotation?.pitch, 0)) * 0.28);
      return Array.from({ length: crates }, (_, index) => {
        const oxygenDebt = clamp(0.18 + altitudeNeed * 0.34 + coldNeed * 0.2 + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 1.5)) * 0.22);
        return {
          id: `oxygen-crate-cache:${index}`,
          domain: "open-above.ridge-clinic.patient-support.oxygen-cache.crate",
          kind: "oxygen-crate-cache",
          x01: clamp(0.18 + index * (0.64 / Math.max(1, crates - 1))),
          y01: clamp(0.73 - oxygenDebt * 0.24 + (wave01(seed, index, 5) - 0.5) * 0.045),
          radius01: clamp(0.032 + oxygenDebt * 0.055, 0.032, 0.098),
          oxygenDebt,
          cacheCall: oxygenDebt > 0.64 ? "drop oxygen" : oxygenDebt > 0.42 ? "stage oxygen" : "cache stable",
          opacity: clamp(0.15 + oxygenDebt * 0.56)
        };
      });
    }
  };
}

export function createOpenAboveStretcherCircleMarkerKit(options = {}) {
  const seed = options.seed ?? "open-above-stretcher-circle-marker";
  const circles = Math.max(2, Math.floor(n(options.circles, 3)));
  return {
    id: "open-above-stretcher-circle-marker-kit",
    domain: "open-above.ridge-clinic.patient-support.stretcher-circle",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const clearance01 = clamp(n(b.clearance, 160) / 280);
      const stableRoll = clamp(1 - Math.abs(n(b.rotation?.roll, 0)) * 0.9);
      return Array.from({ length: circles }, (_, index) => {
        const readiness = clamp(0.18 + (1 - speed01) * 0.26 + (1 - Math.abs(clearance01 - 0.36)) * 0.3 + stableRoll * 0.2 + wave01(seed, index, 3) * 0.08);
        return {
          id: `stretcher-circle-marker:${index}`,
          domain: "open-above.ridge-clinic.patient-support.stretcher-circle.marker",
          kind: "stretcher-circle-marker",
          x01: clamp(0.3 + index * (0.4 / Math.max(1, circles - 1)) + (wave01(seed, index, 9) - 0.5) * 0.05),
          y01: clamp(0.62 - readiness * 0.14 + index * 0.05),
          radius01: clamp(0.046 + readiness * 0.072, 0.046, 0.13),
          readiness,
          triageCall: readiness > 0.68 ? "lower stretcher" : readiness > 0.44 ? "align basket" : "keep circling",
          opacity: clamp(0.16 + readiness * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveClinicFlareTriadKit(options = {}) {
  const flares = Math.max(3, Math.floor(n(options.flares, 6)));
  return {
    id: "open-above-clinic-flare-triad-kit",
    domain: "open-above.ridge-clinic.extraction-clinic.clinic-flare",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const distance = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      const distance01 = clamp(distance / 1800);
      return Array.from({ length: flares }, (_, index) => ({
        id: `clinic-flare-triad:${index}`,
        domain: "open-above.ridge-clinic.extraction-clinic.clinic-flare.flare",
        kind: "clinic-flare-triad",
        x01: clamp(0.5 + Math.sin(bearing + index * 0.12) * 0.16 + (index - (flares - 1) / 2) * 0.03),
        y01: clamp(0.82 - index * 0.056 - alignment * 0.07),
        alignment,
        distance: Math.round(distance),
        distance01,
        flareCall: alignment > 0.72 ? "clinic in sight" : distance01 > 0.55 ? "return to ridge" : "turn toward flare",
        opacity: clamp(0.11 + alignment * 0.52 - index * 0.012)
      }));
    }
  };
}

export function createOpenAboveDawnTransferRosterKit(options = {}) {
  const seed = options.seed ?? "open-above-dawn-transfer-roster";
  const rosterSlots = Math.max(4, Math.floor(n(options.rosterSlots, 5)));
  return {
    id: "open-above-dawn-transfer-roster-kit",
    domain: "open-above.ridge-clinic.extraction-clinic.dawn-transfer",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const elapsedBand = Math.floor(n(snapshot.elapsed) / 3);
      const clearance01 = clamp(n(b.clearance, 160) / 360);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const baseLoad = clamp(0.2 + clearance01 * 0.18 + speed01 * 0.16 + Math.abs(n(b.rotation?.roll, 0)) * 0.2);
      return Array.from({ length: rosterSlots }, (_, index) => {
        const transferPressure = clamp(baseLoad + wave01(seed, index, elapsedBand) * 0.28 + index * 0.025);
        return {
          id: `dawn-transfer-roster:${index}`,
          domain: "open-above.ridge-clinic.extraction-clinic.dawn-transfer.slot",
          kind: "dawn-transfer-roster",
          x01: clamp(0.13 + index * (0.74 / Math.max(1, rosterSlots - 1))),
          y01: clamp(0.9 - transferPressure * 0.12),
          radius01: clamp(0.022 + transferPressure * 0.036, 0.022, 0.07),
          transferPressure,
          rosterCall: transferPressure > 0.68 ? "prioritize dawn transfer" : transferPressure > 0.42 ? "monitor patient" : "stable wait",
          opacity: clamp(0.12 + transferPressure * 0.54)
        };
      });
    }
  };
}

export function createOpenAboveRidgeClinicRendererHandoffKit() {
  return {
    id: "open-above-ridge-clinic-renderer-handoff-kit",
    domain: "open-above.ridge-clinic.renderer-handoff",
    compose(groups = {}) {
      const descriptors = {
        windsockLandingStrips: clone(groups.windsockLandingStrips ?? []),
        ropeGuideLanes: clone(groups.ropeGuideLanes ?? []),
        oxygenCrateCaches: clone(groups.oxygenCrateCaches ?? []),
        stretcherCircleMarkers: clone(groups.stretcherCircleMarkers ?? []),
        clinicFlareTriads: clone(groups.clinicFlareTriads ?? []),
        dawnTransferRosters: clone(groups.dawnTransferRosters ?? [])
      };
      return {
        id: "open-above-ridge-clinic-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererOwns: ["presentation placement", "surface styling", "overlay timing"],
        rendererDoesNotOwn: ["clinic readiness truth", "landing scoring", "flight physics", "browser input", "asset loading", "frame-loop ownership"],
        descriptors,
        flatDescriptors: Object.values(descriptors).flat(),
        counts: {
          windsockLandingStrips: count(descriptors.windsockLandingStrips),
          ropeGuideLanes: count(descriptors.ropeGuideLanes),
          oxygenCrateCaches: count(descriptors.oxygenCrateCaches),
          stretcherCircleMarkers: count(descriptors.stretcherCircleMarkers),
          clinicFlareTriads: count(descriptors.clinicFlareTriads),
          dawnTransferRosters: count(descriptors.dawnTransferRosters),
          total: totalCount(descriptors)
        }
      };
    }
  };
}

export function createOpenAboveRidgeClinicReadinessDomainKit(options = {}) {
  const windsocks = options.windsocks ?? createOpenAboveWindsockLandingStripKit(options.windsockOptions);
  const ropes = options.ropes ?? createOpenAboveRopeGuideLaneKit(options.ropeOptions);
  const oxygen = options.oxygen ?? createOpenAboveOxygenCrateCacheKit(options.oxygenOptions);
  const stretchers = options.stretchers ?? createOpenAboveStretcherCircleMarkerKit(options.stretcherOptions);
  const flares = options.flares ?? createOpenAboveClinicFlareTriadKit(options.flareOptions);
  const roster = options.roster ?? createOpenAboveDawnTransferRosterKit(options.rosterOptions);
  const handoff = options.handoff ?? createOpenAboveRidgeClinicRendererHandoffKit(options.handoffOptions);
  return {
    id: "open-above-ridge-clinic-readiness-domain-kit",
    domain: "open-above.ridge-clinic-readiness",
    tree: OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE,
    compose(snapshot = {}) {
      const groups = {
        windsockLandingStrips: windsocks.describe(snapshot),
        ropeGuideLanes: ropes.describe(snapshot),
        oxygenCrateCaches: oxygen.describe(snapshot),
        stretcherCircleMarkers: stretchers.describe(snapshot),
        clinicFlareTriads: flares.describe(snapshot),
        dawnTransferRosters: roster.describe(snapshot)
      };
      const rendererHandoff = handoff.compose(groups);
      const landingConfidence = groups.windsockLandingStrips.reduce((max, item) => Math.max(max, item.safety ?? 0), 0);
      const patientPressure = groups.oxygenCrateCaches.reduce((max, item) => Math.max(max, item.oxygenDebt ?? 0), 0);
      const transferPressure = groups.dawnTransferRosters.reduce((max, item) => Math.max(max, item.transferPressure ?? 0), 0);
      return {
        id: "open-above-ridge-clinic-readiness",
        version: "2026-07-09-ridge-clinic-readiness",
        tree: OPEN_ABOVE_RIDGE_CLINIC_READINESS_TREE,
        groups,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          landingConfidence,
          patientPressure,
          transferPressure,
          readiness: clamp(landingConfidence * 0.48 + (1 - patientPressure) * 0.24 + (1 - transferPressure) * 0.28),
          clinicCall: landingConfidence > 0.68 && patientPressure > 0.55 ? "land and transfer" : landingConfidence > 0.44 ? "stage ridge clinic" : "hold above ridge"
        }
      };
    }
  };
}
