# Zombie Orchard safehouse evacuation readiness upgrade

## Summary

Upgraded `experiments/zombie-orchard/` with a renderer-neutral safehouse evacuation readiness domain. The latest completed upgrade before this run was `games/rogue-lite-hellscape-siege/`, so this run selected a different canonical experiment route and kept all work inside `LuminaryLabs-Agents/NexusEngine-Experiments` on `main`.

## Chosen experiment

```txt
experiments/zombie-orchard/
```

## Why it was chosen

Zombie Orchard already had movement, apples, gear, waves, foraging readability, horde pathing, and cure crafting.

It still read like a repeated survival arena more than a rescue scenario. The safehouse evacuation pass adds barn safehouse beacons, orchard lane clearances, barricade reinforcement, antidote runners, dawn wagon rallies, and radio tower signals. This gives each wave a visible civilian extraction layer without moving reusable logic into the renderer.

## Last upgraded experiment

```txt
games/rogue-lite-hellscape-siege/
```

Latest prior completed ledger context:

```txt
.agent/turn-ledger/2026-07-08-1813-hellscape-ash-caravan-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic and training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge, stealth extraction | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, oracle readability, clue pressure, evidence ritual readiness | No old NexusRealtime runtime CDN in changed evidence ritual files | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command, field hospital readiness | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer rescue course | Short arcade loop | A/D movement, Space jump, coins, hazards, exit, companion rescue | No old NexusRealtime import in changed companion rescue files | Yes |
| `experiments/next-ledge/` | Grapple and climbing mountain rescue route | Short skill loop | grapple, swing, cargo, traversal, anchor timing, rescue line, summit bivouac | Shared loader keeps historical helper name, changed overlays use NexusEngine main CDN | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract, basecamp resupply | No old NexusRealtime import in changed basecamp resupply files | Yes |
| `experiments/the-open-above/` | Open flight sandbox | Open-ended flight loop | bird flight, terrain streaming, route readability, aerial courier readiness | Shared loader retains historical NexusRealtime helper name; changed overlays use NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive scene now upgraded into short harvest prep loop | grass, flowers, sheep, ecology, flock safety, harvest festival readiness | No old NexusRealtime import in changed harvest festival files | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue, storm evacuation, blackout recovery | No old NexusRealtime runtime CDN in changed blackout recovery files | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration and beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor, harbor relief | No old NexusRealtime runtime CDN in changed harbor relief files | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop now upgraded with safehouse evacuation | move, collect, waves, foraging, horde pathing, cure crafting, safehouse evacuation | Shared page-loader helper still has historical NexusRealtime name; changed safehouse entry imports NexusEngine main CDN | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor, reconstruction readiness | ProtoKits imports remain for generic defense bridges; changed reconstruction files do not import old NexusRealtime runtime CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival and defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract, ash caravan readiness | Shared route shell still uses a historical page-loader helper name; changed runtime imports NexusEngine main CDN and not old NexusRealtime runtime CDN | Yes |

## Domain ASCII tree

```txt
zombie-orchard-safehouse-evacuation-readiness-domain
├─ survivor-route-domain
│  ├─ safehouse-beacon-domain
│  │  └─ zombie-orchard-safehouse-beacon-kit
│  └─ orchard-lane-clearance-domain
│     └─ zombie-orchard-lane-clearance-kit
├─ infection-containment-domain
│  ├─ barricade-reinforcement-domain
│  │  └─ zombie-orchard-barricade-reinforcement-kit
│  └─ antidote-runner-domain
│     └─ zombie-orchard-antidote-runner-kit
├─ dawn-extraction-domain
│  ├─ wagon-rally-domain
│  │  └─ zombie-orchard-dawn-wagon-rally-kit
│  └─ radio-tower-signal-domain
│     └─ zombie-orchard-radio-tower-signal-kit
└─ renderer-handoff
   └─ zombie-orchard-safehouse-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
zombie-orchard-safehouse-beacon-kit
zombie-orchard-lane-clearance-kit
zombie-orchard-barricade-reinforcement-kit
zombie-orchard-antidote-runner-kit
zombie-orchard-dawn-wagon-rally-kit
zombie-orchard-radio-tower-signal-kit
zombie-orchard-safehouse-evacuation-renderer-handoff-kit
zombie-orchard-safehouse-evacuation-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getSafehouseEvacuationReadinessDomain()
GameHost.getSafehouseEvacuationReadiness()
GameHost.getZombieOrchardSafehouseEvacuationReadiness()
GameHost.getSafehouseEvacuationReadinessTree()
GameHost.getRendererHandoff()
```

The safehouse evacuation overlay composes descriptors after the existing base game, horde pathing, and cure crafting layers.

## Files changed

```txt
experiments/zombie-orchard/src/safehouse-evacuation-readiness-kits.js
experiments/zombie-orchard/src/safehouse-evacuation-readiness-entry.js
experiments/zombie-orchard/index.html
tests/zombie-orchard-safehouse-evacuation-readiness-kits-smoke.mjs
tests/zombie-orchard-safehouse-evacuation-cdn-state-input-smoke.mjs
tests/zombie-orchard-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1844-zombie-orchard-safehouse-evacuation-upgrade.md
```

## Tests added

```txt
tests/zombie-orchard-safehouse-evacuation-readiness-kits-smoke.mjs
tests/zombie-orchard-safehouse-evacuation-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
safehouse beacons
orchard lane clearances
barricade reinforcements
antidote runners
dawn wagon rallies
radio tower signals
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership policy
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed entry
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through the existing Zombie Orchard Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new safehouse evacuation tests are routed transitively through:

```txt
tests/zombie-orchard-playwright-state-input-smoke.mjs
```

That parent smoke is already included in the standard validation path, so the new checks run when the repo check entrypoint runs.

Runtime repo-wide shell execution was not available in this connector run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`experiments/zombie-orchard/src/safehouse-evacuation-readiness-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/zombie-orchard/index.html` still imports the shared page-loader helper whose function name contains `NexusRealtime`. That helper name is preserved as historical shared shell infrastructure; the changed runtime path is moved toward NexusEngine main CDN.

The new safehouse evacuation readiness kit does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, or the frame loop.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/zombie-orchard/
```

No new versioned route was created.

No destructive route deletion was performed.

Reusable safehouse evacuation logic stayed in atomic kits.

The overlay only presents descriptor buckets and does not own game truth.

## Non-game handling

Zombie Orchard is a small experience-driven web game route. It was not deleted or renamed because it already provides useful movement, foraging, wave, gear, horde pathing, and cure crafting functionality.

Lesson captured: a wave survival route becomes more meaningful when rescue capacity, safe routes, barricades, serum runners, wagon departures, and radio calls are first-class descriptors rather than hidden score flavor.

## Next safe ledge

Add a headless evacuation objective ledger:

```txt
survivors sheltered
lanes cleared
barricades reinforced
serum delivered
wagons filled
radio calls completed
```

Keep that state kit separate from renderer and let the existing overlay continue consuming descriptors only.
