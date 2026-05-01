export const ieltsSpeaking2026 = {
  formatSummary: "IELTS Speaking remains a 3-part, 11-14 minute test in 2026.",
  totalDuration: "11-14 minutes",
  parts: {
    1: {
      label: "Part 1",
      examLength: "4-5 minutes",
      practiceTarget: "20-45 seconds per answer",
      aim: "Answer familiar personal questions naturally with a direct answer, one reason, and one specific detail."
    },
    2: {
      label: "Part 2",
      examLength: "3-4 minutes including preparation",
      practiceTarget: "1-2 minutes, with the examiner stopping the long turn at 2 minutes",
      aim: "Use the 1-minute preparation time, then speak continuously with a clear short-story structure."
    },
    3: {
      label: "Part 3",
      examLength: "4-5 minutes",
      practiceTarget: "45-75 seconds per answer",
      aim: "Develop abstract answers with opinion, reason, example, contrast, and consequence."
    }
  },
  publicCriteria: [
    "Fluency and coherence",
    "Lexical resource",
    "Grammatical range and accuracy",
    "Pronunciation"
  ],
  currentTopicClusters: [
    "home and hometown",
    "work or study",
    "apps and websites",
    "technology and social media",
    "education and online learning",
    "health and fitness",
    "environment and sustainable living",
    "culture, festivals, and traditions",
    "travel and tourism",
    "future goals and careers",
    "confidence and challenges",
    "books, media, and creativity"
  ],
  scoringFocus: [
    "keep speaking without long silence",
    "develop the exact topic instead of giving memorized templates",
    "use flexible topic vocabulary and paraphrase",
    "control sentence range and basic accuracy",
    "make pronunciation clear through pace, stress, rhythm, and intelligibility"
  ],
  youtubeTrainingSignals: [
    {
      channel: "IELTS Advantage",
      signal: "Train natural, non-memorized answers and use public band descriptors as the scoring target."
    },
    {
      channel: "Fastrack IELTS",
      signal: "Practise the full Part 1, Part 2, and Part 3 question flow rather than isolated cue-card memorization."
    },
    {
      channel: "E2 IELTS",
      signal: "Build repeatable answer systems for extending, explaining, and repairing answers under pressure."
    },
    {
      channel: "Ross IELTS Academy",
      signal: "Use mock-test feedback to notice hesitation, underdevelopment, weak vocabulary, and unclear pronunciation."
    },
    {
      channel: "IELTS Energy / All Ears English",
      signal: "Part 3 needs scalable abstract practice: opinion, reason, example, consequence, and contrast."
    }
  ],
  sources: [
    {
      label: "IELTS.org Academic Speaking format",
      url: "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking"
    },
    {
      label: "IELTS Speaking public band descriptors",
      url: "https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf"
    },
    {
      label: "IDP IELTS Speaking Topics 2026",
      url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
    },
    {
      label: "IELTS Liz Speaking Topics 2026",
      url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
    },
    {
      label: "British Council speaking practice tests",
      url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests/speaking"
    }
  ]
} as const;
