export const WRITING_TASK_2_TARGET_SECONDS = 40 * 60;
const TARGET_WORDS = 250;

export type WritingTimingEvidence = {
  targetTimeSeconds: number;
  timeSpentSeconds?: number;
  remainingSeconds?: number;
  wordsPerMinute?: number;
  projectedWordsAtTarget?: number;
  timingStatus: "not-timed" | "on-track" | "slow" | "near-limit" | "over-time";
  timingWarning?: string;
};

export function buildWritingTimingEvidence({
  wordCount,
  timeSpentSeconds,
  targetTimeSeconds = WRITING_TASK_2_TARGET_SECONDS
}: {
  wordCount: number;
  timeSpentSeconds?: number;
  targetTimeSeconds?: number;
}): WritingTimingEvidence {
  if (!timeSpentSeconds || timeSpentSeconds <= 0) {
    return {
      targetTimeSeconds,
      timingStatus: "not-timed",
      timingWarning: "Timer was not used for this attempt."
    };
  }

  const minutes = timeSpentSeconds / 60;
  const wordsPerMinute = wordCount / Math.max(minutes, 1 / 60);
  const projectedWordsAtTarget = Math.round(wordsPerMinute * (targetTimeSeconds / 60));
  const remainingSeconds = Math.max(0, targetTimeSeconds - timeSpentSeconds);
  const nearLimit = timeSpentSeconds >= targetTimeSeconds * 0.875;
  const overTime = timeSpentSeconds > targetTimeSeconds;
  const slow = projectedWordsAtTarget < TARGET_WORDS || (nearLimit && wordCount < TARGET_WORDS);

  if (overTime) {
    return {
      targetTimeSeconds,
      timeSpentSeconds,
      remainingSeconds,
      wordsPerMinute: Number(wordsPerMinute.toFixed(1)),
      projectedWordsAtTarget,
      timingStatus: "over-time",
      timingWarning: `Attempt went over the 40-minute Task 2 target by ${timeSpentSeconds - targetTimeSeconds} seconds.`
    };
  }

  if (nearLimit && wordCount < TARGET_WORDS) {
    return {
      targetTimeSeconds,
      timeSpentSeconds,
      remainingSeconds,
      wordsPerMinute: Number(wordsPerMinute.toFixed(1)),
      projectedWordsAtTarget,
      timingStatus: "near-limit",
      timingWarning: `Near the 40-minute limit with only ${wordCount} words.`
    };
  }

  if (slow) {
    return {
      targetTimeSeconds,
      timeSpentSeconds,
      remainingSeconds,
      wordsPerMinute: Number(wordsPerMinute.toFixed(1)),
      projectedWordsAtTarget,
      timingStatus: "slow",
      timingWarning: `Current pace projects about ${projectedWordsAtTarget} words in 40 minutes.`
    };
  }

  return {
    targetTimeSeconds,
    timeSpentSeconds,
    remainingSeconds,
    wordsPerMinute: Number(wordsPerMinute.toFixed(1)),
    projectedWordsAtTarget,
    timingStatus: "on-track"
  };
}
