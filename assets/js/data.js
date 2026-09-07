/* ============================================================
   EduQoo — demo corpus
   Everything the prototype answers with is in this file.
   The content is real (NCERT Class 12, Chapter 7 — Integrals),
   so every citation the app shows can actually be checked.
   ============================================================ */

const DATA = {

  student: {
    name: 'Aditi',
    grade: 'Class 12',
    lang: 'ta',
    weak: ['constant of integration', 'ILATE order', 'definite limits'],
  },

  teacher: { name: 'Mrs. Rajan', school: 'GHSS Perambur' },

  /* ---------------------------------------------------------
     The one source in the notebook. 9 chunks, ~300 tokens each
     in the real build; abbreviated here to their leading lines.
     --------------------------------------------------------- */
  chapter: {
    id: 'ncert-12-ch7',
    title: 'Integrals',
    sub: 'NCERT Class 12 · Chapter 7',
    pages: 42,
    size: '3.1 MB',
    chunks: [
      { n: 1, p: 287, t: 'Integration is the inverse process of differentiation. If the derivative of a function F(x) is f(x), then F(x) is called an antiderivative, or an indefinite integral, of f(x).' },
      { n: 2, p: 287, t: 'We write ∫f(x) dx = F(x) + C, where C is an arbitrary constant called the constant of integration. The symbol ∫ is the integral sign and f(x) is the integrand.' },
      { n: 3, p: 288, t: 'The constant C cannot be dropped. Since d/dx[F(x) + C] = f(x) for every real value of C, a function has infinitely many antiderivatives, differing from one another only by a constant.' },
      { n: 4, p: 290, t: 'Power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C, valid for every n ≠ −1. For the excluded case n = −1 the result is ∫(1/x) dx = log|x| + C.' },
      { n: 5, p: 291, t: 'Integration is linear: ∫[a·f(x) + b·g(x)] dx = a∫f(x) dx + b∫g(x) dx. A constant factor may be taken outside the integral sign.' },
      { n: 6, p: 293, t: 'Standard forms: ∫sin x dx = −cos x + C; ∫cos x dx = sin x + C; ∫sec²x dx = tan x + C; ∫eˣ dx = eˣ + C.' },
      { n: 7, p: 304, t: 'Integration by substitution: if x = g(t), then ∫f(x) dx = ∫f(g(t))·g′(t) dt. The method replaces a difficult integrand with a simpler one in a new variable.' },
      { n: 8, p: 318, t: 'Integration by parts: ∫u·v dx = u∫v dx − ∫[(du/dx)·∫v dx] dx. The first function u is chosen by the ILATE order: Inverse, Logarithmic, Algebraic, Trigonometric, Exponential.' },
      { n: 9, p: 331, t: 'Definite integral: ∫ₐᵇ f(x) dx = F(b) − F(a), where F is any antiderivative of f. This is the Fundamental Theorem of Calculus — the constant of integration cancels between the two limits.' },
    ],
  },

  /* Grounded answers. `cite` indexes chapter.chunks by n. */
  qa: [
    {
      k: ['+ c', 'constant', 'why c', 'why do we add'],
      q: 'Why do we always add + C?',
      a: 'Because differentiating kills constants. If F(x) is one antiderivative of f(x), then F(x) + C is an antiderivative for <b>every</b> real C — they all have the same derivative. So a function has infinitely many antiderivatives and C names the whole family. Drop it and you have named only one member.',
      cite: 3,
      conf: 0.94,
    },
    {
      k: ['power rule', 'x^n', 'xn dx'],
      q: 'What is the power rule for integration?',
      a: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C, for every n ≠ −1. The exclusion matters: at n = −1 the formula would divide by zero, and the real answer is ∫(1/x) dx = log|x| + C.',
      cite: 4,
      conf: 0.96,
    },
    {
      k: ['by parts', 'ilate', 'choose u', 'which function first'],
      q: 'How do I choose u in integration by parts?',
      a: 'Use the <b>ILATE</b> order — Inverse, Logarithmic, Algebraic, Trigonometric, Exponential. Whichever type appears first in that list becomes u. The formula is ∫u·v dx = u∫v dx − ∫[(du/dx)·∫v dx] dx.',
      cite: 8,
      conf: 0.91,
    },
    {
      k: ['definite', 'limits', 'fundamental theorem', 'a to b'],
      q: 'Do I still need + C for a definite integral?',
      a: 'No. ∫ₐᵇ f(x) dx = F(b) − F(a), and the constant appears in both terms with opposite signs, so it cancels. It only disappears once you apply the limits — it is still there in the antiderivative.',
      cite: 9,
      conf: 0.93,
    },
    {
      k: ['substitution', 'u sub', 'change variable'],
      q: 'When should I use substitution?',
      a: 'When the integrand contains a function and something close to its derivative. Setting x = g(t) turns ∫f(x) dx into ∫f(g(t))·g′(t) dt, which is chosen to be simpler in the new variable.',
      cite: 7,
      conf: 0.89,
    },
    {
      k: ['sin', 'cos', 'standard form', 'trig'],
      q: 'What are the standard trigonometric integrals?',
      a: '∫sin x dx = −cos x + C, ∫cos x dx = sin x + C, and ∫sec²x dx = tan x + C. Note the minus sign on the first one — it is the single most common slip in this chapter.',
      cite: 6,
      conf: 0.95,
    },
  ],

  /* Questions the app must refuse. This is the honesty demo. */
  refusals: [
    { k: ['world cup', 'cricket', 'ipl', 'sachin'],           was: 'a cricket question' },
    { k: ['newton', 'third law', 'physics', 'force'],         was: 'a physics question' },
    { k: ['photosynthesis', 'biology', 'mitochondria'],       was: 'a biology question' },
    { k: ['capital of', 'president', 'prime minister'],       was: 'a general-knowledge question' },
    { k: ['matrix', 'determinant', 'eigen'],                  was: 'a Chapter 3 & 4 question' },
  ],

  /* ---------------------------------------------------------
     StepTutor problems. Each has a planted error.
     `cas` is the literal Symja call the verifier runs.
     --------------------------------------------------------- */
  problems: [
    {
      id: 'p1',
      title: 'Indefinite integral',
      level: 'Class 12 · Ex 7.1',
      lines: [
        { x: '∫(2x + 3) dx',        cas: null },
        { x: '= x² + 3x + C',        cas: 'Simplify[ D[x^2+3x+C, x] - (2x+3) ]', got: '0',   ok: true  },
        { x: '= x² + 3x',            cas: 'Simplify[ (x^2+3x) - (x^2+3x+C) ]',    got: '-C',  ok: false },
      ],
      badLine: 2,
      why: 'The constant of integration was dropped between line 2 and line 3. Those are different families of functions.',
      fix: '= x² + 3x + C',
      steps: [
        { e: '∫(2x + 3) dx',           h: null,     cc: 'We start from the integral of 2x plus 3.' },
        { e: '= ∫2x dx + ∫3 dx',   h: '∫3 dx', cc: 'Integration is linear, so split it term by term.' },
        { e: '= x² + 3x',              h: 'x²',    cc: 'Each term integrates by the power rule.' },
        { e: '= x² + 3x + C',          h: 'C',      cc: 'Add the constant of integration. This is the step that was dropped.' },
      ],
    },
    {
      id: 'p2',
      title: 'Definite integral by parts',
      level: 'Class 12 · Ex 7.6 — harder',
      lines: [
        { x: '∫₀^(π/2) x·cos x dx',   cas: null },
        { x: '= [x·sin x]₀^(π/2) − ∫₀^(π/2) sin x dx', cas: 'Simplify[ D[x*Sin[x],x] - (x*Cos[x] + Sin[x]) ]', got: '0', ok: true },
        { x: '= π/2 − [−cos x]₀^(π/2)', cas: 'Simplify[ Integrate[Sin[x],x] - (-Cos[x]) ]', got: '0', ok: true },
        { x: '= π/2 − 1',            cas: 'Simplify[ (Pi/2 - 1) - Integrate[x*Cos[x],{x,0,Pi/2}] ]', got: '0', ok: true },
        { x: '= π/2 + 1',            cas: 'Simplify[ (Pi/2 + 1) - (Pi/2 - 1) ]', got: '2', ok: false },
      ],
      badLine: 4,
      why: 'The sign flipped on the last simplification. −[−cos x] evaluated over the limits gives −1, not +1.',
      fix: '= π/2 − 1',
      steps: [
        { e: '∫₀^(π/2) x·cos x dx',  h: null, cc: 'A definite integral, solved by parts.' },
        { e: 'u = x,  v = cos x',      h: 'u = x', cc: 'By ILATE, the algebraic term x becomes u.' },
        { e: '= [x·sin x]₀^(π/2) − ∫₀^(π/2) sin x dx', h: '− ∫₀^(π/2) sin x dx', cc: 'Apply the by-parts formula.' },
        { e: '= π/2 − 1',           h: '− 1', cc: 'Evaluate both limits. The sign here is what was lost.' },
      ],
    },
  ],

  /* Narration per step, per language. Index matches problem.steps. */
  narration: {
    p1: {
      en: [
        'We start from the integral of two x plus three.',
        'Integration is linear, so we split it term by term.',
        'Each term integrates by the power rule: two x gives x squared, three gives three x.',
        'Now add the constant of integration, C. This is the step you dropped on line three.',
      ],
      hi: [
        'हम 2x जमा 3 के समाकलन से शुरू करते हैं।',
        'समाकलन रैखिक है, इसलिए इसे पद-दर-पद अलग कीजिए।',
        'प्रत्येक पद घात नियम से समाकलित होता है — 2x से x वर्ग, 3 से 3x।',
        'अब समाकलन अचर C जोड़िए। यही वह चरण है जो आपने पंक्ति तीन में छोड़ दिया।',
      ],
      ta: [
        '2x கூட்டல் 3 இன் தொகையீட்டில் தொடங்குவோம்.',
        'தொகையீடு நேரியானது, எனவே ஒவ்வொரு உறுப்பாகப் பிரிக்கலாம்.',
        'ஒவ்வொரு உறுப்பும் அடுக்கு விதிப்படி தொகையிடப்படுகிறது.',
        'இப்போது தொகையீட்டு மாறிலி C ஐச் சேர்க்கவும். வரி மூன்றில் நீங்கள் விட்டது இதுதான்.',
      ],
    },
  },

  langNames: { en: 'English', hi: 'हिन्दी', ta: 'தமிழ்' },

  /* ---------------------------------------------------------
     ClassTest — generated from the chapter, then verified.
     `killed` items are the ones the verifier rejects on stage.
     --------------------------------------------------------- */
  quiz: [
    {
      q: 'A function f(x) has how many antiderivatives?',
      o: ['Exactly one', 'Exactly two', 'Infinitely many, differing by a constant', 'None unless f is continuous'],
      a: 2, src: 3, d: 'recall', ok: true,
    },
    {
      q: '∫x⁵ dx equals',
      o: ['x⁶/6 + C', '5x⁴ + C', 'x⁶ + C', '6x⁶ + C'],
      a: 0, src: 4, d: 'apply', ok: true,
    },
    {
      q: 'For which value of n does the power rule fail?',
      o: ['n = 0', 'n = 1', 'n = −1', 'n = 2'],
      a: 2, src: 4, d: 'analyse', ok: true,
    },
    {
      q: 'In ILATE, which function type is chosen as u first?',
      o: ['Exponential', 'Inverse trigonometric', 'Algebraic', 'Logarithmic'],
      a: 1, src: 8, d: 'recall', ok: true,
    },
    {
      q: '∫sin x dx equals',
      o: ['cos x + C', '−cos x + C', 'sin x + C', '−sin x + C'],
      a: 1, src: 6, d: 'apply', ok: true,
    },
    /* --- these two are what the verifier throws away --- */
    {
      q: 'The integral of a function is always positive.',
      o: ['True', 'False', 'Only for x > 0', 'Cannot say'],
      a: 1, src: 2, d: 'recall', ok: false,
      kill: 'sourceLine 2 does not support this claim — grounding check failed.',
    },
    {
      q: '∫₀¹ 2x dx equals',
      o: ['1', '2', '0', '1/2'],
      a: 1, src: 9, d: 'apply', ok: false,
      kill: 'Symja disagrees with the answer key: Integrate[2x,{x,0,1}] = 1, not 2.',
    },
  ],

  concepts: [
    'Constant of integration', 'Power rule', 'Linearity',
    'Standard forms', 'Substitution', 'By parts (ILATE)',
  ],

  /* Class heatmap: 6 concepts x 6 students, 0 (bad) .. 3 (good) */
  heat: [
    [3,3,2,3,3,3, 0,1,0,2,1,0, 3,2,3,3,2,3,
     2,3,3,2,3,2, 1,0,1,1,2,0, 0,1,1,0,2,1],
  ][0],

  roster: [
    { n: 'Aditi R.',    d: 'Chrome / Android 11', c: '#E29A2E' },
    { n: 'Karthik S.',  d: 'Safari / iPhone 8',   c: '#23955F' },
    { n: 'Priya M.',    d: 'Chrome / Android 9',  c: '#5C4EC2' },
    { n: 'Ravi Kumar',  d: 'Firefox / laptop',    c: '#2C6BB0' },
    { n: 'Sneha T.',    d: 'Chrome / Android 12', c: '#D14C27' },
    { n: 'Arjun V.',    d: 'Safari / iPad 6',     c: '#157A4A' },
    { n: 'Meera N.',    d: 'Chrome / Android 10', c: '#C77F17' },
    { n: 'Vikram J.',   d: 'Samsung Internet',    c: '#6A7C79' },
  ],

  /* Board capture -> cleaned notes */
  board: {
    raw: '∫(2x+3)dx = x²+3x+C\n\nPower rule  ∫xⁿ = xⁿ⁺¹/(n+1)\n   n ≠ −1 !!\n\nHW: Ex 7.1  Q4-Q11',
    notes: [
      { h: 'Today — Indefinite integrals', b: 'Worked example: ∫(2x + 3) dx = x² + 3x + C' },
      { h: 'Power rule', b: '∫xⁿ dx = xⁿ⁺¹/(n + 1) + C, valid for all n ≠ −1.' },
      { h: 'Homework', b: 'Exercise 7.1, questions 4 to 11. Due Thursday.' },
    ],
  },

  /* SlateCore tool registry, as shown in the trace inspector */
  tools: [
    { n: 'cas.check',        s: 'lines[] → firstBreak', c: '#D14C27' },
    { n: 'cas.solveSteps',   s: 'problem → step[]',      c: '#D14C27' },
    { n: 'retrieve',         s: 'query, k → chunk[]',    c: '#5C4EC2' },
    { n: 'ocr',              s: 'image → text',          c: '#2C6BB0' },
    { n: 'speak',            s: 'text, lang → wav',      c: '#23955F' },
    { n: 'quiz.generate',    s: 'src, n → question[]',   c: '#E29A2E' },
    { n: 'class.broadcast',  s: 'artifact → receipts',   c: '#157A4A' },
    { n: 'progress.write',   s: 'student, concept',       c: '#6A7C79' },
  ],

  tiers: {
    T0: { t: 'T0 · Fully offline',  s: 'Airplane mode. Nothing degrades.',        cta: 'tap to test' },
    T1: { t: 'T1 · One bar',        s: 'Text syncs. Media queues. UI never blocks.', cta: 'tap to test' },
    T2: { t: 'T2 · Good signal',    s: 'Burst sync. Hard questions may escalate.',   cta: 'tap to test' },
  },
  tierOrder: ['T0', 'T1', 'T2'],
};

window.DATA = DATA;
