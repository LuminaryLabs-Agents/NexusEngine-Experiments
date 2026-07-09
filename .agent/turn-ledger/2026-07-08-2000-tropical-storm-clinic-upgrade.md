# 2026-07-08 20:00 — Tropical Island storm clinic readiness upgrade

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

The latest visible upgrade activity before this run was `experiments/infinite-radial-terrain/` avalanche rescue work, so this run selected a different route. Tropical Island Scene remained a scenic orbit/lagoon route with several descriptor overlays but still lacked a direct human-stakes clinic loop that tied weather, rescue, water, herbs, and evacuation into one readable objective layer.

## Last upgraded experiment

`experiments/infinite-radial-terrain/` based on the latest commit sequence for avalanche rescue readiness.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| experiments/ThirdPersonFollowThrough/ | third-person controller and stealth extraction training | short sandbox | WASD, jump, camera, stealth descriptors | no changed runtime import | yes |
| experiments/peer-scene-transition/ | scene transition investigation route | short route | scene gates, clues, ritual evidence | no changed runtime import | yes |
| apps/the-cavalry-of-rome/ | strategy campaign map | medium scenario | map actions, campaign descriptors, diplomacy, hospital | no changed pass import | yes |
| experiments/vr-platformer-board/ | platformer board traversal | short level | move, jump, coins, hazards, exit, rescue | no changed runtime import | yes |
| experiments/next-ledge/ | grapple traversal route | short level | grapple, swing, cargo, rescue lines | no changed runtime import | yes |
| experiments/infinite-radial-terrain/ | radial terrain flight | sandbox | camera flight, LOD terrain, expedition overlays | no changed overlay import | yes |
| experiments/the-open-above/ | aerial route | short flight | flight, courier, storm shelter | no changed runtime import | yes |
| experiments/high-fidelity-meadow/ | meadow scene | passive/short | orbit, ecology, flock, harvest descriptors | no changed runtime import | yes |
| experiments/fogline-relay/ | first-person relay repair | short mission | scan, relay, survivor, storm, radio, blackout | no changed runtime import | yes |
| experiments/nexus-frontier-signal-isles/ | first-person island survival loop | short mission | harvest, build, cargo, harbor relief | no changed runtime import | yes |
| experiments/sora-the-infinite/ | route preview gateway | short gateway | launch preview, preflight, microflight descriptors | no changed runtime import | yes |
| experiments/zombie-orchard/ | survival arena | short waves | move, collect, horde, cure, evacuation | no changed runtime import | yes |
| experiments/tropical-island-scene/ | WebGL island / lagoon route | passive/short | orbit, fish, coconuts, weather, rescue, salvage | legacy ProtoKit import-map remains for local island/water shims | yes in overlays |
| experiments/cozy-island/ | scenic island/campfire route | passive/short | island, foliage, clouds, campfire, tidepool, hatchery | legacy cloudbar stack remains | yes in overlays |
| games/signal-bastion/ | tower defense board | medium | placement, waves, evacuation, reconstruction | base generic bridges remain | yes in overlays |
| games/rogue-lite-hellscape-siege/ | defense / resource game | medium | portals, harvesting, build, siege, caravan | no changed runtime import | yes |

## Domain ASCII tree

```txt
tropical-storm-clinic-readiness-domain
├─ patient-triage-domain
│  ├─ snorkeler-triage-domain
│  │  └─ tropical-injured-snorkeler-triage-buoy-kit
│  └─ freshwater-cistern-domain
│     └─ tropical-freshwater-cistern-purity-kit
├─ clinic-shelter-domain
│  ├─ tent-shade-domain
│  │  └─ tropical-clinic-tent-shade-kit
│  └─ raft-stretcher-domain
│     └─ tropical-raft-stretcher-lane-kit
├─ recovery-handoff-domain
│  ├─ fever-herb-domain
│  │  └─ tropical-fever-herb-garden-kit
│  └─ evacuation-canoe-domain
│     └─ tropical-dawn-evacuation-canoe-kit
└─ renderer-handoff
   └─ tropical-storm-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tropical-injured-snorkeler-triage-buoy-kit`
- `tropical-freshwater-cistern-purity-kit`
- `tropical-clinic-tent-shade-kit`
- `tropical-raft-stretcher-lane-kit`
- `tropical-fever-herb-garden-kit`
- `tropical-dawn-evacuation-canoe-kit`
- `tropical-storm-clinic-renderer-handoff-kit`
- `tropical-storm-clinic-readiness-domain-kit`

Changed:

- Tropical Island route shell loads the new overlay.
- Tide-salvage CDN smoke imports the new validation pair so the existing routed check path executes the new tests.
- Domain cutover manifest records the storm clinic pass.

## Files changed

- `experiments/tropical-island-scene/src/tropical-storm-clinic-readiness-domain-kit.js`
- `experiments/tropical-island-scene/src/storm-clinic-readiness-entry.js`
- `experiments/tropical-island-scene/index.html`
- `tests/tropical-storm-clinic-readiness-kits-smoke.mjs`
- `tests/tropical-storm-clinic-cdn-state-input-smoke.mjs`
- `tests/tropical-tide-salvage-cdn-state-input-smoke.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-2000-tropical-storm-clinic-upgrade.md`

## Tests added

- `tests/tropical-storm-clinic-readiness-kits-smoke.mjs`
- `tests/tropical-storm-clinic-cdn-state-input-smoke.mjs`

## Validation results

Scratch validation performed before writing:

- `node --check` passed for the new kit file.
- `node --check` passed for the new entry file.
- `node --check` passed for both new smoke files.
- New 10-case kit smoke passed locally against generated files.
- New 10-case CDN/state-input smoke passed locally against generated files.

Connector limitation:

- Full repo `npm run check` / `npm run check:deploy` was not executed from a cloned workspace in this run.
- The existing tropical tide-salvage CDN smoke now imports both storm clinic smoke files, so repo check routing reaches the new validation through an already-listed suite.

## NexusRealtime import audit

- The new storm clinic entry imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The new storm clinic entry does not import `LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- The reusable storm clinic kit file contains no NexusRealtime import and no DOM, renderer, Three.js, WebGL, audio, asset-loading, or frame-loop ownership.
- The base Tropical Island import-map still points old NexusRealtime ProtoKit URLs at local shims for the older island/water stack. This pass did not remove those legacy compatibility shims because the changed storm clinic overlay uses the NexusEngine main CDN path and remains descriptor-only.

## Cleanup pass

- Kept the new clinic logic in a separate reusable domain kit.
- Kept DOM and Canvas drawing in the entry overlay only.
- Preserved previous lagoon, beachcomber, navigation, weather shelter, reef rescue, and tide salvage overlays.
- Registered the new domain in the manifest and route copy.
- Routed tests through the existing tropical check path instead of expanding the global run-check list.

## Non-game handling

Tropical Island Scene is a small experience-driven WebGL route, so no deletion, rename, or destructive refactor was required.

## Next safe ledge

Add a small player-facing objective summary that converts storm clinic readiness descriptors into explicit tasks: stabilize snorkelers, purify cisterns, open shade tents, move stretcher rafts, gather fever herbs, and launch dawn evacuation canoes.
