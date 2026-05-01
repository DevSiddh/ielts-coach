import test from "node:test";
import assert from "node:assert/strict";

import { prompts } from "../features/speaking/prompts.ts";

test("prompt bank includes surprise drills across medium and hard topics", () => {
  const surprisePrompts = prompts.filter((prompt) => prompt.sourceType === "surprise-drill");
  assert.ok(surprisePrompts.length >= 8);
  assert.ok(surprisePrompts.some((prompt) => prompt.difficulty === "medium"));
  assert.ok(surprisePrompts.some((prompt) => prompt.difficulty === "hard"));
});

test("prompt bank includes source-backed 2026 coverage", () => {
  const currentPrompts = prompts.filter((prompt) => prompt.sourceType === "verified-2026");
  assert.ok(currentPrompts.length >= 8);
  assert.ok(currentPrompts.some((prompt) => prompt.title.toLowerCase().includes("apps")));
  assert.ok(currentPrompts.some((prompt) => prompt.title.toLowerCase().includes("online learning")));
  assert.ok(currentPrompts.some((prompt) => prompt.part === 3));
});

test("all prompts include follow-ups and answer support", () => {
  for (const prompt of prompts) {
    assert.ok(prompt.followUps.length >= 3, prompt.id);
    assert.ok(prompt.answerFrame.length >= 3, prompt.id);
    assert.ok(prompt.whatGoodLooksLike.length >= 3, prompt.id);
    assert.ok(prompt.improvementTips.length >= 3, prompt.id);
  }
});
