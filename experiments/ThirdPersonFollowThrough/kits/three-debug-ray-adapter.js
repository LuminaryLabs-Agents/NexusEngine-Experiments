export function createThreeDebugRayAdapter(THREE, options = {}) {
  const scene = options.scene;
  if (!scene || typeof scene.add !== 'function') {
    throw new TypeError('createThreeDebugRayAdapter requires a THREE scene.');
  }

  const scope = options.scope ?? null;
  const group = new THREE.Group();
  group.name = options.name ?? 'threeDebugRayAdapter';
  group.visible = options.visible !== false;
  scene.add(group);

  const arrows = new Map();

  function colorOf(ray) {
    return ray.hex ?? ray.color ?? '#ffffff';
  }

  function vectorFromArray(value, fallback) {
    if (Array.isArray(value)) return new THREE.Vector3(value[0] ?? fallback.x, value[1] ?? fallback.y, value[2] ?? fallback.z);
    if (value && typeof value === 'object') return new THREE.Vector3(value.x ?? fallback.x, value.y ?? fallback.y, value.z ?? fallback.z);
    return fallback.clone();
  }

  function ensureArrow(ray) {
    if (arrows.has(ray.id)) return arrows.get(ray.id);
    const direction = vectorFromArray(ray.direction, new THREE.Vector3(0, 0, -1)).normalize();
    const origin = vectorFromArray(ray.origin, new THREE.Vector3());
    const length = Number(ray.length ?? 1);
    const arrow = new THREE.ArrowHelper(
      direction,
      origin,
      Math.max(0.001, length),
      colorOf(ray),
      Math.max(0.12, length * 0.16),
      Math.max(0.06, length * 0.07)
    );
    arrow.name = `debugRay_${ray.id}`;
    group.add(arrow);
    arrows.set(ray.id, arrow);
    return arrow;
  }

  function update(packet = {}) {
    const rays = Object.values(packet.rays ?? {}).filter((ray) => {
      if (!ray?.visible) return false;
      if (!scope) return true;
      return ray.scope === scope;
    });
    const active = new Set(rays.map((ray) => ray.id));

    for (const ray of rays) {
      const arrow = ensureArrow(ray);
      const direction = vectorFromArray(ray.direction, new THREE.Vector3(0, 0, -1));
      if (direction.lengthSq() <= 0.000001) direction.set(0, 0, -1);
      direction.normalize();
      const origin = vectorFromArray(ray.origin, new THREE.Vector3());
      const length = Math.max(0.001, Number(ray.length ?? 1));
      arrow.position.copy(origin);
      arrow.setDirection(direction);
      arrow.setLength(length, Math.max(0.12, length * 0.16), Math.max(0.06, length * 0.07));
      arrow.setColor(new THREE.Color(colorOf(ray)));
      arrow.visible = ray.visible !== false;
      arrow.userData.debugRay = ray;
    }

    for (const [id, arrow] of arrows.entries()) {
      if (active.has(id)) continue;
      group.remove(arrow);
      arrow.dispose?.();
      arrows.delete(id);
    }

    return { group, count: arrows.size };
  }

  function setVisible(visible) {
    group.visible = visible !== false;
  }

  function dispose() {
    for (const arrow of arrows.values()) {
      group.remove(arrow);
      arrow.dispose?.();
    }
    arrows.clear();
    scene.remove(group);
  }

  return { id: 'three-debug-ray-adapter', group, update, setVisible, dispose };
}
