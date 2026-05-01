import test from "node:test";
import assert from "node:assert/strict";
import { evaluateWriting } from "../features/writing/evaluate.ts";
import { writingPrompts } from "../features/writing/prompts.ts";
import { addWritingAttemptToList, createWritingAttempt } from "../features/writing/storage.ts";

test("saved writing attempts preserve prompt, plan, essay, evaluation, and timestamp", () => {
  const prompt = writingPrompts[0];
  const essay = "In my opinion, online learning is useful because it gives students flexibility.";
  const evaluation = evaluateWriting({ prompt, essay });
  const attempt = createWritingAttempt({
    prompt,
    plan: "Agree / flexibility / classroom support / balanced conclusion",
    essay,
    evaluation,
    timeSpentSeconds: 1200,
    now: new Date("2026-04-29T10:00:00.000Z")
  });

  assert.equal(attempt.prompt.id, prompt.id);
  assert.equal(attempt.plan, "Agree / flexibility / classroom support / balanced conclusion");
  assert.equal(attempt.essay, essay);
  assert.equal(attempt.evaluation.label, "Practice estimate");
  assert.equal(attempt.timeSpentSeconds, 1200);
  assert.equal(attempt.createdAt, "2026-04-29T10:00:00.000Z");
});

test("new writing attempts do not overwrite previous attempts", () => {
  const prompt = writingPrompts[0];
  const firstEvaluation = evaluateWriting({ prompt, essay: "I agree with online learning." });
  const secondEvaluation = evaluateWriting({ prompt, essay: "In my opinion, classroom learning is still valuable." });
  const first = createWritingAttempt({
    prompt,
    plan: "first",
    essay: "I agree with online learning.",
    evaluation: firstEvaluation,
    now: new Date("2026-04-29T10:00:00.000Z")
  });
  const second = createWritingAttempt({
    prompt,
    plan: "second",
    essay: "In my opinion, classroom learning is still valuable.",
    evaluation: secondEvaluation,
    now: new Date("2026-04-29T10:05:00.000Z")
  });

  const attempts = addWritingAttemptToList(addWritingAttemptToList([], first), second);

  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].plan, "second");
  assert.equal(attempts[1].plan, "first");
});
