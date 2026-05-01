import test from "node:test";
import assert from "node:assert/strict";

import { buildEvidenceSignals } from "../features/speaking/evidence.ts";
import { evaluateSpeaking } from "../features/speaking/evaluate.ts";
import { prompts } from "../features/speaking/prompts.ts";

const prompt = prompts.find((item) => item.id === "hometown-official")!;

const browserText =
  "Hmm, uh, I think my hometown is it. It is a fairly comfortable place to live but but some I sometimes find it difficult to explain. Uh, uh, sorry. I mean, we bought vegetables there. But if got the government improved public transport.";

const whisperText =
  "hmm I think my hometown is it it is a fairly comfortable place to leave but but some I sometimes find it difficult to explain and we buy we buy many vegetables sorry I mean we bought vegetables there overall I would say my hometown is a good place to leave because people help each of them but if the government approved public transport it would become better";

test("buildEvidenceSignals merges browser fillers and whisper clarity risks", () => {
  const evidence = buildEvidenceSignals({
    scoringTranscript: {
      text: whisperText,
      source: "whisper-timestamped",
      capturedAt: "2026-04-27T00:00:00.000Z",
      words: [
        { word: "hmm", start: 0, end: 0.2, confidence: 0.91 },
        { word: "I", start: 1.4, end: 1.5, confidence: 0.95 },
        { word: "think", start: 1.52, end: 1.8, confidence: 0.96 },
        { word: "leave", start: 3.2, end: 3.5, confidence: 0.55 },
        { word: "but", start: 4.8, end: 4.95, confidence: 0.94 },
        { word: "but", start: 4.98, end: 5.12, confidence: 0.94 },
        { word: "sorry", start: 6.4, end: 6.7, confidence: 0.61 },
        { word: "mean", start: 6.72, end: 6.95, confidence: 0.66 }
      ]
    },
    browserTranscript: {
      text: browserText,
      source: "browser-speech",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    whisperTranscript: {
      text: whisperText,
      source: "whisper-timestamped",
      capturedAt: "2026-04-27T00:00:00.000Z"
    }
  });

  assert.equal(evidence.source, "dual-transcript");
  assert.equal(evidence.fillerWords.includes("uh"), true);
  assert.equal(evidence.fillerWordCount > 0, true);
  assert.equal(evidence.repeatedPhrases.includes("but but"), true);
  assert.equal(evidence.restartSignals.includes("sorry/self-correction"), true);
  assert.equal(evidence.transcriptPauseCount >= 2, true);
  assert.equal(evidence.transcriptLongPauseCount >= 2, true);
  assert.equal(evidence.hesitationClusterCount >= 1, true);
  assert.equal(evidence.lowConfidenceWordCount >= 2, true);
  assert.equal(evidence.lowConfidenceWords.includes("leave"), true);
  assert.equal(evidence.clarityRisks.includes("live/leave clarity risk"), true);
  assert.equal(evidence.clarityRisks.includes("improve/approve clarity risk"), true);
  assert.equal(evidence.clarityRisks.includes("each other clarity risk"), true);
});

test("merged evidence lowers score compared with whisper-only scoring", () => {
  const base = evaluateSpeaking({
    transcript: whisperText,
    prompt,
    durationSeconds: 85
  });
  const evidence = buildEvidenceSignals({
    scoringTranscript: {
      text: whisperText,
      source: "whisper-timestamped",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    browserTranscript: {
      text: browserText,
      source: "browser-speech",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    whisperTranscript: {
      text: whisperText,
      source: "whisper-timestamped",
      capturedAt: "2026-04-27T00:00:00.000Z"
    }
  });
  const merged = evaluateSpeaking({
    transcript: whisperText,
    prompt,
    durationSeconds: 85,
    evidenceSignals: evidence
  });

  assert.equal(merged.overallBand <= base.overallBand, true);
  assert.equal(
    merged.blockers.includes("Possible pronunciation or clarity risks were detected from suspicious transcript wording."),
    true
  );
  assert.equal(
    merged.whyThisScore.some((item) => item.startsWith("Merged transcript evidence:")),
    true
  );
  assert.equal(
    merged.whyThisScore.some((item) => item.startsWith("Transcript timing evidence:")),
    true
  );
  assert.equal(
    merged.whyThisScore.some((item) => item.startsWith("Transcript confidence evidence:")),
    true
  );
});
