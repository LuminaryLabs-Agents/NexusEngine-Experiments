# 2026-07-08 01:30 ET — Hellscape Siege Fractal Readability Upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed upgrade was `experiments/The Cavalry of Rome/`, so this run chose a different route.

Rogue-Lite Hellscape Siege was selected because the route already had a strong survival/build loop, but most of the readability was still fused into a small canvas renderer: realm pressure, resource paths, portal risk, core defense radii, build affordability, and enemy threat lanes were not represented as reusable domain descriptors. That made it the weakest remaining candidate for a useful domain-fractal pass, even though it is tracked as a game route rather than a pure experiment route.

## Last upgraded experiment

`experiments/The Cavalry of Rome/`

Evidence used: latest commit sequence ended with the Cavalry campaign fractal pass, including `Refresh Cavalry visual static smoke for campaign fractal route`.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| third-person-follow-through | Third-person controller diagnostic arena | 1-3 min loop | WASD, orbit camera, jump/reset, debug rays | not in changed files | yes, wrapper |
| peer-scene-transition | Peer HTML scene puzzle chain | 3-6 min | route gates, inventory/clues, scene choices | no in changed files | yes |
| the-cavalry-of-rome | Roman campaign/tactical strategy scene | 5-15 min | campaign selection, territory moves, world turn, AI pressure, tactical hex mode | older legacy file still references old runtime; changed handoff imports NexusEngine | yes, handoff |
| vr-platformer-board | XR/spatial board platformer | 2-5 min | movement, jump, collectibles, comfort descriptors | no in changed files | yes |
| next-ledge | Grapple/cliff extraction prototype | 2-4 min | grapple, swing, cargo/extraction descriptors | no in changed files | yes |
| infinite-radial-terrain | Radial terrain explorer | open-ended | camera flight, LOD rings, terrain descriptors | no in changed files | yes |
| high-fidelity-meadow | Meadow simulation scene | open-ended | orbit, wind seed, grass/flower/sheep scene | no in changed files | yes |
| fogline-relay | Fog survey relay route | 4-8 min | movement, scan, relay objectives, wraith pressure | no in changed files | yes |
| nexus-frontier-signal-isles | First-person signal/resource experiment | 5-10 min | scan, harvest, build mast, pressure wave | no in changed files | yes |
| sora-the-infinite | Compatibility gateway | <1 min | launch handoff, continuity coaching | no in changed files | yes |
| zombie-orchard | Survival orchard wave route | 4-8 min | move, dodge, pickup, survival pressure | no in changed files | yes |
| tropical-island-scene | Lagoon shader scene | open-ended | orbit, fish, coconuts, water shader | no in changed files | yes |
| rogue-lite-hellscape-siege | Realm harvesting and base-defense survival route | 8-18 min | portals, harvesting, drops, inventory, structures, wave defense, core failure/reset | changed runtime does not import old NexusRealtime main CDN; route shell still uses local legacy-named loader helper | yes, changed runtime imports NexusEngine main CDN |
| signal-bastion | 2.5D defense game | 15-30 min | tower placement, waves, upgrades, range/readability surfaces | no in changed files | no change this run |

## Domain ASCII tree

```txt
hellscape-siege-fractal-domain
├─ realm-pressure
│  └─ hellscape-realm-pressure-gradient-kit
├─ material-routing
│  ├─ resource-route-web
│  │  └─ hellscape-resource-route-web-kit
│  └─ portal-risk-beacons
│     └─ hellscape-portal-risk-beacon-kit
├─ base-defense-readability
│  ├─ core-defense-radius
│  │  └─ hellscape-core-defense-radius-kit
│  ├─ build-affordance-band
│  │  └─ hellscape-build-affordance-band-kit
│  └─ wave-threat-lanes
│     └─ hellscape-wave-threat-lane-kit
└─ renderer-handoff
   └─ hellscape-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-realm-pressure-gradient-kit`
- `hellscape-resource-route-web-kit`
- `hellscape-core-defense-radius-kit`
- `hellscape-portal-risk-beacon-kit`
- `hellscape-build-affordance-band-kit`
- `hellscape-wave-threat-lane-kit`
- `hellscape-renderer-handoff-kit`
- `hellscape-siege-fractal-domain-kit`

These live in `games/rogue-lite-hellscape-siege/src/hellscape-siege-fractal-domain-kit.js`.

The kits accept plain route snapshots and output serializable descriptors. They do not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

- `games/rogue-lite-hellscape-siege/src/hellscape-siege-fractal-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/main.js`
- `games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js`
- `tests/hellscape-siege-fractal-domain-kits-smoke.mjs`
- `tests/hellscape-siege-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0130-hellscape-siege-fractal-upgrade.md`

## Tests added

- `tests/hellscape-siege-fractal-domain-kits-smoke.mjs`
  - 10 smoke-test intake cases.
  - Exercises realm pressure, resource route web, core defense radius, portal risk beacons, build affordance bands, wave threat lanes, renderer handoff, and the composite domain.
  - Checks descriptor arrays, IDs, serializability, counts, renderer-neutral policy, and ownership boundaries.

- `tests/hellscape-siege-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN import in `games/rogue-lite-hellscape-siege/src/main.js`.
  - Checks old `LuminaryLabs-Dev/NexusRealtime@main` runtime CDN absence in the changed runtime.
  - Checks `visualFractal`, `getRendererHandoff`, route shell boot, renderer descriptor consumption, and 10 state/input cases.

Both tests were wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Connector/static validation completed:

- Added new renderer-neutral domain kit file.
- Refetched/updated the route runtime to import NexusEngine main via CDN and expose `GameHost.visualFractal`/`getRendererHandoff`.
- Refetched/updated the canvas renderer to consume descriptor buckets.
- Added smoke files and check wiring.
- Updated the domain cutover manifest.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- The changed runtime imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed runtime does not import the old `LuminaryLabs-Dev/NexusRealtime@main` runtime URL.
- The route shell still uses the local helper named `attachNexusRealtimePageLoader` from `experiments/_shared/nexus-realtime-page-loader.js`. That helper is an internal loading overlay, not the old runtime CDN import. It was left in place to avoid breaking the shared boot overlay during this pass.

## Cleanup pass

- Kept reusable route analysis in the new domain kit.
- Kept canvas drawing in the renderer.
- Kept input, frame-loop timing, DOM events, and canvas context in `main.js`/renderer only.
- Did not remove harvesting, portals, waves, structures, inventory, or reset behavior.
- Did not create a branch.
- Did not touch any repo except `LuminaryLabs-Agents/NexusEngine-Experiments`.

## Non-game handling

`rogue-lite-hellscape-siege` is a small experience-driven web game route. No delete, rename, or refactor-away action was needed.

## Next safe ledge

Run `npm run check` and `npm run check:deploy` in a shell/CI runner, then promote the hellscape siege fractal domain into a generic survival-defense readability ProtoKit only after validating the overlay does not clutter small-screen play.
