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

function routePoints(level = {}) {
  const route = stableArray(level.route);
  if (route.length) {
    return route.map((point, index) => ({
      id: point.id ?? `route-${index}`,
      x: Number(point.x ?? point.position?.x ?? 0),
      z: Number(point.z ?? point.position?.z ?? index * 8)
    }));
  }
  return [
    { id: "harbor-fog-gate", x: -14, z: -4 },
    { id: "reed-marker", x: -8, z: 7 },
    { id: "observatory-yard", x: -2, z: 18 },
    { id: "mirror-platform", x: 6, z: 30 },
    { id: "kite-ridge", x: 11, z: 43 },
    { id: "dawn-relay", x: 3, z: 55 }
  ];
}

function pick(points, index) {
  if (!points.length) return { id: "fallback", x: 0, z: 0 };
  return points[Math.min(points.length - 1, Math.max(0, index))];
}

function readPlayer(game = {}) {
  const player = game.player ?? game.avatar ?? {};
  return {
    x: Number(player.x ?? player.position?.x ?? 0),
    z: Number(player.z ?? player.position?.z ?? 0),
    scan: Boolean(game.scanActive ?? game.scanning ?? player.scan),
    focus: String(game.focus ?? game.tool ?? player.tool ?? "scan")
  };
}

function routeProgress(game = {}, level = {}) {
  const player = readPlayer(game);
  const bounds = level.bounds ?? { minZ: -8, maxZ: 58 };
  return clamp01((player.z - Number(bounds.minZ ?? -8)) / Math.max(1, Number(bounds.maxZ ?? 58) - Number(bounds.minZ ?? -8)));
}

function fogPressure(input = {}) {
  const game = input.game ?? {};
  const base = Number(game.fogPressure ?? game.hazardPressure ?? game.visibilityPressure ?? 0.48);
  const storm = Number(game.stormPressure ?? game.weatherPressure ?? 0.16);
  const pulse = Math.sin(Number(input.time ?? 0) * 0.55) * 0.045;
  const scanRelief = readPlayer(game).scan ? -0.08 : 0;
  return clamp01(base + storm * 0.24 + pulse + scanRelief);
}

function calibration(input = {}) {
  const game = input.game ?? {};
  const tools = Number(game.tools ?? game.parts ?? game.repairParts ?? 0);
  const scans = Number(game.scans ?? game.scanCount ?? game.samples ?? 0);
  const progress = routeProgress(game, input.level);
  return clamp01(0.14 + tools * 0.075 + scans * 0.055 + progress * 0.45 + (readPlayer(game).scan ? 0.09 : 0) - fogPressure(input) * 0.12);
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable fog observatory calibration descriptors only",
    rendererMustOwn: ["screen placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "browser input", "DOM ownership", "collision", "asset loading", "sound", "timing loop", "Three.js runtime", "WebGL runtime", "network"]
  };
}

export const FOGLINE_FOG_OBSERVATORY_CALIBRATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "fogline-fog-observatory-calibration-readiness-domain",
  subdomains: [
    {
      id: "atmospheric-reading-domain",
      subdomains: [
        { id: "barometer-needle-domain", kits: ["fogline-barometer-needle-kit"] },
        { id: "hygrometer-sash-domain", kits: ["fogline-hygrometer-sash-kit"] }
      ]
    },
    {
      id: "signal-calibration-domain",
      subdomains: [
        {
          id: "heliograph-alignment-domain",
          subdomains: [
            { id: "mirror-azimuth-domain", kits: ["fogline-heliograph-mirror-kit"] },
            { id: "relay-kite-domain", kits: ["fogline-relay-kite-kit"] }
          ]
        }
      ]
    },
    {
      id: "evacuation-report-domain",
      subdomains: [
        { id: "map-flag-domain", kits: ["fogline-map-flag-kit"] },
        { id: "dawn-observatory-ledger-domain", kits: ["fogline-dawn-observatory-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["fogline-fog-observatory-calibration-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes fog observatory calibration descriptors only; reusable kits do not own presentation, DOM, input, assets, sound, timing, physics, or graphics runtime"
});

export function createFoglineBarometerNeedleKit() {
  return {
    id: "n-fogline-barometer-needle-kit",
    domain: "fogline-fog-observatory-calibration-readiness/atmospheric-reading/barometer-needle",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = fogPressure(input);
      return [pick(points, 1), pick(points, 2), pick(points, 3)].map((point, index) => {
        const swing = clamp01(pressure * 0.68 + index * 0.08 + routeProgress(input.game, input.level) * 0.14);
        return {
          id: `barometer-needle-${point.id}`,
          kind: "barometer-needle",
          compatibleBucket: "pressureVignettes",
          position: { x: round(point.x - 0.4 + index * 0.45), y: 0.42, z: round(point.z + 0.55) },
          swing: round(swing),
          radius: round(0.85 + swing * 1.4),
          opacity: round(0.12 + swing * 0.25),
          color: swing > 0.72 ? "#ffad91" : "#9deaff",
          rendererContract: notOwnRendererContract("fogline-barometer-needle-kit")
        };
      });
    }
  };
}

export function createFoglineHygrometerSashKit() {
  return {
    id: "n-fogline-hygrometer-sash-kit",
    domain: "fogline-fog-observatory-calibration-readiness/atmospheric-reading/hygrometer-sash",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = fogPressure(input);
      return [pick(points, 0), pick(points, 2), pick(points, 4)].map((point, index) => {
        const wetness = clamp01(pressure * 0.56 + 0.18 + index * 0.055);
        return {
          id: `hygrometer-sash-${point.id}`,
          kind: "hygrometer-sash",
          compatibleBucket: "routeThreads",
          position: { x: round(point.x + (index - 1) * 1.15), y: 0.24, z: round(point.z - 0.8) },
          length: round(4.8 + wetness * 7.5),
          yaw: round(0.35 + index * 0.42),
          wetness: round(wetness),
          width: round(0.45 + wetness * 0.72),
          opacity: round(0.1 + wetness * 0.22),
          color: "#bff6ff",
          rendererContract: notOwnRendererContract("fogline-hygrometer-sash-kit")
        };
      });
    }
  };
}

export function createFoglineHeliographMirrorKit() {
  return {
    id: "n-fogline-heliograph-mirror-kit",
    domain: "fogline-fog-observatory-calibration-readiness/signal-calibration/heliograph-alignment/mirror-azimuth",
    describe(input = {}) {
      const points = routePoints(input.level);
      const align = calibration(input);
      return [pick(points, 2), pick(points, 3), pick(points, 5)].map((point, index) => {
        const sparkle = clamp01(align * 0.72 + index * 0.08 + (readPlayer(input.game).focus === "mirror" ? 0.1 : 0));
        return {
          id: `heliograph-mirror-${point.id}`,
          kind: "heliograph-mirror",
          compatibleBucket: "objectiveNeedles",
          position: { x: round(point.x + 0.8 + index * 0.32), y: 0.56, z: round(point.z + 0.35) },
          sparkle: round(sparkle),
          radius: round(0.76 + sparkle * 1.05),
          opacity: round(0.14 + sparkle * 0.32),
          color: sparkle > 0.7 ? "#fff4a8" : "#d4fff2",
          rendererContract: notOwnRendererContract("fogline-heliograph-mirror-kit")
        };
      });
    }
  };
}

export function createFoglineRelayKiteKit() {
  return {
    id: "n-fogline-relay-kite-kit",
    domain: "fogline-fog-observatory-calibration-readiness/signal-calibration/heliograph-alignment/relay-kite",
    describe(input = {}) {
      const points = routePoints(input.level);
      const align = calibration(input);
      const wind = clamp01(Number(input.game?.wind ?? input.game?.crosswind ?? 0.38) + fogPressure(input) * 0.18);
      return [pick(points, 3), pick(points, 4)].map((point, index) => {
        const lift = clamp01(0.2 + align * 0.45 + wind * 0.22 + index * 0.08);
        return {
          id: `relay-kite-${point.id}`,
          kind: "relay-kite",
          compatibleBucket: "skyBeacons",
          position: { x: round(point.x + (index ? 1.35 : -0.9)), y: round(2.5 + lift * 3.2), z: round(point.z + 1.6) },
          lift: round(lift),
          radius: round(0.7 + lift * 1.4),
          opacity: round(0.16 + lift * 0.28),
          color: lift > 0.68 ? "#c8ff8f" : "#ffdca8",
          rendererContract: notOwnRendererContract("fogline-relay-kite-kit")
        };
      });
    }
  };
}

export function createFoglineMapFlagKit() {
  return {
    id: "n-fogline-map-flag-kit",
    domain: "fogline-fog-observatory-calibration-readiness/evacuation-report/map-flag",
    describe(input = {}) {
      const points = routePoints(input.level);
      const align = calibration(input);
      const scans = Number(input.game?.scans ?? input.game?.scanCount ?? 0);
      return points.slice(1, 5).map((point, index) => {
        const confidence = clamp01(0.18 + align * 0.44 + scans * 0.04 + index * 0.035);
        return {
          id: `observatory-map-flag-${point.id}`,
          kind: "observatory-map-flag",
          compatibleBucket: "gateSigils",
          position: { x: round(point.x - 1.1), y: 0.3, z: round(point.z + index * 0.42) },
          confidence: round(confidence),
          radius: round(0.58 + confidence * 0.9),
          opacity: round(0.11 + confidence * 0.27),
          color: confidence > 0.62 ? "#b8ff93" : "#ffe08a",
          rendererContract: notOwnRendererContract("fogline-map-flag-kit")
        };
      });
    }
  };
}

export function createFoglineDawnObservatoryLedgerKit() {
  return {
    id: "n-fogline-dawn-observatory-ledger-kit",
    domain: "fogline-fog-observatory-calibration-readiness/evacuation-report/dawn-observatory-ledger",
    describe(input = {}, descriptors = {}) {
      const mirrors = stableArray(descriptors.heliographMirrors);
      const kites = stableArray(descriptors.relayKites);
      const flags = stableArray(descriptors.mapFlags);
      const barometers = stableArray(descriptors.barometerNeedles);
      const mirrorScore = mirrors.reduce((sum, item) => sum + Number(item.sparkle ?? 0), 0) / Math.max(1, mirrors.length);
      const kiteScore = kites.reduce((sum, item) => sum + Number(item.lift ?? 0), 0) / Math.max(1, kites.length);
      const mapScore = flags.reduce((sum, item) => sum + Number(item.confidence ?? 0), 0) / Math.max(1, flags.length);
      const pressureScore = barometers.reduce((sum, item) => sum + Number(item.swing ?? 0), 0) / Math.max(1, barometers.length);
      const readiness = clamp01(mirrorScore * 0.32 + kiteScore * 0.26 + mapScore * 0.27 + calibration(input) * 0.22 - pressureScore * 0.13);
      const points = routePoints(input.level);
      const relay = pick(points, points.length - 1);
      return [{
        id: "dawn-observatory-ledger-primary",
        kind: "dawn-observatory-ledger",
        compatibleBucket: "summaryLedgers",
        position: { x: round(relay.x), y: 0.72, z: round(relay.z + 2.2) },
        readiness: round(readiness),
        pressure: round(pressureScore),
        missionState: readiness > 0.74 ? "relay-ready" : readiness > 0.52 ? "aligned" : pressureScore > 0.68 ? "fogbound" : "calibrating",
        descriptorSummary: {
          barometerNeedles: barometers.length,
          hygrometerSashes: stableArray(descriptors.hygrometerSashes).length,
          heliographMirrors: mirrors.length,
          relayKites: kites.length,
          mapFlags: flags.length
        },
        radius: round(1 + readiness * 1.15),
        opacity: round(0.16 + readiness * 0.3),
        color: readiness > 0.68 ? "#d8ffc0" : "#ffd36d",
        rendererContract: notOwnRendererContract("fogline-dawn-observatory-ledger-kit")
      }];
    }
  };
}

export function createFoglineFogObservatoryCalibrationRendererHandoffKit() {
  return {
    id: "n-fogline-fog-observatory-calibration-renderer-handoff-kit",
    domain: "fogline-fog-observatory-calibration-readiness/renderer-handoff",
    describe(descriptors = {}) {
      const drawOrder = [
        ...stableArray(descriptors.hygrometerSashes),
        ...stableArray(descriptors.barometerNeedles),
        ...stableArray(descriptors.mapFlags),
        ...stableArray(descriptors.heliographMirrors),
        ...stableArray(descriptors.relayKites),
        ...stableArray(descriptors.dawnObservatoryLedgers)
      ];
      return {
        id: "fogline-fog-observatory-calibration-renderer-handoff",
        archetype: "fogline.renderer.handoff.fog.observatory.calibration",
        policy: "renderer-consumes-descriptors-only",
        compatibleBuckets: ["pressureVignettes", "routeThreads", "objectiveNeedles", "skyBeacons", "gateSigils", "summaryLedgers"],
        descriptorCount: drawOrder.length,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, stableArray(value).length])),
        descriptors: drawOrder,
        drawOrder,
        ownership: {
          renderer: "consume-only",
          dom: "excluded",
          browserInput: "excluded",
          three: "excluded",
          webgl: "excluded",
          audio: "excluded",
          assets: "excluded",
          frameLoop: "excluded",
          physics: "excluded"
        }
      };
    }
  };
}

export function createFoglineFogObservatoryCalibrationReadinessDomainKit() {
  const barometerNeedleKit = createFoglineBarometerNeedleKit();
  const hygrometerSashKit = createFoglineHygrometerSashKit();
  const heliographMirrorKit = createFoglineHeliographMirrorKit();
  const relayKiteKit = createFoglineRelayKiteKit();
  const mapFlagKit = createFoglineMapFlagKit();
  const dawnObservatoryLedgerKit = createFoglineDawnObservatoryLedgerKit();
  const rendererHandoffKit = createFoglineFogObservatoryCalibrationRendererHandoffKit();
  return {
    id: "n-fogline-fog-observatory-calibration-readiness-domain-kit",
    tree: FOGLINE_FOG_OBSERVATORY_CALIBRATION_READINESS_DOMAIN_TREE,
    kits: [barometerNeedleKit, hygrometerSashKit, heliographMirrorKit, relayKiteKit, mapFlagKit, dawnObservatoryLedgerKit, rendererHandoffKit],
    describe(input = {}) {
      const barometerNeedles = barometerNeedleKit.describe(input);
      const hygrometerSashes = hygrometerSashKit.describe(input);
      const heliographMirrors = heliographMirrorKit.describe(input);
      const relayKites = relayKiteKit.describe(input);
      const mapFlags = mapFlagKit.describe(input);
      const dawnObservatoryLedgers = dawnObservatoryLedgerKit.describe(input, { barometerNeedles, hygrometerSashes, heliographMirrors, relayKites, mapFlags });
      const rendererHandoff = rendererHandoffKit.describe({ barometerNeedles, hygrometerSashes, heliographMirrors, relayKites, mapFlags, dawnObservatoryLedgers });
      return {
        id: "fogline-fog-observatory-calibration-readiness",
        version: 1,
        domain: "fogline-fog-observatory-calibration-readiness-domain",
        tree: this.tree,
        readiness: dawnObservatoryLedgers[0]?.readiness ?? 0,
        pressure: dawnObservatoryLedgers[0]?.pressure ?? 0,
        missionState: dawnObservatoryLedgers[0]?.missionState ?? "calibrating",
        barometerNeedles,
        hygrometerSashes,
        heliographMirrors,
        relayKites,
        mapFlags,
        dawnObservatoryLedgers,
        rendererHandoff,
        drawOrder: rendererHandoff.drawOrder
      };
    }
  };
}
