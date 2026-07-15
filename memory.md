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
- Each run creates one `.agent/change-packets/<packet-id>/PACKET.md` and claims one narrow `.agent/locks/<scope-id>.lock/` scope after the global Git lock.
- Gates are sequential: inventory, catalog, implementation, experiments, coverage, games, documentation, then round-robin expansion.
- The kit catalog accepts exactly 100 unique definitions only after the natural-language ownership contract is complete.
- Each of the 50 new experiments records seed, draws, rejections, accepted signature, coherence, fantasy, verb, pressure, objective, visual identity, and interaction structure.
- Each of the 10 new games maps exactly five new source experiments and preserves those sources.

## Conventions

- Preserve existing public behavior and prefer additive composition, adapters, optional exports, and compatible registrations.
- Keep DOM, Canvas, WebGL, Three.js, browser input, asset loading, frame presentation, and product copy out of reusable ProtoKits.
- Use seeded randomness and explicit fixed-time inputs; do not use `Math.random()` or wall-clock time in reusable simulation.
- Do not count placeholders, route shells, duplicate signatures, documentation-only games, or unlaunched gameplay.
- Validate the first screen around hero controls; keep optional or advanced controls under foldouts or dropdowns.
- Do not depend on ChatGPT Online audit agents for this local production pipeline.
