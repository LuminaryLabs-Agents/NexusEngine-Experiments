# 2026-07-09 11:01 ET — Fogline Fog Observatory Calibration Upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The latest completed upgrade on `main` before this run was `experiments/next-ledge/` with the Drone Relay Rescue pass. This run selected a different route.

Fogline Relay remains one of the most compact playable routes: first-person movement, scan targets, fog pressure, hazard state, and a stack of descriptor overlays. Its core loop still benefits from a clearer, visually readable objective that turns the fog into an instrument-calibration problem rather than another generic rescue marker layer.

This upgrade adds a fog observatory calibration loop: barometer needles read pressure, hygrometer sashes show moisture, heliograph mirrors align relay light, relay kites rise above the fog bank, map flags mark confirmed bearings, and a dawn observatory ledger summarizes readiness.

## Last upgraded experiment checked before selection

Latest commit and ledger context showed `experiments/next-ledge/` as the previous completed route with the Next Ledge Drone Relay Rescue upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, action buttons, inventory tokens, visited-scene state, bell archive descriptors | No old runtime CDN in changed files | Yes through scene entries and bell archive overlays |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD, shelter descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors, soil health overlays | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint flow, dataset expedition, sample clinic, latent museum descriptors | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards, rescue/clinic/lighthouse/tide descriptors, fog observatory calibration descriptors | No old runtime CDN in changed files | Yes in upgraded overlay entries and new fog observatory entry |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes in changed entries |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign readiness descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings, archive descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, weather/supply/rescue descriptors, drone relay rescue handoff | No old runtime CDN in changed files | Yes in base session and upgraded entries |
| `experiments/sora-the-infinite/` | Open flight gateway | Open-ended | Flight gateway, launch rehearsal, rescue/rookery/orchard descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons, rescue descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 5-12 min | Harvest, build, portals, waves, purification, forge, caravan, refuge, seed vault descriptors | No known old CDN import found in latest changed files | Yes; base route and changed entries import NexusEngine main CDN |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
fogline-fog-observatory-calibration-readiness-domain
├─ atmospheric-reading-domain
│  ├─ barometer-needle-domain
│  │  └─ fogline-barometer-needle-kit
│  └─ hygrometer-sash-domain
│     └─ fogline-hygrometer-sash-kit
├─ signal-calibration-domain
│  └─ heliograph-alignment-domain
│     ├─ mirror-azimuth-domain
│     │  └─ fogline-heliograph-mirror-kit
│     └─ relay-kite-domain
│        └─ fogline-relay-kite-kit
├─ evacuation-report-domain
│  ├─ map-flag-domain
│  │  └─ fogline-map-flag-kit
│  └─ dawn-observatory-ledger-domain
│     └─ fogline-dawn-observatory-ledger-kit
└─ renderer-handoff
   └─ fogline-fog-observatory-calibration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `fogline-barometer-needle-kit`
- `fogline-hygrometer-sash-kit`
- `fogline-heliograph-mirror-kit`
- `fogline-relay-kite-kit`
- `fogline-map-flag-kit`
- `fogline-dawn-observatory-ledger-kit`
- `fogline-fog-observatory-calibration-renderer-handoff-kit`
- `fogline-fog-observatory-calibration-readiness-domain-kit`

All reusable kit logic accepts plain route/player/weather state and returns serializable descriptor output. The kit boundary excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, storage, network, and physics ownership.

## Files changed

Added:

- `experiments/fogline-relay/src/fog-observatory-calibration-readiness-kits.js`
- `experiments/fogline-relay/src/fog-observatory-calibration-readiness-entry.js`
- `tests/fogline-fog-observatory-calibration-readiness-kits-smoke.mjs`
- `tests/fogline-fog-observatory-calibration-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1101-fogline-fog-observatory-calibration-upgrade.md`

Updated:

- `experiments/fogline-relay/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/fogline-fog-observatory-calibration-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six descriptor families.
  - Validates readiness bounds, pressure bounds, mission-state enums, descriptor counts, JSON safety, renderer handoff policy, ownership exclusions, and readiness improvement from cold start to mature calibration.

- `tests/fogline-fog-observatory-calibration-cdn-state-input-smoke.mjs`
  - 10 simulated input cases.
  - Validates the Fogline route advertises the pass and loads the entry.
  - Validates the changed entry imports NexusEngine main CDN, exposes `GameHost` readiness/tree/handoff functions, avoids old `NexusRealtime@`, and keeps reusable kits renderer-neutral.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check experiments/fogline-relay/src/fog-observatory-calibration-readiness-kits.js
node --check experiments/fogline-relay/src/fog-observatory-calibration-readiness-entry.js
node --check tests/fogline-fog-observatory-calibration-readiness-kits-smoke.mjs
node --check tests/fogline-fog-observatory-calibration-cdn-state-input-smoke.mjs
node tests/fogline-fog-observatory-calibration-readiness-kits-smoke.mjs
node tests/fogline-fog-observatory-calibration-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Fogline fog observatory calibration readiness kits smoke passed 10 intake cases.
Fogline fog observatory calibration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because shell git could not resolve `github.com`; this run used connector writes plus scratch Node validation.

## NexusRealtime import audit

Changed files:

- `fog-observatory-calibration-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `fog-observatory-calibration-readiness-entry.js` does not import `NexusRealtime@`.
- `fog-observatory-calibration-readiness-kits.js` has no runtime import and no renderer/browser ownership.
- `index.html` still uses the shared page loader by name, but the changed runtime overlay uses NexusEngine main CDN.
- No changed file adds an old NexusRealtime CDN dependency.

## Cleanup pass

- Preserved the existing Fogline Relay route and all previously loaded readiness passes.
- Added the fog observatory route marker to the existing `data-upgrade` list.
- Loaded the new entry after tide siren evacuation readiness so it composes with earlier handoffs.
- Composed `GameHost.getRendererHandoff()` instead of replacing the previous handoff.
- Kept drawing in the route entry and kept reusable logic pure.
- Updated gallery tags and description to reflect the new objective layer.
- No destructive deletes.

## Non-game handling

The chosen route is a small experience-driven web game/experiment. It was not deleted or renamed. The lesson is that a first-person fog route becomes more playable when scan pressure is tied to readable instrument calibration and evacuation reporting, rather than only abstract fog or rescue markers.

## Next safe ledge

Connect fog observatory descriptors to explicit in-game events: barometer needles stabilize after scan streaks, hygrometer sashes clear after hazard mitigation, heliograph mirrors align at confirmed targets, relay kites lift above high-fog sectors, and the dawn observatory ledger feeds the HUD without giving the overlay ownership of gameplay truth.
