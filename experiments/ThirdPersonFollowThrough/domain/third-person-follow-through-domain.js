export const thirdPersonFollowThroughDomain = {
  id: 'third-person-follow-through',
  title: 'ThirdPersonFollowThrough',
  owns: ['camera.thirdPersonFollow', 'controller.capsule', 'scene.grayboxArena', 'debug.metricRays', 'debug.stateExport', 'arenaFractal.rendererHandoff', 'locomotionReadability.rendererHandoff', 'cameraCompositionReadability.rendererHandoff', 'navigationChallengeReadiness.rendererHandoff'],
  kits: ['third-person-follow-kit', 'rigged-actor-kit', 'three-debug-ray-adapter', 'n-core-debug-kit', 'third-person-arena-fractal-domain-kit', 'third-person-locomotion-readability-domain-kit', 'third-person-camera-composition-readability-domain-kit', 'third-person-navigation-challenge-readiness-domain-kit'],
  description: 'A Nexus Engine experiment domain for validating reusable third-person follow camera behavior, rendered camera-relative movement, RGB metric debug rays, serializable controller state export, renderer-neutral arena descriptors, locomotion readability descriptors, camera composition readability descriptors, and navigation challenge readiness descriptors for checkpoint routing, turn commitment, vault windows, recovery pockets, camera/actor sync, and finish commitment.'
};
