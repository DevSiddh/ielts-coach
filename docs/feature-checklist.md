# Feature Checklist

## Speaking

- Mobile-first one-tap record UI: yes
- Automatic transcription after stop: yes
- Manual transcript retry fallback: yes
- Feedback and retry loop: yes
- Desktop sticky feedback panel: yes
- Mobile sticky action dock: yes
- Uses Deepgram via `/api/transcribe`: yes
- Does not require stored audio in Supabase mode: yes

## Evaluation

- Separate `/evaluation` page: yes
- Desktop examiner-workbench layout: yes
- Mobile one-column responsive layout: yes
- Shows priority diagnosis: yes
- Shows fixes, keywords, retry plan, evidence summary: yes
- Works when transcript text is not archived: yes
- Retry prompt link back to speaking: yes

## History

- Separate `/history` page: yes
- Desktop analytics/detail layout: yes
- Mobile one-column review layout: yes
- Tracks average band, trend, strongest/weakest skill: yes
- Tracks recurring blockers and fixes: yes
- Supports retrying a selected prompt: yes
- Supabase summary-history compatible: yes

## Conversation

- Separate `/conversation` page: yes
- No band scoring: yes
- Examiner-style prompt flow: yes
- Required retry before follow-up: yes
- Voice readout support: yes
- Mobile sticky composer: yes
- Desktop session/thread/feedback layout: yes

## Vocabulary

- Separate `/vocabulary` page: yes
- Word search/input: yes
- US/UK browser voice playback: yes
- Slow/normal pronunciation model: yes
- Recording for timing/audibility comparison: yes
- Mobile MIME fallback for recording: yes
- Daily goals: yes
- Local-only custom/learned words: yes

## Strategies

- Separate `/strategies` page: yes
- Speaking strategy mode: yes
- Writing strategy mode: yes
- Learning-first, not scoring-first: yes
- Mobile horizontal surface switch: yes
- Desktop strategy menu plus detail: yes
- Practice links into speaking/writing: yes

## Writing

- Separate `/writing` page: yes
- Prompt bank: yes
- Planning box: yes
- Essay editor: yes
- Coaching timer: yes
- Deterministic evaluation: yes
- Retry target: yes
- Mobile sticky evaluate/retry actions: yes
- Desktop prompt/editor/result layout: yes

## Deployment

- Vercel-compatible build: yes
- PWA manifest: yes
- Installable icon: yes
- `.env.example`: yes
- Beginner deployment guide: yes
- Supabase SQL setup file: yes
- Optional Groq fallback env: yes
