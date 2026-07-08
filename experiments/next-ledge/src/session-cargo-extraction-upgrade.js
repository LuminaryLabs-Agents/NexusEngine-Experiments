import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createGenericRouteCargoExtractionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-route-cargo-extraction-kit/index.js";
import { createNextLedgeSession as createVisualNextLedgeSession } from "./session-visual-upgrade.js";
import { createNextLedgeRouteCargoDomainKit } from "./route-cargo-fractal-kits.js";

function createRuntimeEngine(options = {}) {
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  if (typeof createEngine !== "function") {
    throw new Error("NexusEngine CDN runtime did not expose createRealtimeGame/createRealtimeEngine/createEngine.");
  }
  return createEngine(options);
}

function createHeadlessRenderer() {
  if (typeof NexusEngine.createRenderer === "function") return NexusEngine.createRenderer("headless");
  if (typeof NexusEngine.createHeadlessRenderer === "function") return NexusEngine.createHeadlessRenderer();
  return undefined;
}

function routeKey(snapshot = {}) {
  return `${snapshot.levelId ?? snapshot.route?.id ?? "next-ledge"}:${snapshot.sector ?? 1}:${snapshot.route?.ledges?.length ?? 0}`;
}

function cargoFacade(engine) {
  return engine?.n?.genericRouteCargoExtraction ?? engine?.genericRouteCargoExtraction;
}

function eventKey(event = {}) {
  return `${event.at}:${event.type}:${event.targetId ?? event.reason ?? event.sector ?? ""}`;
}

function createCargoRuntime(snapshot = {}, cargoDomain) {
  const config = cargoDomain.createConfig(snapshot);
  const engine = createRuntimeEngine({
    kits: [createGenericRouteCargoExtractionKit(NexusEngine, config)],
    renderer: createHeadlessRenderer()
  });
  engine.tick?.(0);
  return { engine, config, key: routeKey(snapshot) };
}

export function createNextLedgeSession(options = {}) {
  const base = createVisualNextLedgeSession(options);
  const cargoDomain = createNextLedgeRouteCargoDomainKit(options.routeCargo ?? {});
  let runtime = createCargoRuntime(base.snapshot(), cargoDomain);
  const syncedEvents = new Set();

  function resetCargo(snapshot = {}, reason = "route-cargo-reset") {
    const config = cargoDomain.createConfig(snapshot);
    cargoFacade(runtime.engine)?.reset?.({
      route: config.route,
      resources: config.cargoResources,
      pressureChannels: config.pressureChannels,
      reason
    });
    runtime.engine.tick?.(0);
    runtime = { ...runtime, config, key: routeKey(snapshot) };
  }

  function ensureRuntime(snapshot = {}) {
    const key = routeKey(snapshot);
    if (key !== runtime.key) resetCargo(snapshot, "route-cargo-route-changed");
    return runtime.engine;
  }

  function syncCargoEvents(snapshot = {}) {
    const engine = ensureRuntime(snapshot);
    const facade = cargoFacade(engine);
    if (!facade) return null;

    for (const evt of snapshot.recentEvents ?? []) {
      const key = eventKey(evt);
      if (syncedEvents.has(key)) continue;
      syncedEvents.add(key);

      if (["anchor-locked", "restored", "summit-reached"].includes(evt.type) && evt.targetId) {
        facade.enterCheckpoint?.(evt.targetId, { actorId: "next-ledge-climber", commandId: `cargo:${key}:enter` });
        facade.completeCheckpoint?.(evt.targetId, { allowOutOfOrder: true, actorId: "next-ledge-climber", commandId: `cargo:${key}:complete` });
      }

      if (evt.type === "anchor-locked" && evt.type !== "summit") {
        facade.pickupCargo?.("anchor-signal-cargo", evt.type === "rest" ? 1 : 0.25, { commandId: `cargo:${key}:anchor-pickup`, reason: "anchor-lock" });
        facade.recoverPressure?.("fall-pressure", 4, { commandId: `cargo:${key}:anchor-recover`, reason: "anchor-lock" });
      }
      if (evt.type === "restored") {
        facade.pickupCargo?.("anchor-signal-cargo", 1, { commandId: `cargo:${key}:rest-pickup`, reason: "rest-cache" });
        facade.recoverPressure?.("fall-pressure", 18, { commandId: `cargo:${key}:rest-recover", reason: "rest-cache" });
      }
      if (evt.type === "summit-reached") {
        facade.deliverCargo?.("anchor-signal-cargo", 99, { commandId: `cargo:${key}:summit-delivery`, reason: "summit-delivery" });
        facade.recoverPressure?.("fall-pressure", 100, { commandId: `cargo:${key}:summit-clear`, reason: "summit-clear" });
      }
      if (evt.type === "released") facade.adjustPressure?.("fall-pressure", 3, { commandId: `cargo:${key}:release-pressure`, reason: "released" });
      if (evt.type === "wall-bounced") facade.adjustPressure?.("fall-pressure", 9, { commandId: `cargo:${key}:wall-pressure`, reason: "wall-bounced" });
      if (evt.type === "failed") facade.adjustPressure?.("fall-pressure", 100, { commandId: `cargo:${key}:fail-pressure`, reason: "failed" });
    }

    if (syncedEvents.size > 128) {
      const keep = Array.from(syncedEvents).slice(-64);
      syncedEvents.clear();
      keep.forEach((key) => syncedEvents.add(key));
    }

    engine.tick?.(0);
    return facade.getSnapshot?.() ?? null;
  }

  function decorate(snapshot = {}) {
    const cargoSnapshot = syncCargoEvents(snapshot);
    const routeCargoVisual = cargoDomain.describe(snapshot, cargoSnapshot);
    const visualQuality = snapshot.domain?.visualQuality ?? {};
    return {
      ...snapshot,
      domain: {
        ...(snapshot.domain ?? {}),
        routeCargoExtraction: cargoSnapshot,
        routeCargoVisual,
        visualQuality: {
          ...visualQuality,
          uses: [
            ...(visualQuality.uses ?? []),
            "generic-route-cargo-extraction-kit",
            "generic-resource-loop-kit",
            "generic-pressure-loop-kit",
            "next-ledge-route-cargo-domain-kit",
            "cargo-cache-anchor-kit",
            "cargo-route-thread-kit",
            "extraction-pressure-channel-kit",
            "extraction-summit-handoff-kit",
            "cargo-status-descriptor-kit",
            "route-cargo-renderer-handoff-kit"
          ],
          routeCargoDescriptors: routeCargoVisual.rendererHandoff.descriptorCount
        }
      }
    };
  }

  function update(dt, input = {}) {
    return decorate(base.update(dt, input));
  }

  function snapshot() {
    return decorate(base.snapshot());
  }

  function restart(message) {
    const next = base.restart(message);
    resetCargo(next, "next-ledge-restart");
    return decorate(next);
  }

  function advanceSector(sector) {
    const next = base.advanceSector(sector);
    resetCargo(next, "next-ledge-sector-advance");
    return decorate(next);
  }

  return {
    ...base,
    cargoEngine: runtime.engine,
    routeCargoDomain: cargoDomain,
    update,
    snapshot,
    restart,
    advanceSector
  };
}

export default createNextLedgeSession;
