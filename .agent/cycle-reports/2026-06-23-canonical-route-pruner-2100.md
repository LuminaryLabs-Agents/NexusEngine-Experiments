# Canonical Route Pruner — 2026-06-23 21:00

## What changed

Signal Bastion's browser host now consumes the ProtoKit generic-defense DSK namespace for the migrated strategic-pressure seam:

- `games/signal-bastion/src/boot.js` now reads route state and presentation fallback through `engine.n.genericDefense.sessionFacade` and `engine.n.genericDefense.renderDescriptors` helpers.
- `games/signal-bastion/src/input-host.js` now bridges selection, upgrade, wave start, restart, and snapshot reads through `engine.n.genericDefense.sessionFacade` instead of direct broad `engine.genericDefense`, `engine.defenseWaves.startWave`, or `engine.defenseBuild.upgrade` calls.
- `experiments/signal-bastion-route-domain-replay.json` now records namespaced DSK methods as the executable strategic-pressure route-domain replay path.
- Signal Bastion static, bridge, spec, executable replay, and facade-guard smokes now guard the DSK namespace migration and the remaining explicit convenience seams.

No reusable kit implementation was added to Experiments. The only implementation changes are browser-host bridge changes plus manifests/tests/memory.

## Long-form intent check

`.agent/intent.md` still says Experiments should be thin validation hosts for reusable ProtoKit domains, while reusable kit implementation belongs in ProtoKits. ProtoKits `.agent` says the ecosystem goal is cumulative expansion through reusable domain layers and DSK communication through resources, events, methods, snapshots, and descriptors.

## Repo state vs `.agent`

Repo state is closer to `.agent` after this pass. The prior memory called for shrinking the Signal Bastion browser-host convenience facade seam after executable replay coverage existed. This pass moved the common browser route bridge calls onto `engine.n.genericDefense.<boundary>` without deleting routes or copying ProtoKit simulation into Experiments.

One drift remains: `LuminaryLabs-Dev/NexusRealtime` is accessible, but Core `.agent/intent.md` was not present when checked. Continue treating Core `.agent` as unreviewed until it exists or can be fetched.

## DSK boundary clarity

The strategic-pressure lane is clearer:

- ProtoKits still own map, economy wallet, build placement, wave/agent director, combat resolver, session facade, and render descriptor boundaries.
- Signal Bastion now uses the DSK namespace for session-facing route methods and descriptor fallback.
- Remaining convenience surfaces are explicitly guarded rather than hidden: build blueprint/sell, wave preview, foundation digest, and scale budget.

## Local JavaScript shrink

Local experiment JavaScript is shrinking in ownership, not file count. Browser-host code now contains fewer broad gameplay facade calls and more narrow DSK-namespace bridge calls. The next shrink should target only the remaining explicit convenience seams when there is a tested namespaced or descriptor-only replacement.

## Higher-level domains

The strongest domain remains `strategic-pressure-loop`. Other lanes remain contract-only until real reusable ProtoKit DSK surfaces exist:

- survey pressure
- traversal/cargo pressure
- survival ecology
- aerial/open traversal
- field-engineer composition
- action-defense-extraction

## ProtoKit direction

Build/keep/promote later:

- `generic-defense-dsk-boundaries` and its seven atomic aliases.
- `generic-defense-aaa-dsk-bridge` as a migration bridge, not a final Core-promotion surface.
- `engine.n.genericDefense.<boundary>` as the preferred browser-host call seam.

Do not promote yet:

- the broad `generic-defense-aaa-kits` facade.
- non-strategic canonical lanes that still lack real imported DSK surfaces and executable replay.

## Experiment canonicalization

Keep canonical and harden:

- `signal-bastion` as the only route with executable route-domain replay proof.
- `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, and `rogue-lite-hellscape-siege` as manifest-backed canonical routes with contract-only lanes.

Keep folded/held as metadata, not destructive deletion:

- defense, survival, traversal, survey, aerial, and action-defense variants until their canonical route plus replay/host evidence is strong enough to absorb them safely.

## Missing smoke/replay

Still missing:

- A real executable lane for survey, traversal/cargo, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction.
- A namespaced or descriptor-safe replacement for the remaining Signal Bastion browser convenience seams: `defenseBuild.setBlueprint`, `defenseBuild.sell`, `defenseWaves.previewNextWave`, `defenseFoundation.getSnapshot`, and `defenseScale.getBudgetSnapshot`.
- Local check execution in this automation environment; repo updates were made against static source/manifest guards, but `npm run check` should still be run in a normal checkout with dependencies installed.

## Pushed directly to main

- `games/signal-bastion/src/boot.js`
- `games/signal-bastion/src/input-host.js`
- `experiments/signal-bastion-route-domain-replay.json`
- `tests/signal-bastion-executable-route-replay-smoke.mjs`
- `tests/signal-bastion-replay-bridge-smoke.mjs`
- `tests/signal-bastion-route-domain-replay-spec-smoke.mjs`
- `tests/signal-bastion-host-facade-guard-smoke.mjs`
- `tests/signal-bastion-static-smoke.mjs`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/cycle-reports/2026-06-23-canonical-route-pruner-2100.md`

## Safest next main-branch patch plan

1. Run `npm run check` in a normal checkout with GitHub package dependencies installed.
2. If green, replace one remaining convenience seam at a time with the smallest DSK namespace or descriptor-facing method.
3. Prefer starting with read-only seams (`getWavePreview`, `getScale`, `getFoundation`) before mutation seams (`setBlueprint`, `sell`).
4. Do not add another executable canonical lane until another reusable ProtoKit boundary is real and importable.
