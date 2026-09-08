/* ============================================================
   EduQoo — prototype runtime
   Drives the phone, the doodle scenes and the trace inspector.
   Nothing here calls a network. That is the point of the demo.
   ============================================================ */
(function () {
  'use strict';

  const D = window.DATA;
  const I = window.icon;
  const DD = window.DOODLE;

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const h  = (html) => { const t = document.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---- cancellable timers (cleared on every navigation) ---- */
  let timers = [];
  const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const stopTimers = () => { timers.forEach(clearTimeout); timers = []; };

  /* ============================================================
     STATE
     ============================================================ */
  const S = {
    role: 'student',
    tier: 'T0',
    screen: 'home',
    lang: D.student.lang,

    tutor: null,
    nb: null,
    quiz: null,
    cls: null,
  };

  function resetTutor(pid) {
    const id = pid || 'p0';
    const p = D.problems.find(x => x.id === id);
    S.tutor = {
      pid: id,
      mode: p && p.scan ? 'idle' : 'work',   // scannable problems open on the camera
      scanned: false, ocr: null, badFound: false,
      checked: false, running: false, kb: false, draft: '',
      playing: false, step: -1, fixed: false, why: false,
    };
  }
  function resetNb() {
    S.nb = { src: 'ncert-12-ch7', indexed: { 'ncert-12-ch7': true, 'board-0912': false }, indexing: null, thread: [], openCite: null };
  }
  function resetQuiz() {
    S.quiz = { gen: false, generating: false, items: [], killed: {}, pushed: false, sIdx: 0, sAns: null, answered: 0, heat: false };
  }
  function resetCls() {
    S.cls = { live: false, joined: 0, captured: false, ocr: 0, notes: false, pushed: false, receipts: 0 };
  }
  resetTutor(); resetNb(); resetQuiz(); resetCls();

  /* ============================================================
     TRACE — the EduQoo Core inspector
     ============================================================ */
  const Trace = {
    calls: [],
    verdict: null,
    conf: null,
    budget: { core: 120, retrieved: 0, working: 210, scratch: 0 },
    max: 2048,

    reset() { this.calls = []; this.verdict = null; this.conf = null; this.budget = { core: 120, retrieved: 0, working: 210, scratch: 0 }; },
    add(name, arg, ms, ok) {
      this.calls.push({ n: name, a: arg, ms: ms, ok: ok !== false });
      if (this.calls.length > 9) this.calls.shift();
      this.paint();
    },
    say(verdict, conf) { this.verdict = verdict; this.conf = conf; this.paint(); },
    spend(k, n) { this.budget[k] = (this.budget[k] || 0) + n; this.paint(); },

    paint() {
      const b = $('#traceBody');
      if (!b) return;
      const used = this.budget.core + this.budget.retrieved + this.budget.working + this.budget.scratch;
      const pct = k => Math.min(100, (this.budget[k] / this.max) * 100);
      const tool = n => (D.tools.find(t => t.n === n) || { c: 'var(--ink-40)' }).c;

      b.innerHTML =
        `<div class="pass">
           <div class="pass__c pass__c--1"><b>Pass 1</b><small>unconstrained · decides which tools to call</small></div>
           <div class="pass__ar">${I('arrowR')}</div>
           <div class="pass__c pass__c--2"><b>Pass 2</b><small>schema-constrained · formats only</small></div>
         </div>
         <p class="hint" style="margin:0 0 14px">${I('info')}<span>Decoupled on purpose. Constrain and tool-call in the same pass and the grammar mask makes tool tokens unreachable — the model silently stops calling tools.</span></p>

         <div class="divider"><span>Tool calls</span><i></i></div>
         <div class="tools">${
           this.calls.length
             ? this.calls.map(c =>
                 `<div class="tcall"><i class="tcall__d" style="background:${c.ok ? tool(c.n) : 'var(--red)'}"></i>
                    <b>${esc(c.n)}</b><span>${esc(c.a)}</span><em>${c.ms}ms</em></div>`).join('')
             : `<div class="tcall" style="opacity:.55"><i class="tcall__d" style="background:var(--ink-20)"></i><span>no calls yet — do something in the app</span></div>`
         }</div>

         <div class="divider"><span>Context budget</span><i></i></div>
         <div class="meter">
           <div class="meter__h"><span>window</span><span class="spacer"></span><b>${used} / ${this.max}</b></div>
           <div class="meter__t">
             <i style="width:${pct('core')}%;background:var(--amber)"></i>
             <i style="width:${pct('retrieved')}%;background:var(--violet)"></i>
             <i style="width:${pct('working')}%;background:var(--blue)"></i>
             <i style="width:${pct('scratch')}%;background:var(--green)"></i>
           </div>
           <div class="legend">
             <span><b style="background:var(--amber)"></b>core ${this.budget.core}</span>
             <span><b style="background:var(--violet)"></b>retrieved ${this.budget.retrieved}</span>
             <span><b style="background:var(--blue)"></b>working ${this.budget.working}</span>
             <span><b style="background:var(--green)"></b>scratchpad ${this.budget.scratch}</span>
           </div>
         </div>

         <div class="divider"><span>Verifier</span><i></i></div>
         ${this.verdict
            ? `<div class="verdict verdict--${this.verdict.k}">${I(this.verdict.k === 'no' ? 'x' : 'check')}${esc(this.verdict.t)}</div>
               <p class="hint" style="margin-top:9px">${I('shield')}<span>${esc(this.verdict.d)}</span></p>`
            : `<p class="hint" style="margin:0">${I('shield')}<span>Idle. Nothing has been shown to a student yet.</span></p>`}

         <div class="divider"><span>Router</span><i></i></div>
         <p class="hint" style="margin:0">${I(S.tier === 'T0' ? 'wifiOff' : 'wifi')}<span>
           ${S.tier === 'T0'
             ? 'Tier T0 — no network. Escalation is unavailable and unnecessary; every tool above ran on-device.'
             : S.tier === 'T1'
               ? 'Tier T1 — weak. Deltas queue for opportunistic sync. Escalation still refused: bandwidth is not trustworthy.'
               : 'Tier T2 — good. Escalation permitted <em>only</em> if the verifier reports confidence below 0.70. ' +
                 (this.conf !== null ? 'Last answer scored ' + this.conf.toFixed(2) + ' → stayed local.' : '')}
         </span></p>`;
    },
  };

  /* ============================================================
     SHARED FRAGMENTS
     ============================================================ */
  function connStrip() {
    const t = D.tiers[S.tier];
    return `<button class="conn" data-tier="${S.tier}" data-act="tier">
        <i class="conn__dot"></i>
        <span class="conn__txt"><b class="conn__t">${t.t}</b><span class="conn__s">${t.s}</span></span>
        <span class="conn__cta">${t.cta}${I('cycle')}</span>
      </button>`;
  }

  function roleBar() {
    return `<div class="rolebar"><div class="seg" data-on="${S.role}">
        <div class="seg__thumb"></div>
        <button class="seg__i ${S.role === 'student' ? 'is-on' : ''}" data-act="role" data-v="student">Student</button>
        <button class="seg__i ${S.role === 'teacher' ? 'is-on' : ''}" data-act="role" data-v="teacher">Teacher</button>
      </div>
      <button class="icon-btn" data-act="trace" title="Open the runtime trace" style="width:32px;height:32px">${I('cpu')}</button>
    </div>`;
  }

  function head(title, sub) {
    return `<div class="vhead">
        <button class="vhead__back" data-act="back" aria-label="Back">${I('arrowL')}</button>
        <div class="vhead__t">${title}${sub ? `<small>${sub}</small>` : ''}</div>
      </div>`;
  }

  /* ============================================================
     SCREEN · HOME
     ============================================================ */
  const TILES = {
    student: [
      { id: 'tutor',     ic: 'camera', t: 'Tutor',     s: 'Photograph your working. It finds the line you went wrong on.', tint: 'tint-amber',  b: 'Camera · on-device' },
      { id: 'notebook',  ic: 'book',   t: 'Notebook',  s: 'Ask today’s chapter. Answers cite the line.',              tint: 'tint-violet', b: 'Grounded' },
      { id: 'quiz',      ic: 'check2', t: 'Quiz',      s: 'Live from the teacher, or take it offline.',               tint: 'tint-green',  b: 'Graded on-device' },
      { id: 'classroom', ic: 'users',  t: 'Classroom', s: 'Notes and worksheets pushed to your browser.',             tint: 'tint-blue',   b: 'No install' },
    ],
    teacher: [
      { id: 'classroom', ic: 'users',  t: 'Classroom', s: 'Raise the hotspot. Show the QR. Push anything.',           tint: 'tint-blue',   b: 'You are the server' },
      { id: 'quiz',      ic: 'check2', t: 'Quiz',      s: 'Auto-generate, review, push live, read the heatmap.',      tint: 'tint-green',  b: 'CSV export' },
      { id: 'notebook',  ic: 'book',   t: 'Notebook',  s: 'Index a chapter once. The whole class queries it.',        tint: 'tint-violet', b: 'On-device index' },
      { id: 'tutor',     ic: 'camera', t: 'Tutor',     s: 'Scan a student’s page, then push the walkthrough.',         tint: 'tint-amber',  b: 'Camera · on-device' },
    ],
  };

  function greeting() {
    const hr = new Date().getHours();
    return hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  }

  const V = {};

  V.home = () => {
    const teacher = S.role === 'teacher';
    return `${connStrip()}${roleBar()}
      <div class="greet">
        <h2>${greeting()}, ${teacher ? D.teacher.name : D.student.name}</h2>
        <p>${teacher ? D.teacher.school + ' · ' + (S.cls.live ? S.cls.joined + ' joined' : 'class not started') : D.student.grade + ' · ' + D.chapter.title + ' · Ch. 7'}</p>
      </div>
      <div class="tiles">${TILES[S.role].map(t => `
        <button class="tile" data-act="go" data-v="${t.id}">
          <span class="tile__ico ${t.tint}">${I(t.ic)}</span>
          <b>${t.t}</b><small>${t.s}</small>
          <span class="tile__badge">${t.b}</span>
        </button>`).join('')}
      </div>
      <div class="claim">
        <b>Everything above runs on this phone.</b> ${teacher
          ? 'Students join from any browser over your own access point — no installs, no data plan, no accounts. Flip the strip above to prove nothing degrades.'
          : 'Your homework never leaves the device. Flip the connectivity strip above and ask again — the answers are identical.'}
      </div>
      <p class="hint" style="margin-top:12px">${I('cpu')}<span>Gemma-2-2B via MediaPipe LLM Inference · symbolic solver · 768-dim SQLite vector store. Tap the chip at the bottom right to watch the runtime work.</span></p>`;
  };

  /* ============================================================
     SCREEN · TUTOR
     ============================================================ */
  /** the viewfinder: a photo of the page, with a detection box per read step */
  function scanFrame(found, bad) {
    const p = D.problems.find(x => x.id === S.tutor.pid);
    const lines = p.scan ? D.scan.read.map(r => r.t) : p.lines.map(l => l.x);
    return `<div class="scan ${found >= lines.length ? 'is-done' : ''}" id="scanBox">
      <div class="scan__frame">
        <span class="scan__corners"><i></i><i></i><i></i><i></i></span>
        <div class="scan__ink">${lines.map((txt, i) => `
          <span class="${i < found ? 'is-found' : ''}${bad === i ? ' is-bad' : ''}">${esc(txt)}
            <i class="scan__box"></i>
            <i class="scan__tag">${bad === i ? 'error' : 'step ' + (i + 1)}</i>
          </span>`).join('')}</div>
      </div>
      <div class="scan__hud">${I('camera')}
        <span>${found ? Math.min(found, lines.length) + ' steps found' : 'hold steady…'}</span>
        <span class="spacer"></span><b>on-device</b>
      </div>
    </div>`;
  }

  V.tutor = () => {
    const t = S.tutor;
    const p = D.problems.find(x => x.id === t.pid);

    const chips = `<div class="chips" style="margin:0 0 12px">
        ${D.problems.map(x => `<button class="chip ${x.id === t.pid ? 'chip--hot' : ''}" data-act="prob" data-v="${x.id}">${x.title}</button>`).join('')}
      </div>`;

    /* ---- camera first ---- */
    if (t.mode === 'idle') {
      return `${head('Tutor', p.level)}${chips}
        <div class="empty" style="padding:22px 12px">${I('camera')}
          <b>Point it at the page</b>
          <small>Photograph the working. The handwriting is read on the device, then every step is checked against the one above it.</small>
        </div>
        <div class="actions">
          <button class="abtn" data-act="kb">${I('edit')}Type it instead</button>
          <button class="abtn abtn--go" data-act="scan">${I('camera')}Scan the page</button>
        </div>
        ${t.kb ? mathKeyboard() : ''}
        <p class="hint" style="margin-top:14px">${I('info')}<span>Camera first, keyboard as the fallback. Handwritten fractions and superscripts are where plain OCR breaks, which is why every scan ends in a confirm step before anything is judged.</span></p>`;
    }

    /* ---- reading the page ---- */
    if (t.mode === 'scanning') {
      return `${head('Tutor', 'Reading the page')}
        ${scanFrame(0, -1)}
        <div id="scanSteps" style="margin-top:12px"></div>`;
    }

    /* ---- confirm what we read ---- */
    if (t.mode === 'confirm') {
      const low = t.ocr.filter(r => r.c < D.scan.confirmBelow);
      return `${head('Tutor', 'Confirm what we read')}
        ${scanFrame(t.ocr.length, -1)}
        <div class="divider"><span>Is this what you wrote?</span><i></i></div>
        <div class="ocr">${t.ocr.map((r, i) => `
          <div class="ocr__row ${r.c < D.scan.confirmBelow ? 'is-low' : ''}">
            <span class="ocr__n">${i + 1}</span>
            <span class="ocr__t">${esc(r.t)}</span>
            <span class="ocr__c">${Math.round(r.c * 100)}%</span>
            <button class="ocr__edit" data-act="kb" title="Fix this line">${I('edit')}</button>
          </div>`).join('')}
        </div>
        ${t.kb ? mathKeyboard() : ''}
        <div class="actions">
          <button class="abtn" data-act="scan">${I('cycle')}Rescan</button>
          <button class="abtn abtn--go" data-act="confirmScan">${I('check')}Yes, check it</button>
        </div>
        <p class="hint" style="margin-top:12px">${I('shield')}<span>${low.length
          ? 'Line ' + (t.ocr.indexOf(low[0]) + 1) + ' came back at ' + Math.round(low[0].c * 100) + '%, under the ' + Math.round(D.scan.confirmBelow * 100) + '% threshold, so it is flagged for you to check. Nothing is judged until you say we read it right.'
          : 'Every line cleared the confidence threshold. Confirm anyway — nothing is judged until you say we read it right.'}</span></p>`;
    }

    /* ---- the check itself ---- */
    const lines = p.lines.map((l, i) => `
      <div class="line" data-i="${i}">
        <span class="line__n">${i + 1}</span>
        <span class="line__x">${esc(l.x)}</span>
        <span class="line__s">${i === 0
          ? '<i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i>'
          : I('check')}</span>
      </div>`).join('');

    return `${head('Tutor', p.level)}${chips}

      ${t.scanned ? scanFrame(p.lines.length, t.badFound ? p.badLine : -1) + '<div style="height:12px"></div>' : ''}

      <div class="work" id="work">
        <div class="work__h"><span>${t.scanned ? 'What we read' : 'Your working'}</span><span class="mono">${p.lines.length} lines</span></div>
        ${lines}
      </div>

      ${t.kb ? mathKeyboard() : ''}

      <div class="actions">
        <button class="abtn" data-act="${p.scan ? 'scan' : 'kb'}">${I(p.scan ? 'camera' : 'edit')}${p.scan ? 'Rescan' : (t.kb ? 'Hide keyboard' : 'Math keyboard')}</button>
        <button class="abtn abtn--go" data-act="check" ${t.running ? 'disabled' : ''}>${I('shield')}${t.checked ? 'Check again' : 'Check my working'}</button>
      </div>

      <div id="tutorOut"></div>

      <p class="hint" style="margin-top:14px">${I('info')}<span>The model is not asked whether the maths is right. A symbolic solver checks whether each line is still equivalent to the one above it, and the first break is the error.</span></p>`;
  };

  function runScan() {
    const t = S.tutor;
    t.mode = 'scanning'; t.checked = false; t.badFound = false; t.why = false;
    render();

    const box = $('#scanSteps');
    if (!box) return;
    box.innerHTML = `<div class="ingest">
        <div class="ingest__t">On the device</div>
        <div class="ingest__steps">${D.scan.pipeline.map((s, i) =>
          `<div class="istep" data-i="${i}"><i>${I('check')}</i>${s[0]}<span class="n">${s[1]}</span></div>`).join('')}</div>
      </div>`;

    Trace.reset();
    Trace.add('ocr', 'page.jpg → ML Kit Digital Ink', 610, true);
    Trace.spend('working', 60);

    let d = 260;
    D.scan.pipeline.forEach((s, i) => {
      after(d, () => { const e = $(`.istep[data-i="${i}"]`, box); if (e) e.classList.add('is-on'); });
      after(d + 640, () => {
        const e = $(`.istep[data-i="${i}"]`, box);
        if (e) { e.classList.remove('is-on'); e.classList.add('is-done'); }
        // reveal one detection box per parsing step
        const spans = $$('#scanBox .scan__ink span');
        if (spans[i]) spans[i].classList.add('is-found');
        const hud = $('#scanBox .scan__hud span');
        if (hud) hud.textContent = Math.min(i + 1, spans.length) + ' steps found';
      });
      d += 720;
    });

    after(d + 300, () => {
      $$('#scanBox .scan__ink span').forEach(e => e.classList.add('is-found'));
      t.ocr = D.scan.read.slice();
      t.mode = 'confirm';
      Trace.add('parse', t.ocr.length + ' steps → expressions', 34, true);
      Trace.say({ k: 'warn', t: 'confirm before judging', d: 'One line came back under the confidence threshold. The student is asked to confirm the reading before any of it is marked — the machine never judges work it is not sure it read.' }, 0.71);
      toast(t.ocr.length + ' steps read on-device. Check we got them right.', 'camera');
      render();
    });
  }

  function mathKeyboard() {
    const rows = [
      ['7', '8', '9', '÷', '(', ')', '∫'],
      ['4', '5', '6', '×', 'x', 'ⁿ', 'd x'],
      ['1', '2', '3', '−', '²', '√', 'π'],
      ['0', '.', '=', '+', 'C', '⌫', '⏎'],
    ];
    return `<div class="mathkb">
      <div class="mathfield" id="mf">${S.tutor.draft
        ? esc(S.tutor.draft) + '<span class="mathfield__caret"></span>'
        : '<span class="mathfield__ph">tap keys to add a line…</span><span class="mathfield__caret"></span>'}</div>
      <div style="height:9px"></div>
      ${rows.map(r => `<div class="mathkb__row">${r.map(k => {
        const cls = k === '⏎' ? 'key key--go' : (k === '⌫' || k === 'd x') ? 'key key--fn' : 'key';
        return `<button class="${cls}" data-act="key" data-v="${k}">${k}</button>`;
      }).join('')}</div>`).join('')}
    </div>`;
  }

  function runCheck() {
    const t = S.tutor;
    const p = D.problems.find(x => x.id === t.pid);
    const work = $('#work');
    const out = $('#tutorOut');
    if (!work || !out) return;

    t.running = true; t.checked = true; t.why = false;
    out.innerHTML = '';
    $$('.line', work).forEach(l => { l.className = 'line'; l.dataset.i = l.dataset.i; });
    $$('.casrow', work).forEach(n => n.remove());
    $$('.abtn', $('.view.is-active')).forEach(b => b.disabled = true);

    Trace.reset();
    Trace.add('cas.solveSteps', p.lines[0].x, 61 + Math.round(Math.random() * 20));
    Trace.spend('working', 90);

    let delay = 340;
    p.lines.forEach((l, i) => {
      if (i === 0) return;
      const node = $$('.line', work)[i];

      after(delay, () => {
        node.classList.add('is-checking');
        node.querySelector('.line__s').innerHTML = I('cycle');
      });

      after(delay + 620, () => {
        node.classList.remove('is-checking');
        node.classList.add(l.ok ? 'is-ok' : 'is-bad');
        node.querySelector('.line__s').innerHTML = I(l.ok ? 'check' : 'x');
        Trace.add('cas.check', 'line ' + (i + 1), 38 + Math.round(Math.random() * 26), l.ok);

        const row = h(`<div class="casrow">
            <b>Symja</b> ${esc(l.cas)}<br>
            → <span class="${l.ok ? 'yes' : 'no'}">${esc(l.got)}</span>
            ${l.ok ? ' — equivalent to line ' + i : ' — <b>not</b> equivalent to line ' + i}
          </div>`);
        node.after(row);

        if (!l.ok) {
          // draw the red boundary straight onto the photo of the page
          S.tutor.badFound = true;
          const spans = $$('#scanBox .scan__ink span');
          if (spans[i]) {
            spans[i].classList.add('is-bad');
            const tag = spans[i].querySelector('.scan__tag');
            if (tag) tag.textContent = 'error';
          }
          finishCheck(p);
        }
      });

      delay += 900;
    });
  }

  function finishCheck(p) {
    const out = $('#tutorOut');
    const t = S.tutor;
    t.running = false;
    $$('.abtn', $('.view.is-active')).forEach(b => b.disabled = false);

    Trace.say({ k: 'no', t: 'error located · line ' + (p.badLine + 1), d: 'A computer algebra system decided this, not the language model. The model was only asked to phrase the explanation afterwards.' }, 0.99);

    out.innerHTML = `
      <div class="divider"><span>What went wrong</span><i></i></div>
      <div class="thread">
        <div class="bub bub--ai">
          Line <b>${p.badLine + 1}</b> is where it stops being true. ${esc(p.why)}
          <div class="verdict verdict--no">${I('x')}Symja · not equivalent</div>
        </div>
      </div>
      <div class="actions">
        <button class="abtn" data-act="fix">${I('check')}Fix line ${p.badLine + 1}</button>
        <button class="abtn abtn--go" data-act="why">${I('play')}Show me why</button>
      </div>`;
    vibrate();
  }

  function applyFix() {
    const p = D.problems.find(x => x.id === S.tutor.pid);
    const node = $$('.line', $('#work'))[p.badLine];
    if (!node) return;
    node.classList.remove('is-bad');
    node.classList.add('is-ok');
    node.querySelector('.line__x').textContent = p.fix;
    node.querySelector('.line__s').innerHTML = I('check');
    const row = node.nextElementSibling;
    if (row && row.classList.contains('casrow')) {
      row.innerHTML = '<b>Symja</b> re-checked after edit<br>→ <span class="yes">0</span> — equivalent to line ' + p.badLine;
    }
    // clear the red boundary on the photo too
    S.tutor.badFound = false;
    const span = $$('#scanBox .scan__ink span')[p.badLine];
    if (span) {
      span.classList.remove('is-bad');
      span.childNodes[0].nodeValue = p.fix + ' ';
      const tag = span.querySelector('.scan__tag');
      if (tag) tag.textContent = 'fixed';
    }

    Trace.add('cas.check', 'line ' + (p.badLine + 1) + ' (edited)', 41, true);
    Trace.add('progress.write', D.student.name + ' · ' + (p.concept || 'transposing a term'), 12, true);
    Trace.say({ k: 'ok', t: 'all lines equivalent', d: 'The correction was verified the same way the error was. The concept was written to this student’s record so the teacher dashboard can aggregate it.' }, 0.99);
    toast('Line ' + (p.badLine + 1) + ' fixed and re-verified. Logged for the teacher.', 'check');
  }

  function showWhy() {
    const t = S.tutor;
    const p = D.problems.find(x => x.id === t.pid);
    const out = $('#tutorOut');
    t.why = true; t.step = 0; t.playing = true;

    Trace.add('narrate', p.steps.length + ' steps · ' + D.langNames[S.lang], 210, true);
    Trace.add('speak', D.langNames[S.lang] + ' · Android TTS', 340, true);
    Trace.spend('working', 140);

    out.innerHTML = `
      <div class="divider"><span>Narrated walkthrough</span><i></i></div>
      <div class="player" id="player"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
        <div class="langs">${Object.keys(D.langNames).map(k =>
          `<button class="lang ${k === S.lang ? 'is-on' : ''}" data-act="lang" data-v="${k}">${D.langNames[k]}</button>`).join('')}</div>
        <span style="flex:1"></span>
        <button class="abtn" style="flex:0 0 auto;padding:8px 12px" data-act="pushvid">${I('share')}Push to class</button>
      </div>
      <p class="hint" style="margin-top:10px">${I('shield')}<span>Every frame is rendered from the CAS solution trace, so the animation <b>cannot</b> show a wrong step. The model contributes phrasing only.</span></p>`;

    paintPlayer();
    stepLoop();
  }

  function paintPlayer() {
    const t = S.tutor;
    const p = D.problems.find(x => x.id === t.pid);
    const nar = (D.narration[t.pid] || D.narration.p1)[S.lang] || D.narration.p1.en;
    const i = Math.max(0, Math.min(t.step, p.steps.length - 1));
    const st = p.steps[i];
    const pl = $('#player');
    if (!pl) return;

    let expr = esc(st.e);
    if (st.h) expr = expr.replace(esc(st.h), '<mark>' + esc(st.h) + '</mark>');

    pl.innerHTML = `
      <div class="player__stage">
        ${i > 0 ? `<div class="player__ghost">${esc(p.steps[i - 1].e)}</div>` : ''}
        <div class="player__expr" key="${i}">${expr}</div>
        <div class="player__cc"><b>${D.langNames[S.lang]}</b> · ${esc(nar[i] || st.cc)}</div>
      </div>
      <div class="player__bar" style="--stepms:3400ms">
        ${p.steps.map((_, k) => `<i class="${k < i ? 'is-done' : k === i && t.playing ? 'is-now' : ''}"></i>`).join('')}
      </div>
      <div class="player__ctl">
        <button class="player__pp" data-act="pp">${I(t.playing ? 'pause' : 'play')}</button>
        <span>Step ${i + 1} of ${p.steps.length}</span>
        <span class="spacer"></span>
        <span class="wave ${t.playing ? '' : 'is-off'}" style="color:var(--green)"><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span>TTS</span>
      </div>`;
  }

  function stepLoop() {
    const t = S.tutor;
    const p = D.problems.find(x => x.id === t.pid);
    if (!t.playing) return;
    after(3400, () => {
      if (!t.playing) return;
      if (t.step >= p.steps.length - 1) {
        t.playing = false;
        paintPlayer();
        Trace.say({ k: 'ok', t: 'walkthrough rendered', d: 'Four steps, four narration clips, all derived from a deterministic CAS trace. Encoding this to MP4 makes it reusable class material.' }, 0.97);
        toast('Walkthrough complete. Push it and every joined device gets the video.', 'spark');
        return;
      }
      t.step++;
      paintPlayer();
      stepLoop();
    });
  }

  /* ============================================================
     SCREEN · NOTEBOOK
     ============================================================ */
  V.notebook = () => {
    const n = S.nb;
    const sources = [
      { id: 'ncert-12-ch7', t: D.chapter.title, s: D.chapter.sub + ' · ' + D.chapter.pages + ' pages' },
      { id: 'board-0912',   t: 'Board photo — 09 Sept', s: 'From Mrs. Rajan · 1 image' },
    ];

    return `${head('Notebook', 'Answers grounded in one source')}
      <div class="srcs">${sources.map(x => `
        <button class="src ${n.src === x.id ? 'is-on' : ''}" data-act="src" data-v="${x.id}">
          <span class="src__ico">${I('file')}</span>
          <span class="src__m"><b>${x.t}</b><small>${x.s}</small></span>
          <span class="src__ok">${n.indexed[x.id] ? I('check') : I('plus')}</span>
        </button>`).join('')}
      </div>

      <div id="ingest"></div>

      ${n.indexed[n.src] ? `
        <div class="divider"><span>Ask this source</span><i></i></div>
        <div class="thread" id="thread">${n.thread.length ? n.thread.map(bubble).join('') : ''}</div>
        ${n.thread.length ? '' : `<div class="empty">${I('search')}<b>Nothing asked yet</b><small>Pick a question below, or type your own. Then try something that is <i>not</i> in this chapter.</small></div>`}
        <div class="composer">
          <input id="ask" placeholder="Ask about ${D.chapter.title}…" autocomplete="off">
          <button class="composer__send" data-act="ask">${I('send')}</button>
        </div>
        <div class="chips">
          <button class="chip" data-act="q" data-v="Why do we always add + C?">Why + C?</button>
          <button class="chip" data-act="q" data-v="How do I choose u in integration by parts?">Choosing u</button>
          <button class="chip" data-act="q" data-v="Do I still need + C for a definite integral?">Definite limits</button>
          <button class="chip chip--hot" data-act="q" data-v="Who won the 2011 cricket world cup?">Ask something off-syllabus</button>
        </div>`
      : `<div class="empty">${I('layers')}<b>Not indexed yet</b><small>Tap the source above to chunk, embed and store it. It takes a few seconds and happens entirely on this phone.</small></div>`}`;
  };

  function bubble(m) {
    if (m.r === 'me') return `<div class="bub bub--me">${esc(m.t)}</div>`;
    if (m.r === 'refuse') return `<div class="bub bub--ai">${m.t}
        <div class="verdict verdict--warn">${I('shield')}grounding check failed → refused</div></div>`;
    return `<div class="bub bub--ai">${m.t}
        ${m.cite ? `<div><button class="cite" data-act="cite" data-v="${m.cite}">${I('file')}p.${chunk(m.cite).p} · chunk ${m.cite}</button></div>` : ''}
        ${m.open ? `<div class="source"><b>NCERT p.${chunk(m.cite).p}</b> — ${esc(chunk(m.cite).t)}</div>` : ''}
        <div class="verdict verdict--ok">${I('check')}grounded · confidence ${m.conf}</div>
      </div>`;
  }
  const chunk = n => D.chapter.chunks.find(c => c.n === n) || { p: '—', t: '' };

  function runIngest() {
    const n = S.nb;
    const box = $('#ingest');
    if (!box) return;
    const steps = [
      ['Extracting text', 'ML Kit OCR'],
      ['Semantic chunking', '~300 tok · 15% overlap'],
      ['Embedding chunks', '768-dim'],
      ['Writing vector store', 'SQLite + FTS'],
    ];
    box.innerHTML = `<div class="ingest">
        <div class="ingest__t">Indexing on-device</div>
        <div class="ingest__steps">${steps.map((s, i) =>
          `<div class="istep" data-i="${i}"><i>${I('check')}</i>${s[0]}<span class="n">${s[1]}</span></div>`).join('')}</div>
        <div class="bar"><i style="width:0%"></i></div>
      </div>`;

    Trace.reset();
    let d = 200;
    steps.forEach((s, i) => {
      after(d, () => {
        $$('.istep', box).forEach(e => e.classList.remove('is-on'));
        const e = $(`.istep[data-i="${i}"]`, box);
        if (e) e.classList.add('is-on');
        const bar = $('.bar i', box);
        if (bar) bar.style.width = ((i + 1) / steps.length) * 100 + '%';
      });
      after(d + 780, () => {
        const e = $(`.istep[data-i="${i}"]`, box);
        if (e) { e.classList.remove('is-on'); e.classList.add('is-done'); }
      });
      d += 900;
    });
    Trace.add('ocr', 'board-0912.jpg → 612 chars', 890, true);

    after(d + 200, () => {
      n.indexed[n.src] = true;
      Trace.add('retrieve', 'index built · 4 chunks', 120, true);
      Trace.say({ k: 'ok', t: 'source indexed', d: 'Chunks, embeddings and the FTS table all live in one SQLite file on this phone. Nothing was uploaded.' }, 0.98);
      toast('Board photo indexed. 4 chunks, 768-dim, stored locally.', 'check');
      render();
    });
  }

  function ask(text) {
    const n = S.nb;
    const q = text.trim();
    if (!q) return;
    n.thread.push({ r: 'me', t: q });
    render();

    const th = $('#thread');
    if (th) th.appendChild(h(`<div class="think" id="think"><span class="think__dots"><i></i><i></i><i></i></span>retrieving from ${D.chapter.title}…</div>`));
    scrollBottom();

    Trace.reset();
    Trace.add('retrieve', '"' + q.slice(0, 22) + (q.length > 22 ? '…' : '') + '" · k=4', 74, true);
    Trace.spend('retrieved', 340);

    const low = q.toLowerCase();
    const hit = D.qa.find(a => a.k.some(k => low.includes(k)));
    const ref = D.refusals.find(r => r.k.some(k => low.includes(k)));

    after(1150, () => {
      const t = $('#think'); if (t) t.remove();

      if (hit && !ref) {
        n.thread.push({ r: 'ai', t: hit.a, cite: hit.cite, conf: hit.conf.toFixed(2), open: false });
        Trace.add('progress.write', D.student.name + ' · ' + D.chapter.title, 11, true);
        Trace.say({ k: 'ok', t: 'grounded · chunk ' + hit.cite, d: 'Every claim in that answer was matched back to the retrieved chunk before it was rendered. The citation is tappable.' }, hit.conf);
      } else if (ref) {
        n.thread.push({ r: 'refuse', t: `That isn’t in your material — it’s ${ref.was}. This notebook only answers from <b>${D.chapter.title}</b>. Here’s what <i>is</i> in there: antiderivatives, the power rule, substitution, integration by parts and definite limits.` });
        Trace.say({ k: 'warn', t: 'refused · not grounded', d: 'The claim could not be supported by any retrieved chunk, so the answer was replaced rather than guessed. Refusing is the feature.' }, 0.22);
      } else {
        n.thread.push({ r: 'refuse', t: `I can’t support that from <b>${D.chapter.title}</b>. Try one of the suggestions below — or ask about the constant of integration, ILATE, or definite limits.` });
        Trace.say({ k: 'warn', t: 'refused · no supporting chunk', d: 'Retrieval returned nothing above the grounding threshold. The model was not allowed to fill the gap.' }, 0.18);
      }
      render();
      scrollBottom();
    });
  }

  /* ============================================================
     SCREEN · QUIZ
     ============================================================ */
  V.quiz = () => (S.role === 'teacher' ? quizTeacher() : quizStudent());

  function quizTeacher() {
    const q = S.quiz;
    if (!q.gen) {
      return `${head('Quiz', 'Teacher · generate from a source')}
        <div class="card" style="padding:16px;border-radius:16px">
          <h3 style="font-size:14px">${D.chapter.title}</h3>
          <p style="font-size:11px;margin-top:4px;color:var(--ink-40)">${D.chapter.sub} · indexed · 9 chunks</p>
        </div>
        <div class="actions">
          <button class="abtn abtn--go" data-act="gen" ${q.generating ? 'disabled' : ''}>${I('spark')}${q.generating ? 'Generating…' : 'Generate 7 questions'}</button>
        </div>
        <div id="genOut"></div>
        <p class="hint" style="margin-top:14px">${I('info')}<span>Generation is schema-constrained at the decoder, so a malformed option is unreachable rather than merely unlikely. Every question is then verified before you see it.</span></p>`;
    }

    const live = q.items.filter(x => !q.killed[x.i]);
    return `${head('Quiz', 'Teacher · review, then push')}
      <div class="stats3" style="margin-bottom:12px">
        <div class="st"><b>${q.items.length}</b><small>generated</small></div>
        <div class="st"><b style="color:var(--red)">${q.items.length - live.length}</b><small>rejected</small></div>
        <div class="st"><b style="color:var(--green-2)">${live.length}</b><small>approved</small></div>
      </div>

      ${q.pushed ? liveBoard() : `
        <div class="divider"><span>Review — nothing ships unread</span><i></i></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${q.items.map(x => `
            <div class="review ${q.killed[x.i] ? 'is-killed' : ''}">
              <div class="review__b">
                <b>${esc(x.q)}</b>
                <small>${x.kill ? '<span style="color:var(--red)">✕ ' + esc(x.kill) + '</span>' : 'chunk ' + x.src + ' · ' + x.d + ' · verified'}</small>
              </div>
              <div class="review__acts">
                <button class="rbtn rbtn--ok ${!q.killed[x.i] ? 'is-on' : ''}" data-act="keep" data-v="${x.i}">${I('check')}</button>
                <button class="rbtn rbtn--no ${q.killed[x.i] ? 'is-on' : ''}" data-act="kill" data-v="${x.i}">${I('x')}</button>
              </div>
            </div>`).join('')}
        </div>
        <div class="actions">
          <button class="abtn" data-act="regen">${I('cycle')}Regenerate</button>
          <button class="abtn abtn--go" data-act="push">${I('zap')}Push live to ${D.roster.length}</button>
        </div>`}`;
  }

  function liveBoard() {
    const q = S.quiz;
    const pct = Math.round((q.answered / D.roster.length) * 100);
    return `
      <div class="divider"><span>Live · ${q.answered} of ${D.roster.length} answered</span><i></i></div>
      <div class="bar" style="margin-bottom:14px"><i style="width:${pct}%;background:var(--green)"></i></div>

      <h3 style="font-size:12px;margin-bottom:8px">Class heatmap — by concept</h3>
      <div class="heat">${D.heat.map((v, i) => `<i data-v="${v}" class="${q.heat ? 'is-in' : ''}" style="transition-delay:${i * 16}ms"></i>`).join('')}</div>
      <div class="legend">
        <span><b style="background:var(--green)"></b>solid</span>
        <span><b style="background:var(--amber)"></b>shaky</span>
        <span><b style="background:var(--red)"></b>reteach</span>
        <span style="margin-left:auto;font-family:var(--font-mono)">6 concepts × 6 students</span>
      </div>

      <div class="card" style="margin-top:14px;padding:14px;border-radius:14px;border-color:var(--red)">
        <h3 style="font-size:12px;color:var(--red)">Reteach tomorrow</h3>
        <p style="font-size:11px;margin-top:5px">Two thirds of the class missed the <b>constant of integration</b>. It is the single weakest column on the board — and it is the same slip the tutor flagged on line 3.</p>
      </div>

      <div class="actions">
        <button class="abtn" data-act="csv">${I('download')}Export CSV</button>
        <button class="abtn" data-act="reset">${I('cycle')}New quiz</button>
      </div>
      <p class="hint" style="margin-top:12px">${I('share')}<span>That CSV is a real file. On stage it gets pulled to the laptop over Office Kit while the phone stays on the hotspot.</span></p>`;
  }

  function quizStudent() {
    const q = S.quiz;
    const items = D.quiz.filter(x => x.ok);
    if (q.sIdx >= items.length) {
      const score = q.sAns === null ? 0 : 0;
      return `${head('Quiz', 'Student · finished')}
        <div class="empty">${I('target')}<b>Test submitted</b>
          <small>Graded on this phone the moment you answered — no round trip, so it works identically at T0.</small></div>
        <div class="stats3">
          <div class="st"><b>${items.length}</b><small>questions</small></div>
          <div class="st"><b style="color:var(--green-2)">${q.answered}</b><small>correct</small></div>
          <div class="st"><b>${Math.round((q.answered / items.length) * 100)}%</b><small>score</small></div>
        </div>
        <div class="actions"><button class="abtn abtn--go" data-act="reset">${I('cycle')}Take it again</button></div>`;
    }

    const it = items[q.sIdx];
    const done = q.sAns !== null;
    return `${head('Quiz', 'Live from ' + D.teacher.name)}
      <div class="q">
        <div class="q__n">Question ${q.sIdx + 1} of ${items.length}</div>
        <div class="q__t">${esc(it.q)}</div>
        <div class="q__opts">${it.o.map((o, i) => {
          let c = 'opt';
          if (done) {
            if (i === it.a) c += ' is-right';
            else if (i === q.sAns) c += ' is-wrong';
            else c += ' is-dim';
          }
          return `<button class="${c}" data-act="ans" data-v="${i}" ${done ? 'disabled' : ''}>
              <span class="opt__k">${'ABCD'[i]}</span>${esc(o)}</button>`;
        }).join('')}</div>
        <div class="q__meta">
          <span class="tag">${it.d}</span>
          <span class="tag">chunk ${it.src}</span>
          <span style="margin-left:auto">${done ? (q.sAns === it.a ? '✓ correct' : '✕ incorrect') : 'graded on-device'}</span>
        </div>
      </div>

      ${done ? `<div class="source" style="margin-top:12px"><b>Why:</b> ${esc(chunk(it.src).t)}</div>
        <div class="actions"><button class="abtn abtn--go" data-act="next">${I('arrowR')}Next question</button></div>` : ''}

      <p class="hint" style="margin-top:14px">${I('wifiOff')}<span>Assigned mode stores your answers locally and flushes them the next time you are on the class network. Nothing here needs a signal.</span></p>`;
  }

  function runGenerate() {
    const q = S.quiz;
    q.generating = true;
    render();
    const out = $('#genOut');
    Trace.reset();
    Trace.add('retrieve', D.chapter.title + ' · 9 chunks', 88, true);
    Trace.spend('retrieved', 640);

    const notes = [
      'schema-constrained decode · 7 objects',
      'checking sourceLine exists for each',
      'distinctness + longest-option bias',
      'Symja verifying every numeric key',
    ];
    if (out) out.innerHTML = `<div class="ingest" style="margin-top:12px">
        <div class="ingest__t">EduQoo Core</div>
        <div class="ingest__steps">${notes.map((s, i) => `<div class="istep" data-i="${i}"><i>${I('check')}</i>${s}</div>`).join('')}</div>
      </div>`;

    let d = 260;
    notes.forEach((s, i) => {
      after(d, () => { const e = $(`.istep[data-i="${i}"]`, out); if (e) e.classList.add('is-on'); });
      after(d + 700, () => { const e = $(`.istep[data-i="${i}"]`, out); if (e) { e.classList.remove('is-on'); e.classList.add('is-done'); } });
      d += 780;
    });

    Trace.add('quiz.generate', 'n=7 · schema-constrained', 1840, true);
    after(d + 200, () => {
      q.items = D.quiz.map((x, i) => Object.assign({ i: i }, x));
      q.killed = {};
      q.items.forEach(x => { if (!x.ok) q.killed[x.i] = true; });
      q.gen = true; q.generating = false;
      Trace.add('cas.check', '2 numeric keys · 1 disagreed', 96, false);
      Trace.say({ k: 'warn', t: '2 of 7 rejected', d: 'One failed the grounding check against its source line; one had an answer key Symja disagreed with. A wrong key is worse than no quiz.' }, 0.88);
      toast('7 generated, 2 rejected by the verifier. Review before pushing.', 'shield');
      render();
    });
  }

  function pushQuiz() {
    const q = S.quiz;
    q.pushed = true; q.answered = 0; q.heat = false;
    Trace.reset();
    Trace.add('class.broadcast', 'quiz · ' + D.roster.length + ' clients · SSE', 42, true);
    Trace.say({ k: 'ok', t: 'delivered to ' + D.roster.length, d: 'Server-sent events over the phone’s own access point. Grading happens in each browser, so results are instant at T0.' }, 0.99);
    render();
    let i = 0;
    const tick = () => {
      if (i >= D.roster.length) {
        q.heat = true; render();
        after(80, () => { $$('.heat i').forEach(e => e.classList.add('is-in')); });
        Trace.add('progress.write', D.roster.length + ' students · 6 concepts', 34, true);
        toast('All ' + D.roster.length + ' answered. Heatmap built on-device.', 'check');
        return;
      }
      i++; q.answered = i; render();
      after(260 + Math.random() * 340, tick);
    };
    after(500, tick);
  }

  function exportCSV() {
    const rows = [['student', 'concept', 'outcome', 'tier', 'timestamp']];
    const stamp = new Date().toISOString();
    D.roster.slice(0, 6).forEach((s, si) => {
      D.concepts.forEach((c, ci) => {
        const v = D.heat[ci * 6 + si];
        rows.push([s.n, c, v >= 2 ? 'correct' : v === 1 ? 'partial' : 'incorrect', S.tier, stamp]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'eduqoo-class-report.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    Trace.add('progress.write', 'export · 36 rows', 18, true);
    toast('eduqoo-class-report.csv downloaded — 36 rows, real file.', 'download');
  }

  /* ============================================================
     SCREEN · CLASSROOM
     ============================================================ */
  V.classroom = () => (S.role === 'teacher' ? clsTeacher() : clsStudent());

  function clsTeacher() {
    const c = S.cls;
    if (!c.live) {
      return `${head('Classroom', 'Teacher · you are the server')}
        <div class="empty">${I('wifiOff')}<b>Class not started</b>
          <small>Starting raises an access point with <b>no uplink behind it</b> and serves the student client from this phone.</small></div>
        <div class="actions"><button class="abtn abtn--go" data-act="start">${I('zap')}Start class</button></div>
        <p class="hint" style="margin-top:14px">${I('info')}<span>Ktor CIO in a foreground service · <code>WifiManager.startLocalOnlyHotspot()</code> · <code>NsdManager</code> advertising <code>_slate._tcp</code>. Airplane mode can stay on.</span></p>`;
    }

    return `${head('Classroom', c.joined + ' joined · class.local')}
      <div class="qr">
        <div class="beacon"><i></i><i></i><i></i><span class="beacon__c">${I('wifi')}</span></div>
        <div class="qr__code">${qrSVG()}</div>
        <div class="qr__ssid"><b>EduQoo-7A2C</b><small>scan, or open class.local — no app, no account</small></div>
      </div>

      <div class="divider"><span>Roster</span><i></i></div>
      <div class="roster">${D.roster.slice(0, c.joined).map((s, i) => `
        <div class="stu" style="animation-delay:${i * 40}ms">
          <span class="stu__av" style="background:${s.c}">${s.n[0]}</span>
          <b>${s.n}</b><span class="stu__dev">${s.d}</span>
          <span class="stu__r ${c.pushed && i < c.receipts ? '' : 'is-pending'}">${I(c.pushed && i < c.receipts ? 'check' : 'clock')}</span>
        </div>`).join('')}
      </div>
      ${c.joined < D.roster.length ? `<p class="hint" style="margin-top:10px">${I('cycle')}<span>Waiting for the rest of the class…</span></p>` : ''}

      <div class="divider"><span>Push material</span><i></i></div>
      <div id="capOut">${c.captured ? '' : ''}</div>
      <div class="actions">
        <button class="abtn" data-act="capture">${I('camera')}${c.notes ? 'Recapture' : 'Capture the board'}</button>
        <button class="abtn abtn--go" data-act="pushnotes" ${c.notes ? '' : 'disabled'}>${I('share')}Push to ${c.joined}</button>
      </div>`;
  }

  function clsStudent() {
    const c = S.cls;
    return `${head('Classroom', c.pushed ? 'Mrs. Rajan · 1 new' : 'Mrs. Rajan · connected')}
      <div class="card" style="padding:14px;border-radius:16px;display:flex;align-items:center;gap:11px">
        <span class="beacon" style="width:34px;height:34px"><i></i><i></i><span class="beacon__c" style="width:20px;height:20px">${I('wifi')}</span></span>
        <div><b style="font-size:12.5px">Joined class.local</b>
          <div style="font-size:10.5px;color:var(--ink-40)">Chrome · no install · no data used</div></div>
      </div>

      <div class="divider"><span>Received</span><i></i></div>
      ${c.pushed ? D.board.notes.map((n, i) => `
        <div class="card" style="padding:13px;border-radius:14px;margin-bottom:8px;animation:joinIn .4s var(--ease-out) both;animation-delay:${i * 90}ms">
          <b style="font-size:12px">${esc(n.h)}</b>
          <p style="font-size:11px;margin-top:4px">${esc(n.b)}</p>
        </div>`).join('') +
        `<div class="actions"><button class="abtn" data-act="pdf">${I('download')}Save as PDF</button>
           <button class="abtn" data-act="go" data-v="notebook">${I('book')}Open in Notebook</button></div>`
      : `<div class="empty">${I('clock')}<b>Nothing pushed yet</b><small>Switch to <b>Teacher</b> above, start the class and push the board notes — then come back here.</small></div>`}`;
  }

  function startClass() {
    const c = S.cls;
    c.live = true; c.joined = 0;
    Trace.reset();
    Trace.add('class.broadcast', 'hotspot up · EduQoo-7A2C', 210, true);
    Trace.say({ k: 'ok', t: 'server listening · :8080', d: 'A Ktor CIO server inside a foreground service. mDNS resolves class.local so nobody types an IP address.' }, 0.99);
    render();
    const join = () => {
      if (c.joined >= D.roster.length) { toast('All ' + D.roster.length + ' joined. Zero installs.', 'users'); return; }
      c.joined++; render();
      after(340 + Math.random() * 420, join);
    };
    after(600, join);
  }

  function capture() {
    const c = S.cls;
    c.captured = true; c.notes = false;
    render();
    const out = $('#capOut');
    if (!out) return;
    out.innerHTML = `<div class="capture">
        <div class="capture__frame"><span class="capture__corners"><i></i><i></i><i></i><i></i></span>
          ${esc(D.board.raw).replace(/\n/g, '<br>')}</div>
      </div>
      <div class="ingest" style="margin-top:10px">
        <div class="ingest__t">On-device OCR → clean notes</div>
        <div class="bar"><i style="width:0%"></i></div>
      </div>`;

    Trace.add('ocr', 'board.jpg · ML Kit Latin+Devanagari', 640, true);
    let p = 0;
    const grow = () => {
      p += 12 + Math.random() * 16;
      const bar = $('.bar i', out);
      if (bar) bar.style.width = Math.min(100, p) + '%';
      if (p < 100) after(160, grow);
      else after(300, () => {
        c.notes = true;
        Trace.add('progress.write', 'notes artifact · sha256', 22, true);
        Trace.say({ k: 'ok', t: 'notes ready · 3 blocks', d: 'The model rewrote the OCR output into clean blocks. It did not invent content — the raw capture is kept alongside for the teacher to check.' }, 0.92);
        render();
        const o2 = $('#capOut');
        if (o2) o2.innerHTML = D.board.notes.map((n, i) => `
          <div class="card" style="padding:13px;border-radius:14px;margin-bottom:8px;animation:bubIn .4s var(--ease-out) both;animation-delay:${i * 90}ms">
            <b style="font-size:12px">${esc(n.h)}</b><p style="font-size:11px;margin-top:4px">${esc(n.b)}</p></div>`).join('');
        toast('Board captured and cleaned. Ready to push.', 'camera');
      });
    };
    after(900, grow);
  }

  function pushNotes() {
    const c = S.cls;
    c.pushed = true; c.receipts = 0;
    Trace.reset();
    Trace.add('class.broadcast', 'notes.pdf · ' + c.joined + ' clients', 38, true);
    render();
    const tick = () => {
      if (c.receipts >= c.joined) {
        Trace.say({ k: 'ok', t: c.joined + '/' + c.joined + ' delivered', d: 'Each client ACKs on render, so the teacher sees who actually received it. Nobody is quietly left behind.' }, 0.99);
        toast('Delivered to all ' + c.joined + '. Switch to Student to read it.', 'check');
        return;
      }
      c.receipts++; render();
      after(200 + Math.random() * 260, tick);
    };
    after(400, tick);
  }

  function qrSVG() {
    const m = window.QR_MATRIX || [];
    const n = m.length || 1;
    let cells = '';
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (m[y][x] === '1') cells += `<rect x="${x}" y="${y}" width="1.03" height="1.03"/>`;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><g fill="var(--ink)">${cells}</g></svg>`;
  }

  /* ============================================================
     RENDER + ROUTER
     ============================================================ */
  const TABS = [
    { id: 'home',      ic: 'home',   t: 'Home' },
    { id: 'tutor',     ic: 'camera', t: 'Tutor' },
    { id: 'notebook',  ic: 'book',   t: 'Notebook' },
    { id: 'quiz',      ic: 'check2', t: 'Quiz' },
    { id: 'classroom', ic: 'users',  t: 'Class' },
  ];

  function render() {
    const vp = $('#viewport');
    if (!vp) return;
    const scroll = vp.querySelector('.view.is-active');
    const y = scroll ? scroll.scrollTop : 0;

    vp.innerHTML = `<section class="view is-active">${V[S.screen]()}</section>`;
    const v = vp.querySelector('.view');
    v.scrollTop = y;

    $$('.tab').forEach(b => b.classList.toggle('is-on', b.dataset.v === S.screen));
    Trace.paint();
  }

  /* ============================================================
     SCROLLY — the page scroll walks the phone through every screen,
     student run first, then the teacher run.
     ============================================================ */
  const FLOW = [
    { id: 'home',      role: 'student', t: 'Home' },
    { id: 'tutor',     role: 'student', t: 'Tutor' },
    { id: 'notebook',  role: 'student', t: 'Notebook' },
    { id: 'quiz',      role: 'student', t: 'Quiz' },
    { id: 'classroom', role: 'student', t: 'Class' },
    { id: 'home',      role: 'teacher', t: 'Teacher' },
    { id: 'quiz',      role: 'teacher', t: 'Review' },
    { id: 'classroom', role: 'teacher', t: 'Hotspot' },
  ];

  const SCROLLY = {
    track: null, on: false, idx: 0, lock: 0,

    init() {
      this.track = $('#stageTrack');
      if (!this.track) return;
      this.track.style.setProperty('--screens', FLOW.length);

      const dots = $('#stageDots');
      if (dots) dots.innerHTML = FLOW.map((f, i) => {
        const split = f.role === 'teacher' && FLOW[i - 1] && FLOW[i - 1].role !== 'teacher';
        return `<button class="sdot${i === 0 ? ' is-on' : ''}${split ? ' sdot--split' : ''}"
                 data-act="seek" data-v="${i}" aria-label="${f.role}: ${f.t}"><i></i><span>${f.t}</span></button>`;
      }).join('');

      this.measure();
      addEventListener('scroll', () => this.tick(), { passive: true });
      addEventListener('resize', () => { this.measure(); this.tick(); }, { passive: true });
      this.tick();
    },

    measure() {
      this.on = window.matchMedia
        ? matchMedia('(min-width: 1041px) and (min-height: 520px)').matches
        : false;
      this.fit();
    },

    /** scale the whole stage so the composition fits the pinned viewport.
        Scaling beats narrowing the device: the in-app type is fixed-px, so
        a narrower frame would crush the layout inside it. */
    fit() {
      const grid = $('.stage__grid'), pin = $('.stage__pin'), cap = $('.stage__caption');
      if (!grid || !pin) return;
      if (!this.on) {
        grid.style.removeProperty('--fit');
        pin.style.removeProperty('--band-shift');
        return;
      }
      /* The usable band runs from the bottom of the sticky nav to the top of
         the caption. Measure the caption rather than guessing at it — it
         wraps to two or three lines depending on width. */
      const NAV = 62, GAP = 14;
      const capH = (cap ? cap.offsetHeight : 40) + 12;   // + its bottom inset
      const avail = pin.clientHeight - NAV - capH - GAP * 2;
      const natural = grid.offsetHeight;                 // transforms do not affect layout
      if (natural < 200) return;
      grid.style.setProperty('--fit', Math.max(0.5, Math.min(1, avail / natural)).toFixed(4));
      // centre on the band, not on the viewport
      pin.style.setProperty('--band-shift', ((NAV - capH) / 2).toFixed(1) + 'px');
    },

    /** 0 → 1 across the scrollable part of the track */
    progress() {
      const r = this.track.getBoundingClientRect();
      const total = this.track.offsetHeight - innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -r.top / total));
    },

    /* Decided synchronously on the scroll event, deliberately.
       requestAnimationFrame gets starved when the page is not otherwise
       animating, which left each screen change waiting for the *next*
       scroll to force a repaint — the screens then landed a segment late.
       The body is one rect read and an early return unless the segment
       actually changed, so this is cheap enough to run inline. */
    tick() {
      if (!this.on || !this.track) return;
      const p = this.progress();
      const cap = $('.stage__caption');
      if (cap) cap.classList.toggle('is-moved', p > 0.04);

      // a click-driven smooth scroll owns the page until it lands
      if (Date.now() < this.lock) return;

      const i = Math.min(FLOW.length - 1, Math.floor(p * FLOW.length));
      if (i === this.idx) return;
      this.idx = i;
      this.paint();
      const f = FLOW[i];
      S.role = f.role;
      go(f.id, true);
    },

    paint() {
      $$('.sdot').forEach((b, i) => b.classList.toggle('is-on', i === this.idx));
    },

    /** scroll the page so (name, role) becomes the pinned segment.
        If the pair has no segment — the teacher has no Tutor screen —
        leave the scroll position alone rather than jumping somewhere wrong. */
    seek(name, role) {
      if (!this.on || !this.track) return;
      const want = role || S.role;
      const i = FLOW.findIndex(f => f.id === name && f.role === want);
      if (i < 0 || i === this.idx) return;
      this.idx = i;
      this.paint();
      this.lock = Date.now() + 1200;
      const total = this.track.offsetHeight - innerHeight;
      if (total <= 0) return;
      const docTop = this.track.getBoundingClientRect().top + window.scrollY;
      const top = docTop + ((i + 0.5) / FLOW.length) * total;
      try { scrollTo({ top: Math.round(top), behavior: 'smooth' }); }
      catch (e) { scrollTo(0, Math.round(top)); }
    },
  };


  function go(name, fromScroll) {
    if (!V[name]) return;
    stopTimers();
    const vp = $('#viewport');
    if (!vp) return;

    /* A fast scroll can call go() several times inside one 320ms exit
       transition. querySelector only ever returned the first view, so the
       ones in the middle were never scheduled for removal and piled up.
       Hard-drop anything already stale, and keep at most two. */
    const views = $$('.view', vp);
    while (views.length > 1) views.shift().remove();
    const old = views[0] || null;

    const back = TABS.findIndex(t => t.id === name) < TABS.findIndex(t => t.id === S.screen);
    S.screen = name;

    if (old) {
      old.classList.remove('is-active');
      if (back) old.classList.add('is-back');
      setTimeout(() => { if (old.parentNode) old.remove(); }, 320);
    }
    const v = h(`<section class="view${back ? ' is-back' : ''}">${V[name]()}</section>`);
    vp.appendChild(v);
    void v.offsetWidth;
    v.classList.remove('is-back');
    v.classList.add('is-active');

    $$('.tab').forEach(b => b.classList.toggle('is-on', b.dataset.v === name));
    setScene(name);
    setNotes(name);
    Trace.paint();

    if (!fromScroll) {
      SCROLLY.seek(name);
      if (history.replaceState) history.replaceState(null, '', '#' + name);
    }
  }

  function scrollBottom() {
    const v = $('.view.is-active');
    if (v) after(60, () => { v.scrollTop = v.scrollHeight; });
  }

  function toast(msg, ic) {
    const t = $('#toast');
    if (!t) return;
    t.innerHTML = I(ic || 'spark') + '<span>' + msg + '</span>';
    t.classList.add('is-on');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('is-on'), 3600);
  }

  function vibrate() { if (navigator.vibrate) try { navigator.vibrate(18); } catch (e) {} }

  /* ---- doodle scene + notes ---- */
  function setScene(name) {
    const key = $('#sheet') && $('#sheet').classList.contains('is-up') ? 'trace' : name;
    $$('.dscene').forEach(s => s.classList.toggle('is-live', s.dataset.k === key));
  }

  function setNotes(name) {
    const key = $('#sheet') && $('#sheet').classList.contains('is-up') ? 'trace' : name;
    const set = DD.NOTES[key] || DD.NOTES.home;
    ['left', 'right'].forEach(side => {
      const rail = $('.rail--' + side);
      if (!rail) return;
      rail.innerHTML = (set[side] || []).map((n, i) => `
        <article class="note" style="transition-delay:${i * 110}ms">
          <span class="note__k"><i></i>${n.k}</span>
          <h4>${n.h}</h4>
          <p>${n.p}</p>
          ${n.hand ? `<span class="hand">${n.hand}</span>` : ''}
          ${n.svg ? DD.mini('0 0 280 100', n.svg()) : ''}
        </article>`).join('');
      requestAnimationFrame(() => $$('.note', rail).forEach(e => e.classList.add('is-in')));
    });
  }

  function buildScenes() {
    const layer = $('#doodles');
    if (!layer) return;
    layer.innerHTML = Object.keys(DD.SCENES).map(k =>
      `<div class="dscene" data-k="${k}"><svg viewBox="0 0 1360 940" preserveAspectRatio="xMidYMid meet">
         <g class="rough">${DD.SCENES[k]()}</g></svg></div>`).join('');
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  const ACT = {
    go:   (v) => go(v),
    seek: (v) => { const f = FLOW[Number(v)]; S.role = f.role; go(f.id); },
    back: () => go('home'),

    tier: () => {
      const i = D.tierOrder.indexOf(S.tier);
      S.tier = D.tierOrder[(i + 1) % D.tierOrder.length];
      render();
      updateSignal();
      toast(S.tier === 'T0'
        ? 'Airplane mode. Every feature still completes — nothing degraded.'
        : S.tier === 'T1'
          ? 'One bar. Text deltas queue; the UI never blocks or spins.'
          : 'Good signal. Burst sync on. Escalation still needs confidence < 0.70.',
        S.tier === 'T0' ? 'wifiOff' : 'wifi');
    },

    role: (v) => { S.role = v; render(); SCROLLY.seek(S.screen, v); },

    trace: () => toggleSheet(true),
    closeSheet: () => toggleSheet(false),

    /* tutor */
    prob: (v) => { resetTutor(v); render(); },
    kb:   () => { S.tutor.kb = !S.tutor.kb; render(); },
    scan: () => runScan(),
    confirmScan: () => {
      const t = S.tutor;
      t.mode = 'work'; t.scanned = true; t.kb = false;
      Trace.add('cas.check', 'confirmed by the student', 8, true);
      render();
      after(260, runCheck);
    },
    check: () => { render(); after(30, runCheck); },
    fix:  () => applyFix(),
    why:  () => showWhy(),
    lang: (v) => { S.lang = v; Trace.add('speak', D.langNames[v] + ' · Android TTS', 300, true); paintPlayer(); toast('Narration switched to ' + D.langNames[v] + '. Voice pack is on-device.', 'volume'); },
    pp:   () => { S.tutor.playing = !S.tutor.playing; paintPlayer(); if (S.tutor.playing) stepLoop(); else stopTimers(); },
    pushvid: () => { Trace.add('class.broadcast', 'walkthrough.mp4 · 8 clients', 46, true); toast('Walkthrough pushed. Every joined device has it now.', 'share'); },
    key: (v) => {
      const t = S.tutor;
      if (v === '⌫') t.draft = t.draft.slice(0, -1);
      else if (v === '⏎') {
        if (t.draft.trim()) { toast('Line added. Tap “Check my working” to verify it against line ' + (D.problems.find(x => x.id === t.pid).lines.length) + '.', 'check'); t.draft = ''; }
      } else t.draft += (v === 'd x' ? ' dx' : v);
      const mf = $('#mf');
      if (mf) mf.innerHTML = t.draft
        ? esc(t.draft) + '<span class="mathfield__caret"></span>'
        : '<span class="mathfield__ph">tap keys to add a line…</span><span class="mathfield__caret"></span>';
    },

    /* notebook */
    src: (v) => {
      S.nb.src = v;
      if (!S.nb.indexed[v]) { render(); after(40, runIngest); }
      else render();
    },
    ask: () => { const i = $('#ask'); if (i) { ask(i.value); i.value = ''; } },
    q:   (v) => ask(v),
    cite: (v) => {
      const m = S.nb.thread.slice().reverse().find(x => String(x.cite) === String(v));
      if (m) { m.open = !m.open; render(); }
    },

    /* quiz */
    gen:  () => runGenerate(),
    keep: (v) => { delete S.quiz.killed[v]; render(); },
    kill: (v) => { S.quiz.killed[v] = true; render(); },
    regen: () => { resetQuiz(); render(); },
    push: () => pushQuiz(),
    csv:  () => exportCSV(),
    reset: () => { resetQuiz(); render(); },
    ans:  (v) => {
      const q = S.quiz;
      const items = D.quiz.filter(x => x.ok);
      q.sAns = Number(v);
      if (q.sAns === items[q.sIdx].a) q.answered++;
      Trace.reset();
      Trace.add('quiz.grade', 'local · 0 round trips', 4, true);
      Trace.add('progress.write', D.student.name + ' · chunk ' + items[q.sIdx].src, 9, true);
      Trace.say({ k: q.sAns === items[q.sIdx].a ? 'ok' : 'warn', t: q.sAns === items[q.sIdx].a ? 'correct' : 'incorrect · logged', d: 'Grading is a local function call, not a request. That is why it is instant at T0 and why assigned mode works with the radios off.' }, 0.99);
      render(); vibrate();
    },
    next: () => { S.quiz.sIdx++; S.quiz.sAns = null; render(); },

    /* classroom */
    start: () => startClass(),
    capture: () => capture(),
    pushnotes: () => pushNotes(),
    pdf: () => toast('notes.pdf saved. It opens with no network, forever.', 'download'),
  };

  function toggleSheet(up) {
    const sh = $('#sheet'), sc = $('#scrim');
    if (!sh) return;
    sh.classList.toggle('is-up', up);
    sc.classList.toggle('is-on', up);
    setScene(S.screen);
    setNotes(S.screen);
    if (up) Trace.paint();
  }

  function updateSignal() {
    const el = $('#sig');
    if (!el) return;
    el.innerHTML = S.tier === 'T0' ? I('wifiOff') : I('wifi');
    el.style.color = S.tier === 'T0' ? 'var(--red)' : S.tier === 'T1' ? 'var(--amber-2)' : 'var(--green-2)';
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    /* phone chrome */
    const clock = $('#clock');
    const tick = () => {
      if (!clock) return;
      const d = new Date();
      clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    };
    tick(); setInterval(tick, 20000);

    $('#tabbar').innerHTML = TABS.map(t =>
      `<button class="tab ${t.id === 'home' ? 'is-on' : ''}" data-act="go" data-v="${t.id}">${I(t.ic)}<span>${t.t}</span></button>`).join('');

    buildScenes();
    updateSignal();
    SCROLLY.init();

    /* delegated clicks */
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const fn = ACT[b.dataset.act];
      if (!fn) return;
      e.preventDefault();
      fn(b.dataset.v);
    });

    $('#ask') && null;
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'ask' && e.key === 'Enter') { ACT.ask(); return; }
      if (e.target.tagName === 'INPUT') return;
      const n = TABS[Number(e.key) - 1];
      if (n) { go(n.id); return; }
      if (e.key.toLowerCase() === 't') ACT.tier();
      if (e.key.toLowerCase() === 'r') { S.role = S.role === 'student' ? 'teacher' : 'student'; render(); }
      if (e.key === 'Escape') toggleSheet(false);
    });

    $('#scrim').addEventListener('click', () => toggleSheet(false));

    /* first paint */
    const start = (location.hash || '').replace('#', '');
    go(V[start] ? start : 'home');
    requestAnimationFrame(() => SCROLLY.fit());
  }

  /* site chrome: theme, nav, reveal */
  function site() {
    const root = document.documentElement;
    // Light (notebook paper) is the default the demo is designed around.
    // We only leave it if the visitor asked for the blackboard themselves.
    const saved = (() => { try { return localStorage.getItem('eduqoo-theme'); } catch (e) { return null; } })();
    root.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');

    const setIcon = () => {
      const b = $('#themeBtn');
      if (b) b.innerHTML = I(root.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon');
    };
    setIcon();
    const tb = $('#themeBtn');
    if (tb) tb.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('eduqoo-theme', next); } catch (e) {}
      setIcon();
    });

    const nav = $('.nav');
    const onScroll = () => nav && nav.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }), { threshold: .12 });
      $$('.reveal').forEach(e => io.observe(e));
    } else {
      $$('.reveal').forEach(e => e.classList.add('is-in'));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { site(); boot(); });
  else { site(); boot(); }
})();
