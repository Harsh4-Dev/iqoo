# EduQoo

**It reads the page, finds the wrong step, and says why — in Tamil.**

An on-device multilingual math tutor for rural and government classrooms. Built for the
[iQOO Hackathon 2026](https://iqoo.reskilll.com/guide) — Track 02, Smart Education,
Chennai City Battle (12–13 Sept 2026).

**Prototype → [harsh4-dev.github.io/iqoo](https://harsh4-dev.github.io/iqoo/)**

---

## The product

Photograph a student's handwritten working. On-device ink recognition reads each step, a
symbolic solver finds the first line that stops being algebraically true, a red boundary is
drawn on that exact step, and a quantised Gemma-2-2B explains the fix out loud in the child's
own language.

No internet. No server. No API key. No account.

```
3x + 5 = 20
3x = 25        ← the five was added instead of subtracted
x = 25/3
```

Marking the answer wrong teaches nothing. Pointing at line two teaches the rule.

| | |
|---|---|
| **Target user** | Primary and middle-school students and teachers in low-connectivity areas |
| **MVP** | Page scan → ink recognition → parse → line-level error → spoken correction |
| **Stretch** | Teacher analytics: per-concept class heatmap, CSV pulled to a laptop over Office Kit |
| **Runs at** | T0 — no network at all. Every stage is local. |

**The safety property:** the language model never decides whether the mathematics is right. A
deterministic solver does. The model only phrases the explanation. A wrong correction on a
child's homework is a harm, not a bad output, so the part that can hallucinate is only ever
allowed to write the sentence — never the verdict.

---

## This repository

| Path | What it is |
|---|---|
| [`index.html`](index.html) | The **interactive prototype** — a full simulation of the app in a phone frame, plus the design rationale. Nothing in it is a screenshot. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | The **technical reference** for the Android build: modules, pipeline contracts, threading, storage, error handling, build order, constraints. |
| [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) | The launch film: timecoded edit, voice-over, b-roll shot list |
| [`NARRATION.md`](NARRATION.md) | How to record the deck, and the ~8 minute narration script written for ElevenLabs |
| [`docs/EduQoo-Architecture.pdf`](docs/EduQoo-Architecture.pdf) | The architecture reference as a print-ready PDF |
| [`deck/`](deck/) | The presentation deck, 1920×1080, self-running, built to be screen-recorded |
| [`SlateAI_iQOO_Pitch.md`](SlateAI_iQOO_Pitch.md) · [`SlateAI_Feature_Spec.md`](SlateAI_Feature_Spec.md) | Earlier design documents. They predate the current name and scope and still use the working names **SlateAI** / **SlateCore**; the runtime is now **EduQoo Core**. |

---

## What to try in the prototype

**Scroll the page and the phone walks through every screen** — the five student screens, then
it flips to the teacher and walks through those too:

```
Home → Tutor → Notebook → Quiz → Class   ·   Teacher → Review → Hotspot
```

The annotations and the background sketch change with it. The rail on the right jumps straight
to any screen, as do the tabs, the tiles, the role toggle, and keys <kbd>1</kbd>–<kbd>5</kbd>.
The stage scales itself to whatever window you have, so this works without maximising; below
1041px wide it falls back to plain scrolling.

1. **Tutor → Scan the page.** The whole MVP path: the viewfinder reads three handwritten
   steps, one comes back at 71% confidence and the app stops to ask you to confirm it, then a
   red boundary lands on line two. Tap **Show me why** for the spoken walkthrough and switch
   it between Tamil, Hindi and English.
2. **Tap the connectivity strip** at the top to cycle T0 → T1 → T2. Nothing degrades.
3. **The `EduQoo Core` chip** at the bottom right opens the runtime trace: two-pass execution,
   the tool call log with per-call timings, the context budget, and the verifier's verdict.
4. **Quiz →** switch to **Teacher** and export the CSV. It is a real download.
5. **Classroom →** start the class. The QR is genuinely scannable.

Keyboard: <kbd>1</kbd>–<kbd>5</kbd> jump between screens, <kbd>T</kbd> cycles the tier,
<kbd>R</kbd> flips student/teacher, <kbd>Esc</kbd> closes the trace.

---

## Stack

| Layer | Choice |
|---|---|
| App | Native Android, Kotlin + Jetpack Compose |
| Capture | CameraX — single still, no analysis loop |
| Recognition | ML Kit Digital Ink Recognition · Text Recognition v2 |
| Ground truth | Symbolic parser + equivalence checker, deterministic |
| Model | Gemma-2-2B, 4-bit, via MediaPipe LLM Inference, targeting the Snapdragon NPU |
| Voice | Android `TextToSpeech`, offline regional voice packs |
| Storage | Room / SQLite, app-private; 768-dim vectors + FTS5 |
| Classroom | Ktor CIO in a foreground service, `startLocalOnlyHotspot()`, mDNS |
| Bridge | iQOO Office Kit — mirror, clipboard, file transfer |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the module graph, stage contracts and threading model.

---

## Running the prototype locally

No build step, no dependencies, no bundler.

```bash
python -m http.server 5599
```

Then open <http://localhost:5599>. Any static server works; `file://` does not, because the
page loads its scripts as separate files.

Assets are requested with a `?v=` query string. Bump it in `index.html` and `deck/index.html`
whenever you change one, so nobody gets a stale file from cache.

---

## Deployment

GitHub Pages, published by [`.github/workflows/pages.yml`](.github/workflows/pages.yml) on
every push to `main`. No build step — the workflow uploads the repository root and deploys it.

**One-time setup, required before the first successful run:**
**Settings → Pages → Build and deployment → Source → GitHub Actions.**
GitHub's default workflow token is not permitted to enable Pages on its own, so this switch
cannot be automated. Flip it, re-run the workflow, and every push to `main` publishes.

---

## Status

The prototype is a **simulation of the product**, driven by scripted state and fixed timings.
It performs no inference; every figure it shows comes from `assets/js/data.js`. It exists to
communicate the design and to rehearse the demo.

Everything deliberately excluded is listed on the site and in
[`ARCHITECTURE.md` §14](ARCHITECTURE.md#14-known-constraints): Tamil handwriting recognition,
auto-grading long-form answers, live continuous camera explanation, generative video, cloud
accounts, and any clinical claim about an individual child.
