const PG=require('./core.js');
const L={start:{x:60,y:584,dir:1},goal:{x:510,y:600},blocks:[{x:300,y:750,w:600,h:300}],fish:[],ink:100,par:100};
const ig=PG.igloo(L.goal);let wins=0,bad=0,N=3000;
for(let k=0;k<N;k++){const w=PG.makeWorld(L);w.p.x=ig.cx-120+Math.random()*190;w.p.y=300+Math.random()*250;w.p.vx=(Math.random()-.5)*16;w.p.vy=(Math.random()-.7)*12;w.p.dir=Math.random()<.5?1:-1;
 if(Math.hypot(w.p.x-ig.cx,w.p.y-ig.y)<ig.y-ig.roofY+30&&w.p.y>ig.y-60)continue; // don't spawn inside
 w.state='run';const hist=[];for(let i=0;i<600&&w.state==='run';i++){PG.step(w);hist.push([w.p.x,w.p.y]);}
 if(w.state==='win'){wins++;const recent=hist.slice(-40);const viaDoor=recent.some(([x,y])=>x<ig.roofX&&y>ig.roofY);if(!viaDoor){bad++;console.log('BAD',JSON.stringify(recent.slice(-6)));}}}
console.log('trials',N,'wins',wins,'不正侵入',bad);
