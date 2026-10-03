'use strict';
// Nine colour-routing puzzles. Rectangles use centre coordinates; authored
// strokes start above their two supporting contact points and fall on release.
const point=(x,y)=>({x,y});
const source=(x,y,color,extra={})=>({x,y,color,...extra});
const cup=(x,y,color,w=84,h=85,target=120)=>({x,y,w,h,target,color});
function ramp(a,b,options={}){
 const width=options.width||24,height=16,drop=options.drop??24,dx=b[0]-a[0],dy=b[1]-a[1];
 const platforms=(options.contacts||[.22,.73]).map(t=>({x:a[0]+dx*t-Math.sign(dx)*width/2,y:a[1]+dy*t+4+height/2,w:width,h:height}));
 return {platforms,stroke:[point(a[0],a[1]-drop),point(b[0],b[1]-drop)]};
}
function build(slot,name,concept,sources,cups,ramps,extra={}){
 const solutions=ramps.map(r=>r.stroke),platforms=ramps.flatMap(r=>r.platforms);
 const l={id:slot,name,chapter:Math.floor((slot-1)/10),worldIndex:Math.floor((slot-1)/3),theme:'night',archetype:'color-routing',
  source:sources[0],sources,cups,platforms,solutions,gravityScale:1,total:480,rate:60,gates:[],switches:[],relays:[],drains:[],winds:[],
  puzzleConcept:concept,mechanic:'シアンの水はシアンの器へ、アンバーの水はアンバーの器へ。違う色の水は充電に使えません。',
  rule:'色とマークが同じ器へ、両方の水を届けよう。',hints:[concept,'水源と器の色・マークを照合し、落ちた後の線の位置を考えよう。'],...extra};
 const len=p=>p.slice(1).reduce((n,b,i)=>n+Math.hypot(b.x-p[i].x,b.y-p[i].y),0);
 l.parInk=Math.ceil(l.solutions.reduce((n,p)=>n+len(p),0));l.ink=Math.ceil(l.parInk*1.42/10)*10;
 l.maxStrokes=extra.maxStrokes||Math.min(5,l.solutions.length+1);l.essentialStrokes=l.solutions.map((_,i)=>i);
 return {slot,level:l};
}
const entries=[];
entries.push(build(25,'色の宛先','中央から外側へ。二本の坂を別々に支え、それぞれ同じ色の器へ送ろう。',
 [source(145,65,'cyan'),source(245,65,'amber')],[cup(75,410,'cyan'),cup(315,410,'amber')],
 [ramp([175,220],[75,432]),ramp([215,220],[315,432])]));
entries.push(build(26,'交差する信号','飛び出した二色は空中で交差する。交差した後の左右に、受け坂を置こう。',
 [source(120,65,'cyan',{vx:160,vy:20}),source(270,65,'amber',{vx:-160,vy:20})],
 [cup(335,400,'cyan',78),cup(55,400,'amber',78)],
 [ramp([180,230],[55,422],{contacts:[.1,.73]}),ramp([210,230],[335,422],{contacts:[.1,.73]})]));
entries.push(build(27,'上便と下便','上のシアンを高い器へ。下から出るアンバーは、その水路の下を通して左へ送ろう。',
 [source(70,65,'cyan'),source(200,345,'amber')],[cup(310,310,'cyan',84,78),cup(85,475,'amber',90,70)],
 [ramp([45,165],[310,326]),ramp([235,398],[85,488])]));
entries.push(build(34,'隔壁の両側','壁の左右で水を分けたまま、内側の器へ折り返そう。右の器は一段低い。',
 [source(65,65,'cyan'),source(330,65,'amber')],[cup(135,405,'cyan',76),cup(260,470,'amber',76,70)],
 [ramp([35,240],[135,428]),ramp([345,260],[260,493])],
 {platforms:[...ramp([35,240],[135,428]).platforms,...ramp([345,260],[260,493]).platforms,{x:195,y:285,w:28,h:350}]}));
entries.push(build(35,'折り返しの色分け','シアンは壁で折り返し、下の橋でもう一度受ける。アンバーの短い道と交わらせないように。',
 [source(120,65,'cyan'),source(270,65,'amber')],[cup(75,480,'cyan',78,60),cup(315,430,'amber',84,85)],
 [ramp([35,130],[155,280]),ramp([218,390],[75,498]),ramp([240,280],[315,452])],
 {platforms:[...ramp([35,130],[155,280]).platforms,...ramp([218,390],[75,498]).platforms,...ramp([240,280],[315,452]).platforms,{x:205,y:285,w:12,h:150}]}));
entries.push(build(36,'上下二段の端末','同じ右側でも送り先は上下別々。アンバーは上へ、シアンは上の端末の下をくぐらせよう。',
 [source(60,65,'cyan'),source(210,65,'amber')],[cup(300,450,'cyan',84,85),cup(300,270,'amber',84,72)],
 [ramp([35,259],[300,470]),ramp([185,145],[305,292])]));
entries.push(build(43,'非対称の交差点','高さと勢いの違う二色が交差する。アンバーは高い左の器、シアンは低い右の器へ。',
 [source(80,65,'cyan',{vx:200,vy:0}),source(310,200,'amber',{vx:-230,vy:-170})],
 [cup(345,475,'cyan',76,65),cup(50,320,'amber',74,100)],
 [ramp([180,235],[50,340],{contacts:[.22,.95]}),ramp([235,310],[345,497])]));
{
 const roof={stroke:[point(350,271),point(230,291),point(75,462)],platforms:[{x:322,y:313.7,w:24,h:16},{x:147,y:431.8,w:24,h:16}]};
 entries.push(build(44,'違う色を通さない屋根','シアンの水源は端末のすぐ上。先にアンバーを左へ逃がす屋根を作り、鍵でシアンの隔壁を開こう。',
  [source(300,365,'cyan'),source(330,65,'amber')],[cup(300,400,'cyan'),cup(75,465,'amber',84,70)],
  [{stroke:[point(177,85),point(213,85)],platforms:[]},roof],
  {gates:[{id:'C',x:300,y:425,w:70,h:8}],switches:[{x:195,y:135,w:38,gate:'C',minLength:27}],
   hints:['アンバー用の屋根は、シアンの水源より上に。違う色が端末へ落ちるのを防ごう。','中央の鍵は短い重しで押せます。シアンは屋根の下から流れます。']}));
}
{
 const vertices=[[30,220],[110,445],[195,270],[280,445],[360,220]],stroke=vertices.map(([x,y])=>point(x,y-24));
 const platforms=[{x:48,y:316.375,w:24,h:16},{x:157,y:384.94,w:24,h:16},{x:233,y:384.94,w:24,h:16},{x:342,y:316.375,w:24,h:16}];
 entries.push(build(45,'一筆で二つの谷','一筆だけで二色を受ける。二つの谷をつなぎ、谷底をそれぞれの器の中へ入れよう。',
  [source(50,65,'cyan'),source(340,65,'amber')],[cup(110,385,'cyan',84,100),cup(280,385,'amber',84,100)],
  [{stroke,platforms}],{maxStrokes:1,hints:['一本の線に二つの谷を作ると、色を混ぜずに受け止められます。','谷底を器の中まで下げ、両端と中央を足場で支えよう。']}));
}
module.exports=entries;
