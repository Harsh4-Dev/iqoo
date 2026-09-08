# EduQoo — Launch Film

**Director's script, shot list and VO.**
Runtime **4:20** — inside the rubric's 3–5 minute pitch window. 1920×1080, 30 fps.

The film has one job: make it obvious, in the first ninety seconds, that a real model is
running on the phone and nothing is being called over a network. Everything else follows from
that.

| Asset | What it is |
|---|---|
| [`deck/index.html`](deck/index.html) | The keynote. 24 slides, self-running, morph transitions. **The picture spine.** |
| [`index.html`](index.html) | The live prototype. Source of every screen-capture insert. |
| This file | Timecoded edit, VO, b-roll, voice, music and transition direction. |

---

## 0 · Before you record

**The keynote.** `python -m http.server 5599`, then `http://localhost:5599/deck/`.
**F** fullscreen · **H** hides the control bar · **C** toggles burn-in captions ·
**R** restarts · **Space** pauses · **←/→** step.

The deck is a fixed 1920×1080 stage scaled to the window, so record at exactly 1080p and the
type is pixel-perfect. Record it twice: once autoplaying for timing, once stepping for pickups.

**Prototype captures.** Same server, `http://localhost:5599/`, cropped to the device.

**Device b-roll.** Seven shots (§4). **B2** and **B4** carry the whole argument — shoot those
properly even if everything else is rushed.

---

## 1 · Voice direction

One narrator. No second voice, no interview.

| Parameter | Setting |
|---|---|
| **Register** | Mid-low, unhurried. Explaining, not selling. |
| **Pace** | ~135 wpm. Slower than an explainer. |
| **Accent** | Neutral Indian English, or neutral international. Not an American ad-read. |
| **Energy** | Flat through Act I. One lift at 0:37. Drops again for the close. |
| **Never** | Upward inflection at sentence ends. Smiling delivery. |

### ElevenLabs

Model **`eleven_multilingual_v2`** (needed for the regional pickups in §3).

| Setting | Value |
|---|---|
| Stability | **0.45** |
| Similarity | **0.80** |
| Style exaggeration | **0.10** |
| Speaker boost | **on** |
| Speed | **0.95** |

Render each beat as its own file, `vo_01.wav` … `vo_31.wav`. Don't render the script as one
take — you'll want to nudge individual beats against picture.

---

## 2 · The edit

`DECK n` = keynote slide · `SCREEN` = prototype capture · `B n` = §4 shot

| # | In | Dur | Picture | Transition | VO |
|---|---|---|---|---|---|
| 01 | 0:00.0 | 5.0 | **B1** — the notebook | fade from black 1.5s | *(silence)* |
| 02 | 0:05.0 | 8.5 | **DECK 01** — she wrote 3x = 25 | dissolve 0.8s | vo_01 |
| 03 | 0:13.5 | 7.5 | **DECK 02** — nobody notices | cut | vo_02 |
| 04 | 0:21.0 | 7.5 | **DECK 03** — one bar | dissolve 0.6s | vo_03 |
| 05 | 0:28.5 | 7.0 | **DECK 04** — one good phone | cut | vo_04 |
| 06 | 0:35.5 | 1.5 | **BLACK** | fade 0.5s | *(silence — hold it)* |
| 07 | 0:37.0 | 6.0 | **DECK 05** — wordmark | fade up 1.0s | vo_05 |
| 08 | 0:43.0 | 8.0 | **DECK 06** — the claim | *morph* | vo_06 |
| — | | | **— ACT II · the model lives here —** | | |
| 09 | 0:51.0 | 8.5 | **DECK 07** — no server | *morph* | vo_07 |
| 10 | 0:59.5 | 6.0 | **B2** — airplane mode, answering | cut, hard | vo_08 |
| 11 | 1:05.5 | 9.0 | **DECK 08** — Gemma-2-2B | dissolve 0.6s | vo_09 |
| 12 | 1:14.5 | 9.5 | **DECK 09** — the NPU | cut | vo_10 |
| 13 | 1:24.0 | 5.0 | **B3** — the device under load | cut | vo_11 |
| 14 | 1:29.0 | 9.5 | **DECK 10** — constrained decoding | dissolve 0.6s | vo_12 |
| 15 | 1:38.5 | 9.0 | **DECK 11** — two-pass | cut | vo_13 |
| — | | | **— ACT III · the MVP path —** | | |
| 16 | 1:47.5 | 9.0 | **DECK 12** — it reads, then asks | *morph* | vo_14 |
| 17 | 1:56.5 | 6.0 | **SCREEN A** — the live scan | cut, hard | vo_15 |
| 18 | 2:02.5 | 8.5 | **DECK 13** — the red boundary | *morph, zoom to 1.7×* | vo_16 |
| 19 | 2:11.0 | 5.0 | **B4** — the red box on the real page | cut | vo_17 |
| 20 | 2:16.0 | 9.0 | **DECK 14** — a solver decided | *morph* | vo_18 |
| 21 | 2:25.0 | 5.0 | **SCREEN B** — the runtime trace | cut | vo_19 |
| 22 | 2:30.0 | 8.5 | **DECK 15** — in Tamil | *morph* | vo_20 |
| 23 | 2:38.5 | 6.0 | **SCREEN C** — walkthrough, real TTS audio | cut | *(no VO)* |
| 24 | 2:44.5 | 9.0 | **DECK 16** — every flagged line | dissolve 0.6s | vo_21 |
| 25 | 2:53.5 | 6.0 | **B5** — the CSV lands on the laptop | cut | vo_22 |
| — | | | **— ACT IV · the system around it —** | | |
| 26 | 2:59.5 | 8.0 | **DECK 17** — StudyDesk | *morph* | vo_23 |
| 27 | 3:07.5 | 7.0 | **DECK 18** — the refusal | *morph, zoom* | vo_24 |
| 28 | 3:14.5 | 8.0 | **DECK 19** — the phone is the server | *morph* | vo_25 |
| 29 | 3:22.5 | 5.0 | **B6** — a stranger scans the QR | cut | vo_26 |
| 30 | 3:27.5 | 9.0 | **DECK 20** — EduQoo Core | dissolve 0.8s | vo_27 |
| 31 | 3:36.5 | 9.5 | **DECK 21** — six things | dissolve 0.6s | vo_28 |
| 32 | 3:46.0 | 6.0 | **B7** — iQOO macro | cut | vo_29 |
| — | | | **— ACT V · close —** | | |
| 33 | 3:52.0 | 8.5 | **DECK 22** — the rubric | dissolve 0.6s | vo_30 |
| 34 | 4:00.5 | 9.0 | **DECK 23** — the close | fade through black 0.7s | vo_31 |
| 35 | 4:09.5 | 6.5 | **DECK 24** — the URL | dissolve 0.5s | *(silence)* |
| 36 | 4:16.0 | 4.0 | **END CARD** | fade to black 1.5s | *(silence)* |

**Total: 4:20**

---

## 3 · The voice-over, verbatim

One render per line. These match the deck's burn-in captions word for word, so the two can't
drift.

### Act I — the page she handed in

**vo_01** — `0:05`
> She wrote three x equals twenty-five. The line above it was three x plus five equals twenty. She moved the five across and added it instead of subtracting. Everything after that is wrong, and none of it is really her fault.

**vo_02** — `0:13.5`
> And nobody in that room has time to notice. Sixty students, one teacher, forty minutes. The book comes back with a cross next to the answer and no mark against line two.

**vo_03** — `0:21`
> And no, you cannot just call an API here. One bar of signal, and a data pack that ran out on the twentieth. Anything that needs a round trip is a tutor that spins. So we built for the bottom of the bar and treated signal as a bonus.

**vo_04** — `0:28.5`
> And then there's the maths of it. A government school can buy one good phone. It can't buy thirty. So we stopped designing for thirty devices and started designing for one.

*(1.5 seconds of black. Music alone.)*

**vo_05** — `0:37`
> This is EduQoo.

**vo_06** — `0:43`
> It reads the page, finds the wrong step, and says why. A math tutor running entirely on one iQOO phone. Camera in, spoken correction out, in the child's own language.

### Act II — the model lives here

**vo_07** — `0:51`
> Before anything else, the thing that makes this different. There is no server. No API key. Not one network request. Everything you are about to see happens between the camera and the silicon.

**vo_08** — `0:59.5` *(over B2)*
> Airplane mode is on. It stays on for the rest of this film.

**vo_09** — `1:05.5`
> What's actually running is Gemma-2-2B. Two billion parameters, quantised to four bits, loaded through MediaPipe LLM Inference and kept warm in memory so the first explanation isn't the slow one. The weights ship inside the APK. Nothing gets fetched, ever.

**vo_10** — `1:14.5`
> And this is where the iQOO earns its place. The phone isn't the screen in this project, it's the compute. Inference targets the Snapdragon NPU, so decoding runs on silicon built for it instead of grinding the CPU flat. That's the difference between an answer in two seconds and an answer in twenty. It's also why we only ever run one inference at a time. Heat is real.

**vo_11** — `1:24` *(over B3)*
> No fan. No rack. No bill. Just a phone getting slightly warm.

**vo_12** — `1:29`
> Now, two billion parameters is small. Here's the trick that makes it enough. We don't ask the model nicely for a valid answer. We mask the decoder to a grammar as it goes, so the wrong token is deleted before it can be picked. A malformed answer isn't unlikely, it's unreachable.

**vo_13** — `1:38.5`
> Except switching that on breaks something else, quietly. Constrain the grammar and enable tool calling in the same pass, and the mask puts the tool tokens out of reach. The model stops calling tools. The output still validates, so nothing looks wrong. It has just stopped working. So we split it in two. Pass one runs the tools, pass two writes the answer.

### Act III — the MVP path

**vo_14** — `1:47.5`
> So. Point it at the page. ML Kit reads each handwritten step on the device and hands back a confidence for every line. Line three came back at seventy-one per cent, under our threshold, so it stops and asks her to confirm. The machine never judges work it isn't sure it read.

**vo_15** — `1:56.5` *(over SCREEN A)*
> Three steps found. Two clean, one to check.

**vo_16** — `2:02.5`
> And there it is. Not a cross next to the answer — a red boundary drawn on the exact step where her working stopped being true. Line two. That is the whole product.

**vo_17** — `2:11` *(over B4)*
> On the page she actually wrote it on.

**vo_18** — `2:16`
> And notice who decided that. A symbolic solver, running on the phone, asking one question per line — is this step still equal to the one above it. The language model never gets a vote on whether the maths is right. It only writes the sentence that explains it. We're not going to hallucinate at a child learning maths.

**vo_19** — `2:25` *(over SCREEN B — the trace)*
> Every call it makes is on the record. Which tool, how long, and what the verifier said.

**vo_20** — `2:30`
> Then it says it out loud, in Tamil, because that's the language she thinks in. An explanation in a second language isn't an explanation. The model turns the solver trace into one sentence per step, and Android TTS speaks it from a pack sitting on the device. Airplane mode is still on.

*(`2:38.5` — no narration for six seconds. Let the Tamil audio play in the clear. This is the most persuasive six seconds in the film. Do not talk over it.)*

**vo_21** — `2:44.5`
> And every line we flag is a data point. Each error writes a concept tag to a local record, the class aggregates into a per-concept heatmap, and the teacher pulls the CSV to a laptop over Office Kit. She walks out knowing that two thirds of the room can't transpose a term yet.

**vo_22** — `2:53.5` *(over B5)*
> Phone to laptop, over the bridge, with the phone still offline.

### Act IV — the system around it

**vo_23** — `2:59.5`
> The same runtime pointed at a chapter instead of a page gives you a notebook you can question. Chunked, embedded and indexed here, and every answer cites the line it came from.

**vo_24** — `3:07.5`
> And when it doesn't know, it says so, rather than making something up. A small model you can actually trust is one that's willing to disappoint you.

**vo_25** — `3:14.5`
> And when there are thirty of them, the phone raises an access point with nothing behind it and serves the whole class from its own storage. They scan a QR and they're in, in whatever browser they already have.

**vo_26** — `3:22.5` *(over B6)*
> Any phone in the room. No install, no account, no data plan.

**vo_27** — `3:27.5`
> Holding all of it together is EduQoo Core. A tool registry, a context budgeter, the two-pass executor, and a verifier that checks everything before a student sees it. Wrapped around a model that never leaves the phone.

**vo_28** — `3:36.5`
> Which is why it had to be this device, and why it had to be native. The model on the NPU, the masked decoder, the camera, the hotspot radio, the foreground service holding it up, and the offline voice packs. Six things you don't get at arm's length through a wrapper.

**vo_29** — `3:46` *(over B7)*
> One phone, doing all of it, on its own battery.

### Act V — close

**vo_30** — `3:52`
> The rubric has six dimensions, and two of them are measured off the device rather than judged. Creative phone use, and Office Kit. Camera, voice and on-device AI are all in the critical path here, so those numbers are real rather than staged.

**vo_31** — `4:00.5`
> One phone. One page. The exact line she got wrong, and why, in the language she thinks in. No server, no signal, no account. It was never the point.

---

### Regional pickups

Use the phone's real Android TTS audio in the 2:38.5 window if you can — it is less pretty and
far more convincing. These are the fallback.

| Lang | Line |
|---|---|
| **ta** | இடது பக்கம் 5 நீங்குகிறது. வலது பக்கம் 15 ஆகும், 25 அல்ல. |
| **hi** | बाईं ओर से 5 हट जाता है। दाईं ओर 15 बचता है, 25 नहीं। |

---

## 4 · B-roll shot list

Seven shots, one session. Natural light, no ring light, no studio white.

**B1 — the notebook** · `0:00` · 5s · *no VO*
Dusk, interior, low light. A school exercise book open on a desk, the three lines of working
clearly legible, `3x = 25` in the middle. Slow push in. Grade cool, a stop under.
*This is the only cold frame in the film, and the error has to be readable.*

**B2 — airplane mode, answering** · `0:59.5` · 6s — **the proof shot**
One continuous take, no cut. Pull the shade down so the **airplane mode toggle is
unambiguously on**, hold a beat, swipe up, scan the page, let the answer come back — all in
one shot with the status bar visible in frame throughout.
*The moment you cut between "airplane mode is on" and "it answered", a technical judge assumes
you cut for a reason. Don't give them the gap.*

**B3 — the device working** · `1:24` · 5s
Macro. The phone mid-inference, then rack focus to the back of the device. A thermal insert
over the SoC is worth more than any diagram if you have the kit; otherwise a hand resting on
the back, then lifting.

**B4 — the red box, for real** · `2:11` · 5s
The phone held over the actual notebook, screen showing the red boundary aligned with the
handwritten line underneath it. Get both in focus. **This is the single most on-brief frame in
the film** — the correction, on the page, offline.

**B5 — Office Kit** · `2:53.5` · 6s
The CSV appearing in a spreadsheet on the laptop, with the phone visible in frame still showing
its own hotspot active. One take, no cut between phone and screen.

**B6 — the scan** · `3:22.5` · 5s
A second person's phone camera framing the QR, then their browser loading the class page. One
continuous take. **Don't fake it** — the QR in the prototype is a real, scannable code.

**B7 — the device** · `3:46` · 6s
Macro, the iQOO rotating slowly on a dark surface. Cut between the camera module, the back, and
the status bar showing **airplane mode on with the hotspot icon lit**. Hold that last frame
longest — it is the whole thesis in one piece of UI.

### Screen captures

**SCREEN A** — `1:56.5` · 6s — Tutor → Scan the page, recorded from before you tap so the
detection boxes appear one at a time and the confirm sheet lands. 100% speed, no ramp.

**SCREEN B** — `2:25` · 5s — The `EduQoo Core` chip tapped, the trace sheet sliding up:
two-pass diagram, tool log with per-call timings, context budget, verifier verdict. Crop tight.

**SCREEN C** — `2:38.5` · 6s — The walkthrough playing with Tamil selected.
**Record the phone's real TTS audio into this clip.**

---

## 5 · Transitions

Four types, no fifth.

| Type | Where | How |
|---|---|---|
| **Morph** | Deck slides that both show the device | Built in — the phone is one persistent element on a 1100 ms `cubic-bezier(.16,1,.3,1)` transform. **Never cut across a morph.** |
| **Hard cut** | Deck → capture, deck → b-roll | On the beat. The texture change is the transition. |
| **Dissolve 0.5–0.8s** | Deck slides with no shared device | Only where the mood changes, paper ↔ ink. |
| **Fade through black** | Once, at `4:00.5` | The only one in the film. |

Zoom-ins are in the deck, not the edit: slide 13 pushes to 1.7× and slide 18 to 1.75×, both
inside a continuous morph. An editor zoom on top gives you double motion.

---

## 6 · Music and sound

One piece, no cuts. Slow arpeggiated pulse, no percussion until 0:37.

| TC | Level | Note |
|---|---|---|
| 0:00 | −∞ → −24 dB | Fade in over the cold open |
| 0:35.5 | −18 dB | The black hold. Music alone. |
| 0:37 | −14 dB | The wordmark — the only lift |
| 0:43 → 3:59 | −22 dB | Bed. Never competes with the VO. |
| 1:24 | −26 dB | Duck under B3 |
| 2:38.5 | −30 dB | **Duck hard** for the Tamil |
| 4:00.5 | −16 dB | Lift into the close |
| 4:16 | → −∞ | Fade out over the end card |

Six sound cues, no more: the low tone on the wordmark (`0:37`); the real airplane-mode toggle
click from B2 (`0:59.5`); three UI ticks as the detection boxes land in SCREEN A (`1:56.5`);
one low tick as the red boundary appears (`2:02.5`); the real scan confirm from B6 (`3:22.5`);
and nothing at `4:16` — silence is the last cue.

---

## 7 · Delivery

| Cut | Spec | Use |
|---|---|---|
| **Master** | 1920×1080, 30 fps, H.264, 20 Mbps, AAC 320 kbps | Submission — inside the 3–5 min window |
| **Captioned** | Same, deck captions on (**C**) | Social / YouTube |
| **60-second cut** | See §8 | Anywhere with a scroll |
| **Stills** | DECK 01, 08, 09, 13, 21, 23 | Slide deck, README, thumbnails |

If a hard three-minute cap appears, cut from Act IV — never Act II or III. Dropping DECK 17,
18, 19, B6 and DECK 22 lands you at **3:01** with the model story and the MVP path intact.

---

## 8 · The 60-second cut

| In | Dur | Picture | VO |
|---|---|---|---|
| 0:00 | 4 | B1 | *(silence)* |
| 0:04 | 5 | DECK 01 | "She wrote 3x = 25. The line above was 3x + 5 = 20." |
| 0:09 | 4 | DECK 02 | "Nobody in a class of sixty has time to notice." |
| 0:13 | 5 | DECK 05 → 06 (morph) | "This is EduQoo. It reads the page and finds the wrong step." |
| 0:18 | 6 | B2 — airplane mode | "Airplane mode is on. No server, no API key, not one request." |
| 0:24 | 5 | DECK 08 | "Gemma-2-2B, quantised, sitting on the phone." |
| 0:29 | 5 | DECK 09 | "Inference on the NPU. The phone isn't the screen — it's the compute." |
| 0:34 | 5 | SCREEN A | "It reads each step, and asks when it isn't sure." |
| 0:39 | 5 | B4 | "A red boundary on line two. A solver decided that, not the model." |
| 0:44 | 6 | SCREEN C *(Tamil in the clear)* | *(no VO)* |
| 0:50 | 4 | B5 | "And the teacher gets the class, over Office Kit." |
| 0:54 | 4 | DECK 23 | "One phone. One page. The exact line she got wrong." |
| 0:58 | 2 | End card | *(silence)* |

**Total: 1:00**

---

## 9 · Four things that decide whether this works

1. **B2 must be one unbroken take.** Airplane mode on, page scanned, answer back, no cut.
   Every other claim rests on that shot being uncut.
2. **B4 has to show both** — the red boundary on screen and the handwriting underneath it, in
   the same frame, in focus.
3. **Don't talk over the Tamil.**
4. **Let the morphs land.** They run 1100 ms and every editing instinct says cut 300 ms early.
