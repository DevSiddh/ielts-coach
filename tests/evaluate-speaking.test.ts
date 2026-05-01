import test from "node:test";
import assert from "node:assert/strict";

import { evaluateSpeaking } from "../features/speaking/evaluate.ts";
import { prompts } from "../features/speaking/prompts.ts";

const hometownPrompt = prompts.find((prompt) => prompt.id === "hometown-official")!;
const cityLifePrompt = prompts.find((prompt) => prompt.id === "city-life-recurring")!;
const socialMediaPrompt = prompts.find((prompt) => prompt.id === "social-media-recurring")!;

test("short answers are capped and flagged as underdeveloped", () => {
  const result = evaluateSpeaking({
    transcript: "My hometown is nice and peaceful.",
    prompt: hometownPrompt,
    durationSeconds: 12
  });

  assert.equal(result.wordCount < 35, true);
  assert.equal(result.overallBand <= 5, true);
  assert.equal(
    result.blockers.includes("The answer is too short to fully show IELTS-level fluency and development."),
    true
  );
});

test("filler-heavy answers score worse than cleaner answers on the same topic", () => {
  const fillerHeavy = evaluateSpeaking({
    transcript:
      "Uh, my hometown is, like, a quiet town and um it is nice. You know, there are parks and uh local markets, and like people are friendly, but um I sometimes repeat myself because I get nervous.",
    prompt: hometownPrompt,
    durationSeconds: 75
  });

  const cleaner = evaluateSpeaking({
    transcript:
      "My hometown is a quiet town with several parks, local markets, and friendly neighbors. It is a good place to live because daily life feels peaceful, and I can reach most places easily. One of the most interesting parts is the old market area because it is always lively and full of local food.",
    prompt: hometownPrompt,
    durationSeconds: 75
  });

  assert.equal(fillerHeavy.fillers.length > 0, true);
  assert.equal(
    fillerHeavy.fixes.some((item) => item.startsWith("Reduce filler words like")),
    true
  );
  assert.equal(
    fillerHeavy.blockers.some((item) => item.startsWith("Filler words weaken delivery")),
    true
  );
  assert.equal(fillerHeavy.overallBand < cleaner.overallBand, true);
});

test("raw hesitation spellings and stretched forms are treated as scoring evidence", () => {
  const result = evaluateSpeaking({
    transcript:
      "Hmm err I I think my hometown is peaceful anddd it is useful because people can um walk to markets. Haa I mean there are parks and shops, but soooo sometimes I cannot explain clearly.",
    prompt: hometownPrompt,
    durationSeconds: 50
  });

  assert.equal(result.fillers.includes("hmm"), true);
  assert.equal(result.fillers.includes("err"), true);
  assert.equal(result.fillers.includes("um"), true);
  assert.equal(
    result.fixes.some((item) => item.startsWith("Avoid stretched hesitation forms like")),
    true
  );
  assert.equal(
    result.whyThisScore.some((item) => item.startsWith("Disfluency evidence:")),
    true
  );
});

test("normalized messy raw transcript is capped below band 6", () => {
  const result = evaluateSpeaking({
    transcript:
      "hmm I think my hometown is it is a very nice place but but sometimes I don't know how to explain it properly mmm the most interesting part is the old market because there are many shops and people are like always walking there and I mean the place is not very modern but it has a kind of friendly feeling when I was small I used to go there with my father and we buy vegetables and snacks so it is connected with my childhood and also the roads are sometimes crowded and noisy so it is not perfect but I still feel comfortable there because people know each other and they help with each other huh overall i think my hometown is good for living because it is peaceful familiar and not too expensive",
    prompt: hometownPrompt,
    durationSeconds: 75
  });

  assert.equal(result.overallBand <= 5.5, true);
  assert.equal(result.fillers.includes("hmm"), true);
  assert.equal(result.fillers.includes("huh"), true);
  assert.equal(
    result.blockers.includes("The transcript reads as one long run-on answer, so coherence and grammar control are weaker."),
    true
  );
  assert.equal(
    result.blockers.includes("Repeated starts and self-corrections reduce fluency control."),
    true
  );
});

test("audio pause evidence lowers fluency and appears in scoring explanation", () => {
  const transcript =
    "My hometown is a quiet town with parks, markets, and friendly neighbors. It is a good place to live because daily life feels peaceful and familiar. I also like the old market because it reminds me of childhood.";
  const withoutAudio = evaluateSpeaking({
    transcript,
    prompt: hometownPrompt,
    durationSeconds: 80
  });
  const withAudio = evaluateSpeaking({
    transcript,
    prompt: hometownPrompt,
    durationSeconds: 80,
    audioSignals: {
      source: "test",
      durationSeconds: 80,
      speechSeconds: 38,
      silenceSeconds: 42,
      speechRatio: 0.475,
      longPauses: [
        { start: 8, end: 9.4, duration: 1.4 },
        { start: 22, end: 24.2, duration: 2.2 }
      ],
      pauseCount: 5,
      longPauseCount: 2,
      hesitationClusters: [
        { start: 7.6, end: 9.8, pauseDuration: 1.4 },
        { start: 21.6, end: 24.6, pauseDuration: 2.2 }
      ]
    }
  });

  assert.equal(withAudio.overallBand < withoutAudio.overallBand, true);
  assert.equal(withAudio.blockers.includes("2 long pauses were detected in the audio."), true);
  assert.equal(
    withAudio.whyThisScore.some((item) => item === "Audio evidence: 5 pauses, 2 long pauses, 48% speech ratio."),
    true
  );
});

test("stronger structured answers earn higher bands and richer feedback", () => {
  const result = evaluateSpeaking({
    transcript:
      "I think cities are becoming better places to live, although they are definitely more demanding than before. In my view, the biggest reason is that urban areas now offer better transport, healthcare, and access to education, which improves daily life for many people. However, that progress creates pressure because housing is expensive and traffic can still waste a lot of time. For example, many young professionals can find better jobs in large cities, whereas their quality of life drops if rent takes most of their salary. Governments should therefore invest in public transport, affordable housing, and public spaces, because those changes make growth more balanced. Overall, city life can be positive if development focuses on convenience as well as well-being.",
    prompt: cityLifePrompt,
    durationSeconds: 95
  });

  assert.equal(result.overallBand >= 6, true);
  assert.equal(
    result.strengths.includes("You used linking language that helps coherence."),
    true
  );
  assert.equal(
    result.strengths.includes("You stayed reasonably close to the topic."),
    true
  );
  assert.equal(result.keywordSuggestions.includes("in my view"), true);
  assert.deepEqual(result.approachPlan, [
    "Give a clear opinion first.",
    "Explain one reason with an example.",
    "Add a contrast or consequence.",
    "Finish with a short balanced conclusion."
  ]);
});

test("band 8 sample answer is a real rewrite for social media prompts", () => {
  const rawTranscript =
    "social media has uh the balance it affects like it has postures as well as negatives coming to the postures postures are because the conversation becomes very fast after introducing social media like facebook x and instagram many people interact with each other";

  const result = evaluateSpeaking({
    transcript: rawTranscript,
    prompt: socialMediaPrompt,
    durationSeconds: 70
  });

  assert.equal(result.improvedAnswer.includes("postures"), false);
  assert.equal(result.improvedAnswer.includes("uh"), false);
  assert.equal(result.improvedAnswer.startsWith("In my view, social media has changed communication"), true);
  assert.equal(result.improvedAnswer.includes("On the positive side"), true);
  assert.equal(result.improvedAnswer.includes("However"), true);
});
