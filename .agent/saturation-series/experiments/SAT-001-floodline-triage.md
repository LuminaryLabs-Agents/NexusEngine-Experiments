# SAT-001 — Floodline Triage

Status: validated / kit-reviewed / preserved
Disposable/preserved root: `experiments/floodline-triage/`
Selected: 2026-07-19

## Immutable Prompt

Play a flood-rescue dispatcher who must keep route intelligence fresh, stabilize three stranded people, and move them across one failing causeway before the storm closes the window.

## Semantic Boundary

Primary stress edge: temporal ordering across observer-specific navigation knowledge, fictional rescue triage, and structural support failure.

The route owns authored scenario data, player action ordering, win/loss composition, browser input, and presentation. It must not own parallel route-confidence, casualty-severity, treatment, structural-margin, or failure state.

## Player Loop

```txt
select site -> scout route -> stabilize casualty -> brace causeway when needed
-> evacuate across known route -> repeat under deterioration/staleness -> ending -> restart
```

Carried state: route confidence decays, casualty severity changes, transport readiness persists, causeway load accumulates, and evacuation outcomes affect the ending.

## Quality Bar

- A first-time player can identify the objective and four hero actions within five seconds.
- Three site cards, the selected site, route confidence, triage state, causeway margin, turn pressure, and action feedback are visually legible.
- Scouting, stabilization, bracing, evacuation, causeway collapse, success, and restart are all visibly distinct.
- The route has a coherent start, escalating middle, climax, win/loss ending, and deterministic restart.
- Advanced domain evidence remains closed by default.

## Performance Budget

- target: 60 FPS; average frame time <= 20 ms; p95 <= 30 ms on the validation run
- one Canvas; <= 90 DOM nodes; zero long tasks during the bounded route
- bounded domain journals/command ledgers and no monotonic DOM/entity growth across restart
- zero console errors or warnings

## Required Evidence

- launch and first-screen screenshot
- physical pointer/keyboard control walkthrough
- successful three-site evacuation with carried state visible
- intentional unbraced evacuation causing structural failure
- deterministic restart and repeatable final snapshots
- Advanced closed/open/closed proof
- Core and three domain installation proof
- frame, DOM, Canvas, long-task, console, and bounded-growth metrics
- final capability disposition table plus consolidation/parity decision

## Explicit Exclusions

- no new Core or ProtoKit implementation before postgame gap evidence
- no network, persistence, inventory, clinical simulation, pathfinding, physics provider, 3D renderer, procedural content, or campaign layer
- no second experiment until this unit is fully reconciled

## Validation Result

Decision: `passed`

- Launch: `http://127.0.0.1:4173/experiments/floodline-triage/`
- Physical controls: pointer Scout/Stabilize/Evacuate failure route; keyboard Brace/Scout/Stabilize/Evacuate plus site cycling for the successful route.
- Failure: an unbraced North Pump crossing failed the unsupported east span on Turn 3 and produced the visible `Causeway Lost` ending.
- Success: all three casualties stabilized and evacuated on Turn 10; the braced causeway carried `8 / 8` load with `0` margin and no failure.
- Restart/replay: two complete scripted replays produced byte-identical domain snapshots.
- Advanced: closed/open/closed passed and exposed pinned baselines plus all installed domain APIs without dominating the hero flow.
- Human View: first-time readability, objective clarity, task completion, failure feedback, and restart passed.
- Performance: `16.666 ms` average, `17.7 ms` p95, `60 FPS`, `80` DOM nodes, one Canvas, zero long tasks.
- Console: zero errors and zero warnings.
- Checks: 1,039 JS/MJS syntax files; 251 HTML / 605 JS static-site files; flat routes; gallery coverage; semantic bounded ProtoKit replay; diff hygiene all passed. Existing legacy static-site warnings were unchanged and did not involve SAT-001.

Evidence:

- `.agent/change-packets/2026-07-19-saturation-001-floodline-triage/evidence/first-screen.png`
- `.agent/change-packets/2026-07-19-saturation-001-floodline-triage/evidence/structural-failure.png`
- `.agent/change-packets/2026-07-19-saturation-001-floodline-triage/evidence/success.png`
- `.agent/change-packets/2026-07-19-saturation-001-floodline-triage/evidence/advanced-open.png`

## Capability Dispositions

| Observed responsibility | Disposition | Owner / decision |
| --- | --- | --- |
| realtime world, resources, events, install/reset/snapshot contracts | Core-reused | NexusEngine Core |
| observer route facts, decay, staleness, provenance | domain-reused | Navigation Knowledge |
| assessment, deterioration, treatment, stabilization, readiness, outcomes | domain-reused | Rescue Triage |
| support topology, absolute load, margin, repair state, failure propagation | domain-reused | Structural Support Network |
| route-fresh plus transport-ready evacuation rule | specialization | route policy composed from existing domain facts |
| site fiction, load tuning, turn cap, ending order | local-only | SAT-001 route content/composition |
| keyboard and pointer translation | adapter-only | browser host |
| Canvas/HUD projection | adapter-only | browser presentation |
| generic `rescue-dispatch-orchestrator` | rejected | one consumer, no new atomic meaning, existing owners already compose it |
| persistent generic readiness gate for this route | merged duplicate | existing condition/gate family already owns reusable multi-condition gates; SAT-001 needs no second state owner |

Newly accepted atomic capabilities after consolidation: **0**.

## Lessons

- The strongest decision is not which casualty to click; it is when to refresh knowledge relative to treatment and crossing, because reports decay while severity advances.
- One visible support action makes the structural domain legible; allowing an unbraced crossing creates a concrete failure lesson without extra systems.
- Domain snapshots made the Advanced view trustworthy while the first screen stayed focused on four player commands.
- The late site's higher deterioration creates escalation using existing triage tuning rather than a new director.
- Next experiment should move away from rescue, infrastructure, map dispatch, and countdown evacuation to preserve semantic diversity.

## Retirement

Preserved. No cleanup requested; later domain changes must revalidate this proof before invalidating it.
