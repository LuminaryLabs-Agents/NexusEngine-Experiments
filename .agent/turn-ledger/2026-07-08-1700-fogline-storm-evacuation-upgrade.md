# Fogline Relay storm evacuation readiness upgrade

## Summary

Upgraded `experiments/fogline-relay/` with a renderer-neutral storm evacuation readiness domain. The latest completed upgrade before this run was `experiments/peer-scene-transition/`, so this run selected a different canonical route and kept the work on the existing Fogline Relay route.

## Chosen experiment

```txt
experiments/fogline-relay/
```

## Why it was chosen

Fogline Relay already had first-person movement, relay scanning, signal cartography, operator rhythm, and survivor rescue readiness.

It still lacked a storm-aware evacuation logistics layer that tells the player why extraction is urgent after survivors are found. The new pass adds thunderhead vectors, radio static noise, battery caches, stretcher lanes, convoy rally markers, and extraction flare windows without moving truth into renderer or DOM code.

## Last upgraded experiment

```txt
experiments/peer-scene-transition/
```

Latest prior completed commit context:

```txt
5bbe87f95239395341d6c1356914ae02c39332a4
Log peer scene evidence ritual upgrade
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
| `experiments/nexus-frontier-signal-isles/` | Island restoration and beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival and defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
fogline-storm-evacuation-readiness-domain
├─ storm-warning-domain
│  ├─ thunderhead-vector-domain
│  │  └─ fogline-thunderhead-vector-kit
│  └─ radio-static-domain
│     └─ fogline-radio-static-noise-kit
├─ evacuation-support-domain
│  ├─ battery-cache-domain
│  │  └─ fogline-battery-cache-kit
│  └─ stretcher-lane-domain
│     └─ fogline-stretcher-lane-kit
├─ convoy-handoff-domain
│  ├─ convoy-rally-domain
│  │  └─ fogline-convoy-rally-marker-kit
│  └─ extraction-flare-domain
│     └─ fogline-extraction-flare-window-kit
└─ renderer-handoff
   └─ fogline-storm-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
fogline-thunderhead-vector-kit
fogline-radio-static-noise-kit
fogline-battery-cache-kit
fogline-stretcher-lane-kit
fogline-convoy-rally-marker-kit
fogline-extraction-flare-window-kit
fogline-storm-evacuation-renderer-handoff-kit
fogline-storm-evacuation-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getStormEvacuationReadiness()
GameHost.getFoglineStormEvacuationReadiness()
GameHost.getRendererHandoff()
```

The new overlay composes after the existing survivor rescue overlay, so the final handoff includes base visual descriptors, signal cartography, operator rhythm, survivor rescue, and storm evacuation descriptors.

## Files changed

```txt
experiments/fogline-relay/src/fogline-storm-evacuation-kits.js
experiments/fogline-relay/src/storm-evacuation-readiness-entry.js
experiments/fogline-relay/index.html
tests/fogline-storm-evacuation-readiness-kits-smoke.mjs
tests/fogline-storm-evacuation-cdn-state-input-smoke.mjs
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1700-fogline-storm-evacuation-upgrade.md
```

## Tests added

```txt
tests/fogline-storm-evacuation-readiness-kits-smoke.mjs
tests/fogline-storm-evacuation-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
thunderhead vector descriptors
radio static noise descriptors
battery cache descriptors
stretcher lane descriptors
convoy rally marker descriptors
extraction flare window descriptors
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
validation routing through existing Fogline operator rhythm smokes
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are imported by:

```txt
tests/fogline-operator-rhythm-domain-kits-smoke.mjs
tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs
```

Those Fogline operator rhythm checks are already included in both full and deploy suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed storm evacuation overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new storm evacuation readiness kit does not import old NexusRealtime and does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, or the frame loop.

The existing Fogline base runtime already resolves its runtime URL through `experiments/fogline-relay/src/urls.js`.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/fogline-relay/
```

No new versioned route was created.

No destructive route deletion was performed.

Reusable storm evacuation logic stayed in atomic kits.

The Canvas overlay consumes descriptor buckets and does not become route truth.

## Non-game handling

Fogline Relay is a small experience-driven web game route. It was not deleted or renamed because it already provides useful movement, scan, relay, gate, wraith, and rescue functionality.

Lesson captured: a rescue route becomes more game-like when the next domain adds evacuation logistics and storm timing pressure while keeping rendering as descriptor consumption only.

## Next safe ledge

Turn storm evacuation descriptors into a light headless objective state:

```txt
storm front ETA
radio clarity restored
battery caches secured
stretcher lanes certified
convoy rallied
flare window opened
```

Keep that future layer as a headless state kit and let renderer/DOM presentation continue consuming descriptors only.
