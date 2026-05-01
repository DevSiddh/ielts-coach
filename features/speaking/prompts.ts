import type { SpeakingPrompt } from "./types";

export const prompts: SpeakingPrompt[] = [
  {
    id: "hometown-official",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Hometown",
    question: "What kind of place is your hometown, what is the most interesting part of it, and why is it a good place to live?",
    followUps: ["interesting places", "local jobs", "why people stay there"],
    sourceLabel: "British Council Take IELTS Part 1",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-1",
    yearLabel: "Official sample",
    answerFrame: ["Give a direct one-sentence description.", "Add one concrete feature or place.", "Finish with a personal reason or example."],
    whatGoodLooksLike: ["Answers sound personal, not memorized.", "The speaker gives one clear example.", "Sentences stay short and natural."],
    improvementTips: ["Use place adjectives like lively, peaceful, crowded, historic.", "Compare past and present if relevant.", "Avoid repeating 'good' and 'nice'."],
    referenceLinks: [
      {
        label: "Official Part 1 practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-1"
      },
      {
        label: "IELTS Liz common Part 1 topics",
        url: "https://ieltsliz.com/ielts-speaking-part-1-topics/"
      }
    ]
  },
  {
    id: "accommodation-official",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Accommodation",
    question: "Tell me about the place where you live, how long you have lived there, and what kind of home you would like in the future.",
    followUps: ["current home", "what you like", "future home"],
    sourceLabel: "British Council Take IELTS Part 1",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-1",
    yearLabel: "Official sample",
    answerFrame: ["State the type of home.", "Describe one or two features.", "Add a future preference with a reason."],
    whatGoodLooksLike: ["The answer uses present and future tenses correctly.", "Details are concrete, such as room, neighborhood, or commute.", "The ending sounds natural and personal."],
    improvementTips: ["Use structure words like currently, ideally, in the future.", "Mention convenience, comfort, or space.", "Avoid one-word answers."],
    referenceLinks: [
      {
        label: "Official Part 1 practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-1"
      }
    ]
  },
  {
    id: "work-study-official",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Work or study",
    question: "Are you working or studying right now, what is that experience like, and what do you like or dislike about it?",
    followUps: ["daily routine", "best part", "future plans"],
    sourceLabel: "British Council Take IELTS Practice Test 2",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-1",
    yearLabel: "Official sample",
    answerFrame: ["Answer the status question directly.", "Describe your environment or routine.", "Give one like and one challenge."],
    whatGoodLooksLike: ["The answer stays balanced and specific.", "Reasons are explained instead of listed.", "The speaker sounds comfortable discussing everyday life."],
    improvementTips: ["Use words like workload, schedule, flexible, demanding.", "Give one quick example from a recent day.", "Avoid memorized career speeches."],
    referenceLinks: [
      {
        label: "Official Speaking test 2 Part 1",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-1"
      },
      {
        label: "IELTS Liz recurring speaking topics",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      }
    ]
  },
  {
    id: "free-time-official",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Free time",
    question: "Do you have much free time, what do you usually do with it, and is there a new activity you would like to try?",
    followUps: ["outdoor time", "weekends", "future hobby"],
    sourceLabel: "British Council Take IELTS Practice Test 2",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-1",
    yearLabel: "Official sample",
    answerFrame: ["Say whether you have free time.", "Mention your main activity.", "Add one future activity with a reason."],
    whatGoodLooksLike: ["The answer sounds lively and personal.", "Time markers like weekends or evenings are used well.", "The speaker explains preferences clearly."],
    improvementTips: ["Use frequency phrases like once in a while or most weekends.", "Mention feelings such as refreshing or relaxing.", "Add one specific hobby detail."],
    referenceLinks: [
      {
        label: "Official Speaking test 2 Part 1",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-1"
      }
    ]
  },
  {
    id: "festival-official",
    strategyCategory: "part2-event",
    part: 2,
    difficulty: "medium",
    title: "Festival or event",
    question: "Describe a special event or festival that you liked. Say what it was, where it happened, what took place, and why you enjoyed it.",
    followUps: ["people there", "memories", "why it mattered"],
    sourceLabel: "British Council Take IELTS Practice Test 2",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-2",
    yearLabel: "Official sample",
    answerFrame: ["Set the scene first.", "Tell the event story in order.", "End with the reason it stayed memorable."],
    whatGoodLooksLike: ["The answer has a clear beginning, middle, and ending.", "Past tense is controlled well.", "The speaker adds sensory detail and emotion."],
    improvementTips: ["Use sequencing words like first, after that, eventually.", "Mention atmosphere, sound, weather, or crowd energy.", "Do not spend the whole answer only naming facts."],
    referenceLinks: [
      {
        label: "Official Part 2 practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-2"
      }
    ]
  },
  {
    id: "important-possession-official",
    strategyCategory: "part2-object",
    part: 2,
    difficulty: "medium",
    title: "Important possession",
    question: "Describe something you own that is very important to you. Explain where you got it, how long you have had it, what you use it for, and why it matters.",
    followUps: ["sentimental value", "daily use", "would you replace it"],
    sourceLabel: "British Council Take IELTS Part 2",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-2",
    yearLabel: "Official sample",
    answerFrame: ["Introduce the item fast.", "Describe how it entered your life.", "Explain practical use and emotional value."],
    whatGoodLooksLike: ["The answer avoids a shopping-list description.", "Reason and meaning are stronger than object details.", "The speaker sounds emotionally connected to the topic."],
    improvementTips: ["Use phrases like sentimental value, rely on it, attached to it.", "Give one short memory linked to the object.", "Avoid overusing very and really."],
    referenceLinks: [
      {
        label: "Official Part 2 practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-2"
      }
    ]
  },
  {
    id: "apartment-reported-2025",
    strategyCategory: "part2-place",
    part: 2,
    difficulty: "medium",
    title: "House or apartment",
    question: "Describe a house or apartment you would like to live in. Say where it would be, what you would do there, who you would live with, and why it appeals to you.",
    followUps: ["location", "design", "lifestyle"],
    sourceLabel: "IELTSMaterial recent 2025 topics",
    sourceType: "reported-recent",
    sourceUrl: "https://ieltsmaterial.com/ielts-speaking-topics/",
    yearLabel: "Reported recent 2025",
    answerFrame: ["Choose a realistic place.", "Describe two features clearly.", "Connect the home to your future lifestyle."],
    whatGoodLooksLike: ["The answer is imaginative but believable.", "The speaker explains preferences, not only appearance.", "Future tense is used accurately."],
    improvementTips: ["Use housing vocabulary like spacious, balcony, neighborhood, commute.", "Explain why each feature matters.", "Link the home to work, family, or peace of mind."],
    referenceLinks: [
      {
        label: "Reported recent 2025 cue cards",
        url: "https://ieltsmaterial.com/ielts-speaking-topics/"
      },
      {
        label: "Official housing-related Part 1 sample",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-1"
      }
    ]
  },
  {
    id: "teacher-influence-official",
    strategyCategory: "part2-person",
    part: 2,
    difficulty: "medium",
    title: "Teacher influence",
    question: "Describe a teacher who had a strong influence on you. Explain who the person was, what they taught, what they did, and why you still remember them.",
    followUps: ["teaching style", "life lesson", "long-term impact"],
    sourceLabel: "British Council classroom worksheet",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/sites/default/files/speaking_part_2_improving_grammatical_range_and_accuracy.pdf",
    yearLabel: "Official worksheet",
    answerFrame: ["Name the teacher and context.", "Describe one or two memorable actions.", "Explain the long-term effect on you."],
    whatGoodLooksLike: ["The story focuses on influence, not biography.", "The answer mixes description with reflection.", "Past and present meaning are connected."],
    improvementTips: ["Use impact language like encouraged me, pushed me, changed how I think.", "Include one classroom moment.", "Avoid only saying the teacher was nice."],
    referenceLinks: [
      {
        label: "Official Part 2 worksheet PDF",
        url: "https://takeielts.britishcouncil.org/sites/default/files/speaking_part_2_improving_grammatical_range_and_accuracy.pdf"
      }
    ]
  },
  {
    id: "values-and-status-official",
    strategyCategory: "part3-compare",
    part: 3,
    difficulty: "hard",
    title: "Values and status",
    question: "What kinds of possessions or achievements give people status in your country, and do you think that has changed over time?",
    followUps: ["status symbols", "consumer culture", "social pressure"],
    sourceLabel: "British Council Take IELTS Part 3",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-3",
    yearLabel: "Official sample",
    answerFrame: ["Give a general view first.", "Compare generations or time periods.", "Offer your own opinion with an example."],
    whatGoodLooksLike: ["The answer sounds analytical, not personal only.", "Contrast words like whereas and in contrast are used naturally.", "Examples support the opinion."],
    improvementTips: ["Use broader nouns like consumption, reputation, social standing.", "Balance social observation with your own view.", "Avoid a one-sided rant."],
    referenceLinks: [
      {
        label: "Official Part 3 practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking/part-3"
      }
    ]
  },
  {
    id: "celebrations-and-generations-official",
    strategyCategory: "part3-compare",
    part: 3,
    difficulty: "hard",
    title: "Celebrations in society",
    question: "Why are celebrations important in society, and do younger and older generations experience them differently?",
    followUps: ["cultural value", "family tradition", "modern changes"],
    sourceLabel: "British Council Take IELTS Practice Test 2",
    sourceType: "official-sample",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-3",
    yearLabel: "Official sample",
    answerFrame: ["Answer the social purpose first.", "Compare generations clearly.", "Finish with a balanced conclusion."],
    whatGoodLooksLike: ["The answer gives social reasons, not only personal preference.", "Comparisons are clear and logical.", "The speaker expands with examples from real life."],
    improvementTips: ["Use words like tradition, community, belonging, commercialization.", "Mention both emotional and cultural functions.", "Do not stay too narrow."],
    referenceLinks: [
      {
        label: "Official Speaking test 2 Part 3",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking-2/part-3"
      }
    ]
  },
  {
    id: "city-life-recurring",
    strategyCategory: "part3-causes-solutions",
    part: 3,
    difficulty: "hard",
    title: "City life",
    question: "Are cities becoming better places to live or more stressful, and what should governments do to improve urban life?",
    followUps: ["public transport", "housing pressure", "quality of life"],
    sourceLabel: "IELTS Liz recurring 2026 topics",
    sourceType: "common-recurring",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "Recurring topic",
    answerFrame: ["Take a position first.", "Give two causes or reasons.", "Suggest one realistic policy response."],
    whatGoodLooksLike: ["The speaker discusses causes and solutions.", "Topic vocabulary is varied and accurate.", "The answer shows control of abstract discussion."],
    improvementTips: ["Use urban vocabulary like congestion, affordability, infrastructure.", "Support your point with one real-world example.", "Avoid repeating stressful again and again."],
    referenceLinks: [
      {
        label: "IELTS Liz recurring speaking topics",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      }
    ]
  },
  {
    id: "social-media-recurring",
    strategyCategory: "part3-opinion",
    part: 3,
    difficulty: "hard",
    title: "Social media and relationships",
    question: "How has social media changed communication and relationships, and do you think the overall impact is positive or negative?",
    followUps: ["attention span", "fake connection", "benefits for distance"],
    sourceLabel: "IELTS Liz recurring 2026 topics",
    sourceType: "common-recurring",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "Recurring topic",
    answerFrame: ["State the overall change first.", "Give one positive and one negative effect.", "Take a final position."],
    whatGoodLooksLike: ["The answer is balanced before reaching a conclusion.", "Examples sound modern and believable.", "Opinion is supported rather than asserted."],
    improvementTips: ["Use contrast phrases like on the one hand and at the same time.", "Mention relationships, not just apps.", "Keep examples short and relevant."],
    referenceLinks: [
      {
        label: "IELTS Liz recurring speaking topics",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      },
      {
        label: "British Council speaking advice",
        url: "https://www.britishcouncil.org/voices-magazine/ten-dos-ielts-speaking-test"
      }
    ]
  },
  {
    id: "surprise-public-park",
    strategyCategory: "part2-place",
    part: 2,
    difficulty: "medium",
    title: "A public place",
    question: "Describe a public place in your area that people use often. Say where it is, who goes there, what people do there, and why it is useful.",
    followUps: ["who uses it", "local benefits", "future improvements"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Identify the place quickly.", "Describe the users and activities.", "Explain its value to the community."],
    whatGoodLooksLike: ["The answer stays concrete even if the topic is unexpected.", "The speaker explains public value, not only appearance.", "Details are organized by place, people, and purpose."],
    improvementTips: ["Use public-life words like facilities, accessible, community, crowded.", "Give one small observation from real life.", "If stuck, compare it with a similar place."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-useful-skill",
    strategyCategory: "part2-event",
    part: 2,
    difficulty: "medium",
    title: "A useful skill",
    question: "Describe a useful skill you learned outside school. Say what it was, how you learned it, how difficult it was, and how it helps you now.",
    followUps: ["learning process", "difficulty", "future use"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Name the skill.", "Explain the learning process.", "Show why it is useful now."],
    whatGoodLooksLike: ["The answer has a clear before-and-after story.", "The speaker explains effort and benefit.", "Examples show real use, not only general value."],
    improvementTips: ["Use learning vocabulary like practice, mistake, improve, confident.", "Mention one challenge you overcame.", "End with a current or future benefit."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-helpful-person",
    strategyCategory: "part2-person",
    part: 2,
    difficulty: "medium",
    title: "A helpful person",
    question: "Describe a person who helped you solve a problem. Explain who the person was, what the problem was, what they did, and how you felt afterwards.",
    followUps: ["kind of help", "relationship", "what you learned"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Introduce the person and problem.", "Describe the action they took.", "Explain the result and feeling."],
    whatGoodLooksLike: ["The answer focuses on help, not a full biography.", "The problem and solution are easy to follow.", "Emotion is included naturally."],
    improvementTips: ["Use verbs like advised, supported, explained, encouraged.", "Keep the problem simple.", "Say what changed because of the help."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-broken-object",
    strategyCategory: "part2-object",
    part: 2,
    difficulty: "medium",
    title: "Something that stopped working",
    question: "Describe something you owned that stopped working. Say what it was, what happened, how you dealt with it, and whether you replaced it.",
    followUps: ["repair or replace", "cost", "lesson learned"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Name the object.", "Explain the problem.", "Describe the solution and lesson."],
    whatGoodLooksLike: ["The answer turns an ordinary object into a clear mini-story.", "Past tense is controlled.", "The speaker explains a practical decision."],
    improvementTips: ["Use problem words like damaged, faulty, repair, replace.", "Mention one inconvenience it caused.", "End with what you would do differently."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-public-transport",
    strategyCategory: "part3-causes-solutions",
    part: 3,
    difficulty: "hard",
    title: "Public transport",
    question: "What problems do people face with public transport in cities, and what practical changes would improve the situation?",
    followUps: ["cost", "traffic", "government role"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Name two problems.", "Explain one cause.", "Suggest one realistic solution."],
    whatGoodLooksLike: ["The answer moves beyond personal complaints.", "Problems and solutions are linked.", "The speaker uses city vocabulary accurately."],
    improvementTips: ["Use words like reliability, congestion, routes, affordability.", "Give one example from commuters.", "Avoid only saying transport is bad."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-young-people-jobs",
    strategyCategory: "part3-opinion",
    part: 3,
    difficulty: "hard",
    title: "Young people and jobs",
    question: "Do you think young people today have more career opportunities than in the past, or is it harder for them to choose a stable job?",
    followUps: ["technology", "pressure", "skills"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Give a balanced opinion.", "Compare past and present.", "Support with one example."],
    whatGoodLooksLike: ["The answer handles both opportunity and pressure.", "The comparison is clear.", "The speaker avoids overgeneralizing."],
    improvementTips: ["Use work words like stability, competition, remote work, skills gap.", "Mention one field or example.", "End with your final view."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-health-habits",
    strategyCategory: "part3-compare",
    part: 3,
    difficulty: "hard",
    title: "Health habits",
    question: "How have people's health habits changed in recent years, and are these changes mostly positive or negative?",
    followUps: ["food choices", "exercise", "technology"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Describe the change.", "Give positive and negative sides.", "State your final judgement."],
    whatGoodLooksLike: ["The answer includes change over time.", "Examples cover habits, not medical detail.", "The conclusion is balanced."],
    improvementTips: ["Use phrases like more aware of, sedentary, balanced diet, screen time.", "Compare older and younger habits.", "Do not make unsupported health claims."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "surprise-environment-action",
    strategyCategory: "part3-causes-solutions",
    part: 3,
    difficulty: "hard",
    title: "Environmental action",
    question: "Who should take more responsibility for protecting the environment: individuals, companies, or governments?",
    followUps: ["individual choices", "business rules", "government policy"],
    sourceLabel: "IELTS Coach surprise drill",
    sourceType: "surprise-drill",
    sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking",
    yearLabel: "Surprise drill",
    answerFrame: ["Choose the main responsible group.", "Explain why others still matter.", "Give one practical action."],
    whatGoodLooksLike: ["The answer avoids a simplistic one-group answer.", "Responsibility is explained clearly.", "Examples are practical."],
    improvementTips: ["Use terms like regulation, consumption, waste, responsibility.", "Mention one policy or habit.", "Balance individual and system-level action."],
    referenceLinks: [
      {
        label: "Official speaking practice",
        url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/speaking"
      }
    ]
  },
  {
    id: "apps-2026",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Apps",
    question: "Do you often use apps, which app is most useful for you, and why do you use it so much?",
    followUps: ["daily use", "useful features", "paid apps"],
    sourceLabel: "IELTS Liz 2026 topics and IDP technology cluster",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Answer frequency directly.", "Name one app and its function.", "Explain the daily benefit with one example."],
    whatGoodLooksLike: ["The answer sounds personal rather than like an app review.", "The speaker explains usefulness clearly.", "Vocabulary includes function, convenience, or habit."],
    improvementTips: ["Use words like convenient, reliable, notification, feature.", "Mention one real situation when you use it.", "Avoid listing many apps without development."],
    referenceLinks: [
      {
        label: "IELTS Liz apps topic",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      },
      {
        label: "IDP technology and media topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  },
  {
    id: "books-2026",
    strategyCategory: "part1-personal",
    part: 1,
    difficulty: "easy",
    title: "Books and reading",
    question: "Do you like reading books, what kind of books or reading materials do you prefer, and has that changed since childhood?",
    followUps: ["e-books", "childhood reading", "popular books"],
    sourceLabel: "IELTS Liz 2026 topics",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Say whether you read often.", "Name the type of reading material.", "Compare now with childhood briefly."],
    whatGoodLooksLike: ["The answer uses change-over-time language.", "The speaker gives one specific genre or example.", "The tone stays natural and conversational."],
    improvementTips: ["Use words like fiction, biography, article, e-book.", "Add a time phrase such as when I was younger.", "Do not claim you read a lot if you cannot develop it."],
    referenceLinks: [
      {
        label: "IELTS Liz books topic",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      }
    ]
  },
  {
    id: "useful-app-2026",
    strategyCategory: "part2-object",
    part: 2,
    difficulty: "medium",
    title: "A useful app",
    question: "Describe a useful app or website. Say what it is, how you found it, what it helps you do, and why you would recommend it.",
    followUps: ["how you found it", "main feature", "who should use it"],
    sourceLabel: "IELTS Liz 2026 apps topic and IDP technology cluster",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Identify the app or website.", "Explain how it entered your routine.", "Describe one practical benefit and one limitation."],
    whatGoodLooksLike: ["The answer explains use, not only popularity.", "The speaker gives a real-life example.", "The ending includes a clear recommendation."],
    improvementTips: ["Use technology words like interface, feature, access, distraction.", "Include one short story of using it.", "Avoid sounding like an advertisement."],
    referenceLinks: [
      {
        label: "IELTS Liz apps cue card",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      },
      {
        label: "IDP technology and media topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  },
  {
    id: "challenge-2026",
    strategyCategory: "part2-event",
    part: 2,
    difficulty: "medium",
    title: "A difficult challenge",
    question: "Describe a difficult challenge you faced. Say what it was, when it happened, how you dealt with it, and what you learned from it.",
    followUps: ["pressure", "support", "lesson learned"],
    sourceLabel: "IELTS Liz 2026 challenges topic",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Name the challenge and time.", "Explain the problem clearly.", "Describe your response and the lesson."],
    whatGoodLooksLike: ["The answer has a clear problem-solution story.", "The speaker explains feelings without overdrama.", "The lesson connects naturally to the event."],
    improvementTips: ["Use challenge words like pressure, cope, overcome, setback.", "Show one action you took.", "End with a useful lesson, not just relief."],
    referenceLinks: [
      {
        label: "IELTS Liz challenges topic",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      }
    ]
  },
  {
    id: "travel-culture-2026",
    strategyCategory: "part3-compare",
    part: 3,
    difficulty: "hard",
    title: "Travel and culture",
    question: "How important is it for people to travel and experience different cultures, and can technology replace that experience?",
    followUps: ["tourism benefits", "online culture", "personal growth"],
    sourceLabel: "IDP 2026 travel and culture topics",
    sourceType: "verified-2026",
    sourceUrl: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics",
    yearLabel: "2026 current topic",
    answerFrame: ["State why travel matters.", "Compare real travel with online experience.", "Finish with a balanced judgement."],
    whatGoodLooksLike: ["The answer compares two experiences clearly.", "Examples include culture, people, or perspective.", "The conclusion is nuanced rather than extreme."],
    improvementTips: ["Use words like perspective, cultural exchange, stereotype, virtual.", "Give one realistic example from travel or media.", "Avoid saying technology is simply good or bad."],
    referenceLinks: [
      {
        label: "IDP travel and culture topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  },
  {
    id: "online-learning-2026",
    strategyCategory: "part3-opinion",
    part: 3,
    difficulty: "hard",
    title: "Online learning",
    question: "What are the advantages and disadvantages of online learning, and do you think it will become more important in the future?",
    followUps: ["educational apps", "classroom learning", "future education"],
    sourceLabel: "IELTS Liz 2026 education topic and IDP education cluster",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Give your overall view.", "Explain one advantage and one disadvantage.", "Predict the future with a reason."],
    whatGoodLooksLike: ["The answer handles both sides before deciding.", "The speaker uses education vocabulary accurately.", "The future prediction is supported."],
    improvementTips: ["Use phrases like flexible access, self-discipline, interaction.", "Compare online and classroom learning.", "Avoid repeating convenient as the only benefit."],
    referenceLinks: [
      {
        label: "IELTS Liz education topic",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      },
      {
        label: "IDP education and work topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  },
  {
    id: "confidence-social-media-2026",
    strategyCategory: "part3-causes-solutions",
    part: 3,
    difficulty: "hard",
    title: "Confidence and social media",
    question: "Does social media make people more or less confident, and what can young people do to use it in a healthier way?",
    followUps: ["appearance pressure", "comparison", "healthy habits"],
    sourceLabel: "IELTS Liz 2026 confidence topic and IDP social media cluster",
    sourceType: "verified-2026",
    sourceUrl: "https://ieltsliz.com/ielts-speaking-topics-2026/",
    yearLabel: "2026 current topic",
    answerFrame: ["Take a position.", "Explain the cause of the confidence effect.", "Suggest a practical habit or boundary."],
    whatGoodLooksLike: ["The answer links cause and solution.", "The speaker avoids overgeneralizing all young people.", "Vocabulary covers confidence, comparison, and online behavior."],
    improvementTips: ["Use words like comparison, self-image, validation, boundaries.", "Give one realistic habit such as limiting scrolling.", "Balance pressure with possible benefits."],
    referenceLinks: [
      {
        label: "IELTS Liz confidence topic",
        url: "https://ieltsliz.com/ielts-speaking-topics-2026/"
      },
      {
        label: "IDP technology and media topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  },
  {
    id: "culture-globalisation-2026",
    strategyCategory: "part3-compare",
    part: 3,
    difficulty: "hard",
    title: "Culture and globalisation",
    question: "How does globalisation affect local culture, and what should communities do to preserve traditions?",
    followUps: ["traditional festivals", "young people", "cultural heritage"],
    sourceLabel: "IDP 2026 culture and traditions cluster",
    sourceType: "verified-2026",
    sourceUrl: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics",
    yearLabel: "2026 current topic",
    answerFrame: ["Describe the cultural change.", "Give one benefit and one risk.", "Suggest a practical way to preserve traditions."],
    whatGoodLooksLike: ["The answer is social and abstract, not only personal.", "The speaker balances openness with preservation.", "Examples are tied to festivals, language, or daily customs."],
    improvementTips: ["Use phrases like cultural heritage, identity, influence, preserve.", "Mention one local tradition as evidence.", "Avoid treating globalisation as only harmful."],
    referenceLinks: [
      {
        label: "IDP culture and traditions topics",
        url: "https://ielts.idp.com/bangladesh/about/news-and-articles/article-ielts-speaking-topics"
      }
    ]
  }
];
