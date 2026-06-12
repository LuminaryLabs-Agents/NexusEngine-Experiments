const $ = (id) => document.querySelector(id);
const canvas = $("#orchard-canvas");
const ids = ["round", "score", "apples", "weapon", "health", "stamina", "pressure"];
const hud = Object.fromEntries(ids.map((id) => [id, $(`#${id}`)]));
