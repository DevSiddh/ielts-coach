# Audit Steps

Status:
- Done: Recorder transcript accumulation bug
- Done: UI text encoding cleanup

Remaining steps:
1. Fix the `medium` difficulty label in the speaking UI.
2. Re-run build/runtime verification and isolate the `next build` `spawn EPERM` failure.
3. Add a minimal automated test setup for core scoring logic.
4. Add tests for `evaluateSpeaking` covering short answers, filler-heavy answers, and stronger answers.
5. Run the new tests and report results.
6. Do a final audit pass for any leftover UX or reliability issues.

Working mode:
- We will do one step at a time.
- You can reply `next` to move to the next step.
