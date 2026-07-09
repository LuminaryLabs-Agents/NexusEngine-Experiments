# 2026-07-08 23:13 - Zombie Orchard well restoration readiness upgrade

## Summary

Upgraded `experiments/zombie-orchard/` after the latest completed ledger showed `experiments/fogline-relay/` ridge ambulance work. This run intentionally chose a different route and added a well restoration objective layer: well pump repairs, bucket brigade routes, disinfectant stills, well barricade lanterns, sprinkler mist grids, and dawn water ration ledgers.

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

- The latest completed ledger read was `experiments/fogline-relay/`, so this run avoided repeating that route.
- Zombie Orchard is a compact 3-8 minute survival arena with movement, collection, waves, gear, horde pathing, cure crafting, and safehouse evacuation.
- It still benefits from a clearer survival-infrastructure loop because the core interaction can otherwise feel like collect apples and survive waves.
- The route already imports NexusEngine main through `kit-stack.js` and descriptor-only overlays, making it a safe target for another atomic readiness domain.

## Last upgraded experiment

`experiments/fogline-relay/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2259-fogline-ridge-ambulance-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey/basecamp | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, ridge ambulance, field clinic | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old NexusRealtime in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed entry imports NexusEngine main CDN and not old runtime CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, conservation overlays | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
zombie-orchard-well-restoration-readiness-domain
├─ water-source-domain
│  ├─ well-pump-repair-domain
│  │  └─ zombie-orchard-well-pump-repair-kit
│  └─ bucket-brigade-domain
│     └─ zombie-orchard-bucket-brigade-route-kit
├─ purification-defense-domain
│  ├─ disinfectant-still-domain
│  │  └─ zombie-orchard-disinfectant-still-kit
│  └─ well-barricade-domain
│     └─ zombie-orchard-well-barricade-lantern-kit
├─ orchard-rehydration-domain
│  ├─ sprinkler-mist-domain
│  │  └─ zombie-orchard-sprinkler-mist-grid-kit
│  └─ ration-ledger-domain
│     └─ zombie-orchard-dawn-water-ration-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-well-restoration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `zombie-orchard-well-pump-repair-kit`
- `zombie-orchard-bucket-brigade-route-kit`
- `zombie-orchard-disinfectant-still-kit`
- `zombie-orchard-well-barricade-lantern-kit`
- `zombie-orchard-sprinkler-mist-grid-kit`
- `zombie-orchard-dawn-water-ration-ledger-kit`
- `zombie-orchard-well-restoration-renderer-handoff-kit`
- `zombie-orchard-well-restoration-readiness-domain-kit`

Changed:

- Zombie Orchard now loads `well-restoration-readiness-entry.js` after safehouse evacuation.
- `GameHost.getRendererHandoff()` is patched by the new overlay to compose well restoration descriptors after existing handoffs.
- `GameHost.getWellRestorationReadiness()` and `GameHost.getZombieOrchardWellRestorationReadiness()` expose the new descriptor domain.
- Parent Zombie Orchard Playwright/state smoke imports the new kit and CDN smoke tests.

## Files changed

- `experiments/zombie-orchard/src/well-restoration-readiness-kits.js`
- `experiments/zombie-orchard/src/well-restoration-readiness-entry.js`
- `experiments/zombie-orchard/index.html`
- `tests/zombie-orchard-well-restoration-readiness-kits-smoke.mjs`
- `tests/zombie-orchard-well-restoration-cdn-state-input-smoke.mjs`
- `tests/zombie-orchard-playwright-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2313-zombie-well-restoration-upgrade.md`

## Tests added or changed

Added:

- `tests/zombie-orchard-well-restoration-readiness-kits-smoke.mjs`
- `tests/zombie-orchard-well-restoration-cdn-state-input-smoke.mjs`

Changed:

- `tests/zombie-orchard-playwright-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic well restoration kits.
- Renderer handoff policy.
- Descriptor counts.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed runtime entry.
- GameHost well restoration accessor exposure.

## Validation results

Scratch validation performed before connector writes:

- `node --check /mnt/data/well-restoration-readiness-kits.js` passed.
- `node --check /mnt/data/well-restoration-readiness-entry.js` passed.
- `node --check /mnt/data/tests/zombie-orchard-well-restoration-readiness-kits-smoke.mjs` passed.
- `node /mnt/data/tests/zombie-orchard-well-restoration-readiness-kits-smoke.mjs` passed all 10 intake cases.
- `node --check /mnt/data/tests/zombie-orchard-well-restoration-cdn-state-input-smoke.mjs` passed.
- `node /mnt/data/tests/zombie-orchard-well-restoration-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

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

- `experiments/zombie-orchard/src/well-restoration-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/zombie-orchard/src/well-restoration-readiness-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `tests/zombie-orchard-well-restoration-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence.
- Existing shared loader and older ProtoKit naming were preserved because they are part of the current gallery shell, not a changed runtime import to old NexusRealtime CDN.

## Manifest update

The route, entry, parent smoke, new tests, and this ledger now register the well restoration pass. The canonical `experiments/domain-kit-cutover-manifest.json` is still a very large one-line JSON blob. I did not replace the whole file in this connector run because that would risk a destructive overwrite. The next safe ledge is to normalize the manifest to multi-line JSON and add `zombie-orchard-well-restoration-readiness-domain-kit` to the Zombie Orchard `domainCutover` list with status `well-restoration-readiness-renderer-handoff-pass`.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable well restoration logic renderer-neutral.
- Kept the overlay as presentation-only Canvas drawing against descriptors.
- Kept all descriptor groups serializable.
- Routed new validation through the existing Zombie Orchard state/input smoke.

## Non-game handling

`experiments/zombie-orchard/` is a small experience-driven web game route. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, then add `zombie-orchard-well-restoration-readiness-domain-kit` cleanly. After that, run full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getZombieOrchardWellRestorationReadiness()` after WASD, sprint, interact, gear-use, slot-swap, and next-round inputs.
