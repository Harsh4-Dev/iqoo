# EduQoo

**One phone. A whole classroom. Zero internet required.**

A tappable prototype of a local agent runtime for the disconnected classroom, built for the
[iQOO Hackathon](https://iqoo.reskilll.com/) — Track 02, Smart Education.

**→ [harsh4-dev.github.io/iqoo](https://harsh4-dev.github.io/iqoo/)**

---

## What this repository is

This is the **prototype site**, not the Android app. It is a single static page that runs a
fully interactive simulation of EduQoo in a phone frame, surrounded by hand-drawn annotations
that change with whatever screen the app is on. Nothing in it is a screenshot: the CAS check
really animates line by line, the notebook really refuses off-syllabus questions, the quiz
verifier really throws two of seven questions away, and the CSV export really downloads a file.

It exists so a judge, a teammate or a reviewer can understand the whole product in ninety
seconds without installing an APK.

The design documents that specify the real build live alongside it:

| File | What it argues |
|---|---|
| [`SlateAI_iQOO_Pitch.md`](SlateAI_iQOO_Pitch.md) | **Why** — the premise, SlateCore, the scoring strategy, the risk register |
| [`SlateAI_Feature_Spec.md`](SlateAI_Feature_Spec.md) | **What ships** — four pillars, scope tiers, build order, hour-by-hour plan |
| [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) | **The launch film** — timecoded edit, voice-over, b-roll shot list, music and transition direction |

The launch keynote itself lives at [`deck/`](deck/) — twenty self-running slides at
1920×1080 with the device morphing between them, built to be screen-recorded. Press
**F** for fullscreen, **H** to hide the controls, **C** to toggle burn-in captions.

---

## The product in one paragraph

The teacher's iQOO phone raises an access point with no uplink behind it and serves a web
client from an embedded Ktor server. Thirty students join in a browser by scanning a QR — no
install, no Play Store, no account, no data plan. On that one phone runs **SlateCore**: a local
agent runtime with a typed tool registry, schema-constrained decoding, two-pass execution and a
verifier layer, driving a 2B model entirely on the device's own silicon. Four surfaces sit on
top of it.

| Pillar | One line |
|---|---|
| **ClassDrop** | Push anything to thirty devices with no internet and no app installs |
| **StudyDesk** | Import a chapter, ask it questions, get answers that cite the line they came from |
| **ClassTest** | Live paced quizzes and offline tests, auto-generated, auto-graded, with a class heatmap |
| **StepTutor** | Finds the exact line you went wrong on, then plays an animated, spoken walkthrough |

**The design rule:** every feature must complete at **T0** — no network at all. T1 (one bar) and
T2 (good signal) make it faster or richer, never *possible*.

---

## What to try in the prototype

1. **Tap the connectivity strip** at the top of the phone to cycle T0 → T1 → T2. Nothing
   degrades. That is the whole thesis in one control.
2. **Tutor →** *Check my working.* Watch Symja check each line against the one above it and flag
   line 3. Then *Show me why* for the narrated walkthrough — switch it to Tamil or Hindi.
3. **Notebook →** ask "Why + C?" and tap the citation. Then ask the off-syllabus question and
   watch it refuse rather than invent.
4. **Quiz →** switch to **Teacher**, generate seven questions, and see the verifier reject two of
   them. Push live, watch the heatmap build, then export the CSV — it is a real file.
5. **Classroom →** start the class. The QR is genuinely scannable. Capture the board, push the
   notes, then flip to **Student** to read them.
6. **The `SlateCore` chip** at the bottom right of the phone opens the runtime trace: two-pass
   execution, the tool call log, the context budget and the verifier's verdict for the last turn.

Keyboard: <kbd>1</kbd>–<kbd>5</kbd> switch tabs, <kbd>T</kbd> cycles the tier,
<kbd>R</kbd> flips student/teacher, <kbd>Esc</kbd> closes the trace.

---

## The three technical claims

**1 · Constrained decoding is the foundation, not a nicety.**
LiteRT-LM enforces the JSON schema at the decoding level, so compliance is guaranteed by the
engine rather than parsed and hoped for. On Gemma 4 edge builds that is worth roughly a model
generation of reliability for about 0.06s of latency — which is why 2B is enough here.

**2 · Tool Suppression, and the fix.**
Enable schema constraints and tool calling in the *same* pass and open-weight models quietly
stop invoking tools: the grammar mask makes tool-call tokens unreachable while the output stays
schema-valid. SlateCore uses transparent two-pass execution — pass 1 decides and runs tools,
pass 2 formats under the schema. You can watch both passes in the trace inspector.

**3 · The model never adjudicates mathematics.**
A computer algebra system decides what is true; the model only phrases the explanation. The
tutor does not know methods — it checks whether line *n* is algebraically equivalent to line
*n−1*, and the first break is the error. One code path covers arithmetic through triple
integrals, and the walkthrough animation is *rendered* from the CAS trace, so it cannot show a
wrong step.

---

## Running it locally

No build step, no dependencies, no bundler.

```bash
python -m http.server 5599
```

Then open <http://localhost:5599>. Any static server works; `file://` does not, because the
page loads its scripts as separate files.

### Layout

```
index.html              the whole page
assets/css/tokens.css   design tokens — light = notebook paper, dark = blackboard
assets/css/site.css     landing page shell
assets/css/phone.css    device frame and every in-app component
assets/css/doodle.css   the hand-drawn layer: draw-on strokes, wobble filter
assets/js/data.js       the demo corpus — real NCERT Class 12 Ch.7 content
assets/js/icons.js      24px stroke icon set
assets/js/doodles.js    generated SVG scenes, one per app screen
assets/js/qr.js         a real, scannable QR matrix
assets/js/app.js        the prototype runtime: state, screens, router, trace
deck/index.html         the launch keynote (see VIDEO_SCRIPT.md)
```

The doodle scenes are generated, not drawn: `doodles.js` has a seeded PRNG and a set of
hand-drawn primitives (`hRect`, `hArrow`, `hCyl`, …) so every stroke wobbles deterministically
and animates itself on when its screen becomes active.

---

## Deployment

GitHub Pages, from the default branch root. `.nojekyll` is present so nothing is preprocessed.

---

## Status and honesty

This is a **prototype of the product**, driven by scripted state — not the Android build. It
exists to communicate the design and to rehearse the demo. Everything it claims about the real
system is specified in the two design documents, including the parts that are explicitly out of
scope: generative video, Tamil handwriting OCR, continuous camera explanation, cloud accounts,
and auto-grading handwritten long-form answers.

A clean *"no, and here's why"* beats a broken yes.
