import type { SpeakingPrompt } from "./types";
import { ieltsSpeaking2026 } from "./ielts-2026.ts";

export type SpeakingTimingInsight = {
  label: string;
  target: string;
  status: "not-timed" | "short" | "on-track" | "long" | "pace-risk";
  wpm: number;
  evidence: string[];
};

function targetForPart(part: SpeakingPrompt["part"]) {
  if (part === 1) {
    return {
      label: "Part 1 timing",
      target: ieltsSpeaking2026.parts[1].practiceTarget,
      min: 20,
      max: 45
    };
  }
  if (part === 2) {
    return {
      label: "Part 2 long turn",
      target: ieltsSpeaking2026.parts[2].practiceTarget,
      min: 60,
      max: 120
    };
  }
  return {
    label: "Part 3 timing",
    target: ieltsSpeaking2026.parts[3].practiceTarget,
    min: 45,
    max: 75
  };
}

export function buildSpeakingTimingInsight({
  prompt,
  durationSeconds,
  wordCount
}: {
  prompt: Pick<SpeakingPrompt, "part">;
  durationSeconds: number;
  wordCount: number;
}): SpeakingTimingInsight {
  const timingTarget = targetForPart(prompt.part);
  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  if (!durationSeconds) {
    return {
      label: timingTarget.label,
      target: timingTarget.target,
      status: "not-timed",
      wpm,
      evidence: ["No recording duration was captured for this attempt."]
    };
  }

  const evidence = [
    `${durationSeconds} seconds recorded.`,
    wordCount ? `${wordCount} words, about ${wpm} WPM.` : "No word count available."
  ];

  if (wpm && (wpm < 90 || wpm > 185)) {
    return {
      label: timingTarget.label,
      target: timingTarget.target,
      status: "pace-risk",
      wpm,
      evidence: [...evidence, "Pacing is outside the strongest speaking range."]
    };
  }

  if (durationSeconds < timingTarget.min) {
    return {
      label: timingTarget.label,
      target: timingTarget.target,
      status: "short",
      wpm,
      evidence: [...evidence, "Answer is short for this IELTS speaking part."]
    };
  }

  if (durationSeconds > timingTarget.max) {
    return {
      label: timingTarget.label,
      target: timingTarget.target,
      status: "long",
      wpm,
      evidence: [...evidence, "Answer is longer than the ideal practice target for this part."]
    };
  }

  return {
    label: timingTarget.label,
    target: timingTarget.target,
    status: "on-track",
    wpm,
    evidence: [...evidence, "Timing is inside the coaching target for this part."]
  };
}
