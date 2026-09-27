const {PG,B,S,cur,old,bez,r1,range,cross,mirrorL,mirrorSol,splitStroke}=require('./lib50.js');
const {run}=require('./lab.js');
const ALL=[].concat(require('./design_a.js'),require('./design_b.js'),require('./design_c.js'));
const by={};for(const d of ALL)by[d.L.name]=d;
function winners(name){const d=by[name];const fam=typeof d.fam==='function'?d.fam():d.fam;return fam.filter(s=>{const r=run(d.L,s);return r.win&&!r.over;});}
const cl=o=>JSON.parse(JSON.stringify(o));
// melt-variant family: every winner, each stroke split into k pieces
const meltFam=(sols,ks)=>{const o=[];for(const s of sols)for(const k of ks)o.push(s.flatMap(st=>splitStroke(st,k)));return o;};
const D=[];
// 40 ボス: 消える床 + 溶ける線
{const b=by['消える床'];const L=cl(b.L);L.name='溶けて消える';delete L.hint;L.melt=8;L.ink=520;const w=winners('消える床');
 D.push({L,fam:()=>meltFam(w,[1,2,3,4]),naive:w[0]});}
// 41 鏡の滝: 滝くだり反転 + 溶ける線
{const L=mirrorL(by['滝くだり'].L,'鏡の滝');L.melt=30;L.ink=560;const w=winners('滝くだり').map(mirrorSol);
 const extra=[];for(const c of [[400,720],[430,700],[380,740]]) for(const ex of [380,400]) extra.push([r1(bez([320,470],c,[ex,748]))]);
 D.push({L,fam:()=>meltFam(w.concat(extra),[1,2,3,4]),naive:w[0]});}
// 42 ひとふでワープ: ワープ + 1本 + ウニ
{const L=cl(by['ワープ'].L);L.name='ひとふでワープ';delete L.hint;L.maxStrokes=1;L.balls=[{x:260,y:590,r:14}];L.fish=[[300,560]];
 D.push({L,fam:()=>{const o=[];for(const c of [[240,540],[300,520],[320,600],[210,620],[260,640]]) for(const e of [[280,615],[290,625],[300,620]]) o.push([r1(bez([202,494],c,e))]);return o;},naive:winners('ワープ')[0]});}
// 43 崩れる風: わざと落ちる + 横風
{const L=cl(by['わざと落ちる'].L);L.name='ウニの落とし穴';L.balls=[{x:300,y:520,r:15}];L.ink=460;
 D.push({L,fam:()=>{const o=[];for(const sx of [140,200,260,320]) for(const c of [[300,520],[380,600],[420,560],[460,640]]) for(const ex of [440,470]) o.push([r1(bez([sx,450],c,[ex,748]))]);return o;},naive:winners('わざと落ちる')[0]});}
// 44 鏡のワープ + 溶ける線
{const L=mirrorL(by['ワープ'].L,'溶けるワープ');L.melt=10;const w=winners('ワープ').map(mirrorSol);
 D.push({L,fam:()=>meltFam(w,[1,2,3]),naive:w[0]});}
// 45 ウニ行列の鍵: ウニの行列 + 背後の鍵
{const L=cl(by['ウニの行列'].L);L.name='行列の向こうの鍵';L.start=S(120,560,-1);L.blocks=[B(0,60,560),B(100,150,560),B(450,600,560)];L.keys=[[25,528]];L.ink=560;
 const w=winners('ウニの行列');D.push({L,fam:()=>{const o=[];for(const s of w) for(const h of [554,548]) o.push(s.concat([[[62,554],[80,h],[98,554]]]));return o;},naive:w[0]});}
// 46 溶ける番人: ウニの番人 + 溶ける線
{const b=cur['ウニの番人'];const L=cl(b.L);L.name='溶ける番人';L.melt=110;delete L.needStars;L.ink=480;
 const base=[];for(const d of [30,42,50]) base.push([[[402,494],[440,494+d],[500,494+d],[538,494]]]);
 D.push({L,fam:()=>meltFam(base,[1,2,3,4]).concat(base.map(s=>[s[0],[[404,500],[440,500+50],[500,500+50],[536,500]]])),naive:b.sol});}
// 47 氷河のワープ: 穴から穴へ + 溶ける線
{const L=cl(by['穴から穴へ'].L);L.name='ウニの着地点';L.balls=[{x:370,y:480,r:15},{x:400,y:560,r:15}];L.ink=560;const w=winners('穴から穴へ');
 D.push({L,fam:()=>by['穴から穴へ'].fam(),naive:w[0]});}
// 48 ひとふでの鍵: 鍵はうしろ系 1本 + ウニ
{const L={name:'ひとふでの鍵',maxStrokes:1,start:S(250,500),goal:{x:460,y:500},blocks:[B(0,80,500),B(200,520,500),B(560,600,500)],
  keys:[[30,468]],balls:[{x:140,y:462,r:14}],spikes:[{x:140,y:640,w:120,h:22}],fish:[[140,515]],ink:360};
 D.push({L,fam:()=>{const o=[];for(const d of [22,30,40]) for(const sw of [18,28,38]) o.push([[[82,494],[82+sw,494+d],[198-sw,494+d],[198,494]]]);return o;},naive:[[[82,494],[198,494]]]});}
// 49 降りそそぐウニ + 溶ける線
{const L=cl(by['降りそそぐウニ'].L);L.name='溶けるウニの道';L.melt=60;L.ink=640;const w=winners('降りそそぐウニ');
 D.push({L,fam:()=>{const o=[];for(const s of w)for(const k of [1,2,3,4])o.push([...splitStroke(s[0],k),s[1]]);return o;},naive:w[0]});}
// 50 オーロラの果て: 最後の一筆 + 鍵(スタート背後) + 溶ける線
{const b=cur['最後の一筆'];const L=cl(b.L);L.name='オーロラの果て';delete L.needStars;L.start=S(100,280,-1);L.keys=[[20,248]];L.melt=35;
 const fam=[];for(const ex of [200,215,230,250]) for(const cx of [140,160,190,230]) for(const cy of [380,460,510]) fam.push([r1(bez([143,286],[cx,cy],[ex,514]))]);
 D.push({L,fam:()=>fam,naive:b.sol});}
module.exports=D;
