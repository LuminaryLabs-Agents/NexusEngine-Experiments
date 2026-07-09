# 2026-07-09 12:46 EDT - Third Person Traversal Course Upgrade

## Chosen experiment

`experiments/ThirdPersonFollowThrough/`

## Why this was chosen

The latest completed turn ledger before this run was `experiments/the-open-above/`, so this run intentionally chose a different experiment.

`ThirdPersonFollowThrough` was a strong target because it had useful controller/camera/debug foundations, but compared with the game routes it remained a test-like controller validation screen. The upgrade adds a readable traversal objective layer without changing core input ownership: checkpoint gates, ghost footsteps, balance beam wobble, vault target arcs, breath recovery pads, and a coach ledger now make movement practice visually legible and procedurally varied.

## Last upgraded experiment

`experiments/the-open-above/`

Latest commit evidence before this run:

```txt
de03b089f470f55b65c717e8fe336372e1b4a514
Log Open Above thermal courier upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene transition story proof. | 2-4 minutes. | Scene exits, puzzle tokens, clue/readiness overlays. | No old runtime import in latest overlays. | Yes, overlay entries. |
| `experiments/vr-platformer-board/` | Board-scale platformer proof. | 1-3 minutes. | A/D, jump, coins, hazards, medevac overlays. | No old runtime import in changed route. | Yes, medevac entry. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation. | Endless/free-flight. | WASD flight, terrain LOD, aquifer descriptors. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene. | Passive/exploration. | Vegetation, wind, sheep, ecology overlays. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab. | Lab session length. | Train, sample, checkpoint, curate. | No old runtime import in latest entries. | Yes, overlay entries. |
| `experiments/living-agent-lab/` | Market/agent lab. | 2-5 minutes. | Agent choice, fallback, market/civic descriptors. | No old runtime import in changed entry. | Yes, civic entry. |
| `experiments/fogline-relay/` | First-person fog relay route. | 3-6 minutes. | Move, scan, relay, courier overlays. | Old page loader removed in prior courier pass. | Yes, changed entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice. | 4-8 minutes. | Scan, harvest, build, cargo, triage/desalination overlays. | No old runtime import in latest overlays. | Yes, overlay entries. |
| `apps/the-cavalry-of-rome/` | Roman campaign-map visual proof. | 3-5 minutes. | Pan, hover, cinematic zoom, logistics overlays. | No old runtime import in latest overlays. | Yes, overlay entries. |
| `games/signal-bastion/` | Tower-defense route. | 10-20 minutes. | Towers, waves, upgrades, supply overlays. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 5-10 minutes. | Carry blocks, valves, gates, drainage/cartography overlays. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `experiments/next-ledge/` | Grapple-climb route. | 3-7 minutes. | Grapple, swing, ledges, rescue overlays. | No old runtime import in current wrapper. | Yes, route wrapper and overlays. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation. | 2-5 minute test route. | WASD, jump, reset, debug rays, camera/controller descriptors, traversal course overlays. | No old runtime import in changed traversal-course files. | Yes, new traversal-course entry. |
| `experiments/sora-the-infinite/` | Open aerial redirect/preview lane. | Short preview/free-flight handoff. | Flight preview and visual readability domains. | Legacy redirect preserved; overlays use NexusEngine. | Yes, overlay entries. |
| `experiments/zombie-orchard/` | Survival orchard slice. | 5-12 minutes. | Rounds, horde pressure, pickups, crafting/rescue overlays. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `games/rogue-lite-hellscape-siege/` | Action-defense-extraction route. | 10-20 minutes. | Harvest, build, inventory, waves, covenant overlays. | No old runtime import in changed overlays. | Yes, overlay entries. |
| `experiments/onnx-agent-lab/` | ONNX/fallback workshop route. | Lab session length. | Model handshake, fallback, tool cues, memory/open-scene gates. | No old runtime import in changed calibration route. | Yes, calibration entry. |
| `experiments/the-open-above/` | High-altitude flight route. | Endless/free-flight. | Assisted flight, terrain streaming, courier overlays. | Changed shell removed old loader; old ProtoKits base remains unchanged. | Yes, config and new entries. |
| `experiments/tropical-island-scene/` | Tropical island scene. | Passive/exploration. | Orbit camera, water/fish/coconut, reef overlays. | Older island stack remains; changed overlays use NexusEngine. | Yes, overlay entries. |
| `experiments/cozy-island/` | Cozy island/cloudbar route. | Passive/exploration. | Island generation, clouds, grass, campfire/recovery overlays. | Legacy cloudbar lineage remains; changed overlays use NexusEngine. | Yes, changed overlays. |

## Domain ASCII tree

```txt
third-person-traversal-course-readiness-domain
├─ route-literacy-domain
│  ├─ checkpoint-gate-domain
│  │  └─ third-person-checkpoint-gate-kit
│  └─ ghost-footstep-domain
│     └─ third-person-ghost-footstep-ribbon-kit
├─ body-control-domain
│  ├─ balance-beam-domain
│  │  ├─ wobble-meter-domain
│  │  │  └─ third-person-balance-beam-wobble-kit
│  └─ vault-target-domain
│     └─ third-person-vault-target-arc-kit
├─ recovery-handoff-domain
│  ├─ breath-pad-domain
│  │  └─ third-person-breath-recovery-pad-kit
│  └─ coach-ledger-domain
│     └─ third-person-course-coach-ledger-kit
└─ renderer-handoff
   └─ third-person-traversal-course-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-checkpoint-gate-kit`
- `third-person-ghost-footstep-ribbon-kit`
- `third-person-balance-beam-wobble-kit`
- `third-person-vault-target-arc-kit`
- `third-person-breath-recovery-pad-kit`
- `third-person-course-coach-ledger-kit`
- `third-person-traversal-course-renderer-handoff-kit`
- `third-person-traversal-course-readiness-domain-kit`

Changed route integration:

- Added `traversal-course-readiness-entry.js`.
- Updated `app/index.js` to import the traversal course pass.
- Updated `index.html` to advertise the pass and describe the new overlays.
- Added the route to the gallery and noscript fallback.

## Files changed

```txt
experiments/ThirdPersonFollowThrough/kits/third-person-traversal-course-readiness-domain-kit.js
experiments/ThirdPersonFollowThrough/app/traversal-course-readiness-entry.js
experiments/ThirdPersonFollowThrough/app/index.js
experiments/ThirdPersonFollowThrough/index.html
experiments/_shared/nexus-gallery-data.js
index.html
tests/third-person-traversal-course-readiness-kits-smoke.mjs
tests/third-person-traversal-course-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-1246-third-person-traversal-course-upgrade.md
```

## Tests added

```txt
tests/third-person-traversal-course-readiness-kits-smoke.mjs
tests/third-person-traversal-course-cdn-state-input-smoke.mjs
```

## Validation results

Local scratch validation passed before pushing:

```txt
node --check experiments/ThirdPersonFollowThrough/kits/third-person-traversal-course-readiness-domain-kit.js
node --check experiments/ThirdPersonFollowThrough/app/traversal-course-readiness-entry.js
node --check tests/third-person-traversal-course-readiness-kits-smoke.mjs
node --check tests/third-person-traversal-course-cdn-state-input-smoke.mjs
node tests/third-person-traversal-course-readiness-kits-smoke.mjs
node tests/third-person-traversal-course-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Third Person traversal course readiness kits smoke passed 10 intake cases.
Third Person traversal course CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Not run:

```txt
npm run check
npm run check:deploy
browser-rendered Playwright
```

Reason: this connector-driven run validated changed files with local scratch Node checks and did not have a full cloned workspace with installable GitHub dependencies.

## NexusRealtime import audit

Changed files:

- `third-person-traversal-course-readiness-domain-kit.js`: no NexusRealtime import; no DOM, browser input, Three.js, WebGL, audio, asset-loading, storage, navigation, physics-engine, or frame-loop ownership.
- `traversal-course-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `app/index.js`: imports the new traversal course entry only through a local module import.
- `index.html`: advertises `traversal-course-readiness-renderer-handoff-pass` and does not add old runtime imports.
- New tests: assert the changed entry uses NexusEngine main CDN and does not import `NexusRealtime@`.

Existing unchanged context:

- Earlier route overlays remain in place and already use NexusEngine main CDN where changed in prior passes.

## Cleanup pass

- Kept traversal-course kit logic deterministic and descriptor-only.
- Kept DOM rendering, overlay CSS, `requestAnimationFrame`, and `GameHost` patching in the entry file.
- Composed `GameHost.getRendererHandoff()` rather than replacing existing medevac/stealth/navigation handoffs.
- Added the missing gallery route so the experiment is discoverable.
- Did not delete or rename existing useful functionality.

## Non-game handling

`ThirdPersonFollowThrough` is a small experience-driven controller test route. It did not need deletion or renaming. The lesson preserved is that controller validation needs authored route literacy, not just debug rays and mechanics readout.

## Next safe ledge

Move the base controller snapshot into a shared controller-state kit so traversal course, medevac, stealth extraction, locomotion readability, and camera composition all consume one canonical state export instead of each entry normalizing the snapshot independently.
