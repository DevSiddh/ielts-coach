import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import type { TranscriptArtifact } from "./types";

export type LocalTranscriptionResult = {
  artifact: TranscriptArtifact;
  raw: unknown;
};

function runPython(scriptPath: string, audioPath: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const python = process.env.IELTS_COACH_PYTHON ?? "python";
    const model = process.env.IELTS_COACH_WHISPER_MODEL ?? "base.en";
    const child = spawn(python, [scriptPath, audioPath, "--model", model, "--language", "en"], {
      cwd: process.cwd(),
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({ stdout, stderr, code }));
    child.on("error", (error) => resolve({ stdout, stderr: error.message, code: 1 }));
  });
}

function collectWords(raw: { segments?: Array<{ words?: unknown[] }> }) {
  return raw.segments?.flatMap((segment) => segment.words ?? []) ?? [];
}

function collectDisfluencies(words: unknown[]) {
  return words.filter((word) => {
    if (!word || typeof word !== "object") return false;
    const text = "text" in word ? String(word.text) : "word" in word ? String(word.word) : "";
    return text.includes("[*]") || /\b(u+h+|u+m+|a+h+|e+r+|h+m+)\b/i.test(text);
  });
}

export async function transcribeWithWhisperTimestamped(file: File): Promise<LocalTranscriptionResult> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ielts-coach-"));
  const audioPath = path.join(tempDir, file.name || "audio.webm");
  const scriptPath = path.join(process.cwd(), "scripts", "transcribe_whisper_timestamped.py");

  try {
    await writeFile(audioPath, Buffer.from(await file.arrayBuffer()));
    const result = await runPython(scriptPath, audioPath);
    if (result.code !== 0) {
      let message = result.stderr.trim() || "Local whisper-timestamped transcription failed.";
      try {
        message = JSON.parse(message).error ?? message;
      } catch {
        // keep raw stderr
      }
      throw new Error(message);
    }

    const raw = JSON.parse(result.stdout) as {
      text?: string;
      segments?: Array<{ words?: unknown[] }>;
      speech_activity?: unknown[];
    };

    const words = collectWords(raw);

    return {
      raw,
      artifact: {
        text: raw.text ?? "",
        source: "whisper-timestamped",
        capturedAt: new Date().toISOString(),
        segments: raw.segments ?? [],
        words,
        speechActivity: raw.speech_activity ?? [],
        disfluencies: collectDisfluencies(words)
      }
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
