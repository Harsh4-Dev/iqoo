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
    <div class="greet"><h2>Good evening, Aditi</h2><p>Class 12 · NCERT Chapter 7</p></div>
    <div class="tiles">
      <div class="tile"><span class="tile__ico tint-amber">${I('chat')}</span><b>Tutor</b><small>Paste your working. It finds the line you went wrong on.</small><span class="tile__badge">CAS-verified</span></div>
      <div class="tile"><span class="tile__ico tint-violet">${I('book')}</span><b>Notebook</b><small>Ask today's chapter. Answers cite the line.</small><span class="tile__badge">Grounded</span></div>
      <div class="tile"><span class="tile__ico tint-green">${I('check2')}</span><b>Quiz</b><small>Live from the teacher, or take it offline.</small><span class="tile__badge">On-device</span></div>
      <div class="tile"><span class="tile__ico tint-blue">${I('users')}</span><b>Classroom</b><small>Notes pushed straight to your browser.</small><span class="tile__badge">No install</span></div>
    </div>
    <div class="claim"><b>Everything above runs on this phone.</b> Your homework never leaves the device.</div>`;

  SCR.tutor = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Class 12 · Ex 7.1</small></div></div>
    <div class="work">
      <div class="work__h"><span>Your working</span><span class="mono">3 lines</span></div>
      <div class="line"><span class="line__n">1</span><span class="line__x">∫(2x + 3) dx</span><span class="line__s"><i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i></span></div>
      <div class="line is-ok"><span class="line__n">2</span><span class="line__x">= x² + 3x + C</span><span class="line__s">${I('check')}</span></div>
      <div class="casrow"><b>Symja</b> Simplify[ D[x^2+3x+C, x] - (2x+3) ]<br>→ <span class="yes">0</span> — equivalent to line 1</div>
      <div class="line is-bad"><span class="line__n">3</span><span class="line__x">= x² + 3x</span><span class="line__s">${I('x')}</span></div>
      <div class="casrow"><b>Symja</b> Simplify[ (x^2+3x) - (x^2+3x+C) ]<br>→ <span class="no">-C</span> — <b>not</b> equivalent to line 2</div>
    </div>
    <div class="divider"><span>What went wrong</span><i></i></div>
    <div class="thread"><div class="bub bub--ai">Line <b>3</b> is where it stops being true. The constant of integration was dropped between line 2 and line 3.
      <div class="verdict verdict--no">${I('x')}Symja · not equivalent</div></div></div>`;

  SCR.player = `
    <div class="vhead"><span class="vhead__back">${I('arrowL')}</span>
      <div class="vhead__t">Tutor<small>Narrated walkthrough</small></div></div>
    <div class="player">
      <div class="player__stage">
        <div class="player__ghost">= x² + 3x</div>
        <div class="player__expr">= x² + 3x + <mark>C</mark></div>
        <div class="player__cc"><b>தமிழ்</b> · இப்போது தொகையீட்டு மாறிலி C ஐச் சேர்க்கவும். வரி மூன்றில் நீங்கள் விட்டது இதுதான்.</div>
      </div>
      <div class="player__bar"><i class="is-done"></i><i class="is-done"></i><i class="is-done"></i><i class="is-now" style="--stepms:3400ms"></i></div>
      <div class="player__ctl"><span class="player__pp">${I('pause')}</span><span>Step 4 of 4</span><span class="spacer"></span>
        <span class="wave" style="color:var(--green)"><i></i><i></i><i></i><i></i><i></i><i></i></span><span>TTS</span></div>
    </div>
    <div style="display:flex;gap:5px;margin-top:12px">
      <span class="lang">English</span><span class="lang">हिन्दी</span><span class="lang is-on">தமிழ்</span>
    </div>
    <p class="hint" style="margin-top:10px">${I('shield')}<span>Every frame is rendered from the CAS solution trace, so the animation <b>cannot</b> show a wrong step.</span></p>`;

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
      <div class="vhead__t">Tutor<small>Class 12 · Ex 7.1</small></div></div>
    <div class="work" style="opacity:.35">
      <div class="work__h"><span>Your working</span><span class="mono">3 lines</span></div>
      <div class="line is-ok"><span class="line__n">2</span><span class="line__x">= x² + 3x + C</span><span class="line__s">${I('check')}</span></div>
      <div class="line is-bad"><span class="line__n">3</span><span class="line__x">= x² + 3x</span><span class="line__s">${I('x')}</span></div>
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
          <div class="tcall"><i class="tcall__d" style="background:#D14C27"></i><b>cas.solveSteps</b><span>∫(2x + 3) dx</span><em>61ms</em></div>
          <div class="tcall"><i class="tcall__d" style="background:#D14C27"></i><b>cas.check</b><span>line 2</span><em>44ms</em></div>
          <div class="tcall"><i class="tcall__d" style="background:var(--red)"></i><b>cas.check</b><span>line 3 — broke</span><em>38ms</em></div>
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
      const y = 706 + i * 82;
      s += hLine(x, y + 14, x + 380, y + 14, { cls: 'dd--thin dd--ghost', d: 200 + i * 130 });
      s += `<text class="ddm pop" x="${x + 10}" y="${y}" style="--d:${240 + i * 130}ms;font-size:38px">${r[0]}</text>`;
      if (r[1] === true) s += hTick(x + 430, y - 10, 17, { cls: 'dd--green dd--bold', d: 380 + i * 130 });
      if (r[1] === false) {
        s += hX(x + 432, y - 10, 17, { cls: 'dd--red dd--bold', d: 380 + i * 130 });
        s += hCircle(x + 432, y - 10, 40, { cls: 'dd--red dd--bold blink', d: 700 });
        s += hArrow(x + 556, y + 52, x + 522, y + 20, x + 480, y - 4, { cls: 'dd--red', d: 880 });
        s += txt(x + 512, y + 92, 'first break = the error', { cls: 'ddt--red ddt--lg', d: 960 });
      }
    });
    return s;
  };

  DS.pipeline = () => {
    seed(113); let s = '';
    const y = 842;
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
    s += txt(824, y + 128, 'SQLite · on the phone', { anchor: 'middle', cls: 'ddt--sm ddt--violet', d: 1120 });
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
    s += path('M240,300 q-26,-48 22,-58 q10,-48 62,-30 q30,-40 74,-4 q52,-12 48,40 q40,18 12,52 z', { cls: 'dd--thin', d: 200 });
    s += hX(330, 286, 40, { cls: 'dd--red dd--bold blink', d: 500 });
    s += txt(330, 400, 'no uplink', { anchor: 'middle', cls: 'ddt--red ddt--lg', d: 640 });
    const cx = 330, cy = 700;
    [110, 168, 226].forEach((r, i) =>
      s += path(`M${cx - r * 0.72},${cy - r * 0.72} A${r},${r} 0 0 1 ${cx + r * 0.72},${cy - r * 0.72}`, { cls: 'dd--green', d: 400 + i * 160 }));
    s += txt(cx, cy + 258, 'startLocalOnlyHotspot()', { anchor: 'middle', cls: 'ddt--green', d: 900 });
    s += txt(cx, cy + 302, 'mDNS → class.local', { anchor: 'middle', cls: 'ddt--sm', d: 980 });
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
    s += txt(960, 956, 'decoupled, so neither suppresses the other', { anchor: 'middle', cls: 'ddt--lg', d: 1140 });
    return s;
  };

  DS.hardware = () => {
    seed(139); let s = '';
    const pins = [
      [470, 452, 'left',  'On-device model', 'Gemma 4 E2B · LiteRT-LM'],
      [470, 638, 'left',  'Constrained decoding', 'grammar-masked at the decoder'],
      [470, 824, 'left',  'Camera + ML Kit OCR', 'board → text, on the device'],
      [1450, 452, 'right', 'Hotspot radio', 'an AP with no uplink'],
      [1450, 638, 'right', 'Foreground service', 'Ktor CIO · the phone is the server'],
      [1450, 824, 'right', 'Android TTS', 'Tamil + Hindi voice packs, offline'],
    ];
    pins.forEach((p, i) => {
      const left = p[2] === 'left';
      const ax = left ? p[0] + 40 : p[0] - 40;
      const mid = 638;
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
    S({ mood: 'ink', t: 8000, dd: 'signal', pos: 'left',
        kicker: '', title: 'It is 6:40 in the<br>evening.',
        sub: 'A village two hours outside Chennai. One bar of signal, and a data pack that ran out on the twentieth.',
        cc: 'It is 6:40 in the evening, in a village two hours outside Chennai. There is one bar of signal, and a data pack that ran out on the twentieth.' }),

    S({ mood: 'ink', t: 7000, dd: 'signal', pos: 'left',
        title: 'The app doesn\'t fail.<br><em>It spins.</em>',
        sub: 'Bad connectivity does not produce an error message. It produces a child watching a loader.',
        cc: 'The app does not fail. It spins. Bad connectivity does not produce an error message — it produces a child watching a loader.' }),

    S({ mood: 'paper', t: 8000, dd: 'dial', pos: 'left',
        kicker: 'The premise',
        title: 'Bad internet is<br><mark>the country</mark>.',
        sub: '"No internet" is a niche. One bar is the national condition. So we treat connectivity as a dial, not a switch — and we build to be best at the bottom of it.',
        cc: 'So here is the premise. "No internet" is a niche. Bad internet is the country. We treat connectivity as a dial, not a switch, and we build to be best at the bottom of it.' }),

    S({ mood: 'paper', t: 7500, dd: 'fanout', pos: 'left',
        kicker: 'The economics',
        title: 'One school can buy<br><mark>one</mark> ₹40,000 phone.',
        sub: 'It cannot buy thirty. So the classroom needs exactly one smart thing in the room — and everything else is a browser it already has.',
        cc: 'And here is the economics. A government school can buy one forty-thousand-rupee phone. It cannot buy thirty. So the room needs exactly one smart thing in it.' }),

    S({ mood: 'ink', t: 6500, dd: 'wordmark', pos: 'center',
        wordmark: true,
        cc: 'This is EduQoo.' }),

    S({ mood: 'ink', t: 8000, dd: 'hotspot', pos: 'right', phone: { s: 0.86, x: -430, y: 0 }, scr: 'home',
        kicker: 'EduQoo',
        title: 'One phone.<br>A whole classroom.<br><em>Zero internet required.</em>',
        sub: 'A tutor, a grounded notebook, a live quiz system and a classroom server — all running on the AI already inside one iQOO phone.',
        cc: 'One phone. A whole classroom. Zero internet required. A tutor, a grounded notebook, a live quiz system and a classroom server — all running on the AI already inside one iQOO phone.' }),

    S({ mood: 'paper', t: 9500, dd: 'ladder', pos: 'tl', phone: { s: 0.94, x: 480, y: 0 }, scr: 'tutor',
        kicker: 'Pillar 01 — StepTutor',
        title: 'It doesn\'t grade.<br>It finds <mark>the break</mark>.',
        sub: 'It does not know methods. It checks whether line n is still equivalent to line n minus one.',
        cc: 'StepTutor does not grade. It finds the break. It does not know methods — it checks whether each line is still equivalent to the line above it. The first place that stops being true is the error.' }),

    S({ mood: 'ink', t: 8500, dd: 'blank', pos: 'left', phone: { s: 1.9, x: 620, y: 300 }, scr: 'tutor',
        kicker: 'The guarantee',
        title: 'A computer algebra<br>system decides.<br><em>The model only<br>phrases it.</em>',
        hand: 'we will not hallucinate at a child learning calculus',
        cc: 'And notice what decided that. A computer algebra system — Symja — running on the phone. The language model never adjudicates the mathematics. It only phrases the explanation. We will not hallucinate at a child learning calculus.' }),

    S({ mood: 'paper', t: 8500, dd: 'speaker', pos: 'right', phone: { s: 0.96, x: -170, y: 0 }, scr: 'player',
        kicker: 'Rendered, not generated',
        title: 'Then it shows you —<br>in <mark>Tamil</mark>.',
        sub: 'Every frame comes from the CAS solution trace, so the animation cannot show a wrong step. Android TTS speaks it. The voice pack is on the device.',
        cc: 'Then it shows you. Every frame of that walkthrough is rendered from the solve trace, so it cannot show a wrong step — and it speaks, in Tamil or Hindi, from a voice pack that lives on the phone.' }),

    S({ mood: 'paper', t: 9000, dd: 'pipeline', pos: 'tl', phone: { s: 0.94, x: 480, y: 0 }, scr: 'notebook',
        kicker: 'Pillar 02 — StudyDesk',
        title: 'Answers that cite<br>the line they<br>came from.',
        sub: 'Chunked, embedded and indexed entirely on the phone. Retrieval pulls four chunks from today\'s chapter — never the whole book.',
        cc: 'The second pillar is StudyDesk. Import a chapter and it is chunked, embedded and indexed entirely on the phone. Every answer cites the line it came from.' }),

    S({ mood: 'warm', t: 7500, dd: 'blank', pos: 'left', phone: { s: 1.75, x: 420, y: 250 }, scr: 'refuse',
        kicker: 'The honesty',
        title: 'Refusing is<br><mark>the feature</mark>.',
        sub: 'Ask it something outside the chapter and it says so, instead of inventing. That is the only version of a small model you can hand to a child.',
        cc: 'And when you ask it something that is not in your material, it says so. It does not invent. Refusing is the feature — it is the only version of a small model you can hand to a child.' }),

    S({ mood: 'paper', t: 8500, dd: 'blank', pos: 'left', phone: { s: 0.96, x: 478, y: 0 }, scr: 'quiz',
        kicker: 'Pillar 03 — ClassTest',
        title: 'Thirty phones.<br>One question.<br><em>Zero round trips.</em>',
        sub: 'The question lands on every joined browser at once. Grading is a local function call, so the heatmap builds instantly — with the radios off.',
        cc: 'The third pillar is ClassTest. One question lands on thirty browsers at once, grading happens locally in each one, and the teacher walks out knowing exactly what to reteach.' }),

    S({ mood: 'paper', t: 7500, dd: 'verifier', pos: 'left',
        kicker: 'The verifier',
        title: 'Seven generated.<br><mark>Five</mark> survive.',
        sub: 'One failed the grounding check against its source line. One had an answer key Symja disagreed with. Both were thrown away before any student saw them.',
        cc: 'Seven questions were generated. Five survived. One failed its grounding check; one had an answer key the CAS disagreed with. A wrong answer key is worse than no quiz.' }),

    S({ mood: 'ink', t: 9000, dd: 'hotspot', pos: 'right', phone: { s: 0.96, x: -400, y: 0 }, scr: 'classroom',
        kicker: 'Pillar 04 — ClassDrop',
        title: 'The phone<br><mark>is</mark> the server.',
        sub: 'An access point with no uplink behind it, an embedded Ktor server, and mDNS resolving class.local. Students scan a QR and land in the class in their browser.',
        hand: 'no install · no account · no data plan',
        cc: 'The fourth pillar is ClassDrop. The phone raises an access point with nothing behind it and serves the client itself. Students scan a QR and land in the class, in a browser. No install. No account. No data plan.' }),

    S({ mood: 'ink', t: 10500, dd: 'blank', pos: 'midl', phone: { s: 0.92, x: -660, y: 0 }, scr: 'trace', sheet: true,
        arch: true,
        kicker: 'The technical heart',
        title: 'EduQoo Core.<br><em>A local agent<br>runtime.</em>',
        cc: 'Underneath all four is the part that actually matters. EduQoo Core — a local agent runtime. A typed tool registry, a context budgeter, a two-pass executor and a verifier layer, running a two-billion-parameter model on the phone\'s own silicon.' }),

    S({ mood: 'ink', t: 10000, dd: 'twopass', pos: 'tl',
        kicker: 'The failure mode nobody mentions',
        title: 'Constraints and tools<br>fight each other.',
        cc: 'Here is a failure mode almost nobody accounts for. Turn on schema constraints and tool calling in the same pass, and open-weight models quietly stop calling tools — the grammar mask makes the tool tokens unreachable. The output still validates. It just silently stopped working. So we decouple them: pass one runs the tools, pass two formats the answer.' }),

    S({ mood: 'ink', t: 10000, dd: 'hardware', pos: 'tl2', phone: { s: 0.88, x: 0, y: -10 }, scr: 'home',
        kicker: 'Not a wrapper. Not a web app.',
        title: 'It has to be<br><mark>the phone</mark>.',
        cc: 'And this is why it has to be a phone, natively. The accelerator delegates, the constrained decoder, the hotspot radio, the foreground service, the camera, the offline voice packs — all of it lives at the native layer. The device utilisation is real because the architecture requires it.' }),

    S({ mood: 'paper', t: 8000, dd: 'blank', pos: 'center',
        kicker: 'iQOO Hackathon · Track 02',
        title: 'Four surfaces.<br>One runtime.<br><mark>Thirty hours</mark>.',
        chips: ['Local-first, cloud-optional', 'Office Kit CSV export', 'OpenAI-compatible endpoint', 'Finale-portable to Track 06'],
        cc: 'Four surfaces, one runtime, thirty hours. Local-first and cloud-optional, so the sponsor credits get used honestly. And one route turns the whole thing into a portable offline AI server that ships with an education client.' }),

    S({ mood: 'ink', t: 9500, dd: 'wordmark', pos: 'center', wordmark: true,
        closing: 'One phone. Thirty students.<br>No installs, no data, no internet.',
        hand: 'and when the network comes back, it only gets better — it was never required',
        cc: 'One phone. Thirty students. No installs, no data, no internet. And when the network comes back, it only gets better. It was never required.' }),

    S({ mood: 'paper', t: 7000, dd: 'blank', pos: 'center',
        title: 'EduQoo',
        sub: 'harsh4-dev.github.io/iqoo',
        chips: ['Tap the prototype', 'Read the spec', 'github.com/Harsh4-Dev/iqoo'],
        cc: '' }),
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
