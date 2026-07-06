import { clone, mix, n, sampleColor, sampleTerrain } from "./hifi-terrain-core.js";

export function createRadialTerrainDomain(config = {}) {
  const bands = config.bands ?? [
    { id: "core", innerRadius: 0, outerRadius: 240, radialSegments: 88, angularSegments: 196, lod: 0 },
    { id: "near", innerRadius: 240, outerRadius: 900, radialSegments: 68, angularSegments: 176, lod: 1 },
    { id: "mid", innerRadius: 900, outerRadius: 2800, radialSegments: 48, angularSegments: 144, lod: 2 },
    { id: "far", innerRadius: 2800, outerRadius: 6500, radialSegments: 30, angularSegments: 112, lod: 3 }
  ];
  const originSnap = n(config.originSnap, 50);
  const state = {
    id: "infinite-radial-terrain-domain",
    mode: "camera-relative-radial-terrain",
    focus: { x: 0, y: 0, z: 0 },
    origin: { x: 0, z: 0 },
    originSnap,
    version: 0,
    bands: clone(bands),
    vertexBudget: bands.reduce((sum, band) => sum + (n(band.radialSegments) + 1) * (n(band.angularSegments) + 1), 0),
    lastOriginShift: null
  };
  function computeOrigin(focus) {
    return { x: Math.round(n(focus.x) / originSnap) * originSnap, z: Math.round(n(focus.z) / originSnap) * originSnap };
  }
  return {
    setFocus(focus = {}) {
      const nextFocus = { x: n(focus.x), y: n(focus.y), z: n(focus.z) };
      const nextOrigin = computeOrigin(nextFocus);
      const changed = nextOrigin.x !== state.origin.x || nextOrigin.z !== state.origin.z;
      state.focus = nextFocus;
      if (changed) {
        state.lastOriginShift = { from: clone(state.origin), to: clone(nextOrigin) };
        state.origin = nextOrigin;
        state.version += 1;
      }
      return this.getState();
    },
    getState: () => clone(state),
    getDescriptors() {
      return {
        id: state.id,
        focus: clone(state.focus),
        origin: clone(state.origin),
        originMode: "camera-relative",
        bands: state.bands.map((band) => ({ ...band, heightSampler: "infiniteRadialTerrain.height.v2", materialSampler: "infiniteRadialTerrain.material.v2" })),
        vertexBudget: state.vertexBudget,
        version: state.version,
        originSnap: state.originSnap
      };
    }
  };
}

export function createBandGeometry(THREE, descriptor, band, erosionSolver) {
  const radialSegments = Math.max(2, Math.floor(n(band.radialSegments, 16)));
  const angularSegments = Math.max(12, Math.floor(n(band.angularSegments, 64)));
  const positions = new Float32Array((radialSegments + 1) * (angularSegments + 1) * 3);
  const colors = new Float32Array((radialSegments + 1) * (angularSegments + 1) * 3);
  const indices = [];
  let cursor = 0;
  for (let r = 0; r <= radialSegments; r += 1) {
    const radius = mix(band.innerRadius, band.outerRadius, r / radialSegments);
    for (let a = 0; a <= angularSegments; a += 1) {
      const angle = a / angularSegments * Math.PI * 2;
      const x = descriptor.origin.x + Math.cos(angle) * radius;
      const z = descriptor.origin.z + Math.sin(angle) * radius;
      const sample = sampleTerrain(x, z, descriptor.focus, erosionSolver);
      const color = sampleColor(sample);
      positions[cursor * 3] = x;
      positions[cursor * 3 + 1] = sample.height;
      positions[cursor * 3 + 2] = z;
      colors[cursor * 3] = color[0];
      colors[cursor * 3 + 1] = color[1];
      colors[cursor * 3 + 2] = color[2];
      cursor += 1;
    }
  }
  for (let r = 0; r < radialSegments; r += 1) {
    for (let a = 0; a < angularSegments; a += 1) {
      const row = angularSegments + 1;
      const i = r * row + a;
      indices.push(i, i + 1, i + row, i + 1, i + row + 1, i + row);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
