import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const route = join(root, "experiments", "the-open-above");
const html = readFileSync(join(route, "index.html"), "utf8");
const layer = readFileSync(join(route, "open-above-visual-layer.js"), "utf8");
const kits = readFileSync(join(route, "open-above-visual-domain-kits.js"), "utf8");
const flightRouteEntry = readFileSync(join(route, "open-above-flight-route-readability-entry.js"), "utf8");

assert.match(html, /src="\.\/open-above\.js(?:\?v=[^"]+)?"/);
assert.match(html, /src="\.\/open-above-visual-layer\.js(?:\?v=[^"]+)?"/);
assert.match(html, /src="\.\/open-above-flight-route-readability-entry\.js(?:\?v=[^"]+)?"/);
assert.match(layer, /createOpenAboveVisualFractalDomainKit/);
assert.match(layer, /host\.getVisualDomains/);
assert.match(layer, /host\.getVisualKitTree/);
assert.match(layer, /open-above-visual-fractal-overlay/);
assert.match(flightRouteEntry, /getFlightRouteReadability/);
assert.match(flightRouteEntry, /rendererConsumes = "descriptors-only"/);
assert.match(kits, /domain:\s*"sky\.cloud\.strata"/);
assert.match(kits, /domain:\s*"terrain\.horizon\.ridgeline"/);
assert.match(kits, /domain:\s*"flight\.feedback\.speed-ribbon"/);
assert.match(kits, /domain:\s*"air\.current\.thermal-column"/);
assert.match(kits, /domain:\s*"actor\.wingtip\.contrail"/);
assert.match(kits, /domain:\s*"flight\.mood\.readability"/);
assert.doesNotMatch(layer, /new THREE|WebGLRenderer|CanvasRenderingContext2D/);
assert.doesNotMatch(kits, /document\.|window\.|new THREE|WebGLRenderer|CanvasRenderingContext2D/);
console.log("The Open Above visual static smoke passed.");
