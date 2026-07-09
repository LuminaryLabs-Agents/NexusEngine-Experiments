# 2026-07-09 12:30 EDT - The Open Above Thermal Courier Rescue Upgrade

## Chosen experiment

`experiments/the-open-above/`

## Why this was chosen

The latest commit stream before this run showed `experiments/tiny-diffusion-lab/` had just been upgraded with the repair mural entry, so this run intentionally chose a different experiment.

`The Open Above` was a good target because it already had flight, terrain streaming, and several descriptor overlays, but the player-facing route still read as a passive scenic flight stack. The added thermal courier rescue layer gives it clearer objective pressure and visual variation without moving reusable logic into renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership.

## Last upgraded experiment

`experiments/tiny-diffusion-lab/`

Latest commit evidence before this run:

```txt
7cf7f0dfc1ccedf59444a4b3f36ed043c521e663
Wire Tiny Diffusion repair mural entry
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Multi-page scene transition story proof with inventory/gates and route overlays. | 2-4 minutes. | Scene exits, small puzzle tokens, clue/readiness overlays. | No old runtime import in latest overlay files audited in prior runs. | Yes, through overlay entries. |
| `experiments/vr-platformer-board/` | Board-scale platformer proof. | 1-3 minutes. | A/D movement, jump, coins, hazards, exit/rescue overlays. | No old runtime import in changed medevac route. | Yes, in medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | Endless/free-flight. | WASD flight, LOD terrain rings, survey/readiness descriptors. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene. | Passive/exploration slice. | Grass, flowers, sheep, ecology/restoration overlays. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab. | Lab session length. | Prepare/train/generate/checkpoint and readiness overlays. | No old runtime import in latest repair mural entry. | Yes, in latest repair mural entry. |
| `experiments/living-agent-lab/` | Small agent/market lab. | 2-5 minutes. | Market trust, agent/fallback actions, civic festival descriptors. | No old runtime import in changed civic entry. | Yes, in civic entry. |
| `experiments/fogline-relay/` | First-person fog relay route. | 3-6 minutes. | Movement, scanning, relay objectives, evacuation overlays. | Old route-shell loader removed during prior courier pass. | Yes, in changed courier entry. |
| `experiments/nexus-frontier-signal-isles/` | Broad field-engineer kit showcase. | 4-8 minutes. | Scan, harvest, build, cargo, storm/relief overlays. | No old runtime import in latest stormbreak entry. | Yes, in overlay entries. |
| `apps/the-cavalry-of-rome/` | Roman campaign-map visual proof. | 3-5 minutes. | Pannable map, hover regions, cinematic zoom, logistics overlays. | No old runtime import in latest overlays. | Yes, in overlay entries. |
| `games/signal-bastion/` | Tower-defense route. | 10-20 minutes. | Tower placement, waves, upgrades, supply/rebuild overlays. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 5-10 minutes. | Block carrying, pressure valves, gates, rescue/drainage overlays. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 3-7 minutes. | Grapple, swing, ledges, cargo/rescue overlays. | No old runtime import in current route wrapper. | Yes, in route wrapper and overlays. |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/preview lane. | Short preview or free-flight handoff. | Flight preview, launch/flightplan/readiness overlays. | Legacy redirect preserved, current overlays use NexusEngine. | Yes, in overlay entries. |
| `experiments/zombie-orchard/` | Survival orchard slice. | 5-12 minutes. | Movement, collection, waves, crafting/rescue overlays. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `games/rogue-lite-hellscape-siege/` | Action-defense-extraction route. | 10-20 minutes. | Harvest, inventory, build, portal/wave defense, covenant overlays. | No old runtime import in changed overlays. | Yes, in overlay entries. |
| `experiments/onnx-agent-lab/` | ONNX/fallback workshop route. | Lab session length. | Model handshake, fallback, tool cues, memory/open-scene gate. | No old runtime import in changed signal-calibration route. | Yes, in signal-calibration entry. |
| `experiments/the-open-above/` | High-altitude flight route over streaming terrain. | Endless/free-flight. | Assisted flight, procedural terrain patches, flock/sky, courier/shelter/clinic overlays. | The changed shell removed the old `nexus-realtime-page-loader` import; existing ProtoKits base URL still references `NexusRealtime-ProtoKits@0.0.1`, but not the old runtime CDN. | Yes, config and new entry use NexusEngine main CDN. |
| `experiments/tropical-island-scene/` | Tropical island scene. | Passive/exploration slice. | Orbit camera, fish/coconut scene, reef/shelter/purification overlays. | Older island/water stack remains; changed overlays use NexusEngine. | Yes, in overlay entries. |
| `experiments/cozy-island/` | Cozy island/cloudbar route. | Passive/exploration slice. | Island generation, campfire/smoke/grass/clouds, comfort/hatchery overlays. | Legacy cloudbar route still references older ProtoKit lineage; changed overlays use NexusEngine. | Yes, in changed overlays. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation. | Test route length. | WASD, jump/reset/debug, camera/controller/readiness overlays. | No old runtime import in changed overlay files. | Yes, in overlay entries. |

## Domain ASCII tree

```txt
open-above-thermal-courier-rescue-readiness-domain
├─ thermal-route-domain
│  ├─ lantern-ring-domain
│  │  └─ open-above-thermal-lantern-ring-kit
│  └─ draft-ribbon-domain
│     └─ open-above-draft-ribbon-lane-kit
├─ basket-cargo-domain
│  ├─ sling-cargo-domain
│  │  └─ open-above-basket-sling-cargo-kit
│  └─ anchor-buoy-domain
│     └─ open-above-landing-anchor-buoy-kit
├─ rescue-signal-domain
│  ├─ signal-mirror-domain
│  │  └─ open-above-cliff-signal-mirror-kit
│  └─ dawn-flight-ledger-domain
│     └─ open-above-dawn-flight-ledger-kit
└─ renderer-handoff
   └─ open-above-thermal-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `open-above-thermal-lantern-ring-kit`
- `open-above-draft-ribbon-lane-kit`
- `open-above-basket-sling-cargo-kit`
- `open-above-landing-anchor-buoy-kit`
- `open-above-cliff-signal-mirror-kit`
- `open-above-dawn-flight-ledger-kit`
- `open-above-thermal-courier-renderer-handoff-kit`
- `open-above-thermal-courier-rescue-readiness-domain-kit`

Changed route integration:

- Added `open-above-thermal-courier-entry.js`
- Updated `index.html` to load the new pass.
- Removed the old `nexus-realtime-page-loader` route-shell import from the changed HTML.

## Files changed

```txt
experiments/the-open-above/index.html
experiments/the-open-above/open-above-thermal-courier-readiness-kits.js
experiments/the-open-above/open-above-thermal-courier-entry.js
tests/open-above-thermal-courier-readiness-kits-smoke.mjs
tests/open-above-thermal-courier-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-1230-open-above-thermal-courier-upgrade.md
```

## Tests added

```txt
tests/open-above-thermal-courier-readiness-kits-smoke.mjs
tests/open-above-thermal-courier-cdn-state-input-smoke.mjs
```

## Validation results

Local scratch validation passed before pushing:

```txt
node --check experiments/the-open-above/open-above-thermal-courier-readiness-kits.js
node --check experiments/the-open-above/open-above-thermal-courier-entry.js
node --check tests/open-above-thermal-courier-readiness-kits-smoke.mjs
node --check tests/open-above-thermal-courier-cdn-state-input-smoke.mjs
node tests/open-above-thermal-courier-readiness-kits-smoke.mjs
node tests/open-above-thermal-courier-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Open Above thermal courier readiness kits smoke passed 10 intake cases.
Open Above thermal courier CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
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

- `open-above-thermal-courier-readiness-kits.js`: no NexusRealtime import.
- `open-above-thermal-courier-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `index.html`: removed `../_shared/nexus-realtime-page-loader.js`.
- New tests: assert the entry uses NexusEngine main CDN and the changed route shell no longer contains `nexus-realtime-page-loader`.

Existing unchanged context:

- `open-above.config.js` still references `LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits` as an old ProtoKits base URL. This is not the old NexusRealtime runtime CDN. It was not migrated in this run because doing so would require validating every imported ProtoKit module path used by the base flight stack.

## Cleanup pass

- Kept reusable kit logic pure and deterministic.
- Did not add route forks.
- Did not delete useful functionality.
- Removed the changed route shell's old page-loader import.
- Kept DOM overlay and GameHost patching in the entry file, not the reusable kit.
- Kept renderer handoff descriptor-only.

## Non-game handling

`The Open Above` is a small experience-driven browser route, so no delete/refactor/rename was needed.

## Next safe ledge

Migrate the unchanged `open-above.config.js` ProtoKit base URL away from `NexusRealtime-ProtoKits@0.0.1` only after confirming the same kit folder names exist under the intended NexusEngine/ProtoKits source and after adding a base-flight smoke that imports those exact CDN paths.
