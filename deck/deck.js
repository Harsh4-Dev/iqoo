/* ============================================================
   EduQoo — launch keynote engine
   Autoplaying, keyboard-driven, screen-recordable at 1080p.
   The phone is a single persistent element that morphs between
   slides; only its screen content is swapped.
   ============================================================ */
(function () {
  'use strict';

  const I = window.icon;
  const DD = window.DOODLE;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));

  /* ============================================================
     PHONE SCREENS — static, high-fidelity snapshots of the app
     ============================================================ */
  const SCR = {};

  SCR.home = `
    <button class="conn" data-tier="T0">
      <i class="conn__dot"></i>
      <span class="conn__txt"><b class="conn__t">T0 · Fully offline</b><span class="conn__s">Airplane mode. Nothing degrades.</span></span>
      <span class="conn__cta">tap to test</span>
    </button>
    <div class="rolebar"><div class="seg" data-on="student">
      <div class="seg__thumb"></div>
      <button class="seg__i is-on">Student</button><button class="seg__i">Teacher</button>
    </div></div>
    <div class="greet"><h2>Good evening, Aditi</h2><p>Class 7 · Linear equations</p></div>
    <div class="tiles">
      <div class="tile"><span class="tile__ico tint-amber">${I('camera')}</span><b>Tutor</b><small>Photograph your working. It finds the line you went wrong on.</small><span class="tile__badge">Camera · on-device</span></div>
      <div class="tile"><span class="tile__ico tint-violet">${I('book')}</span><b>Notebook</b><small>Ask today's chapter. Answers cite the line.</small><span class="tile__badge">Grounded</span></div>
      <div class="tile"><span class="tile__ico tint-green">${I('check2')}</span><b>Quiz</b><small>Live from the teacher, or take it offline.</small><span class="tile__badge">On-device</span></div>
      <div class="tile"><span class="tile__ico tint-blue">${I('users')}</span><b>Classroom</b><small>Notes pushed straight to your browser.</small><span class="tile__badge">No install</span></div>
    </div>
    <div class="claim"><b>Everything above runs on this phone.</b> The camera, the solver, the model and the voice. Your homework never leaves the device.</div>`;

  SCR.tutor = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Class 7 · scanned from the page</small></div></div>
    <div class="scan is-done">
      <div class="scan__frame">
        <span class="scan__corners"><i></i><i></i><i></i><i></i></span>
        <div class="scan__ink">
          <span class="is-found">3x + 5 = 20<i class="scan__box"></i><i class="scan__tag">step 1</i></span>
          <span class="is-found is-bad">3x = 25<i class="scan__box"></i><i class="scan__tag">error</i></span>
          <span class="is-found">x = 25/3<i class="scan__box"></i><i class="scan__tag">step 3</i></span>
        </div>
      </div>
      <div class="scan__hud">${I('camera')}<span>3 steps found</span><span class="spacer"></span><b>on-device</b></div>
    </div>
    <div style="height:12px"></div>
    <div class="work">
      <div class="work__h"><span>What we read</span><span class="mono">3 lines</span></div>
      <div class="line"><span class="line__n">1</span><span class="line__x">3x + 5 = 20</span><span class="line__s"><i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i></span></div>
      <div class="line is-bad"><span class="line__n">2</span><span class="line__x">3x = 25</span><span class="line__s">${I('x')}</span></div>
      <div class="casrow"><b>solver</b> (3x + 5 − 20) − (3x − 25)<br>→ <span class="no">10</span> — <b>not</b> equivalent to line 1</div>
      <div class="line is-ok"><span class="line__n">3</span><span class="line__x">x = 25/3</span><span class="line__s">${I('check')}</span></div>
    </div>
    <div class="divider"><span>What went wrong</span><i></i></div>
    <div class="thread"><div class="bub bub--ai">Line <b>2</b> is where it stops being true. Moving the +5 across the equals sign means subtracting 5 from both sides. 20 − 5 is 15.
      <div class="verdict verdict--no">${I('x')}solver · not equivalent</div></div></div>`;

  SCR.confirm = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Confirm what we read</small></div></div>
    <div class="scan is-done">
      <div class="scan__frame">
        <span class="scan__corners"><i></i><i></i><i></i><i></i></span>
        <div class="scan__ink">
          <span class="is-found">3x + 5 = 20<i class="scan__box"></i><i class="scan__tag">step 1</i></span>
          <span class="is-found">3x = 25<i class="scan__box"></i><i class="scan__tag">step 2</i></span>
          <span class="is-found">x = 25/3<i class="scan__box"></i><i class="scan__tag">step 3</i></span>
        </div>
      </div>
      <div class="scan__hud">${I('camera')}<span>3 steps found</span><span class="spacer"></span><b>on-device</b></div>
    </div>
    <div class="divider"><span>Is this what you wrote?</span><i></i></div>
    <div class="ocr">
      <div class="ocr__row"><span class="ocr__n">1</span><span class="ocr__t">3x + 5 = 20</span><span class="ocr__c">97%</span></div>
      <div class="ocr__row"><span class="ocr__n">2</span><span class="ocr__t">3x = 25</span><span class="ocr__c">94%</span></div>
      <div class="ocr__row is-low"><span class="ocr__n">3</span><span class="ocr__t">x = 25/3</span><span class="ocr__c">71%</span></div>
    </div>
    <p class="hint" style="margin-top:12px">${I('shield')}<span>Line 3 came back under the 90% threshold, so it is flagged for the student to check. Nothing is judged until they say we read it right.</span></p>`;

  SCR.player = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Narrated walkthrough · தமிழ்</small></div></div>
    <div class="player">
      <div class="player__stage">
        <div class="player__ghost">3x + 5 − 5 = 20 − 5</div>
        <div class="player__expr">3x = <mark>15</mark></div>
        <div class="player__cc"><b>தமிழ்</b> · இடது பக்கம் 5 நீங்குகிறது. வலது பக்கம் 15 ஆகும், 25 அல்ல.</div>
      </div>
      <div class="player__bar"><i class="is-done"></i><i class="is-done"></i><i class="is-done"></i><i class="is-now" style="--stepms:3400ms"></i></div>
      <div class="player__ctl"><span class="player__pp">${I('pause')}</span><span>Step 4 of 4</span><span class="spacer"></span>
        <span class="wave" style="color:var(--green)"><i></i><i></i><i></i><i></i><i></i><i></i></span><span>TTS</span></div>
    </div>
    <div style="display:flex;gap:5px;margin-top:12px">
      <span class="lang">English</span><span class="lang">हिन्दी</span><span class="lang is-on">தமிழ்</span>
    </div>
    <p class="hint" style="margin-top:10px">${I('shield')}<span>Every frame is rendered from the solver trace, so the animation <b>cannot</b> show a wrong step.</span></p>`;

  SCR.notebook = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Notebook<small>Answers grounded in one source</small></div></div>
    <div class="src is-on"><span class="src__ico">${I('file')}</span>
      <span class="src__m"><b>Integrals</b><small>NCERT Class 12 · Chapter 7 · 42 pages</small></span>
      <span class="src__ok">${I('check')}</span></div>
    <div class="divider"><span>Ask this source</span><i></i></div>
    <div class="thread">
      <div class="bub bub--me">Why do we always add + C?</div>
      <div class="bub bub--ai">Because differentiating kills constants. If F(x) is one antiderivative of f(x), then F(x) + C is an antiderivative for <b>every</b> real C — they all have the same derivative.
        <div><span class="cite">${I('file')}p.288 · chunk 3</span></div>
        <div class="source"><b>NCERT p.288</b> — The constant C cannot be dropped. Since d/dx[F(x) + C] = f(x) for every real value of C, a function has infinitely many antiderivatives.</div>
        <div class="verdict verdict--ok">${I('check')}grounded · confidence 0.94</div>
      </div>
    </div>`;

  SCR.refuse = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Notebook<small>Answers grounded in one source</small></div></div>
    <div class="thread">
      <div class="bub bub--me">Who won the 2011 cricket world cup?</div>
      <div class="bub bub--ai">That isn't in your material — it's a cricket question. This notebook only answers from <b>Integrals</b>. Here's what <i>is</i> in there: antiderivatives, the power rule, substitution, integration by parts and definite limits.
        <div class="verdict verdict--warn">${I('shield')}grounding check failed → refused</div>
      </div>
    </div>
    <p class="hint" style="margin-top:16px">${I('shield')}<span>The claim could not be supported by any retrieved chunk, so the answer was replaced rather than guessed.</span></p>`;

  SCR.quiz = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Quiz<small>Teacher · live</small></div></div>
    <div class="stats3" style="margin-bottom:12px">
      <div class="st"><b>7</b><small>generated</small></div>
      <div class="st"><b style="color:var(--red)">2</b><small>rejected</small></div>
      <div class="st"><b style="color:var(--green-2)">5</b><small>approved</small></div>
    </div>
    <div class="divider"><span>Live · 8 of 8 answered</span><i></i></div>
    <div class="bar" style="margin-bottom:14px"><i style="width:100%;background:var(--green)"></i></div>
    <h3 style="font-size:12px;margin-bottom:8px">Class heatmap — by concept</h3>
    <div class="heat">${[3,3,2,3,3,3,0,1,0,2,1,0,3,2,3,3,2,3,2,3,3,2,3,2,1,0,1,1,2,0,0,1,1,0,2,1]
        .map(v => `<i data-v="${v}" class="is-in"></i>`).join('')}</div>
    <div class="legend"><span><b style="background:var(--green)"></b>solid</span><span><b style="background:var(--amber)"></b>shaky</span><span><b style="background:var(--red)"></b>reteach</span></div>
    <div class="card" style="margin-top:14px;padding:14px;border-radius:14px;border-color:var(--red)">
      <h3 style="font-size:12px;color:var(--red)">Reteach tomorrow</h3>
      <p style="font-size:11px;margin-top:5px">Two thirds of the class missed the <b>constant of integration</b> — the same slip the tutor flagged on line 3.</p>
    </div>`;

  SCR.classroom = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Classroom<small>8 joined · class.local</small></div></div>
    <div class="qr">
      <div class="beacon"><i></i><i></i><i></i><span class="beacon__c">${I('wifi')}</span></div>
      <div class="qr__code" id="deckQR"></div>
      <div class="qr__ssid"><b>EduQoo-7A2C</b><small>scan, or open class.local — no app, no account</small></div>
    </div>
    <div class="divider"><span>Roster</span><i></i></div>
    <div class="roster">${(window.DATA.roster.slice(0, 5)).map((s, i) => `
      <div class="stu"><span class="stu__av" style="background:${s.c}">${s.n[0]}</span>
        <b>${s.n}</b><span class="stu__dev">${s.d}</span><span class="stu__r">${I('check')}</span></div>`).join('')}</div>`;

  SCR.trace = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Class 7 · scanned from the page</small></div></div>
    <div class="work" style="opacity:.3">
      <div class="work__h"><span>Your working</span><span class="mono">3 lines</span></div>
      <div class="line"><span class="line__n">1</span><span class="line__x">3x + 5 = 20</span><span class="line__s"><i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i></span></div>
      <div class="line is-bad"><span class="line__n">2</span><span class="line__x">3x = 25</span><span class="line__s">${I('x')}</span></div>
    </div>`;

  /* the trace sheet is rendered as a real overlay on top of SCR.trace */
  const TRACE_SHEET = `
    <div class="scrim is-on"></div>
    <div class="sheet is-up">
      <div class="sheet__grab"><i></i></div>
      <div class="sheet__h"><b>EduQoo Core<small>local agent runtime · this turn</small></b></div>
      <div class="sheet__body">
        <div class="pass">
          <div class="pass__c pass__c--1"><b>Pass 1</b><small>unconstrained · decides which tools to call</small></div>
          <div class="pass__ar">${I('arrowR')}</div>
          <div class="pass__c pass__c--2"><b>Pass 2</b><small>schema-constrained · formats only</small></div>
        </div>
        <div class="divider"><span>Tool calls</span><i></i></div>
        <div class="tools">
          <div class="tcall"><i class="tcall__d" style="background:#D14C27"></i><b>ink.read</b><span>page.jpg → 3 lines</span><em>610ms</em></div>
          <div class="tcall"><i class="tcall__d" style="background:#D14C27"></i><b>solve.check</b><span>line 2 — broke</span><em>44ms</em></div>
          <div class="tcall"><i class="tcall__d" style="background:var(--red)"></i><b>solve.steps</b><span>3x + 5 = 20</span><em>38ms</em></div>
          <div class="tcall"><i class="tcall__d" style="background:#23955F"></i><b>speak</b><span>தமிழ் · Android TTS</span><em>340ms</em></div>
        </div>
        <div class="divider"><span>Context budget</span><i></i></div>
        <div class="meter">
          <div class="meter__h"><span>window</span><span class="spacer"></span><b>770 / 2048</b></div>
          <div class="meter__t">
            <i style="width:5.8%;background:var(--amber)"></i><i style="width:16.6%;background:var(--violet)"></i>
            <i style="width:14.6%;background:var(--blue)"></i><i style="width:0%;background:var(--green)"></i></div>
        </div>
        <div class="divider"><span>Verifier</span><i></i></div>
        <div class="verdict verdict--no">${I('x')}error located · line 3</div>
      </div>
    </div>`;

  /* ============================================================
     DECK DOODLE SCENES — 1920 x 1080
     ============================================================ */
  const { seed, hRect, hCircle, hLine, hArrow, hX, hTick, txt, path, fill } = DD;
  const DS = {};

  DS.blank = () => '';

  DS.signal = () => {
    seed(101); let s = '';
    // one bar, and a phone held up looking for it
    s += hRect(1330, 470, 120, 210, { r: 14, cls: 'dd--bold', d: 100 });
    s += hLine(1360, 660, 1420, 660, { cls: 'dd--thin', d: 300 });
    [[1490, 620, 34], [1536, 588, 66], [1582, 556, 98], [1628, 524, 130]].forEach((b, i) => {
      const on = i === 0;
      s += hRect(b[0], b[1], 26, b[2], { r: 4, cls: on ? 'dd--amber dd--bold' : 'dd--ghost', d: 400 + i * 140 });
    });
    s += txt(1490, 720, 'one bar', { cls: 'ddt--amber ddt--lg', d: 900 });
    s += hArrow(1520, 750, 1524, 790, 1516, 820, { cls: 'dd--amber', d: 1000 });
    s += txt(1400, 866, 'and a data pack that ran out on the 20th', { cls: 'ddt--sm', d: 1100, anchor: 'middle' });
    // a slow spinner, kept clear of the text block
    s += hCircle(1120, 806, 74, { cls: 'dd--ghost', d: 200 });
    s += path('M1120,732 A74,74 0 0 1 1194,806', { cls: 'dd--amber dd--bold', d: 500 });
    s += txt(1120, 936, 'loading…', { anchor: 'middle', cls: 'ddt--lg', d: 800 });
    return s;
  };

  DS.dial = () => {
    seed(103); let s = '';
    const cx = 1450, cy = 700;
    s += path(`M${cx - 230},${cy} A230,230 0 0 1 ${cx + 230},${cy}`, { cls: 'dd--bold', d: 200 });
    [['T0', 'dd--green'], ['T1', 'dd--amber'], ['T2', 'dd--blue']].forEach((t, i) => {
      const a = Math.PI + (i / 2) * Math.PI;
      s += hLine(cx + Math.cos(a) * 230, cy + Math.sin(a) * 230, cx + Math.cos(a) * 198, cy + Math.sin(a) * 198, { cls: t[1], d: 400 + i * 130 });
      s += txt(cx + Math.cos(a) * 278, cy + Math.sin(a) * 278 + 10, t[0], { anchor: 'middle', cls: 'ddt--lg ' + t[1].replace('dd--', 'ddt--'), d: 500 + i * 130 });
    });
    s += hLine(cx, cy, cx - 162, cy - 162, { cls: 'dd--green dd--bold', d: 860 });
    s += hCircle(cx, cy, 13, { cls: 'dd--green dd--bold', d: 900 });
    s += txt(cx, cy + 78, 'every feature completes here', { anchor: 'middle', cls: 'ddt--green', d: 1000 });
    return s;
  };

  DS.fanout = () => {
    seed(107); let s = '';
    s += hRect(966, 430, 108, 190, { r: 14, cls: 'dd--bold', d: 100 });
    s += txt(1020, 662, 'one phone', { anchor: 'middle', cls: 'ddt--lg ddt--amber', d: 260 });
    const cols = 5, rows = 3;
    for (let i = 0; i < cols * rows; i++) {
      const x = 1230 + (i % cols) * 118, y = 300 + Math.floor(i / cols) * 172;
      s += hRect(x, y, 78, 116, { r: 8, d: 340 + i * 34 });
      if (i % 4 === 0) s += hLine(1080, 520, x, y + 58, { cls: 'dd--thin dd--ghost', d: 700 + i * 20, bow: 40 });
    }
    s += txt(1520, 928, 'thirty browsers · zero installs', { anchor: 'middle', cls: 'ddt--lg', d: 1200 });
    return s;
  };

  DS.ladder = () => {
    seed(109); let s = '';
    const x = 170;
    const rows = [['∫(2x + 3) dx', null], ['= x² + 3x + C', true], ['= x² + 3x', false]];
    rows.forEach((r, i) => {
      const y = 690 + i * 78;
      s += hLine(x, y + 14, x + 380, y + 14, { cls: 'dd--thin dd--ghost', d: 200 + i * 130 });
      s += `<text class="ddm pop" x="${x + 10}" y="${y}" style="--d:${240 + i * 130}ms;font-size:38px">${r[0]}</text>`;
      if (r[1] === true) s += hTick(x + 430, y - 10, 17, { cls: 'dd--green dd--bold', d: 380 + i * 130 });
      if (r[1] === false) {
        s += hX(x + 432, y - 10, 17, { cls: 'dd--red dd--bold', d: 380 + i * 130 });
        s += hCircle(x + 432, y - 10, 40, { cls: 'dd--red dd--bold blink', d: 700 });
        s += hArrow(x + 556, y + 52, x + 522, y + 20, x + 480, y - 4, { cls: 'dd--red', d: 880 });
        s += txt(x + 512, y + 62, 'first break = the error', { cls: 'ddt--red ddt--lg', d: 960 });
      }
    });
    return s;
  };

  DS.pipeline = () => {
    seed(113); let s = '';
    const y = 812;
    s += hRect(180, y - 60, 96, 128, { r: 6, d: 120 });
    s += txt(228, y + 108, 'chapter', { anchor: 'middle', cls: 'ddt--sm', d: 220 });
    s += hArrow(292, y, 322, y - 14, 352, y, { d: 260 });
    for (let i = 0; i < 4; i++) s += hRect(368, y - 66 + i * 36, 104, 28, { r: 4, cls: 'dd--thin', d: 300 + i * 80 });
    s += txt(420, y + 108, 'chunks', { anchor: 'middle', cls: 'ddt--sm', d: 560 });
    s += hArrow(488, y, 518, y - 14, 548, y, { d: 600 });
    for (let i = 0; i < 9; i++) s += hCircle(576 + (i % 3) * 38, y - 44 + Math.floor(i / 3) * 38, 9, { cls: 'dd--violet dd--thin', d: 640 + i * 40 });
    s += txt(614, y + 108, '768-dim', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 940 });
    s += hArrow(700, y, 730, y - 14, 758, y, { d: 980 });
    s += DD.hRect ? '' : '';
    s += path(`M772,${y - 56} a52,22 0 1 0 104,0 a52,22 0 1 0 -104,0 M772,${y - 56} L772,${y + 62} a52,22 0 0 0 104,0 L876,${y - 56}`, { cls: 'dd--violet', d: 1020 });
    s += txt(824, y + 108, 'SQLite · on the phone', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 1120 });
    return s;
  };

  DS.verifier = () => {
    seed(127); let s = '';
    for (let i = 0; i < 7; i++) {
      const x = 1080 + (i % 4) * 168, y = 400 + Math.floor(i / 4) * 190;
      const bad = i >= 5;
      s += hRect(x, y, 138, 140, { r: 10, cls: bad ? 'dd--red dd--bold' : 'dd--green', d: 160 + i * 90 });
      s += hLine(x + 22, y + 48, x + 116, y + 48, { cls: 'dd--thin dd--ghost', d: 200 + i * 90 });
      s += hLine(x + 22, y + 74, x + 92, y + 74, { cls: 'dd--thin dd--ghost', d: 220 + i * 90 });
      s += hLine(x + 22, y + 100, x + 104, y + 100, { cls: 'dd--thin dd--ghost', d: 240 + i * 90 });
      if (bad) s += hX(x + 69, y + 70, 46, { cls: 'dd--red dd--bold', d: 1000 + (i - 5) * 200 });
      else s += hTick(x + 112, y + 122, 13, { cls: 'dd--green dd--bold', d: 500 + i * 90 });
    }
    s += txt(1428, 812, 'a wrong answer key is worse than no quiz', { anchor: 'middle', cls: 'ddt--red ddt--lg', d: 1420 });
    return s;
  };

  DS.hotspot = () => {
    seed(131); let s = '';
    s += path('M120,300 q-26,-48 22,-58 q10,-48 62,-30 q30,-40 74,-4 q52,-12 48,40 q40,18 12,52 z', { cls: 'dd--thin', d: 200 });
    s += hX(210, 286, 40, { cls: 'dd--red dd--bold blink', d: 500 });
    s += txt(46, 400, 'no uplink', { cls: 'ddt--red ddt--lg', d: 640 });
    const cx = 210, cy = 700;
    [110, 168, 226].forEach((r, i) =>
      s += path(`M${cx - r * 0.72},${cy - r * 0.72} A${r},${r} 0 0 1 ${cx + r * 0.72},${cy - r * 0.72}`, { cls: 'dd--green', d: 400 + i * 160 }));
    s += txt(46, cy + 130, 'startLocalOnlyHotspot()', { cls: 'ddt--sm ddt--green', d: 900 });
    s += txt(46, cy + 168, 'mDNS → class.local', { cls: 'ddt--sm', d: 980 });
    return s;
  };

  DS.twopass = () => {
    seed(137); let s = '';
    s += hRect(560, 424, 800, 150, { r: 14, cls: 'dd--red dd--bold', d: 140 });
    s += txt(960, 490, 'one constrained pass', { anchor: 'middle', cls: 'ddt--lg ddt--red', d: 240 });
    s += txt(960, 536, 'tool-call tokens become unreachable', { anchor: 'middle', cls: 'ddt--red', d: 300 });
    s += hX(960, 498, 92, { cls: 'dd--red dd--bold', d: 480 });
    s += hArrow(960, 594, 960, 640, 960, 676, { cls: 'dd--green dd--bold', d: 640 });
    s += txt(1012, 644, 'the fix', { cls: 'ddt--green ddt--lg', d: 700 });
    s += hRect(540, 700, 370, 168, { r: 14, cls: 'dd--blue dd--bold', d: 760 });
    s += txt(725, 768, 'PASS 1', { anchor: 'middle', cls: 'ddt--lg ddt--blue', d: 830 });
    s += txt(725, 814, 'unconstrained · tools run', { anchor: 'middle', cls: 'ddt--sm', d: 870 });
    s += hArrow(918, 784, 954, 772, 992, 784, { d: 900 });
    s += hRect(1002, 700, 380, 168, { r: 14, cls: 'dd--violet dd--bold', d: 940 });
    s += txt(1192, 768, 'PASS 2', { anchor: 'middle', cls: 'ddt--lg ddt--violet', d: 1000 });
    s += txt(1192, 814, 'schema-constrained · formats only', { anchor: 'middle', cls: 'ddt--sm', d: 1040 });
    s += txt(960, 908, 'decoupled, so neither suppresses the other', { anchor: 'middle', cls: 'ddt--lg', d: 1140 });
    return s;
  };

  DS.hardware = () => {
    seed(139); let s = '';
    const pins = [
      [470, 512, 'left',  'On-device model', 'Gemma-2-2B · 4-bit'],
      [470, 666, 'left',  'Constrained decoding', 'grammar-masked at the decoder'],
      [470, 820, 'left',  'Camera + ML Kit OCR', 'board → text, on the device'],
      [1450, 512, 'right', 'Hotspot radio', 'an AP with no uplink'],
      [1450, 666, 'right', 'Foreground service', 'Ktor CIO · the phone is the server'],
      [1450, 820, 'right', 'Android TTS', 'Tamil + Hindi voice packs, offline'],
    ];
    pins.forEach((p, i) => {
      const left = p[2] === 'left';
      const ax = left ? p[0] + 40 : p[0] - 40;
      const mid = 666;
      const bx = left ? 748 : 1172;
      s += hLine(ax, p[1], bx, p[1] + (p[1] < mid ? 70 : p[1] > mid ? -70 : 0), { cls: 'dd--thin dd--amber', d: 300 + i * 120, bow: 26 });
      s += hCircle(bx, p[1] + (p[1] < mid ? 70 : p[1] > mid ? -70 : 0), 9, { cls: 'dd--amber dd--bold', d: 400 + i * 120 });
      s += txt(p[0], p[1] - 10, p[3], { anchor: left ? 'end' : 'start', cls: 'ddt--lg ddt--amber', d: 340 + i * 120 });
      s += txt(p[0], p[1] + 32, p[4], { anchor: left ? 'end' : 'start', cls: 'ddt--sm', d: 400 + i * 120 });
    });
    return s;
  };

  DS.speaker = () => {
    seed(149); let s = '';
    s += path('M300,520 l-46,38 h-34 v54 h34 l46,38 z', { cls: 'dd--green dd--bold', d: 200 });
    [42, 66, 92].forEach((r, i) =>
      s += path(`M${310 + r * 0.2},${585 - r * 0.72} A${r},${r} 0 0 1 ${310 + r * 0.2},${585 + r * 0.72}`, { cls: 'dd--green', d: 400 + i * 150 }));
    s += txt(300, 720, 'தமிழ் · हिन्दी · English', { anchor: 'middle', cls: 'ddt--lg ddt--green', d: 900 });
    s += txt(300, 772, 'rendered from the CAS trace, not generated', { anchor: 'middle', cls: 'ddt--sm', d: 1000 });
    return s;
  };


  /* ---------- NO SERVER : nothing leaves the phone ---------- */
  DS.noserver = () => {
    seed(211); let s = '';
    // a rack and a cloud, both struck out
    s += hRect(210, 640, 150, 210, { r: 10, cls: 'dd--bold', d: 120 });
    for (let i = 0; i < 4; i++) {
      s += hLine(228, 676 + i * 48, 342, 676 + i * 48, { cls: 'dd--thin', d: 200 + i * 70 });
      s += hCircle(330, 676 + i * 48, 6, { cls: 'dd--thin', d: 220 + i * 70 });
    }
    s += txt(285, 894, 'a server somewhere', { anchor: 'middle', cls: 'ddt--sm', d: 520 });
    s += hX(285, 742, 108, { cls: 'dd--red dd--bold', d: 620 });

    s += path('M470,690 q-26,-46 22,-56 q10,-46 60,-28 q30,-40 72,-4 q50,-12 46,38 q40,18 12,50 z', { cls: 'dd--thin', d: 320 });
    s += txt(560, 810, 'an API key', { anchor: 'middle', cls: 'ddt--sm', d: 560 });
    s += hX(560, 706, 62, { cls: 'dd--red dd--bold', d: 700 });

    // the counter
    s += txt(880, 720, '0', { cls: 'ddt--red', d: 820, rot: -4 });
    s += `<text class="ddt ddt--red pop" x="880" y="760" style="--d:820ms;font-size:150px" text-anchor="middle">0</text>`;
    s += txt(880, 826, 'network requests, start to finish', { anchor: 'middle', cls: 'ddt--sm ddt--red', d: 960 });
    s += hCircle(880, 720, 128, { cls: 'dd--red dd--bold', d: 1000 });
    return s;
  };

  /* ---------- MODEL CARD : what is actually loaded ---------- */
  DS.modelcard = () => {
    seed(223); let s = '';
    const x = 1080, y = 250;
    s += hRect(x, y, 620, 640, { r: 18, cls: 'dd--bold', d: 120 });
    s += txt(x + 34, y + 76, 'Gemma-2-2B', { cls: 'ddt--lg ddt--amber', d: 220 });
    s += hLine(x + 30, y + 96, x + 330, y + 98, { cls: 'dd--amber', d: 300 });

    // the stack of layers
    for (let i = 0; i < 9; i++) {
      s += hRect(x + 36, y + 132 + i * 40, 250, 28, { r: 4, cls: 'dd--thin', d: 360 + i * 55 });
    }
    s += txt(x + 161, y + 542, 'transformer blocks', { anchor: 'middle', cls: 'ddt--sm', d: 900 });

    const facts = [
      ['~2B', 'parameters'],
      ['4-bit', 'quantised weights'],
      ['MediaPipe', 'LLM Inference, warm'],
      ['on disk', 'ships with the app'],
    ];
    facts.forEach((f, i) => {
      const fy = y + 150 + i * 100;
      s += txt(x + 330, fy, f[0], { cls: 'ddt--lg ddt--green', d: 480 + i * 110 });
      s += txt(x + 330, fy + 34, f[1], { cls: 'ddt--sm', d: 520 + i * 110 });
    });
    s += hArrow(x + 310, y + 300, x + 322, y + 292, x + 326, y + 286, { cls: 'dd--green', d: 1000 });
    return s;
  };

  /* ---------- SILICON : the decode path ---------- */
  DS.silicon = () => {
    seed(227); let s = '';
    const y = 700;
    const boxes = [
      [150, 210, 'your question', ''],
      [410, 190, 'tokenizer', ''],
      [650, 250, 'MediaPipe LLM', 'graph + grammar mask'],
      [950, 300, 'the accelerator', 'GPU / NPU delegate'],
      [1310, 230, 'tokens back', ''],
    ];
    boxes.forEach((b, i) => {
      const hot = i === 3;
      s += hRect(b[0], y - 60, b[1], b[3] ? 132 : 104, { r: 12, cls: hot ? 'dd--amber dd--bold' : 'dd--bold', d: 140 + i * 150 });
      s += txt(b[0] + b[1] / 2, y - 4, b[2], { anchor: 'middle', cls: hot ? 'ddt--lg ddt--amber' : 'ddt--lg', d: 200 + i * 150 });
      if (b[3]) s += txt(b[0] + b[1] / 2, y + 32, b[3], { anchor: 'middle', cls: 'ddt--sm', d: 240 + i * 150 });
      if (i < boxes.length - 1) {
        const nx = boxes[i + 1][0];
        s += hArrow(b[0] + b[1], y - 8, (b[0] + b[1] + nx) / 2, y - 20, nx - 8, y - 8, { cls: 'dd--thin', d: 300 + i * 150 });
      }
    });
    s += hArcs(1250, 636, [70, 110], { cls: 'dd--amber dd--thin', d: 900 });
    s += txt(1250, 600, 'this is the part the phone is built for', { anchor: 'middle', cls: 'ddt--amber', d: 1000 });

    // thermal honesty — kept clear of the caption track
    s += hRect(152, 796, 30, 78, { r: 15, cls: 'dd--red', d: 1050 });
    s += hCircle(167, 878, 24, { cls: 'dd--red', d: 1080 });
    s += txt(212, 846, 'one inference at a time. we never run the loop twice back to back.', { cls: 'ddt--sm ddt--red', d: 1140 });
    return s;
  };

  /* ---------- GRAMMAR : constrained decoding ---------- */
  DS.grammar = () => {
    seed(229); let s = '';
    const rootX = 1010, rootY = 300;
    s += hCircle(rootX, rootY, 16, { cls: 'dd--bold', d: 120 });
    s += txt(rootX - 40, rootY - 34, 'next token', { anchor: 'end', cls: 'ddt--sm', d: 200 });

    const level = (px, py, n, depth) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const x = px + 190 + depth * 40;
        const y = py - (n - 1) * 90 / 2 + i * 90;
        out.push([x, y, i]);
      }
      return out;
    };

    // depth 1
    const l1 = level(rootX, rootY, 4, 0);
    l1.forEach((p, i) => {
      const ok = i === 1;
      s += hLine(rootX + 18, rootY, p[0] - 16, p[1], { cls: ok ? 'dd--green dd--bold' : 'dd--ghost', d: 240 + i * 90, bow: 14 });
      s += hCircle(p[0], p[1], 15, { cls: ok ? 'dd--green dd--bold' : 'dd--ghost', d: 300 + i * 90 });
      if (!ok) s += hX(p[0], p[1], 22, { cls: 'dd--red', d: 560 + i * 80 });
    });

    // depth 2 off the surviving node
    const src = l1[1];
    const l2 = level(src[0], src[1], 3, 1);
    l2.forEach((p, i) => {
      const ok = i === 2;
      s += hLine(src[0] + 18, src[1], p[0] - 16, p[1], { cls: ok ? 'dd--green dd--bold' : 'dd--ghost', d: 700 + i * 90, bow: 12 });
      s += hCircle(p[0], p[1], 15, { cls: ok ? 'dd--green dd--bold' : 'dd--ghost', d: 760 + i * 90 });
      if (!ok) s += hX(p[0], p[1], 22, { cls: 'dd--red', d: 900 + i * 80 });
    });

    s += txt(1180, 640, 'the grammar deletes the branches', { anchor: 'middle', cls: 'ddt--lg', d: 1120 });
    s += txt(1180, 686, 'before the model can pick one', { anchor: 'middle', cls: 'ddt--lg ddt--red', d: 1180 });
    s += txt(1180, 760, 'a malformed answer is not unlikely.', { anchor: 'middle', cls: 'ddt--sm', d: 1260 });
    s += txt(1180, 796, 'it is unreachable.', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 1320 });
    return s;
  };


  /* ---------- NOTEBOOK : the error, as she wrote it ---------- */
  DS.notebook = () => {
    seed(311); let s = '';
    // ruled page
    s += hRect(1060, 190, 700, 700, { r: 10, cls: 'dd--bold', d: 100 });
    for (let i = 0; i < 8; i++) s += hLine(1092, 300 + i * 78, 1728, 300 + i * 78, { cls: 'dd--thin dd--ghost', d: 180 + i * 40 });
    s += hLine(1150, 200, 1150, 880, { cls: 'dd--thin dd--red', d: 200 });

    s += `<text class="ddt pop" x="1190" y="368" style="--d:520ms;font-size:56px">3x + 5 = 20</text>`;
    s += `<text class="ddt pop" x="1190" y="446" style="--d:820ms;font-size:56px">3x = 25</text>`;
    s += `<text class="ddt pop" x="1190" y="524" style="--d:1000ms;font-size:56px;opacity:.45">x = 25/3</text>`;

    s += hRect(1168, 400, 330, 62, { r: 8, cls: 'dd--red dd--bold', d: 1200 });
    s += hArrow(1620, 500, 1580, 466, 1516, 436, { cls: 'dd--red', d: 1360 });
    s += txt(1630, 520, 'she added the 5', { cls: 'ddt--red ddt--lg', d: 1420 });
    s += txt(1630, 566, 'instead of subtracting it', { cls: 'ddt--sm ddt--red', d: 1480 });
    return s;
  };

  /* ---------- OFFICE KIT : the phone hands the class to the laptop ---------- */
  DS.officekit = () => {
    seed(313); let s = '';
    s += hRect(180, 560, 120, 200, { r: 14, cls: 'dd--bold', d: 120 });
    s += txt(240, 802, 'the phone', { anchor: 'middle', cls: 'ddt--sm', d: 240 });

    s += hArrow(316, 640, 400, 616, 488, 640, { cls: 'dd--amber dd--bold', d: 340 });
    s += txt(402, 594, 'Office Kit', { anchor: 'middle', cls: 'ddt--amber', d: 420 });
    s += txt(402, 690, 'clipboard · file transfer', { anchor: 'middle', cls: 'ddt--sm', d: 470 });

    s += hRect(500, 540, 320, 200, { r: 8, cls: 'dd--bold', d: 520 });
    s += hLine(470, 758, 850, 758, { cls: 'dd--bold', d: 580 });
    for (let i = 0; i < 5; i++) {
      s += hLine(530, 580 + i * 30, 790, 580 + i * 30, { cls: 'dd--thin dd--ghost', d: 640 + i * 60 });
    }
    s += txt(660, 812, 'class-report.csv', { anchor: 'middle', cls: 'ddt--sm ddt--green', d: 940 });
    s += txt(660, 872, 'which concept, how many students, which line', { anchor: 'middle', cls: 'ddt--sm', d: 1000 });
    return s;
  };

  DS.wordmark = () => {
    seed(151); let s = '';
    s += hCircle(960, 540, 330, { cls: 'dd--ghost', d: 200 });
    s += hCircle(960, 540, 400, { cls: 'dd--ghost', d: 420 });
    return s;
  };

  /* ============================================================
     THE SLIDES
     ============================================================ */
  const S = (o) => o;

  const SLIDES = [

    /* ---------------- ACT I — the page she handed in ---------------- */
    S({ mood: 'ink', t: 8500, dd: 'notebook', pos: 'left',
        title: "She wrote<br><mark>3x = 25</mark>.",
        sub: "The line above it was 3x + 5 = 20. She moved the five across and added it instead of subtracting it. Everything after that line is wrong, and none of it is her fault.",
        cc: "She wrote three x equals twenty-five. The line above it was three x plus five equals twenty. She moved the five across and added it instead of subtracting. Everything after that is wrong, and none of it is really her fault." }),

    S({ mood: 'ink', t: 7500, dd: 'notebook', pos: 'left',
        title: "Nobody in the room<br>has time to<br><em>notice.</em>",
        sub: "Sixty students, one teacher, forty minutes. The book comes back with a cross on the answer and no mark against line two.",
        cc: "And nobody in that room has time to notice. Sixty students, one teacher, forty minutes. The book comes back with a cross next to the answer and no mark against line two." }),

    S({ mood: 'paper', t: 7500, dd: 'dial', pos: 'left',
        kicker: 'And no, you cannot just call an API',
        title: "One bar. And a data<br>pack that ran out<br>on <mark>the twentieth</mark>.",
        sub: "Anything that needs a round trip is a tutor that spins. So we built for the bottom of the bar.",
        cc: "And no, you cannot just call an API here. One bar of signal, and a data pack that ran out on the twentieth. Anything that needs a round trip is a tutor that spins. So we built for the bottom of the bar and treated signal as a bonus." }),

    S({ mood: 'paper', t: 7000, dd: 'fanout', pos: 'left',
        kicker: 'And then the maths of it',
        title: "A school can buy<br><mark>one</mark> good phone.",
        sub: "Not thirty. So we stopped designing for thirty devices and started designing for one.",
        cc: "And then there's the maths of it. A government school can buy one good phone. It can't buy thirty. So we stopped designing for thirty devices and started designing for one." }),

    /* ---------------- ACT II — the reveal ---------------- */
    S({ mood: 'ink', t: 6000, dd: 'wordmark', pos: 'center',
        wordmark: true,
        cc: "This is EduQoo." }),

    S({ mood: 'ink', t: 8000, dd: 'hotspot', pos: 'right', phone: { s: 0.86, x: -430, y: 0 }, scr: 'home',
        kicker: 'EduQoo',
        title: "It reads the page,<br>finds the wrong step,<br><em>and says why.</em>",
        sub: "A math tutor that runs entirely on one iQOO phone. Camera in, spoken correction out, in the child's own language.",
        cc: "It reads the page, finds the wrong step, and says why. A math tutor running entirely on one iQOO phone. Camera in, spoken correction out, in the child's own language." }),

    /* ---------------- ACT III — the model lives here ---------------- */
    S({ mood: 'ink', t: 8500, dd: 'noserver', pos: 'tl', phone: { s: 0.85, x: 470, y: 0 }, scr: 'home',
        kicker: 'Before anything else',
        title: "No server.<br>No API key.<br><mark>No request.</mark>",
        cc: "Before anything else, the thing that makes this different. There is no server. No API key. Not one network request. Everything you are about to see happens between the camera and the silicon." }),

    S({ mood: 'paper', t: 9000, dd: 'modelcard', pos: 'left',
        kicker: "What's actually running",
        title: "Two billion<br>parameters, sitting<br><mark>on the phone</mark>.",
        sub: "Gemma-2-2B, quantised to four bits, loaded through MediaPipe LLM Inference and kept warm. The weights ship inside the APK.",
        cc: "What's actually running is Gemma-2-2B. Two billion parameters, quantised to four bits, loaded through MediaPipe LLM Inference and kept warm in memory so the first explanation isn't the slow one. The weights ship inside the APK. Nothing gets fetched, ever." }),

    S({ mood: 'ink', t: 9500, dd: 'silicon', pos: 'tl',
        kicker: 'Where the maths actually happens',
        title: "The phone isn't the<br>screen here.<br><em>It's the compute.</em>",
        cc: "And this is where the iQOO earns its place. The phone isn't the screen in this project, it's the compute. Inference targets the Snapdragon NPU, so decoding runs on silicon built for it instead of grinding the CPU flat. That's the difference between an answer in two seconds and an answer in twenty. It's also why we only ever run one inference at a time. Heat is real." }),

    S({ mood: 'ink', t: 9500, dd: 'grammar', pos: 'left',
        kicker: 'The trick that makes 2B enough',
        title: "We don't ask nicely.<br>We make the wrong<br>token <mark>unreachable</mark>.",
        cc: "Now, two billion parameters is small. Here's the trick that makes it enough. We don't ask the model nicely for a valid answer. We mask the decoder to a grammar as it goes, so the wrong token is deleted before it can be picked. A malformed answer isn't unlikely, it's unreachable." }),

    S({ mood: 'ink', t: 9000, dd: 'twopass', pos: 'tl',
        kicker: 'And the bug that comes with it',
        title: "Turn both on and it<br><mark>stops calling tools</mark>.",
        cc: "Except switching that on breaks something else, quietly. Constrain the grammar and enable tool calling in the same pass, and the mask puts the tool tokens out of reach. The model stops calling tools. The output still validates, so nothing looks wrong. It has just stopped working. So we split it in two. Pass one runs the tools, pass two writes the answer." }),

    /* ---------------- ACT IV — the MVP path ---------------- */
    S({ mood: 'paper', t: 9000, dd: 'blank', pos: 'left', phone: { s: 0.96, x: 478, y: 0 }, scr: 'confirm',
        kicker: 'Stage one — point it at the page',
        title: "It reads the ink,<br>then <mark>asks</mark>.",
        sub: "ML Kit reads each handwritten step on the device and returns a confidence. Line three came back at 71%, under the threshold, so it stops and asks her to confirm before it judges anything.",
        cc: "So. Point it at the page. ML Kit reads each handwritten step on the device and hands back a confidence for every line. Line three came back at seventy-one per cent, under our threshold, so it stops and asks her to confirm. The machine never judges work it isn't sure it read." }),

    S({ mood: 'ink', t: 8500, dd: 'blank', pos: 'left', phone: { s: 1.7, x: 600, y: 250 }, scr: 'tutor',
        kicker: 'Stage two — the whole product, really',
        title: "A red boundary,<br>on <mark>line two</mark>.",
        sub: "Not a cross next to the answer. A boundary drawn on the exact step where her working stopped being true.",
        cc: "And there it is. Not a cross next to the answer — a red boundary drawn on the exact step where her working stopped being true. Line two. That is the whole product." }),

    S({ mood: 'paper', t: 9000, dd: 'ladder', pos: 'tl', phone: { s: 0.94, x: 480, y: 0 }, scr: 'tutor',
        kicker: 'And notice who decided that',
        title: "A solver did.<br><em>Not the model.</em>",
        hand: "we're not going to hallucinate at a child learning maths",
        cc: "And notice who decided that. A symbolic solver, running on the phone, asking one question per line — is this step still equal to the one above it. The language model never gets a vote on whether the maths is right. It only writes the sentence that explains it. We're not going to hallucinate at a child learning maths." }),

    S({ mood: 'paper', t: 8500, dd: 'speaker', pos: 'right', phone: { s: 0.96, x: -170, y: 0 }, scr: 'player',
        kicker: 'Stage three — out loud',
        title: "In <mark>Tamil</mark>.<br>Because that's the<br>language she thinks in.",
        sub: "The model turns the solver trace into one sentence per step. Android TTS speaks it from a voice pack on the device. Airplane mode is still on.",
        cc: "Then it says it out loud, in Tamil, because that's the language she thinks in. An explanation in a second language isn't an explanation. The model turns the solver trace into one sentence per step, and Android TTS speaks it from a pack sitting on the device. Airplane mode is still on." }),

    S({ mood: 'ink', t: 9000, dd: 'officekit', pos: 'right',
        kicker: 'And for the teacher',
        title: "Every flagged line<br>is a <mark>data point</mark>.",
        sub: "Each error writes a concept tag to a local record. The class aggregates into a per-concept heatmap, and the CSV lands on the laptop over Office Kit.",
        cc: "And every line we flag is a data point. Each error writes a concept tag to a local record, the class aggregates into a per-concept heatmap, and the teacher pulls the CSV to a laptop over Office Kit. She walks out knowing that two thirds of the room can't transpose a term yet." }),

    /* ---------------- ACT V — the system around it ---------------- */
    S({ mood: 'paper', t: 8000, dd: 'pipeline', pos: 'tl', phone: { s: 0.94, x: 480, y: 0 }, scr: 'notebook',
        kicker: 'The same runtime, pointed elsewhere',
        title: "Answers that cite<br>the line they<br>came from.",
        sub: "Chunked, embedded and indexed on the phone. Four passages from today's chapter, never the whole book.",
        cc: "The same runtime pointed at a chapter instead of a page gives you a notebook you can question. Chunked, embedded and indexed here, and every answer cites the line it came from." }),

    S({ mood: 'warm', t: 7000, dd: 'blank', pos: 'left', phone: { s: 1.75, x: 420, y: 250 }, scr: 'refuse',
        kicker: "And when it doesn't know",
        title: "It says so.",
        sub: "Ask about something outside the material and it tells you that, rather than making something up.",
        hand: "a model you can trust is one that will disappoint you",
        cc: "And when it doesn't know, it says so, rather than making something up. A small model you can actually trust is one that's willing to disappoint you." }),

    S({ mood: 'ink', t: 8000, dd: 'hotspot', pos: 'right', phone: { s: 0.96, x: -400, y: 0 }, scr: 'classroom',
        kicker: 'And when there are thirty of them',
        title: "The phone<br><mark>is</mark> the server.",
        sub: "It raises an access point with nothing behind it and serves the class from its own storage. Students scan a QR and they're in.",
        hand: "no install · no account · no data plan",
        cc: "And when there are thirty of them, the phone raises an access point with nothing behind it and serves the whole class from its own storage. They scan a QR and they're in, in whatever browser they already have." }),

    S({ mood: 'ink', t: 9000, dd: 'blank', pos: 'midl', phone: { s: 0.92, x: -660, y: 0 }, scr: 'trace', sheet: true,
        arch: true,
        kicker: 'Holding it together',
        title: "EduQoo Core.",
        sub: "One runtime. Everything else is a tool registered against it.",
        cc: "Holding all of it together is EduQoo Core. A tool registry, a context budgeter, the two-pass executor, and a verifier that checks everything before a student sees it. Wrapped around a model that never leaves the phone." }),

    S({ mood: 'ink', t: 9500, dd: 'hardware', pos: 'tl2', phone: { s: 0.88, x: 0, y: -10 }, scr: 'home',
        kicker: 'Why it had to be this device',
        title: "Six things.",
        hand: "and not one of them reachable through a wrapper",
        cc: "Which is why it had to be this device, and why it had to be native. The model on the NPU, the masked decoder, the camera, the hotspot radio, the foreground service holding it up, and the offline voice packs. Six things you don't get at arm's length through a wrapper." }),

    /* ---------------- ACT VI — close ---------------- */
    S({ mood: 'paper', t: 8500, dd: 'blank', pos: 'center',
        kicker: 'The published rubric',
        title: "Six dimensions.<br><mark>Two</mark> are measured<br>off the device.",
        sub: "Creative phone use and Office Kit are scored from telemetry, not opinion.",
        chips: ['End product 30%', 'Novelty 20%', 'Phone use 15%', 'Depth 15%', 'Office Kit 10%', 'Demo 10%'],
        cc: "The rubric has six dimensions, and two of them are measured off the device rather than judged. Creative phone use, and Office Kit. Camera, voice and on-device AI are all in the critical path here, so those numbers are real rather than staged." }),

    S({ mood: 'ink', t: 9000, dd: 'wordmark', pos: 'center', wordmark: true,
        closing: "One phone. One page.<br>The exact line she got wrong.",
        hand: "no server, no signal, no account. it was never the point.",
        cc: "One phone. One page. The exact line she got wrong, and why, in the language she thinks in. No server, no signal, no account. It was never the point." }),

    S({ mood: 'paper', t: 6500, dd: 'blank', pos: 'center',
        title: "EduQoo",
        sub: "harsh4-dev.github.io/iqoo",
        chips: ['Tap the prototype', 'Read the architecture', 'github.com/Harsh4-Dev/iqoo'],
        cc: "" }),
  ];

  /* ============================================================
     ENGINE
     ============================================================ */
  let idx = -1, playing = true, timer = null, hud = true, cc = true;

  function fitStage() {
    const s = $('.stage16');
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    s.style.transform = 'scale(' + k + ')';
  }

  function buildDoodles() {
    $('#ddstage').innerHTML = Object.keys(DS).map(k =>
      `<div class="dscene" data-k="${k}"><svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
         <g class="rough">${DS[k]()}</g></svg></div>`).join('');
  }

  function slideHTML(s) {
    if (s.wordmark) {
      return `<div class="block" data-pos="center">
        <div class="ln mark-lock" style="--d:120ms"><span class="mark-dot"></span><span class="mark-word">EduQoo</span></div>
        ${s.closing ? `<div class="ln title title--sm" style="--d:620ms;margin-top:52px">${s.closing}</div>` : ''}
        ${s.hand ? `<span class="ln hand-note" style="--d:1100ms">${s.hand}</span>` : ''}
        ${!s.closing ? `<div class="ln sub" style="--d:700ms;margin-top:26px">A local agent runtime for the disconnected classroom.</div>` : ''}
      </div>`;
    }
    let d = 120;
    const line = (html, cls) => { const o = `<div class="ln ${cls}" style="--d:${d}ms">${html}</div>`; d += 260; return o; };
    let out = '<div class="block" data-pos="' + (s.pos || 'center') + '">';
    if (s.kicker) out += line(s.kicker, 'kicker');
    if (s.title)  out += line(s.title, 'title' + (s.pos === 'center' ? ' title--xl' : ''));
    if (s.sub)    out += line(s.sub, 'sub');
    if (s.hand)   out += line(s.hand, 'hand-note');
    if (s.chips)  out += line(s.chips.map((c, i) => `<span class="kchip ${i === 0 ? 'kchip--on' : ''}">${c}</span>`).join(''), 'chiprow');
    out += '</div>';

    if (s.arch) {
      const rows = [
        ['ROUTER', 'local-first · confidence-gated escalation'],
        ['CONTEXT BUDGETER', 'token accounting · attention budget'],
        ['ASSEMBLER', 'system │ core │ retrieved │ scratchpad'],
        ['PLANNER LOOP', 'step limit · timeout · cancel'],
        ['TOOL REGISTRY', 'typed Kotlin schema → JSON Schema'],
        ['TWO-PASS EXECUTOR', 'tools, then schema — never both at once'],
        ['VERIFIER', 'CAS · grounding · confidence'],
        ['MEMORY', 'core │ working │ archival'],
      ];
      out += '<div class="archpanel">' + rows.map((r, i) =>
        `<span class="row" style="--d:${700 + i * 190}ms"><span class="hot">${r[0].padEnd(20)}</span>${r[1]}</span>`).join('') + '</div>';
    }
    return out;
  }

  function show(n) {
    if (n < 0) n = 0;
    if (n >= SLIDES.length) { n = SLIDES.length - 1; playing = false; }
    if (n === idx) return;
    const prev = SLIDES[idx];
    idx = n;
    const s = SLIDES[idx];

    $('.stage16').dataset.mood = s.mood || 'paper';

    /* text */
    const holder = $('#slides');
    holder.innerHTML = `<div class="slide">${slideHTML(s)}</div>`;
    const el = holder.firstElementChild;
    void el.offsetWidth;
    el.classList.add('is-live');

    /* doodles */
    $$('.ddstage .dscene').forEach(x => x.classList.toggle('is-live', x.dataset.k === (s.dd || 'blank')));

    /* the morphing phone */
    const hero = $('#hero');
    const p = s.phone;
    if (p) {
      hero.classList.add('is-on');
      hero.style.setProperty('--hx', (p.x || 0) + 'px');
      hero.style.setProperty('--hy', (p.y || 0) + 'px');
      hero.style.setProperty('--hs', (p.s === undefined ? 1 : p.s));
      hero.style.setProperty('--hr', (p.r || 0) + 'deg');
      const want = (s.scr || 'home') + (s.sheet ? '+sheet' : '');
      if (hero.dataset.scr !== want) {
        hero.dataset.scr = want;
        $('#heroScreen').innerHTML = `<div class="view scr-swap">${SCR[s.scr || 'home']}</div>` + (s.sheet ? TRACE_SHEET : '');
        paintQR();
      }
    } else {
      hero.classList.remove('is-on');
      hero.dataset.scr = '';
    }

    /* captions */
    const c = $('#cc');
    c.classList.toggle('is-off', !cc);
    if (s.cc) { c.textContent = s.cc; c.classList.add('is-on'); }
    else c.classList.remove('is-on');

    $('#counter').textContent = String(idx + 1).padStart(2, '0') + ' / ' + SLIDES.length;
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    const bar = $('#bar');
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    if (!playing) return;
    const t = SLIDES[idx].t || 7000;
    bar.style.transition = 'width ' + t + 'ms linear';
    bar.style.width = '100%';
    timer = setTimeout(() => { if (idx < SLIDES.length - 1) show(idx + 1); else { playing = false; paintHud(); } }, t);
  }

  function paintHud() { $('#pp').textContent = playing ? 'Pause' : 'Play'; }

  function paintQR() {
    const box = $('#deckQR');
    if (!box) return;
    const m = window.QR_MATRIX || [];
    const n = m.length || 1;
    let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x] === '1') cells += `<rect x="${x}" y="${y}" width="1.03" height="1.03"/>`;
    box.innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><g fill="var(--ink)">${cells}</g></svg>`;
  }

  /* ---- controls ---- */
  addEventListener('resize', fitStage);
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { playing = false; paintHud(); show(idx + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { playing = false; paintHud(); const n = idx - 1; idx = -1; show(n); }
    else if (e.key === ' ') { e.preventDefault(); playing = !playing; paintHud(); schedule(); }
    else if (k === 'r') { playing = true; paintHud(); const n = 0; idx = -1; show(n); }
    else if (k === 'h') { hud = !hud; $('.hud').classList.toggle('is-hidden', !hud); $('#counter').classList.toggle('is-hidden', !hud); }
    else if (k === 'c') { cc = !cc; $('#cc').classList.toggle('is-off', !cc); }
    else if (k === 'f') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    const a = b.dataset.k;
    if (a === 'pp') { playing = !playing; paintHud(); schedule(); }
    if (a === 'prev') { playing = false; paintHud(); const n = idx - 1; idx = -1; show(n); }
    if (a === 'next') { playing = false; paintHud(); show(idx + 1); }
    if (a === 'restart') { playing = true; paintHud(); idx = -1; show(0); }
  });

  /* ---- boot ---- */
  fitStage();
  buildDoodles();
  paintHud();
  show(0);
})();
