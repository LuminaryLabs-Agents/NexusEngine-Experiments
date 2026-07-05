# Nexus Engine Rename Pass

Date: 2026-07-05

## Goal

Prepare NexusRealtime-Experiments for the engine repo rename:

```txt
LuminaryLabs-Dev/NexusRealtime -> LuminaryLabs-Dev/NexusEngine
```

## Completed

- Updated `package.json` public package metadata to `@luminarylabs/nexusengine-experiments`.
- Updated `package.json` `nexusrealtime` dependency alias to pull from `github:LuminaryLabs-Dev/NexusEngine#main`.
- Kept the dependency alias as `nexusrealtime` so existing route imports do not break.
- Updated root `index.html` to use Nexus Engine gallery copy.
- Updated root `README.md` to use Nexus Engine public naming.
- Updated `experiments/_shared/nexus-gallery-data.js` subtitle to `Nexus Engine playable routes`.
- Updated `scripts/generate-gallery-data.mjs` so generated gallery/index copy uses Nexus Engine naming.
- Added `docs/NEXUS_ENGINE_RENAME_MIGRATION.md` with active route and first-20 arcade route migration checklist.

## Not changed yet

- Did not rename the repo `LuminaryLabs-Agents/NexusRealtime-Experiments`.
- Did not rename the npm import alias from `nexusrealtime`.
- Did not rename API symbols such as `NexusRealtime` or `createRealtimeGame`.
- Did not run `npm install`, `npm run generate`, or `npm run check` from this connector pass.

## Next validation

Run locally or in CI:

```bash
npm install
npm run generate
npm run check
npm run check:deploy
```

Then smoke the active gallery routes and the first 20 arcade routes listed in `docs/NEXUS_ENGINE_RENAME_MIGRATION.md`.
