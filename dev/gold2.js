let seed=5;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const fs=require('fs');const {run,dense,PG}=require('./lab.js');const SOL=require('./sol.js');
const G=JSON.parse(fs.readFileSync('gold.json'));
function path(L,sol){const w=PG.makeWorld(Object.assign({},L,{fish:[]}));for(const s of sol){PG.addStroke(w,dense(s).filter(p=>PG.canPlace(w,p[0],p[1])));}w.state='run';const pts=[];while(w.state==='run'){PG.step(w);pts.push([w.p.x,w.p.y]);}return {pts,win:w.state==='win'};}
for(const c of [0,1]){let best=null;
 for(let i=c*10;i<c*10+10;i++){if(i===0)continue;const L=PG.LEVELS[i];const T0=path(L,SOL[i]).pts;
  for(let t=0;t<220;t++){const amp=10+Math.random()*50;const s=SOL[i].map(st=>{const sh=[(Math.random()-.5)*amp*2,(Math.random()-.5)*amp*2];return st.map((p,k)=>[Math.round(p[0]+sh[0]*Math.sin(k/st.length*Math.PI)+(Math.random()-.5)*amp*.3),Math.round(p[1]+sh[1]*Math.sin(k/st.length*Math.PI)+(Math.random()-.5)*amp*.3)]);});
   const r=run(L,s);if(!r.win||r.over)continue;const P=path(L,s);
   for(let k=Math.floor(P.pts.length*.15);k<P.pts.length*.85;k+=3){const p=P.pts[k];let dmin=1e9;for(const q of T0){const dd=Math.hypot(p[0]-q[0],p[1]-q[1]);if(dd<dmin)dmin=dd;}
    const g=L.goal,s0=L.start;if(Math.hypot(p[0]-g.x,p[1]-g.y)<90||Math.hypot(p[0]-s0.x,p[1]-s0.y)<80)continue;
    if(!best||dmin>best.d)best={d:dmin,i,name:L.name,p:[Math.round(p[0]),Math.round(p[1])],sol:s};}}}
 console.log('chapter',c+1,'lv',best.i+1,best.name,best.p,Math.round(best.d));
 for(const k of Object.keys(G.gold))if(PG.LEVELS.findIndex(l=>l.name===k)>=c*10&&PG.LEVELS.findIndex(l=>l.name===k)<c*10+10)delete G.gold[k];
 G.gold[best.name]={p:best.p,sol:best.sol};}
fs.writeFileSync('gold.json',JSON.stringify(G));console.log(Object.keys(G.gold));
