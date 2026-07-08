# 2026-07-08 12:29 ET - Peer Scene clue-pressure readiness upgrade

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

The latest completed upgrade in the repository was `experiments/ThirdPersonFollowThrough/`, logged by the third-person navigation challenge commits. This run therefore selected a different route.

Peer Scene remains one of the lowest-variability canonical experiences. It has scene state, inventory, gates, consequence readability, and oracle forecasting, but the player still had to infer which clues were visible, which route locks mattered, where evidence was missing, and why pressure was rising. The upgrade adds a clue-pressure investigation layer without moving reusable logic into renderer, DOM, input, asset loading, audio, Three.js, WebGL, or frame-loop ownership.

## Last upgraded experiment

`experiments/ThirdPersonFollowThrough/`

Latest related commit line read before this work:

```txt
1eae20c35b0f3702045078771b41ed8a3d2fbcca Refresh third person navigation ledger validation
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person movement/controller sandbox | 2-5 min | WASD, spring camera, debug, arena/locomotion/navigation descriptors | No changed-browser import found in current pass | Yes, wrapper/runtime path uses CDN |
| `experiments/peer-scene-transition/` | Multi-page scene transition/inventory puzzle | 3-8 min | click actions, inventory, gates, route transitions, oracle descriptors | No | Yes |
| `apps/the-cavalry-of-rome/` | Campaign strategy map proof | 5-15 min | campaign actions, orders, logistics descriptors | No changed overlay import | Yes |
| `experiments/vr-platformer-board/` | Browser platformer board | 2-6 min | move, jump, coins, hazards, exit, traversal descriptors | No changed-browser import | Yes |
| `experiments/next-ledge/` | Grapple/cargo traversal prototype | 2-6 min | grapple, swing, cargo, rescue route descriptors | No changed-browser import | Yes |
| `experiments/infinite-radial-terrain/` | Procedural terrain flight/survey sandbox | 3-8 min | camera flight, LOD rings, survey/wayfinding descriptors | No changed overlay import | Yes |
| `experiments/the-open-above/` | Bird/open-sky route sandbox | 3-8 min | flight, terrain streaming, visual route descriptors | No changed overlay import | Yes |
| `experiments/high-fidelity-meadow/` | Meadow visual ecology scene | 2-6 min | orbit/view, grass, sheep, ecology/flock descriptors | No changed-browser import | Yes |
| `experiments/fogline-relay/` | Fog relay scan route | 4-10 min | movement, scan, relays, signal/rhythm descriptors | No changed-browser import | Yes |
| `experiments/nexus-frontier-signal-isles/` | First-person resource/build island route | 5-12 min | movement, harvest, build mast, objectives | No changed-browser import | Yes |
| `experiments/sora-the-infinite/` | Launch gateway into Open Above | 1-3 min | route preview, preflight, handoff readiness | No changed-browser import | Yes |
| `experiments/zombie-orchard/` | Survival orchard wave loop | 3-8 min | move, collect, waves, horde pathing | No changed overlay import | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon/orbit scene | 2-6 min | orbit, reef/lagoon/weather/rescue descriptors | Local old island/water stack remains, changed overlays use CDN | Yes |
| `games/signal-bastion/` | Tower defense game | 10-20 min | tower placement, waves, tactics descriptors | No changed-browser import | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource/defense siege game | 10-20 min | portals, harvest, build, core defense, extraction | No changed-browser import | Yes |

## Domain ASCII tree

```txt
peer-scene-clue-pressure-readiness-domain
├─ investigation-readability-domain
│  ├─ clue-visibility-domain
│  │  └─ scene-clue-visibility-lantern-kit
│  └─ suspect-thread-domain
│     └─ scene-suspect-thread-trace-kit
├─ pressure-and-noise-domain
│  ├─ objective-pressure-domain
│  │  └─ scene-objective-pressure-pip-kit
│  └─ misdirection-fog-domain
│     └─ scene-misdirection-fog-bank-kit
├─ evidence-resolution-domain
│  ├─ evidence-gap-domain
│  │  └─ scene-evidence-gap-card-kit
│  └─ resolution-route-domain
│     └─ scene-resolution-route-lock-kit
└─ renderer-handoff
   └─ scene-clue-pressure-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
scene-clue-visibility-lantern-kit
scene-suspect-thread-trace-kit
scene-objective-pressure-pip-kit
scene-misdirection-fog-bank-kit
scene-evidence-gap-card-kit
scene-resolution-route-lock-kit
scene-clue-pressure-renderer-handoff-kit
scene-clue-pressure-readiness-domain-kit
```

All new kit logic accepts plain manifest/state/inventory inputs and emits serializable descriptors. The kits do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/_kits/peer-scene-transition/peer-scene-clue-pressure-handoff-kits.js
experiments/peer-scene-transition/shared/scene-clue-pressure-readiness-entry.js
experiments/peer-scene-transition/index.html
experiments/peer-scene-transition/camp.html
experiments/peer-scene-transition/crossroads.html
experiments/peer-scene-transition/forest.html
experiments/peer-scene-transition/bridge.html
tests/peer-scene-transition-clue-pressure-kits-smoke.mjs
tests/peer-scene-transition-clue-pressure-cdn-state-input-smoke.mjs
tests/peer-scene-transition-playwright-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1229-peer-scene-clue-pressure-upgrade.md
```

## Tests added

```txt
tests/peer-scene-transition-clue-pressure-kits-smoke.mjs
tests/peer-scene-transition-clue-pressure-cdn-state-input-smoke.mjs
```

The kit smoke covers 10 intake cases across the domain tree, kit count, clue lanterns, suspect traces, route locks, token ownership, locked forest route, misdirection fog, complete-route visibility, descriptor-only handoff, serialization, and renderer ownership boundaries.

The CDN/state-input smoke validates NexusEngine main CDN import, old NexusRealtime runtime absence in the new overlay, route shell loading, renderer-neutral kit source boundaries, 10 simulated scene states, snapshot shape, complete-route clue visibility, and `GameHost` accessor exposure.

The new tests are routed through:

```txt
tests/peer-scene-transition-playwright-smoke.mjs
```

## Validation results

Static/wired validation completed in this connector run:

```txt
New overlay imports https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js.
New overlay imports createSceneCluePressureReadinessDomainKit.
New overlay avoids LuminaryLabs-Dev/NexusRealtime@main/src/index.js.
Reusable kit source has no document/window usage.
Reusable kit source has no Three/WebGL ownership.
index, camp, crossroads, forest, and bridge route shells load clue-pressure-readiness-1.
Playwright smoke now waits for GameHost.getCluePressureReadinessDomain.
GameHost renderer handoff now exposes cluePressureReadiness counts.
Manifest records clue-pressure-readiness-renderer-handoff-pass.
```

Runtime shell execution was not available inside this connector-only run, so the intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files checked:

```txt
scene-clue-pressure-readiness-entry.js imports NexusEngine main CDN.
scene-clue-pressure-readiness-entry.js does not import the old NexusRealtime CDN.
peer-scene-clue-pressure-handoff-kits.js has no NexusRealtime import and no NexusEngine runtime import.
peer-scene-transition-playwright-smoke.mjs asserts the new overlay avoids the old NexusRealtime runtime CDN.
```

Existing route context:

```txt
scene-demo.js already imports NexusEngine main CDN.
Tropical Island still has a legacy local island/water import-map in its own route, outside this changed experiment.
```

## Cleanup pass

- Kept all state mutation and route solving inside existing Peer Scene runtime/domain ownership.
- Kept DOM/stage/panel rendering inside `scene-clue-pressure-readiness-entry.js` only.
- Kept new reusable kits as snapshot-to-descriptor functions.
- Routed tests through existing Peer Scene validation instead of adding another global runner entry.
- Updated the canonical manifest without adding a versioned route.
- No destructive deletion was performed.

## Non-game / safety handling

Peer Scene is a small experience-driven web game, but the current folder has one legacy mismatch: `scenes.json` points to `shrine.html`, while `shrine.html` currently hosts a desert/beach Three transition proof. This run preserved it to avoid unlogged destructive change and only updated the canonical camp/crossroads/forest/bridge peer-scene shells.

What that legacy route appears to prove:

```txt
A first-person desert-to-beach scene transition shell can coexist inside the Peer Scene route folder.
```

Lesson:

```txt
The shrine/ending branch should be normalized later into either true peer-scene HTML hosts or a separately named desert transition experiment. Do not silently delete it during a readability pass.
```

## Next safe ledge

- Normalize `shrine.html` and the missing `ending.html` in `experiments/peer-scene-transition/`.
- Decide whether the desert/beach transition proof should move to its own canonical route.
- Add a small clue journal action surface that can display clue-pressure descriptors as player-facing action text, not only visual overlays.
- Run `npm run check` and `npm run check:deploy` locally or in Actions when shell execution is available.
