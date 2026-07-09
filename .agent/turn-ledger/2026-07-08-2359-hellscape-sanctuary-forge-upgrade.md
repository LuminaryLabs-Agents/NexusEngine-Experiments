# 2026-07-08 23:59 - Hellscape sanctuary forge readiness upgrade

## Summary

Upgraded `games/rogue-lite-hellscape-siege/` after the latest completed ledger showed `experiments/infinite-radial-terrain/` observatory evacuation work. This run intentionally chose a different route and added a sanctuary forge objective layer: ember bellows pressure, crucible cooling loops, relic mold priorities, ward rune circles, sanctuary lane threads, and forge gate commit windows.

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

- The latest completed upgrade was `experiments/infinite-radial-terrain/`, so this run avoided repeating that route.
- Hellscape already had a playable survival loop but still benefits from a stronger readable objective layer between defense, caravan protection, and final extraction.
- The route already imports NexusEngine main CDN in `src/main.js`, making it safe to deepen the route without reintroducing old runtime drift.
- The new pass adds procedural visual variety through descriptor-only forge, ward, and sanctuary lane geometry while preserving renderer boundaries.

## Last upgraded experiment

`experiments/infinite-radial-terrain/`

Latest observed completed commit:

- `42c9341b648145c2358ff1c6ca2addf9f796e247` - `Log Infinite Terrain observatory evacuation upgrade`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent overlays | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, expedition, survey contract, basecamp, avalanche rescue, observatory evacuation | No old runtime CDN in latest changed files | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird/balloon flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, clinic/ambulance overlays | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed well entry imports NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, castaway comfort, tidepool, turtle hatchery, lagoon lantern rescue | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense roguelite | 10-20 minute loop | harvest, portals, build, siege, expedition readability, siegecraft, infernal contract, ash caravan, sanctuary forge | Local historical loader name preserved; changed runtime main does not import old CDN | Yes |

## Domain ASCII tree

```txt
hellscape-sanctuary-forge-readiness-domain
├─ forge-stabilization-domain
│  ├─ ember-bellows-domain
│  │  └─ hellscape-ember-bellows-pressure-kit
│  └─ crucible-cooling-domain
│     └─ hellscape-crucible-cooling-loop-kit
├─ ward-crafting-domain
│  ├─ relic-mold-domain
│  │  └─ hellscape-relic-mold-priority-kit
│  └─ ward-rune-domain
│     └─ hellscape-ward-rune-circle-kit
├─ civilian-sanctuary-domain
│  ├─ sanctuary-lane-domain
│  │  └─ hellscape-sanctuary-lane-thread-kit
│  └─ forge-gate-domain
│     └─ hellscape-forge-gate-commit-kit
└─ renderer-handoff
   └─ hellscape-sanctuary-forge-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-ember-bellows-pressure-kit`
- `hellscape-crucible-cooling-loop-kit`
- `hellscape-relic-mold-priority-kit`
- `hellscape-ward-rune-circle-kit`
- `hellscape-sanctuary-lane-thread-kit`
- `hellscape-forge-gate-commit-kit`
- `hellscape-sanctuary-forge-renderer-handoff-kit`
- `hellscape-sanctuary-forge-readiness-domain-kit`

Changed:

- `src/main.js` now installs `createHellscapeSanctuaryForgeReadinessDomainKit()` beside the existing fractal, expedition, siegecraft, infernal contract, and ash caravan domains.
- `snapshot()` now exposes `state.sanctuaryForgeReadiness` and `state.domain.hellscapeSanctuaryForgeReadiness`.
- `GameHost` now exposes `getSanctuaryForgeReadiness()`, `getHellscapeSanctuaryForgeReadiness()`, and `getSanctuaryForgeReadinessTree()`.
- `getRendererHandoff()` now composes the sanctuary forge descriptor handoff into `hellscapeSanctuaryForge`.
- The canvas renderer now consumes the new descriptor buckets using rings, lines, and points without owning domain logic.

## Files changed

- `games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/main.js`
- `games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js`
- `games/rogue-lite-hellscape-siege/index.html`
- `tests/hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs`
- `tests/hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs`
- `tests/hellscape-siege-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2359-hellscape-sanctuary-forge-upgrade.md`

## Tests added

- `tests/hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs`
- `tests/hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic sanctuary forge kits.
- Descriptor counts.
- Renderer handoff policy.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed runtime entry.
- GameHost sanctuary forge accessor exposure.
- Parent Hellscape smoke routing.

## Validation results

Scratch validation performed before connector writes:

- `node --check games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js` passed.
- `node --check games/rogue-lite-hellscape-siege/src/main.js` passed.
- `node --check games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js` passed.
- `node --check tests/hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs` passed.
- `node --check tests/hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs` passed.
- `node tests/hellscape-sanctuary-forge-readiness-domain-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

Connector validation:

- GitHub accepted all writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright run.

## NexusRealtime import audit

Changed files:

- `games/rogue-lite-hellscape-siege/src/main.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `LuminaryLabs-Dev/NexusRealtime@main`.
- `games/rogue-lite-hellscape-siege/src/hellscape-sanctuary-forge-readiness-domain-kit.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js`: consumes descriptors only for the new pass and does not compute sanctuary forge game truth.
- `tests/hellscape-sanctuary-forge-readiness-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence in the changed runtime.
- `games/rogue-lite-hellscape-siege/index.html`: still references the historical local `nexus-realtime-page-loader.js` helper name. I preserved it because it is part of the existing shared gallery shell and not a new runtime CDN import.

## Cleanup pass

- Preserved the canonical game route.
- Did not create a branch.
- Did not create a pull request.
- Did not delete or rename useful functionality.
- Kept reusable sanctuary forge logic renderer-neutral.
- Kept renderer changes limited to descriptor consumption.
- Kept all descriptor groups serializable.
- Routed the two new smoke files through the existing Hellscape smoke.
- Did not rewrite the large one-line manifest in this pass.

## Non-game handling

`games/rogue-lite-hellscape-siege/` is a small experience-driven web game, so no delete, refactor, or rename pass was needed. The new pass deepens the existing game rather than replacing it.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, add `hellscape-sanctuary-forge-readiness-domain-kit` cleanly, then run full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getHellscapeSanctuaryForgeReadiness()` and `window.GameHost.getRendererHandoff().descriptors.hellscapeSanctuaryForge` after route load.
