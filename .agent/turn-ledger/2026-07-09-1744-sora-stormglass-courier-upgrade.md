# 2026-07-09 17:44 ET — Sora Stormglass Courier upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` from a densely layered route-preview gateway into a directly playable procedural courier flight while preserving the original gateway at `index.html`. The new route has seeded thermal lanes and storm cells, flight and cargo simulation, signal-buoy collection, a sanctuary landing objective, responsive keyboard/touch controls, descriptor-only rendering handoff, NexusEngine main CDN hosting, and 10-case smoke/state validation.

## Chosen experiment

- Chosen experiment: `experiments/sora-the-infinite/`
- Chosen route: `experiments/sora-the-infinite/stormglass-courier.html`
- Why chosen: the original Sora route was one of the least direct experience loops in the gallery. Its root page was primarily a long gateway/readiness dashboard that linked onward to The Open Above and stacked many descriptor panels, rather than making the player fly a complete objective locally.
- Improvement: the gallery now opens a real 2–4 minute courier flight. Players ride procedural thermal lanes, avoid charged storm cells, tune three signal buoys, preserve fragile stormglass cargo, brake into the sanctuary runway, and seal a dawn delivery ledger.

## Last upgraded experiment

- Last upgraded experiment before this run: `experiments/living-agent-lab/market-fire-evacuation.html`.
- Latest completed ledger read: `.agent/turn-ledger/2026-07-09-1730-living-agent-market-fire-evacuation-upgrade.md`.
- Pre-run commit evidence included `Add Living Agent market fire evacuation kits`, `Add Living Agent market fire evacuation route`, `Wire Living Agent market fire evacuation entry`, both smoke tests, gallery routing, ledger logging, and the final cleanup pass.
- This run selected `experiments/sora-the-infinite/`, so it did not repeat the last changed experiment.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration with puzzle-token exits and bell archive evacuation descriptors. | 3–7 min | Click actions, token collection, state-gated scene transitions. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation with storm-harbor readiness. | 2–4 min | Move, jump, collect, avoid hazards, complete rescue handoff. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain with LOD, cartography, and glacier rescue overlays. | 2–6 min | WASD flight, vertical movement, terrain/LOD inspection. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with wind, ecology, creek, and soil-mycelium descriptors. | 3–8 min | Explore and inspect procedural ecology handoffs. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion workshop with CPU training, sampling, checkpoints, and curriculum readiness. | 5–15 min | Train, sample, checkpoint, review and curate artifacts. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market-fire drill with deterministic response-agent recommendations. | 3–8 min | Inspect lanterns, clear aisles, stage relays/firebreaks, muster merchants. | No in changed route or entry. | Yes; changed entry imports NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person fog survey with search-dog and rescue overlays. | 5–8 min | Move/look, scan targets, manage fog hazards and rescue state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storms, triage, and water systems. | 6–10 min | Explore, scan, harvest, build, manage pressure and readiness. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy-map proof with region and morale descriptors. | 4–10 min | Pan, hover/select regions, cinematic dive, inspect campaign state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/signal-bastion/` | 2.5D tower defense with hospital and supply-convoy readiness. | 5–12 min | Place towers, inspect cards, survive waves, manage logistics. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/stonewake-depths/` | Flooded cavern rescue with valves, rune gates, survivor pings, and cartography. | 6–12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/next-ledge/` | Grapple-climb validation with weather and drone rescue descriptors. | 3–7 min | Move, grapple, climb, manage swing pressure and extraction. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller sandbox with debug rays and rescue objectives. | 3–7 min | WASD, camera control, jump/reset/debug, rescue readiness. | No in latest changed entry. | Yes; latest pass imports NexusEngine main CDN. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural courier flight with thermal lanes, storm cells, signal buoys, cargo integrity, and landing. | 2–4 min | Pitch/bank, boost/brake, collect three signals, avoid storms, land safely. | No in changed route, entry, or kit. | Yes; changed entry imports NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Horde-survival slice with weapons, pickups, cure systems, and refuge readiness. | 5–12 min | Move, sprint, dodge, collect, fight rounds, maintain refuge state. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with harvesting, building, waves, and quarantine systems. | 8–15 min | Harvest, build, fight waves, maintain base/recovery systems. | No `NexusRealtime@` found in current audit. | Yes in upgraded route family. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Workshop drill for model-failure containment and operator evacuation. | 3–8 min | Run canary, lock sandbox, tag evidence, rehearse rollback. | No in latest changed entry. | Yes; upgraded route imports NexusEngine main CDN. |

## Domain ASCII tree

```txt
sora-stormglass-courier-readiness-domain
├─ procedural-sky-route-domain
│  ├─ thermal-lane-domain
│  │  └─ sora-stormglass-thermal-lane-kit
│  └─ storm-cell-domain
│     └─ sora-stormglass-storm-cell-field-kit
├─ courier-flight-domain
│  ├─ wing-response-domain
│  │  └─ sora-stormglass-courier-flight-kit
│  └─ cargo-stability-domain
│     └─ sora-stormglass-cargo-stability-kit
├─ navigation-handoff-domain
│  ├─ signal-buoy-domain
│  │  └─ sora-stormglass-signal-buoy-kit
│  ├─ sanctuary-approach-domain
│  │  └─ sora-stormglass-sanctuary-approach-kit
│  └─ courier-objective-domain
│     └─ sora-stormglass-courier-objective-kit
├─ completion-ledger-domain
│  └─ sora-stormglass-dawn-courier-ledger-kit
└─ renderer-handoff
   └─ sora-stormglass-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js` with:

- `sora-stormglass-thermal-lane-kit`
- `sora-stormglass-storm-cell-field-kit`
- `sora-stormglass-courier-flight-kit`
- `sora-stormglass-cargo-stability-kit`
- `sora-stormglass-signal-buoy-kit`
- `sora-stormglass-sanctuary-approach-kit`
- `sora-stormglass-courier-objective-kit`
- `sora-stormglass-dawn-courier-ledger-kit`
- `sora-stormglass-courier-renderer-handoff-kit`
- `sora-stormglass-courier-readiness-domain-kit`

Every atomic kit accepts plain input and returns plain JSON-safe state or descriptors. The composite domain calls the independent kits but does not absorb their renderer, input, or browser responsibilities.

Reusable-kit ownership exclusions:

- renderer
- DOM
- browser input
- Three.js
- WebGL
- audio
- asset loading
- frame loop
- physics-engine ownership
- storage
- network

## Files changed

Added:

- `experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js`
- `experiments/sora-the-infinite/stormglass-courier.html`
- `experiments/sora-the-infinite/sora-stormglass-courier-entry.js`
- `tests/sora-stormglass-courier-domain-kits-smoke.mjs`
- `tests/sora-stormglass-courier-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1744-sora-stormglass-courier-upgrade.md`

Updated:

- `experiments/_shared/nexus-gallery-data.js`
- `package.json`

## Tests added

### Domain-kit smoke

`tests/sora-stormglass-courier-domain-kits-smoke.mjs`

- Runs 10 intake cases through every new atomic kit, renderer-handoff kit, and composite domain.
- Covers cold/default input, multiple seeds, active navigation, completed-route state, negative and over-range values, invalid strings, nested state input, and completed stormglass state.
- Checks thermal/storm/buoy/landing/cargo/objective/ledger descriptor counts, bounded position and cargo state, readiness bounds, mission phase enum, JSON safety, and reusable-kit isolation from DOM/canvas/frame-loop APIs.

### CDN/state/input smoke

`tests/sora-stormglass-courier-cdn-state-input-smoke.mjs`

- Checks route markers and entry wiring.
- Checks the exact NexusEngine main CDN import and absence of `NexusRealtime@`.
- Checks `GameHost.getState`, `applyInput`, `tick`, `restart`, readiness, and renderer-handoff exposure.
- Simulates 10 pitch/bank/boost/brake input cases.
- Deterministically tunes all three signal buoys and verifies successful sanctuary delivery.
- Attempts to fetch the CDN source, write it to a temporary local `.mjs`, and import it when network access is available.

`package.json` now exposes `npm run check:sora-stormglass-courier` and includes it in both `check` and `check:deploy`.

## Validation results

Local scratch validation passed before GitHub writes:

```txt
node --check experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js
node --check experiments/sora-the-infinite/sora-stormglass-courier-entry.js
node --check tests/sora-stormglass-courier-domain-kits-smoke.mjs
node --check tests/sora-stormglass-courier-cdn-state-input-smoke.mjs
node tests/sora-stormglass-courier-domain-kits-smoke.mjs
node tests/sora-stormglass-courier-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Sora stormglass courier domain kits smoke passed 10 intake cases.
Sora stormglass courier CDN/state/input smoke passed 10 simulated cases; CDN validation: source-wiring-only.
```

The local runtime could not resolve external network hosts, so the CDN test exercised its local-download path up to the network boundary and verified exact source wiring. In a network-enabled checkout it will write the fetched CDN module to a temporary `.mjs` and attempt import validation.

The new files were then fetched back from `main` to confirm that the CDN import and route files were present. Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a complete clone because shell git could not resolve `github.com`.

## NexusRealtime import audit

Changed entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- Changed route, entry, kit, and tests contain no old `NexusRealtime@` runtime import.
- Repository connector search for `NexusRealtime@` returned no direct code results during the run.
- The new `GameHost` is based on `createNexusHost()` from NexusEngine main and exposes deterministic state/input/tick/restart/readiness/handoff methods.

## Cleanup pass

- Preserved the original Sora gateway and every existing readiness/clinic/rescue module at `experiments/sora-the-infinite/index.html`.
- Added the courier as a separate experience-driven route rather than deleting the historical gateway proof.
- Routed the gallery card to the playable route.
- Kept seeded route generation, flight motion, cargo damage, objectives, scoring, and descriptor construction in renderer-neutral kits.
- Kept keyboard/touch input, Canvas 2D drawing, responsive HUD, and `requestAnimationFrame` in the browser entry adapter.
- Renderer reads only thermal, storm, buoy, approach, cargo, objective, and ledger descriptors.
- Added a complete win state and repeatable seeded rerun.
- Added validation to normal and deploy checks.
- No destructive file removals.
- No branches created.
- No other repository modified.

## Purpose-driven commits

Pushed directly to `LuminaryLabs-Agents/NexusEngine-Experiments` `main`:

- `6682498face2799551b89f7bfd27a8f51a6a7623` — Add Sora stormglass courier domain kits
- `7ad0cada0d70ad422faff311118c358b17454cce` — Add Sora stormglass courier route
- `be464d0e3e5e78533d72d049175f40133a98b710` — Wire Sora stormglass courier runtime
- `c5ac33c0350e19d411a3865c10f69a81e7450187` — Add Sora stormglass courier kit smoke
- `72da46902f51c4558020ddbc0d6433661888a9a7` — Add Sora stormglass courier CDN smoke
- `f9d77869f522bd646f5112f23edb83c391a604af` — Route gallery to Sora stormglass courier
- `917d655da0ab18d97cd077adbceb8084f905ce69` — Wire Sora stormglass courier validation

## Next safe ledge

- Run the full repository suite and browser Playwright from a network-enabled clone.
- Play-test seeded routes on desktop and mobile, then tune storm-cell density, buoy pickup radius, and brake thresholds from observed completion rates.
- Add deterministic replay serialization for input frames and final ledger snapshots.
- Keep the original gateway, but separately consolidate its many stacked panels into one route-selection compositor instead of adding another overlay.
