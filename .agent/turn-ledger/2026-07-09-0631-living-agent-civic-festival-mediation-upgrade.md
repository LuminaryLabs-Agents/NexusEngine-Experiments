# 2026-07-09 06:31 ET — Living Agent Lab civic festival mediation upgrade

## Chosen experiment

`experiments/living-agent-lab/`

## Why it was chosen

The latest observed completed upgrade was `experiments/onnx-agent-lab/signal-calibration.html`, so this run avoided the ONNX Agent Lab route and selected a different experiment.

`experiments/living-agent-lab/` was the best target because it still had a very small interaction loop: load/fallback model, ask the guard, steal/return the apple, and possibly unlock the gate. The existing market-trust descriptors improved state readability, but the route still lacked a second procedural objective layer with player-driven readiness inputs. This pass adds a civic festival mediation layer that turns the market into a night-market preparation objective without deleting the model-loading proof.

## Last upgraded experiment

Latest observed repo commits before this run:

- `30a9624c6ef8add138582b67f66514efe511d46c` — `Log ONNX signal calibration upgrade`
- `c260567c683177661c4d04502e7f558179280888` — `Route gallery to ONNX signal calibration`
- `0efd376739903fa3b595d12f740f938c9250c46b` — `Add ONNX signal calibration CDN smoke`
- `7d2d198da9efda3747243c8f21120c23dfcd6f97` — `Add ONNX signal calibration kit smoke`
- `3c8174d0331e5ea9b1eb4d0b180a3f5aaa977cb7` — `Add ONNX signal calibration route`

Last upgraded route inferred from those commits: `experiments/onnx-agent-lab/signal-calibration.html`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story scene transition proof with visited-scene and inventory ledger. | 3-6 min | Scene exits, puzzle tokens, transition state. | No changed-file audit this run | Prior overlay uses CDN |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass. | 2-4 min | Jumping, coins, hazards, oxygen, medevac descriptors. | No changed-file audit this run | Yes in skyline medevac pass |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 2-5 min | WASD flight, origin snapping, radial LOD. | No changed-file audit this run | Yes in skybridge shelter pass |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology and soil mycelium descriptors. | 3-8 min | Walk/fly viewing, meadow visual systems, ecology descriptors. | No changed-file audit this run | Yes in soil mycelium pass |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion lab. | 5-15 min | Train, sample, save/load checkpoint. | No changed-file audit this run | Yes in sample clinic pass |
| `experiments/living-agent-lab/` | Market agent/trust loop now extended with civic festival mediation readiness. | 3-7 min | ONNX/fallback guard choice, steal/return apple, gate unlock, festival permit/lane/lantern/steward inputs. | No old runtime import in changed entry | Yes in new civic festival pass |
| `experiments/fogline-relay/` | First-person survey loop. | 3-6 min | Scan targets, fog zones, hazard pressure. | No changed-file audit this run | Yes in lighthouse pass |
| `experiments/nexus-frontier-signal-isles/` | Field engineer scan/harvest/build route. | 4-8 min | Scan, harvest, build, gates, beacon routing. | No changed-file audit this run | Yes in storm surge pass |
| `apps/the-cavalry-of-rome/` | Painted strategic map proof. | 2-6 min | Pan, hover, cinematic dive, map regions. | No changed-file audit this run | Yes in aqueduct pass |
| `games/signal-bastion/` | Tower defense game. | 5-10 min | Tower cards, placement, range rings, defense loop. | No changed-file audit this run | Yes in field hospital pass |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 5-10 min | Carry blocks, valves, gates, survivor rescue. | No changed-file audit this run | Yes in flood rescue pass |
| `experiments/next-ledge/` | Grapple-climb validation. | 2-5 min | Ledge routes, grapple, swing pressure. | No changed-file audit this run | Yes in glacier pass |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/proof. | 2-6 min | Flight route, visual domain descriptors. | No changed-file audit this run | Yes in orchard rescue pass |
| `experiments/zombie-orchard/` | Orchard survival route. | 5-10 min | Rounds, pickups, weapons, horde pressure. | No changed-file audit this run | Yes in seed bank pass |
| `games/rogue-lite-hellscape-siege/` | Base siege action route. | 8-15 min | Harvest, build, inventory, waves, refuge descriptors. | No changed-file audit this run | Yes in refuge pass |
| `experiments/onnx-agent-lab/signal-calibration.html` | Signal-calibration workshop route. | 2-5 min | Load/fallback/open buttons, inspectable tools, prompt/memory readiness. | No in changed entry | Yes |

## Domain ASCII tree

```txt
living-agent-civic-festival-mediation-readiness-domain
├─ permit-prep-domain
│  ├─ permit-scroll-domain
│  │  └─ living-agent-permit-scroll-board-kit
│  └─ vendor-lane-domain
│     └─ living-agent-vendor-lane-marker-kit
├─ ceremony-routing-domain
│  ├─ lantern-route-domain
│  │  └─ living-agent-lantern-route-thread-kit
│  └─ dispute-hearing-domain
│     └─ living-agent-dispute-hearing-card-kit
├─ safety-handoff-domain
│  ├─ steward-post-domain
│  │  └─ living-agent-safety-steward-post-kit
│  └─ night-market-ledger-domain
│     └─ living-agent-night-market-ledger-kit
└─ renderer-handoff
   └─ living-agent-civic-festival-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `living-agent-permit-scroll-board-kit`
- `living-agent-vendor-lane-marker-kit`
- `living-agent-lantern-route-thread-kit`
- `living-agent-dispute-hearing-card-kit`
- `living-agent-safety-steward-post-kit`
- `living-agent-night-market-ledger-kit`
- `living-agent-civic-festival-renderer-handoff-kit`
- `living-agent-civic-festival-mediation-domain-kit`

Composite functions added:

- `createLivingAgentCivicFestivalRendererHandoffKit`
- `createLivingAgentCivicFestivalMediationReadinessDomainKit`

## Files changed

Added:

- `experiments/living-agent-lab/civic-festival-mediation-readiness-kits.js`
- `experiments/living-agent-lab/civic-festival-mediation-entry.js`
- `tests/living-agent-civic-festival-mediation-readiness-kits-smoke.mjs`
- `tests/living-agent-civic-festival-mediation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0631-living-agent-civic-festival-mediation-upgrade.md`

Changed:

- `experiments/living-agent-lab/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/living-agent-civic-festival-mediation-readiness-kits-smoke.mjs`
- `tests/living-agent-civic-festival-mediation-cdn-state-input-smoke.mjs`

## Validation results

Scratch validation run before connector writes:

```txt
node --check experiments/living-agent-lab/civic-festival-mediation-readiness-kits.js
node --check experiments/living-agent-lab/civic-festival-mediation-entry.js
node --check tests/living-agent-civic-festival-mediation-readiness-kits-smoke.mjs
node --check tests/living-agent-civic-festival-mediation-cdn-state-input-smoke.mjs
node tests/living-agent-civic-festival-mediation-readiness-kits-smoke.mjs
node tests/living-agent-civic-festival-mediation-cdn-state-input-smoke.mjs
node --check experiments/_shared/nexus-gallery-data.js
```

Observed output:

```txt
Living Agent civic festival mediation readiness kits smoke passed 10 intake cases.
Living Agent civic festival mediation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run because the local shell runtime could not resolve `github.com`. The added CDN/state/input smoke is a Playwright-style static state/input validation and confirms the changed route imports the NexusEngine main CDN and exposes `GameHost` readiness/input/handoff surfaces.

## NexusRealtime import audit

Changed entry:

- `experiments/living-agent-lab/civic-festival-mediation-entry.js`
  - Imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
  - Does not import `NexusRealtime@` or the old NexusRealtime CDN.

Reusable kit:

- No renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, model inference, storage, or frame-loop ownership.

Existing original route:

- `experiments/living-agent-lab/index.html` still contains the Hugging Face transformer import for the original ONNX/fallback proof.
- The changed route now loads the new civic festival entry after the existing market trust entry and advertises `civic-festival-mediation-readiness-renderer-handoff-pass`.

## Cleanup pass

- Preserved the original Living Agent Lab model/fallback proof.
- Kept existing market-trust readiness pass intact.
- Added the civic festival mediation objective as a composed pass rather than replacing the trust pass.
- Kept reusable domain logic in the kit file.
- Kept DOM, overlay buttons, and marker rendering in the entry file only.
- Updated gallery copy to describe the new civic festival descriptors.

## Non-game handling

Living Agent Lab is a small model-choice workshop route rather than a full game. The lesson is useful: it proves that visible state and allowed actions can be routed to an ONNX or fallback agent. This run preserved that proof and added a small objective-driven night-market mediation layer on top.

## Next safe ledge

- Move the inline `index.html` script toward a separated `living-agent-lab-entry.js` module.
- Add browser Playwright coverage for clicking civic festival buttons and confirming `GameHost.getCivicFestivalMediationReadiness()` increases readiness.
- Let the guard's ONNX/fallback choice react to civic festival blockers as candidate action labels.
