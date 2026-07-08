# Cavalry diplomatic command readiness upgrade

## Summary

Upgraded `apps/the-cavalry-of-rome/` with a renderer-neutral diplomatic-command readiness domain. The prior completed upgrade was `games/signal-bastion/`, so this run selected a different route and kept the work on the canonical Cavalry route.

## Chosen experiment

```txt
apps/the-cavalry-of-rome/
```

## Why it was chosen

The Cavalry of Rome already had campaign, battlefield-orders, and logistics-readiness descriptor layers, but the political campaign pressure was still implicit. The route could show where armies could move and where logistics were strained, but it did not expose senate mandates, tribute obligations, ally loyalty, rebellion risk, province pacification, or triumph timing as explicit descriptor domains.

This made it a good low-variability target: the strategic map was stable and already NexusEngine-CDN-oriented, but the player decision surface could become more meaningful without creating a new route or moving renderer ownership into kits.

## Last upgraded experiment

```txt
games/signal-bastion/
```

Latest known prior ledger/commit context:

```txt
9dc6caaca1b2ad28c6f01c3ba1fe75d7a5bf21a4
Log Signal Bastion evacuation corridor upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer | Short arcade loop | movement, jump, coins, hazards, exit, skill rhythm | No changed runtime import found in manifest audit | Yes |
| `experiments/next-ledge/` | Grapple/climbing rescue route | Short skill loop | grapple, swing, cargo, traversal, rescue line | No changed runtime import found in manifest audit | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract | No changed runtime import found in manifest audit | Yes |
| `experiments/the-open-above/` | Bird flight sandbox | Open-ended flight loop | bird flight, terrain, sky descriptors, route readability | No changed runtime import found in manifest audit | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive / short ecology loop | grass, flowers, sheep, pasture route, flock safety | No changed runtime import found in manifest audit | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue | No changed runtime import found in manifest audit | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration / beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora launch gateway | Very short gateway | route preview, launch rehearsal, flightplan, preflight challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing | No changed runtime import found in manifest audit | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges; changed runtime uses NexusEngine main CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
cavalry-diplomatic-command-readiness-domain
├─ senate-pressure-domain
│  ├─ decree-mandate-domain
│  │  └─ cavalry-senate-decree-mandate-kit
│  └─ tribute-obligation-domain
│     └─ cavalry-tribute-obligation-ledger-kit
├─ ally-frontier-domain
│  ├─ ally-loyalty-domain
│  │  └─ cavalry-ally-loyalty-banner-kit
│  └─ rebellion-spark-domain
│     └─ cavalry-rebellion-spark-kit
├─ campaign-legitimacy-domain
│  ├─ province-pacification-domain
│  │  └─ cavalry-province-pacification-band-kit
│  └─ triumph-window-domain
│     └─ cavalry-triumph-window-standard-kit
└─ renderer-handoff
   └─ cavalry-diplomatic-command-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
cavalry-senate-decree-mandate-kit
cavalry-tribute-obligation-ledger-kit
cavalry-ally-loyalty-banner-kit
cavalry-rebellion-spark-kit
cavalry-province-pacification-band-kit
cavalry-triumph-window-standard-kit
cavalry-diplomatic-command-renderer-handoff-kit
cavalry-diplomatic-command-readiness-domain-kit
```

Changed composition:

```txt
cavalry-diplomatic-command-composed-renderer-handoff
GameHost.getCavalryDiplomaticCommandReadiness()
GameHost.getDiplomaticCommandReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-domain-kit.js
experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-pass.js
apps/the-cavalry-of-rome/index.html
experiments/The Cavalry of Rome/index.html
tests/cavalry-diplomatic-command-readiness-domain-kits-smoke.mjs
tests/cavalry-diplomatic-command-readiness-cdn-state-input-smoke.mjs
tests/cavalry-battlefield-orders-domain-kits-smoke.mjs
tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs
tests/cavalry-of-rome-visual-static-smoke.mjs
experiments/The Cavalry of Rome/domain-plan.json
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1329-cavalry-diplomatic-command-upgrade.md
```

## Tests added

```txt
tests/cavalry-diplomatic-command-readiness-domain-kits-smoke.mjs
tests/cavalry-diplomatic-command-readiness-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
senate decree mandates
tribute obligation ledgers
ally loyalty banners
rebellion sparks
province pacification bands
triumph window standards
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed files
live and experiment route cache markers
GameHost exposure
renderer handoff counts
manifest registration
existing Cavalry validation routing
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through existing Cavalry battlefield-orders checks, which are already part of full and deploy validation.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new diplomatic-command readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The older visual proof still has existing ProtoKit dependencies through historical route modules. This run did not add new old-runtime imports and kept the changed overlay on NexusEngine main CDN.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
apps/the-cavalry-of-rome/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The static smoke was refreshed so the current Campaign 035 handoff/logistics cache markers and new Campaign 036 diplomatic command pass are aligned with the route shell.

## Non-game handling

The Cavalry of Rome is already an experience-driven strategy route, so no delete/rename/refactor-away action was needed.

The lesson captured: movement and logistics were readable, but politics were abstract. Diplomatic command descriptors turn the map into a more complete campaign loop with senate, tribute, ally, rebellion, pacification, and triumph pressure.

## Next safe ledge

Add an optional `campaign-diplomacy-state` layer that turns diplomatic descriptors into actual turn pressure:

```txt
senate favor
tribute reserve
ally envoy pending
province unrest
triumph progress
```

Keep that future layer as a state kit that still emits descriptors and does not own renderer/input/frame-loop concerns.
