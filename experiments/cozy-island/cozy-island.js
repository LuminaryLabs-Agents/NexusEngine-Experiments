const hud = document.querySelector("#hud");
const src = "https://cdn.jsdelivr.net/npm/" + "three@0.160.0/build/three.module.js";
const THREE = await import(src);
hud.innerHTML = "<strong>Cozy Island</strong><br>Loaded Three.js " + (THREE.REVISION || "module");
