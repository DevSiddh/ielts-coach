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
  "Hey, I am Mira, your IELTS speaking coach for this room. Tell me your name, and what I should call you.",
  "What should I call you during the practice?",
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

function words(text: string) {
  return text.replace(/[^\w'\s]/g, " ").split(/\s+/).filter(Boolean);
}

function wordCount(text: string) {
  return words(text).length;
}

function chooseVariant(seed: number, variants: string[]) {
  return variants[Math.abs(seed) % variants.length];
}

function profileFromMessages(messages: ConversationMessage[]) {
  const candidateMessages = messages.filter((message) => message.role === "candidate");
  const candidateText = candidateMessages
    .map((message) => message.text)
    .join(" ");
  const preferredName = candidateMessages.map((message) => extractPreferredName(message.text)).find(Boolean) ?? "";
  const location = candidateMessages.map((message) => extractLocation(message.text)).find(Boolean) ?? "";
  const workStudy = candidateMessages.map((message) => workStudySnapshot(message.text)).find(Boolean) ?? "";

  return {
    preferredName,
    location,
    workStudy: workStudy || workStudySnapshot(candidateText)
  };
}

function candidateIntent(text: string) {
  const lower = text.toLowerCase();
  if (/\b(i don't know|dont know|no idea|not sure|help me|give me idea|what should i say)\b/.test(lower)) return "help";
  if (/\b(skip|next question|change topic|another question)\b/.test(lower)) return "skip";
  if (/\b(can you explain|what does|meaning of|how to answer)\b/.test(lower)) return "explain";
  return "answer";
}

function coachingNudge(state: ConversationState, transcript: string) {
  const intent = candidateIntent(transcript);
  const profile = profileFromMessages(state.messages);
  const name = profile.preferredName ? `${profile.preferredName}, ` : "";
  const placeHook = profile.location
    ? `Use ${profile.location} as your anchor if it fits; real places make answers sound lived-in.`
    : "Use one real detail from your life; that usually beats a polished but empty sentence.";

  if (intent === "help" || intent === "explain") {
    return `${name}fair. Let me give you a starting hook, not a full answer to memorise. Start with: "Honestly, I would say..." then add one reason and one tiny example. ${placeHook}\n\nNow try this same question in your own words: ${state.currentQuestion}`;
  }
  if (intent === "skip") {
    return `${name}we can move, but first give me one rough sentence. Even a messy sentence is useful training. Say: "I do not have a strong opinion, but..." and finish the idea once.`;
  }
  return null;
}

function critiqueReply(critique: ConversationCritique, state: ConversationState) {
  const evidence = critique.evidence.slice(0, 2).join(" ");
  const profile = profileFromMessages(state.messages);
  const turnSeed = state.messages.length + critique.target.length;
  const opener = chooseVariant(turnSeed, [
    "Okay, pause there. I am going to coach the answer, not judge you.",
    "Good, I heard the idea. Now let us make it sound less rehearsed and more test-ready.",
    "Nice, there is something usable here. I want to shape it before you continue."
  ]);
  const personalCue = profile.preferredName ? `${profile.preferredName}, ` : "";
  const memoryCue = profile.location
    ? `Because you mentioned ${profile.location}, try to keep one local detail available when the topic allows it.`
    : profile.workStudy
      ? `Because you mentioned your ${profile.workStudy} context, you can borrow examples from that world when the topic is dry.`
      : "Keep one real-life example ready; that is how this stops sounding like a memorised answer.";
  return [
    opener,
    `${personalCue}${critique.feedback}`,
    `What I noticed: ${evidence || "the answer needs a clearer shape."}`,
    memoryCue,
    `Steal the shape, not the exact words: ${critique.upgradedAnswer}`,
    `Now do the small rep: ${critique.retryPrompt}`
  ].join("\n\n");
}

function cleanExtractedValue(value: string) {
  return value
    .replace(/\b(good\s+morning|hello|hi|hey|please|thanks|thank you)\b/gi, " ")
    .replace(/\b(i am|i'm|im|my name is|full name is|you can|call me)\b/gi, " ")
    .replace(/[.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractPreferredName(text: string) {
  const callMatch =
    text.match(/\b(?:call me|called)\s+([a-z][a-z\s]{1,18})/i) ??
    text.match(/\b(?:name is|full name is)\s+([a-z][a-z\s]{1,28})/i) ??
    text.match(/\b(?:i am|i'm|im)\s+(?!from\b|working\b|studying\b|study\b|student\b|a\b|an\b)([a-z][a-z\s]{1,18})/i);
  if (!callMatch) return "";
  const cleaned = cleanExtractedValue(callMatch[1]).split(/\s+/).slice(0, 2).join(" ");
  if (/^from\b/i.test(cleaned)) return "";
  return cleaned ? titleCase(cleaned) : "";
}

function extractLocation(text: string) {
  const locationMatch = text.match(/\b(?:from|live in|based in)\s+([a-z][a-z\s]{1,32})/i);
  if (!locationMatch) return "";
  const cleaned = cleanExtractedValue(locationMatch[1]).split(/\s+/).slice(0, 3).join(" ");
  return cleaned ? titleCase(cleaned) : "";
}

function workStudySnapshot(text: string) {
  const lower = text.toLowerCase();
  if (/\bstudy|student|college|school|university\b/.test(lower)) return "study";
  if (/\bwork|job|office|business|developer|engineer\b/.test(lower)) return "work";
  return "";
}

function firstUsefulWords(text: string) {
  return text
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(" ");
}

function introductionReply(transcript: string, nextQuestion: string, followUpIndex: number) {
  const preferredName = extractPreferredName(transcript);
  const location = extractLocation(transcript);
  const workStudy = workStudySnapshot(transcript);
  const heard = firstUsefulWords(transcript);
  const cleanQuestion = nextQuestion.replace(/^thank you[,.]?\s*/i, "");

  if (preferredName) {
    return `Nice, ${preferredName}. I will use that name and keep the practice conversational. ${cleanQuestion}`;
  }
  if (location) {
    return `${location}, got it. I may use that for examples later. ${cleanQuestion}`;
  }
  if (workStudy) {
    return `Good, that gives me your ${workStudy} context. Now I am switching into IELTS Part 1 mode, but I will still coach you like a real person. ${cleanQuestion}`;
  }
  return heard
    ? `I heard you. "${heard}" is enough for me to keep the thread. ${cleanQuestion}`
    : `I am with you. ${cleanQuestion}`;
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
    const alreadyGavePreferredName = state.followUpIndex === 0 && Boolean(extractPreferredName(transcript));
    const nextFollowUpIndex = state.followUpIndex + (alreadyGavePreferredName ? 2 : 1);
    const stillIntroducing = nextFollowUpIndex < introductionQuestions.length;
    const nextPromptIndex = stillIntroducing ? -1 : 0;
    const followUpIndex = stillIntroducing ? nextFollowUpIndex : 0;
    const rawNextQuestion = questionForPrompt(nextPromptIndex, followUpIndex);
    const nextQuestion = introductionReply(transcript, rawNextQuestion, nextFollowUpIndex);
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
      currentQuestion: rawNextQuestion,
      transcript,
      critique: null,
      retryRequired: false,
      retryTranscript: "",
      messages,
      context: buildConversationContext(messages)
    };
  }

  const followUps = followUpsForPrompt(state.promptIndex);
  const activePrompt = prompts[state.promptIndex];
  const nudge = coachingNudge(state, transcript);
  if (nudge) {
    const messages: ConversationMessage[] = [
      ...state.messages,
      {
        id: messageId(["candidate", state.messages.length, "coach-request"]),
        role: "candidate",
        kind: "answer",
        text: transcript
      },
      {
        id: messageId(["examiner", state.messages.length + 1, "coach-nudge"]),
        role: "examiner",
        kind: "follow-up",
        text: nudge
      }
    ];

    return {
      ...state,
      transcript,
      retryRequired: false,
      retryTranscript: "",
      messages,
      context: buildConversationContext(messages)
    };
  }

  const critique = buildConversationCritique({
    question: state.currentQuestion,
    transcript,
    followUps,
    part: activePrompt?.part ?? 1,
    sourceLabel: activePrompt?.sourceLabel,
    yearLabel: activePrompt?.yearLabel
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
      text: critiqueReply(critique, state)
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
  const originalWords = lastTurn ? wordCount(lastTurn.transcript) : 0;
  const retryWords = wordCount(retryTranscript);
  const growthLine =
    originalWords && retryWords > originalWords
      ? `You expanded it from ${originalWords} to ${retryWords} words, so the answer has more room to breathe.`
      : `You kept it compact; now make sure every word carries a clear idea.`;
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
        ? `That is more alive. ${growthLine} Let me push you one layer deeper: ${state.critique.followUp}`
        : `That is more alive. ${growthLine} Let us move to the next question.`
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
      text: nextPromptIndex >= 0 && followUpIndex === 0
        ? `Fresh topic. Do not overthink it; give me the natural version first. ${questionForPrompt(nextPromptIndex, followUpIndex)}`
        : questionForPrompt(nextPromptIndex, followUpIndex)
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
