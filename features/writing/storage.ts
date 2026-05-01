import type { SavedWritingAttempt, WritingEvaluation, WritingPrompt } from "./types";

export type { SavedWritingAttempt } from "./types";

const KEY = "ielts-coach-writing-attempts";

function isBrowser() {
  return typeof window !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `writing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createWritingAttempt({
  prompt,
  plan,
  essay,
  evaluation,
  timeSpentSeconds,
  now = new Date()
}: {
  prompt: WritingPrompt;
  plan: string;
  essay: string;
  evaluation: WritingEvaluation;
  timeSpentSeconds?: number;
  now?: Date;
}): SavedWritingAttempt {
  return {
    id: createId(),
    createdAt: now.toISOString(),
    prompt,
    plan,
    essay,
    timeSpentSeconds,
    evaluation
  };
}

export function addWritingAttemptToList(attempts: SavedWritingAttempt[], attempt: SavedWritingAttempt, limit = 50) {
  return [attempt, ...attempts].slice(0, limit);
}

export function loadWritingAttempts(): SavedWritingAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedWritingAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveWritingAttempt(input: {
  prompt: WritingPrompt;
  plan: string;
  essay: string;
  evaluation: WritingEvaluation;
  timeSpentSeconds?: number;
}) {
  if (!isBrowser()) return [];
  const attempt = createWritingAttempt(input);
  const attempts = addWritingAttemptToList(loadWritingAttempts(), attempt);
  window.localStorage.setItem(KEY, JSON.stringify(attempts));
  return attempts;
}
