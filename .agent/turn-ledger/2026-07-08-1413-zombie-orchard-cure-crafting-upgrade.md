# Zombie Orchard cure crafting readiness upgrade

## Summary

Upgraded `experiments/zombie-orchard/` with a renderer-neutral cure-crafting readiness domain. The prior completed upgrade was `experiments/cozy-island/`, so this run selected a different canonical route and kept the work on the existing base Zombie Orchard route.

## Chosen experiment

```txt
experiments/zombie-orchard/
```

## Why it was chosen

Zombie Orchard already had survival readability, foraging readability, and horde pathing, but it still played mostly as wave survival with collection pressure. It needed a stronger reason to move through the rows beyond surviving and collecting apples.

The new pass adds a cure-crafting layer: infected root samples, antidote press queues, sap distillers, living barricade graft plans, survivor signal glyphs, and a dawn cure ritual window. This makes the route more visually interesting and more procedurally varied while keeping reusable logic as snapshot-to-descriptor kits.

## Last upgraded experiment

```txt
experiments/cozy-island/
```

Latest known prior ledger/commit context:

```txt
13658f7f6e4c8f9ad3b4690c7a00c57c900c7f5d
Log Cozy Island castaway comfort upgrade
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
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack; changed cure overlay uses NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges; changed runtime uses NexusEngine main CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
zombie-orchard-cure-crafting-readiness-domain
├─ cure-resource-domain
│  ├─ infected-root-sample-domain
│  │  └─ zombie-infected-root-sample-kit
│  └─ antidote-press-domain
│     └─ zombie-antidote-press-queue-kit
├─ orchard-defense-domain
│  ├─ sap-distiller-domain
│  │  └─ zombie-sap-distiller-node-kit
│  └─ barricade-graft-domain
│     └─ zombie-barricade-graft-plan-kit
├─ survivor-cure-domain
│  ├─ survivor-signal-domain
│  │  └─ zombie-survivor-signal-glyph-kit
│  └─ dawn-cure-ritual-domain
│     └─ zombie-dawn-cure-ritual-window-kit
└─ renderer-handoff
   └─ zombie-orchard-cure-crafting-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
zombie-infected-root-sample-kit
zombie-antidote-press-queue-kit
zombie-sap-distiller-node-kit
zombie-barricade-graft-plan-kit
zombie-survivor-signal-glyph-kit
zombie-dawn-cure-ritual-window-kit
zombie-orchard-cure-crafting-renderer-handoff-kit
zombie-orchard-cure-crafting-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getCureCraftingReadinessDomain()
GameHost.getCureCraftingReadiness()
GameHost.getZombieOrchardCureCraftingReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/zombie-orchard/src/cure-crafting-readiness-kits.js
experiments/zombie-orchard/src/cure-crafting-readiness-entry.js
experiments/zombie-orchard/index.html
tests/zombie-orchard-cure-crafting-readiness-kits-smoke.mjs
tests/zombie-orchard-cure-crafting-cdn-state-input-smoke.mjs
tests/zombie-orchard-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1413-zombie-orchard-cure-crafting-upgrade.md
```

## Tests added

```txt
tests/zombie-orchard-cure-crafting-readiness-kits-smoke.mjs
tests/zombie-orchard-cure-crafting-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
infected root sample descriptors
antidote press queue descriptors
sap distiller node descriptors
barricade graft plan descriptors
survivor signal glyph descriptors
dawn cure ritual window descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed cure overlay and kit files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Zombie Orchard Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through the existing `tests/zombie-orchard-playwright-state-input-smoke.mjs`, which already appears in both full and deploy suites in `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed cure overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new cure-crafting readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The existing `experiments/zombie-orchard/src/kit-stack.js` still imports older `LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1` generic survival domain kits. This run did not remove that legacy stack because it still provides movement, grid layout, row field layout, placement, walkability, spawn lanes, navigation, combat, survival rounds, horde director, and found gear. The changed cure-crafting overlay moved toward NexusEngine main CDN without destructively replacing working survival gameplay.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/zombie-orchard/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares `cure-crafting-readiness-renderer-handoff-pass` and loads a cache-busted cure crafting entry.

## Non-game handling

Zombie Orchard is a small experience-driven web game. The lesson captured: a survival wave route needs a second-order objective so the player is not only surviving. Cure-crafting descriptors provide a purpose layer without replacing the existing round, combat, collection, and horde pathing loops.

## Next safe ledge

Turn cure-crafting descriptors into light headless state:

```txt
root samples collected
antidote batches pressed
sap distiller built
barricade graft committed
survivor signal answered
dawn cure ritual completed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
