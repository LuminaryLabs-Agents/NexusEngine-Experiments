import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const colorValue = (value, fallback = 0xffffff) => typeof value === "string" ? new THREE.Color(value) : new THREE.Color(fallback);
const colorApple = (r) => r === "legendary" ? 0xd36bff : r === "rare" ? 0xffe06b : 0xdf3f38;
const colorThreat = (m) => m?.color ? colorValue(m.color) : new THREE.Color(m?.boss ? 0xff365f : m?.elite ? 0xf0d27b : m?.archetypeId === "runner-zombie" ? 0xa4f080 : 0x87a45f);
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, ...extra });

function resize(canvas, renderer, camera) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = Math.max(320, canvas.clientWidth || innerWidth);
  const h = Math.max(240, canvas.clientHeight || innerHeight);
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function sync(group, cache, items, make, update) {
  const live = new Set();
  for (const item of items ?? []) {
    const id = String(item.id ?? item.entity ?? item.spawnId);
    live.add(id);
    let obj = cache.get(id);
    if (!obj) { obj = make(item); cache.set(id, obj); group.add(obj); }
    update(obj, item);
  }
  for (const [id, obj] of [...cache]) if (!live.has(id)) { cache.delete(id); group.remove(obj); }
}

const setXZ = (obj, p = {}) => obj.position.set(n(p.x), 0, n(p.z ?? p.y));

function makeLeafMaterial(color) {
  return mat(colorValue(color, 0x284315), { roughness: 0.94 });
}

function updateTreeDescriptor(group, descriptor = {}) {
  setXZ(group, descriptor.position);
  const trunk = group.userData.trunk;
  const trunkData = descriptor.trunk ?? {};
  trunk.geometry.dispose();
  trunk.geometry = new THREE.CylinderGeometry(n(trunkData.crownRadius, 0.22), n(trunkData.baseRadius, 0.32), n(trunkData.height, 3.3), 7);
  trunk.position.y = n(trunkData.height, 3.3) / 2;
  trunk.rotation.z = n(trunkData.lean);
  const leaves = descriptor.leaves ?? [];
  for (let i = 0; i < group.userData.leaves.length; i++) {
    const leaf = group.userData.leaves[i];
    const data = leaves[i];
    leaf.visible = Boolean(data);
    if (!data) continue;
    leaf.position.set(n(data.offset?.x), n(data.offset?.y), n(data.offset?.z));
    leaf.scale.setScalar(n(data.scale, 1));
    leaf.material.color.copy(colorValue(data.color, 0x284315));
  }
}

export async function createThreeView(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050606);
  scene.fog = new THREE.FogExp2(0x101407, 0.025);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  const hemi = new THREE.HemisphereLight(0xd9e6ff, 0x21150e, 1.9);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xffe0a8, 2.7);
  moon.position.set(-24, 48, 26);
  moon.castShadow = true;
  scene.add(moon);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 190), mat(0x111608));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const laneBandGroup = new THREE.Group();
  const laneBandCache = new Map();
  const trees = new THREE.Group(), apples = new THREE.Group(), pickups = new THREE.Group(), threats = new THREE.Group(), embers = new THREE.Group();
  scene.add(laneBandGroup, trees, apples, pickups, threats, embers);
  const treeMap = new Map(), appleMap = new Map(), pickupMap = new Map(), threatMap = new Map();

  for (let i = 0; i < 80; i++) {
    const ember = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), mat(0xff7a38, { emissive: 0xff4b1c, emissiveIntensity: 0.2, transparent: true, opacity: 0.32 }));
    ember.position.set((Math.random() - 0.5) * 130, 0.4 + Math.random() * 2.8, (Math.random() - 0.5) * 165);
    embers.add(ember);
  }

  const player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.75, 12), mat(0xf8e9ba));
  body.position.y = 0.9;
  body.castShadow = true;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), mat(0xfff5dc));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.25, -0.72);
  player.add(body, nose);
  scene.add(player);

  const makeLaneBand = () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat(0xd0a25b, { transparent: true, opacity: 0.08, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.012;
    return mesh;
  };
  const makeTree = (t) => {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.4, 7), mat(0x4a2b16));
    trunk.castShadow = true;
    const leaves = Array.from({ length: Math.max(10, (t.leaves ?? []).length) }, (_, i) => {
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), makeLeafMaterial(t.leaves?.[i]?.color));
      leaf.castShadow = true;
      return leaf;
    });
    g.userData = { trunk, leaves };
    g.add(trunk, ...leaves);
    updateTreeDescriptor(g, t);
    return g;
  };
  const makeApple = (a) => {
    const o = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), mat(colorApple(a.rarity), { emissive: colorValue(a.color, colorApple(a.rarity)), emissiveIntensity: n(a.emissiveIntensity, 0.22) }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), mat(colorValue(a.color, colorApple(a.rarity)), { emissive: colorValue(a.color, colorApple(a.rarity)), emissiveIntensity: 0.3, transparent: true, opacity: 0.16, depthWrite: false }));
    mesh.castShadow = true;
    o.userData = { mesh, halo };
    o.add(mesh, halo);
    return o;
  };
  const makePickup = () => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.9), mat(0xffd168, { emissive: 0x442400, emissiveIntensity: 0.16 }));
    o.position.y = 0.16;
    o.castShadow = true;
    return o;
  };
  const makeThreat = (m) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 2.2, 8), mat(colorThreat(m)));
    const aura = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 10), mat(colorThreat(m), { transparent: true, opacity: 0.1, emissive: colorThreat(m), emissiveIntensity: 0.2, depthWrite: false }));
    g.userData = { body: b, aura };
    g.add(b, aura);
    return g;
  };
  return { renderer: "three", render(snapshot = {}) {
    resize(canvas, renderer, camera);
    const visual = snapshot.visualDomains ?? {};
    const orchard = snapshot.orchard ?? {};
    const light = visual.lighting ?? {};
    scene.fog.density = n(light.fogDensity, 0.025);
    moon.intensity = n(light.moonIntensity, 2.7);
    embers.children.forEach((ember, index) => {
      ember.position.y += 0.008 + (index % 5) * 0.001;
      if (ember.position.y > 4.5) ember.position.y = 0.35;
      ember.material.opacity = 0.18 + n(light.emberIntensity, 0.15) * 0.38;
    });

    sync(laneBandGroup, laneBandCache, visual.lanes ?? [], makeLaneBand, (o, lane) => {
      o.position.set(n(lane.center?.x), 0.014, n(lane.center?.z));
      o.scale.set(n(lane.width, 4), n(lane.length, 100), 1);
      o.material.opacity = n(lane.opacity, 0.08);
    });
    sync(trees, treeMap, visual.trees ?? (orchard.treeRows ?? []).flatMap((r) => r.trees ?? []), makeTree, updateTreeDescriptor);
    sync(apples, appleMap, orchard.activeApples ?? [], makeApple, (o, a) => {
      const desc = (visual.apples ?? []).find((d) => d.id === a.id) ?? a;
      setXZ(o, a.position);
      o.position.y = 0.55 + Math.sin(performance.now() * 0.001 * n(desc.bobSpeed, 1) + n(String(a.id).length)) * 0.08;
      o.userData.mesh.material.color.copy(colorValue(desc.color, colorApple(desc.rarity)));
      o.userData.mesh.material.emissive.copy(colorValue(desc.color, colorApple(desc.rarity)));
      o.userData.mesh.material.emissiveIntensity = n(desc.emissiveIntensity, 0.22);
      o.userData.halo.scale.setScalar(n(desc.haloScale, 1.12));
      o.scale.setScalar(snapshot.nearestApple?.id === a.id ? 1.28 : 1);
    });
    sync(pickups, pickupMap, (snapshot.weapons?.pickups ?? []).filter((w) => w.active !== false), makePickup, (o, p) => { setXZ(o, p.position); o.scale.setScalar(snapshot.nearestWeapon?.id === p.id ? 1.35 : 1); });
    sync(threats, threatMap, snapshot.monsters ?? [], makeThreat, (o, m) => {
      const desc = (visual.threats ?? []).find((d) => d.id === m.entity) ?? m;
      setXZ(o, m.position);
      const h = n(desc.height, m.boss ? 3.4 : 2.2);
      o.userData.body.geometry.dispose();
      o.userData.body.geometry = new THREE.CylinderGeometry(n(desc.shoulderScale, 0.55) * 0.48, n(desc.shoulderScale, 0.55) * 0.58, h, 8);
      o.userData.body.position.y = h / 2;
      o.userData.body.material.color.copy(colorThreat(desc));
      o.userData.aura.scale.setScalar(0.8 + n(desc.aura, 0.16) * 1.8);
      o.userData.aura.position.y = h * 0.5;
      o.userData.aura.material.opacity = 0.05 + n(desc.aura, 0.16) * 0.18;
    });
    const pp = snapshot.player?.position ?? { x: 0, z: 0 };
    player.position.set(n(pp.x), 0, n(pp.z));
    const f = snapshot.player?.facing ?? { x: 0, z: -1 };
    player.rotation.y = Math.atan2(n(f.x), n(f.z));
    camera.position.lerp(new THREE.Vector3(n(pp.x), 25, n(pp.z) + 28), 0.08);
    camera.lookAt(n(pp.x), 0.8, n(pp.z) - 6);
    renderer.render(scene, camera);
    return snapshot;
  } };
}
