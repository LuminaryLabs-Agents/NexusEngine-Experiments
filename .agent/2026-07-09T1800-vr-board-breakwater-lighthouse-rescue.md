# 2026-07-09T18:00-04:00 — VR Board breakwater lighthouse rescue upgrade

## Chosen experiment

`experiments/vr-platformer-board/storm-harbor.html`

## Why it was chosen

The latest visible main-branch upgrade was `experiments/sora-the-infinite/stormglass-courier.html`, so Sora was skipped. `vr-platformer-board` is still a compact, experience-driven web game: short board traversal, jump/collect/hazard rules, and a single storm harbor route. It had less systemic variability than the larger meadow, terrain, Sora flight, Signal Isles, Hellscape, Zombie Orchard, and agent-lab routes, so it was a safe target for one more objective/readability layer.

## Last upgraded experiment

Latest main commits before this pass:

- `917d655da0ab18d97cd077adbceb8084f905ce69` — `Wire Sora stormglass courier validation`
- Prior Sora stormglass commits added the route, runtime, kit smoke, CDN smoke, and gallery routing.

Therefore the last upgraded experiment was `experiments/sora-the-infinite/stormglass-courier.html`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | Uses NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene orchestration proof with puzzle tokens, route exits, and bell archive evacuation descriptors. | Short multi-scene proof, about 2-4 minutes. | Click/read scene exits, unlock route tokens, inspect state. | No old import found in gallery metadata; not changed this run. | Existing route metadata says Nexus Engine; not changed this run. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation with storm harbor and new breakwater lighthouse rescue descriptors. | Short board run, about 1-3 minutes. | A/D movement, Space jump, R reset, hazard avoidance, collectibles, skiff/lighthouse readiness. | Changed files do not import old NexusRealtime. | Yes, changed runtime imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with aquifer/glacier beacon overlays. | Open-ended traversal proof. | WASD flight, origin snapping, LOD bands, rescue descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, sky, ecology, soil overlays. | Open-ended scene inspection. | Walk/inspect procedural ecology and descriptor overlays. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/tiny-diffusion-lab/` | Browser-host tiny CPU diffusion training/sampling/checkpoint lab. | Workshop length, about 5-15 minutes. | Train, sample, checkpoint, inspect latent/dataset/kiln readiness. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Market fire evacuation drill with response policy descriptors. | Short drill, about 3-6 minutes. | Inspect hazards, place/clear response steps, close ledger. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/fogline-relay/` | First-person fog survey with rescue/observatory/courier/search dog overlays. | Short route, about 3-7 minutes. | First-person scan targets, fog zones, timed pressure, hazard state. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/nexus-frontier-signal-isles/` | Island field-engineer slice with scan, harvest, build, cargo, triage, desalination overlays. | Medium slice, about 5-10 minutes. | Scan, harvest, build, pressure gates, storm/cargo descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof with standard-bearer morale descriptors. | Open-ended strategy-map inspection. | Pan/hover/dive interactions and army/region descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/signal-bastion/` | 2.5D tower defense with tower cards, placement ghosts, range rings, supply convoy readiness. | Game route, about 5-12 minutes. | Tower placement, upgrades, range, waves, convoy/repair descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, valves, rune gates, glowworm mapping. | Game route, about 5-12 minutes. | Carry blocks, valve pressure, gate logic, survivor pings. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/next-ledge/` | Grapple-climb validation with weather station, drone relay, rescue descriptors. | Short climb, about 2-5 minutes. | Grapple input, ledge route, swing pressure, extraction descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with debug rays and rescue/wayfinding overlays. | Short route, about 2-5 minutes. | Third-person movement, camera follow, route/debug descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Playable courier flight with thermal lanes, storm cells, signal buoys, fragile cargo. | Short flight, about 3-7 minutes. | Flight, storm avoidance, buoy tuning, cargo preservation. | Not changed this run. | Latest prior route uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, refuge/cure overlays. | Game slice, about 5-10 minutes. | Horde survival, pickups, weapons, crafting/refuge descriptors. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, wave defense, quarantine descriptors. | Game route, about 8-15 minutes. | Portals, inventory, harvest, build, wave defense, quarantine objectives. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop for model failure containment and operator drill descriptors. | Workshop drill, about 3-8 minutes. | Click/inspect workshop objects, containment/rollback/evidence readiness. | Not audited beyond inventory this run. | Existing Nexus Engine route; not changed this run. |

## Domain ASCII tree

```txt
vr-board-breakwater-lighthouse-rescue-readiness-domain
├─ breakwater-signal-domain
│  ├─ storm-lamp-post-domain
│  │  └─ vr-board-storm-lamp-post-kit
│  └─ wave-splash-marker-domain
│     └─ vr-board-wave-splash-marker-kit
├─ lighthouse-focus-domain
│  ├─ prism-calibration-domain
│  │  ├─ prism-ring-domain
│  │  │  └─ vr-board-prism-calibration-ring-kit
│  └─ foghorn-timing-domain
│     └─ vr-board-foghorn-timing-bell-kit
├─ survivor-lane-domain
│  ├─ lifeline-rope-domain
│  │  └─ vr-board-lifeline-rope-lane-kit
│  └─ dawn-lighthouse-ledger-domain
│     └─ vr-board-dawn-lighthouse-ledger-kit
└─ renderer-handoff
   └─ vr-board-breakwater-lighthouse-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/vr-platformer-board/vr-board-breakwater-lighthouse-rescue-readiness-kits.js` with:

- `createStormLampPostKit`
- `createWaveSplashMarkerKit`
- `createPrismCalibrationRingKit`
- `createFoghornTimingBellKit`
- `createLifelineRopeLaneKit`
- `createDawnLighthouseLedgerKit`
- `createVrBoardBreakwaterLighthouseRescueReadinessDomainKit`

The reusable kit file explicitly excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, storage, and network ownership.

## Files changed

- `experiments/_kits/vr-platformer-board/vr-board-breakwater-lighthouse-rescue-readiness-kits.js`
- `experiments/vr-platformer-board/breakwater-lighthouse-rescue-entry.js`
- `experiments/vr-platformer-board/storm-harbor.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/vr-board-breakwater-lighthouse-rescue-readiness-kits-smoke.mjs`
- `tests/vr-board-breakwater-lighthouse-rescue-cdn-state-input-smoke.mjs`
- `package.json`
- `.agent/2026-07-09T1800-vr-board-breakwater-lighthouse-rescue.md`

## Tests added

- `tests/vr-board-breakwater-lighthouse-rescue-readiness-kits-smoke.mjs`
- `tests/vr-board-breakwater-lighthouse-rescue-cdn-state-input-smoke.mjs`

Both use 10 intake/state cases.

## Validation results

Local scratch validation passed:

```txt
node --check experiments/_kits/vr-platformer-board/vr-board-breakwater-lighthouse-rescue-readiness-kits.js
node --check experiments/vr-platformer-board/breakwater-lighthouse-rescue-entry.js
node --check tests/vr-board-breakwater-lighthouse-rescue-readiness-kits-smoke.mjs
node --check tests/vr-board-breakwater-lighthouse-rescue-cdn-state-input-smoke.mjs
npm run check:vr-board-breakwater-lighthouse
```

Observed output:

```txt
VR Board breakwater lighthouse rescue readiness kits smoke passed 10 intake cases.
VR Board breakwater lighthouse rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run in this automation scratch workspace because the full repo/dependency tree was not locally cloned. The changed test command was run successfully.

## NexusRealtime import audit

Changed files:

- New runtime imports NexusEngine main CDN: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New runtime does not import `LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- New reusable kit file has no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, network, or old NexusRealtime import.
- `storm-harbor.html` now loads the existing storm harbor pass plus the new breakwater lighthouse pass.

Repository-level note: `package.json` still has historical package names in dependency aliases, but this pass did not add any old NexusRealtime browser import.

## Cleanup pass

- Fixed the overlay bootstrap so it keeps polling until `window.GameHost` exists instead of clearing the timer too early.
- Kept the original storm harbor game route intact.
- Added the new layer as a descriptor/state handoff overlay rather than moving renderer, input, physics, or frame-loop ownership into reusable kits.
- Updated gallery copy to reflect Breakwater Lighthouse rather than only Storm Harbor.

## Next safe ledge

Render a few of the new breakwater descriptors directly inside the board canvas: storm lamp glows, prism rings near the skiff gate, and lifeline ropes between platforms. Keep that drawing in the route renderer only; keep the kit as descriptor-only.
