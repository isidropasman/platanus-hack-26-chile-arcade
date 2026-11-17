// BACK TO THE BOARD: The Return of the CEO. Shooter raycaster en primera persona para Platanus Hack 26.
// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u'],
  P1_2: ['i'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter'],
  START2: ['2'],
};

(() => {
const {min, max, abs, floor, ceil, round, sin, cos, atan2, hypot, PI} = Math;
const TAU = PI * 2;

// ---------- datos ----------
// Mapas: # = + paredes (3 texturas del nivel), F bandera, N cartel NVIDIA, D puerta, K puerta con tarjeta, @ inicio (mirando al este),
// g guardia, d dron, r robot, B jefe, c chip, h botiquín, a munición, k tarjeta, s escopeta, X salida (auto), p quien espera al lado del auto.
const LV = [
  '######F####F###### #@...#......g..c.# #....D...........N F....#..==....d..# #.h..#..==.....g.# ##D###D####D###### #....#....#......# #c.g.D..r.D...a..N N....#....#...c..# ###D####D###D##### #........g.#.....# N.a..g.....D..X..# #c.........#..p..# #####F######F#####',
  '####F######F####### #@...=.....d.....c# #....D..==...==...N F....=..==.g.==.r.# #....=...........g# ##D===D========D### #....=.......=s...# #.k..D..g.d.gD..c.# #.h..=..=.=..=..a.N #..g.=...c...=....# ###K######N####K### N...g...=..r......# #c..a...D.....X...# #...h.d.=...c..p..# ####F#####N####F###',
  '+++++F++++++++F+N+++ +@...+.....r...a+.a+ +....D..........D..+ F....+...g..g...+.dN +.h..+.........a+..+ ++D++++D++++N++++D++ +c....+..........h.+ N..g..D...d..r..d..+ +....a+.....c......+ ++++++++++F+N++++D++ +..................+ F.++............++.F +........B.........+ +..................+ +.++............++.+ +h.......a........h+ +++++F++++N+++F+++++',
];
const NAMES = ['SHENZHEN · EL DEPÓSITO', 'SHANGHÁI · GRANJA DE GPUS', 'PEKÍN · EL NÚCLEO'];
// pared, rack, acento, piso, techo
const PAL = [
  [0x6b6458, 0x4a5560, 0xd08020, 0x3a352e, 0x26221e],
  [0x3c4a66, 0x232b3b, 0x30d0ff, 0x1c2230, 0x0c1018],
  [0x5a2228, 0x2a1a20, 0xff3060, 0x24161a, 0x120a0c],
];
// vida, velocidad, escala, altura, rango, proyectil, telegrafiado, cadencia, daño, puntos, distancia, dolor, drop
const ET = [
  [30, 1.3, 1, 0, 9, 0, .45, 1.6, 10, 100, 3.5, .7, .5],
  [14, 2.4, .55, .3, 1.7, 0, .35, 1, 5, 150, .9, .9, .2],
  [100, .9, 1.25, 0, 11, 1, .6, 2.4, 15, 300, 5, .25, .8],
  [380, 1.3, 1.9, 0, 14, 1, .6, .9, 9, 5000, 4, .08, 0],
];
// cadencia, daño, perdigones, dispersión, nombre
const WP = [[.36, 16, 1, .015, 'PISTOLA'], [.11, 11, 1, .035, 'RIFLE'], [.85, 9, 8, .11, 'ESCOPETA']];

// ---------- estado ----------
let S, TX, CX, ID, B, FC, FD, FL, IM, HT, hS, hL, hB, hX, hW, hC, hM, hN, hR,
  ST = 'loading', STT = 0, cd = 0, idle = 0, ERR = 0, SEED = 1,
  H = {}, P = {}, KD = {},
  L = 0, W = 0, HH = 0, MAP, DO, DT, SEEN, FF, Q, NB, DL,
  pa = 0, tv = 0, td = 0, hp = 100, lives = 3, wpn = 1, AM = [0, 0, 0], HW = [1, 1, 0], KC = 0, CL = 0, CN = 0, CT = 0, SC = 0, snap,
  T = 0, fcd = 0, rec = 0, fa = 0, bob = 0, mvd = 0, MSG = '', MT = 0, ft = 0, lt = 0, eo = 0, EX = 0, EY = 0, boss = null, won = 0,
  LS = {k: 0, s: 0, h: 0, t: 0}, TOT = {k: 0, s: 0, h: 0, t: 0}, LB = [0, 0, 0], MK = 0, HC = 0, HS = 0, HU = 0,
  // presentación: audio, pantallas, ranking, game feel
  AC, MG, MU, ME, NZ, NV = 0, RT = 0, mi = -1, mo = 0, nt = 0, sp = 0, pg = 0, bk = -1, ip = 0, ic = 0, tc = 0,
  RK = [], rl = 0, hi = -1, NM = '', gx = 0, gy = 0, gl = 0, gr = 0, gp = 0, LE = [], shk = 0, rf = 0, pf = 0, PCL = 0, dI = 0, dA = 0,
  rq = 0, rw = 0, jf = 0, jt = 0, kq = -1, hb = 0, rok = 0, hk = 0, nf = 0, cs = 0, cx0 = 0, cy0 = 0, pi = 0;
const BC = [-12570369, -14647041, -16776961], MZL = [11, 0, 4], PL = {x: 1.5, y: 1.5}, EN = [], PK = [], PJ = [], RL = [], ALL = [EN, PK, PJ], ZB = new Float32Array(400);
for (let i = 0; i < 64; i++) EN.push({on: 0, g: 0}), PK.push({on: 0, g: 1}), i < 32 && PJ.push({on: 0, g: 2});

const rnd = () => (SEED = SEED * 16807 % 2147483647) / 2147483647;
const nrm = a => a - TAU * floor((a + PI) / TAU);
const rel = (x, y) => nrm(atan2(y - PL.y, x - PL.x) - pa);
// ---------- efectos: sonido, sacudida, flashes, partículas, frases ----------
// SFX: voces de 6 números [onda, f0, f1, duración, volumen, retardo]; onda 0 sine 1 square 2 saw 3 triangle 4 ruido filtrado (f = corte).
// Índice = posición del evento en EV; disparo de rifle/escopeta y muertes de dron/robot/jefe van al final.
const EV = 'shot wall hit pain kill alert tele eshot miss proj pexp hurt die pick chip alarm locked door step switch boss level win mv ok ty beat'.split(' ');
const SX = [
  [4, 4e3, 400, .15, .5, 0, 1, 180, 50, .1, .3, 0],
  [4, 6e3, 2e3, .05, .15, 0],
  [1, 500, 150, .07, .2, 0],
  [2, 300, 120, .15, .2, 0],
  [2, 400, 60, .35, .3, 0, 4, 1500, 100, .3, .3, 0],
  [1, 700, 900, .08, .12, 0, 1, 900, 1100, .08, .12, .09],
  [2, 200, 800, .3, .15, 0],
  [4, 3e3, 600, .12, .35, 0],
  [0, 2500, 800, .15, .08, 0],
  [2, 300, 80, .3, .25, 0],
  [4, 1500, 80, .4, .45, 0],
  [2, 220, 80, .2, .35, 0, 4, 800, 200, .12, .25, 0],
  [2, 400, 40, 1, .4, 0],
  [1, 600, 1200, .08, .15, 0],
  [1, 880, 880, .1, .18, 0, 1, 1175, 1175, .1, .18, .1, 1, 1760, 1760, .2, .18, .2],
  [1, 500, 900, .3, .15, 0, 1, 900, 500, .3, .15, .3, 1, 500, 900, .3, .15, .6, 1, 900, 500, .3, .15, .9],
  [1, 150, 120, .15, .2, 0, 1, 150, 120, .15, .2, .18],
  [4, 400, 200, .5, .2, 0],
  [4, 300, 100, .06, .12, 0],
  [1, 300, 300, .04, .12, 0, 1, 500, 500, .04, .12, .06],
  [2, 80, 40, .8, .5, 0, 4, 600, 100, .8, .4, 0],
  [3, 440, 440, .12, .2, 0, 3, 554, 554, .12, .2, .12, 3, 659, 659, .3, .2, .24],
  [1, 523, 523, .1, .18, 0, 1, 659, 659, .1, .18, .1, 1, 784, 784, .1, .18, .2, 1, 1047, 1047, .4, .18, .3],
  [1, 800, 800, .03, .08, 0],
  [1, 600, 1200, .1, .12, 0],
  [1, 1400, 1400, .015, .05, 0],
  [0, 70, 40, .15, .4, 0, 0, 70, 40, .15, .3, .18],
  [4, 6e3, 800, .09, .4, 0, 2, 140, 60, .06, .25, 0],
  [4, 2500, 150, .35, .7, 0, 1, 90, 30, .25, .45, 0],
  [1, 1200, 100, .3, .25, 0, 4, 4e3, 500, .2, .3, 0],
  [4, 1200, 60, .6, .6, 0, 2, 120, 30, .6, .35, 0],
  [4, 900, 40, 1.5, .8, 0, 2, 100, 25, 1.5, .5, 0, 4, 2e3, 60, 1, .6, .3],
];
// Música: [segundos por paso, nota raíz MIDI, bajo, melodía, arpegio, batería]. Letra = semitonos sobre la raíz ('a' = 0), '.' silencio;
// el bajo suena 2 octavas abajo y el arpegio 1 arriba; batería: k bombo, s caja, h hi-hat. Cada pista hace loop con su propio largo
// (melodías de 64 pasos sobre bajos de 32 = frases A/B). 0-2 niveles, 3 jefe, 4 título.
const MZ = [
  [.14, 57, 'a.a.m.a.a.a.m.a.f.f.r.f.h.h.t.h.', 'm...p.r.p...m.k.m...p.r.t...r.p.r...p.m.k...h.k.m.......h.k.m...', 'ahmhahmhahmhahmhfimifimihlolhlol', 'k.h.s.h.k.h.s.hhk.h.s.h.k.k.s.hh'],
  [.12, 50, 'a.am.a.ai.iu.i.ik.kw.k.ka.am.a.a', 'm.p.r.p.m...h.k.p.m.k.i.k.m.....r.t.u.t.r...p.r.t.r.p.m.p.r.....', 'ahmhahmhimpmimpmkortkortahmhahmh', 'k.hhs.hhk.khs.hh'],
  [.13, 52, 'a..a..a.b..b..b.a..a..a.d..d..f.', 'm...l...m...p...o...m...l...h...m...n...m...p...r...p...o...m...', 'ahmpahmpbinqbinq', 'k..hs.h.k.khs.hh'],
  [.1, 52, 'aamaaamabbnbbbnb', 'm.m.p.m.r.p.m.l.m.m.p.r.t.r.p.n.', 'ahmahmah', 'kshkkshkkshkkssk'],
  [.16, 45, 'a.......f.......d.......h.......', 'm..h..m.k..f..k.i..d..i.h..c..h.m..p..r.p..m..k.i..m..p.o..l..h.', '.', 'k.......s.......k.......s..h.h.h'],
];
const WV = ['sine', 'square', 'sawtooth', 'triangle'], MO = [0, 0, -24, 0, 12], MV = [0, 0, .3, .05, .05], LQ = new Float32Array(32).fill(-1);
// Una voz: oscilador (o ruido por un filtro) -> envolvente -> bus. Se desconecta sola al terminar.
function tn(w, f, e, d, v, t, o) {
  if (NV > 40 || AC.state != 'running') return;
  const s = w > 3 ? AC.createBufferSource() : AC.createOscillator(), g = AC.createGain(), q = w > 3 ? AC.createBiquadFilter() : s, p = q.frequency;
  if (w > 3) s.buffer = NZ, s.connect(q); else s.type = WV[w];
  p.setValueAtTime(f, t); p.exponentialRampToValueAtTime(e, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.001, t + d);
  q.connect(g); g.connect(o);
  s.onended = () => { s.disconnect(); q.disconnect(); g.disconnect(); NV-- };
  s.start(t, w > 3 ? Math.random() * .4 : 0); s.stop(t + d + .02); NV++;
}
const sfx = (i, v) => { const z = SX[i], n = AC.currentTime; for (let k = 0; k < z.length; k += 6) tn(z[k], z[k + 1] * (.94 + Math.random() * .12), z[k + 2], z[k + 3], z[k + 4] * v, n + z[k + 5], MG) };
// Secuenciador con lookahead: agenda desde update con el reloj del AudioContext (nada de timers).
function mus() {
  const n = AC.currentTime, m = ST[0] == 'p' ? (boss && boss.s && boss.s < 5 ? 3 : L) : ST == 'title' ? 4 : -1, on = m >= 0 && ST != 'paused';
  if (m != mi) mi = m, sp = 0;
  if (on != mo) mo = on, nt = n + .05, MU.gain.setTargetAtTime(on ? .3 : 0, n, on ? .2 : .03);
  if (!on) return;
  if (nt < n) nt = n + .05;
  const z = MZ[m];
  while (nt < n + .2) {
    for (let k = 2; k < 6; k++) {
      const s = z[k], c = s.charCodeAt(sp % s.length) - 97, f = 440 * 2 ** ((z[1] + c + MO[k] - 69) / 12);
      if (c < 0) continue;
      if (k < 5) tn(k == 3 ? 1 : 3, f, f, z[0] * (k == 3 ? 1.5 : k == 2 ? 2 : 1), MV[k], nt, k == 3 ? ME : MU);
      else if (c == 10) tn(0, 150, 40, .15, .6, nt, MU);
      else tn(4, c > 10 ? 4e3 : 9e3, c > 10 ? 1e3 : 6e3, c > 10 ? .12 : .04, c > 10 ? .3 : .1, nt, MU);
    }
    nt += z[0]; sp++;
  }
}
// Partículas: pool circular fijo de 64 (posición en el mundo, z = altura 0..1).
const PX = new Float32Array(64), PY = new Float32Array(64), PZ = new Float32Array(64), VX = new Float32Array(64), VY = new Float32Array(64), VZ = new Float32Array(64), PT = new Float32Array(64), PQ = new Uint32Array(64);
const prt = (x, y, z, n, c, s) => {
  while (n--) pi = pi + 1 & 63, PX[pi] = x, PY[pi] = y, PZ[pi] = z, VX[pi] = (Math.random() - .5) * s, VY[pi] = (Math.random() - .5) * s, VZ[pi] = Math.random() * s, PT[pi] = .3 + Math.random() * .5, PQ[pi] = n & 1 ? c : -12529409;
};
// ---------- textos ----------
// Elenco: nombre en pantalla y color de su etiqueta. Los cuatro últimos son provisorios: cambiarlos acá alcanza
// (todos los textos que los nombran usan esta tabla). Índices: 0 JENSEN, 1 RADIO, 2 GPU, 3 EL INVERSOR, 4 LA DIRECTORA.
const RN = ['JENSEN', 'RADIO', 'GPU', 'EL INVERSOR', 'LA DIRECTORA'], RC = ['#a6e22e', '#ff7ac0', '#ffd21a', '#7fb8ff', '#ff9a6a'];
// retrato de cada uno en la radio y en el fin de nivel (Jensen usa su cara del HUD)
const RP = [50, 60, 61, 58, 57];
// RADIO, uno por chip (el H-1000 siempre dice el último)
const RX = ['¡PRIMER CHIP! FALTAN 11. SIN PRESIÓN.', 'ESE TIENE MÁS NÚCLEOS QUE TU AGENDA.', 'VAN 3. EL DIRECTORIO YA SUDA.', `¡SHENZHEN LISTO! ${RN[2]} TE ESPERA EN EL AUTO.`,
  'CHIP 5. HUELE A SILICIO Y A VENGANZA.', 'ESE MINABA CRIPTO. PERDONALO.', 'VAN 7. LA ACCIÓN YA SUBIÓ 2%.', 'OCHO. EN CHINA YA LOS EXTRAÑAN.',
  `¡SHANGHÁI LISTO! ${RN[3]} TE ESPERA.`, 'DIEZ. EN EL DIRECTORIO YA TE DICEN JEFE.', 'ONCE. UNO MÁS Y VOLVÉS AL SILLÓN.', '¡EL H-1000! VOLVÉ A CASA, JENSEN.'];
// cambios de fase del jefe: el primero lo dice JENSEN, el segundo RADIO
const BQ = ['¿ESO ES TODO? MI TOSTADORA RINDE MÁS.', '¡SE LE RECALIENTA EL DISIPADOR! ¡DALE!'];
// remates de JENSEN al bajar enemigos (a veces)
const KQ = ['DESPIDO SIN PREAVISO.', 'RECORTE DE PERSONAL.', 'TE RECOMIENDO EN LINKEDIN.', 'REESTRUCTURACIÓN.', 'GARANTÍA VENCIDA.', 'PRODUCTO DISCONTINUADO.', 'OPTIMIZANDO COSTOS.', 'MENOS LATENCIA.', 'OVERCLOCK.', 'ESO FUE UN DOWNGRADE.'];
// entrada a cada nivel (RADIO), tarjeta y escopeta (JENSEN)
const LQ2 = ['SHENZHEN. 4 CHIPS. ENTRÁ SIN HACER RUIDO.', 'SHANGHÁI. 5 CHIPS Y PUERTAS CON TARJETA.', 'PEKÍN. EL H-1000 LO CUIDA UN MECH.', 'TARJETA. COMO EN LOS VIEJOS TIEMPOS.', 'ESCOPETA. ESTO SÍ ES UNA KEYNOTE.'];
// Canal único de diálogo del HUD: retrato + nombre + línea (w = índice en RN, t = segundos en pantalla).
const rad = (w, s, t) => { rw = w; rq = t; hR.setText(s); hN.setText(RN[w]).setColor(RC[w]) };
// colores de pickup (k) y de restos por tipo de enemigo
const PFC = [0xffd040, 0x40ff60, 0xffe080, 0x40a0ff, 0xff9030, 0, 0xffe080, 0xffd040], KCO = [0x3c4a6a, 0x9098a8, 0x8a7a3a, 0x8a2a34];
// Punto único de efectos de la simulación (y de la UI). Nunca tira y no toca rnd(): el azar de presentación es Math.random.
function fx(t, a, b) {
  if (ST == 'title') return;
  try {
    let i = EV.indexOf(t), v = 1, x = -1, y = 0;
    if (t == 'shot' && a) i = 26 + a;
    if (t == 'kill') { if (a.t) i = 28 + a.t; prt(a.x, a.y, .4, a.t > 2 ? 48 : 14, ab(KCO[a.t]), a.t > 2 ? 4 : 2.5) }
    if (t == 'wall' || t == 'pexp') {
      x = a; y = b;
      const l = hypot(PL.x - a, PL.y - b) || 1;
      if (t[0] == 'w') prt(a + (PL.x - a) / l * .08, b + (PL.y - b) / l * .08, .4 + Math.random() * .2, 3, -4144960, 1.2); else prt(a, b, .35, 16, -14647041, 2.5);
    } else if (a && a.x) x = a.x, y = a.y;
    if (t == 'door') x = a % W + .5, y = (a / W | 0) + .5;
    if (x >= 0) v = 1 / (1 + hypot(x - PL.x, y - PL.y) * .3);
    // la cara del HUD: dolor un instante (salvo que esté festejando un chip), festejo al juntar chip
    if (t == 'hurt') shk = min(.5, .15 + a * .015), rf = min(.45, .12 + a * .015), dA = pa + b, dI = 1, jt > 0 && jf > 2 || (jf = 1, jt = .45);
    if (t == 'die') rf = .8;
    if (t == 'pick') pf = .25, PCL = ab(PFC[a] | 0);
    if (t == 'chip') rad(1, RX[b ? 11 : a - 1 - hk], 3.5), hk |= !!b, jf = 3, jt = 1.6;
    if (t == 'kill' && rq < 0 && Math.random() < .3) rad(0, KQ[Math.random() * 10 | 0], 2.5);
    if (t == 'pick' && (a == 3 || a == 4)) rad(0, LQ2[a], 3);
    if (t == 'boss') rad(a - 1 & 1, BQ[a - 1 & 1], 3), shk = .4;
    if (t == 'level') shk = dI = pf = jt = 0, PT.fill(0), rad(1, LQ2[a], 4);
    // Throttle por tipo: la escopeta tira 8 perdigones pero suena un solo impacto.
    if (AC && i >= 0 && RT - LQ[i] > .04 && v > .05) LQ[i] = RT, sfx(i, v);
  } catch (e) {}
}
const say = (s, t) => { MSG = s; MT = t || 2 };

// ---------- arte procedural (32x32, 16 sombras precalculadas por imagen) ----------
const G = new Uint32Array(1024), IMG = new Uint32Array(66 << 14);
const ab = c => 0xff000000 | (c & 255) << 16 | c & 0xff00 | c >> 16 & 255;
const mul = (c, f) => min(255, (c >> 16) * f) << 16 | min(255, (c >> 8 & 255) * f) << 8 | min(255, (c & 255) * f);
const R = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < 32 && j >= 0 && j < 32) G[j * 32 + i] = ab(c) };
const El = (x, y, a, b, c) => { for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) if ((i + .5 - x) ** 2 / a / a + (j + .5 - y) ** 2 / b / b < 1) G[j * 32 + i] = ab(c) };
const sv = id => {
  for (let s = 0; s < 16; s++) {
    const f = 1 - s / 17;
    for (let p = 0; p < 1024; p++) { const c = G[p]; IMG[(id * 16 + s) << 10 | p] = c && (0xff000000 | (c >> 16 & 255) * f << 16 | (c >> 8 & 255) * f << 8 | (c & 255) * f) }
  }
  G.fill(0);
};
// enemigos: frames 0-1 caminar, 2 apuntar, 3 disparar, 4 dolor, 5 muerto
const DR = [
  f => {
    if (f > 4) return R(3, 27, 26, 5, 0x2a3550), El(27, 28, 4, 3, 0x30384a), R(25, 27, 4, 1, 0x6fe0ff);
    const o = f == 1 ? 2 : 0, a = f == 2 || f == 3, u = f == 4 ? 0x8a3a48 : 0x2a3550;
    R(11 + o, 22, 4, 10, 0x1c2438); R(17 - o, 22, 4, 10, 0x1c2438);
    R(10, 12, 12, 11, u); R(12, 14, 8, 6, 0x3c4a6a); R(10, 21, 12, 2, 0x111111);
    El(16, 8, 5.5, 5.5, 0x30384a); R(12, 7, 9, 3, a ? 0xff3030 : 0x6fe0ff);
    if (a) R(13, 13, 7, 7, u), R(14, 14, 5, 4, 0x1a1a1a); else R(7, 13, 3, 9, u), R(22, 13, 3, 9, u), R(23, 18, 2, 7, 0x1a1a1a);
    if (f == 3) El(16, 15, 4.5, 4.5, 0xffe060), El(16, 15, 2, 2, 0xffffff);
  },
  f => {
    if (f > 4) return El(16, 29, 9, 3, 0x30343c), R(9, 27, 5, 2, 0x606878);
    const w = f & 1 ? 11 : 7;
    R(9 - w / 2 | 0, 8, w, 2, 0x9098a8); R(23 - w / 2 | 0, 8, w, 2, 0x9098a8); R(8, 9, 2, 4, 0x505868); R(22, 9, 2, 4, 0x505868);
    El(16, 16, 10, 6, f == 4 ? 0xa05050 : 0x505a6c); El(16, 14, 7, 3, 0x6a7488);
    El(16, 17, 3, 3, f == 2 || f == 3 ? 0xff2020 : 0x30e0ff);
    if (f == 3) R(15, 20, 2, 10, 0xc0f0ff), R(13, 26, 6, 2, 0xc0f0ff);
  },
  f => {
    if (f > 4) return R(3, 24, 26, 8, 0x5a4a2a), R(7, 21, 10, 3, 0x3a3020), El(23, 26, 3, 2, 0x401010);
    const o = f & 1, a = f == 2 || f == 3;
    R(8 - o, 22, 6, 10, 0x3a3a40); R(18 + o, 22, 6, 10, 0x3a3a40);
    R(6, 9, 20, 14, f == 4 ? 0xc06040 : 0x8a7a3a); R(9, 12, 14, 7, 0x6a5a2a);
    R(11, 2, 10, 7, 0x5a5a60); R(12, 4, 8, 2, a ? 0xffa000 : 0xff2020);
    R(2, 10, 4, 10, 0x5a5a60); R(25, 11, 6, 6, 0x303030);
    if (a) El(28, 14, f > 2 ? 5 : 2.5, f > 2 ? 5 : 2.5, f > 2 ? 0xffe060 : 0xff8000);
  },
  f => {
    if (f > 4) return R(1, 22, 30, 10, 0x302024), R(5, 17, 14, 6, 0x401c24), El(21, 25, 4, 3, 0xff3060);
    const o = f & 1 ? 2 : 0, a = f == 2 || f == 3, r = f > 2 ? 4 : 2, c = f > 2 ? 0xffe060 : 0xff8000;
    R(6 + o, 20, 6, 12, 0x2a2a30); R(20 - o, 20, 6, 12, 0x2a2a30); R(4 + o, 29, 10, 3, 0x1a1a20); R(18 - o, 29, 10, 3, 0x1a1a20);
    R(5, 6, 22, 15, f == 4 ? 0xd04040 : 0x6a1a24); R(8, 8, 16, 6, 0x8a2a34);
    El(16, 15, 4, 4, a ? 0xffffff : 0xff3060);
    R(12, 1, 8, 5, 0x303038); R(13, 3, 6, 1, 0xff3060);
    R(0, 7, 5, 11, 0x404048); R(27, 7, 5, 11, 0x404048);
    if (a) El(2.5, 7, r, r, c), El(29.5, 7, r, r, c);
  },
];
// 35 chip, 36 botiquín, 37 munición, 38 tarjeta, 39 escopeta, 40 (vacío), 41 cargador, 42 H-1000,
// 43 (vacío), 44-45 proyectiles, 46-48 armas en primera persona, 49 fogonazo
const MISC = [
  () => CH(0),
  () => { R(8, 14, 16, 12, 0xeeeeee); R(14, 16, 4, 8, 0xe02020); R(12, 18, 8, 4, 0xe02020) },
  () => { R(8, 18, 16, 10, 0x5a5a2a); for (let i = 0; i < 4; i++) R(9 + i * 4, 12, 2, 6, 0xd8b040) },
  () => { R(9, 14, 14, 10, 0x2f6fff); R(9, 16, 14, 2, 0x111111); R(11, 19, 4, 3, 0xd8b040) },
  () => { R(3, 18, 26, 3, 0x404048); R(3, 21, 26, 2, 0x303038); R(18, 20, 11, 5, 0x6a4020) },
  () => 0,
  () => { R(12, 22, 8, 8, 0x5a5a2a); R(13, 18, 2, 4, 0xd8b040); R(17, 18, 2, 4, 0xd8b040) },
  () => CH(1),
  () => 0,
  () => { El(16, 16, 6, 6, 0xff8000); El(16, 16, 3, 3, 0xffff80) },
  () => { El(16, 16, 7, 7, 0xff2080); El(16, 16, 4, 4, 0xffffff) },
  () => AD(AA[0]),
  () => AD(AA[1]),
  () => AD(AA[2]),
  () => { El(16, 16, 10, 10, 0xffa020); El(16, 16, 6, 6, 0xffe080); El(16, 16, 3, 3, 0xffffff) },
];
// ---------- arte del rediseño (generado por build.js desde src.js) ----------
// Paleta de 12 bits. Cada figura es un string de 5 chars (x, y, w, h, color) con offset 48:
// color < 45 es R(x,y,w,h); si no, El(x/2, y/2, w/2, h/2) con el color - 45.
const AP = "da7fcbccc223111fc7311832da4fd9a627b0ccd6123338dfb75899eef445acd722843fffe89b57fbcc94224346b53360d21a10fd0889357401556e67753112642".match(/.../g).map(h => (h = parseInt(h, 16), (h >> 8) * 17 << 16 | (h >> 4 & 15) * 17 << 8 | (h & 15) * 17));
// m = también espejado, o = corrimiento x (sprites de 64 de ancho), q = corrimiento y
const AD = (s, m = 0, o = 0, q = 0) => {
  for (let i = 0; i < s.length; i += 5) {
    const [x, y, w, h, c] = [0, 1, 2, 3, 4].map(k => s.charCodeAt(i + k) - 48);
    for (let k = 0; k <= m; k++) c < 45 ? R(k ? 32 - x - w : x - o, y + q, w, h, AP[c]) : El(k ? 32 - x / 2 : x / 2 - o, y / 2 + q, w / 2, h / 2, AP[c - 45]);
  }
};
// encaje del vestido rosa
const lace = () => { for (let p = 0; p < 1024; p++) if (G[p] == ab(AP[24]) >>> 0 && p & 32 && (p + (p >> 5 & 2)) % 4 < 1) G[p] = ab(AP[26]) };
// chip NVIDIA (k=0 verde de los niveles, k=1 H-1000 dorado). Reemplaza a chip() en MISC.
const CH = k => {
  R(7, 9, 18, 16, k ? 0xd8a830 : 0x22262e); R(8, 10, 16, 1, k ? 0xffe080 : 0x40444c);
  for (let i = 0; i < 4; i++) R(8 + i * 4, 7, 2, 2, 0xd8b040), R(8 + i * 4, 25, 2, 2, 0xd8b040);
  AD(";<::;NR96aOR64h?@224");
  if (k) R(3, 3, 1, 5, 0xffffff), R(1, 5, 5, 1, 0xffffff), R(27, 25, 1, 3, 0xffffff), R(26, 26, 3, 1, 0xffffff);
};
// manos de las armas en primera persona con manga de cuero (MISC 46-48: () => AD(AA[0]) ...)
const AA = ["<E960>;5=>?:32V;J;63;J;1C=L24C", "?02<>=:69>>742V7B6>37B61C8D1<C<B8>>DC494:=460BK830AM:33AM:1C", ":45L>A45L>9B>>Z7G6406J8636J81C8L14C"];
// bandera china colgada sobre la pared de base b (id de IMG), queda en el id 64 (FL ya es el color del techo)
const FG = b => { G.set(IMG.subarray(b << 14, (b << 14) + 1024)); AD("33J1V22138M213844HAP4DH1QC41@QI41@Q8612R5871R6951R7:31R6;21R9;21R6<11R:<11R=522R@722R@:22R=<22R"); sv(64) };
// 50-53 retrato de Jensen (normal, dolorido, salud baja, festejo), 54 Jensen con rifle, 55 sentado de frente,
// 56 sillón de espaldas, 57 directora, 58 inversor, 59 radio, 60 retrato de radio, 61 GPU, 62-63 auto, 64 bandera, 65 cartel NVIDIA
function NA() {
  ["<=124C=124:;51AA;51A=C61F<B11FCB11F", ":>414B>414::21A<;31AD:21AA;31A<B83E=B61G=D61G", ";>214C>214:<51AA<51A>C42EE614PD912P8A12DC@32@", ":>114;=214=>114B>114C=214E>114::51AA:51A;B:3E<B81G>D41W"].forEach((s, i) => { AD("PnN@`<H884=D65@PBA?_PK>A]P=?9_:514A<313AC313AE514A>241B=612AB612A?=214??23@"); AD("9H28C:E3434J41C8=24@882529<644:=42D", 1); AD(s); sv(50 + i) });
  AD("::<33;=:83?:254=:17CB:17C9;263E;263;E48YAE48Y:M534AM534;D:14?D21<6?53>;>=3>H>71VAA23>><52V:@220E>220"); AD("P696_P<77]=1622<2142C2142>141B=5614=521DA521D?821@?921@"); sv(54);
  AD("77B?=P>B6j99>1U9=>1U8E@3U9M>2V"); AD("4B63U?H25V", 1); AD(":=<93?=244==16CB=16C;F:3Y;I44YAI44Y:M524AM524"); AD("8>3636C320", 1); AD("P696_P<77]=1622<2142C2142>141B=5614=521DA521D?821@?921@", 0, 0, 4); sv(55);
  AD("P696_P<77]=1622<2142C2142>141B=5614=521DA521D?821@?921@", 0, 0, 4); AD("77B?=P>B6j99>1U9=>1U8E@3U9M>2V"); AD("4B63U?H25V", 1); sv(56);
  AD("P9;9b:6245D6245P<77^=2625<3225<221KA121KD412K:712K=5614=521DA521D?821E?9211;::2H<<87H:;23HD;23H:=<31;?:1@;C:4H:G<4H9K>4H<O314AO314;811GD811G"); lace(); sv(57);
  AD("P686cP<77]<1826<2136C2136A131>>5114A5114=4216A4216?831EB711E?921@9:>3L:=<8L>:44G=:14MB:14M9>>3M:?210D?210;E48LAE48L:M524AM524"); sv(58);
  AD("N8:8d:53;7B5287N<78^<2627;3237;619N=5214@5214>731G?811E>:221;;811;<87H:C:4H9G<4H8K>4H<O314@O3149<261:A221C;221D6261D:21GE1364F0124F311;D5221"); lace(); sv(59);
  AD("PLDJdPJ>A^P<?7d962:7E62:7;<314B<314;:317B:317:?21JD?21J=A63E=A61G>C41W?>21I=E6416ID7H;I:216D487FD4878A12GI9494K4154J;21;G?541"); lace(); sv(60);
  AD("FI738P^>@eP^8<fPD<;ePJ65f?<214??22W:6<2X;@:2;=B62;?D21;?@21O"); AD("CJ59g=:114K>43l;M439", 1); sv(61);
  AD("M2=3<K5=3<I8=3<O382TM583TK872TT932SA;N6SC<94TO<444U<84T3??2<1An8<1Gn2S1Hn2>3Dj1;1B32;lA33P_=<4<`>:1S8E=54[E=54Md;;aMd66iMd22k"); sv(62); AD("M2=3<K5=3<I8=3<O382TM583TK872TT932SA;N6SC<94TO<444U<84T3??2<1An8<1Gn2S1Hn2>3Dj1;1B32;lA33P_=<4<`>:1S8E=54[E=54Md;;aMd66iMd22k", 0, 32); AD("Ud;;aUd66iUd22k"); sv(63);
  FG(0);
  AD("00PP>11NN4<4=>;JFB<hLF=8aNF85hOF43a6F15G9F15G7G11G8H12G;F14G=F14G<J11G?F15GAF15GBF11GBJ11GCG13GEF15GGG14GIG14GHF11GHH11G"); sv(65);
}
// sprite id estirado a w×h en el buffer (permite el giro del sillón)
const sb = (id, x0, y0, w, h) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const c = IMG[id << 14 | j * 32 / h << 5 | i * 32 / w], X = x0 + i | 0, Y = y0 + j | 0;
    if (c && X >= 0 && X < 400 && Y >= 0 && Y < 300) B[Y * 400 + X] = c;
  }
};
// escena final en la oficina del CEO; t en segundos desde que empieza. Jensen entra (0-2.4 s), se sienta,
// el sillón gira (2.9-3.6 s) y desde ahí el elenco festeja en loop con papelitos.
function drawEnding(t) {
  for (let y = 0; y < 300; y++) fr(0, y, 400, 1, y < 236 ? ab(mul(0x302a44, .6 + y / 600)) : ab(mul(0x22382c, .5 + (y - 236) / 120)));
  for (let y = 16; y < 150; y++) fr(14, y, 220, 1, mix(ab(0x081030), ab(0x5a2468), (y - 16) / 134));
  for (let x = 14, k = 0; x < 232; k++) {
    const w = 14 + k * 7 % 13, h = 30 + k * 37 % 70;
    fr(x, 150 - h, min(w, 234 - x), h, ab(0x10121c));
    for (let j = 154 - h; j < 146; j += 6) for (let i = x + 2; i < x + w - 3 && i < 231; i += 4) if ((i * 7 ^ j * 13) % 5 < 2) fr(i, j, 2, 3, ab(k % 4 ? 0xffd870 : 0x76b900));
    x += w + 2;
  }
  for (let k = 0; k < 5; k++) fr(12 + k * 55, 12, 4, 140, ab(0x0c0c10));
  fr(12, 12, 224, 4, ab(0x0c0c10)); fr(12, 150, 224, 4, ab(0x4a4458));
  sb(65, 262, 24, 112, 112);
  const a = (t - 2.9) * 1.4, F = a > 1;
  if (t < 2.4) sb(56, 152, 108, 96, 96), sb(54, t * 103 - 96, 104 - abs(sin(t * 9)) * 4, 96, 96);
  else if (a < 1) { const c = cos(max(0, a) * PI), w = max(4, abs(c) * 96); sb(c > 0 ? 56 : 55, 200 - w / 2, 108, w, 96); if (c > 0) fr(200 - w * .14 | 0, 111, w * .28 | 0, 8, ab(0xc0c4c8)), fr(203 - w * .14 | 0, 109, w * .28 - 6 | 0, 2, ab(0xc0c4c8)) }
  else sb(55, 152, 108, 96, 96);
  fr(108, 194, 184, 8, ab(0x8a5a30)); fr(114, 202, 172, 48, ab(0x4a2a14)); fr(114, 214, 172, 3, ab(0x76b900));
  const J = k => F ? abs(sin(t * 7 + k)) * 14 : 0;
  sb(57, -6, 214 - J(0), 84, 84); sb(58, 54, 214 - J(1), 84, 84); sb(61, 280, 236 - J(2), 64, 64); sb(59, 322, 214 - J(3), 84, 84);
  if (F) for (let k = 0; k < 60; k++) fr(k * 89 % 396, (k * 47 + a * 60) % 296 | 0, 2, 3, ab([0x76b900, 0xffde00, 0xffffff, 0xff6090][k & 3]));
}
// fondo de rayos azules (tapa), t en segundos para que giren despacio
const drawBurst = t => {
  for (let p = 0; p < 12e4; p++) {
    const x = p % 400 - 200, y = (p / 400 | 0) - 130;
    B[p] = mix(ab((atan2(y, x) * 4 / PI * 3 + t * .3 + 99 | 0) & 1 ? 0x1060c8 : 0x2a90f0), -1, max(0, .45 - hypot(x, y) / 600));
  }
};
function art() {
  SEED = 7;
  for (let l = 0; l < 3; l++) {
    const [a, b, c] = PAL[l], o = l * 3;
    for (let p = 0; p < 1024; p++) { const x = p & 31, y = p >> 5; G[p] = ab(mul(a, y % 8 == 7 || (x + (y >> 3 & 1) * 8) % 16 == 15 ? .5 : .8 + rnd() * .3)) }
    sv(o);
    R(0, 0, 32, 32, 0x0c0e10);
    for (let u = 0; u < 4; u++) {
      const y = u * 8 + 1;
      R(2, y, 28, 6, b); R(2, y, 28, 1, mul(b, 1.6));
      for (let i = 0; i < 3; i++) R(4 + i * 3, y + 2, 2, 2, rnd() < .5 ? c : 0x40ff60);
      for (let x = 15; x < 28; x += 2) R(x, y + 1, 1, 4, mul(b, .5));
    }
    sv(o + 1);
    for (let p = 0; p < 1024; p++) { const x = p & 31, y = p >> 5; G[p] = ab(y > 10 && y < 21 ? (x + y >> 2 & 1 ? c : 0x181818) : mul(a, .7 + rnd() * .15)) }
    for (let i = 2; i < 32; i += 8) R(i, 3, 2, 2, mul(a, 1.4)), R(i, 27, 2, 2, mul(a, 1.4));
    sv(o + 2);
  }
  for (let d = 0; d < 2; d++) {
    R(0, 0, 32, 32, 0x50565e); R(2, 2, 28, 28, 0x767e88); R(15, 0, 2, 32, 0x30343a);
    for (let y = 6; y < 26; y += 5) R(4, y, 9, 1, 0x5a6068), R(19, y, 9, 1, 0x5a6068);
    for (let p = 864; p < 992; p++) if ((p + (p >> 5)) >> 1 & 1) G[p] = ab(0xe0b020);
    if (d) R(0, 12, 32, 6, 0x2f6fff), R(6, 13, 4, 4, 0x9fdfff);
    sv(9 + d);
  }
  for (let t = 0; t < 4; t++) for (let f = 0; f < 6; f++) DR[t](f), sv(11 + t * 6 + f);
  MISC.forEach((f, i) => { f(); sv(35 + i) });
  NA();
}

// ---------- mapa, raycast, colisión ----------
const sol = (x, y) => {
  x = floor(x); y = floor(y);
  if (x < 0 || y < 0 || x >= W || y >= HH) return 1;
  const i = y * W + x, c = MAP[i];
  return c && !(c > 3 && DO[i] > .9);
};
// DDA. Devuelve la distancia perpendicular sobre (rx,ry); las puertas se deslizan por su cara.
function cast(x, y, rx, ry) {
  let mx = floor(x), my = floor(y), d = 0;
  const ex = abs(1 / rx), ey = abs(1 / ry), sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
  let ax = (rx < 0 ? x - mx : mx + 1 - x) * ex, ay = (ry < 0 ? y - my : my + 1 - y) * ey;
  for (let n = 0; n < 64; n++) {
    if (ax < ay) mx += sx, d = ax, ax += ex, HS = 0; else my += sy, d = ay, ay += ey, HS = 1;
    if (mx < 0 || my < 0 || mx >= W || my >= HH) break;
    const i = my * W + mx, c = MAP[i];
    if (MK) SEEN[i] = 1;
    if (c) {
      let u = HS ? x + d * rx : y + d * ry;
      u -= floor(u);
      if (c > 3) { if (u < DO[i]) continue; u -= DO[i] }
      // bandera y cartel no se leen espejados desde ninguna cara
      if (c > 5 && (HS ? ry > 0 : rx < 0)) u = 1 - u;
      HC = i; HU = u; return d;
    }
  }
  HC = -1; HU = 0; return d;
}
const los = (ax, ay, bx, by) => { const d = hypot(bx - ax, by - ay); return d < .01 || cast(ax, ay, (bx - ax) / d, (by - ay) / d) >= d };
const bl = (e, x, y, o, b) => { const n = hypot(e.x - x, e.y - y); return n < (b ? .9 : .55) && n < hypot(e.x - o.x, e.y - o.y) };
const fre = (o, x, y, r) => {
  if (sol(x - r, y - r) || sol(x + r, y - r) || sol(x - r, y + r) || sol(x + r, y + r)) return 0;
  // El jefe no cruza puertas: su arena es un cuarto del que el jugador puede salir a curarse.
  if (o.t > 2 && (MAP[floor(y - r) * W + floor(x - r)] | MAP[floor(y + r) * W + floor(x + r)] | MAP[floor(y - r) * W + floor(x + r)] | MAP[floor(y + r) * W + floor(x - r)]) > 3) return 0;
  // la cámara del título (ST 'title') no se traba contra los enemigos quietos del nivel 1
  if (o == PL) { if (ST < 't') for (const e of EN) if (e.on && e.s < 5 && bl(e, x, y, o, e.t == 3)) return 0 }
  else if (bl(PL, x, y, o, o.t == 3)) return 0;
  return 1;
};
const mv = (o, vx, vy, r) => { if (fre(o, o.x + vx, o.y, r)) o.x += vx; if (fre(o, o.x, o.y + vy, r)) o.y += vy };
const pas = i => { const c = MAP[i]; return !c || c == 4 || c == 5 && DO[i] > .9 };
// Campo de distancias BFS desde el jugador: lo usan los enemigos para rodear paredes.
function flow() {
  FF.fill(-1);
  let a = 0, b = 0;
  const s = floor(PL.y) * W + floor(PL.x);
  FF[s] = 0; Q[b++] = s;
  while (a < b) { const i = Q[a++]; for (const o of NB) { const n = i + o; if (FF[n] < 0 && pas(n)) FF[n] = FF[i] + 1, Q[b++] = n } }
}
// Lleva un pickup a la celda libre alcanzable más cercana: el chip del jefe nunca cae en pared ni puerta.
function place(o) {
  if (!o) return;
  let b = 1e9, bi = -1;
  for (let j = 0; j < W * HH; j++) if (!MAP[j] && FF[j] >= 0) { const d = hypot(j % W + .5 - o.x, (j / W | 0) + .5 - o.y); if (d < b) b = d, bi = j }
  if (bi >= 0 && (MAP[floor(o.y) * W + floor(o.x)] || FF[floor(o.y) * W + floor(o.x)] < 0)) o.x = bi % W + .5, o.y = (bi / W | 0) + .5;
}

// ---------- entidades ----------
function spawnE(t, x, y) {
  for (const e of EN) if (!e.on) return Object.assign(e, {on: 1, t, x, y, hp: ET[t][0], s: 0, st: 0, cd: 1, an: 0, f: 0, fa: 0, ph: rnd() * 6, sx: x, sy: y, sk: 0, rt: 0, rx: 0, ry: 0, mv: 0, v: 0, bp: 0, bs: 0, px: (x ^ y) & 1, py: ~(x ^ y) & 1});
}
function addP(k, x, y) { for (const p of PK) if (!p.on) return Object.assign(p, {on: 1, k, x, y}) }
function alert(e) { if (!e.s) e.s = 1, e.st = .3 + rnd() * .3, fx('alert', e) }
function hurt(v, s) { hp -= v; fx('hurt', v, rel(s.x, s.y)) }
function proj(e, a, s, d) {
  // sin objetos temporales: el jefe tira abanicos seguidos
  for (const j of PJ) if (!j.on) { j.on = 1; j.k = e.t > 2 ? 1 : 0; j.x = e.x + cos(a) * .3; j.y = e.y + sin(a) * .3; j.vx = cos(a) * s; j.vy = sin(a) * s; j.d = d; j.t = 5; fx('proj', e); return }
}
function dmgE(e, v) {
  const p = ET[e.t];
  e.hp -= v; e.f = .1; fx('hit', e);
  if (e.hp <= 0) {
    e.s = 5; SC += p[9]; LS.k++; fx('kill', e);
    if (e.t > 2) place(addP(7, e.x, e.y)); else if (rnd() < p[12]) place(addP(6, e.x, e.y));
  } else {
    alert(e);
    if (rnd() < p[11]) e.s = 4, e.st = .25, fx('pain', e);
  }
}
function attack(e, d) {
  const p = ET[e.t], a = atan2(PL.y - e.y, PL.x - e.x);
  e.fa = .15; e.cd = p[7] * (.7 + rnd() * .6);
  if (e.t > 2) {
    // Fase 1: abanico de 3 (hay que moverse). Fases 2-3: alterna 4 (hueco al centro: quedarse quieto) y 3.
    const n = e.bp ? 3 + (++e.bs & 1) : 3;
    for (let i = 0; i < n; i++) proj(e, a + (i - (n - 1) / 2) * .26, 4.4 + e.bp * .8, p[8]);
    e.cd *= 1 - e.bp * .25;
  } else if (p[5]) proj(e, a, 4, p[8]);
  else {
    fx('eshot', e);
    if (e.v && rnd() < max(.25, .85 - d / 16) * (mvd ? .7 : 1)) hurt(p[8] * max(.5, min(1.3, 1.4 - d / 10)) | 0, e); else fx('miss', e);
  }
}
function stepE(e, h) {
  const p = ET[e.t], dx = PL.x - e.x, dy = PL.y - e.y, d = hypot(dx, dy);
  e.f -= h; e.fa -= h; e.st -= h; e.mv = 0;
  if (e.s > 4) return;
  e.v = d < 16 && los(e.x, e.y, PL.x, PL.y);
  if (!e.s) {
    if (e.v && d < 13) return alert(e);
    // Guardias de ronda: van y vienen en línea recta; pegan la vuelta antes de pisar pared o puerta (nunca quedan adentro de una).
    if (!e.t) { if (MAP[floor(e.y + e.py * .6) * W + floor(e.x + e.px * .6)]) e.px = -e.px, e.py = -e.py; else mv(e, e.px * h * .7, e.py * h * .7, .3), e.mv = 1, e.an += h }
    return;
  }
  if (e.s != 2) { if (e.st <= 0) e.s == 3 && attack(e, d), e.s = 2; return }
  e.cd -= h;
  if (e.t > 2) {
    const b = e.hp > p[0] * .66 ? 0 : e.hp > p[0] * .33 ? 1 : 2;
    if (b != e.bp) { e.bp = b; fx('boss', b); if (b > 1 && d > 2) for (let i = 0; i < 2; i++) { const n = spawnE(1, e.x, e.y); n && alert(n) } }
  }
  if (e.v && d < p[4] && e.cd <= 0) { e.s = 3; e.st = p[6] - e.bp * .1; fx('tele', e); return }
  // Sin verte, los demás te buscan por el BFS; el jefe se queda en su arena (si no, acampa detrás de una puerta).
  let vx = 0, vy = 0;
  if (e.rt > 0) e.rt -= h, vx = e.rx, vy = e.ry;
  else if (e.v) {
    if (d > p[10]) vx = dx / d, vy = dy / d;
    if (e.t == 1) { const z = sin(T * 5 + e.ph) * .8; vx -= dy / d * z; vy += dx / d * z }
  } else if (e.t < 3) {
    const i = floor(e.y) * W + floor(e.x);
    let b = FF[i], bi = -1;
    for (const o of NB) { const v = FF[i + o]; if (v >= 0 && (b < 0 || v < b)) b = v, bi = i + o }
    if (bi >= 0) { vx = bi % W + .5 - e.x; vy = (bi / W | 0) + .5 - e.y; const l = hypot(vx, vy) || 1; vx /= l; vy /= l }
  }
  if (vx || vy) {
    const s = p[1] * h * (1 + e.bp * .3);
    mv(e, vx * s, vy * s, e.t > 2 ? .45 : .3); e.mv = 1; e.an += h;
    // Si en 2 s casi no avanzó, está trabado: camina 1 s hacia un lado al azar.
    if ((e.sk += h) > 2) { if (hypot(e.x - e.sx, e.y - e.sy) < .3) { const a = rnd() * TAU; e.rx = cos(a); e.ry = sin(a); e.rt = 1 } e.sk = 0; e.sx = e.x; e.sy = e.y }
  } else e.sk = 0, e.sx = e.x, e.sy = e.y;
}
function stepJ(h) {
  for (const j of PJ) if (j.on) {
    j.t -= h; j.x += j.vx * h; j.y += j.vy * h;
    if (j.t < 0 || sol(j.x, j.y)) j.on = 0, fx('pexp', j.x, j.y);
    else if (hypot(PL.x - j.x, PL.y - j.y) < .4) j.on = 0, hurt(j.d, j);
  }
}
function doors(h) {
  for (const i of DL) {
    const x = i % W + .5, y = (i / W | 0) + .5, k = MAP[i] > 4, o = DO[i];
    let n = hypot(PL.x - x, PL.y - y) < 1.5, oc = abs(PL.x - x) < .75 && abs(PL.y - y) < .75;
    if (n && k && !KC) { n = 0; if (lt <= 0) say('NECESITÁS LA TARJETA'), fx('locked'), lt = 2 }
    for (const e of EN) if (e.on && e.s && e.s < 5) { if (abs(e.x - x) < .8 && abs(e.y - y) < .8) oc = 1; if (!k && hypot(e.x - x, e.y - y) < 1.3) n = 1 }
    DT[i] = n ? 1.5 : DT[i] - h;
    // Nunca se cierra con alguien adentro (el cuerpo pisa la celda: jugador radio .25, enemigos .3): si está ocupada sigue abriendo.
    // Con .97 alcanzaba pararse en diagonal o pegado a la puerta para abrir una K sin tarjeta.
    DO[i] = DT[i] > 0 || oc ? min(1, o + h * 2) : max(0, o - h * 2);
    if (!o && DO[i]) fx('door', i, 1);
    if (o == 1 && DO[i] < 1) fx('door', i, 0);
  }
}

// ---------- jugador y armas ----------
function shoot() {
  const w = WP[wpn];
  fcd = w[0]; rec = 1; fa = .07; LS.s++; fx('shot', wpn);
  if (wpn) AM[wpn]--;
  for (const e of EN) if (e.on && !e.s && hypot(e.x - PL.x, e.y - PL.y) < 10) alert(e);
  let ba = pa, bd = .08, hit = 0;
  // Asistencia horizontal: corrige hasta ~4,5° hacia el enemigo visible más alineado.
  for (const e of EN) if (e.on && e.s < 5) { const r = rel(e.x, e.y); if (abs(r) < bd && los(PL.x, PL.y, e.x, e.y)) bd = abs(r), ba = pa + r }
  for (let k = 0; k < w[2]; k++) {
    const a = ba + (rnd() - .5) * 2 * w[3], rx = cos(a), ry = sin(a), wd = cast(PL.x, PL.y, rx, ry);
    let b = null, bd2 = wd;
    for (const e of EN) if (e.on && e.s < 5) {
      const ox = e.x - PL.x, oy = e.y - PL.y, al = ox * rx + oy * ry;
      if (al > 0 && al < bd2 && abs(ox * ry - oy * rx) < ET[e.t][2] * .32) b = e, bd2 = al;
    }
    if (b) dmgE(b, w[1]), hit = 1; else fx('wall', PL.x + rx * wd, PL.y + ry * wd);
  }
  if (hit) LS.h++;
  if (wpn && AM[wpn] < 1) wpn = 0, fx('switch', 0);
}
function stepP(h) {
  const fw = (H.U > 0) - (H.D > 0), tr = (H.R > 0) - (H.L > 0), sp = (H[4] > 0 ? 4.2 : 2.6) * h, dx = cos(pa), dy = sin(pa),
    sd = (H[2] > 0) * tr + (H[6] > 0) - (H[5] > 0), vx = dx * fw - dy * sd, vy = dy * fw + dx * sd;
  if (H[2] > 0) tv = 0;
  else if (tr) { if (tr != td) tv = 0; td = tr; tv = min(1, tv + h * 2.5); pa = nrm(pa + tr * h * (1.3 + 2.4 * tv * tv)) }
  else tv = 0;
  const l = hypot(vx, vy);
  mvd = l > 0;
  if (l) {
    const x = PL.x, y = PL.y, o = floor(bob / PI);
    mv(PL, vx / l * sp, vy / l * sp, .25);
    bob += hypot(PL.x - x, PL.y - y) * 3.2;
    if (o != floor(bob / PI)) fx('step');
    if (bob > TAU) bob -= TAU;
  }
  if (P[3]) {
    P[3] = 0;
    for (let i = 1; i < 4; i++) { const w = (wpn + i) % 3; if (!w || HW[w] && AM[w] > 0) { if (w != wpn) wpn = w, fx('switch', w); break } }
  }
  fcd -= h; rec = max(0, rec - h * 6); fa -= h;
  if (!(H[1] > 0)) nf = 0;
  else if (fcd <= 0 && !nf) shoot();
}
function stepK() {
  for (const p of PK) if (p.on && p.k < 8 && hypot(p.x - PL.x, p.y - PL.y) < (p.k == 5 ? .9 : .55)) {
    const k = p.k;
    if (k == 5) { if (eo) won = 1; else if (lt <= 0) say(CN - CL > 1 ? `FALTAN ${CN - CL} CHIPS` : 'FALTA 1 CHIP'), fx('locked'), lt = 2; continue }
    if (k == 1) { if (hp >= 100) continue; hp = min(100, hp + 25) }
    // con la pistola en la mano (te quedaste sin balas), la munición te devuelve el rifle
    if (k == 2 || k == 6) { AM[1] += k < 3 ? 25 : 8; AM[2] += HW[2] * (k < 3 ? 4 : 2); if (!wpn) wpn = 1, fx('switch', 1) }
    if (k == 3) KC = 1, say('TARJETA-LLAVE');
    if (k == 4) HW[2] = 1, AM[2] += 8, wpn = 2, say('ESCOPETA');
    p.on = 0; fx('pick', k);
    if (!k || k == 7) {
      CL++; SC += 1000; fx('chip', CT + CL, k);
      if (CL >= CN) { if (L > 1) won = 1; else eo = 1, fx('alarm'), say('SALIDA ABIERTA', 3) }
    }
  }
}

// ---------- flujo de juego ----------
function newGame() { lives = 3; SC = 0; CT = 0; HW = [1, 1, 0]; AM = [0, 40, 0]; wpn = 1; TOT = {k: 0, s: 0, h: 0, t: 0} }
function startLevel(l) {
  L = l; SEED = 99 + l * 7919; T = 0; won = eo = KC = CL = CN = MT = lt = ft = rec = fa = tv = bob = hk = 0; fcd = .3; hp = 100; pa = 0; boss = null;
  LS = {k: 0, s: 0, h: 0, t: 0}; snap = [SC, AM.slice(), HW.slice(), wpn];
  for (const A of ALL) for (const o of A) o.on = 0;
  const R = LV[l].split(' '), N = R.length * R[0].length;
  HH = R.length; W = R[0].length;
  MAP = new Uint8Array(N); DO = new Float32Array(N); DT = new Float32Array(N); SEEN = new Uint8Array(N); FF = new Int16Array(N); Q = new Int16Array(N); NB = [-1, 1, -W, W]; DL = [];
  for (let y = 0; y < HH; y++) for (let x = 0; x < W; x++) {
    const c = R[y][x], i = y * W + x, X = x + .5, Y = y + .5;
    let v = '#=+DKFN'.indexOf(c) + 1;
    MAP[i] = v;
    if (v > 3 && v < 6) DL.push(i);
    if (c == '@') PL.x = X, PL.y = Y;
    v = 'gdrB'.indexOf(c);
    if (v >= 0) { const e = spawnE(v, X, Y); if (v > 2) boss = e }
    v = 'chaksX__p'.indexOf(c);
    if (v >= 0) { addP(v, X, Y); if (!v) CN++; if (v == 5) EX = X, EY = Y }
  }
  if (l > 1) CN++;
  for (let y = 0; y < 300; y++) { const f = .2 + abs(y - 150) / 120; FC[y] = ab(mul(PAL[l][y < 150 ? 4 : 3], f)); FD[y] = ab(mul(PAL[l][3], f * .7)); FL[y] = ab(mul(PAL[l][2], f * .8)) }
  FG(l * 3); flow(); fx('level', l);
}
function win() {
  won = 0;
  LB = [(LS.s ? LS.h / LS.s : 0) * 2000 | 0, max(0, 3000 - LS.t * 10) | 0, max(0, hp) * 10 | 0];
  SC += LB[0] + LB[1] + LB[2]; CT += CL;
  for (const k in TOT) TOT[k] += LS[k];
  fx('win'); go('levelEnd');
}
function die() {
  lives--; fx('die');
  if (lives < 1) return go('gameover');
  SC = snap[0]; AM = snap[1].slice(); HW = snap[2].slice(); wpn = snap[3];
  startLevel(L); rad(1, '¡ARRIBA, JENSEN! DE NUEVO.', 3);
}
function tick(h) {
  T += h; LS.t += h; MT -= h; lt -= h;
  if ((ft -= h) <= 0) ft = .25, flow();
  stepP(h); doors(h);
  for (const e of EN) if (e.on) stepE(e, h);
  stepJ(h); stepK();
  if (won) win();
}

// ---------- render ----------
const blit = (id, x0, y0, s) => {
  x0 |= 0; y0 |= 0;
  for (let j = 0; j < 32 * s; j++) for (let i = 0; i < 32 * s; i++) {
    const c = IMG[id << 14 | j / s << 5 | i / s], X = x0 + i, Y = y0 + j;
    if (c && X >= 0 && X < 400 && Y >= 0 && Y < 300) B[Y * 400 + X] = c;
  }
};
const put = () => { CX.putImageData(ID, 0, 0); TX.refresh() };
const fr = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) B.fill(c, j * 400 + x, j * 400 + x + w) };
const dim = (s, a, b) => { const m = (255 >> s) * 65793; for (let i = a | 0; i < (b || 12e4); i++) B[i] = B[i] >> s & m | -16777216 };
const mix = (a, b, k) => { let r = -16777216; for (let s = 0; s < 24; s += 8) r |= (a >> s & 255) * (1 - k) + (b >> s & 255) * k << s; return r };
const tint = (c, k) => { for (let i = 0; i < 12e4; i++) B[i] = mix(B[i], c, k) };
// Arco en el borde de la mira apuntando al ángulo relativo r (0 = adelante): daño recibido y salida.
const ind = (r, c, k) => { for (let u = -.3; u < .3; u += .01) for (let q = 86; q < 96; q++) { const i = (150 - cos(r + u) * q | 0) * 400 + (200 + sin(r + u) * q * 1.3 | 0); B[i] = mix(B[i], c, k * (1 - abs(u) * 3)) } };
const ci = (x, y, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) B[(y + j) * 400 + x + i] = c };
// ---------- piezas de UI en el buffer (todas en coordenadas de 400x300) ----------
// verde NVIDIA y tinta de los contornos, en ABGR
const XG = -16729738, XK = -16120059;
const dr = (x, y, w, h, s) => { for (let j = y; j < y + h; j++) dim(s, j * 400 + x, j * 400 + x + w) };
// panel: rectángulo oscurecido con borde cromado de 1 px y línea verde arriba (salvo con g)
const pnl = (x, y, w, h, s, g) => { dr(x, y, w, h, s); fr(x, y, w, 1, -2305336); fr(x, y, 1, h, -6911363); fr(x, y + h - 1, w, 1, -11713734); fr(x + w - 1, y, 1, h, -11713734); g || fr(x + 1, y + 1, w - 2, 1, XG) };
// keycap de color c (RGB); apretada (p) baja 2 px y pierde la base
const key = (x, y, w, h, c, p) => { c = ab(c); p = p ? 2 : 0; y += p; fr(x - 1, y - 1, w + 2, h + 3 - p, XK); fr(x, y, w, h + 2 - p, mix(c, -16777216, .45)); fr(x, y, w, h, c); fr(x + 1, y, w - 2, 1, mix(c, -1, .35)); fr(x, y + h - 2, w, 2, mix(c, -16777216, .18)) };
// cinta roja con las puntas en diagonal
const rib = (x, y, w, h) => { for (let j = 0; j < h; j++) { const o = h - j >> 1; fr(x + o - 2, y + j, w - o * 2 + j + 4, 1, -16119174); j && j < h - 1 && fr(x + o, y + j, w - o * 2 + j, 1, -14803240) } fr(x + 4, y + 2, w - 8, 1, -14211073) };
// sprite con contorno oscuro de 1 px (para fondos claros); recorta contra los bordes
const blo = (id, x, y, s) => { for (const o of [-1, 1, -400, 400]) for (let j = 0; j < 32 * s; j++) for (let i = 0; i < 32 * s; i++) { const X = x + i + o % 400, k = (y + j) * 400 + x + i + o; IMG[id << 14 | j / s << 5 | i / s] && X >= 0 && X < 400 && k >= 0 && k < 12e4 && (B[k] = XK) } blit(id, x, y, s) };
// Logo en letras pixel de 6x7 (solo las que se usan): filas de 6 bits con offset 40, degradé por fila,
// contorno, sombra dura e itálica. Igual en cualquier sistema: no depende de la monospace instalada.
const FN = 'ABCKTOHERDGMV', FT = 'F[[g[[[f[[f[[fGXXXXXG[^d`d^[gg44444F[[[[[F[[[g[[[gXXfXXgf[[fd^[f[[[[[fGXX_[[G[gg[[[[[[[[[F4';
const GG = [0xfff7a0, 0xffe23a, 0xffc21a, 0xffa014, 0xff7a12, 0xf04a14, 0xe0261a].map(ab), GV = [0xffd0c0, 0xff9a80, 0xff6a5a, 0xf03a2a, 0xd01a1a, 0xa01010, 0x700808].map(ab);
const word = (w, x, y, s, g = GG) => {
  for (let p = 0; p < 3; p++) for (let n = 0; n < w.length; n++) for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) if (FT.charCodeAt(FN.indexOf(w[n]) * 7 + r) - 40 >> 5 - c & 1) {
    const X = x + (n * 7 + c) * s + (6 - r) * s / 5, Y = y + r * s;
    p > 1 ? fr(X, Y, s, s, g[r]) : p ? fr(X - 1, Y - 1, s + 2, s + 2, -16775638) : fr(X + 2, Y + 3, s, s, -16777216);
  }
};
// copia del fondo de una pantalla estática (para redibujar teclas sin recalcular el sunburst)
const BG = new Uint32Array(12e4), SEP = [42, 130, 236, 342], UX = [243, 275, 314], UW = [29, 36, 22];
// Barra inferior del HUD: retrato que reacciona, salud, arma, 12 chips agrupados por nivel, vidas y tarjeta.
function hudB(f) {
  fr(0, 262, 400, 38, -14936558); fr(0, 265, 400, 16, -14279144); fr(0, 262, 400, 1, XG); fr(0, 263, 400, 1, -2305336); fr(0, 264, 400, 1, -11713734);
  for (const x of SEP) fr(x, 268, 1, 29, -11713734), fr(x + 1, 268, 1, 29, -13094870);
  fr(4, 265, 34, 34, f > 2 ? -12918017 : f ? -12895233 : XG); fr(5, 266, 32, 32, f == 1 ? -15724454 : f > 2 ? -15709654 : -14542316); blit(50 + f, 5, 266, 1);
  fr(47, 291, 81, 6, XK); fr(48, 292, max(0, hp) * .79 | 0, 4, hp > 60 ? XG : hp > 30 ? -14634753 : -12895233);
  blit(46 + wpn, 198, 266, 1);
  // el H-1000 ocupa siempre el último lugar, aunque se junte antes que los otros dos de Pekín
  for (let n = 0, x = 244; n < 12; n++, x += n == 4 || n == 9 ? 11 : 7) {
    const h = n > 10, g = h ? hk : n < CT + CL - hk;
    fr(x, 281, 6, 6, g ? h ? -3126630 : XG : XK); g ? fr(x + 2, 283, 2, 2, h ? -12529409 : -6225960) : fr(x + 1, 282, 4, 4, -13094870);
    B[112001 + x] = B[112004 + x] = B[114801 + x] = B[114804 + x] = -12537640;
  }
  fr(UX[L], 291, UW[L], 1, XG);
  for (let i = 0; i < lives; i++) { const x = 348 + i * 12; fr(x, 268, 10, 11, XK); fr(x + 1, 269, 8, 3, -3883848); fr(x + 2, 272, 6, 5, -7555870); fr(x + 2, 273, 6, 2, -15658735); B[109203 + x] = B[109206 + x] = -5937; fr(x + 1, 277, 8, 2, -14936297) }
  L == 1 && (fr(348, 284, 16, 10, KC ? -37073 : XK), fr(349, 285, 14, 8, KC ? -37073 : -13950436), fr(349, 287, 14, 2, KC ? -15658735 : -13094870), fr(351, 290, 4, 2, KC ? -12537640 : -13094870));
}
function render() {
  const dx = cos(pa), dy = sin(pa), qx = -dy * .66, qy = dx * .66;
  // piso en damero y techo con paneles de luz (raycast por fila, la distancia sale de la altura de la fila)
  for (let y = 150; y < 300; y++) {
    const r = 150 / (y - 149.5), sx = r * qx / 200, sy = r * qy / 200;
    let u = PL.x + r * (dx - qx), v = PL.y + r * (dy - qy);
    for (let x = 0, i = y * 400, j = (299 - y) * 400; x < 400; x++, i++, j++, u += sx, v += sy) {
      B[i] = (u | 0) + (v | 0) & 1 ? FD[y] : FC[y];
      B[j] = (u * 2 & 3) == 1 && (v * 2 & 3) == 1 ? FL[y] : FC[299 - y];
    }
  }
  MK = 1;
  for (let x = 0; x < 400; x++) {
    const c = x / 200 - 1;
    let d = cast(PL.x, PL.y, dx + qx * c, dy + qy * c);
    if (!(d > .02)) d = .02;
    ZB[x] = d;
    const h = 300 / d, t = 150 - h / 2, m = HC < 0 ? 1 : MAP[HC],
      o = ((m < 4 ? L * 3 + m - 1 : m < 6 ? m + 5 : m + 58) * 16 + min(15, d * 1.4 + HS * 2 | 0)) << 10 | HU * 32 & 31;
    for (let y = max(0, ceil(t)), i = y * 400 + x; y < t + h && y < 300; y++, i += 400) B[i] = IMG[o | ((y - t) / h * 32 & 31) << 5];
  }
  MK = 0;
  let n = 0;
  for (const A of ALL) for (const o of A) if (o.on) {
    o.dp = (o.x - PL.x) * dx + (o.y - PL.y) * dy;
    if (o.dp > .15) { let j = n++; while (j && RL[j - 1].dp < o.dp) RL[j] = RL[j - 1], j--; RL[j] = o }
  }
  for (let k = 0; k < n; k++) {
    const o = RL[k], dp = o.dp;
    let id, sc = .5, z = 0, sh = min(15, dp * 1.4 | 0), wd = 1;
    if (!o.g) { const p = ET[o.t]; sc = p[2]; if (o.s < 5) z = p[3] + (o.t == 1 ? sin(T * 4 + o.ph) * .05 : 0); id = 11 + o.t * 6 + (o.s > 4 ? 5 : o.s > 3 ? 4 : o.fa > 0 ? 3 : o.s > 2 ? 2 : o.mv ? o.an * 5 & 1 : 0) }
    // la salida es el auto (62-63, 64x32): trabada se ve apagado; al lado espera RADIO (nivel 1) o GPU (nivel 2)
    else if (o.g < 2) { id = 35 + o.k; if (o.k == 5) id = 62, wd = 2, sc = .8, eo || (sh = min(15, sh + 8)); else if (o.k > 7) id = 59 + L * 2, sc = L ? .5 : .8; else if (!o.k || o.k == 7) z = .15 + sin(T * 3) * .05 }
    else id = 44 + o.k, sc = .4, z = .35, sh = 0;
    const s = 300 / dp, sz = sc * (o.g || o.s < 5 ? s : 300 / max(dp, 1.5)), cx = 200 * (1 + ((o.x - PL.x) * qx + (o.y - PL.y) * qy) / .4356 / dp),
      bt = 150 + s * (.5 - z), tp = bt - sz, lf = cx - sz * wd / 2, fl = !o.g && o.f > 0, of = (id * 16 + sh) << 10;
    for (let x = max(0, ceil(lf)); x < min(400, lf + sz * wd); x++) if (dp < ZB[x]) {
      const tx = (x - lf) / sz * 32 | 0, ot = of + (tx >> 5 << 14) | tx & 31;
      for (let y = max(0, ceil(tp)); y < min(300, bt); y++) { const c = IMG[ot | ((y - tp) / sz * 32 & 31) << 5]; if (c) B[y * 400 + x] = fl ? -1 : c }
    }
  }
  // partículas, recortadas por el z-buffer
  for (let i = 0; i < 64; i++) if (PT[i] > 0) {
    const ox = PX[i] - PL.x, oy = PY[i] - PL.y, dp = ox * dx + oy * dy, x = 200 * (1 + (ox * qx + oy * qy) / .4356 / dp) | 0, y = 150 + 300 / dp * (.5 - PZ[i]) | 0, s = max(1, 3 / dp | 0);
    if (dp > .2 && x >= 0 && x < 400 - s && y >= 0 && y < 300 - s && dp < ZB[x]) fr(x, y, s, s, PQ[i]);
  }
  // recorrido del modo atracción: el nivel sin arma ni HUD
  if (ST == 'title') return;
  // Arma a escala 4 corrida a la derecha (no tapa la mira), con la mano apoyada sobre la barra del HUD; fogonazo en la boca del cañón.
  const X0 = 172 + sin(bob) * 6, Y0 = 148 + abs(cos(bob)) * 5 + rec * 10, f = jt > 0 ? jf : hp > 30 ? 0 : 2;
  if (fa > 0) blit(49, X0 + 32, Y0 + MZL[wpn] * 4 - 36, 2);
  blit(46 + wpn, X0, Y0, 4);
  // la mira se pone roja si la asistencia de apuntado tiene un enemigo; no se dibuja en pausa ni con el cartel del nivel
  let xc = -10420384;
  for (const e of EN) if (e.on && e.s < 5 && abs(rel(e.x, e.y)) < .08 && los(PL.x, PL.y, e.x, e.y)) xc = -12570369;
  if (ST == 'playing' && T >= 2.5) for (let i = -4; i < 5; i++) if (abs(i) > 1) B[60200 + i] = B[60200 + i * 400] = xc;
  if (boss && boss.s && boss.s < 5) {
    fr(98, 20, 204, 10, -4144960); fr(100, 22, 200, 6, -16777168);
    fr(100, 22, max(0, boss.hp) / ET[3][0] * 200 | 0, 6, BC[boss.bp]);
    fr(166, 20, 2, 10, -4144960); fr(233, 20, 2, 10, -4144960);
  }
  // minimapa: celdas que tocó algún rayo (SEEN), 3 px por celda, arriba a la derecha
  const ox = 396 - W * 3;
  for (let y = 18; y < 22 + HH * 3; y++) dim(1, y * 400 + ox - 2, y * 400 + 398);
  fr(ox - 3, 16, W * 3 + 5, 1, -2305336); fr(ox - 3, 16, 1, HH * 3 + 6, -6911363); fr(ox - 3, 22 + HH * 3, W * 3 + 5, 1, -11713734); fr(ox + W * 3 + 1, 16, 1, HH * 3 + 6, -11713734);
  for (let i = 0; i < W * HH; i++) if (SEEN[i]) { const m = MAP[i]; fr(ox + i % W * 3, 20 + (i / W | 0) * 3, 3, 3, m == 5 ? -37073 : m == 4 ? -14638880 : m ? -6254456 : -13621216) }
  if (eo && RT % .5 < .3) fr(ox + (EX | 0) * 3, 20 + (EY | 0) * 3, 3, 3, -10420416);
  for (let k = 0; k < 4; k++) B[(20 + PL.y * 3 + sin(pa) * k | 0) * 400 + (ox + PL.x * 3 + cos(pa) * k | 0)] = -1;
  if (eo) ind(rel(EX, EY), -10420416, .45 + sin(RT * 6) * .25);
  if (dI > 0) ind(nrm(dA - pa), -12570369, min(1, dI));
  // cartel de nivel, caja de radio (a la izquierda, donde el arma nunca llega) y barra inferior; los flashes tiñen todo
  if (T < 2.5) dr(0, 100, 400, 56, 1), rib(50, 112, 300, 28);
  if (rq > 0 && ST == 'playing') pnl(4, 222, 166, 36, 2), fr(6, 224, 32, 32, -14542316), blit(rw ? RP[rw] : 50 + f, 6, 224, 1);
  hudB(f);
  if (rf > 0) tint(-16777024, rf); else if (pf > 0) tint(PCL, pf); else if (hb > .7) tint(-16777024, hb - .7);
}
const st = (t, s) => t.text !== s && t.setText(s);
// El HUD compara los valores antes de armar el texto: ningún string nuevo por frame si nada cambió.
const HV = [], hv = (i, v) => HV[i] !== v && (HV[i] = v, 1);
function hud() {
  const d = round(rel(EX, EY) / PI * 2) & 3, m = MT > 0, w = wpn && AM[wpn] < 6, r = rq > 0;
  hv(0, SC) && hS.setText('PUNTOS ' + SC);
  hv(1, max(0, hp)) && hB.setText('' + max(0, hp));
  hv(2, hp > 30) && hB.setColor(hp > 30 ? '#fff' : '#ff3b3b');
  hv(3, wpn + AM[wpn] * 3) && (hX.setText(WP[wpn][4]), hW.setText(wpn ? '' + AM[wpn] : '∞'));
  hv(4, w) && hW.setColor(w ? '#ffb020' : '#fff');
  hv(5, CT + CL) && hC.setText(`CHIPS ${CT + CL}/12`);
  hv(6, m ? MSG : eo ? d : -1) && hM.setText(m ? MSG : eo ? 'AL AUTO ' + '↑→↓←'[d] : '');
  hv(7, m) && hM.setColor(m ? '#fff' : QN);
  hN.setVisible(r); hR.setVisible(r);
}
// Timers de game feel (solo corren en playing, así que la pausa los congela).
function feel(h) {
  rf -= h; pf -= h; dI -= h; rq -= h; hb -= h; jt -= h;
  const s = max(0, shk -= h) * 50;
  IM.setPosition(400 + (Math.random() - .5) * s, 300 + (Math.random() - .5) * s);
  for (let i = 0; i < 64; i++) if (PT[i] > 0) { PT[i] -= h; PX[i] += VX[i] * h; PY[i] += VY[i] * h; PZ[i] += (VZ[i] -= 5 * h) * h; if (PZ[i] < 0) PZ[i] = 0, VZ[i] *= -.4 }
  if (hp <= 30 && hb <= 0) hb = .9, fx('beat');
}

// ---------- ranking (window.platanusArcadeStorage) ----------
const SK = 'op-recall-scores-v1';
// Lo leído puede venir con cualquier forma: solo pasan objetos {n: string, s: número finito}, saneados.
const san = v => (Array.isArray(v) ? v.slice(0, 50) : []).filter(o => o && typeof o.n == 'string' && Number.isFinite(o.s))
  .map(o => ({n: (o.n.slice(0, 9).toUpperCase().replace(/[^A-Z.-]/g, '') || 'JEN').slice(0, 3), s: min(9999999, max(0, floor(o.s)))})).sort((a, b) => b.s - a.s).slice(0, 5);
// Todo adentro de una cadena de promesas con catch: si el bridge no existe, tira o rechaza, queda el ranking en memoria.
// El timeout lo pone la pantalla de carga con el reloj propio; si la lectura llega tarde, se mezcla igual.
// rok = alguna lectura respondió: hasta entonces no se escribe nunca (pisaría el top 5 guardado). Se mezcla una sola vez.
const mg = r => {
  if (rok) return;
  rok = 1;
  const e = RK[hi];
  if (r && r.found) RK = san(RK.concat(san(r.value)));
  if (e) hi = RK.findIndex(o => o.n == e.n && o.s == e.s);
};
const ld = () => Promise.resolve().then(() => window.platanusArcadeStorage.get(SK)).then(mg).catch(n => n).then(() => rl = 1);
// Si la carga inicial falló, relee y mezcla antes de escribir; si vuelve a fallar no escribe: lo nuevo queda en memoria y se guarda en el próximo intento.
const sto = () => Promise.resolve().then(() => rok || window.platanusArcadeStorage.get(SK)).then(mg).then(() => rok && window.platanusArcadeStorage.set(SK, RK.slice())).catch(n => n);
const ql = () => SC > 0 && (RK.length < 5 || SC > RK[4].s);
const keep = n => { const e = {n, s: min(9999999, SC)}; RK.push(e); RK.sort((a, b) => b.s - a.s); RK = RK.slice(0, 5); hi = RK.indexOf(e); sto() };

// ---------- pantallas ----------
// colores de texto: titulares, acento verde, ayudas sobre azul, etiquetas
const QY = '#ffe23a', QN = '#a6e22e', QI = '#cfe0ff', QD = '#a9b4c2', U = [];
// game over: lo dice LA DIRECTORA
const GO = ['El directorio retiró la oferta.\nYa imprimieron el comunicado. Otra vez.', 'OMNICORE 1 · Jensen 0.\nLa campera quedó en objetos perdidos.', 'Seguimos muy decepcionados.\nLos chips siguen en China.'];
const GR = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ.-', ['DEL', 'END']];
// intro: hablan LA DIRECTORA, EL INVERSOR, RADIO y JENSEN
const IN = [
  'Jensen: hiciste un muy mal trabajo.\nTu novia le pasó todos los chips\na China. Estamos muy decepcionados.\nQuedás afuera del directorio.',
  '¿Querés volver a ser el CEO?\nTenés que recuperarlos a todos.\nLos 12. Uno por uno.\nSin chips no hay sillón.',
  `¿Jensen? Acá ${RN[1]}. Los ubiqué:\ntres data centers de OMNICORE.\nEl auto ya está en la puerta.\n${RN[2]} huele silicio a 1 km.`,
  'Campera de cuero: puesta.\nRifle: cargado. Keynote: cancelada.\nDoce chips. Tres data centers.\nOPERACIÓN RECALL. Vamos.',
];
// fin de nivel: quién espera en el auto (GPU, EL INVERSOR, LA DIRECTORA = RN[L + 2]) y qué dice
const LW = ['¡GUAU! (SUBÍ, QUE\nHAY MÁS CHIPS)', 'VAMOS BIEN. LA ACCIÓN\nYA SUBIÓ 3%.', 'ESTÁ BIEN, JENSEN.\nSUBÍ. HABLEMOS.'];
const ACTA = `1. Se recuperaron los 12 chips.\n2. La novia ya no tiene llave del depósito.\n3. Jensen vuelve como CEO. Con campera.\n4. La acción subió 900%. Nadie entiende.\n\nVotación: unanimidad.\n(${RN[2]} votó con la pata.)`;
// controles del jugador del lado derecho (espejo de CABINET_KEYS)
const MIR = '↑←↓→ = WASD   R T Y = U I O   F G H = J K L   2 = ENTER';
// Teclado dibujado (controles y pausa): tecla, x, y, ancho, color (RGB), qué hace, color de la etiqueta.
// Verificado contra CABINET_KEYS y stepP: W/S P1_U/D, A/D P1_L/R, U P1_1, I P1_2, O P1_3, J P1_4, K/L P1_5/6, ENTER START1.
const KK = [['W', 82, 86, 26, 0xdfe5ea], ['A', 52, 116, 26, 0xdfe5ea], ['S', 82, 116, 26, 0xdfe5ea], ['D', 112, 116, 26, 0xdfe5ea],
  ['U', 196, 80, 30, 0xe8261c, 'DISPARAR', '#ff7a6a'], ['I', 238, 80, 30, 0x2f7fe0, 'STRAFE\n+ A/D', '#7fb8ff'], ['O', 280, 80, 30, 0xffd21a, 'ARMA', '#ffd21a'],
  ['J', 206, 128, 30, 0x76b900, 'CORRER', QN], ['K', 248, 128, 30, 0x2f7fe0, 'STRAFE ←', '#7fb8ff'], ['L', 290, 128, 30, 0x2f7fe0, 'STRAFE →', '#7fb8ff'], ['ENTER', 312, 172, 66, 0xb8c2cc]];
// Configura el texto U[i] del pool (creado una sola vez en create). k = color del contorno.
const ui = (i, x, y, s, z, c = '#fff', o = .5, k = '#000') => U[i].setPosition(x, y).setOrigin(o, 0).setAlign(o ? 'center' : 'left').setStroke(k, c == '#000' ? 0 : z > 30 ? 6 : z < 15 ? 3 : 4).setFontSize(z + 'px').setColor(c).setText(s).setAngle(0).setVisible(1);
const rk = (i, y, z, p, h) => { for (let k = 0; k < 5; k++) { const e = RK[k]; ui(i + k, 400, y + k * p, `${k + 1}. ${e ? e.n.padEnd(3) : '---'}  ${String(e ? e.s : 0).padStart(7)}`, z, k === h ? '#000' : k ? '#fff' : QY) } };
// a = solo redibuja las teclas (la animación de la página de controles): los textos no se re-renderizan
const kb = (i, q, a) => {
  pnl(14, 50, 160, 160, 2); pnl(182, 50, 204, 160, 2);
  KK.forEach((k, n) => {
    const p = q == n, x = k[1] * 2 + k[3], y = k[2] * 2 + 8 + p * 4;
    key(k[1], k[2], k[3], 24, k[4], p);
    if (a) U[i + 2 + n].y = y;
    else ui(i + 2 + n, x, y, k[0], n > 9 ? 18 : 26, 'UIKL'.includes(k[0]) ? '#fff' : '#000'), k[5] && ui(i + 9 + n, x, k[2] * 2 + 54, k[5], 14, k[6]);
  });
  a || (ui(i, 188, 108, 'MOVERTE', 18, QN), ui(i + 1, 570, 108, 'ACCIÓN', 18, QN), ui(i + 19, 228, 186, 'AVANZAR', 16, '#fff', 0), ui(i + 20, 96, 246, 'GIRAR', 16, '#fff', 1),
    ui(i + 21, 284, 246, 'GIRAR', 16, '#fff', 0), ui(i + 22, 190, 300, 'RETROCEDER', 16), ui(i + 23, 612, 356, 'PAUSA', 16, '#fff', 1), ui(i + 24, 386, 400, 'U · I · J: MANTENÉ APRETADO', 14, QD, 0));
};
// Título: logo en letras pixel, cinta, panel del top 5 y el elenco parado sobre el escenario.
function tit() {
  drawBurst(0);
  ci(52, 52, 28, ab(0x9fdcff)); ci(52, 52, 21, ab(0xd8f0ff)); ci(52, 52, 14, ab(0xfff7a0)); blo(35, 28, 24, 1.5);
  word('BACK', 128, 12, 5); word('TO', 99, 57, 2); word('THE', 92, 74, 2); word('BOARD', 138, 54, 5);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 16; j++) fr(274 + i * 9 + (16 - j) / 3, 20 + j, 5, 1, j && j < 15 ? GG[j / 2.3 | 0] : -16775638);
  rib(110, 96, 180, 15); pnl(132, 116, 136, 64, 1);
  for (let y = 270; y < 300; y++) fr(0, y, 400, 1, mix(ab(0x0a1a48), -16777216, (y - 270) / 40));
  fr(0, 270, 400, 1, ab(0x6cc0ff));
  blo(62, -62, 208, 2); blo(63, 2, 208, 2); blo(57, 34, 206, 2); blo(54, 94, 206, 2); blo(58, 182, 206, 2); blo(59, 254, 206, 2); blo(61, 330, 208, 2);
}
// Escena final, un frame: entra (A), se sienta y gira (B, "VOLVISTE A SER EL CEO"), acta del directorio (C).
function fin() {
  const t = STT, a = t < 2.4, b = t >= 3.6 && t < 6, c = t >= 6;
  drawEnding(t);
  a && pnl(100, 4, 200, 22, 1); b && rib(70, 6, 260, 22); c && (pnl(30, 6, 340, 112, 3, 1), fr(31, 7, 338, 14, XG));
  U[3].setVisible(a); U[0].setVisible(b); U[1].setVisible(c); U[2].setVisible(c); U[9].setVisible(c && t % 1 < .65);
  put();
}
const go0 = () => { newGame(); startLevel(0); go('playing') };
const gY = k => k > 27 ? 470 : 246 + (k / 7 | 0) * 56;
// Arma los textos (y el fondo, si es estático) del estado y página actuales.
function scr() {
  STT = 0; bk = -1; HV[9] = 0;
  for (const t of U) t.setVisible(0);
  const s = ST, Y = '#3a0800', R = '#4a0000', vg = s == 'victory' || s == 'gameover';
  if (s == 'loading') ui(0, 400, 280, 'CARGANDO...', 28);
  if (s == 'title') {
    if (!pg) tit(), ui(0, 400, 194, 'THE RETURN OF THE CEO', 20, '#fff', .5, R), ui(1, 400, 240, 'MEJORES PUNTAJES', 14, QN), rk(2, 258, 16, 19),
      ui(7, 400, 542, 'APRETÁ ENTER', 28, QY, .5, Y), ui(8, 400, 580, 'WASD MOVER · U DISPARAR · O ARMA · J CORRER · ENTER PAUSA', 14, QI), bk = 7;
    else {
      // atracción: 1 ranking, 2 controles con el teclado, 3 recorrido del nivel 1
      const e = pg == 2 ? 29 : 15;
      if (pg < 3) drawBurst(0), dim(pg);
      if (pg == 1) pnl(90, 70, 220, 150, 2), blo(61, 330, 200, 2), ui(0, 400, 40, 'MEJORES PUNTAJES', 40, QY, .5, Y), rk(1, 168, 30, 54);
      if (pg == 2) pnl(14, 218, 372, 40, 2, 1), BG.set(B), kq = -1, kb(2), ui(0, 400, 16, 'CONTROLES', 40, QY, .5, Y), ui(1, 400, 64, 'SE JUEGA CON EL TECLADO', 16, QI),
        ui(27, 400, 446, 'JUGADOR DEL LADO DERECHO (ESPEJO)', 14, QD), ui(28, 400, 472, MIR, 16, QI), ui(30, 400, 572, 'EN MENÚS: ENTER O U CONFIRMAN', 14, QD);
      else ui(16, 400, 578, pg < 2 ? '● ○ ○' : '○ ○ ●', 14, QD);
      if (pg > 2) ui(0, 400, 24, 'NIVEL 1 · SHENZHEN', 22, '#fff', .5, R), ui(1, 88, 450, RN[1], 14, RC[1], 0), ui(2, 88, 468, 'ASÍ SE VE ADENTRO.\n¿VENÍS O NO?', 16, '#fff', 0);
      ui(e, 400, pg == 2 ? 534 : 540, 'APRETÁ ENTER', 24, QY, .5, Y); bk = e;
    }
  }
  // intro: personaje de cuerpo entero, cinta con el nombre y el texto a máquina (lo tipea update)
  if (s == 'intro') {
    drawBurst(0); dim(ip > 2 ? 1 : 2);
    ip - 1 && ip < 3 && tint(ab(ip ? 0x001040 : 0x200010), ip ? .35 : .2);
    pnl(16, 172, 368, 100, 1);
    if (ip == 2) blo(62, 252, 108, 2), blo(63, 316, 108, 2), blo(61, 150, 108, 2);
    if (ip > 2) blo(35, 300, 40, 1), blo(35, 330, 70, 1), blo(42, 280, 90, 1);
    blo([57, 58, 59, 54][ip], 22, 44, 4); rib(150, 165, 92, 14);
    ui(0, 392, 331, RN[[4, 3, 1, 0][ip]], 18, '#fff', .5, R); ui(1, 56, 376, '', 20, '#fff', 0);
    ui(2, 760, 16, ip + 1 + '/4', 16, QD, 1); ui(3, 752, 506, (ip > 2 ? 'U: EMPEZAR' : 'U: SEGUIR') + ' · ENTER: SALTEAR', 14, QD, 1);
    ip || ui(4, 560, 120, 'DESPEDIDO', 48, '#ff3b3b', .5, '#3a0000').setAngle(-12);
    ip == 2 && (ui(4, 560, 80, '3:00 AM', 48, QN, .5, '#0a2000'), ui(5, 560, 140, '1 LLAMADA ENTRANTE', 16, QI));
    tc = 0;
  }
  // juego: cartel de nivel (visible con T < 2,5), aviso de inactividad y nombre del jefe (visibles según update)
  if (s == 'playing') ui(0, 400, 186, 'NIVEL ' + (L + 1), 22, QY, .5, Y), ui(1, 400, 236, NAMES[L], 28, '#fff', .5, R), ui(4, 400, 292, `RECUPERÁ ${CN} CHIPS`, 16, QN),
    ui(2, 400, 362, '¿SEGUÍS AHÍ?', 28, QY, .5, Y).setVisible(0), ui(5, 400, 404, '', 14).setVisible(0), ui(3, 400, 14, 'COMPLIANCE-9000', 14, '#ff8a7a').setVisible(0);
  if (s == 'paused') {
    render(); dim(2); kb(2); hM.setVisible(0); hN.setVisible(0); hR.setVisible(0);
    ui(0, 400, 14, 'PAUSA', 44, QY, .5, Y); ui(1, 400, 66, `NIVEL ${L + 1} · CHIPS ${CT + CL}/12 · VIDAS ${lives}`, 16, QI);
    ui(29, 400, 438, 'ENTER: SEGUIR', 24, QN, .5, Y); ui(28, 400, 482, 'ESPEJO: ' + MIR, 14, QD); bk = 29;
  }
  // fin de nivel: estadísticas a la izquierda; a la derecha el auto con quien espera y lo que dice
  if (s == 'levelEnd') {
    render(); dim(2); tint(ab(0x0a2a78), .25); pnl(16, 52, 216, 176, 1);
    for (let y = 236; y < 300; y++) fr(240, y, 160, 1, mix(-13950436, -16777216, min(1, (y - 236) / 40)));
    fr(240, 236, 160, 1, XG); blit(62, 232, 172, 2); blit(63, 296, 172, 2); blo(RP[L + 2], 338, 172, 2); pnl(244, 60, 148, 54, 2);
    for (let i = 0; i < 8; i++) fr(350, 113 + i, 12 - i, 1, -15463158), fr(349, 113 + i, 1, 1, -6911363);
    ui(0, 400, 20, `NIVEL ${L + 1} COMPLETO`, 40, QY, .5, Y); ui(1, 400, 72, NAMES[L], 18, QN);
    LE = [['BAJAS', LS.k], ['PRECISIÓN', LB[0] / 20 | 0, '%'], ['TIEMPO', LS.t | 0, 's'], ['BONUS PRECISIÓN', LB[0]], ['BONUS TIEMPO', LB[1]], ['BONUS SALUD', LB[2]], ['PUNTAJE', SC]];
    for (let k = 0; k < 7; k++) ui(2 + k, 52, 126 + k * 48, '', k > 5 ? 24 : 20, k > 5 ? QY : '#fff', 0);
    ui(10, 500, 128, RN[L + 2], 14, RC[L + 2], 0); ui(11, 500, 152, LW[L], 16, '#fff', 0);
  }
  // victoria: 0 escena final (la dibuja fin() en cada frame), 1 puntaje, 2 no entraste al top 5 (compartida con game over)
  if (s == 'victory' && !pg) ui(3, 400, 16, 'OFICINA DEL CEO · PISO 42 · 8:59 AM', 16), ui(0, 400, 20, 'VOLVISTE A SER EL CEO', 28, QY, .5, Y),
    ui(1, 400, 18, 'ACTA DEL DIRECTORIO · SESIÓN DE URGENCIA', 16, '#000'), ui(2, 84, 54, ACTA, 17, '#fff', 0), ui(9, 400, 564, 'ENTER: SEGUIR', 22, QY, .5, Y), fin();
  if (s == 'victory' && pg == 1) drawEnding(6.3), dim(1), pnl(60, 40, 280, 150, 2), ui(0, 400, 100, '¡RECUPERASTE LOS 12 CHIPS!', 28, QY, .5, Y), ui(1, 400, 170, 'PUNTAJE FINAL', 20, QD), ui(2, 400, 200, '' + SC, 56),
    ui(3, 400, 290, `BAJAS ${TOT.k} · PRECISIÓN ${TOT.s ? TOT.h * 100 / TOT.s | 0 : 0}% · TIEMPO ${TOT.t / 60 | 0}:${String(TOT.t % 60 | 0).padStart(2, '0')}`, 16, QN), ui(4, 400, 330, `CHIPS 12/12 · VIDAS ${lives}`, 16, QI);
  if (pg > 1 && vg) drawBurst(0), dim(1), pnl(90, 70, 220, 150, 2), ui(0, 400, 30, 'NO ENTRASTE AL TOP 5', 36, '#ff3b3b', .5, '#3a0000'), rk(1, 168, 30, 54), ui(7, 400, 470, 'TU PUNTAJE ' + SC, 24, QY, .5, Y);
  if (s == 'gameover' && !pg) {
    render(); tint(ab(0x800000), .3); dim(1); word('GAME', 64, 26, 5, GV); word('OVER', 214, 26, 5, GV); pnl(30, 96, 340, 92, 2); blo(57, 36, 120, 2);
    ui(1, 220, 206, RN[4], 14, RC[4], 0); ui(2, 220, 232, GO[Math.random() * 3 | 0], 20, '#fff', 0); ui(3, 220, 300, `CHIPS ${CT + CL}/12 · PUNTAJE ${SC}`, 18, QY, 0);
  }
  if (s == 'levelEnd' || vg && (pg || s < 'h')) ui(9, 400, 540, 'ENTER: SEGUIR', 22, QY, .5, Y), bk = 9;
  if (s == 'nameEntry') {
    drawBurst(0);
    if (pg) dim(1), pnl(90, 70, 220, 150, 2), hi < 0 || fr(96, 84 + hi * 27, 208, 20, XG), ui(0, 400, 44, 'RANKING', 44, QY, .5, Y), rk(1, 168, 30, 54, hi), ui(6, 400, 500, '¡NOS VEMOS EN LA PRÓXIMA KEYNOTE!', 20, QN);
    else {
      dim(2); blo(61, 336, 236, 2); BG.set(B);
      ui(0, 400, 28, '¡ENTRASTE AL TOP 5!', 36, QY, .5, Y); ui(1, 400, 80, 'PUNTAJE ' + SC, 22); ui(2, 400, 124, '', 52, QN);
      for (let k = 0; k < 30; k++) ui(3 + k, k > 27 ? 310 + k % 7 * 180 : 184 + k % 7 * 72, gY(k), GR[k / 7 | 0][k % 7], k > 27 ? 22 : 28);
      ui(33, 400, 540, 'W A S D: MOVER · U: ELEGIR · END: LISTO', 16, QI); gd();
    }
  }
  s != 'playing' && put();
}
// Grilla de iniciales: keycaps en el buffer (la elegida, verde y apretada) sobre el fondo guardado en BG.
function gd() {
  B.set(BG);
  for (let k = 0; k < 30; k++) { const c = gy * 7 + gx == k; k > 27 ? key(130 + k % 7 * 90, 233, 50, 22, c ? 0x76b900 : k > 28 ? 0x2a4a10 : 0x5a2a2a, c) : key(77 + k % 7 * 36, 121 + (k / 7 | 0) * 28, 30, 22, c ? 0x76b900 : 0x2a3240, c) }
  // solo se re-pintan las dos letras que cambian (setColor re-renderiza el texto)
  U[3 + gp].setColor('#fff').setStroke('#000', 4).y = gY(gp);
  const t = U[3 + (gp = gy * 7 + gx)].setColor('#000').setStroke('#000', 0); t.y = gY(gp) + 4;
  st(U[2], (NM + '___').slice(0, 3).split('').join(' '));
  put();
}
const act = () => {
  const c = GR[gy][gx];
  fx('ok');
  if (c == 'END') return keep(NM || 'JEN'), pg = 1, scr(), cd = 300;
  NM = c == 'DEL' ? NM.slice(0, -1) : NM.slice(0, 2) + c;
  if (NM.length > 2 && c != 'DEL') gy = 4, gx = 1;
  gd();
};
// Cámara automática del título: camina por el nivel 1 hacia celdas al azar siguiendo el BFS.
function cam(h) {
  const i = floor(PL.y) * W + floor(PL.x);
  if ((cs += h) > 3) { if (hypot(PL.x - cx0, PL.y - cy0) < .3) FF[i] = 0; cx0 = PL.x; cy0 = PL.y; cs = 0 }
  if (!(FF[i] > 0)) {
    let j;
    do j = Math.random() * W * HH | 0; while (MAP[j]);
    const x = PL.x, y = PL.y;
    PL.x = j % W + .5; PL.y = (j / W | 0) + .5; flow(); PL.x = x; PL.y = y;
  }
  let b = FF[i], n = i;
  for (const o of NB) { const v = FF[i + o]; if (v >= 0 && v < b) b = v, n = i + o }
  const r = nrm(atan2((n / W | 0) + .5 - PL.y, n % W + .5 - PL.x) - pa);
  pa = nrm(pa + max(-2, min(2, r * 3)) * h);
  if (abs(r) < .7) mv(PL, cos(pa) * h * 1.5, sin(pa) * h * 1.5, .25);
  doors(h);
}

// ---------- estados ----------
// go(s) es la única forma de cambiar de estado: cooldown de 300 ms, resetea inactividad y timers de game feel.
// Pausar y reanudar no tocan la escena (sacudida, flashes, indicador, partículas siguen donde estaban).
// Al entrar a playing desde otra pantalla (no desde la pausa) con el disparo mantenido, hay que soltarlo y volver a apretar (nf).
function go(s) {
  const q = s == 'paused' || ST == 'paused' && s == 'playing';
  if (!q) shk = rf = pf = dI = hb = 0, PT.fill(0), nf = s == 'playing' && H[1] > 0;
  ST = s; cd = 300; idle = 0; pg = 0; IM.setPosition(400, 300);
  for (const t of HT) t.setVisible(s[0] == 'p');
  if (s == 'title') startLevel(0), cs = 0;
  if (s == 'intro') ip = ic = 0;
  if (s == 'nameEntry') NM = '', gx = gy = gl = 0, hi = -1;
  scr();
}
function update(_, d) {
  try {
    d = d > 0 ? min(d, 50) : 16;
    const dt = d / 1000;
    STT += dt; idle += dt; RT += dt;
    if (cd > 0) { cd -= d; for (const k in P) P[k] = 0 }
    const a = P[1] || P[2] || P[3] || P[4] || P[5] || P[6] || P.S, j = P.U || P.D || P.L || P.R;
    bk < 0 || U[bk].setVisible(STT % 1 < .65);
    if (ST == 'loading') (rl || STT > 1.5) && go('title');
    else if (ST == 'title') {
      // Modo atracción: tras 20 s sin input rota ranking / controles / recorrido cada 8 s.
      if (pg) { if (a || j) pg = 0, scr(), cd = 300; else if (STT > 8) pg = pg % 3 + 1, scr() }
      else if (a) go('intro'), fx('ok');
      else if (idle > 20) pg = 1, scr();
      if (ST == 'title') {
        // controles: cada 0,7 s se "aprieta" otra tecla (solo se redibujan las teclas sobre el fondo guardado)
        if (pg == 2) { const q = STT / .7 % 11 | 0; q != kq && (kq = q, B.set(BG), kb(2, q, 1), put()) }
        if (pg > 2) cam(dt), render(), rib(80, 10, 240, 16), pnl(4, 222, 166, 36, 2), fr(6, 224, 32, 32, -14542316), blit(60, 6, 224, 1), put();
      }
    }
    else if (ST == 'intro') {
      if (P.S) go0();
      else if (a || ic > IN[ip].length + 160) { if (ic < IN[ip].length) ic = IN[ip].length; else if (++ip > 3) go0(); else ic = 0, scr() }
      if (ST == 'intro') {
        const s = IN[ip], n = min(s.length, ic += dt * 32);
        if ((n | 0) > tc) tc = n | 0, s[tc - 1] > ' ' && tc & 1 && fx('ty');
        st(U[1], s.slice(0, n) + (n < s.length || STT * 2 & 1 ? '_' : ''));
      }
    }
    else if (ST == 'playing') {
      for (const k in H) if (H[k] > 0) idle = 0;
      if (P.S) go('paused');
      else if (idle > 60) go('title');
      else {
        // Sub-pasos de ≤17 ms: con delta clampeado a 50 ms nadie atraviesa paredes ni puertas.
        const n = ceil(dt / .017), h = dt / n;
        for (let i = 0; i < n && ST == 'playing'; i++) tick(h);
        if (ST == 'playing' && hp <= 0) die();
        if (ST == 'playing') {
          const c = T < 2.5, v = idle > 50;
          feel(dt); render(); hud();
          v && (pnl(110, 176, 180, 42, 1), hv(9, 61 - idle | 0) && U[5].setText('TOCÁ CUALQUIER TECLA · TÍTULO EN ' + (61 - idle | 0)));
          put();
          U[0].setVisible(c); U[1].setVisible(c); U[4].setVisible(c); U[2].setVisible(v); U[5].setVisible(v); U[3].setVisible(boss && boss.s && boss.s < 5);
        }
      }
    }
    else if (ST == 'paused') P.S ? go('playing') : idle > 60 && go('title');
    else if (ST == 'levelEnd') {
      // Primer botón completa el conteo; el segundo sigue.
      if (a) { if (STT < 3) STT = 3; else if (L < 2) startLevel(L + 1), go('playing'); else go('victory') }
      if (ST == 'levelEnd') for (let k = 0; k < 7; k++) {
        const e = LE[k], q = min(1, max(0, STT * 2.5 - k)), v = e[1] * q | 0;
        q > 0 && q < 1 && fx('ty');
        e[3] !== v && U[2 + k].setText(e[0].padEnd(16) + String(e[3] = v).padStart(6) + (e[2] || ' '));
      }
    }
    else if (ST == 'victory' || ST == 'gameover') {
      // victoria: escena (pg 0; un botón la adelanta al acta, otro sigue; sola a los 16 s) -> puntaje (pg 1) -> iniciales o pg 2
      if (a) { if (pg > 1) go('title'); else if (!pg && ST > 'h') STT < 6 ? (STT = 6, cd = 300) : (pg = 1, scr(), cd = 300); else if (ql()) go('nameEntry'); else pg = 2, scr(), cd = 300 }
      ST == 'victory' && !pg && (STT > 16 ? (pg = 1, scr()) : fin());
    }
    else if (ST == 'nameEntry') {
      if (pg) (a || STT > 8) && go('title');
      else {
        // W A S D con repetición: primer paso inmediato, después cada 130 ms tras 350 ms mantenida.
        const x = (H.R > 0) - (H.L > 0), y = (H.D > 0) - (H.U > 0), v = x * 3 + y;
        if (!v) gl = 0;
        else if (v != gl || (gr -= dt) <= 0) {
          gr = v != gl ? .35 : .13; gl = v;
          gy = (gy + y + 5) % 5; const l = GR[gy].length; gx = (min(gx, l - 1) + x + l) % l;
          fx('mv'); gd();
        }
        a && act();
      }
    }
    // Arcade público: nadie queda colgado en una pantalla final (las iniciales se guardan con lo que haya).
    if (idle > 30 && 'vgnl'.includes(ST[0])) { ST[0] == 'n' && !pg && keep(NM || 'JEN'); go('title') }
  } catch (e) {
    ERR++;
    try { go('title') } catch (_) {}
  }
  try { AC && mus() } catch (e) {}
  for (const k in P) P[k] = 0;
}
function create() {
  S = this;
  TX = S.textures.createCanvas('v', 400, 300); CX = TX.context; ID = CX.createImageData(400, 300); B = new Uint32Array(ID.data.buffer);
  TX.setFilter(Phaser.Textures.FilterMode.NEAREST);
  IM = S.add.image(400, 300, 'v').setScale(2);
  FC = new Uint32Array(300); FD = new Uint32Array(300); FL = new Uint32Array(300);
  const tx = (x, y, z, o, s = '', c = '#fff') => S.add.text(x, y, s, {fontFamily: 'monospace', fontStyle: 'bold', fontSize: z + 'px', color: c, stroke: '#000', strokeThickness: z < 15 ? 3 : 4}).setOrigin(o, 0);
  // HUD: puntaje arriba; en la barra inferior salud, arma y chips (etiqueta chica + valor); mensaje del sistema; radio (nombre + línea)
  hS = tx(12, 10, 18, 0); hL = tx(96, 530, 14, 0, 'SALUD', QD); hB = tx(96, 547, 26, 0); hX = tx(272, 530, 14, 0, '', QD); hW = tx(272, 547, 26, 0); hC = tx(484, 530, 14, 0, '', QD);
  hM = tx(400, 64, 20, .5); hN = tx(88, 450, 14, 0); hR = tx(88, 468, 16, 0).setWordWrapWidth(244);
  HT = [hS, hL, hB, hX, hW, hC, hM, hN, hR];
  for (let i = 0; i < 34; i++) U.push(tx(0, 0, 20, .5));
  art();
  // Audio: voces -> maestro moderado -> compresor -> salida. Sin contexto (o si algo tira) el juego sigue mudo.
  try {
    AC = S.sound.context;
    if (AC) {
      const c = AC.createDynamicsCompressor(), d = (NZ = AC.createBuffer(1, 88200, 44100)).getChannelData(0);
      MG = AC.createGain(); MU = AC.createGain(); MG.gain.value = .5; MU.gain.value = 0;
      MU.connect(MG); MG.connect(c); c.connect(AC.destination);
      // eco de la melodía: delay con realimentación
      const e = AC.createDelay(), f = AC.createGain();
      ME = AC.createGain(); ME.connect(MU); ME.connect(e); e.connect(f); f.connect(e); f.connect(MU); e.delayTime.value = .3; f.gain.value = .35;
      for (let i = 0; i < 88200; i++) d[i] = Math.random() * 2 - 1;
    }
  } catch (e) { AC = 0 }
  const KM = {};
  for (const c in CABINET_KEYS) for (const k of CABINET_KEYS[c]) KM[k.toLowerCase()] = c[0] == 'S' ? 'S' : c.slice(3);
  // Contamos teclas físicas: P1 y P2 son espejo y soltar una no suelta la otra. El código de arcade sale de e.key al
  // apretar, pero se suelta por e.code (la tecla física): con Shift el keyup de '2' llega como '@' y quedaría pegada.
  const kc = e => e.code || (e.key || '').toLowerCase();
  addEventListener('keydown', e => {
    const k = KM[(e.key || '').toLowerCase()], c = kc(e);
    if (!k) return;
    e.preventDefault(); idle = 0;
    try { AC && AC.state != 'running' && AC.resume().catch(n => n) } catch (_) {}
    if (e.repeat || KD[c]) return;
    KD[c] = k;
    if (!(H[k] > 0)) P[k] = 1;
    H[k] = (H[k] | 0) + 1;
  });
  addEventListener('keyup', e => {
    const c = kc(e), k = KD[c];
    if (k) e.preventDefault(), KD[c] = 0, H[k]--;
  });
  const clr = () => { KD = {}; H = {}; P = {}; if (ST == 'playing') go('paused') };
  addEventListener('blur', clr);
  document.addEventListener('visibilitychange', clr);
  ld();
  go('loading');
}
new Phaser.Game({type: Phaser.AUTO, width: 800, height: 600, parent: 'game-root', backgroundColor: '#000', scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH}, scene: {create, update}});
/*T*/
})();
