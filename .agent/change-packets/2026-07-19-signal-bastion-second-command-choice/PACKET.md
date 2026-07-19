# Signal Bastion Second-Command Choice Packet

- Packet: `2026-07-19-signal-bastion-second-command-choice`
- Date: 2026-07-19
- Experiment-game: `games/signal-bastion/`
- Experiments start: `454b1d7451ebd6f7d593b4a668457be697bf4917`
- Experiments production: `6d03359bb9b93bd0256a7b5dcc2dc40ef4b24f9a`
- Experiments final receipt: the commit containing this packet, reported after publication
- ProtoKits start: `194d37714d7c23984970e09015b5dd4bffbbab7b`
- ProtoKits final: `5986b69b047d622ea2efe58d12876033f3de2291`
- Core read-only reference: `a5882b47bd5a9284550bb3af1f0cd8580c62665e`

## Result

Signal Bastion's first clear now pays its authored reward and presents one real Dense Braid command: spend `38 CR` to upgrade the starter Bolt Spire or `76 CR` to add a visible Volt Web specialist. Both choices use existing input and domain commands, visibly confirm the outcome, and clear Wave 2 at full core health.

## Selection and finding

The sidecar's exact next Signal Bastion task was safe after both writable default branches reconciled clean and the builder's current Next Ledge row showed no overlap. Baseline physical play scored this post-clear slice `6.9`: the first wave claimed `+24` but left only `63 CR`, the specialist choice remained buried, Dense Braid pressure was not previewed, and the selected Bolt's panel advertised three upgrade branches and prices that the runtime did not implement.

The root defects were reusable. Session emitted `EconomyCredit` after the resolve-phase economy system had already run, so the wave reward disappeared when events cleared. The presentation stack independently invented upgrade branches instead of mirroring the structure DSK's one level-scaled upgrade command.

## Feature contract

- Player purpose: answer the first clear with a deliberate power or coverage command before Dense Braid.
- Target feeling: understand the incoming mix, afford either answer, commit instantly, and see that choice survive real pressure.
- Ownership: generic-defense DSKs own wallet settlement, structure upgrades/builds, wave state, combat, session, and renderer-neutral descriptors; the route owns authored choice data, derived player guidance, browser DOM, and Canvas projection.
- Exclusions: no Core edit, new control, new persistent state, new event type, duplicated simulation, diagnostic overlay, source retirement, public API removal, or standalone test file.
- Hero actions: clear Wave 1; select Bolt then press `U`, or click Volt then a build pad; start and clear Wave 2.
- Advanced actions: the remaining eight specialists, sell/cycle/cancel controls, and readiness diagnostics stay under disclosure.
- Resources/state: existing economy transactions, structure roster/levels, session wave index/status, authored wave groups, build catalog, and presentation snapshot.
- Events/methods: existing wave completion, economy credit/debit, build, upgrade, start-wave, terminal loss, and restart paths.
- Snapshots/descriptors: one derived `playerMission.secondCommand`, existing tower/unit/UI descriptors, and the existing raw session snapshot only in the host bridge.
- Dependencies: read-only Core plus pinned ProtoKits `5986b69b047d622ea2efe58d12876033f3de2291`.

## Real ProtoKit features composed

1. generic-defense map and vital-target DSK
2. economy-wallet DSK with cleanup-phase settlement
3. build-placement and structure-upgrade DSK
4. wave and agent-director DSK
5. combat-resolver DSK
6. session facade and session-command kit
7. render-descriptor DSK
8. generic-defense presentation stack with command-accurate upgrade preview

## Concrete refinement

- Moved economy settlement after all resolve producers; `wave-reward:wave-01` now credits exactly `24 CR`, producing the expected `87 CR` bank after the starter-line clear.
- Replaced three false upgrade previews with the single implemented `Upgrade · U` command, exact level-scaled price, and actual `+34% damage / +8% fire rate / +10 range` gains.
- Authored the Bolt-versus-Volt command in preset content and derived visibility, cost, affordability, completion, next-wave label, and `7 Runners + 3 Brutes` preview from existing state.
- Promoted Volt from the default-closed specialist disclosure only during the decision, retained its true `6` quick-select label, and removed it from the disclosure copy to avoid duplication.
- Added one descriptor-driven Bolt field ring and one highlighted Volt card; choosing either removes the undecided signal and confirms the command in the existing mission and tower-panel owners.
- Versioned the complete changed browser dependency path after physical replay caught a stale preset module behind the already-busted boot URL.

## Final integration, cleanup, and performance

- Declarative choice data stays in the preset; deterministic settlement and upgrade behavior stay in ProtoKits; browser input remains unchanged.
- One `playerMission.secondCommand` descriptor feeds mission copy, tower ordering, and the Canvas affordance. No parallel economy, wave, choice, or completion state was added.
- The one real upgrade preview replaces superseded fake branches. Volt has one visible owner during the choice and remains under Advanced otherwise.
- Default diagnostics remain closed; explicit open/check/uncheck/close returned `advancedOpen=false`, `diagnosticsVisible=false`, and the root flag to `false`.
- All maps, 12 towers, 30 waves, enemies, bosses, campaign data, placement, sell, upgrades, combat, pressure, win/loss/restart, readiness APIs, and diagnostic handoffs remain present.

Matched physical three-tower Wave 1 launch, 30-frame warm-up, and 180-frame active window:

| Metric | Before | After | Gate |
| --- | ---: | ---: | --- |
| average frame time | 33.333 ms | 16.667 ms | no regression |
| measured FPS | 30.0 | 60.0 | no regression |
| p95 frame time | 34.3 ms | 16.8 ms | no regression |
| DOM nodes | 108 | 108 | unchanged |
| Canvas nodes | 1 | 1 | unchanged |
| raw descriptors at sample end | 16 | 17 with three active agents | bounded |
| long tasks | 0 | 0 | clean |
| console errors/warnings | 0 / 0 | 0 / 0 | clean |
| available heap interval | 33.2 -> 36.0 MB | 25.6 -> 32.2 MB | allocation signal only |

The browser cadence changed between samples, so the timing delta is treated as a regression gate rather than attributed solely to this patch. A separate post-clear steady window held `108` DOM nodes and `13` raw descriptors with zero growth. Five later heap checkpoints (`69.8`, `35.2`, `50.9`, `66.6`, `31.8` MB) showed repeated collection instead of unbounded retention.

## Feel score

| Dimension | Before | After |
| --- | ---: | ---: |
| responsiveness | 9 | 9 |
| predictability | 6 | 10 |
| readability | 5 | 10 |
| impact | 7 | 8 |
| recovery | 9 | 9 |
| delight | 6 | 8 |
| replay desire | 6 | 9 |
| average | 6.9 | 9.0 |

## Human View and Playwright proof

Before:

- `evidence/human-view-before-first-screen.png`
- `evidence/human-view-before-line-ready.png`
- `evidence/human-view-before-active-wave.png`
- `evidence/human-view-before-post-clear.png`

After:

- `evidence/human-view-after-first-screen.png`
- `evidence/human-view-after-post-clear-choice.png`
- `evidence/human-view-after-upgrade-preview.png`
- `evidence/human-view-after-upgrade-command.png`
- `evidence/human-view-after-upgrade-wave2-active.png`
- `evidence/human-view-after-upgrade-wave2-clear.png`
- `evidence/human-view-after-specialist-command.png`
- `evidence/human-view-after-specialist-wave2-clear.png`
- `evidence/human-view-after-hard-failure.png`
- `evidence/human-view-after-hard-recovery.png`
- `evidence/human-view-after-final-diagnostics-closed.png`
- `evidence/signal-bastion-second-command-upgrade.webm`

Playwright used physical Canvas, button, tower-card, keyboard, Advanced, diagnostics, and Rebuild interactions. The upgrade branch spent `38 CR`, produced Bolt level `2` with `29` damage / `136` range / `1.2744` fire rate, and cleared Wave 2 at `24/24` core. The alternate branch spent `76 CR`, built Volt in `slot-d`, and also cleared Wave 2 at `24/24`. Hard mode breached at `0/18`; Rebuild restored planning, wave `0`, `18/18` core, `155 CR`, and zero structures.

## Validation

- focused generic-defense and presentation-stack ProtoKit tests
- full ProtoKit `npm test`
- all 23 existing `tests/signal-bastion*.mjs` entrypoints
- full Experiments `npm run check` (`1038` JS/MJS syntax checks plus repository smokes)
- affected JavaScript syntax and JSON parse checks
- `git diff --check`
- fresh HTTP runtime, Human View screenshots/video, dual-branch Playwright replays, hard failure/recovery, disclosure cleanup, performance/growth sampling, and zero-message console checks

## Audits

- Ownership: Core stayed read-only. ProtoKits owns deterministic wallet/upgrade behavior and reusable presentation truth. Experiments owns authored content plus browser-local mission, DOM, and Canvas projection. The renderer consumes descriptors and never mutates the engine.
- Diversity: this strategic defense economy command is distinct from Next Ledge traversal/cargo and Hellscape action-defense/resource crafting; it creates no catalog or production-count claim.
- Feature migration: no source, mechanic, route, scene, public API, or reference was removed, so `feature-migration-ledger.json` and `retirement-ledger.md` remain unchanged.
- Valuable union: objectives, pressure, rewards, failure/recovery, progression, state continuity, all content, advanced readiness surfaces, and both command branches survived consolidation.

## Exact next playable improvement

During Dense Braid, let the first Brute break visibly confirm the selected command with one focused Bolt break flash or rapid Volt crossfire beat through existing combat-VFX descriptors and Canvas feedback, without another state or control owner.
