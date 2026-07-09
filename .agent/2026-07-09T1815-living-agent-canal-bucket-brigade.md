# 2026-07-09T18:15-04:00 — Living Agent canal bucket brigade upgrade

## Chosen experiment

`experiments/living-agent-lab/market-fire-evacuation.html`

## Why it was chosen

The latest main-branch upgrade before this pass was `experiments/vr-platformer-board/storm-harbor.html`, so VR Board was skipped. `living-agent-lab` is a compact drill with a simple action loop, deterministic state, and a small visual surface. It had less variability than the terrain, meadow, Sora flight, survival, tower-defense, and larger game routes, making it a safe target for another atomic objective/readability layer.

## Last upgraded experiment

Latest main commits before this pass showed:

- `927576eab3df17088bedebca7ed0d1ed5115e4ce` — `Log VR Board breakwater lighthouse upgrade`
- Prior commits in that same run wired the breakwater lighthouse route, runtime, kit smoke, CDN smoke, package validation, and gallery metadata.

Therefore the last upgraded experiment was `experiments/vr-platformer-board/storm-harbor.html`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | Uses NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene orchestration proof with puzzle tokens, route exits, and bell archive evacuation descriptors. | Short multi-scene proof, about 2-4 minutes. | Click/read scene exits, unlock route tokens, inspect state. | Not changed this run. | Existing route metadata says Nexus Engine; not changed this run. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer rescue with storm harbor and breakwater lighthouse descriptors. | Short board run, about 1-3 minutes. | A/D movement, Space jump, R reset, hazard avoidance, collectibles, skiff/lighthouse readiness. | Not changed this run. | Existing route uses NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with aquifer/glacier beacon overlays. | Open-ended traversal proof. | WASD flight, origin snapping, LOD bands, rescue descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, sky, ecology, soil overlays. | Open-ended scene inspection. | Walk/inspect procedural ecology and descriptor overlays. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/tiny-diffusion-lab/` | Browser-host tiny CPU diffusion training/sampling/checkpoint lab. | Workshop length, about 5-15 minutes. | Train, sample, checkpoint, inspect latent/dataset/kiln readiness. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Market fire evacuation drill with response policy plus canal bucket brigade descriptors. | Short drill, about 3-6 minutes. | Inspect lanterns, clear smoke aisles, stage relays, place firebreaks, muster civilians, prime cisterns, track bucket chain readiness. | Changed files do not import old `NexusRealtime@` browser URL. | Yes, changed runtime imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/fogline-relay/` | First-person fog survey with rescue/observatory/courier/search dog overlays. | Short route, about 3-7 minutes. | First-person scan targets, fog zones, timed pressure, hazard state. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/nexus-frontier-signal-isles/` | Island field-engineer slice with scan, harvest, build, cargo, triage, desalination overlays. | Medium slice, about 5-10 minutes. | Scan, harvest, build, pressure gates, storm/cargo descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof with standard-bearer morale descriptors. | Open-ended strategy-map inspection. | Pan/hover/dive interactions and army/region descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/signal-bastion/` | 2.5D tower defense with tower cards, placement ghosts, range rings, supply convoy readiness. | Game route, about 5-12 minutes. | Tower placement, upgrades, range, waves, convoy/repair descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, valves, rune gates, glowworm mapping. | Game route, about 5-12 minutes. | Carry blocks, valve pressure, gate logic, survivor pings. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/next-ledge/` | Grapple-climb validation with weather station, drone relay, rescue descriptors. | Short climb, about 2-5 minutes. | Grapple input, ledge route, swing pressure, extraction descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with debug rays and rescue/wayfinding overlays. | Short route, about 2-5 minutes. | Third-person movement, camera follow, route/debug descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Playable courier flight with thermal lanes, storm cells, signal buoys, fragile cargo. | Short flight, about 3-7 minutes. | Flight, storm avoidance, buoy tuning, cargo preservation. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, refuge/cure overlays. | Game slice, about 5-10 minutes. | Horde survival, pickups, weapons, crafting/refuge descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, wave defense, quarantine descriptors. | Game route, about 8-15 minutes. | Portals, inventory, harvest, build, wave defense, quarantine objectives. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop for model failure containment and operator drill descriptors. | Workshop drill, about 3-8 minutes. | Click/inspect workshop objects, containment/rollback/evidence readiness. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |

## Domain ASCII tree

```txt
living-agent-canal-bucket-brigade-readiness-domain
├─ water-source-domain
│  ├─ canal-cistern-domain
│  │  └─ living-agent-canal-cistern-intake-kit
│  └─ pump-wheel-domain
│     └─ living-agent-pump-wheel-primer-kit
├─ brigade-routing-domain
│  ├─ bucket-chain-domain
│  │  ├─ handoff-spacing-domain
│  │  │  └─ living-agent-bucket-chain-handoff-kit
│  └─ wet-burlap-screen-domain
│     └─ living-agent-wet-burlap-screen-kit
├─ civilian-safety-domain
│  ├─ child-muster-ribbon-domain
│  │  └─ living-agent-child-muster-ribbon-kit
│  └─ dawn-brigade-ledger-domain
│     └─ living-agent-dawn-brigade-ledger-kit
└─ renderer-handoff
   └─ living-agent-canal-bucket-brigade-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js` with:

- `createCanalCisternIntakeKit`
- `createPumpWheelPrimerKit`
- `createBucketChainHandoffKit`
- `createWetBurlapScreenKit`
- `createChildMusterRibbonKit`
- `createDawnBrigadeLedgerKit`
- `createLivingAgentCanalBucketBrigadeReadinessDomainKit`

The reusable kit file explicitly excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, agent policy, physics, storage, and network ownership.

## Files changed

- `experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js`
- `experiments/living-agent-lab/canal-bucket-brigade-readiness-entry.js`
- `experiments/living-agent-lab/market-fire-evacuation.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/living-agent-canal-bucket-brigade-readiness-kits-smoke.mjs`
- `tests/living-agent-canal-bucket-brigade-cdn-state-input-smoke.mjs`
- `package.json`
- `.agent/2026-07-09T1815-living-agent-canal-bucket-brigade.md`

## Tests added

- `tests/living-agent-canal-bucket-brigade-readiness-kits-smoke.mjs`
- `tests/living-agent-canal-bucket-brigade-cdn-state-input-smoke.mjs`

Both use 10 intake/state cases.

## Validation results

Local scratch validation passed:

```txt
node --check experiments/living-agent-lab/canal-bucket-brigade-readiness-kits.js
node --check experiments/living-agent-lab/canal-bucket-brigade-readiness-entry.js
node --check tests/living-agent-canal-bucket-brigade-readiness-kits-smoke.mjs
node --check tests/living-agent-canal-bucket-brigade-cdn-state-input-smoke.mjs
npm run check:living-agent-canal-brigade
```

Observed output:

```txt
Living Agent canal bucket brigade readiness kits smoke passed 10 intake cases.
Living Agent canal bucket brigade CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run in this automation scratch workspace because the full repo/dependency tree was not locally cloned. The changed test command was run successfully.

## NexusRealtime import audit

Changed files:

- New runtime imports NexusEngine main CDN: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New runtime does not import `LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- New reusable kit file has no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, network, or old NexusRealtime import.
- `market-fire-evacuation.html` now loads the existing market fire pass plus the new canal brigade pass.

Repository-level note: `package.json` still has historical package names in dependency aliases, but this pass did not add any old NexusRealtime browser import.

## Cleanup pass

- Kept the original market fire drill route intact.
- Added the new canal brigade pass as a route-owned overlay rather than moving renderer, input, agent policy, or frame-loop ownership into reusable kits.
- Composed the new descriptors into `GameHost.getRendererHandoff()` instead of replacing the existing market fire handoff.
- Added a small route-owned readiness panel so the new descriptors are visible without bloating reusable kit logic.
- Updated gallery copy to reflect the canal brigade objective layer.

## Next safe ledge

Draw the new canal descriptors directly onto the existing canvas: cistern intakes by the well, pump wheels near the canal, bucket-chain dots across the route, burlap screens between stalls, and child muster ribbons near the east gate. Keep drawing inside the route renderer only; keep the kits descriptor-only.
