import type { EvidenceSignals, TranscriptArtifact } from "./types";

const FILLER_PATTERNS = [
  { label: "uh", pattern: /\bu+h+\b/g },
  { label: "um", pattern: /\bu+m+\b/g },
  { label: "ah", pattern: /\ba+h+\b/g },
  { label: "er", pattern: /\be+r+\b/g },
  { label: "err", pattern: /\be+r+r+\b/g },
  { label: "hmm", pattern: /\bh+m+\b/g },
  { label: "huh", pattern: /\bh+u+h+\b/g },
  { label: "like", pattern: /\blike\b/g }
];

const CLARITY_RISK_PATTERNS = [
  { label: "live/leave clarity risk", pattern: /\bplace to leave\b|\bgood place to leave\b/g },
  { label: "improve/approve clarity risk", pattern: /\bapproved public transport\b|\bapprove public transport\b/g },
  { label: "each other clarity risk", pattern: /\bhelp each of them\b|\bhelp with each other\b/g },
  { label: "buy/bought clarity risk", pattern: /\bwe buy we buy\b|\bwe buy it we buy it\b/g }
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w'\s]/g, " ").replace(/\s+/g, " ").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

type TimedWord = {
  text: string;
  start?: number;
  end?: number;
  confidence?: number;
};

function findLabels(text: string, patterns: Array<{ label: string; pattern: RegExp }>) {
  const lower = normalize(text);
  return patterns.filter((item) => item.pattern.test(lower)).map((item) => item.label);
}

function countLabelOccurrences(text: string, label: string) {
  const lower = normalize(text);
  if (label.includes(" ")) {
    return (lower.match(new RegExp(`\\b${label.replace(/\s+/g, "\\s+")}\\b`, "g")) || []).length;
  }
  return lower.split(" ").reduce((count, token) => count + (token === label ? 1 : 0), 0);
}

function findRepeatedPhrases(text: string) {
  const lower = normalize(text);
  const repeats: string[] = [];
  const matches = lower.match(/\b([a-z]+(?:\s+[a-z]+){0,3})\s+\1\b/g) ?? [];
  repeats.push(...matches);
  if (/\bwe buy(?: it)?\s+we buy(?: it)?\b/.test(lower)) repeats.push("we buy / we buy");
  if (/\band\s+and\b/.test(lower)) repeats.push("and and");
  if (/\bbut\s+but\b/.test(lower)) repeats.push("but but");
  return unique(repeats);
}

function findRestartSignals(text: string) {
  const lower = normalize(text);
  const signals = [];
  if (/\bi mean\b/.test(lower)) signals.push("I mean");
  if (/\bsorry\b/.test(lower)) signals.push("sorry/self-correction");
  if (/\bit is\s+it is\b|\bis it\s+it is\b|\bis it is\b/.test(lower)) signals.push("it is restart");
  if (/\bi sometimes\b|\bsome i sometimes\b/.test(lower)) signals.push("I sometimes restart");
  return signals;
}

function readWordText(word: Record<string, unknown>) {
  if (typeof word.punctuated_word === "string") return word.punctuated_word;
  if (typeof word.word === "string") return word.word;
  if (typeof word.text === "string") return word.text;
  return "";
}

function toTimedWords(artifact?: TranscriptArtifact) {
  if (!artifact?.words?.length) return [] as TimedWord[];
  return artifact.words.flatMap((word) => {
    if (!word || typeof word !== "object") return [];
    const record = word as Record<string, unknown>;
    const text = readWordText(record).trim();
    if (!text) return [];
    return [
      {
        text,
        start: typeof record.start === "number" ? record.start : undefined,
        end: typeof record.end === "number" ? record.end : undefined,
        confidence:
          typeof record.confidence === "number"
            ? record.confidence
            : typeof record.probability === "number"
              ? record.probability
              : typeof record.prob === "number"
                ? record.prob
                : undefined
      }
    ];
  });
}

function summarizeTiming(words: TimedWord[]) {
  if (words.length < 2) {
    return {
      pauseCount: 0,
      longPauseCount: 0,
      maxPauseSeconds: 0,
      hesitationClusterCount: 0
    };
  }

  let pauseCount = 0;
  let longPauseCount = 0;
  let maxPauseSeconds = 0;
  let hesitationClusterCount = 0;
  let activeCluster = false;

  for (let index = 1; index < words.length; index += 1) {
    const previous = words[index - 1];
    const current = words[index];
    if (typeof previous.end !== "number" || typeof current.start !== "number") continue;
    const gap = Number((current.start - previous.end).toFixed(3));
    if (gap < 0.25) {
      activeCluster = false;
      continue;
    }
    pauseCount += 1;
    maxPauseSeconds = Math.max(maxPauseSeconds, gap);
    if (gap >= 0.9) longPauseCount += 1;
    const previousText = previous.text.toLowerCase();
    const currentText = current.text.toLowerCase();
    const aroundFillers = /\b(uh|um|ah|er|err|hmm|like)\b/.test(previousText) || /\b(uh|um|ah|er|err|hmm|like)\b/.test(currentText);
    if (gap >= 0.6 || aroundFillers) {
      if (!activeCluster) {
        hesitationClusterCount += 1;
        activeCluster = true;
      }
    } else {
      activeCluster = false;
    }
  }

  return {
    pauseCount,
    longPauseCount,
    maxPauseSeconds: Number(maxPauseSeconds.toFixed(2)),
    hesitationClusterCount
  };
}

function summarizeConfidence(words: TimedWord[]) {
  const confidenceWords = words.filter((word) => typeof word.confidence === "number");
  if (!confidenceWords.length) {
    return {
      lowConfidenceWordCount: 0,
      lowConfidenceWords: [] as string[],
      averageWordConfidence: undefined as number | undefined
    };
  }

  const lowConfidenceWords = unique(
    confidenceWords
      .filter((word) => (word.confidence ?? 1) < 0.72)
      .map((word) => word.text.toLowerCase())
      .slice(0, 8)
  );
  const averageWordConfidence =
    confidenceWords.reduce((sum, word) => sum + (word.confidence ?? 0), 0) / confidenceWords.length;

  return {
    lowConfidenceWordCount: confidenceWords.filter((word) => (word.confidence ?? 1) < 0.72).length,
    lowConfidenceWords,
    averageWordConfidence: Number(averageWordConfidence.toFixed(3))
  };
}

export function buildEvidenceSignals({
  scoringTranscript,
  browserTranscript,
  serviceTranscript,
  whisperTranscript
}: {
  scoringTranscript: TranscriptArtifact;
  browserTranscript?: TranscriptArtifact;
  serviceTranscript?: TranscriptArtifact;
  whisperTranscript?: TranscriptArtifact;
}): EvidenceSignals {
  const transcripts = [scoringTranscript, browserTranscript, serviceTranscript, whisperTranscript].filter(
    (item): item is TranscriptArtifact => Boolean(item?.text)
  );
  const combinedText = transcripts.map((item) => item.text).join(" ");
  const comparisonTranscript = serviceTranscript ?? whisperTranscript;
  const hasDualTranscript = Boolean(browserTranscript?.text && comparisonTranscript?.text);
  const fillerWords = unique(transcripts.flatMap((item) => findLabels(item.text, FILLER_PATTERNS)));
  const fillerWordCount = transcripts.reduce(
    (count, item) => count + findLabels(item.text, FILLER_PATTERNS).reduce((sum, label) => sum + countLabelOccurrences(item.text, label), 0),
    0
  );
  const repeatedPhrases = unique(transcripts.flatMap((item) => findRepeatedPhrases(item.text)));
  const restartSignals = unique(transcripts.flatMap((item) => findRestartSignals(item.text)));
  const clarityRisks = unique(findLabels(combinedText, CLARITY_RISK_PATTERNS));
  const timedWords = toTimedWords(scoringTranscript);
  const timing = summarizeTiming(timedWords);
  const confidence = summarizeConfidence(timedWords);
  const evidenceNotes = [
    hasDualTranscript
      ? "Browser and service transcripts were both preserved and compared."
      : "Only one transcript source was available for evidence extraction.",
    timing.pauseCount
      ? `Transcript timing detected ${timing.pauseCount} pause gaps, including ${timing.longPauseCount} long gaps.`
      : "Transcript timing did not include meaningful pause-gap evidence.",
    confidence.lowConfidenceWordCount
      ? `${confidence.lowConfidenceWordCount} lower-confidence word(s) were detected in the scoring transcript.`
      : "No lower-confidence words were detected from transcript timing metadata.",
    clarityRisks.length
      ? "Transcript disagreement or suspicious wording suggests pronunciation or clarity risk."
      : "No obvious transcript-based clarity-risk phrase was detected."
  ];

  return {
    source: hasDualTranscript ? "dual-transcript" : "single-transcript",
    scoringTranscriptSource: scoringTranscript.source,
    fillerWords,
    fillerWordCount,
    repeatedPhrases,
    restartSignals,
    transcriptPauseCount: timing.pauseCount,
    transcriptLongPauseCount: timing.longPauseCount,
    maxTranscriptPauseSeconds: timing.maxPauseSeconds,
    hesitationClusterCount: timing.hesitationClusterCount,
    lowConfidenceWordCount: confidence.lowConfidenceWordCount,
    lowConfidenceWords: confidence.lowConfidenceWords,
    averageWordConfidence: confidence.averageWordConfidence,
    clarityRisks,
    evidenceNotes
  };
}
