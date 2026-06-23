# NexusRealtime Agent Memory

This folder is durable memory for cumulative NexusRealtime automation. Every scheduled task should review this folder before making decisions.

## Repos

- Core: https://github.com/LuminaryLabs-Dev/NexusRealtime
- ProtoKits: https://github.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits
- Experiments: https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments

## Intent

Grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

DSKs are layered domain communication boundaries. They let domains compose through resources, events, methods, snapshots, and descriptors.

## Standing constraints

- Use `.agent/` as guiding memory.
- Reusable kit implementation belongs in ProtoKits.
- Experiments harden canonical routes, bridges, presets, docs, manifests, and tests.
- Aim for about 20 strong canonical experiments without making 20 brittle.
- Merge features and kits into higher-level cumulative domains where possible.
- Keep renderers presentation-only.
- Move meaningful boundaries toward headless tick tests and deterministic replay.
