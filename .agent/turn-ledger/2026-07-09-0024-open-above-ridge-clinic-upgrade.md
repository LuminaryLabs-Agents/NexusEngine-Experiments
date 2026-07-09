# 2026-07-09 00:24 - The Open Above ridge clinic readiness upgrade

## Summary

Upgraded `experiments/the-open-above/` after the latest completed ledger showed `experiments/infinite-radial-terrain/` observatory evacuation work. This run intentionally chose a different route and added a ridge clinic landing objective layer: windsock landing strips, rope guide lanes, oxygen crate caches, stretcher circle markers, clinic flare triads, and dawn transfer roster slots.

## Chosen experiment

`experiments/the-open-above/`

## Why it was chosen

- The latest completed ledger at run start was `experiments/infinite-radial-terrain/`, so this run avoided repeating that route.
- The Open Above remains an open-ended aerial route with strong flight and terrain presence, but it still benefits from stronger finite objective pressure.
- The ridge clinic layer adds a concrete rescue/landing decision loop without moving reusable state truth into the renderer.
- The route already imports NexusEngine main CDN through its runtime config and prior overlays.
- A concurrent alpine clinic pass was already present by the time the route shell was updated, so this run preserved it and appended the ridge clinic pass instead of overwriting it.

## Last upgraded experiment

`experiments/infinite-radial-terrain/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2345-infinite-terrain-observatory-evacuation-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent overlays | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, expedition, survey contract, basecamp, avalanche rescue, observatory evacuation | No old runtime CDN in changed files | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird/balloon-style flight, terrain streaming, courier, shelter, alpine clinic, ridge clinic overlays | Changed ridge clinic entry imports NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, clinic/ambulance overlays | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed well entry imports NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, castaway comfort, tidepool, turtle hatchery, lagoon lantern rescue | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
open-above-ridge-clinic-readiness-domain
├─ landing-safety-domain
│  ├─ windsock-strip-domain
│  │  └─ open-above-windsock-landing-strip-kit
│  └─ rope-guide-domain
│     └─ open-above-rope-guide-lane-kit
├─ patient-support-domain
│  ├─ oxygen-cache-domain
│  │  └─ open-above-oxygen-crate-cache-kit
│  └─ stretcher-circle-domain
│     └─ open-above-stretcher-circle-marker-kit
├─ extraction-clinic-domain
│  ├─ clinic-flare-domain
│  │  └─ open-above-clinic-flare-triad-kit
│  └─ dawn-transfer-domain
│     └─ open-above-dawn-transfer-roster-kit
└─ renderer-handoff
   └─ open-above-ridge-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `open-above-windsock-landing-strip-kit`
- `open-above-rope-guide-lane-kit`
- `open-above-oxygen-crate-cache-kit`
- `open-above-stretcher-circle-marker-kit`
- `open-above-clinic-flare-triad-kit`
- `open-above-dawn-transfer-roster-kit`
- `open-above-ridge-clinic-renderer-handoff-kit`
- `open-above-ridge-clinic-readiness-domain-kit`

Changed:

- `experiments/the-open-above/` now loads `open-above-ridge-clinic-entry.js` after the existing alpine clinic pass.
- `GameHost.getRendererHandoff()` is patched by the new overlay to compose `openAboveRidgeClinic` descriptors after existing handoffs.
- `GameHost.getRidgeClinicReadiness()` and `GameHost.getOpenAboveRidgeClinicReadiness()` expose the new ridge clinic descriptor domain.
- The route shell advertises `ridge-clinic-readiness-renderer-handoff-pass`.
- The Open Above parent Playwright/state smoke now imports the ridge clinic kit and CDN/state smoke files and checks `getRidgeClinicReadiness()`.

## Files changed

- `experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js`
- `experiments/the-open-above/open-above-ridge-clinic-entry.js`
- `experiments/the-open-above/index.html`
- `tests/open-above-ridge-clinic-readiness-kits-smoke.mjs`
- `tests/open-above-ridge-clinic-cdn-state-input-smoke.mjs`
- `tests/open-above-playwright-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0024-open-above-ridge-clinic-upgrade.md`

## Tests added

- `tests/open-above-ridge-clinic-readiness-kits-smoke.mjs`
- `tests/open-above-ridge-clinic-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic ridge clinic kits.
- Descriptor counts.
- Renderer handoff policy.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed runtime entry.
- GameHost ridge clinic accessor exposure.
- Parent Open Above smoke routing.

## Validation results

Scratch validation performed before connector writes:

- `node --check experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js` passed.
- `node --check experiments/the-open-above/open-above-ridge-clinic-entry.js` passed.
- `node --check tests/open-above-ridge-clinic-readiness-kits-smoke.mjs` passed.
- `node --check tests/open-above-ridge-clinic-cdn-state-input-smoke.mjs` passed.
- `node --check tests/open-above-playwright-cdn-state-input-smoke.mjs` passed after adding ridge clinic imports/assertions to the parent smoke shape.
- `node tests/open-above-ridge-clinic-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/open-above-ridge-clinic-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

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

- `experiments/the-open-above/open-above-ridge-clinic-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/the-open-above/open-above-ridge-clinic-readiness-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `tests/open-above-ridge-clinic-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence.
- Existing shared page loader and older ProtoKit URLs were preserved because they are gallery/legacy shell compatibility, not new runtime drift.

## Cleanup pass

- Preserved the existing alpine clinic pass discovered during the run.
- Appended ridge clinic instead of replacing any active route script.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable ridge clinic logic renderer-neutral.
- Kept the overlay as presentation-only rendering against descriptors.
- Kept all descriptor groups serializable.
- Did not rewrite the large one-line manifest in this pass.

## Non-game handling

`experiments/the-open-above/` is an open-ended flight route rather than a compact finite web game. It was not deleted or renamed because it proves useful flight, terrain streaming, camera, sky, and descriptor-handoff functionality. The lesson is that objective overlays can add high-stakes rescue pressure while preserving the flight renderer and keeping reusable logic as deterministic descriptor kits.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, add `open-above-ridge-clinic-readiness-domain-kit` to The Open Above, and run full `npm run check`, `npm run check:deploy`, and browser Playwright validation for `window.GameHost.getOpenAboveRidgeClinicReadiness()` plus `window.GameHost.getRendererHandoff().counts.openAboveRidgeClinic` after route load.
