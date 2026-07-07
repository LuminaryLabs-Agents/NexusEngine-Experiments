export function createRiggedActorKit(THREE, options = {}) {
  const group = new THREE.Group();
  group.name = options.name ?? 'RiggedActor';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x55bdf2, roughness: 0.38, metalness: 0.02 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xf6f2dd, roughness: 0.5 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0xff7a7a, roughness: 0.45, emissive: 0x220000 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.42, emissive: 0x241400 });
  const forwardMat = new THREE.MeshStandardMaterial({ color: 0x4cff88, roughness: 0.35, emissive: 0x042b11 });

  const pivots = { root: new THREE.Object3D(), pelvis: new THREE.Object3D(), chest: new THREE.Object3D(), head: new THREE.Object3D(), camera: new THREE.Object3D() };
  pivots.root.name = 'rootPivot';
  pivots.pelvis.name = 'pelvisPivot';
  pivots.chest.name = 'chestPivot';
  pivots.head.name = 'headPivot';
  pivots.camera.name = 'cameraPivot';
  pivots.pelvis.position.set(0, 0.82, 0);
  pivots.chest.position.set(0, 1.38, 0);
  pivots.head.position.set(0, 1.6, 0);
  pivots.camera.position.set(0, 1.55, -0.18);
  group.add(pivots.root, pivots.pelvis, pivots.chest, pivots.head, pivots.camera);

  const collisionCapsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.55, 12, 28), bodyMat);
  collisionCapsule.name = 'collisionCapsule_hiddenControllerBody';
  collisionCapsule.position.y = 1.35;
  collisionCapsule.visible = false;
  group.add(collisionCapsule);

  const headMarkerCube = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), headMat);
  headMarkerCube.name = 'headMarkerCube_localY_1_6m';
  headMarkerCube.position.set(0, 1.6, 0);
  headMarkerCube.castShadow = true;
  group.add(headMarkerCube);

  const forwardMarker = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.58, 16), forwardMat);
  forwardMarker.name = 'forwardMarker';
  forwardMarker.position.set(0, 1.62, -1.05);
  forwardMarker.rotation.x = -Math.PI / 2;
  forwardMarker.castShadow = true;
  group.add(forwardMarker);

  const bones = {
    root: [0, 0.0, 0], pelvis: [0, 0.82, 0], spine01: [0, 1.12, 0], chest: [0, 1.42, 0], neck: [0, 1.58, 0], head: [0, 1.72, 0],
    leftUpperArm: [-0.48, 1.42, 0], leftForeArm: [-0.88, 1.18, 0], leftHand: [-1.08, 0.93, 0],
    rightUpperArm: [0.48, 1.42, 0], rightForeArm: [0.88, 1.18, 0], rightHand: [1.08, 0.93, 0],
    leftThigh: [-0.28, 0.62, 0], leftCalf: [-0.33, 0.32, 0], leftFoot: [-0.33, 0.08, -0.22],
    rightThigh: [0.28, 0.62, 0], rightCalf: [0.33, 0.32, 0], rightFoot: [0.33, 0.08, -0.22]
  };
  const links = [
    ['root', 'pelvis'], ['pelvis', 'spine01'], ['spine01', 'chest'], ['chest', 'neck'], ['neck', 'head'],
    ['chest', 'leftUpperArm'], ['leftUpperArm', 'leftForeArm'], ['leftForeArm', 'leftHand'],
    ['chest', 'rightUpperArm'], ['rightUpperArm', 'rightForeArm'], ['rightForeArm', 'rightHand'],
    ['pelvis', 'leftThigh'], ['leftThigh', 'leftCalf'], ['leftCalf', 'leftFoot'],
    ['pelvis', 'rightThigh'], ['rightThigh', 'rightCalf'], ['rightCalf', 'rightFoot']
  ];

  const skeletonDebug = new THREE.Group();
  skeletonDebug.name = 'skeletonDebug';
  skeletonDebug.visible = options.bonesVisible ?? true;
  const joints = {};
  const jointGeo = new THREE.SphereGeometry(0.05, 10, 8);
  for (const [name, position] of Object.entries(bones)) {
    const marker = new THREE.Mesh(jointGeo, jointMat);
    marker.name = `joint_${name}`;
    marker.position.fromArray(position);
    marker.castShadow = true;
    joints[name] = marker;
    skeletonDebug.add(marker);
  }

  function addBoneLink(a, b) {
    const start = new THREE.Vector3(...bones[a]);
    const end = new THREE.Vector3(...bones[b]);
    const mid = start.clone().lerp(end, 0.5);
    const length = start.distanceTo(end);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, length, 8), boneMat);
    mesh.name = `bone_${a}_to_${b}`;
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    skeletonDebug.add(mesh);
  }
  links.forEach(([a, b]) => addBoneLink(a, b));
  group.add(skeletonDebug);

  function setDebugVisible(visible) {
    skeletonDebug.visible = visible;
    forwardMarker.visible = visible;
    headMarkerCube.visible = visible;
  }

  return { group, bones, joints, links, pivots, collisionCapsule, headMarkerCube, forwardMarker, skeletonDebug, setDebugVisible };
}
