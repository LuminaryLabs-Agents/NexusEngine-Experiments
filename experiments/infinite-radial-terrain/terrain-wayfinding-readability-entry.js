import { createTerrainWayfindingReadabilityDomainKit } from "../_kits/infinite-radial-terrain/terrain-wayfinding-readability-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; wayfinding descriptors remain local", error);
}

const wayfindingDomain = createTerrainWayfindingReadabilityDomainKit();
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

function makeSample(tag, x, z, base, index) {
  const wobble = Math.sin(x * 0.0017 + z * 0.0011 + index) * 0.5 + 0.5;
  const distance = Math.hypot(x - n(base.x), z - n(base.z));
  const height = n(base.height, base.y) + Math.sin((x + z) * 0.0013 + index * 0.61) * 160 + index * 28;
  const wetnessIndex = clamp(0.12 + wobble * 0.46 + (tag.includes("valley") ? 0.24 : 0));
  const channelPotential = clamp(0.16 + Math.cos(x * 0.0011 - z * 0.0016) * 0.2 + distance / 7200);
  const vegetation = clamp(0.2 + wetnessIndex * 0.46 + Math.sin(index * 0.7) * 0.12);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(6 + wobble * 28 + index * 1.3, 2),
    climate: { rainfallMmYear: round(540 + wetnessIndex * 720), temperatureC: round(18 - height / 360), snowlineMeters: 1650, vegetationPotential: vegetation },
    hydrology: { flow: { wetnessIndex, channelPotential, flowDirection: { x: round(Math.sin(index), 3), z: round(Math.cos(index), 3) } }, stream: { streamOrder: Math.floor(channelPotential * 5), drainageDensityKmPerKm2: round(0.8 + channelPotential * 4.2, 2) } },
    landform: { landform: tag.includes("ridge") ? "ridge" : tag.includes("valley") ? "valley" : tag.includes("return") ? "bench" : "saddle", confidence: round(0.42 + wobble * 0.5), terrainRuggedness: round(clamp(wobble * 0.7 + index * 0.03)) },
    material: { materialWeights: { bedrock: clamp(0.24 + wobble * 0.5), soil: clamp(0.72 - wobble * 0.26), silt: wetnessIndex, wetChannel: wetnessIndex, snow: height > 1700 ? 0.48 : 0.02 }, vegetationMask: vegetation, albedoHint: "estimated" }
  };
}

function buildWayfindingInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 140, z: camera.position.z, height: camera.position.y - 140 };
  const focusSample = {
    ...focus,
    tag: "focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 140),
    slope: n(focus.slope, 10),
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.18, channelPotential: 0.22 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.2 } },
    landform: focus.landform ?? { landform: "bench", confidence: 0.58, terrainRuggedness: 0.28 },
    material: focus.material ?? { materialWeights: { soil: 0.62, bedrock: 0.32, wetChannel: 0.18 }, vegetationMask: 0.38 }
  };
  const forward = { x: -Math.sin(camera.yaw), z: -Math.cos(camera.yaw) };
  const right = { x: Math.cos(camera.yaw), z: -Math.sin(camera.yaw) };
  const origins = [
    ["ahead", forward.x * 720, forward.z * 720],
    ["far-ahead", forward.x * 1500, forward.z * 1500],
    ["left-ridge", forward.x * 500 - right.x * 820, forward.z * 500 - right.z * 820],
    ["right-ridge", forward.x * 500 + right.x * 820, forward.z * 500 + right.z * 820],
    ["north", 0, -1320],
    ["east", 1320, 0],
    ["return-bench", -forward.x * 540, -forward.z * 540],
    ["valley-thread", forward.x * 1040 - right.x * 360, forward.z * 1040 - right.z * 360]
  ];
  const samples = [focusSample, ...origins.map(([tag, dx, dz], index) => makeSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    expedition: state.expeditionDescriptors
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-wayfinding-readability";
  root.setAttribute("aria-label", "Terrain wayfinding readability overlay");
  root.innerHTML = `
    <style>
      #terrain-wayfinding-readability{position:fixed;right:16px;bottom:16px;z-index:3;width:min(360px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(4,10,16,.76);color:#ecfbff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.42),inset 0 0 0 1px rgba(180,235,255,.22);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-wayfinding-readability .title{font-weight:900;color:#fff1a8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
      #terrain-wayfinding-readability .radar{position:relative;height:150px;border-radius:50%;margin:0 auto 10px;width:150px;background:radial-gradient(circle,rgba(160,235,255,.14) 0 22%,rgba(160,235,255,.06) 22% 43%,rgba(255,255,255,.04) 43% 66%,rgba(0,0,0,.08) 66% 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
      #terrain-wayfinding-readability .needle{position:absolute;left:74px;top:74px;width:2px;height:58px;transform-origin:1px 0;background:linear-gradient(to bottom,rgba(255,241,168,.94),rgba(125,242,255,.08));border-radius:2px}
      #terrain-wayfinding-readability .dot{position:absolute;width:9px;height:9px;border-radius:50%;background:rgba(185,255,207,.88);box-shadow:0 0 18px rgba(185,255,207,.45)}
      #terrain-wayfinding-readability .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-wayfinding-readability .muted{color:rgba(236,251,255,.68)}
    </style>
    <div class="title">Wayfinding Domain</div>
    <div class="radar" data-radar></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const radar = root.querySelector("[data-radar]");
  const rows = root.querySelector("[data-rows]");
  radar.querySelectorAll(".needle,.dot").forEach((node) => node.remove());
  for (const needle of handoff.bearingNeedles ?? []) {
    const node = document.createElement("i");
    node.className = "needle";
    node.style.transform = `rotate(${n(needle.headingRadians)}rad)`;
    node.style.opacity = String(clamp(needle.confidence, 0.2, 1));
    radar.append(node);
  }
  for (const [index, landmark] of (handoff.horizonLandmarks ?? []).slice(0, 5).entries()) {
    const node = document.createElement("i");
    node.className = "dot";
    const angle = index / 5 * Math.PI * 2 + n(landmark.prominence) * 0.6;
    const radius = 34 + n(landmark.prominence) * 32;
    node.style.left = `${70 + Math.cos(angle) * radius}px`;
    node.style.top = `${70 + Math.sin(angle) * radius}px`;
    node.style.opacity = String(clamp(landmark.prominence, 0.25, 1));
    radar.append(node);
  }
  const bestSlope = handoff.slopeChoiceRibbons?.[0];
  const nextBiome = handoff.biomeTransitionGates?.[0];
  const returnAnchor = handoff.originReturnAnchors?.[0];
  const drift = handoff.staminaDriftMeters?.[0];
  rows.innerHTML = [
    ["Route", bestSlope?.label ?? "survey-slope", bestSlope ? `${Math.round(bestSlope.score * 100)}%` : "--"],
    ["Biome", nextBiome ? `${nextBiome.fromBiome} → ${nextBiome.toBiome}` : "stable", nextBiome ? `${Math.round(nextBiome.transitionValue * 100)}%` : "--"],
    ["Return", returnAnchor?.label ?? "origin", returnAnchor ? `${Math.round(returnAnchor.distanceMeters)}m` : "--"],
    ["Drift", drift?.label ?? "stable-cruise", drift ? `${Math.round(drift.load * 100)}%` : "--"]
  ].map(([label, value, stat]) => `<div class="row"><span><span class="muted">${label}</span> ${value}</span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, wayfinding) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(wayfinding?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-composed-renderer-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    wayfindingHandoff: clone(wayfinding?.rendererHandoff),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainWayfindingPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = wayfindingDomain.describe(buildWayfindingInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.wayfindingDomain = wayfindingDomain;
  host.getWayfindingReadability = () => clone(current);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  const patchedGetState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      wayfindingDescriptors: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainWayfinding: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.getState = patchedGetState;
  host.__terrainWayfindingPatched = true;
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
