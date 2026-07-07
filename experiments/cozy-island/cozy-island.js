const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const err = document.querySelector("#error");

const SEA_FLOOR_Y = -128;
const CLOUD_COUNT = 4;
const ISLAND_RADIUS_METERS = 100;
const GRASS_PATCH_COUNT = 140;

function fail(error) {
  err.hidden = false;
  err.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>Cozy Island</strong><br>Runtime error. See panel.";
}

const cdn = "https://cdn.jsdelivr.net/";
const THREE = await import(cdn + "npm/three@0.160.0/build/three.module.js");
const proto = cdn + "gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/";
const landformDomain = await import(proto + "ocean-island-landform-domain/index.js?v=avatar-takeover-1");
const foliageDomain = await import(proto + "island-foliage-domain/index.js?v=avatar-takeover-1");
const oceanFloorDomain = await import(proto + "ocean-floor-domain/index.js?v=avatar-takeover-1");
const grassTextureDomain = await import(proto + "grass-texture-domain/index.js?v=avatar-takeover-1");
const grassObjectDomain = await import(proto + "grass-object-domain/index.js?v=avatar-takeover-1");
const grassWindDomain = await import(proto + "grass-wind-domain/index.js?v=avatar-takeover-1");
const campfireDomain = await import(proto + "campfire-object-domain/index.js?v=avatar-takeover-1");
const smokeDomain = await import(proto + "smoke-particle-domain/index.js?v=avatar-takeover-1");
const fencedClearingDomain = await import(proto + "fenced-clearing-domain/index.js?v=avatar-takeover-1");
const cameraModeDomain = await import(proto + "camera-mode-domain/index.js?v=avatar-takeover-1");
const cloudDomain = await import(proto + "mattatz-clouds-domain/index.js?v=avatar-takeover-1");

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoother = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const lerpVec = (a, b, t) => a.clone().lerp(b, smoother(t));

function materialFor(m) {
  const color = m.wetSand ? 0xcaa46b : m.beach ? 0xe7ca91 : m.cliff || m.rock ? 0x817d6d : m.path ? 0xb89564 : 0x4f8d4d;
  return new THREE.Color(color);
}

function buildIndexedMeshFromSamples(samples, resolution, colorForSample, material) {
  const positions = [];
  const colors = [];
  const indices = [];
  for (const sample of samples) {
    positions.push(sample.x, sample.y, sample.z);
    const color = colorForSample(sample);
    colors.push(color.r, color.g, color.b);
  }
  for (let z = 0; z < resolution - 1; z += 1) {
    for (let x = 0; x < resolution - 1; x += 1) {
      const a = z * resolution + x;
      indices.push(a, a + resolution, a + 1, a + 1, a + resolution, a + resolution + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function makeTerrain(heightfield) {
  return buildIndexedMeshFromSamples(
    heightfield.samples,
    heightfield.resolution,
    (sample) => materialFor(sample.masks || {}),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.015 })
  );
}

function makeOceanFloor(heightfield) {
  return buildIndexedMeshFromSamples(
    heightfield.samples,
    heightfield.resolution,
    (sample) => {
      const masks = sample.masks || {};
      return new THREE.Color(masks.reefBand ? 0x3d8176 : masks.shallowShelf ? 0x4b8b7a : 0x235b67);
    },
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.0 })
  );
}

function makeFoam(shoreline) {
  const points = shoreline.map((point) => new THREE.Vector3(point.x, (point.y || 0) + 0.08, point.z));
  points.push(points[0].clone());
  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), shoreline.length, 0.65, 5, true),
    new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: 0.36, depthWrite: false })
  );
}

function makePath(pathNetwork, sampleHeight) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0xb89564, roughness: 0.96, transparent: true, opacity: 0.86 });
  for (const segment of pathNetwork.segments) {
    const a = new THREE.Vector3(segment.from.x, sampleHeight(segment.from) + 0.12, segment.from.z);
    const b = new THREE.Vector3(segment.to.x, sampleHeight(segment.to) + 0.12, segment.to.z);
    const dir = new THREE.Vector3().subVectors(b, a);
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(segment.width * 0.5);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([
      a.x + side.x, a.y, a.z + side.z,
      a.x - side.x, a.y, a.z - side.z,
      b.x + side.x, b.y, b.z + side.z,
      b.x - side.x, b.y, b.z - side.z
    ], 3));
    geometry.setIndex([0, 1, 2, 2, 1, 3]);
    geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry, material));
  }
  return group;
}

function childrenOf(byParent, id, type = null) {
  return (byParent.get(id) || []).filter((child) => !type || child.type === type);
}

function insideZone(pos, zones = [], margin = 0) {
  return zones.some((zone) => {
    const center = zone.center || zone.position || { x: 0, z: 0 };
    const radius = (zone.radius || zone.radiusMeters || 0) + margin;
    return Math.hypot(pos.x - center.x, pos.z - center.z) < radius;
  });
}

function makePalm(record, byParent) {
  const group = new THREE.Group();
  const height = record.state?.heightMeters || 7;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, height, 8), new THREE.MeshStandardMaterial({ color: 0x815838, roughness: 0.88 }));
  trunk.position.y = height * 0.5;
  trunk.rotation.z = record.state?.lean || 0;
  group.add(trunk);
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2f8f52, roughness: 0.86, side: THREE.DoubleSide });
  for (let index = 0; index < 7; index += 1) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, height * 0.34, 4), leafMaterial);
    leaf.position.y = height * 0.96;
    leaf.rotation.z = Math.PI / 2.8;
    leaf.rotation.y = index / 7 * Math.PI * 2;
    leaf.scale.set(1, 0.42, 1);
    group.add(leaf);
  }
  const coconutMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5b32, roughness: 0.8 });
  const cluster = childrenOf(byParent, record.id, "coconut-cluster")[0];
  for (const coconut of childrenOf(byParent, cluster?.id, "coconut")) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), coconutMaterial);
    mesh.position.copy(new THREE.Vector3(coconut.transform.position.x, coconut.transform.position.y, coconut.transform.position.z));
    group.add(mesh);
  }
  group.position.copy(new THREE.Vector3(record.transform.position.x, record.transform.position.y, record.transform.position.z));
  group.rotation.y = record.transform.rotation.y || 0;
  group.scale.setScalar(record.transform.scale.x || 1);
  return group;
}

function makeBroadleaf(record) {
  const group = new THREE.Group();
  const height = record.state?.heightMeters || 9;
  const canopy = record.state?.canopyRadiusMeters || 3.4;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, height * 0.72, 8), new THREE.MeshStandardMaterial({ color: 0x6f4b30, roughness: 0.9 }));
  trunk.position.y = height * 0.36;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(canopy, 12, 8), new THREE.MeshStandardMaterial({ color: record.type === "young-tree" ? 0x4e9b50 : 0x3f8f45, roughness: 0.9 }));
  crown.position.y = height * 0.78;
  crown.scale.y = 0.72;
  const root = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.28, 8), new THREE.MeshStandardMaterial({ color: 0x5a3d2c, roughness: 0.9 }));
  root.position.y = 0.14;
  group.add(root, trunk, crown);
  group.position.copy(new THREE.Vector3(record.transform.position.x, record.transform.position.y, record.transform.position.z));
  group.rotation.y = record.transform.rotation.y || 0;
  group.scale.setScalar(record.transform.scale.x || 1);
  return group;
}

function makeSimple(record) {
  const type = record.type;
  const scale = record.transform.scale.x || 1;
  const color = type === "bush" ? 0x3e8f45 : type === "fern" ? 0x2e7c4a : type === "driftwood" || type === "fallen-log" ? 0x8a6844 : type === "reef" || type === "coral" ? 0xe28f74 : 0x77756a;
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  let geometry;
  if (type === "fern") geometry = new THREE.ConeGeometry(0.18, 0.75, 5);
  else if (type === "driftwood" || type === "fallen-log") geometry = new THREE.CapsuleGeometry(0.11, type === "fallen-log" ? 1.2 : 0.75, 4, 8);
  else if (type === "bush") geometry = new THREE.SphereGeometry(0.42, 8, 6);
  else geometry = new THREE.DodecahedronGeometry(type === "reef" ? 0.28 : 0.38, 0);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(new THREE.Vector3(record.transform.position.x, record.transform.position.y, record.transform.position.z));
  mesh.rotation.y = record.transform.rotation.y || 0;
  mesh.scale.setScalar(scale);
  return mesh;
}

function makeObjects(graph, exclusionZones = []) {
  const byParent = new Map();
  for (const object of graph.objects) {
    if (!object.parentId) continue;
    if (!byParent.has(object.parentId)) byParent.set(object.parentId, []);
    byParent.get(object.parentId).push(object);
  }
  const group = new THREE.Group();
  const rootTypes = new Set(["palm-tree", "broadleaf-tree", "young-tree", "bush", "fern", "fallen-log", "rock", "boulder", "driftwood", "reef", "coral"]);
  for (const object of graph.objects) {
    if (!rootTypes.has(object.type)) continue;
    if (insideZone(object.transform.position, exclusionZones, 0.35)) continue;
    if (object.type === "palm-tree") group.add(makePalm(object, byParent));
    else if (object.type === "broadleaf-tree" || object.type === "young-tree") group.add(makeBroadleaf(object));
    else group.add(makeSimple(object));
  }
  return group;
}

function makeSeaFloorObjects(objects) {
  const group = new THREE.Group();
  for (const object of objects) {
    const type = object.type;
    const color = type === "reef-cluster" ? 0xd78367 : type === "coral-cluster" ? 0xf0a58c : type === "sea-floor-boulder" ? 0x56676b : 0x667b78;
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.01 });
    const geometry = new THREE.DodecahedronGeometry(type === "sea-floor-boulder" ? 0.9 : 0.45, 0);
    const mesh = new THREE.Mesh(geometry, material);
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
    } else if (object.type === "fence-gate") {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.08), railMaterial);
      mesh.position.set(object.transform.position.x, object.transform.position.y + 0.7, object.transform.position.z);
      mesh.rotation.y = object.transform.rotation.y || 0;
      group.add(mesh);
    }
  }
  return group;
}

function makeAvatar(avatarRecord) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3d5f82, roughness: 0.74 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xd7b38c, roughness: 0.82 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.15, 10), bodyMaterial);
  body.position.y = 0.72;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), headMaterial);
  head.position.y = 1.45;
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.035), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  eye.position.set(0, 1.47, -0.22);
  group.add(body, head, eye);
  group.position.set(avatarRecord.transform.position.x, avatarRecord.transform.position.y, avatarRecord.transform.position.z);
  group.rotation.y = avatarRecord.transform.rotation.y || 0;
  group.userData.eyeHeight = avatarRecord.state.eyeHeightMeters || 1.7;
  return group;
}

function makeCampfire(campfireGraph) {
  const root = campfireGraph.byId[campfireGraph.rootId];
  const group = new THREE.Group();
  group.position.set(root.transform.position.x, root.transform.position.y, root.transform.position.z);
  const logMaterial = new THREE.MeshStandardMaterial({ color: 0x70462a, roughness: 0.88 });
  for (let index = 0; index < 7; index += 1) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.0, 8), logMaterial);
    log.position.y = 0.22 + (index % 2) * 0.1;
    log.rotation.z = Math.PI / 2;
    log.rotation.y = index / 7 * Math.PI * 2;
    group.add(log);
  }
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 6), new THREE.MeshStandardMaterial({ color: 0xff5c22, emissive: 0xff3d12, emissiveIntensity: 1.4, roughness: 0.5 }));
  ember.scale.y = 0.18;
  ember.position.y = 0.16;
  group.add(ember);
  const flames = [];
  for (let index = 0; index < 5; index += 1) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.25 + index * 0.025, 1.1 - index * 0.08, 5), new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffa533 : 0xffdf62, transparent: true, opacity: 0.72, depthWrite: false }));
    flame.position.set(Math.cos(index) * 0.18, 0.65, Math.sin(index * 1.7) * 0.18);
    flame.rotation.y = index;
    group.add(flame);
    flames.push(flame);
  }
  const light = new THREE.PointLight(0xff9d43, 1.8, 22, 2);
  light.position.set(0, 1.2, 0);
  group.add(light);
  group.userData.flames = flames;
  group.userData.light = light;
  return group;
}

function makeSmokeParticles(descriptor) {
  const count = descriptor.particleCount;
  const positions = new Float32Array(count * 3);
  const ages = new Float32Array(count);
  const seeds = new Float32Array(count);
  const origin = new THREE.Vector3(descriptor.position.x, descriptor.position.y, descriptor.position.z);
  for (let index = 0; index < count; index += 1) {
    ages[index] = Math.random() * descriptor.lifespanSeconds;
    seeds[index] = Math.random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xcac3b8, size: 1.15, transparent: true, opacity: 0.42, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  points.userData = { descriptor, ages, seeds, origin };
  updateSmokeParticles(points, 0.016, 0);
  return points;
}

function updateSmokeParticles(points, dt, now) {
  const { descriptor, ages, seeds, origin } = points.userData;
  const positions = points.geometry.attributes.position;
  const life = descriptor.lifespanSeconds;
  const wind = descriptor.wind;
  for (let index = 0; index < ages.length; index += 1) {
    ages[index] += dt;
    if (ages[index] > life) ages[index] -= life;
    const t = ages[index] / life;
    const swirl = Math.sin(now * 0.0015 + seeds[index] + t * 9) * descriptor.turbulence;
    const radius = descriptor.spawnRadius + t * 2.2;
    const rise = t * descriptor.riseSpeed * life;
    positions.setXYZ(index,
      origin.x + wind.direction.x * wind.response * t * 5.5 + Math.cos(seeds[index]) * radius * 0.35 + swirl * 0.25,
      origin.y + rise,
      origin.z + wind.direction.z * wind.response * t * 5.5 + Math.sin(seeds[index]) * radius * 0.35 + swirl * 0.18
    );
  }
  positions.needsUpdate = true;
  points.material.opacity = 0.28 + Math.sin(now * 0.001) * 0.04;
}

function createGrassPatchGeometry({ bladeCount = 260, radius = 1.8, seed = 1, heightMin = 0.32, heightMax = 0.92, texture }) {
  let state = seed || 1;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
  const rootColor = new THREE.Color(texture.rootColor);
  const tipColor = new THREE.Color(texture.tipColor);
  const dryColor = new THREE.Color(texture.dryColor);
  const positions = [];
  const colors = [];
  const indices = [];
  for (let index = 0; index < bladeCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const spread = radius * Math.sqrt(random());
    const x = Math.cos(angle) * spread;
    const z = Math.sin(angle) * spread;
    const height = heightMin + (heightMax - heightMin) * random();
    const width = 0.018 + random() * 0.03;
    const lean = (random() - 0.5) * 0.24;
    const side = new THREE.Vector3(Math.cos(angle + Math.PI / 2) * width, 0, Math.sin(angle + Math.PI / 2) * width);
    const tip = new THREE.Vector3(x + Math.cos(angle) * lean, height, z + Math.sin(angle) * lean);
    const base = positions.length / 3;
    positions.push(x - side.x, 0, z - side.z, x + side.x, 0, z + side.z, tip.x + side.x * 0.32, tip.y, tip.z + side.z * 0.32, tip.x - side.x * 0.32, tip.y, tip.z - side.z * 0.32);
    const dryMix = random() < texture.dryVariation ? 0.42 : 0;
    const root = rootColor.clone().lerp(dryColor, dryMix);
    const tipC = tipColor.clone().lerp(dryColor, dryMix * 0.7);
    colors.push(root.r, root.g, root.b, root.r, root.g, root.b, tipC.r, tipC.g, tipC.b, tipC.r, tipC.g, tipC.b);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeGrassBatches(placement, textureDescriptor, windDescriptor) {
  const group = new THREE.Group();
  const patchesByKey = new Map();
  for (const patch of placement.patches) {
    const key = patch.render.geometryTemplateKey;
    if (!patchesByKey.has(key)) patchesByKey.set(key, []);
    patchesByKey.get(key).push(patch);
  }
  const templateBudgets = { "dense-a": 900, "dense-b": 720, "dense-c": 560 };
  let templateIndex = 0;
  for (const [key, patches] of patchesByKey) {
    const bladeCount = Math.max(160, Math.round((templateBudgets[key] ?? 720) / 3));
    const geometry = createGrassPatchGeometry({ bladeCount, radius: 1.85, seed: 101 + templateIndex * 37, texture: textureDescriptor });
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, side: THREE.DoubleSide });
    const mesh = new THREE.InstancedMesh(geometry, material, patches.length);
    mesh.userData.wind = windDescriptor;
    mesh.userData.baseMatrices = [];
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    patches.forEach((patch, index) => {
      position.set(patch.transform.position.x, patch.transform.position.y + 0.04, patch.transform.position.z);
      quat.setFromEuler(new THREE.Euler(0, patch.transform.rotation.y, 0));
      scale.set(patch.transform.scale.x, 1, patch.transform.scale.z);
      matrix.compose(position, quat, scale);
      mesh.setMatrixAt(index, matrix);
      mesh.userData.baseMatrices[index] = matrix.clone();
    });
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
    templateIndex += 1;
  }
  return group;
}

function createCloudMaterial(seed = 0, layer = 0) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: { uTime: { value: 0 }, uCameraLocal: { value: new THREE.Vector3() }, uSeed: { value: seed }, uDensity: { value: layer === 2 ? 0.42 : 0.62 }, uColor: { value: new THREE.Color(layer === 2 ? 0xf6fbff : 0xfff7e8) } },
    vertexShader: `varying vec3 vLocal; void main(){ vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `precision highp float; varying vec3 vLocal; uniform vec3 uCameraLocal; uniform vec3 uColor; uniform float uTime; uniform float uSeed; uniform float uDensity; float hash(vec3 p){ p=fract(p*.3183099+vec3(.1,.2,.3)+uSeed*.01); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); } float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); } float fbm(vec3 p){ float a=.5; float s=0.; for(int i=0;i<3;i++){ s+=noise(p)*a; p=p*2.02+vec3(11.7,3.2,8.1); a*=.52; } return s; } vec2 hitBox(vec3 ro, vec3 rd){ vec3 m=1./rd; vec3 n=m*(vec3(-.5)-ro); vec3 k=m*(vec3(.5)-ro); vec3 t1=min(n,k); vec3 t2=max(n,k); return vec2(max(max(t1.x,t1.y),t1.z),min(min(t2.x,t2.y),t2.z)); } void main(){ vec3 ro=uCameraLocal; vec3 rd=normalize(vLocal-ro); vec2 h=hitBox(ro,rd); if(h.x>h.y) discard; float t=max(h.x,0.); float e=h.y; vec3 sum=vec3(0.); float alpha=0.; for(int i=0;i<12;i++){ float ft=float(i)/11.; vec3 p=ro+rd*mix(t,e,ft); float edge=smoothstep(.5,.12,length(p*vec3(1.,1.45,1.))); float billow=fbm(p*2.5+vec3(uTime*.02,0.,uTime*.01)); float d=max(0.,(billow-.32)*edge)*uDensity*.2; float a=d*(1.-alpha); sum+=uColor*a; alpha+=a; if(alpha>.86) break; } if(alpha<.015) discard; gl_FragColor=vec4(sum/max(alpha,.001),alpha*.72); }`
  });
}

function makeCloud(descriptor, layer = 0, index = 0) {
  const material = createCloudMaterial(index * 17 + layer * 101, layer);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  mesh.scale.set((descriptor.scale?.x || 300) * 4.6, (descriptor.scale?.y || 90) * 1.35, (descriptor.scale?.z || 230) * 4.0);
  mesh.position.set((descriptor.position?.x || 0) * 0.52, Math.max(135, (descriptor.position?.y || 600) * 0.5), (descriptor.position?.z || 0) * 0.52);
  mesh.userData.speed = descriptor.driftSpeed || 0.04;
  mesh.userData.drift = descriptor.drift || { x: 1, z: 0.2 };
  mesh.userData.material = material;
  return mesh;
}

function makeWaterMaterial(config = {}) {
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(config.color || "#22b9c9"), transparent: true, opacity: 0.75, roughness: 0.16, metalness: 0.12, reflectivity: 0.88, clearcoat: 0.72, clearcoatRoughness: 0.08, transmission: 0, envMapIntensity: 1.8 });
}

async function main() {
  const islandState = landformDomain.createOceanIslandLandformState({ id: "cozy-island-001", seed: "cozy-island-domain-cutover", preset: "tropical-small-island", radius: ISLAND_RADIUS_METERS, maxHeight: 18, beachWidth: 10, shelfWidth: 36, shelfDepth: 110, objectPalette: [], render: { heightfieldResolution: 129, shorelineSegments: 128 } });
  const landform = landformDomain.createOceanIslandLandformRenderContract(islandState, { heightfield: { resolution: 129 }, shoreline: { segments: 128 }, objects: { densityScale: 0 } });
  const sampleHeight = (point) => landformDomain.sampleIslandHeight(islandState, { x: point.x, z: point.z });
  const sampleMasks = (point) => landformDomain.sampleIslandMasks(islandState, { x: point.x, z: point.z });
  const campfireY = sampleHeight({ x: 0, z: 0 });
  const clearing = fencedClearingDomain.createFencedClearingGraph({ parentId: "island:cozy-001", position: { x: 0, y: campfireY, z: 0 }, fenceRadiusMeters: 12, clearingRadiusMeters: 9.5, campfireRadiusMeters: 2.25 });
  const avatarRecord = clearing.byId["central-clearing:campfire:player-avatar-anchor"] ?? { transform: { position: { x: 0, y: campfireY, z: 6 }, rotation: { y: 0 } }, state: { eyeHeightMeters: 1.7 } };
  const graph = foliageDomain.createDenseCozyIslandObjectGraph({ seed: "cozy-island-domain-cutover", radiusMeters: ISLAND_RADIUS_METERS, sampleHeight, sampleMasks });
  const foliageRender = foliageDomain.createDenseCozyIslandRenderContract({ graph, landformContract: landform, seaFloorY: SEA_FLOOR_Y });
  const campfireGraph = campfireDomain.createCampfireObjectGraph({ parentId: graph.rootId, position: { x: 0, y: campfireY, z: 0 }, radiusMeters: 1.45, intensity: 0.86, smoke: true });
  const floorState = oceanFloorDomain.createOceanFloorState({ seed: "cozy-island-ocean-floor", size: 3600, resolution: 53, baseDepth: SEA_FLOOR_Y, islandRadius: ISLAND_RADIUS_METERS, islandShelfRadius: 145, islandInfluenceRadius: 260, shelfDepth: -16, moundDepth: -42, noiseAmplitude: 9, objects: { seaFloorRocks: 34, seaFloorBoulders: 12, reefClusters: 14, coralClusters: 18 } });
  const oceanFloor = oceanFloorDomain.createOceanFloorRenderContract(floorState, { heightfield: { resolution: 53 }, objects: {} });
  const grassTexture = grassTextureDomain.createGrassTextureDescriptor({ id: "dense-cozy-grass-texture" });
  const grassWind = grassWindDomain.createGrassWindDescriptor({ id: "central-grove-soft-wind", phaseSeed: "cozy-island-grass", baseSway: 0.16, gustStrength: 0.34 });
  const smoke = smokeDomain.createSmokeParticleDescriptor({ parentId: campfireGraph.rootId, position: { x: 0, y: campfireY + 1.25, z: 0 }, wind: { ...grassWind, response: 0.78 }, particleCount: 96, riseSpeed: 1.2 });
  const grassPlacement = grassObjectDomain.createGrassPatchPlacementContract({ seed: "cozy-island-grass", count: GRASS_PATCH_COUNT, radiusMeters: ISLAND_RADIUS_METERS, sampleHeight, sampleMasks, pathNetwork: graph.pathNetwork, avoidObjects: graph.objects, exclusionZones: clearing.clearanceZones, pathClearance: 3.6, objectClearance: 1.15 });
  const grassBatches = grassObjectDomain.createGrassPatchBatchDescriptors(grassPlacement.patches);
  const cloudState = cloudDomain.createMattatzCloudsState({ seed: "cozy-island-clouds", weather: "sunrise-haze", cloudCount: CLOUD_COUNT });
  const cloudContract = cloudDomain.createMattatzCloudRenderContract(cloudState, 0);
  const cameraDescriptor = cameraModeDomain.createCameraModeDescriptor({ radius: 420, thresholds: { orbitMin: 260, firstPersonEnter: 90 }, firstPerson: { moveSpeed: 2.6, eyeHeightMeters: 1.7 } });

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

  scene.add(makeOceanFloor(oceanFloor.heightfield));
  scene.add(makeSeaFloorObjects(oceanFloor.objects));
  scene.add(makeTerrain(landform.heightfield));
  const water = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600, 32, 32).rotateX(-Math.PI / 2), makeWaterMaterial(oceanFloor.waterMaterial));
  water.position.y = -0.08;
  const grassGroup = makeGrassBatches(grassPlacement, grassTexture, grassWind);
  const campfireGroup = makeCampfire(campfireGraph);
  const smokePoints = makeSmokeParticles(smoke);
  const avatarGroup = makeAvatar(avatarRecord);
  const objectExclusionZones = clearing.objectExclusionZones ?? [{ center: { x: 0, z: 0 }, radius: 11.2 }];
  scene.add(water, makeFoam(landform.shoreline), makePath(graph.pathNetwork, sampleHeight), makeObjects(graph, objectExclusionZones), makeFence(clearing), campfireGroup, smokePoints, avatarGroup, grassGroup);
  const cloudGroup = new THREE.Group();
  cloudContract.clouds.slice(0, CLOUD_COUNT).forEach((descriptor, index) => cloudGroup.add(makeCloud(descriptor, descriptor.layerId?.includes("high") ? 2 : descriptor.layerId?.includes("mid") ? 1 : 0, index)));
  scene.add(cloudGroup);

  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.16, radius: 420, target: new THREE.Vector3(0, 20, 0) };
  const avatarBase = new THREE.Vector3(avatarRecord.transform.position.x, avatarRecord.transform.position.y, avatarRecord.transform.position.z);
  const avatarEye = () => new THREE.Vector3(avatarBase.x, sampleHeight(avatarBase) + (avatarRecord.state.eyeHeightMeters || 1.7), avatarBase.z);
  const avatarForward = new THREE.Vector3(0, 0, -1);
  const fp = { active: false, yaw: 0, pitch: 0, position: avatarEye() };
  const transition = { active: false, started: 0, duration: 1550, startPos: new THREE.Vector3(), startLook: new THREE.Vector3(), shoulder: new THREE.Vector3(), head: new THREE.Vector3(), eye: new THREE.Vector3() };
  let drag = null;

  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize();
  addEventListener("resize", resize);
  addEventListener("keydown", (event) => keys.add(event.code));
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    if ((fp.active || transition.active) && event.deltaY > 0) {
      fp.active = false;
      transition.active = false;
      avatarGroup.visible = true;
      rig.radius = 125;
      rig.target.set(0, campfireY + 5.2, 0);
      return;
    }
    if (!fp.active && !transition.active) rig.radius = Math.max(40, Math.min(900, rig.radius + event.deltaY * 0.75));
  }, { passive: false });
  canvas.addEventListener("pointerdown", (event) => { drag = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (fp.active) {
      fp.yaw -= dx * cameraDescriptor.firstPerson.lookSensitivity;
      fp.pitch = Math.max(-1.1, Math.min(1.0, fp.pitch - dy * cameraDescriptor.firstPerson.lookSensitivity));
    } else if (!transition.active) {
      rig.yaw -= dx * 0.0045;
      rig.pitch = Math.max(-0.75, Math.min(0.2, rig.pitch - dy * 0.0035));
    }
    drag = { x: event.clientX, y: event.clientY };
  });

  let last = performance.now();
  const swayMatrix = new THREE.Matrix4();
  const swayPos = new THREE.Vector3();
  const swayQuat = new THREE.Quaternion();
  const swayScale = new THREE.Vector3();

  function animateGrass(now) {
    grassGroup.children.forEach((mesh, batchIndex) => {
      const wind = mesh.userData.wind;
      const base = mesh.userData.baseMatrices || [];
      const sway = Math.sin(now * 0.0018 + batchIndex * 1.7) * wind.baseSway * 0.035;
      for (let index = 0; index < base.length; index += 1) {
        base[index].decompose(swayPos, swayQuat, swayScale);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(sway * (1 + (index % 5) * 0.12), sway * 0.25, 0));
        swayMatrix.compose(swayPos, swayQuat.multiply(q), swayScale);
        mesh.setMatrixAt(index, swayMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  function validFirstPersonPosition(next) {
    const radius = Math.hypot(next.x, next.z);
    const max = clearing.byId["central-clearing:campfire:collision-boundary"].state.radiusMeters;
    if (radius > max) return false;
    if (Math.hypot(next.x, next.z) < 2.35) return false;
    return true;
  }

  function updateFirstPerson(dt) {
    const forward = new THREE.Vector3(-Math.sin(fp.yaw), 0, -Math.cos(fp.yaw));
    const right = new THREE.Vector3(Math.cos(fp.yaw), 0, -Math.sin(fp.yaw));
    const move = new THREE.Vector3();
    if (keys.has("KeyW")) move.add(forward); if (keys.has("KeyS")) move.sub(forward); if (keys.has("KeyD")) move.add(right); if (keys.has("KeyA")) move.sub(right);
    if (move.lengthSq()) {
      const next = fp.position.clone().add(move.normalize().multiplyScalar(cameraDescriptor.firstPerson.moveSpeed * dt));
      next.y = sampleHeight(next) + cameraDescriptor.firstPerson.eyeHeightMeters;
      if (validFirstPersonPosition(next)) fp.position.copy(next);
    }
    const look = new THREE.Vector3(-Math.sin(fp.yaw) * Math.cos(fp.pitch), Math.sin(fp.pitch), -Math.cos(fp.yaw) * Math.cos(fp.pitch));
    camera.position.copy(fp.position);
    camera.lookAt(fp.position.clone().add(look));
  }

  function updateOrbitOrInspection(dt, mode) {
    const f = new THREE.Vector3(-Math.sin(rig.yaw), 0, -Math.cos(rig.yaw));
    const r = new THREE.Vector3(Math.cos(rig.yaw), 0, -Math.sin(rig.yaw));
    const move = new THREE.Vector3();
    if (keys.has("KeyW")) move.add(f); if (keys.has("KeyS")) move.sub(f); if (keys.has("KeyD")) move.add(r); if (keys.has("KeyA")) move.sub(r);
    if (move.lengthSq()) { rig.target.add(move.normalize().multiplyScalar(38 * dt)); rig.target.y = Math.max(9, sampleHeight(rig.target) + 11); }
    const campfireFocus = new THREE.Vector3(0, campfireY + 4.8, 0);
    const avatarFocus = avatarEye().add(new THREE.Vector3(0, 0.35, 0));
    const inspectT = clamp01((260 - rig.radius) / 170);
    if (mode === "inspection") rig.target.lerp(avatarFocus.clone().lerp(campfireFocus, 0.35), 0.065);
    const minHeight = THREE.MathUtils.lerp(76, 24, inspectT);
    const offset = new THREE.Vector3(Math.sin(rig.yaw) * Math.cos(rig.pitch) * rig.radius, Math.max(minHeight, Math.sin(-rig.pitch + 0.46) * rig.radius * 0.42), Math.cos(rig.yaw) * Math.cos(rig.pitch) * rig.radius);
    camera.position.copy(rig.target).add(offset);
    camera.lookAt(rig.target);
  }

  function startAvatarTakeover(now) {
    transition.active = true;
    transition.started = now;
    transition.startPos.copy(camera.position);
    transition.startLook.copy(rig.target);
    const eye = avatarEye();
    transition.eye.copy(eye);
    transition.shoulder.copy(eye).add(new THREE.Vector3(0, 2.4, 4.2));
    transition.head.copy(eye).add(new THREE.Vector3(0, 0.45, 1.15));
    avatarGroup.visible = true;
  }

  function updateAvatarTakeover(now) {
    const t = clamp01((now - transition.started) / transition.duration);
    let position;
    if (t < 0.55) position = lerpVec(transition.startPos, transition.shoulder, t / 0.55);
    else if (t < 0.84) position = lerpVec(transition.shoulder, transition.head, (t - 0.55) / 0.29);
    else position = lerpVec(transition.head, transition.eye, (t - 0.84) / 0.16);
    const campfireLook = new THREE.Vector3(0, campfireY + 1.15, 0);
    const eyeLook = transition.eye.clone().add(avatarForward);
    const lookTarget = transition.startLook.clone().lerp(campfireLook, smoother(Math.min(t * 1.3, 1))).lerp(eyeLook, smoother(Math.max(0, (t - 0.78) / 0.22)));
    camera.position.copy(position);
    camera.lookAt(lookTarget);
    avatarGroup.visible = t < 0.92;
    if (t >= 1) {
      transition.active = false;
      fp.active = true;
      fp.position.copy(transition.eye);
      fp.yaw = 0;
      fp.pitch = 0;
      avatarGroup.visible = false;
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    water.position.y = -0.08 + Math.sin(now * 0.0012) * 0.18;
    const resolvedMode = cameraModeDomain.resolveCameraMode(rig.radius, cameraDescriptor.thresholds);
    if (fp.active) updateFirstPerson(dt);
    else if (transition.active) updateAvatarTakeover(now);
    else if (resolvedMode === "first-person") startAvatarTakeover(now);
    else updateOrbitOrInspection(dt, resolvedMode);
    animateGrass(now);
    updateSmokeParticles(smokePoints, dt, now);
    const flamePulse = 1 + Math.sin(now * 0.011) * 0.12;
    campfireGroup.userData.flames?.forEach((flame, index) => flame.scale.setScalar(flamePulse + Math.sin(now * 0.014 + index) * 0.08));
    if (campfireGroup.userData.light) campfireGroup.userData.light.intensity = 1.55 + Math.sin(now * 0.01) * 0.35;
    cloudGroup.children.forEach((cloud, index) => {
      cloud.position.x += (cloud.userData.drift?.x || 1) * cloud.userData.speed * dt * 18;
      cloud.position.z += (cloud.userData.drift?.z || 0) * cloud.userData.speed * dt * 18;
      cloud.userData.material.uniforms.uTime.value = now * 0.001;
      cloud.worldToLocal(cloud.userData.material.uniforms.uCameraLocal.value.copy(camera.position));
      cloud.rotation.y = Math.sin(now * 0.00008 + index) * 0.04;
    });
    const visibleMode = transition.active ? "entering-first-person" : fp.active ? "first-person" : resolvedMode;
    hud.innerHTML = `<strong>Cozy Island</strong><br>WASD move · drag look/orbit · wheel zoom/exit<br>${visibleMode} · avatar takeover · smoke ${smoke.particleCount} · grass ${grassPlacement.patchCount}/${grassBatches.length} · clouds ${Math.min(CLOUD_COUNT, cloudContract.clouds.length)}`;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  globalThis.CozyIsland = { islandState, landform, graph, foliageRender, oceanFloor, grassTexture, grassWind, grassPlacement, grassBatches, clearing, campfireGraph, smoke, cloudContract, cameraDescriptor };
  requestAnimationFrame(frame);
}

main().catch(fail);
