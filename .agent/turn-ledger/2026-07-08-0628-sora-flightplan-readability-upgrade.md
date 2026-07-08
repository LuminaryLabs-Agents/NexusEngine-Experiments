# 2026-07-08 0628 — Sora flightplan readability upgrade

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest completed upgrade was `experiments/zombie-orchard/`, so this pass selected a different route. Sora was still the smallest and lowest-variation canonical route after its prior launch-rehearsal pass: it proved the alias, route preview, readiness, and launch handoff, but the player still did not have a clear read on which runway vector, launch lane, energy reserve, cloud opening, risk/reward state, or return anchor made the handoff safe. This pass adds a second, deeper flightplan readability domain that turns the interstitial into a route-planning micro experience.

## Last upgraded experiment

`experiments/zombie-orchard/`

Latest known commit before this pass: `9856820c0b8eea996172ec86930dad2143a4cc07` — `Log zombie orchard foraging readability upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, consequence, and decision readability descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, action likelihood, route choice scoring, pressure release, and narrative thread pins. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit, traversal readability descriptors. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery, traversal readability descriptors. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards, sample bookmarks, route task bands. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route with signal cartography. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory, relay priority, avoidance corridors, scan windows, retreat pockets, triangulation grid. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview, launch-rehearsal, and flightplan-readability gateway. | 2-5 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, runway vectors, energy budget, cloud slits, lane choice, risk/reward cards, and return anchors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route with foraging readability. | 5-12 minute survival / scavenging loop. | Move, collect apples, scavenge gear, melee/use gear, waves, survival pressure, apple rarity heat, gear choice arcs, harvest streak trails, safe harvest pockets, row memory, boss omen branches. | No changed-runtime old runtime CDN. ProtoKits survival bridge URL remains and is not the old core runtime CDN. | Yes through `kit-stack.js`. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
sora-flightplan-readability-domain
├─ launch-path-domain
│  ├─ runway-vector-domain
│  │  └─ sora-runway-vector-lattice-kit
│  └─ launch-lane-domain
│     └─ sora-launch-lane-choice-kit
├─ risk-budget-domain
│  ├─ energy-budget-domain
│  │  └─ sora-energy-budget-ribbon-kit
│  └─ risk-reward-domain
│     └─ sora-risk-reward-card-kit
├─ sky-memory-domain
│  ├─ cloud-cover-domain
│  │  └─ sora-cloud-cover-slit-kit
│  └─ return-anchor-domain
│     └─ sora-return-anchor-kit
└─ renderer-handoff
   └─ sora-flightplan-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `sora-runway-vector-lattice-kit`
- `sora-energy-budget-ribbon-kit`
- `sora-cloud-cover-slit-kit`
- `sora-launch-lane-choice-kit`
- `sora-risk-reward-card-kit`
- `sora-return-anchor-kit`
- `sora-flightplan-renderer-handoff-kit`
- `sora-flightplan-readability-domain-kit`

Changed integration:

- `sora-compatibility-gateway.js` now imports and composes `createSoraFlightplanReadabilityDomainKit` after route preview and launch rehearsal.
- `sora-compatibility-gateway.js` now folds flightplan descriptors into the composed renderer handoff and exposes `GameHost.getFlightplanReadability()`.
- `sora-compatibility-gateway.js` renders cloud cover slits, runway vectors, launch lane choices, energy segments, return anchors, and risk/reward cards from descriptor buckets only.
- `index.html` now exposes a Flight plan telemetry list and cache-busts the route as `flightplan-readability-v1`.
- `sora-compatibility-style.css` now includes presentation-only rules for the new descriptor buckets.
- `experiments/domain-kit-cutover-manifest.json` records the Sora flightplan readability pass.

## Files changed

- `experiments/_kits/sora-the-infinite/sora-flightplan-readability-domain-kits.js`
- `experiments/sora-the-infinite/sora-compatibility-gateway.js`
- `experiments/sora-the-infinite/index.html`
- `experiments/sora-the-infinite/sora-compatibility-style.css`
- `tests/sora-flightplan-readability-domain-kits-smoke.mjs`
- `tests/sora-flightplan-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0628-sora-flightplan-readability-upgrade.md`

## Tests added

- `tests/sora-flightplan-readability-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks runway vectors, energy budget segments, cloud cover slits, launch lane choices, risk/reward cards, return anchors, renderer handoff counts, serializability, and ownership boundaries.
- `tests/sora-flightplan-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime runtime absence, route cache busting, `GameHost.getFlightplanReadability()`, descriptor rendering hooks, check wiring, and renderer-neutral kit boundaries.

Updated wiring:

- `scripts/run-checks.mjs` now includes both new smoke tests in full validation.
- `scripts/run-checks.mjs` now includes both new smoke tests in deploy validation.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking route/test/manifest tokens during the pass.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Sora runtime imports the requested NexusEngine main CDN directly: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Sora runtime does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- New flightplan readability kits are plain descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.
- The renderer continues to consume descriptor buckets only.

## Cleanup pass

- Preserved the existing Sora alias route, query/hash preservation, launch rehearsal flow, and The Open Above target handoff.
- Avoided destructive deletes or renames.
- Kept runway vector, energy, cloud, lane, risk/reward, and return-anchor logic in reusable kit functions.
- Added visual variety through descriptor counts and parameterized positions instead of introducing renderer-owned simulation logic.
- Avoided version-suffix route creation.

## Non-game route handling

Sora is a small experience-driven web gateway / interstitial rather than a full standalone game. It was not deleted or renamed because it proves alias compatibility, route preview, launch rehearsal, and now flightplan readability before handing off to The Open Above.

## Next safe ledge

Add a deterministic Sora replay fixture that simulates idle → lift build → left bank → right bank → climb → launch, then snapshot-hashes route-preview, launch-rehearsal, and flightplan renderer-handoff descriptors together.
