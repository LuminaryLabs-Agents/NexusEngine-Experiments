# 2026-07-08 13:00 ET - Fogline survivor-rescue readiness upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The latest completed upgrade in the repository was `experiments/nexus-frontier-signal-isles/`, logged by the Signal Isles storm-anchor pass. This run selected a different route.

Fogline Relay was chosen because it is still a compact experience-driven web game with limited explicit player goals beyond scan, repair, and extraction. It already had route readability, signal cartography, and operator rhythm descriptors, but the human-rescue stakes were implicit. The upgrade adds a survivor-rescue readiness layer that makes the route feel more like a rescue mission: distress lanterns, rescue ribbons, triage caches, flare decoys, blackout deadline rings, and extraction warmth corridors.

## Last upgraded experiment

`experiments/nexus-frontier-signal-isles/`

Latest related commit line read before this work:

```txt
d57b46ba63180b1fc0cfdb299cd01a87e98ab6dc Log Signal Isles storm anchor upgrade
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
| `experiments/fogline-relay/` | Fog relay scan route | 4-10 min | movement, scan, relays, signal/rhythm/survivor rescue descriptors | Changed overlay imports NexusEngine main CDN; shared loader name remains legacy | Yes |
| `experiments/nexus-frontier-signal-isles/` | First-person resource/build island route | 5-12 min | movement, scan, harvest, build mast, route/cargo, storm anchor descriptors | No changed-browser import | Yes |
| `experiments/sora-the-infinite/` | Launch gateway into Open Above | 1-3 min | route preview, preflight, handoff readiness | No changed-browser import | Yes |
| `experiments/zombie-orchard/` | Survival orchard wave loop | 3-8 min | move, collect, waves, horde pathing | No changed overlay import | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon/orbit scene | 2-6 min | orbit, reef/lagoon/weather/rescue descriptors | Local old island/water stack remains, changed overlays use CDN | Yes |
| `games/signal-bastion/` | Tower defense game | 10-20 min | tower placement, waves, tactics descriptors | No changed-browser import | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource/defense siege game | 10-20 min | portals, harvest, build, core defense, extraction | No changed-browser import | Yes |

## Domain ASCII tree

```txt
fogline-survivor-rescue-readiness-domain
├─ survivor-signal-domain
│  ├─ distress-lantern-domain
│  │  └─ fogline-survivor-distress-lantern-kit
│  └─ rescue-path-domain
│     └─ fogline-rescue-path-ribbon-kit
├─ triage-and-decoy-domain
│  ├─ triage-cache-domain
│  │  └─ fogline-triage-cache-halo-kit
│  └─ flare-decoy-domain
│     └─ fogline-flare-decoy-field-kit
├─ blackout-extraction-domain
│  ├─ blackout-deadline-domain
│  │  └─ fogline-blackout-deadline-ring-kit
│  └─ extraction-warmth-domain
│     └─ fogline-extraction-warmth-corridor-kit
└─ renderer-handoff
   └─ fogline-survivor-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
fogline-survivor-distress-lantern-kit
fogline-rescue-path-ribbon-kit
fogline-triage-cache-halo-kit
fogline-flare-decoy-field-kit
fogline-blackout-deadline-ring-kit
fogline-extraction-warmth-corridor-kit
fogline-survivor-rescue-renderer-handoff-kit
fogline-survivor-rescue-readiness-domain-kit
```

Changed:

```txt
fogline-operator-rhythm-domain-kits-smoke.mjs
fogline-operator-rhythm-cdn-state-input-smoke.mjs
```

The reusable survivor-rescue kits accept plain Fogline level/game/route snapshots and emit serializable descriptors. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/fogline-relay/src/fogline-survivor-rescue-kits.js
experiments/fogline-relay/src/survivor-rescue-readiness-entry.js
experiments/fogline-relay/index.html
tests/fogline-survivor-rescue-readiness-kits-smoke.mjs
tests/fogline-survivor-rescue-readiness-cdn-state-input-smoke.mjs
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1300-fogline-survivor-rescue-upgrade.md
```

## Tests added

```txt
tests/fogline-survivor-rescue-readiness-kits-smoke.mjs
tests/fogline-survivor-rescue-readiness-cdn-state-input-smoke.mjs
```

The kit smoke runs 10 intake cases through all six atomic kits, the composite domain kit, and the renderer handoff kit. It validates distress lanterns, rescue path ribbons, triage cache halos, flare decoy fields, blackout deadline rings, extraction warmth corridors, descriptor counts, JSON serialization, finite positions, and renderer-neutral ownership.

The CDN/state-input smoke validates NexusEngine main CDN usage, changed overlay import hygiene, old NexusRealtime runtime absence in the changed files, route cache-busting, `GameHost` accessors, composed renderer handoff counts, existing renderer bucket compatibility, manifest registration, and 10 simulated survivor-rescue state/input cases.

The new tests are routed through existing Fogline checks already present in full and deploy validation:

```txt
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
```

## Validation results

Static/wired validation completed in this connector run:

```txt
index.html now marks survivor-rescue-readiness-renderer-handoff-pass.
index.html loads ./src/main.js?v=fogline-survivor-rescue-readiness-1.
index.html loads ./src/survivor-rescue-readiness-entry.js?v=fogline-survivor-rescue-readiness-1.
survivor-rescue-readiness-entry.js imports NexusEngine main CDN.
survivor-rescue-readiness-entry.js patches GameHost with getSurvivorRescueReadiness().
survivor-rescue-readiness-entry.js patches GameHost with getFoglineSurvivorRescueReadiness().
survivor-rescue-readiness-entry.js composes survivorRescueDescriptorCount into getRendererHandoff().
fogline-survivor-rescue-kits.js contains no DOM, browser input, Three.js, WebGL, audio, asset loader, or frame-loop ownership.
operator rhythm smoke files import the new survivor rescue smoke files.
manifest records survivor-rescue-readiness-renderer-handoff-pass.
```

Runtime shell execution was not available inside this connector-only run, so the intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files checked:

```txt
survivor-rescue-readiness-entry.js imports https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js.
survivor-rescue-readiness-entry.js does not import LuminaryLabs-Dev/NexusRealtime@main.
fogline-survivor-rescue-kits.js has no NexusRealtime import and no NexusEngine runtime import.
fogline-survivor-rescue-readiness-cdn-state-input-smoke.mjs asserts changed overlay and kit files avoid the old NexusRealtime CDN.
```

Existing route context:

```txt
Fogline still imports a shared page loader whose exported function name includes NexusRealtime for compatibility, but the changed survivor-rescue overlay imports NexusEngine main CDN directly.
The underlying session keeps legacy local variable names for the imported runtime module, while the source URL remains NexusEngine main CDN through src/urls.js.
```

## Cleanup pass

- Kept survivor, triage, decoy, blackout, and extraction scoring in reusable snapshot-to-descriptor kits.
- Kept DOM and Canvas overlay presentation in `survivor-rescue-readiness-entry.js` only.
- Patched `GameHost` additively instead of replacing the existing Fogline session or frame loop.
- Reused existing Fogline renderer-compatible buckets so the new descriptors can be consumed without new renderer ownership.
- Routed new validation through existing Fogline smoke entries instead of expanding the global check list directly.
- No destructive deletion was performed.

## Non-game / safety handling

Fogline Relay is a small experience-driven web game. No deletion, rename, or non-game archival was needed.

## Next safe ledge

- Run `npm run check` and `npm run check:deploy` locally or in Actions when shell execution is available.
- Add actual survivor interaction state once the base Fogline game loop exposes rescue/carry actions.
- Let the HUD summarize the highest-priority survivor descriptor without moving state ownership into DOM.
- Fold the survivor-rescue overlay into the main renderer only if the renderer remains descriptor-consume-only.
