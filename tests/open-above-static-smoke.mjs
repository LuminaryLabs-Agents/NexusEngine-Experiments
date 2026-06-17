import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const openAboveRoot = join(root, "experiments", "the-open-above");
const html = readFileSync(join(openAboveRoot, "index.html"), "utf8");
const config = readFileSync(join(openAboveRoot, "open-above.config.js"), "utf8");
const script = readFileSync(join(openAboveRoot, "open-above.js"), "utf8");
const combined = `${html}\n${config}\n${script}`;

assert.match(html, /src="\.\/open-above\.js"/, "The Open Above shell should load the app-owned module.");
assert.match(script, /window\.GameHost/, "The Open Above should expose GameHost for private simulator control.");
assert.match(script, /createFlightMotionKit/, "The Open Above should compose generic flight motion directly.");
assert.match(script, /createTerrainSamplerKit/, "The Open Above should compose generic terrain sampling directly.");
assert.match(script, /createWorldPatchKit/, "The Open Above should compose generic world patch streaming directly.");
assert.doesNotMatch(combined, /__NEXUS_SIMTIME__/, "The Open Above should not expose public SimTime globals.");
assert.doesNotMatch(combined, /createGenericAerialAdventureKits/, "The Open Above should not use the legacy aerial adventure preset stack.");
assert.doesNotMatch(combined, /createOpenAboveFlightKits|createOpenAboveFlightGame|OpenAboveFlightData/, "The Open Above should not import a branded ProtoKits preset.");
assert.doesNotMatch(combined, /checkpoint|updraft|ring-volume|rings|ring challenge/i, "The Open Above should not include ring/checkpoint/updraft gameplay.");

console.log("The Open Above static smoke passed.");
