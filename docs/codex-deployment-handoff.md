# Codex Deployment Handoff

Use this file inside Codex when deploying this IELTS Coach project with Vercel and Supabase plugins.

## Project Context

This is a single-user personal IELTS training app built with:

- Next.js 15
- React 19
- Tailwind v4 through `@tailwindcss/postcss`
- No heavy UI libraries
- Local fallback storage for development
- Optional Supabase storage for deployed cross-device history
- Deepgram for transcription

The product surfaces are:

- `/speaking` scoring-first speaking practice
- `/evaluation` detailed score evidence and retry plan
- `/history` progress and repeated flaw tracking
- `/conversation` examiner-style retry trainer with no band score
- `/vocabulary` pronunciation and daily vocabulary practice
- `/strategies` learning-first strategy hub
- `/writing` Academic Task 2 practice

## What Was Recently Built

### Mobile/Desktop UI

All major sections have mobile and desktop-compatible layouts:

- `/speaking` has mobile-first one-tap recording, automatic transcript, feedback, retry, and sticky mobile actions.
- `/evaluation` has desktop examiner-workbench layout and mobile one-column layout.
- `/history` works as progress tracking and flaw review on mobile and desktop.
- `/conversation` has desktop three-area workflow and mobile sticky composer.
- `/vocabulary` has responsive word/pronunciation practice.
- `/strategies` has responsive learning hub layout.
- `/writing` has desktop prompt/editor/result layout and mobile-friendly writing actions.

### Storage Direction

The user does not need audio recordings or transcript archives.

In deployed mode, Supabase should store only summary history:

- prompt metadata
- band estimate
- criterion scores
- main issue
- retry target
- word count
- duration
- filler count
- evaluation JSON
- evidence summary JSON

Do not add audio storage unless explicitly requested later.

### Transcription Direction

The app records audio in the browser, sends it to `/api/transcribe`, Deepgram transcribes it, then the app evaluates the answer.

Audio should be discarded after scoring in deployed Supabase mode.

## Important Files

Deployment docs:

- `docs/deployment.md`
- `docs/supabase-setup.sql`
- `docs/feature-checklist.md`
- `docs/codex-deployment-handoff.md`

Supabase storage implementation:

- `features/speaking/supabase-attempts.ts`
- `app/api/attempts/route.ts`
- `app/api/attempts/[id]/route.ts`

Transcription:

- `app/api/transcribe/route.ts`
- `features/speaking/transcription-service.ts`
- `features/speaking/use-recorder.ts`

Main UI pages:

- `app/speaking/page.tsx`
- `app/evaluation/page.tsx`
- `app/history/page.tsx`
- `app/conversation/page.tsx`
- `app/vocabulary/page.tsx`
- `app/strategies/page.tsx`
- `app/writing/page.tsx`

PWA:

- `app/manifest.ts`
- `app/icon.svg`

Environment template:

- `.env.example`

## Supabase Setup

Use the Supabase plugin to create or connect a Supabase project.

Run this SQL from `docs/supabase-setup.sql`:

```sql
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
```

Required Supabase values for Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ATTEMPTS_TABLE=ielts_attempts`

Use the service role key only on the server/Vercel environment. Never expose it in client-side code.

## Vercel Setup

Use the Vercel plugin to deploy this repo as a Next.js app.

Build settings:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output: default Next.js/Vercel output

Required environment variable:

```text
DEEPGRAM_API_KEY=your_deepgram_key
```

Recommended environment variables:

```text
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ATTEMPTS_TABLE=ielts_attempts
```

Optional fallback transcription:

```text
GROQ_API_KEY=your_groq_key
```

Do not set `IELTS_COACH_ATTEMPTS_DIR` on Vercel. That is only for local/self-hosted file storage.

## Local Verification Commands

Before deployment, run:

```bash
npm run typecheck
npm run test
npm run build
```

Expected current result:

- Typecheck passes
- 66 tests pass
- Production build passes

## Deployment Acceptance Checks

After Vercel deploys, test these manually:

1. Open `/speaking`.
2. Tap `Record`.
3. Allow microphone permission.
4. Speak a short answer.
5. Tap `Stop`.
6. Confirm transcript appears automatically.
7. Get feedback.
8. Open `/history` and confirm the attempt summary appears.
9. Open `/evaluation` and confirm the detailed evidence page works.
10. Open on mobile and install to home screen.

## Codex Plugin Task Prompt

Paste this into Codex if using plugins:

```text
Deploy this Next.js IELTS Coach app using Vercel and Supabase plugins.

Read docs/codex-deployment-handoff.md, docs/deployment.md, and docs/supabase-setup.sql first.

Use Supabase only for summary evaluation history. Do not add audio storage. Do not store full transcript archives unless explicitly requested.

Create or connect a Supabase project, run docs/supabase-setup.sql, then configure Vercel env vars:
DEEPGRAM_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ATTEMPTS_TABLE=ielts_attempts.

Deploy to Vercel as a Next.js app. After deploy, verify /speaking, /history, and /evaluation.
```

## Important Product Boundaries

- `/speaking` is scoring-first.
- `/evaluation` is detailed scoring evidence.
- `/history` tracks progress and repeated flaws.
- `/conversation` is examiner-style practice but not band scoring.
- `/strategies` is learning-first.
- `/vocabulary` is pronunciation/vocab practice.
- `/writing` is deterministic writing practice.

Do not merge conversation-agent responsibilities into speaking scoring.

## Current Caveats

- Deepgram is required for reliable deployed mobile transcription.
- Browser speech recognition is only a live convenience and may not work on iPhone.
- Supabase stores summary history only, so transcript panels may show summary-history messages instead of full raw text.
- This is a single-user project; no auth is currently implemented.
