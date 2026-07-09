# Tropical Island coral restoration upgrade

## Summary

Upgraded `experiments/tropical-island-scene/` with a renderer-neutral coral restoration layer. The pass adds reef damage survey, algae pressure gauges, coral fragment cradles, diver transect routes, turtle-safe corridors, and a dawn reef ledger on top of the existing island scene and readiness overlays.

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

The latest completed upgrade was `experiments/cozy-island/`, so this run needed a different route. Tropical Island Scene was selected because it is still a scenic composition route rather than a tight small web game, still retains legacy NexusRealtime ProtoKits import-map compatibility, and benefits from one more objective-driven restoration layer that preserves the visual scene while moving new logic toward NexusEngine main CDN descriptor handoffs.

## Last upgraded experiment

`experiments/cozy-island/` from the prior run context.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/debug arena | 1-2 min | movement, camera, debug rays, stealth extraction descriptors | no changed runtime import observed in manifest | yes via wrapper |
| `experiments/peer-scene-transition/` | Scene transition / story route | 2-4 min | scene gates, inventory, chronicle/consequence/courier overlays | no current changed import noted | yes |
| `apps/the-cavalry-of-rome/` | Rome campaign map | 3-6 min | campaign map, actions, logistics/aqueduct overlays | no changed import noted | yes |
| `experiments/vr-platformer-board/` | Board-scale platformer | 1-3 min | A/D movement, jump, coins, hazards, companion rescue | no changed import noted | yes |
| `experiments/next-ledge/` | Grapple climb demo | 2-4 min | grapple, swing, cargo, traversal/readiness overlays | no changed import noted | yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | 2-5 min | camera flight, LOD rings, survey/shelter overlays | no changed import noted | yes |
| `experiments/the-open-above/` | Bird/aerial traversal lane | 2-5 min | flight, sky/terrain descriptors, courier/shelter overlays | no changed import noted | yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology route | 2-5 min | grass, flowers, sheep, ecology/rescue/irrigation overlays | no changed import noted | yes |
| `experiments/fogline-relay/` | Fog relay FPS | 3-6 min | movement, scan, relays, rescue/repair/battery overlays | no changed import noted | yes |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer kit showcase | 4-8 min | harvest, build, mast, route/pressure/surge overlays | no changed import noted | yes |
| `experiments/sora-the-infinite/` | Aerial/open traversal gateway | 2-5 min | launch, flightplan, sky rescue/lighthouse/orchard overlays | no changed import noted | yes |
| `experiments/zombie-orchard/` | Survival orchard game | 3-6 min | movement, pickups, horde pressure, cure/evacuation/seed bank overlays | no changed import noted | yes |
| `experiments/tropical-island-scene/` | Tropical island scene | 2-4 min | orbit, fish, coconuts, reef/storm/water/mangrove/coral overlays | local legacy import-map retained | yes overlays, now coral restoration overlay |
| `experiments/cozy-island/` | Cozy passive island / cloudbar scene | 2-4 min | cloudbar island generation, comfort/tidepool/turtle/lagoon/storm garden overlays | yes, legacy cloudbar stack still noted | yes overlays |
| `games/signal-bastion/` | Strategic tower-defense pressure route | 10-20 min | placement, waves, command/fractal/readiness overlays | no changed import noted | yes |
| `games/rogue-lite-hellscape-siege/` | Base-defense rogue-lite route | 10-20 min | harvesting, inventory, build, core defense, caravan/refuge overlays | no changed import noted | yes |

## Domain ASCII tree

```txt
tropical-coral-restoration-readiness-domain
├─ reef-damage-survey-domain
│  ├─ bleaching-scan-domain
│  │  └─ tropical-coral-bleaching-scan-kit
│  └─ algae-pressure-domain
│     └─ tropical-algae-pressure-gauge-kit
├─ nursery-replant-domain
│  ├─ coral-fragment-cradle-domain
│  │  └─ tropical-coral-fragment-cradle-kit
│  └─ diver-transect-domain
│     └─ tropical-diver-transect-route-kit
├─ reef-protection-handoff-domain
│  ├─ turtle-safe-corridor-domain
│  │  └─ tropical-turtle-safe-corridor-kit
│  └─ dawn-reef-ledger-domain
│     └─ tropical-dawn-reef-ledger-kit
└─ renderer-handoff
   └─ tropical-coral-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tropical-coral-bleaching-scan-kit`
- `tropical-algae-pressure-gauge-kit`
- `tropical-coral-fragment-cradle-kit`
- `tropical-diver-transect-route-kit`
- `tropical-turtle-safe-corridor-kit`
- `tropical-dawn-reef-ledger-kit`
- `tropical-coral-restoration-renderer-handoff-kit`
- `tropical-coral-restoration-readiness-domain-kit`

## Files changed

- `experiments/tropical-island-scene/index.html`
- `experiments/tropical-island-scene/src/tropical-coral-restoration-readiness-domain-kit.js`
- `experiments/tropical-island-scene/src/coral-restoration-readiness-entry.js`
- `tests/tropical-coral-restoration-readiness-kits-smoke.mjs`
- `tests/tropical-coral-restoration-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0529-tropical-coral-restoration-upgrade.md`

## Integration notes

`experiments/tropical-island-scene/index.html` now declares `coral-restoration-readiness-renderer-handoff-pass` and loads `coral-restoration-readiness-entry.js?v=tropical-island-coral-restoration-20260709` after the mangrove nursery pass.

The new entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

It patches `GameHost` by composition with:

- `getCoralRestorationReadiness()`
- `getTropicalCoralRestorationReadiness()`
- `getCoralRestorationReadinessTree()`
- composed `getRendererHandoff()` with `coralRestoration`

## Tests added

- `tests/tropical-coral-restoration-readiness-kits-smoke.mjs`
- `tests/tropical-coral-restoration-cdn-state-input-smoke.mjs`

Each smoke uses 10 intake cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/tropical-island-scene/src/tropical-coral-restoration-readiness-domain-kit.js
node --check experiments/tropical-island-scene/src/coral-restoration-readiness-entry.js
node --check tests/tropical-coral-restoration-readiness-kits-smoke.mjs
node --check tests/tropical-coral-restoration-cdn-state-input-smoke.mjs
node tests/tropical-coral-restoration-readiness-kits-smoke.mjs
node tests/tropical-coral-restoration-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
tropical coral restoration readiness kits smoke passed 10 intake cases
tropical coral restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this environment. The added CDN/state-input smoke validates route markers, NexusEngine main CDN usage, old NexusRealtime absence in the changed entry, GameHost exposure, renderer handoff composition, reusable-kit isolation, and 10 simulated state cases.

## NexusRealtime import audit

- New kit file: no `NexusRealtime` import.
- New entry file: imports NexusEngine main CDN and does not import old NexusRealtime.
- `experiments/tropical-island-scene/index.html` still retains the old `NexusRealtime-ProtoKits@0.0.2` import-map aliases that route legacy kit URLs to `./src/local-kits.js`. This run did not delete them because the existing `main.js` scene still depends on that compatibility surface. The safe migration path is to wrap or replace those legacy local kit imports after the main scene shell can consume only composed NexusEngine descriptor handoffs.

## Cleanup pass

- Reusable kit logic does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, physics, or frame-loop work.
- Entry owns only the browser overlay canvas and `GameHost` patch.
- Renderer handoff emits serializable descriptors only.
- No files were deleted.
- No branch was created.

## Non-game handling

Tropical Island Scene is not yet a tight small web game; it is a scenic renderer route with layered readiness overlays. This run preserved useful island visuals and added a reef restoration objective layer instead of deleting or renaming the route.

## Next safe ledge

Refactor `experiments/tropical-island-scene/src/main.js` so the base island, palms, coconuts, fish, water, lagoon, beachcomber, navigation, weather shelter, reef rescue, tide salvage, storm clinic, rainwater, mangrove, and coral restoration passes all publish through one composed `GameHost.getRendererHandoff()` contract with the legacy NexusRealtime import-map removed only after parity validation.
