export function createObjectFocusKit(THREE) {
  const state = {
    id: null,
    item: null,
    mesh: null,
    original: null,
    mode: "idle"
  };

  function capture(mesh) {
    return {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      scale: mesh.scale.clone()
    };
  }

  function select({ id, object, mesh }) {
    if (!object || !mesh) return null;
    restore();
    state.id = id || object.id;
    state.item = object;
    state.mesh = mesh;
    state.original = capture(mesh);
    state.mode = "active";
    return getState();
  }

  function restore() {
    if (state.mesh && state.original) {
      state.mesh.position.copy(state.original.position);
      state.mesh.quaternion.copy(state.original.quaternion);
      state.mesh.scale.copy(state.original.scale);
    }
    state.id = null;
    state.item = null;
    state.mesh = null;
    state.original = null;
    state.mode = "idle";
  }

  function update(camera, dt) {
    if (!state.mesh) return;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const target = camera.position.clone().add(forward.multiplyScalar(1.42));
    target.y -= .08;
    const alpha = 1 - Math.exp(-9 * dt);
    state.mesh.position.lerp(target, alpha);
    state.mesh.quaternion.slerp(camera.quaternion, alpha);
    state.mesh.rotateY(dt * .65);
    state.mesh.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), alpha);
    state.mode = "focused";
  }

  function getState() {
    return { selectedId: state.id, label: state.item?.label || null, mode: state.mode };
  }

  return {
    id: "object-focus-kit",
    label: "Object Focus Kit",
    select,
    clear: restore,
    update,
    getState,
    get selectedObject() { return state.item; },
    get selectedMesh() { return state.mesh; }
  };
}
