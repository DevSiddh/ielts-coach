import type { AudioSignals, EvidenceSignals, SpeakingEvaluation, SpeakingPrompt } from "./types";

const FILLER_PATTERNS = [
  { label: "uh", pattern: /\bu+h+\b/g },
  { label: "um", pattern: /\bu+m+\b/g },
  { label: "ah", pattern: /\ba+h+\b/g },
  { label: "er", pattern: /\be+r+\b/g },
  { label: "err", pattern: /\be+r+r+\b/g },
  { label: "hmm", pattern: /\bh+m+\b/g },
  { label: "huh", pattern: /\bh+u+h+\b/g },
  { label: "like", pattern: /\blike\b/g },
  { label: "you know", pattern: /\byou know\b/g },
  { label: "sort of", pattern: /\bsort of\b/g },
  { label: "kind of", pattern: /\bkind of\b/g },
  { label: "blah", pattern: /\bblah\b/g }
];
const STRONG_WORDS = ["however", "therefore", "although", "because", "important", "effective", "improve", "develop"];

const KEYWORD_BANK: Record<string, string[]> = {
  place: ["located", "atmosphere", "convenient", "peaceful", "neighborhood"],
  person: ["supportive", "influenced", "admire", "personality", "role model"],
  object: ["useful", "sentimental", "reliable", "practical", "attached to"],
  event: ["memorable", "atmosphere", "celebration", "crowd", "experience"],
  opinion: ["in my view", "for instance", "whereas", "as a result", "balanced"],
  general: ["because", "for example", "especially", "overall", "compared with"]
};

const IMPROVED_ANSWER_OVERRIDES: Partial<Record<string, string>> = {
  "social-media-recurring":
    "In my view, social media has changed communication in both positive and negative ways. On the positive side, it allows people to stay in touch instantly through messaging, video calls, and file sharing, even when they live far apart. However, it can also weaken face-to-face relationships and expose young users to harmful content if it is not used carefully. Overall, I would say the impact is mostly positive when it supports real connection, but it becomes harmful when it replaces healthy interaction.",
  "city-life-recurring":
    "I think modern cities offer many advantages, but they can also be stressful if growth is poorly managed. On the positive side, cities usually provide better transport, healthcare, education, and career opportunities than smaller places. However, people often face traffic congestion, expensive housing, and a much faster pace of life. Overall, cities can be great places to live, but governments need to invest in public transport, affordable housing, and green spaces to keep them livable.",
  "values-and-status-official":
    "In my country, status is often linked to visible success, such as owning property, driving an expensive car, or having a high-paying job. In the past, people usually respected age, family background, or professional stability more strongly, but today social media and consumer culture have changed that. As a result, younger people are often judged by what they display rather than by long-term character or achievement. Overall, I think status symbols have become more materialistic over time.",
  "celebrations-and-generations-official":
    "I think celebrations are important because they bring people together and strengthen a sense of belonging. Older generations often value the traditional and family side of celebrations more, whereas younger people may focus more on entertainment and sharing the experience online. Even so, both groups still use celebrations to create memories and maintain relationships. Overall, the purpose remains similar, but the way people experience celebrations has clearly changed.",
  "surprise-public-transport":
    "One major problem with public transport in cities is that it is often overcrowded and unreliable, especially during rush hour. Another issue is that some routes do not connect residential areas with workplaces efficiently, so people waste time in traffic or choose private vehicles instead. In my view, cities should invest in more frequent services, better route planning, and affordable ticket prices. If transport becomes more reliable and convenient, far more people will use it."
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w'\s]/g, " ").replace(/\s+/g, " ").trim();
}

function words(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

function sentences(text: string) {
  return text
    .split(/[.!?]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function roundHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toBand(value: number, baseline = 4.5, range = 4) {
  const band = baseline + (clamp(value, 0, 100) / 100) * range;
  return roundHalf(clamp(band, 3, 8.5));
}

function countOccurrences(text: string, needle: string) {
  const normalized = normalize(text);
  if (needle.includes(" ")) {
    return normalized.includes(needle) ? 1 : 0;
  }
  return normalized.split(" ").reduce((count, token) => count + (token === needle ? 1 : 0), 0);
}

function countPattern(text: string, pattern: RegExp) {
  return (normalize(text).match(pattern) || []).length;
}

function findFillerEvidence(text: string) {
  return FILLER_PATTERNS.map((item) => ({
    label: item.label,
    count: countPattern(text, item.pattern)
  })).filter((item) => item.count > 0);
}

function findStretchedWords(text: string) {
  return words(text).filter((word) => /([a-z])\1{2,}/i.test(word));
}

function countPhraseRestarts(text: string) {
  const lower = normalize(text);
  let count = 0;
  count += (lower.match(/\b([a-z]+)\s+\1\b/g) || []).length;
  count += (lower.match(/\bit is\s+it is\b/g) || []).length;
  count += (lower.match(/\bi mean\b/g) || []).length;
  count += (lower.match(/\bi don't know how to explain\b/g) || []).length;
  return count;
}

function countGrammarSignals(text: string) {
  const lower = normalize(text);
  let penalties = 0;
  penalties += (lower.match(/\bis it is\b/g) || []).length * 5;
  penalties += (lower.match(/\bi think .{0,40}\bis it is\b/g) || []).length * 4;
  penalties += (lower.match(/\bi is\b/g) || []).length * 6;
  penalties += (lower.match(/\bhe go\b/g) || []).length * 5;
  penalties += (lower.match(/\bshe go\b/g) || []).length * 5;
  penalties += (lower.match(/\bpeople is\b/g) || []).length * 5;
  penalties += (lower.match(/\bthere is many\b/g) || []).length * 5;
  penalties += (lower.match(/\bmore better\b/g) || []).length * 6;
  penalties += (lower.match(/\bhelp with each other\b/g) || []).length * 5;
  penalties += (lower.match(/\bvery very\b/g) || []).length * 4;
  penalties += (lower.match(/\bthing\b/g) || []).length;
  return penalties;
}

function countPromptCoverage(text: string, prompt: SpeakingPrompt) {
  const lower = normalize(text);
  const promptTokens = new Set(words(prompt.question).filter((word) => word.length > 4));
  let hits = 0;
  promptTokens.forEach((token) => {
    if (lower.includes(token)) hits += 1;
  });
  return hits;
}

function inferTopicType(prompt: SpeakingPrompt) {
  const text = normalize(`${prompt.title} ${prompt.question}`);
  if (prompt.part === 3 || /why|do you think|should|changed|impact/.test(text)) return "opinion";
  if (/teacher|person|people|friend|family/.test(text)) return "person";
  if (/place|city|house|apartment|home|room|country/.test(text)) return "place";
  if (/possession|something you own|object|item|device|gift/.test(text)) return "object";
  if (/event|festival|celebration|memory|experience/.test(text)) return "event";
  return "general";
}

function titlePhrase(prompt: SpeakingPrompt) {
  return prompt.title.toLowerCase().replace(/[^a-z0-9\s/&-]/g, "").trim();
}

function transcriptHasAny(transcript: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(transcript));
}

function buildGenericImprovedAnswer(prompt: SpeakingPrompt, transcript: string) {
  const lower = normalize(transcript);
  const subject = titlePhrase(prompt);

  if (prompt.part === 1) {
    return `I would describe ${subject || "this topic"} in a simple but clear way. One thing that stands out is that it affects daily life quite directly, so it is easy to talk about with a personal example. Overall, a strong answer should sound natural, specific, and personal rather than memorized.`;
  }

  if (prompt.part === 2) {
    return `I'd like to talk about ${subject || "this topic"} because it is easy to explain with clear details and a personal memory. First, I would briefly introduce the situation and give the necessary background. Then I would add one or two concrete details before explaining why it stayed in my mind. Overall, this kind of answer works best when it feels like a short story rather than a list of facts.`;
  }

  const positiveDetail = transcriptHasAny(lower, [/video call/, /message/, /communicat/, /file sharing/, /distance/, /connect/, /region/])
    ? "For example, people can now stay in touch instantly through messages, video calls, and shared content."
    : "For example, it can make communication or daily life more efficient.";
  const negativeDetail = transcriptHasAny(lower, [/child/, /kid/, /adhd/, /harm/, /negative/, /restrict/, /screen/])
    ? "However, it can also create problems for young users if it reduces attention span or exposes them to harmful content."
    : "However, it can also create social or practical problems if people rely on it too much.";

  return `In my view, ${subject || "this issue"} has both advantages and disadvantages. On the positive side, it has changed modern life in a practical way. ${positiveDetail} ${negativeDetail} Overall, I think the impact can be positive, but only if people use it in a balanced and responsible way.`;
}

function buildImprovedAnswer(prompt: SpeakingPrompt, transcript: string) {
  return IMPROVED_ANSWER_OVERRIDES[prompt.id] ?? buildGenericImprovedAnswer(prompt, transcript);
}

export function evaluateSpeaking({
  transcript,
  prompt,
  durationSeconds = 0,
  audioSignals,
  evidenceSignals
}: {
  transcript: string;
  prompt: SpeakingPrompt;
  durationSeconds?: number;
  audioSignals?: AudioSignals | null;
  evidenceSignals?: EvidenceSignals | null;
}): SpeakingEvaluation {
  const clean = transcript.trim();
  const wordList = words(clean);
  const sentenceList = sentences(clean);
  const wordCount = wordList.length;
  const uniqueCount = new Set(wordList).size;
  const uniqueRatio = wordCount ? uniqueCount / wordCount : 0;
  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  const avgSentenceLength = sentenceList.length ? wordCount / sentenceList.length : wordCount;

  const fillerEvidence = findFillerEvidence(clean);
  const fillerHits = fillerEvidence.map((item) => item.label);
  const fillerCount = fillerEvidence.reduce((count, filler) => count + filler.count, 0);
  const strongWordHits = STRONG_WORDS.filter((item) => normalize(clean).includes(item)).length;
  const repeatedWords = wordList.filter((word, index) => word === wordList[index - 1]).length;
  const stretchedWords = findStretchedWords(clean);
  const stretchedWordCount = stretchedWords.length;
  const phraseRestarts = countPhraseRestarts(clean);
  const punctuationCount = (transcript.match(/[.!?;,]/g) || []).length;
  const runOnTranscript = wordCount >= 80 && sentenceList.length <= 1;
  const grammarPenalty = countGrammarSignals(clean);
  const promptCoverage = countPromptCoverage(clean, prompt);
  const paragraphDepth = sentenceList.filter((sentence) => sentence.split(" ").length >= 7).length;
  const audioLongPauses = audioSignals?.longPauseCount ?? 0;
  const audioPauseCount = audioSignals?.pauseCount ?? 0;
  const lowSpeechRatio = audioSignals && audioSignals.durationSeconds > 0 && audioSignals.speechRatio < 0.62;
  const audioHesitationClusters = audioSignals?.hesitationClusters.length ?? 0;
  const mergedExtraFillers = (evidenceSignals?.fillerWords ?? []).filter((item) => !fillerHits.includes(item));
  const mergedFillerCount = evidenceSignals?.fillerWordCount ?? 0;
  const mergedRepeatCount = evidenceSignals?.repeatedPhrases.length ?? 0;
  const mergedRestartCount = evidenceSignals?.restartSignals.length ?? 0;
  const clarityRiskCount = evidenceSignals?.clarityRisks.length ?? 0;
  const transcriptPauseCount = evidenceSignals?.transcriptPauseCount ?? 0;
  const transcriptLongPauseCount = evidenceSignals?.transcriptLongPauseCount ?? 0;
  const transcriptHesitationClusters = evidenceSignals?.hesitationClusterCount ?? 0;
  const lowConfidenceWordCount = evidenceSignals?.lowConfidenceWordCount ?? 0;
  const lowConfidenceWords = evidenceSignals?.lowConfidenceWords ?? [];
  const averageTranscriptConfidence = evidenceSignals?.averageWordConfidence;

  const fluencyRaw =
    62 +
    Math.min(20, wordCount * 0.16) +
    Math.min(12, paragraphDepth * 3.5) -
    fillerCount * 7 -
    repeatedWords * 4 -
    stretchedWordCount * 3 -
    phraseRestarts * 3 -
    mergedExtraFillers.length * 4 -
    Math.max(0, mergedFillerCount - fillerCount) * 1.2 -
    mergedRepeatCount * 2 -
    mergedRestartCount * 2 -
    transcriptPauseCount * 0.8 -
    transcriptLongPauseCount * 2.5 -
    transcriptHesitationClusters * 2 -
    audioLongPauses * 5 -
    audioHesitationClusters * 3 -
    (lowSpeechRatio ? 10 : 0) -
    (runOnTranscript ? 14 : 0) -
    Math.max(0, 70 - wpm) * 0.45 -
    Math.max(0, wpm - 175) * 0.35;

  const grammarRaw =
    58 +
    Math.min(16, sentenceList.length * 4) +
    Math.min(10, avgSentenceLength * 0.7) -
    grammarPenalty -
    repeatedWords * 2 -
    stretchedWordCount * 1.5 -
    phraseRestarts * 2 -
    clarityRiskCount * 3 -
    transcriptLongPauseCount * 1.5 -
    (runOnTranscript ? 12 : 0) -
    Math.max(0, 1 - punctuationCount / Math.max(1, sentenceList.length)) * 8;

  const lexicalRaw =
    55 +
    uniqueRatio * 28 +
    strongWordHits * 5 +
    Math.min(12, promptCoverage * 2.2) -
    Math.max(0, 0.46 - uniqueRatio) * 42 -
    phraseRestarts * 1.5 -
    clarityRiskCount * 2 -
    transcriptPauseCount * 0.4 -
    (runOnTranscript ? 8 : 0);

  const pronunciationRaw =
    57 +
    Math.min(18, wordCount * 0.12) -
    fillerCount * 6 -
    mergedExtraFillers.length * 4 -
    Math.max(0, mergedFillerCount - fillerCount) * 1.4 -
    stretchedWordCount * 3 -
    phraseRestarts * 2 -
    clarityRiskCount * 4 -
    transcriptLongPauseCount * 2 -
    transcriptHesitationClusters * 1.5 -
    lowConfidenceWordCount * 1.4 -
    audioLongPauses * 4 -
    audioHesitationClusters * 2 -
    (lowSpeechRatio ? 8 : 0) -
    (runOnTranscript ? 8 : 0) -
    Math.max(0, 80 - wpm) * 0.38 -
    Math.max(0, wpm - 170) * 0.28 -
    (typeof averageTranscriptConfidence === "number" && averageTranscriptConfidence < 0.86
      ? (0.86 - averageTranscriptConfidence) * 35
      : 0);

  const criteria = {
    fluency: toBand(fluencyRaw, 4.0, 4.2),
    grammar: toBand(grammarRaw, 4.0, 4.0),
    lexical: toBand(lexicalRaw, 4.0, 4.2),
    pronunciation: toBand(pronunciationRaw, 4.0, 4.1)
  };

  let overallBand = roundHalf(
    (criteria.fluency + criteria.grammar + criteria.lexical + criteria.pronunciation) / 4
  );
  if (wordCount < 35) overallBand = Math.min(overallBand, 5);
  if (fillerCount >= 4) overallBand = Math.max(4, overallBand - 0.5);
  if (stretchedWordCount >= 2) overallBand = Math.max(4, overallBand - 0.5);
  if (audioLongPauses >= 2) overallBand = Math.max(4, overallBand - 0.5);
  if (transcriptLongPauseCount >= 3) overallBand = Math.max(4, overallBand - 0.5);
  if (lowSpeechRatio) overallBand = Math.min(overallBand, 6);
  if (clarityRiskCount >= 2) overallBand = Math.min(overallBand, 6);
  if (lowConfidenceWordCount >= 4) overallBand = Math.min(overallBand, 6);
  if ((mergedExtraFillers.length + mergedRepeatCount + mergedRestartCount) >= 4) {
    overallBand = Math.min(overallBand, 6);
  }
  if (runOnTranscript && (fillerCount + repeatedWords + stretchedWordCount + phraseRestarts >= 4)) {
    overallBand = Math.min(overallBand, 5.5);
  }
  if (runOnTranscript && grammarPenalty >= 8) overallBand = Math.min(overallBand, 5);
  if (grammarPenalty >= 8) overallBand = Math.max(4, overallBand - 0.5);

  const strengths = [];
  if (wordCount > 60) strengths.push("You gave enough detail to support your main idea.");
  if (uniqueRatio > 0.55) strengths.push("Your vocabulary range is moving beyond very basic wording.");
  if (strongWordHits > 0) strengths.push("You used linking language that helps coherence.");
  if (durationSeconds >= 45) strengths.push("Your answer length is closer to IELTS speaking timing.");
  if (promptCoverage >= 3) strengths.push("You stayed reasonably close to the topic.");
  if (!strengths.length) strengths.push("You completed the answer; now the goal is to add clearer structure and detail.");

  const fixes = [];
  if (fillerCount > 0) fixes.push(`Reduce filler words like ${fillerHits.join(", ")}.`);
  if (mergedExtraFillers.length > 0) fixes.push(`Extra filler evidence from another transcript: ${mergedExtraFillers.join(", ")}.`);
  if (mergedFillerCount > fillerCount) fixes.push("The raw transcript captured additional filler-word evidence beyond the cleaned text.");
  if (repeatedWords > 0) fixes.push("Avoid repeating the same word back-to-back.");
  if (mergedRepeatCount > 0) fixes.push("Reduce repeated phrases captured across the preserved transcript evidence.");
  if (stretchedWordCount > 0) fixes.push(`Avoid stretched hesitation forms like ${stretchedWords.slice(0, 3).join(", ")}.`);
  if (phraseRestarts > 0) fixes.push("Reduce restarts and self-corrections before developing the idea.");
  if (transcriptLongPauseCount > 0) fixes.push("Transcript timing shows long gaps, so use a rescue phrase sooner and keep the idea moving.");
  if (transcriptHesitationClusters > 0) fixes.push("Hesitation clusters were detected around fillers or pauses; aim for smoother continuation.");
  if (audioLongPauses > 0) fixes.push("Reduce long silent pauses by using a short rescue phrase and continuing.");
  if (lowSpeechRatio) fixes.push("Keep speaking through the answer; too much of the recording is silence.");
  if (lowConfidenceWordCount > 0) fixes.push(`Review lower-confidence words from the transcript evidence: ${lowConfidenceWords.slice(0, 4).join(", ")}.`);
  if (clarityRiskCount > 0) fixes.push("Review possible pronunciation or clarity risks from suspicious transcript wording.");
  if (runOnTranscript) fixes.push("Use clearer sentence boundaries instead of one long run-on answer.");
  if (sentenceList.length < 2) fixes.push("Split your answer into clearer sentences.");
  if (promptCoverage < 2) fixes.push("Answer the exact topic more directly before adding extra ideas.");
  if (grammarPenalty >= 6) fixes.push("Watch subject-verb agreement and basic sentence control.");
  if (wpm && wpm < 90) fixes.push("Speak a little more steadily and confidently.");
  if (wpm && wpm > 185) fixes.push("Slow down slightly so your ideas sound clearer.");
  if (!fixes.length) fixes.push("Add one more example to make the answer stronger.");

  const blockers = [];
  if (wordCount < 45) blockers.push("The answer is too short to fully show IELTS-level fluency and development.");
  if (fillerCount >= 2) blockers.push(`Filler words weaken delivery: ${fillerHits.join(", ")}.`);
  if (stretchedWordCount >= 2) blockers.push(`Stretched hesitation forms were detected: ${stretchedWords.slice(0, 4).join(", ")}.`);
  if (phraseRestarts >= 2) blockers.push("Repeated starts and self-corrections reduce fluency control.");
  if (mergedRepeatCount >= 2) blockers.push("Repeated phrases appeared across the transcript evidence.");
  if (transcriptLongPauseCount >= 2) blockers.push("Transcript timing shows multiple long hesitation gaps.");
  if (transcriptHesitationClusters >= 2) blockers.push("Transcript timing suggests clustered hesitation around fillers or pauses.");
  if (clarityRiskCount >= 2) blockers.push("Possible pronunciation or clarity risks were detected from suspicious transcript wording.");
  if (lowConfidenceWordCount >= 4) blockers.push("Several lower-confidence words suggest clarity or consistency problems in the spoken answer.");
  if (audioLongPauses >= 2) blockers.push(`${audioLongPauses} long pause${audioLongPauses === 1 ? "" : "s"} were detected in the audio.`);
  if (lowSpeechRatio) blockers.push("Audio evidence shows too much silence compared with active speech.");
  if (runOnTranscript) blockers.push("The transcript reads as one long run-on answer, so coherence and grammar control are weaker.");
  if (uniqueRatio < 0.5 && wordCount > 25) blockers.push("Vocabulary range is limited because too many words are repeated.");
  if (promptCoverage < 2) blockers.push("The answer needs a clearer link to the exact question.");
  if (grammarPenalty >= 6) blockers.push("Basic grammar control is reducing the estimated band.");
  if (wpm && (wpm < 90 || wpm > 185)) blockers.push("Pacing is outside the strongest speaking range, so fluency sounds less natural.");
  if (!blockers.length) blockers.push("You are close to the next band; add a clearer example and a stronger final point.");

  const whyThisScore = [
    `Fluency: ${wordCount} words in ${durationSeconds ? `${durationSeconds} seconds` : "an untimed answer"}${wpm ? `, around ${wpm} WPM` : ""}.`,
    `Disfluency evidence: ${fillerCount} filler word${fillerCount === 1 ? "" : "s"}, ${repeatedWords} immediate repeat${repeatedWords === 1 ? "" : "s"}, ${phraseRestarts} restart/self-correction signal${phraseRestarts === 1 ? "" : "s"}, and ${stretchedWordCount} stretched form${stretchedWordCount === 1 ? "" : "s"}.`,
    evidenceSignals
      ? `Merged transcript evidence: ${evidenceSignals.fillerWords.length} filler type${evidenceSignals.fillerWords.length === 1 ? "" : "s"}, ${mergedFillerCount} filler-token hit${mergedFillerCount === 1 ? "" : "s"}, ${mergedRepeatCount} repeated phrase${mergedRepeatCount === 1 ? "" : "s"}, ${mergedRestartCount} restart signal${mergedRestartCount === 1 ? "" : "s"}, ${clarityRiskCount} clarity risk${clarityRiskCount === 1 ? "" : "s"}.`
      : "Merged transcript evidence: not available for this attempt.",
    evidenceSignals
      ? `Transcript timing evidence: ${transcriptPauseCount} pause gap${transcriptPauseCount === 1 ? "" : "s"}, ${transcriptLongPauseCount} long gap${transcriptLongPauseCount === 1 ? "" : "s"}, ${transcriptHesitationClusters} hesitation cluster${transcriptHesitationClusters === 1 ? "" : "s"}, max gap ${evidenceSignals.maxTranscriptPauseSeconds.toFixed(1)}s.`
      : "Transcript timing evidence: not available for this attempt.",
    evidenceSignals
      ? `Transcript confidence evidence: ${lowConfidenceWordCount} low-confidence word${lowConfidenceWordCount === 1 ? "" : "s"}${typeof averageTranscriptConfidence === "number" ? `, average confidence ${(averageTranscriptConfidence * 100).toFixed(0)}%` : ""}.`
      : "Transcript confidence evidence: not available for this attempt.",
    audioSignals
      ? `Audio evidence: ${audioPauseCount} pause${audioPauseCount === 1 ? "" : "s"}, ${audioLongPauses} long pause${audioLongPauses === 1 ? "" : "s"}, ${(audioSignals.speechRatio * 100).toFixed(0)}% speech ratio.`
      : "Audio evidence: not available for this attempt.",
    `Grammar: ${sentenceList.length || 0} clear sentence unit${sentenceList.length === 1 ? "" : "s"} with ${grammarPenalty} grammar-risk signal${grammarPenalty === 1 ? "" : "s"}.`,
    `Vocabulary: ${(uniqueRatio * 100).toFixed(0)}% unique-word ratio and ${strongWordHits} stronger linking/content word${strongWordHits === 1 ? "" : "s"}.`,
    `Relevance: ${promptCoverage} direct topic signal${promptCoverage === 1 ? "" : "s"} found from the question.`
  ];

  const topicType = inferTopicType(prompt);
  const keywordSuggestions = KEYWORD_BANK[topicType] ?? KEYWORD_BANK.general;
  const approachPlan = prompt.part === 3
    ? ["Give a clear opinion first.", "Explain one reason with an example.", "Add a contrast or consequence.", "Finish with a short balanced conclusion."]
    : prompt.part === 2
      ? ["Open with the topic and context.", "Add two concrete details.", "Tell one short personal moment.", "End by explaining why it matters."]
      : ["Answer directly in one sentence.", "Add one reason or detail.", "Give a quick personal example."];

  const nextTryFocus = blockers[0] ?? fixes[0] ?? "Add one specific example and speak naturally.";

  const summary = `Estimated band ${overallBand.toFixed(1)}. This score is based on IELTS-style signals for fluency, grammar, lexical range, topic coverage, and pronunciation clues from pacing and hesitation, not an official examiner score.`;

  const cleanedAnswer = clean
    ? clean
        .replace(/\b(u+h+|u+m+|a+h+|e+r+|h+m+|like|you know|sort of|kind of|blah)\b/gi, "")
        .replace(/\s+/g, " ")
        .replace(/\s([,.!?;:])/g, "$1")
        .trim()
    : "";

  const improvedAnswer = buildImprovedAnswer(prompt, cleanedAnswer || clean);

  const voiceScript = [
    `Your estimated IELTS speaking band is ${overallBand.toFixed(1)}.`,
    `Fluency ${criteria.fluency.toFixed(1)}, grammar ${criteria.grammar.toFixed(1)}, vocabulary ${criteria.lexical.toFixed(1)}, pronunciation signal ${criteria.pronunciation.toFixed(1)}.`,
    `Your priority for the next try is: ${nextTryFocus}`,
    `Try this Band 8 style version: ${improvedAnswer}`
  ].join(" ");

  return {
    overallBand,
    criteria,
    fillers: fillerHits,
    strengths,
    fixes,
    summary,
    improvedAnswer,
    voiceScript,
    durationSeconds,
    wordCount,
    blockers,
    whyThisScore,
    keywordSuggestions,
    approachPlan,
    nextTryFocus
  };
}
