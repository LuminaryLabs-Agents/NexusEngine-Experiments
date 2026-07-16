# Next Ledge

A Nexus Engine stormline-recovery grapple climb. Build a swing, release, aim into the cyan route, and re-grapple while carrying recovered signal cargo to the summit.

The final route now resolves into an authored mastery crest: recover at Stormbreak Rest, build the high-commitment release from Commit Perch, catch the crosswind, reverse toward Relay Crown, and deliver the signal into a gold summit transmission.

After delivery, the advanced `N` action broadcasts the restored relay, waits for a visible route handshake, then reveals a mirrored four-anchor opening with reversed wind: Counterwind Gate, Leeward Cradle, Reverse Catch, and Counterwind Rest.

That opening is an authored pressure crescendo: the fixed-size wind field accelerates and strengthens across the first three beats, the existing fall-pressure service records each gust load, and Counterwind Rest vents the pressure with a distinct recovery signal. Gust strength, pressure deltas, copy, and recovery live in the declarative climb preset; session, renderer, HUD, and audio consume the same state and events.

Counterwind Rest now opens a short two-line decision without adding a control: grapple onto the mint Shelter Rise for a protected stamina recovery, or commit to the amber Signal Cut for a faster cache while the existing fall-pressure service rises to 46%. Both authored lines rejoin at Fork Relay, the unselected branch closes, and the same route-progress/cargo services preserve state across the decision.

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
N                    broadcast a completed relay into the next sector (advanced)
```

## Debug

In the browser console:

```js
GameHost.getState();
GameHost.engine.nextLedge.getSnapshot();
GameHost.restart();
GameHost.advanceSector();
GameHost.beginSectorTransition();
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
