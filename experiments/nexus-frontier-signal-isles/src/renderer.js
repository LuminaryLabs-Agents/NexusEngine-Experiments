const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const color = (hex, fallback = 0xffffff) => hex ? Number.parseInt(String(hex).replace("#", ""), 16) : fallback;
const dist = (a = {}, b = {}) => Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? 0) - Number(b.z ?? 0));

function seeded01(text) {
  let h = 2166136261;
  for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h += 0x6D2B79F5;
  h = Math.imul(h ^ (h >>> 15), h | 1);
  h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
  return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
}

function height(level, x, z) {
  const ridge = Math.sin(x * 0.19 + z * 0.07) * 0.22;
  const ripple = Math.sin(z * 0.31) * 0.08;
  const edge = Math.max(0, Math.hypot(x, z) - level.sceneRecipe.terrain.radius * 0.72) * 0.04;
  return ridge + ripple - edge;
}

function terrainMesh(THREE, level, preset) {
  const radius = level.sceneRecipe.terrain.radius;
  const geometry = new THREE.PlaneGeometry(radius * 2.1, radius * 2.1, 72, 72).rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), z = pos.getZ(i), edge = Math.hypot(x, z) / radius;
    pos.setY(i, edge > 1.04 ? -2.2 : height(level, x, z));
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.terrain, 0x2f5b48), roughness: 0.92 }));
  mesh.receiveShadow = true;
  return mesh;
}

function pylon(THREE, preset) {
  const group = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.stone, 0x7a8075), roughness: 0.9 });
  const signal = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.signal, 0x65f1ff), emissive: color(preset.visual.palette.signal, 0x65f1ff), emissiveIntensity: 0.58 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.76, 1.2, 8), stone);
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), signal);
  shard.position.y = 1.14;
  group.add(base, shard);
  return group;
}

function crystal(THREE, preset) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.signal, 0x65f1ff), emissive: color(preset.visual.palette.signal, 0x65f1ff), emissiveIntensity: 0.25 });
  const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), mat);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.025, 8, 32), mat);
  gem.position.y = 0.52; ring.rotation.x = Math.PI / 2; ring.position.y = 0.06;
  group.add(gem, ring);
  return group;
}

function gateObject(THREE, preset) {
  const group = new THREE.Group();
  const frame = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.stone, 0x7a8075), roughness: 0.84 });
  const glow = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.locked, 0xff8c5a), emissive: color(preset.visual.palette.locked, 0xff8c5a), emissiveIntensity: 0.35 });
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.1, 0.42), frame);
  const r = l.clone(); const t = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.36, 0.42), frame);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.055, 12, 48), glow);
  l.position.set(-1.24, 1.55, 0); r.position.set(1.24, 1.55, 0); t.position.set(0, 3.05, 0); ring.position.set(0, 1.55, 0.02);
  group.userData.lightMaterial = glow;
  group.add(l, r, t, ring);
  return group;
}

function mastObject(THREE, preset) {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x93a5a4, roughness: 0.56, metalness: 0.45 });
  const glow = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.signal, 0x65f1ff), emissive: color(preset.visual.palette.signal, 0x65f1ff), emissiveIntensity: 0.8 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.4, 10), metal);
  const dish = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 8, 48), glow);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), glow);
  mast.position.y = 1.7; dish.position.y = 3.2; dish.rotation.x = Math.PI / 3; beacon.position.y = 3.2;
  group.add(mast, dish, beacon); group.visible = false;
  return group;
}

function setGround(level, object, pos) {
  object.position.set(Number(pos.x ?? 0), height(level, Number(pos.x ?? 0), Number(pos.z ?? 0)), Number(pos.z ?? 0));
}

function disposeMaterial(material) {
  if (Array.isArray(material)) material.forEach((entry) => entry?.dispose?.());
  else material?.dispose?.();
}

function clearLayer(group) {
  for (const child of [...group.children]) {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
    group.remove(child);
  }
}

export async function createSignalIslesRenderer({ canvas, level, preset }) {
  const THREE = await import(THREE_URL);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(color(preset.visual.palette.sky, 0x0e2130));
  scene.fog = new THREE.FogExp2(color(preset.visual.fog.color, 0x7dbbd1), preset.visual.fog.density);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.08, 240);
  const sun = new THREE.DirectionalLight(color(preset.visual.palette.sun, 0xffd879), 2.15);
  sun.position.set(-18, 32, 10); sun.castShadow = true;
  scene.add(new THREE.HemisphereLight(color(preset.visual.palette.sky, 0x0e2130), 0x18311f, 1.2), sun, terrainMesh(THREE, level, preset));
  const water = new THREE.Mesh(new THREE.CircleGeometry(level.sceneRecipe.terrain.radius * 1.75, 96), new THREE.MeshStandardMaterial({ color: 0x0b2b36, roughness: 0.72, transparent: true, opacity: 0.8 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -2.05; scene.add(water);

  const objects = new Map();
  const pickables = [];
  function add(id, mesh, pos) {
    setGround(level, mesh, pos); objects.set(id, mesh); scene.add(mesh);
    mesh.traverse((child) => { child.userData.objectId = id; if (child.isMesh) pickables.push(child); });
  }
  level.scanSites.forEach((site) => add(site.id, pylon(THREE, preset), site));
  level.resourceNodes.forEach((node) => add(node.id, crystal(THREE, preset), node));
  level.gates.forEach((gate) => add(gate.id, gateObject(THREE, preset), gate));
  level.cargo.forEach((item) => add(item.id, crystal(THREE, preset), item));
  const beacon = level.sceneRecipe.objects.find((entry) => entry.id === "final-beacon");
  if (beacon) add("final-beacon", pylon(THREE, preset), beacon.transform);
  const mast = mastObject(THREE, preset); setGround(level, mast, level.buildSites[0]); objects.set("signal-mast-01", mast); scene.add(mast);

  const vegMat = new THREE.MeshStandardMaterial({ color: 0x23472e, roughness: 0.95 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3b22, roughness: 0.9 });
  for (let i = 0; i < 150; i += 1) {
    const a = seeded01(`${level.seed}:veg:a:${i}`) * Math.PI * 2, r = Math.sqrt(seeded01(`${level.seed}:veg:r:${i}`)) * level.sceneRecipe.terrain.radius * 0.95;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (level.scanSites.some((target) => dist({ x, z }, target) < 3.4)) continue;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.9, 6), trunkMat);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.42 + seeded01(`${i}:c`) * 0.35, 1.2 + seeded01(`${i}:h`) * 0.9, 7), vegMat);
    trunk.position.y = 0.45; crown.position.y = 1.22; tree.add(trunk, crown); tree.position.set(x, height(level, x, z) - 0.08, z); tree.rotation.y = a; scene.add(tree);
  }

  const player = new THREE.Group();
  player.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.9, 4, 12), new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.player, 0xeaf6ff), roughness: 0.4 })));
  player.children[0].position.y = 0.72; scene.add(player);
  const agentMeshes = new Map();
  const agentMat = new THREE.MeshStandardMaterial({ color: color(preset.visual.palette.agent, 0xff6a5c), emissive: color(preset.visual.palette.agent, 0xff6a5c), emissiveIntensity: 0.16 });
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.86, 64), new THREE.MeshBasicMaterial({ color: color(preset.visual.palette.signal, 0x65f1ff), transparent: true, opacity: 0.54, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2; scene.add(marker);
  const visualLayer = new THREE.Group();
  scene.add(visualLayer);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function resize() { const w = innerWidth, h = innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }
  function pick(event) { const rect = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1); raycaster.setFromCamera(pointer, camera); const id = raycaster.intersectObjects(pickables, false)[0]?.object?.userData?.objectId; return id ? { id, kind: "world-object" } : null; }

  function addGroundDisc(descriptor, opacity = 0.16) {
    const radius = Math.max(0.05, Number(descriptor.radius ?? 1));
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 48),
      new THREE.MeshBasicMaterial({ color: color(descriptor.color, 0x65f1ff), transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(Number(descriptor.x ?? 0), height(level, Number(descriptor.x ?? 0), Number(descriptor.z ?? 0)) + 0.035, Number(descriptor.z ?? 0));
    visualLayer.add(mesh);
  }

  function addGroundRing(descriptor, opacity = 0.42) {
    const radius = Math.max(0.05, Number(descriptor.radius ?? 1));
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.025 + Number(descriptor.intensity ?? 0.2) * 0.035, 8, 80),
      new THREE.MeshBasicMaterial({ color: color(descriptor.color, 0x65f1ff), transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(Number(descriptor.x ?? 0), height(level, Number(descriptor.x ?? 0), Number(descriptor.z ?? 0)) + 0.07, Number(descriptor.z ?? 0));
    visualLayer.add(mesh);
  }

  function addThread(descriptor) {
    const from = descriptor.from ?? {};
    const to = descriptor.to ?? {};
    const fromX = Number(from.x ?? 0), fromZ = Number(from.z ?? 0), toX = Number(to.x ?? 0), toZ = Number(to.z ?? 0);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(fromX, height(level, fromX, fromZ) + 0.18, fromZ),
      new THREE.Vector3((fromX + toX) / 2, 1.1 + Number(descriptor.strength ?? 0) * 0.9, (fromZ + toZ) / 2),
      new THREE.Vector3(toX, height(level, toX, toZ) + 0.22, toZ)
    ]);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: color(descriptor.color, 0x65f1ff), transparent: true, opacity: 0.18 + Number(descriptor.strength ?? 0.2) * 0.48 }));
    visualLayer.add(line);
  }

  function addShard(descriptor) {
    if (!descriptor.active) return;
    const x = Number(descriptor.x ?? 0), z = Number(descriptor.z ?? 0);
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(Number(descriptor.size ?? 0.1), 0),
      new THREE.MeshBasicMaterial({ color: color(descriptor.color, 0x65f1ff), transparent: true, opacity: 0.82 })
    );
    mesh.position.set(x, height(level, x, z) + 0.38 + Math.sin(Number(descriptor.phase ?? 0) * Math.PI * 2) * 0.08, z);
    visualLayer.add(mesh);
  }

  function drawObjectiveReadabilityDescriptors(snapshot) {
    const descriptors = snapshot.objectiveReadability?.rendererHandoff?.descriptors ?? snapshot.domain?.signalIslesObjectiveReadability?.rendererHandoff?.descriptors ?? {};
    for (const pocket of descriptors.safePockets ?? []) if (pocket.active) addGroundDisc(pocket, 0.07 + Number(pocket.safety ?? 0) * 0.12);
    for (const cue of descriptors.actionCues ?? []) addGroundRing({ ...cue, intensity: cue.eligible ? 0.78 : 0.28 }, cue.eligible ? 0.46 : 0.2);
    for (const beat of descriptors.objectiveBeats ?? []) if (beat.active || beat.complete) addGroundRing({ ...beat, intensity: beat.active ? 0.85 : 0.35 }, beat.active ? 0.44 : 0.16);
    for (const delta of descriptors.resourceDeltas ?? []) addGroundRing({ ...delta, intensity: delta.ready ? 0.72 : 0.32 }, delta.ready ? 0.34 : 0.18);
    for (const thread of descriptors.dependencyThreads ?? []) addThread(thread);
    for (const ribbon of descriptors.cargoRibbons ?? []) addThread(ribbon);
  }

  function drawExpeditionReadinessDescriptors(snapshot) {
    const descriptors = snapshot.expeditionReadiness?.rendererHandoff?.descriptors ?? snapshot.domain?.signalIslesExpeditionReadiness?.rendererHandoff?.descriptors ?? {};
    for (const sector of descriptors.scanSectors ?? []) if (!sector.complete) addGroundRing({ ...sector, intensity: sector.eligible ? 0.78 : 0.34 }, sector.eligible ? 0.28 : 0.12);
    for (const window of descriptors.mastWindows ?? []) addGroundRing({ ...window, intensity: window.ready ? 0.82 : 0.38 }, window.placed ? 0.22 : 0.18 + Number(window.charge ?? 0) * 0.22);
    for (const runway of descriptors.gateRunways ?? []) {
      if (runway.from && runway.to) addThread(runway);
      else addGroundRing({ ...runway, intensity: runway.unlocked ? 0.85 : 0.35 + Number(runway.progress ?? 0) * 0.4 }, runway.unlocked ? 0.36 : 0.16 + Number(runway.progress ?? 0) * 0.18);
    }
    for (const line of descriptors.shardFerryLines ?? []) addThread(line);
    for (const lane of descriptors.retreatLanes ?? []) addThread(lane);
    for (const forecast of descriptors.beaconForecasts ?? []) {
      if (forecast.from && forecast.to) addThread(forecast);
      else addGroundRing({ ...forecast, intensity: forecast.active ? 0.74 : 0.24 }, forecast.active ? 0.34 : 0.12);
    }
  }

  function drawStormAnchorDescriptors(snapshot) {
    const descriptors = snapshot.stormAnchorReadiness?.rendererHandoff?.descriptors ?? snapshot.domain?.signalIslesStormAnchorReadiness?.rendererHandoff?.descriptors ?? {};
    for (const cell of descriptors.stormCells ?? []) if (cell.active) addGroundDisc({ ...cell, intensity: cell.pressure }, 0.06 + Number(cell.pressure ?? 0) * 0.13);
    for (const rod of descriptors.groundingRods ?? []) addGroundRing({ ...rod, intensity: rod.grounded ? 0.78 : 0.36 + Number(rod.charge ?? 0) * 0.34 }, rod.grounded ? 0.34 : 0.16 + Number(rod.charge ?? 0) * 0.2);
    for (const pocket of descriptors.shelterPockets ?? []) if (pocket.active) addGroundDisc({ ...pocket, intensity: pocket.safety }, 0.07 + Number(pocket.safety ?? 0) * 0.11);
    for (const cable of descriptors.anchorCables ?? []) addThread({ ...cable, strength: Number(cable.strength ?? cable.tension ?? 0.3) });
    for (const ring of descriptors.beaconResonanceRings ?? []) if (ring.active) addGroundRing({ ...ring, intensity: ring.resonance ?? 0.3 }, 0.14 + Number(ring.resonance ?? 0) * 0.26);
    for (const route of descriptors.evacuationTideRoutes ?? []) addThread(route);
  }

  function drawHarborReliefDescriptors(snapshot) {
    const descriptors = snapshot.harborReliefReadiness?.rendererHandoff?.descriptors ?? snapshot.domain?.signalIslesHarborReliefReadiness?.rendererHandoff?.descriptors ?? {};
    for (const settlement of descriptors.woundedSettlements ?? []) if (settlement.active) addGroundDisc({ ...settlement, intensity: settlement.urgency ?? 0.4 }, 0.05 + Number(settlement.urgency ?? 0) * 0.13);
    for (const crate of descriptors.medicineCrates ?? []) addGroundRing({ ...crate, intensity: crate.supply ?? 0.35 }, crate.secured ? 0.16 : 0.26 + Number(crate.supply ?? 0) * 0.16);
    for (const pier of descriptors.pierLandingWindows ?? []) if (pier.active) addGroundRing({ ...pier, intensity: pier.ready ? 0.9 : 0.35 + Number(pier.progress ?? 0) * 0.45 }, pier.ready ? 0.38 : 0.14 + Number(pier.progress ?? 0) * 0.2);
    for (const channel of descriptors.skiffChannelThreads ?? []) addThread(channel);
    for (const horn of descriptors.reliefHornCalls ?? []) if (horn.active) addGroundRing({ ...horn, intensity: horn.charge ?? 0.4 }, 0.12 + Number(horn.charge ?? 0) * 0.25);
    for (const manifest of descriptors.departureManifests ?? []) if (manifest.active) addGroundRing({ ...manifest, intensity: manifest.readiness ?? 0.25 }, 0.1 + Number(manifest.readiness ?? 0) * 0.24);
  }

  function drawVisualDescriptors(snapshot) {
    clearLayer(visualLayer);
    const descriptors = snapshot.visualFractal?.rendererHandoff?.descriptors ?? {};
    for (const cell of descriptors.reliefCells ?? []) addGroundDisc(cell, cell.id === "shoreline-falloff" ? 0.08 : 0.13 + Number(cell.pulse ?? 0) * 0.08);
    for (const thread of descriptors.signalThreads ?? []) addThread(thread);
    for (const ring of descriptors.pressureFronts ?? []) addGroundRing(ring, 0.16 + Number(ring.intensity ?? 0) * 0.3);
    for (const ghost of descriptors.buildGhosts ?? []) addGroundRing(ghost, ghost.placed ? 0.18 : 0.44);
    for (const shard of descriptors.resourceShards ?? []) addShard(shard);
    for (const compass of descriptors.compass ?? []) addThread({ from: compass.from, to: compass.to, strength: 0.65 + Number(compass.progress ?? 0) * 0.35, color: compass.color });
    drawObjectiveReadabilityDescriptors(snapshot);
    drawExpeditionReadinessDescriptors(snapshot);
    drawStormAnchorDescriptors(snapshot);
    drawHarborReliefDescriptors(snapshot);
  }

  function draw(snapshot) {
    const session = snapshot.session, p = session.player, px = Number(p.x ?? 0), pz = Number(p.z ?? 0);
    player.position.set(px, height(level, px, pz), pz); player.rotation.y = Number(p.yaw ?? 0);
    const eye = player.position.y + 1.28, yaw = Number(p.yaw ?? 0), pitch = Number(p.pitch ?? 0);
    camera.position.set(px, eye, pz); camera.lookAt(px + Math.sin(yaw) * Math.cos(pitch), eye + Math.sin(pitch), pz - Math.cos(yaw) * Math.cos(pitch));
    const targetId = snapshot.objective.current?.targetId ?? "final-beacon"; const target = objects.get(targetId) ?? objects.get("final-beacon");
    marker.visible = Boolean(target); if (target) { marker.position.copy(target.position); marker.position.y += 0.08 + Math.sin(session.elapsed * 3) * 0.04; }
    mast.visible = session.placedStructureIds.includes("signal-mast-01");
    const gate = objects.get("gate-01"); if (gate?.userData?.lightMaterial) { const c = session.gateUnlocked ? color(preset.visual.palette.signal) : color(preset.visual.palette.locked); gate.userData.lightMaterial.color.setHex(c); gate.userData.lightMaterial.emissive.setHex(c); }
    const agents = snapshot.kitStates.agentGroup?.agents ?? {};
    for (const [id, agent] of Object.entries(agents)) { let mesh = agentMeshes.get(id); if (!mesh) { mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), agentMat); agentMeshes.set(id, mesh); scene.add(mesh); } const x = Number(agent.x ?? 0), z = Number(agent.y ?? agent.z ?? 0); mesh.position.set(x, height(level, x, z) + 0.38, z); }
    drawVisualDescriptors(snapshot);
    water.material.opacity = 0.76 + Math.sin(session.elapsed * 0.7) * 0.03;
    renderer.render(scene, camera);
  }

  addEventListener("resize", resize); resize();
  return { THREE, scene, camera, renderer, draw, pick, resize, dispose() { removeEventListener("resize", resize); clearLayer(visualLayer); renderer.dispose(); } };
}

export default createSignalIslesRenderer;
