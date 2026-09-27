const {PG,B,S,cur,old,bez,r1,range,cross}=require('./lib50.js');
const E=(name,extra)=>{const c=cur[name]||{L:old[name]};const L=Object.assign(JSON.parse(JSON.stringify(c.L)),extra||{});delete L.needStars;return {L,fam:c.sol?[c.sol]:null,naive:c.naive};};
const D=[];
// ---------- W3 風と氷 ----------
D.push(E('上昇気流'));
D.push({L:{name:'風に乗れ',hint:'青い矢印の風は、ペンギンを横に押し流す',start:S(40,460),goal:{x:545,y:560},blocks:[B(0,160,460),B(430,600,560)],
  fans:[{x:295,y:385,w:270,h:270,wx:0.22}],fish:[[300,300]],ink:200},
  fam:()=>cross([220,250,280,320],[340,380,420]).map(([x,y])=>[[[162,454],[x,y]]]),naive:[[[162,454],[428,554]]],breather:true});
D.push(E('崩れる橋'));
D.push({L:{name:'わざと落ちる',start:S(40,200),goal:{x:550,y:760},blocks:[B(0,120,200,240),B(0,600,760)],
  crumbles:[0,1,2,3,4].map(i=>({x:168+96*i,y:410,w:94,h:20})),spikes:[{x:270,y:749,w:300,h:22}],fish:[[300,560]],ink:420},
  fam:()=>{const o=[];for(const sx of [140,180,220]) for(const c of [[300,520],[260,600],[350,560]]) for(const ex of [440,470]) o.push([r1(bez([sx,450],c,[ex,748]))]);return o;},
  naive:[[[122,398],[598,398]]]});
D.push(Object.assign(E('描けない空',{balls:[]}),{fam:()=>[[[[165,216],[169,239],[174,260],[179,279],[184,296],[189,312],[195,326],[201,339],[206,350],[213,359],[219,367],[226,372],[233,377],[240,379],[247,380]]]].concat(cross([380,400,420],[175,195]).map(([ey,cx])=>[r1(bez([165,216],[cx,ey],[247,ey]))])),naive:[[[165,216],[172,270],[182,320],[196,365],[215,395],[235,402],[247,398]]]}));
D.push(Object.assign(E('ブースト'),{fam:()=>cross([10,14,18],[40,48,56]).map(([a,l])=>[[[282,496],[Math.round(282+Math.cos(a*Math.PI/180)*l),Math.round(496-Math.sin(a*Math.PI/180)*l)]]]),naive:[[[282,496],[298,488],[312,476]]]}));
D.push({L:{name:'向かい風',start:S(40,500),goal:{x:545,y:500},blocks:[B(0,180,500),B(420,600,500)],
  fans:[{x:290,y:440,w:180,h:120,wx:-0.32}],fish:[[300,590]],ink:420},
  fam:()=>cross([60,80,100],[30,40,55]).map(([d,sw])=>[[[182,494],[182+sw,494+d],[418-sw,494+d],[418,494]]]),naive:[[[182,494],[418,494]]]});
D.push({L:{name:'崩れる鍵台',start:S(40,250),goal:{x:550,y:760},blocks:[B(0,160,250,290),B(0,600,760)],
  crumbles:[{x:250,y:420,w:100,h:20}],keys:[[252,388]],spikes:[{x:250,y:749,w:300,h:22}],fish:[[330,560]],ink:380},
  fam:()=>{const o=[];for(const sx of [200,230,260]) for(const c of [[300,560],[340,520],[280,620]]) for(const ex of [420,440]) o.push([r1(bez([sx,470],c,[ex,748]))]);return o;},
  naive:[[[162,262],[440,748]]],breather:true});
D.push({L:{name:'ウニと風',start:S(40,460),goal:{x:545,y:560},blocks:[B(0,160,460),B(430,600,560)],
  fans:[{x:295,y:385,w:270,h:270,wx:0.22}],balls:[{x:300,y:380,r:15},{x:300,y:300,r:15}],fish:[[290,432]],ink:200},
  fam:()=>cross([200,220,250,280,320],[330,350,380,400,420,440]).map(([x,y])=>[[[162,454],[x,y]]]),naive:[[[162,454],[250,380]]]});
D.push(Object.assign(E('最後の一筆'),{fam:()=>{const f=[];for(const ex of [200,215,230,250]) for(const cx of [140,160,190,230,280]) for(const cy of [300,380,460,510]) f.push([r1(bez([143,286],[cx,cy],[ex,514]))]);return f;}}));
D[D.length-1].L.name='氷河の一筆';
module.exports=D;
