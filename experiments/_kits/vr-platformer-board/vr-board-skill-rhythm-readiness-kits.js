function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value, digits = 3) {
  return Number((Number(value) || 0).toFixed(digits));
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable skill rhythm descriptors only",
    rendererMustOwn: ["Canvas placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "XR input", "browser input", "collision", "platformer physics", "objective sequence", "asset loading", "audio", "frame loop"]
  };
}

function platformMidX(platform = {}) {
  return Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5;
}

function platformTop(platform = {}) {
  return Number(platform.y ?? 0);
}

function avatarProgress(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  const x = Number(avatar.position?.x ?? start);
  return clamp((x - start) / Math.max(1, exit - start), 0, 1);
}

function nearestPlatform(level = {}, x = 0) {
  return stableArray(level.platforms)
    .map((platform, index) => ({ platform, index, distance: Math.abs(platformMidX(platform) - x) }))
    .sort((a, b) => a.distance - b.distance)[0] ?? { platform: { id: "fallback", x, y: 1, w: 1 }, index: 0, distance: 0 };
}

function nextPlatform(level = {}, avatar = {}) {
  const avatarX = Number(avatar.position?.x ?? 0);
  const platforms = stableArray(level.platforms).sort((a, b) => platformMidX(a) - platformMidX(b));
  return platforms.find((platform) => platformMidX(platform) > avatarX + 0.4) ?? platforms.at(-1) ?? { id: "fallback", x: avatarX + 1, y: 1, w: 1 };
}

function distanceToNearestHazard(x, level = {}) {
  const hazards = stableArray(level.hazards);
  if (!hazards.length) return 99;
  return hazards.reduce((best, hazard) => Math.min(best, Math.abs(Number(hazard.x ?? 0) - x)), 99);
}

export const VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE = Object.freeze({
  root: "vr-board-skill-rhythm-readiness-domain",
  subdomains: [
    {
      id: "cadence-control-domain",
      subdomains: [
        { id: "jump-timing-gate", kits: ["vr-board-jump-timing-gate-kit"] },
        { id: "air-control-vector", kits: ["vr-board-air-control-vector-kit"] }
      ]
    },
    {
      id: "combo-route-domain",
      subdomains: [
        { id: "coin-combo-lane", kits: ["vr-board-coin-combo-lane-kit"] },
        { id: "checkpoint-save-echo", kits: ["vr-board-checkpoint-save-echo-kit"] }
      ]
    },
    {
      id: "commitment-risk-domain",
      subdomains: [
        { id: "hazard-hesitation-field", kits: ["vr-board-hazard-hesitation-field-kit"] },
        { id: "exit-commitment-crest", kits: ["vr-board-exit-commitment-crest-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["vr-board-skill-rhythm-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes skill rhythm descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createVrBoardJumpTimingGateKit() {
  return {
    id: "n-vr-board-jump-timing-gate-kit",
    domain: "vr-board-skill-rhythm-readiness/jump-timing-gate",
    describe({ avatar = {}, level = {}, input = {}, time = 0 } = {}) {
      const target = nextPlatform(level, avatar);
      const speed = Math.abs(Number(avatar.velocity?.x ?? 0));
      const dx = Math.max(0.2, platformMidX(target) - Number(avatar.position?.x ?? 0));
      const jumpReady = Boolean(avatar.grounded) && dx < 4.2;
      const timing = clamp01(1 - Math.abs(dx - 2.6) / 3.6 + speed * 0.08 + (input.jumpPressed ? 0.1 : 0));
      return {
        id: "vr-board-jump-timing-gate",
        kind: "jump-timing-gate",
        platformId: target.id ?? "next-platform",
        x: round(platformMidX(target), 3),
        y: round(platformTop(target) + 0.52, 3),
        readiness: round(jumpReady ? timing : timing * 0.45, 3),
        phase: jumpReady ? "launch-window" : avatar.grounded ? "prepare" : "airborne",
        pulse: round(clamp01(0.32 + timing * 0.48 + Math.sin(time * 2.2) * 0.08), 3),
        rendererContract: notOwnRendererContract("vr-board-jump-timing-gate-kit")
      };
    },
    snapshot(input) {
      const gate = this.describe(input);
      return { phase: gate.phase, readiness: gate.readiness };
    }
  };
}

export function createVrBoardAirControlVectorKit({ vectorCount = 4 } = {}) {
  return {
    id: "n-vr-board-air-control-vector-kit",
    domain: "vr-board-skill-rhythm-readiness/air-control-vector",
    describe({ avatar = {}, input = {}, level = {} } = {}) {
      const moveAxis = clamp(input.moveAxis ?? avatar.moveAxis ?? 0, -1, 1);
      const airborne = !avatar.grounded;
      const avatarX = Number(avatar.position?.x ?? 0);
      const avatarY = Number(avatar.position?.y ?? 0);
      const target = nextPlatform(level, avatar);
      return Array.from({ length: vectorCount }, (_, index) => {
        const t = (index + 1) / vectorCount;
        return {
          id: `air-control-vector-${index}`,
          kind: "air-control-vector",
          x: round(avatarX + (platformMidX(target) - avatarX) * t, 3),
          y: round(avatarY + 0.5 + t * 0.44, 3),
          strength: round(clamp01((airborne ? 0.5 : 0.22) + Math.abs(moveAxis) * 0.38 + t * 0.1), 3),
          direction: moveAxis < -0.1 ? "left" : moveAxis > 0.1 ? "right" : "neutral",
          rendererContract: notOwnRendererContract("vr-board-air-control-vector-kit")
        };
      });
    },
    snapshot(input) {
      const vectors = this.describe(input);
      return { vectors: vectors.length, strongest: vectors.reduce((best, vector) => Math.max(best, vector.strength), 0) };
    }
  };
}

export function createVrBoardCoinComboLaneKit() {
  return {
    id: "n-vr-board-coin-combo-lane-kit",
    domain: "vr-board-skill-rhythm-readiness/coin-combo-lane",
    describe({ level = {}, objects = {}, avatar = {}, time = 0 } = {}) {
      const collected = new Set(stableArray(objects.collectedIds));
      const avatarX = Number(avatar.position?.x ?? 0);
      const coins = stableArray(level.collectibles).filter((coin) => !collected.has(coin.id)).sort((a, b) => Number(a.x ?? 0) - Number(b.x ?? 0));
      return coins.map((coin, index) => {
        const previous = coins[index - 1] ?? { x: avatarX, y: Number(avatar.position?.y ?? 0) + 0.8, id: "avatar" };
        const gap = Math.abs(Number(coin.x ?? 0) - Number(previous.x ?? avatarX));
        const flow = clamp01(0.9 - gap * 0.09 + Number(coin.value ?? 1) * 0.08 + Math.sin(time + index) * 0.035);
        return {
          id: `coin-combo-lane-${coin.id ?? index}`,
          kind: "coin-combo-lane",
          fromId: previous.id ?? "avatar",
          coinId: coin.id ?? `coin-${index}`,
          x: round((Number(coin.x ?? 0) + Number(previous.x ?? avatarX)) * 0.5, 3),
          y: round((Number(coin.y ?? 0) + Number(previous.y ?? 0)) * 0.5, 3),
          width: round(gap, 3),
          comboValue: round(flow, 3),
          rendererContract: notOwnRendererContract("vr-board-coin-combo-lane-kit")
        };
      });
    },
    snapshot(input) {
      const lanes = this.describe(input);
      return { lanes: lanes.length, bestCombo: lanes.reduce((best, lane) => Math.max(best, lane.comboValue), 0) };
    }
  };
}

export function createVrBoardHazardHesitationFieldKit() {
  return {
    id: "n-vr-board-hazard-hesitation-field-kit",
    domain: "vr-board-skill-rhythm-readiness/hazard-hesitation-field",
    describe({ level = {}, avatar = {}, input = {}, time = 0 } = {}) {
      const avatarX = Number(avatar.position?.x ?? 0);
      const speed = Math.abs(Number(avatar.velocity?.x ?? 0));
      const moveAxis = clamp(input.moveAxis ?? avatar.moveAxis ?? 0, -1, 1);
      return stableArray(level.hazards).map((hazard, index) => {
        const hx = Number(hazard.x ?? 0);
        const distance = Math.abs(hx - avatarX);
        const approaching = Math.sign(hx - avatarX) === Math.sign(moveAxis) && Math.abs(moveAxis) > 0.1;
        const hesitation = clamp01(0.18 + (1 - Math.min(distance, 5) / 5) * 0.55 + speed * 0.06 + (approaching ? 0.18 : 0));
        return {
          id: `hazard-hesitation-field-${hazard.id ?? index}`,
          kind: "hazard-hesitation-field",
          hazardId: hazard.id ?? `hazard-${index}`,
          x: round(hx, 3),
          y: round(Number(hazard.y ?? 0), 3),
          radius: round(0.45 + hesitation * 0.72, 3),
          hesitation: round(clamp01(hesitation + Math.sin(time * 1.5 + index) * 0.035), 3),
          rendererContract: notOwnRendererContract("vr-board-hazard-hesitation-field-kit")
        };
      });
    },
    snapshot(input) {
      const fields = this.describe(input);
      return { fields: fields.length, maxHesitation: fields.reduce((best, field) => Math.max(best, field.hesitation), 0) };
    }
  };
}

export function createVrBoardCheckpointSaveEchoKit() {
  return {
    id: "n-vr-board-checkpoint-save-echo-kit",
    domain: "vr-board-skill-rhythm-readiness/checkpoint-save-echo",
    describe({ level = {}, avatar = {}, objects = {} } = {}) {
      const progress = avatarProgress(avatar, level);
      const collectedValue = Number(objects.collectedValue ?? stableArray(objects.collectedIds).length ?? 0);
      return stableArray(level.platforms).map((platform, index) => {
        const checkpointProgress = clamp01((platformMidX(platform) - Number(level.start?.x ?? 0)) / Math.max(1, Number(level.exit?.x ?? 12) - Number(level.start?.x ?? 0)));
        const saved = checkpointProgress <= progress + 0.05;
        return {
          id: `checkpoint-save-echo-${platform.id ?? index}`,
          kind: "checkpoint-save-echo",
          platformId: platform.id ?? `platform-${index}`,
          x: round(platformMidX(platform), 3),
          y: round(platformTop(platform) + 0.2, 3),
          saved,
          confidence: round(clamp01((saved ? 0.62 : 0.24) + collectedValue * 0.07 - Math.abs(progress - checkpointProgress) * 0.22), 3),
          rendererContract: notOwnRendererContract("vr-board-checkpoint-save-echo-kit")
        };
      });
    },
    snapshot(input) {
      const echoes = this.describe(input);
      return { echoes: echoes.length, saved: echoes.filter((echo) => echo.saved).length };
    }
  };
}

export function createVrBoardExitCommitmentCrestKit({ requiredCollectibles = 3 } = {}) {
  return {
    id: "n-vr-board-exit-commitment-crest-kit",
    domain: "vr-board-skill-rhythm-readiness/exit-commitment-crest",
    describe({ level = {}, objects = {}, avatar = {}, time = 0 } = {}) {
      const collected = Number(objects.collectedValue ?? stableArray(objects.collectedIds).length ?? 0);
      const progress = avatarProgress(avatar, level);
      const readiness = clamp01(collected / Math.max(1, requiredCollectibles) * 0.68 + progress * 0.32);
      return {
        id: "exit-commitment-crest",
        kind: "exit-commitment-crest",
        x: round(Number(level.exit?.x ?? 12), 3),
        y: round(Number(level.exit?.y ?? 3) + 0.8, 3),
        readiness: round(readiness, 3),
        phase: readiness >= 0.82 ? "commit" : readiness >= 0.48 ? "prepare" : "collect",
        pulse: round(clamp01(0.25 + readiness * 0.58 + Math.sin(time * 1.7) * 0.05), 3),
        missingCollectibles: Math.max(0, requiredCollectibles - collected),
        rendererContract: notOwnRendererContract("vr-board-exit-commitment-crest-kit")
      };
    },
    snapshot(input) {
      const crest = this.describe(input);
      return { phase: crest.phase, readiness: crest.readiness, missingCollectibles: crest.missingCollectibles };
    }
  };
}

export function createVrBoardSkillRhythmRendererHandoffKit({
  jumpTimingGateKit = createVrBoardJumpTimingGateKit(),
  airControlVectorKit = createVrBoardAirControlVectorKit(),
  coinComboLaneKit = createVrBoardCoinComboLaneKit(),
  hazardHesitationFieldKit = createVrBoardHazardHesitationFieldKit(),
  checkpointSaveEchoKit = createVrBoardCheckpointSaveEchoKit(),
  exitCommitmentCrestKit = createVrBoardExitCommitmentCrestKit()
} = {}) {
  return {
    id: "n-vr-board-skill-rhythm-renderer-handoff-kit",
    domain: "vr-board-skill-rhythm-readiness/renderer-handoff",
    kits: { jumpTimingGateKit, airControlVectorKit, coinComboLaneKit, hazardHesitationFieldKit, checkpointSaveEchoKit, exitCommitmentCrestKit },
    describe(input = {}) {
      const jumpTimingGate = jumpTimingGateKit.describe(input);
      const airControlVectors = airControlVectorKit.describe(input);
      const coinComboLanes = coinComboLaneKit.describe(input);
      const hazardHesitationFields = hazardHesitationFieldKit.describe(input);
      const checkpointSaveEchoes = checkpointSaveEchoKit.describe(input);
      const exitCommitmentCrest = exitCommitmentCrestKit.describe(input);
      const counts = {
        jumpTimingGates: 1,
        airControlVectors: airControlVectors.length,
        coinComboLanes: coinComboLanes.length,
        hazardHesitationFields: hazardHesitationFields.length,
        checkpointSaveEchoes: checkpointSaveEchoes.length,
        exitCommitmentCrests: 1
      };
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "vr-board-skill-rhythm-renderer-handoff",
        domainTree: VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE,
        policy: "renderer-consumes-descriptors-only",
        rendererContract: notOwnRendererContract("vr-board-skill-rhythm-renderer-handoff-kit"),
        descriptors: { jumpTimingGate, airControlVectors, coinComboLanes, hazardHesitationFields, checkpointSaveEchoes, exitCommitmentCrest },
        counts
      };
    },
    snapshot(input) {
      const handoff = this.describe(input);
      return { total: handoff.counts.total, gatePhase: handoff.descriptors.jumpTimingGate.phase, exitPhase: handoff.descriptors.exitCommitmentCrest.phase };
    }
  };
}

export function createVrBoardSkillRhythmReadinessDomainKit(options = {}) {
  const rendererHandoffKit = options.rendererHandoffKit ?? createVrBoardSkillRhythmRendererHandoffKit(options);
  return {
    id: "n-vr-board-skill-rhythm-readiness-domain-kit",
    domain: "vr-board-skill-rhythm-readiness-domain",
    rendererHandoffKit,
    describe(input = {}) {
      const rendererHandoff = rendererHandoffKit.describe(input);
      return {
        id: "vr-board-skill-rhythm-readiness-domain",
        domainTree: VR_BOARD_SKILL_RHYTHM_READINESS_DOMAIN_TREE,
        rendererHandoff,
        jumpTimingGate: rendererHandoff.descriptors.jumpTimingGate,
        airControlVectors: rendererHandoff.descriptors.airControlVectors,
        coinComboLanes: rendererHandoff.descriptors.coinComboLanes,
        hazardHesitationFields: rendererHandoff.descriptors.hazardHesitationFields,
        checkpointSaveEchoes: rendererHandoff.descriptors.checkpointSaveEchoes,
        exitCommitmentCrest: rendererHandoff.descriptors.exitCommitmentCrest,
        rendererContract: notOwnRendererContract("vr-board-skill-rhythm-readiness-domain-kit")
      };
    },
    snapshot(input) {
      const descriptor = this.describe(input);
      return {
        total: descriptor.rendererHandoff.counts.total,
        jumpPhase: descriptor.jumpTimingGate.phase,
        exitPhase: descriptor.exitCommitmentCrest.phase,
        echoes: descriptor.checkpointSaveEchoes.length
      };
    }
  };
}
