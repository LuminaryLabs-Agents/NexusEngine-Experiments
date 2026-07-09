# 2026-07-09 06:13 ET — ONNX Agent Lab signal calibration upgrade

## Chosen experiment

`experiments/onnx-agent-lab/`

New upgraded route:

`experiments/onnx-agent-lab/signal-calibration.html`

## Why it was chosen

The latest observed upgrade sequence was the High Fidelity Meadow soil mycelium restoration pass, so this run avoided `experiments/high-fidelity-meadow/`.

`experiments/onnx-agent-lab/` was the best target because the gallery still had the lab present in the no-script fallback but not as a visible gallery card, and the existing route was mostly a model-loading/workshop proof rather than a small objective-driven route. The useful functionality was preserved by leaving the original `index.html` in place and adding a new small calibration route.

## Last upgraded experiment

Latest observed repo commits before this run:

- `77bf1bb6364604592c689b467184e3202cd8a4da` — `Add meadow soil mycelium CDN smoke`
- `91a3ecc06ce6a7d3e336ecec15255995a1a03644` — `Add meadow soil mycelium kit smoke`
- `0dc2e3e24268518d2c9c2f1643900824c9a321ab` — `Load meadow soil mycelium restoration pass`
- `bb8b20781b76332dcb4880ff9ef4ab01fbcf3a65` — `Add meadow soil mycelium restoration entry`
- `e3ba39a10b3ca8296eb11933c75117a324bc3fb8` — `Add meadow soil mycelium restoration kits`

Last upgraded route inferred from those commits: `experiments/high-fidelity-meadow/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story scene transition proof with visited-scene and inventory ledger. | 3-6 min | Scene exits, puzzle tokens, transition state. | No changed-file audit this run | Prior route-specific overlays likely use CDN |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass. | 2-4 min | Jumping, coins, hazards, oxygen, medevac descriptors. | No in upgraded pass | Yes in skyline medevac pass |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 2-5 min | WASD flight, origin snapping, radial LOD. | No changed-file audit this run | Yes in upgraded overlay |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology and soil mycelium descriptors. | 3-8 min | Walk/fly viewing, meadow visual systems, ecology descriptors. | No in latest soil entry | Yes |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion lab. | 5-15 min | Train, sample, save/load checkpoint. | No changed-file audit this run | Yes in sample clinic pass |
| `experiments/living-agent-lab/` | Market agent/trust loop. | 2-5 min | Agent action choice, trust descriptors. | No changed-file audit this run | Yes in market trust pass |
| `experiments/fogline-relay/` | First-person survey loop. | 3-6 min | Scan targets, fog zones, hazard pressure. | No changed-file audit this run | Yes in lighthouse pass |
| `experiments/nexus-frontier-signal-isles/` | Field engineer scan/harvest/build route. | 4-8 min | Scan, harvest, build, gates, beacon routing. | No changed-file audit this run | Yes in storm surge pass |
| `apps/the-cavalry-of-rome/` | Painted strategic map proof. | 2-6 min | Pan, hover, cinematic dive, map regions. | No changed-file audit this run | Yes in aqueduct pass |
| `games/signal-bastion/` | Tower defense game. | 5-10 min | Tower cards, placement, range rings, defense loop. | No changed-file audit this run | Not touched this run |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 5-10 min | Carry blocks, valves, gates, survivor rescue. | No changed-file audit this run | Not touched this run |
| `experiments/next-ledge/` | Grapple-climb validation. | 2-5 min | Ledge routes, grapple, swing pressure. | No changed-file audit this run | Yes in glacier pass |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/proof. | 2-6 min | Flight route, visual domain descriptors. | No changed-file audit this run | Yes in orchard rescue pass |
| `experiments/zombie-orchard/` | Orchard survival route. | 5-10 min | Rounds, pickups, weapons, horde pressure. | No changed-file audit this run | Yes in seed bank pass |
| `games/rogue-lite-hellscape-siege/` | Base siege action route. | 8-15 min | Harvest, build, inventory, waves, refuge descriptors. | No changed-file audit this run | Yes in refuge pass |
| `experiments/onnx-agent-lab/signal-calibration.html` | New signal-calibration workshop route. | 2-5 min | Load/fallback/open buttons, inspectable tools, prompt/memory readiness. | No old runtime import in changed entry | Yes |

## Domain ASCII tree

```txt
onnx-workshop-signal-calibration-readiness-domain
├─ model-handshake-domain
│  ├─ runtime-beacon-domain
│  │  └─ onnx-workshop-model-handshake-beacon-kit
│  └─ fallback-rail-domain
│     └─ onnx-workshop-fallback-safety-rail-kit
├─ tool-understanding-domain
│  ├─ tool-bench-cue-domain
│  │  └─ onnx-workshop-tool-bench-cue-kit
│  └─ prompt-intent-domain
│     └─ onnx-workshop-prompt-intent-thread-kit
├─ memory-handoff-domain
│  ├─ memory-trace-domain
│  │  └─ onnx-workshop-memory-trace-card-kit
│  └─ scene-open-gate-domain
│     └─ onnx-workshop-scene-open-gate-kit
└─ renderer-handoff
   └─ onnx-workshop-signal-calibration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `onnx-workshop-model-handshake-beacon-kit`
- `onnx-workshop-fallback-safety-rail-kit`
- `onnx-workshop-tool-bench-cue-kit`
- `onnx-workshop-prompt-intent-thread-kit`
- `onnx-workshop-memory-trace-card-kit`
- `onnx-workshop-scene-open-gate-kit`
- `onnx-workshop-signal-calibration-renderer-handoff-kit`

Composite functions added:

- `normalizeWorkshopSignalInput`
- `createOnnxWorkshopSignalCalibrationReadiness`
- `createOnnxWorkshopSignalCalibrationRendererHandoff`

## Files changed

Added:

- `experiments/_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js`
- `experiments/onnx-agent-lab/signal-calibration-entry.js`
- `experiments/onnx-agent-lab/signal-calibration.html`
- `tests/onnx-workshop-signal-calibration-readiness-kits-smoke.mjs`
- `tests/onnx-workshop-signal-calibration-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0613-onnx-workshop-signal-calibration-upgrade.md`

Changed:

- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/onnx-workshop-signal-calibration-readiness-kits-smoke.mjs`
- `tests/onnx-workshop-signal-calibration-cdn-state-input-smoke.mjs`

## Validation results

Scratch validation run before connector writes:

```txt
node --check experiments/_kits/onnx-agent-lab/onnx-workshop-signal-calibration-kits.js
node --check experiments/onnx-agent-lab/signal-calibration-entry.js
node --check tests/onnx-workshop-signal-calibration-readiness-kits-smoke.mjs
node --check tests/onnx-workshop-signal-calibration-cdn-state-input-smoke.mjs
node tests/onnx-workshop-signal-calibration-readiness-kits-smoke.mjs
node tests/onnx-workshop-signal-calibration-cdn-state-input-smoke.mjs
```

Observed output:

```txt
ONNX workshop signal calibration readiness kits smoke passed 10 intake cases.
ONNX workshop signal calibration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run because the local shell runtime could not resolve `github.com`. The added CDN/state/input smoke is Playwright-style static state validation and confirms the changed route imports the NexusEngine main CDN and exposes `GameHost` state/handoff surfaces.

## NexusRealtime import audit

Changed entry:

- `experiments/onnx-agent-lab/signal-calibration-entry.js`
  - Imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
  - Does not import `NexusRealtime@` or the old NexusRealtime CDN.

Reusable kit:

- No DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX runtime loading, model inference, storage, navigation, or frame-loop ownership.

Existing original route:

- `experiments/onnx-agent-lab/index.html` was preserved as the legacy ONNX workshop proof.
- No destructive migration was made to that inline route in this run.

## Cleanup pass

- Preserved useful ONNX workshop functionality by keeping the existing route intact.
- Added a new small, objective-driven calibration route instead of deleting or renaming the lab.
- Routed the gallery card to the new calibration route.
- Kept all reusable domain logic in `experiments/_kits/onnx-agent-lab/`.
- Kept renderer/UI behavior in the route entry and HTML only.

## Non-game handling

The original ONNX Agent Lab is primarily a workshop/model-loading proof, not a small game. Its lesson is useful: the lab proves model lifecycle, local fallback behavior, focus selection, and scene opening. This run preserved that proof and added a smaller playable readiness layer around it.

## Next safe ledge

- Move the original inline `experiments/onnx-agent-lab/index.html` route toward separated entry modules without deleting the current workshop behavior.
- Add browser Playwright coverage for pressing `Load model handshake`, selecting a tool, asking a focused question, and confirming readiness increases.
- Add a gallery cover capture for `experiments/onnx-agent-lab/signal-calibration.html`.
