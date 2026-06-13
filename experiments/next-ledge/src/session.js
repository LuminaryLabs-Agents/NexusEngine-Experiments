import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
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

export function createNextLedgeSession(options = {}) {
  const level = createProceduralNextLedgeLevel({ seed: options.seed ?? "summit-recovery-protocol", summitBase: options.summitBase ?? 2200, summitStep: options.summitStep ?? 800 });
  const kits = [
    optionalKit(NexusRealtime.createRenderDescriptorKit, level),
    level.sceneRecipe ? optionalKit(NexusRealtime.createInteractionTargetKit, { sceneRecipe: level.sceneRecipe }) : null,
    optionalKit(NexusRealtime.createObjectiveFlowKit, { id: level.id, steps: level.steps ?? [] }),
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
    engine.tick(dt);
    return snapshot();
  }

  function snapshot() {
    return engine.nextLedge.getSnapshot();
  }

  return { engine, NexusRealtime, level, update, snapshot, restart: () => engine.nextLedge.restart(), advanceSector: () => engine.nextLedge.advanceSector() };
}
