import { clone, mix, n, sampleColor, sampleTerrain } from "./terrain-world-stack.js";

export function createRadialTerrainDomain(config = {}) {
  const bands = config.bands ?? [
    { id: "core", innerRadius: 0, outerRadius: 520, radialSegments: 112, angularSegments: 240, lod: 0, transitionWidth: 0, canChangeTopology: false, sampleFieldLod: "near" },
    { id: "near", innerRadius: 470, outerRadius: 1800, radialSegments: 78, angularSegments: 208, lod: 1, transitionWidth: 180, canChangeTopology: true, sampleFieldLod: "near" },
    { id: "mid", innerRadius: 1600, outerRadius: 6000, radialSegments: 54, angularSegments: 168, lod: 2, transitionWidth: 520, canChangeTopology: true, sampleFieldLod: "mid" },
    { id: "far", innerRadius: 5400, outerRadius: 16000, radialSegments: 32, angularSegments: 128, lod: 3, transitionWidth: 1400, canChangeTopology: true, sampleFieldLod: "far" }
  ];
  const originSnap = n(config.originSnap, 250);
  const state = {
    id: "infinite-radial-terrain-domain",
    mode: "camera-relative-radial-terrain",
    focus: { x: 0, y: 0, z: 0 },
    origin: { x: 0, z: 0 },
    originSnap,
    version: 0,
    bands: clone(bands),
    vertexBudget: bands.reduce((sum, band) => sum + (n(band.radialSegments) + 1) * (n(band.angularSegments) + 1), 0),
    lastOriginShift: null,
    stability: {
      heightSpace: "stable-world",
      erosionSpace: "stable-world",
      hydrologySpace: "stable-world",
      renderSpace: "camera-relative-window",
      coreTransitionFree: true,
      minRebaseDistance: originSnap
    }
  };
  function computeOrigin(focus) {
    const dx = n(focus.x) - state.origin.x;
    const dz = n(focus.z) - state.origin.z;
    if (Math.max(Math.abs(dx), Math.abs(dz)) < originSnap) return state.origin;
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
        bands: state.bands.map((band) => ({ ...band, heightSampler: "terrainWorldStack.height.v1", materialSampler: "terrainWorldStack.material.v1" })),
        vertexBudget: state.vertexBudget,
        version: state.version,
        originSnap: state.originSnap,
        stability: clone(state.stability)
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
