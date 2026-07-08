# Sora sky rescue readiness upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` with a renderer-neutral sky rescue readiness domain. The prior completed upgrade was `experiments/zombie-orchard/`, so this run selected a different canonical route and kept the work on the existing Sora base route.

## Chosen experiment

```txt
experiments/sora-the-infinite/
```

## Why it was chosen

Sora was still the shortest and least game-like canonical route: it had grown from a redirect into a route-preview, launch rehearsal, flightplan, sky-negotiation, preflight, and microflight gateway, but its player intent still ended at practicing flight descriptors.

The new pass gives the gateway a direct rescue objective: hear survivor beacons, reach stranded sky islands, map gust corridors, avoid shadow squalls, spool rescue tethers, and form dawn handoff convoys before entering The Open Above.

## Last upgraded experiment

```txt
experiments/zombie-orchard/
```

Latest known prior ledger / commit context:

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
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
sora-sky-rescue-readiness-domain
├─ survivor-signal-domain
│  ├─ beacon-call-domain
│  │  └─ sora-rescue-beacon-call-kit
│  └─ stranded-island-domain
│     └─ sora-stranded-sky-island-kit
├─ storm-route-domain
│  ├─ gust-corridor-domain
│  │  └─ sora-gust-corridor-map-kit
│  └─ shadow-squall-domain
│     └─ sora-shadow-squall-warning-kit
├─ extraction-handoff-domain
│  ├─ rescue-tether-domain
│  │  └─ sora-rescue-tether-spool-kit
│  └─ dawn-convoy-domain
│     └─ sora-dawn-handoff-convoy-kit
└─ renderer-handoff
   └─ sora-sky-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
sora-rescue-beacon-call-kit
sora-stranded-sky-island-kit
sora-gust-corridor-map-kit
sora-shadow-squall-warning-kit
sora-rescue-tether-spool-kit
sora-dawn-handoff-convoy-kit
sora-sky-rescue-renderer-handoff-kit
sora-sky-rescue-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getSkyRescueReadinessDomain()
GameHost.getSkyRescueReadiness()
GameHost.getSoraSkyRescueReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/_kits/sora-the-infinite/sora-sky-rescue-readiness-domain-kits.js
experiments/sora-the-infinite/sora-sky-rescue-entry.js
experiments/sora-the-infinite/sora-sky-rescue-style.css
experiments/sora-the-infinite/index.html
tests/sora-sky-rescue-readiness-domain-kits-smoke.mjs
tests/sora-sky-rescue-cdn-state-input-smoke.mjs
tests/sora-compatibility-cdn-state-input-smoke.mjs
tests/sora-microflight-trial-cdn-state-input-smoke.mjs
tests/sora-launch-rehearsal-cdn-state-input-smoke.mjs
tests/sora-flightplan-readability-cdn-state-input-smoke.mjs
tests/sora-sky-negotiation-readiness-cdn-state-input-smoke.mjs
tests/sora-preflight-challenge-readiness-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1444-sora-sky-rescue-upgrade.md
```

## Tests added

```txt
tests/sora-sky-rescue-readiness-domain-kits-smoke.mjs
tests/sora-sky-rescue-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
rescue beacon descriptors
stranded sky island descriptors
gust corridor descriptors
shadow squall descriptors
rescue tether descriptors
dawn handoff convoy descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed sky rescue overlay and kit files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Sora compatibility smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through `tests/sora-compatibility-cdn-state-input-smoke.mjs`, which is already present in both full and deploy suites in `scripts/run-checks.mjs`.

Refreshed older Sora cache-marker smoke assertions so they accept the latest `sky-rescue-readiness-v1` route shell marker instead of stale prior pass markers.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed sky rescue overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new sky rescue readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

Existing Sora route compatibility still runs through the canonical NexusEngine CDN gateway. No destructive replacement was needed.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/sora-the-infinite/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares `sky-rescue-readiness-renderer-handoff-pass` through the manifest and loads a cache-busted sky rescue entry.

## Non-game handling

Sora is a small experience-driven web gateway rather than a full game. The lesson captured: a gateway can still have a tiny playable intent loop if it exposes objective descriptors instead of only route-launch metadata.

## Next safe ledge

Turn sky rescue descriptors into light headless state:

```txt
beacons heard
stranded islands reached
gust corridors cleared
shadow squalls avoided
rescue tethers linked
dawn convoy formed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
