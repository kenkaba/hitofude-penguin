'use strict';

// Engine regressions; campaign.cjs separately owns the 50 x 6 solution matrix.
const assert = require('node:assert/strict');
const { FlowWorld } = require('../dist/physics.js');
const levels = require('../dist/levels.js');
const M = require('../dist/vendor/matter.min.js');
const results = [], started = performance.now();
let simulatedTicks = 0;

function test(name, run) {
  try {
    const detail = run();
    results.push({ name, passed: true, ...(detail ? { detail } : {}) });
  } catch (error) { results.push({ name, passed: false, error: error.stack }); }
}

function fixture(overrides = {}) {
  return {
    source: { x: 195, y: 65 }, cups: [{ x: 195, y: 380, w: 100, h: 92, target: 8 }],
    platforms: [], gates: [], switches: [], drains: [], winds: [],
    ink: 500, maxStrokes: 3, total: 80, rate: 60, ...overrides,
  };
}

function withWorld(level, run, seed = 17) {
  const world = new FlowWorld(level, seed);
  try { return run(world); } finally {
    world.destroy();
    assert.equal(M.Composite.allBodies(world.engine.world).length, 0, 'destroy removes all bodies');
    assert.equal(world.history.length, 0, 'destroy removes undo history');
  }
}

function healthy(world) {
  const s = world.snapshot();
  assert.equal(s.finite, true, 'particles and rigid bodies stay finite');
  assert.equal(s.emitted, s.live + s.collected + s.lost, 'every emitted particle has exactly one destination');
  assert.equal(s.collected, s.cups.reduce((sum, c) => sum + c.collected, 0), 'cup totals agree with global collection');
  assert.ok(s.drained <= s.lost, 'drained is included in lost');
  assert.ok(s.emitted <= world.total, 'source cannot exceed its water budget');
  for (const n of [s.emitted, s.live, s.collected, s.lost, s.drained]) assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.equal(new Set(world.drops.map(p => p.id)).size, s.live, 'live particle identities are unique');
  if (s.state === 'won') assert.ok(s.cups.every(c => c.collected >= c.target), 'all cups meet their own target');
}

function step(world, count = 1) {
  for (let i = 0; i < count; i++) { world.step(); simulatedTicks++; healthy(world); }
}

function untilTerminal(world, limit = 2600) {
  for (let i = 0; i < limit && !['won', 'lost'].includes(world.state); i++) step(world);
  assert.ok(['won', 'lost'].includes(world.state), 'simulation terminates within its tick budget');
  return world.snapshot();
}

function draw(world, points) {
  const result = world.draw(points);
  assert.equal(result.ok, true, `stroke must be accepted: ${result.error || ''}`);
}

function plan(world, omit = -1) {
  world.level.solutions.forEach((points, index) => {
    if (index === omit) return;
    draw(world, points); step(world, 144);
    assert.equal(world.emitted, 0, 'planning never emits water');
  });
}

// Injected collision fixtures use production integration/collection and account
// for their particle in emitted, so conservation checks remain exact.
function particle(world, fields) {
  const p = { x: 195, y: 100, vx: 0, vy: 0, age: 0, inside: 0, entryCupId: null, id: world.emitted++, ...fields };
  world.drops.push(p); return p;
}

function reversibleState(world) {
  return {
    snapshot: world.snapshot(), ticks: world.ticks, seed: world.seed, pourAt: world.pourAt,
    switches: world.switches.map(s => ({ held: s.held, active: s.active })),
    strokes: world.strokes.map(s => ({ points: world.strokePoints(s), velocity: { ...s.body.velocity }, angle: s.body.angle })),
  };
}

function gateGraph(world) {
  const bodies = M.Composite.allBodies(world.engine.world);
  for (const gate of world.gates) {
    assert.equal(gate.solid.active, !gate.open, 'particle collision activation agrees with gate state');
    assert.equal(bodies.includes(gate.solid.body), !gate.open, 'Matter gate presence agrees with gate state');
    assert.ok(world.solids.includes(gate.solid), 'restored gate shares the restored solid');
    assert.ok(gate.solid.edges.every(e => world.edges.includes(e) && e.solid === gate.solid), 'restored edges share the restored solid');
  }
}

test('gate activation, nested undo and replay restore the exact planning state', () => withWorld(levels[13], world => {
  const initial = reversibleState(world);
  assert.equal(world.undo(), false);
  draw(world, world.level.solutions[0]); step(world, 144);
  assert.deepEqual(world.gates.map(g => g.open), [true, false], 'first weight opens only A');
  gateGraph(world);
  const afterFirst = reversibleState(world);
  draw(world, world.level.solutions[1]); step(world, 144);
  assert.deepEqual(world.gates.map(g => g.open), [true, true]); gateGraph(world);
  assert.equal(world.undo(), true);
  assert.deepEqual(reversibleState(world), afterFirst, 'undo B preserves A and refunds only B'); gateGraph(world);
  assert.equal(world.undo(), true);
  assert.deepEqual(reversibleState(world), initial, 'undo A restores time, ink, switches, gates and bodies'); gateGraph(world);
  assert.equal(world.undo(), false);
  plan(world); assert.equal(world.pour(), true);
  assert.equal(untilTerminal(world).state, 'won', 'restored collision graph supports replay');
}));

test('water and undersized weights cannot activate a line switch', () => {
  const level = fixture({ source: { x: 100, y: 65 },
    cups: [{ x: 300, y: 400, w: 90, h: 85, target: 8 }],
    gates: [{ id: 'A', x: 280, y: 260, w: 100, h: 12 }],
    switches: [{ x: 100, y: 200, w: 38, gate: 'A', minLength: 27 }],
  });
  withWorld(level, world => {
    world.pour(); step(world, 480);
    assert.ok(world.emitted > 0);
    assert.equal(world.switches[0].active, false); assert.equal(world.gates[0].open, false);
  });
  withWorld(level, world => {
    draw(world, [{ x: 90, y: 140 }, { x: 110, y: 140 }]); step(world, 180);
    assert.equal(world.switches[0].active, false, '20px stroke is below activation minimum');
    assert.equal(world.gates[0].open, false);
    world.undo(); draw(world, [{ x: 82, y: 140 }, { x: 118, y: 140 }]); step(world, 180);
    assert.equal(world.switches[0].active, true, 'same landing location with sufficient length is a positive control');
    assert.equal(world.gates[0].open, true); gateGraph(world);
  });
});

test('excess water in one cup never substitutes for the other cup', () => withWorld(fixture({
  source: { x: 90, y: 65 },
  cups: [{ x: 90, y: 350, w: 100, h: 92, target: 4 }, { x: 300, y: 350, w: 100, h: 92, target: 4 }], total: 40,
}), world => {
  world.pour(); const result = untilTerminal(world);
  assert.equal(result.state, 'lost');
  assert.ok(result.collected >= result.target, 'aggregate target is exceeded, catching sum-only win checks');
  assert.equal(result.cups[1].collected, 0);
}));

test('both cups can win and terminal state cannot restart the source', () => withWorld(fixture({
  sources: [{ x: 90, y: 65 }, { x: 300, y: 65 }],
  cups: [{ x: 90, y: 350, w: 100, h: 92, target: 12 }, { x: 300, y: 350, w: 100, h: 92, target: 12 }],
}), world => {
  assert.equal(world.pour(), true); assert.equal(untilTerminal(world).state, 'won');
  const winAt = world.winAt, emitted = world.emitted;
  assert.equal(world.pour(), false); assert.equal(world.undo(), false); step(world, 240);
  assert.equal(world.state, 'won'); assert.equal(world.winAt, winAt, 'win fires once');
  assert.equal(world.emitted, emitted, 'terminal simulation cannot restart emission');
}));

test('only cup-mouth entry is counted and each drop counts once', () => withWorld(fixture(), world => {
  const cup = world.cups[0];
  particle(world, { x: cup.x, y: cup.y + 45 }); step(world, 100);
  assert.equal(world.collected, 0, 'water spawned inside has no entry latch');
  particle(world, { x: cup.x, y: cup.y + 6, vy: 100 }); step(world, 180);
  assert.equal(world.collected, 1, 'genuine downward mouth entry is collected'); step(world, 180);
  assert.equal(world.collected, 1, 'a captured particle cannot count again');
}));

test('drains consume particles once and are included in lost', () => withWorld(fixture({
  cups: [{ x: 300, y: 400, w: 90, h: 85, target: 1 }],
  drains: [{ x: 195, y: 220, w: 100, h: 12 }], total: 12,
}), world => {
  world.pour(); assert.equal(untilTerminal(world).state, 'lost'); step(world, 240);
  assert.equal(world.emitted, 12); assert.equal(world.drained, 12); assert.equal(world.lost, 12);
  assert.equal(world.collected, 0); assert.equal(world.drops.length, 0);
}));

test('fast particles cannot tunnel through a platform top face', () => withWorld(fixture({
  platforms: [{ x: 195, y: 220, w: 100, h: 20 }],
}), world => {
  const drop = particle(world, { x: 195, y: 207.2, vy: 440 }); step(world);
  assert.ok(drop.y <= 207.31, `surface penetration at y=${drop.y}`);
  assert.ok(drop.vy <= 0, 'impact redirects downward velocity');
}));

test('planning has falling rigid bodies but emits only after one Pour and its delay', () => withWorld(fixture(), world => {
  draw(world, [{ x: 310, y: 100 }, { x: 355, y: 120 }]);
  const body = world.strokes[0].body, initialY = body.position.y;
  assert.equal(body.isStatic, false); step(world, 120);
  assert.ok(body.position.y > initialY + 100, 'unsupported stroke really falls');
  assert.equal(world.state, 'planning'); assert.equal(world.emitted, 0);
  assert.equal(world.pour(), true); const pourAt = world.pourAt;
  assert.equal(world.pour(), false); assert.equal(world.pourAt, pourAt, 'repeat Pour cannot defer emission');
  assert.equal(world.undo(), false);
  assert.equal(world.draw([{ x: 20, y: 100 }, { x: 70, y: 100 }]).ok, false);
  step(world, 90); assert.equal(world.emitted, 0, 'settling delay is observed');
  step(world, 30); assert.ok(world.emitted > 0);
}));

test('invalid strokes and shared ink/stroke limits leave planning unchanged', () => withWorld(fixture({
  ink: 100, maxStrokes: 2, platforms: [{ x: 195, y: 250, w: 40, h: 20 }],
}), world => {
  const invalid = [[], [{ x: NaN, y: 100 }, { x: 30, y: 100 }],
    [{ x: 30, y: 100 }, { x: 31, y: 101 }], [{ x: 195, y: 200 }, { x: 195, y: 280 }]];
  for (const points of invalid) {
    const before = reversibleState(world); assert.equal(world.draw(points).ok, false);
    assert.deepEqual(reversibleState(world), before); assert.equal(world.history.length, 0);
  }
  draw(world, [{ x: 30, y: 100 }, { x: 70, y: 100 }]); const oneStroke = reversibleState(world);
  assert.equal(world.draw([{ x: 300, y: 100 }, { x: 370, y: 100 }]).ok, false, 'combined 110px exceeds 100px budget');
  assert.deepEqual(reversibleState(world), oneStroke);
  draw(world, [{ x: 300, y: 100 }, { x: 340, y: 100 }]); assert.equal(world.ink, 80);
  const twoStrokes = reversibleState(world);
  assert.equal(world.draw([{ x: 30, y: 180 }, { x: 50, y: 180 }]).ok, false, 'third stroke exceeds count despite remaining ink');
  assert.deepEqual(reversibleState(world), twoStrokes);
  assert.equal(world.undo(), true); assert.equal(world.ink, 40);
  draw(world, [{ x: 300, y: 100 }, { x: 340, y: 100 }]); assert.equal(world.ink, 80, 'refunded ink can be reused');
}));

test('seeded fixed-step replay is independent of render-step grouping', () => withWorld(levels[49], a => withWorld(levels[49], b => {
  plan(a); plan(b); a.pour(); b.pour();
  for (let i = 0; i < 600; i++) step(a, 2);
  for (let i = 0; i < 300; i++) step(b, 4);
  assert.deepEqual(reversibleState(a), reversibleState(b)); assert.deepEqual(a.drops, b.drops);
}, 1009), 1009));

test('representative campaigns preserve particles and solve across all mechanics', () => {
  const ids = [4, 6, 9, 13, 21, 50];
  for (const id of ids) withWorld(levels[id - 1], world => {
    plan(world); world.pour(); assert.equal(untilTerminal(world).state, 'won', `L${id} solution`); step(world, 120);
  }, 101);
  return { levels: ids };
});

test('stages 31–50 fail without drawing under two fixed seeds', () => {
  const late = levels.filter(level => level.id >= 31);
  assert.equal(late.length, 20, 'all 20 late stages are covered');
  for (const level of late) for (const seed of [17 + level.id, 1009]) withWorld(level, world => {
    world.pour(); assert.equal(untilTerminal(world).state, 'lost', `L${level.id}, seed ${seed}: no-draw shortcut`);
  }, seed);
  return { levels: 20, seeds: 2, runs: 40 };
});

test('final puzzle requires each authored stroke', () => {
  const level = levels[49]; assert.deepEqual(level.essentialStrokes, [0, 1, 2]);
  for (const omit of level.essentialStrokes) withWorld(level, world => {
    plan(world, omit); world.pour();
    assert.equal(untilTerminal(world).state, 'lost', `L50 must fail without stroke ${omit + 1}`);
  }, 101);
  return { omissions: level.essentialStrokes.length };
});

const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failed.length,
  failed: failed.length, simulatedTicks, elapsedMs: Math.round(performance.now() - started), results,
  scope: 'Production physics in Node. Browser rendering, pointer interaction and on-device Safari performance remain unverified.',
}, null, 2));
if (failed.length) process.exitCode = 1;
