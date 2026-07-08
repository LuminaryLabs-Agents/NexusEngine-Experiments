const params = new URLSearchParams(location.search);
const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#error");
const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

function fail(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>Infinite Radial Terrain</strong><br>Runtime error. See panel.";
}

async function boot() {
  const corePath = "./" + "terrain-world-stack" + "." + "js";
  const domainPath = "./" + "hifi-radial-domain" + "." + "js";
  const visualPath = "../_kits/infinite-radial-terrain/infinite-radial-terrain-kits.js";
  const expeditionPath = "../_kits/infinite-radial-terrain/terrain-expedition-readability-kits.js";
  const core = await import(corePath);
  const domain = await import(domainPath);
  const visualDomain = await import(visualPath);
  const expeditionDomain = await import(expeditionPath);
  let NexusEngine = null;
  try {
    NexusEngine = await import(params.get("nexusEngine") || NEXUS_ENGINE_URL);
  } catch (error) {
    console.warn("NexusEngine CDN unavailable; continuing with terrain host descriptors", error);
  }
  const runtimeDescriptor = {
    source: NEXUS_ENGINE_URL,
    ok: Boolean(NexusEngine),
    exports: NexusEngine ? Object.keys(NexusEngine).slice(0, 24) : []
  };
  const THREE = await import(params.get("three") || core.THREE_URL);
  const erosionSolver = await core.loadErosionSolver(params);
  const radialTerrain = domain.createRadialTerrainDomain({ originSnap: 250 });
  const radialVisualDomain = visualDomain.createInfiniteRadialTerrainVisualDomainKit();
  const terrainExpeditionDomain = expeditionDomain.createTerrainExpeditionReadabilityDomainKit();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#b7e9ff");
  scene.fog = new THREE.FogExp2("#b7e9ff", 0.00009);
  const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 18000);
  camera.position.set(0, core.rawHeight(0, 0) + 620, 0);
  camera.rotation.order = "YXZ";

  scene.add(new THREE.HemisphereLight(0xd8f5ff, 0x26391f, 1.05));
  const sun = new THREE.DirectionalLight(0xffefba, 4.2);
  sun.position.set(-760, 980, 520);
  scene.add(sun);

  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0.01, flatShading: false, side: THREE.FrontSide });
  const visualGroup = new THREE.Group();
  visualGroup.name = "radial-terrain-descriptor-handoff";
  scene.add(visualGroup);
  const materialCache = new Map();
  const bandMeshes = new Map();
  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.32, speed: 320 };
  let descriptors = radialTerrain.getDescriptors();
  let visualDescriptors = null;
  let expeditionDescriptors = null;
  let lastVersion = -1;
  let lastVisualVersion = "";
  let lastSample = null;
  let frame = 0;

  function getLineMaterial(color, opacity = 0.6) {
    const key = `line:${color}:${opacity}`;
    if (!materialCache.has(key)) materialCache.set(key, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    return materialCache.get(key);
  }

  function getMeshMaterial(color, opacity = 0.32) {
    const key = `mesh:${color}:${opacity}`;
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
    return materialCache.get(key);
  }

  function clearVisualGroup() {
    for (const child of [...visualGroup.children]) {
      visualGroup.remove(child);
      child.geometry?.dispose?.();
    }
  }

  function ringPoints(center, radius, segments = 96) {
    return Array.from({ length: segments }, (_, index) => {
      const angle = index / segments * Math.PI * 2;
      return new THREE.Vector3(center.x + Math.cos(angle) * radius, center.y, center.z + Math.sin(angle) * radius);
    });
  }

  function collectVisualSamples() {
    const forward = { x: -Math.sin(rig.yaw), z: -Math.cos(rig.yaw) };
    const right = { x: Math.cos(rig.yaw), z: -Math.sin(rig.yaw) };
    const offsets = [
      { tag: "focus", x: 0, z: 0 },
      { tag: "ahead", x: forward.x * 900, z: forward.z * 900 },
      { tag: "far-ahead", x: forward.x * 1800, z: forward.z * 1800 },
      { tag: "left-ridge", x: right.x * -760 + forward.x * 420, z: right.z * -760 + forward.z * 420 },
      { tag: "right-ridge", x: right.x * 760 + forward.x * 420, z: right.z * 760 + forward.z * 420 },
      { tag: "near-left", x: right.x * -260, z: right.z * -260 },
      { tag: "near-right", x: right.x * 260, z: right.z * 260 },
      { tag: "rear", x: -forward.x * 520, z: -forward.z * 520 },
      { tag: "north", x: 0, z: -1120 },
      { tag: "south", x: 0, z: 1120 },
      { tag: "east", x: 1120, z: 0 },
      { tag: "west", x: -1120, z: 0 }
    ];
    return offsets.map((offset) => ({
      ...core.sampleTerrain(camera.position.x + offset.x, camera.position.z + offset.z, descriptors.focus, erosionSolver),
      tag: offset.tag
    }));
  }

  function syncTerrain() {
    radialTerrain.setFocus(camera.position);
    descriptors = radialTerrain.getDescriptors();
    if (descriptors.version === lastVersion) return;
    lastVersion = descriptors.version;
    const live = new Set();
    for (const band of descriptors.bands) {
      live.add(band.id);
      const old = bandMeshes.get(band.id);
      if (old) {
        scene.remove(old);
        old.geometry.dispose();
      }
      const mesh = new THREE.Mesh(domain.createBandGeometry(THREE, descriptors, band, erosionSolver), terrainMat);
      mesh.receiveShadow = true;
      scene.add(mesh);
      bandMeshes.set(band.id, mesh);
    }
    for (const [id, mesh] of bandMeshes) {
      if (!live.has(id)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        bandMeshes.delete(id);
      }
    }
  }

  function addDescriptorLine(from, to, color, opacity = 0.6, name = "descriptor-line") {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(from.x, from.y, from.z),
      new THREE.Vector3(to.x, to.y, to.z)
    ]);
    const line = new THREE.Line(geometry, getLineMaterial(color, opacity));
    line.name = name;
    visualGroup.add(line);
  }

  function addDescriptorRing(center, radius, color, opacity = 0.4, name = "descriptor-ring") {
    const geometry = new THREE.BufferGeometry().setFromPoints(ringPoints(center, radius, 96));
    const line = new THREE.LineLoop(geometry, getLineMaterial(color, opacity));
    line.name = name;
    visualGroup.add(line);
  }

  function addDescriptorDisc(center, radius, color, opacity = 0.18, name = "descriptor-disc") {
    const geometry = new THREE.CircleGeometry(radius, 32);
    const mesh = new THREE.Mesh(geometry, getMeshMaterial(color, opacity));
    mesh.name = name;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(center.x, center.y, center.z);
    visualGroup.add(mesh);
  }

  function renderExpeditionDescriptors() {
    const handoff = expeditionDescriptors?.rendererHandoff?.descriptors ?? {};
    for (const transect of handoff.surveyTransects ?? []) {
      addDescriptorLine(transect.from, transect.to, "#fff1a8", 0.28 + transect.surveyValue * 0.42, transect.id);
    }
    for (const corridor of handoff.altitudeCorridors ?? []) {
      addDescriptorRing(corridor.center, corridor.radiusMeters, corridor.status === "inside" ? "#b9ffcf" : "#f7d488", 0.12 + corridor.confidence * 0.22, corridor.id);
    }
    for (const beacon of handoff.ridgePassBeacons ?? []) {
      const geometry = new THREE.SphereGeometry(26 + beacon.passScore * 28, 16, 10);
      const mesh = new THREE.Mesh(geometry, getMeshMaterial("#ffffff", 0.24 + beacon.passScore * 0.34));
      mesh.name = beacon.id;
      mesh.position.set(beacon.position.x, beacon.position.y, beacon.position.z);
      visualGroup.add(mesh);
    }
    for (const basin of handoff.hazardBasins ?? []) {
      addDescriptorDisc(basin.position, basin.radiusMeters, "#ff7a55", 0.1 + basin.risk * 0.22, basin.id);
      addDescriptorRing({ ...basin.position, y: basin.position.y + 8 }, basin.radiusMeters, "#ffb199", 0.18 + basin.avoidStrength * 0.28, `${basin.id}:edge`);
    }
    for (const bookmark of handoff.sampleBookmarks ?? []) {
      const geometry = new THREE.BoxGeometry(34, 34 + bookmark.priority * 32, 34);
      const mesh = new THREE.Mesh(geometry, getMeshMaterial("#7df2ff", 0.2 + bookmark.priority * 0.34));
      mesh.name = bookmark.id;
      mesh.position.set(bookmark.position.x, bookmark.position.y, bookmark.position.z);
      visualGroup.add(mesh);
    }
    for (const task of handoff.routeTaskBands ?? []) {
      addDescriptorRing(task.center, task.radiusMeters, "#c9a7ff", 0.16 + task.priority * 0.32, task.id);
    }
  }

  function syncVisualDescriptors() {
    const visualVersion = `${descriptors.version}:${Math.floor(frame / 24)}`;
    if (visualVersion === lastVisualVersion && visualDescriptors && expeditionDescriptors) return;
    lastVisualVersion = visualVersion;
    const samples = collectVisualSamples();
    const descriptorInput = {
      terrain: descriptors,
      camera: { position: { x: camera.position.x, y: camera.position.y, z: camera.position.z }, yaw: rig.yaw, pitch: rig.pitch },
      terrainSample: lastSample,
      samples,
      time: frame / 60
    };
    visualDescriptors = radialVisualDomain.describe(descriptorInput);
    expeditionDescriptors = terrainExpeditionDomain.describe({ ...descriptorInput, visual: visualDescriptors });
    clearVisualGroup();

    if (visualDescriptors.skyHaze?.backgroundColor) {
      scene.background = new THREE.Color(visualDescriptors.skyHaze.backgroundColor);
      scene.fog.color = new THREE.Color(visualDescriptors.skyHaze.backgroundColor);
      scene.fog.density = visualDescriptors.skyHaze.fogDensity ?? scene.fog.density;
    }

    for (const ring of visualDescriptors.lodRings ?? []) {
      const points = ringPoints(ring.center, ring.outerRadiusMeters, 128);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geometry, getLineMaterial("#fff1a8", ring.opacity));
      line.name = `lod:${ring.bandId}`;
      visualGroup.add(line);
    }

    for (const thread of visualDescriptors.hydrologyThreads ?? []) {
      addDescriptorLine(thread.from, thread.to, "#4dd9ff", Math.max(0.18, thread.pulse * 0.72), thread.id);
    }

    for (const patch of visualDescriptors.biomeMosaic ?? []) {
      const geometry = new THREE.CircleGeometry(patch.radiusMeters, 28);
      const mesh = new THREE.Mesh(geometry, getMeshMaterial(patch.colorHint, 0.16 + patch.density * 0.24));
      mesh.name = patch.id;
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(patch.position.x, patch.position.y, patch.position.z);
      visualGroup.add(mesh);
    }

    const provinceColors = { alpine: "#eef4ff", foothill: "#ffd47d", basin: "#a9d18e", unknown: "#ffffff" };
    for (const province of visualDescriptors.geologyProvinces ?? []) {
      const radius = 18 + Math.max(0, province.ridgeEnergy) * 18;
      const geometry = new THREE.SphereGeometry(radius, 16, 10);
      const mesh = new THREE.Mesh(geometry, getMeshMaterial(provinceColors[province.regionType] ?? "#ffffff", 0.24 + province.faultGlow * 0.38));
      mesh.name = province.id;
      mesh.position.set(province.centroid.x, province.centroid.y + 70, province.centroid.z);
      visualGroup.add(mesh);
    }

    renderExpeditionDescriptors();
  }

  function moveCamera(dt) {
    if (keys.has("ArrowLeft")) rig.yaw += dt * 1.35;
    if (keys.has("ArrowRight")) rig.yaw -= dt * 1.35;
    if (keys.has("ArrowUp")) rig.pitch = core.clamp(rig.pitch + dt * 0.75, -1.22, 0.22);
    if (keys.has("ArrowDown")) rig.pitch = core.clamp(rig.pitch - dt * 0.75, -1.22, 0.22);
    const forward = new THREE.Vector3(-Math.sin(rig.yaw), 0, -Math.cos(rig.yaw));
    const right = new THREE.Vector3(Math.cos(rig.yaw), 0, -Math.sin(rig.yaw));
    const up = new THREE.Vector3(0, 1, 0);
    const move = new THREE.Vector3();
    if (keys.has("KeyW")) move.add(forward);
    if (keys.has("KeyS")) move.sub(forward);
    if (keys.has("KeyD")) move.add(right);
    if (keys.has("KeyA")) move.sub(right);
    if (keys.has("Space")) move.add(up);
    if (keys.has("ShiftLeft") || keys.has("ShiftRight")) move.sub(up);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(rig.speed * dt * (keys.has("AltLeft") ? 2.25 : 1));
    camera.position.add(move);
    const floor = core.sampleTerrain(camera.position.x, camera.position.z, descriptors.focus, erosionSolver).height + 110;
    if (camera.position.y < floor) camera.position.y = core.mix(camera.position.y, floor, 0.18);
    camera.rotation.set(rig.pitch, rig.yaw, 0, "YXZ");
  }

  function render() {
    syncTerrain();
    lastSample = core.sampleTerrain(camera.position.x, camera.position.z, descriptors.focus, erosionSolver);
    syncVisualDescriptors();
    const h = Math.round(lastSample.height);
    const order = lastSample.hydrology?.stream?.streamOrder ?? 0;
    const dd = lastSample.hydrology?.stream?.drainageDensityKmPerKm2 ?? 0;
    const biome = visualDescriptors?.travelForecast?.aheadBiome ?? "unknown";
    const action = visualDescriptors?.travelForecast?.recommendedAction ?? "free-cruise";
    const descriptorCount = visualDescriptors?.rendererHandoff?.counts?.total ?? 0;
    const expeditionCount = expeditionDescriptors?.rendererHandoff?.counts?.total ?? 0;
    const corridor = expeditionDescriptors?.altitudeCorridors?.find((entry) => entry.status === "inside")?.clearanceMeters ?? expeditionDescriptors?.altitudeCorridors?.[0]?.clearanceMeters ?? 0;
    hud.innerHTML = `<strong>Infinite Radial Terrain</strong><br>Earth scale · NexusEngine CDN · descriptor-only expedition domain · WASD fly · Space/Shift vertical · arrows look<br>Height ${h}m · Stream ${order} · Drainage ${dd.toFixed(1)}km/km² · Biome ${biome} · Cue ${action} · Corridor ${Math.round(corridor)}m · Visual ${descriptorCount} · Expedition ${expeditionCount}`;
    renderer.render(scene, camera);
  }

  function loop(now) {
    const dt = Math.min(0.04, core.n((now - (loop.last ?? now)) / 1000, 1 / 60));
    loop.last = now;
    frame += 1;
    moveCamera(dt);
    render();
    requestAnimationFrame(loop);
  }

  addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "Backquote") console.log(globalThis.GameHost?.getState?.());
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  addEventListener("resize", () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  globalThis.GameHost = {
    radialTerrain,
    erosionSolver,
    runtime: runtimeDescriptor,
    visualDomain: radialVisualDomain,
    expeditionDomain: terrainExpeditionDomain,
    getExpeditionReadability: () => core.clone(expeditionDescriptors),
    getRendererHandoff: () => core.clone(expeditionDescriptors?.rendererHandoff ?? visualDescriptors?.rendererHandoff),
    getState: () => ({
      frame,
      runtime: runtimeDescriptor,
      camera: { position: camera.position.toArray(), yaw: rig.yaw, pitch: rig.pitch },
      descriptors,
      visualDescriptors: core.clone(visualDescriptors),
      expeditionDescriptors: core.clone(expeditionDescriptors),
      domain: {
        infiniteRadialTerrainVisual: core.clone(visualDescriptors),
        infiniteRadialTerrainExpedition: core.clone(expeditionDescriptors)
      },
      terrainSample: core.clone(lastSample)
    })
  };

  syncTerrain();
  render();
  requestAnimationFrame(loop);
}

boot().catch(fail);
