const {dense,PG}=require('./lab.js');
// returns a point on the penguin's path (middle of the run) for the given solution
module.exports=function(L,sol){const w=PG.makeWorld(Object.assign({},L,{fish:[]}));for(const s of sol){const d=dense(s).filter(p=>PG.canPlace(w,p[0],p[1]));PG.addStroke(w,d);}w.state='run';const pts=[];while(w.state==='run'){PG.step(w);pts.push([Math.round(w.p.x),Math.round(w.p.y)]);}
 const n=pts.length;const cand=pts.slice(Math.floor(n*0.45),Math.floor(n*0.7));return cand[Math.floor(cand.length/2)]||pts[Math.floor(n/2)];};
