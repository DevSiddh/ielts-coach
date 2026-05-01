export type PronunciationWord = {
  spelling: string;
  simpleSound: string;
  stress: string;
  ipa: string;
  meaning: string;
  tip: string;
  spellingTrap: string;
  examples: string[];
  tags: string[];
};

export type WordFamily = {
  id: string;
  label: string;
  meaning: string;
  words: string[];
  usageNotes: string[];
};

export const pronunciationWords: PronunciationWord[] = [
  {
    spelling: "important",
    simpleSound: "im-POR-tunt",
    stress: "POR",
    ipa: "/im-POR-tunt/",
    meaning: "something that matters a lot",
    tip: "Stress POR and keep the final t light.",
    spellingTrap: "Do not say im-por-TANT with a heavy last syllable.",
    examples: ["Clear pronunciation is important when you move to another country."],
    tags: ["stress", "common", "ielts"]
  },
  {
    spelling: "crucial",
    simpleSound: "KROO-shul",
    stress: "KROO",
    ipa: "/KROO-shul/",
    meaning: "extremely important",
    tip: "Two syllables with a sh sound in the middle.",
    spellingTrap: "The cial ending sounds like shul.",
    examples: ["It is crucial to explain your opinion with one clear reason."],
    tags: ["sh", "synonym", "ielts"]
  },
  {
    spelling: "significant",
    simpleSound: "sig-NIF-uh-kunt",
    stress: "NIF",
    ipa: "/sig-NIF-uh-kunt/",
    meaning: "large or important enough to notice",
    tip: "Stress NIF and keep the ending short.",
    spellingTrap: "Do not stress sig or cant.",
    examples: ["Public transport can make a significant difference in city life."],
    tags: ["stress", "task-2"]
  },
  {
    spelling: "essential",
    simpleSound: "ih-SEN-shul",
    stress: "SEN",
    ipa: "/ih-SEN-shul/",
    meaning: "necessary and very important",
    tip: "Stress SEN and pronounce tial like shul.",
    spellingTrap: "The t is not a hard t sound.",
    examples: ["Good listening practice is essential for natural pronunciation."],
    tags: ["sh", "stress"]
  },
  {
    spelling: "valuable",
    simpleSound: "VAL-yoo-uh-bul",
    stress: "VAL",
    ipa: "/VAL-yoo-uh-bul/",
    meaning: "useful or worth a lot",
    tip: "Stress VAL and keep four light beats.",
    spellingTrap: "Do not say value-able as two separate words.",
    examples: ["Recording your voice gives valuable practice evidence."],
    tags: ["stress", "useful"]
  },
  {
    spelling: "problem",
    simpleSound: "PROB-lum",
    stress: "PROB",
    ipa: "/PROB-lum/",
    meaning: "something difficult that needs a solution",
    tip: "Two syllables; the second syllable is light.",
    spellingTrap: "Do not add an extra vowel after b.",
    examples: ["Mispronouncing new words can become a serious problem abroad."],
    tags: ["daily", "ielts"]
  },
  {
    spelling: "challenge",
    simpleSound: "CHAL-inj",
    stress: "CHAL",
    ipa: "/CHAL-inj/",
    meaning: "a difficult task",
    tip: "Start with ch and end with a soft j sound.",
    spellingTrap: "The ge ending sounds like j.",
    examples: ["Learning unfamiliar spelling patterns is a real challenge."],
    tags: ["ch", "soft-g"]
  },
  {
    spelling: "issue",
    simpleSound: "ISH-oo",
    stress: "ISH",
    ipa: "/ISH-oo/",
    meaning: "a topic or problem people discuss",
    tip: "Two syllables; starts like ish.",
    spellingTrap: "Do not say iss-you if your target is natural US-style speech.",
    examples: ["Pronunciation is an issue for many learners who learned from spelling."],
    tags: ["sh", "daily"]
  },
  {
    spelling: "solution",
    simpleSound: "suh-LOO-shun",
    stress: "LOO",
    ipa: "/suh-LOO-shun/",
    meaning: "an answer to a problem",
    tip: "Stress LOO and pronounce tion like shun.",
    spellingTrap: "The tion ending is shun, not tee-on.",
    examples: ["One solution is to practice each new word in a full sentence."],
    tags: ["sh", "task-2"]
  },
  {
    spelling: "recommend",
    simpleSound: "rek-uh-MEND",
    stress: "MEND",
    ipa: "/rek-uh-MEND/",
    meaning: "to suggest something useful",
    tip: "Stress MEND; the middle syllable is light.",
    spellingTrap: "Double m in spelling, but no extra m sound.",
    examples: ["I recommend recording problem words every day."],
    tags: ["stress", "solution"]
  },
  {
    spelling: "improve",
    simpleSound: "im-PROOV",
    stress: "PROOV",
    ipa: "/im-PROOV/",
    meaning: "to make something better",
    tip: "Stress PROOV and hold the oo sound.",
    spellingTrap: "Do not shorten the oo sound too much.",
    examples: ["You can improve pronunciation by training sounds, not only spelling."],
    tags: ["long-vowel", "ielts"]
  },
  {
    spelling: "develop",
    simpleSound: "di-VEL-up",
    stress: "VEL",
    ipa: "/di-VEL-up/",
    meaning: "to grow or build gradually",
    tip: "Stress VEL; do not stress de.",
    spellingTrap: "The first syllable is light.",
    examples: ["You develop confidence by repeating words in real sentences."],
    tags: ["stress", "speaking"]
  },
  {
    spelling: "useful",
    simpleSound: "YOOS-ful",
    stress: "YOOS",
    ipa: "/YOOS-ful/",
    meaning: "helpful or practical",
    tip: "Stress YOOS and keep ful light.",
    spellingTrap: "Useful starts with a y sound.",
    examples: ["A personal problem-word bank is useful for daily review."],
    tags: ["y-sound", "daily"]
  },
  {
    spelling: "beneficial",
    simpleSound: "ben-uh-FISH-ul",
    stress: "FISH",
    ipa: "/ben-uh-FISH-ul/",
    meaning: "helpful and good for someone",
    tip: "Stress FISH; cial sounds like shul.",
    spellingTrap: "Do not say benefit-cial.",
    examples: ["Slow playback is beneficial when a word is new."],
    tags: ["sh", "task-2"]
  },
  {
    spelling: "difficult",
    simpleSound: "DIF-uh-kult",
    stress: "DIF",
    ipa: "/DIF-uh-kult/",
    meaning: "not easy",
    tip: "Stress DIF and keep three clean syllables.",
    spellingTrap: "Do not make it four syllables.",
    examples: ["Some English words are difficult because spelling hides the sound."],
    tags: ["stress", "daily"]
  },
  {
    spelling: "complicated",
    simpleSound: "KOM-pluh-kay-tid",
    stress: "KOM",
    ipa: "/KOM-pluh-kay-tid/",
    meaning: "having many parts and hard to understand",
    tip: "Stress KOM and keep the middle relaxed.",
    spellingTrap: "The a in cated sounds like kay.",
    examples: ["Pronunciation feels complicated when every word is learned from spelling."],
    tags: ["stress", "daily"]
  },
  {
    spelling: "common",
    simpleSound: "KOM-un",
    stress: "KOM",
    ipa: "/KOM-un/",
    meaning: "happening often",
    tip: "Two syllables; stress KOM.",
    spellingTrap: "Do not pronounce both m letters separately.",
    examples: ["Silent letters are common in English."],
    tags: ["daily", "spelling"]
  },
  {
    spelling: "frequent",
    simpleSound: "FREE-kwunt",
    stress: "FREE",
    ipa: "/FREE-kwunt/",
    meaning: "happening often",
    tip: "Stress FREE and keep the second syllable short.",
    spellingTrap: "The qu sounds like kw.",
    examples: ["Frequent listening helps you stop guessing from spelling."],
    tags: ["kw", "ielts"]
  },
  {
    spelling: "safe",
    simpleSound: "SAYF",
    stress: "SAYF",
    ipa: "/SAYF/",
    meaning: "not dangerous",
    tip: "One syllable with a long ay sound.",
    spellingTrap: "The final e makes the vowel long.",
    examples: ["Clear speech helps you feel safe asking for help abroad."],
    tags: ["long-vowel", "travel"]
  },
  {
    spelling: "secure",
    simpleSound: "sih-KYOOR",
    stress: "KYOOR",
    ipa: "/sih-KYOOR/",
    meaning: "safe and protected",
    tip: "Stress KYOOR and keep the first syllable light.",
    spellingTrap: "Do not say see-cure with equal stress.",
    examples: ["Good communication makes daily life feel more secure."],
    tags: ["stress", "travel"]
  },
  {
    spelling: "expensive",
    simpleSound: "ik-SPEN-siv",
    stress: "SPEN",
    ipa: "/ik-SPEN-siv/",
    meaning: "costing a lot of money",
    tip: "Stress SPEN; the first syllable is light.",
    spellingTrap: "The x sounds like ks, but it is not heavily stressed.",
    examples: ["Accommodation can be expensive in big cities."],
    tags: ["travel", "stress"]
  },
  {
    spelling: "costly",
    simpleSound: "KOST-lee",
    stress: "KOST",
    ipa: "/KOST-lee/",
    meaning: "expensive",
    tip: "Two syllables; stress KOST.",
    spellingTrap: "Do not add an extra vowel after st.",
    examples: ["A pronunciation mistake can be costly in an interview."],
    tags: ["travel", "daily"]
  },
  {
    spelling: "explain",
    simpleSound: "ik-SPLAYN",
    stress: "SPLAYN",
    ipa: "/ik-SPLAYN/",
    meaning: "to make something clear",
    tip: "Stress SPLAYN; the first syllable is light.",
    spellingTrap: "Do not say ex-plain with equal stress.",
    examples: ["If someone does not understand, explain the word slowly."],
    tags: ["stress", "speaking"]
  },
  {
    spelling: "clarify",
    simpleSound: "KLAIR-uh-fy",
    stress: "KLAIR",
    ipa: "/KLAIR-uh-fy/",
    meaning: "to make something easier to understand",
    tip: "Stress KLAIR and keep the ending fy clear.",
    spellingTrap: "The y ending sounds like eye.",
    examples: ["You can clarify your meaning by giving one example."],
    tags: ["speaking", "travel"]
  }
];

export const wordFamilies: WordFamily[] = [
  {
    id: "important",
    label: "Important",
    meaning: "Words for saying something matters",
    words: ["important", "crucial", "significant", "essential", "valuable"],
    usageNotes: ["Use important for normal speech.", "Use crucial or essential when something is necessary.", "Use significant in formal IELTS answers."]
  },
  {
    id: "problem",
    label: "Problem",
    meaning: "Words for trouble or difficulty",
    words: ["problem", "challenge", "issue", "difficulty", "complication"],
    usageNotes: ["Problem is direct.", "Challenge sounds more positive.", "Issue is useful for social topics."]
  },
  {
    id: "solution",
    label: "Solution",
    meaning: "Words for answers and recommendations",
    words: ["solution", "answer", "recommend", "approach", "strategy"],
    usageNotes: ["Solution fits problem essays.", "Recommend is an action verb.", "Approach and strategy sound more formal."]
  },
  {
    id: "improve",
    label: "Improve",
    meaning: "Words for getting better",
    words: ["improve", "develop", "strengthen", "upgrade", "progress"],
    usageNotes: ["Improve is the safest everyday word.", "Develop means grow gradually.", "Strengthen fits skills and confidence."]
  },
  {
    id: "useful",
    label: "Useful",
    meaning: "Words for practical value",
    words: ["useful", "helpful", "beneficial", "practical", "valuable"],
    usageNotes: ["Useful and helpful are natural.", "Beneficial is more formal.", "Practical means it works in real life."]
  },
  {
    id: "difficult",
    label: "Difficult",
    meaning: "Words for hard situations",
    words: ["difficult", "hard", "complicated", "demanding", "challenging"],
    usageNotes: ["Hard is casual.", "Difficult is neutral.", "Demanding means it needs effort."]
  },
  {
    id: "common",
    label: "Common",
    meaning: "Words for things that happen often",
    words: ["common", "frequent", "regular", "widespread", "typical"],
    usageNotes: ["Common is safe in speech.", "Frequent is about repeated events.", "Widespread is good for society topics."]
  },
  {
    id: "safe",
    label: "Safe",
    meaning: "Words for safety and confidence",
    words: ["safe", "secure", "protected", "reliable", "confident"],
    usageNotes: ["Safe means no danger.", "Secure means protected.", "Reliable means people can trust it."]
  },
  {
    id: "expensive",
    label: "Expensive",
    meaning: "Words for high cost",
    words: ["expensive", "costly", "pricey", "unaffordable", "overpriced"],
    usageNotes: ["Expensive is neutral.", "Pricey is casual.", "Unaffordable means people cannot pay for it."]
  },
  {
    id: "explain",
    label: "Explain",
    meaning: "Words for making meaning clear",
    words: ["explain", "clarify", "describe", "define", "illustrate"],
    usageNotes: ["Explain is general.", "Clarify means make clear.", "Illustrate means explain with an example."]
  }
];
