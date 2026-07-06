import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { createThirdPersonFollowKit } from './kits/third-person-follow-kit.js';
import { createRiggedActorKit } from './kits/rigged-actor-kit.js';
import { thirdPersonFollowThroughDomain } from './domain/third-person-follow-through-domain.js';

const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78add8);
scene.fog = new THREE.Fog(0x78add8, 40, 105);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffff, 0x343434, 1.65);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.3);
sun.position.set(-8, 15, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b8984, roughness: 0.86 });
const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
const blockMat = new THREE.MeshStandardMaterial({ color: 0x6a6865, roughness: 0.86 });

const floor = new THREE.Mesh(new THREE.BoxGeometry(46, 0.25, 46), floorMat);
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(46, 46, 0x333333, 0x666666);
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

box(0, 0, -23, 46, 8, 0.5, wallMat);
box(-23, 0, 0, 0.5, 8, 46, wallMat);
box(23, 0, 0, 0.5, 8, 46, wallMat);
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

const actor = createRiggedActorKit(THREE, { name: 'ThirdPersonFollowActor' });
const capsule = actor.group;
const headCube = actor.headMarkerCube;
scene.add(capsule);

const lookMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, roughness: 0.3, emissive: 0x063b14 });
const lookAheadSphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), lookMat);
lookAheadSphere.castShadow = true;
scene.add(lookAheadSphere);

const input = new Set();
const wish = new THREE.Vector3();
const follow = createThirdPersonFollowKit({ distance: 6.4, height: 1.05, lookAhead: 2.4, lagSpeed: 10, pitch: 0.35 });
let yVel = 0;
let grounded = true;
let last = performance.now();
let headingYaw = 0;
let orbitYawOffset = 0;
let cameraPitch = 0.35;
let handoffAlpha = 0;
const maxOrbitYaw = Math.PI / 2;
const handoffStartYaw = Math.PI / 4;
const rootYawHandoffSpeed = 2.35;
const orbitReturnSpeed = 1.8;
const rotateSpeed = 8.5;
const moveSpeed = 7.5;
const headWorld = new THREE.Vector3();
capsule.position.set(0, 0, 8);
camera.position.set(0, 4, 15);
document.body.dataset.nexusDomain = thirdPersonFollowThroughDomain.id;

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
function forwardFromYaw(yaw) {
  return new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
}
function rightFromYaw(yaw) {
  return new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw)).normalize();
}
function shortestAngle(current, target) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
function preserveCameraYawAfterRootChange(previousCameraYaw) {
  orbitYawOffset = THREE.MathUtils.clamp(shortestAngle(headingYaw, previousCameraYaw), -maxOrbitYaw, maxOrbitYaw);
}
function reset() {
  capsule.position.set(0, 0, 8);
  yVel = 0;
  grounded = true;
  headingYaw = 0;
  orbitYawOffset = 0;
  cameraPitch = 0.35;
  handoffAlpha = 0;
}

addEventListener('keydown', e => {
  input.add(e.key.toLowerCase());
  if (e.key.toLowerCase() === 'r') reset();
});
addEventListener('keyup', e => input.delete(e.key.toLowerCase()));
addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    orbitYawOffset = THREE.MathUtils.clamp(orbitYawOffset + e.movementX * 0.003, -maxOrbitYaw, maxOrbitYaw);
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + e.movementY * 0.0025, -0.1, 0.95);
  }
});
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock?.());
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function tick(now) {
  const dt = Math.min(0.04, (now - last) / 1000);
  last = now;

  let turningCamera = false;
  if (input.has('arrowleft')) { orbitYawOffset -= dt * 1.8; turningCamera = true; }
  if (input.has('arrowright')) { orbitYawOffset += dt * 1.8; turningCamera = true; }
  orbitYawOffset = THREE.MathUtils.clamp(orbitYawOffset, -maxOrbitYaw, maxOrbitYaw);
  if (!turningCamera && document.pointerLockElement !== renderer.domElement && Math.abs(orbitYawOffset) <= handoffStartYaw) {
    orbitYawOffset += (0 - orbitYawOffset) * (1 - Math.exp(-orbitReturnSpeed * dt));
  }

  if (input.has('arrowup')) cameraPitch = THREE.MathUtils.clamp(cameraPitch - dt * 0.9, -0.1, 0.95);
  if (input.has('arrowdown')) cameraPitch = THREE.MathUtils.clamp(cameraPitch + dt * 0.9, -0.1, 0.95);

  let cameraYaw = normalizeAngle(headingYaw + orbitYawOffset);
  const camForward = forwardFromYaw(cameraYaw);
  const camRight = rightFromYaw(cameraYaw);
  wish.set(0, 0, 0);
  if (input.has('w')) wish.add(camForward);
  if (input.has('s')) wish.addScaledVector(camForward, -1);
  if (input.has('d')) wish.add(camRight);
  if (input.has('a')) wish.addScaledVector(camRight, -1);

  if (wish.lengthSq() > 0) {
    wish.normalize();
    const previousCameraYaw = cameraYaw;
    const desiredYaw = Math.atan2(wish.x, -wish.z);
    headingYaw = normalizeAngle(headingYaw + shortestAngle(headingYaw, desiredYaw) * Math.min(1, dt * rotateSpeed));
    preserveCameraYawAfterRootChange(previousCameraYaw);
    capsule.position.addScaledVector(wish, moveSpeed * dt);
  }

  const orbitAbs = Math.abs(orbitYawOffset);
  const excess = Math.max(0, orbitAbs - handoffStartYaw);
  handoffAlpha = excess > 0 ? smoothstep(THREE.MathUtils.clamp(excess / (maxOrbitYaw - handoffStartYaw), 0, 1)) : 0;
  if (handoffAlpha > 0) {
    const handoffDelta = Math.sign(orbitYawOffset) * Math.min(excess, rootYawHandoffSpeed * handoffAlpha * dt);
    headingYaw = normalizeAngle(headingYaw + handoffDelta);
    orbitYawOffset -= handoffDelta;
  }

  headingYaw = normalizeAngle(headingYaw);
  orbitYawOffset = THREE.MathUtils.clamp(orbitYawOffset, -maxOrbitYaw, maxOrbitYaw);
  cameraYaw = normalizeAngle(headingYaw + orbitYawOffset);
  capsule.rotation.y = headingYaw;
  capsule.position.x = THREE.MathUtils.clamp(capsule.position.x, -20, 20);
  capsule.position.z = THREE.MathUtils.clamp(capsule.position.z, -20, 20);

  if (input.has(' ') && grounded) { yVel = 7; grounded = false; }
  yVel -= 18 * dt;
  capsule.position.y += yVel * dt;
  if (capsule.position.y <= 0) { capsule.position.y = 0; yVel = 0; grounded = true; }

  const lookForward = forwardFromYaw(cameraYaw);
  lookAheadSphere.position.copy(capsule.position)
    .addScaledVector(lookForward, 2.45)
    .add(new THREE.Vector3(0, 1.45, 0));

  follow.update({
    camera,
    target: capsule,
    controlYaw: cameraYaw,
    headingYaw,
    pitchOverride: cameraPitch,
    lookTarget: lookAheadSphere.position,
    THREE,
    dt
  });

  headCube.getWorldPosition(headWorld);
  window.__thirdPersonFollowThrough = {
    rootYawDeg: THREE.MathUtils.radToDeg(headingYaw),
    orbitYawOffsetDeg: THREE.MathUtils.radToDeg(orbitYawOffset),
    cameraYawDeg: THREE.MathUtils.radToDeg(cameraYaw),
    handoffAlpha,
    headWorld: headWorld.toArray(),
    lookAheadWorld: lookAheadSphere.position.toArray(),
    cameraPosition: camera.position.toArray(),
    targetPosition: capsule.position.toArray(),
    rigBoneNames: Object.keys(actor.bones),
    rigJointCount: Object.keys(actor.joints).length,
    grounded
  };

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
