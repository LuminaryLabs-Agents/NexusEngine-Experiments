# Nexus Engine Experiments Memory

## Purpose

NexusEngine-Experiments owns playable browser proof, product-specific content and tuning, renderer/input hosts, and additive game compositions built from NexusEngine Core plus real ProtoKits.

## Architecture

- NexusEngine Core is read-only authority for runtime primitives and natural-language capability ownership.
- NexusEngine-ProtoKits owns reusable, deterministic, renderer-agnostic domain behavior, resources, events, methods, snapshots, and descriptors.
- NexusEngine-Experiments owns deterministic composition records, browser/input bridges, content, tuning, presentation, routes, playable validation, and games.
- Reusable behavior found in experiments must move to ProtoKits instead of being copied across routes.
- Existing experiments and games are legacy inventory. They do not count toward the production pipeline's new 100-kit, 50-experiment, or 10-game totals.

## Production Pipeline

- Durable state lives under `.agent/nexus-game-production/`.
- Each run creates one `.agent/change-packets/<packet-id>/PACKET.md`; global and repository lock artifacts are deprecated and must not be created, inspected, or honored.
- Playable experience is the production driver. Historical catalog and staged bootstrap gates are reference inventory and bookkeeping, never blockers for a coherent playable upgrade.
- Implement or extract only the reusable ProtoKits required by the active experience, then preserve and update prior ledgers and counts after the playable result.
- Bootstrap epoch 0 requires 100 accepted and implemented kits, 50 playable seeded experiments, and 10 documented games. These are minimums, not terminal caps.
- After bootstrap, numbered production epochs continue forever. Each epoch adds exactly 10 accepted and implemented kits, 5 playable seeded experiments, 1 documented game that merges those five experiments, and 1 bounded refinement-and-pruning slice.
- Every experiment records epoch, lifecycle status, seed, draws, rejections, accepted signature, coherence, fantasy, verb, pressure, objective, visual identity, interaction structure, and validation.
- Source experiments and superseded games may be removed only after their complete feature union is inventoried, mapped to a validated successor, cleared from references, and recorded in the retirement ledger.
- Track bootstrap progress separately from lifetime-created, active, merged, archived, and retired totals. Accepted definitions do not count as created kits.

## Conventions

- Preserve existing public behavior and prefer additive composition, adapters, optional exports, and compatible registrations.
- Keep DOM, Canvas, WebGL, Three.js, browser input, asset loading, frame presentation, and product copy out of reusable ProtoKits.
- Use seeded randomness and explicit fixed-time inputs; do not use `Math.random()` or wall-clock time in reusable simulation.
- Do not count placeholders, route shells, duplicate signatures, documentation-only games, or unlaunched gameplay.
- Validate the first screen around hero controls; keep optional or advanced controls under foldouts or dropdowns.
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
- Every successful builder run must leave a visibly playable new experiment or a material player-visible upgrade; catalog, schema, documentation, or kit-only work does not satisfy the builder outcome.
- Do not depend on ChatGPT Online audit agents for this local production pipeline.
