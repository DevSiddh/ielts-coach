import test from "node:test";
import assert from "node:assert/strict";
import { buildHistoryAnalytics } from "../features/speaking/history-analytics.ts";
import type { EvidenceSignals, SavedAttempt, SpeakingEvaluation } from "../features/speaking/types.ts";

type AttemptOverrides = Omit<Partial<SavedAttempt>, "evaluation" | "evidenceSignals"> & {
  evaluation?: Partial<SpeakingEvaluation>;
  evidenceSignals?: EvidenceSignals;
};

function attempt(overrides: AttemptOverrides): SavedAttempt {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    prompt: {
      id: overrides.prompt?.id ?? "topic-a",
      part: 2,
      difficulty: "easy",
      strategyCategory: overrides.prompt?.strategyCategory ?? "part2-place",
      title: "A place",
      question: "Describe a place.",
      followUps: [],
      sourceLabel: "test",
      sourceType: "surprise-drill",
      sourceUrl: "",
      yearLabel: "test",
      answerFrame: [],
      whatGoodLooksLike: [],
      improvementTips: [],
      referenceLinks: []
    },
    transcript: "sample answer",
    durationSeconds: overrides.durationSeconds ?? 60,
    evaluation: {
      overallBand: overrides.evaluation?.overallBand ?? 5,
      criteria: overrides.evaluation?.criteria ?? {
        fluency: 5,
        grammar: 5,
        lexical: 5,
        pronunciation: 5
      },
      fillers: overrides.evaluation?.fillers ?? [],
      strengths: [],
      fixes: overrides.evaluation?.fixes ?? ["Add one example."],
      summary: "",
      improvedAnswer: "",
      voiceScript: "",
      durationSeconds: 60,
      wordCount: 80,
      blockers: overrides.evaluation?.blockers ?? ["The answer is too short."],
      whyThisScore: [],
      keywordSuggestions: [],
      approachPlan: [],
      nextTryFocus: "Add detail."
    },
    evidenceSignals: overrides.evidenceSignals,
    audioSignals: overrides.audioSignals,
    hasAudio: Boolean(overrides.audioSignals)
  };
}

test("history analytics summarizes trend, criteria, and recurring evidence", () => {
  const analytics = buildHistoryAnalytics([
    attempt({
      id: "new",
      createdAt: "2026-04-29T10:00:00.000Z",
      evaluation: {
        overallBand: 6,
        criteria: { fluency: 5.5, grammar: 6, lexical: 6.5, pronunciation: 5 },
        blockers: ["Filler words weaken delivery: uh."],
        fixes: ["Reduce filler words like uh."],
        fillers: ["uh"]
      },
      evidenceSignals: {
        source: "single-transcript",
        scoringTranscriptSource: "deepgram",
        fillerWords: ["uh"],
        fillerWordCount: 3,
        repeatedPhrases: [],
        restartSignals: ["I mean"],
        transcriptPauseCount: 2,
        transcriptLongPauseCount: 1,
        maxTranscriptPauseSeconds: 1.4,
        hesitationClusterCount: 1,
        lowConfidenceWordCount: 2,
        lowConfidenceWords: ["place"],
        averageWordConfidence: 0.82,
        clarityRisks: ["live/leave clarity risk"],
        evidenceNotes: []
      }
    }),
    attempt({
      id: "old",
      createdAt: "2026-04-28T10:00:00.000Z",
      evaluation: {
        overallBand: 5,
        criteria: { fluency: 4.5, grammar: 5, lexical: 5.5, pronunciation: 4.5 },
        blockers: ["Filler words weaken delivery: uh."],
        fixes: ["Reduce filler words like uh."],
        fillers: ["uh"]
      }
    })
  ]);

  assert.equal(analytics.totalAttempts, 2);
  assert.equal(analytics.averageBand, 5.5);
  assert.equal(analytics.bandTrend, 1);
  assert.equal(analytics.weakestCriterion?.label, "Pronunciation");
  assert.equal(analytics.strongestCriterion?.label, "Vocabulary");
  assert.equal(analytics.recurringBlockers[0].count, 2);
  assert.equal(analytics.evidenceTotals.fillers, 4);
  assert.equal(analytics.evidenceTotals.lowConfidenceWords, 2);
  assert.equal(analytics.evidenceTotals.clarityRisks, 1);
  assert.equal(analytics.evidenceTotals.averageDurationSeconds, 60);
  assert.equal(analytics.evidenceTotals.timingTargetMissCount, 0);
});
