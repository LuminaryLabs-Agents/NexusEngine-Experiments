# Twenty Game Refiner — Next Ledge route/cargo cutover guard

## Summary

Aligned the manifest-owned `next-ledge` route with the concrete reusable route/cargo ProtoKits now available in `LuminaryLabs-Agents/NexusRealtime-ProtoKits`, without claiming a second executable route-domain replay lane.

## What changed

- `experiments/domain-kit-cutover-manifest.json` now points `next-ledge` at `generic-route-progress-kit`, `generic-route-cargo-extraction-kit`, `generic-resource-loop-kit`, and `generic-pressure-loop-kit` instead of the stale route-checkpoint/resource-pressure placeholder set.
- `tests/next-ledge-route-cargo-cutover-smoke.mjs` now guards the planned-vs-executable boundary for `next-ledge`:
  - the cutover manifest must name the concrete route/cargo ProtoKits;
  - stale `route-checkpoint-kit` and `cargo-delivery-kit` placeholders must not re-enter this route's manifest entry;
  - replay metadata must remain `planned-fixture` while the route source has not imported `generic-route-progress-kit` or `generic-route-cargo-extraction-kit`;
  - missing executable replay and local JavaScript reduction notes must stay explicit;
  - the route session source must remain browser/renderer-free.
- `scripts/run-checks.mjs` runs the new smoke in both full and deploy suites immediately after the canonical route replay manifest smoke.

## Agent memory interpretation

The long-form intent is still to grow reusable DSK-based ProtoKits while shrinking local experiment JavaScript. The Twenty Game Refiner lens says not to preserve weak games for their own sake; routes should stay canonical only when they pressure reusable DSK boundaries, composites, or deterministic replay.

## Repository state vs `.agent`

The repository now better matches `.agent` memory for the traversal/cargo lane. Prior memory said `next-ledge` should become the first consumer candidate for the new route-progress and route-cargo-extraction ProtoKits, while local JavaScript shrink should not be claimed until the route actually consumes those boundaries. This patch makes the manifest and smoke coverage encode exactly that state.

## DSK boundary effect

This clarifies that `next-ledge` is a delivery/extraction pressure route above:

- `engine.n.genericRouteProgress`
- `engine.n.genericRouteCargoExtraction`
- `engine.n.genericResourceLoop`
- `engine.n.genericPressureLoop`

The route remains a host/presentation candidate, not a reusable implementation sink.

## Local JavaScript shrink

No local JavaScript shrink is claimed in this cycle. The new smoke intentionally prevents that claim until `experiments/next-ledge/src/session.js` or its replacement consumes the route/cargo ProtoKits and drops route-local checkpoint/cargo bookkeeping.

## Safest next patch

Migrate one small `next-ledge` checkpoint/progress seam to `generic-route-progress-kit` first. Do not include cargo, tether physics, Three.js renderer, browser input, camera, or asset loading in that patch. The first executable target should be a browserless fixed-tick route-progress replay fixture, still marked as traversal/cargo planned until the canonical route consumes the boundary.
