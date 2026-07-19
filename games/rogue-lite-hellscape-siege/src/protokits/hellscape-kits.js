const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);

export const config={
  realms:{
    lobby:{ground:'#120404',line:'#ef4444',glow:'#ff3300',mist:'#220909'},
    grove:{ground:'#052312',line:'#10b981',glow:'#10b981',mist:'#092416'},
    crystal:{ground:'#120b24',line:'#a855f7',glow:'#a855f7',mist:'#17102c'},
    ashes:{ground:'#1e0f0a',line:'#f97316',glow:'#f97316',mist:'#2a1208'}
  },
  portals:[
    {x:-350,y:-150,id:'grove',label:'GROVE',color:'#10b981'},
    {x:0,y:-320,id:'crystal',label:'CRYSTAL',color:'#a855f7'},
    {x:350,y:-150,id:'ashes',label:'ASHES',color:'#f97316'}
  ],
  resources:{
    grove:[['oak','wood','#22543d',90,32],['berry','berry','#ef4444',35,20],['spore','spore','#38bdf8',42,18]],
    crystal:[['geode','crystal','#a855f7',95,28],['pillar','energy','#e9d5ff',74,24]],
    ashes:[['spire','obsidian','#4b5563',96,30],['ember','ember','#f97316',44,20],['sulfur','sulfur','#facc15',36,18]]
  },
  builds:[
    {id:'wall',name:'SPIKE WALL',cost:{wood:5,obsidian:3},hp:180,range:0,color:'#94a3b8'},
    {id:'turret',name:'SENTRY',cost:{crystal:5,energy:3},hp:100,range:310,color:'#38bdf8'},
    {id:'pylon',name:'REGEN',cost:{spore:6,sulfur:3,energy:2},hp:100,range:160,color:'#10b981'}
  ],
  firstSiege:{
    starterStock:{wood:5,obsidian:3},
    strike:{range:132,damage:48,cooldown:.32,color:'#67e8f9'},
    firstWave:{crawlers:5,brutes:1,spawnCadence:1.25},
    postClearFortification:{
      id:'emberplate-wall',
      name:'EMBERPLATE WALL',
      cost:{wood:5,obsidian:3},
      maxHpBonus:120,
      damageScale:.65,
      guardPercent:35,
      color:'#f59e0b'
    },
    postFortificationSentry:{
      id:'crystal-sentry-choice',
      buildId:'turret',
      name:'CRYSTAL SENTRY',
      routeRealmId:'crystal',
      unlockAfterClears:2,
      placementOffset:{x:145,y:40}
    }
  }
};

function burst(w,x,y,color,count=10){w.emit('fx.burst',{x,y,color,count});}

export function createInputKit(){return{init(w){w.set('input',{move:{x:0,y:0},primary:false,interact:false,build:false,confirm:false,cycle:0,select:null});},install(e,w){e.input={set:s=>w.set('input',{...w.get('input'),...s}),getState:()=>w.get('input')};}};}

export function createAvatarKit(){return{init(w){w.set('player',{x:0,y:180,hp:100,maxHp:100,speed:250,swing:0,hurt:0});w.set('camera',{x:0,y:180,shake:0});},systems:[w=>{const p=w.get('player'),m=w.get('input').move,dt=w.clock.delta;p.x=clamp(p.x+m.x*p.speed*dt,-940,940);p.y=clamp(p.y+m.y*p.speed*dt,-940,940);p.swing+=(m.x||m.y?13:4)*dt;p.hurt=Math.max(0,(p.hurt??0)-dt*2.8);const cam=w.get('camera');cam.x+=(p.x-cam.x)*0.1;cam.y+=(p.y-cam.y)*0.1;} ]};}

export function createFxKit(){return{init(w){w.set('fx',{particles:[],beams:[],flashes:[]});},systems:[w=>{const fx=w.get('fx'),cam=w.get('camera'),dt=w.clock.delta;for(const ev of w.allEvents()){if(ev.type==='fx.burst'){for(let i=0;i<(ev.count??8);i++){const a=Math.random()*TAU,s=rand(40,260);fx.particles.push({x:ev.x,y:ev.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.25,.8),max:.8,color:ev.color??'#fff',size:rand(2,5)});}}if(ev.type==='fx.beam')fx.beams.push({...ev,life:.12});if(ev.type==='fx.flash')fx.flashes.push({...ev,life:ev.life??.24,max:ev.life??.24});if(ev.type==='fx.shake')cam.shake=Math.max(cam.shake,ev.amount);}for(const p of [...fx.particles]){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;if(p.life<=0)fx.particles.splice(fx.particles.indexOf(p),1);}for(const b of [...fx.beams]){b.life-=dt;if(b.life<=0)fx.beams.splice(fx.beams.indexOf(b),1);}for(const f of [...fx.flashes]){f.life-=dt;if(f.life<=0)fx.flashes.splice(fx.flashes.indexOf(f),1);}cam.shake*=.88;} ]};}

export function createInventoryKit(){
  const empty={wood:0,berry:0,spore:0,crystal:0,energy:0,obsidian:0,ember:0,sulfur:0};
  const starter=Object.freeze({...config.firstSiege.starterStock});
  const resetItems=()=>({...empty,...starter});
  return{
    init(w){w.set('inventory',{items:resetItems(),last:'starter wall stocked',failed:false});},
    install(e,w){e.inventory={
      add:(id,n=1)=>{const inv=w.get('inventory');inv.items[id]=(inv.items[id]||0)+n;inv.last=`+${n} ${id}`;inv.failed=false;w.emit('inventory.itemAdded',{id,n});},
      canSpend:cost=>{const items=w.get('inventory').items;return Object.entries(cost).every(([k,v])=>(items[k]||0)>=v);},
      spend:cost=>{const inv=w.get('inventory');if(!e.inventory.canSpend(cost)){inv.failed=true;w.emit('inventory.spendRejected',{cost});return false;}for(const[k,v]of Object.entries(cost))inv.items[k]-=v;inv.failed=false;w.emit('inventory.spent',{cost});return true;},
      clear:()=>{const inv=w.get('inventory');inv.items=resetItems();inv.last='starter cache restored';inv.failed=false;},
      getState:()=>w.get('inventory')
    };}
  };
}

export function createRealmKit(){function enter(w,id){const table=config.resources[id]||[],resources=[];for(let i=0;i<38&&table.length;i++){const t=table[Math.floor(Math.random()*table.length)],a=Math.random()*TAU,r=rand(220,850);resources.push({id:`res-${i}`,kind:t[0],item:t[1],color:t[2],hp:t[3],maxHp:t[3],size:t[4],x:Math.cos(a)*r,y:Math.sin(a)*r});}w.set('resources',resources);w.set('drops',[]);w.set('enemies',[]);w.set('realm',{id,prompt:'HARVEST MATERIALS. RETURN TO THE BASE BEACON.'});w.emit('realm.entered',{id});burst(w,0,0,config.realms[id].glow,70);}function home(w){const p=w.get('player');p.x=0;p.y=180;w.set('resources',[]);w.set('drops',[]);w.set('enemies',[]);w.set('realm',{id:'lobby',prompt:'FORTIFY, THEN START THE NEXT SIEGE AT THE CORE.'});w.emit('realm.returnedHome',{});burst(w,0,-350,'#00f5ff',70);}return{init(w){w.set('realm',{id:'lobby',prompt:'BUILD YOUR STARTER WALL (B), THEN START THE SIEGE AT THE CORE (E).'});w.set('portals',config.portals);w.set('resources',[]);w.set('drops',[]);w.set('enemies',[]);w.set('core',{x:0,y:-60,hp:300,maxHp:300,pulse:0});},install(e,w){e.realms={enter:id=>enter(w,id),home:()=>home(w),getState:()=>w.get('realm')};},systems:[w=>{const input=w.get('input'),realm=w.get('realm'),p=w.get('player'),core=w.get('core');core.pulse=(core.pulse??0)+w.clock.delta;if(realm.id==='lobby'){for(const portal of w.get('portals'))if(dist(p,portal)<54&&input.interact)enter(w,portal.id);}else if(dist(p,{x:0,y:-350})<68&&input.interact)home(w);} ]};}

export function createHarvestAndPickupKit(){function addDrop(w,x,y,item,color){w.get('drops').push({x,y,item,color,vx:rand(-60,60),vy:rand(-120,-40),life:.42});}return{systems:[(w,e)=>{const p=w.get('player'),input=w.get('input'),dt=w.clock.delta;let target=null,best=88;for(const r of w.get('resources')){const d=dist(p,r);if(d<best){best=d;target=r;}}if(input.primary&&target){target.hp-=56*dt;w.set('context',{text:`HARVEST ${target.kind.toUpperCase()}`,target});w.emit('fx.burst',{x:target.x,y:target.y,color:target.color,count:1});if(target.hp<=0){w.get('resources').splice(w.get('resources').indexOf(target),1);for(let i=0;i<3;i++)addDrop(w,target.x,target.y,target.item,target.color);burst(w,target.x,target.y,target.color,22);}}else w.set('context',{text:'',target:null});for(const d of [...w.get('drops')]){d.life-=dt;d.vy+=520*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.life<0){const a=angle(d,p),dd=dist(d,p);d.x+=Math.cos(a)*540*dt;d.y+=Math.sin(a)*540*dt;if(dd<24){w.get('drops').splice(w.get('drops').indexOf(d),1);e.inventory.add(d.item,1);burst(w,d.x,d.y,d.color,8);}}}} ]};}

export function createBuildKit(){
  const recipe=config.firstSiege.postClearFortification;
  const sentryRecipe=config.firstSiege.postFortificationSentry;
  const sentryIndex=config.builds.findIndex(blueprint=>blueprint.id===sentryRecipe.buildId);

  function describeFortification(w){
    const items=w.get('inventory').items;
    const wall=w.get('structures').find(structure=>structure.kind==='wall');
    const missing=Object.fromEntries(Object.entries(recipe.cost)
      .map(([id,amount])=>[id,Math.max(0,amount-(items[id]||0))])
      .filter(([,amount])=>amount>0));
    const completed=wall?.fortificationId===recipe.id;
    const unlocked=(w.get('combat')?.clears??0)>0;
    return{
      id:recipe.id,
      name:recipe.name,
      cost:{...recipe.cost},
      materials:Object.fromEntries(Object.keys(recipe.cost).map(id=>[id,items[id]||0])),
      missing,
      unlocked,
      eligible:unlocked&&Boolean(wall)&&!completed,
      ready:unlocked&&Boolean(wall)&&!completed&&!Object.keys(missing).length,
      completed,
      wallId:wall?.id??null,
      maxHpBonus:recipe.maxHpBonus,
      damageScale:recipe.damageScale,
      guardPercent:recipe.guardPercent,
      color:recipe.color
    };
  }

  function describeSentryChoice(w){
    const items=w.get('inventory').items;
    const structures=w.get('structures');
    const blueprint=config.builds[sentryIndex];
    const wall=structures.find(structure=>structure.kind==='wall'&&structure.fortificationId===recipe.id&&structure.hp>0);
    const sentry=structures.find(structure=>structure.kind===sentryRecipe.buildId&&structure.sentryChoiceId===sentryRecipe.id);
    const survivedSiege=(w.get('combat')?.clears??0)>=sentryRecipe.unlockAfterClears;
    const unlocked=Boolean(wall)&&survivedSiege;
    const core=w.get('core');
    const missing=Object.fromEntries(Object.entries(blueprint.cost)
      .map(([id,amount])=>[id,Math.max(0,amount-(items[id]||0))])
      .filter(([,amount])=>amount>0));
    return{
      id:sentryRecipe.id,
      buildId:sentryRecipe.buildId,
      buildIndex:sentryIndex,
      name:sentryRecipe.name,
      routeRealmId:sentryRecipe.routeRealmId,
      unlockAfterClears:sentryRecipe.unlockAfterClears,
      cost:{...blueprint.cost},
      materials:Object.fromEntries(Object.keys(blueprint.cost).map(id=>[id,items[id]||0])),
      missing,
      survivedSiege,
      unlocked,
      eligible:unlocked&&!sentry,
      ready:unlocked&&!sentry&&!Object.keys(missing).length,
      selected:w.get('build').selected===sentryIndex,
      completed:Boolean(sentry),
      sentryId:sentry?.id??null,
      wallId:wall?.id??null,
      placement:{x:core.x+sentryRecipe.placementOffset.x,y:core.y+sentryRecipe.placementOffset.y},
      hp:blueprint.hp,
      range:blueprint.range,
      color:blueprint.color
    };
  }

  function fortify(w,e){
    const state=describeFortification(w);
    const build=w.get('build');
    const wall=w.get('structures').find(structure=>structure.kind==='wall');
    if(!state.eligible||!wall){build.last='clear a siege with a wall first';return false;}
    if(!e.inventory.spend(recipe.cost)){
      build.last='emberplate recipe incomplete';
      w.emit('fx.shake',{amount:5});
      w.emit('fx.flash',{x:wall.x,y:wall.y,color:'#ff553c'});
      return false;
    }
    wall.name=recipe.name;
    wall.maxHp+=recipe.maxHpBonus;
    wall.hp=wall.maxHp;
    wall.damageScale=recipe.damageScale;
    wall.fortificationId=recipe.id;
    wall.color=recipe.color;
    build.last=`forged ${recipe.name}`;
    build.ghostAlpha=0;
    w.emit('structure.fortified',{kind:wall.kind,fortificationId:recipe.id,maxHp:wall.maxHp});
    w.emit('fx.shake',{amount:8});
    w.emit('fx.flash',{x:wall.x,y:wall.y,color:recipe.color,life:.46});
    burst(w,wall.x,wall.y,recipe.color,64);
    return true;
  }

  return{
    init(w){w.set('build',{selected:0,last:'starter wall ready',ghostAlpha:1});w.set('structures',[]);},
    install(e,w){e.build={
      select:index=>{const b=w.get('build');b.selected=clamp(index,0,config.builds.length-1);b.last=config.builds[b.selected].name;b.ghostAlpha=1;},
      place:()=>{const b=w.get('build'),bp=config.builds[b.selected],p=w.get('player'),realm=w.get('realm'),sentryChoice=describeSentryChoice(w);if(realm.id!=='lobby'){b.last='lobby only';w.emit('fx.flash',{x:p.x,y:p.y,color:'#ff553c'});return false;}if(bp.id===sentryRecipe.buildId&&!sentryChoice.unlocked){b.last='Emberplate must survive Siege 2';w.emit('fx.shake',{amount:5});w.emit('fx.flash',{x:p.x,y:p.y,color:'#ff553c'});return false;}if(bp.id===sentryRecipe.buildId&&sentryChoice.completed){b.last='Crystal Sentry already deployed';return false;}if(!e.inventory.spend(bp.cost)){b.last=bp.id===sentryRecipe.buildId?'Crystal Sentry recipe incomplete':'missing materials';w.emit('fx.shake',{amount:5});w.emit('fx.flash',{x:p.x,y:p.y,color:'#ff553c'});return false;}const placement=bp.id===sentryRecipe.buildId?sentryChoice.placement:{x:p.x,y:p.y+58};w.get('structures').push({id:`structure-${w.get('structures').length+1}`,kind:bp.id,name:bp.name,x:placement.x,y:placement.y,hp:bp.hp,maxHp:bp.hp,range:bp.range,cd:0,color:bp.color,...(bp.id===sentryRecipe.buildId?{sentryChoiceId:sentryRecipe.id}:{})});b.last=`built ${bp.id===sentryRecipe.buildId?sentryRecipe.name:bp.name}`;b.ghostAlpha=1;w.emit('structure.built',{kind:bp.id});burst(w,placement.x,placement.y,bp.color,bp.id===sentryRecipe.buildId?58:38);return true;},
      fortify:()=>fortify(w,e),
      getFortificationState:()=>describeFortification(w),
      getSentryChoiceState:()=>describeSentryChoice(w),
      getState:()=>w.get('build')
    };},
    systems:[(w,e)=>{const input=w.get('input'),b=w.get('build');if(input.select!==null&&input.select!==undefined)e.build.select(input.select);if(input.cycle)e.build.select((b.selected+input.cycle+config.builds.length)%config.builds.length);if(input.build){const fortification=e.build.getFortificationState();if(fortification.eligible)e.build.fortify();else e.build.place();}b.ghostAlpha=Math.max(0,(b.ghostAlpha??0)-w.clock.delta*.7);}]
  };
}

export function createWaveAndDefenseKit(){
  const strikeTuning=config.firstSiege.strike;
  function spawn(w,type){const a=Math.random()*TAU,r=730;w.get('enemies').push({type,x:Math.cos(a)*r,y:Math.sin(a)*r,hp:type==='brute'?120:42,maxHp:type==='brute'?120:42,speed:type==='brute'?54:118,dmg:type==='brute'?25:8,cd:0,hurt:0,size:type==='brute'?28:17});}
  function strike(w){
    const combat=w.get('combat'),p=w.get('player');
    if(combat.cooldown>0)return false;
    let target=null,best=strikeTuning.range;
    for(const enemy of w.get('enemies')){const d=dist(p,enemy);if(d<best){best=d;target=enemy;}}
    combat.cooldown=strikeTuning.cooldown;
    if(!target){combat.lastImpact='CLOSE THE GAP';combat.impact=.18;return false;}
    target.hp-=strikeTuning.damage;
    target.hurt=1;
    combat.hits++;
    combat.target={x:target.x,y:target.y};
    combat.impact=.28;
    combat.lastImpact=target.hp<=0?'DEMON BROKEN':'WARDEN STRIKE';
    w.emit('fx.beam',{x1:p.x,y1:p.y,x2:target.x,y2:target.y,color:strikeTuning.color});
    w.emit('fx.flash',{x:target.x,y:target.y,color:strikeTuning.color,life:.18});
    w.emit('fx.shake',{amount:target.type==='brute'?7:4});
    burst(w,target.x,target.y,target.type==='brute'?'#f97316':strikeTuning.color,target.hp<=0?28:14);
    if(target.hp<=0)combat.kills++;
    return true;
  }
  return{
    init(w){w.set('wave',{n:0,active:false,queue:[],timer:0});w.set('combat',{cooldown:0,hits:0,kills:0,clears:0,failures:0,impact:0,lastImpact:'',target:null});},
    install(e,w){e.waves={
      start:()=>{const wave=w.get('wave'),realm=w.get('realm');if(wave.active||realm.id!=='lobby')return false;const retrying=realm.prompt.startsWith('CORE FAILURE');if(!w.get('structures').length){realm.prompt=retrying?`CORE FAILURE. STARTER CACHE RESTORED. REBUILD BEFORE RETRYING SIEGE ${wave.n}.`:'BUILD YOUR STARTER WALL BEFORE THE FIRST SIEGE.';return false;}if(!retrying)wave.n++;wave.active=true;wave.queue=[];const first=config.firstSiege.firstWave;const crawlerCount=wave.n===1?first.crawlers:4+wave.n*3;const bruteCount=wave.n===1?first.brutes:Math.floor(wave.n*1.5);for(let i=0;i<crawlerCount;i++)wave.queue.push('crawler');for(let i=0;i<bruteCount;i++)wave.queue.push('brute');wave.queue.sort(()=>Math.random()-.5);realm.prompt=`SIEGE WAVE ${wave.n}: DEFEND THE CORE.`;w.emit('wave.started',{n:wave.n,retrying});burst(w,0,-60,'#ff3300',80);return true;},
      strike:()=>strike(w),
      getState:()=>w.get('wave')
    };},
    systems:[(w,e)=>{
      const realm=w.get('realm'),wave=w.get('wave'),input=w.get('input'),p=w.get('player'),core=w.get('core'),combat=w.get('combat'),dt=w.clock.delta;
      combat.cooldown=Math.max(0,combat.cooldown-dt);
      combat.impact=Math.max(0,combat.impact-dt);
      if(realm.id!=='lobby')return;
      if(dist(p,core)<104&&input.interact&&!wave.active)e.waves.start();
      if(wave.active&&wave.queue.length){wave.timer+=dt;const cadence=wave.n===1?config.firstSiege.firstWave.spawnCadence:Math.max(.55,2.2-wave.n*.12);if(wave.timer>cadence){wave.timer=0;spawn(w,wave.queue.pop());}}
      if(input.primary&&wave.active)strike(w);
      const targets=[p,core,...w.get('structures').filter(s=>s.hp>0)];
      for(const enemy of [...w.get('enemies')]){enemy.cd-=dt;enemy.hurt=Math.max(0,(enemy.hurt??0)-dt*5);if(enemy.hp<=0)continue;let target=targets[0],best=1e9;for(const t of targets){const d=dist(enemy,t);if(d<best){best=d;target=t;}}const a=angle(enemy,target);if(best>36){enemy.x+=Math.cos(a)*enemy.speed*dt;enemy.y+=Math.sin(a)*enemy.speed*dt;}else if(enemy.cd<=0){enemy.cd=enemy.type==='brute'?2.2:1;target.hp-=enemy.dmg*(target.damageScale??1);if(target===p)p.hurt=1;w.emit('fx.shake',{amount:4});burst(w,target.x,target.y,'#ef4444',6);}}
      for(const s of w.get('structures')){s.cd-=dt;if(s.kind==='turret'&&s.cd<=0){let t=null,b=s.range;for(const en of w.get('enemies')){const d=dist(s,en);if(d<b){b=d;t=en;}}if(t){s.cd=.68;t.hp-=16;w.emit('fx.beam',{x1:s.x,y1:s.y-28,x2:t.x,y2:t.y});if(t.hp<=0){w.get('enemies').splice(w.get('enemies').indexOf(t),1);burst(w,t.x,t.y,'#f97316',16);}}}if(s.kind==='pylon'&&s.cd<=0){s.cd=1.8;for(const t of targets)if(dist(s,t)<160)t.hp=Math.min(t.maxHp,t.hp+12);burst(w,s.x,s.y,'#10b981',14);}}
      w.set('structures',w.get('structures').filter(s=>s.hp>0));
      w.set('enemies',w.get('enemies').filter(en=>en.hp>0));
      if(core.hp<=0||p.hp<=0){e.inventory.clear();core.hp=core.maxHp;p.hp=p.maxHp;p.hurt=0;wave.active=false;wave.queue=[];w.set('enemies',[]);if(!w.get('structures').some(structure=>structure.kind==='wall'))e.build.select(0);combat.failures++;combat.lastImpact='CORE REKINDLED';combat.impact=.8;realm.prompt='CORE FAILURE. STARTER CACHE RESTORED. REBUILD AND RETRY.';w.emit('fx.shake',{amount:15});w.emit('fx.flash',{x:core.x,y:core.y,color:'#ff553c',life:.5});}
      if(wave.active&&!wave.queue.length&&!w.get('enemies').length){wave.active=false;combat.clears++;combat.lastImpact=`SIEGE ${wave.n} SECURED`;combat.impact=1;realm.prompt=`WAVE ${wave.n} CLEARED. GATHER AND REBUILD.`;const sentryChoice=e.build.getSentryChoiceState();if(sentryChoice.unlocked&&!sentryChoice.completed)e.build.select(sentryChoice.buildIndex);for(let i=0;i<4;i++)w.get('drops').push({x:rand(-40,40),y:rand(-40,40),item:'energy',color:'#e9d5ff',vx:rand(-50,50),vy:rand(-100,-40),life:.4});}
    }]
  };
}

export function createHellscapeSiegeKit(){return{init(w){w.set('sequence',{hint:'UNIFIED DOMAIN ROUTE ONLINE'});},systems:[w=>{const ctx=w.get('context'),realm=w.get('realm'),build=w.get('build'),wave=w.get('wave');w.get('sequence').hint=ctx?.text||(wave?.active?realm.prompt:build?.last||realm.prompt);} ]};}
