const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const err = document.querySelector("#error");
const cdn = "https://cdn.jsdelivr.net/";
const THREE = await import(cdn + "npm/three@0.160.0/build/three.module.js");
const proto = cdn + "gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/";
const landformDomain = await import(proto + "ocean-island-landform-domain/index.js?v=bezier-player-rail-1");
const foliageDomain = await import(proto + "island-foliage-domain/index.js?v=bezier-player-rail-1");
const oceanFloorDomain = await import(proto + "ocean-floor-domain/index.js?v=bezier-player-rail-1");
const grassTextureDomain = await import(proto + "grass-texture-domain/index.js?v=bezier-player-rail-1");
const grassObjectDomain = await import(proto + "grass-object-domain/index.js?v=bezier-player-rail-1");
const grassWindDomain = await import(proto + "grass-wind-domain/index.js?v=bezier-player-rail-1");
const campfireDomain = await import(proto + "campfire-object-domain/index.js?v=bezier-player-rail-1");
const smokeDomain = await import(proto + "smoke-particle-domain/index.js?v=bezier-player-rail-1");
const fencedClearingDomain = await import(proto + "fenced-clearing-domain/index.js?v=bezier-player-rail-1");
const cloudDomain = await import(proto + "mattatz-clouds-domain/index.js?v=bezier-player-rail-1");

const R = 100;
const SEA_FLOOR_Y = -128;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const safe = (v = {}, f = {}) => ({ x: Number.isFinite(v.x) ? v.x : (f.x ?? 0), y: Number.isFinite(v.y) ? v.y : (f.y ?? 0), z: Number.isFinite(v.z) ? v.z : (f.z ?? 0) });

function fail(error) {
  err.hidden = false;
  err.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>Cozy Island</strong><br>Runtime error. See panel.";
}

function indexed(samples, resolution, colorFor, material) {
  const positions = [];
  const colors = [];
  const indices = [];
  for (const sample of samples) {
    positions.push(sample.x, sample.y, sample.z);
    const color = colorFor(sample);
    colors.push(color.r, color.g, color.b);
  }
  for (let z = 0; z < resolution - 1; z += 1) for (let x = 0; x < resolution - 1; x += 1) {
    const a = z * resolution + x;
    indices.push(a, a + resolution, a + 1, a + 1, a + resolution, a + resolution + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function makeTerrain(heightfield) {
  return indexed(heightfield.samples, heightfield.resolution, (sample) => {
    const m = sample.masks || {};
    return new THREE.Color(m.wetSand ? 0xcaa46b : m.beach ? 0xe7ca91 : m.cliff || m.rock ? 0x817d6d : 0x4f8d4d);
  }, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }));
}
function makeOceanFloor(heightfield) {
  return indexed(heightfield.samples, heightfield.resolution, (sample) => new THREE.Color(sample.masks?.reefBand ? 0x3d8176 : sample.masks?.shallowShelf ? 0x4b8b7a : 0x235b67), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }));
}
function makeWater(config = {}) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600, 32, 32).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(config.color || "#22b9c9"), transparent: true, opacity: 0.75, roughness: 0.16, metalness: 0.12, reflectivity: 0.88, clearcoat: 0.72, clearcoatRoughness: 0.08, envMapIntensity: 1.8 }));
  mesh.position.y = -0.08;
  return mesh;
}
function makeFoam(shoreline) {
  const points = shoreline.map((point) => new THREE.Vector3(point.x, (point.y || 0) + 0.08, point.z));
  points.push(points[0].clone());
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), shoreline.length, 0.65, 5, true), new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: 0.36, depthWrite: false }));
}
function makePath(pathNetwork, sampleHeight) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0xb89564, roughness: 0.96, transparent: true, opacity: 0.86 });
  for (const segment of pathNetwork.segments) {
    const a = new THREE.Vector3(segment.from.x, sampleHeight(segment.from) + 0.12, segment.from.z);
    const b = new THREE.Vector3(segment.to.x, sampleHeight(segment.to) + 0.12, segment.to.z);
    const direction = new THREE.Vector3().subVectors(b, a);
    const side = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(segment.width * 0.5);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([a.x + side.x, a.y, a.z + side.z, a.x - side.x, a.y, a.z - side.z, b.x + side.x, b.y, b.z + side.z, b.x - side.x, b.y, b.z - side.z], 3));
    geometry.setIndex([0, 1, 2, 2, 1, 3]);
    geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry, material));
  }
  return group;
}
function insideZone(position, zones = [], margin = 0) {
  return zones.some((zone) => {
    const center = zone.center || zone.position || { x: 0, z: 0 };
    return Math.hypot(position.x - center.x, position.z - center.z) < (zone.radius || zone.radiusMeters || 0) + margin;
  });
}
function makeObjects(graph, exclusionZones) {
  const group = new THREE.Group();
  const types = new Set(["palm-tree", "broadleaf-tree", "young-tree", "bush", "fern", "fallen-log", "rock", "boulder", "driftwood", "reef", "coral"]);
  for (const object of graph.objects) {
    if (!types.has(object.type) || insideZone(object.transform.position, exclusionZones, 0.35)) continue;
    const color = object.type.includes("tree") || object.type === "bush" || object.type === "fern" ? 0x3f8f45 : object.type.includes("wood") || object.type === "fallen-log" ? 0x8a6844 : 0x77756a;
    const geometry = object.type.includes("tree") ? new THREE.CylinderGeometry(0.22, 0.35, object.state?.heightMeters || 6, 8) : object.type === "bush" ? new THREE.SphereGeometry(0.42, 8, 6) : new THREE.DodecahedronGeometry(0.35, 0);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
    mesh.position.set(object.transform.position.x, object.transform.position.y + (object.type.includes("tree") ? (object.state?.heightMeters || 6) * 0.5 : 0.2), object.transform.position.z);
    mesh.rotation.y = object.transform.rotation.y || 0;
    mesh.scale.setScalar(object.transform.scale.x || 1);
    group.add(mesh);
  }
  return group;
}
function makeSeaObjects(objects) {
  const group = new THREE.Group();
  for (const object of objects) {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(object.type === "sea-floor-boulder" ? 0.9 : 0.45, 0), new THREE.MeshStandardMaterial({ color: object.type === "reef-cluster" ? 0xd78367 : object.type === "coral-cluster" ? 0xf0a58c : 0x667b78, roughness: 0.88 }));
    mesh.position.set(object.position.x, object.position.y + 0.2, object.position.z);
    mesh.rotation.y = object.rotation || 0;
    mesh.scale.setScalar(object.scale || 1);
    group.add(mesh);
  }
  return group;
}
function makeFence(clearing) {
  const group = new THREE.Group();
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0x7c5738, roughness: 0.9 });
  const railMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6642, roughness: 0.9 });
  for (const object of clearing.objects) {
    if (object.type === "fence-post") {
      const height = object.state.heightMeters || 1.25;
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, height, 7), postMaterial);
      mesh.position.set(object.transform.position.x, object.transform.position.y + height * 0.5, object.transform.position.z);
      group.add(mesh);
    } else if (object.type === "fence-rail") {
      const length = object.transform.scale.x || 2;
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, length, 6), railMaterial);
      mesh.rotation.z = Math.PI / 2;
      mesh.rotation.y = object.transform.rotation.y || 0;
      mesh.position.set(object.transform.position.x, object.transform.position.y, object.transform.position.z);
      group.add(mesh);
    }
  }
  return group;
}
function makeCampfire(graph) {
  const root = graph.byId[graph.rootId];
  const group = new THREE.Group();
  group.position.set(root.transform.position.x, root.transform.position.y, root.transform.position.z);
  const logMaterial = new THREE.MeshStandardMaterial({ color: 0x70462a, roughness: 0.88 });
  for (let i = 0; i < 7; i += 1) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2, 8), logMaterial);
    log.position.y = 0.22 + (i % 2) * 0.1;
    log.rotation.z = Math.PI / 2;
    log.rotation.y = i / 7 * Math.PI * 2;
    group.add(log);
  }
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 6), new THREE.MeshStandardMaterial({ color: 0xff5c22, emissive: 0xff3d12, emissiveIntensity: 1.4 }));
  ember.scale.y = 0.18;
  ember.position.y = 0.16;
  group.add(ember);
  const flames = [];
  for (let i = 0; i < 5; i += 1) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.25 + i * 0.025, 1.1 - i * 0.08, 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffa533 : 0xffdf62, transparent: true, opacity: 0.72, depthWrite: false }));
    flame.position.set(Math.cos(i) * 0.18, 0.65, Math.sin(i * 1.7) * 0.18);
    group.add(flame);
    flames.push(flame);
  }
  const light = new THREE.PointLight(0xff9d43, 1.8, 22, 2);
  light.position.set(0, 1.2, 0);
  group.add(light);
  group.userData = { flames, light };
  return group;
}
function makeSmoke(descriptor) {
  const positions = new Float32Array(descriptor.particleCount * 3);
  const ages = new Float32Array(descriptor.particleCount);
  const seeds = new Float32Array(descriptor.particleCount);
  for (let i = 0; i < descriptor.particleCount; i += 1) { ages[i] = Math.random() * descriptor.lifespanSeconds; seeds[i] = Math.random() * Math.PI * 2; }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xcac3b8, size: 1.15, transparent: true, opacity: 0.38, depthWrite: false, sizeAttenuation: true }));
  points.userData = { descriptor, ages, seeds, origin: new THREE.Vector3(descriptor.position.x, descriptor.position.y, descriptor.position.z) };
  return points;
}
function updateSmoke(points, dt, now) {
  const { descriptor, ages, seeds, origin } = points.userData;
  const position = points.geometry.attributes.position;
  const wind = descriptor.wind;
  for (let i = 0; i < ages.length; i += 1) {
    ages[i] = (ages[i] + dt) % descriptor.lifespanSeconds;
    const t = ages[i] / descriptor.lifespanSeconds;
    const swirl = Math.sin(now * 0.0015 + seeds[i] + t * 9) * descriptor.turbulence;
    const radius = descriptor.spawnRadius + t * 2.2;
    position.setXYZ(i, origin.x + wind.direction.x * wind.response * t * 5.5 + Math.cos(seeds[i]) * radius * 0.35 + swirl * 0.25, origin.y + t * descriptor.riseSpeed * descriptor.lifespanSeconds, origin.z + wind.direction.z * wind.response * t * 5.5 + Math.sin(seeds[i]) * radius * 0.35 + swirl * 0.18);
  }
  position.needsUpdate = true;
}
function makeGrass(placement) {
  const geometry = new THREE.ConeGeometry(0.08, 0.5, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0x75b84d, roughness: 0.86 });
  const mesh = new THREE.InstancedMesh(geometry, material, placement.patches.length);
  const matrix = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  placement.patches.forEach((patch, index) => {
    pos.set(patch.transform.position.x, patch.transform.position.y + 0.25, patch.transform.position.z);
    q.setFromEuler(new THREE.Euler(0, patch.transform.rotation.y, 0));
    scale.setScalar(patch.transform.scale.x || 1);
    matrix.compose(pos, q, scale);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}
function makeClouds(contract) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0xfff7e8, transparent: true, opacity: 0.36, roughness: 1 });
  contract.clouds.slice(0, 4).forEach((descriptor) => {
    const cloud = new THREE.Group();
    for (let i = 0; i < 5; i += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), material);
      puff.position.set((i - 2) * 24, Math.sin(i) * 6, Math.cos(i * 1.7) * 14);
      puff.scale.set((descriptor.scale?.x || 300) / 80, (descriptor.scale?.y || 90) / 80, (descriptor.scale?.z || 230) / 80);
      cloud.add(puff);
    }
    cloud.position.set((descriptor.position?.x || 0) * 0.52, Math.max(135, (descriptor.position?.y || 600) * 0.5), (descriptor.position?.z || 0) * 0.52);
    cloud.userData = { speed: descriptor.driftSpeed || 0.04, drift: descriptor.drift || { x: 1, z: 0.2 } };
    group.add(cloud);
  });
  return group;
}

async function main() {
  const islandState = landformDomain.createOceanIslandLandformState({ id: "cozy-island-001", seed: "cozy-island-domain-cutover", preset: "tropical-small-island", radius: R, maxHeight: 18, beachWidth: 10, shelfWidth: 36, shelfDepth: 110, objectPalette: [], render: { heightfieldResolution: 129, shorelineSegments: 128 } });
  const landform = landformDomain.createOceanIslandLandformRenderContract(islandState, { heightfield: { resolution: 129 }, shoreline: { segments: 128 }, objects: { densityScale: 0 } });
  const sampleHeight = (point) => landformDomain.sampleIslandHeight(islandState, { x: point.x, z: point.z });
  const sampleMasks = (point) => landformDomain.sampleIslandMasks(islandState, { x: point.x, z: point.z });
  const campfireY = sampleHeight({ x: 0, z: 0 });
  const clearing = fencedClearingDomain.createFencedClearingGraph({ parentId: "island:cozy-001", position: { x: 0, y: campfireY, z: 0 }, fenceRadiusMeters: 12, campfireRadiusMeters: 2.25, playerYaw: 0 });
  const anchor = clearing.byId["central-clearing:campfire:player-avatar-anchor"] || {};
  const anchorPosition = safe(anchor.transform?.position, { x: 0, y: campfireY, z: 6 });
  const anchorRotation = safe(anchor.transform?.rotation, { x: 0, y: 0, z: 0 });
  const graph = foliageDomain.createDenseCozyIslandObjectGraph({ seed: "cozy-island-domain-cutover", radiusMeters: R, sampleHeight, sampleMasks });
  const floorState = oceanFloorDomain.createOceanFloorState({ seed: "cozy-island-ocean-floor", size: 3600, resolution: 53, baseDepth: SEA_FLOOR_Y, islandRadius: R, islandShelfRadius: 145, islandInfluenceRadius: 260, shelfDepth: -16, moundDepth: -42, noiseAmplitude: 9, objects: { seaFloorRocks: 34, seaFloorBoulders: 12, reefClusters: 14, coralClusters: 18 } });
  const oceanFloor = oceanFloorDomain.createOceanFloorRenderContract(floorState, { heightfield: { resolution: 53 }, objects: {} });
  const grassWind = grassWindDomain.createGrassWindDescriptor({ id: "central-grove-soft-wind", phaseSeed: "cozy-island-grass", baseSway: 0.16, gustStrength: 0.34 });
  const campfireGraph = campfireDomain.createCampfireObjectGraph({ parentId: graph.rootId, position: { x: 0, y: campfireY, z: 0 }, radiusMeters: 1.45, intensity: 0.86, smoke: true });
  const smokeDescriptor = smokeDomain.createSmokeParticleDescriptor({ parentId: campfireGraph.rootId, position: { x: 0, y: campfireY + 1.25, z: 0 }, wind: { ...grassWind, response: 0.78 }, particleCount: 96, riseSpeed: 1.2 });
  const grassPlacement = grassObjectDomain.createGrassPatchPlacementContract({ seed: "cozy-island-grass", count: 140, radiusMeters: R, sampleHeight, sampleMasks, pathNetwork: graph.pathNetwork, avoidObjects: graph.objects, exclusionZones: clearing.clearanceZones, pathClearance: 3.6, objectClearance: 1.15 });
  const cloudContract = cloudDomain.createMattatzCloudRenderContract(cloudDomain.createMattatzCloudsState({ seed: "cozy-island-clouds", weather: "sunrise-haze", cloudCount: 4 }), 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3cfa6);
  scene.fog = new THREE.FogExp2(0xf3cfa6, 0.00072);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 6800);
  scene.add(new THREE.HemisphereLight(0xfff7e9, 0x2d5b64, 1.55));
  const sun = new THREE.DirectionalLight(0xffe1a3, 4.1);
  sun.position.set(-320, 520, 260);
  scene.add(sun);

  const waterMesh = makeWater(oceanFloor.waterMaterial);
  const fire = makeCampfire(campfireGraph);
  const smoke = makeSmoke(smokeDescriptor);
  const grass = makeGrass(grassPlacement);
  const clouds = makeClouds(cloudContract);
  scene.add(makeOceanFloor(oceanFloor.heightfield), makeSeaObjects(oceanFloor.objects), makeTerrain(landform.heightfield), waterMesh, makeFoam(landform.shoreline), makePath(graph.pathNetwork, sampleHeight), makeObjects(graph, clearing.objectExclusionZones || [{ center: { x: 0, z: 0 }, radius: 11.2 }]), makeFence(clearing), fire, smoke, grass, clouds);

  const keys = new Set();
  const player = {
    position: new THREE.Vector3(anchorPosition.x, anchorPosition.y, anchorPosition.z),
    yaw: anchorRotation.y || 0,
    pitch: 0,
    eyeHeight: anchor.state?.eyeHeightMeters || 1.7,
    forward() { return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); },
    eye() { return new THREE.Vector3(this.position.x, sampleHeight(this.position) + this.eyeHeight, this.position.z); },
    look() { return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)); }
  };
  let scrollProgress = 0;
  let drag = null;
  let last = performance.now();

  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize();
  addEventListener("resize", resize);
  addEventListener("keydown", (event) => keys.add(event.code));
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  canvas.addEventListener("wheel", (event) => { event.preventDefault(); scrollProgress = clamp01(scrollProgress + event.deltaY * -0.0014); }, { passive: false });
  canvas.addEventListener("pointerdown", (event) => { drag = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (scrollProgress >= 0.985) {
      player.yaw -= dx * 0.0025;
      player.pitch = Math.max(-1.1, Math.min(1, player.pitch - dy * 0.0025));
    } else if (scrollProgress < 0.85) {
      player.yaw -= dx * 0.0045;
    }
    drag = { x: event.clientX, y: event.clientY };
  });

  function railPose() {
    const up = new THREE.Vector3(0, 1, 0);
    const base = player.position.clone();
    const forward = player.forward();
    const eye = player.eye();
    const cameraPoints = [
      base.clone().sub(forward.clone().multiplyScalar(520)).add(up.clone().multiplyScalar(155)),
      base.clone().sub(forward.clone().multiplyScalar(260)).add(up.clone().multiplyScalar(105)),
      base.clone().sub(forward.clone().multiplyScalar(95)).add(up.clone().multiplyScalar(42)),
      base.clone().sub(forward.clone().multiplyScalar(12)).add(up.clone().multiplyScalar(7)),
      base.clone().sub(forward.clone().multiplyScalar(3.2)).add(up.clone().multiplyScalar(2.2)),
      eye.clone()
    ];
    const lookPoints = [
      new THREE.Vector3(0, campfireY + 4.8, 0),
      new THREE.Vector3(0, campfireY + 2.4, 0),
      base.clone().add(up.clone().multiplyScalar(1.2)),
      base.clone().add(up.clone().multiplyScalar(1.65)),
      eye.clone().add(forward),
      eye.clone().add(forward)
    ];
    return {
      position: new THREE.CatmullRomCurve3(cameraPoints, false, "catmullrom", 0.35).getPoint(ease(scrollProgress)),
      look: new THREE.CatmullRomCurve3(lookPoints, false, "catmullrom", 0.35).getPoint(ease(scrollProgress))
    };
  }
  function valid(next) {
    const max = clearing.byId["central-clearing:campfire:collision-boundary"].state.radiusMeters;
    return Math.hypot(next.x, next.z) <= max && Math.hypot(next.x, next.z) >= 2.35;
  }
  function updateFirstPerson(dt) {
    const forward = player.forward();
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const move = new THREE.Vector3();
    if (keys.has("KeyW")) move.add(forward);
    if (keys.has("KeyS")) move.sub(forward);
    if (keys.has("KeyD")) move.add(right);
    if (keys.has("KeyA")) move.sub(right);
    if (move.lengthSq()) {
      const next = player.position.clone().add(move.normalize().multiplyScalar(2.6 * dt));
      next.y = sampleHeight(next);
      if (valid(next)) player.position.copy(next);
    }
    const eye = player.eye();
    camera.position.copy(eye);
    camera.lookAt(eye.clone().add(player.look()));
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    waterMesh.position.y = -0.08 + Math.sin(now * 0.0012) * 0.18;
    if (scrollProgress >= 0.985) updateFirstPerson(dt);
    else { const pose = railPose(); camera.position.copy(pose.position); camera.lookAt(pose.look); }
    updateSmoke(smoke, dt, now);
    fire.userData.flames?.forEach((flame, index) => flame.scale.setScalar(1 + Math.sin(now * 0.011 + index) * 0.1));
    if (fire.userData.light) fire.userData.light.intensity = 1.55 + Math.sin(now * 0.01) * 0.35;
    clouds.children.forEach((cloud) => { cloud.position.x += (cloud.userData.drift?.x || 1) * cloud.userData.speed * dt * 18; cloud.position.z += (cloud.userData.drift?.z || 0) * cloud.userData.speed * dt * 18; });
    hud.innerHTML = `<strong>Cozy Island</strong><br>scroll = sky → invisible player eyes · WASD/drag in human view<br>${scrollProgress >= 0.985 ? "first-person" : "scroll-rail"} · ${(scrollProgress * 100).toFixed(0)}% · grass ${grassPlacement.patchCount} · clouds ${clouds.children.length}`;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  globalThis.CozyIsland = { landform, graph, clearing, grassPlacement, smokeDescriptor, cloudContract, getScrollProgress: () => scrollProgress };
  requestAnimationFrame(frame);
}

main().catch(fail);
