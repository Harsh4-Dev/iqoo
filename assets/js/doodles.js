/* ============================================================
   EduQoo — the doodle engine
   A hand-drawn scene per app screen, plus the annotation notes
   that flank the phone. Everything is generated, deterministic,
   and draws itself on when its screen becomes active.
   ============================================================ */

/* ---- deterministic wobble ------------------------------------ */
let _seed = 1337;
function rnd() { _seed = (_seed * 1664525 + 1013904223) % 4294967296; return _seed / 4294967296; }
function seed(s) { _seed = s; }
function j(a) { return (rnd() * 2 - 1) * (a === undefined ? 1.6 : a); }

/* ---- primitives ---------------------------------------------- */

/** hand-drawn rounded rectangle */
function hRect(x, y, w, h, o = {}) {
  const r = o.r === undefined ? 8 : o.r, a = o.a === undefined ? 1.4 : o.a;
  const p = [
    `M${x + r + j(a)},${y + j(a)}`,
    `L${x + w - r + j(a)},${y + j(a)}`,
    `Q${x + w + j(a)},${y + j(a)} ${x + w + j(a)},${y + r + j(a)}`,
    `L${x + w + j(a)},${y + h - r + j(a)}`,
    `Q${x + w + j(a)},${y + h + j(a)} ${x + w - r + j(a)},${y + h + j(a)}`,
    `L${x + r + j(a)},${y + h + j(a)}`,
    `Q${x + j(a)},${y + h + j(a)} ${x + j(a)},${y + h - r + j(a)}`,
    `L${x + j(a)},${y + r + j(a)}`,
    `Q${x + j(a)},${y + j(a)} ${x + r + j(a)},${y + j(a)}`,
    'Z',
  ].join(' ');
  return path(p, o);
}

/** hand-drawn circle */
function hCircle(cx, cy, r, o = {}) {
  const a = 1.1, k = r * 0.5523;
  const p = [
    `M${cx + j(a)},${cy - r + j(a)}`,
    `C${cx + k},${cy - r + j(a)} ${cx + r},${cy - k} ${cx + r + j(a)},${cy + j(a)}`,
    `C${cx + r},${cy + k} ${cx + k},${cy + r} ${cx + j(a)},${cy + r + j(a)}`,
    `C${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r + j(a)},${cy + j(a)}`,
    `C${cx - r},${cy - k} ${cx - k},${cy - r} ${cx + j(a)},${cy - r + j(a)}`,
  ].join(' ');
  return path(p, o);
}

/** slightly bowed line */
function hLine(x1, y1, x2, y2, o = {}) {
  const mx = (x1 + x2) / 2 + j(o.bow === undefined ? 3 : o.bow);
  const my = (y1 + y2) / 2 + j(o.bow === undefined ? 3 : o.bow);
  return path(`M${x1 + j()},${y1 + j()} Q${mx},${my} ${x2 + j()},${y2 + j()}`, o);
}

/** curved arrow from (x1,y1) to (x2,y2), bending through (cx,cy) */
function hArrow(x1, y1, cx, cy, x2, y2, o = {}) {
  const head = o.head === undefined ? 11 : o.head;
  // tangent at the end of a quadratic bezier points from control to end
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const s = 0.42;
  const h1x = x2 - head * Math.cos(ang - s), h1y = y2 - head * Math.sin(ang - s);
  const h2x = x2 - head * Math.cos(ang + s), h2y = y2 - head * Math.sin(ang + s);
  return path(`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, o) +
         path(`M${h1x},${h1y} L${x2},${y2} L${h2x},${h2y}`, Object.assign({}, o, { noDraw: false }));
}

/** an X mark */
function hX(cx, cy, r, o = {}) {
  return path(`M${cx - r + j()},${cy - r + j()} L${cx + r + j()},${cy + r + j()}`, o) +
         path(`M${cx + r + j()},${cy - r + j()} L${cx - r + j()},${cy + r + j()}`, o);
}

/** a tick mark */
function hTick(cx, cy, r, o = {}) {
  return path(`M${cx - r},${cy} L${cx - r * 0.15},${cy + r * 0.8} L${cx + r * 1.1},${cy - r}`, o);
}

/** cylinder (a database) */
function hCyl(x, y, w, h, o = {}) {
  const e = w * 0.22;
  return path(`M${x},${y + e} a${w / 2},${e} 0 1 0 ${w},0 a${w / 2},${e} 0 1 0 ${-w},0`, o) +
         path(`M${x},${y + e} L${x},${y + h - e} a${w / 2},${e} 0 0 0 ${w},0 L${x + w},${y + e}`, o);
}

/** a little device (phone / tablet / laptop shape) */
function hDevice(x, y, w, h, o = {}) {
  return hRect(x, y, w, h, Object.assign({ r: 4 }, o)) +
         hLine(x + w * 0.3, y + h - 4, x + w * 0.7, y + h - 4, Object.assign({}, o, { cls: (o.cls || '') + ' dd--thin' }));
}

/** stack of paper sheets */
function hSheets(x, y, w, h, n, o = {}) {
  let s = '';
  for (let i = n - 1; i >= 0; i--) s += hRect(x + i * 5, y - i * 5, w, h, Object.assign({ r: 3 }, o));
  return s;
}

/** signal arcs radiating from a point */
function hArcs(cx, cy, rs, o = {}) {
  return rs.map((r, i) => path(
    `M${cx - r * 0.72},${cy - r * 0.72} A${r},${r} 0 0 1 ${cx + r * 0.72},${cy - r * 0.72}`,
    Object.assign({}, o, { d: (o.d || 0) + i * 110 })
  )).join('');
}

/* ---- element writers ----------------------------------------- */
function path(d, o = {}) {
  const cls = ['dd', o.cls || '', o.noDraw ? '' : 'draw'].filter(Boolean).join(' ');
  const st = o.d ? ` style="--d:${o.d}ms"` : '';
  return `<path class="${cls}" pathLength="1" d="${d}"${st}/>`;
}
function txt(x, y, s, o = {}) {
  const cls = ['ddt', o.cls || '', 'pop'].filter(Boolean).join(' ');
  const st = `style="--d:${o.d || 0}ms${o.o ? ';--o:' + o.o : ''}"`;
  const rot = o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : '';
  const anc = o.anchor ? ` text-anchor="${o.anchor}"` : '';
  return `<text class="${cls}" x="${x}" y="${y}" ${st}${rot}${anc}>${s}</text>`;
}
function mtxt(x, y, s, o = {}) {
  const st = `style="--d:${o.d || 0}ms"`;
  const anc = o.anchor ? ` text-anchor="${o.anchor}"` : '';
  return `<text class="ddm pop ${o.cls || ''}" x="${x}" y="${y}" ${st}${anc}>${s}</text>`;
}
function fill(d, o = {}) {
  return `<path class="ddf ${o.cls || ''} pop" d="${d}" style="--d:${o.d || 0}ms"/>`;
}

/* ==============================================================
   SCENES — background sketch per app screen
   Coordinate space: 1360 x 940
   Free zones (the rails sit on top of x 150-470 / 890-1210, y 40-560):
     bottom-left   x  40-470   y 580-920
     bottom-right  x 900-1320  y 580-920
     far edges     x  20-140   /  x 1225-1340
   ============================================================== */

const SCENES = {};

/* ---------- HOME : one phone, a whole classroom ---------- */
SCENES.home = () => {
  seed(11); let s = '';

  // bottom-left: the classroom of borrowed devices
  s += txt(60, 622, 'thirty browsers,', { cls: 'ddt--lg', d: 120 });
  s += txt(60, 654, 'zero installs', { cls: 'ddt--lg ddt--amber', d: 220 });
  s += hLine(58, 666, 250, 668, { cls: 'dd--amber dd--bold', d: 320 });

  const devs = [[70, 700], [150, 700], [230, 700], [310, 700], [110, 790], [190, 790], [270, 790]];
  devs.forEach((p, i) => { s += hDevice(p[0], p[1], 52, 74, { d: 420 + i * 70 }); });
  devs.forEach((p, i) => {
    s += hLine(p[0] + 26, p[1] - 6, 470, 470, { cls: 'dd--thin dd--ghost', d: 700 + i * 60, bow: 26 });
  });
  s += txt(96, 892, 'cheap Android · old iPhone · a laptop', { cls: 'ddt--sm', d: 1000 });

  // bottom-right: the connectivity dial
  s += txt(950, 618, 'connectivity is a dial,', { cls: 'ddt--lg', d: 160 });
  s += txt(950, 650, 'not a switch', { cls: 'ddt--lg ddt--green', d: 260 });
  const cx = 1090, cy = 800;
  s += path(`M${cx - 130},${cy} A130,130 0 0 1 ${cx + 130},${cy}`, { cls: 'dd--bold', d: 400 });
  [[-130, 'T0'], [0, 'T1'], [130, 'T2']].forEach((p, i) => {
    const a = Math.PI + (i / 2) * Math.PI;
    const x1 = cx + Math.cos(a) * 130, y1 = cy + Math.sin(a) * 130;
    const x2 = cx + Math.cos(a) * 112, y2 = cy + Math.sin(a) * 112;
    s += hLine(x1, y1, x2, y2, { d: 520 + i * 90 });
    s += txt(cx + Math.cos(a) * 158, cy + Math.sin(a) * 158 + 6, p[1], { anchor: 'middle', d: 600 + i * 90, cls: i === 0 ? 'ddt--green' : '' });
  });
  s += hLine(cx, cy, cx - 92, cy - 92, { cls: 'dd--green dd--bold', d: 760 });
  s += hCircle(cx, cy, 7, { cls: 'dd--green dd--bold', d: 800 });
  s += txt(cx - 6, cy + 40, 'every feature completes here', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 900 });

  // no-internet cloud, top left edge
  s += path('M40,150 q-14,-26 12,-32 q6,-26 34,-16 q16,-22 40,-2 q28,-6 26,22 q22,10 6,28 z', { cls: 'dd--thin', d: 200 });
  s += hX(80, 140, 15, { cls: 'dd--red dd--bold blink', d: 500 });
  s += txt(30, 196, 'no uplink', { cls: 'ddt--sm ddt--red', d: 620 });

  // pointing arrows
  s += hArrow(480, 300, 500, 250, 520, 236, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 300, 860, 250, 840, 236, { cls: 'dd--amber', d: 1000 });
  return s;
};

/* ---------- TUTOR : equivalence, not methods ---------- */
SCENES.tutor = () => {
  seed(23); let s = '';

  // bottom-left: the ladder of lines
  s += txt(58, 618, 'check line n against', { cls: 'ddt--lg', d: 120 });
  s += txt(58, 650, 'line n − 1', { cls: 'ddt--lg ddt--amber', d: 200 });

  const rows = [
    ['∫(2x + 3) dx', null, 0],
    ['= x² + 3x + C', true, 1],
    ['= x² + 3x', false, 2],
  ];
  rows.forEach((r, i) => {
    const y = 700 + i * 56;
    s += hLine(66, y + 8, 300, y + 8, { cls: 'dd--thin dd--ghost', d: 300 + i * 90 });
    s += mtxt(70, y, r[0], { d: 340 + i * 90 });
    if (r[1] === true)  s += hTick(322, y - 6, 9, { cls: 'dd--green dd--bold', d: 420 + i * 90 });
    if (r[1] === false) {
      s += hX(324, y - 6, 9, { cls: 'dd--red dd--bold', d: 420 + i * 90 });
      s += hCircle(324, y - 6, 21, { cls: 'dd--red dd--bold blink', d: 560 });
      s += hArrow(420, y + 30, 392, y + 12, 352, y - 2, { cls: 'dd--red', d: 700 });
      s += txt(400, y + 52, 'first break', { cls: 'ddt--red', d: 760 });
      s += txt(400, y + 76, '= the error', { cls: 'ddt--red', d: 820 });
    }
  });
  s += txt(60, 886, 'one code path — arithmetic to triple integrals', { cls: 'ddt--sm', d: 900 });

  // bottom-right: who decides
  s += txt(940, 616, 'the model phrases it.', { cls: 'ddt--lg', d: 140 });
  s += txt(940, 648, 'a CAS decides it.', { cls: 'ddt--lg ddt--red', d: 240 });

  s += hRect(930, 690, 130, 62, { d: 360 });
  s += txt(995, 720, 'Gemma-2-2B', { anchor: 'middle', cls: 'ddt--sm', d: 440 });
  s += txt(995, 740, '4-bit', { anchor: 'middle', cls: 'ddt--sm', d: 470 });

  s += hRect(1140, 690, 150, 62, { cls: 'dd--red dd--bold', d: 420 });
  s += txt(1215, 718, 'Symja CAS', { anchor: 'middle', cls: 'ddt--red', d: 500 });
  s += txt(1215, 740, 'ground truth', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 540 });

  s += hArrow(1064, 720, 1102, 712, 1136, 720, { d: 560 });
  s += txt(1100, 700, 'asks', { anchor: 'middle', cls: 'ddt--sm', d: 620 });
  s += hArrow(1215, 758, 1180, 800, 1080, 812, { cls: 'dd--red', d: 680 });
  s += txt(1050, 848, 'we will not hallucinate', { anchor: 'middle', cls: 'ddt--red', d: 760 });
  s += txt(1050, 872, 'at a child learning calculus', { anchor: 'middle', cls: 'ddt--red', d: 820 });

  // speaker + waveform, right edge
  s += path('M1258,320 l-22,18 h-16 v26 h16 l22,18 z', { cls: 'dd--green', d: 700 });
  s += hArcs(1262, 351, [16, 26, 36], { cls: 'dd--green dd--thin', d: 800 });
  s += txt(1226, 420, 'தமிழ் · हिन्दी', { cls: 'ddt--green', d: 960 });

  s += hArrow(480, 320, 502, 268, 522, 252, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 330, 858, 280, 838, 262, { cls: 'dd--amber', d: 980 });
  return s;
};

/* ---------- NOTEBOOK : grounded or silent ---------- */
SCENES.notebook = () => {
  seed(37); let s = '';

  // bottom-left: the pipeline
  s += txt(56, 618, 'the whole book never', { cls: 'ddt--lg', d: 120 });
  s += txt(56, 650, 'enters the window', { cls: 'ddt--lg ddt--violet', d: 220 });

  s += hSheets(64, 726, 56, 74, 3, { d: 320 });
  s += txt(90, 826, 'chapter', { anchor: 'middle', cls: 'ddt--sm', d: 400 });

  s += hArrow(136, 748, 158, 740, 178, 748, { d: 420 });
  for (let i = 0; i < 4; i++) s += hRect(186, 706 + i * 24, 62, 18, { r: 3, cls: 'dd--thin', d: 470 + i * 60 });
  s += txt(216, 826, 'chunks', { anchor: 'middle', cls: 'ddt--sm', d: 620 });

  s += hArrow(258, 748, 280, 740, 300, 748, { d: 660 });
  seed(41);
  for (let i = 0; i < 9; i++) s += hCircle(316 + (i % 3) * 22, 718 + Math.floor(i / 3) * 22, 5, { cls: 'dd--violet dd--thin', d: 700 + i * 34 });
  s += txt(338, 826, '768-dim', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 860 });

  s += hArrow(388, 748, 410, 740, 428, 748, { d: 880 });
  s += hCyl(436, 706, 58, 82, { cls: 'dd--violet', d: 920 });
  s += txt(465, 826, 'SQLite', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 990 });

  // bottom-right: refusal is a feature
  s += txt(946, 616, 'if it is not in your', { cls: 'ddt--lg', d: 160 });
  s += txt(946, 648, 'material, it says so', { cls: 'ddt--lg ddt--red', d: 260 });

  s += hRect(944, 692, 180, 54, { cls: 'dd--ghost', d: 380 });
  s += txt(1034, 725, 'made-up answer', { anchor: 'middle', cls: 'ddt--sm', d: 440 });
  s += hX(1034, 719, 32, { cls: 'dd--red dd--bold', d: 520 });

  s += hRect(1152, 692, 160, 54, { cls: 'dd--green', d: 460 });
  s += txt(1232, 718, '"that is not in', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 540 });
  s += txt(1232, 736, 'your chapter"', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 570 });

  s += txt(1130, 800, 'refusing is a feature', { anchor: 'middle', cls: 'ddt--green', d: 660 });
  s += hLine(1010, 812, 1250, 814, { cls: 'dd--green', d: 720 });
  s += txt(1130, 850, 'every claim is checked against the', { anchor: 'middle', cls: 'ddt--sm', d: 800 });
  s += txt(1130, 872, 'retrieved chunk before you see it', { anchor: 'middle', cls: 'ddt--sm', d: 840 });

  // magnifier, left edge
  s += hCircle(74, 168, 26, { cls: 'dd--violet', d: 300 });
  s += hLine(93, 187, 116, 210, { cls: 'dd--violet dd--bold', d: 420 });
  s += txt(30, 240, 'top-k = 4', { cls: 'ddt--sm ddt--violet', d: 520 });

  s += hArrow(480, 300, 502, 252, 522, 238, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 320, 858, 270, 838, 254, { cls: 'dd--amber', d: 980 });
  return s;
};

/* ---------- QUIZ : broadcast + the verifier ---------- */
SCENES.quiz = () => {
  seed(53); let s = '';

  // bottom-left: one push, thirty screens
  s += txt(58, 618, 'one push,', { cls: 'ddt--lg', d: 120 });
  s += txt(58, 650, 'thirty screens', { cls: 'ddt--lg ddt--amber', d: 200 });

  s += hDevice(70, 700, 46, 78, { cls: 'dd--bold', d: 300 });
  s += hArcs(93, 700, [34, 52, 70], { cls: 'dd--amber dd--thin', d: 380 });
  s += txt(93, 800, 'teacher', { anchor: 'middle', cls: 'ddt--sm', d: 500 });

  for (let i = 0; i < 6; i++) {
    const x = 220 + (i % 3) * 76, y = 690 + Math.floor(i / 3) * 82;
    s += hRect(x, y, 58, 46, { r: 4, d: 520 + i * 70 });
    s += hLine(x + 10, y + 32, x + 40, y + 32, { cls: 'dd--thin dd--ghost', d: 560 + i * 70 });
    s += hLine(126, 736, x, y + 22, { cls: 'dd--thin dd--amber flow', d: 620 + i * 60, bow: 18, noDraw: true });
  }
  s += txt(280, 856, 'SSE · every answer streams back', { anchor: 'middle', cls: 'ddt--sm', d: 900 });

  // bottom-right: verifier throws questions away
  s += txt(940, 616, 'seven generated.', { cls: 'ddt--lg', d: 160 });
  s += txt(940, 648, 'five survive.', { cls: 'ddt--lg ddt--green', d: 250 });

  for (let i = 0; i < 7; i++) {
    const x = 936 + (i % 4) * 92, y = 692 + Math.floor(i / 4) * 80;
    const bad = i === 5 || i === 6;
    s += hRect(x, y, 74, 60, { r: 5, cls: bad ? 'dd--red' : 'dd--green', d: 360 + i * 70 });
    s += hLine(x + 12, y + 22, x + 56, y + 22, { cls: 'dd--thin dd--ghost', d: 400 + i * 70 });
    s += hLine(x + 12, y + 34, x + 44, y + 34, { cls: 'dd--thin dd--ghost', d: 420 + i * 70 });
    if (bad) s += hX(x + 37, y + 30, 22, { cls: 'dd--red dd--bold', d: 900 + (i - 5) * 140 });
    else     s += hTick(x + 58, y + 52, 7, { cls: 'dd--green dd--bold', d: 620 + i * 70 });
  }
  s += txt(1130, 858, 'CAS disagreed with the answer key.', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 1180 });
  s += txt(1130, 880, 'a wrong key is worse than no quiz.', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 1240 });

  // heatmap sketch, right edge
  seed(59);
  for (let i = 0; i < 9; i++) {
    const c = ['dd--green', 'dd--green', 'dd--amber', 'dd--red'][i % 4];
    s += hRect(1244 + (i % 3) * 26, 150 + Math.floor(i / 3) * 26, 20, 20, { r: 3, cls: c, d: 400 + i * 55 });
  }
  s += txt(1240, 250, 'what to reteach', { cls: 'ddt--sm', d: 800 });

  s += hArrow(480, 310, 502, 262, 522, 246, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 300, 858, 254, 838, 240, { cls: 'dd--amber', d: 980 });
  return s;
};

/* ---------- CLASSROOM : the phone is the server ---------- */
SCENES.classroom = () => {
  seed(71); let s = '';

  // bottom-left: hotspot with nothing behind it
  s += txt(56, 618, 'an access point with', { cls: 'ddt--lg', d: 120 });
  s += txt(56, 650, 'nothing behind it', { cls: 'ddt--lg ddt--green', d: 220 });

  s += hDevice(86, 700, 52, 86, { cls: 'dd--bold', d: 320 });
  s += hArcs(112, 700, [40, 62, 84], { cls: 'dd--green', d: 400 });
  s += txt(112, 812, 'LocalOnlyHotspot()', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 620 });

  s += path('M262,690 q-14,-26 12,-32 q6,-26 34,-16 q16,-22 40,-2 q28,-6 26,22 q22,10 6,28 z', { cls: 'dd--thin', d: 520 });
  s += hX(312, 682, 22, { cls: 'dd--red dd--bold blink', d: 700 });
  s += txt(312, 742, 'the internet', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 780 });
  s += txt(312, 764, 'was never invited', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 820 });

  s += hRect(250, 792, 130, 56, { r: 6, d: 860 });
  s += txt(315, 818, 'class.local', { anchor: 'middle', cls: 'ddt--sm', d: 920 });
  s += txt(315, 838, 'mDNS · no IP to type', { anchor: 'middle', cls: 'ddt--sm', d: 950 });

  // bottom-right: QR -> browsers -> receipts
  s += txt(944, 616, 'scan. join. done.', { cls: 'ddt--lg', d: 160 });
  s += txt(944, 648, 'no app, no account', { cls: 'ddt--lg ddt--amber', d: 250 });

  s += hRect(940, 690, 76, 76, { r: 5, cls: 'dd--bold', d: 360 });
  seed(73);
  for (let i = 0; i < 14; i++) {
    const gx = 948 + Math.floor(rnd() * 5) * 13, gy = 698 + Math.floor(rnd() * 5) * 13;
    s += fill(`M${gx},${gy} h10 v10 h-10 z`, { d: 420 + i * 26 });
  }
  s += txt(978, 786, 'QR', { anchor: 'middle', cls: 'ddt--sm', d: 700 });

  s += hArrow(1024, 726, 1048, 718, 1070, 726, { d: 700 });
  for (let i = 0; i < 4; i++) {
    s += hRect(1082 + (i % 2) * 74, 690 + Math.floor(i / 2) * 62, 62, 48, { r: 4, d: 740 + i * 80 });
    s += hLine(1090 + (i % 2) * 74, 702 + Math.floor(i / 2) * 62, 1136 + (i % 2) * 74, 702 + Math.floor(i / 2) * 62, { cls: 'dd--thin dd--ghost', d: 780 + i * 80 });
    s += hTick(1252 + (i % 2) * 0, 700 + i * 26, 6, { cls: 'dd--green', d: 1000 + i * 90 });
  }
  s += txt(1128, 830, 'delivery receipts', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 1120 });
  s += txt(1128, 866, 'one ₹40k phone instead of thirty', { anchor: 'middle', cls: 'ddt--amber', d: 1180 });

  s += hArrow(480, 300, 502, 250, 522, 236, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 320, 858, 268, 838, 252, { cls: 'dd--amber', d: 980 });
  return s;
};

/* ---------- TRACE : the runtime ---------- */
SCENES.trace = () => {
  seed(89); let s = '';

  // bottom-left: tool suppression + the fix
  s += txt(56, 616, 'schema constraints', { cls: 'ddt--lg', d: 120 });
  s += txt(56, 648, 'suppress tool calls', { cls: 'ddt--lg ddt--red', d: 220 });

  s += hRect(60, 692, 190, 58, { cls: 'dd--red', d: 340 });
  s += txt(155, 716, 'one constrained pass', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 420 });
  s += txt(155, 736, 'tool tokens unreachable', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 460 });
  s += hX(155, 720, 34, { cls: 'dd--red dd--bold', d: 560 });

  s += hArrow(155, 760, 155, 786, 155, 800, { cls: 'dd--green', d: 640 });
  s += txt(180, 786, 'the fix', { cls: 'ddt--sm ddt--green', d: 680 });

  s += hRect(46, 812, 100, 58, { cls: 'dd--blue dd--bold', d: 720 });
  s += txt(96, 838, 'PASS 1', { anchor: 'middle', cls: 'ddt--sm ddt--blue', d: 780 });
  s += txt(96, 857, 'tools run', { anchor: 'middle', cls: 'ddt--sm', d: 810 });
  s += hArrow(150, 840, 170, 834, 190, 840, { d: 840 });
  s += hRect(194, 812, 110, 58, { cls: 'dd--violet dd--bold', d: 860 });
  s += txt(249, 838, 'PASS 2', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 900 });
  s += txt(249, 857, 'schema only', { anchor: 'middle', cls: 'ddt--sm', d: 930 });
  s += txt(320, 846, 'decoupled', { cls: 'ddt--sm', d: 970 });

  // bottom-right: the attention budget
  s += txt(944, 616, 'a 2B model is a finite', { cls: 'ddt--lg', d: 160 });
  s += txt(944, 648, 'attention budget', { cls: 'ddt--lg ddt--violet', d: 250 });

  const segs = [['core', 120, 'dd--amber'], ['retrieved', 300, 'dd--violet'], ['working', 180, 'dd--blue'], ['scratch', 60, 'dd--green']];
  let bx = 940;
  segs.forEach((g, i) => {
    const w = g[1] * 0.62;
    s += hRect(bx, 700, w, 40, { r: 4, cls: g[2], d: 380 + i * 110 });
    s += txt(bx + w / 2, 726, g[0], { anchor: 'middle', cls: 'ddt--sm', d: 440 + i * 110 });
    s += txt(bx + w / 2, 764, g[1] + 't', { anchor: 'middle', cls: 'ddt--sm', o: .5, d: 470 + i * 110 });
    bx += w + 8;
  });
  s += hLine(938, 686, 1352, 688, { cls: 'dd--thin dd--ghost', d: 800 });
  s += txt(1145, 676, 'the window', { anchor: 'middle', cls: 'ddt--sm', d: 840 });

  s += hRect(1230, 800, 110, 56, { r: 5, cls: 'dd--green', d: 880 });
  s += txt(1285, 826, 'scratchpad', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 940 });
  s += txt(1285, 845, 'on disk', { anchor: 'middle', cls: 'ddt--sm', d: 970 });
  s += hArrow(1228, 828, 1180, 820, 1120, 792, { cls: 'dd--green', d: 1000 });
  s += txt(1000, 830, 'notes live outside', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 1060 });
  s += txt(1000, 852, 'the context window', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 1090 });
  s += txt(1000, 890, 'reliability came from spending', { anchor: 'middle', cls: 'ddt--sm', d: 1140 });
  s += txt(1000, 912, 'the budget, not from a bigger model', { anchor: 'middle', cls: 'ddt--sm', d: 1180 });

  // cpu, left edge
  s += hRect(48, 140, 52, 52, { r: 4, cls: 'dd--bold', d: 300 });
  s += hRect(62, 154, 24, 24, { r: 2, cls: 'dd--thin', d: 380 });
  for (let i = 0; i < 3; i++) {
    s += hLine(60 + i * 16, 132, 60 + i * 16, 140, { cls: 'dd--thin', d: 440 + i * 40 });
    s += hLine(60 + i * 16, 192, 60 + i * 16, 200, { cls: 'dd--thin', d: 440 + i * 40 });
  }
  s += txt(30, 226, 'runs on the phone', { cls: 'ddt--sm', d: 620 });

  s += hArrow(480, 300, 502, 252, 522, 238, { cls: 'dd--amber', d: 900 });
  s += hArrow(880, 310, 858, 260, 838, 244, { cls: 'dd--amber', d: 980 });
  return s;
};

/* ==============================================================
   NOTES — the annotations flanking the phone, per screen
   ============================================================== */

const mini = (vb, body) =>
  `<svg class="note__svg" viewBox="${vb}" width="100%" style="max-width:280px" aria-hidden="true"><g class="rough">${body}</g></svg>`;

const NOTES = {

  home: {
    left: [
      { k: 'The user', h: 'A class of sixty. One teacher.',
        p: 'Nobody gets one-to-one feedback. A student with a learning gap copies the answer off the board and never finds out which of their own six lines broke. <b>That</b> is the thing this fixes.',
        hand: 'point the camera at the page →' },
      { k: 'The premise', h: 'Bad internet is the country.',
        p: 'Not "no internet" — that is a niche. One bar, 2G fallback, a data pack that ran out on the 20th. Apps do not fail cleanly there. They hang.',
        svg: () => { seed(5); let s = '';
          s += hLine(14, 62, 268, 62, { cls: 'dd--thin dd--ghost' });
          [['T0', 30, 'dd--green', 22], ['T1', 130, 'dd--amber', 40], ['T2', 230, 'dd--blue', 56]].forEach((t, i) => {
            s += hRect(t[1] - 16, 62 - t[3], 32, t[3], { r: 3, cls: t[2], d: i * 140 });
            s += txt(t[1], 80, t[0], { anchor: 'middle', cls: 'ddt--sm', d: 100 + i * 140 });
          });
          s += txt(150, 20, 'all three complete', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 500 });
          return s; } },
    ],
    right: [
      { k: 'Try it', h: 'This is not a screenshot.',
        p: 'Open <b>Tutor</b> and tap <b>Scan the page</b> — that is the MVP path end to end. Then tap the <b>connectivity strip</b> to cycle T0 → T1 → T2 and watch nothing degrade.',
        hand: 'everything here is live' },
      { k: 'The architecture', h: 'Four surfaces, one runtime.',
        p: 'Tutor, Notebook, Quiz and Classroom are not four apps. They are four sets of tool definitions over the same local agent runtime — which is why a full system fits in a hackathon.',
        svg: () => { seed(9); let s = '';
          ['Tutor', 'Notebook', 'Quiz', 'Class'].forEach((t, i) => {
            s += hRect(8 + i * 68, 8, 58, 30, { r: 4, d: i * 90 });
            s += txt(37 + i * 68, 28, t, { anchor: 'middle', cls: 'ddt--sm', d: 60 + i * 90 });
            s += hLine(37 + i * 68, 40, 140, 64, { cls: 'dd--thin dd--ghost', d: 300 + i * 60 });
          });
          s += hRect(58, 66, 164, 32, { r: 5, cls: 'dd--amber dd--bold', d: 560 });
          s += txt(140, 87, 'one local runtime', { anchor: 'middle', cls: 'ddt--sm ddt--amber', d: 640 });
          return s; } },
    ],
  },

  tutor: {
    left: [
      { k: 'Stage 01–02', h: 'The camera is the front door.',
        p: 'Photograph the working. ML Kit reads each handwritten step on the device and hands back a line plus a confidence. A student who cannot type <b>25/3</b> can still photograph the page they already wrote.',
        hand: 'no typing, no data, no account' },
      { k: 'Stage 03', h: 'Under 90%, it stops and asks.',
        p: 'Every line carries a confidence score. Anything below the threshold halts the pipeline and asks the student to confirm the reading. <b>The machine never judges work it is not sure it read.</b>',
        svg: () => { seed(13); let s = '';
          s += hRect(8, 8, 264, 40, { r: 5, cls: 'dd--green' });
          s += txt(18, 34, '3x + 5 = 20', { cls: 'ddt--sm' });
          s += txt(232, 34, '97%', { cls: 'ddt--sm ddt--green', d: 120 });
          s += hRect(8, 54, 264, 40, { r: 5, cls: 'dd--amber dd--bold', d: 200 });
          s += txt(18, 80, 'x = 25/3', { cls: 'ddt--sm', d: 260 });
          s += txt(232, 80, '71%', { cls: 'ddt--sm ddt--amber', d: 300 });
          s += hArrow(150, 100, 150, 112, 150, 122, { cls: 'dd--amber', d: 420 });
          return s; } },
    ],
    right: [
      { k: 'Stage 04', h: 'Not "is the answer right".',
        p: 'The solver asks one question per line: is step <i>n</i> still algebraically equal to step <i>n−1</i>? The first break is the error, and it gets a red boundary drawn straight onto the photo.',
        svg: () => { seed(17); let s = '';
          s += hRect(8, 6, 190, 26, { r: 4, cls: 'dd--green' });
          s += txt(16, 25, '3x + 5 = 20', { cls: 'ddt--sm' });
          s += hRect(8, 38, 190, 26, { r: 4, cls: 'dd--red dd--bold', d: 180 });
          s += txt(16, 57, '3x = 25', { cls: 'ddt--sm ddt--red', d: 240 });
          s += hX(215, 51, 12, { cls: 'dd--red dd--bold', d: 340 });
          s += txt(240, 57, 'error', { cls: 'ddt--sm ddt--red', d: 400 });
          s += txt(8, 88, '+5 moved across without changing sign', { cls: 'ddt--sm', d: 480 });
          return s; } },
      { k: 'Stage 05', h: 'Then it says it out loud.',
        p: 'Gemma-2-2B gets the solver trace and writes one sentence per step. It phrases; it does not adjudicate. Android TTS speaks it from a voice pack on the device — try the language switch.',
        hand: 'press play ▸' },
    ],
  },

  notebook: {
    left: [
      { k: 'The grounding', h: 'Answers cite the line they came from.',
        p: 'Retrieval pulls the top four chunks from <b>today’s chapter only</b> — never the whole book. Every factual claim is then checked back against those chunks before you see it.',
        hand: 'tap a citation →' },
      { k: 'The honesty', h: 'It would rather refuse.',
        p: 'Ask it something outside the chapter and it says so instead of inventing. Refusing is a feature, and it is the only demo of a small model you can trust.',
        svg: () => { seed(17); let s = '';
          s += hRect(8, 10, 122, 44, { r: 5, cls: 'dd--ghost' });
          s += txt(69, 37, 'plausible', { anchor: 'middle', cls: 'ddt--sm', d: 100 });
          s += hX(69, 32, 24, { cls: 'dd--red dd--bold', d: 260 });
          s += hRect(148, 10, 124, 44, { r: 5, cls: 'dd--green' });
          s += txt(210, 30, 'not in your', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 340 });
          s += txt(210, 47, 'material', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 380 });
          s += txt(140, 80, 'we ship the second one', { anchor: 'middle', cls: 'ddt--sm', d: 520 });
          return s; } },
    ],
    right: [
      { k: 'The retrieval', h: 'Vectors alone lose the formula name.',
        p: 'Pure semantic search fails on exact terms — a proper noun, a date, "ILATE". So an FTS table sits beside the 768-dim vectors and the results are merged. One extra table; it saves you on stage.' },
      { k: 'Runs where?', h: 'All of it, on the phone.',
        p: 'Chunking, embedding, the vector store and the answer. Nothing is uploaded, so nothing needs a network — and a student’s homework never leaves the device.',
        hand: 'flip to T0 and ask again' },
    ],
  },

  quiz: {
    left: [
      { k: 'The generation', h: 'Schema-constrained, not parsed and hoped.',
        p: 'The decoder is grammar-masked to the question schema, so a malformed option is not merely unlikely — it is <b>unreachable</b>. On small edge models that is worth roughly a model generation of reliability.',
        hand: '+0.90 on JSON tasks' },
      { k: 'The review', h: 'A human sees every question first.',
        p: 'The teacher approves or kills each one before a child sees it. Keep this screen in the demo — it reads as responsibility, not weakness.',
        svg: () => { seed(19); let s = '';
          for (let i = 0; i < 5; i++) {
            s += hRect(8 + i * 54, 12, 44, 40, { r: 4, cls: i > 2 ? 'dd--red' : 'dd--green', d: i * 90 });
            if (i > 2) s += hX(30 + i * 54, 32, 14, { cls: 'dd--red dd--bold', d: 400 + i * 60 });
            else s += hTick(30 + i * 54, 32, 9, { cls: 'dd--green dd--bold', d: 260 + i * 60 });
          }
          s += txt(140, 78, 'the verifier kills two of seven', { anchor: 'middle', cls: 'ddt--sm', d: 620 });
          return s; } },
    ],
    right: [
      { k: 'The moment', h: 'It lands on thirty phones at once.',
        p: 'Server-sent events push the question to every joined browser simultaneously; answers stream back and the heatmap builds live. In the demo, the jury answers on their own phones.' },
      { k: 'The output', h: 'A teacher walks out knowing what to reteach.',
        p: 'Grading is local, so results are instant even at T0. The class heatmap is per-concept, not per-score — and it exports as CSV over Office Kit.',
        hand: 'run the live quiz →' },
    ],
  },

  classroom: {
    left: [
      { k: 'The network', h: 'The phone is the server.',
        p: 'A Ktor CIO server in a foreground service, behind an access point raised with <code>startLocalOnlyHotspot()</code>. There is no uplink behind it. That is the point.',
        hand: 'airplane mode stays on' },
      { k: 'The join', h: 'Scan, type a name, you are in.',
        p: 'The SSID and passphrase are encoded in the QR, and mDNS resolves <b>class.local</b> so nobody types an IP. No install, no Play Store, no account, no data plan.',
        svg: () => { seed(23); let s = '';
          s += hRect(8, 10, 52, 52, { r: 4, cls: 'dd--bold' });
          seed(29);
          for (let i = 0; i < 10; i++) s += fill(`M${14 + Math.floor(rnd() * 4) * 11},${16 + Math.floor(rnd() * 4) * 11} h8 v8 h-8 z`, { d: i * 40 });
          s += hArrow(66, 36, 90, 30, 112, 36, { d: 420 });
          s += hRect(120, 14, 44, 44, { r: 4, d: 460 });
          s += hRect(176, 14, 44, 44, { r: 4, d: 520 });
          s += hRect(232, 14, 40, 44, { r: 4, d: 580 });
          s += txt(140, 82, 'any browser in the room', { anchor: 'middle', cls: 'ddt--sm', d: 700 });
          return s; } },
    ],
    right: [
      { k: 'The distribution', h: 'Photograph the board. Push the notes.',
        p: 'Camera → OCR → cleaned notes → PDF → every device in the room refreshes. Delivery receipts show you who actually got it, so nobody is quietly left behind.' },
      { k: 'The strategic bit', h: 'It is also an offline AI server.',
        p: 'One route — <code>POST /v1/chat/completions</code> — makes the phone an OpenAI-compatible endpoint any app on the LAN can call, with no key. That reframes this from an education app to a portable AI server that ships with one.',
        hand: 'Track 06, at the finale' },
    ],
  },

  trace: {
    left: [
      { k: 'The failure mode', h: 'Constraints and tools fight each other.',
        p: 'Turn on JSON-schema constraints and tool calling together and open-weight models stop invoking tools — the grammar mask makes tool-call tokens unreachable while output stays schema-valid. It fails silently.',
        hand: 'this is the 30 seconds that wins a judge' },
      { k: 'The fix', h: 'Transparent two-pass execution.',
        p: 'Pass 1 runs unconstrained and decides <b>which tools to call</b>. Tools execute. Pass 2 runs fully constrained with the results already in context and only <b>formats the answer</b>.',
        svg: () => { seed(31); let s = '';
          s += hRect(8, 12, 110, 42, { r: 5, cls: 'dd--blue dd--bold' });
          s += txt(63, 32, 'PASS 1', { anchor: 'middle', cls: 'ddt--sm ddt--blue', d: 80 });
          s += txt(63, 48, 'tools run', { anchor: 'middle', cls: 'ddt--sm', d: 120 });
          s += hArrow(122, 33, 140, 28, 158, 33, { d: 220 });
          s += hRect(162, 12, 110, 42, { r: 5, cls: 'dd--violet dd--bold', d: 260 });
          s += txt(217, 32, 'PASS 2', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 320 });
          s += txt(217, 48, 'schema only', { anchor: 'middle', cls: 'ddt--sm', d: 360 });
          s += txt(140, 80, 'decoupled, so neither suppresses the other', { anchor: 'middle', cls: 'ddt--sm', d: 480 });
          return s; } },
    ],
    right: [
      { k: 'The budget', h: 'Context length is not the limit. Attention is.',
        p: 'Quality degrades through lost-in-the-middle long before the hard token limit. So: pinned core memory, tool-result clearing, a scratchpad on disk, and remaining-capacity feedback after every call.' },
      { k: 'The verdict', h: 'Nothing reaches a student unchecked.',
        p: 'Maths goes to Symja. Facts go to a grounding check against the retrieved chunk. Structure goes to schema validation. Only low confidence <i>and</i> a genuinely good network escalates to cloud.',
        hand: 'local-first, cloud-optional' },
    ],
  },
};

window.DOODLE = { SCENES, NOTES, mini, seed, rnd, hRect, hCircle, hLine, hArrow, hX, hTick, txt, path, fill };
