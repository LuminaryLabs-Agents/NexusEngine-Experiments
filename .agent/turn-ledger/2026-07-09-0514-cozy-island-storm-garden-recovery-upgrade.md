# Cozy Island storm garden recovery upgrade

## Summary

Upgraded `experiments/cozy-island/` with a renderer-neutral storm garden recovery layer. The pass turns the passive island scene into a clearer post-storm survival objective loop around freshwater capture, coconut filtering, medicinal herb recovery, driftwood splints, reef-safe wind warnings, and a dawn clinic ledger.

## Chosen experiment

`experiments/cozy-island/`

## Why it was chosen

The latest known completed upgrade was `experiments/sora-the-infinite/`, so this run needed a different route. Cozy Island was a good target because it is still more of a passive cloudbar / island composition proof than a small objective-driven web game, and it still carries legacy cloudbar behavior while newer overlay passes already prove that renderer-neutral readiness layers can be added safely.

## Last upgraded experiment

`experiments/sora-the-infinite/` from the prior run context.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/debug arena | 1-2 min | movement, camera, debug rays, stealth extraction descriptors | no changed runtime import observed in manifest | yes via wrapper |
| `experiments/peer-scene-transition/` | Scene transition / story route | 2-4 min | scene gates, inventory, chronicle/consequence overlays | no current changed import noted | yes |
| `apps/the-cavalry-of-rome/` | Rome campaign map | 3-6 min | campaign map, actions, logistics overlays | no changed import noted | yes |
| `experiments/vr-platformer-board/` | Board-scale platformer | 1-3 min | A/D movement, jump, coins, hazards, companion rescue | no changed import noted | yes |
| `experiments/next-ledge/` | Grapple climb demo | 2-4 min | grapple, swing, cargo, traversal/readiness overlays | no changed import noted | yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | 2-5 min | camera flight, LOD rings, survey overlays | no changed import noted | yes |
| `experiments/the-open-above/` | Bird/aerial traversal lane | 2-5 min | flight, sky/terrain descriptors, courier/shelter overlays | no changed import noted | yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology route | 2-5 min | grass, flowers, sheep, ecology/rescue overlays | no changed import noted | yes |
| `experiments/fogline-relay/` | Fog relay FPS | 3-6 min | movement, scan, relays, rescue/repair overlays | no changed import noted | yes |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase | 4-8 min | harvest, build, mast, route/pressure overlays | no changed import noted | yes |
| `experiments/sora-the-infinite/` | Aerial/open traversal gateway | 2-5 min | launch, flightplan, sky rescue/lighthouse overlays | no changed import noted | yes |
| `experiments/zombie-orchard/` | Survival orchard game | 3-6 min | movement, pickups, horde pressure, cure/evacuation overlays | no changed import noted | yes |
| `experiments/tropical-island-scene/` | Tropical island scene | 2-4 min | orbit, fish, coconuts, reef/storm/water overlays | local legacy import-map still retained | yes overlays |
| `experiments/cozy-island/` | Cozy passive island / cloudbar scene | 2-4 min | cloudbar island generation, comfort/tidepool/turtle/lagoon overlays | yes, legacy cloudbar stack still noted | yes overlays, now storm garden overlay |
| `games/signal-bastion/` | Strategic tower-defense pressure route | 10-20 min | placement, waves, command/fractal/readiness overlays | no changed import noted | yes |
| `games/rogue-lite-hellscape-siege/` | Base-defense rogue-lite route | 10-20 min | harvesting, inventory, build, core defense, caravan overlays | no changed import noted | yes |

## Domain ASCII tree

```txt
cozy-island-storm-garden-recovery-readiness-domain
├─ freshwater-recovery-domain
│  ├─ rain-cistern-domain
│  │  └─ cozy-island-rain-cistern-grid-kit
│  └─ coconut-filter-domain
│     └─ cozy-island-coconut-filter-bed-kit
├─ shelter-medicine-domain
│  ├─ medicinal-herb-nursery-domain
│  │  └─ cozy-island-medicinal-herb-nursery-kit
│  └─ driftwood-splint-domain
│     └─ cozy-island-driftwood-splint-rack-kit
├─ reef-safe-handoff-domain
│  ├─ shell-wind-warning-domain
│  │  └─ cozy-island-shell-wind-warning-kit
│  └─ dawn-clinic-ledger-domain
│     └─ cozy-island-dawn-clinic-ledger-kit
└─ renderer-handoff
   └─ cozy-island-storm-garden-recovery-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cozy-island-rain-cistern-grid-kit`
- `cozy-island-coconut-filter-bed-kit`
- `cozy-island-medicinal-herb-nursery-kit`
- `cozy-island-driftwood-splint-rack-kit`
- `cozy-island-shell-wind-warning-kit`
- `cozy-island-dawn-clinic-ledger-kit`
- `cozy-island-storm-garden-recovery-renderer-handoff-kit`
- `cozy-island-storm-garden-recovery-readiness-domain-kit`

## Files changed

- `experiments/cozy-island/index.html`
- `experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js`
- `experiments/cozy-island/cozy-island-storm-garden-recovery-entry.js`
- `tests/cozy-island-storm-garden-recovery-readiness-kits-smoke.mjs`
- `tests/cozy-island-storm-garden-recovery-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0514-cozy-island-storm-garden-recovery-upgrade.md`

## Integration notes

`experiments/cozy-island/index.html` now declares `storm-garden-recovery-readiness-renderer-handoff-pass` and loads `cozy-island-storm-garden-recovery-entry.js?v=storm-garden-recovery-readiness-1` after the existing castaway, tidepool, turtle, and lagoon passes.

The new entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

It patches `GameHost` by composition with:

- `getStormGardenRecoveryReadinessDomain()`
- `getStormGardenRecoveryReadiness()`
- `getCozyIslandStormGardenRecoveryReadiness()`
- `getStormGardenRecoveryReadinessTree()`
- composed `getRendererHandoff()` with `stormGardenRecoveryReadiness`

## Tests added

- `tests/cozy-island-storm-garden-recovery-readiness-kits-smoke.mjs`
- `tests/cozy-island-storm-garden-recovery-cdn-state-input-smoke.mjs`

Each smoke uses 10 intake cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/cozy-island/cozy-island-storm-garden-recovery-kits.js
node --check experiments/cozy-island/cozy-island-storm-garden-recovery-entry.js
node --check tests/cozy-island-storm-garden-recovery-readiness-kits-smoke.mjs
node --check tests/cozy-island-storm-garden-recovery-cdn-state-input-smoke.mjs
node tests/cozy-island-storm-garden-recovery-readiness-kits-smoke.mjs
node tests/cozy-island-storm-garden-recovery-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
cozy island storm garden recovery readiness kits smoke passed 10 intake cases
cozy island storm garden recovery CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this environment. The added CDN/state-input smoke validates route markers, NexusEngine main CDN usage, old NexusRealtime absence in the changed entry, GameHost exposure, renderer handoff composition, reusable-kit isolation, and 10 simulated state cases.

## NexusRealtime import audit

- New kit file: no `NexusRealtime` import.
- New entry file: imports NexusEngine main CDN and does not import old NexusRealtime.
- Cozy Island still retains the legacy `cozy-island-cloudbar.js` base stack. This run did not destructively remove it because the existing scene depends on it and the safer migration path is to keep adding renderer-neutral NexusEngine overlay passes until the cloudbar generation can be replaced or wrapped without losing island visuals.

## Cleanup pass

- Reusable kit logic does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, physics, or frame-loop work.
- Entry owns the browser panel and GameHost patch only.
- Renderer handoff emits serializable descriptors only.
- No files were deleted.
- No branch was created.

## Non-game handling

Cozy Island is not yet a tight small web game; it is a scenic composition route with overlays. This run preserved the useful visual functionality and added a recoverable objective layer instead of deleting or renaming the route.

## Next safe ledge

Replace the legacy cloudbar base with a NexusEngine main CDN scene shell that consumes island landform, foliage, campfire, smoke, castaway comfort, tidepool, turtle hatchery, lagoon rescue, and storm garden descriptors through one composed `GameHost.getRendererHandoff()` contract.
