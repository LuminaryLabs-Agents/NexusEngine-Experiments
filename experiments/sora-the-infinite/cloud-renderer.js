function hashUnit(seed) {
  let hash = 2166136261;
  const text = String(seed);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000003) / 1000003;
}

function wrapOffset(value, span) {
  return ((value % span) + span) % span - span / 2;
}

function instanceCountForLayer(layer) {
  const base = layer.id === 'high-veil' ? 72 : 132;
  return Math.max(24, Math.floor(base * Math.max(0.18, Number(layer.opacity ?? 0.3) / 0.34)));
}

function createLayerRecord(THREE, scene, layer) {
  const count = instanceCountForLayer(layer);
  const geometry = new THREE.SphereGeometry(1, 8, 5);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: Math.min(0.56, Math.max(0.04, Number(layer.opacity ?? 0.28))),
    depthWrite: false,
    depthTest: true
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  mesh.renderOrder = -8;
  scene.add(mesh);
  return { count, geometry, material, mesh };
}

export function createCloudRenderer(THREE, scene) {
  const layers = new Map();
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();

  function disposeLayer(record) {
    scene.remove(record.mesh);
    record.mesh.dispose?.();
    record.geometry.dispose();
    record.material.dispose();
  }

  function updateLayer(layer, state) {
    const id = layer.id ?? 'cloud-layer';
    const desiredCount = instanceCountForLayer(layer);
    let record = layers.get(id);
    if (!record || record.count !== desiredCount) {
      if (record) disposeLayer(record);
      record = createLayerRecord(THREE, scene, layer);
      layers.set(id, record);
    }

    const body = state.body ?? {};
    const bodyPosition = body.position ?? {};
    const elapsed = Number(state.elapsed ?? 0);
    const drift = layer.drift ?? {};
    const altitude = Number(layer.altitude ?? 900);
    const thickness = Math.max(40, Number(layer.thickness ?? 180));
    const opacity = Math.min(0.58, Math.max(0.03, Number(layer.opacity ?? 0.28)));
    const span = id === 'high-veil' ? 7600 : 5200;
    const baseWidth = id === 'high-veil' ? 380 : 260;
    const baseHeight = id === 'high-veil' ? 28 : 46;
    const baseDepth = id === 'high-veil' ? 180 : 150;
    const driftX = Number(drift.x ?? 0) * 900 * elapsed;
    const driftZ = Number(drift.z ?? 0) * 900 * elapsed;

    record.material.opacity = opacity;

    for (let index = 0; index < record.count; index += 1) {
      const cluster = Math.floor(index / 5);
      const puff = index % 5;
      const seed = `${id}:${cluster}:${puff}`;
      const clusterX = hashUnit(`${seed}:cx`) * span;
      const clusterZ = hashUnit(`${seed}:cz`) * span;
      const localX = (hashUnit(`${seed}:lx`) - 0.5) * baseWidth * 1.55;
      const localZ = (hashUnit(`${seed}:lz`) - 0.5) * baseDepth * 1.65;
      const localY = (hashUnit(`${seed}:ly`) - 0.5) * thickness;
      const x = Number(bodyPosition.x ?? 0) + wrapOffset(clusterX + driftX, span) + localX;
      const z = Number(bodyPosition.z ?? 0) + wrapOffset(clusterZ + driftZ, span) + localZ;
      const y = altitude + localY;
      const puffScale = 0.72 + hashUnit(`${seed}:s`) * 0.72;
      position.set(x, y, z);
      scale.set(baseWidth * puffScale, baseHeight * puffScale, baseDepth * puffScale);
      matrix.compose(position, rotation, scale);
      record.mesh.setMatrixAt(index, matrix);
    }
    record.mesh.instanceMatrix.needsUpdate = true;
  }

  return {
    update(state = {}) {
      const wanted = new Set();
      for (const layer of state.weather?.cloudLayers ?? []) {
        if (Number(layer.opacity ?? 0) <= 0.01) continue;
        const id = layer.id ?? 'cloud-layer';
        wanted.add(id);
        updateLayer(layer, state);
      }
      for (const [id, record] of layers) {
        if (wanted.has(id)) continue;
        disposeLayer(record);
        layers.delete(id);
      }
    },
    dispose() {
      for (const record of layers.values()) disposeLayer(record);
      layers.clear();
    }
  };
}
