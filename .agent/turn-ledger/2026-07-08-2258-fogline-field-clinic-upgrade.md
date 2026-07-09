# 2026-07-08 22:58 - Fogline Relay field clinic readiness upgrade

## Summary

Upgraded `experiments/fogline-relay/` with a field clinic evacuation objective layer. The new pass adds triage beacons, oxygen caches, stretcher lanes, medic shelter pockets, ambulance route signals, and dawn clinic ledger descriptors. Reusable kit logic stays renderer-neutral; the route overlay imports NexusEngine main via CDN and only consumes descriptor handoffs.

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

- The latest completed ledger read at the start of this run was `.agent/turn-ledger/2026-07-08-2228-signal-isles-lighthouse-evacuation-upgrade.md`.
- That latest completed ledger upgraded `experiments/nexus-frontier-signal-isles/`, so this run avoided repeating Signal Isles.
- Fogline Relay is a compact 5-8 minute relay repair route with strong atmosphere but still benefits from a clearer human-stakes care objective layered over scan, relay, blackout, and ambulance guidance.
- During the run, the current route was found to already contain a `ridge-ambulance-readiness-renderer-handoff-pass` in `index.html`; that work was preserved rather than overwritten.
- The new field clinic pass increases visual variation through triage, oxygen, stretcher, shelter, ambulance, and dawn ledger descriptor groups without moving reusable truth into DOM, renderer, Three.js, WebGL, browser input, audio, assets, physics, or the frame loop.

## Last upgraded experiment

Latest completed ledger read:

- `experiments/nexus-frontier-signal-isles/`
- `.agent/turn-ledger/2026-07-08-2228-signal-isles-lighthouse-evacuation-upgrade.md`

Current route state also showed a pre-existing, unmodified Fogline `ridge-ambulance-readiness-renderer-handoff-pass`; this run preserved it and added field clinic readiness after it.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent changed files | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey/basecamp | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, survivor rescue, storm evacuation, radio repair, blackout recovery, ridge ambulance, field clinic | No old NexusRealtime runtime CDN in changed field clinic files | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old NexusRealtime in recent changed files | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival arena | 3-8 minute loop | move, collect, horde, cure, evacuation | No changed-runtime audit in this run | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, conservation overlays | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
fogline-field-clinic-readiness-domain
├─ patient-triage-domain
│  ├─ triage-beacon-domain
│  │  └─ fogline-triage-beacon-kit
│  └─ oxygen-cache-domain
│     └─ fogline-oxygen-cache-kit
├─ safe-transfer-domain
│  ├─ stretcher-lane-domain
│  │  └─ fogline-stretcher-lane-kit
│  └─ medic-shelter-domain
│     └─ fogline-medic-shelter-pocket-kit
├─ extraction-clinic-domain
│  ├─ ambulance-route-domain
│  │  └─ fogline-ambulance-route-signal-kit
│  └─ dawn-clinic-domain
│     └─ fogline-dawn-clinic-ledger-kit
└─ renderer-handoff
   └─ fogline-field-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `fogline-triage-beacon-kit`
- `fogline-oxygen-cache-kit`
- `fogline-stretcher-lane-kit`
- `fogline-medic-shelter-pocket-kit`
- `fogline-ambulance-route-signal-kit`
- `fogline-dawn-clinic-ledger-kit`
- `fogline-field-clinic-renderer-handoff-kit`
- `fogline-field-clinic-readiness-domain-kit`

Changed:

- Fogline route now advertises `field-clinic-readiness-renderer-handoff-pass`.
- Fogline route now loads `field-clinic-readiness-entry.js?v=fogline-field-clinic-readiness-1`.
- Fogline parent state/input smoke now imports both new field clinic smoke files.
- Fogline parent state/input smoke now waits for `GameHost.getFoglineFieldClinicReadiness()`.
- Fogline parent state/input smoke validates `fieldClinicDescriptorCount`.

## Files changed

- `experiments/fogline-relay/src/fogline-field-clinic-kits.js`
- `experiments/fogline-relay/src/field-clinic-readiness-entry.js`
- `experiments/fogline-relay/index.html`
- `tests/fogline-field-clinic-readiness-kits-smoke.mjs`
- `tests/fogline-field-clinic-cdn-state-input-smoke.mjs`
- `tests/fogline-relay-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2258-fogline-field-clinic-upgrade.md`

## Tests added or changed

Added:

- `tests/fogline-field-clinic-readiness-kits-smoke.mjs`
- `tests/fogline-field-clinic-cdn-state-input-smoke.mjs`

Changed:

- `tests/fogline-relay-playwright-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- Domain tree exposure.
- All six atomic field clinic kits.
- Descriptor-only renderer handoff.
- Descriptor counts.
- JSON serializability.
- Renderer-neutral ownership boundaries.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed entry.
- GameHost field clinic accessor exposure.
- Parent Fogline route smoke import routing.

## Validation results

Scratch validation performed before connector writes:

- `node --check fogline-field-clinic-kits.js` passed in local scratch.
- `node --check field-clinic-readiness-entry.js` passed in local scratch.
- `node --check fogline-field-clinic-readiness-kits-smoke.mjs` passed in local scratch.
- `node --check fogline-field-clinic-cdn-state-input-smoke.mjs` passed in local scratch.
- `node tests/fogline-field-clinic-readiness-kits-smoke.mjs` passed all 10 intake cases in local scratch.
- `node tests/fogline-field-clinic-cdn-state-input-smoke.mjs` passed all 10 CDN/state/input cases in local scratch.
- `node --check tests/fogline-relay-playwright-state-input-smoke.mjs` passed in local scratch.

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

- `experiments/fogline-relay/src/field-clinic-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/fogline-relay/src/fogline-field-clinic-kits.js`: no old runtime CDN import and no DOM/window/Three/WebGL ownership.
- `tests/fogline-field-clinic-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN import and old NexusRealtime runtime CDN absence.
- `experiments/fogline-relay/index.html`: preserved existing route scripts and added the field clinic entry after ridge ambulance.
- Existing legacy bridge pockets elsewhere were preserved and not destructively rewritten.

## Manifest update

The route, new entry, new kits, parent smoke, new tests, and this ledger now register the field clinic pass. `experiments/domain-kit-cutover-manifest.json` remains a very large one-line JSON blob and was not rewritten in this connector pass; the next safe ledge should normalize it into multi-line JSON and add `fogline-field-clinic-readiness-domain-kit` cleanly.

## Cleanup pass

- Preserved existing `ridge-ambulance-readiness-renderer-handoff-pass`.
- Preserved existing blackout, radio repair, storm evacuation, and survivor rescue passes.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable field clinic logic renderer-neutral.
- Kept the overlay as a presentation-only descriptor consumer.
- Kept descriptor groups serializable.
- Routed field clinic validation through the existing Fogline state/input smoke.

## Non-game handling

`experiments/fogline-relay/` is a small experience-driven web game route. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON and add `fogline-field-clinic-readiness-domain-kit` cleanly. After that, run a browser Playwright pass that boots Fogline and checks `window.GameHost.getFoglineFieldClinicReadiness()` after WASD, scan, turn, restart, and relay repair input sequences.
