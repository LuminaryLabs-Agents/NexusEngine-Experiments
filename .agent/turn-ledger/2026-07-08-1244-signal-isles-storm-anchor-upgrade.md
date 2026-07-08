# 2026-07-08 12:44 ET - Signal Isles storm-anchor readiness upgrade

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

The latest completed upgrade in the repository was `experiments/peer-scene-transition/`, logged by the peer scene clue-pressure pass. This run selected a different route.

Signal Isles had more gameplay than the smallest passive scenes, but its storm/island pressure was still mostly aesthetic. The player could scan, harvest, build, unlock, carry, and activate, yet the dangerous weather-front layer, grounding needs, shelter choices, anchor-cable tension, beacon resonance, and evacuation tide were implicit. The upgrade adds a storm-anchor readiness layer while keeping reusable logic out of renderer, DOM, input, asset loading, audio, Three.js, WebGL, and frame-loop ownership.

## Last upgraded experiment

`experiments/peer-scene-transition/`

Latest related commit line read before this work:

```txt
cf1f551efebf5d14c86757c11a4d95b5d7dacb09 Log peer scene clue pressure upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person movement/controller sandbox | 2-5 min | WASD, spring camera, debug, arena/locomotion/navigation descriptors | No changed-browser import found in current pass | Yes |
| `experiments/peer-scene-transition/` | Multi-page scene transition/inventory puzzle | 3-8 min | click actions, inventory, gates, route transitions, oracle/clue descriptors | No | Yes |
| `apps/the-cavalry-of-rome/` | Campaign strategy map proof | 5-15 min | campaign actions, orders, logistics descriptors | No changed overlay import | Yes |
| `experiments/vr-platformer-board/` | Browser platformer board | 2-6 min | move, jump, coins, hazards, exit, traversal descriptors | No changed-browser import | Yes |
| `experiments/next-ledge/` | Grapple/cargo traversal prototype | 2-6 min | grapple, swing, cargo, rescue route descriptors | No changed-browser import | Yes |
| `experiments/infinite-radial-terrain/` | Procedural terrain flight/survey sandbox | 3-8 min | camera flight, LOD rings, survey/wayfinding descriptors | No changed overlay import | Yes |
| `experiments/the-open-above/` | Bird/open-sky route sandbox | 3-8 min | flight, terrain streaming, visual route descriptors | No changed overlay import | Yes |
| `experiments/high-fidelity-meadow/` | Meadow visual ecology scene | 2-6 min | orbit/view, grass, sheep, ecology/flock descriptors | No changed-browser import | Yes |
| `experiments/fogline-relay/` | Fog relay scan route | 4-10 min | movement, scan, relays, signal/rhythm descriptors | No changed-browser import | Yes |
| `experiments/nexus-frontier-signal-isles/` | First-person resource/build island route | 5-12 min | movement, scan, harvest, build mast, route/cargo, storm anchor descriptors | No changed-browser import | Yes |
| `experiments/sora-the-infinite/` | Launch gateway into Open Above | 1-3 min | route preview, preflight, handoff readiness | No changed-browser import | Yes |
| `experiments/zombie-orchard/` | Survival orchard wave loop | 3-8 min | move, collect, waves, horde pathing | No changed overlay import | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon/orbit scene | 2-6 min | orbit, reef/lagoon/weather/rescue descriptors | Local old island/water stack remains, changed overlays use CDN | Yes |
| `games/signal-bastion/` | Tower defense game | 10-20 min | tower placement, waves, tactics descriptors | No changed-browser import | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource/defense siege game | 10-20 min | portals, harvest, build, core defense, extraction | No changed-browser import | Yes |

## Domain ASCII tree

```txt
signal-isles-storm-anchor-readiness-domain
├─ storm-front-domain
│  ├─ storm-cell-forecast-domain
│  │  └─ signal-isles-storm-cell-forecast-kit
│  └─ lightning-grounding-domain
│     └─ signal-isles-lightning-grounding-kit
├─ anchor-shelter-domain
│  ├─ shelter-pocket-domain
│  │  └─ signal-isles-shelter-pocket-kit
│  └─ anchor-cable-tension-domain
│     └─ signal-isles-anchor-cable-tension-kit
├─ beacon-return-domain
│  ├─ beacon-resonance-domain
│  │  └─ signal-isles-beacon-resonance-kit
│  └─ evacuation-tide-domain
│     └─ signal-isles-evacuation-tide-route-kit
└─ renderer-handoff
   └─ signal-isles-storm-anchor-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
signal-isles-storm-cell-forecast-kit
signal-isles-lightning-grounding-kit
signal-isles-shelter-pocket-kit
signal-isles-anchor-cable-tension-kit
signal-isles-beacon-resonance-kit
signal-isles-evacuation-tide-route-kit
signal-isles-storm-anchor-renderer-handoff-kit
signal-isles-storm-anchor-readiness-domain-kit
```

All new kit logic accepts plain level/session/objective/kit-state snapshots and emits serializable descriptors. The kits do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-anchor-readiness-domain-kits.js
experiments/nexus-frontier-signal-isles/src/game-composition.js
experiments/nexus-frontier-signal-isles/src/debug-host.js
experiments/nexus-frontier-signal-isles/src/main.js
experiments/nexus-frontier-signal-isles/src/renderer.js
experiments/nexus-frontier-signal-isles/index.html
tests/signal-isles-storm-anchor-readiness-kits-smoke.mjs
tests/signal-isles-storm-anchor-readiness-cdn-state-input-smoke.mjs
tests/signal-isles-playwright-state-input-smoke.mjs
tests/signal-isles-objective-readability-cdn-state-input-smoke.mjs
tests/signal-isles-expedition-readiness-cdn-state-input-smoke.mjs
tests/signal-isles-static-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1244-signal-isles-storm-anchor-upgrade.md
```

## Tests added

```txt
tests/signal-isles-storm-anchor-readiness-kits-smoke.mjs
tests/signal-isles-storm-anchor-readiness-cdn-state-input-smoke.mjs
```

The kit smoke covers 10 intake cases across storm cells, grounding rods, shelter pockets, anchor cables, beacon resonance, evacuation tide routes, descriptor-only handoff, JSON serialization, minimal level fallback, and ownership boundaries.

The CDN/state-input smoke validates NexusEngine main CDN usage, old NexusRealtime runtime absence in changed files, route cache-busting, composition/debug-host/renderer integration, manifest registration, renderer-neutral reusable kit source, and 10 state/input cases through the Signal Isles composition.

The new tests are routed through:

```txt
tests/signal-isles-playwright-state-input-smoke.mjs
```

which is already part of the repository's full and deploy validation lists.

## Validation results

Static/wired validation completed in this connector run:

```txt
index.html now loads ./src/main.js?v=storm-anchor-readiness-1.
main.js imports https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js.
main.js does not import LuminaryLabs-Dev/NexusRealtime@main/src/index.js.
game-composition.js imports and installs createSignalIslesStormAnchorReadinessDomainKit.
GameHost exposes getStormAnchorReadinessState().
renderer.js consumes snapshot.stormAnchorReadiness renderer-handoff descriptors.
signal-isles-playwright-state-input-smoke.mjs imports the new kit and CDN/state smokes.
objective and expedition CDN smokes were refreshed to the new route cache marker.
static smoke was refreshed to the new route cache marker.
Manifest records storm-anchor-readiness-renderer-handoff-pass.
```

Runtime shell execution was not available inside this connector-only run, so the intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files checked:

```txt
main.js imports NexusEngine main CDN.
main.js does not import the old NexusRealtime CDN.
signal-isles-storm-anchor-readiness-domain-kits.js has no NexusRealtime import and no NexusEngine runtime import.
signal-isles-storm-anchor-readiness-cdn-state-input-smoke.mjs asserts changed runtime files avoid the old NexusRealtime CDN.
```

Existing route context:

```txt
Signal Isles has compatibility comments that mention createRealtimeGame and related old kit names for static audit continuity, but the changed browser runtime import uses NexusEngine main CDN.
Tropical Island still has a legacy local island/water import-map in its own route, outside this changed experiment.
```

## Cleanup pass

- Kept world state, objective mutation, scan/harvest/build/cargo truth in `game-composition.js`.
- Kept renderer logic as descriptor presentation only.
- Kept the new reusable kits as snapshot-to-descriptor producers.
- Folded storm-anchor descriptors into the existing composed renderer handoff instead of creating a parallel frame loop.
- Refreshed stale Signal Isles cache-marker tests so old objective/expedition smokes point at the current route shell.
- No destructive deletion was performed.

## Non-game / safety handling

Signal Isles is a small experience-driven web game. No deletion, rename, or non-game archival was needed.

## Next safe ledge

- Run `npm run check` and `npm run check:deploy` locally or in Actions when shell execution is available.
- Add a lightweight storm objective prompt that tells the player which anchor descriptor is currently most urgent.
- Move compatible storm-anchor scoring into a headless deterministic replay assertion once the local runner is available.
- Consider adding renderer-level lightning flashes only if they remain pure descriptor presentation and do not own storm state.
