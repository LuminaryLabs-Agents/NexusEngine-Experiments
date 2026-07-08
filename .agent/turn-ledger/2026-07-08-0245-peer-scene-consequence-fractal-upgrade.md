# Peer Scene Transition consequence fractal upgrade

Timestamp: 2026-07-08 02:45 America/New_York

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

The latest upgraded route was `experiments/sora-the-infinite/`, so this pass avoided it. `peer-scene-transition` is still one of the smallest experience-driven web routes because it has no spatial movement loop, no combat loop, and no continuous simulation; its weakest remaining surface was consequence readability after a scene action or blocked route. The upgrade adds a consequence-fractal handoff so the scene now shows cause, risk, ally/token presence, route consequence, and reward preview descriptors without moving inventory truth or route solving into the DOM renderer.

## Last upgraded experiment

`experiments/sora-the-infinite/` from the latest visible ledger, `2026-07-08-0229-sora-route-preview-fractal-upgrade.md`.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory, chronicle/consequence descriptors. | No direct old CDN in changed runtime. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | XR/stereo platformer board route. | Short arcade board. | A/D movement, jumping, floating board, visual descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent. | Grapple, swing, route progress, cargo/pressure descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in `src/urls.js`. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Authored compatibility gateway into The Open Above. | Short launch handoff. | Alias preservation, launch vector, route preview, wind/altitude/waypoint handoff descriptors. | No old runtime CDN in changed runtime. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds. | No old runtime CDN in changed audit. | Yes. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
peer-scene-consequence-domain
├─ cause-readability
│  ├─ cause-lens-domain
│  │  └─ scene-cause-lens-kit
│  └─ ally-presence-domain
│     └─ scene-ally-presence-kit
├─ future-pressure
│  ├─ risk-delta-domain
│  │  └─ scene-risk-delta-kit
│  ├─ route-consequence-domain
│  │  └─ scene-route-consequence-kit
│  └─ reward-preview-domain
│     └─ scene-reward-preview-kit
└─ renderer-handoff
   └─ scene-consequence-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/_kits/peer-scene-transition/peer-scene-consequence-handoff-kits.js`:

- `PEER_SCENE_CONSEQUENCE_DOMAIN_TREE`
- `scene-cause-lens-kit`
- `scene-risk-delta-kit`
- `scene-ally-presence-kit`
- `scene-route-consequence-kit`
- `scene-reward-preview-kit`
- `scene-consequence-renderer-handoff-kit`
- `scene-consequence-domain-kit`

Changed:

- `shared/scene-demo.js` now composes `consequenceDomainKit` after base, atmospheric, and chronicle handoffs.
- `renderVisualStage()` now consumes cause, risk, ally, route consequence, and reward preview descriptor buckets.
- `renderStatePanel()` now shows consequence route-open status.
- `GameHost` now exposes `getConsequenceDomain()` and includes consequence counts in `getRendererHandoff()`.

## Files changed

- `experiments/_kits/peer-scene-transition/peer-scene-consequence-handoff-kits.js`
- `experiments/peer-scene-transition/shared/scene-demo.js`
- `tests/peer-scene-transition-consequence-handoff-smoke.mjs`
- `tests/peer-scene-transition-consequence-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0245-peer-scene-consequence-fractal-upgrade.md`

## Tests added

- `tests/peer-scene-transition-consequence-handoff-smoke.mjs`
  - 10 intake cases.
  - Checks seven surfaces: cause lens, risk delta, ally presence, route consequence, reward preview, renderer handoff, and composite consequence domain.
  - Checks descriptor serializability and renderer-neutral ownership boundaries.

- `tests/peer-scene-transition-consequence-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Validates NexusEngine main CDN usage, old NexusRealtime runtime CDN absence, consequence runtime import, DOM handoff hooks, `GameHost.getConsequenceDomain()`, and reusable kit ownership boundaries.

## Validation results

Static connector validation completed by refetching changed files after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/peer-scene-transition/shared/scene-demo.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed peer scene runtime does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime`.
- The new consequence kits do not import NexusRealtime, NexusEngine, DOM, renderer, Three.js, WebGL, audio, assets, or frame-loop code.
- `tests/peer-scene-transition-consequence-cdn-state-input-smoke.mjs` checks the changed runtime for NexusEngine main CDN usage and old runtime CDN absence.

## Cleanup pass

- Route solving stayed in the transition/domain kits.
- Inventory truth stayed in the inventory/domain kits.
- Browser DOM and stage composition stayed in `shared/scene-demo.js`.
- The new consequence layer emits serializable descriptors and renderer handoff counts.
- No route was deleted, renamed, or destructively changed.

## Non-game route handling

`peer-scene-transition` is a small HTML scene experiment rather than a full continuous game. The proof it was trying to provide is scene-to-scene domain handoff, state persistence, and action gating. The lesson from this pass is that scene routes become much easier to validate when every action has a visible consequence forecast and every blocked route has a risk/reward descriptor instead of only button text.

## Next safe ledge

Add a deterministic peer-scene route replay fixture that executes camp → forest → bridge → shrine, records blocked route attempts, snapshots base/atmospheric/chronicle/consequence handoff counts, and verifies that consequence descriptors never mutate state.
