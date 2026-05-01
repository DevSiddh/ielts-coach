import type { ConversationCritique, ImprovementTarget } from "./types.ts";

const FILLERS = ["um", "uh", "ah", "er", "like", "you know"];
const WEAK_WORDS = ["good", "nice", "bad", "very"];
const FALLBACK_FOLLOW_UP = "Can you give a personal example?";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w'\s]/g, " ").replace(/\s+/g, " ").trim();
}

function words(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

function countWord(text: string, word: string) {
  return words(text).filter((item) => item === word).length;
}

function countFillers(text: string) {
  const lower = normalize(text);
  return FILLERS.reduce((count, filler) => {
    if (filler.includes(" ")) return count + (lower.includes(filler) ? 1 : 0);
    return count + countWord(lower, filler);
  }, 0);
}

function weakWordEvidence(text: string) {
  return WEAK_WORDS.map((word) => ({ word, count: countWord(text, word) })).filter((item) => item.count >= 2);
}

function falseStarts(text: string) {
  const lower = normalize(text);
  return (lower.match(/\b(i|and|because|but|so|it|we)\s+\1\b/g) ?? []).map((item) => item.trim());
}

function topicFromQuestion(question: string) {
  const cleaned = question.replace(/[?.,]/g, "").trim();
  const wordsInQuestion = cleaned.split(/\s+/).filter(Boolean);
  return wordsInQuestion.slice(-4).join(" ") || "this topic";
}

function upgradeWeakWords(text: string) {
  return text
    .replace(/\bgood\b/gi, "useful")
    .replace(/\bnice\b/gi, "enjoyable")
    .replace(/\bbad\b/gi, "frustrating")
    .replace(/\bvery\b/gi, "quite")
    .replace(/\bplace\b/gi, "area")
    .replace(/\bpeople are useful\b/gi, "people are friendly and supportive");
}

function upgradedAnswer(target: ImprovementTarget, question: string, transcript: string) {
  const topic = topicFromQuestion(question);
  const cleaned = transcript.trim();

  if (target === "development") {
    return `I think ${topic} is important because it affects daily life. For example, it can change how people spend their time and make decisions.`;
  }
  if (target === "vocabulary") {
    return upgradeWeakWords(cleaned || `I think ${topic} is useful because it makes daily life more convenient.`);
  }
  if (target === "fluency") {
    return `I think ${topic} matters because it connects to daily life. For example, it can make things easier, so overall it is worth discussing.`;
  }
  if (target === "recovery") {
    return `I think ${topic} is worth talking about because it has a clear effect on people. For example, it can influence their routine and choices.`;
  }
  return `I think ${topic} matters because it has a practical effect. For example, it can influence daily life. Overall, it depends on the situation.`;
}

export function buildConversationCritique(input: {
  question: string;
  transcript: string;
  followUps?: string[];
}): ConversationCritique {
  const wordCount = words(input.transcript).length;
  const fillerCount = countFillers(input.transcript);
  const weakWords = weakWordEvidence(input.transcript);
  const starts = falseStarts(input.transcript);

  let target: ImprovementTarget = "structure";
  const evidence: string[] = [];

  if (wordCount < 12) {
    target = "development";
    evidence.push(`Only ${wordCount} words detected.`);
  } else if (weakWords.length) {
    target = "vocabulary";
    evidence.push(...weakWords.map((item) => `Repeated "${item.word}" ${item.count} times.`));
  } else if (fillerCount >= 3) {
    target = "fluency";
    evidence.push(`Detected ${fillerCount} filler words.`);
  } else if (starts.length) {
    target = "recovery";
    evidence.push(`Repeated start detected: "${starts[0]}".`);
  } else {
    evidence.push("Answer needs a clearer answer -> reason -> example shape.");
  }

  const feedbackByTarget: Record<ImprovementTarget, string> = {
    development: "Good start, but the answer is too short. Add one reason and one example.",
    vocabulary: "The idea is understandable, but repeated simple words weaken the answer. Use more precise vocabulary.",
    fluency: "The answer has too many fillers. Slow down and continue in one smoother sentence.",
    recovery: "You restarted the sentence. Recover with a short phrase, then continue the idea.",
    structure: "The answer is clear enough, but organize it with answer, reason, example, and close."
  };

  const retryPromptByTarget: Record<ImprovementTarget, string> = {
    development: "Try again with at least two sentences and one example.",
    vocabulary: "Try again using two stronger adjectives instead of weak repeated words.",
    fluency: "Try again in one smoother answer with fewer fillers.",
    recovery: "Try again using a recovery phrase, then complete the idea.",
    structure: "Try again using: answer -> reason -> example -> close."
  };

  return {
    target,
    evidence,
    feedback: feedbackByTarget[target],
    upgradedAnswer: upgradedAnswer(target, input.question, input.transcript),
    retryPrompt: retryPromptByTarget[target],
    followUp: input.followUps?.[0] ?? FALLBACK_FOLLOW_UP
  };
}
