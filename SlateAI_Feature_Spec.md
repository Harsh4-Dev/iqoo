# SlateAI — Feature Specification

**Companion to `SlateAI_iQOO_Pitch.md`.** That document argues *why*. This one defines *what ships*.

**Four pillars, one runtime:**

| # | Pillar | One line |
|---|---|---|
| **1** | **ClassDrop** — wireless distribution | Teacher pushes anything to thirty devices with no internet and no app installs |
| **2** | **StudyDesk** — local NotebookLM | Import a chapter, ask it questions, get answers that cite the line they came from |
| **3** | **ClassTest** — quiz and assessment | Live paced quizzes and offline tests, auto-generated, auto-graded, with a class heatmap |
| **4** | **StepTutor** — maths tutor with narrated animation | Finds the exact line you went wrong on, then plays you an animated, spoken walkthrough |

All four are surfaces over **SlateCore** (the local agent runtime) and the **embedded server**. Nothing here calls the cloud by default.

---

## 0. Shared foundation

Every feature below assumes these exist. They are built once.

| Component | Role |
|---|---|
| **SlateCore** | Tool registry, two-pass executor, verifier, tiered memory, context budgeter |
| **Gemma 4 E2B via LiteRT-LM** | Local model with schema-constrained decoding |
| **Symja CAS** | Deterministic mathematical ground truth |
| **Ktor CIO + foreground service** | The phone as class server |
| **LocalOnlyHotspot + mDNS + QR** | Join with no network and no typing |
| **SQLite vector store (768-dim)** | Retrieval index for all imported material |
| **ML Kit OCR / CameraX / Android TTS** | Capture and speech |

**Connectivity contract, applied to every feature:**

| Tier | Behaviour |
|---|---|
| **T0 Dark** | Every feature completes fully. This is the design target. |
| **T1 Weak** | Text and deltas sync opportunistically. Media queues. UI never blocks. |
| **T2 Good** | Burst sync; low-confidence answers may escalate to cloud. |

---

# 1. ClassDrop — wireless distribution

> **Pitch line:** *AirDrop for a classroom where nobody has AirDrop, an app, or data.*

## 1.1 What it does

The teacher's phone raises an internet-less hotspot and serves a web client. Students scan a QR, land in the class in their browser, and receive everything the teacher pushes — notes, PDFs, worksheets, quizzes, audio, video — in real time. No install, no Play Store, no data plan, no account.

Works on cheap Android, old iPhones, laptops, tablets. Anything with a browser.

## 1.2 User flow

**Teacher:** Start Class → QR appears on screen → students join, roster fills live → capture or select material → Push → delivery receipts show who received it.

**Student:** Scan QR → enter name → material appears → read, download PDF, or open in StudyDesk.

## 1.3 Technical

| Concern | Approach |
|---|---|
| Network | `WifiManager.startLocalOnlyHotspot()` — AP with no internet; SSID + passphrase encoded into the QR |
| Discovery | `NsdManager` advertises `_slate._tcp`, resolving to `class.local:8080` so nobody types an IP |
| Serving | Ktor CIO in a foreground service; static client from `assets/` |
| Push | Server-Sent Events to all connected clients |
| Receipts | Client ACKs on render; teacher dashboard shows delivered / pending |
| Integrity | SHA-256 per artifact; dedupe and version on re-push |
| Out of range | **[X]** Nearby Connections peer relay so a student outside hotspot range pulls from a neighbour |

**Registered tool:** `class.broadcast(artifactId, audience)`

## 1.4 Scope

| Item | Tier | Hrs |
|---|---|---|
| Server + foreground service | **[M]** | 3 |
| Hotspot + QR join (venue-wifi fallback) | **[M]** | 2 |
| Served web client shell | **[M]** | 4 |
| Push + delivery receipts | **[M]** | 2 |
| mDNS discovery | **[S]** | 1 |
| Term library — everything shared, offline-readable | **[S]** | 2 |
| Peer relay beyond hotspot range | **[X]** | — |

## 1.5 Risks

- **LocalOnlyHotspot under OriginOS is unverified.** Test in hour 2. Fallback: join venue wifi, advertise over mDNS, rehearse that path too.
- **Venue wifi congestion.** Your own hotspot is primary precisely because you don't trust the venue's.

---

# 2. StudyDesk — the local NotebookLM

> **Pitch line:** *NotebookLM, except the notebook never leaves the phone and the internet was never invited.*

## 2.1 What it does

Import a source — a captured board, a textbook chapter PDF, a teacher's note — and it becomes a queryable study companion. Ask questions and get answers **grounded strictly in that source**, with the source line cited. Generate a summary, key topics, or flashcards from it.

The grounding is the product. A 2B model answering only from a retrieved chapter beats a 4B model answering from memory, and it can prove where each claim came from.

## 2.2 User flow

Import (camera, PDF, or received from ClassDrop) → indexing progress shown → ask a question → answer appears with a **tap-to-see-source** citation → optionally generate summary, topics, or flashcards.

## 2.3 Technical

```
PDF / photo
   → text extraction (PdfBox-Android or ML Kit OCR)
   → semantic chunking (~300 tokens, 15% overlap, respects headings)
   → embed each chunk
   → SQLite vector store (768-dim) + FTS index alongside
   → query: hybrid retrieval (vector + keyword), top-k = 4
   → SlateCore: assemble → two-pass → verify grounding
   → answer + citation
```

**Grounding verifier.** Every factual claim is checked against the retrieved chunks. If it isn't supported, the answer is replaced with *"That isn't in your material — here's what is."* **Refusing is a feature, and it's the honest thing to demo.**

**Hybrid retrieval matters at this scale.** Pure vector search fails on exact terms — a formula name, a date, a proper noun. Keep an FTS table beside the vectors and merge results. It's one extra table and it saves you on stage.

**Registered tools:** `retrieve(query, sourceId, k)` · `summarize(sourceId)` · `flashcards.generate(sourceId, n)`

## 2.4 Scope

| Item | Tier | Hrs |
|---|---|---|
| Chunk + embed + store pipeline | **[M]** | 3 |
| Grounded Q&A with citation | **[M]** | 3 |
| Grounding verifier + honest refusal | **[M]** | 2 |
| Import PDF as a source | **[S]** | 2 |
| Summary + key topics | **[S]** | 2 |
| Hybrid vector + keyword retrieval | **[S]** | 2 |
| Flashcards with spaced repetition | **[X]** | — |
| Audio chapter overview | **[X]** | — |

## 2.5 Risks

- **Indexing latency on a large PDF** will look broken. Cap the MVP at a single chapter, show real per-chunk progress, and index in a worker.
- **Embedding model size** adds to your download budget. Count it in the hour-1 download plan.

---

# 3. ClassTest — quiz and assessment

> **Pitch line:** *Thirty students, one phone, a live test, and a heatmap of exactly what the class didn't understand.*

## 3.1 What it does

**Live mode.** The teacher pushes questions one at a time; every student's browser lights up simultaneously; answers stream back; the heatmap builds in real time. The teacher walks out knowing what to reteach tomorrow.

**Assigned mode.** A test is pushed once and taken whenever, fully offline. Results sync back when the student is next on the class network.

Questions are auto-generated from any StudyDesk source, or written by hand.

## 3.2 User flow

**Teacher:** pick a source → Generate 10 questions → review and edit (**always review — this is the human-in-the-loop step, keep it visible in the demo**) → Live or Assigned → push → watch the heatmap.

**Student:** question appears → answer → instant local grading → explanation of what was wrong, drawn from the source.

## 3.3 Technical

Generation uses **schema-constrained decoding**, which is exactly where it pays: small models frequently fail to emit a valid option even when explicitly told to, and constraining the grammar fixes that at near-zero latency cost.

```json
{ "type":"object",
  "properties":{
    "question":{"type":"string"},
    "options":{"type":"array","minItems":4,"maxItems":4,"items":{"type":"string"}},
    "answerIndex":{"type":"integer","minimum":0,"maximum":3},
    "sourceLine":{"type":"integer"},
    "difficulty":{"enum":["recall","apply","analyse"]}
  },
  "required":["question","options","answerIndex","sourceLine","difficulty"] }
```

**Verifier before a question ever reaches a student:**
1. `sourceLine` must exist and must actually support the answer — else discard.
2. Options must be distinct; the correct one must not be trivially longest.
3. If the question is mathematical, **Symja checks it**. A quiz question with a wrong answer key is worse than no quiz.

**Transport.** SSE for live push; `POST /quiz/answer` for submissions; grading is local so results are instant even at T0. Assigned mode stores locally and flushes through the T1 delta queue.

**Registered tools:** `quiz.generate(sourceId, n, difficulty)` · `quiz.grade(attempt)` · `progress.write(studentId, concept, outcome)`

## 3.4 Scope

| Item | Tier | Hrs |
|---|---|---|
| Schema-constrained question generation | **[M]** | 3 |
| Teacher review and edit screen | **[M]** | 2 |
| Live quiz over SSE + submission | **[M]** | 3 |
| Local grading + class heatmap | **[M]** | 3 |
| Question verifier (source + CAS) | **[M]** | 2 |
| Office Kit CSV export of results | **[M]** | 1 |
| Assigned offline mode with deferred sync | **[S]** | 2 |
| Per-student weak-concept trail | **[S]** | 2 |
| Adaptive difficulty from prior results | **[X]** | — |

## 3.5 Risks

- **Generated questions can be subtly wrong.** The verifier plus the mandatory teacher review is the answer. Show the review screen on stage — it reads as responsibility, not weakness.
- **Thirty concurrent SSE connections** on a phone. Test at 10+ before the demo; keep payloads small.

---

# 4. StepTutor — maths tutor with narrated animation

> **Pitch line:** *It tells you which line you went wrong on, and then it shows you — animated, and speaking your language.*

## 4.1 What it does

**Part A — find the error.** The student enters or photographs their working. StepTutor checks each line against the previous one and flags the **first line where the maths stops being true**.

**Part B — explain it.** It plays a short animated walkthrough of the correct steps, narrated in Tamil or Hindi. Every frame is rendered from the CAS solution trace, so the visual and the audio are both provably correct.

## 4.2 The equivalence trick — why any difficulty is free

Don't teach the system methods. Check **equivalence between consecutive lines**.

```
Student wrote:        cas.check() ran:
  ∫(2x + 3)dx         —
  = x² + 3x + C       Simplify[ D[x²+3x+C, x] − (2x+3) ] == 0   ✓
  = x² + 3x           Simplify[ (x²+3x) − (x²+3x+C) ] ≠ 0       ✗ ← line 3
```

The first break is the error. One code path covers arithmetic, algebra, trigonometry, calculus, matrices and number theory, because Symja covers all of them with arbitrary precision. **You write no new code to go from `3x + 5 = 20` to a triple integral — so demo the hard one.**

## 4.3 Input — be realistic about OCR

**The on-screen math keyboard is the primary input path.** Handwritten fractions, superscripts and integral signs break plain-text OCR, and ML Kit has no Tamil script model at all.

| Path | Role |
|---|---|
| **Math keyboard** | Primary. Palette-based, LaTeX-ish, unambiguous. **Use this on stage.** |
| **Camera OCR** | Secondary, always followed by a **confirm-what-we-read** step |
| **Printed problem statements** | OCR works well here — this is the safe camera demo |

The confirm step is not an apology for OCR. It is correct UX: the student verifies the machine understood them before the machine judges them.

## 4.4 Audio and video — rendered, not generated

**Do not attempt generative video.** You have a deterministic solution trace from the CAS. Render it.

```
CAS solve trace  →  step list [expr, justification]
       │
       ├─ VISUAL: Compose Canvas. Each step animates in;
       │          the changed sub-expression highlights;
       │          the previous step dims. ~3–5s per step.
       │
       ├─ AUDIO:  Model writes a short narration per step
       │          (schema-constrained, ≤25 words).
       │          TextToSpeech.synthesizeToFile() → WAV per step.
       │
       └─ SYNC:   Step duration = max(animation, audio length).
                  Play in-app.  [M]
                  Encode to MP4 via MediaCodec + mux WAV.  [S]
                  → then it's shareable over ClassDrop.  [S]
```

**Why this is the right call:** the animation is generated from CAS output, so it cannot show a wrong step. The model contributes only phrasing. Same guarantee as the tutor, at a fraction of the cost of anything generative — and MP4 export turns every solved problem into reusable class material the teacher can push to everyone.

**Ship in-app playback first.** MP4 encoding is where hackathon projects go to die at hour 26; it's a stretch goal for a reason.

**Registered tools:** `cas.check(lines[])` · `cas.solveSteps(problem)` · `narrate(steps, language)` · `speak(text, language)`

## 4.5 Language

| Layer | Support |
|---|---|
| Input | Latin + digits (maths), Devanagari |
| Explanation text | English, Hindi, Tamil |
| **Spoken audio** | Tamil, Hindi, English via Android TTS |
| **Not supported** | Tamil handwriting recognition — say so plainly |

**Hour-1 download requirement:** the Tamil TTS voice pack. If you go offline without it, the entire audio and video layer is dead with no recovery.

## 4.6 Scope

| Item | Tier | Hrs |
|---|---|---|
| Symja integration + line-equivalence engine | **[M]** | 4 |
| Math keyboard | **[M]** | 3 |
| Camera OCR + confirm-what-we-read | **[M]** | 2 |
| Error highlight UI | **[M]** | 2 |
| Spoken explanation (TTS, regional) | **[M]** | 2 |
| Animated step playback in-app | **[S]** | 4 |
| Per-step narration, schema-constrained | **[S]** | 2 |
| MP4 export + share over ClassDrop | **[S]** | 3 |
| Hint ladder before revealing the answer | **[X]** | — |
| Common-misconception classifier | **[X]** | — |

## 4.7 Risks

- **Symja licence.** Bytecode is dual-licensed Apache 2.0 for Android use — **verify on the current release before the event.** A GPL surprise at hour 25 is unrecoverable.
- **Animation eats time.** It is the most visually rewarding feature and the second-largest time sink. If you're behind at hour 22, ship static steps with audio.
- **Thermal load.** Single-shot inference only. Never run the animation pipeline twice back to back on stage.

---

# 5. Build order

Dependencies run strictly downward. Do not start a row until the one above works.

| Order | Block | Why first |
|---|---|---|
| 1 | SlateCore R1–R3 (model, tool registry, two-pass) | Everything is a tool call |
| 2 | ClassDrop server + hotspot + QR | Every surface is served over it |
| 3 | Web client shell | The student-facing container |
| 4 | StepTutor Part A (CAS + keyboard + error) | Highest-value, most defensible feature |
| 5 | ClassDrop capture → notes → PDF → push | Feeds StudyDesk and ClassTest |
| 6 | ClassTest live quiz + heatmap | Best jury-participation moment |
| 7 | StudyDesk grounded Q&A | Highest-risk; cut first if behind |
| 8 | StepTutor Part B animation | Highest polish; cut second if behind |
| 9 | Office Kit CSV export | 10% of the score, one hour of work |

**Must-ship totals:** ClassDrop 11h · StudyDesk 8h · ClassTest 14h · StepTutor 13h · SlateCore 11h ≈ **57 hours ÷ 3 people ≈ 19 hours each.**

That fits 30 hours **only if SlateCore and the server are not invented on the day.** Ask the organisers this week whether pre-built scaffolding is permitted. If it isn't, cut StudyDesk to keyword retrieval and StepTutor animation to static steps, and you're back inside the envelope.

---

# 6. Explicitly out of scope

Say these are roadmap. Do not build them.

| Not building | Why |
|---|---|
| Generative video | Not feasible on-device, and it would hallucinate maths |
| Live continuous camera explanation | Thermal throttle on a phone that's been building for 28 hours |
| Tamil handwriting OCR | No ML Kit model exists for the script |
| Cloud accounts, login, multi-school sync | Contradicts the entire premise |
| Auto-grading handwritten long-form answers | Unreliable, and a wrong grade on a child's work is a real harm |
| Speech-to-text lecture capture | Another model, another download, another failure point |

**A clean "no, and here's why" beats a broken yes.** Judges reward teams who show they know where the edge is.

---

# 7. The four demo beats

| Beat | Feature | The moment |
|---|---|---|
| 1 | ClassDrop | Airplane mode on. Jury scans the QR **on their own phones** and joins the class |
| 2 | StepTutor A | A worked integral. Line 3 flagged. Tamil audio. *"A CAS decided that, not the model."* |
| 3 | ClassTest | A question pushes to every judge's phone at once. The heatmap builds live |
| 4 | StepTutor B | The animated walkthrough plays, narrated, and pushes to the whole class as a video |

Close on Office Kit pulling the CSV to the laptop, then the line: *"One phone. Thirty students. No installs, no data, no internet — and when the network comes back, it only gets better. It was never required."*
