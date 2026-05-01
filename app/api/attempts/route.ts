import { NextResponse } from "next/server";
import { cleanTranscriptText, listAttemptsFromFiles, saveAttemptToFiles } from "@/features/speaking/attempt-files";
import { buildEvidenceSignals } from "@/features/speaking/evidence";
import { evaluateSpeaking } from "@/features/speaking/evaluate";
import {
  deleteAllAttemptsFromSupabase,
  listAttemptsFromSupabase,
  saveAttemptToSupabase,
  supabaseAttemptsConfigured
} from "@/features/speaking/supabase-attempts";
import type { SpeakingEvaluation, SpeakingPrompt, TranscriptArtifact } from "@/features/speaking/types";

export const runtime = "nodejs";

function parseJsonField<T>(form: FormData, key: string): T {
  const raw = form.get(key);
  if (typeof raw !== "string") {
    throw new Error(`Missing ${key}.`);
  }
  return JSON.parse(raw) as T;
}

function audioExtension(file: File) {
  if (file.name.includes(".")) return file.name.split(".").pop() || "webm";
  if (file.type.includes("ogg")) return "ogg";
  if (file.type.includes("mpeg")) return "mp3";
  if (file.type.includes("wav")) return "wav";
  return "webm";
}

export async function GET() {
  if (supabaseAttemptsConfigured()) {
    const attempts = await listAttemptsFromSupabase();
    return NextResponse.json({ attempts });
  }
  const attempts = await listAttemptsFromFiles();
  return NextResponse.json({ attempts });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const prompt = parseJsonField<SpeakingPrompt>(form, "prompt");
    const evaluation = parseJsonField<SpeakingEvaluation>(form, "evaluation");
    const transcript = String(form.get("transcript") ?? "");
    const durationSeconds = Number(form.get("durationSeconds") ?? evaluation.durationSeconds ?? 0);
    const source = String(form.get("source") ?? "mixed") as TranscriptArtifact["source"];
    const capturedAt = new Date().toISOString();
    const rawTranscriptField = form.get("rawTranscript");
    const browserTranscriptField = form.get("browserTranscript");
    const serviceTranscriptField = form.get("serviceTranscript");
    const whisperTranscriptField = form.get("whisperTranscript");
    const audioFile = form.get("audio");

    const parsedRawTranscript =
      typeof rawTranscriptField === "string" ? (JSON.parse(rawTranscriptField) as Partial<TranscriptArtifact>) : null;
    const rawTranscript: TranscriptArtifact = parsedRawTranscript
      ? {
          ...parsedRawTranscript,
          text: parsedRawTranscript.text ?? transcript,
          source: parsedRawTranscript.source ?? source,
          capturedAt: parsedRawTranscript.capturedAt ?? capturedAt
        }
      : {
          text: transcript,
          source,
          capturedAt
        };
    const cleanTranscript: TranscriptArtifact = {
      text: cleanTranscriptText(transcript),
      source: "mixed",
      capturedAt
    };
    const browserTranscript =
      typeof browserTranscriptField === "string"
        ? (JSON.parse(browserTranscriptField) as TranscriptArtifact)
        : undefined;
    const serviceTranscript =
      typeof serviceTranscriptField === "string"
        ? (JSON.parse(serviceTranscriptField) as TranscriptArtifact)
        : undefined;
    const whisperTranscript =
      typeof whisperTranscriptField === "string"
        ? (JSON.parse(whisperTranscriptField) as TranscriptArtifact)
        : undefined;

    if (supabaseAttemptsConfigured()) {
      const evidenceSignals = buildEvidenceSignals({
        scoringTranscript: rawTranscript,
        browserTranscript,
        serviceTranscript,
        whisperTranscript
      });
      const scoredEvaluation = evaluateSpeaking({
        transcript: rawTranscript.text,
        prompt,
        durationSeconds,
        evidenceSignals
      });
      const attempt = await saveAttemptToSupabase({
        prompt,
        evaluation: scoredEvaluation,
        durationSeconds,
        rawTranscript,
        evidenceSignals
      });
      return NextResponse.json({ attempt }, { status: 201 });
    }

    const audio =
      audioFile instanceof File
        ? {
            bytes: Buffer.from(await audioFile.arrayBuffer()),
            extension: audioExtension(audioFile)
          }
        : undefined;

    const attempt = await saveAttemptToFiles({
      prompt,
      rawTranscript,
      browserTranscript,
      serviceTranscript,
      whisperTranscript,
      cleanTranscript,
      durationSeconds,
      evaluation,
      audio
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save attempt." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  if (supabaseAttemptsConfigured()) {
    await deleteAllAttemptsFromSupabase();
    return NextResponse.json({ ok: true });
  }
  const { deleteAllAttemptsFromFiles } = await import("@/features/speaking/attempt-files");
  await deleteAllAttemptsFromFiles();
  return NextResponse.json({ ok: true });
}
