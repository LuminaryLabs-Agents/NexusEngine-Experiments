# 2026-07-09 02:01 ET — Signal Bastion field hospital readiness upgrade

## Chosen experiment

`games/signal-bastion/`

## Why it was chosen

The latest completed work in the repo was the High Fidelity Meadow creek irrigation pass, so this run intentionally picked a different route. Signal Bastion was selected because it is a small experience-driven tower-defense game with strong renderer handoff plumbing, but its objective pressure was still mostly combat/tower-facing. A field hospital layer adds a civilian casualty stabilization objective without putting reusable logic into the renderer.

## Last upgraded experiment

- Latest observed completed route before this run: `experiments/high-fidelity-meadow/` creek irrigation readiness.
- Latest observed commits before this run included `Add meadow creek irrigation readiness kits`, `Load meadow creek irrigation readiness route`, and `Route meadow creek irrigation state smoke`.
- This run changed a different route: `games/signal-bastion/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-hosted transitions, puzzle tokens, visited-scene state, inventory, and transition ledgers. | 3-6 minutes | Scene traversal, token collection, state-gated exits. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/vr-platformer-board/` | Floating platformer board for XR pose, input, comfort, spatial anchors, stereo descriptors, and renderer-neutral state. | 3-5 minutes | 2D platforming on a VR board, movement, jump, collectibles, hazards. | No changed runtime import in this run. | Existing NexusEngine CDN route. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with WASD flight, origin snapping, close LOD bands, and procedural terrain. | 4-8 minutes | Flight/survey traversal and LOD terrain inspection. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, creatures, ecology, pasture, flock safety, harvest, pollinator, night watch, and creek irrigation overlays. | 4-8 minutes | Scene exploration, ecology readability, descriptor overlays. | Latest route intentionally avoided. | Latest changed entry uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser-host proof for tiny CPU diffusion training, denoising, sampling, checkpoint save/load. | 5-10 minutes | Train/sample/checkpoint lab loop. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `experiments/fogline-relay/` | First-person survey loop with scan targets, fog zones, timed pressure, hazards, and renderer-only buckets. | 5-10 minutes | First-person scan, repair, rescue, route pressure. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer slice for scan, harvest, build, pressure, gates, cargo, beacon, feedback, debug, and replay surfaces. | 5-10 minutes | Field engineering, resource routing, beacon and cargo objectives. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `apps/the-cavalry-of-rome/` | Painterly Roman terrain map with hover regions, cinematic dives, and primitive-built full armies. | 5-8 minutes | Pannable map, region hover, tactical visual proof. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `games/signal-bastion/` | 2.5D cel-style defense game with towers, HUD, placement ghost, range rings, tactics panels, evacuation corridor, reconstruction, and now field hospital readiness. | 8-12 minutes | Tower placement, waves, defense, evacuation, reconstruction, casualty stabilization. | Changed entry does not import old NexusRealtime runtime. | Changed entry imports NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, valves, rune gates, survivor pings, chalk marks, air pockets, rope lifts, and rescue bell extraction. | 8-12 minutes | Puzzle platformer rescue, pressure valves, extraction. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `experiments/next-ledge/` | Grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and a Three.js host. | 4-7 minutes | Grapple, climb, route extraction, rescue overlays. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/sora-the-infinite/` | Open aerial traversal launcher/route that redirects into The Open Above and exposes visual domains for flight readability. | 2-4 minutes | Route launch, flight plan readability, migration readiness. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `experiments/zombie-orchard/` | Survival slice for rounds, pressure, pickups, weapons, orchard content, and debug-friendly runtime state. | 6-10 minutes | Survival rounds, horde pressure, scavenging, well restoration. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `games/rogue-lite-hellscape-siege/` | Base route for portals, inventory, harvesting, building, wave defense, FX, and renderer-only presentation. | 8-15 minutes | Action RPG, base siege, harvesting, wave defense. | No changed runtime import in this run. | Existing game runtime not changed here. |

## Domain ASCII tree

```txt
signal-bastion-field-hospital-readiness-domain
├─ casualty-stabilization-domain
│  ├─ triage-lantern-domain
│  │  └─ bastion-triage-lantern-queue-kit
│  └─ med-supply-cache-domain
│     └─ bastion-med-supply-cache-kit
├─ stretcher-transfer-domain
│  ├─ stretcher-relay-domain
│  │  └─ bastion-stretcher-relay-thread-kit
│  └─ healing-ward-domain
│     └─ bastion-healing-ward-glyph-kit
├─ extraction-accounting-domain
│  ├─ ambulance-gate-domain
│  │  └─ bastion-ambulance-gate-band-kit
│  └─ casualty-ledger-domain
│     └─ bastion-casualty-ledger-band-kit
└─ renderer-handoff
   └─ bastion-field-hospital-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `bastion-triage-lantern-queue-kit`
- `bastion-med-supply-cache-kit`
- `bastion-stretcher-relay-thread-kit`
- `bastion-healing-ward-glyph-kit`
- `bastion-ambulance-gate-band-kit`
- `bastion-casualty-ledger-band-kit`
- `bastion-field-hospital-renderer-handoff-kit`
- `signal-bastion-field-hospital-readiness-domain-kit`

The kits accept Signal Bastion snapshot/presentation state, map path, vital, slots, structures, agents, credits, lives, and wave pressure. They emit JSON-safe triage queue ribbons, supply cache cells, stretcher relay threads, healing ward glyph rings, ambulance gate pressure bands, and casualty ledger choices.

## Files changed

```txt
games/signal-bastion/index.html
games/signal-bastion/src/signal-bastion-field-hospital-readiness-domain-kit.js
games/signal-bastion/src/signal-bastion-field-hospital-readiness-entry.js
tests/signal-bastion-field-hospital-readiness-kits-smoke.mjs
tests/signal-bastion-field-hospital-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0201-signal-bastion-field-hospital-upgrade.md
```

## Tests added

```txt
tests/signal-bastion-field-hospital-readiness-kits-smoke.mjs
tests/signal-bastion-field-hospital-cdn-state-input-smoke.mjs
```

The kit smoke uses 10 intake cases and validates all six atomic kits, descriptor counts, mission-state enums, serializability, and descriptor-only handoff policy.

The CDN/state-input smoke validates route shell markers, NexusEngine main CDN usage, old NexusRealtime runtime absence in the changed field hospital entry, GameHost exposure, renderer-handoff counts, ownership boundaries, and 10 simulated state/input cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check games/signal-bastion/src/signal-bastion-field-hospital-readiness-domain-kit.js
node --check games/signal-bastion/src/signal-bastion-field-hospital-readiness-entry.js
node --check tests/signal-bastion-field-hospital-readiness-kits-smoke.mjs
node --check tests/signal-bastion-field-hospital-cdn-state-input-smoke.mjs
node tests/signal-bastion-field-hospital-readiness-kits-smoke.mjs
node tests/signal-bastion-field-hospital-cdn-state-input-smoke.mjs
```

Results:

```txt
signal-bastion field hospital readiness kit smoke passed
signal-bastion field hospital CDN/state/input smoke passed
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The new local CDN/state-input smoke is Playwright-style validation without a browser launch.

## NexusRealtime import audit

Changed field hospital entry:

```txt
games/signal-bastion/src/signal-bastion-field-hospital-readiness-entry.js
```

uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

and does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main
```

Existing `package.json` and ProtoKits URLs still contain historical NexusRealtime package names from the migration period. Those were not changed because this run only touched Signal Bastion route files, its new domain kit, its new overlay entry, and tests.

## Cleanup pass

- Reused the existing Signal Bastion route shell and host pattern.
- Kept reusable kit logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.
- Put canvas/panel drawing only in the route entry layer.
- Composed field hospital descriptors into `GameHost.getRendererHandoff()` instead of replacing evacuation corridor or reconstruction handoffs.
- Preserved the existing boot, reconstruction overlay, evacuation corridor, frontline tactics, wave choreography, and command fractal domains.

## Non-game handling

Signal Bastion is already a small playable tower-defense game, so it was not deleted, renamed, or refactored destructively. The lesson preserved: combat readability becomes stronger when non-combat objectives, casualty stabilization, supply routes, and evacuation accounting are expressed as descriptor-producing subdomains.

## Next safe ledge

Wire the two new Signal Bastion smoke files into `scripts/run-checks.mjs` after a full repo pull, then normalize `experiments/domain-kit-cutover-manifest.json` away from the large one-line shape and register `signal-bastion-field-hospital-readiness-domain-kit` safely.
