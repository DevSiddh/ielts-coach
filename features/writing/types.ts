export type WritingTaskType = "academic-task-2";

export type WritingPrompt = {
  id: string;
  taskType: WritingTaskType;
  theme: "education" | "technology" | "environment" | "work" | "society" | "health" | "custom";
  title: string;
  question: string;
  instruction: string;
  planningHints: string[];
};

export type WritingCriterionScores = {
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammarAccuracy: number;
};

export type WritingEvidence = {
  wordCount: number;
  paragraphCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  sentenceLengthRange: number;
  repeatedWords: Array<{ word: string; count: number }>;
  missingConclusion: boolean;
  unclearOpinion: boolean;
  weakLinking: boolean;
  bodyParagraphCount: number;
  timing: WritingTimingEvidence;
};

export type WritingEvaluation = {
  label: "Practice estimate";
  overallBand: number;
  criteria: WritingCriterionScores;
  evidence: WritingEvidence;
  summary: string;
  mainIssue: string;
  retryTarget: string;
  improvements: string[];
  criterionEvidence: Array<{
    criterion: keyof WritingCriterionScores | "timeManagement";
    label: string;
    score: number;
    evidence: string[];
  }>;
  retryChecklist: string[];
};

export type SavedWritingAttempt = {
  id: string;
  createdAt: string;
  prompt: WritingPrompt;
  plan: string;
  essay: string;
  timeSpentSeconds?: number;
  evaluation: WritingEvaluation;
};
import type { WritingTimingEvidence } from "./timing.ts";
