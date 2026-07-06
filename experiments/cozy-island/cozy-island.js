const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const err = document.querySelector("#error");

function fail(error) {
  err.hidden = false;
  err.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>Cozy Island</strong><br>Runtime error. See panel.";
}

const cdn = "https://cdn.jsdelivr.net/";
const THREE = await import(cdn + "npm/three@0.160.0/build/three.module.js");
const kitBase = cdn + "gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/";

async function loadDomains() {
  try {
    const island = await import(kitBase + "ocean-island-landform-domain/index.js");
    const clouds = await import(kitBase + "mattatz-clouds-domain/index.js");
    return { island, clouds, source: "domain" };
  } catch (error) {
    console.warn("Cozy Island domain import fallback", error);
    return { island: null, clouds: null, source: "fallback" };
  }
}

function fallbackHeight(x, z) {
  const a = Math.atan2(z, x);
  const coast = 1 + Math.sin(a * 5) * 0.1 + Math.cos(a * 9) * 0.05;
  const d = Math.hypot(x, z) / (310 * coast);
  const n = Math.max(0, 1 - d);
  return Math.pow(n, 0.72) * 78 + Math.sin(x * 0.025) * Math.sin(z * 0.018) * 5 * n;
}

function fallbackMasks(x, z) {
  const h = fallbackHeight(x, z);
  const d = Math.hypot(x, z);
  return { height: h, water: d > 330 ? 1 : 0, beach: d > 260 && d <= 330 ? 1 : 0, grass: d <= 260 && h < 55 ? 1 : 0, rock: h >= 55 ? 1 : 0, cliff: h > 67 ? 1 : 0, wetSand: d > 306 && d <= 334 ? 1 : 0, foam: Math.max(0, 1 - Math.abs(d - 330) / 28) };
}

function fallbackIslandContract() {
  const resolution = 67;
  const extent = 540;
  const samples = [];
  for (let zi = 0; zi < resolution; zi++) for (let xi = 0; xi < resolution; xi++) {
    const x = (xi / (resolution - 1) * 2 - 1) * extent;
    const z = (zi / (resolution - 1) * 2 - 1) * extent;
    const masks = fallbackMasks(x, z);
    samples.push({ x, y: masks.height, z, masks });
  }
  const shoreline = Array.from({ length: 128 }, (_, i) => {
    const a = i / 128 * Math.PI * 2;
    const r = 330 * (1 + Math.sin(a * 5) * 0.1 + Math.cos(a * 9) * 0.05);
    return { x: Math.cos(a) * r, y: 0.04, z: Math.sin(a) * r };
  });
  const objectIds = ["palm", "palm", "bush", "rock", "boulder", "driftwood", "reef"];
  const objects = Array.from({ length: 70 }, (_, i) => {
    const id = objectIds[i % objectIds.length];
    const a = i * 2.399;
    const r = id === "reef" ? 380 : id === "driftwood" ? 305 : 70 + (i * 37 % 190);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    return { objectId: id, position: { x, y: fallbackHeight(x, z), z }, rotation: a, scale: 0.65 + (i % 7) * 0.16 };
  });
  return { heightfield: { resolution, samples }, shoreline, objects };
}

function materialFor(m) {
  const color = m.wetSand ? 0xcaa46b : m.beach ? 0xe7ca91 : m.cliff || m.rock ? 0x817d6d : 0x4f8d4d;
  return new THREE.Color(color);
}

function makeTerrain(contract) {
  const r = contract.heightfield.resolution;
  const pos = [];
  const colors = [];
  const idx = [];
  for (const s of contract.heightfield.samples) {
    pos.push(s.x, s.y, s.z);
    const c = materialFor(s.masks || {});
    colors.push(c.r, c.g, c.b);
  }
  for (let z = 0; z < r - 1; z++) for (let x = 0; x < r - 1; x++) {
    const a = z * r + x;
    idx.push(a, a + r, a + 1, a + 1, a + r, a + r + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.015 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function makeFoam(shoreline) {
  const pts = shoreline.map(p => new THREE.Vector3(p.x, (p.y || 0) + 0.08, p.z));
  pts.push(pts[0].clone());
  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), shoreline.length, 1.4, 5, true),
    new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: 0.34, depthWrite: false })
  );
}

function makePalm() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.18, 2.4, 7), new THREE.MeshStandardMaterial({ color: 0x815838, roughness: 0.88 }));
  trunk.position.y = 1.2;
  trunk.rotation.z = 0.12;
  group.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f8f52, roughness: 0.86, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.5, 4), leafMat);
    leaf.position.y = 2.35;
    leaf.rotation.z = Math.PI / 2.8;
    leaf.rotation.y = i / 7 * Math.PI * 2;
    leaf.scale.set(1, 0.42, 1);
    group.add(leaf);
  }
  return group;
}

function makeProp(d) {
  let object;
  if (d.objectId === "palm") object = makePalm();
  else {
    const color = d.objectId === "bush" ? 0x3e8f45 : d.objectId === "driftwood" ? 0x8a6844 : d.objectId === "reef" ? 0xe28f74 : 0x77756a;
    const geometry = d.objectId === "driftwood" ? new THREE.CapsuleGeometry(0.12, 1.2, 4, 8) : new THREE.DodecahedronGeometry(d.objectId === "reef" ? 0.42 : 0.58, 0);
    object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  }
  object.position.set(d.position.x, d.position.y, d.position.z);
  object.rotation.y = d.rotation || 0;
  object.scale.setScalar(d.scale || 1);
  object.traverse?.(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
  return object;
}

function makeCloud(d, layer = 0) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: layer === 2 ? 0xf6fbff : 0xfff7e8, roughness: 1, transparent: true, opacity: layer === 2 ? 0.26 : 0.46 });
  const count = layer === 2 ? 3 : 5;
  for (let i = 0; i < count; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat);
    puff.position.set((i - count / 2) * 20, Math.sin(i) * 3, Math.cos(i * 1.7) * 11);
    puff.scale.set((d.scale?.x || 250) / 115, (d.scale?.y || 80) / 95, (d.scale?.z || 160) / 130);
    group.add(puff);
  }
  group.position.set(d.position?.x || 0, d.position?.y || 600, d.position?.z || 0);
  group.userData.speed = d.driftSpeed || 0.05;
  group.userData.drift = d.drift || { x: 1, z: 0 };
  return group;
}

function fallbackClouds() {
  return Array.from({ length: 20 }, (_, i) => ({ position: { x: Math.cos(i * 2.17) * 680, y: 260 + (i % 3) * 220, z: Math.sin(i * 1.77) * 620 }, scale: { x: 220 + (i % 4) * 50, y: 64 + (i % 3) * 22, z: 160 + (i % 5) * 34 }, layerId: i % 3 === 2 ? "high" : i % 3 === 1 ? "mid" : "low", driftSpeed: 0.04 + (i % 4) * 0.01, drift: { x: 1, z: 0.22 } }));
}

async function main() {
  const domains = await loadDomains();
  const islandState = domains.island?.createOceanIslandLandformState?.({ seed: "cozy-island-three", preset: "tropical-small-island", radius: 390, maxHeight: 72, beachWidth: 56, objectPalette: ["palm", "palm", "bush", "rock", "boulder", "driftwood", "reef"] });
  const island = islandState ? domains.island.createOceanIslandLandformRenderContract(islandState, { heightfield: { resolution: 67 }, shoreline: { segments: 128 }, objects: { densityScale: 0.58 } }) : fallbackIslandContract();
  const cloudState = domains.clouds?.createMattatzCloudsState?.({ seed: "cozy-island-clouds", weather: "sunrise-haze", cloudCount: 20 });
  const cloudContract = cloudState ? domains.clouds.createMattatzCloudRenderContract(cloudState, 0) : { clouds: fallbackClouds() };
  const sampleHeight = domains.island?.sampleIslandHeight ? point => domains.island.sampleIslandHeight(islandState, point) : point => fallbackHeight(point.x, point.z);
  const sampleMasks = domains.island?.sampleIslandMasks ? point => domains.island.sampleIslandMasks(islandState, point) : point => fallbackMasks(point.x, point.z);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3cfa6);
  scene.fog = new THREE.FogExp2(0xf3cfa6, 0.001);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 5400);
  scene.add(new THREE.HemisphereLight(0xfff7e9, 0x2d5b64, 1.55));
  const sun = new THREE.DirectionalLight(0xffe1a3, 4.1);
  sun.position.set(-320, 520, 260);
  sun.castShadow = true;
  scene.add(sun);

  const terrain = makeTerrain(island);
  scene.add(terrain);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800, 96, 96).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3bb6c8, transparent: true, opacity: 0.78, roughness: 0.42, metalness: 0.04 }));
  water.position.y = -0.08;
  scene.add(water, makeFoam(island.shoreline));
  for (const d of island.objects.slice(0, 78)) scene.add(makeProp(d));
  const cloudGroup = new THREE.Group();
  cloudContract.clouds.forEach(d => cloudGroup.add(makeCloud(d, d.layerId?.includes("high") ? 2 : d.layerId?.includes("mid") ? 1 : 0)));
  scene.add(cloudGroup);

  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.18, radius: 720, target: new THREE.Vector3(0, 32, 0) };
  let drag = null;
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize();
  addEventListener("resize", resize);
  addEventListener("keydown", event => keys.add(event.code));
  addEventListener("keyup", event => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  canvas.addEventListener("wheel", event => { event.preventDefault(); rig.radius = Math.max(260, Math.min(1200, rig.radius + event.deltaY * 0.9)); }, { passive: false });
  canvas.addEventListener("pointerdown", event => { drag = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("pointermove", event => {
    if (!drag) return;
    rig.yaw -= (event.clientX - drag.x) * 0.0045;
    rig.pitch = Math.max(-0.75, Math.min(0.2, rig.pitch - (event.clientY - drag.y) * 0.0035));
    drag = { x: event.clientX, y: event.clientY };
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const f = new THREE.Vector3(-Math.sin(rig.yaw), 0, -Math.cos(rig.yaw));
    const r = new THREE.Vector3(Math.cos(rig.yaw), 0, -Math.sin(rig.yaw));
    const move = new THREE.Vector3();
    if (keys.has("KeyW")) move.add(f); if (keys.has("KeyS")) move.sub(f); if (keys.has("KeyD")) move.add(r); if (keys.has("KeyA")) move.sub(r);
    if (move.lengthSq()) { rig.target.add(move.normalize().multiplyScalar(90 * dt)); rig.target.y = Math.max(18, sampleHeight(rig.target) + 26); }
    water.position.y = -0.08 + Math.sin(now * 0.0012) * 0.18;
    cloudGroup.children.forEach((c, i) => { c.position.x += (c.userData.drift?.x || 1) * c.userData.speed * dt * 14; c.position.z += (c.userData.drift?.z || 0) * c.userData.speed * dt * 14; c.rotation.y = Math.sin(now * 0.00008 + i) * 0.04; });
    const off = new THREE.Vector3(Math.sin(rig.yaw) * Math.cos(rig.pitch) * rig.radius, Math.max(120, Math.sin(-rig.pitch + 0.46) * rig.radius * 0.42), Math.cos(rig.yaw) * Math.cos(rig.pitch) * rig.radius);
    camera.position.copy(rig.target).add(off);
    camera.lookAt(rig.target);
    const m = sampleMasks(rig.target);
    hud.innerHTML = `<strong>Cozy Island</strong><br>WASD drift · drag orbit · wheel zoom<br>${domains.source} landform · objects ${island.objects.length} · clouds ${cloudContract.clouds.length} · foam ${Math.round((m.foam || 0) * 100)}%`;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  globalThis.CozyIsland = { islandState, island, cloudState, cloudContract, source: domains.source };
  requestAnimationFrame(frame);
}

main().catch(fail);
