const fs=require('fs');let seed=12345;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};const {run,dense,PG}=require('./lab.js');const af=require('./autofish.js');
const ALL=[].concat(require('./design_a.js'),require('./design_b.js'),require('./design_c.js'),require('./design_d.js'));
const HINT={ball:'紫のウニは線をすり抜ける。触れたらアウト',orbit:'ウニが円をえがいて回っている',roller:'赤いウニは線で止まり、線の上を転がる',key:'鍵を取るまで、かまくらの扉は開かない',
 kbridge:'鍵を取ると、消えていた橋が現れる',kwall:'鍵を取ると、うすい氷の床が消える',pad:'ピンクの床は、大きく跳ねる',spike:'ツララに触れたらアウト',mover:'ツララが動いている',
 fan:'風の中では、体がふわっと浮く',wind:'横風は、ペンギンを横に押し流す',crumble:'ひびの入った氷は、乗るとすぐ崩れる',nodraw:'赤い斜線の中には描けない',boost:'矢印の上で、一気に加速する',
 one:'この面は、線を1本しか引けない',portal:'青い穴に入ると、もう一方の穴から出てくる',melt:'この面の線は、ペンギンが乗ると少しして溶ける',wall:'ペンギンは壁にぶつかると向きを変える'};
const WALL=new Set(['ジグザグ','トゲの階段','ふりこウニ']);
function tags(L){const t=new Set();(L.balls||[]).forEach(b=>t.add(b.rad?'orbit':'ball'));if((L.rollers||[]).length)t.add('roller');if((L.keys||[]).length)t.add('key');
 (L.blocks||[]).forEach(b=>{if(b.k==='bridge')t.add('kbridge');if(b.k==='wall')t.add('kwall');});if((L.pads||[]).length)t.add('pad');if((L.spikes||[]).length)t.add('spike');if((L.movers||[]).length){t.add('mover');t.add('spike');}
 (L.fans||[]).forEach(f=>t.add(f.wx?'wind':'fan'));if((L.crumbles||[]).length)t.add('crumble');if((L.nodraw||[]).length)t.add('nodraw');if((L.boosts||[]).length)t.add('boost');
 if(L.maxStrokes)t.add('one');if((L.portals||[]).length)t.add('portal');if(L.melt)t.add('melt');if(WALL.has(L.name))t.add('wall');return t;}
function robust(L,sol,n=24){let win=0;for(let t=0;t<n;t++){const w=PG.makeWorld(L);let ink=0;for(const s of sol){const d=dense(s.map(([x,y])=>[x+(Math.random()-.5)*8,y+(Math.random()-.5)*8])).map(([x,y])=>[x+(Math.random()-.5)*2,y+(Math.random()-.5)*2]).map(p=>PG.snap(w,p[0],p[1])).filter(Boolean);PG.addStroke(w,d);}
 w.state='run';while(w.state==='run')PG.step(w);if(w.state==='win')win++;}return win/n;}
const rows=[];
for(const d of ALL){const L=JSON.parse(JSON.stringify(d.L));delete L.needStars;delete L.hint;L.ink=L.ink||400;L.par=L.ink;
 const fam=typeof d.fam==='function'?d.fam():d.fam;let wins=[];for(const s of fam){const r=run(L,s);if(r.win&&!r.over)wins.push({s,ink:r.ink,fish:r.fish});}
 if(!wins.length){console.log('NO SOLUTION',L.name);process.exit(1);}
 let best=wins.filter(w=>w.fish).sort((a,b)=>a.ink-b.ink)[0];
 if(!best){best=wins.sort((a,b)=>a.ink-b.ink)[0];L.fish=[af(L,best.s)];const r=run(L,best.s);if(!r.fish){console.log('fish fail',L.name);}}
 L.par=Math.ceil(best.ink*1.1/5)*5;L.ink=Math.max(L.ink,L.par+40);
 let rb=-1,rsol=best.s;for(const w of wins.filter(w=>w.fish||!best.fish).slice(0,12)){const q=robust(L,w.s,20);if(q>rb){rb=q;rsol=w.s;}}
 const minSol=best.s;{const r=run(L,minSol);L.par=Math.max(L.par,Math.ceil((r.ink+4)/5)*5);L.ink=Math.max(L.ink,L.par+40);}best={s:rsol,ink:best.ink,fish:best.fish};const wr=fam.length>1?wins.length/fam.length:0.6;
 const tg=tags(L);const score=(1-rb)*0.55+(1-wr)*0.3+0.03*best.s.length+0.035*tg.size+(L.maxStrokes?0.04:0);
 rows.push({L,rsol:best.s,sol:minSol,naive:(d.breather||['描けない空'].includes(L.name))?null:d.naive,score,rb,wr,tg:[...tg]});}
// order: level 1 fixed first, rest ascending difficulty
const first=rows.find(r=>r.L.name==='はじめの一筆');let pool=rows.filter(r=>r!==first);const order=[first];const known=new Set();
while(pool.length){let bestR=null,bv=1e9;for(const r of pool){const nt=r.tg.filter(t=>!known.has(t)).length;const v=r.score+0.12*nt+(nt>1?0.25*(nt-1):0);if(v<bv){bv=v;bestR=r;}}
 order.push(bestR);bestR.tg.forEach(t=>known.add(t));pool=pool.filter(r=>r!==bestR);}
const seen=new Set();order.forEach((r,i)=>{if(i===0){r.L.hint='すき間に線を引くと、氷の橋になる';return;}const nt=r.tg.filter(t=>!seen.has(t));nt.forEach(t=>seen.add(t));if(nt.length)r.L.hint=nt.slice(0,2).map(t=>HINT[t]).join('。');});
const gates={10:18,20:38,30:58,40:78};order.forEach((r,i)=>{if(gates[i])r.L.needStars=gates[i];});
order.forEach((r,i)=>console.log(String(i+1).padStart(2),r.L.name.padEnd(10,'　'),'score',r.score.toFixed(2),'rob',r.rb.toFixed(2),'fam',r.wr.toFixed(2),r.tg.join(','),r.L.hint?'💡':''));
const body='  const LEVELS = '+JSON.stringify(order.map(o=>o.L),null,1).replace(/\n\s*/g,' ').replace(/\{ "name"/g,'\n    { "name"')+';\n';
let s=fs.readFileSync('core.js','utf8');const a=s.indexOf('  const LEVELS = '),b=s.indexOf('  const api =');s=s.slice(0,a)+body+'\n'+s.slice(b);fs.writeFileSync('core.js',s);
fs.writeFileSync('sol.js','module.exports='+JSON.stringify(order.map(o=>o.sol))+';\n');fs.writeFileSync('solR.json',JSON.stringify(order.map(o=>o.rsol)));
const nv={};order.forEach((o,i)=>{if(o.naive)nv[i]=o.naive;});fs.writeFileSync('naive.js','module.exports='+JSON.stringify(nv)+';\n');
