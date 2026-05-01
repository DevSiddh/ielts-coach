import { NextResponse } from "next/server";
import { transcribeUploadedAudio } from "@/features/speaking/transcription-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const engine = String(form.get("engine") ?? "deepgram");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
  }

  const result = await transcribeUploadedAudio(file, engine);
  return NextResponse.json(result.body, { status: result.status });
}
