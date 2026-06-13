import { NEXUS_URL, RENDER_LAYER_URL } from "./urls.js";
import { createFoglineRelayKit } from "./fogline-relay-kit.js";
import { createFoglineRelayLevel } from "./level.js";
import { createVisualSignals } from "./visual-signals.js";

export async function createFoglineRelaySession() {
  const [NexusRealtime, VisualPipeline] = await Promise.all([
    import(NEXUS_URL),
    import(RENDER_LAYER_URL)
  ]);

  const level = createFoglineRelayLevel();
  const visualPreset = VisualPipeline.createFoglineVisualPreset();
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
    engine.visualPipeline.setViewer({ x: game.player.x, y: 1.6, z: game.player.z });
    engine.visualPipeline.setSignals(createVisualSignals(game));
  }

  function snapshot() {
    return {
      level,
      clock: engine.clock,
      game: engine.foglineRelay.getState(),
      objective: engine.objectiveFlow?.getState?.(),
      interactions: engine.interactionTargets?.getState?.(),
      visual: engine.visualPipeline.snapshot(),
      render: engine.renderDescriptors?.getState?.()
    };
  }

  return {
    engine,
    level,
    NexusRealtime,
    VisualPipeline,
    prepareFrame,
    snapshot,
    getState: snapshot
  };
}
