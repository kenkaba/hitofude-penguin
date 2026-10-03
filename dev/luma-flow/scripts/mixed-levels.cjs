'use strict';
const B=require('./stage-blueprints.json');
const defs=[
 [14,'beltChallenge','物流棟の屋上へ','belt-to-lift','ベルトで送られた水を折り返し、低いポンプへ集めて屋上へ送ろう。'],
 [15,'rubberChallenge','跳ねて、跳んで、昇る','bounce-warp-pump','反射板の跳ね返りを坂で受ける。その先は転送口と揚水ポンプの直列配管。'],
 [19,'iceChallenge','氷上の遠隔給水','slide-unlock-remote','氷の上を線ごと滑らせてリレーへ水を通す。開いた先の転送口が遠い器へつながる。'],
 [20,'split','異なる速さの二系統','split-warp-and-storage','左はすぐ転送、右はためてから揚水。一つの流れを二つの入口へ分けよう。'],
 [21,'arms','二色の立体交差','colored-mixed-crossing','水の色は機械を通っても変わらない。二本の坂と異なる輸送装置で、反対側の同色タンクへ。'],
 [31,'relay','中継塔の三段配送','bridges-pump-warp','上の橋から下の橋へ落とし、地下ポンプから転送口へ。配管の順序を読み解こう。'],
 [32,'drain','重力炉の漏水修理','heavy-gravity-drain-pump','強い重力で水が切れ目から落ちる。排水溝の上に橋を架け、ポンプまでつなごう。'],
 [33,'hook','吊り配管の帰還便','counterweight-return-pump','片側の支えにフックを掛ける。下の転送口で対岸へ送った水を、ポンプで上の器へ戻そう。'],
 [37,'channel','解錠から始まる揚水','weight-gate-warp-pump','最初の小さな重しで隔壁を開ける。出口の橋、転送口、ポンプを一本の流れにつなごう。'],
 [38,'balance','釣り合う転送橋','warp-balance-pump','最初の出口は支えの左上。坂の左右を釣り合わせ、下のポンプへ送ろう。'],
 [39,'arms','二色の二段揚水','colored-two-stage-pumps','左右の色を混ぜずに下段ポンプへ。反対側の中継ポンプを経て、同色の器を満たそう。']
];
const out=defs.map(([slot,type,name,concept,rule])=>{
 const l=structuredClone(B[type]),old=structuredClone(l.cups);l.id=slot;l.name=name;l.puzzleConcept=concept;l.archetype='mixed-'+concept;l.chapter=Math.floor((slot-1)/10);l.worldIndex=Math.floor((slot-1)/3);l.theme='night';l.mechanic='mixed';l.rule=rule;l.hints=[rule,'水源→描いた線→入口→出口→タンクの順に、流れをたどってみよう。'];l.portals=[];l.pumps=[];l.gates=l.gates||[];l.relays=l.relays||[];l.drains=l.drains||[];
 l.cups=old.map((c,i)=>({x:old.length>1?(i?325:65):type==='channel'?55:325,y:100,w:76,h:70,target:old.length>1?85:140}));
 const warp=(id,x,y,exitX,exitY,r=30)=>({id,x,y,r,exitX,exitY,vx:0,vy:35});
 const pump=(id,x,y,exitX,exitY,r=30)=>({id,x,y,r,capacity:18,exitX,exitY,vx:0,vy:35});
 const addPump=(c,i)=>l.pumps.push(pump('U'+i,c.x,c.y+24,l.cups[i].x,65,50));
 if(slot===14){addPump(old[0],0);l.relays=[{id:'ROOF',x:130,y:420,r:30,minHits:3,required:true,gates:['TOP']}];l.gates.push({id:'TOP',x:325,y:119,w:65,h:8});}
 if(slot===15){l.portals.push(warp('A',old[0].x,old[0].y+18,350,230,52));l.pumps.push(pump('U',350,280,325,65,24));}
 if(slot===19){l.portals.push(warp('A',old[0].x,old[0].y+24,325,65,52));l.cups[0].target=100;}
 if(slot===20){l.portals.push(warp('A',72,346,65,65,28));l.pumps.push(pump('U',318,346,325,65,28));}
 if(slot===21){l.sources[0].color='cyan';l.sources[1].color='amber';l.cups[0].color='amber';l.cups[1].color='cyan';l.portals.push(warp('A',72,346,325,65,28));l.pumps.push(pump('U',318,346,65,65,28));}
 if(slot===31){l.pumps.push(pump('U',old[0].x,old[0].y+24,325,210));l.portals.push(warp('A',325,260,325,65,24));}
 if(slot===32){l.gravityScale=1.5;addPump(old[0],0);}
 if(slot===33){l.portals.push(warp('A',old[0].x,old[0].y+24,350,225));l.pumps.push(pump('U',350,280,325,65,24));}
 if(slot===37){l.portals.push(warp('A',old[0].x,old[0].y+24,55,235));l.pumps.push(pump('U',55,295,55,65,25));}
 if(slot===38){const src=l.source;l.source={x:355,y:210};l.portals.push(warp('A',355,260,src.x,src.y+17,24));addPump(old[0],0);}
 if(slot===39){l.sources[0].color='cyan';l.sources[1].color='amber';l.cups[0].color='amber';l.cups[1].color='cyan';l.pumps=[pump('L',72,346,350,225,28),pump('R',318,346,40,225,28),pump('L2',350,275,325,65,23),pump('R2',40,275,65,65,23)];}
 l.total=old.length>1?440:420;l.rate=75;l.maxStrokes=Math.min(5,l.solutions.length+1);l.parInk=Math.ceil(l.solutions.reduce((n,ps)=>n+ps.slice(1).reduce((k,p,i)=>k+Math.hypot(p.x-ps[i].x,p.y-ps[i].y),0),0));l.ink=Math.ceil(l.parInk*1.6/10)*10;l.essentialStrokes=l.solutions.map((_,i)=>i);return{slot,level:l};
});
module.exports=out;
