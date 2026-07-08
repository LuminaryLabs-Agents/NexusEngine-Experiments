function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
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

function noRendererOwnershipDescriptor(extra = {}) {
  return {
    rendererConsumes: "serializable descriptors only",
    rendererMustOwn: ["Canvas placement", "draw order", "color application", "animation interpolation"],
    rendererMustNotOwn: ["simulation state", "XR input", "collision", "platformer physics", "objective sequence", "descriptor generation"],
    ...extra
  };
}

export const VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE = Object.freeze({
  root: "vr-platformer-board-domain",
  subdomains: [
    {
      id: "board-world-readability",
      subdomains: [
        { id: "atmospheric-dome", kits: ["vr-board-atmospheric-dome-kit"] },
        { id: "depth-lanes", kits: ["vr-board-depth-lane-kit"] }
      ]
    },
    {
      id: "platformer-readability",
      subdomains: [
        { id: "platform-relief", kits: ["vr-board-platform-relief-kit"] },
        { id: "hazard-telemetry", kits: ["vr-board-hazard-telemetry-kit"] },
        { id: "collectible-constellation", kits: ["vr-board-collectible-constellation-kit"] },
        { id: "avatar-motion", kits: ["vr-board-motion-trail-kit"] }
      ]
    },
    {
      id: "comfort-and-handoff",
      subdomains: [
        { id: "comfort-focus", kits: ["vr-board-comfort-focus-kit"] },
        { id: "renderer-handoff", kits: ["vr-board-renderer-handoff-kit"] }
      ]
    }
  ],
  contract: "renderer consumes descriptors only; no Three.js, DOM, browser input, WebGL, audio, or frame-loop ownership"
});

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

export function createVrBoardAtmosphericDomeKit({ bandCount = 6, moteCount = 14, seed = "vr-board-dome" } = {}) {
  return {
    id: "n-vr-board-atmospheric-dome-kit",
    domain: "vr-board-world-readability/atmospheric-dome",
    describe(input = {}) {
      const challenge = input.challenge ?? createVrBoardChallengeDirectorKit().describe(input);
      const cameraX = Number(input.camera?.position?.x ?? 0);
      const intensity = clamp01(Number(challenge.intensity ?? 0) / 100);
      return {
        id: "vr-board-atmospheric-dome",
        phase: challenge.stage ?? "launch",
        pressure: Number(intensity.toFixed(3)),
        skyBands: Array.from({ length: bandCount }, (_, index) => ({
          id: `dome-band-${index}`,
          depth: index + 1,
          y: Math.round(10 + index * 18 + hashUnit(seed, index) * 8),
          height: Math.round(24 + hashUnit(seed, index + 20) * 22),
          opacity: Number((0.06 + index * 0.035 + intensity * 0.08).toFixed(3)),
          drift: Number(((index - bandCount / 2) * 0.4 - cameraX * 0.18).toFixed(3)),
          hue: index % 2 ? "cyan" : "violet"
        })),
        motes: Array.from({ length: moteCount }, (_, index) => ({
          id: `dome-mote-${index}`,
          x: Math.round(hashUnit(seed, index + 40) * 320),
          y: Math.round(12 + hashUnit(seed, index + 80) * 96),
          radius: Number((0.35 + hashUnit(seed, index + 120) * 1.3).toFixed(2)),
          alpha: Number((0.1 + hashUnit(seed, index + 160) * 0.26 + intensity * 0.1).toFixed(3))
        })),
        rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-atmospheric-dome-kit" })
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return { skyBands: descriptor.skyBands.length, motes: descriptor.motes.length, phase: descriptor.phase };
    }
  };
}

export function createVrBoardPlatformReliefKit() {
  return {
    id: "n-vr-board-platform-relief-kit",
    domain: "vr-board-platformer-readability/platform-relief",
    describe({ level = {}, camera = {} } = {}) {
      const cameraX = Number(camera.position?.x ?? 0);
      return stableArray(level.platforms).map((platform, index) => ({
        id: `platform-relief-${index}`,
        platformId: platform.id ?? `platform-${index}`,
        x: Number(platform.x ?? 0),
        y: Number(platform.y ?? 0),
        w: Number(platform.w ?? 1),
        h: Number(platform.h ?? 0.2),
        shadowDrop: Number((0.18 + index * 0.025).toFixed(3)),
        rim: Number((0.22 + Math.abs(Number(platform.x ?? 0) - cameraX) * 0.008).toFixed(3)),
        supportColumns: Math.max(2, Math.round(Number(platform.w ?? 1) * 2)),
        rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-platform-relief-kit" })
      }));
    },
    snapshot(input) {
      const relief = this.describe(input);
      return { platformReliefCount: relief.length, supportColumns: relief.reduce((sum, item) => sum + item.supportColumns, 0) };
    }
  };
}

export function createVrBoardHazardTelemetryKit() {
  return {
    id: "n-vr-board-hazard-telemetry-kit",
    domain: "vr-board-platformer-readability/hazard-telemetry",
    describe({ level = {}, avatar = {}, challenge = null } = {}) {
      const intensity = Number(challenge?.intensity ?? createVrBoardChallengeDirectorKit().describe({ level, avatar }).intensity);
      const avatarX = Number(avatar.position?.x ?? 0);
      return stableArray(level.hazards).map((hazard, index) => {
        const dx = Number(hazard.x ?? 0) - avatarX;
        return {
          id: `hazard-telemetry-${index}`,
          hazardId: hazard.id ?? `hazard-${index}`,
          x: Number(hazard.x ?? 0),
          y: Number(hazard.y ?? 0),
          w: Number(hazard.w ?? 1),
          h: Number(hazard.h ?? 0.4),
          pulse: Number(clamp(0.25 + intensity / 120 + Math.max(0, 4 - Math.abs(dx)) * 0.08, 0.1, 0.95).toFixed(3)),
          warningRadius: Number((0.52 + index * 0.08).toFixed(2)),
          glyph: dx < 0 ? "behind" : "ahead",
          rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-hazard-telemetry-kit" })
        };
      });
    },
    snapshot(input) {
      const telemetry = this.describe(input);
      return { hazards: telemetry.length, maxPulse: telemetry.reduce((max, item) => Math.max(max, item.pulse), 0) };
    }
  };
}

export function createVrBoardCollectibleConstellationKit({ seed = "vr-board-constellation" } = {}) {
  return {
    id: "n-vr-board-collectible-constellation-kit",
    domain: "vr-board-platformer-readability/collectible-constellation",
    describe({ level = {}, objects = {}, challenge = null } = {}) {
      const collectedValue = Number(objects.collectedValue ?? objects.score ?? 0);
      const collectibles = stableArray(level.collectibles);
      const nodes = collectibles.map((coin, index) => ({
        id: `collectible-star-${coin.id ?? index}`,
        collectibleId: coin.id ?? `coin-${index}`,
        x: Number(coin.x ?? 0),
        y: Number(coin.y ?? 0),
        sparkle: Number((0.36 + hashUnit(seed, index) * 0.48 + collectedValue * 0.015).toFixed(3)),
        orbit: Number((0.18 + hashUnit(seed, index + 40) * 0.26).toFixed(3)),
        phase: Number((hashUnit(seed, index + 80) * Math.PI * 2).toFixed(3))
      }));
      const links = nodes.slice(1).map((node, index) => ({
        id: `collectible-link-${index}`,
        from: nodes[index].id,
        to: node.id,
        alpha: Number((0.12 + (challenge?.progress ?? 0) * 0.2).toFixed(3))
      }));
      return { nodes, links, rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-collectible-constellation-kit" }) };
    },
    snapshot(input) {
      const constellation = this.describe(input);
      return { nodes: constellation.nodes.length, links: constellation.links.length };
    }
  };
}

export function createVrBoardComfortFocusKit() {
  return {
    id: "n-vr-board-comfort-focus-kit",
    domain: "vr-board-comfort-and-handoff/comfort-focus",
    describe({ comfort = {}, board = {}, xrPose = {}, head = {} } = {}) {
      const warnings = stableArray(comfort.warnings);
      const poseHead = xrPose.head ?? head;
      const headX = Number(poseHead.position?.x ?? 0);
      const headY = Number(poseHead.position?.y ?? 1.6);
      const width = Number(board.sizeMeters?.x ?? 1.6);
      return {
        id: "vr-board-comfort-focus",
        warnings,
        vignette: Number(clamp(0.16 + warnings.length * 0.12 + Math.abs(headX) * 0.2, 0.12, 0.72).toFixed(3)),
        stableWindow: {
          xMin: Number((-width * 0.38).toFixed(3)),
          xMax: Number((width * 0.38).toFixed(3)),
          yMin: 1.35,
          yMax: 1.9,
          headX: Number(headX.toFixed(3)),
          headY: Number(headY.toFixed(3))
        },
        tone: warnings.length ? "warning" : "comfortable",
        rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-comfort-focus-kit" })
      };
    },
    snapshot(input) {
      const focus = this.describe(input);
      return { tone: focus.tone, vignette: focus.vignette, warnings: focus.warnings.length };
    }
  };
}

export function createVrBoardMotionTrailKit({ ghostCount = 7 } = {}) {
  return {
    id: "n-vr-board-motion-trail-kit",
    domain: "vr-board-platformer-readability/avatar-motion-trail",
    describe({ avatar = {}, camera = {}, time = 0 } = {}) {
      const position = avatar.position ?? {};
      const vx = Number(avatar.velocity?.x ?? avatar.vx ?? 0);
      const vy = Number(avatar.velocity?.y ?? avatar.vy ?? 0);
      const speed = Math.hypot(vx, vy);
      const cameraX = Number(camera.position?.x ?? 0);
      return {
        speed: Number(speed.toFixed(3)),
        ghosts: Array.from({ length: ghostCount }, (_, index) => ({
          id: `avatar-motion-ghost-${index}`,
          x: Number((Number(position.x ?? 0) - vx * 0.03 * (index + 1) - cameraX * 0.002).toFixed(3)),
          y: Number((Number(position.y ?? 0) - vy * 0.03 * (index + 1)).toFixed(3)),
          alpha: Number(clamp(0.24 - index * 0.026 + speed * 0.015, 0.04, 0.44).toFixed(3)),
          scale: Number((1 + Math.sin(time + index) * 0.025).toFixed(3))
        })),
        rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-motion-trail-kit" })
      };
    },
    snapshot(input) {
      const trail = this.describe(input);
      return { ghosts: trail.ghosts.length, speed: trail.speed };
    }
  };
}

export function createVrBoardHudDescriptorKit() {
  return {
    id: "n-vr-board-hud-descriptor-kit",
    domain: "vr-board-hud-descriptor",
    describe({ challenge = {}, comfort = {}, sequence = {}, visual = {} } = {}) {
      const warnings = stableArray(comfort.warnings ?? challenge.comfortWarnings);
      const progressPercent = Math.round((challenge.progress ?? 0) * 100);
      const visualCount = visual.rendererHandoff?.counts?.total ?? 0;
      return {
        objective: `${sequence.hint ?? challenge.objectiveHint ?? "Reach the exit"} · ${progressPercent}% · ${warnings.join(",") || "comfort ok"}`,
        controls: `A/D move · Space jump · R reset · drag head · ${visualCount ? `${visualCount} visual descriptors` : "board domains live"}`,
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

export function createVrBoardRendererHandoffKit({
  atmosphericDomeKit = createVrBoardAtmosphericDomeKit(),
  platformReliefKit = createVrBoardPlatformReliefKit(),
  hazardTelemetryKit = createVrBoardHazardTelemetryKit(),
  collectibleConstellationKit = createVrBoardCollectibleConstellationKit(),
  comfortFocusKit = createVrBoardComfortFocusKit(),
  motionTrailKit = createVrBoardMotionTrailKit()
} = {}) {
  return {
    id: "n-vr-board-renderer-handoff-kit",
    domain: "vr-board-comfort-and-handoff/renderer-handoff",
    kits: { atmosphericDomeKit, platformReliefKit, hazardTelemetryKit, collectibleConstellationKit, comfortFocusKit, motionTrailKit },
    describe(input = {}) {
      const challenge = input.challenge ?? createVrBoardChallengeDirectorKit().describe(input);
      const atmosphericDome = atmosphericDomeKit.describe({ ...input, challenge });
      const platformRelief = platformReliefKit.describe(input);
      const hazardTelemetry = hazardTelemetryKit.describe({ ...input, challenge });
      const collectibleConstellation = collectibleConstellationKit.describe({ ...input, challenge });
      const comfortFocus = comfortFocusKit.describe(input);
      const motionTrail = motionTrailKit.describe(input);
      const counts = {
        skyBands: atmosphericDome.skyBands.length,
        motes: atmosphericDome.motes.length,
        platformRelief: platformRelief.length,
        hazardTelemetry: hazardTelemetry.length,
        constellationNodes: collectibleConstellation.nodes.length,
        constellationLinks: collectibleConstellation.links.length,
        motionGhosts: motionTrail.ghosts.length
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "vr-board-renderer-handoff",
        domainTree: VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE,
        rendererContract: noRendererOwnershipDescriptor({ owner: "vr-board-renderer-handoff-kit" }),
        atmosphericDome,
        platformRelief,
        hazardTelemetry,
        collectibleConstellation,
        comfortFocus,
        motionTrail,
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return {
        total: handoff.counts.total,
        skyBands: handoff.counts.skyBands,
        hazards: handoff.counts.hazardTelemetry,
        tone: handoff.comfortFocus.tone
      };
    }
  };
}

export function createVrBoardCompositionKit({
  worldSeedKit,
  challengeDirectorKit,
  depthLaneKit,
  hudDescriptorKit,
  atmosphericDomeKit = createVrBoardAtmosphericDomeKit(),
  platformReliefKit = createVrBoardPlatformReliefKit(),
  hazardTelemetryKit = createVrBoardHazardTelemetryKit(),
  collectibleConstellationKit = createVrBoardCollectibleConstellationKit(),
  comfortFocusKit = createVrBoardComfortFocusKit(),
  motionTrailKit = createVrBoardMotionTrailKit(),
  rendererHandoffKit = createVrBoardRendererHandoffKit({ atmosphericDomeKit, platformReliefKit, hazardTelemetryKit, collectibleConstellationKit, comfortFocusKit, motionTrailKit })
} = {}) {
  return {
    id: "n-vr-board-composition-kit",
    domain: "vr-board-composition",
    describe(input = {}) {
      const world = worldSeedKit?.describe(input) ?? null;
      const challenge = challengeDirectorKit?.describe(input) ?? null;
      const depthLanes = depthLaneKit?.describe(input) ?? [];
      const rendererHandoff = rendererHandoffKit?.describe({ ...input, challenge }) ?? null;
      const visual = {
        atmosphericDome: rendererHandoff?.atmosphericDome ?? atmosphericDomeKit?.describe({ ...input, challenge }) ?? null,
        platformRelief: rendererHandoff?.platformRelief ?? platformReliefKit?.describe(input) ?? [],
        hazardTelemetry: rendererHandoff?.hazardTelemetry ?? hazardTelemetryKit?.describe({ ...input, challenge }) ?? [],
        collectibleConstellation: rendererHandoff?.collectibleConstellation ?? collectibleConstellationKit?.describe({ ...input, challenge }) ?? null,
        comfortFocus: rendererHandoff?.comfortFocus ?? comfortFocusKit?.describe(input) ?? null,
        motionTrail: rendererHandoff?.motionTrail ?? motionTrailKit?.describe(input) ?? null,
        rendererHandoff
      };
      const hud = hudDescriptorKit?.describe({ ...input, challenge, visual }) ?? null;
      return { world, challenge, depthLanes, visual, hud };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        hasWorld: Boolean(descriptor.world),
        hasChallenge: Boolean(descriptor.challenge),
        depthLanes: descriptor.depthLanes.length,
        hudTone: descriptor.hud?.statusTone ?? "missing",
        visualDescriptors: descriptor.visual?.rendererHandoff?.counts?.total ?? 0
      };
    }
  };
}
