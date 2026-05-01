export type StrategyCategory =
  | "part1-personal"
  | "part2-person"
  | "part2-place"
  | "part2-object"
  | "part2-event"
  | "part3-opinion"
  | "part3-compare"
  | "part3-causes-solutions";

export type SpeakingStrategy = {
  id: StrategyCategory;
  label: string;
  focus: string;
  idealLength: string;
  openingOptions: string[];
  structure: string[];
  developmentMoves: string[];
  rescueLines: string[];
  highBandPhrases: string[];
  commonMistakes: string[];
  upgradeTips: string[];
  bandLadders: {
    band6: string[];
    band7: string[];
    band8: string[];
  };
};

export type SpeakingPrompt = {
  id: string;
  part: 1 | 2 | 3;
  difficulty: "easy" | "medium" | "hard";
  strategyCategory: StrategyCategory;
  title: string;
  question: string;
  followUps: string[];
  sourceLabel: string;
  sourceType:
    | "official-sample"
    | "reported-recent"
    | "common-recurring"
    | "verified-2026"
    | "surprise-drill"
    | "custom";
  sourceUrl: string;
  yearLabel: string;
  answerFrame: string[];
  whatGoodLooksLike: string[];
  improvementTips: string[];
  referenceLinks: Array<{
    label: string;
    url: string;
  }>;
};

export type CriterionScores = {
  fluency: number;
  grammar: number;
  lexical: number;
  pronunciation: number;
};

export type SpeakingEvaluation = {
  overallBand: number;
  criteria: CriterionScores;
  fillers: string[];
  strengths: string[];
  fixes: string[];
  summary: string;
  improvedAnswer: string;
  voiceScript: string;
  durationSeconds: number;
  wordCount: number;
  blockers: string[];
  whyThisScore: string[];
  keywordSuggestions: string[];
  approachPlan: string[];
  nextTryFocus: string;
};

export type TranscriptArtifact = {
  text: string;
  source:
    | "browser-speech"
    | "deepgram"
    | "whisper"
    | "whisper-timestamped"
    | "groq-whisper"
    | "manual"
    | "mixed";
  capturedAt: string;
  segments?: unknown[];
  words?: unknown[];
  speechActivity?: unknown[];
  disfluencies?: unknown[];
};

export type EvidenceSignals = {
  source: "dual-transcript" | "single-transcript";
  scoringTranscriptSource: TranscriptArtifact["source"];
  fillerWords: string[];
  fillerWordCount: number;
  repeatedPhrases: string[];
  restartSignals: string[];
  transcriptPauseCount: number;
  transcriptLongPauseCount: number;
  maxTranscriptPauseSeconds: number;
  hesitationClusterCount: number;
  lowConfidenceWordCount: number;
  lowConfidenceWords: string[];
  averageWordConfidence?: number;
  clarityRisks: string[];
  evidenceNotes: string[];
};

export type SpeakingSignals = {
  fillerWords: string[];
  wordCount: number;
  durationSeconds: number;
  whyThisScore: string[];
  nextTryFocus: string;
};

export type AudioPause = {
  start: number;
  end: number;
  duration: number;
};

export type HesitationCluster = {
  start: number;
  end: number;
  pauseDuration: number;
};

export type AudioSignals = {
  source: string;
  durationSeconds: number;
  speechSeconds: number;
  silenceSeconds: number;
  speechRatio: number;
  longPauses: AudioPause[];
  pauseCount: number;
  longPauseCount: number;
  hesitationClusters: HesitationCluster[];
  setupNote?: string;
};

export type SavedAttempt = {
  id: string;
  createdAt: string;
  prompt: SpeakingPrompt;
  transcript: string;
  rawTranscript?: TranscriptArtifact;
  browserTranscript?: TranscriptArtifact;
  serviceTranscript?: TranscriptArtifact;
  whisperTranscript?: TranscriptArtifact;
  cleanTranscript?: TranscriptArtifact;
  evidenceSignals?: EvidenceSignals;
  signals?: SpeakingSignals;
  audioSignals?: AudioSignals;
  hasAudio?: boolean;
  durationSeconds: number;
  evaluation: SpeakingEvaluation;
};
