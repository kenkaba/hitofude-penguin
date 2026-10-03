'use strict';
const assert=require('node:assert/strict'),test=require('node:test');
const levels=require('../dist/levels.js'),{play}=require('./campaign.cjs');
function design(l,flip=false){
 const keys=['x','y','w','h','r','angle','exitX','exitY','vx','vy','color','material','beltSpeed','capacity','exitSpread','spread'];
 const item=p=>Object.fromEntries(keys.filter(k=>p[k]!==undefined).map(k=>{let v=p[k];if(flip){if(k==='x'||k==='exitX')v=390-v;else if(['angle','vx','beltSpeed'].includes(k))v=-v;}if(typeof v==='number')v=Math.round(v*100)/100;return[k,v]}));
 const a={};for(const kind of ['sources','cups','platforms','portals','pumps','gates','switches','drains','winds'])a[kind]=(kind==='sources'?(l.sources||[l.source]):l[kind]||[]).map(item).sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));
 return JSON.stringify(a);
}
test('all fifty physical layouts differ even after horizontal reflection and ignoring names or targets',()=>{
 const seen=new Map();for(const l of levels){const key=[design(l),design(l,true)].sort()[0];assert.ok(!seen.has(key),`stages ${seen.get(key)} and ${l.id} reuse the same physical question`);seen.set(key,l.id);}
});
test('authored essential strokes each change whether their puzzle can be solved',()=>{
 for(const l of levels)for(const omit of l.essentialStrokes||[])assert.equal(play(l,{omit,seed:101}).state,'lost',`stage ${l.id} stroke ${omit+1} must matter`);
});
