# Agent Process

This file defines the repeatable agent cycle for `NexusRealtime-Experiments`.

## Standard Cycle

1. Read current memory.
2. Identify the current ledge.
3. Choose one bounded patch.
4. Make only that patch.
5. Run or name the relevant checks.
6. Update `.agent` memory.
7. Leave the next ledge explicit.

## Current Memory

Start from:

```txt
.agent/START_HERE.md
.agent/cycle-state.md
.agent/route-canonicalization.md when route-related
latest relevant .agent/cycle-reports/* when available
```

## Bounded Patch Rule

Prefer one clear patch over broad mixed work. A patch should have one primary purpose, such as:

- a manifest/test alignment;
- one route-host seam shrink;
- one replay/spec guard;
- one documentation correction;
- one agent-memory update;
- one bounded ProtoKit consumption patch.

Do not combine unrelated route, kit, renderer, manifest, and documentation changes unless the user explicitly asks for a bundled pass.

## Ledger Rule

No large route pruning, kit promotion, route addition, destructive fold, replay-lane claim, or DSK boundary change should happen without an `.agent` ledger note or cycle report explaining why.

Use `.agent/turn-ledger/` for meaningful per-turn records that affect architecture, route state, validation, replay state, pruning decisions, kit boundaries, or future agent direction.

Do not require ledger entries for tiny typo fixes.

## Checks Rule

Run the narrowest meaningful check when possible. If checks cannot be run, record the reason in the ledger or cycle-state update. Documentation-only patches may state that no runtime behavior changed.

## Next Ledge Rule

End each meaningful turn with the next smallest safe action. The next ledge should be actionable without a full rediscovery pass.
