const assert=require('node:assert/strict');
const {test}=require('node:test');
const {FlowWorld}=require('../dist/physics.js');
const levels=require('../dist/levels.js');
const {play}=require('./campaign.cjs');
test('50 persistent stage IDs; first nine introduce nine distinct structures',()=>{
 assert.equal(levels.length,50);assert.deepEqual(levels.map(l=>l.id),Array.from({length:50},(_,i)=>i+1));
 assert.equal(new Set(levels.slice(0,9).map(l=>l.archetype)).size,9);
});
test('water circuits are downstream, with crossed power on every two-cup circuit',()=>{
 const circuits=levels.filter(l=>l.relays?.length);assert.ok(circuits.length>=20);
 for(const l of circuits)l.relays.forEach((r,j)=>{
  assert.ok(r.y>l.source.y+150,`stage ${l.id}: sensor must follow routing`);
  assert.equal(r.required,true);const gate=l.gates.find(g=>g.id===r.gates[0]);assert.ok(gate);
  assert.ok(gate.y>r.y+20,`stage ${l.id}: gate downstream of sensor`);
  assert.equal(gate.x,l.cups[(j+1)%l.cups.length].x);
 });
});
test('each authored circuit is physically triggered by water before its cup fills',()=>{
 for(const l of levels.filter(l=>l.relays?.length)){
  const w=new FlowWorld(l,101);for(const p of l.solutions){assert.ok(w.draw(p).ok);for(let i=0;i<144;i++)w.step();}
  for(const r of w.relays){assert.equal(r.active,false);for(const id of r.gates)assert.equal(w.gates.find(g=>g.id===id).open,false);}
  w.pour();for(let i=0;i<2600&&w.state!=='won'&&w.state!=='lost';i++){
   w.step();for(const r of w.relays)for(const id of r.gates)assert.equal(w.gates.find(g=>g.id===id).open,r.active);
  }
  assert.equal(w.state,'won',`stage ${l.id}`);assert.ok(w.relays.every(r=>r.active&&r.hits>=r.minHits));w.destroy();
 }
});
test('all circuit levels require player routing; direct pouring never wins',()=>{
 for(const l of levels.filter(l=>l.relays?.length))assert.notEqual(play(l,{strokes:[],seed:101}).state,'won',`stage ${l.id}`);
});
test('missing required circuit cannot be bypassed with an otherwise complete route',()=>{
 for(const id of [4,7,9,30,50]){
  const l=structuredClone(levels[id-1]);l.relays[0].x=-100;
  assert.notEqual(play(l,{seed:101}).state,'won',`stage ${id}`);
 }
});
