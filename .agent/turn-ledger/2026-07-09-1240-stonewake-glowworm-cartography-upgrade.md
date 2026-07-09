# 2026-07-09 12:40 ET — Stonewake Glowworm Cartography Upgrade

## Chosen experiment

`games/stonewake-depths/`

## Why it was chosen

The latest completed upgrade in the commit ledger was `experiments/the-open-above/` for the thermal courier rescue pass, so this run picked a different route. `games/stonewake-depths/` still had a strong core loop, but most recent additions were rescue/clinic/pump/archive overlays around the same flood-pressure route. The least variable remaining gap was navigation readability inside the dark flooded cavern, so this upgrade adds glowworm cartography as a new objective layer rather than another generic rescue ledger.

## Last upgraded experiment

`experiments/the-open-above/` — Open Above thermal courier rescue pass. Latest visible commits before this run:

- `Add Open Above thermal courier kits`
- `Wire Open Above thermal courier entry`
- `Integrate Open Above thermal courier route`
- `Add Open Above thermal courier kit smoke`
- `Add Open Above thermal courier CDN state smoke`

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene-hosted story route with puzzle tokens and evacuation overlays. | 3–6 min | Scene transitions, token gates, stateful exits, descriptor overlays. | Not found in current gallery/changed audit. | Yes in added overlay entries. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route. | 2–4 min | Jumping, coins, hazards, tether/oxygen/medevac descriptors. | Not found in current gallery/changed audit. | Yes in upgraded route entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 3–5 min | WASD flight, LOD rings, origin snapping, cartography overlays. | Not found in current gallery/changed audit. | Yes in upgraded overlay entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene. | 2–5 min | Camera exploration, vegetation/wind/ecology descriptors. | Not found in current gallery/changed audit. | Yes in upgraded overlay entries. |
| `experiments/tiny-diffusion-lab/` | Browser tiny diffusion training/sampling lab. | 4–8 min | Prepare/train/sample/checkpoint, readiness dashboards. | Not found in current gallery/changed audit. | Yes in upgraded app entries. |
| `experiments/living-agent-lab/` | Small ONNX/fallback market-agent route. | 3–6 min | Visible-state agent actions, market trust, civic mediation descriptors. | Not found in current gallery/changed audit. | Yes in upgraded route entry. |
| `experiments/fogline-relay/` | First-person fog survey/courier route. | 4–7 min | Movement, scan targets, hazard/fog pressure, evacuation overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entry. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice. | 5–8 min | Scan, harvest, build, cargo, storm surge, hospital/desalination overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy-map proof. | 3–6 min | Pannable map, hover regions, cinematic dive, army descriptors. | Not found in current gallery/changed audit. | Yes in upgraded campaign pass. |
| `games/signal-bastion/` | 2.5D tower-defense game. | 5–8 min | Tower cards, placement, waves, range rings, hospital/supply overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entry. |
| `games/stonewake-depths/` | Flooded cavern puzzle rescue game. | 4–7 min | Block carrying, valve pressure, plate gate, climbing, rising water, glowworm cartography. | No old `NexusRealtime@` import in changed entry. | Yes, changed entry imports NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 3–6 min | Grapple, ledges, swing pressure, avalanche/drone/weather overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entries. |
| `experiments/sora-the-infinite/` | Sora gateway into Open Above. | 2–5 min | Gateway rehearsal, launch readiness, star orchard/rookery/rescue descriptors. | Not found in current gallery/changed audit. | Yes in upgraded route entries. |
| `experiments/zombie-orchard/` | Survival/horde orchard slice. | 5–8 min | Rounds, pickups, weapons, rescue/cure/radio/fence overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 6–10 min | Harvesting, building, portals, waves, forge/refuge/seed/covenant overlays. | Not found in current gallery/changed audit. | Yes in upgraded route entries. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route. | 3–6 min | Model handshake, fallback rails, tool cues, prompt intent, scene gate. | Not found in current gallery/changed audit. | Yes in upgraded route entry. |

## Domain ASCII tree

```txt
stonewake-glowworm-cartography-readiness-domain
├─ luminous-survey-domain
│  ├─ glowworm-cluster-domain
│  │  └─ stonewake-glowworm-cluster-kit
│  └─ phosphate-wall-chart-domain
│     └─ stonewake-phosphate-wall-chart-kit
├─ route-marking-domain
│  ├─ chalk-arrow-domain
│  │  └─ stonewake-chalk-arrow-trail-kit
│  └─ rope-handline-domain
│     └─ stonewake-rope-handline-marker-kit
├─ rescue-handoff-domain
│  ├─ cave-bell-node-domain
│  │  └─ stonewake-cave-bell-node-kit
│  └─ dawn-cartography-ledger-domain
│     └─ stonewake-dawn-cartography-ledger-kit
└─ renderer-handoff
   └─ stonewake-glowworm-cartography-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `stonewake-glowworm-cluster-kit`
- `stonewake-phosphate-wall-chart-kit`
- `stonewake-chalk-arrow-trail-kit`
- `stonewake-rope-handline-marker-kit`
- `stonewake-cave-bell-node-kit`
- `stonewake-dawn-cartography-ledger-kit`
- `stonewake-glowworm-cartography-renderer-handoff-kit`
- `stonewake-glowworm-cartography-readiness-domain-kit`

The reusable kit file excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, network, and storage ownership.

## Files changed

Added:

- `games/stonewake-depths/stonewake-glowworm-cartography-kits.js`
- `games/stonewake-depths/stonewake-glowworm-cartography-entry.js`
- `tests/stonewake-glowworm-cartography-readiness-kits-smoke.mjs`
- `tests/stonewake-glowworm-cartography-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1240-stonewake-glowworm-cartography-upgrade.md`

Updated:

- `games/stonewake-depths/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/stonewake-glowworm-cartography-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates domain id, tree, kit list, descriptor family counts, readiness bounds, risk bounds, mission-state enum, JSON safety, and late-route readiness improvement.
- `tests/stonewake-glowworm-cartography-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, cache-busted entry load, NexusEngine main CDN import, old NexusRealtime absence, GameHost accessors, renderer handoff composition, reusable-kit ownership isolation, descriptor counts, readiness bounds, and risk bounds.

## Validation results

Scratch validation run from generated local files before GitHub writes:

```txt
node --check games/stonewake-depths/stonewake-glowworm-cartography-kits.js
node --check games/stonewake-depths/stonewake-glowworm-cartography-entry.js
node --check tests/stonewake-glowworm-cartography-readiness-kits-smoke.mjs
node --check tests/stonewake-glowworm-cartography-cdn-state-input-smoke.mjs
node tests/stonewake-glowworm-cartography-readiness-kits-smoke.mjs
node tests/stonewake-glowworm-cartography-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Stonewake glowworm cartography readiness kits smoke passed 10 intake cases.
Stonewake glowworm cartography CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because the local shell runtime could not resolve `github.com`. This is a connector-driven run, so validation was limited to scratch Node checks and connector file inspection.

## NexusRealtime import audit

- Changed entry imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed entry does not import `LuminaryLabs-Dev/NexusRealtime@main` or `NexusRealtime@`.
- Reusable kit file contains no browser/renderer/runtime ownership calls per the CDN/state smoke regex.

## Cleanup pass

- No destructive file removals.
- No route rename.
- No useful functionality removed.
- Existing flood rescue, cave clinic, pressure pump, and silt archive passes are preserved.
- New overlay composes into `GameHost.getRendererHandoff()` instead of replacing previous descriptors.
- Gallery description and tags now mention Glowworm Cartography.

## What it was trying to prove

Stonewake Depths is a small experience-driven web game proving that a deterministic puzzle-platform route can keep accepting renderer-neutral rescue domains without moving reusable logic into canvas drawing or input handling.

## Lesson

The strongest next improvement was not another flood ledger. It was navigation readability: the chamber needed visible route-memory artifacts that make the dark cave feel more spatially authored while still deriving from state and level descriptors.

## Next safe ledge

Add a real in-run collection objective where the player must touch or pass near glowworm chart nodes to increment a route-memory counter, then let the renderer use the existing descriptors to brighten marked paths only after discovery.
