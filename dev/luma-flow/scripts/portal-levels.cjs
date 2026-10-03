'use strict';
// Authored transport graphs. The drawing topology and destination relationship
// are deliberately different: delivery, selection, chain, split, crossings.
const B=require('./stage-blueprints.json');
const clone=x=>structuredClone(x);
const portal=(id,x,y,exitX,exitY,r=30)=>({id,x,y,r,exitX,exitY,vx:0,vy:45});
function base(slot,type,name,concept){const l=clone(B[type]);return Object.assign(l,{id:slot,name,chapter:Math.floor((slot-1)/10),worldIndex:Math.floor((slot-1)/3),archetype:'portal-'+concept,puzzleConcept:concept,theme:'night',gravityScale:1,gates:[],switches:[],relays:[],winds:[],drains:[],portals:[],ink:700,maxStrokes:l.solutions.length+1,mechanic:'入口へ水を導くと、同じ記号の出口から流れ出る。',rule:'転送口をつないで、水を器へ届けよう。',hints:['入口と出口の記号を見比べ、水の行き先を先に考えよう。','描いた線は重力で落ちる。入口まで安定した水路を作ろう。']});}
function cup(x,y,target=170,color){return {x,y,w:80,h:85,target,...color?{color}:{}};}
const out=[];
{
 const l=base(7,'basic','壁の向こうへ','deliver-across-partition');
 l.portals=[portal('A',284,381,340,90,38)];l.cups=[cup(340,180)];
 l.platforms.push({x:294,y:160,w:12,h:200});
 l.mechanic='高い壁の向こうには直接届けられない。下の入口へ坂をつなぎ、上の出口へ転送しよう。';
 out.push({slot:7,level:l});
}
{
 const l=base(8,'elbow','近道の行き先','choose-safe-entrance');
 l.portals=[portal('A',300,420,320,95,38),portal('X',116,330,30,475,22)];l.cups=[cup(320,190)];
 l.drains=[{x:30,y:515,w:55,h:10}];
 l.mechanic='近い入口は排水口につながる。出口を確かめ、箱の外を回って正しい入口へ。';
 out.push({slot:8,level:l});
}
{
 const l=base(9,'relay','転送から転送へ','serial-two-hop');
 l.source={x:355,y:60};l.portals=[portal('A',355,110,65,65),portal('B',285,420,260,95,38)];l.cups=[cup(260,180)];
 l.mechanic='最初の出口が次の水源になる。二段の橋で、二つ目の入口までつなごう。';
 out.push({slot:9,level:l});
}
{
 const l=base(22,'beltChallenge','出口の向きを逆算','catch-horizontal-exit-and-return');
 l.source={x:355,y:55};l.platforms=l.platforms.filter(p=>p.material!=='conveyor');
 l.portals=[{...portal('A',355,105,210,180,32),vx:80,vy:0}];
 l.mechanic='出口から水は右へ飛び出す。描いた坂で受け止め、左下の器へ折り返そう。';
 out.push({slot:22,level:l});
}
{
 const l=base(23,'arms','離れた出口の橋','catch-two-separated-exits');
 delete l.sources;l.source={x:195,y:60,spread:36};
 l.portals=[portal('A',179,125,150,65,18),portal('B',211,125,240,65,18)];l.cups.forEach(c=>c.target=90);
 l.mechanic='隣り合う入口が、左右に離れた出口につながる。出口の先へ二本の受け橋を組もう。';
 out.push({slot:23,level:l});
}
{
 const l=base(24,'arms','色を交差させろ','colored-crossing-without-mixing');
 l.sources[0].color='cyan';l.sources[1].color='magenta';
 l.portals=[portal('A',70,355,310,55,30),portal('B',320,355,80,55,30)];l.cups=[cup(80,110,100,'magenta'),cup(310,110,100,'cyan')];
 l.mechanic='器は同じ色の水だけを集める。転送口の交差を使って、色を混ぜずに送り分けよう。';
 out.push({slot:24,level:l});
}
{
 const l=base(46,'relay','途中で空間を飛ぶ','interrupted-route-rejoin');
 l.portals=[portal('A',132,281,188,110,20),portal('B',285,420,310,95,38)];l.cups=[cup(310,185)];
 l.relays=[{id:'R1',x:188,y:180,r:28,minHits:3,required:true,gates:['P1']}];l.gates=[{id:'P1',x:310,y:209,w:68,h:8}];
 l.mechanic='一つ目の橋の後で水が上へ戻る。転送先のリレーを通し、二つ目の橋で最後の入口へ。';
 out.push({slot:46,level:l});
}
{
 const l=base(47,'hook','吊り橋の転送先','counterweight-before-return');
 l.source={x:230,y:60};l.portals=[portal('A',230,110,115,65),portal('B',300,420,330,90,38)];l.cups=[cup(330,180)];
 l.mechanic='出口の下には片側だけの支え。線の反対側にも重さを作り、次の入口へ橋を保とう。';
 out.push({slot:47,level:l});
}
{
 const l=base(48,'split','分けてから転送','split-before-separated-portals');
 l.portals=[portal('A',70,350,85,55,30),portal('B',320,350,305,55,30)];l.cups=[cup(85,110,110),cup(305,110,110)];
 l.platforms.push({x:195,y:400,w:20,h:120});
 l.mechanic='二つの出口は別々の器へ。一つの流れを入口より前で分け、同時に二つの回路を満たそう。';
 out.push({slot:48,level:l});
}
for(const {level:l} of out){l.parInk=Math.ceil(l.solutions.reduce((n,p)=>n+p.slice(1).reduce((a,v,i)=>a+Math.hypot(v.x-p[i].x,v.y-p[i].y),0),0));l.ink=Math.ceil(l.parInk*1.5/10)*10;l.essentialStrokes=l.solutions.map((_,i)=>i);l.hints=[l.mechanic,l.hints[1]];l.puzzleConcept=l.mechanic;l.worldName=require('../dist/worlds.js')[l.worldIndex].name;}
module.exports=out;
