# Rogue-Lite Hellscape Siege

Canonical base route for the high-fidelity Rogue-Lite Hellscape Siege experiment.

Open:

```txt
/games/rogue-lite-hellscape-siege/
```

## Unified version rule

This folder is the only gallery-facing route. The earlier `rogue-lite-hellscape-siege-v2` variant has been folded into this base folder and removed from the arcade route list.

## Current implementation

The base route now opens with one readable first-siege loop:

```txt
build the stocked Spike Wall
start Siege 1 at the Ember Core
close on threats and strike them
clear or breach, then recover
enter a resource realm, harvest, and return
```

The loop composes local input, avatar, inventory, realm, harvest/pickup, build,
wave/defense, FX, and renderer-handoff features. The first screen owns only the
purpose, live objective/status, and four hero controls. Readiness panels and
blueprint selection remain under the Advanced disclosure and are off by default.

## Controls

```txt
WASD / Arrow Keys: Move
B: Build the selected blueprint
E / Enter: Start a siege, enter a realm, or return to base
Mouse / Space: Strike during a siege or harvest in a resource realm
Advanced: Q / C cycle and 1 / 2 / 3 select blueprints; readiness diagnostics
```

## Domain-kit cutover target

The next shared cutover should move deterministic first-siege combat and recovery
behind the smallest generic defense DSK API without moving browser input, authored
content/tuning, HUD, Canvas, or readiness diagnostics out of this route.

Historical candidate kits remain migration reference only:

```txt
action-input-kit
resource-pressure-kit
cargo-delivery-kit
agent-group-kit
hazard-director-kit
route-checkpoint-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
gamehost-standard-kit
```

Game-specific realm, build, wave, and economy mapping should live in a Hellscape bridge/preset, not in generic domain kits.
