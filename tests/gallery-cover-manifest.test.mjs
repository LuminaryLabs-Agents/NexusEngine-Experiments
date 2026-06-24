import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../experiments/_shared/generated-cover-manifest.json", import.meta.url), "utf8"));

assert.equal(typeof manifest, "object");
assert.equal(manifest._meta.defaultCaptureTick, 90);
assert.deepEqual(manifest._meta.viewport, [1280, 720]);
assert.equal(manifest._meta.format, "webp");
assert.equal(manifest._meta.quality, 82);
assert.ok(Array.isArray(manifest._meta.fallbackPolicy));
assert.ok(manifest._meta.fallbackPolicy.includes("quiet procedural placeholder"));
