# Experiment Map

Track canonical experiments and the domains each route validates.

Constraints:

- Harden toward about 20 strong canonical experiments.
- Treat 20 as guidance, not a rigid quota.
- Merge overlapping routes and features when higher-level domains emerge.
- Keep routes thin and renderer-presentational.
- Kit implementation belongs in ProtoKits.

Canonical target list:

1. Fogline Relay
2. Signal Bastion
3. Zombie Orchard
4. Next Ledge
5. The Open Above
6. Downhill Prix
7. Harbor Salvage
8. Cargo Chain
9. Sky Courier
10. Orbital Dockyard
11. Shadow Museum
12. Factory Pulse
13. Floodplain Rescue
14. Drone Swarm Survey
15. Trainyard Switcher
16. Crystal Cavern Rally
17. Biodome Wrangler
18. Dungeon Relay
19. Mech Bastion
20. Market Mayhem

## 2026-06-23 Twenty Game Refiner finding

Observed portfolio state:

- The durable target above still names 20 intended canonical pressure routes, but `experiments/domain-kit-cutover-manifest.json` currently records a smaller canonical cutover set: `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, `signal-bastion`, and `rogue-lite-hellscape-siege`.
- The root arcade still contains a very large `aaa-seed` list, while the generated gallery pipeline discovers real `experiments/`, generated `apps/`, and `games/` routes instead of preserving every seed as a canonical route.
- Treat the 20-name list as an evaluation lens, not as a committed manifest. A seed should only become canonical when it creates reusable ProtoKit pressure through DSK resources, events, methods, snapshots, descriptors, smoke tests, or replay scenarios.
- The strongest near-term refiner work is to reconcile the 20-target memory with the canonical cutover manifest by either mapping target names onto existing strong routes or explicitly marking them as seed/backlog rather than playable-canonical commitments.

Route pressure clusters:

- Survey-pressure: `fogline-relay`, `starwell-cartographer`, `lumen-reef-cartographer`, `gravemark-cartographer`, and `drone/swarm/survey` candidates should pressure `scan-survey-kit`, `zone-field-kit`, `timed-pressure-director-kit`, `hazard-director-kit`, and replayable scan traces.
- Defense-pressure: `signal-bastion`, `rogue-lite-hellscape-siege`, `zombie-orchard`, `hollow-warden`, `beetle-siege`, and `prism-bastion-sealer` should collapse into clearer defense/survival/horde DSK boundaries instead of route-specific wave code.
- Traversal-cargo-pressure: `next-ledge`, `tideglass-salvage`, `skyrig-suture`, `ember-rail`, `catacomb-postmaster`, `neon-courier-reef`, and harbor/cargo/chain targets should validate route checkpoint, cargo delivery, tether, vehicle/contact, and resource pressure layers.
- Aerial/open-world pressure: `sora-the-infinite`, `the-open-above-harness`, and `the-open-above` should converge on a higher-level aerial traversal domain above flight feel, terrain windows, camera rigs, route checkpoints, and visual descriptors.
- Social/market/workshop pressure: `clockwork-verdict`, `rift-bazaar`, `saffron-skull-market`, `tarot-engine-broker`, and `market-mayhem` should stay seed/backlog until a reusable decision/economy/social DSK boundary exists.

Refiner decision rule:

Promote or preserve a route only if it validates at least one reusable domain boundary and has a path to headless fixed-tick smoke plus deterministic replay. Fold or demote routes that only add fantasy/renderer variance without new DSK pressure.

## 2026-06-24 Twenty Experiment Seeder route-progress finding

The canonical portfolio should stay conservative rather than forcing the 20-name target list into the manifest. The current manifest-owned set remains the right executable/hardening set until additional lanes prove reusable DSK consumption.

New seeding opportunity:

- `generic-route-progress-kit` now gives the traversal/cargo cluster a concrete atomic route/checkpoint/objective-progress boundary.
- `generic-route-cargo-extraction-kit` now gives the traversal/cargo cluster a concrete composite above route progress, cargo/resource ledger, and pressure channels.
- `next-ledge` should be the first canonical route candidate to consume these route DSKs because it already represents the manifest-owned traversal/checkpoint lane.

Portfolio implications:

- Seed/harden `next-ledge`; do not add Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, or similar checkpoint/cargo variants as filler canonical routes.
- Keep those names as backlog/variant pressure for the higher-level delivery/extraction loop unless one proves a distinct reusable boundary beyond route progress, cargo/resource ledger, pressure channels, renderer-agnostic descriptors, and deterministic replay.
- Do not claim local experiment JavaScript shrink yet. The completed ProtoKit work creates the opportunity; shrink is only true after a route consumes the new boundary and drops route-local checkpoint/cargo ledger code.

Seeder decisions by current manifest route:

- `next-ledge`: seed + harden as first `generic-route-progress-kit` consumer candidate; migrate only ordered checkpoint/progress ledger first, then evaluate `generic-route-cargo-extraction-kit` after the metadata/contract smoke is in place.
- `fogline-relay`: harden as survey-pressure contract; keep cartographer/drone variants folded until scan/zone/hazard DSKs exist.
- `nexus-frontier-signal-isles`: harden as field-engineer composition showcase; do not let it become a sink for unrelated route concepts.
- `sora-the-infinite`: harden as aerial/open traversal contract; fold Open Above and racing variants until aerial traversal DSKs are clearer.
- `zombie-orchard`: harden as survival ecology contract; fold horde/survival variants until agent/hazard/resource DSK replay exists.
- `signal-bastion`: keep canonical and harden remaining browser convenience seams; it remains the only executable route-domain replay lane.
- `rogue-lite-hellscape-siege`: harden unified action-defense-extraction base route; keep extraction/dungeon/dockyard variants folded until route/cargo/extraction DSK consumption is proven.
