import test from "node:test";
import assert from "node:assert/strict";
import { access, rm } from "node:fs/promises";
import path from "node:path";

import {
  cleanTranscriptText,
  deleteAllAttemptsFromFiles,
  deleteAttemptFromFiles,
  listAttemptsFromFiles,
  saveAttemptToFiles
} from "../features/speaking/attempt-files.ts";
import { evaluateSpeaking } from "../features/speaking/evaluate.ts";
import { prompts } from "../features/speaking/prompts.ts";

const attemptsDir = path.join(process.cwd(), ".test-data", "attempts");
const prompt = prompts.find((item) => item.id === "hometown-official")!;

process.env.IELTS_COACH_ATTEMPTS_DIR = attemptsDir;

test.beforeEach(async () => {
  await rm(attemptsDir, { recursive: true, force: true });
});

test.after(async () => {
  await rm(path.join(process.cwd(), ".test-data"), { recursive: true, force: true });
});

test("cleanTranscriptText removes fillers without replacing raw evidence", () => {
  const raw = "Um my hometown is like peaceful, and you know, it has a market.";

  assert.equal(cleanTranscriptText(raw), "my hometown is peaceful, and, it has a market.");
  assert.equal(raw.includes("Um"), true);
});

test("attempt files persist raw transcript, clean transcript, signals, evaluation, and audio", async () => {
  const transcript =
    "Um my hometown is a peaceful city with useful public places. It has a local market, quiet neighborhoods, and friendly people.";
  const evaluation = evaluateSpeaking({
    transcript,
    prompt,
    durationSeconds: 42
  });

  const saved = await saveAttemptToFiles({
    id: "attempt_test_one",
    createdAt: "2026-04-27T00:00:00.000Z",
    prompt,
    rawTranscript: {
      text: transcript,
      source: "manual",
      capturedAt: "2026-04-27T00:00:00.000Z",
      words: [{ word: "Um", start: 0, end: 0.2 }],
      segments: [{ text: transcript, start: 0, end: 4.2 }],
      speechActivity: [{ start: 0, end: 4.2 }],
      disfluencies: [{ word: "Um", start: 0, end: 0.2 }]
    },
    browserTranscript: {
      text: "Um I I think my hometown is peaceful.",
      source: "browser-speech",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    serviceTranscript: {
      text: transcript,
      source: "deepgram",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    whisperTranscript: {
      text: transcript,
      source: "whisper-timestamped",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    cleanTranscript: {
      text: cleanTranscriptText(transcript),
      source: "mixed",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    durationSeconds: 42,
    evaluation,
    audio: {
      bytes: Buffer.from("audio"),
      extension: "webm"
    },
    audioSignals: {
      source: "test",
      durationSeconds: 4.2,
      speechSeconds: 3.4,
      silenceSeconds: 0.8,
      speechRatio: 0.81,
      longPauses: [{ start: 1, end: 2.1, duration: 1.1 }],
      pauseCount: 1,
      longPauseCount: 1,
      hesitationClusters: [{ start: 0.6, end: 2.5, pauseDuration: 1.1 }]
    }
  });

  const attempts = await listAttemptsFromFiles();

  assert.equal(saved.id, "attempt_test_one");
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].transcript, transcript);
  assert.equal(attempts[0].browserTranscript?.source, "browser-speech");
  assert.equal(attempts[0].serviceTranscript?.source, "deepgram");
  assert.equal(attempts[0].whisperTranscript?.source, "whisper-timestamped");
  assert.equal(attempts[0].evidenceSignals?.source, "dual-transcript");
  assert.deepEqual(attempts[0].rawTranscript?.words, [{ word: "Um", start: 0, end: 0.2 }]);
  assert.deepEqual(attempts[0].rawTranscript?.segments, [{ text: transcript, start: 0, end: 4.2 }]);
  assert.deepEqual(attempts[0].rawTranscript?.speechActivity, [{ start: 0, end: 4.2 }]);
  assert.deepEqual(attempts[0].rawTranscript?.disfluencies, [{ word: "Um", start: 0, end: 0.2 }]);
  assert.equal(attempts[0].audioSignals?.longPauseCount, 1);
  assert.equal(
    attempts[0].evaluation.whyThisScore.some((item) => item === "Audio evidence: 1 pause, 1 long pause, 81% speech ratio."),
    true
  );
  assert.equal(attempts[0].cleanTranscript?.text.includes("Um"), false);
  assert.deepEqual(attempts[0].signals?.fillerWords, evaluation.fillers);
  assert.equal(attempts[0].evaluation.overallBand, evaluation.overallBand);
  await access(path.join(attemptsDir, "attempt_test_one", "audio.webm"));
  await access(path.join(attemptsDir, "attempt_test_one", "browser-transcript.json"));
  await access(path.join(attemptsDir, "attempt_test_one", "service-transcript.json"));
  await access(path.join(attemptsDir, "attempt_test_one", "whisper-transcript.json"));
  await access(path.join(attemptsDir, "attempt_test_one", "evidence-signals.json"));
  await access(path.join(attemptsDir, "attempt_test_one", "audio-signals.json"));
});

test("saved attempt evaluation uses the raw transcribed audio text even without audio signals", async () => {
  const cleanDisplayText =
    "My hometown is peaceful because people can walk to markets and meet friendly neighbors.";
  const rawServiceText =
    "Um um my hometown is peaceful because people can walk to markets and meet friendly neighbors.";
  const originalEvaluation = evaluateSpeaking({
    transcript: cleanDisplayText,
    prompt,
    durationSeconds: 28
  });

  const saved = await saveAttemptToFiles({
    id: "attempt_service_raw",
    createdAt: "2026-04-27T00:00:00.000Z",
    prompt,
    rawTranscript: {
      text: rawServiceText,
      source: "deepgram",
      capturedAt: "2026-04-27T00:00:00.000Z",
      words: [
        { word: "Um", start: 0, end: 0.15, confidence: 0.94 },
        { word: "um", start: 0.7, end: 0.85, confidence: 0.92 },
        { word: "my", start: 0.88, end: 1.02, confidence: 0.99 }
      ]
    },
    cleanTranscript: {
      text: cleanDisplayText,
      source: "mixed",
      capturedAt: "2026-04-27T00:00:00.000Z"
    },
    durationSeconds: 28,
    evaluation: originalEvaluation
  });

  assert.equal(originalEvaluation.fillers.includes("um"), false);
  assert.equal(saved.transcript, rawServiceText);
  assert.equal(saved.rawTranscript?.source, "deepgram");
  assert.equal(saved.evaluation.fillers.includes("um"), true);
  assert.equal(saved.signals?.fillerWords.includes("um"), true);
  assert.equal(
    saved.evaluation.whyThisScore.some((item) => item.startsWith("Merged transcript evidence:")),
    true
  );
});

test("attempt deletion removes one folder and wipe all clears the local store", async () => {
  const evaluation = evaluateSpeaking({
    transcript: "My hometown is peaceful and convenient because people can reach most daily services easily.",
    prompt,
    durationSeconds: 20
  });

  for (const id of ["attempt_a", "attempt_b"]) {
    await saveAttemptToFiles({
      id,
      prompt,
      rawTranscript: {
        text: id,
        source: "manual",
        capturedAt: "2026-04-27T00:00:00.000Z"
      },
      cleanTranscript: {
        text: id,
        source: "mixed",
        capturedAt: "2026-04-27T00:00:00.000Z"
      },
      durationSeconds: 20,
      evaluation
    });
  }

  await deleteAttemptFromFiles("attempt_a");
  assert.deepEqual((await listAttemptsFromFiles()).map((attempt) => attempt.id), ["attempt_b"]);

  await deleteAllAttemptsFromFiles();
  assert.equal((await listAttemptsFromFiles()).length, 0);
});
