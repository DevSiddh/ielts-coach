export type ImprovementTarget = "development" | "structure" | "fluency" | "vocabulary" | "recovery";

export type ConversationCritique = {
  target: ImprovementTarget;
  evidence: string[];
  feedback: string;
  upgradedAnswer: string;
  retryPrompt: string;
  followUp: string | null;
};

export type ConversationTurn = {
  question: string;
  transcript: string;
  critique: ConversationCritique | null;
  retryTranscript?: string;
};

export type ConversationMessage = {
  id: string;
  role: "examiner" | "candidate";
  kind: "introduction" | "question" | "answer" | "critique" | "retry" | "follow-up";
  text: string;
};

export type ConversationContext = {
  summary: string;
  recentMessages: ConversationMessage[];
  recurringTargets: ImprovementTarget[];
};

export type ConversationSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
};

export type ConversationState = {
  promptIndex: number;
  followUpIndex: number;
  currentQuestion: string;
  transcript: string;
  critique: ConversationCritique | null;
  retryRequired: boolean;
  retryTranscript: string;
  turns: ConversationTurn[];
  messages: ConversationMessage[];
  context: ConversationContext;
};
