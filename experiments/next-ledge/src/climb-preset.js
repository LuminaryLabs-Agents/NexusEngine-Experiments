const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createNextLedgeClimbPreset(options = {}) {
  const sector = Math.max(1, Math.floor(Number(options.sector ?? 1)));
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
          { x: -120, y: summitY * 0.28, z: 0 },
          { x: 110, y: summitY * 0.72, z: 0 }
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
      masteryCrest
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
