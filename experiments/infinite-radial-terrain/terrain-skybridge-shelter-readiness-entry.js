import { createTerrainSkybridgeShelterReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-skybridge-shelter-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; skybridge shelter descriptors remain local", error);
}

const skybridgeShelterDomain = createTerrainSkybridgeShelterReadinessDomainKit();
const runtimeDescriptor = {
  source: NEXUS_ENGINE_URL,
  ok: Boolean(NexusEngine),
  exports: NexusEngine ? Object.keys(NexusEngine).slice(0, 24) : []
};

function normalizeCamera(camera = {}) {
  const position = Array.isArray(camera.position)
    ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
    : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
  return { position, yaw: n(camera.yaw), pitch: n(camera.pitch, -0.32) };
}

function makeShelterSample(tag, x, z, focus = {}, index = 0) {
  const baseHeight = n(focus.height, focus.y ?? 1060);
  const lift = Math.sin(x * 0.0012 + index * 0.29) * 190 + Math.cos(z * 0.0015 - index * 0.43) * 210;
  const high = tag.includes("anchor") || tag.includes("mirror") || tag.includes("span");
  const cold = tag.includes("crevasse") || tag.includes("wind") || tag.includes("north");
  const height = baseHeight + lift + (high ? 520 : cold ? 260 : 120);
  const wet = clamp(0.14 + Math.abs(Math.sin(x * 0.0014 + z * 0.001 + index)) * 0.28);
  const snow = clamp(0.2 + Math.max(0, height - 900) / 2400 + (cold ? 0.16 : 0));
  const ruggedness = clamp(tag.includes("anchor") ? 0.78 : tag.includes("tent") ? 0.28 : 0.42 + index * 0.032);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(tag.includes("tent") ? 8 + index : tag.includes("crevasse") ? 26 + index * 1.5 : 18 + ruggedness * 22, 2),
    climate: { rainfallMmYear: round(360 + wet * 480), temperatureC: round(6 - height / 360), snowlineMeters: 940, vegetationPotential: clamp(0.38 - snow * 0.2 + wet * 0.12) },
    hydrology: { flow: { wetnessIndex: wet, channelPotential: clamp(wet * 0.72), flowDirection: { x: round(Math.sin(index * 0.52), 3), z: round(Math.cos(index * 0.52), 3) } }, stream: { streamOrder: Math.floor(wet * 4), drainageDensityKmPerKm2: round(0.6 + wet * 2.5, 2) } },
    landform: { landform: tag.includes("tent") ? "bench" : tag.includes("crevasse") ? "glacier" : "ridge", confidence: round(0.5 + ruggedness * 0.34), terrainRuggedness: ruggedness },
    material: { materialWeights: { bedrock: clamp(0.22 + ruggedness * 0.52), soil: clamp(0.56 - ruggedness * 0.2), wetChannel: wet, snow }, vegetationMask: clamp(0.2 + wet * 0.18 - snow * 0.08), albedoHint: "skybridge-shelter" }
  };
}

function buildSkybridgeShelterInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 210, z: camera.position.z, height: camera.position.y - 210 };
  const focusSample = {
    ...focus,
    tag: "skybridge-shelter-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 210),
    slope: n(focus.slope, 18),
    climate: focus.climate ?? { temperatureC: 0, snowlineMeters: 940, vegetationPotential: 0.2 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.2, channelPotential: 0.12 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.0 } },
    landform: focus.landform ?? { landform: "ridge", confidence: 0.62, terrainRuggedness: 0.52 },
    material: focus.material ?? { materialWeights: { soil: 0.32, bedrock: 0.44, wetChannel: 0.12, snow: 0.42 }, vegetationMask: 0.18 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["north-anchor", forward.x * 820 - right.x * 300, forward.z * 820 - right.z * 300],
    ["south-anchor", forward.x * 1320 + right.x * 420, forward.z * 1320 + right.z * 420],
    ["wind-span", forward.x * 1740 - right.x * 640, forward.z * 1740 - right.z * 640],
    ["heat-tent-bench", forward.x * 980 + right.x * 760, forward.z * 980 + right.z * 760],
    ["crevasse-lip", forward.x * 2180 - right.x * 920, forward.z * 2180 - right.z * 920],
    ["beacon-mirror", forward.x * 2560 + right.x * 180, forward.z * 2560 + right.z * 180],
    ["low-shelter-cache", -forward.x * 740 + right.x * 280, -forward.z * 740 + right.z * 280]
  ];
  const samples = [focusSample, ...offsets.map(([tag, dx, dz], index) => makeShelterSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    expedition: state.expeditionDescriptors,
    observatoryEvacuation: state.observatoryEvacuationReadiness,
    avalancheRescue: state.avalancheRescueReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-skybridge-shelter-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain skybridge shelter readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-skybridge-shelter-readiness{position:fixed;right:16px;top:532px;z-index:3;width:min(340px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(4,15,28,.8);color:#f6fbff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(188,238,255,.22);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-skybridge-shelter-readiness .title{font-weight:900;color:#d8fbff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-skybridge-shelter-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
      #terrain-skybridge-shelter-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(113,222,255,.96),rgba(255,245,178,.96),rgba(170,255,209,.96));width:0%}
      #terrain-skybridge-shelter-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-skybridge-shelter-readiness .muted{color:rgba(246,251,255,.62)}
      #terrain-skybridge-shelter-readiness .danger{color:#ffb9ad}
    </style>
    <div class="title">Skybridge Shelter</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const anchor = domain?.ridgeAnchors?.[0];
  const span = domain?.spanCables?.[0];
  const tent = domain?.heatTents?.[0];
  const warning = domain?.crevasseWarnings?.[0];
  const mirror = domain?.beaconMirrors?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.08);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Anchor", anchor?.status ?? "searching", anchor ? `${Math.round(anchor.anchorConfidence * 100)}%` : "--", anchor?.status === "unsafe-ridge"],
    ["Span", span?.status ?? "unknown", span ? `${Math.round((1 - span.sag) * 100)}%` : "--", span?.status === "do-not-cross"],
    ["Tent", tent?.status ?? "unknown", tent ? `${Math.round(tent.fuelConfidence * 100)}%` : "--", tent?.status === "hypothermia-risk"],
    ["Crevasse", warning?.status ?? "watch", warning ? `${Math.round(warning.risk * 100)}%` : "--", warning?.status === "closed"],
    ["Mirror", mirror?.status ?? "watch", mirror ? `${Math.round(mirror.mirrorSignal * 100)}%` : "--", mirror?.status === "lost-in-glare"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, skybridge) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(skybridge?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-skybridge-shelter-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    skybridgeShelterHandoff: clone(skybridge?.rendererHandoff),
    skybridgeShelterReadiness: clone(skybridge),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainSkybridgeShelterPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = skybridgeShelterDomain.describe(buildSkybridgeShelterInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.skybridgeShelterDomain = skybridgeShelterDomain;
  host.getSkybridgeShelterReadiness = () => clone(current);
  host.getInfiniteRadialTerrainSkybridgeShelterReadiness = () => clone(current);
  host.getSkybridgeShelterReadinessTree = () => clone(skybridgeShelterDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      skybridgeShelterReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainSkybridgeShelter: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainSkybridgeShelterPatched = true;
  document.body.dataset.terrainSkybridgeShelterReadiness = "enabled";
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
