// BACK TO THE BOARD: The Return of the CEO. Shooter raycaster en primera persona para Platanus Hack 26.
// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u', ' '],
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
const {min, max, abs, floor, ceil, round, sin, cos, atan2, hypot, PI, random} = Math;
const TAU = PI * 2;
const [NK0, NK1, NK2, NK3, NK4, NK5, NK6, NK7, NK8, NK9, NK10] = [100, 1.5, -4144960, 255, 14200896, 16777215, 7780608, 200, 102400, 60200, 14673386];
const P12 = s => s.match(/.../g).map(h => (h = parseInt(h, 16), (h >> 8) * 17 << 16 | (h >> 4 & 15) * 17 << 8 | (h & 15) * 17));
const raw = String.raw;
const vis = (t, v) => t.setVisible(v), uv = (i, v) => U[i].setVisible(v);
const F32 = n => new Float32Array(n), U32 = n => new Uint32Array(n);

// ---------- datos ----------
// Mapas: # = + paredes (3 texturas del nivel), F bandera, N cartel NVIDIA, D puerta, K puerta con tarjeta, @ inicio (mirando al este),
// g guardia, d dron, r robot, B jefe, c chip, h botiquín, a munición, k tarjeta, s escopeta, X salida (auto), p quien espera al lado del auto.
const LV = [
  '#4F#2F#4 #@.1#.4g..c.# #.2D.9N F.2#..==.2d..# #.h..#..==.3g.# ##D#1D#2D#4 #.2#.2#.4# #c.g.D..r.D.1a..N N.2#.2#.1c..# #1D#2D#1D#3 #.6g.#.3# N.a..g.3D..X..# #c.7#..p..# #3F#4F#3',
  '#2F#4F#5 #@.1=.3d.3c# #.2D..==.1==.1N F.2=..==.g.==.r.# #.2=.9g# ##D=1D=6D#1 #.2=.5=s.1# #.k..D..g.d.gD..c.# #.h..=..=.=..=..a.N #..g.=.1c.1=.2# #1K#4N#2K#1 N.1g.1=..r.4# #c..a.1D.3X.1# #.1h.d.=.1c..p..# #2F#3N#2F#1',
  '+3F+6F+N+1 +@.1+.3r.1a+.a+ +.2D.8D..+ F.2+.1g..g.1+.dN +.h..+.7a+..+ ++D+2D+2N+2D++ +c.2+.8h.+ N..g..D.1d..r..d..+ +.2a+.3c.4+ +8F+N+2D++ +.9.5+ F.++.9.++.F +.6B.7+ +.9.5+ +.++.9.++.+ +h.5a.6h+ +3F+2N+1F+3',
].map(t => t.replace(/(\D)(\d)/g, (_, c, n) => c.repeat(+n + 2)));
const NAMES = raw`SHENZHEN · EL DEPÓSITO|SHANGHÁI · GRANJA DE GPUS|PEKÍN · EL NÚCLEO`.split`|`;
// pared, rack, acento, piso, techo
const PAL = [
  [0x6b6458, 0x4a5560, 0xd08020, 0x3a352e, 0x26221e],
  [0x3c4a66, 0x232b3b, 0x30d0ff, 0x1c2230, 0x0c1018],
  [0x5a2228, 0x2a1a20, 0xff3060, 0x24161a, 0x120a0c],
];
// vida, velocidad, escala, altura, rango, proyectil, telegrafiado, cadencia, daño, puntos, distancia, dolor, drop
const ET = [
  [30, 1.3, 1, 0, 9, 0, .45, 1.6, 10, NK0, 3.5, .7, .5],
  [14, 2.4, .55, .3, 1.7, 0, .35, 1, 5, 150, .9, .9, .2],
  [NK0, .9, 1.25, 0, 11, 1, .6, 2.4, 15, 300, 5, .25, .8],
  [380, 1.3, 1.9, 0, 14, 1, .6, .9, 9, 5000, 4, .08, 0],
];
// cadencia, daño, perdigones, dispersión, nombre
const WP = [[.36, 16, 1, .015, 'PISTOLA'], [.11, 11, 1, .035, 'RIFLE'], [.85, 9, 8, .11, 'ESCOPETA']];

// ---------- estado ----------
let S, TX, CX, ID, B, IM, HT, hS, hL, hB, hX, hW, hC, hM, hN, hR,
  ST = 'loading', STT = 0, cd = 0, idle = 0, ERR = 0, SEED = 1,
  H = {}, P = {}, KD = {},
  L = 0, W = 0, HH = 0, MAP, DO, DT, SEEN, FF, Q, NB, DL,
  pa = 0, tv = 0, td = 0, hp = NK0, lives = 3, wpn = 1, AM = [0, 0, 0], HW = [1, 1, 0], KC = 0, CL = 0, CN = 0, CT = 0, SC = 0, snap,
  T = 0, fcd = 0, rec = 0, fa = 0, bob = 0, mvd = 0, MSG = '', MT = 0, ft = 0, lt = 0, eo = 0, EX = 0, EY = 0, boss = null, won = 0,
  LS = {k: 0, s: 0, h: 0, t: 0}, TOT = {k: 0, s: 0, h: 0, t: 0}, LB = [0, 0, 0], MK = 0, HC = 0, HS = 0, HU = 0,
  // presentación: audio, pantallas, ranking, game feel
  AC, MG, MU, ME, NZ, NV = 0, RT = 0, mi = -1, mo = 0, nt = 0, sp = 0, pg = 0, bk = -1, ip = 0, ic = 0, tc = 0,
  RK = [], rl = 0, hi = -1, NM = '', gx = 0, gy = 0, gl = 0, gr = 0, gp = 0, LE = [], shk = 0, rf = 0, pf = 0, PCL = 0, dI = 0, dA = 0,
  rq = 0, rw = 0, jf = 0, jt = 0, kq = -1, hb = 0, rok = 0, hk = 0, nf = 0, cs = 0, cx0 = 0, cy0 = 0, pi = 0;
const BC = [-12570369, -14647041, -16776961], PL = {x: NK1, y: NK1}, EN = [], PK = [], PJ = [], RL = [], ALL = [EN, PK, PJ], ZB = F32(400);
for (let i = 0; i < 64; i++) EN.push({on: 0, g: 0}), PK.push({on: 0, g: 1}), i < 32 && PJ.push({on: 0, g: 2});

const rnd = () => (SEED = SEED * 16807 % 2147483647) / 2147483647;
const nrm = a => a - TAU * floor((a + PI) / TAU);
const rel = (x, y) => nrm(atan2(y - PL.y, x - PL.x) - pa);
// ---------- efectos: sonido, sacudida, flashes, partículas, frases ----------
// SFX: voces de 6 números [onda, f0, f1, duración, volumen, retardo]; onda 0 sine 1 square 2 saw 3 triangle 4 ruido filtrado (f = corte).
// Índice = posición del evento en EV; disparo de rifle/escopeta y muertes de dron/robot/jefe van al final.
const SX = "4N{'G$_U#1$}#U$,A# 4ey8}#U2# 1(P$_#j7# 2&>$@$_7# 2'G#`&qA#43O$,&>A# 1*c,u#t/#1,u/+#t/, 2%5+l&>2# 4C|)Y$@F# 0>N+l$_+# 2&>#t&><# 43O#t'GP# 2%I#t%5F#4+l%5$@<# 2'G#K-~K# 1)Y04#t2# 1,a,a$,5#1/w/w$,5-16B6B%557 1(P,u&>2#1,u(P&>2A1(P,u&>2`1,u(P&>2~ 1$_$@$_7#1$_$@$_75 4'G%5(P7# 4&>$,#`/# 1&>&>#K/#1(P(P#K/) 2#t#K+lU#4)Y$,+lK# 3'p'p$@7#3)+)+$@7/3*9*9&>7; 1(h(h$,5#1*9*9$,5-1+[+[$,571.Q.Q'G5A 1+l+l#A+# 1)Y04$,/# 12F2F#2(# 0#j#K$_K#0#j#K$_A5 4ey+l#~K#2$T#`#`<# 4>N$_&qj#1#~#A%hP# 104$,&><#4N{(P%5A# 404#`)Y`#2$@#A)YF# 4,u#K3Ot#2$,#<3OU#48}#`-~`A".split(' ').map(s => { const z = [], d = (i, n) => { let v = 0; for (let k = 0; k < n; k++) { const c = s.charCodeAt(i + k); v = v * 91 + c - 35 - (c > 92) } return v }; for (let i = 0; i < s.length; i += 9) z.push(+s[i], d(i + 1, 2), d(i + 3, 2), d(i + 5, 2) / 1000, d(i + 7, 1) / NK0, d(i + 8, 1) / NK0); return z });
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
const WV = ['sine', 'square', 'sawtooth', 'triangle'], MO = [0, 0, -24, 0, 12], MV = [0, 0, .3, .05, .05], LQ = F32(32).fill(-1);
// Una voz: oscilador (o ruido por un filtro) -> envolvente -> bus. Se desconecta sola al terminar.
function tn(w, f, e, d, v, t, o) {
  if (NV > 40 || AC.state != 'running') return;
  const s = w > 3 ? AC.createBufferSource() : AC.createOscillator(), g = AC.createGain(), q = w > 3 ? AC.createBiquadFilter() : s, p = q.frequency;
  if (w > 3) s.buffer = NZ, s.connect(q); else s.type = WV[w];
  p.setValueAtTime(f, t); p.exponentialRampToValueAtTime(e, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.001, t + d);
  q.connect(g); g.connect(o);
  s.onended = () => { s.disconnect(); q.disconnect(); g.disconnect(); NV-- };
  s.start(t, w > 3 ? random() * .4 : 0); s.stop(t + d + .02); NV++;
}
const sfx = (i, v) => { const z = SX[i], n = AC.currentTime; for (let k = 0; k < z.length; k += 6) tn(z[k], z[k + 1] * (.94 + random() * .12), z[k + 2], z[k + 3], z[k + 4] * v, n + z[k + 5], MG) };
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
      if (k < 5) tn(k == 3 ? 1 : 3, f, f, z[0] * (k == 3 ? NK1 : k == 2 ? 2 : 1), MV[k], nt, k == 3 ? ME : MU);
      else if (c == 10) tn(0, 150, 40, .15, .6, nt, MU);
      else tn(4, c > 10 ? 4e3 : 9e3, c > 10 ? 1e3 : 6e3, c > 10 ? .12 : .04, c > 10 ? .3 : .1, nt, MU);
    }
    nt += z[0]; sp++;
  }
}
// Partículas: pool circular fijo de 64 (posición en el mundo, z = altura 0..1).
const PX = F32(64), PY = F32(64), PZ = F32(64), VX = F32(64), VY = F32(64), VZ = F32(64), PT = F32(64), PQ = U32(64);
const prt = (x, y, z, n, c, s) => {
  while (n--) pi = pi + 1 & 63, PX[pi] = x, PY[pi] = y, PZ[pi] = z, VX[pi] = (random() - .5) * s, VY[pi] = (random() - .5) * s, VZ[pi] = random() * s, PT[pi] = .3 + random() * .5, PQ[pi] = n & 1 ? c : -12529409;
};
// ---------- textos ----------
// Elenco: nombre en pantalla y color de su etiqueta. Los cuatro últimos son provisorios: cambiarlos acá alcanza
// (todos los textos que los nombran usan esta tabla). Índices: 0 JENSEN, 1 RADIO, 2 GPU, 3 EL INVERSOR, 4 LA DIRECTORA.
const RN = raw`JENSEN|RADIO|GPU|EL INVERSOR|LA DIRECTORA`.split`|`, RC = ['#a6e22e', '#ff7ac0', '#ffd21a', '#7fb8ff', '#ff9a6a'];
// retrato de cada uno en la radio y en el fin de nivel (Jensen usa su cara del HUD)
const RP = [50, 60, 61, 58, 57];
// RADIO, uno por chip (el H-1000 siempre dice el último)
const RX = raw`¡PRIMER CHIP! FALTAN 11. SIN PRESIÓN.|ESE TIENE MÁS NÚCLEOS QUE TU AGENDA.|VAN 3. EL DIRECTORIO YA SUDA.|¡SHENZHEN LISTO! ${RN[2]} TE ESPERA EN EL AUTO.|CHIP 5. HUELE A SILICIO Y A VENGANZA.|ESE MINABA CRIPTO. PERDONALO.|VAN 7. LA ACCIÓN YA SUBIÓ 2%.|OCHO. EN CHINA YA LOS EXTRAÑAN.|¡SHANGHÁI LISTO! ${RN[3]} TE ESPERA.|DIEZ. EN EL DIRECTORIO YA TE DICEN JEFE.|ONCE. UNO MÁS Y VOLVÉS AL SILLÓN.|¡EL H-1000! VOLVÉ A CASA, JENSEN.`.split`|`;
// cambios de fase del jefe: el primero lo dice JENSEN, el segundo RADIO
const BQ = raw`¿ESO ES TODO? MI TOSTADORA RINDE MÁS.|¡SE LE RECALIENTA EL DISIPADOR! ¡DALE!`.split`|`;
// remates de JENSEN al bajar enemigos (a veces)
const KQ = raw`DESPIDO SIN PREAVISO.|RECORTE DE PERSONAL.|TE RECOMIENDO EN LINKEDIN.|REESTRUCTURACIÓN.|GARANTÍA VENCIDA.|PRODUCTO DISCONTINUADO.|OPTIMIZANDO COSTOS.|MENOS LATENCIA.|OVERCLOCK.|ESO FUE UN DOWNGRADE.`.split`|`;
// entrada a cada nivel (RADIO), tarjeta y escopeta (JENSEN)
const LQ2 = raw`SHENZHEN. 4 CHIPS. ENTRÁ SIN HACER RUIDO.|SHANGHÁI. 5 CHIPS Y PUERTAS CON TARJETA.|PEKÍN. EL H-1000 LO CUIDA UN MECH.|TARJETA. COMO EN LOS VIEJOS TIEMPOS.|ESCOPETA. ESTO SÍ ES UNA KEYNOTE.`.split`|`;
// Canal único de diálogo del HUD: retrato + nombre + línea (w = índice en RN, t = segundos en pantalla).
const rad = (w, s, t) => { rw = w; rq = t; hR.setText(s); hN.setText(RN[w]).setColor(RC[w]) };
// colores de pickup (k) y de restos por tipo de enemigo
const PFC = P12("fc44f6fd849ff83000fd8fc4"), KCO = P12("44689a873823");
// Punto único de efectos de la simulación (y de la UI). Nunca tira y no toca rnd(): el azar de presentación es Math.random.
// eventos (t): 0 shot, 1 wall, 2 hit, 3 pain, 4 kill, 5 alert, 6 tele, 7 eshot, 8 miss, 9 proj, 10 pexp, 11 hurt, 12 die,
// 13 pick, 14 chip, 15 alarm, 16 locked, 17 door, 18 step, 19 switch, 20 boss, 21 level, 22 win, 23 mv, 24 ok, 25 ty, 26 beat.
// Es también el índice del sonido en SX (los extras de disparo y muertes van del 27 en adelante).
function fx(t, a, b) {
  if (ST == 'title') return;
  try {
    let i = t, v = 1, x = -1, y = 0;
    if (t == 0 && a) i = 26 + a;
    if (t == 4) { if (a.t) i = 28 + a.t; prt(a.x, a.y, .4, a.t > 2 ? 48 : 14, ab(KCO[a.t]), a.t > 2 ? 4 : 2.5) }
    if (t == 1 || t == 10) {
      x = a; y = b;
      const l = hypot(PL.x - a, PL.y - b) || 1;
      if (t < 2) prt(a + (PL.x - a) / l * .08, b + (PL.y - b) / l * .08, .4 + random() * .2, 3, NK2, 1.2); else prt(a, b, .35, 16, -14647041, 2.5);
    } else if (a && a.x) x = a.x, y = a.y;
    if (t == 17) x = a % W + .5, y = (a / W | 0) + .5;
    if (x >= 0) v = 1 / (1 + hypot(x - PL.x, y - PL.y) * .3);
    // la cara del HUD: dolor un instante (salvo que esté festejando un chip), festejo al juntar chip
    if (t == 11) shk = min(.5, .15 + a * .015), rf = min(.45, .12 + a * .015), dA = pa + b, dI = 1, jt > 0 && jf > 2 || (jf = 1, jt = .45);
    if (t == 12) rf = .8;
    // patada de cámara por disparo y marca de acierto en la mira (más grande y roja si fue baja)
    if (t == 0) shk = max(shk, a > 1 ? .1 : .04);
    if (t == 2 || t == 4) gph = t > 3 ? .3 : max(gph, .12);
    if (t == 13) pf = .25, PCL = ab(PFC[a] | 0);
    if (t == 14) rad(1, RX[b ? 11 : a - 1 - hk], 3.5), hk |= !!b, jf = 3, jt = 1.6;
    if (t == 4 && rq < 0 && random() < .3) rad(0, KQ[random() * 10 | 0], 2.5);
    if (t == 13 && (a == 3 || a == 4)) rad(0, LQ2[a], 3);
    if (t == 20) rad(a - 1 & 1, BQ[a - 1 & 1], 3), shk = .4;
    if (t == 21) shk = dI = pf = jt = 0, PT.fill(0), rad(1, LQ2[a], 4);
    // Throttle por tipo: la escopeta tira 8 perdigones pero suena un solo impacto.
    if (AC && i >= 0 && RT - LQ[i] > .04 && v > .05) LQ[i] = RT, sfx(i, v);
  } catch (e) {}
}
const say = (s, t) => { MSG = s; MT = t || 2 };

// ---------- arte procedural (32x32, 16 sombras precalculadas por imagen) ----------
const G = U32(1024), IMG = U32(69 << 14);
const ab = c => 0xff000000 | (c & NK3) << 16 | c & 0xff00 | c >> 16 & NK3;
const mul = (c, f) => min(NK3, (c >> 16) * f) << 16 | min(NK3, (c >> 8 & NK3) * f) << 8 | min(NK3, (c & NK3) * f);
const R = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < 32 && j >= 0 && j < 32) G[j * 32 + i] = ab(c) };
const El = (x, y, a, b, c) => { for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) if ((i + .5 - x) ** 2 / a / a + (j + .5 - y) ** 2 / b / b < 1) G[j * 32 + i] = ab(c) };
// Sombras 1-15 a partir de la 0: se apagan y se funden con la niebla del nivel (gxN, RGB). Los colores
// brillantes y saturados (LEDs, visores, fogonazos) casi no se apagan: se ven en la oscuridad.
let gxN = 0;
const gxH = id => {
  for (let p = 0; p < 1024; p++) {
    const c = IMG[id << 14 | p], r = c & NK3, g = c >> 8 & NK3, b = c >> 16 & NK3, M = max(r, g, b), e = M > 210 && M - min(r, g, b) > 130;
    if (c) for (let s = 1; s < 16; s++) {
      const a = (s / 16) ** NK1 * (e ? .3 : 1), k = (e ? 1 : 1 - s * .03) * (1 - a);
      IMG[(id * 16 + s) << 10 | p] = 0xff000000 | b * k + (gxN & NK3) * a << 16 | g * k + (gxN >> 8 & NK3) * a << 8 | r * k + (gxN >> 16) * a;
    }
  }
};
const sv = id => { IMG.set(G, id << 14); gxH(id); G.fill(0) };
// 35 chip, 36 botiquín, 37 munición, 38 tarjeta, 39 escopeta, 40 (vacío), 41 cargador, 42 H-1000,
// 43 (vacío), 44-45 proyectiles, 46-48 armas para el HUD (49 ya no se usa: el fogonazo es gxM)
const MISC = [
  () => CH(0),
  () => { R(8, 14, 16, 12, 0xeeeeee); R(14, 16, 4, 8, 0xe02020); R(12, 18, 8, 4, 0xe02020) },
  () => { R(8, 18, 16, 10, 0x5a5a2a); for (let i = 0; i < 4; i++) R(9 + i * 4, 12, 2, 6, NK4) },
  () => { R(9, 14, 14, 10, 0x2f6fff); R(9, 16, 14, 2, 0x111111); R(11, 19, 4, 3, NK4) },
  () => { R(3, 18, 26, 3, 0x404048); R(3, 21, 26, 2, 0x303038); R(18, 20, 11, 5, 0x6a4020) },
  () => 0,
  () => { R(12, 22, 8, 8, 0x5a5a2a); R(13, 18, 2, 4, NK4); R(17, 18, 2, 4, NK4) },
  () => CH(1),
  () => 0,
  () => { El(16, 16, 6, 6, 0xff8000); El(16, 16, 3, 3, 0xffff80) },
  () => { El(16, 16, 7, 7, 0xff2080); El(16, 16, 4, 4, NK5) },
  () => gxI(0),
  () => gxI(1),
  () => gxI(2),
];
// ---------- arte del rediseño (generado por build.js desde src.js) ----------
// Paleta de 12 bits. Cada figura es un string de 5 chars (x, y, w, h, color) con offset 48:
// color < 45 es R(x,y,w,h); si no, El(x/2, y/2, w/2, h/2) con el color - 45.
const AP = P12("da7fcbccc223111fc7311832da4fd9a627b0ccd6123338dfb75899eef445acd722843fffe89b57fbcc94224346b53360d21a10fd0889357401556e67753112642");
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
  for (let i = 0; i < 4; i++) R(8 + i * 4, 7, 2, 2, NK4), R(8 + i * 4, 25, 2, 2, NK4);
  AD(";<::;NR96aOR64h?@224");
  if (k) R(3, 3, 1, 5, NK5), R(1, 5, 5, 1, NK5), R(27, 25, 1, 3, NK5), R(26, 26, 3, 1, NK5);
};
// bandera china colgada sobre la pared de base b (id de IMG), queda en el id 64 (FL ya es el color del techo)
const FG = b => { G.set(IMG.subarray(b << 14, (b << 14) + 1024)); AD("33J1V22138M213844HAP4DH1QC41@QI41@Q8612R5871R6951R7:31R6;21R9;21R6<11R:<11R=522R@722R@:22R=<22R"); sv(64) };
// 50-53 retrato de Jensen (normal, dolorido, salud baja, festejo), 54 Jensen con rifle, 55 sentado de frente,
// 56 sillón de espaldas, 57 directora, 58 inversor, 59 radio, 60 retrato de radio, 61 GPU, 62-63 auto, 64 bandera, 65 cartel NVIDIA
function NA() {
  const NAh = "P696_P<77]<2142C2142>141B=5614=521DA521D?821@?921@", NAs = () => { AD("77B?=P>B6j99>1U9=>1U8E@3U9M>2V"); AD("4B63U?H25V", 1) };
  ["<=124C=124:;51AA;51A=C61F<B11FCB11F", ":>414B>414::21A<;31AD:21AA;31A<B83E=B61G=D61G", ";>214C>214:<51AA<51A>C42EE614PD912P8A12DC@32@", ":>114;=214=>114B>114C=214E>114::51AA:51A;B:3E<B81G>D41W"].forEach((s, i) => { AD("PnN@`<H884=D65@PBA?_PK>A]P=?9_:514A<313AC313AE514A>241B=612AB612A?=214??23@"); AD("9H28C:E3434J41C8=24@882529<644:=42D", 1); AD(s); sv(50 + i) });
  AD("::<33;=:83?:254=:17CB:17C9;263E;263;E48YAE48Y:M534AM534;D:14?D21<6?53>;>=3>H>71VAA23>><52V:@220E>220"); AD(NAh); sv(54);
  NAs(); AD(":=<93?=244==16CB=16C;F:3Y;I44YAI44Y:M524AM524"); AD("8>3636C320", 1); AD(NAh, 0, 0, 4); sv(55);
  AD(NAh, 0, 0, 4); NAs(); sv(56);
  AD("P9;9b:6245D6245P<77^=2625<3225<221KA121KD412K:712K=5614=521DA521D?821E?9211;::2H<<87H:;23HD;23H:=<31;?:1@;C:4H:G<4H9K>4H<O314AO314;811GD811G"); lace(); sv(57);
  AD("P686cP<77]<1826<2136C2136A131>>5114A5114=4216A4216?831EB711E?921@9:>3L:=<8L>:44G=:14MB:14M9>>3M:?210D?210;E48LAE48L:M524AM524"); sv(58);
  AD("N8:8d:53;7B5287N<78^<2627;3237;619N=5214@5214>731G?811E>:221;;811;<87H:C:4H9G<4H8K>4H<O314@O3149<261:A221C;221D6261D:21GE1364F0124F311;D5221"); lace(); sv(59);
  AD("PLDJdPJ>A^P<?7d962:7E62:7;<314B<314;:317B:317:?21JD?21J=A63E=A61G>C41W?>21I=E6416ID7H;I:216D487FD4878A12GI9494K4154J;21;G?541"); lace(); sv(60);
  AD("FI738P^>@eP^8<fPD<;ePJ65f?<214??22W:6<2X;@:2;=B62;?D21;?@21O"); AD("CJ59g=:114K>43l;M439", 1); sv(61);
  for (const o of [0, 32]) AD("M2=3<K5=3<I8=3<O382TM583TK872TT932SA;N6SC<94TO<444U<84T3??2<1An8<1Gn2S1Hn2>3Dj1;1B32;lA33P_=<4<`>:1S8E=54[E=54Md;;aMd66iMd22k", 0, o), o && AD("Ud;;aUd66iUd22k"), sv(62 + o / 32);
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
  for (let y = 16; y < 150; y++) fr(14, y, 220, 1, mix(-13627384, -9952166, (y - 16) / 134));
  for (let x = 14, k = 0; x < 232; k++) {
    const w = 14 + k * 7 % 13, h = 30 + k * 37 % 70;
    fr(x, 150 - h, min(w, 234 - x), h, -14937584);
    for (let j = 154 - h; j < 146; j += 6) for (let i = x + 2; i < x + w - 3 && i < 231; i += 4) if ((i * 7 ^ j * 13) % 5 < 2) fr(i, j, 2, 3, ab(k % 4 ? 0xffd870 : NK6));
    x += w + 2;
  }
  for (let k = 0; k < 5; k++) fr(12 + k * 55, 12, 4, 140, -15725556);
  fr(12, 12, 224, 4, -15725556); fr(12, 150, 224, 4, -10992566);
  sb(65, 262, 24, 112, 112);
  const a = (t - 2.9) * 1.4, F = a > 1;
  if (t < 2.4) sb(56, 152, 108, 96, 96), sb(54, t * 103 - 96, 104 - abs(sin(t * 9)) * 4, 96, 96);
  else if (a < 1) { const c = cos(max(0, a) * PI), w = max(4, abs(c) * 96); sb(c > 0 ? 56 : 55, NK7 - w / 2, 108, w, 96); if (c > 0) fr(NK7 - w * .14 | 0, 111, w * .28 | 0, 8, -3619648), fr(203 - w * .14 | 0, 109, w * .28 - 6 | 0, 2, -3619648) }
  else sb(55, 152, 108, 96, 96);
  fr(108, 194, 184, 8, -13608310); fr(114, 202, 172, 48, -15455670); fr(114, 214, 172, 3, -16729738);
  const J = k => F ? abs(sin(t * 7 + k)) * 14 : 0;
  sb(57, -6, 214 - J(0), 84, 84); sb(58, 54, 214 - J(1), 84, 84); sb(61, 280, 236 - J(2), 64, 64); sb(59, 322, 214 - J(3), 84, 84);
  if (F) for (let k = 0; k < 60; k++) fr(k * 89 % 396, (k * 47 + a * 60) % 296 | 0, 2, 3, ab([NK6, 0xffde00, NK5, 0xff6090][k & 3]));
}
// fondo de rayos azules (tapa), t en segundos para que giren despacio
const drawBurst = t => {
  for (let p = 0; p < 12e4; p++) {
    const x = p % 400 - NK7, y = (p / 400 | 0) - 130;
    B[p] = mix(ab((atan2(y, x) * 4 / PI * 3 + t * .3 + 99 | 0) & 1 ? 0x1060c8 : 0x2a90f0), -1, max(0, .45 - hypot(x, y) / 600));
  }
};
function art() {
  SEED = 7;
  for (let l = 0; l < 3; l++) {
    const [a, b, c] = PAL[l], o = l * 3;
    for (let p = 0; p < 1024; p++) { const x = p & 31, y = p >> 5; G[p] = ab(mul(l || y < 20 ? a : 0x2f6a62, y % 8 == 7 || (x + (y >> 3 & 1) * 8) % 16 == 15 ? .5 : .8 + rnd() * .3)) }
    // el depósito (nivel 1): ladrillo con zócalo pintado de verde de galpón y filete naranja
    l || R(0, 18, 32, 1, c);
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
    for (let p = 864; p < 992; p++) if ((p + (p >> 5)) >> 1 & 1) G[p] = -14634784;
    if (d) R(0, 12, 32, 6, 0x2f6fff), R(6, 13, 4, 4, 0x9fdfff);
    sv(9 + d);
  }
  for (let t = 0; t < 4; t++) for (let f = 0; f < 6; f++) gxE(t, f), gxO(f == 4), sv(11 + t * 6 + f);
  MISC.forEach((f, i) => { f(); gxO(); sv(35 + i) });
  NA();
}
// Niebla y brillo de las juntas del piso por nivel. gxF: por fila de pantalla 4 niveles de luz (charco bajo
// las luces del techo) x 4 materiales (piso: baldosa, baldosa clara, junta; techo: placa, -, junta, luz).
// gxT: material y luz de cada punto de un bloque de 2x2 baldosas a 1/32 (piso en 0-4095, techo en 4096-8191): baldosas
// en damero con junta, charco de luz bajo cada panel del techo, que también ilumina el techo alrededor.
const gxV = [[0x1a1208, .1], [0x061428, .45], [0x1e0408, .6]], gxF = U32(4800), gxT = new Uint8Array(8192);
function gxLv(l) {
  const [, , c, f, e] = PAL[l], [n, j] = gxV[l];
  for (let p = 0; p < 4096; p++) {
    const a = p >> 6, b = p & 63, u = (a + 8 & 63) / 32 - 1, v = (b + 8 & 63) / 32 - 1, k = max(0, 3 - (u * u + v * v) * 6 | 0) * 4, g = !(a & 31) || !(b & 31);
    gxT[p] = k + (g ? 2 : (a ^ b) >> 5 & 1); gxT[p + 4096] = k + ((a & 48) == 16 && (b & 48) == 16 ? 3 : g * 2);
  }
  if (n != gxN) { gxN = n; for (let i = 0; i < IMG.length >> 14; i++) gxH(i) }
  for (let y = 0; y < 300; y++) {
    const s = min(15, 210 / abs(y - 149.5)), a = (s / 16) ** NK1, K = 1 - s * .03, C = y < 150;
    for (let k = 0; k < 16; k++) {
      const m = k & 3, q = k >> 2, b = C ? m > 2 ? mix(c, -1, .5) : mul(e, m > 1 ? .6 : 1) : m > 1 ? mix(mul(f, .5), c, j) : mul(f, m ? 1.3 : 1);
      gxF[y * 16 + k] = ab(mix(mul(b & NK5, K * (1 + q * .2)), n, C && m > 2 ? a * .3 : a));
    }
  }
}
// Armas en primera persona con las manos y mangas de cuero de Jensen, dibujadas directo en el buffer: entran desde la
// esquina inferior derecha en tres cuartos y apuntan a la mira (strings de tests/gxbuild.js). l = luz del fogonazo.
const gxQ = P12("11133345689a222222667da7a75742521da47b0f222348dfa22ffff92fd723445768a5eff331126679abea2c82f80822c34f36411334");
const gxWS = ["QVUjHPHDNRV@HFAHZUDREFMSS46<ZN]P8<HCEEF46HLLSO460", "~i~xlxHhcewHPEbX~jXl\\e]zh8<0NNcXHTYQPTQ450VSYT450[U^W560MQa[46<JLMM>@1AGNN7:1?FAG781LINJ67H~]~a@FEiQ|[DLHiQjR>@>{Z|[:<=", "~i~wlxMgZ~i\\lEialc9:@ncqe:;@sfvg:;@>If]9@2>DjZ:D1KO`YLXMJQ^[45:LN`X45:", "X`zyPl]S]YcJP7M[RZ:<7M_R]:<7MbR`:<8PVUX8:7", "W_O~Rl]U[Z]HJ7RYTS9:7UYWS9:7XZZT9:8ua|cFJ7|f~}\\l]", "T^M~Rl]RZW\\HJ7PXRS9:7SYTS9:7VYWS9:8ua|cFJ7|f~}\\l]"];
// boca del cañón de cada arma (x, y relativos al arma) y radio del fogonazo; arma dibujada y cuándo cambió (baja y sube)
const gxZ = [50, 72, 13, 44, 66, 15, 40, 62, 21];
let gxw = -1, gxc = 0;
const gxC = (s, i) => s.charCodeAt(i) - 48;
// fogonazo de rayos que giran: blanco al centro, amarillo, naranja afuera
const gxM = (x, y, r) => {
  for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) {
    const d = hypot(k, j * 1.4) / r / (.4 + .6 * abs(sin(atan2(j, k) * 3 + T * 40))), P = x + k, Q = y + j, i = Q * 400 + P;
    if (d < 1 && P >= 0 && P < 400 && Q >= 0) B[i] = mix(B[i], d < .3 ? -1 : d < .6 ? -9379585 : -14642945, 1 - d * d * .7);
  }
};
// Pieza de 7 chars: cápsula cónica de (x,y) (punta) a (w,h) (atrás) en unidades de S px, radios a y b en S/6 px
// (perspectiva: lo cercano es más grueso), color c % 20 y estilo c / 20: 0 cilindro, 1 caras planas (arriba clara,
// costado medio, abajo oscura), 2 cuero con brillo. Contorno = el mismo color muy oscuro.
// El arma se rasteriza una vez por arma (gxR) en una grilla relativa: color base, factor de luz y contorno por
// píxel, gana la última pieza (gxW no mezcla con lo que había). Por frame gxB solo la copia con su
// desplazamiento y la luz del fogonazo: mismo resultado que dibujarla entera, sin hypot por píxel.
// Las piezas caen en 0..319 de la grilla (chequeado con las 6 de gxWS en tests/gxbuild.js).
const gxT2 = new Uint8Array(NK8), gxCC = new Int32Array(NK8), gxFF = new Float64Array(NK8), gxDD = new Int32Array(NK8), gxL = new Int32Array(NK8);
let gxN2 = 0, gxK = -1;
const gxR = (s, S) => {
  for (let i = 0; i < s.length; i += 7) {
    const x = gxC(s, i) * S, y = gxC(s, i + 1) * S, w = gxC(s, i + 2) * S, h = gxC(s, i + 3) * S, a = gxC(s, i + 4) * S / 6, b = gxC(s, i + 5) * S / 6,
      c = gxC(s, i + 6), C = gxQ[c % 20], k = c / 20 | 0, dx = w - x, dy = h - y, n = hypot(dx, dy) || 1, o = ab(mul(C, .3)), M = max(a, b) + 1;
    for (let Q = min(y, h) - M | 0; Q <= max(y, h) + M; Q++) for (let P = min(x, w) - M | 0; P <= max(x, w) + M; P++) {
      const m = max(0, min(1, ((P - x) * dx + (Q - y) * dy) / n / n)), r = a + (b - a) * m, t = ((P - x) * dy - (Q - y) * dx) / n / r, g = Q * 320 + P;
      if (hypot(P - x - m * dx, Q - y - m * dy) < r) hypot(P - x - m * dx, Q - y - m * dy) < r - 1.2 ? (gxT2[g] = 1, gxCC[g] = C, gxFF[g] = k > 1 ? abs(t - .5) < .12 ? 2.6 : NK1 - abs(t - .3) : k ? t > .4 ? 1.6 : t > -.55 ? .9 : .5 : 1.25 - abs(t - .35) * .6, gxDD[g] = ab(mul(C, gxFF[g]))) : (gxT2[g] = 2, gxCC[g] = o);
    }
  }
};
// arma del juego (w) o, con S = 1, el ícono: rasteriza y arma la lista de píxeles ocupados
const gxP = (s, S) => { gxT2.fill(0); for (const x of s) gxR(x, S); gxN2 = 0; for (let g = 0; g < NK8; g++) if (gxT2[g]) gxL[gxN2++] = g };
const gxB = (X, Y, l) => {
  for (let j = 0; j < gxN2; j++) {
    const g = gxL[j], P = g % 320, Q = g / 320 | 0;
    if (Y + Q < 262 && X + P >= 0 && X + P < 400) B[(Y + Q) * 400 + X + P] = gxT2[g] > 1 ? gxCC[g] : l == 1 ? gxDD[g] : ab(mul(gxCC[g], l * gxFF[g]));
  }
};
// ícono del arma para el HUD (ids 46-48): el arma (sin brazos) a 1/6 en una caja de 32x32
const gxI = w => { B.fill(0); gxP([gxWS[w]], 1); gxB(0, 0, 1); for (let p = 0; p < 1024; p++) G[p] = ~p & 31 && B[(p >> 5) * 800 + (p & 31) * 2 + 6011] };

// Enemigos (32x32): 6 piezas por tipo (tests/gxbuild.js): piernas, cuerpo, brazos, apuntando, fogonazo y muerto;
// al caminar (cuadro 1) la pierna espejada sube 2 px. Rect (x, y, w, h, color < 40) o elipse en medios píxeles (color - 40). Mismos cuadros e ids de siempre.
const gxES = [";F48I:M534;H42E", "9<>;D;=:7EBK65n:E<2IB>22LP?<<mN;64n;7:3I<881G", "6>48DF>48D8BA21E?261", "<881H7>46DE>46D:?<4DPR77YPR33q", "PR==kPR66i", "4KD4D7J<2E1L434dh97mHK41G", "4:61K>@<2r", "6924JPPF=rPJ>6s8C@1L@415K@311=PR99q", "PR66oNP22i", "PR66pNP22i", "?F33?=I33??L34A", "PjD6{Ng<4r7J52KRh32z", "7E68S9F26K5L:4I", "<286J=462I>441H57F?M68D2L:;<5I;<:1S;>:1S5CF3I7C23L<C23L185=J2D33S", "I96>JhZ55q", "I96>JhZ66vhZ33k>441N", "hZ<<khZ66i", "3HJ8M3HJ2L6E:3SDF62J^d43p", "6D69S4L:4I7F42O", "46H?O67D3P9B>3RPL;;qPL88yNJ33i0378R1422=4422=<086I=262H", "0;5;SK;5;S1D32ILD32I", "0;5;SK;5;S5Z55vkZ55vPL66i=262N", "5Z::kkZ::k5Z55ikZ55i", "1GN9R1GN2O5B>6OFD84S\\d75y"];
// m: también espejado (piernas y cuerpo se escriben solo de un lado), corrido q en y
const gxA = (s, m = 0, q = 0) => { for (let i = 0; i < s.length; i += 5) for (let k = 0; k <= m; k++) { const x = gxC(s, i), y = gxC(s, i + 1), w = gxC(s, i + 2), h = gxC(s, i + 3), c = gxC(s, i + 4); c < 40 ? R(k ? 32 - x - w : x, y + k * q, w, h, gxQ[c]) : El((k ? 64 - x : x) / 2, y / 2 + k * q, w / 2, h / 2, gxQ[c - 40]) } };
const gxE = (t, f) => { const s = (k, m, q) => gxA(gxES[t * 6 + k], m, q); if (f > 4) s(5); else s(0, 1, -2 * (f == 1)), s(1, 1), s(f == 2 || f == 3 ? 3 : 2), f == 3 && s(4) };
// Volumen y lectura: bordes de arriba/izquierda más claros, base más oscura, tinte rojo de dolor (d) y contorno de 1 px.
const gxO = d => {
  for (let p = 1023; p >= 0; p--) { const c = G[p]; if (c) G[p] = mix(mix(c, -1, (G[p - 32] != c || G[p - 1] != c) * .25), d ? -10460929 : -16777216, d ? .45 : !G[p + 32] * .35) }
  for (let p = 0; p < 1024; p++) if (!G[p] && [p - 1, p + 1, p - 32, p + 32].some(q => G[q] && G[q] != 0xff100c0c)) G[p] = 0xff100c0c;
};

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
function alert(e) { if (!e.s) e.s = 1, e.st = .3 + rnd() * .3, fx(5, e) }
function hurt(v, s) { hp -= v; fx(11, v, rel(s.x, s.y)) }
function proj(e, a, s, d) {
  // sin objetos temporales: el jefe tira abanicos seguidos
  for (const j of PJ) if (!j.on) { j.on = 1; j.k = e.t > 2 ? 1 : 0; j.x = e.x + cos(a) * .3; j.y = e.y + sin(a) * .3; j.vx = cos(a) * s; j.vy = sin(a) * s; j.d = d; j.t = 5; fx(9, e); return }
}
function dmgE(e, v) {
  const p = ET[e.t];
  e.hp -= v; e.f = .1; fx(2, e);
  // retroceso proporcional al daño sobre la vida máxima: la escopeta revolea drones, el jefe casi ni se mueve
  const d = hypot(e.x - PL.x, e.y - PL.y) || 1, k = v / p[0] * .3;
  mv(e, (e.x - PL.x) / d * k, (e.y - PL.y) / d * k, e.t > 2 ? .45 : .3);
  if (e.hp <= 0) {
    e.s = 5; SC += p[9]; LS.k++; fx(4, e);
    // racha: cada baja dentro de 2,5 s de la anterior suma el valor del enemigo otra vez (hasta x4)
    gpk = gpt > 0 ? gpk + 1 : 1; gpt = 2.5;
    if (gpk > 1 && e.t < 3) { const b = p[9] * min(3, gpk - 1); SC += b; say(`RACHA x${min(4, gpk)}  +${b}`, NK1); fx(24) }
    if (e.t > 2) place(addP(7, e.x, e.y)); else if (rnd() < p[12]) place(addP(6, e.x, e.y));
  } else {
    alert(e);
    if (rnd() < p[11]) e.s = 4, e.st = .25, fx(3, e);
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
    fx(7, e);
    // el dron hace pasadas: pica, descarga y se aleja un momento antes de volver
    if (e.t) e.rt = .6, e.rx = -cos(a), e.ry = -sin(a);
    if (e.v && rnd() < max(.25, .85 - d / 16) * (mvd ? .7 : 1)) hurt(p[8] * max(.5, min(1.3, 1.4 - d / 10)) | 0, e); else fx(8, e);
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
    // cambio de fase legible: se tambalea 0,5 s (cuadro de dolor) antes del patrón nuevo; con 0,9 s el jefe quedaba más fácil que antes
    if (b != e.bp) { e.bp = b; fx(20, b); if (b > 1 && d > 2) for (let i = 0; i < 2; i++) { const n = spawnE(1, e.x, e.y); n && alert(n) } e.s = 4; e.st = .5; return }
  }
  if (e.v && d < p[4] && e.cd <= 0) { e.s = 3; e.st = p[6] - e.bp * .1; fx(6, e); return }
  // Sin verte, los demás te buscan por el BFS; el jefe se queda en su arena (si no, acampa detrás de una puerta).
  let vx = 0, vy = 0;
  if (e.rt > 0) e.rt -= h, vx = e.rx, vy = e.ry;
  else if (e.v) {
    if (d > p[10]) vx = dx / d, vy = dy / d;
    // dron en zigzag; el guardia se corre de costado (entre ráfagas, nunca mientras apunta)
    if (e.t < 2) { const z = sin(T * (e.t ? 5 : 1.8) + e.ph) * (e.t ? .8 : .35); vx -= dy / d * z; vy += dx / d * z }
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
    if (j.t < 0 || sol(j.x, j.y)) j.on = 0, fx(10, j.x, j.y);
    else if (hypot(PL.x - j.x, PL.y - j.y) < .4) j.on = 0, hurt(j.d, j);
  }
}
function doors(h) {
  for (const i of DL) {
    const x = i % W + .5, y = (i / W | 0) + .5, k = MAP[i] > 4, o = DO[i];
    let n = hypot(PL.x - x, PL.y - y) < NK1, oc = abs(PL.x - x) < .75 && abs(PL.y - y) < .75;
    if (n && k && !KC) { n = 0; if (lt <= 0) say('NECESITÁS LA TARJETA'), fx(16), lt = 2 }
    for (const e of EN) if (e.on && e.s && e.s < 5) { if (abs(e.x - x) < .8 && abs(e.y - y) < .8) oc = 1; if (!k && hypot(e.x - x, e.y - y) < 1.3) n = 1 }
    DT[i] = n ? NK1 : DT[i] - h;
    // Nunca se cierra con alguien adentro (el cuerpo pisa la celda: jugador radio .25, enemigos .3): si está ocupada sigue abriendo.
    // Con .97 alcanzaba pararse en diagonal o pegado a la puerta para abrir una K sin tarjeta.
    DO[i] = DT[i] > 0 || oc ? min(1, o + h * 2) : max(0, o - h * 2);
    if (!o && DO[i]) fx(17, i, 1);
    if (o == 1 && DO[i] < 1) fx(17, i, 0);
  }
}

// ---------- jugador y armas ----------
// jugabilidad: velocidad del jugador (inercia), marca de acierto (s), racha de bajas y su ventana (s)
let gvx = 0, gvy = 0, gph = 0, gpk = 0, gpt = 0;
function shoot() {
  const w = WP[wpn];
  fcd = w[0]; rec = 1; fa = .07; LS.s++; fx(0, wpn);
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
    if (b) dmgE(b, w[1]), hit = 1; else fx(1, PL.x + rx * wd, PL.y + ry * wd);
  }
  if (hit) LS.h++;
  if (wpn && AM[wpn] < 1) wpn = 0, fx(19, 0);
}
function stepP(h) {
  const fw = (H.U > 0) - (H.D > 0), tr = (H.R > 0) - (H.L > 0), sp = H[4] > 0 ? 4.2 : 2.6, dx = cos(pa), dy = sin(pa),
    sd = (H[2] > 0) * tr + (H[6] > 0) - (H[5] > 0), vx = dx * fw - dy * sd, vy = dy * fw + dx * sd;
  if (H[2] > 0) tv = 0;
  else if (tr) { if (tr != td) tv = 0; td = tr; tv = min(1, tv + h * 2.5); pa = nrm(pa + tr * h * (1.3 + 2.4 * tv * tv)) }
  else tv = 0;
  const l = hypot(vx, vy) || 1, k = min(1, h * 13);
  // inercia corta: arranca y frena en ~0,2 s (se siente el peso sin volverse resbaloso)
  gvx += (vx / l * sp - gvx) * k; gvy += (vy / l * sp - gvy) * k;
  const m = hypot(gvx, gvy);
  mvd = m > 1;
  if (m > .02) {
    const x = PL.x, y = PL.y, o = floor(bob / PI);
    mv(PL, gvx * h, gvy * h, .25);
    bob += hypot(PL.x - x, PL.y - y) * 3.2;
    if (o != floor(bob / PI)) fx(18);
    if (bob > TAU) bob -= TAU;
  }
  if (P[3]) {
    P[3] = 0;
    for (let i = 1; i < 4; i++) { const w = (wpn + i) % 3; if (!w || HW[w] && AM[w] > 0) { if (w != wpn) wpn = w, fx(19, w); break } }
  }
  fcd -= h; rec = max(0, rec - h * 6); fa -= h;
  gpt -= h;
  if (!(H[1] > 0)) nf = 0;
  else if (fcd <= 0 && !nf) shoot();
}
function stepK() {
  for (const p of PK) if (p.on && p.k < 8 && hypot(p.x - PL.x, p.y - PL.y) < (p.k == 5 ? .9 : .55)) {
    const k = p.k;
    if (k == 5) { if (eo) won = 1; else if (lt <= 0) say(CN - CL > 1 ? `FALTAN ${CN - CL} CHIPS` : 'FALTA 1 CHIP'), fx(16), lt = 2; continue }
    if (k == 1) { if (hp >= NK0) continue; hp = min(NK0, hp + 25) }
    // con la pistola en la mano (te quedaste sin balas), la munición te devuelve el rifle
    if (k == 2 || k == 6) { AM[1] += k < 3 ? 25 : 8; AM[2] += HW[2] * (k < 3 ? 4 : 2); if (!wpn) wpn = 1, fx(19, 1) }
    if (k == 3) KC = 1, say('TARJETA-LLAVE');
    if (k == 4) HW[2] = 1, AM[2] += 8, wpn = 2, say('ESCOPETA');
    p.on = 0; fx(13, k);
    if (!k || k == 7) {
      CL++; SC += 1000; fx(14, CT + CL, k);
      if (CL >= CN) { if (L > 1) won = 1; else eo = 1, fx(15), say('SALIDA ABIERTA', 3) }
    }
  }
}

// ---------- flujo de juego ----------
function newGame() { lives = 3; SC = 0; CT = 0; HW = [1, 1, 0]; AM = [0, 40, 0]; wpn = 1; TOT = {k: 0, s: 0, h: 0, t: 0} }
function startLevel(l) {
  L = l; SEED = 99 + l * 7919; T = 0; won = eo = KC = CL = CN = MT = lt = ft = rec = fa = tv = bob = hk = 0; fcd = .3; hp = NK0; pa = 0; boss = null;
  LS = {k: 0, s: 0, h: 0, t: 0}; snap = [SC, AM.slice(), HW.slice(), wpn];
  for (const A of ALL) for (const o of A) o.on = 0;
  const R = LV[l].split(' '), N = R.length * R[0].length;
  HH = R.length; W = R[0].length;
  MAP = new Uint8Array(N); DO = F32(N); DT = F32(N); SEEN = new Uint8Array(N); FF = new Int16Array(N); Q = new Int16Array(N); NB = [-1, 1, -W, W]; DL = [];
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
  gvx = gvy = gpk = gpt = 0;
  gxLv(l);
  FG(l * 3); flow(); fx(21, l);
}
function win() {
  won = 0;
  LB = [(LS.s ? LS.h / LS.s : 0) * 2000 | 0, max(0, 3000 - LS.t * 10) | 0, max(0, hp) * 10 | 0];
  SC += LB[0] + LB[1] + LB[2]; CT += CL;
  for (const k in TOT) TOT[k] += LS[k];
  fx(22); go('levelEnd');
}
function die() {
  lives--; fx(12);
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
const dim = (s, a, b) => { const m = (NK3 >> s) * 65793; for (let i = a | 0; i < (b || 12e4); i++) B[i] = B[i] >> s & m | -16777216 };
const mix = (a, b, k) => { let r = -16777216; for (let s = 0; s < 24; s += 8) r |= (a >> s & NK3) * (1 - k) + (b >> s & NK3) * k << s; return r };
const tint = (c, k) => { for (let i = 0; i < 12e4; i++) B[i] = mix(B[i], c, k) };
// Arco en el borde de la mira apuntando al ángulo relativo r (0 = adelante): daño recibido y salida.
const ind = (r, c, k) => { for (let u = -.3; u < .3; u += .01) for (let q = 86; q < 96; q++) { const i = (150 - cos(r + u) * q | 0) * 400 + (NK7 + sin(r + u) * q * 1.3 | 0); B[i] = mix(B[i], c, k * (1 - abs(u) * 3)) } };
const ci = (x, y, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) B[(y + j) * 400 + x + i] = c };
// ---------- piezas de UI en el buffer (todas en coordenadas de 400x300) ----------
// verde NVIDIA y tinta de los contornos, en ABGR
const XG = -16729738, XK = -16120059;
const dr = (x, y, w, h, s) => { for (let j = y; j < y + h; j++) dim(s, j * 400 + x, j * 400 + x + w) };
// panel: rectángulo oscurecido con borde cromado de 1 px y línea verde arriba (salvo con g)
const brd = (x, y, w, h) => { fr(x, y, w, 1, -2305336); fr(x, y, 1, h, -6911363); fr(x, y + h - 1, w, 1, -11713734); fr(x + w - 1, y, 1, h, -11713734) }, pnl = (x, y, w, h, s, g) => { dr(x, y, w, h, s); brd(x, y, w, h); g || fr(x + 1, y + 1, w - 2, 1, XG) };
// keycap de color c (RGB); apretada (p) baja 2 px y pierde la base
const key = (x, y, w, h, c, p) => { c = ab(c); p = p ? 2 : 0; y += p; fr(x - 1, y - 1, w + 2, h + 3 - p, XK); fr(x, y, w, h + 2 - p, mix(c, -16777216, .45)); fr(x, y, w, h, c); fr(x + 1, y, w - 2, 1, mix(c, -1, .35)); fr(x, y + h - 2, w, 2, mix(c, -16777216, .18)) };
// cinta roja con las puntas en diagonal
const rib = (x, y, w, h) => { for (let j = 0; j < h; j++) { const o = h - j >> 1; fr(x + o - 2, y + j, w - o * 2 + j + 4, 1, -16119174); j && j < h - 1 && fr(x + o, y + j, w - o * 2 + j, 1, -14803240) } fr(x + 4, y + 2, w - 8, 1, -14211073) };
// sprite con contorno oscuro de 1 px (para fondos claros); recorta contra los bordes
const blo = (id, x, y, s) => { for (const o of [-1, 1, -400, 400]) for (let j = 0; j < 32 * s; j++) for (let i = 0; i < 32 * s; i++) { const X = x + i + o % 400, k = (y + j) * 400 + x + i + o; IMG[id << 14 | j / s << 5 | i / s] && X >= 0 && X < 400 && k >= 0 && k < 12e4 && (B[k] = XK) } blit(id, x, y, s) };
// Logo en letras pixel de 6x7 (solo las que se usan): filas de 6 bits con offset 40, degradé por fila,
// contorno, sombra dura e itálica. Igual en cualquier sistema: no depende de la monospace instalada.
const FN = 'ABCKTOHERDGMV', FT = 'F[[g[[[f[[f[[fGXXXXXG[^d`d^[gg44444F[[[[[F[[[g[[[gXXfXXgf[[fd^[f[[[[[fGXX_[[G[gg[[[[[[[[[F4';
const GG = P12("ff9fd3fb2f91f71e41d22").map(ab), GV = P12("fcbf98f65e32c22911700").map(ab);
const word = (w, x, y, s, g = GG) => {
  for (let p = 0; p < 3; p++) for (let n = 0; n < w.length; n++) for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) if (FT.charCodeAt(FN.indexOf(w[n]) * 7 + r) - 40 >> 5 - c & 1) {
    const X = x + (n * 7 + c) * s + (6 - r) * s / 5, Y = y + r * s;
    p > 1 ? fr(X, Y, s, s, g[r]) : p ? fr(X - 1, Y - 1, s + 2, s + 2, -16775638) : fr(X + 2, Y + 3, s, s, -16777216);
  }
};
// copia del fondo de una pantalla estática (para redibujar teclas sin recalcular el sunburst)
const BG = U32(12e4), SEP = [42, 130, 236, 342], UX = [243, 275, 314], UW = [29, 36, 22];
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
    const r = 150 / (y - 149.5), sx = r * qx / NK7, sy = r * qy / NK7;
    let u = PL.x + r * (dx - qx), v = PL.y + r * (dy - qy);
    for (let x = 0, i = y * 400, j = (299 - y) * 400; x < 400; x++, i++, j++, u += sx, v += sy) {
      const t = (u * 32 & 63) << 6 | v * 32 & 63;
      B[i] = gxF[y * 16 + gxT[t]]; B[j] = gxF[(299 - y) * 16 + gxT[t + 4096]];
    }
  }
  MK = 1;
  for (let x = 0; x < 400; x++) {
    const c = x / NK7 - 1;
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
    const s = 300 / dp, sz = sc * (o.g || o.s < 5 ? s : 300 / max(dp, NK1)), cx = NK7 * (1 + ((o.x - PL.x) * qx + (o.y - PL.y) * qy) / .4356 / dp),
      bt = 150 + s * (.5 - z), tp = bt - sz, lf = cx - sz * wd / 2, fl = !o.g && (o.f > 0 || o.s == 3 && T * 14 & 1 && 2), of = (id * 16 + sh) << 10;
    for (let x = max(0, ceil(lf)); x < min(400, lf + sz * wd); x++) if (dp < ZB[x]) {
      const tx = (x - lf) / sz * 32 | 0, ot = of + (tx >> 5 << 14) | tx & 31;
      for (let y = max(0, ceil(tp)); y < min(300, bt); y++) { const c = IMG[ot | ((y - tp) / sz * 32 & 31) << 5]; if (c) B[y * 400 + x] = fl ? fl > 1 ? mix(c, -16776961, .35) : -1 : c }
    }
  }
  // partículas, recortadas por el z-buffer
  for (let i = 0; i < 64; i++) if (PT[i] > 0) {
    const ox = PX[i] - PL.x, oy = PY[i] - PL.y, dp = ox * dx + oy * dy, x = NK7 * (1 + (ox * qx + oy * qy) / .4356 / dp) | 0, y = 150 + 300 / dp * (.5 - PZ[i]) | 0, s = max(1, 3 / dp | 0);
    if (dp > .2 && x >= 0 && x < 400 - s && y >= 0 && y < 300 - s && dp < ZB[x]) fr(x, y, s, s, PQ[i]);
  }
  // recorrido del modo atracción: el nivel sin arma ni HUD
  if (ST == 'title') return;
  // Arma corrida a la derecha (no tapa la mira): balanceo al caminar, retroceso, la ilumina el fogonazo y al cambiar baja y sube.
  if (wpn != gxw) gxw = wpn, gxc = RT;
  // la grilla se rehace por su cuenta (gxK): gxw es de la animación de cambio y los tests la tocan
  if (wpn != gxK) gxK = wpn, gxP([gxWS[wpn], gxWS[wpn + 3]], 3);
  const X0 = 170 + sin(bob) * 5 + rec * 8 | 0, Y0 = NK0 + abs(cos(bob)) * 5 + rec * 6 + max(0, gxc + .3 - RT) * 300 | 0, f = jt > 0 ? jf : hp > 30 ? 0 : 2;
  gxB(X0, Y0, 1 + max(0, fa) * 7);
  if (fa > 0) gxM(X0 + gxZ[wpn * 3], Y0 + gxZ[wpn * 3 + 1], gxZ[wpn * 3 + 2]);
  // la mira se pone roja si la asistencia de apuntado tiene un enemigo; no se dibuja en pausa ni con el cartel del nivel
  let xc = -10420384;
  for (const e of EN) if (e.on && e.s < 5 && abs(rel(e.x, e.y)) < .08 && los(PL.x, PL.y, e.x, e.y)) xc = -12570369;
  if (ST == 'playing' && T >= 2.5) for (let i = -4; i < 5; i++) if (abs(i) > 1) B[NK9 + i] = B[NK9 + i * 400] = xc;
  if (ST == 'playing' && gph > 0) for (let i = 3, k = gph > .15; i < 6 + k * 2; i++) B[NK9 + i * 401] = B[NK9 - i * 401] = B[NK9 + i * 399] = B[NK9 - i * 399] = k ? -16776961 : -1;
  if (boss && boss.s && boss.s < 5) {
    fr(98, 20, 204, 10, NK2); fr(NK0, 22, NK7, 6, -16777168);
    fr(NK0, 22, max(0, boss.hp) / ET[3][0] * NK7 | 0, 6, BC[boss.bp]);
    fr(166, 20, 2, 10, NK2); fr(233, 20, 2, 10, NK2);
  }
  // minimapa: celdas que tocó algún rayo (SEEN), 3 px por celda, arriba a la derecha
  const ox = 396 - W * 3;
  for (let y = 18; y < 22 + HH * 3; y++) dim(1, y * 400 + ox - 2, y * 400 + 398);
  brd(ox - 3, 16, W * 3 + 5, HH * 3 + 7);
  for (let i = 0; i < W * HH; i++) if (SEEN[i]) { const m = MAP[i]; fr(ox + i % W * 3, 20 + (i / W | 0) * 3, 3, 3, m == 5 ? -37073 : m == 4 ? -14638880 : m ? -6254456 : -13621216) }
  if (eo && RT % .5 < .3) fr(ox + (EX | 0) * 3, 20 + (EY | 0) * 3, 3, 3, -10420416);
  for (let k = 0; k < 4; k++) B[(20 + PL.y * 3 + sin(pa) * k | 0) * 400 + (ox + PL.x * 3 + cos(pa) * k | 0)] = -1;
  if (eo) ind(rel(EX, EY), -10420416, .45 + sin(RT * 6) * .25);
  if (dI > 0) ind(nrm(dA - pa), -12570369, min(1, dI));
  // cartel de nivel, caja de radio (a la izquierda, donde el arma nunca llega) y barra inferior; los flashes tiñen todo
  if (T < 2.5) dr(0, NK0, 400, 56, 1), rib(50, 112, 300, 28);
  if (rq > 0 && ST == 'playing') rbx(rw ? RP[rw] : 50 + f);
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
  hv(2, hp > 30) && hB.setColor(hp > 30 ? QW : '#ff3b3b');
  hv(3, wpn + AM[wpn] * 3) && (hX.setText(WP[wpn][4]), hW.setText(wpn ? '' + AM[wpn] : '∞'));
  hv(4, w) && hW.setColor(w ? '#ffb020' : QW);
  hv(5, CT + CL) && hC.setText(`CHIPS ${CT + CL}/12`);
  hv(6, m ? MSG : eo ? d : -1) && hM.setText(m ? MSG : eo ? 'AL AUTO ' + '↑→↓←'[d] : '');
  hv(7, m) && hM.setColor(m ? QW : QN);
  vis(hN, r); vis(hR, r);
}
// Timers de game feel (solo corren en playing, así que la pausa los congela).
function feel(h) {
  rf -= h; pf -= h; dI -= h; rq -= h; hb -= h; jt -= h;
  gph -= h;
  const s = max(0, shk -= h) * 50;
  IM.setPosition(400 + (random() - .5) * s, 300 + (random() - .5) * s);
  for (let i = 0; i < 64; i++) if (PT[i] > 0) { PT[i] -= h; PX[i] += VX[i] * h; PY[i] += VY[i] * h; PZ[i] += (VZ[i] -= 5 * h) * h; if (PZ[i] < 0) PZ[i] = 0, VZ[i] *= -.4 }
  if (hp <= 30 && hb <= 0) hb = .9, fx(26);
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
const QW = '#fff', QK = '#000', QY = '#ffe23a', QN = '#a6e22e', QI = '#cfe0ff', QD = '#a9b4c2', U = [];
// game over: lo dice LA DIRECTORA
const GO = raw`El directorio retiró la oferta.
Ya imprimieron el comunicado. Otra vez.|OMNICORE 1 · Jensen 0.
La campera quedó en objetos perdidos.|Seguimos muy decepcionados.
Los chips siguen en China.`.split`|`;
const GR = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ.-', ['DEL', 'END']];
// intro: hablan LA DIRECTORA, EL INVERSOR, RADIO y JENSEN
const IN = raw`Jensen: hiciste un muy mal trabajo.
Tu novia le pasó todos los chips
a China. Estamos muy decepcionados.
Quedás afuera del directorio.|¿Querés volver a ser el CEO?
Tenés que recuperarlos a todos.
Los 12. Uno por uno.
Sin chips no hay sillón.|¿Jensen? Acá ${RN[1]}. Los ubiqué:
tres data centers de OMNICORE.
El jet ya está en la pista.
${RN[2]} huele silicio a 1 km.|Campera de cuero: puesta.
Rifle: cargado. Keynote: cancelada.
Voy a recuperar todos los chips.
Los doce.`.split`|`;
// fin de nivel: quién espera en el auto (GPU, EL INVERSOR, LA DIRECTORA = RN[L + 2]) y qué dice
const LW = raw`¡GUAU! (SUBÍ, QUE
HAY MÁS CHIPS)|VAMOS BIEN. LA ACCIÓN
YA SUBIÓ 3%.|ESTÁ BIEN, JENSEN.
SUBÍ. HABLEMOS.`.split`|`;
const ACTA = raw`1. Se recuperaron los 12 chips.
2. La novia ya no tiene llave del depósito.
3. Jensen vuelve como CEO. Con campera.
4. La acción subió 900%. Nadie entiende.

Votación: unanimidad.
(${RN[2]} votó con la pata.)`;
// controles del jugador del lado derecho (espejo de CABINET_KEYS)
const MIR = '↑←↓→ = WASD   R T Y = U I O   F G H = J K L   2 = ENTER';
// Teclado dibujado (controles y pausa): tecla, x, y, ancho, color (RGB), qué hace, color de la etiqueta.
// Verificado contra CABINET_KEYS y stepP: W/S P1_U/D, A/D P1_L/R, ESPACIO P1_1, I P1_2, O P1_3, J P1_4, K/L P1_5/6, ENTER START1.
const KK = [['W', 82, 86, 26, NK10], ['A', 52, 116, 26, NK10], ['S', 82, 116, 26, NK10], ['D', 112, 116, 26, NK10],
  ['ESPACIO', 194, 80, 54, 0xe8261c, 'DISPARAR', '#ff7a6a'], ['I', 258, 80, 30, 0x2f7fe0, 'STRAFE\n+ A/D', '#7fb8ff'], ['O', 300, 80, 30, 0xffd21a, 'ARMA', '#ffd21a'],
  ['J', 206, 128, 30, NK6, 'CORRER', QN], ['K', 248, 128, 30, 0x2f7fe0, 'STRAFE ←', '#7fb8ff'], ['L', 290, 128, 30, 0x2f7fe0, 'STRAFE →', '#7fb8ff'], ['ENTER', 312, 172, 66, 0xb8c2cc]];
const uy = (i, y, s, z) => ui(i, 400, y, s, z, QY, .5, '#3a0800');
// Configura el texto U[i] del pool (creado una sola vez en create). k = color del contorno.
const ui = (i, x, y, s, z, c = QW, o = .5, k = QK) => U[i].setPosition(x, y).setOrigin(o, 0).setAlign(o ? 'center' : 'left').setStroke(k, c == QK ? 0 : z > 30 ? 6 : z < 15 ? 3 : 4).setFontSize(z + 'px').setColor(c).setText(s).setAngle(0).setVisible(1);
const rk = (i, y, z, p, h) => { for (let k = 0; k < 5; k++) { const e = RK[k]; ui(i + k, 400, y + k * p, `${k + 1}. ${e ? e.n.padEnd(3) : '---'}  ${String(e ? e.s : 0).padStart(7)}`, z, k === h ? QK : k ? QW : QY) } };
// a = solo redibuja las teclas (la animación de la página de controles): los textos no se re-renderizan
const kb = (i, q, a) => {
  pnl(14, 50, 160, 160, 2); pnl(182, 50, 204, 160, 2);
  KK.forEach((k, n) => {
    const p = q == n, x = k[1] * 2 + k[3], y = k[2] * 2 + 8 + p * 4;
    key(k[1], k[2], k[3], 24, k[4], p);
    if (a) U[i + 2 + n].y = y;
    else ui(i + 2 + n, x, y, k[0], k[3] > 40 ? 18 : 26, n == 4 || 'IKL'.includes(k[0]) ? QW : QK), k[5] && ui(i + 9 + n, x, k[2] * 2 + 54, k[5], 14, k[6]);
  });
  a || (ui(i, 188, 108, 'MOVERTE', 18, QN), ui(i + 1, 570, 108, 'ACCIÓN', 18, QN), ui(i + 19, 228, 186, 'AVANZAR', 16, QW, 0), ui(i + 20, 96, 246, 'GIRAR', 16, QW, 1),
    ui(i + 21, 284, 246, 'GIRAR', 16, QW, 0), ui(i + 22, 190, 300, 'RETROCEDER', 16), ui(i + 23, 612, 356, 'PAUSA', 16, QW, 1), ui(i + 24, 386, 400, raw`ESPACIO · I · J: MANTENÉ APRETADO`, 14, QD, 0));
};
// Título: logo en letras pixel, cinta, panel del top 5 y el elenco parado sobre el escenario.
function tit() {
  drawBurst(0);
  ci(52, 52, 28, -9057); ci(52, 52, 21, -3880); ci(52, 52, 14, -6227969); blo(35, 28, 24, NK1);
  word('BACK', 128, 12, 5); word('TO', 99, 57, 2); word('THE', 92, 74, 2); word('BOARD', 138, 54, 5);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 16; j++) fr(274 + i * 9 + (16 - j) / 3, 20 + j, 5, 1, j && j < 15 ? GG[j / 2.3 | 0] : -16775638);
  rib(110, 96, 180, 15); pnl(132, 116, 136, 64, 1);
  for (let y = 270; y < 300; y++) fr(0, y, 400, 1, mix(-12051958, -16777216, (y - 270) / 40));
  fr(0, 270, 400, 1, -16276);
  blo(62, -62, 208, 2); blo(63, 2, 208, 2); blo(57, 34, 206, 2); blo(54, 94, 206, 2); blo(58, 182, 206, 2); blo(59, 254, 206, 2); blo(61, 330, 208, 2);
}
// Escena final, un frame: entra (A), se sienta y gira (B, "VOLVISTE A SER EL CEO"), acta del directorio (C).
function fin() {
  const t = STT, a = t < 2.4, b = t >= 3.6 && t < 6, c = t >= 6;
  drawEnding(t);
  a && pnl(NK0, 4, NK7, 22, 1); b && rib(70, 6, 260, 22); c && (pnl(30, 6, 340, 112, 3, 1), fr(31, 7, 338, 14, XG));
  uv(3, a); uv(0, b); uv(1, c); uv(2, c); uv(9, c && t % 1 < .65);
  put();
}
// ---------- cinemáticas: Jensen sube al jet (4.ª placa de la intro) y apertura en tercera persona ----------
// 66 Jensen de espaldas (pelo gris peinado hacia atrás, campera de cuero, rifle en la mano); 67-68 jet privado de 64x32
// con la nariz a la izquierda (se dibuja a escala 4). Se generan acá: art() no toca estos ids.
AD("P898_>041B=121B;412@D412@=215S@116SB215S>841@8;@93::<13<9824;;18CD;18C9<16C;D:148C320F=2@>EA43>G=1>VEC320;E48YAE48Y:M<34"); sv(66);
for (const o of [0, 32]) AD("::f<<DPD<i:Cf3ADWB5n::f2BFH>4o1Ao1;2=52L4<41L:;6:S;<48<j06:<g436<j062;]7=4S]8124c:41VHEH2VNG:1V9F17>8L334VF17>TL334XL334D>225K>225R>225Y>225`>225", 0, o), sv(67 + o / 32);
// cnO segundos que le quedan a la apertura, cnK distancia inicial de la cámara, cnL el nivel (LS) al que pertenece, cnT cuándo empezó a carretear el jet
let cnO = 0, cnK = 0, cnL, cnT = 0;
// Pista de noche: el auto, el jet con la escalera, Jensen camina, sube, se da vuelta en la puerta. Al confirmar, el jet carretea.
function cnP(t) {
  const g = cnT && STT - cnT, X = g * g * -99, u = min(1, max(0, (t - 2.2) / 1.6));
  for (let y = 0; y < 300; y++) fr(0, y, 400, 1, y < 118 ? mix(-14808570, -10736582, y / 118) : -13884126);
  for (let k = 0; k < 50; k++) B[k * 53 % NK0 * 400 + k * 89 % 400] = k & 3 ? -7303024 : -1;
  for (let x = 0; x < 400; x += 10) { const h = 5 + x * 7 % 19; fr(x, 118 - h, 9, h, -14938612) }
  for (let x = 6; x < 400; x += 26) fr(x, 145, 12, 1, -9542816);
  blit(67, 144 + X, 32, 4); blit(68, 272 + X, 32, 4); blo(62, 2, 122, 1.25); blo(63, 42, 122, 1.25);
  // hasta que carretea: puerta abierta, escalera y Jensen (camina de frente desde el auto, sube de espaldas, se da vuelta en la puerta)
  if (!g) {
    fr(188, 80, 16, 36, -6234113);
    for (let k = 0; k < 44; k++) fr(180 - k * .8 | 0, NK0 + k, 1, 1, -3357504), k % 5 || fr(178 - k * .8 | 0, 116 + k, 14, 2, -6516854);
    blit(u % 1 ? 66 : 54, 36 + min(t, 2.2) * 43 + u * 45, 120 - u * 44 - abs(sin(t * 9)) * 2 * (u < 1), 1.25);
  }
  pnl(16, 172, 368, NK0, 1); rib(150, 165, 92, 14);
  put();
}
// Apertura de cada nivel: la cámara arranca detrás de Jensen y avanza hasta su cabeza. Todos los niveles arrancan con
// una pared atrás: para que la cámara tenga lugar, Jensen empieza hasta 1,1 celdas más adelante.
const cnS = () => {
  const c = cos(pa), s = sin(pa), f = min(1.1, cast(PL.x, PL.y, c, s) - .6);
  if (f > 0) PL.x += c * f, PL.y += s * f;
  cnK = min(1.4, cast(PL.x, PL.y, -c, -s) - .3); cnO = 2.4; cnL = LS;
};
// Un frame de la apertura: la simulación no corre (ni relojes ni enemigos), cualquier botón la saltea.
function cnF(h, k) {
  // soltar el disparo durante la apertura cuenta como soltarlo (nf), igual que en stepP
  cnO = k ? 0 : cnO - h; H[1] > 0 || (nf = 0);
  const d = cnK * min(1, cnO / 1.2), c = cos(pa) * d, s = sin(pa) * d, z = 270 / d;
  // render() en modo 'title' dibuja solo el mundo (sin arma, mira ni HUD), desde la cámara corrida hacia atrás
  PL.x -= c; PL.y -= s; ST = 'title'; render(); ST = 'playing'; PL.x += c; PL.y += s;
  d > .3 && blit(66, NK7 - z / 2 - 40 * d / cnK, 140 - z * .14, z / 32);
  fr(0, 0, 400, 26, -16777216); fr(0, 274, 400, 26, -16777216);
  for (const t of HT) vis(t, cnO <= 0);
  for (const t of U) vis(t, 0);
  // al terminar, el arma sube desde abajo con la misma animación del cambio de arma (gxc)
  cnO > 0 || (gxc = RT);
  put();
}
const go0 = () => { newGame(); startLevel(0); go('playing'); cnS() };
const rbx = id => { pnl(4, 222, 166, 36, 2); fr(6, 224, 32, 32, -14542316); blit(id, 6, 224, 1) }, rkp = h => { pnl(90, 70, 220, 150, 2); rk(1, 168, 30, 54, h) };
const gY = k => k > 27 ? 470 : 246 + (k / 7 | 0) * 56;
// Arma los textos (y el fondo, si es estático) del estado y página actuales.
function scr() {
  STT = 0; bk = -1; HV[9] = 0;
  for (const t of U) vis(t, 0);
  const s = ST, Y = '#3a0800', R = '#4a0000', vg = s == 'victory' || s == 'gameover';
  if (s == 'loading') ui(0, 400, 280, 'CARGANDO...', 28);
  if (s == 'title') {
    if (!pg) tit(), ui(0, 400, 194, 'THE RETURN OF THE CEO', 20, QW, .5, R), ui(1, 400, 240, 'MEJORES PUNTAJES', 14, QN), rk(2, 258, 16, 19),
      uy(7, 542, 'APRETÁ ENTER', 28), ui(8, 400, 580, raw`WASD MOVER · ESPACIO DISPARAR · O ARMA · J CORRER · ENTER PAUSA`, 14, QI), bk = 7;
    else {
      // atracción: 1 ranking, 2 controles con el teclado, 3 recorrido del nivel 1
      const e = pg == 2 ? 29 : 15;
      if (pg < 3) drawBurst(0), dim(pg);
      if (pg == 1) rkp(), blo(61, 330, NK7, 2), uy(0, 40, 'MEJORES PUNTAJES', 40);
      if (pg == 2) pnl(14, 218, 372, 40, 2, 1), BG.set(B), kq = -1, kb(2), uy(0, 16, 'CONTROLES', 40), ui(1, 400, 64, 'SE JUEGA CON EL TECLADO', 16, QI),
        ui(27, 400, 446, 'JUGADOR DEL LADO DERECHO (ESPEJO)', 14, QD), ui(28, 400, 472, MIR, 16, QI), ui(30, 400, 572, 'EN MENÚS: ENTER O ESPACIO CONFIRMAN', 14, QD);
      else ui(16, 400, 578, pg < 2 ? '● ○ ○' : '○ ○ ●', 14, QD);
      if (pg > 2) ui(0, 400, 24, 'NIVEL 1 · SHENZHEN', 22, QW, .5, R), ui(1, 88, 450, RN[1], 14, RC[1], 0), ui(2, 88, 468, raw`ASÍ SE VE ADENTRO.
¿VENÍS O NO?`, 16, QW, 0);
      uy(e, pg == 2 ? 534 : 540, 'APRETÁ ENTER', 24); bk = e;
    }
  }
  // intro: personaje de cuerpo entero, cinta con el nombre y el texto a máquina (lo tipea update)
  if (s == 'intro') {
    // la 4.ª placa es la escena animada del jet (la redibuja cnP en cada frame)
    if (ip > 2) cnT = 0, cnP(0);
    else {
      drawBurst(0); dim(2);
      ip - 1 && tint(ab(ip ? 0x001040 : 0x200010), ip ? .35 : .2);
      pnl(16, 172, 368, NK0, 1);
      if (ip == 2) blo(62, 252, 108, 2), blo(63, 316, 108, 2), blo(61, 150, 108, 2);
      blo([57, 58, 59][ip], 22, 44, 4); rib(150, 165, 92, 14);
    }
    ui(0, 392, 331, RN[[4, 3, 1, 0][ip]], 18, QW, .5, R); ui(1, 56, 376, '', 20, QW, 0);
    ui(2, 760, 16, ip + 1 + '/4', 16, QD, 1); ui(3, 752, 506, 'ESPACIO: ' + (ip > 2 ? 'EMPEZAR' : 'SEGUIR') + ' · ENTER: SALTEAR', 14, QD, 1);
    ip || ui(4, 560, 120, 'DESPEDIDO', 48, '#ff3b3b', .5, '#3a0000').setAngle(-12);
    ip == 2 && (ui(4, 560, 80, '3:00 AM', 48, QN, .5, '#0a2000'), ui(5, 560, 140, '1 LLAMADA ENTRANTE', 16, QI));
    tc = 0;
  }
  // juego: cartel de nivel (visible con T < 2,5), aviso de inactividad y nombre del jefe (visibles según update)
  if (s == 'playing') uy(0, 186, 'NIVEL ' + (L + 1), 22), ui(1, 400, 236, NAMES[L], 28, QW, .5, R), ui(4, 400, 292, `RECUPERÁ ${CN} CHIPS`, 16, QN),
    vis(uy(2, 362, raw`¿SEGUÍS AHÍ?`, 28), 0), vis(ui(5, 400, 404, '', 14), 0), vis(ui(3, 400, 14, 'COMPLIANCE-9000', 14, '#ff8a7a'), 0);
  if (s == 'paused') {
    // en la apertura la pausa muestra la tercera persona (cnF deja ST en 'playing': se restaura)
    cnO > 0 && cnL == LS ? (cnF(0), ST = s) : render(); dim(2); kb(2); vis(hM, 0); vis(hN, 0); vis(hR, 0);
    uy(0, 14, 'PAUSA', 44); ui(1, 400, 66, raw`NIVEL ${L + 1} · CHIPS ${CT + CL}/12 · VIDAS ${lives}`, 16, QI);
    ui(29, 400, 438, 'ENTER: SEGUIR', 24, QN, .5, Y); ui(28, 400, 482, 'ESPEJO: ' + MIR, 14, QD); bk = 29;
  }
  // fin de nivel: estadísticas a la izquierda; a la derecha el auto con quien espera y lo que dice
  if (s == 'levelEnd') {
    render(); dim(2); tint(-8902134, .25); pnl(16, 52, 216, 176, 1);
    for (let y = 236; y < 300; y++) fr(240, y, 160, 1, mix(-13950436, -16777216, min(1, (y - 236) / 40)));
    fr(240, 236, 160, 1, XG); blit(62, 232, 172, 2); blit(63, 296, 172, 2); blo(RP[L + 2], 338, 172, 2); pnl(244, 60, 148, 54, 2);
    for (let i = 0; i < 8; i++) fr(350, 113 + i, 12 - i, 1, -15463158), fr(349, 113 + i, 1, 1, -6911363);
    uy(0, 20, `NIVEL ${L + 1} COMPLETO`, 40); ui(1, 400, 72, NAMES[L], 18, QN);
    LE = [['BAJAS', LS.k], ['PRECISIÓN', LB[0] / 20 | 0, '%'], ['TIEMPO', LS.t | 0, 's'], ['BONUS PRECISIÓN', LB[0]], ['BONUS TIEMPO', LB[1]], ['BONUS SALUD', LB[2]], ['PUNTAJE', SC]];
    for (let k = 0; k < 7; k++) ui(2 + k, 52, 126 + k * 48, '', k > 5 ? 24 : 20, k > 5 ? QY : QW, 0);
    ui(10, 500, 128, RN[L + 2], 14, RC[L + 2], 0); ui(11, 500, 152, LW[L], 16, QW, 0);
  }
  // victoria: 0 escena final (la dibuja fin() en cada frame), 1 puntaje, 2 no entraste al top 5 (compartida con game over)
  if (s == 'victory' && !pg) ui(3, 400, 16, raw`OFICINA DEL CEO · PISO 42 · 8:59 AM`, 16), uy(0, 20, 'VOLVISTE A SER EL CEO', 28),
    ui(1, 400, 18, raw`ACTA DEL DIRECTORIO · SESIÓN DE URGENCIA`, 16, QK), ui(2, 84, 54, ACTA, 17, QW, 0), uy(9, 564, 'ENTER: SEGUIR', 22), fin();
  if (s == 'victory' && pg == 1) drawEnding(6.3), dim(1), pnl(60, 40, 280, 150, 2), uy(0, NK0, '¡RECUPERASTE LOS 12 CHIPS!', 28), ui(1, 400, 170, 'PUNTAJE FINAL', 20, QD), ui(2, 400, NK7, '' + SC, 56),
    ui(3, 400, 290, raw`BAJAS ${TOT.k} · PRECISIÓN ${TOT.s ? TOT.h * NK0 / TOT.s | 0 : 0}% · TIEMPO ${TOT.t / 60 | 0}:${String(TOT.t % 60 | 0).padStart(2, '0')}`, 16, QN), ui(4, 400, 330, `CHIPS 12/12 · VIDAS ${lives}`, 16, QI);
  if (pg > 1 && vg) drawBurst(0), dim(1), rkp(), ui(0, 400, 30, 'NO ENTRASTE AL TOP 5', 36, '#ff3b3b', .5, '#3a0000'), uy(7, 470, 'TU PUNTAJE ' + SC, 24);
  if (s == 'gameover' && !pg) {
    render(); tint(-16777088, .3); dim(1); word('GAME', 64, 26, 5, GV); word('OVER', 214, 26, 5, GV); pnl(30, 96, 340, 92, 2); blo(57, 36, 120, 2);
    ui(1, 220, 206, RN[4], 14, RC[4], 0); ui(2, 220, 232, GO[random() * 3 | 0], 20, QW, 0); ui(3, 220, 300, `CHIPS ${CT + CL}/12 · PUNTAJE ${SC}`, 18, QY, 0);
  }
  if (s == 'levelEnd' || vg && (pg || s < 'h')) uy(9, 540, 'ENTER: SEGUIR', 22), bk = 9;
  if (s == 'nameEntry') {
    drawBurst(0);
    if (pg) dim(1), rkp(hi), hi < 0 || fr(96, 84 + hi * 27, 208, 20, XG), uy(0, 44, 'RANKING', 44), ui(6, 400, 500, raw`¡NOS VEMOS EN LA PRÓXIMA KEYNOTE!`, 20, QN);
    else {
      dim(2); blo(61, 336, 236, 2); BG.set(B);
      uy(0, 28, '¡ENTRASTE AL TOP 5!', 36); ui(1, 400, 80, 'PUNTAJE ' + SC, 22); ui(2, 400, 124, '', 52, QN);
      for (let k = 0; k < 30; k++) ui(3 + k, k > 27 ? 310 + k % 7 * 180 : 184 + k % 7 * 72, gY(k), GR[k / 7 | 0][k % 7], k > 27 ? 22 : 28);
      ui(33, 400, 540, raw`W A S D: MOVER · ESPACIO: ELEGIR · END: LISTO`, 16, QI); gd();
    }
  }
  s != 'playing' && put();
}
// Grilla de iniciales: keycaps en el buffer (la elegida, verde y apretada) sobre el fondo guardado en BG.
function gd() {
  B.set(BG);
  for (let k = 0; k < 30; k++) { const c = gy * 7 + gx == k; k > 27 ? key(130 + k % 7 * 90, 233, 50, 22, c ? NK6 : k > 28 ? 0x2a4a10 : 0x5a2a2a, c) : key(77 + k % 7 * 36, 121 + (k / 7 | 0) * 28, 30, 22, c ? NK6 : 0x2a3240, c) }
  // solo se re-pintan las dos letras que cambian (setColor re-renderiza el texto)
  U[3 + gp].setColor(QW).setStroke(QK, 4).y = gY(gp);
  const t = U[3 + (gp = gy * 7 + gx)].setColor(QK).setStroke(QK, 0); t.y = gY(gp) + 4;
  st(U[2], (NM + '___').slice(0, 3).split('').join(' '));
  put();
}
const act = () => {
  const c = GR[gy][gx];
  fx(24);
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
    do j = random() * W * HH | 0; while (MAP[j]);
    const x = PL.x, y = PL.y;
    PL.x = j % W + .5; PL.y = (j / W | 0) + .5; flow(); PL.x = x; PL.y = y;
  }
  let b = FF[i], n = i;
  for (const o of NB) { const v = FF[i + o]; if (v >= 0 && v < b) b = v, n = i + o }
  const r = nrm(atan2((n / W | 0) + .5 - PL.y, n % W + .5 - PL.x) - pa);
  pa = nrm(pa + max(-2, min(2, r * 3)) * h);
  if (abs(r) < .7) mv(PL, cos(pa) * h * NK1, sin(pa) * h * NK1, .25);
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
  for (const t of HT) vis(t, s[0] == 'p');
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
    bk < 0 || uv(bk, STT % 1 < .65);
    if (ST == 'loading') (rl || STT > NK1) && go('title');
    else if (ST == 'title') {
      // Modo atracción: tras 20 s sin input rota ranking / controles / recorrido cada 8 s.
      if (pg) { if (a || j) pg = 0, scr(), cd = 300; else if (STT > 8) pg = pg % 3 + 1, scr() }
      else if (a) go('intro'), fx(24);
      else if (idle > 20) pg = 1, scr();
      if (ST == 'title') {
        // controles: cada 0,7 s se "aprieta" otra tecla (solo se redibujan las teclas sobre el fondo guardado)
        if (pg == 2) { const q = STT / .7 % 11 | 0; q != kq && (kq = q, B.set(BG), kb(2, q, 1), put()) }
        if (pg > 2) cam(dt), render(), rib(80, 10, 240, 16), rbx(60), put();
      }
    }
    else if (ST == 'intro') {
      if (P.S) go0();
      else if (a || ic > IN[ip].length + 160) { if (ic < IN[ip].length) ic = IN[ip].length; else if (ip < 3) ip++, ic = 0, scr(); else cnT = cnT || STT }
      // en la placa del jet "seguir" (o el tiempo muerto) hace carretear el avión y el juego arranca 1,6 s después; ENTER no espera
      if (ST == 'intro' && ip > 2) cnT && STT > cnT + 1.6 ? go0() : cnP(STT);
      if (ST == 'intro') {
        const s = IN[ip], n = min(s.length, ic += dt * 32);
        if ((n | 0) > tc) tc = n | 0, s[tc - 1] > ' ' && tc & 1 && fx(25);
        st(U[1], s.slice(0, n) + (n < s.length || STT * 2 & 1 ? '_' : ''));
      }
    }
    else if (ST == 'playing') {
      for (const k in H) if (H[k] > 0) idle = 0;
      if (P.S) go('paused');
      else if (idle > 60) go('title');
      else if (cnO > 0 && cnL == LS) cnF(dt, a || j);
      else {
        // Sub-pasos de ≤17 ms: con delta clampeado a 50 ms nadie atraviesa paredes ni puertas.
        const n = ceil(dt / .017), h = dt / n;
        for (let i = 0; i < n && ST == 'playing'; i++) tick(h);
        if (ST == 'playing' && hp <= 0) die();
        if (ST == 'playing') {
          const c = T < 2.5, v = idle > 50;
          feel(dt); render(); hud();
          v && (pnl(110, 176, 180, 42, 1), hv(9, 61 - idle | 0) && U[5].setText(raw`TOCÁ CUALQUIER TECLA · TÍTULO EN ` + (61 - idle | 0)));
          put();
          uv(0, c); uv(1, c); uv(4, c); uv(2, v); uv(5, v); uv(3, boss && boss.s && boss.s < 5);
        }
      }
    }
    else if (ST == 'paused') P.S ? go('playing') : idle > 60 && go('title');
    else if (ST == 'levelEnd') {
      // Primer botón completa el conteo; el segundo sigue.
      if (a) { if (STT < 3) STT = 3; else if (L < 2) startLevel(L + 1), go('playing'), cnS(); else go('victory') }
      if (ST == 'levelEnd') for (let k = 0; k < 7; k++) {
        const e = LE[k], q = min(1, max(0, STT * 2.5 - k)), v = e[1] * q | 0;
        q > 0 && q < 1 && fx(25);
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
          fx(23); gd();
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
  TX = S.textures.createCanvas('v', 400, 300); CX = TX.context; ID = CX.createImageData(400, 300); B = U32(ID.data.buffer);
  TX.setFilter(Phaser.Textures.FilterMode.NEAREST);
  IM = S.add.image(400, 300, 'v').setScale(2);
  const tx = (x, y, z, o, s = '', c = QW) => S.add.text(x, y, s, {fontFamily: 'monospace', fontStyle: 'bold', fontSize: z + 'px', color: c, stroke: QK, strokeThickness: z < 15 ? 3 : 4}).setOrigin(o, 0);
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
      for (let i = 0; i < 88200; i++) d[i] = random() * 2 - 1;
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
new Phaser.Game({type: Phaser.AUTO, width: 800, height: 600, parent: 'game-root', backgroundColor: QK, scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH}, scene: {create, update}});
/*T*/
})();
