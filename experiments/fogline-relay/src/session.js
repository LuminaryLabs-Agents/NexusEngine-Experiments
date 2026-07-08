import { NEXUS_URL, RENDER_LAYER_URL } from "./urls.js";
import { createFoglineRelayKit } from "./fogline-relay-kit.js";
import { createFoglineRelayLevel } from "./level.js";
import { createVisualSignals } from "./visual-signals.js";
import { createFoglineVisualFractalDomain } from "./fogline-visual-fractal-kits.js";
import { createFoglineSignalCartographyDomain } from "./fogline-signal-cartography-kits.js";
import { createFoglineOperatorRhythmDomain } from "./fogline-operator-rhythm-kits.js";
import { DOMAIN_KITS_URL, createUnifiedDomainKits, syncUnifiedDomainState } from "../../_shared/domain-foundation.js";

const CARTOGRAPHY_BUCKET_ARCHETYPES = Object.freeze({
  routeThreads: "fogline.route.thread",
  groundMottles: "fogline.ground.mottle",
  relayAuras: "fogline.relay.aura",
  scanCones: "fogline.scan.cone",
  objectiveNeedles: "fogline.objective.needle",
  gateSigils: "fogline.gate.sigil",
  safePockets: "fogline.safe.pocket"
});

const OPERATOR_RHYTHM_BUCKET_ARCHETYPES = Object.freeze({
  routeThreads: "fogline.route.thread",
  relayAuras: "fogline.relay.aura",
  scanCones: "fogline.scan.cone",
  objectiveNeedles: "fogline.objective.needle",
  gateSigils: "fogline.gate.sigil",
  safePockets: "fogline.safe.pocket",
  pressureVignettes: "fogline.pressure.vignette"
});

function domainSnapshot(engine) {
  return {
    timedPressure: engine.timedPressure?.getSnapshot?.(),
    zoneField: engine.zoneField?.getSnapshot?.(),
    scanSurvey: engine.scanSurvey?.getSnapshot?.(),
    routeCheckpoint: engine.routeCheckpoint?.getSnapshot?.(),
    resourcePressure: engine.resourcePressure?.getSnapshot?.(),
    hazardDirector: engine.hazardDirector?.getSnapshot?.(),
    visualFidelity: engine.visualFidelity?.getSnapshot?.(),
    audioEventFeedback: engine.audioEventFeedback?.getSnapshot?.(),
    cameraCinematic: engine.cameraCinematic?.getSnapshot?.(),
    scenarioQa: engine.scenarioQa?.getSnapshot?.(),
    deterministicReplay: engine.deterministicReplay?.getSnapshot?.(),
    gamehostStandard: engine.gamehostStandard?.getSnapshot?.(),
    tokenRegistry: engine.tokenRegistry?.getSnapshot?.(),
    foglineSurveyPressure: engine.foglineSurveyPressure?.getSnapshot?.()
  };
}

function asPresentationDescriptor(descriptor = {}, sourceKey = "descriptor", bucketMap = {}) {
  const bucket = descriptor.compatibleBucket;
  const compatibleArchetype = descriptor.compatibleArchetype ?? bucketMap[bucket];
  return {
    ...descriptor,
    id: `${sourceKey}-${descriptor.id ?? descriptor.archetype}`,
    originalArchetype: descriptor.archetype,
    archetype: compatibleArchetype ?? descriptor.archetype,
    [sourceKey]: true
  };
}

function createComposedRendererHandoff(visualFractal = {}, signalCartography = {}, operatorRhythm = {}) {
  const descriptors = visualFractal.drawOrder ?? [];
  const cartographyDescriptors = signalCartography.drawOrder ?? [];
  const operatorRhythmDescriptors = operatorRhythm.drawOrder ?? [];
  const counts = descriptors.reduce((acc, descriptor) => {
    acc[descriptor.originalArchetype ?? descriptor.archetype] = (acc[descriptor.originalArchetype ?? descriptor.archetype] ?? 0) + 1;
    return acc;
  }, {});
  return {
    id: "fogline-composed-renderer-handoff",
    archetype: "fogline.composed.renderer.handoff",
    policy: "renderer-consumes-descriptors-only",
    descriptorCount: descriptors.length,
    cartographyDescriptorCount: cartographyDescriptors.length,
    operatorRhythmDescriptorCount: operatorRhythmDescriptors.length,
    descriptors,
    sourceHandoffs: [visualFractal.rendererHandoff, signalCartography.rendererHandoff, operatorRhythm.rendererHandoff].filter(Boolean),
    counts,
    ownership: {
      renderer: "consume-only",
      dom: "excluded",
      browserInput: "excluded",
      three: "excluded",
      webgl: "excluded",
      audio: "excluded",
      assets: "excluded",
      frameLoop: "excluded"
    }
  };
}

function mergeSignalCartographyIntoVisualFractal(visualFractal = {}, signalCartography = {}) {
  const merged = {
    ...visualFractal,
    cartography: signalCartography
  };
  for (const descriptor of signalCartography.drawOrder ?? []) {
    const bucket = descriptor.compatibleBucket;
    if (!bucket || !CARTOGRAPHY_BUCKET_ARCHETYPES[bucket]) continue;
    merged[bucket] = [...(merged[bucket] ?? []), asPresentationDescriptor(descriptor, "cartography", CARTOGRAPHY_BUCKET_ARCHETYPES)];
  }
  merged.drawOrder = [
    ...(visualFractal.drawOrder ?? []),
    ...Object.keys(CARTOGRAPHY_BUCKET_ARCHETYPES).flatMap((bucket) => (merged[bucket] ?? []).filter((descriptor) => descriptor.cartography))
  ];
  merged.rendererHandoff = createComposedRendererHandoff(merged, signalCartography);
  return merged;
}

function mergeOperatorRhythmIntoVisualFractal(visualFractal = {}, signalCartography = {}, operatorRhythm = {}) {
  const merged = {
    ...visualFractal,
    operatorRhythm
  };
  for (const descriptor of operatorRhythm.drawOrder ?? []) {
    const bucket = descriptor.compatibleBucket;
    if (!bucket || !OPERATOR_RHYTHM_BUCKET_ARCHETYPES[bucket]) continue;
    merged[bucket] = [...(merged[bucket] ?? []), asPresentationDescriptor(descriptor, "operatorRhythm", OPERATOR_RHYTHM_BUCKET_ARCHETYPES)];
  }
  merged.drawOrder = [
    ...(visualFractal.drawOrder ?? []),
    ...Object.keys(OPERATOR_RHYTHM_BUCKET_ARCHETYPES).flatMap((bucket) => (merged[bucket] ?? []).filter((descriptor) => descriptor.operatorRhythm))
  ];
  merged.rendererHandoff = createComposedRendererHandoff(merged, signalCartography, operatorRhythm);
  return merged;
}

function composeReadabilityDomains({ level, route, game }) {
  const signalCartography = createFoglineSignalCartographyDomain({ level, route, game });
  const operatorRhythm = createFoglineOperatorRhythmDomain({ level, route, game });
  let visualFractal = createFoglineVisualFractalDomain({ level, route, game });
  visualFractal = mergeSignalCartographyIntoVisualFractal(visualFractal, signalCartography);
  visualFractal = mergeOperatorRhythmIntoVisualFractal(visualFractal, signalCartography, operatorRhythm);
  return { visualFractal, signalCartography, operatorRhythm };
}

export async function createFoglineRelaySession() {
  const [NexusRealtime, VisualPipeline, DomainKits] = await Promise.all([
    import(NEXUS_URL),
    import(RENDER_LAYER_URL),
    import(DOMAIN_KITS_URL)
  ]);

  const level = createFoglineRelayLevel();
  const visualPreset = VisualPipeline.createFoglineVisualPreset();
  let { visualFractal, signalCartography, operatorRhythm } = composeReadabilityDomains({
    level,
    route: level.route,
    game: { player: level.spawn, relays: level.relays, wraiths: level.wraiths, gate: level.gate, stats: { scanned: 0 } }
  });
  const domainKits = createUnifiedDomainKits(NexusRealtime, DomainKits, {
    prefix: "fogline-relay",
    presetId: level.id,
    includeFoglineBridge: true,
    relayTargetIds: (level.relays ?? []).map((relay) => relay.id),
    durationSeconds: 480,
    visualProfile: "fogline-relay",
    zoneX: 0,
    zoneY: 20,
    zoneRadius: 999,
    zoneEffects: [{ id: "corruption", amountPerSecond: 0.03, threshold: 1 }],
    consumes: ["scan:survey", "zone:field", "pressure:timed"],
    provides: ["experiment:fogline-relay"]
  });
  const realismKit = NexusRealtime.createRealismKit({
    id: "fogline-realism-kit",
    preset: visualPreset,
    quality: "high"
  });
  const forestKit = NexusRealtime.createForestPlacementKit({
    id: "fogline-forest-placement-kit",
    seed: "fogline-relay-forest",
    route: level.route,
    focus: level.spawn,
    activeRadius: 2,
    chunkSize: 18,
    placementsPerChunk: 8,
    routeSafeWidth: 5,
    routeAccentWidth: 12
  });
  const foglineKit = createFoglineRelayKit(NexusRealtime, {
    kitId: "fogline-relay-kit",
    level,
    objectiveFlowAction: NexusRealtime.ObjectiveFlowAction,
    objectiveFlowReset: NexusRealtime.ObjectiveFlowReset
  });
  const renderLayerKit = VisualPipeline.createRenderLayerKit(NexusRealtime, {
    id: "fogline-render-layer-kit",
    renderDescriptorResource: NexusRealtime.RenderDescriptorState,
    realismSnapshotResource: realismKit.definitions.resources.RealismSnapshot,
    extraObjectResources: [forestKit.resources.ForestPlacementSnapshot],
    preset: visualPreset,
    quality: "high"
  });

  const engine = NexusRealtime.createRealtimeGame({
    kits: [
      NexusRealtime.createRenderDescriptorKit({ ...level, id: "fogline-render-descriptor-kit" }),
      realismKit,
      forestKit,
      renderLayerKit,
      NexusRealtime.createInteractionTargetKit({ id: "fogline-interaction-target-kit", sceneRecipe: level.sceneRecipe }),
      ...domainKits,
      foglineKit,
      NexusRealtime.createObjectiveFlowKit({
        id: "fogline-objective-flow-kit",
        objectiveDataset: {
          id: level.id,
          steps: level.steps,
          completion: { label: "Relay restored" }
        }
      })
    ]
  });

  function prepareFrame() {
    const game = engine.foglineRelay.getState();
    ({ visualFractal, signalCartography, operatorRhythm } = composeReadabilityDomains({ level, route: level.route, game }));
    syncUnifiedDomainState(engine, { level, game }, {
      label: "fogline-relay",
      scanRadius: 4,
      scanAmount: 0.08,
      zoneX: 0,
      zoneY: 20,
      zoneRadius: 999,
      zoneEffects: [{ id: "corruption", amountPerSecond: 0.03, threshold: 1 }],
      visualProfile: "fogline-relay",
      cameraMode: "first-person",
      consumes: ["scan:survey", "zone:field", "pressure:timed"],
      provides: ["experiment:fogline-relay"]
    });
    engine.visualPipeline.setViewer({ x: game.player.x, y: 1.6, z: game.player.z });
    engine.visualPipeline.setSignals(createVisualSignals(game));
  }

  function snapshot() {
    const game = engine.foglineRelay.getState();
    ({ visualFractal, signalCartography, operatorRhythm } = composeReadabilityDomains({ level, route: level.route, game }));
    return {
      level,
      clock: engine.clock,
      game,
      objective: engine.objectiveFlow?.getState?.(),
      interactions: engine.interactionTargets?.getState?.(),
      visual: engine.visualPipeline.snapshot(),
      visualFractal,
      signalCartography,
      operatorRhythm,
      rendererHandoff: visualFractal.rendererHandoff,
      render: engine.renderDescriptors?.getState?.(),
      domain: {
        ...domainSnapshot(engine),
        foglineVisualFractal: visualFractal,
        foglineSignalCartography: signalCartography,
        foglineOperatorRhythm: operatorRhythm
      }
    };
  }

  return {
    engine,
    level,
    NexusRealtime,
    VisualPipeline,
    DomainKits,
    prepareFrame,
    snapshot,
    getState: snapshot
  };
}
