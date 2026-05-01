# Beginner Deployment Guide

This project is designed for one user: you. The recommended setup is a Vercel web app plus Supabase for small progress history.

## What Gets Stored

Stored in Supabase:

- prompt title and part
- band estimate
- fluency, grammar, vocabulary, pronunciation scores
- main issue
- retry target
- word count
- duration
- filler count
- evaluation JSON
- evidence summary counts

Not stored:

- audio recordings
- long transcript archive
- user accounts
- payment data

Audio is uploaded only to transcribe the attempt. After scoring, the deployed history keeps summaries for improvement tracking.

## Accounts You Need

- GitHub account
- Vercel account
- Supabase account
- Deepgram account

## Step 1: Create Supabase Project

1. Go to `https://supabase.com`.
2. Sign in.
3. Click `New project`.
4. Choose any organization.
5. Project name: `ielts-coach`.
6. Set a database password and save it somewhere safe.
7. Choose the closest region.
8. Click `Create new project`.
9. Wait until the project finishes provisioning.

## Step 2: Create The History Table

1. Open your Supabase project.
2. Go to `SQL Editor`.
3. Click `New query`.
4. Open this repo file: `docs/supabase-setup.sql`.
5. Copy all SQL from that file.
6. Paste it into Supabase SQL Editor.
7. Click `Run`.

Expected result: a table named `ielts_attempts` exists.

## Step 3: Get Supabase Keys

1. In Supabase, open `Project Settings`.
2. Open `API`.
3. Copy `Project URL`.
4. Copy `service_role` key.

Important: only put the service role key in Vercel environment variables. Do not expose it in browser code.

## Step 4: Get Deepgram Key

1. Go to `https://deepgram.com`.
2. Create or open your account.
3. Create an API key.
4. Copy it.

Deepgram is used for mobile/desktop transcription.

## Step 5: Push Project To GitHub

If this folder is not already in GitHub:

1. Create a new private GitHub repo.
2. Push this project to that repo.

Do not commit `.env.local` or secrets.

## Step 6: Create Vercel Project

1. Go to `https://vercel.com`.
2. Click `Add New`.
3. Choose `Project`.
4. Import your GitHub repo.
5. Framework should auto-detect `Next.js`.
6. Build command should be `npm run build`.
7. Leave output settings default.

## Step 7: Add Vercel Environment Variables

In Vercel project settings, add these under `Environment Variables`:

```text
DEEPGRAM_API_KEY=your_deepgram_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ATTEMPTS_TABLE=ielts_attempts
```

Optional fallback:

```text
GROQ_API_KEY=your_groq_key
```

Do not add `IELTS_COACH_ATTEMPTS_DIR` on Vercel. Supabase is the deployed history store.

## Step 8: Deploy

1. Click `Deploy` in Vercel.
2. Wait for build to finish.
3. Open the Vercel URL.
4. Go to `/speaking`.
5. Record one answer.
6. Stop recording.
7. Confirm transcript appears.
8. Click feedback if needed.
9. Open `/history` and `/evaluation` to confirm the attempt summary appears.

## Step 9: Install For Daily Use

Mobile:

1. Open the Vercel URL in Chrome or Safari.
2. Use browser menu.
3. Tap `Add to Home Screen`.
4. Open it like an app.

Desktop:

1. Open the Vercel URL in Chrome or Edge.
2. Browser menu.
3. `Save and share` or `Apps`.
4. Install this site as an app.

## Troubleshooting

If microphone does not work:

- confirm you are using `https://`, not `http://`
- allow microphone permission
- try Chrome on Android or Safari on iPhone

If transcript does not appear:

- confirm `DEEPGRAM_API_KEY` exists in Vercel
- redeploy after adding env vars
- check Vercel function logs for `/api/transcribe`

If history does not sync:

- confirm `SUPABASE_URL` is correct
- confirm `SUPABASE_SERVICE_ROLE_KEY` is set, not the anon key
- confirm `docs/supabase-setup.sql` was run
- confirm `SUPABASE_ATTEMPTS_TABLE=ielts_attempts`

If local development works but Vercel history does not:

- this usually means Supabase env vars are missing or the table was not created

## Final Architecture

- Vercel hosts the app.
- Deepgram transcribes recordings.
- Supabase stores small improvement history.
- Audio recordings are discarded.
- PWA manifest lets you install it on phone/desktop.
