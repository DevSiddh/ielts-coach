import test from "node:test";
import assert from "node:assert/strict";

import { buildConversationCritique } from "../features/conversation/critique.ts";
import { buildConversationContext } from "../features/conversation/context.ts";
import {
  deleteAllConversationSessions,
  deleteConversationSession,
  loadConversationSessions,
  normalizeConversationMessages,
  saveConversationSession
} from "../features/conversation/storage.ts";
import {
  createConversationStateFromMessages,
  createInitialConversationState,
  introductionQuestions,
  moveToNextFollowUp,
  resetConversation,
  submitConversationAnswer,
  submitRetryAnswer
} from "../features/conversation/state.ts";
import type { ConversationMessage } from "../features/conversation/types.ts";

const question = "What kind of place is your hometown?";

function createReadyConversationState() {
  let state = createInitialConversationState();
  state = submitConversationAnswer(state, "My full name is Rahul Sharma, please call me Rahul.");
  state = submitConversationAnswer(state, "I am from Pune.");
  return submitConversationAnswer(state, "I am studying computer science.");
}

test("conversation starts with coach-style introduction", () => {
  const state = createInitialConversationState();
  assert.equal(state.promptIndex, -1);
  assert.equal(state.messages[0].kind, "introduction");
  assert.equal(state.currentQuestion, introductionQuestions[0]);
  assert.match(state.currentQuestion, /Mira/);
});

test("introduction answers feel conversational and skip redundant name question", () => {
  let state = createInitialConversationState();
  state = submitConversationAnswer(state, "My full name is Rahul Sharma, you can call me Rahul.");
  assert.equal(state.retryRequired, false);
  assert.equal(state.critique, null);
  assert.equal(state.currentQuestion, introductionQuestions[2]);
  assert.equal(state.messages.at(-1)?.text.includes("Nice, Rahul"), true);

  state = submitConversationAnswer(state, "I am from Pune.");
  state = submitConversationAnswer(state, "I am studying computer science.");
  assert.equal(state.promptIndex, 0);
  assert.equal(state.followUpIndex, 0);
  assert.equal(state.messages.at(-1)?.kind, "question");
});

test("location answer is not misread as preferred name", () => {
  let state = createInitialConversationState();
  state = submitConversationAnswer(state, "My name is Yagnesh, call me Siddhu.");
  state = submitConversationAnswer(state, "I am from Vijayawada.");
  assert.equal(state.currentQuestion, introductionQuestions[3]);
  assert.equal(state.messages.at(-1)?.text.includes("Vijayawada, got it."), true);
  assert.equal(state.messages.at(-1)?.text.includes("Nice, From"), false);
});

test("work and study answer is not misread as preferred name", () => {
  let state = createInitialConversationState();
  state = submitConversationAnswer(state, "My name is Yagnesh, call me Siddhu.");
  state = submitConversationAnswer(state, "I am from Vijayawada.");
  state = submitConversationAnswer(state, "I am working on software projects and studying for IELTS.");
  assert.equal(state.promptIndex, 0);
  assert.equal(state.messages.at(-1)?.kind, "question");
  assert.equal(state.messages.at(-1)?.text.includes("Nice, Working"), false);
  assert.equal(state.messages.at(-1)?.text.includes("Good, that gives me your study context."), true);
});

test("short answer targets development", () => {
  const critique = buildConversationCritique({ question, transcript: "It is nice." });
  assert.equal(critique.target, "development");
  assert.equal(critique.evidence[0], "Part 1 interview needs more development: only 3 words detected.");
});

test("filler-heavy answer targets fluency", () => {
  const critique = buildConversationCritique({
    question,
    transcript: "My hometown is peaceful um and uh I like it because like it is familiar."
  });
  assert.equal(critique.target, "fluency");
});

test("repeated weak vocabulary targets vocabulary", () => {
  const critique = buildConversationCritique({
    question,
    transcript: "My hometown is good because people are good and the market is very very useful."
  });
  assert.equal(critique.target, "vocabulary");
  assert.doesNotMatch(critique.upgradedAnswer, /quite quite/);
});

test("repeated starts target recovery", () => {
  const critique = buildConversationCritique({
    question,
    transcript: "I I think my hometown is peaceful because people help each other and it feels familiar."
  });
  assert.equal(critique.target, "recovery");
});

test("normal answer targets structure", () => {
  const critique = buildConversationCritique({
    question,
    transcript:
      "My hometown is a peaceful area with a busy old market. I like it because daily life feels familiar and affordable."
  });
  assert.equal(critique.target, "structure");
});

test("part 2 critique coaches long-turn development", () => {
  const critique = buildConversationCritique({
    question: "Describe a website you often use.",
    transcript: "I use one study website because it helps me.",
    part: 2,
    sourceLabel: "verified-2026"
  });
  assert.equal(critique.target, "development");
  assert.equal(critique.evidence[0], "Part 2 long turn needs more development: only 9 words detected.");
  assert.match(critique.upgradedAnswer, /one-to-two-minute long turn/);
  assert.match(critique.retryPrompt, /scene -> 2 details -> why it mattered/);
});

test("part 3 critique gives analytical model direction", () => {
  const critique = buildConversationCritique({
    question: "Do you think online learning will become more common in the future?",
    transcript:
      "I think online learning will become more common because it is flexible for workers and students. For example, people can study after office hours, repeat recorded lessons, and choose courses from other cities. However, classroom learning will still matter because it gives stronger discipline, direct support, and better interaction.",
    part: 3,
    yearLabel: "2026"
  });
  assert.equal(critique.target, "structure");
  assert.match(critique.upgradedAnswer, /not a simple yes-or-no issue/);
  assert.match(critique.retryPrompt, /clear opinion -> because -> example -> however/);
});

test("first answer requires retry", () => {
  const state = submitConversationAnswer(createReadyConversationState(), "It is nice.");
  assert.equal(state.retryRequired, true);
  assert.equal(state.critique?.target, "development");
  assert.equal(state.turns.length, 1);
  assert.equal(state.messages.at(-1)?.role, "examiner");
  assert.equal(state.messages.at(-1)?.kind, "critique");
  assert.equal(state.messages.at(-1)?.text.includes("Now do the small rep:"), true);
});

test("candidate help request gets a coach nudge instead of canned critique", () => {
  const state = submitConversationAnswer(createReadyConversationState(), "I don't know what should I say.");
  assert.equal(state.retryRequired, false);
  assert.equal(state.critique, null);
  assert.equal(state.messages.at(-1)?.kind, "follow-up");
  assert.match(state.messages.at(-1)?.text ?? "", /starting hook/);
  assert.match(state.messages.at(-1)?.text ?? "", /same question/);
  assert.doesNotMatch(state.messages.at(-1)?.text ?? "", /Rahul From/);
});

test("retry unlocks follow-up", () => {
  const answered = submitConversationAnswer(createReadyConversationState(), "It is nice.");
  const retried = submitRetryAnswer(answered, "My hometown is peaceful because people know each other.");
  assert.equal(retried.retryRequired, false);
  assert.equal(retried.turns[0].retryTranscript, "My hometown is peaceful because people know each other.");
  assert.equal(retried.messages.at(-1)?.role, "examiner");
  assert.equal(retried.messages.at(-1)?.text.startsWith("That is more alive."), true);
  assert.match(retried.messages.at(-1)?.text ?? "", /expanded it from 3 to 9 words/);
});

test("next follow-up advances question after retry", () => {
  const answered = submitConversationAnswer(createReadyConversationState(), "It is nice.");
  const retried = submitRetryAnswer(answered, "My hometown is peaceful because people know each other.");
  const next = moveToNextFollowUp(retried);
  assert.notEqual(next.currentQuestion, retried.currentQuestion);
  assert.equal(next.followUpIndex, 1);
});

test("next follow-up is locked before retry", () => {
  const answered = submitConversationAnswer(createReadyConversationState(), "It is nice.");
  const next = moveToNextFollowUp(answered);
  assert.equal(next.currentQuestion, answered.currentQuestion);
  assert.equal(next.retryRequired, true);
});

test("reset clears session", () => {
  const answered = submitConversationAnswer(createReadyConversationState(), "It is nice.");
  const reset = resetConversation();
  assert.equal(answered.turns.length, 1);
  assert.equal(reset.turns.length, 0);
  assert.equal(reset.critique, null);
});

test("first answer transcript and retry transcript are kept separate", () => {
  const answered = submitConversationAnswer(createReadyConversationState(), "First answer text.");
  const retried = submitRetryAnswer(answered, "Retry answer text with a better example.");
  assert.equal(retried.transcript, "First answer text.");
  assert.equal(retried.retryTranscript, "Retry answer text with a better example.");
  assert.equal(retried.turns[0].transcript, "First answer text.");
  assert.equal(retried.turns[0].retryTranscript, "Retry answer text with a better example.");
});

test("loaded transcript session creates a clean continuation state", () => {
  const messages: ConversationMessage[] = [
    { id: "e1", role: "examiner", kind: "question", text: "What is your hometown like?" },
    { id: "c1", role: "candidate", kind: "answer", text: "It is peaceful." },
    { id: "e2", role: "examiner", kind: "follow-up", text: "Can you give a personal example?" }
  ];
  const state = createConversationStateFromMessages(messages);
  assert.equal(state.messages.length, 3);
  assert.equal(state.currentQuestion, "Can you give a personal example?");
  assert.equal(state.retryRequired, false);
});

test("continuing a loaded transcript creates unique message ids", () => {
  const loaded = createConversationStateFromMessages([
    { id: "candidate-0-answer", role: "candidate", kind: "answer", text: "Old answer." },
    { id: "examiner-1-critique", role: "examiner", kind: "critique", text: "Old critique." },
    { id: "examiner-0-0-2", role: "examiner", kind: "follow-up", text: "Can you explain why?" }
  ]);
  const answered = submitConversationAnswer(loaded, "New answer with enough words to continue this practice properly.");
  const ids = answered.messages.map((message) => message.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("session save and load preserves transcript messages and metadata", () => {
  deleteAllConversationSessions();
  const messages: ConversationMessage[] = [
    { id: "e1", role: "examiner", kind: "question", text: "What is your hometown like?" },
    { id: "c1", role: "candidate", kind: "answer", text: "It is quiet and friendly." }
  ];
  const sessions = saveConversationSession({ id: "session-one", messages });
  assert.equal(sessions.length, 1);
  assert.deepEqual(sessions[0].messages, messages);
  assert.equal(sessions[0].title, "What is your hometown like?");
  assert.ok(sessions[0].createdAt);
  assert.ok(sessions[0].updatedAt);
  assert.equal(loadConversationSessions()[0].messages[1].text, "It is quiet and friendly.");
});

test("stored duplicate conversation message ids are normalized", () => {
  const messages: ConversationMessage[] = [
    { id: "candidate-0-answer", role: "candidate", kind: "answer", text: "First answer." },
    { id: "candidate-0-answer", role: "candidate", kind: "answer", text: "Second answer." },
    { id: "examiner-0-critique", role: "examiner", kind: "critique", text: "First critique." },
    { id: "examiner-0-critique", role: "examiner", kind: "critique", text: "Second critique." }
  ];
  const normalized = normalizeConversationMessages(messages);
  const ids = normalized.map((message) => message.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids[0], "candidate-0-answer");
  assert.equal(ids[1], "candidate-0-answer-1");
});

test("saving a session normalizes duplicate message ids", () => {
  deleteAllConversationSessions();
  saveConversationSession({
    id: "duplicate-session",
    messages: [
      { id: "candidate-0-answer", role: "candidate", kind: "answer", text: "First answer." },
      { id: "candidate-0-answer", role: "candidate", kind: "answer", text: "Second answer." }
    ]
  });
  const ids = loadConversationSessions()[0].messages.map((message) => message.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("deleting one conversation session removes it", () => {
  deleteAllConversationSessions();
  saveConversationSession({
    id: "keep",
    messages: [{ id: "e1", role: "examiner", kind: "question", text: "Question one?" }]
  });
  saveConversationSession({
    id: "remove",
    messages: [{ id: "e2", role: "examiner", kind: "question", text: "Question two?" }]
  });
  const sessions = deleteConversationSession("remove");
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].id, "keep");
});

test("wiping conversation sessions clears all sessions", () => {
  saveConversationSession({
    id: "temporary",
    messages: [{ id: "e1", role: "examiner", kind: "question", text: "Question one?" }]
  });
  assert.equal(deleteAllConversationSessions().length, 0);
  assert.equal(loadConversationSessions().length, 0);
});

test("context helper keeps recent messages and summarizes older ones", () => {
  const messages = Array.from({ length: 12 }, (_, index): ConversationMessage => ({
    id: `m-${index}`,
    role: index % 2 ? "candidate" : "examiner",
    kind: index % 2 ? "answer" : "question",
    text: `Message ${index}`
  }));
  const context = buildConversationContext(messages);
  assert.equal(context.recentMessages.length, 8);
  assert.equal(context.recentMessages[0].id, "m-4");
  assert.match(context.summary, /Message 0/);
});
