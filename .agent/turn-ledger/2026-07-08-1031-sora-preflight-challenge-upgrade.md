# 2026-07-08 10:31 ET — Sora Preflight Challenge Readiness Upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` with a new preflight challenge readiness layer. The route now exposes gust-sync timing, velocity tethering, altitude contracts, cloud corridor locks, route tempo scores, and landing oath seals as renderer-neutral descriptors.

## Chosen experiment

```txt
experiments/sora-the-infinite/
```

## Why it was chosen

The latest completed upgrade before this run was `experiments/zombie-orchard/`, so this run selected a different experiment. Sora remains one of the smallest and least-variable routes in the repository: it is a launch gateway into The Open Above rather than a full-length game. The prior Sora passes made the route readable, but the gateway still did not have a clear skill/check layer before launch. This pass adds a small preflight challenge loop without moving renderer, DOM, browser input, asset loading, or frame-loop ownership into reusable kits.

## Last upgraded experiment

```txt
experiments/zombie-orchard/
```

Latest prior ledger found during this cycle:

```txt
.agent/turn-ledger/2026-07-08-1016-zombie-orchard-horde-pathing-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic | 1-3 min | WASD, spring arm camera, debug rays, arena/locomotion/camera descriptors | No changed runtime import | Yes |
| `experiments/peer-scene-transition/` | Scene-puzzle transition prototype | 3-6 min | scene routing, lantern/forest/bridge/shrine puzzles, oracle descriptors | No changed runtime import | Yes |
| `apps/the-cavalry-of-rome/` | Strategy campaign map | 5-10 min | territory movement, orders, logistics, route overlays | No changed overlay import | Yes |
| `experiments/vr-platformer-board/` | Small board platformer | 1-3 min | move, jump, coins, hazards, exit, objective descriptors | No changed runtime import | Yes |
| `experiments/next-ledge/` | Grapple/swing micro-experience | 2-4 min | grapple, swing, release timing, cargo extraction | No changed wrapper import | Yes |
| `experiments/infinite-radial-terrain/` | Procedural terrain route/survey sandbox | 2-5 min | flight camera, terrain rings, wayfinding, survey bands | No changed entry import | Yes |
| `experiments/high-fidelity-meadow/` | Meadow visual/ecology scene | 2-4 min | walking/orbit scene, ecology, pasture route overlays | No changed runtime import | Yes |
| `experiments/fogline-relay/` | Fog relay survival/navigation prototype | 3-6 min | first-person movement, scan, relay repair, wraith pressure | No changed session import | Yes |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer objective chain | 4-8 min | movement, harvest, build mast, pressure wave, expedition readiness | No changed runtime import | Yes |
| `experiments/sora-the-infinite/` | Launch gateway into The Open Above | 1-2 min | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge | No changed entry import | Yes |
| `experiments/zombie-orchard/` | Survival orchard wave game | 3-6 min | move, collect, waves, horde pathing, survival/foraging overlays | No changed overlay import | Yes |
| `experiments/tropical-island-scene/` | Tropical orbit/exploration scene | 2-4 min | drag orbit, lagoon readability, weather/shelter overlays | Legacy local ProtoKit import map remains for island/water stack | Yes for changed overlays |
| `games/signal-bastion/` | Tower defense game | 8-15 min | placement, towers, waves, boss focus, salvage windows | No changed boot import | Yes |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite defense/siege game | 8-15 min | portals, harvesting, inventory, build, core defense, extraction | No changed runtime import | Yes |

## Domain ASCII tree

```txt
sora-preflight-challenge-readiness-domain
├─ cadence-control-domain
│  ├─ gust-sync-domain
│  │  └─ sora-gust-sync-ring-kit
│  └─ velocity-tether-domain
│     └─ sora-velocity-tether-bead-kit
├─ route-contract-domain
│  ├─ altitude-contract-domain
│  │  └─ sora-altitude-contract-band-kit
│  └─ cloud-corridor-domain
│     └─ sora-cloud-corridor-lock-kit
├─ commitment-score-domain
│  ├─ route-tempo-domain
│  │  └─ sora-route-tempo-score-kit
│  └─ landing-oath-domain
│     └─ sora-landing-oath-seal-kit
└─ renderer-handoff
   └─ sora-preflight-challenge-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
sora-gust-sync-ring-kit
sora-velocity-tether-bead-kit
sora-altitude-contract-band-kit
sora-cloud-corridor-lock-kit
sora-route-tempo-score-kit
sora-landing-oath-seal-kit
sora-preflight-challenge-renderer-handoff-kit
sora-preflight-challenge-readiness-domain-kit
```

The kits accept plain route/readiness/input snapshots and prior Sora domain outputs. They produce serializable descriptor objects only.

## Files changed

```txt
experiments/_kits/sora-the-infinite/sora-preflight-challenge-readiness-domain-kits.js
experiments/sora-the-infinite/sora-preflight-challenge-entry.js
experiments/sora-the-infinite/sora-preflight-challenge-style.css
experiments/sora-the-infinite/index.html
tests/sora-preflight-challenge-readiness-domain-kits-smoke.mjs
tests/sora-preflight-challenge-readiness-cdn-state-input-smoke.mjs
tests/sora-flightplan-readability-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1031-sora-preflight-challenge-upgrade.md
```

## Tests added

```txt
tests/sora-preflight-challenge-readiness-domain-kits-smoke.mjs
tests/sora-preflight-challenge-readiness-cdn-state-input-smoke.mjs
```

Both are routed through the existing Sora flightplan CDN/state/input smoke, which is already included in full and deploy validation.

## Validation results

Validation added by inspection and wired to the existing Sora check path:

```bash
npm run check
npm run check:deploy
```

Expected smoke coverage:

- 10 Sora preflight challenge domain kit intake cases.
- 10 Sora CDN/state/input intake cases.
- NexusEngine main CDN string present in the changed entry.
- Old `LuminaryLabs-Dev/NexusRealtime` runtime import absent from the changed entry.
- Route shell cache-busts the preflight challenge pass.
- `GameHost.getPreflightChallengeReadiness()` exposed.
- `GameHost.getSoraPreflightChallengeReadiness()` exposed.
- `GameHost.getRendererHandoff()` composed with `preflightChallengeReadiness` descriptors.
- Renderer ownership boundary remains descriptor-only.

Runtime shell execution was not available in this connector-only run, so the result is logged as wired/static validation rather than a local `npm run check` completion.

## NexusRealtime import audit

Changed Sora files use NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

No changed Sora preflight challenge file imports the old `LuminaryLabs-Dev/NexusRealtime` runtime.

## Cleanup pass

- Kept reusable kit logic out of DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Added the DOM/CSS rendering surface only in the route-level overlay entry.
- Reused the existing Sora `GameHost` rather than replacing the launch gateway.
- Preserved old route/query/hash continuity behavior.
- Updated the canonical route manifest instead of adding a new route folder.

## Non-game handling

Sora is not a full small web game; it is a launch gateway / compatibility route. It was not deleted or renamed because it preserves the historical `sora-the-infinite` alias and handoff into The Open Above. The lesson is that compatibility routes can still become useful if they expose clear, testable descriptor handoffs instead of instantly redirecting.

## Next safe ledge

Give Sora one more interactive affordance only if needed: a minimal launch score latch that requires a short sustained gust-sync window before the launch link turns fully ready. Keep the latch in a domain kit and keep the DOM button as a presentation consumer.
