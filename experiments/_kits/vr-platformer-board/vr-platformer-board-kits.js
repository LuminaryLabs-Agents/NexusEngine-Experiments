function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function hashUnit(seed, salt = 0) {
  const text = `${seed}:${salt}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

function avatarProgress(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  const x = Number(avatar.position?.x ?? start);
  return clamp((x - start) / Math.max(1, exit - start), 0, 1);
}

export function createVrBoardWorldSeedKit({ seed = "vr-platformer-board" } = {}) {
  return {
    id: "n-vr-board-world-seed-kit",
    domain: "vr-board-world-seed",
    describe({ level = {}, camera = {}, time = 0 } = {}) {
      const platforms = stableArray(level.platforms);
      const collectibles = stableArray(level.collectibles);
      const hazards = stableArray(level.hazards);
      const cameraX = Number(camera.position?.x ?? 0);
      return {
        seed,
        boardTone: hazards.length > 0 ? "hazard-training" : "comfort-training",
        skyline: Array.from({ length: 10 }, (_, index) => ({
          id: `skyline-${index}`,
          x: Math.round(index * 38 - ((cameraX * 5 + time * 7) % 38)),
          y: Math.round(20 + hashUnit(seed, index) * 36),
          h: Math.round(24 + hashUnit(seed, index + 10) * 58),
          alpha: Number((0.1 + hashUnit(seed, index + 20) * 0.18).toFixed(2))
        })),
        platformAuras: platforms.map((platform, index) => ({
          id: `platform-aura-${index}`,
          x: Number(platform.x ?? 0),
          y: Number(platform.y ?? 0),
          w: Number(platform.w ?? 1),
          h: Number(platform.h ?? 0.2),
          pulse: Number((0.34 + hashUnit(seed, index + 30) * 0.38).toFixed(2))
        })),
        collectibleOrbits: collectibles.map((coin, index) => ({
          id: `collectible-orbit-${coin.id ?? index}`,
          x: Number(coin.x ?? 0),
          y: Number(coin.y ?? 0),
          radius: Number((0.22 + hashUnit(seed, index + 40) * 0.18).toFixed(2))
        }))
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        seed: descriptor.seed,
        boardTone: descriptor.boardTone,
        skylineCount: descriptor.skyline.length,
        platformAuraCount: descriptor.platformAuras.length,
        collectibleOrbitCount: descriptor.collectibleOrbits.length
      };
    }
  };
}

export function createVrBoardChallengeDirectorKit() {
  return {
    id: "n-vr-board-challenge-director-kit",
    domain: "vr-board-challenge-director",
    describe({ avatar = {}, level = {}, objects = {}, comfort = {}, sequence = {} } = {}) {
      const progress = avatarProgress(avatar, level);
      const collected = Number(objects.collectedValue ?? objects.score ?? 0);
      const hazards = stableArray(level.hazards).length;
      const warnings = stableArray(comfort.warnings);
      const stage = progress > 0.78 ? "exit-run" : progress > 0.42 ? "mid-board" : "launch";
      return {
        stage,
        progress: Number(progress.toFixed(3)),
        intensity: Number(clamp(progress * 62 + hazards * 7 + warnings.length * 10, 0, 100).toFixed(1)),
        collected,
        hazards,
        objectiveHint: sequence.hint ?? "Reach the exit",
        comfortWarnings: warnings
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        stage: descriptor.stage,
        progress: descriptor.progress,
        intensity: descriptor.intensity,
        warnings: descriptor.comfortWarnings.length
      };
    }
  };
}

export function createVrBoardDepthLaneKit({ laneCount = 5 } = {}) {
  return {
    id: "n-vr-board-depth-lane-kit",
    domain: "vr-board-depth-lanes",
    describe({ camera = {}, board = {} } = {}) {
      const width = Number(board.sizeMeters?.x ?? 1.6);
      const cameraX = Number(camera.position?.x ?? 0);
      return Array.from({ length: laneCount }, (_, index) => ({
        id: `depth-lane-${index}`,
        depth: index + 1,
        offset: Number(((index - (laneCount - 1) / 2) * width * 0.18 - cameraX * 0.06).toFixed(3)),
        opacity: Number((0.12 + index * 0.08).toFixed(2)),
        width: Number((width * (0.72 + index * 0.09)).toFixed(2))
      }));
    },
    snapshot(input) {
      const lanes = this.describe(input);
      return { laneCount: lanes.length, nearestDepth: lanes[0]?.depth ?? 0, farthestDepth: lanes.at(-1)?.depth ?? 0 };
    }
  };
}

export function createVrBoardHudDescriptorKit() {
  return {
    id: "n-vr-board-hud-descriptor-kit",
    domain: "vr-board-hud-descriptor",
    describe({ challenge = {}, comfort = {}, sequence = {} } = {}) {
      const warnings = stableArray(comfort.warnings ?? challenge.comfortWarnings);
      const progressPercent = Math.round((challenge.progress ?? 0) * 100);
      return {
        objective: `${sequence.hint ?? challenge.objectiveHint ?? "Reach the exit"} · ${progressPercent}% · ${warnings.join(",") || "comfort ok"}`,
        controls: "A/D move · Space jump · R reset · drag head · board domains live",
        statusTone: warnings.length ? "warning" : challenge.stage === "exit-run" ? "success" : "neutral",
        chips: [challenge.stage ?? "launch", `${progressPercent}%`, `${Math.round(challenge.intensity ?? 0)} intensity`]
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return { statusTone: descriptor.statusTone, chipCount: descriptor.chips.length, objective: descriptor.objective };
    }
  };
}

export function createVrBoardCompositionKit({ worldSeedKit, challengeDirectorKit, depthLaneKit, hudDescriptorKit } = {}) {
  return {
    id: "n-vr-board-composition-kit",
    domain: "vr-board-composition",
    describe(input = {}) {
      const world = worldSeedKit?.describe(input) ?? null;
      const challenge = challengeDirectorKit?.describe(input) ?? null;
      const depthLanes = depthLaneKit?.describe(input) ?? [];
      const hud = hudDescriptorKit?.describe({ ...input, challenge }) ?? null;
      return { world, challenge, depthLanes, hud };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        hasWorld: Boolean(descriptor.world),
        hasChallenge: Boolean(descriptor.challenge),
        depthLanes: descriptor.depthLanes.length,
        hudTone: descriptor.hud?.statusTone ?? "missing"
      };
    }
  };
}
