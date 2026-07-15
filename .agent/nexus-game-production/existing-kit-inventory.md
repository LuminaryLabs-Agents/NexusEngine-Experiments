# Existing ProtoKit Inventory

Status: Phase A baseline complete
Captured: 2026-07-15T12:02:05-04:00
ProtoKits commit: `ffdcc962d3c984864a2d78e9276879adf04250eb`

## Summary

- 514 top-level ProtoKit folders; 510 expose a top-level entrypoint.
- 188 have a top-level README; 51 have a top-level machine contract; 42 have local test evidence.
- 17 normalized-name clusters require duplicate or alias review.
- 34 folders contain renderer/browser tokens; 3 contain unseeded-random tokens; 3 contain wall-clock tokens. These are audit signals, not automatic verdicts.
- All entries predate this production pipeline and count as zero new mission kits.

## Inventory Limits

This is discovery evidence, not catalog acceptance. Folder names and static tokens cannot prove purpose, ownership, exclusions, idempotency, state, events, methods, snapshot behavior, or first experiment proof. Phase B must perform that natural-language audit before accepting any adjacent new definition.

## Normalized Duplicate And Alias Risks

| Normalized boundary | Existing folders |
| --- | --- |
| `interaction` | `interaction-domain-kit`, `interaction-domain-service-kit`, `interaction-dsk`, `interaction-kit` |
| `action-window` | `action-window-domain-kit`, `generic-action-window-kit` |
| `affordance-descriptor` | `affordance-descriptor-domain-kit`, `generic-affordance-descriptor-kit` |
| `biome-field` | `biome-field-kit`, `generic-biome-field-kit` |
| `camera-mode` | `camera-mode-domain`, `generic-camera-mode-kit` |
| `damage-health` | `damage-health-domain-kit`, `damage-health-kit` |
| `environment` | `environment-domain`, `environment-kits` |
| `kit-registry` | `kit-registry`, `kit-registry-domain-kit` |
| `objective-flow` | `objective-flow-domain-kit`, `objective-flow-kit` |
| `performance-budget` | `generic-performance-budget-kit`, `performance-budget-kit` |
| `persistence` | `persistence-domain-service-kit`, `persistence-dsk` |
| `render-descriptor` | `generic-render-descriptor-kit`, `render-descriptor-domain-kit` |
| `selection` | `selection-domain-service-kit`, `selection-dsk` |
| `spatial-scene-graph` | `spatial-scene-graph-dsk`, `spatial-scene-graph-kit` |
| `transform` | `transform-domain-service-kit`, `transform-dsk` |
| `vegetation-placement` | `vegetation-placement-domain-kit`, `vegetation-placement-kit` |
| `widget` | `widget-domain-service-kit`, `widget-dsk` |

## Full Top-Level Inventory

| Folder | Entry | README | Contract | Tests | Boundary signals |
| --- | ---: | ---: | --- | ---: | --- |
| `protokits/2d-platformer-domain` | yes | no | none | no | none |
| `protokits/aaa-batch-deploy-bridge` | yes | yes | none | no | adapter/host-name |
| `protokits/acoustic-signal-domain-kit` | yes | no | none | no | none |
| `protokits/action-input-kit` | yes | yes | none | yes | none |
| `protokits/action-window-domain-kit` | yes | yes | none | yes | renderer/browser |
| `protokits/actor-render-kit` | yes | no | none | no | none |
| `protokits/adaptive-visual-core` | yes | yes | none | no | renderer/browser |
| `protokits/adventure-domain` | yes | no | none | no | none |
| `protokits/aerial-biome-fidelity-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/aerial-camera-rig-domain-kit` | yes | no | none | no | none |
| `protokits/aerial-canyon-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/aerial-cel-flight-feel-kits` | yes | yes | none | no | composite-name |
| `protokits/aerial-combat-domain-kit` | yes | no | none | no | none |
| `protokits/aerial-encounter-director-kit` | yes | no | none | no | none |
| `protokits/aerial-flight-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/aerial-mission-sequence-kit` | yes | no | none | no | none |
| `protokits/aerial-patch-window-domain-kit` | yes | no | none | no | renderer/browser |
| `protokits/aerial-procedural-object-domain-kit` | yes | no | none | no | none |
| `protokits/aerial-projectile-system-kit` | yes | no | none | no | none |
| `protokits/aerial-render-bundle-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/aerial-ui-interaction-kits` | yes | yes | none | no | composite-name |
| `protokits/aerial-vegetation-placement-domain-kit` | yes | no | none | no | none |
| `protokits/affordance-choice-kit` | yes | yes | none | no | none |
| `protokits/affordance-descriptor-domain-kit` | yes | yes | none | yes | none |
| `protokits/agent-avatar-domain-kit` | yes | no | none | no | none |
| `protokits/agent-command-bridge-kit` | yes | no | none | no | adapter/host-name |
| `protokits/agent-eval-harness-kit` | yes | no | none | no | none |
| `protokits/agent-group-kit` | yes | no | none | no | none |
| `protokits/agent-kit` | yes | yes | none | no | unseeded-random |
| `protokits/agent-policy-validation-kit` | yes | no | none | no | none |
| `protokits/agriculture-domain-kit` | yes | yes | `kit.manifest.json` | yes | none |
| `protokits/anime-skybox-domain-kit` | no | no | none | no | none |
| `protokits/arcade-race-core` | yes | no | none | no | none |
| `protokits/arcade-race-visual-kit` | yes | no | none | no | none |
| `protokits/asset-descriptor-kit` | yes | no | none | no | none |
| `protokits/asset-load-queue-kit` | yes | yes | none | no | none |
| `protokits/asset-pack-manifest-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/asset-quality-kit` | yes | yes | none | no | none |
| `protokits/async-domain-load-kit` | yes | yes | none | no | none |
| `protokits/async-kit-bundle` | yes | no | none | no | composite-name |
| `protokits/atmosphere-domain-service-kit` | yes | yes | none | no | none |
| `protokits/audio-event-feedback-maker-kit` | yes | no | none | no | none |
| `protokits/audio-feedback-domain-kit` | yes | yes | none | yes | none |
| `protokits/banded-infinite-terrain-kit` | yes | yes | `kit.json` | no | none |
| `protokits/billboard-prop-kit` | yes | no | none | no | none |
| `protokits/biome-field-kit` | yes | no | none | no | none |
| `protokits/blackwake-game-isles` | yes | no | none | no | composite-name |
| `protokits/blackwake-game-stormline-rescue` | yes | no | none | no | composite-name |
| `protokits/blackwake-gameplay` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/blackwake-kit-registry` | yes | yes | none | no | none |
| `protokits/blackwake-preset-kit` | yes | no | none | no | none |
| `protokits/boost-path-kit` | yes | no | none | no | none |
| `protokits/build-placement-kit` | yes | no | none | no | none |
| `protokits/camera-cinematic-maker-kit` | yes | no | none | no | none |
| `protokits/camera-mode-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/camera-shake-kit` | yes | yes | none | no | none |
| `protokits/campfire-object-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/canvas-render-adapter-kit` | yes | yes | none | no | adapter/host-name |
| `protokits/canyon-terrain-domain-kit` | yes | no | none | no | none |
| `protokits/capability-graph-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/cargo-delivery-kit` | yes | no | none | no | none |
| `protokits/cel-shading-domain-kit` | yes | no | none | no | none |
| `protokits/chat-io-domain-kit` | yes | no | none | no | none |
| `protokits/checkpoint-volume-kit` | yes | no | none | no | none |
| `protokits/climb-camera-kit` | yes | no | none | no | none |
| `protokits/climb-input-kit` | yes | no | none | no | none |
| `protokits/climb-risk-kit` | yes | no | none | no | none |
| `protokits/cloud-zone-kit` | yes | no | none | no | none |
| `protokits/combat-stance-domain-kit` | yes | yes | none | yes | none |
| `protokits/completion-ledger-kit` | yes | no | none | no | none |
| `protokits/composition-planning-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/condition-gate-domain-kit` | yes | no | none | no | none |
| `protokits/configurable-render-layer-kit` | yes | yes | none | yes | none |
| `protokits/content-palette-kit` | yes | no | none | no | none |
| `protokits/content-preset-kit` | yes | no | none | no | none |
| `protokits/conversation-bubble-domain-kit` | yes | no | none | no | none |
| `protokits/course-director-kit` | yes | no | none | no | none |
| `protokits/cozy-hero-cloud-form-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/damage-health-domain-kit` | yes | no | none | no | none |
| `protokits/damage-health-kit` | yes | no | none | no | none |
| `protokits/data-registry-kit` | yes | no | none | no | none |
| `protokits/debug-overlay-kit` | yes | no | none | no | renderer/browser |
| `protokits/decal-kit` | yes | no | none | no | none |
| `protokits/deploy-manifest-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/deploy-registry-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/depth-fog-kit` | yes | no | none | no | none |
| `protokits/deterministic-replay-harness` | yes | no | none | no | none |
| `protokits/diegetic-feedback-kit` | yes | no | none | no | none |
| `protokits/diegetic-feedback-signal-kit` | yes | no | none | no | none |
| `protokits/difficulty-curve-kit` | yes | no | none | no | none |
| `protokits/disk-world-surface-kit` | yes | yes | `kit.json` | yes | none |
| `protokits/domain-boundary-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/domain-foundation` | yes | yes | none | no | none |
| `protokits/domain-inventory-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/domain-kits` | yes | no | none | no | composite-name |
| `protokits/domain-manifest-registry-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/domain-service-kits` | yes | yes | none | no | composite-name |
| `protokits/domain-taxonomy-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/downhill-race-kit` | yes | no | none | no | none |
| `protokits/embedding-memory-kit` | yes | no | none | no | none |
| `protokits/encounter-director-kit` | yes | no | none | no | none |
| `protokits/endless-ascent-kit` | yes | no | none | no | none |
| `protokits/enemy-agent-domain-kit` | yes | no | none | no | none |
| `protokits/enemy-body-domain-kit` | yes | yes | none | yes | none |
| `protokits/enemy-object-domain-kit` | yes | no | none | no | none |
| `protokits/environment-content-kit` | yes | yes | none | no | none |
| `protokits/environment-domain` | yes | no | none | no | none |
| `protokits/environment-field-stream-kit` | yes | no | none | no | none |
| `protokits/environment-kits` | yes | yes | none | no | composite-name |
| `protokits/fenced-clearing-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/first-person-camera-kit` | yes | no | none | no | none |
| `protokits/flight-camera-domain-kit` | yes | no | none | no | none |
| `protokits/flight-corridor-domain-kit` | yes | no | none | no | none |
| `protokits/flight-motion-kit` | yes | no | none | yes | none |
| `protokits/flock-agent-kit` | yes | no | none | no | none |
| `protokits/floor-casting-kit` | yes | no | none | no | none |
| `protokits/fluid-effects-kit` | yes | no | none | no | none |
| `protokits/fluid-field-kit` | yes | no | none | no | none |
| `protokits/fluid-motion-kit` | yes | no | none | no | none |
| `protokits/fluid-shading-kit` | yes | no | none | no | none |
| `protokits/fogline-survey-pressure-bridge-kit` | yes | no | none | no | adapter/host-name |
| `protokits/foliage-batch-descriptor-kit` | yes | no | none | no | none |
| `protokits/foliage-fps-composition-kit` | no | yes | none | no | none |
| `protokits/foliage-impostor-kit` | yes | no | none | no | none |
| `protokits/footstep-feedback-kit` | yes | yes | none | no | none |
| `protokits/foundation-kit` | yes | no | none | no | none |
| `protokits/fps-motion-kit` | yes | yes | none | no | none |
| `protokits/gallery-registry-bridge` | yes | yes | none | no | adapter/host-name |
| `protokits/gamehost-standard-kit` | yes | no | none | no | adapter/host-name |
| `protokits/gaussian-splat-domain` | yes | yes | `kit.json` | yes | none |
| `protokits/generated-route-host-bridge` | yes | yes | none | no | adapter/host-name |
| `protokits/generic-action-window-kit` | yes | yes | none | yes | renderer/browser |
| `protokits/generic-affordance-descriptor-kit` | yes | yes | none | yes | none |
| `protokits/generic-anchor-descriptor-kit` | yes | yes | `kit.manifest.json` | yes | none |
| `protokits/generic-avatar-on-foot-kit` | yes | no | none | no | none |
| `protokits/generic-avatar-state-kit` | yes | no | none | no | none |
| `protokits/generic-avatar-vehicle-station-kit` | yes | no | none | no | none |
| `protokits/generic-biome-field-kit` | yes | no | none | no | none |
| `protokits/generic-browser-smoke-test-kit` | yes | no | none | no | none |
| `protokits/generic-buoyancy-kit` | yes | no | none | no | none |
| `protokits/generic-camera-collision-kit` | yes | no | none | no | none |
| `protokits/generic-camera-comfort-kit` | yes | no | none | no | none |
| `protokits/generic-camera-mode-kit` | yes | no | none | no | none |
| `protokits/generic-camera-sequence-kit` | yes | no | none | no | none |
| `protokits/generic-camera-state-kit` | yes | no | none | no | none |
| `protokits/generic-cargo-kit` | yes | no | none | no | none |
| `protokits/generic-cargo-transfer-kit` | yes | no | none | no | none |
| `protokits/generic-climbing-kit` | yes | no | none | no | none |
| `protokits/generic-clock-kit` | yes | no | none | no | none |
| `protokits/generic-currency-kit` | yes | no | none | no | none |
| `protokits/generic-current-field-kit` | yes | no | none | no | none |
| `protokits/generic-defense-aaa-dsk-bridge` | yes | no | none | no | adapter/host-name |
| `protokits/generic-defense-aaa-kits` | yes | yes | none | yes | composite-name, wall-clock |
| `protokits/generic-defense-dsk-boundaries` | yes | yes | none | no | none |
| `protokits/generic-defense-kits` | yes | yes | none | yes | composite-name |
| `protokits/generic-defense-presentation-stack-kit` | yes | yes | none | yes | none |
| `protokits/generic-defense-project-bridge` | yes | yes | none | no | adapter/host-name |
| `protokits/generic-defense-project-kits` | yes | yes | none | no | composite-name |
| `protokits/generic-defense-session-command-kit` | yes | no | none | no | none |
| `protokits/generic-discovery-kit` | yes | no | none | no | none |
| `protokits/generic-diving-kit` | yes | no | none | no | none |
| `protokits/generic-docking-anchor-kit` | yes | no | none | no | none |
| `protokits/generic-effects-three-kit` | yes | no | none | no | none |
| `protokits/generic-error-overlay-kit` | yes | no | none | no | none |
| `protokits/generic-fail-state-kit` | yes | no | none | no | none |
| `protokits/generic-fallback-renderer-kit` | yes | no | none | no | adapter/host-name, renderer/browser |
| `protokits/generic-foam-field-kit` | yes | no | none | no | none |
| `protokits/generic-game-preset-kit` | yes | no | none | no | composite-name |
| `protokits/generic-health-report-kit` | yes | no | none | no | none |
| `protokits/generic-hold-action-kit` | yes | no | none | no | none |
| `protokits/generic-hud-dom-kit` | yes | no | none | no | none |
| `protokits/generic-input-actions-kit` | yes | no | none | no | none |
| `protokits/generic-input-buffer-kit` | yes | no | none | no | none |
| `protokits/generic-input-context-kit` | yes | no | none | no | none |
| `protokits/generic-input-device-kit` | yes | no | none | no | none |
| `protokits/generic-interactable-kit` | yes | no | none | no | none |
| `protokits/generic-inventory-kit` | yes | no | none | no | none |
| `protokits/generic-kit-utils` | yes | no | none | no | none |
| `protokits/generic-kits` | yes | no | none | no | composite-name |
| `protokits/generic-market-kit` | yes | no | none | no | none |
| `protokits/generic-memory-pool-kit` | yes | no | none | no | none |
| `protokits/generic-mission-phase-kit` | yes | no | none | no | none |
| `protokits/generic-mode-port-upgrade-loop` | yes | no | none | no | none |
| `protokits/generic-mode-projected-route` | yes | yes | none | yes | none |
| `protokits/generic-mode-storm-navigation` | yes | no | none | no | none |
| `protokits/generic-mode-swim-dive-recovery` | yes | no | none | no | none |
| `protokits/generic-mode-watercraft-exploration` | yes | no | none | no | none |
| `protokits/generic-objective-kit` | yes | no | none | no | none |
| `protokits/generic-particle-background-kit` | yes | yes | none | yes | none |
| `protokits/generic-performance-budget-kit` | yes | no | none | no | none |
| `protokits/generic-poi-placement-kit` | yes | no | none | no | none |
| `protokits/generic-pressure-loop-kit` | yes | yes | none | yes | none |
| `protokits/generic-procedural-field-kit` | yes | no | none | no | none |
| `protokits/generic-recovery-site-kit` | yes | no | none | no | none |
| `protokits/generic-render-descriptor-kit` | yes | no | none | no | none |
| `protokits/generic-replay-test-kit` | yes | no | none | no | none |
| `protokits/generic-resource-loop-kit` | yes | yes | `kit.manifest.json` | yes | renderer/browser |
| `protokits/generic-route-cargo-extraction-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/generic-route-field-kit` | yes | no | none | no | none |
| `protokits/generic-route-progress-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/generic-score-summary-kit` | yes | no | none | no | none |
| `protokits/generic-sector-world-kit` | yes | no | none | no | none |
| `protokits/generic-seed-kit` | yes | yes | `kit.manifest.json` | yes | none |
| `protokits/generic-spatial-index-kit` | yes | no | none | no | none |
| `protokits/generic-state-digest-kit` | yes | no | none | no | none |
| `protokits/generic-station-interaction-kit` | yes | no | none | no | none |
| `protokits/generic-surface-field-kit` | yes | no | none | no | none |
| `protokits/generic-surface-impact-kit` | yes | no | none | no | none |
| `protokits/generic-survival-domain-kits` | yes | no | none | no | composite-name |
| `protokits/generic-swimming-kit` | yes | no | none | no | none |
| `protokits/generic-tether-traversal-domain-kits` | yes | no | none | no | composite-name |
| `protokits/generic-three-renderer-kit` | yes | no | none | no | adapter/host-name |
| `protokits/generic-tutorial-prompt-kit` | yes | no | none | no | none |
| `protokits/generic-upgrade-kit` | yes | no | none | no | none |
| `protokits/generic-upgrade-station-kit` | yes | no | none | no | none |
| `protokits/generic-vehicle-control-kit` | yes | no | none | no | none |
| `protokits/generic-vehicle-damage-kit` | yes | no | none | no | none |
| `protokits/generic-vehicle-state-kit` | yes | no | none | no | none |
| `protokits/generic-vehicle-three-kit` | yes | no | none | no | none |
| `protokits/generic-visual-fx-descriptor-kits` | yes | yes | none | no | composite-name |
| `protokits/generic-water-three-kit` | yes | no | none | no | none |
| `protokits/generic-watercraft-physics-kit` | yes | no | none | no | none |
| `protokits/generic-watercraft-sailing-kit` | yes | no | none | no | none |
| `protokits/generic-watercraft-wake-kit` | yes | no | none | no | none |
| `protokits/generic-wave-spectrum-kit` | yes | no | none | no | none |
| `protokits/generic-weather-wind-kit` | yes | no | none | no | none |
| `protokits/generic-world-three-kit` | yes | no | none | no | none |
| `protokits/gpu-ambient-cave-dust-kit` | yes | no | none | no | none |
| `protokits/gpu-bubble-column-kit` | yes | no | none | no | none |
| `protokits/gpu-creature-alert-pulse-kit` | yes | no | none | no | none |
| `protokits/gpu-door-awakening-kit` | yes | no | none | no | none |
| `protokits/gpu-dust-cloud-kit` | yes | no | none | no | none |
| `protokits/gpu-foam-line-kit` | yes | no | none | no | none |
| `protokits/gpu-impact-chip-kit` | yes | no | none | no | none |
| `protokits/gpu-lantern-mote-kit` | yes | no | none | no | none |
| `protokits/gpu-rune-spark-kit` | yes | no | none | no | none |
| `protokits/gpu-shadow-flicker-kit` | yes | no | none | no | none |
| `protokits/gpu-sound-wave-particle-kit` | yes | no | none | no | none |
| `protokits/gpu-spark-burst-kit` | yes | no | none | no | none |
| `protokits/gpu-terrain-performance-circle-kit` | yes | yes | `kit.manifest.json` | no | renderer/browser |
| `protokits/gpu-water-mist-kit` | yes | no | none | no | none |
| `protokits/gpu-water-surface-shimmer-kit` | yes | no | none | no | none |
| `protokits/grass-object-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/grass-texture-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/grass-wind-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/ground-contact-kit` | yes | no | none | no | none |
| `protokits/guard-domain-kit` | yes | no | none | no | renderer/browser |
| `protokits/guided-kit-authoring-kit` | yes | no | none | no | renderer/browser |
| `protokits/hand-gesture-dsk` | yes | no | none | no | none |
| `protokits/hazard-director-kit` | yes | no | none | no | none |
| `protokits/high-fidelity-meadow-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/host-shell-contract-kit` | yes | yes | `kit.manifest.json` | no | adapter/host-name |
| `protokits/huggingface-loader-kit` | yes | yes | none | no | none |
| `protokits/inference-trace-domain-kit` | yes | no | none | no | none |
| `protokits/input-action-domain-kit` | yes | yes | none | yes | none |
| `protokits/input-kit` | yes | no | none | no | renderer/browser |
| `protokits/instance-batching-system-kit` | yes | yes | none | no | none |
| `protokits/instanced-render-kit` | yes | no | none | no | none |
| `protokits/interaction-domain-kit` | yes | no | none | no | none |
| `protokits/interaction-domain-service-kit` | yes | no | none | no | none |
| `protokits/interaction-dsk` | yes | no | none | no | none |
| `protokits/interaction-kit` | yes | no | none | no | none |
| `protokits/island-foliage-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/island-object-library-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/kit-boundary-lint-kit` | yes | no | none | no | renderer/browser |
| `protokits/kit-load-plan-kit` | yes | yes | none | no | none |
| `protokits/kit-manifest-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/kit-registry` | yes | yes | none | no | none |
| `protokits/kit-registry-domain-kit` | yes | yes | `kit.manifest.json` | yes | network, renderer/browser, unseeded-random, wall-clock |
| `protokits/layered-drunk-walk-level-generation-kit` | yes | yes | none | no | none |
| `protokits/layered-object-kit` | yes | no | none | no | none |
| `protokits/ledge-route-kit` | yes | no | none | no | renderer/browser |
| `protokits/lighting-descriptor-kit` | yes | no | none | no | none |
| `protokits/lighting-domain-service-kit` | yes | yes | none | no | none |
| `protokits/lighting-mood-kit` | yes | no | none | no | none |
| `protokits/lock-group-kit` | yes | no | none | no | none |
| `protokits/lod-selection-system-kit` | yes | yes | none | no | none |
| `protokits/loop-guard-domain-kit` | yes | no | none | no | none |
| `protokits/mana-meter-domain-kit` | yes | no | none | no | none |
| `protokits/material-domain-service-kit` | yes | yes | none | no | none |
| `protokits/material-palette-kit` | yes | no | none | no | none |
| `protokits/mattatz-clouds-domain` | yes | yes | `kit.manifest.json` | no | renderer/browser |
| `protokits/meadow-area-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/meadow-webgl-render-kit` | yes | yes | `kit.manifest.json` | no | renderer/browser |
| `protokits/mesh-assembly-descriptor-kit` | yes | no | none | no | none |
| `protokits/mesh-chunk-stream-kit` | yes | no | none | no | none |
| `protokits/model-core-visual-domain-kit` | yes | no | none | no | none |
| `protokits/model-download-cache-kit` | yes | yes | none | no | none |
| `protokits/model-loader-kit` | yes | yes | none | no | none |
| `protokits/model-manifest-kit` | yes | yes | none | no | none |
| `protokits/model-output-decoder-domain-kit` | yes | no | none | no | none |
| `protokits/model-provider-adapter-kit` | yes | no | none | no | adapter/host-name |
| `protokits/next-ledge-grapple-kit` | yes | yes | none | yes | none |
| `protokits/next-ledge-kit` | yes | yes | none | no | none |
| `protokits/nexus-dsk-adapter` | yes | no | none | no | adapter/host-name |
| `protokits/objaverse-asset-quality-kit` | yes | no | none | no | none |
| `protokits/objaverse-availability-stream-kit` | yes | no | none | no | none |
| `protokits/objaverse-catalog-kit` | yes | yes | none | no | none |
| `protokits/objaverse-impostor-descriptor-kit` | yes | no | none | no | none |
| `protokits/objaverse-license-kit` | yes | no | none | no | none |
| `protokits/objaverse-manifest-kit` | yes | yes | none | no | none |
| `protokits/objaverse-manifest-register-kit` | yes | yes | none | no | none |
| `protokits/objaverse-mesh-cache-kit` | yes | yes | none | no | none |
| `protokits/objaverse-mesh-request-kit` | yes | yes | none | no | none |
| `protokits/objaverse-metadata-delta-kit` | yes | no | none | no | none |
| `protokits/objaverse-metadata-index-kit` | yes | yes | none | no | none |
| `protokits/objaverse-metadata-stream-kit` | yes | yes | none | no | none |
| `protokits/objaverse-object-stream-kit` | yes | no | none | no | none |
| `protokits/objaverse-preview-kit` | yes | no | none | no | none |
| `protokits/objaverse-provenance-kit` | yes | no | none | no | none |
| `protokits/objaverse-runtime-object-kit` | yes | yes | none | no | none |
| `protokits/objaverse-scale-normalization-kit` | yes | no | none | no | none |
| `protokits/objaverse-streaming-bundle` | yes | yes | none | no | composite-name |
| `protokits/object-batch-delta-kit` | yes | no | none | no | none |
| `protokits/object-batch-lifecycle-kit` | yes | no | none | no | none |
| `protokits/object-bounds-descriptor-kit` | yes | no | none | no | none |
| `protokits/object-family-kit` | yes | yes | none | no | none |
| `protokits/object-grounding-profile-kit` | yes | yes | none | no | none |
| `protokits/object-import-profile-kit` | yes | no | none | no | none |
| `protokits/object-import-transform-kit` | yes | no | none | no | none |
| `protokits/object-instance-stream-kit` | yes | no | none | no | none |
| `protokits/object-lod-policy-kit` | yes | yes | none | no | none |
| `protokits/object-material-variant-kit` | yes | yes | none | no | none |
| `protokits/object-mesh-request-kit` | yes | yes | none | no | none |
| `protokits/object-pivot-anchor-kit` | yes | no | none | no | none |
| `protokits/object-residency-kit` | yes | yes | none | no | none |
| `protokits/object-state-stream-kit` | yes | no | none | no | none |
| `protokits/object-static-batch-kit` | yes | no | none | no | none |
| `protokits/object-stream-plan-kit` | yes | no | none | no | none |
| `protokits/object-stream-priority-kit` | yes | no | none | no | none |
| `protokits/object-variant-selection-kit` | yes | yes | none | no | none |
| `protokits/objective-bridge-kit` | yes | no | none | no | adapter/host-name |
| `protokits/objective-flow-domain-kit` | yes | yes | none | yes | none |
| `protokits/objective-flow-kit` | yes | no | none | no | none |
| `protokits/ocean-boat-kit` | yes | yes | none | no | renderer/browser, unseeded-random |
| `protokits/ocean-floor-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/ocean-island-landform-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/onnx-loader-kit` | yes | no | none | no | none |
| `protokits/onnx-workshop-threejs-kits` | yes | no | none | no | composite-name, renderer/browser |
| `protokits/onnx-workspace-kits` | yes | yes | none | no | composite-name |
| `protokits/openxr-hand-adapter-dsk` | yes | no | none | no | adapter/host-name |
| `protokits/parallax-kit` | yes | yes | none | yes | none |
| `protokits/parry-window-domain-kit` | yes | no | none | no | renderer/browser |
| `protokits/patch-object-batch-kit` | yes | no | none | no | none |
| `protokits/path-meadow-composition-kit` | yes | yes | none | no | none |
| `protokits/perception-kit` | yes | yes | none | no | none |
| `protokits/performance-budget-kit` | yes | no | none | no | none |
| `protokits/persistence-domain-service-kit` | yes | no | none | no | none |
| `protokits/persistence-dsk` | yes | no | none | no | none |
| `protokits/physics-body-lite-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-avatar-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-camera-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-collision-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-effects-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-level-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-object-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-objective-sequence-kit` | yes | no | none | no | none |
| `protokits/platformer-parallax-domain-kit` | yes | no | none | no | none |
| `protokits/platformer-physics-system-kit` | yes | no | none | no | none |
| `protokits/platformer-render-descriptor-kit` | yes | no | none | no | none |
| `protokits/powered-aerial-flight-domain-kit` | yes | no | none | no | none |
| `protokits/pressure-domain-kit` | yes | yes | none | yes | none |
| `protokits/procedural-cloud-layer-kit` | yes | yes | none | no | none |
| `protokits/procedural-foliage-bundle` | yes | no | none | no | composite-name |
| `protokits/procedural-foliage-composition-kit` | yes | no | none | no | none |
| `protokits/procedural-skybox-kit` | yes | yes | none | no | none |
| `protokits/procedural-texture-kit` | yes | no | none | no | renderer/browser |
| `protokits/procedural-tree-kits` | yes | yes | `kit.manifest.json` | no | composite-name, renderer/browser |
| `protokits/project-batch-deploy-bridge` | yes | yes | none | no | adapter/host-name |
| `protokits/projectile-lite-domain-kit` | yes | no | none | no | none |
| `protokits/promotion-readiness-harness` | yes | no | none | no | none |
| `protokits/prompt-composer-domain-kit` | yes | no | none | no | none |
| `protokits/protokit-core` | yes | yes | `kit.manifest.json` | yes | none |
| `protokits/quaternius-pack-library-kit` | yes | yes | `kit.json` | no | none |
| `protokits/quaternius-terrain-walker-kit` | yes | yes | `kit.json` | no | none |
| `protokits/quest-domain-kit` | yes | yes | none | yes | none |
| `protokits/race-hazard-kit` | yes | no | none | no | none |
| `protokits/race-pacing-kit` | yes | no | none | no | none |
| `protokits/racer-ai-kit` | yes | no | none | no | none |
| `protokits/racer-contact-kit` | yes | no | none | no | renderer/browser |
| `protokits/rapier-physics-domain-kit` | yes | yes | none | yes | none |
| `protokits/raycast-placement-kit` | yes | no | none | no | none |
| `protokits/raycaster-render-kit` | yes | no | none | no | none |
| `protokits/reactive-particle-field-kit` | yes | yes | none | no | none |
| `protokits/render-capability-kit` | yes | yes | none | no | none |
| `protokits/render-culling-system-kit` | yes | yes | none | no | none |
| `protokits/render-descriptor-domain-kit` | yes | yes | none | yes | none |
| `protokits/render-graph-kit` | yes | yes | none | no | none |
| `protokits/render-layer-kit` | yes | yes | none | no | none |
| `protokits/render-quality-budget-kit` | yes | yes | none | no | none |
| `protokits/rendering-stack-kits` | yes | yes | none | yes | composite-name, renderer/browser |
| `protokits/resource-node-kit` | yes | no | none | no | none |
| `protokits/resource-pressure-kit` | yes | no | none | no | none |
| `protokits/route-checkpoint-kit` | yes | no | none | no | none |
| `protokits/route-clearance-domain-kit` | yes | no | none | no | none |
| `protokits/rpg-social-domain-kits` | no | yes | none | no | composite-name |
| `protokits/rpg-social-fact-kit` | yes | yes | none | no | none |
| `protokits/run-movement-kit` | yes | yes | none | no | none |
| `protokits/save-delta-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/scan-affordance-domain-kit` | yes | yes | none | yes | none |
| `protokits/scan-survey-kit` | yes | no | none | no | none |
| `protokits/scatter-object-kit` | yes | no | none | no | none |
| `protokits/scatter-placement-kit` | yes | no | none | no | none |
| `protokits/scenario-qa-harness` | yes | no | none | no | none |
| `protokits/scenario-smoke-domain-kit` | yes | yes | none | yes | none |
| `protokits/scene-graph-domain-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/scene-lifecycle-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/scene-recipe-kit` | yes | no | none | no | none |
| `protokits/scene-transition-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/scoped-rpg-domain-kits-batch-02` | no | yes | none | no | none |
| `protokits/selection-domain-service-kit` | yes | no | none | no | none |
| `protokits/selection-dsk` | yes | no | none | no | none |
| `protokits/self-talk-loop-domain-kit` | yes | no | none | no | none |
| `protokits/semantic-bounded-domain-kits` | yes | yes | `kit.manifest.json` | no | composite-name |
| `protokits/sensory-agent-domain-kit` | yes | no | none | no | none |
| `protokits/session-facade-kit` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/simple-rigid-body-kit` | yes | yes | none | no | none |
| `protokits/simple-swing-kit` | yes | no | none | no | none |
| `protokits/simulation-interest-kit` | yes | no | none | no | none |
| `protokits/sky-atmosphere-kit` | yes | no | none | no | none |
| `protokits/sky-gradient-kit` | yes | yes | none | no | none |
| `protokits/slope-traversal-kit` | yes | no | none | no | none |
| `protokits/smoke-particle-domain` | yes | yes | `kit.manifest.json` | no | none |
| `protokits/spatial-anchor-domain-kit` | yes | no | none | no | none |
| `protokits/spatial-authoring-kits` | yes | yes | none | no | composite-name, renderer/browser |
| `protokits/spatial-authoring-toolkit-dsks` | yes | yes | none | no | none |
| `protokits/spatial-game-board-domain-kit` | yes | no | none | no | composite-name |
| `protokits/spatial-interaction-kit` | yes | no | none | no | none |
| `protokits/spatial-scene-graph-dsk` | yes | no | none | no | none |
| `protokits/spatial-scene-graph-kit` | yes | no | none | no | none |
| `protokits/spatial-surface-candidate-domain-kit` | yes | yes | `kit.manifest.json` | yes | renderer/browser |
| `protokits/spell-cast-domain-kit` | yes | yes | none | yes | none |
| `protokits/status-effect-domain-kit` | yes | no | none | no | none |
| `protokits/stereoscopic-render-domain-kit` | yes | yes | none | no | none |
| `protokits/stonewake-systems-domain-kits` | yes | yes | none | no | composite-name |
| `protokits/stonewake-visual-style-composition-kit` | yes | no | none | no | none |
| `protokits/stream-backpressure-kit` | yes | yes | none | no | none |
| `protokits/stream-channel-kit` | yes | yes | none | no | none |
| `protokits/stream-delta-apply-kit` | yes | yes | none | no | none |
| `protokits/stream-session-kit` | yes | yes | none | no | none |
| `protokits/stream-subscription-kit` | yes | yes | none | no | none |
| `protokits/structure-runtime-kit` | yes | no | none | no | none |
| `protokits/surface-material-kit` | yes | no | none | no | none |
| `protokits/survival-crafting-domain` | yes | no | none | no | renderer/browser |
| `protokits/terrain-erosion-solver-domain-kit` | yes | yes | none | no | none |
| `protokits/terrain-ground-contact-domain-kit` | yes | no | none | no | wall-clock |
| `protokits/terrain-height-domain-kit` | yes | yes | none | yes | none |
| `protokits/terrain-horizon-lod-kit` | yes | no | none | no | none |
| `protokits/terrain-hydrology-domain-kit` | yes | no | none | no | none |
| `protokits/terrain-material-paint-domain-kit` | yes | no | none | no | none |
| `protokits/terrain-sampler-kit` | yes | no | none | no | none |
| `protokits/terrain-shaping-domain-kit` | yes | no | none | no | none |
| `protokits/three-render-adapter-kit` | yes | no | none | no | adapter/host-name |
| `protokits/time-of-day-kit` | yes | yes | none | no | none |
| `protokits/timed-pressure-director-kit` | yes | no | none | no | none |
| `protokits/timed-pressure-domain-kit` | yes | no | none | yes | none |
| `protokits/token-registry-kit` | yes | no | none | no | none |
| `protokits/tokenizer-loader-kit` | yes | yes | none | no | none |
| `protokits/toon-visual-kit` | yes | yes | none | no | none |
| `protokits/transform-domain-service-kit` | yes | no | none | no | none |
| `protokits/transform-dsk` | yes | no | none | no | none |
| `protokits/universal-game-domain-kits` | yes | no | none | no | composite-name, renderer/browser |
| `protokits/updraft-volume-kit` | yes | no | none | no | none |
| `protokits/vegetation-archetype-kit` | yes | no | none | no | none |
| `protokits/vegetation-density-field-kit` | yes | yes | none | no | none |
| `protokits/vegetation-footprint-domain-kit` | yes | yes | none | yes | none |
| `protokits/vegetation-lod-kit` | yes | no | none | no | none |
| `protokits/vegetation-placement-domain-kit` | yes | no | none | no | none |
| `protokits/vegetation-placement-kit` | yes | yes | none | no | none |
| `protokits/vegetation-scale-domain-kit` | yes | yes | none | yes | none |
| `protokits/vertical-climb-core` | yes | no | none | no | none |
| `protokits/view-rig-kit` | yes | no | none | no | none |
| `protokits/visual-fidelity-maker-kit` | yes | no | none | no | none |
| `protokits/visual-policy-domain-service-kit` | yes | yes | none | no | none |
| `protokits/vr-platformer-kit-suite` | yes | yes | none | no | composite-name |
| `protokits/water-audio-kit` | yes | no | none | no | none |
| `protokits/water-behavior-kit` | yes | no | none | no | none |
| `protokits/water-data-kit` | yes | no | none | no | none |
| `protokits/water-effects-kit` | yes | no | none | no | none |
| `protokits/water-mesh-kit` | yes | no | none | no | none |
| `protokits/water-mode-kit` | yes | no | none | no | none |
| `protokits/water-physics-kit` | yes | no | none | no | none |
| `protokits/water-shading-kit` | yes | no | none | no | none |
| `protokits/water-stream-kit` | yes | no | none | no | none |
| `protokits/water-surface-kit` | yes | no | none | no | none |
| `protokits/webgl-render-adapter-kit` | yes | yes | none | no | adapter/host-name |
| `protokits/webgpu-render-adapter-kit` | yes | yes | none | no | adapter/host-name |
| `protokits/webgpu-render-kit` | yes | yes | `kit.json` | no | none |
| `protokits/webxr-hand-adapter-dsk` | yes | no | none | no | adapter/host-name |
| `protokits/webxr-hit-test-adapter-domain-kit` | yes | yes | `kit.manifest.json` | yes | adapter/host-name, renderer/browser |
| `protokits/weighted-trigger-domain-kit` | yes | no | none | no | none |
| `protokits/wgsl-shader-library-kit` | yes | yes | `kit.json` | no | none |
| `protokits/widget-domain-service-kit` | yes | no | none | no | none |
| `protokits/widget-dsk` | yes | no | none | no | none |
| `protokits/wind-field-kit` | yes | yes | none | no | none |
| `protokits/wind-response-kit` | yes | yes | none | no | none |
| `protokits/workspace-entity-domain-kit` | yes | no | none | no | none |
| `protokits/workspace-layout-domain-kit` | yes | no | none | no | none |
| `protokits/world-patch-kit` | yes | no | none | no | none |
| `protokits/world-patch-stream-kit` | yes | no | none | no | none |
| `protokits/world-zone-domain-kit` | yes | no | none | no | none |
| `protokits/xr-comfort-domain-kit` | yes | no | none | no | none |
| `protokits/xr-frame-kit` | yes | yes | none | no | none |
| `protokits/xr-grab-throw-kit` | yes | yes | none | no | none |
| `protokits/xr-house-demo-kit` | yes | yes | none | no | none |
| `protokits/xr-input-adapter-kit` | yes | no | none | no | adapter/host-name |
| `protokits/xr-input-kit` | yes | yes | none | no | none |
| `protokits/xr-layer-kit` | yes | yes | none | no | none |
| `protokits/xr-platformer-render-adapter-kit` | yes | no | none | no | adapter/host-name |
| `protokits/xr-pose-domain-kit` | yes | no | none | no | none |
| `protokits/xr-render-descriptor-kit` | yes | yes | none | no | none |
| `protokits/xr-session-kit` | yes | yes | none | no | none |
| `protokits/zombie-orchard` | yes | no | none | no | none |
| `protokits/zone-field-kit` | yes | no | none | no | none |

## Mission Counting Decision

No existing folder is relabeled as one of the 100 new ProtoKits. New catalog entries must be genuinely new responsibilities, pass Core and inventory duplicate checks, and satisfy the complete kit-map contract before implementation.
