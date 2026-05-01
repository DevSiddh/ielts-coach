"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptArtifact } from "./types";

type Options = {
  onTranscript?: (value: string) => void;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as Window & typeof globalThis & { webkitSpeechRecognition?: any; SpeechRecognition?: any })
    .SpeechRecognition ??
    (window as Window & typeof globalThis & { webkitSpeechRecognition?: any; SpeechRecognition?: any })
      .webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

function preferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
}

export function useSpeakingRecorder({ onTranscript }: Options = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef(false);
  const chunksRef = useRef<BlobPart[]>([]);
  const finalizedTranscriptRef = useRef("");

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [transcriptArtifact, setTranscriptArtifact] = useState<TranscriptArtifact | null>(null);
  const [browserTranscriptArtifact, setBrowserTranscriptArtifact] = useState<TranscriptArtifact | null>(null);
  const [serviceTranscriptArtifact, setServiceTranscriptArtifact] = useState<TranscriptArtifact | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [browserTranscriptSupported, setBrowserTranscriptSupported] = useState(false);

  useEffect(() => {
    setBrowserTranscriptSupported(Boolean(createSpeechRecognition()));
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    if (isRecording) return;
    recordingRef.current = true;
    setStatus("requesting microphone");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      recordingRef.current = false;
      setIsRecording(false);
      setStatus("microphone unavailable");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    finalizedTranscriptRef.current = "";
    setAudioBlob(null);
    setTranscribedText("");
    setDurationSeconds(0);

    const mimeType = preferredAudioMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const startedAt = Date.now();

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      setAudioBlob(blob);
      setDurationSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      stream.getTracks().forEach((track) => track.stop());
      void transcribeBlob(blob);
    };

    recorder.start();
    setIsRecording(true);
    setStatus("listening");

    const recognition = createSpeechRecognition();
    recognitionRef.current = recognition;
    if (recognition) {
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let finalizedTranscript = finalizedTranscriptRef.current;
        let interimTranscript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const segment = event.results[index][0]?.transcript ?? "";
          if (event.results[index].isFinal) {
            finalizedTranscript += `${segment} `;
          } else {
            interimTranscript += segment;
          }
        }
        finalizedTranscriptRef.current = finalizedTranscript;
        const transcript = `${finalizedTranscript} ${interimTranscript}`.trim();
        const artifact: TranscriptArtifact = {
          text: transcript,
          source: "browser-speech",
          capturedAt: new Date().toISOString()
        };
        setTranscribedText(transcript);
        setTranscriptArtifact(artifact);
        setBrowserTranscriptArtifact(artifact);
        onTranscript?.(transcript);
      };
      recognition.onerror = () => {
        setStatus("microphone active");
      };
      recognition.onend = () => {
        if (recordingRef.current) {
          try {
            recognition.start();
          } catch {
            // ignore restart failure
          }
        }
      };
      try {
        recognition.start();
      } catch {
        setStatus("microphone active");
      }
    }
  }

  function stop() {
    if (!isRecording) return;
    recordingRef.current = false;
    setStatus("stopping");
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setStatus("ready");
  }

  async function transcribeBlob(blob: Blob) {
    setStatus("transcribing audio");
    const form = new FormData();
    form.append("file", blob, "speaking.webm");
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: form
      });
      const payload = (await response.json()) as {
        text?: string;
        error?: string;
        source?: TranscriptArtifact["source"];
        capturedAt?: string;
        segments?: unknown[];
        words?: unknown[];
        speechActivity?: unknown[];
        disfluencies?: unknown[];
        warning?: string;
      };
      if (!response.ok) {
        setStatus(payload.error || "transcription unavailable");
        return;
      }
      const text = payload.text || "";
      const artifact: TranscriptArtifact = {
        text,
        source: payload.source ?? "deepgram",
        capturedAt: payload.capturedAt ?? new Date().toISOString(),
        segments: payload.segments ?? [],
        words: payload.words ?? [],
        speechActivity: payload.speechActivity ?? [],
        disfluencies: payload.disfluencies ?? []
      };
      setTranscriptArtifact(artifact);
      setServiceTranscriptArtifact(artifact);
      if (text.trim()) {
        setTranscribedText(text);
        onTranscript?.(text);
      }
      setStatus(text.trim() ? "transcribed" : payload.warning || "recording saved");
    } catch {
      setStatus("transcription unavailable");
    }
  }

  async function transcribeAudio() {
    if (!audioBlob) return;
    await transcribeBlob(audioBlob);
  }

  function reset() {
    setIsRecording(false);
    setStatus("idle");
    setAudioBlob(null);
    setTranscribedText("");
    setTranscriptArtifact(null);
    setBrowserTranscriptArtifact(null);
    setServiceTranscriptArtifact(null);
    setDurationSeconds(0);
    finalizedTranscriptRef.current = "";
    onTranscript?.("");
  }

  return {
    start,
    stop,
    reset,
    transcribeAudio,
    isRecording,
    status,
    audioBlob,
    transcribedText,
    transcriptArtifact,
    browserTranscriptArtifact,
    serviceTranscriptArtifact,
    durationSeconds,
    browserTranscriptSupported
  };
}
