export const thirdPersonFollowThroughDomain = {
  id: 'third-person-follow-through',
  title: 'ThirdPersonFollowThrough',
  owns: ['camera.thirdPersonFollow', 'controller.capsule', 'scene.grayboxArena', 'debug.metricRays', 'debug.stateExport', 'arenaFractal.rendererHandoff'],
  kits: ['third-person-follow-kit', 'rigged-actor-kit', 'three-debug-ray-adapter', 'n-core-debug-kit', 'third-person-arena-fractal-domain-kit'],
  description: 'A Nexus Engine experiment domain for validating reusable third-person follow camera behavior, rendered camera-relative movement, RGB metric debug rays, serializable controller state export, and renderer-neutral arena readability descriptors.'
};
