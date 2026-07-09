const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 19.713 + salt * 43.21) * 43758.5453;
  return x - Math.floor(x);
};

const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable Sora sky rookery migration readiness descriptors only",
  rendererMustNotOwn: [
    "bird migration truth",
    "rookery health state",
    "sanctuary scheduling",
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

export const SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE = `sora-sky-rookery-migration-readiness-domain
├─ flock-guidance-domain
│  ├─ migratory-vector-domain
│  │  └─ sora-migratory-flock-vector-kit
│  └─ rookery-anchor-domain
│     └─ sora-rookery-nest-anchor-kit
├─ weather-shelter-domain
│  ├─ updraft-rest-domain
│  │  └─ sora-updraft-rest-column-kit
│  └─ storm-gap-domain
│     └─ sora-storm-gap-timing-kit
├─ sanctuary-handoff-domain
│  ├─ dawn-banding-domain
│  │  └─ sora-dawn-banding-roster-kit
│  └─ sanctuary-runway-domain
│     └─ sora-sanctuary-runway-handoff-kit
└─ renderer-handoff
   └─ sora-sky-rookery-migration-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraMigratoryFlockVectorKit(options = {}) {
  const id = "sora-migratory-flock-vector-kit";
  const count = Math.max(3, Math.min(7, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = clamp01(input.readiness ?? 0.35);
      const bank = scalarFrom(input.input?.bank, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const cohesion = clamp01(0.42 + readiness * 0.28 + Math.sin(tick * 0.07 + index) * 0.14 + hash01(index, 2) * 0.12 - Math.abs(bank) * 0.05);
        return {
          id: `${id}-${index}`,
          kind: "sora-migratory-flock-vector",
          start: { x: round(lane * 0.92 - bank * 0.03), y: round(0.08 + Math.sin(tick * 0.04 + index) * 0.045) },
          end: { x: round(lane * 0.56 + bank * 0.08), y: round(0.42 + cohesion * 0.2) },
          cohesionScore: round(cohesion),
          flockCount: Math.max(6, Math.round(12 + cohesion * 28)),
          opacity: round(0.16 + cohesion * 0.42),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraRookeryNestAnchorKit(options = {}) {
  const id = "sora-rookery-nest-anchor-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = clamp01(input.readiness ?? 0.4);
      const lighthouse = scalarFrom(input.skyLighthouseReadiness?.rendererHandoff?.counts?.total, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const anchor = clamp01(0.36 + readiness * 0.25 + Math.cos(tick * 0.05 + index * 0.8) * 0.13 + hash01(index, 5) * 0.13 + lighthouse * 0.004);
        return {
          id: `${id}-${index}`,
          kind: "sora-rookery-nest-anchor",
          position: { x: round(-0.62 + lane * 1.24), y: round(0.18 + Math.cos(tick * 0.03 + index) * 0.035) },
          radius: round(0.034 + anchor * 0.045),
          anchorScore: round(anchor),
          nestSlotsReady: Math.max(2, Math.round(3 + anchor * 9)),
          opacity: round(0.14 + anchor * 0.4),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraUpdraftRestColumnKit(options = {}) {
  const id = "sora-updraft-rest-column-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const climb = scalarFrom(input.input?.climb, 0);
      const negotiation = scalarFrom(input.skyNegotiationReadiness?.rendererHandoff?.descriptorCounts?.thermalLadderChoices, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const lift = clamp01(0.4 + Math.sin(tick * 0.08 + index * 0.66) * 0.17 + hash01(index, 8) * 0.15 + Math.max(0, climb) * 0.08 + negotiation * 0.01);
        return {
          id: `${id}-${index}`,
          kind: "sora-updraft-rest-column",
          position: { x: round(lane * 0.82), y: round(-0.08 + lift * 0.28) },
          height: round(0.18 + lift * 0.34),
          liftScore: round(lift),
          restSeconds: Math.max(5, Math.round(8 + lift * 24)),
          opacity: round(0.15 + lift * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraStormGapTimingKit(options = {}) {
  const id = "sora-storm-gap-timing-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const thrust = scalarFrom(input.input?.thrust, 0);
      const rescue = scalarFrom(input.skyRescueReadiness?.rendererHandoff?.counts?.total, 0);
      return Array.from({ length: count }, (_, index) => {
        const phase = (tick * 0.035 + index * 0.21) % 1;
        const open = clamp01(0.34 + Math.cos(tick * 0.06 + index) * 0.18 + hash01(index, 11) * 0.17 + thrust * 0.05 - rescue * 0.002);
        return {
          id: `${id}-${index}`,
          kind: "sora-storm-gap-timing-window",
          position: { x: round(-0.54 + index * (1.08 / Math.max(1, count - 1))), y: round(0.54 + Math.sin(tick * 0.04 + index) * 0.04) },
          phase: round(phase),
          gapOpenScore: round(open),
          windowSeconds: Math.max(4, Math.round(6 + open * 18)),
          status: open > 0.66 ? "open" : open > 0.42 ? "forming" : "closed",
          opacity: round(0.12 + open * 0.42),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraDawnBandingRosterKit(options = {}) {
  const id = "sora-dawn-banding-roster-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const readiness = clamp01(input.readiness ?? 0.4);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const roster = clamp01(0.38 + readiness * 0.3 + Math.sin(tick * 0.052 + index * 0.72) * 0.12 + hash01(index, 14) * 0.14);
        return {
          id: `${id}-${index}`,
          kind: "sora-dawn-banding-roster",
          position: { x: round(-0.5 + lane), y: round(-0.3 + Math.cos(tick * 0.03 + index) * 0.035) },
          radius: round(0.03 + roster * 0.04),
          rosterScore: round(roster),
          birdsLogged: Math.max(5, Math.round(7 + roster * 24)),
          bandingWindowMinutes: Math.max(8, Math.round(28 - roster * 9 + index)),
          opacity: round(0.14 + roster * 0.38),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraSanctuaryRunwayHandoffKit(options = {}) {
  const id = "sora-sanctuary-runway-handoff-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const tick = scalarFrom(input.tick ?? input.time, 0);
      const routePreviewCount = scalarFrom(input.routePreview?.handoffPackets?.packets?.length, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const ready = clamp01(0.42 + Math.cos(tick * 0.047 + index * 0.81) * 0.15 + hash01(index, 17) * 0.18 + routePreviewCount * 0.015);
        return {
          id: `${id}-${index}`,
          kind: "sora-sanctuary-runway-handoff",
          start: { x: round(lane * 0.72), y: round(-0.52) },
          end: { x: round(lane * 0.42), y: round(-0.2 + ready * 0.14) },
          handoffScore: round(ready),
          runwayLampsReady: Math.max(3, Math.round(4 + ready * 12)),
          status: ready > 0.66 ? "ready" : ready > 0.45 ? "aligning" : "cold",
          opacity: round(0.13 + ready * 0.4),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createSoraSkyRookeryMigrationRendererHandoffKit() {
  const id = "sora-sky-rookery-migration-renderer-handoff-kit";
  return {
    id,
    describe({
      migratoryFlockVectors = [],
      rookeryNestAnchors = [],
      updraftRestColumns = [],
      stormGapTimingWindows = [],
      dawnBandingRosters = [],
      sanctuaryRunwayHandoffs = []
    } = {}) {
      const descriptors = {
        migratoryFlockVectors,
        rookeryNestAnchors,
        updraftRestColumns,
        stormGapTimingWindows,
        dawnBandingRosters,
        sanctuaryRunwayHandoffs
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createSoraSkyRookeryMigrationReadinessDomainKit(options = {}) {
  const migratoryKit = createSoraMigratoryFlockVectorKit(options.migratoryFlockVectors);
  const rookeryKit = createSoraRookeryNestAnchorKit(options.rookeryNestAnchors);
  const updraftKit = createSoraUpdraftRestColumnKit(options.updraftRestColumns);
  const stormKit = createSoraStormGapTimingKit(options.stormGapTimingWindows);
  const rosterKit = createSoraDawnBandingRosterKit(options.dawnBandingRosters);
  const runwayKit = createSoraSanctuaryRunwayHandoffKit(options.sanctuaryRunwayHandoffs);
  const handoffKit = createSoraSkyRookeryMigrationRendererHandoffKit();

  return {
    id: "sora-sky-rookery-migration-readiness-domain-kit",
    domainTree: SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
    kits: [migratoryKit, rookeryKit, updraftKit, stormKit, rosterKit, runwayKit, handoffKit].map((kit) => kit.id),
    describe(input = {}) {
      const migratoryFlockVectors = migratoryKit.describe(input);
      const rookeryNestAnchors = rookeryKit.describe(input);
      const updraftRestColumns = updraftKit.describe(input);
      const stormGapTimingWindows = stormKit.describe(input);
      const dawnBandingRosters = rosterKit.describe(input);
      const sanctuaryRunwayHandoffs = runwayKit.describe(input);
      const rendererHandoff = handoffKit.describe({
        migratoryFlockVectors,
        rookeryNestAnchors,
        updraftRestColumns,
        stormGapTimingWindows,
        dawnBandingRosters,
        sanctuaryRunwayHandoffs
      });
      const readinessScore = clamp01((
        migratoryFlockVectors.reduce((sum, item) => sum + item.cohesionScore, 0) +
        rookeryNestAnchors.reduce((sum, item) => sum + item.anchorScore, 0) +
        updraftRestColumns.reduce((sum, item) => sum + item.liftScore, 0) +
        stormGapTimingWindows.reduce((sum, item) => sum + item.gapOpenScore, 0) +
        dawnBandingRosters.reduce((sum, item) => sum + item.rosterScore, 0) +
        sanctuaryRunwayHandoffs.reduce((sum, item) => sum + item.handoffScore, 0)
      ) / Math.max(1, rendererHandoff.counts.total));
      return {
        id: "sora-sky-rookery-migration-readiness",
        kind: "sora-sky-rookery-migration-readiness",
        readinessScore: round(readinessScore),
        missionState: readinessScore > 0.66 ? "migration-ready" : readinessScore > 0.46 ? "routes-forming" : "rookery-at-risk",
        domainTree: SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
        rendererHandoff
      };
    }
  };
}
