export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "Nexus Engine playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusEngine-Experiments",
  hint: "Browse the 16 collective experiment cards. Older removed routes live under deprecated/."
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
    tags: [{ label: "Scene Host", tone: "gold" }, { label: "Bell Archive", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Story-scene orchestration proof where each HTML scene hosts itself, exits validate through scene state, small puzzle tokens unlock routes, and bell archive evacuation kits add tower anchors, signal cords, sealed archive crates, flood plank crossings, witness roster seals, and dawn evidence ledgers."
  },
  {
    id: "vr-platformer-board",
    tab: "experiments",
    title: "VR Platformer Board",
    route: "./experiments/vr-platformer-board/skyline-medevac.html",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "VR Board", tone: "gold" }, { label: "Skyline Medevac", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Board-scale platformer rescue pass with tether pylons, harness threads, crosswind ribbons, oxygen canisters, medevac pod staging, and descriptor-only skyline medevac readiness over the jump/coin/hazard loop."
  },
  {
    id: "infinite-radial-terrain",
    tab: "experiments",
    title: "Infinite Radial Terrain",
    route: "./experiments/infinite-radial-terrain/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Terrain", tone: "gold" }, { label: "Glacier Beacon", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Camera-driven radial terrain tessellation demo with WASD flight, 50m origin snapping, a 200m closest LOD band, aquifer cartography, and glacier beacon rescue descriptors for moraine cairns, whiteout smoke columns, ice bridge flags, crevasse rope rakes, sled caches, and dawn beacon ledgers."
  },
  {
    id: "high-fidelity-meadow",
    tab: "experiments",
    title: "High Fidelity Meadow",
    route: "./experiments/high-fidelity-meadow/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "WebGL", tone: "gold" }, { label: "Soil Mycelium", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Procedural meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, visual-target, ecology, creek irrigation, and soil mycelium restoration domains with descriptor-only underground threads, mushroom rings, beetle lanes, hedgerow windbreaks, and dawn soil health ledgers."
  },
  {
    id: "tiny-diffusion-lab",
    tab: "experiments",
    title: "Tiny Diffusion Lab",
    route: "./experiments/tiny-diffusion-lab/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Open lab",
    tags: [{ label: "Diffusion", tone: "gold" }, { label: "Curriculum Kiln", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Browser-host diffusion proof with tiny CPU training, sampling, checkpoints, dataset expeditions, sample clinic review, latent museum curation, repair mural recovery, and curriculum kiln readiness for seed tiles, noise ramps, overfit sentinels, artifact trays, checkpoint sigils, and export ledgers."
  },
  {
    id: "living-agent-lab",
    tab: "experiments",
    title: "Living Agent Lab",
    route: "./experiments/living-agent-lab/",
    kind: "experiment",
    visual: "next",
    playLabel: "Open lab",
    tags: [{ label: "ONNX Agent", tone: "gold" }, { label: "Civic Festival", tone: "green" }, { label: "Descriptors", tone: "blue" }],
    description: "Small market-agent route where an ONNX or fallback guard chooses actions from visible state while market-trust and civic-festival mediation kits expose permit scrolls, vendor lanes, lantern routes, dispute hearings, steward posts, and night-market ledgers."
  },
  {
    id: "fogline-relay",
    tab: "experiments",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "First Person", tone: "gold" }, { label: "Signal Courier", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "First-person survey loop for scan targets, fog zones, timed pressure, hazard state, rescue/clinic/lighthouse/tide overlays, fog observatory calibration, and signal courier evacuation descriptors for semaphore lamp shutters, message ribbon spools, chalk arrows, stretcher caches, safehouse tokens, and dawn courier ledgers."
  },
  {
    id: "nexus-frontier-signal-isles",
    tab: "experiments",
    title: "Nexus Frontier: Signal Isles",
    route: "./experiments/nexus-frontier-signal-isles/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Field Engineer", tone: "gold" }, { label: "Solar Desalination", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Field-engineer island slice with scan, harvest, build, pressure, gates, cargo, storm surge relay, field-hospital triage, and solar desalination descriptors for salt pan gauges, solar still frames, mangrove charcoal filters, cistern jars, ration buoys, and dawn water ledgers."
  },
  {
    id: "the-cavalry-of-rome",
    tab: "experiments",
    title: "The Cavalry of Rome",
    route: "./apps/the-cavalry-of-rome/",
    kind: "experiment",
    visual: "strategy",
    playLabel: "Play experiment",
    tags: [{ label: "Painted Terrain", tone: "gold" }, { label: "Standard Morale", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "High-fidelity DSK visual proof with pannable Roman terrain, region hover/cinematic dive interactions, primitive-built armies, and standard-bearer morale descriptors for aquila standards, vexillum rally routes, cohort cadence drums, guard rings, wounded standard litters, and dusk honor ledgers."
  },
  {
    id: "signal-bastion",
    tab: "games",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Tower Defense", tone: "gold" }, { label: "Supply Convoy", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "2.5D cel-style defense game with tower cards, context panels, placement ghosts, range rings, field-hospital overlays, and supply-convoy readiness descriptors for ammo pallets, ration water, convoy lanes, ambush watch arcs, repair crew routes, and night quartermaster ledgers."
  },
  {
    id: "stonewake-depths",
    tab: "games",
    title: "Stonewake Depths",
    route: "./games/stonewake-depths/",
    kind: "game",
    visual: "fogline",
    playLabel: "Play game",
    tags: [{ label: "Flood Rescue", tone: "gold" }, { label: "Glowworm Cartography", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Flooded cavern rescue game with block carrying, valve pressure, rune-plate gate logic, survivor echo pings, cave clinic triage, pressure pump descriptors, silt archive drainage, and glowworm cartography descriptors for glowworm clusters, phosphate wall charts, chalk arrows, rope handlines, cave bells, and dawn map ledgers."
  },
  {
    id: "next-ledge",
    tab: "experiments",
    title: "Next Ledge",
    route: "./experiments/next-ledge/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Grapple", tone: "gold" }, { label: "Drone Relay", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, glacier supply, avalanche rescue, summit weather station readiness, and drone relay rescue descriptors for phosphor anchors, snow flags, drone perches, rescue cable spools, heat beacons, and extraction ledgers."
  },
  {
    id: "third-person-follow-through",
    tab: "experiments",
    title: "Third Person Follow Through",
    route: "./experiments/ThirdPersonFollowThrough/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Controller", tone: "gold" }, { label: "Afterimage Rescue", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Third-person controller validation route with spring-arm camera, debug rays, locomotion readability, medevac overlays, traversal-course descriptors, and afterimage-rescue descriptors for motion echoes, landing dust, rescue flares, rope-swing arcs, signal drones, and dawn run ledgers."
  },
  {
    id: "sora-the-infinite",
    tab: "experiments",
    title: "Sora The Infinite",
    route: "./experiments/sora-the-infinite/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Open Flight", tone: "gold" }, { label: "Radio Beacon", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Open aerial traversal gateway into The Open Above with rescue, lighthouse, rookery, star orchard, and sky radio beacon descriptors for cloud radio masts, distress frequency bands, lightning gaps, thermal relay buoys, sky stretcher cradles, and dawn radio ledgers."
  },
  {
    id: "zombie-orchard",
    tab: "experiments",
    title: "Zombie Orchard",
    route: "./experiments/zombie-orchard/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [{ label: "Survival", tone: "gold" }, { label: "Cider Mill Refuge", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Survival slice for rounds, horde pressure, pickups, weapons, orchard content, and rescue readiness overlays including cure crafting, seed quarantine, antiserum wellhouse, watchtower radio fences, and cider mill refuge descriptors for cider presses, root cellar caches, lantern routes, sawbuck barricades, refugee wagons, and dawn refuge ledgers."
  },
  {
    id: "rogue-lite-hellscape-siege",
    tab: "games",
    title: "Rogue-Lite Hellscape Siege",
    route: "./games/rogue-lite-hellscape-siege/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Action RPG", tone: "gold" }, { label: "Harvester Covenant", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Base-siege action route for realm portals, inventory, harvesting, building, wave-defense, ash caravan, forge, blood moon refuge, ember well purification, obsidian seed vault, and harvester covenant descriptors for bloodroot plots, ash sickle paths, ember tithe bowls, demon audit seals, covenant wagon wheels, and dawn covenant ledgers."
  },
  {
    id: "onnx-agent-lab",
    tab: "experiments",
    title: "ONNX Agent Lab",
    route: "./experiments/onnx-agent-lab/signal-calibration.html",
    kind: "experiment",
    visual: "next",
    playLabel: "Open lab",
    tags: [{ label: "ONNX Workshop", tone: "gold" }, { label: "Signal Calibration", tone: "green" }, { label: "Nexus Engine", tone: "blue" }],
    description: "Signal-calibration workshop route for model handshakes, fallback safety rails, tool bench cues, prompt intent threads, memory trace cards, and scene-open gates using descriptor-only NexusEngine readiness kits."
  }
]);

export const tabs = Object.freeze([
  { id: "experiments", label: "Experiments", count: games.filter((app) => app.tab === "experiments").length },
  { id: "games", label: "Games", count: games.filter((app) => app.tab === "games").length }
]);

export const apps = games;
