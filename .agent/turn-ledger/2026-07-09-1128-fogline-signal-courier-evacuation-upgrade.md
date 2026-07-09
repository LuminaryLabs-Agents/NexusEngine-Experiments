# 2026-07-09 11:28 - Fogline Relay Signal Courier Evacuation Upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

Fogline Relay already has strong first-person movement, scan pressure, rescue, clinic, lighthouse, tide, and observatory layers, but the moment-to-moment route still reads mostly as repeated scan/overlay validation. It was the best next candidate because the core route is a small experience-driven web game, the last upgraded route was Cavalry, and Fogline had a visible old `nexus-realtime-page-loader` route-shell import that could be removed while adding a new NexusEngine CDN-backed objective layer.

## Last upgraded experiment

Latest prior completed upgrade from the current commit ledger: `apps/the-cavalry-of-rome/` frontier beacon chain (`549b5609a4d2f52d87eff0502270c7c76957aff4`, `Log Cavalry frontier beacon chain upgrade`).

This run intentionally chose `experiments/fogline-relay/` instead.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | HTML scene host with puzzle tokens, route exits, time capsule courier, and bell archive evacuation. | 3-6 min | scene navigation, route unlocks, token checks, evacuation descriptors | No old runtime observed in current gallery route metadata | Yes, descriptor entries |
| `experiments/vr-platformer-board/` | Board-scale platformer with skyline medevac overlay. | 2-4 min | left/right movement, jumping, coins, hazards, medevac objectives | No old runtime observed | Yes, skyline medevac entry |
| `experiments/infinite-radial-terrain/` | Camera-relative radial terrain tessellation with many route-planning overlays. | 4-8 min | WASD flight, origin snapping, terrain LOD, shelter planning | No old runtime observed in changed route shell | Yes, readiness entries |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology, creek, visual target, and soil mycelium descriptors. | 3-6 min | free camera/scene inspection, procedural vegetation descriptors | No old runtime observed | Yes, restoration entry |
| `experiments/tiny-diffusion-lab/` | Browser tiny diffusion training/sampling workshop with readiness overlays. | 5-12 min | prepare, train, generate, checkpoint, curation | No old runtime observed | Yes, lab entries and Nexus diffusion module |
| `experiments/living-agent-lab/` | Market-agent lab with civic festival mediation descriptors. | 4-7 min | inspect state, agent/fallback choices, mediation readiness | No old runtime observed | Yes, civic festival entry |
| `experiments/fogline-relay/` | First-person fog survey/rescue loop. | 4-8 min | WASD movement, mouse look, scan, timed pressure, rescue overlays | Yes before this run: route shell loaded `nexus-realtime-page-loader`; removed in this run | Yes, new signal courier entry and existing readiness entries |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with build, cargo, storm, hospital, desalination, and signal mast readiness. | 5-9 min | scan, harvest, build, pressure gates, signal descriptors | No old runtime observed in current shell | Yes, storm/desalination entries |
| `apps/the-cavalry-of-rome/` | Painterly tactical Roman campaign map with armies and logistics layers. | 3-7 min | pan map, hover regions, cinematic dives, strategic readiness | No old runtime observed in current shell | Yes, campaign readiness entries |
| `games/signal-bastion/` | Tower defense with field hospital and supply convoy descriptors. | 5-10 min | tower placement, waves, cards, range rings, logistics | No old runtime observed | Yes, supply convoy entry |
| `games/stonewake-depths/` | Flooded cavern rescue game with silt archive drainage. | 5-9 min | block carry, valves, rune gates, survivor pings, drainage | No old runtime observed | Yes, silt archive entry |
| `experiments/next-ledge/` | Grapple climb validation with rescue/weather/drone relay overlays. | 2-5 min | grapple, action input, ledges, swing pressure | No old runtime observed | Yes, drone/weather entries |
| `experiments/sora-the-infinite/` | Route-preview gateway into The Open Above with sky rescue and orchard overlays. | 2-5 min | route priming, launch rehearsal, microflight challenge descriptors | No old runtime observed | Yes, sky/orchard entries |
| `experiments/zombie-orchard/` | Survival slice with horde pressure, pickups, orchard rescue readiness. | 4-8 min | rounds, pickups, weapons, barricade/rescue descriptors | No old runtime observed | Yes, rescue readiness entries |
| `games/rogue-lite-hellscape-siege/` | Harvest/build/wave-defense route with ember well purification. | 6-12 min | action movement, harvesting, building, waves, water recovery | No old runtime observed | Yes, ember well entry |
| `experiments/onnx-agent-lab/` | ONNX/fallback workshop with signal calibration route. | 4-8 min | model handshake, fallback rail, tool bench, scene-open gate | No old runtime observed | Yes, signal calibration entry |

## Domain ASCII tree

```txt
fogline-signal-courier-evacuation-readiness-domain
├─ courier-routing-domain
│  └─ semaphore-post-domain
│     ├─ lamp-shutter-domain
│     │  └─ fogline-semaphore-lamp-shutter-kit
│     └─ message-ribbon-domain
│        └─ fogline-message-ribbon-spool-kit
├─ evacuation-corridor-domain
│  ├─ chalk-arrow-domain
│  │  └─ fogline-chalk-arrow-marker-kit
│  └─ stretcher-run-domain
│     └─ stretcher-cache-domain
│        └─ fogline-stretcher-cache-kit
├─ handoff-ledger-domain
│  ├─ safehouse-token-domain
│  │  └─ fogline-safehouse-token-kit
│  └─ dawn-courier-ledger-domain
│     └─ fogline-dawn-courier-ledger-kit
└─ renderer-handoff
   └─ fogline-signal-courier-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js`:

- `createFoglineSemaphoreLampShutterKit()`
- `createFoglineMessageRibbonSpoolKit()`
- `createFoglineChalkArrowMarkerKit()`
- `createFoglineStretcherCacheKit()`
- `createFoglineSafehouseTokenKit()`
- `createFoglineDawnCourierLedgerKit()`
- `createFoglineSignalCourierEvacuationRendererHandoffKit()`
- `createFoglineSignalCourierEvacuationReadinessDomainKit()`

Added `experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-entry.js`:

- Imports NexusEngine main CDN.
- Installs `GameHost.getSignalCourierEvacuationReadiness()`.
- Installs `GameHost.getFoglineSignalCourierEvacuationReadiness()`.
- Installs `GameHost.getSignalCourierEvacuationReadinessTree()`.
- Composes `GameHost.getRendererHandoff()` instead of replacing previous handoffs.
- Draws a presentation-only overlay from descriptors.

## Files changed

- `experiments/fogline-relay/index.html`
- `experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js`
- `experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-entry.js`
- `tests/fogline-signal-courier-evacuation-readiness-kits-smoke.mjs`
- `tests/fogline-signal-courier-evacuation-cdn-state-input-smoke.mjs`
- `experiments/_shared/nexus-gallery-data.js`
- `.agent/turn-ledger/2026-07-09-1128-fogline-signal-courier-evacuation-upgrade.md`

## Tests added

- `tests/fogline-signal-courier-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families.
  - Validates readiness bounds, pressure bounds, mission-state enum, descriptor counts, serializability, and renderer/frame-loop exclusion.

- `tests/fogline-signal-courier-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, entry script, NexusEngine main CDN import, removed old route-shell `nexus-realtime-page-loader`, `NexusRealtime@` absence in changed entry, kit isolation, descriptor population, and state/input stability.

## Validation results

Passed in scratch workspace:

```txt
node --check experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js
node --check experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-entry.js
node --check tests/fogline-signal-courier-evacuation-readiness-kits-smoke.mjs
node --check tests/fogline-signal-courier-evacuation-cdn-state-input-smoke.mjs
node tests/fogline-signal-courier-evacuation-readiness-kits-smoke.mjs
node tests/fogline-signal-courier-evacuation-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Fogline signal courier evacuation readiness kits smoke passed 10 intake cases.
Fogline signal courier evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full clone because this automation shell could not resolve `github.com`. The connector write path was used for repository updates.

## NexusRealtime import audit

- Root `.agent/README.md` still references older NexusRealtime repo names as historical durable memory.
- `experiments/fogline-relay/index.html` previously imported `../_shared/nexus-realtime-page-loader.js` from an inline module.
- This run removed that old route-shell loader from the changed Fogline page.
- The new changed entry imports the required NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new changed kit file does not import NexusRealtime, NexusEngine, DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, storage, or frame-loop APIs.

## Cleanup pass

- Kept existing Fogline route functionality and overlays intact.
- Composed the new renderer handoff after the existing handoff instead of deleting or replacing prior descriptor families.
- Removed the stale route-shell NexusRealtime loader import from the changed route.
- Updated gallery metadata so the route card describes the new objective layer.
- No destructive files were removed.

## Non-game handling

Fogline Relay is a small experience-driven web game, so no delete/refactor/rename action was required.

## Next safe ledge

Add one shared Fogline descriptor renderer that can consume all readiness families through a single bucket schema, then move the per-entry overlay drawing into a reusable presentation adapter while keeping domain kits renderer-neutral.
