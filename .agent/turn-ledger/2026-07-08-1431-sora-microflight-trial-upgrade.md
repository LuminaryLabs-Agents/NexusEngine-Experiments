# Sora microflight trial readiness upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` with a renderer-neutral microflight trial readiness domain. The prior completed upgrade was `experiments/zombie-orchard/`, so this run selected a different canonical route and kept the work on the existing base Sora route.

## Chosen experiment

```txt
experiments/sora-the-infinite/
```

## Why it was chosen

Sora was still the shortest and least experience-driven route in the inventory. It had become a strong route-preview gateway with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge descriptors, but it still did not ask the player to complete a tiny flight loop before handing off to The Open Above.

The new pass adds a microflight trial: collect thermal tokens, preserve glide stamina, weave crosswind gates, avoid storm bursts, earn sky medals, and commit to a landing runway. This makes the route more visually interesting and more procedurally varied while keeping reusable logic as snapshot-to-descriptor kits.

## Last upgraded experiment

```txt
experiments/zombie-orchard/
```

Latest known prior ledger/commit context:

```txt
a6343be1c699e1f7350b36f3b5554f3b3cd763a0
Log Zombie Orchard cure crafting upgrade
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
| `experiments/sora-the-infinite/` | Sora launch gateway with microflight trial | Very short gateway / micro challenge | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial | No changed runtime import found in manifest audit | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack; changed cure overlay uses NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges; changed runtime uses NexusEngine main CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
sora-microflight-trial-readiness-domain
├─ lift-economy-domain
│  ├─ thermal-token-domain
│  │  └─ sora-thermal-token-cluster-kit
│  └─ glide-stamina-domain
│     └─ sora-glide-stamina-ribbon-kit
├─ hazard-routing-domain
│  ├─ crosswind-gate-domain
│  │  └─ sora-crosswind-gate-weave-kit
│  └─ storm-burst-domain
│     └─ sora-storm-burst-avoidance-kit
├─ score-return-domain
│  ├─ sky-medal-domain
│  │  └─ sora-sky-medal-score-kit
│  └─ landing-runway-domain
│     └─ sora-landing-runway-commit-kit
└─ renderer-handoff
   └─ sora-microflight-trial-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
sora-thermal-token-cluster-kit
sora-glide-stamina-ribbon-kit
sora-crosswind-gate-weave-kit
sora-storm-burst-avoidance-kit
sora-sky-medal-score-kit
sora-landing-runway-commit-kit
sora-microflight-trial-renderer-handoff-kit
sora-microflight-trial-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getMicroflightTrialReadinessDomain()
GameHost.getMicroflightTrialReadiness()
GameHost.getSoraMicroflightTrialReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/_kits/sora-the-infinite/sora-microflight-trial-readiness-domain-kits.js
experiments/sora-the-infinite/sora-microflight-trial-entry.js
experiments/sora-the-infinite/sora-microflight-trial-style.css
experiments/sora-the-infinite/index.html
tests/sora-microflight-trial-readiness-domain-kits-smoke.mjs
tests/sora-microflight-trial-cdn-state-input-smoke.mjs
tests/sora-compatibility-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1431-sora-microflight-trial-upgrade.md
```

## Tests added

```txt
tests/sora-microflight-trial-readiness-domain-kits-smoke.mjs
tests/sora-microflight-trial-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
thermal token descriptors
glide stamina ribbon descriptors
crosswind gate descriptors
storm burst descriptors
sky medal descriptors
landing runway descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed microflight files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Sora compatibility smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through the existing `tests/sora-compatibility-cdn-state-input-smoke.mjs`, which already appears in both full and deploy suites in `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed microflight overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new microflight trial readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The existing Sora gateway already imports NexusEngine main CDN. No old NexusRealtime runtime import was introduced.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/sora-the-infinite/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares `microflight-trial-readiness-renderer-handoff-pass` in the manifest and loads cache-busted microflight trial assets.

## Non-game handling

Sora is a very short gateway rather than a full standalone game. The lesson captured: a launch gateway still needs a tiny authored challenge so the player proves basic control intent before being handed to the larger flight route.

## Next safe ledge

Turn microflight trial descriptors into tiny headless state:

```txt
thermal tokens collected
crosswind gates cleared
storm bursts avoided
glide stamina maintained
sky medals earned
landing runway committed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
