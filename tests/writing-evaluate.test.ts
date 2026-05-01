import test from "node:test";
import assert from "node:assert/strict";
import { evaluateWriting } from "../features/writing/evaluate.ts";
import { writingPrompts } from "../features/writing/prompts.ts";

const prompt = writingPrompts[0];

const strongEssay = `In my opinion, online learning is useful, but it is not more effective than classroom learning in every situation. It gives students flexibility and access to resources, yet schools still provide structure and direct support that many learners need.

The main advantage of online learning is convenience. Students can review recorded lessons, study from home, and use digital materials at their own pace. For example, a university student who works part time can watch lectures in the evening instead of missing classes completely. As a result, online learning can make education more accessible.

However, classroom learning is often stronger for discussion, discipline, and immediate feedback. When students sit with teachers and classmates, they can ask questions quickly and develop communication skills. Moreover, younger learners may lose concentration online because social media and games are only one click away.

In conclusion, I believe online learning is an effective support tool, but it should not fully replace classroom learning. The best approach is a balanced system that combines digital flexibility with face-to-face teaching.`;

test("short essays are capped and cite word count evidence", () => {
  const result = evaluateWriting({
    prompt,
    essay: "I agree with online learning. It is flexible and useful. However, classroom learning is also important."
  });

  assert.equal(result.label, "Practice estimate");
  assert.ok(result.overallBand <= 5.5);
  assert.ok(result.mainIssue.includes("under 250 words"));
  assert.ok(result.criterionEvidence[0].evidence.some((item) => item.includes("below")));
});

test("missing conclusion is detected and cited", () => {
  const result = evaluateWriting({
    prompt,
    essay: `In my opinion, online learning is sometimes effective because it gives students flexibility.

Students can watch lessons at home and review difficult topics. For example, workers can study after their jobs.

However, classrooms help students ask questions and stay focused. Teachers can also notice problems quickly.`
  });

  assert.equal(result.evidence.missingConclusion, true);
  assert.ok(result.improvements.some((item) => item.includes("Conclusion")));
});

test("unclear opinion lowers task response", () => {
  const unclear = evaluateWriting({ prompt, essay: strongEssay.replace("In my opinion, ", "").replace("I believe ", "") });
  const clear = evaluateWriting({ prompt, essay: strongEssay });

  assert.equal(unclear.evidence.unclearOpinion, true);
  assert.ok(clear.criteria.taskResponse > unclear.criteria.taskResponse);
});

test("one-paragraph essay lowers coherence and paragraph evidence is visible", () => {
  const oneParagraph = evaluateWriting({ prompt, essay: strongEssay.replace(/\n\n/g, " ") });
  const structured = evaluateWriting({ prompt, essay: strongEssay });

  assert.equal(oneParagraph.evidence.paragraphCount, 1);
  assert.ok(oneParagraph.criteria.coherenceCohesion < structured.criteria.coherenceCohesion);
});

test("repeated vocabulary lowers lexical resource", () => {
  const repeatedEssay = strongEssay.replace(/learning/g, "learning learning learning");
  const repeated = evaluateWriting({ prompt, essay: repeatedEssay });
  const clean = evaluateWriting({ prompt, essay: strongEssay });

  assert.ok(repeated.evidence.repeatedWords.some((item) => item.word === "learning"));
  assert.ok(repeated.criteria.lexicalResource < clean.criteria.lexicalResource);
});

test("weak linking is detected", () => {
  const result = evaluateWriting({
    prompt,
    essay: `I agree online learning is useful.

Students study at home. They watch videos. They use phones.

Classrooms help students. Teachers answer questions. Students talk together.

I agree online learning helps students.`
  });

  assert.equal(result.evidence.weakLinking, true);
});

test("sentence variety affects grammar score", () => {
  const flat = evaluateWriting({
    prompt,
    essay: `In my opinion, online learning is useful.

Students study online. Students watch videos. Students save time. Students use resources.

Classrooms help students. Teachers answer questions. Learners stay focused. Schools give support.

In conclusion, I think both forms are useful.`
  });
  const varied = evaluateWriting({ prompt, essay: strongEssay });

  assert.ok(varied.criteria.grammarAccuracy > flat.criteria.grammarAccuracy);
  assert.ok(varied.evidence.sentenceLengthRange > flat.evidence.sentenceLengthRange);
});

test("stronger structured essay scores higher than weak essay", () => {
  const weak = evaluateWriting({
    prompt,
    essay: "Online learning is good. It is easy. Students like it. Classes are also good. I think it is good."
  });
  const strong = evaluateWriting({ prompt, essay: strongEssay });

  assert.ok(strong.overallBand > weak.overallBand);
});

test("under-250 essay with high elapsed time produces timing warning", () => {
  const result = evaluateWriting({
    prompt,
    essay: `In my opinion, online learning is useful.

Students can study at home and review lessons. However, classrooms are also important because teachers can answer questions.

In conclusion, both forms are useful.`,
    timeSpentSeconds: 36 * 60
  });

  assert.equal(result.evidence.timing.timingStatus, "near-limit");
  assert.ok(result.mainIssue.includes("Near the 40-minute limit"));
  assert.ok(result.retryTarget.includes("40-minute"));
});

test("strong word count within 40 minutes has no timing risk", () => {
  const result = evaluateWriting({ prompt, essay: `${strongEssay}\n\n${strongEssay}`, timeSpentSeconds: 30 * 60 });

  assert.equal(result.evidence.timing.timingStatus, "on-track");
  assert.equal(result.evidence.timing.timeSpentSeconds, 1800);
});

test("missing timer data remains valid and displays not timed", () => {
  const result = evaluateWriting({ prompt, essay: strongEssay });

  assert.equal(result.evidence.timing.timingStatus, "not-timed");
  assert.equal(result.evidence.timing.timingWarning, "Timer was not used for this attempt.");
});
