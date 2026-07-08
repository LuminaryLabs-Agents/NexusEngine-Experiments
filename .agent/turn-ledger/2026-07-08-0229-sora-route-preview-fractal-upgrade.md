# Sora route preview fractal upgrade

Timestamp: 2026-07-08 02:29 America/New_York

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest upgraded route was `experiments/zombie-orchard/`, so this pass avoided it. `sora-the-infinite` was still the least variable route in the canonical set because it mostly acted as a compatibility gateway into `the-open-above`; the next meaningful improvement was to turn the gateway into a route-preview scene with wind, altitude, waypoint, and handoff packet descriptors while preserving the legacy alias.

## Last upgraded experiment

`experiments/zombie-orchard/` from the latest visible commit sequence ending in `Log Zombie Orchard survival readability upgrade`.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera diagnostic arena. | Short diagnostic loop. | WASD, spring arm camera, debug metrics. | No direct old CDN found in changed audit. | Yes, through arena-fractal wrapper. |
| `experiments/peer-scene-transition/` | HTML scene puzzle/transition route. | Short scene chain. | Scene gates, clues, inventory/readability descriptors. | No direct old CDN found in changed audit. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign command map experiment. | Medium campaign slice. | World actions, march/supply/cohesion/morale descriptors. | Legacy compatibility surface still noted outside active handoff. | Yes, in campaign-fractal handoff. |
| `experiments/vr-platformer-board/` | XR/stereo platformer board route. | Short arcade board. | A/D movement, jumping, board comfort/visual descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/next-ledge/` | Cinematic grapple-climb route. | Short ascent. | Grapple, swing, route progress, cargo/pressure descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/infinite-radial-terrain/` | Infinite/radial terrain visualization route. | Open-ended exploration. | Camera flight, radial terrain rings, biome/hydrology descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/high-fidelity-meadow/` | Meadow scene/visual fidelity route. | Ambient exploration. | Grass, flowers, sheep, depth/pattern descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/fogline-relay/` | First-person fog-forest relay route. | Short objective route. | Move, look, scan relays, avoid wraiths, open gate. | No old runtime CDN in `src/urls.js`. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase. | Medium objective sandbox. | Harvest, build mast, pressure wave, resource/objective descriptors. | No direct old CDN found in changed audit. | Yes. |
| `experiments/sora-the-infinite/` | Authored compatibility gateway into The Open Above. | Short launch handoff. | Alias preservation, launch vector, input coaching, route preview, wind/altitude/waypoint handoff descriptors. | No old runtime CDN in changed runtime. | Yes: `NexusEngine@main/src/index.js`. |
| `experiments/zombie-orchard/` | Survival orchard route. | Short wave survival. | Move, collect apples, scavenge gear, fight monsters, survive/advance rounds. | No old runtime CDN in changed audit. | Yes; last upgraded and avoided. |
| `experiments/tropical-island-scene/` | WebGL tropical island/lagoons route. | Ambient scene. | Orbit camera, water/reef/current/wake descriptors. | Old local import-map compatibility preserved for island/water stack. | Yes. |
| `games/signal-bastion/` | Strategic tower-defense route. | 30-wave defense loop. | Build towers, enemies, economy, command/readability descriptors. | No old runtime CDN in changed audit. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action-defense/extraction route. | Short-to-medium wave survival. | Realm portals, harvesting, inventory, build, core defense. | No direct old CDN found in changed audit. | Yes. |

## Domain ASCII tree

```txt
sora-route-preview-domain
├─ flight-readability
│  ├─ wind-shear-forecast-domain
│  │  └─ sora-wind-shear-forecast-kit
│  └─ altitude-envelope-domain
│     └─ sora-altitude-envelope-kit
├─ route-memory
│  ├─ waypoint-ribbon-domain
│  │  └─ sora-waypoint-ribbon-kit
│  └─ handoff-packet-domain
│     └─ sora-handoff-packet-kit
└─ renderer-handoff
   └─ sora-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js`:

- `SORA_ROUTE_PREVIEW_DOMAIN_TREE`
- `sora-wind-shear-forecast-kit`
- `sora-waypoint-ribbon-kit`
- `sora-handoff-packet-kit`
- `sora-altitude-envelope-kit`

Changed:

- `sora-renderer-handoff-kit` now carries launch vector, sky memory, wind shear, waypoint, handoff packet, altitude, continuity, and coaching descriptor buckets.
- `sora-compatibility-domain-kit` now composes route-preview descriptors and exposes `domainTree` plus expanded `snapshot().preview` counts.
- `sora-compatibility-gateway.js` now renders wind cells, waypoint nodes, altitude bands, and handoff packet markers.
- `GameHost` now exposes `getRoutePreview()`.

## Files changed

- `experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js`
- `experiments/sora-the-infinite/sora-compatibility-gateway.js`
- `experiments/sora-the-infinite/index.html`
- `experiments/sora-the-infinite/sora-compatibility-style.css`
- `tests/sora-route-preview-fractal-kits-smoke.mjs`
- `tests/sora-route-preview-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0229-sora-route-preview-fractal-upgrade.md`

## Tests added

- `tests/sora-route-preview-fractal-kits-smoke.mjs`
  - 10 intake cases.
  - Checks wind shear cells, waypoint ribbon, handoff packets, altitude envelope, renderer handoff counts, serializability, and ownership boundaries.

- `tests/sora-route-preview-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Validates NexusEngine main CDN usage, old NexusRealtime runtime CDN absence, route preview DOM hooks, `GameHost.getRoutePreview()`, descriptor styling, and renderer-handoff descriptor buckets.

## Validation results

Static connector validation completed by refetching the changed files after writing them.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/sora-the-infinite/sora-compatibility-gateway.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed Sora runtime does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime`.
- The new route-preview kits do not import NexusRealtime, NexusEngine, DOM, renderer, Three.js, WebGL, audio, assets, or frame-loop code.
- The CDN/state-input smoke checks the changed Sora runtime for NexusEngine main CDN usage and old runtime CDN absence.

## Cleanup pass

- Reusable route-preview logic stayed in descriptor kits.
- DOM, browser input, frame-loop timing, and HTML rendering stayed in the browser gateway.
- Renderer handoff is a serializable descriptor object with explicit counts.
- The legacy route was preserved instead of deleted or renamed.
- No destructive route deletion occurred.

## Non-game route handling

`sora-the-infinite` is a small compatibility/experience route rather than a full game. The proof it was trying to provide was legacy alias continuity into `the-open-above`. The lesson was that redirect-only compatibility routes are too invisible to validate, so the route now provides an authored stateful gateway and visual route-preview descriptors without removing the useful legacy handoff.

## Next safe ledge

Add a deterministic Sora launch replay fixture that records readiness buildup, bank/climb input, query/hash preservation, handoff packet readiness, and final launch href while snapshot-hashing route-preview descriptors.
