const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, n(v, a)));
const p = (v = {}, f = {}) => ({ x: n(v.x, f.x ?? 0), y: n(v.y, f.y ?? 0), z: n(v.z, f.z ?? 10) });
const avg = (xs = [], fn = (x) => x) => xs.reduce((s, x) => s + n(fn(x)), 0) / Math.max(1, xs.length);
const ledges = (s = {}) => Array.isArray(s.route?.ledges) ? s.route.ledges : [];
const player = (s = {}) => p(s.player, { x: 0, y: 0, z: 8 });
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));

export const NEXT_LEDGE_SUMMIT_WEATHER_STATION_TREE = `
next-ledge-summit-weather-station-readiness-domain
├─ station-repair-domain
│  ├─ anemometer-mast-domain
│  │  └─ next-ledge-anemometer-mast-kit
│  └─ solar-battery-cache-domain
│     └─ next-ledge-solar-battery-cache-kit
├─ forecast-routing-domain
│  ├─ barometer-stake-domain
│  │  └─ next-ledge-barometer-stake-kit
│  └─ wind-corridor-ribbon-domain
│     └─ next-ledge-wind-corridor-ribbon-kit
├─ evacuation-broadcast-domain
│  ├─ radio-repeater-domain
│  │  └─ next-ledge-radio-repeater-kit
│  └─ dawn-forecast-ledger-domain
│     └─ next-ledge-dawn-forecast-ledger-kit
└─ renderer-handoff
   └─ next-ledge-summit-weather-station-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const CONTRACT = "renderer consumes descriptors only; station repair, forecast routing, evacuation broadcast, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop truth stay outside reusable kit logic";

function indexOfRoute(s = {}) {
  const list = ledges(s);
  const current = s.currentAnchorId ?? s.lastLedgeId ?? s.anchorLedge?.id;
  const found = list.findIndex((x) => x.id === current);
  if (found >= 0) return found;
  const me = player(s);
  return list.reduce((best, x, i) => dist(me, x) < dist(me, list[best] ?? {}) ? i : best, 0);
}

function routeSlice(s = {}, count = 6) {
  const list = ledges(s);
  if (!list.length) return [];
  const i = indexOfRoute(s);
  return list.slice(Math.max(0, i - 1), Math.min(list.length, i + count)).map((x, order) => ({ ...x, order }));
}

function stationSites(s = {}) {
  const special = ledges(s).filter((x) => x.type === "summit" || x.type === "rest" || x.safe);
  return (special.length ? special : routeSlice(s, 5)).slice(0, 5).map((x, order) => ({ ...x, order }));
}

function stamina(s = {}) { return clamp(n(s.stamina, 0) / Math.max(1, n(s.constants?.maxStamina, 115))); }
function progress(s = {}) {
  if (Number.isFinite(Number(s.weatherStation?.repairProgress))) return clamp(s.weatherStation.repairProgress);
  if (Number.isFinite(Number(s.stationRepairProgress))) return clamp(s.stationRepairProgress);
  return clamp((Array.isArray(s.visitedLedgeIds) ? s.visitedLedgeIds.length : indexOfRoute(s) + 1) / Math.max(1, ledges(s).length || 6));
}
function storm(s = {}) {
  const wind = n(s.weather?.wind, s.wind ?? 0.38);
  const blizzard = n(s.weather?.storm, s.blizzardIntensity ?? 0.42);
  const high = clamp(Math.max(0, player(s).y) / 900);
  const fail = s.mode === "failed" || s.mode === "falling" ? 0.2 : 0;
  return clamp(wind * 0.28 + blizzard * 0.36 + high * 0.18 + (1 - stamina(s)) * 0.16 + fail);
}

export function createAnemometerMastKit(options = {}) {
  return { id: options.id ?? "next-ledge-anemometer-mast-kit", describe(s = {}) {
    const pressure = storm(s);
    return stationSites(s).slice(0, 4).map((x, order) => {
      const stability = clamp(0.72 - pressure * 0.28 + (x.type === "summit" ? 0.12 : 0) - order * 0.025);
      return { id: `${s.levelId ?? "next-ledge"}:anemometer:${x.id ?? order}`, kind: "next-ledge-anemometer-mast", order, position: p({ x: n(x.x) + 12, y: n(x.y) + 22, z: 18 }), vaneSpin: Math.round(80 + pressure * 220 + order * 12), stability, mastState: stability > 0.76 ? "calibrated" : stability > 0.5 ? "guy-line-check" : "mast-bracing-needed", rendererContract: CONTRACT };
    });
  }};
}

export function createSolarBatteryCacheKit(options = {}) {
  return { id: options.id ?? "next-ledge-solar-battery-cache-kit", describe(s = {}) {
    const prog = progress(s);
    const pressure = storm(s);
    return routeSlice(s, 6).slice(0, 4).map((x, order) => {
      const charge = clamp(0.38 + prog * 0.34 + (x.type === "rest" ? 0.16 : 0.04) - pressure * 0.15 - order * 0.03);
      return { id: `${s.levelId ?? "next-ledge"}:solar-battery:${x.id}`, kind: "next-ledge-solar-battery-cache", order, ledgeId: x.id, position: p({ x: n(x.x) - 18, y: n(x.y) + 9, z: 9 }), charge, panelCount: Math.max(2, Math.round(2 + charge * 6)), cacheState: charge > 0.74 ? "relay-power-ready" : charge > 0.46 ? "trickle-charging" : "battery-haul-needed", rendererContract: CONTRACT };
    });
  }};
}

export function createBarometerStakeKit(options = {}) {
  return { id: options.id ?? "next-ledge-barometer-stake-kit", describe(s = {}) {
    const pressure = storm(s);
    return routeSlice(s, 7).slice(0, 5).map((x, order) => {
      const reading = clamp(0.3 + pressure * 0.48 + Math.abs(n(x.x)) / 1100 + order * 0.025);
      return { id: `${s.levelId ?? "next-ledge"}:barometer:${x.id}`, kind: "next-ledge-barometer-stake", order, ledgeId: x.id, position: p({ x: n(x.x) + 7, y: n(x.y) + 13, z: 11 }), pressureReading: reading, tickMarks: Math.max(3, Math.round(4 + reading * 7)), readingState: reading > 0.74 ? "pressure-drop-warning" : reading > 0.5 ? "watching-front" : "stable-window", rendererContract: CONTRACT };
    });
  }};
}

export function createWindCorridorRibbonKit(options = {}) {
  return { id: options.id ?? "next-ledge-wind-corridor-ribbon-kit", describe(s = {}, g = {}) {
    const mastSafety = avg(g.anemometerMasts, (x) => x.stability);
    const route = routeSlice(s, 6);
    return route.slice(0, 5).map((x, order) => {
      const next = route[order + 1] ?? x;
      const stake = (g.barometerStakes ?? [])[order % Math.max(1, (g.barometerStakes ?? []).length)] ?? {};
      const gustRisk = clamp(n(stake.pressureReading, storm(s)) * 0.55 + (1 - mastSafety) * 0.28 + dist(x, next) / 700);
      return { id: `${s.levelId ?? "next-ledge"}:wind-corridor:${x.id}`, kind: "next-ledge-wind-corridor-ribbon", order, ledgeId: x.id, start: p({ x: n(x.x), y: n(x.y) + 28, z: 14 }), end: p({ x: n(next.x), y: n(next.y) + 28, z: 14 }), gustRisk, ribbonCount: Math.max(2, Math.round(3 + gustRisk * 8)), corridorState: gustRisk > 0.72 ? "crosswind-hold" : gustRisk > 0.48 ? "rope-low" : "safe-gust-window", rendererContract: CONTRACT };
    });
  }};
}

export function createRadioRepeaterKit(options = {}) {
  return { id: options.id ?? "next-ledge-radio-repeater-kit", describe(s = {}, g = {}) {
    const signalBase = avg(g.anemometerMasts, (x) => x.stability) * 0.35 + avg(g.solarBatteryCaches, (x) => x.charge) * 0.32 + (1 - Math.max(0, ...(g.windCorridorRibbons ?? []).map((x) => n(x.gustRisk)))) * 0.2 + progress(s) * 0.13;
    return stationSites(s).slice(0, 3).map((x, order) => {
      const signal = clamp(signalBase - order * 0.04);
      return { id: `${s.levelId ?? "next-ledge"}:radio:${x.id ?? order}`, kind: "next-ledge-radio-repeater", order, position: p({ x: n(x.x) + 25, y: n(x.y) + 30, z: 22 }), signal, broadcastRadius: Math.round(120 + signal * 360), repeaterState: signal > 0.76 ? "broadcasting-forecast" : signal > 0.5 ? "tune-frequency" : "power-link-missing", rendererContract: CONTRACT };
    });
  }};
}

export function createDawnForecastLedgerKit(options = {}) {
  return { id: options.id ?? "next-ledge-dawn-forecast-ledger-kit", describe(s = {}, g = {}) {
    const readiness = clamp(avg(g.anemometerMasts, (x) => x.stability) * 0.22 + avg(g.solarBatteryCaches, (x) => x.charge) * 0.2 + clamp((g.barometerStakes?.length ?? 0) / 5) * 0.16 + (1 - Math.max(0, ...(g.windCorridorRibbons ?? []).map((x) => n(x.gustRisk)))) * 0.18 + avg(g.radioRepeaters, (x) => x.signal) * 0.2 + progress(s) * 0.04);
    const pressure = storm(s);
    return [{ id: `${s.levelId ?? "next-ledge"}:dawn-forecast-ledger`, kind: "next-ledge-dawn-forecast-ledger", readiness, stormPressure: pressure, phase: readiness > 0.82 ? "broadcast-dawn-window" : readiness > 0.62 ? "tune-repeaters" : readiness > 0.4 ? "repair-station-chain" : "haul-weather-kit", safeClimbWindowMinutes: Math.max(5, Math.round(10 + readiness * 55 - pressure * 18)), rendererContract: CONTRACT }];
  }};
}

export function createSummitWeatherStationRendererHandoffKit(options = {}) {
  return { id: options.id ?? "next-ledge-summit-weather-station-renderer-handoff-kit", describe(g = {}) {
    const descriptors = [ ...(g.anemometerMasts ?? []), ...(g.solarBatteryCaches ?? []), ...(g.barometerStakes ?? []), ...(g.windCorridorRibbons ?? []), ...(g.radioRepeaters ?? []), ...(g.dawnForecastLedgers ?? []) ];
    return { id: "next-ledge-summit-weather-station-readiness-renderer-handoff", kind: "renderer-handoff", descriptorCount: descriptors.length, descriptors, rendererContract: CONTRACT, counts: { anemometerMasts: g.anemometerMasts?.length ?? 0, solarBatteryCaches: g.solarBatteryCaches?.length ?? 0, barometerStakes: g.barometerStakes?.length ?? 0, windCorridorRibbons: g.windCorridorRibbons?.length ?? 0, radioRepeaters: g.radioRepeaters?.length ?? 0, dawnForecastLedgers: g.dawnForecastLedgers?.length ?? 0, total: descriptors.length } };
  }};
}

export function createNextLedgeSummitWeatherStationReadinessDomainKit(options = {}) {
  const mast = options.anemometerMastKit ?? createAnemometerMastKit(options.anemometerMast ?? {});
  const battery = options.solarBatteryCacheKit ?? createSolarBatteryCacheKit(options.solarBatteryCache ?? {});
  const barometer = options.barometerStakeKit ?? createBarometerStakeKit(options.barometerStake ?? {});
  const wind = options.windCorridorRibbonKit ?? createWindCorridorRibbonKit(options.windCorridorRibbon ?? {});
  const radio = options.radioRepeaterKit ?? createRadioRepeaterKit(options.radioRepeater ?? {});
  const ledger = options.dawnForecastLedgerKit ?? createDawnForecastLedgerKit(options.dawnForecastLedger ?? {});
  const handoff = options.rendererHandoffKit ?? createSummitWeatherStationRendererHandoffKit(options.rendererHandoff ?? {});
  return { id: options.id ?? "next-ledge-summit-weather-station-readiness-domain-kit", tree: NEXT_LEDGE_SUMMIT_WEATHER_STATION_TREE, kits: [mast.id, battery.id, barometer.id, wind.id, radio.id, ledger.id, handoff.id], ownership: { renderer: false, dom: false, browserInput: false, three: false, webgl: false, audio: false, assetLoading: false, frameLoop: false, physics: false }, describe(s = {}) {
    const anemometerMasts = mast.describe(s);
    const solarBatteryCaches = battery.describe(s);
    const barometerStakes = barometer.describe(s);
    const windCorridorRibbons = wind.describe(s, { anemometerMasts, barometerStakes });
    const radioRepeaters = radio.describe(s, { anemometerMasts, solarBatteryCaches, windCorridorRibbons });
    const dawnForecastLedgers = ledger.describe(s, { anemometerMasts, solarBatteryCaches, barometerStakes, windCorridorRibbons, radioRepeaters });
    const groups = { anemometerMasts, solarBatteryCaches, barometerStakes, windCorridorRibbons, radioRepeaters, dawnForecastLedgers };
    return { id: "next-ledge-summit-weather-station-readiness", kind: "domain-readiness", tree: NEXT_LEDGE_SUMMIT_WEATHER_STATION_TREE, rendererContract: CONTRACT, ...groups, rendererHandoff: handoff.describe(groups), summary: { readiness: dawnForecastLedgers[0]?.readiness ?? 0, phase: dawnForecastLedgers[0]?.phase ?? "haul-weather-kit", stormPressure: dawnForecastLedgers[0]?.stormPressure ?? storm(s), safeClimbWindowMinutes: dawnForecastLedgers[0]?.safeClimbWindowMinutes ?? 0 } };
  }};
}

export default createNextLedgeSummitWeatherStationReadinessDomainKit;
