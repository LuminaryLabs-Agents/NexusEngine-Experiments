# 2026-07-09 17:30 ET — Living Agent market fire evacuation upgrade

## Summary

Upgraded `experiments/living-agent-lab/` with a new procedural market fire evacuation drill. The route now has a concrete objective loop, a deterministic response-agent policy, seeded stall layouts, animated descriptor-only evacuation visuals, 10-case tests across every changed kit, NexusEngine main CDN wiring, and a gallery entry that opens the new route.

## Chosen experiment

- Chosen experiment: `experiments/living-agent-lab/`
- Chosen route: `experiments/living-agent-lab/market-fire-evacuation.html`
- Why chosen: the original Living Agent Lab was one of the least game-like and least variable routes. Its core proof was a small market with a guard choosing among a few actions. The civic festival layer added descriptors, but the route still lacked a sustained spatial objective, procedural scene variation, visible escalating pressure, and a repeatable win condition.
- Improvement: players and the response agent now inspect ember lanterns, clear smoke aisles, stage bucket relays, place stall firebreaks, muster merchants, reroute seeded market layouts, and secure a dawn safety ledger before fire pressure overwhelms the east gate.

## Last upgraded experiment

The latest completed turn ledger before this run was `experiments/ThirdPersonFollowThrough/`, specifically the rooftop rope rescue upgrade in `.agent/turn-ledger/2026-07-09-1714-third-person-rooftop-rope-rescue-upgrade.md`.

This run picked `experiments/living-agent-lab/`, so it did not repeat the last changed experiment.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration with puzzle-token exits and bell archive evacuation descriptors. | 3–7 min | Click actions, collect tokens, unlock local scene transitions, inspect readiness. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation route with storm harbor readiness. | 2–4 min | A/D movement, jump, collect, avoid hazards, inspect rescue state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain with LOD, cartography, and glacier rescue overlays. | 2–6 min | WASD flight, vertical movement, look controls, terrain inspection. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, ecology, creek, and soil mycelium descriptors. | 3–8 min | Explore a procedural scene and inspect ecological handoffs. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion workshop with CPU training, sampling, checkpoints, and curriculum readiness. | 5–15 min | Train, sample, checkpoint, review artifacts, inspect readiness. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market fire drill with response-agent recommendations and descriptor-only scene rendering. | 3–8 min | Inspect lanterns, clear aisles, stage bucket relays, place firebreaks, muster merchants, reroute seed, reset. | No in changed route or entry. | Yes; changed entry imports NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person fog survey with search-dog and rescue overlays. | 5–8 min | Move/look, scan targets, manage hazards and rescue state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storm, hospital, and water systems. | 6–10 min | Explore, scan, harvest, build, manage pressure and readiness. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy-map proof with region and morale descriptors. | 4–10 min | Pan, hover/select regions, cinematic dive, inspect campaign state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/signal-bastion/` | 2.5D tower defense with field-hospital and supply-convoy readiness. | 5–12 min | Place towers, inspect cards, survive waves, manage logistics. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/stonewake-depths/` | Flooded cavern rescue game with valves, rune gates, survivor pings, and cartography. | 6–12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/next-ledge/` | Grapple-climb validation with weather and drone rescue descriptors. | 3–7 min | Move, grapple, climb ledges, manage swing pressure and extraction state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller sandbox with debug rays, rescue overlays, and rooftop rope objectives. | 3–7 min | WASD, camera control, jump/reset/debug, anchor and rescue readiness. | No in latest changed entry. | Yes; latest route pass imports NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue and cloud-clinic descriptors. | 4–8 min | Fly/steer, inspect aerial route and rescue handoffs. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/zombie-orchard/` | Horde-survival slice with weapons, pickups, cure systems, and refuge readiness. | 5–12 min | Move, sprint, dodge, collect, fight rounds, manage rescue state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with harvesting, building, waves, and quarantine systems. | 8–15 min | Harvest, build, fight waves, maintain base and recovery systems. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Workshop drill for model-failure containment and operator evacuation. | 3–8 min | Run canary, lock sandbox, tag evidence, rehearse rollback, close ledger. | No in latest changed entry. | Yes; upgraded route imports NexusEngine main CDN. |

## Domain ASCII tree

```txt
living-agent-market-fire-evacuation-readiness-domain
├─ hazard-sensing-domain
│  ├─ ember-lantern-domain
│  │  └─ living-agent-ember-lantern-sensor-kit
│  └─ smoke-corridor-domain
│     └─ living-agent-smoke-corridor-map-kit
├─ suppression-routing-domain
│  ├─ market-stall-layout-domain
│  │  └─ living-agent-market-stall-layout-kit
│  ├─ bucket-relay-domain
│  │  └─ living-agent-bucket-relay-route-kit
│  └─ stall-firebreak-domain
│     └─ living-agent-stall-firebreak-marker-kit
├─ accountability-handoff-domain
│  ├─ merchant-muster-domain
│  │  └─ living-agent-merchant-muster-token-kit
│  ├─ response-policy-domain
│  │  └─ living-agent-fire-response-policy-kit
│  └─ dawn-safety-ledger-domain
│     └─ living-agent-dawn-fire-safety-ledger-kit
└─ renderer-handoff
   └─ living-agent-market-fire-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js` with:

- `living-agent-market-stall-layout-kit`
- `living-agent-ember-lantern-sensor-kit`
- `living-agent-smoke-corridor-map-kit`
- `living-agent-bucket-relay-route-kit`
- `living-agent-stall-firebreak-marker-kit`
- `living-agent-merchant-muster-token-kit`
- `living-agent-fire-response-policy-kit`
- `living-agent-dawn-fire-safety-ledger-kit`
- `living-agent-market-fire-evacuation-renderer-handoff-kit`
- `living-agent-market-fire-evacuation-readiness-domain-kit`

Every atomic kit accepts plain state input and emits plain JSON-safe descriptors or a deterministic policy choice. The composite domain only coordinates smaller kits and does not own their internals.

Reusable-kit ownership exclusions:

- renderer
- DOM
- browser input
- Three.js
- WebGL
- audio
- asset loading
- frame loop
- model inference
- storage
- network

## Files changed

Added:

- `experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js`
- `experiments/living-agent-lab/market-fire-evacuation.html`
- `experiments/living-agent-lab/market-fire-evacuation-entry.js`
- `tests/living-agent-market-fire-evacuation-readiness-kits-smoke.mjs`
- `tests/living-agent-market-fire-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1730-living-agent-market-fire-evacuation-upgrade.md`

Updated:

- `experiments/_shared/nexus-gallery-data.js`

## Tests added

### Kit smoke

`tests/living-agent-market-fire-evacuation-readiness-kits-smoke.mjs`

- Runs 10 intake cases through every one of the eight atomic kits, the renderer-handoff kit, and the composite domain kit.
- Checks descriptor arrays, JSON safety, policy action enums, policy confidence bounds, readiness bounds, fire-pressure bounds, phase enums, descriptor-family counts, clamping of malformed/overspecified inputs, and cold-to-secured improvement.
- Stable renderer handoff total: 31 descriptors.

### CDN/state/input smoke

`tests/living-agent-market-fire-evacuation-cdn-state-input-smoke.mjs`

- Checks the route marker and cache-busted entry.
- Checks the exact NexusEngine main CDN import.
- Checks old `NexusRealtime@` absence.
- Checks `GameHost` state/input/readiness/handoff exposure.
- Checks reusable-kit isolation from DOM, canvas rendering, and frame-loop ownership.
- Simulates 10 input cases and verifies monotonic readiness, bounded fire pressure, and stable descriptor totals.
- Attempts to fetch the NexusEngine CDN, write it to a temporary local `.mjs`, and import it when network access is available.

## Validation results

Scratch validation passed before GitHub writes:

```txt
node --check experiments/living-agent-lab/market-fire-evacuation-readiness-kits.js
node --check experiments/living-agent-lab/market-fire-evacuation-entry.js
node --check tests/living-agent-market-fire-evacuation-readiness-kits-smoke.mjs
node --check tests/living-agent-market-fire-evacuation-cdn-state-input-smoke.mjs
node tests/living-agent-market-fire-evacuation-readiness-kits-smoke.mjs
node tests/living-agent-market-fire-evacuation-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Living Agent market fire evacuation readiness kits smoke passed 10 intake cases across 10 kits.
Living Agent market fire evacuation CDN/state/input smoke passed 10 simulated cases; CDN validation: source-wiring-only.
```

The local runtime could not resolve external network hosts, so the CDN smoke verified source wiring and exercised its local-download path only up to the network boundary. The test will download the CDN source into a temporary `.mjs` and import it in a network-enabled environment.

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a complete clone because shell git could not resolve `github.com`. Connector reads and writes completed directly against `main`.

## NexusRealtime import audit

Changed entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed route, entry, and reusable kit contain no old `NexusRealtime@` runtime import.

The reusable kit contains no DOM access, no canvas renderer, no `requestAnimationFrame`, no Three.js/WebGL ownership, no audio, no asset loading, no model runtime, no storage, and no network ownership.

## Cleanup pass

- Preserved the original `experiments/living-agent-lab/index.html`, market-trust pass, and civic-festival pass.
- Added the fire drill as a separate experience-driven route instead of deleting useful ONNX/fallback guard behavior.
- Kept all deterministic layout, hazard, policy, scoring, and descriptor logic in the reusable kit file.
- Kept DOM, controls, canvas drawing, animation, and frame-loop ownership in the browser entry adapter.
- Renderer consumes the descriptor handoff only.
- Added seeded market rerouting for procedural visual variation without storing scene positions in the renderer.
- Added a clear completion state: all response thresholds satisfied and fire pressure reduced to the secured range.
- Updated the gallery to open the new route.
- No destructive file removals.
- No branches created.
- No other repository modified.

## Purpose-driven commits

Pushed directly to `LuminaryLabs-Agents/NexusEngine-Experiments` `main`:

- `bb390b76b8d57d7cf07de8e7db38f31d8708fc5c` — Add Living Agent market fire evacuation kits
- `2145acbcc6701c70f19b140a3c3baa519a6d18de` — Add Living Agent market fire evacuation route
- `57aee3cfd20d049fa1f212357645a07b94f05f3c` — Wire Living Agent market fire evacuation entry
- `36cd7bfeb27355f57301bb2e675f44a667884ba1` — Add Living Agent market fire evacuation kit smoke
- `7e25e0269bb75e3499ab68ec0ef3baa9ad840ee7` — Add Living Agent market fire evacuation CDN smoke
- `4d2c2fd7eaea4775b075e19b63073f1cacd2c8fb` — Route gallery to Living Agent market fire evacuation

## Next safe ledge

- Run the full repository validation from a network-enabled clone.
- Open the drill in a browser and tune smoke opacity and HUD overlap across desktop and mobile sizes.
- Connect the original ONNX zero-shot chooser as an optional policy provider behind the deterministic `living-agent-fire-response-policy-kit` contract, while retaining the tested fallback policy.
- If more Living Agent routes are added, consolidate shared response-panel and descriptor-canvas adapters without merging the independent domain internals.
