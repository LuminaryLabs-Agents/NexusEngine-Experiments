const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const c01 = (value) => clamp(value, 0, 1);
const r = (value, digits = 3) => Number(n(value).toFixed(digits));
const camPos = (camera = {}) => Array.isArray(camera.position)
  ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
  : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
const pos = (sample = {}, fallback = {}) => ({ x: r(n(sample.x, fallback.x)), y: r(n(sample.height, sample.y ?? fallback.y), 1), z: r(n(sample.z, fallback.z)) });
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
const height = (sample = {}) => c01((n(sample.height, sample.y) - 700) / 2100);
const storm = (sample = {}, time = 0) => c01(c01(sample.hydrology?.flow?.wetnessIndex ?? sample.material?.materialWeights?.wetChannel) * 0.24 + c01((4 - n(sample.climate?.temperatureC, 8)) / 20) * 0.2 + c01(sample.material?.materialWeights?.snow) * 0.22 + height(sample) * 0.2 + (0.5 + Math.sin(n(time) * 0.83 + n(sample.x) * 0.0007 + n(sample.z) * 0.0004) * 0.5) * 0.14);
const visible = (sample = {}, time = 0) => c01(1 - storm(sample, time) * 0.52 - c01(sample.landform?.terrainRuggedness ?? 0.28) * 0.2 + c01(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.24) * 0.12);
const slopeRisk = (sample = {}) => c01((n(sample.slope, 16) - 12) / 36);
const relay = (sample = {}, index = 0, time = 0) => c01(height(sample) * 0.34 + c01(sample.landform?.confidence ?? 0.5) * 0.24 + visible(sample, time) * 0.22 + (String(sample.tag ?? "").match(/observatory|tower/) ? 0.18 : 0) + index * 0.012);
const contract = (owner) => ({ owner, rendererConsumes: "terrain observatory evacuation descriptors only", rendererMustOwn: ["DOM placement", "Canvas/Three draw order", "color application", "view interpolation"], rendererMustNotOwn: ["evacuation truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL"] });

export const TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-observatory-evacuation-readiness-domain",
  subdomains: [
    { id: "observatory-safety-domain", subdomains: [{ id: "distress-beacon-domain", kits: ["terrain-observatory-distress-beacon-kit"] }, { id: "weather-tower-domain", kits: ["terrain-weather-tower-stability-kit"] }] },
    { id: "evacuation-route-domain", subdomains: [{ id: "ridge-switchback-domain", kits: ["terrain-ridge-switchback-route-kit"] }, { id: "supply-drop-zone-domain", kits: ["terrain-supply-drop-zone-kit"] }] },
    { id: "airlift-handoff-domain", subdomains: [{ id: "summit-radio-domain", kits: ["terrain-summit-radio-relay-kit"] }, { id: "evac-heli-window-domain", kits: ["terrain-evac-heli-window-kit"] }] },
    { id: "renderer-handoff", kits: ["terrain-observatory-evacuation-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes terrain observatory evacuation descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createTerrainObservatoryDistressBeaconKit({ maxBeacons = 5 } = {}) {
  return { id: "terrain-observatory-distress-beacon-kit", domain: "terrain-observatory-evacuation-readiness/observatory-safety-domain/distress-beacon-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const urgency = c01(storm(sample, input.time) * 0.42 + (1 - visible(sample, input.time)) * 0.26 + (1 - c01(dist(p, cam) / 5200)) * 0.2 + height(sample) * 0.12);
      return { id: `observatory-distress-beacon-${sample.tag ?? index}`, kind: "observatory-distress-beacon", label: sample.tag ?? `observatory-${index}`, position: { ...p, y: r(p.y + 52, 1) }, pulseStrength: r(c01(urgency * 0.72 + relay(sample, index, input.time) * 0.28)), urgency: r(urgency), distanceMeters: r(dist(p, cam), 1), status: urgency > 0.68 ? "priority-evac" : urgency > 0.42 ? "watch" : "stable", rendererContract: contract("terrain-observatory-distress-beacon-kit") };
    }).sort((a, b) => b.urgency - a.urgency).slice(0, maxBeacons);
  }, snapshot(input) { const beacons = this.describe(input); return { beacons: beacons.length, urgent: beacons.filter((beacon) => beacon.status === "priority-evac").length }; } };
}

export function createTerrainWeatherTowerStabilityKit({ maxTowers = 4 } = {}) {
  return { id: "terrain-weather-tower-stability-kit", domain: "terrain-observatory-evacuation-readiness/observatory-safety-domain/weather-tower-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const anchorIntegrity = c01(1 - storm(sample, input.time) * 0.45 - slopeRisk(sample) * 0.28 + c01(sample.landform?.confidence ?? 0.5) * 0.18);
      return { id: `weather-tower-stability-${sample.tag ?? index}`, kind: "weather-tower-stability", center: { ...p, y: r(p.y + 120, 1) }, radiusMeters: r(90 + relay(sample, index, input.time) * 210, 1), anchorIntegrity: r(anchorIntegrity), stormPressure: r(storm(sample, input.time)), status: anchorIntegrity > 0.68 ? "locked" : anchorIntegrity > 0.42 ? "brace" : "evacuate", rendererContract: contract("terrain-weather-tower-stability-kit") };
    }).sort((a, b) => a.anchorIntegrity - b.anchorIntegrity).slice(0, maxTowers);
  }, snapshot(input) { const towers = this.describe(input); return { towers: towers.length, evacuate: towers.filter((tower) => tower.status === "evacuate").length }; } };
}

export function createTerrainRidgeSwitchbackRouteKit({ maxRoutes = 5 } = {}) {
  return { id: "terrain-ridge-switchback-route-kit", domain: "terrain-observatory-evacuation-readiness/evacuation-route-domain/ridge-switchback-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    const origin = input.terrain?.origin ?? { x: 0, z: 0 };
    const from = { x: r(n(origin.x)), y: r(n(input.terrainSample?.height, cam.y - 160), 1), z: r(n(origin.z)) };
    return arr(input.samples).slice(0, maxRoutes).map((sample, index) => {
      const switchbackSafety = c01((1 - n(sample.slope, 16) / 48) * 0.52 + (1 - storm(sample, input.time)) * 0.26 + visible(sample, input.time) * 0.22);
      return { id: `ridge-switchback-route-${sample.tag ?? index}`, kind: "ridge-switchback-route", from, to: pos(sample, cam), switchbackSafety: r(switchbackSafety), ropeTeams: switchbackSafety > 0.66 ? 1 : switchbackSafety > 0.42 ? 2 : 4, status: switchbackSafety > 0.66 ? "walk-out" : switchbackSafety > 0.42 ? "roped-descent" : "hold-position", rendererContract: contract("terrain-ridge-switchback-route-kit") };
    });
  }, snapshot(input) { const routes = this.describe(input); return { routes: routes.length, open: routes.filter((route) => route.status === "walk-out").length }; } };
}

export function createTerrainSupplyDropZoneKit({ maxZones = 4 } = {}) {
  return { id: "terrain-supply-drop-zone-kit", domain: "terrain-observatory-evacuation-readiness/evacuation-route-domain/supply-drop-zone-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const dropConfidence = c01((1 - n(sample.slope, 12) / 38) * 0.44 + visible(sample, input.time) * 0.42 + (1 - storm(sample, input.time)) * 0.14);
      return { id: `supply-drop-zone-${sample.tag ?? index}`, kind: "supply-drop-zone", center: { ...p, y: r(p.y + 30, 1) }, radiusMeters: r(130 + dropConfidence * 260, 1), dropConfidence: r(dropConfidence), crates: 1 + Math.round(dropConfidence * 5), status: dropConfidence > 0.68 ? "drop-now" : dropConfidence > 0.44 ? "mark-only" : "unsafe", rendererContract: contract("terrain-supply-drop-zone-kit") };
    }).sort((a, b) => b.dropConfidence - a.dropConfidence).slice(0, maxZones);
  }, snapshot(input) { const zones = this.describe(input); return { zones: zones.length, ready: zones.filter((zone) => zone.status === "drop-now").length }; } };
}

export function createTerrainSummitRadioRelayKit({ maxRelays = 4 } = {}) {
  return { id: "terrain-summit-radio-relay-kit", domain: "terrain-observatory-evacuation-readiness/airlift-handoff-domain/summit-radio-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const lineOfSight = c01(relay(sample, index, input.time) * 0.7 + (1 - c01(dist(p, cam) / 6800)) * 0.3);
      return { id: `summit-radio-relay-${sample.tag ?? index}`, kind: "summit-radio-relay", position: { ...p, y: r(p.y + 180, 1) }, lineOfSight: r(lineOfSight), repeaterCount: Math.max(1, Math.round(5 - lineOfSight * 3)), status: lineOfSight > 0.7 ? "clear-signal" : lineOfSight > 0.45 ? "relay-chain" : "signal-shadow", rendererContract: contract("terrain-summit-radio-relay-kit") };
    }).sort((a, b) => b.lineOfSight - a.lineOfSight).slice(0, maxRelays);
  }, snapshot(input) { const relays = this.describe(input); return { relays: relays.length, clear: relays.filter((relay) => relay.status === "clear-signal").length }; } };
}

export function createTerrainEvacHeliWindowKit({ windowCount = 3 } = {}) {
  return { id: "terrain-evac-heli-window-kit", domain: "terrain-observatory-evacuation-readiness/airlift-handoff-domain/evac-heli-window-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    const focus = input.terrainSample ?? arr(input.samples)[0] ?? {};
    const p = pos(focus, { x: cam.x, y: cam.y - 160, z: cam.z });
    return Array.from({ length: windowCount }, (_, index) => {
      const flightConfidence = c01(0.5 + Math.sin(n(input.time) * 0.77 + index * 1.21) * 0.28 + visible(focus, input.time) * 0.24 - storm(focus, input.time) * 0.28 - index * 0.05);
      return { id: `evac-heli-window-${index}`, kind: "evac-heli-window", position: { x: r(p.x + Math.cos(index * 2.09) * (220 + index * 160)), y: r(p.y + 360 + index * 120, 1), z: r(p.z + Math.sin(index * 2.09) * (220 + index * 160)) }, flightConfidence: r(flightConfidence), minutesUntilWindow: Math.max(0, Math.round((1 - flightConfidence) * 18 + index * 6)), window: flightConfidence > 0.68 ? "open" : flightConfidence > 0.42 ? "standby" : "grounded", rendererContract: contract("terrain-evac-heli-window-kit") };
    });
  }, snapshot(input) { const helis = this.describe(input); return { windows: helis.length, open: helis.filter((heli) => heli.window === "open").length }; } };
}

export function createTerrainObservatoryEvacuationRendererHandoffKit() {
  return { id: "terrain-observatory-evacuation-renderer-handoff-kit", domain: "terrain-observatory-evacuation-readiness/renderer-handoff", describe(input = {}) {
    const descriptors = {
      observatoryDistressBeacons: createTerrainObservatoryDistressBeaconKit().describe(input),
      weatherTowerStabilities: createTerrainWeatherTowerStabilityKit().describe(input),
      ridgeSwitchbackRoutes: createTerrainRidgeSwitchbackRouteKit().describe(input),
      supplyDropZones: createTerrainSupplyDropZoneKit().describe(input),
      summitRadioRelays: createTerrainSummitRadioRelayKit().describe(input),
      evacHeliWindows: createTerrainEvacHeliWindowKit().describe(input)
    };
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "terrain-observatory-evacuation-renderer-handoff", kind: "renderer-handoff", descriptors, counts, rendererConsumesDescriptorsOnly: true, rendererContract: contract("terrain-observatory-evacuation-renderer-handoff-kit") };
  } };
}

export function createTerrainObservatoryEvacuationReadinessDomainKit() {
  const handoffKit = createTerrainObservatoryEvacuationRendererHandoffKit();
  return { id: "terrain-observatory-evacuation-readiness-domain-kit", domainTree: TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE, describe(input = {}) {
    const rendererHandoff = handoffKit.describe(input);
    const d = rendererHandoff.descriptors;
    const urgentBeacons = d.observatoryDistressBeacons.filter((beacon) => beacon.status === "priority-evac").length;
    const openRoutes = d.ridgeSwitchbackRoutes.filter((route) => route.status === "walk-out").length;
    const openHeli = d.evacHeliWindows.filter((heli) => heli.window === "open").length;
    const stableTowers = d.weatherTowerStabilities.filter((tower) => tower.status === "locked").length;
    const readyDrops = d.supplyDropZones.filter((zone) => zone.status === "drop-now").length;
    const readiness = c01(openRoutes * 0.14 + openHeli * 0.18 + stableTowers * 0.09 + readyDrops * 0.1 + 0.28 - urgentBeacons * 0.08);
    return { id: "terrain-observatory-evacuation-readiness", kind: "domain-readiness", domainTree: TERRAIN_OBSERVATORY_EVACUATION_READINESS_DOMAIN_TREE, rendererHandoff, summary: { readiness: r(readiness), urgentBeacons, openRoutes, openHeli, stableTowers, readyDrops, descriptorCount: rendererHandoff.counts.total, status: readiness > 0.68 ? "evac-ready" : readiness > 0.42 ? "partial-evac" : "hold-and-stabilize" } };
  }, snapshot(input) { const described = this.describe(input); return { ...described.summary, handoffBuckets: Object.keys(described.rendererHandoff.descriptors) }; } };
}
