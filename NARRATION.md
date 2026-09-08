# EduQoo — Recording guide & narration script

Everything needed to produce the product film: how to capture the picture, the voice-over
written to be pasted straight into ElevenLabs, and the music and sound cue sheet.

**Runtime: 8:06** with the title card and the end card — comfortably inside a 10-minute cap.
For the tighter 4:20 launch cut and its shot list, see [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md).
Its music map is timed to that cut, not this one; Part 3 below is the map for this cut.

1. [Recording](#part-1--recording) · 2. [The narration script](#part-2--the-narration-script) · 3. [Music and sound](#part-3--music-and-sound)

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

## 1.4 The thumbnail

Slide 1 is a title card built to be grabbed as a still: wordmark, the track badge, the
headline, and the phone showing the red boundary. It carries no narration.

To export it: open the deck, press <kbd>F</kbd> then <kbd>H</kbd> then <kbd>C</kbd>, press
<kbd>R</kbd> to restart, let the lines finish animating in — about two seconds — then take a
full-screen screenshot. At 1080p that is a 1920 × 1080 frame, which is exactly what YouTube
and most submission forms want.

If you would rather pull it from the footage, the card holds for seven seconds at the top of
the recording, so any frame after 00:02 is clean.

## 1.5 Slide timings

Each slide's dwell is the `t:` value in `deck/deck.js`. The narration takes below are
written to sit inside those, not the other way around — if a take runs long, lengthen the
slide rather than rushing the read.

## 1.6 Checklist before the take

- [ ] Fullscreen, controls hidden, captions decided
- [ ] Notifications off, taskbar hidden
- [ ] Deck restarted from slide 1 (the title card)
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

Model **`eleven_multilingual_v2`** — needed for the Tamil and Hindi pickups in §2.5.

| Setting | Value | Why |
|---|---|---|
| Stability | **0.45** | Loose enough to keep intonation alive across long sentences, tight enough not to drift. |
| Similarity | **0.80** | |
| Style exaggeration | **0.10** | Anything higher starts performing. |
| Speaker boost | **On** | |
| Speed | **0.95** | The single setting that decides whether this reads as a keynote or an advert. |

### Step by step

1. **Sign in** at [elevenlabs.io](https://elevenlabs.io) and open **Voices → Voice Library**.

2. **Find a voice.** Filter to *English*, use case *Narration* or *Informative*. Look for a
   middle-aged, lower-pitched voice described as calm, measured or documentary. Avoid
   anything tagged energetic, upbeat, commercial or promo — those read as an advert no
   matter what you do with the sliders.

3. **Audition before you commit.** Shortlist two or three, and generate **`vo_03`** with each
   — it is only 156 characters, so it costs almost nothing and it contains the product name.
   Pick the one that sounds like it is telling you something rather than selling it.

4. Click **Add to My Voices** on the winner.

5. Open **Text to Speech**, select that voice, and set the model to
   **Eleven Multilingual v2**.

6. **Set the sliders once**, to the values in the table above, and then do not touch them
   again. Different settings between takes is the single most common reason a set of
   generations will not cut together — the tone drifts audibly between clips.

7. **Paste one take. Generate. Download.** Rename it `vo_01`, `vo_02` … `vo_14` immediately,
   into one folder. Do not batch several takes into one generation.

8. **Listen before moving on.** Two adjustments cover almost everything:
   - Rushing, or eating the pauses → drop **Speed** to 0.92.
   - Tone wandering mid-take → raise **Stability** to 0.55.
   Change it, regenerate that take, and put the setting back for the rest only if the
   problem was specific to that take.

9. **If a take is 90% right, regenerate rather than edit the text.** The wording is timed to
   the slides; rewriting it to chase a delivery problem will cost you the sync.

10. **Export** as WAV if your plan allows it, otherwise the highest-bitrate MP3 available
    (192 kbps or better), 44.1 kHz.

11. **The regional lines in §2.5** need a voice that actually speaks Tamil or Hindi — most
    English library voices will mangle them. Easier and more convincing: record the phone's
    own Android TTS output instead.

**Budget.** The full script is **5,231 characters**. Allow roughly three times that —
about **16,000** — for auditions and retakes. That fits inside most paid monthly
allowances; on the free tier, plan to spread it over two months or generate the two longest
takes last.

**Render each take as its own file** — `vo_01.wav` through `vo_14.wav`. Do not paste the
whole script as one generation. You will want to nudge individual takes 200–400 ms against
the picture, and you cannot do that inside one file. Every take below is short enough for
any ElevenLabs plan.

The punctuation is direction, not grammar. The em dashes are breaths and the short
sentences are holds. Do not tidy them.

## 2.3 Paste-ready text

**[`docs/elevenlabs-takes.txt`](docs/elevenlabs-takes.txt)** is the script normalised for
the speech engine. Use that file when you generate, not §2.4 — §2.4 is written for a human
reading the page, the txt is written for the model reading it aloud. The words are
identical; the spelling and the pauses are not.

Three things it does that raw text does not:

**Break tags for the holds.** Multilingual v2 supports `<break time="1.0s" />`. The holds in
this script are load-bearing — the pause before *"So we built EduQoo"* is the reveal — and
punctuation alone will not reliably produce them. Keep the tags between 0.4 s and 1.2 s and
do not add more than a handful per take; a stack of long breaks makes the model unstable
and it starts inventing breaths.

**Initialisms spelled out.** `A.P.I.`, `N.P.U.`, `M.L. Kit`, `L.L.M.`, `C.S.V.`, `Q.R.` and
`Gemma two, two B`. Without the periods, TTS engines guess, and "Gemma-2-2B" tends to come
out as *"Gemma dash two dash two bee"*.

**The two names respelled.** `EduQoo` → **EduKoo**, `iQOO` → **eye-koo**. These are
best-guess spellings — I have not heard your chosen voice say them. **Audition the product
name before you commit to a voice:** generate `vo_03`, which contains it, and if it comes
out wrong try `Eddoo-Koo` or `Edu Koo` until it lands. Getting your own product name wrong
across an eight-minute film is the one error a jury will definitely notice.

### Short takes drift — give them a run-up

`vo_03` and `vo_14` are the two shortest takes, and short generations wander in tone because
the model has no context to settle into. Both are marked **LEAD-IN** in the txt: they begin
with a sentence repeated from the take before. Generate the whole block, then trim back to
the marked line in your editor. The repeated sentence is never used.

If you are driving the API rather than the web UI, use `previous_text` instead — same effect,
no trimming.

### A note on v3 and audio tags

Eleven v3 accepts inline direction like `[calm]` or `[thoughtful]`. **Multilingual v2 does
not** — paste a tag into v2 and it will read the word "calm" out loud. Stay on v2 for this
script: it is steadier over long-form narration, which matters more here than expressive
range. Everything in the txt is written for v2.

## 2.4 The takes

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

## 2.5 Regional pickups

Only needed if you want a polished alternative to the phone's own Android TTS in the
walkthrough insert. **Use the phone's real audio if you can** — it is less pretty and far
more convincing, because it is the thing you are claiming works.

| Lang | Line |
|---|---|
| **ta** | இடது பக்கம் 5 நீங்குகிறது. வலது பக்கம் 15 ஆகும், 25 அல்ல. |
| **hi** | बाईं ओर से 5 हट जाता है। दाईं ओर 15 बचता है, 25 नहीं। |

## 2.6 Assembly

1. Lay all fourteen takes on the timeline first, in order, with roughly two seconds between them.
2. Drop the deck capture underneath and stretch each slide to meet its take.
3. Only then add the b-roll and the screen inserts, per [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) §4.
4. Leave the Tamil audio in the clear. Do not narrate over it — it is the most persuasive
   six seconds you have.
5. Lay the music last, against the cue sheet in Part 3. The final cue is silence —
   nothing plays over the end card.

---

# Part 3 — Music and sound

The narration cut runs **8:06** with the title card and the end card. This is its cue
sheet. [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) §6 has a different one — that map is timed to
the 4:20 launch cut and the two are not interchangeable. Use whichever matches the cut you
are actually building.

## 3.1 Choosing the track

**One piece, no edits, no drop.** A track that changes character halfway will fight the
narration, and you cannot fix that in the mix.

Search for: *minimal piano*, *ostinato*, *ambient documentary*, *underscore*. What you want
is a slow repeating figure with no percussion for the first ninety seconds, and something
that can sit still for eight minutes without becoming irritating.

Avoid: anything with a build-and-drop structure, anything with a beat that lands on a grid
you will end up cutting to, and anything described as *corporate*, *inspiring* or
*technology*. Those all pull the film towards an advert, which is the opposite of the
register the script is written in.

**Licensing matters for a submission.** Epidemic Sound, Artlist and Musicbed are the paid
options. Free and safe: the YouTube Audio Library, Pixabay Music, and Kevin MacLeod's
catalogue under CC-BY — the last one needs the attribution line in your description, so
read the terms before you commit to a track.

Length: find something at least 8:30 so you are not looping. If you must loop, cross-fade
over four seconds somewhere the narration is already speaking, never in a gap.

## 3.2 The cue sheet

Levels are relative to a master mastered at −14 LUFS. "Bed" means sitting under the voice
without competing with it.

| TC | On screen | Music | Note |
|---|---|---|---|
| 0:00 | **Title card** | fade in to **−18 dB** | Music alone. It is the only thing playing, so it can carry. |
| 0:07 | vo_01 · The page | duck to **−24 dB** | Sparse. No percussion yet. |
| 0:39 | vo_02 · The room | **−24 dB** | Hold. This act is a problem statement, not a build. |
| 1:14 | *(gap)* | lift to **−19 dB** | Two seconds of music alone before the reveal. |
| 1:16 | vo_03 · The reveal | **−16 dB** | **The one lift in the film.** Percussion may enter here. |
| 1:32 | vo_04 · No server | settle to **−23 dB** | |
| 2:06 | vo_05 · The model | **−23 dB** | Bed for the whole technical act. |
| 2:45 | vo_06 · The silicon | **−23 dB** | |
| 3:30 | vo_07 · Constrained decoding | **−25 dB** | The densest take in the script. Give it room. |
| 4:22 | vo_08 · The scan | **−23 dB** | |
| 5:02 | vo_09 · The red boundary | **−26 dB** | Pull back. The picture is doing the work. |
| 5:24 | vo_10 · Who decided | **−23 dB** | |
| 6:02 | vo_11 · The voice | **−23 dB** | |
| **6:27** | **Tamil audio, in the clear** | **−32 dB** | **Duck hard.** Six seconds, no narration. Do not talk over it and do not let the score compete. |
| 6:35 | vo_12 · The teacher | back to **−23 dB** | |
| 7:08 | vo_13 · The system around it | **−23 dB** | |
| 7:44 | *(gap)* | **−20 dB** | Let it breathe before the close. |
| 7:46 | vo_14 · Close | lift to **−18 dB** | |
| 7:59 | **End card** | fade to silence over 5s | Nothing else plays. |

**Total 8:06.**

## 3.3 Ducking

Do it by hand, not with a sidechain compressor. Fourteen takes with clean gaps between them
is few enough to keyframe, and manual ducks let you decide *where* the music comes back up —
which is the whole expressive point of the cue sheet above. An automatic ducker will pump on
every breath and flatten the two moments that matter (1:16 and 6:27).

Ramp over **400–600 ms** into a duck and **800 ms–1.2 s** back out. Fast in, slow out. A duck
that snaps back sounds like a mistake.

## 3.4 Sound design

Seven cues for eight minutes. Resist adding more — the restraint is what makes the few you
keep land.

| TC | Cue |
|---|---|
| 0:07 | One soft low tone as the title card gives way to the first slide. |
| 1:34 | The real airplane-mode toggle click, taken from the B2 footage. Keep the original, do not replace it with a library sound. |
| 4:26 | Three short UI ticks as the scan detection boxes land, one per line. |
| 5:04 | **One lower tick** as the red boundary appears. Pitch it below the other three — that is what makes it read as *the error* rather than another step. |
| 6:40 | A soft file-landing tick as the CSV appears on the laptop. |
| 7:16 | The real camera-focus confirm from the QR scan shot. |
| 7:59 | **Nothing.** Silence is the last cue in the film. |

## 3.5 Levels for delivery

| Target | Value |
|---|---|
| Master integrated loudness | **−14 LUFS** (YouTube and most submission portals normalise to this) |
| True peak ceiling | **−1.0 dBTP** |
| Narration bus | around **−16 LUFS** short-term, so it sits above the bed without limiting |
| Music bed under VO | **18–22 dB** below the narration |
| Room tone under b-roll | **−40 dB**, but present — a silent b-roll shot between two scored ones sounds broken |

Check the whole thing once on laptop speakers and once on phone speakers before you export.
Most juries will watch it on one of those two, not on monitors.
