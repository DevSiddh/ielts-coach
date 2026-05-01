import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import type { AudioSignals } from "./types";

const BUNDLED_FFMPEG_PATH = path.join(process.cwd(), "ffmpeg-8.1-essentials_build", "bin", "ffmpeg.exe");

export function resolveFfmpegPath() {
  if (process.env.IELTS_COACH_FFMPEG) return process.env.IELTS_COACH_FFMPEG;
  if (existsSync(BUNDLED_FFMPEG_PATH)) return BUNDLED_FFMPEG_PATH;
  return "ffmpeg";
}

function runPython(scriptPath: string, audioPath: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const python = process.env.IELTS_COACH_PYTHON ?? "python";
    const child = spawn(python, [scriptPath, audioPath], {
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

function runFfmpeg(inputPath: string, outputPath: string): Promise<{ stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const ffmpeg = resolveFfmpegPath();
    const child = spawn(ffmpeg, ["-y", "-i", inputPath, "-ac", "1", "-ar", "16000", "-f", "wav", outputPath], {
      cwd: process.cwd(),
      windowsHide: true
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({ stderr, code }));
    child.on("error", (error) => resolve({ stderr: error.message, code: 1 }));
  });
}

function emptySignals(source: string, setupNote: string): AudioSignals {
  return {
    source,
    durationSeconds: 0,
    speechSeconds: 0,
    silenceSeconds: 0,
    speechRatio: 0,
    longPauses: [],
    pauseCount: 0,
    longPauseCount: 0,
    hesitationClusters: [],
    setupNote
  };
}

export async function extractAudioSignals(audio: { bytes: Buffer; extension: string }): Promise<AudioSignals> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ielts-audio-signals-"));
  const extension = audio.extension.toLowerCase();
  const audioPath = path.join(tempDir, `audio.${extension}`);
  const wavPath = extension === "wav" ? audioPath : path.join(tempDir, "audio.wav");
  const scriptPath = path.join(process.cwd(), "scripts", "extract_audio_signals.py");

  try {
    await writeFile(audioPath, audio.bytes);
    if (extension !== "wav") {
      const conversion = await runFfmpeg(audioPath, wavPath);
      if (conversion.code !== 0) {
        return emptySignals(
          "ffmpeg-unavailable",
          `Could not convert ${extension.toUpperCase()} audio. Expected bundled FFmpeg at ${BUNDLED_FFMPEG_PATH}, or set IELTS_COACH_FFMPEG to a working ffmpeg.exe path.`
        );
      }
    }

    const result = await runPython(scriptPath, wavPath);
    if (result.code !== 0) {
      return emptySignals("error", result.stderr.trim() || "Audio signal extraction failed.");
    }
    const signals = JSON.parse(result.stdout) as AudioSignals;
    return {
      ...signals,
      source: extension === "wav" ? signals.source : `${signals.source}-via-ffmpeg`
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
