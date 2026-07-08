# Next Ledge summit bivouac readiness upgrade

## Summary

Upgraded `experiments/next-ledge/` with a renderer-neutral summit bivouac readiness domain. The prior completed upgrade was `experiments/tropical-island-scene/`, so this run selected a different canonical route and kept the work on the existing Next Ledge base route.

## Chosen experiment

```txt
experiments/next-ledge/
```

## Why it was chosen

Next Ledge was still one of the shortest skill-loop routes in the current inventory. It had grapple, swing, cargo descriptors, traversal readability, anchor timing, and rescue-line readiness, but the summit survival layer was still implicit.

The new pass adds storm exposure bands, bivouac shelter pockets, partner belay echoes, med cache stations, route flag threads, and evacuation flare windows. This turns the climb from a pure traversal challenge into a small mountain-rescue ascent with survival, team assurance, and extraction timing.

## Last upgraded experiment

```txt
experiments/tropical-island-scene/
```

Latest known prior ledger / commit context:

```txt
2e48461ecd18aaff654e50a027f876d015382acf
Log tropical tide salvage upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer rescue course | Short arcade loop | A/D movement, Space jump, coins, hazards, exit, traversal readability, skill rhythm, companion rescue | No old NexusRealtime import in changed companion rescue files | Yes |
| `experiments/next-ledge/` | Grapple/climbing mountain rescue route | Short skill loop | grapple, swing, cargo, traversal, anchor timing, rescue line, summit bivouac | No old NexusRealtime import in changed summit bivouac files | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract, basecamp resupply | No old NexusRealtime import in changed basecamp resupply files | Yes |
| `experiments/the-open-above/` | Bird flight sandbox | Open-ended flight loop | bird flight, terrain streaming, route readability, aerial courier readiness | Shared loader retains historical NexusRealtime name; runtime config and changed overlays use NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive / short ecology loop | grass, flowers, sheep, pasture route, flock safety | No changed runtime import found in manifest audit | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue | No changed runtime import found in manifest audit | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration / beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
next-ledge-summit-bivouac-readiness-domain
├─ exposure-survival-domain
│  ├─ storm-exposure-domain
│  │  └─ next-ledge-storm-exposure-band-kit
│  └─ bivouac-shelter-domain
│     └─ next-ledge-bivouac-shelter-pocket-kit
├─ team-assurance-domain
│  ├─ partner-belay-domain
│  │  └─ next-ledge-partner-belay-echo-kit
│  └─ med-cache-domain
│     └─ next-ledge-med-cache-station-kit
├─ summit-return-domain
│  ├─ route-flag-domain
│  │  └─ next-ledge-route-flag-thread-kit
│  └─ evacuation-flare-domain
│     └─ next-ledge-evacuation-flare-window-kit
└─ renderer-handoff
   └─ next-ledge-summit-bivouac-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
next-ledge-storm-exposure-band-kit
next-ledge-bivouac-shelter-pocket-kit
next-ledge-partner-belay-echo-kit
next-ledge-med-cache-station-kit
next-ledge-route-flag-thread-kit
next-ledge-evacuation-flare-window-kit
next-ledge-summit-bivouac-renderer-handoff-kit
next-ledge-summit-bivouac-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getSummitBivouacReadiness()
GameHost.getNextLedgeSummitBivouacReadiness()
GameHost.getSummitBivouacReadinessTree()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/next-ledge/src/summit-bivouac-readiness-kits.js
experiments/next-ledge/src/summit-bivouac-readiness-entry.js
experiments/next-ledge/index.html
tests/next-ledge-summit-bivouac-readiness-kits-smoke.mjs
tests/next-ledge-summit-bivouac-cdn-state-input-smoke.mjs
tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1600-next-ledge-summit-bivouac-upgrade.md
```

## Tests added

```txt
tests/next-ledge-summit-bivouac-readiness-kits-smoke.mjs
tests/next-ledge-summit-bivouac-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
storm exposure band descriptors
bivouac shelter pocket descriptors
partner belay echo descriptors
med cache station descriptors
route flag thread descriptors
evacuation flare window descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed summit bivouac files
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through the already-routed Next Ledge anchor timing smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through `tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs`, which is already included in both full and deploy validation suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed summit bivouac overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new summit bivouac readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The route still uses the historical shared page-loader helper name:

```txt
attachNexusRealtimePageLoader
```

That helper is outside the new kit surface and was preserved because it is part of the existing route shell convention, not a changed old runtime CDN import.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/next-ledge/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now draws the summit bivouac layer from descriptor buckets only and records the pass in the manifest.

## Non-game handling

Next Ledge is a small experience-driven web game, so no deletion, rename, or non-game refactor was required. The lesson captured: a short grapple route becomes more legible when its traversal and rescue descriptors are extended with survival pressure, support caches, belay confidence, and flare timing without letting the renderer own mission truth.

## Next safe ledge

Turn summit bivouac descriptors into light headless state:

```txt
storm windows survived
shelter pockets used
belay calls confirmed
med caches consumed
route flags cleared
evacuation flare committed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
