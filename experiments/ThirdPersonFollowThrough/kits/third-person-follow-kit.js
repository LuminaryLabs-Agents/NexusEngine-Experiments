export function createThirdPersonFollowKit(options = {}) {
  const distance = options.distance ?? 4.5;
  const height = options.height ?? 1.2;
  const lookAhead = options.lookAhead ?? 1.4;
  const lagSpeed = options.lagSpeed ?? 10;
  const yawOffset = options.yawOffset ?? 0;
  const pitch = options.pitch ?? 0.32;
  const state = {
    controlYaw: 0,
    pitch,
    desiredPosition: null,
    focusPosition: null
  };

  function forwardFromYaw(THREE, yaw) {
    return new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
  }

  function update({ camera, target, controlYaw, headingYaw, pitchOverride, lookTarget, THREE, dt = 1 / 60 }) {
    if (Number.isFinite(controlYaw)) state.controlYaw = controlYaw;
    else if (Number.isFinite(headingYaw)) state.controlYaw = headingYaw;

    const activePitch = Number.isFinite(pitchOverride) ? pitchOverride : state.pitch;
    const yaw = state.controlYaw + yawOffset;
    const forward = forwardFromYaw(THREE, yaw);
    const back = forward.clone().multiplyScalar(-1);
    const horizontalDistance = Math.cos(activePitch) * distance;
    const verticalDistance = Math.sin(activePitch) * distance + height;

    const desired = target.position.clone()
      .addScaledVector(back, horizontalDistance)
      .add(new THREE.Vector3(0, verticalDistance, 0));

    const focus = lookTarget
      ? lookTarget.clone()
      : target.position.clone()
          .addScaledVector(forward, lookAhead)
          .add(new THREE.Vector3(0, 1.25, 0));

    const alpha = 1 - Math.exp(-lagSpeed * Math.max(0, dt));
    camera.position.lerp(desired, alpha);
    camera.lookAt(focus);

    state.pitch = activePitch;
    state.desiredPosition = desired;
    state.focusPosition = focus;
    return state;
  }

  return { id: 'third-person-follow-kit', distance, height, lookAhead, lagSpeed, yawOffset, pitch, state, update };
}
