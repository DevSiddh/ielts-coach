# IELTS Coach Vision

## Product Thesis

IELTS Coach exists to train real-time speaking ability, not memorization.

The product should help a learner:

- handle familiar and unfamiliar IELTS topics
- organize answers under pressure
- recover smoothly when they get stuck
- speak with stronger fluency, vocabulary, and development
- improve through repeated retry loops instead of scripted answers

The core outcome is not "I saw this question before."
The core outcome is "I can survive and perform well on any topic."

## Primary Product Surfaces

### `/speaking`

This is the scoring-first practice surface.

Its job is to let the user:

- choose a prompt
- record or transcribe an answer
- receive a strict, explicit speaking evaluation
- understand what weakened the answer
- retry immediately with a clear next focus

This page is action-first, not study-first.

### `/strategies`

This is the learning hub.

Its job is to teach transferable speaking systems that work beyond the starter prompt bank.

It should eventually train:

- universal answer frameworks
- language functions
- topic buckets
- rescue patterns
- band-upgrade rules
- unknown-topic survival

This page is study-first, not scoring-first.

### `/history`

This is the review surface.

Its job is to let the user:

- revisit past attempts
- compare band estimates
- inspect transcript and feedback
- observe progress over time

### `/writing` (V1)

This is the Academic Writing Task 2 practice surface.

Its job is to let the user:

- choose a Task 2 prompt
- plan a response
- write an essay
- receive a deterministic practice estimate
- understand the visible evidence behind the score
- retry with one clear target

This page is writing practice, not chat and not official IELTS scoring.

### `/conversation` (target state)

This is the separate live speaking-agent mode.

Its job is to simulate a natural examiner-style interaction:

- ask one question
- listen
- give short critique
- force a retry
- ask a follow-up

This is a conversation trainer, not the band-scoring authority.

## Non-Negotiable Architecture Rules

- The scoring engine is separate from the conversation agent.
- The prompt bank is for drills, not the foundation of the coaching system.
- The strategy system must generalize beyond the starter prompt set.
- Transcript-based LLM coaching must not be treated as pronunciation truth.
- The speaking flow must remain useful even when model-backed features are unavailable.

## Target Strategy Model

The long-term strategy system should be built around transferable speaking skill, not a small set of sample questions.

It should include:

- universal frameworks
  - direct answer -> reason -> example -> close
  - opinion -> reason -> consequence -> balance
  - describe -> detail -> personal link -> meaning
  - problem -> cause -> solution -> impact
- language functions
  - giving opinions
  - comparing ideas
  - speculating
  - explaining causes and effects
  - talking about change over time
  - giving examples
  - admitting uncertainty while continuing
- topic buckets
  - people
  - places
  - events
  - objects
  - habits
  - education
  - technology
  - media
  - environment
  - cities
  - work
  - health
  - government / society / public life
- rescue patterns
  - how to recover after going blank
  - how to extend a weak answer
  - how to buy thinking time without sounding broken
- band-upgrade rules
  - what moves an answer from basic to developed
  - what improves coherence, detail, and lexical range
- unknown-topic / surprise-topic training
  - how to handle topics the learner has never practiced before

## Target Scoring Model

The scoring system should remain explicit, inspectable, and grounded in identifiable signals.

It should continue to prioritize:

- filler detection
- pacing
- structure
- answer development
- lexical variation
- major grammar issues
- relevance to the prompt

The scoring engine should not become a vague rewrite machine.

The user should be able to understand why a band estimate was produced.

### Raw Speech Capture Direction

The product should preserve what the learner actually said before any cleanup or rewriting.

Target direction:

- keep a raw transcript separate from any cleaned transcript
- prefer STT outputs that preserve filler words, broken starts, and disfluencies
- capture word-level timestamps and segment-level timestamps where available
- score from raw spoken evidence, not only from polished or normalized text
- keep cleaned text as a readability layer, not as the scoring authority

### Preferred Near-Term Transcript Engine

The preferred near-term raw transcript engine is Deepgram pre-recorded transcription.

Reasoning:

- it supports direct WebM / Opus ingestion without forcing the main transcript path through local format conversion
- it supports explicit filler-word transcription
- it returns utterance segmentation, word timestamps, and word confidence
- it is a better fit for evidence-first transcript capture than a cleanup-oriented Whisper-only pipeline

Target request characteristics:

- filler-word support enabled
- utterance segmentation enabled
- word-level timing retained
- raw transcript stored before any readability cleanup

Whisper-family systems may remain available as fallback or comparison tools, but they are not the preferred primary raw transcript authority for this phase.

The evaluator should eventually detect and score:

- filler words such as `uh`, `um`, `ah`, `er`, `hmm`
- repeated words and repeated stems
- false starts and restart behavior
- stretched hesitation forms such as `andddd` or `soooo`
- long pauses and hesitation clusters
- underdeveloped answers and weak expansion

### Transcript Handling Rules

The app should maintain at least two text views of an answer:

- `raw transcript`
  - closest possible capture of what was actually spoken
  - used for scoring and evidence extraction
- `clean transcript`
  - optional readability-friendly version
  - used for display or coaching only when appropriate

The clean transcript must never replace the raw transcript as the source of scoring truth.

### Pronunciation Position

Pronunciation should eventually be improved using audio-level evidence.

Transcript-only rewriting is not enough to make pronunciation claims.

Target direction:

- use audio-derived signals where possible
- keep transcript-only coaching separate from pronunciation authority

### Pronunciation Research Position

Pronunciation should be treated as a separate research branch, not as something solved automatically by the transcript engine.

Near-term position:

- do not claim pronunciation accuracy from transcript text alone
- do not let phoneme experiments directly control the core band score at first
- keep pronunciation analysis behind a clear experimental boundary until it is benchmarked on real user recordings

Potential future branch:

- phoneme recognition tools such as Allosaurus can be evaluated as a supporting evidence layer
- that branch may require WAV conversion for phoneme analysis only
- any pronunciation scoring added later must be validated against actual observed speech errors rather than assumed from phoneme output alone

### Evidence-First Feedback

The scoring layer should surface concrete evidence whenever possible.

Examples of the intended feedback style:

- `Detected "um" 4 times`
- `Repeated "good" 3 times`
- `Two false starts in the first 20 seconds`
- `Only one developed idea was given`

The app should feel strict and evidence-based, not like a generic rewrite assistant.

## Data And Storage Direction

The system needs persistence for attempts, transcripts, extracted speaking signals, and optional audio review.

### Current implementation preference

The near-term default should be local-first storage.

Reasoning:

- there is a single user
- deletion and reset should be easy
- debugging raw transcript quality is easier with local files
- the raw transcript pipeline is a higher priority than multi-user infrastructure

### Local-first storage model

The preferred default for current development is:

- local attempt folders
- local raw audio files
- local raw transcript JSON
- local clean transcript JSON
- local extracted signals JSON
- local evaluation JSON

Recommended layout:

```text
data/
  attempts/
    <attempt-id>/
      audio.webm
      raw-transcript.json
      clean-transcript.json
      signals.json
      evaluation.json
```

### Local deletion requirement

Because the app is currently single-user, the product should support:

- delete one attempt easily
- wipe all attempts easily
- remove raw audio and transcript artifacts together

Delete behavior should be treated as a first-class product convenience, not as an afterthought.

### MongoDB position

MongoDB remains a valid future option for:

- attempt history
- prompt references
- raw transcript
- clean transcript
- word / segment metadata
- extracted speaking signals
- scoring results

However, MongoDB is not the current default.

Reasoning:

- local development is faster
- transcript debugging is simpler
- raw audio can be managed without storage-tier complexity
- a small free MongoDB tier is not a strong default home for many raw recordings

If MongoDB is introduced later, it should store metadata-first attempt documents, not become the reason the raw transcript pipeline gets delayed.

### Audio storage position

Raw audio should remain file-based by default in the near term.

If cloud persistence is added later:

- store metadata and transcript evidence separately from large audio payloads
- prefer file/object storage for audio
- avoid embedding large audio blobs in small database tiers as the primary design

### MVP interpretation

For MVP and early development:

- keep attempts local
- prioritize exact raw transcript capture
- use Deepgram as the preferred primary raw transcript engine
- prioritize disfluency evidence extraction
- make deletion/reset simple
- defer database complexity until the core evaluator and raw transcript pipeline are strong

## Conversation Agent Role

The conversation agent is part of the target product, but it is not part of the scoring authority.

Its role is:

- ask one question at a time
- wait for a complete answer
- give short, voice-friendly critique
- produce a stronger upgraded answer
- explain the upgrade simply
- force a retry
- continue with a follow-up

It should use compact JSON-compatible outputs for UI integration.

It belongs in a separate mode (`/conversation`), not as the defining engine of `/speaking`.

## Current-State Gaps

The current repo is useful, but transitional.

Known gaps between current implementation and target vision:

- the starter prompt bank is too small to represent true unknown-topic readiness
- the strategy content is still not fully rebuilt into a universal/topic-based system
- a live coach overlay exists in the app, but the target state is to isolate the conversation agent into its own mode
- pronunciation is not yet supported by strong audio-evidence-driven analysis

These gaps should be treated as normal evolution points, not product direction changes.

## Roadmap Ordering

The intended implementation order is:

1. stabilize the scoring-first speaking flow
2. move / shape the conversation agent into a separate mode
3. rebuild strategy content around transferable speaking skill
4. expand the prompt bank and add unknown-topic / surprise-topic practice
5. improve pronunciation using audio-level evidence

## Implementation Progress

Last updated: 2026-04-29

- [x] Stabilize `/speaking` as a scoring-first flow with prompt choice, recording/transcription, explicit evaluation, retry focus, and saved attempts.
- [x] Add local-first attempt folders with raw audio, raw transcript, clean transcript, extracted signals, audio signals, merged transcript evidence, and evaluation JSON.
- [x] Rebuild `/strategies` into a guided learning-first hub with transferable frameworks, examples, and practice guidance.
- [x] Add deterministic `/conversation` mode with no band scoring, retry-first training, rule-based critique, reusable prompt/follow-up bank, browser text-to-speech, retry voice recording, transcript-only sessions, and rolling context summaries.
- [x] Expand the prompt bank and add unknown-topic / surprise-topic practice.
- [ ] Improve pronunciation scoring with stronger audio-derived clarity and confidence evidence.
- [ ] Add richer `/history` progress analytics over time.
- [x] Add `/writing` V1 for Academic Task 2 with deterministic practice estimates.
- [x] Add coaching-style time management for Writing Task 2 and part-aware Speaking timing evidence.

## Working Interpretation

If a future implementation choice conflicts with this document:

- prefer the target architecture in this file
- treat the current repo as potentially transitional
- only override this vision when the user explicitly changes the product direction

