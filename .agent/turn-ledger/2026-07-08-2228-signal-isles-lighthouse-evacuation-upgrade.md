# 2026-07-08 22:28 - Signal Isles lighthouse evacuation readiness upgrade

## Summary

Upgraded `experiments/nexus-frontier-signal-isles/` after the latest completed ledger showed `experiments/ThirdPersonFollowThrough/` medevac work. This run intentionally chose a different route and added a lighthouse evacuation objective layer: stranded keeper beacons, lantern fuel caches, reef gap windows, rescue boat channels, foghorn signals, and evacuation rosters.

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

- The latest completed ledger I read was `experiments/ThirdPersonFollowThrough/`, so this run avoided repeating that route.
- Signal Isles is still a compact 5-10 minute first-person frontier survival route with scanning, harvesting, mast building, route unlocking, cargo delivery, storm readiness, and harbor relief.
- It already imports NexusEngine main via CDN in the runtime, making it a safe candidate for deeper descriptor-only domain fractalization.
- The new pass adds stronger human stakes and more visible procedural variety without moving reusable logic into renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.

## Last upgraded experiment

`experiments/ThirdPersonFollowThrough/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2147-third-person-medevac-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in changed files | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey/basecamp | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning route | 5-8 minute loop | movement, scan, relay repair/rescue/blackout | No changed-runtime audit in this run | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old NexusRealtime in changed files | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival arena | 3-8 minute loop | move, collect, horde, cure, evacuation | No changed-runtime audit in this run | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, conservation overlays | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
signal-isles-lighthouse-evacuation-readiness-domain
├─ keeper-safety-domain
│  ├─ stranded-keeper-domain
│  │  └─ signal-isles-stranded-keeper-beacon-kit
│  └─ lantern-fuel-domain
│     └─ signal-isles-lantern-fuel-cache-kit
├─ tide-route-domain
│  ├─ reef-gap-domain
│  │  └─ signal-isles-reef-gap-window-kit
│  └─ rescue-boat-domain
│     └─ signal-isles-rescue-boat-channel-kit
├─ night-handoff-domain
│  ├─ foghorn-signal-domain
│  │  └─ signal-isles-foghorn-signal-kit
│  └─ evacuation-roster-domain
│     └─ signal-isles-evacuation-roster-kit
└─ renderer-handoff
   └─ signal-isles-lighthouse-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `signal-isles-stranded-keeper-beacon-kit`
- `signal-isles-lantern-fuel-cache-kit`
- `signal-isles-reef-gap-window-kit`
- `signal-isles-rescue-boat-channel-kit`
- `signal-isles-foghorn-signal-kit`
- `signal-isles-evacuation-roster-kit`
- `signal-isles-lighthouse-evacuation-renderer-handoff-kit`
- `signal-isles-lighthouse-evacuation-readiness-domain-kit`

Changed:

- Signal Isles composition now instantiates `createSignalIslesLighthouseEvacuationReadinessDomainKit()`.
- `getRendererHandoff()` now merges lighthouse evacuation descriptor buckets into the composed renderer handoff.
- `getState()` and `getRenderSnapshot()` now expose `lighthouseEvacuationReadiness` and `domain.signalIslesLighthouseEvacuationReadiness`.
- Debug host now exposes `getLighthouseEvacuationReadinessState()`.
- Three renderer now consumes lighthouse descriptors with existing disc/ring/thread primitives only.
- Parent Signal Isles smoke now routes both new lighthouse validation files.

## Files changed

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-lighthouse-evacuation-readiness-domain-kits.js`
- `experiments/nexus-frontier-signal-isles/src/game-composition.js`
- `experiments/nexus-frontier-signal-isles/src/debug-host.js`
- `experiments/nexus-frontier-signal-isles/src/main.js`
- `experiments/nexus-frontier-signal-isles/src/renderer.js`
- `experiments/nexus-frontier-signal-isles/index.html`
- `tests/signal-isles-lighthouse-evacuation-readiness-kits-smoke.mjs`
- `tests/signal-isles-lighthouse-evacuation-cdn-state-input-smoke.mjs`
- `tests/signal-isles-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2228-signal-isles-lighthouse-evacuation-upgrade.md`

## Tests added or changed

Added:

- `tests/signal-isles-lighthouse-evacuation-readiness-kits-smoke.mjs`
- `tests/signal-isles-lighthouse-evacuation-cdn-state-input-smoke.mjs`

Changed:

- `tests/signal-isles-playwright-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic lighthouse evacuation kits.
- Renderer handoff policy.
- Descriptor counts.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in changed runtime files.
- `GameHost` lighthouse evacuation accessor exposure.

## Validation results

Scratch validation performed before final log:

- `node --check experiments/_kits/nexus-frontier-signal-isles/signal-isles-lighthouse-evacuation-readiness-domain-kits.js` passed in local scratch.
- `node --check experiments/nexus-frontier-signal-isles/src/game-composition.js` passed in local scratch.
- `node --check experiments/nexus-frontier-signal-isles/src/debug-host.js` passed in local scratch.
- `node --check experiments/nexus-frontier-signal-isles/src/main.js` passed in local scratch.
- `node --check experiments/nexus-frontier-signal-isles/src/renderer.js` passed in local scratch.
- `node --check tests/signal-isles-lighthouse-evacuation-readiness-kits-smoke.mjs` passed in local scratch.
- `node --check tests/signal-isles-lighthouse-evacuation-cdn-state-input-smoke.mjs` passed in local scratch.
- `node --check tests/signal-isles-playwright-state-input-smoke.mjs` passed in local scratch.
- New kit smoke passed all 10 intake cases in local scratch with a minimal Signal Isles level stub.

Connector validation:

- GitHub accepted all writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright run.

## NexusRealtime import audit

Changed files:

- `experiments/nexus-frontier-signal-isles/src/main.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-lighthouse-evacuation-readiness-domain-kits.js`: no old runtime CDN import and no DOM/window/Three/WebGL ownership.
- `tests/signal-isles-lighthouse-evacuation-cdn-state-input-smoke.mjs`: explicitly checks the changed runtime uses NexusEngine main CDN and does not import old NexusRealtime main CDN.
- Existing legacy bridge pockets elsewhere were preserved and not destructively rewritten.

## Manifest update

The route, runtime, renderer, debug host, parent smoke, new tests, and this ledger now register the lighthouse evacuation pass. The canonical `experiments/domain-kit-cutover-manifest.json` remains a very large one-line JSON blob; safely adding `signal-isles-lighthouse-evacuation-readiness-domain-kit` through the available connector would require replacing the entire file. I avoided an unlogged destructive full-file manifest overwrite and logged the manifest normalization as the next safe ledge.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable lighthouse evacuation logic renderer-neutral.
- Kept the renderer as a descriptor consumer only.
- Reused existing renderer primitives instead of moving gameplay truth into Three.js.
- Kept all descriptor groups serializable.
- Routed new validation through the existing Signal Isles state/input smoke.

## Non-game handling

`experiments/nexus-frontier-signal-isles/` is a small experience-driven web game route. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON and add `signal-isles-lighthouse-evacuation-readiness-domain-kit` cleanly. After that, add a browser Playwright pass that boots the route and checks `window.GameHost.getLighthouseEvacuationReadinessState()` after WASD, scan, interact, build, and reset inputs.
