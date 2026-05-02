"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FeedbackPanel,
  MobileActionDock,
  PracticeHeader,
  PromptCard,
  RecorderCard,
  TranscriptCard
} from "@/components/speaking/mobile-speaking-flow";
import {
  addCustomSpeakingPrompt,
  createCustomSpeakingPrompt,
  deleteCustomSpeakingPrompt,
  loadCustomSpeakingPrompts,
  saveCustomSpeakingPrompts
} from "@/features/speaking/custom-prompts";
import { evaluateSpeaking } from "@/features/speaking/evaluate";
import { prompts } from "@/features/speaking/prompts";
import { stopSpeaking } from "@/features/speaking/speech";
import { loadAttempts, saveAttempt, type SavedAttempt } from "@/features/speaking/storage";
import { buildSpeakingTimingInsight } from "@/features/speaking/timing";
import type { SpeakingPrompt } from "@/features/speaking/types";
import { useSpeakingRecorder } from "@/features/speaking/use-recorder";
import { formatDuration } from "@/lib/format";

type Difficulty = SpeakingPrompt["difficulty"];
type PracticeMode = "guided" | "exam" | "surprise";
type EvaluationResult = ReturnType<typeof evaluateSpeaking>;
type SpeakingPartChoice = 1 | 2 | 3 | "auto";

export default function SpeakingPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0].id);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [retryBaseline, setRetryBaseline] = useState<EvaluationResult | null>(null);
  const [lastComparison, setLastComparison] = useState<{ before: number; after: number } | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("guided");
  const [attempts, setAttempts] = useState<SavedAttempt[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customPartChoice, setCustomPartChoice] = useState<SpeakingPartChoice>("auto");
  const [customPrompts, setCustomPrompts] = useState<SpeakingPrompt[]>([]);
  const [sessionPrompts, setSessionPrompts] = useState<SpeakingPrompt[]>([]);
  const [customStatus, setCustomStatus] = useState("Paste a recent question to frame it for practice.");
  const [showCustomQuestion, setShowCustomQuestion] = useState(false);

  const recorder = useSpeakingRecorder({
    onTranscript: setTranscript
  });

  useEffect(() => {
    const loadedCustomPrompts = loadCustomSpeakingPrompts();
    setCustomPrompts(loadedCustomPrompts);
    loadAttempts().then((items) => {
      setAttempts(items);
    });

    const promptFromUrl = new URLSearchParams(window.location.search).get("prompt");
    const savedPromptId = window.localStorage.getItem("ielts-coach-selected-prompt");
    const savedDifficulty = window.localStorage.getItem("ielts-coach-selected-difficulty") as Difficulty | null;
    const startupPrompts = [...prompts, ...loadedCustomPrompts];
    const urlPrompt = promptFromUrl ? startupPrompts.find((item) => item.id === promptFromUrl) : null;

    if (urlPrompt) {
      setSelectedDifficulty(urlPrompt.difficulty);
      setSelectedPromptId(urlPrompt.id);
      return;
    }
    if (savedDifficulty && ["easy", "medium", "hard"].includes(savedDifficulty)) {
      setSelectedDifficulty(savedDifficulty);
    }
    if (savedPromptId && startupPrompts.some((item) => item.id === savedPromptId)) {
      setSelectedPromptId(savedPromptId);
    }
  }, []);

  useEffect(() => {
    if (recorder.transcribedText) {
      setTranscript(recorder.transcribedText);
    }
  }, [recorder.transcribedText]);

  const allPrompts = useMemo(() => [...sessionPrompts, ...customPrompts, ...prompts], [customPrompts, sessionPrompts]);
  const visiblePrompts = useMemo(
    () => allPrompts.filter((item) => item.difficulty === selectedDifficulty),
    [allPrompts, selectedDifficulty]
  );
  const surprisePrompts = useMemo(() => prompts.filter((item) => item.sourceType === "surprise-drill"), []);

  useEffect(() => {
    if (!visiblePrompts.some((item) => item.id === selectedPromptId)) {
      setSelectedPromptId(visiblePrompts[0]?.id ?? prompts[0].id);
    }
  }, [visiblePrompts, selectedPromptId]);

  const prompt = allPrompts.find((item) => item.id === selectedPromptId) ?? prompts[0];
  const promptIndexWithinDifficulty = visiblePrompts.findIndex((item) => item.id === prompt.id);

  useEffect(() => {
    window.localStorage.setItem("ielts-coach-selected-prompt", prompt.id);
    window.localStorage.setItem("ielts-coach-selected-difficulty", selectedDifficulty);
  }, [prompt.id, selectedDifficulty]);

  const metrics = useMemo(() => {
    const criteria = result?.criteria ?? { fluency: 0, grammar: 0, lexical: 0, pronunciation: 0 };
    return [
      { label: "Fluency", value: criteria.fluency },
      { label: "Grammar", value: criteria.grammar },
      { label: "Vocabulary", value: criteria.lexical },
      { label: "Pronunciation", value: criteria.pronunciation }
    ];
  }, [result]);

  const timingInsight = buildSpeakingTimingInsight({
    prompt,
    durationSeconds: recorder.durationSeconds,
    wordCount: result?.wordCount ?? transcript.trim().split(/\s+/g).filter(Boolean).length
  });
  const mainIssue = result?.blockers[0] ?? "Record or paste an answer to get one focused issue.";
  const retryTarget = result?.nextTryFocus ?? "Your retry target will appear after scoring.";
  const canEvaluate = Boolean(transcript.trim()) && !recorder.isRecording;
  const isTranscribing = recorder.status === "transcribing audio";

  function resetForNextPrompt(nextPromptId: string, mode: PracticeMode = practiceMode) {
    setSelectedPromptId(nextPromptId);
    setTranscript("");
    setResult(null);
    setRetryBaseline(null);
    setLastComparison(null);
    setPracticeMode(mode);
    recorder.reset();
    stopSpeaking();
  }

  function movePrompt(direction: -1 | 1) {
    if (!visiblePrompts.length) return;
    const nextIndex = (promptIndexWithinDifficulty + direction + visiblePrompts.length) % visiblePrompts.length;
    resetForNextPrompt(visiblePrompts[nextIndex].id, "guided");
  }

  function startRandomTopic(mode: PracticeMode = "guided") {
    const pool =
      mode === "surprise"
        ? surprisePrompts.length
          ? surprisePrompts
          : allPrompts
        : mode === "exam"
          ? allPrompts
          : visiblePrompts.length
            ? visiblePrompts
            : allPrompts;
    const randomPrompt = pool[Math.floor(Math.random() * pool.length)];
    if (!randomPrompt) return;
    setSelectedDifficulty(randomPrompt.difficulty);
    resetForNextPrompt(randomPrompt.id, mode);
  }

  function handleDifficultyChange(difficulty: Difficulty) {
    setSelectedDifficulty(difficulty);
    const nextPrompt = allPrompts.find((item) => item.difficulty === difficulty);
    if (nextPrompt) resetForNextPrompt(nextPrompt.id, "guided");
  }

  function useCustomQuestion(saveForLater: boolean) {
    const customPrompt = createCustomSpeakingPrompt({
      question: customQuestion,
      partChoice: customPartChoice,
      persistable: saveForLater
    });
    if (!customPrompt) {
      setCustomStatus("Paste a question first.");
      return;
    }

    if (saveForLater) {
      const nextPrompts = addCustomSpeakingPrompt(customPrompt, customPrompts);
      setCustomPrompts(nextPrompts);
      saveCustomSpeakingPrompts(nextPrompts);
      setCustomStatus("Saved to My questions.");
    } else {
      setSessionPrompts((current) => [customPrompt, ...current.filter((item) => item.question !== customPrompt.question)].slice(0, 5));
      setCustomStatus("Framed for this practice session.");
    }
    setSelectedDifficulty(customPrompt.difficulty);
    resetForNextPrompt(customPrompt.id, "guided");
  }

  function removeCustomQuestion(promptId: string) {
    const nextPrompts = deleteCustomSpeakingPrompt(promptId, customPrompts);
    setCustomPrompts(nextPrompts);
    saveCustomSpeakingPrompts(nextPrompts);
    setCustomStatus("Removed from My questions.");
    if (selectedPromptId === promptId) {
      const fallback = prompts.find((item) => item.difficulty === selectedDifficulty) ?? prompts[0];
      resetForNextPrompt(fallback.id, "guided");
    }
  }

  function handleRetrySameQuestion() {
    if (!result) return;
    setRetryBaseline(result);
    setTranscript("");
    setResult(null);
    setLastComparison(null);
    recorder.reset();
    stopSpeaking();
  }

  async function handleEvaluate() {
    if (!transcript.trim()) return;
    const evaluation = evaluateSpeaking({
      transcript,
      prompt,
      durationSeconds: recorder.durationSeconds
    });
    const saved = await saveAttempt({
      prompt,
      transcript,
      evaluation,
      durationSeconds: recorder.durationSeconds,
      audioBlob: recorder.audioBlob,
      rawTranscript: recorder.transcriptArtifact
        ? {
            ...recorder.transcriptArtifact,
            text: transcript,
            source: recorder.transcriptArtifact.text === transcript ? recorder.transcriptArtifact.source : "mixed"
          }
        : {
            text: transcript,
            source: "manual",
            capturedAt: new Date().toISOString()
          },
      browserTranscript: recorder.browserTranscriptArtifact,
      serviceTranscript: recorder.serviceTranscriptArtifact
    });
    setAttempts(saved);
    const savedAttempt = saved[0] ?? null;
    const savedEvaluation = savedAttempt?.evaluation ?? evaluation;
    setResult(savedEvaluation);
    setLastComparison(retryBaseline ? { before: retryBaseline.overallBand, after: savedEvaluation.overallBand } : null);
    setRetryBaseline(null);
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 pb-28 pt-3 sm:gap-5 lg:pb-8">
      <PracticeHeader
        attemptsCount={attempts.length}
        onSurprise={() => startRandomTopic("surprise")}
        onExam={() => startRandomTopic("exam")}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid gap-4">
          <PromptCard
            prompt={prompt}
            selectedDifficulty={selectedDifficulty}
            visiblePrompts={visiblePrompts}
            practiceMode={practiceMode}
            timingTarget={timingInsight.target}
            onDifficultyChange={handleDifficultyChange}
            onPromptChange={(promptId) => resetForNextPrompt(promptId, "guided")}
            onPrevious={() => movePrompt(-1)}
            onNext={() => movePrompt(1)}
          />

          <section className="speaking-card custom-question-card rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-sm text-slate-400">My questions</span>
                <h3 className="mt-1 text-2xl font-semibold text-white">Practice your own recent question</h3>
              </div>
              <button type="button" className="rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-bold text-slate-950" onClick={() => setShowCustomQuestion((value) => !value)}>
                Custom question
              </button>
            </div>
            {showCustomQuestion ? (
              <>
                <span className="mt-4 inline-flex rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">{customStatus}</span>
                <textarea
                  className="mt-4 min-h-28 w-full resize-y rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-base leading-7 text-white outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4"
                  value={customQuestion}
                  onChange={(event) => setCustomQuestion(event.target.value)}
                  placeholder="Paste a useful recent IELTS speaking question here."
                />
                <div className="mt-3 grid grid-cols-4 gap-2 rounded-2xl bg-slate-900 p-1">
                  {(["auto", 1, 2, 3] as const).map((part) => (
                    <button
                      key={part}
                      type="button"
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${customPartChoice === part ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}
                      onClick={() => setCustomPartChoice(part)}
                    >
                      {part === "auto" ? "Auto" : `Part ${part}`}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => useCustomQuestion(false)} disabled={!customQuestion.trim()}>
                    Practice now
                  </button>
                  <button type="button" className="rounded-2xl border border-slate-700 px-5 py-4 text-sm font-medium text-slate-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => useCustomQuestion(true)} disabled={!customQuestion.trim()}>
                    Save to My questions
                  </button>
                </div>
              </>
            ) : null}
            {showCustomQuestion && customPrompts.length ? (
              <div className="mt-5 grid gap-2">
                <span className="text-sm text-slate-400">Saved custom questions</span>
                <div className="flex flex-wrap gap-2">
                  {customPrompts.map((item) => (
                    <span key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200">
                      <button type="button" className="max-w-64 truncate text-left" onClick={() => {
                        setSelectedDifficulty(item.difficulty);
                        resetForNextPrompt(item.id, "guided");
                      }}>
                        {item.title}
                      </button>
                      <button type="button" className="text-slate-400 hover:text-rose-200" onClick={() => removeCustomQuestion(item.id)} aria-label={`Remove ${item.title}`}>
                        Remove
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {retryBaseline ? (
            <section className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-50">
              <span className="text-sm text-emerald-100/80">Retry mode</span>
              <p className="mt-1 font-semibold">{retryBaseline.nextTryFocus}</p>
            </section>
          ) : null}

          <RecorderCard
            isRecording={recorder.isRecording}
            status={recorder.status}
            durationLabel={recorder.durationSeconds ? formatDuration(recorder.durationSeconds) : ""}
            hasAudio={Boolean(recorder.audioBlob)}
            browserTranscriptSupported={recorder.browserTranscriptSupported}
            onToggleRecording={recorder.isRecording ? recorder.stop : recorder.start}
            onTranscribe={() => void recorder.transcribeAudio()}
            onRandomTopic={() => startRandomTopic("guided")}
          />

          <TranscriptCard
            transcript={transcript}
            canEvaluate={canEvaluate}
            isTranscribing={isTranscribing}
            onTranscriptChange={(value) => {
              setTranscript(value);
              setResult(null);
            }}
            onEvaluate={() => void handleEvaluate()}
            onClear={() => {
              setTranscript("");
              setResult(null);
            }}
          />
        </div>

        <FeedbackPanel
          result={result}
          metrics={metrics}
          mainIssue={mainIssue}
          retryTarget={retryTarget}
          timingLabel={timingInsight.label}
          timingStatus={timingInsight.status}
          timingTarget={timingInsight.target}
          lastComparison={lastComparison}
          onRetry={handleRetrySameQuestion}
        />
      </div>

      <MobileActionDock
        isRecording={recorder.isRecording}
        hasResult={Boolean(result)}
        canEvaluate={canEvaluate}
        onToggleRecording={recorder.isRecording ? recorder.stop : recorder.start}
        onEvaluate={() => void handleEvaluate()}
        onRetry={handleRetrySameQuestion}
      />
    </main>
  );
}
