export function createThirdPersonFollowKit(options = {}) {
  const distance = options.distance ?? 4.5;
  const height = options.height ?? 2.5;
  const lookAhead = options.lookAhead ?? 1.4;
  const stiffness = options.stiffness ?? 0.08;
  const yawOffset = { value: 0 };

  function update({ camera, target, velocity, THREE }) {
    const forward = velocity.lengthSq() > 0.0001
      ? velocity.clone().normalize()
      : new THREE.Vector3(0, 0, -1);
    const desired = target.position.clone()
      .addScaledVector(forward, -distance)
      .add(new THREE.Vector3(0, height, 0));
    camera.position.lerp(desired, stiffness);
    const focus = target.position.clone()
      .addScaledVector(forward, lookAhead)
      .add(new THREE.Vector3(0, 1.1, 0));
    camera.lookAt(focus);
    yawOffset.value = Math.atan2(forward.x, forward.z);
  }

  return { id: 'third-person-follow-kit', distance, height, lookAhead, update };
}
