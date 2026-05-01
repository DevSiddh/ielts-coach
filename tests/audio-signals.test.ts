import test from "node:test";
import assert from "node:assert/strict";

import path from "node:path";

import { extractAudioSignals, resolveFfmpegPath } from "../features/speaking/audio-signals.ts";

function wavHeader(dataLength: number, sampleRate: number) {
  const buffer = Buffer.alloc(44);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

function testWav() {
  const sampleRate = 8000;
  const samples = [
    ...Array.from({ length: sampleRate }, (_, index) => Math.sin(index / 8) * 0.08),
    ...Array.from({ length: sampleRate }, () => 0),
    ...Array.from({ length: sampleRate }, (_, index) => Math.sin(index / 8) * 0.08)
  ];
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, index) => {
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), index * 2);
  });
  return Buffer.concat([wavHeader(data.length, sampleRate), data]);
}

test("extractAudioSignals detects long pauses in wav audio", async () => {
  const signals = await extractAudioSignals({
    bytes: testWav(),
    extension: "wav"
  });

  assert.equal(signals.source, "local-wav-rms");
  assert.equal(signals.longPauseCount >= 1, true);
  assert.equal(signals.pauseCount >= 1, true);
  assert.equal(signals.speechRatio < 1, true);
});

test("resolveFfmpegPath prefers explicit environment override", () => {
  const previous = process.env.IELTS_COACH_FFMPEG;
  process.env.IELTS_COACH_FFMPEG = "C:\\custom\\ffmpeg.exe";

  try {
    assert.equal(resolveFfmpegPath(), "C:\\custom\\ffmpeg.exe");
  } finally {
    if (previous === undefined) {
      delete process.env.IELTS_COACH_FFMPEG;
    } else {
      process.env.IELTS_COACH_FFMPEG = previous;
    }
  }
});

test("resolveFfmpegPath uses bundled ffmpeg when no override is set", () => {
  const previous = process.env.IELTS_COACH_FFMPEG;
  delete process.env.IELTS_COACH_FFMPEG;

  try {
    assert.equal(
      resolveFfmpegPath(),
      path.join(process.cwd(), "ffmpeg-8.1-essentials_build", "bin", "ffmpeg.exe")
    );
  } finally {
    if (previous !== undefined) {
      process.env.IELTS_COACH_FFMPEG = previous;
    }
  }
});
