export function createNextLedgeClimbPreset(options = {}) {
  const sector = Math.max(1, Math.floor(Number(options.sector ?? 1)));
  const summitY = Number(options.summitY ?? 2200 + sector * 800);
  const routeId = `next-ledge-sector-${sector}`;
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
        count: Math.max(12, Math.floor(summitY / 135)),
        jitterX: 150,
        jitterY: 30,
        seed: `${options.seed ?? "summit-recovery-protocol"}:${sector}`
      },
      projection: {
        method: "plane",
        z: 0,
        normal: { x: 0, y: 0, z: 1 }
      },
      validation: {
        minSpacing: 58,
        maxEdgeDistance: 190
      },
      restEvery: 5,
      anchorRadius: 6.5
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
      staminaRestore: 45
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
