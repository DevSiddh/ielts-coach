"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteAllAttempts, deleteAttempt, loadAttempts, type SavedAttempt } from "@/features/speaking/storage";
import { buildHistoryAnalytics } from "@/features/speaking/history-analytics";
import { buildPronunciationInsights } from "@/features/speaking/pronunciation-insights";
import { buildSpeakingTimingInsight } from "@/features/speaking/timing";
import { speakText, stopSpeaking } from "@/features/speaking/speech";
import { buildWritingHistoryAnalytics } from "@/features/writing/history-analytics";
import { loadWritingAttempts, type SavedWritingAttempt } from "@/features/writing/storage";
import { formatBand, formatDuration } from "@/lib/format";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<SavedAttempt[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<SavedWritingAttempt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"speaking" | "writing">("speaking");

  useEffect(() => {
    const loadedWriting = loadWritingAttempts();
    setWritingAttempts(loadedWriting);
    loadAttempts().then((items) => {
      setAttempts(items);
      setSelectedId(items[0]?.id ?? null);
    });
  }, []);

  const selected = attempts.find((attempt) => attempt.id === selectedId) ?? null;
  const selectedWriting = writingAttempts.find((attempt) => attempt.id === selectedId) ?? null;
  const analytics = buildHistoryAnalytics(attempts);
  const writingAnalytics = buildWritingHistoryAnalytics(writingAttempts);
  const serviceTranscript = selected?.serviceTranscript ?? selected?.whisperTranscript ?? null;
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

  async function handleDeleteSelected() {
    if (!selected) return;
    if (!window.confirm("Delete this local attempt and its transcript/audio artifacts?")) return;
    const nextAttempts = await deleteAttempt(selected.id);
    setAttempts(nextAttempts);
    setSelectedId(nextAttempts[0]?.id ?? null);
  }

  async function handleDeleteAll() {
    if (!attempts.length) return;
    if (!window.confirm("Wipe all local attempts, transcripts, and audio artifacts?")) return;
    const nextAttempts = await deleteAllAttempts();
    setAttempts(nextAttempts);
    setSelectedId(null);
  }

  function switchMode(nextMode: "speaking" | "writing") {
    setMode(nextMode);
    setSelectedId(nextMode === "speaking" ? attempts[0]?.id ?? null : writingAttempts[0]?.id ?? null);
  }

  return (
    <main className="review-workspace">
      <div className="speaking-hero">
        <div>
          <span className="eyebrow">History</span>
          <h1>Review attempts without losing the practice flow.</h1>
          <p>Track speaking and writing progress, repeated blockers, and the next training target.</p>
        </div>
        <div className="speaking-hero-actions">
          <button type="button" className={mode === "speaking" ? "button button-primary" : "button button-ghost"} onClick={() => switchMode("speaking")}>
            Speaking history
          </button>
          <button type="button" className={mode === "writing" ? "button button-primary" : "button button-ghost"} onClick={() => switchMode("writing")}>
            Writing history
          </button>
          <Link className="button button-primary" href={mode === "writing" ? "/writing" : "/speaking"}>
            Back to practice
          </Link>
          {mode === "speaking" ? <button type="button" className="button button-ghost danger-button" onClick={handleDeleteAll} disabled={!attempts.length}>
            Wipe all
          </button> : null}
        </div>
      </div>

      {mode === "writing" ? (
        <div className="review-shell">
          <aside className="attempt-sidebar">
            <div className="review-stats">
              <div>
                <span className="mini-note">Average band</span>
                <strong>{writingAttempts.length ? writingAnalytics.averageBand.toFixed(1) : "0.0"}</strong>
              </div>
              <div>
                <span className="mini-note">Trend</span>
                <strong>{writingAttempts.length > 1 ? writingAnalytics.trendLabel : "-"}</strong>
              </div>
            </div>

            <section className="progress-insight-card">
              <span className="mini-note">Writing priority</span>
              <strong>{writingAnalytics.priority}</strong>
              <p>{writingAnalytics.nextAction}</p>
            </section>

            <section className="progress-insight-card">
              <span className="mini-note">Best essay</span>
              <strong>{writingAnalytics.bestAttempt ? formatBand(writingAnalytics.bestAttempt.evaluation.overallBand) : "-"}</strong>
              <p>{writingAnalytics.bestAttempt?.prompt.title ?? "Evaluate one essay to establish your writing ceiling."}</p>
            </section>

            <div className="attempt-list">
              {writingAttempts.length ? (
                writingAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    type="button"
                    className={`attempt-row ${attempt.id === selectedId ? "active" : ""}`}
                    onClick={() => setSelectedId(attempt.id)}
                  >
                    <span>{attempt.prompt.title}</span>
                    <strong>{formatBand(attempt.evaluation.overallBand)}</strong>
                    <small>{new Date(attempt.createdAt).toLocaleString()}</small>
                  </button>
                ))
              ) : (
                <div className="empty-state">No writing attempts yet. Evaluate your first Task 2 essay.</div>
              )}
            </div>
          </aside>

          <section className="attempt-review-panel">
            <section className="progress-dashboard">
              <div className="progress-card primary-progress">
                <span className="mini-note">Recent writing</span>
                <strong>{writingAttempts.length ? formatBand(writingAnalytics.recentAverage) : "0.0 / 9.0"}</strong>
                <p>{writingAttempts.length > 5 ? `${writingAnalytics.trendLabel} versus previous essays` : "Evaluate more essays to compare recent form."}</p>
              </div>
              <div className="progress-card">
                <span className="mini-note">Weakest criterion</span>
                <strong>{writingAnalytics.weakestCriterion?.label ?? "-"}</strong>
                <p>{writingAnalytics.weakestCriterion ? formatBand(writingAnalytics.weakestCriterion.value) : "No writing evidence yet."}</p>
              </div>
            </section>

            <section className="progress-evidence-grid">
              <div className="progress-panel">
                <div className="block-header">
                  <h3>Writing criteria</h3>
                  <span className="mini-note">Averages</span>
                </div>
                <div className="criteria">
                  {writingAnalytics.criteriaAverages.map((item) => (
                    <div className="criteria-row" key={item.key}>
                      <div>
                        <div>{item.label}</div>
                        <div className="muted">{formatBand(item.value)}</div>
                      </div>
                      <div className="criteria-bar">
                        <span style={{ width: `${Math.min((item.value / 9) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="progress-panel">
                <div className="block-header">
                  <h3>Recurring writing issues</h3>
                  <span className="mini-note">Top patterns</span>
                </div>
                <div className="pattern-list">
                  {writingAnalytics.recurringIssues.length ? (
                    writingAnalytics.recurringIssues.map((item) => (
                      <div className="pattern-row" key={item.label}>
                        <strong>{item.label}</strong>
                        <span>{item.count}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Evaluate more essays to reveal repeated writing blockers.</p>
                  )}
                </div>
              </div>
            </section>

            {selectedWriting ? (
              <>
                <div className="attempt-summary-card">
                  <div>
                    <span className="mini-note">Selected essay</span>
                    <h2>{selectedWriting.prompt.title}</h2>
                    <p>{selectedWriting.prompt.question}</p>
                  </div>
                  <div className="attempt-score-stack">
                    <strong>{selectedWriting.evaluation.overallBand.toFixed(1)}</strong>
                    <span>{selectedWriting.evaluation.evidence.wordCount} words</span>
                  </div>
                </div>

                <div className="review-focus-grid">
                  <div className="focus-card">
                    <span className="mini-note">One main issue</span>
                    <strong>{selectedWriting.evaluation.mainIssue}</strong>
                  </div>
                  <div className="focus-card accent">
                    <span className="mini-note">Retry target</span>
                    <strong>{selectedWriting.evaluation.retryTarget}</strong>
                    <Link className="button button-primary" href={`/evaluation?mode=writing&id=${selectedWriting.id}`}>
                      Open detailed evaluation
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">Select a writing attempt to review.</div>
            )}
          </section>
        </div>
      ) : (
      <div className="review-shell">
        <aside className="attempt-sidebar">
          <div className="review-stats">
            <div>
              <span className="mini-note">Average band</span>
              <strong>{attempts.length ? analytics.averageBand.toFixed(1) : "0.0"}</strong>
            </div>
            <div>
              <span className="mini-note">Trend</span>
              <strong>{attempts.length > 1 ? analytics.trendLabel : "-"}</strong>
            </div>
          </div>

          <section className="progress-insight-card">
            <span className="mini-note">Training priority</span>
            <strong>{analytics.priority}</strong>
            <p>{analytics.nextAction}</p>
          </section>

          <section className="progress-insight-card">
            <span className="mini-note">Best attempt</span>
            <strong>{analytics.bestAttempt ? formatBand(analytics.bestAttempt.evaluation.overallBand) : "-"}</strong>
            <p>{analytics.bestAttempt?.prompt.title ?? "Score an attempt to establish your current ceiling."}</p>
          </section>

          <div className="attempt-list">
            {attempts.length ? (
              attempts.map((attempt) => (
                <button
                  key={attempt.id}
                  type="button"
                  className={`attempt-row ${attempt.id === selectedId ? "active" : ""}`}
                  onClick={() => setSelectedId(attempt.id)}
                >
                  <span>{attempt.prompt.title}</span>
                  <strong>{formatBand(attempt.evaluation.overallBand)}</strong>
                  <small>{new Date(attempt.createdAt).toLocaleString()}</small>
                </button>
              ))
            ) : (
              <div className="empty-state">No attempts yet. Record your first answer in the speaking console.</div>
            )}
          </div>
        </aside>

        <section className="attempt-review-panel">
          <section className="progress-dashboard">
            <div className="progress-card primary-progress">
              <span className="mini-note">Recent form</span>
              <strong>{attempts.length ? formatBand(analytics.recentAverage) : "0.0 / 9.0"}</strong>
              <p>{attempts.length > 5 ? `${analytics.recentShiftLabel} versus previous attempts` : "Score more attempts to compare recent form."}</p>
            </div>
            <div className="progress-card">
              <span className="mini-note">Strongest skill</span>
              <strong>{analytics.strongestCriterion?.label ?? "-"}</strong>
              <p>{analytics.strongestCriterion ? formatBand(analytics.strongestCriterion.value) : "No score evidence yet."}</p>
            </div>
            <div className="progress-card">
              <span className="mini-note">Weakest skill</span>
              <strong>{analytics.weakestCriterion?.label ?? "-"}</strong>
              <p>{analytics.weakestCriterion ? formatBand(analytics.weakestCriterion.value) : "No score evidence yet."}</p>
            </div>
            <div className="progress-card">
              <span className="mini-note">Last retry gain</span>
              <strong>{analytics.lastRetryGain === null ? "-" : `${analytics.lastRetryGain >= 0 ? "+" : ""}${analytics.lastRetryGain.toFixed(1)}`}</strong>
              <p>{analytics.lastRetryGain === null ? "Retry the same prompt to measure improvement." : "Same-prompt improvement signal."}</p>
            </div>
            <div className="progress-card">
              <span className="mini-note">Avg timing</span>
              <strong>{analytics.evidenceTotals.averageDurationSeconds ? formatDuration(Math.round(analytics.evidenceTotals.averageDurationSeconds)) : "-"}</strong>
              <p>{analytics.evidenceTotals.timingTargetMissCount} timing target miss{analytics.evidenceTotals.timingTargetMissCount === 1 ? "" : "es"}.</p>
            </div>
          </section>

          <section className="progress-evidence-grid">
            <div className="progress-panel">
              <div className="block-header">
                <h3>Criteria trend</h3>
                <span className="mini-note">Averages</span>
              </div>
              <div className="criteria">
                {analytics.criteriaAverages.map((item) => (
                  <div className="criteria-row" key={item.key}>
                    <div>
                      <div>{item.label}</div>
                      <div className="muted">{formatBand(item.value)}</div>
                    </div>
                    <div className="criteria-bar">
                      <span style={{ width: `${Math.min((item.value / 9) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="progress-panel">
              <div className="block-header">
                <h3>Evidence totals</h3>
                <span className="mini-note">All attempts</span>
              </div>
              <div className="evidence-total-grid">
                <div><span>Fillers</span><strong>{analytics.evidenceTotals.fillers}</strong></div>
                <div><span>Pauses</span><strong>{analytics.evidenceTotals.pauses}</strong></div>
                <div><span>Long pauses</span><strong>{analytics.evidenceTotals.longPauses}</strong></div>
                <div><span>Low confidence</span><strong>{analytics.evidenceTotals.lowConfidenceWords}</strong></div>
                <div><span>Restarts</span><strong>{analytics.evidenceTotals.restarts}</strong></div>
                <div><span>Clarity risks</span><strong>{analytics.evidenceTotals.clarityRisks}</strong></div>
                <div><span>Pacing risks</span><strong>{analytics.evidenceTotals.pacingRiskCount}</strong></div>
                <div><span>Timing misses</span><strong>{analytics.evidenceTotals.timingTargetMissCount}</strong></div>
              </div>
            </div>

            <div className="progress-panel">
              <div className="block-header">
                <h3>Recurring blockers</h3>
                <span className="mini-note">Top patterns</span>
              </div>
              <div className="pattern-list">
                {analytics.recurringBlockers.length ? (
                  analytics.recurringBlockers.map((item) => (
                    <div className="pattern-row" key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.count}x</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">Score more attempts to reveal repeated blockers.</p>
                )}
              </div>
            </div>

            <div className="progress-panel">
              <div className="block-header">
                <h3>Best fixes</h3>
                <span className="mini-note">Repeat targets</span>
              </div>
              <div className="pattern-list">
                {analytics.recurringFixes.length ? (
                  analytics.recurringFixes.map((item) => (
                    <div className="pattern-row" key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.count}x</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">Fix patterns will appear after scored attempts.</p>
                )}
              </div>
            </div>
          </section>

          {selected ? (
            <>
              <div className="attempt-summary-card">
                <div>
                  <span className="mini-note">Selected attempt</span>
                  <h2>{selected.prompt.title}</h2>
                  <p>{selected.prompt.question}</p>
                </div>
                <div className="attempt-score-stack">
                  <strong>{selected.evaluation.overallBand.toFixed(1)}</strong>
                  <span>{formatDuration(selected.durationSeconds)}</span>
                </div>
              </div>

              <div className="review-focus-grid">
                <div className="focus-card">
                  <span className="mini-note">One main issue</span>
                  <strong>{selected.evaluation.blockers[0] ?? selected.evaluation.fixes[0]}</strong>
                </div>
                <div className="focus-card accent">
                  <span className="mini-note">Retry target</span>
                  <strong>{selected.evaluation.nextTryFocus}</strong>
                  <Link className="button button-primary" href={`/speaking?prompt=${selected.prompt.id}`}>
                    Retry this prompt
                  </Link>
                </div>
              </div>

              <div className="rubric-card">
                <div className="block-header">
                  <h3>Score breakdown</h3>
                  <span className="mini-note">IELTS-style</span>
                </div>
                <div className="criteria">
                  {[
                    ["Fluency", selected.evaluation.criteria.fluency],
                    ["Grammar", selected.evaluation.criteria.grammar],
                    ["Vocabulary", selected.evaluation.criteria.lexical],
                    ["Pronunciation", selected.evaluation.criteria.pronunciation]
                  ].map(([label, value]) => (
                    <div className="criteria-row" key={label}>
                      <div>
                        <div>{label}</div>
                        <div className="muted">{formatBand(Number(value))}</div>
                      </div>
                      <div className="criteria-bar">
                        <span style={{ width: `${Math.min((Number(value) / 9) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <details className="analysis-panel">
                <summary>View detailed analysis</summary>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <span className="mini-note">Raw transcript</span>
                    <strong>{selected.rawTranscript?.source ?? "manual"}</strong>
                    <p>{selected.transcript || "Transcript is not archived in deployed single-user history mode."}</p>
                  </div>
                  <div className="analysis-card">
                    <span className="mini-note">Service transcript</span>
                    <strong>{serviceTranscript?.source ?? "not captured"}</strong>
                    <p>{serviceTranscript?.text ?? "Service transcript is used for scoring, then only summary evidence is kept."}</p>
                  </div>
                  <div className="analysis-card compact-analysis">
                    <span>Fillers</span>
                    <strong>{selected.evidenceSignals?.fillerWordCount ?? selected.evaluation.fillers.length}</strong>
                  </div>
                  <div className="analysis-card compact-analysis">
                    <span>Pauses</span>
                    <strong>{selected.audioSignals?.pauseCount ?? selected.evidenceSignals?.transcriptPauseCount ?? 0}</strong>
                  </div>
                  <div className="analysis-card compact-analysis">
                    <span>Confidence</span>
                    <strong>{selected.evidenceSignals?.lowConfidenceWordCount ?? 0}</strong>
                  </div>
                  <div className="analysis-card compact-analysis">
                    <span>Timeline</span>
                    <strong>{selected.audioSignals ? `${selected.audioSignals.longPauseCount} long` : "No audio"}</strong>
                  </div>
                  {timingInsight ? (
                    <div className="analysis-card pronunciation-history-card">
                      <span className="mini-note">{timingInsight.label}</span>
                      <strong>{timingInsight.status}</strong>
                      <p>{[timingInsight.target, ...timingInsight.evidence].join(" ")}</p>
                    </div>
                  ) : null}
                  {pronunciationInsights ? (
                    <div className="analysis-card pronunciation-history-card">
                      <span className="mini-note">Pronunciation evidence v1</span>
                      <strong>{pronunciationInsights.evidenceLevel}</strong>
                      <p>{[...pronunciationInsights.findings, ...pronunciationInsights.targets].slice(0, 3).join(" ")}</p>
                    </div>
                  ) : null}
                </div>
              </details>

              <div className="review-actions">
                <button type="button" className="button button-ghost" onClick={() => speakText(selected.evaluation.improvedAnswer)}>
                  Read Band 8 answer
                </button>
                <button type="button" className="button button-ghost" onClick={stopSpeaking}>
                  Stop voice
                </button>
                <button type="button" className="button button-ghost danger-button" onClick={handleDeleteSelected}>
                  Delete selected
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">Select an attempt to review.</div>
          )}
        </section>
      </div>
      )}
    </main>
  );
}
