# SlateAI — A Local Agent Runtime for the Disconnected Classroom

**iQOO Hackathon 2026 · City Battles · Track 02: Smart Education**
*Finale-portable under Track 09 (Open Innovation) or Track 06 (Developer Tools).*

---

## 0. One naming decision, first

**Do not say "AGI" to the jury.** It is the single fastest way to lose a technical judge, because the claim is unfalsifiable and the follow-up question — *"in what sense is this AGI?"* — has no good answer. You will spend your Q&A defending a word instead of your architecture.

The thing you are actually building has a precise name that sounds *more* impressive because it's real:

> **SlateCore — a local agent runtime.** A tool-calling harness with constrained decoding, a verifier layer, tiered memory, and a context budgeter, running a 2B model entirely on the phone's own silicon.

That sentence survives cross-examination. "AGI harness" does not. Everything below keeps your architecture and drops the word.

---

## 1. The pitch

**SlateAI is a native Android app that turns one teacher's iQOO phone into an entire school's AI infrastructure — a local agent runtime driving a full education system that thirty students reach from any browser, with no installs, no data plan, and no assumption that the internet is working.**

The novel part is not the education app. **The novel part is the harness underneath it.** Everyone at the hackathon will call a local model. Almost nobody will build the runtime that makes a 2B model behave reliably enough to be trusted with a child's homework.

---

## 2. Why "poor internet," not "no internet"

"No internet" is a niche. **Bad internet is the country.** One bar, 2G fallback, packet loss, a data pack that ran out on the 20th, a hostel basement, a village at 6pm. Apps don't fail cleanly here — they hang, retry, and spin. The student watches a loader.

SlateAI treats connectivity as a **dial, not a switch**, and is built to be *best* at the bottom of the dial.

| Tier | Condition | Behaviour |
|---|---|---|
| **T0 — Dark** | No network at all | Full function. Nothing degrades. |
| **T1 — Weak** | 2G / one bar / intermittent | Text and deltas only. Compressed, resumable, never blocks the UI. |
| **T2 — Good** | Real bandwidth, briefly | Burst sync; escalate only genuinely hard questions to cloud. |

**Design rule:** every feature must complete at T0. T1 and T2 make it faster or richer, never *possible*.

**Why this beats pure-offline in scoring:** iQOO hands every team free AI credits. A stubbornly offline app ignores the sponsor's own resource. SlateAI is **local-first, cloud-optional** — the router escalates only when the local verifier reports low confidence *and* the network is genuinely good. That's a defensible engineering decision, not a fallback.

---

## 3. Why native, and why that scores

Native Kotlin + Jetpack Compose. Not Flutter, not a web wrapper. Four reasons, all of which a judge will accept:

1. **Accelerator access.** LiteRT / QNN delegates, NNAPI, and constrained decoding live at the native layer. A cross-platform wrapper hands them to you at arm's length or not at all.
2. **Foreground services and radios.** The embedded server, the hotspot, and the sustained inference loop need real service lifecycle and real permission handling.
3. **Camera, mic, TTS with no bridge tax.** CameraX and `TextToSpeech` directly, no serialization hop on every frame.
4. **HackTracker.** 25% of your score is device telemetry. A native app doing genuine sustained on-device work produces real utilisation. You are not gaming the metric — the architecture *requires* the phone.

---

## 4. SlateCore — the local agent runtime

This is the technical heart and the thing to lead your pitch with.

```
┌───────────────────────────────────────────────────────────────┐
│                          SlateCore                            │
│                                                               │
│  ROUTER          local-first · confidence-gated escalation    │
│      ↓                                                        │
│  CONTEXT BUDGETER   token accounting · attention budget       │
│      ↓                                                        │
│  ASSEMBLER    system │ core memory │ retrieved │ scratchpad   │
│      ↓                                                        │
│  PLANNER LOOP        step limit · timeout · cancel            │
│      ↓                                                        │
│  TOOL REGISTRY   typed Kotlin schema → JSON Schema            │
│   ├─ cas.check()        Symja — is line N+1 equivalent?       │
│   ├─ retrieve()         SQLite vector store, 768-dim          │
│   ├─ ocr()              ML Kit                                │
│   ├─ speak()            Android TTS, regional language        │
│   ├─ quiz.generate()    schema-constrained                    │
│   ├─ class.broadcast()  push to every joined device           │
│   └─ progress.write()   per-student long-term memory          │
│      ↓                                                        │
│  TWO-PASS EXECUTOR    pass 1 unconstrained → tool calls       │
│                       pass 2 schema-constrained → answer      │
│      ↓                                                        │
│  VERIFIER    CAS ground truth · grounding check · confidence  │
│      ↓                                                        │
│  MEMORY   core (pinned) │ working (compacted) │ archival      │
└───────────────────────────────────────────────────────────────┘
        Gemma 4 E2B via LiteRT-LM  ·  Symja CAS  ·  SQLite
```

### 4.1 Constrained decoding is the foundation, not a nicety

LiteRT-LM enforces a JSON schema on the model's output at the decoding level — the engine guarantees compliance rather than you parsing free text and hoping.

This is not cosmetic. Measured on Gemma 4 edge models, constrained decoding lifted a 24-way classification task by **+0.35** and a JSON-generation task by **+0.90**, because small models frequently fail to emit a valid option even when explicitly prompted to. The latency cost was **0.064s for E2B, and E4B actually got 0.20s faster**.

**The line for your pitch:** *"Constrained decoding buys us roughly a model generation of reliability for essentially zero latency. That's why a 2B model is enough here."*

### 4.2 The Tool Suppression fix — your best technical moment

There is a documented, recent failure mode: when JSON Schema constraints and tool calling are enabled **at the same time**, open-weight models stop invoking tools while still producing schema-compliant output. The mechanism is that schema constraints compile into grammar-based token masks that make tool-call tokens unreachable during decoding. The proposed mitigation is **Transparent Two-Pass Execution** — decouple tool execution from schema-constrained generation.

SlateCore implements exactly that:

- **Pass 1** — unconstrained or lightly-constrained. The model decides *which tools to call*. Tools execute.
- **Pass 2** — fully schema-constrained. Tool results are in context. The model only *formats the answer*.

**Say this out loud in the pitch.** It is a specific, recent, non-obvious failure mode with a specific fix, and it instantly separates you from every team that wired an API and called it an agent. If a judge with an ML background is in the room, this is the thirty seconds that wins them.

### 4.3 Context engineering under a brutal budget

A 2B model with a small window is a **finite attention budget**, and context length degrades quality through lost-in-the-middle effects and attention scarcity long before you hit the hard token limit. The engineering goal is the smallest set of high-signal tokens that gets the job done.

SlateCore's context strategy, layer by layer:

| Layer | Technique | Why it matters here |
|---|---|---|
| **Core memory** | Pinned, always resident: student's grade, language, 3 known weak concepts | ~120 tokens buys personalisation on every single turn |
| **Working memory** | Conversation, compacted when the window fills | Compaction summarises older turns and restarts lean |
| **Tool-result clearing** | Drop raw tool output once consumed | The safest, lightest form of compaction — the agent rarely needs the raw result again |
| **Scratchpad** | Model writes notes to a file *outside* the window, re-reads on demand | Structured note-taking gives persistent memory at minimal token cost |
| **Retrieval** | Top-k chunks from today's chapter only, never the whole book | Grounding beats model size; every answer cites its source line |
| **Tool surface** | 7 tools, deliberately non-overlapping | Ambiguous or near-duplicate tools make the model burn turns choosing |
| **Sub-agent isolation** | Grading runs in its own context, returns a verdict | Keeps detailed search context out of the lead agent's window |
| **Budget awareness** | Remaining-capacity feedback after each tool call | The planner degrades gracefully instead of overflowing |

**The pitch line:** *"We didn't get reliability from a bigger model. We got it from spending a 2B model's attention budget carefully."*

### 4.4 The verifier — why we don't hallucinate at children

Every answer passes a check before a student sees it.

| Claim type | Verifier | Behaviour on failure |
|---|---|---|
| Mathematical | **Symja CAS** — ground truth, deterministic | Rewrite. The model never adjudicates maths. |
| Factual | Grounding check against retrieved chunk | Say "not in your material" rather than invent |
| Structural | Schema validation | Retry pass 2 |
| Low confidence + T2 network | Router escalation to cloud | Ask, using the iQOO AI credits |

**The single strongest sentence in your whole pitch:** *"The language model never decides whether the maths is right. A computer algebra system does. The model only phrases the explanation. We will not hallucinate at a child learning calculus."*

---

## 5. Complex maths — one code path, any difficulty

Don't teach the system methods. Check **equivalence between consecutive lines**.

```
Student writes:        cas.check() runs:
  ∫(2x + 3)dx          —
  = x² + 3x + C        Simplify[ D[x²+3x+C, x] − (2x+3) ] == 0   ✓
  = x² + 3x            Simplify[ (x²+3x) − (x²+3x+C) ] ≠ 0       ✗ ← line 3
```

**The first line where equivalence breaks is the error.** Arithmetic, algebra, trigonometry, calculus, matrices, number theory — one path, because Symja covers differentiation, integration, equation solving, polynomial factorization, linear algebra and number theory with arbitrary-precision integers, rationals and complex numbers.

Difficulty scales for free. You write no new code to go from `3x + 5 = 20` to a triple integral. **Demo the hard one.**

Symja is pure Java, with its bytecode dual-licensed under Apache 2.0 specifically to permit Android use — **verify this against the current release yourself**, because a GPL surprise at hour 25 is unrecoverable.

---

## 6. The education system — surfaces on one runtime

The harness is what makes "full education system" credible in 30 hours: **every new feature is a tool plus a prompt spec, not a new subsystem.** That is the argument that turns ambition from a red flag into a design claim.

### The distribution model: the phone is the server

The teacher's iQOO runs an embedded **Ktor CIO** server behind a foreground service, advertises over **mDNS (NsdManager)**, and raises an internet-less AP via **`WifiManager.startLocalOnlyHotspot()`**, rendered as a QR code. Students join in a browser.

**No installs. No data. Any device — cheap Android, old iPhone, laptop, tablet.** The classroom needs exactly one capable phone, which is the actual economics of an Indian government school. And you build **one** app, not two.

### Routes

| Surface | Route | Backed by |
|---|---|---|
| Student | `GET /` `GET /notes` `POST /doubt` | retrieve → planner → verifier |
| Student | `GET /quiz/live` (SSE) `POST /quiz/answer` | quiz.generate, schema-constrained |
| Student | `POST /work` — photo of worked solution | ocr → cas.check → speak |
| Teacher | `GET /teacher/dashboard` — live error heatmap | progress.write aggregation |
| Teacher | `GET /teacher/export.csv` | **pulled to laptop over Office Kit** |
| **Ecosystem** | `POST /v1/chat/completions` | **OpenAI-compatible: any LAN app can use the phone's model** |

That last route is the strategic one. It reframes the project from "an education app" to **"a portable offline AI server that ships with an education client."** Any script, any app, any device on the network gets a local LLM with a standard request format and no API key. It's also what makes the project legal in **Track 06 (Developer Tools)** at the Grand Finale, which Track 02 does not run.

---

## 7. Build plan — [M] must, [S] if ahead, [X] roadmap

### SlateCore runtime

| # | Item | Tier | Hrs |
|---|---|---|---|
| R1 | LiteRT-LM wrapper, pre-warmed, cancellable | **[M]** | 3 |
| R2 | Typed tool registry → JSON Schema | **[M]** | 2 |
| R3 | Two-pass executor (Tool Suppression fix) | **[M]** | 2 |
| R4 | Verifier: CAS + grounding + schema | **[M]** | 2 |
| R5 | Context assembler + budgeter | **[M]** | 2 |
| R6 | Memory tiers + compaction + tool-result clearing | **[S]** | 3 |
| R7 | Scratchpad note-taking outside the window | **[S]** | 2 |
| R8 | Confidence-gated cloud router | **[S]** | 2 |
| R9 | Sub-agent isolation for grading | **[X]** | — |
| R10 | LoRA adaptation for Indian curriculum phrasing | **[X]** | — |

### Local network + orchestration

| # | Item | Tier | Hrs |
|---|---|---|---|
| N1 | Ktor CIO server in foreground service | **[M]** | 3 |
| N2 | LocalOnlyHotspot + QR join (venue-wifi fallback) | **[M]** | 2 |
| N3 | Served HTML/JS client from assets | **[M]** | 4 |
| N4 | mDNS `class.local` discovery | **[S]** | 1 |
| N5 | Live quiz over SSE | **[S]** | 3 |
| N6 | OpenAI-compatible endpoint | **[S]** | 2 |
| N7 | Nearby Connections peer relay beyond hotspot range | **[X]** | — |

### Education surfaces

| # | Item | Tier | Hrs |
|---|---|---|---|
| E1 | Board capture → OCR → notes → PDF → broadcast | **[M]** | 4 |
| E2 | Math keyboard (primary input) + confirm-what-we-read | **[M]** | 3 |
| E3 | Line-equivalence checker, all difficulty levels | **[M]** | 4 |
| E4 | Regional-language audio explanation | **[M]** | 2 |
| E5 | Teacher error heatmap + Office Kit CSV export | **[M]** | 3 |
| E6 | Grounded doubt chat with citations | **[S]** | 3 |
| E7 | Auto quiz + flashcards from a chapter | **[S]** | 2 |
| E8 | Import own textbook PDF as a source | **[S]** | 2 |
| E9 | Live camera feed continuous explanation | **[X]** | — |

**[M] total ≈ 36 hours across three people ≈ 12 each.** That fits 30 hours only if the runtime is not invented on the day.

> ### The scope call you have to make now
> A harness *and* a full education system in 30 hours is not achievable if SlateCore is written cold at the venue. Two honest options:
> **(a)** Ask the organisers whether pre-existing scaffolding is permitted. If yes, build and test SlateCore *before* the event as a standalone library, and spend the 30 hours on the education system.
> **(b)** If not, cut R6–R8 to stubs on day one. Ship R1–R5 only: five tools, one loop, one verifier. That is still a real runtime and still the strongest technical story in the room.
> **Decide this before you register, not at hour 14.**

---

## 8. Maxing the marking scheme

| Criterion | Weight | Source | Tactics |
|---|---|---|---|
| **End product quality** | 30% | Jury | Five features that work beat twelve that stutter. Real chapter text, real names, never "test1". Rehearse the exact path 4+ times. |
| **Novelty and impact** | 20% | Jury | Jury joins on their own phones. "One phone, thirty students, zero installs." One ₹40k device vs thirty. |
| **Creative phone use** | 15% | HackTracker | Camera, mic, TTS, on-device model, hotspot radio, foreground service — the app *is* the server, so load is real, not simulated. |
| **Technical depth** | 15% | Jury | Lead with SlateCore. Name the three hard parts: two-pass execution against Tool Suppression, CAS-verified maths, context budgeting. Architecture on one slide. |
| **Office Kit** | 10% | HackTracker | Your only Green Light bridge — mirror, clipboard, transfer, remote control. Then make it a **product feature**: pull the CSV live on stage. |
| **Demo** | 10% | Jury | Open with the network kill. Close with the anti-hallucination line. Timed to 2:30, rehearsed aloud. |

**The 25% you cannot fake.** HackTracker measures telemetry, not claims. So: do UI, prompts, content and testing **on the phone**. Reserve the laptop for heavy compute, dependency installs and large builds. **Keep the phone connected via Office Kit even during Green Light** — idle phone time is lost score.

**Also on the board:** each city awards a **Special Honour** beyond the three podium places, and the Grand Finale carries a ₹25 lakh pool. An equity-and-accessibility project is exactly the shape that takes a special award even when it doesn't take first.

---

## 9. Hard constraints — read before scoping

**MediaPipe LLM Inference does not use the NPU.** Its backend enum is CPU or GPU. **Constrained decoding lives in LiteRT-LM, not MediaPipe** — and constrained decoding is load-bearing for your harness. → **Target LiteRT-LM. Verify constrained decoding works on your exact model build in hour 2.** If it doesn't, R3 and R4 collapse and you need the fallback: schema validation with retry in Kotlin, which is worse but survivable. Know this before you're 20 hours in.

**Model sizing.** Gemma 4 E2B (2B) runs on most modern devices with lower latency. E4B (4B) is more reliable on complex function-calling schemas but wants 4–5GB and runs slower. → **E2B is your default.** Test E4B on the loaner once and keep it only if latency holds under thermal load.

**ML Kit OCR has no Tamil.** Text Recognition v2 covers Latin, Chinese, Devanagari, Japanese and Korean only, one model per script, ~38MB each. → Read maths and English/Devanagari. **Tamil is spoken output only.** Never promise Tamil handwriting recognition.

**Handwritten maths OCR is genuinely hard.** Fractions, superscripts and integral signs break plain text OCR. → The **math keyboard is the primary input path**; camera is secondary and always followed by a confirm-what-we-read step. Demo the keyboard.

**The loaner phone arrives at Saturday check-in.** You cannot pre-load it. → In the first Green Light window, download the model, OCR packs, and **Tamil TTS voice data** while venue wifi exists. Carry everything on USB *and* a laptop. Losing the Tamil voice pack after going offline kills the audio layer with no recovery.

**Hotspot APIs are OEM-sensitive.** LocalOnlyHotspot under OriginOS is unverified. → Test hour 2. Fallback: venue wifi + mDNS. Rehearse the fallback too.

**Symja licensing.** Confirm the Android terms on the current release. Ten minutes now; project-ending at hour 25.

---

## 10. The 30-hour plan

| Window | Phase | Work |
|---|---|---|
| 0–2h | 🟢 | Collect phone. Download model, OCR, **Tamil TTS voice**. Verify TTS offline. Test LocalOnlyHotspot. **Verify LiteRT-LM constrained decoding.** |
| 2–6h | 🟢 | SlateCore R1–R3: model wrapper, tool registry, two-pass executor. Nothing else until a tool call round-trips. |
| 6–9h | 🟢 | Ktor server + foreground service + QR join. Second device loads a page over the hotspot. |
| 9–13h | 🔴 | Student web client: join, notes, doubt box. HTML and prompts are ideal Red Light work. |
| 13–17h | 🔴 | Capture → OCR → notes → PDF → broadcast. Math keyboard. |
| 17–21h | 🟢 | Symja integration + verifier (R4). Hardest logic; needs a debugger. |
| 21–24h | 🔴 | TTS, explanation prompts, connectivity tier badge, heatmap. |
| 24–26h | 🔴 | Office Kit CSV export. **Hour 24: cut anything not working. Do not fix.** |
| 26–29h | 🟢 | Full rehearsal, radios off, on 4 unfamiliar devices. Twice. |
| 29–30h | 🟢 | Freeze. Rehearse the pitch aloud, timed, four times. |

---

## 11. Demo script (2:30)

**0:00 — Kill the network.** Airplane Mode on, visibly. Hotspot back on. "That's a local network with nothing behind it."

**0:15 — Recruit the jury.** QR on screen. *"Please take out your own phones and scan this."* They land in the classroom in a browser. No install. **This is the moment they remember.**

**0:45 — Distribute.** Photograph a board. Clean notes appear. Tap Share. Every device in the room — including the judges' — refreshes.

**1:15 — Tutor, at real difficulty.** Push a worked integral with a planted error at line 3. SlateAI flags **line 3** and explains in Tamil. *"The model didn't decide that. A computer algebra system did."*

**1:45 — Show the runtime.** One tap reveals the trace: tools called, tokens spent, verifier verdict, confidence. *"This is our agent runtime. Two-pass execution, because schema constraints suppress tool calls if you don't separate them."*

**2:10 — Office Kit.** Pull the analytics CSV to the laptop.

**2:25 — Close.** *"One phone. Thirty students. No installs, no data, no internet. And when the network comes back, it only gets better — it was never required."*

---

## 12. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Constrained decoding unavailable on your build | **Fatal to R3/R4** | Verify hour 2. Fallback: Kotlin schema validation + retry |
| Tamil TTS voice not downloaded before going offline | **Fatal** | Hour 1, verified with radios off |
| LocalOnlyHotspot blocked under OriginOS | **Fatal** | Test hour 2; venue wifi + mDNS fallback, rehearsed |
| SlateCore written cold, eats 12 hours | **High** | Pre-build if permitted; otherwise ship R1–R5 only |
| Handwritten maths OCR fails on stage | High | Math keyboard primary; camera on printed text only |
| Symja licence turns out restrictive | High | Verify before the event |
| Venue wifi congestion during demo | Medium | Own hotspot is primary precisely because venue wifi isn't trusted |
| Thermal throttle from sustained inference | Medium | Single-shot only, no live-feed loop, don't demo twice back to back |
| E9 live camera scope creep | High | Marked [X]. Say "roadmap." Move on. |

---

## 13. Pre-event checklist

- [ ] Drill **Office Kit**: mirror, clipboard, file transfer, remote control
- [ ] Prove **LiteRT-LM constrained decoding** on a phone with your chosen model
- [ ] Prove **Ktor CIO server in a foreground service**, reachable from another device
- [ ] Prove **LocalOnlyHotspot + QR** on a vivo/iQOO device specifically
- [ ] Confirm **Symja's Android licence** on the current release
- [ ] Ask organisers whether **pre-built scaffolding** is allowed — this decides your whole plan
- [ ] Model, OCR packs and TTS data staged on USB **and** laptop
- [ ] Three worked problems at three difficulty levels, each with a planted error
- [ ] Tamil explanation strings written in advance
- [ ] Red Light task split agreed **in writing** before you arrive

---

## 14. Two decisions before you register

**Name.** *SlateAI* names the tutor but not the runtime or the network, which are now the larger half of the product. The title is the first thing a jury reads.

**Track.** Track 02 is **city-battles-only** and does not run at the Finale. Enter Chennai under 02, then carry the identical codebase to Bengaluru under **09 Open Innovation** — or under **06 Developer Tools**, leading with SlateCore and the OpenAI-compatible endpoint, which is a genuine developer tool by any reading.
