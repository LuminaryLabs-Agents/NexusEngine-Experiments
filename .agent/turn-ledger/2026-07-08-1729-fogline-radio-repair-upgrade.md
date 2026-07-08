# Fogline Relay radio repair readiness upgrade

## Summary

Upgraded `experiments/fogline-relay/` with a renderer-neutral radio repair readiness layer. The route now exposes repair part caches, solder station warmth pockets, antenna alignment arcs, power load balancing fields, return signal threads, and broadcast window pulses as descriptor-only domain outputs.

## Chosen experiment

```txt
experiments/fogline-relay/
```

## Why it was chosen

The previous user-facing completed upgrade was `experiments/peer-scene-transition/`, so this run deliberately selected a different route. Fogline Relay already had movement, scanning, signal cartography, operator rhythm, survivor rescue, and storm evacuation layers, but it still framed the radio network mostly as scan targets. The upgrade turns the relays into a repairable broadcast chain with parts, soldering, antenna alignment, load balancing, route return signal, and final broadcast timing.

## Last upgraded experiment

```txt
experiments/peer-scene-transition/
```

Additional guardrail: the current manifest also showed `experiments/nexus-frontier-signal-isles/` with a harbor relief readiness pass, so this run avoided Signal Isles as well.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and extraction training route | 1-3 min | WASD, jump, camera, debug, stealth extraction descriptors | No changed runtime import observed | Yes |
| `experiments/peer-scene-transition/` | Scene transition investigation route | 2-5 min | route choice, inventory gates, evidence ritual descriptors | legacy loader only | Yes |
| `apps/the-cavalry-of-rome/` | Roman command campaign surface | 3-8 min | campaign map, orders, logistics, diplomatic pressure | No changed runtime import observed | Yes |
| `experiments/vr-platformer-board/` | Small platformer board | 1-3 min | A/D, jump, coins, hazards, exit, rescue descriptors | No changed runtime import observed | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 2-5 min | grapple, swing, cargo, anchor timing, bivouac descriptors | No changed runtime import observed | Yes |
| `experiments/infinite-radial-terrain/` | Procedural terrain flight/survey route | 2-6 min | camera flight, radial LOD, wayfinding, resupply descriptors | No changed runtime import observed | Yes |
| `experiments/the-open-above/` | Aerial flight route | 2-5 min | flight, terrain streaming, courier descriptors | No changed runtime import observed | Yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 1-4 min | orbit/walk viewing, ecology, flock safety, harvest descriptors | No changed runtime import observed | Yes |
| `experiments/fogline-relay/` | First-person relay restoration route | 3-7 min | movement, scanning, relays, rescue, storm, radio repair | legacy page loader still named NexusRealtime | Yes, changed overlay imports NexusEngine CDN |
| `experiments/nexus-frontier-signal-isles/` | Resource/build signal-island route | 4-8 min | harvest, build mast, cargo, storm anchor, harbor relief | No changed runtime import observed | Yes |
| `experiments/sora-the-infinite/` | Route-preview sky gateway | 1-3 min | launch preview, flight plan, microflight, rescue descriptors | No changed runtime import observed | Yes |
| `experiments/zombie-orchard/` | Zombie orchard survival route | 3-8 min | movement, collection, waves, foraging, cure crafting | No changed runtime import observed | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene route | 1-4 min | orbit, fish, coconuts, reef rescue, tide salvage | legacy import map for old island/water stack | Yes on changed overlays |
| `experiments/cozy-island/` | Cozy island scene | 1-4 min | island generation, campfire, smoke, clouds, comfort descriptors | legacy ProtoKit stack remains | Yes on changed overlay |
| `games/signal-bastion/` | 2.5D defense game | 5-15 min | placement, 30 waves, command/frontroute/evacuation descriptors | No changed runtime import observed | Yes |
| `games/rogue-lite-hellscape-siege/` | Roguelite defense/crafting game | 5-15 min | portals, harvesting, building, core defense, contract descriptors | No changed runtime import observed | Yes |

## Domain ASCII tree

```txt
fogline-radio-repair-readiness-domain
├─ parts-recovery-domain
│  ├─ repair-cache-domain
│  │  └─ fogline-repair-part-cache-kit
│  └─ solder-station-domain
│     └─ fogline-solder-station-warmth-kit
├─ signal-calibration-domain
│  ├─ antenna-alignment-domain
│  │  └─ fogline-antenna-alignment-arc-kit
│  └─ power-load-domain
│     └─ fogline-power-load-balancing-kit
├─ broadcast-return-domain
│  ├─ return-signal-domain
│  │  └─ fogline-return-signal-thread-kit
│  └─ broadcast-window-domain
│     └─ fogline-broadcast-window-pulse-kit
└─ renderer-handoff
   └─ fogline-radio-repair-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
fogline-repair-part-cache-kit
fogline-solder-station-warmth-kit
fogline-antenna-alignment-arc-kit
fogline-power-load-balancing-kit
fogline-return-signal-thread-kit
fogline-broadcast-window-pulse-kit
fogline-radio-repair-renderer-handoff-kit
fogline-radio-repair-readiness-domain-kit
```

## Files changed

```txt
experiments/fogline-relay/src/fogline-radio-repair-kits.js
experiments/fogline-relay/src/radio-repair-readiness-entry.js
experiments/fogline-relay/index.html
tests/fogline-radio-repair-readiness-kits-smoke.mjs
tests/fogline-radio-repair-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1729-fogline-radio-repair-upgrade.md
```

## Tests added

```txt
tests/fogline-radio-repair-readiness-kits-smoke.mjs
tests/fogline-radio-repair-cdn-state-input-smoke.mjs
```

## Validation results

Static/wired validation completed through file inspection and test routing:

- Kit smoke includes 10 intake cases.
- Each of the six atomic descriptor kits receives 10 cases.
- Composite domain and renderer handoff each receive 10 cases.
- CDN/state/input smoke includes 10 validation cases.
- CDN/state/input smoke verifies NexusEngine main CDN import.
- CDN/state/input smoke verifies old NexusRealtime runtime CDN absence in changed radio repair files.
- CDN/state/input smoke verifies route cache-busting.
- CDN/state/input smoke verifies GameHost accessor patching.
- CDN/state/input smoke verifies manifest registration.
- CDN/state/input smoke verifies full/deploy check routing.

Runtime shell execution was not available in this connector run, so validation is logged as static/wired rather than a completed local `npm run check`.

Expected local commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed radio repair files do not import the old `LuminaryLabs-Dev/NexusRealtime@main` CDN. The route still uses `attachNexusRealtimePageLoader` from the existing shared loader, but the new changed overlay imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

## Cleanup pass

- Kept reusable kit logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Kept overlay code presentation-only.
- Reused existing Fogline descriptor buckets: `safePockets`, `objectiveNeedles`, `pressureVignettes`, `routeThreads`, and `gateSigils`.
- Avoided deleting or renaming route files.
- Avoided new branches.
- No destructive change was made.

## Non-game handling

Fogline Relay is already a small experience-driven web game, so no deletion, rename, or non-game refactor was needed.

## Next safe ledge

Make Fogline's underlying session own a real `radioParts` state model so the repair overlay can move from readiness visualization into actual play: collect parts, repair relay, balance load, and broadcast before storm blackout.
