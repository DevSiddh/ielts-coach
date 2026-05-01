import type { SavedAttempt, SpeakingEvaluation, SpeakingPrompt, TranscriptArtifact } from "./types";

export type { SavedAttempt } from "./types";

const KEY = "ielts-coach-attempts";

function isBrowser() {
  return typeof window !== "undefined";
}

function loadLocalAttempts(): SavedAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedAttempt[]) : [];
  } catch {
    return [];
  }
}

function saveLocalAttempt({
  prompt,
  transcript,
  evaluation,
  durationSeconds
}: {
  prompt: SpeakingPrompt;
  transcript: string;
  evaluation: SpeakingEvaluation;
  durationSeconds: number;
}) {
  if (!isBrowser()) return [];
  const attempt: SavedAttempt = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prompt,
    transcript,
    durationSeconds,
    evaluation
  };

  const attempts = [attempt, ...loadLocalAttempts()].slice(0, 25);
  window.localStorage.setItem(KEY, JSON.stringify(attempts));
  return attempts;
}

export async function loadAttempts(): Promise<SavedAttempt[]> {
  if (!isBrowser()) return [];
  try {
    const response = await fetch("/api/attempts", { cache: "no-store" });
    if (!response.ok) return loadLocalAttempts();
    const payload = (await response.json()) as { attempts?: SavedAttempt[] };
    return payload.attempts ?? [];
  } catch {
    return loadLocalAttempts();
  }
}

export async function saveAttempt({
  prompt,
  transcript,
  evaluation,
  durationSeconds,
  audioBlob,
  rawTranscript,
  browserTranscript,
  serviceTranscript,
  whisperTranscript
}: {
  prompt: SpeakingPrompt;
  transcript: string;
  evaluation: SpeakingEvaluation;
  durationSeconds: number;
  audioBlob?: Blob | null;
  rawTranscript?: TranscriptArtifact | null;
  browserTranscript?: TranscriptArtifact | null;
  serviceTranscript?: TranscriptArtifact | null;
  whisperTranscript?: TranscriptArtifact | null;
}) {
  if (!isBrowser()) return [];
  try {
    const form = new FormData();
    form.append("prompt", JSON.stringify(prompt));
    form.append("transcript", transcript);
    form.append("evaluation", JSON.stringify(evaluation));
    form.append("durationSeconds", String(durationSeconds));
    form.append("source", rawTranscript?.source ?? (audioBlob ? "mixed" : "manual"));
    if (rawTranscript) form.append("rawTranscript", JSON.stringify(rawTranscript));
    if (browserTranscript) form.append("browserTranscript", JSON.stringify(browserTranscript));
    if (serviceTranscript) form.append("serviceTranscript", JSON.stringify(serviceTranscript));
    if (whisperTranscript) form.append("whisperTranscript", JSON.stringify(whisperTranscript));
    if (audioBlob) form.append("audio", audioBlob, "audio.webm");

    const response = await fetch("/api/attempts", {
      method: "POST",
      body: form
    });
    if (!response.ok) return saveLocalAttempt({ prompt, transcript, evaluation, durationSeconds });
    return loadAttempts();
  } catch {
    return saveLocalAttempt({ prompt, transcript, evaluation, durationSeconds });
  }
}

export async function deleteAttempt(id: string): Promise<SavedAttempt[]> {
  if (!isBrowser()) return [];
  try {
    await fetch(`/api/attempts/${encodeURIComponent(id)}`, { method: "DELETE" });
    return loadAttempts();
  } catch {
    const attempts = loadLocalAttempts().filter((attempt) => attempt.id !== id);
    window.localStorage.setItem(KEY, JSON.stringify(attempts));
    return attempts;
  }
}

export async function deleteAllAttempts(): Promise<SavedAttempt[]> {
  if (!isBrowser()) return [];
  try {
    await fetch("/api/attempts", { method: "DELETE" });
    return [];
  } catch {
    window.localStorage.removeItem(KEY);
    return [];
  }
}
