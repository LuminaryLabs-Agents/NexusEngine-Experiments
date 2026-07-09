const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 53.113 + salt * 91.71) * 43758.5453;
  return x - Math.floor(x);
};

const kitBoundary = (owner) => ({
  owner,
  hostSurface: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  consumerReceives: "serializable Sora cloud clinic triage readiness descriptors only",
  consumerMustNotOwn: [
    "clinic truth",
    "patient truth",
    "flight control state",
    "renderer implementation",
    "DOM implementation",
    "browser input implementation",
    "graphics runtime implementation",
    "audio implementation",
    "asset loading",
    "main frame loop",
    "physics simulation",
    "storage"
  ]
});

export const SORA_CLOUD_CLINIC_TRIAGE_READINESS_DOMAIN_TREE = `sora-cloud-clinic-triage-readiness-domain
├─ arrival-triage-domain
│  ├─ cloud-clinic-pad-domain
│  │  └─ sora-cloud-clinic-landing-pad-kit
│  └─ pulse-kite-domain
│     └─ sora-pulse-kite-triage-kit
├─ medicine-routing-domain
│  ├─ vapor-sterilizer-domain
│  │  └─ sora-vapor-sterilizer-ring-kit
│  └─ medicine-satchel-domain
│     ├─ dose-balance-domain
│     │  └─ sora-medicine-satchel-balance-kit
├─ evacuation-handoff-domain
│  ├─ recovery-hammock-domain
│  │  └─ sora-recovery-hammock-bay-kit
│  └─ dawn-clinic-ledger-domain
│     └─ sora-dawn-clinic-ledger-kit
└─ renderer-handoff
   └─ sora-cloud-clinic-triage-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function baseClinicReadiness(input = {}) {
  const readiness = clamp01(input.readiness ?? input.flightReadiness ?? 0.35);
  const rescue = scalarFrom(input.skyRescueReadiness?.rendererHandoff?.counts?.total, 0);
  const lighthouse = scalarFrom(input.skyLighthouseReadiness?.rendererHandoff?.counts?.total, 0);
  const rookery = scalarFrom(input.skyRookeryMigrationReadiness?.rendererHandoff?.counts?.total, 0);
  const orchard = scalarFrom(input.starOrchardRescueReadiness?.rendererHandoff?.counts?.total, 0);
  const radio = scalarFrom(input.skyRadioBeaconReadiness?.rendererHandoff?.counts?.total, 0);
  return clamp01(readiness * 0.46 + rescue * 0.0025 + lighthouse * 0.002 + rookery * 0.0018 + orchard * 0.0018 + radio * 0.0026 + 0.17);
}

function patientPressure(input = {}) {
  const tick = scalarFrom(input.tick ?? input.time, 0);
  const storm = clamp01(input.stormRisk ?? input.skyRadioBeaconReadiness?.dawnRadioLedger?.stormRisk ?? 0.46);
  const bank = Math.abs(scalarFrom(input.input?.bank, 0));
  return clamp01(0.28 + storm * 0.42 + Math.sin(tick * 0.029) * 0.06 + bank * 0.08);
}

export function createSoraCloudClinicLandingPadKit(options = {}) {
  const id = "sora-cloud-clinic-landing-pad-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseClinicReadiness(input);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const stability = clamp01(0.3 + readiness * 0.36 + Math.cos(tick * 0.033 + index * 0.71) * 0.1 + hash01(index, 3) * 0.14);
        return {
          id: `${id}-${index}`,
          kind: "sora-cloud-clinic-landing-pad",
          position: { x: round(lane * 0.88), y: round(-0.18 + stability * 0.2) },
          padSpan: round(0.14 + stability * 0.26),
          windShear: round(1 - stability),
          stabilityScore: round(stability),
          status: stability > 0.7 ? "clear" : stability > 0.48 ? "mark" : "circle",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraPulseKiteTriageKit(options = {}) {
  const id = "sora-pulse-kite-triage-kit";
  const count = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const pressure = patientPressure(input);
      const pointerY = clamp01(input.input?.pointerY ?? 0.5);
      return Array.from({ length: count }, (_, index) => {
        const pulse = clamp01(0.22 + pressure * 0.38 + Math.sin(tick * 0.047 + index * 0.91) * 0.16 + Math.abs(pointerY - 0.5) * 0.08 + hash01(index, 7) * 0.12);
        return {
          id: `${id}-${index}`,
          kind: "sora-pulse-kite-triage",
          anchor: { x: round(-0.82 + index * (1.64 / Math.max(1, count - 1))), y: round(0.14 + pulse * 0.28) },
          pulseScore: round(pulse),
          urgencyScore: round(clamp01(pressure * 0.68 + (1 - pulse) * 0.22)),
          patientBand: pulse > 0.68 ? "stable" : pulse > 0.45 ? "watch" : "urgent",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraVaporSterilizerRingKit(options = {}) {
  const id = "sora-vapor-sterilizer-ring-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const pads = safeArray(descriptors.cloudClinicLandingPads);
      const averagePad = pads.reduce((sum, item) => sum + scalarFrom(item.stabilityScore, 0), 0) / Math.max(1, pads.length);
      return Array.from({ length: count }, (_, index) => {
        const sterility = clamp01(0.25 + averagePad * 0.42 + Math.cos(tick * 0.039 + index * 0.5) * 0.11 + hash01(index, 11) * 0.12);
        return {
          id: `${id}-${index}`,
          kind: "sora-vapor-sterilizer-ring",
          center: { x: round(-0.6 + index * (1.2 / Math.max(1, count - 1))), y: round(-0.34 + sterility * 0.1) },
          vaporRadius: round(0.08 + sterility * 0.18),
          sterilityScore: round(sterility),
          status: sterility > 0.72 ? "sealed" : sterility > 0.5 ? "warming" : "thin",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraMedicineSatchelBalanceKit(options = {}) {
  const id = "sora-medicine-satchel-balance-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const kites = safeArray(descriptors.pulseKiteTriage);
      const rings = safeArray(descriptors.vaporSterilizerRings);
      const urgent = kites.filter((item) => item.patientBand === "urgent").length;
      const averageSterility = rings.reduce((sum, item) => sum + scalarFrom(item.sterilityScore, 0), 0) / Math.max(1, rings.length);
      return Array.from({ length: count }, (_, index) => {
        const balance = clamp01(0.3 + averageSterility * 0.34 - urgent * 0.035 + hash01(index, 17) * 0.22);
        return {
          id: `${id}-${index}`,
          kind: "sora-medicine-satchel-balance",
          rack: { x: round((index - (count - 1) / 2) * 0.18), y: round(-0.58 + balance * 0.08) },
          doseCount: Math.max(1, Math.round(2 + balance * 11)),
          balanceScore: round(balance),
          status: balance > 0.68 ? "packed" : balance > 0.44 ? "sort" : "short",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraRecoveryHammockBayKit(options = {}) {
  const id = "sora-recovery-hammock-bay-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const pads = safeArray(descriptors.cloudClinicLandingPads);
      const satchels = safeArray(descriptors.medicineSatchelBalances);
      const averagePad = pads.reduce((sum, item) => sum + scalarFrom(item.stabilityScore, 0), 0) / Math.max(1, pads.length);
      const doseTotal = satchels.reduce((sum, item) => sum + scalarFrom(item.doseCount, 0), 0);
      return Array.from({ length: count }, (_, index) => {
        const recovery = clamp01(0.24 + averagePad * 0.32 + Math.min(1, doseTotal / 38) * 0.3 + hash01(index, 23) * 0.13);
        return {
          id: `${id}-${index}`,
          kind: "sora-recovery-hammock-bay",
          span: { startX: round(-0.62 + index * (1.24 / Math.max(1, count - 1))), endX: round(-0.5 + index * (1.24 / Math.max(1, count - 1))), y: round(0.48 + recovery * 0.12) },
          recoveryScore: round(recovery),
          patientCapacity: Math.max(1, Math.round(1 + recovery * 5)),
          status: recovery > 0.7 ? "receive" : recovery > 0.48 ? "lash" : "folded",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraDawnClinicLedgerKit() {
  const id = "sora-dawn-clinic-ledger-kit";
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const pads = safeArray(descriptors.cloudClinicLandingPads);
      const kites = safeArray(descriptors.pulseKiteTriage);
      const rings = safeArray(descriptors.vaporSterilizerRings);
      const satchels = safeArray(descriptors.medicineSatchelBalances);
      const hammocks = safeArray(descriptors.recoveryHammockBays);
      const readiness = clamp01(
        pads.reduce((sum, item) => sum + scalarFrom(item.stabilityScore, 0), 0) / Math.max(1, pads.length) * 0.2 +
        kites.reduce((sum, item) => sum + (1 - scalarFrom(item.urgencyScore, 0)), 0) / Math.max(1, kites.length) * 0.18 +
        rings.reduce((sum, item) => sum + scalarFrom(item.sterilityScore, 0), 0) / Math.max(1, rings.length) * 0.2 +
        satchels.reduce((sum, item) => sum + scalarFrom(item.balanceScore, 0), 0) / Math.max(1, satchels.length) * 0.18 +
        hammocks.reduce((sum, item) => sum + scalarFrom(item.recoveryScore, 0), 0) / Math.max(1, hammocks.length) * 0.24
      );
      const risk = clamp01(1 - readiness * 0.84 + kites.filter((item) => item.patientBand === "urgent").length * 0.035);
      return {
        id,
        kind: "sora-dawn-clinic-ledger",
        readinessScore: round(readiness),
        patientRisk: round(risk),
        clearPads: pads.filter((item) => item.status === "clear").length,
        urgentKites: kites.filter((item) => item.patientBand === "urgent").length,
        sealedRings: rings.filter((item) => item.status === "sealed").length,
        medicineDoses: satchels.reduce((sum, item) => sum + scalarFrom(item.doseCount, 0), 0),
        patientCapacity: hammocks.reduce((sum, item) => sum + scalarFrom(item.patientCapacity, 0), 0),
        missionState: readiness > 0.72 ? "receive-patients" : readiness > 0.48 ? "triage-clouds" : "circle-clinic",
        kitBoundary: kitBoundary(id)
      };
    }
  };
}

export function createSoraCloudClinicTriageRendererHandoffKit() {
  const id = "sora-cloud-clinic-triage-renderer-handoff-kit";
  return {
    id,
    describe({
      cloudClinicLandingPads = [],
      pulseKiteTriage = [],
      vaporSterilizerRings = [],
      medicineSatchelBalances = [],
      recoveryHammockBays = [],
      dawnClinicLedger = null
    } = {}) {
      const descriptors = {
        cloudClinicLandingPads,
        pulseKiteTriage,
        vaporSterilizerRings,
        medicineSatchelBalances,
        recoveryHammockBays,
        dawnClinicLedger
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "sora-cloud-clinic-triage-renderer-handoff",
        contract: "renderer consumes descriptors only",
        descriptors,
        counts,
        kitBoundary: kitBoundary(id)
      };
    }
  };
}

export function createSoraCloudClinicTriageReadinessDomainKit() {
  const landingPads = createSoraCloudClinicLandingPadKit();
  const pulseKites = createSoraPulseKiteTriageKit();
  const sterilizerRings = createSoraVaporSterilizerRingKit();
  const satchelBalances = createSoraMedicineSatchelBalanceKit();
  const hammockBays = createSoraRecoveryHammockBayKit();
  const dawnLedger = createSoraDawnClinicLedgerKit();
  const rendererHandoff = createSoraCloudClinicTriageRendererHandoffKit();
  return {
    id: "sora-cloud-clinic-triage-readiness-domain-kit",
    tree: SORA_CLOUD_CLINIC_TRIAGE_READINESS_DOMAIN_TREE,
    kits: [landingPads, pulseKites, sterilizerRings, satchelBalances, hammockBays, dawnLedger, rendererHandoff].map((kit) => kit.id),
    describe(input = {}) {
      const cloudClinicLandingPads = landingPads.describe(input);
      const pulseKiteTriage = pulseKites.describe(input);
      const vaporSterilizerRings = sterilizerRings.describe(input, { cloudClinicLandingPads });
      const medicineSatchelBalances = satchelBalances.describe(input, { pulseKiteTriage, vaporSterilizerRings });
      const recoveryHammockBays = hammockBays.describe(input, { cloudClinicLandingPads, medicineSatchelBalances });
      const dawnClinicLedger = dawnLedger.describe(input, {
        cloudClinicLandingPads,
        pulseKiteTriage,
        vaporSterilizerRings,
        medicineSatchelBalances,
        recoveryHammockBays
      });
      const rendererHandoffDescriptor = rendererHandoff.describe({
        cloudClinicLandingPads,
        pulseKiteTriage,
        vaporSterilizerRings,
        medicineSatchelBalances,
        recoveryHammockBays,
        dawnClinicLedger
      });
      return {
        id: "sora-cloud-clinic-triage-readiness",
        domainTree: SORA_CLOUD_CLINIC_TRIAGE_READINESS_DOMAIN_TREE,
        readinessScore: dawnClinicLedger.readinessScore,
        patientRisk: dawnClinicLedger.patientRisk,
        missionState: dawnClinicLedger.missionState,
        cloudClinicLandingPads,
        pulseKiteTriage,
        vaporSterilizerRings,
        medicineSatchelBalances,
        recoveryHammockBays,
        dawnClinicLedger,
        rendererHandoff: rendererHandoffDescriptor
      };
    }
  };
}
