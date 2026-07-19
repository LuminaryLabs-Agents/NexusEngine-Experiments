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
clear, harvest Grove wood and Ashes obsidian
return and forge the surviving wall into Emberplate
clear Siege 2 with Emberplate, harvest Crystal, and deploy one Sentry
spend the overflow Crystal to arm six fast, heavy Sentry shots for Siege 3
retry the same siege after a breach
```

The loop composes local input, avatar, inventory, realm, harvest/pickup, build,
wave/defense, FX, and renderer-handoff features. The first screen owns only the
purpose, live objective/status, and four hero controls. Readiness panels and
blueprint selection remain under the Advanced disclosure and are off by default.

## Controls

```txt
WASD / Arrow Keys: Move
B: Build the starter wall; forge Emberplate; deploy the Crystal Sentry
E / Enter: Start/retry a siege, enter a realm, or return to base
Mouse / Space: Strike during a siege or harvest in a resource realm
Advanced: Q / C cycle and 1 / 2 / 3 select blueprints; readiness diagnostics
```

After Siege 1, the first-screen objective carries one authoritative recipe:
`5 wood + 3 obsidian`. Grove and Ashes update that progress in place. Returning
with both materials turns the existing `B` control into `FORGE WALL`; the same
Spike Wall becomes a 300 HP Emberplate wall with 35% damage guard. No second
wall, control, defense owner, or default diagnostic surface is created.

When Emberplate survives Siege 2, the existing build owner selects one Crystal
Sentry choice. Its `5 crystal + 3 energy` recipe is fully funded in the Crystal
realm, and the existing `B` control deploys exactly one Sentry. The HUD, Crystal
portal, build ghost, and finished Sentry consume one derived choice descriptor;
no second progression state, control, or diagnostic surface is created.

The guaranteed one-Crystal overflow then turns the same `B` control into one
in-place Crystal Surge: six `30`-damage shots at a `0.3s` cooldown for Siege 3,
then the Sentry returns to its normal cadence. The existing Sentry descriptor,
turret cooldown, beam/flash/shake FX, HUD, and Canvas own the finite beat. If
Emberplate falls during a successful clear, the basic action returns to wall
rebuild stock without requiring Advanced blueprint selection.

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
