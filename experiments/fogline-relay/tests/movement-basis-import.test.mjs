import assert from "node:assert/strict";
import { forwardFromYaw, rightFromYaw } from "../src/math.js";

function moveDelta(yaw, moveX, moveZ) {
  const forward = forwardFromYaw(yaw);
  const right = rightFromYaw(yaw);
  return {
    x: right.x * moveX + forward.x * moveZ,
    z: right.z * moveX + forward.z * moveZ
  };
}

function threeScreenRightFromForward(forward) {
  const zBack = { x: -forward.x, z: -forward.z };
  return { x: zBack.z, z: -zBack.x };
}

function dot(a, b) {
  return a.x * b.x + a.z * b.z;
}

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${label}: expected ${expected}, got ${actual}`);
}

{
  const forward = forwardFromYaw(0);
  const right = rightFromYaw(0);
  const screenRight = threeScreenRightFromForward(forward);
  const w = moveDelta(0, 0, 1);
  const d = moveDelta(0, 1, 0);
  near(forward.x, 0, "yaw 0 forward x");
  near(forward.z, -1, "yaw 0 forward z");
  near(right.x, 1, "yaw 0 right x");
  near(right.z, 0, "yaw 0 right z");
  near(w.x, 0, "yaw 0 W x");
  near(w.z, -1, "yaw 0 W z");
  near(d.x, 1, "yaw 0 D x");
  near(d.z, 0, "yaw 0 D z");
  assert.ok(dot(d, screenRight) > 0.999, "yaw 0 D must move toward actual Three screen-right");
}

{
  const yaw = Math.PI / 2;
  const w = moveDelta(yaw, 0, 1);
  const d = moveDelta(yaw, 1, 0);
  const screenRight = threeScreenRightFromForward(forwardFromYaw(yaw));
  near(w.x, 1, "yaw +90 W x");
  near(w.z, 0, "yaw +90 W z");
  near(d.x, 0, "yaw +90 D x");
  near(d.z, 1, "yaw +90 D z");
  assert.ok(dot(d, screenRight) > 0.999, "yaw +90 D must move toward actual Three screen-right");
}

console.log("Fogline Relay math module matches Three/Minecraft FPS basis.");
