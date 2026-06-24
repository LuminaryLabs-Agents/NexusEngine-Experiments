# Open Above V2 Bird Flight Simulator Domain Plan

## Goal

Turn `experiments/the-open-above-v2/` from a flight harness into a high-fidelity, data-driven bird flight simulator built from many small NexusRealtime domain kits.

The simulator should feel like a living sky ecology:

```txt
bird body + wings + feathers
airflow + lift + turbulence
cloud volumes + rain + weather
terrain + ridge lift + perches
objects + vegetation + flock behavior
camera + audio + render descriptors
```

The route should remain the only Experiment changed during this rollout.

The Experiment should become a composition host. The reusable work should move into ProtoKits first, then later into NexusRealtime core only after validation.

## Branch Pinning Decision

Open Above V2 should consume the current active branches for the engine and ProtoKits while the simulator is under active development.

Current runtime policy:

```txt
NexusRealtime: main
NexusRealtime-ProtoKits: main
Three.js: explicit npm version
```

`three` remains pinned to an npm version because it is not a GitHub branch dependency.

The first committed change is:

```txt
protoKitBaseUrl:
  from https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits
  to   https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits
```

## Product Goal

The player is a bird in a layered sky-world.

The player should read the environment, not just steer through empty space.

Core verbs:

```txt
glide
bank
carve
dive
swoop
climb
flap
recover
follow flock
enter cloud
catch lift
avoid storm
perch
launch
```

The satisfying moment:

```txt
Dive along terrain, feel speed build, bank around a ridge, catch lift under a cloud, climb through rain, stabilize with the flock, then glide into open sky.
```

## Architecture Goal

The route host should do only this:

```txt
load data
load kits
compose game
map input to public kit APIs
tick the engine
read render descriptors
draw with Three.js
expose GameHost
```

The route host should not own bird physics, weather rules, cloud rain rules, flock meaning, perch rules, or objective logic.

## Target Layer Model

```txt
Open Above V2 Experiment
  data + host + Three renderer

Bird Flight Mode Kit
  composes the simulator domains

Domain Kits
  own reusable rules and descriptors

Renderer Adapter
  reads descriptors and draws only
```

## Target Domain Tree

```txt
bird-flight-mode-kit
├─ bird-body-domain-kit
│  ├─ wing-surface-domain-kit
│  ├─ feather-surface-domain-kit
│  └─ bird-animation-domain-kit
│
├─ bird-flight-control-domain-kit
├─ flight-motion-kit
├─ flight-camera-domain-kit
│
├─ atmosphere-domain
│  ├─ sky-atmosphere-kit
│  ├─ airflow-domain-kit
│  ├─ thermal-lift-domain-kit
│  ├─ cloud-volume-domain-kit
│  ├─ rain-cloud-domain-kit
│  └─ weather-state-domain-kit
│
├─ world-domain
│  ├─ terrain-sampler-kit
│  ├─ terrain-flight-affordance-domain-kit
│  ├─ scatter-placement-kit
│  ├─ perch-object-domain-kit
│  └─ vegetation-wind-response-domain-kit
│
├─ flock-domain
│  ├─ flock-agent-kit
│  └─ flock-social-domain-kit
│
└─ render-domain
   ├─ bird-render-descriptor-kit
   ├─ cloud-render-descriptor-kit
   ├─ precipitation-render-descriptor-kit
   ├─ terrain-render-descriptor-kit
   └─ three-render-adapter-kit
```

## Additive Implementation Rule

Only change `the-open-above-v2` route files and add supporting docs/tests at first.

Do not rewrite the whole app in one pass.

Do not remove working behavior before the replacement domain exists.

Each stage should leave the route playable.

Every new domain should ship with:

```txt
resource state
events
public engine API
snapshot method
headless smoke test
Open Above V2 integration point
```

## Stage 0: Pin And Stabilize

### Goal

Make the Experiment use current active NexusRealtime and ProtoKits branches.

### Changes

```txt
experiments/the-open-above-v2/open-above-v2.config.js
```

Set:

```txt
NexusRealtime: main
ProtoKits: main
```

### Acceptance

```txt
route still loads
existing flight still works
GameHost remains available
no change to player controls
```

## Stage 1: Rename The Mental Model

### Goal

Stop treating the route as a harness in docs and route metadata. Treat it as a simulator.

### Changes

```txt
id: open-above-bird-flight-simulator
title: Open Above Bird Flight Simulator
metadata: bird-flight-simulator
```

Keep existing route path for compatibility.

### Acceptance

```txt
URL does not change
launcher still opens route
page title and docs say simulator
```

## Stage 2: Normalize GameHost

### Goal

Expose the standard route host contract while keeping `GameHostV2` as a compatibility alias.

### Changes

```js
window.GameHost = host;
window.GameHostV2 = host;
```

Host should expose:

```txt
engine
renderer
config
getState()
getRawState()
getValidationState()
setInput(input)
tick(dt, input)
render()
start()
stop()
captureReady()
setCoverCamera()
hideHudForCapture()
showHudAfterCapture()
```

### Acceptance

```txt
GameHost exists
GameHostV2 still exists
cover capture can tick the route
backquote debug still works
```

## Stage 3: Extract Simulator Data

### Goal

Move simulator configuration out of one monolithic config into domain-shaped data blocks.

### New Files

```txt
experiments/the-open-above-v2/open-above-v2.bird.js
experiments/the-open-above-v2/open-above-v2.atmosphere.js
experiments/the-open-above-v2/open-above-v2.world.js
experiments/the-open-above-v2/open-above-v2.rendering.js
```

### Data Blocks

```txt
bird
  species
  body
  wings
  feathers
  animation

atmosphere
  sky
  wind
  thermals
  clouds
  rain
  weather

world
  terrain
  vegetation
  perches
  hazards
  flight affordances

rendering
  quality
  materials
  camera
  LOD
```

### Acceptance

```txt
config imports domain data
route behavior unchanged
all existing values preserved
```

## Stage 4: Bird Body Domain

### Goal

Give the bird a physical and biological state that is not only a rendered mesh.

### ProtoKit

```txt
bird-body-domain-kit
```

### Owns

```txt
species
mass
wing span
body length
center of gravity
energy
fatigue
wetness
posture
damage state
```

### Events

```txt
bird.energyChanged
bird.postureChanged
bird.wetnessChanged
bird.recovered
```

### Public API

```txt
engine.birdBody.getState()
engine.birdBody.setPosture(posture)
engine.birdBody.spendEnergy(amount)
engine.birdBody.restoreEnergy(amount)
engine.birdBody.addWetness(amount)
```

### Open Above V2 Integration

The route reads bird body state and passes it into flight and render descriptors.

### Acceptance

```txt
bird state exists
state is serializable
rendering still works
flight state references bird body by actor id
```

## Stage 5: Wing Surface Domain

### Goal

Make wings an aerodynamic domain.

### ProtoKit

```txt
wing-surface-domain-kit
```

### Owns

```txt
wing extension
wing fold
flap force
glide efficiency
lift coefficient
drag coefficient
stall angle
bank authority
```

### Events

```txt
wing.flapped
wing.gliding
wing.stallRiskChanged
wing.surfaceChanged
```

### Public API

```txt
engine.wingSurface.getState()
engine.wingSurface.setIntent(intent)
engine.wingSurface.sampleLift(input)
engine.wingSurface.sampleDrag(input)
```

### Open Above V2 Integration

Flight motion consumes wing lift and drag instead of only static physics numbers.

### Acceptance

```txt
flap/glide values affect flight
stall risk is inspectable
bird can still fly without tuning collapse
```

## Stage 6: Bird Flight Control Domain

### Goal

Make input become bird intent before it reaches flight.

### ProtoKit

```txt
bird-flight-control-domain-kit
```

### Owns

```txt
pitch intent
bank intent
dive intent
flap intent
boost intent
brake intent
perch intent
recover intent
```

### Public API

```txt
engine.birdFlightControl.input(rawInput)
engine.birdFlightControl.getIntent()
```

### Open Above V2 Integration

Keyboard mapping stays in the host, but the host sends raw input into this kit.

### Acceptance

```txt
controls feel the same at first
intent appears in debug state
flight-motion consumes intent
```

## Stage 7: Airflow Domain

### Goal

Make air a world system.

### ProtoKit

```txt
airflow-domain-kit
```

### Owns

```txt
base wind
gusts
turbulence
local air vector
air density
wind channels
```

### Public API

```txt
engine.airflow.sampleAt(position)
engine.airflow.getState()
engine.airflow.setWeatherCoupling(coupling)
```

### Open Above V2 Integration

Flight motion samples wind vector at bird position.

### Acceptance

```txt
wind changes flight path
wind is deterministic
wind can be visualized as debug vectors
```

## Stage 8: Thermal And Ridge Lift Domains

### Goal

Add environmental lift that the bird can discover and ride.

### ProtoKits

```txt
thermal-lift-domain-kit
ridge-lift-domain-kit
```

### Owns

```txt
thermal columns
warm air lift
ridge updrafts
cloud lift
lift radius
lift falloff
lift descriptors
```

### Public API

```txt
engine.thermalLift.sampleAt(position)
engine.ridgeLift.sampleAt(position)
```

### Open Above V2 Integration

Flight receives lift vector from air domains.

### Acceptance

```txt
bird can gain altitude without boost
terrain ridges produce readable lift
clouds can produce lift
```

## Stage 9: Cloud Volume Domain

### Goal

Clouds become flyable volumes, not just sky decoration.

### ProtoKit

```txt
cloud-volume-domain-kit
```

### Owns

```txt
cloud cell positions
cloud density
cloud moisture
cloud altitude
cloud radius
cloud movement
interior fog
entry and exit state
shadow descriptors
```

### Events

```txt
cloud.entered
cloud.exited
cloud.densityChanged
```

### Public API

```txt
engine.cloudVolume.getState()
engine.cloudVolume.sampleAt(position)
engine.cloudVolume.listNearby(position, radius)
```

### Open Above V2 Integration

Renderer draws cloud descriptors. Flight and camera react to cloud entry state.

### Acceptance

```txt
bird can fly through clouds
visibility changes inside cloud
cloud entry appears in debug state
```

## Stage 10: Rain Cloud Domain

### Goal

Clouds can emit rain.

### ProtoKit

```txt
rain-cloud-domain-kit
```

### Owns

```txt
rain emission
rain shafts
droplet density
fall speed
cloud underside darkness
wetness transfer
storm intensity
```

### Events

```txt
rain.started
rain.stopped
rain.hitBird
rain.enteredShaft
rain.exitedShaft
```

### Public API

```txt
engine.rainCloud.getState()
engine.rainCloud.sampleAt(position)
engine.rainCloud.getPrecipitationDescriptors()
```

### Open Above V2 Integration

Bird wetness increases in rain. Feather render descriptors respond. Audio and camera can respond later.

### Acceptance

```txt
rain visually emerges from clouds
bird wetness changes in rain
rain affects visibility and flight slightly
```

## Stage 11: Weather State Domain

### Goal

Add global and regional weather transitions.

### ProtoKit

```txt
weather-state-domain-kit
```

### Owns

```txt
clear
overcast
rain
storm
wind shift
pressure shift
visibility
transition curves
regional weather cells
```

### Public API

```txt
engine.weatherState.getState()
engine.weatherState.setPreset(preset)
engine.weatherState.transitionTo(preset, duration)
```

### Open Above V2 Integration

Weather coordinates sky, airflow, cloud volume, rain cloud, lighting, audio, and feather wetness.

### Acceptance

```txt
weather can transition during flight
rain and wind respond to weather
sky lighting responds to weather
```

## Stage 12: Terrain Flight Affordance Domain

### Goal

Terrain becomes flight-readable.

### ProtoKit

```txt
terrain-flight-affordance-domain-kit
```

### Owns

```txt
ridge lift zones
valley wind channels
crash risk
safe glide corridors
perchable surfaces
thermal spawn hints
```

### Public API

```txt
engine.terrainFlightAffordance.sampleAt(position)
engine.terrainFlightAffordance.listNearby(position, radius)
```

### Open Above V2 Integration

World patches generate flight affordances from terrain sampler and biome.

### Acceptance

```txt
terrain affects air and route decisions
perches and ridge lift appear in state
flight over terrain feels meaningful
```

## Stage 13: Perch Object Domain

### Goal

Add landing and resting as simulator verbs.

### ProtoKit

```txt
perch-object-domain-kit
```

### Owns

```txt
perch points
landing angle
branch stability
rest recovery
takeoff direction
perch occupancy
```

### Events

```txt
perch.available
perch.landed
perch.left
perch.rejected
```

### Open Above V2 Integration

Trees and rocks can expose perch affordances. Bird can land, rest, and launch.

### Acceptance

```txt
player can land on at least one perch
rest restores energy
launch returns to flight
```

## Stage 14: Flock Social Domain

### Goal

Make flock birds meaningful companions.

### ProtoKit

```txt
flock-social-domain-kit
```

### Owns

```txt
follow
lead
formation
spacing
avoidance
flock calls
route hints
social state
```

### Public API

```txt
engine.flockSocial.getState()
engine.flockSocial.setRole(role)
engine.flockSocial.sampleInfluence(position)
```

### Open Above V2 Integration

Flock agents receive social goals, not only motion updates.

### Acceptance

```txt
flock is readable
birds form around player
flock can point toward lift or route goals
```

## Stage 15: Render Descriptor Split

### Goal

Move visual meaning out of the route renderer.

### ProtoKits

```txt
bird-render-descriptor-kit
cloud-render-descriptor-kit
precipitation-render-descriptor-kit
terrain-render-descriptor-kit
flock-render-descriptor-kit
```

### Owns

```txt
mesh descriptors
pose descriptors
material descriptors
LOD descriptors
rain descriptors
cloud descriptors
terrain descriptors
flock descriptors
```

### Three Renderer Role

```txt
read descriptors
create meshes
sync transforms
render scene
```

### Acceptance

```txt
route renderer has less game meaning
visuals still match previous route
new rain/cloud/bird descriptors are visible
```

## Stage 16: Flight Camera Domain

### Goal

Make the camera part of the simulator feel.

### ProtoKit

```txt
flight-camera-domain-kit
```

### Owns

```txt
follow distance
horizon stability
bank framing
dive framing
speed FOV
cloud-entry framing
landing camera
perch camera
```

### Acceptance

```txt
camera state is inspectable
camera no longer lives only inside composeState
flight feels stable during rain, cloud entry, dive, and landing
```

## Stage 17: Bird Flight Mode Kit

### Goal

Create the top-level composition kit.

### ProtoKit

```txt
bird-flight-mode-kit
```

### Owns

```txt
required kit stack
install order
default bird simulator data
mode snapshot
validation state
route smoke helpers
```

### Open Above V2 Integration

The Experiment imports one mode kit plus data.

### Acceptance

```txt
route file gets smaller
kit composition is reusable
simulator remains playable
```

## Stage 18: Route Cleanup

### Goal

Make Open Above V2 a clean Experiment host.

### Changes

```txt
remove route-owned simulator rules after each domain owns them
keep input adapter
keep Three renderer adapter
keep error panel
keep GameHost
keep cover capture helpers
```

### Acceptance

```txt
route host is mostly boot/input/tick/render
domain state is inspectable
manual smoke route passes
```

## Stage 19: High-Fidelity Pass

### Goal

Make the simulator feel almost perfect.

### Add

```txt
rain shafts from cloud bottoms
cloud interior fog
wet feather sheen
wing rush audio descriptor
flock calls
ridge lift visualization
perch landing polish
wind gust animation
terrain flyby speed cues
```

### Acceptance

```txt
clouds look and feel physical
rain comes from clouds
bird reacts to weather
flight has lift, risk, recovery, rest, and beauty
```

## Stage 20: Validation And Promotion Review

### Goal

Decide which ProtoKits are reusable enough to promote later.

### Checks

```txt
headless tests exist
deterministic replay works
renderer does not own gameplay
data can create a second bird-flight route
weather works in more than one config
cloud rain works without Three.js
```

### Outcomes

```txt
promote stable generic kits
keep experimental kits in ProtoKits
split broad kits
archive unused kits
```

## Change Ledger

### Change 1: Pin ProtoKits To Main

```txt
file:
  experiments/the-open-above-v2/open-above-v2.config.js

change:
  ProtoKit CDN base now points to main.

reason:
  Open Above V2 needs the active ProtoKit branch while bird-flight domains are being built.

risk:
  main can change faster than a tag.

mitigation:
  once the bird-flight domain stack stabilizes, cut a new ProtoKits tag and pin the route to that tag.
```

### Change 2: Add This Plan

```txt
file:
  docs/open-above-v2-bird-flight-simulator-domain-plan.md

change:
  Adds the additive implementation roadmap.

reason:
  The simulator needs a domain-by-domain build order instead of a one-pass rewrite.
```

## Immediate Next Steps

```txt
1. Add GameHost alias and capture helpers to Open Above V2.
2. Rename page copy from Harness to Bird Flight Simulator while preserving URL.
3. Split config into bird, atmosphere, world, and rendering data modules.
4. Add bird-body-domain-kit in ProtoKits.
5. Wire bird body state into Open Above V2 without changing flight feel.
6. Add wing-surface-domain-kit.
7. Feed wing lift and drag into flight-motion-kit.
8. Add airflow-domain-kit.
9. Add cloud-volume-domain-kit.
10. Add rain-cloud-domain-kit and precipitation descriptors.
```

## Final Rule

Build additively.

Only replace route-owned logic after the matching domain kit exists, has a snapshot, and can be smoke tested.

Open Above V2 should become a bird-world made of domains, not a large route script with many imports.
