# 2026-07-09 11:05 ET — Next Ledge Drone Relay Rescue Upgrade

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest completed upgrade on `main` before this run was `experiments/peer-scene-transition/` with the Bell Archive Evacuation pass. This run selected a different route.

Next Ledge is still one of the most compact experience-driven routes: a small grapple-climb validation loop with ledge movement, swing pressure, recovery, and a hidden HUD. It already had rescue/weather overlays, but its moment-to-moment climb could use a stronger visual rescue objective that stays renderer-neutral and describes a concrete extraction chain instead of adding renderer-owned behavior.

This upgrade adds a drone relay rescue loop: phosphor anchors mark safe ledges, snow flags preserve the whiteout route, drone perches stage aerial relays, rescue cable spools connect ledge spans, heat beacons mark survivor warmth, and an extraction ledger summarizes launch readiness.

## Last upgraded experiment checked before selection

Latest commit and ledger context showed `experiments/peer-scene-transition/` as the previous completed route with the Peer Scene Bell Archive Evacuation upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, action buttons, inventory tokens, visited-scene state, bell archive descriptors | No old runtime CDN in changed files | Yes through `scene-demo.js` and bell archive entry |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD, shelter descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors, soil health overlays | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint flow and museum/sample review descriptors | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards, rescue/clinic/lighthouse/tide descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes in changed entries |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign readiness descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings, archive descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, weather/supply/rescue descriptors, drone relay rescue handoff | No old runtime CDN in changed files | Yes in base session and new drone relay entry |
| `experiments/sora-the-infinite/` | Open flight gateway | Open-ended | Flight gateway, launch rehearsal, rescue/rookery/orchard descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons, rescue descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 5-12 min | Harvest, build, portals, waves, purification, forge, caravan, refuge, seed vault descriptors | No known old CDN import found in latest changed files | Yes; base route and changed entries import NexusEngine main CDN |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
next-ledge-drone-relay-rescue-readiness-domain
├─ route-marking-domain
│  ├─ phosphor-anchor-domain
│  │  └─ next-ledge-phosphor-anchor-kit
│  └─ snow-flag-breadcrumb-domain
│     └─ next-ledge-snow-flag-breadcrumb-kit
├─ aerial-relay-domain
│  ├─ drone-perch-domain
│  │  └─ next-ledge-drone-perch-kit
│  └─ rescue-cable-spool-domain
│     └─ next-ledge-rescue-cable-spool-kit
├─ survivor-handoff-domain
│  ├─ heat-beacon-flare-domain
│  │  └─ next-ledge-heat-beacon-flare-kit
│  └─ extraction-ledger-domain
│     └─ next-ledge-extraction-ledger-kit
└─ renderer-handoff
   └─ next-ledge-drone-relay-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `next-ledge-phosphor-anchor-kit`
- `next-ledge-snow-flag-breadcrumb-kit`
- `next-ledge-drone-perch-kit`
- `next-ledge-rescue-cable-spool-kit`
- `next-ledge-heat-beacon-flare-kit`
- `next-ledge-extraction-ledger-kit`
- `next-ledge-drone-relay-rescue-renderer-handoff-kit`
- `next-ledge-drone-relay-rescue-readiness-domain-kit`

All reusable kit logic accepts plain route/player/weather state and returns serializable descriptor output. The kit boundary excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, storage, and physics ownership.

## Files changed

Added:

- `experiments/next-ledge/src/drone-relay-rescue-readiness-kits.js`
- `experiments/next-ledge/src/drone-relay-rescue-readiness-entry.js`
- `tests/next-ledge-drone-relay-rescue-readiness-kits-smoke.mjs`
- `tests/next-ledge-drone-relay-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1105-next-ledge-drone-relay-rescue-upgrade.md`

Updated:

- `experiments/next-ledge/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/next-ledge-drone-relay-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six descriptor families.
  - Validates readiness bounds, storm-pressure bounds, phase enums, descriptor counts, JSON safety, renderer handoff policy, ownership exclusions, and readiness improvement from cold start to mature rescue route.

- `tests/next-ledge-drone-relay-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated input cases.
  - Validates the Next Ledge route advertises the pass and loads the entry.
  - Validates the changed entry imports NexusEngine main CDN, exposes `GameHost` readiness/tree/handoff functions, avoids old `NexusRealtime@`, and keeps reusable kits renderer-neutral.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check experiments/next-ledge/src/drone-relay-rescue-readiness-kits.js
node --check experiments/next-ledge/src/drone-relay-rescue-readiness-entry.js
node --check tests/next-ledge-drone-relay-rescue-readiness-kits-smoke.mjs
node --check tests/next-ledge-drone-relay-rescue-cdn-state-input-smoke.mjs
node tests/next-ledge-drone-relay-rescue-readiness-kits-smoke.mjs
node tests/next-ledge-drone-relay-rescue-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Next Ledge drone relay rescue readiness kits smoke passed 10 intake cases.
Next Ledge drone relay rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because this run used connector writes plus scratch Node validation.

## NexusRealtime import audit

Changed files:

- `drone-relay-rescue-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `drone-relay-rescue-readiness-entry.js` does not import `NexusRealtime@`.
- `drone-relay-rescue-readiness-kits.js` has no runtime import and no renderer/browser ownership.
- `index.html` still uses the shared page loader by name, but the changed runtime overlay uses NexusEngine main CDN.
- No changed file adds an old NexusRealtime CDN dependency.

## Cleanup pass

- Preserved the existing grapple route and all previously loaded readiness passes.
- Added the drone relay route marker to the existing `data-upgrade` list.
- Loaded the new entry after summit weather station readiness so it composes with earlier handoffs.
- Composed `GameHost.getRendererHandoff()` instead of replacing the previous handoff.
- Kept drawing in the route entry and kept reusable logic pure.
- Updated gallery tags and description to reflect the new objective layer.
- No destructive deletes.

## Non-game handling

The chosen route is a small experience-driven web game/experiment. It was not deleted or renamed. The lesson is that a traversal validation route becomes more playable when safety/extraction descriptors are tied to the same ledge graph the player already navigates.

## Next safe ledge

Connect the drone relay descriptors to explicit in-game events: paint phosphor anchors after a stable grapple, plant snow flags at rest ledges, charge drone perches from summit batteries, reduce cable tension after clean swings, and expose survivor extraction readiness through the hidden HUD/readout without adding renderer-owned gameplay truth.
