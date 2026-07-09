# 2026-07-08 21:14 - High Fidelity Meadow night watch upgrade

## Summary

Upgraded `experiments/high-fidelity-meadow/` after the latest logged route activity showed `experiments/vr-platformer-board/` guardian bridge work. This run intentionally chose a different experiment and added a moonlit night-watch objective layer: lantern patrols, fox-pressure perimeter tracks, lamb shelter pockets, gate latch checks, dew pond reflections, and dawn rollcall ledgers.

## Chosen experiment

`experiments/high-fidelity-meadow/`

## Why it was chosen

- The latest logged upgraded experiment was `experiments/vr-platformer-board/`.
- High Fidelity Meadow remained one of the least goal-driven routes: visually rich, but mostly passive/open-ended after ecology, pasture, flock-safety, festival, and pollinator overlays.
- The route already imports NexusEngine main CDN in `src/main-aaa.js`, and the added overlay imports NexusEngine main CDN directly.
- The new pass improves procedural variation without moving reusable logic into Three.js, DOM, browser input, audio, asset loading, physics, or the frame loop.

## Last upgraded experiment

`experiments/vr-platformer-board/`

Latest observed changelog:

- `.agent/turn-ledger/2026-07-08-2044-vr-board-guardian-bridge-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug | No changed-runtime audit in this run | Yes via wrapper |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions | No changed-runtime audit in this run | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, exit, companion rescue | No old NexusRealtime runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, bivouac, ravine evacuation | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pasture overlays, pollinator rescue, night watch | No old NexusRealtime runtime CDN in changed files | Yes |
| `experiments/fogline-relay/` | Relay scanning route | 5-8 minute loop | movement, scan, relay repair/rescue | No changed-runtime audit in this run | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | harvest, build, cargo, storm, harbor relief | No changed-runtime audit in this run | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival arena | 3-8 minute loop | move, collect, horde, cure, evacuation | No changed-runtime audit in this run | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, conservation overlays | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
meadow-night-watch-readiness-domain
├─ dusk-patrol-domain
│  ├─ lantern-chain-domain
│  │  └─ meadow-lantern-patrol-chain-kit
│  └─ fox-pressure-domain
│     └─ meadow-fox-pressure-perimeter-kit
├─ flock-shelter-domain
│  ├─ lamb-shelter-domain
│  │  └─ meadow-lamb-shelter-pocket-kit
│  └─ gate-latch-domain
│     └─ meadow-gate-latch-checkpoint-kit
├─ dawn-recovery-domain
│  ├─ dew-pond-domain
│  │  └─ meadow-dew-pond-moon-reflection-kit
│  └─ dawn-rollcall-domain
│     └─ meadow-dawn-rollcall-ledger-kit
└─ renderer-handoff
   └─ meadow-night-watch-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `meadow-lantern-patrol-chain-kit`
- `meadow-fox-pressure-perimeter-kit`
- `meadow-lamb-shelter-pocket-kit`
- `meadow-gate-latch-checkpoint-kit`
- `meadow-dew-pond-moon-reflection-kit`
- `meadow-dawn-rollcall-ledger-kit`
- `meadow-night-watch-renderer-handoff-kit`
- `meadow-night-watch-readiness-domain-kit`

## Files changed

- `experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js`
- `experiments/high-fidelity-meadow/src/meadow-night-watch-entry.js`
- `experiments/high-fidelity-meadow/index.html`
- `tests/meadow-night-watch-readiness-kits-smoke.mjs`
- `tests/meadow-night-watch-cdn-state-input-smoke.mjs`
- `tests/high-fidelity-meadow-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2114-meadow-night-watch-upgrade.md`

## Tests added or changed

Added:

- `tests/meadow-night-watch-readiness-kits-smoke.mjs`
- `tests/meadow-night-watch-cdn-state-input-smoke.mjs`

Changed:

- `tests/high-fidelity-meadow-playwright-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic kits.
- Domain tree split.
- Renderer handoff contract.
- Descriptor counts.
- JSON serializability.
- Renderer-neutral ownership exclusions.
- Route loading and NexusEngine main CDN usage.

## Validation results

Scratch validation performed before pushing:

- `node --check experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js` passed.
- `node --check experiments/high-fidelity-meadow/src/meadow-night-watch-entry.js` passed.
- `node --check tests/meadow-night-watch-readiness-kits-smoke.mjs` passed.
- `node --check tests/meadow-night-watch-cdn-state-input-smoke.mjs` passed.
- `node tests/meadow-night-watch-readiness-kits-smoke.mjs` passed all 10 intake cases.
- `node tests/meadow-night-watch-cdn-state-input-smoke.mjs` passed all 10 CDN/state/input cases.

Connector validation after pushing:

- GitHub accepted all file writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright run.

## NexusRealtime import audit

Changed files:

- `experiments/high-fidelity-meadow/src/meadow-night-watch-readiness-kits.js`: no old NexusRealtime runtime CDN import.
- `experiments/high-fidelity-meadow/src/meadow-night-watch-entry.js`: imports NexusEngine main CDN and does not import old NexusRealtime runtime CDN.
- `tests/meadow-night-watch-readiness-kits-smoke.mjs`: no old NexusRealtime runtime CDN import.
- `tests/meadow-night-watch-cdn-state-input-smoke.mjs`: explicitly checks that the changed entry does not include `LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.

Route shell:

- `experiments/high-fidelity-meadow/src/main-aaa.js` already imports NexusEngine main CDN:
  `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- `experiments/high-fidelity-meadow/index.html` now loads `meadow-night-watch-entry.js?v=20260708-night-watch-readiness-1`.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept renderer logic in the existing WebGL host and overlay presentation.
- Kept reusable logic in the new renderer-neutral kit file.
- Kept all descriptor groups serializable.
- Kept the overlay as a descriptor consumer and `GameHost` accessor patch.
- Left the existing manifest line untouched in this pass because the route, parent smoke, and changelog now record the new readiness layer; a later manifest normalization pass can fold the status text into the single-line canonical manifest safely.

## Non-game handling

`experiments/high-fidelity-meadow/` is a small experience-driven web scene, not a non-game artifact. No delete, rename, or destructive refactor was needed.

## Next safe ledge

The next safe step is a tiny renderer presentation pass that draws subtle, low-cost night-watch descriptor glyphs in the meadow WebGL scene: lantern halos, fox perimeter rings, straw shelter pools, gate checks, silver dew points, and dawn ledger chips. Keep all truth in the domain descriptors and let the renderer consume positions only.
