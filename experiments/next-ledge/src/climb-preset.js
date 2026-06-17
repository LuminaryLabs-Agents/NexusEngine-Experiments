const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createNextLedgeClimbPreset(options = {}) {
  const sector = Math.max(1, Math.floor(Number(options.sector ?? 1)));
  const pacing = options.routePacing ?? options.pacing ?? options;
  const summitY = Number(options.summitY ?? n(pacing.summitBaseY, 2200) + sector * n(pacing.summitPerSectorY, 760));
  const routeId = `next-ledge-sector-${sector}`;
  const sampleSpacingY = Math.max(80, n(pacing.sampleSpacingY, 125));
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
      staminaRestore: n(options.restRestore, n(pacing.restRestore, 58))
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
