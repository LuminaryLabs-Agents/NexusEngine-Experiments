# 2026-07-08 01:13 ET — Cavalry Campaign Fractal Upgrade

## Chosen experiment

`experiments/The Cavalry of Rome/`

## Why it was chosen

The latest completed upgrade was `experiments/peer-scene-transition/`, so this run chose a different route.

The Cavalry of Rome already had a strong tactical/campaign surface, but the campaign-map layer still had low strategic readability: ownership, pressure, supply, march intent, morale, and command availability were mostly fused into rendering or DOM action surfaces. That made it a good target for a domain-fractal pass because the route could become more procedurally legible without rewriting the whole game.

## Last upgraded experiment

`experiments/peer-scene-transition/`

Evidence used: latest commit sequence ended with `Log peer scene chronicle fractal upgrade`.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| third-person-follow-through | Third-person controller diagnostic arena | 1-3 min loop | WASD, orbit camera, jump/reset, debug rays | not in changed files | yes, wrapper |
| peer-scene-transition | Peer HTML scene puzzle chain | 3-6 min | route gates, inventory/clues, scene choices | no in changed files | yes |
| the-cavalry-of-rome | Roman campaign/tactical strategy scene | 5-15 min | campaign selection, territory moves, world turn, AI pressure, tactical hex mode | older legacy main-realistic still references old runtime; changed handoff imports NexusEngine | yes, new handoff |
| vr-platformer-board | XR/spatial board platformer | 2-5 min | movement, jump, collectibles, comfort descriptors | no in changed files | yes |
| next-ledge | Grapple/cliff extraction prototype | 2-4 min | grapple, swing, cargo/extraction descriptors | no in changed files | yes |
| infinite-radial-terrain | Radial terrain explorer | open-ended | camera flight, LOD rings, terrain descriptors | no in changed files | yes |
| high-fidelity-meadow | Meadow simulation scene | open-ended | orbit, wind seed, grass/flower/sheep scene | no in changed files | yes |
| fogline-relay | Fog survey relay route | 4-8 min | movement, scan, relay objectives, wraith pressure | no in changed files | yes |
| nexus-frontier-signal-isles | First-person signal/resource experiment | 5-10 min | scan, harvest, build mast, pressure wave | no in changed files | yes |
| sora-the-infinite | Compatibility gateway | <1 min | launch handoff, continuity coaching | no in changed files | yes |
| zombie-orchard | Survival orchard wave route | 4-8 min | move, dodge, pickup, survival pressure | no in changed files | yes |
| tropical-island-scene | Lagoon shader scene | open-ended | orbit, fish, coconuts, water shader | no in changed files | yes |

## Domain ASCII tree

```txt
cavalry-campaign-fractal-domain
├─ campaign-readability
│  ├─ march-corridor-domain
│  │  └─ cavalry-march-corridor-kit
│  └─ supply-line-domain
│     └─ cavalry-supply-line-kit
├─ battlefield-readability
│  ├─ formation-pressure-domain
│  │  ├─ cavalry-unit-cohesion-field-kit
│  │  └─ cavalry-morale-weather-front-kit
│  └─ command-options-domain
│     └─ cavalry-maneuver-choice-band-kit
└─ renderer-handoff
   └─ cavalry-fractal-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cavalry-supply-line-kit`
- `cavalry-march-corridor-kit`
- `cavalry-unit-cohesion-field-kit`
- `cavalry-morale-weather-front-kit`
- `cavalry-maneuver-choice-band-kit`
- `cavalry-fractal-renderer-handoff-kit`
- `cavalry-campaign-fractal-domain-kit`

These live in `experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js`.

The kits accept plain campaign snapshots and output serializable descriptors. They do not own DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop timing.

## Files changed

- `experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-handoff-pass.js`
- `experiments/The Cavalry of Rome/index.html`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/domain-kit-cutover-manifest.json`
- `tests/cavalry-campaign-fractal-domain-kits-smoke.mjs`
- `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/turn-ledger/2026-07-08-0113-cavalry-campaign-fractal-upgrade.md`

## Tests added

- `tests/cavalry-campaign-fractal-domain-kits-smoke.mjs`
  - 10 smoke-test intake cases.
  - Exercises five atomic kit surfaces plus the composite per case.
  - Checks descriptor arrays, IDs, kinds, serializability, handoff counts, and ownership boundaries.

- `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN import in the changed handoff.
  - Checks old NexusRealtime runtime CDN absence in the changed handoff.
  - Checks live and experiment route wiring.
  - Runs 10 campaign state/input cases through the composite domain kit.

Both tests were wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Connector/static validation completed:

- Created the new kit and handoff files on `main`.
- Refetched/updated route entry files to load the new handoff pass.
- Refetched/updated validation wiring.
- Added smoke files and manifest/plan documentation.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- The changed handoff pass imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed handoff pass does not import the old `LuminaryLabs-Dev/NexusRealtime@main` runtime URL.
- The older `main-realistic.js` compatibility surface still contains a legacy `NexusRealtime@main` URL. It was not rewritten in this pass because the live route currently uses the campaign-033 module stack and because editing that large legacy module through the connector would have risked unrelated regressions. This is logged as an explicit residual audit item rather than hidden.

## Cleanup pass

- Kept reusable logic in the new domain kit.
- Kept DOM/canvas overlay logic in the presentation handoff pass.
- Did not remove existing tactical/campaign behavior.
- Did not create a branch.
- Did not touch any repo except `LuminaryLabs-Agents/NexusEngine-Experiments`.

## Non-game handling

The Cavalry of Rome is a small experience-driven strategy experiment/game route, so no deletion, rename, or refactor-away was needed.

## Next safe ledge

Run `npm run check` and `npm run check:deploy` in a shell/CI runner, then promote the campaign fractal descriptors into a reusable ProtoKit only after confirming the overlay improves readability without cluttering the campaign map.
