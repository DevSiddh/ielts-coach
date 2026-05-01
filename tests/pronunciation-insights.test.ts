import test from "node:test";
import assert from "node:assert/strict";
import { buildPronunciationInsights } from "../features/speaking/pronunciation-insights.ts";

test("pronunciation insights stay evidence-limited and surface concrete targets", () => {
  const insights = buildPronunciationInsights({
    audioSignals: {
      source: "wav-analysis",
      durationSeconds: 60,
      speechSeconds: 30,
      silenceSeconds: 30,
      speechRatio: 0.5,
      longPauses: [{ start: 10, end: 12, duration: 2 }],
      pauseCount: 3,
      longPauseCount: 1,
      hesitationClusters: [{ start: 9, end: 12, pauseDuration: 2 }]
    },
    evidenceSignals: {
      source: "single-transcript",
      scoringTranscriptSource: "deepgram",
      fillerWords: [],
      fillerWordCount: 0,
      repeatedPhrases: [],
      restartSignals: [],
      transcriptPauseCount: 2,
      transcriptLongPauseCount: 1,
      maxTranscriptPauseSeconds: 1.2,
      hesitationClusterCount: 1,
      lowConfidenceWordCount: 2,
      lowConfidenceWords: ["place", "culture"],
      averageWordConfidence: 0.81,
      clarityRisks: ["live/leave clarity risk"],
      evidenceNotes: []
    }
  });

  assert.equal(insights.evidenceLevel, "stronger");
  assert.ok(insights.findings.some((item) => item.includes("lower-confidence")));
  assert.ok(insights.targets.some((item) => item.includes("place")));
  assert.ok(insights.cautions.some((item) => item.includes("not a full pronunciation diagnosis")));
});

test("pronunciation insights avoid pretending when evidence is missing", () => {
  const insights = buildPronunciationInsights({});

  assert.equal(insights.evidenceLevel, "limited");
  assert.equal(insights.targets.length, 0);
  assert.ok(insights.findings[0].includes("No strong pronunciation-risk evidence"));
  assert.ok(insights.cautions.some((item) => item.includes("Audio-level evidence was unavailable")));
});
