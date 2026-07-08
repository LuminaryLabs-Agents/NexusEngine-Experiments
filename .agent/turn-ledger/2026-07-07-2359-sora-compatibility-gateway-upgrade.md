# Sora compatibility gateway upgrade

## Summary

- Chosen experiment: `experiments/sora-the-infinite/`.
- Last upgraded experiment avoided: `experiments/high-fidelity-meadow/`.
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main` only.
- Branches: no new branch created.

## Why this experiment was chosen

`experiments/sora-the-infinite/` was the least complete experience surface in the canonical route list because it was a zero-frame redirect into `experiments/the-open-above/`. It preserved a legacy name, but it did not expose its own state, input behavior, route continuity diagnostics, or renderer-neutral domain handoff. This pass keeps the compatibility behavior but turns it into a small authored launch gateway with procedural sky-memory descriptors, launch vector descriptors, input coaching, and continuity gate descriptors.

## Last upgraded experiment

Recent commits showed the previous completed upgrade sequence was `high-fidelity-meadow`, ending in `Log meadow visual fractal upgrade`. This run explicitly avoided `high-fidelity-meadow` and picked a different route.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `peer-scene-transition` | Multi-scene HTML transition/puzzle route | 3-6 min | actions, inventory gates, scene exits, debug state | no changed-runtime old import observed | yes |
| `vr-platformer-board` | Spatial board platformer/XR facade | 2-4 min | A/D movement, jump, reset, head-pose drag, board descriptors | no changed-runtime old import observed | yes |
| `next-ledge` | Grapple/climb extraction route | 2-5 min | click/Space grapple, A/D swing, reset, sector advance, cargo handoff | no changed-runtime old import observed | yes |
| `infinite-radial-terrain` | Infinite radial terrain browser flight/debug scene | open-ended | WASD/QE camera, radial LOD, terrain descriptor overlays | no changed-runtime old import observed | yes |
| `high-fidelity-meadow` | Procedural meadow visual scene | open-ended | orbit camera, camera beat advance, wind seed advance, meadow visual descriptors | no changed-runtime old import observed | yes |
| `fogline-relay` | First-person fog relay scan route | 3-6 min | movement/look, hold scan, relays, pressure, hazards | no changed-runtime old import observed | yes |
| `nexus-frontier-signal-isles` | Kit utilization survival/island route | 5-10 min | movement/look, scan, harvest, build, survive, beacon activation | not changed in this pass | not changed in this pass |
| `sora-the-infinite` | Legacy Sora route; now authored compatibility gateway | 30-90 sec before handoff | W/Space lift, A/D or pointer bank, readiness, launch handoff | removed zero-frame redirect; no old CDN in changed runtime | yes |
| `zombie-orchard` | Survival orchard route | 3-6 min | move/sprint/dodge, collect, gear, waves, combat cues | no changed-runtime old import observed | yes |

## Domain ASCII tree

```txt
sora-compatibility-domain
├─ alias-continuity-domain
│  └─ sora-alias-provenance-kit
├─ launch-readiness-domain
│  ├─ launch-vector-domain
│  │  └─ sora-launch-vector-kit
│  └─ input-coaching-domain
│     └─ sora-input-coaching-kit
├─ sky-memory-domain
│  └─ sora-sky-memory-band-kit
├─ continuity-gate-domain
│  └─ sora-continuity-gate-kit
└─ renderer-handoff
   └─ sora-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `sora-alias-provenance-kit`
- `sora-launch-vector-kit`
- `sora-sky-memory-band-kit`
- `sora-continuity-gate-kit`
- `sora-input-coaching-kit`
- `sora-renderer-handoff-kit`
- `sora-compatibility-domain-kit`

These kits accept plain route/input/tick/readiness/query/hash data and emit serializable descriptors. They do not own the DOM, browser input, WebGL, audio, asset loading, Three.js, or the frame loop.

## Files changed

Added:

- `experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js`
- `experiments/sora-the-infinite/sora-compatibility-gateway.js`
- `experiments/sora-the-infinite/sora-compatibility-style.css`
- `tests/sora-compatibility-domain-kits-smoke.mjs`
- `tests/sora-compatibility-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-07-2359-sora-compatibility-gateway-upgrade.md`

Changed:

- `experiments/sora-the-infinite/index.html`
- `experiments/domain-kit-cutover-manifest.json`
- `scripts/run-checks.mjs`

## Tests added

- `tests/sora-compatibility-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks alias provenance, launch vector count, sky memory band count, continuity gate count, coaching descriptors, renderer-handoff contract, serialization, and renderer-neutral ownership.

- `tests/sora-compatibility-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks the route HTML no longer uses a meta refresh, the runtime imports NexusEngine main CDN, the changed runtime does not import old NexusRealtime CDN, GameHost exposes state/renderer handoff, and target handoff preserves `../the-open-above/`.

Both tests are wired into `scripts/run-checks.mjs` for full and deploy validation.

## Validation results

Static connector validation completed by refetching the changed runtime, kit, tests, and check runner from GitHub after the writes.

Runtime shell validation was not executed in this connector-only run. The wired commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed route runtime imports NexusEngine main CDN:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- Changed route runtime does not include the old NexusRealtime CDN string.
- `package.json` still contains historical dev dependency names and the legacy `kit:inject` script name; those were not part of this route-level cutover.

## Cleanup pass

- Removed the zero-frame `meta refresh` from `experiments/sora-the-infinite/index.html`.
- Preserved the legacy route and target handoff instead of deleting the route.
- Kept compatibility with `../the-open-above/`.
- Kept reusable descriptor logic outside the renderer and browser event layer.
- Added GameHost state surfaces for debugging and smoke coverage.

## Next safe ledge

Add a deterministic Sora-to-Open-Above handoff replay that launches from the gateway, records query/hash propagation, verifies the target route boots, and snapshots the final `GameHost` state after the handoff.
