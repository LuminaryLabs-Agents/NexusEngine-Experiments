# Core Domain Coverage Report

Status: Phase A baseline
Mission kit coverage: 0 accepted kits
Mission experiment coverage: 0 playable experiments

## Coverage Rule

Core is authoritative. A new kit must name the Core domains it configures or composes, explain the semantic responsibility Core does not own, and keep provider/renderer/browser concerns outside reusable state. Coverage does not reward duplicating Core.

## Baseline Risk Map

| Existing ProtoKit family | Current Core authority | Phase B disposition |
| --- | --- | --- |
| Registry, capability graph, composition planning | `core-composition-kit` | Treat wrappers as compatibility/history; reject new duplicates |
| Seed streams, completion ledgers, state digests | `core-data-kit` | Require higher-level procedural or progression meaning |
| Resource meters, pressure loops, action windows | `core-simulation-kit` | Require a composed game/system loop beyond the primitive |
| Interaction/affordance aliases | `core-interaction-kit` | Merge/adapter review before accepting adjacent work |
| Transform, spatial scene graph, zone aliases | `core-spatial-kit` + `core-scene-kit` | Require semantic spatial behavior, not renamed facts |
| Render descriptor and visual wrapper aliases | `core-graphics-kit` | Descriptor composition is allowed; renderer ownership is not |
| Camera modes and camera wrappers | `core-camera-kit` | Accept only specialized policy with distinct reuse proof |
| Physics body/provider wrappers | `core-physics-kit` | Accept provider adapters or gameplay meaning, not contract copies |
| World/terrain/content families | `core-world-domain` plus providers | Keep heavy terrain/content state provider-owned and portable snapshots light |
| Capture, compute, object fidelity | Dedicated Core domains | Compose requests/builders/providers; do not create parallel orchestration |

## Gap State

No new gap is accepted yet. Phase B must choose candidate domains only after checking all 514 existing top-level ProtoKit folders and the current remote Core map.
