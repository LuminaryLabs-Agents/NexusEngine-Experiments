# Nexus Frontier: Signal Isles harbor relief readiness upgrade

## Summary

Upgraded `experiments/nexus-frontier-signal-isles/` with a renderer-neutral harbor relief readiness domain. The latest completed upgrade before this run was `experiments/fogline-relay/`, so this run selected a different canonical route and kept the work on the existing Signal Isles route.

## Chosen experiment

```txt
experiments/nexus-frontier-signal-isles/
```

## Why it was chosen

Signal Isles already had first-person movement, scan sites, resource harvesting, build placement, cargo delivery, objective readability, expedition readiness, and storm anchor readiness.

It still needed a more human objective layer after storm anchoring: wounded settlements, medicine crates, pier landing windows, skiff channels, relief horn calls, and departure manifests. That makes the route read less like abstract beacon activation and more like island restoration plus emergency harbor relief.

## Last upgraded experiment

```txt
experiments/fogline-relay/
```

Latest prior completed commit context:

```txt
f763d41290f16911c5c088454339745c02803aae
Log Fogline storm evacuation upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic and training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge, stealth extraction | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, oracle readability, clue pressure, evidence ritual readiness | No old NexusRealtime runtime CDN in changed evidence ritual files | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer rescue course | Short arcade loop | A/D movement, Space jump, coins, hazards, exit, companion rescue | No old NexusRealtime import in changed companion rescue files | Yes |
| `experiments/next-ledge/` | Grapple and climbing mountain rescue route | Short skill loop | grapple, swing, cargo, traversal, anchor timing, rescue line, summit bivouac | Shared loader keeps historical helper name, changed overlays use NexusEngine main CDN | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract, basecamp resupply | No old NexusRealtime import in changed basecamp resupply files | Yes |
| `experiments/the-open-above/` | Open flight sandbox | Open-ended flight loop | bird flight, terrain streaming, route readability, aerial courier readiness | Shared loader retains historical NexusRealtime helper name; changed overlays use NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive scene now upgraded into short harvest prep loop | grass, flowers, sheep, ecology, flock safety, harvest festival readiness | No old NexusRealtime import in changed harvest festival files | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue, storm evacuation | No old NexusRealtime runtime CDN in changed storm evacuation files | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration and beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor, harbor relief | No old NexusRealtime runtime CDN in changed harbor relief files | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival and defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
signal-isles-harbor-relief-readiness-domain
├─ survivor-logistics-domain
│  ├─ wounded-settlement-domain
│  │  └─ signal-isles-wounded-settlement-triage-kit
│  └─ medicine-crate-domain
│     └─ signal-isles-medicine-crate-cache-kit
├─ harbor-route-domain
│  ├─ pier-landing-domain
│  │  └─ signal-isles-pier-landing-window-kit
│  └─ skiff-channel-domain
│     └─ signal-isles-skiff-channel-thread-kit
├─ beacon-handoff-domain
│  ├─ relief-horn-domain
│  │  └─ signal-isles-relief-horn-call-kit
│  └─ departure-manifest-domain
│     └─ signal-isles-departure-manifest-kit
└─ renderer-handoff
   └─ signal-isles-harbor-relief-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
signal-isles-wounded-settlement-triage-kit
signal-isles-medicine-crate-cache-kit
signal-isles-pier-landing-window-kit
signal-isles-skiff-channel-thread-kit
signal-isles-relief-horn-call-kit
signal-isles-departure-manifest-kit
signal-isles-harbor-relief-renderer-handoff-kit
signal-isles-harbor-relief-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getHarborReliefReadinessState()
GameHost.getRendererHandoff()
composition.getHarborReliefReadinessState()
composition.getRenderSnapshot()
composition.getState()
```

The new harbor relief layer composes after storm anchor readiness, so the final handoff includes visual descriptors, objective readability, expedition readiness, storm anchor readiness, and harbor relief readiness.

## Files changed

```txt
experiments/_kits/nexus-frontier-signal-isles/signal-isles-harbor-relief-readiness-domain-kits.js
experiments/nexus-frontier-signal-isles/src/game-composition.js
experiments/nexus-frontier-signal-isles/src/renderer.js
experiments/nexus-frontier-signal-isles/src/main.js
experiments/nexus-frontier-signal-isles/src/debug-host.js
experiments/nexus-frontier-signal-isles/index.html
tests/signal-isles-harbor-relief-readiness-kits-smoke.mjs
tests/signal-isles-harbor-relief-cdn-state-input-smoke.mjs
tests/signal-isles-playwright-state-input-smoke.mjs
tests/signal-isles-storm-anchor-readiness-cdn-state-input-smoke.mjs
tests/signal-isles-static-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1714-signal-isles-harbor-relief-upgrade.md
```

## Tests added

```txt
tests/signal-isles-harbor-relief-readiness-kits-smoke.mjs
tests/signal-isles-harbor-relief-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
wounded settlement triage descriptors
medicine crate cache descriptors
pier landing window descriptors
skiff channel thread descriptors
relief horn call descriptors
departure manifest descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed files
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through the existing Signal Isles Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are imported by:

```txt
tests/signal-isles-playwright-state-input-smoke.mjs
```

That Signal Isles Playwright-style state/input smoke is already included in both full and deploy suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed harbor relief route files use or preserve:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The changed runtime entry does not import the old NexusRealtime main CDN.

The new harbor relief readiness kit does not import old NexusRealtime and does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, or the frame loop.

The historical marker comment in `game-composition.js` remains only for static audit compatibility and does not represent an old runtime CDN import.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/nexus-frontier-signal-isles/
```

No new versioned route was created.

No destructive route deletion was performed.

Reusable harbor relief logic stayed in atomic kits.

The Three renderer consumes descriptor buckets and does not own harbor relief truth.

## Non-game handling

Signal Isles is a small experience-driven web game route. It was not deleted or renamed because it already provides useful first-person movement, scanning, harvesting, building, cargo, route, and pressure-loop functionality.

Lesson captured: a beacon-restoration route becomes more legible when the next domain adds survivor logistics and departure readiness while renderer code remains descriptor consumption only.

## Next safe ledge

Turn harbor relief descriptors into a light headless objective state:

```txt
settlements triaged
medicine crates secured
pier landing certified
skiff channel opened
relief horn answered
departure manifest complete
```

Keep that future layer as a headless state kit and let renderer/DOM presentation continue consuming descriptors only.
