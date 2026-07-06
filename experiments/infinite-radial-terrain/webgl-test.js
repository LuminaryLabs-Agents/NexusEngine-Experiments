export function createRenderer(THREE, canvas) {
  return new THREE.WebGLRenderer({ canvas, antialias: true });
}
