// dev record per level + one hidden golden fish per chapter, placed on the path of a *different* valid solution
let seed=99;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const fs=require('fs');const {run,dense,PG}=require('./lab.js');
const ALL=[].concat(require('./design_a.js'),require('./design_b.js'),require('./design_c.js'),require('./design_d.js'));
const by={};for(const d of ALL)by[d.L.name]=d;
const SOL=require('./sol.js');
function path(L,sol){const w=PG.makeWorld(Object.assign({},L,{fish:[]}));for(const s of sol){PG.addStroke(w,dense(s).filter(p=>PG.canPlace(w,p[0],p[1])));}w.state='run';const pts=[];while(w.state==='run'){PG.step(w);pts.push([w.p.x,w.p.y]);}return {pts,win:w.state==='win'};}
const out={dev:{},gold:{}};
PG.LEVELS.forEach((L,i)=>{const r=run(L,SOL[i]);out.dev[L.name]=r.ink;});
for(let c=0;c<5;c++){let best=null;
 for(let i=c*10;i<c*10+10;i++){const L=PG.LEVELS[i];const d=by[L.name]||by[L.name==='氷河の一筆'?'氷河の一筆':''];if(!d)continue;
  const fam=typeof d.fam==='function'?d.fam():d.fam;if(!fam||fam.length<3)continue;
  const T0=path(L,SOL[i]).pts;
  for(const s of fam){const r=run(L,s);if(!r.win||r.over)continue;const P=path(L,s);if(!P.win)continue;
   for(let k=Math.floor(P.pts.length*.15);k<P.pts.length*.85;k+=3){const p=P.pts[k];let dmin=1e9;for(const q of T0){const dd=Math.hypot(p[0]-q[0],p[1]-q[1]);if(dd<dmin)dmin=dd;}
    const g=L.goal,s0=L.start;if(Math.hypot(p[0]-g.x,p[1]-g.y)<90||Math.hypot(p[0]-s0.x,p[1]-s0.y)<80)continue;
    if(!best||dmin>best.d)best={d:dmin,i,name:L.name,p:[Math.round(p[0]),Math.round(p[1])],sol:s};}}}
 out.gold[best.name]={p:best.p,sol:best.sol};console.log('chapter',c+1,'lv',best.i+1,best.name,'gold at',best.p,'dist from dev path',Math.round(best.d));}
fs.writeFileSync('gold.json',JSON.stringify(out));
