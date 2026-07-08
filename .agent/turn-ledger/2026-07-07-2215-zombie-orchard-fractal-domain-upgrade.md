# Agent Ledger Entry: Zombie Orchard Fractal Domain Upgrade

Date: 2026-07-07 22:15 America/New_York
Actor: scheduled experiment-upgrade agent
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch: main

## Goal

Make one massive meaningful improvement over one under-hardened canonical experiment without repeating the latest upgraded route. The chosen patch upgrades `experiments/zombie-orchard/` by fractalizing its survival-ecology presentation layer into atomic renderer-neutral descriptor kits, migrating the changed runtime import to NexusEngine main CDN, wiring stronger smoke coverage, and recording the cutover in repo memory.

## Files Read First

- `README.md`
- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/README.md`
- `.agent/templates/ledger-entry-template.md`
- `experiments/domain-kit-cutover-manifest.json`
- `experiments/twenty-experiment-seeder-map.json`
- `experiments/zombie-orchard/index.html`
- `experiments/zombie-orchard/src/bootstrap.js`
- `experiments/zombie-orchard/src/session.js`
- `experiments/zombie-orchard/src/kit-stack.js`
- `experiments/zombie-orchard/src/visual-fractal-kits.js`
- `experiments/zombie-orchard/src/three-view.js`
- `experiments/zombie-orchard/src/canvas-view.js`
- `tests/zombie-orchard-visual-fractal-kits-smoke.mjs`
- `tests/zombie-orchard-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`

## Last Upgraded Experiment Found

The current memory shows recent hardening around Signal Bastion presentation-bridge seams and Next Ledge visual/route-progress seams. The manifest also records recent descriptor work on `peer-scene-transition`, `next-ledge`, and the redirected Open Above/Sora lane. This pass intentionally avoided those and selected `zombie-orchard`, which was still marked `existing` in the manifest before this change.

## Experiment Inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import state | NexusEngine main CDN state |
| --- | --- | --- | --- | --- | --- |
| `peer-scene-transition` | Scene-transition puzzle route with peer HTML scene hosts and shrine/forest/bridge puzzle gates. | Short multi-scene puzzle slice. | Scene exits, lantern gate, forest/bridge/shrine puzzle steps, route graph descriptors. | Manifest says browser host imports NexusEngine main via CDN. | Current canonical descriptor pass already recorded. |
| `next-ledge` | Cinematic grapple-climb validation demo. | Short ascent slice. | Grapple, swing, sector advance, route progress, visual cliff/rope/cloud descriptors. | Existing route-progress migration state, not selected. | Partial `engine.n.genericRouteProgress` consumption plus descriptor pass already recorded. |
| `fogline-relay` | First-person fog-forest relay/survey route. | Short objective relay. | Move/look, hold scan, fog volumes, relay objectives, wraith pressure. | Not changed in this pass. | Manifest still `existing`; should be audited later. |
| `nexus-frontier-signal-isles` | Broad field-engineer kit-utilization showcase. | Medium composition slice. | Scan, harvest, build mast, survive wave, unlock gate, deliver cargo, activate beacon. | Not changed in this pass. | Broad kit showcase, not the least bounded target for this run. |
| `sora-the-infinite` | Aerial/open traversal route redirected through Open Above visual layer. | Open traversal slice. | Assisted pitch/bank/boost, terrain patching, flock/scatter, thermal/contrail descriptors. | Not changed in this pass. | Open Above visual layer already records GameHost descriptor state. |
| `zombie-orchard` | Kit-composed survival orchard route. | Survival-wave slice. | Move/sprint/dodge, collect apples, pickup/swap/use gear, survive horde rounds. | Changed `kit-stack.js` away from `LuminaryLabs-Dev/NexusRealtime@main`. | Now imports `LuminaryLabs-Dev/NexusEngine@main/src/index.js` in the changed runtime stack. |
| `signal-bastion` | Strategic tower-defense game and only executable route-domain replay lane. | Long strategic pressure game. | Build, upgrade, sell, waves, bosses, maps, presentation descriptors. | Already heavily migrated and not selected. | Remains strongest executable route-domain lane. |
| `rogue-lite-hellscape-siege` | Action-defense-extraction game. | Medium/long rogue-lite run. | Portals, harvesting, pickups, build blueprints, core defense, extraction loop. | Not changed in this pass. | Unified base route already recorded. |

## Chosen Experiment

`experiments/zombie-orchard/`

## Why It Was Chosen

`zombie-orchard` was the weakest match against this run's target because it was still marked as `existing` in the domain cutover manifest, had fewer renderer-neutral visual descriptor domains than nearby canonical routes, and still imported the old public NexusRealtime main CDN in the changed kit stack. It also has a clear bounded improvement path: survival-ecology can gain more variability through descriptor-producing atomic kits without moving renderer, DOM, browser input, Three.js, Canvas, WebGL, audio, frame-loop, or asset loading into reusable kit logic.

## Domain ASCII Tree

```txt
zombie-orchard
├─ survival-ecology-domain
│  ├─ orchard-row-field-domain
│  │  ├─ orchard-lane-band-kit
│  │  ├─ orchard-ground-texture-kit
│  │  └─ placement/walkability kits
│  ├─ atmosphere-domain
│  │  ├─ lighting-domain
│  │  │  └─ orchard-tension-lighting-kit
│  │  └─ orchard-fog-ribbon-kit
│  ├─ hazard-domain
│  │  └─ orchard-haunting-zone-ring-kit
│  ├─ resource-domain
│  │  ├─ collectible-domain
│  │  │  └─ orchard-apple-glow-kit
│  │  └─ orchard-pickup-beacon-kit
│  ├─ combat-domain
│  │  ├─ orchard-combat-cue-kit
│  │  └─ threat-domain
│  │     └─ orchard-threat-silhouette-kit
│  └─ tree-domain
│     ├─ orchard-trunk-form-kit
│     └─ vegetation.leaf.cluster
│        └─ orchard-leaf-cluster-kit
└─ zombie-orchard-visual-fractal-domain-kit
   └─ renderer descriptor handoff
```

## Kits Added or Changed

Changed existing kits:

- `zombie-orchard-visual-fractal-domain-kit`
- `orchard-leaf-cluster-kit`
- `orchard-trunk-form-kit`
- `orchard-apple-glow-kit`
- `orchard-lane-band-kit`
- `orchard-threat-silhouette-kit`
- `orchard-tension-lighting-kit`

Added atomic descriptor kits:

- `orchard-ground-texture-kit`
- `orchard-fog-ribbon-kit`
- `orchard-haunting-zone-ring-kit`
- `orchard-pickup-beacon-kit`
- `orchard-combat-cue-kit`

## Change Summary

- Migrated the changed Zombie Orchard runtime stack from the old `LuminaryLabs-Dev/NexusRealtime@main` CDN import to `LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Expanded the Zombie Orchard visual domain from trees/apples/lanes/threat silhouettes into a fuller survival-ecology descriptor stack.
- Added renderer-neutral descriptors for ground furrows, leaf patches, mud patches, fog ribbons, haunting zone rings, pickup beacons, combat player range rings, and target locks.
- Updated the Three.js view and Canvas fallback to consume those descriptors as presentation-only render instructions.
- Reduced avoidable per-frame geometry churn for tree trunks and threat bodies by keying geometry replacement on descriptor dimensions.
- Updated the manifest so Zombie Orchard now records the descriptor-domain pass, feature parity, and NexusEngine CDN bridge state.
- Expanded the kit smoke from 70 to 120 intake cases.
- Updated the Playwright state-input smoke to assert the NexusEngine CDN import and the new descriptor surfaces.
- Wired the Zombie Orchard Playwright smoke into deploy checks as well as full checks.

## Files Changed

- `experiments/zombie-orchard/src/kit-stack.js`
- `experiments/zombie-orchard/src/visual-fractal-kits.js`
- `experiments/zombie-orchard/src/three-view.js`
- `experiments/zombie-orchard/src/canvas-view.js`
- `tests/zombie-orchard-visual-fractal-kits-smoke.mjs`
- `tests/zombie-orchard-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-07-2215-zombie-orchard-fractal-domain-upgrade.md`

## Tests Added / Changed

- `tests/zombie-orchard-visual-fractal-kits-smoke.mjs`
  - Now covers 12 kit/composite groups with 10 intake cases each.
  - Total: 120 descriptor intake assertions.
- `tests/zombie-orchard-playwright-state-input-smoke.mjs`
  - Now guards the changed `NexusEngine@main` CDN import.
  - Now rejects the old `NexusRealtime@main` runtime CDN import in the changed kit stack.
  - Now asserts descriptor presence for `ground`, `fogRibbons`, `hauntZones`, `pickups`, and `combatCue`.
- `scripts/run-checks.mjs`
  - Keeps Zombie Orchard visual-fractal smoke in full and deploy checks.
  - Adds Zombie Orchard Playwright state/input smoke to deploy checks.

## Validation Results

Static validation completed through the GitHub contents connector:

- Fetched updated `experiments/zombie-orchard/src/visual-fractal-kits.js` after writing and verified the new atomic kit exports and descriptor composition are present.
- Fetched updated `tests/zombie-orchard-visual-fractal-kits-smoke.mjs` after writing and verified all 120 intake cases are encoded as assertions.
- Fetched updated `experiments/domain-kit-cutover-manifest.json` after writing and verified the Zombie Orchard status now records `survival-ecology-visual-domain-descriptor-pass`.

Runtime validation was not executed in this connector-only automation environment because no shell/Node runner was available. The changed checks are wired so the repo can validate them with:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime Import Audit

Changed files:

- `experiments/zombie-orchard/src/kit-stack.js` now imports runtime from `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `tests/zombie-orchard-playwright-state-input-smoke.mjs` now asserts the NexusEngine main CDN import and explicitly rejects the old `LuminaryLabs-Dev/NexusRealtime@main/src/index.js` URL in the changed kit stack.

Known compatible legacy naming remains:

- The module alias remains `NexusRealtime` inside the local file to avoid a broad mechanical rename of route code in the same patch.
- The ProtoKits package URL remains `NexusRealtime-ProtoKits@0.0.1` because that is the current package path consumed by the repo.
- The page loader filename still uses the legacy `nexus-realtime-page-loader.js` shared name and was not touched because this run changed the Zombie Orchard kit/runtime stack, not shared loader naming.

## Cleanup Pass

- Kept all new kit logic renderer-neutral.
- Kept Three.js, Canvas, DOM, browser input, runtime loop, and asset concerns in view/bootstrap files.
- Avoided destructive route deletion or branch creation.
- Kept work scoped to `LuminaryLabs-Agents/NexusEngine-Experiments` on `main`.

## Decision Notes

- This is a route-local descriptor-domain hardening pass, not a claim that Zombie Orchard now has executable deterministic route-domain replay.
- Reusable survival implementation still belongs in ProtoKits; this patch only produces route-local descriptors and validation pressure that can later justify promotion.
- The changed descriptor kits are intentionally small and idempotent: each accepts snapshot/content-like input and returns serializable render descriptors.

## Risks / Watch Items

- Runtime checks should be executed by CI or a local runner to confirm there are no browser-only renderer regressions.
- Adding Playwright to deploy checks increases deploy validation cost, but it directly guards the requested CDN/state-input validation for the changed route.
- Future work should watch whether the local Zombie Orchard descriptor kits should be promoted to ProtoKits only after another route proves the same surfaces are reusable.

## Next Safe Ledge

Add a deterministic Zombie Orchard replay fixture that drives a fixed pickup/gear/horde sequence and hashes survival round state, resource deltas, horde pressure, health outcome, and the new visual descriptor surfaces.

## Do Not Do Next

- Do not claim Zombie Orchard as a second executable route-domain replay lane yet.
- Do not move Three.js, Canvas, DOM, browser input, WebGL, audio, frame-loop, or asset loading into reusable kit code.
- Do not create branches.
- Do not delete or fold route folders from this pass.
