import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const diceFix = readFileSync("experiments/The Cavalry of Rome/src/hex-dice-visual-fix-pass.js", "utf8");
const live = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experiment = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");

assert.ok(diceFix.includes("landed-3d-dice-visual-fix"), "dice visual fix should identify itself");
assert.ok(diceFix.includes("landAt: 1600"), "dice should roll briefly before landing");
assert.ok(diceFix.includes("holdFor: 3000"), "dice should hold still for 3 seconds after landing");
assert.ok(diceFix.includes("fadeFor: 900"), "dice should fade after the hold");
assert.ok(diceFix.includes("const landed = rollT >= 1"), "dice should have an explicit landed state");
assert.ok(diceFix.includes("const rotation = landed ? 0"), "dice should stop rotating after landing");
assert.ok(diceFix.includes("const shownFace = landed ? face"), "dice should lock final face after landing");
assert.ok(diceFix.includes("drawDieBody"), "dice should render a 3D body");
assert.ok(diceFix.includes("drawContactShadow"), "dice should have object contact shadow");
assert.ok(diceFix.includes("data-spent"), "Roll AP card should receive spent styling");
assert.ok(diceFix.includes("#cavalry-dice-visual-fix-canvas"), "dice visual fix should own a top overlay canvas");
assert.ok(live.includes("hex-dice-visual-fix-pass.js?v=dice-object-001"), "live endpoint should load cache-busted dice visual fix");
assert.ok(experiment.includes("hex-dice-visual-fix-pass.js?v=dice-object-001"), "experiment entry should load cache-busted dice visual fix");

console.log("Cavalry dice visual fix static smoke passed.");
