// design lab: run strokes (optionally timed) on a level object
const PG=require('./core.js');
function dense(pts){const o=[pts[0]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/6));for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);}return o;}
function bez(a,c,b,n=14){const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]]);}return o;}
// strokes: array of polylines or {at:frame, pts}
function run(L,strokes,opt={}){const w=PG.makeWorld(L);let bad=0;const timed=[];
 for(const s of strokes){ if(s.pts){timed.push(s);continue;} const d=dense(s);const ok=d.filter(p=>PG.canPlace(w,p[0],p[1]));bad+=d.length-ok.length;PG.addStroke(w,ok);w.inkUsed+=PG.strokeLen(ok);}
 w.state='run';const tr=[];
 while(w.state==='run'){ for(const s of timed) if(s.at===w.frame){const d=dense(s.pts).filter(p=>PG.canPlace(w,p[0],p[1]));PG.addStroke(w,d);w.inkUsed+=PG.strokeLen(d);} PG.step(w); if(opt.trace&&w.frame%10==0)tr.push(`${w.frame}:${w.p.x|0},${w.p.y|0}${w.rollers.length?' r'+w.rollers.map(r=>(r.x|0)+','+(r.y|0)).join('|'):''}`);}
 return {win:w.state==='win',why:w.failReason,f:w.frame,fish:w.fish.every(Boolean),ink:Math.round(w.inkUsed),bad,over:w.inkUsed>L.ink+1,tr:tr.join(' ')};}
module.exports={run,bez,dense,PG};
