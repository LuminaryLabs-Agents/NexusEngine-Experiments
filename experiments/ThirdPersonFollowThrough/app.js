import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { createCameraControlUtilityKit } from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/core-kits/core-utility-kit/camera-control-utility-kit.js';
import { createTransformMathUtilityKit } from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/core-kits/core-utility-kit/transform-math-utility-kit.js';
import { createThirdPersonFollowKit } from './kits/third-person-follow-kit.js';
import { createRiggedActorKit } from './kits/rigged-actor-kit.js';
import { thirdPersonFollowThroughDomain } from './domain/third-person-follow-through-domain.js';

const app = document.getElementById('app');
const transformUtil = createTransformMathUtilityKit();
const cameraUtil = createCameraControlUtilityKit();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78add8);
scene.fog = new THREE.Fog(0x78add8, 42, 110);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x343434, 1.65));
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

const actor = createRiggedActorKit(THREE, { name: 'ThirdPersonFollowActor', debugVisible: false });
const actorRoot = actor.group;
scene.add(actorRoot);
actorRoot.position.set(0, 0, 8);

const cameraPivotWorld = new THREE.Vector3();
const cameraTarget = new THREE.Object3D();
scene.add(cameraTarget);
const lookTarget = new THREE.Vector3();
const headWorld = new THREE.Vector3();
const follow = createThirdPersonFollowKit({ distance: 6.2, height: 0.15, lookAhead: 2.4, lagSpeed: 11, pitch: 0.28 });

const lookMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, roughness: 0.3, emissive: 0x063b14 });
const lookAheadSphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), lookMat);
lookAheadSphere.castShadow = true;
lookAheadSphere.visible = false;
scene.add(lookAheadSphere);

const input = new Set();
const wish = new THREE.Vector3();
let yVel = 0;
let grounded = true;
let last = performance.now();
let rootYaw = 0;
let orbitYawOffset = 0;
let cameraPitch = 0.28;
let handoffAlpha = 0;
let debugVisible = false;
const maxOrbitYaw = Math.PI / 2;
const handoffStartYaw = Math.PI / 4;
const rootYawHandoffSpeed = 2.35;
const orbitReturnSpeed = 1.8;
const rotateSpeed = 8.5;
const moveSpeed = 7.5;
camera.position.set(0, 3.2, 15);
document.body.dataset.nexusDomain = thirdPersonFollowThroughDomain.id;

function toVector3(v) {
  return new THREE.Vector3(v.x, v.y, v.z);
}
function reset() {
  actorRoot.position.set(0, 0, 8);
  yVel = 0;
  grounded = true;
  rootYaw = 0;
  orbitYawOffset = 0;
  cameraPitch = 0.28;
  handoffAlpha = 0;
}
function setDebugVisible(visible) {
  debugVisible = visible;
  actor.setDebugVisible(visible);
  lookAheadSphere.visible = visible;
}

addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  input.add(key);
  if (key === 'r') reset();
  if (key === 'v') setDebugVisible(!debugVisible);
});
addEventListener('keyup', e => input.delete(e.key.toLowerCase()));
addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    orbitYawOffset = cameraUtil.clampOrbitYaw(orbitYawOffset + e.movementX * 0.003, maxOrbitYaw);
    cameraPitch = transformUtil.clamp(cameraPitch + e.movementY * 0.0025, -0.1, 0.82);
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
  orbitYawOffset = cameraUtil.clampOrbitYaw(orbitYawOffset, maxOrbitYaw);
  if (!turningCamera && document.pointerLockElement !== renderer.domElement && Math.abs(orbitYawOffset) <= handoffStartYaw) {
    orbitYawOffset = transformUtil.lerp(orbitYawOffset, 0, transformUtil.expSmoothingAlpha(orbitReturnSpeed, dt));
  }
  if (input.has('arrowup')) cameraPitch = transformUtil.clamp(cameraPitch - dt * 0.9, -0.1, 0.82);
  if (input.has('arrowdown')) cameraPitch = transformUtil.clamp(cameraPitch + dt * 0.9, -0.1, 0.82);

  let cameraYaw = cameraUtil.cameraYawFromRootAndOrbit(rootYaw, orbitYawOffset);
  const basisInput = { forward: input.has('w'), back: input.has('s'), left: input.has('a'), right: input.has('d') };
  const wishPlain = transformUtil.cameraRelativeWishVector(basisInput, cameraYaw);
  wish.copy(toVector3(wishPlain));

  if (wish.lengthSq() > 0) {
    const previousCameraYaw = cameraYaw;
    const desiredYaw = Math.atan2(wish.x, -wish.z);
    rootYaw = transformUtil.lerpAngle(rootYaw, desiredYaw, Math.min(1, dt * rotateSpeed));
    orbitYawOffset = cameraUtil.preserveOrbitForCameraYaw(rootYaw, previousCameraYaw, maxOrbitYaw);
    actorRoot.position.addScaledVector(wish, moveSpeed * dt);
  }

  const handoff = cameraUtil.applyRootYawHandoff({ rootYaw, orbitYawOffset }, { maxOrbitYaw, handoffStartYaw, rootYawHandoffSpeed, dt });
  rootYaw = handoff.rootYaw;
  orbitYawOffset = handoff.orbitYawOffset;
  handoffAlpha = handoff.handoffAlpha;
  cameraYaw = handoff.cameraYaw;

  actorRoot.rotation.y = rootYaw;
  actorRoot.position.x = THREE.MathUtils.clamp(actorRoot.position.x, -20, 20);
  actorRoot.position.z = THREE.MathUtils.clamp(actorRoot.position.z, -20, 20);

  if (input.has(' ') && grounded) { yVel = 7; grounded = false; }
  yVel -= 18 * dt;
  actorRoot.position.y += yVel * dt;
  if (actorRoot.position.y <= 0) { actorRoot.position.y = 0; yVel = 0; grounded = true; }

  actor.pivots.camera.getWorldPosition(cameraPivotWorld);
  cameraTarget.position.copy(cameraPivotWorld);
  const lookForward = toVector3(transformUtil.forwardFromYaw(cameraYaw));
  lookTarget.copy(cameraPivotWorld).addScaledVector(lookForward, 2.65).add(new THREE.Vector3(0, 0.12, 0));
  lookAheadSphere.position.copy(lookTarget);

  follow.update({ camera, target: cameraTarget, controlYaw: cameraYaw, headingYaw: rootYaw, pitchOverride: cameraPitch, lookTarget, THREE, dt });

  actor.headMarkerCube.getWorldPosition(headWorld);
  window.__thirdPersonFollowThrough = {
    rootYawDeg: THREE.MathUtils.radToDeg(rootYaw),
    orbitYawOffsetDeg: THREE.MathUtils.radToDeg(orbitYawOffset),
    cameraYawDeg: THREE.MathUtils.radToDeg(cameraYaw),
    handoffAlpha,
    cameraPivotWorld: cameraPivotWorld.toArray(),
    headWorld: headWorld.toArray(),
    lookAheadWorld: lookTarget.toArray(),
    cameraPosition: camera.position.toArray(),
    targetPosition: actorRoot.position.toArray(),
    debugVisible,
    rigBoneNames: Object.keys(actor.bones),
    rigJointCount: Object.keys(actor.joints).length,
    grounded
  };

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
