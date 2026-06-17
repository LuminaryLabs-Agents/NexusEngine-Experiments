const aaaBatchGameSpecs = [
  {
    id: "ember-rail",
    title: "Ember Rail",
    route: "./experiments/aaa-batch/ember-rail/",
    fantasy: "Surf a molten mag-rail through a collapsing forge canyon.",
    verb: "Switch rails and vent heat",
    pressureLoop: "Speed rises, rails fracture, heat climbs, missed vents cause derail.",
    visualIdentity: "Orange-black foundry, molten rivers, sparks, rail glow, heat shimmer.",
    controls: "A/D switch rail, Space jump gaps, E vent at coolant gates, R restart.",
    kitStack: ["action-input-kit", "route-checkpoint-kit", "resource-pressure-kit", "visual-fidelity-maker-kit"],
    palette: ["#130604", "#ff7a2f", "#ffd166", "#1c0f0b"],
    smoke: ["switchLane:right", "jump", "vent"]
  },
  {
    id: "tideglass-salvage",
    title: "Tideglass Salvage",
    route: "./experiments/aaa-batch/tideglass-salvage/",
    fantasy: "Pilot a glass-hulled salvage skiff through storm ruins and extract relic crates.",
    verb: "Sail, dock, and recover",
    pressureLoop: "Wind drift, wave impact, cargo instability, storm timer.",
    visualIdentity: "Teal storm sea, glass reflections, sunken towers, foam trails, lightning silhouettes.",
    controls: "W/S throttle, A/D rudder, Shift trim sail, E recover at wreck, R restart.",
    kitStack: ["action-input-kit", "cargo-delivery-kit", "timed-pressure-director-kit", "water-surface-kit"],
    palette: ["#04191d", "#1dd3c7", "#9ef7ff", "#08293b"],
    smoke: ["throttle:1", "steer:right", "recover"]
  },
  {
    id: "echo-lock",
    title: "Echo Lock",
    route: "./experiments/aaa-batch/echo-lock/",
    fantasy: "Crack a cathedral vault by matching sonic tumblers before patrols hear you.",
    verb: "Tune resonance",
    pressureLoop: "Noise increases alert; wrong pulses scramble tumblers; patrol sweep closes.",
    visualIdentity: "Violet-gold vault rings, waveform lines, candlelit stone, pulse ripples.",
    controls: "Mouse tune cursor, A/D shift frequency, Space pulse, E dampen, R restart.",
    kitStack: ["action-input-kit", "timed-pressure-director-kit", "audio-event-feedback-maker-kit", "scenario-qa-harness"],
    palette: ["#12071d", "#b46cff", "#ffe36d", "#25142d"],
    smoke: ["tune:1", "pulse", "dampen"]
  },
  {
    id: "hollow-warden",
    title: "Hollow Warden",
    route: "./experiments/aaa-batch/hollow-warden/",
    fantasy: "Defend a dying forest beacon by placing living wards against corruption.",
    verb: "Place and rotate wards",
    pressureLoop: "Corruption waves split lanes; beacon charge drains; bad placement leaks damage.",
    visualIdentity: "Emerald-black grove, luminous roots, ward sigils, creeping shadow veins.",
    controls: "Mouse place ward, Q/E rotate, 1/2/3 select ward type, Space channel beacon, R restart.",
    kitStack: ["zone-field-kit", "hazard-director-kit", "resource-pressure-kit", "gamehost-standard-kit"],
    palette: ["#06160d", "#38d47a", "#caff75", "#081f13"],
    smoke: ["selectWard:root", "placeWard", "channel"]
  },
  {
    id: "skyrig-suture",
    title: "Skyrig Suture",
    route: "./experiments/aaa-batch/skyrig-suture/",
    fantasy: "Repair a floating storm rig by tethering broken conduits before platforms shear away.",
    verb: "Tether and repair",
    pressureLoop: "Platforms drift apart; conduit arcs destabilize; battery drains while tethered.",
    visualIdentity: "Blue-white sky platforms, brass rigging, electric cables, cloud abyss, repair sparks.",
    controls: "WASD move, mouse aim, Click fire tether, Hold E repair, Space jump, R restart.",
    kitStack: ["action-input-kit", "route-field-kit", "resource-pressure-kit", "camera-cinematic-maker-kit"],
    palette: ["#071526", "#7bdff2", "#ffd166", "#17324d"],
    smoke: ["move:conduit", "fireTether", "repair"]
  },
  {
    id: "mirage-stalker",
    title: "Mirage Stalker",
    route: "./experiments/aaa-batch/mirage-stalker/",
    fantasy: "Cross a sun-blasted palace by blinking between shadows while sentries scan.",
    verb: "Shadow-step",
    pressureLoop: "Exposure rises in light; guard cones sweep; blink charges recover only in shade.",
    visualIdentity: "Gold desert palace, blue shadow pools, heat haze, white sun shafts, sentinel masks.",
    controls: "WASD move, Click shadow-step to valid shade, E throw decoy, Shift crouch, R restart.",
    kitStack: ["action-input-kit", "spatial-guidance-kit", "agent-group-kit", "hazard-director-kit"],
    palette: ["#1d1407", "#f3bd37", "#57c7ff", "#3d260a"],
    smoke: ["blink:shade", "crouch", "decoy"]
  },
  {
    id: "core-diver",
    title: "Core Diver",
    route: "./experiments/aaa-batch/core-diver/",
    fantasy: "Dive into a flooded reactor core to extract rods before radiation peaks.",
    verb: "Dive, grab, and surface",
    pressureLoop: "Oxygen falls, radiation climbs with depth, current pushes player off route.",
    visualIdentity: "Cyan reactor pool, green radiation bloom, bubbles, red warning strobes, metallic depth layers.",
    controls: "WASD swim, Space dive/surface axis, E grab rod, Shift burst swim, R restart.",
    kitStack: ["water-surface-kit", "resource-pressure-kit", "cargo-delivery-kit", "scenario-qa-harness"],
    palette: ["#031416", "#00d5ff", "#6bf0b8", "#10252a"],
    smoke: ["vertical:down", "grab", "vertical:up"]
  },
  {
    id: "starwell-cartographer",
    title: "Starwell Cartographer",
    route: "./experiments/aaa-batch/starwell-cartographer/",
    fantasy: "Map a shifting astral basin by anchoring beacons before the rift folds shut.",
    verb: "Survey and anchor",
    pressureLoop: "Rift drift corrupts map coverage; anchors stabilize zones but consume charge.",
    visualIdentity: "Indigo starfield terrain, luminous grid lines, floating islands, compass beams, cosmic fog.",
    controls: "WASD move cursor/ship, Click place anchor, Q scan pulse, E recall anchor, R restart.",
    kitStack: ["scan-survey-kit", "route-field-kit", "resource-pressure-kit", "deterministic-replay-harness"],
    palette: ["#090b24", "#7c6cff", "#f5f1ff", "#14154a"],
    smoke: ["scan", "placeAnchor", "placeAnchor"]
  },
  {
    id: "gravity-anvil",
    title: "Gravity Anvil",
    route: "./experiments/aaa-batch/gravity-anvil/",
    fantasy: "Forge star-metal by slinging ore through orbiting gravity wells.",
    verb: "Sling",
    pressureLoop: "Orbit decay increases instability; bad launches shatter ore; forge window closes.",
    visualIdentity: "Cosmic blacksmith arena, blue gravity wells, gold-hot ore trails, star sparks.",
    controls: "Drag/release aim, A/D nudge orbit, Space forge, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "route-topology-data", "action-window-data"],
    palette: ["#050711", "#1a5cff", "#ffb347", "#f6f0d0"],
    smoke: ["aimSling", "releaseOre", "forgeAtAnvil"]
  },
  {
    id: "lantern-vow",
    title: "Lantern Vow",
    route: "./experiments/aaa-batch/lantern-vow/",
    fantasy: "Seal roaming spirits by drawing sacred lantern circles before the shrine goes dark.",
    verb: "Encircle",
    pressureLoop: "Lantern oil drains; spirits split when missed; shrine fear rises.",
    visualIdentity: "Night shrine, paper lantern glow, ink circles, pale spirit trails, red ward gates.",
    controls: "Mouse draw seal path, E ignite lantern, Space banish, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "spatial-query-data", "affordance-descriptor-kit"],
    palette: ["#09060d", "#ffcf70", "#f5f0df", "#b9384e"],
    smoke: ["igniteLantern", "drawSeal", "banishSpirit"]
  },
  {
    id: "mammoth-bell",
    title: "Mammoth Bell",
    route: "./experiments/aaa-batch/mammoth-bell/",
    fantasy: "Guide a caravan of crystal mammoths across a collapsing glacier.",
    verb: "Herd",
    pressureLoop: "Herd panic rises; ice cracks spread; avalanche meter advances.",
    visualIdentity: "Arctic blue glacier, giant luminous mammoths, brass bells, snow gusts, crack lines.",
    controls: "A/D move caller, Click place bell marker, E calm herd, Space drive forward, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "route-topology-data", "ai-intent-data"],
    palette: ["#061923", "#a8ecff", "#f6fbff", "#c49a52"],
    smoke: ["placeBell", "driveHerd", "calmHerd"]
  },
  {
    id: "mirrorfall-prism",
    title: "Mirrorfall Prism",
    route: "./experiments/aaa-batch/mirrorfall-prism/",
    fantasy: "Rotate ancient prisms to catch falling moonlight before an eclipse consumes the temple.",
    verb: "Redirect",
    pressureLoop: "Eclipse shadow advances; prisms overload; wrong beams awaken sentry statues.",
    visualIdentity: "Silver temple, violet moonbeams, rotating glass prisms, black eclipse wall.",
    controls: "Click prism select, Q/E rotate, Space lock beam, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "action-window-data", "affordance-descriptor-kit"],
    palette: ["#0b0b18", "#d7e8ff", "#8f6bff", "#2d1f4f"],
    smoke: ["selectPrism", "rotatePrism", "lockBeam"]
  },
  {
    id: "thunder-kite",
    title: "Thunder Kite",
    route: "./experiments/aaa-batch/thunder-kite/",
    fantasy: "Fly a ritual kite through storm gates to harvest lightning without snapping the tether.",
    verb: "Tack",
    pressureLoop: "Gusts spike tether tension; lightning charge overloads; storm gates drift.",
    visualIdentity: "High storm sky, silk kite, glowing tether, rain sheets, electric clouds.",
    controls: "A/D tack, W/S climb/dive, Space discharge, Shift slack line, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "route-topology-data", "camera-intent-descriptor-kit"],
    palette: ["#07101f", "#7ad7ff", "#f7e36b", "#ffffff"],
    smoke: ["tackRight", "collectCharge", "dischargeAtGate"]
  },
  {
    id: "glyph-sprinter",
    title: "Glyph Sprinter",
    route: "./experiments/aaa-batch/glyph-sprinter/",
    fantasy: "Race across a blank void by drawing runes that become temporary platforms.",
    verb: "Inscribe",
    pressureLoop: "Ink reserve drains; glyph platforms decay; void wave catches slow routes.",
    visualIdentity: "White-black void, neon calligraphy, dissolving rune bridges, trailing ink particles.",
    controls: "WASD run, Mouse draw glyph, Space leap, E stabilize glyph, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "action-window-data", "procedural-layout-data"],
    palette: ["#020207", "#f7f7ef", "#00f0ff", "#ff3df2"],
    smoke: ["drawGlyph", "leap", "stabilizeGlyph"]
  },
  {
    id: "sporewright-canopy",
    title: "Sporewright Canopy",
    route: "./experiments/aaa-batch/sporewright-canopy/",
    fantasy: "Grow living mushroom bridges through a vertical rainforest before rot eats the canopy.",
    verb: "Cultivate",
    pressureLoop: "Rot spreads; spore charge regens slowly; unstable caps collapse under weight.",
    visualIdentity: "Bioluminescent jungle, giant mushrooms, amber spores, green rot veins, mist shafts.",
    controls: "Click plant spore, Q/E choose strain, Space bloom bridge, E cleanse rot, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "affordance-descriptor-kit", "procedural-layout-data"],
    palette: ["#05150b", "#38ff9d", "#f2b95e", "#a64cff"],
    smoke: ["plantSpore", "bloomBridge", "cleanseRot"]
  },
  {
    id: "rift-bazaar",
    title: "Rift Bazaar",
    route: "./experiments/aaa-batch/rift-bazaar/",
    fantasy: "Trade cursed relics in a shifting market before debt collectors seal the portal.",
    verb: "Barter",
    pressureLoop: "Debt timer rises; prices mutate; cursed goods corrupt inventory slots.",
    visualIdentity: "Floating night market, portal stalls, coin sparks, mask merchants, purple rift fog.",
    controls: "A/D choose stall, Click inspect item, E trade, Q cleanse curse, R restart.",
    kitStack: ["generic-pressure-loop-kit", "generic-resource-loop-kit", "inventory-economy-data", "affordance-descriptor-kit"],
    palette: ["#12081c", "#ffcc66", "#b05cff", "#32ffd2"],
    smoke: ["inspectRelic", "tradeItem", "cleanseCurse"]
  }
];

export const aaaBatchGames = Object.freeze(aaaBatchGameSpecs.map((game) => Object.freeze({
  ...game,
  routePath: game.route,
  smokeActions: Object.freeze([...game.smoke])
})));

export const aaaBatchGalleryGames = Object.freeze(aaaBatchGames.map((game) => ({
  id: `aaa-${game.id}`,
  title: game.title,
  route: game.route,
  kind: "experiment",
  visual: "showcase",
  playLabel: "Play seed",
  tags: [
    { label: "AAA seed", tone: "gold" },
    { label: game.verb.split(" ")[0], tone: "green" },
    { label: game.kitStack[0], tone: "blue" }
  ],
  description: `${game.fantasy} ${game.pressureLoop}`
})));

export function getAaaBatchGame(id) {
  return aaaBatchGames.find((game) => game.id === id) ?? null;
}
