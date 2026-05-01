import type { WritingPrompt } from "./types";

export const CUSTOM_WRITING_PROMPTS_KEY = "ielts-coach-custom-writing-prompts-v1";

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromQuestion(question: string) {
  const cleaned = question.replace(/\s+/g, " ").trim().replace(/[?.!]+$/, "");
  const title = cleaned.split(/\s+/).slice(0, 6).join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "Custom Task 2";
}

function planningHintsFor(question: string) {
  const text = normalize(question);
  if (/discuss both views|discuss both/.test(text)) {
    return ["Explain the first view fairly.", "Explain the opposite view fairly.", "Give your own opinion clearly."];
  }
  if (/advantages.*disadvantages|disadvantages.*advantages|outweigh/.test(text)) {
    return ["Identify the main advantage.", "Identify the main disadvantage.", "Decide which side is stronger."];
  }
  if (/cause|causes|effect|effects/.test(text)) {
    return ["Explain two causes.", "Describe the most important effect.", "Keep each paragraph focused on one idea."];
  }
  if (/problem|solution|solutions/.test(text)) {
    return ["Identify two problems.", "Match each problem with a realistic solution.", "End with a practical judgement."];
  }
  if (/agree or disagree|to what extent/.test(text)) {
    return ["State your position clearly.", "Give two reasons for your view.", "Repeat the position in the conclusion."];
  }
  return ["Identify the task type first.", "Choose a clear position.", "Use two body paragraphs with one main idea each."];
}

export function createCustomWritingPrompt(question: string): WritingPrompt | null {
  const cleaned = question.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return {
    id: createId("custom-writing"),
    taskType: "academic-task-2",
    theme: "custom",
    title: titleFromQuestion(cleaned),
    question: cleaned,
    instruction: "Write at least 250 words.",
    planningHints: planningHintsFor(cleaned)
  };
}

export function loadCustomWritingPrompts(): WritingPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_WRITING_PROMPTS_KEY);
    return raw ? (JSON.parse(raw) as WritingPrompt[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomWritingPrompts(prompts: WritingPrompt[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_WRITING_PROMPTS_KEY, JSON.stringify(prompts));
}

export function addCustomWritingPrompt(prompt: WritingPrompt, current: WritingPrompt[]) {
  const deduped = current.filter((item) => normalize(item.question) !== normalize(prompt.question));
  return [prompt, ...deduped].slice(0, 40);
}

export function deleteCustomWritingPrompt(promptId: string, current: WritingPrompt[]) {
  return current.filter((item) => item.id !== promptId);
}
