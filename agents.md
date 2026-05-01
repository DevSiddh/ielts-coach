# Agent Guardrails

This file defines how future agents should work in this repository.

## Instruction Precedence

- `vision.md` is the product source of truth.
- If the current code conflicts with `vision.md`, treat the code as potentially transitional unless the user explicitly says otherwise.
- Do not infer long-term product direction only from the latest implementation detail.

## Do-Not-Drift Rules

- Do not merge scoring and conversation-agent responsibilities.
- Do not make strategies prompt-bound if the vision says they must be transferable.
- Do not introduce "AI coaching" that weakens explicit scoring signals.
- Do not treat transcript rewriting as pronunciation analysis.
- Do not let a small starter prompt bank become the hidden definition of the strategy system.

## Implementation Defaults

Unless the user explicitly redirects the architecture:

- keep `/speaking` scoring-first
- keep `/strategies` learning-first
- keep `/conversation` separate when implemented
- preserve deterministic / fallback behavior when model-backed features are unavailable
- prefer explicit, inspectable evaluation logic over vague LLM-only judgments

## Planning Expectations For Future Work

Before implementing a feature, map it to one of the product surfaces:

- `/speaking`
- `/strategies`
- `/history`
- `/conversation`

When planning or implementing:

- explicitly note whether the change affects scoring, strategies, history, or conversation mode
- call out any architectural boundary being crossed
- document temporary compromises if implementation must diverge from `vision.md`
- prefer reversible and well-labeled transitional steps over silent product drift

## Repo-Specific Context Snapshot

The current repo already includes:

- a speaking practice flow
- strategy pages / strategy taxonomy
- attempt history
- prompt taxonomy
- heuristic scoring
- transcription support
- a temporary coach overlay

This snapshot is informational only.

It must not override the target architecture in `vision.md`.

## Practical Agent Behavior

Future agents working here should:

- read `vision.md` before making product-structure changes
- preserve the scoring engine as a separate concern
- preserve strategy-system generalization as a design goal
- avoid presenting temporary implementation shortcuts as final product truth
- surface architectural mismatches clearly when found

