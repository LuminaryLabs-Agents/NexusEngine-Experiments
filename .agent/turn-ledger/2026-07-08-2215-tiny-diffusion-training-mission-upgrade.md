# Tiny Diffusion Lab training mission upgrade

Timestamp: 2026-07-08 22:15 America/New_York

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

The latest observed upgrade activity was on `experiments/peer-scene-transition/` via the witness shelter readiness commits, so this run selected a different route. Tiny Diffusion Lab was the lowest-variability gallery route: it already loaded NexusEngine diffusion from the main CDN and had a useful CPU training/sampling proof, but it behaved like a technical panel instead of an experience with objective pressure, readiness cues, and descriptor handoff state.

## Last upgraded experiment

`experiments/peer-scene-transition/` was treated as the last upgraded route because the latest repository commits before this run were witness shelter readiness commits on the peer scene route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Multi-scene story transition and inventory proof. | 3-7 min | Puzzle tokens, scene exits, visited-scene ledger. | No runtime import observed in latest manifest text. | Yes. |
| `experiments/vr-platformer-board/` | Floating board platformer validation. | 2-5 min | A/D move, jump, coins, hazards, exit. | No. | Yes. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 2-6 min | WASD flight, LOD rings, survey descriptors. | No. | Yes. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene. | 2-6 min | Explore meadow descriptors, ecology, flock and pollinator overlays. | No changed runtime import found in current ledger context. | Yes. |
| `experiments/tiny-diffusion-lab/` | Browser-side tiny diffusion model proof. | 2-8 min | Prepare, train, sample, checkpoint, inspect readiness. | No. | Yes. |
| `experiments/fogline-relay/` | First-person fog relay route. | 4-10 min | Move, scan, relay repair, rescue readiness overlays. | No. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer signal-isles slice. | 5-12 min | Scan, harvest, build, route gates, cargo and pressure descriptors. | No. | Yes. |
| `apps/the-cavalry-of-rome/` | Painted Roman campaign map proof. | 3-8 min | Pan map, hover regions, campaign readiness descriptors. | No. | Yes. |
| `games/signal-bastion/` | 2.5D tower defense game. | 10-25 min | Placement, waves, towers, tactics, evacuation/rebuild overlays. | No. | Yes. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 3-8 min | Grapple, swing, cargo, rescue and bivouac descriptors. | No. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview gateway into aerial traversal. | 1-3 min | Launch rehearsal, route preview, sky readiness descriptors. | No. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 5-12 min | Move, collect, waves, horde pathing, cure and evacuation overlays. | No. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Hellscape resource/base siege game. | 10-25 min | Portals, harvest, inventory, build, core defense, contract and caravan overlays. | No. | Yes. |
| `experiments/living-agent-lab/` | ONNX zero-shot guard-choice lab. | 2-5 min | Load model, mutate apple/gate state, ask agent, dispose session. | Uses external Hugging Face CDN rather than NexusEngine CDN. | No. |
| `experiments/onnx-agent-lab/` | ONNX companion workshop. | 3-8 min | WASD, object focus, ONNX review, scene chat. | Uses local/legacy workshop stack. | Partial/unknown from static audit. |
| `experiments/tropical-island-scene/` | Tropical scene with rescue/shelter overlays. | 3-8 min | Orbit, fish, coconuts, reef rescue, clinic and rainwater readiness. | Legacy import-map remains for island/water stack. | Yes overlays. |
| `experiments/cozy-island/` | Cloudbar island scene with stewardship overlays. | 3-8 min | Island generation, campfire, smoke, tidepool and hatchery readiness. | Legacy ProtoKit cloud/island stack remains. | Yes overlays. |

## Domain ASCII tree

```txt
tiny-diffusion-training-mission-readiness-domain
├─ dataset-preparation-domain
│  ├─ sample-balance-domain
│  │  └─ tiny-diffusion-dataset-curation-kit
│  └─ prompt-seed-domain
│     └─ tiny-diffusion-prompt-seed-bank-kit
├─ denoise-curriculum-domain
│  ├─ noise-schedule-domain
│  │  └─ tiny-diffusion-noise-curriculum-kit
│  └─ training-sentry-domain
│     └─ tiny-diffusion-training-sentry-kit
├─ output-stewardship-domain
│  ├─ sample-triage-domain
│  │  └─ tiny-diffusion-sample-triage-kit
│  └─ checkpoint-audit-domain
│     └─ tiny-diffusion-checkpoint-audit-kit
└─ renderer-handoff
   └─ tiny-diffusion-training-mission-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tiny-diffusion-dataset-curation-kit`
- `tiny-diffusion-prompt-seed-bank-kit`
- `tiny-diffusion-noise-curriculum-kit`
- `tiny-diffusion-training-sentry-kit`
- `tiny-diffusion-sample-triage-kit`
- `tiny-diffusion-checkpoint-audit-kit`
- `tiny-diffusion-training-mission-renderer-handoff-kit`
- `tiny-diffusion-training-mission-readiness-domain-kit`

The new domain is renderer-neutral and explicitly excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, and diffusion-backend ownership.

## Files changed

- `experiments/tiny-diffusion-lab/kits/tiny-diffusion-training-mission-readiness-domain-kit.js`
- `experiments/tiny-diffusion-lab/app/training-mission-readiness-entry.js`
- `experiments/tiny-diffusion-lab/index.html`
- `tests/tiny-diffusion-training-mission-readiness-kits-smoke.mjs`
- `tests/tiny-diffusion-training-mission-cdn-state-input-smoke.mjs`
- `tests/agent-labs-static-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2215-tiny-diffusion-training-mission-upgrade.md`

## Tests added

- `tests/tiny-diffusion-training-mission-readiness-kits-smoke.mjs`
- `tests/tiny-diffusion-training-mission-cdn-state-input-smoke.mjs`

Each new smoke file contains 10 intake/state cases.

## Validation results

Scratch validation before push:

- `node --check experiments/tiny-diffusion-lab/kits/tiny-diffusion-training-mission-readiness-domain-kit.js` passed.
- `node --check experiments/tiny-diffusion-lab/app/training-mission-readiness-entry.js` passed.
- `node --check tests/tiny-diffusion-training-mission-readiness-kits-smoke.mjs` passed.
- `node --check tests/tiny-diffusion-training-mission-cdn-state-input-smoke.mjs` passed.
- `node tests/tiny-diffusion-training-mission-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch workspace.

Full repo `npm run check`, `npm run check:deploy`, and browser Playwright were not run from a cloned workspace because the local sandbox could not resolve GitHub. The tests were added and statically wired, but full repo CI status was not available in this connector run.

## NexusRealtime import audit

Changed files use NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The changed entry does not import old NexusRealtime runtime strings. Tiny Diffusion Lab already used NexusEngine main CDN in `main.js`, and the new overlay keeps that runtime source.

## Cleanup pass

- Kept reusable logic in a kit file under `experiments/tiny-diffusion-lab/kits/`.
- Kept DOM rendering in the route entry only.
- Preserved the existing training/sampling/checkpoint controls.
- Added a visible readiness card without taking ownership of the diffusion backend or frame loop.
- Routed static coverage through `tests/agent-labs-static-smoke.mjs`.
- Did not delete or rename the route because the lab is a useful NexusEngine diffusion proof.

## Non-game handling

Tiny Diffusion Lab is not a small experience-driven web game. It proves browser-side access to the NexusEngine diffusion module, CPU Float32Array training/sampling, preview frames, and checkpoint round trip. The lesson is that lab routes need objective/readiness descriptors so they feel like repeatable experiences instead of passive technical demos.

## Manifest note

`experiments/domain-kit-cutover-manifest.json` was not rewritten in this run. It is a large single-line canonical route manifest and currently mixes canonical cards with routes not visible in the checked gallery data. The safe next step is a dedicated manifest normalization pass that formats the JSON, reconciles gallery coverage, then promotes `tiny-diffusion-lab` with `tiny-diffusion-training-mission-readiness-domain-kit`.

## Next safe ledge

Normalize the canonical domain cutover manifest into pretty JSON, reconcile gallery coverage, add Tiny Diffusion Lab as a first-class canonical route, and then wire the two Tiny Diffusion mission smoke files into the full `scripts/run-checks.mjs` suite.
