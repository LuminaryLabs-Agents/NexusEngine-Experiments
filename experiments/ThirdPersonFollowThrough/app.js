import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { createThirdPersonFollowKit } from './kits/third-person-follow-kit.js';
import { thirdPersonFollowThroughDomain } from './domain/third-person-follow-through-domain.js';

const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78add8);
scene.fog = new THREE.Fog(0x78add8, 35, 95);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffff, 0x363636, 1.7);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-8, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b8984, roughness: 0.86 });
const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
const blockMat = new THREE.MeshStandardMaterial({ color: 0x6a6865, roughness: 0.86 });

const floor = new THREE.Mesh(new THREE.BoxGeometry(44, 0.25, 44), floorMat);
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(44, 44, 0x333333, 0x666666);
grid.position.y = 0.14;
scene.add(grid);

function box(x, y, z, sx, sy, sz, mat = blockMat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(x, y + sy / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

box(0, 0, -22, 44, 8, 0.5, wallMat);
box(-22, 0, 0, 0.5, 8, 44, wallMat);
box(22, 0, 0, 0.5, 8, 44, wallMat);
box(-9, 0, -8, 7, 3, 5);
box(7, 0, -11, 8, 5, 6);
box(14, 0, 3, 2.5, 2.5, 2.5);
box(0, 0, -16, 2, 2, 2);

const ramp = new THREE.Mesh(new THREE.BoxGeometry(10, 0.45, 6), blockMat);
ramp.position.set(-13, 1.25, 7);
ramp.rotation.x = -0.42;
ramp.castShadow = true;
ramp.receiveShadow = true;
scene.add(ramp);

const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1.2, 48), blockMat);
cylinder.position.set(13, 0.6, 9);
cylinder.castShadow = true;
cylinder.receiveShadow = true;
scene.add(cylinder);

const capsule = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x55bdf2, roughness: 0.38, metalness: 0.02 });
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.55, 12, 28), bodyMat);
body.position.y = 1.35;
body.castShadow = true;
capsule.add(body);
scene.add(capsule);

const velocity = new THREE.Vector3();
const input = new Set();
const follow = createThirdPersonFollowKit({ distance: 6.2, height: 3.2, lookAhead: 2.0, stiffness: 0.09 });
camera.position.set(0, 4, 8);

addEventListener('keydown', e => {
  input.add(e.key.toLowerCase());
  if (e.key.toLowerCase() === 'r') capsule.position.set(0, 0, 8);
});
addEventListener('keyup', e => input.delete(e.key.toLowerCase()));
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let yVel = 0;
let grounded = true;
let last = performance.now();
capsule.position.set(0, 0, 8);

document.body.dataset.nexusDomain = thirdPersonFollowThroughDomain.id;

function tick(now) {
  const dt = Math.min(0.04, (now - last) / 1000);
  last = now;
  velocity.set(0, 0, 0);
  if (input.has('w')) velocity.z -= 1;
  if (input.has('s')) velocity.z += 1;
  if (input.has('a')) velocity.x -= 1;
  if (input.has('d')) velocity.x += 1;
  if (velocity.lengthSq() > 0) velocity.normalize().multiplyScalar(7.5 * dt);
  capsule.position.add(velocity);
  capsule.position.x = THREE.MathUtils.clamp(capsule.position.x, -19, 19);
  capsule.position.z = THREE.MathUtils.clamp(capsule.position.z, -19, 19);
  if (input.has(' ') && grounded) { yVel = 7; grounded = false; }
  yVel -= 18 * dt;
  capsule.position.y += yVel * dt;
  if (capsule.position.y <= 0) { capsule.position.y = 0; yVel = 0; grounded = true; }
  const visualVelocity = velocity.clone().multiplyScalar(1 / Math.max(dt, 0.001));
  follow.update({ camera, target: capsule, velocity: visualVelocity, THREE });
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
