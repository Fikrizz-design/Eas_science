# E.A.S — Education Astronomy Science

A React + TypeScript astronomy education platform with Firebase Auth (email + OTP
verification), Firestore, Supabase (storage + data mirror), and Groq-powered AI
features (adaptive quiz, debate-room toxicity moderation), deployed on Vercel.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind
- **Auth & primary database:** Firebase Auth (email/password) + Firestore
- **Email OTP verification:** custom Vercel serverless functions + Firebase Admin SDK + SMTP (Nodemailer)
- **AI:** Groq (OpenAI-compatible) via `/api/quiz` and `/api/moderate-chat`
- **Files & data mirror + chat:** Supabase (Storage bucket `library`, Postgres tables)
- **Hosting:** Vercel (static frontend + `/api` serverless functions)

## 1. Firebase setup

1. In the [Firebase Console](https://console.firebase.google.com), open your project
   (`eas-science-edu`, or your own) → **Authentication → Sign-in method** → enable
   **Email/Password**.
2. **Firestore Database** → create a database if you haven't (production mode).
3. Deploy the security rules in `firestore.rules` (Console → Firestore → Rules → paste
   the file's contents → Publish). These rules require a verified email for almost all
   reads/writes and stop users from granting themselves funding/diamonds/exp/role.
4. **Project settings → Service accounts → Generate new private key**. Copy the
   downloaded JSON's full content — you'll paste it as `FIREBASE_SERVICE_ACCOUNT` in
   Vercel (step 4 below). This lets the serverless functions mark a user's email as
   verified after a correct OTP, since Firebase's client SDK can't do that itself.
5. Client config values (`VITE_FIREBASE_*`) go in `.env` locally / Vercel env vars —
   see `.env.example`. These are safe to expose in the browser.

5. **Bootstrap your first admin:** new registrations always start with `role: "member"`
   (enforced by the Firestore rules). After you register your own account, open
   Firestore Console → `users/{your-uid}` → manually change `role` to `owner` or
   `admin`. There is no demo/backdoor admin account anymore.

## 2. Supabase setup

1. Open your project at https://supabase.com/dashboard (URL: `pxnbpozsayfokjdvwplp`).
2. **SQL Editor → New query** → paste the entire contents of `supabase-schema.sql` →
   **Run**. This creates the `library` storage bucket plus `profiles`,
   `library_items`, `debates`, and `chat_messages` tables with RLS policies.
3. Copy your **Project URL** and **anon/publishable key** (Settings → API) into
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

Design note: Firestore stays the real-time source of truth the UI listens to
(`onSnapshot`). Every write to library items, forum posts/chat, debates, and new
profiles is also mirrored into Supabase Postgres (best-effort, non-blocking) so you
have a searchable/exportable backup outside Firestore, per your request. Uploaded
files (photos, journal PDFs, audio) are stored directly in Supabase Storage — the
old version only stored the filename as text and never actually uploaded the file;
that's now fixed.

## 3. Groq setup (AI quiz + debate moderation)

1. Get a free API key at https://console.groq.com.
2. Set **one** `GROQ_API_KEY` in Vercel env vars — it's shared by both AI features
   below (they both import the same `api/_groq.ts` helper, so you don't need two
   separate keys). Optionally override `GROQ_MODEL` (defaults to
   `llama-3.3-70b-versatile`).
3. `/api/quiz` generates adaptive astronomy quiz questions.
4. `/api/moderate-chat` screens new debate theses and replies for toxicity before
   they're posted (harassment/hate/threats are blocked; blunt scientific
   disagreement is allowed). It fails open (never blocks users) if Groq is down.

## 4. Email (OTP) setup — Resend API

The old "click a link in your email" verification is replaced with a 6-digit code
emailed to the user, entered directly in the app — sent via the **Resend API** (no
SMTP config needed, just one key):

1. Sign up free at https://resend.com and grab an API key (starts with `re_`).
2. For quick testing you can send from `onboarding@resend.dev` (Resend's shared
   sandbox address) — but it can only deliver to the email you signed up to Resend
   with. For real users, go to **Resend → Domains**, verify a domain you own (e.g.
   `synthcode-solution.my.id`), then set `EMAIL_FROM` to something like
   `"E.A.S Command Center" <noreply@synthcode-solution.my.id>`.
3. In Vercel env vars, set:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM="E.A.S Command Center <noreply@yourdomain.com>"
   ```
4. Free tier: 100 emails/day, 3,000/month — plenty for OTP verification.

Also set `FIREBASE_SERVICE_ACCOUNT` (the full service-account JSON from step 1.4) in
Vercel — this is what lets `/api/verify-otp` mark the user's email as verified.

## 5. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (framework auto-detected as Vite).
2. In **Project Settings → Environment Variables**, add everything from
   `.env.example`:
   - `VITE_FIREBASE_*`, `VITE_SUPABASE_*` → safe to expose, used by the client build
   - `FIREBASE_SERVICE_ACCOUNT`, `GROQ_API_KEY`, `GROQ_MODEL`, `SMTP_*` → server-only,
     used by the functions in `/api`
3. Deploy. Vercel automatically builds the Vite frontend and deploys everything in
   `/api` as serverless functions.

## Local development

```bash
npm install
cp .env.example .env       # fill in real values
npm run dev                # frontend only (Vite) — /api routes need `vercel dev`
```

To test the `/api` functions locally, install the Vercel CLI (`npm i -g vercel`) and
run `vercel dev` instead of `npm run dev` — it serves both the Vite frontend and the
serverless functions together, using the same env vars from `.env`/`vercel env pull`.

## What changed from the previous version

- **Removed the "Demo Access" bypass** everywhere (login screen, store, and every
  `isDemoMode` guard across Dashboard/Library/DebateRoom/Quiz/AdminPanel/Arcade/Forum)
  — all actions now go through real Firebase/Firestore writes.
- **Email verification is now OTP-based** (6-digit code, 10-minute expiry, resend
  with cooldown) instead of a magic link, using new `/api/send-otp` and
  `/api/verify-otp` functions.
- **Library uploads are now real** — files are uploaded to Supabase Storage and the
  resulting URLs are saved (previously only the filename was ever stored, so nothing
  was actually retrievable).
- **Debate Room has real AI moderation** via `/api/moderate-chat` (Groq) instead of a
  fake "AI Reviewing..." placeholder that just waited 3 seconds.
- **Quiz generation switched from Gemini to Groq** (`/api/quiz`), removing the old
  Express dev server (`server.ts`) in favor of Vercel serverless functions.
- **Firestore rules locked down** — the previous rules allowed anyone to read/write
  anything (`allow read, write: if true`). New rules require email verification and
  prevent users from self-granting role/funding/diamonds/exp.
- **Supabase added** for file storage and a data/chat mirror (see `supabase-schema.sql`).
