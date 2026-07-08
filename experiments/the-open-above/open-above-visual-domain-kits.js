const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value)));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => ((hashText(`${seed}:${index}:${salt}`) % 10000) / 10000);
const body = (snapshot = {}) => snapshot.body ?? {};
const camera = (snapshot = {}) => snapshot.camera ?? {};

export function createOpenAboveCloudStrataKit(options = {}) {
  const seed = options.seed ?? "open-above-cloud-strata";
  const count = Math.max(4, Math.floor(n(options.count, 9)));
  return {
    id: "open-above-cloud-strata-kit",
    domain: "sky.cloud.strata",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitude = n(b.altitude ?? b.position?.y, 0);
      const speed = n(b.speed, 0);
      return Array.from({ length: count }, (_, index) => {
        const depth = 0.18 + index / Math.max(1, count - 1) * 0.78;
        const drift = wave01(seed, index, Math.floor(n(snapshot.frame) / 120));
        return {
          id: `cloud-strata:${index}`,
          domain: "sky.cloud.strata.band",
          layer: index < 3 ? "near" : index < 7 ? "mid" : "far",
          x01: (wave01(seed, index, 2) + drift * 0.08 + speed * 0.0009) % 1,
          y01: clamp(0.08 + depth * 0.52 - altitude * 0.000045, 0.04, 0.72),
          width01: 0.24 + wave01(seed, index, 3) * 0.32,
          opacity: clamp(0.16 + depth * 0.28 + speed * 0.0008, 0.12, 0.58),
          blurPx: 18 + Math.round(depth * 36),
          scale: 0.82 + depth * 1.7
        };
      });
    }
  };
}

export function createOpenAboveMountainRidgelineKit(options = {}) {
  const seed = options.seed ?? "open-above-mountain-ridges";
  const count = Math.max(3, Math.floor(n(options.count, 6)));
  return {
    id: "open-above-mountain-ridgeline-kit",
    domain: "terrain.horizon.ridgeline",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance = n(b.clearance, 200);
      const roll = n(b.rotation?.roll, 0);
      return Array.from({ length: count }, (_, index) => ({
        id: `horizon-ridge:${index}`,
        domain: "terrain.horizon.ridgeline.band",
        y01: clamp(0.58 + index * 0.045 + clearance * 0.00006, 0.46, 0.86),
        height01: 0.06 + wave01(seed, index, 1) * 0.08,
        parallax: 0.018 + index * 0.012,
        rollOffset: clamp(roll * (0.12 + index * 0.018), -0.14, 0.14),
        opacity: clamp(0.12 + (count - index) * 0.038, 0.1, 0.34)
      }));
    }
  };
}

export function createOpenAboveSpeedRibbonKit(options = {}) {
  const lanes = Math.max(2, Math.floor(n(options.lanes, 5)));
  return {
    id: "open-above-speed-ribbon-kit",
    domain: "flight.feedback.speed-ribbon",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const carve = clamp(n(b.carve?.turnStrength, 0));
      if (speed01 < 0.16 && carve < 0.08) return [];
      return Array.from({ length: lanes }, (_, index) => ({
        id: `speed-ribbon:${index}`,
        domain: "flight.feedback.speed-ribbon.stroke",
        side: index % 2 === 0 ? "left" : "right",
        x01: 0.5 + (index - (lanes - 1) / 2) * 0.09,
        y01: 0.58 + index * 0.038,
        length01: clamp(0.18 + speed01 * 0.42 + carve * 0.08, 0.16, 0.72),
        opacity: clamp(0.12 + speed01 * 0.34 + carve * 0.22, 0.08, 0.72),
        bend: clamp((index - 2) * 0.04 + n(b.rotation?.roll, 0) * 0.18, -0.2, 0.2)
      }));
    }
  };
}

export function createOpenAboveThermalColumnKit(options = {}) {
  const seed = options.seed ?? "open-above-thermal-columns";
  const count = Math.max(3, Math.floor(n(options.count, 7)));
  return {
    id: "open-above-thermal-column-kit",
    domain: "air.current.thermal-column",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const frame = Math.floor(n(snapshot.frame) / 90);
      return Array.from({ length: count }, (_, index) => {
        const phase = wave01(seed, index, frame);
        const near = phase > 0.48;
        return {
          id: `thermal-column:${index}`,
          domain: "air.current.thermal-column.marker",
          x01: wave01(seed, index, 3),
          y01: clamp(0.22 + wave01(seed, index, 4) * 0.46 - n(b.clearance, 180) * 0.00018, 0.12, 0.74),
          radius01: 0.028 + wave01(seed, index, 5) * 0.04,
          spin: wave01(seed, index, frame + 7) * 2 - 1,
          liftHint: near ? "strong" : "ambient",
          opacity: near ? 0.34 : 0.14
        };
      });
    }
  };
}

export function createOpenAboveWingtipContrailKit(options = {}) {
  return {
    id: "open-above-wingtip-contrail-kit",
    domain: "actor.wingtip.contrail",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const carve = clamp(n(b.carve?.turnStrength, 0));
      const strength = clamp(speed01 * 0.52 + carve * 0.64 - 0.12, 0, 1);
      return ["left", "right"].map((side, index) => ({
        id: `wingtip-contrail:${side}`,
        domain: "actor.wingtip.contrail.stream",
        side,
        x01: 0.5 + (index === 0 ? -0.18 : 0.18) + n(b.rotation?.roll, 0) * 0.035,
        y01: 0.58 + Math.abs(n(b.rotation?.roll, 0)) * 0.035,
        length01: 0.16 + strength * 0.28,
        opacity: strength,
        taper: 0.74 + speed01 * 0.24
      }));
    }
  };
}

export function createOpenAboveFlightMoodKit(options = {}) {
  return {
    id: "open-above-flight-mood-kit",
    domain: "flight.mood.readability",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const lowClearance = 1 - clamp(n(b.clearance, 200) / 260);
      const carve = clamp(n(b.carve?.turnStrength, 0));
      const intensity = clamp(speed01 * 0.28 + lowClearance * 0.38 + carve * 0.34);
      return {
        id: "flight-mood",
        domain: "flight.mood.readability.snapshot",
        intensity,
        vignette: 0.1 + intensity * 0.28,
        haze: 0.06 + intensity * 0.24,
        windLineOpacity: 0.08 + speed01 * 0.35,
        horizonGlow: 0.12 + (1 - lowClearance) * 0.18
      };
    }
  };
}

export function createOpenAboveVisualFractalDomainKit(options = {}) {
  const cloudStrata = options.cloudStrata ?? createOpenAboveCloudStrataKit(options.clouds);
  const ridgelines = options.ridgelines ?? createOpenAboveMountainRidgelineKit(options.ridges);
  const speedRibbons = options.speedRibbons ?? createOpenAboveSpeedRibbonKit(options.speed);
  const thermals = options.thermals ?? createOpenAboveThermalColumnKit(options.thermals);
  const contrails = options.contrails ?? createOpenAboveWingtipContrailKit(options.contrails);
  const mood = options.mood ?? createOpenAboveFlightMoodKit(options.mood);
  return {
    id: "open-above-visual-fractal-domain-kit",
    domain: "open-above.visual-fractal",
    compose(snapshot = {}) {
      return {
        mood: mood.describe(snapshot),
        cloudStrata: cloudStrata.describe(snapshot),
        ridgelines: ridgelines.describe(snapshot),
        speedRibbons: speedRibbons.describe(snapshot),
        thermals: thermals.describe(snapshot),
        contrails: contrails.describe(snapshot)
      };
    }
  };
}

export const OPEN_ABOVE_VISUAL_KIT_TREE = `the-open-above
├─ flight-domain
│  ├─ flight-motion-kit                 [existing ProtoKit]
│  ├─ flight.feedback.speed-ribbon
│  │  └─ open-above-speed-ribbon-kit
│  └─ actor.wingtip.contrail
│     └─ open-above-wingtip-contrail-kit
├─ sky-domain
│  └─ sky.cloud.strata
│     └─ open-above-cloud-strata-kit
├─ terrain-domain
│  └─ terrain.horizon.ridgeline
│     └─ open-above-mountain-ridgeline-kit
├─ air-current-domain
│  └─ air.current.thermal-column
│     └─ open-above-thermal-column-kit
├─ readability-domain
│  └─ flight.mood.readability
│     └─ open-above-flight-mood-kit
└─ open-above-visual-fractal-domain-kit
   └─ renderer/browser overlay descriptor handoff`;
