# Extraction, Export, Migration, and Purge Contracts

## Extraction Record

Every observed responsibility records:

- semantic responsibility and invariant
- source artifact and exact owner
- current layer and proposed next layer
- Core/domain search evidence
- disposition: `Core-reused`, `domain-reused`, `newly accepted`, `merged duplicate`, `specialization`, `adapter-only`, `local-only`, or `rejected`
- at least two plausible consumers before reusable acceptance
- dependencies, reset/snapshot/events/outputs when deterministic behavior is involved
- player-visible and headless proof

Extraction discovers candidates; it does not authorize promotion.

## Export Bundle

Each stage export contains:

- stable artifact id, schema, version, source, current layer, and target layer
- declarative configuration or canonical API surface
- Core and engine-domain dependencies with pinned proof baselines
- child-to-owner mapping and concepts hidden from consumers
- current consumers and required migrations
- capability dispositions, rejected alternatives, and unresolved gaps
- quality/performance budgets and validation evidence
- exact next stage and its entry gate

Exports must be importable or machine-readable. A prose-only summary is not a stage artifact.

## Migration and Parity Gate

Before replacing an owner:

1. Inventory every behavior, state, event, descriptor, adapter, scene, tuning value, and consumer.
2. Name one canonical successor for each reusable responsibility and one explicit local owner for application-only responsibilities.
3. Migrate consumers without parallel state or compatibility paths that duplicate ownership.
4. Prove deterministic state parity where applicable and complete the player loop through failure/recovery and completion.
5. Compare diagnostics-closed presentation, console output, DOM/entity/descriptor counts, memory signals when available, and the primary runtime metric.
6. Reject the migration on missing capability, unbounded growth, duplicate visible ownership, or a runtime regression above the repository budget.

## Purge Gate

Purge means removing proven duplicate or superseded ownership, never deleting evidence first. A source becomes eligible only when all are true:

- complete feature inventory exists
- every feature has a validated successor or an explicit retained local owner
- all known consumers are migrated
- imports, routes, manifests, docs, tests, generated data, and public references are cleaned
- deterministic, playable, console, and performance parity pass
- preserved evidence and retirement-ledger entry identify the successor and recovery path

If any gate fails, retain the source, mark the exact blocker, and make the smallest next migration the next stage.
