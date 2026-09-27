const {PG,B,S,cur,old,bez,r1,range,cross}=require('./lib50.js');
const D=[];
const split=(x0,x1,y,k,gap=6)=>{const o=[];const w=(x1-x0-(k-1)*gap)/k;for(let i=0;i<k;i++){const a=x0+i*(w+gap);o.push([[Math.round(a),y],[Math.round(a+w),y]]);}return o;};
// ---------- W4 ふしぎな穴 ----------
D.push({L:{name:'ワープ',hint:'青い穴に入ると、もう一方の穴から出てくる',start:S(40,500),goal:{x:545,y:300},blocks:[B(0,200,500),B(420,600,300)],
  portals:[{a:[300,600],b:[470,270]}],fish:[[250,560]],ink:300},
  fam:()=>{const o=[];for(const c of [[240,540],[220,600],[260,520]]) for(const e of [[280,615],[290,625],[275,605]]) o.push([r1(bez([202,494],c,e))]);return o;},
  naive:[[[202,494],[418,494]]]});
D.push({L:{name:'穴から穴へ',start:S(40,500),goal:{x:545,y:700},blocks:[B(0,240,500),B(420,600,700)],
  portals:[{a:[200,484],b:[330,250]}],balls:[{x:370,y:480,r:15}],fish:[[360,280]],ink:440},
  fam:()=>{const o=[];for(const sx of [336,346]) for(const c of [[340,420],[330,520],[300,560],[390,600]]) for(const ey of [694,680]) o.push([r1(bez([sx,296],c,[418,ey]))]);return o;},
  naive:[[[300,300],[418,694]]]});
D.push({L:{name:'溶ける氷',hint:'この面の線は、ペンギンが乗ると少しして溶ける',melt:45,start:S(40,500),goal:{x:545,y:500},blocks:[B(0,180,500),B(420,600,500)],fish:[[300,470]],ink:320},
  fam:()=>[1,2,3,4,5,6].map(k=>split(182,418,494,k)),naive:[[[182,494],[418,494]]]});
D.push({L:{name:'一度きりの道',melt:45,start:S(380,460,-1),goal:{x:550,y:760},blocks:[B(0,100,460),B(220,420,460,500),B(0,600,760)],
  keys:[[40,428]],spikes:[{x:150,y:749,w:300,h:22}],fish:[[196,565]],ink:480},
  fam:()=>{const o=[];for(const k of [2,3]) for(const c of [[180,560],[220,640],[260,600]]) o.push(split(102,218,454,k).concat([r1(bez([108,520],c,[330,748]))]));return o;},
  naive:[[[102,454],[218,454]],[[108,520],[330,748]]]});
D.push({L:{name:'消える床',hint:'鍵を取ると、うすい氷の床が消える',start:S(40,460),goal:{x:90,y:760,door:1},
  blocks:[B(0,150,460,500),B(150,420,460,480,{k:'wall'}),B(420,600,460,500),B(0,600,760)],keys:[[560,428]],spikes:[{x:365,y:749,w:150,h:22}],fish:[[330,650]],ink:420},
  fam:()=>{const o=[];for(const y of [520,560]) for(const c of [[330,735],[310,748],[350,720]]) for(const ex of [255,270]) o.push([r1(bez([410,y],c,[ex,752]))]);return o;},
  naive:[]});
D.push({L:{name:'ワープとウニ',start:S(40,600),goal:{x:545,y:600},blocks:[B(0,200,600),B(420,600,600)],
  rollers:[{x:80,y:-40,r:15,delay:5}],portals:[{a:[80,160],b:[270,300]}],fish:[[310,560]],ink:440},
  fam:()=>{const o=[];for(const d of [[[250,360],[430,420]],[[260,380],[440,450]],[[240,350],[420,400]],[[380,360],[200,420]]]) for(const h of [594,570]) o.push([[[202,594],[310,h],[418,594]],d]);return o;},
  naive:[[[202,594],[418,594]]]});
D.push({L:{name:'溶ける滑り台',melt:22,start:S(40,150),goal:{x:550,y:760},blocks:[B(0,160,150,190),B(0,600,760)],
  spikes:[{x:245,y:749,w:410,h:22}],balls:[{x:300,y:420,r:15}],fish:[[360,600]],ink:760},
  fam:()=>{const o=[];for(const c of [[200,500],[260,560],[380,420],[420,520]]) for(const k of [1,2,3,4]){const pts=r1(bez([165,170],c,[470,748],24));const n=pts.length;const o2=[];for(let i=0;i<k;i++){const a=Math.floor(i*n/k),b=Math.floor((i+1)*n/k);o2.push(pts.slice(a,Math.min(n,b+ (i<k-1?0:0))));}o.push(o2.filter(x=>x.length>1));}return o;},
  naive:[r1(bez([165,170],[260,560],[470,748],24))]});
D.push({L:{name:'ワープで鍵を',start:S(195,700),goal:{x:60,y:700,door:1},blocks:[B(0,265,700),B(420,600,180,210)],
  portals:[{a:[240,684],b:[470,140]}],keys:[[560,150]],fish:[[300,420]],ink:620},
  fam:()=>{const o=[];for(const sx of [400,415]) for(const c of [[240,420],[200,600],[180,660],[260,560]]) for(const ex of [140,152,165]) o.push([r1(bez([sx,225],c,[ex,694]))]);return o;},
  naive:[r1(bez([410,225],[330,500],[262,694]))]});
D.push({L:{name:'ワープの罠',start:S(40,700),goal:{x:545,y:700},blocks:[B(0,380,700),B(460,600,700)],
  portals:[{a:[250,684],b:[420,300]}],fish:[[250,640]],ink:360},
  fam:()=>{const o=[];for(const h of [640,650,660]) for(const w of [60,80,100]) o.push([[[250-w,694],[250,h],[250+w,694]],[[382,694],[458,694]]]);return o;},
  naive:[[[382,694],[458,694]]]});
module.exports=D;
