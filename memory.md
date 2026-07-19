# Nexus Engine Experiments Memory

## Purpose

NexusEngine-Experiments owns playable browser proof, product-specific content and tuning, renderer/input hosts, and additive game compositions built from NexusEngine Core plus real ProtoKits.

## Architecture

- NexusEngine Core is read-only authority for runtime primitives and natural-language capability ownership.
- NexusEngine-ProtoKits owns reusable, deterministic, renderer-agnostic domain behavior, resources, events, methods, snapshots, and descriptors.
- NexusEngine-Experiments owns deterministic composition records, browser/input bridges, content, tuning, presentation, routes, playable validation, and games.
- Reusable behavior found in experiments must move to ProtoKits instead of being copied across routes.
- Existing experiments and games are legacy inventory. They do not count toward the production pipeline's new 100-kit, 50-experiment, or 10-game totals.

## Capability Saturation Series

- Durable saturation state lives under `.agent/saturation-series/`; the existing production ledgers remain preserved historical inventory.
- The series is strictly sequential. One experiment may be active, and no later experiment is selected until the active unit has validation, lessons, capability classification, ownership reconciliation, and a computed new-capability count.
- Legacy playables do not count retroactively because they lack the complete saturation classification and consolidation gate.
- The streak starts at zero, increments only after a validated experiment accepts zero new atomic capabilities, and resets to zero after any validated experiment accepts one or more.
- Capability dispositions are exactly `Core-reused`, `domain-reused`, `newly accepted`, `merged duplicate`, `specialization`, `adapter-only`, `local-only`, or `rejected`.
- New atomic capability acceptance requires one semantic responsibility, a canonical owner, multiple plausible consumers, negative Core/domain evidence, deterministic lifecycle expectations, and player-visible proof. A proposal alone never counts.
- Every active experiment defines its route-domain boundary, player loop, quality bar, performance budget, failure/recovery proof, and evidence contract before implementation.
- Keep NexusEngine Core read-only. Reusable renderer-agnostic behavior belongs in NexusEngine-ProtoKits; experiment content, input, browser lifecycle, Canvas/DOM presentation, and route-specific win/loss composition stay local.

## Historical Production Pipeline

- Historical production state lives under `.agent/nexus-game-production/`.
- Each run creates one `.agent/change-packets/<packet-id>/PACKET.md`; global and repository lock artifacts are deprecated and must not be created, inspected, or honored.
- Playable experience is the production driver. Historical catalog and staged bootstrap gates are reference inventory and bookkeeping, never blockers for a coherent playable upgrade.
- Implement or extract only the reusable ProtoKits required by the active experience, then preserve and update prior ledgers and counts after the playable result.
- Bootstrap epoch 0 requires 100 accepted and implemented kits, 50 playable seeded experiments, and 10 documented games. These are minimums, not terminal caps.
- The former numbered-epoch quota remains historical inventory and does not override the active capability-saturation goal.
- Every experiment records epoch, lifecycle status, seed, draws, rejections, accepted signature, coherence, fantasy, verb, pressure, objective, visual identity, interaction structure, and validation.
- Source experiments and superseded games may be removed only after their complete feature union is inventoried, mapped to a validated successor, cleared from references, and recorded in the retirement ledger.
- Track bootstrap progress separately from lifetime-created, active, merged, archived, and retired totals. Accepted definitions do not count as created kits.

## Conventions

- Preserve existing public behavior and prefer additive composition, adapters, optional exports, and compatible registrations.
- Keep transient Playwright CLI output out of the repository through `.playwright-cli/`; durable browser evidence belongs in the owning change packet or automation evidence archive.
- Keep `npm run check` non-mutating against committed product truth; route and gallery regeneration remains an explicit `npm run generate` action.
- Keep DOM, Canvas, WebGL, Three.js, browser input, asset loading, frame presentation, and product copy out of reusable ProtoKits.
- Use seeded randomness and explicit fixed-time inputs; do not use `Math.random()` or wall-clock time in reusable simulation.
- Do not count placeholders, route shells, duplicate signatures, documentation-only games, or unlaunched gameplay.
- Validate the first screen around hero controls; keep optional or advanced controls under foldouts or dropdowns.
- Signal Bastion keeps one player-facing mission descriptor and one Canvas/HUD owner in its default view. Readiness canvases, panels, and their expanded descriptor handoffs are created only while the explicitly labeled Advanced diagnostics toggle is on, and close through an immediate presentation event rather than a polling-only cleanup path.
- Signal Bastion pins the validated `NexusEngine-ProtoKits` generic-defense commit for its browser composition. Core breach remains terminal in the reusable session DSK until the existing restart command resets the run; route presentation must not infer or mutate a parallel loss state.
- When the renderer presents a camera that differs from the simulation snapshot, pointer projection must use the presented camera. Keep the WebGL canvas unpromoted and promote the UI layer above it so scene geometry cannot compositor-overlap hero copy.
- Authored branch convergence must return through an explicit phase in the existing route-choice state; derive its generic rejoin target from the preserved projected route instead of duplicating a route anchor or state owner.
- Authored branch aim compensation uses generic route-choice descriptor fields consumed by the existing cable launcher. When swing commitment should select a branch without a new control, gate any target priority behind an explicit authored build angle and mirror that gate in the first-screen HUD cue.
- Follow-up branch timing windows remain role-scoped authored descriptors. When a shortcut needs a readable carry beat, one descriptor owns its angle, target-directed speed, assist, and copy; launcher, HUD, renderer, audio, and effects consume it without granting the safe branch the same benefit or adding a state owner.
- Role-scoped reel consequences derive authored progress from the existing reeling state and publish bounded semantic pulses. The route-cargo facade remains the sole numeric pressure owner; HUD keeps that meter authoritative while route copy reports pulse stage rather than a second rounded pressure value.
- Short branch confirmations remain authored frame counts and copy inside the existing route descriptor. The existing route-choice frame and phase defer the original payoff event; do not add a timer, target, line, input, or DOM owner for a presentation beat.
- Late confirmation handoffs remain descriptor-authored subwindows. The renderer derives line growth, payoff-target preview, and camera easing from the existing route-choice frame, selected payoff target, consequence line, and ledge entity; do not add a parallel timer, event, target, line, or state owner.
- Short payoff chroma surges remain descriptor-authored presentation. Existing payoff selection and grapple events drive the existing rope, probe, spark pool, and synth; do not add a cable, effect pool, event, timer, material, or state owner.
- Payoff latch recoil remains descriptor-authored feel tuning. The existing latch path applies target-directed velocity and camera trauma, while the existing player-scale and synth paths derive the bounded branch beat from the existing `grapple-latched` event age; do not add a recoil state, event, timer, entity, or parallel feedback owner.
- First-swing payoff release windows remain descriptor-authored feel tuning. Derive readiness from the existing route choice, payoff anchor, swing angle, and angular velocity; extend the existing `released` event for branch motion and reuse HUD, effects, player-light, atmosphere, camera, and synth owners without adding a release state, timer, control, event type, entity, or diagnostic surface.
- Branch score settles remain descriptor-authored payoff tuning. Extend the existing semantic score event with bounded presentation data, derive event age without a timer owner, and reuse tether motion, camera trauma, materials, player scale, sparks, HUD, and synth; restore shared rejoin presentation after the beat and do not add state, controls, events, entities, materials, or effect pools.
- Branch-neutral rejoin release windows remain descriptor-authored convergence tuning. Derive readiness from the existing route choice, convergence anchor, preserved generic target, swing angle, and angular velocity; let the existing release command apply authored vertical response and lateral damping, extend the existing `released` event only for evidence, and reuse recovery, camera, HUD, effects, and synth owners without a release state, timer, control, event type, entity, material, effect pool, or diagnostic surface.
- Secured convergence rebounds remain descriptor-authored feel tuning. Extend the existing semantic secured event with bounded score and presentation evidence, derive one shared event-age descriptor for scale and feedback, and reuse tether, camera, target material, HUD, sparks, and synth without a rebound state, timer, event type, control, entity, material, or effect pool.
- Post-convergence score-carry releases remain descriptor-authored traversal tuning. Keep safe/shortcut variants under one nested route descriptor, derive the active cue from the resolved route choice plus existing secured/released event order, and reuse the original release command, target, consequence line, camera, HUD, effects, and synth without a score-carry state, timer, control, event type, entity, material, effect pool, or diagnostic surface.
- Post-score rest acknowledgements remain descriptor-authored continuation tuning. Extend the existing `restored` event with bounded branch evidence, derive presentation and recovery from event age, and route any vertical target lead through the original aim-assist path; reuse original anchors, line, camera, HUD, sparks, player light, and synth without a pulse state, timer, control, event type, entity, material, effect pool, or diagnostic surface.
- Hellscape specialist defenses remain derived choices inside the existing build/wave owners. A surviving Emberplate wall plus secured-siege count unlocks the Crystal-funded Sentry; the existing build selection and `B` action deploy it at a descriptor-authored core-side anchor. Its guaranteed one-Crystal overflow may arm one finite shot count on that same Sentry through the existing turret cooldown and FX paths. HUD/Canvas consume the nested descriptor without another progression, control, event, DOM, or diagnostic owner; successful clears without a wall restore basic wall selection and allocate collision-free structure IDs.
- Every successful builder run must leave a visibly playable new experiment or a material player-visible upgrade; catalog, schema, documentation, or kit-only work does not satisfy the builder outcome.
- Do not depend on ChatGPT Online audit agents for this local production pipeline.
