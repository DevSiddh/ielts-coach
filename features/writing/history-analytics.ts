import type { SavedWritingAttempt, WritingCriterionScores } from "./types";

type CriterionKey = keyof WritingCriterionScores;

const criterionLabels: Record<CriterionKey, string> = {
  taskResponse: "Task response",
  coherenceCohesion: "Coherence",
  lexicalResource: "Vocabulary",
  grammarAccuracy: "Grammar"
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function countIssue(attempt: SavedWritingAttempt) {
  const issues: string[] = [];
  if (attempt.evaluation.evidence.wordCount < 250) issues.push("Under 250 words");
  if (attempt.evaluation.evidence.weakLinking) issues.push("Weak linking");
  if (attempt.evaluation.evidence.unclearOpinion) issues.push("Unclear opinion");
  if (attempt.evaluation.evidence.missingConclusion) issues.push("Missing conclusion");
  if (attempt.evaluation.evidence.paragraphCount <= 1) issues.push("One-paragraph essay");
  if (attempt.evaluation.evidence.timing.timingStatus === "slow" || attempt.evaluation.evidence.timing.timingStatus === "over-time") {
    issues.push("Timing risk");
  }
  return issues;
}

export function buildWritingHistoryAnalytics(attempts: SavedWritingAttempt[]) {
  const ordered = [...attempts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const averageBand = average(ordered.map((attempt) => attempt.evaluation.overallBand));
  const recent = ordered.slice(0, 5);
  const previous = ordered.slice(5, 10);
  const recentAverage = average(recent.map((attempt) => attempt.evaluation.overallBand));
  const previousAverage = average(previous.map((attempt) => attempt.evaluation.overallBand));
  const trendDelta = previous.length ? recentAverage - previousAverage : 0;
  const trendLabel = !previous.length ? "Need more essays" : trendDelta >= 0.25 ? "Improving" : trendDelta <= -0.25 ? "Dropping" : "Stable";
  const bestAttempt = ordered.reduce<SavedWritingAttempt | null>(
    (best, attempt) => (!best || attempt.evaluation.overallBand > best.evaluation.overallBand ? attempt : best),
    null
  );

  const criteriaAverages = (Object.keys(criterionLabels) as CriterionKey[]).map((key) => ({
    key,
    label: criterionLabels[key],
    value: average(ordered.map((attempt) => attempt.evaluation.criteria[key]))
  }));
  const weakestCriterion = criteriaAverages.length
    ? [...criteriaAverages].sort((a, b) => a.value - b.value)[0]
    : null;

  const issueCounts = new Map<string, number>();
  ordered.flatMap(countIssue).forEach((issue) => {
    issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1);
  });
  const recurringIssues = Array.from(issueCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const priority =
    recurringIssues[0]?.label ??
    weakestCriterion?.label ??
    "Write one essay to establish your writing pattern.";
  const nextAction =
    recurringIssues[0]?.label === "Under 250 words"
      ? "Reach 250 words before polishing vocabulary."
      : recurringIssues[0]?.label === "Weak linking"
        ? "Use clearer paragraph links and example transitions."
        : recurringIssues[0]?.label === "Unclear opinion"
          ? "State your position in the introduction and conclusion."
          : recurringIssues[0]?.label === "Missing conclusion"
            ? "Reserve two minutes for a direct conclusion."
            : ordered.length
              ? "Retry the weakest criterion with one focused rewrite."
              : "Write and evaluate your first Task 2 essay.";

  return {
    averageBand,
    recentAverage,
    trendLabel,
    bestAttempt,
    weakestCriterion,
    criteriaAverages,
    recurringIssues,
    priority,
    nextAction
  };
}
