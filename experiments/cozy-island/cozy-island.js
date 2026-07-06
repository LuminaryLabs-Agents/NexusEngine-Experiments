const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const err = document.querySelector("#error");
const SEA_FLOOR_Y = -96;
const CLOUD_COUNT = 6;

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
  const d = Math.hypot(x, z) / (155 * coast);
  const n = Math.max(0, 1 - d);
  return Math.pow(n, 0.72) * 42 + Math.sin(x * 0.045) * Math.sin(z * 0.034) * 3 * n;
}

function fallbackMasks(x, z) {
  const h = fallbackHeight(x, z);
  const d = Math.hypot(x, z);
  return { height: h, water: d > 165 ? 1 : 0, beach: d > 130 && d <= 165 ? 1 : 0, grass: d <= 130 && h < 32 ? 1 : 0, rock: h >= 32 ? 1 : 0, cliff: h > 38 ? 1 : 0, wetSand: d > 153 && d <= 168 ? 1 : 0, foam: Math.max(0, 1 - Math.abs(d - 165) / 14) };
}

function fallbackIslandContract() {
  const resolution = 129;
  const extent = 300;
  const samples = [];
  for (let zi = 0; zi < resolution; zi++) for (let xi = 0; xi < resolution; xi++) {
    const x = (xi / (resolution - 1) * 2 - 1) * extent;
    const z = (zi / (resolution - 1) * 2 - 1) * extent;
    const masks = fallbackMasks(x, z);
    samples.push({ x, y: masks.height, z, masks });
  }
  const shoreline = Array.from({ length: 128 }, (_, i) => {
    const a = i / 128 * Math.PI * 2;
    const r = 165 * (1 + Math.sin(a * 5) * 0.1 + Math.cos(a * 9) * 0.05);
    return { x: Math.cos(a) * r, y: 0.04, z: Math.sin(a) * r };
  });
  const objectIds = ["palm", "palm", "bush", "rock", "boulder", "driftwood", "reef"];
  const objects = Array.from({ length: 40 }, (_, i) => {
    const id = objectIds[i % objectIds.length];
    const a = i * 2.399;
    const r = id === "reef" ? 205 : id === "driftwood" ? 156 : 38 + (i * 29 % 92);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    return { objectId: id, position: { x, y: fallbackHeight(x, z), z }, rotation: a, scale: 0.48 + (i % 7) * 0.11 };
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
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.015 }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function makeSeaFloor(size = 3600, y = SEA_FLOOR_Y) {
  const g = new THREE.PlaneGeometry(size, size, 36, 36).rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const ripple = Math.sin(x * 0.006) * Math.cos(z * 0.005) * 3 + Math.sin((x + z) * 0.002) * 5;
    p.setY(i, y + ripple);
  }
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x286b72, roughness: 0.96, metalness: 0.0 }));
  mesh.receiveShadow = true;
  return mesh;
}

function makeIslandFormation(shoreline, floorY = SEA_FLOOR_Y) {
  const rings = [1, 1.16, 1.42, 1.78, 2.08];
  const depths = [0.02, -24, -58, floorY - 8, floorY - 24];
  const pos = [];
  const idx = [];
  for (let r = 0; r < rings.length; r++) {
    for (const p of shoreline) pos.push(p.x * rings[r], depths[r], p.z * rings[r]);
  }
  const n = shoreline.length;
  for (let r = 0; r < rings.length - 1; r++) {
    const a0 = r * n;
    const b0 = (r + 1) * n;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(a0 + i, b0 + i, a0 + j, a0 + j, b0 + i, b0 + j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x627265, roughness: 0.94, metalness: 0.01 }));
  mesh.receiveShadow = true;
  return mesh;
}

function makeFoam(shoreline) {
  const pts = shoreline.map(p => new THREE.Vector3(p.x, (p.y || 0) + 0.08, p.z));
  pts.push(pts[0].clone());
  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), shoreline.length, 0.75, 5, true),
    new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: 0.38, depthWrite: false })
  );
}

function makePalm() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.45, 7), new THREE.MeshStandardMaterial({ color: 0x815838, roughness: 0.88 }));
  trunk.position.y = 0.72;
  trunk.rotation.z = 0.12;
  group.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f8f52, roughness: 0.86, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.88, 4), leafMat);
    leaf.position.y = 1.42;
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
    const geometry = d.objectId === "driftwood" ? new THREE.CapsuleGeometry(0.08, 0.7, 4, 8) : new THREE.DodecahedronGeometry(d.objectId === "reef" ? 0.24 : 0.35, 0);
    object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  }
  object.position.set(d.position.x, d.position.y, d.position.z);
  object.rotation.y = d.rotation || 0;
  object.scale.setScalar(d.scale || 1);
  object.traverse?.(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
  return object;
}

function createCloudMaterial(seed = 0, layer = 0) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      uTime: { value: 0 },
      uCameraLocal: { value: new THREE.Vector3() },
      uSeed: { value: seed },
      uDensity: { value: layer === 2 ? 0.44 : 0.66 },
      uColor: { value: new THREE.Color(layer === 2 ? 0xf6fbff : 0xfff7e8) }
    },
    vertexShader: `varying vec3 vLocal; void main(){ vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      precision highp float;
      varying vec3 vLocal;
      uniform vec3 uCameraLocal;
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uSeed;
      uniform float uDensity;
      float hash(vec3 p){ p = fract(p * 0.3183099 + vec3(.1,.2,.3) + uSeed*.01); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f); float n=mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); return n; }
      float fbm(vec3 p){ float a=.5; float s=0.0; for(int i=0;i<3;i++){ s += noise(p)*a; p = p*2.02 + vec3(11.7,3.2,8.1); a *= .52; } return s; }
      vec2 hitBox(vec3 ro, vec3 rd){ vec3 m=1.0/rd; vec3 n=m*(vec3(-0.5)-ro); vec3 k=m*(vec3(0.5)-ro); vec3 t1=min(n,k); vec3 t2=max(n,k); return vec2(max(max(t1.x,t1.y),t1.z), min(min(t2.x,t2.y),t2.z)); }
      void main(){
        vec3 ro = uCameraLocal;
        vec3 rd = normalize(vLocal - ro);
        vec2 h = hitBox(ro, rd);
        if(h.x > h.y) discard;
        float t = max(h.x, 0.0);
        float endT = h.y;
        vec3 sum = vec3(0.0);
        float alpha = 0.0;
        for(int i=0;i<14;i++){
          float ft = float(i) / 13.0;
          vec3 p = ro + rd * mix(t, endT, ft);
          float edge = smoothstep(0.5, 0.12, length(p * vec3(1.0, 1.45, 1.0)));
          float billow = fbm(p * 2.6 + vec3(uTime*.02, 0.0, uTime*.01));
          float d = max(0.0, (billow - 0.32) * edge) * uDensity * 0.18;
          float a = d * (1.0 - alpha);
          sum += uColor * a;
          alpha += a;
          if(alpha > 0.88) break;
        }
        if(alpha < 0.015) discard;
        gl_FragColor = vec4(sum / max(alpha, 0.001), alpha * 0.74);
      }`
  });
}

function makeCloud(d, layer = 0, index = 0) {
  const mat = createCloudMaterial(index * 17 + layer * 101, layer);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 1, 1, 1), mat);
  const sx = (d.scale?.x || 250) * (layer === 2 ? 4.8 : 4.2);
  const sy = (d.scale?.y || 80) * (layer === 2 ? 1.2 : 1.55);
  const sz = (d.scale?.z || 160) * (layer === 2 ? 4.2 : 3.85);
  mesh.scale.set(sx, sy, sz);
  mesh.position.set((d.position?.x || 0) * 0.54, Math.max(135, (d.position?.y || 600) * 0.5), (d.position?.z || 0) * 0.54);
  mesh.userData.speed = d.driftSpeed || 0.05;
  mesh.userData.drift = d.drift || { x: 1, z: 0 };
  mesh.userData.material = mat;
  return mesh;
}

function fallbackClouds() {
  return Array.from({ length: CLOUD_COUNT }, (_, i) => ({ position: { x: Math.cos(i * 2.17) * 520, y: 240 + (i % 3) * 180, z: Math.sin(i * 1.77) * 480 }, scale: { x: 320 + (i % 3) * 80, y: 86 + (i % 2) * 24, z: 220 + (i % 3) * 64 }, layerId: i % 3 === 2 ? "high" : i % 3 === 1 ? "mid" : "low", driftSpeed: 0.035 + (i % 3) * 0.008, drift: { x: 1, z: 0.22 } }));
}

async function main() {
  const domains = await loadDomains();
  const islandState = domains.island?.createOceanIslandLandformState?.({ seed: "cozy-island-three", preset: "tropical-small-island", radius: 195, maxHeight: 42, beachWidth: 28, shelfWidth: 72, shelfDepth: 110, objectPalette: ["palm", "palm", "bush", "rock", "boulder", "driftwood", "reef"] });
  const island = islandState ? domains.island.createOceanIslandLandformRenderContract(islandState, { heightfield: { resolution: 129 }, shoreline: { segments: 128 }, objects: { densityScale: 0.34 } }) : fallbackIslandContract();
  const cloudState = domains.clouds?.createMattatzCloudsState?.({ seed: "cozy-island-clouds", weather: "sunrise-haze", cloudCount: CLOUD_COUNT });
  const rawClouds = cloudState ? domains.clouds.createMattatzCloudRenderContract(cloudState, 0).clouds : fallbackClouds();
  const cloudContract = { clouds: rawClouds.slice(0, CLOUD_COUNT) };
  const sampleHeight = domains.island?.sampleIslandHeight ? point => domains.island.sampleIslandHeight(islandState, point) : point => fallbackHeight(point.x, point.z);
  const sampleMasks = domains.island?.sampleIslandMasks ? point => domains.island.sampleIslandMasks(islandState, point) : point => fallbackMasks(point.x, point.z);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3cfa6);
  scene.fog = new THREE.FogExp2(0xf3cfa6, 0.00072);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 6800);
  scene.add(new THREE.HemisphereLight(0xfff7e9, 0x2d5b64, 1.55));
  const sun = new THREE.DirectionalLight(0xffe1a3, 4.1);
  sun.position.set(-320, 520, 260);
  scene.add(sun);

  scene.add(makeSeaFloor(3600, SEA_FLOOR_Y));
  scene.add(makeIslandFormation(island.shoreline, SEA_FLOOR_Y));
  const terrain = makeTerrain(island);
  scene.add(terrain);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600, 32, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3bb6c8, transparent: true, opacity: 0.64, roughness: 0.48, metalness: 0.02 }));
  water.position.y = -0.08;
  scene.add(water, makeFoam(island.shoreline));
  for (const d of island.objects.slice(0, 40)) scene.add(makeProp(d));
  const cloudGroup = new THREE.Group();
  cloudContract.clouds.forEach((d, i) => cloudGroup.add(makeCloud(d, d.layerId?.includes("high") ? 2 : d.layerId?.includes("mid") ? 1 : 0, i)));
  scene.add(cloudGroup);

  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.16, radius: 520, target: new THREE.Vector3(0, 24, 0) };
  let drag = null;
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize();
  addEventListener("resize", resize);
  addEventListener("keydown", event => keys.add(event.code));
  addEventListener("keyup", event => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  canvas.addEventListener("wheel", event => { event.preventDefault(); rig.radius = Math.max(180, Math.min(1100, rig.radius + event.deltaY * 0.9)); }, { passive: false });
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
    if (move.lengthSq()) { rig.target.add(move.normalize().multiplyScalar(62 * dt)); rig.target.y = Math.max(14, sampleHeight(rig.target) + 18); }
    water.position.y = -0.08 + Math.sin(now * 0.0012) * 0.18;
    const off = new THREE.Vector3(Math.sin(rig.yaw) * Math.cos(rig.pitch) * rig.radius, Math.max(95, Math.sin(-rig.pitch + 0.46) * rig.radius * 0.42), Math.cos(rig.yaw) * Math.cos(rig.pitch) * rig.radius);
    camera.position.copy(rig.target).add(off);
    camera.lookAt(rig.target);
    cloudGroup.children.forEach((c, i) => {
      c.position.x += (c.userData.drift?.x || 1) * c.userData.speed * dt * 22;
      c.position.z += (c.userData.drift?.z || 0) * c.userData.speed * dt * 22;
      c.rotation.y = Math.sin(now * 0.00008 + i) * 0.04;
      c.userData.material.uniforms.uTime.value = now * 0.001;
      c.worldToLocal(c.userData.material.uniforms.uCameraLocal.value.copy(camera.position));
    });
    const m = sampleMasks(rig.target);
    hud.innerHTML = `<strong>Cozy Island</strong><br>WASD drift · drag orbit · wheel zoom<br>${domains.source} landform · deep formation to ${SEA_FLOOR_Y}m · low-res seafloor · clouds ${cloudContract.clouds.length} · foam ${Math.round((m.foam || 0) * 100)}%`;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  globalThis.CozyIsland = { islandState, island, cloudState, cloudContract, source: domains.source, seaFloorY: SEA_FLOOR_Y };
  requestAnimationFrame(frame);
}

main().catch(fail);
