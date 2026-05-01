import test from "node:test";
import assert from "node:assert/strict";
import { writingStrategySections } from "../features/writing/strategy-system.ts";

test("writing strategy hub covers the 2026 Task 2 public criteria", () => {
  const criteria = new Set(writingStrategySections.map((section) => section.criterion));

  assert.deepEqual(criteria, new Set([
    "Task Response",
    "Coherence and Cohesion",
    "Lexical Resource",
    "Grammatical Range and Accuracy"
  ]));
});

test("writing strategies are learning-first and practice-ready", () => {
  assert.equal(writingStrategySections.length, 4);

  for (const section of writingStrategySections) {
    assert.ok(section.howItHelps.toLowerCase().includes("ielts") || section.howItHelps.toLowerCase().includes("writing"));
    assert.ok(section.practicePrompt.length > 20);
    assert.ok(section.items.length >= 3);

    for (const item of section.items) {
      assert.ok(item.moves.length >= 3);
      assert.ok(item.example.length > 20);
    }
  }
});
