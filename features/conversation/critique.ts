import type { ConversationCritique, ImprovementTarget } from "./types.ts";

const FILLERS = ["um", "uh", "ah", "er", "like", "you know"];
const WEAK_WORDS = ["good", "nice", "bad", "very"];
const FALLBACK_FOLLOW_UP = "Can you give a personal example?";
const DEVELOPMENT_MIN_WORDS_BY_PART = {
  1: 18,
  2: 75,
  3: 45
} as const;

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

function partLabel(part: number) {
  if (part === 2) return "Part 2 long turn";
  if (part === 3) return "Part 3 discussion";
  return "Part 1 interview";
}

function criterionForTarget(target: ImprovementTarget) {
  const criteria: Record<ImprovementTarget, string> = {
    development: "Fluency and Coherence",
    structure: "Fluency and Coherence",
    fluency: "Fluency and Coherence",
    vocabulary: "Lexical Resource",
    recovery: "Fluency and Coherence"
  };
  return criteria[target];
}

function preciseTopicNoun(question: string) {
  const lower = normalize(question);
  if (lower.includes("hometown")) return "my hometown";
  if (lower.includes("festival") || lower.includes("event")) return "that festival";
  if (lower.includes("app") || lower.includes("website")) return "that app";
  if (lower.includes("online learning")) return "online learning";
  if (lower.includes("social media")) return "social media";
  if (lower.includes("city") || lower.includes("cities")) return "city life";
  if (lower.includes("transport")) return "public transport";
  if (lower.includes("culture")) return "local culture";
  if (lower.includes("environment")) return "environmental responsibility";
  return topicFromQuestion(question);
}

function upgradeWeakWords(text: string) {
  return text
    .replace(/\bvery\s+very\b/gi, "especially")
    .replace(/\bgood\b/gi, "useful")
    .replace(/\bnice\b/gi, "enjoyable")
    .replace(/\bbad\b/gi, "frustrating")
    .replace(/\bvery\b/gi, "quite")
    .replace(/\bplace\b/gi, "area")
    .replace(/\bpeople are useful\b/gi, "people are friendly and supportive");
}

function upgradedAnswer(target: ImprovementTarget, question: string, transcript: string, part: number) {
  const topic = preciseTopicNoun(question);
  const cleaned = transcript.trim();

  if (part === 2) {
    return `I would talk about ${topic}. The reason it stands out to me is that it has a clear story behind it, not just a list of facts. First, I would set the scene briefly, then explain what happened in order, and finally connect it to why it mattered to me personally. That structure helps the answer sound natural for a one-to-two-minute long turn.`;
  }

  if (part === 3) {
    return `In my view, ${topic} is not a simple yes-or-no issue. One side is practical: it affects people's routines, choices, and opportunities. At the same time, there is a social side, because different groups experience it differently. So my answer would be balanced: I would give a clear position, support it with one example, and then add a short contrast.`;
  }

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
  part?: number;
  sourceLabel?: string;
  yearLabel?: string;
}): ConversationCritique {
  const part = input.part ?? 1;
  const expectedMinimum = DEVELOPMENT_MIN_WORDS_BY_PART[part as 1 | 2 | 3] ?? DEVELOPMENT_MIN_WORDS_BY_PART[1];
  const wordCount = words(input.transcript).length;
  const fillerCount = countFillers(input.transcript);
  const weakWords = weakWordEvidence(input.transcript);
  const starts = falseStarts(input.transcript);

  let target: ImprovementTarget = "structure";
  const evidence: string[] = [];

  if (weakWords.length) {
    target = "vocabulary";
    evidence.push(...weakWords.map((item) => `Repeated "${item.word}" ${item.count} times.`));
  } else if (fillerCount >= 3) {
    target = "fluency";
    evidence.push(`Detected ${fillerCount} filler words.`);
  } else if (starts.length) {
    target = "recovery";
    evidence.push(`Repeated start detected: "${starts[0]}".`);
  } else if (wordCount < expectedMinimum) {
    target = "development";
    evidence.push(`${partLabel(part)} needs more development: only ${wordCount} words detected.`);
  } else {
    evidence.push(`${partLabel(part)} answer needs a clearer answer -> reason -> example shape.`);
  }

  const criterion = criterionForTarget(target);
  const sourceNote = input.yearLabel
    ? `I am treating this as ${input.yearLabel.toLowerCase()} practice, so I want flexible ideas rather than memorised lines.`
    : "I want flexible ideas rather than memorised lines.";

  const feedbackByTarget: Record<ImprovementTarget, string> = {
    development: `Your idea is there, but I need more life in it for ${partLabel(part)}. In IELTS terms this is ${criterion}, and ${sourceNote.toLowerCase()}`,
    vocabulary: `You are understandable, but the word choice is too safe. For ${criterion}, I want sharper words that sound like your real experience, not a memorised school answer.`,
    fluency: `The answer is fighting for air. For ${criterion}, slow down and make the pauses sound intentional, like you are choosing the next idea.`,
    recovery: `You restarted the sentence, which happens to everyone. The skill is recovery: bridge, breathe, finish the thought.`,
    structure: `The content can work, but it needs a cleaner spoken shape before it feels like Band 8+ speech: answer, reason, example, then a natural close.`
  };

  const retryPromptByTarget: Record<ImprovementTarget, string> = {
    development: part === 2
      ? "Retry as a long turn: scene -> 2 details -> why it mattered. Aim for at least 45 seconds."
      : part === 3
        ? "Retry with position -> reason -> example -> short contrast."
        : "Retry with answer -> reason -> one real example.",
    vocabulary: "Retry using two topic-specific words and avoid repeating good, nice, bad, or very.",
    fluency: "Retry in three clean idea groups. Pause between ideas instead of filling the gap.",
    recovery: "Retry using a recovery phrase like: Let me put it this way... then complete the answer.",
    structure: part === 3
      ? "Retry using: clear opinion -> because -> example -> however."
      : "Retry using: answer -> reason -> example -> close."
  };

  const followUpByTarget: Record<ImprovementTarget, string> = {
    development: "Can you add one real example from your own life?",
    vocabulary: "Can you answer again using more precise words for the same idea?",
    fluency: "Can you say the same answer more slowly with cleaner pauses?",
    recovery: "Can you restart from the difficult point and finish the sentence?",
    structure: input.followUps?.[0] ?? FALLBACK_FOLLOW_UP
  };

  return {
    target,
    evidence: [
      ...evidence,
      `Trainer lens: ${partLabel(part)} practice, ${criterion}.`,
      input.sourceLabel ? `Topic source: ${input.sourceLabel}.` : "Topic source: IELTS-style practice bank."
    ],
    feedback: feedbackByTarget[target],
    upgradedAnswer: upgradedAnswer(target, input.question, input.transcript, part),
    retryPrompt: retryPromptByTarget[target],
    followUp: followUpByTarget[target]
  };
}
