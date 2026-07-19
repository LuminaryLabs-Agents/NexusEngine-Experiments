# SAT-004 — Bellows Crown

Status: validated / kit-reviewed / preserved
Disposable/preserved root: `experiments/bellows-crown/`
Selected: 2026-07-19

## Immutable Prompt

Forge a ceremonial crown through three fixed-step heats: wind the bellows until each strike window opens, land the blow before it expires, and vent enough furnace pressure to remain below failure.

## Semantic Boundary

Primary stress edge: explicit fixed time opens/expires reusable action windows while a separate pressure channel crosses stable/warning/failure thresholds.

The route owns crown fiction, current strike order, fixed half-beat command translation, win/loss composition, input, and presentation. It must not own parallel window status, attempt outcomes, pressure values, or threshold classifications.

## Player Loop

```txt
inspect current strike band -> wind half-beat -> strike while open
-> vent when heat is unsafe without letting the band expire -> complete three blows or fail -> restart
```

## Quality Bar

- Crown objective, active timing band, heat state, and three hero actions read within five seconds.
- Pending/open/completed/expired feedback and stable/warning/failed heat are visible without diagnostics.
- An early or expired strike creates a clear failure; three legal strikes create a clear success.
- Furnace/dial presentation and fixed-step rhythm are distinct from ecology, council, rescue, and map play.
- Advanced evidence stays closed by default and restart is deterministic.

## Performance Budget

- target 60 FPS; average <= 20 ms; p95 <= 30 ms
- one Canvas; <= 80 DOM nodes; zero long tasks; zero console errors/warnings

## Required Evidence

- first screen, open timing window, mistimed loss, heat warning/vent, success, restart
- pointer and keyboard play; Advanced closed/open/closed
- identical domain states across two complete successful replays
- installed Core + Action Window + Pressure proof
- performance, DOM, Canvas, long-task, console, syntax, repository, and relevant ProtoKit checks
- full capability dispositions and consolidation/parity decision

## Explicit Exclusions

- no wall-clock simulation, physics, inventory/crafting graph, equipment stats, animation state machine, audio domain, networking, or new kit implementation
- no second active experiment until SAT-004 is reconciled

## Validation Result

Decision: `passed`

- Pointer play attempted Brow Arc at beat `0.0`; Action Window returned `window-pending` and the visible `Crown Slagged` loss.
- Keyboard play completed windows at beats `0.5`, `1.5`, and `2.5`; heat entered warning at `56`, one vent lowered it to `36`, and the final strike won at `58`.
- Core's default delta clamp was observed live and the adapter was corrected to opt into a bounded `.5` maximum tick; no domain code changed.
- Two complete successful runs produced byte-identical Action Window and Pressure states.
- Advanced closed/open/closed and zero console errors/warnings passed.
- Performance: `16.667 ms` average, `16.8 ms` p95, `60 FPS`, `79` DOM nodes, one Canvas, zero long tasks.
- Syntax, focused Action Window/Pressure smokes, and diff hygiene passed.

Evidence: `.agent/change-packets/2026-07-19-saturation-004-bellows-crown/evidence/`.

## Capability Dispositions

| Observed responsibility | Disposition | Owner / decision |
| --- | --- | --- |
| deterministic scheduler, bounded clock, runtime kit lifecycle | Core-reused | NexusEngine Core |
| pending/open/expired/completed windows and attempt results | domain-reused | Action Window |
| heat value, warning/failure thresholds, adjustments | domain-reused | Pressure |
| crown content, strike order, heat costs, ending | local-only | SAT-004 route content |
| fixed half-beat command mapped to opted-in bounded Core delta | adapter-only | browser host/Core clock adapter |
| vent advances the same beat clock while lowering pressure | specialization | route rule composing two canonical domains |
| `forge-rhythm-domain` / `timed-heat-combo` | rejected | fiction-specific ordering; no independent reusable lifecycle |
| generic timed-pressure coordinator | merged duplicate | existing action-window, pressure, and condition composition already own the pieces |

Newly accepted atomic capabilities after consolidation: **0**.

## Lessons

- Core's delta clamp is a useful safety boundary; a host needing coarser authored steps must opt in explicitly.
- A separate warning threshold makes venting readable without inventing forge-specific heat state.
- The final unit must avoid timing bands, heat meters, ecology, councils, rescue, maps, and infrastructure.

## Retirement

Preserved. No cleanup authorized.
