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

function indexed(samples, res, colorFor, material) {
  const p = [], c = [], idx = [];
  for (const s of samples) { p.push(s.x, s.y, s.z); const col = colorFor(s); c.push(col.r, col.g, col.b); }
  for (let z = 0; z < res - 1; z++) for (let x = 0; x < res - 1; x++) { const a = z * res + x; idx.push(a, a + res, a + 1, a + 1, a + res, a + res + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}

function terrain(h) {
  return indexed(h.samples, h.resolution, (s) => { const m = s.masks || {}; return new THREE.Color(m.wetSand ? 0xcaa46b : m.beach ? 0xe7ca91 : m.cliff || m.rock ? 0x817d6d : 0x4f8d4d); }, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 }));
}
function oceanFloorMesh(h) { return indexed(h.samples, h.resolution, (s) => new THREE.Color(s.masks?.reefBand ? 0x3d8176 : s.masks?.shallowShelf ? 0x4b8b7a : 0x235b67), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .96 })); }
function water(config = {}) { const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(config.color || "#22b9c9"), transparent: true, opacity: .75, roughness: .16, metalness: .12, reflectivity: .88, clearcoat: .72, clearcoatRoughness: .08, envMapIntensity: 1.8 }); const m = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600, 32, 32).rotateX(-Math.PI / 2), mat); m.position.y = -.08; return m; }
function foam(shoreline) { const pts = shoreline.map((p) => new THREE.Vector3(p.x, (p.y || 0) + .08, p.z)); pts.push(pts[0].clone()); return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), shoreline.length, .65, 5, true), new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: .36, depthWrite: false })); }
function pathMesh(path, sampleHeight) { const group = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xb89564, roughness: .96, transparent: true, opacity: .86 }); for (const s of path.segments) { const a = new THREE.Vector3(s.from.x, sampleHeight(s.from) + .12, s.from.z), b = new THREE.Vector3(s.to.x, sampleHeight(s.to) + .12, s.to.z); const d = new THREE.Vector3().subVectors(b, a), side = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(s.width * .5); const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([a.x + side.x, a.y, a.z + side.z, a.x - side.x, a.y, a.z - side.z, b.x + side.x, b.y, b.z + side.z, b.x - side.x, b.y, b.z - side.z], 3)); g.setIndex([0, 1, 2, 2, 1, 3]); g.computeVertexNormals(); group.add(new THREE.Mesh(g, mat)); } return group; }
function inZone(pos, zones = [], margin = 0) { return zones.some((z) => { const c = z.center || z.position || { x: 0, z: 0 }; return Math.hypot(pos.x - c.x, pos.z - c.z) < (z.radius || z.radiusMeters || 0) + margin; }); }
function childMap(objects) { const m = new Map(); for (const o of objects) { if (!o.parentId) continue; if (!m.has(o.parentId)) m.set(o.parentId, []); m.get(o.parentId).push(o); } return m; }

function palm(o, by) { const g = new THREE.Group(), h = o.state?.heightMeters || 7; const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.14, .24, h, 8), new THREE.MeshStandardMaterial({ color: 0x815838, roughness: .88 })); trunk.position.y = h * .5; trunk.rotation.z = o.state?.lean || 0; g.add(trunk); const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f8f52, roughness: .86, side: THREE.DoubleSide }); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(.22, h * .34, 4), leafMat); l.position.y = h * .96; l.rotation.z = Math.PI / 2.8; l.rotation.y = i / 7 * Math.PI * 2; l.scale.set(1, .42, 1); g.add(l); } const cluster = (by.get(o.id) || []).find((c) => c.type === "coconut-cluster"), mat = new THREE.MeshStandardMaterial({ color: 0x8a5b32, roughness: .8 }); for (const c of by.get(cluster?.id) || []) { const mesh = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), mat); mesh.position.set(c.transform.position.x, c.transform.position.y, c.transform.position.z); g.add(mesh); } g.position.set(o.transform.position.x, o.transform.position.y, o.transform.position.z); g.rotation.y = o.transform.rotation.y || 0; g.scale.setScalar(o.transform.scale.x || 1); return g; }
function tree(o) { const g = new THREE.Group(), h = o.state?.heightMeters || 9, cr = o.state?.canopyRadiusMeters || 3.4; const tr = new THREE.Mesh(new THREE.CylinderGeometry(.18, .34, h * .72, 8), new THREE.MeshStandardMaterial({ color: 0x6f4b30, roughness: .9 })); tr.position.y = h * .36; const crown = new THREE.Mesh(new THREE.SphereGeometry(cr, 12, 8), new THREE.MeshStandardMaterial({ color: o.type === "young-tree" ? 0x4e9b50 : 0x3f8f45, roughness: .9 })); crown.position.y = h * .78; crown.scale.y = .72; g.add(tr, crown); g.position.set(o.transform.position.x, o.transform.position.y, o.transform.position.z); g.rotation.y = o.transform.rotation.y || 0; g.scale.setScalar(o.transform.scale.x || 1); return g; }
function simple(o) { const color = o.type === "bush" ? 0x3e8f45 : o.type === "fern" ? 0x2e7c4a : o.type.includes("wood") || o.type === "fallen-log" ? 0x8a6844 : 0x77756a; const geo = o.type === "fern" ? new THREE.ConeGeometry(.18, .75, 5) : o.type === "bush" ? new THREE.SphereGeometry(.42, 8, 6) : new THREE.DodecahedronGeometry(.38, 0); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: .9 })); m.position.set(o.transform.position.x, o.transform.position.y, o.transform.position.z); m.rotation.y = o.transform.rotation.y || 0; m.scale.setScalar(o.transform.scale.x || 1); return m; }
function islandObjects(graph, exclusion) { const group = new THREE.Group(), by = childMap(graph.objects), types = new Set(["palm-tree", "broadleaf-tree", "young-tree", "bush", "fern", "fallen-log", "rock", "boulder", "driftwood", "reef", "coral"]); for (const o of graph.objects) { if (!types.has(o.type) || inZone(o.transform.position, exclusion, .35)) continue; group.add(o.type === "palm-tree" ? palm(o, by) : o.type.includes("tree") ? tree(o) : simple(o)); } return group; }
function seaObjects(list) { const group = new THREE.Group(); for (const o of list) { const mat = new THREE.MeshStandardMaterial({ color: o.type === "reef-cluster" ? 0xd78367 : o.type === "coral-cluster" ? 0xf0a58c : 0x667b78, roughness: .88 }); const m = new THREE.Mesh(new THREE.DodecahedronGeometry(o.type === "sea-floor-boulder" ? .9 : .45, 0), mat); m.position.set(o.position.x, o.position.y + .2, o.position.z); m.rotation.y = o.rotation || 0; m.scale.setScalar(o.scale || 1); group.add(m); } return group; }
function fence(clearing) { const group = new THREE.Group(), postMat = new THREE.MeshStandardMaterial({ color: 0x7c5738, roughness: .9 }), railMat = new THREE.MeshStandardMaterial({ color: 0x8b6642, roughness: .9 }); for (const o of clearing.objects) { if (o.type === "fence-post") { const h = o.state.heightMeters || 1.25, m = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, h, 7), postMat); m.position.set(o.transform.position.x, o.transform.position.y + h * .5, o.transform.position.z); group.add(m); } else if (o.type === "fence-rail") { const len = o.transform.scale.x || 2, m = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, len, 6), railMat); m.rotation.z = Math.PI / 2; m.rotation.y = o.transform.rotation.y || 0; m.position.set(o.transform.position.x, o.transform.position.y, o.transform.position.z); group.add(m); } } return group; }
function campfire(graph) { const root = graph.byId[graph.rootId], group = new THREE.Group(); group.position.set(root.transform.position.x, root.transform.position.y, root.transform.position.z); const logMat = new THREE.MeshStandardMaterial({ color: 0x70462a, roughness: .88 }); for (let i = 0; i < 7; i++) { const log = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, 2, 8), logMat); log.position.y = .22 + (i % 2) * .1; log.rotation.z = Math.PI / 2; log.rotation.y = i / 7 * Math.PI * 2; group.add(log); } const ember = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 6), new THREE.MeshStandardMaterial({ color: 0xff5c22, emissive: 0xff3d12, emissiveIntensity: 1.4 })); ember.scale.y = .18; ember.position.y = .16; group.add(ember); const flames = []; for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(.25 + i * .025, 1.1 - i * .08, 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffa533 : 0xffdf62, transparent: true, opacity: .72, depthWrite: false })); f.position.set(Math.cos(i) * .18, .65, Math.sin(i * 1.7) * .18); group.add(f); flames.push(f); } const light = new THREE.PointLight(0xff9d43, 1.8, 22, 2); light.position.set(0, 1.2, 0); group.add(light); group.userData = { flames, light }; return group; }
function smokePoints(d) { const pos = new Float32Array(d.particleCount * 3), ages = new Float32Array(d.particleCount), seeds = new Float32Array(d.particleCount); for (let i = 0; i < d.particleCount; i++) { ages[i] = Math.random() * d.lifespanSeconds; seeds[i] = Math.random() * Math.PI * 2; } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcac3b8, size: 1.15, transparent: true, opacity: .38, depthWrite: false, sizeAttenuation: true })); pts.userData = { d, ages, seeds, origin: new THREE.Vector3(d.position.x, d.position.y, d.position.z) }; return pts; }
function updateSmoke(pts, dt, now) { const { d, ages, seeds, origin } = pts.userData, p = pts.geometry.attributes.position, wind = d.wind; for (let i = 0; i < ages.length; i++) { ages[i] = (ages[i] + dt) % d.lifespanSeconds; const t = ages[i] / d.lifespanSeconds, swirl = Math.sin(now * .0015 + seeds[i] + t * 9) * d.turbulence, r = d.spawnRadius + t * 2.2; p.setXYZ(i, origin.x + wind.direction.x * wind.response * t * 5.5 + Math.cos(seeds[i]) * r * .35 + swirl * .25, origin.y + t * d.riseSpeed * d.lifespanSeconds, origin.z + wind.direction.z * wind.response * t * 5.5 + Math.sin(seeds[i]) * r * .35 + swirl * .18); } p.needsUpdate = true; }

function grassGeometry({ bladeCount = 240, radius = 1.85, seed = 1, texture }) { let s = seed; const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; }; const root = new THREE.Color(texture.rootColor), tipC = new THREE.Color(texture.tipColor), dry = new THREE.Color(texture.dryColor); const p = [], c = [], idx = []; for (let i = 0; i < bladeCount; i++) { const a = rand() * Math.PI * 2, r = radius * Math.sqrt(rand()), x = Math.cos(a) * r, z = Math.sin(a) * r, h = .32 + rand() * .6, w = .018 + rand() * .03, lean = (rand() - .5) * .24, side = new THREE.Vector3(Math.cos(a + Math.PI / 2) * w, 0, Math.sin(a + Math.PI / 2) * w), tip = new THREE.Vector3(x + Math.cos(a) * lean, h, z + Math.sin(a) * lean), b = p.length / 3; p.push(x - side.x, 0, z - side.z, x + side.x, 0, z + side.z, tip.x + side.x * .32, tip.y, tip.z + side.z * .32, tip.x - side.x * .32, tip.y, tip.z - side.z * .32); const dm = rand() < texture.dryVariation ? .42 : 0, rc = root.clone().lerp(dry, dm), tc = tipC.clone().lerp(dry, dm * .7); c.push(rc.r, rc.g, rc.b, rc.r, rc.g, rc.b, tc.r, tc.g, tc.b, tc.r, tc.g, tc.b); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
function grassBatches(placement, texture, wind) { const group = new THREE.Group(), map = new Map(), budgets = { "dense-a": 900, "dense-b": 720, "dense-c": 560 }; for (const patch of placement.patches) { const key = patch.render.geometryTemplateKey; if (!map.has(key)) map.set(key, []); map.get(key).push(patch); } let template = 0; for (const [key, patches] of map) { const mesh = new THREE.InstancedMesh(grassGeometry({ bladeCount: Math.max(160, Math.round((budgets[key] || 720) / 3)), seed: 100 + template * 37, texture }), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .86, side: THREE.DoubleSide }), patches.length); mesh.userData = { wind, base: [] }; const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scale = new THREE.Vector3(); patches.forEach((patch, i) => { pos.set(patch.transform.position.x, patch.transform.position.y + .04, patch.transform.position.z); q.setFromEuler(new THREE.Euler(0, patch.transform.rotation.y, 0)); scale.set(patch.transform.scale.x, 1, patch.transform.scale.z); matrix.compose(pos, q, scale); mesh.setMatrixAt(i, matrix); mesh.userData.base[i] = matrix.clone(); }); mesh.instanceMatrix.needsUpdate = true; group.add(mesh); template++; } return group; }
function cloudGroup(contract) { const group = new THREE.Group(); const material = new THREE.MeshStandardMaterial({ color: 0xfff7e8, transparent: true, opacity: .36, roughness: 1 }); contract.clouds.slice(0, 4).forEach((d, i) => { const c = new THREE.Group(); for (let j = 0; j < 5; j++) { const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), material); puff.position.set((j - 2) * 24, Math.sin(j) * 6, Math.cos(j * 1.7) * 14); puff.scale.set((d.scale?.x || 300) / 80, (d.scale?.y || 90) / 80, (d.scale?.z || 230) / 80); c.add(puff); } c.position.set((d.position?.x || 0) * .52, Math.max(135, (d.position?.y || 600) * .5), (d.position?.z || 0) * .52); c.userData = { speed: d.driftSpeed || .04, drift: d.drift || { x: 1, z: .2 } }; group.add(c); }); return group; }

async function main() {
  const islandState = landformDomain.createOceanIslandLandformState({ id: "cozy-island-001", seed: "cozy-island-domain-cutover", preset: "tropical-small-island", radius: R, maxHeight: 18, beachWidth: 10, shelfWidth: 36, shelfDepth: 110, objectPalette: [], render: { heightfieldResolution: 129, shorelineSegments: 128 } });
  const landform = landformDomain.createOceanIslandLandformRenderContract(islandState, { heightfield: { resolution: 129 }, shoreline: { segments: 128 }, objects: { densityScale: 0 } });
  const sampleHeight = (p) => landformDomain.sampleIslandHeight(islandState, { x: p.x, z: p.z });
  const sampleMasks = (p) => landformDomain.sampleIslandMasks(islandState, { x: p.x, z: p.z });
  const campfireY = sampleHeight({ x: 0, z: 0 });
  const clearing = fencedClearingDomain.createFencedClearingGraph({ parentId: "island:cozy-001", position: { x: 0, y: campfireY, z: 0 }, fenceRadiusMeters: 12, campfireRadiusMeters: 2.25, playerYaw: 0 });
  const rawAnchor = clearing.byId["central-clearing:campfire:player-avatar-anchor"] || {};
  const anchorPos = safe(rawAnchor.transform?.position, { x: 0, y: campfireY, z: 6 });
  const anchorRot = safe(rawAnchor.transform?.rotation, { x: 0, y: 0, z: 0 });
  const graph = foliageDomain.createDenseCozyIslandObjectGraph({ seed: "cozy-island-domain-cutover", radiusMeters: R, sampleHeight, sampleMasks });
  const floorState = oceanFloorDomain.createOceanFloorState({ seed: "cozy-island-ocean-floor", size: 3600, resolution: 53, baseDepth: SEA_FLOOR_Y, islandRadius: R, islandShelfRadius: 145, islandInfluenceRadius: 260, shelfDepth: -16, moundDepth: -42, noiseAmplitude: 9, objects: { seaFloorRocks: 34, seaFloorBoulders: 12, reefClusters: 14, coralClusters: 18 } });
  const oceanFloor = oceanFloorDomain.createOceanFloorRenderContract(floorState, { heightfield: { resolution: 53 }, objects: {} });
  const grassTexture = grassTextureDomain.createGrassTextureDescriptor({ id: "dense-cozy-grass-texture" });
  const grassWind = grassWindDomain.createGrassWindDescriptor({ id: "central-grove-soft-wind", phaseSeed: "cozy-island-grass", baseSway: .16, gustStrength: .34 });
  const campfireGraph = campfireDomain.createCampfireObjectGraph({ parentId: graph.rootId, position: { x: 0, y: campfireY, z: 0 }, radiusMeters: 1.45, intensity: .86, smoke: true });
  const smoke = smokeDomain.createSmokeParticleDescriptor({ parentId: campfireGraph.rootId, position: { x: 0, y: campfireY + 1.25, z: 0 }, wind: { ...grassWind, response: .78 }, particleCount: 96, riseSpeed: 1.2 });
  const grassPlacement = grassObjectDomain.createGrassPatchPlacementContract({ seed: "cozy-island-grass", count: 140, radiusMeters: R, sampleHeight, sampleMasks, pathNetwork: graph.pathNetwork, avoidObjects: graph.objects, exclusionZones: clearing.clearanceZones, pathClearance: 3.6, objectClearance: 1.15 });
  const clouds = cloudDomain.createMattatzCloudRenderContract(cloudDomain.createMattatzCloudsState({ seed: "cozy-island-clouds", weather: "sunrise-haze", cloudCount: 4 }), 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3cfa6);
  scene.fog = new THREE.FogExp2(0xf3cfa6, .00072);
  const camera = new THREE.PerspectiveCamera(58, 1, .1, 6800);
  scene.add(new THREE.HemisphereLight(0xfff7e9, 0x2d5b64, 1.55));
  const sun = new THREE.DirectionalLight(0xffe1a3, 4.1);
  sun.position.set(-320, 520, 260);
  scene.add(sun);

  const waterMesh = water(oceanFloor.waterMaterial);
  const grass = grassBatches(grassPlacement, grassTexture, grassWind);
  const fire = campfire(campfireGraph);
  const smoke = smokePoints(smoke);
  const cloudsMesh = cloudGroup(clouds);
  scene.add(oceanFloorMesh(oceanFloor.heightfield), seaObjects(oceanFloor.objects), terrain(landform.heightfield), waterMesh, foam(landform.shoreline), pathMesh(graph.pathNetwork, sampleHeight), islandObjects(graph, clearing.objectExclusionZones || [{ center: { x: 0, z: 0 }, radius: 11.2 }]), fence(clearing), fire, smoke, grass, cloudsMesh);

  const keys = new Set();
  const player = {
    position: new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z),
    yaw: anchorRot.y || 0,
    pitch: 0,
    eyeHeight: rawAnchor.state?.eyeHeightMeters || 1.7,
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
  addEventListener("keydown", (e) => keys.add(e.code));
  addEventListener("keyup", (e) => keys.delete(e.code));
  addEventListener("blur", () => keys.clear());
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); scrollProgress = clamp01(scrollProgress + e.deltaY * -0.0014); }, { passive: false });
  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (scrollProgress >= .985) {
      player.yaw -= dx * .0025;
      player.pitch = Math.max(-1.1, Math.min(1, player.pitch - dy * .0025));
    } else if (scrollProgress < .85) {
      player.yaw -= dx * .0045;
    }
    drag = { x: e.clientX, y: e.clientY };
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
  const matrix = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  function animateGrass(now) { grass.children.forEach((mesh, batch) => { const sway = Math.sin(now * .0018 + batch * 1.7) * mesh.userData.wind.baseSway * .035; mesh.userData.base.forEach((base, i) => { base.decompose(pos, quat, scale); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(sway * (1 + (i % 5) * .12), sway * .25, 0)); matrix.compose(pos, quat.multiply(q), scale); mesh.setMatrixAt(i, matrix); }); mesh.instanceMatrix.needsUpdate = true; }); }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    waterMesh.position.y = -.08 + Math.sin(now * .0012) * .18;
    if (scrollProgress >= .985) updateFirstPerson(dt);
    else { const pose = railPose(); camera.position.copy(pose.position); camera.lookAt(pose.look); }
    animateGrass(now);
    updateSmoke(smoke, dt, now);
    fire.userData.flames?.forEach((flame, i) => flame.scale.setScalar(1 + Math.sin(now * .011 + i) * .1));
    if (fire.userData.light) fire.userData.light.intensity = 1.55 + Math.sin(now * .01) * .35;
    cloudsMesh.children.forEach((cloud) => { cloud.position.x += (cloud.userData.drift?.x || 1) * cloud.userData.speed * dt * 18; cloud.position.z += (cloud.userData.drift?.z || 0) * cloud.userData.speed * dt * 18; });
    hud.innerHTML = `<strong>Cozy Island</strong><br>scroll = sky → invisible player eyes · WASD/drag in human view<br>${scrollProgress >= .985 ? "first-person" : "scroll-rail"} · ${(scrollProgress * 100).toFixed(0)}% · grass ${grassPlacement.patchCount} · clouds ${cloudsMesh.children.length}`;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  globalThis.CozyIsland = { landform, graph, clearing, grassPlacement, smokeDescriptor: smoke, clouds, getScrollProgress: () => scrollProgress };
  requestAnimationFrame(frame);
}

main().catch(fail);
