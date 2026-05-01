import type { SpeakingStrategy, StrategyCategory } from "./types";

export const strategyOrder: StrategyCategory[] = [
  "part1-personal",
  "part2-person",
  "part2-place",
  "part2-object",
  "part2-event",
  "part3-opinion",
  "part3-compare",
  "part3-causes-solutions"
];

export const strategies: Record<StrategyCategory, SpeakingStrategy> = {
  "part1-personal": {
    id: "part1-personal",
    label: "Part 1: Personal Answer Coach",
    focus: "Answer directly, then add one reason and one example without sounding memorized.",
    idealLength: "20-35 seconds",
    openingOptions: [
      "Yes, definitely. In my case...",
      "I'd say...",
      "For me, the main reason is..."
    ],
    structure: [
      "Give a direct answer in one sentence.",
      "Add one concrete detail or reason.",
      "Finish with a quick personal example."
    ],
    developmentMoves: [
      "Use a time marker like nowadays, usually, or most weekends.",
      "Add one small personal habit.",
      "Explain why it matters to you."
    ],
    rescueLines: [
      "What I mean is...",
      "A simple example is...",
      "The main thing for me is..."
    ],
    highBandPhrases: [
      "to be honest",
      "what I like most is",
      "one thing that stands out is"
    ],
    commonMistakes: [
      "Giving only one short sentence",
      "Sounding memorized or too formal",
      "Listing points without a reason"
    ],
    upgradeTips: [
      "Use natural spoken linking instead of long formal sentences.",
      "Add one specific detail instead of a vague adjective.",
      "Keep the answer personal and easy to follow."
    ],
    bandLadders: {
      band6: ["Direct answer, simple reason, understandable example."],
      band7: ["Natural tone, clearer extension, less repetition."],
      band8: ["Fast topic control, precise detail, effortless flow."]
    }
  },
  "part2-person": {
    id: "part2-person",
    label: "Part 2: Person Story Coach",
    focus: "Describe the person clearly, then show influence or significance through a short story.",
    idealLength: "1-2 minutes",
    openingOptions: [
      "I'd like to talk about a person who had a strong impact on me.",
      "One person I remember very clearly is...",
      "The person that comes to mind immediately is..."
    ],
    structure: [
      "Introduce who the person is and how you know them.",
      "Give one or two memorable details.",
      "Tell one short moment or action.",
      "Explain why the person still matters."
    ],
    developmentMoves: [
      "Describe personality through actions, not labels only.",
      "Add one specific conversation or situation.",
      "Link the person to a lasting lesson."
    ],
    rescueLines: [
      "What made this person memorable was...",
      "Another thing I admired was...",
      "The reason I still remember them is..."
    ],
    highBandPhrases: [
      "had a lasting influence on me",
      "set a strong example",
      "changed the way I think"
    ],
    commonMistakes: [
      "Giving biography instead of impact",
      "Repeating nice or supportive without evidence",
      "Forgetting to explain why the person mattered"
    ],
    upgradeTips: [
      "Show influence through one real event.",
      "Mix description with reflection.",
      "End with a clear long-term effect."
    ],
    bandLadders: {
      band6: ["Clear description and one reason they matter."],
      band7: ["Better storytelling and stronger reflection."],
      band8: ["Precise detail, emotional control, natural narrative."]
    }
  },
  "part2-place": {
    id: "part2-place",
    label: "Part 2: Place Description Coach",
    focus: "Make the place vivid, practical, and personally meaningful.",
    idealLength: "1-2 minutes",
    openingOptions: [
      "I'd like to describe a place that really appeals to me.",
      "One place I would love to talk about is...",
      "The place that stands out to me is..."
    ],
    structure: [
      "Name the place and location.",
      "Describe two visible features.",
      "Explain what you would do there.",
      "Finish with why it suits your lifestyle."
    ],
    developmentMoves: [
      "Use sensory details like light, space, atmosphere, or noise.",
      "Connect the place to your routine.",
      "Mention convenience and feeling together."
    ],
    rescueLines: [
      "What I especially like about it is...",
      "Another detail worth mentioning is...",
      "The main reason it attracts me is..."
    ],
    highBandPhrases: [
      "a peaceful atmosphere",
      "well-connected to the city",
      "fits the kind of lifestyle I want"
    ],
    commonMistakes: [
      "Only listing rooms or furniture",
      "Using too many generic adjectives",
      "Not linking the place to personal meaning"
    ],
    upgradeTips: [
      "Explain why each feature matters.",
      "Use place vocabulary with function and feeling.",
      "Balance description with reflection."
    ],
    bandLadders: {
      band6: ["Basic description with some useful detail."],
      band7: ["Clearer imagery and better personal connection."],
      band8: ["Vivid but controlled description with natural evaluation."]
    }
  },
  "part2-object": {
    id: "part2-object",
    label: "Part 2: Object Value Coach",
    focus: "Move beyond description and explain the practical and emotional value of the object.",
    idealLength: "1-2 minutes",
    openingOptions: [
      "I'd like to describe an object that means a lot to me.",
      "One thing I own that is really important to me is...",
      "The object I want to talk about is..."
    ],
    structure: [
      "Name the object quickly.",
      "Explain where it came from.",
      "Describe how you use it.",
      "Finish with why it matters to you."
    ],
    developmentMoves: [
      "Add one memory connected to the object.",
      "Show both practical use and emotional value.",
      "Use one example of when it helped you."
    ],
    rescueLines: [
      "What makes it special is...",
      "I rely on it because...",
      "The emotional value comes from..."
    ],
    highBandPhrases: [
      "has sentimental value",
      "I rely on it regularly",
      "I'm quite attached to it"
    ],
    commonMistakes: [
      "Only describing appearance",
      "Repeating important without explanation",
      "Ignoring emotional meaning"
    ],
    upgradeTips: [
      "Use one practical point and one personal memory.",
      "Avoid sounding like a product review.",
      "End with meaning, not just function."
    ],
    bandLadders: {
      band6: ["Clear function and basic personal value."],
      band7: ["Better memory detail and emotional explanation."],
      band8: ["Precise vocabulary and layered meaning."]
    }
  },
  "part2-event": {
    id: "part2-event",
    label: "Part 2: Event Story Coach",
    focus: "Tell the event as a short story with sequence, atmosphere, and reflection.",
    idealLength: "1-2 minutes",
    openingOptions: [
      "I'd like to talk about a special event that I still remember clearly.",
      "One event I really enjoyed was...",
      "A memorable event that comes to mind is..."
    ],
    structure: [
      "Name the event and place.",
      "Set the scene briefly.",
      "Explain what happened in order.",
      "Describe why it stayed memorable."
    ],
    developmentMoves: [
      "Add one sensory detail.",
      "Mention one person involved.",
      "Explain your feeling during the event."
    ],
    rescueLines: [
      "What made it special was...",
      "Another thing I remember clearly is...",
      "The main reason it stayed in my mind is..."
    ],
    highBandPhrases: [
      "what stood out to me was",
      "the atmosphere was incredible",
      "it left a strong impression on me"
    ],
    commonMistakes: [
      "Listing facts without telling a story",
      "Using flat sequencing with no reflection",
      "Spending too long on background detail"
    ],
    upgradeTips: [
      "Use sequencing words naturally.",
      "Add one emotional reaction and one reflection.",
      "End with why it mattered, not only what happened."
    ],
    bandLadders: {
      band6: ["Clear story, simple detail, understandable ending."],
      band7: ["Better linking, richer description, clearer reflection."],
      band8: ["Natural pacing, precise vocabulary, strong narrative control."]
    }
  },
  "part3-opinion": {
    id: "part3-opinion",
    label: "Part 3: Opinion Coach",
    focus: "Take a clear position early, support it, and stay balanced enough to sound thoughtful.",
    idealLength: "35-55 seconds",
    openingOptions: [
      "In my view, the overall impact is...",
      "I would say this is mostly positive, although...",
      "Personally, I think the main issue is..."
    ],
    structure: [
      "State your opinion clearly.",
      "Give one strong reason.",
      "Add one example or consequence.",
      "Finish with a short balanced comment."
    ],
    developmentMoves: [
      "Use contrast if the issue has two sides.",
      "Move from personal view to social effect.",
      "Give one realistic example instead of several weak ones."
    ],
    rescueLines: [
      "The main reason I think that is...",
      "A good example would be...",
      "That said, there is also another side to it..."
    ],
    highBandPhrases: [
      "in my view",
      "overall impact",
      "from a broader perspective"
    ],
    commonMistakes: [
      "Saying yes or no without development",
      "Giving extreme opinions with no balance",
      "Repeating the same idea in different words"
    ],
    upgradeTips: [
      "Anchor every opinion to a reason.",
      "Use one example to make the answer concrete.",
      "Add a contrast before your final view."
    ],
    bandLadders: {
      band6: ["Clear position and one reason."],
      band7: ["Better balance, better examples, stronger linking."],
      band8: ["Confident nuance, precise phrasing, natural abstract discussion."]
    }
  },
  "part3-compare": {
    id: "part3-compare",
    label: "Part 3: Compare Two Sides Coach",
    focus: "Compare groups, time periods, or perspectives clearly before giving your own view.",
    idealLength: "40-60 seconds",
    openingOptions: [
      "I think there is a noticeable difference between the two.",
      "They do experience it differently, mainly because...",
      "Compared with the past, the situation has changed in several ways."
    ],
    structure: [
      "State the main comparison.",
      "Explain one side first.",
      "Contrast it with the other side.",
      "Finish with your conclusion or evaluation."
    ],
    developmentMoves: [
      "Use clear contrast markers.",
      "Compare one dimension at a time.",
      "Explain why the difference exists."
    ],
    rescueLines: [
      "On the one hand...",
      "By contrast...",
      "The difference mainly comes from..."
    ],
    highBandPhrases: [
      "whereas",
      "in contrast",
      "compared with previous generations"
    ],
    commonMistakes: [
      "Jumping between sides with no structure",
      "Giving two lists instead of a comparison",
      "Forgetting to state what the difference means"
    ],
    upgradeTips: [
      "Use one contrast word per transition, not too many.",
      "Compare causes, not only examples.",
      "End with a short judgment on the comparison."
    ],
    bandLadders: {
      band6: ["Basic comparison with understandable contrast."],
      band7: ["Clearer organization and stronger reasoning."],
      band8: ["Elegant contrast, strong synthesis, natural evaluation."]
    }
  },
  "part3-causes-solutions": {
    id: "part3-causes-solutions",
    label: "Part 3: Causes and Solutions Coach",
    focus: "Explain what drives the problem, then suggest realistic responses instead of vague wishes.",
    idealLength: "45-60 seconds",
    openingOptions: [
      "I think the issue is getting worse for a few clear reasons.",
      "There are both benefits and pressures, but the main causes are...",
      "If we want to improve this, we need to look at both causes and solutions."
    ],
    structure: [
      "Take a position on the issue.",
      "Give one or two causes.",
      "Suggest one realistic response.",
      "Finish with the likely impact of that solution."
    ],
    developmentMoves: [
      "Move from cause to consequence.",
      "Keep solutions practical and specific.",
      "Link policy ideas to daily life."
    ],
    rescueLines: [
      "One major cause is...",
      "As a result...",
      "A realistic way to improve this would be..."
    ],
    highBandPhrases: [
      "a major contributing factor",
      "public investment",
      "improve quality of life"
    ],
    commonMistakes: [
      "Listing problems without causes",
      "Giving vague solutions like government should help",
      "Forgetting to explain how the solution works"
    ],
    upgradeTips: [
      "Use one cause and one consequence clearly.",
      "Prefer realistic policies over idealistic statements.",
      "Tie the answer back to citizens' daily experience."
    ],
    bandLadders: {
      band6: ["Clear problem and one workable solution."],
      band7: ["Better causal logic and practical detail."],
      band8: ["Strong policy reasoning with concise abstract control."]
    }
  }
};
