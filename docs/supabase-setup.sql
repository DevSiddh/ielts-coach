create table if not exists public.ielts_attempts (
  id uuid primary key,
  created_at timestamptz not null default now(),
  prompt_id text not null,
  prompt_title text not null,
  prompt_part integer not null,
  prompt jsonb not null,
  overall_band numeric not null,
  fluency numeric not null,
  grammar numeric not null,
  vocabulary numeric not null,
  pronunciation numeric not null,
  main_issue text not null,
  retry_target text not null,
  word_count integer not null,
  duration_seconds integer not null,
  filler_count integer not null,
  transcript_source text not null,
  evaluation jsonb not null,
  evidence_signals jsonb
);

create index if not exists ielts_attempts_created_at_idx
  on public.ielts_attempts (created_at desc);

create index if not exists ielts_attempts_prompt_id_idx
  on public.ielts_attempts (prompt_id);
