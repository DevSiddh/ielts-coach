export type TransferableStrategySection = {
  id: string;
  title: string;
  purpose: string;
  howItHelps: string;
  practicePrompt: string;
  items: Array<{
    name: string;
    useWhen: string;
    moves: string[];
    example: string;
  }>;
};

export const universalFrameworks: TransferableStrategySection = {
  id: "frameworks",
  title: "Universal Answer Frameworks",
  purpose: "Reusable structures for organizing answers under pressure on familiar or unfamiliar topics.",
  howItHelps: "Frameworks stop you from guessing what to say next. They give your answer a simple route: start, develop, finish.",
  practicePrompt: "Pick one framework, answer any easy Part 1 question in 30 seconds, then repeat with one extra example.",
  items: [
    {
      name: "Direct answer -> reason -> example -> close",
      useWhen: "Part 1 personal or simple opinion questions.",
      moves: ["Answer immediately.", "Give one reason.", "Add one personal example.", "Close with a short result or feeling."],
      example: "Yes, I do. The main reason is convenience. For example, I usually study better at home because it is quiet. So it suits my routine."
    },
    {
      name: "Opinion -> reason -> consequence -> balance",
      useWhen: "Part 3 opinion questions where the examiner expects analysis.",
      moves: ["Take a position.", "Explain the strongest reason.", "Show the consequence.", "Add a balanced final note."],
      example: "I think it is mostly positive because it saves time. As a result, people can manage work more flexibly, although it can reduce face-to-face contact."
    },
    {
      name: "Describe -> detail -> personal link -> meaning",
      useWhen: "Part 2 people, places, objects, events, or memories.",
      moves: ["Name the thing clearly.", "Give two concrete details.", "Connect it to your life.", "Explain why it matters."],
      example: "The place is a small market near my home. It is crowded but friendly, and I went there often as a child. That is why it feels familiar to me."
    },
    {
      name: "Problem -> cause -> solution -> impact",
      useWhen: "Part 3 social, city, education, health, work, or government questions.",
      moves: ["Name the problem.", "Explain one cause.", "Suggest one realistic solution.", "Say what improvement it creates."],
      example: "Traffic is a major problem because public transport is weak. If cities improve buses and trains, people will rely less on cars."
    }
  ]
};

export const languageFunctions: TransferableStrategySection = {
  id: "language-functions",
  title: "Language Functions",
  purpose: "Flexible speaking moves that work across many topics, not memorized answers.",
  howItHelps: "Functions are reusable speaking actions. If the topic changes, you can still compare, speculate, explain causes, or give examples.",
  practicePrompt: "Choose one function, then say three different sentences using it on three unrelated topics.",
  items: [
    {
      name: "Giving opinions",
      useWhen: "You need a clear position without sounding extreme.",
      moves: ["Use a soft opener.", "State the main view.", "Support it with one reason."],
      example: "In my view, this is mostly useful because it makes daily life more convenient."
    },
    {
      name: "Comparing ideas",
      useWhen: "The question asks about two groups, two places, or past and present.",
      moves: ["Choose one comparison point.", "Explain side A.", "Contrast side B.", "Say what the difference means."],
      example: "Older people often value tradition, whereas younger people may care more about convenience."
    },
    {
      name: "Speculating",
      useWhen: "You are unsure or the topic is unfamiliar.",
      moves: ["Signal uncertainty.", "Make a reasonable guess.", "Explain the logic."],
      example: "I am not completely sure, but I imagine the main reason is cost, because most families have to think about money first."
    },
    {
      name: "Explaining cause and effect",
      useWhen: "You need to develop a point beyond one sentence.",
      moves: ["Name the cause.", "Use because/as a result.", "Give a real-life effect."],
      example: "Because housing is expensive, young people often delay moving out, and that affects their independence."
    },
    {
      name: "Admitting uncertainty while continuing",
      useWhen: "You go blank but need to keep speaking.",
      moves: ["Admit briefly.", "Shift to a related angle.", "Give a simple example."],
      example: "I have not thought about this much, but one related example is public transport in my city."
    }
  ]
};

export const topicBuckets: TransferableStrategySection = {
  id: "topic-buckets",
  title: "Topic Buckets",
  purpose: "Mental categories that help you survive topics you have not practiced before.",
  howItHelps: "Buckets help you quickly find an angle. Unknown topics become easier when you map them to people, places, habits, cities, work, health, or society.",
  practicePrompt: "Take one surprise topic and force it into two buckets. Build one answer from each bucket.",
  items: [
    {
      name: "People / places / events / objects",
      useWhen: "Part 2 description cards.",
      moves: ["Use identity or location.", "Add two concrete details.", "Add memory or emotion.", "End with meaning."],
      example: "For any object, explain where it came from, how you use it, and why it matters."
    },
    {
      name: "Habits / work / education / health",
      useWhen: "Everyday Part 1 and Part 3 questions.",
      moves: ["Mention routine.", "Explain benefit or difficulty.", "Give a personal example."],
      example: "For health, connect the answer to sleep, stress, exercise, cost, or time."
    },
    {
      name: "Technology / media / cities / environment",
      useWhen: "Modern abstract Part 3 questions.",
      moves: ["Name convenience or pressure.", "Explain social effect.", "Balance benefit with risk."],
      example: "For technology, talk about speed and access, then mention distraction or privacy."
    },
    {
      name: "Government / society / public life",
      useWhen: "Policy or social responsibility questions.",
      moves: ["Name the public problem.", "Mention citizens or families.", "Suggest realistic investment or rules."],
      example: "For government questions, avoid vague help; say transport, housing, education, healthcare, or safety."
    }
  ]
};

export const rescuePatterns: TransferableStrategySection = {
  id: "rescue",
  title: "Rescue Patterns",
  purpose: "Ways to recover when you forget a word, lose the idea, or meet an unfamiliar topic.",
  howItHelps: "Rescue patterns keep fluency alive. They buy thinking time without turning the answer into silence or repeated fillers.",
  practicePrompt: "Start answering a hard question, pause after five seconds, then use one rescue line and continue.",
  items: [
    {
      name: "Blank recovery",
      useWhen: "Your mind goes empty after hearing the question.",
      moves: ["Use one thinking phrase.", "Repeat the topic in simpler words.", "Choose the easiest angle."],
      example: "That is an interesting question. I suppose the easiest way to think about it is from daily life."
    },
    {
      name: "Weak answer extension",
      useWhen: "Your answer is too short.",
      moves: ["Add a reason.", "Add an example.", "Add a contrast or result."],
      example: "Another reason is convenience. For example, in my city this matters because travel takes a lot of time."
    },
    {
      name: "Unknown topic survival",
      useWhen: "The topic is unfamiliar or technical.",
      moves: ["Admit limited knowledge.", "Move to common experience.", "Give a cautious opinion."],
      example: "I do not know the technical side, but from an ordinary person's view, the main issue is cost."
    }
  ]
};

export const bandUpgradeRules: TransferableStrategySection = {
  id: "band-upgrades",
  title: "Band Upgrade Rules",
  purpose: "Concrete changes that move an answer from basic to developed.",
  howItHelps: "Upgrade rules show exactly what to add: reason, example, contrast, nuance, and precise vocabulary.",
  practicePrompt: "Give a basic answer once, then upgrade it by adding one specific detail and one consequence.",
  items: [
    {
      name: "Band 5 to 6",
      useWhen: "The answer is understandable but thin.",
      moves: ["Add a clear reason.", "Use simple linking.", "Avoid one-word or one-sentence answers."],
      example: "Because it saves time is stronger than just saying it is good."
    },
    {
      name: "Band 6 to 7",
      useWhen: "The answer has ideas but lacks control.",
      moves: ["Use one clear structure.", "Reduce repetition.", "Give a specific example."],
      example: "Instead of repeating nice, say peaceful, affordable, or convenient and explain why."
    },
    {
      name: "Band 7 to 8",
      useWhen: "The answer is good but not flexible or precise enough.",
      moves: ["Add nuance.", "Use topic-specific vocabulary.", "Connect personal and social meaning."],
      example: "It is useful personally, but from a broader perspective it also affects public life."
    }
  ]
};

export const transferableStrategySections = [
  universalFrameworks,
  languageFunctions,
  topicBuckets,
  rescuePatterns,
  bandUpgradeRules
];
