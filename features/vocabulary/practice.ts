export type ModelMode = "normal" | "slow";
export type GoalKey = "listens" | "records" | "learns";

export type DailyProgress = {
  date: string;
  listens: number;
  records: number;
  learns: number;
  streak: number;
  completedDate: string | null;
};

export const dailyTargets = {
  listens: 5,
  records: 3,
  learns: 1
} as const;

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function yesterdayKey(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return todayKey(previous);
}

export function defaultProgress(date = new Date()): DailyProgress {
  return {
    date: todayKey(date),
    listens: 0,
    records: 0,
    learns: 0,
    streak: 0,
    completedDate: null
  };
}

export function isComplete(progress: DailyProgress) {
  return (
    progress.listens >= dailyTargets.listens &&
    progress.records >= dailyTargets.records &&
    progress.learns >= dailyTargets.learns
  );
}

export function prepareProgress(raw: DailyProgress, date = new Date()): DailyProgress {
  const today = todayKey(date);
  if (raw.date === today) return raw;
  return {
    ...defaultProgress(date),
    streak: raw.completedDate === yesterdayKey(date) ? raw.streak : 0,
    completedDate: raw.completedDate
  };
}

export function completeProgress(next: DailyProgress, date = new Date()): DailyProgress {
  if (!isComplete(next) || next.completedDate === next.date) return next;

  return {
    ...next,
    streak: next.completedDate === yesterdayKey(date) ? next.streak + 1 : Math.max(1, next.streak || 1),
    completedDate: next.date
  };
}

export function incrementGoal(progress: DailyProgress, key: GoalKey, date = new Date()): DailyProgress {
  const current = prepareProgress(progress, date);
  return completeProgress(
    {
      ...current,
      [key]: current[key] + 1
    },
    date
  );
}

export function estimateSyllables(word: string) {
  const groups = word.toLowerCase().match(/[aeiouy]+/g)?.length ?? 1;
  return Math.max(1, groups);
}

export function estimateTargetSeconds(word: string, mode: ModelMode) {
  const syllables = estimateSyllables(word);
  const base = mode === "slow" ? 0.95 : 0.55;
  const perSyllable = mode === "slow" ? 0.42 : 0.24;
  return Number((base + syllables * perSyllable).toFixed(2));
}
