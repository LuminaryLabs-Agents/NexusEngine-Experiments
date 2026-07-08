# Next Ledge Route Cargo Fractal Handoff

Timestamp: 2026-07-07 23:29 America/New_York
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch policy: pushed directly to main; no branch created.

## Goal

Make one meaningful upgrade to an experiment different from the last upgraded route by adding a route-cargo/extraction handoff layer to `next-ledge`, using small renderer-neutral descriptor kits and a NexusEngine CDN wrapper that consumes `generic-route-cargo-extraction-kit` without claiming the full traversal/cargo executable replay lane.

## Files read first

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- latest commit sequence showing `Log infinite radial terrain visual domain upgrade`
- `experiments/domain-kit-cutover-manifest.json`
- `experiments/next-ledge-route-cargo-extraction-plan.json`
- `experiments/next-ledge/src/session.js`
- `experiments/next-ledge/src/session-visual-upgrade.js`
- `experiments/next-ledge/src/visual-fractal-kits.js`
- `experiments/next-ledge/src/main.js`
- `experiments/next-ledge/src/diegetic-effects.js`
- `scripts/run-checks.mjs`
- `LuminaryLabs-Agents/NexusRealtime-ProtoKits/protokits/generic-route-cargo-extraction-kit/index.js`
- `LuminaryLabs-Agents/NexusRealtime-ProtoKits/protokits/generic-route-progress-kit/index.js`
- `LuminaryLabs-Agents/NexusRealtime-ProtoKits/protokits/generic-resource-loop-kit/index.js`

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest completed upgrade sequence was `infinite-radial-terrain`, so this run avoided that experiment.

`next-ledge` was the strongest safe target because `.agent/cycle-state.md` and `.agent/route-canonicalization.md` already identified route/cargo/pressure as the next narrow canonical hardening ledge. Its current loop is a short grapple climb with strong traversal feel but low objective variability beyond anchor progress. The upgrade adds cargo caches, route-cargo threads, fall pressure, and summit delivery descriptors while keeping the full replay claim blocked until a browserless deterministic fixture exists.

## Last upgraded experiment

`experiments/infinite-radial-terrain/`, based on the latest visible commit sequence:

- `Log infinite radial terrain visual domain upgrade`
- `Fix infinite radial terrain descriptor smoke ownership check`
- `Wire infinite radial terrain checks`

## Experiment inventory

| id | description | gameplay length | gameplay mechanics | old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| peer-scene-transition | Story-scene orchestration proof with HTML scene hosts, exits, inventory, and transition ledgers. | Short puzzle chain. | Click actions, scene exits, inventory tokens, puzzle unlocks. | no in current route description | yes |
| vr-platformer-board | Floating XR board platformer validation. | Short micro-platformer board. | A/D move, Space jump, R reset, drag head pose, stereo and comfort state. | migrated by prior run | yes |
| infinite-radial-terrain | Camera-driven radial terrain tessellation demo. | Open-ended terrain flight demo. | WASD fly, Space/Shift vertical, arrow look, origin snapping, terrain sampling. | avoided this run; latest upgrade | yes |
| high-fidelity-meadow | Procedural meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target domains. | Open-ended scene. | Camera/exploration presentation and procedural environment viewing. | not audited deeply this run | not changed this run |
| fogline-relay | First-person survey loop for scan targets, fog zones, timed pressure, hazard state, and visual buckets. | Short objective loop. | WASD/mouse look, scan, relay objectives, wraith pressure. | previously migrated | yes |
| nexus-frontier-signal-isles | Field-engineer systems showcase. | Medium objective loop. | Scan, harvest, build, pressure wave, gate unlock, cargo/beacon flow. | not audited deeply this run | not changed this run |
| the-cavalry-of-rome | Painterly Roman terrain map visual proof. | Open-ended map experience. | Pan, hover regions, cinematic map dive, army reveal. | not audited deeply this run | not changed this run |
| signal-bastion | 2.5D cel-style tower-defense game. | Full game route. | Tower placement, waves, upgrades, bosses, endless mode. | not changed this run | not changed this run |
| next-ledge | Grapple-climb validation route with route-progress DSK consumption and visual fractal descriptors. | Short sector climb. | Grapple, swing, rest anchors, summit, sector advance; now cargo cache, pressure, and summit handoff descriptors through wrapper. | base `session.js` still contains an old runtime CDN import, but the changed wrapper imports NexusEngine main CDN | yes in changed wrapper |
| sora-the-infinite | Open aerial route that redirects into The Open Above. | Open-ended aerial traversal. | Flight, boost, terrain stream, visual domains. | route is redirect | indirect through Open Above |
| zombie-orchard | Survival slice for horde pressure, pickups, weapons, orchard content, and runtime state. | Wave survival loop. | Move, sprint, dodge, collect, gear use, waves. | previously migrated | yes |
| rogue-lite-hellscape-siege | Base route for action defense extraction. | Medium/full game route. | Portals, inventory, harvest, build, wave/core defense, FX. | not changed this run | not changed this run |

## Domain ASCII tree

```txt
next-ledge-route-cargo-domain
├─ cargo-source-domain
│  ├─ cache-anchor-domain
│  │  └─ cargo-cache-anchor-kit
│  └─ shard-route-domain
│     └─ cargo-route-thread-kit
├─ extraction-pressure-domain
│  ├─ fall-risk-channel
│  │  └─ extraction-pressure-channel-kit
│  └─ rest-recovery-channel
│     └─ pressure-recovery-anchor-kit
├─ delivery-handoff-domain
│  ├─ summit-delivery-domain
│  │  └─ extraction-summit-handoff-kit
│  └─ cargo-status-readout-domain
│     └─ cargo-status-descriptor-kit
└─ renderer-handoff
   └─ route-cargo-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added under `experiments/next-ledge/src/route-cargo-fractal-kits.js`:

- `NEXT_LEDGE_ROUTE_CARGO_FRACTAL_TREE`
- `cargo-cache-anchor-kit`
- `cargo-route-thread-kit`
- `extraction-pressure-channel-kit`
- `extraction-summit-handoff-kit`
- `cargo-status-descriptor-kit`
- `route-cargo-renderer-handoff-kit`
- `next-ledge-route-cargo-domain-kit`

Integrated through a new browser/session wrapper:

- `session-cargo-extraction-upgrade.js`
- Imports NexusEngine main through `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Installs `generic-route-cargo-extraction-kit` from ProtoKits main.
- Bridges Next Ledge events into `engine.n.genericRouteCargoExtraction` methods.
- Exposes `snapshot.domain.routeCargoExtraction` and `snapshot.domain.routeCargoVisual`.

Renderer integration:

- `diegetic-effects.js` now consumes `snapshot.domain.routeCargoVisual.rendererHandoff.descriptors`.
- Cargo caches, pressure veils, and summit delivery handoff descriptors produce diegetic particle layers and player signal changes.
- Reusable kit files still own no Three.js, DOM, browser input, audio, asset loading, or frame-loop behavior.

## Files changed

- `experiments/next-ledge/src/route-cargo-fractal-kits.js`
- `experiments/next-ledge/src/session-cargo-extraction-upgrade.js`
- `experiments/next-ledge/src/main.js`
- `experiments/next-ledge/src/diegetic-effects.js`
- `experiments/domain-kit-cutover-manifest.json`
- `tests/next-ledge-route-cargo-fractal-kits-smoke.mjs`
- `tests/next-ledge-route-cargo-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/turn-ledger/2026-07-07-2329-next-ledge-route-cargo-fractal-handoff.md`

## Tests added

- `tests/next-ledge-route-cargo-fractal-kits-smoke.mjs`
  - 10 smoke-test intake cases.
  - Covers cargo cache anchors, cargo route threads, extraction pressure channels, summit handoff, status descriptors, renderer handoff, and composite route-cargo domain output.
  - Rejects renderer/browser/audio/frame-loop ownership in the kit file.

- `tests/next-ledge-route-cargo-cdn-state-input-smoke.mjs`
  - 10 state/input static validation cases.
  - Checks the browser entry now routes through `session-cargo-extraction-upgrade.js`.
  - Checks NexusEngine main CDN import in the changed wrapper.
  - Checks old NexusRealtime runtime CDN absence in the changed wrapper.
  - Checks route-cargo facade calls for checkpoint, pickup, delivery, pressure adjustment, recovery, and snapshot descriptor exposure.

Both tests are wired into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.

## Validation results

Static validation completed through GitHub file writes plus targeted refetch of changed files after writes.

Runtime shell validation was not executed in this connector-only run. The validation commands are wired for:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files:

- `experiments/next-ledge/src/session-cargo-extraction-upgrade.js`
  - Uses NexusEngine main CDN.
  - Does not import the old `LuminaryLabs-Dev/NexusRealtime@main/src/index.js` runtime CDN.

Unchanged context:

- `experiments/next-ledge/src/session.js` still imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- This run did not rewrite `session.js` directly because the existing route-cargo plan smoke intentionally guards that file as the still-current route-progress source until the full replay promotion is ready.
- The new wrapper moves changed runtime behavior toward NexusEngine main without breaking the current route-progress guard tests.

## Cleanup pass

- Kept atomic route-cargo logic in renderer-neutral descriptor kits.
- Kept Three.js particle consumption in the renderer/effects file.
- Kept browser input and frame-loop behavior in route host files.
- Avoided destructive route deletion or route promotion claims.
- Preserved the existing route-cargo extraction plan guard instead of claiming the full traversal/cargo replay lane.
- Updated the manifest to record the new handoff while keeping the replay-level cargo/resource/pressure gap explicit.
- Did not create a branch.
- Did not touch any other repo.

## Next safe ledge

Run `npm run check` and `npm run check:deploy` in a shell/CI runner. If green, the next small patch should fix the existing event payload overwrite in `session.js` by renaming ledge type payloads to `anchorType`, then promote the route-cargo wrapper into the base session only after `next-ledge-route-cargo-extraction-plan-smoke.mjs` is updated to reflect a real replay-backed composite consumption claim.

## What not to do next

Do not mark `next-ledge` as a full traversal/cargo executable replay lane until a browserless fixed-tick replay imports real Core plus ProtoKits, advances route/cargo/pressure state, and compares deterministic descriptor digests. Do not move Three.js renderable construction into the route-cargo kits.
