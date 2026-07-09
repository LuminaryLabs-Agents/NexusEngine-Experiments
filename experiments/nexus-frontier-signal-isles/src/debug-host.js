export function createSignalIslesDebugHost({ composition, renderer, input, nexusRuntimeDescriptor = null }) {
  return {
    engine: composition.engine,
    renderer,
    input,
    nexusRuntimeDescriptor,
    tick(dt = 1 / 60) {
      return composition.tick(dt);
    },
    start() {
      return composition.start();
    },
    stop() {
      return composition.stop();
    },
    reset() {
      return composition.reset();
    },
    getState() {
      return composition.getState();
    },
    getKitStates() {
      return composition.getKitStates();
    },
    getVisualFractalState() {
      return composition.getVisualFractalState();
    },
    getObjectiveReadabilityState() {
      return composition.getObjectiveReadabilityState();
    },
    getExpeditionReadinessState() {
      return composition.getExpeditionReadinessState();
    },
    getStormAnchorReadinessState() {
      return composition.getStormAnchorReadinessState();
    },
    getHarborReliefReadinessState() {
      return composition.getHarborReliefReadinessState();
    },
    getLighthouseEvacuationReadinessState() {
      return composition.getLighthouseEvacuationReadinessState();
    },
    getRendererHandoff() {
      return composition.getRendererHandoff();
    },
    getRecentEvents() {
      return composition.getRecentEvents();
    },
    getSequenceState() {
      return composition.getSequenceState();
    },
    getObjectiveState() {
      return composition.getObjectiveState();
    },
    getInputState() {
      return composition.getInputState();
    },
    getLastRejection() {
      return composition.getLastRejection();
    },
    getReplaySnapshot() {
      return composition.getReplaySnapshot();
    },
    getRenderSnapshot() {
      return composition.getRenderSnapshot();
    }
  };
}

export default createSignalIslesDebugHost;
