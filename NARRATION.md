# EduQoo — Recording guide & narration script

Everything needed to produce the product film: how to capture the picture, and the
voice-over written to be pasted straight into ElevenLabs.

**Runtime: about 8 minutes** of narration — comfortably inside a 10-minute cap.
For the tighter 4:20 launch cut and its shot list, see [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md).

---

# Part 1 — Recording

## 1.1 The deck

```bash
python -m http.server 5599
```

Open **`http://localhost:5599/deck/`**.

| Key | Does |
|---|---|
| <kbd>F</kbd> | Fullscreen — **always do this before recording** |
| <kbd>H</kbd> | Hide the control bar and the slide counter |
| <kbd>C</kbd> | Toggle the burn-in captions |
| <kbd>Space</kbd> | Pause / resume the autoplay |
| <kbd>←</kbd> <kbd>→</kbd> | Step manually |
| <kbd>R</kbd> | Restart from slide 1 |

**Order of operations, every time:** F, then H, then C, then R. If you record before
pressing H you will have a progress bar burned into the master.

The deck is a fixed 1920×1080 stage scaled to the window, so **record at exactly 1080p**
and the type lands pixel-perfect. On a HiDPI display, set the capture to 2× and downscale
in the edit — noticeably crisper.

**Record it twice.** Once letting it autoplay end to end, which gives you honest timing.
Once stepping manually with the arrow keys, which gives you a clean still of every slide
for pickups and thumbnails.

## 1.2 Capture settings

| Setting | Value |
|---|---|
| Tool | OBS Studio — Display Capture |
| Resolution | 1920 × 1080 (downscale from 2× if HiDPI) |
| Frame rate | 60 fps |
| Encoder | x264, CRF 16 |
| Container | MP4 |
| Audio | Record nothing — the VO is added in the edit |

Turn off notifications, hide the taskbar, and close anything that might pop a toast.
A Slack badge in the corner of a submission video is the kind of detail a jury notices.

## 1.3 The prototype

Same server, `http://localhost:5599/`. Crop the capture to the device.

Use a window at least **1041px wide and 700px tall** so the stage pins and the phone sits
at full size. Scroll walks the phone through all eight screens — five as the student, then
three as the teacher.

Three inserts are worth capturing on their own:

- **The scan.** Tutor → *Scan the page*. Start recording *before* you click, so the
  detection boxes land one at a time and the confirm sheet appears on camera.
- **The trace.** Tap the `EduQoo Core` chip. Two-pass diagram, tool log with per-call
  timings, context budget, verifier verdict. Crop tight.
- **The walkthrough.** *Show me why*, with Tamil selected.

## 1.4 Slide timings

Each slide's dwell is the `t:` value in `deck/deck.js`. The narration takes below are
written to sit inside those, not the other way around — if a take runs long, lengthen the
slide rather than rushing the read.

## 1.5 Checklist before the take

- [ ] Fullscreen, controls hidden, captions decided
- [ ] Notifications off, taskbar hidden
- [ ] Deck restarted from slide 1
- [ ] Recording at 1080p / 60
- [ ] A test capture of ten seconds, played back, before the real run

---

# Part 2 — The narration script

## 2.1 Voice direction

One narrator. No second voice, no interview, no testimonial.

| Parameter | Setting |
|---|---|
| **Register** | Mid-low, unhurried. Someone explaining something they have thought about for a long time — not someone selling it. |
| **Pace** | ~135 words per minute. Slower than an explainer video. |
| **Accent** | Neutral Indian English, or neutral international English. Not an American ad-read. |
| **Energy** | Flat through takes 1–2. It is a problem statement, not a pitch. One lift at take 3. Drops again for take 14. |
| **Avoid** | Rising inflection at the end of sentences. Smiling delivery. The word "revolutionary". |

## 2.2 ElevenLabs settings

Model **`eleven_multilingual_v2`** — needed for the Tamil and Hindi pickups in §2.4.

| Setting | Value | Why |
|---|---|---|
| Stability | **0.45** | Loose enough to keep intonation alive across long sentences, tight enough not to drift. |
| Similarity | **0.80** | |
| Style exaggeration | **0.10** | Anything higher starts performing. |
| Speaker boost | **On** | |
| Speed | **0.95** | The single setting that decides whether this reads as a keynote or an advert. |

**Render each take as its own file** — `vo_01.wav` through `vo_14.wav`. Do not paste the
whole script as one generation. You will want to nudge individual takes 200–400 ms against
the picture, and you cannot do that inside one file. Every take below is short enough for
any ElevenLabs plan.

The punctuation is direction, not grammar. The em dashes are breaths and the short
sentences are holds. Do not tidy them.

## 2.3 The takes

Fourteen takes, **7 min 21 s** of speech at 135 wpm — about **7:47** once you leave two
seconds between them. Every take is under 600 characters, so all of them fit inside a single
generation on any ElevenLabs plan.

| Take | Chars | Words | ≈ | Beat |
|---|---:|---:|---:|---|
| `vo_01` | 341 | 67 | 0:30 | The page |
| `vo_02` | 390 | 78 | 0:35 | The room |
| `vo_03` | 156 | 32 | 0:14 | The reveal |
| `vo_04` | 393 | 73 | 0:32 | No server |
| `vo_05` | 465 | 84 | 0:37 | The model |
| `vo_06` | 490 | 97 | 0:43 | The silicon |
| `vo_07` | 580 | 112 | 0:50 | Constrained decoding |
| `vo_08` | 464 | 85 | 0:38 | The scan |
| `vo_09` | 237 | 44 | 0:20 | The red boundary |
| `vo_10` | 441 | 82 | 0:36 | Who decided |
| `vo_11` | 317 | 57 | 0:25 | The voice |
| `vo_12` | 362 | 70 | 0:31 | The teacher |
| `vo_13` | 445 | 82 | 0:36 | The system around it |
| `vo_14` | 150 | 29 | 0:13 | Close |
| **Total** | **5,231** | **992** | **7:21** | |

---

### vo_01 · The page

> She wrote three x equals twenty-five.
>
> The line above it was three x plus five equals twenty. She moved the five across the equals sign and added it instead of subtracting it. Every line after that is wrong, and none of it is really her fault.
>
> She will get the book back with a cross next to the answer, and no mark at all against line two.

---

### vo_02 · The room

> This is a classroom of sixty, with one teacher and forty minutes. Nobody in that room has time to find the exact line where each child lost it. So the gap does not get closed. It compounds, quietly, for years.
>
> And you cannot fix it by calling an API. Out here there is one bar of signal and a data pack that ran out on the twentieth. Anything that needs a round trip is a tutor that spins.

---

### vo_03 · The reveal

> So we built EduQoo.
>
> It reads the page, finds the wrong step, and says why — out loud, in the language the child actually thinks in. All of it on one phone.

---

### vo_04 · No server

> Before anything else, the thing that makes this different. There is no server. No API key. Not one network request. Everything you are about to see happens between the camera and the silicon.
>
> Airplane mode goes on at the start of this demo, and it stays on. Not as a party trick. The classrooms we are building for do not have a network to fall back on, so we removed the assumption entirely.

---

### vo_05 · The model

> What is actually running is Gemma-2-2B. Two billion parameters, quantised down to four bits, loaded through MediaPipe LLM Inference and kept warm in memory so the first answer is not the slow one. The weights ship inside the app.
>
> Two billion is small, and that is deliberate. A bigger model would not survive the thermal envelope of a phone that has been working all day. We do not need one — because the model is not the thing deciding whether the maths is right.

---

### vo_06 · The silicon

> This is where the iQOO earns its place in the project. The phone here is not the screen. It is the compute.
>
> Inference targets the Snapdragon NPU, so decoding runs on silicon built for it instead of grinding the CPU flat. That is the difference between an answer in two seconds and an answer in twenty — and on a device a child is holding, twenty seconds is the same as never.
>
> It is also why we only ever run one inference at a time. Heat is real, and a demo that ignores it dies on stage.

---

### vo_07 · Constrained decoding

> Here is the trick that makes a small model enough. We do not ask it nicely for a valid answer and hope. We mask the decoder to a grammar as it generates, so a malformed answer is not unlikely — it is unreachable. The wrong token is deleted before the model can reach for it.
>
> There is a catch. Turn on schema constraints and tool calling in the same pass, and the mask puts the tool tokens out of reach as well. The model quietly stops calling tools, the output still validates, and nothing looks broken. So we split it in two. Pass one runs the tools. Pass two writes the answer.

---

### vo_08 · The scan

> Now, the product itself. Point the camera at the page.
>
> ML Kit reads each handwritten step on the device and hands back a confidence score for every line. Here, line three came back at seventy-one per cent, under our threshold, so the app stops and asks her to confirm what it read before it judges anything.
>
> That confirm step is not an apology for the recognition. It is the correct order of operations. The machine should never mark work it is not sure it read.

---

### vo_09 · The red boundary

> And then this.
>
> Not a cross next to the answer. A red boundary drawn on the exact step where her working stopped being true. Line two.
>
> That is the whole product, really. The difference between a grade and a lesson is knowing which line.

---

### vo_10 · Who decided

> Notice who decided that. A symbolic solver, running on the phone, asking one question per line: is this step still algebraically equal to the one above it? The first place that stops being true is the error.
>
> The language model never gets a vote on whether the maths is right. It only writes the sentence that explains it. That split is the entire safety argument — a wrong correction on a child's homework is not a bad output, it is a harm.

---

### vo_11 · The voice

> Then it explains itself out loud, in Tamil.
>
> The model turns the solver's trace into one short sentence per step, and Android text-to-speech reads it from a voice pack sitting on the device. A child who is behind in maths is very often behind in English too. An explanation in a second language is not an explanation.

---

### vo_12 · The teacher

> Every line we flag is also a data point. Each error writes a concept tag to a local record, the class aggregates into a heatmap by concept, and the teacher pulls the whole thing to a laptop as a CSV over Office Kit.
>
> She walks out of that room knowing that two thirds of her class cannot transpose a term yet. That is the part that changes what happens tomorrow.

---

### vo_13 · The system around it

> The same runtime, pointed at a chapter instead of a page, gives you a notebook you can question — where every answer cites the line it came from, and it refuses anything outside the source.
>
> And when there are thirty students, the phone raises an access point with nothing behind it and serves the whole class from its own storage. They scan a QR code and they are in, in whatever browser they already have. No install. No account. No data plan.

---

### vo_14 · Close

> One phone. One page. The exact line she got wrong, and why, in the language she thinks in.
>
> No server. No signal. No account.
>
> It was never the point.

---

## 2.4 Regional pickups

Only needed if you want a polished alternative to the phone's own Android TTS in the
walkthrough insert. **Use the phone's real audio if you can** — it is less pretty and far
more convincing, because it is the thing you are claiming works.

| Lang | Line |
|---|---|
| **ta** | இடது பக்கம் 5 நீங்குகிறது. வலது பக்கம் 15 ஆகும், 25 அல்ல. |
| **hi** | बाईं ओर से 5 हट जाता है। दाईं ओर 15 बचता है, 25 नहीं। |

## 2.5 Assembly

1. Lay all fourteen takes on the timeline first, in order, with roughly two seconds between them.
2. Drop the deck capture underneath and stretch each slide to meet its take.
3. Only then add the b-roll and the screen inserts, per [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) §4.
4. Leave the Tamil audio in the clear. Do not narrate over it — it is the most persuasive
   six seconds you have.
5. The last cue is silence. Nothing plays over the end card.
