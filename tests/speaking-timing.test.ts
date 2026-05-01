import test from "node:test";
import assert from "node:assert/strict";
import { buildSpeakingTimingInsight } from "../features/speaking/timing.ts";

test("speaking timing helper returns part-specific target labels", () => {
  assert.equal(buildSpeakingTimingInsight({ prompt: { part: 1 }, durationSeconds: 30, wordCount: 60 }).label, "Part 1 timing");
  assert.equal(buildSpeakingTimingInsight({ prompt: { part: 2 }, durationSeconds: 90, wordCount: 150 }).label, "Part 2 long turn");
  assert.equal(buildSpeakingTimingInsight({ prompt: { part: 3 }, durationSeconds: 55, wordCount: 110 }).label, "Part 3 timing");
});

test("part 2 short duration is flagged as underdeveloped timing", () => {
  const insight = buildSpeakingTimingInsight({ prompt: { part: 2 }, durationSeconds: 35, wordCount: 70 });

  assert.equal(insight.status, "short");
  assert.ok(insight.target.includes("1-2 minute"));
});

test("very slow or fast speaking pace is visible as pacing evidence", () => {
  const slow = buildSpeakingTimingInsight({ prompt: { part: 3 }, durationSeconds: 80, wordCount: 60 });
  const fast = buildSpeakingTimingInsight({ prompt: { part: 1 }, durationSeconds: 20, wordCount: 80 });

  assert.equal(slow.status, "pace-risk");
  assert.equal(fast.status, "pace-risk");
  assert.ok(slow.evidence.some((item) => item.includes("WPM")));
});
