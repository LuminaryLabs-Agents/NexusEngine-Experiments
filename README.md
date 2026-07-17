# Nexus Engine Experiments

Browser experiments that compose Nexus Engine Core and ProtoKits into playable validation slices.

## Agent Operating Memory

This repo uses `.agent/` as repo-local project memory.

Before making architecture, route, pruning, kit, experiment, validation, replay, or test changes, read:

1. `.agent/START_HERE.md`
2. `.agent/cycle-state.md`
3. `.agent/route-canonicalization.md` when route-related
4. latest relevant `.agent/cycle-reports/*`

Agent work should leave either a cycle-state update, a cycle report, or a turn-ledger entry in `.agent/turn-ledger/`.

## Canonical route rule

Every playable game or experiment should have one base-name route. Do not add V1/V2 gallery cards. Fold successful variants back into the base folder and remove versioned playable routes only after the unified implementation and tests are already in place.

The current canonical routes are tracked in:

```txt
experiments/domain-kit-cutover-manifest.json
```

## Domain-kit cutover target

New and migrated experiments should compose reusable Nexus Engine / ProtoKit domains, keep game-specific behavior in bridge or preset code, and keep renderers presentation-only.

Core target kit families include:

```txt
action-input-kit
generic-defense-dsk-boundaries
generic-defense-aaa-dsk-bridge
generic-route-progress-kit
generic-route-cargo-extraction-kit
generic-resource-loop-kit
generic-pressure-loop-kit
timed-pressure-director-kit
zone-field-kit
scan-survey-kit
agent-group-kit
resource-pressure-kit
hazard-director-kit
content-preset-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
deterministic-replay-harness
gamehost-standard-kit
```

## Current canonical routes

### Next Ledge

`experiments/next-ledge/` is a playable stormline-recovery grapple climb. Its first screen exposes the swing/release/re-grapple verb, summit signal-delivery objective, stamina, cargo, fall pressure, and retry recovery while Three.js renders the route.

Current composition: Nexus Engine owns runtime composition; generic ProtoKits own tether motion, cable launch, traversal vitals/recovery/camera/cues/feedback, route progress, and route-cargo extraction. Browser input, route fiction, tuning, camera presentation, audio, and Three.js stay local. The remaining promotion gap is a route-level deterministic route/cargo/pressure descriptor replay, not playable source consumption.

Stormlock's final `12` confirmation frames now grow the existing consequence line toward the selected Slipstream or Cacheline payoff target. The target scales into view while the existing camera eases toward the pair, so the next objective reads before control returns without adding another line, target, event, state, or DOM owner.

The first payoff grapple now carries that selection through the existing cable, probe, spark pool, and fire cue as a brief mint recovery or amber mastery surge. Route descriptors author the color, duration, and impact scale; existing grapple events drive the presentation without another cable, effect pool, event, timer, or state owner.

### Fogline Relay

`experiments/fogline-relay/` is a first-person fog-forest relay experiment. It composes reusable kit surfaces, keeps the Canvas renderer presentation-only, and validates renderer-agnostic visual buckets, fog volumes, volumetric light descriptors, relay scanning, objective flow, and wraith hazards.

Cutover target: make this the canonical `scan-survey-kit` + `zone-field-kit` + `timed-pressure-director-kit` + `fogline-survey-pressure-bridge-kit` validation slice.

### Nexus Frontier Signal Isles

`experiments/nexus-frontier-signal-isles/` is the broad kit-utilization showcase route. It should remain a composition/preset/bridge validation host rather than a branded stable game kit.

Cutover target: keep broad field-engineer composition useful while extracting reusable route, cargo, pressure, scan, resource, build, hazard, descriptor, and replay seams into ProtoKits.

### Sora the Infinite

`experiments/sora-the-infinite/` is the aerial/open traversal validation lane.

Cutover target: preserve flight feel while moving route checkpoints, terrain/updraft windows, camera descriptors, and replay snapshots toward reusable DSK surfaces.

### Zombie Orchard

`experiments/zombie-orchard/` is a kit-composed survival experiment. The game layer should compose kits, define content, feed input into kit APIs/resources, read snapshots/events, and render a canvas view.

Cutover target: preserve survival controls and wave pacing while aligning rounds, horde pressure, resources, pickups, weapons, orchard content, and debug state with domain-kit architecture.

### Signal Bastion

`games/signal-bastion/` is the strongest current strategic-pressure canonical route and the only route-domain lane with executable replay proof.

It composes the ProtoKits `generic-defense-aaa-dsk-bridge` and seven explicit generic-defense DSK aliases instead of the broad compatibility bundle. Migrated seams should prefer `engine.n.genericDefense.sessionFacade` and `engine.n.genericDefense.renderDescriptors`; remaining convenience seams should be removed or justified one at a time without moving browser, DOM, Canvas, frame timing, pointer input, audio, or asset loading into reusable kit logic.

Cutover target: prove a generic defense DSK spine for paths, build slots, vital targets, structures, waves, agents, projectiles, currency, and renderer-only descriptors before promoting smaller mature contracts.

### Rogue-Lite Hellscape Siege

`games/rogue-lite-hellscape-siege/` is the canonical base route for the high-fidelity rogue-lite base-defense game. The old `games/rogue-lite-hellscape-siege-v2/` route has been folded into this base route and removed from the arcade.

Cutover target: preserve realm portals, inventory, harvesting, pickups, build blueprints, wave/core defense, FX, and renderer-only presentation while replacing local temporary kits with shared domain ProtoKits.

## Validation expectations

- Keep local experiment JavaScript shrinking over time.
- Keep reusable kit implementation in ProtoKits, not Experiments.
- Keep browser, renderer, DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, and asset loading outside reusable kit logic.
- Move every meaningful domain boundary toward headless tick smoke tests and deterministic replay.
- Do not destructively delete routes unless the unified canonical route and tests are already in place.
