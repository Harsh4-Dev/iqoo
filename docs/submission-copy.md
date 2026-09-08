# EduQoo — submission copy

Ready-to-paste text for the registration and submission forms. Pick the length the
field allows. Nothing here claims anything the prototype does not show.

---

## Tagline (one line)

> It reads the page, finds the step you got wrong, and says why — in Tamil. On one phone, offline.

**Alternates**

> The tutor that tells you *which line* you got wrong, not just that you did.

> Line-level maths correction, spoken in the child's own language, entirely on-device.

---

## Description — under 100 words *(primary)*

> A student writes `3x + 5 = 20`, then `3x = 25` — she added the five instead of
> subtracting. She'll get it marked wrong and never learn which line broke.
>
> EduQoo photographs her working, reads the handwriting on-device, and draws a red
> boundary on the exact step that stopped being true — then explains the fix aloud,
> in Tamil or Hindi.
>
> All on one iQOO phone: Gemma-2-2B on the Snapdragon NPU, ML Kit, Android TTS.
> Zero network requests.
>
> A symbolic solver decides what's wrong, never the model. A wrong correction on a
> child's homework is a harm.

---

## Description — 50 words *(for tighter fields)*

> A student writes `3x + 5 = 20`, then `3x = 25`. Marked wrong, she never learns which
> line broke.
>
> EduQoo photographs the page, finds the exact step that stopped being true, and explains
> it aloud in Tamil — on one phone, zero network requests. A solver decides, never
> the model.

---

## Description — 25 words *(cards, listings)*

> Photograph a student's working. EduQoo finds the exact line they got wrong and explains
> it aloud in their own language — entirely on-device, with no internet.

---

## Problem statement *(if the form asks separately)*

> In classrooms of sixty, no child gets one-to-one feedback. A student with a learning gap
> copies the answer off the board and never finds out which of their own six lines broke.
> The gap compounds silently for years. And these are the classrooms with one bar of signal,
> so anything that needs a round trip is a tutor that spins.

---

## Technical approach *(if the form asks separately)*

> Native Android. CameraX captures the page; ML Kit Digital Ink and Text Recognition read
> each step with a per-line confidence, and anything under 90% halts and asks the student to
> confirm before it judges. A symbolic parser and equivalence checker find the first line
> that stops being algebraically true — deterministic, and the language model is never
> consulted. A quantised Gemma-2-2B, running through MediaPipe LLM Inference on the
> Snapdragon NPU, then writes one sentence per step, which Android TTS speaks from an
> offline regional voice pack. Nothing leaves the device.

---

## Links

| Field | Value |
|---|---|
| Prototype | https://harsh4-dev.github.io/iqoo/ |
| Repository | https://github.com/Harsh4-Dev/iqoo |
| Deck | https://harsh4-dev.github.io/iqoo/deck/ |
| Track | 02 — Smart Education |
| City | Chennai · 12–13 September 2026 |
