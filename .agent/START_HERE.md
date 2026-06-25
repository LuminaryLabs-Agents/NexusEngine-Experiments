# Agent Start Here

`.agent/` is the repo-local source of truth for agent work in `NexusRealtime-Experiments`.

Before architecture, route, pruning, kit, experiment, validation, replay, or test decisions:

1. Read `.agent/START_HERE.md`.
2. Read `.agent/cycle-state.md` for the current project state.
3. Read `.agent/route-canonicalization.md` when touching canonical routes, route folds, route additions, replay lanes, or seeder pressure.
4. Read the latest relevant `.agent/cycle-reports/*` file when a prior cycle report exists for the current concern.
5. Make one bounded change that advances the current ledge.
6. Record the result in `.agent/turn-ledger/`, `.agent/cycle-state.md`, or a cycle report.

## Operating Rule

Agent work should preserve the current NexusRealtime direction:

- Grow reusable ProtoKit domain layers.
- Shrink local experiment JavaScript over time.
- Keep reusable implementation in ProtoKits, not Experiments.
- Keep browser, renderer, DOM, Canvas, WebGL, Three.js, audio, pointer input, and asset loading out of reusable kit logic.
- Keep route additions, destructive folds, canonical-route changes, and replay-lane claims documented before or with the change.

## Minimum Read Set

```txt
.agent/START_HERE.md
.agent/cycle-state.md
.agent/route-canonicalization.md when route-related
latest relevant .agent/cycle-reports/* when available
```

## Leave the Next Ledge

Every meaningful agent turn should end with a specific next ledge: the next smallest safe patch, check, audit, or decision that another agent can pick up without rediscovering the whole state.
