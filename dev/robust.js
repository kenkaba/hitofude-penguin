const PG=require('./core.js'),SOL=require('./sol.js');
function dense(pts){const o=[pts[0]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/6));for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);}return o;}
PG.LEVELS.forEach((L,i)=>{let win=0;for(let t=0;t<30;t++){const w=PG.makeWorld(L);
 for(const s of SOL[i]){const d=dense(s.map(([x,y])=>[x+(Math.random()-.5)*8,y+(Math.random()-.5)*8])).map(([x,y])=>[x+(Math.random()-.5)*2,y+(Math.random()-.5)*2]).filter(p=>PG.canPlace(w,p[0],p[1]));PG.addStroke(w,d);}
 w.state='run';while(w.state==='run')PG.step(w);if(w.state==='win')win++;}
 console.log(i+1,L.name,win+'/30');});
