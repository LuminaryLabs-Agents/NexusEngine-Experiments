# Next Ledge Payoff Grapple Chroma Surge

## Unit

- Packet: `2026-07-17-next-ledge-payoff-grapple-chroma-surge`
- Experiment: `experiments/next-ledge/`
- Result target: material player-visible refinement; no new experiment or production count
- Experiments start: `8452f5d6a6e3617d66e57a2011e7ddc122a2d5e2`
- ProtoKits start: `04d34f049f58ae359cf71d43466c429dac2a6d08`
- Core reference: `70cc2a1590677b872d40a42f7b7bb7e174941eb0` read-only

## Intent

- Player fantasy: a stormline recovery operator fires the branch charge Stormlock just routed, so the cable itself carries the selected signal into the payoff catch.
- Hero verb: build swing, release, and re-grapple.
- Target feeling: one crisp mint or amber surge should connect handoff, fire, cable travel, and latch impact without obscuring control.
- Pressure loop: preserve shelter protection or vent retained pressure, then convert that result into branch-specific launch tempo.
- Objective: fire the first payoff grapple and immediately read which branch energy is traveling through the cable.
- Failure and recovery: a missed shot remains recoverable through the existing grapple and retry paths.
- Visual identity: mint recovery or amber mastery briefly brightens the existing cable, probe, and bounded spark impact.
- Interaction structure: hero controls and purpose remain on the first screen; Advanced stays closed by default.
- Selected ProtoKit features: tether motion, cable launch, traversal vitals, traversal recovery, traversal camera, traversal cues, traversal feedback, and route-cargo extraction.
- Core relationship: Nexus Engine remains the read-only composition/runtime authority.
- Ownership: route data authors surge color, duration, and impact scale; the existing `grapple-fired` and `grapple-latched` events drive presentation; the existing renderer line, probe material, spark system, and synth remain the only presentation owners.

## Baseline

- Human View first screen: `evidence/human-view-before-first-screen.png`; purpose, hero controls, resources, and closed Advanced disclosure passed.
- Human View payoff fire: `evidence/human-view-before-payoff-fire-impact.png`; Slipstream is mint, but the live cable and primary latch burst remain generic cyan, dropping the selected handoff color at the exact hero action.
- Safe-route input proof reached sector two, cleared the four counterwind beats, chose Shelter Rise, secured Fork Relay and Stormlock, waited through the original 24-frame confirmation, and fired/latch-hit Slipstream through actual session inputs.
- Initial pre-edit render sample: `21.43 FPS`, `46.67 ms` average, `66.80 ms` p95, `116 ms` maximum; `69` DOM nodes, one canvas, `76` descriptors, `277` settled scene nodes, `86` draw calls, and `12,308` triangles.
- Final gate used a same-machine isolated `HEAD` archive and the working route over the same 60-tick warm-up plus 180-tick active-play workload so browser aging did not distort the comparison.

## Implementation

- Added descriptor-authored `grappleSurgeFrames`, `grappleSurgeColor`, and `grappleImpactScale` values to the existing Slipstream and Cacheline payoff anchors.
- The renderer derives an 18-frame tint from the existing selected payoff target and `grapple-fired` event, then recolors the existing rope and probe only while the payoff is active. It allocates no cable, material, event, state, or timer and resets the shared materials once.
- The existing spark pool reads the same payoff descriptor for fire/latch color and bounded impact scale; the existing synth adds a quiet mint or amber accent to the existing grapple-fire cue.
- Cache versions and existing source guards were advanced together. No Core or ProtoKit source changed.
- Cleanup removed the initial per-frame event-array copy and redundant material writes. The inactive and settled route now performs no surge scan or material mutation.

## Validation

- All `28` existing `tests/next-ledge*.mjs` entrypoints passed; affected JavaScript syntax and `git diff --check` passed.
- Playwright actual-input safe route: cleared four counterwind beats, selected Shelter Rise, reached Fork Relay and Stormlock, waited through confirmation, fired/latch-hit Slipstream, and banked `134` preserved-speed score before Windglass.
- Playwright actual-input shortcut route: selected Signal Cut, retained `46` pressure, reached Fork Relay, observed four Stormlock vent pulses and zero retained pressure, fired/latch-hit Cacheline, and banked `175` cargo-mastery score before Windglass.
- Human View passed `evidence/human-view-final-first-screen.png` and `evidence/human-view-final-mint-impact.png`: purpose, hero controls, resources, mint cable/impact, and immediate feedback are readable with Advanced closed. One transient WebGL capture tear was excluded and immediately rechecked on a clean frame.
- Console: `0` messages, `0` errors, `0` warnings. Default view: `69` DOM nodes, one canvas, one owner per signal, diagnostics closed.
- Matched performance: `58.48 -> 52.80 ms` average tick (`17.10 -> 18.94 FPS`, `9.7%` faster), `77.2 -> 73.8 ms` p95, `112.8 -> 116.0 ms` max. Settled counts stayed `277` scene nodes, `32` ledges, `108` geometries, `27` lines, and `76` descriptors; five additional 60-tick samples stayed at `277` nodes with no unbounded heap, DOM, canvas, line-capacity, or entity growth. Impact peak stayed bounded at `433` scene nodes.

## Feel Scores

| Dimension | Before | After |
| --- | ---: | ---: |
| Responsiveness | 9 | 9 |
| Predictability | 9 | 9 |
| Readability | 8 | 9 |
| Impact | 7 | 9 |
| Recovery | 8 | 8 |
| Delight | 8 | 9 |
| Replay desire | 9 | 9 |
| Average | 8.3 | 8.9 |

## Audits

- Ownership: deterministic movement, launch, vitals, recovery, camera, cues, feedback, and route-cargo state remain in the eight real ProtoKit features. Route content owns three authored values; local renderer/effects/audio consume existing snapshot/event owners. Core remains read-only.
- Diversity: this materially deepens the existing stormline fantasy and hero verb; it adds no experiment, route family, kit signature, or production count.
- Feature migration: no source was pruned, superseded, or moved. All prior route, failure/retry, consequence, payoff, Windglass, and original ascent behavior remains present.
- Diagnostics: no debug label, graph, hit volume, identifier, dump, or duplicate visible entity was added; Advanced remains the explicit closed disclosure.

## Publication

- Production commit: pending.
- Receipt commit: pending.
- ProtoKits: unchanged at `04d34f049f58ae359cf71d43466c429dac2a6d08`.
- Exact next playable improvement: give the payoff latch one branch-aware recoil beat—mint forward pull or amber snap—using the existing `grapple-latched`, camera-trauma, and player-squash owners without new state or events.
