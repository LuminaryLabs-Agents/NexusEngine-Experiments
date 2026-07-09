# 2026-07-09 04:13 ET — Cavalry of Rome aqueduct sabotage upgrade

## Chosen experiment

`apps/the-cavalry-of-rome/` with reusable pass files under `experiments/The Cavalry of Rome/src/`.

## Why it was chosen

The latest completed upgrade ledger on `main` was `experiments/zombie-orchard/`, so this run selected a different route. `The Cavalry of Rome` already had campaign, logistics, diplomacy, field hospital, and grain convoy overlays, but it still lacked a water-infrastructure failure objective. The aqueduct sabotage layer adds a concrete civic survival pressure: keep springs guarded, identify cracked arches, ration cisterns, track saboteurs, dispatch engineers, and secure the dawn water ledger.

## Last upgraded experiment

```txt
experiments/zombie-orchard/
2026-07-09-0345-zombie-orchard-seed-bank-quarantine-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical, battery, ambulance, and clinic overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays, storm surge relay. | Recent changed files avoid old runtime CDN. | Recent overlay imports NexusEngine main CDN. |
| `experiments/domain-mana-rift/` | Scoped-domain rift arena. | Very short rift objective scene. | Shared enemy, health, guard, mana, status, zone, vegetation, interaction kits, spire stabilization descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics, diplomacy, field hospital, grain convoy, and aqueduct sabotage overlays. | Changed files do not import the old runtime CDN. | This run adds NexusEngine main CDN in the aqueduct sabotage pass. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Orchard survival slice. | Short survival round. | WASD movement, sprint, dodge, apple collection, gear use, horde pressure, cure crafting, safehouse evacuation, well restoration, seed bank quarantine descriptors. | Latest completed upgrade, skipped. | Recent seed bank pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Recent refuge pass uses NexusEngine main CDN. |
| `experiments/BirdRun/` | Canvas bird runner. | Short runner. | Lane switching, wingbeat altitude, grove obstacles, nestling rescue, scoring. | Recent changed files avoid old runtime CDN. | Recent canopy rescue pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
cavalry-aqueduct-sabotage-readiness-domain
├─ water-source-security-domain
│  ├─ spring-intake-watch-domain
│  │  └─ cavalry-spring-intake-watchtower-kit
│  └─ aqueduct-arch-stress-domain
│     └─ cavalry-aqueduct-arch-stress-mark-kit
├─ sabotage-response-domain
│  ├─ cistern-ration-domain
│  │  └─ cavalry-cistern-ration-token-kit
│  └─ saboteur-trail-domain
│     └─ cavalry-saboteur-trail-signal-kit
├─ repair-handoff-domain
│  ├─ engineer-column-domain
│  │  └─ cavalry-engineer-repair-column-kit
│  └─ dawn-water-ledger-domain
│     └─ cavalry-dawn-water-ledger-kit
└─ renderer-handoff
   └─ cavalry-aqueduct-sabotage-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
cavalry-spring-intake-watchtower-kit
cavalry-aqueduct-arch-stress-mark-kit
cavalry-cistern-ration-token-kit
cavalry-saboteur-trail-signal-kit
cavalry-engineer-repair-column-kit
cavalry-dawn-water-ledger-kit
cavalry-aqueduct-sabotage-renderer-handoff-kit
cavalry-aqueduct-sabotage-readiness-domain-kit
```

The reusable kit accepts campaign cells, turn, actions, preset, owner, troop, and neighbor intake. It emits deterministic serializable descriptors only. It explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.

## Files changed

```txt
apps/the-cavalry-of-rome/index.html
experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-domain-kit.js
experiments/The Cavalry of Rome/src/cavalry-aqueduct-sabotage-readiness-pass.js
tests/cavalry-aqueduct-sabotage-readiness-kits-smoke.mjs
tests/cavalry-aqueduct-sabotage-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0413-cavalry-aqueduct-sabotage-upgrade.md
```

## Tests added

```txt
tests/cavalry-aqueduct-sabotage-readiness-kits-smoke.mjs
tests/cavalry-aqueduct-sabotage-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check /mnt/data/cavalry/cavalry-aqueduct-sabotage-readiness-domain-kit.js
node --check /mnt/data/cavalry/cavalry-aqueduct-sabotage-readiness-pass.js
node --check /mnt/data/tests/cavalry-aqueduct-sabotage-readiness-kits-smoke.mjs
node --check /mnt/data/tests/cavalry-aqueduct-sabotage-cdn-state-input-smoke.mjs
node /mnt/data/tests/cavalry-aqueduct-sabotage-readiness-kits-smoke.mjs
node /mnt/data/tests/cavalry-aqueduct-sabotage-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Cavalry aqueduct sabotage readiness kits smoke passed 10 intake cases.
Cavalry aqueduct sabotage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector pass. The new smoke files are designed to be run from the repo root after checkout.

## NexusRealtime import audit

Changed files do not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

The new pass imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

## Cleanup pass

- Added one coherent civic-infrastructure objective layer instead of another generic map overlay.
- Reusable domain code stays deterministic, serializable, and renderer-neutral.
- DOM/canvas overlay code lives only in the route pass.
- `GameHost.getRendererHandoff()` composes aqueduct descriptors with existing campaign handoffs instead of replacing them.
- Route cache-bust now uses `campaign-039-aqueduct-sabotage`.

## Non-game handling

`The Cavalry of Rome` is a strategy/inspection app rather than a tiny arcade loop, so it was preserved and upgraded instead of renamed or deleted. The lesson from this pass is that static strategy-map proofs become more meaningful when visual overlays imply a civic objective with multiple interlocking atomic kit outputs.

## Next safe ledge

Turn aqueduct sabotage descriptors into actual map interactions: click spring intakes to assign sentries, click cracked arches to spend engineer carts, and let cistern ration pressure change the campaign status strip. Keep all decision generation in the new kits and let the renderer consume descriptors only.
