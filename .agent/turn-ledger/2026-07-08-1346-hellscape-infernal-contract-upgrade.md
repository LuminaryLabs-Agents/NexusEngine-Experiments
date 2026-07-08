# Hellscape infernal contract readiness upgrade

## Summary

Upgraded `games/rogue-lite-hellscape-siege/` with a renderer-neutral infernal-contract readiness domain. The prior completed upgrade was `apps/the-cavalry-of-rome/`, so this run selected a different canonical route and kept the work on the base Hellscape route.

## Chosen experiment

```txt
games/rogue-lite-hellscape-siege/
```

## Why it was chosen

Rogue-Lite Hellscape Siege already had visual-fractal, expedition-readability, and siegecraft-readiness descriptors, but the contract layer of the roguelite fantasy was still implicit. The player could harvest, build, defend the core, and read siege pressure, but could not explicitly read portal-seal priorities, curse debt, relic routes, sacrifice risk, demon champion threat, or final pact timing.

This made it the best low-variability target after Cavalry: it is already a small experience-driven web game, already imports NexusEngine main via CDN, and a descriptor-only readiness layer could add meaningful choice without creating a new route or moving renderer ownership into kits.

## Last upgraded experiment

```txt
apps/the-cavalry-of-rome/
```

Latest known prior ledger/commit context:

```txt
95405ba14db5d0b09e966878e5736aef7b5d44da
Log Cavalry diplomatic command upgrade
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
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
hellscape-infernal-contract-readiness-domain
├─ portal-oath-domain
│  ├─ portal-seal-domain
│  │  └─ hellscape-portal-seal-priority-kit
│  └─ curse-debt-domain
│     └─ hellscape-curse-debt-ledger-kit
├─ relic-sacrifice-domain
│  ├─ relic-route-domain
│  │  └─ hellscape-relic-route-thread-kit
│  └─ sacrifice-risk-domain
│     └─ hellscape-sacrifice-risk-aura-kit
├─ champion-pact-domain
│  ├─ demon-champion-domain
│  │  └─ hellscape-demon-champion-wake-kit
│  └─ final-pact-domain
│     └─ hellscape-final-pact-window-kit
└─ renderer-handoff
   └─ hellscape-infernal-contract-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
hellscape-portal-seal-priority-kit
hellscape-curse-debt-ledger-kit
hellscape-relic-route-thread-kit
hellscape-sacrifice-risk-aura-kit
hellscape-demon-champion-wake-kit
hellscape-final-pact-window-kit
hellscape-infernal-contract-renderer-handoff-kit
hellscape-infernal-contract-readiness-domain-kit
```

Changed composition:

```txt
hellscape-composed-renderer-handoff
GameHost.getInfernalContractReadiness()
GameHost.getHellscapeInfernalContractReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
games/rogue-lite-hellscape-siege/src/hellscape-infernal-contract-readiness-domain-kit.js
games/rogue-lite-hellscape-siege/src/main.js
games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js
games/rogue-lite-hellscape-siege/index.html
tests/hellscape-infernal-contract-readiness-domain-kits-smoke.mjs
tests/hellscape-infernal-contract-readiness-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1346-hellscape-infernal-contract-upgrade.md
```

## Tests added

```txt
tests/hellscape-infernal-contract-readiness-domain-kits-smoke.mjs
tests/hellscape-infernal-contract-readiness-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
portal seal priorities
curse debt ledger cards
relic route threads
sacrifice risk auras
demon champion wakes
final pact windows
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed files
route shell pass marker and cache busting
GameHost exposure
renderer handoff counts
manifest registration
validation routing
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests were added to both full and deploy check suites in `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new infernal-contract readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

Older local ProtoKit modules remain in the game stack for historical runtime behavior, but this run added no old `LuminaryLabs-Dev/NexusRealtime@main` imports and kept the changed domain integration on NexusEngine main CDN.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
games/rogue-lite-hellscape-siege/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell was refreshed from `siegecraft-readiness-1` to `infernal-contract-readiness-1` and now declares `infernal-contract-readiness-renderer-handoff-pass`.

## Non-game handling

Rogue-Lite Hellscape Siege is already a small experience-driven web game, so no delete/rename/refactor-away action was needed.

The lesson captured: the route had defense and survival readability, but the roguelite pact fantasy was abstract. Infernal contract descriptors turn the route into a clearer pact-management loop with portals, debts, relics, sacrifices, champions, and final-seal timing.

## Next safe ledge

Turn infernal-contract descriptors into light gameplay state:

```txt
portal seal progress
curse debt repayment
relic contract counters
sacrifice cooldown
champion mark state
final pact completion
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
