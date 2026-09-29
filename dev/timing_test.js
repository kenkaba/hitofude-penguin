// 動くウニ/トゲのタイミングが、正解ルートに対して何フレームずれても勝てるか（運の強さの目安）: node timing_test.js
const PG = require('./core.js'), S = require('./sol.js'), R = require('./solR.json');
function dense(pts){const o=[pts[0]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/6));for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);}return o;}
function run(L, st) { const w = PG.makeWorld(L); for (const s of st) PG.addStroke(w, dense(s).filter(p => PG.canPlace(w, p[0], p[1]))); w.state = 'run'; while (w.state === 'run') PG.step(w); return w.state === 'win'; }
function sh(L0, off, k, sc) { const L = JSON.parse(JSON.stringify(L0)); (L.balls || []).forEach(b => { if (b.period) { b.period = Math.round(b.period * (sc || 1)); b.phase = (b.phase || 0) + 2 * Math.PI * ((k || 0) / 24 + off / b.period); } }); (L.movers || []).forEach(m => { m.period = Math.round(m.period * (sc || 1)); m.phase = (m.phase || 0) + 2 * Math.PI * ((k || 0) / 24 + off / m.period); }); return L; }
const args = process.argv.slice(2).map(Number);
PG.LEVELS.forEach((L, i) => {
  if (!((L.balls || []).some(b => b.period) || (L.movers || []).length)) return;
  if (args.length && !args.includes(i + 1)) return;
  let lo = 0, hi = 0; for (let o = 1; o <= 40; o++) { if (!(run(sh(L, -o), S[i]) && (!R[i] || run(sh(L, -o), R[i])))) break; lo = o; } for (let o = 1; o <= 40; o++) { if (!(run(sh(L, o), S[i]) && (!R[i] || run(sh(L, o), R[i])))) break; hi = o; }
  console.log(i + 1, L.name, 'safe', -lo, '..', '+' + hi);
});
