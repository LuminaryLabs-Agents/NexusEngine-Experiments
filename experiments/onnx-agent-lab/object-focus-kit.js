export function createObjectFocusKit(THREE) {
  const state = {
    selectedId: null,
    selectedObject: null,
    selectedMesh: null,
    original: null,
    returning: []
  };

  function capture(mesh) {
    return {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      scale: mesh.scale.clone()
    };
  }

  function restoreImmediate(item) {
    if (!item?.mesh || !item?.original) return;
    item.mesh.position.copy(item.original.position);
    item.mesh.quaternion.copy(item.original.quaternion);
    item.mesh.scale.copy(item.original.scale);
  }

  function select({ id, object, mesh }) {
    if (!object || !mesh) return null;

    if (state.selectedMesh) {
      restoreImmediate({ mesh: state.selectedMesh, original: state.original });
    }

    state.selectedId = id || object.id;
    state.selectedObject = object;
    state.selectedMesh = mesh;
    state.original = capture(mesh);
    state.returning = state.returning.filter((item) => item.mesh !== mesh);
    return getState();
  }

  function clear() {
    if (state.selectedMesh && state.original) {
      state.returning.push({
        mesh: state.selectedMesh,
        original: state.original,
        elapsed: 0
      });
    }

    state.selectedId = null;
    state.selectedObject = null;
    state.selectedMesh = null;
    state.original = null;
  }

  function updateReturn(item, dt) {
    item.elapsed += dt;
    const alpha = 1 - Math.exp(-10 * dt);
    item.mesh.position.lerp(item.original.position, alpha);
    item.mesh.quaternion.slerp(item.original.quaternion, alpha);
    item.mesh.scale.lerp(item.original.scale, alpha);
    return item.elapsed > .45 || item.mesh.position.distanceTo(item.original.position) < .015;
  }

  function update(camera, dt) {
    if (state.selectedMesh) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
      const target = camera.position.clone().add(forward.multiplyScalar(1.42));
      target.y -= .08;

      const alpha = 1 - Math.exp(-9 * dt);
      state.selectedMesh.position.lerp(target, alpha);
      state.selectedMesh.quaternion.slerp(camera.quaternion, alpha);
      state.selectedMesh.rotateY(dt * .65);
      state.selectedMesh.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), alpha);
    }

    for (let i = state.returning.length - 1; i >= 0; i--) {
      if (updateReturn(state.returning[i], dt)) {
        restoreImmediate(state.returning[i]);
        state.returning.splice(i, 1);
      }
    }
  }

  function getState() {
    return {
      selectedId: state.selectedId,
      label: state.selectedObject?.label || null,
      mode: state.selectedObject ? "focused" : state.returning.length ? "returning" : "idle"
    };
  }

  return {
    id: "object-focus-kit",
    label: "Object Focus Kit",
    select,
    clear,
    update,
    getState,
    get selectedObject() { return state.selectedObject; },
    get selectedMesh() { return state.selectedMesh; }
  };
}
