import test from "node:test";
import assert from "node:assert/strict";

import { transcribeWithDeepgram } from "../features/speaking/transcription-service.ts";

test("transcribeWithDeepgram posts the recorded audio bytes and returns raw transcript evidence", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.DEEPGRAM_API_KEY;
  const originalModel = process.env.DEEPGRAM_MODEL;
  const audioBytes = new Uint8Array([1, 2, 3, 4]);
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  process.env.DEEPGRAM_API_KEY = "test-deepgram-key";
  delete process.env.DEEPGRAM_MODEL;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedInit = init;
    return new Response(
      JSON.stringify({
        results: {
          utterances: [{ transcript: "um my hometown is peaceful", start: 0, end: 2.4 }],
          channels: [
            {
              alternatives: [
                {
                  transcript: "um my hometown is peaceful",
                  words: [
                    { word: "um", punctuated_word: "um", start: 0, end: 0.2, confidence: 0.93 },
                    { word: "my", punctuated_word: "my", start: 0.25, end: 0.35, confidence: 0.99 }
                  ]
                }
              ]
            }
          ]
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;

  try {
    const artifact = await transcribeWithDeepgram(new File([audioBytes], "speaking.webm", { type: "audio/webm" }));
    const url = new URL(capturedUrl);
    const headers = new Headers(capturedInit?.headers);

    assert.equal(url.origin, "https://api.deepgram.com");
    assert.equal(url.pathname, "/v1/listen");
    assert.equal(url.searchParams.get("model"), "nova-2");
    assert.equal(url.searchParams.get("filler_words"), "true");
    assert.equal(url.searchParams.get("utterances"), "true");
    assert.equal(capturedInit?.method, "POST");
    assert.equal(headers.get("Authorization"), "Token test-deepgram-key");
    assert.equal(headers.get("Content-Type"), "audio/webm");
    assert.deepEqual(capturedInit?.body, Buffer.from(audioBytes));
    assert.equal(artifact.text, "um my hometown is peaceful");
    assert.equal(artifact.source, "deepgram");
    assert.equal(artifact.words.length, 2);
    assert.equal(artifact.segments.length, 1);
    assert.deepEqual(artifact.disfluencies, [
      { word: "um", punctuated_word: "um", start: 0, end: 0.2, confidence: 0.93 }
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.DEEPGRAM_API_KEY;
    } else {
      process.env.DEEPGRAM_API_KEY = originalApiKey;
    }
    if (originalModel === undefined) {
      delete process.env.DEEPGRAM_MODEL;
    } else {
      process.env.DEEPGRAM_MODEL = originalModel;
    }
  }
});
