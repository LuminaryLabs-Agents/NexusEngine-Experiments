import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createGenericRouteCargoExtractionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08/protokits/generic-route-cargo-extraction-kit/index.js";
import { createNextLedgeSession as createVisualNextLedgeSession } from "./session-visual-upgrade.js?v=post-stormlock-payoff-1";
import { createNextLedgeRouteCargoDomainKit } from "./route-cargo-fractal-kits.js";
import { createNextLedgeTraversalReadabilityDomainKit } from "./traversal-readability-kits.js";
import { createNextLedgeAnchorTimingReadabilityDomainKit } from "./anchor-timing-readability-kits.js";

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

function syncCurrentCargoCheckpoint(engine, snapshot = {}, reason = "route-cargo-current-anchor") {
  const facade = cargoFacade(engine);
  const checkpointId = snapshot.currentAnchorId;
  if (!facade || !checkpointId) return;
  facade.enterCheckpoint?.(checkpointId, { actorId: "next-ledge-climber", commandId: `${reason}:${checkpointId}:enter` });
  facade.completeCheckpoint?.(checkpointId, { allowOutOfOrder: true, actorId: "next-ledge-climber", commandId: `${reason}:${checkpointId}:complete` });
}

function createCargoRuntime(snapshot = {}, cargoDomain) {
  const config = cargoDomain.createConfig(snapshot);
  const engine = createRuntimeEngine({
    kits: [createGenericRouteCargoExtractionKit(NexusEngine, config)],
    renderer: createHeadlessRenderer()
  });
  engine.tick?.(0);
  syncCurrentCargoCheckpoint(engine, snapshot, "route-cargo-initial-anchor");
  engine.tick?.(0);
  return { engine, config, key: routeKey(snapshot) };
}

export function createNextLedgeSession(options = {}) {
  const base = createVisualNextLedgeSession(options);
  const cargoDomain = createNextLedgeRouteCargoDomainKit(options.routeCargo ?? {});
  const traversalReadabilityDomain = createNextLedgeTraversalReadabilityDomainKit(options.traversalReadability ?? {});
  const anchorTimingReadabilityDomain = createNextLedgeAnchorTimingReadabilityDomainKit(options.anchorTimingReadability ?? {});
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
    syncCurrentCargoCheckpoint(runtime.engine, snapshot, `${reason}:current-anchor`);
    runtime.engine.tick?.(0);
    runtime = { ...runtime, config, key: routeKey(snapshot) };
    syncedEvents.clear();
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

      const anchorRole = ["normal", "rest", "summit"].includes(evt.type) ? evt.type : evt.anchorType;
      const isAnchorLock = evt.type === "anchor-locked" || Boolean(anchorRole && evt.targetId);

      if ((isAnchorLock || ["restored", "summit-reached", "route-choice-skipped"].includes(evt.type)) && evt.targetId) {
        facade.enterCheckpoint?.(evt.targetId, { actorId: "next-ledge-climber", commandId: `cargo:${key}:enter` });
        facade.completeCheckpoint?.(evt.targetId, { allowOutOfOrder: true, actorId: "next-ledge-climber", commandId: `cargo:${key}:complete` });
      }

      if (isAnchorLock && anchorRole !== "summit") {
        facade.pickupCargo?.("anchor-signal-cargo", anchorRole === "rest" ? 1 : 0.25, { commandId: `cargo:${key}:anchor-pickup`, reason: "anchor-lock" });
        facade.recoverPressure?.("fall-pressure", anchorRole === "rest" ? 12 : 4, { commandId: `cargo:${key}:anchor-recover`, reason: "anchor-lock" });
      }
      if (evt.type === "restored") {
        facade.pickupCargo?.("anchor-signal-cargo", 1, { commandId: `cargo:${key}:rest-pickup`, reason: "rest-cache" });
        facade.recoverPressure?.("fall-pressure", 18, { commandId: `cargo:${key}:rest-recover`, reason: "rest-cache" });
      }
      if (evt.type === "summit-reached" || anchorRole === "summit") {
        facade.deliverCargo?.("anchor-signal-cargo", 99, { commandId: `cargo:${key}:summit-delivery`, reason: "summit-delivery" });
        facade.recoverPressure?.("fall-pressure", 100, { commandId: `cargo:${key}:summit-clear`, reason: "summit-clear" });
      }
      if (evt.type === "released") facade.adjustPressure?.("fall-pressure", 3, { commandId: `cargo:${key}:release-pressure`, reason: "released" });
      if (evt.type === "wall-bounced") facade.adjustPressure?.("fall-pressure", 9, { commandId: `cargo:${key}:wall-pressure`, reason: "wall-bounced" });
      if (evt.type === "failed") facade.adjustPressure?.("fall-pressure", 100, { commandId: `cargo:${key}:fail-pressure`, reason: "failed" });
      if (evt.type === "counterwind-pressure-surged") facade.adjustPressure?.("fall-pressure", Number(evt.pressureDelta ?? 0), { commandId: `cargo:${key}:counterwind-surge`, reason: evt.openingRole ?? "counterwind-surge" });
      if (evt.type === "counterwind-recovered") facade.recoverPressure?.("fall-pressure", Number(evt.pressureRecovery ?? 100), { commandId: `cargo:${key}:counterwind-recovery`, reason: "counterwind-rest" });
      if (evt.type === "post-rest-route-choice-committed" && evt.selectedRole === "pressure-shortcut") {
        facade.pickupCargo?.("anchor-signal-cargo", Number(evt.cargoBonus ?? 0), { commandId: `cargo:${key}:shortcut-cache`, reason: "signal-shortcut" });
        facade.adjustPressure?.("fall-pressure", Number(evt.pressureDelta ?? 0), { commandId: `cargo:${key}:shortcut-pressure`, reason: "signal-shortcut" });
      }
      if (evt.type === "post-rejoin-pressure-vented") {
        facade.recoverPressure?.("fall-pressure", Number(evt.pressureRecovery ?? 100), { commandId: `cargo:${key}:stormlock-vent`, reason: "post-rejoin-pressure-vent" });
      }
      if (evt.type === "post-stormlock-payoff-opened" && evt.selectedRole === "pressure-shortcut") {
        facade.deliverCargo?.("anchor-signal-cargo", Number(evt.cargoRequired ?? 0), { commandId: `cargo:${key}:cacheline-unlock`, reason: "amber-high-line-unlock" });
      }
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
    const traversalReadability = traversalReadabilityDomain.describe(snapshot, cargoSnapshot);
    const anchorTimingReadability = anchorTimingReadabilityDomain.describe(snapshot, cargoSnapshot, traversalReadability);
    const visualQuality = snapshot.domain?.visualQuality ?? {};
    return {
      ...snapshot,
      domain: {
        ...(snapshot.domain ?? {}),
        routeCargoExtraction: cargoSnapshot,
        routeCargoVisual,
        traversalReadability,
        anchorTimingReadability,
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
            "route-cargo-renderer-handoff-kit",
            "next-ledge-traversal-readability-domain-kit",
            "swing-arc-forecast-kit",
            "anchor-confidence-field-kit",
            "stamina-risk-band-kit",
            "recovery-vector-kit",
            "momentum-window-kit",
            "summit-route-beat-kit",
            "traversal-readability-renderer-handoff-kit",
            "next-ledge-anchor-timing-readability-domain-kit",
            "anchor-release-timing-dial-kit",
            "grapple-line-of-sight-strip-kit",
            "swing-energy-pocket-kit",
            "wall-bounce-warning-field-kit",
            "route-commitment-stair-kit",
            "fail-floor-proximity-wave-kit",
            "anchor-timing-renderer-handoff-kit"
          ],
          routeCargoDescriptors: routeCargoVisual.rendererHandoff.descriptorCount,
          traversalReadabilityDescriptors: traversalReadability.rendererHandoff.descriptorCount,
          anchorTimingReadabilityDescriptors: anchorTimingReadability.rendererHandoff.descriptorCount
        }
      }
    };
  }

  function update(dt, input = {}) {
    const next = base.update(dt, input);
    if (input.restart) resetCargo(next, "next-ledge-input-restart");
    return decorate(next);
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
    traversalReadabilityDomain,
    anchorTimingReadabilityDomain,
    update,
    snapshot,
    restart,
    advanceSector
  };
}

export default createNextLedgeSession;
