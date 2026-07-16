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
- Every successful builder run must leave a visibly playable new experiment or a material player-visible upgrade; catalog, schema, documentation, or kit-only work does not satisfy the builder outcome.
- Do not depend on ChatGPT Online audit agents for this local production pipeline.
