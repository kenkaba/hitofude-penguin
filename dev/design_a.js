const {PG,B,S,cur,old,bez,r1,range,cross}=require('./lib50.js');
const E=(name,extra)=>{const c=cur[name]||{L:old[name]};const L=Object.assign(JSON.parse(JSON.stringify(c.L)),extra||{});delete L.needStars;return {L,fam:c.sol?[c.sol]:null,naive:c.naive};};
const D=[];
// ---------- W1 氷の入り江 ----------
D.push(E('はじめの一筆'));
D.push(E('ウニの谷'));
D.push({L:{name:'二つの谷',start:S(40,500),goal:{x:545,y:500},blocks:[B(0,150,500),B(250,350,500),B(450,600,500)],fish:[[200,445]],ink:320},
  fam:()=>[494,478,468,458].map(h=>[[[152,494],[200,h],[248,494]],[[352,494],[448,494]]]),breather:true});
D.push(E('ジグザグ'));
D.push(Object.assign(E('ウニのすべり台'),{fam:()=>[[300,300],[320,300],[290,320]].map(c=>[bez([165,250],c,[358,622])]),naive:[[[205,470],[260,530],[330,598],[365,622]]]}));
D.push(E('滝くだり'));
D.push(E('ウニが降ってくる'));
D.push({L:{name:'鍵の橋',hint:'鍵を取ると、消えていた橋が現れる',start:S(180,500,-1),goal:{x:545,y:500},
  blocks:[B(0,70,500),B(130,230,500),B(420,600,500),B(230,420,500,520,{k:'bridge'})],keys:[[30,468]],fish:[[325,470]],ink:150},
  fam:()=>[494,488,500].map(h=>[[[72,494],[100,h],[128,494]]]),naive:[[[232,494],[418,494]]]});
D.push(E('ふりこウニ'));
D.push(E('見張りウニ'));
// ---------- W2 ウニの海 ----------
D.push(E('くぐれ'));
D.push({L:{name:'ウニの行列',start:S(40,560),goal:{x:545,y:560},blocks:[B(0,150,560),B(450,600,560)],
  balls:[{x:220,y:505,dy:45,period:100,phase:0,r:14},{x:300,y:505,dy:45,period:100,phase:2.1,r:14},{x:380,y:505,dy:45,period:100,phase:4.2,r:14}],fish:[[300,628]],ink:460},
  fam:()=>cross([60,75,90],[60,80,100]).map(([d,sw])=>[[[152,554],[152+sw,554+d],[448-sw,554+d],[448,554]]]),naive:[[[152,554],[448,554]]]});
D.push({L:{name:'トゲの階段',start:S(40,160),goal:{x:550,y:760},
  blocks:[B(0,240,160,200),B(200,600,360,400),B(0,400,560,600),B(0,600,760)],spikes:[{x:200,y:749,w:360,h:22}],balls:[{x:575,y:322,r:15},{x:25,y:522,r:15}],fish:[[300,520]],ink:260},
  fam:()=>{const o=[];for(const a of [380,450,520]) for(const b of [65,85,100]) o.push([[[a,358],[a,300]],[[b,558],[b,500]]]);return o;},
  naive:[[[450,358],[450,300]]]});
D.push(E('橋をかけるな'));
D.push(Object.assign(E('ぽよんと着地'),{fam:()=>{const o=[];for(const x0 of [345,352,360,370]) for(const y0 of [365,372,380]) o.push([[[x0,y0],[395,y0+12],[418,y0]]]);return o;},naive:[[[352,372],[418,372]]]}));
D.push({L:{name:'降りそそぐウニ',start:S(40,600),goal:{x:545,y:600},blocks:[B(0,200,600),B(430,600,600)],
  rollers:[{x:250,y:-40,r:15,delay:10},{x:380,y:-40,r:15,delay:70}],fish:[[315,560]],ink:520},
  fam:()=>{const o=[];for(const y0 of [300,340,380]) for(const dy of [60,90]) o.push([[[202,594],[428,594]],[[170,y0],[455,y0+dy]]]);return o;},naive:[[[202,594],[428,594]]]});
D.push({L:{name:'追ってくるウニ',start:S(180,640),goal:{x:545,y:640},blocks:[B(0,100,300,340),B(120,330,640),B(430,600,640)],
  rollers:[{x:50,y:284,r:15,delay:20,vx:4}],fish:[[380,600]],ink:360},
  fam:()=>{const o=[];for(const d of [[[190,360],[50,460]],[[210,400],[60,480]],[[170,340],[40,440]],[[230,440],[70,500]]]) for(const h of [634,610]) o.push([d,[[332,634],[380,h],[428,634]]]);return o;},naive:[[[332,634],[428,634]]]});
D.push(E('ひとふで'));
D.push(E('ウニの番人'));
D.push(E('ぽよん越え'));
module.exports=D;
