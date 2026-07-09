# 2026-07-08 21:47 - Third Person medevac readiness upgrade

## Summary

Upgraded `experiments/ThirdPersonFollowThrough/` after the latest repository activity showed `experiments/peer-scene-transition/` archive escort work. This run intentionally chose a different route and added a medevac objective layer: casualty beacons, vital-sign ribbons, safe cover corridors, signal flares, stretcher pickup zones, and evacuation timing.

## Chosen experiment

`experiments/ThirdPersonFollowThrough/`

## Why it was chosen

- The latest observed repo commits were for `experiments/peer-scene-transition/` archive escort readiness, so this run avoided repeating that route.
- Third Person Follow Through is still a compact controller lab with movement, camera, debug rays, arena, navigation, and stealth extraction overlays, but it needed a more human-stakes objective layer.
- The route already loads through the NexusEngine main CDN path, so the new medevac domain could safely compose into the existing `GameHost` renderer handoff.
- The pass adds visible procedural variety without moving reusable kit logic into DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.

## Last upgraded experiment

`experiments/peer-scene-transition/`

Latest observed commits:

- `d6b3079919328984b4751bdaf80c21a1fac7d15a` - `Add peer scene archive escort CDN state smoke`
- `02ba5c400b4deb91613ca50fb8cfa1781c409fcd` - `Add peer scene archive escort kit smoke`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in changed files | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive escort | No old runtime CDN in recent archive files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
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
third-person-medevac-readiness-domain
├─ casualty-triage-domain
│  ├─ casualty-beacon-domain
│  │  └─ third-person-casualty-beacon-kit
│  └─ vital-sign-domain
│     └─ third-person-vital-sign-ribbon-kit
├─ route-safety-domain
│  ├─ cover-corridor-domain
│  │  └─ third-person-cover-corridor-kit
│  └─ signal-flare-domain
│     └─ third-person-signal-flare-kit
├─ extraction-handoff-domain
│  ├─ stretcher-pickup-domain
│  │  └─ third-person-stretcher-pickup-kit
│  └─ evacuation-timer-domain
│     └─ third-person-evacuation-timer-kit
└─ renderer-handoff
   └─ third-person-medevac-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-casualty-beacon-kit`
- `third-person-vital-sign-ribbon-kit`
- `third-person-cover-corridor-kit`
- `third-person-signal-flare-kit`
- `third-person-stretcher-pickup-kit`
- `third-person-evacuation-timer-kit`
- `third-person-medevac-renderer-handoff-kit`
- `third-person-medevac-readiness-domain-kit`

Changed:

- `tests/third-person-stealth-extraction-cdn-state-input-smoke.mjs` now imports the medevac kit smoke and CDN/state/input smoke so existing Third Person smoke routing executes the new checks.

## Files changed

- `experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js`
- `experiments/ThirdPersonFollowThrough/app/medevac-readiness-entry.js`
- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/index.html`
- `tests/third-person-medevac-readiness-kits-smoke.mjs`
- `tests/third-person-medevac-cdn-state-input-smoke.mjs`
- `tests/third-person-stealth-extraction-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2147-third-person-medevac-upgrade.md`

## Tests added or changed

Added:

- `tests/third-person-medevac-readiness-kits-smoke.mjs`
- `tests/third-person-medevac-cdn-state-input-smoke.mjs`

Changed:

- `tests/third-person-stealth-extraction-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic medevac kits.
- Renderer handoff policy.
- Descriptor counts.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in changed files.
- `GameHost` medevac accessors.

## Validation results

Scratch validation performed before pushing:

- `node --check experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js` passed.
- `node --check experiments/ThirdPersonFollowThrough/app/medevac-readiness-entry.js` passed.
- `node --check tests/third-person-medevac-readiness-kits-smoke.mjs` passed.
- `node --check tests/third-person-medevac-cdn-state-input-smoke.mjs` passed.
- `node tests/third-person-medevac-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/third-person-medevac-cdn-state-input-smoke.mjs` passed all 10 CDN/state/input cases in scratch.

Connector validation after pushing:

- GitHub accepted all writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright run.

## NexusRealtime import audit

Changed files:

- `experiments/ThirdPersonFollowThrough/kits/third-person-medevac-readiness-domain-kit.js`: no old NexusRealtime runtime CDN import.
- `experiments/ThirdPersonFollowThrough/app/medevac-readiness-entry.js`: imports NexusEngine main CDN and does not import old NexusRealtime runtime CDN.
- `tests/third-person-medevac-readiness-kits-smoke.mjs`: no old NexusRealtime runtime CDN import.
- `tests/third-person-medevac-cdn-state-input-smoke.mjs`: explicitly checks that changed medevac files do not include `LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.

Route shell:

- `experiments/ThirdPersonFollowThrough/app/index.js` now imports `./medevac-readiness-entry.js?v=medevac-readiness-v1`.
- `experiments/ThirdPersonFollowThrough/index.html` advertises `data-third-person-medevac="medevac-readiness-renderer-handoff-pass"` while preserving the existing stealth extraction route marker.

## Manifest update

The canonical one-line manifest already registers the Third Person route and existing Third Person domain stack, but this connector pass did not safely rewrite `experiments/domain-kit-cutover-manifest.json` because the available file update action requires replacing the complete one-line JSON blob. To avoid an unlogged destructive manifest overwrite, the medevac pass is logged here and routed through the existing Third Person CDN/state smoke. The next safe ledge is a manifest normalization pass that rewrites the canonical JSON with formatting and adds `third-person-medevac-readiness-domain-kit` cleanly.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept renderer logic in the overlay entry.
- Kept reusable medevac logic in a renderer-neutral kit file.
- Kept all descriptor groups serializable.
- Preserved existing stealth extraction checks and routed new medevac checks through them.

## Non-game handling

`experiments/ThirdPersonFollowThrough/` is a small experience-driven web controller experiment, not a non-game artifact. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON and add `third-person-medevac-readiness-domain-kit` to the Third Person route without risking a one-line manifest overwrite. After that, add a small real controller-state Playwright pass that checks `GameHost.getThirdPersonMedevacReadiness()` after WASD, jump, and reset inputs.
