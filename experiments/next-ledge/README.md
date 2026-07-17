# Next Ledge

A Nexus Engine stormline-recovery grapple climb. Build a swing, release, aim into the cyan route, and re-grapple while carrying recovered signal cargo to the summit.

The final route now resolves into an authored mastery crest: recover at Stormbreak Rest, build the high-commitment release from Commit Perch, catch the crosswind, reverse toward Relay Crown, and deliver the signal into a gold summit transmission.

After delivery, the advanced `N` action broadcasts the restored relay, waits for a visible route handshake, then reveals a mirrored four-anchor opening with reversed wind: Counterwind Gate, Leeward Cradle, Reverse Catch, and Counterwind Rest.

That opening is an authored pressure crescendo: the fixed-size wind field accelerates and strengthens across the first three beats, the existing fall-pressure service records each gust load, and Counterwind Rest vents the pressure with a distinct recovery signal. Gust strength, pressure deltas, copy, and recovery live in the declarative climb preset; session, renderer, HUD, and audio consume the same state and events.

Counterwind Rest now opens a short two-line decision without adding a control: grapple onto the mint Shelter Rise for a protected stamina recovery, or commit to the amber Signal Cut for a faster cache while the existing fall-pressure service rises to 46%. Both authored lines rejoin at Fork Relay, the unselected branch closes, and the same route-progress/cargo services preserve state across the decision.

Signal Cut now teaches and honors one distinct commitment rhythm. Neutral or low release continues into the larger mint recovery target; a rightward build to the explicit amber window makes the smaller Signal Cut the launch priority, applies its authored lead through the existing cable launcher, and catches in one release/fire cadence. The shortcut remains unprotected and still carries `46%` pressure, so readability improves without erasing the safe-versus-fast tradeoff.

That retained pressure now has a readable carry rhythm of its own. After Signal Cut, the HUD first asks for a left build; only the authored Fork Relay angle and target-directed speed window turns the prompt amber and grants a small assist through the existing cable launcher. The one-launch catch emits distinct fire and landing feedback, confirms that `46%` pressure was banked, and leaves the Stormlock vent demand live. Shelter Rise keeps its original mint path with no access to the amber assist or events.

That choice now persists beyond the rejoin. Shelter Rise grants one protected grapple window to the authored Stormlock Restore, extending the existing traversal-recovery floor and aim-assist tuning until the catch lands. Signal Cut keeps its amber pressure live through Fork Relay and names Stormlock Restore as the deliberate vent target; the existing route-cargo pressure facade performs the recovery when the player secures it. The same route-choice state owns both consequences, and no new control or pressure ledger is introduced.

Stormlock now pays that choice off immediately. Shelter Rise converts its protection into a mint Slipstream Launch with `1.34x` cable speed, extra lift, and stronger aim assistance. Signal Cut spends `1.75` banked cargo through the existing resource facade to reveal the smaller Cacheline High anchor inside a stronger amber gust. Cacheline now frames the live player against its actual target, projects pointer input through that presented camera, and applies authored target lead so one deliberate rightward arc clears the catch in one launch while remaining smaller than Slipstream. Both targets extend the existing route-choice state, reuse one bounded consequence line, and disappear when inactive; inactive branch anchors are also excluded from cable sweep after convergence. The final cleanup promotes the UI rather than the WebGL canvas so foreground geometry cannot cover hero copy.

Both rewards now converge at the shared Windglass Relay before generic ascent resumes. The safe line banks a visible `134` preserved-speed score; the shortcut banks `175` cargo mastery. Windglass then opens one branch-neutral rejoin phase: the camera frames the live player against a larger cyan original `anchor-11`, the hero prompt calls for a high build, and the existing recovery path grants extra fail-floor and aim-assist room for a missed first shot. Securing that preserved projected-route anchor resolves the same route-choice state. The renderer reuses the bounded consequence line and target entity, while HUD, audio, and effects consume the same semantic events without adding a control, DOM entity, or second state owner.

The amber shortcut now vents its retained pressure visibly during the physical Stormlock reel. Four descriptor-authored pulses route recovery through the existing route-cargo pressure facade, while the authoritative pressure meter, one pulse-stage status, the existing consequence line and beam, bounded sparks, camera response, and audio expose progress before lock. No second pressure value, meter, entity, or control is introduced.

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
