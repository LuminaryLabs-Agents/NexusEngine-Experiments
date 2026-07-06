const params = new URLSearchParams(location.search);
const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#error");

function fail(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>Infinite Radial Terrain</strong><br>Runtime error. See panel.";
}

async function boot() {
  const corePath = "./" + "terrain-world-stack" + "." + "js";
  const domainPath = "./" + "hifi-radial-domain" + "." + "js";
  const core = await import(corePath);
  const domain = await import(domainPath);
  const THREE = await import(params.get("three") || core.THREE_URL);
  const erosionSolver = await core.loadErosionSolver(params);
  const radialTerrain = domain.createRadialTerrainDomain({ originSnap: 250 });
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
  const bandMeshes = new Map();
  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.32, speed: 320 };
  let descriptors = radialTerrain.getDescriptors();
  let lastVersion = -1;
  let lastSample = null;
  let frame = 0;

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
    const h = Math.round(lastSample.height);
    const order = lastSample.hydrology?.stream?.streamOrder ?? 0;
    const dd = lastSample.hydrology?.stream?.drainageDensityKmPerKm2 ?? 0;
    hud.innerHTML = `<strong>Infinite Radial Terrain</strong><br>Earth scale · 1 unit = 1m · WASD fly · Space/Shift vertical · arrows look<br>Height ${h}m · Stream ${order} · Drainage ${dd.toFixed(1)}km/km² · Snap ${descriptors.originSnap}m · Origin ${descriptors.origin.x},${descriptors.origin.z}`;
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
    getState: () => ({ frame, camera: { position: camera.position.toArray(), yaw: rig.yaw, pitch: rig.pitch }, descriptors, terrainSample: core.clone(lastSample) })
  };

  syncTerrain();
  render();
  requestAnimationFrame(loop);
}

boot().catch(fail);
