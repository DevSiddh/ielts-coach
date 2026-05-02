"use client";

import { useEffect, useRef, useState } from "react";
import { speakText, stopSpeaking } from "@/features/speaking/speech";
import { useSpeakingRecorder } from "@/features/speaking/use-recorder";
import {
  createConversationStateFromMessages,
  createInitialConversationState,
  moveToNextFollowUp,
  resetConversation,
  submitConversationAnswer,
  submitRetryAnswer
} from "@/features/conversation/state";
import {
  deleteAllConversationSessions,
  deleteConversationSession,
  loadConversationSessions,
  normalizeConversationMessages,
  saveConversationSession
} from "@/features/conversation/storage";
import type { ConversationSession } from "@/features/conversation/types";

const conversationSteps = ["Warm-up", "Role-play", "Answer", "Coach note", "Retry", "Follow-up"] as const;

export default function ConversationPage() {
  const [state, setState] = useState(createInitialConversationState);
  const [transcript, setTranscript] = useState("");
  const [retryTranscript, setRetryTranscript] = useState("");
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const selectedSessionIdRef = useRef<string | null>(null);
  const activeStep =
    state.promptIndex < 0
      ? "Warm-up"
      : state.retryRequired
        ? "Retry"
        : state.critique
          ? "Coach note"
          : state.messages.length > 1
            ? "Answer"
            : "Role-play";
  const recorder = useSpeakingRecorder({
    onTranscript: (value) => {
      if (state.retryRequired) {
        setRetryTranscript(value);
      } else {
        setTranscript(value);
      }
    }
  });

  useEffect(() => {
    if (!recorder.transcribedText) return;
    if (state.retryRequired) {
      setRetryTranscript(recorder.transcribedText);
    } else {
      setTranscript(recorder.transcribedText);
    }
  }, [recorder.transcribedText, state.retryRequired]);

  useEffect(() => {
    const loadedSessions = loadConversationSessions();
    setSessions(loadedSessions);
    if (loadedSessions[0]) {
      selectedSessionIdRef.current = loadedSessions[0].id;
      setSelectedSessionId(loadedSessions[0].id);
      setState(createConversationStateFromMessages(loadedSessions[0].messages));
    }
    setSessionsLoaded(true);
  }, []);

  useEffect(() => {
    if (!sessionsLoaded) return;
    const nextSessions = saveConversationSession({
      id: selectedSessionIdRef.current ?? undefined,
      messages: state.messages
    });
    setSessions(nextSessions);
    selectedSessionIdRef.current = nextSessions[0]?.id ?? null;
    setSelectedSessionId(selectedSessionIdRef.current);
  }, [sessionsLoaded, state.messages]);

  useEffect(() => stopSpeaking, []);

  function blurActiveInput() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleSubmitAnswer() {
    const next = submitConversationAnswer(state, transcript);
    setState(next);
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
    blurActiveInput();
  }

  function handleSubmitRetry() {
    const next = submitRetryAnswer(state, retryTranscript);
    setState(next);
    setRetryTranscript("");
    recorder.reset();
    blurActiveInput();
  }

  function handleNextFollowUp() {
    const next = moveToNextFollowUp(state);
    setState(next);
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  function handleReset() {
    stopSpeaking();
    setState(resetConversation());
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  function handleNewSession() {
    stopSpeaking();
    selectedSessionIdRef.current = null;
    setSelectedSessionId(null);
    setState(resetConversation());
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  function handleSelectSession(session: ConversationSession) {
    stopSpeaking();
    selectedSessionIdRef.current = session.id;
    setSelectedSessionId(session.id);
    setState(createConversationStateFromMessages(session.messages));
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  function handleDeleteSelectedSession() {
    if (!selectedSessionId) return;
    if (!window.confirm("Delete this local conversation session?")) return;
    const nextSessions = deleteConversationSession(selectedSessionId);
    setSessions(nextSessions);
    if (nextSessions[0]) {
      selectedSessionIdRef.current = nextSessions[0].id;
      setSelectedSessionId(nextSessions[0].id);
      setState(createConversationStateFromMessages(nextSessions[0].messages));
    } else {
      selectedSessionIdRef.current = null;
      setSelectedSessionId(null);
      setState(resetConversation());
    }
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  function handleWipeSessions() {
    if (!window.confirm("Wipe all local conversation sessions?")) return;
    deleteAllConversationSessions();
    setSessions([]);
    selectedSessionIdRef.current = null;
    setSelectedSessionId(null);
    setState(resetConversation());
    setTranscript("");
    setRetryTranscript("");
    recorder.reset();
  }

  return (
    <main className="conversation-workspace">
      <div className="speaking-hero">
        <div>
          <span className="eyebrow">Live coach room</span>
          <h1>Role-play IELTS speaking with Mira.</h1>
          <p>A coach-style practice chat that listens, remembers context, pushes your answer, and keeps scoring separate.</p>
        </div>
        <span className="status-pill">Coach mode</span>
      </div>

      <div className="conversation-flow" aria-label="Conversation workflow">
        {conversationSteps.map((step, index) => (
          <div key={step} className={`step-pill ${activeStep === step ? "active" : ""}`}>
            <span>{index + 1}</span>
            {step}
          </div>
        ))}
      </div>

      <div className="conversation-layout conversation-console-layout">
        <aside className="conversation-session-panel app-panel conversation-archive">
          <div className="panel-inner stack">
            <div className="section-title">
              <h3>Practice memory</h3>
              <span className="muted">{sessions.length} saved</span>
            </div>
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <button type="button" className="button button-primary" onClick={handleNewSession}>
                New session
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={handleDeleteSelectedSession}
                disabled={!selectedSessionId}
              >
                Delete
              </button>
              <button
                type="button"
                className="button button-ghost danger-button"
                onClick={handleWipeSessions}
                disabled={!sessions.length}
              >
                Wipe
              </button>
            </div>
            <div className="list conversation-session-list">
              {sessions.length ? (
                sessions.map((session) => (
                  <button
                    type="button"
                    key={session.id}
                    className={`list-item history-button ${session.id === selectedSessionId ? "active" : ""}`}
                    onClick={() => handleSelectSession(session)}
                  >
                    <strong>{session.title}</strong>
                    <span className="muted">{new Date(session.updatedAt).toLocaleString()}</span>
                  </button>
                ))
              ) : (
                <div className="list-item">No conversation sessions yet.</div>
              )}
            </div>
          </div>
        </aside>

        <section className="app-panel conversation-main-panel">
          <div className="panel-inner stack">
            <div className="conversation-question-card">
              <span className="mini-note">
                {state.promptIndex < 0 ? "Warm-up" : state.retryRequired ? "Coach is waiting for the retry" : "Mira asks"}
              </span>
              <strong>{normalizeConversationMessages(state.messages).at(-1)?.role === "examiner"
                ? normalizeConversationMessages(state.messages).at(-1)?.text
                : "Answer Mira like you are in a real coaching room."}</strong>
            </div>
            <div className="conversation-thread">
              {normalizeConversationMessages(state.messages).map((message, index) => (
                <div key={`${message.id}-${index}`} className={`message-row ${message.role}`}>
                  <div className="message-bubble">
                    <div className="message-header">
                      <span className="mini-note">{message.role === "examiner" ? "Mira" : "You"}</span>
                      {message.role === "examiner" ? (
                        <button
                          type="button"
                          className="message-voice-button"
                          onClick={() => speakText(message.text)}
                        >
                          Read
                        </button>
                      ) : null}
                    </div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="practice-block conversation-composer">
              <div className="block-header">
                <h3>{state.retryRequired ? "Try that again, sharper" : "Reply naturally"}</h3>
                <span className="status-pill">
                  {recorder.status} {recorder.durationSeconds ? `- ${recorder.durationSeconds}s` : ""}
                </span>
              </div>
              <div className="console-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={recorder.isRecording ? recorder.stop : recorder.start}
                >
                  {recorder.isRecording ? "Stop recording" : "Start recording"}
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={recorder.transcribeAudio}
                  disabled={!recorder.audioBlob}
                >
                  Transcribe audio
                </button>
              </div>
              <textarea
                className="transcript-editor conversation-textarea"
                value={state.retryRequired ? retryTranscript : transcript}
                onChange={(event) =>
                  state.retryRequired ? setRetryTranscript(event.target.value) : setTranscript(event.target.value)
                }
                placeholder={
                  state.retryRequired
                    ? "Retry the answer here. The examiner will not continue until you retry."
                    : "Talk to Mira. You can record, transcribe, or type."
                }
              />
              <div className="console-actions">
                {state.retryRequired ? (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSubmitRetry}
                    disabled={!retryTranscript.trim()}
                  >
                    Send retry
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSubmitAnswer}
                    disabled={!transcript.trim()}
                  >
                    Send
                  </button>
                )}
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleNextFollowUp}
                  disabled={state.retryRequired || !state.critique}
                >
                  Continue
                </button>
                <button type="button" className="button button-ghost" onClick={stopSpeaking}>
                  Stop voice
                </button>
                <button type="button" className="button button-ghost" onClick={handleReset}>
                  Reset session
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="app-panel conversation-feedback-panel">
          <div className="panel-inner stack">
            <div className="section-title">
              <h3>Coach board</h3>
              <span className="muted">Live read</span>
            </div>
            {state.critique ? (
              <>
                <div className="focus-card accent">
                  <span className="mini-note">Improvement target</span>
                  <strong>{state.critique.target}</strong>
                </div>
                <div className="workbench-panel">
                  <strong>Evidence</strong>
                  <div className="list" style={{ marginTop: 12 }}>
                    {state.critique.evidence.map((item, index) => (
                      <div className="list-item" key={`${item}-${index}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="focus-card">
                  <strong>Short critique</strong>
                  <span>{state.critique.feedback}</span>
                </div>
                <div className="workbench-panel">
                  <strong>Stronger answer</strong>
                  <p className="subtle" style={{ marginBottom: 0 }}>
                    {state.critique.upgradedAnswer}
                  </p>
                </div>
                <div className="workbench-panel">
                  <strong>Next action</strong>
                  <p className="subtle" style={{ marginBottom: 0 }}>
                    {state.retryRequired
                      ? state.critique.retryPrompt
                      : state.critique.followUp ?? "Move to the next question."}
                  </p>
                </div>
                <details className="analysis-panel">
                  <summary>Session context</summary>
                  <strong>Context</strong>
                  <p className="subtle" style={{ marginBottom: 8 }}>
                    {state.context.summary}
                  </p>
                  <span className="muted">
                    Recent messages kept: {state.context.recentMessages.length}
                    {state.context.recurringTargets.length
                      ? ` - Targets: ${state.context.recurringTargets.join(", ")}`
                      : ""}
                  </span>
                </details>
              </>
            ) : (
              <div className="list-item">
                Mira will react to your answer, show one useful pattern, and give you a small speaking rep.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
