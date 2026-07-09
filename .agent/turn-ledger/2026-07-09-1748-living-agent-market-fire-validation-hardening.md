# 2026-07-09 17:48 ET — Living Agent market fire validation hardening

## Scope

Follow-up validation and final cleanup for the completed `experiments/living-agent-lab/market-fire-evacuation.html` upgrade.

## CDN validation change

Updated `tests/living-agent-market-fire-evacuation-cdn-state-input-smoke.mjs` so a network-enabled run now:

1. fetches `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`,
2. verifies that the response contains ES module exports,
3. writes the retrieved source to a temporary local `nexus-engine-main.mjs`,
4. runs `node --check` against that local module,
5. removes the temporary directory.

This is more accurate than attempting to import a lone copied entry module whose relative dependencies are not present beside it.

The existing source audit and 10 simulated state/input cases remain unchanged.

## Gallery cleanup

The gallery data now contains 17 active route entries. Corrected the stale gallery hint from 16 to 17 so the user-facing inventory count matches the route array.

## Commits

- `8735981c69591630e5fcbcf841ce9c5c0a230352` — Harden Living Agent CDN local module validation
- `a42bc662eb8a2145a3e68931300df61ff0e61d9a` — Correct gallery route count after Living Agent upgrade

## Validation limitation

The current shell runtime cannot resolve external hosts, including `github.com`, so the network-backed CDN path could not be exercised in this run. The test remains deterministic in offline mode and reports `source-wiring-only`; a network-enabled run will report `downloaded-to-local-mjs-and-syntax-checked`.

## Repository policy

- Repository changed: `LuminaryLabs-Agents/NexusEngine-Experiments`
- Branch changed: `main`
- No branch created.
- No other repository changed.
