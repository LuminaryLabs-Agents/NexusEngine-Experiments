# 2026-07-08 1800 — Cavalry field hospital readiness upgrade

## Summary

Upgraded `apps/the-cavalry-of-rome/` with a renderer-neutral field hospital readiness layer. The pass turns the campaign from pure conquest/logistics/diplomacy readability into a support-and-recovery objective loop: triage wounded cohorts, place medic tents, route bandage carts, watch sanitation wells, open stretcher roads, and commit dawn relief standards.

## Chosen experiment

`apps/the-cavalry-of-rome/`

## Why it was chosen

The latest completed upgrade in the current run stream was `experiments/fogline-relay/` via the blackout recovery pass, so this run had to avoid Fogline. Cavalry was chosen because it already had campaign, logistics, and diplomacy descriptors, but still lacked a human-care pressure layer that makes battles feel costly and gives the player an objective beyond expansion.

## Last upgraded experiment

`experiments/fogline-relay/` — blackout recovery readiness.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | third-person controller diagnostic/training route | 2-5 min | WASD, spring arm camera, navigation, stealth extraction | no changed runtime import | yes |
| `experiments/peer-scene-transition/` | scene transition/investigation route | 3-7 min | inventory gates, scene changes, evidence ritual | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Roman campaign command route | 5-12 min | campaign map, world actions, orders, logistics, diplomacy | no changed runtime import | yes |
| `experiments/vr-platformer-board/` | compact platformer board | 1-3 min | move, jump, coins, hazards, rescue readiness | no changed runtime import | yes |
| `experiments/next-ledge/` | grappling traversal route | 2-5 min | grapple, swing, cargo, rescue line, bivouac | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | radial terrain exploration | 3-8 min | camera flight, LOD, survey, basecamp resupply | no changed runtime import | yes |
| `experiments/the-open-above/` | aerial flight route | 3-8 min | bird flight, route readability, courier objectives | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | scenic meadow route | 2-6 min | ecology, flock safety, harvest festival descriptors | no changed runtime import | yes |
| `experiments/fogline-relay/` | fog relay survival/repair route | 4-9 min | first-person movement, scan, survivor rescue, evacuation, radio repair, blackout recovery | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | island beacon/build route | 5-10 min | movement, harvest, mast building, harbor relief | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Sora route-preview/flight gateway | 1-4 min | launch, microflight, sky rescue | no changed runtime import | yes |
| `experiments/zombie-orchard/` | wave survival orchard | 3-7 min | move, collect, waves, foraging, cure crafting | no changed runtime import | yes |
| `experiments/tropical-island-scene/` | lagoon/island scene | 2-6 min | orbit, fish, coconuts, navigation, tide salvage | partial legacy local import-map remains for old island/water stack | changed overlays use yes |
| `experiments/cozy-island/` | cozy procedural island | 2-6 min | island generation, campfire, smoke, comfort readiness | legacy cloudbar route still uses older ProtoKit imports | changed overlay uses yes |
| `games/signal-bastion/` | defense game | 8-15 min | placement, waves, frontline tactics, reconstruction | no changed runtime import | yes |
| `games/rogue-lite-hellscape-siege/` | roguelite siege game | 8-15 min | harvesting, inventory, build, portals, contracts | no changed runtime import | yes |

## Domain ASCII tree

```txt
cavalry-field-hospital-readiness-domain
├─ casualty-stabilization-domain
│  ├─ wounded-cohort-domain
│  │  └─ cavalry-wounded-cohort-triage-kit
│  └─ medic-tent-domain
│     └─ cavalry-medic-tent-capacity-kit
├─ supply-sanitation-domain
│  ├─ bandage-cart-domain
│  │  └─ cavalry-bandage-cart-route-kit
│  └─ water-sanitation-domain
│     └─ cavalry-sanitation-well-watch-kit
├─ evacuation-return-domain
│  ├─ stretcher-road-domain
│  │  └─ cavalry-stretcher-road-thread-kit
│  └─ dawn-relief-domain
│     └─ cavalry-dawn-relief-standard-kit
└─ renderer-handoff
   └─ cavalry-field-hospital-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cavalry-wounded-cohort-triage-kit`
- `cavalry-medic-tent-capacity-kit`
- `cavalry-bandage-cart-route-kit`
- `cavalry-sanitation-well-watch-kit`
- `cavalry-stretcher-road-thread-kit`
- `cavalry-dawn-relief-standard-kit`
- `cavalry-field-hospital-renderer-handoff-kit`
- `cavalry-field-hospital-readiness-domain-kit`

Changed:

- Existing Cavalry CDN state smoke now imports the new field hospital kit smoke and field hospital CDN/state smoke so the new validation remains in the existing Cavalry check path.

## Files changed

- `experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-field-hospital-readiness-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-field-hospital-readiness-kits-smoke.mjs`
- `tests/cavalry-field-hospital-cdn-state-input-smoke.mjs`
- `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-1800-cavalry-field-hospital-upgrade.md`

## Tests added

- `tests/cavalry-field-hospital-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic kits, descriptor counts, JSON serializability, and forbidden ownership boundaries.
- `tests/cavalry-field-hospital-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Validates NexusEngine CDN import, old NexusRealtime runtime CDN absence, route cache-busting, manifest registration, and composed descriptor outputs.

## Validation results

Local scratch syntax checks passed for:

- `cavalry-field-hospital-readiness-domain-kit.js`
- `cavalry-field-hospital-readiness-pass.js`
- `cavalry-field-hospital-readiness-kits-smoke.mjs`
- `cavalry-field-hospital-cdn-state-input-smoke.mjs`
- `cavalry-campaign-fractal-cdn-state-input-smoke.mjs`

Full `npm run check` was not executed because the connector runtime could not clone GitHub over DNS in this run. The new validation is wired into an existing Cavalry check path by importing both new smoke files from `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`.

## NexusRealtime import audit

Changed field hospital files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

No changed field hospital file imports:

```txt
LuminaryLabs-Dev/NexusRealtime@main
```

The live route keeps the existing Cavalry build stamp to avoid breaking old static assertions, but adds a cache-busted field hospital pass:

```txt
cavalry-field-hospital-readiness-pass.js?v=campaign-037
```

## Cleanup pass

- Kept reusable logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Left existing logistics and diplomacy passes intact.
- Added a descriptor-only overlay instead of moving campaign truth into presentation.
- Registered the new domain in the route manifest.
- Avoided destructive deletes or route renames.

## Non-game handling

Cavalry is a small experience-driven campaign route, so no deletion, rename, or destructive refactor was needed. The route is trying to prove an authored Roman campaign surface with DSK-style descriptor handoffs. The lesson from this pass is that campaign pressure becomes more readable when conquest, diplomacy, logistics, and casualty recovery are separate descriptor domains composed by presentation rather than owned by the renderer.

## Next safe ledge

Turn the field hospital pass from overlay-only readability into a tiny decision layer: choose one relief action per turn, spend campaign actions to stabilize a wounded cohort, and feed the result back into logistics/diplomacy descriptors without making the renderer own simulation truth.
