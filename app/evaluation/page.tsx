"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreRing } from "@/components/score-ring";
import { loadAttempts, type SavedAttempt } from "@/features/speaking/storage";
import { buildPronunciationInsights } from "@/features/speaking/pronunciation-insights";
import { buildSpeakingTimingInsight } from "@/features/speaking/timing";
import { speakText, stopSpeaking } from "@/features/speaking/speech";
import { loadWritingAttempts, type SavedWritingAttempt } from "@/features/writing/storage";
import { formatBand, formatDuration } from "@/lib/format";

function sourceLabel(source?: string) {
  if (!source) return "Not captured";
  if (source === "deepgram") return "Deepgram raw";
  if (source === "browser-speech") return "Browser live";
  if (source === "whisper-timestamped") return "Local whisper";
  if (source === "groq-whisper") return "Groq whisper";
  if (source === "manual") return "Manual";
  return source;
}

function normalized(text?: string) {
  return text?.trim().replace(/\s+/g, " ") ?? "";
}

function displayTranscript(text?: string) {
  return text?.trim() || "Transcript text is not archived in deployed summary-history mode. The app keeps scores, issues, retry targets, and evidence counts for improvement tracking.";
}

export default function EvaluationPage() {
  const [attempts, setAttempts] = useState<SavedAttempt[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<SavedWritingAttempt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"speaking" | "writing">("speaking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode") === "writing" ? "writing" : "speaking";
    const urlId = params.get("id");
    const loadedWriting = loadWritingAttempts();
    setMode(urlMode);
    setWritingAttempts(loadedWriting);
    loadAttempts().then((items) => {
      setAttempts(items);
      setSelectedId(urlId ?? (urlMode === "writing" ? loadedWriting[0]?.id : items[0]?.id) ?? null);
    });
  }, []);

  const selected = attempts.find((attempt) => attempt.id === selectedId) ?? attempts[0] ?? null;
  const selectedWriting = writingAttempts.find((attempt) => attempt.id === selectedId) ?? writingAttempts[0] ?? null;
  const serviceTranscript = selected?.serviceTranscript ?? selected?.whisperTranscript ?? null;
  const serviceAddsNewText =
    selected && serviceTranscript?.text && normalized(serviceTranscript.text) !== normalized(selected.transcript);
  const pronunciationInsights = selected
    ? buildPronunciationInsights({
        evidenceSignals: selected.evidenceSignals,
        audioSignals: selected.audioSignals
      })
    : null;
  const timingInsight = selected
    ? buildSpeakingTimingInsight({
        prompt: selected.prompt,
        durationSeconds: selected.durationSeconds,
        wordCount: selected.evaluation.wordCount
      })
    : null;

  return (
    <main className="evaluation-page">
      <div className="speaking-hero">
        <div>
          <span className="eyebrow">Detailed evaluation</span>
          <h1>Examiner Workbench</h1>
          <p>Full review of score evidence, exact improvement targets, and retry decisions for speaking and writing.</p>
        </div>
        <div className="speaking-hero-actions">
          <button type="button" className={mode === "speaking" ? "button button-primary" : "button button-ghost"} onClick={() => {
            setMode("speaking");
            setSelectedId(attempts[0]?.id ?? null);
          }}>
            Speaking
          </button>
          <button type="button" className={mode === "writing" ? "button button-primary" : "button button-ghost"} onClick={() => {
            setMode("writing");
            setSelectedId(writingAttempts[0]?.id ?? null);
          }}>
            Writing
          </button>
          <Link className="button button-ghost" href={mode === "writing" ? "/writing" : "/speaking"}>
            Back to practice
          </Link>
          {mode === "speaking" && selected ? (
            <Link className="button button-primary" href={`/speaking?prompt=${selected.prompt.id}`}>
              Retry this prompt
            </Link>
          ) : null}
        </div>
      </div>

      {mode === "writing" ? (
        selectedWriting ? (
          <div className="evaluation-shell">
            <aside className="evaluation-attempts">
              <div className="workbench-panel">
                <span className="mini-note">Writing attempts</span>
                <div className="attempt-list">
                  {writingAttempts.map((attempt) => (
                    <button
                      key={attempt.id}
                      type="button"
                      className={`attempt-row ${attempt.id === selectedWriting.id ? "active" : ""}`}
                      onClick={() => setSelectedId(attempt.id)}
                    >
                      <span>{attempt.prompt.title}</span>
                      <strong>{formatBand(attempt.evaluation.overallBand)}</strong>
                      <small>{new Date(attempt.createdAt).toLocaleString()}</small>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="evaluation-main">
              <div className="evaluation-score-hero">
                <div>
                  <span className="mini-note">Selected writing attempt</span>
                  <h2>{selectedWriting.prompt.title}</h2>
                  <p>{selectedWriting.prompt.question}</p>
                  <div className="evidence-chips">
                    <span>{selectedWriting.evaluation.evidence.wordCount} words</span>
                    <span>{selectedWriting.evaluation.evidence.paragraphCount} paragraphs</span>
                    <span>{selectedWriting.timeSpentSeconds ? formatDuration(selectedWriting.timeSpentSeconds) : "Not timed"}</span>
                    <span>{selectedWriting.evaluation.label}</span>
                  </div>
                </div>
                <ScoreRing score={selectedWriting.evaluation.overallBand} />
              </div>

              <div className="workbench-grid">
                <section className="workbench-panel workbench-main">
                  <span className="mini-note">Priority diagnosis</span>
                  <h3>{selectedWriting.evaluation.mainIssue}</h3>
                  <div className="review-list">
                    {selectedWriting.evaluation.improvements.map((item) => (
                      <div key={item} className="review-item">
                        <span>Fix</span>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="workbench-panel">
                  <span className="mini-note">Retry target</span>
                  <h3>{selectedWriting.evaluation.retryTarget}</h3>
                  <Link className="button button-primary" href={`/writing?prompt=${selectedWriting.prompt.id}`}>
                    Retry in writing
                  </Link>
                </section>

                <section className="workbench-panel workbench-main">
                  <span className="mini-note">Criteria evidence</span>
                  <div className="review-list">
                    {selectedWriting.evaluation.criterionEvidence.map((item) => (
                      <div key={item.criterion} className="review-item">
                        <span>{item.score.toFixed(1)}</span>
                        <strong>{item.label}: {item.evidence.join(" ")}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="workbench-panel workbench-main">
                  <span className="mini-note">Visible evidence</span>
                  <div className="evidence-metric-grid">
                    <div><span>Words</span><strong>{selectedWriting.evaluation.evidence.wordCount}</strong><small>Target: 250+</small></div>
                    <div><span>Paragraphs</span><strong>{selectedWriting.evaluation.evidence.paragraphCount}</strong><small>{selectedWriting.evaluation.evidence.bodyParagraphCount} body paragraphs</small></div>
                    <div><span>Opinion</span><strong>{selectedWriting.evaluation.evidence.unclearOpinion ? "Unclear" : "Clear"}</strong><small>Task response</small></div>
                    <div><span>Conclusion</span><strong>{selectedWriting.evaluation.evidence.missingConclusion ? "Missing" : "Found"}</strong><small>Ending control</small></div>
                    <div><span>Linking</span><strong>{selectedWriting.evaluation.evidence.weakLinking ? "Weak" : "OK"}</strong><small>Coherence signal</small></div>
                    <div><span>Pace</span><strong>{selectedWriting.evaluation.evidence.timing.wordsPerMinute ?? "-"}</strong><small>{selectedWriting.evaluation.evidence.timing.timingStatus}</small></div>
                  </div>
                </section>

                <section className="workbench-panel workbench-main">
                  <span className="mini-note">Essay</span>
                  <p className="improved-answer">{selectedWriting.essay}</p>
                </section>

                <section className="workbench-panel workbench-main">
                  <span className="mini-note">Retry checklist</span>
                  <div className="review-list">
                    {selectedWriting.evaluation.retryChecklist.map((item, index) => (
                      <div key={item} className="review-item">
                        <span>{index + 1}</span>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </div>
        ) : (
          <div className="workbench-empty">No writing attempts yet. Write and evaluate one Task 2 essay first.</div>
        )
      ) : selected ? (
        <div className="evaluation-shell">
          <aside className="evaluation-attempts">
            <div className="workbench-panel">
              <span className="mini-note">Attempts</span>
              <div className="attempt-list">
                {attempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    type="button"
                    className={`attempt-row ${attempt.id === selected.id ? "active" : ""}`}
                    onClick={() => setSelectedId(attempt.id)}
                  >
                    <span>{attempt.prompt.title}</span>
                    <strong>{formatBand(attempt.evaluation.overallBand)}</strong>
                    <small>{new Date(attempt.createdAt).toLocaleString()}</small>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="evaluation-main">
            <div className="evaluation-score-hero">
              <div>
                <span className="mini-note">Selected attempt</span>
                <h2>{selected.prompt.title}</h2>
                <p>{selected.prompt.question}</p>
                <div className="evidence-chips">
                  <span>{formatDuration(selected.durationSeconds)}</span>
                  <span>{timingInsight?.label}</span>
                  <span>{sourceLabel(selected.rawTranscript?.source)}</span>
                  <span>{selected.evaluation.wordCount} words</span>
                </div>
              </div>
              <ScoreRing score={selected.evaluation.overallBand} />
            </div>

            <div className="workbench-grid">
              <section className="workbench-panel workbench-main">
                <span className="mini-note">Priority diagnosis</span>
                <h3>{selected.evaluation.blockers[0] ?? selected.evaluation.fixes[0]}</h3>
                <div className="review-list">
                  {selected.evaluation.fixes.slice(0, 5).map((fix) => (
                    <div key={fix} className="review-item">
                      <span>Fix</span>
                      <strong>{fix}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="workbench-panel">
                <span className="mini-note">Helpful keywords</span>
                <div className="keyword-grid">
                  {selected.evaluation.keywordSuggestions.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </section>

              <section className="workbench-panel">
                <span className="mini-note">Retry plan</span>
                <div className="review-list">
                  {selected.evaluation.approachPlan.map((step, index) => (
                    <div key={step} className="review-item">
                      <span>{index + 1}</span>
                      <strong>{step}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="workbench-panel">
                <span className="mini-note">Prompt-specific improvements</span>
                <div className="review-list">
                  {selected.prompt.improvementTips.map((tip) => (
                    <div key={tip} className="review-item">
                      <span>Tip</span>
                      <strong>{tip}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="workbench-panel">
                <span className="mini-note">What strong delivery looks like</span>
                <div className="review-list">
                  {selected.prompt.whatGoodLooksLike.map((item) => (
                    <div key={item} className="review-item">
                      <span>Goal</span>
                      <strong>{item}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="workbench-panel workbench-main">
                <span className="mini-note">Evidence summary</span>
                <div className="evidence-metric-grid">
                  <div>
                    <span>Timing</span>
                    <strong>{timingInsight?.status ?? "not-timed"}</strong>
                    <small>{timingInsight?.target ?? "No timing target available"}</small>
                  </div>
                  <div>
                    <span>Fillers</span>
                    <strong>{selected.evidenceSignals?.fillerWordCount ?? selected.evaluation.fillers.length}</strong>
                    <small>{selected.evaluation.fillers.join(", ") || "None detected"}</small>
                  </div>
                  <div>
                    <span>Pauses</span>
                    <strong>{selected.audioSignals?.pauseCount ?? selected.evidenceSignals?.transcriptPauseCount ?? 0}</strong>
                    <small>
                      {selected.audioSignals
                        ? `${selected.audioSignals.longPauseCount} long pauses`
                        : "Audio timing unavailable"}
                    </small>
                  </div>
                  <div>
                    <span>Confidence</span>
                    <strong>{selected.evidenceSignals?.lowConfidenceWordCount ?? 0}</strong>
                    <small>{selected.evidenceSignals?.lowConfidenceWords.join(", ") || "No low-confidence words"}</small>
                  </div>
                  <div>
                    <span>Restarts</span>
                    <strong>{selected.evidenceSignals?.restartSignals.length ?? 0}</strong>
                    <small>{selected.evidenceSignals?.restartSignals.join(", ") || "No restart signals"}</small>
                  </div>
                </div>
              </section>

              {pronunciationInsights ? (
                <section className="workbench-panel workbench-main pronunciation-panel">
                  <div className="block-header">
                    <div>
                      <span className="mini-note">Pronunciation evidence v1</span>
                      <h3>{pronunciationInsights.evidenceLevel === "stronger" ? "Audio and transcript confidence are available." : "Evidence is partial, so feedback stays conservative."}</h3>
                    </div>
                    <span className="status-pill">{pronunciationInsights.evidenceLevel}</span>
                  </div>
                  <div className="review-list">
                    {pronunciationInsights.findings.map((finding) => (
                      <div key={finding} className="review-item">
                        <span>Signal</span>
                        <strong>{finding}</strong>
                      </div>
                    ))}
                    {pronunciationInsights.targets.map((target) => (
                      <div key={target} className="review-item">
                        <span>Target</span>
                        <strong>{target}</strong>
                      </div>
                    ))}
                    {pronunciationInsights.cautions.map((caution) => (
                      <div key={caution} className="review-item">
                        <span>Note</span>
                        <strong>{caution}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="workbench-panel workbench-main">
                <span className="mini-note">Transcript evidence</span>
                <div className="transcript-evidence">
                  <div>
                    <strong>Scoring transcript - {sourceLabel(selected.rawTranscript?.source)}</strong>
                    <p>{displayTranscript(selected.transcript)}</p>
                  </div>
                  {serviceAddsNewText ? (
                    <div>
                      <strong>Comparison transcript - {sourceLabel(serviceTranscript?.source)}</strong>
                      <p>{displayTranscript(serviceTranscript?.text)}</p>
                    </div>
                  ) : (
                    <div>
                      <strong>Why this model works</strong>
                      <p>It opens with a direct answer, develops one clear reason, adds a concrete example or contrast, and closes without sounding memorized. Reuse that frame with your own details in the next retry.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="workbench-panel workbench-main band8-panel">
                <div className="block-header">
                  <div>
                    <span className="mini-note">Detailed Band 8-style answer</span>
                    <h3>Use this as a model for structure, not memorization.</h3>
                  </div>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => speakText(selected.evaluation.improvedAnswer)}
                  >
                    Read aloud
                  </button>
                </div>
                <p className="improved-answer">{selected.evaluation.improvedAnswer}</p>
                <div className="band8-breakdown">
                  <div>
                    <span>Opening</span>
                    <strong>Answers directly instead of circling around the topic.</strong>
                  </div>
                  <div>
                    <span>Development</span>
                    <strong>Adds reasons, examples, and contrast so the answer feels complete.</strong>
                  </div>
                  <div>
                    <span>Language</span>
                    <strong>Uses cleaner linking and topic-specific vocabulary without sounding scripted.</strong>
                  </div>
                </div>
                <button type="button" className="button button-ghost" onClick={stopSpeaking}>
                  Stop voice
                </button>
              </section>
            </div>
          </section>
        </div>
      ) : (
        <div className="workbench-empty">
          No scored attempts yet. Go to the speaking console, score an answer, then return here for the full evaluation.
        </div>
      )}
    </main>
  );
}
