# 2026-07-09 08:00 ET — Tiny Diffusion dataset expedition upgrade

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

Tiny Diffusion Lab is one of the least game-like routes in the current catalog. It already proves Nexus Engine diffusion training/sampling, but its interaction loop was still primarily a lab toolbar. This pass makes the route more experience-driven by adding an expedition-style curation objective over the procedural dataset, noise schedule, curriculum progress, provenance checkpoint, and field-guide handoff.

No destructive changes were made. The original diffusion training, sampling, checkpoint, training-mission, and sample-clinic functionality was preserved.

## Last upgraded experiment

Latest repository commits before this run showed `games/stonewake-depths/` as the last active upgrade target through the Stonewake pressure lock pump pass:

- `f12785fc5ea536b6956dff2b3ac4591c6aa84189` — Add Stonewake pressure lock pump kits
- `9997398c6e5efcac1c7bf3be68846edecf3e3369` — Wire Stonewake pressure lock pump overlay
- `745169919edf6cdf483e5ab909b06bb370a66d77` — Add Stonewake pressure lock pump kit smoke
- `be9f6094c9a4785e4e00bb6c5b32db9f1da9cea2` — Add Stonewake pressure lock pump CDN smoke

This run intentionally picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration with hosted HTML scenes, inventory, visited-scene state, and transition ledgers. | Short multi-scene route. | Scene transitions, puzzle tokens, scene state validation. | No `NexusRealtime@` found in changed-pass audit. | Yes in upgraded entries where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass with skyline medevac descriptors. | Short board run. | Jumping, coins, hazards, oxygen, medevac readiness. | No `NexusRealtime@` found in changed-pass audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation demo. | Open-ended scenic traversal. | WASD flight, origin snapping, LOD terrain rings. | No `NexusRealtime@` found in changed-pass audit. | Yes in recent overlay entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil mycelium descriptors. | Open-ended scenic route. | Camera exploration, procedural vegetation/ecology overlays. | No `NexusRealtime@` found in changed-pass audit. | Yes in recent overlay entries. |
| `experiments/tiny-diffusion-lab/` | Browser-host diffusion lab for CPU denoiser training, sampling, checkpointing, sample clinic, and now dataset expedition readiness. | Short/open-ended lab session. | Prepare, train, sample, checkpoint, curation readiness. | No old runtime import in changed entry. | Yes: main app and new entry use NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market-agent route with ONNX/fallback guard and civic festival mediation descriptors. | Short lab route. | Model/fallback action choice, market trust, civic mediation. | No `NexusRealtime@` found in changed-pass audit. | Yes in recent overlay entry. |
| `experiments/fogline-relay/` | First-person fog survey loop with rescue, clinic, lighthouse, and evacuation readiness passes. | Short/objective loop. | WASD, look, scan, fog/hazard/readiness overlays. | Loader name still references legacy page loader, but changed overlays use NexusEngine CDN. | Yes in recent overlay entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer slice for scan, harvest, build, pressure, cargo, beacon, feedback, and replay surfaces. | Short systems slice. | Scan, harvest, build, cargo, beacon state. | No `NexusRealtime@` found in changed-pass audit. | Mixed/route-specific; not changed this run. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and army visual proof. | Open-ended map inspection. | Pan, hover, region focus, visual descriptors. | No `NexusRealtime@` found in changed-pass audit. | Yes in aqueduct sabotage entry. |
| `games/signal-bastion/` | Tower defense game with tower cards, field hospital, and supply convoy readiness. | Multi-wave short game. | Placement, tower cards, waves, supply descriptors. | No `NexusRealtime@` found in changed-pass audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern puzzle/rescue game with valves, plates, blocks, pings, and pressure lock pump pass. | Short platform puzzle. | Move, carry, valve, plate, chain, gate, rescue overlays. | No old runtime import in changed entry. | Yes in pressure lock pump entry. |
| `experiments/next-ledge/` | Grapple-climb validation with rescue/supply/avalanche readiness overlays. | Short climb route. | Grapple, ledge routing, swing pressure, rescue descriptors. | Uses legacy-named page loader; changed overlays use NexusEngine CDN. | Yes in recent overlay entries. |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect into The Open Above with visual-domain descriptors. | Open-ended traversal. | Flight, visual readability domains, rescue readiness. | No `NexusRealtime@` found in changed-pass audit. | Yes in recent overlay entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, pressure, pickups, weapons, orchard content, and seed-bank overlays. | Round-based short survival. | WASD, sprint, dodge, collect, gear, horde pressure. | Uses legacy-named page loader; changed overlays use NexusEngine CDN. | Yes in recent overlay entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, and ember well purification. | Multi-wave short action route. | Harvest, build, defend, portal/wave pressure, purification descriptors. | No `NexusRealtime@` found in changed-pass audit. | Yes in recent overlay entries. |
| `experiments/onnx-agent-lab/signal-calibration.html` | Signal-calibration workshop for model handshake, fallback safety, tool cues, intent threads, memory traces, and scene-open gates. | Short workshop route. | Inspect, calibrate, fallback/model handshake, readiness descriptors. | No old runtime import in changed entry. | Yes in signal calibration entry. |

## Domain ASCII tree

```txt
tiny-diffusion-dataset-expedition-readiness-domain
├─ seed-expedition-domain
│  ├─ seed-cartography-domain
│  │  └─ tiny-diffusion-seed-cartography-kit
│  └─ class-balance-domain
│     └─ tiny-diffusion-class-balance-kit
├─ training-expedition-domain
│  └─ curriculum-route-domain
│     ├─ epoch-milepost-domain
│     │  └─ tiny-diffusion-curriculum-route-kit
│     └─ noise-weather-domain
│        └─ tiny-diffusion-noise-weather-kit
├─ archive-expedition-domain
│  ├─ provenance-ticket-domain
│  │  └─ tiny-diffusion-provenance-ticket-kit
│  └─ field-guide-ledger-domain
│     └─ tiny-diffusion-field-guide-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-dataset-expedition-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tiny-diffusion-seed-cartography-kit`
- `tiny-diffusion-class-balance-kit`
- `tiny-diffusion-curriculum-route-kit`
- `tiny-diffusion-noise-weather-kit`
- `tiny-diffusion-provenance-ticket-kit`
- `tiny-diffusion-field-guide-ledger-kit`
- `tiny-diffusion-dataset-expedition-renderer-handoff-kit`
- `tiny-diffusion-dataset-expedition-readiness-domain-kit`

The reusable kit file declares forbidden ownership for renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, checkpoint storage, and frame-loop work.

## Files changed

Added:

- `experiments/tiny-diffusion-lab/kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js`
- `experiments/tiny-diffusion-lab/app/dataset-expedition-readiness-entry.js`
- `tests/tiny-diffusion-dataset-expedition-readiness-kits-smoke.mjs`
- `tests/tiny-diffusion-dataset-expedition-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0800-tiny-diffusion-dataset-expedition-upgrade.md`

Updated:

- `experiments/tiny-diffusion-lab/index.html`

## Tests added

- `tests/tiny-diffusion-dataset-expedition-readiness-kits-smoke.mjs`
  - Runs 10 intake cases.
  - Validates all six descriptor families.
  - Validates bounded readiness, phase enums, descriptor-only handoff, JSON serializability, capped map/provenance counts, and readiness progression.

- `tests/tiny-diffusion-dataset-expedition-cdn-state-input-smoke.mjs`
  - Runs 10 simulated state/input cases.
  - Validates route marker, panel ID, entry script wiring, NexusEngine main CDN import, no old `NexusRealtime@` runtime import in the changed entry, `GameHost`/TinyDiffusionLab accessors, renderer-neutral kit source, and state progression.

## Validation results

Local scratch validation passed before GitHub connector writes:

```txt
node --check experiments/tiny-diffusion-lab/kits/tiny-diffusion-dataset-expedition-readiness-domain-kit.js
node --check experiments/tiny-diffusion-lab/app/dataset-expedition-readiness-entry.js
node --check tests/tiny-diffusion-dataset-expedition-readiness-kits-smoke.mjs
node --check tests/tiny-diffusion-dataset-expedition-cdn-state-input-smoke.mjs
node tests/tiny-diffusion-dataset-expedition-readiness-kits-smoke.mjs
node tests/tiny-diffusion-dataset-expedition-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Tiny Diffusion dataset expedition readiness kits smoke passed 10 intake cases.
Tiny Diffusion dataset expedition CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com` through shell git. The connector write path was available and used directly against `main`.

## NexusRealtime import audit

Changed files:

- `dataset-expedition-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `dataset-expedition-readiness-entry.js` does not import `NexusRealtime@`.
- `tiny-diffusion-dataset-expedition-readiness-domain-kit.js` has no CDN, DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, checkpoint storage, or frame-loop ownership.
- `index.html` now advertises `dataset-expedition-readiness-renderer-handoff-pass` and loads the new entry.

Repo-level note: some route shells still use the legacy-named `nexus-realtime-page-loader.js`; that loader name was not touched by this tiny-diffusion pass because the changed route already imports NexusEngine main CDN through `main.js` and the new entry.

## Cleanup pass

- Preserved existing Tiny Diffusion training/sample clinic functionality.
- Added only descriptor rendering and host accessor composition in the entry layer.
- Kept reusable readiness logic in the kit file.
- Did not add browser APIs or renderer ownership to reusable kit code.
- Did not delete, rename, or refactor unrelated routes.
- Did not create a branch or push to any repo other than `LuminaryLabs-Agents/NexusEngine-Experiments`.

## Non-game handling

Tiny Diffusion Lab is not a conventional small web game. It proves browser-side Nexus Engine diffusion training/sampling. The lesson from prior state was that the lab needed an experience-oriented objective layer without sacrificing the model proof. This pass preserves the lab and adds a curation/expedition loop rather than deleting or renaming the route.

## Next safe ledge

Add a lightweight visual overlay that draws the dataset expedition map points over the six dataset canvases using descriptors only. Keep that renderer work separate from the reusable dataset expedition kit and add a browser smoke that confirms map point count and labels are visible after `prepare`.
