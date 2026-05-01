import { buildConversationCritique } from "./critique.ts";
import { buildConversationContext } from "./context.ts";
import type { ConversationCritique, ConversationMessage, ConversationState } from "./types.ts";
import { prompts } from "../speaking/prompts.ts";

export const fallbackFollowUps = [
  "Can you explain why?",
  "Can you give a personal example?",
  "Do you think this will change in the future?"
];

export const introductionQuestions = [
  "Good morning. My name is your IELTS examiner. Can you tell me your full name, please?",
  "Thank you. What should I call you?",
  "Can you confirm where you are from?",
  "Do you work or study?"
];

function followUpsForPrompt(promptIndex: number) {
  if (promptIndex < 0) return introductionQuestions.slice(1);
  return prompts[promptIndex]?.followUps.length ? prompts[promptIndex].followUps : fallbackFollowUps;
}

function questionForPrompt(promptIndex: number, followUpIndex: number) {
  if (promptIndex < 0) return introductionQuestions[followUpIndex] ?? prompts[0].question;
  if (followUpIndex === 0) return prompts[promptIndex]?.question ?? prompts[0].question;
  return followUpsForPrompt(promptIndex)[followUpIndex - 1] ?? fallbackFollowUps[0];
}

function messageId(parts: Array<string | number>) {
  return parts.join("-");
}

function critiqueReply(critique: ConversationCritique) {
  return [
    critique.feedback,
    `Evidence: ${critique.evidence.join(" ")}`,
    `Stronger answer: ${critique.upgradedAnswer}`,
    `Now retry: ${critique.retryPrompt}`
  ].join("\n\n");
}

export function createInitialConversationState(): ConversationState {
  const currentQuestion = questionForPrompt(-1, 0);
  return {
    promptIndex: -1,
    followUpIndex: 0,
    currentQuestion,
    transcript: "",
    critique: null,
    retryRequired: false,
    retryTranscript: "",
    turns: [],
    messages: [
      {
        id: "examiner-0-0",
        role: "examiner",
        kind: "introduction",
        text: currentQuestion
      }
    ],
    context: buildConversationContext([
      {
        id: "examiner-0-0",
        role: "examiner",
        kind: "introduction",
        text: currentQuestion
      }
    ])
  };
}

export function submitConversationAnswer(state: ConversationState, transcript: string): ConversationState {
  if (state.promptIndex < 0) {
    const nextFollowUpIndex = state.followUpIndex + 1;
    const stillIntroducing = nextFollowUpIndex < introductionQuestions.length;
    const nextPromptIndex = stillIntroducing ? -1 : 0;
    const followUpIndex = stillIntroducing ? nextFollowUpIndex : 0;
    const nextQuestion = questionForPrompt(nextPromptIndex, followUpIndex);
    const messages: ConversationMessage[] = [
      ...state.messages,
      {
        id: messageId(["candidate", state.messages.length, "introduction"]),
        role: "candidate",
        kind: "answer",
        text: transcript
      },
      {
        id: messageId(["examiner", nextPromptIndex, followUpIndex, state.messages.length + 1]),
        role: "examiner",
        kind: stillIntroducing ? "introduction" : "question",
        text: nextQuestion
      }
    ];

    return {
      ...state,
      promptIndex: nextPromptIndex,
      followUpIndex,
      currentQuestion: nextQuestion,
      transcript,
      critique: null,
      retryRequired: false,
      retryTranscript: "",
      messages,
      context: buildConversationContext(messages)
    };
  }

  const followUps = followUpsForPrompt(state.promptIndex);
  const critique = buildConversationCritique({
    question: state.currentQuestion,
    transcript,
    followUps
  });

  const messages: ConversationMessage[] = [
    ...state.messages,
    {
      id: messageId(["candidate", state.messages.length, "answer"]),
      role: "candidate",
      kind: "answer",
      text: transcript
    },
    {
      id: messageId(["examiner", state.messages.length + 1, "critique"]),
      role: "examiner",
      kind: "critique",
      text: critiqueReply(critique)
    }
  ];

  return {
    ...state,
    transcript,
    critique,
    retryRequired: true,
    retryTranscript: "",
    turns: [
      ...state.turns,
      {
        question: state.currentQuestion,
        transcript,
        critique
      }
    ],
    messages,
    context: {
      ...buildConversationContext(messages),
      recurringTargets: Array.from(new Set([...state.context.recurringTargets, critique.target]))
    }
  };
}

export function submitRetryAnswer(state: ConversationState, retryTranscript: string): ConversationState {
  const turns = [...state.turns];
  const lastTurn = turns.at(-1);
  if (lastTurn) {
    turns[turns.length - 1] = {
      ...lastTurn,
      retryTranscript
    };
  }

  const messages: ConversationMessage[] = [
    ...state.messages,
    {
      id: messageId(["candidate", state.messages.length, "retry"]),
      role: "candidate",
      kind: "retry",
      text: retryTranscript
    },
    {
      id: messageId(["examiner", state.messages.length + 1, "retry-accepted"]),
      role: "examiner",
      kind: "follow-up",
      text: state.critique?.followUp
        ? `Better. Now answer this follow-up: ${state.critique.followUp}`
        : "Better. Now move to the next question."
    }
  ];

  return {
    ...state,
    retryRequired: false,
    retryTranscript,
    turns,
    messages,
    context: buildConversationContext(messages)
  };
}

export function moveToNextFollowUp(state: ConversationState): ConversationState {
  if (state.retryRequired) return state;

  const followUps = followUpsForPrompt(state.promptIndex);
  const nextFollowUpIndex = state.followUpIndex + 1;
  const exhausted = nextFollowUpIndex > followUps.length;
  const nextPromptIndex = exhausted ? (state.promptIndex + 1) % prompts.length : state.promptIndex;
  const followUpIndex = exhausted ? 0 : nextFollowUpIndex;

  const messages: ConversationMessage[] = [
    ...state.messages,
    {
      id: messageId(["examiner", nextPromptIndex, followUpIndex, state.messages.length]),
      role: "examiner",
      kind: nextPromptIndex < 0 ? "introduction" : followUpIndex === 0 ? "question" : "follow-up",
      text: questionForPrompt(nextPromptIndex, followUpIndex)
    }
  ];

  return {
    ...state,
    promptIndex: nextPromptIndex,
    followUpIndex,
    currentQuestion: questionForPrompt(nextPromptIndex, followUpIndex),
    transcript: "",
    critique: null,
    retryRequired: false,
    retryTranscript: "",
    messages,
    context: buildConversationContext(messages)
  };
}

export function resetConversation(): ConversationState {
  return createInitialConversationState();
}

export function createConversationStateFromMessages(messages: ConversationMessage[]): ConversationState {
  const fallback = createInitialConversationState();
  if (!messages.length) return fallback;
  const latestExaminer = [...messages]
    .reverse()
    .find((message) => message.role === "examiner" && ["introduction", "question", "follow-up"].includes(message.kind));
  return {
    ...fallback,
    currentQuestion: latestExaminer?.text ?? fallback.currentQuestion,
    messages,
    context: buildConversationContext(messages)
  };
}
