const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

function safeInput(input = {}) {
  return {
    thrust: clamp(input.thrust ?? input.forward ?? 0, -1, 1),
    bank: clamp(input.bank ?? input.x ?? 0, -1, 1),
    climb: clamp(input.climb ?? input.y ?? 0, -1, 1),
    launch: Boolean(input.launch),
    pointerActive: Boolean(input.pointerActive),
    pointerX: clamp(input.pointerX ?? 0.5, 0, 1),
    pointerY: clamp(input.pointerY ?? 0.5, 0, 1)
  };
}

function microflightSummary(input = {}) {
  return input.microflightTrialReadiness?.summary ?? {};
}

function skySummary(input = {}) {
  return input.skyNegotiationReadiness?.summary ?? {};
}

function preflightSummary(input = {}) {
  return input.preflightChallengeReadiness?.summary ?? {};
}

function flightSummary(input = {}) {
  return input.flightplanReadability?.summary ?? {};
}

export const SORA_SKY_RESCUE_READINESS_DOMAIN_TREE = `sora-sky-rescue-readiness-domain
├─ survivor-signal-domain
│  ├─ beacon-call-domain
│  │  └─ sora-rescue-beacon-call-kit
│  └─ stranded-island-domain
│     └─ sora-stranded-sky-island-kit
├─ storm-route-domain
│  ├─ gust-corridor-domain
│  │  └─ sora-gust-corridor-map-kit
│  └─ shadow-squall-domain
│     └─ sora-shadow-squall-warning-kit
├─ extraction-handoff-domain
│  ├─ rescue-tether-domain
│  │  └─ sora-rescue-tether-spool-kit
│  └─ dawn-convoy-domain
│     └─ sora-dawn-handoff-convoy-kit
└─ renderer-handoff
   └─ sora-sky-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraRescueBeaconCallKit(options = {}) {
  const beaconCount = Math.floor(clamp(options.beaconCount ?? 4, 3, 6));
  return {
    id: "sora-rescue-beacon-call-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const medals = clamp((microflightSummary(input).earnedSkyMedals ?? 0) / 4, 0, 1);
      const vowHelp = clamp((skySummary(input).sealedReturnVows ?? 0) / 4, 0, 1);
      const beacons = Array.from({ length: beaconCount }, (_, index) => {
        const t = beaconCount <= 1 ? 0.5 : index / (beaconCount - 1);
        const phase = tick * 0.017 + index * 0.77;
        const alignment = clamp(1 - Math.abs(control.bank - (t * 2 - 1) * 0.55) * 0.5, 0, 1);
        const signal = clamp(readiness * 0.28 + medals * 0.24 + vowHelp * 0.18 + alignment * 0.2 + Math.max(0, control.thrust) * 0.1, 0, 1);
        return {
          id: `rescue-beacon-${index}`,
          kind: "rescue-beacon-call",
          index,
          x: round(16 + t * 68 + Math.sin(phase) * 3, 2),
          y: round(24 + Math.cos(phase * 0.9) * 10 + index * 6, 2),
          signal: round(signal),
          heard: signal >= 0.56,
          label: signal >= 0.72 ? "clear survivor beacon" : signal >= 0.56 ? "faint survivor beacon" : "lost beacon call"
        };
      });
      return { kind: "rescue-beacon-calls", beacons };
    }
  };
}

export function createSoraStrandedSkyIslandKit(options = {}) {
  const islandCount = Math.floor(clamp(options.islandCount ?? 5, 3, 7));
  return {
    id: "sora-stranded-sky-island-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const thermalHelp = clamp((skySummary(input).chosenThermalRungs ?? 0) / 6, 0, 1);
      const tokenHelp = clamp((microflightSummary(input).collectedThermalTokens ?? 0) / 7, 0, 1);
      const islands = Array.from({ length: islandCount }, (_, index) => {
        const t = islandCount <= 1 ? 0.5 : index / (islandCount - 1);
        const hover = clamp(0.18 + readiness * 0.25 + thermalHelp * 0.22 + tokenHelp * 0.18 + Math.max(0, control.climb) * 0.12 - Math.abs(control.bank) * 0.08 + index * 0.025, 0, 1);
        return {
          id: `stranded-island-${index}`,
          kind: "stranded-sky-island",
          index,
          x: round(14 + t * 72, 2),
          y: round(60 - hover * 34 + (index % 2) * 8, 2),
          radius: round(8 + hover * 18, 2),
          hover: round(hover),
          reachable: hover >= 0.52,
          label: hover >= 0.72 ? "safe rescue island" : hover >= 0.52 ? "reachable rescue island" : "drifting island out of reach"
        };
      });
      return { kind: "stranded-sky-islands", islands };
    }
  };
}

export function createSoraGustCorridorMapKit(options = {}) {
  const corridorCount = Math.floor(clamp(options.corridorCount ?? 4, 3, 6));
  return {
    id: "sora-gust-corridor-map-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const jetstreamHelp = clamp((skySummary(input).usableJetstreams ?? 0) / 6, 0, 1);
      const glideHelp = clamp((skySummary(input).openGlidePockets ?? 0) / 5, 0, 1);
      const corridors = Array.from({ length: corridorCount }, (_, index) => {
        const t = corridorCount <= 1 ? 0.5 : index / (corridorCount - 1);
        const desiredBank = index % 2 === 0 ? -0.35 : 0.35;
        const bankFit = clamp(1 - Math.abs(control.bank - desiredBank) * 0.55, 0, 1);
        const flow = clamp(readiness * 0.22 + jetstreamHelp * 0.26 + glideHelp * 0.2 + bankFit * 0.22 + Math.max(0, control.thrust) * 0.1, 0, 1);
        return {
          id: `gust-corridor-${index}`,
          kind: "gust-corridor",
          index,
          x: round(20 + t * 60, 2),
          y: round(40 + (index % 2 === 0 ? -10 : 10), 2),
          width: round(18 + flow * 30, 2),
          flow: round(flow),
          open: flow >= 0.55,
          side: desiredBank < 0 ? "left" : "right",
          label: flow >= 0.72 ? "clean gust corridor" : flow >= 0.55 ? "narrow gust corridor" : "broken gust corridor"
        };
      });
      return { kind: "gust-corridor-map", corridors };
    }
  };
}

export function createSoraShadowSquallWarningKit(options = {}) {
  const squallCount = Math.floor(clamp(options.squallCount ?? 4, 3, 6));
  return {
    id: "sora-shadow-squall-warning-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const activeStorms = clamp((skySummary(input).activeStormShelves ?? 0) / 4, 0, 1);
      const avoidableBursts = clamp((microflightSummary(input).avoidableStormBursts ?? 0) / 4, 0, 1);
      const squalls = Array.from({ length: squallCount }, (_, index) => {
        const phase = tick * 0.019 + index * 1.3;
        const threat = clamp(0.24 + activeStorms * 0.36 + Math.max(0, -control.climb) * 0.16 + Math.abs(control.bank) * 0.1 - readiness * 0.18 - avoidableBursts * 0.16 + Math.sin(phase) * 0.08, 0, 1);
        return {
          id: `shadow-squall-${index}`,
          kind: "shadow-squall-warning",
          index,
          x: round(22 + index * (56 / Math.max(1, squallCount - 1)) + Math.sin(phase) * 5, 2),
          y: round(18 + Math.cos(phase) * 9 + index * 6, 2),
          radius: round(10 + threat * 22, 2),
          threat: round(threat),
          avoidable: threat < 0.64,
          label: threat >= 0.64 ? "closing shadow squall" : threat >= 0.44 ? "threadable shadow squall" : "distant shadow squall"
        };
      });
      return { kind: "shadow-squall-warnings", squalls };
    }
  };
}

export function createSoraRescueTetherSpoolKit(options = {}) {
  const spoolCount = Math.floor(clamp(options.spoolCount ?? 4, 3, 6));
  return {
    id: "sora-rescue-tether-spool-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const beacons = input.rescueBeaconCalls?.beacons ?? [];
      const islands = input.strandedSkyIslands?.islands ?? [];
      const beaconScore = clamp(beacons.filter((beacon) => beacon.heard).length / Math.max(1, beacons.length), 0, 1);
      const islandScore = clamp(islands.filter((island) => island.reachable).length / Math.max(1, islands.length), 0, 1);
      const tetherHelp = clamp((preflightSummary(input).linkedVelocityTethers ?? 0) / 7, 0, 1);
      const spools = Array.from({ length: spoolCount }, (_, index) => {
        const t = spoolCount <= 1 ? 0.5 : index / (spoolCount - 1);
        const tension = clamp(readiness * 0.22 + beaconScore * 0.24 + islandScore * 0.22 + tetherHelp * 0.18 + Math.max(0, control.thrust) * 0.08 - Math.abs(control.bank) * 0.06 + index * 0.02, 0, 1);
        return {
          id: `rescue-tether-${index}`,
          kind: "rescue-tether-spool",
          index,
          x: round(22 + t * 56, 2),
          y: round(78 - tension * 32, 2),
          length: round(20 + tension * 44, 2),
          tension: round(tension),
          linked: tension >= 0.58,
          label: tension >= 0.76 ? "secure rescue tether" : tension >= 0.58 ? "catchable rescue tether" : "slack rescue tether"
        };
      });
      return { kind: "rescue-tether-spools", spools };
    }
  };
}

export function createSoraDawnHandoffConvoyKit(options = {}) {
  const convoyCount = Math.floor(clamp(options.convoyCount ?? 3, 2, 5));
  return {
    id: "sora-dawn-handoff-convoy-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const landingHelp = clamp((microflightSummary(input).openLandingRunways ?? 0) / 3, 0, 1);
      const anchorHelp = clamp((flightSummary(input).linkedReturnAnchors ?? 0) / 4, 0, 1);
      const tetherScore = clamp((input.rescueTetherSpools?.spools ?? []).filter((spool) => spool.linked).length / Math.max(1, (input.rescueTetherSpools?.spools ?? []).length), 0, 1);
      const convoys = Array.from({ length: convoyCount }, (_, index) => {
        const t = convoyCount <= 1 ? 0.5 : index / (convoyCount - 1);
        const commit = clamp(readiness * 0.24 + landingHelp * 0.22 + anchorHelp * 0.18 + tetherScore * 0.26 + (control.launch ? 0.08 : 0) + Math.max(0, control.climb) * 0.02, 0, 1);
        return {
          id: `dawn-convoy-${index}`,
          kind: "dawn-handoff-convoy",
          index,
          x: round(26 + t * 48, 2),
          y: round(90 - commit * 38, 2),
          width: round(18 + commit * 36, 2),
          commit: round(commit),
          ready: commit >= 0.62,
          label: commit >= 0.78 ? "ready dawn convoy" : commit >= 0.62 ? "forming dawn convoy" : "unformed dawn convoy"
        };
      });
      return { kind: "dawn-handoff-convoys", convoys };
    }
  };
}

export function createSoraSkyRescueRendererHandoffKit() {
  return {
    id: "sora-sky-rescue-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        rescueBeaconCalls: input.rescueBeaconCalls ?? { beacons: [] },
        strandedSkyIslands: input.strandedSkyIslands ?? { islands: [] },
        gustCorridorMap: input.gustCorridorMap ?? { corridors: [] },
        shadowSquallWarnings: input.shadowSquallWarnings ?? { squalls: [] },
        rescueTetherSpools: input.rescueTetherSpools ?? { spools: [] },
        dawnHandoffConvoys: input.dawnHandoffConvoys ?? { convoys: [] }
      };
      const descriptorCounts = {
        rescueBeacons: descriptors.rescueBeaconCalls.beacons.length,
        strandedIslands: descriptors.strandedSkyIslands.islands.length,
        gustCorridors: descriptors.gustCorridorMap.corridors.length,
        shadowSqualls: descriptors.shadowSquallWarnings.squalls.length,
        rescueTethers: descriptors.rescueTetherSpools.spools.length,
        dawnConvoys: descriptors.dawnHandoffConvoys.convoys.length
      };
      return {
        kind: "sora-sky-rescue-renderer-handoff",
        contract: "renderer consumes descriptors only",
        descriptors,
        descriptorCounts,
        forbiddenOwnership: [
          "renderer ownership",
          "DOM ownership",
          "browser input ownership",
          "Three.js ownership",
          "WebGL ownership",
          "audio ownership",
          "asset loading ownership",
          "frame-loop ownership"
        ]
      };
    }
  };
}

export function createSoraSkyRescueReadinessDomainKit(options = {}) {
  const beaconKit = createSoraRescueBeaconCallKit(options);
  const islandKit = createSoraStrandedSkyIslandKit(options);
  const corridorKit = createSoraGustCorridorMapKit(options);
  const squallKit = createSoraShadowSquallWarningKit(options);
  const tetherKit = createSoraRescueTetherSpoolKit(options);
  const convoyKit = createSoraDawnHandoffConvoyKit(options);
  const rendererHandoffKit = createSoraSkyRescueRendererHandoffKit(options);
  const kits = [beaconKit, islandKit, corridorKit, squallKit, tetherKit, convoyKit, rendererHandoffKit];

  return {
    id: "sora-sky-rescue-readiness-domain-kit",
    tree: SORA_SKY_RESCUE_READINESS_DOMAIN_TREE,
    kits: kits.map((kit) => kit.id),
    describe(input = {}) {
      const rescueBeaconCalls = beaconKit.describe(input);
      const strandedSkyIslands = islandKit.describe(input);
      const gustCorridorMap = corridorKit.describe(input);
      const shadowSquallWarnings = squallKit.describe(input);
      const rescueTetherSpools = tetherKit.describe({ ...input, rescueBeaconCalls, strandedSkyIslands });
      const dawnHandoffConvoys = convoyKit.describe({ ...input, rescueTetherSpools });
      const rendererHandoff = rendererHandoffKit.describe({
        rescueBeaconCalls,
        strandedSkyIslands,
        gustCorridorMap,
        shadowSquallWarnings,
        rescueTetherSpools,
        dawnHandoffConvoys
      });
      const summary = {
        heardRescueBeacons: rescueBeaconCalls.beacons.filter((beacon) => beacon.heard).length,
        reachableStrandedIslands: strandedSkyIslands.islands.filter((island) => island.reachable).length,
        openGustCorridors: gustCorridorMap.corridors.filter((corridor) => corridor.open).length,
        avoidableShadowSqualls: shadowSquallWarnings.squalls.filter((squall) => squall.avoidable).length,
        linkedRescueTethers: rescueTetherSpools.spools.filter((spool) => spool.linked).length,
        readyDawnConvoys: dawnHandoffConvoys.convoys.filter((convoy) => convoy.ready).length,
        descriptorCount: Object.values(rendererHandoff.descriptorCounts).reduce((sum, count) => sum + count, 0)
      };
      return {
        kind: "sora-sky-rescue-readiness-domain",
        rescueBeaconCalls,
        strandedSkyIslands,
        gustCorridorMap,
        shadowSquallWarnings,
        rescueTetherSpools,
        dawnHandoffConvoys,
        rendererHandoff,
        summary
      };
    }
  };
}
