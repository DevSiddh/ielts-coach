import type { CriterionScores, SavedAttempt } from "./types";
import { buildSpeakingTimingInsight } from "./timing.ts";

type CriterionKey = keyof CriterionScores;

const CRITERION_LABELS: Record<CriterionKey, string> = {
  fluency: "Fluency",
  grammar: "Grammar",
  lexical: "Vocabulary",
  pronunciation: "Pronunciation"
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatSigned(value: number) {
  if (!value) return "0.0";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function countByText(items: string[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = item.trim();
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function latestFirst(attempts: SavedAttempt[]) {
  return [...attempts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function buildHistoryAnalytics(attempts: SavedAttempt[]) {
  const ordered = latestFirst(attempts);
  const chronological = [...ordered].reverse();
  const latest = ordered[0] ?? null;
  const oldest = chronological[0] ?? null;
  const recent = ordered.slice(0, Math.min(5, ordered.length));
  const previous = ordered.slice(recent.length, recent.length * 2);
  const averageBand = average(ordered.map((attempt) => attempt.evaluation.overallBand));
  const latestBand = latest?.evaluation.overallBand ?? 0;
  const oldestBand = oldest?.evaluation.overallBand ?? 0;
  const bandTrend = ordered.length > 1 ? latestBand - oldestBand : 0;
  const recentAverage = average(recent.map((attempt) => attempt.evaluation.overallBand));
  const previousAverage = average(previous.map((attempt) => attempt.evaluation.overallBand));
  const recentShift = previous.length ? recentAverage - previousAverage : 0;

  const criteriaAverages = (Object.keys(CRITERION_LABELS) as CriterionKey[]).map((key) => ({
    key,
    label: CRITERION_LABELS[key],
    value: average(ordered.map((attempt) => attempt.evaluation.criteria[key]))
  }));
  const strongestCriterion = [...criteriaAverages].sort((a, b) => b.value - a.value)[0] ?? null;
  const weakestCriterion = [...criteriaAverages].sort((a, b) => a.value - b.value)[0] ?? null;

  const recurringBlockers = countByText(ordered.flatMap((attempt) => attempt.evaluation.blockers.slice(0, 2))).slice(0, 5);
  const recurringFixes = countByText(ordered.flatMap((attempt) => attempt.evaluation.fixes.slice(0, 2))).slice(0, 5);
  const topicCounts = countByText(ordered.map((attempt) => attempt.prompt.strategyCategory)).slice(0, 5);

  const fillerTotal = ordered.reduce(
    (sum, attempt) => sum + (attempt.evidenceSignals?.fillerWordCount ?? attempt.evaluation.fillers.length),
    0
  );
  const pauseTotal = ordered.reduce(
    (sum, attempt) => sum + (attempt.audioSignals?.pauseCount ?? attempt.evidenceSignals?.transcriptPauseCount ?? 0),
    0
  );
  const longPauseTotal = ordered.reduce(
    (sum, attempt) => sum + (attempt.audioSignals?.longPauseCount ?? attempt.evidenceSignals?.transcriptLongPauseCount ?? 0),
    0
  );
  const lowConfidenceTotal = ordered.reduce((sum, attempt) => sum + (attempt.evidenceSignals?.lowConfidenceWordCount ?? 0), 0);
  const clarityRiskTotal = ordered.reduce((sum, attempt) => sum + (attempt.evidenceSignals?.clarityRisks.length ?? 0), 0);
  const restartTotal = ordered.reduce((sum, attempt) => sum + (attempt.evidenceSignals?.restartSignals.length ?? 0), 0);
  const timedAttempts = ordered.filter((attempt) => attempt.durationSeconds > 0);
  const averageDurationSeconds = average(timedAttempts.map((attempt) => attempt.durationSeconds));
  const timingInsights = timedAttempts.map((attempt) =>
    buildSpeakingTimingInsight({
      prompt: attempt.prompt,
      durationSeconds: attempt.durationSeconds,
      wordCount: attempt.evaluation.wordCount
    })
  );
  const pacingRiskCount = timingInsights.filter((insight) => insight.status === "pace-risk").length;
  const timingTargetMissCount = timingInsights.filter((insight) => insight.status === "short" || insight.status === "long").length;

  const bestAttempt = [...ordered].sort((a, b) => b.evaluation.overallBand - a.evaluation.overallBand)[0] ?? null;
  const lastRetryGain =
    ordered.length > 1 && ordered[0].prompt.id === ordered[1].prompt.id
      ? ordered[0].evaluation.overallBand - ordered[1].evaluation.overallBand
      : null;

  const priority =
    recurringBlockers[0]?.label ??
    weakestCriterion?.label ??
    "Score a few more attempts to reveal your main pattern.";
  const nextAction = weakestCriterion
    ? `Next 3 attempts: protect ${weakestCriterion.label.toLowerCase()} by following the retry target before adding extra ideas.`
    : "Score at least three attempts to unlock reliable progress analytics.";

  return {
    totalAttempts: ordered.length,
    averageBand: roundOne(averageBand),
    latestBand: roundOne(latestBand),
    oldestBand: roundOne(oldestBand),
    bandTrend: roundOne(bandTrend),
    recentAverage: roundOne(recentAverage),
    recentShift: roundOne(recentShift),
    trendLabel: formatSigned(roundOne(bandTrend)),
    recentShiftLabel: formatSigned(roundOne(recentShift)),
    criteriaAverages: criteriaAverages.map((item) => ({ ...item, value: roundOne(item.value) })),
    strongestCriterion: strongestCriterion ? { ...strongestCriterion, value: roundOne(strongestCriterion.value) } : null,
    weakestCriterion: weakestCriterion ? { ...weakestCriterion, value: roundOne(weakestCriterion.value) } : null,
    recurringBlockers,
    recurringFixes,
    topicCounts,
    evidenceTotals: {
      fillers: fillerTotal,
      pauses: pauseTotal,
      longPauses: longPauseTotal,
      lowConfidenceWords: lowConfidenceTotal,
      clarityRisks: clarityRiskTotal,
      restarts: restartTotal,
      averageDurationSeconds: roundOne(averageDurationSeconds),
      pacingRiskCount,
      timingTargetMissCount
    },
    bestAttempt,
    lastRetryGain: typeof lastRetryGain === "number" ? roundOne(lastRetryGain) : null,
    priority,
    nextAction
  };
}
