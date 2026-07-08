# 2026-07-08 01:44 Signal Bastion Command Fractal Upgrade

## Chosen experiment

`games/signal-bastion/`

## Why it was chosen

The latest visible upgrade sequence before this pass was `games/rogue-lite-hellscape-siege/`, ending in the Hellscape Siege fractal readability ledger. This pass avoided that route.

Signal Bastion was selected because it remained the strongest executable route-domain lane but had not yet received the recurring visual/domain-fractal handoff pattern used on the other routes. The core game already has 30 waves and the generic-defense DSK spine, so the least useful remaining presentation gap was command readability: path pressure, tower synergy, enemy intent, economy flow, wave readiness, and command options were still inferred from lower-level presentation state instead of exported as atomic descriptors.

## Last upgraded experiment

`games/rogue-lite-hellscape-siege/`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and debug rig route. | Short diagnostic loop. | WASD, spring-arm camera, jump/reset/debug state. | No changed-runtime dependency found in this pass. | Yes through arena fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene/choice puzzle route. | Short scene chain. | Scene gates, inventory, clues, choices, completion. | No changed-runtime dependency found in this pass. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map / command route. | Medium campaign-command loop. | Territory movement, supply, cohesion, morale, maneuvers. | Legacy compatibility surface still exists outside the active handoff. | Yes through campaign fractal handoff. |
| `experiments/vr-platformer-board/` | XR/platformer board route. | Short board challenge. | Move, jump, platform hazards, comfort descriptors. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent loop. | Grapple, swing, route progress, cargo/extraction pressure. | No changed-runtime dependency found in this pass. | Yes through route cargo wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain traversal / LOD route. | Open-ended diagnostic traversal. | Camera flight, radial terrain rings, biome/hydrology descriptors. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow visual fidelity route. | Ambient short loop. | Grass, flower drift, light shafts, grazing trails, visual descriptors. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/fogline-relay/` | First-person fog relay route. | Short objective loop. | Movement, scanning, relay gates, wraith pressure. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase route. | Medium sandbox objective loop. | Movement, harvest, build mast, hazard pressure, signal descriptors. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/sora-the-infinite/` | Aerial/open traversal compatibility route. | Short gateway/open traversal loop. | Launch vector, sky memory, continuity gateway. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short survival-wave loop. | Move, collect, shoot/avoid, pickups, waves. | No changed-runtime dependency found in this pass. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island / lagoon WebGL scene. | Ambient interactive scene. | Orbit camera, fish, water, reef/current/wake descriptors. | Local old ProtoKit import-map compatibility remains. | Yes in changed runtime. |
| `games/signal-bastion/` | Strategic tower-defense route and executable route-domain lane. | 30 authored waves. | Build/select towers, start waves, upgrade/sell, defend vital target. | Yes before this pass: `NexusRealtime@main` runtime CDN in `boot.js`. | Yes after this pass: `NexusEngine@main` runtime CDN in `boot.js`. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite base-defense route. | Medium survival-defense loop. | Portals, harvest, inventory, build, waves, core defense. | No changed-runtime dependency found in this pass. | Yes. |

## Domain ASCII tree

```txt
signal-bastion-command-fractal-domain
├─ battlefield-readability
│  ├─ path-threat-domain
│  │  └─ bastion-path-threat-gradient-kit
│  └─ enemy-intent-domain
│     └─ bastion-enemy-intent-thread-kit
├─ command-economy-domain
│  ├─ economy-flow-domain
│  │  └─ bastion-economy-flow-ribbon-kit
│  ├─ tower-synergy-domain
│  │  └─ bastion-tower-synergy-cell-kit
│  └─ command-choice-domain
│     └─ bastion-command-choice-band-kit
├─ wave-readiness-domain
│  └─ bastion-wave-readiness-glyph-kit
└─ renderer-handoff
   └─ bastion-command-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `games/signal-bastion/src/signal-bastion-command-fractal-domain-kit.js`:

- `bastion-path-threat-gradient-kit`
- `bastion-economy-flow-ribbon-kit`
- `bastion-tower-synergy-cell-kit`
- `bastion-enemy-intent-thread-kit`
- `bastion-wave-readiness-glyph-kit`
- `bastion-command-choice-band-kit`
- `bastion-command-renderer-handoff-kit`
- `signal-bastion-command-fractal-domain-kit`

All of these accept plain snapshot/presentation input and emit serializable descriptors. None own DOM, Canvas, Three.js, WebGL, browser input, audio, asset loading, or the frame loop.

## Files changed

- `games/signal-bastion/src/signal-bastion-command-fractal-domain-kit.js`
- `games/signal-bastion/src/boot.js`
- `games/signal-bastion/src/renderer-canvas.js`
- `tests/signal-bastion-command-fractal-domain-kits-smoke.mjs`
- `tests/signal-bastion-command-fractal-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0144-signal-bastion-command-fractal-upgrade.md`

## Tests added

- `tests/signal-bastion-command-fractal-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks path threat, economy flow, tower synergy, enemy intent, wave readiness, command choice, renderer handoff, serializability, and ownership boundaries.

- `tests/signal-bastion-command-fractal-cdn-state-input-smoke.mjs`
  - 10 intake cases.
  - Checks NexusEngine main CDN import, old NexusRealtime runtime CDN absence, GameHost command-fractal exposure, renderer descriptor consumption, manifest registration, and ownership boundaries.

Both tests were wired into full and deploy validation in `scripts/run-checks.mjs`.

## Validation results

Static connector validation completed by refetching the changed files after writing.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed `games/signal-bastion/src/boot.js` from the old runtime URL:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`
- To the required NexusEngine main CDN URL:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Existing ProtoKit URLs still reference `NexusRealtime-ProtoKits`, which is a separate package namespace and was not changed in this pass.
- The new CDN/state/input smoke rejects the old `LuminaryLabs-Dev/NexusRealtime@main/src/index.js` runtime URL in `boot.js`.

## Cleanup pass

- Kept Signal Bastion's generic-defense DSK namespace intact.
- Did not add a route fork or branch.
- Did not move simulation state, session commands, placement semantics, Canvas drawing, DOM panels, or input listeners into the new reusable descriptor kits.
- Left `renderer-canvas.js` as a presentation consumer. It reads `presentation.commandFractal.rendererHandoff.descriptors` and draws descriptor-driven overlays only.
- Updated the manifest status to `command-fractal-readability-handoff-pass`.

## Non-game route handling

Not applicable. Signal Bastion is a small experience-driven web game and the current executable strategic-pressure route.

## Next safe ledge

Add a deterministic Signal Bastion replay snapshot hash that includes command-fractal descriptor counts for path threat, economy ribbons, tower synergy, enemy intent, wave readiness, and command choices across at least three wave states. Then prove the descriptors remain stable across fixed-tick replay without adding browser or renderer ownership to the domain kits.
