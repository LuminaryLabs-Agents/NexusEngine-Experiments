# Signal Bastion First-Command Refinement Packet

- Packet: `2026-07-17-signal-bastion-first-command-refinement`
- Date: 2026-07-17
- Experiment-game: `games/signal-bastion/`
- Starting Experiments commit: `652a02dd64d3e4202f6bfb333a8a560053242dfd`
- ProtoKits start: `04d34f049f58ae359cf71d43466c429dac2a6d08`
- ProtoKits production/final: `bb3d787da372bf001653635d6e57eb7ce54e3c50`
- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`
- Experiments production commit: pending this commit
- Final receipt commit: reported after publication

## Result

Signal Bastion now opens as one readable defense command instead of a diagnostic wall. The player reads the purpose, places a Bolt/Ember/Frost line, starts and clears waves, sees one authoritative objective/impact path, can breach the hard-route core, and can rebuild the complete run. Nine specialist towers and three readiness surfaces remain available only under explicitly labeled Advanced diagnostics.

## Selection and baseline finding

`signal-bastion` and `stonewake-depths` were the only unscored active legacy baselines; the stable-ID tie selected Signal Bastion after both writable repositories passed clean default-branch preflight. Baseline play completed a three-tower Wave 1 clear, but the first screen exposed 48 diagnostic descriptors, four canvases, three readiness panels, and twelve equal-priority towers with no player purpose or hero command. Hard-route play also exposed a reusable session defect: core health reached zero, then late `WaveCompleted` processing restored planning status.

## Feature contract

- Player purpose: build a three-tower line, call the assault, and keep the Dawn Core lit.
- Target feeling: read the board, commit the line, watch it answer, and rebuild confidently.
- Ownership: the current generic-defense DSK composition owns map/vital state, wallet, placement, structures, agents/waves, combat, session, render descriptors, and terminal restart; the local host owns authored guidance, browser input, Canvas/DOM projection, and diagnostic disclosure.
- Exclusions: no Core edit, no duplicate simulation owner, no route retirement, no new public browser API, no new standalone test file, and no gameplay mutation in the renderer.
- Hero actions: choose Bolt/Ember/Frost, click a build pad, start a wave, select/upgrade a tower, and rebuild after breach.
- Advanced actions: cycle/select specialist towers, cancel/sell, and show readiness diagnostics.
- Resources/state: map/vital, economy, structures, agents/waves, combat, session, render descriptors, player mission descriptor, and diagnostics visibility.
- Events/methods: existing build/select/upgrade/sell/start/restart commands plus wave-start/completion, vital-damage, economy, and rejection events.
- Snapshots/descriptors: namespaced generic-defense session and render snapshots, one local `playerMission` presentation descriptor, and opt-in composed readiness handoffs.
- Dependencies: read-only NexusEngine Core plus pinned `NexusEngine-ProtoKits` commit `bb3d787da372bf001653635d6e57eb7ce54e3c50`.

## Real ProtoKit features composed

1. generic-defense map and vital-target DSK
2. economy-wallet DSK
3. build-placement and structure-upgrade DSK
4. wave/agent director DSK
5. combat resolver DSK
6. session facade and session-command kit
7. render-descriptor DSK
8. generic-defense presentation stack

## Concrete refinement

- Added one first-screen mission owner with purpose, live objective, semantic impact, Start Wave, and conditional Rebuild controls.
- Reduced the default tower choice to three starter roles; nine specialists remain in a default-closed disclosure.
- Moved mission projection into one host-authored `playerMission` descriptor so the Canvas renderer does not read or mutate reusable raw state outside its pointer hit-test seam.
- Cut the route from the stale `NexusRealtime-ProtoKits` browser source to the validated `NexusEngine-ProtoKits` commit.
- Fixed the reusable generic-defense session DSK so core breach is terminal and late wave completion cannot advance progression or restore planning state.
- Proved physical three-tower placement, two wave commands, wave clear, hard-route breach, and full rebuild.

## Final integration, cleanup, and performance

- Authored purpose and starter-count guidance stay declarative in the route preset; deterministic state remains behind namespaced DSK APIs.
- Consolidated the default view to one Canvas, one mission card, one stat strip, and one tower panel.
- Removed default readiness canvases/panels and skipped heavy local command/wave/frontline/evacuation description unless diagnostics are requested.
- Readiness surfaces now create lazily and destroy immediately through one diagnostics-change presentation event; closing Advanced returns exactly to one Canvas and 108 DOM nodes.
- Diagnostic domain APIs and the complete 48-descriptor handoff remain available while explicitly enabled.
- No source route, public API, gameplay system, authored wave, tower, enemy, progression, or presentation capability was removed.

### Measured comparison

Matched 60-frame warm-up plus 180-frame Wave 2 active-play window with three starter towers:

| Metric | Before | After | Result |
| --- | ---: | ---: | --- |
| average frame time | 82.946 ms | 33.315 ms | 59.8% lower |
| p95 frame time | 87.5 ms | 35.3 ms | 59.7% lower |
| measured FPS | 12.056 | 30.02 | 149% higher |
| default DOM nodes | 138 | 108 | 30 fewer |
| canvas nodes | 4 | 1 | three diagnostic canvases removed by default |
| composed descriptors | 48 | 24 | player view consumes the base set only |
| available heap signal | 33.452 MB | 30.283 MB | no regression |
| final long tasks | unavailable baseline / 0 final | 0 final | no new spike signal |
| console errors | 0 | 0 | clean |

Advanced open/closed proof held `150 DOM / 4 canvases / 48 descriptors` while enabled and returned to `108 DOM / 1 canvas / 24 player descriptors` immediately when disabled. No duplicated surfaces or unbounded steady-state growth were observed.

## Feel score

| Dimension | Before | After |
| --- | ---: | ---: |
| responsiveness | 6 | 9 |
| predictability | 4 | 9 |
| readability | 1 | 9 |
| impact | 4 | 8 |
| recovery | 3 | 9 |
| delight | 2 | 8 |
| replay desire | 3 | 8 |
| average | 3.3 | 8.6 |

## Human View and Playwright proof

Before:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-active-wave.png`
- `evidence/human-view-before-wave-resolved.png`

After:

- `evidence/human-view-after-first-screen.png`
- `evidence/human-view-after-line-ready.png`
- `evidence/human-view-after-active-wave.png`
- `evidence/human-view-after-wave-resolved.png`
- `evidence/human-view-after-failure.png`
- `evidence/human-view-after-rebuild.png`

Playwright used physical button and Canvas interactions to place the three starter towers, call Wave 1 and Wave 2, clear pressure, run an unbuilt hard preset to terminal breach, click Rebuild, and open/check/uncheck Advanced diagnostics. The exact final build recorded `lost=true`, `status=lost`, core `0/18`, disabled Start, visible Rebuild, then restored planning, core `18/18`, currency `155`, wave index `0`, and zero structures. Final console result: zero errors and zero warnings.

## Validation

- all 22 runnable existing `tests/signal-bastion*.mjs` entrypoints
- excluded unchanged `tests/signal-bastion-executable-route-replay-smoke.mjs`, which still imports absent legacy `nexusrealtime` package wiring
- generic-defense kit regression, DSK-boundary, and session-command ProtoKit checks
- affected JavaScript syntax and JSON parse checks
- repository `node scripts/run-checks.mjs` invoked; it stops at the unchanged starting-commit duplicate `drawHexFill` declaration in `experiments/The Cavalry of Rome/src/hex-gameplay-pass.js`
- `git diff --check`
- fresh local HTTP runtime, Playwright interaction, screenshots, performance sample, diagnostics cleanup, and console capture

## Audits

- Ownership: Core stayed read-only. ProtoKits owns terminal loss/restart and all generic-defense mutation. Experiments owns preset guidance, browser input, DOM/Canvas presentation, and disclosure. The renderer consumes `playerMission` instead of reusable raw session state.
- Diversity: this eight-feature strategic defense/line-building loop is materially distinct from Next Ledge traversal/cargo and Hellscape action-defense/extraction. It is an in-place legacy refinement and claims no production creation count.
- Feature migration: no source, route, scene, mechanic, or public API was deleted or retired, so `feature-migration-ledger.json` remains unchanged and no retirement entry is required.
- Valuable union: all 12 towers, 30 waves, maps, enemies/bosses, placement, upgrades/sell, combat, economy, core pressure, win/loss/restart, campaign data, readiness APIs, diagnostics, renderer handoffs, and presentation stack remain present.

## Exact next playable improvement

After the first clear, present one authored choice between upgrading the starter line and adding a specialist tower, reusing existing economy, session, wave-preview, and descriptor owners without another first-screen control or state owner.
