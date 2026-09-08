# EduQoo — Architecture

Technical reference for the Android application. This document describes structure and
behaviour only. Product rationale is out of scope.

- **Target:** Android 13+, single flagship device (iQOO loaner).
- **Language:** Kotlin. UI in Jetpack Compose.
- **Network dependency:** none required at runtime.

---

## 1. System overview

The application is a single Android process. It contains five layers.

```
┌──────────────────────────────────────────────────────────────┐
│ 1. UI                Jetpack Compose                         │
│                      TutorScreen · TeacherScreen · Trace     │
├──────────────────────────────────────────────────────────────┤
│ 2. Orchestration     EduQooCore                              │
│                      router · budgeter · planner · verifier  │
├──────────────────────────────────────────────────────────────┤
│ 3. Tools             7 registered functions, typed           │
│                      ink · solve · speak · retrieve · class  │
├──────────────────────────────────────────────────────────────┤
│ 4. Engines           MediaPipe LLM · ML Kit · Symbolic ·     │
│                      Android TTS · CameraX · Ktor            │
├──────────────────────────────────────────────────────────────┤
│ 5. Storage           SQLite (Room) · app-private files       │
└──────────────────────────────────────────────────────────────┘
```

No layer calls upward. Layer 2 is the only layer permitted to invoke layer 3, and layer 3 is
the only layer permitted to invoke layer 4.

---

## 2. Modules

| Module | Type | Responsibility |
|---|---|---|
| `:app` | Android application | Compose UI, navigation, permissions, lifecycle |
| `:core` | Kotlin library | `EduQooCore` — routing, context assembly, planner loop, verifier |
| `:tools` | Kotlin library | Tool definitions and their JSON Schema projections |
| `:inference` | Kotlin library | MediaPipe LLM Inference wrapper; session lifecycle |
| `:ink` | Kotlin library | CameraX capture, ML Kit recognition, line segmentation |
| `:solver` | Kotlin library | Expression parser and equivalence checker |
| `:speech` | Kotlin library | `TextToSpeech` wrapper, language + voice-pack management |
| `:server` | Kotlin library | Ktor CIO server, hotspot, mDNS, SSE broadcast |
| `:data` | Kotlin library | Room entities, DAOs, vector store, CSV export |

`:core` depends on `:tools` only. `:tools` depends on the engine modules. The engine modules
depend on nothing internal. This prevents circular dependencies and allows each engine to be
unit-tested without the runtime.

---

## 3. The tutor pipeline

The primary data flow. All stages execute on-device.

```
 CameraX                ML Kit                  Parser
 ┌────────┐  Bitmap    ┌──────────┐  RawLine[] ┌──────────┐  Expr[]
 │Capture ├───────────►│Recognise ├───────────►│  Parse   ├────────┐
 └────────┘            └──────────┘            └──────────┘        │
                            │                                      │
                     confidence < 0.90                             ▼
                            │                              ┌───────────────┐
                            ▼                              │ Equivalence   │
                    ┌───────────────┐   corrected text     │    check      │
                    │ Confirm sheet ├─────────────────────►│ (deterministic)│
                    │    (user)     │                      └───────┬───────┘
                    └───────────────┘                              │
                                                          StepResult[] + firstBreak
                                                                    │
                                    ┌───────────────────────────────┤
                                    ▼                               ▼
                            ┌───────────────┐              ┌────────────────┐
                            │ Solution trace│              │ Overlay: red   │
                            │  (solver)     │              │ boundary on    │
                            └───────┬───────┘              │ line firstBreak│
                                    │                      └────────────────┘
                                    ▼
                            ┌───────────────┐   String[]   ┌────────────────┐
                            │ LLM narrate   ├─────────────►│ TextToSpeech   │
                            │ (phrasing)    │              │ ta / hi / en   │
                            └───────────────┘              └────────────────┘
```

### 3.1 Stage contracts

**Capture** — `:ink`
```kotlin
suspend fun capture(): Bitmap
```
Single `ImageCapture.takePicture`. No `ImageAnalysis` use case is bound; there is no
continuous frame loop.

**Recognise** — `:ink`
```kotlin
data class RawLine(val text: String, val confidence: Float, val bounds: Rect)
suspend fun recognise(source: InkSource): List<RawLine>
```
`InkSource` is either `Photo(Bitmap)` → ML Kit Text Recognition v2, or `Strokes(Ink)` →
ML Kit Digital Ink Recognition. Lines are ordered top to bottom by `bounds.top`.

**Confirm** — `:app`
If any `RawLine.confidence < CONFIRM_THRESHOLD` (0.90), the pipeline suspends and the
confirm sheet is shown. The pipeline resumes only with a user-acknowledged `List<String>`.
This gate is unconditional: it cannot be skipped by configuration.

**Parse** — `:solver`
```kotlin
sealed interface ParseResult { data class Ok(val expr: Expr) ; data class Failed(val at: Int) }
fun parse(line: String): ParseResult
```
A parse failure aborts the pipeline with a user-facing message. It is never passed to the
model to "interpret".

**Equivalence check** — `:solver`
```kotlin
data class StepResult(val index: Int, val equivalent: Boolean, val residual: String)
fun check(steps: List<Expr>): List<StepResult>
```
For each `i > 0`, the checker evaluates whether `steps[i]` and `steps[i-1]` are equal by
normalising `steps[i] − steps[i-1]` (equations are first rewritten to `lhs − rhs`) and
testing the result against zero. The first `index` with `equivalent == false` is the reported
error. Later steps are still checked and reported, but not surfaced as the primary error.

The output is deterministic and does not involve the language model.

**Narrate** — `:core` → `:inference`
```kotlin
suspend fun narrate(trace: List<SolveStep>, lang: Lang): List<String>
```
The model receives the solver's own trace and produces at most one sentence per step, bounded
at 25 words. It is not given the student's incorrect working as authoritative input, and it is
not asked to determine correctness.

**Speak** — `:speech`
```kotlin
suspend fun speak(sentences: List<String>, lang: Lang)
```
`TextToSpeech.synthesizeToFile` per sentence, then sequential playback so the audio can be
paused and stepped alongside the animation.

---

## 4. EduQooCore

The orchestration layer in `:core`.

### 4.1 Execution

```
request
   │
   ▼
Router ──── tier == T2 && confidence < 0.70 ──► cloud (optional, off by default)
   │
   ▼
ContextAssembler   system | core memory | retrieved | scratchpad
   │
   ▼
PlannerLoop        maxSteps = 6, timeout = 20s, cancellable
   │
   ├─► Pass 1   unconstrained decode → tool calls → execute → results into context
   │
   └─► Pass 2   schema-constrained decode → final structured output
   │
   ▼
Verifier           symbolic | grounding | schema
   │
   ▼
response
```

Passes 1 and 2 are separate `LlmInference` calls with different configurations. They are not
merged: enabling schema constraints and tool calling in a single decode makes tool-call tokens
unreachable under the grammar mask, and the model silently stops emitting them.

### 4.2 Context budget

| Segment | Budget | Policy |
|---|---|---|
| System prompt | 180 | Static |
| Core memory | 120 | Pinned: grade, language, three weakest concepts |
| Retrieved | 640 | Top-k chunks, k = 4, current source only |
| Working | 900 | Conversation; compacted to a summary when 80% full |
| Scratchpad | 0 | Written to a file, re-read on demand |
| **Total** | **2048** | Hard ceiling |

Raw tool output is dropped from working memory once consumed. Remaining capacity is passed
back to the planner after each tool call so it can stop early rather than overflow.

### 4.3 Verifier

| Claim type | Check | On failure |
|---|---|---|
| Mathematical | `:solver` re-evaluation | Discard and regenerate from the trace |
| Factual | Substring/embedding match against retrieved chunk | Replace with a refusal |
| Structural | JSON Schema validation | Retry pass 2, max 2 attempts |

Nothing is rendered to a student before the verifier returns.

---

## 5. Tool registry

Seven tools. Each is a Kotlin function with a typed signature; the schema projection is
generated at build time by a KSP processor, so the declaration and the schema cannot diverge.

| Tool | Signature | Engine |
|---|---|---|
| `ink.read` | `(InkSource) -> List<RawLine>` | ML Kit |
| `solve.check` | `(List<Expr>) -> List<StepResult>` | `:solver` |
| `solve.steps` | `(Problem) -> List<SolveStep>` | `:solver` |
| `speak` | `(List<String>, Lang) -> Unit` | Android TTS |
| `retrieve` | `(String, Int) -> List<Chunk>` | SQLite |
| `class.broadcast` | `(Artifact, Audience) -> Receipts` | Ktor SSE |
| `progress.write` | `(StudentId, Concept, Outcome) -> Unit` | Room |

Tools are deliberately non-overlapping. Two tools with similar descriptions cause a small model
to spend turns choosing between them.

---

## 6. Inference

| Property | Value |
|---|---|
| Model | Gemma-2-2B, instruction-tuned |
| Quantisation | 4-bit |
| Runtime | MediaPipe LLM Inference |
| Accelerator | Snapdragon NPU where the delegate is available, GPU otherwise |
| Distribution | Weights bundled in the APK / installed on first run to app-private storage |
| Session | One `LlmInference` instance, created in `onCreate` of the foreground service, kept warm |
| Concurrency | One inference at a time, enforced by a `Mutex` in `:inference` |

**Thermal policy.** Only one generation may be in flight. There is no live camera analysis
loop and no speculative pre-generation. A `PowerManager.OnThermalStatusChangedListener`
raises the tier at `THERMAL_STATUS_MODERATE`: narration shortens to one sentence total, and
at `THERMAL_STATUS_SEVERE` narration is skipped and only the solver output is shown.

---

## 7. Storage

Room, one database, app-private. No content provider is exported.

```
student(id, name, grade, lang)
attempt(id, student_id, captured_at, image_path, tier)
step(id, attempt_id, idx, raw_text, confidence, parsed, equivalent)
concept(id, slug, label)
observation(id, student_id, concept_id, outcome, observed_at)
source(id, title, page_count, indexed_at)
chunk(id, source_id, ord, text, page)
chunk_vec(chunk_id, embedding BLOB)        -- 768-dim, float32
chunk_fts(chunk_id, text)                  -- FTS5
```

Retrieval merges a vector scan over `chunk_vec` with an FTS5 match over `chunk_fts`. Vector
search alone fails on exact terms — a formula name, a proper noun — which is why both exist.

Captured images are written to app-private storage and are never uploaded. They are deleted
when their `attempt` row is deleted.

---

## 8. Classroom server

Runs only while a class is active.

| Concern | Implementation |
|---|---|
| Server | Ktor CIO, bound to `0.0.0.0:8080` |
| Lifecycle | Foreground service with a persistent notification |
| Access point | `WifiManager.startLocalOnlyHotspot()`; SSID and passphrase encoded into a QR |
| Discovery | `NsdManager` advertising `_eduqoo._tcp`, resolving `class.local` |
| Client | Static HTML/JS served from `assets/` |
| Push | Server-Sent Events to all connected clients |
| Receipts | Client ACKs on render; the teacher UI shows delivered / pending |
| Integrity | SHA-256 per artifact; re-push dedupes on hash |

`startLocalOnlyHotspot()` behaviour is OEM-dependent. If it fails, the server falls back to the
device's current Wi-Fi network and relies on mDNS alone. Both paths are exercised in tests.

### 8.1 Routes

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Student client |
| `GET` | `/events` | SSE stream |
| `POST` | `/answer` | Quiz submission |
| `GET` | `/teacher/report.csv` | Class diagnostic export |
| `POST` | `/v1/chat/completions` | OpenAI-compatible endpoint over the LAN |

---

## 9. Threading

| Work | Dispatcher |
|---|---|
| Compose UI | Main |
| Camera capture | CameraX executor |
| ML Kit recognition | `Dispatchers.Default` |
| Parsing and equivalence | `Dispatchers.Default` |
| Inference | Dedicated single-thread dispatcher, guarded by `Mutex` |
| Room and file IO | `Dispatchers.IO` |
| Ktor | Its own CIO engine dispatcher |

Every long-running operation is a cancellable `suspend` function scoped to the screen's
`viewModelScope`. Navigating away cancels in-flight inference.

---

## 10. Error handling

| Failure | Behaviour |
|---|---|
| Camera unavailable | Fall back to the math keyboard input path |
| Recognition returns nothing | Show "we couldn't read the page"; offer keyboard |
| Any line below confidence threshold | Confirm sheet, pipeline suspended |
| Parse failure | Abort with the failing line highlighted; no model fallback |
| Solver timeout (> 3s) | Report unverified; do not display a correction |
| Inference timeout (> 20s) | Show solver output without narration |
| TTS voice pack missing | Show text explanation, surface a one-time download prompt |
| Hotspot creation fails | Fall back to the current network + mDNS |

The general rule: when a deterministic stage fails, the pipeline stops. The language model is
never used as a recovery path for a failed solver or parser.

---

## 11. Connectivity tiers

`TierMonitor` derives a tier from `ConnectivityManager` capabilities and observed throughput.

| Tier | Condition | Behaviour |
|---|---|---|
| T0 | No transport | All features complete. No queue drain. |
| T1 | Transport, bandwidth < 200 kbps or high loss | Deltas queue; media deferred; UI never blocks |
| T2 | Transport, bandwidth ≥ 200 kbps | Burst sync; cloud escalation permitted if confidence < 0.70 |

Tier affects synchronisation only. No tutor pipeline stage has a network dependency, so tier
never changes tutor behaviour or output.

---

## 12. Dependencies

| Dependency | Purpose | Licence |
|---|---|---|
| MediaPipe Tasks GenAI | LLM inference | Apache 2.0 |
| ML Kit Text Recognition v2 | Printed / photographed text | Apache 2.0 (bundled model) |
| ML Kit Digital Ink Recognition | Stroke input | Apache 2.0 |
| CameraX | Capture | Apache 2.0 |
| Ktor CIO | Embedded server | Apache 2.0 |
| Room | Persistence | Apache 2.0 |
| Symbolic solver | Equivalence checking | **Verify before use** |
| Jetpack Compose | UI | Apache 2.0 |

The solver licence must be confirmed against the exact release being linked. A restrictive
licence discovered late is unrecoverable, because the solver is not replaceable by the model.

---

## 13. Build order

Each row depends on the rows above it.

| # | Component | Blocking reason |
|---|---|---|
| 1 | `:inference` wrapper | Everything downstream is a call into it |
| 2 | `:tools` registry + schema generation | The planner cannot run without typed tools |
| 3 | `:core` two-pass executor | Nothing is reliable until tool calls round-trip |
| 4 | `:solver` parse + equivalence | The product's only source of truth |
| 5 | `:ink` capture + recognition + confirm | The input path |
| 6 | Tutor UI + red-boundary overlay | The demo |
| 7 | `:speech` narration | Adds the language layer |
| 8 | `:data` observations + CSV export | Teacher analytics |
| 9 | `:server` hotspot + client | Multi-device |

Steps 1–6 constitute the MVP. Steps 7–9 are additive and each is independently droppable.

---

## 14. Known constraints

1. **ML Kit has no Tamil script recognition model.** Tamil is an output language only. The
   recognised content is digits, Latin letters and mathematical symbols.
2. **Handwritten fraction and superscript recognition is unreliable.** The confirm gate exists
   because of this, and the math keyboard remains a first-class input path rather than a
   fallback of last resort.
3. **`startLocalOnlyHotspot()` is OEM-sensitive** and unverified on OriginOS. The mDNS
   fallback path must be tested on the target device before it is relied on.
4. **Sustained inference raises device temperature.** The thermal policy in §6 is required, not
   optional.
5. **Model download size affects first-run time.** If weights are not bundled, the first launch
   requires a network and the offline claim does not hold until it completes.

---

## 15. Prototype site

This repository also contains a browser prototype of the above, used for design and rehearsal.
It is not the Android application and shares no code with it.

| Path | Contents |
|---|---|
| `index.html` | Single-page prototype and design rationale |
| `assets/css/` | `tokens` · `site` · `phone` · `doodle` |
| `assets/js/data.js` | Fixture corpus: problems, scan output, chapter chunks, roster |
| `assets/js/app.js` | Prototype state machine, screen renderers, router, trace inspector |
| `assets/js/doodles.js` | Generated SVG scenes, one per screen |
| `assets/js/icons.js` | Icon set |
| `assets/js/qr.js` | Pre-generated QR matrix |
| `deck/` | Presentation deck, 1920×1080, for screen recording |

The prototype is driven by scripted state and fixed timings. It performs no inference. Every
figure it displays comes from `data.js`.
