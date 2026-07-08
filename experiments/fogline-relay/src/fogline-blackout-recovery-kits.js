export const FOGLINE_BLACKOUT_RECOVERY_DOMAIN_TREE = `fogline-blackout-recovery-readiness-domain
├─ power-restoration-domain
│  ├─ fuse-junction-domain
│  │  └─ fogline-fuse-junction-kit
│  └─ relay-reboot-domain
│     └─ fogline-relay-reboot-coil-kit
├─ civilian-guidance-domain
│  ├─ lantern-chain-domain
│  │  └─ fogline-lantern-chain-kit
│  └─ siren-silence-domain
│     └─ fogline-siren-silence-perimeter-kit
├─ extraction-reserve-domain
│  ├─ generator-fuel-domain
│  │  └─ fogline-generator-fuel-cache-kit
│  └─ dawn-switch-domain
│     └─ fogline-dawn-switch-window-kit
└─ renderer-handoff
   └─ fogline-blackout-recovery-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const FOGLINE_BLACKOUT_RECOVERY_KIT_NAMES = Object.freeze([
  "fogline-fuse-junction-kit",
  "fogline-relay-reboot-coil-kit",
  "fogline-lantern-chain-kit",
  "fogline-siren-silence-perimeter-kit",
  "fogline-generator-fuel-cache-kit",
  "fogline-dawn-switch-window-kit",
  "fogline-blackout-recovery-renderer-handoff-kit",
  "fogline-blackout-recovery-readiness-domain-kit"
]);

const BUCKET_ARCHETYPES = Object.freeze({
  routeThreads: "fogline.route.thread",
  relayAuras: "fogline.relay.aura",
  scanCones: "fogline.scan.cone",
  objectiveNeedles: "fogline.objective.needle",
  gateSigils: "fogline.gate.sigil",
  safePockets: "fogline.safe.pocket",
  pressureVignettes: "fogline.pressure.vignette"
});

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function pointOf(value = {}, fallback = {}) {
  return {
    x: safeNumber(value.x, safeNumber(fallback.x, 0)),
    z: safeNumber(value.z, safeNumber(fallback.z, 0))
  };
}

function distance(a = {}, b = {}) {
  const ax = safeNumber(a.x);
  const az = safeNumber(a.z);
  const bx = safeNumber(b.x);
  const bz = safeNumber(b.z);
  return Math.hypot(bx - ax, bz - az);
}

function midpoint(a = {}, b = {}) {
  return {
    x: (safeNumber(a.x) + safeNumber(b.x)) * 0.5,
    z: (safeNumber(a.z) + safeNumber(b.z)) * 0.5
  };
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(safeNumber(b.x) - safeNumber(a.x), safeNumber(b.z) - safeNumber(a.z));
}

function scanProgress(relay = {}) {
  if (relay.scanned) return 1;
  return clamp01(safeNumber(relay.scanProgress, 0));
}

function blackoutPressure(game = {}, level = {}) {
  const relays = game.relays ?? level.relays ?? [];
  const scanned = relays.reduce((total, relay) => total + scanProgress(relay), 0);
  const scanRatio = clamp01(scanned / Math.max(1, relays.length));
  const elapsed = safeNumber(game.stats?.elapsed, 0);
  const budget = Math.max(1, safeNumber(game.stats?.timeBudget, 420));
  const timePressure = clamp01(elapsed / budget);
  const chasePressure = clamp01((game.wraiths ?? level.wraiths ?? []).filter((wraith) => wraith.mode === "chase").length / Math.max(1, (game.wraiths ?? level.wraiths ?? []).length));
  return clamp01(0.22 + (1 - scanRatio) * 0.34 + timePressure * 0.26 + chasePressure * 0.18);
}

function descriptor({ id, archetype, bucket, position, yaw = 0, radius = 1, width = 1, length = 1, opacity = 0.1, color = "#bafcff", extra = {} }) {
  return {
    id,
    archetype,
    originalArchetype: archetype,
    compatibleBucket: bucket,
    compatibleArchetype: BUCKET_ARCHETYPES[bucket] ?? archetype,
    position: pointOf(position),
    yaw: safeNumber(yaw),
    radius: Math.max(0.1, safeNumber(radius, 1)),
    width: Math.max(0.1, safeNumber(width, 1)),
    length: Math.max(0.1, safeNumber(length, 1)),
    opacity: clamp01(opacity),
    color,
    ...extra
  };
}

export function createFoglineFuseJunctionKit() {
  return {
    id: "fogline-fuse-junction-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const relays = input.game?.relays ?? level.relays ?? [];
      const pressure = blackoutPressure(input.game, level);
      return relays.map((relay, index) => {
        const progress = scanProgress(relay);
        const urgency = clamp01(pressure + (1 - progress) * 0.42 + index * 0.035);
        return descriptor({
          id: `blackout-fuse-junction-${relay.id ?? index}`,
          archetype: "fogline.blackout.fuse.junction",
          bucket: "objectiveNeedles",
          position: { x: safeNumber(relay.x) + (index % 2 === 0 ? -1.2 : 1.2), z: safeNumber(relay.z) + 0.8 },
          yaw: safeNumber(input.game?.player?.yaw, 0) + index * 0.22,
          radius: 1.3 + urgency * 2.8,
          width: 0.32 + urgency * 0.48,
          opacity: 0.08 + urgency * 0.15,
          color: progress > 0.68 ? "#d7ff96" : "#ffcf7b",
          extra: { progress, urgency, repairOrder: index + 1 }
        });
      });
    }
  };
}

export function createFoglineRelayRebootCoilKit() {
  return {
    id: "fogline-relay-reboot-coil-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const relays = input.game?.relays ?? level.relays ?? [];
      const pressure = blackoutPressure(input.game, level);
      return relays.map((relay, index) => {
        const rebootLoad = clamp01(1 - scanProgress(relay) * 0.58 + pressure * 0.24);
        return descriptor({
          id: `relay-reboot-coil-${relay.id ?? index}`,
          archetype: "fogline.blackout.relay.reboot.coil",
          bucket: index % 2 === 0 ? "relayAuras" : "scanCones",
          position: relay,
          yaw: safeNumber(relay.yaw, 0) + pressure * 0.5,
          radius: 2.1 + rebootLoad * 4.2,
          width: 0.28 + rebootLoad * 0.46,
          length: 4.4 + rebootLoad * 7.8,
          opacity: 0.07 + rebootLoad * 0.15,
          color: rebootLoad > 0.72 ? "#ff8ea1" : "#9fffe9",
          extra: { rebootLoad, coilStable: rebootLoad < 0.76 }
        });
      });
    }
  };
}

export function createFoglineLanternChainKit() {
  return {
    id: "fogline-lantern-chain-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const pressure = blackoutPressure(input.game, level);
      return route.slice(0, -1).map((point, index) => {
        const next = route[index + 1];
        const segmentLength = distance(point, next);
        return descriptor({
          id: `lantern-chain-${index + 1}`,
          archetype: "fogline.blackout.lantern.chain",
          bucket: "routeThreads",
          position: midpoint(point, next),
          yaw: yawBetween(point, next),
          length: segmentLength,
          width: 0.34 + pressure * 0.62,
          opacity: 0.06 + pressure * 0.12,
          color: "#ffe68a",
          extra: { segmentLength, lampCount: Math.max(2, Math.round(segmentLength / 3)), blackoutSafe: pressure < 0.84 }
        });
      });
    }
  };
}

export function createFoglineSirenSilencePerimeterKit() {
  return {
    id: "fogline-siren-silence-perimeter-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const wraiths = input.game?.wraiths ?? level.wraiths ?? [];
      const route = input.route ?? level.route ?? [];
      const fallback = route[Math.floor(route.length * 0.68)] ?? level.gate ?? {};
      const pressure = blackoutPressure(input.game, level);
      const sources = wraiths.length ? wraiths : [fallback];
      return sources.slice(0, 4).map((source, index) => {
        const threat = clamp01((source.mode === "chase" ? 0.42 : 0.14) + pressure + index * 0.06);
        return descriptor({
          id: `siren-silence-perimeter-${source.id ?? index}`,
          archetype: "fogline.blackout.siren.silence.perimeter",
          bucket: "pressureVignettes",
          position: source,
          yaw: index * 0.45,
          radius: 2.7 + threat * 5.4,
          width: 0.38 + threat * 0.58,
          opacity: 0.05 + threat * 0.17,
          color: threat > 0.78 ? "#ff7894" : "#c7c2ff",
          extra: { threat, muted: threat < 0.7 }
        });
      });
    }
  };
}

export function createFoglineGeneratorFuelCacheKit() {
  return {
    id: "fogline-generator-fuel-cache-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const player = input.game?.player ?? level.spawn ?? route[0] ?? {};
      const gate = input.game?.gate ?? level.gate ?? route[route.length - 1] ?? {};
      const mid = route[Math.floor(route.length * 0.5)] ?? midpoint(player, gate);
      const pressure = blackoutPressure(input.game, level);
      return [player, mid, gate].map((point, index) => {
        const fuel = clamp01(0.85 - pressure * 0.36 - index * 0.08 + safeNumber(input.game?.stats?.scanBursts, 0) * 0.015);
        return descriptor({
          id: `generator-fuel-cache-${index + 1}`,
          archetype: "fogline.blackout.generator.fuel.cache",
          bucket: "safePockets",
          position: { x: safeNumber(point.x) + (index - 1) * 1.8, z: safeNumber(point.z) - 1.4 },
          yaw: yawBetween(player, gate),
          radius: 1.5 + fuel * 2.6,
          width: 0.28 + fuel * 0.46,
          opacity: 0.07 + fuel * 0.12,
          color: fuel > 0.5 ? "#caffb0" : "#ffb06d",
          extra: { fuel, reserveIndex: index + 1 }
        });
      });
    }
  };
}

export function createFoglineDawnSwitchWindowKit() {
  return {
    id: "fogline-dawn-switch-window-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const gate = game.gate ?? level.gate ?? {};
      const relays = game.relays ?? level.relays ?? [];
      const scanned = relays.reduce((total, relay) => total + scanProgress(relay), 0);
      const readiness = clamp01(scanned / Math.max(1, relays.length));
      const pressure = blackoutPressure(game, level);
      return [
        descriptor({
          id: "dawn-switch-gate-window",
          archetype: "fogline.blackout.dawn.switch.window",
          bucket: "gateSigils",
          position: gate,
          radius: 2.2 + readiness * 5.1,
          width: 0.44 + readiness * 0.58,
          opacity: 0.09 + readiness * 0.17,
          color: readiness > 0.72 ? "#fff5a6" : "#ff9f80",
          extra: { readiness, secondsOpen: Math.round(12 + readiness * 46 - pressure * 8) }
        }),
        descriptor({
          id: "blackout-return-switch-debt",
          archetype: "fogline.blackout.return.switch.debt",
          bucket: "objectiveNeedles",
          position: { x: safeNumber(gate.x) - 3.8, z: safeNumber(gate.z) - 2.6 },
          radius: 1.6 + pressure * 3.2,
          width: 0.4 + pressure * 0.45,
          opacity: 0.07 + pressure * 0.15,
          color: "#a7d8ff",
          extra: { pressure, switchDebt: clamp01(1 - readiness + pressure * 0.3) }
        })
      ];
    }
  };
}

export function createFoglineBlackoutRecoveryRendererHandoffKit() {
  return {
    id: "fogline-blackout-recovery-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = domain.drawOrder ?? [];
      return {
        id: "fogline-blackout-recovery-renderer-handoff",
        archetype: "fogline.blackout.recovery.renderer.handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        counts: {
          fuseJunctions: domain.fuseJunctions?.length ?? 0,
          relayRebootCoils: domain.relayRebootCoils?.length ?? 0,
          lanternChainThreads: domain.lanternChainThreads?.length ?? 0,
          sirenSilencePerimeters: domain.sirenSilencePerimeters?.length ?? 0,
          generatorFuelCaches: domain.generatorFuelCaches?.length ?? 0,
          dawnSwitchWindows: domain.dawnSwitchWindows?.length ?? 0
        },
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
  };
}

export function createFoglineBlackoutRecoveryReadinessDomainKit() {
  const fuseJunctionKit = createFoglineFuseJunctionKit();
  const relayRebootCoilKit = createFoglineRelayRebootCoilKit();
  const lanternChainKit = createFoglineLanternChainKit();
  const sirenSilencePerimeterKit = createFoglineSirenSilencePerimeterKit();
  const generatorFuelCacheKit = createFoglineGeneratorFuelCacheKit();
  const dawnSwitchWindowKit = createFoglineDawnSwitchWindowKit();
  const rendererHandoffKit = createFoglineBlackoutRecoveryRendererHandoffKit();
  return {
    id: "fogline-blackout-recovery-readiness-domain-kit",
    tree: FOGLINE_BLACKOUT_RECOVERY_DOMAIN_TREE,
    kitNames: FOGLINE_BLACKOUT_RECOVERY_KIT_NAMES,
    describe(input = {}) {
      const fuseJunctions = fuseJunctionKit.describe(input);
      const relayRebootCoils = relayRebootCoilKit.describe(input);
      const lanternChainThreads = lanternChainKit.describe(input);
      const sirenSilencePerimeters = sirenSilencePerimeterKit.describe(input);
      const generatorFuelCaches = generatorFuelCacheKit.describe(input);
      const dawnSwitchWindows = dawnSwitchWindowKit.describe(input);
      const drawOrder = [
        ...lanternChainThreads,
        ...generatorFuelCaches,
        ...relayRebootCoils,
        ...fuseJunctions,
        ...sirenSilencePerimeters,
        ...dawnSwitchWindows
      ];
      const domain = {
        id: "fogline-blackout-recovery-readiness-domain",
        archetype: "fogline.blackout.recovery.readiness.domain",
        tree: FOGLINE_BLACKOUT_RECOVERY_DOMAIN_TREE,
        fuseJunctions,
        relayRebootCoils,
        lanternChainThreads,
        sirenSilencePerimeters,
        generatorFuelCaches,
        dawnSwitchWindows,
        drawOrder
      };
      return {
        ...domain,
        rendererHandoff: rendererHandoffKit.describe(domain)
      };
    }
  };
}
