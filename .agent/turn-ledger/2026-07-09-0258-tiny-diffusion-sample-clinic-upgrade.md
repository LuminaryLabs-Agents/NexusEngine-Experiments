# 2026-07-09 02:58 ET — Tiny Diffusion sample clinic upgrade

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

The latest completed upgrade observed on `main` was `games/rogue-lite-hellscape-siege/` via `Log Hellscape blood moon refuge upgrade`, so this run selected a different route. `Tiny Diffusion Lab` is less game-like than the stronger playable routes, but it has low variability after prepare/train/generate and benefits from a concrete review objective: inspect the generated sample, triage loss, prescribe retry actions, label the output, and decide whether it can be archived.

## Last upgraded experiment

`games/rogue-lite-hellscape-siege/`

Latest observed commit before this run:

```txt
5f932cf27617402a3ec53fdf9ad3338871b3ddc7
Log Hellscape blood moon refuge upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Changed files do not import old `LuminaryLabs-Dev/NexusRealtime@main`. | This run added a new NexusEngine main CDN sample clinic overlay. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Latest pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics and campaign overlays. | Existing legacy naming may remain. | Recent changed passes use NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Latest pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival orchard slice. | Short survival round. | Rounds, pickups, horde pressure, water restoration. | Existing legacy names may remain outside changed pass. | Recent well pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Last upgraded, skipped. | Latest pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
tiny-diffusion-sample-clinic-readiness-domain
├─ sample-observation-domain
│  ├─ artifact-scan-domain
│  │  └─ tiny-diffusion-artifact-scan-map-kit
│  └─ anomaly-mask-domain
│     └─ tiny-diffusion-anomaly-mask-kit
├─ training-health-domain
│  └─ loss-triage-domain
│     ├─ loss-band-domain
│     │  └─ tiny-diffusion-loss-triage-band-kit
│     └─ retry-prescription-domain
│        └─ tiny-diffusion-retry-prescription-kit
├─ curation-handoff-domain
│  ├─ curator-label-domain
│  │  └─ tiny-diffusion-curator-label-card-kit
│  └─ archive-ledger-domain
│     └─ tiny-diffusion-archive-handoff-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-sample-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
tiny-diffusion-artifact-scan-map-kit
tiny-diffusion-anomaly-mask-kit
tiny-diffusion-loss-triage-band-kit
tiny-diffusion-retry-prescription-kit
tiny-diffusion-curator-label-card-kit
tiny-diffusion-archive-handoff-ledger-kit
tiny-diffusion-sample-clinic-renderer-handoff-kit
tiny-diffusion-sample-clinic-readiness-domain-kit
```

The reusable kit file consumes diffusion preview metrics and sample pixels, then emits serializable descriptors only. It explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, diffusion backend, checkpoint storage, and frame-loop ownership.

## Files changed

```txt
experiments/tiny-diffusion-lab/index.html
experiments/tiny-diffusion-lab/app/sample-clinic-readiness-entry.js
experiments/tiny-diffusion-lab/kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js
tests/tiny-diffusion-sample-clinic-readiness-kits-smoke.mjs
tests/tiny-diffusion-sample-clinic-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0258-tiny-diffusion-sample-clinic-upgrade.md
```

## Tests added

```txt
tests/tiny-diffusion-sample-clinic-readiness-kits-smoke.mjs
tests/tiny-diffusion-sample-clinic-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/tiny-diffusion-lab/kits/tiny-diffusion-sample-clinic-readiness-domain-kit.js
node --check experiments/tiny-diffusion-lab/app/sample-clinic-readiness-entry.js
node --check tests/tiny-diffusion-sample-clinic-readiness-kits-smoke.mjs
node --check tests/tiny-diffusion-sample-clinic-cdn-state-input-smoke.mjs
node tests/tiny-diffusion-sample-clinic-readiness-kits-smoke.mjs
node tests/tiny-diffusion-sample-clinic-cdn-state-input-smoke.mjs
```

Observed local outputs:

```txt
Tiny Diffusion sample clinic readiness kits smoke passed 10 intake cases.
Tiny Diffusion sample clinic CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The added CDN/state test performs static route/CDN checks and 10 simulated state/input cases.

## NexusRealtime import audit

Changed files do not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main`. The new overlay imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Existing Tiny Diffusion runtime already imports NexusEngine main CDN in `main.js`, and the new sample clinic entry also imports NexusEngine main CDN.

## Cleanup pass

- Sample clinic domain logic is deterministic, serializable, and renderer-neutral.
- Route integration is cache-busted with `tiny-diffusion-sample-clinic-20260709`.
- The sample clinic panel uses descriptor rows rather than embedding training logic into DOM code.
- `TinyDiffusionLab.getRendererHandoff()` is patched by composition, preserving the previous training mission handoff and adding the sample clinic handoff.

## Non-game handling

`Tiny Diffusion Lab` is not a small experience-driven web game; it is a browser lab/proof for diffusion kits. It was not deleted or renamed because it proves the NexusEngine diffusion runtime path. The lesson is that labs still need objective descriptors: prepare/train/generate is not enough unless the generated output has a review, retry, curation, and archive handoff loop.

## Next safe ledge

Move the sample clinic panel from textual descriptors into a compact pixel-overlay visualization that draws artifact scan points and anomaly masks over the final image, while still keeping all scan/mask logic inside the renderer-neutral sample clinic domain kit.
