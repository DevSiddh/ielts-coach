import type { WritingCriterionScores, WritingEvaluation, WritingPrompt } from "./types";
import { WRITING_TASK_2_TARGET_SECONDS, buildWritingTimingEvidence } from "./timing.ts";

const OPINION_MARKERS = [
  "i agree",
  "i disagree",
  "in my opinion",
  "in my view",
  "i believe",
  "i think",
  "this essay will argue",
  "the advantages outweigh",
  "the disadvantages outweigh"
];

const CONCLUSION_MARKERS = ["in conclusion", "to conclude", "overall", "to sum up"];
const LINKING_WORDS = [
  "however",
  "therefore",
  "moreover",
  "furthermore",
  "although",
  "whereas",
  "for example",
  "for instance",
  "as a result",
  "on the other hand",
  "nevertheless",
  "consequently"
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "this",
  "with",
  "from",
  "have",
  "has",
  "are",
  "was",
  "were",
  "for",
  "people",
  "their",
  "there",
  "because",
  "which",
  "will",
  "can",
  "should",
  "would",
  "could",
  "more",
  "some",
  "many",
  "also",
  "than",
  "into",
  "about"
]);

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w'\s]/g, " ").replace(/\s+/g, " ").trim();
}

function words(text: string) {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function sentences(text: string) {
  return text
    .split(/[.!?]+/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function toBand(raw: number) {
  return roundHalf(clamp(raw, 3, 8.5));
}

function includesAny(text: string, markers: string[]) {
  const normalized = normalize(text);
  return markers.some((marker) => normalized.includes(marker));
}

function countLinkers(text: string) {
  const normalized = normalize(text);
  return LINKING_WORDS.reduce((count, linker) => count + (normalized.includes(linker) ? 1 : 0), 0);
}

function repeatedWords(wordList: string[]) {
  const counts = new Map<string, number>();
  wordList
    .filter((word) => word.length >= 5 && !STOP_WORDS.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 4)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);
}

function topicRelevanceScore(prompt: WritingPrompt, essayWords: string[]) {
  const promptWords = new Set(words(prompt.question).filter((word) => word.length > 5 && !STOP_WORDS.has(word)));
  let hits = 0;
  promptWords.forEach((word) => {
    if (essayWords.includes(word)) hits += 1;
  });
  return hits;
}

function formatBand(score: number) {
  return score.toFixed(1);
}

export function evaluateWriting({
  prompt,
  essay,
  timeSpentSeconds
}: {
  prompt: WritingPrompt;
  essay: string;
  timeSpentSeconds?: number;
}): WritingEvaluation {
  const wordList = words(essay);
  const paragraphList = paragraphs(essay);
  const sentenceList = sentences(essay);
  const sentenceLengths = sentenceList.map((sentence) => words(sentence).length).filter(Boolean);
  const wordCount = wordList.length;
  const paragraphCount = paragraphList.length;
  const sentenceCount = sentenceList.length;
  const averageSentenceLength = sentenceLengths.length
    ? sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceLengths.length
    : 0;
  const sentenceLengthRange = sentenceLengths.length ? Math.max(...sentenceLengths) - Math.min(...sentenceLengths) : 0;
  const bodyParagraphCount = Math.max(0, paragraphCount - 2);
  const repeated = repeatedWords(wordList);
  const missingConclusion = !includesAny(paragraphList.at(-1) ?? essay, CONCLUSION_MARKERS);
  const unclearOpinion = !includesAny(essay, OPINION_MARKERS);
  const linkerCount = countLinkers(essay);
  const weakLinking = linkerCount < 3;
  const relevanceHits = topicRelevanceScore(prompt, wordList);
  const hasEnoughWords = wordCount >= 250;
  const hasBalancedStructure = paragraphCount >= 4 && bodyParagraphCount >= 2;
  const hasSentenceVariety = sentenceLengthRange >= 10 && averageSentenceLength >= 10 && averageSentenceLength <= 28;
  const repetitionPenalty = Math.min(1.5, repeated.reduce((sum, item) => sum + Math.max(0, item.count - 3) * 0.2, 0));
  const timing = buildWritingTimingEvidence({ wordCount, timeSpentSeconds });

  const taskResponse = toBand(
    5.5 +
      (hasEnoughWords ? 0.8 : -1.2) +
      (unclearOpinion ? -1 : 0.5) +
      (missingConclusion ? -0.7 : 0.4) +
      Math.min(0.8, relevanceHits * 0.12)
  );
  const coherenceCohesion = toBand(
    5.2 +
      (hasBalancedStructure ? 1 : -1.1) +
      (weakLinking ? -0.8 : 0.7) +
      (paragraphCount >= 3 ? 0.3 : -0.7) +
      (missingConclusion ? -0.3 : 0.2)
  );
  const lexicalResource = toBand(
    5.4 +
      Math.min(0.9, new Set(wordList).size / Math.max(1, wordCount) * 2) +
      (repeated.length ? -repetitionPenalty : 0.4) +
      Math.min(0.5, relevanceHits * 0.08)
  );
  const grammarAccuracy = toBand(
    5.3 +
      (sentenceCount >= 8 ? 0.6 : -0.5) +
      (hasSentenceVariety ? 0.9 : -0.7) +
      (averageSentenceLength > 32 ? -0.6 : 0) +
      (averageSentenceLength < 8 && wordCount > 80 ? -0.4 : 0)
  );

  const criteria: WritingCriterionScores = {
    taskResponse,
    coherenceCohesion,
    lexicalResource,
    grammarAccuracy
  };

  let overallBand = roundHalf((taskResponse + coherenceCohesion + lexicalResource + grammarAccuracy) / 4);
  if (wordCount < 250) overallBand = Math.min(overallBand, 5.5);
  if (wordCount < 180) overallBand = Math.min(overallBand, 5);
  if (paragraphCount <= 1) overallBand = Math.min(overallBand, 5);
  if (unclearOpinion && missingConclusion) overallBand = Math.min(overallBand, 5.5);
  if (timing.timingStatus === "over-time") overallBand = Math.min(overallBand, 6);
  if ((timing.timingStatus === "near-limit" || timing.timingStatus === "slow") && wordCount < 250) {
    overallBand = Math.min(overallBand, 5.5);
  }

  const issues = [
    timing.timingStatus === "not-timed" ? "" : timing.timingWarning ?? "",
    wordCount < 250 ? `Essay is under 250 words (${wordCount} words).` : "",
    paragraphCount <= 1 ? "Essay is written as one paragraph." : "",
    !hasBalancedStructure ? `Structure needs at least four clear paragraphs; detected ${paragraphCount}.` : "",
    unclearOpinion ? "Opinion or position is unclear." : "",
    missingConclusion ? "Conclusion is missing or not signposted." : "",
    weakLinking ? `Linking is weak; detected ${linkerCount} strong linking signal${linkerCount === 1 ? "" : "s"}.` : "",
    repeated.length ? `Repeated vocabulary: ${repeated.slice(0, 3).map((item) => `${item.word} (${item.count})`).join(", ")}.` : "",
    !hasSentenceVariety ? "Sentence length variety is limited." : ""
  ].filter(Boolean);

  const mainIssue = issues[0] ?? "The essay is usable; now improve precision, examples, and paragraph control.";
  const retryTarget =
    timing.timingStatus === "near-limit" || timing.timingStatus === "slow"
      ? "Use the first 5 minutes to plan quickly, then reach 250 words before the 40-minute mark."
      : timing.timingStatus === "over-time"
        ? "Finish the next draft inside 40 minutes before adding extra refinement."
        : wordCount < 250
      ? "Rewrite to at least 250 words with four paragraphs."
      : unclearOpinion
        ? "Make your opinion clear in the introduction and repeat it in the conclusion."
        : missingConclusion
          ? "Add a clear conclusion that summarizes your position."
          : weakLinking
            ? "Use clearer linking between body paragraph ideas."
            : repeated.length
              ? `Replace repeated words such as ${repeated[0].word}.`
              : "Add one more specific example and tighten the conclusion.";

  const evidence = {
    wordCount,
    paragraphCount,
    sentenceCount,
    averageSentenceLength: Number(averageSentenceLength.toFixed(1)),
    sentenceLengthRange,
    repeatedWords: repeated,
    missingConclusion,
    unclearOpinion,
    weakLinking,
    bodyParagraphCount,
    timing
  };

  return {
    label: "Practice estimate",
    overallBand,
    criteria,
    evidence,
    summary: `Practice estimate ${formatBand(overallBand)}. This is based on visible writing evidence such as word count, paragraphing, opinion clarity, linking, repetition, sentence variety, and Task 2 timing pace.`,
    mainIssue,
    retryTarget,
    improvements: issues.length
      ? issues
      : ["Add a more specific example.", "Use more precise topic vocabulary.", "Make the conclusion sharper."],
    criterionEvidence: [
      {
        criterion: "taskResponse",
        label: "Task Response",
        score: taskResponse,
        evidence: [
          `${wordCount} words${hasEnoughWords ? " meets" : " is below"} the 250-word target.`,
          timeSpentSeconds
            ? `Timing: ${Math.round(timeSpentSeconds / 60)} minutes used out of ${WRITING_TASK_2_TARGET_SECONDS / 60}.`
            : "Timing: timer was not used.",
          unclearOpinion ? "Opinion is not clearly stated." : "Opinion is clearly signposted.",
          missingConclusion ? "Conclusion is missing or unclear." : "Conclusion is signposted.",
          `${relevanceHits} topic relevance signal${relevanceHits === 1 ? "" : "s"} found.`
        ]
      },
      {
        criterion: "coherenceCohesion",
        label: "Coherence and Cohesion",
        score: coherenceCohesion,
        evidence: [
          `${paragraphCount} paragraph${paragraphCount === 1 ? "" : "s"} detected.`,
          `${bodyParagraphCount} body paragraph${bodyParagraphCount === 1 ? "" : "s"} estimated.`,
          weakLinking ? `Only ${linkerCount} strong linking signal${linkerCount === 1 ? "" : "s"} detected.` : `${linkerCount} linking signals detected.`
        ]
      },
      {
        criterion: "timeManagement",
        label: "Time management",
        score: overallBand,
        evidence: [
          timeSpentSeconds ? `${timeSpentSeconds} seconds spent on this attempt.` : "Attempt was not timed.",
          typeof timing.wordsPerMinute === "number" ? `${timing.wordsPerMinute} writing WPM.` : "Writing pace is unavailable.",
          typeof timing.projectedWordsAtTarget === "number"
            ? `Projected ${timing.projectedWordsAtTarget} words at 40 minutes.`
            : "Projected completion is unavailable.",
          timing.timingWarning ?? "Timing pace is on track for a Task 2 coaching attempt."
        ]
      },
      {
        criterion: "lexicalResource",
        label: "Lexical Resource",
        score: lexicalResource,
        evidence: repeated.length
          ? repeated.map((item) => `"${item.word}" repeated ${item.count} times.`)
          : ["No major repeated vocabulary pattern was detected."]
      },
      {
        criterion: "grammarAccuracy",
        label: "Grammatical Range and Accuracy",
        score: grammarAccuracy,
        evidence: [
          `${sentenceCount} sentence${sentenceCount === 1 ? "" : "s"} detected.`,
          `Average sentence length is ${evidence.averageSentenceLength} words.`,
          `Sentence length range is ${sentenceLengthRange} words.`
        ]
      }
    ],
    retryChecklist: [
      "Write four paragraphs: introduction, two body paragraphs, conclusion.",
      "State your position clearly in the introduction.",
      "Use at least three strong linking phrases.",
      "Add one specific example in each body paragraph.",
      "Check repeated words before evaluating again."
    ]
  };
}
