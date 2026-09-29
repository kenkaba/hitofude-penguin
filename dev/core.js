// ===== ひとふでペンギン core: physics + levels (shared by game and tests) =====
(function (root) {
  const W = 600, H = 900, SEA = 850;
  const G = 0.34, R = 16, WALK = 1.7, MAXV = 22, SUB = 4, LINE_T = 5;
  const MU = 0.03, BOOST = 11, TIME_LIMIT = 60 * 25, CRUMBLE_T = 26;

  function corners(b) {
    const a = (b.a || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), hw = b.w / 2, hh = b.h / 2;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [b.x + x * c - y * s, b.y + x * s + y * c]);
  }
  function inRect(px, py, b, pad) {
    const a = -(b.a || 0) * Math.PI / 180, dx = px - b.x, dy = py - b.y;
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(lx) <= b.w / 2 + pad && Math.abs(ly) <= b.h / 2 + pad;
  }
  function seg(a, b, t, kind, extra) {
    return Object.assign({ ax: a[0], ay: a[1], bx: b[0], by: b[1], t: t || 0, kind: kind || 'solid' }, extra || {});
  }
  function distToSeg(px, py, s) {
    const ex = s.bx - s.ax, ey = s.by - s.ay, l2 = ex * ex + ey * ey || 1e-6;
    let u = ((px - s.ax) * ex + (py - s.ay) * ey) / l2; u = u < 0 ? 0 : u > 1 ? 1 : u;
    const cx = s.ax + u * ex, cy = s.ay + u * ey;
    return Math.hypot(px - cx, py - cy);
  }

  // igloo: solid dome + roofed doorway. door = -1 (opening faces left) or 1 (faces right)
  const IG_R = 46, IG_DOOR_H = 42, IG_PORCH = 10;
  function igloo(g) {
    const d = g.door || -1, cx = g.x - 6 * d, y = g.y;
    const th = Math.asin(IG_DOOR_H / IG_R);            // angle above ground where the doorway roof meets the dome
    const roofX = cx + d * IG_R * Math.cos(th);        // dome x at doorway-roof height (door side)
    const outerX = cx + d * (IG_R + IG_PORCH);         // front edge of porch roof
    // dome arc from doorway roof, over the top, down to ground on the back side
    const arc = [];
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const a = th + (Math.PI - th) * i / n;          // th .. PI measured from door side
      arc.push([cx + d * IG_R * Math.cos(a), y - IG_R * Math.sin(a)]);
    }
    return { d, cx, y, roofX, outerX, roofY: y - IG_DOOR_H, arc,
      sensor: { x0: Math.min(cx + d * 30, cx - d * 14), x1: Math.max(cx + d * 30, cx - d * 14), y0: y - IG_DOOR_H, y1: y + 4 } };
  }
  function buildColliders(L) {
    const out = [];
    { const g = igloo(L.goal);
      for (let i = 0; i < g.arc.length - 1; i++) out.push(seg(g.arc[i], g.arc[i + 1], 0, 'solid', { igloo: 1 }));
      out.push(seg([g.outerX, g.roofY], [g.roofX, g.roofY], 0, 'solid', { igloo: 1 }));
      if ((L.keys || []).length) out.push(seg([g.outerX, g.y], [g.outerX, g.roofY], 0, 'gate')); }
    out.push(seg([0, -3000], [0, H], 0), seg([W, -3000], [W, H], 0));
    for (const b of L.blocks || []) { const c = corners(b); for (let i = 0; i < 4; i++) out.push(seg(c[i], c[(i + 1) % 4], 0, 'solid', b.k ? { k: b.k } : undefined)); }
    for (const b of L.pads || []) {
      const c = corners(b);
      out.push(seg(c[0], c[1], 0, 'pad', { power: b.power || 17 }));
      for (let i = 1; i < 4; i++) out.push(seg(c[i], c[(i + 1) % 4], 0));
    }
    for (const b of L.spikes || []) { const c = corners(b); for (let i = 0; i < 4; i++) out.push(seg(c[i], c[(i + 1) % 4], 2, 'spike')); }
    for (const b of L.boosts || []) out.push(seg([b.x1, b.y - 1], [b.x2, b.y - 1], 0, 'boost', { dir: b.dir, speed: b.speed || BOOST }));
    (L.crumbles || []).forEach((b, ci) => { const c = corners(b); for (let i = 0; i < 4; i++) out.push(seg(c[i], c[(i + 1) % 4], 0, 'solid', { ci })); });
    return out;
  }

  function moverRect(m, frame) {
    const k = Math.sin(2 * Math.PI * frame / m.period + (m.phase || 0));
    return { x: m.x + (m.dx || 0) * k, y: m.y + (m.dy || 0) * k, w: m.w, h: m.h, a: m.a || 0 };
  }
  function updateMovers(w) {
    w.moverSegs.length = 0;
    for (const m of w.L.movers || []) { const c = corners(moverRect(m, w.frame)); for (let i = 0; i < 4; i++) w.moverSegs.push(seg(c[i], c[(i + 1) % 4], 2, 'spike')); }
  }
  function ballPos(b, frame) {
    if (b.rad) { const a = 2 * Math.PI * frame / b.period + (b.phase || 0); return [b.cx + Math.cos(a) * b.rad, b.cy + Math.sin(a) * b.rad]; }
    if (b.period) { const k = Math.sin(2 * Math.PI * frame / b.period + (b.phase || 0)); return [b.x + (b.dx || 0) * k, b.y + (b.dy || 0) * k]; }
    return [b.x, b.y];
  }
  // urchins with "wake" sit still until the penguin comes within that distance, then always run the same motion
  // from that moment (so the outcome depends on the route, not on when the run started)
  function ballClock(w, b, i) { if (!b.wake) return w.frame; const t0 = w.wakeAt && w.wakeAt[i]; return t0 === undefined || t0 < 0 ? 0 : w.frame - t0; }
  function makeWorld(L) {
    return {
      L, statics: buildColliders(L), strokes: [], strokeSegs: [],
      p: { x: L.start.x, y: L.start.y, vx: 0, vy: 0, dir: L.start.dir, grounded: false, gn: { x: 0, y: -1 }, turnCd: 0, impact: 0, lastTurn: 0 },
      rollers: (L.rollers || []).map(r => ({ x: r.x, y: r.y, vx: r.vx || 0, vy: 0, r: r.r || 15, delay: r.delay || 0, alive: true, rot: 0 })),
      crumble: (L.crumbles || []).map(() => -1), gone: (L.crumbles || []).map(() => false), moverSegs: [],
      ig: igloo(L.goal), keys: (L.keys || []).map(() => false), open: !(L.keys || []).length,
      state: 'ready', frame: 0, fish: (L.fish || []).map(() => false), inkUsed: 0, events: [], failReason: ''
    };
  }

  // can a stroke point be placed here?
  function canPlace(w, x, y) {
    if (x < 4 || x > W - 4 || y > SEA - 4) return false;
    const L = w.L; let bad = false;
    for (const b of L.blocks || []) if (inRect(x, y, b, 2)) return false;
    for (const b of L.pads || []) if (inRect(x, y, b, 3)) return false;
    for (const b of L.spikes || []) if (inRect(x, y, b, 3)) return false;
    for (const b of L.nodraw || []) if (inRect(x, y, b, 0)) return false;
    for (const pt of L.portals || []) if (Math.hypot(x - pt.a[0], y - pt.a[1]) < 24 || Math.hypot(x - pt.b[0], y - pt.b[1]) < 24) return false;
    (L.crumbles || []).forEach((b, i) => { if (!w.gone[i] && inRect(x, y, b, 2)) bad = true; });
    if (bad) return false;
    if (w.state === 'ready') for (const m of L.movers || []) if (inRect(x, y, moverRect(m, 0), 3)) return false;
    for (const b of L.balls || []) { if (b.period && w.state !== 'ready') continue; const q = ballPos(b, w.state === 'ready' ? 0 : w.frame); if (Math.hypot(x - q[0], y - q[1]) < (b.r || 14) + 3) return false; }
    for (const r of w.rollers || []) if (r.alive && Math.hypot(x - r.x, y - r.y) < r.r + 6) return false;
    if (Math.hypot(x - w.p.x, y - w.p.y) < R + LINE_T + 3) return false;
    { const g = igloo(L.goal);
      if (y < g.y + 2 && Math.hypot(x - g.cx, y - g.y) < IG_R + 7) return false;
      if (x > Math.min(g.outerX, g.cx) - 7 && x < Math.max(g.outerX, g.cx) + 7 && y > g.roofY - 7 && y < g.y + 2) return false; }
    return true;
  }
  // forgiving placement: if the finger is slightly inside the top of a block, lift the point onto its surface
  function snap(w, x, y) {
    if (canPlace(w, x, y)) return [x, y];
    const L = w.L;
    const solids = (L.blocks || []).concat(L.pads || [], (L.crumbles || []).filter((b, i) => !w.gone[i]));
    for (const b of solids) {
      if (!inRect(x, y, b, 3)) continue;
      const c = corners(b), top = Math.min(c[0][1], c[1][1]);
      if (y - top < 28) { const q = [x, top - 5]; if (canPlace(w, q[0], q[1])) return q; }
    }
    return null;
  }
  function contentTop(L) {
    let top = Math.min(L.start.y - 40, L.goal.y - 90);
    for (const b of [].concat(L.blocks || [], L.pads || [], L.spikes || [], L.crumbles || [], L.fans || [], L.nodraw || [])) top = Math.min(top, Math.min(...corners(b).map(c => c[1])));
    for (const k of L.keys || []) top = Math.min(top, k[1] - 30);
    for (const f of L.fish || []) top = Math.min(top, f[1] - 20);
    for (const b of L.balls || []) top = Math.min(top, b.rad ? b.cy - b.rad - (b.r || 14) : b.y - Math.abs(b.dy || 0) - (b.r || 14));
    for (const m of L.movers || []) top = Math.min(top, m.y - Math.abs(m.dy || 0) - m.h);
    for (const r of L.rollers || []) top = Math.min(top, 20);
    for (const pt of L.portals || []) top = Math.min(top, pt.a[1] - 40, pt.b[1] - 40);
    return Math.max(-20, top - 50);
  }
  function segClearOfPenguin(w, a, b) {
    return distToSeg(w.p.x, w.p.y, { ax: a[0], ay: a[1], bx: b[0], by: b[1] }) > R + LINE_T + 1;
  }
  function addStroke(w, pts) {
    if (pts.length < 2) return false;
    const s = { pts: pts.map(p => [p[0], p[1]]), born: w.frame };
    w.strokes.push(s);
    for (let i = 0; i < pts.length - 1; i++) if (pts[i] && pts[i + 1]) w.strokeSegs.push(seg(pts[i], pts[i + 1], LINE_T, 'line', { owner: s }));
    return true;
  }
  function removeLastStroke(w) {
    const s = w.strokes.pop(); if (!s) return null;
    w.strokeSegs = w.strokeSegs.filter(g => g.owner !== s);
    return s;
  }
  function strokeLen(pts) { let l = 0; for (let i = 1; i < pts.length; i++) if (pts[i] && pts[i - 1]) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; }

  function collide(w, s, contacts, body) {
    const p = body || w.p, isP = !body;
    if (s.ci !== undefined && w.gone[s.ci]) return;
    if (s.kind === 'gate' && w.open) return;
    if (s.k === 'wall' && w.open) return;
    if (s.k === 'bridge' && !w.open) return;
    if (!isP && (s.kind === 'spike' || s.kind === 'boost')) return;
    const Rb = isP ? R : p.r;
    const ex = s.bx - s.ax, ey = s.by - s.ay, l2 = ex * ex + ey * ey || 1e-6;
    let u = ((p.x - s.ax) * ex + (p.y - s.ay) * ey) / l2; u = u < 0 ? 0 : u > 1 ? 1 : u;
    const cx = s.ax + u * ex, cy = s.ay + u * ey;
    let dx = p.x - cx, dy = p.y - cy; const rr = Rb + s.t, d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr) return;
    if (isP && s.ci !== undefined && w.crumble[s.ci] < 0) { w.crumble[s.ci] = w.frame; w.events.push({ t: 'crack', i: s.ci }); }
    if (s.kind === 'spike') { w.dead = 'spike'; return; }
    let d = Math.sqrt(d2), nx, ny;
    if (d < 1e-4) { const l = Math.sqrt(l2); nx = -ey / l; ny = ex / l; d = 0; } else { nx = dx / d; ny = dy / d; }
    const pen = rr - d; p.x += nx * pen; p.y += ny * pen;
    const vn = p.vx * nx + p.vy * ny;
    if (vn < 0) {
      if (s.kind === 'pad') {
        p.vx += nx * (s.power - vn); p.vy += ny * (s.power - vn);
        if (isP) w.events.push({ t: 'boing', x: cx, y: cy });
      } else {
        p.vx -= nx * vn; p.vy -= ny * vn;
        const tx = -ny, ty = nx, vt = p.vx * tx + p.vy * ty, f = Math.min(Math.abs(vt), MU * -vn);
        p.vx -= tx * Math.sign(vt) * f; p.vy -= ty * Math.sign(vt) * f;
        if (isP && -vn > p.impact) p.impact = -vn;
      }
    }
    if (isP && s.kind === 'boost') {
      const tx = -ny, ty = nx, vt = p.vx * tx + p.vy * ty, target = s.dir * s.speed;
      if (Math.abs(vt) < s.speed) { p.vx += tx * (target - vt); p.vy += ty * (target - vt); }
      if (p.dir !== s.dir) p.dir = s.dir;
      if (!p.boosted) w.events.push({ t: 'boost', x: cx, y: cy });
      p.boosted = 8;
    }
    if (isP && s.owner && s.owner.touched === undefined && w.L.melt) s.owner.touched = w.frame;
    if (contacts) contacts.push(nx, ny, s.kind);
  }

  function step(w) {
    if (w.state !== 'run') return;
    const p = w.p, L = w.L;
    w.frame++;
    w.crumble.forEach((t0, i) => { if (t0 >= 0 && !w.gone[i] && w.frame - t0 > CRUMBLE_T) { w.gone[i] = true; w.events.push({ t: 'break', i }); } });
    updateMovers(w);
    if (L.melt) { let changed = false; for (const st of w.strokes) if (st.touched !== undefined && !st.melted && w.frame - st.touched > L.melt) { st.melted = true; changed = true; w.events.push({ t: 'melt' }); } if (changed) w.strokeSegs = w.strokeSegs.filter(g => !g.owner.melted); }
    // portals
    if (p.warpCd > 0) p.warpCd--;
    for (const pt of L.portals || []) for (const [a, b] of [[pt.a, pt.b], [pt.b, pt.a]]) {
      if (!(p.warpCd > 0) && Math.hypot(p.x - a[0], p.y - a[1]) < 20) { p.x = b[0]; p.y = b[1]; p.warpCd = 40; w.events.push({ t: 'warp', x: a[0], y: a[1], x2: b[0], y2: b[1] }); }
      for (const r of w.rollers) if (r.alive && !(r.warpCd > 0) && Math.hypot(r.x - a[0], r.y - a[1]) < 20) { r.x = b[0]; r.y = b[1]; r.warpCd = 40; }
    }
    for (const r of w.rollers) if (r.warpCd > 0) r.warpCd--;
    if (p.turnCd > 0) p.turnCd--;
    if (p.boosted > 0) p.boosted--;
    // walking
    if (p.grounded) {
      const tx = -p.gn.y, ty = p.gn.x, vt = p.vx * tx + p.vy * ty, d = p.dir;
      if (vt * d < WALK) { const add = Math.min(0.3, WALK - vt * d); p.vx += tx * d * add; p.vy += ty * d * add; }
      else if (!p.boosted) { const ex = vt - d * WALK, k = ex * 0.006; p.vx -= tx * k; p.vy -= ty * k; }
    }
    for (const f of L.fans || []) if (inRect(p.x, p.y, f, 0)) { if (f.wx) p.vx += f.wx; else p.vy -= f.power; }
    const contacts = [];
    if (!w.wakeAt) w.wakeAt = (L.balls || []).map(() => -1);
    (L.balls || []).forEach((b, i) => { if (b.wake && w.wakeAt[i] < 0 && Math.hypot(p.x - (b.cx !== undefined ? b.cx : b.x), p.y - (b.cy !== undefined ? b.cy : b.y)) < b.wake) { w.wakeAt[i] = w.frame; w.events.push({ t: 'wake', i }); } });
    const ballNow = (L.balls || []).map((b, i) => { const q = ballPos(b, ballClock(w, b, i)); return [q[0], q[1], b.r || 14]; });
    p.impact = 0; w.dead = null;
    for (let i = 0; i < SUB; i++) {
      p.vy += G / SUB; p.x += p.vx / SUB; p.y += p.vy / SUB;
      for (const s of w.statics) collide(w, s, contacts);
      for (const s of w.strokeSegs) collide(w, s, contacts);
      for (const s of w.moverSegs) collide(w, s, contacts);
      for (const r of w.rollers) {
        if (!r.alive || w.frame <= r.delay) continue;
        r.vy += G / SUB; r.x += r.vx / SUB; r.y += r.vy / SUB;
        for (const s of w.statics) collide(w, s, null, r);
        for (const s of w.strokeSegs) collide(w, s, null, r);
        if (Math.hypot(p.x - r.x, p.y - r.y) < R + r.r - 3) w.dead = 'ball';
      }
      for (let bi = 0; bi < ballNow.length; bi++) { const q = ballNow[bi]; if (Math.hypot(p.x - q[0], p.y - q[1]) < R + q[2] - 3) w.dead = 'ball'; }
      if (w.dead) break;
    }
    const sp = Math.hypot(p.vx, p.vy); if (sp > MAXV) { p.vx *= MAXV / sp; p.vy *= MAXV / sp; }
    // ground & walls
    let g = null, turn = false, solid = false;
    for (let i = 0; i < contacts.length; i += 3) {
      const nx = contacts[i], ny = contacts[i + 1];
      if (ny < -0.3) { const sc = nx * p.dir; if (!g || sc < g.sc) g = { x: nx, y: ny, sc }; if (ny < -0.55) solid = true; }
      if (Math.abs(nx) > 0.8 && ny > -0.3 && nx * p.dir < 0) turn = true;
    }
    const wasAir = !p.grounded;
    p.grounded = !!g && (solid || g.sc < 0); if (p.grounded) p.gn = g;
    if (wasAir && p.grounded && p.impact > 3) w.events.push({ t: 'land', v: p.impact });
    if (turn && p.turnCd === 0 && !p.boosted) { p.dir = -p.dir; p.turnCd = 14; w.events.push({ t: 'turn' }); }
    // pickups & outcomes
    (L.keys || []).forEach((k, i) => { if (!w.keys[i] && Math.hypot(p.x - k[0], p.y - k[1]) < R + 14) { w.keys[i] = true; w.events.push({ t: 'key', x: k[0], y: k[1] }); if (w.keys.every(Boolean)) { w.open = true; w.events.push({ t: 'open' }); } } });
    if (L.gold && !w.goldGot && Math.hypot(p.x - L.gold[0], p.y - L.gold[1]) < R + 14) { w.goldGot = true; w.events.push({ t: 'gold', x: L.gold[0], y: L.gold[1] }); }
    (L.fish || []).forEach((f, i) => { if (!w.fish[i] && Math.hypot(p.x - f[0], p.y - f[1]) < R + 14) { w.fish[i] = true; w.events.push({ t: 'fish', x: f[0], y: f[1] }); } });
    const gs = w.ig.sensor;
    if (p.x > gs.x0 && p.x < gs.x1 && p.y > gs.y0 && p.y < gs.y1) { w.state = 'win'; w.events.push({ t: 'win' }); return; }
    for (const r of w.rollers) { if (r.alive) { r.rot += r.vx / r.r; if (r.y > SEA + 30) { r.alive = false; w.events.push({ t: 'plop', x: r.x }); } } }
    if (w.dead) { w.state = 'fail'; w.failReason = w.dead; w.events.push({ t: 'fail', why: w.dead }); return; }
    if (p.y > SEA + 10) { w.state = 'fail'; w.failReason = 'sea'; w.events.push({ t: 'fail', why: 'sea' }); return; }
    if (w.frame > TIME_LIMIT) { w.state = 'fail'; w.failReason = 'time'; w.events.push({ t: 'fail', why: 'time' }); }
  }

  function stars(w) {
    if (w.state !== 'win') return { total: 0, clear: false, fish: false, ink: false };
    const fish = w.fish.every(Boolean), ink = w.inkUsed <= w.L.par;
    return { clear: true, fish, ink, total: 1 + (fish ? 1 : 0) + (ink ? 1 : 0) };
  }

  // ---------- levels ----------
  const LEVELS = [ 
    { "name": "はじめの一筆", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 530, "y": 500 }, "blocks": [ { "x": 110, "y": 700, "w": 220, "h": 400 }, { "x": 490, "y": 700, "w": 220, "h": 400 } ], "fish": [ [ 300, 468 ] ], "ink": 420, "par": 190, "hint": "すき間に線を引くと、氷の橋になる", "dev": 170 }, 
    { "name": "二つの谷", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 500 }, "blocks": [ { "x": 75, "y": 700, "w": 150, "h": 400 }, { "x": 300, "y": 700, "w": 100, "h": 400 }, { "x": 525, "y": 700, "w": 150, "h": 400 } ], "fish": [ [ 200, 445 ] ], "ink": 320, "par": 215, "dev": 192 }, 
    { "name": "ウニのすべり台", "start": { "x": 40, "y": 224, "dir": 1 }, "goal": { "x": 545, "y": 630 }, "blocks": [ { "x": 80, "y": 260, "w": 160, "h": 40 }, { "x": 480, "y": 760, "w": 240, "h": 260 } ], "balls": [ { "x": 218, "y": 430, "r": 16 }, { "x": 300, "y": 480, "r": 16 } ], "fish": [ [ 262, 330 ] ], "ink": 515, "par": 475, "hint": "紫のウニは線をすり抜ける。触れたらアウト", "dev": 430 }, 
    { "name": "ウニの谷", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 540, "y": 500 }, "blocks": [ { "x": 100, "y": 700, "w": 200, "h": 400 }, { "x": 500, "y": 700, "w": 200, "h": 400 } ], "balls": [ { "x": 300, "y": 458, "r": 14 } ], "fish": [ [ 300, 515 ] ], "ink": 320, "par": 250, "dev": 227 }, 
    { "name": "描けない空", "start": { "x": 40, "y": 204, "dir": 1 }, "goal": { "x": 545, "y": 500 }, "blocks": [ { "x": 80, "y": 240, "w": 160, "h": 40 }, { "x": 485, "y": 700, "w": 230, "h": 400 } ], "nodraw": [ { "x": 305, "y": 420, "w": 110, "h": 860 } ], "balls": [], "fish": [ [ 300, 392 ] ], "ink": 320, "par": 215, "hint": "赤い斜線の中には描けない", "dev": 194 }, 
    { "name": "ワープ", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 300 }, "blocks": [ { "x": 100, "y": 700, "w": 200, "h": 400 }, { "x": 510, "y": 600, "w": 180, "h": 600 } ], "portals": [ { "a": [ 300, 600 ], "b": [ 470, 270 ] } ], "fish": [ [ 250, 560 ] ], "ink": 300, "par": 150, "hint": "青い穴に入ると、もう一方の穴から出てくる", "dev": 133 }, 
    { "name": "ワープの罠", "start": { "x": 40, "y": 684, "dir": 1 }, "goal": { "x": 545, "y": 700 }, "blocks": [ { "x": 190, "y": 800, "w": 380, "h": 200 }, { "x": 530, "y": 800, "w": 140, "h": 200 } ], "portals": [ { "a": [ 250, 684 ], "b": [ 420, 300 ] } ], "fish": [ [ 250, 640 ] ], "ink": 360, "par": 240, "dev": 214, "gold": [ 422, 300 ] }, 
    { "name": "穴から穴へ", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 700 }, "blocks": [ { "x": 120, "y": 700, "w": 240, "h": 400 }, { "x": 510, "y": 800, "w": 180, "h": 200 } ], "portals": [ { "a": [ 200, 484 ], "b": [ 330, 250 ] } ], "balls": [ { "x": 370, "y": 480, "r": 15 } ], "fish": [ [ 360, 280 ] ], "ink": 475, "par": 435, "dev": 391 }, 
    { "name": "ウニの行列", "start": { "x": 40, "y": 544, "dir": 1 }, "goal": { "x": 545, "y": 560 }, "blocks": [ { "x": 75, "y": 730, "w": 150, "h": 340 }, { "x": 525, "y": 730, "w": 150, "h": 340 } ], "balls": [ { "x": 220, "y": 505, "dy": 45, "period": 100, "phase": 2.0944, "r": 14 }, { "x": 300, "y": 505, "dy": 45, "period": 100, "phase": 4.1944, "r": 14 }, { "x": 380, "y": 505, "dy": 45, "period": 100, "phase": 0.0112, "r": 14 } ], "fish": [ [ 300, 628 ] ], "ink": 460, "par": 395, "dev": 355 },
    { "name": "追ってくるウニ", "start": { "x": 180, "y": 624, "dir": 1 }, "goal": { "x": 545, "y": 640 }, "blocks": [ { "x": 50, "y": 320, "w": 100, "h": 40 }, { "x": 225, "y": 770, "w": 210, "h": 260 }, { "x": 515, "y": 770, "w": 170, "h": 260 } ], "rollers": [ { "x": 50, "y": 284, "r": 15, "delay": 20, "vx": 4 } ], "fish": [ [ 380, 600 ] ], "ink": 360, "par": 290, "hint": "赤いウニは線で止まり、線の上を転がる", "dev": 260 }, 
    { "name": "ワープとウニ", "start": { "x": 40, "y": 584, "dir": 1 }, "goal": { "x": 545, "y": 600 }, "blocks": [ { "x": 100, "y": 750, "w": 200, "h": 300 }, { "x": 510, "y": 750, "w": 180, "h": 300 } ], "rollers": [ { "x": 80, "y": -40, "r": 15, "delay": 5 } ], "portals": [ { "a": [ 80, 160 ], "b": [ 270, 300 ] } ], "fish": [ [ 310, 560 ] ], "ink": 485, "par": 445, "needStars": 18, "dev": 403 }, 
    { "name": "ワープで鍵を", "start": { "x": 195, "y": 684, "dir": 1 }, "goal": { "x": 60, "y": 700, "door": 1 }, "blocks": [ { "x": 132.5, "y": 800, "w": 265, "h": 200 }, { "x": 510, "y": 195, "w": 180, "h": 30 } ], "portals": [ { "a": [ 240, 684 ], "b": [ 470, 140 ] } ], "keys": [ [ 560, 150 ] ], "fish": [ [ 300, 420 ] ], "ink": 620, "par": 580, "hint": "鍵を取るまで、かまくらの扉は開かない", "dev": 525 }, 
    { "name": "行列の向こうの鍵", "start": { "x": 120, "y": 544, "dir": -1 }, "goal": { "x": 545, "y": 560 }, "blocks": [ { "x": 30, "y": 730, "w": 60, "h": 340 }, { "x": 125, "y": 730, "w": 50, "h": 340 }, { "x": 525, "y": 730, "w": 150, "h": 340 } ], "balls": [ { "x": 220, "y": 505, "dy": 45, "period": 115, "phase": 0, "r": 14 }, { "x": 300, "y": 505, "dy": 45, "period": 115, "phase": 2.1, "r": 14 }, { "x": 380, "y": 505, "dy": 45, "period": 115, "phase": 4.2, "r": 14 } ], "fish": [ [ 300, 628 ] ], "ink": 560, "keys": [ [ 25, 528 ] ], "par": 435, "dev": 391 },
    { "name": "ウニが降ってくる", "start": { "x": 40, "y": 584, "dir": 1 }, "goal": { "x": 540, "y": 600 }, "blocks": [ { "x": 130, "y": 750, "w": 260, "h": 300 }, { "x": 490, "y": 750, "w": 220, "h": 300 } ], "rollers": [ { "x": 320, "y": -40, "r": 15, "delay": 20 } ], "fish": [ [ 320, 528 ] ], "ink": 360, "par": 260, "dev": 232 }, 
    { "name": "鍵の橋", "start": { "x": 180, "y": 484, "dir": -1 }, "goal": { "x": 545, "y": 500 }, "blocks": [ { "x": 35, "y": 700, "w": 70, "h": 400 }, { "x": 180, "y": 700, "w": 100, "h": 400 }, { "x": 510, "y": 700, "w": 180, "h": 400 }, { "x": 325, "y": 510, "w": 190, "h": 20, "k": "bridge" } ], "keys": [ [ 30, 468 ] ], "fish": [ [ 325, 470 ] ], "ink": 150, "par": 65, "hint": "鍵を取ると、消えていた橋が現れる", "dev": 56 }, 
    { "name": "ウニの着地点", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 700 }, "blocks": [ { "x": 120, "y": 700, "w": 240, "h": 400 }, { "x": 510, "y": 800, "w": 180, "h": 200 } ], "portals": [ { "a": [ 200, 484 ], "b": [ 330, 250 ] } ], "balls": [ { "x": 370, "y": 480, "r": 15 }, { "x": 400, "y": 560, "r": 15 } ], "fish": [ [ 360, 280 ] ], "ink": 560, "par": 435, "dev": 391 }, 
    { "name": "降りそそぐウニ", "start": { "x": 40, "y": 584, "dir": 1 }, "goal": { "x": 545, "y": 600 }, "blocks": [ { "x": 100, "y": 750, "w": 200, "h": 300 }, { "x": 515, "y": 750, "w": 170, "h": 300 } ], "rollers": [ { "x": 250, "y": -40, "r": 15, "delay": 10 }, { "x": 380, "y": -40, "r": 15, "delay": 70 } ], "fish": [ [ 315, 560 ] ], "ink": 610, "par": 570, "dev": 517 }, 
    { "name": "見張りウニ", "start": { "x": 40, "y": 614, "dir": 1 }, "goal": { "x": 555, "y": 630 }, "blocks": [ { "x": 300, "y": 760, "w": 600, "h": 260 } ], "spikes": [ { "x": 300, "y": 619, "w": 200, "h": 22 }, { "x": 300, "y": 500, "w": 260, "h": 24, "a": 180 } ], "balls": [ { "x": 405, "y": 606, "dx": 38, "period": 117, "phase": 1.4056, "r": 14 } ], "fish": [ [ 300, 562 ] ], "ink": 440, "par": 400, "hint": "ツララに触れたらアウト", "dev": 360 },
    { "name": "崩れる鍵台", "start": { "x": 40, "y": 234, "dir": 1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 80, "y": 270, "w": 160, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "crumbles": [ { "x": 250, "y": 420, "w": 100, "h": 20 } ], "keys": [ [ 252, 388 ] ], "spikes": [ { "x": 250, "y": 749, "w": 300, "h": 22 } ], "fish": [ [ 330, 560 ] ], "ink": 395, "par": 355, "hint": "ひびの入った氷は、乗るとすぐ崩れる", "dev": 321, "gold": [ 499, 638 ] }, 
    { "name": "わざと落ちる", "start": { "x": 40, "y": 184, "dir": 1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 60, "y": 220, "w": 120, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "crumbles": [ { "x": 168, "y": 410, "w": 94, "h": 20 }, { "x": 264, "y": 410, "w": 94, "h": 20 }, { "x": 360, "y": 410, "w": 94, "h": 20 }, { "x": 456, "y": 410, "w": 94, "h": 20 }, { "x": 552, "y": 410, "w": 94, "h": 20 } ], "spikes": [ { "x": 270, "y": 749, "w": 300, "h": 22 } ], "fish": [ [ 300, 560 ] ], "ink": 455, "par": 415, "dev": 376 }, 
    { "name": "消える床", "start": { "x": 40, "y": 444, "dir": 1 }, "goal": { "x": 90, "y": 760, "door": 1 }, "blocks": [ { "x": 75, "y": 480, "w": 150, "h": 40 }, { "x": 285, "y": 470, "w": 270, "h": 20, "k": "wall" }, { "x": 510, "y": 480, "w": 180, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "keys": [ [ 560, 428 ] ], "spikes": [ { "x": 365, "y": 749, "w": 150, "h": 22 } ], "fish": [ [ 330, 650 ] ], "ink": 420, "par": 270, "hint": "鍵を取ると、うすい氷の床が消える", "needStars": 38, "dev": 241 }, 
    { "name": "トゲの階段", "start": { "x": 40, "y": 144, "dir": 1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 120, "y": 180, "w": 240, "h": 40 }, { "x": 400, "y": 380, "w": 400, "h": 40 }, { "x": 200, "y": 580, "w": 400, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "spikes": [ { "x": 200, "y": 749, "w": 360, "h": 22 } ], "balls": [ { "x": 575, "y": 322, "r": 15 }, { "x": 25, "y": 522, "r": 15 } ], "fish": [ [ 300, 520 ] ], "ink": 260, "par": 115, "hint": "ペンギンは壁にぶつかると向きを変える", "dev": 104, "gold": [ 499, 344 ] }, 
    { "name": "ジグザグ", "start": { "x": 40, "y": 134, "dir": 1 }, "goal": { "x": 545, "y": 760 }, "blocks": [ { "x": 120, "y": 170, "w": 240, "h": 40 }, { "x": 360, "y": 400, "w": 480, "h": 40 }, { "x": 300, "y": 800, "w": 600, "h": 80 } ], "balls": [ { "x": 575, "y": 362, "r": 15 } ], "spikes": [ { "x": 160, "y": 749, "w": 320, "h": 22 } ], "fish": [ [ 150, 690 ] ], "ink": 455, "par": 415, "dev": 376 }, 
    { "name": "橋をかけるな", "start": { "x": 40, "y": 284, "dir": 1 }, "goal": { "x": 550, "y": 300 }, "blocks": [ { "x": 100, "y": 320, "w": 200, "h": 40 }, { "x": 530, "y": 580, "w": 140, "h": 560 }, { "x": 210, "y": 800, "w": 120, "h": 100 } ], "pads": [ { "x": 320, "y": 770, "w": 120, "h": 40, "power": 17.5 } ], "keys": [ [ 285, 640 ] ], "fish": [ [ 410, 300 ] ], "ink": 260, "par": 65, "hint": "ピンクの床は、大きく跳ねる", "dev": 59 }, 
    { "name": "ぽよんと着地", "start": { "x": 40, "y": 534, "dir": 1 }, "goal": { "x": 545, "y": 380 }, "blocks": [ { "x": 100, "y": 710, "w": 200, "h": 320 }, { "x": 510, "y": 640, "w": 180, "h": 520 } ], "pads": [ { "x": 300, "y": 800, "w": 200, "h": 40, "power": 18 } ], "balls": [ { "cx": 480, "cy": 300, "rad": 42, "period": 125, "phase": 2.4584, "r": 14 } ], "fish": [ [ 360, 288 ] ], "ink": 200, "par": 55, "hint": "ウニが円をえがいて回っている", "dev": 48 },
    { "name": "ふりこウニ", "start": { "x": 220, "y": 484, "dir": -1 }, "goal": { "x": 540, "y": 500 }, "blocks": [ { "x": 200, "y": 700, "w": 280, "h": 400 }, { "x": 530, "y": 700, "w": 140, "h": 400 } ], "balls": [ { "cx": 400, "cy": 455, "rad": 55, "period": 208, "phase": 5.236, "r": 14 } ], "fish": [ [ 80, 470 ] ], "ink": 280, "par": 205, "dev": 182 },
    { "name": "ウニの番人", "start": { "x": 340, "y": 484, "dir": -1 }, "goal": { "x": 230, "y": 500, "door": 1 }, "blocks": [ { "x": 250, "y": 700, "w": 300, "h": 400 }, { "x": 570, "y": 700, "w": 60, "h": 400 } ], "keys": [ [ 575, 468 ] ], "balls": [ { "cx": 470, "cy": 440, "rad": 36, "period": 126, "phase": 1, "r": 14 } ], "fish": [ [ 470, 515 ] ], "ink": 320, "par": 195, "dev": 173 },
    { "name": "崩れる橋", "start": { "x": 40, "y": 264, "dir": 1 }, "goal": { "x": 555, "y": 520 }, "blocks": [ { "x": 70, "y": 300, "w": 140, "h": 40 }, { "x": 560, "y": 700, "w": 80, "h": 360 } ], "crumbles": [ { "x": 205, "y": 530, "w": 88, "h": 20 }, { "x": 295, "y": 530, "w": 88, "h": 20 }, { "x": 385, "y": 530, "w": 88, "h": 20 }, { "x": 475, "y": 530, "w": 88, "h": 20 } ], "balls": [ { "cx": 240, "cy": 500, "rad": 22, "period": 90, "phase": 0, "r": 14 }, { "cx": 240, "cy": 500, "rad": 22, "period": 90, "phase": 2.0944, "r": 14 }, { "cx": 240, "cy": 500, "rad": 22, "period": 90, "phase": 4.1888, "r": 14 } ], "fish": [ [ 340, 498 ] ], "ink": 350, "par": 305, "dev": 271 },
    { "name": "ブースト", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 550, "y": 540 }, "blocks": [ { "x": 150, "y": 700, "w": 300, "h": 400 }, { "x": 540, "y": 720, "w": 120, "h": 360 } ], "boosts": [ { "x1": 150, "x2": 250, "y": 500, "dir": 1, "speed": 9.2 } ], "balls": [ { "x": 360, "y": 420, "r": 15 } ], "fish": [ [ 386, 452 ] ], "ink": 90, "par": 45, "hint": "矢印の上で、一気に加速する", "dev": 40 }, 
    { "name": "ひとふでの鍵", "maxStrokes": 1, "start": { "x": 250, "y": 484, "dir": 1 }, "goal": { "x": 460, "y": 500 }, "blocks": [ { "x": 40, "y": 700, "w": 80, "h": 400 }, { "x": 360, "y": 700, "w": 320, "h": 400 }, { "x": 580, "y": 700, "w": 40, "h": 400 } ], "keys": [ [ 30, 468 ] ], "balls": [ { "x": 140, "y": 462, "r": 14 } ], "spikes": [ { "x": 140, "y": 640, "w": 120, "h": 22 } ], "fish": [ [ 140, 515 ] ], "ink": 360, "par": 145, "hint": "この面は、線を1本しか引けない", "dev": 128 }, 
    { "name": "ひとふで", "start": { "x": 110, "y": 484, "dir": 1 }, "goal": { "x": 540, "y": 500 }, "blocks": [ { "x": 80, "y": 700, "w": 160, "h": 400 }, { "x": 300, "y": 700, "w": 80, "h": 400 }, { "x": 520, "y": 700, "w": 160, "h": 400 } ], "spikes": [ { "x": 300, "y": 489, "w": 80, "h": 22 } ], "balls": [ { "x": 300, "y": 404, "r": 14 }, { "x": 395, "y": 520, "r": 14 }, { "x": 205, "y": 520, "r": 14 } ], "fish": [ [ 300, 440 ] ], "ink": 360, "par": 315, "maxStrokes": 1, "keys": [ [ 25, 468 ] ], "needStars": 58, "dev": 286 }, 
    { "name": "滝くだり", "start": { "x": 40, "y": 144, "dir": 1 }, "goal": { "x": 90, "y": 760, "door": 1 }, "blocks": [ { "x": 150, "y": 180, "w": 300, "h": 40 }, { "x": 450, "y": 440, "w": 300, "h": 40 }, { "x": 300, "y": 800, "w": 600, "h": 80 } ], "spikes": [ { "x": 320, "y": 749, "w": 200, "h": 22 } ], "balls": [ { "x": 235, "y": 600, "r": 15 } ], "keys": [ [ 560, 388 ] ], "fish": [ [ 200, 565 ] ], "ink": 420, "par": 305, "dev": 274 }, 
    { "name": "一度きりの道", "melt": 45, "start": { "x": 380, "y": 444, "dir": -1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 50, "y": 680, "w": 100, "h": 440 }, { "x": 320, "y": 480, "w": 200, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "keys": [ [ 40, 428 ] ], "spikes": [ { "x": 150, "y": 749, "w": 300, "h": 22 } ], "fish": [ [ 196, 565 ] ], "ink": 505, "par": 465, "hint": "この面の線は、ペンギンが乗ると少しして溶ける", "dev": 422 }, 
    { "name": "溶けて消える", "start": { "x": 40, "y": 444, "dir": 1 }, "goal": { "x": 90, "y": 760, "door": 1 }, "blocks": [ { "x": 75, "y": 480, "w": 150, "h": 40 }, { "x": 285, "y": 470, "w": 270, "h": 20, "k": "wall" }, { "x": 510, "y": 480, "w": 180, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "keys": [ [ 560, 428 ] ], "spikes": [ { "x": 365, "y": 749, "w": 150, "h": 22 } ], "fish": [ [ 330, 650 ] ], "ink": 520, "melt": 8, "par": 255, "dev": 229 }, 
    { "name": "溶けるワープ", "start": { "x": 560, "y": 484, "dir": -1 }, "goal": { "x": 55, "y": 300, "door": 1 }, "blocks": [ { "x": 500, "y": 700, "w": 200, "h": 400 }, { "x": 90, "y": 600, "w": 180, "h": 600 } ], "portals": [ { "a": [ 300, 600 ], "b": [ 130, 270 ] } ], "fish": [ [ 350, 560 ] ], "ink": 300, "keys": [], "melt": 10, "par": 160, "dev": 141 }, 
    { "name": "ウニの落とし穴", "start": { "x": 40, "y": 184, "dir": 1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 60, "y": 220, "w": 120, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "crumbles": [ { "x": 168, "y": 410, "w": 94, "h": 20 }, { "x": 264, "y": 410, "w": 94, "h": 20 }, { "x": 360, "y": 410, "w": 94, "h": 20 }, { "x": 456, "y": 410, "w": 94, "h": 20 }, { "x": 552, "y": 410, "w": 94, "h": 20 } ], "spikes": [ { "x": 270, "y": 749, "w": 300, "h": 22 } ], "fish": [ [ 227, 384 ] ], "ink": 460, "balls": [ { "x": 300, "y": 520, "r": 15 } ], "par": 385, "dev": 349 }, 
    { "name": "上昇気流", "start": { "x": 40, "y": 614, "dir": 1 }, "goal": { "x": 550, "y": 600 }, "blocks": [ { "x": 100, "y": 760, "w": 200, "h": 260 }, { "x": 530, "y": 750, "w": 140, "h": 300 }, { "x": 300, "y": 852, "w": 160, "h": 20 } ], "fans": [ { "x": 300, "y": 560, "w": 150, "h": 560, "power": 0.55 } ], "spikes": [ { "x": 345, "y": 230, "w": 250, "h": 24, "a": 180 } ], "fish": [ [ 452, 365 ] ], "ink": 420, "par": 375, "hint": "風の中では、体がふわっと浮く", "dev": 340 }, 
    { "name": "溶ける氷", "melt": 45, "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 500 }, "blocks": [ { "x": 90, "y": 700, "w": 180, "h": 400 }, { "x": 510, "y": 700, "w": 180, "h": 400 } ], "fish": [ [ 300, 470 ] ], "ink": 320, "par": 230, "dev": 206 }, 
    { "name": "鏡の滝", "start": { "x": 560, "y": 144, "dir": -1 }, "goal": { "x": 510, "y": 760, "door": -1 }, "blocks": [ { "x": 450, "y": 180, "w": 300, "h": 40 }, { "x": 150, "y": 440, "w": 300, "h": 40 }, { "x": 300, "y": 800, "w": 600, "h": 80 } ], "spikes": [ { "x": 280, "y": 749, "w": 200, "h": 22 } ], "balls": [ { "x": 365, "y": 600, "r": 15 } ], "keys": [ [ 40, 388 ] ], "fish": [ [ 400, 565 ] ], "ink": 560, "par": 255, "melt": 30, "dev": 228 }, 
    { "name": "風に乗れ", "start": { "x": 40, "y": 444, "dir": 1 }, "goal": { "x": 545, "y": 560 }, "blocks": [ { "x": 80, "y": 680, "w": 160, "h": 440 }, { "x": 515, "y": 730, "w": 170, "h": 340 } ], "fans": [ { "x": 295, "y": 385, "w": 270, "h": 270, "wx": 0.22 } ], "fish": [ [ 300, 300 ] ], "ink": 225, "par": 185, "hint": "横風は、ペンギンを横に押し流す", "dev": 164, "gold": [ 375, 494 ] }, 
    { "name": "くぐれ", "start": { "x": 40, "y": 584, "dir": 1 }, "goal": { "x": 550, "y": 600 }, "blocks": [ { "x": 105, "y": 750, "w": 210, "h": 300 }, { "x": 495, "y": 750, "w": 210, "h": 300 } ], "movers": [ { "x": 300, "y": 500, "w": 70, "h": 24, "a": 180, "dy": 70, "period": 150, "phase": 0.2618 } ], "fish": [ [ 300, 612 ] ], "ink": 270, "par": 230, "hint": "ツララが動いている", "needStars": 78, "dev": 208 },
    { "name": "ひとふでワープ", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 300 }, "blocks": [ { "x": 100, "y": 700, "w": 200, "h": 400 }, { "x": 510, "y": 600, "w": 180, "h": 600 } ], "portals": [ { "a": [ 300, 600 ], "b": [ 470, 270 ] } ], "fish": [ [ 300, 560 ] ], "ink": 300, "maxStrokes": 1, "balls": [ { "x": 260, "y": 590, "r": 14 } ], "par": 140, "dev": 123 }, 
    { "name": "ウニと風", "start": { "x": 40, "y": 444, "dir": 1 }, "goal": { "x": 545, "y": 560 }, "blocks": [ { "x": 80, "y": 680, "w": 160, "h": 440 }, { "x": 515, "y": 730, "w": 170, "h": 340 } ], "fans": [ { "x": 295, "y": 385, "w": 270, "h": 270, "wx": 0.22 } ], "balls": [ { "x": 300, "y": 380, "r": 15 }, { "x": 300, "y": 300, "r": 15 } ], "fish": [ [ 290, 432 ] ], "ink": 200, "par": 70, "dev": 60 }, 
    { "name": "溶けるウニの道", "start": { "x": 40, "y": 584, "dir": 1 }, "goal": { "x": 545, "y": 600 }, "blocks": [ { "x": 100, "y": 750, "w": 200, "h": 300 }, { "x": 515, "y": 750, "w": 170, "h": 300 } ], "rollers": [ { "x": 250, "y": -40, "r": 15, "delay": 10 }, { "x": 380, "y": -40, "r": 15, "delay": 70 } ], "fish": [ [ 315, 560 ] ], "ink": 640, "melt": 60, "par": 525, "dev": 473 }, 
    { "name": "向かい風", "start": { "x": 40, "y": 484, "dir": 1 }, "goal": { "x": 545, "y": 500 }, "blocks": [ { "x": 90, "y": 700, "w": 180, "h": 400 }, { "x": 510, "y": 700, "w": 180, "h": 400 } ], "fans": [ { "x": 290, "y": 440, "w": 180, "h": 120, "wx": -0.32 } ], "fish": [ [ 300, 590 ] ], "ink": 430, "par": 390, "dev": 354 }, 
    { "name": "溶ける滑り台", "melt": 22, "start": { "x": 40, "y": 134, "dir": 1 }, "goal": { "x": 550, "y": 760 }, "blocks": [ { "x": 80, "y": 170, "w": 160, "h": 40 }, { "x": 300, "y": 830, "w": 600, "h": 140 } ], "spikes": [ { "x": 245, "y": 749, "w": 410, "h": 22 } ], "balls": [ { "x": 300, "y": 420, "r": 15 } ], "fish": [ [ 360, 600 ] ], "ink": 760, "par": 645, "dev": 584, "gold": [ 543, 590 ] }, 
    { "name": "氷河の一筆", "start": { "x": 40, "y": 264, "dir": 1 }, "goal": { "x": 555, "y": 520 }, "blocks": [ { "x": 70, "y": 300, "w": 140, "h": 40 }, { "x": 560, "y": 700, "w": 80, "h": 360 } ], "crumbles": [ { "x": 205, "y": 530, "w": 88, "h": 20 }, { "x": 295, "y": 530, "w": 88, "h": 20 }, { "x": 385, "y": 530, "w": 88, "h": 20 }, { "x": 475, "y": 530, "w": 88, "h": 20 } ], "movers": [ { "x": 380, "y": 380, "w": 60, "h": 24, "a": 180, "dy": 30, "period": 50, "phase": 0 } ], "balls": [ { "cx": 360, "cy": 530, "rad": 14, "period": 90, "phase": 0, "r": 13 }, { "cx": 360, "cy": 530, "rad": 14, "period": 90, "phase": 2.0944, "r": 13 }, { "cx": 360, "cy": 530, "rad": 14, "period": 90, "phase": 4.1888, "r": 13 } ], "fish": [ [ 370, 470 ] ], "ink": 410, "par": 356, "maxStrokes": 1, "dev": 318 },
    { "name": "ぽよん越え", "start": { "x": 40, "y": 224, "dir": 1 }, "goal": { "x": 550, "y": 250 }, "blocks": [ { "x": 80, "y": 260, "w": 160, "h": 40 }, { "x": 530, "y": 560, "w": 140, "h": 620 } ], "pads": [ { "x": 250, "y": 810, "w": 180, "h": 40, "power": 19 } ], "spikes": [ { "x": 400, "y": 830, "w": 120, "h": 40 } ], "balls": [ { "cx": 415, "cy": 320, "rad": 18, "period": 90, "phase": 0, "r": 13 }, { "cx": 415, "cy": 320, "rad": 18, "period": 90, "phase": 2.0944, "r": 13 }, { "cx": 415, "cy": 320, "rad": 18, "period": 90, "phase": 4.1888, "r": 13 } ], "fish": [ [ 300, 405 ] ], "ink": 130, "par": 80, "dev": 67 },
    { "name": "溶ける番人", "start": { "x": 340, "y": 484, "dir": -1 }, "goal": { "x": 230, "y": 500, "door": 1 }, "blocks": [ { "x": 250, "y": 700, "w": 300, "h": 400 }, { "x": 570, "y": 700, "w": 60, "h": 400 } ], "keys": [ [ 575, 468 ] ], "balls": [ { "cx": 470, "cy": 440, "rad": 36, "period": 110, "phase": 2.8326, "r": 14 } ], "fish": [ [ 470, 515 ] ], "ink": 480, "par": 375, "melt": 110, "dev": 340 },
    { "name": "オーロラの果て", "start": { "x": 100, "y": 264, "dir": -1 }, "goal": { "x": 555, "y": 520 }, "blocks": [ { "x": 70, "y": 300, "w": 140, "h": 40 }, { "x": 560, "y": 700, "w": 80, "h": 360 } ], "crumbles": [ { "x": 205, "y": 530, "w": 88, "h": 20 }, { "x": 295, "y": 530, "w": 88, "h": 20 }, { "x": 385, "y": 530, "w": 88, "h": 20 }, { "x": 475, "y": 530, "w": 88, "h": 20 } ], "movers": [ { "x": 385, "y": 420, "w": 60, "h": 24, "a": 180, "dy": 60, "period": 156, "phase": 2.5944 } ], "balls": [ { "cx": 505, "cy": 455, "rad": 28, "period": 109, "phase": 4.8944, "r": 13 } ], "fish": [ [ 450, 498 ] ], "ink": 315, "par": 275, "maxStrokes": 1, "keys": [ [ 20, 248 ] ], "melt": 35, "dev": 248 },
    { "name": "秘密の氷穴", "start": { "x": 500, "y": 264, "dir": 1 }, "goal": { "x": 45, "y": 520, "door": 1 }, "blocks": [ { "x": 530, "y": 300, "w": 140, "h": 40 }, { "x": 40, "y": 700, "w": 80, "h": 360 } ], "crumbles": [ { "x": 395, "y": 530, "w": 88, "h": 20 }, { "x": 305, "y": 530, "w": 88, "h": 20 }, { "x": 215, "y": 530, "w": 88, "h": 20 }, { "x": 125, "y": 530, "w": 88, "h": 20 } ], "movers": [ { "x": 215, "y": 420, "w": 60, "h": 24, "a": -180, "dy": 60, "period": 180, "phase": 3.3798 } ], "balls": [ { "cx": 95, "cy": 455, "rad": 28, "period": 126, "phase": 3.2214, "r": 13, "wake": 130 }, { "x": 400, "y": 440, "r": 14 } ], "fish": [ [ 150, 498 ] ], "ink": 310, "par": 270, "maxStrokes": 1, "keys": [ [ 580, 248 ] ], "melt": 35, "secret": true, "hint": "ここは秘密の場所。すべての仕掛けが待っている", "dev": 243 }];

  const api = { contentTop, snap, igloo, W, H, SEA, R, LINE_T, LEVELS, moverRect, ballPos, ballClock, CRUMBLE_T, makeWorld, step, addStroke, removeLastStroke, canPlace, segClearOfPenguin, strokeLen, stars, corners, inRect };
  if (typeof module !== 'undefined') module.exports = api; else root.PG = api;
})(this);
