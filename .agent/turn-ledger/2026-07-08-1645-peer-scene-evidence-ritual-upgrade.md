# Peer Scene Transition evidence ritual readiness upgrade

## Summary

Upgraded `experiments/peer-scene-transition/` with a renderer-neutral evidence ritual readiness domain. The latest completed upgrade before this run was `experiments/high-fidelity-meadow/`, so this run selected a different canonical route and kept the work on the existing Peer Scene Transition route.

## Chosen experiment

```txt
experiments/peer-scene-transition/
```

## Why it was chosen

Peer Scene Transition was still a short narrative route with scene navigation, inventory gates, atmospheric handoff, chronicle, consequence, decision readability, oracle readability, and clue-pressure readiness.

It still lacked a concrete proof-assembly loop that made the route feel like a playable investigation rather than only a scene transition demo. The new pass adds witness statement webs, contradiction threads, evidence board pins, ritual sequence runes, doubt pressure dials, and verdict door readiness.

## Last upgraded experiment

```txt
experiments/high-fidelity-meadow/
```

Latest prior completed commit context:

```txt
4e42e333c2a42a60fee02b5d6b3b6fb71033af70
Log meadow harvest festival upgrade
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
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue | No changed runtime import found in manifest audit | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration and beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival and defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
peer-scene-evidence-ritual-readiness-domain
├─ testimony-domain
│  ├─ witness-statement-domain
│  │  └─ scene-witness-statement-web-kit
│  └─ contradiction-thread-domain
│     └─ scene-contradiction-thread-kit
├─ proof-assembly-domain
│  ├─ evidence-board-domain
│  │  └─ scene-evidence-board-pin-kit
│  └─ ritual-sequence-domain
│     └─ scene-ritual-sequence-rune-kit
├─ verdict-pressure-domain
│  ├─ doubt-pressure-domain
│  │  └─ scene-doubt-pressure-dial-kit
│  └─ verdict-door-domain
│     └─ scene-verdict-door-readiness-kit
└─ renderer-handoff
   └─ scene-evidence-ritual-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
scene-witness-statement-web-kit
scene-contradiction-thread-kit
scene-evidence-board-pin-kit
scene-ritual-sequence-rune-kit
scene-doubt-pressure-dial-kit
scene-verdict-door-readiness-kit
scene-evidence-ritual-renderer-handoff-kit
peer-scene-evidence-ritual-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getEvidenceRitualReadinessDomain()
GameHost.getEvidenceRitualReadiness()
GameHost.getPeerSceneEvidenceRitualReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/_kits/peer-scene-transition/peer-scene-evidence-ritual-readiness-kits.js
experiments/peer-scene-transition/shared/scene-evidence-ritual-readiness-entry.js
experiments/peer-scene-transition/shared/scene-evidence-ritual-readiness.css
experiments/peer-scene-transition/index.html
experiments/peer-scene-transition/camp.html
experiments/peer-scene-transition/crossroads.html
experiments/peer-scene-transition/forest.html
experiments/peer-scene-transition/bridge.html
tests/peer-scene-evidence-ritual-readiness-kits-smoke.mjs
tests/peer-scene-evidence-ritual-cdn-state-input-smoke.mjs
tests/peer-scene-transition-playwright-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1645-peer-scene-evidence-ritual-upgrade.md
```

## Tests added

```txt
tests/peer-scene-evidence-ritual-readiness-kits-smoke.mjs
tests/peer-scene-evidence-ritual-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
witness statement web descriptors
contradiction thread descriptors
evidence board pin descriptors
ritual sequence rune descriptors
doubt pressure dial descriptors
verdict door readiness descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed files
route cache-busting on camp/crossroads/forest/bridge
GameHost exposure
renderer handoff composition
manifest registration
Playwright smoke routing
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are imported by `tests/peer-scene-transition-playwright-smoke.mjs`, which is already included in both full and deploy suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed evidence ritual overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new evidence ritual readiness kit does not import old NexusRealtime and does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, or the frame loop.

The existing Peer Scene browser host already imports NexusEngine main CDN.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/peer-scene-transition/
```

No new versioned route was created.

No destructive route deletion was performed.

Reusable evidence ritual logic stayed in atomic kits.

The DOM/CSS overlay consumes descriptor buckets and does not become route truth.

## Non-game handling

Peer Scene Transition is a small experience-driven web narrative route rather than a traditional game. It was not deleted or renamed because it already provides useful scene host, inventory, gate, and transition functionality.

Lesson captured: a scene-transition route becomes more game-like when the new domain adds evidence assembly and verdict pressure without moving state truth into DOM or renderer code.

## Next safe ledge

Turn evidence ritual descriptors into light headless state:

```txt
witnesses confirmed
contradictions resolved
evidence pins connected
ritual runes sequenced
doubt reduced
verdict door opened
```

Keep that future layer as a headless state kit and let renderer/DOM presentation continue consuming descriptors only.
