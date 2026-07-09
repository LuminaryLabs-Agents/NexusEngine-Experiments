import { createTerrainMirageCaravanRescueReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-mirage-caravan-rescue-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; mirage caravan rescue descriptors remain local", error);
}

const caravanDomain = createTerrainMirageCaravanRescueReadinessDomainKit();
const runtimeDescriptor = {
  source: NEXUS_ENGINE_URL,
  ok: Boolean(NexusEngine),
  exports: NexusEngine ? Object.keys(NexusEngine).slice(0, 24) : []
};

function normalizeCamera(camera = {}) {
  const position = Array.isArray(camera.position)
    ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
    : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
  return { position, yaw: n(camera.yaw), pitch: n(camera.pitch, -0.28) };
}

function makeCaravanSample(tag, x, z, focus = {}, index = 0) {
  const baseHeight = n(focus.height, focus.y ?? 740);
  const dune = Math.sin(x * 0.0008 + index * 0.51) * 180 + Math.cos(z * 0.00096 - index * 0.37) * 150;
  const oasis = tag.includes("well") || tag.includes("oasis") || tag.includes("shade");
  const route = tag.includes("trail") || tag.includes("stake") || tag.includes("bell");
  const cache = tag.includes("cache") || tag.includes("water");
  const height = baseHeight + dune + (oasis ? -80 : route ? 25 : cache ? -30 : 60);
  const wet = clamp((oasis ? 0.52 : cache ? 0.34 : 0.16) + Math.abs(Math.sin(x * 0.0011 + z * 0.0005 + index)) * 0.16);
  const veg = clamp((oasis ? 0.5 : route ? 0.24 : 0.18) + wet * 0.22);
  const temp = 24 + Math.max(0, height - 450) / 1800 * 10 + (oasis ? -5 : 4);
  const slope = route ? 8 + index * 0.8 : oasis ? 5 + index * 0.6 : 13 + index;
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(slope, 2),
    climate: { rainfallMmYear: round(120 + wet * 180), temperatureC: round(temp), snowlineMeters: 3000, vegetationPotential: round(veg) },
    hydrology: { flow: { wetnessIndex: round(wet), channelPotential: round(wet * 0.66) }, stream: { streamOrder: oasis && wet > 0.58 ? 1 : 0, drainageDensityKmPerKm2: round(0.2 + wet * 1.1, 2) } },
    landform: { landform: oasis ? "alluvial-oasis" : route ? "dune-corridor" : "sun-basin", confidence: round(0.54 + wet * 0.32), terrainRuggedness: clamp(slope / 44) },
    material: { materialWeights: { bedrock: clamp(0.24 + slope / 90), soil: clamp(0.5 + wet * 0.2), wetChannel: clamp(wet * 0.34), snow: 0 }, vegetationMask: round(veg), albedoHint: "mirage-caravan-rescue" }
  };
}

function buildCaravanInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 220, z: camera.position.z, height: camera.position.y - 220 };
  const focusSample = {
    ...focus,
    tag: "caravan-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 220),
    slope: n(focus.slope, 11),
    climate: focus.climate ?? { rainfallMmYear: 180, temperatureC: 29, snowlineMeters: 3000, vegetationPotential: 0.26 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.24, channelPotential: 0.16 }, stream: { streamOrder: 0, drainageDensityKmPerKm2: 0.36 } },
    landform: focus.landform ?? { landform: "dune-corridor", confidence: 0.58, terrainRuggedness: 0.24 },
    material: focus.material ?? { materialWeights: { soil: 0.54, bedrock: 0.24, wetChannel: 0.08, snow: 0 }, vegetationMask: 0.26 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["mirage-well-a", forward.x * 540 - right.x * 260, forward.z * 540 - right.z * 260],
    ["shade-oasis-crescent", forward.x * 820 + right.x * 360, forward.z * 820 + right.z * 360],
    ["camel-bell-trail-west", forward.x * 1220 - right.x * 620, forward.z * 1220 - right.z * 620],
    ["dune-stake-windbreak", forward.x * 1480 + right.x * 520, forward.z * 1480 + right.z * 520],
    ["water-cache-basin", -forward.x * 540 + right.x * 430, -forward.z * 540 + right.z * 430],
    ["mirage-well-far", forward.x * 1840 - right.x * 1060, forward.z * 1840 - right.z * 1060],
    ["camel-bell-trail-east", forward.x * 2180 + right.x * 180, forward.z * 2180 + right.z * 180]
  ];
  const samples = [focusSample, ...offsets.map(([tag, dx, dz], index) => makeCaravanSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    glacierBeaconRescue: state.glacierBeaconRescueReadiness,
    aquiferCartography: state.aquiferCartographyReadiness,
    skybridgeShelter: state.skybridgeShelterReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-mirage-caravan-rescue-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain mirage caravan rescue readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-mirage-caravan-rescue-readiness{position:fixed;right:16px;top:302px;z-index:3;width:min(360px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(31,18,8,.84);color:#fff9ec;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.36),inset 0 0 0 1px rgba(255,218,146,.25);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-mirage-caravan-rescue-readiness .title{font-weight:900;color:#ffe0a3;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-mirage-caravan-rescue-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;margin:6px 0 10px}
      #terrain-mirage-caravan-rescue-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(255,151,84,.96),rgba(255,220,136,.96),rgba(190,255,193,.96));width:0%}
      #terrain-mirage-caravan-rescue-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.09)}
      #terrain-mirage-caravan-rescue-readiness .muted{color:rgba(255,249,236,.64)}
      #terrain-mirage-caravan-rescue-readiness .danger{color:#ffb38d}
    </style>
    <div class="title">Mirage Caravan Rescue</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const well = domain?.mirageWells?.[0];
  const sail = domain?.shadeSails?.[0];
  const trail = domain?.camelBellTrails?.[0];
  const stake = domain?.duneStakeWindbreaks?.[0];
  const cache = domain?.waterSkinCaches?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.05);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Well", well?.status ?? "searching", well ? `${Math.round(well.signalStrength * 100)}%` : "--", well?.status === "dry-horizon"],
    ["Shade", sail?.status ?? "unknown", sail ? `${sail.sailPanels} sails` : "--", sail?.status === "sun-exposed"],
    ["Trail", trail?.status ?? "unknown", trail ? `${trail.wayBeads} beads` : "--", trail?.status === "lost-caravan"],
    ["Stakes", stake?.status ?? "unknown", stake ? `${stake.stakeCount} posts` : "--", stake?.status === "buried-stakes"],
    ["Water", cache?.status ?? "watch", cache ? `${cache.waterSkins} skins` : "--", cache?.status === "dehydration-risk"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, caravan) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(caravan?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-mirage-caravan-rescue-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    mirageCaravanRescueHandoff: clone(caravan?.rendererHandoff),
    mirageCaravanRescueReadiness: clone(caravan),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainMirageCaravanRescuePatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = caravanDomain.describe(buildCaravanInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.mirageCaravanRescueDomain = caravanDomain;
  host.getMirageCaravanRescueReadiness = () => clone(current);
  host.getInfiniteRadialTerrainMirageCaravanRescueReadiness = () => clone(current);
  host.getMirageCaravanRescueReadinessTree = () => clone(caravanDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      mirageCaravanRescueReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainMirageCaravanRescue: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainMirageCaravanRescuePatched = true;
  document.body.dataset.terrainMirageCaravanRescueReadiness = "enabled";
  update();
}

function waitForHost() {
  const overlay = makeOverlay();
  const tick = () => {
    if (globalThis.GameHost?.getState) {
      patchHost(globalThis.GameHost, overlay);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

waitForHost();
