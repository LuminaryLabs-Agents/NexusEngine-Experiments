export const thirdPersonFollowThroughDomain = {
  id: 'third-person-follow-through',
  title: 'ThirdPersonFollowThrough',
  owns: ['camera.thirdPersonFollow', 'controller.capsule', 'scene.grayboxArena', 'debug.metricRays', 'debug.stateExport', 'arenaFractal.rendererHandoff', 'locomotionReadability.rendererHandoff', 'cameraCompositionReadability.rendererHandoff'],
  kits: ['third-person-follow-kit', 'rigged-actor-kit', 'three-debug-ray-adapter', 'n-core-debug-kit', 'third-person-arena-fractal-domain-kit', 'third-person-locomotion-readability-domain-kit', 'third-person-camera-composition-readability-domain-kit'],
  description: 'A Nexus Engine experiment domain for validating reusable third-person follow camera behavior, rendered camera-relative movement, RGB metric debug rays, serializable controller state export, renderer-neutral arena descriptors, locomotion readability descriptors, and camera composition readability descriptors for focus framing, shoulder clearance, near clip cushions, orbit rails, occlusion veils, and camera comfort meters.'
};
