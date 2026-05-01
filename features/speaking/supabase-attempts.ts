import type { EvidenceSignals, SavedAttempt, SpeakingEvaluation, SpeakingPrompt, TranscriptArtifact } from "./types";

const DEFAULT_TABLE = "ielts_attempts";

type AttemptRow = {
  id: string;
  created_at: string;
  prompt_id: string;
  prompt_title: string;
  prompt_part: number;
  prompt: SpeakingPrompt;
  overall_band: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  main_issue: string;
  retry_target: string;
  word_count: number;
  duration_seconds: number;
  filler_count: number;
  transcript_source: TranscriptArtifact["source"];
  evaluation: SpeakingEvaluation;
  evidence_signals?: EvidenceSignals | null;
};

export function supabaseAttemptsConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase attempts storage is not configured.");
  return {
    baseUrl: `${url.replace(/\/$/, "")}/rest/v1/${process.env.SUPABASE_ATTEMPTS_TABLE ?? DEFAULT_TABLE}`,
    key
  };
}

async function request(path: string, init: RequestInit = {}) {
  const { baseUrl, key } = config();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Supabase attempt request failed.");
  }
  return response;
}

function rowToAttempt(row: AttemptRow): SavedAttempt {
  const rawTranscript: TranscriptArtifact = {
    text: "",
    source: row.transcript_source ?? "manual",
    capturedAt: row.created_at
  };

  return {
    id: row.id,
    createdAt: row.created_at,
    prompt: row.prompt,
    transcript: "",
    rawTranscript,
    evidenceSignals: row.evidence_signals ?? undefined,
    durationSeconds: row.duration_seconds,
    evaluation: row.evaluation,
    hasAudio: false
  };
}

export async function listAttemptsFromSupabase(): Promise<SavedAttempt[]> {
  const response = await request("?select=*&order=created_at.desc");
  const rows = (await response.json()) as AttemptRow[];
  return rows.map(rowToAttempt);
}

export async function loadAttemptFromSupabase(id: string): Promise<SavedAttempt | null> {
  const response = await request(`?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  const rows = (await response.json()) as AttemptRow[];
  return rows[0] ? rowToAttempt(rows[0]) : null;
}

export async function saveAttemptToSupabase({
  prompt,
  evaluation,
  durationSeconds,
  rawTranscript,
  evidenceSignals
}: {
  prompt: SpeakingPrompt;
  evaluation: SpeakingEvaluation;
  durationSeconds: number;
  rawTranscript: TranscriptArtifact;
  evidenceSignals?: EvidenceSignals;
}): Promise<SavedAttempt> {
  const now = new Date().toISOString();
  const row: AttemptRow = {
    id: crypto.randomUUID(),
    created_at: now,
    prompt_id: prompt.id,
    prompt_title: prompt.title,
    prompt_part: prompt.part,
    prompt,
    overall_band: evaluation.overallBand,
    fluency: evaluation.criteria.fluency,
    grammar: evaluation.criteria.grammar,
    vocabulary: evaluation.criteria.lexical,
    pronunciation: evaluation.criteria.pronunciation,
    main_issue: evaluation.blockers[0] ?? evaluation.fixes[0] ?? evaluation.summary,
    retry_target: evaluation.nextTryFocus,
    word_count: evaluation.wordCount,
    duration_seconds: durationSeconds,
    filler_count: evaluation.fillers.length,
    transcript_source: rawTranscript.source,
    evaluation,
    evidence_signals: evidenceSignals ?? null
  };
  const response = await request("", {
    method: "POST",
    body: JSON.stringify(row)
  });
  const rows = (await response.json()) as AttemptRow[];
  return rowToAttempt(rows[0] ?? row);
}

export async function deleteAttemptFromSupabase(id: string) {
  await request(`?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function deleteAllAttemptsFromSupabase() {
  await request("?id=not.is.null", { method: "DELETE" });
}
