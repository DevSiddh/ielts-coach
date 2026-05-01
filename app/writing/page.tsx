"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { evaluateWriting } from "@/features/writing/evaluate";
import {
  addCustomWritingPrompt,
  createCustomWritingPrompt,
  deleteCustomWritingPrompt,
  loadCustomWritingPrompts,
  saveCustomWritingPrompts
} from "@/features/writing/custom-prompts";
import { writingPrompts } from "@/features/writing/prompts";
import { saveWritingAttempt } from "@/features/writing/storage";
import { WRITING_TASK_2_TARGET_SECONDS, buildWritingTimingEvidence } from "@/features/writing/timing";
import type { WritingEvaluation, WritingPrompt } from "@/features/writing/types";
import { formatDuration } from "@/lib/format";

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/g).length : 0;
}

const flowSteps = ["Question", "Plan", "Write", "Evaluate", "Retry"] as const;

export default function WritingPage() {
  const [selectedPromptId, setSelectedPromptId] = useState(writingPrompts[0].id);
  const [plan, setPlan] = useState("");
  const [essay, setEssay] = useState("");
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [lastRetryTarget, setLastRetryTarget] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customPrompts, setCustomPrompts] = useState<WritingPrompt[]>([]);
  const [sessionPrompts, setSessionPrompts] = useState<WritingPrompt[]>([]);
  const [customStatus, setCustomStatus] = useState("Paste a recent Task 2 question to practice it.");
  const [showCustomQuestion, setShowCustomQuestion] = useState(false);
  const [lastSavedAttemptId, setLastSavedAttemptId] = useState<string | null>(null);

  const allPrompts = useMemo(() => [...sessionPrompts, ...customPrompts, ...writingPrompts], [customPrompts, sessionPrompts]);
  const prompt = allPrompts.find((item) => item.id === selectedPromptId) ?? writingPrompts[0];
  const wordCount = countWords(essay);
  const activeStep = evaluation ? "Evaluate" : essay.trim() ? "Write" : plan.trim() ? "Plan" : "Question";
  const liveTiming = buildWritingTimingEvidence({ wordCount, timeSpentSeconds: elapsedSeconds });
  const remainingSeconds = Math.max(0, WRITING_TASK_2_TARGET_SECONDS - elapsedSeconds);

  useEffect(() => {
    const loadedCustomPrompts = loadCustomWritingPrompts();
    setCustomPrompts(loadedCustomPrompts);
    const promptFromUrl = new URLSearchParams(window.location.search).get("prompt");
    const startupPrompts = [...writingPrompts, ...loadedCustomPrompts];
    if (promptFromUrl && startupPrompts.some((item) => item.id === promptFromUrl)) {
      setSelectedPromptId(promptFromUrl);
    }
  }, []);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const groupedPrompts = useMemo(
    () =>
      allPrompts.reduce<Record<string, WritingPrompt[]>>((groups, item) => {
        groups[item.theme] = [...(groups[item.theme] ?? []), item];
        return groups;
      }, {}),
    [allPrompts]
  );

  function handleEvaluate() {
    setTimerRunning(false);
    const timeSpentSeconds = elapsedSeconds || undefined;
    const result = evaluateWriting({ prompt, essay, timeSpentSeconds });
    setEvaluation(result);
    setLastRetryTarget(result.retryTarget);
    const savedAttempts = saveWritingAttempt({ prompt, plan, essay, evaluation: result, timeSpentSeconds });
    setLastSavedAttemptId(savedAttempts[0]?.id ?? null);
  }

  function handleRetry() {
    setEssay("");
    setEvaluation(null);
    setElapsedSeconds(0);
    setTimerRunning(false);
  }

  function handlePromptChange(nextPromptId: string) {
    setSelectedPromptId(nextPromptId);
    setPlan("");
    setEssay("");
    setEvaluation(null);
    setLastRetryTarget("");
    setLastSavedAttemptId(null);
    setElapsedSeconds(0);
    setTimerRunning(false);
  }

  function useCustomQuestion(saveForLater: boolean) {
    const customPrompt = createCustomWritingPrompt(customQuestion);
    if (!customPrompt) {
      setCustomStatus("Paste a question first.");
      return;
    }

    if (saveForLater) {
      const nextPrompts = addCustomWritingPrompt(customPrompt, customPrompts);
      setCustomPrompts(nextPrompts);
      saveCustomWritingPrompts(nextPrompts);
      setCustomStatus("Saved to My questions.");
    } else {
      setSessionPrompts((current) => [customPrompt, ...current.filter((item) => item.question !== customPrompt.question)].slice(0, 5));
      setCustomStatus("Framed for this writing session.");
    }
    handlePromptChange(customPrompt.id);
  }

  function removeCustomQuestion(promptId: string) {
    const nextPrompts = deleteCustomWritingPrompt(promptId, customPrompts);
    setCustomPrompts(nextPrompts);
    saveCustomWritingPrompts(nextPrompts);
    setCustomStatus("Removed from My questions.");
    if (selectedPromptId === promptId) handlePromptChange(writingPrompts[0].id);
  }

  function startTimerIfNeeded() {
    if (!timerRunning && !evaluation) setTimerRunning(true);
  }

  function handlePlanChange(event: FormEvent<HTMLTextAreaElement>) {
    startTimerIfNeeded();
    setPlan(event.currentTarget.value);
  }

  function handleEssayChange(event: FormEvent<HTMLTextAreaElement>) {
    startTimerIfNeeded();
    setEssay(event.currentTarget.value);
    setEvaluation(null);
  }

  return (
    <main className="writing-workspace">
      <div className="speaking-hero">
        <div>
          <span className="eyebrow">Writing V1</span>
          <h1>Academic Task 2 practice.</h1>
          <p>Plan, write, evaluate, then retry with one clear target. Deterministic practice scoring only.</p>
        </div>
        <div className="writing-flow" aria-label="Writing workflow">
          {flowSteps.map((step, index) => (
            <span key={step} className={step === activeStep ? "active" : ""}>
              {index + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      <div className="writing-layout">
        <aside className="writing-prompt-panel">
          <div className="block-header">
            <div>
              <span className="mini-note">Question bank</span>
              <h2>Task 2 prompts</h2>
            </div>
          </div>
          <div className="writing-prompt-list">
            {Object.entries(groupedPrompts).map(([theme, items]) => (
              <div key={theme} className="writing-theme-group">
                <span className="mini-note">{theme === "custom" ? "My questions" : theme}</span>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`topic-button ${item.id === prompt.id ? "active" : ""}`}
                    onClick={() => handlePromptChange(item.id)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <section className="writing-main-panel">
          <section className="practice-block">
            <div className="block-header">
              <div>
                <span className="mini-note">My questions</span>
                <h3>Use your own Task 2 question</h3>
              </div>
              <button type="button" className="button button-primary" onClick={() => setShowCustomQuestion((value) => !value)}>
                Custom question
              </button>
            </div>
            {showCustomQuestion ? (
              <>
                <span className="status-pill">{customStatus}</span>
                <textarea
                  className="writing-plan-box"
                  value={customQuestion}
                  onChange={(event) => setCustomQuestion(event.currentTarget.value)}
                  placeholder="Paste a recent IELTS Writing Task 2 question here."
                />
                <div className="console-actions">
                  <button type="button" className="button button-primary" onClick={() => useCustomQuestion(false)} disabled={!customQuestion.trim()}>
                    Practice now
                  </button>
                  <button type="button" className="button button-ghost" onClick={() => useCustomQuestion(true)} disabled={!customQuestion.trim()}>
                    Save to My questions
                  </button>
                </div>
              </>
            ) : null}
            {showCustomQuestion && customPrompts.length ? (
              <div className="writing-detail-stack">
                <span className="mini-note">Saved custom questions</span>
                <div className="planning-hints">
                  {customPrompts.map((item) => (
                    <button key={item.id} type="button" className="topic-button" onClick={() => handlePromptChange(item.id)}>
                      {item.title}
                    </button>
                  ))}
                </div>
                <div className="planning-hints">
                  {customPrompts.map((item) => (
                    <button key={`remove-${item.id}`} type="button" className="topic-button" onClick={() => removeCustomQuestion(item.id)}>
                      Remove {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="practice-block writing-question-card">
            <div className="block-header">
              <div>
                <span className="mini-note">Academic Writing Task 2</span>
                <h2>{prompt.title}</h2>
              </div>
              <span className="status-pill">Practice estimate</span>
            </div>
            <p>{prompt.question}</p>
            <small>{prompt.instruction} Suggested time: 40 minutes.</small>
          </section>

          <section className="practice-block">
            <div className="block-header">
              <div>
                <span className="mini-note">Planning box</span>
                <h3>Decide before writing</h3>
              </div>
            </div>
            <div className="planning-hints">
              {prompt.planningHints.map((hint) => (
                <span key={hint}>{hint}</span>
              ))}
            </div>
            <textarea
              className="writing-plan-box"
              value={plan}
              onChange={handlePlanChange}
              onInput={handlePlanChange}
              placeholder="Position, body paragraph 1, body paragraph 2, conclusion..."
            />
          </section>

          <section className="practice-block">
            <div className="block-header">
              <div>
                <span className="mini-note">Essay editor</span>
                <h3>Write your answer</h3>
              </div>
              <span className={`status-pill ${wordCount >= 250 ? "ready" : ""}`}>{wordCount} words</span>
            </div>
            <div className="writing-timer-strip">
              <div>
                <span className="mini-note">Coaching timer</span>
                <strong>{formatDuration(elapsedSeconds)}</strong>
                <small>{remainingSeconds ? `${formatDuration(remainingSeconds)} left` : "40-minute target reached"}</small>
              </div>
              <div>
                <span className="mini-note">Pace</span>
                <strong>{typeof liveTiming.wordsPerMinute === "number" ? `${liveTiming.wordsPerMinute} WPM` : "Not timed"}</strong>
                <small>
                  {typeof liveTiming.projectedWordsAtTarget === "number"
                    ? `${liveTiming.projectedWordsAtTarget} projected words`
                    : "Start typing to track pace"}
                </small>
              </div>
              <button type="button" className="button button-ghost" onClick={() => setTimerRunning((value) => !value)}>
                {timerRunning ? "Pause timer" : elapsedSeconds ? "Resume timer" : "Start timer"}
              </button>
            </div>
            <textarea
              className="writing-editor"
              value={essay}
              onChange={handleEssayChange}
              onInput={handleEssayChange}
              placeholder="Write your Task 2 essay here. Use clear paragraphs and a direct position."
            />
            <div className="console-actions">
              <button type="button" className="button button-primary" onClick={handleEvaluate} disabled={!essay.trim()}>
                Evaluate
              </button>
              <button type="button" className="button button-ghost" onClick={handleRetry} disabled={!essay && !evaluation}>
                Retry
              </button>
            </div>
          </section>
        </section>

        <aside className="writing-result-panel">
          <section className="score-card">
            <span className="mini-note">Practice estimate</span>
            <h2>{evaluation ? `Band ${evaluation.overallBand.toFixed(1)}` : "Not evaluated"}</h2>
            <p>{evaluation ? evaluation.summary : "Write an essay and evaluate it to see a practice estimate."}</p>
          </section>

          <section className="focus-card">
            <span className="mini-note">One main issue</span>
            <strong>{evaluation?.mainIssue ?? "Your main issue will appear after evaluation."}</strong>
          </section>

          <section className="focus-card accent">
            <span className="mini-note">Retry target</span>
            <strong>{evaluation?.retryTarget ?? (lastRetryTarget || "Your retry target will appear here.")}</strong>
            <button type="button" className="button button-primary" onClick={handleRetry} disabled={!evaluation}>
              Retry with this target
            </button>
          </section>

          {evaluation ? (
            <section className="focus-card">
              <span className="mini-note">Detailed review</span>
              <Link className="button button-ghost" href={`/evaluation?mode=writing${lastSavedAttemptId ? `&id=${lastSavedAttemptId}` : ""}`}>
                Open detailed evaluation
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
