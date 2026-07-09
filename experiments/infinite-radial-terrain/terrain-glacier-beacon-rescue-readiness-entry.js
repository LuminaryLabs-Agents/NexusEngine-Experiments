import { createTerrainGlacierBeaconRescueReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-glacier-beacon-rescue-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; glacier beacon rescue descriptors remain local", error);
}

const glacierBeaconDomain = createTerrainGlacierBeaconRescueReadinessDomainKit();
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

function makeGlacierSample(tag, x, z, focus = {}, index = 0) {
  const baseHeight = n(focus.height, focus.y ?? 1060);
  const ridge = Math.sin(x * 0.001 + index * 0.43) * 260 + Math.cos(z * 0.0012 - index * 0.29) * 210;
  const high = tag.includes("ridge") || tag.includes("cairn") || tag.includes("smoke");
  const bridge = tag.includes("bridge") || tag.includes("rope") || tag.includes("crevasse");
  const cache = tag.includes("sled") || tag.includes("cache");
  const height = baseHeight + ridge + (high ? 160 : bridge ? 80 : cache ? -60 : 40);
  const snow = clamp(0.18 + Math.max(0, height - 820) / 1900 * 0.54 + Math.abs(Math.sin(x * 0.0016 + z * 0.0009 + index)) * 0.18);
  const slope = high ? 20 + index * 1.6 : bridge ? 13 + index * 1.2 : 8 + index;
  const visibility = clamp(0.76 - snow * 0.24 + Math.abs(Math.cos(index + x * 0.0007)) * 0.18);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(slope, 2),
    climate: { rainfallMmYear: round(260 + snow * 260), temperatureC: round(8 - height / 360), snowlineMeters: 860, vegetationPotential: clamp(0.28 - snow * 0.14 + visibility * 0.08) },
    hydrology: { flow: { wetnessIndex: clamp(0.12 + snow * 0.24), channelPotential: clamp(bridge ? 0.42 : 0.18 + snow * 0.18) }, stream: { streamOrder: bridge ? 1 : 0, drainageDensityKmPerKm2: round(0.5 + snow * 1.4, 2) } },
    landform: { landform: high ? "moraine-ridge" : bridge ? "ice-bridge" : "sheltered-basin", confidence: round(0.56 + visibility * 0.28), terrainRuggedness: clamp(slope / 44) },
    material: { materialWeights: { bedrock: clamp(0.44 - snow * 0.12), soil: clamp(0.2 + visibility * 0.12), wetChannel: clamp(0.08 + snow * 0.16), snow }, vegetationMask: clamp(0.18 + visibility * 0.14 - snow * 0.08), albedoHint: "glacier-beacon-rescue" }
  };
}

function buildGlacierBeaconInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 210, z: camera.position.z, height: camera.position.y - 210 };
  const focusSample = {
    ...focus,
    tag: "glacier-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 210),
    slope: n(focus.slope, 16),
    climate: focus.climate ?? { rainfallMmYear: 320, temperatureC: 4, snowlineMeters: 860, vegetationPotential: 0.24 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.18, channelPotential: 0.14 }, stream: { streamOrder: 0, drainageDensityKmPerKm2: 0.8 } },
    landform: focus.landform ?? { landform: "moraine-ridge", confidence: 0.6, terrainRuggedness: 0.34 },
    material: focus.material ?? { materialWeights: { soil: 0.26, bedrock: 0.42, wetChannel: 0.1, snow: 0.34 }, vegetationMask: 0.18 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["moraine-cairn-ridge", forward.x * 580 - right.x * 240, forward.z * 580 - right.z * 240],
    ["whiteout-smoke-shelf", forward.x * 940 + right.x * 360, forward.z * 940 + right.z * 360],
    ["ice-bridge-flag-a", forward.x * 1260 - right.x * 640, forward.z * 1260 - right.z * 640],
    ["crevasse-rope-rake", forward.x * 1520 + right.x * 560, forward.z * 1520 + right.z * 560],
    ["sled-cache-basin", -forward.x * 520 + right.x * 420, -forward.z * 520 + right.z * 420],
    ["moraine-cairn-west", forward.x * 1860 - right.x * 1040, forward.z * 1860 - right.z * 1040],
    ["ice-bridge-second", forward.x * 2200 + right.x * 120, forward.z * 2200 + right.z * 120]
  ];
  const samples = [focusSample, ...offsets.map(([tag, dx, dz], index) => makeGlacierSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    aquiferCartography: state.aquiferCartographyReadiness,
    skybridgeShelter: state.skybridgeShelterReadiness,
    avalancheRescue: state.avalancheRescueReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-glacier-beacon-rescue-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain glacier beacon rescue readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-glacier-beacon-rescue-readiness{position:fixed;right:16px;top:112px;z-index:3;width:min(360px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(12,20,32,.84);color:#f3fbff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(185,223,255,.24);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-glacier-beacon-rescue-readiness .title{font-weight:900;color:#d8f2ff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-glacier-beacon-rescue-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.11);overflow:hidden;margin:6px 0 10px}
      #terrain-glacier-beacon-rescue-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(155,212,255,.96),rgba(229,247,255,.96),rgba(255,236,168,.96));width:0%}
      #terrain-glacier-beacon-rescue-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-glacier-beacon-rescue-readiness .muted{color:rgba(243,251,255,.62)}
      #terrain-glacier-beacon-rescue-readiness .danger{color:#ffd2b8}
    </style>
    <div class="title">Glacier Beacon Rescue</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const cairn = domain?.moraineCairns?.[0];
  const smoke = domain?.signalSmokes?.[0];
  const flag = domain?.iceBridgeFlags?.[0];
  const rope = domain?.crevasseRopes?.[0];
  const cache = domain?.rescueSledCaches?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.06);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Cairn", cairn?.status ?? "searching", cairn ? `${Math.round(cairn.anchoring * 100)}%` : "--", cairn?.status === "lost-in-spindrift"],
    ["Smoke", smoke?.status ?? "unknown", smoke ? `${smoke.smokePulses} pulses` : "--", smoke?.status === "whiteout-swallowed"],
    ["Bridge", flag?.status ?? "unknown", flag ? `${flag.flagCount} flags` : "--", flag?.status === "unsafe-span"],
    ["Rope", rope?.status ?? "unknown", rope ? `${Math.round(rope.tension * 100)}%` : "--", rope?.status === "rope-gap"],
    ["Sled", cache?.status ?? "watch", cache ? `${cache.sledCapacity} seats` : "--", cache?.status === "bury-risk"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, glacier) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(glacier?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-glacier-beacon-rescue-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    glacierBeaconRescueHandoff: clone(glacier?.rendererHandoff),
    glacierBeaconRescueReadiness: clone(glacier),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainGlacierBeaconRescuePatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = glacierBeaconDomain.describe(buildGlacierBeaconInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.glacierBeaconRescueDomain = glacierBeaconDomain;
  host.getGlacierBeaconRescueReadiness = () => clone(current);
  host.getInfiniteRadialTerrainGlacierBeaconRescueReadiness = () => clone(current);
  host.getGlacierBeaconRescueReadinessTree = () => clone(glacierBeaconDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      glacierBeaconRescueReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainGlacierBeaconRescue: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainGlacierBeaconRescuePatched = true;
  document.body.dataset.terrainGlacierBeaconRescueReadiness = "enabled";
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
