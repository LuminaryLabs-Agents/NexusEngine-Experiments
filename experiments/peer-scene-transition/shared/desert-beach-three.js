import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const root = document.querySelector("#three-root");
const fade = document.querySelector("#fade");
const debug = document.querySelector("#debug");
const mode = document.body.dataset.sceneMode ?? "desert";
const stateKey = "nexus.peerSceneTransition.three.v1";
const clock = new THREE.Clock();
const keys = new Set();
const player = { pos: new THREE.Vector3(mode === "beach" ? 0 : -80, 3, mode === "beach" ? 42 : 72), yaw: mode === "beach" ? Math.PI : 0, pitch: -0.08, speed: 26 };
let transitioned = false;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(mode === "beach" ? 0xb9e5ff : 0xf1cf91, mode === "beach" ? 0.0045 : 0.0065);
scene.background = new THREE.Color(mode === "beach" ? 0x9fd8ff : 0xf0c77f);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 1400);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.append(renderer.domElement);

const hemi = new THREE.HemisphereLight(mode === "beach" ? 0xccecff : 0xffe6b8, 0x53401e, mode === "beach" ? 1.8 : 1.45);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe3a0, mode === "beach" ? 3.2 : 2.7);
sun.position.set(-80, 130, 46);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

function duneHeight(x, z) {
  return Math.sin(x * 0.025) * 2.8 + Math.cos(z * 0.02) * 2.4 + Math.sin((x + z) * 0.012) * 4.2;
}
function beachHeight(x, z) {
  return Math.sin(x * 0.025) * 0.5 + Math.sin(z * 0.018) * 0.35 + Math.max(0, z - 80) * 0.012;
}
function heightAt(x, z) {
  return mode === "beach" ? beachHeight(x, z) : duneHeight(x, z);
}
function makeTerrain() {
  const size = mode === "beach" ? 1200 : 900;
  const geometry = new THREE.PlaneGeometry(size, size, 180, 180);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: mode === "beach" ? 0xd8bd84 : 0xd3a95b, roughness: 0.92, metalness: 0.02 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
function addDesertObjects() {
  const waterGeo = new THREE.CircleGeometry(17, 64);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2aa7c9, roughness: 0.25, metalness: 0.0, transparent: true, opacity: 0.82 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(72, heightAt(72, -92) + 0.12, -92);
  water.name = "transition-water";
  scene.add(water);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(18, 0.18, 12, 96), new THREE.MeshBasicMaterial({ color: 0xbaf7ff }));
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(water.position).add(new THREE.Vector3(0, 0.18, 0));
  scene.add(ring);
  for (let i = 0; i < 55; i += 1) {
    const x = Math.sin(i * 18.1) * 360;
    const z = Math.cos(i * 9.7) * 330;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + (i % 4), 0), new THREE.MeshStandardMaterial({ color: 0xa88758, roughness: 1 }));
    stone.position.set(x, heightAt(x, z) + 1.5, z);
    stone.rotation.set(i, i * 0.7, i * 0.3);
    stone.castShadow = true;
    scene.add(stone);
  }
}
function addBeachObjects() {
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1400, 700, 32, 32), new THREE.MeshStandardMaterial({ color: 0x2479a7, roughness: 0.35, metalness: 0.02, transparent: true, opacity: 0.86 }));
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.35, -210);
  scene.add(ocean);
  for (let i = 0; i < 34; i += 1) {
    const x = -380 + i * 24;
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.8), new THREE.MeshBasicMaterial({ color: 0xe9ffff, transparent: true, opacity: 0.55 }));
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(x, 0.08, -16 - Math.sin(i) * 8);
    scene.add(foam);
  }
  for (let i = 0; i < 16; i += 1) {
    const x = Math.sin(i * 4.2) * 260;
    const z = 80 + Math.cos(i * 3.1) * 130;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 13, 9), new THREE.MeshStandardMaterial({ color: 0x8d5c2f, roughness: 0.8 }));
    trunk.position.set(x, heightAt(x, z) + 6.5, z);
    trunk.rotation.z = Math.sin(i) * 0.18;
    trunk.castShadow = true;
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(5.5, 1), new THREE.MeshStandardMaterial({ color: 0x2f7f4a, roughness: 0.75 }));
    crown.position.set(x, heightAt(x, z) + 14, z);
    crown.scale.set(1.7, 0.7, 1.2);
    crown.castShadow = true;
    scene.add(crown);
  }
}
function updatePlayer(dt) {
  const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const move = new THREE.Vector3();
  if (keys.has("KeyW")) move.add(forward);
  if (keys.has("KeyS")) move.sub(forward);
  if (keys.has("KeyD")) move.add(right);
  if (keys.has("KeyA")) move.sub(right);
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(player.speed * dt);
  player.pos.add(move);
  player.pos.y = heightAt(player.pos.x, player.pos.z) + 3.2;
  camera.position.copy(player.pos);
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}
function maybeTransition() {
  if (mode !== "desert" || transitioned) return;
  const dx = player.pos.x - 72;
  const dz = player.pos.z + 92;
  const distance = Math.hypot(dx, dz);
  if (distance < 11) {
    transitioned = true;
    sessionStorage.setItem(stateKey, JSON.stringify({ from: "desert", to: "beach", trigger: "water-spot", at: Date.now() }));
    fade.classList.add("black");
    setTimeout(() => { globalThis.location.href = "./final.html"; }, 1150);
  }
}
function drawDebug() {
  const label = mode === "beach" ? "massive beach" : "desert plains";
  const target = mode === "desert" ? Math.hypot(player.pos.x - 72, player.pos.z + 92).toFixed(1) : "arrived";
  debug.textContent = JSON.stringify({ scene: label, position: { x: player.pos.x.toFixed(1), y: player.pos.y.toFixed(1), z: player.pos.z.toFixed(1) }, controls: "click, mouse look, WASD", transitionTargetDistance: target, sceneState: JSON.parse(sessionStorage.getItem(stateKey) || "null") }, null, 2);
}
function loop() {
  const dt = Math.min(clock.getDelta(), 0.04);
  updatePlayer(dt);
  maybeTransition();
  drawDebug();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

makeTerrain();
if (mode === "beach") addBeachObjects(); else addDesertObjects();
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
addEventListener("keydown", (e) => keys.add(e.code));
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("click", () => renderer.domElement.requestPointerLock?.());
addEventListener("mousemove", (e) => { if (document.pointerLockElement === renderer.domElement) { player.yaw -= e.movementX * 0.0022; player.pitch = Math.max(-1.2, Math.min(1.1, player.pitch - e.movementY * 0.0022)); } });
setTimeout(() => fade.classList.remove("black"), 80);
loop();
