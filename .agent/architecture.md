# Architecture Rules

## Core

Stable runtime primitives and already-promoted capabilities. Read-only from this workflow.

## Engine Domains

NexusEngine-ProtoKits owns reusable deterministic behavior behind small domain-service APIs. Semantic promotion proceeds one layer at a time: implementation, behavior, kit, subdomain, domain, cross-domain capability.

## Application Domains

Each full-game kit is a thin local composition boundary: player fantasy, loop, scene descriptors, policies, selected domains, authored tuning, quality budget, and proof contract. It may compose engine domains but must not copy their logic.

Browser input, renderer, camera, audio playback, visual effects, DOM/interface rendering, network transport, storage, authored scenes, and authored tuning are valid application/local domains. They stay explicit and replaceable rather than being mislabeled as reusable simulation domains.

## Forward Abstraction

The current artifact advances one stage per cycle. Extraction records atomic responsibilities and consumers; consolidation assigns one natural owner; promotion raises exactly one reusable layer; migration proves parity; purge removes only superseded ownership with complete successor proof.

## Validation

Every stage preserves the playable route, deterministic replay where available, visible failure/recovery and completion, default-closed diagnostics, console cleanliness, and the existing performance budget.
