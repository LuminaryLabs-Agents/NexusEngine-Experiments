import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
import * as DomainKits from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/domain-kits/index.js";
import {
  createNextLedgeKit,
  createProceduralNextLedgeLevel
} from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/next-ledge-kit/cinematic-ascent-kit.js";

function optionalKit(factory, ...args) {
  if (typeof factory !== "function") return null;
  try {
    return factory(...args);
  } catch (error) {
    console.warn("Optional NexusRealtime kit skipped:", error);
    return null;
  }
}

function optionalDomain(factory, ...args) {
  if (typeof factory !== "function") return null;
  try {
    return factory(...args);
  } catch (error) {
    console.warn("Optional domain foundation kit skipped:", error);
    return null;
  }
}

function createNextLedgeDomainKits(level) {
  return [
    optionalDomain(DomainKits.createTimedPressureDirectorKit, NexusRealtime, { kitId: "next-ledge-timed-pressure-kit", durationSeconds: 900 }),
    optionalDomain(DomainKits.createRouteCheckpointKit, NexusRealtime, { kitId: "next-ledge-route-checkpoint-kit" }),
    optionalDomain(DomainKits.createResourcePressureKit, NexusRealtime, { kitId: "next-ledge-resource-pressure-kit" }),
    optionalDomain(DomainKits.createVisualFidelityMakerKit, NexusRealtime, { kitId: "next-ledge-visual-fidelity-maker-kit" }),
    optionalDomain(DomainKits.createAudioEventFeedbackMakerKit, NexusRealtime, { kitId: "next-ledge-audio-event-feedback-maker-kit" }),
    optionalDomain(DomainKits.createCameraCinematicMakerKit, NexusRealtime, { kitId: "next-ledge-camera-cinematic-maker-kit" }),
    optionalDomain(DomainKits.createScenarioQaHarness, NexusRealtime, { kitId: "next-ledge-scenario-qa-harness" }),
    optionalDomain(DomainKits.createDeterministicReplayHarness, NexusRealtime, { kitId: "next-ledge-deterministic-replay-harness" }),
    optionalDomain(DomainKits.createGamehostStandardKit, NexusRealtime, { kitId: "next-ledge-gamehost-standard-kit" }),
    optionalDomain(DomainKits.createTokenRegistryKit, NexusRealtime, { kitId: "next-ledge-token-registry-kit" })
  ].filter(Boolean);
}

function syncDomain(engine, level) {
  engine.visualFidelity?.set?.({ profile: "cinematic-climb", descriptors: { experiment: "next-ledge", rendererOwnsGameplay: false } });
  engine.cameraCinematic?.set?.({ profile: "cinematic-climb", descriptors: { mode: "climb", follow: "nextLedge" } });
  engine.audioEventFeedback?.cue?.("next-ledge:heartbeat", { duration: 0.1, intensity: 0.25 });
  engine.scenarioQa?.set?.({ descriptors: { experiment: "next-ledge", baseNameOnly: true, expectedRendererOwnedGameplay: false } });
  engine.gamehostStandard?.set?.({ descriptors: { experiment: "next-ledge", status: "running", baseNameOnly: true } });
  engine.tokenRegistry?.set?.({ descriptors: { consumes: ["actor:climb-traversal", "actor:momentum-swing"], provides: ["experiment:next-ledge"] } });
  const routeId = "next-ledge:main-route";
  if (!engine.__nextLedgeDomainRouteRegistered && engine.routeCheckpoint?.registerRoute) {
    engine.__nextLedgeDomainRouteRegistered = true;
    engine.routeCheckpoint.registerRoute({ id: routeId, checkpoints: (level.steps ?? []).map((step) => step.id ?? step.label).filter(Boolean) });
  }
}

function domainSnapshot(engine) {
  return {
    timedPressure: engine.timedPressure?.getSnapshot?.(),
    routeCheckpoint: engine.routeCheckpoint?.getSnapshot?.(),
    resourcePressure: engine.resourcePressure?.getSnapshot?.(),
    visualFidelity: engine.visualFidelity?.getSnapshot?.(),
    audioEventFeedback: engine.audioEventFeedback?.getSnapshot?.(),
    cameraCinematic: engine.cameraCinematic?.getSnapshot?.(),
    scenarioQa: engine.scenarioQa?.getSnapshot?.(),
    deterministicReplay: engine.deterministicReplay?.getSnapshot?.(),
    gamehostStandard: engine.gamehostStandard?.getSnapshot?.(),
    tokenRegistry: engine.tokenRegistry?.getSnapshot?.()
  };
}

export function createNextLedgeSession(options = {}) {
  const level = createProceduralNextLedgeLevel({ seed: options.seed ?? "summit-recovery-protocol", summitBase: options.summitBase ?? 2200, summitStep: options.summitStep ?? 800 });
  const kits = [
    optionalKit(NexusRealtime.createRenderDescriptorKit, level),
    level.sceneRecipe ? optionalKit(NexusRealtime.createInteractionTargetKit, { sceneRecipe: level.sceneRecipe }) : null,
    optionalKit(NexusRealtime.createObjectiveFlowKit, { id: level.id, steps: level.steps ?? [] }),
    ...createNextLedgeDomainKits(level),
    createNextLedgeKit(NexusRealtime, { level, sector: options.sector ?? 1, staminaMax: options.staminaMax ?? 100, maxCableLength: options.maxCableLength ?? 150, ropeLength: options.ropeLength ?? 52 })
  ].filter(Boolean);

  const engine = NexusRealtime.createRealtimeGame({ kits, renderer: typeof NexusRealtime.createRenderer === "function" ? NexusRealtime.createRenderer("headless") : undefined });

  function applyInput(input = {}) {
    if (input.restart) engine.nextLedge.restart();
    if (input.advanceSector) engine.nextLedge.advanceSector();
    if (input.pause != null) engine.nextLedge.pause(input.pause);
    if (input.aimWorld) engine.nextLedge.setAimWorld(input.aimWorld.x, input.aimWorld.y);
    else if (input.aimVector) engine.nextLedge.setAimVector(input.aimVector.x, input.aimVector.y);
    engine.nextLedge.swingAxis(input.axis ?? 0);
    if (input.action) engine.nextLedge.action();
  }

  function update(dt, input = {}) {
    applyInput(input);
    syncDomain(engine, level);
    engine.tick(dt);
    return snapshot();
  }

  function snapshot() {
    const base = engine.nextLedge.getSnapshot();
    return { ...base, domain: domainSnapshot(engine) };
  }

  return { engine, NexusRealtime, DomainKits, level, update, snapshot, restart: () => engine.nextLedge.restart(), advanceSector: () => engine.nextLedge.advanceSector() };
}
