import type { ConversationContext, ConversationMessage, ImprovementTarget } from "./types.ts";

const RECENT_MESSAGE_LIMIT = 8;
const targetPattern = /Improvement target\s*:?\s*(development|structure|fluency|vocabulary|recovery)/gi;

function summarizeMessage(message: ConversationMessage) {
  const speaker = message.role === "examiner" ? "Examiner" : "Candidate";
  const text = message.text.replace(/\s+/g, " ").trim();
  return `${speaker}: ${text.slice(0, 110)}${text.length > 110 ? "..." : ""}`;
}

function extractTargets(messages: ConversationMessage[]) {
  const targets: ImprovementTarget[] = [];
  for (const message of messages) {
    for (const match of message.text.matchAll(targetPattern)) {
      const target = match[1] as ImprovementTarget;
      if (!targets.includes(target)) targets.push(target);
    }
  }
  return targets;
}

export function buildConversationContext(messages: ConversationMessage[]): ConversationContext {
  const olderMessages = messages.slice(0, Math.max(0, messages.length - RECENT_MESSAGE_LIMIT));
  const recentMessages = messages.slice(-RECENT_MESSAGE_LIMIT);
  const olderSummary = olderMessages.slice(-6).map(summarizeMessage).join(" | ");

  return {
    summary: olderSummary || "No older turns yet.",
    recentMessages,
    recurringTargets: extractTargets(messages)
  };
}
