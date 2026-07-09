const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "physics-engine",
  "storage",
  "network"
]);

export const SORA_STORMGLASS_COURIER_DOMAIN_TREE = `sora-stormglass-courier-readiness-domain
├─ procedural-sky-route-domain
│  ├─ thermal-lane-domain
│  │  └─ sora-stormglass-thermal-lane-kit
│  └─ storm-cell-domain
│     └─ sora-stormglass-storm-cell-field-kit
├─ courier-flight-domain
│  ├─ wing-response-domain
│  │  └─ sora-stormglass-courier-flight-kit
│  └─ cargo-stability-domain
│     └─ sora-stormglass-cargo-stability-kit
├─ navigation-handoff-domain
│  ├─ signal-buoy-domain
│  │  └─ sora-stormglass-signal-buoy-kit
│  ├─ sanctuary-approach-domain
│  │  └─ sora-stormglass-sanctuary-approach-kit
│  └─ courier-objective-domain
│     └─ sora-stormglass-courier-objective-kit
├─ completion-ledger-domain
│  └─ sora-stormglass-dawn-courier-ledger-kit
└─ renderer-handoff
   └─ sora-stormglass-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const SORA_STORMGLASS_COURIER_KITS = Object.freeze([
  "sora-stormglass-thermal-lane-kit",
  "sora-stormglass-storm-cell-field-kit",
  "sora-stormglass-courier-flight-kit",
  "sora-stormglass-cargo-stability-kit",
  "sora-stormglass-signal-buoy-kit",
  "sora-stormglass-sanctuary-approach-kit",
  "sora-stormglass-courier-objective-kit",
  "sora-stormglass-dawn-courier-ledger-kit",
  "sora-stormglass-courier-renderer-handoff-kit",
  "sora-stormglass-courier-readiness-domain-kit"
]);

function clamp(value, min = 0, max = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function integer(value, min = 0, max = 999999) {
  return Math.max(min, Math.min(max, Math.floor(finite(value, min))));
}

function seededUnit(seed, index) {
  const value = Math.sin((seed + 13) * 83.173 + (index + 7) * 41.119) * 43758.5453123;
  return value - Math.floor(value);
}

function distance(a, b) {
  return Math.hypot(finite(a?.x) - finite(b?.x), finite(a?.y) - finite(b?.y));
}

function normalizeCollected(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((entry) => String(entry)))).slice(0, 12);
}

export function normalizeSoraStormglassCourierState(input = {}) {
  const state = input.stormglassCourier ?? input.state ?? input;
  return {
    seed: integer(state.seed, 0, 999999),
    tick: integer(state.tick, 0, 99999999),
    elapsed: clamp(finite(state.elapsed), 0, 9999),
    x: clamp(state.x ?? 0.08, 0.02, 0.98),
    y: clamp(state.y ?? 0.62, 0.03, 0.97),
    vx: clamp(state.vx ?? 0.095, 0.035, 0.22),
    vy: clamp(state.vy ?? 0, -0.24, 0.24),
    cargoIntegrity: clamp(state.cargoIntegrity ?? 1),
    collectedBuoyIds: normalizeCollected(state.collectedBuoyIds),
    delivery: Boolean(state.delivery),
    crashed: Boolean(state.crashed),
    score: integer(state.score, 0, 999999),
    phase: String(state.phase ?? "launching"),
    lastEvent: String(state.lastEvent ?? "courier-launched")
  };
}

function normalizedInput(input = {}) {
  const source = input.input ?? input;
  return {
    pitch: clamp(source.pitch, -1, 1),
    bank: clamp(source.bank, -1, 1),
    boost: Boolean(source.boost),
    brake: Boolean(source.brake)
  };
}

export function createSoraStormglassThermalLaneKit(config = {}) {
  const count = integer(config.count ?? 5, 3, 8);
  return Object.freeze({
    id: "sora-stormglass-thermal-lane-kit",
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      return Array.from({ length: count }, (_, index) => ({
        id: `thermal-lane-${index + 1}`,
        kind: "stormglass-thermal-lane",
        label: `thermal lane ${index + 1}`,
        x: 0.14 + index * (0.68 / Math.max(1, count - 1)),
        y: 0.2 + seededUnit(state.seed, index + 11) * 0.58,
        radius: 0.055 + seededUnit(state.seed, index + 31) * 0.035,
        lift: 0.035 + seededUnit(state.seed, index + 51) * 0.045,
        drift: (seededUnit(state.seed, index + 71) - 0.5) * 0.018
      }));
    }
  });
}

export function createSoraStormglassStormCellFieldKit(config = {}) {
  const count = integer(config.count ?? 6, 4, 9);
  return Object.freeze({
    id: "sora-stormglass-storm-cell-field-kit",
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      return Array.from({ length: count }, (_, index) => {
        const pulse = Math.sin(state.tick * 0.015 + index * 1.7) * 0.012;
        return {
          id: `storm-cell-${index + 1}`,
          kind: "stormglass-storm-cell",
          label: `storm cell ${index + 1}`,
          x: 0.22 + seededUnit(state.seed, index + 101) * 0.62,
          y: clamp(0.12 + seededUnit(state.seed, index + 121) * 0.72 + pulse, 0.08, 0.9),
          radius: 0.045 + seededUnit(state.seed, index + 141) * 0.055,
          turbulence: 0.35 + seededUnit(state.seed, index + 161) * 0.65,
          charge: 0.3 + seededUnit(state.seed, index + 181) * 0.7
        };
      });
    }
  });
}

export function createSoraStormglassSignalBuoyKit(config = {}) {
  const count = integer(config.count ?? 3, 3, 5);
  return Object.freeze({
    id: "sora-stormglass-signal-buoy-kit",
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      return Array.from({ length: count }, (_, index) => {
        const id = `signal-buoy-${index + 1}`;
        return {
          id,
          kind: "stormglass-signal-buoy",
          label: state.collectedBuoyIds.includes(id) ? "signal buoy tuned" : "signal buoy untuned",
          x: 0.26 + index * (0.43 / Math.max(1, count - 1)) + (seededUnit(state.seed, index + 211) - 0.5) * 0.045,
          y: 0.23 + seededUnit(state.seed, index + 231) * 0.55,
          tuned: state.collectedBuoyIds.includes(id),
          frequency: 118 + index * 7 + Math.round(seededUnit(state.seed, index + 251) * 4)
        };
      });
    }
  });
}

export function createSoraStormglassSanctuaryApproachKit() {
  return Object.freeze({
    id: "sora-stormglass-sanctuary-approach-kit",
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      return [{
        id: "stormglass-sanctuary-runway",
        kind: "stormglass-sanctuary-approach",
        label: state.delivery ? "stormglass delivered" : "sanctuary approach",
        x: 0.9,
        y: 0.68,
        width: 0.11,
        height: 0.075,
        open: state.collectedBuoyIds.length >= 3 && state.cargoIntegrity > 0,
        delivered: state.delivery
      }];
    }
  });
}

export function createSoraStormglassCourierFlightKit() {
  return Object.freeze({
    id: "sora-stormglass-courier-flight-kit",
    step(input = {}) {
      const state = normalizeSoraStormglassCourierState(input.state ?? input);
      const controls = normalizedInput(input.input ?? {});
      const dt = clamp(input.dt ?? 1 / 60, 1 / 240, 0.08);
      const thermalLanes = Array.isArray(input.thermalLanes) ? input.thermalLanes : [];
      let thermalLift = 0;
      let thermalDrift = 0;
      for (const lane of thermalLanes) {
        const influence = clamp(1 - distance(state, lane) / Math.max(0.001, finite(lane.radius, 0.05)));
        thermalLift += influence * finite(lane.lift, 0);
        thermalDrift += influence * finite(lane.drift, 0);
      }
      const targetSpeed = controls.boost ? 0.17 : controls.brake ? 0.065 : 0.105;
      const vx = clamp(state.vx + (targetSpeed - state.vx) * dt * 2.7, 0.04, 0.2);
      const gravity = 0.035;
      const pitchForce = controls.pitch * 0.145;
      const bankForce = controls.bank * 0.025;
      const vy = clamp(state.vy + (gravity - pitchForce - thermalLift + bankForce + thermalDrift) * dt, -0.2, 0.2);
      const nextX = state.x + vx * dt;
      const wrappedX = nextX > 1.02 ? 0.02 : nextX;
      const nextY = clamp(state.y + vy * dt, 0.03, 0.97);
      const boundaryHit = nextY <= 0.031 || nextY >= 0.969;
      return {
        ...state,
        tick: state.tick + 1,
        elapsed: state.elapsed + dt,
        x: wrappedX,
        y: nextY,
        vx,
        vy: boundaryHit ? -vy * 0.35 : vy,
        lastEvent: boundaryHit ? "altitude-boundary-brush" : state.lastEvent
      };
    }
  });
}

export function createSoraStormglassCargoStabilityKit() {
  return Object.freeze({
    id: "sora-stormglass-cargo-stability-kit",
    resolve(input = {}) {
      const state = normalizeSoraStormglassCourierState(input.state ?? input);
      const stormCells = Array.isArray(input.stormCells) ? input.stormCells : [];
      const dt = clamp(input.dt ?? 1 / 60, 1 / 240, 0.08);
      let exposure = 0;
      for (const cell of stormCells) {
        const influence = clamp(1 - distance(state, cell) / Math.max(0.001, finite(cell.radius, 0.05)));
        exposure += influence * finite(cell.turbulence, 0.5);
      }
      const impact = Math.abs(state.vy) > 0.17 ? (Math.abs(state.vy) - 0.17) * 0.8 : 0;
      const integrity = clamp(state.cargoIntegrity - (exposure * 0.085 + impact) * dt);
      return {
        ...state,
        cargoIntegrity: integrity,
        crashed: state.crashed || integrity <= 0.001,
        lastEvent: exposure > 0.15 ? "stormglass-turbulence" : state.lastEvent
      };
    },
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      return [{
        id: "stormglass-cargo-cradle",
        kind: "stormglass-cargo-stability",
        label: state.cargoIntegrity > 0.65 ? "cargo stable" : state.cargoIntegrity > 0.25 ? "cargo stressed" : "cargo critical",
        integrity: state.cargoIntegrity,
        x: state.x,
        y: state.y
      }];
    }
  });
}

export function createSoraStormglassCourierObjectiveKit() {
  return Object.freeze({
    id: "sora-stormglass-courier-objective-kit",
    resolve(input = {}) {
      const state = normalizeSoraStormglassCourierState(input.state ?? input);
      const buoys = Array.isArray(input.buoys) ? input.buoys : [];
      const landing = Array.isArray(input.landing) ? input.landing[0] : input.landing;
      const collected = new Set(state.collectedBuoyIds);
      let lastEvent = state.lastEvent;
      for (const buoy of buoys) {
        if (!collected.has(buoy.id) && distance(state, buoy) <= 0.045) {
          collected.add(buoy.id);
          lastEvent = `tuned-${buoy.id}`;
        }
      }
      const allSignals = collected.size >= buoys.length && buoys.length > 0;
      const nearLanding = landing ? Math.abs(state.x - landing.x) <= landing.width * 0.7 && Math.abs(state.y - landing.y) <= landing.height * 0.9 : false;
      const stableApproach = state.vx <= 0.135 && Math.abs(state.vy) <= 0.085;
      const delivery = state.delivery || (allSignals && nearLanding && stableApproach && state.cargoIntegrity > 0);
      const progress = buoys.length ? collected.size / buoys.length : 0;
      const readiness = clamp(progress * 0.55 + state.cargoIntegrity * 0.25 + clamp(state.x / 0.9) * 0.1 + (delivery ? 0.1 : 0));
      const phase = state.crashed ? "lost" : delivery ? "delivered" : allSignals ? "approach" : collected.size > 0 ? "routing" : "launching";
      return {
        ...state,
        collectedBuoyIds: [...collected],
        delivery,
        phase,
        score: Math.max(state.score, Math.round(readiness * 1000 + state.cargoIntegrity * 500)),
        lastEvent: delivery ? "stormglass-delivered" : lastEvent,
        readiness
      };
    },
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      const targetCount = integer(input.targetCount ?? 3, 1, 9);
      const progress = clamp(state.collectedBuoyIds.length / targetCount);
      const readiness = clamp(progress * 0.55 + state.cargoIntegrity * 0.25 + clamp(state.x / 0.9) * 0.1 + (state.delivery ? 0.1 : 0));
      return [{
        id: "stormglass-courier-objective",
        kind: "stormglass-courier-objective",
        label: state.delivery ? "courier route complete" : `${state.collectedBuoyIds.length}/${targetCount} signal buoys tuned`,
        phase: state.phase,
        readiness,
        cargoIntegrity: state.cargoIntegrity,
        delivered: state.delivery,
        score: state.score
      }];
    }
  });
}

export function createSoraStormglassDawnCourierLedgerKit() {
  return Object.freeze({
    id: "sora-stormglass-dawn-courier-ledger-kit",
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input);
      const targetCount = integer(input.targetCount ?? 3, 1, 9);
      return [{
        id: "stormglass-dawn-courier-ledger",
        kind: "stormglass-dawn-courier-ledger",
        label: state.delivery ? "dawn courier ledger sealed" : "dawn courier ledger open",
        phase: state.phase,
        tunedSignals: state.collectedBuoyIds.length,
        targetSignals: targetCount,
        cargoIntegrity: state.cargoIntegrity,
        elapsed: state.elapsed,
        score: state.score,
        delivered: state.delivery,
        blockers: [
          state.collectedBuoyIds.length < targetCount ? "signal-chain-incomplete" : null,
          state.cargoIntegrity <= 0 ? "stormglass-lost" : null,
          !state.delivery ? "sanctuary-handoff-open" : null
        ].filter(Boolean)
      }];
    }
  });
}

export function createSoraStormglassCourierRendererHandoffKit() {
  return Object.freeze({
    id: "sora-stormglass-courier-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = input.descriptors ?? {};
      const descriptorCounts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      return {
        kind: "sora-stormglass-courier-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: [...FORBIDDEN_OWNERSHIP],
        descriptors,
        descriptorCounts
      };
    }
  });
}

export function createSoraStormglassCourierReadinessDomainKit(config = {}) {
  const thermalLaneKit = createSoraStormglassThermalLaneKit(config.thermalLanes);
  const stormCellKit = createSoraStormglassStormCellFieldKit(config.stormCells);
  const flightKit = createSoraStormglassCourierFlightKit();
  const cargoKit = createSoraStormglassCargoStabilityKit();
  const buoyKit = createSoraStormglassSignalBuoyKit(config.signalBuoys);
  const approachKit = createSoraStormglassSanctuaryApproachKit();
  const objectiveKit = createSoraStormglassCourierObjectiveKit();
  const ledgerKit = createSoraStormglassDawnCourierLedgerKit();
  const handoffKit = createSoraStormglassCourierRendererHandoffKit();

  const api = {
    id: "sora-stormglass-courier-readiness-domain-kit",
    tree: SORA_STORMGLASS_COURIER_DOMAIN_TREE,
    kits: Object.freeze([thermalLaneKit, stormCellKit, flightKit, cargoKit, buoyKit, approachKit, objectiveKit, ledgerKit, handoffKit]),
    createInitialState(seed = 741) {
      return normalizeSoraStormglassCourierState({ seed, x: 0.08, y: 0.62, vx: 0.095, cargoIntegrity: 1 });
    },
    step(input = {}) {
      const state = normalizeSoraStormglassCourierState(input.state ?? input);
      const dt = input.dt ?? 1 / 60;
      const thermalLanes = thermalLaneKit.describe(state);
      const stormCells = stormCellKit.describe(state);
      const moved = flightKit.step({ state, input: input.input, dt, thermalLanes });
      const stabilized = cargoKit.resolve({ state: moved, stormCells, dt });
      const buoys = buoyKit.describe(stabilized);
      const landing = approachKit.describe(stabilized);
      return objectiveKit.resolve({ state: stabilized, buoys, landing });
    },
    describe(input = {}) {
      const state = normalizeSoraStormglassCourierState(input.state ?? input);
      const thermalLanes = thermalLaneKit.describe(state);
      const stormCells = stormCellKit.describe(state);
      const signalBuoys = buoyKit.describe(state);
      const sanctuaryApproach = approachKit.describe(state);
      const cargoStability = cargoKit.describe(state);
      const courierObjective = objectiveKit.describe({ ...state, targetCount: signalBuoys.length });
      const dawnCourierLedger = ledgerKit.describe({ ...state, targetCount: signalBuoys.length });
      const rendererHandoff = handoffKit.describe({
        descriptors: {
          thermalLanes,
          stormCells,
          signalBuoys,
          sanctuaryApproach,
          cargoStability,
          courierObjective,
          dawnCourierLedger
        }
      });
      return {
        id: api.id,
        tree: api.tree,
        state,
        readiness: courierObjective[0].readiness,
        phase: state.phase,
        rendererHandoff,
        summary: {
          tunedSignals: state.collectedBuoyIds.length,
          targetSignals: signalBuoys.length,
          cargoIntegrity: state.cargoIntegrity,
          delivered: state.delivery,
          score: state.score
        }
      };
    }
  };
  return Object.freeze(api);
}
