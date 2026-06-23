# Scheduled Task Cycle

Twelve recurring lenses run 30 minutes apart. Each task repeats every 6 hours, creating one review every 30 minutes and four full cycles per day.

## Shared instruction

Review these repos and their `.agent/` folders first:

- Core: https://github.com/LuminaryLabs-Dev/NexusRealtime
- ProtoKits: https://github.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits
- Experiments: https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments

Use `.agent/intent.md`, `.agent/architecture.md`, `.agent/dsk-boundaries.md`, and `.agent/cycle-state.md` as guiding memory.

Every task must follow these constraints:

- DSKs are layered domain communication boundaries, not gap patches.
- Kit implementation belongs in ProtoKits.
- Experiments harden about 20 canonical routes without treating 20 as rigid.
- Merge features and kits into cumulative higher-level domains when possible.
- Keep Experiments thin: routes, presets, bridges, manifests, docs, tests, and renderer-only presentation.

## Task cycle

1. Intent Miner — track ecosystem intent, repo changes, and drift.
2. Atomic Domain Kit Expander — find small reusable domain boundaries for ProtoKits.
3. Composite Domain Kit Builder — layer atomic domains into higher-level composites.
4. Twenty Experiment Seeder — maintain the canonical experiment portfolio near 20 routes.
5. Domain Merge Consolidator — merge overlapping concepts into clearer domain boundaries.
6. API Surface Pruner — simplify ProtoKit APIs into clear boundary surfaces.
7. Canonical Route Pruner — fold variants into canonical routes.
8. ProtoKit Promotion Gate — identify experiment behavior ready for ProtoKits.
9. Headless Tick Smoke Builder — define fixed-tick validation for kits and routes.
10. Deterministic Replay QA — strengthen scenario replay and QA.
11. Twenty Game Refiner — refine the portfolio for domain pressure.
12. Cycle Report PR Planner — synthesize next build, prune, promote, test, or route plan.
