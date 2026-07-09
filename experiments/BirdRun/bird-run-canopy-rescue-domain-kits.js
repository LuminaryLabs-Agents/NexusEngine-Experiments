export const BIRD_RUN_CANOPY_RESCUE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

export const BIRD_RUN_CANOPY_RESCUE_DOMAIN_TREE = `bird-run-canopy-rescue-readiness-domain
├─ flight-control-domain
│  ├─ lane-intent-domain
│  │  └─ bird-run-lane-intent-kit
│  └─ wingbeat-motion-domain
│     └─ bird-run-wingbeat-motion-kit
├─ forest-course-domain
│  ├─ obstacle-grove-domain
│  │  └─ bird-run-obstacle-grove-kit
│  └─ nestling-rescue-domain
│     └─ bird-run-nestling-rescue-beacon-kit
├─ scoring-safety-domain
│  ├─ collision-window-domain
│  │  └─ bird-run-collision-window-kit
│  └─ rescue-ledger-domain
│     └─ bird-run-rescue-ledger-kit
└─ renderer-handoff
   └─ bird-run-canopy-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const BIRD_RUN_CANOPY_RESCUE_FORBIDDEN_OWNERS = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

const LANES = Object.freeze([-1, 0, 1]);
const OBSTACLE_SPACING = 86;
const WINDOW = 14;

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, finite(value, min)));
}

function laneFrom(value) {
  const lane = Math.round(clamp(value, -1, 1));
  return LANES.includes(lane) ? lane : 0;
}

function seedNoise(seed, index) {
  const x = Math.sin((finite(seed, 1) + 1) * 999 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createDefaultState(state = {}) {
  return {
    lane: laneFrom(state.lane ?? 0),
    targetLane: laneFrom(state.targetLane ?? state.lane ?? 0),
    lateral: clamp(state.lateral ?? state.lane ?? 0, -1, 1),
    altitude: clamp(state.altitude ?? 0.52, 0.15, 0.95),
    distance: Math.max(0, finite(state.distance, 0)),
    speed: clamp(state.speed ?? 24, 8, 54),
    rescued: Math.max(0, Math.round(finite(state.rescued, 0))),
    score: Math.max(0, Math.round(finite(state.score, 0))),
    alive: state.alive !== false,
    status: state.status || "flying",
    tick: Math.max(0, Math.round(finite(state.tick, 0)))
  };
}

function normalizeIntent(intent = {}) {
  const left = Boolean(intent.left || intent.arrowLeft || intent.KeyA || intent.KeyLeft);
  const right = Boolean(intent.right || intent.arrowRight || intent.KeyD || intent.KeyRight);
  const flap = Boolean(intent.flap || intent.jump || intent.Space || intent.space);
  const restart = Boolean(intent.restart || intent.KeyR || intent.reset);
  return { left, right, flap, restart };
}

function forwardWindow(distance) {
  const base = Math.floor(Math.max(0, distance) / OBSTACLE_SPACING);
  return Array.from({ length: 8 }, (_, offset) => base + offset + 1);
}

export function createBirdRunLaneIntentKit() {
  return {
    id: "bird-run-lane-intent-kit",
    input: "current lane and discrete input intent",
    output: "next target lane descriptor",
    evaluate({ state = {}, intent = {} } = {}) {
      const current = createDefaultState(state).targetLane;
      const clean = normalizeIntent(intent);
      const delta = clean.left && !clean.right ? -1 : clean.right && !clean.left ? 1 : 0;
      const targetLane = laneFrom(current + delta);
      return {
        kind: "lane-intent",
        targetLane,
        changed: targetLane !== current,
        inputFlags: clean
      };
    }
  };
}

export function createBirdRunWingbeatMotionKit() {
  return {
    id: "bird-run-wingbeat-motion-kit",
    input: "runner state, dt, and flap intent",
    output: "new motion state descriptor",
    evaluate({ state = {}, intent = {}, dt = 1 / 60 } = {}) {
      const base = createDefaultState(state);
      const clean = normalizeIntent(intent);
      if (clean.restart || !base.alive) {
        return { kind: "wingbeat-motion", state: createDefaultState({ speed: 24 }), restarted: clean.restart };
      }
      const seconds = clamp(dt, 0, 0.08);
      const laneIntent = createBirdRunLaneIntentKit().evaluate({ state: base, intent: clean });
      const target = laneIntent.targetLane;
      const lateral = clamp(base.lateral + (target - base.lateral) * Math.min(1, seconds * 9), -1, 1);
      const altitudeTarget = clean.flap ? 0.76 : 0.5 + Math.sin(base.tick * 0.11) * 0.04;
      const altitude = clamp(base.altitude + (altitudeTarget - base.altitude) * Math.min(1, seconds * 7), 0.18, 0.92);
      const speed = clamp(base.speed + seconds * 1.65, 8, 54);
      return {
        kind: "wingbeat-motion",
        state: {
          ...base,
          lane: laneFrom(target),
          targetLane: target,
          lateral,
          altitude,
          distance: base.distance + speed * seconds,
          speed,
          tick: base.tick + 1,
          status: "flying"
        },
        restarted: false
      };
    }
  };
}

export function createBirdRunObstacleGroveKit() {
  return {
    id: "bird-run-obstacle-grove-kit",
    input: "seed and forward distance",
    output: "tree and canopy obstacle descriptors",
    evaluate({ seed = 7, distance = 0 } = {}) {
      return forwardWindow(finite(distance, 0)).map((index) => {
        const noise = seedNoise(seed, index);
        const lane = LANES[Math.floor(noise * LANES.length)] ?? 0;
        const x = index * OBSTACLE_SPACING;
        return {
          kind: "canopy-obstacle",
          id: `grove-${index}`,
          lane,
          x,
          height: Number((0.46 + seedNoise(seed + 3, index) * 0.42).toFixed(3)),
          width: Number((0.18 + seedNoise(seed + 5, index) * 0.18).toFixed(3)),
          silhouette: seedNoise(seed + 9, index) > 0.5 ? "pine" : "broadleaf"
        };
      });
    }
  };
}

export function createBirdRunNestlingRescueBeaconKit() {
  return {
    id: "bird-run-nestling-rescue-beacon-kit",
    input: "seed and forward distance",
    output: "rescue beacon descriptors",
    evaluate({ seed = 7, distance = 0, rescued = 0 } = {}) {
      return forwardWindow(finite(distance, 0)).filter((index) => index % 3 === 1).map((index) => {
        const lane = LANES[Math.floor(seedNoise(seed + 31, index) * LANES.length)] ?? 0;
        return {
          kind: "nestling-rescue-beacon",
          id: `nestling-${index}`,
          lane,
          x: index * OBSTACLE_SPACING + 32,
          urgency: Number(clamp(0.35 + seedNoise(seed + 17, index) * 0.65 - rescued * 0.02, 0.1, 1).toFixed(3)),
          call: index % 2 ? "chirp" : "flutter"
        };
      });
    }
  };
}

export function createBirdRunCollisionWindowKit() {
  return {
    id: "bird-run-collision-window-kit",
    input: "bird state and obstacle descriptors",
    output: "collision risk descriptor",
    evaluate({ state = {}, obstacles = [] } = {}) {
      const bird = createDefaultState(state);
      const current = obstacles.find((obstacle) => obstacle.lane === bird.lane && Math.abs(obstacle.x - bird.distance) <= WINDOW && bird.altitude < obstacle.height + 0.1);
      const near = obstacles.filter((obstacle) => Math.abs(obstacle.x - bird.distance) <= WINDOW * 2);
      return {
        kind: "collision-window",
        collided: Boolean(current),
        currentObstacleId: current?.id ?? null,
        nearCount: near.length,
        safeLaneHints: LANES.filter((lane) => !near.some((obstacle) => obstacle.lane === lane))
      };
    }
  };
}

export function createBirdRunRescueLedgerKit() {
  return {
    id: "bird-run-rescue-ledger-kit",
    input: "bird state and rescue beacon descriptors",
    output: "rescue score and roster descriptor",
    evaluate({ state = {}, beacons = [] } = {}) {
      const bird = createDefaultState(state);
      const reached = beacons.filter((beacon) => beacon.lane === bird.lane && Math.abs(beacon.x - bird.distance) <= WINDOW && bird.altitude >= 0.42);
      const urgencyPressure = beacons.reduce((sum, beacon) => sum + beacon.urgency, 0);
      return {
        kind: "rescue-ledger",
        reachedIds: reached.map((beacon) => beacon.id),
        rescuedDelta: reached.length,
        urgencyPressure: Number(urgencyPressure.toFixed(3)),
        rescueState: reached.length ? "rescued" : urgencyPressure > 3 ? "urgent" : "tracking"
      };
    }
  };
}

export function createBirdRunRendererHandoffKit() {
  return {
    id: "bird-run-canopy-rescue-renderer-handoff-kit",
    input: "headless bird run state and descriptors",
    output: "renderer descriptor buckets only",
    evaluate({ state = {}, obstacles = [], beacons = [], collision = {}, ledger = {} } = {}) {
      const bird = createDefaultState(state);
      return {
        kind: "bird-run-renderer-handoff",
        rendererConsumesDescriptorsOnly: true,
        bird: {
          kind: "bird-avatar",
          lane: bird.lane,
          lateral: Number(bird.lateral.toFixed(3)),
          altitude: Number(bird.altitude.toFixed(3)),
          alive: bird.alive,
          status: bird.status
        },
        obstacles,
        beacons,
        safety: collision,
        rescue: ledger,
        telemetry: {
          distance: Number(bird.distance.toFixed(1)),
          speed: Number(bird.speed.toFixed(2)),
          rescued: bird.rescued,
          score: bird.score,
          descriptorCount: 1 + obstacles.length + beacons.length + 2
        }
      };
    }
  };
}

export function createBirdRunCanopyRescueDomainKit(config = {}) {
  const seed = finite(config.seed, 23);
  const laneIntent = createBirdRunLaneIntentKit();
  const motion = createBirdRunWingbeatMotionKit();
  const grove = createBirdRunObstacleGroveKit();
  const rescue = createBirdRunNestlingRescueBeaconKit();
  const collision = createBirdRunCollisionWindowKit();
  const ledger = createBirdRunRescueLedgerKit();
  const renderer = createBirdRunRendererHandoffKit();

  function update({ state = {}, intent = {}, dt = 1 / 60 } = {}) {
    const moved = motion.evaluate({ state, intent, dt }).state;
    const obstacles = grove.evaluate({ seed, distance: moved.distance });
    const beacons = rescue.evaluate({ seed, distance: moved.distance, rescued: moved.rescued });
    const collisionState = collision.evaluate({ state: moved, obstacles });
    const rescueLedger = ledger.evaluate({ state: moved, beacons });
    const nextState = {
      ...moved,
      alive: !collisionState.collided,
      status: collisionState.collided ? "grounded" : rescueLedger.rescueState,
      rescued: moved.rescued + rescueLedger.rescuedDelta,
      score: Math.round(moved.distance + (moved.rescued + rescueLedger.rescuedDelta) * 250)
    };
    const handoff = renderer.evaluate({ state: nextState, obstacles, beacons, collision: collisionState, ledger: rescueLedger });
    return {
      kind: "bird-run-canopy-rescue-readiness",
      id: "bird-run-canopy-rescue-readiness-domain-kit",
      tree: BIRD_RUN_CANOPY_RESCUE_DOMAIN_TREE,
      ownership: {
        reusableLogicOwns: ["lane intent", "motion state", "course descriptors", "collision window", "rescue ledger", "renderer handoff descriptors"],
        forbiddenOwners: [...BIRD_RUN_CANOPY_RESCUE_FORBIDDEN_OWNERS]
      },
      atomicKits: [laneIntent.id, motion.id, grove.id, rescue.id, collision.id, ledger.id, renderer.id],
      state: nextState,
      descriptors: {
        laneIntent: laneIntent.evaluate({ state: nextState, intent }),
        obstacles,
        beacons,
        collision: collisionState,
        rescueLedger
      },
      rendererHandoff: handoff
    };
  }

  return {
    id: "bird-run-canopy-rescue-readiness-domain-kit",
    tree: BIRD_RUN_CANOPY_RESCUE_DOMAIN_TREE,
    atomicKits: [laneIntent, motion, grove, rescue, collision, ledger, renderer],
    update,
    getRendererHandoff(input) {
      return update(input).rendererHandoff;
    }
  };
}
