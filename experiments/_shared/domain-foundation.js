export const DOMAIN_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/domain-kits/index.js";

export async function loadDomainKits(url = DOMAIN_KITS_URL) {
  return import(url);
}

function maybe(factory, ...args) {
  if (typeof factory !== "function") return null;
  try {
    return factory(...args);
  } catch (error) {
    console.warn("Domain foundation kit skipped:", error);
    return null;
  }
}

function ids(items = []) {
  return items.map((item) => item?.id).filter(Boolean);
}

export function createUnifiedDomainKits(NexusRealtime, DomainKits, options = {}) {
  const prefix = options.prefix ?? "experiment";
  const durationSeconds = Number(options.durationSeconds ?? 600);
  const relayTargetIds = options.relayTargetIds ?? [];
  const includeFoglineBridge = options.includeFoglineBridge === true;
  const kits = [
    maybe(DomainKits.createTimedPressureDirectorKit, NexusRealtime, {
      kitId: `${prefix}-timed-pressure-director-kit`,
      durationSeconds,
      thresholds: options.pressureThresholds ?? [],
      pressurePerSecond: options.pressurePerSecond ?? 0,
      completeOnExpire: options.completeOnExpire === true
    }),
    maybe(DomainKits.createZoneFieldKit, NexusRealtime, { kitId: `${prefix}-zone-field-kit` }),
    maybe(DomainKits.createScanSurveyKit, NexusRealtime, { kitId: `${prefix}-scan-survey-kit` }),
    maybe(DomainKits.createRouteCheckpointKit, NexusRealtime, { kitId: `${prefix}-route-checkpoint-kit` }),
    maybe(DomainKits.createCargoDeliveryKit, NexusRealtime, { kitId: `${prefix}-cargo-delivery-kit` }),
    maybe(DomainKits.createAgentGroupKit, NexusRealtime, { kitId: `${prefix}-agent-group-kit` }),
    maybe(DomainKits.createResourcePressureKit, NexusRealtime, { kitId: `${prefix}-resource-pressure-kit` }),
    maybe(DomainKits.createHazardDirectorKit, NexusRealtime, { kitId: `${prefix}-hazard-director-kit` }),
    maybe(DomainKits.createContentPresetKit, NexusRealtime, {
      kitId: `${prefix}-content-preset-kit`,
      activePresetId: options.presetId ?? prefix,
      presets: options.presets ?? {}
    }),
    maybe(DomainKits.createVisualFidelityMakerKit, NexusRealtime, { kitId: `${prefix}-visual-fidelity-maker-kit` }),
    maybe(DomainKits.createAudioEventFeedbackMakerKit, NexusRealtime, { kitId: `${prefix}-audio-event-feedback-maker-kit` }),
    maybe(DomainKits.createCameraCinematicMakerKit, NexusRealtime, { kitId: `${prefix}-camera-cinematic-maker-kit` }),
    maybe(DomainKits.createScenarioQaHarness, NexusRealtime, { kitId: `${prefix}-scenario-qa-harness` }),
    maybe(DomainKits.createDeterministicReplayHarness, NexusRealtime, { kitId: `${prefix}-deterministic-replay-harness` }),
    maybe(DomainKits.createGamehostStandardKit, NexusRealtime, { kitId: `${prefix}-gamehost-standard-kit` }),
    maybe(DomainKits.createTokenRegistryKit, NexusRealtime, { kitId: `${prefix}-token-registry-kit` }),
    includeFoglineBridge ? maybe(DomainKits.createFoglineSurveyPressureBridgeKit, NexusRealtime, {
      kitId: `${prefix}-fogline-survey-pressure-bridge-kit`,
      relayTargetIds
    }) : null
  ];
  return kits.filter(Boolean);
}

function ensureSyncState(engine) {
  if (!engine.__nexusExperimentDomainSync) {
    engine.__nexusExperimentDomainSync = {
      scanTargets: new Set(),
      zones: new Set(),
      hazards: new Set(),
      routes: new Set(),
      cargo: new Set(),
      resources: new Set(),
      agents: new Set()
    };
  }
  return engine.__nexusExperimentDomainSync;
}

export function syncUnifiedDomainState(engine, snapshot = {}, options = {}) {
  if (!engine) return snapshot;
  const sync = ensureSyncState(engine);
  const label = options.label ?? snapshot?.level?.id ?? "experiment";
  const game = snapshot.game ?? snapshot;
  const player = options.player ?? game?.player ?? snapshot.player ?? game?.body?.position;
  const x = Number(player?.x ?? player?.position?.x ?? 0);
  const y = Number(player?.y ?? player?.z ?? player?.position?.z ?? 0);

  engine.gamehostStandard?.set?.({
    descriptors: {
      status: "running",
      label,
      experiment: label,
      hasDomainFoundation: true,
      frame: engine.clock?.frame ?? 0,
      elapsed: engine.clock?.elapsed ?? 0
    }
  });
  engine.visualFidelity?.set?.({
    profile: options.visualProfile ?? label,
    descriptors: {
      label,
      quality: options.quality ?? "high",
      rendererOwnedGameplay: false,
      renderSnapshotOnly: true
    }
  });
  engine.audioEventFeedback?.cue?.(`${label}:heartbeat`, { duration: 0.1, intensity: options.audioIntensity ?? 0.35 });
  engine.cameraCinematic?.set?.({
    profile: options.cameraProfile ?? label,
    descriptors: {
      mode: options.cameraMode ?? "gameplay",
      target: { x, y },
      cinematicSafe: true
    }
  });
  engine.scenarioQa?.set?.({
    descriptors: {
      label,
      expectedGameHost: true,
      rendererOwnsGameplay: false,
      baseNameOnly: true
    }
  });
  engine.tokenRegistry?.set?.({
    descriptors: {
      consumes: options.consumes ?? [],
      provides: options.provides ?? []
    }
  });

  if (engine.zoneField?.setEntityPosition) {
    engine.zoneField.setEntityPosition("player", { x, y });
  }

  for (const relay of game?.relays ?? []) {
    if (!relay?.id || sync.scanTargets.has(relay.id)) continue;
    sync.scanTargets.add(relay.id);
    engine.scanSurvey?.registerTarget?.({
      id: relay.id,
      x: Number(relay.x ?? 0),
      y: Number(relay.z ?? relay.y ?? 0),
      radius: Number(relay.scanRadius ?? 3.5),
      required: 1,
      tags: ["relay", label]
    });
  }

  if (game?.input?.scan && engine.scanSurvey?.pulse) {
    engine.scanSurvey.pulse({
      origin: { x, y },
      radius: Number(options.scanRadius ?? 4),
      amount: Number(options.scanAmount ?? 0.08),
      commandId: `${label}:scan:${engine.clock?.frame ?? 0}`
    });
  }

  const fogZoneId = `${label}:playable-zone`;
  if (engine.zoneField?.registerZone && !sync.zones.has(fogZoneId)) {
    sync.zones.add(fogZoneId);
    engine.zoneField.registerZone({
      id: fogZoneId,
      x: Number(options.zoneX ?? 0),
      y: Number(options.zoneY ?? 0),
      radius: Number(options.zoneRadius ?? 9999),
      effects: options.zoneEffects ?? []
    });
  }

  const routeId = `${label}:main-route`;
  if (engine.routeCheckpoint?.registerRoute && !sync.routes.has(routeId)) {
    const checkpoints = options.checkpoints ?? ids(game?.relays ?? []);
    if (checkpoints.length) {
      sync.routes.add(routeId);
      engine.routeCheckpoint.registerRoute({ id: routeId, checkpoints });
    }
  }

  if (engine.resourcePressure?.register && !sync.resources.has(`${label}:health`)) {
    sync.resources.add(`${label}:health`);
    engine.resourcePressure.register({ id: `${label}:health`, value: Number(game?.player?.health ?? snapshot.health01 ?? 1), min: 0, max: Number(game?.player?.health ? 100 : 1), rate: 0 });
  }

  for (const monster of snapshot.monsters ?? []) {
    const id = monster.entity ? `monster-${monster.entity}` : monster.id;
    if (!id || sync.agents.has(id)) continue;
    sync.agents.add(id);
    const pos = monster.position ?? monster;
    engine.agentGroup?.spawn?.({ id, groupId: "hostiles", x: Number(pos.x ?? 0), y: Number(pos.z ?? pos.y ?? 0), speed: Number(monster.threat?.speed ?? 1) });
  }

  return snapshot;
}

export function attachUnifiedGameHost(globalObject, payload = {}) {
  const target = globalObject ?? globalThis;
  const previous = target.GameHost ?? {};
  target.GameHost = {
    ...previous,
    ...payload,
    domainFoundation: true,
    getDomainState() {
      const engine = payload.engine ?? previous.engine;
      return {
        timedPressure: engine?.timedPressure?.getSnapshot?.(),
        zoneField: engine?.zoneField?.getSnapshot?.(),
        scanSurvey: engine?.scanSurvey?.getSnapshot?.(),
        routeCheckpoint: engine?.routeCheckpoint?.getSnapshot?.(),
        cargoDelivery: engine?.cargoDelivery?.getSnapshot?.(),
        agentGroup: engine?.agentGroup?.getSnapshot?.(),
        resourcePressure: engine?.resourcePressure?.getSnapshot?.(),
        hazardDirector: engine?.hazardDirector?.getSnapshot?.(),
        visualFidelity: engine?.visualFidelity?.getSnapshot?.(),
        audioEventFeedback: engine?.audioEventFeedback?.getSnapshot?.(),
        cameraCinematic: engine?.cameraCinematic?.getSnapshot?.(),
        scenarioQa: engine?.scenarioQa?.getSnapshot?.(),
        deterministicReplay: engine?.deterministicReplay?.getSnapshot?.(),
        gamehostStandard: engine?.gamehostStandard?.getSnapshot?.(),
        tokenRegistry: engine?.tokenRegistry?.getSnapshot?.(),
        foglineSurveyPressure: engine?.foglineSurveyPressure?.getSnapshot?.()
      };
    }
  };
  return target.GameHost;
}
