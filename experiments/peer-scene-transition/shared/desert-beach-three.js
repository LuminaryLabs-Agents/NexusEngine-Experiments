import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const root = document.querySelector("#three-root");
const fade = document.querySelector("#fade");
const debug = document.querySelector("#debug");
const hud = document.querySelector("#hud");
const stateKey = "nexus.waterUnderSand.campaign.v1";
const clock = new THREE.Clock();
const keys = new Set();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

const SCENES = [
  ["dune-wake","Dune Wake","Player wakes in endless dunes, wind pushes sand over old road signs.","Walk to the lone black marker.","You do not remember entering the desert. But the road remembers you.","desert",0xcfa45e,0x7b552b,0xf5d28b],
  ["blue-water","Blue Water Spot","Impossible water reflects stars in daylight.","Reach the water and hold still until it stabilizes.","The water remembers a shore. The sand becomes foam for one breath.","oasis",0xd2ac63,0x216f88,0x9befff],
  ["massive-beach","Massive Beach","Surf rolls across a beach too wide to end.","Follow the foam beacons to the half-buried shell gate.","The desert was not always dry. The tide still knows your feet.","beach",0xd8bd84,0x2b80ac,0xf5e6be],
  ["shell-gate","Shell Gate","Shells vibrate in the sand like small bells.","Turn three shell stones toward the sea sound.","You hear a voice beneath the tide. It speaks in spiral shapes.","shell",0xcfb780,0x986b43,0xffe0a3],
  ["tide-cave","Tide Cave Mouth","A blue cave opens under the beach cliff.","Carry the light orb to the cave pool.","The cave does not go down. It goes back.","cave",0x2b334a,0x0d8fac,0x8cf7ff],
  ["memory-pool","Memory Pool","Reflections show desert, beach, and city flickering together.","Step on reflected stones in sequence.","Someone built a city here before the sea left.","pool",0x294b5a,0x12151f,0x7bd7ff],
  ["salt-street","Salt Street","A white salt-flat street appears with buried doors.","Match three door symbols to their echoes.","The city was not destroyed. It was forgotten.","salt",0xded9c7,0x7d796d,0xffffff],
  ["empty-market","Market of Empty Stalls","Cloth awnings move although there is no wind.","Place three lost objects on matching stalls.","Names return when objects return.","market",0x9a7550,0x3b2b24,0xe0b66d],
  ["well-house","The Well House","A dry well opens with light rising upward.","Lower the bucket, catch light, pull it back up.","The well remembers rain.","well",0x8b765e,0x26212a,0xf4d58a],
  ["rain-room","Rain Room","Rain falls only in one square under an open sky.","Move mirrors to spread rain to three basins.","Water obeys memory here.","rain",0x5f6f79,0x253a4b,0xaee9ff],
  ["glass-dunes","Glass Dunes","The sand turns translucent underfoot.","Walk only along lit glass ridges.","The desert is becoming thin.","glass",0xbfd0d4,0x5e7f8a,0xf6ffff],
  ["buried-lighthouse","Buried Lighthouse","A lighthouse lens rises from the sand like a fossil.","Align three sun plates to power the lens.","A lighthouse should face water. This one faces you.","lighthouse",0xd7b36c,0x6f5b3d,0xffdf7c],
  ["horizon-beam","Horizon Beam","The lighthouse cuts a line across the sky.","Follow the beam and break mirage loops.","The island is a choice.","beam",0xcaa05b,0x412f22,0xfff1a8],
  ["island-without-sea","Island Without Sea","An island sits in sand, boats buried around it.","Raise three masts toward the missing tide.","The boats waited longer than the people.","island",0xb88b58,0x2f6f71,0xc9f5ff],
  ["first-boat","The First Boat","One boat lifts as water forms beneath it.","Patch the hull with glowing boards.","You can leave, but the world cannot.","boat",0x8f6747,0x184d62,0xf4c17a],
  ["black-water","Black Water Crossing","Silent black water spreads beneath a starless sky.","Steer by sound-light pulses to the white shore.","The last memory is not yours.","blackwater",0x0c0d12,0x020409,0xeeeeff],
  ["sea-door","The Sea Door","A huge door stands between desert and ocean.","Choose the route symbols: water, shell, light, name.","The door asks what the world should become.","door",0x40382f,0x102a3d,0xffd98a],
  ["returned-shore","The Returned Shore","Dunes become waves and waves become dunes.","Choose the ending: sea, desert, or both.","The world returns as something wider than memory.","ending",0xd4b16f,0x2c86aa,0xffffff]
].map(([id,title,clip,goal,story,biome,c1,c2,c3], index) => ({ id,title,clip,goal,story,biome,c1,c2,c3,index }));

let sceneIndex = Number(new URLSearchParams(location.search).get("s") ?? sessionStorage.getItem(stateKey) ?? 0);
sceneIndex = Math.max(0, Math.min(SCENES.length - 1, sceneIndex));
let activeScene = SCENES[sceneIndex];
let introTime = 8;
let solved = false;
let transitioning = false;
let interactables = [];
let worldGroup = new THREE.Group();
let player = { pos: new THREE.Vector3(-70, 8, 95), yaw: 0, pitch: -0.08, speed: 28 };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.append(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffedcc, 0x283044, 1.25);
const sun = new THREE.DirectionalLight(0xffdfa0, 3.2);
sun.position.set(-90, 140, 70);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(hemi, sun, worldGroup);

const vertex = `varying vec3 vWorld;varying vec3 vNormal;void main(){vec4 w=modelMatrix*vec4(position,1.0);vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment = `precision highp float;uniform vec3 colorA;uniform vec3 colorB;uniform vec3 colorC;uniform float scale;uniform float time;uniform vec3 sunDir;varying vec3 vWorld;varying vec3 vNormal;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i);float b=hash(i+vec2(1.,0.));float c=hash(i+vec2(0.,1.));float d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}void main(){vec3 n=normalize(vNormal);vec3 b=abs(n);b/=b.x+b.y+b.z;vec3 p=vWorld*scale;float x=fbm(p.yz+time*.015);float y=fbm(p.xz-time*.01);float z=fbm(p.xy+time*.012);float tex=x*b.x+y*b.y+z*b.z;vec3 albedo=mix(colorA,colorB,tex);albedo=mix(albedo,colorC,smoothstep(.62,1.,tex)*.38);float light=max(dot(n,normalize(sunDir)),0.)*.82+.28;float rim=pow(1.-max(dot(n,vec3(0.,1.,0.)),0.),2.)*.12;gl_FragColor=vec4(albedo*(light+rim),1.);}`;
function triMat(a,b,c,scale=.018){return new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{colorA:{value:new THREE.Color(a)},colorB:{value:new THREE.Color(b)},colorC:{value:new THREE.Color(c)},scale:{value:scale},time:{value:0},sunDir:{value:new THREE.Vector3(-.45,.75,.32).normalize()}}});}
function waterMat(color=0x2d91c3){return new THREE.MeshPhysicalMaterial({color,roughness:.18,metalness:0,transmission:.15,transparent:true,opacity:.78,clearcoat:1,clearcoatRoughness:.08});}
function height(x,z){const i=activeScene.index+1;return Math.sin(x*.018+i)*4+Math.cos(z*.016-i)*3+Math.sin((x+z)*.009+i*.3)*6+(activeScene.biome==="beach"||activeScene.biome==="blackwater"?Math.max(0,z-40)*.018:0);}
function clearWorld(){worldGroup.clear();interactables=[];}
function addTerrain(){const size=activeScene.biome==="blackwater"?1900:1600;const geo=new THREE.PlaneGeometry(size,size,220,220);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,height(x,z));}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,triMat(activeScene.c1,activeScene.c2,activeScene.c3,.021));mesh.receiveShadow=true;worldGroup.add(mesh);}
function addMarker(pos,order,label){const base=new THREE.Mesh(new THREE.CylinderGeometry(3.8,5.2,1.4,24),triMat(activeScene.c2,activeScene.c1,activeScene.c3,.07));base.position.set(pos.x,height(pos.x,pos.z)+.8,pos.z);base.castShadow=true;worldGroup.add(base);const glyph=new THREE.Mesh(new THREE.OctahedronGeometry(3.4,2),triMat(activeScene.c3,0xffffff,activeScene.c2,.12));glyph.position.set(pos.x,height(pos.x,pos.z)+6,pos.z);glyph.castShadow=true;glyph.userData={order,label,activated:false};worldGroup.add(glyph);interactables.push(glyph);}
function addObjectField(){for(let i=0;i<90;i++){const x=Math.sin(i*12.989+activeScene.index)*620;const z=Math.cos(i*7.41-activeScene.index)*590;const kind=activeScene.biome;let mesh;if(kind==="beach"||kind==="island"){mesh=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.4,12+Math.sin(i)*5,8),triMat(0x7f5531,0x4d321d,0xb47a3b,.09));mesh.position.set(x,height(x,z)+6,z);mesh.rotation.z=Math.sin(i)*.25;}else if(kind==="cave"||kind==="pool"||kind==="blackwater"){mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(2.5+(i%5),1),triMat(activeScene.c2,activeScene.c1,activeScene.c3,.08));mesh.position.set(x,height(x,z)+3,z);}else{mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(2+(i%4),0),triMat(activeScene.c2,activeScene.c1,activeScene.c3,.095));mesh.position.set(x,height(x,z)+2,z);mesh.rotation.set(i,i*.3,i*.7);}mesh.castShadow=true;worldGroup.add(mesh);}if(activeScene.biome==="beach"||activeScene.biome==="island"||activeScene.biome==="boat"){const ocean=new THREE.Mesh(new THREE.PlaneGeometry(2000,900,32,32),waterMat(0x2479a7));ocean.rotation.x=-Math.PI/2;ocean.position.set(0,-.35,-260);worldGroup.add(ocean);}if(activeScene.biome==="oasis"||activeScene.biome==="pool"||activeScene.biome==="rain"){const pool=new THREE.Mesh(new THREE.CircleGeometry(42,96),waterMat(0x2aa7c9));pool.rotation.x=-Math.PI/2;pool.position.set(0,height(0,0)+.15,0);worldGroup.add(pool);}}
function buildScene(){clearWorld();activeScene=SCENES[sceneIndex];sessionStorage.setItem(stateKey,String(sceneIndex));scene.background=new THREE.Color(activeScene.biome==="blackwater"?0x02030a:activeScene.biome==="beach"?0x9fd8ff:activeScene.biome==="cave"?0x111827:0xf0c77f);scene.fog=new THREE.FogExp2(scene.background.getHex(),activeScene.biome==="blackwater"?.0025:.0045);hemi.intensity=activeScene.biome==="cave"?0.65:1.35;sun.intensity=activeScene.biome==="blackwater"?0.7:3.1;addTerrain();addObjectField();const goals=[new THREE.Vector3(-34,0,8),new THREE.Vector3(22,0,-36),new THREE.Vector3(68,0,-88)];goals.forEach((p,i)=>addMarker(p,i,["first","second","third"][i]));player.pos.set(-86,height(-86,92)+3.2,92);player.yaw=0;player.pitch=-.08;introTime=8;solved=false;transitioning=false;fade.classList.add("black");setTimeout(()=>fade.classList.remove("black"),80);}
function updatePlayer(dt){if(introTime>0||document.querySelector(".story.open"))return;const f=new THREE.Vector3(Math.sin(player.yaw),0,Math.cos(player.yaw));const r=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));const m=new THREE.Vector3();if(keys.has("KeyW"))m.add(f);if(keys.has("KeyS"))m.sub(f);if(keys.has("KeyD"))m.add(r);if(keys.has("KeyA"))m.sub(r);if(m.lengthSq()>0)m.normalize().multiplyScalar(player.speed*dt);player.pos.add(m);player.pos.y=height(player.pos.x,player.pos.z)+3.2;}
function updateCamera(){if(introTime>0){const t=1-introTime/8;const a=t*Math.PI*.55+activeScene.index*.2;camera.position.set(Math.sin(a)*120,58-32*t,Math.cos(a)*120);camera.lookAt(0,6,0);return;}camera.position.copy(player.pos);camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;}
function tryInteract(){if(introTime>0||solved)return;let best=null,dist=999;for(const o of interactables.filter(o=>!o.userData.activated)){const d=o.position.distanceTo(player.pos);if(d<dist){best=o;dist=d;}}if(best&&dist<12){const next=interactables.filter(o=>!o.userData.activated).sort((a,b)=>a.userData.order-b.userData.order)[0];if(best!==next){pulseHud(`Wrong order. Find the ${next.userData.label} glyph.`);return;}best.userData.activated=true;best.material.uniforms.colorA.value.set(0x80ffb0);pulseHud(`${best.userData.label} glyph restored.`);if(interactables.every(o=>o.userData.activated)){solved=true;setTimeout(showStory,700);}}else pulseHud("Move closer to a glowing glyph, then press E.");}
function showStory(){const overlay=document.createElement("div");overlay.className="story open";overlay.innerHTML=`<article class="story-card"><h2>${activeScene.title}</h2><p>${activeScene.story}</p><p class="complete">Goal complete: ${activeScene.goal}</p><button>Continue</button></article>`;document.body.append(overlay);overlay.querySelector("button").onclick=()=>{fade.classList.add("black");setTimeout(()=>{overlay.remove();sceneIndex=Math.min(sceneIndex+1,SCENES.length-1);buildScene();},1050);};}
function pulseHud(msg){const p=hud.querySelector(".objective");p.textContent=msg;p.classList.add("complete");setTimeout(()=>p.classList.remove("complete"),600);}
function drawHud(){hud.querySelector("h1").textContent=activeScene.title;hud.querySelector("p").textContent=activeScene.clip;hud.querySelector(".hint").textContent=introTime>0?`8-second intro clip: ${introTime.toFixed(1)}s until control unlocks.`:"Click to capture mouse. WASD to walk. Press E near glowing glyphs.";hud.querySelector(".pill").textContent=`Scene ${sceneIndex+1}/18 · ${activeScene.biome} · triplanar shader`;if(!hud.querySelector(".objective")){const o=document.createElement("p");o.className="objective";hud.append(o);}hud.querySelector(".objective").textContent=solved?"Scene solved. Continue through story card.":activeScene.goal;}
function drawDebug(){debug.textContent=JSON.stringify({campaign:"The Water Under the Sand",scene:activeScene.id,sceneIndex:sceneIndex+1,totalScenes:SCENES.length,position:{x:player.pos.x.toFixed(1),y:player.pos.y.toFixed(1),z:player.pos.z.toFixed(1)},introLocked:introTime>0,goal:activeScene.goal,activatedGlyphs:interactables.filter(o=>o.userData.activated).length,shader:"procedural triplanar high-detail shader on terrain and scene objects"},null,2);}
function animate(){const dt=Math.min(clock.getDelta(),.04);introTime=Math.max(0,introTime-dt);updatePlayer(dt);updateCamera();for(const obj of interactables){obj.rotation.y+=dt*.7;obj.position.y=height(obj.position.x,obj.position.z)+6+Math.sin(clock.elapsedTime*2+obj.userData.order)*.4;}worldGroup.traverse(o=>{if(o.material?.uniforms?.time)o.material.uniforms.time.value=clock.elapsedTime;});drawHud();drawDebug();renderer.render(scene,camera);requestAnimationFrame(animate);}

addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="KeyE")tryInteract();if(e.code==="KeyR"){sceneIndex=0;buildScene();}});
addEventListener("keyup",e=>keys.delete(e.code));
addEventListener("click",()=>renderer.domElement.requestPointerLock?.());
addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement&&introTime<=0){player.yaw-=e.movementX*.0022;player.pitch=Math.max(-1.15,Math.min(1.1,player.pitch-e.movementY*.0022));}});
buildScene();animate();
