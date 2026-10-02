const assert=require('node:assert/strict'),{test}=require('node:test');
const {FlowWorld}=require('../dist/physics.js'),levels=require('../dist/levels.js'),{play}=require('./campaign.cjs');
test('50 persistent IDs and 17 worlds of up to three levels have explicit physical rules',()=>{
 assert.equal(levels.length,50);assert.deepEqual(levels.map(l=>l.id),Array.from({length:50},(_,i)=>i+1));
 assert.equal(new Set(levels.map(l=>l.worldIndex)).size,17);for(const l of levels){assert.equal(l.worldIndex,Math.floor((l.id-1)/3));assert.ok(l.mechanic.length>10);}
 assert.ok(new Set(levels.map(l=>l.archetype)).size>=9);
});
test('authored circuit gates activate from actual passing water',()=>{
 for(const l of levels.filter(l=>l.relays?.length)){
  const w=new FlowWorld(l,101);for(const p of l.solutions){assert.ok(w.draw(p).ok);for(let i=0;i<144;i++)w.step();}
  for(const r of w.relays){assert.equal(r.active,false);for(const id of r.gates)assert.equal(w.gates.find(g=>g.id===id).open,false);}
  w.pour();for(let i=0;i<2600&&w.state!=='won'&&w.state!=='lost';i++){
   w.step();for(const r of w.relays)for(const id of r.gates)assert.equal(w.gates.find(g=>g.id===id).open,r.active);
  }
  assert.equal(w.state,'won',`stage ${l.id}`);assert.ok(w.relays.every(r=>r.active&&r.hits>=r.minHits));w.destroy();
 }
});
test('all 50 levels need a player-created structure; no drawing never wins',()=>{
 for(const l of levels)assert.notEqual(play(l,{strokes:[],seed:101}).state,'won',`stage ${l.id}`);
});
test('material challenge solutions fail when their defining material is disabled',()=>{
 for(const [id,material] of [[4,'ice'],[10,'rubber'],[13,'conveyor']]){
  const level=levels[id-1];assert.equal(play(level,{seed:101}).state,'won',`material ${material}`);
  const normal=structuredClone(level);for(const p of normal.platforms)if(p.material===material)p.material='stone';
  assert.notEqual(play(normal,{seed:101}).state,'won',`${material} must change the route`);
 }
});
