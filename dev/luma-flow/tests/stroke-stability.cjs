'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {FlowWorld}=require('../dist/physics.js');
const fixture=()=>({source:{x:30,y:40},cup:{x:340,y:450,w:60,h:80},platforms:[{x:220,y:330,w:35,h:24}],ink:1500,maxStrokes:3});
test('hand-drawn shallow zigzag lands on a small support without spinning off',()=>{
 const w=new FlowWorld(fixture());
 const path=Array.from({length:25},(_,i)=>({x:55+i*11,y:180+(i%2)*5}));
 assert.equal(w.draw(path).ok,true);const b=w.strokes[0].body;let fastestSpin=0;
 for(let i=0;i<1500;i++){w.step();fastestSpin=Math.max(fastestSpin,Math.abs(b.angularVelocity));}
 // The old compound inertia produced 0.29 radians per base frame and the
 // rod left the platform. This is a long, nearly horizontal balanced shape.
 assert.ok(fastestSpin<.04,`unexpected collision spin: ${fastestSpin}`);
 assert.ok(b.position.y<360,`rod left the support: y=${b.position.y}`);
 assert.equal(b.isSleeping,true,'a supported rod should come to rest');
 const atRest={x:b.position.x,y:b.position.y,angle:b.angle};
 for(let i=0;i<360;i++)w.step();
 assert.deepEqual({x:b.position.x,y:b.position.y,angle:b.angle},atRest,'resting rod does not jitter');w.destroy();
});
test('dense hand sampling does not collapse a long rod rotational inertia',()=>{
 const a=new FlowWorld(fixture()),b=new FlowWorld(fixture());
 a.draw([{x:55,y:180},{x:319,y:180}]);
 b.draw(Array.from({length:25},(_,i)=>({x:55+i*11,y:180+(i%2)*5})));
 const straight=a.strokes[0].body,wavy=b.strokes[0].body;
 const ratio=(wavy.inertia/wavy.mass)/(straight.inertia/straight.mass);
 assert.ok(ratio>.8&&ratio<1.3,`similar long shapes must have comparable rotational response: ${ratio}`);
 a.destroy();b.destroy();
});
test('a valid shallow path beside an obstacle survives unsafe simplification',()=>{
 const w=new FlowWorld({...fixture(),platforms:[{x:195,y:110,w:10,h:20}]});
 const path=[{x:170,y:96},{x:185,y:94.8},{x:205,y:94.8},{x:220,y:96}];
 assert.equal(w.validate(path),null,'the actual finger path clears the obstacle');
 assert.notEqual(w.validate([path[0],path.at(-1)]),null,'the simplified chord cuts its clearance');
 assert.equal(w.draw(path).ok,true);assert.deepEqual(w.strokes[0].original,path,'retain safe geometry rather than reject the drawn path');w.destroy();
});
