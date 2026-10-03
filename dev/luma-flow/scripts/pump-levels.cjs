'use strict';
// Authored pump chapters. Drawing routes feed low intakes; powered outlets supply upper receivers.
const B=require('./stage-blueprints.json');
const defs=[
 [16,'basic','地下水を屋上へ','low-to-high','低い吸入口へ坂を架け、屋上のタンクへ汲み上げる。'],
 [17,'drain','漏れる配管の給水所','bridge-over-drain','排水溝の上を橋でつなぎ、失われる水をポンプへ届ける。'],
 [18,'arms','二棟を同時に起動','dual-intakes','一つの流れを二つの吸入口へ分け、左右の建物を満たす。'],
 [28,'relay','二段揚水塔','serial-pumps','二本の橋で下段ポンプへ供給し、中継ポンプを順に起動する。'],
 [29,'arms','交差する給水管','cross-feed','二つの水源を別々の吸入口へ導く。配管は反対側のタンクにつながる。'],
 [30,'elbow','ポンプで解く隔壁','pump-relay-gate','壁を迂回してポンプを起動。その吐出水で上層の隔壁を開く。'],
 [40,'hook','吊り配管の屋上駅','hook-intake','重心を保つフックで水路を支え、低いポンプから屋上へ届ける。'],
 [41,'channel','開門してから汲み上げろ','switch-before-pump','先に水路の隔壁を解錠し、出口に描いた橋でポンプを起動する。'],
 [42,'split','負荷の違うふたつの塔','unequal-distribution','右のタンクは左より多くの水を必要とする。分岐位置で供給比率を考える。']
];
module.exports=defs.map(([slot,type,name,concept,description])=>{
 const l=structuredClone(B[type]);const oldCups=l.cups;delete l.relayCalibration;delete l.hint;delete l.target;
 l.id=slot;l.name=name;l.archetype='pump-'+concept;l.mechanic='pump';l.puzzleConcept=concept;l.chapter=Math.floor((slot-1)/10);l.theme='night';
 l.gates=l.gates||[];l.switches=l.switches||[];l.drains=l.drains||[];l.winds=[];l.relays=[];
 l.cups=oldCups.map((c,i)=>({x:oldCups.length>1?(i?324:66):(type==='channel'?60:300),y:135,w:82,h:82,target:oldCups.length>1?100:170}));
 l.pumps=oldCups.map((c,i)=>{const target=l.cups[type==='arms'?1-i:i];return{id:'P'+(i+1),x:c.x,y:c.y+24,r:28,capacity:16,exitX:target.x,exitY:target.y-30,vx:0,vy:25};});
 if([16,18,30].includes(slot)){
  l.cups=structuredClone(oldCups);l.cups.forEach(c=>c.target=oldCups.length>1?95:165);
  const outputs=structuredClone(l.sources||[l.source]);
  l.sources=outputs.map(s=>({x:s.x,y:480,spread:4}));l.source=l.sources[0];
  l.pumps=outputs.map((s,i)=>({id:'P'+(i+1),x:s.x,y:530,r:27,capacity:16,exitX:s.x,exitY:s.y+17,vx:0,vy:25}));
  l.puzzleConcept=slot===16?'catch-pump-output':slot===18?'route-two-powered-outputs':'output-unlocks-downstream';
  l.rule=slot===16?'下から汲み上げた水を、上の吐出口からタンクへ導こう。':slot===18?'二つのポンプの吐出口に、別々の受け坂を作ろう。':'汲み上げた水を壁の外へ導き、下流の隔壁を開こう。';
 }
 // The old cup's pedestal is unnecessary: the input is an intake, not a reservoir.
 if(slot===28){l.cups=structuredClone(oldCups);l.cups[0].target=150;l.source={x:65,y:480};l.pumps=[{id:'P1',x:65,y:530,r:27,capacity:16,exitX:65,exitY:82,vx:0,vy:25},{id:'P2',x:133,y:285,r:27,capacity:20,exitX:130,exitY:305,vx:15,vy:25}];}
 if([16,18,28,30].includes(slot)){for(const src of l.sources||[l.source])l.drains.push({x:src.x,y:445,w:38,h:10});}
 if(slot===30){l.relays=[{id:'R1',x:240,y:355,r:24,minHits:4,required:true,gates:['TOP']}];l.gates.push({id:'TOP',x:300,y:421,w:74,h:8,relayGate:true});}
 if([29,42].includes(slot)){l.pumps.forEach((p,i)=>{p.x=i?318:72;p.y=346;p.r=28;});}
 if(slot===42){l.source.x+=3;l.cups[0].target=85;l.cups[1].target=120;}
 l.solutions=l.solutions.map(ps=>ps.map(p=>({...p})));l.parInk=Math.ceil(l.solutions.reduce((sum,ps)=>sum+ps.slice(1).reduce((v,p,i)=>v+Math.hypot(p.x-ps[i].x,p.y-ps[i].y),0),0));
 l.ink=Math.ceil(l.parInk*1.65/10)*10;l.maxStrokes=Math.min(5,l.solutions.length+1);l.total=oldCups.length>1?420:400;l.rate=75;
 l.essentialStrokes=l.solutions.map((_,i)=>i);l.rule=l.rule||description;l.hints=[l.rule,type==='channel'?'小さな重しで隔壁を開けてから、下の出口と吸入口をつなごう。':type==='split'?'山形の線で左右へ分けよう。山の頂点を動かすと流量が変わる。':type==='arms'?'二つの橋が必要。左の吸入口は右のタンクへ、右は左へ送る。':'ポンプは水をためると動き始めます。吸入口へ向かう坂の支えを考えよう。'];
 return{slot,level:l};
});
