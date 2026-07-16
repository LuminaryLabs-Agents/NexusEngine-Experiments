# Next Ledge

A Nexus Engine stormline-recovery grapple climb. Build a swing, release, aim into the cyan route, and re-grapple while carrying recovered signal cargo to the summit.

The final route now resolves into an authored mastery crest: recover at Stormbreak Rest, build the high-commitment release from Commit Perch, catch the crosswind, reverse toward Relay Crown, and deliver the signal into a gold summit transmission.

The playable route composes real reusable features from NexusEngine-ProtoKits:

```txt
generic tether motion + cable launch
traversal vitals + recovery
traversal camera + cues + feedback
generic route progress
generic route-cargo extraction (resource + pressure children)
```

The experiment keeps browser input, route fiction, Three.js presentation, Web Audio, local tuning, and contextual HUD copy. Optional historical readiness layers remain preserved in source but are explained under the Advanced foldout instead of covering the player view.

## Run

Open this file from a static server:

```txt
experiments/next-ledge/index.html
```

The browser needs internet access for CDN module imports:

```txt
NexusEngine runtime
NexusEngine-ProtoKits
Three.js
```

If a CDN import fails, the visible error panel prints the startup error instead of silently showing a blank screen.

## Controls

```txt
Click / tap / Space  release, fire, retract, or cancel by current mode
A / D or arrows      build swing momentum; air-correct while falling
R                    recover at the current sector's first anchor
P                    pause
N                    advance to the next generated sector (advanced)
```

## Debug

In the browser console:

```js
GameHost.getState();
GameHost.engine.nextLedge.getSnapshot();
GameHost.restart();
GameHost.advanceSector();
GameHost.tick(1 / 60, { action: true });
```

## Architecture

```txt
ProtoKits own:
  deterministic tether, cable, stamina, recovery, route, cargo, and pressure state
  domain events, snapshots, resources, methods, and renderer-neutral descriptors

Experiment owns:
  route fiction, local tuning, player-facing copy, and semantic event translation

Renderer owns:
  Three.js scene setup
  mesh/material synchronization
  screen-to-world projection
  bounded line-buffer reuse, completion camera framing, and summit transmission presentation

Input owns:
  keyboard/pointer/mobile pad collection
  one-frame command flushing into kit APIs

HUD owns:
  first-screen purpose, hero controls, live resources, and contextual action prompts
```

See `PLAN.md` plus the route progress and route-cargo manifests for the remaining deterministic replay promotion gate.
