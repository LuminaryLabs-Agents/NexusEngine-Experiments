const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createNextLedgeClimbPreset(options = {}) {
  const sector = Math.max(1, Math.floor(Number(options.sector ?? 1)));
  const windDirection = sector % 2 === 0 ? -1 : 1;
  const pacing = options.routePacing ?? options.pacing ?? options;
  const summitY = Number(options.summitY ?? n(pacing.summitBaseY, 2200) + sector * n(pacing.summitPerSectorY, 760));
  const routeId = `next-ledge-sector-${sector}`;
  const sampleSpacingY = Math.max(80, n(pacing.sampleSpacingY, 125));
  const masteryCrest = options.masteryCrest ?? {
    id: "summit-signal-mastery-crest",
    beats: [
      { fromSummit: 4, id: "stormbreak-rest", role: "crest-rest", label: "Stormbreak rest", type: "rest", x: 72, yOffset: -485, radius: 10, tags: ["mastery-crest", "recovery-setup"] },
      { fromSummit: 3, id: "commit-perch", role: "crest-commit", label: "Commit perch", type: "normal", x: 78, yOffset: -350, radius: 6.5, tags: ["mastery-crest", "high-commitment-release"] },
      { fromSummit: 2, id: "crosswind-catch", role: "crest-catch", label: "Crosswind catch", type: "normal", x: -74, yOffset: -220, radius: 5.8, tags: ["mastery-crest", "crosswind-catch"] },
      { fromSummit: 1, id: "relay-crown", role: "crest-handoff", label: "Relay crown", type: "normal", x: 58, yOffset: -105, radius: 6.4, tags: ["mastery-crest", "signal-handoff"] },
      { fromSummit: 0, id: "summit", role: "crest-summit", label: "Summit relay", type: "summit", x: 0, yOffset: 0, radius: 20, tags: ["mastery-crest", "signal-delivery"] }
    ]
  };
  const openingPattern = sector <= 1 ? null : options.openingPattern ?? {
    id: `counterwind-opening-${sector}`,
    windDirection,
    label: windDirection < 0 ? "Westbound counterwind" : "Eastbound counterwind",
    baseStrength: 0.007,
    peakStrength: 0.024,
    response: 0.18,
    approach: {
      gustIntensity: 0.38,
      status: windDirection < 0
        ? "Counterwind building from the right. Load into it before the gate."
        : "Counterwind building from the left. Load into it before the gate."
    },
    beats: [
      { index: 1, id: "counterwind-gate", role: "opening-windward", label: "Counterwind gate", type: "normal", x: -72 * windDirection, y: 124, radius: 7.2, gustIntensity: 0.58, pressureDelta: 14, status: "Counterwind Gate secured. Gust building—load across it into Leeward Cradle.", tags: ["counterwind-opening", "windward-load"] },
      { index: 2, id: "leeward-cradle", role: "opening-leeward", label: "Leeward cradle", type: "normal", x: 52 * windDirection, y: 244, radius: 7.8, gustIntensity: 0.8, pressureDelta: 22, status: "Leeward Cradle secured. Pressure rising—reverse hard into the exposed catch.", tags: ["counterwind-opening", "leeward-catch"] },
      { index: 3, id: "reverse-catch", role: "opening-reverse", label: "Reverse catch", type: "normal", x: -76 * windDirection, y: 366, radius: 7, gustIntensity: 1, pressureDelta: 30, status: "Peak gust caught. One controlled release reaches Counterwind Rest.", tags: ["counterwind-opening", "reverse-swing"] },
      { index: 4, id: "counterwind-rest", role: "opening-rest", label: "Counterwind rest", type: "rest", x: 48 * windDirection, y: 486, radius: 9.5, gustIntensity: 0.08, pressureRecovery: 100, status: "Counterwind Rest secured. Gust pressure vented—signal line stabilized.", tags: ["counterwind-opening", "recovery-confirmation"] }
    ]
  };
  const postRestChoice = sector <= 1 ? null : options.postRestChoice ?? {
    id: `post-rest-signal-fork-${sector}`,
    label: "Signal fork",
    restAnchorId: "counterwind-rest",
    status: "Signal fork open. Grapple onto the mint recovery line or the amber pressure line.",
    prompt: "Choose mint Shelter Rise for recovery or amber Signal Cut for +46 pressure and a faster signal cache.",
    safe: {
      index: 5,
      id: "shelter-rise",
      role: "safe-recovery",
      label: "Shelter rise",
      type: "rest",
      x: 82 * windDirection,
      y: 592,
      radius: 10.5,
      staminaRestore: 88,
      gustIntensity: 0.14,
      status: "Shelter Rise secured. Stamina topped off—take the protected line to Fork Relay.",
      tags: ["post-rest-choice", "safe-recovery-ascent", "mint-route"]
    },
    shortcut: {
      index: 6,
      id: "signal-cut",
      role: "pressure-shortcut",
      label: "Signal cut",
      type: "normal",
      x: -92 * windDirection,
      y: 620,
      radius: 8.6,
      gustIntensity: 0.88,
      pressureDelta: 46,
      cargoBonus: 1.75,
      status: "Signal Cut committed. Cache acquired—hold the amber line through 46% pressure to Fork Relay.",
      tags: ["post-rest-choice", "signal-shortcut", "pressure-route", "amber-route"]
    },
    rejoin: {
      index: 7,
      id: "fork-relay",
      role: "choice-rejoin",
      label: "Fork relay",
      type: "normal",
      x: 12 * windDirection,
      y: 738,
      radius: 8.8,
      status: "Fork Relay secured. Route choice banked—carry the signal upward.",
      tags: ["post-rest-choice", "route-rejoin", "signal-relay"]
    },
    postRejoin: {
      index: 8,
      id: "stormlock-restore",
      role: "post-rejoin-restore",
      label: "Stormlock restore",
      type: "rest",
      x: 68 * windDirection,
      y: 864,
      radius: 10.2,
      staminaRestore: 74,
      gustIntensity: 0.1,
      pressureRecovery: 100,
      protectedFailFloorBonus: 210,
      protectedAimAssistBonus: 30,
      safeStatus: "Shelter line banked. One protected grapple reaches Stormlock Restore.",
      shortcutStatus: "Signal pressure retained. Grapple Stormlock Restore to vent the amber line.",
      resolvedSafeStatus: "Protected catch confirmed. Stormlock Restore is stable.",
      resolvedShortcutStatus: "Stormlock vent secured. Retained signal pressure released.",
      tags: ["post-rest-choice", "post-rejoin-restore", "pressure-vent", "protected-catch"]
    },
    payoff: {
      safe: {
        index: 9,
        id: "slipstream-launch",
        role: "safe-payoff",
        label: "Slipstream launch",
        type: "normal",
        x: 18 * windDirection,
        y: 970,
        radius: 9.4,
        launchSpeedMultiplier: 1.34,
        launchLiftBonus: 0.16,
        aimAssistBonus: 18,
        scoreMetric: "preserved-speed",
        scoreMultiplier: 100,
        status: "Shelter protection converted. Fire through the mint Slipstream Launch while the cable is overcharged.",
        resolvedStatus: "Slipstream Launch secured. Shelter protection paid out as immediate speed.",
        tags: ["post-stormlock-payoff", "safe-launch-window", "mint-route"]
      },
      shortcut: {
        index: 10,
        id: "cacheline-high",
        role: "shortcut-payoff",
        label: "Cacheline high",
        type: "normal",
        x: -66 * windDirection,
        y: 1012,
        radius: 6.2,
        cargoRequired: 1.75,
        gustIntensity: 0.94,
        aimAssistBonus: 12,
        aimAssistLeadX: 10,
        aimAssistLeadY: -32,
        cameraZoomBonus: 72,
        scoreMetric: "cargo-mastery",
        scoreMultiplier: 100,
        status: "Signal cache committed. Load right, then release through the smaller amber Cacheline High catch.",
        resolvedStatus: "Cacheline High secured. The shortcut cargo bought a harder, higher line.",
        tags: ["post-stormlock-payoff", "cargo-unlocked-high-line", "amber-route"]
      }
    },
    convergence: {
      index: 11,
      id: "windglass-relay",
      role: "route-convergence",
      label: "Windglass relay",
      type: "normal",
      x: 12 * windDirection,
      y: 1156,
      radius: 11.8,
      gustIntensity: 0.22,
      safeStatus: "Windglass Relay is reading the Slipstream overcharge. Preserve the mint velocity into the shared catch.",
      shortcutStatus: "Windglass Relay is reading the Cacheline transfer. Carry the amber cargo mastery into the shared catch.",
      resolvedSafeStatus: "Windglass Relay scored {score} SPEED. Slipstream velocity preserved—generic ascent restored.",
      resolvedShortcutStatus: "Windglass Relay scored {score} CARGO. Cacheline mastery banked—generic ascent restored.",
      tags: ["windglass-relay", "route-convergence", "branch-mastery-score"]
    }
  };
  return {
    id: "next-ledge-cinematic-ascent",
    sector,
    routeProjection: {
      id: "next-ledge-projected-route-kit",
      routeId,
      anchorPrefix: "anchor",
      seed: options.seed ?? "summit-recovery-protocol",
      path: {
        type: "bezier",
        start: { x: 0, y: 0, z: 0 },
        controls: [
          { x: -120 * windDirection, y: summitY * 0.28, z: 0 },
          { x: 110 * windDirection, y: summitY * 0.72, z: 0 }
        ],
        end: { x: 0, y: summitY, z: 0 }
      },
      sampling: {
        count: Math.max(Math.floor(n(pacing.minAnchors, 14)), Math.floor(summitY / sampleSpacingY)),
        jitterX: n(pacing.jitterX, 165),
        jitterY: n(pacing.jitterY, 36),
        seed: `${options.seed ?? "summit-recovery-protocol"}:${sector}`
      },
      projection: {
        method: "plane",
        z: 0,
        normal: { x: 0, y: 0, z: 1 }
      },
      validation: {
        minSpacing: n(pacing.minSpacing, 54),
        maxEdgeDistance: n(pacing.maxEdgeDistance, 205)
      },
      restEvery: Math.max(2, Math.floor(n(pacing.restEvery, 4))),
      anchorRadius: n(pacing.anchorRadius, 6.5)
    },
    climb: {
      routeId,
      summitY,
      startTag: "start",
      endTag: "end",
      restTag: "rest",
      normalRadius: 5.2,
      startRadius: 9,
      restRadius: 7,
      summitRadius: 15,
      staminaRestore: n(options.restRestore, n(pacing.restRestore, 58)),
      openingPattern,
      postRestChoice,
      masteryCrest
    },
    transition: {
      broadcastDuration: 0.72,
      handshakeDuration: 0.78,
      openingDuration: 1.08,
      targetWindDirection: -windDirection
    },
    objective: {
      id: "next-ledge-objective-flow",
      steps: [
        { id: "restore-stamina", label: "Find restore units", requiredAction: "rest", target: 1 },
        { id: "reach-summit", label: "Reach the summit", requiredAction: "summit", target: 1 }
      ]
    }
  };
}
