export const thirdPersonFollowThroughDomain = {
  id: 'third-person-follow-through',
  title: 'ThirdPersonFollowThrough',
  owns: ['camera.thirdPersonFollow', 'controller.capsule', 'scene.grayboxArena'],
  kits: ['third-person-follow-kit'],
  description: 'A Nexus Engine experiment domain for validating reusable third-person follow camera behavior against a capsule target in a graybox arena.'
};
