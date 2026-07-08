# 2026-07-08 0617 — Zombie Orchard foraging readability upgrade

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest completed upgrade was `experiments/fogline-relay/`, so this pass selected a different route. Zombie Orchard already had movement, collection, survival waves, visual-fractal descriptors, and survival-readability descriptors, but the apple / gear / row-memory part of the loop was still less explicit than the combat pressure layer. This pass adds a foraging readability domain so apple value, gear fit, harvest streaks, safe harvest pockets, row memory, and boss omen branches become explicit descriptor surfaces.

## Last upgraded experiment

`experiments/fogline-relay/`

Latest known commit before this pass: `da31beaaa013fc272cc156fd2dcd0b662edb05e4` — `Log Fogline signal cartography upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, consequence, and decision readability descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, action likelihood, route choice scoring, pressure release, and narrative thread pins. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit, traversal readability descriptors. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery, traversal readability descriptors. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards, sample bookmarks, route task bands. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route with signal cartography. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory, relay priority, avoidance corridors, scan windows, retreat pockets, triangulation grid. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route with foraging readability. | 5-12 minute survival / scavenging loop. | Move, collect apples, scavenge gear, melee/use gear, waves, survival pressure, apple rarity heat, gear choice arcs, harvest streak trails, safe harvest pockets, row memory, boss omen branches. | No changed-runtime old runtime CDN. ProtoKits survival bridge URL remains and is not the old core runtime CDN. | Yes through `kit-stack.js`. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
zombie-orchard-foraging-readability-domain
├─ forage-targeting-domain
│  ├─ apple-rarity-domain
│  │  └─ orchard-apple-rarity-heat-kit
│  └─ gear-choice-domain
│     └─ orchard-gear-choice-arc-kit
├─ harvest-routing-domain
│  ├─ streak-memory-domain
│  │  └─ orchard-harvest-streak-trail-kit
│  └─ safe-pocket-domain
│     └─ orchard-safe-harvest-pocket-kit
├─ orchard-memory-domain
│  ├─ row-breadcrumb-domain
│  │  └─ orchard-row-memory-breadcrumb-kit
│  └─ boss-omen-domain
│     └─ orchard-boss-omen-branch-kit
└─ renderer-handoff
   └─ orchard-foraging-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `orchard-apple-rarity-heat-kit`
- `orchard-gear-choice-arc-kit`
- `orchard-harvest-streak-trail-kit`
- `orchard-safe-harvest-pocket-kit`
- `orchard-row-memory-breadcrumb-kit`
- `orchard-boss-omen-branch-kit`
- `orchard-foraging-renderer-handoff-kit`
- `zombie-orchard-foraging-readability-domain-kit`

Changed integration:

- `session.js` now imports and composes `createZombieOrchardForagingReadabilityDomainKit` after survival readability.
- `session.js` now exposes `foragingReadability`, `domain.zombieOrchardForagingReadability`, and a composed `rendererHandoff` that merges survival and foraging descriptors.
- `session.js` folds foraging safe pockets / row breadcrumbs / apple heat / boss omens into existing Three-compatible visual buckets so the current Three renderer can consume them without owning domain logic.
- `bootstrap.js` now exposes `GameHost.getForagingReadability()` and returns the composed renderer handoff.
- `canvas-view.js` now consumes foraging descriptors directly from the composed handoff and paints safe harvest pockets, row breadcrumbs, gear arcs, apple heat, harvest streaks, and boss omens.
- Existing wired Zombie Orchard smoke tests import the new foraging smoke modules, so full and deploy suites cover the new kits without editing `scripts/run-checks.mjs`.
- `experiments/domain-kit-cutover-manifest.json` records the foraging readability pass.

## Files changed

- `experiments/zombie-orchard/src/foraging-readability-kits.js`
- `experiments/zombie-orchard/src/session.js`
- `experiments/zombie-orchard/src/bootstrap.js`
- `experiments/zombie-orchard/src/canvas-view.js`
- `tests/zombie-orchard-foraging-readability-kits-smoke.mjs`
- `tests/zombie-orchard-foraging-readability-cdn-state-input-smoke.mjs`
- `tests/zombie-orchard-survival-readability-kits-smoke.mjs`
- `tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0617-zombie-orchard-foraging-readability-upgrade.md`

## Tests added

- `tests/zombie-orchard-foraging-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks apple rarity heat, gear choice arcs, harvest streak trails, safe harvest pockets, row memory breadcrumbs, boss omen branches, renderer handoff counts, serializability, and renderer-neutral ownership boundaries.
- `tests/zombie-orchard-foraging-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old core NexusRealtime runtime absence, foraging kit imports, `GameHost.getForagingReadability()`, composed renderer handoff exposure, Canvas descriptor consumption, and Three-compatible visual bucket folding.

Updated wired tests:

- `tests/zombie-orchard-survival-readability-kits-smoke.mjs` imports the foraging kit smoke so `npm run check` and `npm run check:deploy` execute it through the already wired Zombie Orchard suite.
- `tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs` imports the foraging CDN/state smoke so the existing check wiring executes it.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking route/test/manifest tokens during the pass.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Zombie Orchard runtime keeps the requested NexusEngine import through `kit-stack.js`: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Zombie Orchard runtime does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- Existing `NexusRealtime-ProtoKits@0.0.1` generic survival kit bridge remains because this pass did not replace the generic survival kit source and it is not the old core runtime CDN.
- New foraging readability kits are plain descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.

## Cleanup pass

- Preserved the Zombie Orchard route and all existing movement / collection / wave / monster / weapon behavior.
- Avoided destructive deletes or renames.
- Kept harvest target valuation, gear fit, row memory, safe pocket scoring, and boss omen logic inside reusable kits.
- Reused existing Three visual buckets instead of adding a second Three renderer.
- Added direct Canvas consumption for the full descriptor set.
- Avoided version-suffix route creation.

## Non-game route handling

Zombie Orchard is a small experience-driven web game. It was not deleted, renamed, or refactored away. This pass preserved the survival loop and added explicit foraging readability to make apple and gear decisions more meaningful.

## Next safe ledge

Add a deterministic Zombie Orchard replay fixture that walks spawn → collect apple → pick gear → start round → clear monster → dodge pressure → collect rare apple → boss warning, then snapshot-hashes survival plus foraging renderer-handoff descriptors.
