const vm=require('vm'),fs=require('fs');
const PG=require('./core.js');const SOL=require('./sol_pre50.js');const NV=require('./naive_pre50.js');
function load(f){const m={exports:{}};vm.runInNewContext(fs.readFileSync(f,'utf8'),{module:m,Math,console});return m.exports;}
const OLD=load('core_v4.js');const PRE=load('core_pre50.js');
const {bez}=require('./lab.js');
const B=(x0,x1,top,bot=900,extra)=>Object.assign({x:(x0+x1)/2,y:(top+bot)/2,w:x1-x0,h:bot-top},extra||{});
const S=(x,top,dir=1)=>({x,y:top-16,dir});
const cur={};PRE.LEVELS.forEach((L,i)=>cur[L.name]={L:JSON.parse(JSON.stringify(L)),sol:SOL[i],naive:NV[i]});
const old={};OLD.LEVELS.forEach(L=>old[L.name]=JSON.parse(JSON.stringify(L)));
const r1=a=>a.map(p=>p.map(v=>Math.round(v)));
// families
const range=(a,b,s)=>{const o=[];for(let v=a;v<=b+1e-9;v+=s)o.push(v);return o;};
function cross(...arrs){return arrs.reduce((acc,a)=>acc.flatMap(x=>a.map(y=>x.concat([y]))),[[]]);}
module.exports={PG,B,S,cur,old,bez,r1,range,cross};
const mirrorPt=p=>[600-p[0],p[1]];
function mirrorL(L,name){const M=JSON.parse(JSON.stringify(L));M.name=name;delete M.hint;
 M.start.x=600-M.start.x;M.start.dir=-M.start.dir;M.goal.x=600-M.goal.x;M.goal.door=-(L.goal.door||-1);
 for(const k of ['blocks','pads','spikes','crumbles','fans','nodraw','movers']) (M[k]||[]).forEach(b=>{b.x=600-b.x;if(b.a)b.a=-b.a;if(b.wx)b.wx=-b.wx;if(b.dx)b.dx=-b.dx;});
 (M.balls||[]).forEach(b=>{if(b.rad){b.cx=600-b.cx;b.phase=Math.PI-(b.phase||0);}else{b.x=600-b.x;if(b.dx)b.dx=-b.dx;}});
 (M.rollers||[]).forEach(r=>{r.x=600-r.x;if(r.vx)r.vx=-r.vx;});
 for(const k of ['keys','fish']) M[k]=(M[k]||[]).map(mirrorPt);
 (M.portals||[]).forEach(p=>{p.a=mirrorPt(p.a);p.b=mirrorPt(p.b);});
 (M.boosts||[]).forEach(b=>{const x1=600-b.x2,x2=600-b.x1;b.x1=x1;b.x2=x2;b.dir=-b.dir;});
 return M;}
const mirrorSol=sol=>sol.map(st=>st.map(p=>p&&mirrorPt(p)));
function splitStroke(pts,k,gap=4){if(k<=1)return [pts];const d=[0];for(let i=1;i<pts.length;i++)d.push(d[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const T=d[d.length-1];const out=[];
 for(let j=0;j<k;j++){const a=T*j/k+(j?gap/2:0),b=T*(j+1)/k-(j<k-1?gap/2:0);const seg=[];for(let i=0;i<pts.length-1;i++){for(let s=0;s<=10;s++){const t=d[i]+(d[i+1]-d[i])*s/10;if(t>=a&&t<=b){const u=s/10;seg.push([Math.round(pts[i][0]+(pts[i+1][0]-pts[i][0])*u),Math.round(pts[i][1]+(pts[i+1][1]-pts[i][1])*u)]);}}}
 const ded=seg.filter((p,i)=>i===0||p[0]!==seg[i-1][0]||p[1]!==seg[i-1][1]);if(ded.length>1)out.push(ded);}return out;}
Object.assign(module.exports,{mirrorL,mirrorSol,splitStroke});
