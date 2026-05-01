import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultProgress,
  estimateTargetSeconds,
  incrementGoal,
  prepareProgress
} from "../features/vocabulary/practice.ts";

test("vocabulary daily goals complete once and advance streak", () => {
  const today = new Date("2026-04-30T10:00:00Z");
  let progress = defaultProgress(today);

  for (let index = 0; index < 5; index += 1) progress = incrementGoal(progress, "listens", today);
  for (let index = 0; index < 3; index += 1) progress = incrementGoal(progress, "records", today);
  progress = incrementGoal(progress, "learns", today);

  assert.equal(progress.completedDate, "2026-04-30");
  assert.equal(progress.streak, 1);

  progress = incrementGoal(progress, "learns", today);
  assert.equal(progress.streak, 1);
});

test("vocabulary progress preserves streak only after yesterday completion", () => {
  const yesterdayComplete = {
    ...defaultProgress(new Date("2026-04-29T10:00:00Z")),
    listens: 5,
    records: 3,
    learns: 1,
    streak: 4,
    completedDate: "2026-04-29"
  };

  assert.equal(prepareProgress(yesterdayComplete, new Date("2026-04-30T10:00:00Z")).streak, 4);
  assert.equal(prepareProgress(yesterdayComplete, new Date("2026-05-02T10:00:00Z")).streak, 0);
});

test("vocabulary model timing is slower for slow playback", () => {
  assert.ok(estimateTargetSeconds("comfortable", "slow") > estimateTargetSeconds("comfortable", "normal"));
  assert.equal(estimateTargetSeconds("queue", "normal"), 0.79);
});
