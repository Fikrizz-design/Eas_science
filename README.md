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

## What's new in this round

- **Dashboard redesign** — activated the "Mission HUD" signature system that was already
  defined in `index.css` but unused (clipped panel corners, cyan corner brackets,
  starfield drift, scanline hover sweep). Added a live WIB mission clock, animated
  count-up stat readouts, a shimmering gradient headline, and restyled the module grid.
- **File uploads instead of URL prompts** — avatar and custom frame now use a real file
  picker uploading to Supabase Storage, not a `prompt()` asking for a link.
- **Profession field** at registration with a 30-day change cooldown; admins/owners get
  a free-text custom title instead (shown in the onboarding Admin Structure list and
  AdminPanel).
- **Post-registration onboarding page** — after OTP verification, new users see
  community rules (admin-editable), the current admin structure, and their generation's
  group link before entering the app.
- **Owner-only promote/demote** — owner can turn a member into an admin (or back) from
  AdminPanel; Firestore rules now restrict role changes to the `owner` role specifically
  (regular admins can still moderate other fields, just not roles).
- **Daily quiz rebuilt** — 20 Indonesian-language questions, regenerated once per day
  (Asia/Jakarta) via Groq and cached in Firestore (`dailyQuiz/{date}`) so every user gets
  the same set and the API isn't hit per-user.
- **Phenomena Calendar** (`/phenomena`) — merges NASA data (Astronomy Picture of the Day
  + near-Earth asteroid approaches via `/api/nasa-phenomena`, cached daily) with entries
  admins add manually in AdminPanel.
- **Auto-generated SEO** — `/api/generate-seo` uses Groq to refresh the site's title,
  meta description, and keywords, written to Firestore `seo/config` and applied to
  `document.title`/meta tags on load. Runs automatically 4x/week via Vercel Cron
  (see `vercel.json`), or on demand from AdminPanel's "Regenerate Now" button.

### New env vars for this round
- `NASA_API_KEY` — optional, falls back to NASA's public `DEMO_KEY` (rate-limited but
  fine since results are cached once per day)
- `CRON_SECRET` — any random string; Vercel Cron sends it automatically to authorize
  `/api/generate-seo`

### Setup notes
- Re-paste `firestore.rules` into Firebase Console (added rules for `phenomena` and
  `seo`, and tightened `users` so only `owner` can change roles).
- Re-run `supabase-schema.sql` if you want the new `profession`/`profession_changed_at`
  columns on the `profiles` mirror table (optional — the app works without it, mirroring
  just silently skips those fields).
- Vercel Cron Jobs require at least the Hobby plan; check Vercel's current limits if the
  schedule in `vercel.json` doesn't trigger as expected.

## Public pages for SEO (new)

Previously, logged-out visitors (including Google's crawler) only ever saw the
registration/login screen — there was no real content for search engines to index,
which is the main reason the site wasn't showing up for searches like "Komunitas
Astronomi Indonesia" no matter how correct the sitemap/robots.txt setup was.

Now, without logging in, visitors can reach:
- **`/`** — a real landing page (`src/views/LandingPage.tsx`) explaining what E.A.S is,
  its features, and a live preview of upcoming phenomena — built specifically to have
  substantive, keyword-relevant content for Google to index.
- **`/phenomena`** — the Phenomena Calendar is now public read (Firestore rule changed
  from `isVerified()` to `true` for the `phenomena` collection) so it's real, frequently
  updated content search engines can crawl.
- **`/auth`** — registration/login, now a specific route instead of the only thing
  logged-out visitors could ever see.

Also added:
- `public/robots.txt` and `public/sitemap.xml` — these didn't exist before, so any
  sitemap URL submitted to Search Console was returning nothing.
- Real static `<title>`/meta description/Open Graph tags in `index.html` (previously
  empty/generic), plus the Groq-generated SEO content in `api/generate-seo.ts` is now
  explicitly prompted to include the phrase "Komunitas Astronomi Indonesia".

**Still true regardless of these fixes:** even with everything technically correct,
Google indexing new/changed pages typically takes days to a few weeks, and ranking for
a specific phrase depends on more than on-page SEO (domain age, backlinks, content
depth over time). These changes give the site something real to index — they don't
guarantee an immediate #1 ranking.

### Re-check in Search Console after deploying
- Resubmit `https://education-astronomy-science-portal.web.id/sitemap.xml` under
  Sitemaps
- Use "URL Inspection" on `/` and `/phenomena`, click "Request Indexing" on each

## VIP tier & Black Market (new)

Added a **VIP** status — separate from the admin/owner/developer role hierarchy, this is
a member-facing perk tier (like a cosmetic subscription) that unlocks:

- **Custom profile banner** — upload an image shown behind the profile header (Profile
  Settings → Custom Profile Banner). Gated so only VIP/Owner can actually make it render,
  even if someone tried to set the field directly — the display check itself requires
  `isVIP`, and `isVIP` can only be changed by staff or the paid-purchase endpoint (see
  below), never by the user directly, so this can't be self-granted via devtools.
- **Nameplate color** — pick an accent color for your name shown in Forum posts and
  Debate Room.
- **Black Market access** (`/exclusive`) — now a real hub linking to the perks above,
  plus 2x EXP on the Daily Quiz while VIP is active. (Previously this page had three
  buttons that didn't do anything — "Infinite Funding withdraw 1M" also directly
  undermined the point of the earned-currency system, so it's gone.)

**How to get VIP:**
- Members can buy it with 750,000 Diamonds via Profile Settings → VIP Membership. This
  goes through `/api/purchase-vip`, which validates the balance and deducts diamonds
  server-side in a Firestore transaction — not a direct client write, so it can't be
  spoofed.
- Staff (admin/owner/developer) can also grant or revoke VIP manually for any member
  from AdminPanel's Explorer Manifest ("Grant VIP" / "Revoke VIP" button) — useful for
  rewarding active members without requiring a purchase.

## Developer role & Developer Panel



There's now a role tier above `owner`: **`developer`**. It's meant for you (the person
who actually built and maintains the site) to monitor the whole app without needing
your friend (the community owner) to understand any of the technical side.

- **How to grant it:** exactly like bootstrapping the first `owner` — manually in
  Firestore Console, `users/{uid}` → set `role` to `developer`. There is no in-app way
  to grant this role (not even the owner's promote/demote buttons offer it) — that's
  intentional, so it stays a role only you control.
- **What it can do:** everything `owner` can do (Firestore rules treat `developer` as a
  superset of `owner`), plus its own page at **`/dev`** — a "Developer Panel" showing:
  - Content counts (users, library items, debates, posts, phenomena)
  - Role and generation breakdown of all users
  - Which server env vars are actually configured (green/red checklist) — so you can
    tell at a glance if `GROQ_API_KEY`, `RESEND_API_KEY`, etc. are missing without
    digging through Vercel's dashboard
  - Whether today's daily quiz has been generated yet, and the latest SEO generation
    timestamp
  - Recent client-side errors, auto-reported from anywhere in the app (throttled to 5
    per browser session so a crash loop can't spam Firestore)
- A "Developer Panel" nav card only appears on the Dashboard for users with this role;
  everyone else never sees it exists.
