'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {FlowWorld}=require('../dist/physics.js');
const M=require('../dist/vendor/matter.min.js');
const fixture=(extra={})=>({source:{x:195,y:65},cups:[{x:195,y:380,w:100,h:92,target:8}],platforms:[],ink:500,maxStrokes:3,total:80,rate:60,...extra});
const line=[{x:30,y:150},{x:85,y:155}];
function finish(w){assert.equal(w.pour(),true);for(let i=0;i<3000&&!['won','lost'].includes(w.state);i++)w.step();assert.ok(['won','lost'].includes(w.state));}
for(const terminal of ['won','lost'])test(`restore a ${terminal} attempt, retain undo and replay the same plan`,()=>{
 const w=new FlowWorld(fixture(terminal==='lost'?{total:4}:{}));
 assert.equal(w.draw(line).ok,true);for(let i=0;i<30;i++)w.step();
 const before=w.snapshot(),vertices=w.strokePoints(w.strokes[0]),plan=w.capturePlan();
 assert.equal(w.history.length,1);assert.equal(w.history[0].history.length,0);
 finish(w);assert.equal(w.state,terminal);const result=w.snapshot();assert.equal(w.capturePlan(),null);
 assert.equal(w.restorePlan(plan),true);assert.deepEqual(w.snapshot(),before);assert.deepEqual(w.strokePoints(w.strokes[0]),vertices);
 assert.equal(w.history.length,1);assert.equal(w.undo(),true);assert.equal(w.strokes.length,0);assert.equal(w.ink,0);
 assert.equal(w.restorePlan(plan),true);finish(w);assert.deepEqual(w.snapshot(),result);
 // Restoring a plan repeatedly never mutates its saved state or nests its history.
 for(let i=0;i<10;i++){assert.equal(w.restorePlan(plan),true);assert.equal(w.history.length,1);assert.equal(w.history[0].history.length,0);}
 w.destroy();
});
test('plan tokens cannot restore another world or accept arbitrary state',()=>{
 const a=new FlowWorld(fixture()),b=new FlowWorld(fixture());const plan=a.capturePlan();
 assert.equal(b.restorePlan(plan),false);assert.equal(a.restorePlan({kind:'FlowWorldPlan-v1'}),false);assert.equal(a.restorePlan(null),false);
 a.destroy();b.destroy();
});
test('three distinct water drops activate a relay and remove its physical gate',()=>{
 const w=new FlowWorld(fixture({gates:[{id:'A',x:195,y:260,w:100,h:14}],relays:[{x:195,y:160,r:20,gates:['A']}]}));
 const plan=w.capturePlan();finish(w);assert.equal(w.state,'won');const r=w.relays[0];
 assert.equal(r.id,'R1');assert.equal(r.hits,3);assert.equal(r.active,true);assert.ok(r.triggeredAt>0);assert.equal(w.gates[0].open,true);
 assert.ok(!M.Composite.allBodies(w.engine.world).includes(w.gates[0].solid.body));
 assert.equal(w.restorePlan(plan),true);assert.equal(w.relays[0].hits,0);assert.equal(w.relays[0].seenIds.size,0);assert.equal(w.relays[0].active,false);assert.equal(w.gates[0].open,false);
 assert.ok(M.Composite.allBodies(w.engine.world).includes(w.gates[0].solid.body));w.destroy();
});
test('swept sensor crossing counts each particle only once',()=>{
 const w=new FlowWorld(fixture({relays:[{x:195,y:160,r:1,minHits:2}]}));
 // Both endpoints are outside the circle, but the path crosses it.
 const p={id:1,x:210,y:160},old={x:180,y:160};w.updateRelays(p,old);w.updateRelays(p,old);
 assert.equal(w.relays[0].hits,1);assert.equal(w.relays[0].active,false);
 w.updateRelays({...p,id:2},old);assert.equal(w.relays[0].active,true);assert.equal(w.snapshot().relays[0].hits,2);w.destroy();
});
test('unreached required relay prevents victory; optional relay does not',()=>{
 for(const required of [true,false]){const w=new FlowWorld(fixture({relays:[{x:30,y:160,r:10,required}]}));finish(w);assert.equal(w.state,required?'lost':'won');assert.ok(w.collected>=w.target);assert.equal(w.relays[0].active,false);w.destroy();}
});
