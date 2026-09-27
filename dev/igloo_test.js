const PG=require('./core.js');
function sim(L,setup,frames=900){const w=PG.makeWorld(L);setup&&setup(w);w.state='run';for(let i=0;i<frames&&w.state==='run';i++)PG.step(w);return w;}
const flat=door=>({start:{x:60,y:584,dir:1},goal:{x:door===1?90:510,y:600,door},blocks:[{x:300,y:750,w:600,h:300}],fish:[],ink:100,par:100});
let ok=0,ng=0;const T=(name,cond)=>{console.log((cond?'OK  ':'NG  ')+name);cond?ok++:ng++;};
// 1 walk into front door (left-facing)
T('正面から歩いて入る → ゴール', sim(flat(-1)).state==='win');
// 2 approach from the back: start right of igloo walking left
{const L=flat(-1);L.start={x:590,y:584,dir:-1};const w=sim(L,null,300);T('裏側から歩いて来る → ゴールしない', w.state!=='win');}
// 3 drop from above onto dome
for(const dx of [-10,0,10,20,30]){const L=flat(-1);const ig=PG.igloo(L.goal);L.start={x:ig.cx+dx,y:420,dir:1};const w=sim(L,null,200);T('真上から落下(dx='+dx+') → 屋根で止まり即ゴールしない', w.frame>=200||w.state!=='win'?true:false);}
// 3b drop onto top, then whatever happens, if win must be via door: check the penguin x was in front of door right before
// 4 fall straight into doorway zone from above the porch roof
{const L=flat(-1);const ig=PG.igloo(L.goal);L.start={x:(ig.outerX+ig.roofX)/2,y:420,dir:1};const w=PG.makeWorld(L);w.state='run';let entered=false;for(let i=0;i<60;i++){PG.step(w);if(w.state==='win'){entered=true;break;}}T('ひさしの上に落ちる → すぐにはゴールしない', !entered);}
// 5 right-facing door, penguin coming from the right
{const L=flat(1);L.start={x:560,y:584,dir:-1};T('右向きの入口に右から入る → ゴール', sim(L).state==='win');}
{const L=flat(1);L.start={x:20,y:584,dir:1};const w=sim(L,null,300);T('右向き入口の裏から来る → ゴールしない', w.state!=='win');}
// 6 fast slide into door
{const L=flat(-1);const w=sim(L,w=>{w.p.vx=12;});T('高速で滑り込む → ゴール', w.state==='win');}
// 7 cannot draw inside dome or under porch
{const L=flat(-1);const w=PG.makeWorld(L);const ig=PG.igloo(L.goal);T('ドーム内に線を描けない', !PG.canPlace(w,ig.cx,ig.y-20)&&!PG.canPlace(w,ig.cx+20,ig.y-10)&&!PG.canPlace(w,(ig.outerX+ig.roofX)/2,ig.y-10));
 T('入口の前には描ける', PG.canPlace(w,ig.outerX-20,ig.y-10));}
// 8 every level: can the penguin reach the sensor only via door? check sensor lies strictly inside igloo footprint
for(const [i,L] of PG.LEVELS.entries()){const ig=PG.igloo(L.goal);const inside=ig.sensor.x0>=Math.min(ig.outerX,ig.cx-46)&&ig.sensor.x1<=ig.cx+46;T(`${i+1}面 判定領域がかまくら内部`, inside);}
// 9 igloo within screen & sits on a block top
for(const [i,L] of PG.LEVELS.entries()){const ig=PG.igloo(L.goal);const onBlock=(L.blocks||[]).some(b=>Math.abs((b.y-b.h/2)-L.goal.y)<1&&ig.outerX>=b.x-b.w/2-30);T(`${i+1}面 かまくらが足場の上`, onBlock);}
console.log(ok,'OK /',ng,'NG');
// keys & gate
{const L=flat(-1);L.keys=[[20,570]];L.start={x:200,y:584,dir:1};const w=PG.makeWorld(L);w.state='run';let turned=false,won=false;for(let i=0;i<1400&&w.state==="run";i++){PG.step(w);if(w.p.dir===-1&&!w.keys[0])turned=true;}
 T('鍵なしで扉に当たる → 折り返す', turned); T('鍵を取って戻る → ゴール', w.state==='win'&&w.keys[0]);}
{const L=flat(-1);L.keys=[[20,300]];L.start={x:200,y:584,dir:1};const w=sim(L,null,900);T('鍵が取れない → ゴールしない', w.state!=='win');}
{let bad=0;const L=flat(-1);L.keys=[[20,200]];const ig=PG.igloo(L.goal);for(let k=0;k<800;k++){const w=PG.makeWorld(L);w.p.x=ig.cx-120+Math.random()*190;w.p.y=300+Math.random()*250;w.p.vx=(Math.random()-.5)*16;w.p.vy=(Math.random()-.7)*12;if(Math.hypot(w.p.x-ig.cx,w.p.y-ig.y)<80&&w.p.y>ig.y-60)continue;w.state='run';for(let i=0;i<400&&w.state==='run';i++)PG.step(w);if(w.state==='win')bad++;}
 T('鍵なしランダム投入800回で侵入0', bad===0);}
console.log(ok,'OK /',ng,'NG (追加分込み)');
