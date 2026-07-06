export function createThirdPersonFollowKit(options = {}) {
  const distance = options.distance ?? 4.5;
  const height = options.height ?? 1.2;
  const lookAhead = options.lookAhead ?? 1.4;
  const stiffness = options.stiffness ?? 0.08;
  const yawOffset = options.yawOffset ?? 0;
  const pitch = options.pitch ?? 0.28;
  const state = { headingYaw: 0, pitch };

  function forwardFromYaw(THREE, yaw) {
    return new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
  }

  function update({ camera, target, velocity, headingYaw, pitchOverride, THREE }) {
    if (Number.isFinite(headingYaw)) {
      state.headingYaw = headingYaw;
    } else if (velocity && velocity.lengthSq() > 0.0001) {
      state.headingYaw = Math.atan2(velocity.x, -velocity.z);
    }

    const activePitch = Number.isFinite(pitchOverride) ? pitchOverride : state.pitch;
    const yaw = state.headingYaw + yawOffset;
    const forward = forwardFromYaw(THREE, yaw);
    const back = forward.clone().multiplyScalar(-1);
    const horizontalDistance = Math.cos(activePitch) * distance;
    const verticalDistance = Math.sin(activePitch) * distance + height;

    const desired = target.position.clone()
      .addScaledVector(back, horizontalDistance)
      .add(new THREE.Vector3(0, verticalDistance, 0));

    camera.position.lerp(desired, stiffness);

    const focus = target.position.clone()
      .addScaledVector(forward, lookAhead)
      .add(new THREE.Vector3(0, 1.25, 0));

    camera.lookAt(focus);
  }

  return { id: 'third-person-follow-kit', distance, height, lookAhead, yawOffset, pitch, state, update };
}
