# Hellscape Return-Fortification Choice Packet

- Packet: `2026-07-19-hellscape-return-fortification-choice`
- Date: 2026-07-19
- Experiment-game: `games/rogue-lite-hellscape-siege/`
- Starting Experiments commit: `e1606c3f9215fd6360470935ab78fa53adea6a74`
- Starting/final ProtoKits commit: `194d37714d7c23984970e09015b5dd4bffbbab7b`
- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`
- Experiments production commit: `cfee398f3ba9e6e75ea52a1729d03f86afca5633`
- Final receipt commit: reported after publication

## Result

Hellscape now turns its first clear into one legible material-to-defense payoff. The player clears Siege 1, reads a `5 wood + 3 obsidian` Emberplate recipe, harvests Grove and Ashes, returns, and presses the existing `B` control to forge the surviving Spike Wall in place. The wall visibly becomes a `300 HP` Emberplate defense with `35%` damage guard. A breached siege retries its own number; if the wall was destroyed, the restored starter cache must rebuild before retry.

## Selection and baseline finding

Next Ledge remained builder-owned, so the least-recently improved non-overlapping scored game selected by the live scorecard was Hellscape. Baseline Playwright cleared Siege 1 and physically harvested both required resources, but the HUD only said “gather or fortify,” never showed the wall's real `5 wood + 3 obsidian` cost, continued to label `B` as `BUILD WALL`, and returned the player directly onto the surviving wall. Pressing `B` therefore encouraged a duplicate structure instead of a meaningful progression choice.

## Feature contract

- Player purpose: convert a successful defense and two-realm material run into a stronger next-siege fortification.
- Target feeling: earn, return, forge, endure.
- Ownership: the local build/structure kit owns the authored recipe descriptor and in-place wall mutation; inventory owns material spend/recovery; realm and harvest kits own collection; wave/defense owns guarded damage and same-number retry; the HUD and Canvas renderer consume snapshots only.
- Exclusions: no Core edit, no ProtoKit export change, no new control, no second defense owner, no duplicate structure, no new route, no retirement, and no new standalone test file.
- Hero actions: move, build/forge with `B`, interact/start/enter/return with `E`, and strike/harvest with Space or mouse.
- Advanced actions: cycle/select the three existing blueprints and explicitly enable readiness diagnostics.
- Resources/state: inventory materials, build selection, structures, fortification descriptor, realm/resources/drops, wave/enemies, core/player health, combat counters, and bounded FX.
- Events/methods: existing inventory add/spend/clear, realm enter/home, build place, wave start/strike plus `structure.fortified`; `engine.build.getFortificationState()` publishes the player-facing descriptor.
- Snapshots/descriptors: one build-owned serializable fortification descriptor, the existing game snapshot, six cached domain descriptions, and one composed renderer handoff.
- Dependencies: read-only NexusEngine CDN/runtime reference and the existing local Hellscape kit composition; NexusEngine-ProtoKits remained unchanged.

## Real kit features composed

1. input and avatar movement
2. inventory spending plus starter-cache recovery
3. realm and portal transitions
4. harvest and pickup loop
5. build blueprint and structure mutation
6. wave/core defense plus guarded damage and same-number retry
7. bounded FX plus descriptor-driven HUD/Canvas handoff

## Concrete refinement

- Added declarative `postClearFortification` tuning under `config.firstSiege`: recipe, name, HP bonus, damage scale, guard copy, and color.
- Added one derived `getFortificationState()` descriptor and one `fortify()` mutation to the existing build owner.
- Reused `B`: before the first siege it builds; after a clear it shows recipe progress; when ready it forges the existing wall rather than placing another entity.
- Updated the hero objective continuously: both realms needed, Grove complete/Ashes next, recipe ready, Emberplate complete, or exact failure recovery.
- Added one Canvas ring/label on the existing wall for incomplete, ready, and completed states.
- Applied the wall's authored damage scale in the existing enemy-to-target damage path.
- Fixed breach recovery so it retries the same siege number and blocks restart until a destroyed defense is rebuilt; a surviving Emberplate wall keeps its state.
- Cache-busted every changed browser dependency after Human View exposed a stale-module runtime failure.

## Final integration, cleanup, and performance

- Authored recipe and tuning stay declarative; deterministic mutation stays behind the build and wave kit APIs; browser input, copy, HUD, Canvas drawing, and cache URLs stay local.
- The fortification descriptor is the single state/presentation handoff. HUD and Canvas do not recompute inventory ownership or create a second defense state.
- The surviving wall changes in place. No duplicate DOM/canvas entity, structure, listener, timer, effect pool, diagnostic owner, or first-screen control was added.
- Removed the baseline path that encouraged an overlapping second wall. Preserved portals, all three blueprints, realms/resources, inventory, waves, combat, failure/recovery, readiness domains, renderer handoffs, and FX.
- Fresh default view: `52` DOM nodes, one canvas, Advanced closed, diagnostics false, zero visible readiness panels. First diagnostic open creates five opt-in panels; a second open/close remains bounded at `113` DOM nodes, one canvas, and returns to zero visible panels.
- Three post-failure checkpoints stayed at `52` DOM nodes, one canvas, `177` descriptor IDs, zero enemies/structures/particles/flashes; heap samples fluctuated `16.59 -> 19.27 -> 11.54 MB` and did not grow monotonically.

### Matched performance comparison

Same browser and route, one physical wall/start sequence, `60`-frame warm-up plus `180` active Wave 1 frames:

| Metric | Before | After | Result |
| --- | ---: | ---: | --- |
| average frame time | 16.663 ms | 16.661 ms | 0.01% lower |
| p95 frame time | 18.3 ms | 17.6 ms | 3.8% lower |
| measured FPS | 60.014 | 60.020 | stable |
| fresh default DOM nodes | 50 | 52 | +2 labeled hero-control nodes |
| canvas nodes | 1 | 1 | unchanged |
| active descriptor IDs | 180 | 184 | +4 bounded fortification descriptors |
| one-point heap signal | 15.75 MB | 22.71 MB | volatile; growth series ended at 11.54 MB |
| long tasks | 0 | 0 | unchanged |
| console/page errors | 0 | 0 | clean |

The primary runtime metric stayed well inside the 10% regression budget.

## Feel score

| Dimension | Before | After |
| --- | ---: | ---: |
| responsiveness | 9 | 9 |
| predictability | 9 | 9 |
| readability | 9 | 10 |
| impact | 9 | 9 |
| recovery | 8 | 9 |
| delight | 8 | 9 |
| replay desire | 8 | 9 |
| average | 8.6 | 9.1 |

## Human View and Playwright proof

Before:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-post-clear.png`
- `evidence/human-view-before-material-return.png`

After:

- `evidence/human-view-final-first-screen.png`
- `evidence/human-view-final-recipe-open.png`
- `evidence/human-view-final-grove-return.png`
- `evidence/human-view-final-recipe-ready.png`
- `evidence/human-view-final-emberplate-forged.png`
- `evidence/human-view-final-wave-two-guard.png`
- `evidence/human-view-final-recovery.png`
- `evidence/human-view-final-siege-one-retry.png`

Playwright used actual keyboard input to build, move, start, chase and strike threats, clear Siege 1, enter Grove, harvest wood, return, enter Ashes, harvest obsidian, return, forge Emberplate with `B`, start later pressure, breach naturally, prove retry rejection with no structure, rebuild, and restart the same siege number. It also opened/check/unchecked/closed Advanced diagnostics. Final console result: zero errors and zero warnings.

## Validation

- all existing `tests/hellscape*.mjs` entrypoints
- affected JavaScript syntax checks
- changed JSON parse checks
- `git diff --check`
- fresh local HTTP runtime, Playwright physical loop, screenshots, matched performance, growth checkpoints, diagnostics cleanup, and console capture

## Audits

- Ownership: Core stayed read-only. ProtoKits stayed clean and unchanged. Authored recipe/tuning, browser input, copy, HUD, and Canvas remain local. Existing local build and wave kits own deterministic fortification, mitigation, and retry behavior.
- Diversity: this remains the same seven-feature action-defense/extraction signature. It adds no kit, experiment, route family, production signature, or production count.
- Feature migration: no source, route, scene, mechanic, asset, public API, export, or ledger entry was deleted, retired, merged, or migrated. `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.
- Valuable union: Grove/Crystal/Ashes, harvesting/pickups, inventory, three blueprints, structures, waves, core/player combat, failure/recovery, progression, all readiness APIs, renderer handoffs, diagnostics, and bounded FX survive.

## Exact next playable improvement

After Emberplate survives a siege, make the Crystal route fund one readable Sentry choice through the existing blueprint, inventory, structure, and hero-control owners.
