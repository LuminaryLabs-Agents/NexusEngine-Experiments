import { createTerrainAquiferCartographyReadinessDomainKit } from "../_kits/infinite-radial-terrain/terrain-aquifer-cartography-readiness-kits.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const round = (value, digits = 3) => Number(n(value).toFixed(digits));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; aquifer cartography descriptors remain local", error);
}

const aquiferCartographyDomain = createTerrainAquiferCartographyReadinessDomainKit();
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

function makeAquiferSample(tag, x, z, focus = {}, index = 0) {
  const baseHeight = n(focus.height, focus.y ?? 840);
  const trough = Math.sin(x * 0.0011 + index * 0.31) * 120 - Math.cos(z * 0.0014 - index * 0.27) * 150;
  const spring = tag.includes("spring") || tag.includes("cistern") || tag.includes("thread");
  const low = tag.includes("basin") || tag.includes("moraine") || tag.includes("well");
  const height = baseHeight + trough + (spring ? -80 : low ? -140 : 40);
  const wetnessIndex = clamp(0.2 + Math.abs(Math.sin(x * 0.0017 + z * 0.0012 + index)) * 0.48 + (spring ? 0.2 : 0));
  const slope = low ? 7 + index * 0.8 : spring ? 12 + index : 18 + index * 1.4;
  const soil = clamp(0.34 + wetnessIndex * 0.28 + (low ? 0.18 : 0));
  const vegetationPotential = clamp(0.24 + wetnessIndex * 0.36 + soil * 0.12);
  return {
    tag,
    x: round(x),
    z: round(z),
    height: round(height, 1),
    slope: round(slope, 2),
    climate: { rainfallMmYear: round(340 + wetnessIndex * 620), temperatureC: round(11 - height / 520), snowlineMeters: 980, vegetationPotential },
    hydrology: { flow: { wetnessIndex, channelPotential: clamp(wetnessIndex * 0.76 + (spring ? 0.16 : 0)), flowDirection: { x: round(Math.sin(index * 0.49), 3), z: round(Math.cos(index * 0.49), 3) } }, stream: { streamOrder: Math.floor(wetnessIndex * 5), drainageDensityKmPerKm2: round(0.7 + wetnessIndex * 3.2, 2) } },
    landform: { landform: low ? "basin" : spring ? "springline" : "foothill", confidence: round(0.54 + wetnessIndex * 0.3), terrainRuggedness: clamp(slope / 44) },
    material: { materialWeights: { bedrock: clamp(0.42 - soil * 0.12), soil, wetChannel: wetnessIndex, snow: clamp(Math.max(0, height - 1200) / 2600) }, vegetationMask: vegetationPotential, albedoHint: "aquifer-cartography" }
  };
}

function buildAquiferCartographyInput(state = {}) {
  const camera = normalizeCamera(state.camera);
  const focus = state.terrainSample ?? state.descriptors?.focus ?? { x: camera.position.x, y: camera.position.y - 240, z: camera.position.z, height: camera.position.y - 240 };
  const focusSample = {
    ...focus,
    tag: "aquifer-focus",
    x: n(focus.x, camera.position.x),
    z: n(focus.z, camera.position.z),
    height: n(focus.height, focus.y ?? camera.position.y - 240),
    slope: n(focus.slope, 14),
    climate: focus.climate ?? { rainfallMmYear: 620, temperatureC: 8, snowlineMeters: 980, vegetationPotential: 0.34 },
    hydrology: focus.hydrology ?? { flow: { wetnessIndex: 0.3, channelPotential: 0.2 }, stream: { streamOrder: 1, drainageDensityKmPerKm2: 1.2 } },
    landform: focus.landform ?? { landform: "foothill", confidence: 0.62, terrainRuggedness: 0.28 },
    material: focus.material ?? { materialWeights: { soil: 0.42, bedrock: 0.34, wetChannel: 0.22, snow: 0.04 }, vegetationMask: 0.32 }
  };
  const yaw = n(camera.yaw);
  const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const offsets = [
    ["spring-seep-north", forward.x * 620 - right.x * 280, forward.z * 620 - right.z * 280],
    ["moraine-well-east", forward.x * 980 + right.x * 460, forward.z * 980 + right.z * 460],
    ["thread-dye-a", forward.x * 1320 - right.x * 720, forward.z * 1320 - right.z * 720],
    ["cistern-basin-low", forward.x * 760 + right.x * 780, forward.z * 760 + right.z * 780],
    ["springline-west", forward.x * 1680 - right.x * 1080, forward.z * 1680 - right.z * 1080],
    ["moraine-basin-south", -forward.x * 680 + right.x * 320, -forward.z * 680 + right.z * 320],
    ["dye-marker-ridge", forward.x * 2120 + right.x * 120, forward.z * 2120 + right.z * 120]
  ];
  const samples = [focusSample, ...offsets.map(([tag, dx, dz], index) => makeAquiferSample(tag, camera.position.x + dx, camera.position.z + dz, focusSample, index + 1))];
  return {
    time: n(state.frame) / 60,
    camera,
    terrain: state.descriptors ?? { origin: { x: 0, z: 0 }, focus: { x: focusSample.x, y: focusSample.height, z: focusSample.z }, bands: [] },
    terrainSample: focusSample,
    samples,
    visual: state.visualDescriptors,
    expedition: state.expeditionDescriptors,
    skybridgeShelter: state.skybridgeShelterReadiness,
    observatoryEvacuation: state.observatoryEvacuationReadiness
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "terrain-aquifer-cartography-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Terrain aquifer cartography readiness overlay");
  root.innerHTML = `
    <style>
      #terrain-aquifer-cartography-readiness{position:fixed;left:16px;top:112px;z-index:3;width:min(350px,calc(100vw - 32px));padding:12px 14px;border-radius:18px;background:rgba(2,24,31,.82);color:#f2ffff;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 70px rgba(0,0,0,.38),inset 0 0 0 1px rgba(144,240,255,.22);pointer-events:none;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
      #terrain-aquifer-cartography-readiness .title{font-weight:900;color:#abf5ff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #terrain-aquifer-cartography-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
      #terrain-aquifer-cartography-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(56,220,255,.96),rgba(142,255,201,.96),rgba(255,244,171,.96));width:0%}
      #terrain-aquifer-cartography-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #terrain-aquifer-cartography-readiness .muted{color:rgba(242,255,255,.62)}
      #terrain-aquifer-cartography-readiness .danger{color:#ffcfaa}
    </style>
    <div class="title">Aquifer Cartography</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const seep = domain?.springSeeps?.[0];
  const well = domain?.moraineWells?.[0];
  const thread = domain?.aquiferThreads?.[0];
  const basin = domain?.cisternBasins?.[0];
  const marker = domain?.dyeMarkers?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.08);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Seep", seep?.status ?? "searching", seep ? `${Math.round(seep.seepConfidence * 100)}%` : "--", seep?.status === "dry-watch"],
    ["Well", well?.status ?? "unknown", well ? `${well.depthMeters}m` : "--", well?.status === "skip"],
    ["Thread", thread?.status ?? "unknown", thread ? `${Math.round(thread.flowCertainty * 100)}%` : "--", thread?.status === "lost-thread"],
    ["Cistern", basin?.status ?? "unknown", basin ? `${basin.cisternDays}d` : "--", basin?.status === "washout-risk"],
    ["Dye", marker?.status ?? "watch", marker ? `${marker.pulsesPerMinute}/m` : "--", marker?.status === "hidden"]
  ].map(([label, value, stat, danger]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${danger ? "danger" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, aquifer) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(aquifer?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "infinite-radial-terrain-aquifer-cartography-composed-handoff",
    descriptors,
    counts,
    baseHandoff: clone(base),
    aquiferCartographyHandoff: clone(aquifer?.rendererHandoff),
    aquiferCartographyReadiness: clone(aquifer),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__terrainAquiferCartographyPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = aquiferCartographyDomain.describe(buildAquiferCartographyInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.aquiferCartographyDomain = aquiferCartographyDomain;
  host.getAquiferCartographyReadiness = () => clone(current);
  host.getInfiniteRadialTerrainAquiferCartographyReadiness = () => clone(current);
  host.getAquiferCartographyReadinessTree = () => clone(aquiferCartographyDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      aquiferCartographyReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        infiniteRadialTerrainAquiferCartography: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__terrainAquiferCartographyPatched = true;
  document.body.dataset.terrainAquiferCartographyReadiness = "enabled";
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
