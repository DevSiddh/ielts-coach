import { NextResponse } from "next/server";
import { deleteAttemptFromFiles, loadAttemptFromFiles } from "@/features/speaking/attempt-files";
import {
  deleteAttemptFromSupabase,
  loadAttemptFromSupabase,
  supabaseAttemptsConfigured
} from "@/features/speaking/supabase-attempts";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (supabaseAttemptsConfigured()) {
    const attempt = await loadAttemptFromSupabase(id);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
    }
    return NextResponse.json({ attempt });
  }
  const attempt = await loadAttemptFromFiles(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  return NextResponse.json({ attempt });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  if (supabaseAttemptsConfigured()) {
    await deleteAttemptFromSupabase(id);
    return NextResponse.json({ ok: true });
  }
  await deleteAttemptFromFiles(id);
  return NextResponse.json({ ok: true });
}
