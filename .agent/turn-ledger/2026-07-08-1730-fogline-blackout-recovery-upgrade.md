# Fogline Relay blackout recovery readiness upgrade

## Summary

Upgraded `experiments/fogline-relay/` with a renderer-neutral blackout recovery readiness layer. The route now exposes fuse junctions, relay reboot coils, lantern chains, siren silence perimeters, generator fuel caches, and dawn switch windows as descriptor-only domain outputs.

## Chosen experiment

```txt
experiments/fogline-relay/
```

## Why it was chosen

The latest completed repository guardrail before this pass showed `experiments/nexus-frontier-signal-isles/` as the most recent logged upgrade, so this run avoided Signal Isles. During this run, a Fogline radio repair pass also landed on main; this pass preserved that work and added a separate blackout recovery subdomain rather than replacing or reverting it. Fogline Relay remains a compact experience-driven web game with a strong base loop, but its relay network still benefits from a concrete power-failure objective that turns scan targets into repairable infrastructure under pressure.

## Last upgraded experiment

Latest observed completed changelog before final logging:

```txt
experiments/fogline-relay/
```

Latest observed completed non-Fogline guardrail before this run began:

```txt
experiments/nexus-frontier-signal-isles/
```

This ledger is explicit because radio repair work landed concurrently while blackout recovery was being integrated. No radio repair files were removed or downgraded.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and extraction training route | 1-3 min | WASD, jump, camera, debug, navigation, stealth extraction | No changed runtime import observed | Yes |
| `experiments/peer-scene-transition/` | Scene transition investigation route | 2-5 min | route choice, inventory gates, evidence ritual, verdict pressure | legacy loader only | Yes |
| `apps/the-cavalry-of-rome/` | Roman command campaign surface | 3-8 min | campaign map, world actions, orders, logistics, diplomacy | No changed runtime import observed | Yes |
| `experiments/vr-platformer-board/` | Small platformer board | 1-3 min | A/D, jump, coins, hazards, exit, rescue descriptors | No changed runtime import observed | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 2-5 min | grapple, swing, cargo, anchor timing, bivouac descriptors | No changed runtime import observed | Yes |
| `experiments/infinite-radial-terrain/` | Procedural terrain flight/survey route | 2-6 min | camera flight, radial LOD, wayfinding, survey, resupply | No changed runtime import observed | Yes |
| `experiments/the-open-above/` | Aerial flight route | 2-5 min | flight, terrain streaming, route readability, courier drops | No changed runtime import observed | Yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 1-4 min | grass, sheep, ecology, pasture, harvest festival | No changed runtime import observed | Yes |
| `experiments/fogline-relay/` | First-person relay restoration route | 3-7 min | movement, scanning, relays, rescue, storm, radio repair, blackout recovery | legacy page loader still named NexusRealtime | Yes, changed overlays import NexusEngine CDN |
| `experiments/nexus-frontier-signal-isles/` | Resource/build signal-island route | 4-8 min | harvest, build mast, cargo, storm anchor, harbor relief | No changed runtime import observed | Yes |
| `experiments/sora-the-infinite/` | Route-preview sky gateway | 1-3 min | launch preview, flight plan, microflight, rescue descriptors | No changed runtime import observed | Yes |
| `experiments/zombie-orchard/` | Zombie orchard survival route | 3-8 min | movement, collection, waves, foraging, cure crafting | No changed runtime import observed | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene route | 1-4 min | orbit, fish, coconuts, reef rescue, tide salvage | legacy import map for old island/water stack | Yes on changed overlays |
| `experiments/cozy-island/` | Cozy island scene | 1-4 min | island generation, campfire, smoke, clouds, comfort descriptors | legacy ProtoKit stack remains | Yes on changed overlay |
| `games/signal-bastion/` | 2.5D defense game | 5-15 min | placement, 30 waves, command, frontline, evacuation | No changed runtime import observed | Yes |
| `games/rogue-lite-hellscape-siege/` | Roguelite defense/crafting game | 5-15 min | portals, harvesting, building, core defense, contract descriptors | No changed runtime import observed | Yes |

## Domain ASCII tree

```txt
fogline-blackout-recovery-readiness-domain
├─ power-restoration-domain
│  ├─ fuse-junction-domain
│  │  └─ fogline-fuse-junction-kit
│  └─ relay-reboot-domain
│     └─ fogline-relay-reboot-coil-kit
├─ civilian-guidance-domain
│  ├─ lantern-chain-domain
│  │  └─ fogline-lantern-chain-kit
│  └─ siren-silence-domain
│     └─ fogline-siren-silence-perimeter-kit
├─ extraction-reserve-domain
│  ├─ generator-fuel-domain
│  │  └─ fogline-generator-fuel-cache-kit
│  └─ dawn-switch-domain
│     └─ fogline-dawn-switch-window-kit
└─ renderer-handoff
   └─ fogline-blackout-recovery-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
fogline-fuse-junction-kit
fogline-relay-reboot-coil-kit
fogline-lantern-chain-kit
fogline-siren-silence-perimeter-kit
fogline-generator-fuel-cache-kit
fogline-dawn-switch-window-kit
fogline-blackout-recovery-renderer-handoff-kit
fogline-blackout-recovery-readiness-domain-kit
```

## Files changed

```txt
experiments/fogline-relay/src/fogline-blackout-recovery-kits.js
experiments/fogline-relay/src/blackout-recovery-readiness-entry.js
experiments/fogline-relay/index.html
tests/fogline-blackout-recovery-readiness-kits-smoke.mjs
tests/fogline-blackout-recovery-cdn-state-input-smoke.mjs
tests/fogline-relay-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1730-fogline-blackout-recovery-upgrade.md
```

## Tests added

```txt
tests/fogline-blackout-recovery-readiness-kits-smoke.mjs
tests/fogline-blackout-recovery-cdn-state-input-smoke.mjs
```

The tests are also routed through the existing Fogline Playwright state/input smoke by importing them at the top of `tests/fogline-relay-playwright-state-input-smoke.mjs`.

## Validation results

Static/wired validation completed through file inspection and routed smoke tests:

- Kit smoke includes 10 intake cases.
- Each of the six atomic descriptor kits receives 10 cases.
- Composite domain and renderer handoff receive 10 cases.
- CDN/state/input smoke includes 10 simulated state/input cases.
- CDN/state/input smoke verifies NexusEngine main CDN import.
- CDN/state/input smoke verifies old NexusRealtime runtime CDN absence in the changed blackout entry.
- CDN/state/input smoke verifies route cache-busting: `fogline-blackout-recovery-readiness-1`.
- CDN/state/input smoke verifies GameHost accessor patching.
- CDN/state/input smoke verifies manifest registration.
- Fogline Playwright smoke routes the new kit and CDN/state checks.

Runtime shell execution was not available in this connector run, so validation is logged as static/wired rather than a completed local `npm run check`.

Expected local commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed blackout files do not import the old `LuminaryLabs-Dev/NexusRealtime@main` CDN. The route still uses `attachNexusRealtimePageLoader` from the existing shared loader, but the changed blackout overlay imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

## Cleanup pass

- Kept all reusable blackout recovery calculations in `fogline-blackout-recovery-kits.js`.
- Kept DOM and Canvas presentation in `blackout-recovery-readiness-entry.js` only.
- Kept reusable kits free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Preserved the concurrent radio repair overlay and its route loading.
- Updated only the canonical base route.
- Did not create a new branch.
- Did not delete or rename any route.
- No useful functionality was removed.

## Non-game handling

Fogline Relay is a small experience-driven web game, not a non-game utility. No deletion, rename, or non-game refactor was needed.

## Next safe ledge

Move blackout recovery from descriptor readiness into real session state:

```txt
fuse repaired
relay rebooted
lantern route activated
generator cache consumed
siren muted
dawn switch opened
```

That should remain replay-testable through `GameHost.getState()` instead of becoming overlay-only state.
