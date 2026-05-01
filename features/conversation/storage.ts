import type { ConversationMessage, ConversationSession } from "./types.ts";

const KEY = "ielts-coach-conversation-sessions";
const MAX_SESSIONS = 30;

let memorySessions: ConversationSession[] = [];

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function nowIso() {
  return new Date().toISOString();
}

export function titleFromMessages(messages: ConversationMessage[]) {
  const firstQuestion = messages.find((message) => message.role === "examiner")?.text ?? "Conversation practice";
  const normalized = firstQuestion.replace(/\s+/g, " ").trim();
  return normalized.length > 44 ? `${normalized.slice(0, 44)}...` : normalized;
}

export function normalizeConversationMessages(messages: ConversationMessage[]) {
  const seen = new Set<string>();
  return messages.map((message, index) => {
    const fallbackId = `${message.role}-${index}-${message.kind}`;
    const baseId = message.id || fallbackId;
    const nextId = seen.has(baseId) ? `${baseId}-${index}` : baseId;
    seen.add(nextId);
    return {
      ...message,
      id: nextId
    };
  });
}

function normalizeSession(session: ConversationSession): ConversationSession {
  const messages = normalizeConversationMessages(session.messages ?? []);
  return {
    ...session,
    title: session.title || titleFromMessages(messages),
    messages
  };
}

function readSessions() {
  if (!isBrowser()) return memorySessions;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConversationSession[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: ConversationSession[]) {
  const next = sessions.slice(0, MAX_SESSIONS);
  if (!isBrowser()) {
    memorySessions = next;
    return next;
  }
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function loadConversationSessions() {
  const sessions = readSessions()
    .map(normalizeSession)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  writeSessions(sessions);
  return sessions;
}

export function saveConversationSession(input: {
  id?: string;
  messages: ConversationMessage[];
  createdAt?: string;
}) {
  const sessions = loadConversationSessions();
  const existing = input.id ? sessions.find((session) => session.id === input.id) : null;
  const updatedAt = nowIso();
  const session: ConversationSession = {
    id: input.id ?? crypto.randomUUID(),
    title: titleFromMessages(input.messages),
    createdAt: existing?.createdAt ?? input.createdAt ?? updatedAt,
    updatedAt,
    messages: normalizeConversationMessages(input.messages)
  };

  return writeSessions([session, ...sessions.filter((item) => item.id !== session.id)]);
}

export function deleteConversationSession(id: string) {
  return writeSessions(loadConversationSessions().filter((session) => session.id !== id));
}

export function deleteAllConversationSessions() {
  return writeSessions([]);
}
