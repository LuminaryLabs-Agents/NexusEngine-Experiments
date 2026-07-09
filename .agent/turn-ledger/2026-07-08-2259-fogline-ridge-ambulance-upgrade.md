# 2026-07-08 22:59 - Fogline Relay ridge ambulance readiness upgrade

## Summary

Upgraded `experiments/fogline-relay/` after the latest completed ledger showed `experiments/nexus-frontier-signal-isles/` lighthouse evacuation work. This run intentionally chose a different route and added a ridge ambulance objective layer: injured runner beacons, triage sash routes, stretcher caches, oxygen lanterns, medic radio pings, ambulance gate windows, and fog-gap pressure warnings.

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

- The latest completed ledger read was `experiments/nexus-frontier-signal-isles/`, so this run avoided repeating that route.
- Fogline Relay is a compact 5-8 minute route with first-person movement, scanning, relay repair, survivor rescue, storm evacuation, radio repair, and blackout recovery layers.
- It still benefits from a clearer human-stakes extraction loop because the core mechanic can otherwise feel like relay scanning plus overlays.
- The route already imports NexusEngine main via CDN through `experiments/fogline-relay/src/urls.js` and through descriptor-only overlays, making it a safe target for another atomic readiness domain.

## Last upgraded experiment

`experiments/nexus-frontier-signal-isles/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2228-signal-isles-lighthouse-evacuation-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey/basecamp | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, ridge ambulance extraction | Changed files do not import old NexusRealtime runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old NexusRealtime in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival arena | 3-8 minute loop | move, collect, horde, cure, evacuation | No changed-runtime audit in this run | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, conservation overlays | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
fogline-ridge-ambulance-readiness-domain
├─ casualty-location-domain
│  ├─ injured-runner-domain
│  │  └─ fogline-injured-runner-beacon-kit
│  └─ triage-sash-domain
│     └─ fogline-triage-sash-route-kit
├─ medical-supply-domain
│  ├─ stretcher-cache-domain
│  │  └─ fogline-stretcher-cache-kit
│  └─ oxygen-lantern-domain
│     └─ fogline-oxygen-lantern-kit
├─ extraction-handoff-domain
│  ├─ medic-radio-domain
│  │  └─ fogline-medic-radio-ping-kit
│  └─ ambulance-gate-domain
│     └─ fogline-ambulance-gate-window-kit
└─ renderer-handoff
   └─ fogline-ridge-ambulance-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `fogline-injured-runner-beacon-kit`
- `fogline-triage-sash-route-kit`
- `fogline-stretcher-cache-kit`
- `fogline-oxygen-lantern-kit`
- `fogline-medic-radio-ping-kit`
- `fogline-ambulance-gate-window-kit`
- `fogline-ridge-ambulance-renderer-handoff-kit`
- `fogline-ridge-ambulance-readiness-domain-kit`

Changed:

- Fogline Relay now loads `ridge-ambulance-readiness-entry.js` after the blackout recovery overlay.
- `GameHost.getRendererHandoff()` is patched by the new overlay to compose ridge ambulance descriptors after the existing handoff.
- `GameHost.getRidgeAmbulanceReadiness()` and `GameHost.getFoglineRidgeAmbulanceReadiness()` expose the new descriptor domain.
- Parent Fogline Relay Playwright/state smoke imports the new kit and CDN smoke tests.

## Files changed

- `experiments/fogline-relay/src/fogline-ridge-ambulance-kits.js`
- `experiments/fogline-relay/src/ridge-ambulance-readiness-entry.js`
- `experiments/fogline-relay/index.html`
- `tests/fogline-ridge-ambulance-readiness-kits-smoke.mjs`
- `tests/fogline-ridge-ambulance-cdn-state-input-smoke.mjs`
- `tests/fogline-relay-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2259-fogline-ridge-ambulance-upgrade.md`

## Tests added or changed

Added:

- `tests/fogline-ridge-ambulance-readiness-kits-smoke.mjs`
- `tests/fogline-ridge-ambulance-cdn-state-input-smoke.mjs`

Changed:

- `tests/fogline-relay-playwright-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic ridge ambulance kits.
- Renderer handoff policy.
- Descriptor counts.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in changed runtime entry.
- GameHost ridge ambulance accessor exposure.

## Validation results

Scratch validation performed before connector writes:

- `node --check /tmp/fogline-ridge-ambulance-kits.js` passed.
- `node --check /tmp/ridge-entry.js` passed.
- `node --check /tmp/fogline-ridge-ambulance-cdn-state-input-smoke.mjs` passed.
- The local scratch kit smoke passed all 10 intake cases.

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

- `experiments/fogline-relay/src/ridge-ambulance-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/fogline-relay/src/fogline-ridge-ambulance-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `tests/fogline-ridge-ambulance-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence.
- Existing legacy shared loader naming was preserved because it is part of the current gallery shell, not a changed runtime import to old NexusRealtime CDN.

## Manifest update

The route, entry, parent smoke, new tests, and this ledger now register the ridge ambulance pass. The canonical `experiments/domain-kit-cutover-manifest.json` is still a very large one-line JSON blob. I did not replace the whole file in this connector run because that would risk a destructive overwrite. The next safe ledge is to normalize the manifest to multi-line JSON and add `fogline-ridge-ambulance-readiness-domain-kit` to the Fogline Relay `domainCutover` list with status `ridge-ambulance-readiness-renderer-handoff-pass`.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable ridge ambulance logic renderer-neutral.
- Kept the overlay as presentation-only Canvas drawing against descriptors.
- Kept all descriptor groups serializable.
- Routed new validation through the existing Fogline Relay state/input smoke.

## Non-game handling

`experiments/fogline-relay/` is a small experience-driven web game route. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, then add `fogline-ridge-ambulance-readiness-domain-kit` cleanly. After that, run full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getFoglineRidgeAmbulanceReadiness()` after WASD, scan, turn, reset, and relay-repair inputs.
