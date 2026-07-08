# 2026-07-08 1829 — Cozy Island tidepool conservatory readiness upgrade

## Summary

Upgraded `experiments/cozy-island/` with a renderer-neutral tidepool conservatory readiness layer. The pass turns the island from a passive cloudbar/campfire scene with castaway comfort overlays into a small conservation loop: restore coral nursery beds, catalog tidepool specimens, route around hermit crab crossings, rebuild shell marker mosaics, survey moon-tide windows, and track a conservation ledger.

## Chosen experiment

`experiments/cozy-island/`

## Why it was chosen

The latest completed route work visible in the commit stream was `games/rogue-lite-hellscape-siege/` through the ash caravan readiness pass, so this run selected a different route. Cozy Island was chosen because it is still one of the least game-like entries: a scenic island/cloudbar experience with comfort readiness descriptors, but no concrete stewardship objective that changes with tide, coral health, visitor pressure, moon phase, and shorelife activity.

## Last upgraded experiment

`games/rogue-lite-hellscape-siege/` — ash caravan readiness work was the latest route activity before this run.

## Experiment inventory

| id | path | description | gameplay length | mechanics | old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---|---:|---|---|---|
| third-person-follow-through | `experiments/ThirdPersonFollowThrough/` | third-person controller/course route with stealth extraction overlays | 2-4 min | WASD, camera, checkpoints, stealth descriptors | no changed-file old runtime | yes |
| peer-scene-transition | `experiments/peer-scene-transition/` | scene transition investigation route | 3-6 min | routes, inventory, clue pressure, evidence ritual | no changed-file old runtime | yes |
| the-cavalry-of-rome | `apps/the-cavalry-of-rome/` | Roman campaign command app | 5-10 min | campaign map, logistics, diplomacy, field hospital descriptors | no changed-file old runtime | yes |
| vr-platformer-board | `experiments/vr-platformer-board/` | short platformer board training loop | 1-3 min | move, jump, coins, hazards, exit, rescue readiness | no changed-file old runtime | yes |
| next-ledge | `experiments/next-ledge/` | grappling/traversal ledge challenge | 1-3 min | grapple, swing, cargo, rescue line, bivouac | no changed-file old runtime | yes |
| infinite-radial-terrain | `experiments/infinite-radial-terrain/` | radial terrain flight/survey route | 2-5 min | camera flight, LOD rings, wayfinding, resupply | no changed-file old runtime | yes |
| the-open-above | `experiments/the-open-above/` | bird-flight route | 2-5 min | flight, terrain, sky route readability, courier objectives | no changed-file old runtime | yes |
| high-fidelity-meadow | `experiments/high-fidelity-meadow/` | scenic meadow with ecology/festival overlays | 2-4 min | grass/flowers/sheep, route, safety, harvest prep | no changed-file old runtime | yes |
| fogline-relay | `experiments/fogline-relay/` | fog relay survival/navigation route | 3-6 min | first-person movement, scan, rescue, repair, blackout | no changed-file old runtime | yes |
| nexus-frontier-signal-isles | `experiments/nexus-frontier-signal-isles/` | resource/build/objective island route | 5-8 min | move, harvest, build mast, cargo, harbor relief | no changed-file old runtime | yes |
| sora-the-infinite | `experiments/sora-the-infinite/` | route-preview/microflight gateway | 1-3 min | preview, launch rehearsal, negotiation, rescue | no changed-file old runtime | yes |
| zombie-orchard | `experiments/zombie-orchard/` | survival/cure-crafting route | 3-6 min | move, collect, waves, horde pathing, cure craft | no changed-file old runtime | yes |
| tropical-island-scene | `experiments/tropical-island-scene/` | interactive tropical lagoon scene | 2-4 min | drag orbit, fish, coconuts, shelter, rescue, salvage | legacy local ProtoKit import-map remains | yes in changed overlays |
| cozy-island | `experiments/cozy-island/` | scenic island/cloudbar route | 2-4 min | island generation, campfire, comfort readiness, tidepool conservatory | legacy cloudbar ProtoKit stack remains | yes in changed overlays |
| signal-bastion | `games/signal-bastion/` | tower-defense game route | 8-15 min | placement, waves, tactics, evacuation, reconstruction | base defense bridges remain | yes in changed overlays |
| rogue-lite-hellscape-siege | `games/rogue-lite-hellscape-siege/` | realm defense roguelite route | 8-15 min | portals, harvesting, inventory, build, core defense, contracts, ash caravan | no changed-file old runtime | yes |

## Domain ASCII tree

```txt
cozy-island-tidepool-conservatory-readiness-domain
├─ reef-stewardship-domain
│  ├─ coral-nursery-domain
│  │  └─ cozy-island-coral-nursery-bed-kit
│  └─ tidepool-specimen-domain
│     └─ cozy-island-tidepool-specimen-trail-kit
├─ shorelife-safety-domain
│  ├─ hermit-crab-crossing-domain
│  │  └─ cozy-island-hermit-crab-crossing-kit
│  └─ shell-marker-domain
│     └─ cozy-island-shell-marker-mosaic-kit
├─ moon-return-domain
│  ├─ moon-tide-survey-domain
│  │  └─ cozy-island-moon-tide-survey-kit
│  └─ conservation-ledger-domain
│     └─ cozy-island-conservation-ledger-kit
└─ renderer-handoff
   └─ cozy-island-tidepool-conservatory-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cozy-island-coral-nursery-bed-kit`
- `cozy-island-tidepool-specimen-trail-kit`
- `cozy-island-hermit-crab-crossing-kit`
- `cozy-island-shell-marker-mosaic-kit`
- `cozy-island-moon-tide-survey-kit`
- `cozy-island-conservation-ledger-kit`
- `cozy-island-tidepool-conservatory-renderer-handoff-kit`
- `cozy-island-tidepool-conservatory-readiness-domain-kit`

Changed:

- Existing castaway comfort smoke files now import the tidepool smoke files so the new validation is routed through the already-registered Cozy Island check path without expanding the global check list.

## Files changed

- `experiments/cozy-island/cozy-island-tidepool-conservatory-kits.js`
- `experiments/cozy-island/cozy-island-tidepool-conservatory-entry.js`
- `experiments/cozy-island/index.html`
- `tests/cozy-island-tidepool-conservatory-readiness-kits-smoke.mjs`
- `tests/cozy-island-tidepool-conservatory-cdn-state-input-smoke.mjs`
- `tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs`
- `tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-1829-cozy-island-tidepool-conservatory-upgrade.md`

## Tests added

- `tests/cozy-island-tidepool-conservatory-readiness-kits-smoke.mjs`
- `tests/cozy-island-tidepool-conservatory-cdn-state-input-smoke.mjs`

Both tests use 10 intake cases. The kit smoke validates all six atomic descriptor surfaces, descriptor-only renderer handoff, JSON serialization, and ownership boundaries. The CDN/state smoke validates route loading, NexusEngine main CDN usage, old NexusRealtime runtime absence in changed files, manifest registration, GameHost accessors, and 10 state/input-style tidepool snapshots.

## Validation results

- Local scratch `node --check` passed for the new kit, entry, and test files.
- Local scratch execution of `tests/cozy-island-tidepool-conservatory-readiness-kits-smoke.mjs` passed all 10 intake cases.
- Connector-only run did not execute full repo `npm run check` or `npm run check:deploy` because this run did not have a cloned repo workspace.
- Static/wired validation confirms the new tests are routed through the existing Cozy Island castaway comfort checks.

Expected repo-local commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- New tidepool kit file has no old NexusRealtime runtime import.
- New tidepool entry imports NexusEngine main CDN from `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Existing `cozy-island-cloudbar.js` legacy route remains untouched and may still rely on the older ProtoKit/cloudbar stack.
- This pass migrated only changed files and preserved the older island-generation functionality instead of deleting it.

## Cleanup pass

- Kept reusable tidepool domain logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Kept the visual overlay as presentation-only code that consumes descriptors from the new domain.
- Preserved the existing castaway comfort readiness overlay.
- Preserved the old cloudbar island generator.
- No destructive route deletion, rename, or gameplay removal.

## Non-game handling

Cozy Island is a small experience-driven web scene, not a conventional game. It was not deleted or renamed. The intended proof remains: procedural island/cloudbar rendering plus descriptor-only readiness overlays. The lesson logged for this pass is that passive scenes become more useful when scenic features are converted into small readable stewardship loops without moving renderer logic into kits.

## Next safe ledge

Add a tiny interaction bridge that lets the player toggle between comfort objectives and tidepool objectives, then have the renderer highlight the currently urgent descriptor bucket instead of showing both overlays as passive dashboards.
