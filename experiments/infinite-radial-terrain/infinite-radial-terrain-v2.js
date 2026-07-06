import { THREE_URL, loadErosionSolver, mix, n, rawHeight, sampleTerrain, clamp } from "./hifi-terrain-core.js";
import { createBandGeometry, createRadialTerrainDomain } from "./hifi-radial-domain.js";

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
  const [THREE, erosionSolver] = await Promise.all([import(params.get("three") || THREE_URL), loadErosionSolver(params)]);
  const radialTerrain = createRadialTerrainDomain({ originSnap: 50 });
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#b7e9ff");
  scene.fog = new THREE.FogExp2("#b7e9ff", 0.00013);
  const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 9000);
  camera.position.set(0, rawHeight(0, 0) + 470, 0);
  camera.rotation.order = "YXZ";
  scene.add(new THREE.HemisphereLight(0xd8f5ff, 0x26391f, 1.05));
  const sun = new THREE.DirectionalLight(0xffefba, 4.35);
  sun.position.set(-760, 980, 520);
  scene.add(sun);

  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.015, flatShading: false, side: THREE.FrontSide });
  const bandMeshes = new Map();
  const keys = new Set();
  const rig = { yaw: 0, pitch: -0.32, speed: 260 };
  let descriptors = radialTerrain.getDescriptors();
  let lastVersion = -1;
  let lastSample = null;

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
      const mesh = new THREE.Mesh(createBandGeometry(THREE, descriptors, band, erosionSolver), terrainMat);
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
    if (keys.has("ArrowUp")) rig.pitch = clamp(rig.pitch + dt * 0.75, -1.22, 0.22);
    if (keys.has("ArrowDown")) rig.pitch = clamp(rig.pitch - dt * 0.75, -1.22, 0.22);
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
    const floor = sampleTerrain(camera.position.x, camera.position.z, descriptors.focus, erosionSolver).height + 78;
    if (camera.position.y < floor) camera.position.y = mix(camera.position.y, floor, 0.18);
    camera.rotation.set(rig.pitch, rig.yaw, 0, "YXZ");
  }

  function render() {
    syncTerrain();
    lastSample = sampleTerrain(camera.position.x, camera.position.z, descriptors.focus, erosionSolver);
    hud.innerHTML = `<strong>Infinite Radial Terrain</strong><br>WASD fly · Space/Shift vertical · arrows look<br>Height ${Math.round(lastSample.height)} · Erosion ${Math.round(Math.abs(lastSample.erosion.heightDelta) * 10) / 10} · Wet ${Math.round(lastSample.erosion.wetness * 100)}% · View 5000m+ · Origin ${descriptors.origin.x},${descriptors.origin.z}`;
    renderer.render(scene, camera);
  }

  function loop(now) {
    const dt = Math.min(0.04, n((now - (loop.last ?? now)) / 1000, 1 / 60));
    loop.last = now;
    moveCamera(dt);
    render();
    requestAnimationFrame(loop);
  }

  addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  addEventListener("resize", () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  syncTerrain();
  render();
  requestAnimationFrame(loop);
}

boot().catch(fail);
