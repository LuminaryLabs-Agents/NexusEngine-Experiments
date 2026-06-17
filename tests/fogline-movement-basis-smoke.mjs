import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { forwardFromYaw, rightFromYaw } from "../experiments/fogline-relay/src/math.js";

const kit = readFileSync("experiments/fogline-relay/src/fogline-relay-kit.js", "utf8");
const renderer = readFileSync("experiments/fogline-relay/src/three-renderer.js", "utf8");

function moveDelta(yaw, moveX, moveZ) {
  const forward = forwardFromYaw(yaw);
  const right = rightFromYaw(yaw);
  return {
    x: right.x * moveX + forward.x * moveZ,
    z: right.z * moveX + forward.z * moveZ
  };
}

const north = moveDelta(0, 0, 1);
assert.ok(north.z < -0.99 && Math.abs(north.x) < 0.001, "W should move along camera forward at yaw 0");
const east = moveDelta(Math.PI / 2, 0, 1);
assert.ok(east.x > 0.99 && Math.abs(east.z) < 0.001, "W should move along camera forward when looking right/east");
const west = moveDelta(-Math.PI / 2, 0, 1);
assert.ok(west.x < -0.99 && Math.abs(west.z) < 0.001, "W should move along camera forward when looking left/west");
const rightAtEast = moveDelta(Math.PI / 2, 1, 0);
assert.ok(rightAtEast.z > 0.99 && Math.abs(rightAtEast.x) < 0.001, "D should strafe camera-right when looking east");

assert.ok(kit.includes("right.x * move.x + forward.x * move.z"), "movement should compose strafe and forward basis on X");
assert.ok(kit.includes("right.z * move.x + forward.z * move.z"), "movement should compose strafe and forward basis on Z");
assert.ok(renderer.includes("forwardFromYaw(player.yaw)"), "camera should use the same yaw basis as movement");
assert.ok(renderer.includes("player.pitch"), "camera pitch should not replace horizontal yaw movement basis");

console.log("Fogline movement basis smoke passed.");
