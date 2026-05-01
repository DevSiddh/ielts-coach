import { transcribeWithWhisperTimestamped } from "./local-transcribe.ts";

export function collectDeepgramDisfluencies(
  words: Array<{ word?: string; punctuated_word?: string; start?: number; end?: number; confidence?: number }>
) {
  return words.filter((word) => {
    const text = (word.punctuated_word ?? word.word ?? "").toLowerCase();
    return /\b(uh|um|uh-huh|mhmm|mm-hmm|hmm|ah|er|err)\b/.test(text);
  });
}

export async function transcribeWithDeepgram(file: File) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is not set.");
  }

  const query = new URLSearchParams({
    model: process.env.DEEPGRAM_MODEL ?? "nova-2",
    language: "en",
    filler_words: "true",
    utterances: "true",
    punctuate: "false",
    smart_format: "false"
  });

  const response = await fetch(`https://api.deepgram.com/v1/listen?${query.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": file.type || "audio/webm"
    },
    body: Buffer.from(await file.arrayBuffer())
  });

  const data = (await response.json()) as {
    err_code?: string;
    err_msg?: string;
    metadata?: unknown;
    results?: {
      utterances?: unknown[];
      channels?: Array<{
        alternatives?: Array<{
          transcript?: string;
          words?: Array<{
            word?: string;
            punctuated_word?: string;
            start?: number;
            end?: number;
            confidence?: number;
          }>;
        }>;
      }>;
    };
  };

  if (!response.ok) {
    throw new Error(data.err_msg || "Deepgram transcription failed.");
  }

  const alternative = data.results?.channels?.[0]?.alternatives?.[0];
  const words = alternative?.words ?? [];
  const text = alternative?.transcript ?? "";

  return {
    text,
    source: "deepgram" as const,
    capturedAt: new Date().toISOString(),
    segments: data.results?.utterances ?? [],
    words,
    disfluencies: collectDeepgramDisfluencies(words),
    raw: data
  };
}

async function transcribeWithGroq(file: File) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const payload = new FormData();
  payload.append("file", file, file.name || "speaking.webm");
  payload.append("model", "whisper-large-v3-turbo");
  payload.append("language", "en");
  payload.append("response_format", "verbose_json");
  payload.append(
    "prompt",
    "This is an IELTS speaking practice answer. Preserve spoken disfluencies and hesitation words when audible, including um, uh, er, err, ah, hmm, repeated words, false starts, and stretched hesitation sounds."
  );
  payload.append("timestamp_granularities[]", "word");
  payload.append("timestamp_granularities[]", "segment");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: payload
  });

  const data = (await response.json()) as {
    text?: string;
    error?: { message?: string };
    words?: unknown[];
    segments?: unknown[];
  };
  if (!response.ok) {
    throw new Error(data.error?.message || "Groq transcription failed.");
  }

  return {
    text: data.text ?? "",
    source: "groq-whisper" as const,
    capturedAt: new Date().toISOString(),
    segments: data.segments ?? [],
    words: data.words ?? []
  };
}

export async function transcribeUploadedAudio(file: File, engine = "deepgram") {
  if (engine !== "local" && engine !== "groq") {
    try {
      const deepgram = await transcribeWithDeepgram(file);
      return {
        status: 200,
        body: {
          ...deepgram,
          engine: "deepgram",
          setupNote: "Primary raw transcript engine with filler-word support and word timestamps."
        }
      };
    } catch (error) {
      if (engine === "deepgram") {
        if (!process.env.IELTS_COACH_PYTHON && !process.env.GROQ_API_KEY) {
          return {
            status: 501,
            body: {
              error: error instanceof Error ? error.message : "Deepgram transcription failed.",
              fallbackAvailable: false
            }
          };
        }
      }
    }
  }

  if (engine !== "groq") {
    try {
      const local = await transcribeWithWhisperTimestamped(file);
      return {
        status: 200,
        body: {
          ...local.artifact,
          engine: "whisper-timestamped",
          raw: local.raw,
          warning: "Deepgram was unavailable, so local whisper-timestamped was used as a fallback raw transcript source."
        }
      };
    } catch (error) {
      if (!process.env.GROQ_API_KEY) {
        return {
          status: 501,
          body: {
            error: error instanceof Error ? error.message : "Transcription unavailable.",
            fallbackAvailable: false
          }
        };
      }
    }
  }

  try {
    const groq = await transcribeWithGroq(file);
    return {
      status: 200,
      body: {
        ...groq,
        engine: "groq-fallback",
        warning: "Fallback transcription may normalize fillers and should not be treated as the strongest raw source."
      }
    };
  } catch (error) {
    return {
      status: 501,
      body: { error: error instanceof Error ? error.message : "Transcription unavailable." }
    };
  }
}
