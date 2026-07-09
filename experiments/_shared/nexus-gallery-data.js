export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "Nexus Engine playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusEngine-Experiments",
  hint: "Browse the 14 collective experiment cards. Older removed routes live under deprecated/."
});

export const games = Object.freeze([
  {
    id: "peer-scene-transition",
    tab: "experiments",
    title: "Peer Scene Transition",
    route: "./experiments/peer-scene-transition/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Scene Host", tone: "gold" }, { label: "Story Flow", tone: "green" }, { label: "DSK", tone: "blue" }],
    description: "Story-scene orchestration proof where each HTML scene hosts itself, exits validate through scene state, small puzzle tokens unlock routes, and the debug panel exposes current scene, visited scenes, inventory, and transition ledgers."
  },
  {
    id: "vr-platformer-board",
    tab: "experiments",
    title: "VR Platformer Board",
    route: "./experiments/vr-platformer-board/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "VR Board", tone: "gold" }, { label: "Platformer", tone: "green" }, { label: "6DOF", tone: "blue" }],
    description: "Floating platformer board validation for XR pose, input, comfort, spatial anchor, stereo descriptors, and renderer-neutral ProtoKit state."
  },
  {
    id: "infinite-radial-terrain",
    tab: "experiments",
    title: "Infinite Radial Terrain",
    route: "./experiments/infinite-radial-terrain/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Terrain", tone: "gold" }, { label: "Radial LOD", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Camera-driven radial terrain tessellation demo with WASD flight, 50m origin snapping, a 200m closest LOD band, and high-difference procedural terrain."
  },
  {
    id: "high-fidelity-meadow",
    tab: "experiments",
    title: "High Fidelity Meadow",
    route: "./experiments/high-fidelity-meadow/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "WebGL", tone: "gold" }, { label: "Procedural", tone: "green" }, { label: "DSK Cutover", tone: "blue" }],
    description: "Procedural meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target ProtoKit domains."
  },
  {
    id: "tiny-diffusion-lab",
    tab: "experiments",
    title: "Tiny Diffusion Lab",
    route: "./experiments/tiny-diffusion-lab/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Open lab",
    tags: [{ label: "Diffusion", tone: "gold" }, { label: "Training", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Browser-host proof for the Nexus Engine diffusion module: train a tiny CPU denoiser, sample denoising frames, and save/load memory checkpoints through createNexusDiffusionKits."
  },
  {
    id: "fogline-relay",
    tab: "experiments",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "First Person", tone: "gold" }, { label: "Scan", tone: "green" }, { label: "Fog", tone: "blue" }],
    description: "First-person survey loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  {
    id: "nexus-frontier-signal-isles",
    tab: "experiments",
    title: "Nexus Frontier: Signal Isles",
    route: "./experiments/nexus-frontier-signal-isles/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Field Engineer", tone: "gold" }, { label: "Systems", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Field-engineer slice for scan, harvest, build, pressure, gates, route, cargo, beacon, feedback, and debug/replay surfaces."
  },
  {
    id: "the-cavalry-of-rome",
    tab: "experiments",
    title: "The Cavalry of Rome",
    route: "./apps/the-cavalry-of-rome/",
    kind: "experiment",
    visual: "strategy",
    playLabel: "Play experiment",
    tags: [{ label: "Painted Terrain", tone: "gold" }, { label: "Pannable Map", tone: "green" }, { label: "Full Soldiers", tone: "blue" }],
    description: "High-fidelity DSK visual proof: pan across a painterly Roman terrain map, hover large regions, dive cinematically, and reveal primitive-built full-bodied armies preparing for war."
  },
  {
    id: "signal-bastion",
    tab: "games",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Tower Defense", tone: "gold" }, { label: "2.5D Cel", tone: "green" }, { label: "Tactics", tone: "blue" }],
    description: "2.5D cel-style defense game with gameplay HUD, tower cards, context panel, placement ghost, range rings, and content pass."
  },
  {
    id: "stonewake-depths",
    tab: "games",
    title: "Stonewake Depths",
    route: "./games/stonewake-depths/",
    kind: "game",
    visual: "fogline",
    playLabel: "Play game",
    tags: [{ label: "Flood Rescue", tone: "gold" }, { label: "Puzzle Platformer", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Flooded cavern rescue game with block carrying, valve pressure, rune-plate gate logic, survivor echo pings, chalk path marks, air pockets, rope lifts, and rescue-bell extraction descriptors."
  },
  {
    id: "next-ledge",
    tab: "experiments",
    title: "Next Ledge",
    route: "./experiments/next-ledge/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Grapple", tone: "gold" }, { label: "Climb", tone: "green" }, { label: "Route", tone: "blue" }],
    description: "Grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and a Three.js host."
  },
  {
    id: "sora-the-infinite",
    tab: "experiments",
    title: "Sora The Infinite",
    route: "./experiments/sora-the-infinite/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Open Flight", tone: "gold" }, { label: "Visual Domains", tone: "green" }, { label: "World", tone: "blue" }],
    description: "Open aerial traversal route that redirects into The Open Above and now exposes visualDomains for cloud strata, horizon ridgelines, thermal markers, speed ribbons, wingtip contrails, and flight mood readability."
  },
  {
    id: "zombie-orchard",
    tab: "experiments",
    title: "Zombie Orchard",
    route: "./experiments/zombie-orchard/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [{ label: "Survival", tone: "gold" }, { label: "Horde", tone: "red" }, { label: "Scavenge", tone: "green" }],
    description: "Survival slice for rounds, pressure, pickups, weapons, orchard content, and debug-friendly runtime state."
  },
  {
    id: "rogue-lite-hellscape-siege",
    tab: "games",
    title: "Rogue-Lite Hellscape Siege",
    route: "./games/rogue-lite-hellscape-siege/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Action RPG", tone: "gold" }, { label: "Base Siege", tone: "green" }, { label: "Harvest", tone: "red" }],
    description: "Base route for realm portals, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  }
]);

export const tabs = Object.freeze([
  { id: "experiments", label: "Experiments", count: games.filter((app) => app.tab === "experiments").length },
  { id: "games", label: "Games", count: games.filter((app) => app.tab === "games").length }
]);

export const apps = games;
