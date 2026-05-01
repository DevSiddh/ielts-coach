import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AudioSignals,
  EvidenceSignals,
  SavedAttempt,
  SpeakingEvaluation,
  SpeakingPrompt,
  SpeakingSignals,
  TranscriptArtifact
} from "./types";
import { extractAudioSignals } from "./audio-signals.ts";
import { buildEvidenceSignals } from "./evidence.ts";
import { evaluateSpeaking } from "./evaluate.ts";

function attemptsDir() {
  return process.env.IELTS_COACH_ATTEMPTS_DIR ?? path.join(process.cwd(), "data", "attempts");
}

export type SaveAttemptInput = {
  id?: string;
  createdAt?: string;
  prompt: SpeakingPrompt;
  rawTranscript: TranscriptArtifact;
  browserTranscript?: TranscriptArtifact;
  serviceTranscript?: TranscriptArtifact;
  whisperTranscript?: TranscriptArtifact;
  cleanTranscript: TranscriptArtifact;
  durationSeconds: number;
  evaluation: SpeakingEvaluation;
  audio?: {
    bytes: Buffer;
    extension: string;
  };
  audioSignals?: AudioSignals;
};

function safeAttemptId(id: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error("Invalid attempt id.");
  }
  return id;
}

function attemptPath(id: string) {
  return path.join(attemptsDir(), safeAttemptId(id));
}

function jsonReplacer(_key: string, value: unknown) {
  return value === undefined ? null : value;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, jsonReplacer, 2)}\n`, "utf8");
}

export function cleanTranscriptText(text: string) {
  return text
    .replace(/\b(uh|um|ah|er|like|you know|sort of|kind of|blah)\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s([,.!?;:])/g, "$1")
    .trim();
}

export function extractSignals(evaluation: SpeakingEvaluation): SpeakingSignals {
  return {
    fillerWords: evaluation.fillers,
    wordCount: evaluation.wordCount,
    durationSeconds: evaluation.durationSeconds,
    whyThisScore: evaluation.whyThisScore,
    nextTryFocus: evaluation.nextTryFocus
  };
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function saveAttemptToFiles(input: SaveAttemptInput): Promise<SavedAttempt> {
  const id = safeAttemptId(input.id ?? crypto.randomUUID());
  const createdAt = input.createdAt ?? new Date().toISOString();
  const dir = attemptPath(id);
  await mkdir(dir, { recursive: true });

  const audioSignals = input.audioSignals ?? (input.audio ? await extractAudioSignals(input.audio) : undefined);
  const evidenceSignals = buildEvidenceSignals({
    scoringTranscript: input.rawTranscript,
    browserTranscript: input.browserTranscript,
    serviceTranscript: input.serviceTranscript,
    whisperTranscript: input.whisperTranscript
  });
  const evaluation = evaluateSpeaking({
    transcript: input.rawTranscript.text,
    prompt: input.prompt,
    durationSeconds: input.durationSeconds,
    audioSignals,
    evidenceSignals
  });
  const signals = extractSignals(evaluation);
  const metadata = {
    id,
    createdAt,
    prompt: input.prompt,
    durationSeconds: input.durationSeconds,
    hasAudio: Boolean(input.audio)
  };

  await writeJson(path.join(dir, "metadata.json"), metadata);
  await writeJson(path.join(dir, "raw-transcript.json"), input.rawTranscript);
  if (input.browserTranscript) await writeJson(path.join(dir, "browser-transcript.json"), input.browserTranscript);
  if (input.serviceTranscript) await writeJson(path.join(dir, "service-transcript.json"), input.serviceTranscript);
  if (input.whisperTranscript) await writeJson(path.join(dir, "whisper-transcript.json"), input.whisperTranscript);
  await writeJson(path.join(dir, "clean-transcript.json"), input.cleanTranscript);
  await writeJson(path.join(dir, "evidence-signals.json"), evidenceSignals);
  await writeJson(path.join(dir, "signals.json"), signals);
  if (audioSignals) await writeJson(path.join(dir, "audio-signals.json"), audioSignals);
  await writeJson(path.join(dir, "evaluation.json"), evaluation);

  if (input.audio) {
    await writeFile(path.join(dir, `audio.${input.audio.extension}`), input.audio.bytes);
  }

  return {
    ...metadata,
    transcript: input.rawTranscript.text,
    rawTranscript: input.rawTranscript,
    browserTranscript: input.browserTranscript,
    serviceTranscript: input.serviceTranscript,
    whisperTranscript: input.whisperTranscript,
    cleanTranscript: input.cleanTranscript,
    evidenceSignals,
    signals,
    audioSignals,
    evaluation
  };
}

export async function loadAttemptFromFiles(id: string): Promise<SavedAttempt | null> {
  const dir = attemptPath(id);
  const metadata = await readJson<Omit<SavedAttempt, "transcript" | "evaluation">>(path.join(dir, "metadata.json"));
  const rawTranscript = await readJson<TranscriptArtifact>(path.join(dir, "raw-transcript.json"));
  const browserTranscript = await readJson<TranscriptArtifact>(path.join(dir, "browser-transcript.json"));
  const serviceTranscript = await readJson<TranscriptArtifact>(path.join(dir, "service-transcript.json"));
  const whisperTranscript = await readJson<TranscriptArtifact>(path.join(dir, "whisper-transcript.json"));
  const cleanTranscript = await readJson<TranscriptArtifact>(path.join(dir, "clean-transcript.json"));
  const evidenceSignals = await readJson<EvidenceSignals>(path.join(dir, "evidence-signals.json"));
  const signals = await readJson<SpeakingSignals>(path.join(dir, "signals.json"));
  const audioSignals = await readJson<AudioSignals>(path.join(dir, "audio-signals.json"));
  const evaluation = await readJson<SpeakingEvaluation>(path.join(dir, "evaluation.json"));

  if (!metadata || !rawTranscript || !evaluation) return null;

  return {
    ...metadata,
    transcript: rawTranscript.text,
    rawTranscript,
    browserTranscript: browserTranscript ?? undefined,
    serviceTranscript: serviceTranscript ?? whisperTranscript ?? undefined,
    whisperTranscript: whisperTranscript ?? undefined,
    cleanTranscript: cleanTranscript ?? undefined,
    evidenceSignals: evidenceSignals ?? undefined,
    signals: signals ?? undefined,
    audioSignals: audioSignals ?? undefined,
    evaluation
  };
}

export async function listAttemptsFromFiles(): Promise<SavedAttempt[]> {
  await mkdir(attemptsDir(), { recursive: true });
  const entries = await readdir(attemptsDir(), { withFileTypes: true });
  const attempts = await Promise.all(
    entries.filter((entry) => entry.isDirectory()).map((entry) => loadAttemptFromFiles(entry.name))
  );

  return attempts
    .filter((attempt): attempt is SavedAttempt => Boolean(attempt))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function deleteAttemptFromFiles(id: string) {
  await rm(attemptPath(id), { recursive: true, force: true });
}

export async function deleteAllAttemptsFromFiles() {
  await rm(attemptsDir(), { recursive: true, force: true });
  await mkdir(attemptsDir(), { recursive: true });
}
