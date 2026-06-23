# Cycle Report Main Push Planner — 2026-06-23 17:30

## What changed

This cycle made a safe `.agent`-only reconciliation push after reviewing current Experiments memory, ProtoKits memory, package wiring, Signal Bastion browser boot, and replay/smoke state.

No reusable kit implementation was pushed to Experiments. No route folders were deleted. No browser renderer, DOM, Canvas, WebGL, audio, asset-loading, or pointer-lock logic was moved into reusable kit surfaces.

Updated durable memory to remove stale import-gate/backlog language now that the Signal Bastion strategic-pressure executable replay is package-wired and ProtoKit-backed.

## Long-form intent from `.agent`

The ecosystem should grow reusable DSK-based domain layers while shrinking local experiment JavaScript.

- Core owns stable runtime primitives, deterministic tick behavior, promoted contracts, and mature reusable surfaces.
- ProtoKits owns reusable domain-service kits before Core promotion.
- Experiments owns thin playable validation hosts: routes, presets, bridges, manifests, docs, tests, and renderer-only presentation.
- DSKs are layered communication boundaries that connect domains through resources, events, methods, snapshots, and descriptors.

## Repo state vs `.agent`

Repo state mostly matches `.agent`.

Current match:

- Experiments has package-level dev dependencies for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`.
- Signal Bastion has the strongest current proof: the strategic-pressure lane has executable route-domain replay coverage against real Core plus ProtoKits generic-defense DSK aliases.
- Browser boot now imports `generic-defense-aaa-dsk-bridge` and requests the seven named DSK aliases rather than the broad `createGenericDefenseKits()` compatibility facade.
- The manifest-owned canonical route set remains intentionally smaller than the historical 20-route target list.

Drift reconciled this cycle:

- `.agent/protokit-map.md` still described local import wiring as a blocker for executable replay.
- `.agent/domain-backlog.md` still carried the package-wiring backlog as open.
- `.agent/route-canonicalization.md` still treated the Signal Bastion executable replay gate as blocked.
- `.agent/candidate-promotions.md` was empty even though the current promotion boundary is clear.

## DSK boundary clarity

DSK boundaries are clearer after this memory update.

The strategic-pressure lane should now be treated as:

- ProtoKit-owned reusable logic: generic-defense DSK aliases and replayable domain behavior.
- Experiment-owned host logic: browser boot, input bridge, preset selection, renderer projection, manifests, specs, and tests.
- Still not promotion-ready: the broad generic-defense AAA compatibility facade.

## Local experiment JavaScript shrink status

No code shrink happened in this cycle. Local route JavaScript did not grow either.

The next shrink target is now explicit: reduce Signal Bastion browser-host convenience facades only where bridge/spec/executable/facade smokes stay green.

## What should be built next

Safest next implementation patch:

1. Inspect Signal Bastion `boot.js`, `input-host.js`, and renderer usage for convenience-facade calls that can be replaced with already-proven generic-defense DSK/session/presentation methods.
2. Add or strengthen a static smoke first so the allowed facade list shrinks intentionally.
3. Make one small browser-host migration at a time.
4. Run full checks and deploy checks after each scoped change.

Do not add a second executable route-domain replay lane until another reusable ProtoKit boundary exists.

## What should be pruned

Prune stale `.agent` language first. Do not destructively delete route folders yet.

Potential future pruning:

- Broad Signal Bastion browser convenience facade calls.
- Defense/survival/action variants only after the canonical route has browser-host migration evidence plus replay coverage.
- Seed/backlog routes that only add fiction or renderer variance without new DSK pressure.

## ProtoKits to promote or prepare

Continue preparing:

- `generic-pressure-loop-kit`.
- `generic-resource-loop-kit`.
- `generic-action-window-kit`.
- `generic-affordance-descriptor-kit`.
- `generic-defense-dsk-boundaries` atomic aliases: map, economy wallet, build placement, wave/agent director, combat resolver, session facade, render descriptors.

Do not promote:

- The broad `generic-defense-aaa-kits` / compatibility facade.
- Browser presentation or asset/input/rendering logic.

## Canonical experiments

Keep the manifest-owned canonical set stable:

- `next-ledge`.
- `fogline-relay`.
- `nexus-frontier-signal-isles`.
- `sora-the-infinite`.
- `zombie-orchard`.
- `signal-bastion`.
- `rogue-lite-hellscape-siege`.

Treat the older 20-route list as a pressure/evaluation lens, not a brittle manifest quota.

## Smoke/replay gaps that matter

Closed before this cycle:

- Signal Bastion strategic-pressure executable route-domain replay.
- Browser DSK bridge migration guard.
- Host-facade guard for the remaining compatibility seam.

Still open:

- Browser-host convenience facade reduction for Signal Bastion.
- Executable route-domain replay for any non-strategic-pressure lane.
- Real reusable ProtoKit boundaries for survey pressure, traversal/cargo, aerial/open traversal, survival ecology, field-engineer composition, and action-defense-extraction.

## Direct-main push plan executed

Target repo: `LuminaryLabs-Agents/NexusRealtime-Experiments`  
Target branch: `main`

Commit groups pushed:

1. `docs(agent): reconcile protokit map after executable replay`
   - `.agent/protokit-map.md`
2. `docs(agent): update backlog after replay import wiring`
   - `.agent/domain-backlog.md`
3. `docs(agent): update canonicalization after replay gate closure`
   - `.agent/route-canonicalization.md`
4. `docs(agent): record experiment promotion candidates`
   - `.agent/candidate-promotions.md`
5. `docs(agent): update cycle state for 1730 planner`
   - `.agent/cycle-state.md`
6. `docs(agent): add 1730 main push planner report`
   - `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner-1730.md`

Code files updated: none.  
Test files updated: none.  
`.agent` files updated: six files listed above.

## Test plan

No runtime tests were run because this was a documentation and durable-memory-only push.

Next code/test patch should run:

```bash
npm run check
npm run check:deploy
```

For a facade-shrink implementation patch, also verify the Signal Bastion route manually in a browser because the intended change affects host compatibility.

## Rollback notes

Rollback is low-risk. Revert the six `.agent` commits above if a later code audit shows the executable replay or browser bridge state was misread.

No route/code/test rollback is required because no runtime files changed.

## What remains for the next cycle

Safest next main-branch patch:

- Target repo: `LuminaryLabs-Agents/NexusRealtime-Experiments`.
- Target branch: `main`.
- Scope: Signal Bastion browser-host facade shrink, guarded by tests first.
- Files likely affected: `tests/signal-bastion-host-facade-guard-smoke.mjs`, `games/signal-bastion/src/boot.js`, possibly `games/signal-bastion/src/input-host.js`, and matching `.agent` notes.
- Abort if the change requires copying ProtoKit logic, broadening route-local simulation, or weakening the existing replay/bridge/facade smokes.
