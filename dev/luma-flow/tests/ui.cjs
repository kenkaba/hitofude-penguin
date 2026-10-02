/**
 * UI regressions using the real game, physics, level data and Canvas renderer.
 * The DOM, storage and animation clock are controlled test doubles. This is
 * not browser, touch-device, accessibility or visual-layout verification.
 * Run: node tests/ui.cjs
 * Requires @napi-rs/canvas locally or in CODEX_PRIMARY_RUNTIME_NODE_MODULES.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

let canvasModule;
try {
  canvasModule = require('@napi-rs/canvas');
} catch (error) {
  if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
  canvasModule = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas'));
}
const { createCanvas } = canvasModule;
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scripts = ['vendor/matter.min.js', 'physics.js', 'levels.js', 'worlds.js', 'game.js']
  .map(name => [name, fs.readFileSync(path.join(dist, name), 'utf8')]);
const PROGRESS = 'lumaflow-cyber-progress-v3';
const PREFS = 'lumaflow-prefs-v1';
const rect = () => ({ width: 390, height: 570, left: 0, top: 0, right: 390, bottom: 570 });

class Element {
  constructor(id, tagName = 'DIV') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.open = false;
    this.classList = {
      add: name => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), name])].join(' '); },
      remove: name => { this.className = this.className.split(/\s+/).filter(c => c !== name).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name)
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatch(type, detail = {}) {
    const event = { target: this, currentTarget: this, preventDefault() {}, ...detail };
    for (const listener of this.listeners.get(type) || []) listener(event);
    this['on' + type]?.(event);
  }
  click() { if (!this.disabled) this.dispatch('click'); }
  getBoundingClientRect() { return rect(); }
  replaceChildren(...children) { this.children = [...children]; }
  append(...children) { this.children.push(...children); }
  querySelector(selector) {
    assert.equal(selector, '.close', `Unexpected nested selector: ${selector}`);
    return this.closeButton ||= new Element(this.id + '-close', 'BUTTON');
  }
  showModal() { this.open = true; }
  close() {
    if (!this.open) return;
    this.open = false;
    this.dispatch('close');
  }
}

function boot(initialStorage = {}) {
  const elements = new Map();
  for (const match of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)) {
    const el = new Element(match[2], match[1]);
    el.hidden = /\bhidden\b/.test(match[0]);
    elements.set('#' + el.id, el);
  }
  // Only the child selector used by game.js; all IDs must exist in index.html.
  elements.set('#pourBtn span', new Element('pour-label', 'SPAN'));
  const canvas = createCanvas(390, 570);
  const canvasEvents = elements.get('#game');
  const captures = new Set();
  Object.assign(canvas, {
    addEventListener: canvasEvents.addEventListener.bind(canvasEvents),
    getBoundingClientRect: rect,
    setPointerCapture: id => captures.add(id),
    hasPointerCapture: id => captures.has(id),
    releasePointerCapture: id => captures.delete(id)
  });
  elements.set('#game', canvas);
  const $ = selector => {
    assert.ok(elements.has(selector), `Selector is absent from the real HTML: ${selector}`);
    return elements.get(selector);
  };
  const storage = new Map(Object.entries(initialStorage));
  const writes = [];
  let now = 1, pendingFrame, nextTimer = 0;
  const timers = new Map();
  const context = {
    console, Math, JSON, Number, String, Array, Map, Set, Promise,
    URLSearchParams, AbortController, structuredClone,
    location: { search: '?qa' },
    performance: { now: () => now },
    document: {
      hidden: false,
      querySelector: $,
      querySelectorAll: selector => {
        assert.equal(selector, 'dialog');
        return [...elements.values()].filter(el => el.tagName === 'DIALOG');
      },
      createElement: tag => new Element('', tag),
      addEventListener() {}
    },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => { storage.set(key, String(value)); writes.push({ key, value: String(value) }); }
    },
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 1,
    ResizeObserver: class { constructor(callback) { this.callback = callback; } observe() { this.callback(); } },
    requestAnimationFrame: callback => { pendingFrame = callback; },
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: id => timers.delete(id),
    addEventListener() {}
  };
  context.window = context;
  vm.createContext(context);
  for (const [name, code] of scripts) vm.runInContext(code, context, { filename: name });
  assert.ok(context.__lumaQA, 'The test loads the existing QA interface without rewriting game.js');

  function frame() {
    now += 1000 / 60;
    const callback = pendingFrame;
    assert.equal(typeof callback, 'function', 'Game scheduled its animation frame');
    pendingFrame = undefined;
    callback(now);
    for (const [id, timer] of [...timers]) if (timer.at <= now) {
      timers.delete(id);
      timer.callback();
    }
  }
  function frames(count) { for (let i = 0; i < count; i++) frame(); }
  function until(predicate, limit = 1800) {
    for (let i = 0; i < limit; i++) {
      if (predicate()) return;
      frame();
    }
    assert.fail(`Condition was not reached after ${limit} animation frames: ${JSON.stringify(context.__lumaQA.snapshot())}`);
  }
  function pointer(type, point) {
    canvasEvents.dispatch(type, { pointerId: 1, clientX: point.x, clientY: point.y });
  }
  function freehand(points) {
    pointer('pointerdown', points[0]);
    for (const point of points.slice(1, -1)) pointer('pointermove', point);
    pointer('pointerup', points.at(-1));
  }
  frames(1);
  return { $, storage, writes, qa: context.__lumaQA, chapters: context.FLOW_WORLDS,
    levels: context.FLOW_LEVELS, frame, frames, until, freehand, pointer,
    tap: point => pointer('pointerdown', point),
    progressWrites: () => writes.filter(write => write.key === PROGRESS) };
}

function solveThroughControls(app) {
  for (const [i, points] of app.qa.level().solutions.entries()) {
    app.freehand(points);
    assert.equal(app.qa.snapshot().strokes, i + 1, 'Pointer release committed the intended stroke');
    app.frames(72);
  }
  assert.equal(app.$('#pourBtn').disabled, false);
  app.$('#pourBtn').click();
  app.until(() => ['won', 'lost'].includes(app.qa.snapshot().state));
  assert.equal(app.qa.snapshot().state, 'won', 'Real water simulation reached the target');
}

test('win persists immediately and survives Retry before the result delay', () => {
  const app = boot({ [PROGRESS]: JSON.stringify({ 7: 2 }) });
  solveThroughControls(app);
  const wonAt = app.qa.snapshot().time;
  assert.equal(app.$('#result').hidden, true, 'Victory overlay has not appeared yet');
  const saved = app.storage.get(PROGRESS);
  assert.ok(JSON.parse(saved)[0] > 0, 'The newly won stage is already saved');
  assert.equal(JSON.parse(saved)[7], 2, 'Existing progress is preserved');
  assert.equal(app.progressWrites().length, 1, 'Victory is saved once');
  app.frames(10);
  assert.ok(app.qa.snapshot().time - wonAt < 1.1);
  assert.equal(app.$('#result').hidden, true);
  assert.equal(app.progressWrites().length, 1, 'Later winning ticks do not repeatedly save');
  app.$('#retryBtn').click();
  assert.equal(app.qa.snapshot().state, 'planning');
  assert.equal(app.qa.snapshot().strokes, 0);
  assert.equal(app.storage.get(PROGRESS), saved, 'Retry cannot discard the just-earned clear');

  const reloaded = boot(Object.fromEntries(app.storage));
  reloaded.$('#mapBtn').click();
  assert.match(reloaded.$('#journeyCount').textContent, /^2 \/ 50 クリア/);
  assert.ok(reloaded.$('#levelGrid').children[0].classList.contains('done'), 'A fresh game session reads the saved clear');
});

test('demo can win and show its result without writing or modifying saved progress', () => {
  const saved = JSON.stringify({ 12: 2 });
  const app = boot({ [PROGRESS]: saved });
  app.$('#hintBtn').click();
  assert.equal(app.$('#hintDialog').open, true);
  app.$('#demoBtn').click();
  assert.equal(app.$('#hintDialog').open, false);
  app.until(() => ['won', 'lost'].includes(app.qa.snapshot().state));
  assert.equal(app.qa.snapshot().state, 'won', 'Demo really completed, rather than merely failing to save');
  assert.equal(app.$('#result').hidden, true);
  app.until(() => !app.$('#result').hidden, 100);
  assert.equal(app.$('#resultTitle').textContent, '仕組みをつかんだ？');
  assert.equal(app.$('#nextBtn').textContent, '自分で挑戦');
  assert.equal(app.progressWrites().length, 0);
  assert.equal(app.storage.get(PROGRESS), saved);
  app.$('#nextBtn').click();
  assert.equal(app.qa.snapshot().state, 'planning');
  assert.equal(app.qa.level().id, 1, 'Demo action returns to the same stage');
  assert.equal(app.storage.get(PROGRESS), saved);
});

test('assist Undo removes unfinished points before touching a completed stroke', () => {
  const app = boot({ [PREFS]: JSON.stringify({ assist: true }) });
  for (const point of app.qa.level().solutions[0]) app.tap(point);
  assert.equal(app.$('#dropLineBtn').hidden, false);
  app.$('#dropLineBtn').click();
  app.frames(72);
  const committed = app.qa.snapshot();
  assert.equal(committed.strokes, 1);
  app.tap({ x: 300, y: 180 });
  app.tap({ x: 335, y: 195 });
  assert.equal(app.$('#dropLineBtn').hidden, false, 'Two unfinished assist points exist');
  assert.equal(app.$('#undoBtn').disabled, false);

  app.$('#undoBtn').click();
  assert.equal(app.qa.snapshot().strokes, 1);
  assert.equal(app.qa.snapshot().ink, committed.ink);
  assert.equal(app.$('#dropLineBtn').hidden, true, 'One point remains, so it cannot be committed');
  app.$('#undoBtn').click();
  assert.equal(app.qa.snapshot().strokes, 1, 'Removing the final pending point preserves the completed line');
  assert.equal(app.qa.snapshot().ink, committed.ink);
  app.$('#undoBtn').click();
  assert.equal(app.qa.snapshot().strokes, 0, 'Only the next Undo removes the completed line');
  assert.equal(app.qa.snapshot().ink, 0);
  assert.equal(app.$('#undoBtn').disabled, true);
});

test('seventeen three-stage world maps expose all 50 stages and every tile constructs and renders its own level', () => {
  const app = boot({ [PROGRESS]: JSON.stringify({ 0: 3, 9: 1, 49: 2 }) });
  assert.equal(app.chapters.length, 17);
  assert.equal(app.levels.length, 50);
  const visited = new Set();
  for (let chapter = 0; chapter < 17; chapter++) {
    for (let offset = 0; offset < app.chapters[chapter].end-app.chapters[chapter].start+1; offset++) {
      app.$('#mapBtn').click();
      assert.equal(app.$('#mapDialog').open, true);
      assert.equal(app.$('#chapterTabs').children.length, 17);
      app.$('#chapterTabs').children[chapter].click();
      const tabs = app.$('#chapterTabs').children;
      assert.equal(tabs.filter(tab => tab.getAttribute('aria-selected') === 'true').length, 1);
      assert.equal(tabs[chapter].getAttribute('aria-selected'), 'true');
      assert.equal(app.$('#mapChapterName').textContent, app.chapters[chapter].name);
      const grid = app.$('#levelGrid').children;
      assert.equal(grid.length, app.chapters[chapter].end-app.chapters[chapter].start+1);
      const index = chapter * 3 + offset;
      const level = app.levels[index];
      const tile = grid[offset];
      assert.equal(tile.getAttribute('aria-label'), `ステージ${level.id} ${level.name}`);
      assert.match(tile.innerHTML, new RegExp(`<span>${String(level.id).padStart(2, '0')}</span>`));
      assert.equal(tile.classList.contains('done'), [0, 9, 49].includes(index));
      tile.click();
      app.frame();
      assert.equal(app.$('#mapDialog').open, false);
      assert.equal(app.qa.level().id, index + 1, 'Tile closure loads the selected stage, not the last stage');
      assert.equal(app.$('#levelName').textContent, level.name);
      assert.ok(app.$('#app').style.backgroundImage.includes(app.chapters[chapter].image), 'Correct area art remains paired with every stage');
      assert.equal(app.$('#app').style['--world-accent'], app.chapters[chapter].accent);
      assert.ok(app.$('#chapterLabel').textContent.includes(app.chapters[chapter].name));
      assert.equal(app.qa.snapshot().state, 'planning');
      assert.equal(app.qa.snapshot().strokes, 0);
      assert.equal(app.qa.snapshot().cups.length, level.cups.length);
      assert.ok(app.qa.snapshot().bodyCount > 0);
      assert.equal(app.qa.snapshot().finite, true);
      visited.add(app.qa.level().id);
    }
  }
  assert.deepEqual([...visited].sort((a, b) => a - b), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(app.progressWrites().length, 0, 'Map navigation never awards progress');
});


test('adjust restores the pre-pour design through controls and retains Undo', () => {
  const app = boot();
  for (const points of app.qa.level().solutions) { app.freehand(points); app.frames(72); }
  const before = JSON.parse(JSON.stringify(app.qa.snapshot()));
  app.$('#pourBtn').click(); app.frames(120);
  assert.ok(app.qa.snapshot().emitted > 0);
  assert.equal(app.$('#adjustBtn').disabled, false);
  app.$('#adjustBtn').click();
  const restored = JSON.parse(JSON.stringify(app.qa.snapshot()));
  assert.deepEqual(restored, before);
  assert.equal(app.$('#result').hidden, true);
  app.$('#undoBtn').click();
  assert.equal(app.qa.snapshot().strokes, before.strokes - 1);
  assert.ok(app.qa.snapshot().ink < before.ink);
  assert.equal(app.progressWrites().length, 0);
});

test('2x control speeds simulation with the same fixed-step outcome', () => {
  function attempt(fast) {
    const app = boot({ [PREFS]: JSON.stringify({ speed: 1 }) });
    for (const points of app.qa.level().solutions) { app.freehand(points); app.frames(72); }
    app.$('#pourBtn').click();
    if (fast) app.$('#speedBtn').click();
    let frames = 0;
    while (!['won','lost'].includes(app.qa.snapshot().state) && frames < 1200) {app.frame(); frames++;}
    const s = app.qa.snapshot();
    return {frames, state:s.state, cups:JSON.parse(JSON.stringify(s.cups))};
  }
  const normal=attempt(false),fast=attempt(true);
  assert.equal(normal.state,'won'); assert.equal(fast.state,'won');
  assert.ok(fast.frames <= Math.ceil(normal.frames / 2)+1);
  for(let i=0;i<normal.cups.length;i++) assert.ok(Math.abs(normal.cups[i].collected-fast.cups[i].collected)<=2);
});


test('obstacle contact preserves the valid part of a pointer stroke', () => {
 const app=boot();app.freehand([{x:63,y:170},{x:63,y:260}]);
 const state=app.qa.snapshot();assert.equal(state.strokes,1);assert.ok(state.ink>45&&state.ink<58);
 assert.match(app.$('#toast').textContent,/手前/);
});

test('drawing pauses moving supports until the pointer is released', () => {
 const app=boot();app.freehand(app.qa.level().solutions[0]);
 const before=app.qa.snapshot().time;
 app.pointer('pointerdown',{x:300,y:140});app.pointer('pointermove',{x:340,y:140});app.frames(90);
 assert.equal(app.qa.snapshot().time,before);
 app.pointer('pointerup',{x:340,y:140});app.frames(5);
 assert.ok(app.qa.snapshot().time>before);assert.equal(app.qa.snapshot().strokes,2);
});

test('failure primary action retains design and selected speed survives retry and reload', () => {
 const app=boot();app.freehand([{x:300,y:140},{x:340,y:140}]);const ink=app.qa.snapshot().ink;
 app.$('#pourBtn').click();assert.equal(app.$('#speedBtn').textContent,'2×');app.$('#speedBtn').click();
 app.until(()=>!app.$('#result').hidden);assert.equal(app.qa.snapshot().state,'lost');
 assert.equal(app.$('#nextBtn').textContent,'線を残して調整');app.$('#nextBtn').click();
 assert.equal(app.qa.snapshot().state,'planning');assert.equal(app.qa.snapshot().strokes,1);assert.equal(app.qa.snapshot().ink,ink);
 app.$('#retryBtn').click();assert.equal(app.$('#speedBtn').textContent,'1×');
 const reload=boot(Object.fromEntries(app.storage));assert.equal(reload.$('#speedBtn').textContent,'1×');
});
