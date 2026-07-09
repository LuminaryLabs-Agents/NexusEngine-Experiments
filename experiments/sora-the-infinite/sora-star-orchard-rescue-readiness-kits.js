const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 31.313 + salt * 57.19) * 43758.5453;
  return x - Math.floor(x);
};

const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable Sora star orchard rescue readiness descriptors only",
  rendererMustNotOwn: [
    "star orchard truth",
    "rescued nestling state",
    "sky medicine logistics",
    "browser input",
    "DOM",
    "Three.js",
    "WebGL",
    "audio",
    "asset loading",
    "frame loop",
    "physics"
  ]
});

export const SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE = `sora-star-orchard-rescue-readiness-domain
├─ astral-harvest-domain
│  ├─ starfruit-grove-domain
│  │  └─ sora-starfruit-grove-kit
│  └─ pollen-current-domain
│     └─ sora-pollen-current-kit
├─ shelter-repair-domain
│  ├─ nest-sling-domain
│  │  └─ sora-nest-sling-kit
│  └─ cloud-bloom-medicine-domain
│     └─ sora-cloud-bloom-medicine-kit
├─ escort-handoff-domain
│  ├─ mooncalf-courier-domain
│  │  └─ sora-mooncalf-courier-kit
│  └─ dawn-orchard-ledger-domain
│     └─ sora-dawn-orchard-ledger-kit
└─ renderer-handoff
   └─ sora-star-orchard-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function baseReadiness(input = {}) {
  const readiness = clamp01(input.readiness ?? input.flightReadiness ?? 0.35);
  const rescueCount = scalarFrom(input.skyRescueReadiness?.rendererHandoff?.counts?.total, 0);
  const rookeryCount = scalarFrom(input.skyRookeryMigrationReadiness?.rendererHandoff?.counts?.total, 0);
  const lighthouseCount = scalarFrom(input.skyLighthouseReadiness?.rendererHandoff?.counts?.total, 0);
  return clamp01(readiness * 0.58 + rescueCount * 0.004 + rookeryCount * 0.003 + lighthouseCount * 0.003 + 0.14);
}

export function createSoraStarfruitGroveKit(options = {}) {
  const id = "sora-starfruit-grove-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseReadiness(input);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const ripeness = clamp01(0.32 + readiness * 0.36 + Math.sin(tick * 0.053 + index * 0.9) * 0.14 + hash01(index, 3) * 0.14);
        return {
          id: `${id}-${index}`,
          kind: "sora-starfruit-grove",
          position: { x: round(lane * 0.92), y: round(0.34 + Math.sin(tick * 0.035 + index) * 0.05) },
          fruitRadius: round(0.028 + ripeness * 0.052),
          ripenessScore: round(ripeness),
          rescueMeals: Math.max(1, Math.round(1 + ripeness * 8)),
          opacity: round(0.14 + ripeness * 0.46),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraPollenCurrentKit(options = {}) {
  const id = "sora-pollen-current-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const bank = scalarFrom(input.input?.bank, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const drift = clamp01(0.4 + Math.cos(tick * 0.061 + index * 0.7) * 0.16 + hash01(index, 7) * 0.13 + Math.abs(bank) * 0.07);
        return {
          id: `${id}-${index}`,
          kind: "sora-pollen-current",
          start: { x: round(lane * 0.78 - bank * 0.05), y: round(0.16 + drift * 0.08) },
          end: { x: round(lane * 0.54 + bank * 0.12), y: round(0.48 + drift * 0.18) },
          driftScore: round(drift),
          pollenLoads: Math.max(2, Math.round(3 + drift * 14)),
          opacity: round(0.12 + drift * 0.44),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraNestSlingKit(options = {}) {
  const id = "sora-nest-sling-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseReadiness(input);
      const climb = scalarFrom(input.input?.climb, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const tension = clamp01(0.35 + readiness * 0.3 + Math.sin(tick * 0.047 + index * 0.8) * 0.13 + Math.max(0, climb) * 0.06 + hash01(index, 11) * 0.14);
        return {
          id: `${id}-${index}`,
          kind: "sora-nest-sling",
          anchor: { x: round(lane * 0.72), y: round(0.04 + tension * 0.16) },
          cradle: { x: round(lane * 0.58), y: round(-0.16 + tension * 0.12) },
          tensionScore: round(tension),
          nestlingsHeld: Math.max(1, Math.round(1 + tension * 5)),
          status: tension > 0.68 ? "ready" : tension > 0.45 ? "braiding" : "loose",
          opacity: round(0.15 + tension * 0.42),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraCloudBloomMedicineKit(options = {}) {
  const id = "sora-cloud-bloom-medicine-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseReadiness(input);
      const thrust = scalarFrom(input.input?.thrust, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const potency = clamp01(0.36 + readiness * 0.28 + Math.cos(tick * 0.049 + index) * 0.14 + Math.max(0, thrust) * 0.05 + hash01(index, 13) * 0.13);
        return {
          id: `${id}-${index}`,
          kind: "sora-cloud-bloom-medicine",
          position: { x: round(-0.56 + lane * 1.12), y: round(-0.34 + Math.sin(tick * 0.04 + index) * 0.04) },
          radius: round(0.025 + potency * 0.047),
          potencyScore: round(potency),
          poulticesReady: Math.max(1, Math.round(2 + potency * 9)),
          status: potency > 0.68 ? "harvest" : potency > 0.45 ? "open" : "bud",
          opacity: round(0.14 + potency * 0.43),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraMooncalfCourierKit(options = {}) {
  const id = "sora-mooncalf-courier-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = baseReadiness(input);
      const pointerActive = Boolean(input.input?.pointerActive);
      return Array.from({ length: count }, (_, index) => {
        const phase = (tick * 0.031 + index * 0.17) % 1;
        const trust = clamp01(0.38 + readiness * 0.34 + Math.sin(tick * 0.045 + index * 0.73) * 0.13 + (pointerActive ? 0.05 : 0) + hash01(index, 17) * 0.1);
        return {
          id: `${id}-${index}`,
          kind: "sora-mooncalf-courier",
          path: {
            from: { x: round(-0.66 + index * (1.32 / Math.max(1, count - 1))), y: round(-0.5) },
            to: { x: round(-0.32 + index * (0.64 / Math.max(1, count - 1))), y: round(0.24 + trust * 0.1) }
          },
          phase: round(phase),
          trustScore: round(trust),
          parcelsSafe: Math.max(1, Math.round(2 + trust * 10)),
          status: trust > 0.7 ? "depart" : trust > 0.48 ? "load" : "soothe",
          opacity: round(0.12 + trust * 0.44),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraDawnOrchardLedgerKit() {
  const id = "sora-dawn-orchard-ledger-kit";
  return {
    id,
    describe(input = {}, descriptors = {}) {
      const groves = safeArray(descriptors.starfruitGroves);
      const blooms = safeArray(descriptors.cloudBloomMedicines);
      const couriers = safeArray(descriptors.mooncalfCouriers);
      const slings = safeArray(descriptors.nestSlings);
      const readiness = clamp01(
        groves.reduce((sum, item) => sum + scalarFrom(item.ripenessScore, 0), 0) / Math.max(1, groves.length) * 0.28 +
        blooms.reduce((sum, item) => sum + scalarFrom(item.potencyScore, 0), 0) / Math.max(1, blooms.length) * 0.24 +
        couriers.reduce((sum, item) => sum + scalarFrom(item.trustScore, 0), 0) / Math.max(1, couriers.length) * 0.24 +
        slings.reduce((sum, item) => sum + scalarFrom(item.tensionScore, 0), 0) / Math.max(1, slings.length) * 0.24
      );
      return {
        id,
        kind: "sora-dawn-orchard-ledger",
        readinessScore: round(readiness),
        mealsReady: groves.reduce((sum, item) => sum + scalarFrom(item.rescueMeals, 0), 0),
        medicineReady: blooms.reduce((sum, item) => sum + scalarFrom(item.poulticesReady, 0), 0),
        couriersReady: couriers.filter((item) => item.status === "depart").length,
        nestlingsSecured: slings.reduce((sum, item) => sum + scalarFrom(item.nestlingsHeld, 0), 0),
        missionState: readiness > 0.72 ? "handoff" : readiness > 0.48 ? "stabilize" : "gather",
        rendererContract: rendererContract(id)
      };
    }
  };
}

export function createSoraStarOrchardRescueRendererHandoffKit() {
  const id = "sora-star-orchard-rescue-renderer-handoff-kit";
  return {
    id,
    describe({
      starfruitGroves = [],
      pollenCurrents = [],
      nestSlings = [],
      cloudBloomMedicines = [],
      mooncalfCouriers = [],
      dawnOrchardLedger = null
    } = {}) {
      const descriptors = {
        starfruitGroves,
        pollenCurrents,
        nestSlings,
        cloudBloomMedicines,
        mooncalfCouriers,
        dawnOrchardLedger
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createSoraStarOrchardRescueReadinessDomainKit(options = {}) {
  const groveKit = createSoraStarfruitGroveKit(options.starfruitGroves);
  const pollenKit = createSoraPollenCurrentKit(options.pollenCurrents);
  const slingKit = createSoraNestSlingKit(options.nestSlings);
  const medicineKit = createSoraCloudBloomMedicineKit(options.cloudBloomMedicines);
  const courierKit = createSoraMooncalfCourierKit(options.mooncalfCouriers);
  const ledgerKit = createSoraDawnOrchardLedgerKit();
  const handoffKit = createSoraStarOrchardRescueRendererHandoffKit();

  return {
    id: "sora-star-orchard-rescue-readiness-domain-kit",
    domainTree: SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
    kits: {
      groveKit,
      pollenKit,
      slingKit,
      medicineKit,
      courierKit,
      ledgerKit,
      handoffKit
    },
    describe(input = {}) {
      const starfruitGroves = groveKit.describe(input);
      const pollenCurrents = pollenKit.describe(input);
      const nestSlings = slingKit.describe(input);
      const cloudBloomMedicines = medicineKit.describe(input);
      const mooncalfCouriers = courierKit.describe(input);
      const dawnOrchardLedger = ledgerKit.describe(input, {
        starfruitGroves,
        cloudBloomMedicines,
        mooncalfCouriers,
        nestSlings
      });
      const rendererHandoff = handoffKit.describe({
        starfruitGroves,
        pollenCurrents,
        nestSlings,
        cloudBloomMedicines,
        mooncalfCouriers,
        dawnOrchardLedger
      });
      return {
        id: "sora-star-orchard-rescue-readiness-domain",
        domainTree: SORA_STAR_ORCHARD_RESCUE_READINESS_DOMAIN_TREE,
        readinessScore: dawnOrchardLedger.readinessScore,
        missionState: dawnOrchardLedger.missionState,
        rendererHandoff,
        starfruitGroves,
        pollenCurrents,
        nestSlings,
        cloudBloomMedicines,
        mooncalfCouriers,
        dawnOrchardLedger
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        readinessScore: described.readinessScore,
        missionState: described.missionState,
        descriptorCount: described.rendererHandoff.counts.total,
        mealsReady: described.dawnOrchardLedger.mealsReady,
        medicineReady: described.dawnOrchardLedger.medicineReady,
        couriersReady: described.dawnOrchardLedger.couriersReady
      };
    }
  };
}
