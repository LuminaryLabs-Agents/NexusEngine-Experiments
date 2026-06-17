export const signalIslesPreset = Object.freeze({
  id: "signal-isles-frontier-01",
  displayName: "Nexus Frontier: Signal Isles",
  mode: "single-sector-scan-build-deliver",
  visual: Object.freeze({
    profile: "storm-dawn-living-islands",
    fog: Object.freeze({ color: "#8acbd6", density: 0.032, near: 14, far: 92 }),
    lighting: Object.freeze({ sunColor: "#ffe1a1", skyColor: "#78c8ff", fillColor: "#19283e", exposure: 1.1 }),
    materials: Object.freeze({
      "living-moss-stone": { color: "#284533", roughness: 0.92, metalness: 0.02 },
      "wet-basalt": { color: "#1f2d34", roughness: 0.86, metalness: 0.04 },
      "etched-basalt": { color: "#32313a", roughness: 0.7, metalness: 0.08 },
      "mossy-stone-emissive": { color: "#526044", emissive: "#65ffd1", emissiveIntensity: 0.25 },
      "cyan-crystal": { color: "#6df6ff", emissive: "#2fe9ff", emissiveIntensity: 1.7 },
      "charged-glass": { color: "#b5f9ff", emissive: "#6bf0ff", emissiveIntensity: 1.4 },
      "gold-cyan-emissive": { color: "#f4d36a", emissive: "#7ff8ff", emissiveIntensity: 2.1 },
      "wet-bark": { color: "#243121", roughness: 0.94 },
      "bluegreen-needles": { color: "#244f42", roughness: 0.9 },
      "storm-reed": { color: "#49686c", roughness: 0.95 },
      "dark-root-emissive": { color: "#17120f", emissive: "#63e9ff", emissiveIntensity: 0.35 }
    })
  }),
  audio: Object.freeze({
    scan: "soft-radio-chirp",
    build: "mast-lock-thrum",
    pressure: "distant-spore-wave",
    unlock: "root-gate-open",
    complete: "beacon-major-resolve"
  }),
  controls: Object.freeze({
    move: "WASD",
    look: "Mouse",
    scan: "Hold F / Mouse",
    interact: "E",
    build: "B",
    restart: "R"
  }),
  tuning: Object.freeze({
    scanPulsePerSecond: 1.65,
    interactRadius: 5.2,
    buildInteractRadius: 5,
    hazardDamagePerSecond: 0.08,
    waveDurationSeconds: 28,
    wavePressurePerSecond: 0.018,
    finalBeaconRadius: 5.5,
    maxDelta: 1 / 30
  })
});

export default signalIslesPreset;
