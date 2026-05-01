"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  dailyTargets,
  defaultProgress,
  estimateTargetSeconds,
  incrementGoal as incrementGoalProgress,
  isComplete,
  prepareProgress,
  type DailyProgress,
  type GoalKey,
  type ModelMode
} from "@/features/vocabulary/practice";
import { soundDrills } from "@/features/vocabulary/sound-drills";
import { pronunciationWords, wordFamilies } from "@/features/vocabulary/word-families";

type VoiceRegion = "US" | "UK";

type WordEntry = {
  w: string;
  ipa: string;
  te: string;
  tip: string;
};

type CustomWord = {
  w: string;
  addedAt: string;
};

type ProblemWord = {
  word: string;
  pronunciationTip: string;
  meaning?: string;
  status: "needs-practice" | "improving" | "learned";
  createdAt: string;
};

type Comparison = {
  score: number;
  label: string;
  detail: string;
  targetSeconds: number;
  durationSeconds: number;
  audibility: string;
};

const CUSTOM_WORDS_KEY = "ielts-vocab-custom-words-v1";
const PROBLEM_WORDS_KEY = "ielts-vocab-problem-words-v1";
const GOALS_KEY = "ielts-vocab-daily-goals-v1";
const learnedWordsKey = "ielts-vocab-learned-words-v1";

function preferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
}

const preloadedWords: WordEntry[] = [
  { w: "analysis", ipa: "/əˈnæləsɪs/", te: "అనాలిసిస్", tip: "Stress the second syllable: NAL." },
  { w: "average", ipa: "/ˈævərɪdʒ/", te: "ఆవరేజ్", tip: "Three quick beats; do not say av-er-age slowly." },
  { w: "career", ipa: "/kəˈrɪr/", te: "కరీర్", tip: "Stress the final syllable." },
  { w: "clothes", ipa: "/kloʊðz/", te: "క్లోజ్", tip: "One syllable; the th is very light." },
  { w: "colleague", ipa: "/ˈkɑːliːɡ/", te: "కాలీగ్", tip: "Stress the first syllable." },
  { w: "comfortable", ipa: "/ˈkʌmftərbəl/", te: "కంఫ్టర్బుల్", tip: "Often three syllables: KUMF-ter-bul." },
  { w: "culture", ipa: "/ˈkʌltʃər/", te: "కల్చర్", tip: "End softly with chur." },
  { w: "data", ipa: "/ˈdeɪtə/ or /ˈdætə/", te: "డేటా", tip: "Both DAY-tuh and DA-tuh are accepted." },
  { w: "debt", ipa: "/det/", te: "డెట్", tip: "The b is silent." },
  { w: "determine", ipa: "/dɪˈtɜːrmɪn/", te: "డిటర్మిన్", tip: "Stress TER, not mine." },
  { w: "develop", ipa: "/dɪˈveləp/", te: "డివెలప్", tip: "Stress VEL." },
  { w: "eligible", ipa: "/ˈelɪdʒəbəl/", te: "ఎలిజిబుల్", tip: "Start with EL, not ee." },
  { w: "entrepreneur", ipa: "/ˌɑːntrəprəˈnɜːr/", te: "ఆంత్రప్రనర్", tip: "Keep the middle light; stress the end." },
  { w: "environment", ipa: "/ɪnˈvaɪrənmənt/", te: "ఇన్వైరన్మెంట్", tip: "Stress VY; do not add extra syllables at the end." },
  { w: "February", ipa: "/ˈfebrueri/", te: "ఫెబ్రువరీ", tip: "Keep the first r light and clear." },
  { w: "foreign", ipa: "/ˈfɔːrən/", te: "ఫారెన్", tip: "Two syllables; not for-eign." },
  { w: "genre", ipa: "/ˈʒɑːnrə/", te: "జాన్రా", tip: "Starts with a soft zh sound." },
  { w: "hierarchy", ipa: "/ˈhaɪərɑːrki/", te: "హైయరార్కీ", tip: "Stress HI." },
  { w: "island", ipa: "/ˈaɪlənd/", te: "ఐలండ్", tip: "The s is silent." },
  { w: "language", ipa: "/ˈlæŋɡwɪdʒ/", te: "లాంగ్వేజ్", tip: "Two syllables; keep gw together." },
  { w: "library", ipa: "/ˈlaɪbreri/", te: "లైబ్రరీ", tip: "Say the first r clearly." },
  { w: "measure", ipa: "/ˈmeʒər/", te: "మెజర్", tip: "Middle sound is zh, like genre." },
  { w: "opportunity", ipa: "/ˌɑːpərˈtuːnəti/", te: "ఆపర్చూనిటీ", tip: "Stress TOO." },
  { w: "photograph", ipa: "/ˈfoʊtəɡræf/", te: "ఫోటోగ్రాఫ్", tip: "Stress PHO; photography shifts the stress." },
  { w: "pronunciation", ipa: "/prəˌnʌnsiˈeɪʃən/", te: "ప్రనన్సియేషన్", tip: "It is nun, not noun." },
  { w: "queue", ipa: "/kjuː/", te: "క్యూ", tip: "One syllable only." },
  { w: "receipt", ipa: "/rɪˈsiːt/", te: "రిసీట్", tip: "The p is silent." },
  { w: "research", ipa: "/ˈriːsɜːrtʃ/ or /rɪˈsɜːrtʃ/", te: "రీసర్చ్", tip: "Noun stress often starts; verb stress often ends." },
  { w: "schedule", ipa: "US /ˈskedʒuːl/, UK /ˈʃedjuːl/", te: "స్కెజూల్ / షెడ్యూల్", tip: "US starts sk; UK often starts sh." },
  { w: "subtle", ipa: "/ˈsʌtəl/", te: "సటిల్", tip: "The b is silent." }
];

const expandedPreloadedWords: WordEntry[] = [
  { w: "accurate", ipa: "/AK-yuh-ruht/", te: "accuracy family", tip: "Stress AK; keep the middle light." },
  { w: "achieve", ipa: "/uh-CHEEV/", te: "goal word", tip: "Stress CHEEV; start with a light uh sound." },
  { w: "advantage", ipa: "/ad-VAN-tij/", te: "Task 2 word", tip: "Stress VAN, not ad." },
  { w: "affect", ipa: "/uh-FEKT/", te: "verb", tip: "Stress FEKT. Use affect as the verb." },
  { w: "analyze", ipa: "/AN-uh-lyz/", te: "verb", tip: "Stress AN; the ending sounds like lyz." },
  { w: "appropriate", ipa: "/uh-PROH-pree-uht/", te: "formal word", tip: "Stress PROH and keep the ending light." },
  { w: "available", ipa: "/uh-VAY-luh-bul/", te: "daily word", tip: "Stress VAY; say four quick syllables." },
  { w: "beneficial", ipa: "/ben-uh-FISH-ul/", te: "Task 2 word", tip: "Stress FISH; avoid saying benefit-cial." },
  { w: "challenge", ipa: "/CHAL-inj/", te: "common topic", tip: "Two syllables; end with a soft j sound." },
  { w: "comparison", ipa: "/kuhm-PAIR-uh-sun/", te: "essay word", tip: "Stress PAIR; do not say com-pari-son slowly." },
  { w: "conclusion", ipa: "/kuhn-KLOO-zhun/", te: "essay ending", tip: "Stress KLOO; middle sound is zh." },
  { w: "consequence", ipa: "/KON-suh-kwens/", te: "result word", tip: "Stress KON; keep the final syllable short." },
  { w: "consider", ipa: "/kuhn-SID-er/", te: "formal verb", tip: "Stress SID; the first syllable is light." },
  { w: "convenient", ipa: "/kuhn-VEEN-yuhnt/", te: "daily word", tip: "Stress VEEN; do not drop the y sound." },
  { w: "criteria", ipa: "/kry-TEER-ee-uh/", te: "scoring word", tip: "Stress TEER; criteria is plural." },
  { w: "crucial", ipa: "/KROO-shul/", te: "important", tip: "Two syllables; sh sound in the middle." },
  { w: "definitely", ipa: "/DEF-uh-nit-lee/", te: "certainty", tip: "Stress DEF; avoid saying defi-nate-ly." },
  { w: "development", ipa: "/di-VEL-up-munt/", te: "growth word", tip: "Stress VEL and keep the ending soft." },
  { w: "disadvantage", ipa: "/dis-uhd-VAN-tij/", te: "Task 2 word", tip: "Stress VAN, just like advantage." },
  { w: "education", ipa: "/ej-uh-KAY-shun/", te: "topic word", tip: "Stress KAY; keep the ending shun." },
  { w: "efficient", ipa: "/ih-FISH-unt/", te: "work word", tip: "Stress FISH; do not overpronounce the final t." },
  { w: "essential", ipa: "/ih-SEN-shul/", te: "important", tip: "Stress SEN; sh sound near the end." },
  { w: "especially", ipa: "/ih-SPESH-uh-lee/", te: "linking word", tip: "Stress SPESH; avoid adding extra syllables." },
  { w: "exaggerate", ipa: "/ig-ZAJ-uh-rayt/", te: "speaking word", tip: "Stress ZAJ; the first sound is light." },
  { w: "experience", ipa: "/ik-SPEER-ee-uns/", te: "common word", tip: "Stress SPEER; keep all syllables moving." },
  { w: "focus", ipa: "/FOH-kus/", te: "study word", tip: "Stress FOH; do not say fock-us." },
  { w: "government", ipa: "/GUV-er-munt/", te: "Task 2 topic", tip: "Often three syllables; the n is very light." },
  { w: "guarantee", ipa: "/gar-un-TEE/", te: "promise word", tip: "Stress TEE; do not pronounce the u strongly." },
  { w: "important", ipa: "/im-POR-tunt/", te: "common word", tip: "Stress POR; final t can be light." },
  { w: "improve", ipa: "/im-PROOV/", te: "upgrade word", tip: "Stress PROOV and hold the oo sound." },
  { w: "individual", ipa: "/in-duh-VIJ-oo-ul/", te: "society word", tip: "Stress VIJ; do not rush the middle." },
  { w: "infrastructure", ipa: "/IN-fruh-struk-cher/", te: "city word", tip: "Stress IN; say struk-cher clearly." },
  { w: "interesting", ipa: "/IN-truh-sting/", te: "daily word", tip: "Often three syllables; stress IN." },
  { w: "issue", ipa: "/ISH-oo/", te: "problem word", tip: "Two syllables; starts with ish." },
  { w: "knowledge", ipa: "/NOL-ij/", te: "education word", tip: "The k is silent; stress NOL." },
  { w: "necessary", ipa: "/NES-uh-ser-ee/", te: "need word", tip: "Stress NES; avoid saying neck-cessary." },
  { w: "opinion", ipa: "/uh-PIN-yun/", te: "speaking Part 3", tip: "Stress PIN; include the y sound." },
  { w: "particular", ipa: "/per-TIK-yuh-ler/", te: "specific", tip: "Stress TIK; useful in examples." },
  { w: "percent", ipa: "/per-SENT/", te: "data word", tip: "Stress SENT; avoid per-cent with equal stress." },
  { w: "policy", ipa: "/POL-uh-see/", te: "government word", tip: "Stress POL; three quick syllables." },
  { w: "probably", ipa: "/PROB-uh-blee/", te: "certainty", tip: "Stress PROB; do not drop the middle completely." },
  { w: "process", ipa: "/PRAH-ses/", te: "method word", tip: "Stress the first syllable." },
  { w: "psychology", ipa: "/sy-KOL-uh-jee/", te: "study word", tip: "The p is silent; stress KOL." },
  { w: "quality", ipa: "/KWOL-uh-tee/", te: "standard word", tip: "Stress KWOL; keep the final tee light." },
  { w: "reasonable", ipa: "/REE-zuh-nuh-bul/", te: "balanced word", tip: "Stress REE; four light beats." },
  { w: "recommend", ipa: "/rek-uh-MEND/", te: "suggest word", tip: "Stress MEND; useful for solutions." },
  { w: "reliable", ipa: "/ri-LY-uh-bul/", te: "trust word", tip: "Stress LY; not ree-lee-able." },
  { w: "responsibility", ipa: "/ri-spon-suh-BIL-uh-tee/", te: "society word", tip: "Stress BIL; keep the ending quick." },
  { w: "significant", ipa: "/sig-NIF-uh-kunt/", te: "important", tip: "Stress NIF; useful in Task 2." },
  { w: "society", ipa: "/suh-SY-uh-tee/", te: "public life", tip: "Stress SY; four syllables." },
  { w: "solution", ipa: "/suh-LOO-shun/", te: "answer word", tip: "Stress LOO; ending is shun." },
  { w: "specific", ipa: "/spuh-SIF-ik/", te: "detail word", tip: "Stress SIF; avoid pacific." },
  { w: "successful", ipa: "/suk-SES-ful/", te: "achievement", tip: "Stress SES; final ful is light." },
  { w: "technology", ipa: "/tek-NOL-uh-jee/", te: "topic word", tip: "Stress NOL; keep the ending soft." },
  { w: "throughout", ipa: "/throo-OUT/", te: "linking word", tip: "Start with th and stress OUT." },
  { w: "usually", ipa: "/YOO-zhoo-uh-lee/", te: "frequency", tip: "Middle sound is zh; keep it smooth." },
  { w: "valuable", ipa: "/VAL-yoo-uh-bul/", te: "value word", tip: "Stress VAL; four light beats." }
];

const allPreloadedWords = [...preloadedWords, ...expandedPreloadedWords];

function normalizeWord(value: string) {
  return value.trim().toLowerCase();
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function compareRecording(blob: Blob, durationSeconds: number, word: string, mode: ModelMode): Promise<Comparison> {
  const targetSeconds = estimateTargetSeconds(word, mode);
  const timingDelta = Math.abs(durationSeconds - targetSeconds) / Math.max(targetSeconds, 0.1);
  const timingScore = Math.max(0, 100 - timingDelta * 85);
  let rms = 0.03;

  try {
    const AudioCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtor) {
      const context = new AudioCtor();
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      const data = buffer.getChannelData(0);
      const step = Math.max(1, Math.floor(data.length / 8000));
      let sum = 0;
      let count = 0;
      for (let index = 0; index < data.length; index += step) {
        sum += data[index] * data[index];
        count += 1;
      }
      rms = Math.sqrt(sum / Math.max(count, 1));
      await context.close();
    }
  } catch {
    rms = 0.03;
  }

  const volumeScore = rms < 0.008 ? 45 : rms > 0.22 ? 70 : 100;
  const score = Math.round(timingScore * 0.72 + volumeScore * 0.28);
  const pace = durationSeconds < targetSeconds * 0.78 ? "too fast" : durationSeconds > targetSeconds * 1.28 ? "too slow" : "close";
  const audibility = rms < 0.008 ? "Very quiet" : rms > 0.22 ? "Clipped or loud" : "Clear level";
  const targetLabel = word.trim().split(/\s+/g).length > 1 ? "sentence" : mode;

  return {
    score,
    label: score >= 82 ? "Close to model timing" : score >= 62 ? "Usable, adjust pace" : "Repeat with clearer pacing",
    detail: `Your recording was ${durationSeconds.toFixed(1)}s; the ${targetLabel} practice target is about ${targetSeconds.toFixed(1)}s, so the pace is ${pace}.`,
    targetSeconds,
    durationSeconds,
    audibility
  };
}

export default function VocabularyPronunciationPage() {
  const [wordInput, setWordInput] = useState("comfortable");
  const [voiceRegion, setVoiceRegion] = useState<VoiceRegion>("US");
  const [lastModelMode, setLastModelMode] = useState<ModelMode>("normal");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [problemWords, setProblemWords] = useState<ProblemWord[]>([]);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [progress, setProgress] = useState<DailyProgress>(() => defaultProgress());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [status, setStatus] = useState("Ready");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  useEffect(() => {
    setCustomWords(loadJson<CustomWord[]>(CUSTOM_WORDS_KEY, []));
    setProblemWords(loadJson<ProblemWord[]>(PROBLEM_WORDS_KEY, []));
    setLearnedWords(loadJson<string[]>(learnedWordsKey, []));
    setProgress(prepareProgress(loadJson<DailyProgress>(GOALS_KEY, defaultProgress())));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/vocab-pronunciation-sw", { scope: "/vocabulary" })
        .then(() => setStatus("Offline cache ready after this page loads once"))
        .catch(() => setStatus("Offline cache unavailable in this browser session"));
    }
  }, []);

  useEffect(() => {
    const refreshVoices = () => setVoices(window.speechSynthesis.getVoices());
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(customWords));
  }, [customWords]);

  useEffect(() => {
    window.localStorage.setItem(PROBLEM_WORDS_KEY, JSON.stringify(problemWords));
  }, [problemWords]);

  useEffect(() => {
    window.localStorage.setItem(learnedWordsKey, JSON.stringify(learnedWords));
  }, [learnedWords]);

  useEffect(() => {
    window.localStorage.setItem(GOALS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [recordingUrl]);

  const activeWord = wordInput.trim();
  const normalizedActiveWord = normalizeWord(activeWord);
  const activeEntry = useMemo(
    () => allPreloadedWords.find((entry) => normalizeWord(entry.w) === normalizedActiveWord) ?? null,
    [normalizedActiveWord]
  );
  const activePronunciation = useMemo(
    () => pronunciationWords.find((entry) => normalizeWord(entry.spelling) === normalizedActiveWord) ?? null,
    [normalizedActiveWord]
  );
  const customEntry = customWords.find((entry) => normalizeWord(entry.w) === normalizedActiveWord) ?? null;
  const isLearned = learnedWords.includes(normalizedActiveWord);
  const problemEntry = problemWords.find((entry) => normalizeWord(entry.word) === normalizedActiveWord) ?? null;
  const activeDrill = soundDrills.find((drill) => drill.words.some((word) => normalizeWord(word) === normalizedActiveWord)) ?? null;
  const activeFamily = wordFamilies.find((family) => family.words.some((word) => normalizeWord(word) === normalizedActiveWord)) ?? null;
  const activeExample =
    activePronunciation?.examples[0] ??
    (activeWord ? `I want to pronounce ${activeWord} clearly when I speak English.` : "Choose a word to practice it in a sentence.");
  const activeTip = activePronunciation?.tip ?? activeEntry?.tip ?? activeDrill?.tip ?? "Listen slowly, repeat once, then record yourself.";
  const activeMeaning = activePronunciation?.meaning ?? activeEntry?.te ?? "Add meaning in your own notes by saving it as a problem word.";
  const activeSound = activePronunciation?.simpleSound ?? activeEntry?.ipa ?? "Listen normal and slow to learn the sound.";
  const activeStress = activePronunciation?.stress ?? "Listen for the strongest syllable.";
  const activeTrap = activePronunciation?.spellingTrap ?? activeTip;

  const filteredWords = useMemo(() => {
    const query = normalizedActiveWord;
    const base = allPreloadedWords.filter((entry) => normalizeWord(entry.w).includes(query));
    return query ? base.slice(0, 10) : allPreloadedWords.slice(0, 10);
  }, [normalizedActiveWord]);

  const goalCards = [
    { key: "listens" as const, label: "Listen", value: progress.listens, target: dailyTargets.listens },
    { key: "records" as const, label: "Record", value: progress.records, target: dailyTargets.records },
    { key: "learns" as const, label: "Learn", value: progress.learns, target: dailyTargets.learns }
  ];

  function incrementGoal(key: GoalKey) {
    setProgress((current) => incrementGoalProgress(current, key));
  }

  function pickVoice() {
    const lang = voiceRegion === "US" ? "en-US" : "en-GB";
    return (
      voices.find((voice) => voice.lang === lang && /natural|neural|online|google|microsoft/i.test(voice.name)) ??
      voices.find((voice) => voice.lang === lang) ??
      voices.find((voice) => voice.lang.startsWith("en")) ??
      null
    );
  }

  function speakText(text: string, mode: ModelMode, statusLabel: string) {
    if (!text.trim() || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceRegion === "US" ? "en-US" : "en-GB";
    utterance.rate = mode === "slow" ? 0.62 : 0.96;
    utterance.pitch = 1;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    setLastModelMode(mode);
    setStatus(statusLabel);
    incrementGoal("listens");
  }

  function speak(mode: ModelMode) {
    speakText(activeWord, mode, `Playing ${voiceRegion} ${mode}`);
  }

  function speakSentence(mode: ModelMode = "normal") {
    speakText(activeExample, mode, `Playing sentence ${voiceRegion} ${mode}`);
  }

  function addCustomWord() {
    if (!activeWord || activeEntry || customEntry) return;
    setCustomWords([{ w: activeWord, addedAt: new Date().toISOString() }, ...customWords]);
    setStatus("Custom word saved on this device");
  }

  function markLearned() {
    if (!normalizedActiveWord || isLearned) return;
    setLearnedWords([normalizedActiveWord, ...learnedWords]);
    incrementGoal("learns");
    setStatus("Marked learned for today's goal");
  }

  function saveProblemWord() {
    if (!activeWord || problemEntry) return;
    const next: ProblemWord = {
      word: activeWord,
      pronunciationTip: activeTrap,
      meaning: activePronunciation?.meaning,
      status: "needs-practice",
      createdAt: new Date().toISOString()
    };
    setProblemWords([next, ...problemWords].slice(0, 60));
    setStatus("Saved to My problem words");
  }

  function setProblemStatus(word: string, statusValue: ProblemWord["status"]) {
    setProblemWords((current) =>
      current.map((entry) => (normalizeWord(entry.word) === normalizeWord(word) ? { ...entry, status: statusValue } : entry))
    );
  }

  function removeProblemWord(word: string) {
    setProblemWords((current) => current.filter((entry) => normalizeWord(entry.word) !== normalizeWord(word)));
    setStatus("Removed from My problem words");
  }

  async function startRecording(target: "word" | "sentence" = "word") {
    if (!activeWord || !("MediaRecorder" in window)) {
      setStatus("Recording is not available in this browser");
      return;
    }
    const practiceTarget = target === "sentence" ? activeExample : activeWord;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = preferredAudioMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    chunksRef.current = [];
    streamRef.current = stream;
    recorderRef.current = recorder;
    startedAtRef.current = performance.now();
    setComparison(null);
    setRecordingSeconds(0);
    setStatus(target === "sentence" ? "Recording sentence practice" : "Recording word practice");

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      const duration = (performance.now() - startedAtRef.current) / 1000;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      setRecordingUrl(URL.createObjectURL(blob));
      setRecordingSeconds(duration);
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
      setStatus("Recording saved locally");
      incrementGoal("records");
      setComparison(await compareRecording(blob, duration, practiceTarget, lastModelMode));
    };

    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  const voiceName = pickVoice()?.name ?? `${voiceRegion === "US" ? "en-US" : "en-GB"} browser voice`;

  return (
    <main className="vocab-page">
      <section className="vocab-header">
        <div>
          <span className="eyebrow">Vocabulary & pronunciation</span>
          <h1>Hear it, record it, keep the daily streak.</h1>
          <p>Speech playback and recordings stay in the browser. Custom words and goals are saved in localStorage.</p>
        </div>
        <div className="vocab-streak">
          <span>Streak</span>
          <strong>{progress.streak}</strong>
          <small>{isComplete(progress) ? "Today complete" : "Complete all three goals"}</small>
        </div>
      </section>

      <section className="vocab-layout">
        <div className="vocab-main">
          <div className="vocab-panel">
            <div className="vocab-word-row">
              <label>
                <span>Practice word</span>
                <input
                  value={wordInput}
                  onChange={(event) => setWordInput(event.target.value)}
                  placeholder="Type a word"
                  autoCapitalize="none"
                />
              </label>
              <button type="button" className="button button-ghost" onClick={addCustomWord} disabled={!activeWord || Boolean(activeEntry || customEntry)}>
                Add custom
              </button>
            </div>

            <div className="vocab-suggestions">
              {filteredWords.map((entry) => (
                <button key={entry.w} type="button" onClick={() => setWordInput(entry.w)} className={entry.w === activeEntry?.w ? "active" : ""}>
                  {entry.w}
                </button>
              ))}
            </div>
          </div>

          <div className="vocab-result">
            <div>
              <span className="mini-note">{activeEntry ? "Preloaded tricky word" : customEntry ? "Custom word" : "New word"}</span>
              <h2>{activeWord || "Type a word"}</h2>
              <div className="vocab-pronunciation-grid">
                <div>
                  <span>Sound spelling</span>
                  <strong>{activeSound}</strong>
                </div>
                <div>
                  <span>Stress</span>
                  <strong>{activeStress}</strong>
                </div>
                <div>
                  <span>Meaning</span>
                  <strong>{activeMeaning}</strong>
                </div>
                <div>
                  <span>Spelling trap</span>
                  <strong>{activeTrap}</strong>
                </div>
              </div>
              <p>{activeTip}</p>
              <div className="sentence-practice">
                <span>Sentence practice</span>
                <strong>{activeExample}</strong>
              </div>
              {activePronunciation?.tags.length ? (
                <div className="vocab-tags">
                  {activePronunciation.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="vocab-result-actions">
              <button type="button" className="button button-primary" onClick={markLearned} disabled={!activeWord || isLearned}>
                {isLearned ? "Learned" : "Mark learned"}
              </button>
              <button type="button" className="button button-ghost" onClick={saveProblemWord} disabled={!activeWord || Boolean(problemEntry)}>
                {problemEntry ? "In problem words" : "Save problem word"}
              </button>
            </div>
          </div>

          {activeFamily ? (
            <div className="vocab-panel">
              <div className="vocab-playback-header">
                <div>
                  <span className="mini-note">Word family</span>
                  <h2>{activeFamily.label}</h2>
                </div>
                <span className="status-pill ready">{activeFamily.meaning}</span>
              </div>
              <div className="family-word-list">
                {activeFamily.words.map((word) => (
                  <button key={word} type="button" onClick={() => setWordInput(word)} className={normalizeWord(word) === normalizedActiveWord ? "active" : ""}>
                    {word}
                  </button>
                ))}
              </div>
              <div className="family-notes">
                {activeFamily.usageNotes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="vocab-panel">
            <div className="vocab-toolbar">
              <div className="segmented-control" aria-label="Voice region">
                {(["US", "UK"] as const).map((region) => (
                  <button key={region} type="button" className={voiceRegion === region ? "active" : ""} onClick={() => setVoiceRegion(region)}>
                    {region}
                  </button>
                ))}
              </div>
              <span className="mini-note">{voiceName}</span>
            </div>
            <div className="vocab-actions">
              <button type="button" className="button button-primary" onClick={() => speak("normal")} disabled={!activeWord}>
                Normal
              </button>
              <button type="button" className="button button-ghost" onClick={() => speak("slow")} disabled={!activeWord}>
                Slow
              </button>
              <button type="button" className="button button-ghost" onClick={() => speakSentence("normal")} disabled={!activeWord}>
                Use in sentence
              </button>
              <button type="button" className={isRecording ? "button vocab-recording" : "button button-ghost"} onClick={isRecording ? stopRecording : () => startRecording("word")} disabled={!activeWord}>
                {isRecording ? "Stop" : "Record word"}
              </button>
              <button type="button" className={isRecording ? "button vocab-recording" : "button button-ghost"} onClick={isRecording ? stopRecording : () => startRecording("sentence")} disabled={!activeWord}>
                {isRecording ? "Stop" : "Practice sentence"}
              </button>
            </div>
          </div>

          <div className="vocab-panel">
            <div className="vocab-playback-header">
              <div>
                <span className="mini-note">Local recording</span>
                <strong>{recordingSeconds ? `${recordingSeconds.toFixed(1)}s captured` : "No recording yet"}</strong>
              </div>
              <span className="status-pill ready">{status}</span>
            </div>
            {recordingUrl ? <audio controls src={recordingUrl} /> : <div className="vocab-empty">Record once to enable playback and on-device comparison.</div>}
            {comparison ? (
              <div className="vocab-comparison">
                <div>
                  <span>Model match</span>
                  <strong>{comparison.score}%</strong>
                </div>
                <div>
                  <span>{comparison.label}</span>
                  <p>{comparison.detail}</p>
                  <small>{comparison.audibility}. Practice check only: timing and audibility, not official pronunciation scoring.</small>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="vocab-side">
          <div className="vocab-panel">
            <h2>Daily goals</h2>
            <div className="goal-list">
              {goalCards.map((goal) => (
                <div key={goal.key} className="goal-row">
                  <div>
                    <strong>{goal.label}</strong>
                    <span>
                      {Math.min(goal.value, goal.target)} / {goal.target}
                    </span>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${Math.min(100, (goal.value / goal.target) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vocab-panel">
            <h2>Sound drills</h2>
            <details className="vocab-compact-section">
              <summary>Open sound drills</summary>
              <div className="sound-drill-list">
                {soundDrills.map((drill) => (
                  <div key={drill.id} className="sound-drill-card">
                    <div>
                      <strong>{drill.label}</strong>
                      <span>{drill.focus}</span>
                      <p>{drill.tip}</p>
                    </div>
                    <div className="sound-word-list">
                      {drill.words.map((word) => (
                        <button key={`${drill.id}-${word}`} type="button" onClick={() => setWordInput(word)} className={normalizeWord(word) === normalizedActiveWord ? "active" : ""}>
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="vocab-panel">
            <h2>Synonym families</h2>
            <details className="vocab-compact-section">
              <summary>Open synonym list</summary>
              <div className="family-list">
                {wordFamilies.map((family) => (
                  <button key={family.id} type="button" onClick={() => setWordInput(family.words[0])}>
                    <strong>{family.label}</strong>
                    <span>{family.words.join(" -> ")}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="vocab-panel">
            <h2>My problem words</h2>
            <details className="vocab-compact-section" open={problemWords.length > 0}>
              <summary>{problemWords.length ? `${problemWords.length} saved problem words` : "Open problem words"}</summary>
              <div className="problem-word-list">
                {problemWords.length ? (
                  problemWords.map((entry) => (
                    <div key={`${entry.word}-${entry.createdAt}`} className="problem-word-card">
                      <button type="button" onClick={() => setWordInput(entry.word)}>
                        <strong>{entry.word}</strong>
                        <span>{entry.pronunciationTip}</span>
                      </button>
                      <div>
                        <select value={entry.status} onChange={(event) => setProblemStatus(entry.word, event.currentTarget.value as ProblemWord["status"])}>
                          <option value="needs-practice">Needs practice</option>
                          <option value="improving">Improving</option>
                          <option value="learned">Learned</option>
                        </select>
                        <button type="button" onClick={() => removeProblemWord(entry.word)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mini-note">Save difficult words here when spelling tricks you.</p>
                )}
              </div>
            </details>
          </div>

          <div className="vocab-panel">
            <h2>Custom words</h2>
            <details className="vocab-compact-section">
              <summary>{customWords.length ? `${customWords.length} custom words` : "Open custom words"}</summary>
              <div className="custom-list">
                {customWords.length ? (
                  customWords.map((entry) => (
                    <button key={`${entry.w}-${entry.addedAt}`} type="button" onClick={() => setWordInput(entry.w)}>
                      {entry.w}
                    </button>
                  ))
                ) : (
                  <p className="mini-note">No custom words saved yet.</p>
                )}
              </div>
            </details>
          </div>

          <div className="vocab-panel">
            <h2>Preloaded list</h2>
            <details className="vocab-compact-section">
              <summary>{allPreloadedWords.length} practice words</summary>
              <div className="preloaded-list">
                {allPreloadedWords.map((entry) => (
                  <button key={entry.w} type="button" onClick={() => setWordInput(entry.w)}>
                    <span>{entry.w}</span>
                    <small>{entry.ipa}</small>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </aside>
      </section>

      <style>{`
        .vocab-page {
          display: grid;
          gap: 18px;
          margin: 16px 0 32px;
        }

        .vocab-header {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 16px;
          padding: 16px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 12px;
          background: rgba(7, 12, 22, 0.82);
          box-shadow: var(--shadow);
        }

        .vocab-header h1 {
          margin: 12px 0 8px;
          font-family: "Segoe UI", Inter, system-ui, sans-serif;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1;
          letter-spacing: 0;
        }

        .vocab-header p,
        .vocab-result p {
          max-width: 760px;
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .vocab-streak {
          display: grid;
          align-content: center;
          justify-items: center;
          min-width: 170px;
          padding: 16px;
          border: 1px solid rgba(124, 224, 255, 0.22);
          border-radius: 10px;
          background: rgba(124, 224, 255, 0.08);
        }

        .vocab-streak strong {
          font-size: 3rem;
          line-height: 1;
        }

        .vocab-streak span,
        .vocab-streak small,
        .vocab-pronunciation-grid span,
        .goal-row span,
        .vocab-comparison span,
        .vocab-comparison small {
          color: var(--muted);
        }

        .vocab-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 0.38fr);
          gap: 14px;
          align-items: start;
        }

        .vocab-main,
        .vocab-side,
        .goal-list,
        .custom-list,
        .preloaded-list,
        .sound-drill-list,
        .family-list,
        .problem-word-list {
          display: grid;
          gap: 12px;
        }

        .vocab-panel,
        .vocab-result {
          min-width: 0;
          padding: 14px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.58);
        }

        .vocab-result {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .vocab-result-actions {
          display: grid;
          gap: 8px;
          min-width: 180px;
        }

        .vocab-result h2,
        .vocab-panel h2 {
          margin: 0 0 10px;
          font-family: "Segoe UI", Inter, system-ui, sans-serif;
          letter-spacing: 0;
        }

        .vocab-result h2 {
          margin-top: 6px;
          font-size: clamp(2rem, 4vw, 4rem);
          line-height: 1;
          overflow-wrap: anywhere;
        }

        .vocab-word-row,
        .vocab-toolbar,
        .vocab-actions,
        .vocab-playback-header {
          display: flex;
          align-items: end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vocab-word-row label {
          display: grid;
          gap: 6px;
          flex: 1 1 260px;
          color: var(--muted);
        }

        .vocab-word-row input {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 9px;
          color: var(--text);
          background: rgba(0, 0, 0, 0.24);
          outline: none;
        }

        .vocab-word-row input:focus {
          border-color: rgba(124, 224, 255, 0.46);
          box-shadow: 0 0 0 3px rgba(124, 224, 255, 0.1);
        }

        .vocab-suggestions,
        .vocab-actions,
        .custom-list,
        .family-word-list,
        .family-notes,
        .vocab-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .vocab-suggestions button,
        .custom-list button,
        .preloaded-list button,
        .sound-word-list button,
        .family-word-list button,
        .family-list button,
        .problem-word-card button {
          border: 1px solid rgba(148, 163, 184, 0.13);
          border-radius: 8px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.035);
          cursor: pointer;
        }

        .vocab-suggestions button,
        .custom-list button,
        .sound-word-list button,
        .family-word-list button {
          padding: 8px 10px;
        }

        .vocab-suggestions button.active,
        .sound-word-list button.active,
        .family-word-list button.active {
          color: #03111d;
          border-color: var(--accent);
          background: var(--accent);
        }

        .vocab-pronunciation-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 12px 0;
        }

        .vocab-pronunciation-grid div,
        .vocab-comparison,
        .goal-row {
          padding: 12px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.16);
        }

        .vocab-pronunciation-grid strong {
          display: block;
          margin-top: 5px;
          font-size: 1.15rem;
          overflow-wrap: anywhere;
        }

        .sentence-practice {
          display: grid;
          gap: 5px;
          margin-top: 12px;
          padding: 12px;
          border: 1px solid rgba(124, 224, 255, 0.16);
          border-radius: 8px;
          background: rgba(124, 224, 255, 0.07);
        }

        .sentence-practice span,
        .family-list span,
        .problem-word-card span,
        .family-notes span,
        .vocab-tags span {
          color: var(--muted);
        }

        .sentence-practice strong {
          line-height: 1.5;
        }

        .vocab-tags,
        .family-word-list,
        .family-notes {
          margin-top: 10px;
        }

        .vocab-tags span,
        .family-notes span {
          padding: 7px 9px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          font-size: 0.86rem;
        }

        .vocab-recording {
          color: #04101c;
          background: var(--danger);
        }

        .vocab-panel audio {
          width: 100%;
          margin-top: 10px;
        }

        .vocab-compact-section summary {
          cursor: pointer;
          padding: 10px 12px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          border-radius: 8px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.035);
          font-weight: 700;
        }

        .vocab-compact-section[open] summary {
          margin-bottom: 10px;
          border-color: rgba(124, 224, 255, 0.24);
        }

        .vocab-empty {
          margin-top: 10px;
          padding: 14px;
          border: 1px dashed rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: var(--muted);
        }

        .vocab-comparison {
          display: grid;
          grid-template-columns: 120px minmax(0, 1fr);
          gap: 12px;
          margin-top: 12px;
        }

        .vocab-comparison strong {
          display: block;
          margin-top: 4px;
          font-size: 2rem;
        }

        .vocab-comparison p {
          margin: 5px 0;
          color: var(--text);
          line-height: 1.5;
        }

        .goal-row {
          display: grid;
          gap: 10px;
        }

        .goal-row > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .preloaded-list {
          max-height: 520px;
          overflow: auto;
        }

        .preloaded-list button {
          display: grid;
          gap: 4px;
          width: 100%;
          padding: 10px;
          text-align: left;
        }

        .preloaded-list small {
          color: var(--muted);
          overflow-wrap: anywhere;
        }

        .sound-drill-card {
          display: grid;
          gap: 10px;
          padding: 12px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.16);
        }

        .sound-drill-card strong {
          display: block;
          margin-bottom: 3px;
          font-size: 1.1rem;
        }

        .sound-drill-card span,
        .sound-drill-card p {
          color: var(--muted);
        }

        .sound-drill-card p {
          margin: 6px 0 0;
          line-height: 1.45;
        }

        .sound-word-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .family-list button,
        .problem-word-card > button {
          display: grid;
          gap: 5px;
          width: 100%;
          padding: 10px;
          text-align: left;
        }

        .problem-word-card {
          display: grid;
          gap: 8px;
          padding: 10px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.16);
        }

        .problem-word-card > div {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
        }

        .problem-word-card select {
          min-width: 0;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 8px;
          color: var(--text);
          background: rgba(0, 0, 0, 0.24);
          padding: 8px;
        }

        .problem-word-card > div button {
          padding: 8px 10px;
        }

        @media (max-width: 980px) {
          .vocab-header,
          .vocab-layout,
          .vocab-result,
          .vocab-comparison,
          .vocab-pronunciation-grid {
            grid-template-columns: 1fr;
          }

          .vocab-header,
          .vocab-result {
            flex-direction: column;
          }

          .vocab-result-actions {
            width: 100%;
          }

          .vocab-streak {
            justify-items: start;
          }
        }
      `}</style>
    </main>
  );
}
