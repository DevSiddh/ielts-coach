export type WritingStrategyItem = {
  name: string;
  useWhen: string;
  moves: string[];
  example: string;
};

export type WritingStrategySection = {
  id: string;
  title: string;
  criterion: "Task Response" | "Coherence and Cohesion" | "Lexical Resource" | "Grammatical Range and Accuracy";
  purpose: string;
  howItHelps: string;
  practicePrompt: string;
  items: WritingStrategyItem[];
};

export const writingStrategySections: WritingStrategySection[] = [
  {
    id: "position-and-task-response",
    title: "Position and task response",
    criterion: "Task Response",
    purpose: "Answer every part of the question with a clear position.",
    howItHelps:
      "IELTS Academic Writing Task 2 in 2026 still rewards a direct answer, relevant ideas, and developed support. This system prevents vague introductions and half-answered prompts.",
    practicePrompt: "Before writing, underline the task type and write your one-sentence position.",
    items: [
      {
        name: "Question split",
        useWhen: "The prompt has two views, causes/effects, problems/solutions, or advantages/disadvantages.",
        moves: ["Name the task type", "Split the prompt into required parts", "Assign one body paragraph to each required part"],
        example: "Discuss both views and give your opinion -> BP1 view A, BP2 view B plus my judgement."
      },
      {
        name: "Direct thesis",
        useWhen: "Your introduction sounds general or memorized.",
        moves: ["Paraphrase the topic briefly", "State your exact answer", "Preview the two reasons you will develop"],
        example: "I largely agree because online learning improves access, but it cannot fully replace classroom interaction."
      },
      {
        name: "Evidence chain",
        useWhen: "Your ideas are listed but not developed.",
        moves: ["Claim", "Reason", "Concrete example", "Result linked back to the question"],
        example: "Flexible recorded lessons help working students because they can revise difficult material after their shifts."
      }
    ]
  },
  {
    id: "paragraph-control",
    title: "Paragraph control",
    criterion: "Coherence and Cohesion",
    purpose: "Build a clear 4-paragraph essay under the 40-minute limit.",
    howItHelps:
      "The IELTS writing page already checks paragraph count and linking. This strategy teaches the structure behind those signals without turning the evaluator into coaching text.",
    practicePrompt: "Plan four paragraphs: introduction, body 1, body 2, conclusion.",
    items: [
      {
        name: "4-paragraph route",
        useWhen: "You lose time deciding structure.",
        moves: ["Introduction with position", "Body 1: strongest reason", "Body 2: second reason or opposing view", "Conclusion with final judgement"],
        example: "For a discuss-both-views essay, each body paragraph owns one view; the conclusion confirms your side."
      },
      {
        name: "Topic sentence lock",
        useWhen: "Paragraphs drift away from the question.",
        moves: ["Start with one controlling idea", "Keep all support under that idea", "End by linking to the task"],
        example: "The main benefit of public transport investment is reduced congestion."
      },
      {
        name: "Controlled linking",
        useWhen: "You repeat however/also or use linking words mechanically.",
        moves: ["Use one contrast linker", "Use one result linker", "Use one example linker", "Avoid linking every sentence"],
        example: "However introduces contrast; as a result explains impact; for example introduces evidence."
      }
    ]
  },
  {
    id: "topic-vocabulary",
    title: "Topic vocabulary",
    criterion: "Lexical Resource",
    purpose: "Use precise topic words without memorized phrases.",
    howItHelps:
      "IELTS writing band growth depends on flexible topic vocabulary, accurate collocations, and low repetition. This keeps vocabulary inspectable and connected to the prompt.",
    practicePrompt: "Choose five topic nouns and three useful verbs before drafting.",
    items: [
      {
        name: "Noun bank",
        useWhen: "You repeat people, things, good, bad, important.",
        moves: ["Write five topic nouns", "Replace vague nouns", "Use each only where natural"],
        example: "Environment: emissions, congestion, infrastructure, commuters, air quality."
      },
      {
        name: "Verb upgrade",
        useWhen: "Most sentences use is/are/have.",
        moves: ["Pick accurate verbs", "Match verb to noun", "Avoid over-formal synonyms"],
        example: "Policies reduce emissions, encourage commuters, fund infrastructure, and protect public health."
      },
      {
        name: "Collocation check",
        useWhen: "A phrase sounds translated or unnatural.",
        moves: ["Check adjective + noun", "Check verb + noun", "Prefer simple correct English over risky words"],
        example: "Use heavy traffic, public transport, strict regulation, personal responsibility."
      }
    ]
  },
  {
    id: "sentence-range",
    title: "Sentence range",
    criterion: "Grammatical Range and Accuracy",
    purpose: "Show range while keeping control.",
    howItHelps:
      "The 2026 IELTS public band descriptors still value varied structures and accuracy. This system adds range without making every sentence long.",
    practicePrompt: "Draft with simple control first, then upgrade two sentences.",
    items: [
      {
        name: "Two-clause sentence",
        useWhen: "Your essay is mostly short simple sentences.",
        moves: ["Start with a clear main clause", "Add because/although/while", "Check the sentence still has one main idea"],
        example: "Although online classes are convenient, younger students often need direct supervision."
      },
      {
        name: "Controlled complex sentence",
        useWhen: "Long sentences become confusing.",
        moves: ["Limit to two clauses", "Use commas for contrast/opening clauses", "Cut extra examples into a new sentence"],
        example: "If governments improve bus networks, more commuters may leave their cars at home."
      },
      {
        name: "Final grammar sweep",
        useWhen: "You have two minutes before submitting.",
        moves: ["Check subject-verb agreement", "Check articles for singular countable nouns", "Check verb tense consistency"],
        example: "A policy needs funding; policies need funding."
      }
    ]
  }
];
