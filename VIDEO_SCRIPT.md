# EduQoo — Launch Film

**Director's script, shot list and VO.**
Runtime **3:41**. 1920×1080, 30 fps. Apple-keynote grammar: long holds, one idea per
cut, morphs instead of wipes, and silence used deliberately.

Companion assets in this repo:

| Asset | What it is |
|---|---|
| [`deck/index.html`](deck/index.html) | The animated keynote. 20 slides, self-running, morph transitions. **This is the picture spine of the film.** |
| [`index.html`](index.html) | The live prototype. Source of every screen-capture insert. |
| This file | Timecoded edit, VO, b-roll shot list, voice and music direction. |

---

## 0 · Before you record anything

### 0.1 The keynote

```bash
python -m http.server 5599
```

Open `http://localhost:5599/deck/` and press **F** for fullscreen, then **H** to hide the
control bar, then **C** to hide the burn-in captions *(leave them on only if you are
delivering a captions-baked cut)*. **R** restarts. **Space** pauses. **←/→** step.

The deck is a fixed 1920×1080 stage scaled to the window — so record at exactly 1080p
and the type is pixel-perfect. On a HiDPI display, record at 2× and downscale in the
edit for a noticeably crisper result.

**Capture:** OBS → Display Capture → 1920×1080 → 60 fps → CRF 16 → MP4.
Record the deck **twice**: once letting it autoplay end-to-end (gives you clean timing),
once stepping manually (gives you a clean still of every slide for pickups).

### 0.2 The prototype screen captures

Same server, `http://localhost:5599/`. Record the phone region only — crop to the
device, 1:2.13. Use a browser window around 1440 wide so the three-column stage renders
and you can pull the doodle rails as extra b-roll.

### 0.3 The device b-roll

Six real-world shots, listed in §4. Shoot them **before** you edit — they are the shots
that make this read as a product film rather than a slide deck with a voice over it.

---

## 1 · Voice direction

One narrator. No second voice, no interviews, no testimonial.

| Parameter | Setting |
|---|---|
| **Register** | Mid-low, unhurried, warm but not soft. The voice of someone explaining something they have thought about for a long time. |
| **Pace** | ~135 words per minute. Slower than an explainer video. Let the picture carry the beat. |
| **Accent** | Neutral Indian English, or neutral international English. **Not** American ad-read. |
| **Energy** | Flat at the top (Act I is a problem statement, not a pitch). Lifts once at 0:42. Drops again for the close. |
| **Never** | Upward inflection at the end of sentences. Smiling delivery. The word "revolutionary". |

### ElevenLabs settings

Model **`eleven_multilingual_v2`** — you will also need it for the Tamil and Hindi
pickup lines in §3.

| Setting | Value | Why |
|---|---|---|
| Stability | **0.45** | Low enough to keep intonation alive across long sentences; high enough not to drift. |
| Similarity | **0.80** | |
| Style exaggeration | **0.10** | Anything higher starts performing. |
| Speaker boost | **on** | |
| Speed | **0.95** | The one setting that most changes whether this feels like a keynote or an advert. |

**Render each beat as its own file**, named `vo_01.wav` … `vo_26.wav` per the timecode
table. Do not render the whole script as one take — you will want to nudge individual
beats by 200–400 ms against the picture, and you cannot do that inside one file.

**Punctuation is direction.** Em dashes give you a breath. A full stop on a three-word
sentence gives you a hold. The script below is punctuated for the read, not for the page —
don't tidy it.

---

## 2 · The edit — beat by beat

`DECK n` = keynote slide n · `SCREEN` = prototype capture · `B-ROLL n` = §4 shot

| # | In | Dur | Picture | Transition in | VO |
|---|---|---|---|---|---|
| 01 | 0:00.0 | 6.0 | **B-ROLL 1** — cold open | fade from black, 1.5s | *(silence — room tone only)* |
| 02 | 0:06.0 | 8.0 | **DECK 01** | dissolve 0.8s | vo_01 |
| 03 | 0:14.0 | 7.0 | **DECK 02** | cut | vo_02 |
| 04 | 0:21.0 | 8.0 | **DECK 03** | dissolve 0.6s | vo_03 |
| 05 | 0:29.0 | 4.0 | **B-ROLL 2** — the classroom | cut | vo_04 |
| 06 | 0:33.0 | 7.5 | **DECK 04** | dissolve 0.6s | vo_05 |
| 07 | 0:40.5 | 1.5 | **BLACK** | fade 0.5s | *(silence — hold it)* |
| 08 | 0:42.0 | 6.5 | **DECK 05** — wordmark | fade up 1.0s | vo_06 |
| 09 | 0:48.5 | 8.0 | **DECK 06** — device enters | *morph* (let the deck do it) | vo_07 |
| 10 | 0:56.5 | 9.5 | **DECK 07** — StepTutor | *morph* | vo_08 |
| 11 | 1:06.0 | 5.0 | **SCREEN A** — the live check | cut, hard | vo_09 |
| 12 | 1:11.0 | 8.5 | **DECK 08** — CAS zoom | *morph, 1.1s* | vo_10 |
| 13 | 1:19.5 | 4.0 | **B-ROLL 3** — phone in hand | cut | *(let vo_10 run under)* |
| 14 | 1:23.5 | 8.5 | **DECK 09** — Tamil | *morph* | vo_11 |
| 15 | 1:32.0 | 6.0 | **SCREEN B** — walkthrough + real TTS audio | cut | *(no VO — play the Tamil audio)* |
| 16 | 1:38.0 | 9.0 | **DECK 10** — StudyDesk | *morph* | vo_12 |
| 17 | 1:47.0 | 5.0 | **SCREEN C** — tap the citation | cut | vo_13 |
| 18 | 1:52.0 | 7.5 | **DECK 11** — the refusal | *morph, zoom in* | vo_14 |
| 19 | 1:59.5 | 8.5 | **DECK 12** — ClassTest | *morph* | vo_15 |
| 20 | 2:08.0 | 5.0 | **B-ROLL 4** — thirty devices light up | cut | vo_16 |
| 21 | 2:13.0 | 7.5 | **DECK 13** — the verifier | dissolve 0.5s | vo_17 |
| 22 | 2:20.5 | 9.0 | **DECK 14** — ClassDrop | *morph* | vo_18 |
| 23 | 2:29.5 | 6.0 | **B-ROLL 5** — a stranger scans the QR | cut | vo_19 |
| 24 | 2:35.5 | 10.5 | **DECK 15** — SlateCore | dissolve 0.8s | vo_20 |
| 25 | 2:46.0 | 10.0 | **DECK 16** — two-pass | cut | vo_21 |
| 26 | 2:56.0 | 10.0 | **DECK 17** — it has to be the phone | dissolve 0.6s | vo_22 |
| 27 | 3:06.0 | 7.0 | **B-ROLL 6** — iQOO macro | cut | vo_23 |
| 28 | 3:13.0 | 8.0 | **DECK 18** — the hackathon fit | dissolve 0.6s | vo_24 |
| 29 | 3:21.0 | 9.5 | **DECK 19** — the close | fade through black 0.7s | vo_25 |
| 30 | 3:30.5 | 7.0 | **DECK 20** — the URL | dissolve 0.5s | vo_26 |
| 31 | 3:37.5 | 4.0 | **END CARD** | fade to black 1.5s | *(silence)* |

**Total: 3:41.5**

---

## 3 · The voice-over, verbatim

Feed these straight to ElevenLabs, one render per numbered line.
*(These match the deck's burn-in captions exactly, so the two never drift.)*

---

**vo_01** — `0:06`
> It is 6:40 in the evening, in a village two hours outside Chennai. There is one bar of signal, and a data pack that ran out on the twentieth.

**vo_02** — `0:14`
> The app does not fail. It spins. Bad connectivity does not produce an error message — it produces a child watching a loader.

**vo_03** — `0:21`
> So here is the premise. "No internet" is a niche. Bad internet is the country. We treat connectivity as a dial, not a switch, and we build to be best at the bottom of it.

**vo_04** — `0:29`
> This is the room we are actually building for. Thirty students. One teacher. And nothing in it that can be assumed to be online.

**vo_05** — `0:33`
> And here is the economics. A government school can buy one forty-thousand-rupee phone. It cannot buy thirty. So the room needs exactly one smart thing in it.

*(hold — 1.5 seconds of black)*

**vo_06** — `0:42`
> This is EduQoo.

**vo_07** — `0:48.5`
> One phone. A whole classroom. Zero internet required. A tutor, a grounded notebook, a live quiz system and a classroom server — all running on the AI already inside one iQOO phone.

**vo_08** — `0:56.5`
> StepTutor does not grade. It finds the break. It does not know methods — it checks whether each line is still equivalent to the line above it. The first place that stops being true is the error.

**vo_09** — `1:06`
> Watch it work. Line two holds. Line three does not.

**vo_10** — `1:11`
> And notice what decided that. A computer algebra system — Symja — running on the phone. The language model never adjudicates the mathematics. It only phrases the explanation. We will not hallucinate at a child learning calculus.

**vo_11** — `1:23.5`
> Then it shows you. Every frame of that walkthrough is rendered from the solve trace, so it cannot show a wrong step — and it speaks, in Tamil or Hindi, from a voice pack that lives on the phone.

*(1:32 — no narration. Let the Tamil audio play in the clear for six seconds. This is the single most persuasive six seconds in the film; do not talk over it.)*

**vo_12** — `1:38`
> The second pillar is StudyDesk. Import a chapter and it is chunked, embedded and indexed entirely on the phone. Every answer cites the line it came from.

**vo_13** — `1:47`
> Tap the citation, and there is the sentence it came from. Page two eighty-eight.

**vo_14** — `1:52`
> And when you ask it something that is not in your material, it says so. It does not invent. Refusing is the feature — it is the only version of a small model you can hand to a child.

**vo_15** — `1:59.5`
> The third pillar is ClassTest. One question lands on thirty browsers at once, grading happens locally in each one, and the teacher walks out knowing exactly what to reteach.

**vo_16** — `2:08`
> No round trip. No server. No signal.

**vo_17** — `2:13`
> Seven questions were generated. Five survived. One failed its grounding check; one had an answer key the CAS disagreed with. A wrong answer key is worse than no quiz.

**vo_18** — `2:20.5`
> The fourth pillar is ClassDrop. The phone raises an access point with nothing behind it and serves the client itself. Students scan a QR and land in the class, in a browser. No install. No account. No data plan.

**vo_19** — `2:29.5`
> Any phone in the room. Any laptop. Anything with a browser.

**vo_20** — `2:35.5`
> Underneath all four is the part that actually matters. SlateCore — a local agent runtime. A typed tool registry, a context budgeter, a two-pass executor and a verifier layer, running a two-billion-parameter model on the phone's own silicon.

**vo_21** — `2:46`
> Here is a failure mode almost nobody accounts for. Turn on schema constraints and tool calling in the same pass, and open-weight models quietly stop calling tools — the grammar mask makes the tool tokens unreachable. The output still validates. It just silently stopped working. So we decouple them: pass one runs the tools, pass two formats the answer.

**vo_22** — `2:56`
> And this is why it has to be a phone, natively. The accelerator delegates, the constrained decoder, the hotspot radio, the foreground service, the camera, the offline voice packs — all of it lives at the native layer.

**vo_23** — `3:06`
> The device utilisation is real, because the architecture requires it.

**vo_24** — `3:13`
> Four surfaces, one runtime, thirty hours. Local-first and cloud-optional, so the sponsor credits get used honestly. And one route turns the whole thing into a portable offline AI server that ships with an education client.

**vo_25** — `3:21`
> One phone. Thirty students. No installs, no data, no internet. And when the network comes back, it only gets better. It was never required.

**vo_26** — `3:30.5`
> EduQoo.

---

### Regional pickup lines

Render these separately in `eleven_multilingual_v2` if you want a polished alternative to
the phone's own Android TTS in the 1:32 window. **Recommendation: use the phone's real
TTS audio, recorded off the device.** It is less pretty and far more convincing.

| Lang | Line |
|---|---|
| **ta** | இப்போது தொகையீட்டு மாறிலி C ஐச் சேர்க்கவும். வரி மூன்றில் நீங்கள் விட்டது இதுதான். |
| **hi** | अब समाकलन अचर C जोड़िए। यही वह चरण है जो आपने पंक्ति तीन में छोड़ दिया। |

---

## 4 · B-roll shot list

Six shots. Shoot them all in one session. Natural light, no ring light, no studio white
— this film is warm and slightly documentary, and the doodle theme means the frames
should feel like a notebook, not a showroom.

---

**B-ROLL 1 — cold open** · `0:00` · 6s · *no VO*
Dusk. Interior, low light. A phone lying face-up on a desk beside a school notebook with
handwritten integrals visible. The screen is off. Slow push in, 6 seconds, ending just as
the screen lights.
*Grade: cool, underexposed by a stop. This is the only cold frame in the film.*

**B-ROLL 2 — the room** · `0:29` · 4s
A classroom or a table with several mismatched devices — an old Android, a cracked
iPhone, a laptop, a tablet. Shot from above, static. Nothing is switched on yet.
*This shot has to communicate "these are the devices that already exist."*

**B-ROLL 3 — in the hand** · `1:19.5` · 4s
Close, over-the-shoulder. The iQOO held in one hand, the other hand tapping "Check my
working". Shallow depth of field; the red line-3 flag is the only thing in focus.

**B-ROLL 4 — thirty devices** · `2:08` · 5s
The single most important b-roll shot in the film. Six to ten devices in a row on a
table, all showing the quiz question, all lighting up within a second of each other.
Shoot it wide, static, and cut on the moment they change.
*Practical: put the teacher phone out of frame, push the quiz, and roll before you push.*

**B-ROLL 5 — the scan** · `2:29.5` · 6s
A second person's phone camera framing the QR on the iQOO's screen, then their browser
loading the class page. One continuous take. **Do not fake this** — the QR in the
prototype is a real, scannable code, and the shot is worthless if it doesn't work.

**B-ROLL 6 — the device** · `3:06` · 7s
Macro. The iQOO on a dark surface, rotating slowly. Catch the light on the frame. Cut
between: the camera module, the back of the device warm from sustained inference, the
status bar with **airplane mode on** and the hotspot icon lit.
*That last frame — airplane mode plus an active hotspot — is the whole thesis in one
piece of UI. Hold it longest.*

---

### Screen-capture inserts

**SCREEN A** — `1:06` · 5s — The tutor check running live. Start recording *before*
pressing "Check my working" so the viewer sees the check animate line by line. Crop to
the phone. Speed: 100%, do not ramp.

**SCREEN B** — `1:32` · 6s — The narrated walkthrough playing, with the language row
visible and Tamil selected. **Record the phone's real TTS audio into this clip.**

**SCREEN C** — `1:47` · 5s — A finger tapping the citation chip, the source panel
sliding open. Crop tighter than A and B — this is a detail shot.

---

## 5 · Transitions

The film has exactly four transition types. Using a fifth will make it look like a
template.

| Type | Where | How |
|---|---|---|
| **Morph** | Between deck slides that both show the device | Already built into the deck — the phone is one persistent element with a 1100 ms `cubic-bezier(.16,1,.3,1)` transform. **Do not cut across a morph.** Let it land. |
| **Hard cut** | Deck → screen capture, deck → b-roll | On the beat, no dissolve. The change in texture is the transition. |
| **Dissolve 0.5–0.8s** | Between deck slides with no shared device | Only where the mood changes (paper → ink). |
| **Fade through black** | Once, at `3:21` | The only one in the film. It buys the close its weight. |

**Zoom-ins** are built into the deck, not added in the edit: slide 08 pushes the device
to 1.9× and slide 11 to 1.75×, both as part of the same continuous morph. If you add an
editor zoom on top of these you will get double motion — don't.

---

## 6 · Music and sound

**Track:** one piece, no cuts, no drops. Something with a slow arpeggiated pulse and no
percussion until roughly 0:42 — the wordmark. Look for "minimal piano, ostinato,
documentary" rather than "corporate technology inspiring".

| TC | Level | Note |
|---|---|---|
| 0:00 | −∞ → −24 dB | Fade in over the cold open, room tone underneath |
| 0:06 | −24 dB | Under VO for the whole of Act I. Sparse. |
| 0:40.5 | −18 dB | The black hold. Music alone for 1.5 seconds. |
| 0:42 | −14 dB | The wordmark. This is the only lift in the film. |
| 0:48.5 → 3:20 | −22 dB | Bed. Never competes with the VO. |
| 1:32 | −30 dB | **Duck hard** for the Tamil audio. |
| 3:21 | −16 dB | Lift into the close |
| 3:37.5 | → −∞ | Fade out over the end card, 4 seconds |

**Sound design — use sparingly, five cues only:**

1. `0:42` — a single soft low tone on the wordmark reveal.
2. `1:06` — three short UI ticks as each line resolves in SCREEN A. The third one is
   lower in pitch — the error.
3. `2:08` — one soft "whoosh" as the thirty devices light up. One. Not per device.
4. `2:29.5` — the real camera-focus/scan confirm from B-ROLL 5, kept in.
5. `3:37.5` — nothing. Silence is the last cue.

---

## 7 · Titles and captions

- **No lower thirds.** The deck already carries every title.
- **Burn in captions?** Deliver two cuts. The judge-facing cut runs without them (press
  **C** in the deck); the social cut runs with them on — press **C** to toggle, they are
  already timed to the VO word-for-word.
- **End card** (`3:37.5`): wordmark, `harsh4-dev.github.io/iqoo`, and one line —
  *iQOO Hackathon · Track 02 · Smart Education*. Nothing else. No music sting.

---

## 8 · Delivery

| Cut | Spec | Use |
|---|---|---|
| **Master** | 1920×1080, 30 fps, H.264, 20 Mbps, AAC 320 kbps | Submission |
| **Captioned** | Same, deck captions on | Social / YouTube |
| **60-second cut** | See §9 | Anywhere with a scroll |
| **Stills** | One frame each from DECK 05, 07, 14, 17, 19 | Slide deck, README, thumbnails |

---

## 9 · The 60-second cut

Same assets, ruthless. Judges see the long film; everybody else sees this.

| In | Dur | Picture | VO |
|---|---|---|---|
| 0:00 | 4 | B-ROLL 1 | *(silence)* |
| 0:04 | 6 | DECK 03 | "No internet is a niche. Bad internet is the country." |
| 0:10 | 5 | DECK 05 → 06 (morph) | "This is EduQoo. One phone. A whole classroom. Zero internet required." |
| 0:15 | 7 | SCREEN A | "It checks each line of your working against the one above it, and tells you which one broke." |
| 0:22 | 6 | DECK 08 | "A computer algebra system decides that. Not the model." |
| 0:28 | 5 | SCREEN B *(Tamil audio in the clear)* | *(no VO)* |
| 0:33 | 6 | B-ROLL 4 | "One question, thirty browsers, no round trip." |
| 0:39 | 6 | B-ROLL 5 | "They join by scanning a QR. No install. No account. No data plan." |
| 0:45 | 6 | DECK 17 | "All of it on the phone's own silicon." |
| 0:51 | 7 | DECK 19 | "One phone. Thirty students. No internet — it was never required." |
| 0:58 | 2 | End card | *(silence)* |

**Total: 1:00**

---

## 10 · The three things that decide whether this works

1. **Do not talk over the Tamil.** Six seconds of a phone explaining calculus in a
   regional language, in the clear, with airplane mode visible in the status bar, is
   worth more than any sentence in this script.
2. **B-ROLL 5 must be real.** A faked QR scan is the one thing a technical judge will
   spot instantly, and it would undermine everything else.
3. **Let the morphs land.** The deck's device transitions run 1100 ms. Every instinct in
   an edit is to cut 300 ms early. Resist it — the hold is what makes it feel like a
   product film instead of a project submission.
