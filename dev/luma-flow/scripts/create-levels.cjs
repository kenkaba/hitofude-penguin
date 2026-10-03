const fs=require('fs');const B=require('./stage-blueprints.json');
const entries=[
 ['はじめのひと筆','basic',{}],['支点の秘密','balance',{}],['フック接続','hook',{}],['曲がって、届く','elbow',{}],['橋から橋へ','relay',{}],['こぼれる水路','drain',{}],['ふたつの電源','arms',{}],['隔壁を開けろ','channel',{}],['ふたりで半分こ','split',{}],['つなげ！水のリレー','relay',{drain:true}],
 ['おもりの鍵','basic',{gates:1,mirror:true}],['扉の向こうの曲がり角','elbow',{gates:1}],['水のエレベーター','channel',{}],['ふたつのロック','basic',{gates:2}],['階段の鍵','relay',{gates:1}],['漏れる扉','drain',{gates:1}],['しっぽと鍵','hook',{gates:1}],['反対側から考える','channel',{mirror:true}],['三筆の計画','relay',{gates:1,tight:true,mirror:true}],['からくり水路','channel',{gates:1,drain:true}],
 ['ふたごの噴水','arms',{}],['お山の屋根','split',{tight:true}],['ふたりに鍵を','split',{gates:1}],['左右のおつかい','arms',{mirror:true,tight:true}],['右へもう少し','split',{bias:2,targets:[100,145]}],['風にゆれる屋根','split',{wind:25}],['右の落とし穴','arms',{drain:true}],['ゆっくり、ふたりへ','arms',{gates:1}],['左へ多めに','split',{bias:-2,targets:[145,100],mirror:true}],['ふたごの秘密基地','arms',{gates:2}],
 ['風を通す扉','elbow',{gates:1,wind:140}],['曲がり角の罠','elbow',{gates:1,drain:true,mirror:true}],['重さで開く水路','hook',{gates:1,wind:-110}],['ふたつの鍵と階段','relay',{gates:2}],['風下の水路','drain',{gates:1,wind:150}],['三つの役目','channel',{gates:1,wind:100}],['漏れない橋を','drain',{gates:2,mirror:true}],['ふたりの扉番','split',{gates:2,drain:true}],['見えた！遠回り','hook',{gates:2,mirror:true}],['よつ葉の計画','arms',{gates:2,wind:-70}],
 ['水路の二重ロック','channel',{gates:1,tight:true,mirror:true}],['風の曲がり道','elbow',{gates:2,wind:170}],['ふたごの大脱出','arms',{gates:2,drain:true}],['漏れる階段の鍵','relay',{gates:2,drain:true,mirror:true}],['バランスの答え','hook',{gates:2,wind:110,tight:true}],['屋根の下のふたり','split',{gates:2,wind:25,drain:true,targets:[110,115]}],['水路を縫って','drain',{gates:2,wind:-170,tight:true}],['ひと筆の使いみち','elbow',{gates:2,drain:true,tight:true,mirror:true}],['すべてをつなぐ','arms',{gates:2,wind:90,drain:true,tight:true}],['最後のひらめき','split',{gates:2,wind:-25,drain:true,bias:2,targets:[110,145],tight:true}]
];
const cyberNames=['最初の通電','支点の秘密','フック接続','路地裏の迂回路','上下のネットワーク','配管の裂け目','左右の電源','隔壁を開けろ','ふたつのバッテリー','連鎖する街灯','西区の配電盤','曲折した回路','地下の排出口','二重認証','高架の接続','漏電エリア','吊り下げ配管','逆向きの出口','三本の配線','閉ざされた水路','ツインコア','屋根の分岐点','ふたりの認証','双方向リンク','右区の電力不足','ビル風の分岐','排水エラー','遅れて届く電力','左区の負荷','双子の変電所','乱流の隔壁','折れ曲がる街路','重心ハッキング','高架の二重ロック','風下のパイプ','三役の導線','密閉する配管','双子の検問','裏側のアクセス','四本のネットワーク','地下回路の鍵','嵐の交差点','ふたつの出口','漏れる高架回路','重力のバックドア','屋根裏の信号','風を縫う配線','一本の多重接続','シティリンク','都市再起動'];
const chapters=[{name:'ネオン街の点灯',en:'NEON DISTRICT',color:'#50ead9'},{name:'地下回線',en:'UNDERGROUND',color:'#f3ce65'},{name:'ツインコア',en:'TWIN CORES',color:'#58d5ff'},{name:'高架の乱流',en:'SKYLINE',color:'#b197ff'},{name:'都市再起動',en:'CITY REBOOT',color:'#ff719f'}];
const relayStageIds=new Set([4,5,6,7,9,...Array.from({length:41},(_,i)=>i+10)]);
const worldMechanics=[
 {name:'重力都市',gravity:1,material:null,description:'描いた線は落下する。支えと重心を使って水路を組もう。'},
 {name:'氷結配管',gravity:1,material:'ice',description:'氷の支持台は滑りやすい。線を引っ掛け、横ずれを止めよう。'},
 {name:'反発工場',gravity:1,material:'rubber',description:'ゴムの支持台では線が跳ねる。跳ねた後も収まる形を作ろう。'},
 {name:'低重力区',gravity:.65,material:null,description:'低重力で線も水もゆっくり落ちる。着地を見届けてから注水しよう。'},
 {name:'搬送ライン',gravity:1,material:'conveyor',belt:30,description:'矢印の床が線と水を運ぶ。流される方向を見越して組み立てよう。'},
 {name:'凍結軌道',gravity:.75,material:'ice',description:'低重力と滑る床。長い片持ちの線は流されやすい。'},
 {name:'重力プレス',gravity:1.3,material:null,description:'強い重力で素早く落ちる。着地後の水路を先に想像しよう。'},
 {name:'逆送コンベア',gravity:1,material:'conveyor',belt:-30,description:'逆向きの床が線を押し戻す。支えに引っ掛けて水路を保とう。'},
 {name:'弾性ドーム',gravity:.8,material:'rubber',description:'軽い重力と弾む床。跳ね返りを受け止める支えを探そう。'},
 {name:'極寒高架',gravity:1.15,material:'ice',description:'滑る高架と強い重力。重心を片側へ寄せすぎないように。'},
 {name:'浮遊物流区',gravity:.7,material:'conveyor',belt:25,description:'ゆっくり落ちても床は動く。搬送中の出口を見極めよう。'},
 {name:'反発炉',gravity:1.25,material:'rubber',description:'重い落下と反発床。勢いを受け止める形が必要になる。'},
 {name:'氷の分岐路',gravity:.85,material:'ice',description:'滑る支点の上で分流。左右の重さも考えて線をつなごう。'},
 {name:'往復貨物区',gravity:1.1,material:'conveyor',belt:-25,description:'逆送される線を使い、送り先に合わせて出口を組み立てよう。'},
 {name:'無重力実験区',gravity:.55,material:null,description:'とても弱い重力。遠くへ流れる水を、次の橋で受け止めよう。'},
 {name:'弾む最終回線',gravity:.9,material:'rubber',description:'反発する足場と複数の回路。順番に安定させてから通水しよう。'},
 {name:'都市中枢',gravity:.8,material:'conveyor',belt:20,description:'搬送床と低重力の最終回路。両方の街へ水を届けよう。'}
];
const relayCalibration=require('./stage-blueprints.json').relayCalibration||{};

function mirror(l){const p=a=>({...a,x:390-a.x});l.source=p(l.source);if(l.sources)l.sources=l.sources.map(p);l.cups=l.cups.map(p);for(const k of ['platforms','gates','switches','drains','noDraw','relays'])if(l[k])l[k]=l[k].map(a=>({...p(a),angle:-(a.angle||0)}));if(l.winds)l.winds=l.winds.map(a=>({...p(a),ax:-(a.ax||0)}));l.solutions=l.solutions.map(ps=>ps.map(p));}
function length(ps){let n=0;for(let i=1;i<ps.length;i++)n+=Math.hypot(ps[i].x-ps[i-1].x,ps[i].y-ps[i-1].y);return n;}
const levels=entries.map(([name,type,o],i)=>{const l=structuredClone(B[type]);Object.assign(l,{name:cyberNames[i],id:i+1,chapter:Math.floor(i/10),archetype:type,theme:i<30?'day':'night'});l.gates=l.gates||[];l.switches=l.switches||[];l.drains=l.drains||[];l.winds=[];

 if(o.bias)l.source.x+=o.bias;if(o.targets)l.cups.forEach((c,j)=>c.target=o.targets[j]);if(o.wind)l.winds.push({x:l.source.x,y:160,w:type==='split'?65:105,h:85,ax:o.wind});
 if(o.drain){const d=l.cups.length>1?{x:195,y:450,w:80,h:16}:type==='channel'?{x:154,y:450,w:38,h:16}:type==='relay'?{x:175,y:460,w:82,h:16}:type==='elbow'?{x:118,y:414,w:60,h:16}:{x:200,y:455,w:78,h:16};l.drains.push(d);}
 if(i>=30&&type==='elbow'){l.drains.push({x:112,y:273,w:40,h:8});l.platforms.push({x:116,y:250,w:14,h:12});}
 if(i>=30&&type==='relay')l.platforms.push({x:158,y:253,w:24,h:18});
 l.parInk=Math.ceil(l.solutions.reduce((n,p)=>n+length(p),0));l.ink=Math.ceil(l.parInk*(o.tight?1.17:1.4)/10)*10;l.maxStrokes=Math.min(5,l.solutions.length+1);
 const principle={basic:'石を支えにして、器へ向かう坂を作ろう。',balance:'橋の真ん中が、斜めの石の上に乗ると安定します。',elbow:'まっすぐだと箱に当たります。線を曲げて、箱の外へ。',relay:'一つ目の橋から落ちる水を、二つ目の橋で受け止めよう。',drain:'赤い排水口に触れた水は失われます。水路の隙間を橋でつなごう。',hook:'左側にも重さを作ると、支えの上でバランスを取りやすくなります。',split:'水をふたつに分ける形は？山のような屋根を考えてみよう。',arms:'左右の水を、それぞれの器へ。二つの道を用意しよう。',channel:'囲まれた水路の下に出口があります。扉を開けて、その先に橋を。'}[type];
 l.hints=[l.gates.length?'同じ文字のボタンと扉はつながっています。線を重しにして押そう。':principle,l.gates.length?principle:l.cups.length>1?'両方の器が目印まで満ちて、はじめてクリアです。':'描いた線は落ちます。支えと、線の重心を考えてみよう。'];l.rule=l.gates.length?(l.cups.length>1?'扉を開けて、両方の器を満たそう':'線の重みで扉を開け、水を届けよう'):l.cups.length>1?'両方の器を、目印まで満たそう':o.wind?'風を読んで、水の道をつくろう':'線を組み立てて、水を届けよう';l.essentialStrokes=l.solutions.map((_,j)=>j);if(o.mirror)mirror(l);
 if(relayStageIds.has(l.id)&&relayCalibration[l.id]){
  l.relays=relayCalibration[l.id].map((sensor,j)=>({id:'R'+(j+1),...sensor,r:22,minHits:3,required:true,gates:['P'+(j+1)]}));
  l.relays.forEach((sensor,j)=>{const c=l.cups[(j+1)%l.cups.length];l.gates.push({id:'P'+(j+1),x:c.x,y:c.y+19,w:c.w-14,h:8,relayGate:true});});
  l.hints=[l.cups.length>1?'水を左右のリレーに通すと、反対側の隔壁が開きます。両方の回路をつなごう。':'水をリレーの輪に通すと、器の隔壁が開きます。水の通り道とスイッチを一緒に考えよう。',principle];
  l.rule=l.cups.length>1?'両方のリレーを通して、街の電源を満たそう':'水でリレーを起動して、電源を満たそう';
 }
 const worldMap=[0,1,3,2,4,5,11,7,9,14,10,8,12,6,13,15,16];const wm=worldMechanics[worldMap[Math.floor(i/3)]];l.worldIndex=Math.floor(i/3);l.gravityScale=wm.gravity;l.mechanic=wm.description;l.worldName=require('../dist/worlds.js')[Math.floor(i/3)].name;
 if(wm.material==='conveyor'){for(const source of l.sources||[l.source])l.platforms.push({x:source.x,y:source.y+42,w:20,h:10,material:'conveyor',beltSpeed:wm.belt>0?45:-45});}else if(wm.material)for(const p of l.platforms){if(p.h<=24)p.material=wm.material;}
 if(wm.material==='conveyor'){
  const d=structuredClone(B.beltChallenge);d.platforms[0].beltSpeed=80*Math.sqrt(wm.gravity);Object.assign(l,d,{id:i+1,name:cyberNames[i],worldIndex:Math.floor(i/3),worldName:require('../dist/worlds.js')[Math.floor(i/3)].name,gravityScale:wm.gravity,mechanic:'動く床で水を横へ運ぶ。その先に坂を描き、反対方向の器へ折り返そう。',gates:[],switches:[],relays:[],winds:[],drains:[],archetype:'belt-transfer'});
 }
 if(wm.material==='rubber'){
  const d=structuredClone(B.rubberChallenge);Object.assign(l,d,{id:i+1,name:cyberNames[i],worldIndex:Math.floor(i/3),worldName:require('../dist/worlds.js')[Math.floor(i/3)].name,gravityScale:wm.gravity,mechanic:'反発板で水を跳ね上げよう。排水口を越えて跳ねた水を、描いた坂で折り返そう。',gates:[],switches:[],relays:[],winds:[],drains:d.drains||[],archetype:'bounce-catch'});
 }
 if([4,6,16,17,18,27,37,39].includes(l.id)){
  const d=structuredClone(B.iceChallenge);Object.assign(l,d,{id:i+1,name:['滑らせてつなぐ','氷上の着地点','滑走回路'][i%3],gravityScale:1,archetype:'ice-slide',switches:[],winds:[],drains:[],mechanic:'氷の坂で線を滑らせよう。ずれた先で水を受けると、リレーが隔壁を開く。'});
  if(i%3===1){mirror(l);}
  l.hints=[l.mechanic,'氷の下端の壁が、滑った線を受け止めます。'];l.rule=l.mechanic;
 }
 if(l.id===5){l.platforms=structuredClone(B.iceRelayFix.platforms);l.mechanic='滑る支持台の縁で線を止め、上の橋から下の橋へ水を渡そう。';}
 if(wm.material==='conveyor'||wm.material==='rubber'){
  l.name=(wm.material==='conveyor'?['横送りの水路','逆送をつかまえろ','搬送回路の解錠']:['跳ねて渡る','反射を受け止めろ','弾む回路の解錠'])[i%3];l.hints=[l.mechanic,'水が落ちる場所から逆算して、受け坂を描こう。'];l.rule=l.mechanic;
  if((Math.floor(i/3)+i%3)%2===1){mirror(l);for(const p of l.platforms)if(p.material==='conveyor')p.beltSpeed=-p.beltSpeed;}
  if(i%3===2){const c=l.cups[0];l.relays=[{id:'R1',x:c.x,y:c.y-10,r:30,minHits:3,required:true,gates:['P1']}];l.gates=[{id:'P1',x:c.x,y:c.y+30,w:c.w-14,h:8,relayGate:true}];l.hints[1]='リレーを通る位置へ出口を向けると、器の隔壁が開きます。';}
 }
 l.parInk=Math.ceil(l.solutions.reduce((n,p)=>n+length(p),0));l.ink=Math.ceil(l.parInk*1.45/10)*10;l.essentialStrokes=l.solutions.map((_,j)=>j);l.maxStrokes=Math.min(5,l.solutions.length+1);
 return l;
});
// Each authored module owns explicit stage slots. Material introductions stay at 1/4/10/13.
const authoredModules=['structure-levels','portal-levels','pump-levels','color-levels','mixed-levels','finale-levels'];
const occupied=new Set();
for(const file of authoredModules)for(const {slot,level} of require('./'+file+'.cjs')){
 if(slot<1||slot>50||occupied.has(slot))throw Error('Conflicting authored stage '+slot);
 occupied.add(slot);const l=structuredClone(level),worldIndex=Math.floor((slot-1)/3);
 l.id=slot;l.worldIndex=worldIndex;l.worldName=require('../dist/worlds.js')[worldIndex].name;l.chapter=Math.floor((slot-1)/10);l.theme=slot<31?'day':'night';
 if(!l.mechanic||/^[a-z-]+$/.test(l.mechanic)){l.mechanicKind=l.mechanic;l.mechanic=l.rule||l.hints?.[0]||'';}
 l.parInk=Math.ceil(l.solutions.reduce((n,ps)=>n+length(ps),0));l.ink=l.ink||Math.ceil(l.parInk*1.6/10)*10;l.maxStrokes=l.maxStrokes||Math.min(6,l.solutions.length+1);
 l.essentialStrokes=l.essentialStrokes||l.solutions.map((_,i)=>i);l.gravityScale=l.gravityScale??1;l.rule=l.rule||l.mechanic;
 levels[slot-1]=l;
}
if(occupied.size!==46)throw Error('Expected 46 authored replacements, got '+occupied.size);
fs.writeFileSync('dist/levels.js',`(function(r){r.FLOW_CHAPTERS=${JSON.stringify(chapters)};r.FLOW_LEVELS=${JSON.stringify(levels)};if(typeof module!=='undefined')module.exports=r.FLOW_LEVELS;})(typeof window!=='undefined'?window:globalThis);\n`);console.log('Wrote',levels.length,'stages');
