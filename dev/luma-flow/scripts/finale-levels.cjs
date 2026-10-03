'use strict';
const B=require('./stage-blueprints.json');
function base(slot,name,concept){const l=structuredClone(B.relay);Object.assign(l,{id:slot,name,chapter:4,worldIndex:16,theme:'night',archetype:'finale-'+concept,puzzleConcept:concept,mechanic:'揚水・転送・分流を組み合わせ、都市の最後の電源を復旧する。',gravityScale:1,gates:[],switches:[],relays:[],winds:[],drains:[],pumps:[],portals:[],total:420,rate:60});l.cups.forEach(c=>c.target=90);return l;}
const out=[];
{
 const l=base(49,'地下から二つの空へ','lift-teleport-then-divide');
 l.cups=structuredClone(B.split.cups);l.cups.forEach(c=>c.target=105);l.platforms=structuredClone(B.split.platforms);l.solutions=structuredClone(B.split.solutions);
 l.source={x:355,y:480,spread:4};
 l.pumps=[{id:'U1',x:355,y:530,r:25,capacity:18,exitX:355,exitY:65,vy:25}];
 l.portals=[{id:'P1',x:355,y:115,r:23,exitX:195,exitY:82,vx:0,vy:25,exitSpread:40}];
 l.drains=[];
 l.gates=[{id:'A',x:195,y:145,w:120,h:12}];l.switches=[{x:333,y:180,w:38,gate:'A',minLength:27}];l.solutions.unshift([{x:312,y:150},{x:351,y:150}]);
 l.rule='重しで開門。地下の水を汲み上げ、転送の先で左右へ分けよう。';
 l.hints=['水の順番は地下のポンプ→右上の転送口→中央の出口。出口の先から考えよう。','中央から落ちる水を二方向へ。一つの山形を左右の支えで受け止めよう。'];
 out.push({slot:49,level:l});
}
{
 const l=base(50,'都市再起動・三つの仕事','unlock-feed-and-catch');
 l.source={x:65,y:65,spread:5};
 l.cups[0].target=155;l.mechanic='重し・給水坂・受け坂の三つの役割をつなぐ。';
 l.gates=[{id:'A',x:355,y:92,w:46,h:12}];
 l.switches=[{x:333,y:155,w:38,gate:'A',minLength:27}];
 l.pumps=[{id:'U1',x:135,y:286,r:27,capacity:18,exitX:355,exitY:50,vx:0,vy:25}];
 l.portals=[{id:'P1',x:355,y:130,r:18,exitX:130,exitY:305,vx:0,vy:25}];
 l.solutions=[[{x:312,y:105},{x:351,y:105}],structuredClone(B.relay.solutions[0]),structuredClone(B.relay.solutions[1])];
 l.rule='重しで開門、坂で揚水、転送先で受け止める。三つの役割を組み立てよう。';
 l.hints=['右のボタンが右上の扉を開く。左上の水を低いポンプへ送り、扉の先の転送口につなごう。','短い重し・ポンプへの給水坂・転送出口の受け坂。三本がそれぞれ別の仕事をする。'];
 out.push({slot:50,level:l});
}
for(const {level:l} of out){l.parInk=Math.ceil(l.solutions.reduce((n,ps)=>n+ps.slice(1).reduce((v,p,i)=>v+Math.hypot(p.x-ps[i].x,p.y-ps[i].y),0),0));l.ink=Math.ceil(l.parInk*1.45/10)*10;l.maxStrokes=l.solutions.length+1;l.essentialStrokes=l.solutions.map((_,i)=>i);}
module.exports=out;
