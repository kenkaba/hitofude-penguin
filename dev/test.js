const PG=require('./core.js');
function dense(pts){const o=[pts[0]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/6));for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);}return o;}
function run(li,strokes,trace){const L=PG.LEVELS[li];const w=PG.makeWorld(L);let bad=0;
 for(const s of strokes){const d0=dense(s);const d=d0.filter(p=>PG.canPlace(w,p[0],p[1]));bad+=d0.length-d.length;PG.addStroke(w,d);w.inkUsed+=PG.strokeLen(d);}
 w.state='run';const tr=[];while(w.state==='run'){PG.step(w);if(trace&&w.frame%10==0)tr.push(`${w.frame}:${w.p.x|0},${w.p.y|0}${w.p.grounded?'g':''}`)}
 return {st:w.state,why:w.failReason,f:w.frame,fish:w.fish.join(),ink:w.inkUsed|0,par:L.par,max:L.ink,bad,stars:PG.stars(w).total,tr:tr.join(' ')};}
const SOL=require('./sol.js');
const which=process.argv[2];
PG.LEVELS.forEach((L,i)=>{ if(which!==undefined && +which!==i) return;
 const b=run(i,[]);const s=run(i,SOL[i]||[],which!==undefined);
 console.log(i+1,L.name,'| base:',b.st,b.why,'| sol:',s.st,s.why,'f'+s.f,'fish',s.fish,'ink',s.ink+'/'+s.par+'/'+s.max,'bad',s.bad,'★'+s.stars);
 if(which!==undefined)console.log(s.tr);});
const NV=require('./naive.js');
for(const k in NV){const r=run(+k,NV[k]);console.log('naive',+k+1,r.st,r.why,'fish',r.fish);}
