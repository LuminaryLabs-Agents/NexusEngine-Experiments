# Core Domain Map

Status: Phase A baseline complete
Authority: read-only `NexusEngine` `origin/main` at `cd5c8f84cb00ff02970419f3316e1908ada5651d`

The local Core worktree was 246 commits behind after fetch, so this map uses files read directly from `origin/main` without changing the Core worktree.

## Boundary Rule

Core is the stable primitive and capability owner. New ProtoKits may configure, adapt, or compose Core, but must not rename or reimplement Core ownership. Provider and host concerns stay behind adapters; game fiction and authored content stay in Experiments.

## Natural-Language Capability Domains

| Core domain | Owns | Explicit exclusions | ProtoKit relationship |
| --- | --- | --- | --- |
| `core-agent-kit` | Agent identity, goals, observations, decision cycles, proposals, execution ledger, telemetry, replay | Model loading, inference internals, unrestricted tools | Compose for bounded agents; do not recreate agent lifecycle |
| `core-animation-kit` | Clip/blend/pose descriptors, transitions, procedural hooks, timeline events | Renderer mixers, asset loading | Add genre animation policy or adapters only |
| `core-assets-kit` | Asset IDs/groups, readiness, fallbacks, cache/load hints | Renderer upload, browser-only loading | Add catalogs or provider adapters, not another readiness registry |
| `core-audio-kit` | Cues, music/ambient state, mix policy, spatial descriptors, adapter boundary | Playback backend, decoding | Add gameplay audio policy or host adapters only |
| `core-camera-kit` | Targets, follow modes, shake, FOV, volumes, occlusion, XR/head boundary | Renderer camera objects, XR session | Add camera behaviors as policy over descriptors |
| `core-composition-kit` | Kit/domain/bundle registry, collisions, dependency graphs, deterministic plans, health | Install mechanics, remote transport, game bundles | Reuse `coreComposition` services; reject new registries/planners |
| `core-data-kit` | Snapshots, schemas, selectors, migrations, ledgers, named random streams, completion, canonical digests | Persistence target, renderer data, procedural meaning, decisions | Reuse random/completion/digest services; add domain meaning only |
| `core-diagnostics-kit` | Telemetry, replay, determinism, performance, health, promotion evidence | Vendor integration | Add domain-specific proof fixtures, not another diagnostics spine |
| `core-graphics-kit` | Renderer-neutral render/material/instance/light/VFX/LOD/quality descriptors | WebGL, DOM, Three.js, native renderer, upload | ProtoKits emit descriptors; hosts render them |
| `core-input-kit` | Semantic actions/axes, bindings, contexts, dead zones, action events | Motion policy, interaction results, UI | Add domain action interpretation, not raw input ownership |
| `core-interaction-kit` | Targets, affordances, prompts, activation, requirements, result events | Raw devices, UI rendering | Add specialized interaction rules by composition |
| `core-mlnn-kit` | Model registry/descriptors, inference request/results, embeddings, classifications, perception/generation descriptors, backend boundary | Goals, planning, action choice, backend loading | Add model-backed domain policy through adapters |
| `core-motion-kit` | Authoritative root-motion intent, modes, trajectories, desired velocity/facing, motion requests | Raw input, contact resolution, rig solving, clips, renderer transforms | Add genre movement policy without owning physics or animation |
| `core-network-kit` | Sessions, peers, messages, sync/authority/reconnect/collaboration contracts | Provider implementation | Add transport/provider adapters or higher-level multiplayer rules |
| `core-persistence-kit` | Save/load targets, slots, adapters, recovery and migration records | State schema meaning, cloud SDK | Persist domain snapshots through adapters |
| `core-physics-kit` | Bodies, colliders, contacts, constraints, articulations, motors, queries, normalized frames, provider boundary | Backend implementation, movement intent, gameplay outcomes, GPU/draw | Add gameplay physics meaning or provider adapters only |
| `core-platform-kit` | Host/device/permission/fallback capability descriptors | Platform gameplay, renderer implementation | Gate host modes without embedding platform code in simulation |
| `core-policy-kit` | Permissions, guards, sandbox/action policy, promotion restrictions | Agent planning, product policy | Compose domain guard policy; keep product policy local |
| `core-scene-kit` | Scene identity/graph, spawn/despawn, parent links, layers, tags, recipes | Spatial math, renderer meshes, game content rules | Build scene lifecycle or authored recipes over Core facts |
| `core-simulation-kit` | Resources, pressure, thresholds, action windows, cooldowns, timers, objectives, routes, checkpoints, hazards, deterministic resolution | Fiction, effects, raw input, physics backend, GPU/draw | Reuse promoted primitives; new kits must add a real higher-level loop |
| `core-spatial-kit` | Transforms, bounds, zones, coordinate spaces, distances, rays, volumes, spatial queries | Object identity, physics resolution, renderer transforms | Add semantic spatial rules, not another transform/zone registry |
| `core-ui-kit` | HUD/menu/prompt/notification/panel/focus/selection/accessibility descriptors | DOM, React, native or XR UI renderer | Emit UI descriptors; keep concrete UI in the host |
| `core-world-domain` | World identity, partitions, cells, surfaces, provider lifecycle, portable coordination snapshots | Terrain algorithms, heavy provider state, render/GPU objects, physics, game biomes, async jobs, replication | Compose world features/providers; never store heavy host state in Core snapshots |
| `core-capture-domain` | Renderer-neutral capture subjects, view sets, jobs, provider coordination, asset-reference results | Motivation, fidelity policy, renderer/GPU/Canvas, encoding/download | Request observations and supply providers through adapters |
| `core-compute-domain` | Buffer/kernel/graph descriptors, dispatch, provider lifecycle, serializable execution summaries | Visual meaning, GPU/Worker lifecycle, gameplay authority, physics | Use for optional parallel execution, never as simulation ownership |
| `core-object-fidelity-domain` | Fidelity profiles/forms/builds/readiness, capture dependencies, contextual adaptation, atomic replacement | Object identity, object-specific generation, renderer/GPU, capture rendering, transport | Add object-specific form builders outside Core |

## Exported Core Shape

- `src/core-domains/index.js` exports 12 parent/composition domains: startup, world, creature, character, player, presentation, graphics, motion, physics, compute, capture, and object fidelity.
- `src/core-kits/index.js` exports 39 capability-kit modules plus the Core capability contract, realtime substrate, and sequence substrate.
- Seventeen capability exports do not have a dedicated `src/core-kits/<kit>/core-domain.md`: object, object fidelity, capture, startup, creature, character, player, compute, skybox, presentation, presentation output, UI scale, camera framing, debug, headless editor, transaction ledger, and utility. Their source/README or parent-domain contract remains authoritative; absence of a dedicated file is not permission to duplicate them.

## Promotion-Sensitive Overlaps Already Present in ProtoKits

- Registry, capability graph, and composition planning now belong to `core-composition-kit`.
- Named seed streams, completion ledgers, and canonical state digests now belong to `core-data-kit`.
- Resource meters, pressure channels, and action windows now belong to `core-simulation-kit`.
- Generic interaction, transform/spatial graph, render descriptor, and physics wrappers overlap promoted Core capability surfaces.

Phase B must reject Core renames and accept only higher-level semantic behavior, explicit adapters, or compositions that prove reuse beyond these owners.
