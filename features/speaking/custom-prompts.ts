import type { SpeakingPrompt, StrategyCategory } from "./types";

export const CUSTOM_SPEAKING_PROMPTS_KEY = "ielts-coach-custom-speaking-prompts-v1";

type SpeakingPartChoice = 1 | 2 | 3 | "auto";

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function inferPart(question: string): 1 | 2 | 3 {
  const text = normalize(question);
  if (/describe|talk about|tell me about a time|you should say|who it was|where it was|what happened/.test(text)) return 2;
  if (/why|do you think|how has|should|advantages|disadvantages|society|government|people in your country/.test(text)) {
    return 3;
  }
  return 1;
}

function inferStrategyCategory(question: string, part: 1 | 2 | 3): StrategyCategory {
  const text = normalize(question);
  if (part === 1) return "part1-personal";
  if (part === 3) {
    if (/compare|different|changed|over time|younger|older/.test(text)) return "part3-compare";
    if (/problem|solution|cause|government|improve/.test(text)) return "part3-causes-solutions";
    return "part3-opinion";
  }
  if (/person|teacher|friend|family|someone|who/.test(text)) return "part2-person";
  if (/place|city|country|room|home|house|apartment|where/.test(text)) return "part2-place";
  if (/object|thing|item|gift|device|something you own/.test(text)) return "part2-object";
  return "part2-event";
}

function titleFromQuestion(question: string) {
  const cleaned = question.replace(/\s+/g, " ").trim().replace(/[?.!]+$/, "");
  const withoutLead = cleaned.replace(/^(describe|talk about|tell me about|what|why|how|do you think|should)\s+/i, "");
  const title = withoutLead.split(/\s+/).slice(0, 5).join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "Custom question";
}

function frameForPart(part: 1 | 2 | 3) {
  if (part === 1) {
    return {
      answerFrame: ["Answer directly in one sentence.", "Add one personal reason or detail.", "Close naturally with a small example."],
      whatGoodLooksLike: ["The answer sounds personal, not memorized.", "One detail is specific enough to be believable.", "The speaker expands beyond a yes/no response."],
      improvementTips: ["Use everyday vocabulary accurately.", "Add because, for example, or especially to extend.", "Keep it natural and under control."]
    };
  }
  if (part === 2) {
    return {
      answerFrame: ["Name the person, place, object, or event quickly.", "Give background and two clear details.", "Explain why it matters to you."],
      whatGoodLooksLike: ["The answer feels like a short organized story.", "Details are concrete rather than listed.", "The ending explains meaning or impact."],
      improvementTips: ["Use past, present, or future tense consistently.", "Add sensory or emotional detail.", "Use sequencing words to stay fluent."]
    };
  }
  return {
    answerFrame: ["Give a clear opinion first.", "Explain one reason with an example.", "Add a balanced contrast or consequence."],
    whatGoodLooksLike: ["The answer discusses the wider issue, not only personal experience.", "Reasons are developed rather than repeated.", "The speaker uses comparison, cause, or consequence language."],
    improvementTips: ["Use phrases like in my view, whereas, as a result.", "Support the opinion with one real example.", "Avoid one-sided or memorized sounding claims."]
  };
}

export function createCustomSpeakingPrompt({
  question,
  partChoice = "auto",
  persistable = false
}: {
  question: string;
  partChoice?: SpeakingPartChoice;
  persistable?: boolean;
}): SpeakingPrompt | null {
  const cleaned = question.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const part = partChoice === "auto" ? inferPart(cleaned) : partChoice;
  const difficulty = part === 1 ? "easy" : part === 2 ? "medium" : "hard";
  const frame = frameForPart(part);

  return {
    id: createId(persistable ? "custom-speaking" : "custom-speaking-session"),
    part,
    difficulty,
    strategyCategory: inferStrategyCategory(cleaned, part),
    title: titleFromQuestion(cleaned),
    question: cleaned,
    followUps: part === 3 ? ["reason", "example", "balanced view"] : part === 2 ? ["background", "details", "meaning"] : ["reason", "example", "personal detail"],
    sourceLabel: "Custom question",
    sourceType: "custom",
    sourceUrl: "",
    yearLabel: "My question",
    referenceLinks: [],
    ...frame
  };
}

export function loadCustomSpeakingPrompts(): SpeakingPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_SPEAKING_PROMPTS_KEY);
    return raw ? (JSON.parse(raw) as SpeakingPrompt[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomSpeakingPrompts(prompts: SpeakingPrompt[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_SPEAKING_PROMPTS_KEY, JSON.stringify(prompts));
}

export function addCustomSpeakingPrompt(prompt: SpeakingPrompt, current: SpeakingPrompt[]) {
  const deduped = current.filter((item) => normalize(item.question) !== normalize(prompt.question));
  return [prompt, ...deduped].slice(0, 40);
}

export function deleteCustomSpeakingPrompt(promptId: string, current: SpeakingPrompt[]) {
  return current.filter((item) => item.id !== promptId);
}
