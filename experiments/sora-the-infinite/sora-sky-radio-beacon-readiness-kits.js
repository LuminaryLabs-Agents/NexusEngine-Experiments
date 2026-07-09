const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 41.113 + salt * 73.31) * 43758.5453;
  return x - Math.floor(x);
};

const kitBoundary = (owner) => ({
  owner,
  hostSurface: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  consumerReceives: "serializable Sora sky radio beacon rescue readiness descriptors only",
  consumerMustNotOwn: [
    "radio rescue truth",
    "beacon tuning state",
    "storm routing state",
    "flight control state",
    "graphics implementation",
    "sound implementation",
    "resource loading",
    "main timing loop",
    "physics simulation"
  ]
});

export const SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE = `sora-sky-radio-beacon-rescue-readiness-domain
├─ distress-reception-domain
│  ├─ cloud-radio-mast-domain
│  │  └─ sora-cloud-radio-mast-kit
│  └─ beacon-frequency-domain
│     └─ sora-beacon-frequency-band-kit
├─ storm-route-domain
│  ├─ lightning-gap-domain
│  │  └─ sora-lightning-gap-marker-kit
│  └─ thermal-relay-domain
│     └─ sora-thermal-relay-buoy-kit
├─ rescue-handoff-domain
│  ├─ sky-stretcher-cradle-domain
│  │  └─ sora-sky-stretcher-cradle-kit
│  └─ dawn-radio-ledger-domain
│     └─ sora-dawn-radio-ledger-kit
└─ renderer-handoff
   └─ sora-sky-radio-beacon-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function baseRadioReadiness(input = {}) {
  const readiness = clamp01(input.readiness ?? input.flightReadiness ?? 0.34);
  const rescue = scalarFrom(input.skyRescueReadiness?.rendererHandoff?.counts?.total, 0);
  const lighthouse = scalarFrom(input.skyLighthouseReadiness?.rendererHandoff?.counts?.total, 0);
  const rookery = scalarFrom(input.skyRookeryMigrationReadiness?.rendererHandoff?.counts?.total, 0);
  const orchard = scalarFrom(input.starOrchardRescueReadiness?.rendererHandoff?.counts?.total, 0);
  return clamp01(readiness * 0.5 + rescue * 0.0035 + lighthouse * 0.003 + rookery * 0.002 + orchard * 0.002 + 0.16);
}

export function createSoraCloudRadioMastKit(options = {}) {
  const id = "sora-cloud-radio-mast-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseRadioReadiness(input);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const signal = clamp01(0.28 + readiness * 0.38 + Math.sin(tick * 0.041 + index * 0.83) * 0.13 + hash01(index, 5) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "sora-cloud-radio-mast",
          position: { x: round(lane * 0.92), y: round(0.32 + Math.cos(tick * 0.025 + index) * 0.05) },
          mastHeight: round(0.18 + signal * 0.34),
          signalStrength: round(signal),
          tunedPanels: Math.max(1, Math.round(1 + signal * 6)),
          status: signal > 0.68 ? "tuned" : signal > 0.45 ? "sweeping" : "static",
          opacity: round(0.16 + signal * 0.48),
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraBeaconFrequencyBandKit(options = {}) {
  const id = "sora-beacon-frequency-band-kit";
  const count = Math.max(4, Math.min(8, Math.floor(options.count ?? 6)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const pointerX = clamp01(input.input?.pointerX ?? 0.5);
      return Array.from({ length: count }, (_, index) => {
        const sweep = clamp01(0.34 + Math.cos(tick * 0.053 + index * 0.67) * 0.13 + (1 - Math.abs(pointerX - index / Math.max(1, count - 1))) * 0.18 + hash01(index, 9) * 0.11);
        return {
          id: `${id}-${index}`,
          kind: "sora-beacon-frequency-band",
          band: round(118.2 + index * 2.75, 2),
          resonanceScore: round(sweep),
          packetCount: Math.max(1, Math.round(2 + sweep * 12)),
          phaseOffset: round((tick * 0.017 + index * 0.13) % 1),
          status: sweep > 0.7 ? "locked" : sweep > 0.48 ? "tracking" : "noise",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraLightningGapMarkerKit(options = {}) {
  const id = "sora-lightning-gap-marker-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const bank = Math.abs(scalarFrom(input.input?.bank, 0));
      return Array.from({ length: count }, (_, index) => {
        const gap = clamp01(0.3 + Math.sin(tick * 0.037 + index * 1.11) * 0.18 + hash01(index, 13) * 0.16 - bank * 0.05);
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "sora-lightning-gap-marker",
          start: { x: round(lane * 0.8), y: round(0.1 + gap * 0.08) },
          end: { x: round(lane * 0.66), y: round(-0.18 + gap * 0.16) },
          safetyWindow: round(gap),
          strikeRisk: round(1 - gap),
          routeLabel: gap > 0.62 ? "clear" : gap > 0.42 ? "wait" : "divert",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraThermalRelayBuoyKit(options = {}) {
  const id = "sora-thermal-relay-buoy-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const climb = scalarFrom(input.input?.climb, 0);
      const readiness = baseRadioReadiness(input);
      return Array.from({ length: count }, (_, index) => {
        const lift = clamp01(0.32 + readiness * 0.28 + Math.cos(tick * 0.043 + index * 0.6) * 0.14 + Math.max(0, climb) * 0.07 + hash01(index, 17) * 0.12);
        return {
          id: `${id}-${index}`,
          kind: "sora-thermal-relay-buoy",
          position: { x: round(-0.76 + index * (1.52 / Math.max(1, count - 1))), y: round(-0.36 + lift * 0.22) },
          liftScore: round(lift),
          relayCharge: Math.max(1, Math.round(2 + lift * 10)),
          status: lift > 0.7 ? "boost" : lift > 0.48 ? "warming" : "cold",
          opacity: round(0.14 + lift * 0.42),
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraSkyStretcherCradleKit(options = {}) {
  const id = "sora-sky-stretcher-cradle-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const masts = safeArray(descriptors.cloudRadioMasts);
      const frequencies = safeArray(descriptors.beaconFrequencyBands);
      const averageSignal = masts.reduce((sum, item) => sum + scalarFrom(item.signalStrength, 0), 0) / Math.max(1, masts.length);
      const lockedBands = frequencies.filter((item) => item.status === "locked").length;
      return Array.from({ length: count }, (_, index) => {
        const stability = clamp01(0.28 + averageSignal * 0.42 + lockedBands * 0.06 + hash01(index, 23) * 0.12);
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        return {
          id: `${id}-${index}`,
          kind: "sora-sky-stretcher-cradle",
          anchor: { x: round(lane * 0.62), y: round(-0.48 + stability * 0.12) },
          cradleSpan: round(0.16 + stability * 0.24),
          stabilityScore: round(stability),
          survivorsHeld: Math.max(1, Math.round(1 + stability * 4)),
          status: stability > 0.68 ? "carry" : stability > 0.45 ? "lash" : "folded",
          kitBoundary: kitBoundary(id)
        };
      });
    }
  };
}

export function createSoraDawnRadioLedgerKit() {
  const id = "sora-dawn-radio-ledger-kit";
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const masts = safeArray(descriptors.cloudRadioMasts);
      const bands = safeArray(descriptors.beaconFrequencyBands);
      const gaps = safeArray(descriptors.lightningGapMarkers);
      const buoys = safeArray(descriptors.thermalRelayBuoys);
      const cradles = safeArray(descriptors.skyStretcherCradles);
      const readiness = clamp01(
        masts.reduce((sum, item) => sum + scalarFrom(item.signalStrength, 0), 0) / Math.max(1, masts.length) * 0.23 +
        bands.reduce((sum, item) => sum + scalarFrom(item.resonanceScore, 0), 0) / Math.max(1, bands.length) * 0.2 +
        gaps.reduce((sum, item) => sum + scalarFrom(item.safetyWindow, 0), 0) / Math.max(1, gaps.length) * 0.17 +
        buoys.reduce((sum, item) => sum + scalarFrom(item.liftScore, 0), 0) / Math.max(1, buoys.length) * 0.18 +
        cradles.reduce((sum, item) => sum + scalarFrom(item.stabilityScore, 0), 0) / Math.max(1, cradles.length) * 0.22
      );
      const risk = clamp01(1 - readiness * 0.82 + gaps.filter((item) => item.routeLabel === "divert").length * 0.035);
      return {
        id,
        kind: "sora-dawn-radio-ledger",
        readinessScore: round(readiness),
        stormRisk: round(risk),
        tunedMasts: masts.filter((item) => item.status === "tuned").length,
        lockedBands: bands.filter((item) => item.status === "locked").length,
        safeGaps: gaps.filter((item) => item.routeLabel === "clear").length,
        relayCharge: buoys.reduce((sum, item) => sum + scalarFrom(item.relayCharge, 0), 0),
        survivorsCapacity: cradles.reduce((sum, item) => sum + scalarFrom(item.survivorsHeld, 0), 0),
        missionState: readiness > 0.72 ? "broadcast" : readiness > 0.48 ? "triangulate" : "listen",
        kitBoundary: kitBoundary(id)
      };
    }
  };
}

export function createSoraSkyRadioBeaconRendererHandoffKit() {
  const id = "sora-sky-radio-beacon-renderer-handoff-kit";
  return {
    id,
    describe({
      cloudRadioMasts = [],
      beaconFrequencyBands = [],
      lightningGapMarkers = [],
      thermalRelayBuoys = [],
      skyStretcherCradles = [],
      dawnRadioLedger = null
    } = {}) {
      const descriptors = {
        cloudRadioMasts,
        beaconFrequencyBands,
        lightningGapMarkers,
        thermalRelayBuoys,
        skyStretcherCradles,
        dawnRadioLedger
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        descriptors,
        counts,
        kitBoundary: kitBoundary(id)
      };
    }
  };
}

export function createSoraSkyRadioBeaconReadinessDomainKit(options = {}) {
  const cloudRadioMastKit = options.cloudRadioMastKit ?? createSoraCloudRadioMastKit();
  const beaconFrequencyBandKit = options.beaconFrequencyBandKit ?? createSoraBeaconFrequencyBandKit();
  const lightningGapMarkerKit = options.lightningGapMarkerKit ?? createSoraLightningGapMarkerKit();
  const thermalRelayBuoyKit = options.thermalRelayBuoyKit ?? createSoraThermalRelayBuoyKit();
  const skyStretcherCradleKit = options.skyStretcherCradleKit ?? createSoraSkyStretcherCradleKit();
  const dawnRadioLedgerKit = options.dawnRadioLedgerKit ?? createSoraDawnRadioLedgerKit();
  const rendererHandoffKit = options.rendererHandoffKit ?? createSoraSkyRadioBeaconRendererHandoffKit();
  const kits = [cloudRadioMastKit, beaconFrequencyBandKit, lightningGapMarkerKit, thermalRelayBuoyKit, skyStretcherCradleKit, dawnRadioLedgerKit, rendererHandoffKit];
  return {
    id: "sora-sky-radio-beacon-rescue-readiness-domain-kit",
    domainTree: SORA_SKY_RADIO_BEACON_READINESS_DOMAIN_TREE,
    kits: kits.map((kit) => kit.id),
    describe(input = {}) {
      const cloudRadioMasts = cloudRadioMastKit.describe(input);
      const beaconFrequencyBands = beaconFrequencyBandKit.describe(input);
      const lightningGapMarkers = lightningGapMarkerKit.describe(input);
      const thermalRelayBuoys = thermalRelayBuoyKit.describe(input);
      const skyStretcherCradles = skyStretcherCradleKit.describe(input, { cloudRadioMasts, beaconFrequencyBands, lightningGapMarkers, thermalRelayBuoys });
      const dawnRadioLedger = dawnRadioLedgerKit.describe(input, { cloudRadioMasts, beaconFrequencyBands, lightningGapMarkers, thermalRelayBuoys, skyStretcherCradles });
      const rendererHandoff = rendererHandoffKit.describe({ cloudRadioMasts, beaconFrequencyBands, lightningGapMarkers, thermalRelayBuoys, skyStretcherCradles, dawnRadioLedger });
      return {
        id: this.id,
        domainTree: this.domainTree,
        kits: this.kits,
        readinessScore: dawnRadioLedger.readinessScore,
        stormRisk: dawnRadioLedger.stormRisk,
        missionState: dawnRadioLedger.missionState,
        cloudRadioMasts,
        beaconFrequencyBands,
        lightningGapMarkers,
        thermalRelayBuoys,
        skyStretcherCradles,
        dawnRadioLedger,
        rendererHandoff
      };
    }
  };
}
