import Link from "next/link";
import { ScoreRing } from "@/components/score-ring";
import type { SpeakingEvaluation, SpeakingPrompt } from "@/features/speaking/types";
import { formatBand } from "@/lib/format";

type Difficulty = SpeakingPrompt["difficulty"];
type PracticeMode = "guided" | "exam" | "surprise";

type Metric = {
  label: string;
  value: number;
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Part 1",
  medium: "Part 2",
  hard: "Part 3"
};

export function PracticeHeader({ attemptsCount, onSurprise, onExam }: {
  attemptsCount: number;
  onSurprise: () => void;
  onExam: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-200">
            IELTS speaking loop
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            Speak. Score. Retry.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            One-tap recording, automatic raw transcript capture, strict feedback, then the next attempt without leaving the page.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <Link className="rounded-2xl border border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-200" href="/history">
            {attemptsCount} attempts
          </Link>
          <button type="button" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200" onClick={onSurprise}>
            Surprise
          </button>
          <button type="button" className="col-span-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 sm:col-span-1" onClick={onExam}>
            Exam mode
          </button>
        </div>
      </div>
    </section>
  );
}

export function PromptCard({
  prompt,
  selectedDifficulty,
  visiblePrompts,
  practiceMode,
  timingTarget,
  onDifficultyChange,
  onPromptChange,
  onPrevious,
  onNext
}: {
  prompt: SpeakingPrompt;
  selectedDifficulty: Difficulty;
  visiblePrompts: SpeakingPrompt[];
  practiceMode: PracticeMode;
  timingTarget: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onPromptChange: (promptId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm text-slate-400">Active question</span>
          <h2 className="mt-1 text-2xl font-semibold text-white">{prompt.title}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-slate-700 text-xl text-slate-200" onClick={onPrevious} aria-label="Previous topic">
            ‹
          </button>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-slate-700 text-xl text-slate-200" onClick={onNext} aria-label="Next topic">
            ›
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-900 p-1">
        {(["easy", "medium", "hard"] as const).map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            className={`rounded-xl px-3 py-2 text-sm font-medium ${selectedDifficulty === difficulty ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}
            onClick={() => onDifficultyChange(difficulty)}
          >
            {difficultyLabels[difficulty]}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xl leading-8 text-white sm:text-2xl sm:leading-9">{prompt.question}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-300">
        <span className="rounded-full border border-slate-700 px-3 py-1">Part {prompt.part}</span>
        <span className="rounded-full border border-slate-700 px-3 py-1">{timingTarget}</span>
        <span className="rounded-full border border-slate-700 px-3 py-1">{practiceMode === "exam" ? "Exam" : practiceMode === "surprise" ? "Surprise" : "Guided"}</span>
        <span className="rounded-full border border-slate-700 px-3 py-1">{prompt.yearLabel}</span>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {visiblePrompts.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`h-10 min-w-10 rounded-full border text-sm font-semibold ${prompt.id === item.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-slate-700 text-slate-300"}`}
            onClick={() => onPromptChange(item.id)}
            aria-label={`Open topic ${index + 1}: ${item.title}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RecorderCard({
  isRecording,
  status,
  durationLabel,
  hasAudio,
  browserTranscriptSupported,
  onToggleRecording,
  onTranscribe,
  onRandomTopic
}: {
  isRecording: boolean;
  status: string;
  durationLabel: string;
  hasAudio: boolean;
  browserTranscriptSupported: boolean;
  onToggleRecording: () => void;
  onTranscribe: () => void;
  onRandomTopic: () => void;
}) {
  const transcribing = status === "transcribing audio";

  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <button
          type="button"
          className={`mx-auto grid h-36 w-36 place-items-center rounded-full text-center text-base font-semibold shadow-2xl transition sm:mx-0 ${isRecording ? "bg-rose-400 text-slate-950 shadow-rose-500/20" : "bg-cyan-300 text-slate-950 shadow-cyan-500/20"}`}
          onClick={onToggleRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <span>{isRecording ? "Stop" : "Record"}</span>
        </button>
        <div>
          <span className="text-sm text-slate-400">Recording</span>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {isRecording ? "Listening now" : transcribing ? "Building transcript" : hasAudio ? "Audio saved" : "Tap once to start"}
          </h3>
          <p className="mt-3 text-slate-300">
            {browserTranscriptSupported
              ? "Live browser transcript appears while you speak. Audio transcription runs automatically after stop."
              : "Audio transcription runs automatically after stop. You can edit the transcript before scoring."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300" aria-live="polite">
            <span className="rounded-full border border-slate-700 px-3 py-1 capitalize">{status}</span>
            {durationLabel ? <span className="rounded-full border border-slate-700 px-3 py-1">{durationLabel}</span> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200" onClick={onTranscribe} disabled={!hasAudio || isRecording}>
              Retry transcript
            </button>
            <button type="button" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200" onClick={onRandomTopic}>
              Random topic
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TranscriptCard({
  transcript,
  canEvaluate,
  isTranscribing,
  onTranscriptChange,
  onEvaluate,
  onClear
}: {
  transcript: string;
  canEvaluate: boolean;
  isTranscribing: boolean;
  onTranscriptChange: (value: string) => void;
  onEvaluate: () => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm text-slate-400">Raw transcript</span>
          <h3 className="mt-1 text-2xl font-semibold text-white">Score what you actually said</h3>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300" aria-live="polite">
          {isTranscribing ? "Auto-transcribing" : transcript.trim() ? "Ready for feedback" : "Waiting for speech"}
        </span>
      </div>
      <textarea
        className="mt-5 min-h-56 w-full resize-y rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-base leading-7 text-white outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 sm:min-h-64"
        value={transcript}
        onChange={(event) => onTranscriptChange(event.target.value)}
        placeholder="Your transcript appears here automatically. Edit only if the raw capture is wrong."
      />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button type="button" className="rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50" onClick={onEvaluate} disabled={!canEvaluate}>
          Get feedback
        </button>
        <button type="button" className="rounded-2xl border border-slate-700 px-5 py-4 text-sm font-medium text-slate-200" onClick={onClear}>
          Clear
        </button>
      </div>
    </section>
  );
}

export function FeedbackPanel({
  result,
  metrics,
  mainIssue,
  retryTarget,
  timingLabel,
  timingStatus,
  timingTarget,
  lastComparison,
  onRetry
}: {
  result: SpeakingEvaluation | null;
  metrics: Metric[];
  mainIssue: string;
  retryTarget: string;
  timingLabel: string;
  timingStatus: string;
  timingTarget: string;
  lastComparison: { before: number; after: number } | null;
  onRetry: () => void;
}) {
  return (
    <aside className="grid gap-3 lg:sticky lg:top-24">
      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-sm text-slate-400">Feedback</span>
            <h2 className="mt-1 text-3xl font-semibold text-white">{result ? `Band ${result.overallBand.toFixed(1)}` : "Not scored"}</h2>
          </div>
          <ScoreRing score={result?.overallBand ?? 0} />
        </div>
        <p className="mt-4 leading-7 text-slate-300">{result ? result.summary : "Record, confirm the transcript, then get a strict evidence-based estimate."}</p>
        {lastComparison ? (
          <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-center font-semibold text-emerald-200">
            Retry improved: {lastComparison.before.toFixed(1)} to {lastComparison.after.toFixed(1)}
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
        <span className="text-sm text-slate-400">One issue</span>
        <p className="mt-2 text-lg font-semibold leading-7 text-white">{mainIssue}</p>
      </section>

      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
        <span className="text-sm text-slate-400">{timingLabel}</span>
        <p className="mt-2 text-lg font-semibold text-white">{timingStatus}</p>
        <p className="mt-1 text-sm text-slate-400">{timingTarget}</p>
      </section>

      <section className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/10 p-4 sm:p-5">
        <span className="text-sm text-emerald-100/80">Next retry target</span>
        <p className="mt-2 text-lg font-semibold leading-7 text-white">{retryTarget}</p>
        <button type="button" className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50" onClick={onRetry} disabled={!result}>
          Retry this question
        </button>
      </section>

      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white">Rubric</h3>
          <span className="text-sm text-slate-400">IELTS-style</span>
        </div>
        <div className="mt-4 grid gap-3">
          {metrics.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-200">{item.label}</span>
                <span className="text-slate-400">{formatBand(item.value)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <span className="block h-full rounded-full bg-cyan-300" style={{ width: `${Math.min((item.value / 9) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        {result ? (
          <Link className="mt-5 block rounded-2xl border border-slate-700 px-5 py-4 text-center text-sm font-medium text-slate-200" href="/evaluation">
            Open full evidence
          </Link>
        ) : null}
      </section>
    </aside>
  );
}

export function MobileActionDock({
  isRecording,
  hasResult,
  canEvaluate,
  onToggleRecording,
  onEvaluate,
  onRetry
}: {
  isRecording: boolean;
  hasResult: boolean;
  canEvaluate: boolean;
  onToggleRecording: () => void;
  onEvaluate: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-2 gap-2 rounded-3xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur lg:hidden">
      <button type="button" className={`rounded-2xl px-4 py-4 text-sm font-bold ${isRecording ? "bg-rose-400 text-slate-950" : "bg-cyan-300 text-slate-950"}`} onClick={onToggleRecording}>
        {isRecording ? "Stop" : "Record"}
      </button>
      <button
        type="button"
        className="rounded-2xl border border-slate-700 px-4 py-4 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={hasResult ? onRetry : onEvaluate}
        disabled={hasResult ? false : !canEvaluate}
      >
        {hasResult ? "Retry" : "Feedback"}
      </button>
    </div>
  );
}
